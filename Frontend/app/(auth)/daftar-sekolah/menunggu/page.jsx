"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Mail,
  ShieldCheck,
  UserRound,
  RefreshCw,
  CircleHelp,
} from "lucide-react";

function MenungguPendaftaranContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  function kembaliLogin() {
    router.push(
      email ? `/login?email=${encodeURIComponent(email)}` : "/login"
    );
  }

  const steps = [
    {
      number: "01",
      title: "Periksa email administrator",
      description:
        "Buka email yang digunakan saat pendaftaran dan cari kode OTP dari SmartSchool. Periksa folder spam jika email belum terlihat.",
      icon: Mail,
    },
    {
      number: "02",
      title: "Verifikasi kode OTP",
      description:
        "Masukkan kode OTP pada halaman verifikasi untuk mengonfirmasi alamat email dan melanjutkan pendaftaran sekolah.",
      icon: ShieldCheck,
    },
    {
      number: "03",
      title: "Selesaikan proses pendaftaran",
      description:
        "Setelah OTP berhasil diverifikasi, ikuti langkah selanjutnya sesuai paket dan status pendaftaran sekolah.",
      icon: CheckCircle2,
    },
  ];

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <RefreshCw className="animate-spin text-blue-600" size={28} />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f8fc] px-4 py-8 text-slate-900 sm:px-6 sm:py-12">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-2xl">
        <div className="mb-8 flex justify-center">
          <a
            href="/"
            className="relative block h-12 w-48"
            aria-label="SmartSchool"
          >
            <Image
              src="/logo/logoSS.png"
              alt="SmartSchool"
              fill
              priority
              sizes="192px"
              className="object-contain"
            />
          </a>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_15px_50px_rgba(15,23,42,0.07)]">
          <div className="bg-[#0f172a] px-6 py-8 text-center text-white sm:px-10 sm:py-10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
              <Clock3 size={30} className="text-blue-300" />
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
              Pendaftaran SmartSchool
            </p>

            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Lanjutkan Pendaftaran Sekolah
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-300">
              Pendaftaran kamu telah dikirim. Ikuti langkah
              berikut untuk menyelesaikan verifikasi akun
              administrator.
            </p>
          </div>

          <div className="p-5 sm:p-8">
            <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                <UserRound size={19} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-500">
                  Email administrator
                </p>

                <p className="mt-1 break-all text-sm font-semibold text-slate-900">
                  {email || "Email belum tersedia"}
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Pastikan kamu menggunakan email yang sama
                  saat melanjutkan verifikasi.
                </p>
              </div>
            </div>

            <div className="my-8">
              <h2 className="text-base font-bold text-slate-900">
                Langkah selanjutnya
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Selesaikan setiap langkah berikut secara berurutan.
              </p>

              <div className="mt-6 space-y-6">
                {steps.map((step, index) => {
                  const Icon = step.icon;

                  return (
                    <div key={step.number} className="relative flex gap-4">
                      {index !== steps.length - 1 && (
                        <div className="absolute left-5 top-11 h-[calc(100%+8px)] w-px bg-slate-200" />
                      )}

                      <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Icon size={19} />
                      </div>

                      <div className="flex-1 pb-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold tracking-wider text-blue-600">
                            LANGKAH {step.number}
                          </span>
                        </div>

                        <h3 className="mt-1 text-sm font-bold text-slate-900">
                          {step.title}
                        </h3>

                        <p className="mt-1.5 text-xs leading-6 text-slate-500">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={lanjutVerifikasi}
              disabled={!email}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#155DFC] px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/15 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Lanjutkan Verifikasi OTP
              <ArrowRight size={17} />
            </button>

            <button
              type="button"
              onClick={kembaliLogin}
              className="mt-3 flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Kembali ke halaman login
            </button>

            <div className="mt-6 flex items-start gap-2 border-t border-slate-100 pt-5">
              <CircleHelp
                size={16}
                className="mt-0.5 shrink-0 text-slate-400"
              />

              <p className="text-xs leading-5 text-slate-500">
                Menutup tab tidak menghapus halaman ini dari browser.
                Buka kembali alamat halaman ini jika diperlukan.
                Status pendaftaran dan kode OTP tetap mengikuti data
                yang tercatat di backend.
              </p>
            </div>
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-slate-400">
          © 2026 SmartSchool. Semua hak dilindungi.
        </p>
      </div>
    </main>
  );
}

export default function MenungguPendaftaranPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <RefreshCw className="animate-spin text-blue-600" size={28} />
        </main>
      }
    >
      <MenungguPendaftaranContent />
    </Suspense>
  );
}