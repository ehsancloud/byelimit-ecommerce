// Backend/src/routes/payment.routes.js
const express = require("express");
const prisma = require("../lib/prisma");
const zibal = require("../services/zibal.service");
const { paymentRateLimiter } = require("../middleware/rateLimit");
const { writeAuditLog } = require("../lib/audit");
const { rialToToman } = require("../lib/pricing");

const router = express.Router();

const FRONTEND_URL = (process.env.FRONTEND_URL?.split(",")[0]?.trim() || "https://byelimit.ir").replace(/\/$/, "");

// ───────────── درخواست پرداخت (شروع نشست تراکنش) ─────────────
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
      return res.status(400).json({ error: "وضعیت این سفارش برای پرداخت نامعتبر است." });
    }

    // اگر مبلغ سفارش به دلیل کد تخفیف صفر باشد، نباید به درگاه فرستاده شود
    if (order.totalRial === 0n) {
      return res.status(400).json({
        error: "مبلغ این سفارش صفر است و نیازی به درگاه بانکی ندارد.",
        isFree: true,
      });
    }

    // الزامات شاپرک: آدرس بازگشت باید با دامنه ثبت‌شده در پنل زیبال و تحت HTTPS همخوانی داشته باشد[cite: 2, 3]
    const backendBase = (process.env.BACKEND_URL || FRONTEND_URL).replace(/\/$/, "");
    const callbackUrl = `${backendBase}/api/payment/callback/zibal?orderId=${order.id}`;

    const result = await zibal.requestPayment({
      amountRial: order.totalRial,
      callbackUrl,
      description: `خرید از بای لیمیت - سفارش ${order.orderNumber}`,
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

    // ثبت یا بروزرسانی سابقه تراکنش به صورت PENDING
    await prisma.payment.upsert({
      where: { authority: result.trackId },
      update: {
        orderId: order.id,
        amountRial: order.totalRial,
        status: "PENDING",
        gateway: "ZIBAL",
        sessionSnapshot: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          mobile: order.mobile,
          ip: req.ip,
          userAgent: req.headers["user-agent"],
          createdAt: new Date().toISOString(),
        },
      },
      create: {
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
          userAgent: req.headers["user-agent"],
          createdAt: new Date().toISOString(),
        },
      },
    });

    return res.json({ startPayUrl: result.startPayUrl });
  } catch (err) {
    console.error("PAYMENT REQUEST ERROR:", err);
    return res.status(500).json({ error: "خطای سرور در ایجاد درخواست پرداخت." });
  }
});

// ───────────── آدرس بازگشت زیبال (Callback) ─────────────
// بر اساس مستندات زیبال پارامترها به صورت Query شامل trackId, success, status, orderId ارسال می‌شوند[cite: 3]
router.get("/callback/zibal", async (req, res) => {
  const { trackId, success, orderId } = req.query;

  if (!trackId || !orderId) {
    return res.redirect(`${FRONTEND_URL}/checkout/failed?reason=invalid_callback_params`);
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

    // اگر تراکنش قبلاً با موفقیت تایید و پردازش شده، مستقیم به صفحه موفقیت هدایت شود
    if (payment.status === "VERIFIED" && (order.status === "PAID" || order.status === "DELIVERED")) {
      return res.redirect(
        `${FRONTEND_URL}/checkout/success?orderId=${order.orderNumber}&mobile=${encodeURIComponent(order.mobile)}`
      );
    }

    // طبق مستندات زیبال: تنها شاخص موفقیت بازگشت از درگاه success === "1" است[cite: 3]
    if (String(success) !== "1") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });
      await writeAuditLog({
        orderId: order.id,
        entityType: "payment",
        entityId: payment.id,
        action: "payment_cancelled_by_user",
        newStatus: "FAILED",
        actorType: "USER",
        ipAddress: req.ip,
      });
      return res.redirect(`${FRONTEND_URL}/checkout/failed?orderId=${order.orderNumber}&reason=cancelled`);
    }

    // قفل اتمیک: جلوگیری از Race Condition و تایید چندباره (Double Fulfillment)
    const lockedPayment = await prisma.payment.updateMany({
      where: { id: payment.id, status: "PENDING" },
      data: { status: "PENDING" }, // قفل روی رکورد
    });

    if (lockedPayment.count === 0 && payment.status !== "PENDING") {
      // درخواستی همزمان از قبل در حال انجام وریفای است
      return res.redirect(
        `${FRONTEND_URL}/checkout/success?orderId=${order.orderNumber}&mobile=${encodeURIComponent(order.mobile)}`
      );
    }

    // تایید تراکنش از سمت وب‌سرویس زیبال
    const verifyResult = await zibal.verifyPayment(trackId);

    if (!verifyResult.success) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED", gatewayErrorCode: String(verifyResult.result) },
      });
      await writeAuditLog({
        orderId: order.id,
        entityType: "payment",
        entityId: payment.id,
        action: "payment_verify_failed",
        newStatus: "FAILED",
        actorType: "SYSTEM",
        ipAddress: req.ip,
        metadata: { result: verifyResult.result, message: verifyResult.message },
      });
      return res.redirect(`${FRONTEND_URL}/checkout/failed?orderId=${order.orderNumber}&reason=verify_failed`);
    }

    // بررسی امنیتی فوق حیاتی: جلوگیری از دستکاری قیمت (Price Tampering)
    // مبلغ تاییدشده توسط زیبال باید دقیقاً با مبلغ فاکتور برابر باشد
    if (verifyResult.amount && verifyResult.amount !== payment.amountRial) {
      console.error(`[SECURITY ALERT] عدم تطابق مبلغ! واریز: ${verifyResult.amount} | فاکتور: ${payment.amountRial}`);
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED", gatewayErrorCode: "AMOUNT_MISMATCH" },
      });
      await writeAuditLog({
        orderId: order.id,
        entityType: "payment",
        entityId: payment.id,
        action: "security_price_tampering_detected",
        actorType: "SECURITY_ALERT",
        ipAddress: req.ip,
        metadata: { paidRial: verifyResult.amount?.toString(), expectedRial: payment.amountRial.toString() },
      });
      return res.redirect(`${FRONTEND_URL}/checkout/failed?orderId=${order.orderNumber}&reason=amount_mismatch`);
    }

    // تحویل خودکار اکانت‌ها و تغییر وضعیت نهایی
    const fulfillmentResult = await fulfillOrderSafe({ order, payment, verifyResult, req });

    if (!fulfillmentResult.success) {
      // پول با موفقیت از حساب مشتری کسر شده و وریفای گردیده است؛ بنابراین پرداخت نباید FAILED شود.
      // وضعیت به ادمین گزارش شده تا اکانت به صورت دستی تحویل شود.
      return res.redirect(
        `${FRONTEND_URL}/checkout/success?orderId=${order.orderNumber}&mobile=${encodeURIComponent(order.mobile)}&notice=manual_fulfillment`
      );
    }

    return res.redirect(
      `${FRONTEND_URL}/checkout/success?orderId=${order.orderNumber}&mobile=${encodeURIComponent(order.mobile)}`
    );
  } catch (err) {
    console.error("PAYMENT CALLBACK EXCEPTION:", err);
    return res.redirect(`${FRONTEND_URL}/checkout/failed?reason=server_error`);
  }
});

// ───────────── تابع تحویل امن اکانت با قفل سطری ─────────────
async function fulfillOrderSafe({ order, payment, verifyResult, req }) {
  try {
    await prisma.$transaction(async (tx) => {
      // ۱. تایید قطعی پرداخت در دیتابیس
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "VERIFIED",
          refId: verifyResult.refNumber || null,
          cardPanMasked: verifyResult.cardNumber || null,
          verifiedAt: new Date(),
        },
      });

      // ۲. تخصیص اکانت‌ها از انبار با قفل بدبینانه (SKIP LOCKED) و کست صحیح ::text
      let allItemsAssigned = true;

      for (const item of order.items) {
        if (item.assignedAccountId) continue; // قبلاً تحویل داده شده

        const rows = await tx.$queryRaw`
          SELECT id FROM account_inventory
          WHERE variant_id = ${item.variantId}::text AND status = 'AVAILABLE'
          LIMIT 1 FOR UPDATE SKIP LOCKED
        `;

        if (!rows || rows.length === 0) {
          allItemsAssigned = false;
          break;
        }

        const accountId = rows[0].id;

        await tx.accountInventory.update({
          where: { id: accountId },
          data: {
            status: "SOLD",
            reservedForOrderId: order.id,
            soldAt: new Date(),
          },
        });

        await tx.orderItem.update({
          where: { id: item.id },
          data: { assignedAccountId: accountId },
        });
      }

      // ۳. بروزرسانی وضعیت سفارش
      const finalOrderStatus = allItemsAssigned ? "PAID" : "PAID"; // در هر دو حالت پول دریافت شده است
      await tx.order.update({
        where: { id: order.id },
        data: { status: finalOrderStatus },
      });

      // ۴. افزایش شمارنده مصرف کد تخفیف در صورت وجود
      if (order.discountCodeId) {
        await tx.discountCode.update({
          where: { id: order.discountCodeId },
          data: { usedCount: { increment: 1 } },
        });
      }

      // ۵. سبد خرید فقط اکنون و پس از پرداخت موفق قطعی تخلیه/تبدیل می‌شود
      if (order.cartId) {
        await tx.cart.update({
          where: { id: order.cartId },
          data: { status: "CONVERTED" },
        });
        await tx.cartItem.deleteMany({
          where: { cartId: order.cartId },
        });
      }

      // ۶. اعلان تلگرام
      await tx.telegramNotification.create({
        data: {
          orderId: order.id,
          payload: {
            orderNumber: order.orderNumber,
            mobile: order.mobile,
            gateway: "ZIBAL",
            refNumber: verifyResult.refNumber,
            totalToman: rialToToman(order.totalRial),
            needsManualFulfillment: !allItemsAssigned,
            items: order.items.map((it) => ({
              title: it.productTitleSnapshot,
              variant: it.variantNameSnapshot,
            })),
          },
        },
      });

      if (!allItemsAssigned) {
        throw new Error("INVENTORY_EMPTY_BUT_PAID");
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
    if (err.message === "INVENTORY_EMPTY_BUT_PAID") {
      console.warn(`[FULFILLMENT WARNING] سفارش ${order.orderNumber} پرداخت شد اما موجودی انبار برای تخصیص خودکار کافی نبود.`);
      return { success: false, reason: "INSUFFICIENT_INVENTORY" };
    }
    console.error("FULFILL SAFE ERROR:", err);
    return { success: false, reason: "SYSTEM_ERROR", error: err };
  }
}

module.exports = router;