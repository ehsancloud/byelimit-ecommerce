// src/services/otp.service.js
const crypto = require("crypto");
const MelipayamakApi = require("melipayamak-api");
const prisma = require("../lib/prisma");

const OTP_LENGTH = 4;
const OTP_TTL_MINUTES = 2;
const MAX_ATTEMPTS = 5;
// حداقل فاصله بین دو درخواست ارسال کد برای یک شماره - جلوگیری از اسپم پیامکی
const MIN_RESEND_INTERVAL_SECONDS = 60;

const melipayamakUsername = process.env.MELIPAYAMAK_USERNAME?.trim();
const melipayamakPassword = process.env.MELIPAYAMAK_PASSWORD?.trim();
const melipayamakFrom = process.env.MELIPAYAMAK_FROM?.trim() || process.env.MELIPAYAMAK_SENDER?.trim() || "5000";

const melipayamakClient =
  melipayamakUsername && melipayamakPassword
    ? new MelipayamakApi(melipayamakUsername, melipayamakPassword)
    : null;

function generateOtp() {
  // crypto.randomInt به‌جای Math.random - تصادفی‌سازی امن رمزنگاری‌شده
  return crypto.randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, "0");
}

function hashOtp(mobile, code) {
  // HMAC-SHA256 با کلید سرور - سریع‌تر از bcrypt و برای کد کوتاه‌مدت ۴ رقمی با
  // محدودیت تعداد تلاش (attemptCount) کفایت می‌کند.
  return crypto
    .createHmac("sha256", process.env.JWT_SECRET || "dev-secret-change-me")
    .update(`${mobile}:${code}`)
    .digest("hex");
}

function isMelipayamakFailure(response) {
  if (!response || typeof response !== "object") return false;
  const errorValue = response.error || response.Error || response.message || response.Message;
  if (errorValue) return true;
  return !!response.status && String(response.status).toLowerCase() === "error";
}

/**
 * ارسال کد OTP به شماره موبایل از طریق Melipayamak.
 * مستندات: https://www.melipayamak.com/api/sendotp/
 */
async function sendOtp(mobile, purpose = "LOGIN", ipAddress = null) {
  const recentOtp = await prisma.otpCode.findFirst({
    where: { mobile, purpose, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (recentOtp) {
    const secondsSinceLastSend = (Date.now() - recentOtp.createdAt.getTime()) / 1000;
    if (secondsSinceLastSend < MIN_RESEND_INTERVAL_SECONDS) {
      const waitSeconds = Math.ceil(MIN_RESEND_INTERVAL_SECONDS - secondsSinceLastSend);
      const err = new Error(`لطفاً ${waitSeconds} ثانیه دیگر دوباره تلاش کنید.`);
      err.code = "OTP_RATE_LIMITED";
      throw err;
    }
  }

  const code = generateOtp();
  const codeHash = hashOtp(mobile, code);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await prisma.otpCode.create({
    data: { mobile, purpose, codeHash, expiresAt, ipAddress },
  });

  if (!melipayamakClient) {
    // در محیط توسعه بدون کلید واقعی یا اعتبارنامه سرویس پیامک - فقط لاگ می‌کنیم
    console.warn(`[OTP DEV MODE] کد ${mobile}: ${code}`);
    return { sent: true, devMode: true };
  }

  const purposeText = purpose === "CHECKOUT_VERIFY" ? "تایید سفارش" : "ورود";
  const text = `کد تایید ${code} برای ${purposeText} در byelimit است. این کد فقط 2 دقیقه معتبر است.`;

  try {
    const response = await melipayamakClient.sms().send(mobile, melipayamakFrom, text);
    if (isMelipayamakFailure(response)) {
      const err = new Error("ارسال پیامک ناموفق بود، لطفاً دوباره تلاش کنید.");
      err.code = "SMS_SEND_FAILED";
      err.gatewayResponse = response;
      throw err;
    }
    return { sent: true, devMode: false };
  } catch (err) {
    if (err.code === "SMS_SEND_FAILED") throw err;
    const wrapped = new Error("ارسال پیامک ناموفق بود، لطفاً دوباره تلاش کنید.");
    wrapped.code = "SMS_SEND_FAILED";
    wrapped.cause = err;
    throw wrapped;
  }
}

/**
 * تایید کد OTP وارد شده توسط کاربر.
 * @returns {Promise<boolean>} true اگر کد صحیح و معتبر بود
 */
async function verifyOtp(mobile, code, purpose = "LOGIN") {
  const otpRecord = await prisma.otpCode.findFirst({
    where: { mobile, purpose, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) {
    const err = new Error("کدی برای این شماره یافت نشد یا قبلاً استفاده شده است.");
    err.code = "OTP_NOT_FOUND";
    throw err;
  }

  if (otpRecord.expiresAt < new Date()) {
    const err = new Error("کد تایید منقضی شده است. کد جدید درخواست کنید.");
    err.code = "OTP_EXPIRED";
    throw err;
  }

  if (otpRecord.attemptCount >= otpRecord.maxAttempts) {
    const err = new Error("تعداد تلاش‌های مجاز تمام شده. کد جدید درخواست کنید.");
    err.code = "OTP_MAX_ATTEMPTS";
    throw err;
  }

  const isValid = otpRecord.codeHash === hashOtp(mobile, code);

  if (!isValid) {
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { attemptCount: { increment: 1 } },
    });
    const err = new Error("کد تایید نادرست است.");
    err.code = "OTP_INVALID";
    throw err;
  }

  await prisma.otpCode.update({
    where: { id: otpRecord.id },
    data: { consumedAt: new Date() },
  });

  return true;
}

module.exports = { sendOtp, verifyOtp };
