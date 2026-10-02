"use client";

import { useEffect } from "react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const TOKEN_KEYS = [
  "token",
  "accessToken",
  "access_token",
  "authToken",
  "jwt",
];

function getToken() {
  if (typeof window === "undefined") return null;

  for (const key of TOKEN_KEYS) {
    const value = localStorage.getItem(key);

    if (value && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

/* ============================================================
   APPLY SCHOOL THEME
   ============================================================ */

function applyTheme(tema) {
  if (typeof document === "undefined") return;
  if (!tema) return;

  const root = document.documentElement;

  /*
   * ==========================================================
   * SCHOOL THEME
   *
   * Jangan mengubah:
   * --color-page
   * --background
   * --color-card
   * --color-input
   * --color-sidebar
   * --color-header
   * --color-text
   * --foreground
   * --color-border
   *
   * Variable-variable tersebut dikelola oleh globals.css
   * untuk Light Mode dan Dark Mode.
   * ==========================================================
   */

  if (tema.primary?.hex) {
    root.style.setProperty(
      "--school-primary",
      tema.primary.hex
    );
  }

  if (tema.secondary?.hex) {
    root.style.setProperty(
      "--school-secondary",
      tema.secondary.hex
    );
  }

  if (tema.accent?.hex) {
    root.style.setProperty(
      "--school-accent",
      tema.accent.hex
    );
  }

  if (tema.background?.hex) {
    root.style.setProperty(
      "--school-background",
      tema.background.hex
    );
  }

  if (tema.surface?.hex) {
    root.style.setProperty(
      "--school-surface",
      tema.surface.hex
    );
  }

  if (tema.text?.hex) {
    root.style.setProperty(
      "--school-text",
      tema.text.hex
    );
  }

  if (tema.border?.hex) {
    root.style.setProperty(
      "--school-border",
      tema.border.hex
    );
  }

  console.log(
    "Tema sekolah berhasil diterapkan:",
    tema
  );
}

/* ============================================================
   RESET SCHOOL THEME
   ============================================================ */

function resetTheme() {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  const variables = [
    "--school-primary",
    "--school-secondary",
    "--school-accent",
    "--school-background",
    "--school-surface",
    "--school-text",
    "--school-border",
  ];

  variables.forEach((variable) => {
    root.style.removeProperty(variable);
  });
}

/* ============================================================
   LOAD SCHOOL THEME
   ============================================================ */

async function loadSchoolTheme() {
  const token = getToken();

  if (!token) {
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/api/v1/cms/tema`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error(
        "Gagal mengambil tema sekolah:",
        response.status,
        response.statusText
      );

      return;
    }

    const result = await response.json();

    console.log("THEME RESPONSE:", result);

    const tema = result?.data?.tema;

    if (!tema) {
      console.warn(
        "Data tema tidak ditemukan dari endpoint /cms/tema"
      );

      return;
    }

    applyTheme(tema);
  } catch (error) {
    console.error(
      "Gagal memuat tema sekolah:",
      error
    );
  }
}

/* ============================================================
   SYSTEM LAYOUT
   ============================================================ */

export default function SystemLayout({ children }) {
  useEffect(() => {
    loadSchoolTheme();

    return () => {
      resetTheme();
    };
  }, []);

  return children;
}