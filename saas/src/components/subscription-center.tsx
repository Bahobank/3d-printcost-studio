"use client";

import { useEffect, useState } from "react";
import { Check, Copy, CreditCard, Crown, ExternalLink, Gift, Receipt, Wallet, X } from "lucide-react";
import type { PricingLanguage } from "@/components/pricing-modal";

type PlanInfo = {
  plan: "maker" | "studio" | null;
  status: string;
  billingCycle: "monthly" | "yearly" | null;
  trialEndAt: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  autoRenew: boolean;
  canCancel: boolean;
};

type WalletTxn = { type: string; amount: number; date: number; description: string | null };

type Overview = {
  plan: PlanInfo;
  paymentMethod: { brand: string; last4: string } | null;
  invoices: Array<{ id: string; date: number; amount: number; currency: string; status: string | null; planLabel: string; receiptUrl: string | null }>;
  wallet: { balance: number; earned: number; spent: number; history: WalletTxn[] };
  referral: { code: string; link: string };
};

type AccountCopy = {
  title: string;
  loading: string;
  close: string;
  planSection: string;
  paymentSection: string;
  historySection: string;
  walletSection: string;
  referralSection: string;
  manageSection: string;
  status: Record<string, string>;
  noPlanYet: string;
  autoRenew: string;
  on: string;
  off: string;
  nextBilling: string;
  usableUntil: string;
  trialEnds: string;
  changePlan: string;
  noPaymentMethod: string;
  managePayment: string;
  noHistory: string;
  downloadReceipt: string;
  invoiceStatus: Record<string, string>;
  walletBalance: string;
  walletEarned: string;
  walletSpent: string;
  walletHistoryBtn: string;
  walletHistoryHide: string;
  walletNote: string;
  walletEmpty: string;
  txnType: Record<string, string>;
  referralCodeLabel: string;
  copyCode: string;
  referralLinkLabel: string;
  copyLink: string;
  referralNote: string;
  copied: string;
  cancelPlan: string;
  cancelTitle: string;
  cancelBody: string;
  keepUsing: string;
  confirmCancel: string;
  canceling: string;
  cancelSuccess: string;
  cancelError: string;
  scheduledTitle: string;
  resumePlan: string;
  resuming: string;
  resumed: string;
  resumeError: string;
};

const accountCopy: Record<PricingLanguage, AccountCopy> = {
  th: {
    title: "แพ็กเกจและการชำระเงิน",
    loading: "กำลังโหลด...",
    close: "ปิด",
    planSection: "แพ็กเกจปัจจุบัน",
    paymentSection: "วิธีชำระเงิน",
    historySection: "ประวัติการชำระเงิน",
    walletSection: "Wallet",
    referralSection: "แนะนำเพื่อน",
    manageSection: "จัดการแพ็กเกจ",
    status: { active: "ใช้งานอยู่", trialing: "ทดลองใช้งาน", expired: "หมดอายุ", canceled: "ยกเลิกแล้ว", past_due: "ค้างชำระ" },
    noPlanYet: "ยังไม่ได้สมัครแพ็กเกจ",
    autoRenew: "ต่ออายุอัตโนมัติ",
    on: "เปิด",
    off: "ปิด",
    nextBilling: "รอบบิลถัดไป",
    usableUntil: "ใช้งานได้ถึง",
    trialEnds: "ทดลองใช้ได้ถึง",
    changePlan: "เปลี่ยนแพ็กเกจ",
    noPaymentMethod: "ยังไม่มีวิธีชำระเงินที่บันทึกไว้",
    managePayment: "จัดการวิธีชำระเงิน",
    noHistory: "ยังไม่มีประวัติการชำระเงิน",
    downloadReceipt: "ดาวน์โหลดใบเสร็จ",
    invoiceStatus: { paid: "ชำระแล้ว", open: "ค้างชำระ", void: "ยกเลิก", draft: "ฉบับร่าง", uncollectible: "เก็บเงินไม่ได้" },
    walletBalance: "เครดิตคงเหลือ",
    walletEarned: "เครดิตที่ได้รับทั้งหมด",
    walletSpent: "เครดิตที่ใช้ไปแล้ว",
    walletHistoryBtn: "ดูประวัติ Wallet",
    walletHistoryHide: "ซ่อนประวัติ Wallet",
    walletNote: "เครดิตใน Wallet ใช้ได้เฉพาะภายใน 3D PrintCost Studio เช่น ต่ออายุแพ็กเกจหรือซื้อบริการเสริม ไม่สามารถถอนเป็นเงินสดหรือโอนให้ผู้อื่นได้",
    walletEmpty: "ยังไม่มีรายการ Wallet",
    txnType: { topup: "เติมเงิน", refund: "คืนเงิน", adjustment: "ปรับยอด/เครดิตแนะนำเพื่อน", subscription_payment: "ชำระแพ็กเกจ", subscription_renewal: "ต่ออายุแพ็กเกจ" },
    referralCodeLabel: "โค้ดแนะนำเพื่อนของคุณ",
    copyCode: "คัดลอกโค้ด",
    referralLinkLabel: "ลิงก์แนะนำเพื่อน",
    copyLink: "คัดลอกลิงก์",
    referralNote: "เมื่อเพื่อนสมัครและชำระเงินสำเร็จ คุณจะได้รับเครดิตเข้า Wallet เพื่อใช้ต่ออายุแพ็กเกจหรือบริการภายในระบบ",
    copied: "คัดลอกแล้ว",
    cancelPlan: "ยกเลิกแพ็กเกจ",
    cancelTitle: "ยืนยันการยกเลิกแพ็กเกจ?",
    cancelBody: "คุณจะยังใช้งานแพ็กเกจปัจจุบันได้จนถึงสิ้นรอบบิล หลังจากนั้นระบบจะไม่ต่ออายุอัตโนมัติ",
    keepUsing: "กลับไปใช้งานต่อ",
    confirmCancel: "ยืนยันการยกเลิก",
    canceling: "กำลังยกเลิก...",
    cancelSuccess: "ยกเลิกแล้ว คุณจะใช้งานได้จนถึงสิ้นรอบการชำระเงินปัจจุบัน",
    cancelError: "ยกเลิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
    scheduledTitle: "ยกเลิกการต่ออายุแล้ว",
    resumePlan: "เปิดต่ออายุอีกครั้ง",
    resuming: "กำลังดำเนินการ...",
    resumed: "เปิดต่ออายุอัตโนมัติอีกครั้งแล้ว แพ็กเกจจะต่ออายุตามปกติ",
    resumeError: "ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
  },
  en: {
    title: "Plan & billing",
    loading: "Loading...",
    close: "Close",
    planSection: "Current plan",
    paymentSection: "Payment method",
    historySection: "Payment history",
    walletSection: "Wallet",
    referralSection: "Refer a friend",
    manageSection: "Manage plan",
    status: { active: "Active", trialing: "Free trial", expired: "Expired", canceled: "Canceled", past_due: "Past due" },
    noPlanYet: "No plan yet",
    autoRenew: "Auto-renewal",
    on: "On",
    off: "Off",
    nextBilling: "Next billing date",
    usableUntil: "Access until",
    trialEnds: "Trial ends",
    changePlan: "Change plan",
    noPaymentMethod: "No saved payment method",
    managePayment: "Manage payment method",
    noHistory: "No payment history yet",
    downloadReceipt: "Download receipt",
    invoiceStatus: { paid: "Paid", open: "Open", void: "Void", draft: "Draft", uncollectible: "Uncollectible" },
    walletBalance: "Current balance",
    walletEarned: "Total earned",
    walletSpent: "Total spent",
    walletHistoryBtn: "View Wallet history",
    walletHistoryHide: "Hide Wallet history",
    walletNote: "Wallet credit can only be used within 3D PrintCost Studio, such as renewing your plan or buying add-ons. It cannot be withdrawn as cash or transferred to others.",
    walletEmpty: "No Wallet activity yet",
    txnType: { topup: "Top-up", refund: "Refund", adjustment: "Adjustment / referral credit", subscription_payment: "Plan payment", subscription_renewal: "Plan renewal" },
    referralCodeLabel: "Your referral code",
    copyCode: "Copy code",
    referralLinkLabel: "Referral link",
    copyLink: "Copy link",
    referralNote: "When a friend signs up and pays successfully, you receive Wallet credit to renew your plan or pay for services in the app.",
    copied: "Copied",
    cancelPlan: "Cancel plan",
    cancelTitle: "Cancel your plan?",
    cancelBody: "You'll keep access to your current plan until the end of the billing period. After that, it won't renew automatically.",
    keepUsing: "Keep my plan",
    confirmCancel: "Confirm cancellation",
    canceling: "Canceling...",
    cancelSuccess: "Canceled. You'll keep access until the end of the current billing period.",
    cancelError: "Couldn't cancel. Please try again.",
    scheduledTitle: "Cancellation scheduled",
    resumePlan: "Resume auto-renewal",
    resuming: "Resuming...",
    resumed: "Auto-renewal resumed. Your plan will keep renewing.",
    resumeError: "Couldn't resume. Please try again.",
  },
  zh: {
    title: "套餐与账单",
    loading: "加载中...",
    close: "关闭",
    planSection: "当前套餐",
    paymentSection: "支付方式",
    historySection: "支付记录",
    walletSection: "钱包",
    referralSection: "推荐好友",
    manageSection: "管理套餐",
    status: { active: "使用中", trialing: "免费试用", expired: "已过期", canceled: "已取消", past_due: "逾期" },
    noPlanYet: "尚未订阅套餐",
    autoRenew: "自动续订",
    on: "开启",
    off: "关闭",
    nextBilling: "下次扣费日期",
    usableUntil: "可使用至",
    trialEnds: "试用截止",
    changePlan: "更换套餐",
    noPaymentMethod: "尚未保存支付方式",
    managePayment: "管理支付方式",
    noHistory: "暂无支付记录",
    downloadReceipt: "下载收据",
    invoiceStatus: { paid: "已支付", open: "待支付", void: "作废", draft: "草稿", uncollectible: "无法收款" },
    walletBalance: "当前余额",
    walletEarned: "累计获得",
    walletSpent: "累计使用",
    walletHistoryBtn: "查看钱包记录",
    walletHistoryHide: "隐藏钱包记录",
    walletNote: "钱包余额仅可在 3D PrintCost Studio 内使用，例如续订套餐或购买增值服务，不能提现或转让给他人。",
    walletEmpty: "暂无钱包记录",
    txnType: { topup: "充值", refund: "退款", adjustment: "调整 / 推荐奖励", subscription_payment: "套餐支付", subscription_renewal: "套餐续订" },
    referralCodeLabel: "你的推荐码",
    copyCode: "复制推荐码",
    referralLinkLabel: "推荐链接",
    copyLink: "复制链接",
    referralNote: "当好友注册并成功付款后，你将获得钱包余额，可用于续订套餐或支付系统内服务。",
    copied: "已复制",
    cancelPlan: "取消套餐",
    cancelTitle: "确认取消套餐？",
    cancelBody: "在当前计费周期结束前，你仍可使用当前套餐。之后将不再自动续订。",
    keepUsing: "继续使用",
    confirmCancel: "确认取消",
    canceling: "正在取消...",
    cancelSuccess: "已取消。在当前计费周期结束前你仍可使用。",
    cancelError: "取消失败，请重试。",
    scheduledTitle: "已安排取消",
    resumePlan: "恢复自动续订",
    resuming: "处理中...",
    resumed: "已恢复自动续订，套餐将正常续订。",
    resumeError: "操作失败，请重试。",
  },
  ja: {
    title: "プランと請求",
    loading: "読み込み中...",
    close: "閉じる",
    planSection: "現在のプラン",
    paymentSection: "お支払い方法",
    historySection: "お支払い履歴",
    walletSection: "ウォレット",
    referralSection: "友だち紹介",
    manageSection: "プラン管理",
    status: { active: "利用中", trialing: "無料トライアル", expired: "期限切れ", canceled: "解約済み", past_due: "支払い遅延" },
    noPlanYet: "プラン未加入",
    autoRenew: "自動更新",
    on: "オン",
    off: "オフ",
    nextBilling: "次回の請求日",
    usableUntil: "利用可能期限",
    trialEnds: "トライアル終了",
    changePlan: "プランを変更",
    noPaymentMethod: "保存されたお支払い方法はありません",
    managePayment: "お支払い方法を管理",
    noHistory: "お支払い履歴はまだありません",
    downloadReceipt: "領収書をダウンロード",
    invoiceStatus: { paid: "支払い済み", open: "未払い", void: "無効", draft: "下書き", uncollectible: "回収不能" },
    walletBalance: "現在の残高",
    walletEarned: "獲得合計",
    walletSpent: "利用合計",
    walletHistoryBtn: "ウォレット履歴を見る",
    walletHistoryHide: "ウォレット履歴を隠す",
    walletNote: "ウォレットのクレジットは 3D PrintCost Studio 内（プラン更新や追加サービスの購入など）でのみ利用でき、現金化や他者への譲渡はできません。",
    walletEmpty: "ウォレットの履歴はまだありません",
    txnType: { topup: "チャージ", refund: "返金", adjustment: "調整 / 紹介クレジット", subscription_payment: "プラン支払い", subscription_renewal: "プラン更新" },
    referralCodeLabel: "あなたの紹介コード",
    copyCode: "コードをコピー",
    referralLinkLabel: "紹介リンク",
    copyLink: "リンクをコピー",
    referralNote: "友だちが登録して支払いを完了すると、プラン更新やアプリ内サービスに使えるウォレットクレジットを獲得できます。",
    copied: "コピーしました",
    cancelPlan: "プランを解約",
    cancelTitle: "プランを解約しますか？",
    cancelBody: "現在の請求期間の終了まで現在のプランをご利用いただけます。その後は自動更新されません。",
    keepUsing: "利用を続ける",
    confirmCancel: "解約を確定",
    canceling: "解約中...",
    cancelSuccess: "解約しました。現在の請求期間の終了までご利用いただけます。",
    cancelError: "解約できませんでした。もう一度お試しください。",
    scheduledTitle: "解約予定です",
    resumePlan: "自動更新を再開",
    resuming: "処理中...",
    resumed: "自動更新を再開しました。プランは継続更新されます。",
    resumeError: "再開できませんでした。もう一度お試しください。",
  },
  ko: {
    title: "요금제 및 결제",
    loading: "불러오는 중...",
    close: "닫기",
    planSection: "현재 요금제",
    paymentSection: "결제 수단",
    historySection: "결제 내역",
    walletSection: "지갑",
    referralSection: "친구 추천",
    manageSection: "요금제 관리",
    status: { active: "사용 중", trialing: "무료 체험", expired: "만료됨", canceled: "해지됨", past_due: "연체" },
    noPlanYet: "가입한 요금제 없음",
    autoRenew: "자동 갱신",
    on: "켜짐",
    off: "꺼짐",
    nextBilling: "다음 결제일",
    usableUntil: "사용 가능 기한",
    trialEnds: "체험 종료",
    changePlan: "요금제 변경",
    noPaymentMethod: "저장된 결제 수단이 없습니다",
    managePayment: "결제 수단 관리",
    noHistory: "아직 결제 내역이 없습니다",
    downloadReceipt: "영수증 다운로드",
    invoiceStatus: { paid: "결제 완료", open: "미결제", void: "취소", draft: "초안", uncollectible: "회수 불가" },
    walletBalance: "현재 잔액",
    walletEarned: "총 적립",
    walletSpent: "총 사용",
    walletHistoryBtn: "지갑 내역 보기",
    walletHistoryHide: "지갑 내역 숨기기",
    walletNote: "지갑 크레딧은 3D PrintCost Studio 내에서만(요금제 갱신 또는 부가 서비스 구매 등) 사용할 수 있으며 현금 인출이나 타인에게 양도할 수 없습니다.",
    walletEmpty: "아직 지갑 활동이 없습니다",
    txnType: { topup: "충전", refund: "환불", adjustment: "조정 / 추천 크레딧", subscription_payment: "요금제 결제", subscription_renewal: "요금제 갱신" },
    referralCodeLabel: "내 추천 코드",
    copyCode: "코드 복사",
    referralLinkLabel: "추천 링크",
    copyLink: "링크 복사",
    referralNote: "친구가 가입하고 결제를 완료하면 요금제 갱신이나 앱 내 서비스에 사용할 수 있는 지갑 크레딧을 받습니다.",
    copied: "복사됨",
    cancelPlan: "요금제 해지",
    cancelTitle: "요금제를 해지하시겠어요?",
    cancelBody: "현재 청구 기간이 끝날 때까지 현재 요금제를 계속 사용할 수 있습니다. 이후에는 자동으로 갱신되지 않습니다.",
    keepUsing: "계속 사용",
    confirmCancel: "해지 확정",
    canceling: "해지 중...",
    cancelSuccess: "해지되었습니다. 현재 청구 기간이 끝날 때까지 사용할 수 있습니다.",
    cancelError: "해지하지 못했습니다. 다시 시도해 주세요.",
    scheduledTitle: "해지 예약됨",
    resumePlan: "자동 갱신 재개",
    resuming: "처리 중...",
    resumed: "자동 갱신이 재개되었습니다. 요금제가 계속 갱신됩니다.",
    resumeError: "재개하지 못했습니다. 다시 시도해 주세요.",
  },
};

const localeTags: Record<PricingLanguage, string> = { th: "th-TH", en: "en-US", zh: "zh-CN", ja: "ja-JP", ko: "ko-KR" };

// Wallet/credit is stored in THB internally. It is displayed in the user's chosen
// currency (from the calculator's currency picker), converted at these display rates
// (THB per 1 unit). USD mirrors the plan price mapping where ฿199 ≈ $5.99.
const CURRENCY_THB_RATE: Record<string, number> = {
  THB: 1, USD: 33.2, EUR: 36, GBP: 42, JPY: 0.22, CNY: 4.6, KRW: 0.025,
  AUD: 22, CAD: 24, SGD: 25, HKD: 4.3, TWD: 1.05, INR: 0.4, MYR: 7.4,
  IDR: 0.0021, PHP: 0.59, VND: 0.0013, AED: 9, BRL: 6, MXN: 1.9, ZAR: 1.8,
};
const CURRENCY_FMT: Record<string, { locale: string; decimals: number }> = {
  THB: { locale: "th-TH", decimals: 0 }, USD: { locale: "en-US", decimals: 2 }, EUR: { locale: "de-DE", decimals: 2 },
  GBP: { locale: "en-GB", decimals: 2 }, JPY: { locale: "ja-JP", decimals: 0 }, CNY: { locale: "zh-CN", decimals: 2 },
  KRW: { locale: "ko-KR", decimals: 0 }, AUD: { locale: "en-AU", decimals: 2 }, CAD: { locale: "en-CA", decimals: 2 },
  SGD: { locale: "en-SG", decimals: 2 }, HKD: { locale: "en-HK", decimals: 2 }, TWD: { locale: "zh-TW", decimals: 2 },
  INR: { locale: "en-IN", decimals: 2 }, MYR: { locale: "ms-MY", decimals: 2 }, IDR: { locale: "id-ID", decimals: 0 },
  PHP: { locale: "en-PH", decimals: 2 }, VND: { locale: "vi-VN", decimals: 0 }, AED: { locale: "en-AE", decimals: 2 },
  BRL: { locale: "pt-BR", decimals: 2 }, MXN: { locale: "es-MX", decimals: 2 }, ZAR: { locale: "en-ZA", decimals: 2 },
};
const CURRENCY_BY_LANG: Record<PricingLanguage, string> = { th: "THB", en: "USD", zh: "CNY", ja: "JPY", ko: "KRW" };

function planTitle(plan: PlanInfo["plan"]) {
  if (plan === "studio") return "Studio";
  if (plan === "maker") return "Maker";
  return null;
}

function CopyButton({ value, label, copiedLabel }: { value: string; label: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }
  return (
    <button className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 text-sm font-black text-blue-700 transition hover:bg-blue-100" onClick={copy} type="button">
      {copied ? <Check size={15} /> : <Copy size={15} />}
      {copied ? copiedLabel : label}
    </button>
  );
}

function SectionCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-[#2563EB]">{icon}</span>
        <h3 className="text-base font-black text-slate-950 sm:text-lg">{title}</h3>
      </div>
      {children}
    </section>
  );
}

export function SubscriptionCenter({ open, language, currency, onClose, onChangePlan }: { open: boolean; language: PricingLanguage; currency?: string; onClose: () => void; onChangePlan: () => void }) {
  const copy = accountCopy[language];
  const walletCurrency = currency && CURRENCY_THB_RATE[currency] ? currency : CURRENCY_BY_LANG[language];
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(false);
  const [showWalletHistory, setShowWalletHistory] = useState(false);
  const [cancelState, setCancelState] = useState<"idle" | "confirm" | "loading" | "done" | "error">("idle");
  const [resumeState, setResumeState] = useState<"idle" | "loading" | "done" | "error">("idle");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setShowWalletHistory(false);
    setCancelState("idle");
    setResumeState("idle");
    fetch("/api/account/overview")
      .then((response) => response.json())
      .then((payload) => {
        if (!cancelled) setData(payload as Overview);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) return null;

  function formatDate(value: string | number | null) {
    if (!value) return "-";
    const date = typeof value === "number" ? new Date(value * 1000) : new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat(localeTags[language], { day: "numeric", month: "short", year: "numeric" }).format(date);
  }

  function formatThb(amountThb: number) {
    const code = walletCurrency;
    const rate = CURRENCY_THB_RATE[code] ?? 1;
    const fmt = CURRENCY_FMT[code] ?? CURRENCY_FMT.THB;
    return new Intl.NumberFormat(fmt.locale, { style: "currency", currency: code, maximumFractionDigits: fmt.decimals }).format(amountThb / rate);
  }

  function formatInvoice(amount: number, currency: string) {
    try {
      return new Intl.NumberFormat(localeTags[language], { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
    } catch {
      return `${amount} ${currency}`;
    }
  }

  const plan = data?.plan;
  const statusKey = plan?.status ?? "trialing";
  const name = planTitle(plan?.plan ?? null);
  const periodLabel = plan?.status === "trialing"
    ? copy.trialEnds
    : plan?.cancelAtPeriodEnd
      ? copy.usableUntil
      : copy.nextBilling;
  const periodValue = plan?.status === "trialing" ? plan?.trialEndAt : plan?.currentPeriodEnd;

  async function cancelPlan() {
    setCancelState("loading");
    try {
      const response = await fetch("/api/stripe/cancel", { method: "POST" });
      if (!response.ok) throw new Error();
      try {
        const refreshed = (await fetch("/api/account/overview").then((r) => r.json())) as Overview;
        setData(refreshed);
      } catch {
        // keep existing data; the success message still shows the known period end
      }
      setCancelState("done");
    } catch {
      setCancelState("error");
    }
  }

  async function resumePlan() {
    setResumeState("loading");
    try {
      const response = await fetch("/api/stripe/resume", { method: "POST" });
      if (!response.ok) throw new Error();
      try {
        const refreshed = (await fetch("/api/account/overview").then((r) => r.json())) as Overview;
        setData(refreshed);
      } catch {
        // keep existing data
      }
      setResumeState("done");
    } catch {
      setResumeState("error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/72 px-3 py-6 backdrop-blur-sm sm:px-6" onClick={onClose}>
      <div className="relative mx-auto w-full max-w-3xl rounded-2xl border border-blue-50 bg-slate-50 p-4 text-slate-950 shadow-[0_30px_90px_rgba(2,6,23,0.36)] sm:p-6" onClick={(event) => event.stopPropagation()}>
        <button aria-label={copy.close} className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white text-slate-700 shadow hover:bg-slate-100" onClick={onClose} type="button">
          <X size={22} />
        </button>

        <h2 className="pr-12 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{copy.title}</h2>

        {loading && !data ? (
          <p className="mt-6 text-center text-sm font-bold text-slate-500">{copy.loading}</p>
        ) : (
          <div className="mt-5 space-y-4">
            {/* A) Current plan */}
            <SectionCard icon={<Crown size={18} />} title={copy.planSection}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-2xl font-black text-slate-950">{name ?? copy.noPlanYet}</span>
                <span className={["rounded-full px-3 py-1 text-xs font-black", statusKey === "active" ? "bg-emerald-100 text-emerald-700" : statusKey === "trialing" ? "bg-blue-100 text-blue-700" : statusKey === "past_due" ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-600"].join(" ")}>
                  {copy.status[statusKey] ?? statusKey}
                </span>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {plan?.canCancel || plan?.status === "active" ? (
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <p className="text-xs font-bold text-slate-500">{copy.autoRenew}</p>
                    <p className="text-sm font-black text-slate-900">{plan?.autoRenew ? copy.on : copy.off}</p>
                  </div>
                ) : null}
                {periodValue ? (
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <p className="text-xs font-bold text-slate-500">{periodLabel}</p>
                    <p className="text-sm font-black text-slate-900">{formatDate(periodValue)}</p>
                  </div>
                ) : null}
              </div>
              <button className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-[#2563EB] px-5 text-sm font-black text-white transition hover:bg-blue-700" onClick={onChangePlan} type="button">
                {copy.changePlan}
              </button>
            </SectionCard>

            {/* B) Payment method */}
            <SectionCard icon={<CreditCard size={18} />} title={copy.paymentSection}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-black text-slate-900">
                  {data?.paymentMethod ? `${data.paymentMethod.brand.toUpperCase()} •••• ${data.paymentMethod.last4}` : <span className="font-bold text-slate-500">{copy.noPaymentMethod}</span>}
                </p>
                <form action="/api/stripe/portal" method="POST">
                  <button className="inline-flex h-10 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-100" type="submit">
                    {copy.managePayment}
                  </button>
                </form>
              </div>
            </SectionCard>

            {/* C) Payment history */}
            <SectionCard icon={<Receipt size={18} />} title={copy.historySection}>
              {data && data.invoices.length > 0 ? (
                <ul className="space-y-2">
                  {data.invoices.map((invoice) => (
                    <li className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2" key={invoice.id}>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900">{formatInvoice(invoice.amount, invoice.currency)}</p>
                        <p className="truncate text-xs font-bold text-slate-500">{formatDate(invoice.date)}{invoice.planLabel ? ` · ${invoice.planLabel}` : ""}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={["rounded-full px-2.5 py-1 text-[11px] font-black", invoice.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"].join(" ")}>
                          {(invoice.status && copy.invoiceStatus[invoice.status]) ?? invoice.status ?? ""}
                        </span>
                        {invoice.receiptUrl ? (
                          <a className="inline-flex h-9 items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 text-xs font-black text-blue-700 transition hover:bg-blue-100" href={invoice.receiptUrl} rel="noreferrer" target="_blank">
                            <ExternalLink size={13} />
                            {copy.downloadReceipt}
                          </a>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-xl bg-slate-50 px-3 py-3 text-sm font-bold text-slate-500">{copy.noHistory}</p>
              )}
            </SectionCard>

            {/* D) Wallet */}
            <SectionCard icon={<Wallet size={18} />} title={copy.walletSection}>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div className="rounded-xl bg-violet-50 px-3 py-3">
                  <p className="text-xs font-bold text-violet-500">{copy.walletBalance}</p>
                  <p className="text-xl font-black text-violet-700">{formatThb(data?.wallet.balance ?? 0)}</p>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-3">
                  <p className="text-xs font-bold text-slate-500">{copy.walletEarned}</p>
                  <p className="text-xl font-black text-emerald-600">{formatThb(data?.wallet.earned ?? 0)}</p>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-3">
                  <p className="text-xs font-bold text-slate-500">{copy.walletSpent}</p>
                  <p className="text-xl font-black text-slate-700">{formatThb(data?.wallet.spent ?? 0)}</p>
                </div>
              </div>
              <button className="mt-3 text-sm font-black text-violet-700 underline-offset-2 hover:underline" onClick={() => setShowWalletHistory((value) => !value)} type="button">
                {showWalletHistory ? copy.walletHistoryHide : copy.walletHistoryBtn}
              </button>
              {showWalletHistory ? (
                data && data.wallet.history.length > 0 ? (
                  <ul className="mt-2 space-y-1.5">
                    {data.wallet.history.map((txn, index) => {
                      const isSpend = txn.type === "subscription_payment" || txn.type === "subscription_renewal";
                      return (
                        <li className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm" key={index}>
                          <span className="min-w-0 truncate font-bold text-slate-600">{copy.txnType[txn.type] ?? txn.type}<span className="text-slate-400"> · {formatDate(txn.date)}</span></span>
                          <span className={["shrink-0 font-black", isSpend ? "text-slate-500" : "text-emerald-600"].join(" ")}>{isSpend ? "-" : "+"}{formatThb(txn.amount)}</span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-500">{copy.walletEmpty}</p>
                )
              ) : null}
              <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold leading-5 text-slate-500">{copy.walletNote}</p>
            </SectionCard>

            {/* E) Referral */}
            <SectionCard icon={<Gift size={18} />} title={copy.referralSection}>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-bold text-slate-500">{copy.referralCodeLabel}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="rounded-xl bg-slate-100 px-3 py-2 text-base font-black tracking-wider text-slate-900">{data?.referral.code ?? "..."}</span>
                    {data?.referral.code ? <CopyButton value={data.referral.code} label={copy.copyCode} copiedLabel={copy.copied} /> : null}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500">{copy.referralLinkLabel}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="min-w-0 flex-1 truncate rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">{data?.referral.link ?? "..."}</span>
                    {data?.referral.link ? <CopyButton value={data.referral.link} label={copy.copyLink} copiedLabel={copy.copied} /> : null}
                  </div>
                </div>
                <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold leading-5 text-emerald-800">{copy.referralNote}</p>
              </div>
            </SectionCard>

            {/* F) Manage plan — cancel (low-emphasis, confirm required) */}
            {plan?.canCancel ? (
              <SectionCard icon={<Crown size={18} />} title={copy.manageSection}>
                {cancelState === "done" ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3">
                    <p className="text-sm font-black text-emerald-700">{copy.cancelSuccess}</p>
                    {periodValue ? <p className="mt-1 text-sm font-black text-emerald-800">{copy.usableUntil}: {formatDate(periodValue)}</p> : null}
                  </div>
                ) : resumeState === "done" ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3">
                    <p className="text-sm font-black text-emerald-700">{copy.resumed}</p>
                  </div>
                ) : plan?.cancelAtPeriodEnd ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                    <p className="text-sm font-black text-amber-900">{copy.scheduledTitle}</p>
                    {periodValue ? <p className="mt-1 text-sm font-bold text-amber-800">{copy.usableUntil}: {formatDate(periodValue)}</p> : null}
                    <button className="mt-3 h-10 rounded-xl bg-[#2563EB] px-4 text-sm font-black text-white transition hover:bg-blue-700 disabled:opacity-60" disabled={resumeState === "loading"} onClick={resumePlan} type="button">
                      {resumeState === "loading" ? copy.resuming : copy.resumePlan}
                    </button>
                    {resumeState === "error" ? <p className="mt-2 text-xs font-black text-rose-600">{copy.resumeError}</p> : null}
                  </div>
                ) : cancelState === "confirm" || cancelState === "loading" || cancelState === "error" ? (
                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <p className="text-sm font-black text-slate-950">{copy.cancelTitle}</p>
                    <p className="mt-1 text-sm font-bold leading-6 text-slate-500">{copy.cancelBody}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button className="h-10 rounded-xl bg-[#2563EB] px-4 text-sm font-black text-white transition hover:bg-blue-700 disabled:opacity-60" disabled={cancelState === "loading"} onClick={() => setCancelState("idle")} type="button">
                        {copy.keepUsing}
                      </button>
                      <button className="h-10 rounded-xl border border-rose-200 bg-white px-4 text-sm font-black text-rose-600 transition hover:bg-rose-50 disabled:opacity-60" disabled={cancelState === "loading"} onClick={cancelPlan} type="button">
                        {cancelState === "loading" ? copy.canceling : copy.confirmCancel}
                      </button>
                    </div>
                    {cancelState === "error" ? <p className="mt-2 text-xs font-black text-rose-600">{copy.cancelError}</p> : null}
                  </div>
                ) : (
                  <button className="text-sm font-bold text-slate-400 underline-offset-2 transition hover:text-rose-600 hover:underline" onClick={() => setCancelState("confirm")} type="button">
                    {copy.cancelPlan}
                  </button>
                )}
              </SectionCard>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
