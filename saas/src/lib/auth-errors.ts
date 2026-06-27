import type { Provider } from "@supabase/supabase-js";
import { missingSupabaseConfigMessage } from "@/lib/auth-config";

export type AuthLanguage = "th" | "en" | "zh" | "ja" | "ko";

type AuthErrorCopy = {
  fallback: string;
  emailNotConfirmed: string;
  invalidCredentials: string;
  alreadyRegistered: string;
  rateLimit: string;
  emailNotAuthorized: string;
  passwordTooShort: string;
  invalidPassword: string;
  providerNotEnabled: string;
  network: string;
  oauthGoogle: string;
  oauthApple: string;
};

const authErrorCopy: Record<AuthLanguage, AuthErrorCopy> = {
  th: {
    fallback: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
    emailNotConfirmed: "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ",
    invalidCredentials: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    alreadyRegistered: "อีเมลนี้มีบัญชีอยู่แล้ว กรุณาเข้าสู่ระบบ",
    rateLimit: "ส่งอีเมลยืนยันบ่อยเกินไป กรุณารอประมาณ 30 วินาทีแล้วลองใหม่",
    emailNotAuthorized: "ระบบส่งอีเมลของ Supabase ยังไม่พร้อมสำหรับอีเมลนี้ กรุณาตั้งค่า Custom SMTP ก่อนใช้งานจริง",
    passwordTooShort: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
    invalidPassword: "รหัสผ่านไม่ถูกต้องตามเงื่อนไข",
    providerNotEnabled: "ยังไม่ได้เปิดใช้งานผู้ให้บริการเข้าสู่ระบบนี้ใน Supabase",
    network: "ไม่สามารถเชื่อมต่อระบบเข้าสู่ระบบได้ กรุณาลองใหม่",
    oauthGoogle: "ยังไม่ได้เปิดใช้งาน Google Login ใน Supabase",
    oauthApple: "ยังไม่ได้เปิดใช้งาน Apple Login ใน Supabase",
  },
  en: {
    fallback: "Something went wrong. Please try again.",
    emailNotConfirmed: "Please confirm your email before signing in.",
    invalidCredentials: "Email or password is incorrect.",
    alreadyRegistered: "This email already has an account. Please sign in.",
    rateLimit: "Too many confirmation emails were requested. Please wait about 30 seconds and try again.",
    emailNotAuthorized: "Supabase email delivery is not ready for this address. Please configure Custom SMTP before production use.",
    passwordTooShort: "Password must be at least 6 characters.",
    invalidPassword: "Password does not meet the requirements.",
    providerNotEnabled: "This sign-in provider is not enabled in Supabase.",
    network: "Unable to connect to the sign-in service. Please try again.",
    oauthGoogle: "Google Login is not enabled in Supabase.",
    oauthApple: "Apple Login is not enabled in Supabase.",
  },
  zh: {
    fallback: "出现错误，请重试。",
    emailNotConfirmed: "请先确认邮箱后再登录。",
    invalidCredentials: "邮箱或密码不正确。",
    alreadyRegistered: "此邮箱已有账号，请登录。",
    rateLimit: "确认邮件请求过于频繁，请等待约 30 秒后再试。",
    emailNotAuthorized: "Supabase 邮件发送尚未为此邮箱配置完成，请先设置 Custom SMTP 再用于生产环境。",
    passwordTooShort: "密码至少需要 6 个字符。",
    invalidPassword: "密码不符合要求。",
    providerNotEnabled: "尚未在 Supabase 中启用此登录提供商。",
    network: "无法连接登录系统，请重试。",
    oauthGoogle: "尚未在 Supabase 中启用 Google 登录。",
    oauthApple: "尚未在 Supabase 中启用 Apple 登录。",
  },
  ja: {
    fallback: "問題が発生しました。もう一度お試しください。",
    emailNotConfirmed: "ログイン前にメールアドレスを確認してください。",
    invalidCredentials: "メールアドレスまたはパスワードが正しくありません。",
    alreadyRegistered: "このメールアドレスには既にアカウントがあります。ログインしてください。",
    rateLimit: "確認メールのリクエストが多すぎます。約30秒待ってからもう一度お試しください。",
    emailNotAuthorized: "このメールアドレスでは Supabase のメール送信設定が完了していません。本番利用前に Custom SMTP を設定してください。",
    passwordTooShort: "パスワードは6文字以上で入力してください。",
    invalidPassword: "パスワードが要件を満たしていません。",
    providerNotEnabled: "このログインプロバイダーは Supabase で有効になっていません。",
    network: "ログインシステムに接続できません。もう一度お試しください。",
    oauthGoogle: "Supabase で Google ログインが有効になっていません。",
    oauthApple: "Supabase で Apple ログインが有効になっていません。",
  },
  ko: {
    fallback: "문제가 발생했습니다. 다시 시도해 주세요.",
    emailNotConfirmed: "로그인하기 전에 이메일을 확인해 주세요.",
    invalidCredentials: "이메일 또는 비밀번호가 올바르지 않습니다.",
    alreadyRegistered: "이 이메일로 이미 가입된 계정이 있습니다. 로그인해 주세요.",
    rateLimit: "확인 이메일 요청이 너무 잦습니다. 약 30초 후 다시 시도해 주세요.",
    emailNotAuthorized: "이 이메일에 대한 Supabase 메일 발송 설정이 아직 준비되지 않았습니다. 실제 운영 전에 Custom SMTP를 설정해 주세요.",
    passwordTooShort: "비밀번호는 최소 6자 이상이어야 합니다.",
    invalidPassword: "비밀번호가 요구 사항을 충족하지 않습니다.",
    providerNotEnabled: "이 로그인 제공자가 Supabase에서 활성화되어 있지 않습니다.",
    network: "로그인 시스템에 연결할 수 없습니다. 다시 시도해 주세요.",
    oauthGoogle: "Supabase에서 Google 로그인이 활성화되어 있지 않습니다.",
    oauthApple: "Supabase에서 Apple 로그인이 활성화되어 있지 않습니다.",
  },
};

export function getAuthLanguage(value: FormDataEntryValue | string | null): AuthLanguage {
  return value === "en" || value === "zh" || value === "ja" || value === "ko" ? value : "th";
}

export function authErrorMessage(error: unknown, fallback?: string, lang: AuthLanguage = "th") {
  const copy = authErrorCopy[lang];
  const raw = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  const message = raw.toLowerCase();

  if (!raw) return fallback ?? copy.fallback;
  if (raw.includes(missingSupabaseConfigMessage) || message.includes("supabase auth")) return missingSupabaseConfigMessage;
  if (message.includes("email not confirmed") || message.includes("not confirmed")) return copy.emailNotConfirmed;
  if (message.includes("invalid login") || message.includes("invalid credentials")) return copy.invalidCredentials;
  if (message.includes("user already registered") || message.includes("already registered")) return copy.alreadyRegistered;
  if (
    message.includes("rate limit") ||
    message.includes("too many") ||
    message.includes("over email send rate limit") ||
    message.includes("over_email_send_rate_limit") ||
    message.includes("for security purposes")
  ) {
    return copy.rateLimit;
  }
  if (message.includes("email address not authorized")) return copy.emailNotAuthorized;
  if (message.includes("password") && message.includes("six")) return copy.passwordTooShort;
  if (message.includes("password")) return copy.invalidPassword;
  if (message.includes("provider") || message.includes("oauth")) return copy.providerNotEnabled;
  if (message.includes("network") || message.includes("fetch")) return copy.network;

  return fallback ?? copy.fallback;
}

export function oauthErrorMessage(provider: Provider, error: unknown, lang: AuthLanguage = "th") {
  const copy = authErrorCopy[lang];
  const fallback = provider === "apple" ? copy.oauthApple : copy.oauthGoogle;

  return authErrorMessage(error, fallback, lang);
}

export function logAuthError(context: string, error: unknown) {
  console.error(`[auth] ${context}`, error);
}