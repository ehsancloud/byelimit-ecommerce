// Backend/src/jobs/usd-rate-job.js
"use strict";

const prisma = require("../lib/prisma");

const INTERVAL_MS = 15 * 60 * 1000; // هر ۱۵ دقیقه

let cachedDisplayPrice = null;
let cachedRoundedRate = null;

// ───────────────────────────────────────────
// توابع فرمول قیمت‌گذاری بای‌لیمیت
// ───────────────────────────────────────────

function calcDisplayPrice(rawBuy) {
  return Math.round((rawBuy * 0.9942) / 100) * 100;
}

function calcRoundedRate(rawBuy) {
  const withMarkup = rawBuy * 1.02;
  return Math.ceil(withMarkup / 1000) * 1000;
}

function calcBaseToman(dollarUsd, roundedRate) {
  return (dollarUsd + 0.6) * roundedRate;
}

function applyTaxAndFee(baseToman) {
  const withTax = baseToman * 1.05;
  const fee = Math.min(withTax * 0.01, 30000);
  return withTax + fee;
}

function applyProfit(costToman, config) {
  if (!config) return costToman * 1.10;
  if (config.profitType === "PERCENT") {
    const percent = typeof config.profitPercent === "number" ? config.profitPercent : 10;
    return costToman * (1 + percent / 100);
  }
  if (config.profitType === "FIXED_RIAL" && config.profitFixedRial) {
    return costToman + Number(config.profitFixedRial) / 10;
  }
  return costToman;
}

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

// ───────────────────────────────────────────
// زنجیره استعلام ۴ گانه صرافی‌های داخلی
// ───────────────────────────────────────────

const REQUEST_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
};

async function fetchUsdtRate() {
  // منبع ۱: آبان‌تتر
  try {
    const res = await fetch("https://api.abantether.com/api/v1/manager/otc/ticker", {
      headers: REQUEST_HEADERS,
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const data = await res.json();
      const usdt = data?.USDTIRT || data?.data?.USDTIRT || data?.USDT || data?.data?.USDT;
      const price = parseFloat(usdt?.buy_price || data?.buy_price || 0);
      if (price > 10000) {
        return price > 1000000 ? Math.round(price / 10) : Math.round(price);
      }
    }
  } catch {}

  // منبع ۲: والکس (بدون مسدودی روی سرورهای خارجی)
  try {
    const res = await fetch("https://api.wallex.ir/v1/markets", {
      headers: REQUEST_HEADERS,
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const data = await res.json();
      const price = parseFloat(data?.result?.symbols?.USDTTMN?.stats?.lastPrice || 0);
      if (price > 10000) return Math.round(price);
    }
  } catch {}

  // منبع ۳: نوبیتکس
  try {
    const res = await fetch("https://api.nobitex.ir/v2/orderbook/USDTIRT", {
      headers: REQUEST_HEADERS,
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const data = await res.json();
      const priceRial = parseFloat(data?.lastTradePrice || 0);
      if (priceRial > 100000) return Math.round(priceRial / 10);
    }
  } catch {}

  // منبع ۴: تترلند
  try {
    const res = await fetch("https://api.tetherland.com/currencies", {
      headers: REQUEST_HEADERS,
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const data = await res.json();
      const price = parseFloat(data?.data?.currencies?.USDT?.price || 0);
      if (price > 10000) return Math.round(price);
    }
  } catch {}

  return 0;
}

// ───────────────────────────────────────────
// چرخه بروزرسانی
// ───────────────────────────────────────────

async function fetchAndUpdatePrices() {
  try {
    const rawBuy = await fetchUsdtRate();

    if (!rawBuy || rawBuy < 10000) {
      console.warn("[usd-rate-job] ⚠️ وب‌سرویس‌ها موقتاً پاسخ ندادند؛ آخرین نرخ معتبر حفظ شد.");
      return;
    }

    const displayPrice = calcDisplayPrice(rawBuy);
    const roundedRate = calcRoundedRate(rawBuy);

    cachedDisplayPrice = displayPrice;
    cachedRoundedRate = roundedRate;

    const lastDbRate = await prisma.usdRate.findFirst({
      orderBy: { fetchedAt: "desc" },
    });

    // ثبت در دیتابیس تنها در صورت تغییر نرخ یا گذشت بیش از ۴ ساعت
    const isPriceChanged = !lastDbRate || lastDbRate.buyPrice !== rawBuy;
    const isStale = lastDbRate && (Date.now() - new Date(lastDbRate.fetchedAt).getTime() > 4 * 3600 * 1000);

    if (isPriceChanged || isStale) {
      await prisma.usdRate.create({
        data: {
          buyPrice: rawBuy,
          displayPrice,
          roundedRate,
        },
      });
    }

    const variants = await prisma.productVariant.findMany({
      where: { isActive: true },
      include: { priceConfig: true },
    });

    let updatedCount = 0;

    for (const variant of variants) {
      let cfg = variant.priceConfig;
      if (!cfg) {
        cfg = await prisma.productPriceConfig.create({
          data: {
            variantId: variant.id,
            useUsdFormula: true,
            profitType: "PERCENT",
            profitPercent: 10,
          },
        });
      }

      if (!cfg.useUsdFormula) {
        if (cfg.fixedPriceRial) {
          await prisma.productVariant.update({
            where: { id: variant.id },
            data: { priceRial: cfg.fixedPriceRial },
          });
          updatedCount++;
        }
        continue;
      }

      const dollarUsd = Number(variant.costUsd || 0);
      if (!dollarUsd) continue;

      const baseToman = calcBaseToman(dollarUsd, roundedRate);
      const costToman = applyTaxAndFee(baseToman);
      const withProfitToman = applyProfit(costToman, cfg);
      const finalToman = roundToBeauty(withProfitToman);
      const finalRial = BigInt(Math.round(finalToman * 10));

      await prisma.productVariant.update({
        where: { id: variant.id },
        data: { priceRial: finalRial },
      });
      updatedCount++;
    }

    console.log(`[usd-rate-job] ✅ تتر لحظه‌ای: ${rawBuy.toLocaleString("fa-IR")} ت | نمایش هدر: ${displayPrice.toLocaleString("fa-IR")} ت | بروزرسانی ${updatedCount} پلن`);
  } catch (err) {
    console.error("[usd-rate-job] ❌ خطا در جاب نرخ دلار:", err.message);
  }
}

async function initMemoryCache() {
  try {
    const lastDbRate = await prisma.usdRate.findFirst({
      orderBy: { fetchedAt: "desc" },
    });
    if (lastDbRate) {
      cachedDisplayPrice = lastDbRate.displayPrice;
      cachedRoundedRate = lastDbRate.roundedRate;
    }
  } catch {}
  fetchAndUpdatePrices();
}

initMemoryCache();
const timer = setInterval(fetchAndUpdatePrices, INTERVAL_MS);

module.exports = {
  fetchAndUpdatePrices,
  getLatestDisplayPrice: () => cachedDisplayPrice,
  getLatestRoundedRate: () => cachedRoundedRate,
  stop: () => clearInterval(timer),
};