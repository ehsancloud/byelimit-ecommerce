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
const CLAUDE_SECURE_ADDON_RIAL = 14950000n; // ۱۴,۹۵۰,۰۰۰ ریال معادل ۱,۴۹۵,۰۰۰ تومان

async function resolveCart(req, res) {
  const guestToken = req.cookies?.[CART_COOKIE];

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

    if (guestToken) {
      const guestCart = await prisma.cart.findFirst({
        where: { guestToken, status: "ACTIVE" },
        include: { items: true },
      });

      if (guestCart && guestCart.id !== userCart.id) {
        if (guestCart.items.length > 0) {
          const userItemKeys = new Set(
            userCart.items.map((i) => `${i.variantId}_${Boolean(i.hasSecureAddon)}`)
          );

          for (const gItem of guestCart.items) {
            const key = `${gItem.variantId}_${Boolean(gItem.hasSecureAddon)}`;
            if (!userItemKeys.has(key)) {
              await prisma.cartItem.create({
                data: {
                  cartId: userCart.id,
                  productId: gItem.productId,
                  variantId: gItem.variantId,
                  quantity: 1,
                  unitPriceRial: gItem.unitPriceRial,
                  hasSecureAddon: gItem.hasSecureAddon || false,
                  addonPriceRial: gItem.addonPriceRial || 0n,
                },
              });
              userItemKeys.add(key);
            }
          }
        }

        await prisma.cart.update({
          where: { id: guestCart.id },
          data: { status: "CONVERTED" },
        });
        res.clearCookie(CART_COOKIE, { path: "/" });
      }
    }

    return userCart;
  }

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

function serializeCart(cart) {
  if (!cart || !cart.items) {
    return { id: null, items: [], totalCount: 0, totalPriceToman: 0 };
  }

  const mappedItems = cart.items.map((it) => {
    const basePriceRial =
      it.variant?.priceRial !== undefined && it.variant?.priceRial !== null
        ? it.variant.priceRial
        : it.unitPriceRial;

    const addonRial = it.hasSecureAddon ? (it.addonPriceRial || CLAUDE_SECURE_ADDON_RIAL) : 0n;
    const finalItemPriceRial = basePriceRial + addonRial;

    return {
      id: it.id,
      productSlug: it.product?.slug || "",
      productTitle: it.product?.title || "",
      productImage: it.product?.mainImage || "",
      variantId: it.variantId,
      variantName: it.variant?.name || "",
      hasSecureAddon: Boolean(it.hasSecureAddon),
      addonPriceToman: rialToToman(addonRial),
      unitPriceRial: finalItemPriceRial.toString(),
      unitPriceToman: rialToToman(finalItemPriceRial),
      quantity: 1,
      isActive: Boolean(it.product?.isActive && it.variant?.isActive),
    };
  });

  const totalPriceToman = mappedItems.reduce((sum, item) => sum + item.unitPriceToman, 0);

  return {
    id: cart.id,
    items: mappedItems,
    totalCount: mappedItems.length,
    totalPriceToman,
  };
}

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

    if (!cart) {
      return res.json({ id: null, items: [], totalCount: 0, totalPriceToman: 0 });
    }

    const syncPromises = [];
    for (const item of cart.items) {
      if (item.variant && item.variant.priceRial && item.unitPriceRial !== item.variant.priceRial) {
        syncPromises.push(
          prisma.cartItem.update({
            where: { id: item.id },
            data: { unitPriceRial: item.variant.priceRial },
          })
        );
        item.unitPriceRial = item.variant.priceRial;
      }
    }

    if (syncPromises.length > 0) {
      await Promise.all(syncPromises);
    }

    return res.json(serializeCart(cart));
  } catch (err) {
    console.error("GET CART ERROR:", err);
    return res.status(500).json({ error: "خطا در دریافت اطلاعات سبد خرید." });
  }
});

const addItemSchema = z.object({
  productId: z.string().uuid("شناسه محصول نامعتبر است."),
  variantId: z.string().uuid("شناسه پلن نامعتبر است."),
  hasSecureAddon: z.boolean().optional().default(false),
  addonPriceToman: z.number().optional().default(0),
});

router.post("/items", optionalAuth, async (req, res) => {
  const parsed = addItemSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "اطلاعات ارسالی نامعتبر است." });
  }
  const { productId, variantId } = parsed.data;
  const hasSecureAddon = Boolean(parsed.data.hasSecureAddon);
  const addonPriceRial = hasSecureAddon
    ? BigInt(Math.round((parsed.data.addonPriceToman || 1495000) * 10))
    : 0n;

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

    const cart = await resolveCart(req, res);

    const existing = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, variantId, hasSecureAddon },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { unitPriceRial: variant.priceRial, addonPriceRial },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId,
          quantity: 1,
          unitPriceRial: variant.priceRial,
          hasSecureAddon,
          addonPriceRial,
        },
      });
    }

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