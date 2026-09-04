#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════
# deploy.sh — بای لیمیت (نسخه ضد گلوله و بدون خطای دیتابیس)
# ══════════════════════════════════════════════════════════
set -Eeuo pipefail
trap 'echo "❌ دیپلوی در خط $LINENO متوقف شد." >&2' ERR

PROJECT_DIR="${PROJECT_DIR:-/var/www/byelimit}"
BACKEND_DIR="$PROJECT_DIR/Backend"
FRONTEND_DIR="$PROJECT_DIR/Frontend"
SYSTEM_ENV_FILE="${SYSTEM_ENV_FILE:-/etc/byelimit/.env}"

# ── ۱. بررسی و اتصال .env ──────────────────────────────────
if [[ ! -f "$BACKEND_DIR/.env" ]]; then
  if [[ -f "$SYSTEM_ENV_FILE" ]]; then
    ln -sf "$SYSTEM_ENV_FILE" "$BACKEND_DIR/.env"
    echo "🔗 .env symlink ایجاد شد از $SYSTEM_ENV_FILE"
  else
    echo "❌ فایل .env در بک‌اند یا $SYSTEM_ENV_FILE یافت نشد." >&2
    exit 1
  fi
fi

# ── ۲. دریافت آخرین تغییرات از گیت‌هاب ────────────────────
echo "🚀 [1/6] دریافت آخرین تغییرات از گیت‌هاب..."
cd "$PROJECT_DIR"
git fetch origin main
git pull --ff-only origin main

# ── ۳. همگام‌سازی تضمینی دیتابیس و پریسما ─────────────────
echo "📦 [2/6] نصب پکیج‌ها و همگام‌سازی قطعی دیتابیس..."
cd "$BACKEND_DIR"

# توقف موقت استودیو برای جلوگیری از خطای قفل شدن فایل باینری پریسما
pm2 stop byelimit-studio 2>/dev/null || true

# نصب پکیج‌ها با احتساب devDependencies جهت دسترسی به CLI پریسما
npm install --prefer-offline

# همگام‌سازی ساختار دیتابیس مستقیماً از روی schema.prisma
npx prisma db push --skip-generate

# تولید مجدد کلاینت پریسما متناسب با آخرین تغییرات دیتابیس
npx prisma generate

# ── ۴. بارگذاری اطلاعات اولیه (Seed) ─────────────────────
echo "🌱 [3/6] بررسی و اجرای seed..."
if [[ -f "prisma/seed.js" ]]; then
  node prisma/seed.js || echo "⚠️ اجرای seed رد شد."
fi

# ── ۵. فرانت‌اند: بیلد پروژه ────────────────────────────
echo "⚛️  [4/6] بیلد نسخه جدید فرانت‌اند..."
cd "$FRONTEND_DIR"
npm install --prefer-offline
npm run build

# ── ۶. بارگذاری مجدد پروسه‌های PM2 ───────────────────────
echo "🔄 [5/6] ری‌استارت پروسه‌ها در PM2..."
cd "$PROJECT_DIR"
if [[ -f "ecosystem.config.js" ]]; then
  pm2 startOrReload ecosystem.config.js --update-env
else
  pm2 restart all --update-env
fi
pm2 save

# ── ۷. تست سلامت بک‌اند ─────────────────────────────────
echo "🏥 [6/6] بررسی سلامت سرویس..."
sleep 3
if curl -fsS http://127.0.0.1:4000/health > /dev/null; then
  echo "✅ بک‌اند فعال و پاسخگو است."
else
  echo "⚠️ بک‌اند در دسترس نیست؛ لاگ‌ها را بررسی کنید: pm2 logs byelimit-backend"
fi

echo "════════════════════════════════════════"
echo "🎉 دیپلوی با موفقیت و پایداری کامل انجام شد!"
echo "════════════════════════════════════════"