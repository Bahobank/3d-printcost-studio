import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// NOTE: this file must live in `src/`, next to `app/`. A middleware.ts at the
// project root is silently ignored when the project uses a src directory — the
// build then reports `"middleware": {}` and no route is ever gated.

const SUPPORTED_LANGUAGES = ["th", "en", "zh", "ja", "ko"];
const LANGUAGE_HEADER = "x-app-lang";

function resolveLanguage(request: NextRequest) {
  const requested = request.nextUrl.searchParams.get("lang");
  if (requested && SUPPORTED_LANGUAGES.includes(requested)) return requested;

  const accept = request.headers.get("accept-language") ?? "";
  const preferred = accept
    .split(",")
    .map((part) => part.split(";")[0]?.trim().toLowerCase().split("-")[0])
    .find((code) => code && SUPPORTED_LANGUAGES.includes(code));

  return preferred ?? "th";
}

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  // Pass the resolved language down so the root layout can stamp <html lang>.
  // Redirects keep their own headers — only tag responses that render a page.
  if (response.status < 300 || response.status >= 400) {
    response.headers.set(LANGUAGE_HEADER, resolveLanguage(request));
  }

  return response ?? NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
