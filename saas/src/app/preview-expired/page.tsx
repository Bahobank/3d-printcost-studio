"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PricingDialog, type PricingLanguage } from "@/components/pricing-modal";

const LANGS: PricingLanguage[] = ["th", "en", "zh", "ja", "ko"];

const CARD: Record<PricingLanguage, { title: string; subtitle: string; safe: string }> = {
  th: { title: "ทดลองใช้ฟรีครบ 7 วันแล้ว", subtitle: "เลือกแผนที่เหมาะกับธุรกิจของคุณเพื่อใช้งานต่อ", safe: "ข้อมูลของคุณยังถูกเก็บไว้อย่างปลอดภัย" },
  en: { title: "Your 7-day free trial has ended", subtitle: "Choose a plan that fits your business to continue.", safe: "Your data is still safely stored." },
  zh: { title: "您的 7 天免费试用已结束", subtitle: "选择适合您业务的方案以继续使用。", safe: "您的数据仍安全保存。" },
  ja: { title: "7日間の無料トライアルが終了しました", subtitle: "続けるにはビジネスに合ったプランを選択してください。", safe: "データは安全に保管されています。" },
  ko: { title: "7일 무료 체험이 종료되었습니다", subtitle: "계속하려면 비즈니스에 맞는 요금제를 선택하세요.", safe: "데이터는 안전하게 보관되어 있습니다." },
};

function PreviewInner() {
  const params = useSearchParams();
  const raw = params.get("lang") ?? "th";
  const language: PricingLanguage = (LANGS as string[]).includes(raw) ? (raw as PricingLanguage) : "th";
  const card = CARD[language];

  return (
    <main className="relative min-h-screen bg-slate-950 text-slate-950">
      {/* language switcher for the preview only */}
      <div className="fixed left-4 top-4 z-[80] flex flex-wrap gap-2">
        {LANGS.map((l) => (
          <a
            key={l}
            href={`/preview-expired?lang=${l}`}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold ${l === language ? "bg-blue-600 text-white" : "bg-white/90 text-slate-700"}`}
          >
            {l.toUpperCase()}
          </a>
        ))}
      </div>

      {/* the blocked-app background card */}
      <section className="grid min-h-screen place-items-center px-5">
        <div className="max-w-xl rounded-2xl bg-white p-8 text-center shadow-2xl">
          <h1 className="text-3xl font-black">{card.title}</h1>
          <p className="mt-2 font-semibold text-slate-500">{card.subtitle}</p>
          <p className="mt-4 text-sm font-bold text-emerald-700">{card.safe}</p>
        </div>
      </section>

      {/* the auto-opened, locked paywall */}
      <PricingDialog open expired locked language={language} currentCycle={null} currentPlan={null} onClose={() => {}} />
    </main>
  );
}

export default function PreviewExpiredPage() {
  return (
    <Suspense fallback={null}>
      <PreviewInner />
    </Suspense>
  );
}
