// Backend/src/routes/payment.routes.js
const express = require("express");
const prisma = require("../lib/prisma");
const zibal = require("../services/zibal.service");
const usdRateJob = require("../jobs/usd-rate-job");
const { paymentRateLimiter } = require("../middleware/rateLimit");
const { writeAuditLog } = require("../lib/audit");
const { rialToToman } = require("../lib/pricing");
const { notifyNewOrder } = require("../services/telegramNotifier");

const router = express.Router();

const FRONTEND_URL = (process.env.FRONTEND_URL?.split(",")[0]?.trim() || "https://byelimit.ir").replace(/\/$/, "");

// ───────────── API دریافت نرخ لحظه‌ای دلار برای هدر فرانت‌اند ─────────────
router.get("/usd-rate", async (req, res) => {
  try {
    const memPrice = usdRateJob.getLatestDisplayPrice();
    if (memPrice && memPrice > 10000) {
      return res.json({ displayPrice: memPrice });
    }

    const rate = await prisma.usdRate.findFirst({
      orderBy: { fetchedAt: "desc" },
    });

    if (rate && rate.displayPrice) {
      return res.json({ displayPrice: rate.displayPrice });
    }

    return res.json({ displayPrice: 217000 });
  } catch (err) {
    return res.json({ displayPrice: 217000 });
  }
});

// ───────────── درخواست پرداخت به درگاه زیبال ─────────────
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
router.all("/callback/zibal", async (req, res) => {
  const trackId = req.query.trackId || req.body?.trackId;
  const success = req.query.success || req.body?.success;
  const orderId = req.query.orderId || req.body?.orderId;

  console.log(`[Zibal Callback Hit] Method: ${req.method}, trackId: ${trackId}, success: ${success}, orderId: ${orderId}`);

  if (!trackId) {
    console.error("[Zibal Callback Error]: Missing trackId parameter");
    return res.redirect(`${FRONTEND_URL}/checkout/failed?reason=missing_params`);
  }

  try {
    const payment = await prisma.payment.findFirst({
      where: { authority: String(trackId), gateway: "ZIBAL" },
    });

    if (!payment) {
      console.error(`[Zibal Callback Error]: Payment record not found for authority (trackId): ${trackId}`);
      return res.redirect(`${FRONTEND_URL}/checkout/failed?reason=payment_not_found`);
    }

    const order = await prisma.order.findUnique({
      where: { id: payment.orderId },
      include: { items: true, cart: true },
    });

    if (!order) {
      console.error(`[Zibal Callback Error]: Order record not found for orderId: ${payment.orderId}`);
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
      console.error(`[SECURITY ALERT] عدم تطابق مبلغ! پرداختی: ${verifyResult.amount} | فاکتور: ${payment.amountRial}`);
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

// ───────────── تحویل امن سفارش و پاکسازی کامل سبد خرید ─────────────
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

      // ۱. تغییر وضعیت کارت‌های فعال کاربر
      if (order.userId) {
        await tx.cartItem.deleteMany({
          where: { cart: { userId: order.userId, status: "ACTIVE" } },
        });
        await tx.cart.updateMany({
          where: { userId: order.userId, status: "ACTIVE" },
          data: { status: "CONVERTED" },
        });
      }

      // ۲. تغییر وضعیت کارت متصل به سفارش
      if (order.cartId) {
        await tx.cartItem.deleteMany({ where: { cartId: order.cartId } });
        await tx.cart.updateMany({
          where: { id: order.cartId, status: "ACTIVE" },
          data: { status: "CONVERTED" },
        });
      }
    });

    console.log(`[PAYMENT FULFILL] Order ${order.orderNumber} successfully fulfilled in DB.`);

    // ثبت لاگ نوتیفیکیشن تلگرام در دیتابیس (خارج از تراکنش برای جلوگیری از خطای همگام‌سازی)
    try {
      await prisma.telegramNotification.create({
        data: {
          orderId: order.id,
          status: "SENT",
          payload: {
            orderNumber: order.orderNumber,
            mobile: order.mobile,
            gateway: "ZIBAL",
            refNumber: verifyResult?.refNumber || null,
            totalToman: rialToToman(order.totalRial),
          },
        },
      });
    } catch (tgDbErr) {
      console.warn("[Telegram Notification DB Warning]:", tgDbErr.message);
    }

    // واکشی کامل سفارش با محصولات و کاربر جهت ارسال به تلگرام
    console.log(`[PAYMENT FULFILL] Preparing to send Telegram notification for order ${order.orderNumber}...`);
    try {
      const fullOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: {
          items: { include: { product: true, variant: true } },
          user: true,
        },
      });
      const tgRes = await notifyNewOrder(fullOrder || order, verifyResult);
      console.log(`[PAYMENT FULFILL] Telegram notification result for ${order.orderNumber}:`, tgRes);
    } catch (notifyErr) {
      console.error("[Telegram Notifier Primary Error]:", notifyErr);
      await notifyNewOrder(order, verifyResult).catch((fallbackErr) => {
        console.error("[Telegram Notifier Fallback Error]:", fallbackErr);
      });
    }

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
    // حتی در صورت بروز خطا در تراکنش تحویل، چون پول از مشتری کسر شده، اعلان تلگرام حتماً باید ارسال شود
    try {
      console.log(`[PAYMENT FULFILL] Triggering emergency Telegram notification for ${order.orderNumber}...`);
      await notifyNewOrder(order, verifyResult);
    } catch (e) {
      console.error("[Telegram Emergency Notification Error]:", e);
    }
    return { success: false, error: err };
  }
}

module.exports = router;