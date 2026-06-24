import Link from "next/link";
import { redirect } from "next/navigation";
import { Calculator, ChartLine, CreditCard, Gauge, History, Layers3, LogOut, MessageCircle, Printer, Settings, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSessionAndProfile, type UserProfile } from "@/lib/subscription";
import { TrialBanner } from "@/components/trial-banner";

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
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function AppShell({ children, profile }: { children: React.ReactNode; profile?: UserProfile }) {
  const session = profile ? { profile } : await getSessionAndProfile();

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
          <TrialBanner profile={session.profile} />
          {children}
        </main>
      </div>
    </div>
  );
}

