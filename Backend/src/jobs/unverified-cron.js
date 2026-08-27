// src/jobs/unverified-cron.js
const cron = require("node-cron");
const prisma = require("../lib/prisma");
const zarinpal = require("../services/zarinpal.service");
const { writeAuditLog } = require("../lib/audit");
const { rialToToman } = require("../lib/pricing");

/**
 * طبق چک‌لیست: «کاربر پول داده اما کال‌بک به سرور نرسیده» - این حالت وقتی اتفاق
 * می‌افتد که مرورگر کاربر بعد از پرداخت موفق در درگاه، به هر دلیلی (قطعی اینترنت،
 * بستن تب) هرگز به callback_url ما برنگردد. زرین‌پال چنین تراکنش‌هایی را در متد
 * unVerified نگه می‌دارد تا ما بعداً وریفای‌شان کنیم.
 *
 * این جاب هر ۵ دقیقه اجرا می‌شود:
 * ۱. لیست Authority های Verify‌نشده را از زرین‌پال می‌گیرد.
 * ۲. برای هرکدام که در دیتابیس ما با وضعیت PENDING مانده، آن را VERIFY می‌کند.
 * ۳. در صورت موفقیت، همان مسیر تخصیص موجودی/تحویل که در callback هست باید صدا زده شود
 *    (اینجا به‌صورت import مستقیم از تابع fulfillOrder در payment.routes صدا زده نمی‌شود
 *    تا وابستگی چرخه‌ای پیش نیاید - در پروژه واقعی این منطق مشترک به یک service جدا
 *    مثل payment.service.js منتقل شود).
 */
async function reconcileUnverifiedTransactions() {
  const { success, authorities } = await zarinpal.listUnverifiedTransactions();
  if (!success || authorities.length === 0) return;

  for (const auth of authorities) {
    const payment = await prisma.payment.findUnique({
      where: { authority: auth.authority },
    });

    // این Authority مال ما نیست یا از قبل پردازش شده - رد شو
    if (!payment || payment.status !== "PENDING") continue;

    const order = await prisma.order.findUnique({
      where: { id: payment.orderId },
      include: { items: true },
    });
    if (!order) continue;

    const amountToman = rialToToman(payment.amountRial);
    const verifyResult = await zarinpal.verifyPayment({ amountToman, authority: auth.authority });

    if (verifyResult.success) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "UNVERIFIED_PENDING", // علامت‌گذاری برای پیگیری دستی سریع تحویل توسط ادمین
          refId: String(verifyResult.refId),
        },
      });
      await writeAuditLog({
        orderId: order.id,
        entityType: "payment",
        entityId: payment.id,
        action: "unverified_cron_recovered_payment",
        newStatus: "UNVERIFIED_PENDING",
        actorType: "SYSTEM",
        metadata: { refId: verifyResult.refId },
      });
      // TODO: اینجا باید همان منطق fulfillOrder (تخصیص موجودی + صف تلگرام) صدا زده شود
      // و پیامک/اعلان فوری به ادمین ارسال شود که یک پرداخت گمشده بازیابی شد.
      console.warn(
        `[unVerified cron] پرداخت گمشده بازیابی شد: سفارش ${order.orderNumber} - نیازمند تحویل دستی/خودکار.`,
      );
    }
  }
}

function startUnverifiedCron() {
  // هر ۵ دقیقه یک‌بار
  cron.schedule("*/5 * * * *", () => {
    reconcileUnverifiedTransactions().catch((err) => {
      console.error("[unVerified cron] خطا:", err);
    });
  });
  console.log("✅ کران‌جاب unVerified transactions فعال شد (هر ۵ دقیقه).");
}

module.exports = { startUnverifiedCron, reconcileUnverifiedTransactions };
