"use client";

import { useState } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  IdCard,
  Hash,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  XCircle,
  Copy,
  Check,
  Loader2,
  LogIn,
} from "lucide-react";

import { urlFormulirPendaftaran } from "@/app/components/ppdb/rutePpdb";
import { publikService } from "@/services/publik.service";

export default function PpdbCekPendaftaran() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();

  const tenant = Array.isArray(params?.tenant)
    ? params.tenant[0]
    : params?.tenant || (pathname ? pathname.split("/")[1] : "");

  const ppdbIndex = pathname ? pathname.indexOf("/PPDB") : -1;
  const basePath = ppdbIndex > 0 ? pathname.slice(0, ppdbIndex) : "";

  const nomorDariUrl =
    searchParams?.get("nomor") ||
    searchParams?.get("nomorPendaftaran") ||
    "";

  const [nomorPendaftaran, setNomorPendaftaran] = useState(nomorDariUrl);
  const [prevNomorDariUrl, setPrevNomorDariUrl] = useState(nomorDariUrl);
  const [nik, setNik] = useState("");
  const [validation, setValidation] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [hasil, setHasil] = useState(null);
  const [copied, setCopied] = useState(false);

  if (nomorDariUrl && nomorDariUrl !== prevNomorDariUrl) {
    setPrevNomorDariUrl(nomorDariUrl);
    setNomorPendaftaran(nomorDariUrl);
  }

  const handleCopy = (text) => {
    if (!text || typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleCek = async (event) => {
    event.preventDefault();
    setServerError("");
    setHasil(null);

    const nomorTrim = nomorPendaftaran.trim();
    const nikTrim = nik.trim();

    if (!nomorTrim || !nikTrim) {
      setValidation("Nomor pendaftaran dan NIK wajib diisi.");
      return;
    }

    if (!/^\d{16}$/.test(nikTrim)) {
      setValidation("NIK harus tepat 16 digit angka sesuai Kartu Keluarga.");
      return;
    }

    setValidation("");

    if (!tenant) {
      setServerError("Subdomain sekolah tidak terdeteksi pada tautan ini.");
      return;
    }

    try {
      setLoading(true);
      const res = await publikService.cekPendaftaran(tenant, {
        nomorPendaftaran: nomorTrim,
        nik: nikTrim,
      });

      const data = res?.data || res;
      if (!data || !data.nomorPendaftaran) {
        throw new Error("Data pendaftaran tidak ditemukan.");
      }

      setHasil(data);
    } catch (err) {
      const msg =
        err?.message ||
        "Pendaftaran tidak ditemukan atau data pencarian tidak sesuai.";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  const goToDaftar = () => {
    router.push(urlFormulirPendaftaran(basePath));
  };

  const statusLabel = (status) => {
    const s = String(status || "").toLowerCase();
    if (s === "lulus") {
      return {
        label: "LULUS / Terverifikasi",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: CheckCircle2,
      };
    }
    if (s === "ditolak") {
      return {
        label: "Ditolak",
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
        icon: XCircle,
      };
    }
    return {
      label: "Menunggu Verifikasi",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      icon: Clock3,
    };
  };

  const statusInfo = hasil ? statusLabel(hasil.status) : null;
  const StatusIcon = statusInfo?.icon;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
            <Search size={13} />
            Layanan Cek Status
          </div>

          <h1 className="mt-3 text-xl font-semibold text-slate-800 sm:text-2xl">
            Cek Pendaftaran PPDB
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Masukkan nomor pendaftaran dan NIK calon siswa untuk melihat status
            pendaftaran terkini langsung dari server sekolah.
          </p>
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
                  setServerError("");
                }}
                placeholder="Contoh: PPDB-2026-..."
                disabled={loading}
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 disabled:bg-slate-50"
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
                  setNik(event.target.value.replace(/\D/g, "").slice(0, 16));
                  setValidation("");
                  setServerError("");
                }}
                maxLength={16}
                inputMode="numeric"
                placeholder="16 digit sesuai Kartu Keluarga"
                disabled={loading}
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 disabled:bg-slate-50"
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              NIK digunakan sebagai pengaman pencarian data pendaftaran.
            </p>
          </div>

          {validation && (
            <p className="text-xs font-medium text-rose-600">{validation}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Memeriksa status...
              </>
            ) : (
              <>
                <Search size={15} />
                Cek Status
              </>
            )}
          </button>
        </form>

        {serverError && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 sm:p-5">
            <div className="flex-shrink-0 rounded-lg bg-rose-100 p-1.5 text-rose-600">
              <AlertCircle size={16} />
            </div>

            <div>
              <p className="text-sm font-semibold text-rose-900">
                Data tidak ditemukan
              </p>

              <p className="mt-1 text-xs leading-relaxed text-rose-700">
                {serverError}
              </p>
            </div>
          </div>
        )}

        {hasil && (
          <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-medium text-slate-500">
                  Status Pendaftaran
                </span>
                <h2 className="mt-0.5 text-base font-bold text-slate-800">
                  {hasil.namaLengkap}
                </h2>
              </div>

              {statusInfo && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusInfo.badgeClass}`}
                >
                  <StatusIcon size={14} />
                  {statusInfo.label}
                </span>
              )}
            </div>

            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-600">
                  Nomor Pendaftaran
                </span>

                <button
                  type="button"
                  onClick={() => handleCopy(hasil.nomorPendaftaran)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                >
                  {copied ? (
                    <>
                      <Check size={13} className="text-emerald-600" />
                      <span className="text-emerald-600">
                        Nomor pendaftaran berhasil disalin
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Salin Nomor Pendaftaran</span>
                    </>
                  )}
                </button>
              </div>

              <p className="mt-2 text-base font-bold text-slate-900 sm:text-lg">
                {hasil.nomorPendaftaran}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 p-3">
                <span className="text-[11px] font-medium text-slate-400">
                  Jalur Pendaftaran
                </span>
                <p className="mt-0.5 text-xs font-semibold text-slate-800">
                  {hasil.jalur || "-"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 p-3">
                <span className="text-[11px] font-medium text-slate-400">
                  Gelombang
                </span>
                <p className="mt-0.5 text-xs font-semibold text-slate-800">
                  {hasil.gelombang || "Reguler"}
                </p>
              </div>

              {hasil.statusSeleksi && (
                <div className="sm:col-span-2 rounded-xl border border-slate-100 p-3">
                  <span className="text-[11px] font-medium text-slate-400">
                    Hasil Seleksi
                  </span>
                  <p className="mt-0.5 text-xs font-semibold capitalize text-slate-800">
                    {hasil.statusSeleksi}
                  </p>
                </div>
              )}
            </div>

            {String(hasil.status).toLowerCase() === "lulus" && (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-emerald-900">
                      Selamat! Anda Dinyatakan Lulus
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-emerald-800">
                      Pendaftaran Anda telah diverifikasi dan disetujui oleh panitia
                      PPDB. Akun siswa Anda telah aktif dengan NISN Anda sebagai
                      username dan kata sandi default. Silakan login ke Portal
                      Siswa untuk informasi jadwal dan kelas.
                    </p>
                    <button
                      type="button"
                      onClick={() => router.push("/login")}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                    >
                      <LogIn size={13} />
                      Login ke Portal Siswa
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-5 text-center shadow-sm sm:p-6">
          <p className="text-sm text-slate-600">Belum mendaftar?</p>

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
