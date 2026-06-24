"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

function authConfigMissing() {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

function redirectMissingAuthConfig() {
  redirect(`/login?error=${encodeURIComponent("ยังไม่ได้ตั้งค่า Supabase Auth ในไฟล์ .env.local")}`);
}

export async function signInWithPassword(formData: FormData) {
  if (authConfigMissing()) redirectMissingAuthConfig();

  const supabase = await createClient();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  redirect("/pricing");
}

export async function signUpWithPassword(formData: FormData) {
  if (authConfigMissing()) redirectMissingAuthConfig();

  const supabase = await createClient();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${appUrl()}/auth/callback?next=/pricing`,
    },
  });

  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);
  redirect("/pricing");
}

export async function signInWithOAuth(formData: FormData) {
  if (authConfigMissing()) redirectMissingAuthConfig();

  const supabase = await createClient();
  const provider = String(formData.get("provider") ?? "");

  if (provider !== "google" && provider !== "apple") {
    redirect(`/login?error=${encodeURIComponent("OAuth provider ไม่ถูกต้อง")}`);
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${appUrl()}/auth/callback?next=/pricing`,
    },
  });

  if (error || !data.url) {
    redirect(`/login?error=${encodeURIComponent(error?.message ?? "OAuth failed")}`);
  }

  redirect(data.url);
}
