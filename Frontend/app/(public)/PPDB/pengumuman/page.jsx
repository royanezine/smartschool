"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  Megaphone,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Clock,
  Paperclip,
} from "lucide-react";

import PpdbNavbar from "../../components/ppdb/PpdbNavbar";

// ============================================================================
// DUMMY DATA
// ============================================================================
// Catatan: ganti dengan data asli dari API/DB begitu tersedia.
// ============================================================================

const jadwalPenting = [
  {
    id: 1,
    label: "Pendaftaran Dibuka",
    tanggal: "1 - 20 Juni 2026",
    status: "berjalan",
  },
  {
    id: 2,
    label: "Seleksi Berkas",
    tanggal: "21 - 24 Juni 2026",
    status: "mendatang",
  },
  {
    id: 3,
    label: "Pengumuman Hasil",
    tanggal: "27 Juni 2026",
    status: "mendatang",
  },
  {
    id: 4,
    label: "Daftar Ulang",
    tanggal: "28 - 30 Juni 2026",
    status: "mendatang",
  },
];

const kategoriList = [
  "Semua",
  "Jadwal",
  "Berkas",
  "Panduan",
];

const pengumumanList = [
  {
    id: 1,
    title: "Perpanjangan Waktu Pendaftaran Jalur Afirmasi",
    tanggal: "18 Agustus 2026",
    kategori: "Jadwal",
    ringkasan:
      "Batas akhir pendaftaran jalur afirmasi diperpanjang sampai dengan 25 Agustus 2026.",
    isi: [
      "Sehubungan dengan masih tersedianya kuota pada jalur afirmasi, panitia PPDB memperpanjang masa pendaftaran untuk jalur ini sampai dengan tanggal 25 Agustus 2026 pukul 23.59 WIB.",
      "Calon siswa yang telah mendaftar sebelumnya tidak perlu mendaftar ulang, dan dapat langsung melanjutkan proses verifikasi berkas.",
      "Jadwal seleksi dan pengumuman hasil untuk jalur ini akan disesuaikan dan diinformasikan melalui halaman ini.",
    ],
    lampiran:
      "Surat Edaran Perpanjangan Jalur Afirmasi.pdf",
  },
  {
    id: 2,
    title: "Jadwal Verifikasi Berkas Jalur Prestasi",
    tanggal: "15 Agustus 2026",
    kategori: "Berkas",
    ringkasan:
      "Verifikasi berkas jalur prestasi dilaksanakan 20-22 Agustus 2026 secara luring di sekolah.",
    isi: [
      "Verifikasi dokumen asli untuk jalur prestasi dilaksanakan pada tanggal 20-22 Agustus 2026, pukul 08.00-14.00 WIB di sekolah tujuan masing-masing.",
      "Calon siswa wajib membawa dokumen asli beserta fotokopi yang telah diunggah pada saat pendaftaran.",
      "Ketidakhadiran pada jadwal verifikasi tanpa konfirmasi dianggap mengundurkan diri dari jalur prestasi.",
    ],
    lampiran:
      "Jadwal Verifikasi Jalur Prestasi.pdf",
  },
  {
    id: 3,
    title: "Panduan Pengisian Formulir Online",
    tanggal: "10 Agustus 2026",
    kategori: "Panduan",
    ringkasan:
      "Panduan langkah demi langkah pengisian formulir pendaftaran online untuk orang tua/wali.",
    isi: [
      "Panitia menyediakan panduan bergambar untuk membantu orang tua/wali dalam proses pembuatan akun, pengunggahan berkas, hingga pemilihan jalur dan sekolah tujuan.",
      "Panduan tersedia dalam format PDF dan dapat diunduh melalui tautan lampiran di bawah ini.",
      "Bila mengalami kendala teknis, orang tua/wali dapat menghubungi kontak yang tertera pada bagian bawah halaman.",
    ],
    lampiran:
      "Panduan Pengisian Formulir PPDB.pdf",
  },
  {
    id: 4,
    title: "Sosialisasi Kuota dan Jalur Pendaftaran 2026/2027",
    tanggal: "3 Agustus 2026",
    kategori: "Jadwal",
    ringkasan:
      "Rincian pembagian kuota 360 siswa baru ke dalam 4 jalur pendaftaran tahun ajaran ini.",
    isi: [
      "Total kuota siswa baru tahun ajaran 2026/2027 ditetapkan sebanyak 360 siswa, terbagi ke dalam jalur zonasi (50%), prestasi (30%), afirmasi (15%), dan perpindahan tugas (5%).",
      "Pembagian ini mengacu pada ketentuan dinas pendidikan setempat dan dapat berubah sesuai kondisi jumlah pendaftar pada masing-masing jalur.",
      "Rincian syarat tiap jalur dapat dilihat pada halaman Jalur Pendaftaran.",
    ],
    lampiran:
      "Rincian Kuota PPDB 2026-2027.pdf",
  },
];

export default function PengumumanPage() {
  const router = useRouter();

  const [kategoriAktif, setKategoriAktif] =
    useState("Semua");

  const [openId, setOpenId] = useState(null);

  const filteredList =
    kategoriAktif === "Semua"
      ? pengumumanList
      : pengumumanList.filter(
          (p) => p.kategori === kategoriAktif
        );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ==================================================================
          NAVBAR
      ================================================================== */}

      <PpdbNavbar />

      {/* ==================================================================
          CONTENT
      ================================================================== */}

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        {/* PAGE TITLE */}

        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
            <Megaphone size={13} />

            {pengumumanList.length} pengumuman
            diterbitkan
          </div>

          <h1 className="mt-3 text-xl font-semibold text-slate-800 sm:text-2xl">
            Pengumuman
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Informasi resmi dan jadwal terbaru
            seputar penerimaan peserta didik baru
            tahun ajaran 2026/2027.
          </p>
        </div>

        {/* ==================================================================
            JADWAL PENTING
        ================================================================== */}

        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="rounded-lg bg-blue-50 p-1.5 text-blue-600">
              <CalendarClock size={16} />
            </div>

            <h2 className="text-sm font-semibold text-slate-800 sm:text-base">
              Jadwal Penting
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {jadwalPenting.map((j) => (
              <div
                key={j.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {j.label}
                  </p>

                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock
                      size={12}
                      className="flex-shrink-0"
                    />
                    {j.tanggal}
                  </p>
                </div>

                <span
                  className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    j.status === "berjalan"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {j.status === "berjalan"
                    ? "Berjalan"
                    : "Mendatang"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ==================================================================
            FILTER KATEGORI
        ================================================================== */}

        <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1">
          {kategoriList.map((k) => {
            const isActive =
              kategoriAktif === k;

            return (
              <button
                key={k}
                type="button"
                onClick={() =>
                  setKategoriAktif(k)
                }
                className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {k}
              </button>
            );
          })}
        </div>

        {/* ==================================================================
            DAFTAR PENGUMUMAN — ACCORDION
        ================================================================== */}

        <div className="space-y-3">
          {filteredList.map((p) => {
            const isOpen = openId === p.id;

            return (
              <div
                key={p.id}
                className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
              >
                {/* HEADER */}

                <button
                  type="button"
                  onClick={() =>
                    setOpenId(
                      isOpen ? null : p.id
                    )
                  }
                  className="flex w-full items-start gap-3 p-4 text-left sm:p-5"
                  aria-expanded={isOpen}
                >
                  <div className="mt-0.5 flex-shrink-0 rounded-lg bg-rose-50 p-1.5 text-rose-600">
                    <Megaphone size={14} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                        {p.kategori}
                      </span>

                      <span className="text-xs text-slate-400">
                        {p.tanggal}
                      </span>
                    </div>

                    <p className="mt-1.5 text-sm font-semibold text-slate-800">
                      {p.title}
                    </p>

                    {!isOpen && (
                      <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                        {p.ringkasan}
                      </p>
                    )}
                  </div>

                  <ChevronDown
                    size={16}
                    className={`mt-1 flex-shrink-0 text-slate-400 transition-transform ${
                      isOpen
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>

                {/* DETAIL */}

                {isOpen && (
                  <div className="border-t border-slate-100 px-4 pb-5 pt-1 sm:px-5">
                    <ul className="mb-4 space-y-2.5">
                      {p.isi.map(
                        (paragraf, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm leading-relaxed text-slate-600"
                          >
                            <CheckCircle2
                              size={14}
                              className="mt-1 flex-shrink-0 text-emerald-500"
                            />

                            <span>{paragraf}</span>
                          </li>
                        )
                      )}
                    </ul>

                    <div className="flex w-fit items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-600">
                      <Paperclip
                        size={13}
                        className="flex-shrink-0"
                      />

                      {p.lampiran}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredList.length === 0 && (
            <div className="py-10 text-center text-sm text-slate-400">
              Belum ada pengumuman pada kategori
              ini.
            </div>
          )}
        </div>

        {/* ==================================================================
            CTA
        ================================================================== */}

        <div className="mt-8 flex flex-col gap-4 rounded-2xl bg-blue-600 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-sm font-semibold text-white">
              Belum mendaftar?
            </p>

            <p className="mt-1 text-xs text-blue-100">
              Jangan lewatkan jadwal pendaftaran —
              mulai proses pendaftaran sekarang.
            </p>
          </div>

          <button
              type="button"
              onClick={() =>
                router.push("/PPDB/jalurPendaftaran")
              }
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Mulai Pendaftaran

              <ChevronRight size={15} />
            </button>
        </div>
      </div>
    </div>
  );
}