
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

const SETUP_TOKEN_KEY = "pin_setup_token";
const PIN_TOKEN_KEY = "pin_access_token";

function getApiResult(response) {
  let result = response;

  // Menangani beberapa kemungkinan bentuk response apiFetch.
  for (let i = 0; i < 3; i += 1) {
    if (
      result &&
      typeof result === "object" &&
      result.data &&
      typeof result.data === "object"
    ) {
      result = result.data;
    } else {
      break;
    }
  }

  return result;
}

function PinInput({
  value,
  onChange,
  disabled,
  show,
  idPrefix,
  autoFocus = false,
}) {
  const refs = useRef([]);

  const digits = useMemo(() => {
    const result = String(value || "")
      .replace(/\D/g, "")
      .slice(0, 6)
      .split("");

    while (result.length < 6) {
      result.push("");
    }

    return result;
  }, [value]);

  const updatePin = (nextDigits) => {
    onChange(
      nextDigits
        .map((digit) => String(digit || "").replace(/\D/g, ""))
        .join("")
        .slice(0, 6)
    );
  };

  const handleChange = (index, raw) => {
    const cleaned = String(raw || "").replace(/\D/g, "");

    if (!cleaned) {
      const next = digits.slice();
      next[index] = "";
      updatePin(next);
      return;
    }

    const next = digits.slice();

    if (cleaned.length > 1) {
      for (
        let i = 0;
        i < cleaned.length && index + i < 6;
        i += 1
      ) {
        next[index + i] = cleaned[i];
      }

      updatePin(next);

      const nextFocus = Math.min(index + cleaned.length, 5);
      refs.current[nextFocus]?.focus();
      return;
    }

    next[index] = cleaned.slice(-1);
    updatePin(next);

    if (index < 5) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace") {
      event.preventDefault();

      const next = digits.slice();

      if (next[index]) {
        next[index] = "";
        updatePin(next);
      } else if (index > 0) {
        next[index - 1] = "";
        updatePin(next);
        refs.current[index - 1]?.focus();
      }

      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      refs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < 5) {
      refs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event, index) => {
    event.preventDefault();

    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) return;

    const next = digits.slice();

    for (let i = 0; i < 6; i += 1) {
      next[i] = pasted[i] || "";
    }

    updatePin(next);
    refs.current[Math.min(index + pasted.length, 5)]?.focus();
  };

  return (
    <div className="flex items-center gap-2">
      {digits.map((digit, index) => {
        const filled = Boolean(digit);

        return (
          <input
            key={`${idPrefix}-${index}`}
            ref={(element) => {
              refs.current[index] = element;
            }}
            id={`${idPrefix}-${index}`}
            type={show ? "text" : "password"}
            inputMode="numeric"
            autoComplete="off"
            maxLength={6}
            value={digit}
            disabled={disabled}
            onChange={(event) =>
              handleChange(index, event.target.value)
            }
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={(event) => handlePaste(event, index)}
            onFocus={(event) => event.target.select()}
            autoFocus={autoFocus && index === 0}
            aria-label={`${idPrefix} digit ${index + 1}`}
            className={`h-12 w-full min-w-0 rounded-lg border text-center text-lg font-semibold outline-none transition sm:h-14 sm:text-xl ${
              filled
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
  const cocok =
    pinValid && konfirmasiValid && pin === konfirmasiPin;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setError("");
    setSuccess("");

    if (typeof window === "undefined") return;

    // Harus sama dengan key yang disimpan halaman login.
    const setupToken = window.sessionStorage.getItem(
      SETUP_TOKEN_KEY
    );

    if (!setupToken) {
      setError(
        "Sesi setup PIN tidak ditemukan. Silakan kembali ke login dan masuk kembali."
      );
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

    setLoading(true);

    try {
      const response = await setupPin(pin, setupToken);
      const result = getApiResult(response);

      if (!result || typeof result !== "object") {
        throw new Error("Respons server tidak valid.");
      }

      if (result.success === false) {
        throw new Error(
          result.message || "Gagal membuat PIN."
        );
      }

      // Endpoint setup PIN harus mengembalikan token akses dan data user.
      const accessToken =
        result.token ||
        result.accessToken ||
        result.access_token;

      const user =
        result.user ||
        result.pengguna ||
        result.data?.user;

      if (!accessToken) {
        throw new Error(
          result.message ||
            "Token akses tidak diterima dari server. Periksa response endpoint setup PIN."
        );
      }

      if (!user || typeof user !== "object") {
        throw new Error(
          "Data pengguna tidak diterima dari server. Periksa response endpoint setup PIN."
        );
      }

      const sessionUser = setSession(accessToken, user);

      if (!sessionUser) {
        throw new Error(
          "Sesi pengguna gagal dibuat. Silakan ulangi proses login."
        );
      }

      // Hapus token sementara setelah sesi berhasil dibuat.
      window.sessionStorage.removeItem(SETUP_TOKEN_KEY);
      window.sessionStorage.removeItem(PIN_TOKEN_KEY);

      // Bersihkan variabel global lama jika masih digunakan oleh kode lain.
      delete window.__SMARTSCHOOL_SETUP_TOKEN__;
      delete window.__SMARTSCHOOL_PIN_TOKEN__;

      const role =
        sessionUser.role ||
        user.role ||
        user.peran?.nama ||
        user.jabatan?.nama;

      const destination = getRoleHome(role);

      setSuccess(
        "PIN berhasil dibuat. Mengarahkan ke dashboard..."
      );

      router.replace(destination || "/login");
    } catch (err) {
      setError(
        err?.message ||
          "Gagal membuat PIN. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(SETUP_TOKEN_KEY);
      window.sessionStorage.removeItem(PIN_TOKEN_KEY);
      delete window.__SMARTSCHOOL_SETUP_TOKEN__;
      delete window.__SMARTSCHOOL_PIN_TOKEN__;
    }

    router.replace("/login");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-white px-4 py-8">
      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col items-center px-6 pb-5 pt-8 sm:px-8 sm:pt-9">
          <div className="flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28">
            <Image
              src="/logo/logoSS.png"
              alt="Logo SmartSchool"
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

        <form
          onSubmit={handleSubmit}
          className="px-6 pb-6 sm:px-8"
        >
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="pin-0"
                className="text-xs font-medium text-slate-700"
              >
                PIN baru
              </label>

              <button
                type="button"
                onClick={() => setShowPin((value) => !value)}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-sky-600"
                aria-label={
                  showPin ? "Sembunyikan PIN" : "Tampilkan PIN"
                }
              >
                {showPin ? (
                  <EyeOff size={13} />
                ) : (
                  <Eye size={13} />
                )}
                {showPin ? "Sembunyikan" : "Tampilkan"}
              </button>
            </div>

            <PinInput
              idPrefix="pin"
              value={pin}
              onChange={(value) => {
                setPin(value);
                setError("");
                setSuccess("");
              }}
              disabled={loading}
              show={showPin}
              autoFocus
            />
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="konfirmasi-0"
                className="text-xs font-medium text-slate-700"
              >
                Konfirmasi PIN
              </label>

              <button
                type="button"
                onClick={() =>
                  setShowKonfirmasi((value) => !value)
                }
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-sky-600"
                aria-label={
                  showKonfirmasi
                    ? "Sembunyikan konfirmasi PIN"
                    : "Tampilkan konfirmasi PIN"
                }
              >
                {showKonfirmasi ? (
                  <EyeOff size={13} />
                ) : (
                  <Eye size={13} />
                )}
                {showKonfirmasi ? "Sembunyikan" : "Tampilkan"}
              </button>
            </div>

            <PinInput
              idPrefix="konfirmasi"
              value={konfirmasiPin}
              onChange={(value) => {
                setKonfirmasiPin(value);
                setError("");
                setSuccess("");
              }}
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
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />
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
              onClick={handleBackToLogin}
              disabled={loading}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition hover:text-sky-600 disabled:opacity-50"
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

      <p className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 -translate-x-1/2 text-[11px] text-slate-400">
        © {new Date().getFullYear()} Yayasan Setya Bakti
      </p>
    </div>
  );
}
