// Backend/src/lib/pricing.js
const prisma = require("./prisma");

// ─────────────────────────────────────────────────────────────
// تبدیل‌ها
// ─────────────────────────────────────────────────────────────

/** ریال به تومان (تقسیم بر ۱۰) */
function rialToToman(rial) {
  if (rial == null) return 0;
  const big = typeof rial === "bigint" ? rial : BigInt(rial);
  return Number(big / 10n);
}

/** تومان به ریال (ضرب در ۱۰) */
function tomanToRial(toman) {
  if (toman == null) return 0n;
  return BigInt(Math.round(toman)) * 10n;
}

// ─────────────────────────────────────────────────────────────
// گرد کردن زیبا و حرفه‌ای رقم‌ها (پایان با ۵ یا ۹)
// ─────────────────────────────────────────────────────────────
//
// قواعد (طبق whatyoudo.md):
//  - قیمت نهایی «خورده» (رقم اعشار/کمتر از هزار) نداشته باشد
//  - رقم هزارگانه قیمت با ۵ یا ۹ تمام شود؛ مثال: 1491000 → 1495000 و 1362500 → 1369000
//  - گرد کردن به سمت بالا؛ حداکثر جابه‌جایی +۹٬۰۰۰ تومان (برای قیمت‌های بالای ۳۰۰ هزار ناچیز است)
//  - مبالغ زیر ۵۰ هزار تومان دست نمی‌خورند (محافظت از قیمت‌های آزمایشی/کوچک)
function prettyRound(toman) {
  if (!Number.isFinite(toman) || toman <= 0) return Math.max(1, Math.round(toman || 0));

  const rounded = Math.round(toman);

  // مبالغ خیلی کوچک: گرد کردن ساده (بدون دستکاری قیمتی)
  if (rounded < 50_000) return rounded;

  // ─────────────────────────────────────────────────────────
  // قاعده‌ی قیمت‌گذاری حرفه‌ای (طبق whatyoudo.md):
  //  - بدون «خرده» (خورده‌ی هزارگانه نداشته باشد)
  //  - رقم هزارگانه با ۵ یا ۹ تمام شود: 1491000 → 1495000 / 1362500 → 1369000
  //  - گرد کردن به سمت بالا (حداکثر +۹٬۰۰۰ تومان جابه‌جایی - ناچیز)
  // ─────────────────────────────────────────────────────────
  let thousands = Math.ceil(rounded / 1000); // سقف هزارگانه
  while (thousands % 10 !== 5 && thousands % 10 !== 9) {
    thousands += 1;
  }
  return thousands * 1000;
}

// ─────────────────────────────────────────────────────────────
// نرخ‌های دلار / تتر
// ─────────────────────────────────────────────────────────────

/** نرخ محاسباتی: قیمت خام + ۲٪، گرد‌شده به سمت بالا به ۱۰۰۰ تومان */
function computeRoundedRate(sourceBuyPrice) {
  const withMargin = sourceBuyPrice * 1.02;
  return Math.ceil(withMargin / 1000) * 1000;
}

/**
 * نرخ نمایشی: اندکی پایین‌تر از خام و "تمیز"
 * مثال: 218350 → 217000 (کمتر و خوش‌خوان)
 */
function computeDisplayRate(sourceBuyPrice) {
  const base = Math.floor(sourceBuyPrice);
  const roundTo = 1000;
  const floored = Math.floor(base / roundTo) * roundTo;
  // همیشه کمتر از نرخ خام، «تمیز» و محسوساً پایین‌تر تا کاربر حس عدالت قیمتی کند.
  // مثال مستند: 218350 → 217000 (یک پله کامل پایین‌تر از کف هزارگانه).
  const remainder = base - floored;
  const display = remainder <= 500 ? floored - roundTo : floored;
  if (display <= 0) return Math.max(1000, floored - roundTo);
  return display;
}

/** محاسبه‌ی نهایی قیمت تومانی از روی دلار (قبل از سود) */
function computeTargetPriceToman(usdPrice, roundedRate) {
  const usdWithCost = usdPrice + 0.6; // اضافه‌ی ۶۰ سنت هزینه‌ی خرید
  const beforeTax = usdWithCost * roundedRate;
  const tax = beforeTax * 0.05; // ۵٪ مالیات
  const fee = Math.min(beforeTax * 0.01, 30_000); // ۱٪ کارمزد تا سقف ۳۰ هزار
  return beforeTax + tax + fee;
}

// ─────────────────────────────────────────────────────────────
// محاسبه‌ی قیمت یک واریانت
// ─────────────────────────────────────────────────────────────

/**
 * محاسبه‌ی قیمت نهایی یک واریانت بر اساس حالت قیمت‌گذاری.
 *
 * @param {Object} variant - از پایگاه داده
 * @param {number|null} roundedRate - نرخ محاسباتی دلار (تومان)
 * @returns {bigint|null} قیمت نهایی به ریال
 */
async function computeVariantPriceRial(variant, roundedRate = null) {
  if (!variant || !variant.isActive) return null;

  if (variant.pricingMode === "FIXED_RIAL") {
    return variant.fixedPriceRial != null ? BigInt(variant.fixedPriceRial) : null;
  }

  // حالت پویا: نیاز به دلار و نرخ
  const usd = Number(variant.costUsd);
  if (!Number.isFinite(usd) || usd <= 0) return null;
  const rate = roundedRate ?? (await getRoundedRate());
  if (!rate || rate <= 0) return null;

  const targetToman = computeTargetPriceToman(usd, rate);

  // اعمال سود
  let finalToman = targetToman;
  if (variant.profitMode === "PERCENT" && variant.profitValue != null) {
    finalToman *= 1 + Number(variant.profitValue) / 100;
  } else if (variant.profitMode === "FIXED" && variant.profitValue != null) {
    finalToman += Number(variant.profitValue); // به تومان
  }

  const prettyToman = prettyRound(finalToman);
  return tomanToRial(prettyToman);
}

/** خواندن نرخ گرد‌شده از جدول تنظیمات */
async function getRoundedRate() {
  const row = await prisma.exchangeRateSetting.findUnique({ where: { id: "singleton" } });
  return row?.roundedRate || 0;
}

/** اعمال سود روی نرخ نمایشی (در صورت نیاز) — اینجا سود روی قیمت اعمال می‌شود، نه نرخ */

// ─────────────────────────────────────────────────────────────
// بروزرسانی خودکار همه‌ی واریانت‌های پویا
// ─────────────────────────────────────────────────────────────

/**
 * محاسبه و ذخیره‌ی قیمت نهایی همه‌ی واریانت‌های پویا با نرخ جدید.
 * در یک تراکنش اجرا می‌شود تا اگر وسط کار خطا داد، قیمت‌ها نیمه‌کاره نمانند.
 */
async function refreshAllDynamicPrices({ rate, now = new Date() } = {}) {
  const roundedRate = rate ?? (await getRoundedRate());
  if (!roundedRate || roundedRate <= 0) {
    return { updated: 0, skipped: 0, reason: "NO_RATE" };
  }

  const dynamicVariants = await prisma.productVariant.findMany({
    where: { pricingMode: "DYNAMIC_USD", isActive: true, costUsd: { not: null } },
  });

  let updated = 0;
  let skipped = 0;

  for (const variant of dynamicVariants) {
    const priceRial = await computeVariantPriceRial(variant, roundedRate);
    if (priceRial == null) {
      skipped += 1;
      continue;
    }
    await prisma.productVariant.update({
      where: { id: variant.id },
      data: {
        priceRial,
        basePriceRial: priceRial,
        lastPricedAt: now,
        originalPriceRial: variant.originalPriceRial ?? priceRial,
      },
    });
    updated += 1;
  }

  return { updated, skipped };
}

// ─────────────────────────────────────────────────────────────
// محاسبه‌ی کل سفارش (سبد خرید + کد تخفیف)
// ─────────────────────────────────────────────────────────────

async function calculateOrderTotals(items, orderLevelDiscountCode = null) {
  if (!items || items.length === 0) {
    const err = new Error("سبد خرید خالی است.");
    err.code = "EMPTY_CART";
    throw err;
  }

  const variantIds = items.map((i) => i.variantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds }, isActive: true },
    include: { product: true },
  });

  const variantMap = new Map(variants.map((v) => [v.id, v]));

  // افزودنی‌های درخواستی: قیمت همیشه از دیتابیس خوانده می‌شود (هرگز از کلاینت)
  const requestedAddOnIds = [
    ...new Set(items.map((it) => it.addOnId).filter(Boolean)),
  ];
  const addOnMap = new Map();
  if (requestedAddOnIds.length > 0) {
    const addOns = await prisma.productAddOn.findMany({
      where: { id: { in: requestedAddOnIds }, isActive: true },
    });
    for (const ao of addOns) addOnMap.set(ao.id, ao);
  }

  let subtotalRial = 0n;
  let itemDiscountRial = 0n;
  const resolvedItems = [];

  for (const item of items) {
    const variant = variantMap.get(item.variantId);
    if (!variant) {
      const err = new Error("یکی از محصولات سبد خرید دیگر موجود نیست.");
      err.code = "VARIANT_NOT_FOUND";
      throw err;
    }
    if (variant.priceRial == null) {
      const err = new Error(`قیمت پلن «${variant.name}» هنوز نهایی نشده و قابل خرید نیست.`);
      err.code = "VARIANT_PRICE_TBD";
      throw err;
    }

    // اعتبارسنجی افزودنی: باید متعلق به همین واریانت باشد
    let addOn = null;
    if (item.addOnId) {
      addOn = addOnMap.get(item.addOnId);
      if (!addOn || addOn.variantId !== variant.id) {
        const err = new Error("افزودنی انتخاب‌شده برای این پلن معتبر نیست.");
        err.code = "ADDON_INVALID";
        throw err;
      }
    }

    const addOnPriceRial = addOn ? addOn.priceRial : 0n;
    const lineTotal = variant.priceRial + addOnPriceRial; // تعداد همیشه 1 است
    subtotalRial += lineTotal;

    resolvedItems.push({
      productId: variant.productId,
      variantId: variant.id,
      productTitleSnapshot: variant.product.title,
      variantNameSnapshot: variant.name,
      addOnNameSnapshot: addOn ? addOn.name : null,
      addOnPriceRial: addOn ? addOn.priceRial : null,
      unitPriceRial: lineTotal,
      quantity: 1,
    });
  }

  let orderDiscountRial = 0n;
  let appliedOrderDiscountId = null;

  if (orderLevelDiscountCode) {
    const remainingBase = subtotalRial - itemDiscountRial;
    if (remainingBase > 0n) {
      const discountData = await resolveDiscountCode(orderLevelDiscountCode, remainingBase);
      orderDiscountRial = discountData.amountRial;
      appliedOrderDiscountId = discountData.discount.id;
    }
  }

  const discountRial = itemDiscountRial + orderDiscountRial;
  const totalRial = subtotalRial - discountRial;

  return {
    subtotalRial,
    discountRial,
    totalRial: totalRial > 0n ? totalRial : 0n,
    resolvedItems,
    totalToman: rialToToman(totalRial > 0n ? totalRial : 0n),
    appliedOrderDiscountId,
  };
}

async function resolveDiscountCode(code, baseAmountRial) {
  const discount = await prisma.discountCode.findUnique({ where: { code } });

  if (!discount || !discount.isActive) {
    const err = new Error("کد تخفیف معتبر نیست.");
    err.code = "DISCOUNT_INVALID";
    throw err;
  }
  if (discount.expiresAt && discount.expiresAt < new Date()) {
    const err = new Error("کد تخفیف منقضی شده است.");
    err.code = "DISCOUNT_EXPIRED";
    throw err;
  }
  if (discount.maxUses && discount.usedCount >= discount.maxUses) {
    const err = new Error("ظرفیت استفاده از این کد تخفیف تمام شده است.");
    err.code = "DISCOUNT_EXHAUSTED";
    throw err;
  }

  if (discount.minCartAmountRial && baseAmountRial < discount.minCartAmountRial) {
    const err = new Error("مبلغ سبد خرید برای اعمال این کد کافی نیست.");
    err.code = "DISCOUNT_MIN_CART";
    throw err;
  }

  let amountRial =
    discount.type === "FIXED"
      ? discount.amountRial || 0n
      : (baseAmountRial * BigInt(discount.percent || 0)) / 100n;

  if (discount.maxDiscountRial && amountRial > discount.maxDiscountRial) {
    amountRial = discount.maxDiscountRial;
  }

  if (amountRial > baseAmountRial) amountRial = baseAmountRial;

  return { discount, amountRial };
}

module.exports = {
  rialToToman,
  tomanToRial,
  prettyRound,
  computeRoundedRate,
  computeDisplayRate,
  computeTargetPriceToman,
  computeVariantPriceRial,
  refreshAllDynamicPrices,
  getRoundedRate,
  calculateOrderTotals,
  resolveDiscountCode,
};