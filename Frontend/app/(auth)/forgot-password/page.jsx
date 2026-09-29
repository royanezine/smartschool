"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

/* =========================================================
   GET API URL
========================================================= */

function getApiUrl() {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!envUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_URL belum dikonfigurasi."
    );
  }

  return envUrl.trim().replace(/\/+$/, "");
}

/* =========================================================
   GET API BASE URL
   Support:
   http://localhost:5000
   http://localhost:5000/api
========================================================= */

function getApiBaseUrl() {
  const apiUrl = getApiUrl();

  if (apiUrl.endsWith("/api")) {
    return apiUrl;
  }

  return `${apiUrl}/api`;
}

/* =========================================================
   PARSE RESPONSE
========================================================= */

async function parseResponse(response) {
  const contentType =
    response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  const text = await response.text();

  console.error("Response bukan JSON:", text);

  return null;
}

/* =========================================================
   PAGE
========================================================= */

export default function ForgotPasswordPage() {
  const router = useRouter();

  /* =======================================================
     STEP
  ======================================================= */

  const [step, setStep] = useState(1);

  /* =======================================================
     FORM
  ======================================================= */

  const [email, setEmail] = useState("");
  const [kodeOtp, setKodeOtp] = useState("");
  const [kataSandi, setKataSandi] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  /* =======================================================
     PASSWORD VISIBILITY
  ======================================================= */

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* =======================================================
     UI
  ======================================================= */

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =======================================================
     LOAD EMAIL DARI SESSION
  ======================================================= */

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedEmail = sessionStorage.getItem(
      "forgot_password_email"
    );

    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  /* =======================================================
     VALIDATE EMAIL
  ======================================================= */

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  /* =======================================================
     SEND OTP
  ======================================================= */

  async function handleSendOtp(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Email wajib diisi.");
      return;
    }

    if (!validateEmail(normalizedEmail)) {
      setError("Format email tidak valid.");
      return;
    }

    try {
      setLoading(true);

      const baseUrl = getApiBaseUrl();

      const endpoint =
        `${baseUrl}/auth/lupa-kata-sandi`;

      /* ===================================================
         DEBUG FRONTEND
      =================================================== */

      console.log("====================================");
      console.log("FORGOT PASSWORD");
      console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
      console.log("BASE URL:", baseUrl);
      console.log("REQUEST URL:", endpoint);
      console.log("EMAIL:", normalizedEmail);
      console.log("====================================");

      const response = await fetch(endpoint, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        body: JSON.stringify({
          email: normalizedEmail,
        }),
      });

      const data = await parseResponse(response);

      console.log(
        "STATUS:",
        response.status
      );

      console.log(
        "RESPONSE:",
        data
      );

      /* ===================================================
         ERROR HTTP
      =================================================== */

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Gagal mengirim OTP. Status ${response.status}`
        );
      }

      /* ===================================================
         ERROR DARI BACKEND
      =================================================== */

      if (data?.success === false) {
        throw new Error(
          data?.message ||
            "Gagal mengirim kode OTP."
        );
      }

      /* ===================================================
         SIMPAN EMAIL
      =================================================== */

      sessionStorage.setItem(
        "forgot_password_email",
        normalizedEmail
      );

      setEmail(normalizedEmail);

      setKodeOtp("");
      setKataSandi("");
      setConfirmPassword("");

      /* ===================================================
         BERHASIL
      =================================================== */

      setSuccess(
        data?.message ||
          "Kode OTP berhasil dikirim. Silakan cek email kamu."
      );

      setStep(2);
    } catch (err) {
      console.error(
        "SEND OTP ERROR:",
        err
      );

      setError(
        err?.message ||
          "Terjadi kesalahan saat mengirim kode OTP."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     RESEND OTP
  ======================================================= */

  async function handleResendOtp() {
    setError("");
    setSuccess("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Email tidak ditemukan.");
      return;
    }

    if (!validateEmail(normalizedEmail)) {
      setError("Format email tidak valid.");
      return;
    }

    try {
      setResending(true);

      const baseUrl = getApiBaseUrl();

      const endpoint =
        `${baseUrl}/auth/lupa-kata-sandi`;

      console.log("====================================");
      console.log("RESEND OTP");
      console.log("REQUEST URL:", endpoint);
      console.log("EMAIL:", normalizedEmail);
      console.log("====================================");

      const response = await fetch(endpoint, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        body: JSON.stringify({
          email: normalizedEmail,
        }),
      });

      const data = await parseResponse(response);

      console.log(
        "RESEND STATUS:",
        response.status
      );

      console.log(
        "RESEND RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Gagal mengirim ulang OTP. Status ${response.status}`
        );
      }

      if (data?.success === false) {
        throw new Error(
          data?.message ||
            "Gagal mengirim ulang OTP."
        );
      }

      setKodeOtp("");

      setSuccess(
        data?.message ||
          "Kode OTP baru berhasil dikirim."
      );
    } catch (err) {
      console.error(
        "RESEND OTP ERROR:",
        err
      );

      setError(
        err?.message ||
          "Gagal mengirim ulang OTP."
      );
    } finally {
      setResending(false);
    }
  }

  /* =======================================================
     RESET PASSWORD
  ======================================================= */

  async function handleResetPassword(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    const normalizedEmail = email.trim().toLowerCase();

    /* ===================================================
       EMAIL
    =================================================== */

    if (!normalizedEmail) {
      setError("Email tidak ditemukan.");
      return;
    }

    /* ===================================================
       OTP
    =================================================== */

    const normalizedOtp = kodeOtp.trim();

    if (!normalizedOtp) {
      setError("Kode OTP wajib diisi.");
      return;
    }

    if (!/^\d{6}$/.test(normalizedOtp)) {
      setError(
        "Kode OTP harus terdiri dari 6 digit."
      );
      return;
    }

    /* ===================================================
       PASSWORD
    =================================================== */

    if (!kataSandi) {
      setError(
        "Password baru wajib diisi."
      );
      return;
    }

    if (kataSandi.length < 8) {
      setError(
        "Password minimal 8 karakter."
      );
      return;
    }

    if (!/[A-Z]/.test(kataSandi)) {
      setError(
        "Password harus mengandung minimal 1 huruf kapital."
      );
      return;
    }

    if (!/[0-9]/.test(kataSandi)) {
      setError(
        "Password harus mengandung minimal 1 angka."
      );
      return;
    }

    if (kataSandi !== confirmPassword) {
      setError(
        "Konfirmasi password tidak sama."
      );
      return;
    }

    try {
      setLoading(true);

      const baseUrl = getApiBaseUrl();

      const endpoint =
        `${baseUrl}/auth/atur-ulang-kata-sandi`;

      /* ===================================================
         DEBUG
      =================================================== */

      console.log("====================================");
      console.log("RESET PASSWORD");
      console.log("REQUEST URL:", endpoint);
      console.log("EMAIL:", normalizedEmail);
      console.log("OTP LENGTH:", normalizedOtp.length);
      console.log("====================================");

      const response = await fetch(endpoint, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },

        body: JSON.stringify({
          email: normalizedEmail,
          kodeOtp: normalizedOtp,
          kataSandi,
        }),
      });

      const data = await parseResponse(response);

      console.log(
        "RESET STATUS:",
        response.status
      );

      console.log(
        "RESET RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Gagal mengatur ulang password. Status ${response.status}`
        );
      }

      if (data?.success === false) {
        throw new Error(
          data?.message ||
            "Password gagal diubah."
        );
      }

      /* ===================================================
         SUCCESS
      =================================================== */

      sessionStorage.removeItem(
        "forgot_password_email"
      );

      setSuccess(
        data?.message ||
          "Password berhasil diubah. Mengarahkan ke halaman login..."
      );

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err) {
      console.error(
        "RESET PASSWORD ERROR:",
        err
      );

      setError(
        err?.message ||
          "Terjadi kesalahan saat mengatur ulang password."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     BACK TO EMAIL
  ======================================================= */

  function handleBackToEmail() {
    setStep(1);

    setKodeOtp("");
    setKataSandi("");
    setConfirmPassword("");

    setError("");
    setSuccess("");
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
      {/* ===================================================
          BACKGROUND
      =================================================== */}

      <div className="absolute inset-0">
        <Image
          src="/images/auth-bg.jpg"
          alt=""
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 bg-slate-950/70" />

        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/80 via-slate-950/60 to-indigo-950/80" />
      </div>

      {/* ===================================================
          TOP ACCENT
      =================================================== */}

      <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500" />

      {/* ===================================================
          CONTENT
      =================================================== */}

      <div className="relative z-10 w-full max-w-md px-4 py-8 sm:px-6 sm:py-10">
        {/* =================================================
            LOGO
        ================================================= */}

        <div className="mb-6 flex justify-center">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white shadow-xl">
            <Image
              src="/logo/logoSS.png"
              alt="Smart School Logo"
              width={36}
              height={36}
              className="object-contain"
            />
          </div>
        </div>

        {/* =================================================
            CARD
        ================================================= */}

        <div className="rounded-3xl bg-white p-5 shadow-2xl sm:p-7">
          {/* HEADER */}

          <div className="mb-7 text-center">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
              {step === 1 ? (
                <KeyRound
                  size={27}
                  className="text-blue-600"
                />
              ) : (
                <ShieldCheck
                  size={27}
                  className="text-blue-600"
                />
              )}
            </div>

            <h1 className="text-2xl font-bold text-slate-800">
              {step === 1
                ? "Lupa Password?"
                : "Atur Ulang Password"}
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              {step === 1
                ? "Masukkan email akun kamu untuk mendapatkan kode OTP."
                : "Masukkan kode OTP dan buat password baru untuk akun kamu."}
            </p>
          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <AlertCircle
                size={16}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <p className="text-xs leading-5 text-red-700">
                {error}
              </p>
            </div>
          )}

          {/* =================================================
              SUCCESS
          ================================================= */}

          {success && (
            <div className="mb-5 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <CheckCircle2
                size={16}
                className="mt-0.5 shrink-0 text-emerald-600"
              />

              <p className="text-xs leading-5 text-emerald-700">
                {success}
              </p>
            </div>
          )}

          {/* =================================================
              STEP 1
          ================================================= */}

          {step === 1 && (
            <form
              onSubmit={handleSendOtp}
              className="space-y-5"
            >
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Email
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="Masukkan email akun"
                    autoComplete="email"
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />

                    Mengirim OTP...
                  </>
                ) : (
                  <>
                    <Mail size={17} />

                    Kirim Kode OTP
                  </>
                )}
              </button>
            </form>
          )}

          {/* =================================================
              STEP 2
          ================================================= */}

          {step === 2 && (
            <form
              onSubmit={handleResetPassword}
              className="space-y-4"
            >
              {/* EMAIL */}

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Email
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-600 outline-none"
                  />
                </div>
              </div>

              {/* OTP */}

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Kode OTP
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="one-time-code"
                  value={kodeOtp}
                  onChange={(e) => {
                    const value =
                      e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6);

                    setKodeOtp(value);
                  }}
                  placeholder="Masukkan 6 digit OTP"
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-lg font-bold tracking-[0.4em] text-slate-800 outline-none placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50"
                />

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading || resending}
                  className="mx-auto mt-2 flex items-center gap-1.5 text-xs font-medium text-blue-600 transition hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw
                    size={13}
                    className={
                      resending
                        ? "animate-spin"
                        : ""
                    }
                  />

                  {resending
                    ? "Mengirim ulang..."
                    : "Kirim ulang OTP"}
                </button>
              </div>

              {/* PASSWORD */}

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Password Baru
                </label>

                <div className="relative">
                  <Lock
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={kataSandi}
                    onChange={(e) =>
                      setKataSandi(
                        e.target.value
                      )
                    }
                    placeholder="Minimal 8 karakter"
                    autoComplete="new-password"
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-11 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (prev) => !prev
                      )
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>

                <p className="mt-1.5 text-[10px] leading-4 text-slate-400">
                  Minimal 8 karakter, 1 huruf
                  kapital, dan 1 angka.
                </p>
              </div>

              {/* CONFIRM PASSWORD */}

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Konfirmasi Password
                </label>

                <div className="relative">
                  <Lock
                    size={17}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={
                      showConfirm
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    placeholder="Ulangi password baru"
                    autoComplete="new-password"
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-11 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirm(
                        (prev) => !prev
                      )
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                  >
                    {showConfirm ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />

                    Menyimpan...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={17} />

                    Simpan Password Baru
                  </>
                )}
              </button>

              {/* CHANGE EMAIL */}

              <button
                type="button"
                onClick={handleBackToEmail}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 pt-2 text-xs font-medium text-blue-600 transition hover:text-blue-700 disabled:opacity-50"
              >
                <ArrowLeft size={14} />

                Gunakan email lain
              </button>
            </form>
          )}

          {/* =================================================
              BACK LOGIN
          ================================================= */}

          <div className="mt-6 border-t border-slate-100 pt-5">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-blue-600"
            >
              <ArrowLeft size={15} />

              Kembali ke halaman login
            </Link>
          </div>
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <p className="mt-5 text-center text-[11px] text-white/50">
          © 2026 Smart School. Semua hak dilindungi.
        </p>
      </div>
    </section>
  );
}