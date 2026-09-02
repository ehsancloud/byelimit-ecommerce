// src/lib/formatters.js
// قالب‌بندی قیمت و مبالغ به صورت حرفه‌ای و RTL-friendly

/**
 * قالب‌بندی قیمت تومانی: جداگانه سه‌رقم و با پسوند "تومان"
 *
 * نکته: قیمت‌های ذخیره‌شده در دیتابیس از قبل گرد شده‌اند و به انتهای ۵ یا ۹ ختم می‌شوند.
 * این تابع فقط جداگانه کردن سه‌رقم و اضافه کردن پسوند را انجام می‌دهد.
 */
export function formatPriceToman(price) {
  if (price == null) return "---";
  const n = typeof price === "string" ? Number(price) : price;
  if (!Number.isFinite(n)) return "---";
  return n.toLocaleString("fa-IR");
}

/**
 * قیمت با "تومان" اضافه‌شده
 */
export function formatPriceWithUnit(price, unit = "تومان") {
  const formatted = formatPriceToman(price);
  return `${formatted} ${unit}`;
}

/**
 * جداگانه کردن عدد ریال به تومان و قالب‌بندی (برای نمایش در سبد/فاکتور)
 */
export function rialToFormattedToman(rialStr) {
  if (!rialStr) return "---";
  const rial = typeof rialStr === "bigint" ? Number(rialStr / 10n) : Number(rialStr) / 10;
  if (!Number.isFinite(rial)) return "---";
  return rial.toLocaleString("fa-IR");
}