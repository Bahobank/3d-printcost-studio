"use server";

import { redirect } from "next/navigation";
import { missingSupabaseConfigMessage, supabaseAuthConfigured } from "@/lib/auth-config";
import { authErrorMessage, logAuthError } from "@/lib/auth-errors";
import { getAuthLanguage, resetPasswordCopy, type AuthLanguage } from "@/lib/auth-i18n";
import { createClient } from "@/lib/supabase/server";

function resetUrl(lang: AuthLanguage, error: string) {
  return `/reset-password?lang=${lang}&error=${encodeURIComponent(error)}`;
}

function resetSuccessUrl(lang: AuthLanguage) {
  return `/reset-password/success?lang=${lang}`;
}

function resetErrorMessage(error: unknown, lang: AuthLanguage) {
  const copy = resetPasswordCopy[lang];
  const raw = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  const message = raw.toLowerCase();

  if (!raw) return copy.fallback;
  if (raw.includes(missingSupabaseConfigMessage)) return missingSupabaseConfigMessage;
  if (message.includes("expired")) return copy.expired;
  if (message.includes("invalid") || message.includes("token") || message.includes("session") || message.includes("jwt")) return copy.invalidToken;
  if (message.includes("network") || message.includes("fetch") || message.includes("failed to fetch")) return copy.network;

  return authErrorMessage(error, copy.fallback, lang);
}

export async function updatePassword(formData: FormData) {
  const lang = getAuthLanguage(formData.get("lang"));
  const newPassword = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const text = resetPasswordCopy[lang];

  if (!newPassword || !confirmPassword) {
    redirect(resetUrl(lang, text.missing));
  }

  if (newPassword.length < 8) {
    redirect(resetUrl(lang, text.short));
  }

  if (newPassword !== confirmPassword) {
    redirect(resetUrl(lang, text.mismatch));
  }

  if (!supabaseAuthConfigured()) {
    redirect(resetUrl(lang, missingSupabaseConfigMessage));
  }

  let errorMessage: string | null = null;

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      logAuthError("updatePassword", error);
      errorMessage = resetErrorMessage(error, lang);
    }
  } catch (error) {
    logAuthError("updatePassword unexpected", error);
    errorMessage = resetErrorMessage(error, lang);
  }

  if (errorMessage) {
    redirect(resetUrl(lang, errorMessage));
  }

  redirect(resetSuccessUrl(lang));
}