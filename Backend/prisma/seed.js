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
    slug: "vps-germany", sku: "VPS-DE-01", category: "vps", title: "سرور مجازی آلمان (Germany VPS)",
    sourcingRegion: null,
    variants: [
      { id: "var-1gb", name: "۱ گیگ رم / ۱ ماهه", costUsd: null, isPopular: false },
      { id: "var-2gb", name: "۲ گیگ رم / ۱ ماهه", costUsd: null, isPopular: true },
    ],
  },
  {
    slug: "vps-usa", sku: "VPS-US-01", category: "vps", title: "سرور مجازی آمریکا (USA VPS)",
    sourcingRegion: null,
    variants: [
      { id: "var-1gb", name: "۱ گیگ رم / ۱ ماهه", costUsd: null, isPopular: false },
      { id: "var-2gb", name: "۲ گیگ رم / ۱ ماهه", costUsd: null, isPopular: true },
    ],
  },
  {
    slug: "vps-finland", sku: "VPS-FI-01", category: "vps", title: "سرور مجازی فنلاند (Finland VPS)",
    sourcingRegion: null,
    variants: [
      { id: "var-1gb", name: "۱ گیگ رم / ۱ ماهه", costUsd: null, isPopular: false },
      { id: "var-2gb", name: "۲ گیگ رم / ۱ ماهه", costUsd: null, isPopular: true },
    ],
  },
];

async function main() {
  console.log("در حال seed کردن محصولات...");

  for (const [serviceIndex, svc] of [...services, ...vpsProducts].entries()) {
    const product = await prisma.product.upsert({
      where: { slug: svc.slug },
      update: {},
      create: {
        slug: svc.slug,
        sku: svc.sku,
        category: svc.category,
        title: svc.title,
        subtitle: null,
        metaTitle: `خرید اشتراک ${svc.title} | بای لیمیت`,
        metaDescription: `خرید اشتراک اختصاصی ${svc.title} با تحویل سریع و ضمانت ۱۰۰٪.`,
        mainImage: "/images/logo.png",
        requiresVpn: svc.category !== "vps",
        vpnNote: svc.category !== "vps" ? "برای استفاده از این سرویس نیازمند تحریم‌شکن با IP ثابت و معتبر هستید." : null,
        longDescription: `اشتراک ${svc.title} به‌زودی با قیمت نهایی و توضیحات کامل در دسترس قرار می‌گیرد.`,
      },
    });

    for (const v of svc.variants) {
      await prisma.productVariant.upsert({
        where: { productId_name: { productId: product.id, name: v.name } },
        update: {},
        create: {
          productId: product.id,
          name: v.name,
          type: v.isPopular ? "exclusive" : "shared",
          productTitle: svc.title,
          // قیمت‌های نمونه برای تست کامل سبد و پرداخت؛ ادمین می‌تواند در Studio تغییر دهد.
          priceRial: BigInt((serviceIndex + 1) * 1500000 + (v.isPopular ? 1000000 : 0)) * 10n,
          originalPriceRial: BigInt((serviceIndex + 1) * 1800000 + (v.isPopular ? 1200000 : 0)) * 10n,
          costUsd: v.costUsd,
          sourcingRegion: svc.sourcingRegion,
          deliveryTimeMinutes: 0,
          isPopular: v.isPopular,
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

  console.log(`✅ ${services.length + vpsProducts.length} محصول seed شد.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
