// Backend/src/routes/cart.routes.js
const express = require("express");
const crypto = require("crypto");
const { z } = require("zod");
const prisma = require("../lib/prisma");
const { optionalAuth } = require("../middleware/auth");

const router = express.Router();

const CART_COOKIE = "cart_token";
const CART_COOKIE_MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;

async function resolveCart(req, res) {
  if (req.user) {
    let cart = await prisma.cart.findFirst({
      where: { userId: req.user.userId, status: "ACTIVE" },
    });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: req.user.userId } });
    }
    return cart;
  }

  let guestToken = req.cookies?.[CART_COOKIE];
  if (guestToken) {
    const existing = await prisma.cart.findFirst({
      where: { guestToken, status: "ACTIVE" },
    });
    if (existing) return existing;
  }

  guestToken = crypto.randomUUID();
  const cart = await prisma.cart.create({ data: { guestToken } });
  res.cookie(CART_COOKIE, guestToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: CART_COOKIE_MAX_AGE_MS,
  });
  return cart;
}

function serializeCart(cart) {
  return {
    id: cart.id,
    items: cart.items.map((it) => ({
      id: it.id,
      productSlug: it.product.slug,
      productTitle: it.product.title,
      productImage: it.product.mainImage,
      variantId: it.variantId,
      variantName: it.variant.name,
      unitPriceRial: it.unitPriceRial.toString(),
      quantity: 1, // همیشه 1
    })),
  };
}

router.get("/", optionalAuth, async (req, res) => {
  const cartStub = await resolveCart(req, res);
  const cart = await prisma.cart.findUnique({
    where: { id: cartStub.id },
    include: { items: { include: { product: true, variant: true } } },
  });
  res.json(serializeCart(cart));
});

const addItemSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid(),
});

router.post("/items", optionalAuth, async (req, res) => {
  const parsed = addItemSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "اطلاعات آیتم سبد خرید نامعتبر است." });
  }
  const { productId, variantId } = parsed.data;

  const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
  if (!variant || variant.productId !== productId || !variant.isActive) {
    return res.status(404).json({ error: "این پلن یافت نشد یا دیگر فعال نیست." });
  }
  if (variant.priceRial == null) {
    return res.status(409).json({ error: "قیمت این پلن هنوز نهایی نشده و قابل خرید نیست." });
  }

  const cart = await resolveCart(req, res);

  // اگر کاربر قبلاً این اکانت را به سبد اضافه کرده، خطا می‌دهیم (امکان انتخاب تعداد نداریم)
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
  res.status(201).json(serializeCart(updatedCart));
});

router.delete("/items/:itemId", optionalAuth, async (req, res) => {
  const cart = await resolveCart(req, res);
  await prisma.cartItem.deleteMany({
    where: { id: req.params.itemId, cartId: cart.id },
  });

  const updatedCart = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { product: true, variant: true } } },
  });
  res.json(serializeCart(updatedCart));
});

router.delete("/", optionalAuth, async (req, res) => {
  const cart = await resolveCart(req, res);
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  res.json({ ok: true });
});

module.exports = router;