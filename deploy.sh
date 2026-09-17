#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════
# deploy.sh — بای لیمیت (بیلد همیشگی، بدون نصب وابستگی ها)
# ══════════════════════════════════════════════════════════
set -Eeuo pipefail
trap 'echo "❌ دیپلوی در خط $LINENO با خطا متوقف شد." >&2' ERR

PROJECT_DIR="${PROJECT_DIR:-/var/www/byelimit}"
BACKEND_DIR="$PROJECT_DIR/Backend"
FRONTEND_DIR="$PROJECT_DIR/Frontend"
SYSTEM_ENV_FILE="${SYSTEM_ENV_FILE:-/etc/byelimit/.env}"

# بررسی فلگ برای مواقع نادری که واقعاً پکیج جدیدی نصب کرده ای (deploy --install)
INSTALL_DEPS=false
if [[ "${1:-}" == "--install" ]] || [[ "${1:-}" == "-i" ]]; then
  INSTALL_DEPS=true
  echo "📦 نصب پکیج ها فعال شد."
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

# بروزرسانی خودکار مرچنت کد زیبال در صورت وجود مقدار قدیمی در فایل های محیطی سرور
for ENV_TARGET in "$SYSTEM_ENV_FILE" "$BACKEND_DIR/.env"; do
  if [[ -f "$ENV_TARGET" ]] && grep -q "6a97e1c9a9eb8b31692e4c28" "$ENV_TARGET"; then
    echo "🔑 در حال به روزرسانی مرچنت کد جدید زیبال در $ENV_TARGET..."
    sed -i 's/6a97e1c9a9eb8b31692e4c28/6aaba56cb94624ca6155060e/g' "$ENV_TARGET"
  fi
done

# ── ۲. دریافت آخرین کدها از گیت هاب ────────────────────────
echo "📥 [1/5] دریافت آخرین تغییرات از گیت..."
cd "$PROJECT_DIR"
PREV_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "")
git fetch origin main
git pull --ff-only origin main
NEW_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "")

BACKEND_DEPS_CHANGED=false
FRONTEND_DEPS_CHANGED=false
if [[ -n "$PREV_COMMIT" && -n "$NEW_COMMIT" && "$PREV_COMMIT" != "$NEW_COMMIT" ]]; then
  if git diff --name-only "$PREV_COMMIT" "$NEW_COMMIT" 2>/dev/null | grep -qE "^Backend/package(-lock)?\.json"; then
    BACKEND_DEPS_CHANGED=true
  fi
  if git diff --name-only "$PREV_COMMIT" "$NEW_COMMIT" 2>/dev/null | grep -qE "^Frontend/package(-lock)?\.json"; then
    FRONTEND_DEPS_CHANGED=true
  fi
fi

# ── ۳. بک اند: پریسما و وابستگی ها ───────────
echo "🗄️  [2/5] همگام سازی دیتابیس و کلاینت پریسما..."
cd "$BACKEND_DIR"

BACKEND_HASH_FILE="$BACKEND_DIR/.package_json_hash"
CURRENT_BACKEND_HASH=$(md5sum "$BACKEND_DIR/package.json" 2>/dev/null | awk '{print $1}')

if $INSTALL_DEPS || $BACKEND_DEPS_CHANGED || [[ ! -d "$BACKEND_DIR/node_modules" ]] || [[ ! -f "$BACKEND_HASH_FILE" ]] || [[ "$(< "$BACKEND_HASH_FILE")" != "$CURRENT_BACKEND_HASH" ]]; then
  echo "📦 پکیج های جدید بک اند شناسایی شدند یا نصب درخواست شده. در حال نصب وابستگی ها..."
  npm install --prefer-offline --no-audit --no-fund
  echo "$CURRENT_BACKEND_HASH" > "$BACKEND_HASH_FILE"
fi

# خاموش کردن لحظه ای استودیو، آپدیت اسکیما و جنریت سریع کلاینت (کمتر از ۴ ثانیه)
pm2 stop byelimit-studio 2>/dev/null || true
npx prisma db push --skip-generate
npx prisma generate

if [[ -f "$BACKEND_DIR/prisma/update-gemini-description.js" ]]; then
  echo "📝 به روزرسانی توضیحات استاندارد در دیتابیس..."
  node "$BACKEND_DIR/prisma/update-gemini-description.js" || true
fi

# ── ۴. فرانت اند: بیلد قطعی (همیشه اجرا می شود) ────────────
echo "🔨 [3/5] بیلد نکس جی اس (Next.js build)..."
cd "$FRONTEND_DIR"

FRONTEND_HASH_FILE="$FRONTEND_DIR/.package_json_hash"
CURRENT_FRONTEND_HASH=$(md5sum "$FRONTEND_DIR/package.json" 2>/dev/null | awk '{print $1}')

if $INSTALL_DEPS || $FRONTEND_DEPS_CHANGED || [[ ! -d "$FRONTEND_DIR/node_modules" ]] || [[ ! -f "$FRONTEND_HASH_FILE" ]] || [[ "$(< "$FRONTEND_HASH_FILE")" != "$CURRENT_FRONTEND_HASH" ]]; then
  echo "📦 پکیج های جدید فرانت اند شناسایی شدند یا نصب درخواست شده. در حال نصب وابستگی ها..."
  npm install --prefer-offline --no-audit --no-fund
  echo "$CURRENT_FRONTEND_HASH" > "$FRONTEND_HASH_FILE"
fi

# بیلد دائمی در هر بار دیپلوی
npm run build

# ── ۵. بارگذاری مجدد سرویس ها در PM2 ───────────────────────
echo "🔄 [4/5] ری لود پروسه ها با PM2..."
cd "$PROJECT_DIR"
if [[ -f "ecosystem.config.js" ]]; then
  pm2 startOrReload ecosystem.config.js --update-env
else
  pm2 restart all --update-env
fi
pm2 save

# ── ۶. بررسی سلامت ───────────────────────────────────────────
echo "🏥 [5/5] بررسی وضعیت بک اند..."
sleep 2
if curl -fsS http://127.0.0.1:4000/health > /dev/null; then
  echo "✅ بک اند فعال و سالم است."
else
  echo "⚠️ بک اند پاسخ نداد. لاگ را چک کن: pm2 logs byelimit-backend"
fi

echo "════════════════════════════════════════════"
echo "🎉 دیپلوی کامل شد! بیلد جدید با موفقیت اعمال شد."
echo "════════════════════════════════════════════"