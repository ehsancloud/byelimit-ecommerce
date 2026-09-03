// Backend/src/routes/payment.routes.js
const express = require("express");
const prisma = require("../lib/prisma");
const zibal = require("../services/zibal.service");
const { paymentRateLimiter } = require("../middleware/rateLimit");
const { writeAuditLog } = require("../lib/audit");
const { rialToToman } = require("../lib/pricing");

const router = express.Router();

const FRONTEND_URL = (process.env.FRONTEND_URL?.split(",")[0]?.trim() || "https://byelimit.ir").replace(/\/$/, "");

// ───────────── API دریافت نرخ لحظه‌ای دلار برای هدر فرانت‌اند ─────────────
router.get("/usd-rate", async (req, res) => {
  try {
    const rate = await prisma.usdRate.findFirst({
      orderBy: { fetchedAt: "desc" },
    });

    if (!rate || !rate.displayPrice) {
      return res.json({ displayPrice: null, fetchedAt: null });
    }

    return res.json({
      displayPrice: rate.displayPrice,
      fetchedAt: rate.fetchedAt,
    });
  } catch (err) {
    return res.json({ displayPrice: null, fetchedAt: null });
  }
});

// ───────────── درخواست پرداخت ─────────────
router.post("/request", paymentRateLimiter, async (req, res) => {
  try {
    const { orderId } = req.body || {};
    if (!orderId) {
      return res.status(400).json({ error: "شناسه سفارش الزامی است." });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({ error: "سفارش مورد نظر یافت نشد." });
    }

    if (order.status === "PAID" || order.status === "DELIVERED") {
      return res.status(409).json({ error: "این سفارش قبلاً با موفقیت پرداخت شده است." });
    }

    if (order.status !== "PENDING_PAYMENT") {
      return res.status(400).json({ error: "این سفارش در وضعیت انتظار پرداخت نیست." });
    }

    if (order.totalRial === 0n) {
      return res.status(400).json({
        error: "مبلغ این سفارش صفر است و نیازی به درگاه بانکی ندارد.",
        isFree: true,
      });
    }

    const backendBase = (process.env.BACKEND_URL || FRONTEND_URL).replace(/\/$/, "");
    const callbackUrl = `${backendBase}/api/payment/callback/zibal?orderId=${order.id}`;

    const result = await zibal.requestPayment({
      amountRial: order.totalRial,
      callbackUrl,
      description: `پرداخت سفارش ${order.orderNumber} - بای لیمیت`,
      orderId: order.id,
      mobile: order.mobile,
    });

    if (!result.success) {
      await writeAuditLog({
        orderId: order.id,
        entityType: "payment",
        entityId: order.id,
        action: "payment_request_failed",
        actorType: "SYSTEM",
        ipAddress: req.ip,
        metadata: { result: result.result, message: result.message },
      });
      return res.status(502).json({ error: result.message });
    }

    await prisma.payment.create({
      data: {
        orderId: order.id,
        gateway: "ZIBAL",
        authority: result.trackId,
        amountRial: order.totalRial,
        status: "PENDING",
        sessionSnapshot: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          mobile: order.mobile,
          ip: req.ip,
          userAgent: req.headers["user-agent"] || null,
          createdAt: new Date().toISOString(),
        },
      },
    });

    return res.json({ startPayUrl: result.startPayUrl });
  } catch (err) {
    console.error("CRITICAL PAYMENT REQUEST ERROR:", err);
    return res.status(500).json({ error: "خطای سرور در ایجاد درخواست پرداخت." });
  }
});

// ───────────── بازگشت از درگاه زیبال (Callback) ─────────────
router.get("/callback/zibal", async (req, res) => {
  const { trackId, success, orderId } = req.query;

  if (!trackId || !orderId) {
    return res.redirect(`${FRONTEND_URL}/checkout/failed?reason=missing_params`);
  }

  try {
    const payment = await prisma.payment.findFirst({
      where: { authority: String(trackId), gateway: "ZIBAL" },
    });

    if (!payment) {
      return res.redirect(`${FRONTEND_URL}/checkout/failed?reason=payment_not_found`);
    }

    const order = await prisma.order.findUnique({
      where: { id: payment.orderId },
      include: { items: true, cart: true },
    });

    if (!order) {
      return res.redirect(`${FRONTEND_URL}/checkout/failed?reason=order_not_found`);
    }

    if (payment.status === "VERIFIED" && (order.status === "PAID" || order.status === "DELIVERED")) {
      return res.redirect(
        `${FRONTEND_URL}/checkout/success?orderId=${order.orderNumber}&mobile=${encodeURIComponent(order.mobile)}`
      );
    }

    if (String(success) !== "1") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });
      return res.redirect(`${FRONTEND_URL}/checkout/failed?orderId=${order.orderNumber}&reason=cancelled`);
    }

    const verifyResult = await zibal.verifyPayment(trackId);

    if (!verifyResult.success) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED", gatewayErrorCode: String(verifyResult.result) },
      });
      return res.redirect(`${FRONTEND_URL}/checkout/failed?orderId=${order.orderNumber}&reason=verify_failed`);
    }

    if (verifyResult.amount && verifyResult.amount !== payment.amountRial) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED", gatewayErrorCode: "AMOUNT_MISMATCH" },
      });
      return res.redirect(`${FRONTEND_URL}/checkout/failed?orderId=${order.orderNumber}&reason=amount_mismatch`);
    }

    await fulfillOrderSafe({ order, payment, verifyResult, req });

    return res.redirect(
      `${FRONTEND_URL}/checkout/success?orderId=${order.orderNumber}&mobile=${encodeURIComponent(order.mobile)}`
    );
  } catch (err) {
    console.error("PAYMENT CALLBACK EXCEPTION:", err);
    return res.redirect(`${FRONTEND_URL}/checkout/failed?reason=server_error`);
  }
});

// ───────────── تحویل امن سفارش ─────────────
async function fulfillOrderSafe({ order, payment, verifyResult, req }) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "VERIFIED",
          refId: verifyResult.refNumber || null,
          cardPanMasked: verifyResult.cardNumber || null,
          verifiedAt: new Date(),
        },
      });

      for (const item of order.items) {
        if (item.assignedAccountId) continue;

        const availableAccount = await tx.accountInventory.findFirst({
          where: {
            variantId: item.variantId,
            status: "AVAILABLE",
          },
        });

        if (availableAccount) {
          await tx.accountInventory.update({
            where: { id: availableAccount.id },
            data: {
              status: "SOLD",
              reservedForOrderId: order.id,
              soldAt: new Date(),
            },
          });

          await tx.orderItem.update({
            where: { id: item.id },
            data: { assignedAccountId: availableAccount.id },
          });
        }
      }

      await tx.order.update({
        where: { id: order.id },
        data: { status: "PAID" },
      });

      if (order.discountCodeId) {
        await tx.discountCode.update({
          where: { id: order.discountCodeId },
          data: { usedCount: { increment: 1 } },
        });
      }

      if (order.cartId) {
        await tx.cart.update({ where: { id: order.cartId }, data: { status: "CONVERTED" } });
        await tx.cartItem.deleteMany({ where: { cartId: order.cartId } });
      }

      try {
        await tx.telegramNotification.create({
          data: {
            orderId: order.id,
            payload: {
              orderNumber: order.orderNumber,
              mobile: order.mobile,
              gateway: "ZIBAL",
              refNumber: verifyResult.refNumber,
              totalToman: rialToToman(order.totalRial),
            },
          },
        });
      } catch (tgErr) {
        console.error("Telegram notification error:", tgErr);
      }
    });

    await writeAuditLog({
      orderId: order.id,
      entityType: "order",
      entityId: order.id,
      action: "payment_verified_and_fulfilled",
      newStatus: "PAID",
      actorType: "SYSTEM",
      ipAddress: req.ip,
      metadata: { refNumber: verifyResult.refNumber, gateway: "ZIBAL" },
    });

    return { success: true };
  } catch (err) {
    console.error("FULFILL SAFE ERROR:", err);
    return { success: false, error: err };
  }
}

module.exports = router;