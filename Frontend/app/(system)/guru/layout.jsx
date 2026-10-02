"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// ======================================================
// TOKEN KEYS
// ======================================================

const TOKEN_KEYS = [
  "token",
  "accessToken",
  "access_token",
  "authToken",
  "jwt",
];

// ======================================================
// CEK AUTHENTICATION
// ======================================================

function isAuthenticated() {
  if (typeof window === "undefined") {
    return false;
  }

  return TOKEN_KEYS.some((key) => {
    const value = localStorage.getItem(key);

    return Boolean(value && value.trim());
  });
}

// ======================================================
// GURU LAYOUT
// ======================================================

export default function GuruLayout({ children }) {
  const router = useRouter();

  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const skipGuard =
      process.env.NEXT_PUBLIC_SKIP_AUTH_GUARD === "true";

    // ====================================================
    // AUTH GUARD
    // ====================================================

    if (!skipGuard && !isAuthenticated()) {
      router.replace("/login");
      return;
    }

    setChecked(true);
  }, [router]);

  // ======================================================
  // LOADING
  // ======================================================

  if (!checked) {
    return (
      <div className="theme-page flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">

          {/* LOADING SPINNER */}

          <div
            className="
              h-8
              w-8
              animate-spin
              rounded-full
              border-2
              border-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]
              border-t-[var(--color-primary)]
            "
          />

          {/* LOADING TEXT */}

          <p className="text-sm theme-text-secondary">
            Memeriksa sesi login...
          </p>

        </div>
      </div>
    );
  }

  // ======================================================
  // RENDER GURU PAGE
  // ======================================================

  return children;
}