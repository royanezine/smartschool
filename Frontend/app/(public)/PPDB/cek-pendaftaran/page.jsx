"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  IdCard,
  Hash,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  ChevronRight,
  AlertCircle,
  School,
  MapPin,
} from "lucide-react";

import PpdbNavbar from "../../components/ppdb/PpdbNavbar";

// ============================================================================
// DUMMY DATA
// ============================================================================
// Catatan: ganti dengan pemanggilan API asli begitu tersedia.
// Simulasi: nomor pendaftaran "2026000123" akan mengembalikan hasil "lulus".
// Nomor lain akan mengembalikan hasil "tidak ditemukan" untuk contoh.
// ============================================================================

const contohHasil = {
  nomorPendaftaran: "2026000123",
  nama: "Andika Putra Ramadhan",
  jalur: "Jalur Zonasi",
  sekolahTujuan: "SMA Negeri 1 SmartSchool",
  status: "lulus", // "lulus" | "tidak_lulus" | "proses"
  tahapan: [
    {
      id: 1,
      label: "Pendaftaran Diterima",
      tanggal: "12 Juni 2026",
      selesai: true,
    },
    {
      id: 2,
      label: "Verifikasi Berkas",
      tanggal: "22 Juni 2026",
      selesai: true,
    },
    {
      id: 3,
      label: "Hasil Seleksi",
      tanggal: "27 Juni 2026",
      selesai: true,
    },
    {
      id: 4,
      label: "Daftar Ulang",
      tanggal: "28 - 30 Juni 2026",
      selesai: false,
    },
  ],
};

const statusConfig = {
  lulus: {
    label: "Dinyatakan Lulus",
    icon: CheckCircle2,
    text: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  tidak_lulus: {
    label: "Belum Lulus",
    icon: XCircle,
    text: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
  },
  proses: {
    label: "Masih Dalam Proses",
    icon: Clock,
    text: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
};

export default function CekPendaftaranPage() {
  const router = useRouter();

  const [nomorPendaftaran, setNomorPendaftaran] =
    useState("");
  const [nik, setNik] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasil, setHasil] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const handleCek = (e) => {
    e.preventDefault();

    if (!nomorPendaftaran || !nik) {
      return;
    }

    setLoading(true);
    setHasil(null);
    setNotFound(false);

    // Simulasi pemanggilan API.
    // Ganti dengan API asli ketika endpoint cek pendaftaran tersedia.
    setTimeout(() => {
      setLoading(false);

      if (
        nomorPendaftaran.trim() ===
        contohHasil.nomorPendaftaran
      ) {
        setHasil(contohHasil);
      } else {
        setNotFound(true);
      }
    }, 900);
  };

  const statusInfo = hasil
    ? statusConfig[hasil.status]
    : null;

  const StatusIcon = statusInfo?.icon;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ====================================================================
          NAVBAR
      ==================================================================== */}

      <PpdbNavbar />

      {/* ====================================================================
          CONTENT
      ==================================================================== */}

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        {/* PAGE TITLE */}

        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
            <Search size={13} />
            Layanan Cek Status
          </div>

          <h1 className="mt-3 text-xl font-semibold text-slate-800 sm:text-2xl">
            Cek Pendaftaran
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Masukkan nomor pendaftaran dan NIK calon
            siswa untuk melihat status pendaftaran
            terkini.
          </p>
        </div>

        {/* ==================================================================
            FORM PENCARIAN
        ================================================================== */}

        <form
          onSubmit={handleCek}
          className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"
        >
          {/* NOMOR PENDAFTARAN */}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Nomor Pendaftaran
            </label>

            <div className="relative">
              <Hash
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={nomorPendaftaran}
                onChange={(e) =>
                  setNomorPendaftaran(
                    e.target.value
                  )
                }
                placeholder="Contoh: 2026000123"
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          {/* NIK */}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              NIK Calon Siswa
            </label>

            <div className="relative">
              <IdCard
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={nik}
                onChange={(e) =>
                  setNik(e.target.value)
                }
                placeholder="16 digit sesuai Kartu Keluarga"
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2
                  size={15}
                  className="animate-spin"
                />
                Memeriksa...
              </>
            ) : (
              <>
                <Search size={15} />
                Cek Status
              </>
            )}
          </button>

          <p className="text-center text-[11px] text-slate-500">
            Coba nomor pendaftaran{" "}
            <span className="font-semibold text-slate-700">
              2026000123
            </span>{" "}
            untuk melihat contoh hasil.
          </p>
        </form>

        {/* ==================================================================
            HASIL — TIDAK DITEMUKAN
        ================================================================== */}

        {notFound && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-white p-4 sm:p-5">
            <div className="flex-shrink-0 rounded-lg bg-amber-50 p-1.5 text-amber-600">
              <AlertCircle size={16} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800">
                Data tidak ditemukan
              </p>

              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Pastikan nomor pendaftaran dan NIK
                yang dimasukkan sudah benar. Jika
                masalah berlanjut, hubungi panitia
                PPDB melalui kontak yang tertera di
                halaman utama.
              </p>
            </div>
          </div>
        )}

        {/* ==================================================================
            HASIL — DITEMUKAN
        ================================================================== */}

        {hasil && statusInfo && (
          <div className="mt-5 space-y-4">
            {/* RINGKASAN STATUS */}

            <div
              className={`rounded-2xl border ${statusInfo.border} bg-white p-5 shadow-sm sm:p-6`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500">
                    Nomor Pendaftaran
                  </p>

                  <p className="text-sm font-semibold text-slate-800">
                    {hasil.nomorPendaftaran}
                  </p>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${statusInfo.text} ${statusInfo.bg}`}
                >
                  <StatusIcon size={14} />
                  {statusInfo.label}
                </span>
              </div>

              <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-4">
                {/* NAMA */}

                <div className="flex items-center gap-2.5 text-sm text-slate-800">
                  <span className="w-28 flex-shrink-0 text-slate-500">
                    Nama
                  </span>

                  <span className="font-medium">
                    {hasil.nama}
                  </span>
                </div>

                {/* JALUR */}

                <div className="flex items-center gap-2.5 text-sm text-slate-800">
                  <MapPin
                    size={14}
                    className="flex-shrink-0 text-slate-500"
                  />

                  <span className="w-24 flex-shrink-0 text-slate-500">
                    Jalur
                  </span>

                  <span className="font-medium">
                    {hasil.jalur}
                  </span>
                </div>

                {/* SEKOLAH */}

                <div className="flex items-center gap-2.5 text-sm text-slate-800">
                  <School
                    size={14}
                    className="flex-shrink-0 text-slate-500"
                  />

                  <span className="w-24 flex-shrink-0 text-slate-500">
                    Sekolah
                  </span>

                  <span className="font-medium">
                    {hasil.sekolahTujuan}
                  </span>
                </div>
              </div>
            </div>

            {/* ==================================================================
                PROGRESS TAHAPAN
            ================================================================== */}

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 text-sm font-semibold text-slate-800">
                Progres Tahapan
              </h2>

              <div className="space-y-0">
                {hasil.tahapan.map((t, idx) => {
                  const isLast =
                    idx ===
                    hasil.tahapan.length - 1;

                  return (
                    <div
                      key={t.id}
                      className="flex gap-3"
                    >
                      {/* ICON + RAIL */}

                      <div className="flex flex-shrink-0 flex-col items-center">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-full ${
                            t.selesai
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {t.selesai ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <Clock size={13} />
                          )}
                        </div>

                        {!isLast && (
                          <div
                            className={`my-0.5 min-h-[1.5rem] w-px flex-1 ${
                              t.selesai
                                ? "bg-emerald-300"
                                : "bg-slate-200"
                            }`}
                          />
                        )}
                      </div>

                      {/* DETAIL */}

                      <div
                        className={
                          isLast
                            ? "pb-0"
                            : "pb-4"
                        }
                      >
                        <p
                          className={`text-sm font-medium ${
                            t.selesai
                              ? "text-slate-800"
                              : "text-slate-500"
                          }`}
                        >
                          {t.label}
                        </p>

                        <p className="text-xs text-slate-500">
                          {t.tanggal}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ==================================================================
                DAFTAR ULANG
            ================================================================== */}

            {hasil.status === "lulus" && (
              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/PPDB/daftar-ulang"
                  )
                }
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Lanjutkan ke Daftar Ulang
                <ChevronRight size={15} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}