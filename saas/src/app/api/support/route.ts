import { NextResponse } from "next/server";
import { sendMail, supportInbox } from "@/lib/mailer";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const MAX_SUBJECT = 200;
const MAX_BODY = 4000;

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

  let subject = "";
  let body = "";
  try {
    const payload = (await request.json()) as { subject?: unknown; body?: unknown };
    subject = String(payload.subject ?? "").trim().slice(0, MAX_SUBJECT);
    body = String(payload.body ?? "").trim().slice(0, MAX_BODY);
  } catch {
    return NextResponse.json({ ok: false, reason: "bad-request" }, { status: 400 });
  }

  if (!subject || !body) {
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

    // The message is safely stored by now, so mail is a convenience on top:
    // it fails quietly rather than telling the customer their message bounced.
    const inbox = supportInbox();
    if (inbox) {
      await sendMail({
        to: inbox,
        subject: `[ติดต่อทีมงาน] ${subject}`,
        replyTo: email ?? undefined,
        text: `จาก: ${email ?? "(ไม่ทราบอีเมล)"}
สถานะแพ็กเกจ: ${profile?.subscription_status ?? "-"} / ${profile?.subscription_plan ?? "-"}

${body}`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[support] unexpected failure", error);
    return NextResponse.json({ ok: false, reason: "store-failed" }, { status: 500 });
  }
}
