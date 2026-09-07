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
  } catch (error) {
    console.error("[announcements] could not resolve the signed-in user", error);
    return NextResponse.json({ announcement: null });
  }

  try {
    const admin = createAdminClient();

    const { data: rows, error: rowsError } = await admin
      .from("announcements")
      .select("id, title, body, image_url, cta_label, cta_url, target_email, translations")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    // Without this the route answers "nothing to show" for a failed read exactly as
    // it does for an empty table, which is impossible to tell apart from outside.
    if (rowsError) {
      console.error("[announcements] read failed", rowsError);
    }

    const candidates = (rows ?? []).filter((row) => {
      const target = (row.target_email as string | null)?.toLowerCase() ?? null;
      return target === null || (email !== null && target === email);
    });

    console.info("[announcements] lookup", {
      email,
      activeRows: rows?.length ?? 0,
      candidates: candidates.length,
    });

    if (candidates.length === 0) return NextResponse.json({ announcement: null });

    const { data: dismissed, error: dismissedError } = await admin
      .from("announcement_dismissals")
      .select("announcement_id")
      .eq("user_id", userId);

    if (dismissedError) {
      console.error("[announcements] dismissals read failed", dismissedError);
    }
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
    // The app keeps working without announcements, but the reason must be visible.
    console.error("[announcements] lookup threw", error);
    return NextResponse.json({ announcement: null });
  }
}
