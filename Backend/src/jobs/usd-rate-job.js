// Backend/src/jobs/usd-rate-job.js
"use strict";

const prisma = require("../lib/prisma");

const ABANTETHER_API = "https://api.abantether.com/api/v1/manager/otc/ticker";
const NOBITEX_FALLBACK_API = "https://api.nobitex.ir/market/stats?srcCurrency=usdt&dstCurrency=rls";
const INTERVAL_MS = 15 * 60 * 1000; // بروزرسانی هر ۱۵ دقیقه

let cachedDisplayPrice = null;
let cachedRoundedRate = null;

// ───────────────────────────────────────────
// فرمول محاسباتی اختصاصی بای لیمیت
// ───────────────────────────────────────────

/**
 * ۱. نرخ نمایشی در هدر: کمی پایین‌تر و تمیز شده
 */
function calcDisplayPrice(rawBuy) {
  return Math.round((rawBuy * 0.9942) / 100) * 100;
}

/**
 * ۲. نرخ محاسباتی: ۲٪ بالاتر و گرد شده به سمت بالا به نزدیک‌ترین ۱,۰۰۰ تومان
 */
function calcRoundedRate(rawBuy) {
  const withMarkup = rawBuy * 1.02;
  return Math.ceil(withMarkup / 1000) * 1000;
}

/**
 * ۳. قیمت دلاری جدید = دلار محصول + 0.6
 * قیمت اولیه = (dollarUsd + 0.6) × roundedRate
 */
function calcBaseToman(dollarUsd, roundedRate) {
  const adjustedUsd = dollarUsd + 0.6;
  return adjustedUsd * roundedRate;
}

/**
 * ۴. مالیات ۵٪ + کارمزد ۱٪ (سقف ۳۰,۰۰۰ تومان)
 */
function applyTaxAndFee(baseToman) {
  const withTax = baseToman * 1.05;
  const fee = Math.min(withTax * 0.01, 30000);
  return withTax + fee;
}

/**
 * ۵. اعمال سود از جدول ProductPriceConfig
 */
function applyProfit(costToman, config) {
  if (!config) {
    return costToman * 1.10; // سود پیش‌فرض ۱۰٪
  }

  if (config.profitType === "PERCENT") {
    const percent = typeof config.profitPercent === "number" ? config.profitPercent : 10;
    return costToman * (1 + percent / 100);
  }

  if (config.profitType === "FIXED_RIAL" && config.profitFixedRial) {
    const fixedToman = Number(config.profitFixedRial) / 10;
    return costToman + fixedToman;
  }

  return costToman;
}

/**
 * ۶. گرد کردن روان‌شناختی: پایان ارقام نهایی به ۵ یا ۹ (۵,۰۰۰ یا ۹,۰۰۰ تومان)
 * مثلاً 5,412,000 -> 5,415,000 | 5,416,000 -> 5,419,000
 */
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
// دریافت نرخ تتر از آبان‌تتر
// ───────────────────────────────────────────

async function fetchUsdtRate() {
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json",
  };

  try {
    const res = await fetch(ABANTETHER_API, {
      headers,
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const data = await res.json();
      const usdtData = data?.USDTIRT || data?.data?.USDTIRT || data?.USDT || data?.data?.USDT;
      const rawPrice = parseFloat(usdtData?.buy_price || data?.buy_price || 0);

      if (rawPrice && rawPrice > 10000) {
        return rawPrice > 1000000 ? Math.round(rawPrice / 10) : Math.round(rawPrice);
      }
    }
  } catch (err) {
    console.warn("[usd-rate-job] وب‌سرویس آبان‌تتر پاسخ نداد، استفاده از نوبیتکس...");
  }

  try {
    const res = await fetch(NOBITEX_FALLBACK_API, {
      headers,
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const data = await res.json();
      const latestRial = parseFloat(data?.stats?.["usdt-rls"]?.latest || 0);
      if (latestRial && latestRial > 100000) {
        return Math.round(latestRial / 10);
      }
    }
  } catch (err) {
    console.error("[usd-rate-job] خطای وب‌سرویس پشتیبان:", err.message);
  }

  return 0;
}

// ───────────────────────────────────────────
// حلقه اصلی اجرای محاسبات و بروزرسانی دیتابیس
// ───────────────────────────────────────────

async function fetchAndUpdatePrices() {
  try {
    let rawBuy = await fetchUsdtRate();

    if (!rawBuy || rawBuy < 10000) {
      const lastDbRate = await prisma.usdRate.findFirst({
        orderBy: { fetchedAt: "desc" },
      });
      rawBuy = lastDbRate ? lastDbRate.buyPrice : 221000;
    }

    const displayPrice = calcDisplayPrice(rawBuy);
    const roundedRate = calcRoundedRate(rawBuy);

    cachedDisplayPrice = displayPrice;
    cachedRoundedRate = roundedRate;

    await prisma.usdRate.create({
      data: {
        buyPrice: rawBuy,
        displayPrice,
        roundedRate,
      },
    });

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

      // اگر فرمول غیرفعال بود، قیمت دستی درج می‌شود
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
      const finalToman = roundToBeauty(withProfitToman); // رندینگ انتهایی به ۵ یا ۹
      const finalRial = BigInt(Math.round(finalToman * 10));

      await prisma.productVariant.update({
        where: { id: variant.id },
        data: { priceRial: finalRial },
      });
      updatedCount++;
    }

    console.log(`[usd-rate-job] ✅ تتر: ${rawBuy.toLocaleString("fa-IR")} ت | نمایش هدر: ${displayPrice.toLocaleString("fa-IR")} ت | محاسباتی: ${roundedRate.toLocaleString("fa-IR")} ت | رندینگ ۵ و ۹ روی ${updatedCount} محصول`);
  } catch (err) {
    console.error("[usd-rate-job] ❌ خطا:", err.message);
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