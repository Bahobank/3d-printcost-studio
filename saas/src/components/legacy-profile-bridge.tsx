"use client";

import { useEffect } from "react";
import type { UserProfile } from "@/lib/subscription";

type LegacyProfile = Pick<
  UserProfile,
  "user_id" | "email" | "display_name" | "avatar_url" | "auth_provider" | "phone" | "business_name" | "job_title" | "country_region"
>;

export function LegacyProfileBridge({ profile }: { profile: LegacyProfile }) {
  useEffect(() => {
    const iframe = document.getElementById("legacy-dashboard-frame") as HTMLIFrameElement | null;
    if (!iframe) return;

    const payload = {
      type: "printcost:user-profile",
      profile: {
        userId: profile.user_id,
        user_id: profile.user_id,
        email: profile.email,
        displayName: profile.display_name,
        display_name: profile.display_name,
        avatarUrl: profile.avatar_url,
        avatar_url: profile.avatar_url,
        provider: profile.auth_provider,
        auth_provider: profile.auth_provider,
        phone: profile.phone,
        businessName: profile.business_name,
        business_name: profile.business_name,
        jobTitle: profile.job_title,
        job_title: profile.job_title,
        countryRegion: profile.country_region,
        country_region: profile.country_region,
      },
    };

    const sendProfile = () => iframe.contentWindow?.postMessage(payload, window.location.origin);
    const handleLegacyMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "printcost:logout") {
        window.location.href = "/logout";
      }
    };

    iframe.addEventListener("load", sendProfile);
    window.addEventListener("message", handleLegacyMessage);
    sendProfile();

    return () => {
      iframe.removeEventListener("load", sendProfile);
      window.removeEventListener("message", handleLegacyMessage);
    };
  }, [
    profile.user_id,
    profile.auth_provider,
    profile.avatar_url,
    profile.business_name,
    profile.country_region,
    profile.display_name,
    profile.email,
    profile.job_title,
    profile.phone,
  ]);

  return null;
}