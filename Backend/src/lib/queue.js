// src/lib/queue.js
const { Queue } = require("bullmq");
const IORedis = require("ioredis");

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

/**
 * صف کارهای پس از تحویل موفق (مثلاً ارسال پیامک تاییدیه، ایمیل، لاگ تحلیلی و...).
 * طبق چک‌لیست: هیچ کار کند/I-O سنگینی نباید داخل همان ریکوئست وریفای پرداخت انجام شود.
 * تخصیص اکانت (DB-only، سریع) همچنان داخل تراکنش اتمیک انجام می‌شود چون خودِ
 * سازگاری داده (Consistency) به آن وابسته است؛ فقط کارهای جانبی/کند به این صف می‌روند.
 */
const postFulfillmentQueue = new Queue("post-fulfillment", { connection });

async function enqueuePostFulfillmentTasks(order) {
  await postFulfillmentQueue.add(
    "order-fulfilled",
    {
      orderId: order.id,
      orderNumber: order.orderNumber,
      mobile: order.mobile,
    },
    {
      attempts: 5,
      backoff: { type: "exponential", delay: 5000 },
      removeOnComplete: 500,
      removeOnFail: 1000,
    },
  );
}

module.exports = { connection, postFulfillmentQueue, enqueuePostFulfillmentTasks };
