import { LegacyProfileBridge } from "@/components/legacy-profile-bridge";
import { LegacyTrialBridge } from "@/components/legacy-trial-bridge";
import { TrialSubscriptionControl } from "@/components/pricing-modal";
import { canUseMainApp, trialDaysLeft, type UserProfile } from "@/lib/subscription";

export function LegacyDashboardShell({ profile }: { profile: UserProfile }) {
  const daysLeft = trialDaysLeft(profile);
  const canUseApp = canUseMainApp(profile);

  return (
    <main className="relative min-h-screen bg-slate-950 text-slate-950">
      <TrialSubscriptionControl canUseApp={canUseApp} daysLeft={daysLeft} hideTrigger={canUseApp} listenForLegacyOpen={canUseApp} profile={profile} />

      {canUseApp ? (
        <>
          <LegacyProfileBridge profile={profile} />
          <LegacyTrialBridge canUseApp={canUseApp} daysLeft={daysLeft} status={profile.subscription_status ?? null} />
          <iframe
            className="block h-screen w-full border-0 bg-white"
            id="legacy-dashboard-frame"
            src={`/legacy/index.html?user=${encodeURIComponent(profile.user_id)}`}
            title="3D PrintCost Studio"
          />
        </>
      ) : (
        <section className="grid min-h-screen place-items-center px-5">
          <div className="max-w-xl rounded-2xl bg-white p-8 text-center shadow-2xl">
            <h1 className="text-3xl font-black">ทดลองใช้ฟรีครบ 7 วันแล้ว</h1>
            <p className="mt-2 font-semibold text-slate-500">เลือกแผนที่เหมาะกับธุรกิจของคุณเพื่อใช้งานต่อ</p>
            <p className="mt-4 text-sm font-bold text-emerald-700">ข้อมูลของคุณยังถูกเก็บไว้อย่างปลอดภัย</p>
          </div>
        </section>
      )}
    </main>
  );
}