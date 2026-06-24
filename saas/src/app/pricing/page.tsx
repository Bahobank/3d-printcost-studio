import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Headphones,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Star,
  X,
  RefreshCw,
  Boxes,
  FlaskConical,
} from "lucide-react";
import { getSessionAndProfile } from "@/lib/subscription";

const makerFeatures = [
  "คำนวณต้นทุน FDM",
  "จัดการสต็อก Filament",
  "ติดตามกำไร",
  "Dashboard",
  "ประวัติงานพิมพ์",
];

const studioFeatures = [
  "ทุกอย่างใน Maker",
  "คำนวณต้นทุน Resin",
  "จัดการสต็อก Resin",
  "คำนวณค่า Wash & Cure",
  "Dashboard Resin",
  "รายงานรวม FDM + Resin",
];

function Benefit({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-violet-50 text-violet-600">
        {icon}
      </span>
      {text}
    </div>
  );
}

function PlanCard({
  title,
  badge,
  icon,
  price,
  features,
  recommended,
}: {
  title: string;
  badge: string;
  icon: React.ReactNode;
  price: string;
  features: string[];
  recommended?: boolean;
}) {
  return (
    <article
      className={[
        "relative flex min-h-[430px] flex-col rounded-[1.75rem] border bg-white/95 p-8 shadow-[0_20px_55px_rgba(15,23,42,0.08)]",
        recommended
          ? "border-violet-500 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.12),rgba(255,255,255,0.96)_42%)]"
          : "border-slate-200",
      ].join(" ")}
    >
      {recommended ? (
        <div className="absolute -top-4 right-8 inline-flex items-center gap-2 rounded-full bg-violet-700 px-5 py-2 text-sm font-black text-white shadow-lg shadow-violet-200">
          <Star size={16} fill="currentColor" />
          แนะนำ
        </div>
      ) : null}

      <div className="flex items-start gap-5">
        <div
          className={[
            "grid h-20 w-20 shrink-0 place-items-center rounded-full",
            recommended ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-600",
          ].join(" ")}
        >
          {icon}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-black tracking-tight text-slate-950">{title}</h2>
            <span
              className={[
                "rounded-full px-3 py-1 text-sm font-black",
                recommended ? "bg-violet-100 text-violet-700" : "bg-blue-50 text-blue-700",
              ].join(" ")}
            >
              {badge}
            </span>
          </div>
          <p className="mt-2 text-base font-semibold text-slate-500">
            {recommended ? "ครบทุกฟีเจอร์ สำหรับมืออาชีพ" : "สำหรับผู้ใช้งานเครื่องพิมพ์ FDM เท่านั้น"}
          </p>
        </div>
      </div>

      <div className="my-7 h-px bg-slate-200" />

      <div className="flex items-end gap-3">
        <span className={["text-6xl font-black", recommended ? "text-violet-700" : "text-blue-600"].join(" ")}>
          {price}
        </span>
        <span className="pb-3 text-xl font-black text-slate-950">บาท / เดือน</span>
      </div>

      <ul className="mt-5 flex-1 space-y-3">
        {features.map((feature) => (
          <li className="flex items-center gap-3 text-base font-bold text-slate-800" key={feature}>
            <CheckCircle2
              className={recommended ? "text-violet-700" : "text-blue-600"}
              size={20}
              fill="currentColor"
              strokeWidth={3}
            />
            {feature}
          </li>
        ))}
      </ul>

      <Link
        className={[
          "mt-8 grid h-14 place-items-center rounded-xl text-xl font-black transition hover:-translate-y-0.5",
          recommended
            ? "bg-gradient-to-r from-violet-700 to-indigo-600 text-white shadow-lg shadow-violet-200"
            : "border-2 border-blue-600 bg-white text-blue-700 hover:bg-blue-50",
        ].join(" ")}
        href="/dashboard"
      >
        ทดลองใช้ฟรี 7 วัน
      </Link>
      <p className="mt-4 text-center text-sm font-semibold text-slate-500">ไม่ต้องใช้บัตรเครดิต</p>
    </article>
  );
}

export default async function PricingPage() {
  await getSessionAndProfile();

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-5 py-8 text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.35),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(124,58,237,0.32),transparent_30%),linear-gradient(135deg,#071533,#111827)]" />
      <div className="absolute inset-0 opacity-35 blur-sm">
        <div className="mx-auto grid h-full max-w-7xl grid-cols-[260px_1fr] gap-6 p-8">
          <div className="rounded-[2rem] bg-white/15" />
          <div className="grid gap-5">
            <div className="rounded-[2rem] bg-white/20" />
            <div className="grid grid-cols-3 gap-5">
              <div className="rounded-[2rem] bg-white/15" />
              <div className="rounded-[2rem] bg-white/15" />
              <div className="rounded-[2rem] bg-white/15" />
            </div>
          </div>
        </div>
      </div>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1280px] items-center justify-center">
        <div className="relative w-full rounded-[2.25rem] border border-white/90 bg-white px-8 py-10 shadow-[0_30px_90px_rgba(2,6,23,0.35)] sm:px-12 lg:px-16">
          <Link
            aria-label="ปิด"
            className="absolute right-7 top-7 grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-950 transition hover:bg-slate-200"
            href="/dashboard"
          >
            <X size={30} strokeWidth={2.5} />
          </Link>
          <Link
            className="absolute left-7 top-7 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition hover:border-violet-200 hover:text-violet-700"
            href="/logout"
          >
            ออกจากระบบ
          </Link>

          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-violet-50 text-violet-700">
              <Sparkles size={34} strokeWidth={2.5} />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              เริ่มต้นใช้งานฟรี <span className="text-violet-700">7 วัน</span>
            </h1>
            <p className="mt-3 text-xl font-semibold text-slate-500">
              ลองใช้ทุกฟีเจอร์ เลือกแผนที่ใช่สำหรับธุรกิจคุณ
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-5">
              <Benefit icon={<CalendarDays size={16} />} text="ใช้ฟรี 7 วันเต็ม" />
              <div className="hidden h-5 w-px bg-slate-200 sm:block" />
              <Benefit icon={<ShieldCheck size={16} />} text="ยกเลิกได้ทุกเมื่อ" />
              <div className="hidden h-5 w-px bg-slate-200 sm:block" />
              <Benefit icon={<LockKeyhole size={16} />} text="ข้อมูลปลอดภัย 100%" />
            </div>

            <div className="mx-auto mt-7 grid h-16 max-w-[560px] grid-cols-2 rounded-full bg-slate-100 p-1.5 shadow-inner">
              <button className="rounded-full bg-gradient-to-r from-violet-700 to-indigo-600 text-xl font-black text-white shadow-lg shadow-violet-200">
                รายเดือน
              </button>
              <button className="rounded-full text-xl font-black text-slate-600">รายปี (ประหยัด 25%)</button>
            </div>
          </div>

          <div className="mx-auto mt-9 grid max-w-[980px] gap-8 lg:grid-cols-2">
            <PlanCard
              badge="FDM Only"
              features={makerFeatures}
              icon={<Boxes size={42} strokeWidth={2.2} />}
              price="199"
              title="Maker"
            />
            <PlanCard
              badge="FDM + Resin"
              features={studioFeatures}
              icon={<FlaskConical size={42} strokeWidth={2.2} />}
              price="299"
              recommended
              title="Studio"
            />
          </div>

          <div className="mx-auto mt-9 grid max-w-[980px] gap-5 border-t border-slate-200 pt-7 md:grid-cols-3">
            <div className="flex items-center gap-4">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-violet-50 text-violet-700">
                <ShieldCheck size={30} />
              </span>
              <div>
                <p className="text-lg font-black text-slate-950">ข้อมูลปลอดภัย 100%</p>
                <p className="text-sm font-semibold text-slate-500">เข้ารหัสด้วยมาตรฐานสากล</p>
              </div>
            </div>
            <div className="flex items-center gap-4 md:border-l md:border-slate-200 md:pl-8">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                <RefreshCw size={30} />
              </span>
              <div>
                <p className="text-lg font-black text-slate-950">ยกเลิกได้ทุกเมื่อ</p>
                <p className="text-sm font-semibold text-slate-500">ไม่มีสัญญาผูกมัด</p>
              </div>
            </div>
            <div className="flex items-center gap-4 md:border-l md:border-slate-200 md:pl-8">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-violet-50 text-violet-700">
                <Headphones size={30} />
              </span>
              <div>
                <p className="text-lg font-black text-slate-950">Support พร้อมช่วยเหลือ</p>
                <p className="text-sm font-semibold text-slate-500">จันทร์ - อาทิตย์ 9:00 - 18:00 น.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
