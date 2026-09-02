// src/routes/payment.routes.js
// درگاه‌های پرداخت: زیبال (فعال) و زرین‌پال (غیرفعال تا اخذ مجوز رسمی)

const express = require("express");
const prisma = require("../lib/prisma");
const zarinpal = require("../services/zarinpal.service");
const zibal = require("../services/zibal.service");
const { paymentRateLimiter } = require("../middleware/rateLimit");
const { writeAuditLog } = require("../lib/audit");
const { rialToToman } = require("../lib/pricing");
const { fulfillOrder } = require("../jobs/fulfill-helper");

const router = express.Router();

// FRONTEND_URL ممکن است لیست کاما‌جداشده باشد (برای CORS)؛ برای ریدایرکت/کال‌بک فقط دامنه اول معتبر است
const FRONTEND_URL = (process.env.FRONTEND_URL || "https://byelimit.ir").split(",")[0].trim();
const ZARINPAL_ENABLED = process.env.ZARINPAL_ENABLED === "true";

// ═══════════════════════════════════════════════════════════════
// مرحله ۱: ساخت درخواست پرداخت
// ═══════════════════════════════════════════════════════════════

router.post("/request", paymentRateLimiter, async (req, res) => {
  const { orderId, gateway: requestedGateway, cardPan } = req.body || {};
  if (!orderId) return res.status(400).json({ error: "شناسه سفارش الزامی است." });

  // تعیین درگاه: فقط زیبال فعال است
  const gateway = "ZIBAL";
  if (!ZARINPAL_ENABLED && requestedGateway === "ZARINPAL") {
    return res.status(400).json({ error: "درگاه زرین‌پال فعلاً غیرفعال است. لطفاً زیبال را انتخاب کنید." });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return res.status(404).json({ error: "سفارش یافت نشد." });
  if (order.status !== "PENDING_PAYMENT") {
    return res.status(409).json({ error: "این سفارش قبلاً پردازش شده است." });
  }

  const amountRial = order.totalRial;

  // ──── زیبال ────
  if (gateway === "ZIBAL") {
    const callbackUrl = `${process.env.ZIBAL_CALLBACK_URL || `${FRONTEND_URL}/api/payment/callback/zibal`}?orderId=${order.id}`;

    const result = await zibal.requestPayment({
      amountRial,
      callbackUrl,
      orderId: order.id,
      description: `پرداخت سفارش ${order.orderNumber} - بای لیمیت`,
      mobile: order.mobile,
    });

    if (!result.success) {
      await writeAuditLog({
        orderId: order.id,
        entityType: "payment",
        entityId: order.id,
        action: "payment_request_failed",
        actorType: "SYSTEM",
        metadata: { gateway: "ZIBAL", errorCode: result.errorCode, raw: result.raw },
      });
      return res.status(502).json({ error: result.message });
    }

    await prisma.payment.create({
      data: {
        orderId: order.id,
        gateway: "ZIBAL",
        authority: `zibal:${result.trackId}`,
        gatewayTrackId: BigInt(result.trackId),
        amountRial,
        status: "PENDING",
        isSandbox: zibal.IS_SANDBOX,
        sessionSnapshot: {
          orderId: order.id,
          mobile: order.mobile,
          ip: req.ip,
          userAgent: req.headers["user-agent"],
          requestedAt: new Date().toISOString(),
          gateway: "ZIBAL",
        },
      },
    });

    return res.json({ startPayUrl: result.startPayUrl });
  }

  // ──── زرین‌پال (غیرفعال) ────
  if (gateway === "ZARINPAL" && ZARINPAL_ENABLED) {
    const amountToman = rialToToman(order.totalRial);
    const callbackUrl = `${process.env.ZARINPAL_CALLBACK_URL}?orderId=${order.id}`;

    const result = await zarinpal.requestPayment({
      amountToman,
      description: `پرداخت سفارش ${order.orderNumber} - بای لیمیت`,
      orderId: order.id,
      mobile: order.mobile,
      cardPan: cardPan ? [cardPan] : undefined,
      callbackUrl,
    });

    if (!result.success) {
      await writeAuditLog({
        orderId: order.id,
        entityType: "payment",
        entityId: order.id,
        action: "payment_request_failed",
        actorType: "SYSTEM",
        metadata: { gateway: "ZARINPAL", errorCode: result.errorCode, raw: result.raw },
      });
      return res.status(502).json({ error: result.message });
    }

    await prisma.payment.create({
      data: {
        orderId: order.id,
        gateway: "ZARINPAL",
        authority: result.authority,
        amountRial,
        status: "PENDING",
        isSandbox: zarinpal.IS_SANDBOX,
        sessionSnapshot: {
          orderId: order.id,
          mobile: order.mobile,
          ip: req.ip,
          userAgent: req.headers["user-agent"],
          requestedAt: new Date().toISOString(),
          gateway: "ZARINPAL",
        },
      },
    });

    return res.json({ startPayUrl: result.startPayUrl });
  }

  return res.status(400).json({ error: "درگاه پرداخت نامعتبر است." });
});

// ═══════════════════════════════════════════════════════════════
// مرحله ۲: بازگشت از درگاه زیبال (Callback)
// ═══════════════════════════════════════════════════════════════

router.get("/callback/zibal", async (req, res) => {
  const { success, trackId, orderId } = req.query;

  if (!trackId || !orderId) {
    return res.redirect(`${FRONTEND_URL}/checkout/failed`);
  }

  const payment = await prisma.payment.findUnique({
    where: { authority: `zibal:${trackId}` },
  });
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
      metadata: { queryOrderId: orderId, snapshotOrderId: snapshot.orderId, gateway: "ZIBAL" },
    });
    return res.redirect(`${FRONTEND_URL}/checkout/failed`);
  }

  const order = await prisma.order.findUnique({
    where: { id: payment.orderId },
    include: { items: true },
  });

  // قبلاً تکمیل شده؟
  if (payment.status === "VERIFIED" && order.status === "PAID") {
    return res.redirect(
      `${FRONTEND_URL}/checkout/success?orderId=${order.orderNumber}&mobile=${encodeURIComponent(order.mobile)}`,
    );
  }
  if (payment.status !== "PENDING") {
    return res.redirect(`${FRONTEND_URL}/checkout/failed?orderId=${order.orderNumber}`);
  }

  // پرداخت ناموفق
  if (String(success) !== "1") {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
    await writeAuditLog({
      orderId: order.id,
      entityType: "payment",
      entityId: payment.id,
      action: "payment_cancelled_by_user",
      newStatus: "FAILED",
      actorType: "USER",
      ipAddress: req.ip,
      metadata: { gateway: "ZIBAL" },
    });
    return res.redirect(`${FRONTEND_URL}/checkout/failed?orderId=${order.orderNumber}`);
  }

  // تایید مبلغ
  const verifyResult = await zibal.verifyPayment({ trackId: Number(trackId) });

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
      metadata: { errorCode: verifyResult.errorCode, gateway: "ZIBAL" },
    });
    return res.redirect(`${FRONTEND_URL}/checkout/failed?orderId=${order.orderNumber}`);
  }

  // اعتبارسنجی مبلغ: مبلغ وریفای باید با مبلغ سفارش برابر باشد
  const expected = Number(BigInt(payment.amountRial));
  if (verifyResult.amount != null && Number(verifyResult.amount) !== expected) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED", gatewayErrorCode: "AMOUNT_MISMATCH" },
    });
    return res.redirect(`${FRONTEND_URL}/checkout/failed?orderId=${order.orderNumber}`);
  }

  // تکمیل سفارش
  const fulfillmentResult = await fulfillOrder({
    order,
    payment,
    verifyResult,
    req,
  });

  if (!fulfillmentResult.success) {
    // استرداد خودکار در صورت عدم تخصیص اکانت
    // ⚠️ زیبال API استرداد مستقیم ندارد؛ در لاگ ثبت و پشتیبانی دستی پیگیری می‌شود
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "VERIFIED", gatewayErrorCode: "NEEDS_MANUAL_REVERSE" },
    });
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "FAILED" },
    });
    await writeAuditLog({
      orderId: order.id,
      entityType: "payment",
      entityId: payment.id,
      action: "auto_reverse_no_inventory_zibal",
      newStatus: "FAILED",
      actorType: "SYSTEM",
      metadata: { reason: fulfillmentResult.reason },
    });
    return res.redirect(
      `${FRONTEND_URL}/checkout/failed?orderId=${order.orderNumber}&reason=out_of_stock`,
    );
  }

  return res.redirect(
    `${FRONTEND_URL}/checkout/success?orderId=${order.orderNumber}&mobile=${encodeURIComponent(order.mobile)}`,
  );
});

// ═══════════════════════════════════════════════════════════════
// مرحله ۲: بازگشت از درگاه زرین‌پال (Callback)
// ═══════════════════════════════════════════════════════════════

router.get("/callback", async (req, res) => {
  if (!ZARINPAL_ENABLED) {
    return res.redirect(`${FRONTEND_URL}/checkout/failed`);
  }

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
    return res.redirect(
      `${FRONTEND_URL}/checkout/success?orderId=${order.orderNumber}&mobile=${encodeURIComponent(order.mobile)}`,
    );
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

  const fulfillmentResult = await fulfillOrder({
    order,
    payment,
    verifyResult,
    req,
  });

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
    return res.redirect(
      `${FRONTEND_URL}/checkout/failed?orderId=${order.orderNumber}&reason=out_of_stock`,
    );
  }

  return res.redirect(
    `${FRONTEND_URL}/checkout/success?orderId=${order.orderNumber}&mobile=${encodeURIComponent(order.mobile)}`,
  );
});

// ═══════════════════════════════════════════════════════════════
// API endpoint: دریافت نرخ لحظه‌ای دلار (public)
// ═══════════════════════════════════════════════════════════════

router.get("/rate", async (_req, res) => {
  try {
    const row = await prisma.exchangeRateSetting.findUnique({ where: { id: "singleton" } });
    if (!row || !row.lastFetchedAt) {
      return res.json({ available: false });
    }
    return res.json({
      available: true,
      displayRate: row.displayRate,
      lastFetchedAt: row.lastFetchedAt,
    });
  } catch {
    return res.json({ available: false });
  }
});

module.exports = router;