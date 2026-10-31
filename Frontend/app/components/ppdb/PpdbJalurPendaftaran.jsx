"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  Calendar,
  Users,
  Route,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { urlFormulirPendaftaran } from "@/app/components/ppdb/rutePpdb";
import { publikService } from "@/services/publik.service";

export default function JalurPendaftaranPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const tenant = Array.isArray(params?.tenant)
    ? params.tenant[0]
    : params?.tenant || (pathname ? pathname.split("/")[1] : "");

  const ppdbIndex = pathname ? pathname.indexOf("/PPDB") : -1;
  const basePath = ppdbIndex > 0 ? pathname.slice(0, ppdbIndex) : "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [jalurList, setJalurList] = useState([]);
  const [sekolah, setSekolah] = useState(null);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    if (!tenant) return;
    let aktif = true;

    async function loadOptions() {
      try {
        setLoading(true);
        setError("");
        const res = await publikService.getPpdbOptions(tenant);
        const data = res?.data || res;
        if (!aktif) return;

        setSekolah(data?.sekolah || null);
        const list = Array.isArray(data?.jalur) ? data.jalur : [];
        setJalurList(list);
        if (list.length > 0) {
          setOpenId(list[0].id);
        }
      } catch (err) {
        if (!aktif) return;
        setError(err?.message || "Gagal memuat daftar jalur PPDB dari server.");
      } finally {
        if (aktif) setLoading(false);
      }
    }

    loadOptions();
    return () => {
      aktif = false;
    };
  }, [tenant]);

  const handleDaftarJalur = (jalurId) => {
    if (jalurId) {
      router.push(`${basePath}/PPDB/daftar?jalurPpdbId=${encodeURIComponent(jalurId)}`);
    } else {
      router.push(urlFormulirPendaftaran(basePath));
    }
  };

  const formatTanggal = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
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
                Jalur PPDB Resmi
              </span>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Jalur Pendaftaran {sekolah?.nama || ""}
              </h1>

              <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
                Daftar jalur pendaftaran resmi yang aktif di sistem sekolah.
                Pilih jalur yang sesuai dengan kriteria calon peserta didik.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="text-center text-slate-500">
                <Loader2 size={24} className="mx-auto animate-spin text-blue-600" />
                <p className="mt-2 text-xs font-medium">Memuat jalur pendaftaran...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-500" />
              <div>
                <p className="font-semibold text-rose-900">Gagal Memuat Jalur</p>
                <p className="mt-1 text-xs">{error}</p>
              </div>
            </div>
          ) : jalurList.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Route size={24} />
              </div>
              <h2 className="mt-4 text-base font-bold text-slate-800">
                Belum Ada Jalur Pendaftaran Aktif
              </h2>
              <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
                Saat ini belum ada jalur pendaftaran yang dibuka untuk sekolah ini.
                Silakan pantau pengumuman atau hubungi pihak sekolah.
              </p>
            </div>
          ) : (
            <div className="grid gap-5">
              {jalurList.map((jalur) => {
                const isOpen = openId === jalur.id;
                const dibuka = Boolean(jalur.pendaftaranDibuka ?? true);

                return (
                  <div
                    key={jalur.id}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? null : jalur.id)}
                      className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <Route size={22} />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                              {jalur.nama}
                            </h2>

                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                                dibuka
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {dibuka ? "Pendaftaran Dibuka" : "Pendaftaran Ditutup"}
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-slate-500">
                            {jalur.deskripsi || "Jalur pendaftaran resmi sekolah."}
                          </p>
                        </div>
                      </div>

                      <ChevronDown
                        size={20}
                        className={`shrink-0 text-slate-400 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="border-t border-slate-100 px-5 pb-5 sm:px-6 sm:pb-6">
                        <div className="grid gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-3">
                          <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600">
                            <Users size={16} className="text-blue-600" />
                            <span>
                              Kuota:{" "}
                              <strong className="text-slate-800">
                                {jalur.kuota ? `${jalur.kuota} siswa` : "Tidak dibatasi"}
                              </strong>
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600">
                            <Calendar size={16} className="text-blue-600" />
                            <span>
                              Mulai:{" "}
                              <strong className="text-slate-800">
                                {formatTanggal(jalur.tanggalMulai)}
                              </strong>
                            </span>
                          </div>

                          <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600">
                            <Calendar size={16} className="text-blue-600" />
                            <span>
                              Selesai:{" "}
                              <strong className="text-slate-800">
                                {formatTanggal(jalur.tanggalSelesai)}
                              </strong>
                            </span>
                          </div>
                        </div>

                        <div className="mt-5 flex items-center justify-end border-t border-slate-100 pt-4">
                          <button
                            type="button"
                            onClick={() => handleDaftarJalur(jalur.id)}
                            disabled={!dibuka}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Daftar Melalui Jalur Ini
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
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