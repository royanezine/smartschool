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

function StatCard({ title, value, description, icon: Icon, color }) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        <div className={`rounded-lg p-2.5 ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">{description}</p>
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
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700">
              <ShieldCheck size={16} />
              Panel Super Admin
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Moderasi Review
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Kelola dan pantau ulasan dari pengguna sebelum dipublikasikan.
            </p>
          </div>

          <button
            onClick={loadReviews}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* FEEDBACK ALERTS */}
        {error && (
          <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">Terjadi Kesalahan</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        {notice && (
          <div role="status" className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <p className="flex-1 font-medium">{notice}</p>
            <button onClick={() => setNotice("")} className="font-bold hover:text-emerald-900" aria-label="Tutup">×</button>
          </div>
        )}

        {/* STATISTICS */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            title="Menunggu Moderasi"
            value={stats.menunggu}
            description="Review yang perlu diperiksa"
            icon={Clock3}
            color="bg-amber-50 text-amber-700"
          />
          <StatCard
            title="Ditampilkan"
            value={stats.tampil}
            description="Review disetujui dan tayang"
            icon={Eye}
            color="bg-emerald-50 text-emerald-700"
          />
          <StatCard
            title="Disembunyikan"
            value={stats.disembunyikan}
            description="Review yang tidak dipublikasikan"
            icon={EyeOff}
            color="bg-slate-100 text-slate-600"
          />
        </section>

        {/* LIST CONTAINER */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          
          {/* TOOLBAR (Pencarian, Filter, dan Sort) */}
          <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Daftar Review</h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  {filteredAndSortedReviews.length} review ditemukan
                </p>
              </div>

              {/* Global Search & Status Select */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama atau komentar..."
                    className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-64"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter Tanggal & Sort */}
            <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Filter size={16} />
                <span className="font-medium">Filter Tanggal:</span>
              </div>
              
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-slate-700 outline-none focus:border-blue-500"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm text-slate-700 outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  onClick={toggleSortOrder}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
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
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <p className="text-sm font-medium text-slate-500">Memuat data review...</p>
            </div>
          ) : filteredAndSortedReviews.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-4 rounded-full bg-slate-100 p-4">
                <MessageSquareQuote size={28} className="text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-800">Tidak Ada Review</h3>
              <p className="mt-2 max-w-md text-sm text-slate-500">
                Tidak ada review yang cocok dengan filter saat ini. Coba ubah filter tanggal, status, atau kata kunci pencarian.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredAndSortedReviews.map((review) => {
                const isProcessing = processingId === review.id;

                return (
                  <article key={review.id} className="p-4 transition-colors hover:bg-slate-50/50 sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      
                      {/* KIRI: Info User & Komentar */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                            <UserRound size={20} />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-slate-900">{getUserName(review)}</h3>
                              <StatusBadge status={review.status} />
                            </div>
                            <p className="text-xs font-medium text-slate-500">{getUserRole(review)}</p>
                            <div className="mt-1.5 flex items-center gap-3 text-[11px] text-slate-400">
                              <span className="inline-flex items-center gap-1">
                                <CalendarDays size={12} /> {formatDate(review.dibuatPada)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="pl-0 sm:pl-13">
                          <Rating value={review.rating} />
                          <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                            {review.komentar || <span className="italic text-slate-400">Tidak ada komentar.</span>}
                          </div>
                        </div>
                      </div>

                      {/* KANAN: Tombol Aksi */}
                      <div className="flex shrink-0 flex-col gap-2 border-t border-slate-100 pt-4 lg:w-48 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
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
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                          >
                            <EyeOff size={14} /> Sembunyikan
                          </button>
                        )}
                        {review.status !== "menunggu" && (
                          <button
                            type="button"
                            onClick={() => requestStatusChange(review, "menunggu")}
                            disabled={isProcessing}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 disabled:opacity-50"
                          >
                            <Clock3 size={14} /> Kembalikan Antrean
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => requestDelete(review)}
                          disabled={isProcessing}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 size={14} /> Hapus Permanen
                        </button>
                        {isProcessing && (
                          <p className="mt-1 flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
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

        <p className="text-center text-[11px] leading-5 text-slate-400">
          Hak akses moderasi dilindungi oleh middleware Super Admin.
        </p>
      </div>

      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2.5 rounded-xl ${confirmDialog.isDanger ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                {confirmDialog.isDanger ? <AlertCircle size={22} /> : <ShieldCheck size={22} />}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{confirmDialog.title}</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
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
                className={`px-4 py-2 text-sm font-semibold rounded-xl text-white shadow-sm transition ${
                  confirmDialog.isDanger
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
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