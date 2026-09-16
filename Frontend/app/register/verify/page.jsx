"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  GraduationCap,
  ShieldCheck,
  Mail,
  ArrowLeft,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function VerifyRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [kodeOtp, setKodeOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [countdown, setCountdown] = useState(0);

  // ==========================================
  // AMBIL EMAIL DARI URL
  // ==========================================
  useEffect(() => {
    const emailFromUrl = searchParams.get("email");

    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, [searchParams]);

  // ==========================================
  // COUNTDOWN KIRIM ULANG OTP
  // ==========================================
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // ==========================================
  // VERIFIKASI OTP
  // ==========================================
  const handleVerify = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email) {
      setError("Email tidak ditemukan.");
      return;
    }

    if (!kodeOtp) {
      setError("Silakan masukkan kode OTP.");
      return;
    }

    if (kodeOtp.length !== 6) {
      setError("Kode OTP harus terdiri dari 6 digit.");
      return;
    }

    try {
      setLoading(true);

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const response = await fetch(
        `${API_URL}/api/auth/verify-register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            kodeOtp,
          }),
        }
      );

      let result;

      try {
        result = await response.json();
      } catch {
        throw new Error(
          "Response dari server bukan JSON yang valid."
        );
      }

      if (!response.ok) {
        throw new Error(
          result?.message || "Verifikasi OTP gagal."
        );
      }

      // ==========================================
      // SIMPAN TOKEN DARI BACKEND
      // ==========================================
      if (result?.token) {
        localStorage.setItem("token", result.token);
      }

      setSuccess(
        result?.message ||
          "Verifikasi berhasil. Akun Anda sudah aktif."
      );

      // ==========================================
      // REDIRECT KE LOGIN
      // ==========================================
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      console.error("VERIFY REGISTER ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat verifikasi."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // KIRIM ULANG OTP
  // ==========================================
  const handleResendOtp = async () => {
    if (!email) {
      setError("Email tidak ditemukan.");
      return;
    }

    if (countdown > 0) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      setResendLoading(true);

      /*
       * Backend saat ini belum menyediakan endpoint
       * khusus untuk resend OTP.
       *
       * Karena itu jangan memanggil endpoint palsu
       * dari frontend.
       */

      setError(
        "Untuk mengirim ulang OTP, fitur resend OTP belum tersedia."
      );
    } catch (error) {
      console.error("RESEND OTP ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Gagal mengirim ulang kode OTP."
      );
    } finally {
      setResendLoading(false);
    }
  };

  // ==========================================
  // KEMBALI KE LOGIN
  // ==========================================
  const handleBackToLogin = () => {
    router.push("/login");
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* ==========================================
          BACKGROUND
      ========================================== */}
      <Image
        src="/hero/hero.png"
        alt="Smart School"
        fill
        priority
        className="object-cover"
      />

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.60) 28%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.25) 100%)",
        }}
      />

      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400" />

      {/* ==========================================
          CONTENT
      ========================================== */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-2 items-center gap-10">
          {/* ======================================
              LEFT CONTENT
          ====================================== */}
          <div className="hidden lg:block">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-md">
                <GraduationCap
                  className="text-white"
                  size={19}
                />
              </div>

              <span className="font-bold text-base text-slate-900">
                SMART{" "}
                <span className="text-blue-600">
                  SCHOOL
                </span>
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-extrabold leading-tight text-slate-900">
              Verifikasi Akun
              <br />
              <span className="text-blue-600">
                Smart School
              </span>
            </h1>

            {/* Description */}
            <p className="mt-4 text-gray-600 leading-6 text-sm max-w-md">
              Satu langkah lagi untuk mengaktifkan akun
              Smart School Anda. Masukkan kode OTP yang
              telah dikirimkan ke email Anda.
            </p>

            {/* Features */}
            <div className="mt-6 flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-sm border border-white/80 rounded-lg px-3 py-1.5">
                <ShieldCheck
                  size={14}
                  className="text-blue-600"
                />

                <span className="text-xs font-semibold text-slate-800">
                  Aman
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-sm border border-white/80 rounded-lg px-3 py-1.5">
                <Mail
                  size={14}
                  className="text-blue-600"
                />

                <span className="text-xs font-semibold text-slate-800">
                  Verifikasi Email
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-sm border border-white/80 rounded-lg px-3 py-1.5">
                <CheckCircle2
                  size={14}
                  className="text-blue-600"
                />

                <span className="text-xs font-semibold text-slate-800">
                  Terpercaya
                </span>
              </div>
            </div>
          </div>

          {/* ======================================
              VERIFY CARD
          ====================================== */}
          <div className="lg:justify-self-end w-full max-w-sm">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              {/* Header */}
              <div className="flex flex-col items-center text-center mb-5">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mb-3 shadow-md">
                  <ShieldCheck
                    className="text-white"
                    size={24}
                  />
                </div>

                <h2 className="font-bold text-lg text-slate-900">
                  Verifikasi Akun
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  Masukkan kode OTP yang dikirim ke email
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                  <p className="text-xs text-red-600">
                    {error}
                  </p>
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5">
                  <p className="text-xs text-green-600">
                    {success}
                  </p>
                </div>
              )}

              {/* ==========================================
                  FORM
              ========================================== */}
              <form
                onSubmit={handleVerify}
                className="space-y-4"
              >
                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Email
                  </label>

                  <div className="relative">
                    <Mail
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      placeholder="Email Anda"
                      disabled={loading}
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* OTP */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Kode OTP
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={kodeOtp}
                    onChange={(e) => {
                      const value =
                        e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6);

                      setKodeOtp(value);
                      setError("");
                    }}
                    placeholder="Masukkan 6 digit kode OTP"
                    disabled={loading}
                    className="w-full px-3 py-3 rounded-lg border border-gray-200 text-center text-lg tracking-[0.5em] font-bold text-slate-800 placeholder:text-xs placeholder:tracking-normal placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60"
                  />

                  <p className="mt-1.5 text-[11px] text-gray-400 text-center">
                    Kode OTP berlaku selama 5 menit
                  </p>
                </div>

                {/* Verify Button */}
                <button
                  type="submit"
                  disabled={
                    loading ||
                    kodeOtp.length !== 6 ||
                    !email
                  }
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-lg transition duration-300 shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                      Memverifikasi...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Verifikasi Akun
                    </>
                  )}
                </button>
              </form>

              {/* ==========================================
                  RESEND OTP
              ========================================== */}
              <div className="text-center mt-5">
                <p className="text-xs text-gray-500">
                  Tidak menerima kode?
                </p>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={
                    resendLoading ||
                    countdown > 0 ||
                    loading
                  }
                  className="mt-1 text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {resendLoading
                    ? "Mengirim..."
                    : countdown > 0
                    ? `Kirim ulang dalam ${countdown} detik`
                    : "Kirim ulang kode OTP"}
                </button>
              </div>

              {/* ==========================================
                  BACK LOGIN
              ========================================== */}
              <div className="border-t border-gray-100 mt-5 pt-4">
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-blue-600 transition disabled:opacity-50"
                >
                  <ArrowLeft size={14} />
                  Kembali ke Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}