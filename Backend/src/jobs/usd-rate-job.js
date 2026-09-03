// Backend/src/jobs/usd-rate-job.js
// دریافت خودکار نرخ تتر هر ۱۵ دقیقه و محاسبه قیمت‌ها بر اساس فرمول اختصاصی
"use strict";

const prisma = require("../lib/prisma");

const ABANTETHER_API = "https://api.abantether.com/api/v1/manager/otc/ticker";
const NOBITEX_FALLBACK_API = "https://api.nobitex.ir/market/stats?srcCurrency=usdt&dstCurrency=rls";
const INTERVAL_MS = 15 * 60 * 1000; // هر ۱۵ دقیقه

// ───────────────────────────────────────────
// توابع فرمول اختصاصی
// ───────────────────────────────────────────

/**
 * ۱. قیمت دیسپلی (نمایشی): کمی پایین‌تر از قیمت واقعی و رند شده
 * مثلاً ۲۱۸,۳۵۰ تومان → ۲۱۷,۱۰۰ تومان
 */
function calcDisplayPrice(rawBuy) {
  return Math.floor((rawBuy * 0.994) / 100) * 100;
}

/**
 * ۲. قیمت محاسباتی: گرد شده به بالا با تقریب ۲ درصد
 * مثلاً ۲۱۸,۳۰۰ × ۱.۰۲ = ۲۲۲,۶۶۶ → ۲۲۳,۰۰۰ تومان
 */
function calcRoundedRate(rawBuy) {
  const withMarkup = rawBuy * 1.02;
  return Math.ceil(withMarkup / 1000) * 1000;
}

/**
 * ۳. قیمت دلاری جدید = دلار پایه محصول + 0.6
 * قیمت ضرب‌شده = (dollarUsd + 0.6) × roundedRate
 */
function calcBaseToman(dollarUsd, roundedRate) {
  const adjustedUsd = dollarUsd + 0.6;
  return adjustedUsd * roundedRate;
}

/**
 * ۴. مالیات ۵٪ + کارمزد ۱٪ (سقف ۳۰,۰۰۰ تومان) = قیمت تمام شده برای ما
 */
function applyTaxAndFee(baseToman) {
  const withTax = baseToman * 1.05; // به علاوه ۵ درصد مالیات
  const fee = Math.min(withTax * 0.01, 30000); // ۱ درصد تا سقف ۳۰ هزار تومان
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
 * ۶. تمیز و رند کردن قیمت نهایی به نزدیک‌ترین ۱۰۰۰ تومان
 */
function roundFinalToman(toman) {
  return Math.round(toman / 1000) * 1000;
}

// ───────────────────────────────────────────
// متدهای ارتباطی و دریافت نرخ تتر
// ───────────────────────────────────────────

function parseAbantetherResponse(data) {
  if (!data) return 0;
  if (data.USDT?.buy_price) return parseFloat(data.USDT.buy_price);
  if (data.USDT?.price) return parseFloat(data.USDT.price);
  if (data.data?.USDT?.buy_price) return parseFloat(data.data.USDT.buy_price);
  if (data.data?.USDT?.price) return parseFloat(data.data.USDT.price);
  if (Array.isArray(data)) {
    const item = data.find((x) => x.symbol === "USDT" || x.pair === "USDT_IRT");
    if (item?.buy_price) return parseFloat(item.buy_price);
  }
  if (data.buy_price) return parseFloat(data.buy_price);
  return 0;
}

async function fetchUsdtRate() {
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json",
  };

  // تلاش اول: آبان‌تتر
  try {
    const res = await fetch(ABANTETHER_API, {
      headers,
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const data = await res.json();
      const price = parseAbantetherResponse(data);
      if (price && price > 10000) return price;
    }
  } catch (err) {
    console.warn("[usd-rate-job] خطا در اتصال به آبان‌تتر، سوئیچ به سرور پشتیبان...");
  }

  // تلاش دوم (پشتیبان): نوبیتکس
  try {
    const res = await fetch(NOBITEX_FALLBACK_API, {
      headers,
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const data = await res.json();
      const latestRial = parseFloat(data?.stats?.["usdt-rls"]?.latest || 0);
      if (latestRial && latestRial > 100000) {
        return Math.round(latestRial / 10); // تبدیل ریال به تومان
      }
    }
  } catch (err) {
    console.error("[usd-rate-job] خطا در وب‌سرویس پشتیبان:", err.message);
  }

  return 0;
}

// ───────────────────────────────────────────
// حلقه اصلی بروزرسانی نرخ و دیتابیس
// ───────────────────────────────────────────
async function fetchAndUpdatePrices() {
  try {
    const rawBuy = await fetchUsdtRate();
    if (!rawBuy || rawBuy < 10000) {
      console.warn("[usd-rate-job] نرخ معتبری دریافت نشد. آخرین نرخ دیتابیس حفظ می‌شود.");
      return;
    }

    const displayPrice = calcDisplayPrice(rawBuy);
    const roundedRate = calcRoundedRate(rawBuy);

    // ثبت در جدول تاریخچه نرخ دلار
    await prisma.usdRate.create({
      data: {
        buyPrice: rawBuy,
        displayPrice,
        roundedRate,
      },
    });

    // بازیابی تمام واریانت‌های فعال
    const variants = await prisma.productVariant.findMany({
      where: { isActive: true },
      include: { priceConfig: true },
    });

    let updatedCount = 0;

    for (const variant of variants) {
      let cfg = variant.priceConfig;

      // اگر کانفیگ نداشت، خودکار یک رکورد برای مدیریت در پریسمای استودیو بساز
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

      // اگر تیک فرمول برداشته شده، قیمت ثابت درج می‌شود
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

      // محاسبه با فرمول دلاری
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

    console.log(`[usd-rate-job] ✅ نرخ لحظه‌ای: ${rawBuy.toLocaleString("fa-IR")} ت | نمایش: ${displayPrice.toLocaleString("fa-IR")} ت | نرخ محاسباتی: ${roundedRate.toLocaleString("fa-IR")} ت | بروزرسانی ${updatedCount} محصول`);
  } catch (err) {
    console.error("[usd-rate-job] ❌ خطا در اجرای کرون جاب:", err.message);
  }
}

// اجرای اولیه هنگام روشن شدن سرور و سپس تکرار هر ۱۵ دقیقه
fetchAndUpdatePrices();
const timer = setInterval(fetchAndUpdatePrices, INTERVAL_MS);

module.exports = { fetchAndUpdatePrices, stop: () => clearInterval(timer) };D