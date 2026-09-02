# تغییرات نسخه ۰.۹۷

## ۱. درگاه پرداخت زیبال (جدید)
- فایل: `src/services/zibal.service.js`
- مرچنت کد: `6a97e1c9a9eb8b31692e4c28`
- متغیر محیطی جدید: `ZIBAL_MERCHANT_ID` و `BACKEND_URL`
- مسیر callback: `GET /api/payment/callback/zibal`
- مسیر request: `POST /api/payment/request` (پارامتر `gateway: "ZIBAL"`)

## ۲. مدل‌های جدید Prisma

### UsdRate
نرخ تتر - هر ۱۵ دقیقه از AbanTether دریافت و ذخیره می‌شود.
- `buyPrice`: قیمت واقعی API
- `displayPrice`: قیمت نمایشی (کمی پایین‌تر)
- `roundedRate`: نرخ گرد شده + ۲٪

### ProductPriceConfig
تنظیمات قیمت‌گذاری هر واریانت - از Prisma Studio مدیریت می‌شود:
- `useUsdFormula`: آیا از فرمول دلاری استفاده شود؟
- `fixedPriceRial`: قیمت ثابت (اگر useUsdFormula=false)
- `profitType`: PERCENT یا FIXED_RIAL
- `profitPercent`: درصد سود (پیش‌فرض: ۱۰٪)
- `profitFixedRial`: سود ثابت به ریال

## ۳. فرمول محاسبه قیمت تومانی
```
roundedRate = ceil(usdtBuyPrice × 1.02 / 1000) × 1000
baseToman = (costUsd + 0.6) × roundedRate
withTax = baseToman × 1.05
fee = min(withTax × 0.01, 30000)
afterFees = withTax + fee
finalToman = applyProfit(afterFees) → roundToBeautifully
```

## ۴. Migration
اجرای migration جدید:
```bash
npx prisma migrate deploy
```
یا در محیط dev:
```bash
npx prisma db push
```

## ۵. محصول تستی ۱۰۰ تومانی
از Prisma Studio یک محصول با واریانت `priceRial=1000` بسازید برای تست درگاه.

## ۶. تغییرات فرانت‌اند
- لاگ‌اوت از پنل کاربری: برطرف شد (از AuthContext استفاده می‌کند)
- داشبورد: فقط سفارشات نهایی (PAID/DELIVERED) نمایش داده می‌شود
- نماد اعتماد (eNamad): لینک بروز شد، جایگاه ساده شد
- بردکرامب: طراحی بهتر با پس‌زمینه شیشه‌ای
- باکس نرخ دلار: در هدر نمایش داده می‌شود
- انتخاب درگاه: در صفحه تسویه (زیبال فعال، زرین‌پال به‌زودی)
- افزونه Claude: گزینه پرداخت فوق امن ۱,۴۹۵,۰۰۰ تومانی
- قیمت‌ها: گرد شده به اعداد زیبا (پایان با ۵ یا ۹)
