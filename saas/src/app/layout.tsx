import type { Metadata } from "next";
import "./globals.css";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        <meta charSet="UTF-8" />
      </head>
      <body>{children}</body>
    </html>
  );
}
