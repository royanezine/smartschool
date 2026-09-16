"use client";

import { useState } from "react";
import Image from "next/image";
import {
  GraduationCap,
  BarChart3,
  ShieldCheck,
  Users,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <section className="relative overflow-hidden min-h-screen flex items-center bg-white">

      {/* Background image */}
      <Image
        src="/hero/hero.png"
        alt="Smart School"
        fill
        priority
        className="object-cover"
      />

      {/* Overlay gradient - blends photo with white on both sides */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.55) 25%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.35) 100%)",
        }}
      ></div>

      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400"></div>

      <div className="relative w-full max-w-6xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-2 items-center gap-8">

          {/* LEFT — text content */}
          <div>

            {/* Logo */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <GraduationCap className="text-white" size={17} />
              </div>
              <span className="font-bold text-base text-slate-900">
                SMART <span className="text-blue-600">SCHOOL</span>
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight text-slate-900">
              Selamat Bergabung di
              <br />
              <span className="text-blue-600">Smart School</span>
            </h1>

            {/* Description */}
            <p className="mt-3 text-gray-600 leading-6 text-sm max-w-md">
              Buat akun untuk mengakses berbagai fitur dan layanan
              pembelajaran yang terintegrasi dalam satu platform.
            </p>

            {/* Feature pills */}
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                { icon: GraduationCap, label: "Efisien" },
                { icon: BarChart3, label: "Terintegrasi" },
                { icon: ShieldCheck, label: "Aman" },
                { icon: Users, label: "Kolaboratif" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 bg-white/70 backdrop-blur-sm border border-white/80 rounded-lg px-3 py-1.5"
                >
                  <Icon size={14} className="text-blue-600" />
                  <span className="text-xs font-semibold text-slate-800">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Login link */}
            <p className="mt-5 text-xs text-slate-600">
              Sudah punya akun?{" "}
              <a href="#" className="text-blue-600 font-semibold hover:underline">
                Masuk di sini
              </a>
            </p>

          </div>

          {/* RIGHT — register card */}
          <div className="lg:justify-self-end w-full max-w-sm">
            <div className="bg-white rounded-2xl shadow-xl p-6">

              {/* Card header */}
              <div className="flex flex-col items-center text-center mb-4">
                <div className="w-11 h-11 rounded-lg bg-blue-600 flex items-center justify-center mb-2">
                  <GraduationCap className="text-white" size={22} />
                </div>
                <h2 className="font-bold text-base text-slate-900">
                  SMART <span className="text-blue-600">SCHOOL</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Buat akun baru</p>
              </div>

              <form className="space-y-3">

                {/* Nama Lengkap */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Masukkan nama lengkap Anda"
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-xs placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="email"
                      placeholder="Masukkan email Anda"
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-xs placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Buat password"
                      className="w-full pl-9 pr-9 py-2 rounded-lg border border-gray-200 text-xs placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Konfirmasi Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Konfirmasi password"
                      className="w-full pl-9 pr-9 py-2 rounded-lg border border-gray-200 text-xs placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Terms checkbox */}
                <div className="flex items-start gap-2 pt-0.5">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="mt-0.5 w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="text-[11px] text-gray-600 leading-relaxed">
                    Saya setuju dengan{" "}
                    <a href="#" className="text-blue-600 font-medium hover:underline">
                      Syarat & Ketentuan
                    </a>{" "}
                    dan{" "}
                    <a href="#" className="text-blue-600 font-medium hover:underline">
                      Kebijakan Privasi
                    </a>
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-lg transition duration-300 shadow-lg"
                >
                  <User size={16} />
                  Daftar
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 py-0.5">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-[11px] text-gray-400">atau</span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                {/* Google button */}
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-slate-700 text-sm font-medium py-2.5 rounded-lg transition duration-300"
                >
                  <GoogleIcon />
                  Daftar dengan Google
                </button>

              </form>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20.4H24v7.2h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.1-5.1C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l5.9 4.3C13.7 15.5 18.5 12 24 12c3.1 0 5.9 1.2 8 3.1l5.1-5.1C34.6 6.1 29.6 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.5 0 10.4-2.1 14.2-5.5l-6.6-5.4C29.7 34.8 27 36 24 36c-5.2 0-9.6-3.3-11.2-8l-6.6 5.1C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20.4H24v7.2h11.3c-.8 2.3-2.2 4.2-4 5.6l6.6 5.4C41.8 35.4 44 30.3 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  );
}