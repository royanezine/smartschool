"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import CanAccess from "@/app/components/auth/CanAccess";
import {
  getAllJabatan,
  deleteJabatan,
} from "@/services/jabatan.service";

import {
  ShieldCheck,
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  AlertCircle,
  X,
  Users,
  CheckCircle2,
  Loader2,
  Layers,
} from "lucide-react";

export default function ManajemenJabatanPage() {
  const router = useRouter();

  const [jabatanList, setJabatanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Modal konfirmasi hapus
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAllJabatan();
      setJabatanList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("[ManajemenJabatan] Gagal memuat data:", err);
      setError(
        err?.message || "Gagal memuat daftar jabatan. Periksa koneksi ke server."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      if (active) {
        loadData();
      }
    }, 0);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [loadData]);

  const filteredJabatan = useMemo(() => {
    if (!searchQuery.trim()) return jabatanList;
    const query = searchQuery.toLowerCase().trim();
    return jabatanList.filter(
      (j) =>
        j.namaJabatan?.toLowerCase().includes(query) ||
        j.deskripsi?.toLowerCase().includes(query)
    );
  }, [jabatanList, searchQuery]);

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    setError("");
    setSuccess("");

    try {
      await deleteJabatan(deleteTarget.id);
      setSuccess(
        `Jabatan "${deleteTarget.namaJabatan}" berhasil dihapus.`
      );
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      console.error("[ManajemenJabatan] Gagal menghapus jabatan:", err);

      const status = err?.status || err?.response?.status;
      const errorCode =
        err?.errorCode || err?.raw?.errorCode || err?.response?.data?.errorCode;
      const rawMessage =
        err?.message || err?.raw?.message || err?.response?.data?.message || "";

      // HTTP 400 ketika Jabatan masih digunakan
      if (
        status === 400 &&
        (errorCode === "JABATAN_IN_USE" ||
          rawMessage.toLowerCase().includes("masih digunakan") ||
          rawMessage.toLowerCase().includes("pengguna"))
      ) {
        setError(
          "Jabatan tidak dapat dihapus karena masih digunakan oleh pegawai."
        );
      } else {
        setError(
          rawMessage || "Gagal menghapus jabatan. Terjadi kesalahan pada server."
        );
      }
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="pengguna"
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Header />

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="w-full min-w-0 space-y-6 p-4 sm:p-6 lg:p-8">
            {/* Header & Breadcrumb */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider theme-text-muted">
                  <ShieldCheck size={16} className="text-[var(--color-primary)]" />
                  <span>Manajemen Pengguna</span>
                  <span>/</span>
                  <span className="theme-text">Jabatan & Hak Akses</span>
                </div>
                <h1 className="mt-1 text-2xl font-bold tracking-tight theme-text sm:text-3xl">
                  Manajemen Jabatan
                </h1>
                <p className="mt-1 text-sm theme-text-secondary">
                  Kelola struktur jabatan pegawai sekolah dan delegasi hak akses
                  menu baku secara terpusat.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={loadData}
                  disabled={loading}
                  className="theme-input inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition hover:brightness-95 disabled:opacity-50"
                >
                  <RefreshCw
                    size={16}
                    className={loading ? "animate-spin" : ""}
                  />
                  <span>Muat Ulang</span>
                </button>

                <CanAccess menu="manajemen pengguna" action="create">
                  <Link
                    href="/admin/pengguna/jabatan/tambah"
                    className="theme-primary inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white shadow-md transition hover:brightness-95"
                  >
                    <Plus size={18} />
                    <span>Tambah Jabatan</span>
                  </Link>
                </CanAccess>
              </div>
            </div>

            {/* Alert Notifikasi */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-2xl border border-[var(--color-danger)] bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)] p-4 text-sm"
              >
                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0 text-[var(--color-danger)]"
                />
                <div className="flex-1">
                  <p className="font-semibold text-[var(--color-danger)]">
                    Perhatian
                  </p>
                  <p className="mt-0.5 theme-text-secondary">{error}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setError("")}
                  aria-label="Tutup pesan error"
                  className="theme-text-muted hover:text-[var(--color-text)]"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {success && (
              <div
                role="status"
                className="flex items-start gap-3 rounded-2xl border border-[var(--color-success)] bg-[color-mix(in_srgb,var(--color-success)_8%,transparent)] p-4 text-sm"
              >
                <CheckCircle2
                  size={20}
                  className="mt-0.5 shrink-0 text-[var(--color-success)]"
                />
                <div className="flex-1">
                  <p className="font-semibold text-[var(--color-success)]">
                    Sukses
                  </p>
                  <p className="mt-0.5 theme-text-secondary">{success}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSuccess("")}
                  aria-label="Tutup pesan sukses"
                  className="theme-text-muted hover:text-[var(--color-text)]"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* Filter Search */}
            <div className="theme-card theme-border flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                />
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama jabatan atau deskripsi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="theme-input h-10 w-full rounded-xl pl-10 pr-4 text-sm outline-none"
                />
              </div>

              <div className="flex items-center gap-2 text-xs theme-text-muted">
                <Layers size={15} />
                <span>Total: {filteredJabatan.length} Jabatan</span>
              </div>
            </div>

            {/* Tabel Daftar Jabatan */}
            <div className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="theme-card-soft border-b theme-border text-xs uppercase tracking-wider theme-text-muted">
                    <tr>
                      <th className="px-6 py-4 font-semibold">No</th>
                      <th className="px-6 py-4 font-semibold">Nama Jabatan</th>
                      <th className="px-6 py-4 font-semibold">Deskripsi</th>
                      <th className="px-6 py-4 font-semibold">Hak Akses Menu</th>
                      <th className="px-6 py-4 text-center font-semibold">
                        Pegawai
                      </th>
                      <th className="px-6 py-4 text-center font-semibold">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y theme-border">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <Loader2
                              size={28}
                              className="animate-spin text-[var(--color-primary)]"
                            />
                            <p className="text-sm theme-text-muted">
                              Memuat data jabatan...
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredJabatan.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-12 text-center">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]">
                              <ShieldCheck size={28} />
                            </div>
                            <h3 className="text-base font-bold theme-text">
                              Tidak Ada Data Jabatan
                            </h3>
                            <p className="max-w-md text-xs theme-text-secondary">
                              {searchQuery
                                ? `Tidak ditemukan jabatan yang cocok dengan kata kunci "${searchQuery}".`
                                : "Belum ada jabatan yang dibuat. Silakan tambahkan jabatan baru untuk mengatur hak akses pegawai."}
                            </p>
                            {!searchQuery && (
                              <CanAccess menu="manajemen pengguna" action="create">
                                <Link
                                  href="/admin/pengguna/jabatan/tambah"
                                  className="theme-primary mt-2 inline-flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-semibold text-white shadow transition hover:brightness-95"
                                >
                                  <Plus size={16} />
                                  <span>Tambah Jabatan Pertama</span>
                                </Link>
                              </CanAccess>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredJabatan.map((item, idx) => {
                        const aksesCount = Array.isArray(item.aksesMenu)
                          ? item.aksesMenu.length
                          : 0;
                        const pegawaiCount = item._count?.pengguna ?? 0;

                        return (
                          <tr
                            key={item.id}
                            className="transition hover:bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)]"
                          >
                            <td className="px-6 py-4 text-xs font-semibold theme-text-muted">
                              {idx + 1}
                            </td>

                            <td className="px-6 py-4 font-semibold theme-text">
                              <div className="flex items-center gap-2.5">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-xs font-bold text-[var(--color-primary)]">
                                  {item.namaJabatan?.substring(0, 2).toUpperCase()}
                                </span>
                                <span>{item.namaJabatan}</span>
                              </div>
                            </td>

                            <td className="px-6 py-4 max-w-xs text-xs theme-text-secondary truncate">
                              {item.deskripsi || (
                                <span className="italic theme-text-muted">
                                  Tanpa deskripsi
                                </span>
                              )}
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="inline-flex items-center rounded-full bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] px-2.5 py-1 text-xs font-semibold text-[var(--color-primary)]">
                                  {aksesCount} Menu Diizinkan
                                </span>
                              </div>
                            </td>

                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] px-2.5 py-1 text-xs font-semibold theme-text-secondary">
                                <Users size={13} />
                                {pegawaiCount} Pegawai
                              </span>
                            </td>

                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <CanAccess
                                  menu="manajemen pengguna"
                                  action="update"
                                >
                                  <Link
                                    href={`/admin/pengguna/jabatan/${item.id}/edit`}
                                    title="Edit Jabatan"
                                    aria-label={`Edit ${item.namaJabatan}`}
                                    className="theme-input inline-flex h-8 w-8 items-center justify-center rounded-lg hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                                  >
                                    <Pencil size={15} />
                                  </Link>
                                </CanAccess>

                                <CanAccess
                                  menu="manajemen pengguna"
                                  action="delete"
                                >
                                  <button
                                    type="button"
                                    onClick={() => setDeleteTarget(item)}
                                    title="Hapus Jabatan"
                                    aria-label={`Hapus ${item.namaJabatan}`}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-danger)] text-[var(--color-danger)] transition hover:bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)]"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </CanAccess>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Konfirmasi Hapus */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        >
          <div className="theme-card theme-border w-full max-w-md rounded-2xl border p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
                <Trash2 size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold theme-text">
                  Hapus Jabatan?
                </h3>
                <p className="mt-2 text-sm theme-text-secondary">
                  Apakah Anda yakin ingin menghapus jabatan{" "}
                  <strong className="theme-text font-bold">
                    &quot;{deleteTarget.namaJabatan}&quot;
                  </strong>
                  ? Tindakan ini tidak dapat dibatalkan.
                </p>
                {deleteTarget._count?.pengguna > 0 && (
                  <p className="mt-2 rounded-lg bg-amber-500/10 p-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    Peringatan: Jabatan ini saat ini tercatat digunakan oleh{" "}
                    {deleteTarget._count.pengguna} pegawai. Penghapusan akan
                    ditolak oleh server.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t theme-border pt-4">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="theme-input h-10 rounded-xl px-4 text-sm font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--color-danger)] px-5 text-sm font-semibold text-white shadow transition hover:opacity-90 disabled:opacity-50"
              >
                {isDeleting && <Loader2 size={16} className="animate-spin" />}
                {isDeleting ? "Menghapus..." : "Ya, Hapus Jabatan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
