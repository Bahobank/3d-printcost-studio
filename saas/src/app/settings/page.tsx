import { AppShell } from "@/components/app-shell";
import { ModuleCard } from "@/components/module-card";
import { requireAppAccess } from "@/lib/subscription";

export default async function SettingsPage() {
  const { profile } = await requireAppAccess();
  return (
    <AppShell profile={profile}>
      <ModuleCard title="ตั้งค่า" description="ตั้งค่าภาษา สกุลเงิน ค่าไฟ ธีม และตัวเลือกการใช้งานของร้าน" />
    </AppShell>
  );
}

