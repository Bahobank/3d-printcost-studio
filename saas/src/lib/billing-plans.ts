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
      monthly: { amount: 199, monthlyEquivalent: 199 },
      yearly: { amount: 1790, monthlyEquivalent: 149 },
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
      monthly: { amount: 299, monthlyEquivalent: 299 },
      yearly: { amount: 2790, monthlyEquivalent: 233 },
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
