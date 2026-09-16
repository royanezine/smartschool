#!/usr/bin/env bash
# ============================================================
# SmartSchool - Setup Awal Server (jalankan SEKALI SAJA)
# Target: Ubuntu/Debian VPS, domain smartschool.citrasolusi.id
#
# Jalankan:  sudo bash setup-server.sh
# ============================================================
set -euo pipefail

DOMAIN="smartschool.citrasolusi.id"
APP_DIR="/var/www/smartschool"

echo "=============================================="
echo "  SmartSchool Server Setup"
echo "  Domain : $DOMAIN"
echo "=============================================="

if [ "$(id -u)" -ne 0 ]; then
  echo "ERROR: Jalankan sebagai root (sudo bash $0)" >&2
  exit 1
fi

echo ""
echo "[1/7] Update sistem & install dependencies..."
apt-get update -y
apt-get install -y curl git build-essential apache2 ca-certificates gnupg

echo ""
echo "[2/7] Install Node.js 22 (LTS)..."
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
echo "Node: $(node -v) | npm: $(npm -v)"

echo ""
echo "[3/7] Install PostgreSQL..."
if ! command -v psql &>/dev/null; then
  apt-get install -y postgresql postgresql-contrib
fi

echo ""
echo "[4/7] Install PM2 (process manager)..."
if ! command -v pm2 &>/dev/null; then
  npm install -g pm2
  pm2 startup systemd -u "$SUDO_USER" --hp "/home/$SUDO_USER"
fi

echo ""
echo "[5/7] Buat pengguna & database PostgreSQL..."
cat <<'EOF'
>>> PENTING: Anda perlu mengisi nilai PASSWORD_DB_SERVER di Backend/.env
>>> dengan password database yang dibuat di bawah ini.
EOF
sudo -u postgres psql <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'smartschool_user') THEN
    CREATE ROLE smartschool_user LOGIN PASSWORD 'GANTI_DENGAN_PASSWORD_AMAN';
  END IF;
END
\$\$;
SQL
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = 'smartschool'" | grep -q 1 || \
  sudo -u postgres createdb -O smartschool_user smartschool
echo "Database 'smartschool' & user 'smartschool_user' siap."

echo ""
echo "[6/7] Siapkan direktori aplikasi..."
mkdir -p "$APP_DIR" /var/www/certbot

if [ ! -d "$APP_DIR/Backend" ] || [ ! -d "$APP_DIR/Frontend" ]; then
  echo ">>> Folder $APP_DIR/Backend dan $APP_DIR/Frontend belum ada."
  echo ">>> Salin/upload folder Backend & Frontend dari komputer kamu ke $APP_DIR lalu jalankan deploy.sh"
fi

echo ""
echo "[7/7] Pasang config Apache2..."
# Aktifkan modul yang dibutuhkan
a2enmod proxy proxy_http proxy_wstunnel rewrite alias ssl

cp ./apache/smartschool.citrasolusi.id.conf /etc/apache2/sites-available/smartschool.conf
a2ensite smartschool
a2dissite 000-default || true

apache2ctl configtest && systemctl reload apache2

echo ""
echo "=============================================="
echo "  Setelah ini, lakukan:"
echo "  1. Arahkan DNS/pointing smartschool.citrasolusi.id ke IP VPS ini"
echo "  2. Edit Backend/.env  -> isi DATABASE_URL & JWT_SECRET"
echo "  3. Install SSL:  sudo bash setup-ssl.sh" 
echo "  4. Deploy app:   sudo bash deploy.sh"
echo "=============================================="