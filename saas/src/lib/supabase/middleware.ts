import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  LOCAL_DEV_AUTH_COOKIE,
  localDevAuthEnabled,
  missingSupabaseConfigMessage,
  supabaseConfig,
} from "@/lib/auth-config";

const PUBLIC_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password", "/auth/callback", "/api/stripe/webhook"];
const AUTH_ROUTES = ["/login", "/signup"];
// The legacy SPA document itself — gate it so an expired trial can't open it
// directly (bypassing the /dashboard paywall). Sub-assets are not gated.
const LEGACY_DOCS = ["/legacy", "/legacy/", "/legacy/index.html"];
type CookieToSet = { name: string; value: string; options: CookieOptions };

function isRoute(path: string, routes: string[]) {
  return routes.some((route) => path === route || path.startsWith(`${route}/`));
}

type MinimalSupabase = { from: (table: string) => any };

async function hasAppAccess(supabase: MinimalSupabase, userId: string, createdAt?: string) {
  try {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("subscription_status, trial_end_at")
      .eq("user_id", userId)
      .maybeSingle();
    const now = Date.now();
    if (!profile) {
      // No profile row yet (brand-new user) — fall back to a 7-day trial from signup.
      const start = createdAt ? new Date(createdAt).getTime() : now;
      return now - start < 7 * 86_400_000;
    }
    const status = profile.subscription_status;
    if (status === "active" || status === "past_due") return true;
    if (status === "trialing" && profile.trial_end_at && new Date(profile.trial_end_at).getTime() > now) return true;
    return false;
  } catch (error) {
    // Never hard-block on a transient error — the /dashboard gate is the primary check.
    return true;
  }
}

function redirectWithError(request: NextRequest, message: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("error", message);
  return NextResponse.redirect(url);
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;
  const isPublic = isRoute(path, PUBLIC_ROUTES);
  const isAuthRoute = isRoute(path, AUTH_ROUTES);

  if (localDevAuthEnabled()) {
    const hasLocalSession = Boolean(request.cookies.get(LOCAL_DEV_AUTH_COOKIE)?.value);

    if (hasLocalSession && isAuthRoute) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (!hasLocalSession && !isPublic) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", path);
      return NextResponse.redirect(url);
    }

    return response;
  }

  const config = supabaseConfig();

  if (!config.configured) {
    if (!isPublic) return redirectWithError(request, missingSupabaseConfigMessage);
    return response;
  }

  const supabase = createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.getUser();

  if (error) {
    console.error("[auth] getUser failed", error);
  }

  if (data.user && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!data.user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // Block direct access to the legacy app document for expired/unpaid users.
  if (data.user && LEGACY_DOCS.includes(path)) {
    const allowed = await hasAppAccess(supabase, data.user.id, data.user.created_at);
    if (!allowed) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      url.searchParams.set("pricing", "expired");
      return NextResponse.redirect(url);
    }
  }

  return response;
}