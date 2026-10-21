/**
 * Pembuat tautan pendaftaran PPDB.
 *
 * Modul ini sengaja bebas dari React/DOM agar aturan pembentukan URL dapat
 * diuji langsung. Tautan hanya dibuat dari ID yang benar-benar dikembalikan
 * Backend:
 * - jalur.id        -> jalurPpdbId
 * - jalur.sekolahId -> sekolahId
 */

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const NIL_UUID = "00000000-0000-0000-0000-000000000000";

/**
 * Segmen path yang bukan nama sekolah/tenant. Dipakai saat halaman admin
 * diakses memakai prefix tenant (mis. /sekolah-a/admin/spmb/jalur).
 */
const SEGMEN_BUKAN_TENANT = new Set([
  "",
  "admin",
  "guru",
  "siswa",
  "yayasan",
  "super-admin",
  "login",
  "register",
  "forgot-password",
  "onboarding",
  "pin",
  "ppdb",
  "api",
  "_next",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
]);

export function isUuidPendaftaran(value) {
  const normalized = String(value || "").trim();

  return (
    UUID_REGEX.test(normalized) &&
    normalized.toLowerCase() !== NIL_UUID
  );
}

export function normalisasiBasePath(basePath) {
  const raw = String(basePath || "").trim();

  if (!raw || raw === "/") {
    return "";
  }

  const denganSlash = raw.startsWith("/") ? raw : `/${raw}`;

  return denganSlash.replace(/\/+$/, "");
}

/**
 * Mendeteksi prefix tenant dari pathname halaman admin.
 *
 * - /admin/spmb/jalur           -> "" (tidak ada prefix tenant)
 * - /sekolah-a/admin/spmb/jalur -> "/sekolah-a"
 *
 * Untuk deployment berbasis subdomain, origin sudah memuat subdomain sekolah
 * sehingga prefix path tidak diperlukan.
 */
export function deteksiPrefixTenant(pathname) {
  if (typeof pathname !== "string" || !pathname.startsWith("/")) {
    return "";
  }

  const segmen = pathname.split("/").filter(Boolean);

  if (segmen.length === 0) {
    return "";
  }

  let kandidat = segmen[0];

  try {
    kandidat = decodeURIComponent(kandidat);
  } catch {
    kandidat = segmen[0];
  }

  if (SEGMEN_BUKAN_TENANT.has(kandidat.toLowerCase())) {
    return "";
  }

  return `/${segmen[0]}`;
}

/**
 * Menjelaskan mengapa tautan belum dapat dibuat.
 */
export function alasanTautanTidakTersedia(jalur) {
  if (!jalur) {
    return "Data jalur belum dipilih.";
  }

  if (!isUuidPendaftaran(jalur.id)) {
    return "Data jalur tidak memuat jalurPpdbId yang valid dari Backend. Muat ulang data jalur lalu coba lagi.";
  }

  if (!isUuidPendaftaran(jalur.sekolahId)) {
    return "Data jalur tidak memuat sekolahId yang valid dari Backend. Muat ulang data jalur lalu coba lagi.";
  }

  return "";
}

/**
 * Membuat URL formulir PPDB publik.
 *
 * @param {{ id?: string, sekolahId?: string }} jalur
 * @param {{ origin?: string, basePath?: string }} [options]
 */
export function buatTautanPendaftaran(jalur, options = {}) {
  const alasan = alasanTautanTidakTersedia(jalur);

  if (alasan) {
    return "";
  }

  const origin =
    typeof options.origin === "string"
      ? options.origin.replace(/\/+$/, "")
      : typeof window !== "undefined"
        ? window.location.origin
        : "";

  if (!origin) {
    return "";
  }

  const basePath =
    options.basePath !== undefined
      ? normalisasiBasePath(options.basePath)
      : deteksiPrefixTenant(
          typeof window !== "undefined"
            ? window.location.pathname
            : ""
        );

  const params = new URLSearchParams({
    sekolahId: String(jalur.sekolahId).trim(),
    jalurPpdbId: String(jalur.id).trim(),
  });

  return `${origin}${basePath}/PPDB/daftar?${params.toString()}`;
}
