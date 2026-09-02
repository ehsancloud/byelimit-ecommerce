// src/lib/utils.js
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
/**
 * گرد کردن قیمت به شکل بازاریابی‌پسند
 * قیمت (به تومان) را به نزدیک‌ترین عدد ending in 5000 یا 9000 گرد می‌کند
 * @param {number} toman
 * @returns {number}
 */
export function roundPriceBeautifully(toman) {
  if (!toman || toman <= 0) return 0;
  const floored = Math.floor(toman / 10000) * 10000;
  const candidates = [
    floored + 5000,
    floored + 9000,
    floored + 15000,
    floored + 19000,
  ];
  const valid = candidates.filter((v) => v >= toman);
  return valid.length ? Math.min(...valid) : Math.ceil(toman / 1000) * 1000;
}

/**
 * نمایش قیمت با فرمت فارسی
 * @param {number|bigint} rial - قیمت به ریال
 * @returns {string} - قیمت گرد شده به تومان با فرمت فارسی
 */
export function formatPriceRial(rial) {
  const toman = Number(rial) / 10;
  const rounded = roundPriceBeautifully(toman);
  return rounded.toLocaleString("fa-IR");
}
