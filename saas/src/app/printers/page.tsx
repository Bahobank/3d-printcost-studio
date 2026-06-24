import { AppShell } from "@/components/app-shell";
import { ModuleCard } from "@/components/module-card";
import { requireAppAccess } from "@/lib/subscription";

export default async function PrintersPage() {
  const { profile } = await requireAppAccess();
  return (
    <AppShell profile={profile}>
      <ModuleCard title="เครื่องพิมพ์" description="บันทึกเครื่องพิมพ์ FDM และ Resin พร้อมกำลังไฟเฉลี่ย ค่าเสื่อม และโปรไฟล์ใช้งาน" />
    </AppShell>
  );
}

