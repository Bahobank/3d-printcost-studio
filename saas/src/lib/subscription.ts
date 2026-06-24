import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type UserProfile = {
  user_id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  auth_provider: string | null;
  trial_start_at: string | null;
  trial_end_at: string | null;
  subscription_status: string | null;
  subscription_plan: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
};

const ACTIVE_STATUSES = new Set(["active"]);
const GRACE_STATUSES = new Set(["past_due"]);

export function isTrialStillValid(profile: UserProfile) {
  if (!profile.trial_end_at) return false;
  return new Date(profile.trial_end_at).getTime() >= Date.now();
}

export function canUseMainApp(profile: UserProfile) {
  const status = profile.subscription_status ?? "expired";
  return ACTIVE_STATUSES.has(status) || GRACE_STATUSES.has(status) || (status === "trialing" && isTrialStillValid(profile));
}

export function trialDaysLeft(profile: UserProfile) {
  if (!profile.trial_end_at) return 0;
  const diff = new Date(profile.trial_end_at).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

export async function getSessionAndProfile() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userData.user.id)
    .single();

  if (error || !profile) {
    redirect("/login");
  }

  return {
    user: userData.user,
    profile: profile as UserProfile,
  };
}

export async function requireAppAccess() {
  const session = await getSessionAndProfile();

  if (!canUseMainApp(session.profile)) {
    redirect("/pricing");
  }

  return session;
}
