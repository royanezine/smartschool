#!/usr/bin/env bash
# ============================================================
# SmartSchool - Deploy Aplikasi ke VPS
# Dianggap menjalankan dari dalam folder deploy/ di server.
#
# Persiapan folder di server:
#   <lokasi>/smartschool/
#     ├── Backend/        (berisi package.json, prisma/, src/, .env)
#     ├── Frontend/       (berisi package.json, app/, .env)
#     └── deploy/         (folder ini: deploy.sh)
#
# Jalankan:  cd deploy && sudo bash deploy.sh
# ============================================================
set -euo pipefail

# Deteksi lokasi otomatis (bisa langsung dipakai di /var/www, /var/www/html, ~/apps, dst)
APP_DIR="$(CDPATH= cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.."
APP_DIR="$(cd "$APP_DIR" && pwd)"
BACKEND_DIR="$APP_DIR/Backend"
FRONTEND_DIR="$APP_DIR/Frontend"

echo "=============================================="
echo "  SmartSchool Deploy"
echo "=============================================="

# ---------- [1] BACKEND ----------
echo ""
echo ">>> [1/4] Build & deploy Backend..."
cd "$BACKEND_DIR"
npm ci
npx prisma generate
npm run build

echo ">>> Jalankan migrasi database..."
if [ -d "$BACKEND_DIR/prisma/migrations" ]; then
  npx prisma migrate deploy
else
  echo ">>> Belum ada folder migrations, pakai prisma db push..."
  npx prisma db push
fi
npx prisma generate
npx prisma db seed

echo ">>> Restart PM2 (backend)..."
pm2 delete smartschool-backend 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

# ---------- [2] FRONTEND ----------
echo ""
echo ">>> [2/4] Build & deploy Frontend..."
cd "$FRONTEND_DIR"
npm ci 2>/dev/null || npm install
npm run build

echo ">>> Restart PM2 (frontend)..."
pm2 delete smartschool-frontend 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

# ---------- [3] APACHE2 ----------
echo ""
echo ">>> [3/4] Reload apache2..."
apache2ctl configtest && systemctl reload apache2

# ---------- [4] VERIFIKASI ----------
echo ""
echo ">>> [4/4] Verifikasi..."
sleep 2
echo "--- Local check frontend (3006) ---"
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://127.0.0.1:3006 || true
echo "--- Local check backend (5000) ---"
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://127.0.0.1:5000/ || true
echo "--- Status PM2 ---"
pm2 status

echo ""
echo "=============================================="
echo "  Deploy selesai!"
echo "  Frontend : https://smartschool.citrasolusi.id"
echo "  API      : https://smartschool.citrasolusi.id/api"
echo "=============================================="