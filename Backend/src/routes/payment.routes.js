// src/routes/payment.routes.js
const express = require("express");
const prisma = require("../lib/prisma");
const zarinpal = require("../services/zarinpal.service");
const { paymentRateLimiter } = require("../middleware/rateLimit");
const { writeAuditLog } = require("../lib/audit");
const { rialToToman } = require("../lib/pricing");

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || "https://byelimit.ir";

/**
 * مرحله ۱: ساخت Authority و هدایت کاربر به درگاه.
 */
router.post("/request", paymentRateLimiter, async (req, res) => {
  const { orderId, cardPan } = req.body || {};
  if (!orderId) return res.status(400).json({ error: "شناسه سفارش الزامی است." });

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return res.status(404).json({ error: "سفارش یافت نشد." });
  if (order.status !== "PENDING_PAYMENT") {
    return res.status(409).json({ error: "این سفارش قبلاً پردازش شده است." });
  }

  const amountToman = rialToToman(order.totalRial);

  // ✅ FIX: این URL را می‌سازیم و به requestPayment می‌دهیم تا ZarinPal بتواند
  // orderId را در بازگشت به ما برگرداند. باگ قبلی: این URL محاسبه می‌شد اما
  // به تابع requestPayment داده نمی‌شد - پس orderId هیچ‌وقت به کال‌بک نمی‌رسید
  // و همه پرداخت‌ها ناموفق می‌شدند.
  const callbackUrl = `${process.env.ZARINPAL_CALLBACK_URL}?orderId=${order.id}`;

  const result = await zarinpal.requestPayment({
    amountToman,
    description: `پرداخت سفارش ${order.orderNumber} - بای لیمیت`,
    orderId: order.id,
    mobile: order.mobile,
    cardPan: cardPan ? [cardPan] : undefined,
    callbackUrl, // ✅ پاس دادن URL کامل با orderId
  });

  if (!result.success) {
    await writeAuditLog({
      orderId: order.id,
      entityType: "payment",
      entityId: order.id,
      action: "payment_request_failed",
      actorType: "SYSTEM",
      metadata: { errorCode: result.errorCode, raw: result.raw },
    });
    return res.status(502).json({ error: result.message });
  }

  await prisma.payment.create({
    data: {
      orderId: order.id,
      authority: result.authority,
      amountRial: order.totalRial,
      status: "PENDING",
      isSandbox: zarinpal.IS_SANDBOX,
      sessionSnapshot: {
        orderId: order.id,
        mobile: order.mobile,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        requestedAt: new Date().toISOString(),
      },
    },
  });

  return res.json({ startPayUrl: result.startPayUrl });
});

/**
 * مرحله ۲: بازگشت کاربر از درگاه (Callback).
 */
router.get("/callback", async (req, res) => {
  const { Authority, Status, orderId } = req.query;

  if (!Authority || !orderId) {
    return res.redirect(`${FRONTEND_URL}/checkout/failed`);
  }

  const payment = await prisma.payment.findUnique({ where: { authority: Authority } });
  if (!payment) {
    return res.redirect(`${FRONTEND_URL}/checkout/failed`);
  }

  const snapshot = payment.sessionSnapshot || {};
  if (snapshot.orderId !== orderId || payment.orderId !== orderId) {
    await writeAuditLog({
      orderId: payment.orderId,
      entityType: "payment",
      entityId: payment.id,
      action: "session_validation_failed",
      actorType: "SYSTEM",
      ipAddress: req.ip,
      metadata: { queryOrderId: orderId, snapshotOrderId: snapshot.orderId },
    });
    return res.redirect(`${FRONTEND_URL}/checkout/failed`);
  }

  const order = await prisma.order.findUnique({
    where: { id: payment.orderId },
    include: { items: true },
  });

  if (payment.status === "VERIFIED" && order.status === "PAID") {
    return res.redirect(`${FRONTEND_URL}/checkout/success?orderId=${order.orderNumber}&mobile=${encodeURIComponent(order.mobile)}`);
  }
  if (payment.status !== "PENDING") {
    return res.redirect(`${FRONTEND_URL}/checkout/failed?orderId=${order.orderNumber}`);
  }

  if (Status !== "OK") {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
    await writeAuditLog({
      orderId: order.id,
      entityType: "payment",
      entityId: payment.id,
      action: "payment_cancelled_by_user",
      newStatus: "FAILED",
      actorType: "USER",
      ipAddress: req.ip,
    });
    return res.redirect(`${FRONTEND_URL}/checkout/failed?orderId=${order.orderNumber}`);
  }

  const amountToman = rialToToman(payment.amountRial);
  const verifyResult = await zarinpal.verifyPayment({ amountToman, authority: Authority });

  if (!verifyResult.success) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED", gatewayErrorCode: String(verifyResult.errorCode) },
    });
    await writeAuditLog({
      orderId: order.id,
      entityType: "payment",
      entityId: payment.id,
      action: "payment_verify_failed",
      newStatus: "FAILED",
      actorType: "SYSTEM",
      metadata: { errorCode: verifyResult.errorCode },
    });
    return res.redirect(`${FRONTEND_URL}/checkout/failed?orderId=${order.orderNumber}`);
  }

  const fulfillmentResult = await fulfillOrder({ order, payment, verifyResult, req });

  if (!fulfillmentResult.success) {
    const reverseResult = await zarinpal.reversePayment({ authority: Authority });
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: reverseResult.success ? "REVERSED" : "VERIFIED" },
      }),
      prisma.order.update({
        where: { id: order.id },
        data: { status: reverseResult.success ? "REFUNDED" : "FAILED" },
      }),
    ]);
    await writeAuditLog({
      orderId: order.id,
      entityType: "payment",
      entityId: payment.id,
      action: "auto_reverse_no_inventory",
      newStatus: reverseResult.success ? "REVERSED" : "FAILED",
      actorType: "SYSTEM",
      metadata: { reverseResult },
    });
    return res.redirect(`${FRONTEND_URL}/checkout/failed?orderId=${order.orderNumber}&reason=out_of_stock`);
  }

  return res.redirect(`${FRONTEND_URL}/checkout/success?orderId=${order.orderNumber}&mobile=${encodeURIComponent(order.mobile)}`);
});

async function fulfillOrder({ order, payment, verifyResult, req }) {
  try {
    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        const rows = await tx.$queryRaw`
          SELECT id FROM account_inventory
          WHERE variant_id = ${item.variantId}::uuid AND status = 'AVAILABLE'
          LIMIT 1
          FOR UPDATE SKIP LOCKED
        `;

        if (!rows || rows.length === 0) {
          throw new Error(`NO_INVENTORY:${item.variantId}`);
        }

        const accountId = rows[0].id;

        await tx.accountInventory.update({
          where: { id: accountId },
          data: { status: "SOLD", reservedForOrderId: order.id, soldAt: new Date() },
        });
        await tx.orderItem.update({
          where: { id: item.id },
          data: { assignedAccountId: accountId },
        });
      }

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "VERIFIED",
          refId: String(verifyResult.refId),
          cardPanMasked: verifyResult.cardPan || null,
          feeRial: verifyResult.fee ? BigInt(verifyResult.fee) * 10n : null,
          verifiedAt: new Date(),
        },
      });

      await tx.order.update({ where: { id: order.id }, data: { status: "PAID" } });

      await tx.telegramNotification.create({
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
    });

    await writeAuditLog({
      orderId: order.id,
      entityType: "order",
      entityId: order.id,
      action: "payment_verified_and_fulfilled",
      previousStatus: "PENDING_PAYMENT",
      newStatus: "PAID",
      actorType: "SYSTEM",
      ipAddress: req.ip,
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

module.exports = router;
