// src/server.js
require("dotenv").config();

BigInt.prototype.toJSON = function () {
  return this.toString();
};

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const pinoHttp = require("pino-http");

const authRoutes = require("./routes/auth.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const paymentRoutes = require("./routes/payment.routes");
const productRoutes = require("./routes/product.routes");
const telegramRoutes = require("./routes/telegram.routes");
const flashDealRoutes = require("./routes/flashdeal.routes"); // ✅ NEW

const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const { generalApiRateLimiter } = require("./middleware/rateLimit");
const { startUnverifiedCron } = require("./jobs/unverified-cron");
const { startZibalCron } = require("./jobs/unverified-zibal-cron");
const { startPricingCron } = require("./jobs/pricing-cron");

const app = express();

const allowedFrontendOrigins = [
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",") : []),
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
].map((origin) => origin.trim()).filter(Boolean);

app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedFrontendOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(pinoHttp());
app.use(generalApiRateLimiter);

app.get("/health", (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/products", productRoutes);
app.use("/api/flash-deals", flashDealRoutes); // ✅ NEW
app.use("/internal/telegram", telegramRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 بک‌اند بای لیمیت روی پورت ${PORT} اجرا شد (${process.env.NODE_ENV || "development"})`);
  startUnverifiedCron();
  startZibalCron();
  startPricingCron();
});
