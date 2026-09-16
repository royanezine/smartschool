"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
} from "lucide-react";

import { login } from "../../../services/auth.services";

export default function LoginForm() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [kataSandi, setKataSandi] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // ROLE ID
  // =====================================================

  const ROLE_IDS = {
    super_admin:
      "4da87e0a-a994-4fe7-87f1-cdb9f57078a8",

    admin_sekolah:
      "edeb2f0a-0486-47af-a0d7-536734c34f3e",

    guru:
      "11181899-51aa-4b53-8165-1fc87e022d81",

    siswa:
      "c643899d-6a7d-4552-a310-a39b6e9103ee",
  };

  // =====================================================
  // NORMALIZE ROLE
  // =====================================================

  const normalizeRole = (value) => {
    if (!value) {
      return "";
    }

    return String(value)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");
  };

  // =====================================================
  // DECODE JWT
  // =====================================================

  const decodeJwtPayload = (token) => {
    try {
      const parts = token.split(".");

      if (parts.length !== 3) {
        return null;
      }

      const base64Url = parts[1];

      const base64 = base64Url
        .replace(/-/g, "+")
        .replace(/_/g, "/");

      const paddedBase64 = base64.padEnd(
        base64.length +
          ((4 - (base64.length % 4)) % 4),
        "="
      );

      const decoded = window.atob(paddedBase64);

      const jsonPayload = decodeURIComponent(
        decoded
          .split("")
          .map(
            (char) =>
              "%" +
              (
                "00" +
                char.charCodeAt(0).toString(16)
              ).slice(-2)
          )
          .join("")
      );

      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error(
        "Gagal membaca payload JWT:",
        err
      );

      return null;
    }
  };

  // =====================================================
  // GET ROLE
  // =====================================================

  const getRoleFromPayload = (payload) => {
    if (!payload) {
      return "";
    }

    // Cek nama role terlebih dahulu
    const directRole =
      payload.role ||
      payload.jabatan ||
      payload.namaPeran ||
      payload.peran ||
      payload.roleName;

    if (directRole) {
      return normalizeRole(directRole);
    }

    // Cek role ID
    const roleId = String(
      payload.roleId || ""
    )
      .trim()
      .toLowerCase();

    if (!roleId) {
      return "";
    }

    if (
      roleId ===
      ROLE_IDS.super_admin.toLowerCase()
    ) {
      return "super_admin";
    }

    if (
      roleId ===
      ROLE_IDS.admin_sekolah.toLowerCase()
    ) {
      return "admin_sekolah";
    }

    if (
      roleId ===
      ROLE_IDS.guru.toLowerCase()
    ) {
      return "guru";
    }

    if (
      roleId ===
      ROLE_IDS.siswa.toLowerCase()
    ) {
      return "siswa";
    }

    return "";
  };

  // =====================================================
  // REDIRECT BERDASARKAN ROLE
  // =====================================================

  const getRedirectPath = (token) => {
    const payload = decodeJwtPayload(token);

    console.log(
      "========== JWT LOGIN =========="
    );

    console.log(
      "JWT PAYLOAD:",
      payload
    );

    if (!payload) {
      console.error(
        "JWT tidak bisa dibaca."
      );

      return "/login";
    }

    const role =
      getRoleFromPayload(payload);

    console.log(
      "ROLE ID:",
      payload.roleId
    );

    console.log(
      "ROLE TERDETEKSI:",
      role
    );

    switch (role) {
      case "super_admin":
        return "/super-admin";

      case "admin_sekolah":
        return "/admin/dashboard";

      case "guru":
        return "/guru";

      case "siswa":
        return "/siswa";

      case "orang_tua":
      case "orangtua":
        return "/orang-tua/dashboard";

      case "yayasan":
        return "/yayasan";

      default:
        console.error(
          "ROLE TIDAK DIKENALI:",
          payload
        );

        return "/admin/dashboard";
    }
  };

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    setError("");

    const loginIdentifier =
      identifier.trim();

    // ===================================================
    // VALIDATION
    // ===================================================

    if (!loginIdentifier) {
      setError(
        "Email atau username wajib diisi."
      );

      return;
    }

    if (!kataSandi) {
      setError(
        "Password wajib diisi."
      );

      return;
    }

    setLoading(true);

    try {
      // =================================================
      // PANGGIL AUTH SERVICE
      // =================================================

      const data = await login(
        loginIdentifier,
        kataSandi
      );

      console.log(
        "========== LOGIN RESPONSE =========="
      );

      console.log(
        "DATA:",
        data
      );

      // =================================================
      // AMBIL TOKEN
      // =================================================

      const token =
        data?.token;

      if (!token) {
        console.error(
          "TOKEN TIDAK DITEMUKAN:",
          data
        );

        throw new Error(
          "Token login tidak diterima dari server."
        );
      }

      // =================================================
      // DECODE TOKEN
      // =================================================

      const payload =
        decodeJwtPayload(token);

      if (!payload) {
        throw new Error(
          "Token login tidak valid."
        );
      }

      console.log(
        "========== USER LOGIN =========="
      );

      console.log(
        "USER ID:",
        payload.userId ||
          payload.id ||
          null
      );

      console.log(
        "EMAIL:",
        payload.email ||
          null
      );

      console.log(
        "ROLE ID:",
        payload.roleId ||
          null
      );

      console.log(
        "SEKOLAH ID:",
        payload.sekolahId ||
          null
      );

      console.log(
        "================================"
      );

      // =================================================
      // TENTUKAN ROLE
      // =================================================

      const role =
        getRoleFromPayload(
          payload
        );

      if (!role) {
        console.error(
          "ROLE TIDAK DAPAT DITENTUKAN:",
          payload
        );

        throw new Error(
          "Role pengguna tidak dapat ditentukan."
        );
      }

      // =================================================
      // USER INFO
      // =================================================

      const userInfo = {
        identifier:
          loginIdentifier,

        userId:
          payload.userId ??
          payload.id ??
          null,

        email:
          payload.email ??
          loginIdentifier ??
          null,

        sekolahId:
          payload.sekolahId ??
          payload.schoolId ??
          null,

        roleId:
          payload.roleId ??
          null,

        role,
      };

      // =================================================
      // CLEAN STORAGE
      // =================================================

      localStorage.removeItem(
        "token"
      );

      localStorage.removeItem(
        "user"
      );

      sessionStorage.removeItem(
        "token"
      );

      sessionStorage.removeItem(
        "user"
      );

      // =================================================
      // SAVE TOKEN
      // =================================================

      localStorage.setItem(
        "token",
        token
      );

      // =================================================
      // SAVE USER
      // =================================================

      localStorage.setItem(
        "user",
        JSON.stringify(userInfo)
      );

      // =================================================
      // REMEMBER ME
      // =================================================

      if (rememberMe) {
        localStorage.setItem(
          "remembered_identifier",
          loginIdentifier
        );
      } else {
        localStorage.removeItem(
          "remembered_identifier"
        );
      }

      // =================================================
      // CLEAR ONBOARDING
      // =================================================

      sessionStorage.removeItem(
        "onboarding_email"
      );

      sessionStorage.removeItem(
        "onboarding_paket_id"
      );

      sessionStorage.removeItem(
        "onboarding_pendaftaran_id"
      );

      sessionStorage.removeItem(
        "onboarding_payment_url"
      );

      // =================================================
      // REDIRECT
      // =================================================

      const redirectPath =
        getRedirectPath(token);

      console.log(
        "========== LOGIN BERHASIL =========="
      );

      console.log(
        "ROLE:",
        role
      );

      console.log(
        "REDIRECT:",
        redirectPath
      );

      console.log(
        "===================================="
      );

      router.replace(
        redirectPath
      );
    } catch (err) {
      console.error(
        "LOGIN ERROR:",
        err
      );

      setError(
        err?.message ||
          "Terjadi kesalahan saat login."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // REMEMBERED IDENTIFIER
  // =====================================================

  const handleIdentifierFocus = () => {
    if (identifier) {
      return;
    }

    const remembered =
      localStorage.getItem(
        "remembered_identifier"
      );

    if (remembered) {
      setIdentifier(
        remembered
      );
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="w-full">
      <div className="rounded-2xl bg-white p-5 shadow-2xl sm:p-6">

        {/* HEADER */}

        <div className="mb-6 text-center">

          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-lg shadow-blue-500/20">

            <Image
              src="/logo/logoSS.png"
              alt="Smart School Logo"
              width={32}
              height={32}
              className="object-contain"
            />

          </div>

          <h2 className="text-xl font-bold text-slate-800">
            Masuk ke Akun
          </h2>

          <p className="mt-0.5 text-xs text-gray-500">
            Masukkan email/username
            dan password
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5">

            <AlertCircle
              size={16}
              className="mt-0.5 shrink-0 text-red-500"
            />

            <p className="text-xs leading-5 text-red-600">
              {error}
            </p>

          </div>
        )}

        {/* FORM */}

        <form
          onSubmit={handleLogin}
          className="space-y-4"
        >

          {/* IDENTIFIER */}

          <div>

            <label
              htmlFor="identifier"
              className="mb-1.5 block text-xs font-semibold text-slate-700"
            >
              Email atau Username
            </label>

            <div className="relative">

              <Mail
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) =>
                  setIdentifier(
                    e.target.value
                  )
                }
                onFocus={
                  handleIdentifierFocus
                }
                placeholder="Masukkan email atau username"
                disabled={loading}
                autoComplete="username"
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3.5 text-sm text-black outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50"
              />

            </div>

          </div>

          {/* PASSWORD */}

          <div>

            <div className="mb-1.5 flex items-center justify-between">

              <label
                htmlFor="password"
                className="text-xs font-semibold text-slate-700"
              >
                Password
              </label>

              <Link
                href="/forgot-password"
                className="text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
              >
                Lupa password?
              </Link>

            </div>

            <div className="relative">

              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="password"
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
                placeholder="Masukkan password"
                disabled={loading}
                autoComplete="current-password"
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm text-black outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (prev) => !prev
                  )
                }
                disabled={loading}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                aria-label={
                  showPassword
                    ? "Sembunyikan password"
                    : "Tampilkan password"
                }
              >
                {showPassword ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>

            </div>

          </div>

          {/* REMEMBER ME */}

          <div className="flex items-center gap-2">

            <input
              id="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) =>
                setRememberMe(
                  e.target.checked
                )
              }
              disabled={loading}
              className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />

            <label
              htmlFor="remember"
              className="text-xs text-slate-600"
            >
              Ingat saya
            </label>

          </div>

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:from-blue-300 disabled:to-indigo-300"
          >

            {loading ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />

                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>

                Memproses...
              </>
            ) : (
              <>
                <LogIn size={16} />
                Masuk
              </>
            )}

          </button>

          {/* DIVIDER */}

          <div className="relative">

            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>

            <div className="relative flex justify-center">

              <span className="bg-white px-3 text-xs text-gray-400">
                atau
              </span>

            </div>

          </div>

          {/* GOOGLE */}

          <button
            type="button"
            disabled={loading}
            onClick={() =>
              setError(
                "Login dengan Google belum tersedia pada backend saat ini."
              )
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-50"
          >

            <GoogleIcon />

            Masuk dengan Google

          </button>

        </form>
      </div>
    </div>
  );
}

// =====================================================
// GOOGLE ICON
// =====================================================

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42 0-.7-.06-1.38-.17-2.04Z"
      />

      <path
        fill="#34A853"
        d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.75 9.75 0 0 0 12 21.75Z"
      />

      <path
        fill="#FBBC05"
        d="M6.54 13.83a5.87 5.87 0 0 1 0-3.66V7.64H3.3a9.76 9.76 0 0 0 0 8.72l3.24-2.53 3.24 2.53Z"
      />

      <path
        fill="#EA4335"
        d="M12 6.14c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.2 14.63 2.25 12 2.25A9.75 9.75 0 0 0 3.3 7.64l3.24 2.53C7.31 7.86 9.46 6.14 12 6.14Z"
      />
    </svg>
  );
}