import { NextResponse } from "next/server";
import { getPlanAmount, getPlanPeriodEnd, isBillingCycle, isPlan } from "@/lib/billing-plans";
import { normalizePromoCode, validatePromoCode } from "@/lib/promo";
import { updateUserProfileByUserId } from "@/lib/profile-update";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { adjustWalletBalance } from "@/lib/wallet";

function billingUrl(request: Request, params: Record<string, string>) {
  const url = new URL("/billing", request.url);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return url;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const plan = String(formData.get("plan") ?? "");
  const billingCycle = String(formData.get("billingCycle") ?? "");
  const promoCode = normalizePromoCode(String(formData.get("promoCode") ?? ""));

  if (!isPlan(plan) || !isBillingCycle(billingCycle)) {
    return new Response("Invalid plan", { status: 400 });
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  const admin = createAdminClient();
  const amount = getPlanAmount(plan, billingCycle);
  const promo = promoCode
    ? await validatePromoCode({
        amount,
        billingCycle,
        code: promoCode,
        plan,
        supabase: admin,
      })
    : null;

  if (promo && !promo.valid) {
    return NextResponse.redirect(billingUrl(request, {
      checkout: "setup-required",
      reason: `promo-${promo.reason}`,
      plan,
      billingCycle,
    }), 303);
  }

  const finalAmount = promo?.valid ? promo.finalAmount : amount;
  const now = new Date();
  const endsAt = promo?.valid && promo.type === "access"
    ? (promo.code.access_lifetime ? null : new Date(new Date(now).setMonth(now.getMonth() + Number(promo.code.access_months ?? 1))).toISOString())
    : getPlanPeriodEnd(billingCycle, now).toISOString();

  if (finalAmount > 0) {
    const walletPayment = await adjustWalletBalance({
      amount: finalAmount,
      description: `3D PrintCost Studio ${plan} ${billingCycle}`,
      supabase: admin,
      type: "subscription_payment",
      userId: userData.user.id,
    });

    if (!walletPayment.ok) {
      return NextResponse.redirect(billingUrl(request, {
        checkout: "wallet-insufficient",
        plan,
        billingCycle,
        needed: String(finalAmount - walletPayment.balance),
      }), 303);
    }
  }

  await updateUserProfileByUserId(admin, userData.user.id, {
    billing_cycle: billingCycle,
    subscription_ends_at: endsAt,
    subscription_plan: plan,
    subscription_started_at: now.toISOString(),
    subscription_status: "active",
    subscription_payment_source: promo?.valid && promo.type === "access" ? "access_code" : "wallet",
    updated_at: new Date().toISOString(),
  });

  if (promo?.valid) {
    await admin.from("promo_redemptions").insert({
      access_ends_at: promo.type === "access" ? endsAt : null,
      access_starts_at: promo.type === "access" ? now.toISOString() : null,
      code_id: promo.code.id,
      user_id: userData.user.id,
    });

    await admin
      .from("promo_codes")
      .update({ redemption_count: Number(promo.code.redemption_count ?? 0) + 1 })
      .eq("id", promo.code.id);
  }

  return NextResponse.redirect(new URL("/dashboard?checkout=success&paymentMode=wallet", request.url), 303);
}
