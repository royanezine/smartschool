"use client";

import { useRouter } from "next/navigation";
import {
  UserPlus,
  UploadCloud,
  ListChecks,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

import PpdbNavbar from "../../components/ppdb/PpdbNavbar";

// ============================================================================
// INFORMASI ALUR PPDB
// ============================================================================
// BE saat ini belum menyediakan endpoint untuk mengambil data tahapan/alur PPDB.
// Karena itu data berikut hanya digunakan sebagai informasi statis pada halaman
// publik dan TIDAK dikirim/fetch ke backend.
//
// Endpoint BE yang tersedia saat ini:
// - POST /api/v1/ppdb/daftar
// - POST /api/v1/ppdb/:id/berkas
// - PATCH /api/v1/ppdb/:id/verifikasi
// - CRUD /api/v1/jalur-ppdb (khusus admin_sekolah)
// ============================================================================

const langkahPendaftaran = [
  {
    id: 1,
    title: "Buat Akun",
    waktu: "1 - 20 Juni 2026",
    icon: UserPlus,
    desc: "Daftar akun menggunakan data calon siswa dan orang tua/wali yang valid.",
    detail: [
      'Kunjungi halaman "Daftar Sekarang"',
      "Masukkan data calon siswa dan orang tua/wali dengan benar",
      "Pastikan nomor telepon dan email yang digunakan masih aktif",
    ],
    tip: "Gunakan kontak yang aktif agar informasi terkait pendaftaran dapat diterima dengan baik.",
  },
  {
    id: 2,
    title: "Lengkapi Berkas",
    waktu: "1 - 20 Juni 2026",
    icon: UploadCloud,
    desc: "Lengkapi dokumen pendaftaran sesuai persyaratan jalur yang dipilih.",
    detail: [
      "Siapkan Kartu Keluarga (KK)",
      "Siapkan Akta Kelahiran dan dokumen pendukung lainnya",
      "Upload dokumen melalui halaman pendaftaran",
    ],
    tip: "Pastikan file dokumen dapat dibaca dengan jelas dan sesuai format serta ukuran yang ditentukan.",
  },
  {
    id: 3,
    title: "Pilih Jalur & Sekolah",
    waktu: "1 - 20 Juni 2026",
    icon: ListChecks,
    desc: "Tentukan jalur PPDB dan sekolah tujuan sesuai ketentuan yang berlaku.",
    detail: [
      "Pilih salah satu jalur pendaftaran yang tersedia",
      "Pastikan sekolah tujuan sesuai dengan pilihan calon siswa",
      "Periksa kembali seluruh data sebelum mengirim pendaftaran",
    ],
    tip: "Pastikan jalur yang dipilih sesuai dengan kondisi dan dokumen calon siswa.",
  },
  {
    id: 4,
    title: "Seleksi Berkas",
    waktu: "21 - 24 Juni 2026",
    icon: Search,
    desc: "Panitia PPDB melakukan pemeriksaan terhadap data dan dokumen pendaftaran.",
    detail: [
      "Panitia memeriksa data calon siswa",
      "Panitia memeriksa kelengkapan dokumen yang telah diupload",
      "Berkas yang tidak sesuai dapat memerlukan perbaikan atau verifikasi ulang",
    ],
    tip: "Periksa informasi pendaftaran secara berkala selama proses seleksi.",
  },
  {
    id: 5,
    title: "Cek Hasil Seleksi",
    waktu: "27 Juni 2026",
    icon: CheckCircle2,
    desc: "Calon siswa dapat memeriksa hasil proses seleksi setelah pengumuman.",
    detail: [
      "Buka halaman Cek Pendaftaran",
      "Masukkan informasi pendaftaran yang diperlukan",
      "Periksa status hasil seleksi calon siswa",
    ],
    tip: "Simpan nomor pendaftaran dengan baik karena dapat diperlukan saat pengecekan status.",
  },
  {
    id: 6,
    title: "Daftar Ulang",
    waktu: "28 - 30 Juni 2026",
    icon: ChevronRight,
    desc: "Calon siswa yang dinyatakan lulus mengikuti proses daftar ulang sesuai ketentuan sekolah.",
    detail: [
      "Ikuti instruksi daftar ulang dari sekolah",
      "Siapkan dokumen asli apabila diminta",
      "Selesaikan proses daftar ulang sesuai jadwal yang ditentukan",
    ],
    tip: "Pastikan proses daftar ulang diselesaikan dalam periode yang telah ditentukan.",
  },
];

export default function AlurPendaftaranPage() {
  const router = useRouter();

  const handleDaftar = () => {
    router.push("/PPDB/daftar");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ====================================================================
          NAVBAR
      ==================================================================== */}
      <PpdbNavbar />

      {/* ====================================================================
          CONTENT
      ==================================================================== */}
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        {/* PAGE TITLE */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
            <Clock size={13} />
            6 tahapan — 1 Juni s/d 30 Juni 2026
          </div>

          <h1 className="mt-3 text-xl font-semibold text-slate-800 sm:text-2xl">
            Alur Pendaftaran
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Ikuti tahapan berikut secara berurutan agar proses pendaftaran
            calon siswa baru berjalan lancar.
          </p>
        </div>

        {/* ==================================================================
            TIMELINE
        ================================================================== */}
        <div className="space-y-0">
          {langkahPendaftaran.map((l, idx) => {
            const Icon = l.icon;

            const isLast =
              idx === langkahPendaftaran.length - 1;

            return (
              <div
                key={l.id}
                className="flex gap-4 sm:gap-5"
              >
                {/* RAIL */}
                <div className="flex shrink-0 flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
                    <Icon size={17} />
                  </div>

                  {!isLast && (
                    <div className="my-1 min-h-[2rem] w-px flex-1 bg-slate-200" />
                  )}
                </div>

                {/* CONTENT */}
                <div
                  className={`min-w-0 flex-1 ${
                    isLast ? "pb-0" : "pb-6"
                  }`}
                >
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
                    {/* TITLE + DATE */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800">
                        Langkah {l.id} — {l.title}
                      </p>

                      <span className="flex-shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-600">
                        {l.waktu}
                      </span>
                    </div>

                    {/* DESCRIPTION */}
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                      {l.desc}
                    </p>

                    {/* DETAILS */}
                    <ul className="mt-3 space-y-2">
                      {l.detail.map((d, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-slate-600"
                        >
                          <CheckCircle2
                            size={14}
                            className="mt-0.5 flex-shrink-0 text-emerald-500"
                          />

                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>

                    {/* TIP */}
                    <div className="mt-4 flex items-start gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
                      <AlertCircle
                        size={14}
                        className="mt-0.5 flex-shrink-0 text-amber-500"
                      />

                      <span>{l.tip}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ==================================================================
            CTA
        ================================================================== */}
        <div className="mt-8 flex flex-col gap-4 rounded-2xl bg-blue-600 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-sm font-semibold text-white">
              Siap memulai pendaftaran?
            </p>

            <p className="mt-1 text-xs text-blue-100">
              Siapkan data dan dokumen yang diperlukan sebelum melakukan
              pendaftaran.
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
      </main>
    </div>
  );
}