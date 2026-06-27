"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { appUrl, missingSupabaseConfigMessage, supabaseAuthConfigured } from "@/lib/auth-config";
import { authErrorMessage, logAuthError } from "@/lib/auth-errors";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type LoginLanguage = "th" | "en" | "zh" | "ja" | "ko";

type SignupCopy = {
  missingFields: string;
  passwordMismatch: string;
  signupFallback: string;
  duplicateAccount: string;
  missingResendEmail: string;
  invalidResendEmail: string;
  resendFallback: string;
  resendSent: string;
  accountNotFound: string;
  alreadyConfirmed: string;
  adminCheckUnavailable: string;
};

const signupActionCopy: Record<LoginLanguage, SignupCopy> = {
  th: {
    missingFields: "กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน",
    passwordMismatch: "รหัสผ่านไม่ตรงกัน",
    signupFallback: "ไม่สามารถสมัครสมาชิกได้ กรุณาลองใหม่",
    duplicateAccount: "อีเมลนี้มีบัญชีอยู่แล้ว กรุณาเข้าสู่ระบบ หรือกดส่งอีเมลยืนยันอีกครั้งหากยังไม่ได้ยืนยันอีเมล",
    missingResendEmail: "ไม่พบอีเมลสำหรับส่งลิงก์ยืนยันอีกครั้ง",
    invalidResendEmail: "อีเมลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง",
    resendFallback: "ไม่สามารถส่งอีเมลยืนยันได้ กรุณาลองใหม่",
    resendSent: "ส่งอีเมลยืนยันใหม่แล้ว กรุณาตรวจสอบกล่องจดหมาย สแปม หรือโปรโมชันของคุณ",
    accountNotFound: "ไม่พบบัญชีของอีเมลนี้ กรุณาสมัครบัญชีใหม่อีกครั้ง",
    alreadyConfirmed: "อีเมลนี้ยืนยันแล้ว คุณสามารถเข้าสู่ระบบได้เลย",
    adminCheckUnavailable: "ไม่สามารถตรวจสอบสถานะบัญชีได้ กรุณาลองใหม่อีกครั้ง",
  },
  en: {
    missingFields: "Please fill in your email and password.",
    passwordMismatch: "Passwords do not match.",
    signupFallback: "Unable to create your account. Please try again.",
    duplicateAccount: "This email already has an account. Please sign in, or resend the confirmation email if it has not been confirmed yet.",
    missingResendEmail: "No email address was found for resending the confirmation link.",
    invalidResendEmail: "Email address is not valid. Please check it again.",
    resendFallback: "Unable to send the confirmation email. Please try again.",
    resendSent: "A new confirmation email was sent. Please check your inbox, spam, or promotions folder.",
    accountNotFound: "No account was found for this email. Please create a new account again.",
    alreadyConfirmed: "This email is already confirmed. You can sign in now.",
    adminCheckUnavailable: "Unable to check the account status. Please try again.",
  },
  zh: {
    missingFields: "请填写邮箱和密码。",
    passwordMismatch: "两次输入的密码不一致。",
    signupFallback: "无法创建账号，请重试。",
    duplicateAccount: "此邮箱已有账号。请登录；如果尚未确认邮箱，可以重新发送确认邮件。",
    missingResendEmail: "没有找到用于重新发送确认链接的邮箱。",
    invalidResendEmail: "邮箱格式不正确，请再次检查。",
    resendFallback: "无法发送确认邮件，请重试。",
    resendSent: "已发送新的确认邮件。请检查收件箱、垃圾邮件或促销邮件文件夹。",
    accountNotFound: "未找到此邮箱的账号，请重新创建账号。",
    alreadyConfirmed: "此邮箱已确认。你现在可以登录。",
    adminCheckUnavailable: "无法检查账号状态，请重试。",
  },
  ja: {
    missingFields: "メールアドレスとパスワードを入力してください。",
    passwordMismatch: "パスワードが一致しません。",
    signupFallback: "アカウントを作成できませんでした。もう一度お試しください。",
    duplicateAccount: "このメールアドレスには既にアカウントがあります。ログインするか、未確認の場合は確認メールを再送してください。",
    missingResendEmail: "確認リンクを再送するメールアドレスが見つかりません。",
    invalidResendEmail: "メールアドレスの形式が正しくありません。もう一度確認してください。",
    resendFallback: "確認メールを送信できませんでした。もう一度お試しください。",
    resendSent: "新しい確認メールを送信しました。受信トレイ、迷惑メール、プロモーションフォルダを確認してください。",
    accountNotFound: "このメールアドレスのアカウントが見つかりません。もう一度アカウントを作成してください。",
    alreadyConfirmed: "このメールアドレスは既に確認済みです。ログインできます。",
    adminCheckUnavailable: "アカウント状態を確認できませんでした。もう一度お試しください。",
  },
  ko: {
    missingFields: "이메일과 비밀번호를 모두 입력해 주세요.",
    passwordMismatch: "비밀번호가 일치하지 않습니다.",
    signupFallback: "계정을 만들 수 없습니다. 다시 시도해 주세요.",
    duplicateAccount: "이 이메일로 이미 가입된 계정이 있습니다. 로그인하거나, 아직 이메일을 확인하지 않았다면 확인 이메일을 다시 보내 주세요.",
    missingResendEmail: "확인 링크를 다시 보낼 이메일을 찾을 수 없습니다.",
    invalidResendEmail: "이메일 형식이 올바르지 않습니다. 다시 확인해 주세요.",
    resendFallback: "확인 이메일을 보낼 수 없습니다. 다시 시도해 주세요.",
    resendSent: "새 확인 이메일을 보냈습니다. 받은편지함, 스팸함 또는 프로모션 폴더를 확인해 주세요.",
    accountNotFound: "이 이메일의 계정을 찾을 수 없습니다. 계정을 다시 만들어 주세요.",
    alreadyConfirmed: "이 이메일은 이미 확인되었습니다. 이제 로그인할 수 있습니다.",
    adminCheckUnavailable: "계정 상태를 확인할 수 없습니다. 다시 시도해 주세요.",
  },
};

function getLanguage(value: FormDataEntryValue | null): LoginLanguage {
  return value === "en" || value === "zh" || value === "ja" || value === "ko" ? value : "th";
}

function signupErrorUrl(lang: LoginLanguage, error: string) {
  return `/signup?lang=${lang}&error=${encodeURIComponent(error)}`;
}

function signupNoticeUrl(lang: LoginLanguage, email: string, values?: { error?: string; message?: string }) {
  const params = new URLSearchParams({ lang, notice: "confirm-email" });
  if (email) params.set("email", email);
  if (values?.error) params.set("error", values.error);
  if (values?.message) params.set("message", values.message);
  return `/signup?${params.toString()}`;
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

async function authCallbackUrl(lang: LoginLanguage) {
  // Configure these exact redirect URLs in Supabase Dashboard > Authentication > URL Configuration:
  // - http://localhost:3002/auth/callback
  // - https://3dprintcost.studio/auth/callback
  return `${await requestOrigin()}/auth/callback?lang=${lang}`;
}

async function findUserByEmail(email: string) {
  const admin = createAdminClient();
  const normalizedEmail = email.toLowerCase();

  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;

    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === normalizedEmail);
    if (user) return user;
    if (data.users.length < 1000) return null;
  }

  return null;
}

export async function createAccount(formData: FormData) {
  const lang = getLanguage(formData.get("lang"));
  const copy = signupActionCopy[lang];
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!email || !password || !confirmPassword) {
    redirect(signupErrorUrl(lang, copy.missingFields));
  }

  if (password !== confirmPassword) {
    redirect(signupErrorUrl(lang, copy.passwordMismatch));
  }

  if (!supabaseAuthConfigured()) {
    redirect(signupErrorUrl(lang, missingSupabaseConfigMessage));
  }

  let result: Awaited<ReturnType<Awaited<ReturnType<typeof createClient>>["auth"]["signUp"]>>;

  try {
    const supabase = await createClient();
    result = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: await authCallbackUrl(lang),
      },
    });
  } catch (error) {
    logAuthError("signUpWithPassword unexpected", error);
    redirect(signupErrorUrl(lang, authErrorMessage(error, copy.signupFallback, lang)));
  }

  if (result.error) {
    logAuthError("signUpWithPassword", result.error);
    redirect(signupErrorUrl(lang, authErrorMessage(result.error, copy.signupFallback, lang)));
  }

  if (result.data.user && result.data.user.identities?.length === 0) {
    redirect(signupNoticeUrl(lang, email, { message: copy.duplicateAccount }));
  }

  if (result.data.session) {
    redirect("/dashboard");
  }

  redirect(signupNoticeUrl(lang, email));
}

export async function resendConfirmationEmail(formData: FormData) {
  const lang = getLanguage(formData.get("lang"));
  const copy = signupActionCopy[lang];
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    redirect(signupNoticeUrl(lang, "", { error: copy.missingResendEmail }));
  }

  if (!isValidEmail(email)) {
    redirect(signupNoticeUrl(lang, email, { error: copy.invalidResendEmail }));
  }

  if (!supabaseAuthConfigured()) {
    redirect(signupNoticeUrl(lang, email, { error: missingSupabaseConfigMessage }));
  }

  let accountStatusRedirect: string | null = null;

  if (process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    try {
      const user = await findUserByEmail(email);

      if (!user) {
        accountStatusRedirect = signupNoticeUrl(lang, email, { error: copy.accountNotFound });
      } else if (user.email_confirmed_at || user.confirmed_at) {
        accountStatusRedirect = signupNoticeUrl(lang, email, { message: copy.alreadyConfirmed });
      }
    } catch (error) {
      logAuthError("resendConfirmationEmail account status", error);
      accountStatusRedirect = signupNoticeUrl(lang, email, { error: authErrorMessage(error, copy.adminCheckUnavailable, lang) });
    }
  }

  if (accountStatusRedirect) {
    redirect(accountStatusRedirect);
  }

  let errorMessage: string | null = null;

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: await authCallbackUrl(lang),
      },
    });

    if (error) {
      logAuthError("resendConfirmationEmail", error);
      errorMessage = authErrorMessage(error, copy.resendFallback, lang);
    }
  } catch (error) {
    logAuthError("resendConfirmationEmail unexpected", error);
    errorMessage = authErrorMessage(error, copy.resendFallback, lang);
  }

  if (errorMessage) {
    redirect(signupNoticeUrl(lang, email, { error: errorMessage }));
  }

  redirect(signupNoticeUrl(lang, email, { message: copy.resendSent }));
}