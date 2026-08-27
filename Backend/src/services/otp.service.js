const crypto = require("crypto");
const prisma = require("../lib/prisma");

const OTP_LENGTH = 4;
const OTP_TTL_MINUTES = 2;
const MIN_RESEND_INTERVAL_SECONDS = 60;

const melipayamakUsername = process.env.MELIPAYAMAK_USERNAME?.trim() || "19910115126";
const melipayamakPassword = process.env.MELIPAYAMAK_PASSWORD?.trim() || "4039884c-cf92-47fc-9d6a-ffb5acfb651a";
const melipayamakFrom = process.env.MELIPAYAMAK_FROM?.trim() || "50002710011512";

const isSmsConfigured = Boolean(melipayamakUsername && melipayamakPassword);

function normalizeMobile(mobile) {
  if (!mobile) return "";
  let clean = String(mobile).trim();
  clean = clean.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));
  clean = clean.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
  clean = clean.replace(/\D/g, "");
  if (clean.startsWith("98")) clean = "0" + clean.slice(2);
  if (clean.length === 10 && clean.startsWith("9")) clean = "0" + clean;
  return clean;
}

function generateOtp() {
  return crypto.randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, "0");
}

function hashOtp(mobile, code) {
  return crypto
    .createHmac("sha256", process.env.JWT_SECRET || "dev-secret-change-me")
    .update(`${mobile}:${code}`)
    .digest("hex");
}

async function sendOtp(rawMobile, purpose = "LOGIN", ipAddress = null) {
  const mobile = normalizeMobile(rawMobile);

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

  if (!isSmsConfigured) {
    console.warn(`[OTP DEV MODE] کد ${mobile}: ${code}`);
    return { sent: true, devMode: true };
  }

  // متن دقیق درخواستی بدون موارد اضافی
  const text = `کد ورود به بای لیمیت: ${code}`;

  try {
    const res = await fetch("https://rest.payamak-panel.com/api/SendSMS/SendSMS", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: melipayamakUsername,
        password: melipayamakPassword,
        to: mobile,
        from: melipayamakFrom,
        text,
        isFlash: false,
      }),
    });
    const data = await res.json();
    if (data.RetStatus !== 1 && (!data.Value || data.Value.length < 5)) {
      console.error("[Melipayamak Error Response]", data);
      throw new Error(data.StrRetStatus || "خطا در ارسال پیامک");
    }
    return { sent: true, devMode: false };
  } catch (err) {
    console.error("[Melipayamak Error]", err);
    const wrapped = new Error("ارسال پیامک ناموفق بود، لطفاً دوباره تلاش کنید.");
    wrapped.code = "SMS_SEND_FAILED";
    wrapped.cause = err;
    throw wrapped;
  }
}

async function verifyOtp(rawMobile, code, purpose = "LOGIN") {
  const mobile = normalizeMobile(rawMobile);

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
