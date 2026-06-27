import type { SupabaseClient } from "@supabase/supabase-js";
import type { BillingCycle, SubscriptionPlan } from "@/lib/billing-plans";

export type PromoCodeRecord = {
  access_lifetime: boolean | null;
  access_months: number | null;
  allowed_cycles: string[] | null;
  allowed_plans: string[] | null;
  code: string;
  discount_type: "percent" | "fixed" | null;
  discount_value: number | null;
  expires_at: string | null;
  id: string;
  is_active: boolean | null;
  max_redemptions: number | null;
  redemption_count: number | null;
  stripe_coupon_id: string | null;
  type: "discount" | "access";
};

export type PromoValidation =
  | {
      valid: false;
      reason: "not_found" | "inactive" | "expired" | "usage_limit" | "plan_not_allowed" | "cycle_not_allowed" | "unavailable";
    }
  | {
      code: PromoCodeRecord;
      discountAmount: number;
      finalAmount: number;
      type: "discount" | "access";
      valid: true;
    };

export function normalizePromoCode(code: string) {
  return code.trim().toUpperCase();
}

function containsOrEmpty(values: string[] | null | undefined, value: string) {
  return !values?.length || values.includes(value);
}

function discountAmount(code: PromoCodeRecord, amount: number) {
  if (code.type === "access") return amount;

  const value = Number(code.discount_value ?? 0);
  if (value <= 0) return 0;

  if (code.discount_type === "percent") {
    return Math.min(amount, Math.round(amount * Math.min(value, 100) / 100));
  }

  if (code.discount_type === "fixed") {
    return Math.min(amount, Math.round(value));
  }

  return 0;
}

export async function validatePromoCode({
  amount,
  billingCycle,
  code,
  plan,
  supabase,
}: {
  amount: number;
  billingCycle: BillingCycle;
  code: string;
  plan: SubscriptionPlan;
  supabase: SupabaseClient;
}): Promise<PromoValidation> {
  const normalized = normalizePromoCode(code);
  if (!normalized) return { valid: false, reason: "not_found" };

  const { data, error } = await supabase
    .from("promo_codes")
    .select("*")
    .ilike("code", normalized)
    .maybeSingle();

  if (error) {
    console.error("[promo] Unable to validate promo code", error);
    return { valid: false, reason: "unavailable" };
  }

  if (!data) return { valid: false, reason: "not_found" };

  const record = data as PromoCodeRecord;
  if (!record.is_active) return { valid: false, reason: "inactive" };
  if (record.expires_at && new Date(record.expires_at).getTime() <= Date.now()) {
    return { valid: false, reason: "expired" };
  }
  if (record.max_redemptions !== null && Number(record.redemption_count ?? 0) >= record.max_redemptions) {
    return { valid: false, reason: "usage_limit" };
  }
  if (!containsOrEmpty(record.allowed_plans, plan)) {
    return { valid: false, reason: "plan_not_allowed" };
  }
  if (!containsOrEmpty(record.allowed_cycles, billingCycle)) {
    return { valid: false, reason: "cycle_not_allowed" };
  }

  const discount = discountAmount(record, amount);

  return {
    valid: true,
    type: record.type,
    code: record,
    discountAmount: discount,
    finalAmount: Math.max(0, amount - discount),
  };
}

export async function recordPromoRedemption({
  accessEndsAt,
  accessStartsAt,
  code,
  subscriptionId,
  supabase,
  userId,
}: {
  accessEndsAt?: string | null;
  accessStartsAt?: string | null;
  code: PromoCodeRecord;
  subscriptionId?: string | null;
  supabase: SupabaseClient;
  userId: string;
}) {
  await supabase.from("promo_redemptions").insert({
    access_ends_at: accessEndsAt ?? null,
    access_starts_at: accessStartsAt ?? null,
    code_id: code.id,
    subscription_id: subscriptionId ?? null,
    user_id: userId,
  });

  await supabase
    .from("promo_codes")
    .update({ redemption_count: Number(code.redemption_count ?? 0) + 1 })
    .eq("id", code.id);
}
