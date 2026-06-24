import { AppShell } from "@/components/app-shell";
import { ModuleCard } from "@/components/module-card";
import { requireAppAccess } from "@/lib/subscription";

export default async function HistoryPage() {
  const { profile } = await requireAppAccess();
  return (
    <AppShell profile={profile}>
      <ModuleCard title="ประวัติงาน" description="ดูงานที่บันทึก งานขาย งานใช้เอง งานเสีย และต้นทุนย้อนหลัง" />
    </AppShell>
  );
}

