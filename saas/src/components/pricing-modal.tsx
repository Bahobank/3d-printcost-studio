"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Boxes, CheckCircle2, CreditCard, Crown, FlaskConical, Lock, QrCode, ShieldCheck, Star, Tag, Wallet, X } from "lucide-react";
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
  currentPlan?: PlanKey | null;
  currentCycle?: BillingCycle | null;
  canCancel?: boolean;
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
  paymentMethodHeading: string;
  cardWallets: string;
  vatIncluded: string;
  promoQuestion: string;
  proceedPayment: string;
  redirectSecureNote: string;
  instantAccessNote: string;
  yearlyUnit: string;
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
  currentPlanBadge: string;
  cancelPlan: string;
  keepPlan: string;
  cancelConfirmText: string;
  cancelSuccess: string;
  cancelError: string;
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

// Thai customers are billed in THB; every other language is shown and charged in USD.
const USD_PRICES: Record<PlanKey, Record<BillingCycle, number>> = {
  maker: { monthly: 5.99, yearly: 53.9 },
  studio: { monthly: 8.99, yearly: 83.9 },
};
const USD_MONTHLY_EQUIVALENT: Record<PlanKey, number> = { maker: 4.49, studio: 6.99 };

function usesUsd(language: PricingLanguage) {
  return language !== "th";
}

function planDisplayAmount(plan: PlanKey, billingCycle: BillingCycle, language: PricingLanguage) {
  return usesUsd(language) ? USD_PRICES[plan][billingCycle] : getPlanAmount(plan, billingCycle);
}

function formatMoney(amount: number, language: PricingLanguage) {
  if (usesUsd(language)) {
    return new Intl.NumberFormat("en-US", { currency: "USD", maximumFractionDigits: 2, minimumFractionDigits: 2, style: "currency" }).format(amount);
  }
  return formatCurrency(amount, language);
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
  paymentMethodHeading: "เลือกวิธีชำระเงิน",
  cardWallets: "Apple Pay, Google Pay",
  vatIncluded: "รวมภาษีมูลค่าเพิ่มแล้ว",
  promoQuestion: "มีโค้ดส่วนลด?",
  proceedPayment: "ดำเนินการชำระเงิน",
  redirectSecureNote: "คุณจะถูกนำไปยังหน้าชำระเงินที่ปลอดภัย",
  instantAccessNote: "เมื่อชำระเงินสำเร็จ คุณจะได้รับสิทธิ์ใช้งานทันที",
  yearlyUnit: "/ ปี",
  selectedPlan: "แพ็กเกจที่เลือก",
  selectPlanCta: "เลือกแพ็กเกจ",
  currentPlanBadge: "แพ็กเกจปัจจุบัน",
  cancelPlan: "ยกเลิกแพ็กเกจ",
  keepPlan: "ใช้ต่อ",
  cancelConfirmText: "ยืนยันการยกเลิก? คุณจะยังใช้งานได้จนถึงสิ้นรอบการชำระเงินปัจจุบัน",
  cancelSuccess: "ยกเลิกแล้ว คุณจะใช้งานได้จนถึงสิ้นรอบการชำระเงินปัจจุบัน",
  cancelError: "ยกเลิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
  priceLabel: "ราคา",
  checkoutDataSafe: "ข้อมูลการพิมพ์ สต๊อก และประวัติงานทั้งหมดของคุณจะยังคงอยู่ครบถ้วนหลังอัปเกรด",
  cardTitle: "บัตรเครดิต / เดบิต",
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
  paymentMethodHeading: "Choose a payment method",
  cardWallets: "Apple Pay, Google Pay",
  vatIncluded: "VAT included",
  promoQuestion: "Have a promo code?",
  proceedPayment: "Proceed to payment",
  redirectSecureNote: "You'll be taken to a secure payment page",
  instantAccessNote: "Get instant access after successful payment",
  yearlyUnit: "/ year",
  selectedPlan: "Selected Plan",
  selectPlanCta: "Choose",
  currentPlanBadge: "Current plan",
  cancelPlan: "Cancel plan",
  keepPlan: "Keep plan",
  cancelConfirmText: "Cancel your plan? You'll keep access until the end of the current billing period.",
  cancelSuccess: "Canceled. You'll keep access until the end of the current billing period.",
  cancelError: "Couldn't cancel. Please try again.",
  priceLabel: "Price",
  checkoutDataSafe: "Your print data, stock, and full job history will remain available after upgrading.",
  cardTitle: "Credit / Debit Card",
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

const zhCopy: PricingCopy = {
  title: "选择 3D PrintCost Studio 方案",
  expiredTitle: "您的 7 天免费试用已结束",
  subtitle: "选择适合您打印流程的方案，继续使用应用。",
  expiredSubtitle: "选择一个方案以继续使用。您的所有数据都安全保留。",
  expiredDataSafe: "您的打印数据、库存和工作记录均完整保留。",
  billingMonthly: "按月",
  billingYearly: "按年",
  saveYearly: "节省 25%",
  monthlyUnit: "/ 月",
  yearlyChargePrefix: "按年收费",
  cancelAnytime: "随时取消",
  recommended: "推荐",
  footer: "您的支付信息已加密且安全",
  choosePaymentTitlePrefix: "选择方案",
  choosePaymentSubtitle: "选择最适合您的支付方式。",
  paymentMethodHeading: "选择支付方式",
  cardWallets: "Apple Pay, Google Pay",
  vatIncluded: "含增值税",
  promoQuestion: "有优惠码吗？",
  proceedPayment: "前往支付",
  redirectSecureNote: "您将被引导至安全支付页面",
  instantAccessNote: "支付成功后立即获得使用权限",
  yearlyUnit: "/ 年",
  selectedPlan: "已选方案",
  selectPlanCta: "选择",
  currentPlanBadge: "当前方案",
  cancelPlan: "取消方案",
  keepPlan: "继续使用",
  cancelConfirmText: "确认取消？在当前计费周期结束前您仍可使用。",
  cancelSuccess: "已取消。在当前计费周期结束前您仍可使用。",
  cancelError: "取消失败，请重试。",
  priceLabel: "价格",
  checkoutDataSafe: "升级后，您的打印数据、库存和完整工作记录都会保留。",
  cardTitle: "信用卡 / 借记卡",
  cardSubtitle: "通过 Stripe 支付，每月或每年自动续订。",
  cardCta: "前往 Stripe Checkout",
  promptPayTitle: "PromptPay（泰国）",
  promptPaySubtitle: "通过 Stripe PromptPay 扫码支付。",
  promptPayNote: "PromptPay 为一次性支付，不会自动续订。到期后请再次支付以继续使用。",
  promptPayCta: "使用 Stripe PromptPay 支付",
  walletTitle: "钱包",
  walletSubtitle: "使用钱包余额支付所选方案（可通过 PromptPay 或银行卡充值）。",
  payWithWallet: "使用钱包支付",
  topUp: "充值钱包",
  topUpAmountLabel: "充值金额",
  topUpCustom: "自定义金额",
  topUpMethodAuto: "银行卡 / Apple Pay / Google Pay",
  topUpMethodLabel: "充值方式",
  topUpMethodPromptPay: "PromptPay",
  currentBalance: "当前余额",
  remainingBalance: "支付后余额",
  lowBalance: "余额不足。请先充值再使用钱包支付。",
  promoLabel: "优惠码或访问码",
  promoPlaceholder: "输入优惠码",
  applyPromo: "应用",
  promoInvalid: "此优惠码不适用于所选方案或计费周期。",
  promoDiscount: "折扣",
  accessCodeReady: "访问码已就绪，无需通过 Stripe 支付。",
  autoRenewal: "自动续订",
  instantActivation: "即时激活",
  securePayment: "安全支付",
  qrPayment: "扫码支付",
  oneTimePayment: "一次性支付",
  noAutoRenewal: "不自动续订",
  back: "返回",
  paymentSecure: "支付 100% 安全，由 Stripe 提供支持",
  byBaho: "BY BAHO",
  statusPastDue: "支付失败",
  statusTrialPrefix: "免费试用",
  statusTrialSuffix: "天剩余",
  statusExpired: "您的 7 天免费试用已结束",
  trialOneDayText: "您的免费试用还剩 1 天。选择方案以继续使用。",
  trialOneDayCta: "查看方案",
  plans: {
    maker: {
      title: "Maker",
      badge: "仅 FDM",
      description: "适合使用 FDM 打印机的用户。",
      features: ["计算 FDM 打印成本", "管理耗材库存", "跟踪每个工作的利润", "汇总仪表板", "打印工作记录"],
    },
    studio: {
      title: "Studio",
      badge: "FDM + Resin",
      description: "适合同时使用 FDM 和树脂的企业。",
      features: ["包含 Maker 全部功能", "计算树脂打印成本", "管理树脂库存", "树脂仪表板", "树脂打印工作记录"],
    },
  },
};

const jaCopy: PricingCopy = {
  title: "3D PrintCost Studio のプランを選択",
  expiredTitle: "7日間の無料トライアルが終了しました",
  subtitle: "印刷ワークフローに合ったプランを選んで、アプリを使い続けましょう。",
  expiredSubtitle: "続けるにはプランを選択してください。データはすべて安全に保持されます。",
  expiredDataSafe: "印刷データ、在庫、作業履歴はすべて保持されます。",
  billingMonthly: "月額",
  billingYearly: "年額",
  saveYearly: "25% お得",
  monthlyUnit: "/ 月",
  yearlyChargePrefix: "年額請求",
  cancelAnytime: "いつでも解約可能",
  recommended: "おすすめ",
  footer: "お支払い情報は暗号化され安全に保護されます",
  choosePaymentTitlePrefix: "プラン選択",
  choosePaymentSubtitle: "ご希望のお支払い方法を選択してください。",
  paymentMethodHeading: "お支払い方法を選択",
  cardWallets: "Apple Pay, Google Pay",
  vatIncluded: "税込",
  promoQuestion: "プロモコードをお持ちですか？",
  proceedPayment: "お支払いへ進む",
  redirectSecureNote: "安全なお支払いページに移動します",
  instantAccessNote: "お支払い完了後すぐにご利用いただけます",
  yearlyUnit: "/ 年",
  selectedPlan: "選択中のプラン",
  selectPlanCta: "選択",
  currentPlanBadge: "現在のプラン",
  cancelPlan: "プランを解約",
  keepPlan: "継続する",
  cancelConfirmText: "解約しますか？現在の請求期間の終了までご利用いただけます。",
  cancelSuccess: "解約しました。現在の請求期間の終了までご利用いただけます。",
  cancelError: "解約できませんでした。もう一度お試しください。",
  priceLabel: "価格",
  checkoutDataSafe: "アップグレード後も印刷データ、在庫、作業履歴はすべて保持されます。",
  cardTitle: "クレジット / デビットカード",
  cardSubtitle: "Stripe でお支払い、毎月または毎年自動更新されます。",
  cardCta: "Stripe Checkout へ進む",
  promptPayTitle: "PromptPay（タイ）",
  promptPaySubtitle: "Stripe PromptPay で QR コード決済。",
  promptPayNote: "PromptPay は一回限りの支払いで、自動更新されません。期限が切れたら、再度支払って利用を継続してください。",
  promptPayCta: "Stripe PromptPay で支払う",
  walletTitle: "ウォレット",
  walletSubtitle: "ウォレット残高で選択したプランを支払う（PromptPay またはカードでチャージ可能）。",
  payWithWallet: "ウォレットで支払う",
  topUp: "ウォレットにチャージ",
  topUpAmountLabel: "チャージ金額",
  topUpCustom: "金額を指定",
  topUpMethodAuto: "カード / Apple Pay / Google Pay",
  topUpMethodLabel: "チャージ方法",
  topUpMethodPromptPay: "PromptPay",
  currentBalance: "現在の残高",
  remainingBalance: "支払い後の残高",
  lowBalance: "残高が不足しています。ウォレットで支払う前にチャージしてください。",
  promoLabel: "プロモコードまたはアクセスコード",
  promoPlaceholder: "プロモコードを入力",
  applyPromo: "適用",
  promoInvalid: "このコードは選択したプランまたは請求サイクルには使用できません。",
  promoDiscount: "割引",
  accessCodeReady: "アクセスコードが利用可能です。Stripe での支払いは不要です。",
  autoRenewal: "自動更新",
  instantActivation: "即時有効化",
  securePayment: "安全な支払い",
  qrPayment: "QR 決済",
  oneTimePayment: "一回限りの支払い",
  noAutoRenewal: "自動更新なし",
  back: "戻る",
  paymentSecure: "お支払いは Stripe による 100% 安全な処理です",
  byBaho: "BY BAHO",
  statusPastDue: "支払い失敗",
  statusTrialPrefix: "無料トライアル残り",
  statusTrialSuffix: "日",
  statusExpired: "7日間の無料トライアルが終了しました",
  trialOneDayText: "無料トライアルは残り1日です。続けるにはプランを選択してください。",
  trialOneDayCta: "プランを見る",
  plans: {
    maker: {
      title: "Maker",
      badge: "FDM のみ",
      description: "FDM プリンターをお使いの方向け。",
      features: ["FDM 印刷コストを計算", "フィラメント在庫を管理", "作業ごとの利益を追跡", "サマリーダッシュボード", "印刷作業履歴"],
    },
    studio: {
      title: "Studio",
      badge: "FDM + Resin",
      description: "FDM とレジンの両方を扱うビジネス向け。",
      features: ["Maker のすべての機能", "レジン印刷コストを計算", "レジン在庫を管理", "レジンダッシュボード", "レジン印刷作業履歴"],
    },
  },
};

const koCopy: PricingCopy = {
  title: "3D PrintCost Studio 요금제 선택",
  expiredTitle: "7일 무료 체험이 종료되었습니다",
  subtitle: "프린팅 워크플로에 맞는 요금제를 선택하고 앱을 계속 사용하세요.",
  expiredSubtitle: "계속하려면 요금제를 선택하세요. 모든 데이터는 안전하게 보관됩니다.",
  expiredDataSafe: "프린팅 데이터, 재고, 작업 이력이 모두 그대로 유지됩니다.",
  billingMonthly: "월간",
  billingYearly: "연간",
  saveYearly: "25% 절약",
  monthlyUnit: "/ 월",
  yearlyChargePrefix: "연간 청구",
  cancelAnytime: "언제든지 해지 가능",
  recommended: "추천",
  footer: "결제 정보는 암호화되어 안전하게 보호됩니다",
  choosePaymentTitlePrefix: "요금제 선택",
  choosePaymentSubtitle: "가장 편리한 결제 수단을 선택하세요.",
  paymentMethodHeading: "결제 수단 선택",
  cardWallets: "Apple Pay, Google Pay",
  vatIncluded: "부가세 포함",
  promoQuestion: "프로모션 코드가 있으신가요?",
  proceedPayment: "결제 진행",
  redirectSecureNote: "안전한 결제 페이지로 이동합니다",
  instantAccessNote: "결제 완료 후 즉시 이용할 수 있습니다",
  yearlyUnit: "/ 년",
  selectedPlan: "선택한 요금제",
  selectPlanCta: "선택",
  currentPlanBadge: "현재 요금제",
  cancelPlan: "요금제 해지",
  keepPlan: "유지하기",
  cancelConfirmText: "해지하시겠어요? 현재 청구 기간이 끝날 때까지 계속 사용할 수 있습니다.",
  cancelSuccess: "해지되었습니다. 현재 청구 기간이 끝날 때까지 사용할 수 있습니다.",
  cancelError: "해지하지 못했습니다. 다시 시도해 주세요.",
  priceLabel: "가격",
  checkoutDataSafe: "업그레이드 후에도 프린팅 데이터, 재고, 전체 작업 이력이 유지됩니다.",
  cardTitle: "신용카드 / 체크카드",
  cardSubtitle: "Stripe로 결제하고 매월 또는 매년 자동 갱신됩니다.",
  cardCta: "Stripe Checkout으로 이동",
  promptPayTitle: "PromptPay (태국)",
  promptPaySubtitle: "Stripe PromptPay로 QR 코드 결제.",
  promptPayNote: "PromptPay는 일회성 결제이며 자동 갱신되지 않습니다. 기간이 끝나면 다시 결제하여 계속 사용하세요.",
  promptPayCta: "Stripe PromptPay로 결제",
  walletTitle: "지갑",
  walletSubtitle: "지갑 잔액으로 선택한 요금제를 결제합니다 (PromptPay 또는 카드로 충전).",
  payWithWallet: "지갑으로 결제",
  topUp: "지갑 충전",
  topUpAmountLabel: "충전 금액",
  topUpCustom: "직접 입력",
  topUpMethodAuto: "카드 / Apple Pay / Google Pay",
  topUpMethodLabel: "충전 수단",
  topUpMethodPromptPay: "PromptPay",
  currentBalance: "현재 잔액",
  remainingBalance: "결제 후 잔액",
  lowBalance: "잔액이 부족합니다. 지갑으로 결제하기 전에 충전하세요.",
  promoLabel: "프로모션 코드 또는 액세스 코드",
  promoPlaceholder: "프로모션 코드 입력",
  applyPromo: "적용",
  promoInvalid: "이 코드는 선택한 요금제 또는 청구 주기에 사용할 수 없습니다.",
  promoDiscount: "할인",
  accessCodeReady: "액세스 코드가 준비되었습니다. Stripe 결제가 필요하지 않습니다.",
  autoRenewal: "자동 갱신",
  instantActivation: "즉시 활성화",
  securePayment: "안전한 결제",
  qrPayment: "QR 결제",
  oneTimePayment: "일회성 결제",
  noAutoRenewal: "자동 갱신 없음",
  back: "뒤로",
  paymentSecure: "결제는 Stripe 기반으로 100% 안전합니다",
  byBaho: "BY BAHO",
  statusPastDue: "결제 실패",
  statusTrialPrefix: "무료 체험",
  statusTrialSuffix: "일 남음",
  statusExpired: "7일 무료 체험이 종료되었습니다",
  trialOneDayText: "무료 체험이 1일 남았습니다. 계속하려면 요금제를 선택하세요.",
  trialOneDayCta: "요금제 보기",
  plans: {
    maker: {
      title: "Maker",
      badge: "FDM 전용",
      description: "FDM 프린터를 사용하는 분께.",
      features: ["FDM 프린팅 비용 계산", "필라멘트 재고 관리", "작업별 수익 추적", "요약 대시보드", "프린팅 작업 이력"],
    },
    studio: {
      title: "Studio",
      badge: "FDM + Resin",
      description: "FDM과 레진을 모두 사용하는 비즈니스를 위한 요금제.",
      features: ["Maker의 모든 기능", "레진 프린팅 비용 계산", "레진 재고 관리", "레진 대시보드", "레진 프린팅 작업 이력"],
    },
  },
};

const pricingCopy: Record<PricingLanguage, PricingCopy> = {
  th: thCopy,
  en: enCopy,
  zh: zhCopy,
  ja: jaCopy,
  ko: koCopy,
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

function PlanCard({ billingCycle, copy, currentCycle, currentPlan, expired, language, onSelect, plan }: { billingCycle: BillingCycle; copy: PricingCopy; currentCycle: BillingCycle | null; currentPlan: PlanKey | null; expired: boolean; language: PricingLanguage; onSelect: (plan: PlanKey) => void; plan: PlanKey }) {
  const config = copy.plans[plan];
  const Icon = plan === "maker" ? Boxes : FlaskConical;
  const recommended = plan === "studio";
  const isCurrent = currentPlan === plan && currentCycle === billingCycle;
  const usd = usesUsd(language);
  const monthlyEquivalent = usd
    ? (billingCycle === "yearly" ? USD_MONTHLY_EQUIVALENT[plan] : USD_PRICES[plan].monthly)
    : (billingCycle === "yearly" ? (plan === "maker" ? 149 : 233) : getPlanAmount(plan, "monthly"));
  const yearlyAmount = planDisplayAmount(plan, "yearly", language);

  return (
    <article className={["relative flex min-h-[390px] flex-col rounded-2xl border bg-white p-4 shadow-[0_16px_44px_rgba(15,23,42,0.07)] sm:p-5", recommended ? "border-[#2563EB] ring-2 ring-blue-100" : "border-slate-200"].join(" ")}>
      {recommended ? (
        <div className="absolute -top-3 right-5 inline-flex items-center gap-1.5 rounded-full bg-[#2563EB] px-3 py-1.5 text-xs font-black text-white shadow-md shadow-blue-100">
          <Star size={12} fill="currentColor" />
          {copy.recommended}
        </div>
      ) : null}
      {isCurrent ? (
        <div className="absolute -top-3 left-5 inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-black text-white shadow-md">
          <CheckCircle2 size={12} fill="currentColor" />
          {copy.currentPlanBadge}
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
          <span className={["text-4xl font-black", recommended ? "text-[#2563EB]" : "text-blue-700"].join(" ")}>{formatMoney(monthlyEquivalent, language)}</span>
          <span className="pb-2 text-lg font-black text-slate-950">{copy.monthlyUnit}</span>
        </div>
        {billingCycle === "yearly" ? (
          <p className="mt-2 text-sm font-black text-emerald-600">{copy.yearlyChargePrefix} {formatMoney(yearlyAmount, language)}</p>
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

      <button className={["mt-5 grid h-12 min-h-12 place-items-center rounded-xl px-4 py-3 text-base font-black transition", isCurrent ? "cursor-default border-2 border-emerald-500 bg-emerald-50 text-emerald-700" : recommended ? "hover:-translate-y-0.5 bg-gradient-to-r from-[#2563EB] to-blue-500 text-white shadow-lg shadow-blue-100 hover:from-blue-700 hover:to-[#2563EB]" : "hover:-translate-y-0.5 border-2 border-[#2563EB] bg-white text-[#2563EB] hover:bg-blue-50"].join(" ")} disabled={isCurrent} onClick={() => onSelect(plan)} type="button">
        {isCurrent ? copy.currentPlanBadge : <>{copy.selectPlanCta} {expired ? config.title : ""}</>}
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

type PaymentMethod = "card" | "promptpay" | "wallet";

function PaymentSelection({ billingCycle, copy, language, onBack, plan }: { billingCycle: BillingCycle; copy: PricingCopy; language: PricingLanguage; onBack: () => void; plan: PlanKey }) {
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [walletUnavailable, setWalletUnavailable] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoState, setPromoState] = useState<PromoState>({ status: "idle" });
  const [topUpAmount, setTopUpAmount] = useState("300");
  const [topUpMethod, setTopUpMethod] = useState<"auto" | "promptpay">("auto");
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [showTopUp, setShowTopUp] = useState(false);
  const cardFormRef = useRef<HTMLFormElement>(null);
  const promptPayFormRef = useRef<HTMLFormElement>(null);
  const walletPayFormRef = useRef<HTMLFormElement>(null);
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
  const walletPayable = canPayWithWallet && !walletUnavailable;
  const ctaDisabled = method === "wallet" && !walletPayable;
  const usd = usesUsd(language);
  const displayAmountDue = usd ? planDisplayAmount(plan, billingCycle, language) : amountDue;

  function submitSelected() {
    if (method === "card") cardFormRef.current?.requestSubmit();
    else if (method === "promptpay") promptPayFormRef.current?.requestSubmit();
    else if (method === "wallet" && walletPayable) walletPayFormRef.current?.requestSubmit();
  }

  function MethodRadio({ selected }: { selected: boolean }) {
    return (
      <span className={["mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition", selected ? "border-[#2563EB]" : "border-slate-300"].join(" ")}>
        {selected ? <span className="h-2.5 w-2.5 rounded-full bg-[#2563EB]" /> : null}
      </span>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pr-12">
        <BrandLockup copy={copy} />
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 sm:inline-flex">
            <ShieldCheck size={16} />
            {copy.paymentSecure}
          </div>
          <button className="grid h-11 min-w-20 place-items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-black text-slate-700 transition hover:bg-slate-100" onClick={onBack} type="button">
            {copy.back}
          </button>
        </div>
      </div>

      <div className="border-y border-slate-100 py-3">
        <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{copy.choosePaymentTitlePrefix} <span className="text-[#2563EB]">{planCopy.title}</span></h2>
        <p className="mt-1 text-sm font-semibold text-slate-500">{copy.choosePaymentSubtitle}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.06)]">
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600">
              <Crown size={26} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-wide text-blue-700">{copy.selectedPlan}</p>
              <h3 className="mt-0.5 text-xl font-black text-slate-950">{planCopy.title}</h3>
              <p className="mt-1 text-xs font-bold leading-5 text-slate-500">{billingCycle === "yearly" ? copy.billingYearly : copy.billingMonthly}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-white p-4 ring-1 ring-blue-100">
            <p className="text-xs font-black text-slate-500">{copy.priceLabel}</p>
            <p className="mt-1 flex items-end gap-1">
              <span className="text-4xl font-black text-[#2563EB]">{formatMoney(displayAmountDue, language)}</span>
              <span className="pb-1 text-sm font-black text-slate-500">{billingCycle === "yearly" ? copy.yearlyUnit : copy.monthlyUnit}</span>
            </p>
            {!usd ? <p className="mt-1 text-xs font-bold text-slate-400">{copy.vatIncluded}</p> : null}
            {!usd && discount > 0 ? <p className="mt-1 text-xs font-black text-emerald-700">{copy.promoDiscount}: -{formatCurrency(discount, language)}</p> : null}
          </div>

          {!usd ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <label className="text-xs font-black text-slate-950" htmlFor="promo-code">{copy.promoQuestion}</label>
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
          ) : null}

          <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold leading-5 text-slate-500">{copy.checkoutDataSafe}</p>
        </aside>

        <section className="space-y-3">
          <p className="text-sm font-black text-slate-700">{copy.paymentMethodHeading}</p>

          <form action="/api/stripe/checkout" className="hidden" method="POST" ref={cardFormRef}>
            <HiddenCheckoutFields billingCycle={billingCycle} language={language} plan={plan} promoCode={hiddenPromoCode} />
            <input name="paymentMode" type="hidden" value="subscription" />
          </form>
          <form action="/api/stripe/checkout" className="hidden" method="POST" ref={promptPayFormRef}>
            <HiddenCheckoutFields billingCycle={billingCycle} language={language} plan={plan} promoCode={hiddenPromoCode} />
            <input name="paymentMode" type="hidden" value="promptpay_period" />
          </form>
          <form action="/api/wallet/pay-subscription" className="hidden" method="POST" ref={walletPayFormRef}>
            <HiddenCheckoutFields billingCycle={billingCycle} language={language} plan={plan} promoCode={hiddenPromoCode} />
          </form>

          <div className={["cursor-pointer rounded-2xl border bg-white p-4 transition", method === "card" ? "border-[#2563EB] ring-2 ring-blue-100 shadow-[0_16px_45px_rgba(37,99,235,0.10)]" : "border-slate-200 hover:border-slate-300"].join(" ")} onClick={() => setMethod("card")} role="button">
            <div className="flex gap-3">
              <MethodRadio selected={method === "card"} />
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#2563EB] to-blue-500 text-white">
                <CreditCard size={25} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-base font-black text-slate-950 sm:text-lg">{copy.cardTitle}</h3>
                    <p className="text-xs font-bold text-slate-500">{copy.cardWallets}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-black text-blue-700">{copy.recommended}</span>
                </div>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500 sm:text-sm">{copy.cardSubtitle}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Benefit>{copy.autoRenewal}</Benefit>
                  <Benefit>{copy.cancelAnytime}</Benefit>
                  <Benefit>{copy.securePayment}</Benefit>
                </div>
              </div>
            </div>
          </div>

          {!usd ? (
          <div className={["cursor-pointer rounded-2xl border bg-white p-4 transition", method === "promptpay" ? "border-[#2563EB] ring-2 ring-blue-100 shadow-[0_16px_45px_rgba(37,99,235,0.10)]" : "border-slate-200 hover:border-slate-300"].join(" ")} onClick={() => setMethod("promptpay")} role="button">
            <div className="flex gap-3">
              <MethodRadio selected={method === "promptpay"} />
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-500 text-white">
                <QrCode size={25} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-black text-slate-950 sm:text-lg">{copy.promptPayTitle}</h3>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500 sm:text-sm">{copy.promptPaySubtitle}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Benefit>{copy.qrPayment}</Benefit>
                  <Benefit>{copy.oneTimePayment}</Benefit>
                  <Benefit tone="slate">{copy.noAutoRenewal}</Benefit>
                </div>
              </div>
            </div>
          </div>
          ) : null}

          {!usd ? (
          <div className={["cursor-pointer rounded-2xl border bg-white p-4 transition", method === "wallet" ? "border-[#2563EB] ring-2 ring-blue-100 shadow-[0_16px_45px_rgba(37,99,235,0.10)]" : "border-slate-200 hover:border-slate-300"].join(" ")} onClick={() => setMethod("wallet")} role="button">
            <div className="flex gap-3">
              <MethodRadio selected={method === "wallet"} />
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-violet-500 text-white">
                <Wallet size={25} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-black text-slate-950 sm:text-lg">{copy.walletTitle}</h3>
                    <p className="mt-1 text-xs font-semibold leading-5 text-slate-500 sm:text-sm">{copy.walletSubtitle}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-[11px] font-black text-slate-500">{copy.currentBalance}</p>
                      <p className="text-lg font-black text-slate-950">{walletBalance === null ? "..." : formatCurrency(walletBalance, language)}</p>
                    </div>
                    <button className="h-10 shrink-0 rounded-xl border border-violet-200 bg-violet-50 px-3 text-xs font-black text-violet-700 transition hover:bg-violet-100" onClick={(event) => { event.stopPropagation(); setMethod("wallet"); setShowTopUp((value) => !value); }} type="button">
                      {copy.topUp}
                    </button>
                  </div>
                </div>
                {!canPayWithWallet || walletUnavailable ? <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold leading-5 text-amber-800">{copy.lowBalance}</p> : null}

                {showTopUp ? (
                  <form action="/api/stripe/wallet-topup" className="mt-3 rounded-2xl bg-violet-50/70 p-3 ring-1 ring-violet-100" method="POST" onClick={(event) => event.stopPropagation()}>
                    <input name="method" type="hidden" value={topUpMethod} />
                    <input name="paymentMode" type="hidden" value="wallet_topup" />
                    <input name="language" type="hidden" value={language} />
                    <input name="amount" type="hidden" value={topUpReady ? selectedTopUpAmount : ""} />
                    <p className="text-[11px] font-black text-violet-700">{copy.topUpAmountLabel}</p>
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
                ) : null}
              </div>
            </div>
          </div>
          ) : null}

          <button className="mt-1 flex h-14 w-full flex-col items-center justify-center rounded-2xl bg-[#2563EB] px-4 font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300" disabled={ctaDisabled} onClick={submitSelected} type="button">
            <span className="flex items-center gap-2 text-base"><Lock size={16} /> {copy.proceedPayment}</span>
            {method !== "wallet" ? <span className="text-[11px] font-bold text-blue-100">{copy.redirectSecureNote}</span> : null}
          </button>

          <p className="text-center text-xs font-bold text-slate-400">{copy.instantAccessNote} • {copy.cancelAnytime}</p>
        </section>
      </div>
    </div>
  );
}

function CancelPlanControl({ copy }: { copy: PricingCopy }) {
  const [state, setState] = useState<"idle" | "confirm" | "loading" | "done" | "error">("idle");

  async function cancel() {
    setState("loading");
    try {
      const response = await fetch("/api/stripe/cancel", { method: "POST" });
      if (!response.ok) throw new Error();
      setState("done");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-black text-emerald-700">
        {copy.cancelSuccess}
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">
      {state === "confirm" || state === "loading" ? (
        <>
          <p className="text-sm font-bold text-slate-600">{copy.cancelConfirmText}</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <button className="h-10 rounded-xl border border-rose-200 bg-white px-4 text-sm font-black text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60" disabled={state === "loading"} onClick={cancel} type="button">
              {copy.cancelPlan}
            </button>
            <button className="h-10 rounded-xl bg-slate-950 px-4 text-sm font-black text-white transition hover:bg-slate-800 disabled:opacity-60" disabled={state === "loading"} onClick={() => setState("idle")} type="button">
              {copy.keepPlan}
            </button>
          </div>
        </>
      ) : (
        <button className="text-sm font-black text-slate-500 underline-offset-2 transition hover:text-rose-600 hover:underline" onClick={() => setState("confirm")} type="button">
          {copy.cancelPlan}
        </button>
      )}
      {state === "error" ? <p className="mt-2 text-xs font-black text-rose-600">{copy.cancelError}</p> : null}
    </div>
  );
}

export function PricingDialog({ canCancel = false, currentCycle = null, currentPlan = null, expired = false, language = defaultLanguage, locked = false, onClose, open }: PricingDialogProps) {
  const copy = pricingCopy[language];
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(currentCycle ?? "yearly");
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

              <div className="mx-auto mt-4 grid h-16 max-w-[380px] grid-cols-2 rounded-full bg-slate-100 p-1.5 shadow-inner">
                <button className={["rounded-full text-xl font-black transition", billingCycle === "monthly" ? "bg-white text-slate-950 shadow" : "text-slate-500"].join(" ")} onClick={() => setBillingCycle("monthly")} type="button">
                  {copy.billingMonthly}
                </button>
                <button className={["relative flex items-center justify-center rounded-full text-xl font-black transition", billingCycle === "yearly" ? "bg-[#2563EB] text-white shadow-md shadow-blue-100" : "text-slate-500"].join(" ")} onClick={() => setBillingCycle("yearly")} type="button">
                  {copy.billingYearly}
                  <span className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-100 px-3.5 py-1 text-sm font-black leading-none text-emerald-700 shadow-sm">{copy.saveYearly}</span>
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <PlanCard billingCycle={billingCycle} copy={copy} currentCycle={currentCycle} currentPlan={currentPlan} expired={expired} language={language} onSelect={setCheckoutPlan} plan="maker" />
              <PlanCard billingCycle={billingCycle} copy={copy} currentCycle={currentCycle} currentPlan={currentPlan} expired={expired} language={language} onSelect={setCheckoutPlan} plan="studio" />
            </div>

            {canCancel ? <CancelPlanControl copy={copy} /> : null}

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
  const isActive = status === "active";
  const currentPlan: PlanKey | null = isActive && (profile.subscription_plan === "maker" || profile.subscription_plan === "studio") ? profile.subscription_plan : null;
  const currentCycle: BillingCycle | null = isActive && (profile.billing_cycle === "monthly" || profile.billing_cycle === "yearly") ? profile.billing_cycle : null;
  const canCancel = isActive && Boolean(profile.stripe_subscription_id);
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
    function handleLanguage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "printcost:language") return;
      setLanguage(normalizePricingLanguage(event.data?.language));
    }

    window.addEventListener("message", handleLanguage);
    return () => window.removeEventListener("message", handleLanguage);
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

      <PricingDialog canCancel={canCancel} currentCycle={currentCycle} currentPlan={currentPlan} expired={expired} language={language} locked={expired} onClose={() => setOpen(false)} open={open} />
    </>
  );
}



