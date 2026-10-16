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

    if (match) {
      return `${match[1].padStart(2, "0")}:${match[2]}`;
    }

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
      item.toleransiTerlambatMenit ??
        item.toleransiTerlambat ??
        15
    ),
    status: String(item.status ?? "aktif").toLowerCase(),
    jumlahPegawai: Number(
      item.jumlahPegawai ?? item._count?.pengguna ?? 0
    ),
    totalAbsensi: Number(
      item.totalAbsensi ?? item._count?.absensi ?? 0
    ),
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
  const total =
    hours * 60 + minutes + shift.toleransiTerlambatMenit;

  const normalized = ((total % 1440) + 1440) % 1440;

  return `${String(Math.floor(normalized / 60)).padStart(
    2,
    "0"
  )}:${String(normalized % 60).padStart(2, "0")}`;
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
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const params = {
          page,
          limit,
          ...(search.trim() ? { search: search.trim() } : {}),
          ...(statusFilter !== "semua"
            ? { status: statusFilter }
            : {}),
        };

        const response = await getShiftKerja(params);

        const items = Array.isArray(response?.data)
          ? response.data
          : [];

        setShifts(items.map(normalizeShift));

        const total = Number(response?.total ?? 0);
        const totalPages = Number(
          response?.totalPages ??
            (total > 0 ? Math.ceil(total / limit) : 0)
        );

        setMeta({
          total,
          totalPages,
          page: Number(response?.page ?? page),
          limit: Number(response?.limit ?? limit),
        });

        if (totalPages > 0 && page > totalPages) {
          setPage(totalPages);
        }

        if (total === 0 && page !== 1) {
          setPage(1);
        }
      } catch (err) {
        setShifts([]);
        setMeta({
          total: 0,
          totalPages: 0,
          page,
          limit,
        });
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
     SEARCH
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

  const activeCount = shifts.filter(
    (shift) => shift.status === "aktif"
  ).length;

  const assignedCount = shifts.reduce(
    (sum, shift) => sum + shift.jumlahPegawai,
    0
  );

  const attendanceCount = shifts.reduce(
    (sum, shift) => sum + shift.totalAbsensi,
    0
  );

  const firstItem =
    meta.total === 0 ? 0 : (page - 1) * limit + 1;

  const lastItem = Math.min(page * limit, meta.total);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Sidebar: kolom kiri, tidak ikut scroll halaman */}
      <Sidebar
        role="admin"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Kolom kanan: header di atas + main scroll */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header: selalu rapi di atas, tidak ikut scroll */}
        <div className="shrink-0">
          <Header onMenuClick={() => setSidebarOpen(true)} />
        </div>

        {/* HANYA area ini yang scroll */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
            {/* PAGE HEADER */}
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <span>Presensi</span>
                  <span>/</span>
                  <span className="text-blue-700 dark:text-blue-400">
                    Master Shift
                  </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Master Shift Kerja
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Kelola jadwal kerja, jam masuk, jam pulang,
                  dan toleransi keterlambatan pegawai.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => loadShifts(true)}
                  disabled={refreshing || loading}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <RefreshCw
                    size={16}
                    className={refreshing ? "animate-spin" : ""}
                  />
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/admin/presensi/master-shift/tambah"
                    )
                  }
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800"
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

            {/* SUMMARY */}
            <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                title="Total Shift"
                value={meta.total}
                description="Sesuai hasil filter"
                icon={CalendarClock}
              />

              <SummaryCard
                title="Shift Aktif"
                value={activeCount}
                description="Pada halaman ini"
                icon={CheckCircle2}
              />

              <SummaryCard
                title="Pegawai Terdaftar"
                value={assignedCount}
                description="Pada shift di halaman ini"
                icon={Users}
              />

              <SummaryCard
                title="Total Absensi"
                value={attendanceCount}
                description="Pada shift di halaman ini"
                icon={ClipboardCheck}
              />
            </div>

            {/* FILTERS + TABLE */}
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-200 p-4 dark:border-slate-800 sm:p-5">
                <div className="mb-4">
                  <h2 className="font-semibold">Daftar Shift Kerja</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Cari berdasarkan nama atau kode shift.
                  </p>
                </div>

                <form
                  onSubmit={handleSearchSubmit}
                  className="flex flex-col gap-3 md:flex-row"
                >
                  <div className="relative min-w-0 flex-1">
                    <Search
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="search"
                      value={searchInput}
                      onChange={(event) =>
                        setSearchInput(event.target.value)
                      }
                      placeholder="Cari nama atau kode shift..."
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-blue-950"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      handleStatusChange(event.target.value)
                    }
                    aria-label="Filter status shift"
                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 md:w-44"
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
                    className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Reset
                  </button>
                </form>
              </div>

              {/* TABLE */}
              <div className="relative">
                {loading ? (
                  <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
                    <LoaderCircle
                      size={28}
                      className="animate-spin text-blue-600"
                    />
                    <p className="mt-3 text-sm font-medium">
                      Memuat data shift...
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Mengambil data dari Backend
                    </p>
                  </div>
                ) : error && shifts.length === 0 ? (
                  <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
                    <AlertCircle size={30} className="text-red-500" />
                    <p className="mt-3 font-semibold">
                      Data shift gagal dimuat
                    </p>
                    <p className="mt-1 max-w-md text-sm text-slate-500">
                      Periksa koneksi Backend dan akses akunmu,
                      lalu coba muat ulang.
                    </p>
                    <button
                      type="button"
                      onClick={() => loadShifts(true)}
                      className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-blue-700 px-3 text-sm font-medium text-white hover:bg-blue-800"
                    >
                      <RefreshCw size={15} />
                      Coba Lagi
                    </button>
                  </div>
                ) : shifts.length === 0 ? (
                  <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800">
                      <Clock3 size={23} />
                    </div>
                    <p className="mt-4 font-semibold">
                      Belum ada shift kerja
                    </p>
                    <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                      Tidak ada data yang cocok dengan pencarian
                      atau filter saat ini.
                    </p>
                    {(search || statusFilter !== "semua") && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="mt-3 text-sm font-semibold text-blue-700 hover:underline dark:text-blue-400"
                      >
                        Hapus filter
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[900px] text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950/60 dark:text-slate-400">
                          <tr>
                            <th className="px-5 py-4 font-semibold">
                              Shift
                            </th>
                            <th className="px-5 py-4 font-semibold">
                              Jam Kerja
                            </th>
                            <th className="px-5 py-4 font-semibold">
                              Toleransi
                            </th>
                            <th className="px-5 py-4 font-semibold">
                              Pegawai
                            </th>
                            <th className="px-5 py-4 font-semibold">
                              Absensi
                            </th>
                            <th className="px-5 py-4 font-semibold">
                              Status
                            </th>
                            <th className="px-5 py-4 text-right font-semibold">
                              Aksi
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {shifts.map((shift) => (
                            <tr
                              key={shift.id}
                              className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                            >
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                                    <Clock3 size={19} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                                      {shift.nama}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                      Kode: {shift.kode || "-"}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <p className="font-medium tabular-nums">
                                  {formatTime(shift.jamMasuk)}
                                  <span className="mx-2 text-slate-400">
                                    –
                                  </span>
                                  {formatTime(shift.jamKeluar)}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  Masuk – Pulang
                                </p>
                              </td>

                              <td className="px-5 py-4">
                                <p className="font-medium">
                                  {shift.toleransiTerlambatMenit} menit
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  Batas {getLateLimit(shift)}
                                </p>
                              </td>

                              <td className="px-5 py-4">
                                <div className="inline-flex items-center gap-2">
                                  <Users
                                    size={16}
                                    className="text-slate-400"
                                  />
                                  <span className="font-medium tabular-nums">
                                    {shift.jumlahPegawai}
                                  </span>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <div className="inline-flex items-center gap-2">
                                  <ClipboardCheck
                                    size={16}
                                    className="text-slate-400"
                                  />
                                  <span className="font-medium tabular-nums">
                                    {shift.totalAbsensi}
                                  </span>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${
                                    shift.status === "aktif"
                                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                                  }`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      shift.status === "aktif"
                                        ? "bg-emerald-500"
                                        : "bg-slate-400"
                                    }`}
                                  />
                                  {getStatusLabel(shift.status)}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex items-center justify-end gap-1">
                                  <ActionButton
                                    label="Detail"
                                    onClick={() =>
                                      router.push(
                                        `/admin/presensi/master-shift/${shift.id}`
                                      )
                                    }
                                  >
                                    <Eye size={16} />
                                  </ActionButton>

                                  <ActionButton
                                    label="Edit"
                                    onClick={() =>
                                      router.push(
                                        `/admin/presensi/master-shift/${shift.id}/edit`
                                      )
                                    }
                                  >
                                    <Pencil size={16} />
                                  </ActionButton>

                                  <ActionButton
                                    label="Hapus"
                                    danger
                                    onClick={() =>
                                      setDeleteTarget(shift)
                                    }
                                  >
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
                    <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Menampilkan{" "}
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {firstItem}–{lastItem}
                        </span>{" "}
                        dari{" "}
                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                          {meta.total}
                        </span>{" "}
                        shift
                      </p>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={page <= 1 || loading}
                          onClick={() =>
                            setPage((current) =>
                              Math.max(1, current - 1)
                            )
                          }
                          className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm font-medium transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
                        >
                          <ChevronLeft size={16} />
                          Sebelumnya
                        </button>

                        <span className="min-w-20 text-center text-sm text-slate-600 dark:text-slate-300">
                          {page} / {Math.max(meta.totalPages, 1)}
                        </span>

                        <button
                          type="button"
                          disabled={page >= meta.totalPages || loading}
                          onClick={() =>
                            setPage((current) =>
                              Math.min(
                                meta.totalPages,
                                current + 1
                              )
                            )
                          }
                          className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm font-medium transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
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

            <p className="mt-5 text-xs leading-5 text-slate-400">
              Data shift, status, jumlah pegawai, dan jumlah
              absensi ditampilkan berdasarkan respons Backend.
            </p>
          </div>
        </main>
      </div>

      {/* DELETE CONFIRMATION */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting) {
              setDeleteTarget(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-shift-title"
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
              <Trash2 size={21} />
            </div>

            <h2
              id="delete-shift-title"
              className="mt-4 text-lg font-bold"
            >
              Hapus shift kerja?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Shift{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {deleteTarget.nama}
              </span>{" "}
              akan dinonaktifkan dari daftar shift. Jika masih
              digunakan oleh pegawai, Backend dapat menolak
              permintaan ini.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
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
                    <LoaderCircle
                      size={16}
                      className="animate-spin"
                    />
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
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <p className="mt-3 text-2xl font-bold tracking-tight tabular-nums">
            {value.toLocaleString("id-ID")}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
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
          ? "text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
          : "text-slate-500 hover:bg-blue-50 hover:text-blue-700 dark:text-slate-400 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
      }`}
    >
      {children}
    </button>
  );
}