import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { missingSupabaseConfigMessage, requireSupabaseConfig, supabaseAuthConfigured } from "@/lib/auth-config";
import { authErrorMessage, logAuthError } from "@/lib/auth-errors";
import { getAuthLanguage, resetPasswordCopy, type AuthLanguage } from "@/lib/auth-i18n";

type CookieToSet = { name: string; value: string; options: CookieOptions };

const callbackFallbackCopy: Record<AuthLanguage, { login: string; invalidLink: string; verify: string }> = {
  th: {
    login: "ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง",
    invalidLink: "ลิงก์ยืนยันไม่ถูกต้องหรือหมดอายุ กรุณาขออีเมลยืนยันใหม่",
    verify: "ไม่สามารถยืนยันอีเมลหรือเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง",
  },
  en: {
    login: "Unable to sign in. Please try again.",
    invalidLink: "The confirmation link is invalid or expired. Please request a new confirmation email.",
    verify: "Unable to confirm your email or sign in. Please try again.",
  },
  zh: {
    login: "无法登录，请重试。",
    invalidLink: "确认链接无效或已过期。请重新请求确认邮件。",
    verify: "无法确认邮箱或登录，请重试。",
  },
  ja: {
    login: "ログインできませんでした。もう一度お試しください。",
    invalidLink: "確認リンクが無効または期限切れです。確認メールを再送してください。",
    verify: "メール確認またはログインができませんでした。もう一度お試しください。",
  },
  ko: {
    login: "로그인할 수 없습니다. 다시 시도해 주세요.",
    invalidLink: "확인 링크가 잘못되었거나 만료되었습니다. 확인 이메일을 다시 요청해 주세요.",
    verify: "이메일 확인 또는 로그인을 완료할 수 없습니다. 다시 시도해 주세요.",
  },
};

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

function isResetPasswordNext(next: string) {
  return next === "/reset-password" || next.startsWith("/reset-password?");
}

function attachAuthCookies(response: NextResponse, cookiesToSet: CookieToSet[]) {
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });

  return response;
}

function loginRedirect(origin: string, lang: AuthLanguage, error: string, cookiesToSet: CookieToSet[] = []) {
  const url = new URL("/login", origin);
  url.searchParams.set("lang", lang);
  url.searchParams.set("error", error);
  return attachAuthCookies(NextResponse.redirect(url), cookiesToSet);
}

function resetRedirect(origin: string, lang: AuthLanguage, error: string, cookiesToSet: CookieToSet[] = []) {
  const url = new URL("/reset-password", origin);
  url.searchParams.set("lang", lang);
  url.searchParams.set("error", error);
  return attachAuthCookies(NextResponse.redirect(url), cookiesToSet);
}

function appRedirect(origin: string, next: string, cookiesToSet: CookieToSet[]) {
  return attachAuthCookies(NextResponse.redirect(new URL(next, origin)), cookiesToSet);
}

function resetCallbackErrorMessage(error: unknown, lang: AuthLanguage) {
  const copy = resetPasswordCopy[lang];
  const raw = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  const message = raw.toLowerCase();

  if (message.includes("expired") || message.includes("otp_expired")) return copy.expired;
  return copy.invalidToken;
}

function safeOtpType(value: string | null): EmailOtpType | null {
  if (
    value === "signup" ||
    value === "invite" ||
    value === "magiclink" ||
    value === "recovery" ||
    value === "email_change" ||
    value === "email"
  ) {
    return value;
  }

  return null;
}

async function createCallbackClient(cookiesToSet: CookieToSet[]) {
  const cookieStore = await cookies();
  const { url, anonKey } = requireSupabaseConfig();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(values: CookieToSet[]) {
        cookiesToSet.push(...values);
      },
    },
  });
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const otpType = safeOtpType(requestUrl.searchParams.get("type"));
  const providerError = requestUrl.searchParams.get("error_description") ?? requestUrl.searchParams.get("error");
  const lang = getAuthLanguage(requestUrl.searchParams.get("lang"));
  const copy = callbackFallbackCopy[lang];
  const next = safeNextPath(requestUrl.searchParams.get("next"));
  const isResetFlow = isResetPasswordNext(next) || otpType === "recovery";

  if (!supabaseAuthConfigured()) {
    return isResetFlow
      ? resetRedirect(requestUrl.origin, lang, missingSupabaseConfigMessage)
      : loginRedirect(requestUrl.origin, lang, missingSupabaseConfigMessage);
  }

  if (providerError) {
    return isResetFlow
      ? resetRedirect(requestUrl.origin, lang, resetCallbackErrorMessage(providerError, lang))
      : loginRedirect(requestUrl.origin, lang, authErrorMessage(providerError, copy.login, lang));
  }

  if (!code && (!tokenHash || !otpType)) {
    return isResetFlow
      ? resetRedirect(requestUrl.origin, lang, resetPasswordCopy[lang].invalidToken)
      : loginRedirect(requestUrl.origin, lang, copy.invalidLink);
  }

  const cookiesToSet: CookieToSet[] = [];

  try {
    const supabase = await createCallbackClient(cookiesToSet);
    const { error } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({ type: otpType as EmailOtpType, token_hash: tokenHash as string });

    if (error) {
      logAuthError("auth callback", error);
      return isResetFlow
        ? resetRedirect(requestUrl.origin, lang, resetCallbackErrorMessage(error, lang), cookiesToSet)
        : loginRedirect(requestUrl.origin, lang, authErrorMessage(error, copy.verify, lang), cookiesToSet);
    }

    // Link the referrer here (URL param survives the OAuth round-trip where the
    // pc_ref cookie may be dropped). Only sets referred_by when it is still empty.
    const referrerId = requestUrl.searchParams.get("ref");
    if (referrerId && !isResetFlow) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;
        if (userId && userId !== referrerId) {
          const admin = createAdminClient();
          const { data: profile } = await admin.from("user_profiles").select("referred_by").eq("user_id", userId).maybeSingle();
          if (profile && !profile.referred_by) {
            await admin.from("user_profiles").update({ referred_by: referrerId }).eq("user_id", userId);
          }
        }
      } catch (referralError) {
        console.error("[referral] callback link failed", referralError);
      }
    }
  } catch (error) {
    logAuthError("auth callback unexpected", error);
    return isResetFlow
      ? resetRedirect(requestUrl.origin, lang, resetCallbackErrorMessage(error, lang), cookiesToSet)
      : loginRedirect(requestUrl.origin, lang, authErrorMessage(error, copy.verify, lang), cookiesToSet);
  }

  return appRedirect(requestUrl.origin, next, cookiesToSet);
}