// src/services/zarinpal.service.js
//
// پیاده‌سازی کامل درگاه زرین‌پال طبق مستندات رسمی:
// https://www.zarinpal.com/docs/paymentGateway/connectToGateway.html
// https://www.zarinpal.com/docs/paymentGateway/sandBox.html
// https://www.zarinpal.com/docs/paymentGateway/errorList.html
// https://www.zarinpal.com/docs/paymentGateway/moreFeatures/session-validation.html
// https://www.zarinpal.com/docs/paymentGateway/moreFeatures/currency.html
// https://www.zarinpal.com/docs/paymentGateway/moreFeatures/card-pan.html
// https://www.zarinpal.com/docs/paymentGateway/moreFeatures/reverse.html
// https://www.zarinpal.com/docs/paymentGateway/moreFeatures/setshare.html
// https://www.zarinpal.com/docs/paymentGateway/otherMethods/unVerified.html
// https://www.zarinpal.com/docs/paymentGateway/otherMethods/Inquiry.html
// https://www.zarinpal.com/docs/paymentGateway/otherMethods/feeCalculation.html

const IS_SANDBOX = process.env.ZARINPAL_SANDBOX === "true";

const BASE_URL = IS_SANDBOX
  ? "https://sandbox.zarinpal.com/pg/v4/payment"
  : "https://api.zarinpal.com/pg/v4/payment";

const STARTPAY_URL = IS_SANDBOX
  ? "https://sandbox.zarinpal.com/pg/StartPay"
  : "https://www.zarinpal.com/pg/StartPay";

const MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID;

// ---------------------------------------------------------------------------
// نگاشت کدهای خطای زرین‌پال به پیام قابل‌فهم فارسی برای کاربر
// (بخش «مدیریت خطاهای درگاه» از چک‌لیست شما)
// ---------------------------------------------------------------------------
const ZARINPAL_ERROR_MESSAGES = {
  "-9": "خطای اعتبارسنجی؛ مقادیر ورودی صحیح نیست.",
  "-10": "آی‌پی یا مرچنت کد پذیرنده صحیح نیست.",
  "-11": "مرچنت کد فعال نیست، لطفاً با پشتیبانی تماس بگیرید.",
  "-12": "تلاش بیش از حد در بازه زمانی کوتاه، کمی صبر کرده و دوباره تلاش کنید.",
  "-15": "درگاه پرداخت پذیرنده غیرفعال است.",
  "-16": "سطح تایید پذیرنده کافی نیست.",
  "-30": "پذیرنده اجازه دسترسی به سرویس تسهیم (SetShare) را ندارد.",
  "-31": "حساب بانکی تسهیم (SetShare) نامعتبر است.",
  "-32": "درصد/مبلغ تسهیم صحیح نیست.",
  "-33": "درصد تسهیم بیشتر از حد مجاز پذیرنده است.",
  "-34": "مبلغ تسهیم بیشتر از مبلغ کل تراکنش است.",
  "-35": "تعداد افراد تسهیم بیشتر از حد مجاز است.",
  "-40": "اجازه دسترسی به متد مربوطه وجود ندارد.",
  "-50": "مبلغ پرداخت‌شده با مبلغ ثبت‌شده در تراکنش مطابقت ندارد.",
  "-51": "پرداخت ناموفق بود.",
  "-52": "خطای پیش‌بینی‌نشده؛ لطفاً با پشتیبانی زرین‌پال تماس بگیرید.",
  "-53": "این Authority مربوط به این مرچنت کد نیست.",
  "-54": "این Authority نامعتبر است.",
  "101": "این تراکنش قبلاً با موفقیت وریفای شده است.",
};

function getErrorMessage(code) {
  return (
    ZARINPAL_ERROR_MESSAGES[String(code)] ||
    "خطایی در ارتباط با درگاه پرداخت رخ داد. لطفاً دوباره تلاش کنید یا با پشتیبانی تماس بگیرید."
  );
}

async function callZarinpal(endpoint, body) {
  const res = await fetch(`${BASE_URL}/${endpoint}.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  return json;
}

/**
 * مرحله ۱: درخواست ساخت تراکنش و دریافت Authority
 *
 * @param {Object} params
 * @param {number} params.amountToman - مبلغ به تومان (ورودی BigInt ریال باید قبلاً به تومان تبدیل شده باشد)
 * @param {string} params.description
 * @param {string} params.orderId - شناسه سفارش داخلی ما (برای metadata، نه Authority)
 * @param {string} [params.mobile]
 * @param {string[]} [params.cardPan] - طبق ویژگی card_pan: محدودسازی پرداخت فقط به همین کارت
 */
async function requestPayment({ amountToman, description, orderId, mobile, cardPan }) {
  const payload = {
    merchant_id: MERCHANT_ID,
    amount: amountToman,
    currency: "IRT", // تعیین دقیق واحد پولی طبق چک‌لیست - تومان (IRT). برای ریال از "IRR" استفاده کنید.
    description,
    callback_url: process.env.ZARINPAL_CALLBACK_URL,
    metadata: { order_id: orderId, mobile },
  };

  // محدودسازی شماره کارت (Card PAN) - اگر کاربر شماره کارت خود را پیش از خرید داده باشد
  if (cardPan && cardPan.length > 0) {
    payload.card_pan = cardPan;
  }

  const json = await callZarinpal("request", payload);

  if (json.data && json.data.code === 100) {
    return {
      success: true,
      authority: json.data.authority,
      startPayUrl: `${STARTPAY_URL}/${json.data.authority}`,
      fee: json.data.fee,
      feeType: json.data.fee_type,
    };
  }

  const errorCode = json.errors?.code ?? json.data?.code;
  return {
    success: false,
    errorCode,
    message: getErrorMessage(errorCode),
    raw: json,
  };
}

/**
 * مرحله ۲: وریفای پرداخت پس از بازگشت کاربر از درگاه.
 * توجه: این تابع فقط با زرین‌پال صحبت می‌کند - تصمیم‌گیری درباره تغییر وضعیت
 * سفارش در دیتابیس (تراکنش اتمیک، قفل‌گذاری موجودی) باید در لایه‌ی بالاتر
 * (payment.routes.js) انجام شود، نه اینجا.
 */
async function verifyPayment({ amountToman, authority }) {
  const json = await callZarinpal("verify", {
    merchant_id: MERCHANT_ID,
    amount: amountToman,
    authority,
    currency: "IRT",
  });

  if (json.data && (json.data.code === 100 || json.data.code === 101)) {
    return {
      success: true,
      alreadyVerified: json.data.code === 101,
      refId: json.data.ref_id,
      cardPan: json.data.card_pan, // شماره کارت پرداخت‌کننده (masked)
      cardHash: json.data.card_hash,
      feeType: json.data.fee_type,
      fee: json.data.fee, // کارمزد کسرشده - باید در Payment.feeRial لاگ شود
    };
  }

  const errorCode = json.errors?.code ?? json.data?.code;
  return {
    success: false,
    errorCode,
    message: getErrorMessage(errorCode),
    raw: json,
  };
}

/**
 * استعلام وضعیت یک تراکنش مشکوک، پیش از هرگونه تغییر وضعیت در دیتابیس.
 */
async function inquiryPayment({ authority }) {
  const json = await callZarinpal("inquiry", {
    merchant_id: MERCHANT_ID,
    authority,
  });

  if (json.data) {
    return { success: true, status: json.data.status, code: json.data.code };
  }
  const errorCode = json.errors?.code;
  return { success: false, errorCode, message: getErrorMessage(errorCode) };
}

/**
 * لیست تراکنش‌های Verify‌نشده (کاربر پول داده اما کال‌بک به سرور نرسیده).
 * توسط کران‌جاب دوره‌ای فراخوانی می‌شود - src/jobs/unverified-cron.js
 */
async function listUnverifiedTransactions() {
  const json = await callZarinpal("unVerified", { merchant_id: MERCHANT_ID });
  if (json.data && json.data.authorities) {
    return { success: true, authorities: json.data.authorities };
  }
  return { success: false, authorities: [] };
}

/**
 * بازگشت وجه خودکار (Reverse) - وقتی پول کسر و وریفای شده اما تحویل ناموفق بوده
 * (مثلاً موجودی اکانت در دیتابیس تمام شده). طبق مستندات زرین‌پال، Reverse فقط
 * تا مدت محدودی پس از verify قابل فراخوانی است.
 */
async function reversePayment({ authority }) {
  const json = await callZarinpal("reverse", {
    merchant_id: MERCHANT_ID,
    authority,
  });

  if (json.data && json.data.code === 100) {
    return { success: true };
  }
  const errorCode = json.errors?.code ?? json.data?.code;
  return { success: false, errorCode, message: getErrorMessage(errorCode) };
}

/**
 * تسهیم پرداخت (SetShare) - برای آینده، اگر سیستم افیلیت/چندفروشندگی اضافه شود.
 * فعلاً فقط اسکلت آماده؛ در صورت نیاز به فیلد `shares` در payload اضافه شود.
 * https://www.zarinpal.com/docs/paymentGateway/moreFeatures/setshare.html
 */
function buildShares(shares) {
  // shares: [{ iban, amount, description }]
  // TODO: وقتی سیستم افیلیت/چندفروشندگی پیاده شد، این را به payload درخواست اضافه کنید.
  return shares || [];
}

module.exports = {
  requestPayment,
  verifyPayment,
  inquiryPayment,
  listUnverifiedTransactions,
  reversePayment,
  buildShares,
  getErrorMessage,
  IS_SANDBOX,
};
