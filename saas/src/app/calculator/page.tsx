import { AppShell } from "@/components/app-shell";
import { ModuleCard } from "@/components/module-card";
import { requireAppAccess } from "@/lib/subscription";

export default async function CalculatorPage() {
  const { profile } = await requireAppAccess();
  return (
    <AppShell profile={profile}>
      <ModuleCard title="คำนวณต้นทุนงานพิมพ์" description="คำนวณวัสดุ ค่าไฟ ค่าเสื่อมเครื่อง ค่าแรง และต้นทุนรวมของงานพิมพ์" />
    </AppShell>
  );
}

