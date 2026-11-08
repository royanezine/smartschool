"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { apiFetch } from "@/lib/api";
import {
  BookOpen,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  CalendarDays,
  RotateCcw,
  X,
  ChevronLeft,
  ChevronRight,
  BookMarked,
  Library,
  Filter,
  UserRound,
  FileText,
  Package,
  ExternalLink,
  Clock3,
  Info,
} from "lucide-react";

const PAGE_SIZE = 8;

const themeCardShadow = "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";
const themePrimarySoft = "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";
const themePrimaryBorder = "border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]";
const themeNeutralSurface = "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";
const themeNeutralBorder = "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";
const themeDivider = "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

function unwrapData(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.rows)) return response.rows;
  return [];
}

function readResponse(response) {
  if (response?.success === false) {
    throw new Error(response?.message || "Permintaan gagal.");
  }
  return response;
}

function toLocalDateInput(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateOnly(value) {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return toLocalDateInput(date);
}

function formatDate(value) {
  const dateOnly = getDateOnly(value);
  if (!dateOnly) return "-";
  const [year, month, day] = dateOnly.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getErrorMessage(error) {
  if (error instanceof Error && error.message) return error.message;
  return "Terjadi kesalahan. Silakan coba kembali.";
}

function getBookStock(book) {
  const stock = Number(book?.jumlahTersedia ?? book?.jumlah ?? 0);
  return Number.isFinite(stock) ? stock : 0;
}

function getBookTypeLabel(tipe) {
  return String(tipe || "").toUpperCase() === "EBOOK" ? "E-Book" : "Buku Fisik";
}

function getBorrowingBookTitle(item) {
  return item?.buku?.judul || item?.judulBuku || "Buku tanpa judul";
}

function getBorrowingNumber(item) {
  return item?.nomorPeminjaman || "-";
}

function getEffectiveBorrowingStatus(item) {
  const status = String(item?.status || "").toLowerCase();
  if (status === "dipinjam") {
    const dueDate = getDateOnly(item?.tanggalJatuhTempo);
    if (dueDate && dueDate < toLocalDateInput()) {
      return "terlambat";
    }
  }
  return status;
}

function getStatusLabel(status) {
  const labels = {
    dipinjam: "Sedang dipinjam",
    dikembalikan: "Dikembalikan",
    terlambat: "Terlambat",
    aktif: "Aktif",
    nonaktif: "Nonaktif",
  };
  return labels[String(status || "").toLowerCase()] || status || "-";
}

function StatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();
  let className = "inline-flex items-center rounded-md border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ";

  if (normalized === "aktif" || normalized === "dikembalikan") {
    className += "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)] text-[var(--color-success)]";
  } else if (normalized === "dipinjam") {
    className += "border-[color-mix(in_srgb,var(--color-info)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)] text-[var(--color-info)]";
  } else if (normalized === "terlambat" || normalized === "nonaktif") {
    className += "border-[color-mix(in_srgb,var(--color-danger)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_9%,transparent)] text-[var(--color-danger)]";
  } else {
    className += "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)] bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] theme-text-secondary";
  }

  return <span className={className}>{getStatusLabel(status)}</span>;
}

function safeExternalUrl(value) {
  if (!value || typeof value !== "string") return "";
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return url.href;
  } catch {
    return "";
  }
}

function Pagination({ page, totalPages, totalItems, pageSize, onPageChange }) {
  if (totalItems === 0) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className={`flex flex-col gap-3 border-t ${themeDivider} px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6`}>
      <p className="text-xs theme-text-muted">
        Menampilkan <span className="font-bold theme-text-secondary">{start}-{end}</span> dari <span className="font-bold theme-text-secondary">{totalItems}</span> data
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange((current) => Math.max(1, current - 1))}
          disabled={page <= 1}
          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${themeNeutralBorder} theme-text-muted transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:opacity-30`}
        >
          <ChevronLeft size={16} />
        </button>
        <span className={`min-w-[3rem] text-center text-xs font-semibold theme-text`}>
          {page} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange((current) => Math.min(totalPages, current + 1))}
          disabled={page >= totalPages}
          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${themeNeutralBorder} theme-text-muted transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:opacity-30`}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default function PerpustakaanGuruPage() {
  const router = useRouter();
  
  const [buku, setBuku] = useState([]);
  const [peminjaman, setPeminjaman] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [activeTab, setActiveTab] = useState("buku");
  const [search, setSearch] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const [filterTipe, setFilterTipe] = useState("SEMUA");
  const [filterStatusPinjam, setFilterStatusPinjam] = useState("SEMUA");
  const [pageBuku, setPageBuku] = useState(1);
  const [pagePinjam, setPagePinjam] = useState(1);

  const [selectedReturn, setSelectedReturn] = useState(null);

  const fetchBuku = useCallback(async () => {
    const response = await apiFetch("/perpustakaan/buku");
    return unwrapData(readResponse(response));
  }, []);

  const fetchPeminjaman = useCallback(async () => {
    const response = await apiFetch("/perpustakaan/peminjaman");
    return unwrapData(readResponse(response));
  }, []);

  const loadData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const [daftarBuku, daftarPeminjaman] = await Promise.all([fetchBuku(), fetchPeminjaman()]);
      setBuku(daftarBuku);
      setPeminjaman(daftarPeminjaman);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchBuku, fetchPeminjaman]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const kategoriOptions = useMemo(() => {
    const categories = buku.map((item) => item?.kategori).filter(Boolean).map((item) => String(item));
    return [...new Set(categories)].sort((a, b) => a.localeCompare(b));
  }, [buku]);

  const filteredBooks = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return buku.filter((item) => {
      const judul = String(item?.judul || "").toLowerCase();
      const kode = String(item?.kodeBuku || "").toLowerCase();
      const penulis = String(item?.penulis || "").toLowerCase();
      const kategori = String(item?.kategori || "");
      const matchesSearch = !keyword || judul.includes(keyword) || kode.includes(keyword) || penulis.includes(keyword);
      const matchesCategory = !filterKategori || kategori === filterKategori;
      const matchesType = filterTipe === "SEMUA" || String(item?.tipe || "").toUpperCase() === filterTipe;
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [buku, search, filterKategori, filterTipe]);

  const filteredBorrowings = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return peminjaman
      .filter((item) => {
        const judul = getBorrowingBookTitle(item).toLowerCase();
        const nomor = getBorrowingNumber(item).toLowerCase();
        const kode = String(item?.buku?.kodeBuku || "").toLowerCase();
        const status = getEffectiveBorrowingStatus(item);
        const matchesSearch = !keyword || judul.includes(keyword) || nomor.includes(keyword) || kode.includes(keyword);
        const matchesStatus = filterStatusPinjam === "SEMUA" || status === filterStatusPinjam.toLowerCase();
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b?.tanggalPinjam || b?.dibuatPada || 0).getTime() - new Date(a?.tanggalPinjam || a?.dibuatPada || 0).getTime());
  }, [peminjaman, search, filterStatusPinjam]);

  const activeBorrowings = useMemo(() => peminjaman.filter((item) => String(item?.status || "").toLowerCase() === "dipinjam"), [peminjaman]);
  const returnedBorrowings = useMemo(() => peminjaman.filter((item) => String(item?.status || "").toLowerCase() === "dikembalikan"), [peminjaman]);
  const overdueBorrowings = useMemo(() => peminjaman.filter((item) => getEffectiveBorrowingStatus(item) === "terlambat"), [peminjaman]);

  const availableBooksCount = useMemo(() => buku.filter((item) => String(item?.tipe || "").toUpperCase() === "FISIK" && String(item?.status || "").toLowerCase() === "aktif" && getBookStock(item) > 0).length, [buku]);

  const totalPagesBuku = Math.max(1, Math.ceil(filteredBooks.length / PAGE_SIZE));
  const totalPagesPinjam = Math.max(1, Math.ceil(filteredBorrowings.length / PAGE_SIZE));

  const paginatedBooks = useMemo(() => filteredBooks.slice((pageBuku - 1) * PAGE_SIZE, pageBuku * PAGE_SIZE), [filteredBooks, pageBuku]);
  const paginatedBorrowings = useMemo(() => filteredBorrowings.slice((pagePinjam - 1) * PAGE_SIZE, pagePinjam * PAGE_SIZE), [filteredBorrowings, pagePinjam]);

  useEffect(() => { setPageBuku(1); }, [search, filterKategori, filterTipe]);
  useEffect(() => { setPagePinjam(1); }, [search, filterStatusPinjam]);

  const handleReturn = async () => {
    if (!selectedReturn?.id) { setError("Data peminjaman tidak valid."); return; }

    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      const response = await apiFetch(`/perpustakaan/peminjaman/${encodeURIComponent(selectedReturn.id)}/kembali`, {
        method: "PUT",
        body: JSON.stringify({}),
      });

      const result = readResponse(response);
      setSelectedReturn(null);
      setNotice(result?.message || "Buku berhasil dikembalikan.");
      await loadData(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const resetBookFilters = () => {
    setSearch("");
    setFilterKategori("");
    setFilterTipe("SEMUA");
  };

  const resetBorrowingFilters = () => {
    setSearch("");
    setFilterStatusPinjam("SEMUA");
  };

  const stats = [
    { label: "Total Koleksi", value: buku.length, icon: BookOpen, iconClass: `${themePrimarySoft} text-[var(--color-primary)]` },
    { label: "Buku Tersedia", value: availableBooksCount, icon: Package, iconClass: "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)]" },
    { label: "Sedang Dipinjam", value: activeBorrowings.length, icon: BookMarked, iconClass: "bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] text-[var(--color-warning)]" },
    { label: "Dikembalikan", value: returnedBorrowings.length, icon: RotateCcw, iconClass: "bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)] text-[var(--color-info)]" },
  ];

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar active="perpustakaan" />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b theme-border">
          <Header user={{ name: "Guru", email: "", avatar: "GU" }} />
        </div>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8">
            
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider theme-text-muted">
                  <Library size={14} />
                  Perpustakaan
                </div>
                <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-3xl">
                  Katalog & Peminjaman
                </h1>
                <p className="theme-text-secondary mt-1 text-sm">
                  Cari koleksi buku dan pantau peminjaman buku Anda.
                </p>
              </div>

              <button
                type="button"
                onClick={() => loadData(true)}
                disabled={loading || refreshing}
                className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border ${themeNeutralBorder} theme-card px-4 text-sm font-semibold theme-text-secondary shadow-sm transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:opacity-60`}
              >
                <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                Segarkan
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_9%,transparent)] p-3 text-sm text-[var(--color-danger)]">
                <AlertCircle size={18} className="shrink-0" />
                <span className="flex-1">{error}</span>
                <button type="button" onClick={() => setError("")}><X size={16} /></button>
              </div>
            )}

            {notice && (
              <div className="flex items-center gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-success)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)] p-3 text-sm text-[var(--color-success)]">
                <CheckCircle2 size={18} className="shrink-0" />
                <span className="flex-1">{notice}</span>
                <button type="button" onClick={() => setNotice("")}><X size={16} /></button>
              </div>
            )}

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6">
              {stats.map((stat) => (
                <div key={stat.label} className={`theme-card ${themeNeutralBorder} ${themeCardShadow} flex items-center justify-between rounded-xl border p-5`}>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider theme-text-muted">{stat.label}</p>
                    <p className="theme-text mt-2 text-3xl font-bold">{loading ? "—" : stat.value}</p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.iconClass}`}>
                    <stat.icon size={24} />
                  </div>
                </div>
              ))}
            </section>

            {overdueBorrowings.length > 0 && (
              <div className="flex items-start gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)] p-4 text-sm text-[var(--color-warning)]">
                <Clock3 size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Ada {overdueBorrowings.length} peminjaman yang terlambat.</p>
                  <p className="mt-1 text-xs">Silakan segera lakukan pengembalian buku.</p>
                </div>
              </div>
            )}

            <section className={`theme-card ${themeNeutralBorder} ${themeCardShadow} overflow-hidden rounded-2xl border`}>
              <div className={`flex flex-col gap-4 border-b ${themeDivider} p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between`}>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setActiveTab("buku"); setSearch(""); setError(""); }}
                    className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition ${
                      activeTab === "buku" ? "theme-primary text-[var(--color-card)] shadow-sm" : "theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]"
                    }`}
                  >
                    <BookOpen size={16} /> Katalog
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveTab("peminjaman"); setSearch(""); setError(""); }}
                    className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition ${
                      activeTab === "peminjaman" ? "theme-primary text-[var(--color-card)] shadow-sm" : "theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]"
                    }`}
                  >
                    <CalendarDays size={16} /> Peminjaman
                    <span className={`ml-1 rounded-full px-2 py-0.5 text-[10px] ${activeTab === "peminjaman" ? "bg-white/20" : "bg-[color-mix(in_srgb,var(--color-text)_10%,transparent)]"}`}>
                      {peminjaman.length}
                    </span>
                  </button>
                </div>

                <div className="relative w-full lg:max-w-md">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-placeholder" />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={activeTab === "buku" ? "Cari judul, kode, atau penulis..." : "Cari judul atau nomor peminjaman..."}
                    className={`h-10 w-full rounded-xl border ${themeNeutralBorder} theme-input pl-9 pr-3 text-sm outline-none transition focus:border-[var(--color-primary)]`}
                  />
                </div>
              </div>

              {activeTab === "buku" ? (
                <div>
                  <div className={`flex flex-wrap items-center gap-3 border-b ${themeDivider} bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] p-4`}>
                    <div className="flex items-center gap-2">
                      <Filter size={14} className="theme-text-placeholder" />
                      <span className="text-xs font-semibold theme-text-muted">Filter:</span>
                    </div>

                    <select
                      value={filterTipe}
                      onChange={(event) => setFilterTipe(event.target.value)}
                      className={`h-9 w-full rounded-lg border ${themeNeutralBorder} theme-input px-2 text-xs font-medium sm:w-auto`}
                    >
                      <option value="SEMUA">Semua Jenis</option>
                      <option value="FISIK">Buku Fisik</option>
                      <option value="EBOOK">E-Book</option>
                    </select>

                    <select
                      value={filterKategori}
                      onChange={(event) => setFilterKategori(event.target.value)}
                      className={`h-9 w-full rounded-lg border ${themeNeutralBorder} theme-input px-2 text-xs font-medium sm:w-auto`}
                    >
                      <option value="">Semua Kategori</option>
                      {kategoriOptions.map((kategori) => <option key={kategori} value={kategori}>{kategori}</option>)}
                    </select>

                    <button type="button" onClick={resetBookFilters} className="text-xs font-semibold text-[var(--color-primary)] hover:underline">Reset Filter</button>
                  </div>

                  {loading ? (
                    <div className="flex min-h-[300px] items-center justify-center text-sm theme-text-muted">
                      <Loader2 className="mr-2 animate-spin" size={18} /> Memuat katalog buku...
                    </div>
                  ) : paginatedBooks.length === 0 ? (
                    <div className="flex min-h-[300px] flex-col items-center justify-center px-4 text-center">
                      <BookOpen size={40} className="mb-3 opacity-50 theme-text-muted" />
                      <p className="font-semibold theme-text">Tidak ada buku ditemukan</p>
                      <p className="mt-1 text-xs theme-text-muted">Coba ubah kata pencarian atau filter katalog.</p>
                      <button type="button" onClick={resetBookFilters} className="mt-3 text-xs font-semibold text-[var(--color-primary)] hover:underline">Hapus semua filter</button>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                        {paginatedBooks.map((item) => {
                          const isPhysical = String(item?.tipe || "").toUpperCase() === "FISIK";
                          const isActive = String(item?.status || "").toLowerCase() === "aktif";
                          const stock = getBookStock(item);
                          const ebookUrl = safeExternalUrl(item?.urlEbook);
                          const canBorrow = isPhysical && isActive && stock > 0;

                          return (
                            <article key={item.id} className={`group relative flex flex-col overflow-hidden rounded-xl border ${themeNeutralBorder} theme-card transition-all hover:border-[var(--color-primary)] hover:shadow-md`}>
                              <div className={`flex min-h-[160px] items-center justify-center ${themePrimarySoft} p-4`}>
                                {safeExternalUrl(item?.coverUrl) ? (
                                  <img src={safeExternalUrl(item.coverUrl)} alt={item?.judul || "Sampul buku"} className="h-32 max-w-full object-contain drop-shadow-sm transition-transform group-hover:scale-105" loading="lazy" />
                                ) : (
                                  <div className={`flex h-24 w-20 items-center justify-center rounded-lg border ${themeNeutralBorder} theme-card theme-text-muted`}>
                                    <BookOpen size={30} />
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-1 flex-col p-5">
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                  <span className={`rounded ${themePrimarySoft} px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--color-primary)]`}>
                                    {getBookTypeLabel(item?.tipe)}
                                  </span>
                                  {item?.kategori && <span className="text-[10px] font-medium uppercase tracking-wide theme-text-muted">{item.kategori}</span>}
                                </div>

                                <h3 className="line-clamp-2 text-base font-bold theme-text">{item?.judul || "Tanpa judul"}</h3>

                                <div className="mt-3 space-y-1.5 text-xs theme-text-muted">
                                  <p className="flex items-center gap-2"><UserRound size={14} /> {item?.penulis || "-"}</p>
                                  <p className="flex items-center gap-2"><FileText size={14} /> Kode: {item?.kodeBuku || "-"}</p>
                                  {item?.mataPelajaran?.nama && <p className="flex items-center gap-2"><BookMarked size={14} /> {item.mataPelajaran.nama}</p>}
                                </div>

                                <div className={`mt-auto flex items-center justify-between border-t ${themeDivider} pt-4`}>
                                  <div>
                                    <p className="text-[10px] font-bold uppercase theme-text-placeholder">{isPhysical ? "Stok tersedia" : "Jenis"}</p>
                                    <p className={`text-sm font-bold ${isPhysical && stock <= 0 ? "text-[var(--color-danger)]" : "theme-text"}`}>
                                      {isPhysical ? `${stock} Buku` : "Digital"}
                                    </p>
                                  </div>
                                  <StatusBadge status={item?.status} />
                                </div>

                                <div className="mt-4 flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => router.push(`/guru/perpustakaan/${item.id}`)}
                                    className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border ${themeNeutralBorder} theme-card text-xs font-bold theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]`}
                                  >
                                    <Info size={15} /> Detail
                                  </button>

                                  {isPhysical ? (
                                    <button
                                      type="button"
                                      onClick={() => router.push(`/guru/perpustakaan/pinjam/${item.id}`)}
                                      disabled={!canBorrow || submitting}
                                      className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg theme-primary px-4 text-xs font-bold text-[var(--color-card)] transition hover:brightness-110 disabled:bg-[color-mix(in_srgb,var(--color-text)_10%,transparent)] disabled:text-[var(--color-text-muted)]"
                                    >
                                      <BookMarked size={15} /> {canBorrow ? "Pinjam" : !isActive ? "Nonaktif" : "Habis"}
                                    </button>
                                  ) : ebookUrl ? (
                                    <a
                                      href={ebookUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--color-info)] px-4 text-xs font-bold text-white transition hover:brightness-110"
                                    >
                                      <ExternalLink size={15} /> Baca
                                    </a>
                                  ) : (
                                    <button type="button" disabled className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-lg ${themeNeutralSurface} px-4 text-xs font-bold theme-text-placeholder`}>
                                      Tidak Tersedia
                                    </button>
                                  )}
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                      <Pagination page={pageBuku} totalPages={totalPagesBuku} totalItems={filteredBooks.length} pageSize={PAGE_SIZE} onPageChange={setPageBuku} />
                    </>
                  )}
                </div>
              ) : (
                <div>
                  <div className={`flex flex-wrap items-center gap-3 border-b ${themeDivider} bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] p-4`}>
                    <div className="flex items-center gap-2">
                      <Filter size={14} className="theme-text-placeholder" />
                      <span className="text-xs font-semibold theme-text-muted">Status:</span>
                    </div>

                    <select
                      value={filterStatusPinjam}
                      onChange={(event) => setFilterStatusPinjam(event.target.value)}
                      className={`h-9 w-full rounded-lg border ${themeNeutralBorder} theme-input px-2 text-xs font-medium sm:w-auto`}
                    >
                      <option value="SEMUA">Semua Status</option>
                      <option value="dipinjam">Sedang Dipinjam</option>
                      <option value="terlambat">Terlambat</option>
                      <option value="dikembalikan">Dikembalikan</option>
                    </select>

                    <button type="button" onClick={resetBorrowingFilters} className="text-xs font-semibold text-[var(--color-primary)] hover:underline">Reset Filter</button>
                  </div>

                  {loading ? (
                    <div className="flex min-h-[300px] items-center justify-center text-sm theme-text-muted">
                      <Loader2 className="mr-2 animate-spin" size={18} /> Memuat data peminjaman...
                    </div>
                  ) : paginatedBorrowings.length === 0 ? (
                    <div className="flex min-h-[300px] flex-col items-center justify-center px-4 text-center">
                      <CalendarDays size={40} className="mb-3 opacity-50 theme-text-muted" />
                      <p className="font-semibold theme-text">Belum ada data peminjaman</p>
                      <p className="mt-1 text-xs theme-text-muted">Data peminjaman akan muncul setelah Anda meminjam buku.</p>
                    </div>
                  ) : (
                    <>
                      <div className="hidden overflow-x-auto md:block">
                        <table className="w-full min-w-[850px] text-left text-sm">
                          <thead className={`border-b ${themeDivider} theme-table-header text-[11px] uppercase tracking-wider`}>
                            <tr>
                              <th className="px-6 py-4 font-semibold">Informasi Buku</th>
                              <th className="px-6 py-4 font-semibold">No. Peminjaman</th>
                              <th className="px-6 py-4 font-semibold">Tgl Pinjam</th>
                              <th className="px-6 py-4 font-semibold">Jatuh Tempo</th>
                              <th className="px-6 py-4 font-semibold">Status</th>
                              <th className="px-6 py-4 text-right font-semibold">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className={`divide-y divide-[var(--color-border-soft)]`}>
                            {paginatedBorrowings.map((item) => {
                              const originalStatus = String(item?.status || "").toLowerCase();
                              const effectiveStatus = getEffectiveBorrowingStatus(item);
                              const isBorrowed = originalStatus === "dipinjam";
                              return (
                                <tr key={item.id} className="transition-colors hover:bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)]">
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${themeNeutralSurface} theme-text-muted`}>
                                        <BookOpen size={16} />
                                      </div>
                                      <div>
                                        <p className="font-semibold theme-text">{getBorrowingBookTitle(item)}</p>
                                        <p className="text-[11px] theme-text-muted">{item?.buku?.kodeBuku || "-"}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 font-medium theme-text-secondary">{getBorrowingNumber(item)}</td>
                                  <td className="px-6 py-4 theme-text-muted">{formatDate(item?.tanggalPinjam || item?.dibuatPada)}</td>
                                  <td className="px-6 py-4 font-medium theme-text-secondary">{formatDate(item?.tanggalJatuhTempo)}</td>
                                  <td className="px-6 py-4"><StatusBadge status={effectiveStatus} /></td>
                                  <td className="px-6 py-4 text-right">
                                    {isBorrowed ? (
                                      <button
                                        type="button"
                                        onClick={() => { setSelectedReturn(item); setError(""); }}
                                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[color-mix(in_srgb,var(--color-success)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)] px-3 text-xs font-semibold text-[var(--color-success)] transition hover:bg-[color-mix(in_srgb,var(--color-success)_15%,transparent)]"
                                      >
                                        <RotateCcw size={13} /> Kembalikan
                                      </button>
                                    ) : (
                                      <span className="text-xs theme-text-placeholder">Selesai</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="space-y-3 p-4 md:hidden">
                        {paginatedBorrowings.map((item) => {
                          const originalStatus = String(item?.status || "").toLowerCase();
                          const effectiveStatus = getEffectiveBorrowingStatus(item);
                          const isBorrowed = originalStatus === "dipinjam";
                          return (
                            <div key={item.id} className={`rounded-xl border ${themeNeutralBorder} p-4`}>
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <h3 className="text-sm font-semibold theme-text">{getBorrowingBookTitle(item)}</h3>
                                  <p className="mt-1 text-[11px] theme-text-muted">{getBorrowingNumber(item)}</p>
                                </div>
                                <StatusBadge status={effectiveStatus} />
                              </div>
                              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                                <div>
                                  <p className="theme-text-placeholder">Tanggal Pinjam</p>
                                  <p className="mt-1 font-medium theme-text-secondary">{formatDate(item?.tanggalPinjam || item?.dibuatPada)}</p>
                                </div>
                                <div>
                                  <p className="theme-text-placeholder">Jatuh Tempo</p>
                                  <p className="mt-1 font-medium theme-text-secondary">{formatDate(item?.tanggalJatuhTempo)}</p>
                                </div>
                              </div>
                              {isBorrowed && (
                                <button
                                  type="button"
                                  onClick={() => { setSelectedReturn(item); setError(""); }}
                                  className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-[color-mix(in_srgb,var(--color-success)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)] text-xs font-semibold text-[var(--color-success)]"
                                >
                                  <RotateCcw size={14} /> Kembalikan Buku
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <Pagination page={pagePinjam} totalPages={totalPagesPinjam} totalItems={filteredBorrowings.length} pageSize={PAGE_SIZE} onPageChange={setPagePinjam} />
                    </>
                  )}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* MODAL PENGEMBALIAN */}
      {selectedReturn && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-2xl theme-card ${themeCardShadow} p-6 text-center shadow-2xl`}>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)]">
              <RotateCcw size={24} />
            </div>
            <h2 className="theme-text mt-4 text-lg font-bold">Pengembalian Buku</h2>
            <p className="mt-2 text-sm theme-text-muted">Apakah Anda yakin ingin mengembalikan buku:</p>
            <p className="mt-2 font-semibold theme-text">&quot;{getBorrowingBookTitle(selectedReturn)}&quot;?</p>
            <div className="mt-6 flex flex-col gap-2">
              <button type="button" onClick={handleReturn} disabled={submitting} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg theme-primary text-sm font-semibold text-[var(--color-card)] disabled:opacity-50">
                {submitting ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />} Ya, Kembalikan
              </button>
              <button type="button" onClick={() => setSelectedReturn(null)} disabled={submitting} className={`h-10 w-full rounded-lg text-sm font-semibold theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:opacity-50`}>Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}