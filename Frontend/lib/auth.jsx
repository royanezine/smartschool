
export const AUTH_TOKEN_KEY = "token";
export const AUTH_REFRESH_TOKEN_KEY = "refreshToken";
export const AUTH_USER_KEY = "user";
export const AUTH_EVENT = "user-updated";

const LEGACY_TOKEN_KEYS = [
  "accessToken",
  "access_token",
  "authToken",
  "jwt",
];

const LEGACY_REFRESH_TOKEN_KEYS = [
  "refresh_token",
];

export const AUTH_SESSION_KEYS = [
  AUTH_TOKEN_KEY,
  AUTH_REFRESH_TOKEN_KEY,
  AUTH_USER_KEY,
  ...LEGACY_TOKEN_KEYS,
  ...LEGACY_REFRESH_TOKEN_KEYS,
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

    [
      AUTH_TOKEN_KEY,
      AUTH_REFRESH_TOKEN_KEY,
      AUTH_USER_KEY,
      ...LEGACY_TOKEN_KEYS,
      ...LEGACY_REFRESH_TOKEN_KEYS,
    ].forEach((key) => {
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

export function getRefreshToken() {
  if (!isBrowser()) {
    return null;
  }

  const token = authStore()?.getItem(AUTH_REFRESH_TOKEN_KEY);

  return token && token.trim() ? token.trim() : null;
}

export function setRefreshToken(refreshToken) {
  if (!isBrowser()) {
    return;
  }

  const store = authStore();
  if (!store) {
    return;
  }

  if (refreshToken && String(refreshToken).trim()) {
    store.setItem(AUTH_REFRESH_TOKEN_KEY, String(refreshToken).trim());
  } else {
    store.removeItem(AUTH_REFRESH_TOKEN_KEY);
  }
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

  if (Array.isArray(payload?.izin) && payload.izin.length > 0) {
    return payload.izin;
  }

  const stored = getStoredUser();
  if (Array.isArray(stored?.izin)) {
    return stored.izin;
  }

  return [];
}

export function getActiveModules() {
  const payload = getAuthPayload();

  if (Array.isArray(payload?.modulAktif) && payload.modulAktif.length > 0) {
    return payload.modulAktif;
  }

  const stored = getStoredUser();
  if (Array.isArray(stored?.modulAktif)) {
    return stored.modulAktif;
  }

  return [];
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

  const normalizedRole = normalizeRole(roleRaw) || null;
  const isSiswa = normalizedRole === "siswa";

  const resolvedJabatanRef = isSiswa
    ? null
    : source.jabatanRef ?? rawUser?.jabatanRef ?? null;

  const resolvedJabatanId = isSiswa
    ? null
    : source.jabatanId ??
      source.jabatanRef?.id ??
      rawUser?.jabatanId ??
      rawUser?.jabatanRef?.id ??
      payload?.jabatanId ??
      null;

  const resolvedJabatan = isSiswa
    ? null
    : source.jabatan ??
      source.jabatanRef?.namaJabatan ??
      source.jabatanRef?.nama ??
      rawUser?.jabatan ??
      rawUser?.jabatanRef?.namaJabatan ??
      rawUser?.jabatanRef?.nama ??
      payload?.jabatan ??
      null;

  const resolvedAksesMenu = isSiswa
    ? []
    : Array.isArray(source.aksesMenu)
    ? source.aksesMenu
    : Array.isArray(source.jabatanRef?.aksesMenu)
    ? source.jabatanRef.aksesMenu
    : Array.isArray(rawUser?.aksesMenu)
    ? rawUser.aksesMenu
    : Array.isArray(rawUser?.jabatanRef?.aksesMenu)
    ? rawUser.jabatanRef.aksesMenu
    : Array.isArray(payload?.aksesMenu)
    ? payload.aksesMenu
    : [];

  const resolvedIzin = Array.isArray(payload?.izin)
    ? payload.izin
    : Array.isArray(source.izin)
    ? source.izin
    : Array.isArray(rawUser?.izin)
    ? rawUser.izin
    : [];

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
    role: normalizedRole,
    roleId:
      payload?.roleId ??
      payload?.peranId ??
      source.roleId ??
      source.peranId ??
      null,
    sekolahId:
      source.sekolahId ??
      source.sekolah?.id ??
      rawUser?.sekolah?.id ??
      payload?.sekolahId ??
      null,
    yayasanId: source.yayasanId ?? payload?.yayasanId ?? null,
    jabatanId: resolvedJabatanId,
    jabatanRef: resolvedJabatanRef,
    jabatan: resolvedJabatan,
    aksesMenu: resolvedAksesMenu,
    izin: resolvedIzin,
    jenjang:
      source.jenjang ??
      source.sekolah?.jenjang ??
      rawUser?.jenjang ??
      rawUser?.sekolah?.jenjang ??
      payload?.jenjang ??
      null,
  };
}

export function setSession(token, rawUser = null, refreshToken = null) {
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

  const resolvedRefreshToken =
    (typeof refreshToken === "string" && refreshToken.trim())
      ? refreshToken.trim()
      : (typeof rawUser?.refreshToken === "string" && rawUser.refreshToken.trim())
        ? rawUser.refreshToken.trim()
        : null;

  if (resolvedRefreshToken) {
    store.setItem(AUTH_REFRESH_TOKEN_KEY, resolvedRefreshToken);
  }

  LEGACY_TOKEN_KEYS.forEach((key) => {
    try {
      store.removeItem(key);
    } catch {
    }
  });

  LEGACY_REFRESH_TOKEN_KEYS.forEach((key) => {
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
    AUTH_REFRESH_TOKEN_KEY,
    AUTH_USER_KEY,
    ...LEGACY_TOKEN_KEYS,
    ...LEGACY_REFRESH_TOKEN_KEYS,
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
let activeRefreshPromise = null;
let registeredApiFetch = null;

export function registerAuthApiHandlers(handlers = {}) {
  if (typeof handlers.apiFetch === "function") {
    registeredApiFetch = handlers.apiFetch;
  }
}

function getCleanApiBase() {
  const apiUrl = (
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) ||
    "http://localhost:5000"
  ).replace(/\/+$/, "");
  return apiUrl.endsWith("/api") ? apiUrl : `${apiUrl}/api`;
}

export async function requestNewAccessToken() {
  if (activeRefreshPromise) {
    return activeRefreshPromise;
  }

  activeRefreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      const err = new Error("Refresh token tidak tersedia.");
      err.status = 401;
      throw err;
    }

    const refreshUrl = `${getCleanApiBase()}/auth/refresh`;
    let response;
    try {
      response = await fetch(refreshUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (netErr) {
      const err = new Error(
        "Tidak dapat terhubung ke server backend untuk refresh token."
      );
      err.status = 0;
      err.isNetworkError = true;
      throw err;
    }

    let data = null;
    try {
      if (typeof response.json === "function") {
        data = await response.json();
      } else if (typeof response.text === "function") {
        const text = await response.text();
        data = text && text.trim() ? JSON.parse(text) : null;
      }
    } catch {
      data = null;
    }

    if (!response.ok) {
      const message =
        data?.message ||
        data?.error ||
        `Gagal memperbarui token (Status: ${response.status})`;
      const err = new Error(message);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    const newAccessToken =
      data?.token ||
      data?.accessToken ||
      data?.data?.token ||
      data?.data?.accessToken;

    const newRefreshToken =
      data?.refreshToken ||
      data?.data?.refreshToken ||
      refreshToken;

    if (!newAccessToken) {
      const err = new Error("AccessToken baru tidak diterima dari server.");
      err.status = 500;
      throw err;
    }

    const currentUser = getStoredUser();
    const updatedUser = data?.user || currentUser;

    setSession(newAccessToken, updatedUser, newRefreshToken);

    return newAccessToken;
  })().finally(() => {
    activeRefreshPromise = null;
  });

  return activeRefreshPromise;
}

export async function verifySessionProfile(force = false) {
  if (!isBrowser()) {
    return { valid: false, reason: "NOT_BROWSER" };
  }

  let token = getToken();
  if (!token) {
    return { valid: false, reason: "NO_TOKEN" };
  }

  if (isTokenExpired(token)) {
    if (getRefreshToken()) {
      try {
        token = await requestNewAccessToken();
      } catch (refreshErr) {
        if (refreshErr?.isNetworkError || refreshErr?.status === 0) {
          return {
            valid: false,
            isTemporaryError: true,
            isNetworkError: true,
            status: 0,
            message:
              refreshErr.message ||
              "Tidak dapat terhubung ke server backend. Periksa koneksi jaringan Anda.",
          };
        }
        clearSession();
        return { valid: false, reason: "TOKEN_EXPIRED", status: 401 };
      }
    } else {
      clearSession();
      return { valid: false, reason: "TOKEN_EXPIRED" };
    }
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
      const cleanBase = getCleanApiBase();
      let json = null;

      if (typeof registeredApiFetch === "function") {
        try {
          json = await registeredApiFetch("/api/users/profile", {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          });
        } catch (err) {
          if (err?.status === 401) {
            clearSession();
            return {
              valid: false,
              reason: "UNAUTHORIZED",
              status: 401,
            };
          }

          if (err?.status === 403) {
            return {
              valid: true,
              hasForbiddenAccess: true,
              status: 403,
              role: getAuthRole(),
            };
          }

          if (err?.status >= 500) {
            return {
              valid: false,
              isTemporaryError: true,
              status: err.status,
              message: `Server sedang mengalami gangguan sementara (HTTP ${err.status}).`,
            };
          }

          if (err?.isNetworkError || err?.status === 0 || !err?.status) {
            return {
              valid: false,
              isTemporaryError: true,
              isNetworkError: true,
              status: 0,
              message:
                "Tidak dapat terhubung ke server backend. Periksa koneksi jaringan Anda.",
            };
          }

          return {
            valid: false,
            isTemporaryError: true,
            status: err.status,
            message: `Gagal memverifikasi profil akun (HTTP ${err.status}).`,
          };
        }
      } else {
        let response = await fetch(`${cleanBase}/users/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          cache: "no-store",
        });

        if (response.status === 401) {
          if (getRefreshToken()) {
            let newAccessToken = null;
            try {
              newAccessToken = await requestNewAccessToken();
            } catch {
              clearSession();
              return {
                valid: false,
                reason: "UNAUTHORIZED",
                status: 401,
              };
            }

            if (newAccessToken) {
              token = newAccessToken;
              response = await fetch(`${cleanBase}/users/profile`, {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${newAccessToken}`,
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                cache: "no-store",
              });
            }
          }

          if (response.status === 401) {
            clearSession();
            return {
              valid: false,
              reason: "UNAUTHORIZED",
              status: 401,
            };
          }
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

        json = await response.json();
      }

      const profile = json?.data || json?.user;

      if (profile && typeof profile === "object") {
        if (!profile.aksesMenu && json?.aksesMenu) {
          profile.aksesMenu = json.aksesMenu;
        }
        if (!profile.jabatan && json?.jabatan) {
          profile.jabatan = json.jabatan;
        }

        const storedUser = getSessionUser() || getStoredUser();
        if (!profile.jenjang && storedUser?.jenjang) {
          profile.jenjang = storedUser.jenjang;
        }

        const resolvedSekolahId =
          profile.sekolah?.id ??
          profile.sekolahId ??
          storedUser?.sekolah?.id ??
          storedUser?.sekolahId ??
          getAuthPayload()?.sekolahId ??
          null;

        if (resolvedSekolahId && !profile.sekolahId) {
          profile.sekolahId = resolvedSekolahId;
        }

        // Ambil data jenjang sekolah nyata dari endpoint /dashboard backend yang sudah ada
        if (resolvedSekolahId && !profile.jenjang) {
          try {
            if (typeof registeredApiFetch === "function") {
              const dashJson = await registeredApiFetch("/api/dashboard", {
                method: "GET",
                headers: {
                  Accept: "application/json",
                },
                cache: "no-store",
              });
              const fetchedJenjang = dashJson?.data?.sekolah?.jenjang;
              if (fetchedJenjang) {
                profile.jenjang = String(fetchedJenjang).trim().toUpperCase();
              }
            } else {
              const latestAuthToken = getToken() || token;
              const dashRes = await fetch(`${cleanBase}/dashboard`, {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${latestAuthToken}`,
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                cache: "no-store",
              });
              if (dashRes.ok) {
                const dashJson = await dashRes.json();
                const fetchedJenjang = dashJson?.data?.sekolah?.jenjang;
                if (fetchedJenjang) {
                  profile.jenjang = String(fetchedJenjang).trim().toUpperCase();
                }
              }
            }
          } catch {
            // Fail-safe jika dashboard tidak dapat dijangkau
          }
        }
      }

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

      const latestToken = getToken() || token;
      setSession(latestToken, profile);
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

export function normalizeMenuName(name) {
  return String(name || "").trim().toLowerCase().replace(/\s+/g, " ");
}

export function getUserAksesMenu() {
  const user = getSessionUser() || getStoredUser();
  if (!user) return [];
  const raw = user.aksesMenu;
  return Array.isArray(raw) ? raw : [];
}

export function getUserJabatan() {
  const user = getSessionUser() || getStoredUser();
  return user?.jabatan || null;
}

export function getUserJenjang() {
  const user = getSessionUser() || getStoredUser();
  const raw =
    user?.jenjang ??
    user?.sekolah?.jenjang ??
    null;
  return raw && String(raw).trim() ? String(raw).trim().toUpperCase() : null;
}

/**
 * Konfigurasi restriksi jenjang sekolah untuk menu baku platform.
 * Requirement bisnis: menu "jurusan" HANYA berlaku untuk SMK.
 * Menu lain yang tidak terdaftar di sini berlaku untuk seluruh jenjang sekolah.
 */
export const MENU_JENJANG_RESTRICTIONS = {
  jurusan: ["SMA", "SMK"],
  prakerin: ["SMK"],
};

/**
 * Validasi apakah menu tertentu diizinkan untuk jenjang sekolah pengguna.
 * Mengikuti kontrak Backend KONFIGURASI_MENU_JENJANG (getMenusByJenjang):
 * - Jika menu tidak memiliki restriksi jenjang -> ALLOW (true).
 * - Jika jenjang belum diketahui (null/undefined/kosong) -> ALLOW (true) sesuai getMenusByJenjang Backend.
 * - Jika jenjang cocok dengan konfigurasi -> ALLOW (true).
 * - Jika jenjang tidak cocok -> DENY (false).
 */
export function isMenuAllowedForJenjang(menuName, jenjang = null) {
  if (!menuName) return true;
  const normMenu = normalizeMenuName(menuName);
  const allowed = MENU_JENJANG_RESTRICTIONS[normMenu];

  if (!allowed || !Array.isArray(allowed) || allowed.length === 0) {
    return true;
  }

  if (!jenjang || !String(jenjang).trim()) {
    return true;
  }

  const normJenjang = String(jenjang).trim().toUpperCase();
  return allowed
    .map((j) => String(j).trim().toUpperCase())
    .includes(normJenjang);
}

export const MENU_TO_ROLE_MODULES = {
  // 1. Dashboard
  "Dashboard (siswa, guru, admin utama)": [
    "dashboard",
    "manajemen_sekolah",
    "laporan",
  ],
  "dashboard": ["dashboard", "manajemen_sekolah", "laporan"],

  // 2. Modul-modul Mandiri Peran Backend (1-to-1 isolasi ketat)
  "langganan": ["langganan"],
  "paket": ["paket"],
  "manajemen pengguna": ["manajemen_pengguna"],
  "manajemen_pengguna": ["manajemen_pengguna"],
  "manajemen sekolah": ["manajemen_sekolah"],
  "manajemen_sekolah": ["manajemen_sekolah"],
  "sarpras": ["manajemen_aset"],
  "manajemen aset": ["manajemen_aset"],
  "manajemen_aset": ["manajemen_aset"],
  "laporan": ["laporan"],
  "penerimaan spmb": ["ppdb"],
  "ppdb": ["ppdb"],
  "akademik": ["akademik"],
  "jurusan": ["akademik"],
  "prakerin": ["akademik"],
  "CMS": ["cms"],
  "cms": ["cms"],
  "yayasan": ["yayasan"],

  // 3. LMS & CBT Granular Modules
  "lms": ["lms"],
  "tugas": ["tugas"],
  "ujian": ["ujian"],
  "LMS dan CBT": ["lms", "tugas", "ujian"],
  "lms dan cbt": ["lms", "tugas", "ujian"],

  // 4. Delegated Menu Baku Jabatan
  "keuangan dan kas": ["laporan"],
  "perpustakaan": ["manajemen_aset"],
  "bimbingan konseling": ["bk", "akademik"],
  "monitoring absensi": ["lms", "akademik"],
  "pengaturan absensi": ["lms", "akademik", "manajemen_pengguna"],
  "shift": ["manajemen_pengguna"],
  "absen saya": ["akademik"],
};

export function hasMenuAccess(menuName, action = "view") {
  if (!menuName) return true;

  const user = getSessionUser() || getStoredUser();
  const role = normalizeRole(getAuthRole() || user?.role);
  if (role === "super_admin") return true;

  const targetAction = String(action || "view").trim().toLowerCase();
  const normMenu = normalizeMenuName(menuName);

  // 1. Siswa tidak memiliki Jabatan dan tidak boleh mengakses menu administratif / monitoring guru
  if (role === "siswa") {
    if (
      (normMenu === "absen saya" || normMenu === "absen_saya") &&
      (targetAction === "view" || targetAction === "create")
    ) {
      return true;
    }
    return false;
  }

  // 2. Validasi Jenjang Sekolah Terpusat (Tier Restriction)
  const userJenjang = getUserJenjang();
  if (!isMenuAllowedForJenjang(normMenu, userJenjang)) {
    return false;
  }

  // 3. Cek apakah user memiliki Jabatan (Sistem RBAC Jabatan)
  const userJabatan = getUserJabatan();
  const aksesList = getUserAksesMenu();
  const hasJabatan = Boolean(
    (userJabatan && String(userJabatan).trim()) ||
      user?.jabatanId ||
      user?.jabatanRef?.id ||
      (Array.isArray(aksesList) && aksesList.length > 0)
  );

  if (hasJabatan) {
    // Untuk user yang memiliki Jabatan (admin_sekolah terbatas, guru, staf/pegawai):
    // aksesMenu dari Jabatan adalah sumber kebenaran SATU-SATUNYA
    if (!Array.isArray(aksesList) || aksesList.length === 0) {
      return false;
    }

    const matched = aksesList.find((item) => {
      const rawMenu =
        typeof item === "string"
          ? item
          : item?.menu || item?.namaMenu || item?.key || "";
      const itemNorm = normalizeMenuName(rawMenu);
      if (itemNorm === normMenu) return true;
      if (
        (normMenu === "lms" || normMenu === "tugas" || normMenu === "ujian") &&
        (itemNorm === "lms dan cbt" || itemNorm === "lms & cbt")
      ) {
        return true;
      }
      return false;
    });

    if (!matched) return false;

    if (typeof matched === "string") {
      return targetAction === "view";
    }

    const rawPerms = Array.isArray(matched.permissions)
      ? matched.permissions
      : Array.isArray(matched.actions)
      ? matched.actions
      : Array.isArray(matched.aksi)
      ? matched.aksi
      : [];
    const perms = rawPerms.map((p) => String(p).trim().toLowerCase());

    return perms.includes(targetAction);
  }

  // 4. Jika bukan admin_sekolah dan tidak memiliki Jabatan (mis. guru/pegawai reguler tanpa Jabatan):
  // Hanya memiliki akses ke "absen saya", tidak memiliki akses ke menu baku Jabatan seperti monitoring absensi / BK admin
  if (role !== "admin_sekolah" && role !== "admin") {
    if (
      (normMenu === "absen saya" || normMenu === "absen_saya") &&
      (targetAction === "view" || targetAction === "create")
    ) {
      return true;
    }
    return false;
  }

  // 5. Skenario A: Admin Sekolah Utama (tanpa Jabatan terbatas).
  // Mengikuti mekanisme akses yang diberikan Backend (izin peran / bypass requireAksesMenu untuk Admin Sekolah Utama)
  const rolePermissions = getPermissions();

  if (!Array.isArray(rolePermissions) || rolePermissions.length === 0) {
    return true;
  }

  // Dashboard khusus: jika role admin_sekolah memiliki izin view di sistem
  if (
    normMenu === "dashboard (siswa, guru, admin utama)" ||
    normMenu === "dashboard"
  ) {
    if (targetAction === "view") {
      return (
        rolePermissions.some((p) => p.endsWith(".view")) ||
        rolePermissions.includes("manajemen_sekolah.view") ||
        rolePermissions.includes("laporan.view")
      );
    }
    return true;
  }

  // Cari kandidat modul peran untuk menu baku ini
  const candidateModules =
    MENU_TO_ROLE_MODULES[menuName] ||
    MENU_TO_ROLE_MODULES[
      Object.keys(MENU_TO_ROLE_MODULES).find(
        (k) => normalizeMenuName(k) === normMenu
      )
    ] || [normMenu.replace(/\s+/g, "_"), normMenu];

  return candidateModules.some((mod) => {
    const requiredPerm = `${mod}.${targetAction}`;
    return rolePermissions.includes(requiredPerm);
  });
}

export function getRequiredActionForAdminPath(pathname = "") {
  const path = String(pathname || "").trim().toLowerCase();
  if (
    path.endsWith("/tambah") ||
    path.includes("/tambah/") ||
    path.endsWith("/create") ||
    path.includes("/create/") ||
    path.endsWith("/buat") ||
    path.includes("/buat/")
  ) {
    return "create";
  }
  if (
    path.endsWith("/edit") ||
    path.includes("/edit/") ||
    path.endsWith("/kalkulasi") ||
    path.includes("/kalkulasi/")
  ) {
    return "update";
  }
  return "view";
}

export function getMenuKeyForAdminPath(pathname = "") {
  const path = String(pathname || "").trim().toLowerCase();

  if (!path.startsWith("/admin")) return null;

  // Halaman profil mandiri selalu diizinkan
  if (path === "/admin/profile" || path.startsWith("/admin/profile/")) {
    return null;
  }

  if (path === "/admin/dashboard" || path === "/admin") {
    return "Dashboard (siswa, guru, admin utama)";
  }

  if (
    path.startsWith("/admin/presensi/master-shift") ||
    path.startsWith("/admin/presensi/penugasan-shift")
  ) {
    return "shift";
  }

  if (
    path.startsWith("/admin/presensi") ||
    path.startsWith("/admin/siswa/absen")
  ) {
    return "monitoring absensi";
  }

  if (path.startsWith("/admin/keuangan")) {
    return "keuangan dan kas";
  }

  if (
    path.startsWith("/admin/akademik/jurusan") ||
    path.startsWith("/admin/jurusan")
  ) {
    return "jurusan";
  }

  if (path.startsWith("/admin/prakerin")) {
    return "prakerin";
  }

  if (
    path.startsWith("/admin/akademik") ||
    path.startsWith("/admin/guru/mapel") ||
    path.startsWith("/admin/guru/wali-kelas") ||
    path.startsWith("/admin/guru/jadwal-mengajar") ||
    path.startsWith("/admin/eraport")
  ) {
    return "akademik";
  }

  if (
    path.startsWith("/admin/lms-cbt/tugas-siswa") ||
    path.startsWith("/admin/tugas")
  ) {
    return "tugas";
  }

  if (
    path.startsWith("/admin/lms-cbt/ujian") ||
    path.startsWith("/admin/cbt") ||
    path.startsWith("/admin/ujian")
  ) {
    return "ujian";
  }

  if (
    path.startsWith("/admin/lms-cbt/modul-class") ||
    path.startsWith("/admin/lms-cbt/materi-modul-ajar") ||
    path.startsWith("/admin/lms")
  ) {
    return "lms";
  }

  if (
    path.startsWith("/admin/lms-cbt")
  ) {
    return "LMS dan CBT";
  }

  if (path.startsWith("/admin/bk")) {
    return "bimbingan konseling";
  }

  if (path.startsWith("/admin/perpustakaan")) {
    return "perpustakaan";
  }

  if (path.startsWith("/admin/sarpras")) {
    return "sarpras";
  }

  if (path.startsWith("/admin/spmb") || path.startsWith("/admin/ppdb")) {
    return "penerimaan spmb";
  }

  if (path.startsWith("/admin/cms")) {
    return "CMS";
  }

  if (path.startsWith("/admin/langganan")) {
    return "langganan";
  }

  if (
    path.startsWith("/admin/pengguna") ||
    path.startsWith("/admin/guru") ||
    path.startsWith("/admin/staf") ||
    path.startsWith("/admin/siswa")
  ) {
    return "manajemen pengguna";
  }

  return null;
}

export function getDefaultAdminPath(user = null) {
  const currentUser = user || getSessionUser();
  const role = normalizeRole(currentUser?.role || getAuthRole());

  if (role === "super_admin") {
    return "/admin/dashboard";
  }

  if (hasMenuAccess("Dashboard (siswa, guru, admin utama)", "view")) {
    return "/admin/dashboard";
  }

  const priorityMenuRoutes = [
    { menu: "keuangan dan kas", path: "/admin/keuangan" },
    { menu: "akademik", path: "/admin/akademik" },
    { menu: "penerimaan spmb", path: "/admin/spmb" },
    { menu: "perpustakaan", path: "/admin/perpustakaan" },
    { menu: "sarpras", path: "/admin/sarpras" },
    { menu: "LMS dan CBT", path: "/admin/lms-cbt" },
    { menu: "bimbingan konseling", path: "/admin/bk" },
    { menu: "CMS", path: "/admin/cms" },
    { menu: "langganan", path: "/admin/langganan" },
    { menu: "manajemen pengguna", path: "/admin/pengguna" },
    { menu: "monitoring absensi", path: "/admin/presensi" },
    { menu: "shift", path: "/admin/presensi/master-shift" },
    { menu: "jurusan", path: "/admin/akademik/jurusan" },
    { menu: "prakerin", path: "/admin/prakerin" },
  ];

  for (const item of priorityMenuRoutes) {
    if (hasMenuAccess(item.menu, "view")) {
      return item.path;
    }
  }

  return "/admin/profile";
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
      return getDefaultAdminPath();

    case "guru":
      return "/guru";

    case "siswa":
      return "/siswa";

    default:
      return "/login";
  }
}
