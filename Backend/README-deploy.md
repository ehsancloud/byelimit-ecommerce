README دیپلوی روی VPS (Ubuntu) — ByeLimit
=========================================

این راهنما مرحله‌به‌مرحله برای زمانی است که VPS را خریده‌اید و می‌خواهید پروژه را روی آن اجرا کنید.

پیش‌نیازها (روی ماشین محلی یا سرور)
- دسترسی SSH به VPS
- کلید SSH public در سرور <~/.ssh/authorized_keys>
- DNS: A record برای byelimit.ir و api.byelimit.ir اشاره به IP VPS

خلاصه گام‌ها
1. نصب پیش‌نیازها (اسکریپت آماده: install_ubuntu_prereqs.sh)
2. ساخت کاربر deploy و تنظیم SSH
3. نصب و پیکربندی PostgreSQL و Redis
4. کلون کردن repo و نصب وابستگی‌ها
5. قرار دادن فایل env امن در /etc/byelimit/.env
6. اجرای Prisma migrate/generate و seed در صورت نیاز
7. ساخت systemd unit ها و enable/start سرویس‌ها
8. نصب و گرفتن TLS با certbot
9. smoke tests

جزئیات گام‌ها

1) ورود به سرور و نصب پایه
ssh root@<VPS_IP>
# یا با کاربر sudo
sudo bash ~/Backend/install_ubuntu_prereqs.sh

2) ایجاد کاربر deploy
sudo adduser --disabled-password --gecos "" deploy
sudo usermod -aG sudo deploy
sudo mkdir -p /var/www/byelimit
sudo chown deploy:deploy /var/www/byelimit

3) PostgreSQL – سریع (ایجاد کاربر و دیتابیس)
# ورود به حساب postgres
sudo -u postgres psql
# داخل psql اجرا کنید:
# CREATE USER byelimit_user WITH PASSWORD 'CHANGE_ME_STRONG';
# CREATE DATABASE byelimit_db OWNER byelimit_user;
# \q

4) Redis – ایمن‌سازی (رمز) (مثال: set requirepass در /etc/redis/redis.conf)
# و سپس restart
sudo systemctl restart redis-server

5) کلون repo
sudo -u deploy -i
cd /var/www/byelimit
git clone <your-repo-url> .
# اگر از SSH key برای repo استفاده می‌کنید، از کلید deploy استفاده کنید

6) نصب وابستگی‌ها و بیلد فرانت
# Backend
cd /var/www/byelimit/Backend
npm ci --production
# Frontend
cd /var/www/byelimit/Frontend
npm ci
npm run build

7) قرار دادن فایل env
# روی سرور به عنوان root یا sudo:
sudo mkdir -p /etc/byelimit
sudo chown deploy:deploy /etc/byelimit
# حالا یک فایل متنی بسازید با نام /etc/byelimit/.env و مقادیر production را قرار دهید.
# deploy.sh در صورت نبود Backend/.env، این فایل را به‌صورت symlink متصل می‌کند.
# مثال تولید secret ها:
# sudo -u deploy bash -c "openssl rand -base64 48 > /tmp/jwt_secret && cat /tmp/jwt_secret"
# برای AES key: openssl rand -hex 32
# بعد از ساخت فایل:
sudo chmod 600 /etc/byelimit/.env

# در اولین deploy، deploy.sh خودش این symlink را می‌سازد. در صورت نیاز دستی:
# sudo -u deploy ln -s /etc/byelimit/.env /var/www/byelimit/Backend/.env

نمونه محتوا (از Backend/.env.production استفاده کنید)

8) Prisma
cd /var/www/byelimit/Backend
npx prisma generate
npx prisma migrate deploy
# در صورت نیاز seed:
# node prisma/seed.js

# deployهای بعدی:
# cd /var/www/byelimit && bash deploy.sh

9) systemd
# فایل‌های نمونه در Backend/*.service.template هستند
sudo cp /var/www/byelimit/Backend/byelimit-backend.service.template /etc/systemd/system/byelimit-backend.service
sudo cp /var/www/byelimit/Backend/byelimit-worker.service.template /etc/systemd/system/byelimit-worker.service
sudo cp /var/www/byelimit/Backend/byelimit-frontend.service.template /etc/systemd/system/byelimit-frontend.service

sudo systemctl daemon-reload
sudo systemctl enable --now byelimit-backend
sudo systemctl enable --now byelimit-worker
sudo systemctl enable --now byelimit-frontend

10) Nginx + certbot
sudo cp /var/www/byelimit/Backend/nginx_byelimit.conf.template /etc/nginx/sites-available/byelimit
sudo ln -s /etc/nginx/sites-available/byelimit /etc/nginx/sites-enabled/byelimit
sudo nginx -t && sudo systemctl reload nginx

# ابتدا certbot برای گرفتن cert اجرا کنید:
sudo certbot --nginx -d byelimit.ir -d www.byelimit.ir -d api.byelimit.ir
# تست اتوماتیک renew:
sudo certbot renew --dry-run

11) Smoke tests
# Health
curl -I https://byelimit.ir/health
# تست افزودن به سبد، ثبت سفارش، پرداخت sandbox (از پنل فرانت)

نکات مهم امنیتی و عملیاتی
- هرگز مقادیر secret را در گیت نگذارید.
- backups: برنامه‌ریزی snapshot/day و dump‌های منظم Postgres
- مانیتورینگ: UptimeRobot برای https://byelimit.ir/health
- اگر در production تراکنش واقعی می‌زنید، ZARINPAL_SANDBOX=false و مرچنت واقعی را بعد از تست‌ها قرار دهید.

در صورت نیاز، می‌توانم این مراحل را به‌صورت یک اسکریپت بیشتر خودکار (با تایید شما برای هر قدم حساس مثل تولید secrets) تبدیل کنم.
