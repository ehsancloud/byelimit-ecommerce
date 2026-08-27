#!/bin/bash
set -e

echo "🚀 [1/5] دریافت آخرین تغییرات از مخزن..."
cd /var/www/byelimit
git pull origin main

echo "📦 [2/5] همگام‌سازی دیتابیس و وابستگی‌های بک‌اند..."
cd /var/www/byelimit/Backend
npm install --prefer-offline --no-audit
npx prisma generate
npx prisma migrate deploy

echo "⚡ [3/5] کامپایل فرانت‌اند Next.js..."
cd /var/www/byelimit/Frontend
npm install --prefer-offline --no-audit
npm run build

echo "🔄 [4/5] ری‌استارت پروسه‌ها..."
cd /var/www/byelimit
pm2 startOrReload ecosystem.config.js --update-env
pm2 save

echo "🎉 [5/5] استقرار با موفقیت به پایان رسید!"
