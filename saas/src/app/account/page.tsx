import { AppShell } from "@/components/app-shell";
import { getSessionAndProfile, trialDaysLeft } from "@/lib/subscription";

export default async function AccountPage() {
  const { user, profile } = await getSessionAndProfile();

  return (
    <AppShell profile={profile}>
      <section className="card p-7">
        <h1 className="text-3xl font-black">บัญชีผู้ใช้</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Info label="อีเมล" value={user.email ?? "-"} />
          <Info label="ชื่อที่แสดง" value={profile.display_name ?? "-"} />
          <Info label="Provider" value={profile.auth_provider ?? "-"} />
          <Info label="สถานะสมาชิก" value={profile.subscription_status ?? "-"} />
          <Info label="แพ็กเกจ" value={profile.subscription_plan ?? "-"} />
          <Info label="เหลือ trial" value={`${trialDaysLeft(profile)} วัน`} />
        </div>
      </section>
    </AppShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-sm font-bold text-slate-500">{label}</div>
      <div className="mt-1 font-bold">{value}</div>
    </div>
  );
}

