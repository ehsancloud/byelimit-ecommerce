#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════
# deploy.sh — بای لیمیت (بیلد همیشگی، بدون نصب وابستگی‌ها)
# ══════════════════════════════════════════════════════════
set -Eeuo pipefail
trap 'echo "❌ دیپلوی در خط $LINENO با خطا متوقف شد." >&2' ERR

PROJECT_DIR="${PROJECT_DIR:-/var/www/byelimit}"
BACKEND_DIR="$PROJECT_DIR/Backend"
FRONTEND_DIR="$PROJECT_DIR/Frontend"
SYSTEM_ENV_FILE="${SYSTEM_ENV_FILE:-/etc/byelimit/.env}"

# بررسی فلگ برای مواقع نادری که واقعاً پکیج جدیدی نصب کرده‌ای (deploy --install)
INSTALL_DEPS=false
if [[ "${1:-}" == "--install" ]] || [[ "${1:-}" == "-i" ]]; then
  INSTALL_DEPS=true
  echo "📦 نصب پکیج‌ها فعال شد."
fi

# ── ۱. بررسی فایل محیطی ──────────────────────────────────
if [[ ! -f "$BACKEND_DIR/.env" ]]; then
  if [[ -f "$SYSTEM_ENV_FILE" ]]; then
    ln -sf "$SYSTEM_ENV_FILE" "$BACKEND_DIR/.env"
  else
    echo "❌ فایل .env یافت نشد." >&2
    exit 1
  fi
fi

# ── ۲. دریافت آخرین کدها از گیت‌هاب ────────────────────────
echo "📥 [1/5] دریافت آخرین تغییرات از گیت..."
cd "$PROJECT_DIR"
git fetch origin main
git pull --ff-only origin main

# ── ۳. بک‌اند: پریسما (بدون هیچگونه npm install) ───────────
echo "🗄️  [2/5] همگام‌سازی دیتابیس و کلاینت پریسما..."
cd "$BACKEND_DIR"

if $INSTALL_DEPS; then
  echo "📦 در حال نصب وابستگی‌های بک‌اند..."
  npm install --prefer-offline --no-audit --no-fund
fi

# خاموش کردن لحظه‌ای استودیو، آپدیت اسکیما و جنریت سریع کلاینت (کمتر از ۴ ثانیه)
pm2 stop byelimit-studio 2>/dev/null || true
npx prisma db push --skip-generate
npx prisma generate

# ── ۴. فرانت‌اند: بیلد قطعی (همیشه اجرا می‌شود) ────────────
echo "🔨 [3/5] بیلد نکس‌جی‌اس (Next.js build)..."
cd "$FRONTEND_DIR"

if $INSTALL_DEPS; then
  echo "📦 در حال نصب وابستگی‌های فرانت‌اند..."
  npm install --prefer-offline --no-audit --no-fund
fi

# بیلد دائمی در هر بار دیپلوی
npm run build

# ── ۵. بارگذاری مجدد سرویس‌ها در PM2 ───────────────────────
echo "🔄 [4/5] ری‌لود پروسه‌ها با PM2..."
cd "$PROJECT_DIR"
if [[ -f "ecosystem.config.js" ]]; then
  pm2 startOrReload ecosystem.config.js --update-env
else
  pm2 restart all --update-env
fi
pm2 save

# ── ۶. بررسی سلامت ───────────────────────────────────────────
echo "🏥 [5/5] بررسی وضعیت بک‌اند..."
sleep 2
if curl -fsS http://127.0.0.1:4000/health > /dev/null; then
  echo "✅ بک‌اند فعال و سالم است."
else
  echo "⚠️ بک‌اند پاسخ نداد. لاگ را چک کن: pm2 logs byelimit-backend"
fi

echo "════════════════════════════════════════════"
echo "🎉 دیپلوی کامل شد! بیلد جدید با موفقیت اعمال شد."
echo "════════════════════════════════════════════"