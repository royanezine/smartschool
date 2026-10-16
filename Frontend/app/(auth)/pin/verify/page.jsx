"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { verifyPin } from "@/services/auth.services";
import {
  Eye,
  EyeOff,
  LoaderCircle,
  Globe,
  ArrowLeft,
  ShieldCheck,
  LockKeyhole,
} from "lucide-react";

/* -------------------- INPUT PIN 6 KOTAK -------------------- */
function PinInput({ value, onChange, disabled, show, idPrefix, autoFocus }) {
  const refs = useRef([]);

  const digits = useMemo(() => {
    const arr = value.split("").slice(0, 6);
    while (arr.length < 6) arr.push("");
    return arr;
  }, [value]);

  const setDigit = (index, char) => {
    const next = digits.slice();
    next[index] = char;
    onChange(next.join("").replace(/\D/g, "").slice(0, 6));
  };

  const handleChange = (index, raw) => {
    const cleaned = raw.replace(/\D/g, "");
    if (!cleaned) {
      setDigit(index, "");
      return;
    }
    if (cleaned.length > 1) {
      const gabung = (digits.join("").slice(0, index) + cleaned).slice(0, 6);
      onChange(gabung);
      const fokus = Math.min(gabung.length, 5);
      refs.current[fokus]?.focus();
      return;
    }
    setDigit(index, cleaned);
    if (index < 5) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[index]) {
        setDigit(index, "");
      } else if (index > 0) {
        refs.current[index - 1]?.focus();
        const next = digits.slice();
        next[index - 1] = "";
        onChange(next.join(""));
      }
    }
    if (e.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) refs.current[index + 1]?.focus();
  };

  return (
    <div className="flex items-center gap-2">
      {digits.map((digit, index) => {
        const terisi = Boolean(digit);
        return (
          <input
            key={index}
            ref={(el) => {
              refs.current[index] = el;
              if (autoFocus && index === 0 && el && !el.dataset.focused) {
                el.dataset.focused = "1";
                el.focus();
              }
            }}
            id={`${idPrefix}-${index}`}
            type={show ? "text" : "password"}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onFocus={(e) => e.target.select()}
            className={`h-12 w-full min-w-0 rounded-lg border text-center text-lg font-semibold outline-none transition sm:h-14 sm:text-xl ${
              terisi
                ? "border-blue-400 bg-blue-50/50 text-slate-900"
                : "border-slate-200 bg-white text-slate-900"
            } placeholder:text-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50`}
            placeholder="•"
          />
        );
      })}
    </div>
  );
}

/* -------------------- HALAMAN -------------------- */
export default function VerifyPinPage() {
  const router = useRouter();

  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pinValid = /^\d{6}$/.test(pin);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const pinToken = sessionStorage.getItem("pin_access_token");

    if (!pinToken) {
      setError("Sesi verifikasi PIN tidak ditemukan. Silakan login kembali.");
      return;
    }

    if (!pinValid) {
      setError("Masukkan PIN yang terdiri dari 6 angka.");
      return;
    }

    try {
      setLoading(true);

      const response = await verifyPin(pin, pinToken);
      const result = response?.data ?? response;

      if (!result?.token) {
        throw new Error("Token akses tidak diterima dari server.");
      }

      const user = result.user;

      if (!user) {
        throw new Error("Data pengguna tidak diterima dari server.");
      }

      localStorage.removeItem("token");
      localStorage.setItem("token", result.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...user,
          userId: user.id,
          role: user.role,
        })
      );

      sessionStorage.removeItem("pin_setup_token");
      sessionStorage.removeItem("pin_access_token");

      window.dispatchEvent(new Event("user-updated"));

      router.replace("/siswa");
    } catch (err) {
      setError(
        err?.message ||
          "Verifikasi PIN gagal. Periksa PIN kamu dan coba lagi."
      );
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-white px-4 py-8">
      {/* Kartu utama */}
      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Logo + judul */}
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
            {/* Badge verifikasi */}
            <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-sm">
              <ShieldCheck size={16} />
            </span>
          </div>

          <h1 className="mt-4 text-base font-semibold tracking-tight text-slate-900">
            Verifikasi PIN
          </h1>
          <p className="mt-1 text-center text-xs leading-5 text-slate-500">
            Masukkan PIN 6 digit yang sudah kamu buat untuk melanjutkan ke
            dashboard.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 sm:px-8">
          {/* PIN */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-slate-700">
                PIN kamu
              </label>
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-blue-600"
              >
                {showPin ? <EyeOff size={13} /> : <Eye size={13} />}
                {showPin ? "Sembunyikan" : "Tampilkan"}
              </button>
            </div>

            <PinInput
              idPrefix="pin"
              value={pin}
              onChange={setPin}
              disabled={loading}
              show={showPin}
              autoFocus
            />
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="mt-4 rounded-lg border border-red-100 bg-red-50 px-3.5 py-2.5 text-xs leading-5 text-red-700"
            >
              {error}
            </div>
          )}

          {/* Info keamanan */}
          <div className="mt-4 flex gap-2.5 rounded-lg bg-slate-50 px-3.5 py-3">
            <LockKeyhole
              className="mt-0.5 shrink-0 text-slate-500"
              size={15}
            />
            <p className="text-[11px] leading-5 text-slate-500">
              Demi keamanan akun, sistem membatasi percobaan PIN yang salah.
              Jika akun terkunci, ikuti pesan yang diberikan sistem.
            </p>
          </div>

          {/* Tombol utama */}
          <button
            type="submit"
            disabled={loading || !pinValid}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            {loading ? (
              <>
                <LoaderCircle size={16} className="animate-spin" />
                Memverifikasi...
              </>
            ) : (
              "Verifikasi PIN"
            )}
          </button>

          {/* Lupa PIN */}
          <button
            type="button"
            onClick={() => router.push("/pin/forgot")}
            className="mt-2 w-full py-2 text-xs font-medium text-blue-600 transition hover:text-blue-800"
          >
            Lupa PIN?
          </button>
        </form>

        {/* Footer kartu */}
        <div className="border-t border-slate-100 px-6 py-4 sm:px-8">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => router.replace("/login")}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-blue-600"
            >
              <ArrowLeft size={13} />
              Kembali ke login
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-blue-600"
            >
              <Globe size={13} />
              Bahasa Indonesia
            </button>
          </div>
        </div>
      </div>

     
    </div>
  );
}