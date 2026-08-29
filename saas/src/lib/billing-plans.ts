export type BillingCycle = "monthly" | "yearly";
export type SubscriptionPlan = "maker" | "studio";

export type PlanPrice = {
  amount: number;
  monthlyEquivalent: number;
};

export type PlanConfig = {
  badge: string;
  description: string;
  features: string[];
  prices: Record<BillingCycle, PlanPrice>;
  title: string;
};

export const PLAN_CONFIGS: Record<SubscriptionPlan, PlanConfig> = {
  maker: {
    title: "Maker",
    badge: "FDM Only",
    description: "For users who work with FDM printers.",
    prices: {
      monthly: { amount: 30, monthlyEquivalent: 30 },
      yearly: { amount: 300, monthlyEquivalent: 25 },
    },
    features: [
      "Calculate FDM print costs",
      "Manage Filament stock",
      "Track profit for each job",
      "Summary dashboard",
      "Print job history",
    ],
  },
  studio: {
    title: "Studio",
    badge: "FDM + Resin",
    description: "For businesses that work with both FDM and Resin.",
    prices: {
      monthly: { amount: 45, monthlyEquivalent: 45 },
      yearly: { amount: 450, monthlyEquivalent: 37.5 },
    },
    features: [
      "Everything in Maker",
      "Calculate Resin print costs",
      "Manage Resin stock",
      "Resin dashboard",
      "Resin print job history",
    ],
  },
};

/**
 * Thai customers are shown and charged in THB (PLAN_CONFIGS above); every other
 * language is shown and charged in USD. Both live here so the price on screen and
 * the price Stripe charges can never drift apart.
 */
export const USD_PLAN_PRICES: Record<SubscriptionPlan, Record<BillingCycle, PlanPrice>> = {
  maker: {
    monthly: { amount: 0.99, monthlyEquivalent: 0.99 },
    yearly: { amount: 9.9, monthlyEquivalent: 0.83 },
  },
  studio: {
    monthly: { amount: 1.49, monthlyEquivalent: 1.49 },
    yearly: { amount: 14.9, monthlyEquivalent: 1.24 },
  },
};

export type PlanCurrency = "thb" | "usd";

export function getPlanPrice(
  plan: SubscriptionPlan,
  billingCycle: BillingCycle,
  currency: PlanCurrency,
): PlanPrice {
  return currency === "usd"
    ? USD_PLAN_PRICES[plan][billingCycle]
    : PLAN_CONFIGS[plan].prices[billingCycle];
}

/** Stripe takes amounts in the currency's smallest unit; THB and USD both use 2 decimals. */
export function toStripeMinorUnits(amount: number) {
  return Math.round(amount * 100);
}

export function isPlan(value: string): value is SubscriptionPlan {
  return value === "maker" || value === "studio";
}

export function isBillingCycle(value: string): value is BillingCycle {
  return value === "monthly" || value === "yearly";
}

export function getPlanAmount(plan: SubscriptionPlan, billingCycle: BillingCycle) {
  return PLAN_CONFIGS[plan].prices[billingCycle].amount;
}

export function getPlanPeriodEnd(billingCycle: BillingCycle, start = new Date()) {
  const end = new Date(start);
  if (billingCycle === "yearly") {
    end.setFullYear(end.getFullYear() + 1);
  } else {
    end.setMonth(end.getMonth() + 1);
  }
  return end;
}

export function formatThb(amount: number) {
  return new Intl.NumberFormat("th-TH", {
    currency: "THB",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amount);
}

export function formatUsd(amount: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency",
  }).format(amount);
}

export function formatPlanPrice(amount: number, currency: PlanCurrency) {
  return currency === "usd" ? formatUsd(amount) : formatThb(amount);
}
