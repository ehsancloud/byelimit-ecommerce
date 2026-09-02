#!/usr/bin/env bash
# Deploy ByeLimit on an Ubuntu VPS. Run as the deploy user, not root.
set -Eeuo pipefail

PROJECT_DIR="${PROJECT_DIR:-/var/www/byelimit}"
BACKEND_DIR="$PROJECT_DIR/Backend"
FRONTEND_DIR="$PROJECT_DIR/Frontend"
SYSTEM_ENV_FILE="${SYSTEM_ENV_FILE:-/etc/byelimit/.env}"

trap 'echo "❌ دیپلوی در خط $LINENO متوقف شد." >&2' ERR

if [[ ! -d "$PROJECT_DIR/.git" ]]; then
  echo "❌ پروژه در $PROJECT_DIR پیدا نشد یا Git repository نیست." >&2
  exit 1
fi

# dotenv در بک‌اند، .env داخل Backend را می‌خواند. رازها بیرون از Git نگه داشته
# می‌شوند و فقط برای اجرای برنامه به صورت symlink در دسترس قرار می‌گیرند.
if [[ ! -f "$BACKEND_DIR/.env" ]]; then
  if [[ -f "$SYSTEM_ENV_FILE" ]]; then
    ln -s "$SYSTEM_ENV_FILE" "$BACKEND_DIR/.env"
  else
    echo "❌ فایل محیطی یافت نشد: $BACKEND_DIR/.env یا $SYSTEM_ENV_FILE" >&2
    echo "ابتدا Backend/.env.example را با مقادیر production تکمیل کنید." >&2
    exit 1
  fi
fi

echo "🚀 [1/5] دریافت آخرین تغییرات از گیت‌هاب..."
cd "$PROJECT_DIR"
git pull --ff-only origin main

echo "📦 [2/5] نصب وابستگی‌های بک‌اند و اجرای migration دیتابیس..."
cd "$BACKEND_DIR"
npm ci
npx prisma generate

# بازیابی خودکار migrationهای شکست‌خورده (قبل از deploy جدید)
# اگر مهاجرتی در وضعیت "failed" باشد، Prisma خطای P3009 می‌دهد و مهاجرت‌های
# جدید اعمال نمی‌شوند. این بخش ابتدا deploy را امتحان می‌کند، و اگر خطای P3009
# داد، نام migration شکست‌خورده را از خود خطا استخراج کرده، rollback و دوباره deploy می‌کند.
DEPLOY_OUTPUT=$(npx prisma migrate deploy 2>&1) || {
  FAILED=$(echo "$DEPLOY_OUTPUT" | grep -oP 'The `\K[0-9]{14}_[a-zA-Z0-9_]+(?=` migration)' || true)
  if [[ -n "$FAILED" ]]; then
    echo "⚠️ مهاجرت شکست‌خورده یافت شد: $FAILED → در حال rollback..."
    npx prisma migrate resolve --rolled-back "$FAILED"
    echo "🔄 تلاش مجدد برای deploy..."
    npx prisma migrate deploy
  else
    echo "$DEPLOY_OUTPUT" >&2
    exit 1
  fi
}

echo "⚛️ [3/5] نصب وابستگی‌ها و build فرانت‌اند..."
cd "$FRONTEND_DIR"
npm ci
npm run build -- --webpack

echo "🔄 [4/5] ری‌لود امن پروسه‌های PM2..."
cd "$PROJECT_DIR"
pm2 startOrReload ecosystem.config.js --update-env
pm2 save

echo "✅ [5/5] دیپلوی با موفقیت انجام شد!"
echo "Health check: curl -fsS http://127.0.0.1:4000/health"
