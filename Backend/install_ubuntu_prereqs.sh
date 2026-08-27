#!/usr/bin/env bash
# install_ubuntu_prereqs.sh
# اجرا روی VPS به عنوان کاربر با sudo (مثال: sudo bash install_ubuntu_prereqs.sh)
# این اسکریپت محیط پایه را نصب می‌کند: node, npm, nginx, certbot, postgresql, redis

set -euo pipefail

echo "Updating package lists..."
sudo apt update

echo "Installing basic packages..."
sudo apt install -y curl git ufw software-properties-common ca-certificates lsb-release

# Node.js (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs build-essential

# nginx
sudo apt install -y nginx

# certbot (for letsencrypt)
sudo apt install -y certbot python3-certbot-nginx

# postgresql
sudo apt install -y postgresql postgresql-contrib

# redis
sudo apt install -y redis-server

# enable and start services
sudo systemctl enable --now nginx
sudo systemctl enable --now redis-server
sudo systemctl enable --now postgresql

# basic firewall (opens 22,80,443)
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

echo "Prereqs installed. Follow Backend/README-deploy.md for next steps (DB user, cloning repo, env placement, systemd services, certbot)." 
