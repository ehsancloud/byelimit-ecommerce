-- Migration: Zibal gateway + USD rate + product price config
-- v0.97

-- ======= PaymentGateway enum =======
DO $$ BEGIN
  CREATE TYPE "PaymentGateway" AS ENUM ('ZARINPAL', 'ZIBAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ======= ProfitType enum =======
DO $$ BEGIN
  CREATE TYPE "ProfitType" AS ENUM ('PERCENT', 'FIXED_RIAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ======= payments: add gateway column =======
ALTER TABLE "payments"
  ADD COLUMN IF NOT EXISTS "gateway" "PaymentGateway" NOT NULL DEFAULT 'ZARINPAL';

-- ======= usd_rates table =======
CREATE TABLE IF NOT EXISTS "usd_rates" (
  "id"           TEXT NOT NULL,
  "buyPrice"     DOUBLE PRECISION NOT NULL,
  "displayPrice" DOUBLE PRECISION NOT NULL,
  "roundedRate"  DOUBLE PRECISION NOT NULL,
  "fetchedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "usd_rates_pkey" PRIMARY KEY ("id")
);

-- ======= product_price_configs table =======
CREATE TABLE IF NOT EXISTS "product_price_configs" (
  "id"              TEXT NOT NULL,
  "variantId"       TEXT NOT NULL,
  "useUsdFormula"   BOOLEAN NOT NULL DEFAULT TRUE,
  "fixedPriceRial"  BIGINT,
  "profitType"      "ProfitType" NOT NULL DEFAULT 'PERCENT',
  "profitPercent"   DOUBLE PRECISION DEFAULT 10,
  "profitFixedRial" BIGINT,
  "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "product_price_configs_pkey"  PRIMARY KEY ("id"),
  CONSTRAINT "product_price_configs_variantId_key" UNIQUE ("variantId"),
  CONSTRAINT "product_price_configs_variantId_fkey"
    FOREIGN KEY ("variantId")
    REFERENCES "product_variants"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);
