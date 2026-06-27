import { ArrowLeft, Mail } from "lucide-react";
import { LoginLanguageSelect } from "@/components/login-language-select";
import { PendingSubmitButton } from "@/components/pending-submit";
import { authSharedCopy, forgotPasswordCopy, getAuthLanguage } from "@/lib/auth-i18n";
import { sendPasswordResetEmail } from "./actions";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<{ email?: string; error?: string; lang?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const lang = getAuthLanguage(params?.lang);
  const copy = forgotPasswordCopy[lang];
  const shared = authSharedCopy[lang];

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_10%_0%,#eaf3ff_0%,transparent_27%),radial-gradient(circle_at_92%_8%,#f4edff_0%,transparent_30%),linear-gradient(135deg,#f8fbff_0%,#eef5ff_100%)] px-6 py-8 text-slate-950">
      <section className="w-full max-w-[460px] rounded-[28px] border border-white/90 bg-white p-8 shadow-[0_30px_95px_rgba(30,41,59,0.16)] sm:p-10">
        <div className="flex items-start justify-between gap-4">
          <img alt={shared.productName} className="h-14 w-auto object-contain" src="/assets/official-3d-printcost-logo.png" />
          <LoginLanguageSelect current={lang} />
        </div>

        <div className="mt-8">
          <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600">
            <Mail size={28} strokeWidth={2.4} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950">{copy.title}</h1>
          <p className="mt-3 text-base font-semibold leading-7 text-slate-500">{copy.description}</p>
        </div>

        <form action={sendPasswordResetEmail} className="mt-8 space-y-4" noValidate>
          <input name="lang" type="hidden" value={lang} />
          {params?.error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black leading-6 text-red-600" role="alert">
              {copy.errorTitle}: {params.error}
            </p>
          ) : null}

          <label className="block">
            <span className="mb-2 block text-sm font-black text-slate-950">{shared.email}</span>
            <span className={(params?.error ? "border-red-300 ring-4 ring-red-50 " : "border-slate-200 focus-within:border-blue-400 focus-within:ring-blue-100 ") + "flex h-12 items-center gap-3 rounded-xl border bg-white px-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition focus-within:ring-4"}>
              <Mail className="h-5 w-5 text-slate-400" />
              <input
                aria-label={shared.email}
                autoComplete="email"
                className="h-full min-w-0 flex-1 bg-transparent text-base font-semibold text-slate-950 outline-none placeholder:text-slate-400"
                defaultValue={params?.email ?? ""}
                name="email"
                placeholder="name@example.com"
                required
                type="email"
              />
            </span>
          </label>

          <PendingSubmitButton
            className="flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-blue-600 text-base font-black text-white shadow-[0_18px_45px_rgba(37,99,235,0.32)] transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-500"
            icon={<Mail className="h-5 w-5" />}
            idleText={copy.sendButton}
            pendingText={copy.sendingButton}
          />
        </form>

        <a className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-base font-black text-slate-700 transition hover:border-blue-200 hover:bg-blue-50" href={`/login?lang=${lang}`}>
          <ArrowLeft className="h-5 w-5" />
          {shared.backToSignIn}
        </a>
      </section>
    </main>
  );
}