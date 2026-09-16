// Backend/prisma/update-gemini-description.js
// اسکریپت تخصصی به روزرسانی فیلد longDescription محصول جمنای با حفظ کامل خطوط جدید (Newlines)
// اجرا: node prisma/update-gemini-description.js

const path = require("path");
const fs = require("fs");

// لود خودکار متغیرهای محیطی با اولویت فایل های موجود
require("dotenv").config({ path: path.join(__dirname, "../.env") });
if (!process.env.DATABASE_URL && fs.existsSync("/etc/byelimit/.env")) {
  require("dotenv").config({ path: "/etc/byelimit/.env" });
}
if (!process.env.DATABASE_URL) {
  require("dotenv").config({ path: path.join(__dirname, "../.env.production") });
}

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// دریافت مستقیم متن مارکداون استاندارد از products-content.json جهت تضمین یکپارچگی ۱۰۰٪
const productsContentPath = path.join(__dirname, "products-content.json");
const productsContent = JSON.parse(fs.readFileSync(productsContentPath, "utf-8"));
const geminiData = productsContent.find((p) => p.slug === "gemini");

if (!geminiData || !geminiData.longDescription) {
  console.error("❌ دیتای gemini در products-content.json یافت نشد!");
  process.exit(1);
}

const GEMINI_MARKDOWN = geminiData.longDescription;

async function main() {
  console.log("🔄 در حال اتصال به دیتابیس و جستجوی محصول Gemini...");

  const product = await prisma.product.findFirst({
    where: {
      OR: [
        { slug: "gemini" },
        { title: { contains: "Gemini", mode: "insensitive" } },
        { title: { contains: "جمنای" } },
      ],
    },
    select: {
      id: true,
      slug: true,
      title: true,
      longDescription: true,
    },
  });

  if (!product) {
    console.error("❌ محصول Gemini در دیتابیس یافت نشد!");
    process.exit(1);
  }

  const prevLength = product.longDescription ? product.longDescription.length : 0;
  const prevNewlines = product.longDescription ? (product.longDescription.match(/\n/g) || []).length : 0;
  console.log(`📌 محصول پیدا شد: ${product.title} (slug: ${product.slug})`);
  console.log(`📊 وضعیت قبلی: طول متن = ${prevLength} کاراکتر | تعداد خطوط جدید (newlines) = ${prevNewlines}`);

  const updated = await prisma.product.update({
    where: { id: product.id },
    data: {
      longDescription: GEMINI_MARKDOWN,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      longDescription: true,
    },
  });

  const newLength = updated.longDescription ? updated.longDescription.length : 0;
  const newNewlines = updated.longDescription ? (updated.longDescription.match(/\n/g) || []).length : 0;

  console.log("✅ فیلد longDescription با موفقیت در دیتابیس به روزرسانی شد!");
  console.log(`📊 وضعیت جدید: طول متن = ${newLength} کاراکتر | تعداد خطوط جدید (newlines) = ${newNewlines}`);
  console.log("🎉 تمام شکستگی های خطوط، هدینگ ها و بولت پوینت ها با موفقیت در دیتابیس ذخیره شدند.");
}

main()
  .catch((err) => {
    console.error("❌ خطا در اجرای اسکریپت:", err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
