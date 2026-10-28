
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

const THEME_KEYS = [
  "primary",
  "secondary",
  "accent",
  "background",
  "surface",
  "text",
  "border",
];

function getPublicApiBase() {
  if (API_URL.endsWith("/api")) {
    return `${API_URL}/publik`;
  }

  return `${API_URL}/api/publik`;
}

function isValidHex(value) {
  return (
    typeof value === "string" &&
    /^#[0-9a-fA-F]{6}$/.test(value.trim())
  );
}

function applyTheme(theme) {
  const root = document.documentElement;

  for (const key of THEME_KEYS) {
    const value = theme?.[key]?.hex;
    const color = isValidHex(value)
      ? value.trim()
      : DEFAULT_THEME[key];

    root.style.setProperty(`--school-${key}`, color);
  }
}

export default function PublicTheme({ tenant }) {
  useEffect(() => {
    if (!tenant) return;

    let cancelled = false;
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
            url,
            status: response.status,
            detail: detail.slice(0, 300),
          });

          return;
        }

        const result = await response.json();

        if (cancelled) return;

        const tema = result?.data?.tema;

        if (!result?.success || !tema) {
          console.warn(
            "Respons API tema tidak sesuai format yang diharapkan:",
            result
          );
          return;
        }

        applyTheme(tema);
      } catch (error) {
        if (!cancelled) {
          console.warn("Tidak dapat menghubungi API tema sekolah:", {
            url,
            message: error?.message,
          });
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
