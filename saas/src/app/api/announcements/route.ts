import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type AnnouncementText = { title?: string; body?: string; ctaLabel?: string };

export type AnnouncementPayload = {
  id: string;
  title: string;
  body: string;
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  translations: Record<string, AnnouncementText> | null;
};

// Returns the most recent active announcement addressed to this user (by email)
// or to everyone, that the user has not dismissed yet. null when there is nothing
// to show (or the tables are not set up).
export async function GET() {
  let email: string | null = null;
  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return NextResponse.json({ announcement: null });
    userId = data.user.id;
    email = data.user.email?.toLowerCase() ?? null;
  } catch {
    return NextResponse.json({ announcement: null });
  }

  try {
    const admin = createAdminClient();

    const { data: rows } = await admin
      .from("announcements")
      .select("id, title, body, image_url, cta_label, cta_url, target_email, translations")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    const candidates = (rows ?? []).filter((row) => {
      const target = (row.target_email as string | null)?.toLowerCase() ?? null;
      return target === null || (email !== null && target === email);
    });

    if (candidates.length === 0) return NextResponse.json({ announcement: null });

    const { data: dismissed } = await admin
      .from("announcement_dismissals")
      .select("announcement_id")
      .eq("user_id", userId);
    const seen = new Set((dismissed ?? []).map((d) => String(d.announcement_id)));

    const next = candidates.find((row) => !seen.has(String(row.id)));
    if (!next) return NextResponse.json({ announcement: null });

    const payload: AnnouncementPayload = {
      id: String(next.id),
      title: String(next.title ?? ""),
      body: String(next.body ?? ""),
      imageUrl: (next.image_url as string | null) ?? null,
      ctaLabel: (next.cta_label as string | null) ?? null,
      ctaUrl: (next.cta_url as string | null) ?? null,
      translations: (next.translations as Record<string, AnnouncementText> | null) ?? null,
    };
    return NextResponse.json({ announcement: payload });
  } catch (error) {
    // tables may not exist yet — fail silently so the app keeps working
    return NextResponse.json({ announcement: null });
  }
}
