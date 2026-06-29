import { headers } from "next/headers";

const SUPPORTED = ["en", "th", "zh", "ja", "ko"] as const;
export type DetectedLanguage = (typeof SUPPORTED)[number];

// Server-side equivalent of navigator.language: read the browser's Accept-Language
// header and return the first supported language, or null if none match.
export async function detectAcceptLanguage(): Promise<DetectedLanguage | null> {
  try {
    const headerStore = await headers();
    const accept = headerStore.get("accept-language") ?? "";
    const codes = accept
      .split(",")
      .map((part) => part.trim().split(";")[0].toLowerCase().split("-")[0])
      .filter(Boolean);
    for (const code of codes) {
      if ((SUPPORTED as readonly string[]).includes(code)) return code as DetectedLanguage;
    }
  } catch {
    // headers() unavailable in this context
  }
  return null;
}
