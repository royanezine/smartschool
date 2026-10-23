"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

async function requestApi(path, payload) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.success === false) {
    throw new Error(result.message || "Permintaan gagal. Silakan coba lagi.");
  }

  return result;
}

export default function ForgotPinPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState("");
  const [kodeOtp, setKodeOtp] = useState("");
  const [pinBaru, setPinBaru] = useState("");
  const [konfirmasiPin, setKonfirmasiPin] = useState("");

  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");


  async function handleRequestOtp(event) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const value = identifier.trim();

    if (!value) {
      setErrorMessage("Masukkan email atau username akun siswa.");
      return;
    }

    setLoading(true);

    try {
      const result = await requestApi("/api/auth/pin/forgot", {
        identifier: value,
      });

      setStep(2);
      setSuccessMessage(
        result.message ||
          "Jika akun terdaftar, kode OTP akan dikirim ke email.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal meminta kode OTP.",
      );
    } finally {
      setLoading(false);
    }
  }


  async function handleResetPin(event) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!/^\d{6}$/.test(kodeOtp.trim())) {
      setErrorMessage("Kode OTP harus terdiri dari 6 digit.");
      return;
    }

    if (!/^\d{6}$/.test(pinBaru)) {
      setErrorMessage("PIN baru harus terdiri dari 6 digit angka.");
      return;
    }

    if (pinBaru !== konfirmasiPin) {
      setErrorMessage("Konfirmasi PIN tidak sama dengan PIN baru.");
      return;
    }

    setLoading(true);

    try {
      const result = await requestApi("/api/auth/pin/reset", {
        identifier: identifier.trim(),
        kodeOtp: kodeOtp.trim(),
        pinBaru,
      });

      setSuccessMessage(
        result.message || "PIN berhasil direset. Silakan login kembali.",
      );

      setStep(3);
      setKodeOtp("");
      setPinBaru("");
      setKonfirmasiPin("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Gagal mereset PIN. Periksa OTP dan coba lagi.",
      );
    } finally {
      setLoading(false);
    }
  }


  function goBack() {
    if (step === 2) {
      setStep(1);
      setErrorMessage("");
      setSuccessMessage("");
      return;
    }
    router.push("/login");
  }


  return (
    <div className="relative flex min-h-screen items-center justify-center bg-white px-4 py-8">
      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col items-center px-6 pt-8 pb-5 sm:px-8 sm:pt-9">
          <div className="relative flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28">
            <Image
              src="/logo/logoSS.png"
              alt="Logo Sekolah"
              width={112}
              height={112}
              priority
              className="h-full w-full object-contain"
            />
            <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-sm">
              <KeyRound size={16} />
            </span>
          </div>

          <h1 className="mt-4 text-base font-semibold tracking-tight text-slate-900">
            {step === 1 && "Lupa PIN?"}
            {step === 2 && "Verifikasi OTP"}
            {step === 3 && "PIN Berhasil Direset"}
          </h1>
          <p className="mt-1 text-center text-xs leading-5 text-slate-500">
            {step === 1 &&
              "Masukkan email atau username untuk meminta kode OTP reset PIN."}
            {step === 2 &&
              "Masukkan kode OTP dari email, lalu buat PIN baru 6 digit."}
            {step === 3 &&
              "PIN keamanan kamu sudah diperbarui. Silakan login kembali."}
          </p>
        </div>

        <div className="px-6 pb-6 sm:px-8">
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label
                  htmlFor="identifier"
                  className="mb-1.5 block text-xs font-medium text-slate-700"
                >
                  Email atau username
                </label>

                <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
                  <UserRound
                    size={16}
                    className="shrink-0 text-slate-400"
                  />
                  <input
                    id="identifier"
                    type="text"
                    autoComplete="username"
                    placeholder="Masukkan email atau username"
                    value={identifier}
                    onChange={(event) => {
                      setIdentifier(event.target.value);
                      setErrorMessage("");
                    }}
                    disabled={loading}
                    required
                    className="w-full bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>

                <p className="mt-2 text-[11px] leading-5 text-slate-500">
                  Kode verifikasi akan dikirim ke email yang terdaftar.
                </p>
              </div>

              {errorMessage && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-100 bg-red-50 px-3.5 py-2.5 text-xs leading-5 text-red-700"
                >
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={16} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Kirim Kode OTP"
                )}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleResetPin} className="space-y-4">
              <div className="flex items-center gap-2.5 rounded-lg border border-blue-100 bg-blue-50/60 px-3.5 py-2.5">
                <Mail size={15} className="shrink-0 text-blue-600" />
                <span className="text-[11px] text-slate-600">
                  Akun:{" "}
                  <strong className="break-all font-semibold text-slate-900">
                    {identifier}
                  </strong>
                </span>
              </div>

              {successMessage && (
                <div
                  role="status"
                  className="rounded-lg border border-emerald-100 bg-emerald-50 px-3.5 py-2.5 text-xs leading-5 text-emerald-700"
                >
                  {successMessage}
                </div>
              )}

              <div>
                <label
                  htmlFor="otp"
                  className="mb-1.5 block text-xs font-medium text-slate-700"
                >
                  Kode OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Masukkan 6 digit OTP"
                  value={kodeOtp}
                  onChange={(event) => {
                    setKodeOtp(
                      event.target.value.replace(/\D/g, "").slice(0, 6),
                    );
                    setErrorMessage("");
                  }}
                  maxLength={6}
                  required
                  disabled={loading}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-center text-lg font-semibold tracking-[0.4em] text-slate-900 outline-none transition placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="new-pin"
                    className="text-xs font-medium text-slate-700"
                  >
                    PIN baru
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPin((v) => !v)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-blue-600"
                  >
                    {showPin ? <EyeOff size={13} /> : <Eye size={13} />}
                    {showPin ? "Sembunyikan" : "Tampilkan"}
                  </button>
                </div>

                <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
                  <KeyRound size={16} className="shrink-0 text-slate-400" />
                  <input
                    id="new-pin"
                    type={showPin ? "text" : "password"}
                    inputMode="numeric"
                    autoComplete="new-password"
                    placeholder="Buat PIN 6 digit"
                    value={pinBaru}
                    onChange={(event) => {
                      setPinBaru(
                        event.target.value.replace(/\D/g, "").slice(0, 6),
                      );
                      setErrorMessage("");
                    }}
                    maxLength={6}
                    required
                    disabled={loading}
                    className="w-full bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="confirm-pin"
                    className="text-xs font-medium text-slate-700"
                  >
                    Konfirmasi PIN baru
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPin((v) => !v)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-blue-600"
                  >
                    {showConfirmPin ? (
                      <EyeOff size={13} />
                    ) : (
                      <Eye size={13} />
                    )}
                    {showConfirmPin ? "Sembunyikan" : "Tampilkan"}
                  </button>
                </div>

                <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
                  <KeyRound size={16} className="shrink-0 text-slate-400" />
                  <input
                    id="confirm-pin"
                    type={showConfirmPin ? "text" : "password"}
                    inputMode="numeric"
                    autoComplete="new-password"
                    placeholder="Ulangi PIN baru"
                    value={konfirmasiPin}
                    onChange={(event) => {
                      setKonfirmasiPin(
                        event.target.value.replace(/\D/g, "").slice(0, 6),
                      );
                      setErrorMessage("");
                    }}
                    maxLength={6}
                    required
                    disabled={loading}
                    className="w-full bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              {errorMessage && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-100 bg-red-50 px-3.5 py-2.5 text-xs leading-5 text-red-700"
                >
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={16} className="animate-spin" />
                    Menyimpan PIN...
                  </>
                ) : (
                  "Reset PIN"
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                disabled={loading}
                className="w-full py-1 text-xs font-medium text-blue-600 transition hover:text-blue-800 disabled:opacity-50"
              >
                Minta kode OTP lagi
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-start gap-2.5 rounded-lg border border-emerald-100 bg-emerald-50 px-3.5 py-3">
                <CheckCircle2
                  size={17}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />
                <p className="text-xs leading-5 text-emerald-800">
                  {successMessage}
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push("/login")}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                Kembali ke Login
              </button>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 px-6 py-4 sm:px-8">
          <div className="flex items-center justify-between gap-2">
            {step !== 3 ? (
              <button
                type="button"
                onClick={goBack}
                disabled={loading}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-blue-600 disabled:opacity-50"
              >
                <ArrowLeft size={13} />
                {step === 2 ? "Ganti akun" : "Kembali"}
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                <ShieldCheck size={13} />
                Akun aman
              </span>
            )}

            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
              <ShieldCheck size={13} />
              SmartSchool
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}