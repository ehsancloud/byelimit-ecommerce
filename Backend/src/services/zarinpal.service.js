// src/services/zarinpal.service.js
const IS_SANDBOX = process.env.ZARINPAL_SANDBOX === "true";

const BASE_URL = IS_SANDBOX
  ? "https://sandbox.zarinpal.com/pg/v4/payment"
  : "https://api.zarinpal.com/pg/v4/payment";

const STARTPAY_URL = IS_SANDBOX
  ? "https://sandbox.zarinpal.com/pg/StartPay"
  : "https://www.zarinpal.com/pg/StartPay";

const MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID;

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
 * @param {number} params.amountToman
 * @param {string} params.description
 * @param {string} params.orderId
 * @param {string} [params.mobile]
 * @param {string[]} [params.cardPan]
 * @param {string} [params.callbackUrl] - URL کامل Callback شامل orderId؛ اگر نداده شود
 *   از ZARINPAL_CALLBACK_URL محیطی استفاده می‌شود (بدون orderId).
 *   باگ قبلی: route از callbackUrl استفاده می‌کرد اما این پارامتر به تابع داده نمی‌شد.
 */
async function requestPayment({ amountToman, description, orderId, mobile, cardPan, callbackUrl }) {
  const payload = {
    merchant_id: MERCHANT_ID,
    amount: amountToman,
    currency: "IRT",
    description,
    // ✅ FIX: از callbackUrl پویا که orderId دارد استفاده کن؛ fallback به متغیر محیطی
    callback_url: callbackUrl || process.env.ZARINPAL_CALLBACK_URL,
    metadata: { order_id: orderId, mobile },
  };

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
      cardPan: json.data.card_pan,
      cardHash: json.data.card_hash,
      feeType: json.data.fee_type,
      fee: json.data.fee,
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

async function listUnverifiedTransactions() {
  const json = await callZarinpal("unVerified", { merchant_id: MERCHANT_ID });
  if (json.data && json.data.authorities) {
    return { success: true, authorities: json.data.authorities };
  }
  return { success: false, authorities: [] };
}

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

function buildShares(shares) {
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
