-- Migration: افزودن جدول پیشنهادات ویژه (FlashDeal)
-- اجرا: npx prisma migrate deploy

CREATE TABLE "flash_deals" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "endsAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flash_deals_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "flash_deals"
  ADD CONSTRAINT "flash_deals_productId_fkey"
  FOREIGN KEY ("productId")
  REFERENCES "products"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ایندکس برای کوئری‌های فیلتر isActive
CREATE INDEX "flash_deals_isActive_idx" ON "flash_deals"("isActive");
CREATE INDEX "flash_deals_sortOrder_idx" ON "flash_deals"("sortOrder");

-- ایندکس اضافه برای جستجوی سفارشات کاربر (بهینه‌سازی پنل کاربری)
CREATE INDEX IF NOT EXISTS "orders_userId_idx" ON "orders"("userId");
