"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Megaphone, Calendar, ArrowLeft, RefreshCw, AlertCircle } from "lucide-react";
import { publikService } from "@/services/publik.service";

export default function PpdbPengumuman() {
  const params = useParams();
  const tenant = Array.isArray(params?.tenant)
    ? params.tenant[0]
    : params?.tenant;
  const subdomain = tenant ? String(tenant) : "";
  const basePath = subdomain ? `/${subdomain}` : "";

  const [pengumumanList, setPengumumanList] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const muatPengumuman = useCallback(async () => {
    if (!subdomain) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await publikService.getPpdbPengumuman(subdomain, {
        page,
        limit: 10,
      });

      if (res?.success) {
        setPengumumanList(Array.isArray(res.data) ? res.data : []);
        if (res.meta) {
          setMeta(res.meta);
        }
      } else {
        setPengumumanList([]);
      }
    } catch (err) {
      setError(
        err?.message ||
          "Gagal memuat pengumuman PPDB. Silakan coba beberapa saat lagi."
      );
    } finally {
      setLoading(false);
    }
  }, [subdomain, page]);

  useEffect(() => {
    let cancel = false;
    const timer = setTimeout(() => {
      if (!cancel) {
        muatPengumuman();
      }
    }, 0);
    return () => {
      cancel = true;
      clearTimeout(timer);
    };
  }, [muatPengumuman]);

  const formatTanggal = (dateString) => {
    if (!dateString) return "-";
    try {
      const d = new Date(dateString);
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(d);
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6">
          <Link
            href={`${basePath}/PPDB`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600 transition"
          >
            <ArrowLeft size={14} />
            Kembali ke Portal PPDB
          </Link>
        </div>

        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
            <Megaphone size={13} />
            Pengumuman Resmi PPDB
          </div>

          <h1 className="mt-3 text-2xl font-bold text-slate-800 sm:text-3xl">
            Pengumuman
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Informasi resmi seputar pendaftaran, jadwal seleksi, verifikasi berkas,
            dan hasil kelulusan PPDB.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="h-4 w-1/4 rounded bg-slate-200 mb-3" />
                <div className="h-6 w-3/4 rounded bg-slate-200 mb-4" />
                <div className="h-4 w-full rounded bg-slate-100 mb-2" />
                <div className="h-4 w-5/6 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-3">
              <AlertCircle size={24} />
            </div>
            <h2 className="text-base font-semibold text-rose-900">
              Gagal Memuat Pengumuman
            </h2>
            <p className="mt-1 text-xs text-rose-700 max-w-md mx-auto">
              {error}
            </p>
            <button
              type="button"
              onClick={muatPengumuman}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition"
            >
              <RefreshCw size={14} />
              Coba Lagi
            </button>
          </div>
        ) : pengumumanList.length === 0 ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Megaphone size={28} />
            </div>

            <h2 className="mt-4 text-base font-semibold text-slate-800">
              Belum Ada Pengumuman
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
              Saat ini belum ada pengumuman resmi PPDB yang dipublikasikan. Silakan
              periksa kembali secara berkala untuk pembaruan terbaru.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pengumumanList.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
                  <div className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar size={14} className="text-slate-400" />
                    <span>
                      {formatTanggal(item.dipublikasikanPada || item.dibuatPada)}
                    </span>
                  </div>

                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200">
                    Resmi
                  </span>
                </div>

                <h2 className="text-lg font-bold text-slate-800 mb-3 sm:text-xl">
                  {item.judul}
                </h2>

                <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed whitespace-pre-line">
                  {item.konten}
                </div>
              </article>
            ))}

            {meta.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2 pt-4">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sebelumnya
                </button>
                <span className="text-xs text-slate-600">
                  Halaman {meta.page} dari {meta.totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Selanjutnya
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
