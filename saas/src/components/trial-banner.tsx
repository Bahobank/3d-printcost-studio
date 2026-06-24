import Link from "next/link";
import { canUseMainApp, trialDaysLeft, type UserProfile } from "@/lib/subscription";

export function TrialBanner({ profile }: { profile: UserProfile }) {
  const status = profile.subscription_status ?? "expired";

  if (status === "active") return null;

  if (status === "past_due") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
        การชำระเงินมีปัญหา กรุณาตรวจสอบแพ็กเกจในหน้า{" "}
        <Link className="font-bold underline" href="/billing">
          Billing
        </Link>
      </div>
    );
  }

  const days = trialDaysLeft(profile);
  if (days > 0 && canUseMainApp(profile)) {
    return (
      <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-blue-900">
        เหลือเวลาทดลองใช้งานอีก <strong>{days} วัน</strong>{" "}
        <Link className="font-bold underline" href="/pricing">
          เลือกแพ็กเกจ
        </Link>
      </div>
    );
  }

  return null;
}

