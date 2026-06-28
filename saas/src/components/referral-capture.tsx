"use client";

import { useEffect } from "react";

// Fires once after the dashboard loads to link a referrer (from the pc_ref cookie)
// to this account before any payment happens. No-ops when there is no cookie.
export function ReferralCapture() {
  useEffect(() => {
    fetch("/api/referral/capture", { method: "POST" }).catch(() => {});
  }, []);
  return null;
}
