
import { getSessionUser } from "@/lib/auth";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const NIL_UUID = "00000000-0000-0000-0000-000000000000";

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

// Subdomain lokal (mis. smart.localhost:3000) atau produksi (mis. smart.smartschool.id)
// membawa tenant di host, bukan di path.
export function deteksiTenantDariHost(hostname) {
  const namaHost = String(hostname || "")
    .trim()
    .toLowerCase()
    .split(":")[0];

  if (!namaHost || namaHost === "localhost" || namaHost === "127.0.0.1") {
    return "";
  }

  if (namaHost.endsWith(".localhost")) {
    const kandidat = namaHost.slice(0, -".localhost".length);

    if (!kandidat || kandidat === "www") {
      return "";
    }

    if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(kandidat)) {
      return "";
    }

    return `/${kandidat}`;
  }

  const parts = namaHost.split(".");
  if (parts.length >= 3) {
    const kandidat = parts[0];

    if (
      !SEGMEN_BUKAN_TENANT.has(kandidat) &&
      !["www", "api", "app", "mail", "portal", "admin"].includes(kandidat) &&
      /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(kandidat)
    ) {
      return `/${kandidat}`;
    }
  }

  return "";
}

/**
 * Mendapatkan subdomain tenant dari berbagai sumber konteks:
 * 1. options (subdomain / tenant / basePath)
 * 2. data jalur (jalur.subdomain atau jalur.sekolah.subdomain)
 * 3. options.sekolah (sekolah.subdomain)
 * 4. URL browser (hostname atau prefix pathname)
 * 5. Sesi login pengguna (admin_sekolah / staff sekolah yang memiliki relasi sekolahId)
 */
export function dapatkanSubdomainDariKonteks(jalur = null, options = {}) {
  const optSub = options?.subdomain || options?.tenant;
  if (optSub && typeof optSub === "string") {
    const clean = optSub.trim().replace(/^\/+|\/+$/g, "");
    if (clean) return clean;
  }

  if (options?.basePath && typeof options.basePath === "string") {
    const clean = options.basePath.trim().replace(/^\/+|\/+$/g, "");
    if (clean) return clean;
  }

  if (jalur?.subdomain && typeof jalur.subdomain === "string") {
    const clean = jalur.subdomain.trim().replace(/^\/+|\/+$/g, "");
    if (clean) return clean;
  }

  if (jalur?.sekolah?.subdomain && typeof jalur.sekolah.subdomain === "string") {
    const clean = jalur.sekolah.subdomain.trim().replace(/^\/+|\/+$/g, "");
    if (clean) return clean;
  }

  const sekolahSub = options?.sekolah?.subdomain;
  if (sekolahSub && typeof sekolahSub === "string") {
    const clean = sekolahSub.trim().replace(/^\/+|\/+$/g, "");
    if (clean) return clean;
  }

  if (typeof window !== "undefined") {
    const dariHost = deteksiTenantDariHost(window.location.hostname);
    if (dariHost) {
      return dariHost.replace(/^\/+/, "");
    }

    const dariPath = deteksiPrefixTenant(window.location.pathname);
    if (dariPath) {
      return dariPath.replace(/^\/+/, "");
    }
  }

  try {
    const user = getSessionUser();
    const userSekolahId = user?.sekolahId || user?.sekolah?.id;
    const jalurSekolahId = jalur?.sekolahId;

    const cocok =
      !jalurSekolahId ||
      !userSekolahId ||
      String(jalurSekolahId).toLowerCase() ===
        String(userSekolahId).toLowerCase();

    if (cocok) {
      const userSub =
        user?.sekolah?.subdomain ||
        user?.subdomain ||
        (typeof user?.tenant === "string" ? user.tenant : "");

      if (userSub && typeof userSub === "string") {
        const clean = userSub.trim().replace(/^\/+|\/+$/g, "");
        if (clean) return clean;
      }
    }
  } catch {
    // Abaikan jika konteks auth tidak tersedia
  }

  if (options?.fallbackTenant && typeof options.fallbackTenant === "string") {
    const clean = options.fallbackTenant.trim().replace(/^\/+|\/+$/g, "");
    if (clean) return clean;
  }

  return "";
}

// PPDB hanya ada di bawah tenant sekolah. Fungsi ini menentukan prefix tenant
// dari URL yang sedang dibuka atau sesi sekolah saat ini; string kosong berarti tenant tidak diketahui.
export function basePathTenantSaatIni(fallbackTenant = "") {
  const sub = dapatkanSubdomainDariKonteks(null, {
    fallbackTenant,
  });

  if (sub) {
    return `/${sub}`;
  }

  return "";
}

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

  const subdomain = dapatkanSubdomainDariKonteks(jalur, options);

  if (!subdomain) {
    return "";
  }

  const basePath = `/${subdomain}`;

  const params = new URLSearchParams({
    sekolahId: String(jalur.sekolahId).trim(),
    jalurPpdbId: String(jalur.id).trim(),
  });

  return `${origin}${basePath}/PPDB/daftar?${params.toString()}`;
}
