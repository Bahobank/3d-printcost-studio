import { headers } from "next/headers";
import Stripe from "stripe";
import { fulfillCheckoutSession } from "@/lib/checkout-fulfillment";
import { updateUserProfileByCustomerId, updateUserProfileByUserId } from "@/lib/profile-update";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeStripeStatus, planFromPriceId } from "@/lib/stripe";

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
    // PromptPay can complete a session before the money settles and then send
    // async_payment_succeeded; subscribing to only the first event loses those.
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
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

async function handleCheckoutSession(session: Stripe.Checkout.Session) {
  const outcome = await fulfillCheckoutSession(session);
  console.info("[stripe-webhook] checkout session handled", { id: session.id, outcome });
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const paymentMode = paymentIntent.metadata?.payment_mode;

  if (paymentMode === "wallet_topup" || paymentMode === "promptpay_period") {
    console.info("[stripe-webhook] PaymentIntent succeeded; the Checkout Session events fulfil it", {
      id: paymentIntent.id,
      paymentMode,
    });
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const paymentMode = paymentIntent.metadata?.payment_mode;
  if (paymentMode === "wallet_topup" || paymentMode === "promptpay_period") {
    console.warn("[stripe-webhook] Stripe payment failed", {
      id: paymentIntent.id,
      lastPaymentError: paymentIntent.last_payment_error?.message,
      paymentMode,
    });
  }
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