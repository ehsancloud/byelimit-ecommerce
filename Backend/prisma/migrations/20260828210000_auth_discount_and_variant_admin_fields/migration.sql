-- Keep the database aligned with the Prisma schema used by OTP, discount and Studio flows.
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "productTitle" TEXT;
ALTER TABLE "discount_codes" ADD COLUMN IF NOT EXISTS "minCartAmountRial" BIGINT;
ALTER TABLE "discount_codes" ADD COLUMN IF NOT EXISTS "maxDiscountRial" BIGINT;
ALTER TABLE "cart_items"
  DROP COLUMN IF EXISTS "discountCode";

-- Existing installations may already have these values from a prior manual migration.
UPDATE "product_variants" pv
SET "productTitle" = p."title"
FROM "products" p
WHERE pv."productId" = p."id" AND pv."productTitle" IS NULL;

-- Give previously seeded plans a safe test price as well. Existing manually set
-- prices are preserved; only NULL (not-yet-priced) plans are changed.
UPDATE "product_variants"
SET "priceRial" = 99000000,
    "originalPriceRial" = 120000000
WHERE "priceRial" IS NULL;
