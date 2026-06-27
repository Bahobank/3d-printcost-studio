"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Provider } from "@supabase/supabase-js";
import { appUrl, missingSupabaseConfigMessage, supabaseAuthConfigured } from "@/lib/auth-config";
import { logAuthError } from "@/lib/auth-errors";
import { createClient } from "@/lib/supabase/server";

type LoginLanguage = "th" | "en" | "zh" | "ja" | "ko";

const loginErrorCopy = {
  th: {
    missingEmail: "กรุณากรอกอีเมล",
    invalidEmail: "อีเมลไม่ถูกต้อง",
    missingPassword: "กรุณากรอกรหัสผ่าน",
    invalidCredentials: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    emailNotConfirmed: "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ",
    authProblem: "ระบบเข้าสู่ระบบมีปัญหา กรุณาลองใหม่อีกครั้ง",
    invalidProvider: "ผู้ให้บริการเข้าสู่ระบบไม่ถูกต้อง",
    oauthGoogle: "ยังไม่ได้เปิดใช้งาน Google Login ใน Supabase",
    oauthApple: "ยังไม่ได้เปิดใช้งาน Apple Login ใน Supabase",
    oauthStart: "ไม่สามารถเริ่มเข้าสู่ระบบได้ กรุณาลองใหม่",
    network: "ไม่สามารถเชื่อมต่อระบบเข้าสู่ระบบได้ กรุณาลองใหม่",
  },
  en: {
    missingEmail: "Please enter your email address.",
    invalidEmail: "Email address is not valid.",
    missingPassword: "Please enter your password.",
    invalidCredentials: "Email or password is incorrect.",
    emailNotConfirmed: "Please confirm your email before signing in.",
    authProblem: "Sign-in service has a problem. Please try again.",
    invalidProvider: "Invalid sign-in provider.",
    oauthGoogle: "Google Login is not enabled in Supabase.",
    oauthApple: "Apple Login is not enabled in Supabase.",
    oauthStart: "Unable to start sign-in. Please try again.",
    network: "Unable to connect to the sign-in service. Please try again.",
  },
  zh: {
    missingEmail: "请输入邮箱。",
    invalidEmail: "邮箱格式不正确。",
    missingPassword: "请输入密码。",
    invalidCredentials: "邮箱或密码不正确。",
    emailNotConfirmed: "请先确认邮箱后再登录。",
    authProblem: "登录系统出现问题，请重试。",
    invalidProvider: "登录服务提供商不正确。",
    oauthGoogle: "尚未在 Supabase 中启用 Google 登录。",
    oauthApple: "尚未在 Supabase 中启用 Apple 登录。",
    oauthStart: "无法开始登录，请重试。",
    network: "无法连接登录系统，请重试。",
  },
  ja: {
    missingEmail: "メールアドレスを入力してください。",
    invalidEmail: "メールアドレスの形式が正しくありません。",
    missingPassword: "パスワードを入力してください。",
    invalidCredentials: "メールアドレスまたはパスワードが正しくありません。",
    emailNotConfirmed: "ログイン前にメールアドレスを確認してください。",
    authProblem: "ログインシステムに問題があります。もう一度お試しください。",
    invalidProvider: "ログインプロバイダーが正しくありません。",
    oauthGoogle: "Supabase で Google ログインが有効になっていません。",
    oauthApple: "Supabase で Apple ログインが有効になっていません。",
    oauthStart: "ログインを開始できません。もう一度お試しください。",
    network: "ログインシステムに接続できません。もう一度お試しください。",
  },
  ko: {
    missingEmail: "이메일을 입력해 주세요.",
    invalidEmail: "이메일 형식이 올바르지 않습니다.",
    missingPassword: "비밀번호를 입력해 주세요.",
    invalidCredentials: "이메일 또는 비밀번호가 올바르지 않습니다.",
    emailNotConfirmed: "로그인하기 전에 이메일을 확인해 주세요.",
    authProblem: "로그인 시스템에 문제가 있습니다. 다시 시도해 주세요.",
    invalidProvider: "로그인 제공자가 올바르지 않습니다.",
    oauthGoogle: "Supabase에서 Google 로그인이 활성화되어 있지 않습니다.",
    oauthApple: "Supabase에서 Apple 로그인이 활성화되어 있지 않습니다.",
    oauthStart: "로그인을 시작할 수 없습니다. 다시 시도해 주세요.",
    network: "로그인 시스템에 연결할 수 없습니다. 다시 시도해 주세요.",
  },
} satisfies Record<LoginLanguage, Record<string, string>>;
function getLanguage(value: FormDataEntryValue | null): LoginLanguage {
  return value === "en" || value === "zh" || value === "ja" || value === "ko" ? value : "th";
}

function loginUrl(lang: LoginLanguage, error: string) {
  return `/login?lang=${lang}&error=${encodeURIComponent(error)}`;
}

function loginMessageUrl(lang: LoginLanguage, message: string) {
  return `/login?lang=${lang}&message=${encodeURIComponent(message)}`;
}
function redirectMissingAuthConfig(lang: LoginLanguage) {
  redirect(loginUrl(lang, missingSupabaseConfigMessage));
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function localizedAuthError(error: unknown, lang: LoginLanguage) {
  const copy = loginErrorCopy[lang];
  const raw = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  const message = raw.toLowerCase();

  if (!raw) return copy.authProblem;
  if (raw.includes(missingSupabaseConfigMessage) || message.includes("supabase auth")) return missingSupabaseConfigMessage;
  if (message.includes("email not confirmed") || message.includes("not confirmed")) return copy.emailNotConfirmed;
  if (message.includes("invalid login") || message.includes("invalid credentials")) return copy.invalidCredentials;
  if (message.includes("network") || message.includes("fetch")) return copy.network;
  if (message.includes("provider") || message.includes("oauth")) return copy.oauthStart;

  return copy.authProblem;
}

function localizedOAuthError(provider: Provider, error: unknown, lang: LoginLanguage) {
  const copy = loginErrorCopy[lang];
  const fallback = provider === "apple" ? copy.oauthApple : copy.oauthGoogle;
  const raw = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  const message = raw.toLowerCase();

  if (!raw) return fallback;
  if (message.includes("network") || message.includes("fetch")) return copy.network;
  if (message.includes("provider") || message.includes("oauth")) return fallback;

  return fallback;
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

async function authCallbackUrl(lang: LoginLanguage) {
  // Configure these exact redirect URLs in Supabase Dashboard > Authentication > URL Configuration:
  // - http://localhost:3002/auth/callback
  // - https://3dprintcost.studio/auth/callback
  // Also enable Google and Apple providers in Supabase Dashboard before using OAuth login.
  return `${await requestOrigin()}/auth/callback?lang=${lang}`;
}

export async function signInWithPassword(formData: FormData) {
  const lang = getLanguage(formData.get("lang"));
  const copy = loginErrorCopy[lang];
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email) {
    redirect(loginUrl(lang, copy.missingEmail));
  }

  if (!isValidEmail(email)) {
    redirect(loginUrl(lang, copy.invalidEmail));
  }

  if (!password) {
    redirect(loginUrl(lang, copy.missingPassword));
  }

  if (!supabaseAuthConfigured()) redirectMissingAuthConfig(lang);

  let errorMessage: string | null = null;

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      logAuthError("signInWithPassword", error);
      errorMessage = localizedAuthError(error, lang);
    }
  } catch (error) {
    logAuthError("signInWithPassword unexpected", error);
    errorMessage = localizedAuthError(error, lang);
  }

  if (errorMessage) {
    redirect(loginUrl(lang, errorMessage));
  }

  redirect("/dashboard");
}

export async function signInWithOAuth(formData: FormData) {
  const lang = getLanguage(formData.get("lang"));
  const copy = loginErrorCopy[lang];

  if (!supabaseAuthConfigured()) redirectMissingAuthConfig(lang);

  const provider = String(formData.get("provider") ?? "") as Provider;

  if (provider !== "google" && provider !== "apple") {
    redirect(loginUrl(lang, copy.invalidProvider));
  }

  let oauthUrl: string | null = null;
  let errorMessage: string | null = null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: await authCallbackUrl(lang),
      },
    });

    if (error || !data.url) {
      logAuthError(`signInWithOAuth:${provider}`, error ?? new Error("Missing OAuth URL"));
      errorMessage = localizedOAuthError(provider, error, lang);
    } else {
      oauthUrl = data.url;
    }
  } catch (error) {
    logAuthError(`signInWithOAuth:${provider}:unexpected`, error);
    errorMessage = localizedOAuthError(provider, error, lang);
  }

  if (errorMessage) {
    redirect(loginUrl(lang, errorMessage));
  }

  if (oauthUrl) {
    redirect(oauthUrl);
  }

  redirect(loginUrl(lang, copy.oauthStart));
}
