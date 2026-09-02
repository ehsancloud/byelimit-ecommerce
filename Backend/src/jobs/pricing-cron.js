// Backend/src/jobs/pricing-cron.js
// به‌روزرسانی نرخ تتر و قیمت‌های پویا هر ۱۵ دقیقه

const cron = require("node-cron");
const { updateRates } = require("../lib/exchangeRate");

let running = false;

async function runPricingUpdate() {
  if (running) return; // جلوگیری از هم‌پوشانی اجراها
  running = true;
  try {
    const result = await updateRates();
    console.log(
      `[pricing-cron] نرخ تتر به‌روز شد: خام=${result.buyPrice} گردشده=${result.roundedRate} نمایش=${result.displayRate} محصولات=${result.updated}`,
    );
  } catch (err) {
    console.error("[pricing-cron] خطا در به‌روزرسانی نرخ:", err.message);
  } finally {
    running = false;
  }
}

function startPricingCron() {
  // هر ۱۵ دقیقه
  cron.schedule("*/15 * * * *", runPricingUpdate);
  console.log("[pricing-cron] زمان‌بندی به‌روزرسانی نرخ هر ۱۵ دقیقه آغاز شد.");

  // یک اجرای اولیه هنگام بالا آمدن سرور
  setTimeout(runPricingUpdate, 5_000);
}

module.exports = { startPricingCron, runPricingUpdate };