"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  MapPin,
  Trophy,
  HeartHandshake,
  ArrowLeftRight,
} from "lucide-react";

import PpdbNavbar from "@/app/components/ppdb/PpdbNavbar";
import { urlFormulirPendaftaran } from "@/app/components/ppdb/rutePpdb";

const jalurPendaftaran = [
  {
    key: "zonasi",
    nama: "Zonasi",
    icon: MapPin,
    color: "blue",
    deskripsi:
      "Jalur penerimaan berdasarkan jarak atau wilayah domisili calon peserta didik terhadap sekolah tujuan.",
    persyaratan: [
      "Kartu Keluarga",
      "Akta Kelahiran",
      "Dokumen domisili sesuai ketentuan sekolah",
    ],
  },
  {
    key: "prestasi",
    nama: "Prestasi",
    icon: Trophy,
    color: "amber",
    deskripsi:
      "Jalur penerimaan berdasarkan prestasi akademik maupun nonakademik yang dimiliki calon peserta didik.",
    persyaratan: [
      "Kartu Keluarga",
      "Akta Kelahiran",
      "Sertifikat atau bukti prestasi",
    ],
  },
  {
    key: "afirmasi",
    nama: "Afirmasi",
    icon: HeartHandshake,
    color: "emerald",
    deskripsi:
      "Jalur penerimaan bagi calon peserta didik yang memenuhi ketentuan program afirmasi.",
    persyaratan: [
      "Kartu Keluarga",
      "Akta Kelahiran",
      "Dokumen pendukung afirmasi",
    ],
  },
  {
    key: "pindahan",
    nama: "Pindahan",
    icon: ArrowLeftRight,
    color: "violet",
    deskripsi:
      "Jalur penerimaan bagi calon peserta didik yang melakukan perpindahan sekolah sesuai ketentuan.",
    persyaratan: [
      "Kartu Keluarga",
      "Akta Kelahiran",
      "Surat pindah atau dokumen pendukung lainnya",
    ],
  },
];

export default function JalurPendaftaranPage() {
  const router = useRouter();
  const pathname = usePathname();

  const ppdbIndex = pathname
    ? pathname.indexOf("/PPDB")
    : -1;

  const basePath =
    ppdbIndex > 0 ? pathname.slice(0, ppdbIndex) : "";

  const [openId, setOpenId] = useState("zonasi");

  const handleDaftar = () => {
    router.push(urlFormulirPendaftaran(basePath));
  };

  const getColorClasses = (color) => {
    const map = {
      blue: {
        icon: "bg-blue-50 text-blue-600",
        badge: "bg-blue-50 text-blue-700",
        button:
          "bg-blue-600 hover:bg-blue-700 focus:ring-blue-200",
        border:
          "group-hover:border-blue-200",
      },

      amber: {
        icon: "bg-amber-50 text-amber-600",
        badge: "bg-amber-50 text-amber-700",
        button:
          "bg-amber-500 hover:bg-amber-600 focus:ring-amber-200",
        border:
          "group-hover:border-amber-200",
      },

      emerald: {
        icon: "bg-emerald-50 text-emerald-600",
        badge: "bg-emerald-50 text-emerald-700",
        button:
          "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-200",
        border:
          "group-hover:border-emerald-200",
      },

      violet: {
        icon: "bg-violet-50 text-violet-600",
        badge: "bg-violet-50 text-violet-700",
        button:
          "bg-violet-600 hover:bg-violet-700 focus:ring-violet-200",
        border:
          "group-hover:border-violet-200",
      },
    };

    return map[color] || map.blue;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PpdbNavbar />

      <main>
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => router.push(`${basePath}/PPDB`)}
              className="mb-7 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <ArrowLeft size={16} />
              Kembali ke PPDB
            </button>

            <div className="max-w-3xl">
              <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                Panduan Pendaftaran
              </span>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Jenis Jalur Pendaftaran
              </h1>

              <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
                Penjelasan umum jenis jalur yang umum digunakan.
                Ketersediaan jalur, kuota, dan jadwal ditentukan
                oleh sekolah tujuan.
              </p>
            </div>
          </div>
        </section>


        <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold text-blue-900">
                  Bagaimana cara mendaftar?
                </p>

                <p className="mt-1.5 text-sm leading-6 text-blue-800/80">
                  Gunakan tautan pendaftaran resmi yang dibagikan
                  panitia PPDB sekolah. Tautan tersebut sudah
                  memuat sekolah dan jalur yang dibuka, sehingga
                  Anda tidak perlu memilih atau mengetik ID apa
                  pun.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDaftar}
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Buka Formulir Pendaftaran
                <ArrowRight size={15} />
              </button>
            </div>

            <p className="mt-3 text-xs leading-5 text-blue-700">
              Halaman ini tidak dapat menampilkan daftar jalur milik
              sekolah karena Backend belum menyediakan endpoint
              publik untuk itu.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-5">
            {jalurPendaftaran.map((jalur) => {
              const Icon = jalur.icon;

              const isOpen =
                openId === jalur.key;

              const colors =
                getColorClasses(jalur.color);

              return (
                <div
                  key={jalur.key}
                  className={`group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md ${colors.border}`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenId(
                        isOpen
                          ? null
                          : jalur.key
                      )
                    }
                    className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colors.icon}`}
                      >
                        <Icon size={22} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                            {jalur.nama}
                          </h2>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          {jalur.deskripsi}
                        </p>
                      </div>
                    </div>

                    <ChevronDown
                      size={20}
                      className={`shrink-0 text-slate-400 transition-transform ${
                        isOpen
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-100 px-5 pb-5 sm:px-6 sm:pb-6">
                      <div className="grid gap-6 pt-5 lg:grid-cols-[1fr_auto]">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-800">
                            Persyaratan
                          </h3>

                          <div className="mt-3 space-y-2.5">
                            {jalur.persyaratan.map(
                              (syarat) => (
                                <div
                                  key={syarat}
                                  className="flex items-start gap-2.5"
                                >
                                  <CheckCircle2
                                    size={16}
                                    className="mt-0.5 shrink-0 text-emerald-500"
                                  />

                                  <span className="text-sm text-slate-600">
                                    {syarat}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>

                        <div className="flex items-end">
                          <p className="max-w-[220px] text-xs leading-5 text-slate-500">
                            Ketersediaan jalur dan
                            persyaratan resmi ditentukan
                            oleh sekolah tujuan.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-900">
                Informasi pendaftaran
              </p>

              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-blue-800/80">
                Jenis jalur di atas bersifat umum dan bukan
                daftar jalur yang sedang dibuka. Untuk
                mendaftar, gunakan tautan resmi dari sekolah;
                formulir akan menampilkan sekolah dan jalur
                yang terhubung dengan tautan tersebut.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDaftar}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Buka Formulir
              <ArrowRight size={15} />
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-slate-400 sm:px-6 lg:px-8">
          © 2026 SmartSchool — PPDB Online
        </div>
      </footer>
    </div>
  );
}