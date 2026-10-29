"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";
import { GraduationCap, ArrowLeft } from "lucide-react";

import { login } from "@/services/auth.service";
import LoginForm from "@/app/components/auth/LoginForm";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const u = (n) => `calc(var(--u) * ${n})`;

const ICONS = {
  siswa:
    "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
  jadwal:
    "M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z",
  absensi:
    "M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z",
  kolaborasi:
    "M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73 1.17-.52 2.61-.91 4.24-.91zM4 13c1.1 0 2-.9 2-2 0-1.1-.9-2-2-2s-2 .9-2 2c0 1.1.9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1-.99 0-1.93.21-2.78.58C.48 14.9 0 15.62 0 16.43V18h4.5v-1.61c0-.83.23-1.61.63-2.29zM20 13c1.1 0 2-.9 2-2 0-1.1-.9-2-2-2s-2 .9-2 2c0 1.1.9 2 2 2zm4 3.43c0-.81-.48-1.53-1.22-1.85-.85-.37-1.79-.58-2.78-.58-.39 0-.76.04-1.13.1.4.68.63 1.46.63 2.29V18H24v-1.57zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z",
};

const features = [
  { icon: ICONS.siswa, label: "Manajemen", secondLine: "Siswa", width: 117, padLeft: 0 },
  { icon: ICONS.jadwal, label: "Jadwal &", secondLine: "Kurikulum", width: 144, padLeft: 38 },
  { icon: ICONS.absensi, label: "Absensi &", secondLine: "Penilaian", width: 148, padLeft: 38 },
  { icon: ICONS.kolaborasi, label: "Kolaborasi", secondLine: "Sekolah", width: undefined, padLeft: 54 },
];

const glow = "[text-shadow:0_0_14px_rgba(255,255,255,0.95),0_0_4px_rgba(255,255,255,0.9)]";

export default function LoginPage() {
  return (
    <main className={`${jakarta.className} relative isolate min-h-screen overflow-hidden bg-[#EAF3FF]`}>
      <style>{`
        :root { --u: 1px; }
        @media (min-width: 1024px) {
          :root { --u: clamp(0.65px, calc(100vw / 1746), 1px); }
          .ss-left  { margin-top: calc(var(--u) * 14); }
          .ss-right { margin-top: calc(var(--u) * 68); }
          .ss-logo  { left: 4.9% !important; top: calc(var(--u) * 50) !important; }
        }
      `}</style>

      <div className="absolute inset-0 -z-30">
        <Image
          src="/hero/hero.png"
          alt="Gedung Smart School"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      <div className="absolute inset-0 -z-20 bg-gradient-to-r from-white/80 via-white/50 to-white/0 lg:via-white/55" />
      <div className="absolute inset-x-0 top-0 -z-20 h-44 bg-gradient-to-b from-white/70 to-transparent" />

      <div
        className="ss-logo absolute z-10 flex items-center"
        style={{ left: 20, top: 20, gap: u(16) }}
      >
        <Link
          href="/"
          aria-label="Kembali"
          className="flex items-center justify-center rounded-full bg-white text-[#0F2A66] shadow-lg shadow-[#0F2A66]/15 ring-1 ring-[#0F2A66]/10 transition-all hover:bg-[#0F2A66] hover:text-white"
          style={{ width: u(48), height: u(48) }}
        >
          <ArrowLeft style={{ width: u(24), height: u(24) }} strokeWidth={2.5} />
        </Link>

        <Link
          href="/"
          aria-label="Smart School Beranda"
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          <Image
            src="/logo/logoSS.png"
            alt="Logo Smart School"
            width={48}
            height={48}
            priority
            className="object-contain drop-shadow-[0_2px_6px_rgba(255,255,255,0.9)]"
            style={{ width: u(48), height: u(48) }}
          />
          <span
            className={`font-extrabold text-[#0B1F4F] ${glow}`}
            style={{ fontSize: u(24), letterSpacing: "-0.01em", lineHeight: 1 }}
          >
            SMART <span className="text-[#1F6AE0]">SCHOOL</span>
          </span>
        </Link>
      </div>

      <div className="relative flex min-h-screen w-full items-center justify-center px-5 pb-8 pt-24 lg:justify-start lg:p-0">
        <section
          className="ss-left hidden shrink-0 flex-col lg:flex"
          style={{ width: "58.8%", paddingLeft: "9.1%" }}
        >
          <div
            className="flex w-fit items-center rounded-full bg-white font-bold text-[#0B1F4F] shadow-lg shadow-[#0F2A66]/15 ring-1 ring-[#0F2A66]/10"
            style={{
              height: u(42),
              padding: `0 ${u(20)}`,
              gap: u(10),
              fontSize: u(16),
            }}
          >
            <GraduationCap
              strokeWidth={2.5}
              style={{ width: u(22), height: u(22) }}
              className="text-[#1F6AE0]"
            />
            <span>Sistem Informasi Sekolah</span>
          </div>

          <h1
            className={`font-extrabold text-[#0B1F4F] ${glow}`}
            style={{
              marginTop: u(16),
              fontSize: `clamp(40px, ${u(64)}, 64px)`,
              lineHeight: `clamp(48px, ${u(72)}, 72px)`,
              letterSpacing: "-0.01em",
            }}
          >
            Selamat Datang
            <br />
            <span className="text-[#1F6AE0]">Kembali!</span>
          </h1>

          <p
            className={`font-bold text-[#0B1F4F] ${glow}`}
            style={{
              marginTop: u(8),
              fontSize: `clamp(14px, ${u(18)}, 18px)`,
              lineHeight: `clamp(24px, ${u(30)}, 30px)`,
            }}
          >
            Masuk ke akun Anda untuk mengelola seluruh aktivitas
            <br />
            sekolah dengan mudah, aman, dan efisien.
          </p>

          <div className="flex items-start" style={{ marginTop: u(35) }}>
            {features.map(({ icon, label, secondLine, width, padLeft }, index) => (
              <div
                key={label}
                className="relative shrink-0"
                style={{
                  width: width ? u(width) : "auto",
                  paddingLeft: u(padLeft),
                }}
              >
                {index !== 0 && (
                  <div
                    className="absolute left-0 bg-[#0B1F4F]/40"
                    style={{ top: u(11), width: 1, height: u(88) }}
                  />
                )}

                <div
                  className="flex items-center justify-center bg-white text-[#1F6AE0] shadow-lg shadow-[#0F2A66]/15 ring-1 ring-[#0F2A66]/10"
                  style={{
                    width: u(52),
                    height: u(52),
                    borderRadius: u(14),
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                    style={{ width: u(28), height: u(28) }}
                  >
                    <path d={icon} />
                  </svg>
                </div>

                <p
                  className={`font-bold text-[#0B1F4F] ${glow}`}
                  style={{
                    marginTop: u(10),
                    fontSize: u(15),
                    lineHeight: u(20),
                  }}
                >
                  {label}
                  <br />
                  {secondLine}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="ss-right flex w-full justify-center lg:w-[41.2%] lg:justify-start">
          <LoginForm />
        </section>
      </div>
    </main>
  );
}