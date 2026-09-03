# راهنمای Prisma Studio — بای لیمیت

## اجرای Prisma Studio

```bash
cd /var/www/byelimit/Backend
npx prisma studio --port 5555
```

سپس از مرورگر سرور (یا با SSH tunnel) باز کنید:
```
http://localhost:5555
```

> **SSH Tunnel** (اگر از لپ‌تاپ دسترسی می‌زنید):
> ```bash
> ssh -L 5555:localhost:5555 root@IP_SERVER
> ```
> سپس در مرورگر: `http://localhost:5555`

---

## مدیریت قیمت محصولات

### ۱. تنظیم قیمت ثابت (بدون فرمول دلاری)
در Prisma Studio:
- وارد جدول `product_variants` شوید
- فیلد `priceRial` را ویرایش کنید (واحد: **ریال**)
  - مثال: برای نمایش ۱,۵۰۰,۰۰۰ تومان → وارد کنید `15000000`
- فیلد `originalPriceRial` را فقط اگر تخفیف واقعی دارید تنظیم کنید (وگرنه خالی بگذارید)

### ۲. تنظیم قیمت‌گذاری دلاری (خودکار هر ۱۵ دقیقه)
در جدول `product_price_configs`:
- `useUsdFormula = true` → قیمت از نرخ تتر محاسبه می‌شود
- `costUsd` → هزینه دلاری پایه (مثلاً 20.0 برای Claude Pro)
- `profitType = PERCENT` + `profitPercent = 15` → ۱۵٪ سود
- `profitType = FIXED_RIAL` + `profitFixedRial = 5000000` → سود ثابت ۵۰۰ هزار تومان

### ۳. تخفیف روی یک واریانت
در جدول `product_variants`:
- `priceRial` = قیمت فروش (پایین‌تر)
- `originalPriceRial` = قیمت قبل از تخفیف (بالاتر)
- تخفیف به صورت خط‌خورده در سایت نمایش داده می‌شود

---

## جداول مهم

| جدول | کاربرد |
|---|---|
| `products` | اطلاعات کلی محصول |
| `product_variants` | گزینه‌ها و قیمت‌ها |
| `product_price_configs` | تنظیم قیمت‌گذاری دلاری + سود |
| `usd_rates` | تاریخچه نرخ تتر |
| `orders` | سفارشات مشتریان |
| `payments` | تراکنش‌های پرداخت |
| `account_inventory` | موجودی اکانت‌های آماده |
| `users` | کاربران |
| `discount_codes` | کدهای تخفیف |

---

## نکات مهم

⚠️ **هرگز** جداول `users`, `orders`, `payments`, `order_items` را بدون دلیل ویرایش نکنید.

✅ برای افزودن محصول جدید:
1. جدول `products` → Add record
2. جدول `product_variants` → Add record با `productId` مربوطه
3. اختیاری: جدول `product_price_configs` برای قیمت‌گذاری خودکار

✅ برای غیرفعال کردن محصول:
- جدول `products` → فیلد `isActive = false`

✅ برای افزودن اکانت به موجودی:
- جدول `account_inventory` → Add record
- `variantId` = شناسه پلن مربوطه
- `credentialsEncrypted` = اطلاعات اکانت (رمزنگاری توصیه می‌شود)
- `status = AVAILABLE`
