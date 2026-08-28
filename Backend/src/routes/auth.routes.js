const express = require("express");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const { sendOtp, verifyOtp } = require("../services/otp.service");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();
const THIRTY_THREE_DAYS_MS = 33 * 24 * 60 * 60 * 1000;

router.post("/send-otp", async (req, res, next) => {
  try {
    const { mobile } = req.body;
    if (!mobile) return res.status(400).json({ error: "شماره موبایل الزامی است." });
    
    await sendOtp(mobile, "LOGIN", req.ip);
    res.json({ success: true, message: "کد تایید ارسال شد." });
  } catch (err) {
    // Rate-limiting or SMS send failures should return a helpful message
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
    const { mobile, code } = req.body;
    if (!mobile || !code) return res.status(400).json({ error: "موبایل و کد الزامی هستند." });

    await verifyOtp(mobile, code, "LOGIN");

    let user = await prisma.user.findUnique({ where: { mobile } });
    if (!user) {
      user = await prisma.user.create({
        data: { mobile, role: "USER" },
      });
    }

    const token = jwt.sign(
      { userId: user.id, mobile: user.mobile, role: user.role },
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
      user: { id: user.id, mobile: user.mobile, role: user.role },
      token,
    });
  } catch (err) {
    // For OTP-specific errors show a clear message to the client (bad code, expired, rate limited)
    if (err && err.code && err.code.startsWith("OTP_")) {
      const status = err.code === "OTP_RATE_LIMITED" ? 429 : 400;
      return res.status(status).json({ error: err.message, code: err.code });
    }
    next(err);
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  res.json({ user: req.user });
});

router.post("/logout", (req, res) => {
  res.clearCookie("auth_token", { path: "/" });
  res.clearCookie("token", { path: "/" });
  res.json({ success: true, message: "خروج موفق" });
});

module.exports = router;
