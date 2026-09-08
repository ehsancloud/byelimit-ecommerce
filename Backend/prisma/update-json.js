const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'products-content.json');
const products = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

for (const product of products) {
  const isAI = ["ai", "text", "image", "video"].includes(product.category) || (product.title && (product.title.toLowerCase().includes("gpt") || product.title.toLowerCase().includes("claude")));
  
  const guaranteeCondition = isAI 
    ? "ضمانت بازگشت وجه تا یک هفته (با کسر تنها ۱۰٪ هزینه خدمات)"
    : "ضمانت تعویض اکانت تا ۱۰ روز پس از خرید";

  product.metaTitle = `خرید اکانت ${product.title} (اختصاصی و اشتراکی) | تحویل سریع`;
  product.metaDescription = `خرید اشتراک قانونی ${product.title} با پرداخت امن بین‌المللی. تحویل سریع (حداکثر ۲۴ الی ۴۸ ساعت)، پشتیبانی تخصصی، روی ایمیل شخصی شما و ${guaranteeCondition}.`;

  let existingFaqs = product.faqs || [];
  
  const filteredFaqs = existingFaqs.filter(f => 
    !f.question.includes("گارانتی") && 
    !f.question.includes("تحویل") &&
    !f.question.includes("ضمانت") &&
    !f.question.includes("مزیت") &&
    !f.question.includes("ایمیل شخصی")
  );

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

  product.faqs = [...seoFaqs, ...filteredFaqs];
}

fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2));
console.log("JSON successfully updated!");
