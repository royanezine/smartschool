
"use client";

import { useEffect } from "react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const DEFAULT_THEME = {
  primary: "#2563EB",
  secondary: "#64748B",
  accent: "#F59E0B",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  text: "#0F172A",
  border: "#E2E8F0",
};

function getPublicApiBase() {
  return API_URL.endsWith("/api")
    ? `${API_URL}/publik`
    : `${API_URL}/api/publik`;
}

function normalizeHex(value, fallback) {
  const hex =
    typeof value === "string"
      ? value
      : value && typeof value === "object"
        ? value.hex
        : "";

  if (typeof hex !== "string") return fallback;

  let normalized = hex.trim().toUpperCase();

  if (/^#[0-9A-F]{3}$/.test(normalized)) {
    normalized =
      "#" +
      normalized
        .slice(1)
        .split("")
        .map((char) => char + char)
        .join("");
  }

  return /^#[0-9A-F]{6}$/.test(normalized)
    ? normalized
    : fallback;
}

function normalizeTheme(theme) {
  const normalized = {};

  for (const key of Object.keys(DEFAULT_THEME)) {
    normalized[key] = normalizeHex(
      theme?.[key],
      DEFAULT_THEME[key]
    );
  }

  return normalized;
}

function applyTheme(theme = DEFAULT_THEME) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const colors = normalizeTheme(theme);

  // Variabel utama tema sekolah
  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--school-${key}`, value);
  });

  // Alias agar kompatibel dengan komponen website lama
  root.style.setProperty(
    "--warna-primer-utama",
    colors.primary
  );

  root.style.setProperty(
    "--warna-primer-sekunder",
    colors.secondary
  );

  root.style.setProperty(
    "--warna-aksen",
    colors.accent
  );

  root.style.setProperty(
    "--warna-netral-latar",
    colors.background
  );

  root.style.setProperty(
    "--warna-netral-putih",
    colors.surface
  );

  root.style.setProperty(
    "--warna-netral-teks",
    colors.text
  );

  root.style.setProperty(
    "--warna-netral-teksLembut",
    colors.secondary
  );

  root.style.setProperty(
    "--warna-netral-garis",
    colors.border
  );

  // Supaya halaman publik tetap menggunakan tema terang
  root.style.setProperty("color-scheme", "light");
}

export default function PublicTheme({ tenant }) {
  useEffect(() => {
    let cancelled = false;

    // Reset dahulu agar warna tenant sebelumnya tidak terbawa
    applyTheme(DEFAULT_THEME);

    if (!tenant) return;

    const url = `${getPublicApiBase()}/${encodeURIComponent(
      tenant
    )}/tema`;

    async function loadTheme() {
      try {
        const response = await fetch(url, {
          method: "GET",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          const detail = await response.text().catch(() => "");

          console.warn("Tema sekolah gagal dimuat:", {
            status: response.status,
            detail: detail.slice(0, 300),
          });

          return;
        }

        const result = await response.json();

        if (cancelled) return;

        const theme =
          result?.data?.tema ??
          result?.tema ??
          result?.data?.data?.tema;

        if (!theme || typeof theme !== "object") {
          console.warn(
            "Format respons tema sekolah tidak sesuai:",
            result
          );
          return;
        }

        applyTheme(theme);
      } catch (error) {
        if (!cancelled) {
          console.warn("Gagal mengambil tema sekolah:", error);
        }
      }
    }

    loadTheme();

    return () => {
      cancelled = true;
    };
  }, [tenant]);

  return null;
}
