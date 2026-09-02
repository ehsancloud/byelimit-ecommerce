// prisma/seed.js
// اجرا: npm run prisma:migrate  سپس  node prisma/seed.js
// (یا با افزودن "prisma": {"seed": "node prisma/seed.js"} به package.json و اجرای npx prisma db seed)

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

const services = JSON.parse(
  fs.readFileSync(path.join(__dirname, "seed-data.json"), "utf-8"),
);

// سرورهای مجازی - در شیت اصلی نبودند، طبق داده‌ای که قبلاً برای فرانت‌اند ساخته شد
const vpsProducts = [
  {
    slug: "vps-germany", sku: "VPS-DE-01", category: "vps", title: "خرید سرور مجازی آلمان (Germany VPS)",
    subtitle: "Germany VPS",
    sourcingRegion: null,
    variants: [
      { id: "var-1gb", name: "۱ گیگ رم / ۱ ماهه", costUsd: null, isPopular: false },
      { id: "var-2gb", name: "۲ گیگ رم / ۱ ماهه", costUsd: null, isPopular: true },
    ],
  },
  {
    slug: "vps-usa", sku: "VPS-US-01", category: "vps", title: "خرید سرور مجازی آمریکا (USA VPS)",
    subtitle: "USA VPS",
    sourcingRegion: null,
    variants: [
      { id: "var-1gb", name: "۱ گیگ رم / ۱ ماهه", costUsd: null, isPopular: false },
      { id: "var-2gb", name: "۲ گیگ رم / ۱ ماهه", costUsd: null, isPopular: true },
    ],
  },
  {
    slug: "vps-finland", sku: "VPS-FI-01", category: "vps", title: "خرید سرور مجازی فنلاند (Finland VPS)",
    subtitle: "Finland VPS",
    sourcingRegion: null,
    variants: [
      { id: "var-1gb", name: "۱ گیگ رم / ۱ ماهه", costUsd: null, isPopular: false },
      { id: "var-2gb", name: "۲ گیگ رم / ۱ ماهه", costUsd: null, isPopular: true },
    ],
  },
];

// محصول تستی ۱۰۰۰ تومانی برای بررسی صحت کل فرآیند پرداخت
const testProduct = {
  slug: "test-product-1000",
  sku: "TEST-1000",
  category: "test",
  title: "محصول تستی ۱۰۰۰ تومانی",
  sourcingRegion: null,
  variants: [
    { id: "test-1000", name: "تست پرداخت", costUsd: null, isPopular: true },
  ],
};

async function main() {
  console.log("در حال seed کردن محصولات...");

  for (const [serviceIndex, svc] of [...services, ...vpsProducts, testProduct].entries()) {
    const product = await prisma.product.upsert({
      where: { slug: svc.slug },
      // ⚠️ فقط اطلاعات متنی/سئو رفرش می‌شود؛ قیمت‌ها و تنظیمات ادمین دست نمی‌خورند
      update: {
        title: svc.title,
        subtitle: svc.subtitle || null,
        category: svc.category,
        metaTitle: `خرید ${svc.title} | بای لیمیت`,
        metaDescription: `${svc.title} با تحویل سریع، ضمانت ۱۰۰٪ بازگشت وجه و پشتیبانی هرروز ۱۰ تا ۲۲ از فروشگاه بای لیمیت.`,
      },
      create: {
        slug: svc.slug,
        sku: svc.sku,
        category: svc.category,
        title: svc.title,
        subtitle: svc.subtitle || null,
        metaTitle: `خرید ${svc.title} | بای لیمیت`,
        metaDescription: `${svc.title} با تحویل سریع، ضمانت ۱۰۰٪ بازگشت وجه و پشتیبانی هرروز ۱۰ تا ۲۲ از فروشگاه بای لیمیت.`,
        mainImage: "/images/logo.png",
        requiresVpn: svc.category !== "vps" && svc.category !== "test",
        vpnNote: svc.category !== "vps" && svc.category !== "test" ? "برای استفاده از این سرویس نیازمند تحریم‌شکن با IP ثابت و معتبر هستید." : null,
        longDescription: `اشتراک ${svc.title} به‌زودی با قیمت نهایی و توضیحات کامل در دسترس قرار می‌گیرد.`,
      },
    });

    for (const v of svc.variants) {
      const isTest = svc.slug === testProduct.slug;
      await prisma.productVariant.upsert({
        where: { productId_name: { productId: product.id, name: v.name } },
        update: {
          costUsd: v.costUsd ?? null,
        },
        create: {
          productId: product.id,
          name: v.name,
          type: v.isPopular ? "exclusive" : "shared",
          productTitle: svc.title,
          // محصول تستی: قیمت ثابت ۱۰۰۰ تومان
          pricingMode: isTest ? "FIXED_RIAL" : "DYNAMIC_USD",
          fixedPriceRial: isTest ? 10000n : null, // ۱۰۰۰ تومان = ۱۰۰۰۰ ریال
          priceRial: isTest ? 10000n : null,
          originalPriceRial: isTest ? 10000n : null,
          costUsd: isTest ? null : v.costUsd,
          sourcingRegion: svc.sourcingRegion,
          deliveryTimeMinutes: 0,
          isPopular: v.isPopular,
        },
      });
    }
  }

  // ─── افزودنی کلود: پرداخت امن بین‌المللی (۱٬۴۹۵٬۰۰۰ تومان) ───
  const claude = await prisma.product.findUnique({ where: { slug: "claude" } });
  if (claude) {
    const claudeVariants = await prisma.productVariant.findMany({
      where: { productId: claude.id },
    });
    for (const variant of claudeVariants) {
      await prisma.productAddOn.upsert({
        where: { id: `addon-secure-pay-${variant.id}` },
        update: {},
        create: {
          id: `addon-secure-pay-${variant.id}`,
          variantId: variant.id,
          name: "پرداخت امن بین‌المللی",
          description: "گزینه پرداخت فوق امن و مطمئن بین‌المللی برای اکانت کلود",
          priceRial: 14950000n, // ۱٬۴۹۵٬۰۰۰ تومان
          isActive: true,
        },
      });
    }
  }

  // کدهای تخفیف نمونه - همان دو کدی که در دموی فرانت‌اند استفاده شده بود
  await prisma.discountCode.upsert({
    where: { code: "SAVE50" },
    update: {},
    create: { code: "SAVE50", type: "FIXED", amountRial: 500000n, minCartAmountRial: 2000000n, maxDiscountRial: 500000n, isActive: true },
  });
  await prisma.discountCode.upsert({
    where: { code: "OFF10" },
    update: {},
    create: { code: "OFF10", type: "PERCENT", percent: 10, minCartAmountRial: 1000000n, maxDiscountRial: 2000000n, isActive: true },
  });

  console.log(`✅ ${services.length + vpsProducts.length + 1} محصول seed شد (شامل محصول تستی ۱۰۰۰ تومانی).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });