#!/usr/bin/env bash
# ============================================================
# SmartSchool - Setup SSL Let's Encrypt (smartschool.citrasolusi.id)
#
# Pra-syarat: DNS smartschool.citrasolusi.id SUDAH pointing ke IP VPS
#
# Jalankan:  sudo bash setup-ssl.sh
# ============================================================
set -euo pipefail

DOMAIN="smartschool.citrasolusi.id"

if [ "$(id -u)" -ne 0 ]; then
  echo "ERROR: Jalankan sebagai root (sudo bash $0)" >&2
  exit 1
fi

echo "=============================================="
echo "  Setup SSL untuk $DOMAIN"
echo "=============================================="

# Pastikan certbot terinstal
if ! command -v certbot &>/dev/null; then
  echo ">>> Install certbot..."
  apt-get install -y certbot python3-certbot-apache
fi

# Pastikan apache2 sudah terpasang config (setup-server.sh)
if [ ! -f /etc/apache2/sites-enabled/smartschool.conf ]; then
  echo "ERROR: Config apache2 smartschool belum terpasang. Jalankan setup-server.sh dulu." >&2
  exit 1
fi

echo ""
echo ">>> Membuat sertifikat SSL..."
certbot --apache \
  -d "$DOMAIN" \
  --non-interactive \
  --agree-tos \
  --redirect \
  --register-unsafely-without-email

echo ""
echo ">>> Verifikasi auto-renewal..."
certbot renew --dry-run

echo ""
echo "=============================================="
echo "  SSL berhasil dipasang!"
echo "  https://$DOMAIN  sudah aktif"
echo "=============================================="