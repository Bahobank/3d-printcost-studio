import { createHash } from "crypto";

export function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://3dprintcost.studio";
}

// Deterministic, stable per user: a short readable prefix from the name plus a
// 4-char base36 suffix derived from the user id. Same input -> same code, so it
// is forward-compatible when we later persist codes for referral crediting.
export function generateReferralCode(userId: string, name?: string | null): string {
  const prefix = (name ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5) || "MAKER";
  const hash = createHash("sha256").update(userId).digest("hex");
  const suffix = parseInt(hash.slice(0, 10), 16).toString(36).toUpperCase().slice(0, 4).padStart(4, "0");
  return `${prefix}-${suffix}`;
}

export function referralLinkFromCode(code: string) {
  return `${appUrl()}/r/${code}`;
}
