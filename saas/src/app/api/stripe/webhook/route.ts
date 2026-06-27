import { headers } from "next/headers";
import Stripe from "stripe";
import { getPlanPeriodEnd, isBillingCycle, isPlan } from "@/lib/billing-plans";
import { updateUserProfileByCustomerId, updateUserProfileByUserId } from "@/lib/profile-update";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeStripeStatus, planFromPriceId } from "@/lib/stripe";
import { adjustWalletBalance } from "@/lib/wallet";

export async function POST(request: Request) {
  const { getStripe } = await import("@/lib/stripe");
  const stripe = getStripe();
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error) {
    return new Response(`Webhook error: ${(error as Error).message}`, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("stripe_webhook_events")
    .select("id")
    .eq("id", event.id)
    .maybeSingle();

  if (existing) {
    return Response.json({ received: true, duplicate: true });
  }

  await supabase.from("stripe_webhook_events").insert({
    id: event.id,
    type: event.type,
    payload: event as unknown as Record<string, unknown>,
  });

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutSession(session);
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentIntentSucceeded(paymentIntent);
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentIntentFailed(paymentIntent);
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object as Stripe.Subscription;
      await updateProfileFromSubscription(subscription, event.type === "customer.subscription.deleted");
    }

    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice;
      await updateProfileByCustomer(String(invoice.customer), { subscription_status: "past_due" });
    }

    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as Stripe.Invoice;
      await updateProfileByCustomer(String(invoice.customer), { subscription_status: "active" });
    }
  } catch (error) {
    console.error("[stripe-webhook] Unable to process event", event.id, event.type, error);
    await supabase.from("stripe_webhook_events").delete().eq("id", event.id);
    return new Response("Webhook processing failed", { status: 500 });
  }

  return Response.json({ received: true });
}

function timestampToIso(value?: number | null) {
  return value ? new Date(value * 1000).toISOString() : null;
}

function paidAmountFromSession(session: Stripe.Checkout.Session) {
  return Math.round(Number(session.amount_total ?? 0) / 100);
}

async function handleCheckoutSession(session: Stripe.Checkout.Session) {
  const paymentMode = session.metadata?.payment_mode ?? "subscription";

  if (paymentMode === "wallet_topup") {
    await creditWalletFromCheckoutSession(session);
    return;
  }

  if (paymentMode === "promptpay_period") {
    await activatePromptPayPeriod(session);
    return;
  }

  if (paymentMode === "subscription" || paymentMode === "promptpay_subscription" || paymentMode === "truemoney_subscription") {
    await updateProfileFromCheckoutSession(session);
    return;
  }

  await updateProfileFromCheckoutSession(session);
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const paymentMode = paymentIntent.metadata?.payment_mode;

  if (paymentMode === "wallet_topup" || paymentMode === "promptpay_period" || paymentMode === "promptpay_subscription" || paymentMode === "truemoney_subscription") {
    console.info("[stripe-webhook] PaymentIntent succeeded; Checkout Session completion handles fulfillment", {
      id: paymentIntent.id,
      paymentMode,
    });
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const paymentMode = paymentIntent.metadata?.payment_mode;
  if (paymentMode === "wallet_topup" || paymentMode === "promptpay_period" || paymentMode === "promptpay_subscription" || paymentMode === "truemoney_subscription") {
    console.warn("[stripe-webhook] Stripe payment failed", {
      id: paymentIntent.id,
      lastPaymentError: paymentIntent.last_payment_error?.message,
      paymentMode,
    });
  }
}

async function updateProfileFromCheckoutSession(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id;
  if (!userId) return;

  const supabase = createAdminClient();
  await updateUserProfileByUserId(supabase, userId, {
    stripe_customer_id: String(session.customer),
    stripe_subscription_id: session.subscription ? String(session.subscription) : null,
    subscription_status: "active",
    subscription_plan: session.metadata?.plan ?? null,
    billing_cycle: session.metadata?.billing_cycle ?? null,
    subscription_started_at: new Date().toISOString(),
    subscription_payment_source: "stripe_subscription",
    updated_at: new Date().toISOString(),
  });

  await recordPromoFromSession(session, userId, String(session.subscription ?? ""), null, null);
}

async function activatePromptPayPeriod(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id ?? session.metadata?.user_id;
  const plan = session.metadata?.plan ?? "";
  const billingCycle = session.metadata?.billing_cycle ?? "";
  if (!userId || !isPlan(plan) || !isBillingCycle(billingCycle)) return;

  const now = new Date();
  const endsAt = getPlanPeriodEnd(billingCycle, now).toISOString();
  const supabase = createAdminClient();

  await updateUserProfileByUserId(supabase, userId, {
    billing_cycle: billingCycle,
    stripe_customer_id: session.customer ? String(session.customer) : null,
    stripe_subscription_id: null,
    subscription_ends_at: endsAt,
    subscription_plan: plan,
    subscription_started_at: now.toISOString(),
    subscription_status: "active",
    subscription_payment_source: "stripe_promptpay",
    updated_at: new Date().toISOString(),
  });

  await recordPromoFromSession(session, userId, null, now.toISOString(), endsAt);
}

async function creditWalletFromCheckoutSession(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id ?? session.metadata?.user_id;
  if (!userId) return;

  const amount = paidAmountFromSession(session);
  if (amount <= 0) return;

  const supabase = createAdminClient();
  await adjustWalletBalance({
    amount,
    description: "Wallet top-up via Stripe Checkout",
    stripePaymentIntent: session.payment_intent ? String(session.payment_intent) : null,
    supabase,
    type: "topup",
    userId,
  });
}

async function recordPromoFromSession(
  session: Stripe.Checkout.Session,
  userId: string,
  subscriptionId: string | null,
  accessStartsAt: string | null,
  accessEndsAt: string | null,
) {
  const codeId = session.metadata?.promo_code_id;
  if (!codeId) return;

  const supabase = createAdminClient();
  const { data: code } = await supabase
    .from("promo_codes")
    .select("id,redemption_count")
    .eq("id", codeId)
    .maybeSingle();

  if (!code) return;

  await supabase.from("promo_redemptions").insert({
    access_ends_at: accessEndsAt,
    access_starts_at: accessStartsAt,
    code_id: codeId,
    subscription_id: subscriptionId,
    user_id: userId,
  });

  await supabase
    .from("promo_codes")
    .update({ redemption_count: Number(code.redemption_count ?? 0) + 1 })
    .eq("id", codeId);
}

async function updateProfileFromSubscription(subscription: Stripe.Subscription, deleted = false) {
  const supabase = createAdminClient();
  const item = subscription.items.data[0];
  const priceMapping = planFromPriceId(item?.price.id);
  const userId = subscription.metadata.user_id;
  const periodEnd = (subscription as unknown as { current_period_end?: number | null }).current_period_end;
  const periodStart = (subscription as unknown as { current_period_start?: number | null }).current_period_start;

  const update = {
    stripe_customer_id: String(subscription.customer),
    stripe_subscription_id: subscription.id,
    subscription_status: deleted ? "canceled" : normalizeStripeStatus(subscription.status),
    subscription_plan: subscription.metadata.plan ?? priceMapping?.plan ?? null,
    billing_cycle: subscription.metadata.billing_cycle ?? priceMapping?.billingCycle ?? null,
    subscription_started_at: timestampToIso(periodStart) ?? new Date().toISOString(),
    subscription_ends_at: timestampToIso(periodEnd),
    subscription_payment_source: "stripe_subscription",
    updated_at: new Date().toISOString(),
  };

  if (userId) {
    await updateUserProfileByUserId(supabase, userId, update);
    return;
  }

  await updateUserProfileByCustomerId(supabase, String(subscription.customer), update);
}

async function updateProfileByCustomer(customerId: string, update: Record<string, unknown>) {
  const supabase = createAdminClient();
  await updateUserProfileByCustomerId(supabase, customerId, { ...update, updated_at: new Date().toISOString() });
}