// src/routes/auth.routes.js
const express = require("express");
const { z } = require("zod");
const prisma = require("../lib/prisma");
const otpService = require("../services/otp.service");
const { issueAuthCookie } = require("../middleware/auth");
const { otpRateLimiter } = require("../middleware/rateLimit");

const router = express.Router();

const mobileSchema = z.string().regex(/^09\d{9}$/, "شماره موبایل معتبر نیست.");

router.post("/send-otp", otpRateLimiter, async (req, res) => {
  const parsed = mobileSchema.safeParse(req.body?.mobile);
  if (!parsed.success) {
    return res.status(400).json({ error: "شماره موبایل معتبر نیست." });
  }
  const mobile = parsed.data;

  try {
    const result = await otpService.sendOtp(mobile, "LOGIN", req.ip);
    return res.json({ ok: true, devMode: result.devMode || false });
  } catch (err) {
    const status = err.code === "OTP_RATE_LIMITED" ? 429 : 500;
    return res.status(status).json({ error: err.message, code: err.code });
  }
});

router.post("/verify-otp", otpRateLimiter, async (req, res) => {
  const schema = z.object({
    mobile: mobileSchema,
    code: z.string().length(4),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "اطلاعات ارسالی نامعتبر است." });
  }
  const { mobile, code } = parsed.data;

  try {
    await otpService.verifyOtp(mobile, code, "LOGIN");

    const user = await prisma.user.upsert({
      where: { mobile },
      update: { lastLoginAt: new Date() },
      create: { mobile, lastLoginAt: new Date() },
    });

    issueAuthCookie(res, user);

    return res.json({
      ok: true,
      user: { id: user.id, mobile: user.mobile, fullName: user.fullName },
    });
  } catch (err) {
    const statusMap = {
      OTP_NOT_FOUND: 400,
      OTP_EXPIRED: 400,
      OTP_MAX_ATTEMPTS: 429,
      OTP_INVALID: 400,
    };
    return res.status(statusMap[err.code] || 500).json({ error: err.message, code: err.code });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("auth_token", { domain: process.env.COOKIE_DOMAIN });
  res.json({ ok: true });
});

// کوکی auth_token عمداً httpOnly است (محافظت در برابر XSS) - یعنی جاوااسکریپت
// فرانت‌اند نمی‌تواند مستقیم document.cookie آن را بخواند. به همین دلیل فرانت‌اند
// برای فهمیدن وضعیت لاگین باید این endpoint را صدا بزند (با credentials: 'include').
const { requireAuth } = require("../middleware/auth");
router.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user) return res.status(401).json({ error: "کاربر یافت نشد." });
  res.json({ id: user.id, mobile: user.mobile, fullName: user.fullName });
});

module.exports = router;
