import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";
import { LoginLanguageSelect } from "@/components/login-language-select";
import {
  LOCAL_DEV_AUTH_COOKIE,
  localDevAuthEnabled,
  supabaseAuthConfigured,
} from "@/lib/auth-config";
import { formatPlanPrice, getPlanPrice, type PlanCurrency } from "@/lib/billing-plans";
import { detectAcceptLanguage } from "@/lib/detect-language";
import { getLandingLanguage, landingCopy } from "@/lib/landing-copy";
import {
  ILLUSTRATION_HEIGHT,
  ILLUSTRATION_WIDTH,
  problemIllustrations,
} from "@/lib/landing-illustrations";
import { createClient } from "@/lib/supabase/server";

// Search engines and link previews should get the page in the same language the
// visitor is served, not Thai for everyone.
export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<HomeSearchParams>;
}): Promise<Metadata> {
  const params = searchParams ? await searchParams : undefined;
  const language = getLandingLanguage(params?.lang ?? (await detectAcceptLanguage()) ?? undefined);
  const copy = landingCopy[language];

  const title = `3D PrintCost Studio — ${copy.hero.title} ${copy.hero.titleAccent}`;
  const description = copy.hero.subtitle;

  return {
    title,
    description,
    openGraph: { title: "3D PrintCost Studio", description, type: "website" },
  };
}

type HomeSearchParams = {
  code?: string;
  next?: string;
  lang?: string;
  token_hash?: string;
  type?: string;
  error?: string;
  error_description?: string;
};

const CALLBACK_PARAM_KEYS: (keyof HomeSearchParams)[] = [
  "code",
  "lang",
  "token_hash",
  "type",
  "error",
  "error_description",
];

// The landing page is public, so this must answer "is anyone signed in?" without
// ever redirecting or throwing — an anonymous visitor has to see the page either way.
async function viewerIsSignedIn() {
  const cookieStore = await cookies();

  if (localDevAuthEnabled()) {
    return Boolean(cookieStore.get(LOCAL_DEV_AUTH_COOKIE)?.value);
  }

  if (!supabaseAuthConfigured()) return false;

  // Skip the Supabase round-trip entirely for the anonymous visitors who make up
  // almost all landing-page traffic.
  const hasAuthCookie = cookieStore.getAll().some((cookie) => cookie.name.startsWith("sb-"));
  if (!hasAuthCookie) return false;

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    return Boolean(data.user);
  } catch {
    return false;
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<HomeSearchParams>;
}) {
  const params = searchParams ? await searchParams : undefined;

  // Supabase can land the user back on "/" carrying auth params — keep forwarding
  // those to the callback route before the marketing page ever renders.
  if (params?.code || params?.token_hash || params?.error || params?.error_description) {
    const callbackParams = new URLSearchParams();

    CALLBACK_PARAM_KEYS.forEach((key) => {
      const value = params[key];
      if (value) callbackParams.set(key, value);
    });

    if (params.next?.startsWith("/") && !params.next.startsWith("//")) {
      callbackParams.set("next", params.next);
    }

    redirect(`/auth/callback?${callbackParams.toString()}`);
  }

  const language = getLandingLanguage(params?.lang ?? (await detectAcceptLanguage()) ?? undefined);
  const copy = landingCopy[language];
  const withLang = (path: string) => `${path}${path.includes("?") ? "&" : "?"}lang=${language}`;
  const signupHref = withLang("/signup");
  // /login bounces an already-signed-in visitor straight to /dashboard, so this
  // doubles as the "open the app" link.
  const loginHref = withLang("/login");

  const signedIn = await viewerIsSignedIn();
  const appHref = signedIn ? "/dashboard" : loginHref;
  // Always labelled "sign in" - it just skips the form when a session exists.
  const appLabel = copy.nav.signIn;
  const ctaHref = signedIn ? "/dashboard" : signupHref;
  const planCtaHref = signedIn ? "/pricing" : signupHref;

  // Each problem is answered by the feature at the same index, and drawn by the
  // illustration at the same index.
  const problemBlocks = copy.problem.items.map((problem, index) => ({
    problem,
    solution: copy.features.items[index],
    illustration: problemIllustrations[index],
  }));

  // Thai visitors are shown and charged in THB, everyone else in USD — the same
  // split that checkout uses, so the landing price matches what the card is billed.
  const currency: PlanCurrency = language === "th" ? "thb" : "usd";

  const plans = (["maker", "studio"] as const).map((key) => ({
    key,
    monthly: getPlanPrice(key, "monthly", currency),
    yearly: getPlanPrice(key, "yearly", currency),
    copy: copy.pricing.plans[key],
  }));

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_12%_0%,#e8f2ff_0%,transparent_30%),radial-gradient(circle_at_88%_6%,#f3ecff_0%,transparent_32%),linear-gradient(180deg,#f9fbff_0%,#eef5ff_100%)] text-slate-950">
      {/* ---------- header ---------- */}
      <header className="sticky top-0 z-50 border-b border-white/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1180px] items-center justify-between gap-4 px-5 sm:px-8">
          <a className="flex shrink-0 items-center" href={withLang("/")}>
            <img
              alt="3D PrintCost Studio"
              className="h-9 w-auto object-contain"
              src="/assets/official-3d-printcost-logo.png"
            />
          </a>

          <nav className="hidden items-center gap-7 text-sm font-bold text-slate-600 min-[900px]:flex">
            <a className="transition hover:text-blue-600" href="#features">
              {copy.nav.features}
            </a>
            <a className="transition hover:text-blue-600" href="#how">
              {copy.nav.how}
            </a>
            <a className="transition hover:text-blue-600" href="#pricing">
              {copy.nav.pricing}
            </a>
            <a className="transition hover:text-blue-600" href="#faq">
              {copy.nav.faq}
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block">
              <LoginLanguageSelect current={language} />
            </div>
            {signedIn ? null : (
              <a
                className="hidden h-10 items-center rounded-xl px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:inline-flex"
                href={loginHref}
              >
                {copy.nav.signIn}
              </a>
            )}
            <a
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(37,99,235,0.3)] transition hover:bg-blue-700"
              href={signedIn ? appHref : signupHref}
            >
              {signedIn ? appLabel : copy.nav.start}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* ---------- hero ---------- */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-32 top-24 h-96 w-96 rounded-full bg-blue-200/25 blur-3xl" />
            <div className="absolute -right-24 top-8 h-80 w-80 rounded-full bg-violet-200/25 blur-3xl" />
          </div>

          <div className="relative mx-auto grid w-full max-w-[1180px] gap-12 px-5 pb-20 pt-14 sm:px-8 sm:pt-20 min-[1000px]:grid-cols-[1.05fr_0.95fr] min-[1000px]:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-[0_10px_28px_rgba(37,99,235,0.1)]">
                <Sparkles className="h-4 w-4" />
                {copy.hero.badge}
              </span>

              <h1 className="mt-6 text-[2.1rem] font-bold leading-[1.15] tracking-tight text-slate-950 sm:text-[2.9rem]">
                {copy.hero.title}
                <span className="mt-2 block text-blue-600">{copy.hero.titleAccent}</span>
              </h1>

              <p className="mt-6 max-w-[560px] text-base leading-8 text-slate-600 sm:text-lg">
                {copy.hero.subtitle}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-7 py-4 text-base font-semibold text-white shadow-[0_20px_45px_rgba(37,99,235,0.32)] transition hover:bg-blue-700"
                  href={ctaHref}
                >
                  {signedIn ? copy.nav.signIn : copy.hero.primaryCta}
                  <ArrowRight className="h-5 w-5" />
                </a>
                {signedIn ? null : (
                  <a
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-7 py-4 text-base font-semibold text-slate-800 shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition hover:border-blue-200 hover:bg-blue-50/50"
                    href={loginHref}
                  >
                    {copy.hero.secondaryCta}
                  </a>
                )}
              </div>

              <p className="mt-6 text-sm font-semibold leading-6 text-slate-500">{copy.hero.note}</p>
            </div>

            {/* sample calculation card */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-[36px] bg-gradient-to-br from-blue-100/50 via-white/0 to-violet-100/50 blur-2xl" />
              <div className="relative rounded-[28px] border border-white bg-white p-6 shadow-[0_30px_80px_rgba(30,41,59,0.16)] sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
                  {copy.demo.caption}
                </p>
                <div className="mt-3 flex items-baseline justify-between gap-3">
                  <h2 className="text-lg font-bold text-slate-950">{copy.demo.jobName}</h2>
                  <span className="shrink-0 text-xs font-bold text-slate-400">{copy.demo.jobMeta}</span>
                </div>

                <dl className="mt-6 space-y-3">
                  {copy.demo.rows.map((row) => (
                    <div className="flex items-center justify-between gap-4" key={row.label}>
                      <dt className="text-sm font-semibold text-slate-600">{row.label}</dt>
                      <dd className="text-sm font-semibold tabular-nums text-slate-900">{row.value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-5 border-t border-dashed border-slate-200 pt-5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-slate-700">{copy.demo.costLabel}</span>
                    <span className="text-lg font-semibold tabular-nums text-slate-950">{copy.demo.costValue}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-slate-700">{copy.demo.priceLabel}</span>
                    <span className="text-lg font-semibold tabular-nums text-slate-950">{copy.demo.priceValue}</span>
                  </div>
                </div>

                {/* cost vs profit as a share of the sale price */}
                <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-slate-100">
                  <span className="h-full w-[53%] bg-gradient-to-r from-slate-300 to-slate-400" />
                  <span className="h-full w-[47%] bg-gradient-to-r from-emerald-400 to-emerald-500" />
                </div>

                <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl bg-emerald-50 px-5 py-4">
                  <span className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                    <TrendingUp className="h-5 w-5" />
                    {copy.demo.profitLabel}
                  </span>
                  <span className="text-xl font-semibold tabular-nums text-emerald-700">{copy.demo.profitValue}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- problems, one block each, with its own picture ---------- */}
        <section className="scroll-mt-20 border-y border-white/80 bg-white/60 py-16 sm:py-20" id="features">
          <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8">
            <div className="max-w-[760px]">
              <h2 className="text-[1.75rem] font-bold leading-tight tracking-tight text-slate-950 sm:text-[2.1rem]">
                {copy.problem.title}
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">{copy.problem.subtitle}</p>
            </div>

            <div className="mt-14 space-y-16 sm:space-y-24">
              {problemBlocks.map(({ problem, solution, illustration }, index) => {
                const flipped = index % 2 === 1;
                return (
                  <article
                    className="grid items-center gap-8 min-[900px]:grid-cols-2 min-[900px]:gap-14"
                    key={problem.title}
                  >
                    <div className={flipped ? "min-[900px]:order-2" : undefined}>
                      <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-amber-600">
                        <TriangleAlert className="h-3.5 w-3.5" strokeWidth={2.6} />
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <h3 className="mt-4 text-xl font-bold leading-8 text-slate-950 sm:text-2xl sm:leading-9">
                        {problem.title}
                      </h3>
                      <p className="mt-3 text-base leading-8 text-slate-600">{problem.description}</p>

                      {solution ? (
                        <div className="mt-6 rounded-[20px] border border-blue-100 bg-blue-50/60 p-5">
                          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
                            {copy.problem.solutionLabel}
                          </span>
                          <p className="mt-2 flex items-start gap-2.5 text-base font-semibold leading-7 text-slate-950">
                            <Check className="mt-1 h-4 w-4 shrink-0 text-blue-600" strokeWidth={3.2} />
                            {solution.title}
                          </p>
                          <p className="mt-2 pl-[26px] text-sm leading-7 text-slate-600">
                            {solution.description}
                          </p>
                        </div>
                      ) : null}
                    </div>

                    <div className={flipped ? "min-[900px]:order-1" : undefined}>
                      {illustration ? (
                        <div className="overflow-hidden rounded-[26px] border border-white bg-white p-3 shadow-[0_20px_55px_rgba(90,105,150,0.12)]">
                          <img
                            alt={problem.title}
                            className="block h-auto w-full rounded-[16px]"
                            decoding="async"
                            height={ILLUSTRATION_HEIGHT}
                            loading={index === 0 ? "eager" : "lazy"}
                            src={illustration}
                            width={ILLUSTRATION_WIDTH}
                          />
                        </div>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------- how it works ---------- */}
        <section className="scroll-mt-20 py-16 sm:py-20" id="how">
          <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8">
            <div className="max-w-[720px]">
              <h2 className="text-[1.75rem] font-bold leading-tight tracking-tight text-slate-950 sm:text-[2.1rem]">
                {copy.steps.title}
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">{copy.steps.subtitle}</p>
            </div>

            <ol className="mt-10 grid gap-5 sm:grid-cols-3">
              {copy.steps.items.map((item, index) => (
                <li
                  className="rounded-[22px] border border-white bg-white p-6 shadow-[0_18px_50px_rgba(90,105,150,0.1)]"
                  key={item.title}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-lg font-semibold text-white shadow-[0_12px_28px_rgba(37,99,235,0.32)]">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 text-base font-bold leading-6 text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- pricing ---------- */}
        <section className="scroll-mt-20 border-y border-white/80 bg-white/60 py-16 sm:py-20" id="pricing">
          <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8">
            <div className="max-w-[720px]">
              <h2 className="text-[1.75rem] font-bold leading-tight tracking-tight text-slate-950 sm:text-[2.1rem]">
                {copy.pricing.title}
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">{copy.pricing.subtitle}</p>
            </div>

            <div className="mt-10 grid gap-6 min-[880px]:grid-cols-2">
              {plans.map(({ key, monthly, yearly, copy: planCopy }) => {
                const highlighted = key === "studio";
                return (
                  <div
                    className={
                      (highlighted ? "border-blue-200 ring-4 ring-blue-100 " : "border-white ") +
                      "relative flex flex-col rounded-[26px] border bg-white p-7 shadow-[0_22px_60px_rgba(90,105,150,0.12)] sm:p-8"
                    }
                    key={key}
                  >
                    {highlighted ? (
                      <span className="absolute -top-3 right-7 inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-[0_10px_24px_rgba(37,99,235,0.35)]">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        {copy.pricing.popular}
                      </span>
                    ) : null}

                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-bold text-slate-950">{planCopy.name}</h3>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {planCopy.badge}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{planCopy.description}</p>

                    <div className="mt-6 flex items-baseline gap-2">
                      <span className="text-4xl font-bold tracking-tight text-slate-950">
                        {formatPlanPrice(monthly.amount, currency)}
                      </span>
                      <span className="text-sm font-bold text-slate-500">{copy.pricing.perMonth}</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-500">
                      {copy.pricing.yearlyNote(
                        formatPlanPrice(yearly.amount, currency),
                        formatPlanPrice(yearly.monthlyEquivalent, currency),
                      )}
                    </p>

                    <ul className="mt-6 flex-1 space-y-3">
                      {planCopy.features.map((feature) => (
                        <li className="flex items-start gap-3 text-sm leading-6 text-slate-700" key={feature}>
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                            <Check className="h-3.5 w-3.5" strokeWidth={3} />
                          </span>
                          <span className="font-semibold">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <a
                      className={
                        (highlighted
                          ? "bg-blue-600 text-white shadow-[0_18px_45px_rgba(37,99,235,0.32)] hover:bg-blue-700 "
                          : "border border-slate-200 bg-white text-slate-800 hover:border-blue-200 hover:bg-blue-50/50 ") +
                        "mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-xl text-base font-semibold transition"
                      }
                      href={planCtaHref}
                    >
                      {copy.pricing.cta}
                    </a>
                  </div>
                );
              })}
            </div>

            <p className="mt-6 flex items-start gap-2 text-sm font-semibold leading-6 text-slate-500">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              {copy.pricing.footnote}
            </p>
          </div>
        </section>

        {/* ---------- faq ---------- */}
        <section className="scroll-mt-20 py-16 sm:py-20" id="faq">
          <div className="mx-auto w-full max-w-[820px] px-5 sm:px-8">
            <h2 className="text-[1.75rem] font-bold leading-tight tracking-tight text-slate-950 sm:text-[2.1rem]">
              {copy.faq.title}
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">{copy.faq.subtitle}</p>

            <div className="mt-8 space-y-3">
              {copy.faq.items.map((item) => (
                <details
                  className="group rounded-[20px] border border-white bg-white px-6 py-5 shadow-[0_14px_40px_rgba(90,105,150,0.08)]"
                  key={item.question}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-slate-950">
                    {item.question}
                    <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- final cta ---------- */}
        <section className="mx-auto w-full max-w-[1180px] px-5 pb-20 sm:px-8">
          <div className="relative overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#1d4ed8_0%,#4338ca_55%,#6d28d9_100%)] px-7 py-14 text-center shadow-[0_30px_80px_rgba(37,99,235,0.3)] sm:px-12">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
            </div>
            <div className="relative">
              <h2 className="mx-auto max-w-[680px] text-[1.7rem] font-bold leading-tight tracking-tight text-white sm:text-[2.15rem]">
                {copy.finalCta.title}
              </h2>
              <p className="mx-auto mt-4 max-w-[560px] text-base leading-7 text-blue-100">
                {copy.finalCta.subtitle}
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <a
                  className="inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-4 text-base font-semibold text-blue-700 shadow-[0_18px_45px_rgba(15,23,42,0.25)] transition hover:bg-blue-50"
                  href={ctaHref}
                >
                  {signedIn ? copy.nav.signIn : copy.finalCta.primary}
                  <ArrowRight className="h-5 w-5" />
                </a>
                {signedIn ? null : (
                  <a
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/40 px-7 py-4 text-base font-semibold text-white transition hover:bg-white/10"
                    href={loginHref}
                  >
                    {copy.finalCta.secondary}
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ---------- footer ---------- */}
      <footer className="border-t border-white/80 bg-white/70 py-10">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-5 sm:px-8 min-[760px]:flex-row min-[760px]:items-center min-[760px]:justify-between">
          <div className="max-w-[420px]">
            <img
              alt="3D PrintCost Studio"
              className="h-9 w-auto object-contain"
              src="/assets/official-3d-printcost-logo.png"
            />
            <p className="mt-3 text-sm leading-6 text-slate-500">{copy.footer.tagline}</p>
          </div>

          <div className="flex flex-col gap-3 text-sm font-bold text-slate-500 min-[760px]:items-end">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <a className="transition hover:text-blue-600" href="/privacy">
                {copy.footer.privacy}
              </a>
              <a className="transition hover:text-blue-600" href="/terms">
                {copy.footer.terms}
              </a>
              <a className="transition hover:text-blue-600" href={appHref}>
                {appLabel}
              </a>
            </div>
            <p className="text-xs font-semibold text-slate-400">
              © {new Date().getFullYear()} 3D PrintCost Studio · {copy.footer.rights}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
