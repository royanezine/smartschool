"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Star,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  Trash2,
  MessageSquareQuote,
  AlertCircle,
  UserRound,
  CalendarDays,
  ShieldCheck,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
} from "lucide-react";

import {
  getReviews,
  updateReviewAdmin,
  deleteReviewAdmin,
} from "@/services/review.service"; // Sesuaikan path import Anda

const STATUS_OPTIONS = [
  { value: "semua", label: "Semua Review" },
  { value: "menunggu", label: "Menunggu Moderasi" },
  { value: "tampil", label: "Ditampilkan" },
  { value: "disembunyikan", label: "Disembunyikan" },
];

/* =========================================================
   HELPER FUNCTIONS
========================================================= */

function normalizeResponse(response) {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getUserName(review) {
  return review?.pengguna?.namaLengkap || review?.pengguna?.nama || "Pengguna";
}

function getUserRole(review) {
  return (
    review?.pengguna?.jabatan ||
    review?.pengguna?.peran?.namaTampilan ||
    review?.pengguna?.peran?.nama ||
    "Pengguna SmartSchool"
  );
}

/* =========================================================
   UI COMPONENTS
========================================================= */

function StatusBadge({ status }) {
  const styles = {
    menunggu: "border-amber-200 bg-amber-50 text-amber-700",
    tampil: "border-emerald-200 bg-emerald-50 text-emerald-700",
    disembunyikan: "border-slate-200 bg-slate-100 text-slate-600",
  };

  const labels = {
    menunggu: "Menunggu",
    tampil: "Ditampilkan",
    disembunyikan: "Disembunyikan",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
        styles[status] || styles.menunggu
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

function Rating({ value }) {
  const rating = Math.max(0, Math.min(5, Number(value) || 0));

  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating ${rating} dari 5`}>
      {[1, 2, 3, 4, 5].map((number) => (
        <Star
          key={number}
          size={14}
          className={
            number <= rating
              ? "fill-amber-400 text-amber-400"
              : "text-slate-200"
          }
        />
      ))}
      <span className="ml-1.5 text-xs font-semibold text-slate-700">
        {rating}/5
      </span>
    </div>
  );
}

function StatCard({ title, value, description, icon: Icon, statusDot }) {
  return (
    <div className="theme-card theme-border flex flex-col justify-between rounded-xl border p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider theme-text-muted">
            {statusDot && <span className={`inline-block h-2 w-2 rounded-full ${statusDot}`} />}
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight theme-text">
            {value}
          </p>
        </div>
        <div className="rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] p-2.5 theme-primary-text">
          <Icon size={20} />
        </div>
      </div>
      <p className="mt-3 text-xs theme-text-muted">{description}</p>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function ModerasiReviewPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  
  // Filter States
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("menunggu");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortOrder, setSortOrder] = useState("desc"); // "asc" | "desc"

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirmDialog, setConfirmDialog] = useState(null);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = { page: 1, limit: 100 };
      // Hanya kirim parameter status ke backend jika bukan 'semua'
      // Filter tanggal dan sorting kita lakukan di client-side (useMemo) agar responsif
      if (statusFilter !== "semua") params.status = statusFilter;

      const response = await getReviews(params);
      setReviews(normalizeResponse(response));
    } catch (err) {
      console.error("Gagal mengambil review:", err);
      setError(err?.message || "Gagal mengambil data review.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadReviews();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadReviews]);

  // LOGIKA FILTER & SORTING (Client-Side)
  const filteredAndSortedReviews = useMemo(() => {
    let result = [...reviews];

    // 1. Search Filter
    const keyword = search.trim().toLowerCase();
    if (keyword) {
      result = result.filter((review) => {
        const values = [
          getUserName(review),
          getUserRole(review),
          review?.komentar,
          review?.status,
        ];
        return values.some((value) =>
          String(value || "").toLowerCase().includes(keyword)
        );
      });
    }

    // 2. Date Range Filter
    if (startDate || endDate) {
      result = result.filter((review) => {
        const reviewDate = new Date(review.dibuatPada).getTime();
        if (Number.isNaN(reviewDate)) return false;

        const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
        const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;

        if (start && reviewDate < start) return false;
        if (end && reviewDate > end) return false;

        return true;
      });
    }

    // 3. Sorting (Asc / Desc berdasarkan tanggal)
    result.sort((a, b) => {
      const dateA = new Date(a.dibuatPada).getTime() || 0;
      const dateB = new Date(b.dibuatPada).getTime() || 0;
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [reviews, search, startDate, endDate, sortOrder]);

  const stats = useMemo(() => {
    return {
      menunggu: reviews.filter((item) => item.status === "menunggu").length,
      tampil: reviews.filter((item) => item.status === "tampil").length,
      disembunyikan: reviews.filter((item) => item.status === "disembunyikan").length,
    };
  }, [reviews]);

  async function handleStatusChange(review, status) {
    setProcessingId(review.id);
    setError("");
    setNotice("");

    try {
      await updateReviewAdmin(review.id, { status });
      setNotice(
        status === "tampil"
          ? "Review berhasil disetujui."
          : status === "disembunyikan"
            ? "Review berhasil disembunyikan."
            : "Status review dikembalikan ke antrean."
      );
      await loadReviews();
    } catch (err) {
      setError(err?.message || "Gagal memperbarui status review.");
    } finally {
      setProcessingId(null);
    }
  }

  function requestStatusChange(review, status) {
    const actionLabels = {
      tampil: "menampilkan",
      disembunyikan: "menyembunyikan",
      menunggu: "mengembalikan ke antrean",
    };

    setConfirmDialog({
      title: `${status === "tampil" ? "Tampilkan" : status === "disembunyikan" ? "Sembunyikan" : "Kembalikan"} Review`,
      message: `Apakah kamu yakin ingin ${actionLabels[status]} review dari ${getUserName(review)}?`,
      confirmLabel: status === "tampil" ? "Tampilkan" : status === "disembunyikan" ? "Sembunyikan" : "Kembalikan",
      isDanger: status === "disembunyikan",
      onConfirm: () => handleStatusChange(review, status),
    });
  }

  async function handleDelete(review) {
    setProcessingId(review.id);
    setError("");
    setNotice("");

    try {
      await deleteReviewAdmin(review.id);
      setNotice("Review berhasil dihapus.");
      await loadReviews();
    } catch (err) {
      setError(err?.message || "Gagal menghapus review.");
    } finally {
      setProcessingId(null);
    }
  }

  function requestDelete(review) {
    setConfirmDialog({
      title: "Hapus Review",
      message: `Hapus review dari ${getUserName(review)} secara permanen? Tindakan ini tidak dapat dibatalkan.`,
      confirmLabel: "Hapus Permanen",
      isDanger: true,
      onConfirm: () => handleDelete(review),
    });
  }

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  return (
    <main className="theme-page theme-text min-h-full w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      {/* Tanpa max-w & mx-auto agar konten selalu menempel ke sidebar saat zoom out */}
      <div className="w-full space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider theme-primary-text">
              <ShieldCheck size={16} />
              Panel Super Admin
            </div>
            <h1 className="text-2xl font-bold tracking-tight theme-text sm:text-3xl">
              Moderasi Review
            </h1>
            <p className="mt-1 text-sm theme-text-muted">
              Kelola dan pantau ulasan dari pengguna sebelum dipublikasikan.
            </p>
          </div>

          <button
            onClick={loadReviews}
            disabled={loading}
            className="theme-border theme-card theme-text-secondary inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold shadow-sm transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* FEEDBACK ALERTS */}
        {error && (
          <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30 p-4 text-sm text-red-700 dark:text-red-300">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">Terjadi Kesalahan</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        {notice && (
          <div role="status" className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/30 p-4 text-sm text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <p className="flex-1 font-medium">{notice}</p>
            <button onClick={() => setNotice("")} className="font-bold hover:opacity-75" aria-label="Tutup">×</button>
          </div>
        )}

        {/* STATISTICS */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            title="Menunggu Moderasi"
            value={stats.menunggu}
            description="Review yang perlu diperiksa"
            icon={Clock3}
            statusDot="bg-[var(--color-warning)]"
          />
          <StatCard
            title="Ditampilkan"
            value={stats.tampil}
            description="Review disetujui dan tayang"
            icon={Eye}
            statusDot="bg-[var(--color-success)]"
          />
          <StatCard
            title="Disembunyikan"
            value={stats.disembunyikan}
            description="Review yang tidak dipublikasikan"
            icon={EyeOff}
            statusDot="bg-[var(--color-text-muted)]"
          />
        </section>

        {/* LIST CONTAINER */}
        <section className="theme-border theme-card overflow-hidden rounded-xl border shadow-sm">
          
          {/* TOOLBAR (Pencarian, Filter, dan Sort) */}
          <div className="theme-border flex flex-col gap-4 border-b p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-bold theme-text">Daftar Review</h2>
                <p className="mt-0.5 text-sm theme-text-muted">
                  {filteredAndSortedReviews.length} review ditemukan
                </p>
              </div>

              {/* Global Search & Status Select */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search size={16} className="theme-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama atau komentar..."
                    className="theme-border theme-surface theme-text w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_16%,transparent)] sm:w-64"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="theme-border theme-card theme-text rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_16%,transparent)]"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter Tanggal & Sort */}
            <div className="theme-border flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="theme-text-secondary flex items-center gap-2 text-sm">
                <Filter size={16} />
                <span className="font-medium">Filter Tanggal:</span>
              </div>
              
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="theme-border theme-surface theme-text rounded-lg border px-2 py-1.5 text-sm outline-none focus:border-[var(--color-primary)]"
                  />
                  <span className="theme-text-muted">-</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="theme-border theme-surface theme-text rounded-lg border px-2 py-1.5 text-sm outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                <button
                  onClick={toggleSortOrder}
                  className="theme-border theme-card theme-text-secondary inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]"
                  title="Ubah urutan tanggal"
                >
                  {sortOrder === "desc" ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                  {sortOrder === "desc" ? "Terbaru" : "Terlama"}
                </button>
              </div>
            </div>
          </div>

          {/* CONTENT */}
          {loading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
              <p className="theme-text-muted text-sm font-medium">Memuat data review...</p>
            </div>
          ) : filteredAndSortedReviews.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-4 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] p-4">
                <MessageSquareQuote size={28} className="theme-primary-text" />
              </div>
              <h3 className="font-semibold theme-text">Tidak Ada Review</h3>
              <p className="mt-2 max-w-md text-sm theme-text-muted">
                Tidak ada review yang cocok dengan filter saat ini. Coba ubah filter tanggal, status, atau kata kunci pencarian.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {filteredAndSortedReviews.map((review) => {
                const isProcessing = processingId === review.id;

                return (
                  <article key={review.id} className="p-4 transition-colors hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      
                      {/* KIRI: Info User & Komentar */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                            <UserRound size={20} />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold theme-text">{getUserName(review)}</h3>
                              <StatusBadge status={review.status} />
                            </div>
                            <p className="text-xs font-medium theme-text-muted">{getUserRole(review)}</p>
                            <div className="mt-1.5 flex items-center gap-3 text-[11px] theme-text-muted">
                              <span className="inline-flex items-center gap-1">
                                <CalendarDays size={12} /> {formatDate(review.dibuatPada)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="pl-0 sm:pl-13">
                          <Rating value={review.rating} />
                          <div className="theme-border theme-surface theme-text-secondary mt-3 rounded-lg border p-4 text-sm leading-relaxed">
                            {review.komentar || <span className="italic theme-text-muted">Tidak ada komentar.</span>}
                          </div>
                        </div>
                      </div>

                      {/* KANAN: Tombol Aksi */}
                      <div className="theme-border flex shrink-0 flex-col gap-2 border-t pt-4 lg:w-48 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                        {review.status !== "tampil" && (
                          <button
                            type="button"
                            onClick={() => requestStatusChange(review, "tampil")}
                            disabled={isProcessing}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                          >
                            <CheckCircle2 size={14} /> Setujui & Tampilkan
                          </button>
                        )}
                        {review.status !== "disembunyikan" && (
                          <button
                            type="button"
                            onClick={() => requestStatusChange(review, "disembunyikan")}
                            disabled={isProcessing}
                            className="theme-border theme-card theme-text-secondary inline-flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:opacity-50"
                          >
                            <EyeOff size={14} /> Sembunyikan
                          </button>
                        )}
                        {review.status !== "menunggu" && (
                          <button
                            type="button"
                            onClick={() => requestStatusChange(review, "menunggu")}
                            disabled={isProcessing}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/30 px-3 py-2 text-xs font-semibold text-amber-800 dark:text-amber-300 transition hover:bg-amber-100 disabled:opacity-50"
                          >
                            <Clock3 size={14} /> Kembalikan Antrean
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => requestDelete(review)}
                          disabled={isProcessing}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 dark:border-red-900/50 theme-card px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 transition hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50"
                        >
                          <Trash2 size={14} /> Hapus Permanen
                        </button>
                        {isProcessing && (
                          <p className="mt-1 flex items-center justify-center gap-1.5 text-[10px] theme-text-muted">
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
                            Memproses...
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <p className="text-center text-[11px] leading-5 theme-text-muted">
          Hak akses moderasi dilindungi oleh middleware Super Admin.
        </p>
      </div>

      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="theme-card theme-border w-full max-w-md rounded-2xl p-6 shadow-2xl border">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2.5 rounded-xl ${confirmDialog.isDanger ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text'}`}>
                {confirmDialog.isDanger ? <AlertCircle size={22} /> : <ShieldCheck size={22} />}
              </div>
              <h3 className="text-lg font-bold theme-text">{confirmDialog.title}</h3>
            </div>
            <p className="text-sm theme-text-secondary mb-6 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="theme-text-secondary hover:theme-text px-4 py-2 text-sm font-semibold rounded-xl hover:bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  const action = confirmDialog.onConfirm;
                  setConfirmDialog(null);
                  if (action) await action();
                }}
                className={`px-4 py-2 text-sm font-semibold rounded-xl shadow-sm transition ${
                  confirmDialog.isDanger
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "theme-primary"
                }`}
              >
                {confirmDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}