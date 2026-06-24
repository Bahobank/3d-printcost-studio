# 3D PrintCost Studio SaaS

เว็บ SaaS สำหรับ 3D PrintCost Studio ใช้ Next.js, Supabase Auth/Database และ Stripe Billing

## สิ่งที่มีในโครงนี้

- Login ก่อนเข้าใช้งาน: Email/password, Magic link, Google, Facebook, Apple
- Trial 7 วันสำหรับผู้ใช้ใหม่
- Pricing: Free Trial, Monthly 149 THB, Yearly 1,490 THB
- Stripe Checkout และ Stripe Customer Portal
- Stripe webhook สำหรับอัปเดตสถานะ subscription
- Server-side access check สำหรับกันผู้ใช้ที่หมด trial หรือไม่มี subscription active
- หน้า Account/Billing ยังเข้าได้แม้หมดอายุ

## Setup

1. สร้าง Supabase project แล้วเปิด Authentication providers ที่ต้องการ
2. รัน SQL ใน `supabase/migrations/001_initial_schema.sql`
3. สร้าง Stripe Product และ Prices:
   - Monthly: 149 THB / month
   - Yearly: 1,490 THB / year
4. คัดลอก `.env.example` เป็น `.env.local` แล้วใส่ค่าจริง
5. รัน `npm install`
6. รัน `npm run dev`

## Routes

- `/login` เข้าสู่ระบบ
- `/pricing` เลือกแพ็กเกจ
- `/dashboard` แดชบอร์ด
- `/calculator` คำนวณต้นทุนงานพิมพ์
- `/materials` สต็อกวัสดุ
- `/printers` เครื่องพิมพ์
- `/history` ประวัติงาน
- `/profits` วิเคราะห์กำไร
- `/settings` ตั้งค่า
- `/account` บัญชีผู้ใช้
- `/billing` จัดการแพ็กเกจ

## Stripe webhook endpoint

ตั้ง endpoint ใน Stripe เป็น:

`https://your-domain.com/api/stripe/webhook`

Events ที่ควรส่ง:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`
- `invoice.payment_succeeded`

