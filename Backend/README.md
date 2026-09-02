# بک‌اند بای لیمیت

Node.js + Express + PostgreSQL (Prisma) + Redis (BullMQ)

## راه‌اندازی اولیه

```bash
cd backend
cp .env.example .env
# مقادیر واقعی .env را پر کنید (حداقل DATABASE_URL برای شروع)

npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed        # پر کردن دیتابیس با ۳۶ محصول واقعی (قیمت‌ها TBD)

npm run dev                # سرور API روی PORT (پیش‌فرض 4000)
npm run worker             # در یک ترمینال جدا - پردازشگر صف BullMQ
```

⚠️ **نکته مهم:** در محیطی که این پروژه ساخته شد، دسترسی شبکه محدود به چند دامنه بود
و امکان دانلود موتور Prisma (`binaries.prisma.sh`) وجود نداشت. `schema.prisma` با
دقت و بدون اجرای واقعی نوشته شده. **حتماً پیش از `migrate`، دستور `npx prisma validate`
را در محیط خودتان اجرا کنید.**

## معماری پوشه‌ها

```
prisma/schema.prisma      مدل کامل دیتابیس
prisma/seed.js            محصولات واقعی از اکسل شما (قیمت‌ها TBD)
src/server.js             نقطه ورود Express
src/routes/                auth | cart | orders | payment | products | telegram
src/services/               otp.service.js (کاوه‌نگار) | zarinpal.service.js
src/lib/                    prisma client | pricing (محاسبه قیمت سمت سرور) | audit | queue
src/middleware/              auth (JWT) | rateLimit | errorHandler
src/jobs/                    unverified-cron.js | worker.js (BullMQ)
```

## نکات امنیتی پیاده‌سازی‌شده (طبق چک‌لیست شما)

| مورد | فایل |
|---|---|
| Session Validation | `payment.routes.js` (orderId در callback_url + مقایسه با sessionSnapshot) |
| Card PAN | `zarinpal.service.js` → `requestPayment({ cardPan })` |
| Currency صریح | `zarinpal.service.js` (`currency: "IRT"`) |
| کران‌جاب unVerified | `jobs/unverified-cron.js` (هر ۵ دقیقه) |
| Inquiry | `zarinpal.service.js` → `inquiryPayment()` |
| Reverse خودکار | `payment.routes.js` (وقتی موجودی اکانت کافی نیست) |
| مپ کدهای خطا | `zarinpal.service.js` → `ZARINPAL_ERROR_MESSAGES` |
| لاگ کارمزد | `Payment.feeRial` در schema |
| SetShare | اسکلت آماده در `zarinpal.service.js` → `buildShares()` |
| Sandbox ایزوله | `ZARINPAL_SANDBOX` در `.env` |
| تراکنش اتمیک ($transaction) | `payment.routes.js` → `fulfillOrder()` |
| قفل ردیف (FOR UPDATE) | همان‌جا، `SELECT ... FOR UPDATE SKIP LOCKED` روی `account_inventory` |
| مبالغ Integer/BigInt (نه Float) | همه‌ی فیلدهای قیمت در `schema.prisma` از نوع `BigInt` (ریال) |
| Idempotency روی Authority | `Payment.authority` یونیک + چک وضعیت PENDING پیش از پردازش |
| Rate Limiting مالی | `middleware/rateLimit.js` (۳ درخواست/دقیقه روی `/request` و OTP) |
| Zod validation | همه‌ی route ها |
| قیمت هرگز از فرانت‌اند | `lib/pricing.js` - همیشه از `variant.priceRial` در دیتابیس |
| صف تحویل (BullMQ) | `lib/queue.js` + `jobs/worker.js` |
| Audit Log تغییرناپذیر | `lib/audit.js` (فقط insert، هرگز update/delete) |
| UUID غیرقابل‌حدس | `Order.orderNumber` با `@default(uuid())` |

## اتصال ربات تلگرام پشتیبانی (که خودتان می‌سازید)

مکانیزم Outbox ساده - نیازی به BullMQ/Redis سمت ربات نیست:

1. به‌محض تایید پرداخت، یک رکورد در جدول `telegram_notifications` با وضعیت
   `PENDING` ثبت می‌شود (خودکار، داخل `payment.routes.js`).
2. ربات شما هر چند ثانیه یک‌بار این را صدا می‌زند:
   ```
   GET https://api.byelimit.ir/internal/telegram/pending
   Header: x-internal-api-key: <INTERNAL_API_KEY از .env>
   ```
   پاسخ شامل شماره سفارش، موبایل، آیدی تلگرام مشتری، لیست محصولات و مبلغ است.
3. بعد از ارسال موفق پیام به چت پشتیبانی:
   ```
   POST https://api.byelimit.ir/internal/telegram/:id/ack   Header: x-internal-api-key: <همان کلید>
   ```

جزئیات کامل در `src/routes/telegram.routes.js`.

## کاری که هنوز باقی مانده (قدم بعدی)

- گرفتن مرچنت کد واقعی زرین‌پال و پر کردن `ZARINPAL_MERCHANT_ID`
- گرفتن نام کاربری و رمز پنل ملی پیامک و پر کردن `MELIPAYAMAK_USERNAME` و `MELIPAYAMAK_PASSWORD`
- در صورت نیاز، `MELIPAYAMAK_FROM` را هم با شماره خط/فرستنده معتبر پر کنید
- وارد کردن قیمت‌های نهایی واقعی (تومان) در `ProductVariant.priceRial` - از طریق
  Prisma Studio (`npm run prisma:studio`) یا یک پنل مدیریت که بعداً ساخته می‌شود
- افزودن رکوردهای واقعی `AccountInventory` (کردنشیال اکانت‌های واقعی، رمزنگاری‌شده)
- دیپلوی روی سرور واقعی + اتصال `DATABASE_URL`/`REDIS_URL` به سرویس‌های واقعی
- ساخت ربات تلگرام طبق قرارداد بالا

## محصول تستی زیبال

برای تست درگاه زیبال، یک محصول ۱۰۰ تومانی از طریق Prisma Studio ایجاد کنید:
```
Product: slug="test-zibal-100-toman", title="تست درگاه"
Variant: name="پلن تستی", priceRial=1000 (= 100 تومان)
```
