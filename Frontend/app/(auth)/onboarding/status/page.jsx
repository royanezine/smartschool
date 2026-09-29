"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCw,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

import { getTenantStatus } from "../../../services/tenant.service";

export default function WaitingActivationPage() {
  // ==========================================
  // STATE
  // ==========================================

  const [status, setStatus] = useState("waiting");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastChecked, setLastChecked] = useState(null);

  // ==========================================
  // REF
  // ==========================================

  const intervalRef = useRef(null);
  const isMountedRef = useRef(true);

  // ==========================================
  // CHECK STATUS KE BACKEND
  // ==========================================

  const checkStatus = async () => {
    if (!isMountedRef.current) {
      return;
    }

    try {
      setError("");
      setLoading(true);

      console.log("Mengecek status tenant/payment...");

      const response = await getTenantStatus();

      if (!isMountedRef.current) {
        return;
      }

      console.log(
        "Response status tenant:",
        response
      );

      setLastChecked(new Date());

      /*
       * ==========================================
       * SESUAIKAN DENGAN RESPONSE BE
       * ==========================================
       *
       * Contoh response:
       *
       * {
       *   success: true,
       *   data: {
       *     status: "active"
       *   }
       * }
       *
       * atau:
       *
       * {
       *   status: "active"
       * }
       */

      const tenantStatus =
        response?.data?.status ||
        response?.status;

      // ==========================================
      // ACTIVE
      // ==========================================

      if (
        tenantStatus === "active" ||
        tenantStatus === "ACTIVE" ||
        tenantStatus === "paid" ||
        tenantStatus === "PAID"
      ) {
        setStatus("active");

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        setLoading(false);

        return;
      }

      // ==========================================
      // WAITING
      // ==========================================

      if (
        tenantStatus === "waiting" ||
        tenantStatus === "pending" ||
        tenantStatus === "WAITING" ||
        tenantStatus === "PENDING"
      ) {
        setStatus("waiting");
        setLoading(false);

        return;
      }

      // ==========================================
      // FAILED / REJECTED
      // ==========================================

      if (
        tenantStatus === "failed" ||
        tenantStatus === "rejected" ||
        tenantStatus === "FAILED" ||
        tenantStatus === "REJECTED"
      ) {
        setStatus("failed");
        setLoading(false);

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        return;
      }

      // ==========================================
      // STATUS TIDAK DIKENALI
      // ==========================================

      setStatus("waiting");
      setLoading(false);
    } catch (error) {
      console.error(
        "Gagal mengecek status:",
        error
      );

      if (!isMountedRef.current) {
        return;
      }

      setError(
        error instanceof Error
          ? error.message
          : "Gagal mengecek status pembayaran."
      );

      setLoading(false);
    }
  };

  // ==========================================
  // POLLING
  // ==========================================

  useEffect(() => {
    isMountedRef.current = true;

    // Cek pertama kali
    checkStatus();

    // Cek setiap 5 detik
    intervalRef.current = setInterval(() => {
      checkStatus();
    }, 5000);

    return () => {
      isMountedRef.current = false;

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // ==========================================
  // MANUAL CHECK
  // ==========================================

  const handleManualCheck = () => {
    checkStatus();
  };

  // ==========================================
  // FORMAT TIME
  // ==========================================

  const formatTime = (date) => {
    if (!date) {
      return "-";
    }

    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // ==========================================
  // FAILED STATE
  // ==========================================

  if (status === "failed") {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-lg">

          {/* LOGO */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="relative w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center overflow-hidden">
              <Image
                src="/logo/logoSS.png"
                alt="SmartSchool Logo"
                width={44}
                height={44}
                className="object-contain"
              />
            </div>

            <span className="text-xl font-bold text-slate-900">
              SMART{" "}
              <span className="text-blue-600">
                SCHOOL
              </span>
            </span>
          </div>

          {/* CARD */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">

            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle
                  size={42}
                  className="text-red-500"
                />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-slate-900">
              Pembayaran Gagal
            </h1>

            <p className="text-sm text-slate-500 mt-3 leading-6">
              Pembayaran belum berhasil diproses.
              Silakan periksa kembali proses
              pembayaran kamu.
            </p>

            {error && (
              <div className="mt-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                <p className="text-xs text-red-600">
                  {error}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                window.location.href =
                  "/onboarding/payment";
              }}
              className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 transition"
            >
              Kembali ke Pembayaran
              <ArrowRight size={17} />
            </button>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            SmartSchool • Sistem Informasi Sekolah
          </p>
        </div>
      </main>
    );
  }

  // ==========================================
  // ACTIVE STATE
  // ==========================================

  if (status === "active") {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-lg">

          {/* LOGO */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="relative w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center overflow-hidden">
              <Image
                src="/logo/logoSS.png"
                alt="SmartSchool Logo"
                width={44}
                height={44}
                className="object-contain"
              />
            </div>

            <span className="text-xl font-bold text-slate-900">
              SMART{" "}
              <span className="text-blue-600">
                SCHOOL
              </span>
            </span>
          </div>

          {/* CARD */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">

            {/* ICON */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle2
                  size={42}
                  className="text-green-500"
                />
              </div>
            </div>

            {/* TITLE */}
            <h1 className="text-2xl font-bold text-slate-900">
              Pembayaran Berhasil
            </h1>

            <p className="text-sm text-slate-500 mt-3 leading-6">
              Pembayaran sekolah kamu telah berhasil
              diverifikasi. Akun sekolah sekarang
              sudah aktif.
            </p>

            {/* STATUS */}
            <div className="mt-6 rounded-xl bg-green-50 border border-green-100 px-4 py-4">
              <div className="flex items-center justify-center gap-2 text-green-700">
                <ShieldCheck size={18} />

                <span className="text-sm font-semibold">
                  Langganan Aktif
                </span>
              </div>

              <p className="text-xs text-green-600 mt-1">
                Sistem siap digunakan.
              </p>
            </div>

            {/* BUTTON */}
            <button
              type="button"
              onClick={() => {
                window.location.href =
                  "/admin/dashboard";
              }}
              className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 transition"
            >
              Masuk ke Dashboard

              <ArrowRight size={17} />
            </button>
          </div>

          {/* FOOTER */}
          <p className="text-center text-xs text-slate-400 mt-6">
            SmartSchool • Sistem Informasi Sekolah
          </p>
        </div>
      </main>
    );
  }

  // ==========================================
  // WAITING STATE
  // ==========================================

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-lg">

        {/* LOGO */}

        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="relative w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center overflow-hidden">
            <Image
              src="/logo/logoSS.png"
              alt="SmartSchool Logo"
              width={44}
              height={44}
              className="object-contain"
            />
          </div>

          <span className="text-xl font-bold text-slate-900">
            SMART{" "}
            <span className="text-blue-600">
              SCHOOL
            </span>
          </span>
        </div>

        {/* MAIN CARD */}

        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">

          {/* ICON */}

          <div className="flex justify-center mb-6">
            <div className="relative w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
              <Clock3
                size={40}
                className="text-blue-600"
              />

              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center">
                <Loader2
                  size={17}
                  className="text-blue-600 animate-spin"
                />
              </div>
            </div>
          </div>

          {/* TITLE */}

          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">
              Menunggu Aktivasi
            </h1>

            <p className="text-sm text-slate-500 mt-3 leading-6">
              Pembayaran kamu sedang diproses.
              <br />
              Kami akan mengecek status pembayaran
              secara otomatis.
            </p>
          </div>

          {/* STATUS BOX */}

          <div className="mt-7 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
            <div className="flex items-center gap-3">

              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm">
                <RefreshCw
                  size={18}
                  className="text-blue-600 animate-spin"
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Memeriksa pembayaran
                </p>

                <p className="text-xs text-slate-500 mt-0.5">
                  Pemeriksaan otomatis setiap 5 detik
                </p>
              </div>

            </div>
          </div>

          {/* ERROR */}

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-xs text-red-600 text-center">
                {error}
              </p>
            </div>
          )}

          {/* LAST CHECK */}

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              Terakhir diperiksa
            </p>

            <p className="text-xs font-medium text-slate-600 mt-1">
              {formatTime(lastChecked)}
            </p>
          </div>

          {/* MANUAL CHECK */}

          <button
            type="button"
            onClick={handleManualCheck}
            disabled={loading}
            className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 text-sm font-semibold py-3 transition"
          >
            <RefreshCw
              size={16}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            {loading
              ? "Mengecek..."
              : "Cek Status Sekarang"}
          </button>
        </div>

        {/* INFORMATION */}

        <div className="mt-5 rounded-xl bg-white border border-slate-100 px-5 py-4 shadow-sm">
          <div className="flex gap-3">

            <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
              <ShieldCheck
                size={16}
                className="text-slate-500"
              />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-700">
                Jangan tutup halaman
              </p>

              <p className="text-xs text-slate-400 mt-1 leading-5">
                Kamu dapat tetap berada di halaman
                ini. Sistem akan memperbarui status
                pembayaran secara otomatis.
              </p>
            </div>

          </div>
        </div>

        {/* FOOTER */}

        <p className="text-center text-xs text-slate-400 mt-6">
          SmartSchool • Sistem Informasi Sekolah
        </p>

      </div>
    </main>
  );
}