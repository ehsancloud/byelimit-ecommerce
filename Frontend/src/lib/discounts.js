// src/lib/discounts.js

/**
 * دیتای نمایشیِ کدهای تخفیف (فعلاً کلاینتی/Mock).
 *
 * TODO(backend): این منطق باید کاملاً به سرور منتقل شود:
 * یک اندپوینت POST /api/discounts/validate که با product_id و کد تخفیف،
 * اعتبار و مبلغ نهایی را از دیتابیس برمی‌گرداند - هرگز به مقدار کلاینتی اعتماد نشود،
 * چون قیمت نهایی باید همیشه در بک‌اند و بر مبنای product_id محاسبه شود.
 */
const DISCOUNT_CODES = {
  SAVE50: { type: "fixed", amount: 50000, label: "۵۰,۰۰۰ تومان" },
  OFF10: { type: "percent", amount: 10, label: "۱۰٪" },
};

/**
 * @param {string} code
 * @param {number} basePrice
 * @returns {{ valid: boolean, discountAmount: number, message: string }}
 */
export function validateDiscountCode(code, basePrice) {
  const normalized = (code || "").trim().toUpperCase();
  if (!normalized) {
    return { valid: false, discountAmount: 0, message: "کد تخفیف را وارد کنید." };
  }

  const entry = DISCOUNT_CODES[normalized];
  if (!entry) {
    return {
      valid: false,
      discountAmount: 0,
      message: "کد تخفیف واردشده معتبر نیست یا منقضی شده است.",
    };
  }

  const discountAmount =
    entry.type === "fixed"
      ? Math.min(entry.amount, basePrice)
      : Math.round((basePrice * entry.amount) / 100);

  return {
    valid: true,
    discountAmount,
    message: `کد تخفیف ${entry.label} با موفقیت اعمال شد!`,
  };
}
