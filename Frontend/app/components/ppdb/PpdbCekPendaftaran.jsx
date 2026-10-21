"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  IdCard,
  Hash,
  AlertCircle,
  Info,
  ArrowRight,
  CheckCircle2,
  Clock3,
  XCircle,
  School,
  FileText,
  Loader2,
} from "lucide-react";

import PpdbNavbar from "@/app/components/ppdb/PpdbNavbar";
import { urlFormulirPendaftaran } from "@/app/components/ppdb/rutePpdb";

/*
 * Backend belum menyediakan endpoint publik untuk mengecek status
 * pendaftaran PPDB (nomor pendaftaran + NIK). Halaman ini TIDAK
 * mensimulasikan hasil dan TIDAK memakai data contoh.
 */
export const CEK_PENDAFTARAN_UNAVAILABLE =
  "Layanan cek status pendaftaran belum tersedia. Backend belum " +
  "menyediakan endpoint publik untuk memeriksa status berdasarkan nomor " +
  "pendaftaran dan NIK. Silakan hubungi panitia PPDB sekolah.";

export default function PpdbCekPendaftaran() {
  const router = useRouter();
  const pathname = usePathname();

  const [nomorPendaftaran, setNomorPendaftaran] = useState("");
  const [nik, setNik] = useState("");
  const [validation, setValidation] = useState("");
  const [showBlocker, setShowBlocker] = useState(false);

  const ppdbIndex = pathname
    ? pathname.indexOf("/PPDB")
    : -1;

  const basePath =
    ppdbIndex > 0 ? pathname.slice(0, ppdbIndex) : "";

  const handleCek = (event) => {
    event.preventDefault();

    setShowBlocker(false);

    if (!nomorPendaftaran.trim() || !nik.trim()) {
      setValidation(
        "Nomor pendaftaran dan NIK wajib diisi."
      );

      return;
    }

    setValidation("");

    /*
     * Tidak ada endpoint yang dapat dipanggil. Tampilkan blocker
     * secara eksplisit, bukan hasil palsu.
     */
    setShowBlocker(true);
  };

  const goToDaftar = () => {
    router.push(urlFormulirPendaftaran(basePath));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <PpdbNavbar />

      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
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

        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
          <div className="flex-shrink-0 rounded-lg bg-amber-100 p-1.5 text-amber-700">
            <Info size={16} />
          </div>

          <div>
            <p className="text-sm font-semibold text-amber-900">
              Fitur belum dapat digunakan
            </p>

            <p className="mt-1 text-xs leading-relaxed text-amber-800">
              {CEK_PENDAFTARAN_UNAVAILABLE}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleCek}
          className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"
        >
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
                onChange={(event) => {
                  setNomorPendaftaran(event.target.value);
                  setValidation("");
                  setShowBlocker(false);
                }}
                placeholder="Nomor pendaftaran"
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

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
                onChange={(event) => {
                  setNik(event.target.value);
                  setValidation("");
                  setShowBlocker(false);
                }}
                placeholder="16 digit sesuai Kartu Keluarga"
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          {validation && (
            <p className="text-xs font-medium text-rose-600">
              {validation}
            </p>
          )}

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
          >
            <Search size={15} />
            Cek Status
          </button>
        </form>

        {showBlocker && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-white p-4 sm:p-5">
            <div className="flex-shrink-0 rounded-lg bg-rose-50 p-1.5 text-rose-600">
              <AlertCircle size={16} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800">
                Status tidak dapat diperiksa
              </p>

              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                {CEK_PENDAFTARAN_UNAVAILABLE}
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-5 text-center shadow-sm sm:p-6">
          <p className="text-sm text-slate-600">
            Belum mendaftar?
          </p>

          <button
            type="button"
            onClick={goToDaftar}
            className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
          >
            Buka Formulir Pendaftaran
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
