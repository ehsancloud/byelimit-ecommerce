// src/routes/flashdeal.routes.js
// پیشنهادات ویژه - قابل تنظیم از Prisma Studio (مدل FlashDeal)
const express = require("express");
const prisma = require("../lib/prisma");
const { rialToToman } = require("../lib/pricing");

const router = express.Router();

/**
 * GET /api/flash-deals
 * لیست پیشنهادات ویژه فعال با اطلاعات محصول و تایمر
 * قابل تنظیم از Prisma Studio: مدل FlashDeal
 */
router.get("/", async (req, res) => {
  try {
    const deals = await prisma.flashDeal.findMany({
      where: {
        isActive: true,
        product: { isActive: true },
      },
      include: {
        product: {
          include: {
            variants: { where: { isActive: true } },
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    const result = deals
      .map((deal) => {
        const product = deal.product;
        if (!product) return null;

        // اولویت: واریانتی که originalPriceRial > priceRial باشد (دارای تخفیف)
        const dealVariant = product.variants.find(
          (v) =>
            v.priceRial != null &&
            v.originalPriceRial != null &&
            v.originalPriceRial > v.priceRial
        );

        if (!dealVariant) return null;

        const priceToman = rialToToman(dealVariant.priceRial);
        const originalPriceToman = rialToToman(dealVariant.originalPriceRial);
        const discountPercent = Math.round(
          ((originalPriceToman - priceToman) / originalPriceToman) * 100
        );

        return {
          id: deal.id,
          endsAt: deal.endsAt, // null = بدون تایمر
          sortOrder: deal.sortOrder,
          product: {
            id: product.id,
            slug: product.slug,
            title: product.title,
            mainImage: product.mainImage,
          },
          dealVariant: {
            id: dealVariant.id,
            name: dealVariant.name,
            price: priceToman,
            originalPrice: originalPriceToman,
            discountPercent,
          },
        };
      })
      .filter(Boolean);

    res.json(result);
  } catch (err) {
    console.error("FLASH DEALS ERROR:", err);
    res.status(500).json({ error: "خطا در دریافت پیشنهادات ویژه." });
  }
});

module.exports = router;
