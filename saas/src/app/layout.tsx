import type { Metadata } from "next";
import { headers } from "next/headers";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID?.trim();

export const metadata: Metadata = {
  title: "3D PrintCost Studio",
  description: "ระบบคำนวณต้นทุนและบริหารงานพิมพ์ 3D สำหรับร้านค้าและผู้ขายงานพิมพ์",
  icons: {
    icon: "/assets/official-3d-printcost-logo.png",
    shortcut: "/assets/official-3d-printcost-logo.png",
    apple: "/assets/official-3d-printcost-logo.png",
  },
  verification: {
    google: "ZBmfbHcA_iLo0CVW_KLpBz_5fmOJ_O4A4CyYl_JbZrM",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // The middleware resolves the language (?lang= wins, then Accept-Language) and
  // passes it down here, so <html lang> matches the text actually on the page.
  const requestHeaders = await headers();
  const language = requestHeaders.get("x-app-lang") ?? "th";

  return (
    <html lang={language}>
      <head>
        <meta charSet="UTF-8" />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
      {GA_ID ? <GoogleAnalytics gaId={GA_ID} /> : null}
    </html>
  );
}
