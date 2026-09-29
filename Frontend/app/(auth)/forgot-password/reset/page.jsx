"use client";

import { useState, useEffect } from "react";
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
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [kodeOtp, setKodeOtp] = useState("");

  const [kataSandi, setKataSandi] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirm,
    setShowConfirm,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  useEffect(() => {
    const savedEmail =
      sessionStorage.getItem(
        "forgot_password_email",
      );

    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError(
        "Email wajib diisi.",
      );
      return;
    }

    if (!kodeOtp) {
      setError(
        "Kode OTP wajib diisi.",
      );
      return;
    }

    if (kodeOtp.length !== 6) {
      setError(
        "Kode OTP harus terdiri dari 6 digit.",
      );
      return;
    }

    if (!kataSandi) {
      setError(
        "Password baru wajib diisi.",
      );
      return;
    }

    if (kataSandi.length < 8) {
      setError(
        "Password minimal 8 karakter.",
      );
      return;
    }

    if (!/[A-Z]/.test(kataSandi)) {
      setError(
        "Password harus mengandung minimal 1 huruf kapital.",
      );
      return;
    }

    if (!/[0-9]/.test(kataSandi)) {
      setError(
        "Password harus mengandung minimal 1 angka.",
      );
      return;
    }

    if (
      kataSandi !==
      confirmPassword
    ) {
      setError(
        "Konfirmasi password tidak sama.",
      );
      return;
    }

    try {
      setLoading(true);

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL;

      if (!API_URL) {
        throw new Error(
          "NEXT_PUBLIC_API_URL belum dikonfigurasi.",
        );
      }

      const response =
        await fetch(
          `${API_URL}/api/auth/atur-ulang-kata-sandi`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            body: JSON.stringify({
              email:
                email.trim(),

              kodeOtp,

              kataSandi,
            }),
          },
        );

      let data = null;

      try {
        data =
          await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Gagal mengatur ulang password.",
        );
      }

      sessionStorage.removeItem(
        "forgot_password_email",
      );

      setSuccess(
        data?.message ||
          "Password berhasil diubah. Mengarahkan ke login...",
      );

      setTimeout(() => {
        router.push(
          "/login",
        );
      }, 1500);
    } catch (err) {
      console.error(
        "RESET PASSWORD ERROR:",
        err,
      );

      setError(
        err?.message ||
          "Terjadi kesalahan saat mengatur ulang password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
      {/* BACKGROUND */}
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

      {/* TOP ACCENT */}
      <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500" />

      {/* CONTENT */}
      <div className="relative z-10 w-full max-w-md px-6 py-10">
        {/* LOGO */}
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

        {/* CARD */}
        <div className="rounded-3xl bg-white p-7 shadow-2xl">
          {/* HEADER */}
          <div className="mb-7 text-center">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
              <ShieldCheck
                size={27}
                className="text-blue-600"
              />
            </div>

            <h1 className="text-2xl font-bold text-slate-800">
              Atur Ulang Password
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Masukkan kode OTP dan
              password baru untuk akun
              kamu.
            </p>
          </div>

          {/* ERROR */}
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

          {/* SUCCESS */}
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

          <form
            onSubmit={handleSubmit}
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
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value,
                    )
                  }
                  placeholder="Email akun"
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50"
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
                value={kodeOtp}
                onChange={(e) =>
                  setKodeOtp(
                    e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 6),
                  )
                }
                placeholder="Masukkan 6 digit OTP"
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-lg font-bold tracking-[0.45em] text-slate-800 outline-none placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-700">
                Password Baru
              </label>

              <div className="relative">
                <Lock
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
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
                      e.target.value,
                    )
                  }
                  placeholder="Minimal 8 karakter"
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (prev) =>
                        !prev,
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
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type={
                    showConfirm
                      ? "text"
                      : "password"
                  }
                  value={
                    confirmPassword
                  }
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value,
                    )
                  }
                  placeholder="Ulangi password baru"
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-11 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirm(
                      (prev) =>
                        !prev,
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

            {/* BUTTON */}
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
                  <ShieldCheck
                    size={17}
                  />
                  Simpan Password Baru
                </>
              )}
            </button>

            {/* BACK */}
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 pt-2 text-xs font-semibold text-slate-500 transition hover:text-blue-600"
            >
              <ArrowLeft
                size={15}
              />
              Kembali ke login
            </Link>
          </form>
        </div>

        {/* FOOTER */}
        <p className="mt-5 text-center text-[11px] text-white/50">
          © 2026 Smart School. Semua hak
          dilindungi.
        </p>
      </div>
    </section>
  );
}