import { BarChart3, Box, DollarSign, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { signInWithOAuth, signInWithPassword, signUpWithPassword } from "./actions";

const features = [
  {
    icon: Box,
    title: "รองรับ FDM และ Resin",
    description: "คำนวณต้นทุนได้ครบทุกประเภทการพิมพ์",
    tone: "from-blue-100 to-indigo-100 text-blue-600",
  },
  {
    icon: BarChart3,
    title: "ติดตามต้นทุนอัตโนมัติ",
    description: "บันทึกการใช้วัสดุและคำนวณต้นทุนให้อัตโนมัติ",
    tone: "from-violet-100 to-purple-100 text-violet-600",
  },
  {
    icon: DollarSign,
    title: "วิเคราะห์กำไรต่อชิ้นงาน",
    description: "วิเคราะห์กำไรต่อชิ้นงานและช่วยตัดสินใจได้ดีขึ้น",
    tone: "from-emerald-100 to-green-100 text-emerald-600",
  },
];

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

function AppleMark() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 shrink-0 fill-black" viewBox="0 0 24 24">
      <path d="M16.53 12.4c-.03-3.03 2.48-4.49 2.6-4.56-1.42-2.08-3.63-2.36-4.4-2.39-1.87-.19-3.65 1.1-4.6 1.1-.94 0-2.39-1.07-3.94-1.04-2.03.03-3.9 1.18-4.95 3C-.88 12.18.7 17.61 2.76 20.59c1.01 1.46 2.22 3.1 3.8 3.04 1.53-.06 2.1-.98 3.94-.98s2.36.98 3.97.95c1.64-.03 2.68-1.49 3.68-2.96 1.16-1.7 1.64-3.35 1.67-3.43-.04-.02-3.25-1.25-3.29-4.81zM13.51 3.48C14.35 2.46 14.92 1.04 14.77 0c-1.21.05-2.67.81-3.54 1.82-.78.9-1.46 2.35-1.28 3.73 1.35.1 2.72-.69 3.56-2.07z" />
    </svg>
  );
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; message?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_10%_0%,#eaf3ff_0%,transparent_27%),radial-gradient(circle_at_92%_8%,#f4edff_0%,transparent_30%),linear-gradient(135deg,#f8fbff_0%,#eef5ff_100%)] px-4 py-5 text-slate-950 sm:px-6 lg:px-[28px]">
      <section className="relative mx-auto grid min-h-[calc(100vh-40px)] w-full max-w-[1626px] overflow-hidden rounded-[28px] border border-white/90 bg-white shadow-[0_30px_95px_rgba(30,41,59,0.16)] lg:grid-cols-[1.48fr_1fr]">
        <aside className="relative hidden min-h-[720px] overflow-hidden bg-[linear-gradient(135deg,#f0f8ff_0%,#edf5ff_45%,#fbf1ff_100%)] px-8 py-12 sm:px-12 lg:block lg:px-[96px] lg:py-[92px]">
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
              className="h-[92px] w-auto object-contain object-left"
              src="/assets/official-3d-printcost-logo.png"
            />

            <div className="mt-24 max-w-[660px]">
              <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-[3.2rem]">
                คำนวณต้นทุนงานพิมพ์ 3D
                <span className="mt-2 block text-blue-600">อย่างแม่นยำ</span>
              </h1>
              <p className="mt-8 text-2xl font-bold leading-relaxed text-slate-700">
                ติดตามวัสดุ • คำนวณกำไร • จัดการสต็อก
              </p>
              <p className="mt-3 text-lg leading-8 text-slate-600">
                จัดการข้อมูลงานพิมพ์ของคุณได้อย่างมีประสิทธิภาพ เพิ่มกำไร ลดต้นทุน ตัดสินใจได้ดีขึ้น
              </p>
            </div>

            <div className="mt-16 grid max-w-[760px] grid-cols-3 gap-6">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    className="rounded-[18px] border border-white/70 bg-white/62 p-6 text-center shadow-[0_18px_50px_rgba(90,105,150,0.12)] backdrop-blur-xl"
                    key={feature.title}
                  >
                    <div
                      className={`mx-auto mb-5 flex h-[68px] w-[68px] items-center justify-center rounded-3xl bg-gradient-to-br ${feature.tone}`}
                    >
                      <Icon className="h-9 w-9" strokeWidth={2.2} />
                    </div>
                    <h2 className="text-lg font-black text-slate-950">{feature.title}</h2>
                    <p className="mt-3 text-base leading-7 text-slate-600">{feature.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-auto flex items-center gap-3 text-sm font-semibold text-slate-500">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500 text-white shadow-lg shadow-blue-300/50">
                <ShieldCheck className="h-4 w-4" />
              </span>
              ปลอดภัย น่าเชื่อถือ ข้อมูลของคุณจะถูกเข้ารหัสและเก็บรักษาอย่างปลอดภัย
            </div>
          </div>
        </aside>

        <section className="flex min-h-[720px] items-center justify-center bg-white px-6 py-12 sm:px-10 lg:px-[70px]">
          <div className="w-full max-w-[540px]">
            <img
              alt="3D PrintCost Studio"
              className="mb-12 h-20 w-auto object-contain object-left lg:hidden"
              src="/assets/official-3d-printcost-logo.png"
            />

            <div className="mb-10">
              <h2 className="text-4xl font-black tracking-tight text-slate-950">ยินดีต้อนรับกลับ</h2>
              <p className="mt-4 text-lg leading-8 text-slate-500">
                เข้าสู่ระบบเพื่อใช้งานข้อมูลและงานพิมพ์ของคุณ
              </p>
            </div>

            {params?.error ? (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {params.error}
              </div>
            ) : null}

            <form action={signInWithPassword} className="space-y-7">
              <label className="block">
                <span className="mb-3 block text-base font-black text-slate-950">อีเมล</span>
                <span className="flex h-16 items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
                  <Mail className="h-6 w-6 text-slate-400" />
                  <input
                    autoComplete="email"
                    className="h-full min-w-0 flex-1 bg-transparent text-lg font-semibold text-slate-950 outline-none placeholder:text-slate-400"
                    name="email"
                    placeholder="name@example.com"
                    required
                    type="email"
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-3 flex items-center justify-between text-base font-black text-slate-950">
                  รหัสผ่าน
                  <a className="text-sm font-bold text-blue-600 hover:text-blue-700" href="#">
                    ลืมรหัสผ่าน?
                  </a>
                </span>
                <span className="flex h-16 items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
                  <LockKeyhole className="h-6 w-6 text-slate-400" />
                  <input
                    autoComplete="current-password"
                    className="h-full min-w-0 flex-1 bg-transparent text-lg font-semibold text-slate-950 outline-none placeholder:text-slate-400"
                    name="password"
                    placeholder="••••••••"
                    required
                    type="password"
                  />
                </span>
              </label>

              <label className="flex items-center gap-3 text-base font-semibold text-slate-500">
                <input
                  className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  defaultChecked
                  type="checkbox"
                />
                จดจำฉันไว้ในระบบ
              </label>

              <button
                className="flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 text-xl font-black text-white shadow-[0_18px_45px_rgba(37,99,235,0.32)] transition hover:bg-blue-700"
                type="submit"
              >
                <LockKeyhole className="h-6 w-6" />
                เข้าสู่ระบบ
              </button>
            </form>

            <div className="my-9 flex items-center gap-4 text-base font-semibold text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              หรือ
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="space-y-4">
              <form action={signInWithOAuth}>
                <input name="provider" type="hidden" value="google" />
                <button
                  className="flex h-16 w-full items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white text-lg font-black text-slate-800 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition hover:border-blue-200 hover:bg-blue-50/40"
                  type="submit"
                >
                  <GoogleMark />
                  เข้าสู่ระบบด้วย Google
                </button>
              </form>

              <form action={signInWithOAuth}>
                <input name="provider" type="hidden" value="apple" />
                <button
                  className="flex h-16 w-full items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white text-lg font-black text-slate-800 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition hover:border-slate-300 hover:bg-slate-50"
                  type="submit"
                >
                  <AppleMark />
                  เข้าสู่ระบบด้วย Apple
                </button>
              </form>
            </div>

            <form action={signUpWithPassword} className="mt-9 text-center">
              <input name="email" type="hidden" value="" />
              <input name="password" type="hidden" value="" />
              <p className="text-base font-semibold text-slate-500">
                ยังไม่มีบัญชี?{" "}
                <button className="font-black text-blue-600 hover:text-blue-700" type="submit">
                  สร้างบัญชีใหม่
                </button>
              </p>
            </form>
          </div>
        </section>
      </section>
    </main>
  );
}
