import { NextResponse } from "next/server";
import { LOCAL_DEV_AUTH_COOKIE, localDevAuthEnabled, supabaseAuthConfigured } from "@/lib/auth-config";
import { logAuthError } from "@/lib/auth-errors";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  if (localDevAuthEnabled()) {
    const response = NextResponse.redirect(new URL("/login?lang=th", request.url));
    response.cookies.delete(LOCAL_DEV_AUTH_COOKIE);
    return response;
  }

  if (supabaseAuthConfigured()) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.signOut();

      if (error) logAuthError("signOut", error);
    } catch (error) {
      logAuthError("signOut unexpected", error);
    }
  }

  return NextResponse.redirect(new URL("/login?lang=th", request.url));
}