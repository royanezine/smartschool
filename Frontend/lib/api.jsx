import { getToken, clearSession } from "./auth";

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
  const base = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
  ).replace(/\/+$/, "");

  const cleanBase = base.endsWith("/api") ? base.slice(0, -4) : base;
  const cleanPath = normalizeEndpoint(endpoint);

  return `${cleanBase}${cleanPath}`;
}

export async function apiFetch(endpoint, options = {}) {
  const token = getToken();

  const isFormData =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  const headers = {
    ...(options.headers || {}),
  };

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
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

  const contentType =
    response.headers.get("content-type") || "";

  let data = null;

  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      const text = await response.text();
      data = text || null;
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearSession();
    }

    let message = `Request gagal. Status: ${response.status}`;

    if (data && typeof data === "object") {
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

    const error = new Error(message);
    error.status = response.status;
    error.data = data?.data ?? data;
    error.raw = data;

    throw error;
  }

  return data;
}