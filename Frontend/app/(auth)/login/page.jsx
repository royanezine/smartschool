"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ArrowLeft } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { login } from "@/services/auth.service";
import LoginForm from "@/app/components/auth/LoginForm";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// u(n) -> "calc(var(--u) * n)"
const u = (n) => `calc(var(--u) * ${n})`;

// uo(n, offsetPx) -> "calc(var(--u) * n - 1px)"  (FIX: jangan pakai u(n) - 1, hasilnya NaN)
const uo = (n, offsetPx = 0) =>
  `calc(var(--u) * ${n} ${offsetPx < 0 ? "-" : "+"} ${Math.abs(offsetPx)}px)`;

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
  { icon: ICONS.siswa, label: "Manajemen", secondLine: "Siswa" },
  { icon: ICONS.jadwal, label: "Jadwal &", secondLine: "Kurikulum" },
  { icon: ICONS.absensi, label: "Absensi &", secondLine: "Penilaian" },
  { icon: ICONS.kolaborasi, label: "Kolaborasi", secondLine: "Sekolah" },
];

const FADE_MASK =
  "linear-gradient(90deg, #000 0%, #000 38%, rgba(0,0,0,0.6) 52%, transparent 66%)";

export default function LoginPage() {
  const router = useRouter();
  const reduce = useReducedMotion();

  const handleBack = () => {
    router.push("/");
  };

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.1, delayChildren: 0.05 } },
  };

  const item = {
    hidden: { opacity: 0, y: reduce ? 0 : 16 },
    show: { opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.55, ease: "easeOut" } },
  };

  const step = {
    hidden: { opacity: 0, y: reduce ? 0 : 10, scale: reduce ? 1 : 0.9 },
    show: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: reduce ? 0 : 0.45, delay: reduce ? 0 : 0.5 + i * 0.18, ease: "easeOut" },
    }),
  };

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
        @keyframes ss-pulse {
          0% { transform: scale(1); opacity: 0.55; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        .ss-pulse { animation: ss-pulse 2.4s ease-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .ss-pulse { animation: none; }
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

      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 backdrop-blur-[7px]"
        style={{ maskImage: FADE_MASK, WebkitMaskImage: FADE_MASK }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.93) 30%, rgba(244,249,255,0.80) 46%, rgba(234,243,255,0.35) 62%, rgba(234,243,255,0) 80%)",
        }}
      />

      <div className="absolute inset-0 -z-20 bg-white/45 lg:hidden" />

      <div
        className="ss-logo absolute z-10 flex items-center"
        style={{ left: 20, top: 20, gap: u(16) }}
      >
        <button
          type="button"
          onClick={handleBack}
          aria-label="Kembali"
          className="flex items-center justify-center rounded-full bg-white text-[#0F2A66] shadow-sm ring-1 ring-[#0F2A66]/10 transition-all hover:bg-[#0F2A66] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F6AE0]"
          style={{ width: u(48), height: u(48) }}
        >
          <ArrowLeft style={{ width: u(24), height: u(24) }} strokeWidth={2.5} />
        </button>

        <Link
          href="/"
          aria-label="Smart School Beranda"
          className="flex items-center transition-opacity hover:opacity-80"
          style={{ gap: u(12) }}
        >
          <Image
            src="/logo/logoSS.png"
            alt="Logo Smart School"
            width={48}
            height={48}
            priority
            className="object-contain"
            style={{ width: u(48), height: u(48) }}
          />
          <span
            className="font-extrabold text-[#0B1F4F]"
            style={{ fontSize: u(24), letterSpacing: "-0.01em", lineHeight: 1 }}
          >
            SMART <span className="text-[#1F6AE0]">SCHOOL</span>
          </span>
        </Link>
      </div>

      <div className="relative flex min-h-screen w-full items-center justify-center px-5 pb-8 pt-24 lg:justify-start lg:p-0">
        <motion.section
          className="ss-left hidden shrink-0 flex-col lg:flex"
          style={{ width: "58.8%", paddingLeft: "9.1%", paddingRight: u(48) }}
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item} className="flex items-center" style={{ gap: u(14) }}>
            <span
              aria-hidden="true"
              className="block bg-[#1F6AE0]"
              style={{ width: u(44), height: 3, borderRadius: 3 }}
            />
            <span
              className="font-bold text-[#1F6AE0]"
              style={{ fontSize: u(17), letterSpacing: "0.01em" }}
            >
              Sistem Informasi Sekolah
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="font-extrabold text-[#0B1F4F]"
            style={{
              marginTop: u(22),
              fontSize: `clamp(40px, ${u(66)}, 66px)`,
              lineHeight: `clamp(48px, ${u(74)}, 74px)`,
              letterSpacing: "-0.02em",
            }}
          >
            Selamat Datang
            <br />
            <span className="bg-gradient-to-r from-[#1F6AE0] to-[#0B3FA8] bg-clip-text text-transparent">
              Kembali!
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="font-medium text-[#33456F]"
            style={{
              marginTop: u(20),
              maxWidth: u(540),
              fontSize: `clamp(15px, ${u(19)}, 19px)`,
              lineHeight: `clamp(26px, ${u(32)}, 32px)`,
            }}
          >
            Masuk ke akun Anda untuk mengelola seluruh aktivitas sekolah dengan mudah,
            aman, dan efisien.
          </motion.p>

          <motion.div
            variants={item}
            className="relative"
            style={{ marginTop: u(48), maxWidth: u(740) }}
          >
            {/* Garis timeline */}
            <motion.div
              aria-hidden="true"
              className="absolute"
              style={{
                top: uo(24, -1), // FIX: sebelumnya u(24) - 1 -> NaN
                left: u(24),
                right: 0,
                height: 2,
                borderRadius: 2,
                transformOrigin: "left center",
                background:
                  "linear-gradient(90deg, #1F6AE0 0%, #1F6AE0 55%, rgba(31,106,224,0.15) 100%)",
              }}
              initial={{ scaleX: reduce ? 1 : 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: reduce ? 0 : 1.1, delay: reduce ? 0 : 0.45, ease: "easeInOut" }}
            />

            {/* Titik ujung timeline */}
            <span
              aria-hidden="true"
              className="absolute block rounded-full bg-[#1F6AE0]/30"
              style={{ top: uo(24, -4), right: 0, width: 8, height: 8 }} // FIX: sebelumnya u(24) - 4 -> NaN
            />

            <div className="relative grid grid-cols-4">
              {features.map(({ icon, label, secondLine }, index) => (
                <motion.div
                  key={label}
                  custom={index}
                  variants={step}
                  initial="hidden"
                  animate="show"
                  className="group"
                >
                  <div className="relative" style={{ width: u(48), height: u(48) }}>
                    <span
                      aria-hidden="true"
                      className="ss-pulse absolute inset-0 rounded-full bg-[#1F6AE0]/30"
                      style={{ animationDelay: `${index * 0.45}s` }}
                    />
                    <div
                      className="relative flex items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#0B3FA8] text-white shadow-lg shadow-[#1F6AE0]/30 ring-4 ring-white transition-transform duration-300 group-hover:-translate-y-1"
                      style={{ width: u(48), height: u(48) }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                        style={{ width: u(24), height: u(24) }}
                      >
                        <path d={icon} />
                      </svg>
                    </div>
                  </div>

                  <p
                    className="font-extrabold tabular-nums text-[#1F6AE0]/60"
                    style={{ marginTop: u(16), fontSize: u(13), letterSpacing: "0.08em" }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </p>

                  <p
                    className="font-bold text-[#0B1F4F]"
                    style={{ marginTop: u(4), fontSize: u(15), lineHeight: u(21) }}
                  >
                    {label}
                    <br />
                    {secondLine}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.section>

        <section className="ss-right flex w-full justify-center lg:w-[41.2%] lg:justify-start">
          <LoginForm />
        </section>
      </div>
    </main>
  );
}