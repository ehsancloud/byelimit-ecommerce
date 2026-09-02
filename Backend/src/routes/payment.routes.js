// src/routes/payment.routes.js - v0.97 (Zibal + ZarinPal)
const express = require("express");
const prisma = require("../lib/prisma");
const zarinpal = require("../services/zarinpal.service");
const zibal    = require("../services/zibal.service");
const { paymentRateLimiter } = require("../middleware/rateLimit");
const { writeAuditLog } = require("../lib/audit");
const { rialToToman } = require("../lib/pricing");

const router = express.Router();
const FRONTEND_URL = process.env.FRONTEND_URL?.split(",")[0]?.trim() || "https://byelimit.ir";

// ───────────── مرحله ۱: درخواست پرداخت ─────────────
router.post("/request", paymentRateLimiter, async (req, res) => {
  const { orderId, cardPan, gateway = "ZIBAL" } = req.body || {};
  if (!orderId) return res.status(400).json({ error: "شناسه سفارش الزامی است." });

  const gw = String(gateway).toUpperCase() === "ZARINPAL" ? "ZARINPAL" : "ZIBAL";

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return res.status(404).json({ error: "سفارش یافت نشد." });
  if (order.status !== "PENDING_PAYMENT") {
    return res.status(409).json({ error: "این سفارش قبلاً پردازش شده است." });
  }

  const callbackBase = process.env.BACKEND_URL || `${FRONTEND_URL.replace(/\/$/, "")}`;
  const callbackUrl  = `${callbackBase}/api/payment/callback/${gw.toLowerCase()}?orderId=${order.id}`;
  const description  = `پرداخت سفارش - بای لیمیت`;

  let result;

  if (gw === "ZIBAL") {
    result = await zibal.requestPayment({
      amountRial:  order.totalRial,
      callbackUrl,
      description,
      orderId:     order.id,
      mobile:      order.mobile,
    });
    if (!result.success) {
      await writeAuditLog({ orderId: order.id, entityType: "payment", entityId: order.id,
        action: "payment_request_failed", actorType: "SYSTEM",
        metadata: { gateway: "ZIBAL", result: result.result } });
      return res.status(502).json({ error: result.message });
    }
    await prisma.payment.create({ data: {
      orderId:    order.id,
      gateway:    "ZIBAL",
      authority:  result.trackId, // trackId زیبال در فیلد authority ذخیره می‌شود
      amountRial: order.totalRial,
      status:     "PENDING",
      sessionSnapshot: { orderId: order.id, mobile: order.mobile, ip: req.ip,
        userAgent: req.headers["user-agent"], requestedAt: new Date().toISOString() },
    }});
    return res.json({ startPayUrl: result.startPayUrl });

  } else {
    // ZarinPal (غیرفعال - فقط برای آینده)
    const amountToman = rialToToman(order.totalRial);
    result = await zarinpal.requestPayment({
      amountToman, description, orderId: order.id, mobile: order.mobile,
      cardPan: cardPan ? [cardPan] : undefined,
      callbackUrl,
    });
    if (!result.success) {
      await writeAuditLog({ orderId: order.id, entityType: "payment", entityId: order.id,
        action: "payment_request_failed", actorType: "SYSTEM",
        metadata: { gateway: "ZARINPAL", errorCode: result.errorCode } });
      return res.status(502).json({ error: result.message });
    }
    await prisma.payment.create({ data: {
      orderId:    order.id,
      gateway:    "ZARINPAL",
      authority:  result.authority,
      amountRial: order.totalRial,
      status:     "PENDING",
      isSandbox:  zarinpal.IS_SANDBOX,
      sessionSnapshot: { orderId: order.id, mobile: order.mobile, ip: req.ip,
        userAgent: req.headers["user-agent"], requestedAt: new Date().toISOString() },
    }});
    return res.json({ startPayUrl: result.startPayUrl });
  }
});

// ───────────── Callback زیبال ─────────────
// GET /api/payment/callback/zibal?trackId=&success=1&orderId=&status=
router.get("/callback/zibal", async (req, res) => {
  const { trackId, success, orderId, status } = req.query;

  if (!trackId || !orderId) return res.redirect(`${FRONTEND_URL}/checkout/failed`);

  const payment = await prisma.payment.findFirst({
    where: { authority: String(trackId), gateway: "ZIBAL" },
  });
  if (!payment) return res.redirect(`${FRONTEND_URL}/checkout/failed`);

  const snap = payment.sessionSnapshot || {};
  if (snap.orderId !== orderId || payment.orderId !== orderId) {
    await writeAuditLog({ orderId: payment.orderId, entityType: "payment", entityId: payment.id,
      action: "session_validation_failed", actorType: "SYSTEM", ipAddress: req.ip,
      metadata: { queryOrderId: orderId, snapshotOrderId: snap.orderId } });
    return res.redirect(`${FRONTEND_URL}/checkout/failed`);
  }

  const order = await prisma.order.findUnique({
    where: { id: payment.orderId }, include: { items: true },
  });

  if (payment.status === "VERIFIED" && order.status === "PAID") {
    return res.redirect(`${FRONTEND_URL}/checkout/success?orderId=${order.orderNumber}&mobile=${encodeURIComponent(order.mobile)}`);
  }
  if (payment.status !== "PENDING") {
    return res.redirect(`${FRONTEND_URL}/checkout/failed?orderId=${order.orderNumber}`);
  }

  // کاربر پرداخت را لغو کرد
  if (String(success) !== "1" || String(status) !== "2") {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
    await writeAuditLog({ orderId: order.id, entityType: "payment", entityId: payment.id,
      action: "payment_cancelled_by_user", newStatus: "FAILED", actorType: "USER", ipAddress: req.ip });
    return res.redirect(`${FRONTEND_URL}/checkout/failed?orderId=${order.orderNumber}`);
  }

  // تأیید پرداخت
  const verifyResult = await zibal.verifyPayment(trackId);
  if (!verifyResult.success) {
    await prisma.payment.update({ where: { id: payment.id },
      data: { status: "FAILED", gatewayErrorCode: String(verifyResult.result) } });
    await writeAuditLog({ orderId: order.id, entityType: "payment", entityId: payment.id,
      action: "payment_verify_failed", newStatus: "FAILED", actorType: "SYSTEM",
      metadata: { result: verifyResult.result } });
    return res.redirect(`${FRONTEND_URL}/checkout/failed?orderId=${order.orderNumber}`);
  }

  const fulfillmentResult = await fulfillOrder({ order, payment, verifyResult, req, gateway: "ZIBAL" });

  if (!fulfillmentResult.success) {
    await prisma.$transaction([
      prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } }),
      prisma.order.update({ where: { id: order.id }, data: { status: "FAILED" } }),
    ]);
    return res.redirect(`${FRONTEND_URL}/checkout/failed?orderId=${order.orderNumber}&reason=out_of_stock`);
  }

  return res.redirect(`${FRONTEND_URL}/checkout/success?orderId=${order.orderNumber}&mobile=${encodeURIComponent(order.mobile)}`);
});

// ───────────── Callback زرین‌پال (برای آینده) ─────────────
router.get("/callback/zarinpal", async (req, res) => {
  const { Authority, Status, orderId } = req.query;
  if (!Authority || !orderId) return res.redirect(`${FRONTEND_URL}/checkout/failed`);

  const payment = await prisma.payment.findUnique({ where: { authority: Authority } });
  if (!payment) return res.redirect(`${FRONTEND_URL}/checkout/failed`);

  const snap = payment.sessionSnapshot || {};
  if (snap.orderId !== orderId || payment.orderId !== orderId) {
    return res.redirect(`${FRONTEND_URL}/checkout/failed`);
  }

  const order = await prisma.order.findUnique({ where: { id: payment.orderId }, include: { items: true } });
  if (payment.status === "VERIFIED" && order.status === "PAID") {
    return res.redirect(`${FRONTEND_URL}/checkout/success?orderId=${order.orderNumber}&mobile=${encodeURIComponent(order.mobile)}`);
  }
  if (payment.status !== "PENDING") return res.redirect(`${FRONTEND_URL}/checkout/failed?orderId=${order.orderNumber}`);
  if (Status !== "OK") {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
    return res.redirect(`${FRONTEND_URL}/checkout/failed?orderId=${order.orderNumber}`);
  }

  const amountToman = rialToToman(payment.amountRial);
  const verifyResult = await zarinpal.verifyPayment({ amountToman, authority: Authority });
  if (!verifyResult.success) {
    await prisma.payment.update({ where: { id: payment.id },
      data: { status: "FAILED", gatewayErrorCode: String(verifyResult.errorCode) } });
    return res.redirect(`${FRONTEND_URL}/checkout/failed?orderId=${order.orderNumber}`);
  }

  const fulfillmentResult = await fulfillOrder({ order, payment, verifyResult, req, gateway: "ZARINPAL" });
  if (!fulfillmentResult.success) {
    const reverseResult = await zarinpal.reversePayment({ authority: Authority });
    await prisma.$transaction([
      prisma.payment.update({ where: { id: payment.id },
        data: { status: reverseResult.success ? "REVERSED" : "VERIFIED" } }),
      prisma.order.update({ where: { id: order.id },
        data: { status: reverseResult.success ? "REFUNDED" : "FAILED" } }),
    ]);
    return res.redirect(`${FRONTEND_URL}/checkout/failed?orderId=${order.orderNumber}&reason=out_of_stock`);
  }
  return res.redirect(`${FRONTEND_URL}/checkout/success?orderId=${order.orderNumber}&mobile=${encodeURIComponent(order.mobile)}`);
});

// Backward compat: old callback URL
router.get("/callback", (req, res) => {
  const { Authority } = req.query;
  if (Authority) return res.redirect(`/api/payment/callback/zarinpal?${new URLSearchParams(req.query)}`);
  return res.redirect(`${FRONTEND_URL}/checkout/failed`);
});

// ───────────── API: نرخ دلار برای نمایش در فرانت ─────────────
router.get("/usd-rate", async (req, res) => {
  try {
    const rate = await prisma.usdRate.findFirst({ orderBy: { fetchedAt: "desc" } });
    if (!rate) return res.json({ displayPrice: null, fetchedAt: null });
    return res.json({ displayPrice: rate.displayPrice, fetchedAt: rate.fetchedAt });
  } catch {
    return res.json({ displayPrice: null, fetchedAt: null });
  }
});

// ───────────── تابع تحویل سفارش (مشترک بین دو درگاه) ─────────────
async function fulfillOrder({ order, payment, verifyResult, req, gateway }) {
  try {
    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        const rows = await tx.$queryRaw`
          SELECT id FROM account_inventory
          WHERE variant_id = ${item.variantId}::uuid AND status = 'AVAILABLE'
          LIMIT 1 FOR UPDATE SKIP LOCKED
        `;
        if (!rows || rows.length === 0) throw new Error(`NO_INVENTORY:${item.variantId}`);
        const accountId = rows[0].id;
        await tx.accountInventory.update({ where: { id: accountId },
          data: { status: "SOLD", reservedForOrderId: order.id, soldAt: new Date() } });
        await tx.orderItem.update({ where: { id: item.id },
          data: { assignedAccountId: accountId } });
      }

      const paymentData = {
        status: "VERIFIED",
        refId: verifyResult.refId || verifyResult.refNumber || null,
        verifiedAt: new Date(),
      };
      if (gateway === "ZIBAL") {
        paymentData.cardPanMasked = verifyResult.cardNumber || null;
      } else {
        paymentData.cardPanMasked = verifyResult.cardPan || null;
        paymentData.feeRial = verifyResult.fee ? BigInt(verifyResult.fee) * 10n : null;
      }

      await tx.payment.update({ where: { id: payment.id }, data: paymentData });
      await tx.order.update({ where: { id: order.id }, data: { status: "PAID" } });
      await tx.telegramNotification.create({ data: {
        orderId: order.id,
        payload: { orderNumber: order.orderNumber, mobile: order.mobile, gateway,
          totalToman: rialToToman(order.totalRial),
          items: order.items.map((it) => ({ title: it.productTitleSnapshot, variant: it.variantNameSnapshot, quantity: it.quantity })) },
      }});
    });

    await writeAuditLog({ orderId: order.id, entityType: "order", entityId: order.id,
      action: "payment_verified_and_fulfilled", previousStatus: "PENDING_PAYMENT", newStatus: "PAID",
      actorType: "SYSTEM", ipAddress: req.ip,
      metadata: { refId: verifyResult.refId || verifyResult.refNumber, gateway } });

    return { success: true };
  } catch (err) {
    if (String(err.message).startsWith("NO_INVENTORY")) return { success: false, reason: "NO_INVENTORY" };
    console.error("FULFILL ORDER ERROR:", err);
    return { success: false, reason: "UNKNOWN", error: err };
  }
}

module.exports = router;
