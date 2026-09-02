// Backend/src/services/zibal.service.js
// سرویس درگاه پرداخت زیبال — مطابق مستندات zibaldoc.md
//
// نکات کلیدی:
//  - مبلغ در این API به **ریال** ارسال می‌شود (برخلاف زرین‌پال که تومان است)
//  - callback با GET و Query String فرستاده می‌شود
//  - هدر Referer هنگام هدایت کاربر به /start الزامی است (مرورگر خودکار می‌فرستد)

const IS_SANDBOX = process.env.ZIBAL_SANDBOX === "true";

const BASE_URL = "https://gateway.zibal.ir";
const START_URL = `${BASE_URL}/start`; // GET /start/{trackId}

const MERCHANT_ID = process.env.ZIBAL_MERCHANT_ID || "zibal"; // پیش‌فرض تست زیبال

const ZIBAL_ERROR_MESSAGES = {
  "102": "مرچنت یافت نشد.",
  "103": "مرچنت غیرفعال / عدم امضای قرارداد درگاه.",
  "104": "مرچنت نامعتبر.",
  "105": "مبلغ باید بزرگ‌تر از ۱,۰۰۰ ریال باشد.",
  "106": "کال‌بک‌آدرس نامعتبر است.",
  "107": "پارامتر درصد (percentMode) نامعتبر است.",
  "112": "موجودی کیف پول کارمزد کافی نیست.",
  "113": "مبلغ تراکنش از سقف تعیین‌شده بیشتر است.",
  "115": "آی‌پی سرور در پنل زیبال ثبت نشده است.",
  "201": "تراکنش قبلاً تایید شده است.",
  "202": "سفارش پرداخت نشده یا ناموفق بوده است.",
  "203": "شناسه پیگیری (trackId) نامعتبر است.",
};

function getErrorMessage(code) {
  return (
    ZIBAL_ERROR_MESSAGES[String(code)] ||
    "خطایی در ارتباط با درگاه زیبال رخ داد. لطفاً دوباره تلاش کنید یا با پشتیبانی تماس بگیرید."
  );
}

async function callZibal(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
    // زیبال سمت ایران است؛ با SSD از همان کشور زمان‌بندی عادی دارد
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    return { result: -99, message: `HTTP ${res.status}` };
  }
  try {
    return await res.json();
  } catch {
    return { result: -99, message: "پاسخ نامعتبر از درگاه زیبال." };
  }
}

/**
 * مرحله ۱: درخواست پرداخت و دریافت trackId
 *
 * @param {Object} params
 * @param {number|bigint} params.amountRial - مبلغ به ریال
 * @param {string} params.callbackUrl - آدرس بازگشت پذیرنده
 * @param {string} params.orderId - شناسه سفارش شما (در گزارشات زیبال)
 * @param {string} [params.description]
 * @param {string} [params.mobile]
 */
async function requestPayment({ amountRial, callbackUrl, orderId, description, mobile }) {
  const amount = Number(BigInt(amountRial));
  const payload = {
    merchant: MERCHANT_ID,
    amount, // ریال
    callbackUrl,
    description: description || `پرداخت سفارش ${orderId} - بای لیمیت`,
    orderId,
  };
  if (mobile) payload.mobile = mobile;

  const json = await callZibal("/v1/request", payload);

  if (json.result === 100 && json.trackId) {
    return {
      success: true,
      trackId: json.trackId,
      startPayUrl: `${START_URL}/${json.trackId}`,
      raw: json,
    };
  }

  return {
    success: false,
    errorCode: json.result,
    message: getErrorMessage(json.result),
    raw: json,
  };
}

/**
 * مرحله ۳: تایید پرداخت (Verify)
 * فقط بعد از موفقیت در callback باید صدا زده شود تا تراکنش نهایی و واریز شود.
 */
async function verifyPayment({ trackId }) {
  const json = await callZibal("/v1/verify", {
    merchant: MERCHANT_ID,
    trackId,
  });

  // result 100 = تایید موفق | result 201 = قبلاً تایید شده (idempotent retry)
  if (json.result === 100 || json.result === 201) {
    return {
      success: true,
      alreadyVerified: json.result === 201,
      refId: json.refNumber,
      cardPan: json.cardNumber,
      paidAt: json.paidAt,
      amount: json.amount,
      raw: json,
    };
  }

  return {
    success: false,
    errorCode: json.result,
    message: getErrorMessage(json.result),
    raw: json,
  };
}

/** استعلام وضعیت تراکنش (بدون نهایی‌سازی) */
async function inquiryPayment({ trackId }) {
  const json = await callZibal("/v1/inquiry", {
    merchant: MERCHANT_ID,
    trackId,
  });

  if (json.result === 100) {
    return {
      success: true,
      status: json.status,
      amount: json.amount,
      refId: json.refNumber,
      raw: json,
    };
  }

  return {
    success: false,
    errorCode: json.result,
    message: getErrorMessage(json.result),
    raw: json,
  };
}

/**
 * ترجمه‌ی وضعیت لینک زیبال به نتیجه‌ی قابل‌استفاده:
 * جدول وضعیت‌های زیبال: 1=پرداخت و تایید، 2=پرداخت بدون تایید، 3=لغو، 4..12=خطا، -1=در انتظار
 */
function interpretCallbackStatus(success, status) {
  if (String(success) === "1") {
    if (status === 1) return { ok: true, verified: true };
    if (status === 2) return { ok: true, verified: false };
  }
  return { ok: false, verified: false };
}

module.exports = {
  requestPayment,
  verifyPayment,
  inquiryPayment,
  interpretCallbackStatus,
  getErrorMessage,
  IS_SANDBOX,
  BASE_URL,
};