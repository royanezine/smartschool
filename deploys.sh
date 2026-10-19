#!/usr/bin/env bash
set -Eeuo pipefail

# SmartSchool deployment only: pull -> build backend/frontend -> migrate -> restart -> test.
ROOT_DIR="/var/www/html/smartschool"
BACKEND_DIR="$ROOT_DIR/Backend"
FRONTEND_DIR="$ROOT_DIR/Frontend"
BACKEND_PM2_NAME="smartschool-backend"
FRONTEND_PM2_NAME="smartschool-frontend"
BRANCH="main"
FRONTEND_PORT="3006"
BACKEND_PORT="5000"

log()  { printf '\n\033[1;34m[DEPLOY]\033[0m %s\n' "$*"; }
ok()   { printf '\033[1;32m[OK]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[WARN]\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[1;31m[ERROR]\033[0m %s\n' "$*" >&2; exit 1; }

on_error() {
  local code=$?
  printf '\n\033[1;31m[ERROR]\033[0m Deployment gagal pada baris %s (exit code %s).\n' "$1" "$code" >&2
  printf 'Deployment dihentikan. Periksa error di atas; PM2 tidak akan direstart oleh tahap yang belum tercapai.\n' >&2
  exit "$code"
}
trap 'on_error $LINENO' ERR

[[ -d "$ROOT_DIR/.git" ]] || die "Repository Git tidak ditemukan di $ROOT_DIR"
[[ -f "$BACKEND_DIR/package.json" ]] || die "Backend/package.json tidak ditemukan."
[[ -f "$FRONTEND_DIR/package.json" ]] || die "Frontend/package.json tidak ditemukan."
command -v git >/dev/null 2>&1 || die "git tidak ditemukan."
command -v npm >/dev/null 2>&1 || die "npm tidak ditemukan."
command -v npx >/dev/null 2>&1 || die "npx tidak ditemukan."
command -v pm2 >/dev/null 2>&1 || die "pm2 tidak ditemukan."
command -v curl >/dev/null 2>&1 || die "curl tidak ditemukan."

log "Memeriksa perubahan lokal sebelum pull"
if [[ -n "$(git -C "$ROOT_DIR" status --porcelain --untracked-files=all \
  | grep -vE '^\?\? deploy\.sh$|^\?\? deploys\.sh$' || true)" ]]; then
  git -C "$ROOT_DIR" status --short
  die "Ada perubahan lokal selain file deploy. Amankan perubahan tersebut sebelum deploy."
fi

log "Pull branch $BRANCH"
git -C "$ROOT_DIR" pull --ff-only origin "$BRANCH"
ok "Git pull berhasil"

log "Build backend SmartSchool"
(
  cd "$BACKEND_DIR"
  npx prisma generate
  npm run build
)
ok "Build backend berhasil"

log "Build frontend SmartSchool"
(
  cd "$FRONTEND_DIR"
  npm run build
)
ok "Build frontend berhasil"

log "Memeriksa status migrasi Prisma"
(
  cd "$BACKEND_DIR"
  npx prisma migrate status
)

printf '\nPastikan backup PostgreSQL produksi tersedia sebelum migrasi.\n'
read -r -p "Lanjutkan menjalankan prisma migrate deploy? Ketik YES: " confirm
[[ "$confirm" == "YES" ]] || die "Migrasi dibatalkan. Build sudah selesai, PM2 belum direstart."

log "Menerapkan migration yang belum dijalankan"
(
  cd "$BACKEND_DIR"
  npx prisma migrate deploy
)
ok "Prisma migrate deploy berhasil"

log "Memastikan proses PM2 SmartSchool tersedia"
pm2 describe "$BACKEND_PM2_NAME" >/dev/null 2>&1 || die "Proses PM2 '$BACKEND_PM2_NAME' tidak ditemukan. Periksa nama di pm2 list."
pm2 describe "$FRONTEND_PM2_NAME" >/dev/null 2>&1 || die "Proses PM2 '$FRONTEND_PM2_NAME' tidak ditemukan. Periksa nama di pm2 list."

log "Restart backend SmartSchool"
pm2 restart "$BACKEND_PM2_NAME"
log "Restart frontend SmartSchool"
pm2 restart "$FRONTEND_PM2_NAME"
ok "Restart PM2 berhasil"

log "Menunggu aplikasi siap"
sleep 3

log "Testing port frontend $FRONTEND_PORT"
FRONTEND_CODE="$(curl --max-time 10 -sS -o /dev/null -w '%{http_code}' "http://127.0.0.1:${FRONTEND_PORT}/" || true)"
if [[ "$FRONTEND_CODE" =~ ^2[0-9][0-9]$ || "$FRONTEND_CODE" =~ ^3[0-9][0-9]$ ]]; then
  ok "Frontend merespons HTTP $FRONTEND_CODE"
else
  warn "Frontend merespons HTTP ${FRONTEND_CODE:-tidak ada respons}; periksa log."
fi

log "Testing port backend $BACKEND_PORT"
BACKEND_CODE="$(curl --max-time 10 -sS -o /dev/null -w '%{http_code}' "http://127.0.0.1:${BACKEND_PORT}/" || true)"
if [[ "$BACKEND_CODE" =~ ^[1-5][0-9][0-9]$ ]]; then
  # Any HTTP response proves a listener responded; root endpoint may legitimately be 404.
  ok "Backend merespons HTTP $BACKEND_CODE (endpoint / bisa saja tidak disediakan)"
else
  warn "Backend tidak memberi respons HTTP; periksa log."
fi

log "Testing domain utama"
DOMAIN_CODE="$(curl --max-time 15 -sS -o /dev/null -w '%{http_code}' "https://smartschool.citrasolusi.id/" || true)"
if [[ "$DOMAIN_CODE" =~ ^2[0-9][0-9]$ || "$DOMAIN_CODE" =~ ^3[0-9][0-9]$ ]]; then
  ok "Domain utama merespons HTTPS $DOMAIN_CODE"
else
  warn "Domain utama merespons HTTPS ${DOMAIN_CODE:-tidak ada respons}; periksa Apache/SSL/log."
fi

log "Ringkasan PM2 SmartSchool"
pm2 list

printf '\n'
if [[ "$FRONTEND_CODE" =~ ^2[0-9][0-9]$ || "$FRONTEND_CODE" =~ ^3[0-9][0-9]$ ]] \
   && [[ "$DOMAIN_CODE" =~ ^2[0-9][0-9]$ || "$DOMAIN_CODE" =~ ^3[0-9][0-9]$ ]] \
   && [[ "$BACKEND_CODE" =~ ^[1-5][0-9][0-9]$ ]]; then
  ok "DEPLOYMENT SELESAI: build, migrasi, restart, dan tes dasar berhasil."
  printf 'Frontend lokal : HTTP %s (port %s)\n' "$FRONTEND_CODE" "$FRONTEND_PORT"
  printf 'Backend lokal  : HTTP %s (port %s; respons HTTP diterima)\n' "$BACKEND_CODE" "$BACKEND_PORT"
  printf 'Domain HTTPS   : HTTP %s\n' "$DOMAIN_CODE"
else
  warn "DEPLOYMENT SELESAI DENGAN PERINGATAN: periksa hasil testing di atas sebelum menyatakan aplikasi normal."
  printf 'Frontend lokal : HTTP %s\n' "${FRONTEND_CODE:-N/A}"
  printf 'Backend lokal  : HTTP %s\n' "${BACKEND_CODE:-N/A}"
  printf 'Domain HTTPS   : HTTP %s\n' "${DOMAIN_CODE:-N/A}"
  printf '\nLog backend : pm2 logs %s --lines 50\n' "$BACKEND_PM2_NAME"
  printf 'Log frontend: pm2 logs %s --lines 50\n' "$FRONTEND_PM2_NAME"
fi
