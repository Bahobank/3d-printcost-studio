import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Cloud sync for the legacy app's full state document. RLS keeps each user to
// their own row, so we use the authenticated session client directly.
export async function GET() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ data: null }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("app_state")
    .select("data, device_updated_at, updated_at")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (error) {
    console.error("[app-state] load failed", error);
    return NextResponse.json({ data: null });
  }

  return NextResponse.json(
    data ? { data: data.data, deviceUpdatedAt: data.device_updated_at, updatedAt: data.updated_at } : { data: null },
  );
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let body: { data?: unknown; deviceUpdatedAt?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!body || typeof body.data !== "object" || body.data === null) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { error } = await supabase.from("app_state").upsert(
    {
      user_id: userData.user.id,
      data: body.data,
      device_updated_at: typeof body.deviceUpdatedAt === "string" ? body.deviceUpdatedAt : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    console.error("[app-state] save failed", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
