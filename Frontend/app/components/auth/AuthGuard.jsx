"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { getSession, getRoleHome, clearSession } from "@/lib/auth";

/*
 * ============================================================
 * AUTH GUARD
 * ============================================================
 *
 * Penjaga sesi + role untuk area terproteksi.
 *
 * - Wajib ada token dan user sesi yang valid.
 * - Role diambil dari token (sumber kebenaran), bukan dari URL.
 * - Bila role sesi tidak diizinkan untuk area ini, pengguna
 *   dikembalikan ke beranda role-nya sendiri.
 * - Sinkron antar-tab: perubahan token/user pada tab lain
 *   otomatis memicu pemeriksaan ulang.
 *
 * Set `NEXT_PUBLIC_SKIP_AUTH_GUARD=true` untuk melewati guard.
 */

export default function AuthGuard({ allowedRoles = [], children }) {
  const router = useRouter();

  // Dibaca sekali (env variable di-inline saat build).
  const skipGuard =
    process.env.NEXT_PUBLIC_SKIP_AUTH_GUARD === "true";

  const [checked, setChecked] = useState(skipGuard);

  const allowedKey = useMemo(
    () =>
      Array.isArray(allowedRoles)
        ? allowedRoles.filter(Boolean).join(",")
        : "",
    [allowedRoles]
  );

  useEffect(() => {
    if (skipGuard) {
      return;
    }

    const allowed = allowedKey
      ? allowedKey.split(",").filter(Boolean)
      : [];

    let cancelled = false;

    const verify = () => {
      const session = getSession();

      // 1. Tidak ada sesi -> kembali ke login.
      if (!session || !session.token) {
        router.replace("/login");
        return;
      }

      // 2. Token tanpa role yang dikenali -> jangan menebak role.
      if (!session.role) {
        clearSession();
        router.replace("/login");
        return;
      }

      // 3. Role sesi bukan untuk area ini.
      if (
        allowed.length > 0 &&
        !allowed.includes(session.role)
      ) {
        const home = getRoleHome(session.role);

        // Role di luar peta yang dikenali (mis. role kustom yang dibuat
        // lewat manajemen akses): jangan menebak dan jangan mengunci
        // pengguna. Backend tetap menegakkan izin per-endpoint.
        if (!home || home === "/login") {
          if (!cancelled) {
            setChecked(true);
          }

          return;
        }

        // Sesi milik role lain -> kembalikan ke beranda role tersebut.
        router.replace(home);
        return;
      }

      if (!cancelled) {
        setChecked(true);
      }
    };

    verify();

    // Sesi disimpan di localStorage (dibagi antar tab). Kita mendengarkan
    // event sesi pada tab ini (`user-updated`); guard tetap memeriksa ulang
    // sesi saat navigasi/rerender sehingga tidak ada modul yang kehilangan
    // sesi.
    window.addEventListener("user-updated", verify);

    return () => {
      cancelled = true;
      window.removeEventListener("user-updated", verify);
    };
  }, [router, allowedKey, skipGuard]);

  if (!checked) {
    return (
      <div className="theme-page flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
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

          <p className="text-sm theme-text-secondary">
            Memeriksa sesi login...
          </p>
        </div>
      </div>
    );
  }

  return children;
}
