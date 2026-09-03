// Backend/src/services/zibal.service.js
// پیاده‌سازی سرویس درگاه زیبال با Fallback امن

const BASE_URL = "https://gateway.zibal.ir";
const DEFAULT_MERCHANT = "6a97e1c9a9eb8b31692e4c28"; // مرچنت اختصاصی فعال بای لیمیت

function getMerchant() {
  const merchant = process.env.ZIBAL_MERCHANT_ID?.trim();
  return merchant || DEFAULT_MERCHANT;
}

const ZIBAL_RESULT_MESSAGES = {
  100: "با موفقیت تایید شد.",
  102: "merchant یافت نشد.",
  103: "merchant غیرفعال / عدم امضا قرارداد درگاه مربوطه",
  104: "merchant نامعتبر است.",
  105: "مبلغ تراکنش (amount) بایستی بزرگتر از 1,000 ریال باشد.",
  106: "آدرس بازگشت (callbackUrl) نامعتبر است.",
  107: "درصد تسهیم نامعتبر است.",
  112: "موجودی کیف پول کارمزد کافی نیست.",
  113: "مبلغ تراکنش از سقف مجاز بیشتر است.",
  115: "آدرس IP سرور شما در پنل کاربری زیبال ثبت نشده است.",
  201: "تراکنش قبلاً تأیید شده است.",
  202: "سفارش پرداخت نشده یا ناموفق بوده است.",
  203: "شناسه پیگیری (trackId) نامعتبر است.",
};

function getZibalErrorMessage(resultCode) {
  return ZIBAL_RESULT_MESSAGES[resultCode] || `خطای درگاه زیبال (کد ${resultCode})`;
}

/**
 * مرحله ۱: درخواست پرداخت و دریافت trackId
 */
async function requestPayment({ amountRial, callbackUrl, description, orderId, mobile }) {
  try {
    const merchant = getMerchant();
    const numericAmount = Math.trunc(Number(amountRial));

    if (!numericAmount || numericAmount < 1000) {
      return {
        success: false,
        result: 105,
        message: "مبلغ سفارش کمتر از ۱,۰۰۰ ریال است و امکان اتصال به درگاه وجود ندارد.",
      };
    }

    const payload = {
      merchant,
      amount: numericAmount,
      callbackUrl,
      description: description || `خرید سفارش ${orderId} - بای لیمیت`,
      orderId: String(orderId),
    };

    if (mobile) payload.mobile = String(mobile).trim();

    const res = await fetch(`${BASE_URL}/v1/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (json.result === 100) {
      return {
        success: true,
        trackId: String(json.trackId),
        result: json.result,
        startPayUrl: `${BASE_URL}/start/${json.trackId}`,
      };
    }

    return {
      success: false,
      result: json.result,
      message: getZibalErrorMessage(json.result),
    };
  } catch (err) {
    console.error("[Zibal Request Network Error]:", err);
    return {
      success: false,
      result: -2,
      message: "خطا در اتصال شبکه به درگاه زیبال.",
      error: err.message,
    };
  }
}

/**
 * مرحله ۳: تایید تراکنش (Verify)
 */
async function verifyPayment(trackId) {
  try {
    const merchant = getMerchant();
    const numericTrackId = Number(trackId);

    const res = await fetch(`${BASE_URL}/v1/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant,
        trackId: numericTrackId,
      }),
    });

    const json = await res.json();

    if (json.result === 100 || json.result === 201) {
      return {
        success: true,
        alreadyVerified: json.result === 201,
        result: json.result,
        amount: json.amount ? BigInt(json.amount) : null,
        refNumber: json.refNumber ? String(json.refNumber) : null,
        cardNumber: json.cardNumber || null,
        paidAt: json.paidAt || null,
      };
    }

    return {
      success: false,
      result: json.result,
      message: getZibalErrorMessage(json.result),
    };
  } catch (err) {
    console.error("[Zibal Verify Network Error]:", err);
    return {
      success: false,
      result: -2,
      message: "خطا در استعلام تایید پرداخت از زیبال.",
      error: err.message,
    };
  }
}

/**
 * مرحله ۴: استعلام تراکنش (Inquiry)
 */
async function inquiryPayment(trackId) {
  try {
    const merchant = getMerchant();
    const res = await fetch(`${BASE_URL}/v1/inquiry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant,
        trackId: Number(trackId),
      }),
    });
    const json = await res.json();
    return { success: json.result === 100, ...json };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

module.exports = {
  requestPayment,
  verifyPayment,
  inquiryPayment,
  getZibalErrorMessage,
};