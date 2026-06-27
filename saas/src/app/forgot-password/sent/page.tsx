import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { PendingSubmitButton } from "@/components/pending-submit";
import { authSharedCopy, forgotPasswordCopy, getAuthLanguage } from "@/lib/auth-i18n";
import { sendPasswordResetEmail } from "../actions";

export default async function ForgotPasswordSentPage({
  searchParams,
}: {
  searchParams?: Promise<{ email?: string; lang?: string; message?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const lang = getAuthLanguage(params?.lang);
  const copy = forgotPasswordCopy[lang];
  const shared = authSharedCopy[lang];
  const email = params?.email ?? "";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_10%_0%,#eaf3ff_0%,transparent_27%),radial-gradient(circle_at_92%_8%,#f4edff_0%,transparent_30%),linear-gradient(135deg,#f8fbff_0%,#eef5ff_100%)] px-6 py-8 text-slate-950">
      <section className="w-full max-w-[460px] rounded-[28px] border border-white/90 bg-white p-8 text-center shadow-[0_30px_95px_rgba(30,41,59,0.16)] sm:p-10">
        <img alt={shared.productName} className="mx-auto h-14 w-auto object-contain" src="/assets/official-3d-printcost-logo.png" />
        <div className="mx-auto mt-7 grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-blue-600">
          <Mail size={32} strokeWidth={2.4} />
        </div>
        <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-950">{copy.successTitle}</h1>
        <p className="mt-4 whitespace-pre-line text-base font-semibold leading-7 text-slate-500">{copy.successDescription}</p>
        {email ? <p className="mt-6 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-700">{email}</p> : null}
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-left text-sm font-bold leading-6 text-slate-600">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          <p>{copy.securityNotice}</p>
        </div>
        {params?.message ? (
          <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black leading-6 text-emerald-700" role="status">
            {params.message}
          </p>
        ) : null}

        <form action={sendPasswordResetEmail} className="mt-7">
          <input name="lang" type="hidden" value={lang} />
          <input name="email" type="hidden" value={email} />
          <input name="resend" type="hidden" value="1" />
          <PendingSubmitButton
            className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-blue-200 bg-blue-50 text-base font-black text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
            icon={<Mail className="h-5 w-5" />}
            idleText={copy.resendButton}
            pendingText={copy.resendingButton}
          />
        </form>

        <a className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-base font-black text-white shadow-[0_18px_45px_rgba(37,99,235,0.32)] transition hover:bg-blue-700" href={`/login?lang=${lang}`}>
          <ArrowLeft className="h-5 w-5" />
          {shared.backToSignIn}
        </a>
      </section>
    </main>
  );
}
