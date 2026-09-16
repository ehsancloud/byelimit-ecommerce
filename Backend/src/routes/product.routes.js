// Backend/src/routes/product.routes.js
const express = require("express");
const prisma = require("../lib/prisma");
const { rialToToman } = require("../lib/pricing");

const router = express.Router();

const GENERIC_FAQS = [
  {
    question: "آیا این اکانت قانونی و بدون ریسک است؟",
    answer: "بله، تمام اکانت ها از مسیرهای رسمی و قانونی تهیه می شوند و امکان استفاده پایدار و بدون قطعی را دارند.",
  },
  {
    question: "در صورت بروز مشکل در اکانت چه اتفاقی می افتد؟",
    answer: "طبق ضمانت بازگشت وجه بای لیمیت، اکانت شما در سریع ترین زمان ممکن پشتیبانی، تعویض یا مبلغ بازگردانده می شود.",
  },
  {
    question: "تحویل سفارش چقدر زمان می برد؟",
    answer: "تحویل بیشتر اکانت ها به صورت فوری است و نهایتاً تا 24 ساعت ارسال خواهد شد.",
  },
];

const DEFAULT_COMPARISON = {
  columns: ["ویژگی / فاکتور", "پلن اشتراکی (اقتصادی)", "پلن اختصاصی (کاملاً شخصی)"],
  rows: [
    {
      feature: "نوع ایمیل و فعال سازی",
      values: ["ایمیل اشتراکی بای لیمیت", "روی ایمیل شخصی شما"],
    },
    {
      feature: "حفظ حریم خصوصی گفتگوها و تاریخچه",
      values: ["عمومی برای اعضای اکانت", "کاملاً امن و ۱۰۰٪ شخصی"],
    },
    {
      feature: "تضمین تا آخرین روز اشتراک",
      values: [true, true],
    },
    {
      feature: "پشتیبانی اختصاصی و تعویض در صورت قطعی",
      values: [true, true],
    },
  ],
};

function safeParseJson(value, fallback) {
  if (!value) return fallback;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

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
  const parsedFaqs = safeParseJson(p.faqs, null);
  const parsedTable = safeParseJson(p.comparisonTable, null);

  return {
    id: p.id,
    slug: p.slug,
    sku: p.sku,
    category: p.category,
    titlePrefix: p.titlePrefix || "خرید اشتراک",
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
    orderItemsCount: (p._count?.orderItems || 0) + (p.totalSalesCount || 0),
    cartItemsCount: p._count?.cartItems || 0,
    demoVideoUrl: null,
    variants: p.variants ? p.variants.map(serializeVariant) : [],
    faqs: Array.isArray(parsedFaqs) && parsedFaqs.length > 0 ? parsedFaqs : GENERIC_FAQS,
    comparisonTable: parsedTable || DEFAULT_COMPARISON,
    reviews: (p.reviews || []).map((r) => ({
      id: r.id,
      authorName: r.authorName || "کاربر بای لیمیت",
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
    })),
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
    include: {
      variants: { where: { isActive: true } },
      _count: { select: { orderItems: true, cartItems: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(products.map(serializeProduct));
});

// پرفروش ترین محصولات بر اساس خرید های واقعی (orderItems) به جز محصول تستی
router.get("/bestsellers", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        NOT: [
          { slug: { contains: "test", mode: "insensitive" } },
          { title: { contains: "تست", mode: "insensitive" } },
          { sku: { contains: "TEST", mode: "insensitive" } },
        ],
      },
      include: {
        variants: { where: { isActive: true } },
        _count: { select: { orderItems: true } },
      },
    });

    const sorted = products
      .map(serializeProduct)
      .sort((a, b) => b.orderItemsCount - a.orderItemsCount)
      .slice(0, 8);

    res.json(sorted);
  } catch (err) {
    res.status(500).json({ error: "خطا در دریافت پرفروش ترین ها" });
  }
});

// پربازدیدترین محصولات بر اساس افزودن به سبد خرید (cartItems) به جز محصول تستی
router.get("/most-viewed", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        NOT: [
          { slug: { contains: "test", mode: "insensitive" } },
          { title: { contains: "تست", mode: "insensitive" } },
          { sku: { contains: "TEST", mode: "insensitive" } },
        ],
      },
      include: {
        variants: { where: { isActive: true } },
        _count: { select: { cartItems: true } },
      },
    });

    const sorted = products
      .map(serializeProduct)
      .sort((a, b) => (b.cartItemsCount || 0) - (a.cartItemsCount || 0))
      .slice(0, 8);

    res.json(sorted);
  } catch (err) {
    res.status(500).json({ error: "خطا در دریافت پربازدیدترین ها" });
  }
});

router.get("/:slug", async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    include: {
      variants: { where: { isActive: true } },
      _count: { select: { orderItems: true, cartItems: true } },
      reviews: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product || !product.isActive) {
    return res.status(404).json({ error: "محصول یافت نشد." });
  }

  res.json(serializeProduct(product));
});

module.exports = router;