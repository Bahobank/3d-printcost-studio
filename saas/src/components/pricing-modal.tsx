"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Boxes, CheckCircle2, CreditCard, FlaskConical, Info, QrCode, ShieldCheck, Star, Tag, Wallet, X } from "lucide-react";
import { getPlanAmount } from "@/lib/billing-plans";
import type { UserProfile } from "@/lib/subscription";

type BillingCycle = "monthly" | "yearly";
type PlanKey = "maker" | "studio";
type PricingLanguage = "th" | "en" | "zh" | "ja" | "ko";

type PricingDialogProps = {
  expired?: boolean;
  language?: PricingLanguage;
  locked?: boolean;
  onClose?: () => void;
  open: boolean;
};

type TrialSubscriptionControlProps = {
  canUseApp: boolean;
  daysLeft: number;
  hideTrigger?: boolean;
  listenForLegacyOpen?: boolean;
  profile: UserProfile;
};

type PlanCopy = {
  badge: string;
  description: string;
  features: string[];
  title: string;
};

type PromoState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "invalid" }
  | { discountAmount: number; finalAmount: number; status: "valid"; type: "discount" | "access" };

type PricingCopy = {
  accessCodeReady: string;
  applyPromo: string;
  autoRenewal: string;
  back: string;
  billingMonthly: string;
  billingYearly: string;
  byBaho: string;
  cancelAnytime: string;
  cardCta: string;
  cardSubtitle: string;
  cardTitle: string;
  checkoutDataSafe: string;
  choosePaymentSubtitle: string;
  choosePaymentTitlePrefix: string;
  currentBalance: string;
  expiredDataSafe: string;
  expiredSubtitle: string;
  expiredTitle: string;
  footer: string;
  instantActivation: string;
  lowBalance: string;
  monthlyUnit: string;
  noAutoRenewal: string;
  oneTimePayment: string;
  payWithWallet: string;
  paymentSecure: string;
  plans: Record<PlanKey, PlanCopy>;
  priceLabel: string;
  promoDiscount: string;
  promoInvalid: string;
  promoLabel: string;
  promoPlaceholder: string;
  promptPayCta: string;
  promptPayNote: string;
  promptPaySubtitle: string;
  promptPayTitle: string;
  qrPayment: string;
  recommended: string;
  remainingBalance: string;
  saveYearly: string;
  securePayment: string;
  selectPlanCta: string;
  selectedPlan: string;
  statusExpired: string;
  statusPastDue: string;
  statusTrialPrefix: string;
  statusTrialSuffix: string;
  subtitle: string;
  title: string;
  topUp: string;
  topUpAmountLabel: string;
  topUpCustom: string;
  topUpMethodAuto: string;
  topUpMethodLabel: string;
  topUpMethodPromptPay: string;
  trialOneDayCta: string;
  trialOneDayText: string;
  walletSubtitle: string;
  walletTitle: string;
  yearlyChargePrefix: string;
};

const defaultLanguage: PricingLanguage = "th";
const languageCodes = new Set<PricingLanguage>(["th", "en", "zh", "ja", "ko"]);
const languageTags: Record<PricingLanguage, string> = {
  th: "th-TH",
  en: "en-US",
  zh: "en-US",
  ja: "en-US",
  ko: "en-US",
};
const topUpAmounts = [100, 300, 500, 1000, 2000];

export function normalizePricingLanguage(value: unknown): PricingLanguage {
  const text = String(value ?? "").toLowerCase();
  const shortCode = text.split("-")[0] as PricingLanguage;
  return languageCodes.has(shortCode) ? shortCode : defaultLanguage;
}

function formatCurrency(amount: number, language: PricingLanguage) {
  return new Intl.NumberFormat(languageTags[language], {
    currency: "THB",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amount);
}

const thCopy: PricingCopy = {
  title: "เลือกแพ็กเกจ 3D PrintCost Studio",
  expiredTitle: "ทดลองใช้ฟรี 7 วันสิ้นสุดแล้ว",
  subtitle: "เลือกแพ็กเกจที่เหมาะกับงานพิมพ์ของคุณ เพื่อสมัครใช้งานต่อเนื่อง",
  expiredSubtitle: "เลือกแพ็กเกจเพื่อใช้งานต่อ ข้อมูลทั้งหมดของคุณยังคงอยู่ครบถ้วน",
  expiredDataSafe: "ข้อมูลการพิมพ์ สต๊อก และประวัติงานของคุณยังคงอยู่ครบถ้วน",
  billingMonthly: "รายเดือน",
  billingYearly: "รายปี",
  saveYearly: "ประหยัด 25%",
  monthlyUnit: "/ เดือน",
  yearlyChargePrefix: "ชำระรายปี",
  cancelAnytime: "ยกเลิกได้ทุกเมื่อ",
  recommended: "แนะนำ",
  footer: "ข้อมูลของคุณเข้ารหัสและปลอดภัย",
  choosePaymentTitlePrefix: "เลือกแพ็กเกจ",
  choosePaymentSubtitle: "เลือกวิธีชำระเงินที่สะดวกสำหรับคุณ",
  selectedPlan: "แพ็กเกจที่เลือก",
  selectPlanCta: "เลือกแพ็กเกจ",
  priceLabel: "ราคา",
  checkoutDataSafe: "ข้อมูลการพิมพ์ สต๊อก และประวัติงานทั้งหมดของคุณจะยังคงอยู่ครบถ้วนหลังอัปเกรด",
  cardTitle: "บัตรเครดิต / เดบิต, Apple Pay, Google Pay",
  cardSubtitle: "ชำระผ่าน Stripe และต่ออายุอัตโนมัติทุกเดือนหรือทุกปี",
  cardCta: "ไปหน้า Stripe Checkout",
  promptPayTitle: "PromptPay (ลูกค้าไทย)",
  promptPaySubtitle: "ชำระด้วย QR Code ผ่าน Stripe PromptPay",
  promptPayNote: "PromptPay เป็นการชำระเงินครั้งเดียวและไม่ต่ออายุอัตโนมัติ เมื่อครบกำหนด กรุณาชำระเงินอีกครั้งเพื่อใช้งานต่อ",
  promptPayCta: "ชำระผ่าน Stripe PromptPay",
  walletTitle: "Wallet",
  walletSubtitle: "ใช้ยอดเงินใน Wallet เพื่อชำระแพ็กเกจ (เติมเงินผ่าน PromptPay หรือบัตรได้)",
  payWithWallet: "ใช้ Wallet ชำระเงิน",
  topUp: "เติมเงิน Wallet",
  topUpAmountLabel: "ยอดเติมเงิน",
  topUpCustom: "จำนวนอื่น",
  topUpMethodAuto: "บัตร / Apple Pay / Google Pay",
  topUpMethodLabel: "วิธีเติมเงิน",
  topUpMethodPromptPay: "PromptPay",
  currentBalance: "ยอดคงเหลือ",
  remainingBalance: "ยอดคงเหลือหลังชำระ",
  lowBalance: "ยอดเงินไม่เพียงพอ กรุณาเติมเงินก่อนชำระด้วย Wallet",
  promoLabel: "โค้ดส่วนลดหรือ Access Code",
  promoPlaceholder: "กรอกโค้ดส่วนลด",
  applyPromo: "ใช้โค้ด",
  promoInvalid: "โค้ดนี้ใช้ไม่ได้กับแพ็กเกจหรือรอบชำระเงินที่เลือก",
  promoDiscount: "ส่วนลด",
  accessCodeReady: "Access Code พร้อมใช้งาน ไม่ต้องชำระผ่าน Stripe",
  autoRenewal: "ต่ออายุอัตโนมัติ",
  instantActivation: "เปิดใช้งานทันที",
  securePayment: "ปลอดภัย 100%",
  qrPayment: "QR Payment",
  oneTimePayment: "จ่ายครั้งเดียว",
  noAutoRenewal: "ไม่ต่ออายุอัตโนมัติ",
  back: "กลับ",
  paymentSecure: "การชำระเงินปลอดภัย 100% ขับเคลื่อนโดย Stripe",
  byBaho: "BY BAHO",
  statusPastDue: "ชำระเงินไม่สำเร็จ",
  statusTrialPrefix: "ทดลองใช้ฟรี เหลืออีก",
  statusTrialSuffix: "วัน",
  statusExpired: "ทดลองใช้ฟรีครบ 7 วันแล้ว",
  trialOneDayText: "ทดลองใช้ฟรีเหลืออีก 1 วัน เลือกแพ็กเกจเพื่อใช้งานต่อ",
  trialOneDayCta: "ดูแพ็กเกจ",
  plans: {
    maker: {
      title: "Maker",
      badge: "FDM Only",
      description: "สำหรับผู้ใช้งานเครื่องพิมพ์ FDM",
      features: ["คำนวณต้นทุนงานพิมพ์ FDM", "จัดการสต็อก Filament", "ติดตามกำไรของแต่ละงาน", "Dashboard สรุปข้อมูล", "ประวัติงานพิมพ์"],
    },
    studio: {
      title: "Studio",
      badge: "FDM + Resin",
      description: "สำหรับธุรกิจที่ใช้งานทั้ง FDM และ Resin",
      features: ["ทุกอย่างใน Maker", "คำนวณต้นทุนงานพิมพ์ Resin", "จัดการสต็อก Resin", "Dashboard Resin", "ประวัติงานพิมพ์ Resin"],
    },
  },
};

const enCopy: PricingCopy = {
  title: "Choose a 3D PrintCost Studio plan",
  expiredTitle: "Your 7-day free trial has ended",
  subtitle: "Choose the plan that fits your print workflow and continue using the app.",
  expiredSubtitle: "Choose a plan to continue. All of your data remains safely available.",
  expiredDataSafe: "Your print data, stock, and job history remain intact.",
  billingMonthly: "Monthly",
  billingYearly: "Yearly",
  saveYearly: "Save 25%",
  monthlyUnit: "/ month",
  yearlyChargePrefix: "Billed yearly",
  cancelAnytime: "Cancel anytime",
  recommended: "Recommended",
  footer: "Your payment data is encrypted and secure",
  choosePaymentTitlePrefix: "Choose plan",
  choosePaymentSubtitle: "Choose the payment method that works best for you.",
  selectedPlan: "Selected Plan",
  selectPlanCta: "Choose",
  priceLabel: "Price",
  checkoutDataSafe: "Your print data, stock, and full job history will remain available after upgrading.",
  cardTitle: "Credit / Debit Card, Apple Pay, Google Pay",
  cardSubtitle: "Pay with Stripe and renew automatically every month or year.",
  cardCta: "Continue to Stripe Checkout",
  promptPayTitle: "PromptPay (Thailand)",
  promptPaySubtitle: "Pay by QR Code through Stripe PromptPay.",
  promptPayNote: "PromptPay is a one-time payment and does not renew automatically. When the period ends, pay again to continue using the app.",
  promptPayCta: "Pay with Stripe PromptPay",
  walletTitle: "Wallet",
  walletSubtitle: "Use your Wallet balance to pay for the selected plan (top up via PromptPay or card).",
  payWithWallet: "Pay with Wallet",
  topUp: "Top Up Wallet",
  topUpAmountLabel: "Top-up amount",
  topUpCustom: "Custom amount",
  topUpMethodAuto: "Card / Apple Pay / Google Pay",
  topUpMethodLabel: "Top-up method",
  topUpMethodPromptPay: "PromptPay",
  currentBalance: "Current balance",
  remainingBalance: "Remaining balance after payment",
  lowBalance: "Insufficient balance. Please top up before paying with Wallet.",
  promoLabel: "Promo Code or Access Code",
  promoPlaceholder: "Enter Promo Code",
  applyPromo: "Apply",
  promoInvalid: "This code is not valid for the selected plan or billing cycle.",
  promoDiscount: "Discount",
  accessCodeReady: "Access Code is ready. No Stripe payment required.",
  autoRenewal: "Auto Renewal",
  instantActivation: "Instant Activation",
  securePayment: "Secure Payment",
  qrPayment: "QR Payment",
  oneTimePayment: "One-time Payment",
  noAutoRenewal: "No Auto Renewal",
  back: "Back",
  paymentSecure: "Payment is 100% secure and powered by Stripe",
  byBaho: "BY BAHO",
  statusPastDue: "Payment failed",
  statusTrialPrefix: "Free trial",
  statusTrialSuffix: "days left",
  statusExpired: "Your 7-day free trial has ended",
  trialOneDayText: "Your free trial ends in 1 day. Choose a plan to continue.",
  trialOneDayCta: "View plans",
  plans: {
    maker: {
      title: "Maker",
      badge: "FDM Only",
      description: "For users who work with FDM printers.",
      features: ["Calculate FDM print costs", "Manage Filament stock", "Track profit for each job", "Summary dashboard", "Print job history"],
    },
    studio: {
      title: "Studio",
      badge: "FDM + Resin",
      description: "For businesses that work with both FDM and Resin.",
      features: ["Everything in Maker", "Calculate Resin print costs", "Manage Resin stock", "Resin dashboard", "Resin print job history"],
    },
  },
};

const pricingCopy: Record<PricingLanguage, PricingCopy> = {
  th: thCopy,
  en: enCopy,
  zh: enCopy,
  ja: enCopy,
  ko: enCopy,
};

function BrandLockup({ copy }: { copy: PricingCopy }) {
  return (
    <div className="flex items-center gap-3 text-left">
      <img alt="3D PrintCost Studio" className="h-12 w-12 rounded-xl bg-white object-contain p-1 shadow-sm ring-1 ring-blue-100" src="/assets/official-3d-printcost-logo.png" />
      <div>
        <div className="text-lg font-black leading-tight text-slate-950 sm:text-xl">3D PrintCost Studio</div>
        <div className="text-xs font-black tracking-wide text-[#2563EB]">{copy.byBaho}</div>
      </div>
    </div>
  );
}

function PlanCard({ billingCycle, copy, expired, language, onSelect, plan }: { billingCycle: BillingCycle; copy: PricingCopy; expired: boolean; language: PricingLanguage; onSelect: (plan: PlanKey) => void; plan: PlanKey }) {
  const config = copy.plans[plan];
  const Icon = plan === "maker" ? Boxes : FlaskConical;
  const recommended = plan === "studio";
  const monthlyEquivalent = billingCycle === "yearly" ? (plan === "maker" ? 149 : 233) : getPlanAmount(plan, "monthly");
  const yearlyAmount = getPlanAmount(plan, "yearly");

  return (
    <article className={["relative flex min-h-[390px] flex-col rounded-2xl border bg-white p-4 shadow-[0_16px_44px_rgba(15,23,42,0.07)] sm:p-5", recommended ? "border-[#2563EB] ring-2 ring-blue-100" : "border-slate-200"].join(" ")}>
      {recommended ? (
        <div className="absolute -top-3 right-5 inline-flex items-center gap-1.5 rounded-full bg-[#2563EB] px-3 py-1.5 text-xs font-black text-white shadow-md shadow-blue-100">
          <Star size={12} fill="currentColor" />
          {copy.recommended}
        </div>
      ) : null}

      <div className="flex items-start gap-4">
        <div className={["grid h-12 w-12 shrink-0 place-items-center rounded-xl", recommended ? "bg-blue-50 text-[#2563EB]" : "bg-blue-100 text-blue-700"].join(" ")}>
          <Icon size={26} strokeWidth={2.3} />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-black text-slate-950">{config.title}</h3>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-[#2563EB]">{config.badge}</span>
          </div>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{config.description}</p>
        </div>
      </div>

      <div className="my-4 h-px bg-slate-200" />

      <div>
        <div className="flex flex-wrap items-end gap-2">
          <span className={["text-4xl font-black", recommended ? "text-[#2563EB]" : "text-blue-700"].join(" ")}>{formatCurrency(monthlyEquivalent, language)}</span>
          <span className="pb-2 text-lg font-black text-slate-950">{copy.monthlyUnit}</span>
        </div>
        {billingCycle === "yearly" ? (
          <p className="mt-2 text-sm font-black text-emerald-600">{copy.yearlyChargePrefix} {formatCurrency(yearlyAmount, language)}</p>
        ) : (
          <p className="mt-2 text-sm font-bold text-slate-500">{copy.cancelAnytime}</p>
        )}
      </div>

      <ul className="mt-4 flex-1 space-y-2.5">
        {config.features.map((feature) => (
          <li className="flex items-center gap-3 text-sm font-bold text-slate-800" key={feature}>
            <CheckCircle2 className={recommended ? "text-[#2563EB]" : "text-blue-700"} size={18} fill="currentColor" strokeWidth={3} />
            {feature}
          </li>
        ))}
      </ul>

      <button className={["mt-5 grid h-12 min-h-12 place-items-center rounded-xl px-4 py-3 text-base font-black transition hover:-translate-y-0.5", recommended ? "bg-gradient-to-r from-[#2563EB] to-blue-500 text-white shadow-lg shadow-blue-100 hover:from-blue-700 hover:to-[#2563EB]" : "border-2 border-[#2563EB] bg-white text-[#2563EB] hover:bg-blue-50"].join(" ")} onClick={() => onSelect(plan)} type="button">
        {copy.selectPlanCta} {expired ? config.title : ""}
      </button>
    </article>
  );
}

function HiddenCheckoutFields({ billingCycle, language, plan, promoCode }: { billingCycle: BillingCycle; language: PricingLanguage; plan: PlanKey; promoCode: string }) {
  return (
    <>
      <input name="plan" type="hidden" value={plan} />
      <input name="billingCycle" type="hidden" value={billingCycle} />
      <input name="promoCode" type="hidden" value={promoCode} />
      <input name="language" type="hidden" value={language} />
    </>
  );
}

function Benefit({ children, tone = "emerald" }: { children: React.ReactNode; tone?: "emerald" | "slate" }) {
  return (
    <span className={["inline-flex min-h-7 items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-black", tone === "emerald" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"].join(" ")}>
      <CheckCircle2 size={14} strokeWidth={3} />
      {children}
    </span>
  );
}

function PaymentSelection({ billingCycle, copy, language, onBack, plan }: { billingCycle: BillingCycle; copy: PricingCopy; language: PricingLanguage; onBack: () => void; plan: PlanKey }) {
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [walletUnavailable, setWalletUnavailable] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoState, setPromoState] = useState<PromoState>({ status: "idle" });
  const [topUpAmount, setTopUpAmount] = useState("300");
  const [topUpMethod, setTopUpMethod] = useState<"auto" | "promptpay">("auto");
  const planCopy = copy.plans[plan];
  const amount = getPlanAmount(plan, billingCycle);
  const amountDue = promoState.status === "valid" ? promoState.finalAmount : amount;
  const discount = promoState.status === "valid" ? promoState.discountAmount : 0;
  const walletRemaining = walletBalance === null ? null : walletBalance - amountDue;
  const canPayWithWallet = amountDue === 0 || (walletBalance !== null && walletBalance >= amountDue);
  const selectedTopUpAmount = Math.round(Number(topUpAmount || 0));
  const topUpReady = selectedTopUpAmount >= 50 && selectedTopUpAmount <= 50000;

  useEffect(() => {
    let cancelled = false;
    setWalletBalance(null);
    setWalletUnavailable(false);
    fetch("/api/wallet/balance")
      .then((response) => response.json())
      .then((data) => {
        if (cancelled) return;
        setWalletBalance(Number(data.balance ?? 0));
        setWalletUnavailable(Boolean(data.unavailable));
      })
      .catch(() => {
        if (cancelled) return;
        setWalletBalance(0);
        setWalletUnavailable(true);
      });

    return () => {
      cancelled = true;
    };
  }, [plan, billingCycle]);

  useEffect(() => {
    setPromoState({ status: "idle" });
  }, [plan, billingCycle, language]);

  async function applyPromo() {
    const code = promoCode.trim();
    if (!code) {
      setPromoState({ status: "idle" });
      return;
    }

    setPromoState({ status: "loading" });
    try {
      const response = await fetch("/api/promo/validate", {
        body: JSON.stringify({ billingCycle, code, plan }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = await response.json();
      if (data.valid) {
        setPromoState({
          discountAmount: Number(data.discountAmount ?? 0),
          finalAmount: Number(data.finalAmount ?? amount),
          status: "valid",
          type: data.type === "access" ? "access" : "discount",
        });
        return;
      }
      setPromoState({ status: "invalid" });
    } catch {
      setPromoState({ status: "invalid" });
    }
  }

  function updatePromoCode(value: string) {
    setPromoCode(value);
    setPromoState({ status: "idle" });
  }

  const hiddenPromoCode = promoCode.trim();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BrandLockup copy={copy} />
        <button className="grid h-11 min-w-24 place-items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-100" onClick={onBack} type="button">
          {copy.back}
        </button>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3 border-y border-slate-100 py-3">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{copy.choosePaymentTitlePrefix} <span className="text-[#2563EB]">{planCopy.title}</span></h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">{copy.choosePaymentSubtitle}</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-xs font-black text-blue-700">
          <ShieldCheck size={16} />
          {copy.paymentSecure}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.78fr_1.22fr]">
        <aside className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.06)]">
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-50 text-[#2563EB]">
              {plan === "maker" ? <Boxes size={26} /> : <FlaskConical size={26} />}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-wide text-blue-700">{copy.selectedPlan}</p>
              <h3 className="mt-0.5 text-xl font-black text-slate-950">{planCopy.title}</h3>
              <p className="mt-1 text-xs font-bold leading-5 text-slate-500">{billingCycle === "yearly" ? copy.billingYearly : copy.billingMonthly}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-white p-4 ring-1 ring-blue-100">
            <p className="text-xs font-black text-slate-500">{copy.priceLabel}</p>
            <p className="mt-1 text-4xl font-black text-[#2563EB]">{formatCurrency(amountDue, language)}</p>
            {discount > 0 ? <p className="mt-1 text-xs font-black text-emerald-700">{copy.promoDiscount}: -{formatCurrency(discount, language)}</p> : null}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <label className="text-xs font-black text-slate-950" htmlFor="promo-code">{copy.promoLabel}</label>
            <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto] lg:grid-cols-1 xl:grid-cols-[1fr_auto]">
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-bold text-slate-900 outline-none transition focus:border-[#2563EB] focus:bg-white" id="promo-code" onChange={(event) => updatePromoCode(event.target.value)} placeholder={copy.promoPlaceholder} value={promoCode} />
              </div>
              <button className="h-11 rounded-xl bg-slate-950 px-4 text-sm font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300" disabled={promoState.status === "loading"} onClick={applyPromo} type="button">
                {copy.applyPromo}
              </button>
            </div>
            {promoState.status === "valid" ? (
              <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
                {promoState.type === "access" ? copy.accessCodeReady : copy.promoDiscount + ": -" + formatCurrency(promoState.discountAmount, language)}
              </p>
            ) : null}
            {promoState.status === "invalid" ? <p className="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-black text-rose-700">{copy.promoInvalid}</p> : null}
          </div>

          <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold leading-5 text-slate-500">{copy.checkoutDataSafe}</p>
        </aside>

        <section className="space-y-3">
          <form action="/api/stripe/checkout" className="rounded-2xl border-2 border-[#2563EB] bg-white p-4 shadow-[0_16px_45px_rgba(37,99,235,0.10)]" method="POST">
            <HiddenCheckoutFields billingCycle={billingCycle} language={language} plan={plan} promoCode={hiddenPromoCode} />
            <input name="paymentMode" type="hidden" value="subscription" />
            <div className="flex gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#2563EB] to-blue-500 text-white">
                <CreditCard size={25} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-black text-slate-950 sm:text-lg">{copy.cardTitle}</h3>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-black text-emerald-700">{copy.recommended}</span>
                </div>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500 sm:text-sm">{copy.cardSubtitle}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Benefit>{copy.autoRenewal}</Benefit>
                  <Benefit>{copy.instantActivation}</Benefit>
                  <Benefit>{copy.securePayment}</Benefit>
                </div>
              </div>
            </div>
            <button className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 text-sm font-black text-white transition hover:bg-blue-700" type="submit">
              {copy.cardCta}
              <ArrowRight size={17} />
            </button>
          </form>

          <form action="/api/stripe/checkout" className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.05)]" method="POST">
            <HiddenCheckoutFields billingCycle={billingCycle} language={language} plan={plan} promoCode={hiddenPromoCode} />
            <input name="paymentMode" type="hidden" value="promptpay_period" />
            <div className="flex gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-500 text-white">
                <QrCode size={25} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base font-black text-slate-950 sm:text-lg">{copy.promptPayTitle}</h3>
                  <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-black text-emerald-700">PromptPay</span>
                </div>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500 sm:text-sm">{copy.promptPaySubtitle}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Benefit>{copy.qrPayment}</Benefit>
                  <Benefit>{copy.oneTimePayment}</Benefit>
                  <Benefit tone="slate">{copy.noAutoRenewal}</Benefit>
                </div>
              </div>
            </div>
            <button className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-black text-white transition hover:bg-emerald-700" type="submit">
              {copy.promptPayCta}
              <ArrowRight size={17} />
            </button>
          </form>

          <div className="rounded-2xl border border-violet-200 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.05)]">
            <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
              <div>
                <div className="flex gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-violet-500 text-white">
                    <Wallet size={25} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-black text-slate-950 sm:text-lg">{copy.walletTitle}</h3>
                    <p className="mt-1 text-xs font-semibold leading-5 text-slate-500 sm:text-sm">{copy.walletSubtitle}</p>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[11px] font-black text-slate-500">{copy.currentBalance}</p>
                    <p className="mt-1 text-lg font-black text-slate-950">{walletBalance === null ? "..." : formatCurrency(walletBalance, language)}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[11px] font-black text-slate-500">{copy.remainingBalance}</p>
                    <p className={["mt-1 text-lg font-black", walletRemaining !== null && walletRemaining < 0 ? "text-rose-600" : "text-emerald-700"].join(" ")}>{walletRemaining === null ? "..." : formatCurrency(walletRemaining, language)}</p>
                  </div>
                </div>
                {!canPayWithWallet || walletUnavailable ? <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold leading-5 text-amber-800">{copy.lowBalance}</p> : null}
                <form action="/api/wallet/pay-subscription" className="mt-3" method="POST">
                  <HiddenCheckoutFields billingCycle={billingCycle} language={language} plan={plan} promoCode={hiddenPromoCode} />
                  <button className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-black text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300" disabled={!canPayWithWallet || walletUnavailable} type="submit">
                    {copy.payWithWallet}
                  </button>
                </form>
              </div>

              <form action="/api/stripe/wallet-topup" className="rounded-2xl bg-violet-50/70 p-3 ring-1 ring-violet-100" method="POST">
                <input name="method" type="hidden" value={topUpMethod} />
                <input name="paymentMode" type="hidden" value="wallet_topup" />
                <input name="language" type="hidden" value={language} />
                <input name="amount" type="hidden" value={topUpReady ? selectedTopUpAmount : ""} />
                <p className="text-xs font-black text-violet-900">{copy.topUp}</p>
                <p className="mt-2 text-[11px] font-black text-violet-700">{copy.topUpAmountLabel}</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {topUpAmounts.map((amountOption) => {
                    const selected = selectedTopUpAmount === amountOption;
                    return (
                      <button className={["h-9 rounded-xl border text-[11px] font-black transition", selected ? "border-violet-600 bg-violet-600 text-white" : "border-violet-100 bg-white text-violet-700 hover:bg-violet-100"].join(" ")} key={amountOption} onClick={() => setTopUpAmount(String(amountOption))} type="button">
                        {formatCurrency(amountOption, language)}
                      </button>
                    );
                  })}
                </div>
                <input className="mt-2 h-10 w-full rounded-xl border border-violet-100 bg-white px-3 text-sm font-bold outline-none focus:border-violet-500" min="50" onChange={(event) => setTopUpAmount(event.target.value)} placeholder={copy.topUpCustom} type="number" value={topUpAmounts.includes(selectedTopUpAmount) ? "" : topUpAmount} />

                <p className="mt-3 text-[11px] font-black text-violet-700">{copy.topUpMethodLabel}</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <button className={["min-h-9 rounded-xl border px-2 py-1.5 text-[11px] font-black transition", topUpMethod === "auto" ? "border-violet-600 bg-white text-violet-800 shadow-sm" : "border-violet-100 bg-white/70 text-violet-600 hover:bg-white"].join(" ")} onClick={() => setTopUpMethod("auto")} type="button">
                    {copy.topUpMethodAuto}
                  </button>
                  <button className={["min-h-9 rounded-xl border px-2 py-1.5 text-[11px] font-black transition", topUpMethod === "promptpay" ? "border-violet-600 bg-white text-violet-800 shadow-sm" : "border-violet-100 bg-white/70 text-violet-600 hover:bg-white"].join(" ")} onClick={() => setTopUpMethod("promptpay")} type="button">
                    {copy.topUpMethodPromptPay}
                  </button>
                </div>

                <button className="mt-3 h-10 w-full rounded-xl bg-violet-600 px-4 text-sm font-black text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300" disabled={!topUpReady} type="submit">
                  {copy.topUp}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export function PricingDialog({ expired = false, language = defaultLanguage, locked = false, onClose, open }: PricingDialogProps) {
  const copy = pricingCopy[language];
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("yearly");
  const [checkoutPlan, setCheckoutPlan] = useState<PlanKey | null>(null);

  useEffect(() => {
    setCheckoutPlan(null);
  }, [language]);

  if (!open) return null;

  function closeDialog() {
    if (locked) return;
    onClose?.();
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/72 px-4 py-6 backdrop-blur-sm sm:px-6">
      <div className={["relative mx-auto w-full rounded-2xl border border-blue-50 bg-white p-4 text-slate-950 shadow-[0_30px_90px_rgba(2,6,23,0.36)] sm:p-5", checkoutPlan ? "max-w-[1040px]" : "max-w-[960px]"].join(" ")}>
        {!locked ? (
          <button aria-label={copy.back} className="absolute right-5 top-5 z-10 grid h-10 w-10 place-items-center rounded-full bg-white text-slate-700 shadow hover:bg-slate-100" onClick={closeDialog} type="button">
            <X size={22} />
          </button>
        ) : null}

        {checkoutPlan ? (
          <PaymentSelection billingCycle={billingCycle} copy={copy} language={language} onBack={() => setCheckoutPlan(null)} plan={checkoutPlan} />
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4 pr-12">
              <BrandLockup copy={copy} />
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-blue-700">
                <ShieldCheck size={18} />
                {copy.paymentSecure}
              </div>
            </div>

            <div className="mx-auto mt-4 max-w-2xl text-center">
              <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-[#2563EB]">
                <ShieldCheck size={24} strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{expired ? copy.expiredTitle : copy.title}</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{expired ? copy.expiredSubtitle : copy.subtitle}</p>
              {expired ? <p className="mt-2 text-sm font-bold text-emerald-700">{copy.expiredDataSafe}</p> : null}

              <div className="mx-auto mt-4 grid h-12 max-w-[360px] grid-cols-2 rounded-full bg-slate-100 p-1.5 shadow-inner">
                <button className={["rounded-full text-sm font-black transition", billingCycle === "monthly" ? "bg-white text-slate-950 shadow" : "text-slate-500"].join(" ")} onClick={() => setBillingCycle("monthly")} type="button">
                  {copy.billingMonthly}
                </button>
                <button className={["relative rounded-full text-sm font-black transition", billingCycle === "yearly" ? "bg-[#2563EB] text-white shadow-md shadow-blue-100" : "text-slate-500"].join(" ")} onClick={() => setBillingCycle("yearly")} type="button">
                  {copy.billingYearly}
                  <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-black text-emerald-700">{copy.saveYearly}</span>
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <PlanCard billingCycle={billingCycle} copy={copy} expired={expired} language={language} onSelect={setCheckoutPlan} plan="maker" />
              <PlanCard billingCycle={billingCycle} copy={copy} expired={expired} language={language} onSelect={setCheckoutPlan} plan="studio" />
            </div>

            <div className="mt-5 border-t border-slate-200 pt-4 text-center text-sm font-bold leading-6 text-slate-500">{copy.footer}</div>
          </>
        )}
      </div>
    </div>
  );
}

export function TrialSubscriptionControl({ canUseApp, daysLeft, hideTrigger = false, listenForLegacyOpen = false, profile }: TrialSubscriptionControlProps) {
  const status = profile.subscription_status ?? "expired";
  const expired = !canUseApp;
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<PricingLanguage>(defaultLanguage);
  const copy = pricingCopy[language];

  useEffect(() => {
    try {
      const storedLanguage = window.localStorage.getItem("printCostLanguage") ?? window.localStorage.getItem("language") ?? document.documentElement.lang;
      setLanguage(normalizePricingLanguage(storedLanguage));
    } catch {
      setLanguage(defaultLanguage);
    }
  }, []);

  useEffect(() => {
    if (expired) {
      setOpen(true);
      return;
    }
    setOpen(false);
  }, [expired]);

  useEffect(() => {
    if (!listenForLegacyOpen) return;

    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "printcost:open-pricing") return;
      setLanguage(normalizePricingLanguage(event.data?.language));
      setOpen(true);
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [listenForLegacyOpen]);

  const badgeText = useMemo(() => {
    if (status === "active") return null;
    if (status === "past_due") return copy.statusPastDue;
    if (daysLeft > 0) return copy.statusTrialPrefix + " " + daysLeft + " " + copy.statusTrialSuffix;
    return copy.statusExpired;
  }, [copy, daysLeft, status]);

  return (
    <>
      {!hideTrigger && status === "trialing" && daysLeft === 1 && canUseApp ? (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950">
          <span className="text-sm font-black">{copy.trialOneDayText}</span>
          <button className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-black text-white hover:bg-amber-700" onClick={() => setOpen(true)} type="button">
            {copy.trialOneDayCta}
          </button>
        </div>
      ) : null}

      {!hideTrigger ? (
        <div className="mb-4 flex justify-end">
          {badgeText ? (
            <button className="rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-black text-blue-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50" onClick={() => setOpen(true)} type="button">
              {badgeText}
            </button>
          ) : null}
        </div>
      ) : null}

      <PricingDialog expired={expired} language={language} locked={expired} onClose={() => setOpen(false)} open={open} />
    </>
  );
}



