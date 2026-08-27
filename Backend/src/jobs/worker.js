// src/jobs/worker.js
// این فایل یک پروسه جدا است - جداگانه با `npm run worker` اجرا می‌شود
// (نه بخشی از سرور Express اصلی)، دقیقاً طبق الگوی توصیه‌شده در چک‌لیست شما.
require("dotenv").config();
const { Worker } = require("bullmq");
const { connection } = require("../lib/queue");

const worker = new Worker(
  "post-fulfillment",
  async (job) => {
    const { orderId, orderNumber, mobile } = job.data;

    // TODO: اینجا کارهای کند/جانبی پس از تحویل موفق انجام شود، مثلاً:
    // - ارسال پیامک تاییدیه نهایی به مشتری (از طریق کاوه‌نگار)
    // - ثبت رویداد در ابزار آنالیتیکس
    // - هر کار دیگری که نباید داخل ریکوئست وریفای پرداخت کاربر را معطل نگه دارد
    console.log(`[worker] پردازش سفارش ${orderNumber} (${mobile}) - orderId: ${orderId}`);
  },
  { connection },
);

worker.on("completed", (job) => {
  console.log(`[worker] job ${job.id} کامل شد.`);
});

worker.on("failed", (job, err) => {
  console.error(`[worker] job ${job?.id} شکست خورد:`, err.message);
});

console.log("✅ Worker پس‌پردازش سفارشات فعال شد.");
