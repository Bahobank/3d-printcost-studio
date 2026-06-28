import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Public referral landing: /r/CODE -> remember the referrer in a cookie, then send
// the visitor to sign up. The link is created on first paid action (see webhook).
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const redirectUrl = new URL("/signup", request.url);
  const response = NextResponse.redirect(redirectUrl);

  const clean = (code ?? "").trim();
  if (!clean) return response;

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("user_profiles")
      .select("user_id")
      .ilike("referral_code", clean)
      .maybeSingle();

    if (data?.user_id) {
      response.cookies.set("pc_ref", String(data.user_id), {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }
  } catch (error) {
    // referral columns may not exist yet — just continue to signup
    console.error("[referral] lookup failed", error);
  }

  return response;
}
