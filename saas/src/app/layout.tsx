import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "3D PrintCost Studio",
  description: "ระบบคำนวณต้นทุนและบริหารงานพิมพ์ 3D สำหรับร้านค้าและผู้ขายงานพิมพ์",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}

