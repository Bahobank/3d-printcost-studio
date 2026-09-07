import { Suspense } from "react";
import { AnnouncementPopup } from "@/components/announcement-popup";
import { CheckoutSuccessPopup } from "@/components/checkout-success-popup";
import { LegacyDashboardShell } from "@/components/legacy-dashboard-shell";
import { ReferralCapture } from "@/components/referral-capture";
import { localDevAuthEnabled } from "@/lib/auth-config";
import { confirmCheckoutSessionFromReturn } from "@/lib/checkout-fulfillment";
import { getSessionAndProfile } from "@/lib/subscription";

type DashboardPageProps = {
  searchParams?: Promise<{ preview?: string | string[]; session_id?: string | string[] }>;
};

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;

  // Stripe sends the customer back here with the session id. Unlocking the plan
  // right now means a webhook that is slow, misconfigured, or never delivered can
  // no longer leave someone who has paid staring at the paywall. Runs before the
  // profile is read so the page renders the plan they just bought.
  const sessionId = firstParam(params?.session_id);
  if (sessionId) {
    await confirmCheckoutSessionFromReturn(sessionId);
  }

  const { profile } = await getSessionAndProfile();
  const preview = firstParam(params?.preview);

  const previewProfile =
    localDevAuthEnabled() && preview === "expired"
      ? {
          ...profile,
          subscription_status: "expired",
          trial_end_at: new Date(Date.now() - 86_400_000).toISOString(),
        }
      : profile;

  return (
    <>
      <Suspense fallback={null}>
        <CheckoutSuccessPopup />
      </Suspense>
      <ReferralCapture />
      <AnnouncementPopup />
      <LegacyDashboardShell profile={previewProfile} />
    </>
  );
}
