import { AppShell } from "@/components/app-shell";
import { getSessionAndProfile } from "@/lib/subscription";

export default async function BillingPage() {
  const { profile } = await getSessionAndProfile();

  return (
    <AppShell profile={profile}>
      <section className="card p-7">
        <h1 className="text-3xl font-black">Billing</h1>
        <p className="mt-2 text-slate-500">จัดการแพ็กเกจ อัปเกรด ดาวน์เกรด ยกเลิก หรือต่ออายุผ่าน Stripe Customer Portal</p>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="font-bold">สถานะปัจจุบัน: {profile.subscription_status ?? "-"}</div>
          <div className="mt-1 text-slate-500">แพ็กเกจ: {profile.subscription_plan ?? "-"}</div>
          {profile.stripe_customer_id ? (
            <form action="/api/stripe/portal" className="mt-5" method="POST">
              <button className="btn btn-primary" type="submit">
                เปิดหน้า Billing Portal
              </button>
            </form>
          ) : (
            <a className="btn btn-primary mt-5" href="/pricing">
              เลือกแพ็กเกจ
            </a>
          )}
        </div>
      </section>
    </AppShell>
  );
}

