// src/middleware/auth.js
const jwt = require("jsonwebtoken");

/**
 * برای مسیرهایی که حتماً باید لاگین باشند (مثل /dashboard APIs).
 */
function requireAuth(req, res, next) {
  const token = req.cookies?.auth_token;
  if (!token) {
    return res.status(401).json({ error: "لطفاً ابتدا وارد حساب کاربری خود شوید." });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { userId, mobile }
    next();
  } catch {
    return res.status(401).json({ error: "نشست شما منقضی شده است، دوباره وارد شوید." });
  }
}

/**
 * برای مسیرهایی که هم کاربر مهمان و هم لاگین‌شده مجازند (سبد خرید، چک‌اوت).
 * اگر توکن معتبر بود req.user را پر می‌کند، وگرنه بدون خطا عبور می‌دهد.
 */
function optionalAuth(req, res, next) {
  const token = req.cookies?.auth_token;
  if (!token) return next();
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    // توکن نامعتبر/منقضی - کاربر را به‌عنوان مهمان در نظر بگیر، خطا نده
  }
  next();
}

function issueAuthCookie(res, user) {
  const token = jwt.sign(
    { userId: user.id, mobile: user.mobile },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "33d" },
  );
  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    domain: process.env.COOKIE_DOMAIN,
    maxAge: 33 * 24 * 60 * 60 * 1000,
  });
}

module.exports = { requireAuth, optionalAuth, issueAuthCookie };
