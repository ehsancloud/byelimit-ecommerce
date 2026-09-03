// Backend/src/server.js
require("dotenv").config();

BigInt.prototype.toJSON = function () { return this.toString(); };

const express      = require("express");
const helmet       = require("helmet");
const cors         = require("cors");
const cookieParser = require("cookie-parser");
const pinoHttp     = require("pino-http");

const authRoutes      = require("./routes/auth.routes");
const cartRoutes      = require("./routes/cart.routes");
const orderRoutes     = require("./routes/order.routes");
const paymentRoutes   = require("./routes/payment.routes");
const productRoutes   = require("./routes/product.routes");
const telegramRoutes  = require("./routes/telegram.routes");
const flashDealRoutes = require("./routes/flashdeal.routes");
const reviewRoutes    = require("./routes/review.routes");

const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const { generalApiRateLimiter }         = require("./middleware/rateLimit");
const { startUnverifiedCron }           = require("./jobs/unverified-cron");

const app = express();

const allowedFrontendOrigins = [
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",") : []),
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].map((o) => o.trim()).filter(Boolean);

app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedFrontendOrigins.includes(origin)) return cb(null, true);
    return cb(null, false);
  },
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(pinoHttp());
app.use(generalApiRateLimiter);

app.get("/health", (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.use("/api/auth",        authRoutes);
app.use("/api/cart",        cartRoutes);
app.use("/api/orders",      orderRoutes);
app.use("/api/payment",     paymentRoutes);
app.use("/api/products",    productRoutes);
app.use("/api/telegram",    telegramRoutes);
app.use("/api/reviews",     reviewRoutes);
app.use("/api/flash-deals", flashDealRoutes);
app.use("/api/flashdeals",  flashDealRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ بک‌اند بای‌لیمیت روی پورت ${PORT} فعال شد.`);

  require("./jobs/usd-rate-job");
  startUnverifiedCron();
});

module.exports = app;