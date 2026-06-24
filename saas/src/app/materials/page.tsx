import { AppShell } from "@/components/app-shell";
import { ModuleCard } from "@/components/module-card";
import { requireAppAccess } from "@/lib/subscription";

export default async function MaterialsPage() {
  const { profile } = await requireAppAccess();
  return (
    <AppShell profile={profile}>
      <ModuleCard title="สต็อกวัสดุ" description="จัดการ Filament, Resin, ต้นทุนต่อหน่วย, สี และวัสดุคงเหลือ" />
    </AppShell>
  );
}

