"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  ArrowLeft,
  Megaphone,
  Pencil,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";

import {
  getPengumumanPpdbById,
  deletePengumumanPpdb,
} from "@/services/ppdb.service";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText = "text-[var(--color-primary)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

export default function DetailPengumumanPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [collapsed, setCollapsed] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const muatDetail = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const res = await getPengumumanPpdbById(id);
      if (res?.success && res.data) {
        setData(res.data);
      } else {
        setError("Pengumuman tidak ditemukan.");
      }
    } catch (err) {
      setError(
        err?.message || "Gagal memuat detail pengumuman dari server."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let cancel = false;
    const timer = setTimeout(() => {
      if (!cancel) {
        muatDetail();
      }
    }, 0);
    return () => {
      cancel = true;
      clearTimeout(timer);
    };
  }, [muatDetail]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deletePengumumanPpdb(id);
      router.push("/admin/spmb/pengumuman");
    } catch (err) {
      setError(
        err?.message || "Gagal menghapus pengumuman. Silakan coba lagi."
      );
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const formatTanggal = (dateString) => {
    if (!dateString) return "-";
    try {
      const d = new Date(dateString);
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    } catch {
      return dateString;
    }
  };

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="spmb"
        setActive={() => {}}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        role="admin"
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b theme-border">
          <Header
            toggleSidebar={() => setCollapsed((v) => !v)}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Link
                  href="/admin/spmb/pengumuman"
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} transition ${themeNeutralHover}`}
                  title="Kembali ke Daftar Pengumuman"
                >
                  <ArrowLeft size={18} className="theme-text-muted" />
                </Link>

                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft}`}
                >
                  <Megaphone size={20} className={themePrimaryText} />
                </div>

                <div>
                  <h1 className="text-xl font-bold tracking-tight theme-text sm:text-2xl">
                    Detail Pengumuman PPDB
                  </h1>
                  <p className="mt-0.5 text-xs theme-text-muted sm:text-sm">
                    Informasi lengkap dan status publikasi pengumuman.
                  </p>
                </div>
              </div>

              {data && (
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/spmb/pengumuman/${id}/edit`}
                    className={`inline-flex items-center gap-1.5 rounded-lg border ${themePrimarySoftBorder} ${themePrimarySoft} px-3.5 py-2 text-xs font-semibold ${themePrimaryText} transition hover:opacity-90`}
                  >
                    <Pencil size={14} />
                    Edit Pengumuman
                  </Link>

                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[color-mix(in_srgb,var(--color-danger)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)] px-3.5 py-2 text-xs font-semibold theme-danger transition hover:opacity-90"
                  >
                    <Trash2 size={14} />
                    Hapus
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div
                className={`flex min-h-[350px] items-center justify-center rounded-2xl border ${themeNeutralBorder} theme-card ${themeCardShadow}`}
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <Loader2
                    size={28}
                    className={`animate-spin ${themePrimaryText}`}
                  />
                  <p className="text-xs theme-text-muted">
                    Memuat informasi pengumuman...
                  </p>
                </div>
              </div>
            ) : error || !data ? (
              <div
                className={`flex min-h-[350px] items-center justify-center rounded-2xl border ${themeNeutralBorder} theme-card ${themeCardShadow} p-6`}
              >
                <div className="max-w-md text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)] theme-danger mb-3">
                    <AlertCircle size={24} />
                  </div>
                  <h3 className="text-sm font-bold theme-text">
                    Data Pengumuman Tidak Ditemukan
                  </h3>
                  <p className="mt-1 text-xs theme-text-muted">
                    {error || "Pengumuman dengan ID tersebut tidak tersedia atau sudah dihapus."}
                  </p>
                  <Link
                    href="/admin/spmb/pengumuman"
                    className={`mt-4 inline-flex items-center gap-2 rounded-lg ${themePrimaryGradient} px-4 py-2 text-xs font-semibold text-[var(--color-card)]`}
                  >
                    <ArrowLeft size={14} />
                    Kembali ke Pengumuman
                  </Link>
                </div>
              </div>
            ) : (
              <div
                className={`rounded-2xl border ${themeNeutralBorder} theme-card ${themeCardShadow} p-6 sm:p-8 space-y-6`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b ${themeDivider} pb-5">
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
                      Judul Pengumuman
                    </span>
                    <h2 className="text-xl font-bold theme-text sm:text-2xl">
                      {data.judul}
                    </h2>
                  </div>

                  <div>
                    {data.status === "dipublikasikan" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--color-success)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)] px-3 py-1 text-xs font-semibold text-[var(--color-success)]">
                        <CheckCircle2 size={13} />
                        Dipublikasikan
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-[color-mix(in_srgb,var(--color-text)_15%,transparent)] bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] px-3 py-1 text-xs font-medium theme-text-muted">
                        Draft
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-4 sm:grid-cols-3">
                  <div className="flex items-start gap-2.5">
                    <Calendar size={16} className="text-blue-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[11px] font-medium theme-text-muted">
                        Tanggal Publikasi
                      </p>
                      <p className="text-xs font-semibold theme-text mt-0.5">
                        {formatTanggal(data.dipublikasikanPada)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Clock size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[11px] font-medium theme-text-muted">
                        Dibuat Pada
                      </p>
                      <p className="text-xs font-semibold theme-text mt-0.5">
                        {formatTanggal(data.dibuatPada)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Clock size={16} className="text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[11px] font-medium theme-text-muted">
                        Terakhir Diperbarui
                      </p>
                      <p className="text-xs font-semibold theme-text mt-0.5">
                        {formatTanggal(data.diperbaruiPada)}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider theme-text-muted mb-3">
                    Isi Pengumuman
                  </h3>
                  <div
                    className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-5 text-sm leading-relaxed theme-text whitespace-pre-line`}
                  >
                    {data.konten}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-2xl border ${themeNeutralBorder} theme-card ${themeCardShadow} p-6`}
          >
            <div className="flex items-center justify-between border-b pb-3 theme-border">
              <h3 className="text-base font-bold theme-text">
                Konfirmasi Hapus Pengumuman
              </h3>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="theme-text-muted hover:theme-text"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-xs leading-relaxed theme-text-secondary">
                Apakah Anda yakin ingin menghapus pengumuman ini secara permanen dari sistem?
              </p>
              <div
                className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-3`}
              >
                <p className="text-xs font-bold theme-text">
                  {data?.judul}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setConfirmDelete(false)}
                className={`rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} px-4 py-2 text-xs font-medium theme-text transition ${themeNeutralHover}`}
              >
                Batal
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-danger)] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                Hapus Pengumuman
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
