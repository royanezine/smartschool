
"use client";

import { useEffect } from "react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

function getPublicApiBase() {
  if (API_URL.endsWith("/api")) {
    return `${API_URL}/v1/publik`;
  }

  return `${API_URL}/api/v1/publik`;
}

export default function PublicTheme({ tenant }) {
  useEffect(() => {
    if (!tenant) return;

    let cancelled = false;

    async function loadTheme() {
      const url = `${getPublicApiBase()}/${encodeURIComponent(tenant)}/tema`;

      try {
        const response = await fetch(url, {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          const detail = await response.text().catch(() => "");
          console.warn("Tema sekolah tidak berhasil dimuat:", {
            url,
            status: response.status,
            detail: detail.slice(0, 300),
          });
          return;
        }

        const result = await response.json();
        if (cancelled) return;

        const tema = result?.data?.tema;
        if (!tema) {
          console.warn("Respons tema tidak memiliki data.tema:", result);
          return;
        }

        const root = document.documentElement;
        const keys = [
          "primary",
          "secondary",
          "accent",
          "background",
          "surface",
          "text",
          "border",
        ];

        for (const key of keys) {
          const hex = tema?.[key]?.hex;

          if (typeof hex === "string" && /^#[0-9a-fA-F]{6}$/.test(hex)) {
            root.style.setProperty(`--school-${key}`, hex);
          }
        }
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