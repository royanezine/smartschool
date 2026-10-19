// =========================================================
// AUTH JWT HELPER + SESSION (SINGLE SOURCE OF TRUTH)
// =========================================================
//
// Modul ini adalah SATU-SATUNYA sumber kebenaran untuk:
// - token akses
// - identitas pengguna (nama, email, id)
// - role pengguna
//
// Aturan penting:
// 1. Token + user disimpan di localStorage (mekanisme sebelumnya) agar
//    konsisten dengan modul/service yang membaca token langsung dari
//    localStorage. Catatan: localStorage dibagi antar tab pada origin
//    yang sama, sehingga login/logout di satu tab memengaruhi seluruh
//    tab pada origin ini.
// 2. Token + user harus selalu ditulis/dihapus bersama
//    (lihat setSession / clearSession) agar tidak ada sesi "campur".
// 3. Role HANYA diambil dari klaim token (hasil autentikasi), bukan
//    dari URL, prop, maupun default yang salah.
// 4. Jika objek `user` di storage tidak lagi cocok dengan token
//    (mis. sisa akun lain pada origin yang sama), identitas
//    direkonstruksi dari token agar tidak tertukar.
// =========================================================

export const AUTH_TOKEN_KEY = "token";
export const AUTH_USER_KEY = "user";
export const AUTH_EVENT = "user-updated";

// Key token lama yang masih dibaca sebagian service. Kita ikut
// membersihkannya agar tidak menjadi sumber kebenaran kedua.
const LEGACY_TOKEN_KEYS = [
  "accessToken",
  "access_token",
  "authToken",
  "jwt",
];

function isBrowser() {
  return typeof window !== "undefined";
}

/**
 * Penyimpanan sesi aktif.
 *
 * Sesi (token + user) disimpan di localStorage (mekanisme sebelumnya)
 * agar konsisten dengan modul/service yang membaca token langsung dari
 * localStorage. localStorage dibagi antar tab pada origin yang sama.
 *
 * Catatan penting: TIDAK ada lagi pembersihan otomatis localStorage
 * (dulu `purgeLegacyLocalAuth`) karena `token`/`user` di localStorage
 * kini JUSTRU adalah sesi aktif. Membersihkannya akan menghapus sesi.
 */
function authStore() {
  if (!isBrowser()) {
    return null;
  }

  return window.localStorage;
}

/**
 * Mengambil token akses dari storage.
 */
export function getToken() {
  if (!isBrowser()) {
    return null;
  }

  const token = authStore()?.getItem(AUTH_TOKEN_KEY);

  return token && token.trim() ? token.trim() : null;
}

/**
 * Decode payload JWT tanpa library tambahan.
 *
 * Catatan:
 * JWT hanya kita decode untuk membaca data UI seperti:
 * - role
 * - izin
 * - modulAktif
 *
 * Validasi token tetap dilakukan oleh Backend.
 */
export function decodeToken(token) {
  if (!token) {
    return null;
  }

  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const base64Url = parts[1];

    // Base64URL -> Base64
    const base64 = base64Url
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    // Tambahkan padding jika diperlukan
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "="
    );

    const binaryString = atob(padded);

    const bytes = Uint8Array.from(
      binaryString,
      (char) => char.charCodeAt(0)
    );

    const jsonString = new TextDecoder().decode(bytes);

    return JSON.parse(jsonString);
  } catch (error) {
    console.error("[AUTH] Gagal decode JWT:", error);

    return null;
  }
}

/**
 * Mengambil payload user dari token login.
 */
export function getAuthPayload() {
  if (!isBrowser()) {
    return null;
  }

  const token = getToken();

  if (!token) {
    return null;
  }

  return decodeToken(token);
}

/**
 * Normalisasi nama role menjadi bentuk kanonik:
 * huruf kecil dengan pemisah underscore.
 *
 * Contoh:
 * - "Guru"           -> "guru"
 * - "Admin Sekolah"  -> "admin_sekolah"
 * - "Super-Admin"    -> "super_admin"
 * - "adminyayasan"   -> "admin_yayasan"
 */
export function normalizeRole(role) {
  if (!role) {
    return "";
  }

  if (typeof role === "object") {
    role =
      role.nama ??
      role.name ??
      role.namaPeran ??
      role.role ??
      role.namaTampilan ??
      "";
  }

  const cleaned = String(role)
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  if (cleaned === "superadmin") {
    return "super_admin";
  }

  if (cleaned === "adminyayasan") {
    return "admin_yayasan";
  }

  if (cleaned === "adminsekolah") {
    return "admin_sekolah";
  }

  return cleaned;
}

/**
 * Mengambil role user dari klaim token (bukan dari URL/prop).
 */
export function getAuthRole() {
  const payload = getAuthPayload();

  const role = normalizeRole(
    payload?.role ?? payload?.peran ?? null
  );

  return role || null;
}

/**
 * Mengambil role ID user.
 */
export function getAuthRoleId() {
  const payload = getAuthPayload();

  return payload?.roleId ?? payload?.peranId ?? null;
}

/**
 * Mengambil permission/izin user.
 *
 * Backend:
 *
 * {
 *   izin: [
 *     "siswa.view",
 *     "guru.view",
 *     "absensi.view"
 *   ]
 * }
 */
export function getPermissions() {
  const payload = getAuthPayload();

  if (!Array.isArray(payload?.izin)) {
    return [];
  }

  return payload.izin;
}

/**
 * Mengambil modul aktif sekolah.
 *
 * Backend:
 *
 * {
 *   modulAktif: [
 *     "akademik",
 *     "absensi"
 *   ]
 * }
 */
export function getActiveModules() {
  const payload = getAuthPayload();

  if (!Array.isArray(payload?.modulAktif)) {
    return [];
  }

  return payload.modulAktif;
}

/**
 * Mengecek apakah user mempunyai permission tertentu.
 */
export function hasPermission(permission) {
  if (!permission) {
    return true;
  }

  const permissions = getPermissions();

  return permissions.includes(permission);
}

/**
 * Mengecek apakah modul aktif.
 */
export function hasModule(moduleCode) {
  if (!moduleCode) {
    return true;
  }

  const modules = getActiveModules();

  return modules.includes(moduleCode);
}

/**
 * Mengecek permission + module sekaligus.
 */
export function canAccess(permission, moduleCode) {
  const permissionAllowed = hasPermission(permission);
  const moduleAllowed = hasModule(moduleCode);

  return permissionAllowed && moduleAllowed;
}

// =========================================================
// SESSION MANAGEMENT
// =========================================================

/**
 * Membentuk objek user sesi yang seragam untuk seluruh aplikasi.
 *
 * Menggabungkan data user dari respons autentikasi dengan klaim
 * token, sehingga:
 * - role selalu berasal dari token (hasil autentikasi),
 * - id/sekolahId/yayasanId tidak hilang bila respons tidak memuatnya.
 */
export function normalizeUser(rawUser, payload = null) {
  if (!rawUser && !payload) {
    return null;
  }

  const source =
    rawUser && typeof rawUser === "object"
      ? rawUser.user ??
        rawUser.data?.user ??
        rawUser.data ??
        rawUser
      : {};

  const id =
    source.id ??
    source.userId ??
    payload?.userId ??
    null;

  const roleRaw =
    source.role ??
    source.peran ??
    payload?.role ??
    null;

  return {
    ...source,
    id,
    userId: id,
    namaLengkap:
      source.namaLengkap ??
      source.nama ??
      source.namalengkap ??
      "",
    namaPengguna:
      source.namaPengguna ??
      source.username ??
      source.userName ??
      "",
    email: source.email ?? payload?.email ?? "",
    role: normalizeRole(roleRaw) || null,
    roleId:
      source.roleId ??
      source.peranId ??
      payload?.roleId ??
      payload?.peranId ??
      null,
    sekolahId: source.sekolahId ?? payload?.sekolahId ?? null,
    yayasanId: source.yayasanId ?? payload?.yayasanId ?? null,
  };
}

/**
 * Menyimpan sesi (token + user) secara ATOMIK di storage.
 *
 * Selalu gunakan fungsi ini alih-alih menulis storage sendiri,
 * agar token dan identitas tidak pernah berbeda pemiliknya.
 */
export function setSession(token, rawUser = null) {
  if (!isBrowser()) {
    return null;
  }

  if (!token || !String(token).trim()) {
    throw new Error("Token sesi tidak boleh kosong.");
  }

  const store = authStore();
  const cleanToken = String(token).trim();
  const payload = decodeToken(cleanToken);
  const user = normalizeUser(rawUser, payload);

  store.setItem(AUTH_TOKEN_KEY, cleanToken);
  store.setItem(AUTH_USER_KEY, JSON.stringify(user));

  // Hapus key token lama agar tidak ada sumber kebenaran kedua.
  LEGACY_TOKEN_KEYS.forEach((key) => {
    try {
      store.removeItem(key);
    } catch (error) {
      /* ignore */
    }
  });

  emitAuthUpdate();

  return user;
}

/**
 * Menghapus sesi secara lengkap (token + user + key lama).
 *
 * Karena sesi disimpan di localStorage (dibagi antar tab), logout
 * membersihkan sesi untuk seluruh tab pada origin ini. Tidak
 * mengganggu data non-autentikasi.
 */
export function clearSession() {
  if (!isBrowser()) {
    return;
  }

  const store = authStore();

  const keys = [
    AUTH_TOKEN_KEY,
    AUTH_USER_KEY,
    ...LEGACY_TOKEN_KEYS,
  ];

  keys.forEach((key) => {
    try {
      store.removeItem(key);
    } catch (error) {
      /* ignore */
    }
  });

  emitAuthUpdate();
}

/**
 * Memberi tahu seluruh komponen pada TAB INI bahwa sesi berubah.
 *
 * Sesi kini tersimpan di localStorage (dibagi antar tab). Perubahan
 * sesi pada tab lain tidak otomatis memicu event ini; event `storage`
 * browser dapat dipakai bila perlu sinkronisasi antar-tab.
 */
export function emitAuthUpdate() {
  if (!isBrowser()) {
    return;
  }

  try {
    window.dispatchEvent(new Event(AUTH_EVENT));
  } catch (error) {
    /* ignore */
  }
}

/**
 * Membaca objek user mentah dari storage.
 */
export function getStoredUser() {
  if (!isBrowser()) {
    return null;
  }

  const raw = authStore()?.getItem(AUTH_USER_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.error("[AUTH] Gagal membaca data pengguna:", error);

    return null;
  }
}

/**
 * Mengambil user sesi aktif dari token.
 *
 * Token adalah sumber kebenaran untuk `userId` dan `role`. Jika
 * `user` di storage tidak cocok dengan token (sisa sesi akun lain),
 * identitas direkonstruksi dari klaim token supaya nama/role tidak
 * tertukar antar akun.
 */
export function getSessionUser() {
  const payload = getAuthPayload();

  // Tanpa token tidak ada sesi aktif.
  if (!payload) {
    return null;
  }

  const stored = getStoredUser();

  if (!stored) {
    return normalizeUser(null, payload);
  }

  const tokenUserId = payload.userId ?? null;
  const storedUserId = stored.userId ?? stored.id ?? null;

  if (
    tokenUserId &&
    storedUserId &&
    String(tokenUserId) !== String(storedUserId)
  ) {
    console.warn(
      "[AUTH] Data user pada storage tidak cocok dengan token. " +
        "Identitas direkonstruksi dari token."
    );

    return normalizeUser(null, payload);
  }

  return normalizeUser(stored, payload);
}

/**
 * Ringkasan sesi aktif: token, payload, role, dan user.
 */
export function getSession() {
  const payload = getAuthPayload();

  if (!payload) {
    return null;
  }

  const role = normalizeRole(
    payload?.role ?? payload?.peran ?? null
  );

  return {
    token: getToken(),
    payload,
    role: role || null,
    user: getSessionUser(),
  };
}

/**
 * Halaman beranda (dashboard) berdasarkan role.
 */
export function getRoleHome(role) {
  switch (normalizeRole(role)) {
    case "super_admin":
      return "/super-admin";

    case "admin_yayasan":
    case "yayasan":
      return "/yayasan";

    case "admin_sekolah":
    case "admin":
      return "/admin/dashboard";

    case "guru":
      return "/guru";

    case "siswa":
      return "/siswa";

    default:
      return "/login";
  }
}
