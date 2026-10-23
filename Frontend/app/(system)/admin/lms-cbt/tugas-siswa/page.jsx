"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Search,
  Eye,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  Clock3,
  Users,
  FileText,
  CalendarDays,
  BookOpen,
  AlertCircle,
  RefreshCw,
  Loader2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Award,
} from "lucide-react";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  getAllTugasAdmin,
  updateTugas,
  deleteTugas,
  getPengumpulanByTugas,
  beriNilaiTugas,
} from "@/services/tugas.service";


const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";

const themePrimaryHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";

const themeTextHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themePrimaryShadow =
  "shadow-[0_8px_24px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeCardShadow =
  "shadow-[0_6px_24px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";


function formatTanggal(isoString) {
  if (!isoString) return "-";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return "-";
  }
}

function formatWaktu(isoString) {
  if (!isoString) return "-";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d);
  } catch {
    return "-";
  }
}

function getStatusTugas(batasWaktu) {
  if (!batasWaktu) return { label: "Aktif", className: "theme-success", isExpired: false };
  const deadline = new Date(batasWaktu);
  const now = new Date();
  if (isNaN(deadline.getTime())) {
    return { label: "Aktif", className: "theme-success", isExpired: false };
  }
  if (now > deadline) {
    return { label: "Lewat Tenggat", className: "theme-danger", isExpired: true };
  }
  return { label: "Berjalan", className: "theme-success", isExpired: false };
}

function getStatusPengumpulanBadge(status) {
  const s = String(status || "").toLowerCase();
  if (s === "dinilai") {
    return { label: "Dinilai", className: "theme-success" };
  }
  if (s === "terlambat") {
    return { label: "Terlambat", className: "theme-warning" };
  }
  return { label: "Dikumpulkan", className: "theme-info" };
}


export default function TugasSiswaPage() {
  const [tugasList, setTugasList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pageError, setPageError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterKelas, setFilterKelas] = useState("Semua");
  const [filterMapel, setFilterMapel] = useState("Semua");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);


  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setPageError(null);

    try {
      const data = await getAllTugasAdmin();
      setTugasList(Array.isArray(data) ? data : []);
    } catch (err) {
      setPageError(err.message || "Gagal menghubungi server backend.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);


  const totalTugas = tugasList.length;
  const now = new Date();

  const activeCount = tugasList.filter((item) => {
    if (!item.batasWaktu) return true;
    return new Date(item.batasWaktu) >= now;
  }).length;

  const expiredCount = tugasList.filter((item) => {
    if (!item.batasWaktu) return false;
    return new Date(item.batasWaktu) < now;
  }).length;

  const totalDikumpulkan = tugasList.reduce(
    (total, item) => total + (item.jumlahPengumpulan || 0),
    0
  );


  const kelasOptions = useMemo(() => {
    const set = new Set();
    tugasList.forEach((t) => {
      if (t.kelasNama && t.kelasNama !== "-") set.add(t.kelasNama);
    });
    return Array.from(set);
  }, [tugasList]);

  const mapelOptions = useMemo(() => {
    const set = new Set();
    tugasList.forEach((t) => {
      if (t.mapelNama && t.mapelNama !== "-") set.add(t.mapelNama);
    });
    return Array.from(set);
  }, [tugasList]);

  const filteredTugas = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const currTime = new Date();

    return tugasList.filter((item) => {
      if (filterStatus === "Berjalan") {
        if (item.batasWaktu && new Date(item.batasWaktu) < currTime) return false;
      } else if (filterStatus === "Lewat Tenggat") {
        if (!item.batasWaktu || new Date(item.batasWaktu) >= currTime) return false;
      }

      if (filterKelas !== "Semua" && item.kelasNama !== filterKelas) {
        return false;
      }

      if (filterMapel !== "Semua" && item.mapelNama !== filterMapel) {
        return false;
      }

      if (!keyword) return true;

      const judul = (item.judul || "").toLowerCase();
      const deskripsi = (item.deskripsi || "").toLowerCase();
      const mapel = (item.mapelNama || "").toLowerCase();
      const kelas = (item.kelasNama || "").toLowerCase();
      const guru = (item.guruNama || "").toLowerCase();

      return (
        judul.includes(keyword) ||
        deskripsi.includes(keyword) ||
        mapel.includes(keyword) ||
        kelas.includes(keyword) ||
        guru.includes(keyword)
      );
    });
  }, [tugasList, search, filterStatus, filterKelas, filterMapel]);

  const totalPages = Math.max(1, Math.ceil(filteredTugas.length / pageSize));

  const paginatedTugas = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTugas.slice(start, start + pageSize);
  }, [filteredTugas, currentPage]);

  const handleFilterChange = (setter, val) => {
    setter(val);
    setCurrentPage(1);
  };


  const confirmDelete = async () => {
    if (!deleteConfirmItem) return;
    setSubmitting(true);
    try {
      await deleteTugas(deleteConfirmItem.id);
      setFeedback({
        type: "success",
        message: `Tugas "${deleteConfirmItem.judul}" berhasil dihapus.`,
      });
      setDeleteConfirmItem(null);
      await loadData(true);
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.message || "Gagal menghapus tugas.",
      });
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="flex min-h-screen theme-page">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Header />

        <main className="flex-1 px-4 md:px-6 lg:px-8 py-6 theme-page">
          <div className="mb-3">
            <p className="text-sm theme-text-muted">
              LMS & CBT
              <span className="mx-2 theme-text-placeholder">/</span>
              <span className="theme-text-secondary">Tugas Siswa</span>
            </p>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7">
            <div className="flex items-center gap-3">
              <div
                className={`
                  w-12 h-12
                  rounded-xl
                  bg-[var(--color-primary)]
                  flex
                  items-center
                  justify-center
                  ${themePrimaryShadow}
                `}
              >
                <ClipboardList size={24} className="text-white" />
              </div>

              <div>
                <h1 className="text-2xl font-bold theme-text">Tugas Siswa</h1>
                <p className="text-sm theme-text-muted mt-1">
                  Pantau penugasan kelas, tenggat waktu, pengumpulan berkas jawaban, dan penilaian siswa.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => loadData(true)}
                disabled={loading || refreshing}
                className={`
                  inline-flex
                  items-center
                  gap-2
                  px-4
                  py-2.5
                  rounded-xl
                  theme-card
                  theme-border
                  border
                  text-sm
                  font-medium
                  theme-text-secondary
                  ${themeTextHover}
                  transition-all
                  ${themeCardShadow}
                `}
                title="Segarkan data dari server"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
                <span className="hidden sm:inline">Segarkan</span>
              </button>
            </div>
          </div>

          {feedback && (
            <div
              className={`
                mb-6 p-4 rounded-xl border flex items-center justify-between
                ${
                  feedback.type === "success"
                    ? "theme-success border-[color-mix(in_srgb,var(--color-success)_30%,transparent)]"
                    : "theme-danger border-[color-mix(in_srgb,var(--color-danger)_30%,transparent)]"
                }
              `}
            >
              <div className="flex items-center gap-3">
                {feedback.type === "success" ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <AlertCircle size={18} />
                )}
                <p className="text-sm font-medium">{feedback.message}</p>
              </div>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="p-1 rounded-lg hover:opacity-70 transition"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {pageError && (
            <div className="mb-6 p-4 rounded-xl border theme-danger border-[color-mix(in_srgb,var(--color-danger)_30%,transparent)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle size={18} />
                <p className="text-sm font-medium">{pageError}</p>
              </div>
              <button
                type="button"
                onClick={() => loadData(true)}
                className="text-xs underline font-semibold px-2 py-1"
              >
                Coba Lagi
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <div
              className={`
                theme-card
                theme-border
                rounded-2xl
                border
                p-5
                ${themeCardShadow}
              `}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm theme-text-muted">Total Tugas</p>
                  <p className="text-3xl font-bold theme-text mt-2">
                    {loading ? "..." : totalTugas}
                  </p>
                  <p className="text-xs theme-text-placeholder mt-2">
                    Seluruh penugasan terdaftar
                  </p>
                </div>
                <div
                  className={`
                    w-11 h-11
                    rounded-xl
                    ${themePrimarySoft}
                    flex items-center justify-center
                    text-[var(--color-primary)]
                  `}
                >
                  <ClipboardList size={21} />
                </div>
              </div>
            </div>

            <div
              className={`
                theme-card
                theme-border
                rounded-2xl
                border
                p-5
                ${themeCardShadow}
              `}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm theme-text-muted">Tugas Berjalan</p>
                  <p className="text-3xl font-bold theme-text mt-2">
                    {loading ? "..." : activeCount}
                  </p>
                  <p className="text-xs theme-text-placeholder mt-2">
                    Masih dalam tenggat waktu
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl theme-success flex items-center justify-center">
                  <CheckCircle2 size={21} />
                </div>
              </div>
            </div>

            <div
              className={`
                theme-card
                theme-border
                rounded-2xl
                border
                p-5
                ${themeCardShadow}
              `}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm theme-text-muted">Lewat Tenggat</p>
                  <p className="text-3xl font-bold theme-text mt-2">
                    {loading ? "..." : expiredCount}
                  </p>
                  <p className="text-xs theme-text-placeholder mt-2">
                    Tenggat waktu terlampaui
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl theme-danger flex items-center justify-center">
                  <Clock3 size={21} />
                </div>
              </div>
            </div>

            <div
              className={`
                theme-card
                theme-border
                rounded-2xl
                border
                p-5
                ${themeCardShadow}
              `}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm theme-text-muted">Total Pengumpulan</p>
                  <p className="text-3xl font-bold theme-text mt-2">
                    {loading ? "..." : totalDikumpulkan}
                  </p>
                  <p className="text-xs theme-text-placeholder mt-2">
                    Berkas jawaban siswa diterima
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl theme-info flex items-center justify-center">
                  <FileText size={21} />
                </div>
              </div>
            </div>
          </div>

          <div
            className={`
              theme-card
              theme-border
              rounded-2xl
              border
              p-5
              mb-6
              ${themeCardShadow}
            `}
          >
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search
                  size={16}
                  className="
                    absolute
                    left-3.5
                    top-1/2
                    -translate-y-1/2
                    theme-text-placeholder
                  "
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    handleFilterChange(setSearch, e.target.value)
                  }
                  placeholder="Cari judul tugas, mapel, kelas, atau guru..."
                  className="
                    theme-input
                    w-full
                    pl-10
                    pr-4
                    py-2.5
                    rounded-xl
                    text-sm
                    focus:outline-none
                  "
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={filterStatus}
                  onChange={(e) =>
                    handleFilterChange(setFilterStatus, e.target.value)
                  }
                  className="
                    theme-input
                    px-3.5
                    py-2.5
                    rounded-xl
                    text-xs
                    focus:outline-none
                  "
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Berjalan">Berjalan</option>
                  <option value="Lewat Tenggat">Lewat Tenggat</option>
                </select>

                {kelasOptions.length > 0 && (
                  <select
                    value={filterKelas}
                    onChange={(e) =>
                      handleFilterChange(setFilterKelas, e.target.value)
                    }
                    className="
                      theme-input
                      px-3.5
                      py-2.5
                      rounded-xl
                      text-xs
                      focus:outline-none
                    "
                  >
                    <option value="Semua">Semua Kelas</option>
                    {kelasOptions.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                )}

                {mapelOptions.length > 0 && (
                  <select
                    value={filterMapel}
                    onChange={(e) =>
                      handleFilterChange(setFilterMapel, e.target.value)
                    }
                    className="
                      theme-input
                      px-3.5
                      py-2.5
                      rounded-xl
                      text-xs
                      focus:outline-none
                    "
                  >
                    <option value="Semua">Semua Mata Pelajaran</option>
                    {mapelOptions.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            {loading ? (
              <div className="theme-card theme-border rounded-2xl border p-12 text-center">
                <Loader2
                  size={32}
                  className="mx-auto animate-spin text-[var(--color-primary)] mb-3"
                />
                <p className="text-sm font-medium theme-text-secondary">
                  Memuat daftar tugas siswa...
                </p>
              </div>
            ) : paginatedTugas.length > 0 ? (
              paginatedTugas.map((item) => {
                const status = getStatusTugas(item.batasWaktu);

                return (
                  <div
                    key={item.id}
                    className={`
                      theme-card
                      theme-border
                      rounded-2xl
                      border
                      overflow-hidden
                      transition-all
                      hover:-translate-y-[1px]
                      ${themeCardShadow}
                    `}
                  >
                    <div className="p-5">
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                        <div
                          className={`
                            w-12 h-12 rounded-xl
                            ${themePrimarySoft}
                            flex items-center justify-center
                            shrink-0
                            text-[var(--color-primary)]
                          `}
                        >
                          <ClipboardList size={22} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h2 className="text-base font-bold theme-text">
                              {item.judul}
                            </h2>
                            <span
                              className={`
                                inline-flex
                                items-center
                                px-2.5
                                py-0.5
                                rounded-full
                                text-xs
                                font-semibold
                                ${status.className}
                              `}
                            >
                              {status.label}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs theme-text-secondary mb-3">
                            <span className="inline-flex items-center gap-1.5">
                              <BookOpen size={14} className="text-[var(--color-primary)]" />
                              {item.mapelNama}
                            </span>

                            <span className="inline-flex items-center gap-1.5">
                              <Users size={14} />
                              {item.kelasNama}
                            </span>

                            <span className="inline-flex items-center gap-1.5">
                              <FileText size={14} />
                              Guru: {item.guruNama}
                            </span>
                          </div>

                          {item.deskripsi && (
                            <p className="text-sm theme-text-secondary line-clamp-2 max-w-3xl mb-3">
                              {item.deskripsi}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-4 text-xs theme-text-secondary pt-2 theme-border-soft border-t">
                            <div className="flex items-center gap-1.5">
                              <CalendarDays
                                size={14}
                                className="text-[var(--color-primary)]"
                              />
                              <span>
                                Tenggat:{" "}
                                <strong className="theme-text">
                                  {formatTanggal(item.batasWaktu)}
                                </strong>
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <Clock3
                                size={14}
                                className={status.isExpired ? "text-red-500" : "text-yellow-500"}
                              />
                              <span>
                                Jam:{" "}
                                <strong className="theme-text">
                                  {formatWaktu(item.batasWaktu)}
                                </strong>
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 ml-auto">
                              <CheckCircle2 size={14} className="text-blue-500" />
                              <span>
                                Pengumpulan:{" "}
                                <strong className="theme-text">
                                  {item.jumlahPengumpulan || 0} Siswa
                                </strong>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex lg:flex-col items-center justify-end gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 theme-border-soft">
                          <Link
                            href={`/admin/lms-cbt/tugas-siswa/${item.id}`}
                            className={`
                              inline-flex
                              items-center
                              gap-1.5
                              px-3.5
                              py-2
                              rounded-xl
                              text-xs
                              font-semibold
                              ${themePrimarySoft}
                              text-[var(--color-primary)]
                              hover:brightness-95
                              transition
                            `}
                            title="Lihat Detail & Pengumpulan Siswa"
                          >
                            <Eye size={14} />
                            <span>Detail & Jawaban</span>
                          </Link>

                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/admin/lms-cbt/tugas-siswa/${item.id}/edit`}
                              className="
                                p-2
                                rounded-xl
                                theme-card-soft
                                theme-text-secondary
                                hover:theme-warning
                                transition
                              "
                              title="Edit Tugas"
                            >
                              <Pencil size={15} />
                            </Link>

                            <button
                              type="button"
                              onClick={() => setDeleteConfirmItem(item)}
                              className="
                                p-2
                                rounded-xl
                                theme-card-soft
                                theme-text-secondary
                                hover:theme-danger
                                transition
                              "
                              title="Hapus Tugas"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="theme-card theme-border rounded-2xl border p-12 text-center">
                <ClipboardList
                  size={36}
                  className="mx-auto theme-text-placeholder mb-3"
                />
                <p className="text-sm font-medium theme-text-secondary">
                  Tugas tidak ditemukan
                </p>
                <p className="text-xs theme-text-placeholder mt-1">
                  {search || filterStatus !== "Semua" || filterKelas !== "Semua" || filterMapel !== "Semua"
                    ? "Coba sesuaikan kata kunci pencarian atau filter yang dipilih."
                    : "Belum ada penugasan kelas yang dibuat di sekolah ini."}
                </p>
              </div>
            )}
          </div>

          {!loading && filteredTugas.length > 0 && (
            <div className="theme-card theme-border rounded-2xl border px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs theme-text-muted">
                Menampilkan{" "}
                <span className="font-semibold theme-text">
                  {(currentPage - 1) * pageSize + 1}
                </span>{" "}
                sampai{" "}
                <span className="font-semibold theme-text">
                  {Math.min(currentPage * pageSize, filteredTugas.length)}
                </span>{" "}
                dari{" "}
                <span className="font-semibold theme-text">
                  {filteredTugas.length}
                </span>{" "}
                tugas
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="
                    p-2
                    rounded-lg
                    theme-card-soft
                    theme-border-soft
                    border
                    theme-text-secondary
                    hover:brightness-95
                    disabled:opacity-40
                    disabled:cursor-not-allowed
                    transition
                  "
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft size={16} />
                </button>

                <span className="px-3 py-1 text-xs font-semibold theme-text">
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage >= totalPages}
                  className="
                    p-2
                    rounded-lg
                    theme-card-soft
                    theme-border-soft
                    border
                    theme-text-secondary
                    hover:brightness-95
                    disabled:opacity-40
                    disabled:cursor-not-allowed
                    transition
                  "
                  title="Halaman Selanjutnya"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 bg-[color-mix(in_srgb,var(--color-text)_45%,transparent)] backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`
              theme-card
              theme-border
              w-full
              max-w-md
              rounded-2xl
              border
              ${themeCardShadow}
              p-6
            `}
          >
            <div className="w-12 h-12 rounded-xl theme-danger flex items-center justify-center mb-4">
              <Trash2 size={24} />
            </div>

            <h3 className="text-lg font-bold theme-text">Hapus Tugas Siswa</h3>
            <p className="text-sm theme-text-secondary mt-2">
              Apakah Anda yakin ingin menghapus penugasan{" "}
              <span className="font-semibold text-[var(--color-primary)]">
                &ldquo;{deleteConfirmItem.judul}&rdquo;
              </span>
              ? Tindakan ini akan menghapus tugas dari sistem.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                disabled={submitting}
                className="
                  px-4
                  py-2.5
                  rounded-xl
                  theme-card-soft
                  theme-text-secondary
                  text-sm
                  font-medium
                  hover:brightness-95
                  transition
                "
              >
                Batal
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={submitting}
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-5
                  py-2.5
                  rounded-xl
                  bg-[var(--color-danger,#ef4444)]
                  text-white
                  text-sm
                  font-semibold
                  hover:brightness-95
                  disabled:opacity-60
                  transition
                "
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {submitting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
