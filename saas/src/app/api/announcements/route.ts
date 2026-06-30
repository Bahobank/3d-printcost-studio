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
export async function GET(request: Request) {
  const debug = new URL(request.url).searchParams.get("debug") === "1";
  let email: string | null = null;
  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      if (debug) return NextResponse.json({ debug: true, authed: false });
      return NextResponse.json({ announcement: null });
    }
    userId = data.user.id;
    email = data.user.email?.toLowerCase() ?? null;
  } catch (error) {
    if (debug) return NextResponse.json({ debug: true, authed: false, error: String(error) });
    return NextResponse.json({ announcement: null });
  }

  if (debug) {
    try {
      const admin = createAdminClient();
      const { data: rows, error: rowsErr } = await admin
        .from("announcements")
        .select("id, target_email, is_active")
        .eq("is_active", true);
      const { count: dismissCount } = await admin
        .from("announcement_dismissals")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);
      return NextResponse.json({
        debug: true,
        authed: true,
        email,
        activeRows: (rows ?? []).length,
        rows: rows ?? [],
        rowsError: rowsErr ? String(rowsErr.message ?? rowsErr) : null,
        myDismissals: dismissCount ?? 0,
      });
    } catch (error) {
      return NextResponse.json({ debug: true, authed: true, email, queryError: String(error) });
    }
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
