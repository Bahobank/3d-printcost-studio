import nodemailer from "nodemailer";

/**
 * Outgoing mail goes through the studio's own Gmail account over SMTP, so replies
 * land where the owner already reads mail.
 *
 * Sending is best-effort by design: a customer's support message is stored before
 * this is ever called, and a mail failure must never lose it or fail their
 * request. Every failure is logged rather than thrown.
 */

const SMTP_HOST = "smtp.gmail.com";
const SMTP_PORT = 465;

function readConfig() {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  // Gmail app passwords are shown in groups of four; people paste the spaces.
  const cleanedPass = pass?.replace(/\s+/g, "");

  if (!user || !cleanedPass) return null;
  return { user, pass: cleanedPass };
}

export function supportInbox() {
  return process.env.SUPPORT_INBOX?.trim() || process.env.SMTP_USER?.trim() || null;
}

export async function sendMail({
  to,
  subject,
  text,
  replyTo,
}: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}) {
  const config = readConfig();

  if (!config) {
    console.warn("[mailer] SMTP is not configured; skipping", { subject, to });
    return false;
  }

  try {
    const transport = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: true,
      auth: config,
    });

    await transport.sendMail({
      from: `3D PrintCost Studio <${config.user}>`,
      to,
      subject,
      text,
      replyTo,
    });

    console.info("[mailer] sent", { subject, to });
    return true;
  } catch (error) {
    console.error("[mailer] send failed", { subject, to }, error);
    return false;
  }
}
