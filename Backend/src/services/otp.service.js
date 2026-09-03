// Backend/src/services/otp.service.js
const crypto = require("crypto");
const prisma = require("../lib/prisma");

const OTP_LENGTH = 5;
const OTP_TTL_MINUTES = 2;
const MIN_RESEND_INTERVAL_SECONDS = 60;

const melipayamakUsername = process.env.MELIPAYAMAK_USERNAME?.trim();
const melipayamakPassword = process.env.MELIPAYAMAK_PASSWORD?.trim();
const melipayamakFrom = process.env.MELIPAYAMAK_FROM?.trim();
const melipayamakBodyId = process.env.MELIPAYAMAK_BODY_ID?.trim(); // شناسه پترن خدماتی

const isSmsConfigured = Boolean(melipayamakUsername && melipayamakPassword);

function normalizeMobile(mobile) {
  if (!mobile) return "";
  let clean = String(mobile).trim();
  // تبدیل اعداد فارسی و عربی به انگلیسی
  clean = clean.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));
  clean = clean.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
  clean = clean.replace(/\D/g, "");

  if (clean.startsWith("0098")) clean = "0" + clean.slice(4);
  else if (clean.startsWith("98")) clean = "0" + clean.slice(2);
  else if (clean.length === 10 && clean.startsWith("9")) clean = "0" + clean;

  return clean;
}

function isValidIranianMobile(mobile) {
  return /^09\d{9}$/.test(mobile);
}

function generateOtp() {
  const min = 10 ** (OTP_LENGTH - 1);
  const max = 10 ** OTP_LENGTH;
  return crypto.randomInt(min, max).toString();
}

function hashOtp(mobile, code) {
  const secret = process.env.JWT_SECRET || process.env.OTP_SECRET || "byelimit-otp-secure-key";
  return crypto
    .createHmac("sha256", secret)
    .update(`${mobile}:${code}`)
    .digest("hex");
}

async function sendOtp(rawMobile, purpose = "LOGIN", ipAddress = null) {
  const mobile = normalizeMobile(rawMobile);
  if (!isValidIranianMobile(mobile)) {
    const err = new Error("شماره موبایل وارد شده معتبر نیست.");
    err.code = "INVALID_MOBILE";
    throw err;
  }

  // بررسی فاصله زمانی مجاز ارسال مجدد
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

  // محیط توسعه (بدون تنظیمات پیامک)
  if (!isSmsConfigured) {
    console.warn(`\x1b[33m[OTP DEV MODE] کد تایید برای شماره ${mobile}: ${code}\x1b[0m`);
    return { sent: true, devMode: true };
  }

  try {
    let res;
    // اگر پترن خدماتی تنظیم شده باشد، برای عبور از بلک‌لیست از BaseServiceNumber استفاده می‌شود
    if (melipayamakBodyId) {
      res = await fetch("https://rest.payamak-panel.com/api/SendSMS/BaseServiceNumber", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: melipayamakUsername,
          password: melipayamakPassword,
          text: [code],
          to: mobile,
          bodyId: Number(melipayamakBodyId),
        }),
      });
    } else {
      const text = `کد ورود به بای لیمیت: ${code}`;
      res = await fetch("https://rest.payamak-panel.com/api/SendSMS/SendSMS", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: melipayamakUsername,
          password: melipayamakPassword,
          to: mobile,
          from: melipayamakFrom || "",
          text,
          isFlash: false,
        }),
      });
    }

    const data = await res.json();
    if (data.RetStatus !== 1 && (!data.Value || data.Value.length < 5)) {
      console.error("[Melipayamak Error Response]", data);
      throw new Error(data.StrRetStatus || "خطا در ارسال پیامک از طریق پنل");
    }

    return { sent: true, devMode: false };
  } catch (err) {
    console.error("[Melipayamak Service Error]", err);
    const wrapped = new Error("ارسال پیامک ناموفق بود، لطفاً دوباره تلاش کنید.");
    wrapped.code = "SMS_SEND_FAILED";
    wrapped.cause = err;
    throw wrapped;
  }
}

async function verifyOtp(rawMobile, code, purpose = "LOGIN") {
  const mobile = normalizeMobile(rawMobile);
  const trimmedCode = String(code || "").trim();

  if (!isValidIranianMobile(mobile)) {
    const err = new Error("شماره موبایل وارد شده نامعتبر است.");
    err.code = "INVALID_MOBILE";
    throw err;
  }

  const now = new Date();
  const otpRecord = await prisma.otpCode.findFirst({
    where: { mobile, purpose, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) {
    const err = new Error("کدی برای این شماره یافت نشد یا قبلاً استفاده شده است.");
    err.code = "OTP_NOT_FOUND";
    throw err;
  }

  if (otpRecord.expiresAt < now) {
    const err = new Error("کد تایید منقضی شده است. کد جدید درخواست کنید.");
    err.code = "OTP_EXPIRED";
    throw err;
  }

  // افزایش اتمیک تعداد تلاش‌ها جهت مسدودسازی حملات Brute Force و Race Condition
  const updatedCountRecord = await prisma.otpCode.updateMany({
    where: {
      id: otpRecord.id,
      consumedAt: null,
      attemptCount: { lt: otpRecord.maxAttempts },
      expiresAt: { gt: now },
    },
    data: { attemptCount: { increment: 1 } },
  });

  if (updatedCountRecord.count === 0) {
    const err = new Error("تعداد تلاش‌های مجاز تمام شده است. لطفاً مجدداً درخواست کد کنید.");
    err.code = "OTP_MAX_ATTEMPTS";
    throw err;
  }

  // صحت‌سنجی کد ارسالی
  const expectedHash = hashOtp(mobile, trimmedCode);
  const isValid = crypto.timingSafeEqual(
    Buffer.from(otpRecord.codeHash, "hex"),
    Buffer.from(expectedHash, "hex")
  );

  if (!isValid) {
    const remaining = otpRecord.maxAttempts - (otpRecord.attemptCount + 1);
    const err = new Error(
      remaining > 0
        ? `کد تایید نادرست است. (${remaining} تلاش باقی‌مانده)`
        : "تعداد تلاش‌های مجاز تمام شد. لطفاً کد جدید دریافت کنید."
    );
    err.code = "OTP_INVALID";
    throw err;
  }

  // مصرف قطعی کد
  await prisma.otpCode.update({
    where: { id: otpRecord.id },
    data: { consumedAt: new Date() },
  });

  return true;
}

module.exports = {
  sendOtp,
  verifyOtp,
  normalizeMobile,
  isValidIranianMobile,
};