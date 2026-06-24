import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Missing STRIPE_SECRET_KEY");
  }

  stripeClient ??= new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover" as Stripe.LatestApiVersion,
  });

  return stripeClient;
}

export function getPriceId(plan: string) {
  if (plan === "monthly") return process.env.STRIPE_PRICE_MONTHLY!;
  if (plan === "yearly") return process.env.STRIPE_PRICE_YEARLY!;
  throw new Error("Invalid plan");
}

export function planFromPriceId(priceId?: string | null) {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_MONTHLY) return "monthly";
  if (priceId === process.env.STRIPE_PRICE_YEARLY) return "yearly";
  return null;
}
