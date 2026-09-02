// src/jobs/usd-rate-job.js
// هر ۱۵ دقیقه یکبار قیمت تتر را از AbanTether دریافت کرده،
// قیمت ریالی همه واریانت‌های دارای فرمول دلاری را بروز می‌کند.
"use strict";
const prisma = require("../lib/prisma");

const USDT_API = "https://api.abantether.com/api/v1/manager/otc/ticker";
// 15 دقیقه
const INTERVAL_MS = 15 * 60 * 1000;

// ───────────────────────────────────────────
// توابع کمکی قیمت‌گذاری
// ───────────────────────────────────────────

/** قیمت دیسپلی: کمی پایین‌تر از قیمت واقعی، گرد شده */
function calcDisplayPrice(rawBuy) {
  return Math.floor((rawBuy * 0.994) / 100) * 100;
}

/** قیمت محاسباتی: 2٪ بالاتر و گرد شده به بالا */
function calcRoundedRate(rawBuy) {
  const withMarkup = rawBuy * 1.02;
  // گرد کردن به نزدیک‌ترین عدد تمیز (هزار)
  return Math.ceil(withMarkup / 1000) * 1000;
}

/** قیمت پایه = (dollarUsd + 0.6) × roundedRate */
function calcBaseToman(dollarUsd, roundedRate) {
  return (dollarUsd + 0.6) * roundedRate;
}

/** مالیات ۵٪ + کارمزد ۱٪ (سقف ۳۰۰۰۰ تومان) */
function applyTaxAndFee(baseToman) {
  const withTax  = baseToman * 1.05;
  const fee      = Math.min(withTax * 0.01, 30000); // سقف 30K تومان
  return withTax + fee;
}

/** گرد کردن قیمت نمایشی: آخرین رقم ۵ یا ۹ (در محدوده هزار) */
function roundToBeauty(toman) {
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

/** اعمال سود از ProductPriceConfig */
function applyProfit(toman, config) {
  if (!config) return toman;
  if (config.profitType === "PERCENT") {
    return toman * (1 + (config.profitPercent || 10) / 100);
  }
  if (config.profitType === "FIXED_RIAL" && config.profitFixedRial) {
    return toman + Number(config.profitFixedRial) / 10;
  }
  return toman;
}

// ───────────────────────────────────────────
// اصلی: دریافت نرخ و بروزرسانی قیمت‌ها
// ───────────────────────────────────────────
async function fetchAndUpdatePrices() {
  try {
    const res  = await fetch(USDT_API, { signal: AbortSignal.timeout(10000) });
    const data = await res.json();

    // استخراج قیمت خرید USDT
    const rawBuy = parseFloat(data?.USDT?.buy_price || data?.buy_price || 0);
    if (!rawBuy || rawBuy < 10000) {
      console.warn("[usd-rate-job] قیمت دریافتی نامعتبر:", rawBuy);
      return;
    }

    const displayPrice = calcDisplayPrice(rawBuy);
    const roundedRate  = calcRoundedRate(rawBuy);

    // ذخیره نرخ در دیتابیس
    await prisma.usdRate.create({
      data: {
        buyPrice:     rawBuy,
        displayPrice,
        roundedRate,
      },
    });

    // بروزرسانی قیمت واریانت‌های دارای فرمول دلاری
    const configs = await prisma.productPriceConfig.findMany({
      where:   { useUsdFormula: true },
      include: { variant: true },
    });

    for (const cfg of configs) {
      const dollarUsd  = Number(cfg.variant.costUsd || 0);
      if (!dollarUsd) continue;

      const baseToman  = calcBaseToman(dollarUsd, roundedRate);
      const afterFees  = applyTaxAndFee(baseToman);
      const afterProfit = applyProfit(afterFees, cfg);
      const finalToman = roundToBeauty(afterProfit);
      const finalRial  = BigInt(Math.round(finalToman * 10));

      await prisma.productVariant.update({
        where: { id: cfg.variantId },
        data:  { priceRial: finalRial },
      });
    }

    console.log(`[usd-rate-job] ✅ نرخ ${rawBuy.toLocaleString()} → نمایش: ${displayPrice.toLocaleString()} | محاسبه: ${roundedRate.toLocaleString()} | ${configs.length} واریانت بروز شد`);
  } catch (err) {
    console.error("[usd-rate-job] ❌ خطا:", err.message);
  }
}

// اجرای اولیه و سپس هر ۱۵ دقیقه
fetchAndUpdatePrices();
const timer = setInterval(fetchAndUpdatePrices, INTERVAL_MS);

module.exports = { fetchAndUpdatePrices, stop: () => clearInterval(timer) };
