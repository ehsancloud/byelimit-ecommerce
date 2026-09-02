// Backend/src/lib/pricing.js
const prisma = require("./prisma");

function rialToToman(rial) {
  return Number(rial / 10n);
}

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

    const lineTotal = variant.priceRial; // تعداد همیشه 1 است
    subtotalRial += lineTotal;

    // Item-level discounts are no longer supported. Only order-level discounts are applied.
    resolvedItems.push({
      productId: variant.productId,
      variantId: variant.id,
      productTitleSnapshot: variant.product.title,
      variantNameSnapshot: variant.name,
      unitPriceRial: variant.priceRial,
      quantity: 1, // اجبار به ثبت 1 در دیتابیس
    });
  }

  let orderDiscountRial = 0n;
  let appliedOrderDiscountId = null;

  // محاسبه کد تخفیف سطح کل سفارش (فقط روی مبلغ باقی‌مانده)
  if (orderLevelDiscountCode) {
    const remainingBase = subtotalRial - itemDiscountRial;
    if (remainingBase > 0n) {
      const discountData = await resolveDiscountCode(orderLevelDiscountCode, remainingBase);
      orderDiscountRial = discountData.amountRial;
      appliedOrderDiscountId = discountData.discount.id; // ذخیره آیدی کد تخفیف
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

  // Minimum cart amount requirement
  if (discount.minCartAmountRial && baseAmountRial < discount.minCartAmountRial) {
    const err = new Error("مبلغ سبد خرید برای اعمال این کد کافی نیست.");
    err.code = "DISCOUNT_MIN_CART";
    throw err;
  }

  let amountRial =
    discount.type === "FIXED"
      ? discount.amountRial || 0n
      : (baseAmountRial * BigInt(discount.percent || 0)) / 100n;

  // cap by maxDiscountRial if provided
  if (discount.maxDiscountRial && amountRial > discount.maxDiscountRial) {
    amountRial = discount.maxDiscountRial;
  }

  // never exceed base amount
  if (amountRial > baseAmountRial) amountRial = baseAmountRial;

  return { discount, amountRial };
}

module.exports = { calculateOrderTotals, resolveDiscountCode, rialToToman };