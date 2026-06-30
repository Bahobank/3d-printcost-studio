import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — 3D PrintCost Studio",
  description: "The terms that govern your use of 3D PrintCost Studio.",
};

const CONTACT_EMAIL = "rmarstudio@gmail.com";
const LAST_UPDATED = "30 June 2026";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-800">
      <article className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-200 bg-white px-6 py-10 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:px-12">
        <a href="/login" className="text-sm font-bold text-blue-600 hover:text-blue-700">← Back to 3D PrintCost Studio</a>

        <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-950">Terms of Service</h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">Last updated: {LAST_UPDATED}</p>

        <p className="mt-6 leading-7">
          These Terms govern your use of <strong>3D PrintCost Studio</strong> (the &ldquo;Service&rdquo;), operated by BAHO.
          By creating an account or using the Service, you agree to these Terms.
        </p>

        <Section title="1. The Service">
          <p className="mt-2 leading-7">3D PrintCost Studio is a tool for calculating 3D printing costs and managing print-related data. We may add, change, or remove features over time.</p>
        </Section>
        <Section title="2. Your account">
          <p className="mt-2 leading-7">You are responsible for keeping your login credentials secure and for all activity under your account. You must provide accurate information.</p>
        </Section>
        <Section title="3. Subscriptions & payments">
          <p className="mt-2 leading-7">Paid plans are billed through Stripe according to the plan you choose. You can cancel at any time; access continues until the end of the current billing period. Free trials and promotional/access codes are offered at our discretion.</p>
        </Section>
        <Section title="4. Acceptable use">
          <p className="mt-2 leading-7">You agree not to misuse the Service, attempt to disrupt it, or use it for unlawful purposes.</p>
        </Section>
        <Section title="5. Your data">
          <p className="mt-2 leading-7">You retain ownership of the data you enter. Our handling of personal data is described in our <a className="font-bold text-blue-600 hover:text-blue-700" href="/privacy">Privacy Policy</a>.</p>
        </Section>
        <Section title="6. Disclaimer">
          <p className="mt-2 leading-7">The Service is provided &ldquo;as is&rdquo;. Cost calculations are estimates to assist you and are not guarantees. We are not liable for business decisions made based on the Service.</p>
        </Section>
        <Section title="7. Changes & contact">
          <p className="mt-2 leading-7">We may update these Terms from time to time. Questions? Contact us at <a className="font-bold text-blue-600 hover:text-blue-700" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
        </Section>
      </article>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-black text-slate-950">{title}</h2>
      {children}
    </section>
  );
}
