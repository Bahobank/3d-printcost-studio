import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const MAX_NAME = 120;
const MAX_SUBJECT = 200;
const MAX_BODY = 4000;

// Same delivery route the legacy app's feedback form already uses, so both kinds
// of message land in the same inbox. Which inbox that is lives in the Web3Forms
// account for this key, not here.
//
// Web3Forms rejects server-to-server calls on the free plan, so this route
// composes the notification and hands it back for the browser to post — exactly
// how the legacy feedback form has always delivered. The key is public by design.
const WEB3FORMS_KEY = "588a3255-28a6-4c2d-b64d-fa5c06b01a1d";

/**
 * Takes a message from the in-app contact form. The customer writing in is often
 * someone who paid and is still locked out, so the message is stored before
 * anything else can fail — losing one of these means losing a paying customer.
 */
export async function POST(request: Request) {
  let userId: string | null = null;
  let email: string | null = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      return NextResponse.json({ ok: false, reason: "unauthenticated" }, { status: 401 });
    }
    userId = data.user.id;
    email = data.user.email ?? null;
  } catch (error) {
    console.error("[support] could not resolve the signed-in user", error);
    return NextResponse.json({ ok: false, reason: "unauthenticated" }, { status: 401 });
  }

  let senderName = "";
  let subject = "";
  let body = "";
  try {
    const payload = (await request.json()) as { name?: unknown; subject?: unknown; body?: unknown };
    senderName = String(payload.name ?? "").trim().slice(0, MAX_NAME);
    subject = String(payload.subject ?? "").trim().slice(0, MAX_SUBJECT);
    body = String(payload.body ?? "").trim().slice(0, MAX_BODY);
  } catch {
    return NextResponse.json({ ok: false, reason: "bad-request" }, { status: 400 });
  }

  if (!senderName || !subject || !body) {
    return NextResponse.json({ ok: false, reason: "empty" }, { status: 400 });
  }

  try {
    const admin = createAdminClient();

    // Record what the customer was seeing, so a "I paid but I'm locked out" report
    // arrives with the evidence already attached.
    const { data: profile } = await admin
      .from("user_profiles")
      .select("subscription_status, subscription_plan")
      .eq("user_id", userId)
      .maybeSingle();

    const { error } = await admin.from("support_messages").insert({
      user_id: userId,
      email,
      sender_name: senderName,
      subject,
      body,
      subscription_status: profile?.subscription_status ?? null,
      subscription_plan: profile?.subscription_plan ?? null,
    });

    if (error) {
      console.error("[support] could not store the message", error);
      return NextResponse.json({ ok: false, reason: "store-failed" }, { status: 500 });
    }

    console.info("[support] message received", { email, subject });

    // Stored safely by now, so delivery is a convenience on top: a mail outage
    // must not tell the customer their message failed.
    return NextResponse.json({
      ok: true,
      notify: buildNotification({ senderName, email, subject, body, profile }),
    });
  } catch (error) {
    console.error("[support] unexpected failure", error);
    return NextResponse.json({ ok: false, reason: "store-failed" }, { status: 500 });
  }
}

function buildNotification({
  senderName,
  email,
  subject,
  body,
  profile,
}: {
  senderName: string;
  email: string | null;
  subject: string;
  body: string;
  profile: { subscription_status?: string | null; subscription_plan?: string | null } | null;
}) {
  const message = `ชื่อผู้ส่ง: ${senderName}
อีเมลผู้ส่ง: ${email ?? "(ไม่ทราบ)"}
สถานะแพ็กเกจ: ${profile?.subscription_status ?? "-"} / ${profile?.subscription_plan ?? "-"}

${body}`;

  return {
    access_key: WEB3FORMS_KEY,
    subject: `[ติดต่อทีมงาน] ${subject}`,
    from_name: `3D PrintCost Studio - ${senderName}`,
    app: "3D PrintCost Studio",
    name: senderName,
    email: email ?? undefined,
    message,
  };
}
