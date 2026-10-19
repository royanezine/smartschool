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

/**
 * Seluruh key storage yang merupakan bagian dari sesi autentikasi.
 * Dipakai untuk menyaring event `storage` lintas-tab: hanya perubahan
 * pada key sesi yang memicu sinkronisasi identitas.
 */
export const AUTH_SESSION_KEYS = [
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  ...LEGACY_TOKEN_KEYS,
];

function isBrowser() {
  return typeof window !== "undefined";
}

/**
 * Penyimpanan sesi aktif.
 *
 * Sesi (token + user) disimpan di sessionStorage sebagai penyimpanan
 * utama. sessionStorage TIDAK dibagi antar-tab pada origin yang sama,
 * sehingga setiap tab memiliki sesi sendiri dan login multi-akun
 * dalam satu browser menjadi mungkin.
 *
 * localStorage tetap menyimpan salinan untuk backward compatibility
 * dengan file yang membaca langsung dari localStorage. Namun, sumber
 * kebenaran utama adalah sessionStorage.
 *
 * Catatan penting: TIDAK ada lagi pembersihan otomatis localStorage
 * (dulu `purgeLegacyLocalAuth`) karena `token`/`user` di localStorage
 * kini JUSTRU adalah sesi aktif. Membersihkannya akan menghapus sesi.
 */
function authStore() {
  if (!isBrowser()) {
    return null;
  }

  return window.sessionStorage;
}

/**
 * Penyimpanan legacy (localStorage) untuk backward compatibility.
 */
function legacyAuthStore() {
  if (!isBrowser()) {
    return null;
  }

  return window.localStorage;
}

/**
 * Mengambil token akses dari storage.
 *
 * Sumber utama: sessionStorage (per-tab). Fallback ke localStorage
 * untuk backward compatibility saat user belum reload setelah upgrade.
 */
export function getToken() {
  if (!isBrowser()) {
    return null;
  }

  // Utama: sessionStorage (per-tab, tidak dibagi antar tab)
  let token = authStore()?.getItem(AUTH_TOKEN_KEY);

  // Fallback: localStorage (untuk backward compatibility)
  if (!token) {
    token = legacyAuthStore()?.getItem(AUTH_TOKEN_KEY);
  }

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

  // Identitas (id) dan roleId HANYA boleh mengikuti klaim token yang
  // aktif. `user` di storage hanyalah cache tampilan; bila ia berasal
  // dari akun lain (sisa sesi pada origin yang sama) datanya tidak
  // boleh menimpa identitas token. Fallback ke `source` hanya dipakai
  // ketika token memang tidak memuat id/roleId.
  const tokenId = payload?.userId ?? payload?.id ?? null;
  const sourceId = source.id ?? source.userId ?? null;

  const id = tokenId ?? sourceId ?? null;

  // Role HARUS berasal dari klaim token (hasil autentikasi). `user` di
  // storage hanyalah cache identitas; bila ia tertinggal dari akun lain
  // (mis. sisa sesi "super_admin" pada origin yang sama), role TIDAK
  // boleh ikut tertular. Karena itu klaim token didahulukan, dan data
  // storage hanya dipakai sebagai fallback saat token tidak memuat role.
  const roleRaw =
    payload?.role ??
    payload?.peran ??
    source.role ??
    source.peran ??
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
      payload?.roleId ??
      payload?.peranId ??
      source.roleId ??
      source.peranId ??
      null,
    sekolahId: source.sekolahId ?? payload?.sekolahId ?? null,
    yayasanId: source.yayasanId ?? payload?.yayasanId ?? null,
  };
}

/**
 * Menyimpan sesi (token + user) secara ATOMIK di storage.
 *
 * Sesi disimpan di sessionStorage (per-tab) sebagai sumber utama.
 * localStorage juga menerima salinan untuk backward compatibility
 * dengan file yang membaca langsung dari localStorage.
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
  const legacyStore = legacyAuthStore();
  const cleanToken = String(token).trim();
  const payload = decodeToken(cleanToken);
  const user = normalizeUser(rawUser, payload);

  // Tulis ke sessionStorage (utama)
  store.setItem(AUTH_TOKEN_KEY, cleanToken);
  store.setItem(AUTH_USER_KEY, JSON.stringify(user));

  // Juga tulis ke localStorage (backward compatibility)
  if (legacyStore) {
    try {
      legacyStore.setItem(AUTH_TOKEN_KEY, cleanToken);
      legacyStore.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } catch {
      /* localStorage mungkin penuh atau diblokir */
    }
  }

  // Hapus key token lama dari kedua storage
  LEGACY_TOKEN_KEYS.forEach((key) => {
    try {
      store.removeItem(key);
      legacyStore?.removeItem(key);
    } catch {
      /* ignore */
    }
  });

  emitAuthUpdate();

  return user;
}

/**
 * Menghapus sesi secara lengkap (token + user + key lama).
 *
 * Membersihkan sesi dari sessionStorage (utama) dan localStorage
 * (backward compatibility). Karena sesi utama ada di sessionStorage,
 * logout hanya memengaruhi tab ini. Tab lain dengan akun berbeda
 * tidak terpengaruh.
 */
export function clearSession() {
  if (!isBrowser()) {
    return;
  }

  const store = authStore();
  const legacyStore = legacyAuthStore();

  const keys = [
    AUTH_TOKEN_KEY,
    AUTH_USER_KEY,
    ...LEGACY_TOKEN_KEYS,
  ];

  keys.forEach((key) => {
    try {
      store.removeItem(key);
      legacyStore?.removeItem(key);
    } catch {
      /* ignore */
    }
  });

  emitAuthUpdate();
}

/**
 * Memberi tahu seluruh komponen pada TAB INI bahwa sesi berubah.
 *
 * Sesi tersimpan di localStorage (dibagi antar tab). Perubahan pada tab
 * lain TIDAK memicu event ini, melainkan event `storage` browser.
 * Gunakan `subscribeAuth()` agar menerima keduanya (tab ini + tab lain).
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
 * Berlangganan perubahan sesi dengan perilaku antar-tab yang eksplisit.
 *
 * Desain produksi: sesi disimpan di localStorage sehingga SATU sesi
 * dibagi oleh seluruh tab pada origin yang sama. Karena itu listener
 * dipanggil untuk:
 * - `AUTH_EVENT`  : perubahan pada TAB INI (login/logout).
 * - `storage`      : perubahan dari TAB LAIN pada origin yang sama.
 *
 * Dengan begitu tab tidak pernah menampilkan identitas lama/campur saat
 * sesi bersama berubah. Untuk menguji beberapa akun secara INDEPENDEN,
 * gunakan konteks browser terpisah (profil/incognito/origin berbeda)
 * sehingga localStorage-nya tidak dibagi.
 *
 * @param {(session: ReturnType<typeof getSession>) => void} listener
 * @returns {() => void} fungsi untuk berhenti berlangganan.
 */
export function subscribeAuth(listener) {
  if (!isBrowser() || typeof listener !== "function") {
    return () => {};
  }

  const handleAuthEvent = () => {
    listener(getSession());
  };

  const handleStorage = (event) => {
    // Abaikan perubahan storage non-sesi (mis. preferensi UI).
    if (!event) {
      return;
    }

    if (
      event.storageArea &&
      event.storageArea !== window.localStorage
    ) {
      return;
    }

    // `key === null` berarti storage dibersihkan (clear()).
    if (
      event.key !== null &&
      !AUTH_SESSION_KEYS.includes(event.key)
    ) {
      return;
    }

    listener(getSession());
  };

  window.addEventListener(AUTH_EVENT, handleAuthEvent);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(AUTH_EVENT, handleAuthEvent);
    window.removeEventListener("storage", handleStorage);
  };
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

  const tokenRole = normalizeRole(
    payload?.role ?? payload?.peran ?? null
  );

  const storedRole = normalizeRole(
    stored.role ?? stored.peran ?? null
  );

  const idMismatch =
    tokenUserId &&
    storedUserId &&
    String(tokenUserId) !== String(storedUserId);

  // Role pada storage yang berbeda dari klaim token menandakan data
  // `user` berasal dari akun lain (mis. sisa sesi "super_admin").
  // Termasuk kasus ketika `user` di storage tidak memuat id, sehingga
  // pemeriksaan id di atas tidak dapat mendeteksinya.
  const roleMismatch =
    tokenRole && storedRole && tokenRole !== storedRole;

  // Token memuat id, tetapi `user` di storage tidak memuat id sama sekali:
  // identitas pada storage tidak dapat diverifikasi terhadap token. Karena
  // `setSession` selalu menulis id dari token, kondisi ini hanya muncul
  // untuk data sisa/rusak, sehingga lebih aman direkonstruksi dari token
  // agar nama akun lain tidak bocor.
  const idUnknown = Boolean(tokenUserId) && !storedUserId;

  if (idMismatch || roleMismatch || idUnknown) {
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
