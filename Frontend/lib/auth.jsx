// =========================================================
// AUTH JWT HELPER
// =========================================================

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

export function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("token");
}

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
  if (typeof window === "undefined") {
    return null;
  }

  const token = getToken();

  if (!token) {
    return null;
  }

  return decodeToken(token);
}

/**
 * Mengambil role user.
 */
export function getAuthRole() {
  const payload = getAuthPayload();

  return payload?.role ?? null;
}

/**
 * Mengambil role ID user.
 */
export function getAuthRoleId() {
  const payload = getAuthPayload();

  return payload?.roleId ?? null;
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