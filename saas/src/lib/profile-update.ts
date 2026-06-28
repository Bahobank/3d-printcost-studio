import type { SupabaseClient } from "@supabase/supabase-js";

type ProfileUpdate = Record<string, unknown>;

function missingPaymentSourceColumn(error: unknown) {
  return JSON.stringify(error).toLowerCase().includes("subscription_payment_source");
}

function withoutPaymentSource(update: ProfileUpdate) {
  const { subscription_payment_source: _subscriptionPaymentSource, ...fallback } = update;
  return fallback;
}

async function updateProfileWhere(
  supabase: SupabaseClient,
  column: "stripe_customer_id" | "user_id",
  value: string,
  update: ProfileUpdate,
) {
  const { error } = await supabase
    .from("user_profiles")
    .update(update)
    .eq(column, value);

  if (!error) return;

  if ("subscription_payment_source" in update && missingPaymentSourceColumn(error)) {
    const { error: fallbackError } = await supabase
      .from("user_profiles")
      .update(withoutPaymentSource(update))
      .eq(column, value);

    if (!fallbackError) return;
    throw fallbackError;
  }

  throw error;
}

export async function updateUserProfileByUserId(supabase: SupabaseClient, userId: string, update: ProfileUpdate) {
  // Upsert so the row is created if the user has no profile yet (no signup trigger),
  // otherwise a payment webhook UPDATE would be a no-op and the user stays "trialing".
  const row = { user_id: userId, ...update };
  const { error } = await supabase.from("user_profiles").upsert(row, { onConflict: "user_id" });
  if (!error) return;

  if ("subscription_payment_source" in row && missingPaymentSourceColumn(error)) {
    const { error: fallbackError } = await supabase
      .from("user_profiles")
      .upsert({ user_id: userId, ...withoutPaymentSource(update) }, { onConflict: "user_id" });
    if (!fallbackError) return;
    throw fallbackError;
  }

  throw error;
}

export async function updateUserProfileByCustomerId(supabase: SupabaseClient, customerId: string, update: ProfileUpdate) {
  await updateProfileWhere(supabase, "stripe_customer_id", customerId, update);
}
