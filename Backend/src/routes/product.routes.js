// src/routes/product.routes.js
const express = require("express");
const prisma = require("../lib/prisma");
const { rialToToman } = require("../lib/pricing");

const router = express.Router();

// محتوای عمومی سوالات متداول - تا سیستم نظرات/FAQ اختصاصی per-محصول ساخته شود
// (فعلاً بخشی خارج از محدوده‌ی این فاز است)، همین محتوای مشترک نمایش داده می‌شود.
const GENERIC_FAQS = [
  {
    question: "آیا این اکانت قانونی و بدون ریسک است؟",
    answer:
      "بله، تمام اکانت‌ها از مسیرهای رسمی و قانونی تهیه می‌شوند و امکان استفاده پایدار را دارند.",
  },
  {
    question: "در صورت مشکل در اکانت چه اتفاقی می‌افتد؟",
    answer:
      "طبق ضمانت بازگشت وجه، اکانت شما در سریع‌ترین زمان ممکن تعویض یا مبلغ بازگردانده می‌شود.",
  },
];

function serializeVariant(v) {
  const priceTBD = v.priceRial == null;
  return {
    id: v.id,
    name: v.name,
    type: v.type,
    durationDays: v.durationDays,
    price: priceTBD ? null : rialToToman(v.priceRial),
    originalPrice: v.originalPriceRial ? rialToToman(v.originalPriceRial) : null,
    priceTBD,
    deliveryTimeMinutes: v.deliveryTimeMinutes,
    isPopular: v.isPopular,
  };
}

function serializeProduct(p) {
  return {
    id: p.id,
    slug: p.slug,
    sku: p.sku,
    category: p.category,
    title: p.title,
    subtitle: p.subtitle,
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    mainImage: p.mainImage,
    requiresVpn: p.requiresVpn,
    vpnNote: p.vpnNote,
    longDescription: p.longDescription,
    ratingAverage: p.ratingAverage,
    ratingCount: p.ratingCount,
    monthlySalesCount: p.monthlySalesCount,
    totalSalesCount: p.totalSalesCount,
    demoVideoUrl: null,
    variants: p.variants.map(serializeVariant),
    faqs: GENERIC_FAQS,
    reviews: [],
    comparisonTable: [],
  };
}

router.get("/", async (req, res) => {
  const { category, search } = req.query;
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(category && category !== "all" ? { category: String(category) } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: String(search), mode: "insensitive" } },
              { subtitle: { contains: String(search), mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { variants: { where: { isActive: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(products.map(serializeProduct));
});

router.get("/:slug", async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    include: { variants: { where: { isActive: true } } },
  });
  if (!product || !product.isActive) {
    return res.status(404).json({ error: "محصول یافت نشد." });
  }
  res.json(serializeProduct(product));
});

module.exports = router;
