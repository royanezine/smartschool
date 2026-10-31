"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  Megaphone,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Search,
  RefreshCw,
  AlertCircle,
  Calendar,
  ArrowLeft,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import {
  getPengumumanPpdb,
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

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

export default function PengumumanSpmbPage() {
  const [collapsed, setCollapsed] = useState(false);

  const [daftarPengumuman, setDaftarPengumuman] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalData: 0,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const muatData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await getPengumumanPpdb({
        page,
        limit: 10,
      });

      if (res?.success) {
        setDaftarPengumuman(Array.isArray(res.data) ? res.data : []);
        if (res.meta) {
          setMeta(res.meta);
        }
      } else {
        setDaftarPengumuman([]);
      }
    } catch (err) {
      setError(
        err?.message ||
          "Gagal memuat data pengumuman PPDB. Pastikan server aktif."
      );
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    let cancel = false;
    const timer = setTimeout(() => {
      if (!cancel) {
        muatData();
      }
    }, 0);
    return () => {
      cancel = true;
      clearTimeout(timer);
    };
  }, [muatData]);

  const filteredData = useMemo(() => {
    return daftarPengumuman.filter((item) => {
      const matchSearch =
        !search.trim() ||
        item.judul?.toLowerCase().includes(search.toLowerCase()) ||
        item.konten?.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        filterStatus === "semua" || item.status === filterStatus;

      return matchSearch && matchStatus;
    });
  }, [daftarPengumuman, search, filterStatus]);

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    setDeleteError(null);

    try {
      await deletePengumumanPpdb(deleteTarget.id);
      setDeleteTarget(null);
      await muatData();
    } catch (err) {
      setDeleteError(
        err?.message || "Gagal menghapus pengumuman. Silakan coba lagi."
      );
    } finally {
      setDeleting(false);
    }
  };

  const formatTanggal = (dateString) => {
    if (!dateString) return "-";
    try {
      const d = new Date(dateString);
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
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
                  href="/admin/spmb"
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} transition ${themeNeutralHover}`}
                  title="Kembali ke Dashboard SPMB"
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
                    Pengumuman PPDB
                  </h1>
                  <p className="mt-0.5 text-xs theme-text-muted sm:text-sm">
                    Kelola pengumuman resmi SPMB/PPDB yang terhubung ke Backend
                    dan halaman publik calon siswa.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={muatData}
                  disabled={loading}
                  className={`inline-flex items-center gap-1.5 rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} px-3 py-2 text-xs font-medium theme-text transition ${themeNeutralHover} disabled:opacity-50`}
                >
                  <RefreshCw
                    size={14}
                    className={loading ? "animate-spin" : ""}
                  />
                  Segarkan
                </button>

                <Link
                  href="/admin/spmb/pengumuman/tambah"
                  className={`inline-flex items-center gap-1.5 rounded-lg ${themePrimaryGradient} px-3.5 py-2 text-xs font-semibold text-[var(--color-card)] shadow-sm transition hover:opacity-95`}
                >
                  <Plus size={15} />
                  Tambah Pengumuman
                </Link>
              </div>
            </div>

            <div
              className={`mb-6 rounded-2xl border ${themeNeutralBorder} theme-card ${themeCardShadow} p-4`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari berdasarkan judul atau konten pengumuman..."
                    className={`h-9 w-full rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} pl-9 pr-3 text-xs theme-text outline-none ${themeFocus}`}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium theme-text-muted">
                    Status:
                  </span>
                  <div className="flex rounded-lg border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] p-0.5">
                    {[
                      { id: "semua", label: "Semua" },
                      { id: "dipublikasikan", label: "Dipublikasikan" },
                      { id: "draft", label: "Draft" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setFilterStatus(tab.id)}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                          filterStatus === tab.id
                            ? `${themePrimarySoft} ${themePrimaryText} font-semibold`
                            : "theme-text-muted hover:theme-text"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div
                className={`flex min-h-[300px] items-center justify-center rounded-2xl border ${themeNeutralBorder} theme-card ${themeCardShadow}`}
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <Loader2
                    size={28}
                    className={`animate-spin ${themePrimaryText}`}
                  />
                  <p className="text-xs theme-text-muted">
                    Memuat daftar pengumuman...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div
                className={`flex min-h-[300px] items-center justify-center rounded-2xl border ${themeNeutralBorder} theme-card ${themeCardShadow} p-6`}
              >
                <div className="max-w-md text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)] theme-danger mb-3">
                    <AlertCircle size={24} />
                  </div>
                  <h3 className="text-sm font-bold theme-text">
                    Gagal Memuat Pengumuman
                  </h3>
                  <p className="mt-1 text-xs theme-text-muted">{error}</p>
                  <button
                    type="button"
                    onClick={muatData}
                    className={`mt-4 inline-flex items-center gap-2 rounded-lg ${themePrimaryGradient} px-4 py-2 text-xs font-semibold text-[var(--color-card)]`}
                  >
                    <RefreshCw size={14} />
                    Coba Lagi
                  </button>
                </div>
              </div>
            ) : filteredData.length === 0 ? (
              <div
                className={`flex min-h-[350px] items-center justify-center rounded-2xl border ${themeNeutralBorder} theme-card ${themeCardShadow} p-6`}
              >
                <div className="max-w-sm text-center">
                  <div
                    className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${themeNeutralSurface} theme-text-muted mb-4`}
                  >
                    <Megaphone size={28} />
                  </div>
                  <h3 className="text-base font-bold theme-text">
                    {search || filterStatus !== "semua"
                      ? "Tidak Ada Pengumuman Sesuai Filter"
                      : "Belum Ada Pengumuman PPDB"}
                  </h3>
                  <p className="mt-1 text-xs theme-text-muted">
                    {search || filterStatus !== "semua"
                      ? "Silakan coba kata kunci lain atau ubah filter status pengumuman."
                      : "Buat pengumuman resmi pertama untuk menginformasikan tahapan dan hasil PPDB."}
                  </p>
                  {!search && filterStatus === "semua" && (
                    <Link
                      href="/admin/spmb/pengumuman/tambah"
                      className={`mt-4 inline-flex items-center gap-1.5 rounded-lg ${themePrimaryGradient} px-4 py-2 text-xs font-semibold text-[var(--color-card)] shadow-sm`}
                    >
                      <Plus size={15} />
                      Buat Pengumuman Sekarang
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div
                className={`overflow-hidden rounded-2xl border ${themeNeutralBorder} theme-card ${themeCardShadow}`}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr
                        className={`border-b ${themeDivider} ${themeNeutralSurface} font-semibold uppercase tracking-wider text-[11px] theme-text-muted`}
                      >
                        <th className="px-5 py-3.5">Judul &amp; Konten</th>
                        <th className="px-4 py-3.5">Status</th>
                        <th className="px-4 py-3.5">Tanggal Publikasi</th>
                        <th className="px-4 py-3.5">Dibuat Pada</th>
                        <th className="px-5 py-3.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${themeDivider}`}>
                      {filteredData.map((item) => (
                        <tr
                          key={item.id}
                          className={`transition ${themeNeutralHover}`}
                        >
                          <td className="px-5 py-4 max-w-md">
                            <Link
                              href={`/admin/spmb/pengumuman/${item.id}`}
                              className="font-bold theme-text hover:text-[var(--color-primary)] transition block line-clamp-1 text-sm"
                            >
                              {item.judul}
                            </Link>
                            <p className="mt-1 text-xs theme-text-muted line-clamp-2 leading-relaxed">
                              {item.konten}
                            </p>
                          </td>

                          <td className="px-4 py-4 whitespace-nowrap">
                            {item.status === "dipublikasikan" ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-[color-mix(in_srgb,var(--color-success)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-success)]">
                                <CheckCircle2 size={12} />
                                Dipublikasikan
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full border border-[color-mix(in_srgb,var(--color-text)_15%,transparent)] bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] px-2.5 py-1 text-[11px] font-medium theme-text-muted">
                                Draft
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-4 whitespace-nowrap text-xs theme-text-secondary">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={13} className="theme-text-muted" />
                              <span>{formatTanggal(item.dipublikasikanPada)}</span>
                            </div>
                          </td>

                          <td className="px-4 py-4 whitespace-nowrap text-xs theme-text-muted">
                            {formatTanggal(item.dibuatPada)}
                          </td>

                          <td className="px-5 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                href={`/admin/spmb/pengumuman/${item.id}`}
                                title="Lihat Detail"
                                className={`flex h-8 w-8 items-center justify-center rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} theme-text-muted transition hover:theme-text ${themeNeutralHover}`}
                              >
                                <Eye size={14} />
                              </Link>

                              <Link
                                href={`/admin/spmb/pengumuman/${item.id}/edit`}
                                title="Edit Pengumuman"
                                className={`flex h-8 w-8 items-center justify-center rounded-lg border ${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText} transition hover:opacity-80`}
                              >
                                <Pencil size={14} />
                              </Link>

                              <button
                                type="button"
                                onClick={() => setDeleteTarget(item)}
                                title="Hapus Pengumuman"
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[color-mix(in_srgb,var(--color-danger)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)] theme-danger transition hover:opacity-80"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {meta.totalPages > 1 && (
                  <div
                    className={`flex items-center justify-between border-t ${themeDivider} px-5 py-3 text-xs theme-text-muted`}
                  >
                    <span>
                      Menampilkan halaman {meta.page} dari {meta.totalPages}{" "}
                      (Total {meta.totalData || meta.total} data)
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className={`rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} px-3 py-1.5 text-xs font-medium theme-text transition ${themeNeutralHover} disabled:opacity-50`}
                      >
                        Sebelumnya
                      </button>
                      <button
                        type="button"
                        disabled={page >= meta.totalPages}
                        onClick={() =>
                          setPage((p) => Math.min(meta.totalPages, p + 1))
                        }
                        className={`rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} px-3 py-1.5 text-xs font-medium theme-text transition ${themeNeutralHover} disabled:opacity-50`}
                      >
                        Selanjutnya
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {deleteTarget && (
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
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="theme-text-muted hover:theme-text"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-xs leading-relaxed theme-text-secondary">
                Apakah Anda yakin ingin menghapus pengumuman berikut?
              </p>
              <div
                className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-3`}
              >
                <p className="text-xs font-bold theme-text">
                  {deleteTarget.judul}
                </p>
                <p className="mt-1 text-[11px] theme-text-muted line-clamp-2">
                  {deleteTarget.konten}
                </p>
              </div>
              <p className="text-[11px] theme-text-muted">
                Pengumuman yang dihapus tidak akan lagi tampil di halaman publik
                maupun daftar admin.
              </p>

              {deleteError && (
                <div className="rounded-lg border border-[color-mix(in_srgb,var(--color-danger)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_9%,transparent)] p-2.5 text-xs theme-danger">
                  {deleteError}
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
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
