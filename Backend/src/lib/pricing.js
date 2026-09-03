// Backend/src/lib/pricing.js
const prisma = require("./prisma");

/**
 * تبدیل امن ریال به تومان
 */
function rialToToman(rial) {
  if (rial === null || rial === undefined) return 0;
  const bigRial = typeof rial === "bigint" ? rial : BigInt(Math.trunc(Number(rial)));
  return Number(bigRial / 10n);
}

/**
 * تبدیل تومان به ریال
 */
function tomanToRial(toman) {
  if (!toman) return 0n;
  return BigInt(Math.trunc(Number(toman))) * 10n;
}

/**
 * اعتبارسنجی و محاسبه کد تخفیف
 */
async function resolveDiscountCode(code, baseAmountRial, tx = prisma) {
  if (!code || typeof code !== "string") {
    return null;
  }

  const cleanCode = code.trim().toUpperCase();
  const discount = await tx.discountCode.findUnique({
    where: { code: cleanCode },
  });

  if (!discount || !discount.isActive) {
    const err = new Error("کد تخفیف وارد شده نامعتبر است یا غیرفعال شده است.");
    err.code = "DISCOUNT_INVALID";
    throw err;
  }

  if (discount.expiresAt && new Date(discount.expiresAt) < new Date()) {
    const err = new Error("مهلت استفاده از این کد تخفیف به پایان رسیده است.");
    err.code = "DISCOUNT_EXPIRED";
    throw err;
  }

  if (discount.maxUses !== null && discount.usedCount >= discount.maxUses) {
    const err = new Error("ظرفیت استفاده از این کد تخفیف تکمیل شده است.");
    err.code = "DISCOUNT_EXHAUSTED";
    throw err;
  }

  if (discount.minCartAmountRial && baseAmountRial < discount.minCartAmountRial) {
    const minToman = rialToToman(discount.minCartAmountRial).toLocaleString("fa-IR");
    const err = new Error(`این کد تخفیف برای سفارش‌های بالای ${minToman} تومان معتبر است.`);
    err.code = "DISCOUNT_MIN_CART";
    throw err;
  }

  let amountRial = 0n;

  if (discount.type === "FIXED") {
    amountRial = discount.amountRial ? BigInt(discount.amountRial) : 0n;
  } else if (discount.type === "PERCENT") {
    const percent = BigInt(Math.min(100, Math.max(0, discount.percent || 0)));
    amountRial = (baseAmountRial * percent) / 100n;
  }

  // اعمال سقف تخفیف (در صورت وجود)
  if (discount.maxDiscountRial && amountRial > discount.maxDiscountRial) {
    amountRial = BigInt(discount.maxDiscountRial);
  }

  // تخفیف نباید از کل مبلغ سفارش بیشتر شود
  if (amountRial > baseAmountRial) {
    amountRial = baseAmountRial;
  }

  return { discount, amountRial };
}

/**
 * محاسبه کامل جمع فاکتور، بررسی قیمت‌ها و استعلام موجودی انبار
 */
async function calculateOrderTotals(items, orderLevelDiscountCode = null, tx = prisma) {
  if (!items || items.length === 0) {
    const err = new Error("سبد خرید شما خالی است.");
    err.code = "EMPTY_CART";
    throw err;
  }

  const variantIds = items.map((i) => i.variantId);
  const variants = await tx.productVariant.findMany({
    where: { id: { in: variantIds }, isActive: true },
    include: { product: true },
  });

  const variantMap = new Map(variants.map((v) => [v.id, v]));

  let subtotalRial = 0n;
  const resolvedItems = [];

  for (const item of items) {
    const variant = variantMap.get(item.variantId);
    if (!variant || !variant.product?.isActive) {
      const err = new Error("یکی از محصولات سبد خرید دیگر موجود یا فعال نیست.");
      err.code = "VARIANT_NOT_FOUND";
      throw err;
    }

    if (variant.priceRial === null || variant.priceRial === undefined) {
      const err = new Error(`قیمت پلن «${variant.name}» هنوز نهایی نشده و قابل سفارش نیست.`);
      err.code = "VARIANT_PRICE_TBD";
      throw err;
    }

    // بررسی حداقل ۱ موجودی فعال در انبار اکانت‌ها
    const availableCount = await tx.accountInventory.count({
      where: { variantId: variant.id, status: "AVAILABLE" },
    });

    if (availableCount === 0) {
      const err = new Error(`متأسفانه موجودی پلن «${variant.product.title} - ${variant.name}» در حال حاضر به اتمام رسیده است.`);
      err.code = "OUT_OF_STOCK";
      throw err;
    }

    const itemPrice = BigInt(variant.priceRial);
    subtotalRial += itemPrice;

    resolvedItems.push({
      productId: variant.productId,
      variantId: variant.id,
      productTitleSnapshot: variant.product.title,
      variantNameSnapshot: variant.name,
      unitPriceRial: itemPrice,
      quantity: 1,
    });
  }

  let discountRial = 0n;
  let appliedOrderDiscountId = null;
  let discountDetails = null;

  if (orderLevelDiscountCode && subtotalRial > 0n) {
    discountDetails = await resolveDiscountCode(orderLevelDiscountCode, subtotalRial, tx);
    if (discountDetails) {
      discountRial = discountDetails.amountRial;
      appliedOrderDiscountId = discountDetails.discount.id;
    }
  }

  const rawTotal = subtotalRial - discountRial;
  const totalRial = rawTotal > 0n ? rawTotal : 0n;

  return {
    subtotalRial,
    discountRial,
    totalRial,
    subtotalToman: rialToToman(subtotalRial),
    discountToman: rialToToman(discountRial),
    totalToman: rialToToman(totalRial),
    resolvedItems,
    appliedOrderDiscountId,
    discountCode: discountDetails?.discount?.code || null,
  };
}

module.exports = {
  rialToToman,
  tomanToRial,
  calculateOrderTotals,
  resolveDiscountCode,
};