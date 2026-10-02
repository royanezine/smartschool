"use client";

import { useEffect } from "react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

export default function PublicTheme({ tenant }) {
  useEffect(() => {
    async function loadTheme() {
      if (!tenant) return;

      try {
        const apiBase = API_URL.endsWith("/api")
          ? `${API_URL}/v1/publik`
          : `${API_URL}/api/publik`;

        const response = await fetch(
          `${apiBase}/${encodeURIComponent(tenant)}/tema`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Gagal mengambil tema sekolah.");
        }

        const result = await response.json();

        const tema = result?.data;

        if (!tema) return;

        const root = document.documentElement;

        /*
         * WARNA UTAMA
         */
        if (tema?.tema?.primary?.hex) {
          root.style.setProperty(
            "--school-primary",
            tema.tema.primary.hex
          );
        }

        if (tema?.tema?.secondary?.hex) {
          root.style.setProperty(
            "--school-secondary",
            tema.tema.secondary.hex
          );
        }

        if (tema?.tema?.accent?.hex) {
          root.style.setProperty(
            "--school-accent",
            tema.tema.accent.hex
          );
        }

        if (tema?.tema?.background?.hex) {
          root.style.setProperty(
            "--school-background",
            tema.tema.background.hex
          );
        }

        if (tema?.tema?.surface?.hex) {
          root.style.setProperty(
            "--school-surface",
            tema.tema.surface.hex
          );
        }

        if (tema?.tema?.text?.hex) {
          root.style.setProperty(
            "--school-text",
            tema.tema.text.hex
          );
        }

        if (tema?.tema?.border?.hex) {
          root.style.setProperty(
            "--school-border",
            tema.tema.border.hex
          );
        }
      } catch (error) {
        console.error(
          "Gagal memuat tema sekolah:",
          error
        );
      }
    }

    loadTheme();
  }, [tenant]);

  return null;
}