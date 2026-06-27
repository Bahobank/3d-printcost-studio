"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { appUrl, missingSupabaseConfigMessage, supabaseAuthConfigured } from "@/lib/auth-config";
import { forgotPasswordCopy, getAuthLanguage, type AuthLanguage } from "@/lib/auth-i18n";
import { logAuthError } from "@/lib/auth-errors";
import { createClient } from "@/lib/supabase/server";

function forgotUrl(lang: AuthLanguage, error: string, email?: string) {
  const params = new URLSearchParams({ lang, error });
  if (email) params.set("email", email);
  return `/forgot-password?${params.toString()}`;
}

function sentUrl(lang: AuthLanguage, email: string, message?: string) {
  const params = new URLSearchParams({ lang, email });
  if (message) params.set("message", message);
  return `/forgot-password/sent?${params.toString()}`;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function requestOrigin() {
  const headerStore = await headers();
  const origin = headerStore.get("origin");
  if (origin) return origin;

  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  if (!host) return appUrl();

  const protocol = headerStore.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

function resetErrorMessage(error: unknown, lang: AuthLanguage) {
  const copy = forgotPasswordCopy[lang];
  const raw = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  const message = raw.toLowerCase();

  if (!raw) return copy.fallback;
  if (raw.includes(missingSupabaseConfigMessage)) return missingSupabaseConfigMessage;
  if (message.includes("rate") || message.includes("too many") || message.includes("over_email_send_rate_limit")) return copy.rateLimit;
  if (message.includes("network") || message.includes("fetch") || message.includes("failed to fetch")) return copy.network;

  return copy.fallback;
}

export async function sendPasswordResetEmail(formData: FormData) {
  const lang = getAuthLanguage(formData.get("lang"));
  const copy = forgotPasswordCopy[lang];
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email) {
    redirect(forgotUrl(lang, copy.validationRequired));
  }

  if (!isValidEmail(email)) {
    redirect(forgotUrl(lang, copy.validationInvalid, email));
  }

  if (!supabaseAuthConfigured()) {
    redirect(forgotUrl(lang, missingSupabaseConfigMessage, email));
  }

  let errorMessage: string | null = null;

  try {
    const supabase = await createClient();
    const origin = await requestOrigin();
    const callbackUrl = new URL("/auth/callback", origin);
    callbackUrl.searchParams.set("lang", lang);
    callbackUrl.searchParams.set("next", `/reset-password?lang=${lang}`);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: callbackUrl.toString(),
    });

    if (error) {
      logAuthError("sendPasswordResetEmail", error);
      errorMessage = resetErrorMessage(error, lang);
    }
  } catch (error) {
    logAuthError("sendPasswordResetEmail unexpected", error);
    errorMessage = resetErrorMessage(error, lang);
  }

  if (errorMessage) {
    redirect(forgotUrl(lang, errorMessage, email));
  }

  const isResend = formData.get("resend") === "1";
  redirect(sentUrl(lang, email, isResend ? copy.resendSuccess : undefined));
}