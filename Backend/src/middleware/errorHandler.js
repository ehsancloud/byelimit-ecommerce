// src/middleware/errorHandler.js

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error("[UNHANDLED ERROR]", err);

  // BigInt نمی‌تواند مستقیم JSON.stringify شود - اگر جایی سرریز کرد اینجا مدیریت شود
  if (err instanceof TypeError && String(err.message).includes("BigInt")) {
    return res.status(500).json({ error: "خطای داخلی محاسبات مالی." });
  }

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === "production"
      ? "خطای غیرمنتظره‌ای رخ داد. لطفاً بعداً دوباره تلاش کنید."
      : err.message,
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: "مسیر یافت نشد." });
}

module.exports = { errorHandler, notFoundHandler };
