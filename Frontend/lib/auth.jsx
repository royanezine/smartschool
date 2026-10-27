
export const AUTH_TOKEN_KEY = "token";
export const AUTH_USER_KEY = "user";
export const AUTH_EVENT = "user-updated";

const LEGACY_TOKEN_KEYS = [
  "accessToken",
  "access_token",
  "authToken",
  "jwt",
];

export const AUTH_SESSION_KEYS = [
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  ...LEGACY_TOKEN_KEYS,
];

function isBrowser() {
  return typeof window !== "undefined";
}

// Satu-satunya storage sesi auth: sessionStorage.
function authStore() {
  if (!isBrowser()) {
    return null;
  }

  return window.sessionStorage;
}

// Versi lama aplikasi menyimpan token/user di localStorage. Nilai sisa tersebut
// hanya dibersihkan (remove-only) supaya tidak lagi terbaca sebagai sumber sesi.
function purgeLegacyAuthStorage() {
  if (!isBrowser()) {
    return;
  }

  try {
    const legacyStore = window.localStorage;

    [AUTH_TOKEN_KEY, AUTH_USER_KEY, ...LEGACY_TOKEN_KEYS].forEach((key) => {
      legacyStore.removeItem(key);
    });
  } catch (error) {
  }
}

export function getToken() {
  if (!isBrowser()) {
    return null;
  }

  const token = authStore()?.getItem(AUTH_TOKEN_KEY);

  return token && token.trim() ? token.trim() : null;
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

    const base64 = base64Url
      .replace(/-/g, "+")
      .replace(/_/g, "/");

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

export function isTokenExpired(token) {
  if (!token) return true;
  const payload = decodeToken(token);
  if (!payload || typeof payload.exp !== "number") return false;
  return Date.now() >= payload.exp * 1000;
}

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

export function getAuthRole() {
  const payload = getAuthPayload();

  const role = normalizeRole(
    payload?.role ?? payload?.peran ?? null
  );

  return role || null;
}

export function getAuthRoleId() {
  const payload = getAuthPayload();

  return payload?.roleId ?? payload?.peranId ?? null;
}

export function getPermissions() {
  const payload = getAuthPayload();

  if (!Array.isArray(payload?.izin)) {
    return [];
  }

  return payload.izin;
}

export function getActiveModules() {
  const payload = getAuthPayload();

  if (!Array.isArray(payload?.modulAktif)) {
    return [];
  }

  return payload.modulAktif;
}

export function hasPermission(permission) {
  if (!permission) {
    return true;
  }

  const permissions = getPermissions();

  return permissions.includes(permission);
}

export function hasModule(moduleCode) {
  if (!moduleCode) {
    return true;
  }

  const modules = getActiveModules();

  return modules.includes(moduleCode);
}

export function canAccess(permission, moduleCode) {
  const permissionAllowed = hasPermission(permission);
  const moduleAllowed = hasModule(moduleCode);

  return permissionAllowed && moduleAllowed;
}


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

  const tokenId = payload?.userId ?? payload?.id ?? null;
  const sourceId = source.id ?? source.userId ?? null;

  const id = tokenId ?? sourceId ?? null;

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

  LEGACY_TOKEN_KEYS.forEach((key) => {
    try {
      store.removeItem(key);
    } catch {
    }
  });

  purgeLegacyAuthStorage();

  emitAuthUpdate();

  return user;
}

export function clearSession() {
  if (!isBrowser()) {
    return;
  }

  lastVerifiedProfile = null;
  lastVerifiedTime = 0;
  activeProfileVerification = null;

  const store = authStore();

  const keys = [
    AUTH_TOKEN_KEY,
    AUTH_USER_KEY,
    ...LEGACY_TOKEN_KEYS,
  ];

  keys.forEach((key) => {
    try {
      store.removeItem(key);
    } catch {
    }
  });

  purgeLegacyAuthStorage();

  emitAuthUpdate();
}

let activeProfileVerification = null;
let lastVerifiedProfile = null;
let lastVerifiedTime = 0;

export async function verifySessionProfile(force = false) {
  if (!isBrowser()) {
    return { valid: false, reason: "NOT_BROWSER" };
  }

  const token = getToken();
  if (!token) {
    return { valid: false, reason: "NO_TOKEN" };
  }

  if (isTokenExpired(token)) {
    clearSession();
    return { valid: false, reason: "TOKEN_EXPIRED" };
  }

  if (
    !force &&
    lastVerifiedProfile &&
    Date.now() - lastVerifiedTime < 10000
  ) {
    return {
      valid: true,
      user: lastVerifiedProfile,
      role: normalizeRole(lastVerifiedProfile.peran?.nama || getAuthRole()),
    };
  }

  if (activeProfileVerification) {
    return activeProfileVerification;
  }

  activeProfileVerification = (async () => {
    try {
      const apiUrl = (
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      ).replace(/\/+$/, "");
      const cleanBase = apiUrl.endsWith("/api") ? apiUrl : `${apiUrl}/api`;

      const response = await fetch(`${cleanBase}/users/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (response.status === 401) {
        clearSession();
        return {
          valid: false,
          reason: "UNAUTHORIZED",
          status: 401,
        };
      }

      if (response.status === 403) {
        return {
          valid: true,
          hasForbiddenAccess: true,
          status: 403,
          role: getAuthRole(),
        };
      }

      if (response.status >= 500) {
        return {
          valid: false,
          isTemporaryError: true,
          status: response.status,
          message: `Server sedang mengalami gangguan sementara (HTTP ${response.status}).`,
        };
      }

      if (!response.ok) {
        return {
          valid: false,
          isTemporaryError: true,
          status: response.status,
          message: `Gagal memverifikasi profil akun (HTTP ${response.status}).`,
        };
      }

      const json = await response.json();
      const profile = json?.data;

      if (
        !profile ||
        typeof profile !== "object" ||
        (!profile.id && !profile.email)
      ) {
        clearSession();
        return {
          valid: false,
          reason: "EMPTY_PROFILE",
          status: 200,
        };
      }

      setSession(token, profile);
      lastVerifiedProfile = profile;
      lastVerifiedTime = Date.now();

      const role = normalizeRole(profile.peran?.nama || getAuthRole());

      return {
        valid: true,
        user: profile,
        role,
      };
    } catch (netErr) {
      return {
        valid: false,
        isTemporaryError: true,
        isNetworkError: true,
        status: 0,
        message:
          "Tidak dapat terhubung ke server backend. Periksa koneksi jaringan Anda.",
      };
    } finally {
      activeProfileVerification = null;
    }
  })();

  return activeProfileVerification;
}

export function emitAuthUpdate() {
  if (!isBrowser()) {
    return;
  }

  try {
    window.dispatchEvent(new Event(AUTH_EVENT));
  } catch (error) {
  }
}

// Sinkronisasi auth utama: event internal AUTH_EVENT yang dipancarkan
// setSession()/clearSession() di tab yang sama. Listener "storage" hanya
// sebagai pelengkap untuk perubahan pada sessionStorage (satu-satunya storage
// sesi auth) dan tidak lagi bergantung pada localStorage.
export function subscribeAuth(listener) {
  if (!isBrowser() || typeof listener !== "function") {
    return () => {};
  }

  const handleAuthEvent = () => {
    listener(getSession());
  };

  const handleStorage = (event) => {
    if (!event) {
      return;
    }

    if (
      event.storageArea &&
      event.storageArea !== window.sessionStorage
    ) {
      return;
    }

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

export function getSessionUser() {
  const payload = getAuthPayload();

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

  const roleMismatch =
    tokenRole && storedRole && tokenRole !== storedRole;

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
