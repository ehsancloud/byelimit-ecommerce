-- Migration: پشتیبانی از افزودنی‌ها (Add-On) در سبد خرید و اقلام سفارش
-- ⚠️ این migration «خودکفا» است: در جلسات قبل، جداول product_add_ons و
-- exchange_rate_settings در schema.prisma اضافه شده بودند اما هیچ migration ی برای
-- ساخت آن‌ها نوشته نشده بود (باعث خطای P3018 در deploy می‌شد).
-- این‌جا با IF NOT EXISTS ساخته می‌شوند تا روی دیتابیس‌های قدیمی و جدید امن باشد.

-- 1) جدول افزودنی‌های محصول (مدل ProductAddOn در schema.prisma)
CREATE TABLE IF NOT EXISTS "product_add_ons" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceRial" BIGINT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_add_ons_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "product_add_ons_variantId_idx" ON "product_add_ons"("variantId");

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'product_add_ons_variantId_fkey') THEN
    ALTER TABLE "product_add_ons" ADD CONSTRAINT "product_add_ons_variantId_fkey"
      FOREIGN KEY ("variantId") REFERENCES "product_variants"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- 2) جدول نرخ ارز تتر (مدل ExchangeRateSetting در schema.prisma - قبلاً هیچ migration نداشت)
CREATE TABLE IF NOT EXISTS "exchange_rate_settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "sourceBuyPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "roundedRate" INTEGER NOT NULL DEFAULT 0,
    "displayRate" INTEGER NOT NULL DEFAULT 0,
    "lastFetchedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exchange_rate_settings_pkey" PRIMARY KEY ("id")
);

-- 3) ستون‌های افزودنی در سبد خرید و اقلام سفارش
ALTER TABLE "cart_items" ADD COLUMN IF NOT EXISTS "addOnId" TEXT;
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "addOnNameSnapshot" TEXT;
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "addOnPriceRial" BIGINT;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cart_items_addOnId_fkey') THEN
    ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_addOnId_fkey"
      FOREIGN KEY ("addOnId") REFERENCES "product_add_ons"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "cart_items_addOnId_idx" ON "cart_items"("addOnId");
