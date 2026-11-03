
"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { verifyPin } from "@/services/auth.services";
import { setSession, getRoleHome } from "@/lib/auth";
import {
  Eye,
  EyeOff,
  LoaderCircle,
  Globe,
  ArrowLeft,
  ShieldCheck,
  LockKeyhole,
} from "lucide-react";

const PIN_TOKEN_KEY = "pin_access_token";

function PinInput({
  value,
  onChange,
  disabled,
  show,
  idPrefix,
  autoFocus,
}) {
  const refs = useRef([]);

  const digits = useMemo(() => {
    const arr = String(value || "").split("").slice(0, 6);
    while (arr.length < 6) arr.push("");
    return arr;
  }, [value]);

  const setDigit = (index, char) => {
    const next = digits.slice();
    next[index] = String(char || "").replace(/\D/g, "").slice(-1);
    onChange(next.join("").replace(/\D/g, "").slice(0, 6));
  };

  const handleChange = (index, raw) => {
    const cleaned = String(raw || "").replace(/\D/g, "");

    if (!cleaned) {
      setDigit(index, "");
      return;
    }

    if (cleaned.length > 1) {
      const next = digits.slice();

      for (let i = 0; i < cleaned.length && index + i < 6; i += 1) {
        next[index + i] = cleaned[i];
      }

      onChange(next.join("").replace(/\D/g, "").slice(0, 6));
      refs.current[Math.min(index + cleaned.length, 5)]?.focus();
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
        const next = digits.slice();
        next[index - 1] = "";
        onChange(next.join("").replace(/\D/g, ""));
        refs.current[index - 1]?.focus();
      }
    }

    if (e.key === "ArrowLeft" && index > 0) {
      refs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowRight" && index < 5) {
      refs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) return;

    onChange(pasted);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div className="flex items-center gap-2">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          id={`${idPrefix}-${index}`}
          type={show ? "text" : "password"}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={6}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          autoFocus={autoFocus && index === 0}
          className={`h-12 w-full min-w-0 rounded-lg border text-center text-lg font-semibold outline-none transition sm:h-14 sm:text-xl ${
            digit
              ? "border-blue-400 bg-blue-50/50 text-slate-900"
              : "border-slate-200 bg-white text-slate-900"
          } focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50`}
          placeholder="•"
          aria-label={`Digit PIN ke-${index + 1}`}
        />
      ))}
    </div>
  );
}

export default function VerifyPinPage() {
  const router = useRouter();

  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pinValid = /^\d{6}$/.test(pin);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");

    if (!pinValid) {
      setError("Masukkan PIN yang terdiri dari 6 angka.");
      return;
    }

    let pinToken = null;

    try {
      pinToken = window.sessionStorage.getItem(PIN_TOKEN_KEY);
    } catch {
      setError("Sesi verifikasi tidak dapat dibaca. Silakan login kembali.");
      return;
    }

    if (!pinToken) {
      setError("Sesi verifikasi PIN tidak ditemukan. Silakan login kembali.");
      return;
    }

    try {
      setLoading(true);

      const response = await verifyPin(pin, pinToken);
      const result = response?.data?.data ?? response?.data ?? response;

      if (!result?.token) {
        throw new Error("Token akses tidak diterima dari server.");
      }

      if (!result?.user || typeof result.user !== "object") {
        throw new Error("Data pengguna tidak diterima dari server.");
      }

      const sessionUser = setSession(result.token, result.user);

      if (!sessionUser) {
        throw new Error("Sesi pengguna gagal dibuat. Silakan coba lagi.");
      }

      window.sessionStorage.removeItem(PIN_TOKEN_KEY);
      window.sessionStorage.removeItem("pin_setup_token");

      delete window.__SMARTSCHOOL_PIN_TOKEN__;
      delete window.__SMARTSCHOOL_SETUP_TOKEN__;

      const destination = getRoleHome(
        sessionUser.role ||
          result.user.role ||
          result.user.peran?.nama
      );

      router.replace(destination);
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
      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col items-center px-6 pb-5 pt-8 sm:px-8 sm:pt-9">
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
              <ShieldCheck size={16} />
            </span>
          </div>

          <h1 className="mt-4 text-base font-semibold tracking-tight text-slate-900">
            Verifikasi PIN
          </h1>

          <p className="mt-1 text-center text-xs leading-5 text-slate-500">
            Masukkan PIN 6 digit yang sudah kamu buat untuk melanjutkan ke dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 sm:px-8">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="pin-0" className="text-xs font-medium text-slate-700">
                PIN kamu
              </label>

              <button
                type="button"
                onClick={() => setShowPin((prev) => !prev)}
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

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-lg border border-red-100 bg-red-50 px-3.5 py-2.5 text-xs leading-5 text-red-700"
            >
              {error}
            </div>
          )}

          <div className="mt-4 flex gap-2.5 rounded-lg bg-slate-50 px-3.5 py-3">
            <LockKeyhole className="mt-0.5 shrink-0 text-slate-500" size={15} />
            <p className="text-[11px] leading-5 text-slate-500">
              Demi keamanan akun, sistem membatasi percobaan PIN yang salah.
              Jika akun terkunci, ikuti pesan yang diberikan sistem.
            </p>
          </div>

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

          <button
            type="button"
            onClick={() => router.push("/pin/forgot")}
            className="mt-2 w-full py-2 text-xs font-medium text-blue-600 transition hover:text-blue-800"
          >
            Lupa PIN?
          </button>
        </form>

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

            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
              <Globe size={13} />
              Bahasa Indonesia
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
