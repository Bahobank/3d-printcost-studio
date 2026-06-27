import { NextResponse } from "next/server";
import { getPlanAmount, getPlanPeriodEnd, isBillingCycle, isPlan } from "@/lib/billing-plans";
import { createAdminClient } from "@/lib/supabase/admin";
import { adjustWalletBalance } from "@/lib/wallet";

type RenewalProfile = {
  billing_cycle: string | null;
  subscription_ends_at: string | null;
  subscription_plan: string | null;
  user_id: string;
};

function authorized(request: Request) {
  const secret = process.env.WALLET_RENEWAL_CRON_SECRET?.trim();
  if (!secret) return false;
  return request.headers.get("authorization") === "Bearer " + secret;
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("user_id,subscription_plan,billing_cycle,subscription_ends_at")
    .eq("subscription_payment_source", "wallet")
    .eq("subscription_status", "active")
    .lte("subscription_ends_at", now.toISOString());

  if (error) {
    console.error("[wallet-renewals] Unable to load renewals", error);
    return NextResponse.json({ error: "Unable to load renewals" }, { status: 500 });
  }

  let renewed = 0;
  let failed = 0;
  const profiles = (data ?? []) as RenewalProfile[];

  for (const profile of profiles) {
    const plan = profile.subscription_plan ?? "";
    const billingCycle = profile.billing_cycle ?? "";
    if (!isPlan(plan) || !isBillingCycle(billingCycle)) continue;

    const amount = getPlanAmount(plan, billingCycle);
    const walletPayment = await adjustWalletBalance({
      amount,
      description: "Automatic wallet subscription renewal",
      supabase,
      type: "subscription_renewal",
      userId: profile.user_id,
    });

    if (!walletPayment.ok) {
      failed += 1;
      await supabase
        .from("user_profiles")
        .update({ subscription_status: "past_due", updated_at: new Date().toISOString() })
        .eq("user_id", profile.user_id);
      continue;
    }

    renewed += 1;
    await supabase
      .from("user_profiles")
      .update({
        subscription_ends_at: getPlanPeriodEnd(billingCycle, now).toISOString(),
        subscription_status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", profile.user_id);
  }

  return NextResponse.json({ checked: profiles.length, failed, renewed });
}
