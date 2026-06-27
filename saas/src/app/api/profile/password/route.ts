import { NextResponse } from "next/server";
import { localDevAuthEnabled } from "@/lib/auth-config";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

  if (newPassword.length < 8) {
    return NextResponse.json({ error: "password-too-short" }, { status: 400 });
  }

  if (localDevAuthEnabled()) {
    return NextResponse.json({ ok: true, local: true });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
