"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  Mail,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

function MenungguPendaftaranContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduce = useReducedMotion();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const emailFromUrl = searchParams.get("email") || "";

    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }

    setLoading(false);
  }, [searchParams]);

  function lanjutVerifikasi() {
    if (!email) {
      router.replace("/daftar-sekolah");
      return;
    }

    router.push(
      `/daftar-sekolah/verify?email=${encodeURIComponent(email)}`
    );
  }

  function kembali() {
    router.push("/daftar-sekolah");
  }

  const steps = [
    {
      number: "01",
      title: "Periksa email",
      description:
        "Cari kode OTP dari SmartSchool di email administrator. Cek folder spam jika belum terlihat.",
      icon: Mail,
    },
    {
      number: "02",
      title: "Verifikasi OTP",
      description:
        "Masukkan kode OTP pada halaman verifikasi untuk mengonfirmasi alamat email Anda.",
      icon: ShieldCheck,
    },
    {
      number: "03",
      title: "Selesaikan pendaftaran",
      description:
        "Ikuti langkah selanjutnya sesuai paket dan status pendaftaran sekolah.",
      icon: CheckCircle2,
    },
  ];

  if (loading) {
    return (
      <main
        className={`${jakarta.className} flex min-h-screen items-center justify-center bg-[#EEF4FF]`}
      >
        <RefreshCw className="animate-spin text-[#155DFC]" size={28} />
      </main>
    );
  }

  return (
    <main
      className={`${jakarta.className} relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#EEF4FF] px-4 py-6 text-[#0F172A] sm:px-6`}
    >
      <style>{`
        @keyframes ss-ring {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.9); opacity: 0; }
        }
        .ss-ring { animation: ss-ring 2.4s ease-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .ss-ring { animation: none; }
        }
      `}</style>

      {/* Latar: foto sekolah yang dibuat lembut */}
      <div className="absolute inset-0 -z-30">
        <Image
          src="/hero/hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 backdrop-blur-[6px]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-white/90 via-[#EEF4FF]/85 to-[#EEF4FF]/95"
      />

      <motion.div
        initial={{ opacity: 0, y: reduce ? 0 : 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0 : 0.55, ease: "easeOut" }}
        className="w-full max-w-3xl"
      >
        {/* Logo */}
        <Link
          href="/"
          aria-label="Smart School Beranda"
          className="mb-5 flex items-center justify-center gap-3 transition-opacity hover:opacity-80"
        >
          <Image
            src="/logo/logoSS.png"
            alt="Logo Smart School"
            width={40}
            height={40}
            priority
            className="h-10 w-10 object-contain"
          />
          <span className="text-xl font-extrabold leading-none tracking-tight text-[#0F172A]">
            SMART <span className="text-[#155DFC]">SCHOOL</span>
          </span>
        </Link>

        <section className="overflow-hidden rounded-3xl bg-white shadow-[0_24px_70px_rgba(15,23,42,0.14)]">
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#155DFC] to-[#0D47C9] px-6 py-7 text-center text-white sm:px-10">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-white/[0.07]"
            />

            <div className="relative">
              <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center">
                <span
                  aria-hidden="true"
                  className="ss-ring absolute inset-0 rounded-full bg-white/30"
                />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#155DFC] shadow-lg shadow-[#0D47C9]/40">
                  <Mail size={26} />
                </div>
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">
                Pendaftaran SmartSchool
              </p>

              <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-[28px]">
                Satu Langkah Lagi, Verifikasi Akun
              </h1>

              <p className="mx-auto mt-2 max-w-lg text-sm font-medium leading-6 text-white/80">
                Pendaftaran Anda telah kami terima. Selesaikan verifikasi
                administrator dengan kode OTP yang dikirim ke email.
              </p>
            </div>
          </div>

          <div className="px-6 pb-6 pt-6 sm:px-10">
            {/* Email */}
            <div className="flex items-center gap-3.5 rounded-2xl border border-[#DBE5F5] bg-[#F5F8FE] px-4 py-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#155DFC] shadow-sm">
                <UserRound size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-[#475569]/80">
                  Email administrator · gunakan email yang sama saat verifikasi
                </p>
                <p className="mt-0.5 truncate text-sm font-extrabold text-[#0F172A]">
                  {email || "Email belum tersedia"}
                </p>
              </div>
            </div>

            {/* Langkah (horizontal) */}
            <ol className="relative mt-6 grid gap-5 md:grid-cols-3 md:gap-6">
              <span
                aria-hidden="true"
                className="absolute left-[16.6%] right-[16.6%] top-5 hidden h-px bg-gradient-to-r from-[#155DFC]/50 via-[#155DFC]/25 to-[#DBE5F5] md:block"
              />

              {steps.map((step) => {
                const Icon = step.icon;

                return (
                  <li
                    key={step.number}
                    className="relative flex gap-4 md:flex-col md:items-center md:gap-0 md:text-center"
                  >
                    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2F6FFF] to-[#0D47C9] text-white shadow-md shadow-[#155DFC]/30 ring-4 ring-white">
                      <Icon size={18} />
                    </div>

                    <div className="min-w-0 md:mt-3">
                      <span className="text-[11px] font-extrabold tracking-[0.1em] text-[#155DFC]/70">
                        LANGKAH {step.number}
                      </span>
                      <h3 className="mt-0.5 text-sm font-extrabold text-[#0F172A]">
                        {step.title}
                      </h3>
                      <p className="mt-1 text-xs font-medium leading-5 text-[#475569]/90">
                        {step.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>

            {/* Aksi */}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={kembali}
                className="group flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-[#DBE5F5] bg-white px-6 text-sm font-bold text-[#0F172A] transition hover:border-[#155DFC]/40 hover:bg-[#F5F8FE]"
              >
                <ArrowLeft
                  size={17}
                  className="transition-transform group-hover:-translate-x-0.5"
                />
                Kembali
              </button>

              <button
                type="button"
                onClick={lanjutVerifikasi}
                disabled={!email}
                className="group flex h-12 flex-[1.4] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#155DFC] to-[#0D47C9] px-6 text-sm font-bold text-white shadow-lg shadow-[#155DFC]/30 transition hover:shadow-xl hover:shadow-[#155DFC]/40 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              >
                Lanjutkan Verifikasi OTP
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </button>
            </div>

            <div className="mt-5 flex items-start gap-2 border-t border-[#E5ECF8] pt-4">
              <CircleHelp size={15} className="mt-0.5 shrink-0 text-[#155DFC]" />
              <p className="text-[11px] font-medium leading-5 text-[#475569]/80">
                Menutup tab tidak menghapus halaman ini. Status pendaftaran dan
                kode OTP tetap mengikuti data yang tercatat di backend.
              </p>
            </div>
          </div>
        </section>

        <p className="mt-4 text-center text-xs font-medium text-[#475569]/70">
          © 2026 SmartSchool. Semua hak dilindungi.
        </p>
      </motion.div>
    </main>
  );
}

export default function MenungguPendaftaranPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#EEF4FF]">
          <RefreshCw className="animate-spin text-[#155DFC]" size={28} />
        </main>
      }
    >
      <MenungguPendaftaranContent />
    </Suspense>
  );
}