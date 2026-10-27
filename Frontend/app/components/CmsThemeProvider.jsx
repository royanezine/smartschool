
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { clearSession, getToken } from "@/lib/auth";

const CmsThemeContext = createContext(null);

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const THEME_API_URL = API_BASE_URL.endsWith("/api")
  ? `${API_BASE_URL}/cms/tema`
  : `${API_BASE_URL}/api/cms/tema`;

const THEME_CACHE_KEY = "smartschool-cms-theme";

const DEFAULT_TEMA = {
  tema: {
    primary: "#2563EB",
    secondary: "#64748B",
    accent: "#F59E0B",
    background: "#F8FAFC",
    surface: "#FFFFFF",
    text: "#0F172A",
    border: "#E2E8F0",
  },
  badgeStatus: {
    aktif: "#16A34A",
    nonaktif: "#6B7280",
    menunggu: "#F59E0B",
    disetujui: "#16A34A",
    ditolak: "#DC2626",
    hadir: "#16A34A",
    izin: "#2563EB",
    sakit: "#F59E0B",
    alpa: "#DC2626",
    terlambat: "#EA580C",
  },
  labelRole: {
    super_admin: "#7C3AED",
    admin_yayasan: "#4F46E5",
    admin_sekolah: "#2563EB",
    guru: "#0D9488",
    siswa: "#0EA5E9",
  },
  shiftKerja: {
    pagi: "#F59E0B",
    siang: "#6366F1",
  },
};

const CORE_MAP = {
  primary: ["--cms-primary", "--school-primary"],
  secondary: ["--cms-secondary", "--school-secondary"],
  accent: ["--cms-accent", "--school-accent"],
  background: ["--cms-background", "--school-background"],
  surface: ["--cms-surface", "--school-surface"],
  text: ["--cms-text", "--school-text"],
  border: ["--cms-border", "--school-border"],
};

const STATUS_KEYS = Object.keys(DEFAULT_TEMA.badgeStatus);
const ROLE_KEYS = Object.keys(DEFAULT_TEMA.labelRole);
const SHIFT_KEYS = Object.keys(DEFAULT_TEMA.shiftKerja);

function getHex(value, fallback = "#000000") {
  const raw = typeof value === "string" ? value : value?.hex;

  if (typeof raw !== "string") return fallback;

  const hex = raw.trim();

  if (/^#[0-9a-fA-F]{3}$/.test(hex)) {
    return (
      "#" +
      hex
        .slice(1)
        .split("")
        .map((char) => char + char)
        .join("")
    ).toUpperCase();
  }

  if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
    return hex.toUpperCase();
  }

  return fallback;
}

function normalizeTheme(input) {
  const source = input?.data?.tema
    ? input.data
    : input?.tema
      ? input
      : input?.data
        ? input.data
        : input;

  const result = {};

  for (const group of Object.keys(DEFAULT_TEMA)) {
    result[group] = {};

    for (const key of Object.keys(DEFAULT_TEMA[group])) {
      result[group][key] = getHex(
        source?.[group]?.[key],
        DEFAULT_TEMA[group][key]
      );
    }
  }

  return result;
}

function isDefaultTheme(tema) {
  return Object.keys(DEFAULT_TEMA).every((group) =>
    Object.keys(DEFAULT_TEMA[group]).every(
      (key) =>
        tema?.[group]?.[key] === DEFAULT_TEMA[group][key]
    )
  );
}

function clearCmsVariables(root) {
  Object.values(CORE_MAP)
    .flat()
    .forEach((variable) => {
      root.style.removeProperty(variable);
    });

  root.style.removeProperty("--school-primary-rgb");

  STATUS_KEYS.forEach((key) => {
    root.style.removeProperty(`--school-status-${key}`);
  });

  ROLE_KEYS.forEach((key) => {
    root.style.removeProperty(`--school-role-${key}`);
  });

  SHIFT_KEYS.forEach((key) => {
    root.style.removeProperty(`--school-shift-${key}`);
  });
}

function applyCmsTheme(input) {
  const tema = normalizeTheme(input);

  if (typeof document === "undefined") {
    return tema;
  }

  const root = document.documentElement;

  if (isDefaultTheme(tema)) {
    clearCmsVariables(root);
    return tema;
  }

  for (const [key, variables] of Object.entries(CORE_MAP)) {
    const value = tema.tema[key];
    const defaultValue = DEFAULT_TEMA.tema[key];

    variables.forEach((variable) => {
      if (value === defaultValue) {
        root.style.removeProperty(variable);
      } else {
        root.style.setProperty(variable, value);
      }
    });
  }

  const primary = tema.tema.primary;

  if (primary !== DEFAULT_TEMA.tema.primary) {
    const hex = primary.slice(1);

    root.style.setProperty(
      "--school-primary-rgb",
      `${parseInt(hex.slice(0, 2), 16)}, ${parseInt(
        hex.slice(2, 4),
        16
      )}, ${parseInt(hex.slice(4, 6), 16)}`
    );
  } else {
    root.style.removeProperty("--school-primary-rgb");
  }

  Object.entries(tema.badgeStatus).forEach(([key, value]) => {
    const variable = `--school-status-${key}`;

    if (value === DEFAULT_TEMA.badgeStatus[key]) {
      root.style.removeProperty(variable);
    } else {
      root.style.setProperty(variable, value);
    }
  });

  Object.entries(tema.labelRole).forEach(([key, value]) => {
    const variable = `--school-role-${key}`;

    if (value === DEFAULT_TEMA.labelRole[key]) {
      root.style.removeProperty(variable);
    } else {
      root.style.setProperty(variable, value);
    }
  });

  Object.entries(tema.shiftKerja).forEach(([key, value]) => {
    const variable = `--school-shift-${key}`;

    if (value === DEFAULT_TEMA.shiftKerja[key]) {
      root.style.removeProperty(variable);
    } else {
      root.style.setProperty(variable, value);
    }
  });

  return tema;
}

function saveThemeCache(tema) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      THEME_CACHE_KEY,
      JSON.stringify(tema)
    );
  } catch (error) {
    console.warn("Gagal menyimpan cache tema CMS:", error);
  }
}

function readThemeCache() {
  if (typeof window === "undefined") return null;

  try {
    const cached = window.localStorage.getItem(THEME_CACHE_KEY);

    if (!cached) return null;

    return normalizeTheme(JSON.parse(cached));
  } catch (error) {
    console.warn("Gagal membaca cache tema CMS:", error);
    return null;
  }
}

export function CmsThemeProvider({ children }) {
  const [tema, setTema] = useState(DEFAULT_TEMA);
  const [loadingTema, setLoadingTema] = useState(true);
  const [errorTema, setErrorTema] = useState("");

  const updateTema = useCallback((newTema) => {
    const normalized = normalizeTheme(newTema);

    setTema(normalized);
    applyCmsTheme(normalized);
    saveThemeCache(normalized);
  }, []);

const refreshTema = useCallback(async () => {
  const token = getToken();

  if (!token) {
    setLoadingTema(false);
    return;
  }

  try {
    setErrorTema("");

    const response = await fetch(THEME_API_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });


    if (response.status === 401 || response.status === 403) {
      const result = await response.json().catch(() => null);

      clearSession();

      try {
        window.localStorage.removeItem(THEME_CACHE_KEY);
      } catch (e) {
      }

      setErrorTema(
        result?.message || "Sesi login telah berakhir. Silakan login ulang."
      );

      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login"
      ) {
        window.location.href = "/login";
      }

      return;
    }


    const result = await response.json().catch(() => null);

    if (!response.ok || result?.success === false) {
      console.warn(
        "[CMS THEME] Gagal ambil tema:",
        result?.message || response.statusText
      );

      setErrorTema(
        result?.message || "Gagal mengambil tema dari server."
      );

      return;
    }


    const normalized = normalizeTheme(result);

    setTema(normalized);
    applyCmsTheme(normalized);
    saveThemeCache(normalized);
  } catch (error) {
    console.warn("[CMS THEME] Network error:", error?.message);

    setErrorTema(
      error?.message || "Gagal memuat tema CMS."
    );
  } finally {
    setLoadingTema(false);
  }
}, []);

  useEffect(() => {
    const cachedTheme = readThemeCache();

    if (cachedTheme) {
      setTema(cachedTheme);
      applyCmsTheme(cachedTheme);
    } else {
      applyCmsTheme(DEFAULT_TEMA);
    }

    refreshTema();

    const handleUserUpdated = () => {
      refreshTema();
    };

    const handleStorage = (event) => {
      if (
        event.key === THEME_CACHE_KEY &&
        event.newValue
      ) {
        try {
          const updatedTheme = normalizeTheme(
            JSON.parse(event.newValue)
          );

          setTema(updatedTheme);
          applyCmsTheme(updatedTheme);
        } catch (error) {
          console.warn(
            "Gagal memperbarui tema dari tab lain:",
            error
          );
        }
      }
    };

    window.addEventListener("user-updated", handleUserUpdated);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(
        "user-updated",
        handleUserUpdated
      );
      window.removeEventListener("storage", handleStorage);
    };
  }, [refreshTema]);

  return (
    <CmsThemeContext.Provider
      value={{
        tema,
        updateTema,
        refreshTema,
        loadingTema,
        errorTema,
      }}
    >
      {children}
    </CmsThemeContext.Provider>
  );
}

export function useCmsTheme() {
  const context = useContext(CmsThemeContext);

  if (!context) {
    throw new Error(
      "useCmsTheme harus digunakan di dalam CmsThemeProvider."
    );
  }

  return context;
}
