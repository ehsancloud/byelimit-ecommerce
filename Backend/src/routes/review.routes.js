// Backend/src/routes/review.routes.js
const express = require("express");
const { z } = require("zod");
const prisma = require("../lib/prisma");
const { optionalAuth } = require("../middleware/auth");

const router = express.Router();

const createReviewSchema = z.object({
  productId: z.string().min(1, "شناسه محصول الزامی است."),
  rating: z.number().int().min(1).max(5).default(5),
  comment: z.string().min(3, "متن نظر باید حداقل ۳ کاراکتر باشد.").max(1000),
  authorName: z.string().max(60).optional().nullable(),
});

// ارسال نظر توسط کاربر (پیش‌فرض: در انتظار تایید ادمین)
router.post("/", optionalAuth, async (req, res) => {
  const parsed = createReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || "اطلاعات ارسالی نامعتبر است." });
  }

  const { productId, rating, comment } = parsed.data;
  const user = req.user;

  // اگر کاربر نام وارد نکرده باشد یا لاگین نباشد، «کاربر بای لیمیت» درج می‌شود
  const finalName =
    parsed.data.authorName?.trim() ||
    user?.fullName ||
    "کاربر بای لیمیت";

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: "محصول مورد نظر یافت نشد." });
    }

    const newReview = await prisma.review.create({
      data: {
        productId: product.id,
        userId: user ? (user.userId || user.id) : null,
        authorName: finalName,
        rating,
        comment: comment.trim(),
        status: "PENDING", // برای تایید در Prisma Studio
      },
    });

    return res.status(201).json({
      message: "نظر شما با موفقیت ثبت شد و پس از بررسی تیم پشتیبانی نمایش داده می‌شود.",
      reviewId: newReview.id,
    });
  } catch (err) {
    console.error("CREATE REVIEW ERROR:", err);
    return res.status(500).json({ error: "خطا در ثبت نظر." });
  }
});

// دریافت نظرات تاییدشده یک محصول
router.get("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await prisma.review.findMany({
      where: {
        productId,
        status: "APPROVED",
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        authorName: true,
        rating: true,
        comment: true,
        createdAt: true,
      },
    });

    return res.json(reviews);
  } catch (err) {
    console.error("GET REVIEWS ERROR:", err);
    return res.status(500).json({ error: "خطا در دریافت نظرات." });
  }
});

module.exports = router;