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
type CookieToSet = { name: string; value: string; options: CookieOptions };

function isRoute(path: string, routes: string[]) {
  return routes.some((route) => path === route || path.startsWith(`${route}/`));
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

  return response;
}