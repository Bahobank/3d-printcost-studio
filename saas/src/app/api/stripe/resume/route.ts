import { NextResponse } from "next/server";
import { getSessionAndProfile } from "@/lib/subscription";
import { getStripe } from "@/lib/stripe";

// Undo a scheduled cancellation: turn auto-renewal back on.
export async function POST() {
  const { profile } = await getSessionAndProfile();

  if (!profile.stripe_subscription_id) {
    return NextResponse.json({ error: "no_subscription" }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    await stripe.subscriptions.update(profile.stripe_subscription_id, {
      cancel_at_period_end: false,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[stripe-resume] Unable to resume subscription", error);
    return NextResponse.json({ error: "resume_failed" }, { status: 500 });
  }
}
