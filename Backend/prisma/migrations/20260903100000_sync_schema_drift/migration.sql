-- Migration: هم‌ترازی schema.prisma با دیتابیس (فیلدهای قیمت‌گذاری، درگاه و …)
-- -----------------------------------------------------------------------------
-- در جلسات قبل، این فیلدها به schema.prisma اضافه شده‌اند اما هیچ migration ی برای
-- آن‌ها نوشته نشده بود. این migration صرفاً تولید Prisma است که با «if not exists»
-- ایمن/تکرارپذیر شده تا روی دیتابیس‌های قدیمی (با ردیف موجود) هم بدون خطا اعمال شود.

-- 1) CreateEnum: حالت‌های قیمت‌گذاری و درگاه
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PricingMode') THEN
    CREATE TYPE "PricingMode" AS ENUM ('DYNAMIC_USD', 'FIXED_RIAL');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ProfitMode') THEN
    CREATE TYPE "ProfitMode" AS ENUM ('NONE', 'PERCENT', 'FIXED');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentGateway') THEN
    CREATE TYPE "PaymentGateway" AS ENUM ('ZIBAL', 'ZARINPAL');
  END IF;
END $$;

-- 2) AlterEnum: افزودن REVERSED به PaymentStatus (الگوی استاندارد Prisma)
BEGIN;
CREATE TYPE "PaymentStatus_new" AS ENUM ('PENDING', 'VERIFIED', 'FAILED', 'REVERSED');
ALTER TABLE "payments" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "payments" ALTER COLUMN "status" TYPE "PaymentStatus_new" USING ("status"::text::"PaymentStatus_new");
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "PaymentStatus_old";
ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- 3) discount_codes.metadata
ALTER TABLE "discount_codes" ADD COLUMN IF NOT EXISTS "metadata" JSONB;

-- 4) payments: فیلدهای درگاه
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "gateway" "PaymentGateway" NOT NULL DEFAULT 'ZIBAL';
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "gatewayMetadata" JSONB;
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "gatewayTrackId" BIGINT;

-- payments.updatedAt: با دیتابیس‌های دارای ردیف به‌صورت مرحله‌ای اعمال می‌شود
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'payments' AND column_name = 'updatedAt') THEN
    ALTER TABLE "payments" ADD COLUMN "updatedAt" TIMESTAMP(3);
    UPDATE "payments" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;
    ALTER TABLE "payments" ALTER COLUMN "updatedAt" SET NOT NULL;
  END IF;
END $$;

-- 5) product_variants: فیلدهای قیمت‌گذاری پویا/سود
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "basePriceRial" BIGINT;
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "fixedPriceRial" BIGINT;
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "lastPricedAt" TIMESTAMP(3);
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "pricingMode" "PricingMode" NOT NULL DEFAULT 'DYNAMIC_USD';
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "profitMode" "ProfitMode" NOT NULL DEFAULT 'NONE';
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "profitValue" DECIMAL(10,2);

-- 6) ایندکس درگاها
CREATE INDEX IF NOT EXISTS "payments_gateway_authority_idx" ON "payments"("gateway", "authority");
-- 7) ایندکس جستجوی اعلانات بر اساس سفارش
CREATE INDEX IF NOT EXISTS "telegram_notifications_orderId_idx" ON "telegram_notifications"("orderId");
