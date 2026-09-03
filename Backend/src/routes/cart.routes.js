// Backend/src/routes/cart.routes.js
const express = require("express");
const crypto = require("crypto");
const { z } = require("zod");
const prisma = require("../lib/prisma");
const { optionalAuth } = require("../middleware/auth");
const { rialToToman } = require("../lib/pricing");

const router = express.Router();

const CART_COOKIE = "cart_token";
const CART_COOKIE_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;

/**
 * بازیابی یا ساخت سبد خرید همراه با ادغام هوشمند سبد مهمان پس از لاگین
 */
async function resolveCart(req, res) {
  const guestToken = req.cookies?.[CART_COOKIE];

  // حالت ۱: کاربر لاگین شده است
  if (req.user) {
    const userId = req.user.userId || req.user.id;

    let userCart = await prisma.cart.findFirst({
      where: { userId, status: "ACTIVE" },
      include: { items: true },
    });

    if (!userCart) {
      userCart = await prisma.cart.create({
        data: { userId, status: "ACTIVE" },
        include: { items: true },
      });
    }

    // ادغام سبد خرید مهمان در سبد خرید کاربر در صورت وجود
    if (guestToken) {
      const guestCart = await prisma.cart.findFirst({
        where: { guestToken, status: "ACTIVE" },
        include: { items: true },
      });

      if (guestCart && guestCart.id !== userCart.id) {
        if (guestCart.items.length > 0) {
          const userVariantIds = new Set(userCart.items.map((i) => i.variantId));

          for (const gItem of guestCart.items) {
            // جلوگیری از اضافه شدن واریانت تکراری
            if (!userVariantIds.has(gItem.variantId)) {
              await prisma.cartItem.create({
                data: {
                  cartId: userCart.id,
                  productId: gItem.productId,
                  variantId: gItem.variantId,
                  quantity: 1,
                  unitPriceRial: gItem.unitPriceRial,
                },
              });
              userVariantIds.add(gItem.variantId);
            }
          }
        }

        // تبدیل سبد مهمان و پاکسازی کوکی مهمان
        await prisma.cart.update({
          where: { id: guestCart.id },
          data: { status: "CONVERTED" },
        });
        res.clearCookie(CART_COOKIE, { path: "/" });
      }
    }

    return userCart;
  }

  // حالت ۲: کاربر مهمان است
  if (guestToken) {
    const existing = await prisma.cart.findFirst({
      where: { guestToken, status: "ACTIVE" },
      include: { items: true },
    });
    if (existing) return existing;
  }

  const newGuestToken = crypto.randomUUID();
  const newCart = await prisma.cart.create({
    data: { guestToken: newGuestToken, status: "ACTIVE" },
    include: { items: true },
  });

  res.cookie(CART_COOKIE, newGuestToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: CART_COOKIE_MAX_AGE_MS,
    path: "/",
  });

  return newCart;
}

/**
 * تبدیل امن دیتای سبد برای جلوگیری از ارور سریالایز BigInt
 */
function serializeCart(cart) {
  if (!cart || !cart.items) {
    return { id: null, items: [], totalCount: 0, totalPriceToman: 0 };
  }

  const mappedItems = cart.items.map((it) => ({
    id: it.id,
    productSlug: it.product?.slug || "",
    productTitle: it.product?.title || "",
    productImage: it.product?.mainImage || "",
    variantId: it.variantId,
    variantName: it.variant?.name || "",
    unitPriceRial: it.unitPriceRial.toString(),
    unitPriceToman: rialToToman(it.unitPriceRial),
    quantity: 1,
  }));

  const totalPriceToman = mappedItems.reduce((sum, item) => sum + item.unitPriceToman, 0);

  return {
    id: cart.id,
    items: mappedItems,
    totalCount: mappedItems.length,
    totalPriceToman,
  };
}

// دریافت اقلام سبد خرید
router.get("/", optionalAuth, async (req, res) => {
  try {
    const cartStub = await resolveCart(req, res);
    const cart = await prisma.cart.findUnique({
      where: { id: cartStub.id },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });
    return res.json(serializeCart(cart));
  } catch (err) {
    console.error("GET CART ERROR:", err);
    return res.status(500).json({ error: "خطا در دریافت اطلاعات سبد خرید." });
  }
});

const addItemSchema = z.object({
  productId: z.string().uuid("شناسه محصول نامعتبر است."),
  variantId: z.string().uuid("شناسه پلن نامعتبر است."),
});

// افزودن آیتم به سبد خرید
router.post("/items", optionalAuth, async (req, res) => {
  const parsed = addItemSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "اطلاعات پلن ارسالی نامعتبر است." });
  }
  const { productId, variantId } = parsed.data;

  try {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });

    if (!variant || variant.productId !== productId || !variant.isActive || !variant.product.isActive) {
      return res.status(404).json({ error: "این پلن یافت نشد یا در حال حاضر غیرفعال است." });
    }

    if (variant.priceRial === null || variant.priceRial === undefined) {
      return res.status(409).json({ error: "قیمت‌گذاری این پلن هنوز انجام نشده است." });
    }

    // استعلام لحظه‌ای موجودی انبار
    const availableInventory = await prisma.accountInventory.count({
      where: { variantId, status: "AVAILABLE" },
    });

    if (availableInventory === 0) {
      return res.status(400).json({ error: "متأسفانه موجودی این اکانت به اتمام رسیده است." });
    }

    const cart = await resolveCart(req, res);

    const existing = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, variantId },
    });

    if (existing) {
      return res.status(400).json({ error: "این پلن قبلاً به سبد خرید شما اضافه شده است." });
    }

    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        variantId,
        quantity: 1,
        unitPriceRial: variant.priceRial,
      },
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: true, variant: true } } },
    });

    return res.status(201).json(serializeCart(updatedCart));
  } catch (err) {
    console.error("ADD CART ITEM ERROR:", err);
    return res.status(500).json({ error: "خطا در افزودن آیتم به سبد خرید." });
  }
});

// حذف تکی از سبد خرید
router.delete("/items/:itemId", optionalAuth, async (req, res) => {
  try {
    const cart = await resolveCart(req, res);
    await prisma.cartItem.deleteMany({
      where: { id: req.params.itemId, cartId: cart.id },
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: true, variant: true } } },
    });

    return res.json(serializeCart(updatedCart));
  } catch (err) {
    console.error("REMOVE CART ITEM ERROR:", err);
    return res.status(500).json({ error: "خطا در حذف آیتم از سبد خرید." });
  }
});

// خالی کردن کل سبد خرید
router.delete("/", optionalAuth, async (req, res) => {
  try {
    const cart = await resolveCart(req, res);
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    return res.json({ ok: true, message: "سبد خرید با موفقیت خالی شد." });
  } catch (err) {
    console.error("CLEAR CART ERROR:", err);
    return res.status(500).json({ error: "خطا در خالی کردن سبد خرید." });
  }
});

module.exports = router;