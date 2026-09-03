// Backend/src/services/zibal.service.js
// پیاده‌سازی رسمی درگاه پرداخت زیبال منطبق بر مستندات v1.0.0

const BASE_URL = "https://gateway.zibal.ir";

function getMerchant() {
  const merchant = process.env.ZIBAL_MERCHANT_ID?.trim();
  if (!merchant) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("ZIBAL_MERCHANT_ID در فایل .env تعریف نشده است.");
    }
    // در محیط تست و توسعه از مرچنت تستی رسمی زیبال استفاده می‌شود
    return "zibal";
  }
  return merchant;
}

const ZIBAL_RESULT_MESSAGES = {
  100: "با موفقیت تایید شد.",
  102: "merchant یافت نشد.",
  103: "merchant غیرفعال / عدم امضا قرارداد درگاه مربوطه",
  104: "merchant نامعتبر است.",
  105: "مبلغ تراکنش (amount) بایستی بزرگتر از 1,000 ریال باشد.",
  106: "آدرس بازگشت (callbackUrl) نامعتبر است. (باید با http یا https آغاز شود)",
  107: "درصد تسهیم (percentMode) نامعتبر است.",
  108: "یک یا چند ذی‌نفع در تسهیم نامعتبر هستند.",
  109: "یک یا چند ذی‌نفع در تسهیم غیرفعال هستند.",
  110: "شناسه self در تسهیم وجود ندارد.",
  111: "مبلغ با مجموع سهم‌ها در تسهیم برابر نیست.",
  112: "موجودی کیف پول کارمزد جهت کسر کارمزد کافی نیست.",
  113: "مبلغ تراکنش از سقف میزان مجاز تراکنش بیشتر است.",
  114: "کد ملی ارسالی نامعتبر است.",
  115: "آدرس IP سرور شما در پنل کاربری زیبال ثبت نشده است.",
  116: "نحوه اخذ کارمزد (feeMode) نامعتبر است.",
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
async function requestPayment({ amountRial, callbackUrl, description, orderId, mobile, nationalCode, allowedCards }) {
  const merchant = getMerchant();
  const numericAmount = Number(amountRial);

  if (!numericAmount || numericAmount < 1000) {
    return {
      success: false,
      result: 105,
      message: "حداقل مبلغ قابل پرداخت در درگاه ۱,۰۰۰ ریال (۱۰۰ تومان) است.",
    };
  }

  const payload = {
    merchant,
    amount: numericAmount, // ریال
    callbackUrl,
    description: description || `پرداخت سفارش ${orderId} - بای لیمیت`,
    orderId: String(orderId),
  };

  if (mobile) payload.mobile = String(mobile).trim();
  if (nationalCode) payload.nationalCode = String(nationalCode).trim();
  if (Array.isArray(allowedCards) && allowedCards.length > 0) payload.allowedCards = allowedCards;

  try {
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
    console.error("[Zibal Request Error]:", err);
    return {
      success: false,
      result: -2,
      message: "خطا در برقراری ارتباط با سرور درگاه پرداخت زیبال.",
      error: err,
    };
  }
}

/**
 * مرحله ۳: تایید تراکنش (Verify)
 */
async function verifyPayment(trackId) {
  const merchant = getMerchant();
  const numericTrackId = Number(trackId);

  if (!numericTrackId) {
    return {
      success: false,
      result: 203,
      message: "شناسه تراکنش نامعتبر است.",
    };
  }

  try {
    const res = await fetch(`${BASE_URL}/v1/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant,
        trackId: numericTrackId,
      }),
    });

    const json = await res.json();

    // نتیجه ۱۰۰: موفقیت‌آمیز | نتیجه ۲۰۱: قبلاً تأیید شده
    if (json.result === 100 || json.result === 201) {
      return {
        success: true,
        alreadyVerified: json.result === 201,
        result: json.result,
        amount: json.amount ? BigInt(json.amount) : null, // مبلغ تاییدشده به ریال
        refNumber: json.refNumber ? String(json.refNumber) : null,
        cardNumber: json.cardNumber || null,
        paidAt: json.paidAt || null,
        description: json.description || null,
        orderId: json.orderId || null,
      };
    }

    return {
      success: false,
      result: json.result,
      status: json.status,
      message: getZibalErrorMessage(json.result),
    };
  } catch (err) {
    console.error("[Zibal Verify Error]:", err);
    return {
      success: false,
      result: -2,
      message: "خطای شبکه در هنگام استعلام تاییدیه از زیبال.",
      error: err,
    };
  }
}

/**
 * مرحله ۴: استعلام سوابق تراکنش (Inquiry)
 */
async function inquiryPayment(trackId) {
  const merchant = getMerchant();
  const numericTrackId = Number(trackId);

  try {
    const res = await fetch(`${BASE_URL}/v1/inquiry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant,
        trackId: numericTrackId,
      }),
    });

    const json = await res.json();

    return {
      success: json.result === 100,
      result: json.result,
      message: getZibalErrorMessage(json.result),
      ...json,
    };
  } catch (err) {
    console.error("[Zibal Inquiry Error]:", err);
    return {
      success: false,
      result: -2,
      message: "خطا در استعلام تراکنش از درگاه زیبال.",
      error: err,
    };
  }
}

module.exports = {
  requestPayment,
  verifyPayment,
  inquiryPayment,
  getZibalErrorMessage,
};