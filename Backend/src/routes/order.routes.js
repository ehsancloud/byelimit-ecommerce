// src/routes/order.routes.js
const express = require("express");
const { z } = require("zod");
const prisma = require("../lib/prisma");
const { optionalAuth, requireAuth } = require("../middleware/auth");
const authMiddleware = require("../middlewares/auth.middleware");
const { calculateOrderTotals } = require("../lib/pricing");
const { writeAuditLog } = require("../lib/audit");
const { rialToToman } = require("../lib/pricing");
const { decryptCredentials } = require("../lib/crypto");

const router = express.Router();

const createOrderSchema = z.object({
  mobile: z.string().regex(/^09\d{9}$/, "شماره موبایل معتبر نیست."),
  telegramId: z.string().optional().nullable(),
  fullName: z.string().optional().nullable(),
  orderLevelDiscountCode: z.string().optional().nullable(),
});

// وضعیت‌های قابل‌نمایش در پنل کاربری
const STATUS_LABEL = {
  PENDING_PAYMENT: "در انتظار پرداخت",
  PAID: "پرداخت‌شده",
  DELIVERED: "تحویل‌شده",
  FAILED: "ناموفق",
  REFUNDED: "مسترد شده",
  CANCELLED: "لغو‌شده",
};

router.post("/quote", optionalAuth, async (req, res) => {
  const code = typeof req.body?.orderLevelDiscountCode === "string"
    ? req.body.orderLevelDiscountCode.trim().toUpperCase()
    : null;
  const cart = await prisma.cart.findFirst({
    where: req.user
      ? { userId: req.user.userId, status: "ACTIVE" }
      : { guestToken: req.cookies?.cart_token, status: "ACTIVE" },
    include: { items: true },
  });
  try {
    const totals = await calculateOrderTotals(cart?.items || [], code || null);
    return res.json({
      subtotalToman: Number(totals.subtotalRial / 10n),
      discountToman: Number(totals.discountRial / 10n),
      totalToman: Number(totals.totalRial / 10n),
      appliedCode: code,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message, code: err.code || "QUOTE_FAILED" });
  }
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
    const itemsForPricing = cart.items.map((it) => ({ variantId: it.variantId }));
    const totals = await calculateOrderTotals(itemsForPricing, orderLevelDiscountCode?.trim().toUpperCase() || null);

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
          discountCodeId: totals.appliedOrderDiscountId || null,
          items: {
            create: totals.resolvedItems.map((it) => ({
              productId: it.productId,
              variantId: it.variantId,
              productTitleSnapshot: it.productTitleSnapshot,
              variantNameSnapshot: it.variantNameSnapshot,
              addOnNameSnapshot: it.addOnNameSnapshot || null,
              addOnPriceRial: it.addOnPriceRial || null,
              unitPriceRial: it.unitPriceRial,
              quantity: 1,
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
      actorType: "USER",
      ipAddress: req.ip,
      metadata: { mobile, itemCount: order.items.length },
    });

    return res.status(201).json({ orderId: order.id, orderNumber: order.orderNumber });
  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);
    return res.status(500).json({ error: "خطا در ثبت سفارش. لطفاً دوباره تلاش کنید." });
  }
});

// ✅ NEW: دریافت سفارشات کاربر لاگین‌شده برای پنل کاربری
router.get("/mine", authMiddleware, async (req, res) => {
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
                credentialsEncrypted: true, // ادمین باید این را در Prisma Studio وارد کند
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

    const result = orders.map((order) => ({
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
        addOnName: item.addOnNameSnapshot || null,
        // رمزگشایی سمت سرور (در صورت ذخیره‌سازی رمزنگاری‌شده AES)
        credentials:
          item.assignedAccount?.status === "SOLD"
            ? decryptCredentials(item.assignedAccount?.credentialsEncrypted)
            : null,
        accountStatus: item.assignedAccount?.status || null,
      })),
    }));

    return res.json(result);
  } catch (err) {
    console.error("GET ORDERS ERROR:", err);
    return res.status(500).json({ error: "خطا در دریافت سفارشات." });
  }
});

// ✅ NEW: دریافت تک‌سفارش برای صفحه موفقیت پرداخت و نمایش کد تحویل.
// امنیت: شماره سفارش UUID غیرقابل‌حدس + تطبیق دقیق شماره موبایل خریدار الزامی است.
router.get("/:orderNumber", async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const mobile = String(req.query.mobile || "").replace(/\D/g, "");

    if (!orderNumber || !mobile) {
      return res.status(400).json({ error: "اطلاعات سفارش ناقص است." });
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            assignedAccount: {
              select: { credentialsEncrypted: true, status: true },
            },
          },
        },
        payments: {
          where: { status: "VERIFIED" },
          select: { refId: true, verifiedAt: true, cardPanMasked: true, gateway: true },
          take: 1,
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: "سفارش یافت نشد." });
    }

    // تطبیق موبایل خریدار - بدون آن هیچ اطلاعاتی فاش نمی‌شود
    if (order.mobile.replace(/\D/g, "") !== mobile) {
      return res.status(403).json({ error: "شماره موبایل با سفارش مطابقت ندارد." });
    }

    const isFinalized = order.status === "PAID" || order.status === "DELIVERED";

    return res.json({
      orderNumber: order.orderNumber,
      status: order.status,
      statusLabel: STATUS_LABEL[order.status] || order.status,
      totalRial: order.totalRial.toString(),
      createdAt: order.createdAt,
      payment: order.payments[0] || null,
      items: order.items.map((item) => ({
        id: item.id,
        productTitle: item.productTitleSnapshot,
        variantName: item.variantNameSnapshot,
        addOnName: item.addOnNameSnapshot || null,
        // کد تحویل فقط برای سفارشات نهایی‌شده و اکانت فروخته‌شده
        credentials:
          isFinalized && item.assignedAccount?.status === "SOLD"
            ? decryptCredentials(item.assignedAccount?.credentialsEncrypted)
            : null,
        accountStatus: item.assignedAccount?.status || null,
      })),
    });
  } catch (err) {
    console.error("GET SINGLE ORDER ERROR:", err);
    return res.status(500).json({ error: "خطا در دریافت سفارش." });
  }
});

module.exports = router;
