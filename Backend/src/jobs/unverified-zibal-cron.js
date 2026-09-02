// Backend/src/jobs/unverified-zibal-cron.js
// بازیابی پرداخت‌های زیبال که کال‌بک به سمت ما نیامده اما کاربر پرداخت کرده.
// هر ۵ دقیقه: تراکنش‌های PENDING با درگاه زیبال را استعلام می‌کنیم و در صورت پرداخت،
// وریفای و تکمیل می‌کنیم تا هیچ سفارش پرداخت‌شده‌ای بدون تحویل نماند.

const cron = require("node-cron");
const prisma = require("../lib/prisma");
const zibal = require("../services/zibal.service");
const { writeAuditLog } = require("../lib/audit");

async function fulfillFromInquiry({ payment, order, verifyResult }) {
  const { fulfillOrder } = require("./fulfill-helper");

  return fulfillOrder({
    order,
    payment,
    verifyResult,
    req: null,
  });
}

async function runZibalRecovery() {
  try {
    // فقط تراکنش‌های زیبال و PENDING که قدیمی هستند (بیشتر از ۳ دقیقه از ساخت‌شان گذشته)
    const cutoff = new Date(Date.now() - 3 * 60 * 1000);
    const pendingPayments = await prisma.payment.findMany({
      where: {
        status: "PENDING",
        gateway: "ZIBAL",
        createdAt: { lt: cutoff },
      },
      include: { order: { include: { items: true } } },
      take: 20,
    });

    for (const payment of pendingPayments) {
      if (payment.gatewayTrackId == null) continue;

      const inquiry = await zibal.inquiryPayment({ trackId: payment.gatewayTrackId });

      if (!inquiry.success) continue; // شاید موقتاً خطا داشته باشد؛ تلاش بعدی

      // وضعیت 1 یا 2 = پرداخت انجام شده
      if (inquiry.status === 1 || inquiry.status === 2) {
        const verify = await zibal.verifyPayment({ trackId: payment.gatewayTrackId });
        if (!verify.success) {
          await writeAuditLog({
            orderId: payment.orderId,
            entityType: "payment",
            entityId: payment.id,
            action: "cron_zibal_verify_failed",
            actorType: "SYSTEM",
            metadata: { errorCode: verify.errorCode },
          });
          continue;
        }

        // مبلغ استعلام باید با مبلغ سفارش برابری کند
        const expected = Number(BigInt(payment.amountRial));
        if (inquiry.amount != null && Number(inquiry.amount) !== expected) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: "FAILED", gatewayErrorCode: "AMOUNT_MISMATCH" },
          });
          continue;
        }

        const fulfillmentResult = await fulfillFromInquiry({
          payment,
          order: payment.order,
          verifyResult: verify,
        });
        if (fulfillmentResult.success) {
          console.log(
            `[unverified-zibal-cron] سفارش ${payment.order.orderNumber} پس از بازیابی تکمیل شد (refId=${verify.refId})`,
          );
        } else {
          console.error(
            `[unverified-zibal-cron] تکمیل سفارش ${payment.order.orderNumber} ناموفق: ${fulfillmentResult.reason}`,
          );
        }
      } else if (inquiry.status === 3) {
        // کاربر لغو کرده
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: "FAILED", gatewayErrorCode: "CANCELLED_BY_USER" },
        });
      }
    }
  } catch (err) {
    console.error("[unverified-zibal-cron] خطا:", err.message);
  }
}

function startZibalCron() {
  cron.schedule("*/5 * * * *", runZibalRecovery);
  console.log("[unverified-zibal-cron] بازیابی پرداخت‌های زیبال هر ۵ دقیقه آغاز شد.");
}

module.exports = { startZibalCron, runZibalRecovery };