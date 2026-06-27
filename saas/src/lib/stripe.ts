import Stripe from "stripe";
import type { BillingCycle, SubscriptionPlan, SubscriptionStatus } from "@/lib/subscription";

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

export function getPriceId(plan: SubscriptionPlan, billingCycle: BillingCycle) {
  const key = `STRIPE_PRICE_${plan.toUpperCase()}_${billingCycle.toUpperCase()}`;
  const priceId = process.env[key];

  if (priceId) return priceId;

  if (plan === "studio" && billingCycle === "monthly" && process.env.STRIPE_PRICE_MONTHLY) {
    return process.env.STRIPE_PRICE_MONTHLY;
  }

  if (plan === "studio" && billingCycle === "yearly" && process.env.STRIPE_PRICE_YEARLY) {
    return process.env.STRIPE_PRICE_YEARLY;
  }

  throw new Error("Missing Stripe price id");
}

export function normalizeStripeStatus(status?: string | null): SubscriptionStatus {
  if (status === "active") return "active";
  if (status === "past_due") return "past_due";
  if (status === "canceled") return "canceled";
  return "expired";
}

export function planFromPriceId(priceId?: string | null): { billingCycle: BillingCycle; plan: SubscriptionPlan } | null {
  if (!priceId) return null;

  const pairs: Array<[SubscriptionPlan, BillingCycle, string | undefined]> = [
    ["maker", "monthly", process.env.STRIPE_PRICE_MAKER_MONTHLY],
    ["maker", "yearly", process.env.STRIPE_PRICE_MAKER_YEARLY],
    ["studio", "monthly", process.env.STRIPE_PRICE_STUDIO_MONTHLY ?? process.env.STRIPE_PRICE_MONTHLY],
    ["studio", "yearly", process.env.STRIPE_PRICE_STUDIO_YEARLY ?? process.env.STRIPE_PRICE_YEARLY],
  ];

  const match = pairs.find(([, , envPriceId]) => envPriceId === priceId);
  if (!match) return null;

  return { plan: match[0], billingCycle: match[1] };
}
