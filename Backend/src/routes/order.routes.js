// Backend/src/routes/order.routes.js
const express = require("express");
const crypto = require("crypto");
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

async function generateUniqueOrderNumber(tx) {
  const PREFIX = "BL-";
  for (let attempt = 0; attempt < 5; attempt++) {
    const random8Digit = crypto.randomInt(10000000, 100000000).toString();
    const candidate = `${PREFIX}${random8Digit}`;

    const exists = await tx.order.findUnique({
      where: { orderNumber: candidate },
      select: { id: true },
    });

    if (!exists) return candidate;
  }

  const timeSuffix = Date.now().toString().slice(-4);
  const randSuffix = crypto.randomInt(1000, 10000).toString();
  return `${PREFIX}${timeSuffix}${randSuffix}`;
}

const createOrderSchema = z.object({
  mobile: z.string().regex(/^09\d{9}$/, "شماره موبایل باید ۱۱ رقم و با 09 آغاز شود."),
  telegramId: z.string().max(64).optional().nullable(),
  fullName: z.string().max(100).optional().nullable(),
  orderLevelDiscountCode: z.string().max(32).optional().nullable(),
});

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
                hasSecureAddon: it.hasSecureAddon,
                addonPriceRial: it.addonPriceRial,
                quantity: 1,
              })),
            },
          },
          include: { items: true },
        });
      }

      if (!targetOrder) {
        const orderNumber = await generateUniqueOrderNumber(tx);

        try {
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
                  hasSecureAddon: it.hasSecureAddon,
                  addonPriceRial: it.addonPriceRial,
                  quantity: 1,
                })),
              },
            },
            include: { items: true },
          });
        } catch (createErr) {
          if (createErr.code === "P2002") {
            const fallbackOrderNumber = await generateUniqueOrderNumber(tx);
            targetOrder = await tx.order.create({
              data: {
                orderNumber: fallbackOrderNumber,
                cartId: null,
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
                    hasSecureAddon: it.hasSecureAddon,
                    addonPriceRial: it.addonPriceRial,
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

      if (totals.totalRial === 0n) {
        for (const item of targetOrder.items) {
          const availableAccount = await tx.accountInventory.findFirst({
            where: { variantId: item.variantId, status: "AVAILABLE" },
          });
          if (availableAccount) {
            await tx.accountInventory.update({
              where: { id: availableAccount.id },
              data: { status: "SOLD", reservedForOrderId: targetOrder.id, soldAt: new Date() },
            });
            await tx.orderItem.update({
              where: { id: item.id },
              data: { assignedAccountId: availableAccount.id },
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
    console.error("CREATE ORDER ERROR:", err);
    return res.status(400).json({
      error: err.message || "خطا در ثبت سفارش. لطفاً دوباره تلاش کنید.",
      code: err.code || "ORDER_CREATION_FAILED",
    });
  }
});

router.get("/mine", requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const userMobile = req.user.mobile;

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { userId },
          ...(userMobile ? [{ mobile: userMobile }] : []),
        ],
      },
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
          hasSecureAddon: Boolean(item.hasSecureAddon),
          addonPriceToman: rialToToman(item.addonPriceRial),
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

router.get("/:orderNumber", async (req, res, next) => {
  if (req.params.orderNumber === "mine") return next();

  try {
    const { orderNumber } = req.params;
    const { mobile } = req.query;

    const order = await prisma.order.findFirst({
      where: {
        orderNumber,
        ...(mobile ? { mobile: String(mobile).trim() } : {}),
      },
      include: {
        items: true,
        payments: {
          where: { status: "VERIFIED" },
          select: { refId: true, verifiedAt: true, cardPanMasked: true },
          take: 1,
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: "سفارش مورد نظر یافت نشد." });
    }

    return res.json({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      statusLabel: STATUS_LABEL[order.status] || order.status,
      mobile: order.mobile,
      fullName: order.fullName,
      totalRial: order.totalRial.toString(),
      totalToman: rialToToman(order.totalRial),
      createdAt: order.createdAt,
      payment: order.payments[0] || null,
      items: order.items.map((it) => ({
        id: it.id,
        productTitle: it.productTitleSnapshot,
        variantName: it.variantNameSnapshot,
        hasSecureAddon: Boolean(it.hasSecureAddon),
        addonPriceToman: rialToToman(it.addonPriceRial),
        unitPriceToman: rialToToman(it.unitPriceRial),
        quantity: it.quantity,
      })),
    });
  } catch (err) {
    console.error("GET ORDER BY NUMBER ERROR:", err);
    return res.status(500).json({ error: "خطا در بازیابی مشخصات سفارش." });
  }
});

module.exports = router;