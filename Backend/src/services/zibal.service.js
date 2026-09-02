// src/services/zibal.service.js
// درگاه پرداخت زیبال - مرچنت: 6a97e1c9a9eb8b31692e4c28
// مستندات: https://gateway.zibal.ir

const MERCHANT = process.env.ZIBAL_MERCHANT_ID || "6a97e1c9a9eb8b31692e4c28";
const BASE_URL = "https://gateway.zibal.ir";

const ZIBAL_RESULT_MESSAGES = {
  100: "موفق",
  102: "merchant یافت نشد.",
  103: "merchant غیر فعال است.",
  104: "merchant نامعتبر است.",
  105: "amount بایستی بزرگتر از 1,000 ریال باشد.",
  106: "callbackUrl نامعتبر است.",
  113: "amount مبلغ تراکنش از سقف مجاز بیشتر است.",
  201: "قبلاً تأیید شده است.",
  202: "سفارش پرداخت نشده یا ناموفق است.",
  203: "trackId نامعتبر است.",
};

function getZibalError(result) {
  return ZIBAL_RESULT_MESSAGES[result] || `خطای زیبال: کد ${result}`;
}

/**
 * مرحله ۱: درخواست پرداخت و دریافت trackId
 * @param {Object} params
 * @param {bigint} params.amountRial - مبلغ به ریال
 * @param {string} params.callbackUrl
 * @param {string} params.description
 * @param {string} params.orderId
 * @param {string} [params.mobile]
 */
async function requestPayment({ amountRial, callbackUrl, description, orderId, mobile }) {
  const body = {
    merchant: MERCHANT,
    amount: Number(amountRial), // ریال
    callbackUrl,
    description,
    orderId,
  };
  if (mobile) body.mobile = mobile;

  const res = await fetch(`${BASE_URL}/v1/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();

  if (json.result === 100) {
    return {
      success: true,
      trackId: String(json.trackId),
      startPayUrl: `${BASE_URL}/start/${json.trackId}`,
    };
  }

  return {
    success: false,
    result: json.result,
    message: getZibalError(json.result),
  };
}

/**
 * مرحله ۳: تأیید پرداخت
 * @param {string} trackId
 */
async function verifyPayment(trackId) {
  const res = await fetch(`${BASE_URL}/v1/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ merchant: MERCHANT, trackId: Number(trackId) }),
  });
  const json = await res.json();

  // 100 = موفق, 201 = قبلاً تأیید شده
  if (json.result === 100 || json.result === 201) {
    return {
      success: true,
      alreadyVerified: json.result === 201,
      refNumber: json.refNumber ? String(json.refNumber) : null,
      cardNumber: json.cardNumber || null,
      amount: json.amount,
    };
  }

  return {
    success: false,
    result: json.result,
    message: getZibalError(json.result),
  };
}

/**
 * استعلام وضعیت تراکنش
 */
async function inquiryPayment(trackId) {
  const res = await fetch(`${BASE_URL}/v1/inquiry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ merchant: MERCHANT, trackId: Number(trackId) }),
  });
  const json = await res.json();
  return { success: json.result === 100, ...json };
}

module.exports = { requestPayment, verifyPayment, inquiryPayment, getZibalError };
