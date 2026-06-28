import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// Called once after login/signup. If a pc_ref cookie is present and this user has
// no referrer yet, record it so the webhook can credit the referrer on payment.
export async function POST() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const cookieStore = await cookies();
  const referrerId = cookieStore.get("pc_ref")?.value;

  const response = NextResponse.json({ ok: true });

  if (!referrerId || referrerId === userData.user.id) {
    return response;
  }

  try {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("user_profiles")
      .select("referred_by")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (profile && !profile.referred_by) {
      await admin.from("user_profiles").update({ referred_by: referrerId }).eq("user_id", userData.user.id);
    }
    // Clear the cookie once handled (or if columns are missing, stop retrying).
    response.cookies.set("pc_ref", "", { path: "/", maxAge: 0 });
  } catch (error) {
    console.error("[referral] capture failed", error);
  }

  return response;
}
