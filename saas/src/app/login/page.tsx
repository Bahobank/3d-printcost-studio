import { BarChart3, Box, DollarSign, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { LoginLanguageSelect } from "@/components/login-language-select";
import { PendingSubmitButton } from "@/components/pending-submit";
import { detectAcceptLanguage } from "@/lib/detect-language";
import { signInWithOAuth, signInWithPassword } from "./actions";

type LoginLanguage = "th" | "en" | "zh" | "ja" | "ko";

const loginCopy = {
  th: {
    heroTitle: "3D PrintCost Studio",
    heroAccent: "คำนวณต้นทุนงานพิมพ์ 3D ได้แม่นยำกว่าเดิม",
    heroTagline: "จัดการต้นทุนวัสดุ ค่าไฟ เวลาเครื่องพิมพ์ สต๊อก และกำไรของงานพิมพ์ FDM / Resin ในระบบเดียว",
    heroDescription: "",
    securityNote: "ข้อมูลของคุณถูกเข้ารหัสและจัดเก็บอย่างปลอดภัย พร้อมใช้งานได้ทุกที่ทุกเวลา",
    welcome: "เข้าสู่ระบบ",
    subtitle: "เข้าสู่ระบบเพื่อจัดการต้นทุนงานพิมพ์ 3D ของคุณ",
    email: "อีเมล",
    password: "รหัสผ่าน",
    forgotPassword: "ลืมรหัสผ่าน?",
    rememberMe: "จดจำการเข้าสู่ระบบ",
    signIn: "เข้าสู่ระบบ",
    divider: "หรือ",
    google: "เข้าสู่ระบบด้วย Google",
    apple: "เข้าสู่ระบบด้วย Apple",
    noAccount: "ยังไม่มีบัญชี?",
    createAccount: "เริ่มทดลองใช้ฟรี",
    errorTitle: "เข้าสู่ระบบไม่สำเร็จ",
    features: [
      {
        title: "คำนวณต้นทุน FDM และ Resin",
        description: "คำนวณต้นทุนแยกตามประเภทงานพิมพ์ได้อย่างแม่นยำ",
      },
      {
        title: "ติดตามสต๊อกวัสดุ",
        description: "รู้จำนวนวัสดุคงเหลือและต้นทุนที่ใช้ไปในแต่ละงาน",
      },
      {
        title: "วิเคราะห์กำไรงานพิมพ์",
        description: "ดูได้ทันทีว่างานไหนกำไร และงานไหนควรปรับราคา",
      },
    ],
  },
  en: {
    heroTitle: "3D PrintCost Studio",
    heroAccent: "Calculate 3D print costs more accurately",
    heroTagline: "Manage material costs, electricity, printer time, stock, and FDM / Resin print profits in one system.",
    heroDescription: "",
    securityNote: "Your data is encrypted, securely stored, and ready whenever you need it.",
    welcome: "Welcome back",
    subtitle: "Sign in to manage your print jobs, costs, and studio data.",
    email: "Email",
    password: "Password",
    forgotPassword: "Forgot password?",
    rememberMe: "Keep me signed in",
    signIn: "Sign in",
    divider: "or",
    google: "Continue with Google",
    apple: "Continue with Apple",
    noAccount: "New here?",
    createAccount: "Create an account",
    errorTitle: "Sign in failed",
    features: [
      {
        title: "Calculate FDM and Resin costs",
        description: "Accurately calculate costs by print job type.",
      },
      {
        title: "Track material stock",
        description: "Know your remaining materials and the cost used in each job.",
      },
      {
        title: "Analyze print profits",
        description: "See which jobs are profitable and which ones need price adjustments.",
      },
    ],
  },
  zh: {
    heroTitle: "3D PrintCost Studio",
    heroAccent: "更精准地计算 3D 打印成本",
    heroTagline: "在一个系统中管理材料成本、电费、打印机时间、库存，以及 FDM / Resin 打印利润。",
    heroDescription: "",
    securityNote: "你的数据会被加密并安全存储，随时可用。",
    welcome: "登录",
    subtitle: "登录后继续管理你的 3D 打印成本。",
    email: "邮箱",
    password: "密码",
    forgotPassword: "忘记密码？",
    rememberMe: "记住登录状态",
    signIn: "登录",
    divider: "或",
    google: "使用 Google 登录",
    apple: "使用 Apple 登录",
    noAccount: "还没有账号？",
    createAccount: "免费开始试用",
    errorTitle: "登录失败",
    features: [
      {
        title: "计算 FDM 和 Resin 成本",
        description: "按打印任务类型精准计算成本。",
      },
      {
        title: "跟踪材料库存",
        description: "了解剩余材料数量，以及每个任务消耗的成本。",
      },
      {
        title: "分析打印利润",
        description: "立即查看哪些任务有利润，哪些任务需要调整价格。",
      },
    ],
  },
  ja: {
    heroTitle: "3D PrintCost Studio",
    heroAccent: "3Dプリントの原価をより正確に計算",
    heroTagline: "材料費、電気代、プリンター稼働時間、在庫、FDM / Resin のプリント利益をひとつのシステムで管理します。",
    heroDescription: "",
    securityNote: "あなたのデータは暗号化され、安全に保存され、必要なときにいつでも利用できます。",
    welcome: "ログイン",
    subtitle: "ログインして 3D プリント原価を管理しましょう。",
    email: "メールアドレス",
    password: "パスワード",
    forgotPassword: "パスワードをお忘れですか？",
    rememberMe: "ログイン状態を保持する",
    signIn: "ログイン",
    divider: "または",
    google: "Googleでログイン",
    apple: "Appleでログイン",
    noAccount: "アカウントをお持ちでないですか？",
    createAccount: "無料で始める",
    errorTitle: "ログインできませんでした",
    features: [
      {
        title: "FDM と Resin の原価を計算",
        description: "プリント作業の種類ごとに原価を正確に計算します。",
      },
      {
        title: "材料在庫を追跡",
        description: "残りの材料数と、各作業で使用したコストを把握できます。",
      },
      {
        title: "プリント利益を分析",
        description: "利益が出ている作業と、価格を見直すべき作業をすぐに確認できます。",
      },
    ],
  },
  ko: {
    heroTitle: "3D PrintCost Studio",
    heroAccent: "3D 프린트 작업 원가를 더 정확하게 계산",
    heroTagline: "재료비, 전기료, 프린터 작동 시간, 재고, FDM / Resin 프린트 작업 수익을 하나의 시스템에서 관리합니다.",
    heroDescription: "",
    securityNote: "사용자 데이터는 암호화되어 안전하게 저장되며, 언제든 사용할 수 있습니다.",
    welcome: "로그인",
    subtitle: "로그인하여 3D 출력 원가를 관리하세요.",
    email: "이메일",
    password: "비밀번호",
    forgotPassword: "비밀번호를 잊으셨나요?",
    rememberMe: "로그인 상태 유지",
    signIn: "로그인",
    divider: "또는",
    google: "Google로 로그인",
    apple: "Apple로 로그인",
    noAccount: "계정이 없으신가요?",
    createAccount: "무료로 시작하기",
    errorTitle: "로그인에 실패했습니다",
    features: [
      {
        title: "FDM 및 Resin 원가 계산",
        description: "프린트 작업 유형별로 원가를 정확하게 계산합니다.",
      },
      {
        title: "재료 재고 추적",
        description: "남은 재료 수량과 각 작업에 사용된 비용을 확인합니다.",
      },
      {
        title: "프린트 작업 수익 분석",
        description: "어떤 작업이 수익이 나는지, 어떤 작업의 가격을 조정해야 하는지 바로 확인합니다.",
      },
    ],
  },
} satisfies Record<LoginLanguage, {
  heroTitle: string;
  heroAccent: string;
  heroTagline: string;
  heroDescription: string;
  securityNote: string;
  welcome: string;
  subtitle: string;
  email: string;
  password: string;
  forgotPassword: string;
  rememberMe: string;
  signIn: string;
  divider: string;
  google: string;
  apple: string;
  noAccount: string;
  createAccount: string;
  errorTitle: string;
  features: Array<{ title: string; description: string }>;
}>;
const featureVisuals = [
  {
    icon: Box,
    tone: "from-blue-100 to-indigo-100 text-blue-600",
  },
  {
    icon: BarChart3,
    tone: "from-violet-100 to-purple-100 text-violet-600",
  },
  {
    icon: DollarSign,
    tone: "from-emerald-100 to-green-100 text-emerald-600",
  },
];

const legalCopy: Record<LoginLanguage, { privacy: string; terms: string }> = {
  th: { privacy: "นโยบายความเป็นส่วนตัว", terms: "ข้อกำหนดการใช้งาน" },
  en: { privacy: "Privacy Policy", terms: "Terms of Service" },
  zh: { privacy: "隐私政策", terms: "服务条款" },
  ja: { privacy: "プライバシーポリシー", terms: "利用規約" },
  ko: { privacy: "개인정보처리방침", terms: "이용약관" },
};

function getLanguage(value: string | undefined): LoginLanguage {
  return value === "en" || value === "zh" || value === "ja" || value === "ko" ? value : "th";
}

function loginMessageTitle(language: LoginLanguage) {
  const copy: Record<LoginLanguage, string> = {
    th: "แจ้งเตือน",
    en: "Notice",
    zh: "通知",
    ja: "お知らせ",
    ko: "알림",
  };

  return copy[language];
}
function GoogleMark() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; lang?: string; message?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const currentLanguage = getLanguage(params?.lang ?? (await detectAcceptLanguage()) ?? undefined);
  const copy = loginCopy[currentLanguage];

  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_10%_0%,#eaf3ff_0%,transparent_27%),radial-gradient(circle_at_92%_8%,#f4edff_0%,transparent_30%),linear-gradient(135deg,#f8fbff_0%,#eef5ff_100%)] px-6 py-3 text-slate-950">
      <section className="relative mx-auto grid h-auto w-full max-w-[1080px] overflow-hidden rounded-[28px] border border-white/90 bg-white shadow-[0_30px_95px_rgba(30,41,59,0.16)] min-[900px]:max-h-[calc(100vh-24px)] min-[900px]:grid-cols-[58fr_42fr]">
        <aside className="relative min-h-[420px] overflow-hidden bg-[linear-gradient(135deg,#f0f8ff_0%,#edf5ff_45%,#fbf1ff_100%)] px-6 py-8 sm:px-8 min-[900px]:block min-[900px]:px-10 min-[900px]:py-10">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-24 top-20 h-80 w-80 rotate-45 rounded-[5rem] bg-white/45" />
            <div className="absolute right-28 top-24 grid grid-cols-6 gap-3">
              {Array.from({ length: 24 }).map((_, index) => (
                <span key={index} className="h-1.5 w-1.5 rounded-full bg-indigo-300/45" />
              ))}
            </div>
            <div className="absolute right-16 top-52 h-40 w-40 rounded-full bg-violet-200/30 blur-sm" />
            <div className="absolute bottom-[-6rem] left-[-5rem] h-64 w-64 rounded-full bg-blue-200/35 blur-sm" />
            <div className="absolute bottom-5 left-[-9%] h-60 w-[121%] rounded-[50%] border-t border-blue-200/75" />
            <div className="absolute bottom-11 left-[-11%] h-60 w-[125%] rounded-[50%] border-t border-indigo-200/65" />
            <div className="absolute bottom-[4.25rem] left-[-13%] h-60 w-[129%] rounded-[50%] border-t border-violet-200/60" />
            <div className="absolute bottom-[5.75rem] left-[-15%] h-60 w-[133%] rounded-[50%] border-t border-blue-100/80" />
            <div className="absolute bottom-[8.5rem] left-[30%] h-72 w-[58%] rounded-[50%] bg-white/25 blur-2xl" />
          </div>

          <div className="relative z-10 flex min-h-full flex-col">
            <img
              alt="3D PrintCost Studio"
              className="h-14 w-auto object-contain object-left"
              src="/assets/official-3d-printcost-logo.png"
            />

            <div className="mt-10 max-w-[560px]">
              <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-[2.15rem]">
                {copy.heroTitle}
                <span className="mt-2 block text-[1.75rem] leading-tight text-blue-600 sm:text-[2rem]">{copy.heroAccent}</span>
              </h1>
              <p className="mt-5 text-base font-bold leading-7 text-slate-700 sm:text-lg">{copy.heroTagline}</p>
              {copy.heroDescription ? (
                <p className="mt-3 text-base leading-7 text-slate-600">{copy.heroDescription}</p>
              ) : null}
            </div>

            <div className="mt-2 grid max-w-[620px] grid-cols-1 gap-3 sm:grid-cols-3">
              {copy.features.map((feature, index) => {
                const visual = featureVisuals[index];
                const Icon = visual.icon;
                return (
                  <div
                    className="rounded-[16px] border border-white/70 bg-white/62 p-4 text-center shadow-[0_18px_50px_rgba(90,105,150,0.12)] backdrop-blur-xl"
                    key={feature.title}
                  >
                    <div
                      className={"mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br " + visual.tone}
                    >
                      <Icon className="h-7 w-7" strokeWidth={2.2} />
                    </div>
                    <h2 className="text-base font-black leading-6 text-slate-950">{feature.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-auto flex items-center gap-3 text-sm font-semibold text-slate-500">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500 text-white shadow-lg shadow-blue-300/50">
                <ShieldCheck className="h-4 w-4" />
              </span>
              {copy.securityNote}
            </div>
          </div>
        </aside>

        <section className="flex min-h-[520px] flex-col bg-white px-5 py-5 sm:px-8 min-[900px]:px-9 min-[900px]:py-6">
          <div className="flex justify-end">
            <LoginLanguageSelect current={currentLanguage} />
          </div>

          <div className="flex flex-1 items-center justify-center py-4">
            <div className="w-full max-w-[400px]">
              <img
                alt="3D PrintCost Studio"
                className="mb-8 h-14 w-auto object-contain object-left min-[900px]:hidden"
                src="/assets/official-3d-printcost-logo.png"
              />

              <div className="mb-7">
                <h2 className="text-3xl font-black tracking-tight text-slate-950">{copy.welcome}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base sm:leading-7">{copy.subtitle}</p>
              </div>

              <form action={signInWithPassword} className="space-y-4" noValidate>
                <input name="lang" type="hidden" value={currentLanguage} />
                {params?.error ? (
                  <p className="-mb-1 text-sm font-black leading-6 text-red-600" role="alert">
                    {copy.errorTitle}: {params.error}
                  </p>
                ) : null}
                {params?.message ? (
                  <p className="-mb-1 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black leading-6 text-emerald-700" role="status">
                    {loginMessageTitle(currentLanguage)}: {params.message}
                  </p>
                ) : null}
                <label className="block">
                  <span className="mb-2 block text-sm font-black text-slate-950">{copy.email}</span>
                  <span className={(params?.error ? "border-red-300 ring-4 ring-red-50 " : "border-slate-200 focus-within:border-blue-400 focus-within:ring-blue-100 ") + "flex h-12 items-center gap-3 rounded-xl border bg-white px-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition focus-within:ring-4"}>
                    <Mail className="h-5 w-5 text-slate-400" />
                    <input
                      aria-label={copy.email}
                      autoComplete="email"
                      className="h-full min-w-0 flex-1 bg-transparent text-base font-semibold text-slate-950 outline-none placeholder:text-slate-400"
                      name="email"
                      placeholder="name@example.com"
                      required
                      type="email"
                    />
                  </span>
                </label>

                <label className="block">
                  <span className="mb-2 flex items-center justify-between text-sm font-black text-slate-950">
                    {copy.password}
                    <a className="text-sm font-bold text-blue-600 hover:text-blue-700" href={`/forgot-password?lang=${currentLanguage}`}>
                      {copy.forgotPassword}
                    </a>
                  </span>
                  <span className="flex h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
                    <LockKeyhole className="h-5 w-5 text-slate-400" />
                    <input
                      aria-label={copy.password}
                      autoComplete="current-password"
                      className="h-full min-w-0 flex-1 bg-transparent text-base font-semibold text-slate-950 outline-none placeholder:text-slate-400"
                      name="password"
                      placeholder="********"
                      required
                      type="password"
                    />
                  </span>
                </label>

                <label className="flex items-center gap-3 text-sm font-semibold text-slate-500">
                  <input
                    className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    defaultChecked
                    type="checkbox"
                  />
                  {copy.rememberMe}
                </label>

                <PendingSubmitButton
                  className="flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-blue-600 text-base font-black text-white shadow-[0_18px_45px_rgba(37,99,235,0.32)] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-500"
                  icon={<LockKeyhole className="h-5 w-5" />}
                  idleText={copy.signIn}
                  pendingText="กำลังเข้าสู่ระบบ..."
                />
              </form>

              <div className="my-6 flex items-center gap-4 text-sm font-semibold text-slate-400">
                <span className="h-px flex-1 bg-slate-200" />
                {copy.divider}
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              <div className="space-y-3">
                <form action={signInWithOAuth}>
                  <input name="lang" type="hidden" value={currentLanguage} />
                  <input name="provider" type="hidden" value="google" />
                  <PendingSubmitButton
                    className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-sm font-black text-slate-800 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition hover:border-blue-200 hover:bg-blue-50/40 disabled:cursor-not-allowed disabled:opacity-70 sm:text-base"
                    icon={<GoogleMark />}
                    idleText={copy.google}
                    pendingText="กำลังเชื่อมต่อกับ Google..."
                  />
                </form>
              </div>

              <p className="mt-6 text-center text-sm font-semibold text-slate-500">
                {copy.noAccount}{" "}
                <a className="font-black text-blue-600 hover:text-blue-700" href={`/signup?lang=${currentLanguage}`}>
                  {copy.createAccount}
                </a>
              </p>

              <p className="mt-4 text-center text-xs font-semibold text-slate-400">
                <a className="underline-offset-2 hover:text-slate-600 hover:underline" href="/privacy">
                  {legalCopy[currentLanguage].privacy}
                </a>
                <span className="mx-2">·</span>
                <a className="underline-offset-2 hover:text-slate-600 hover:underline" href="/terms">
                  {legalCopy[currentLanguage].terms}
                </a>
              </p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
