"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Delete,
  GraduationCap,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";

const DUMMY_PIN = "123456";

export default function KodePinSiswaPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleNumber = (number) => {
    if (loading || success) return;

    setError("");

    if (pin.length < 6) {
      setPin((prev) => prev + number);
    }
  };

  const handleDelete = () => {
    if (loading || success) return;

    setError("");
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (loading || success) return;

    setError("");
    setPin("");
  };

  const handleSubmit = () => {
    if (pin.length !== 6) {
      setError("Masukkan 6 digit kode PIN terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError("");

    setTimeout(() => {
      if (pin === DUMMY_PIN) {
        setSuccess(true);

        setTimeout(() => {
          router.push("/siswa");
        }, 900);
      } else {
        setLoading(false);
        setError("Kode PIN yang kamu masukkan tidak sesuai.");
        setPin("");
      }
    }, 700);
  };

  useEffect(() => {
    if (pin.length === 6 && !loading && !success) {
      const timer = setTimeout(() => {
        handleSubmit();
      }, 180);

      return () => clearTimeout(timer);
    }
  }, [pin]);

  const handleKeyboard = (event) => {
    if (event.key >= "0" && event.key <= "9") {
      handleNumber(event.key);
    }

    if (event.key === "Backspace") {
      handleDelete();
    }

    if (event.key === "Escape") {
      handleClear();
    }

    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyboard);

    return () => {
      window.removeEventListener("keydown", handleKeyboard);
    };
  }, [pin, loading, success]);

  const numbers = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
  ];

  return (
    <main className="min-h-screen bg-[#F6F8FC] text-slate-900 overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[420px] w-[420px] rounded-full bg-blue-100/60 blur-3xl" />
        <div className="absolute -bottom-48 -left-40 h-[420px] w-[420px] rounded-full bg-indigo-100/50 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(#155DFC 1px, transparent 1px), linear-gradient(90deg, #155DFC 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />
      </div>

      <div className="relative min-h-screen flex flex-col">
        {/* Top Bar */}
        <header className="h-[72px] shrink-0 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
          <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-5 sm:px-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#155DFC] shadow-lg shadow-blue-200">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>

              <div>
                <p className="text-[15px] font-bold tracking-tight text-[#0F172A]">
                  SmartSchool
                </p>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
                  Student Portal
                </p>
              </div>
            </div>

            {/* Secure badge */}
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 sm:flex">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-semibold text-slate-600">
                Akses Aman
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <section className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
          <div className="w-full max-w-[430px]">
            {/* Main Card */}
            <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_24px_70px_-25px_rgba(15,23,42,0.22)]">
              {/* Blue Header */}
              <div className="relative overflow-hidden bg-gradient-to-br from-[#0D47C9] via-[#155DFC] to-[#2563EB] px-6 pb-8 pt-7 sm:px-8">
                <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-white/10 blur-xl" />
                <div className="absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-indigo-300/20 blur-2xl" />

                <div className="relative">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
                      <LockKeyhole className="h-6 w-6 text-white" />
                    </div>

                    <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15">
                      <Sparkles className="h-3.5 w-3.5 text-blue-100" />
                      <span className="text-[11px] font-semibold text-white">
                        Verifikasi
                      </span>
                    </div>
                  </div>

                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">
                    Selamat datang kembali
                  </p>

                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-[28px]">
                    Masukkan Kode PIN
                  </h1>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-blue-100">
                    Masukkan 6 digit PIN siswa untuk melanjutkan ke dashboard
                    SmartSchool.
                  </p>
                </div>
              </div>

              {/* PIN Area */}
              <div className="px-6 pb-7 pt-7 sm:px-8">
                {/* PIN indicators */}
                <div className="mb-3 flex justify-center gap-2.5">
                  {Array.from({ length: 6 }).map((_, index) => {
                    const filled = index < pin.length;

                    return (
                      <div
                        key={index}
                        className={`flex h-12 w-10 items-center justify-center rounded-xl border-2 transition-all duration-200 sm:h-14 sm:w-11 ${
                          filled
                            ? "border-[#155DFC] bg-blue-50 shadow-sm shadow-blue-100"
                            : "border-slate-200 bg-slate-50"
                        } ${
                          error
                            ? "border-red-200 bg-red-50"
                            : success
                              ? "border-emerald-300 bg-emerald-50"
                              : ""
                        }`}
                      >
                        {filled && (
                          <div
                            className={`h-3 w-3 rounded-full ${
                              success ? "bg-emerald-500" : "bg-[#155DFC]"
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Status */}
                <div className="mb-6 min-h-[38px] text-center">
                  {error ? (
                    <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-red-600">
                      <XCircle className="h-4 w-4" />
                      {error}
                    </div>
                  ) : success ? (
                    <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                      PIN benar, membuka dashboard...
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">
                      {pin.length}/6 digit
                    </p>
                  )}
                </div>

                {/* Number Pad */}
                <div className="mx-auto grid max-w-[310px] grid-cols-3 gap-2.5 sm:gap-3">
                  {numbers.map((number) => (
                    <button
                      key={number}
                      type="button"
                      disabled={loading || success}
                      onClick={() => handleNumber(number)}
                      className="group flex h-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-lg font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-[#155DFC] hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 sm:h-16"
                    >
                      {number}
                    </button>
                  ))}

                  {/* Clear */}
                  <button
                    type="button"
                    disabled={loading || success}
                    onClick={handleClear}
                    className="flex h-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-100 disabled:opacity-50 sm:h-16"
                  >
                    Bersihkan
                  </button>

                  {/* Zero */}
                  <button
                    type="button"
                    disabled={loading || success}
                    onClick={() => handleNumber("0")}
                    className="flex h-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-lg font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-[#155DFC] hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 sm:h-16"
                  >
                    0
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    disabled={loading || success || pin.length === 0}
                    onClick={handleDelete}
                    className="flex h-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:opacity-40 sm:h-16"
                  >
                    <Delete className="h-5 w-5" />
                  </button>
                </div>

                {/* Submit */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || success || pin.length !== 6}
                  className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#155DFC] text-sm font-semibold text-white shadow-lg shadow-blue-200 transition-all hover:bg-[#0D47C9] hover:shadow-xl disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Memverifikasi...
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Berhasil
                    </>
                  ) : (
                    <>
                      Lanjut ke Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                {/* Security Info */}
                <div className="mt-5 flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                    <ShieldCheck className="h-4 w-4 text-[#155DFC]" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-700">
                      Akses terlindungi
                    </p>
                    <p className="mt-0.5 text-[11px] leading-5 text-slate-400">
                      Gunakan PIN pribadi kamu dan jangan membagikannya kepada
                      orang lain.
                    </p>
                  </div>
                </div>

                {/* Back */}
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="mx-auto mt-5 flex items-center gap-2 text-xs font-semibold text-slate-400 transition-colors hover:text-[#155DFC]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Kembali ke halaman login
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-5 text-center">
              <p className="text-[11px] font-medium text-slate-400">
                SmartSchool Student Portal
              </p>
              <p className="mt-1 text-[10px] text-slate-300">
                Sistem informasi sekolah terpadu
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Hidden input for accessibility / keyboard */}
      <input
        ref={inputRef}
        value={pin}
        onChange={() => {}}
        inputMode="numeric"
        autoComplete="one-time-code"
        className="pointer-events-none absolute h-0 w-0 opacity-0"
        aria-hidden="true"
      />
    </main>
  );
}