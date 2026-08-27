// src/middleware/rateLimit.js
const rateLimit = require("express-rate-limit");

// اندپوینت‌های مالی (ساخت فاکتور / وریفای پرداخت) - محدودیت شدید طبق چک‌لیست:
// «۳ درخواست در دقیقه» برای جلوگیری از Brute-force و اسپم تراکنش.
const paymentRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً کمی صبر کنید.",
  },
});

// اندپوینت OTP - جلوگیری از اسپم پیامکی (هزینه مستقیم دارد)
const otpRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "تعداد درخواست کد تایید بیش از حد مجاز است." },
});

// محدودیت عمومی‌تر برای بقیه API (سبد خرید، مشاهده محصولات و ...)
const generalApiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { paymentRateLimiter, otpRateLimiter, generalApiRateLimiter };
