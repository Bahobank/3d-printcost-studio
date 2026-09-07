import type Stripe from "stripe";
import { getPlanPeriodEnd, isBillingCycle, isPlan } from "@/lib/billing-plans";
import { updateUserProfileByUserId } from "@/lib/profile-update";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { adjustWalletBalance } from "@/lib/wallet";

/**
 * Unlocking a plan after payment runs from two independent places: the Stripe
 * webhook, and the customer's own return from Checkout. Either one on its own is
 * enough — which is the point. When fulfilment hung on the webhook alone, a
 * delivery that never arrived left a paying customer locked out, seeing the
 * paywall again with no way forward.
 *
 * Both paths call fulfillCheckoutSession, which claims the session id before
 * doing any work, so wallet credit and referral rewards are applied exactly once
 * no matter which path gets there first.
 */

const REFERRAL_RATE = 0.05;
// Claims share the webhook's dedupe table; the prefix keeps them from ever
// colliding with a real Stripe event id.
const CLAIM_PREFIX = "checkout_session:";

export type FulfillmentOutcome =
  | "activated"
  | "wallet_credited"
  | "already_fulfilled"
  | "not_paid"
  | "not_yours";

function paidAmountFromSession(session: Stripe.Checkout.Session) {
  return Math.round(Number(session.amount_total ?? 0) / 100);
}

/** Returns false when another path already claimed this session. */
async function claimSession(sessionId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("stripe_webhook_events").insert({
    id: `${CLAIM_PREFIX}${sessionId}`,
    type: "checkout.session.fulfillment",
    payload: {},
  });

  return !error;
}

async function releaseSession(sessionId: string) {
  const supabase = createAdminClient();
  await supabase.from("stripe_webhook_events").delete().eq("id", `${CLAIM_PREFIX}${sessionId}`);
}

export async function fulfillCheckoutSession(session: Stripe.Checkout.Session): Promise<FulfillmentOutcome> {
  // PromptPay can complete a session before the money settles, so never unlock
  // on "completed" alone.
  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
    console.warn("[fulfillment] session is not paid yet", {
      id: session.id,
      paymentStatus: session.payment_status,
    });
    return "not_paid";
  }

  if (!(await claimSession(session.id))) return "already_fulfilled";

  try {
    const paymentMode = session.metadata?.payment_mode ?? "subscription";

    if (paymentMode === "wallet_topup") {
      await creditWalletFromCheckoutSession(session);
      return "wallet_credited";
    }

    if (paymentMode === "promptpay_period") {
      await activatePromptPayPeriod(session);
      return "activated";
    }

    await updateProfileFromCheckoutSession(session);
    return "activated";
  } catch (error) {
    // Let the next attempt try again rather than leaving the session claimed but
    // unfulfilled — that combination is what silently swallows a payment.
    await releaseSession(session.id);
    throw error;
  }
}

/**
 * Called while rendering the dashboard the customer lands on after paying. It
 * resolves the signed-in user itself and never throws: a failure here must not
 * take down the page, but it must leave a trace.
 */
export async function confirmCheckoutSessionFromReturn(sessionId: string) {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;

    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    const owner = session.client_reference_id ?? session.metadata?.user_id;

    // Someone could paste another customer's session id into the URL.
    if (owner !== data.user.id) {
      console.warn("[fulfillment] return session belongs to another user", { sessionId });
      return;
    }

    const outcome = await fulfillCheckoutSession(session);
    console.info("[fulfillment] confirmed on return", { sessionId, outcome });
  } catch (error) {
    console.error("[fulfillment] confirm on return failed", sessionId, error);
  }
}

async function updateProfileFromCheckoutSession(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id ?? session.metadata?.user_id;
  if (!userId) {
    throw new Error(`Checkout session ${session.id} has no user to activate`);
  }

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
  await creditReferrer(userId, paidAmountFromSession(session));
}

async function activatePromptPayPeriod(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id ?? session.metadata?.user_id;
  const plan = session.metadata?.plan ?? "";
  const billingCycle = session.metadata?.billing_cycle ?? "";

  if (!userId || !isPlan(plan) || !isBillingCycle(billingCycle)) {
    // This used to return quietly, which answered Stripe with a 200 and dropped a
    // real payment with nothing written anywhere.
    throw new Error(
      `PromptPay session ${session.id} is missing fulfilment metadata ` +
        `(user=${Boolean(userId)}, plan="${plan}", cycle="${billingCycle}")`,
    );
  }

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
  await creditReferrer(userId, paidAmountFromSession(session));
}

async function creditWalletFromCheckoutSession(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id ?? session.metadata?.user_id;
  if (!userId) {
    throw new Error(`Wallet top-up session ${session.id} has no user to credit`);
  }

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

// Single-tier referral: when a referred user makes their first successful payment,
// credit the referrer 5% of the paid amount. Guarded by referral_credited, and any
// failure is swallowed so it can never hold up the payment itself.
async function creditReferrer(userId: string, amountThb: number) {
  try {
    if (!userId || amountThb <= 0) return;
    const supabase = createAdminClient();
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("referred_by, referral_credited")
      .eq("user_id", userId)
      .maybeSingle();

    if (!profile?.referred_by || profile.referral_credited) return;

    const credit = Math.round(amountThb * REFERRAL_RATE);
    if (credit > 0) {
      await adjustWalletBalance({
        amount: credit,
        description: "Referral reward",
        supabase,
        type: "adjustment",
        userId: String(profile.referred_by),
      });
    }
    await supabase.from("user_profiles").update({ referral_credited: true }).eq("user_id", userId);
  } catch (error) {
    console.error("[referral] credit failed", error);
  }
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
