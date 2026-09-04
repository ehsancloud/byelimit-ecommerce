#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════
# deploy.sh — بای لیمیت (نسخه پرسرعت و هوشمند با Git Diff)
# ══════════════════════════════════════════════════════════
set -Eeuo pipefail
trap 'echo "❌ دیپلوی در خط $LINENO با خطا متوقف شد." >&2' ERR

PROJECT_DIR="${PROJECT_DIR:-/var/www/byelimit}"
BACKEND_DIR="$PROJECT_DIR/Backend"
FRONTEND_DIR="$PROJECT_DIR/Frontend"
SYSTEM_ENV_FILE="${SYSTEM_ENV_FILE:-/etc/byelimit/.env}"

# بررسی فلگ اجباری (مثلاً deploy --force برای اعمال همه‌چیز از صفر)
FORCE_ALL=false
if [[ "${1:-}" == "--force" ]]; then
  FORCE_ALL=true
  echo "⚡ حالت دیپلوی کامل و اجباری فعال شد."
fi

# ── ۱. بررسی و اتصال .env ──────────────────────────────────
if [[ ! -f "$BACKEND_DIR/.env" ]]; then
  if [[ -f "$SYSTEM_ENV_FILE" ]]; then
    ln -sf "$SYSTEM_ENV_FILE" "$BACKEND_DIR/.env"
    echo "🔗 .env symlink ایجاد شد از $SYSTEM_ENV_FILE"
  else
    echo "❌ فایل .env یافت نشد." >&2
    exit 1
  fi
fi

# ── ۲. دریافت آخرین تغییرات و مقایسه کامیت‌ها ────────────
echo "📥 [1/5] دریافت تغییرات از گیت‌هاب..."
cd "$PROJECT_DIR"

PREV_COMMIT=$(git rev-parse HEAD)
git fetch origin main
git pull --ff-only origin main
NEW_COMMIT=$(git rev-parse HEAD)

CHANGED_FILES=$(git diff --name-only "$PREV_COMMIT" "$NEW_COMMIT" || true)

# ── ۳. بک‌اند: نصب پکیج و پریسما (فقط در صورت لزوم) ───────
echo "📦 [2/5] بررسی تغییرات بک‌اند..."
cd "$BACKEND_DIR"

# فقط در صورت تغییر package.json یا نبود node_modules
if $FORCE_ALL || [[ ! -d "node_modules" ]] || echo "$CHANGED_FILES" | grep -qE '^Backend/package.*json'; then
  echo "⚡ پکیج‌های بک‌اند تغییر کرده‌اند؛ در حال نصب سریع..."
  npm install --prefer-offline --no-audit --no-fund
else
  echo "⏩ پکیج‌های بک‌اند تغییری نکرده‌اند (رد شد)."
fi

# فقط در صورت تغییر schema.prisma
if $FORCE_ALL || echo "$CHANGED_FILES" | grep -qE '^Backend/prisma/schema\.prisma'; then
  echo "🗄️ اسکیما تغییر کرده؛ در حال همگام‌سازی دیتابیس..."
  pm2 stop byelimit-studio 2>/dev/null || true
  npx prisma db push --skip-generate
  npx prisma generate
else
  echo "⏩ دیتابیس نیازی به همگام‌سازی ندارد (رد شد)."
fi

# اجرای seed فقط در صورت تغییر فایل‌های seed
if $FORCE_ALL || echo "$CHANGED_FILES" | grep -qE '^Backend/prisma/(seed|seed-data)'; then
  echo "🌱 اجرای seed محصولات..."
  node prisma/seed.js || true
fi

# ── ۴. فرانت‌اند: پکیج‌ها و بیلد (فقط در صورت لزوم) ────────
echo "⚛️  [3/5] بررسی تغییرات فرانت‌اند..."
cd "$FRONTEND_DIR"

if $FORCE_ALL || [[ ! -d "node_modules" ]] || echo "$CHANGED_FILES" | grep -qE '^Frontend/package.*json'; then
  echo "⚡ پکیج‌های فرانت‌اند تغییر کرده‌اند؛ در حال نصب سریع..."
  npm install --prefer-offline --no-audit --no-fund
else
  echo "⏩ پکیج‌های فرانت‌اند دست نخورده‌اند (رد شد)."
fi

# اجرای بیلد فقط در صورتی که فایلی داخل Frontend عوض شده باشد
if $FORCE_ALL || echo "$CHANGED_FILES" | grep -qE '^Frontend/'; then
  echo "🔨 بیلد نسخه جدید Next.js..."
  npm run build
else
  echo "⏩ فایل‌های فرانت‌اند تغییری نکرده‌اند؛ بیلد رد شد."
fi

# ── ۵. بارگذاری مجدد پروسه‌ها ─────────────────────────────
echo "🔄 [4/5] ری‌لود صفر ثانیه با PM2..."
cd "$PROJECT_DIR"
if [[ -f "ecosystem.config.js" ]]; then
  pm2 startOrReload ecosystem.config.js --update-env
else
  pm2 restart all --update-env
fi
pm2 save

# ── ۶. تست سلامت ───────────────────────────────────────────
echo "🏥 [5/5] هلت‌چک..."
sleep 2
if curl -fsS http://127.0.0.1:4000/health > /dev/null; then
  echo "✅ بک‌اند فعال و پاسخگو است."
else
  echo "⚠️ بک‌اند در دسترس نیست."
fi

echo "════════════════════════════════════════════"
echo "🎉 دیپلوی فوق سریع با موفقیت به پایان رسید!"
echo "════════════════════════════════════════════"