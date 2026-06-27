import { NextResponse } from "next/server";
import { localDevAuthEnabled } from "@/lib/auth-config";
import { createClient } from "@/lib/supabase/server";

function cleanText(value: unknown, maxLength = 160) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

function cleanAvatarUrl(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > 1_500_000) return null;
  if (trimmed.startsWith("data:image/") || trimmed.startsWith("https://")) return trimmed;
  return null;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid-profile-payload" }, { status: 400 });
  }

  const update = {
    display_name: cleanText(body.displayName),
    phone: cleanText(body.phone, 60),
    business_name: cleanText(body.businessName),
    job_title: cleanText(body.jobTitle),
    country_region: cleanText(body.countryRegion, 80),
    avatar_url: cleanAvatarUrl(body.avatarUrl),
  };

  if (localDevAuthEnabled()) {
    return NextResponse.json({ ok: true, local: true, profile: update });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { error } = await supabase.from("user_profiles").update(update).eq("user_id", user.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
