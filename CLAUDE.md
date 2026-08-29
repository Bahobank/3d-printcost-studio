# 3D Print Cost Studio SaaS

## สรุป
เว็บ SaaS สำหรับคำนวณต้นทุนงานพิมพ์ 3D และจัดการสต็อกฟิลาเมนต์ (โค้ดแอปอยู่ในโฟลเดอร์ saas/) มีสคริปต์เปิด dev พร้อมข้อมูลเก่า

## Tech stack
Next.js + React + Supabase + Stripe (TypeScript, Tailwind)

## พาธ
- พาธเดิม (old): `C:\Users\CG BAHO\Documents\Codex\2026-06-01\3d-printer-stock-filament-stock-filament`
- พาธปัจจุบัน (canonical): `D:\SynologyDrive\Dropbox\B A N K\Program\_Dev\3D Print Cost Studio SaaS`
- วันที่ย้าย: 2026-07-17

## วิธีรัน
1) `cd saas`
2) `npm install`
3) ตั้งค่า .env (มี .env.local/.env.production.local อยู่แล้ว)
4) `npm run dev`
หรือใช้สคริปต์ `OPEN_DEV_WITH_OLD_DATA.cmd` / `เปิดโปรแกรม-dev-พร้อมข้อมูลเก่า.cmd`

## หมายเหตุการย้าย
ไม่ได้คัดลอก: node_modules, .next, โฟลเดอร์ outputs/ (825M) และ work/installer, รวมถึง saas/public (82M asset) — ต้นฉบับเต็มยังอยู่ใน Codex ถ้าต้องใช้ public ให้ก๊อปเพิ่มภายหลัง

> ไฟล์นี้สร้างอัตโนมัติตอนรวมโปรเจกต์เข้าโฟลเดอร์ Program
