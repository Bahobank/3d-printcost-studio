import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — 3D PrintCost Studio",
  description: "How 3D PrintCost Studio collects, uses, and protects your data.",
};

const CONTACT_EMAIL = "rmarstudio@gmail.com";
const LAST_UPDATED = "30 June 2026";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-800">
      <article className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-200 bg-white px-6 py-10 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:px-12">
        <a href="/login" className="text-sm font-bold text-blue-600 hover:text-blue-700">← Back to 3D PrintCost Studio</a>

        <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-950">Privacy Policy</h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">Last updated: {LAST_UPDATED}</p>

        <p className="mt-6 leading-7">
          This Privacy Policy explains how <strong>3D PrintCost Studio</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, the
          &ldquo;Service&rdquo;), operated by BAHO, collects, uses, and protects your information when you use our website
          at <strong>https://3dprintcost.studio</strong> and related services.
        </p>

        <Section title="1. Information we collect">
          <ul className="mt-2 list-disc space-y-2 pl-5 leading-7">
            <li><strong>Account information</strong> — your email address, display name, and profile picture. If you sign in with Google, we receive your basic Google profile (name, email address, and profile photo) to create and secure your account.</li>
            <li><strong>App data you enter</strong> — print jobs, material stock, printers, orders, costs, and settings you create in the app. This is stored so you can access it across your devices.</li>
            <li><strong>Payment information</strong> — handled entirely by our payment processor, Stripe. We never see or store your full card number.</li>
            <li><strong>Usage data</strong> — anonymous analytics (pages viewed, approximate region, device type, engagement time) collected via Vercel Analytics and Google Analytics to help us improve the product.</li>
          </ul>
        </Section>

        <Section title="2. How we use your information">
          <ul className="mt-2 list-disc space-y-2 pl-5 leading-7">
            <li>To provide, operate, and maintain the Service and your account.</li>
            <li>To sync and restore your data across your devices.</li>
            <li>To process subscriptions and payments.</li>
            <li>To communicate with you about your account and important updates.</li>
            <li>To analyze usage and improve features, performance, and reliability.</li>
          </ul>
        </Section>

        <Section title="3. Google user data & Limited Use">
          <p className="mt-2 leading-7">
            When you sign in with Google, we only request your basic profile and email address to create your account and
            identify you. Our use of information received from Google APIs adheres to the{" "}
            <a className="font-bold text-blue-600 hover:text-blue-700" href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements. We do not sell Google user data, do not use it for advertising, and do
            not transfer it to others except as needed to provide the Service or as required by law.
          </p>
        </Section>

        <Section title="4. Third-party services">
          <p className="mt-2 leading-7">We rely on trusted providers to operate the Service:</p>
          <ul className="mt-2 list-disc space-y-2 pl-5 leading-7">
            <li><strong>Supabase</strong> — authentication and secure database hosting.</li>
            <li><strong>Stripe</strong> — payment processing.</li>
            <li><strong>Google</strong> — sign-in and analytics.</li>
            <li><strong>Vercel</strong> — application hosting and analytics.</li>
          </ul>
        </Section>

        <Section title="5. Cookies">
          <p className="mt-2 leading-7">
            We use essential cookies to keep you signed in, and analytics cookies to understand how the Service is used.
            You can control cookies through your browser settings.
          </p>
        </Section>

        <Section title="6. Data retention & deletion">
          <p className="mt-2 leading-7">
            We keep your data for as long as your account is active. You may request access to, correction of, or deletion
            of your personal data at any time by emailing us at{" "}
            <a className="font-bold text-blue-600 hover:text-blue-700" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            When you delete your account, your associated data is removed.
          </p>
        </Section>

        <Section title="7. Security">
          <p className="mt-2 leading-7">
            Your data is transmitted over encrypted connections (HTTPS) and stored securely. While no method of transmission
            or storage is completely secure, we take reasonable measures to protect your information.
          </p>
        </Section>

        <Section title="8. Children">
          <p className="mt-2 leading-7">The Service is not directed to children under 13, and we do not knowingly collect data from them.</p>
        </Section>

        <Section title="9. Changes to this policy">
          <p className="mt-2 leading-7">
            We may update this Privacy Policy from time to time. We will revise the &ldquo;Last updated&rdquo; date above when we do.
          </p>
        </Section>

        <Section title="10. Contact us">
          <p className="mt-2 leading-7">
            If you have any questions about this Privacy Policy, contact us at{" "}
            <a className="font-bold text-blue-600 hover:text-blue-700" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        </Section>

        <hr className="my-10 border-slate-200" />

        {/* ===== ภาษาไทย ===== */}
        <h2 className="text-2xl font-black tracking-tight text-slate-950">นโยบายความเป็นส่วนตัว (ภาษาไทย)</h2>
        <p className="mt-2 text-sm font-semibold text-slate-500">ปรับปรุงล่าสุด: 30 มิถุนายน 2026</p>
        <p className="mt-4 leading-8">
          นโยบายนี้อธิบายวิธีที่ <strong>3D PrintCost Studio</strong> (โดย BAHO) เก็บรวบรวม ใช้ และปกป้องข้อมูลของคุณ
          เมื่อใช้งานเว็บไซต์ <strong>https://3dprintcost.studio</strong>
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 leading-8">
          <li><strong>ข้อมูลบัญชี</strong> — อีเมล ชื่อที่แสดง และรูปโปรไฟล์ หากเข้าสู่ระบบด้วย Google เราจะได้รับโปรไฟล์พื้นฐาน (ชื่อ อีเมล รูปภาพ) เพื่อสร้างบัญชีของคุณ</li>
          <li><strong>ข้อมูลที่คุณบันทึกในแอป</strong> — งานพิมพ์ สต๊อกวัสดุ เครื่องพิมพ์ ออเดอร์ ต้นทุน และการตั้งค่า (เก็บไว้เพื่อให้ใช้ข้ามอุปกรณ์ได้)</li>
          <li><strong>ข้อมูลการชำระเงิน</strong> — ดำเนินการผ่าน Stripe ทั้งหมด เราไม่เก็บเลขบัตรของคุณ</li>
          <li><strong>ข้อมูลการใช้งาน</strong> — สถิติแบบไม่ระบุตัวตน ผ่าน Vercel Analytics และ Google Analytics เพื่อปรับปรุงบริการ</li>
        </ul>
        <p className="mt-4 leading-8">
          เราใช้ข้อมูลเพื่อให้บริการ ซิงค์ข้อมูล ประมวลผลการชำระเงิน และพัฒนาผลิตภัณฑ์ เราปฏิบัติตาม
          นโยบายข้อมูลผู้ใช้ของ Google API (รวมข้อกำหนด Limited Use) ไม่ขายข้อมูล และไม่ใช้เพื่อการโฆษณา
          คุณสามารถขอเข้าถึง แก้ไข หรือลบข้อมูลส่วนบุคคลได้ทุกเมื่อ โดยอีเมลมาที่{" "}
          <a className="font-bold text-blue-600 hover:text-blue-700" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
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
