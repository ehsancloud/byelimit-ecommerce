// Backend/src/routes/auth.routes.js
const express = require("express");
const prisma = require("../lib/prisma");
const { sendOtp, verifyOtp, normalizeMobile, isValidIranianMobile } = require("../services/otp.service");
const { requireAuth, issueAuthCookie } = require("../middleware/auth");

const router = express.Router();

router.post("/send-otp", async (req, res, next) => {
  try {
    const mobile = normalizeMobile(req.body.mobile);
    if (!mobile || !isValidIranianMobile(mobile)) {
      return res.status(400).json({ error: "شماره موبایل نامعتبر است. فرمت صحیح: 09123456789", code: "INVALID_MOBILE" });
    }

    await sendOtp(mobile, "LOGIN", req.ip);
    return res.json({ success: true, message: "کد تایید با موفقیت ارسال شد." });
  } catch (err) {
    if (err && err.code === "OTP_RATE_LIMITED") {
      return res.status(429).json({ error: err.message, code: err.code });
    }
    if (err && err.code === "SMS_SEND_FAILED") {
      return res.status(502).json({ error: err.message, code: err.code });
    }
    next(err);
  }
});

router.post("/verify-otp", async (req, res, next) => {
  try {
    const mobile = normalizeMobile(req.body.mobile);
    const { code } = req.body;

    if (!mobile || !code) {
      return res.status(400).json({ error: "شماره موبایل و کد تایید الزامی هستند.", code: "REQUIRED_FIELDS_MISSING" });
    }

    await verifyOtp(mobile, String(code).trim(), "LOGIN");

    let user = await prisma.user.findUnique({ where: { mobile } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          mobile,
          lastLoginAt: new Date(),
        },
      });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    }

    const token = issueAuthCookie(res, user);

    return res.json({
      success: true,
      user: {
        id: user.id,
        userId: user.id,
        mobile: user.mobile,
        fullName: user.fullName,
      },
      token,
    });
  } catch (err) {
    if (err && err.code && err.code.startsWith("OTP_")) {
      const status = err.code === "OTP_RATE_LIMITED" ? 429 : 400;
      return res.status(status).json({ error: err.message, code: err.code });
    }
    next(err);
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        mobile: true,
        fullName: true,
        telegramId: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: "حساب کاربری یافت نشد.", code: "USER_NOT_FOUND" });
    }

    return res.json({ user: { ...user, userId: user.id } });
  } catch (err) {
    return res.status(500).json({ error: "خطا در دریافت اطلاعات کاربری." });
  }
});

router.patch("/profile", requireAuth, async (req, res) => {
  try {
    const { fullName, telegramId } = req.body || {};
    const userId = req.user.id;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: fullName !== undefined ? (String(fullName).trim() || null) : undefined,
        telegramId: telegramId !== undefined ? (String(telegramId).trim() || null) : undefined,
      },
      select: {
        id: true,
        mobile: true,
        fullName: true,
        telegramId: true,
      },
    });

    return res.json({ success: true, user: { ...user, userId: user.id } });
  } catch (err) {
    return res.status(500).json({ error: "خطا در بروزرسانی پروفایل." });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("auth_token", { path: "/" });
  res.clearCookie("token", { path: "/" });
  return res.json({ success: true, message: "خروج موفقیت‌آمیز بود." });
});

module.exports = router;