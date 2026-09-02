// Backend/src/jobs/fulfill-helper.js
// منطق مشترک تکمیل سفارش پس از تایید پرداخت (زرین‌پال و زیبال).
// در یک تراکنش: تخصیص اکانت، وریفای پرداخت، PAID کردن سفارش، اعلان تلگرام.

const prisma = require("../lib/prisma");
const { writeAuditLog } = require("../lib/audit");
const { rialToToman } = require("../lib/pricing");

/**
 * تکمیل سفارش پس از تایید موفق پرداخت.
 *
 * @param {Object} params
 * @param {Object} params.order - سفارش با items
 * @param {Object} params.payment - رکورد پرداخت
 * @param {Object} params.verifyResult - نتیجه وریفای درگاه (refId, cardPan, fee)
 * @param {Object} [params.req] - درخواست (برای audit)
 * @param {Object} [params.tx] - تراکنش پریسما (اختیاری؛ اگر داده نشود خودش می‌سازد)
 */
async function fulfillOrder({ order, payment, verifyResult, req, tx }) {
  const run = async (client) => {
    for (const item of order.items) {
      const rows = await client.$queryRaw`
        SELECT id FROM account_inventory
        WHERE variant_id = ${item.variantId}::uuid AND status = 'AVAILABLE'
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      `;

      if (!rows || rows.length === 0) {
        throw new Error(`NO_INVENTORY:${item.variantId}`);
      }

      const accountId = rows[0].id;

      await client.accountInventory.update({
        where: { id: accountId },
        data: { status: "SOLD", reservedForOrderId: order.id, soldAt: new Date() },
      });
      await client.orderItem.update({
        where: { id: item.id },
        data: { assignedAccountId: accountId },
      });
    }

    await client.payment.update({
      where: { id: payment.id },
      data: {
        status: "VERIFIED",
        // اگر درگاه (مثل زیبال در حالت already-verified) refId نداد، از authority استفاده می‌کنیم
        refId: verifyResult.refId != null ? String(verifyResult.refId) : payment.authority,
        cardPanMasked: verifyResult.cardPan || null,
        feeRial: verifyResult.fee ? BigInt(verifyResult.fee) * 10n : null,
        verifiedAt: new Date(),
      },
    });

    await client.order.update({ where: { id: order.id }, data: { status: "PAID" } });

    await client.telegramNotification.create({
      data: {
        orderId: order.id,
        payload: {
          orderNumber: order.orderNumber,
          mobile: order.mobile,
          telegramId: order.telegramId,
          totalToman: rialToToman(order.totalRial),
          items: order.items.map((it) => ({
            title: it.productTitleSnapshot,
            variant: it.variantNameSnapshot,
            quantity: it.quantity,
          })),
        },
      },
    });
  };

  try {
    if (tx) {
      await run(tx);
    } else {
      await prisma.$transaction(run);
    }

    await writeAuditLog({
      orderId: order.id,
      entityType: "order",
      entityId: order.id,
      action: "payment_verified_and_fulfilled",
      previousStatus: "PENDING_PAYMENT",
      newStatus: "PAID",
      actorType: "SYSTEM",
      ipAddress: req?.ip,
      metadata: { refId: verifyResult.refId },
    });

    return { success: true };
  } catch (err) {
    if (String(err.message).startsWith("NO_INVENTORY")) {
      return { success: false, reason: "NO_INVENTORY" };
    }
    console.error("FULFILL ORDER ERROR:", err);
    return { success: false, reason: "UNKNOWN", error: err };
  }
}

module.exports = { fulfillOrder };