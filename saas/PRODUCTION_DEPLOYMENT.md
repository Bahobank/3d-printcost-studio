# Production Deployment - 3D PrintCost Studio

โดเมน production: https://www.3dprintcost.studio

## 1. Supabase

1. สร้าง Supabase project จริง
2. เปิด Authentication providers ที่ต้องใช้:
   - Email
   - Google
   - Apple
3. ตั้งค่า Site URL:
   - https://www.3dprintcost.studio
4. ตั้งค่า Redirect URLs:
   - https://www.3dprintcost.studio/auth/callback
   - https://3dprintcost.studio/auth/callback
5. รัน SQL migrations ตามลำดับใน Supabase SQL Editor:
   - supabase/migrations/001_initial_schema.sql
   - supabase/migrations/002_subscription_trial_flow.sql
   - supabase/migrations/003_profile_account_fields.sql

## 2. Stripe

สร้าง Product/Price แบบ recurring subscription:

- Maker monthly: 199 THB / month
- Maker yearly: 1,790 THB / year
- Studio monthly: 299 THB / month
- Studio yearly: 2,790 THB / year

นำ Price ID ไปใส่ใน Vercel Environment Variables:

- STRIPE_PRICE_MAKER_MONTHLY
- STRIPE_PRICE_MAKER_YEARLY
- STRIPE_PRICE_STUDIO_MONTHLY
- STRIPE_PRICE_STUDIO_YEARLY

Webhook endpoint:

https://www.3dprintcost.studio/api/stripe/webhook

Events ที่ต้องส่ง:

- checkout.session.completed
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_failed
- invoice.payment_succeeded

## 3. Vercel Environment Variables

ตั้งค่าต่อไปนี้ใน Production environment ของ Vercel:

- NEXT_PUBLIC_APP_URL=https://www.3dprintcost.studio
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- STRIPE_PRICE_MAKER_MONTHLY
- STRIPE_PRICE_MAKER_YEARLY
- STRIPE_PRICE_STUDIO_MONTHLY
- STRIPE_PRICE_STUDIO_YEARLY

ห้ามใส่ค่า secret ในไฟล์ที่ commit เข้า Git

## 4. Vercel Project Settings

ถ้า import repository ทั้งก้อน ให้ตั้ง Root Directory เป็น:

saas

Build command:

npm run build

Install command:

npm ci

## 5. Domain

ใน Vercel > Project > Settings > Domains เพิ่ม:

- www.3dprintcost.studio
- 3dprintcost.studio

ตั้ง DNS ที่ผู้ให้บริการโดเมนตามค่าที่ Vercel แสดง โดยทั่วไป:

- www ใช้ CNAME ไปที่ cname.vercel-dns.com
- apex/root domain ใช้ A record ตามที่ Vercel แนะนำ

## 6. Verification

ก่อนเปิดให้ลูกค้าจริง:

1. สมัครบัญชีใหม่ด้วยอีเมล
2. ล็อกอินด้วย Google
3. ล็อกอินด้วย Apple
4. ตรวจ trial 7 วัน
5. เปิด preview expired trial
6. เลือก Maker monthly แล้วไป Stripe Checkout
7. เลือก Studio yearly แล้วไป Stripe Checkout
8. จ่ายด้วย Stripe test card ก่อนเปิด live mode
9. ตรวจว่า webhook อัปเดต subscription_status เป็น active
10. ตรวจว่าหลังหมด trial ถ้าไม่มี subscription จะถูก block ด้วย pricing modal
