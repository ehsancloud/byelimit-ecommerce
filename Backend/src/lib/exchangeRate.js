// Backend/src/lib/exchangeRate.js
// دریافت نرخ تتر از ابان‌تتر و به‌روزرسانی تنظیمات + قیمت‌های پویا

const prisma = require("./prisma");
const {
  computeRoundedRate,
  computeDisplayRate,
  computeTargetPriceToman,
  tomanToRial,
  prettyRound,
} = require("./pricing");

const TICKER_URL = "https://api.abantether.com/api/v1/manager/otc/ticker";

async function fetchUsdtBuyPrice() {
  const res = await fetch(TICKER_URL, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    throw new Error(`TICKER_HTTP_${res.status}`);
  }
  const json = await res.json();

  // ساختار ممکن: { data: { USDT: { buy_price } } } یا { USDT: { buy_price } }
  const usdt = json?.data?.USDT ?? json?.USDT;
  const buy = usdt?.buy_price;
  if (typeof buy !== "number" || !Number.isFinite(buy) || buy <= 0) {
    throw new Error("TICKER_BAD_SHAPE");
  }
  return buy;
}

/**
 * بروزرسانی نرخ و قیمت‌های پویا.
 * در صورت موفقیت، نرخ و همه‌ی واریانت‌های پویا در یک تراکنش به‌روز می‌شوند.
 * در صورت خطا، قیمت‌های قبلی دست نمی‌خورند (last-known-good).
 */
async function updateRates() {
  const buyPrice = await fetchUsdtBuyPrice();

  const roundedRate = computeRoundedRate(buyPrice);
  const displayRate = computeDisplayRate(buyPrice);

  const now = new Date();

  const result = await prisma.$transaction(async (tx) => {
    await tx.exchangeRateSetting.upsert({
      where: { id: "singleton" },
      update: {
        sourceBuyPrice: buyPrice,
        roundedRate,
        displayRate,
        lastFetchedAt: now,
        lastError: null,
      },
      create: {
        id: "singleton",
        sourceBuyPrice: buyPrice,
        roundedRate,
        displayRate,
        lastFetchedAt: now,
      },
    });

    // قیمت‌های پویا را با نرخ جدید بازنویسی کن
    const dynamicVariants = await tx.productVariant.findMany({
      where: { pricingMode: "DYNAMIC_USD", isActive: true, costUsd: { not: null } },
    });

    let updated = 0;
    for (const variant of dynamicVariants) {
      const priceRial = await computeVariantPriceRialSafe(tx, variant, roundedRate);
      if (priceRial == null) continue;
      await tx.productVariant.update({
        where: { id: variant.id },
        data: {
          priceRial,
          basePriceRial: priceRial,
          lastPricedAt: now,
        },
      });
      updated += 1;
    }

    return { roundedRate, displayRate, updated };
  });

  return { buyPrice, ...result };
}

async function computeVariantPriceRialSafe(tx, variant, roundedRate) {
  const usd = Number(variant.costUsd);
  if (!Number.isFinite(usd) || usd <= 0 || roundedRate <= 0) return null;

  const targetToman = computeTargetPriceToman(usd, roundedRate);

  let finalToman = targetToman;
  if (variant.profitMode === "PERCENT" && variant.profitValue != null) {
    finalToman *= 1 + Number(variant.profitValue) / 100;
  } else if (variant.profitMode === "FIXED" && variant.profitValue != null) {
    finalToman += Number(variant.profitValue);
  }

  const prettyToman = prettyRound(finalToman);
  return tomanToRial(prettyToman);
}

module.exports = {
  fetchUsdtBuyPrice,
  updateRates,
  TICKER_URL,
};