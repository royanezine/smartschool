"use client";

import { usePathname, useRouter } from "next/navigation";
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

import PpdbNavbar from "@/app/components/ppdb/PpdbNavbar";



const langkahPendaftaran = [
  {
    id: 1,
    title: "Buka Tautan Resmi Sekolah",
    waktu: "Sesuai jadwal sekolah",
    icon: ListChecks,
    desc: "Pendaftaran dibuka melalui tautan resmi yang dibagikan panitia PPDB sekolah.",
    detail: [
      "Minta tautan pendaftaran kepada panitia PPDB sekolah tujuan",
      "Tautan sudah memuat sekolah dan jalur yang dibuka",
      "Tidak perlu mengetik atau mencari ID sekolah/jalur sendiri",
    ],
    tip: "Jangan menggunakan tautan yang tidak jelas asalnya. Tanyakan langsung kepada panitia PPDB sekolah.",
  },
  {
    id: 2,
    title: "Isi Data Pendaftaran",
    waktu: "Sesuai jadwal sekolah",
    icon: UserPlus,
    desc: "Lengkapi data calon siswa dan orang tua/wali sesuai dokumen resmi.",
    detail: [
      "Isi nama lengkap, NISN, tempat dan tanggal lahir",
      "Lengkapi alamat, kontak, dan data orang tua/wali",
      "Periksa kembali seluruh data sebelum mengirim",
    ],
    tip: "Data yang dikirim akan diverifikasi sekolah. Pastikan sesuai dengan dokumen resmi.",
  },
  {
    id: 3,
    title: "Unggah Dokumen",
    waktu: "Setelah data terkirim",
    icon: UploadCloud,
    desc: "Unggah dokumen wajib satu per satu setelah data pendaftaran berhasil dikirim.",
    detail: [
      "Unggah Kartu Keluarga (KK)",
      "Unggah Akta Kelahiran",
      "Unggah Ijazah atau Surat Keterangan Lulus",
      "Format JPG, PNG, atau PDF maksimal 5MB per file",
    ],
    tip: "Setiap dokumen memiliki status sendiri. Jika satu gagal, cukup unggah ulang dokumen tersebut tanpa mengulang dokumen yang sudah berhasil.",
  },
  {
    id: 4,
    title: "Verifikasi oleh Sekolah",
    waktu: "Sesuai kebijakan sekolah",
    icon: Search,
    desc: "Panitia PPDB sekolah memeriksa data dan dokumen yang telah dikirim.",
    detail: [
      "Server memberikan konfirmasi saat data dan dokumen diterima",
      "Panitia memeriksa kelengkapan dan kesesuaian dokumen",
      "Hubungi panitia sekolah untuk mengetahui status verifikasi",
    ],
    tip: "Backend belum menyediakan layanan cek status publik. Simpan nomor pendaftaran dan hubungi panitia sekolah.",
  },
  {
    id: 5,
    title: "Simpan Nomor Pendaftaran",
    waktu: "Setelah pendaftaran",
    icon: CheckCircle2,
    desc: "Nomor pendaftaran ditampilkan hanya jika dikembalikan oleh server.",
    detail: [
      "Catat nomor pendaftaran yang tampil pada ringkasan",
      "Simpan juga ID pendaftaran sebagai referensi",
      "Ringkasan di browser bersifat sementara, bukan pengumuman resmi",
    ],
    tip: "Ikuti pengumuman resmi sekolah untuk jadwal seleksi, hasil, dan daftar ulang.",
  },
];

export default function AlurPendaftaranPage() {
  const router = useRouter();
  const pathname = usePathname();

  const ppdbIndex = pathname
    ? pathname.indexOf("/PPDB")
    : -1;

  const basePath =
    ppdbIndex > 0 ? pathname.slice(0, ppdbIndex) : "";

  const handleDaftar = () => {
    router.push(`${basePath}/PPDB/jalurPendaftaran`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PpdbNavbar />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
            <Clock size={13} />
            {langkahPendaftaran.length} tahapan pendaftaran
          </div>

          <h1 className="mt-3 text-xl font-semibold text-slate-800 sm:text-2xl">
            Alur Pendaftaran
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Ikuti tahapan berikut secara berurutan agar proses pendaftaran
            calon siswa baru berjalan lancar.
          </p>
        </div>

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
                <div className="flex shrink-0 flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
                    <Icon size={17} />
                  </div>

                  {!isLast && (
                    <div className="my-1 min-h-[2rem] w-px flex-1 bg-slate-200" />
                  )}
                </div>

                <div
                  className={`min-w-0 flex-1 ${
                    isLast ? "pb-0" : "pb-6"
                  }`}
                >
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800">
                        Langkah {l.id} — {l.title}
                      </p>

                      <span className="flex-shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-600">
                        {l.waktu}
                      </span>
                    </div>

                    <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                      {l.desc}
                    </p>

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
            onClick={handleDaftar}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50"
          >
            Mulai Pendaftaran

            <ChevronRight size={15} />
          </button>
        </div>
      </main>
    </div>
  );
}