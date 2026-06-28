import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { generateReferralCode, referralLinkFromCode } from "@/lib/referral";
import { getSessionAndProfile } from "@/lib/subscription";

type InvoiceRow = {
  id: string;
  date: number;
  amount: number;
  currency: string;
  status: string | null;
  planLabel: string;
  receiptUrl: string | null;
};

type WalletTxnRow = {
  type: string;
  amount: number;
  date: number;
  description: string | null;
};

export async function GET() {
  const { user, profile } = await getSessionAndProfile();

  const code = generateReferralCode(user.id, profile.display_name ?? profile.email);

  const result = {
    plan: {
      plan: profile.subscription_plan ?? null,
      status: profile.subscription_status ?? "trialing",
      billingCycle: profile.billing_cycle ?? null,
      trialEndAt: profile.trial_end_at ?? null,
      currentPeriodEnd: profile.subscription_ends_at ?? null,
      cancelAtPeriodEnd: false,
      autoRenew: false,
      canCancel: false,
    },
    paymentMethod: null as null | { brand: string; last4: string },
    invoices: [] as InvoiceRow[],
    wallet: { balance: 0, earned: 0, spent: 0, history: [] as WalletTxnRow[] },
    referral: { code, link: referralLinkFromCode(code) },
  };

  // Wallet (admin client; RLS-free) — balance + transaction summary + recent history.
  try {
    const admin = createAdminClient();
    const { data: wallet } = await admin.from("wallets").select("balance").eq("user_id", user.id).maybeSingle();
    result.wallet.balance = Number(wallet?.balance ?? 0);

    const { data: txns } = await admin
      .from("wallet_transactions")
      .select("type, amount, description, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    for (const txn of txns ?? []) {
      const amount = Number(txn.amount ?? 0);
      const isSpend = txn.type === "subscription_payment" || txn.type === "subscription_renewal";
      if (isSpend) result.wallet.spent += amount;
      else result.wallet.earned += amount;
    }

    result.wallet.history = (txns ?? []).slice(0, 12).map((txn) => ({
      type: String(txn.type ?? ""),
      amount: Number(txn.amount ?? 0),
      date: txn.created_at ? Math.floor(new Date(txn.created_at as string).getTime() / 1000) : 0,
      description: (txn.description as string | null) ?? null,
    }));
  } catch (error) {
    console.error("[account-overview] wallet", error);
  }

  // Stripe — payment method, invoice history, auto-renew / next billing date.
  if (profile.stripe_customer_id) {
    try {
      const stripe = getStripe();

      const paymentMethods = await stripe.paymentMethods.list({ customer: profile.stripe_customer_id, type: "card", limit: 1 });
      const card = paymentMethods.data[0]?.card;
      if (card) result.paymentMethod = { brand: card.brand, last4: card.last4 };

      const invoices = await stripe.invoices.list({ customer: profile.stripe_customer_id, limit: 12 });
      result.invoices = invoices.data.map((invoice) => ({
        id: invoice.id ?? "",
        date: invoice.created ?? 0,
        amount: (invoice.amount_paid || invoice.amount_due || 0) / 100,
        currency: (invoice.currency ?? "thb").toUpperCase(),
        status: invoice.status ?? null,
        planLabel: invoice.lines?.data?.[0]?.description ?? "",
        receiptUrl: invoice.hosted_invoice_url ?? invoice.invoice_pdf ?? null,
      }));

      if (profile.stripe_subscription_id) {
        const subscription = await stripe.subscriptions.retrieve(profile.stripe_subscription_id);
        const subAny = subscription as unknown as {
          current_period_end?: number;
          cancel_at_period_end?: boolean;
          items?: { data?: Array<{ current_period_end?: number }> };
        };
        const cancelAtPeriodEnd = Boolean(subAny.cancel_at_period_end);
        const periodEndUnix = subAny.current_period_end ?? subAny.items?.data?.[0]?.current_period_end;
        result.plan.cancelAtPeriodEnd = cancelAtPeriodEnd;
        result.plan.autoRenew = !cancelAtPeriodEnd;
        result.plan.canCancel = result.plan.status === "active";
        if (periodEndUnix) result.plan.currentPeriodEnd = new Date(periodEndUnix * 1000).toISOString();
      }
    } catch (error) {
      console.error("[account-overview] stripe", error);
    }
  }

  return NextResponse.json(result);
}
