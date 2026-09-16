"use client";

import Image from "next/image";
import Link from "next/link";

import {
  GraduationCap,
  BarChart3,
  ShieldCheck,
  Users,
} from "lucide-react";

import LoginForm from "../components/auth/LoginForm";

export default function LoginPage() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">

      {/* BACKGROUND */}

      <div className="absolute inset-0">
        <Image
          src="/hero/hero.png"
          alt="Smart School"
          fill
          priority
          className="object-cover"
        />
      </div>

      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse at 30% 50%,
              rgba(255,255,255,0.08) 0%,
              rgba(255,255,255,0.04) 30%,
              rgba(255,255,255,0.02) 55%,
              rgba(255,255,255,0) 75%,
              rgba(255,255,255,0.03) 100%
            )
          `,
        }}
      />

      {/* CONTENT */}

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">

        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">

          {/* LEFT */}

          <div className="space-y-5">

            {/* LOGO */}

            <div className="flex items-center gap-3">

              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/50 bg-white/90 shadow-xl backdrop-blur-sm">

                <Image
                  src="/logo/logoSS.png"
                  alt="Smart School Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />

              </div>

              <span className="text-2xl font-extrabold text-white drop-shadow-[0_3px_8px_rgba(15,23,42,0.75)]">

                SMART{" "}

                <span className="text-blue-300">
                  SCHOOL
                </span>

              </span>

            </div>

            {/* TITLE */}

            <div className="space-y-4">

              <h1 className="text-4xl font-extrabold leading-tight text-white drop-shadow-[0_4px_10px_rgba(15,23,42,0.8)] sm:text-5xl">

                Selamat Datang
                <br />

                <span className="text-blue-300">
                  Kembali!
                </span>

              </h1>

              <p className="max-w-md text-sm font-medium leading-relaxed text-white drop-shadow-[0_3px_8px_rgba(15,23,42,0.75)] sm:text-base">
                Masuk ke akun Anda untuk
                mengelola seluruh aktivitas
                sekolah dengan mudah.
              </p>

            </div>

            {/* FEATURES */}

            <div className="flex flex-wrap gap-2">

              {[
                {
                  icon: GraduationCap,
                  label: "Efisien",
                },
                {
                  icon: BarChart3,
                  label: "Terintegrasi",
                },
                {
                  icon: ShieldCheck,
                  label: "Aman",
                },
                {
                  icon: Users,
                  label: "Kolaboratif",
                },
              ].map(
                ({
                  icon: Icon,
                  label,
                }) => (
                  <div
                    key={label}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 shadow-lg backdrop-blur-md"
                  >
                    <Icon
                      size={14}
                      className="text-blue-300"
                    />

                    <span className="text-xs font-semibold text-white">
                      {label}
                    </span>
                  </div>
                )
              )}

            </div>

            {/* REGISTER */}

            <p className="text-sm text-white/80">

              Belum punya akun?{" "}

              <Link
                href="/register"
                className="font-semibold text-blue-300 transition-colors duration-200 hover:text-white hover:underline"
              >
                Daftar di sini
              </Link>

            </p>

          </div>

          {/* LOGIN */}

          <div className="flex justify-center lg:justify-end">

            <div className="w-full max-w-sm">

              <LoginForm />

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}