// Backend/src/routes/order.routes.js
const express = require("express");
const { z } = require("zod");
const prisma = require("../lib/prisma");
const { optionalAuth } = require("../middleware/auth");
const { calculateOrderTotals } = require("../lib/pricing");
const { writeAuditLog } = require("../lib/audit");

const router = express.Router();

const createOrderSchema = z.object({
  mobile: z.string().regex(/^09\d{9}$/, "شماره موبایل معتبر نیست."),
  telegramId: z.string().optional().nullable(),
  fullName: z.string().optional().nullable(),
  orderLevelDiscountCode: z.string().optional().nullable(),
});

router.post("/", optionalAuth, async (req, res) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "اطلاعات فرم نامعتبر است." });
  }
  const { mobile, telegramId, fullName, orderLevelDiscountCode } = parsed.data;

  const cartToken = req.cookies?.cart_token;
  const cart = await prisma.cart.findFirst({
    where: req.user
      ? { userId: req.user.userId, status: "ACTIVE" }
      : { guestToken: cartToken, status: "ACTIVE" },
    include: { items: true },
  });

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ error: "سبد خرید شما خالی است." });
  }

  try {
    // Prepare items for pricing - item-level discounts are ignored; only order-level code will be applied
    const itemsForPricing = cart.items.map((it) => ({ variantId: it.variantId }));
    const totals = await calculateOrderTotals(itemsForPricing, orderLevelDiscountCode);

    const user = await prisma.user.upsert({
      where: { mobile },
      update: fullName ? { fullName } : {},
      create: { mobile, fullName: fullName || null },
    });

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          cartId: cart.id,
          userId: user.id,
          mobile,
          telegramId: telegramId || null,
          fullName: fullName || null,
          status: "PENDING_PAYMENT",
          subtotalRial: totals.subtotalRial,
          discountRial: totals.discountRial,
          totalRial: totals.totalRial,
          discountCodeId: totals.appliedOrderDiscountId || null, // رفع باگ ثبت نشدن آیدی
          items: {
            create: totals.resolvedItems.map((it) => ({
              productId: it.productId,
              variantId: it.variantId,
              productTitleSnapshot: it.productTitleSnapshot,
              variantNameSnapshot: it.variantNameSnapshot,
              unitPriceRial: it.unitPriceRial,
              quantity: 1, // همیشه ۱
            })),
          },
        },
        include: { items: true },
      });

      await tx.cart.update({ where: { id: cart.id }, data: { status: "CONVERTED" } });

      return newOrder;
    });

    await writeAuditLog({
      orderId: order.id,
      entityType: "order",
      entityId: order.id,
      action: "order_created",
      newStatus: "PENDING_PAYMENT",
      actorType: req.user ? "USER" : "SYSTEM",
      actorId: req.user?.userId || null,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    return res.status(201).json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalToman: totals.totalToman,
      subtotalToman: Number(totals.subtotalRial / 10n),
      discountToman: Number(totals.discountRial / 10n),
    });
  } catch (err) {
    const knownErrors = [
      "VARIANT_PRICE_TBD",
      "VARIANT_NOT_FOUND",
      "DISCOUNT_INVALID",
      "DISCOUNT_EXPIRED",
      "DISCOUNT_EXHAUSTED",
      "EMPTY_CART",
    ];
    if (knownErrors.includes(err.code)) {
      return res.status(400).json({ error: err.message, code: err.code });
    }
    console.error(err);
    return res.status(500).json({ error: "خطای غیرمنتظره در ثبت سفارش." });
  }
});

router.get("/:orderNumber", async (req, res) => {
  const mobile = req.query.mobile;
  const order = await prisma.order.findUnique({
    where: { orderNumber: req.params.orderNumber },
    include: { items: true, payments: true },
  });
  if (!order || order.mobile !== mobile) {
    return res.status(404).json({ error: "سفارش یافت نشد." });
  }
  res.json(order);
});

module.exports = router;