// Backend/prisma/import-content.js
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

// Load .env automatically (supports local .env, production .env, and /etc/byelimit/.env)
require("dotenv").config({ path: path.join(__dirname, "../.env") });
if (!process.env.DATABASE_URL) {
  require("dotenv").config({ path: "/etc/byelimit/.env" });
}
if (!process.env.DATABASE_URL) {
  require("dotenv").config({ path: path.join(__dirname, "../.env.production") });
}

const prisma = new PrismaClient();

async function main() {
  const jsonPath = path.join(__dirname, "products-content.json");
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ فایل ${jsonPath} یافت نشد.`);
    process.exit(1);
  }

  const products = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  console.log(`🚀 در حال آپدیت اطلاعات سئو و محتوای ${products.length} محصول...`);

  let updatedCount = 0;
  let notFoundCount = 0;

  for (const item of products) {
    try {
      const existing = await prisma.product.findUnique({
        where: { slug: item.slug },
        select: { id: true, title: true }
      });

      if (!existing) {
        console.warn(`⚠️ محصول با اسلاگ "${item.slug}" در دیتابیس یافت نشد.`);
        notFoundCount++;
        continue;
      }

      await prisma.product.update({
        where: { slug: item.slug },
        data: {
          titlePrefix: item.titlePrefix || undefined,
          subtitle: item.subtitle || undefined,
          metaTitle: item.metaTitle || undefined,
          metaDescription: item.metaDescription || undefined,
          longDescription: item.longDescription || undefined,
          features: item.features ?? undefined,
          faqs: item.faqs ?? undefined,
          comparisonTable: item.comparisonTable ?? undefined,
        },
      });

      console.log(`✅ آپدیت شد: ${item.slug} (${existing.title})`);
      updatedCount++;
    } catch (err) {
      console.error(`❌ خطا در آپدیت ${item.slug}:`, err.message);
    }
  }

  console.log("\n=================================");
  console.log(`🎉 عملیات با موفقیت پایان یافت:`);
  console.log(`- تعداد آپدیت شده: ${updatedCount}`);
  if (notFoundCount > 0) console.log(`- تعداد یافت نشده: ${notFoundCount}`);
  console.log("=================================");
}

main()
  .catch((e) => {
    console.error("خطای کلی اجرای اسکریپت:", e);
  })
  .finally(() => prisma.$disconnect());
