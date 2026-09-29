"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";

export default function VerifyLoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const inputRefs = useRef([]);

  
  useEffect(() => {
    const savedIdentifier = sessionStorage.getItem("login_identifier");

    if (!savedIdentifier) {
      window.location.href = "/login";
      return;
    }

    setIdentifier(savedIdentifier);

    // Fokus ke input OTP pertama
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }, []);

  
  const handleOtpChange = (index, value) => {
    // Hanya boleh angka
    if (!/^\d*$/.test(value)) {
      return;
    }

    
    const newValue = value.slice(-1);

    const newOtp = [...otp];
    newOtp[index] = newValue;

    setOtp(newOtp);
    setError("");
    setSuccess("");

    
    if (newValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

 
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Panah kiri
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Panah kanan
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

 
  const handlePaste = (e) => {
    e.preventDefault();

    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedData) return;

    const newOtp = ["", "", "", "", "", ""];

    pastedData.split("").forEach((digit, index) => {
      newOtp[index] = digit;
    });

    setOtp(newOtp);
    setError("");

    const nextIndex = Math.min(pastedData.length, 5);

    setTimeout(() => {
      inputRefs.current[nextIndex]?.focus();
    }, 50);
  };

  
  const handleVerify = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const kodeOtp = otp.join("");

    // Pastikan 6 digit
    if (kodeOtp.length !== 6) {
      setError("Silakan masukkan kode OTP 6 digit.");
      return;
    }

    if (!identifier) {
      setError("Sesi login tidak ditemukan. Silakan login kembali.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify-login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            identifier: identifier,
            kodeOtp: kodeOtp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Verifikasi OTP gagal.");
      }

      if (!data.token) {
        throw new Error("Token login tidak diterima dari server.");
      }

      
      localStorage.setItem("token", data.token);

      // Hapus identifier sementara
      sessionStorage.removeItem("login_identifier");

      setSuccess("Verifikasi berhasil. Mengarahkan ke onboarding...");

     
      setTimeout(() => {
        window.location.href = "/onboarding/status";
      }, 700);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat verifikasi OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  
  const handleBackToLogin = () => {
    sessionStorage.removeItem("login_identifier");
    window.location.href = "/login";
  };

  return (
    <main className="relative min-h-screen overflow-hidden flex items-center justify-center">
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
            "linear-gradient(to right, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.65) 35%, rgba(255,255,255,0.3) 65%, rgba(255,255,255,0.65) 100%)",
        }}
      />

      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400" />

      {/* ==========================================
          CONTENT
      ========================================== */}
      <div className="relative z-10 w-full max-w-md px-6 py-10">
        {/* LOGO */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="relative w-10 h-10 rounded-lg bg-white flex items-center justify-center overflow-hidden shadow-sm">
            <Image
              src="/logo/logoSS.png"
              alt="Smart School Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>

          <span className="font-bold text-lg text-slate-900">
            SMART <span className="text-blue-600">SCHOOL</span>
          </span>
        </div>

        {/* ==========================================
            CARD
        ========================================== */}
        <div className="bg-white rounded-2xl shadow-xl p-7">
          {/* HEADER */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
              <ShieldCheck
                size={25}
                className="text-blue-600"
              />
            </div>

            <h1 className="font-bold text-xl text-slate-900">
              Verifikasi Login
            </h1>

            <p className="text-sm text-gray-500 mt-1 leading-5">
              Masukkan kode OTP yang telah dikirim
              <br />
              ke email kamu.
            </p>

            {identifier && (
              <p className="text-xs text-blue-600 font-medium mt-2 break-all">
                {identifier}
              </p>
            )}
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-xs text-red-600 text-center">
              {error}
            </div>
          )}

          {/* SUCCESS */}
          {success && (
            <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-3 py-2.5 text-xs text-green-600 text-center">
              {success}
            </div>
          )}

          {/* ==========================================
              OTP FORM
          ========================================== */}
          <form onSubmit={handleVerify}>
            <label className="block text-xs font-semibold text-slate-800 mb-3 text-center">
              Kode OTP
            </label>

            <div className="flex justify-center gap-2 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) =>
                    handleOtpChange(index, e.target.value)
                  }
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-11 h-12 sm:w-12 sm:h-13 text-center text-lg font-bold text-slate-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  aria-label={`Digit OTP ${index + 1}`}
                  disabled={loading}
                />
              ))}
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading || otp.join("").length !== 6}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-lg transition duration-300 shadow-lg shadow-blue-200"
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
                  <ShieldCheck size={16} />
                  Verifikasi & Masuk
                </>
              )}
            </button>
          </form>

          {/* BACK */}
          <button
            type="button"
            onClick={handleBackToLogin}
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-blue-600 transition"
          >
            <ArrowLeft size={14} />
            Kembali ke halaman login
          </button>
        </div>

        {/* FOOTER */}
        <p className="text-center text-[11px] text-slate-500 mt-5">
          SmartSchool • Sistem Informasi Sekolah
        </p>
      </div>
    </main>
  );
}