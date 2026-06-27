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
  await updateProfileWhere(supabase, "user_id", userId, update);
}

export async function updateUserProfileByCustomerId(supabase: SupabaseClient, customerId: string, update: ProfileUpdate) {
  await updateProfileWhere(supabase, "stripe_customer_id", customerId, update);
}
