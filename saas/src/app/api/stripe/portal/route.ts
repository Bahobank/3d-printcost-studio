import { NextResponse } from "next/server";
import { getSessionAndProfile } from "@/lib/subscription";
import { getStripe } from "@/lib/stripe";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const { profile } = await getSessionAndProfile();

  if (!profile.stripe_customer_id) {
    return NextResponse.redirect(new URL("/pricing", request.url));
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${appUrl()}/billing`,
  });

  return NextResponse.redirect(session.url, 303);
}
