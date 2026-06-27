"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import type { AuthLanguage } from "@/lib/auth-i18n";
import { authSharedCopy, resetPasswordCopy } from "@/lib/auth-i18n";

export function ResetPasswordSuccessClient({ lang }: { lang: AuthLanguage }) {
  const router = useRouter();
  const copy = resetPasswordCopy[lang];
  const shared = authSharedCopy[lang];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      router.push(`/login?lang=${lang}`);
    }, 3500);

    return () => window.clearTimeout(timer);
  }, [lang, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_10%_0%,#eaf3ff_0%,transparent_27%),radial-gradient(circle_at_92%_8%,#f4edff_0%,transparent_30%),linear-gradient(135deg,#f8fbff_0%,#eef5ff_100%)] px-6 py-8 text-slate-950">
      <section className="w-full max-w-[460px] rounded-[28px] border border-white/90 bg-white p-8 text-center shadow-[0_30px_95px_rgba(30,41,59,0.16)] sm:p-10">
        <img alt={shared.productName} className="mx-auto h-14 w-auto object-contain" src="/assets/official-3d-printcost-logo.png" />
        <div className="mx-auto mt-8 grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 size={34} strokeWidth={2.4} />
        </div>
        <h1 className="mt-7 text-3xl font-black tracking-tight text-slate-950">{copy.successTitle}</h1>
        <p className="mt-3 text-base font-semibold leading-7 text-slate-500">{copy.successDescription}</p>
        <a className="mt-7 flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 text-base font-black text-white shadow-[0_18px_45px_rgba(37,99,235,0.32)] transition hover:bg-blue-700" href={`/login?lang=${lang}`}>
          {copy.goToSignIn}
        </a>
      </section>
    </main>
  );
}