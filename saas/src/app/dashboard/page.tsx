import { Suspense } from "react";
import { CheckoutSuccessPopup } from "@/components/checkout-success-popup";
import { LegacyDashboardShell } from "@/components/legacy-dashboard-shell";
import { localDevAuthEnabled } from "@/lib/auth-config";
import { getSessionAndProfile } from "@/lib/subscription";

type DashboardPageProps = {
  searchParams?: Promise<{ preview?: string | string[] }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { profile } = await getSessionAndProfile();
  const params = await searchParams;
  const preview = Array.isArray(params?.preview) ? params?.preview[0] : params?.preview;

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
      <LegacyDashboardShell profile={previewProfile} />
    </>
  );
}
