import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionAndProfile } from "@/lib/subscription";

// Marks an announcement as dismissed for the current user so it never shows again
// (on any device). Idempotent — re-dismissing is a no-op.
export async function POST(request: Request) {
  let userId: string;
  try {
    const { user } = await getSessionAndProfile();
    userId = user.id;
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let id: string | null = null;
  try {
    const body = await request.json();
    id = typeof body?.id === "string" ? body.id : null;
  } catch {
    id = null;
  }
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });

  try {
    const admin = createAdminClient();
    await admin
      .from("announcement_dismissals")
      .upsert({ announcement_id: id, user_id: userId }, { onConflict: "announcement_id,user_id" });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
