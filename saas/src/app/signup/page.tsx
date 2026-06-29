import { LockKeyhole, Mail, ShieldCheck, Sparkles, UserPlus } from "lucide-react";
import { PendingSubmitButton } from "@/components/pending-submit";
import { signInWithOAuth } from "@/app/login/actions";
import { detectAcceptLanguage } from "@/lib/detect-language";
import { createAccount, resendConfirmationEmail } from "./actions";

function GoogleMark() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

type LoginLanguage = "th" | "en" | "zh" | "ja" | "ko";

const signupCopy = {
  th: {
    productName: "3D PrintCost Studio",
    badge: "ทดลองใช้ฟรี 7 วัน",
    title: "สร้างบัญชีใหม่",
    subtitle: "เริ่มใช้งาน 3D PrintCost Studio\nไม่ต้องใช้บัตรเครดิต",
    email: "อีเมล",
    password: "รหัสผ่าน",
    confirmPassword: "ยืนยันรหัสผ่าน",
    primaryCta: "เริ่มทดลองใช้ฟรี",
    pendingCta: "กำลังสมัคร...",
    alreadyHaveAccount: "มีบัญชีอยู่แล้ว?",
    signIn: "เข้าสู่ระบบ",
    google: "สมัครด้วย Google",
    googlePending: "กำลังเชื่อมต่อกับ Google...",
    divider: "หรือ",
    securityNote: "ข้อมูลของคุณได้รับการเข้ารหัสและจัดเก็บอย่างปลอดภัย",
    noticeTitle: "ตรวจสอบอีเมลของคุณ",
    noticeBody: "เราส่งลิงก์ยืนยันบัญชีไปที่อีเมลของคุณแล้ว กรุณากดยืนยันในอีเมลก่อนเข้าสู่ระบบ",
    noticeHint: "หากไม่พบอีเมล กรุณาตรวจสอบโฟลเดอร์สแปมหรือโปรโมชัน",
    noticeButton: "ไปหน้าเข้าสู่ระบบ",
    resendButton: "ส่งอีเมลยืนยันอีกครั้ง",
    resendPending: "กำลังส่งอีเมล...",
  },
  en: {
    productName: "3D PrintCost Studio",
    badge: "7-day free trial",
    title: "Create your account",
    subtitle: "Start using 3D PrintCost Studio\nNo credit card required",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm password",
    primaryCta: "Start free trial",
    pendingCta: "Creating account...",
    alreadyHaveAccount: "Already have an account?",
    signIn: "Sign in",
    google: "Sign up with Google",
    googlePending: "Connecting to Google...",
    divider: "or",
    securityNote: "Your data is encrypted and stored securely.",
    noticeTitle: "Check your email",
    noticeBody: "We sent a confirmation link to your email. Please confirm your account before signing in.",
    noticeHint: "If you do not see it, check your spam or promotions folder.",
    noticeButton: "Go to sign in",
    resendButton: "Resend confirmation email",
    resendPending: "Sending email...",
  },
  zh: {
    productName: "3D PrintCost Studio",
    badge: "免费试用 7 天",
    title: "创建账号",
    subtitle: "开始使用 3D PrintCost Studio\n无需信用卡",
    email: "邮箱",
    password: "密码",
    confirmPassword: "确认密码",
    primaryCta: "开始免费试用",
    pendingCta: "正在创建账号...",
    alreadyHaveAccount: "已有账号？",
    signIn: "登录",
    google: "使用 Google 注册",
    googlePending: "正在连接 Google...",
    divider: "或",
    securityNote: "你的数据会被加密并安全存储。",
    noticeTitle: "请查看你的邮箱",
    noticeBody: "我们已向你的邮箱发送确认链接。请先确认账号再登录。",
    noticeHint: "如果没有看到邮件，请检查垃圾邮件或促销邮件文件夹。",
    noticeButton: "前往登录",
    resendButton: "重新发送确认邮件",
    resendPending: "正在发送邮件...",
  },
  ja: {
    productName: "3D PrintCost Studio",
    badge: "7日間無料トライアル",
    title: "アカウントを作成",
    subtitle: "3D PrintCost Studio を始めましょう\nクレジットカードは不要です",
    email: "メールアドレス",
    password: "パスワード",
    confirmPassword: "パスワード確認",
    primaryCta: "無料トライアルを開始",
    pendingCta: "登録中...",
    alreadyHaveAccount: "すでにアカウントをお持ちですか？",
    signIn: "ログイン",
    google: "Googleで登録",
    googlePending: "Googleに接続中...",
    divider: "または",
    securityNote: "データは暗号化され、安全に保存されます。",
    noticeTitle: "メールを確認してください",
    noticeBody: "確認リンクをメールで送信しました。ログインする前にアカウントを確認してください。",
    noticeHint: "メールが見つからない場合は、迷惑メールやプロモーションフォルダも確認してください。",
    noticeButton: "ログインへ進む",
    resendButton: "確認メールを再送信",
    resendPending: "メール送信中...",
  },
  ko: {
    productName: "3D PrintCost Studio",
    badge: "7일 무료 체험",
    title: "계정 만들기",
    subtitle: "3D PrintCost Studio를 시작하세요\n신용카드는 필요하지 않습니다",
    email: "이메일",
    password: "비밀번호",
    confirmPassword: "비밀번호 확인",
    primaryCta: "무료 체험 시작",
    pendingCta: "가입 중...",
    alreadyHaveAccount: "이미 계정이 있나요?",
    signIn: "로그인",
    google: "Google로 가입",
    googlePending: "Google에 연결 중...",
    divider: "또는",
    securityNote: "데이터는 암호화되어 안전하게 저장됩니다.",
    noticeTitle: "이메일을 확인해 주세요",
    noticeBody: "확인 링크를 이메일로 보냈습니다. 로그인하기 전에 계정을 확인해 주세요.",
    noticeHint: "메일이 보이지 않으면 스팸함이나 프로모션 폴더를 확인해 주세요.",
    noticeButton: "로그인으로 이동",
    resendButton: "확인 이메일 다시 보내기",
    resendPending: "이메일 보내는 중...",
  },
} satisfies Record<LoginLanguage, {
  productName: string;
  badge: string;
  title: string;
  subtitle: string;
  email: string;
  password: string;
  confirmPassword: string;
  primaryCta: string;
  pendingCta: string;
  alreadyHaveAccount: string;
  signIn: string;
  google: string;
  googlePending: string;
  divider: string;
  securityNote: string;
  noticeTitle: string;
  noticeBody: string;
  noticeHint: string;
  noticeButton: string;
  resendButton: string;
  resendPending: string;
}>;

function getLanguage(value: string | undefined): LoginLanguage {
  return value === "en" || value === "zh" || value === "ja" || value === "ko" ? value : "th";
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams?: Promise<{ email?: string; error?: string; lang?: string; message?: string; notice?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const currentLanguage = getLanguage(params?.lang ?? (await detectAcceptLanguage()) ?? undefined);
  const copy = signupCopy[currentLanguage];
  const showConfirmEmailNotice = params?.notice === "confirm-email";
  const maskedEmail = params?.email ? decodeURIComponent(params.email) : "";

  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_14%_0%,#eaf3ff_0%,transparent_28%),radial-gradient(circle_at_88%_10%,#f4edff_0%,transparent_32%),linear-gradient(135deg,#f8fbff_0%,#eef5ff_100%)] px-5 py-4 text-slate-950 sm:px-6 sm:py-4">
      {showConfirmEmailNotice ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/35 px-5 backdrop-blur-sm" role="alertdialog" aria-modal="true" aria-labelledby="confirm-email-title">
          <div className="w-full max-w-[420px] rounded-[28px] border border-white/90 bg-white p-7 text-center shadow-[0_32px_100px_rgba(15,23,42,0.28)] sm:p-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Mail className="h-7 w-7" />
            </div>
            <h2 id="confirm-email-title" className="mt-5 text-2xl font-black tracking-tight text-slate-950">
              {copy.noticeTitle}
            </h2>
            <p className="mt-3 text-base font-semibold leading-7 text-slate-600">
              {copy.noticeBody}
            </p>
            {maskedEmail ? <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-700">{maskedEmail}</p> : null}
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">{copy.noticeHint}</p>
            {params?.message ? (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                {params.message}
              </div>
            ) : null}
            {params?.error ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {params.error}
              </div>
            ) : null}
            {maskedEmail ? (
              <form action={resendConfirmationEmail} className="mt-5">
                <input name="lang" type="hidden" value={currentLanguage} />
                <input name="email" type="hidden" value={maskedEmail} />
                <PendingSubmitButton
                  className="flex h-11 w-full items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-base font-black text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:bg-blue-50 disabled:text-blue-400"
                  idleText={copy.resendButton}
                  pendingText={copy.resendPending}
                />
              </form>
            ) : null}
            <a className="mt-3 flex h-11 w-full items-center justify-center rounded-xl bg-blue-600 text-base font-black text-white shadow-[0_18px_45px_rgba(37,99,235,0.32)] transition hover:bg-blue-700" href={`/login?lang=${currentLanguage}`}>
              {copy.noticeButton}
            </a>
          </div>
        </div>
      ) : null}

      <section className="relative w-full max-w-[440px] overflow-hidden rounded-[28px] border border-white/90 bg-white px-6 py-5 shadow-[0_30px_95px_rgba(30,41,59,0.16)] sm:px-10 sm:py-6">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-16 -top-20 h-44 w-44 rounded-full bg-blue-100/70 blur-2xl" />
          <div className="absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-violet-100/70 blur-2xl" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col items-center text-center">
            <img alt="3D PrintCost Studio" className="h-10 w-auto object-contain" src="/assets/official-3d-printcost-logo.png" />
            <p className="mt-2 text-sm font-black tracking-tight text-slate-950">{copy.productName}</p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-sm font-black text-blue-700 shadow-sm">
              <Sparkles className="h-4 w-4" />
              {copy.badge}
            </div>
            <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-950 sm:text-[28px]">{copy.title}</h1>
            <p className="mt-2 whitespace-pre-line text-base font-semibold leading-7 text-slate-500">{copy.subtitle}</p>
          </div>

          {!showConfirmEmailNotice && params?.error ? (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {params.error}
            </div>
          ) : null}

          <form action={createAccount} className="mt-4 space-y-2.5">
            <input name="lang" type="hidden" value={currentLanguage} />
            <label className="block">
              <span className="mb-1.5 block text-sm font-black text-slate-950">{copy.email}</span>
              <span className="flex h-10 items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
                <Mail className="h-4 w-4 text-slate-400" />
                <input aria-label={copy.email} autoComplete="email" className="h-full min-w-0 flex-1 bg-transparent text-base font-semibold text-slate-950 outline-none placeholder:text-slate-400" name="email" placeholder="name@example.com" required type="email" />
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-black text-slate-950">{copy.password}</span>
              <span className="flex h-10 items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
                <LockKeyhole className="h-4 w-4 text-slate-400" />
                <input aria-label={copy.password} autoComplete="new-password" className="h-full min-w-0 flex-1 bg-transparent text-base font-semibold text-slate-950 outline-none placeholder:text-slate-400" name="password" placeholder="********" required type="password" />
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-black text-slate-950">{copy.confirmPassword}</span>
              <span className="flex h-10 items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
                <LockKeyhole className="h-4 w-4 text-slate-400" />
                <input aria-label={copy.confirmPassword} autoComplete="new-password" className="h-full min-w-0 flex-1 bg-transparent text-base font-semibold text-slate-950 outline-none placeholder:text-slate-400" name="confirmPassword" placeholder="********" required type="password" />
              </span>
            </label>

            <PendingSubmitButton
              className="flex h-10 w-full items-center justify-center gap-3 rounded-xl bg-blue-600 text-base font-black text-white shadow-[0_18px_45px_rgba(37,99,235,0.32)] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-500"
              icon={<UserPlus className="h-4 w-4" />}
              idleText={copy.primaryCta}
              pendingText={copy.pendingCta}
            />
          </form>

          <div className="my-3 flex items-center gap-3 text-sm font-semibold text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            {copy.divider}
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <form action={signInWithOAuth}>
            <input name="lang" type="hidden" value={currentLanguage} />
            <input name="provider" type="hidden" value="google" />
            <PendingSubmitButton
              className="flex h-10 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-base font-black text-slate-800 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition hover:border-blue-200 hover:bg-blue-50/40 disabled:cursor-not-allowed disabled:opacity-70"
              icon={<GoogleMark />}
              idleText={copy.google}
              pendingText={copy.googlePending}
            />
          </form>

          <div className="mt-3 flex items-center justify-center gap-2 text-center text-sm font-semibold text-slate-500">
            <ShieldCheck className="h-4 w-4 shrink-0 text-blue-600" />
            {copy.securityNote}
          </div>

          <p className="mt-4 text-center text-sm font-semibold text-slate-500">
            {copy.alreadyHaveAccount}{" "}
            <a className="font-black text-blue-600 hover:text-blue-700" href={`/login?lang=${currentLanguage}`}>
              {copy.signIn}
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}