// Backend/src/jobs/usd-rate-job.js
"use strict";

const prisma = require("../lib/prisma");

const ABANTETHER_API = "https://api.abantether.com/api/v1/manager/otc/ticker";
const NOBITEX_FALLBACK_API = "https://api.nobitex.ir/market/stats?srcCurrency=usdt&dstCurrency=rls";
const INTERVAL_MS = 15 * 60 * 1000; // هر ۱۵ دقیقه یک‌بار

// کش رم جهت پاسخ‌دهی زیر ۱ میلی‌ثانیه به فرانت‌اند بدون نیاز به لودینگ
let cachedDisplayPrice = null;
let cachedRoundedRate = null;

// ───────────────────────────────────────────
// فرمول محاسباتی اختصاصی بای لیمیت
// ───────────────────────────────────────────

/**
 * ۱. قیمت نمایشی در باکس هدر: کمی پایین‌تر و تمیز شده
 * مثلاً ۲۱۸,۳۵۰ تومان → ۲۱۷,۱۰۰ تومان
 */
function calcDisplayPrice(rawBuy) {
  return Math.round((rawBuy * 0.9942) / 100) * 100;
}

/**
 * ۲. قیمت محاسباتی: ۲٪ بالاتر و گرد شده به سمت بالا به نزدیک‌ترین ۱,۰۰۰ تومان
 * مثلاً ۲۱۸,۳۰۰ × ۱.۰۲ = ۲۲۲,۶۶۶ → ۲۲۳,۰۰۰ تومان
 */
function calcRoundedRate(rawBuy) {
  const withMarkup = rawBuy * 1.02;
  return Math.ceil(withMarkup / 1000) * 1000;
}

/**
 * ۳. قیمت دلاری جدید = قیمت دلاری + 0.6
 * قیمت پایه = (dollarUsd + 0.6) × roundedRate
 */
function calcBaseToman(dollarUsd, roundedRate) {
  const adjustedUsd = dollarUsd + 0.6;
  return adjustedUsd * roundedRate;
}

/**
 * ۴. مالیات ۵٪ + کارمزد ۱٪ (تا سقف ۳۰,۰۰۰ تومان)
 * قیمت تمام شده برای ما = قیمت پایه + ۵٪ مالیات + کارمزد
 */
function applyTaxAndFee(baseToman) {
  const withTax = baseToman * 1.05;
  const fee = Math.min(withTax * 0.01, 30000);
  return withTax + fee;
}

/**
 * ۵. اعمال حاشیه سود اختصاصی از جدول ProductPriceConfig
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
 * ۶. گرد کردن قیمت نهایی به نزدیک‌ترین ۱,۰۰۰ تومان
 */
function roundFinalToman(toman) {
  return Math.round(toman / 1000) * 1000;
}

// ───────────────────────────────────────────
// دریافت نرخ تتر از وب‌سرویس آبان‌تتر
// ───────────────────────────────────────────

async function fetchUsdtRate() {
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json",
  };

  // ۱. وب‌سرویس رسمی آبان‌تتر
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
        // اگر عدد به ریال بود، به تومان تبدیل کن
        return rawPrice > 1000000 ? Math.round(rawPrice / 10) : Math.round(rawPrice);
      }
    }
  } catch (err) {
    console.warn("[usd-rate-job] وب‌سرویس آبان‌تتر در دسترس نیست، استفاده از نوبیتکس...");
  }

  // ۲. سرور پشتیبان نوبیتکس در صورت تایم‌اوت آبان‌تتر
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
// چرخه اصلی بروزرسانی نرخ و دیتابیس
// ───────────────────────────────────────────

async function fetchAndUpdatePrices() {
  try {
    let rawBuy = await fetchUsdtRate();

    // در صورت قطعی هر دو وب‌سرویس، از آخرین نرخ ثبت‌شده در دیتابیس استفاده کن
    if (!rawBuy || rawBuy < 10000) {
      const lastDbRate = await prisma.usdRate.findFirst({
        orderBy: { fetchedAt: "desc" },
      });
      if (lastDbRate) {
        rawBuy = lastDbRate.buyPrice;
      } else {
        rawBuy = 218300; // نرخ پایه مطمئن
      }
    }

    const displayPrice = calcDisplayPrice(rawBuy);
    const roundedRate = calcRoundedRate(rawBuy);

    // ذخیره در رم برای پاسخ‌دهی فوق‌سریع
    cachedDisplayPrice = displayPrice;
    cachedRoundedRate = roundedRate;

    // ثبت در تاریخچه نرخ‌های دیتابیس
    await prisma.usdRate.create({
      data: {
        buyPrice: rawBuy,
        displayPrice,
        roundedRate,
      },
    });

    // بروزرسانی تمام واریانت‌های فعال
    const variants = await prisma.productVariant.findMany({
      where: { isActive: true },
      include: { priceConfig: true },
    });

    let updatedCount = 0;

    for (const variant of variants) {
      let cfg = variant.priceConfig;

      // ساخت خودکار کانفیگ قیمت در صورت عدم وجود برای مدیریت از پریسمای استودیو
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

      // در صورت غیرفعال بودن تیک فرمول دلاری، قیمت ثابت درج می‌شود
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

      // محاسبه قیمت نهایی با فرمول دلاری
      const dollarUsd = Number(variant.costUsd || 0);
      if (!dollarUsd) continue;

      const baseToman = calcBaseToman(dollarUsd, roundedRate);
      const costToman = applyTaxAndFee(baseToman);
      const withProfitToman = applyProfit(costToman, cfg);
      const finalToman = roundFinalToman(withProfitToman);
      const finalRial = BigInt(Math.round(finalToman * 10));

      await prisma.productVariant.update({
        where: { id: variant.id },
        data: { priceRial: finalRial },
      });
      updatedCount++;
    }

    console.log(`[usd-rate-job] ✅ تتر لحظه‌ای: ${rawBuy.toLocaleString("fa-IR")} ت | نمایش هدر: ${displayPrice.toLocaleString("fa-IR")} ت | محاسباتی: ${roundedRate.toLocaleString("fa-IR")} ت | ${updatedCount} محصول بروز شد`);
  } catch (err) {
    console.error("[usd-rate-job] ❌ خطا در اجرای جاب قیمت:", err.message);
  }
}

// پیش‌بارگذاری سریع از دیتابیس در لحظه استارت سرور
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