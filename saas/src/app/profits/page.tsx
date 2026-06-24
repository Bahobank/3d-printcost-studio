import { AppShell } from "@/components/app-shell";
import { ModuleCard } from "@/components/module-card";
import { requireAppAccess } from "@/lib/subscription";

export default async function ProfitsPage() {
  const { profile } = await requireAppAccess();
  return (
    <AppShell profile={profile}>
      <ModuleCard title="วิเคราะห์กำไร" description="ติดตามรายได้ ต้นทุน ขาดทุน งานเสีย และกำไรจากออเดอร์" />
    </AppShell>
  );
}

