const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

module.exports = async function authMiddleware(req, res, next) {
  try {
    let token = req.cookies?.auth_token || req.cookies?.token;
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ error: "لطفاً ابتدا وارد حساب کاربری خود شوید." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret-change-me");
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, mobile: true, fullName: true },
    });

    if (!user) {
      return res.status(401).json({ error: "کاربر یافت نشد." });
    }

    req.user = { ...user, userId: user.id };
    next();
  } catch (err) {
    return res.status(401).json({ error: "نشست شما منقضی شده است." });
  }
};
