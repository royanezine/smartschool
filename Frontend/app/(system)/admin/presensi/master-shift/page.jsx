"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  getShiftKerja,
  deleteShiftKerja,
} from "@/services/shiftKerja.service";

import {
  Clock3,
  Search,
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  Users,
  ClipboardCheck,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  Eye,
  X,
} from "lucide-react";

/* =========================================================
   HELPERS
========================================================= */

function formatTime(value) {
  if (!value) return "--:--";
  if (typeof value === "string") {
    const match = value.match(/^(\d{1,2}):(\d{2})/);
    if (match) return `${match[1].padStart(2, "0")}:${match[2]}`;
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }
  }
  return String(value);
}

function normalizeShift(item) {
  return {
    ...item,
    id: item.id,
    nama: item.nama ?? item.name ?? "Shift tanpa nama",
    kode: item.kode ?? "",
    jamMasuk: item.jamMasuk ?? item.jam_masuk ?? null,
    jamKeluar: item.jamKeluar ?? item.jam_keluar ?? null,
    toleransiTerlambatMenit: Number(
      item.toleransiTerlambatMenit ?? item.toleransiTerlambat ?? 15
    ),
    status: String(item.status ?? "aktif").toLowerCase(),
    jumlahPegawai: Number(item.jumlahPegawai ?? item._count?.pengguna ?? 0),
    totalAbsensi: Number(item.totalAbsensi ?? item._count?.absensi ?? 0),
  };
}

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "Terjadi kesalahan saat memproses permintaan.";
}

function getStatusLabel(status) {
  return status === "aktif" ? "Aktif" : "Nonaktif";
}

function getLateLimit(shift) {
  const time = formatTime(shift.jamMasuk);
  if (time === "--:--") return "--:--";
  const [hours, minutes] = time.split(":").map(Number);
  const total = hours * 60 + minutes + shift.toleransiTerlambatMenit;
  const normalized = ((total % 1440) + 1440) % 1440;
  return `${String(Math.floor(normalized / 60)).padStart(2, "0")}:${String(
    normalized % 60
  ).padStart(2, "0")}`;
}

/* =========================================================
   PAGE
========================================================= */

export default function MasterShiftPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [meta, setMeta] = useState({
    total: 0,
    totalPages: 0,
    page: 1,
    limit: 10,
  });

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  /* =======================================================
     LOAD DATA
  ======================================================= */

  const loadShifts = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      try {
        const params = {
          page,
          limit,
          ...(search.trim() ? { search: search.trim() } : {}),
          ...(statusFilter !== "semua" ? { status: statusFilter } : {}),
        };

        const response = await getShiftKerja(params);
        const items = Array.isArray(response?.data) ? response.data : [];

        setShifts(items.map(normalizeShift));

        const total = Number(response?.total ?? 0);
        const totalPages = Number(
          response?.totalPages ?? (total > 0 ? Math.ceil(total / limit) : 0)
        );

        setMeta({
          total,
          totalPages,
          page: Number(response?.page ?? page),
          limit: Number(response?.limit ?? limit),
        });

        if (totalPages > 0 && page > totalPages) setPage(totalPages);
        if (total === 0 && page !== 1) setPage(1);
      } catch (err) {
        setShifts([]);
        setMeta({ total: 0, totalPages: 0, page, limit });
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, limit, search, statusFilter]
  );

  useEffect(() => {
    loadShifts();
  }, [loadShifts]);

  /* =======================================================
     SEARCH & FILTER
  ======================================================= */

  function handleSearchSubmit(event) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function handleStatusChange(value) {
    setPage(1);
    setStatusFilter(value);
  }

  function handleResetFilters() {
    setSearchInput("");
    setSearch("");
    setStatusFilter("semua");
    setPage(1);
  }

  /* =======================================================
     DELETE
  ======================================================= */

  async function handleDelete() {
    if (!deleteTarget?.id || deleting) return;

    setDeleting(true);
    setError("");
    setNotice("");

    try {
      await deleteShiftKerja(deleteTarget.id);
      setDeleteTarget(null);
      setNotice("Shift kerja berhasil dihapus.");
      await loadShifts(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  /* =======================================================
     SUMMARY
  ======================================================= */

  const activeCount = shifts.filter((shift) => shift.status === "aktif").length;
  const assignedCount = shifts.reduce((sum, shift) => sum + shift.jumlahPegawai, 0);
  const attendanceCount = shifts.reduce((sum, shift) => sum + shift.totalAbsensi, 0);

  const firstItem = meta.total === 0 ? 0 : (page - 1) * limit + 1;
  const lastItem = Math.min(page * limit, meta.total);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        role="admin"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0">
          <Header onMenuClick={() => setSidebarOpen(true)} />
        </div>

        {/* HANYA area ini yang scroll */}
        <main className="min-w-0 flex-1 overflow-y-auto theme-page theme-text">
          {/* Konten w-full: melebar saat zoom out */}
          <div className="w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            
            {/* PAGE HEADER */}
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl theme-text">
                  Master Shift Kerja
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 theme-text-secondary">
                  Kelola jadwal kerja, jam masuk, jam pulang, dan toleransi keterlambatan pegawai.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => loadShifts(true)}
                  disabled={refreshing || loading}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border theme-border theme-card px-3 text-sm font-medium theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] disabled:cursor-not-allowed disabled:opacity-60 transition"
                >
                  <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/admin/presensi/master-shift/tambah")}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg theme-primary px-4 text-sm font-semibold transition hover:opacity-90"
                >
                  <Plus size={17} />
                  Tambah Shift
                </button>
              </div>
            </div>

            {/* ALERTS */}
            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
              >
                <AlertCircle size={19} className="mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">Permintaan gagal</p>
                  <p className="mt-1 break-words">{error}</p>
                </div>
                <button
                  type="button"
                  aria-label="Tutup pesan error"
                  onClick={() => setError("")}
                  className="rounded p-1 hover:bg-red-100 dark:hover:bg-red-900/40"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {notice && (
              <div
                role="status"
                className="mb-5 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
              >
                <CheckCircle2 size={18} />
                <p className="flex-1">{notice}</p>
                <button
                  type="button"
                  aria-label="Tutup notifikasi"
                  onClick={() => setNotice("")}
                  className="rounded p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* SUMMARY GRID (2xl:grid-cols-6) */}
            <div className="mb-7 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-3">
              <SummaryCard title="Total Shift" value={meta.total} description="Sesuai filter" icon={CalendarClock} />
              <SummaryCard title="Shift Aktif" value={activeCount} description="Halaman ini" icon={CheckCircle2} />
              <SummaryCard title="Pegawai" value={assignedCount} description="Halaman ini" icon={Users} />
              <SummaryCard title="Absensi" value={attendanceCount} description="Halaman ini" icon={ClipboardCheck} />
            </div>

            {/* FILTERS + TABLE */}
            <section className="theme-card overflow-hidden rounded-xl border theme-border shadow-sm">
              <div className="border-b theme-border p-4 sm:p-5">
                <div className="mb-4">
                  <h2 className="font-semibold theme-text">Daftar Shift Kerja</h2>
                  <p className="mt-1 text-sm theme-text-muted">
                    Cari berdasarkan nama atau kode shift.
                  </p>
                </div>

                <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 md:flex-row">
                  <div className="relative min-w-0 flex-1">
                    <Search
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                    />
                    <input
                      type="search"
                      value={searchInput}
                      onChange={(event) => setSearchInput(event.target.value)}
                      placeholder="Cari nama atau kode shift..."
                      className="theme-input h-10 w-full rounded-lg border pl-10 pr-3 text-sm outline-none transition"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(event) => handleStatusChange(event.target.value)}
                    aria-label="Filter status shift"
                    className="theme-input h-10 rounded-lg border px-3 text-sm outline-none md:w-44"
                  >
                    <option value="semua">Semua Status</option>
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>

                  <button
                    type="submit"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-blue-700 dark:hover:bg-blue-600"
                  >
                    <Search size={16} />
                    Cari
                  </button>

                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="h-10 rounded-lg border theme-border px-4 text-sm font-medium theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] transition"
                  >
                    Reset
                  </button>
                </form>
              </div>

              {/* TABLE AREA */}
              <div className="relative">
                {loading ? (
                  <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
                    <LoaderCircle size={28} className="animate-spin theme-primary-text" />
                    <p className="mt-3 text-sm font-medium theme-text">Memuat data shift...</p>
                    <p className="mt-1 text-xs theme-text-muted">Mengambil data dari Backend</p>
                  </div>
                ) : error && shifts.length === 0 ? (
                  <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
                    <AlertCircle size={30} className="text-red-500" />
                    <p className="mt-3 font-semibold theme-text">Data shift gagal dimuat</p>
                    <p className="mt-1 max-w-md text-sm theme-text-muted">
                      Periksa koneksi Backend dan akses akunmu, lalu coba muat ulang.
                    </p>
                    <button
                      type="button"
                      onClick={() => loadShifts(true)}
                      className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg theme-primary px-3 text-sm font-medium text-white hover:opacity-90"
                    >
                      <RefreshCw size={15} />
                      Coba Lagi
                    </button>
                  </div>
                ) : shifts.length === 0 ? (
                  <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] theme-text-muted">
                      <Clock3 size={23} />
                    </div>
                    <p className="mt-4 font-semibold theme-text">Belum ada shift kerja</p>
                    <p className="mt-1 max-w-sm text-sm theme-text-muted">
                      Tidak ada data yang cocok dengan pencarian atau filter saat ini.
                    </p>
                    {(search || statusFilter !== "semua") && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="mt-3 text-sm font-semibold theme-primary-text hover:underline"
                      >
                        Hapus filter
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {/* TABLE DENGAN OVERFLOW-X-AUTO */}
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[900px] text-left text-sm">
                        <thead className="bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] text-xs uppercase tracking-wide theme-text-muted border-b theme-border">
                          <tr>
                            <th className="px-5 py-4 font-semibold">Shift</th>
                            <th className="px-5 py-4 font-semibold">Jam Kerja</th>
                            <th className="px-5 py-4 font-semibold">Toleransi</th>
                            <th className="px-5 py-4 font-semibold">Pegawai</th>
                            <th className="px-5 py-4 font-semibold">Absensi</th>
                            <th className="px-5 py-4 font-semibold">Status</th>
                            <th className="px-5 py-4 text-right font-semibold">Aksi</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-[color-mix(in_srgb,var(--color-text)_5%,transparent)]">
                          {shifts.map((shift) => (
                            <tr key={shift.id} className="hover:bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] transition">
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                                    <Clock3 size={19} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold theme-text">{shift.nama}</p>
                                    <p className="mt-1 text-xs theme-text-muted">Kode: {shift.kode || "-"}</p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <p className="font-medium tabular-nums theme-text">
                                  {formatTime(shift.jamMasuk)}
                                  <span className="mx-2 theme-text-muted">–</span>
                                  {formatTime(shift.jamKeluar)}
                                </p>
                                <p className="mt-1 text-xs theme-text-muted">Masuk – Pulang</p>
                              </td>

                              <td className="px-5 py-4">
                                <p className="font-medium theme-text">{shift.toleransiTerlambatMenit} menit</p>
                                <p className="mt-1 text-xs theme-text-muted">Batas {getLateLimit(shift)}</p>
                              </td>

                              <td className="px-5 py-4">
                                <div className="inline-flex items-center gap-2 theme-text">
                                  <Users size={16} className="theme-text-muted" />
                                  <span className="font-medium tabular-nums">{shift.jumlahPegawai}</span>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <div className="inline-flex items-center gap-2 theme-text">
                                  <ClipboardCheck size={16} className="theme-text-muted" />
                                  <span className="font-medium tabular-nums">{shift.totalAbsensi}</span>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${
                                    shift.status === "aktif"
                                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                                      : "bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] theme-text-muted"
                                  }`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      shift.status === "aktif" ? "bg-emerald-500" : "bg-slate-400"
                                    }`}
                                  />
                                  {getStatusLabel(shift.status)}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex items-center justify-end gap-1">
                                  <ActionButton
                                    label="Detail"
                                    onClick={() => router.push(`/admin/presensi/master-shift/${shift.id}`)}
                                  >
                                    <Eye size={16} />
                                  </ActionButton>

                                  <ActionButton
                                    label="Edit"
                                    onClick={() => router.push(`/admin/presensi/master-shift/${shift.id}/edit`)}
                                  >
                                    <Pencil size={16} />
                                  </ActionButton>

                                  <ActionButton label="Hapus" danger onClick={() => setDeleteTarget(shift)}>
                                    <Trash2 size={16} />
                                  </ActionButton>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* PAGINATION */}
                    <div className="flex flex-col gap-3 border-t theme-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm theme-text-muted">
                        Menampilkan <span className="font-semibold theme-text">{firstItem}–{lastItem}</span> dari{" "}
                        <span className="font-semibold theme-text">{meta.total}</span> shift
                      </p>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={page <= 1 || loading}
                          onClick={() => setPage((current) => Math.max(1, current - 1))}
                          className="inline-flex h-9 items-center gap-1 rounded-lg border theme-border px-3 text-sm font-medium theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] disabled:cursor-not-allowed disabled:opacity-40 transition"
                        >
                          <ChevronLeft size={16} />
                          Sebelumnya
                        </button>

                        <span className="min-w-20 text-center text-sm theme-text">
                          {page} / {Math.max(meta.totalPages, 1)}
                        </span>

                        <button
                          type="button"
                          disabled={page >= meta.totalPages || loading}
                          onClick={() => setPage((current) => Math.min(meta.totalPages, current + 1))}
                          className="inline-flex h-9 items-center gap-1 rounded-lg border theme-border px-3 text-sm font-medium theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] disabled:cursor-not-allowed disabled:opacity-40 transition"
                        >
                          Berikutnya
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* DELETE CONFIRMATION */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting) setDeleteTarget(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-shift-title"
            className="theme-card w-full max-w-md rounded-xl border theme-border p-6 shadow-xl"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
              <Trash2 size={21} />
            </div>

            <h2 id="delete-shift-title" className="mt-4 text-lg font-bold theme-text">
              Hapus shift kerja?
            </h2>

            <p className="mt-2 text-sm leading-6 theme-text-muted">
              Shift <span className="font-semibold theme-text">{deleteTarget.nama}</span> akan dinonaktifkan dari daftar shift. Jika masih digunakan oleh pegawai, Backend dapat menolak permintaan ini.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="h-10 rounded-lg border theme-border px-4 text-sm font-medium theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] disabled:opacity-50 transition"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <LoaderCircle size={16} className="animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Ya, Hapus
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

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({ title, value, description, icon: Icon }) {
  return (
    <div className="theme-card rounded-xl border theme-border p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium theme-text-muted">{title}</p>
          <p className="mt-3 text-2xl font-bold tracking-tight tabular-nums theme-text">
            {value.toLocaleString("id-ID")}
          </p>
          <p className="mt-1 text-xs theme-text-muted">{description}</p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ACTION BUTTON
========================================================= */

function ActionButton({ label, onClick, danger = false, children }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition ${
        danger
          ? "theme-text-muted hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
          : "theme-text-muted hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] hover:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)]"
      }`}
    >
      {children}
    </button>
  );
}