import { AppShell } from "@/components/app-shell";
import { requireAppAccess } from "@/lib/subscription";

export default async function DashboardPage() {
  const { profile } = await requireAppAccess();

  return (
    <AppShell profile={profile}>
      <section className="card p-7">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">แดชบอร์ด</h1>
            <p className="mt-2 text-slate-500">ภาพรวมต้นทุน สต็อกวัสดุ งานพิมพ์ และผลกำไรของร้าน</p>
          </div>
          <span className="rounded-full bg-blue-50 px-4 py-2 font-bold text-blue-700">
            {profile.subscription_status}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["ต้นทุนรวม", "฿0.00"],
            ["รายได้", "฿0.00"],
            ["กำไรสุทธิ", "฿0.00"],
            ["งานที่บันทึก", "0"],
          ].map(([label, value]) => (
            <div className="rounded-2xl border border-slate-200 bg-white p-5" key={label}>
              <div className="text-sm font-bold text-slate-500">{label}</div>
              <div className="mt-3 text-3xl font-black">{value}</div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

