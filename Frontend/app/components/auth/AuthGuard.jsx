"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, RefreshCw } from "lucide-react";

import {
  getRoleHome,
  clearSession,
  subscribeAuth,
  verifySessionProfile,
  getAuthRole,
} from "@/lib/auth";


export default function AuthGuard({ allowedRoles = [], children }) {
  const router = useRouter();

  const skipGuard = process.env.NEXT_PUBLIC_SKIP_AUTH_GUARD === "true";

  const [checked, setChecked] = useState(skipGuard);
  const [tempError, setTempError] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const isRedirectingRef = useRef(false);

  const allowedKey = useMemo(
    () =>
      Array.isArray(allowedRoles)
        ? allowedRoles.filter(Boolean).join(",")
        : "",
    [allowedRoles]
  );

  const verify = useCallback(
    async (force = false) => {
      if (skipGuard || isRedirectingRef.current) {
        return;
      }

      const allowed = allowedKey
        ? allowedKey.split(",").filter(Boolean)
        : [];

      const result = await verifySessionProfile(force);

      if (result.valid) {
        const role = result.role || getAuthRole();

        if (allowed.length > 0 && role && !allowed.includes(role)) {
          const home = getRoleHome(role);

          if (!home || home === "/login") {
            setTempError(null);
            setChecked(true);
            return;
          }

          if (!isRedirectingRef.current) {
            isRedirectingRef.current = true;
            router.replace(home);
          }
          return;
        }

        setTempError(null);
        setChecked(true);
        return;
      }

      if (result.isTemporaryError) {
        setTempError({
          message: result.message,
          status: result.status,
          isNetwork: result.isNetworkError,
        });
        setChecked(false);
        return;
      }

      clearSession();

      if (!isRedirectingRef.current) {
        isRedirectingRef.current = true;
        const isExpired =
          result.reason === "TOKEN_EXPIRED" ||
          result.reason === "UNAUTHORIZED";
        router.replace(isExpired ? "/login?sessionExpired=1" : "/login");
      }
    },
    [allowedKey, router, skipGuard]
  );

  useEffect(() => {
    if (skipGuard) {
      return;
    }

    let active = true;

    const timer = setTimeout(() => {
      if (active) {
        verify(false);
      }
    }, 0);

    const unsubscribe = subscribeAuth(() => {
      if (active) {
        verify(false);
      }
    });

    return () => {
      active = false;
      clearTimeout(timer);
      unsubscribe();
    };
  }, [skipGuard, verify]);

  const handleRetry = async () => {
    setIsRetrying(true);
    await verify(true);
    setIsRetrying(false);
  };

  if (tempError) {
    return (
      <div className="theme-page flex h-screen w-full items-center justify-center p-4">
        <div className="theme-card theme-border w-full max-w-md rounded-2xl border p-6 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
            <AlertCircle size={24} />
          </div>

          <h2 className="theme-text text-base font-bold">
            Gangguan Koneksi atau Server
          </h2>

          <p className="theme-text-muted mt-2 text-xs leading-5">
            {tempError.message ||
              "Tidak dapat memverifikasi sesi karena server sedang mengalami gangguan sementara atau koneksi terputus. Sesi login Anda tetap tersimpan."}
          </p>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={handleRetry}
              disabled={isRetrying}
              className="theme-primary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-white hover:opacity-90 transition disabled:opacity-60"
            >
              <RefreshCw
                size={14}
                className={isRetrying ? "animate-spin" : ""}
              />
              {isRetrying ? "Memeriksa..." : "Coba Lagi"}
            </button>

            <button
              type="button"
              onClick={() => {
                isRedirectingRef.current = true;
                router.replace("/login");
              }}
              className="theme-card theme-border theme-text-secondary inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] transition"
            >
              Ke Halaman Login
            </button>
          </div>
        </div>
      </div>
    );
  }

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
