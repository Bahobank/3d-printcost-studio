"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PricingDialog } from "@/components/pricing-modal";

type PricingLanguage = "th" | "en" | "zh" | "ja" | "ko";

const languageCodes = new Set<PricingLanguage>(["th", "en", "zh", "ja", "ko"]);

export function normalizePricingLanguage(value: unknown): PricingLanguage {
  const text = String(value ?? "").toLowerCase();
  const shortCode = text.split("-")[0] as PricingLanguage;
  return languageCodes.has(shortCode) ? shortCode : "th";
}

const pageCopy: Record<PricingLanguage, { subtitle: string }> = {
  th: { subtitle: "เลือกแพ็กเกจที่เหมาะกับธุรกิจของคุณ" },
  en: { subtitle: "Choose the plan that fits your business" },
  zh: { subtitle: "选择适合你业务的套餐" },
  ja: { subtitle: "ビジネスに合うプランを選択" },
  ko: { subtitle: "비즈니스에 맞는 요금제를 선택하세요" },
};

export function PricingPageClient({ language }: { language: PricingLanguage }) {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  function closePricing() {
    setOpen(false);
    router.push("/dashboard");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-5 py-8 text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.35),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(124,58,237,0.32),transparent_30%),linear-gradient(135deg,#071533,#111827)]" />
      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl place-items-center text-center text-white">
        <div>
          <h1 className="text-4xl font-black">3D PrintCost Studio</h1>
          <p className="mt-3 text-lg font-semibold text-blue-100">{pageCopy[language].subtitle}</p>
        </div>
      </div>
      <PricingDialog expired={false} language={language} locked={false} onClose={closePricing} open={open} />
    </main>
  );
}