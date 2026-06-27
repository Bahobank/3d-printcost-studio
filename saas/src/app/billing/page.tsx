import Link from "next/link";
import { AlertTriangle, CheckCircle2, CreditCard, QrCode, ShieldCheck, Wallet } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { getSessionAndProfile } from "@/lib/subscription";

type BillingPageProps = {
  searchParams?: Promise<{
    amount?: string | string[];
    billingCycle?: string | string[];
    checkout?: string | string[];
    needed?: string | string[];
    paymentMode?: string | string[];
    plan?: string | string[];
    reason?: string | string[];
  }>;
};

const planDetails = {
  maker: {
    title: "Maker",
    description: "สำหรับผู้ใช้งานเครื่องพิมพ์ FDM",
    monthly: "฿199 / เดือน",
    yearly: "฿1,790 / ปี",
  },
  studio: {
    title: "Studio",
    description: "สำหรับธุรกิจที่ใช้งานทั้ง FDM และ Resin",
    monthly: "฿299 / เดือน",
    yearly: "฿2,790 / ปี",
  },
};

const topUpAmounts = [100, 300, 500, 1000, 2000];

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function selectedCheckoutPlan(plan?: string) {
  return plan === "maker" || plan === "studio" ? plan : "studio";
}

function selectedBillingCycle(billingCycle?: string) {
  return billingCycle === "monthly" || billingCycle === "yearly" ? billingCycle : "yearly";
}

function checkoutSuccessText(paymentMode?: string) {
  if (paymentMode === "promptpay_period") {
    return "Stripe ยืนยันการชำระเงิน PromptPay แล้ว ระบบจะเปิดใช้งานแพ็กเกจตามช่วงเวลาที่คุณชำระ";
  }
  if (paymentMode === "promptpay_subscription") {
    return "Stripe ยืนยันการชำระเงิน PromptPay แล้ว ระบบจะเปิดใช้งานแพ็กเกจและต่ออายุอัตโนมัติให้ตามรอบที่เลือก";
  }
  if (paymentMode === "truemoney_subscription") {
    return "Stripe ยืนยันการชำระเงิน TrueMoney Wallet แล้ว ระบบจะเปิดใช้งานแพ็กเกจและต่ออายุอัตโนมัติให้ตามรอบที่เลือก";
  }
  if (paymentMode === "wallet") {
    return "ระบบหักยอดจาก Wallet และเปิดใช้งานแพ็กเกจแล้ว";
  }
  return "Stripe ยืนยันการชำระเงินแล้ว ระบบจะอัปเดตสถานะแพ็กเกจผ่าน webhook โดยอัตโนมัติ";
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const { profile } = await getSessionAndProfile();
  const params = searchParams ? await searchParams : undefined;
  const checkoutMode = firstParam(params?.checkout);
  const paymentMode = firstParam(params?.paymentMode);
  const planKey = selectedCheckoutPlan(firstParam(params?.plan));
  const billingCycle = selectedBillingCycle(firstParam(params?.billingCycle));
  const selectedPlan = planDetails[planKey];
  const billingLabel = billingCycle === "yearly" ? "รายปี" : "รายเดือน";
  const selectedPrice = billingCycle === "yearly" ? selectedPlan.yearly : selectedPlan.monthly;

  return (
    <AppShell profile={profile}>
      {checkoutMode === "success" || checkoutMode === "access-success" ? (
        <section className="card mx-auto max-w-3xl overflow-hidden p-0">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-500 px-8 py-7 text-white">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-white ring-1 ring-white/20">
              <CheckCircle2 size={30} strokeWidth={2.4} />
            </div>
            <h1 className="mt-5 text-3xl font-black tracking-tight">ชำระเงินสำเร็จ</h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-emerald-50">
              {checkoutMode === "access-success" ? "Access Code ถูกยืนยันแล้ว ระบบเปิดใช้งานแพ็กเกจให้คุณเรียบร้อย" : checkoutSuccessText(paymentMode)}
            </p>
          </div>

          <div className="space-y-6 p-8">
            <DataSafeCard />
            <BillingActions primaryHref="/dashboard" primaryLabel="กลับหน้าโปรแกรม" />
          </div>
        </section>
      ) : checkoutMode === "wallet-topup-success" ? (
        <section className="card mx-auto max-w-3xl overflow-hidden p-0">
          <div className="bg-gradient-to-r from-violet-600 to-blue-600 px-8 py-7 text-white">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-white ring-1 ring-white/20">
              <Wallet size={30} strokeWidth={2.4} />
            </div>
            <h1 className="mt-5 text-3xl font-black tracking-tight">เติมเงิน Wallet สำเร็จ</h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-violet-50">Stripe ยืนยันการชำระเงินแล้ว ยอด Wallet จะถูกเพิ่มผ่าน webhook โดยอัตโนมัติ</p>
          </div>

          <div className="space-y-6 p-8">
            <DataSafeCard />
            <BillingActions primaryHref="/billing" primaryLabel="กลับหน้า Billing" />
          </div>
        </section>
      ) : checkoutMode === "wallet-insufficient" ? (
        <section className="card mx-auto max-w-3xl overflow-hidden p-0">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-7 text-white">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-white ring-1 ring-white/20">
              <AlertTriangle size={30} strokeWidth={2.4} />
            </div>
            <h1 className="mt-5 text-3xl font-black tracking-tight">ยอด Wallet ไม่เพียงพอ</h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-orange-50">กรุณาเติมเงิน Wallet แล้วลองชำระอีกครั้ง</p>
          </div>

          <div className="space-y-6 p-8">
            <WalletTopUp />
            <BillingActions primaryHref="/pricing?lang=th" primaryLabel="กลับไปเลือกแพ็กเกจ" />
          </div>
        </section>
      ) : checkoutMode === "demo" ? (
        <section className="card mx-auto max-w-3xl overflow-hidden p-0">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-7 text-white">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-white ring-1 ring-white/20">
              <CreditCard size={30} strokeWidth={2.4} />
            </div>
            <h1 className="mt-5 text-3xl font-black tracking-tight">ตัวอย่าง Checkout</h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-blue-50">โหมดพัฒนาแสดงแพ็กเกจที่เลือกโดยไม่เปิด Stripe Checkout จริง</p>
          </div>

          <div className="space-y-6 p-8">
            <PlanSummary billingLabel={billingLabel} selectedPlan={selectedPlan} selectedPrice={selectedPrice} />
            <DataSafeCard />
            <BillingActions />
          </div>
        </section>
      ) : checkoutMode === "setup-required" ? (
        <section className="card mx-auto max-w-3xl overflow-hidden p-0">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-7 text-white">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-white ring-1 ring-white/20">
              <AlertTriangle size={30} strokeWidth={2.4} />
            </div>
            <h1 className="mt-5 text-3xl font-black tracking-tight">ไม่สามารถเปิด Stripe Checkout ได้</h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-orange-50">กรุณาลองใหม่อีกครั้ง หรือติดต่อทีมสนับสนุนหากยังพบปัญหา</p>
          </div>

          <div className="space-y-6 p-8">
            <PlanSummary billingLabel={billingLabel} selectedPlan={selectedPlan} selectedPrice={selectedPrice} />
            <DataSafeCard />
            <BillingActions />
          </div>
        </section>
      ) : checkoutMode === "payment-unavailable" ? (
        <section className="card mx-auto max-w-3xl overflow-hidden p-0">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-7 text-white">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-white ring-1 ring-white/20">
              <AlertTriangle size={30} strokeWidth={2.4} />
            </div>
            <h1 className="mt-5 text-3xl font-black tracking-tight">ไม่สามารถเปิดช่องทางชำระเงินนี้ได้</h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-orange-50">
              {paymentMode === "promptpay_period" || paymentMode === "promptpay_subscription"
                ? "PromptPay is not available for this payment. Please use card payment or contact support."
                : paymentMode === "truemoney_subscription"
                  ? "TrueMoney Wallet is not available for this payment. Please use card payment or contact support."
                  : "Stripe Checkout is temporarily unavailable. Please try again or use another payment method."}
            </p>
          </div>

          <div className="space-y-6 p-8">
            <PlanSummary billingLabel={billingLabel} selectedPlan={selectedPlan} selectedPrice={selectedPrice} />
            <DataSafeCard />
            <BillingActions />
          </div>
        </section>
      ) : (
        <section className="card p-7">
          <h1 className="text-3xl font-black">Billing</h1>
          <p className="mt-2 text-slate-500">จัดการแพ็กเกจ ต่ออายุ และวิธีชำระเงินผ่าน Stripe Billing, Stripe PromptPay และ Wallet</p>
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="font-bold">สถานะปัจจุบัน: {profile.subscription_status ?? "-"}</div>
            <div className="mt-1 text-slate-500">แพ็กเกจ: {profile.subscription_plan ?? "-"}</div>
            <div className="mt-1 text-slate-500">รอบชำระเงิน: {profile.billing_cycle ?? "-"}</div>
            {profile.stripe_customer_id ? (
              <div className="mt-5 flex flex-wrap gap-3">
                <form action="/api/stripe/portal" method="POST">
                  <button className="btn btn-primary" type="submit">
                    <CreditCard size={18} />
                    เปิด Stripe Billing Portal
                  </button>
                </form>
                <Link className="btn btn-secondary" href="/pricing?lang=th">
                  เปลี่ยนแพ็กเกจ/วิธีชำระเงิน
                </Link>
              </div>
            ) : (
              <Link className="btn btn-primary mt-5" href="/pricing?lang=th">
                เลือกแพ็กเกจ
              </Link>
            )}
          </div>

          <PaymentMethodOptions hasStripeCustomer={Boolean(profile.stripe_customer_id)} />
        </section>
      )}
    </AppShell>
  );
}

function PaymentMethodOptions({ hasStripeCustomer }: { hasStripeCustomer: boolean }) {
  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-4">
      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-[#2563EB] shadow-sm">
            <CreditCard size={22} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-950">บัตรเครดิต / เดบิต</h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">ชำระผ่าน Stripe Billing พร้อมต่ออายุอัตโนมัติ</p>
          </div>
        </div>
        {hasStripeCustomer ? (
          <form action="/api/stripe/portal" className="mt-5" method="POST">
            <button className="btn btn-primary w-full" type="submit">
              <CreditCard size={18} />
              จัดการผ่าน Stripe
            </button>
          </form>
        ) : (
          <Link className="btn btn-primary mt-5 w-full" href="/pricing?lang=th">
            <CreditCard size={18} />
            เลือกแพ็กเกจ
          </Link>
        )}
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-emerald-600 shadow-sm">
            <QrCode size={22} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-950">PromptPay ผ่าน Stripe</h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">จ่ายด้วย QR ผ่าน Stripe PromptPay สำหรับสมัครแพ็กเกจรายเดือน/รายปี</p>
          </div>
        </div>
        <Link className="btn mt-5 w-full border-emerald-700 bg-emerald-600 text-white hover:bg-emerald-700" href="/pricing?lang=th">
          <QrCode size={18} />
          เลือก PromptPay
        </Link>
      </div>

      <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-amber-600 shadow-sm">
            <Wallet size={22} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-950">TrueMoney Wallet ผ่าน Stripe</h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">ชำระด้วย TrueMoney Wallet สำหรับสมัครแพ็กเกจรายเดือน/รายปี</p>
          </div>
        </div>
        <Link className="btn mt-5 w-full border-amber-700 bg-amber-600 text-white hover:bg-amber-700" href="/pricing?lang=th">
          <Wallet size={18} />
          เลือก TrueMoney Wallet
        </Link>
      </div>

      <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-5">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-violet-600 shadow-sm">
            <Wallet size={22} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-950">Wallet</h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">เติมเงินผ่าน Stripe แล้วใช้ยอด Wallet ชำระแพ็กเกจ</p>
          </div>
        </div>
        <div className="mt-5">
          <WalletTopUp />
        </div>
      </div>
    </div>
  );
}

function WalletTopUp() {
  return (
    <form action="/api/stripe/wallet-topup" className="space-y-3" method="POST">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-violet-200 bg-white px-3 text-xs font-black text-violet-800 transition hover:bg-violet-50">
          <input className="accent-violet-600" defaultChecked name="method" type="radio" value="auto" />
          บัตร / Apple Pay / Google Pay
        </label>
        <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-violet-200 bg-white px-3 text-xs font-black text-violet-800 transition hover:bg-violet-50">
          <input className="accent-violet-600" name="method" type="radio" value="promptpay" />
          PromptPay
        </label>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {topUpAmounts.map((amount) => (
          <button className="h-10 rounded-xl border border-violet-100 bg-white text-xs font-black text-violet-700 transition hover:bg-violet-100" key={amount} name="amount" type="submit" value={amount}>
            +฿{amount.toLocaleString("th-TH")}
          </button>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
        <input className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold outline-none focus:border-violet-500" min="50" name="amount" placeholder="จำนวนอื่น" type="number" />
        <button className="h-11 rounded-xl bg-violet-600 px-4 text-sm font-black text-white hover:bg-violet-700" type="submit">เติมเงิน</button>
      </div>
    </form>
  );
}

function PlanSummary({ billingLabel, selectedPlan, selectedPrice }: { billingLabel: string; selectedPlan: (typeof planDetails)["maker"]; selectedPrice: string }) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black text-blue-700">แพ็กเกจที่เลือก</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">{selectedPlan.title} ({billingLabel})</h2>
          <p className="mt-2 text-sm font-semibold text-slate-600">{selectedPlan.description}</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-sm font-bold text-slate-500">ยอดชำระ</p>
          <p className="mt-1 text-3xl font-black text-blue-600">{selectedPrice}</p>
        </div>
      </div>
    </div>
  );
}

function DataSafeCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex gap-3">
        <div className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-950">ข้อมูลของคุณยังอยู่ครบถ้วน</h3>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">ข้อมูลการพิมพ์ สต๊อก และประวัติงานทั้งหมดจะยังคงอยู่เหมือนเดิมหลังอัปเกรด</p>
        </div>
      </div>
    </div>
  );
}

function BillingActions({ primaryHref = "/pricing?lang=th", primaryLabel = "กลับไปเลือกแพ็กเกจ" }: { primaryHref?: string; primaryLabel?: string }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Link className="btn btn-primary w-full" href={primaryHref}>{primaryLabel}</Link>
      <Link className="btn btn-secondary w-full" href="/dashboard">กลับหน้าโปรแกรม</Link>
    </div>
  );
}
