"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, X } from "lucide-react";

type Lang = "th" | "en" | "zh" | "ja" | "ko";
const LANGS: Lang[] = ["th", "en", "zh", "ja", "ko"];

const REDIRECTING: Record<Lang, string> = {
  th: "กำลังกลับสู่หน้าโปรแกรม...",
  en: "Returning to the app...",
  zh: "正在返回应用...",
  ja: "アプリに戻っています...",
  ko: "앱으로 돌아가는 중...",
};

const MESSAGES: Record<string, Record<Lang, { title: string; body: string }>> = {
  success: {
    th: { title: "ชำระเงินสำเร็จ", body: "ระบบกำลังเปิดใช้งานแพ็กเกจให้คุณ" },
    en: { title: "Payment successful", body: "We're activating your plan now." },
    zh: { title: "支付成功", body: "正在为你开通套餐。" },
    ja: { title: "お支払い完了", body: "プランを有効化しています。" },
    ko: { title: "결제 완료", body: "요금제를 활성화하고 있습니다." },
  },
  "access-success": {
    th: { title: "เปิดใช้งานสำเร็จ", body: "ยืนยัน Access Code และเปิดแพ็กเกจให้แล้ว" },
    en: { title: "Activated", body: "Your access code is confirmed and the plan is active." },
    zh: { title: "已激活", body: "访问码已确认，套餐已开通。" },
    ja: { title: "有効化しました", body: "アクセスコードを確認し、プランを有効化しました。" },
    ko: { title: "활성화됨", body: "액세스 코드가 확인되어 요금제가 활성화되었습니다." },
  },
  "wallet-topup-success": {
    th: { title: "เติมเงินสำเร็จ", body: "ยอด Wallet จะถูกเพิ่มให้อัตโนมัติ" },
    en: { title: "Top-up successful", body: "Your Wallet balance will be added automatically." },
    zh: { title: "充值成功", body: "钱包余额将自动添加。" },
    ja: { title: "チャージ完了", body: "ウォレット残高が自動で追加されます。" },
    ko: { title: "충전 완료", body: "지갑 잔액이 자동으로 추가됩니다." },
  },
};

function detectLang(): Lang {
  try {
    const raw = (window.localStorage.getItem("printCostLanguage") || window.localStorage.getItem("language") || document.documentElement.lang || navigator.language || "th").toLowerCase().split("-")[0];
    return (LANGS as string[]).includes(raw) ? (raw as Lang) : "th";
  } catch {
    return "th";
  }
}

export function CheckoutSuccessPopup() {
  const params = useSearchParams();
  const checkout = params.get("checkout") ?? "";
  const active = checkout in MESSAGES;
  const [lang, setLang] = useState<Lang>("th");

  useEffect(() => {
    setLang(detectLang());
  }, []);

  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => {
      window.location.href = "/dashboard";
    }, 3500);
    return () => clearTimeout(timer);
  }, [active]);

  if (!active) return null;

  const msg = MESSAGES[checkout][lang] ?? MESSAGES[checkout].en;
  const close = () => {
    window.location.href = "/dashboard";
  };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/60 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-7 text-center shadow-[0_30px_90px_rgba(2,6,23,0.4)]">
        <button aria-label="close" className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100" onClick={close} type="button">
          <X size={18} />
        </button>
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={38} strokeWidth={2.5} />
        </div>
        <h2 className="mt-4 text-2xl font-black text-slate-950">{msg.title}</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{msg.body}</p>
        <p className="mt-3 text-xs font-bold text-slate-400">{REDIRECTING[lang]}</p>
      </div>
    </div>
  );
}
