"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  FileCheck2,
  ClipboardList,
  Megaphone,
  ChevronRight,
  CheckCircle2,
  Users,
  MapPin,
  Sparkles,
} from "lucide-react";

import PpdbNavbar from "@/app/components/ppdb/PpdbNavbar";
/*
|--------------------------------------------------------------------------
| INFORMASI PPDB
|--------------------------------------------------------------------------
| Catatan:
| - Halaman ini bersifat publik.
| - Backend belum menyediakan GET daftar jalur PPDB untuk publik.
| - Endpoint GET jalur PPDB yang tersedia membutuhkan autentikasi
|   admin sekolah dan izin ppdb.view.
| - Karena itu halaman ini TIDAK menampilkan daftar jalur milik sekolah
|   dan TIDAK mengirim ID jalur buatan ke Backend.
| - Konten jalur di bawah adalah penjelasan jenis jalur secara umum.
| - Ketersediaan, kuota, dan jadwal jalur hanya dapat diketahui dari
|   sekolah tujuan atau tautan pendaftaran resmi yang dibagikan sekolah.
|--------------------------------------------------------------------------
*/

const jalurPendaftaran = [
  {
    id: "zonasi",
    title: "Jalur Zonasi",
    desc: "Untuk calon siswa yang berdomisili dalam radius zona sekolah sesuai KK.",
    icon: MapPin,
    color: "blue",
  },
  {
    id: "prestasi",
    title: "Jalur Prestasi",
    desc: "Untuk calon siswa dengan prestasi akademik atau non-akademik yang dibuktikan sertifikat.",
    icon: Sparkles,
    color: "amber",
  },
  {
    id: "afirmasi",
    title: "Jalur Afirmasi",
    desc: "Untuk calon siswa dari keluarga kurang mampu atau penyandang disabilitas.",
    icon: Users,
    color: "emerald",
  },
  {
    id: "pindahan",
    title: "Jalur Perpindahan Tugas",
    desc: "Untuk calon siswa yang mengikuti perpindahan tugas orang tua/wali.",
    icon: FileCheck2,
    color: "rose",
  },
];

const alurPendaftaran = [
  {
    id: 1,
    title: "Buka tautan resmi sekolah",
    desc: "Tautan dari panitia PPDB memuat sekolah dan jalur yang dibuka, sehingga tidak perlu mengetik ID.",
  },
  {
    id: 2,
    title: "Isi data calon siswa",
    desc: "Lengkapi data diri, orang tua/wali, dan kontak yang valid sesuai dokumen resmi.",
  },
  {
    id: 3,
    title: "Unggah dokumen",
    desc: "Unggah KK, akta kelahiran, dan ijazah/SKL. Format JPG, PNG, atau PDF maksimal 5MB per file.",
  },
  {
    id: 4,
    title: "Simpan nomor pendaftaran",
    desc: "Nomor ditampilkan bila dikembalikan server. Sekolah akan memverifikasi data dan dokumen Anda.",
  },
];

const persyaratan = [
  "Kartu Keluarga (KK) yang masih berlaku",
  "Akta kelahiran calon siswa",
  "Ijazah atau Surat Keterangan Lulus",
  "Dokumen tambahan mengikuti ketentuan sekolah",
];

/*
 * Pengumuman belum tersedia di Backend. Landing page tidak menampilkan
 * pengumuman contoh; bagian ini memakai empty state.
 */

const colorMap = {
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
  },
  rose: {
    bg: "bg-rose-50",
    text: "text-rose-600",
    border: "border-rose-200",
  },
};

export default function PPDBLandingPage() {
  const router = useRouter();
  const pathname = usePathname();

  const ppdbIndex = pathname
    ? pathname.indexOf("/PPDB")
    : -1;

  const basePath =
    ppdbIndex > 0 ? pathname.slice(0, ppdbIndex) : "";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ================================================================
          NAVBAR COMPONENT
      ================================================================ */}

      <PpdbNavbar />

      {/* ================================================================
          HERO
      ================================================================ */}

      <section className="mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-6 sm:pt-14">
        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
          {/* HERO CONTENT */}

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8 lg:col-span-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
              <ClipboardList size={13} />

              Pendaftaran dibuka oleh masing-masing sekolah
            </div>

            <h1 className="mt-4 text-2xl font-semibold leading-snug text-slate-800 sm:text-3xl">
              Penerimaan Peserta Didik Baru
              <br className="hidden sm:block" />
              Secara Online
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base">
              Informasi umum seputar alur, dokumen, dan tata cara
              pendaftaran siswa baru. Untuk mendaftar, gunakan tautan
              resmi yang dibagikan oleh panitia PPDB sekolah tujuan.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
              type="button"
              onClick={() =>
                router.push(`${basePath}/PPDB/jalurPendaftaran`)
              }
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Lihat Panduan Pendaftaran

              <ChevronRight size={15} />
            </button>

              <button
                type="button"
                onClick={() =>
                  router.push(`${basePath}/PPDB/alurPendaftaran`)
                }
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                <ClipboardList size={15} />

                Baca Alur Pendaftaran
              </button>
            </div>
          </div>

          {/* PANDUAN SINGKAT */}

          <div className="flex flex-col justify-between rounded-2xl bg-blue-600 p-6 text-white shadow-sm sm:p-8">
            <div>
              <p className="text-sm text-blue-100">
                Sebelum mendaftar
              </p>

              <p className="mt-1 text-xl font-semibold">
                Siapkan tautan resmi sekolah
              </p>

              <p className="mt-2 text-sm leading-6 text-blue-100">
                Panitia PPDB sekolah membagikan tautan
                pendaftaran yang sudah memuat sekolah dan
                jalur yang dibuka.
              </p>
            </div>

            <div className="mt-6 space-y-2 text-sm text-blue-50">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={15}
                  className="shrink-0"
                />
                Sekolah dan jalur terisi otomatis
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={15}
                  className="shrink-0"
                />
                Data dikirim langsung ke server
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={15}
                  className="shrink-0"
                />
                Simpan nomor pendaftaran
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          JALUR PENDAFTARAN
      ================================================================ */}

      <section
        id="jalur"
        className="mx-auto max-w-6xl px-4 py-8 sm:px-6"
      >
        <div className="mb-4 flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5">
            <div className="rounded-lg bg-amber-50 p-1.5 text-amber-600">
              <ClipboardList size={16} />
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-800 sm:text-lg">
                Jenis Jalur Pendaftaran
              </h2>

              <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                Penjelasan umum jenis jalur. Ketersediaan dan
                kuota jalur ditentukan oleh sekolah tujuan,
                bukan oleh halaman ini.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(`${basePath}/PPDB/jalurPendaftaran`)
            }
            className="inline-flex shrink-0 items-center gap-0.5 pt-1 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            Lihat detail

            <ChevronRight size={12} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {jalurPendaftaran.map((j) => {
            const Icon = j.icon;
            const c = colorMap[j.color];

            return (
              <button
                key={j.id}
                type="button"
                onClick={() =>
                  router.push(
                    `${basePath}/PPDB/jalurPendaftaran`
                  )
                }
                className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-md ${c.border}`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${c.bg} ${c.text}`}
                >
                  <Icon size={17} />
                </div>

                <h3 className="mt-3 text-sm font-semibold text-slate-800">
                  {j.title}
                </h3>

                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                  {j.desc}
                </p>

                <div
                  className={`mt-3 inline-block rounded-full px-2.5 py-1 text-[11px] font-medium ${c.bg} ${c.text}`}
                >
                  Informasi umum
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ================================================================
          ALUR + PERSYARATAN
      ================================================================ */}

      <section
        id="alur"
        className="mx-auto max-w-6xl px-4 py-8 sm:px-6"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* ALUR */}

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
            <div className="mb-5 flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-slate-800 sm:text-lg">
                Alur Pendaftaran
              </h2>

              <button
                type="button"
                onClick={() =>
                  router.push(`${basePath}/PPDB/alurPendaftaran`)
                }
                className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
              >
                Lihat detail

                <ChevronRight size={12} />
              </button>
            </div>

            <div className="space-y-5">
              {alurPendaftaran.map((a, idx) => (
                <div
                  key={a.id}
                  className="flex gap-4"
                >
                  <div className="flex shrink-0 flex-col items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                      {idx + 1}
                    </div>

                    {idx !==
                      alurPendaftaran.length - 1 && (
                      <div className="mt-1 w-px flex-1 bg-slate-200" />
                    )}
                  </div>

                  <div className="pb-1">
                    <p className="text-sm font-semibold text-slate-800">
                      {a.title}
                    </p>

                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      {a.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PERSYARATAN */}

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-4 text-base font-semibold text-slate-800 sm:text-lg">
              Dokumen Persyaratan
            </h2>

            <ul className="space-y-3">
              {persyaratan.map((p, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-sm text-slate-600"
                >
                  <CheckCircle2
                    size={15}
                    className="mt-0.5 shrink-0 text-emerald-500"
                  />

                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ================================================================
          PENGUMUMAN
      ================================================================ */}

      <section
        id="pengumuman"
        className="mx-auto max-w-6xl px-4 py-8 sm:px-6"
      >
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 p-4 sm:p-5">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="shrink-0 rounded-lg bg-rose-50 p-1.5 text-rose-600">
                <Megaphone size={16} />
              </div>

              <h3 className="truncate text-sm font-semibold text-slate-800 sm:text-base">
                Pengumuman Terbaru
              </h3>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(`${basePath}/PPDB/pengumuman`)
              }
              className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              Lihat semua

              <ChevronRight size={12} />
            </button>
          </div>

          <div className="divide-y divide-slate-50">
            <div className="px-4 py-8 text-center sm:px-5">
              <p className="text-sm font-medium text-slate-700">
                Belum ada pengumuman
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Pengumuman resmi akan tampil di sini
                setelah tersedia di sistem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          FOOTER
      ================================================================ */}

      <footer className="mt-8 border-t border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex shrink-0 items-center justify-center rounded-lg bg-blue-600 p-2 text-white">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 10L12 4L21 10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5 10V19H19V10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 19V13H15V19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <span className="text-sm font-semibold text-slate-700">
              PPDB SmartSchool
            </span>
          </div>

          <div className="flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:gap-6">
            <span className="max-w-md leading-5">
              Informasi dan bantuan pendaftaran disediakan oleh
              panitia PPDB sekolah tujuan.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}