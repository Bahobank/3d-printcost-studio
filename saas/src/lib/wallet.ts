import type { SupabaseClient } from "@supabase/supabase-js";

export type WalletRecord = {
  balance: number;
  currency: "thb";
  id: string;
  user_id: string;
};

export type WalletTransactionType = "topup" | "subscription_payment" | "subscription_renewal" | "refund" | "adjustment";

async function findWallet(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as WalletRecord | null;
}

export async function getOrCreateWallet(supabase: SupabaseClient, userId: string) {
  const existing = await findWallet(supabase, userId);
  if (existing) return existing;

  const { data, error } = await supabase
    .from("wallets")
    .insert({ user_id: userId })
    .select("*")
    .single();

  if (error) {
    const retry = await findWallet(supabase, userId);
    if (retry) return retry;
    throw error;
  }

  return data as WalletRecord;
}

export async function getWalletBalance(supabase: SupabaseClient, userId: string) {
  const wallet = await findWallet(supabase, userId);
  return wallet?.balance ?? 0;
}

export async function adjustWalletBalance({
  amount,
  description,
  stripeChargeId,
  stripePaymentIntent,
  supabase,
  type,
  userId,
}: {
  amount: number;
  description: string;
  stripeChargeId?: string | null;
  stripePaymentIntent?: string | null;
  supabase: SupabaseClient;
  type: WalletTransactionType;
  userId: string;
}) {
  const isDebit = type === "subscription_payment" || type === "subscription_renewal";
  const safeAmount = Math.round(Math.abs(amount));
  if (safeAmount <= 0) throw new Error("Wallet amount must be greater than zero");

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const wallet = await getOrCreateWallet(supabase, userId);
    const balanceBefore = Number(wallet.balance ?? 0);
    if (isDebit && balanceBefore < safeAmount) {
      return {
        ok: false as const,
        reason: "insufficient_balance" as const,
        balance: balanceBefore,
      };
    }

    const balanceAfter = isDebit ? balanceBefore - safeAmount : balanceBefore + safeAmount;
    const { data, error } = await supabase
      .from("wallets")
      .update({ balance: balanceAfter })
      .eq("id", wallet.id)
      .eq("balance", balanceBefore)
      .select("*")
      .maybeSingle();

    if (error) throw error;
    if (!data) continue;

    await supabase.from("wallet_transactions").insert({
      amount: safeAmount,
      balance_after: balanceAfter,
      balance_before: balanceBefore,
      description,
      stripe_charge_id: stripeChargeId ?? null,
      stripe_payment_intent: stripePaymentIntent ?? null,
      type,
      user_id: userId,
      wallet_id: wallet.id,
    });

    return {
      ok: true as const,
      balance: balanceAfter,
    };
  }

  throw new Error("Unable to update wallet balance after retries");
}
