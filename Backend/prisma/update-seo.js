const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

// Load env
require("dotenv").config({ path: path.join(__dirname, "../.env") });
if (!process.env.DATABASE_URL) {
  require("dotenv").config({ path: "/etc/byelimit/.env" });
}
if (!process.env.DATABASE_URL) {
  require("dotenv").config({ path: path.join(__dirname, "../.env.production") });
}

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 شروع عملیات آپدیت سئوی محصولات (Meta Titles, Descriptions & FAQs)...");
  
  const products = await prisma.product.findMany();
  console.log(`پیدا شد: ${products.length} محصول در دیتابیس.`);

  let updatedCount = 0;

  for (const product of products) {
    try {
      // تشخیص دسته بندی برای گارانتی
      const isAI = ["ai", "text", "image", "video"].includes(product.category) || product.title.toLowerCase().includes("gpt") || product.title.toLowerCase().includes("claude");
      
      const guaranteeCondition = isAI 
        ? "ضمانت بازگشت وجه تا یک هفته (با کسر تنها ۱۰٪ هزینه خدمات)"
        : "ضمانت تعویض اکانت تا ۱۰ روز پس از خرید";

      // Meta Title Optimization (Long-tail keywords)
      const metaTitle = `خرید اکانت ${product.title} (اختصاصی و اشتراکی) | تحویل سریع`;
      
      // Meta Description Optimization (USPs included)
      const metaDescription = `خرید اشتراک قانونی ${product.title} با پرداخت امن بین‌المللی. تحویل سریع (حداکثر ۲۴ الی ۴۸ ساعت)، پشتیبانی تخصصی، روی ایمیل شخصی شما و ${guaranteeCondition}.`;

      // Update FAQs
      let existingFaqs = product.faqs ? (typeof product.faqs === "string" ? JSON.parse(product.faqs) : product.faqs) : [];
      if (!Array.isArray(existingFaqs)) existingFaqs = [];

      // Remove old delivery/guarantee related FAQs to avoid duplicates
      const filteredFaqs = existingFaqs.filter(f => 
        !f.question.includes("گارانتی") && 
        !f.question.includes("تحویل") &&
        !f.question.includes("ضمانت") &&
        !f.question.includes("مزیت") &&
        !f.question.includes("ایمیل شخصی")
      );

      // Inject SEO optimized FAQs
      const seoFaqs = [
        {
          question: "زمان تحویل اکانت چقدر است؟",
          answer: "تمامی سفارشات در بای لیمیت دارای ویژگی «تحویل سریع» هستند و اشتراک شما معمولا بین ۱۵ دقیقه الی حداکثر ۴۸ ساعت پس از ثبت سفارش تحویل داده می‌شود."
        },
        {
          question: "شرایط گارانتی این اشتراک چگونه است؟",
          answer: `با توجه به ماهیت این سرویس، شما از ${guaranteeCondition} بهره‌مند خواهید شد تا با خیال راحت خرید خود را انجام دهید.`
        },
        {
          question: "نحوه فعال‌سازی روی ایمیل شخصی است یا پیش‌ساخته؟",
          answer: "بسته به نوع پلن انتخابی (اختصاصی یا اشتراکی)، فعال‌سازی می‌تواند مستقیماً روی ایمیل شخصی شما انجام شود و یا به صورت اکانت‌های قانونی از پیش ساخته شده تحویل گردد."
        },
        {
          question: "چرا برای خرید بای لیمیت را انتخاب کنم؟",
          answer: "ما خرید شما را از طریق درگاه‌های امن بین‌المللی انجام می‌دهیم که خطر قطعی یا بن شدن را از بین می‌برد. همچنین پشتیبانی تخصصی ما در تمام روزهای هفته آماده پاسخگویی به سوالات شماست."
        }
      ];

      const newFaqs = [...seoFaqs, ...filteredFaqs];

      await prisma.product.update({
        where: { id: product.id },
        data: {
          metaTitle,
          metaDescription,
          faqs: newFaqs
        }
      });

      console.log(`✅ ${product.title} آپدیت شد.`);
      updatedCount++;
    } catch (err) {
      console.error(`❌ خطا در آپدیت ${product.title}:`, err.message);
    }
  }

  console.log(`\n🎉 عملیات با موفقیت پایان یافت. مجموع آپدیت‌ها: ${updatedCount}`);
}

main()
  .catch((e) => console.error("Error:", e))
  .finally(() => prisma.$disconnect());
