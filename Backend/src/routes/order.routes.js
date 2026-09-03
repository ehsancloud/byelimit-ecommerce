// Backend/src/routes/order.routes.js
const express = require("express");
const { z } = require("zod");
const prisma = require("../lib/prisma");
const { optionalAuth, requireAuth } = require("../middleware/auth");
const { calculateOrderTotals, rialToToman } = require("../lib/pricing");
const { writeAuditLog } = require("../lib/audit");

const router = express.Router();

const STATUS_LABEL = {
  PENDING_PAYMENT: "در انتظار پرداخت",
  PAID: "پرداخت‌شده و فعال",
  DELIVERED: "تحویل داده شده",
  FAILED: "ناموفق",
  REFUNDED: "مسترد شده",
  CANCELLED: "لغوشده",
};

const createOrderSchema = z.object({
  mobile: z.string().regex(/^09\d{9}$/, "شماره موبایل باید ۱۱ رقم و با 09 آغاز شود."),
  telegramId: z.string().max(64).optional().nullable(),
  fullName: z.string().max(100).optional().nullable(),
  orderLevelDiscountCode: z.string().max(32).optional().nullable(),
});

// پیش‌استعلام قیمت و فاکتور سبد خرید
router.post("/quote", optionalAuth, async (req, res) => {
  const code = typeof req.body?.orderLevelDiscountCode === "string"
    ? req.body.orderLevelDiscountCode.trim().toUpperCase()
    : null;

  try {
    const userId = req.user ? (req.user.userId || req.user.id) : null;
    const cartToken = req.cookies?.cart_token;

    const cart = await prisma.cart.findFirst({
      where: userId
        ? { userId, status: "ACTIVE" }
        : { guestToken: cartToken, status: "ACTIVE" },
      include: { items: true },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "سبد خرید شما خالی است.", code: "EMPTY_CART" });
    }

    const totals = await calculateOrderTotals(cart.items, code);

    return res.json({
      subtotalToman: totals.subtotalToman,
      discountToman: totals.discountToman,
      totalToman: totals.totalToman,
      appliedCode: totals.discountCode,
      isFree: totals.totalRial === 0n,
    });
  } catch (err) {
    return res.status(400).json({
      error: err.message || "خطا در محاسبه پیش‌فاکتور.",
      code: err.code || "QUOTE_FAILED",
    });
  }
});

// ثبت یا بازیابی هوشمند سفارش
router.post("/", optionalAuth, async (req, res) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || "اطلاعات ارسالی نامعتبر است." });
  }

  const { telegramId, fullName, orderLevelDiscountCode } = parsed.data;
  const mobile = req.user?.mobile || parsed.data.mobile;
  const userId = req.user ? (req.user.userId || req.user.id) : null;
  const cartToken = req.cookies?.cart_token;

  const cart = await prisma.cart.findFirst({
    where: userId
      ? { userId, status: "ACTIVE" }
      : { guestToken: cartToken, status: "ACTIVE" },
    include: { items: true },
  });

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ error: "سبد خرید شما خالی است و امکان ثبت سفارش وجود ندارد." });
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const totals = await calculateOrderTotals(cart.items, orderLevelDiscountCode, tx);

      const user = await tx.user.upsert({
        where: { mobile },
        update: {
          fullName: fullName ? fullName.trim() : undefined,
          telegramId: telegramId ? telegramId.trim() : undefined,
        },
        create: {
          mobile,
          fullName: fullName ? fullName.trim() : null,
          telegramId: telegramId ? telegramId.trim() : null,
        },
      });

      // ۱. بررسی سفارش‌های قبلی ثبت‌شده برای جلوگیری از تداخل cartId
      const existingOrder = await tx.order.findFirst({
        where: {
          OR: [
            { cartId: cart.id },
            { userId: user.id, status: "PENDING_PAYMENT" },
          ],
        },
        orderBy: { createdAt: "desc" },
        include: { items: true },
      });

      let targetOrder = null;

      if (existingOrder && existingOrder.status === "PENDING_PAYMENT") {
        // بروزرسانی فاکتور قبلی با اقلام و مبالغ جدید سبد خرید
        await tx.orderItem.deleteMany({ where: { orderId: existingOrder.id } });

        targetOrder = await tx.order.update({
          where: { id: existingOrder.id },
          data: {
            userId: user.id,
            mobile,
            telegramId: telegramId ? telegramId.trim() : null,
            fullName: fullName ? fullName.trim() : user.fullName,
            subtotalRial: totals.subtotalRial,
            discountRial: totals.discountRial,
            totalRial: totals.totalRial,
            discountCodeId: totals.appliedOrderDiscountId,
            status: totals.totalRial === 0n ? "PAID" : "PENDING_PAYMENT",
            items: {
              create: totals.resolvedItems.map((it) => ({
                productId: it.productId,
                variantId: it.variantId,
                productTitleSnapshot: it.productTitleSnapshot,
                variantNameSnapshot: it.variantNameSnapshot,
                unitPriceRial: it.unitPriceRial,
                quantity: 1,
              })),
            },
          },
          include: { items: true },
        });
      }

      // ۲. در صورتی که سفارشی وجود نداشت یا وضعیت سفارش قبلی PENDING_PAYMENT نبود
      if (!targetOrder) {
        const orderNumber = `BL-${Math.floor(100000 + Math.random() * 900000)}`;

        try {
          // تلاش اول: ساخت سفارش به همراه شناسه سبد خرید
          targetOrder = await tx.order.create({
            data: {
              orderNumber,
              cartId: cart.id,
              userId: user.id,
              mobile,
              telegramId: telegramId ? telegramId.trim() : null,
              fullName: fullName ? fullName.trim() : user.fullName,
              status: totals.totalRial === 0n ? "PAID" : "PENDING_PAYMENT",
              subtotalRial: totals.subtotalRial,
              discountRial: totals.discountRial,
              totalRial: totals.totalRial,
              discountCodeId: totals.appliedOrderDiscountId,
              items: {
                create: totals.resolvedItems.map((it) => ({
                  productId: it.productId,
                  variantId: it.variantId,
                  productTitleSnapshot: it.productTitleSnapshot,
                  variantNameSnapshot: it.variantNameSnapshot,
                  unitPriceRial: it.unitPriceRial,
                  quantity: 1,
                })),
              },
            },
            include: { items: true },
          });
        } catch (createErr) {
          // ۳. مکانیزم عبور از خطای یکتایی (P2002): ساخت سفارش بدون ارجاع انحصاری cartId
          if (createErr.code === "P2002") {
            targetOrder = await tx.order.create({
              data: {
                orderNumber: `BL-${Math.floor(100000 + Math.random() * 900000)}`,
                cartId: null, // مقدار null توسط دیتابیس پذیرفته می‌شود و خطای یکتایی نخواهد داد
                userId: user.id,
                mobile,
                telegramId: telegramId ? telegramId.trim() : null,
                fullName: fullName ? fullName.trim() : user.fullName,
                status: totals.totalRial === 0n ? "PAID" : "PENDING_PAYMENT",
                subtotalRial: totals.subtotalRial,
                discountRial: totals.discountRial,
                totalRial: totals.totalRial,
                discountCodeId: totals.appliedOrderDiscountId,
                items: {
                  create: totals.resolvedItems.map((it) => ({
                    productId: it.productId,
                    variantId: it.variantId,
                    productTitleSnapshot: it.productTitleSnapshot,
                    variantNameSnapshot: it.variantNameSnapshot,
                    unitPriceRial: it.unitPriceRial,
                    quantity: 1,
                  })),
                },
              },
              include: { items: true },
            });
          } else {
            throw createErr;
          }
        }
      }

      // ۴. مدیریت سفارش‌های رایگان
      if (totals.totalRial === 0n) {
        for (const item of targetOrder.items) {
          const rows = await tx.$queryRaw`
            SELECT id FROM account_inventory
            WHERE variant_id = ${item.variantId}::text AND status = 'AVAILABLE'
            LIMIT 1 FOR UPDATE SKIP LOCKED
          `;
          if (rows && rows.length > 0) {
            const accountId = rows[0].id;
            await tx.accountInventory.update({
              where: { id: accountId },
              data: { status: "SOLD", reservedForOrderId: targetOrder.id, soldAt: new Date() },
            });
            await tx.orderItem.update({
              where: { id: item.id },
              data: { assignedAccountId: accountId },
            });
          }
        }

        if (totals.appliedOrderDiscountId) {
          await tx.discountCode.update({
            where: { id: totals.appliedOrderDiscountId },
            data: { usedCount: { increment: 1 } },
          });
        }

        await tx.cart.update({ where: { id: cart.id }, data: { status: "CONVERTED" } });
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      }

      return targetOrder;
    });

    await writeAuditLog({
      orderId: order.id,
      entityType: "order",
      entityId: order.id,
      action: order.totalRial === 0n ? "order_free_fulfilled" : "order_created_or_updated",
      newStatus: order.status,
      actorType: "USER",
      ipAddress: req.ip,
      metadata: {
        mobile,
        totalToman: rialToToman(order.totalRial),
        isFree: order.totalRial === 0n,
      },
    });

    return res.status(201).json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      isFree: order.totalRial === 0n,
      totalToman: rialToToman(order.totalRial),
    });
  } catch (err) {
    console.error("CREATE ORDER CRITICAL ERROR:", err);
    return res.status(400).json({
      error: err.message || "خطا در ثبت سفارش. لطفاً دوباره تلاش کنید.",
      code: err.code || "ORDER_CREATION_FAILED",
    });
  }
});

// دریافت سفارشات اختصاصی کاربر لاگین‌شده
router.get("/mine", requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            assignedAccount: {
              select: {
                id: true,
                credentialsEncrypted: true,
                status: true,
              },
            },
          },
        },
        payments: {
          where: { status: "VERIFIED" },
          select: { refId: true, verifiedAt: true, cardPanMasked: true },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = orders.map((order) => {
      const isFulfilled = order.status === "PAID" || order.status === "DELIVERED";

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        statusLabel: STATUS_LABEL[order.status] || order.status,
        totalToman: rialToToman(order.totalRial),
        createdAt: order.createdAt,
        payment: order.payments[0] || null,
        items: order.items.map((item) => ({
          id: item.id,
          productTitle: item.productTitleSnapshot,
          variantName: item.variantNameSnapshot,
          credentials: isFulfilled ? item.assignedAccount?.credentialsEncrypted || null : null,
          accountStatus: isFulfilled ? item.assignedAccount?.status || null : null,
        })),
      };
    });

    return res.json(result);
  } catch (err) {
    console.error("GET MY ORDERS ERROR:", err);
    return res.status(500).json({ error: "خطا در دریافت لیست سفارشات." });
  }
});

module.exports = router;