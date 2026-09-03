// Backend/src/middleware/auth.js
const jwt = require("jsonwebtoken");

function extractToken(req) {
  if (req.cookies?.auth_token) {
    return req.cookies.auth_token;
  }
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }
  return null;
}

/**
 * محافظت از روت‌هایی که دسترسی الزامی به لاگین دارند (داشبورد، سفارش‌های من و...)
 */
function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: "لطفاً ابتدا وارد حساب کاربری خود شوید.", code: "UNAUTHORIZED" });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("[SECURITY FATAL] JWT_SECRET در فایل .env تنظیم نشده است!");
    }
    const payload = jwt.verify(token, secret || "byelimit-jwt-secret-key");
    req.user = {
      userId: payload.userId || payload.id,
      id: payload.userId || payload.id,
      mobile: payload.mobile,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: "نشست شما منقضی شده است. لطفاً دوباره وارد شوید.", code: "TOKEN_EXPIRED" });
  }
}

/**
 * برای روت‌هایی مانند سبد خرید و چک‌اوت که هم کاربران مهمان و هم کاربران عضو مجاز هستند
 */
function optionalAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const secret = process.env.JWT_SECRET || "byelimit-jwt-secret-key";
    const payload = jwt.verify(token, secret);
    req.user = {
      userId: payload.userId || payload.id,
      id: payload.userId || payload.id,
      mobile: payload.mobile,
    };
  } catch {
    req.user = null;
  }
  next();
}

function issueAuthCookie(res, user) {
  const secret = process.env.JWT_SECRET || "byelimit-jwt-secret-key";
  const token = jwt.sign(
    { userId: user.id, mobile: user.mobile },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || "30d" }
  );

  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    domain: process.env.COOKIE_DOMAIN || undefined,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  return token;
}

module.exports = {
  requireAuth,
  optionalAuth,
  issueAuthCookie,
};