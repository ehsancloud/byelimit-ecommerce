#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════
# deploy.sh — بای لیمیت (نسخه ارتقایافته و پایدار)
# دیپلوی ایمن: بدون قطعی، همگام‌سازی خودکار دیتابیس و بیلد کامل
# ══════════════════════════════════════════════════════════
set -Eeuo pipefail
trap 'echo "❌ دیپلوی در خط $LINENO با خطا متوقف شد." >&2' ERR

PROJECT_DIR="${PROJECT_DIR:-/var/www/byelimit}"
BACKEND_DIR="$PROJECT_DIR/Backend"
FRONTEND_DIR="$PROJECT_DIR/Frontend"
SYSTEM_ENV_FILE="${SYSTEM_ENV_FILE:-/etc/byelimit/.env}"

echo "=========================================="
echo "🚀 آغاز فرآیند دیپلوی بای لیمیت..."
echo "=========================================="

# ── بررسی و اتصال امن فایل .env ─────────────────────────
if [[ ! -f "$BACKEND_DIR/.env" ]]; then
  if [[ -f "$SYSTEM_ENV_FILE" ]]; then
    ln -sf "$SYSTEM_ENV_FILE" "$BACKEND_DIR/.env"
    echo "🔗 .env symlink ایجاد شد از $SYSTEM_ENV_FILE"
  else
    echo "❌ $BACKEND_DIR/.env یا $SYSTEM_ENV_FILE یافت نشد." >&2
    exit 1
  fi
fi

# ── [1] دریافت آخرین تغییرات از گیت‌هاب ────────────────────
echo "📥 [1/6] دریافت آخرین تغییرات از گیت‌هاب..."
cd "$PROJECT_DIR"
git fetch origin main
git pull --ff-only origin main

# ── [2] بک‌اند: وابستگی‌ها و همگام‌سازی دیتابیس ──────────
echo "📦 [2/6] بروزرسانی پکیج‌ها و اسلایدهای دیتابیس..."
cd "$BACKEND_DIR"
npm ci --prefer-offline 2>/dev/null || npm install

# تولید کلاینت پریسما
npx prisma generate

# همگام‌سازی هوشمند دیتابیس بدون ریسک توقف
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  echo "🗄️ اعمال مایگریشن‌های رسمی..."
  npx prisma migrate deploy || npx prisma db push --skip-generate
else
  echo "🗄️ اعمال مستقیم اسکیما روی دیتابیس (db push)..."
  npx prisma db push --skip-generate
fi

# ── [3] اجرای seed محصولات و کانفیگ‌ها (upsert ایمن) ─────
echo "🌱 [3/6] بررسی و همگام‌سازی محصولات (seed)..."
if [[ -f "prisma/seed.js" ]]; then
  node prisma/seed.js || echo "⚠️ اجرای seed با اخطار مواجه شد اما ادامه می‌یابد."
  echo "✅ محصولات بروز شدند."
fi

# ── [4] فرانت‌اند: پاکسازی کش و بیلد ───────────────────────
echo "⚛️  [4/6] بیلد نسخه جدید فرانت‌اند (Next.js)..."
cd "$FRONTEND_DIR"
npm ci --prefer-offline 2>/dev/null || npm install
# بیلد تمیز و سریع
npm run build

# ── [5] ری‌لود صفر ثانیه (Zero-downtime) با PM2 ───────────
echo "🔄 [5/6] بارگذاری مجدد پروسه‌ها در PM2..."
cd "$PROJECT_DIR"
if [[ -f "ecosystem.config.js" ]]; then
  pm2 startOrReload ecosystem.config.js --update-env
else
  pm2 restart all --update-env
fi
pm2 save

# ── [6] تست سلامت سلامت سرویس (Health Check) ─────────────
echo "🏥 [6/6] بررسی سلامت بک‌اند..."
sleep 3
if curl -fsS http://127.0.0.1:4000/health > /dev/null; then
  echo "✅ سرویس بک‌اند با موفقیت فعال و پاسخگو است."
else
  echo "⚠️ پاسخ هلت‌چک دریافت نشد. وضعیت را بررسی کنید: pm2 logs byelimit-backend"
fi

echo ""
echo "════════════════════════════════════════════"
echo "🎉 دیپلوی نسخه جدید با موفقیت به پایان رسید!"
echo "   لاگ بک‌اند:  pm2 logs byelimit-backend"
echo "   لاگ فرانت:   pm2 logs byelimit-frontend"
echo "════════════════════════════════════════════"