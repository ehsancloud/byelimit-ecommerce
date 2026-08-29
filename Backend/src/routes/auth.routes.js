// src/routes/auth.routes.js
const express = require("express");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const { sendOtp, verifyOtp, normalizeMobile } = require("../services/otp.service");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();
const THIRTY_THREE_DAYS_MS = 33 * 24 * 60 * 60 * 1000;

router.post("/send-otp", async (req, res, next) => {
  try {
    const mobile = normalizeMobile(req.body.mobile);
    if (!mobile) return res.status(400).json({ error: "شماره موبایل الزامی است." });

    await sendOtp(mobile, "LOGIN", req.ip);
    res.json({ success: true, message: "کد تایید ارسال شد." });
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
    if (!mobile || !code) return res.status(400).json({ error: "موبایل و کد الزامی هستند." });

    await verifyOtp(mobile, String(code).trim(), "LOGIN");

    let user = await prisma.user.findUnique({ where: { mobile } });
    if (!user) {
      user = await prisma.user.create({
        data: { mobile },
      });
    }

    const token = jwt.sign(
      { userId: user.id, mobile: user.mobile },
      process.env.JWT_SECRET || "dev-secret-change-me",
      { expiresIn: "33d" }
    );

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: THIRTY_THREE_DAYS_MS,
      path: "/",
    });

    res.json({
      success: true,
      user: { id: user.id, mobile: user.mobile, fullName: user.fullName },
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

// ✅ FIX: اطلاعات کامل کاربر (شامل fullName و telegramId) از دیتابیس برگشت داده می‌شود
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId || req.user.id },
      select: {
        id: true,
        mobile: true,
        fullName: true,
        telegramId: true,
        createdAt: true,
      },
    });
    if (!user) return res.status(401).json({ error: "کاربر یافت نشد." });
    res.json({ user: { ...user, userId: user.id } });
  } catch (err) {
    res.status(500).json({ error: "خطا در دریافت اطلاعات کاربر." });
  }
});

// ✅ NEW: بروزرسانی پروفایل کاربر از پنل کاربری
router.patch("/profile", authMiddleware, async (req, res) => {
  try {
    const { fullName, telegramId } = req.body || {};
    const userId = req.user.userId || req.user.id;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: fullName !== undefined ? (fullName || null) : undefined,
        telegramId: telegramId !== undefined ? (telegramId || null) : undefined,
      },
      select: { id: true, mobile: true, fullName: true, telegramId: true },
    });

    res.json({ success: true, user: { ...user, userId: user.id } });
  } catch (err) {
    res.status(500).json({ error: "خطا در بروزرسانی پروفایل." });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("auth_token", { path: "/" });
  res.clearCookie("token", { path: "/" });
  res.json({ success: true, message: "خروج موفق" });
});

module.exports = router;
