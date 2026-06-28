import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import { decodeLocalDevSession, LOCAL_DEV_AUTH_COOKIE, localDevAuthEnabled } from "@/lib/auth-config";
import { createClient } from "@/lib/supabase/server";

export type SubscriptionStatus = "trialing" | "active" | "expired" | "canceled" | "past_due";
export type BillingCycle = "monthly" | "yearly";
export type SubscriptionPlan = "maker" | "studio";

export type UserProfile = {
  user_id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  auth_provider: string | null;
  phone: string | null;
  business_name: string | null;
  job_title: string | null;
  country_region: string | null;
  trial_start_at: string | null;
  trial_end_at: string | null;
  subscription_status: SubscriptionStatus | string | null;
  subscription_plan: SubscriptionPlan | string | null;
  billing_cycle: BillingCycle | string | null;
  subscription_started_at: string | null;
  subscription_ends_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
};

const ACTIVE_STATUSES = new Set(["active", "past_due"]);

function sevenDaysAfter(value: string) {
  return new Date(new Date(value).getTime() + 7 * 86_400_000).toISOString();
}

function stringMeta(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function fallbackProfileFromUser(user: User): UserProfile {
  const now = new Date().toISOString();
  const createdAt = user.created_at ?? now;
  const displayName =
    stringMeta(user.user_metadata?.full_name) ??
    stringMeta(user.user_metadata?.name) ??
    user.email?.split("@")[0] ??
    null;

  return normalizeTrialStatus({
    user_id: user.id,
    email: user.email ?? null,
    display_name: displayName,
    avatar_url: stringMeta(user.user_metadata?.avatar_url),
    auth_provider: stringMeta(user.app_metadata?.provider) ?? "email",
    phone: null,
    business_name: null,
    job_title: null,
    country_region: null,
    trial_start_at: createdAt,
    trial_end_at: sevenDaysAfter(createdAt),
    subscription_status: "trialing",
    subscription_plan: null,
    billing_cycle: null,
    subscription_started_at: null,
    subscription_ends_at: null,
    stripe_customer_id: null,
    stripe_subscription_id: null,
    created_at: createdAt,
    updated_at: now,
  });
}

export function isTrialStillValid(profile: UserProfile) {
  if (profile.subscription_status !== "trialing" || !profile.trial_end_at) return false;
  return new Date(profile.trial_end_at).getTime() > Date.now();
}

export function trialDaysLeft(profile: UserProfile) {
  if (profile.subscription_status !== "trialing" || !profile.trial_end_at) return 0;
  const diff = new Date(profile.trial_end_at).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

export function normalizeTrialStatus(profile: UserProfile): UserProfile {
  if (profile.subscription_status !== "trialing") return profile;
  if (isTrialStillValid(profile)) return profile;
  return { ...profile, subscription_status: "expired" };
}

export function canUseMainApp(profile: UserProfile) {
  const normalized = normalizeTrialStatus(profile);
  const status = normalized.subscription_status ?? "expired";
  return ACTIVE_STATUSES.has(status) || isTrialStillValid(normalized);
}

export async function getSessionAndProfile() {
  if (localDevAuthEnabled()) {
    const cookieStore = await cookies();
    const session = decodeLocalDevSession(cookieStore.get(LOCAL_DEV_AUTH_COOKIE)?.value);

    if (!session) {
      redirect("/login");
    }

    const now = new Date();
    const trialStart = session.createdAt;
    const trialEnd = sevenDaysAfter(trialStart);
    const profile = normalizeTrialStatus({
      user_id: `local-dev-${session.email}`,
      email: session.email,
      display_name: session.email.split("@")[0],
      avatar_url: null,
      auth_provider: "local-dev",
      phone: null,
      business_name: null,
      job_title: null,
      country_region: null,
      trial_start_at: trialStart,
      trial_end_at: trialEnd,
      subscription_status: "trialing",
      subscription_plan: null,
      billing_cycle: null,
      subscription_started_at: null,
      subscription_ends_at: null,
      stripe_customer_id: null,
      stripe_subscription_id: null,
      created_at: trialStart,
      updated_at: now.toISOString(),
    });

    return {
      user: { id: profile.user_id, email: session.email },
      profile,
    };
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (error) {
    console.error("[profile] Unable to load user profile, using authenticated fallback profile", error);
  }

  if (!profile) {
    return { user: userData.user, profile: fallbackProfileFromUser(userData.user) };
  }

  // Rows created by the Stripe webhook only carry subscription fields, so email /
  // display_name can be null. The authenticated session is the source of truth for
  // identity — backfill it so the app never falls back to the "dev@" placeholder.
  const user = userData.user;
  const merged = {
    ...(profile as UserProfile),
    email: stringMeta((profile as UserProfile).email) ?? user.email ?? null,
    display_name:
      stringMeta((profile as UserProfile).display_name) ??
      stringMeta(user.user_metadata?.full_name) ??
      stringMeta(user.user_metadata?.name) ??
      user.email?.split("@")[0] ??
      null,
    avatar_url: stringMeta((profile as UserProfile).avatar_url) ?? stringMeta(user.user_metadata?.avatar_url),
    auth_provider:
      stringMeta((profile as UserProfile).auth_provider) ?? stringMeta(user.app_metadata?.provider) ?? "email",
  };

  return { user, profile: normalizeTrialStatus(merged as UserProfile) };
}

export async function requireAppAccess() {
  const session = await getSessionAndProfile();

  if (!canUseMainApp(session.profile)) {
    redirect("/dashboard?pricing=expired");
  }

  return session;
}