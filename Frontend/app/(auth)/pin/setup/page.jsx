"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { setupPin } from "@/services/auth.services";
import { setSession, getRoleHome } from "@/lib/auth";
import {
  Eye,
  EyeOff,
  LoaderCircle,
  Globe,
  ArrowLeft,
} from "lucide-react";

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
                ? "border-sky-400 bg-sky-50/50 text-slate-900"
                : "border-slate-200 bg-white text-slate-900"
            } placeholder:text-slate-300 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 disabled:bg-slate-50`}
            placeholder="•"
          />
        );
      })}
    </div>
  );
}

export default function SetupPinPage() {
  const router = useRouter();

  const [pin, setPin] = useState("");
  const [konfirmasiPin, setKonfirmasiPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [showKonfirmasi, setShowKonfirmasi] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const pinValid = /^\d{6}$/.test(pin);
  const konfirmasiValid = /^\d{6}$/.test(konfirmasiPin);
  const cocok = pinValid && konfirmasiValid && pin === konfirmasiPin;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const setupToken = sessionStorage.getItem("pin_setup_token");

    if (!setupToken) {
      setError("Sesi pembuatan PIN tidak ditemukan. Silakan login kembali.");
      return;
    }

    if (!pinValid) {
      setError("PIN harus terdiri dari 6 angka.");
      return;
    }

    if (pin !== konfirmasiPin) {
      setError("Konfirmasi PIN tidak sesuai.");
      return;
    }

    try {
      setLoading(true);

      const response = await setupPin(pin, setupToken);
      const result = response?.data ?? response;

      if (!result?.token) {
        throw new Error("Token akses tidak diterima dari server.");
      }

      const user = result.user;
      if (!user) {
        throw new Error("Data pengguna tidak diterima dari server.");
      }

      const sessionUser = setSession(result.token, user);

      sessionStorage.removeItem("pin_setup_token");
      sessionStorage.removeItem("pin_access_token");

      setSuccess("PIN berhasil dibuat. Mengarahkan ke dashboard...");
      router.replace(getRoleHome(sessionUser?.role) || "/siswa");
    } catch (err) {
      setError(err?.message || "Gagal membuat PIN. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-white px-4 py-8">
      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col items-center px-6 pt-8 pb-5 sm:px-8 sm:pt-9">
          <div className="flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28">
            <Image
              src="/logo/logoSS.png"
              alt="Logo Sekolah"
              width={112}
              height={112}
              priority
              className="h-full w-full object-contain"
            />
          </div>

          <h1 className="mt-4 text-base font-semibold tracking-tight text-slate-900">
            Buat PIN kamu
          </h1>
          <p className="mt-1 text-center text-xs leading-5 text-slate-500">
            Buat PIN 6 digit untuk melindungi akun SmartSchool kamu.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 sm:px-8">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-slate-700">
                PIN baru
              </label>
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-sky-600"
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

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-slate-700">
                Konfirmasi PIN
              </label>
              <button
                type="button"
                onClick={() => setShowKonfirmasi(!showKonfirmasi)}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-sky-600"
              >
                {showKonfirmasi ? <EyeOff size={13} /> : <Eye size={13} />}
                {showKonfirmasi ? "Sembunyikan" : "Tampilkan"}
              </button>
            </div>

            <PinInput
              idPrefix="konfirmasi"
              value={konfirmasiPin}
              onChange={setKonfirmasiPin}
              disabled={loading}
              show={showKonfirmasi}
            />

            {pinValid && konfirmasiValid && !cocok && (
              <p className="mt-2 text-xs text-amber-600">
                Konfirmasi PIN belum sama.
              </p>
            )}

            {cocok && (
              <p className="mt-2 text-xs font-medium text-emerald-600">
                PIN sudah cocok.
              </p>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-lg border border-red-100 bg-red-50 px-3.5 py-2.5 text-xs leading-5 text-red-700"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50 px-3.5 py-2.5 text-xs leading-5 text-emerald-700"
            >
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !cocok}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600 focus:outline-none focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            {loading ? (
              <>
                <LoaderCircle size={16} className="animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Buat PIN dan Lanjutkan"
            )}
          </button>

          <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">
            Jangan bagikan PIN kamu kepada siapa pun.
          </p>
        </form>

        <div className="border-t border-slate-100 px-6 py-4 sm:px-8">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => router.replace("/login")}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-sky-600"
            >
              <ArrowLeft size={13} />
              Kembali ke login
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-sky-600"
            >
              <Globe size={13} />
              Bahasa Indonesia
            </button>
          </div>
        </div>
      </div>

      <p className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 text-[11px] text-slate-400">
        © {new Date().getFullYear()} Yayasan Setya Bakti
      </p>
    </div>
  );
}