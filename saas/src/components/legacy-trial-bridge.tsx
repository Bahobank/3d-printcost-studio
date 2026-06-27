"use client";

import { useEffect } from "react";

export function LegacyTrialBridge({ canUseApp, daysLeft, status }: { canUseApp: boolean; daysLeft: number; status: string | null }) {
  useEffect(() => {
    const iframe = document.getElementById("legacy-dashboard-frame") as HTMLIFrameElement | null;
    if (!iframe) return;

    const payload = {
      type: "printcost:trial-status",
      canUseApp,
      daysLeft,
      status,
    };

    const sendTrialStatus = () => iframe.contentWindow?.postMessage(payload, window.location.origin);
    iframe.addEventListener("load", sendTrialStatus);
    sendTrialStatus();

    return () => iframe.removeEventListener("load", sendTrialStatus);
  }, [canUseApp, daysLeft, status]);

  return null;
}
