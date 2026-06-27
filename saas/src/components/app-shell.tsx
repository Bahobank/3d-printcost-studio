import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Calculator, ChartLine, CreditCard, Gauge, History, Layers3, LogOut, MessageCircle, Printer, Settings, User } from "lucide-react";
import { LOCAL_DEV_AUTH_COOKIE, localDevAuthEnabled } from "@/lib/auth-config";
import { createClient } from "@/lib/supabase/server";
import { canUseMainApp, getSessionAndProfile, trialDaysLeft, type UserProfile } from "@/lib/subscription";
import { TrialSubscriptionControl } from "@/components/pricing-modal";

const navItems = [
  { href: "/dashboard", label: "แดชบอร์ด", icon: Gauge },
  { href: "/calculator", label: "คำนวณต้นทุน", icon: Calculator },
  { href: "/materials", label: "สต็อกวัสดุ", icon: Layers3 },
  { href: "/printers", label: "เครื่องพิมพ์", icon: Printer },
  { href: "/history", label: "ประวัติงาน", icon: History },
  { href: "/profits", label: "กำไร", icon: ChartLine },
  { href: "/chat", label: "แชท", icon: MessageCircle },
  { href: "/settings", label: "ตั้งค่า", icon: Settings },
  { href: "/account", label: "บัญชี", icon: User },
  { href: "/billing", label: "Billing", icon: CreditCard },
];

async function signOut() {
  "use server";
  if (localDevAuthEnabled()) {
    const cookieStore = await cookies();
    cookieStore.delete(LOCAL_DEV_AUTH_COOKIE);
    redirect("/login");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function AppShell({ children, profile }: { children: React.ReactNode; profile?: UserProfile }) {
  const session = profile ? { profile } : await getSessionAndProfile();
  const daysLeft = trialDaysLeft(session.profile);
  const canUseApp = canUseMainApp(session.profile);

  return (
    <div className="min-h-screen p-5">
      <div className="mx-auto flex max-w-7xl gap-5">
        <aside className="card sticky top-5 h-[calc(100vh-2.5rem)] w-72 shrink-0 p-5">
          <div className="mb-7">
            <div className="text-2xl font-black">3D PrintCost Studio</div>
            <div className="text-sm font-bold tracking-wide text-blue-600">BY BAHO</div>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  className="flex items-center gap-3 rounded-2xl px-3 py-3 font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                  href={item.href}
                  key={item.href}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <form action={signOut} className="absolute bottom-5 left-5 right-5">
            <button className="btn btn-secondary w-full" type="submit">
              <LogOut size={18} />
              ออกจากระบบ
            </button>
          </form>
        </aside>
        <main className="flex-1 space-y-5">
          <TrialSubscriptionControl canUseApp={canUseApp} daysLeft={daysLeft} profile={session.profile} />
          {canUseApp ? children : (
            <section className="card p-7 text-center">
              <h1 className="text-3xl font-black">ทดลองใช้ฟรีครบ 7 วันแล้ว</h1>
              <p className="mt-2 font-semibold text-slate-500">เลือกแผนที่เหมาะกับธุรกิจของคุณเพื่อใช้งานต่อ</p>
              <p className="mt-4 text-sm font-bold text-emerald-700">ข้อมูลของคุณยังถูกเก็บไว้อย่างปลอดภัย</p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
