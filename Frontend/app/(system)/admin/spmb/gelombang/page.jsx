"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  AlertCircle,
  CalendarDays,
  Check,
  Clock3,
  FileText,
  FolderOpen,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Route,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";

import {
  deleteGelombangPpdb,
  getGelombangPpdb,
  isGelombangEndpointMissing,
  updateGelombangPpdb,
} from "@/services/gelombangPpdb.service";
import { getJalurPpdb } from "@/services/jalurPpdb.service";

function formatTanggal(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function toDateString(value) {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (angka) => String(angka).padStart(2, "0");
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function StatusBadge({ status }) {
  const isActive = String(status || "").toLowerCase() === "aktif";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[11px] font-semibold ${
        isActive ? "theme-success" : "theme-card theme-text-muted theme-border border"
      }`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          backgroundColor: isActive ? "var(--color-success)" : "var(--color-text-muted)",
        }}
      />
      {isActive ? "Aktif" : "Nonaktif"}
    </span>
  );
}

function StatCard({ label, value, description, icon, iconClassName }) {
  return (
    <div className="theme-card theme-border flex flex-col justify-between rounded-xl border p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="theme-text-muted text-[10px] font-bold uppercase tracking-[0.14em]">
            {label}
          </p>
          <p className="theme-text mt-2 truncate text-2xl font-bold tracking-tight">
            {value}
          </p>
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
        >
          {icon}
        </div>
      </div>
      <p className="theme-text-muted mt-2 text-xs">{description}</p>
    </div>
  );
}

export default function GelombangSpmbPage() {
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [data, setData] = useState([]);
  const [jalurList, setJalurList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [jalurFilter, setJalurFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [apiUnavailable, setApiUnavailable] = useState(false);

  const loadJalur = useCallback(async () => {
    try {
      const response = await getJalurPpdb();
      setJalurList(
        Array.isArray(response?.data)
          ? response.data
          : []
      );
    } catch {
      setJalurList([]);
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setApiUnavailable(false);

      const filters = {};
      if (search.trim()) filters.search = search.trim();
      if (statusFilter) filters.status = statusFilter;
      if (jalurFilter) filters.jalurPpdbId = jalurFilter;

      const response = await getGelombangPpdb(filters);

      setData(
        Array.isArray(response?.data)
          ? response.data
          : []
      );
    } catch (err) {
      setData([]);
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal memuat gelombang PPDB.";
      setError(msg);

      setApiUnavailable(
        isGelombangEndpointMissing(err)
      );
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, jalurFilter]);

  useEffect(() => {
    loadJalur();
  }, [loadJalur]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function toggleStatus(item) {
    const nextStatus = item.status === "aktif" ? "nonaktif" : "aktif";
    try {
      setUpdatingId(item.id);
      setError("");

      await updateGelombangPpdb(item.id, {
        nama: item.nama,
        jalurPpdbId: item.jalurPpdbId || null,
        tanggalMulai: toDateString(item.tanggalMulai),
        tanggalSelesai: toDateString(item.tanggalSelesai),
        kuota:
          item.kuota === null || item.kuota === undefined
            ? null
            : Number(item.kuota),
        status: nextStatus,
      });

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memperbarui status gelombang."
      );
    } finally {
      setUpdatingId("");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      setError("");

      await deleteGelombangPpdb(deleteTarget.id);
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menghapus gelombang."
      );
    } finally {
      setDeleting(false);
    }
  }

  const totalGelombang = data.length;
  const activeGelombang = useMemo(
    () =>
      data.filter(
        (item) => String(item?.status || "").toLowerCase() === "aktif"
      ).length,
    [data]
  );
  const inactiveGelombang = totalGelombang - activeGelombang;

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="spmb"
        setActive={() => {}}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        role="admin"
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b theme-border">
          <Header
            toggleSidebar={() => setCollapsed((value) => !value)}
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
            {/* Header Page */}
            <div className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em]">
                  <Link
                    href="/admin/spmb"
                    className="transition hover:underline"
                    style={{ color: "var(--color-primary)" }}
                  >
                    SPMB
                  </Link>
                  <span className="theme-text-placeholder">/</span>
                  <span className="theme-text-muted">Gelombang</span>
                </div>
                <h1 className="theme-text text-[26px] font-bold tracking-tight sm:text-[30px]">
                  Gelombang Pendaftaran
                </h1>
                <p className="theme-text-muted mt-1.5 max-w-2xl text-sm leading-6">
                  Kelola periode pendaftaran, kuota calon siswa, dan status keaktifan gelombang SPMB.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={loadData}
                  disabled={loading}
                  className="theme-card theme-border theme-text-secondary inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold shadow-sm transition hover:opacity-80 disabled:opacity-50"
                >
                  <RefreshCw
                    size={15}
                    className={loading ? "animate-spin" : ""}
                  />
                  Refresh
                </button>

                <Link
                  href="/admin/spmb/gelombang/tambah"
                  className="theme-primary inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold shadow-sm transition"
                >
                  <Plus size={16} />
                  Tambah Gelombang
                </Link>
              </div>
            </div>

            {/* Statistik Ringkas */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard
                label="Total Gelombang"
                value={totalGelombang}
                description="Semua gelombang PPDB"
                icon={<CalendarDays size={18} />}
                iconClassName="theme-info"
              />
              <StatCard
                label="Gelombang Aktif"
                value={activeGelombang}
                description="Pendaftaran sedang dibuka"
                icon={<Check size={18} />}
                iconClassName="theme-success"
              />
              <StatCard
                label="Nonaktif"
                value={inactiveGelombang}
                description="Pendaftaran ditutup/berakhir"
                icon={<Clock3 size={18} />}
                iconClassName="theme-card theme-text-muted"
              />
            </div>

            {error && (
              <div className="theme-danger mb-6 flex items-start gap-3 rounded-xl border p-4">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Gagal memuat data gelombang</p>
                  <p className="mt-0.5 text-xs opacity-90">{error}</p>
                </div>
              </div>
            )}

            {/* Container Tabel Utama */}
            <div className="theme-card theme-border overflow-hidden rounded-xl border shadow-sm">
              {/* Header Tabel dengan Search & Filter */}
              <div className="theme-border-soft flex flex-col gap-4 border-b px-5 py-4 lg:flex-row lg:items-center lg:justify-between sm:px-6">
                <div>
                  <p className="theme-text text-sm font-bold">Daftar Gelombang</p>
                  <p className="theme-text-muted mt-0.5 text-xs">
                    Kelola nama gelombang, periode pendaftaran, dan kuota.
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="relative w-full sm:w-[220px]">
                    <Search
                      size={15}
                      className="theme-text-muted absolute left-3 top-1/2 -translate-y-1/2"
                    />
                    <input
                      type="text"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Cari gelombang..."
                      className="theme-input h-10 w-full rounded-lg border pl-9 pr-8 text-sm outline-none transition focus:border-[var(--color-primary)]"
                    />
                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="theme-text-muted absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-md transition hover:opacity-80"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="theme-input h-10 rounded-lg border px-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
                  >
                    <option value="">Semua Status</option>
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>

                  <select
                    value={jalurFilter}
                    onChange={(event) => setJalurFilter(event.target.value)}
                    className="theme-input h-10 max-w-[200px] rounded-lg border px-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
                  >
                    <option value="">Semua Jalur</option>
                    {jalurList.map((jalur) => (
                      <option key={jalur.id} value={jalur.id}>
                        {jalur.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tabel Responsif */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead>
                    <tr className="theme-table-header theme-border-soft border-b">
                      <th className="w-14 px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em]">
                        No
                      </th>
                      <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em]">
                        Nama Gelombang
                      </th>
                      <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em]">
                        Jalur SPMB
                      </th>
                      <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em]">
                        Periode Pendaftaran
                      </th>
                      <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em]">
                        Kuota
                      </th>
                      <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em]">
                        Status
                      </th>
                      <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.12em]">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border-soft)]">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-16 text-center">
                          <Loader2
                            size={26}
                            className="mx-auto animate-spin text-[var(--color-primary)]"
                          />
                          <p className="theme-text-secondary mt-3 text-sm font-semibold">
                            Memuat data gelombang...
                          </p>
                        </td>
                      </tr>
                    ) : data.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-16 text-center">
                          <div className="theme-card-soft theme-text-muted mx-auto flex h-12 w-12 items-center justify-center rounded-xl border">
                            {search || statusFilter || jalurFilter ? (
                              <Search size={21} />
                            ) : (
                              <FolderOpen size={21} />
                            )}
                          </div>
                          <h3 className="theme-text-secondary mt-4 text-sm font-bold">
                            {apiUnavailable
                              ? "Layanan Gelombang Belum Tersedia"
                              : search || statusFilter || jalurFilter
                              ? "Gelombang tidak ditemukan"
                              : "Belum ada gelombang pendaftaran"}
                          </h3>
                          <p className="theme-text-muted mt-1 text-xs">
                            {apiUnavailable
                              ? "Server backend belum menyediakan rute untuk manajemen gelombang."
                              : search || statusFilter || jalurFilter
                              ? "Coba ubah kata kunci atau bersihkan filter pencarian."
                              : "Tambahkan gelombang pertama untuk membuka periode pendaftaran SPMB."}
                          </p>
                          {!apiUnavailable && !search && !statusFilter && !jalurFilter && (
                            <Link
                              href="/admin/spmb/gelombang/tambah"
                              className="theme-primary mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold shadow-sm transition"
                            >
                              <Plus size={14} />
                              Tambah Gelombang
                            </Link>
                          )}
                        </td>
                      </tr>
                    ) : (
                      data.map((item, index) => (
                        <tr
                          key={item.id}
                          className="theme-table-hover group transition"
                        >
                          <td className="theme-text-muted px-5 py-4 text-sm font-medium">
                            {index + 1}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="theme-info flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border">
                                <CalendarDays size={16} />
                              </div>
                              <div className="min-w-0">
                                <p className="theme-text truncate text-sm font-semibold">
                                  {item.nama}
                                </p>
                                <p className="theme-text-muted mt-0.5 text-[11px]">
                                  Gelombang SPMB
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="theme-card-soft theme-text-secondary inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium">
                              <Route size={12} className="theme-text-muted" />
                              {item.jalurPpdb?.nama || "Semua Jalur"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 text-xs theme-text-secondary">
                              <Clock3 size={13} className="theme-text-muted shrink-0" />
                              <span>
                                {formatTanggal(item.tanggalMulai)} —{" "}
                                {formatTanggal(item.tanggalSelesai)}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-xs theme-text-secondary font-medium">
                              {item.kuota === null || item.kuota === undefined
                                ? "Tidak dibatasi"
                                : `${item.kuota} siswa`}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge status={item.status} />
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => toggleStatus(item)}
                                disabled={updatingId === item.id}
                                className="theme-card theme-border theme-text-secondary inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition hover:opacity-80 disabled:opacity-50"
                                title={
                                  item.status === "aktif"
                                    ? "Nonaktifkan gelombang"
                                    : "Aktifkan gelombang"
                                }
                              >
                                {updatingId === item.id ? (
                                  <Loader2 size={13} className="animate-spin" />
                                ) : item.status === "aktif" ? (
                                  <Check size={13} className="theme-success" />
                                ) : (
                                  <Clock3 size={13} className="theme-text-muted" />
                                )}
                                <span className="hidden sm:inline">
                                  {item.status === "aktif" ? "Nonaktifkan" : "Aktifkan"}
                                </span>
                              </button>

                              <Link
                                href={`/admin/spmb/gelombang/${encodeURIComponent(
                                  item.id
                                )}`}
                                className="theme-card theme-border theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg border transition hover:opacity-80"
                                title="Edit gelombang"
                              >
                                <Pencil size={14} />
                              </Link>

                              <button
                                type="button"
                                onClick={() => setDeleteTarget(item)}
                                className="theme-card theme-border theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg border transition hover:opacity-80"
                                title="Hapus gelombang"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {!loading && data.length > 0 && (
                <div className="theme-border-soft theme-text-muted flex items-center gap-2 border-t px-5 py-3.5 text-[11px] sm:px-6">
                  <FileText size={13} />
                  Menampilkan{" "}
                  <span className="theme-text-secondary font-semibold">
                    {data.length}
                  </span>{" "}
                  gelombang pendaftaran
                </div>
              )}
            </div>

            {apiUnavailable && (
              <div className="theme-border-soft theme-card-soft mt-5 rounded-xl border p-4">
                <p className="theme-text-secondary text-xs leading-5">
                  Rute <code>/api/gelombang-ppdb</code> belum merespons di Backend
                  yang sedang berjalan. Hubungi administrator sistem atau
                  pastikan backend terbaru sudah dijalankan.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal Konfirmasi Hapus */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">
          <div className="theme-card theme-border w-full max-w-md overflow-hidden rounded-xl border shadow-xl">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="theme-danger flex h-10 w-10 items-center justify-center rounded-lg">
                  <Trash2 size={18} />
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg transition hover:opacity-80 disabled:opacity-50"
                >
                  <X size={17} />
                </button>
              </div>
              <h2 className="theme-text mt-5 text-lg font-bold tracking-tight">
                Hapus Gelombang?
              </h2>
              <p className="theme-text-secondary mt-2 text-sm leading-6">
                Kamu yakin ingin menghapus gelombang{" "}
                <span className="theme-text font-semibold">
                  &quot;{deleteTarget.nama}&quot;
                </span>
                ? Data akan dinonaktifkan (soft delete).
              </p>
            </div>
            <div className="theme-card-soft theme-border-soft flex flex-col-reverse gap-2 border-t px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="theme-card theme-border theme-text-secondary h-10 rounded-lg border px-5 text-sm font-semibold transition hover:opacity-80 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="theme-danger inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-5 text-sm font-semibold transition hover:opacity-80 disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 size={15} /> Hapus
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
