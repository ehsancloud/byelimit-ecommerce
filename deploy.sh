#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════
# deploy.sh — بای لیمیت v0.97
# دیپلوی ایمن: داده مشتریان حذف نمی‌شود، محصولات upsert می‌شوند
# ══════════════════════════════════════════════════════════
set -Eeuo pipefail
trap 'echo "❌ دیپلوی در خط $LINENO متوقف شد." >&2' ERR

PROJECT_DIR="${PROJECT_DIR:-/var/www/byelimit}"
BACKEND_DIR="$PROJECT_DIR/Backend"
FRONTEND_DIR="$PROJECT_DIR/Frontend"
SYSTEM_ENV_FILE="${SYSTEM_ENV_FILE:-/etc/byelimit/.env}"

# ── بررسی وجود .env ──────────────────────────────────────
if [[ ! -f "$BACKEND_DIR/.env" ]]; then
  if [[ -f "$SYSTEM_ENV_FILE" ]]; then
    ln -sf "$SYSTEM_ENV_FILE" "$BACKEND_DIR/.env"
    echo "🔗 .env symlink ایجاد شد از $SYSTEM_ENV_FILE"
  else
    echo "❌ $BACKEND_DIR/.env یا $SYSTEM_ENV_FILE یافت نشد." >&2
    exit 1
  fi
fi

# ── [1] دریافت تغییرات از گیت ────────────────────────────
echo "🚀 [1/6] دریافت آخرین تغییرات از گیت‌هاب..."
cd "$PROJECT_DIR"
git fetch origin main
git pull --ff-only origin main

# ── [2] بک‌اند: npm install + migration ──────────────────
echo "📦 [2/6] نصب وابستگی‌های بک‌اند و migration..."
cd "$BACKEND_DIR"
npm ci --omit=dev --prefer-offline 2>/dev/null || npm install --omit=dev
npx prisma generate
# ایمن‌ترین گزینه در production:
npx prisma migrate deploy

# ── [3] seed محصولات (upsert - داده مشتریان دست نمی‌خوره) ─
echo "🌱 [3/6] بارگذاری/بروزرسانی محصولات (upsert ایمن)..."
node prisma/seed.js
echo "✅ محصولات بروز شدند."

# ── [4] فرانت‌اند: install + build ──────────────────────
echo "⚛️  [4/6] build فرانت‌اند..."
cd "$FRONTEND_DIR"
npm ci --prefer-offline 2>/dev/null || npm install
npm run build

# ── [5] PM2 reload بدون downtime ────────────────────────
echo "🔄 [5/6] ری‌لود PM2..."
cd "$PROJECT_DIR"
pm2 startOrReload ecosystem.config.js --update-env
pm2 save

# ── [6] Health check ────────────────────────────────────
echo "🏥 [6/6] Health check..."
sleep 2
if curl -fsS http://127.0.0.1:4000/health > /dev/null; then
  echo "✅ بک‌اند سالم است."
else
  echo "⚠️  Health check ناموفق — لاگ‌ها را بررسی کنید: pm2 logs"
fi

echo ""
echo "════════════════════════════════════════"
echo "✅ دیپلوی با موفقیت انجام شد!"
echo "   لاگ بک‌اند:  pm2 logs byelimit-backend"
echo "   لاگ فرانت:   pm2 logs byelimit-frontend"
echo "   Prisma Studio: npx prisma studio --port 5555 (در Backend/)"
echo "════════════════════════════════════════"
