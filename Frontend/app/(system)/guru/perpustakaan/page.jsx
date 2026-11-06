"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  Clock3,
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
  Layers,
} from "lucide-react";

const PAGE_SIZE = 8;

function unwrapData(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.results)) return response.results;
  return [];
}

async function readResponse(response) {
  if (response && typeof response.json === "function") {
    const result = await response.json();
    if (!response.ok || result?.success === false) {
      throw new Error(result?.message || `Permintaan gagal (${response.status})`);
    }
    return result;
  }
  if (response?.success === false) {
    throw new Error(response?.message || "Permintaan gagal.");
  }
  return response;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function toLocalDateInput(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getStatusLabel(status) {
  const normalized = String(status || "").toLowerCase();
  const labels = {
    dipinjam: "Sedang dipinjam",
    dikembalikan: "Dikembalikan",
    terlambat: "Terlambat",
    aktif: "Aktif",
    nonaktif: "Nonaktif",
  };
  return labels[normalized] || status || "-";
}

function StatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();
  let className = "inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase ";
  
  if (normalized === "aktif" || normalized === "dikembalikan") {
    className += "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
  } else if (normalized === "dipinjam") {
    className += "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
  } else if (normalized === "terlambat" || normalized === "nonaktif") {
    className += "bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20";
  } else {
    className += "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
  }
  return <span className={className}>{getStatusLabel(status)}</span>;
}

function getErrorMessage(error) {
  if (error instanceof Error && error.message) return error.message;
  return "Terjadi kesalahan. Silakan coba kembali.";
}

function getBookStock(book) {
  const available = Number(book?.jumlahTersedia ?? 0);
  return Number.isFinite(available) ? available : 0;
}

function getBookTypeLabel(tipe) {
  return String(tipe || "").toUpperCase() === "EBOOK" ? "E-Book" : "Buku Fisik";
}

function getBorrowingBookId(item) {
  return item?.bukuId || item?.buku?.id || "";
}

function getBorrowingBookTitle(item) {
  return item?.buku?.judul || item?.judulBuku || "Buku tanpa judul";
}

function getBorrowingNumber(item) {
  return item?.nomorPeminjaman || "-";
}

export default function PerpustakaanGuruPage() {
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

  const [selectedBook, setSelectedBook] = useState(null);
  const [tanggalJatuhTempo, setTanggalJatuhTempo] = useState("");
  const [catatan, setCatatan] = useState("");

  const [selectedReturn, setSelectedReturn] = useState(null);

  const fetchBuku = useCallback(async () => {
    const response = await apiFetch("/perpustakaan/buku");
    const result = await readResponse(response);
    return unwrapData(result);
  }, []);

  const fetchPeminjaman = useCallback(async () => {
    const response = await apiFetch("/perpustakaan/peminjaman");
    const result = await readResponse(response);
    return unwrapData(result);
  }, []);

  const loadData = useCallback(
    async (showRefresh = false) => {
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
    },
    [fetchBuku, fetchPeminjaman]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

      const matchesSearch = !keyword || judul.includes(keyword) || kode.includes(keyword) || penulis.includes(keyword);
      const matchesCategory = !filterKategori || String(item?.kategori || "") === filterKategori;
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
        const status = String(item?.status || "").toLowerCase();

        const matchesSearch = !keyword || judul.includes(keyword) || nomor.includes(keyword);
        const matchesStatus = filterStatusPinjam === "SEMUA" || status === filterStatusPinjam.toLowerCase();

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b?.tanggalPinjam || b?.dibuatPada || 0).getTime() - new Date(a?.tanggalPinjam || a?.dibuatPada || 0).getTime());
  }, [peminjaman, search, filterStatusPinjam]);

  const activeBorrowings = useMemo(() => peminjaman.filter((item) => String(item?.status || "").toLowerCase() === "dipinjam"), [peminjaman]);
  const returnedBorrowings = useMemo(() => peminjaman.filter((item) => String(item?.status || "").toLowerCase() === "dikembalikan"), [peminjaman]);
  const availableBooksCount = useMemo(() => buku.filter((item) => String(item?.tipe || "").toUpperCase() === "FISIK" && String(item?.status || "").toLowerCase() === "aktif" && getBookStock(item) > 0).length, [buku]);

  const totalPagesBuku = Math.max(1, Math.ceil(filteredBooks.length / PAGE_SIZE));
  const totalPagesPinjam = Math.max(1, Math.ceil(filteredBorrowings.length / PAGE_SIZE));

  const paginatedBooks = useMemo(() => filteredBooks.slice((pageBuku - 1) * PAGE_SIZE, pageBuku * PAGE_SIZE), [filteredBooks, pageBuku]);
  const paginatedBorrowings = useMemo(() => filteredBorrowings.slice((pagePinjam - 1) * PAGE_SIZE, pagePinjam * PAGE_SIZE), [filteredBorrowings, pagePinjam]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setPageBuku(1); }, [search, filterKategori, filterTipe]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setPagePinjam(1); }, [search, filterStatusPinjam]);

  const openBorrowModal = (book) => {
    setSelectedBook(book); setTanggalJatuhTempo(""); setCatatan(""); setError(""); setNotice("");
  };

  const closeBorrowModal = () => {
    if (submitting) return;
    setSelectedBook(null); setTanggalJatuhTempo(""); setCatatan("");
  };

  const handleBorrow = async (event) => {
    event.preventDefault();
    if (!selectedBook?.id) return setError("Buku yang akan dipinjam tidak valid.");
    if (!tanggalJatuhTempo) return setError("Tanggal jatuh tempo wajib diisi.");
    if (tanggalJatuhTempo < toLocalDateInput()) return setError("Tanggal jatuh tempo tidak boleh sebelum hari ini.");
    if (String(selectedBook?.tipe || "").toUpperCase() !== "FISIK") return setError("Hanya buku fisik yang dapat dipinjam.");
    if (String(selectedBook?.status || "").toLowerCase() !== "aktif") return setError("Buku sedang tidak aktif.");
    if (getBookStock(selectedBook) <= 0) return setError("Stok buku sedang habis.");

    setSubmitting(true); setError(""); setNotice("");

    try {
      const response = await apiFetch("/perpustakaan/peminjaman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bukuId: selectedBook.id, tanggalJatuhTempo, ...(catatan.trim() ? { catatan: catatan.trim() } : {}) }),
      });
      const result = await readResponse(response);

      setSelectedBook(null); setTanggalJatuhTempo(""); setCatatan("");
      setNotice(result?.message || "Buku berhasil dipinjam.");
      await loadData(true); setActiveTab("peminjaman"); setFilterStatusPinjam("dipinjam"); setSearch("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturn = async () => {
    if (!selectedReturn?.id) return setError("Data peminjaman tidak valid.");
    if (!window.confirm(`Kembalikan buku "${getBorrowingBookTitle(selectedReturn)}"?`)) return;

    setSubmitting(true); setError(""); setNotice("");

    try {
      const response = await apiFetch(`/perpustakaan/peminjaman/${encodeURIComponent(selectedReturn.id)}/kembali`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const result = await readResponse(response);
      setSelectedReturn(null); setNotice(result?.message || "Buku berhasil dikembalikan."); await loadData(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar active="perpustakaan" />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <Header user={{ name: "Guru", email: "", avatar: "GU" }} />
        </div>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8">
            
            {/* HEADER */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <Library size={14} /> Perpustakaan
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                  Katalog & Peminjaman
                </h1>
              </div>
              <button
                onClick={() => loadData(true)}
                disabled={loading || refreshing}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 shadow-sm"
              >
                <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> Segarkan
              </button>
            </div>

            {/* ALERTS */}
            {error && (
              <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
                <AlertCircle size={18} className="shrink-0" />
                <span className="flex-1">{error}</span>
                <button onClick={() => setError("")}><X size={16} /></button>
              </div>
            )}
            {notice && (
              <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-400">
                <CheckCircle2 size={18} className="shrink-0" />
                <span className="flex-1">{notice}</span>
                <button onClick={() => setNotice("")}><X size={16} /></button>
              </div>
            )}

            {/* STAT CARDS */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Total Koleksi", value: buku.length, icon: BookOpen, color: "blue" },
                { label: "Buku Tersedia", value: availableBooksCount, icon: Package, color: "emerald" },
                { label: "Sedang Dipinjam", value: activeBorrowings.length, icon: BookMarked, color: "amber" },
                { label: "Dikembalikan", value: returnedBorrowings.length, icon: RotateCcw, color: "violet" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{stat.label}</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{loading ? "—" : stat.value}</p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-${stat.color}-50 text-${stat.color}-600 dark:bg-${stat.color}-500/10 dark:text-${stat.color}-400`}>
                    <stat.icon size={24} />
                  </div>
                </div>
              ))}
            </section>

            {/* TAB & CONTENT WRAPPER */}
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              
              {/* TOOLBAR */}
              <div className="flex flex-col gap-4 border-b border-slate-200 p-4 dark:border-slate-800 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => { setActiveTab("buku"); setError(""); }}
                    className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition ${activeTab === "buku" ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"}`}
                  >
                    <BookOpen size={16} /> Katalog
                  </button>
                  <button
                    onClick={() => { setActiveTab("peminjaman"); setError(""); }}
                    className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition ${activeTab === "peminjaman" ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"}`}
                  >
                    <CalendarDays size={16} /> Peminjaman
                    <span className={`ml-1 rounded-full px-2 py-0.5 text-[10px] ${activeTab === "peminjaman" ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800"}`}>{peminjaman.length}</span>
                  </button>
                </div>

                <div className="relative w-full lg:max-w-md">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={activeTab === "buku" ? "Cari judul, kode, atau penulis..." : "Cari nomor peminjaman..."}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-blue-500 dark:focus:ring-blue-900/50"
                  />
                </div>
              </div>

              {/* TABEL BUKU */}
              {activeTab === "buku" ? (
                <div>
                  <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="flex items-center gap-2">
                      <Filter size={14} className="text-slate-400" />
                      <span className="text-xs font-semibold text-slate-500">Filter:</span>
                    </div>
                    <select value={filterTipe} onChange={(e) => setFilterTipe(e.target.value)} className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-xs font-medium sm:w-auto dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                      <option value="SEMUA">Semua Jenis</option>
                      <option value="FISIK">Fisik</option>
                      <option value="EBOOK">E-Book</option>
                    </select>
                    <select value={filterKategori} onChange={(e) => setFilterKategori(e.target.value)} className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-xs font-medium sm:w-auto dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                      <option value="">Semua Kategori</option>
                      {kategoriOptions.map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                    <button onClick={() => { setSearch(""); setFilterKategori(""); setFilterTipe("SEMUA"); }} className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400">Reset</button>
                  </div>

                  {loading ? (
                    <div className="flex min-h-[300px] items-center justify-center text-sm text-slate-500"><Loader2 className="animate-spin mr-2" size={18} /> Memuat data...</div>
                  ) : paginatedBooks.length === 0 ? (
                    <div className="flex min-h-[300px] flex-col items-center justify-center text-slate-400">
                      <BookOpen size={40} className="mb-3 opacity-50" />
                      <p className="font-semibold text-slate-600 dark:text-slate-300">Tidak ada buku</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                        {paginatedBooks.map((item) => {
                          const isPhysical = String(item?.tipe || "").toUpperCase() === "FISIK";
                          const isActive = String(item?.status || "").toLowerCase() === "aktif";
                          const stock = getBookStock(item);
                          const canBorrow = isPhysical && isActive && stock > 0;

                          return (
                            <article key={item.id} className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:border-blue-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-500/50">
                              <div className="flex min-h-[160px] items-center justify-center bg-slate-50 p-4 dark:bg-slate-900/50">
                                {item?.coverUrl ? (
                                  <img src={item.coverUrl} alt={item.judul} className="h-32 object-contain drop-shadow-sm transition-transform group-hover:scale-105" loading="lazy" />
                                ) : (
                                  <div className="flex h-24 w-20 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900"><BookOpen size={30} /></div>
                                )}
                              </div>
                              
                              <div className="flex flex-1 flex-col p-5">
                                <div className="mb-2 flex items-center gap-2">
                                  <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">{getBookTypeLabel(item?.tipe)}</span>
                                  {item?.kategori && <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">{item.kategori}</span>}
                                </div>
                                
                                <h3 className="line-clamp-2 text-base font-bold text-slate-900 dark:text-slate-100">{item?.judul}</h3>
                                
                                <div className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                                  <p className="flex items-center gap-2"><UserRound size={14} /> {item?.penulis || "-"}</p>
                                  <p className="flex items-center gap-2"><FileText size={14} /> Kode: {item?.kodeBuku || "-"}</p>
                                </div>

                                <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                                  <div>
                                    <p className="text-[10px] font-bold uppercase text-slate-400">Stok</p>
                                    <p className={`text-sm font-bold ${stock <= 0 ? "text-red-500" : "text-slate-800 dark:text-slate-200"}`}>{isPhysical ? `${stock} Buku` : "Digital"}</p>
                                  </div>
                                  <StatusBadge status={item?.status} />
                                </div>

                                <button
                                  onClick={() => openBorrowModal(item)}
                                  disabled={!canBorrow || submitting}
                                  className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-xs font-bold text-white transition hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 dark:disabled:bg-slate-800 dark:disabled:text-slate-600"
                                >
                                  <BookMarked size={15} /> {canBorrow ? "Pinjam Buku" : !isPhysical ? "E-Book" : !isActive ? "Tidak Aktif" : "Stok Habis"}
                                </button>
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
                /* TABEL PEMINJAMAN */
                <div>
                  {loading ? (
                    <div className="flex min-h-[300px] items-center justify-center text-sm text-slate-500"><Loader2 className="animate-spin mr-2" size={18} /> Memuat data...</div>
                  ) : paginatedBorrowings.length === 0 ? (
                    <div className="flex min-h-[300px] flex-col items-center justify-center text-slate-400">
                      <CalendarDays size={40} className="mb-3 opacity-50" />
                      <p className="font-semibold text-slate-600 dark:text-slate-300">Belum ada peminjaman</p>
                    </div>
                  ) : (
                    <>
                      <div className="hidden overflow-x-auto md:block">
                        <table className="w-full min-w-[760px] text-left text-sm">
                          <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 dark:bg-slate-800/50 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                              <th className="px-6 py-4 font-semibold">Informasi Buku</th>
                              <th className="px-6 py-4 font-semibold">No. Peminjaman</th>
                              <th className="px-6 py-4 font-semibold">Tgl Pinjam</th>
                              <th className="px-6 py-4 font-semibold">Jatuh Tempo</th>
                              <th className="px-6 py-4 font-semibold">Status</th>
                              <th className="px-6 py-4 text-right font-semibold">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {paginatedBorrowings.map((item) => {
                              const isBorrowed = String(item?.status).toLowerCase() === "dipinjam";
                              return (
                                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="flex h-9 w-9 items-center justify-center rounded bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"><BookOpen size={16} /></div>
                                      <div>
                                        <p className="font-semibold text-slate-900 dark:text-slate-100">{getBorrowingBookTitle(item)}</p>
                                        <p className="text-[11px] text-slate-500">{item?.buku?.kodeBuku || "-"}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400">{getBorrowingNumber(item)}</td>
                                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{formatDate(item?.tanggalPinjam || item?.dibuatPada)}</td>
                                  <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">{formatDate(item?.tanggalJatuhTempo)}</td>
                                  <td className="px-6 py-4"><StatusBadge status={item?.status} /></td>
                                  <td className="px-6 py-4 text-right">
                                    {isBorrowed ? (
                                      <button onClick={() => setSelectedReturn(item)} className="inline-flex h-8 items-center gap-1.5 rounded border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 transition">
                                        <RotateCcw size={13} /> Kembalikan
                                      </button>
                                    ) : <span className="text-xs text-slate-400">Selesai</span>}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      <div className="space-y-3 p-4 md:hidden">
                        {paginatedBorrowings.map((item) => {
                          const isBorrowed = String(item?.status).toLowerCase() === "dipinjam";
                          return (
                            <div key={item.id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{getBorrowingBookTitle(item)}</h3>
                                  <p className="text-[11px] text-slate-500">{getBorrowingNumber(item)}</p>
                                </div>
                                <StatusBadge status={item?.status} />
                              </div>
                              {isBorrowed && (
                                <button onClick={() => setSelectedReturn(item)} className="mt-3 inline-flex w-full h-9 items-center justify-center gap-1.5 rounded border border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-400">
                                  <RotateCcw size={14} /> Kembalikan
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

      {/* MODAL PINJAM */}
      {selectedBook && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) closeBorrowModal(); }}>
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Form Peminjaman</h2>
              <button onClick={closeBorrowModal} disabled={submitting} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} /></button>
            </div>
            <form onSubmit={handleBorrow}>
              <div className="p-5 space-y-4">
                <div className="rounded-lg bg-slate-50 p-4 border border-slate-100 dark:border-slate-800 dark:bg-slate-950/50">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Buku yang dipilih</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{selectedBook?.judul}</p>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Jatuh Tempo <span className="text-red-500">*</span></label>
                  <input type="date" value={tanggalJatuhTempo} min={toLocalDateInput()} onChange={(e) => setTanggalJatuhTempo(e.target.value)} required className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:[color-scheme:dark]" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Catatan <span className="text-slate-400 font-normal">(Opsional)</span></label>
                  <textarea value={catatan} onChange={(e) => setCatatan(e.target.value)} rows={2} className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" />
                </div>
              </div>
              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 p-4 sm:flex-row sm:justify-end dark:border-slate-800 dark:bg-slate-950/50">
                <button type="button" onClick={closeBorrowModal} disabled={submitting} className="h-9 w-full rounded-lg px-4 text-xs font-semibold text-slate-600 hover:bg-slate-200 sm:w-auto dark:text-slate-400 dark:hover:bg-slate-800">Batal</button>
                <button type="submit" disabled={submitting || !tanggalJatuhTempo} className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 sm:w-auto dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
                  {submitting && <Loader2 className="animate-spin" size={14} />} Konfirmasi Pinjam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KEMBALIKAN */}
      {selectedReturn && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl dark:bg-slate-900 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"><RotateCcw size={24} /></div>
            <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">Pengembalian Buku</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Apakah Anda yakin ingin mengembalikan buku <br/><strong className="text-slate-800 dark:text-slate-200">&quot;{getBorrowingBookTitle(selectedReturn)}&quot;</strong>?
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <button onClick={handleReturn} disabled={submitting} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
                {submitting ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />} Ya, Kembalikan
              </button>
              <button onClick={() => setSelectedReturn(null)} disabled={submitting} className="h-10 w-full rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Pagination({ page, totalPages, totalItems, pageSize, onPageChange }) {
  if (totalItems === 0) return null;
  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-slate-800">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Menampilkan <span className="font-bold text-slate-700 dark:text-slate-300">{(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalItems)}</span> dari <span className="font-bold text-slate-700 dark:text-slate-300">{totalItems}</span> data
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange((c) => Math.max(1, c - 1))} disabled={page <= 1} className="inline-flex h-8 w-8 items-center justify-center rounded text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"><ChevronLeft size={16} /></button>
        <span className="min-w-[3rem] text-center text-xs font-semibold text-slate-700 dark:text-slate-300">{page} / {totalPages}</span>
        <button onClick={() => onPageChange((c) => Math.min(totalPages, c + 1))} disabled={page >= totalPages} className="inline-flex h-8 w-8 items-center justify-center rounded text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"><ChevronRight size={16} /></button>
      </div>
    </div>
  );
}