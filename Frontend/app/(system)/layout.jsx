"use client";

import { useEffect } from "react";

import { getToken } from "@/lib/auth";
import ThemeProvider from "@/app/components/ThemeProvider";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");


function applyTheme(tema) {
  if (typeof document === "undefined") return;
  if (!tema) return;

  const root = document.documentElement;


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


async function loadSchoolTheme() {
  const token = getToken();

  if (!token) {
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/api/cms/tema`,
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


export default function SystemLayout({ children }) {
  useEffect(() => {
    loadSchoolTheme();

    return () => {
      resetTheme();
    };
  }, []);

  return <ThemeProvider>{children}</ThemeProvider>;
}