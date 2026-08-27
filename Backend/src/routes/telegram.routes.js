// src/routes/telegram.routes.js
//
// *** رابط اتصال ربات تلگرام پشتیبانی (که خودتان می‌سازید) ***
//
// مکانیزم: الگوی Outbox ساده. به‌محض تایید پرداخت یک سفارش، یک رکورد در جدول
// telegram_notifications با وضعیت PENDING ثبت می‌شود (این کار در payment.routes.js
// داخل همان تراکنش اتمیک انجام می‌شود). ربات شما این دو اندپوینت را صدا می‌زند:
//
// ۱. GET  /internal/telegram/pending
//    هر چند ثانیه یک‌بار (مثلاً هر ۱۰ ثانیه) این را Poll کنید. رکوردهای PENDING
//    را برمی‌گرداند: شماره سفارش، شماره موبایل، آیدی تلگرام مشتری، لیست محصولات،
//    و مبلغ کل. ربات پیامی به چت پشتیبانی می‌فرستد که "این سفارش رو تحویل بده".
//
// ۲. POST /internal/telegram/:id/ack
//    بعد از اینکه ربات پیام را با موفقیت به چت پشتیبانی فرستاد، این را صدا بزنید
//    تا آن رکورد SENT علامت بخورد و دوباره در Poll بعدی برنگردد.
//
// هر دو اندپوینت باید هدر زیر را داشته باشند تا فقط ربات خودتان بتواند صدا بزند:
//   x-internal-api-key: <INTERNAL_API_KEY از .env>
//
// جایگزین Polling: اگر ترجیح می‌دهید ربات به‌جای Poll کردن، لحظه‌ای مطلع شود،
// می‌توانید بعداً یک Webhook هم اضافه کنید (سرور به آدرس ربات شما POST بزند)،
// اما Polling برای شروع ساده‌تر و بدون نیاز به آدرس عمومی ثابت روی ربات است.

const express = require("express");
const prisma = require("../lib/prisma");

const router = express.Router();

function requireInternalKey(req, res, next) {
  const key = req.headers["x-internal-api-key"];
  if (!key || key !== process.env.INTERNAL_API_KEY) {
    return res.status(401).json({ error: "دسترسی غیرمجاز." });
  }
  next();
}

router.use(requireInternalKey);

router.get("/pending", async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const notifications = await prisma.telegramNotification.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
  res.json(
    notifications.map((n) => ({
      id: n.id,
      orderId: n.orderId,
      payload: n.payload,
      attempts: n.attempts,
      createdAt: n.createdAt,
    })),
  );
});

router.post("/:id/ack", async (req, res) => {
  const notification = await prisma.telegramNotification.findUnique({
    where: { id: req.params.id },
  });
  if (!notification) return res.status(404).json({ error: "رکورد یافت نشد." });

  await prisma.telegramNotification.update({
    where: { id: notification.id },
    data: { status: "SENT", sentAt: new Date() },
  });
  res.json({ ok: true });
});

// اگر ارسال شکست خورد و ربات می‌خواهد تلاش دوباره ثبت کند (بدون علامت‌گذاری نهایی)
router.post("/:id/fail", async (req, res) => {
  await prisma.telegramNotification.update({
    where: { id: req.params.id },
    data: { attempts: { increment: 1 } },
  });
  res.json({ ok: true });
});

module.exports = router;
