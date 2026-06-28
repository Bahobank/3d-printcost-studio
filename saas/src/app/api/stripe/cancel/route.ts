import { NextResponse } from "next/server";
import { getSessionAndProfile } from "@/lib/subscription";
import { getStripe } from "@/lib/stripe";

// Cancel the user's subscription at the end of the current billing period.
// Access stays active until then; the customer.subscription.updated webhook keeps
// the profile in sync. PromptPay one-time payments have no subscription to cancel.
export async function POST() {
  const { profile } = await getSessionAndProfile();

  if (!profile.stripe_subscription_id) {
    return NextResponse.json({ error: "no_subscription" }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    await stripe.subscriptions.update(profile.stripe_subscription_id, {
      cancel_at_period_end: true,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[stripe-cancel] Unable to cancel subscription", error);
    return NextResponse.json({ error: "cancel_failed" }, { status: 500 });
  }
}
