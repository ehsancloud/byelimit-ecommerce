-- Migration: پشتیبانی از افزودنی‌ها (Add-On) در سبد خرید و اقلام سفارش
-- اجرا: npx prisma migrate deploy

ALTER TABLE "cart_items" ADD COLUMN "addOnId" TEXT;
ALTER TABLE "order_items" ADD COLUMN "addOnNameSnapshot" TEXT;
ALTER TABLE "order_items" ADD COLUMN "addOnPriceRial" BIGINT;

ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_addOnId_fkey"
  FOREIGN KEY ("addOnId") REFERENCES "product_add_ons"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "cart_items_addOnId_idx" ON "cart_items"("addOnId");
