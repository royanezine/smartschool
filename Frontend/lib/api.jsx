import {
  getToken,
  getRefreshToken,
  getStoredUser,
  setSession,
  clearSession,
  registerAuthApiHandlers,
  requestNewAccessToken as authRequestNewAccessToken,
  getBackendOrigin,
  getCleanApiBase,
  resolveApiOrigin,
  resolveApiBaseUrl,
} from "./auth";

export {
  getBackendOrigin,
  getCleanApiBase,
  resolveApiOrigin,
  resolveApiBaseUrl,
};

function normalizeEndpoint(endpoint) {
  if (!endpoint) return "/";
  let path = String(endpoint).trim();
  if (!path.startsWith("/")) path = `/${path}`;

  path = path.replace(/^\/api\/api(\/|$)/, "/api$1");

  if (
    !path.startsWith("/api/") &&
    path !== "/api" &&
    !/^\/(health|ready|uploads)(\/|$)/.test(path)
  ) {
    path = `/api${path}`;
  }

  return path;
}

function resolveFullUrl(endpoint) {
  const cleanBase = getBackendOrigin();
  const cleanPath = normalizeEndpoint(endpoint);

  return `${cleanBase}${cleanPath}`;
}

const AUTH_NO_REFRESH_PATHS = [
  "/api/auth/login",
  "/api/auth/refresh",
  "/api/auth/register",
  "/api/auth/verify-register",
  "/api/auth/lupa-kata-sandi",
  "/api/auth/atur-ulang-kata-sandi",
  "/api/auth/pin/setup",
  "/api/auth/pin/verify",
  "/api/auth/pin/forgot",
  "/api/auth/pin/reset",
];

function isNoRefreshEndpoint(endpoint) {
  const normalized = normalizeEndpoint(endpoint).toLowerCase();
  return AUTH_NO_REFRESH_PATHS.some(
    (path) => normalized === path || normalized.startsWith(`${path}/`)
  );
}

export async function requestNewAccessToken() {
  return authRequestNewAccessToken();
}

export async function apiFetch(endpoint, options = {}) {
  const token = getToken();

  const isFormData =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  const headers = {
    ...(options.headers || {}),
  };

  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const fullUrl = resolveFullUrl(endpoint);

  let response;
  try {
    response = await fetch(fullUrl, {
      ...options,
      headers,
    });
  } catch (netErr) {
    const err = new Error(
      "Tidak dapat terhubung ke server backend. Pastikan server berjalan."
    );
    err.status = 0;
    err.isNetworkError = true;
    throw err;
  }

  // Tangani HTTP 401 Unauthorized dengan refresh token silent terpusat
  if (response.status === 401) {
    const canAttemptRefresh =
      !options._retry &&
      !isNoRefreshEndpoint(endpoint) &&
      Boolean(getRefreshToken());

    if (canAttemptRefresh) {
      let newAccessToken = null;
      try {
        newAccessToken = await requestNewAccessToken();
      } catch (refreshErr) {
        clearSession();
      }

      if (newAccessToken) {
        const retryHeaders = {
          ...(options.headers || {}),
          Authorization: `Bearer ${newAccessToken}`,
        };
        if (!isFormData && !retryHeaders["Content-Type"]) {
          retryHeaders["Content-Type"] = "application/json";
        }

        return await apiFetch(endpoint, {
          ...options,
          _retry: true,
          headers: retryHeaders,
        });
      }
    } else {
      clearSession();
    }
  }

  const contentType =
    response.headers.get("content-type") || "";

  let data = null;

  if (contentType.includes("application/json")) {
    try {
      if (typeof response.json === "function") {
        data = await response.json();
      } else if (typeof response.text === "function") {
        const raw = await response.text();
        data = raw && raw.trim() ? JSON.parse(raw) : null;
      }
    } catch {
      data = null;
    }
  } else {
    try {
      if (typeof response.text === "function") {
        const text = await response.text();
        if (text && text.trim()) {
          try {
            data = JSON.parse(text);
          } catch {
            data = text;
          }
        } else {
          data = null;
        }
      } else if (typeof response.json === "function") {
        data = await response.json();
      }
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearSession();
    }

    let message = `Request gagal. Status: ${response.status}`;

    if (response.status === 429) {
      message = "Terlalu banyak percobaan, mohon tunggu sebentar.";
    } else if (data && typeof data === "object") {
      message =
        data.message ||
        data.error ||
        message;
    } else if (typeof data === "string" && data.trim()) {
      const rawText = data.trim();
      if (/<[a-z][\s\S]*>/i.test(rawText)) {
        const preMatch = rawText.match(/<pre>([\s\S]*?)<\/pre>/i);
        const titleMatch = rawText.match(/<title>([\s\S]*?)<\/title>/i);
        const extracted = preMatch
          ? preMatch[1].replace(/<[^>]+>/g, "").trim()
          : titleMatch
            ? titleMatch[1].replace(/<[^>]+>/g, "").trim()
            : "";
        message = extracted || `Endpoint server mengembalikan status ${response.status}.`;
      } else {
        message = rawText;
      }
    }

    message = String(message)
      .replace(/Bearer\s+[a-zA-Z0-9._-]+/gi, "Bearer [REDACTED]")
      .replace(/(?:password|token|tokenPendaftaran|otp)\s*[:=]\s*[^\s,]+/gi, "token: [REDACTED]")
      .replace(/ey[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/g, "[REDACTED]");

    const retryAfterHeader =
      typeof response.headers?.get === "function"
        ? response.headers.get("retry-after") || response.headers.get("Retry-After")
        : null;
    const parsedRetryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : null;
    const retryAfter =
      Number.isFinite(parsedRetryAfter) && parsedRetryAfter > 0
        ? parsedRetryAfter
        : null;

    const error = new Error(message);
    error.status = response.status;
    error.statusCode = response.status;
    error.retryAfter = retryAfter;
    error.data = data?.data ?? data;
    error.raw = data;
    error.errorCode = data?.errorCode || null;
    error.response = { status: response.status, data };

    throw error;
  }

  return data;
}

if (typeof registerAuthApiHandlers === "function") {
  registerAuthApiHandlers({ apiFetch });
}