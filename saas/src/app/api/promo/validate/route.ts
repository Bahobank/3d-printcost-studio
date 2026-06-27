import { NextResponse } from "next/server";
import { getPlanAmount, isBillingCycle, isPlan } from "@/lib/billing-plans";
import { normalizePromoCode, validatePromoCode } from "@/lib/promo";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as {
    billingCycle?: string;
    code?: string;
    plan?: string;
  } | null;

  const plan = String(body?.plan ?? "");
  const billingCycle = String(body?.billingCycle ?? "");
  const code = normalizePromoCode(String(body?.code ?? ""));

  if (!isPlan(plan) || !isBillingCycle(billingCycle) || !code) {
    return NextResponse.json({ valid: false, reason: "invalid_request" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ valid: false, reason: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const amount = getPlanAmount(plan, billingCycle);
  const promo = await validatePromoCode({
    amount,
    billingCycle,
    code,
    plan,
    supabase: admin,
  });

  if (!promo.valid) {
    return NextResponse.json(promo);
  }

  return NextResponse.json({
    valid: true,
    type: promo.type,
    discountAmount: promo.discountAmount,
    finalAmount: promo.finalAmount,
    accessMonths: promo.code.access_months,
    accessLifetime: promo.code.access_lifetime,
  });
}
