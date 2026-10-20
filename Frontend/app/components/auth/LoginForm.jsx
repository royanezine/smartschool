"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Check,
} from "lucide-react";

import { login } from "@/services/auth.services";
import { setSession, clearSession, normalizeRole, getRoleHome } from "@/lib/auth";

/*
 * Ukuran diukur dari gambar referensi (lebar 1746px).
 * --u didefinisikan di page.jsx (1px di HP, ikut skala di desktop).
 */
const u = (n) => `calc(var(--u, 1px) * ${n})`;

export default function LoginForm() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [kataSandi, setKataSandi] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailFromUrl = params.get("email");

    const savedEmail =
      localStorage.getItem("onboarding_email") ||
      localStorage.getItem("tenant_register_email");

    const email = emailFromUrl || savedEmail;

    if (email) {
      setIdentifier(email);
    }

    if (params.get("sessionExpired") === "1") {
      setError(
        "Sesi Anda telah berakhir karena token kedaluwarsa. Silakan login kembali."
      );

      // Bersihkan penanda dari URL tanpa reload.
      params.delete("sessionExpired");

      const query = params.toString();
      const cleanUrl =
        window.location.pathname +
        (query ? `?${query}` : "") +
        window.location.hash;

      window.history.replaceState(null, "", cleanUrl);
    }
  }, []);

  const ROLE_IDS = {
    super_admin: "4da87e0a-a994-4fe7-87f1-cdb9f57078a8",
    admin_sekolah: "edeb2f0a-0486-47af-a0d7-536734c34f3e",
    guru: "11181899-51aa-4b53-8165-1fc87e022d81",
    siswa: "c643899d-6a7d-4552-a310-a39b6e9103ee",
  };

  // =====================================================
  // DECODE JWT
  // =====================================================

  const decodeJwtPayload = (token) => {
    try {
      const parts = token.split(".");

      if (parts.length !== 3) return null;

      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");

      const paddedBase64 = base64.padEnd(
        base64.length + ((4 - (base64.length % 4)) % 4),
        "="
      );

      const decoded = window.atob(paddedBase64);

      const jsonPayload = decodeURIComponent(
        decoded
          .split("")
          .map(
            (char) =>
              "%" + ("00" + char.charCodeAt(0).toString(16)).slice(-2)
          )
          .join("")
      );

      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error("Gagal membaca payload JWT:", err);
      return null;
    }
  };

  // =====================================================
  // GET ROLE
  // =====================================================

  const getRoleFromPayload = (payload) => {
    if (!payload) return "";

    const directRole =
      payload.role ||
      payload.jabatan ||
      payload.namaPeran ||
      payload.peran ||
      payload.roleName;

    if (directRole) {
      const roleValue =
        typeof directRole === "object"
          ? directRole.nama || directRole.name || directRole.namaPeran
          : directRole;

      return normalizeRole(roleValue);
    }

    const roleId = String(payload.roleId || payload.peranId || "")
      .trim()
      .toLowerCase();

    if (!roleId) return "";

    if (roleId === ROLE_IDS.super_admin.toLowerCase()) return "super_admin";
    if (roleId === ROLE_IDS.admin_sekolah.toLowerCase()) return "admin_sekolah";
    if (roleId === ROLE_IDS.guru.toLowerCase()) return "guru";
    if (roleId === ROLE_IDS.siswa.toLowerCase()) return "siswa";

    return "";
  };

  // =====================================================
  // REDIRECT BERDASARKAN ROLE
  // =====================================================

  const getRedirectPath = (role) => {
    if (role === "orang_tua" || role === "orangtua") {
      return "/orang-tua/dashboard";
    }

    const home = getRoleHome(role);

    return home && home !== "/login" ? home : "/admin/dashboard";
  };

  // =====================================================
  // HANDLE LOGIN
  // =====================================================

  // Request ID untuk mencegah response API lama menimpa sesi baru.
  const requestIdRef = useRef(0);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");

    const loginIdentifier = identifier.trim();

    if (!loginIdentifier) {
      setError("Email atau username wajib diisi.");
      return;
    }

    if (!kataSandi) {
      setError("Password wajib diisi.");
      return;
    }

    setLoading(true);

    const currentRequestId = ++requestIdRef.current;

    try {
      sessionStorage.removeItem("pin_setup_token");
      sessionStorage.removeItem("pin_access_token");

      const data = await login(loginIdentifier, kataSandi);

      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      console.log("LOGIN: respons diterima dari server.");

      const response = data?.data?.data ?? data?.data ?? data;

      if (!response || typeof response !== "object") {
        throw new Error("Format respons login dari server tidak valid.");
      }

      // 1. SISWA BELUM MEMILIKI PIN
      if (response.requiresPinSetup === true) {
        const setupToken = response.setupToken;

        if (!setupToken) {
          throw new Error("Token pembuatan PIN tidak diterima dari server.");
        }

        clearSession();
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        sessionStorage.setItem("pin_setup_token", setupToken);
        sessionStorage.removeItem("pin_access_token");

        router.replace("/pin/setup");
        return;
      }

      // 2. SISWA SUDAH MEMILIKI PIN
      if (response.requiresPin === true) {
        const pinToken = response.pinToken;

        if (!pinToken) {
          throw new Error("Token verifikasi PIN tidak diterima dari server.");
        }

        clearSession();
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        sessionStorage.setItem("pin_access_token", pinToken);
        sessionStorage.removeItem("pin_setup_token");

        router.replace("/pin/verify");
        return;
      }

      // 3. LOGIN NORMAL
      const token = response.token;

      if (!token) {
        throw new Error(
          response.message || "Token login tidak diterima dari server."
        );
      }

      const payload = decodeJwtPayload(token);

      if (!payload) {
        throw new Error("Token login tidak valid.");
      }

      const userData = response.user ?? {};

      const rolePayload = {
        ...payload,
        role: userData.role ?? payload.role,
        roleId: userData.roleId ?? userData.peranId ?? payload.roleId,
        peranId: userData.peranId ?? payload.peranId,
      };

      const role =
        getRoleFromPayload(rolePayload) || getRoleFromPayload(userData);

      if (!role) {
        console.error("Role pengguna tidak dikenali.");

        throw new Error(
          "Role pengguna tidak dapat ditentukan. Periksa data role dari Backend."
        );
      }

      const userId = userData.id ?? payload.userId ?? payload.id ?? null;

      const userInfo = {
        id: userId,
        userId,
        identifier: loginIdentifier,
        namaLengkap: userData.namaLengkap ?? payload.namaLengkap ?? "",
        namaPengguna: userData.namaPengguna ?? payload.namaPengguna ?? "",
        email: userData.email ?? payload.email ?? "",
        sekolahId: payload.sekolahId ?? userData.sekolahId ?? null,
        yayasanId: payload.yayasanId ?? userData.yayasanId ?? null,
        roleId:
          payload.roleId ??
          payload.peranId ??
          userData.roleId ??
          userData.peranId ??
          null,
        role,
      };

      clearSession();
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      setSession(token, userInfo);

      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      if (rememberMe) {
        localStorage.setItem("remembered_identifier", loginIdentifier);
      } else {
        localStorage.removeItem("remembered_identifier");
      }

      sessionStorage.removeItem("onboarding_email");
      sessionStorage.removeItem("onboarding_paket_id");
      sessionStorage.removeItem("onboarding_pendaftaran_id");
      sessionStorage.removeItem("onboarding_payment_url");

      const redirectPath = getRedirectPath(role);

      console.log("LOGIN BERHASIL:", { role, redirectPath });

      router.replace(redirectPath);
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      setError(err?.message || "Terjadi kesalahan saat login.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // REMEMBERED IDENTIFIER
  // =====================================================

  const handleIdentifierFocus = () => {
    if (identifier) return;

    const remembered = localStorage.getItem("remembered_identifier");

    if (remembered) {
      setIdentifier(remembered);
    }
  };

  // =====================================================
  // RENDER (presisi mengikuti referensi)
  // =====================================================

  const inputClass =
    "w-full rounded-full border border-[#E3E8F0] bg-[#FAFBFD] text-[#1E293B] outline-none transition-all duration-200 placeholder:text-[#9AA6B8] focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/15 disabled:cursor-not-allowed disabled:bg-slate-50";

  const inputStyle = {
    height: u(48),
    fontSize: u(14.5),
    paddingLeft: u(54),
  };

  const iconStyle = { width: u(18), height: u(18) };

  return (
    <div
      className="bg-white/[0.96] shadow-[0_24px_60px_-12px_rgba(16,45,104,0.22)] backdrop-blur-md"
      style={{
        width: `min(100%, ${u(487)})`,
        borderRadius: u(20),
        padding: `${u(35)} ${u(32)} ${u(33)}`,
      }}
    >
      {/* HEADER */}
      <div className="text-center" style={{ marginBottom: u(17) }}>
        <div
          className="mx-auto flex items-center justify-center bg-[#EAF2FF]"
          style={{ width: u(62), height: u(62), borderRadius: u(16) }}
        >
          <Image
            src="/logo/logoSS.png"
            alt="Smart School Logo"
            width={40}
            height={40}
            className="object-contain"
            style={{ width: u(40), height: u(40) }}
          />
        </div>

        <h2
          className="font-bold text-[#0F2A66]"
          style={{ marginTop: u(6), fontSize: u(28), lineHeight: u(36) }}
        >
          Masuk ke Akun
        </h2>

        <p
          className="text-[#4A5B78]"
          style={{ marginTop: u(3), fontSize: u(14.5), lineHeight: u(21) }}
        >
          Masukkan email/username dan password
          <br />
          untuk melanjutkan
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div
          className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-3.5 py-2.5"
          style={{ marginBottom: u(16) }}
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
          <p className="text-xs leading-5 text-red-600">{error}</p>
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleLogin}>
        {/* IDENTIFIER */}
        <div>
          <label
            htmlFor="identifier"
            className="block font-semibold text-[#0F2A66]"
            style={{ marginBottom: u(8), fontSize: u(14.5), lineHeight: u(20) }}
          >
            Email atau Username
          </label>

          <div className="relative">
            <Mail
              strokeWidth={1.7}
              className="absolute top-1/2 -translate-y-1/2 text-[#5B6B84]"
              style={{ ...iconStyle, left: u(17) }}
            />

            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              onFocus={handleIdentifierFocus}
              placeholder="contoh: siti.rahayu@smartschool.com"
              disabled={loading}
              autoComplete="username"
              className={inputClass}
              style={{ ...inputStyle, paddingRight: u(16) }}
            />
          </div>
        </div>

        {/* PASSWORD */}
        <div style={{ marginTop: u(17) }}>
          <div
            className="flex items-center justify-between"
            style={{ marginBottom: u(8), height: u(20) }}
          >
            <label
              htmlFor="password"
              className="font-semibold text-[#0F2A66]"
              style={{ fontSize: u(14.5) }}
            >
              Password
            </label>

            <Link
              href="/forgot-password"
              className="font-semibold text-[#2563EB] transition-colors hover:text-[#1D4ED8]"
              style={{ fontSize: u(13.5) }}
            >
              Lupa password?
            </Link>
          </div>

          <div className="relative">
            <Lock
              strokeWidth={1.7}
              className="absolute top-1/2 -translate-y-1/2 text-[#5B6B84]"
              style={{ ...iconStyle, left: u(17) }}
            />

            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={kataSandi}
              onChange={(e) => setKataSandi(e.target.value)}
              placeholder="Masukkan password"
              disabled={loading}
              autoComplete="current-password"
              className={inputClass}
              style={{ ...inputStyle, paddingRight: u(50) }}
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={loading}
              className="absolute top-1/2 -translate-y-1/2 text-[#5B6B84] transition-colors hover:text-slate-800"
              style={{ right: u(18) }}
              aria-label={
                showPassword ? "Sembunyikan password" : "Tampilkan password"
              }
            >
              {showPassword ? (
                <EyeOff strokeWidth={1.7} style={iconStyle} />
              ) : (
                <Eye strokeWidth={1.7} style={iconStyle} />
              )}
            </button>
          </div>
        </div>

        {/* REMEMBER ME */}
        <label
          htmlFor="remember"
          className="flex w-fit cursor-pointer items-center"
          style={{ marginTop: u(15), gap: u(11) }}
        >
          <input
            id="remember"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={loading}
            className="peer sr-only"
          />

          <span
            className="flex items-center justify-center border border-slate-300 bg-white text-white peer-checked:border-[#2563EB] peer-checked:bg-[#2563EB] peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500/40"
            style={{ width: u(19), height: u(19), borderRadius: u(5) }}
          >
            {rememberMe && <Check strokeWidth={3.2} size="72%" />}
          </span>

          <span className="text-[#3F4E69]" style={{ fontSize: u(13.5) }}>
            Ingat saya
          </span>
        </label>

        {/* LOGIN BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-full bg-[#2062EA] font-bold text-white shadow-[0_10px_22px_-8px_rgba(32,98,234,0.65)] transition-colors duration-200 hover:bg-[#1A52CC] disabled:cursor-not-allowed disabled:bg-blue-300 disabled:shadow-none"
          style={{
            marginTop: u(16),
            height: u(49),
            fontSize: u(18),
            gap: u(10),
          }}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin"
                viewBox="0 0 24 24"
                style={{ width: u(18), height: u(18) }}
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
              <ArrowRight strokeWidth={2.4} style={{ width: u(21), height: u(21) }} />
              Masuk
            </>
          )}
        </button>

        {/* DIVIDER */}
        <div
          className="relative flex items-center justify-center"
          style={{ marginTop: u(17), height: u(20) }}
        >
          <div className="absolute inset-x-0 top-1/2 border-t border-[#E3E8F0]" />
          <span
            className="relative bg-[#FDFDFE] text-[#64748B]"
            style={{ padding: `0 ${u(16)}`, fontSize: u(14) }}
          >
            atau
          </span>
        </div>

        {/* GOOGLE */}
        <button
          type="button"
          disabled={loading}
          onClick={() =>
            setError("Login dengan Google belum tersedia pada backend saat ini.")
          }
          className="flex w-full items-center justify-center rounded-full border border-[#E3E8F0] bg-white font-bold text-[#0F2A66] transition-colors duration-200 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-50"
          style={{
            marginTop: u(16),
            height: u(49),
            fontSize: u(15.5),
            gap: u(12),
          }}
        >
          <GoogleIcon />
          Masuk dengan Google
        </button>
      </form>
    </div>
  );
}

// =====================================================
// GOOGLE ICON
// =====================================================

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ width: u(22), height: u(22) }}
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