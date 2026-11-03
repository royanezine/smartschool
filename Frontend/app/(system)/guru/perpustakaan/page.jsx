
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
  // Jika apiFetch mengembalikan Response asli dari fetch
  if (response && typeof response.json === "function") {
    const result = await response.json();

    if (!response.ok || result?.success === false) {
      throw new Error(
        result?.message || `Permintaan gagal (${response.status})`
      );
    }

    return result;
  }

  // Jika apiFetch sudah mengembalikan data JSON
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

  let className =
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ";

  if (normalized === "aktif" || normalized === "dikembalikan") {
    className += "bg-emerald-50 text-emerald-700";
  } else if (normalized === "dipinjam") {
    className += "bg-blue-50 text-blue-700";
  } else if (normalized === "terlambat" || normalized === "nonaktif") {
    className += "bg-red-50 text-red-700";
  } else {
    className += "bg-slate-100 text-slate-600";
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
  return String(tipe || "").toUpperCase() === "EBOOK"
    ? "E-Book"
    : "Buku fisik";
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
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const [daftarBuku, daftarPeminjaman] = await Promise.all([
          fetchBuku(),
          fetchPeminjaman(),
        ]);

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
    loadData();
  }, [loadData]);

  const kategoriOptions = useMemo(() => {
    const categories = buku
      .map((item) => item?.kategori)
      .filter(Boolean)
      .map((item) => String(item));

    return [...new Set(categories)].sort((a, b) => a.localeCompare(b));
  }, [buku]);

  const filteredBooks = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return buku.filter((item) => {
      const judul = String(item?.judul || "").toLowerCase();
      const kode = String(item?.kodeBuku || "").toLowerCase();
      const penulis = String(item?.penulis || "").toLowerCase();
      const penerbit = String(item?.penerbit || "").toLowerCase();

      const matchesSearch =
        !keyword ||
        judul.includes(keyword) ||
        kode.includes(keyword) ||
        penulis.includes(keyword) ||
        penerbit.includes(keyword);

      const matchesCategory =
        !filterKategori ||
        String(item?.kategori || "") === filterKategori;

      const matchesType =
        filterTipe === "SEMUA" ||
        String(item?.tipe || "").toUpperCase() === filterTipe;

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

        const matchesSearch =
          !keyword || judul.includes(keyword) || nomor.includes(keyword);

        const matchesStatus =
          filterStatusPinjam === "SEMUA" ||
          status === filterStatusPinjam.toLowerCase();

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const dateA = new Date(a?.tanggalPinjam || a?.dibuatPada || 0).getTime();
        const dateB = new Date(b?.tanggalPinjam || b?.dibuatPada || 0).getTime();
        return dateB - dateA;
      });
  }, [peminjaman, search, filterStatusPinjam]);

  const activeBorrowings = useMemo(
    () =>
      peminjaman.filter(
        (item) => String(item?.status || "").toLowerCase() === "dipinjam"
      ),
    [peminjaman]
  );

  const returnedBorrowings = useMemo(
    () =>
      peminjaman.filter(
        (item) => String(item?.status || "").toLowerCase() === "dikembalikan"
      ),
    [peminjaman]
  );

  const availableBooksCount = useMemo(
    () =>
      buku.filter(
        (item) =>
          String(item?.tipe || "").toUpperCase() === "FISIK" &&
          String(item?.status || "").toLowerCase() === "aktif" &&
          getBookStock(item) > 0
      ).length,
    [buku]
  );

  const totalPagesBuku = Math.max(
    1,
    Math.ceil(filteredBooks.length / PAGE_SIZE)
  );

  const totalPagesPinjam = Math.max(
    1,
    Math.ceil(filteredBorrowings.length / PAGE_SIZE)
  );

  const paginatedBooks = useMemo(() => {
    const start = (pageBuku - 1) * PAGE_SIZE;
    return filteredBooks.slice(start, start + PAGE_SIZE);
  }, [filteredBooks, pageBuku]);

  const paginatedBorrowings = useMemo(() => {
    const start = (pagePinjam - 1) * PAGE_SIZE;
    return filteredBorrowings.slice(start, start + PAGE_SIZE);
  }, [filteredBorrowings, pagePinjam]);

  useEffect(() => {
    setPageBuku(1);
  }, [search, filterKategori, filterTipe]);

  useEffect(() => {
    setPagePinjam(1);
  }, [search, filterStatusPinjam]);

  const openBorrowModal = (book) => {
    setSelectedBook(book);
    setTanggalJatuhTempo("");
    setCatatan("");
    setError("");
    setNotice("");
  };

  const closeBorrowModal = () => {
    if (submitting) return;
    setSelectedBook(null);
    setTanggalJatuhTempo("");
    setCatatan("");
  };

  const handleBorrow = async (event) => {
    event.preventDefault();

    if (!selectedBook?.id) {
      setError("Buku yang akan dipinjam tidak valid.");
      return;
    }

    if (!tanggalJatuhTempo) {
      setError("Tanggal jatuh tempo wajib diisi.");
      return;
    }

    if (tanggalJatuhTempo < toLocalDateInput()) {
      setError("Tanggal jatuh tempo tidak boleh sebelum hari ini.");
      return;
    }

    if (String(selectedBook?.tipe || "").toUpperCase() !== "FISIK") {
      setError("Hanya buku fisik yang dapat dipinjam.");
      return;
    }

    if (String(selectedBook?.status || "").toLowerCase() !== "aktif") {
      setError("Buku sedang tidak aktif.");
      return;
    }

    if (getBookStock(selectedBook) <= 0) {
      setError("Stok buku sedang habis.");
      return;
    }

    const alreadyBorrowed = peminjaman.some(
      (item) =>
        getBorrowingBookId(item) === selectedBook.id &&
        String(item?.status || "").toLowerCase() === "dipinjam"
    );

    if (alreadyBorrowed) {
      setError(
        "Terdapat peminjaman aktif untuk buku ini. Periksa riwayat peminjaman sebelum mengajukan kembali."
      );
      return;
    }

    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      const response = await apiFetch("/perpustakaan/peminjaman", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bukuId: selectedBook.id,
          tanggalJatuhTempo,
          ...(catatan.trim() ? { catatan: catatan.trim() } : {}),
        }),
      });

      const result = await readResponse(response);

      setSelectedBook(null);
      setTanggalJatuhTempo("");
      setCatatan("");
      setNotice(result?.message || "Buku berhasil dipinjam.");

      await loadData(true);
      setActiveTab("peminjaman");
      setFilterStatusPinjam("dipinjam");
      setSearch("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturn = async () => {
    if (!selectedReturn?.id) {
      setError("Data peminjaman tidak valid.");
      return;
    }

    const confirmed = window.confirm(
      `Kembalikan buku "${getBorrowingBookTitle(selectedReturn)}"?`
    );

    if (!confirmed) return;

    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      const response = await apiFetch(
        `/perpustakaan/peminjaman/${encodeURIComponent(selectedReturn.id)}/kembali`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      const result = await readResponse(response);

      setSelectedReturn(null);
      setNotice(result?.message || "Buku berhasil dikembalikan.");

      await loadData(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar active="perpustakaan" />

      <div className="min-w-0 lg:ml-64">
        <Header
          user={{
            name: "Guru",
            email: "",
            avatar: "GU",
          }}
        />

        <main className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                <Library size={17} />
                <span>Guru</span>
                <span>/</span>
                <span>Perpustakaan</span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Perpustakaan
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Cari buku yang tersedia, ajukan peminjaman, dan pantau
                pengembalian buku melalui satu halaman.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={loading || refreshing}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing ? (
                <Loader2 className="animate-spin" size={17} />
              ) : (
                <RefreshCw size={17} />
              )}
              Perbarui data
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <AlertCircle className="mt-0.5 shrink-0" size={19} />
              <div className="min-w-0 flex-1">{error}</div>
              <button
                type="button"
                onClick={() => setError("")}
                className="rounded p-1 hover:bg-red-100"
                aria-label="Tutup pesan error"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {notice && (
            <div
              role="status"
              className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
            >
              <CheckCircle2 className="mt-0.5 shrink-0" size={19} />
              <div className="min-w-0 flex-1">{notice}</div>
              <button
                type="button"
                onClick={() => setNotice("")}
                className="rounded p-1 hover:bg-emerald-100"
                aria-label="Tutup pesan"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total koleksi buku
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {loading ? "—" : buku.length}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Seluruh koleksi yang terdaftar
                  </p>
                </div>
                <div className="rounded-lg bg-blue-50 p-3 text-blue-700">
                  <BookOpen size={22} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Buku tersedia
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {loading ? "—" : availableBooksCount}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Buku fisik aktif dengan stok
                  </p>
                </div>
                <div className="rounded-lg bg-emerald-50 p-3 text-emerald-700">
                  <Package size={22} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Peminjaman aktif
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {loading ? "—" : activeBorrowings.length}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Berstatus sedang dipinjam
                  </p>
                </div>
                <div className="rounded-lg bg-amber-50 p-3 text-amber-700">
                  <BookMarked size={22} />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Sudah dikembalikan
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {loading ? "—" : returnedBorrowings.length}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Riwayat pengembalian tercatat
                  </p>
                </div>
                <div className="rounded-lg bg-violet-50 p-3 text-violet-700">
                  <RotateCcw size={22} />
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("buku");
                    setError("");
                  }}
                  className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    activeTab === "buku"
                      ? "bg-blue-700 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <BookOpen size={17} />
                  Katalog buku
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("peminjaman");
                    setError("");
                  }}
                  className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    activeTab === "peminjaman"
                      ? "bg-blue-700 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <CalendarDays size={17} />
                  Data peminjaman
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      activeTab === "peminjaman"
                        ? "bg-white/20 text-white"
                        : "bg-white text-slate-600"
                    }`}
                  >
                    {peminjaman.length}
                  </span>
                </button>
              </div>

              <div className="relative w-full lg:max-w-sm">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={
                    activeTab === "buku"
                      ? "Cari judul, kode, atau penulis..."
                      : "Cari judul atau nomor peminjaman..."
                  }
                  className="min-h-11 w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {activeTab === "buku" ? (
              <div>
                <div className="grid grid-cols-1 gap-3 border-b border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <Filter size={14} />
                        Jenis buku
                      </span>
                    </label>
                    <select
                      value={filterTipe}
                      onChange={(event) => setFilterTipe(event.target.value)}
                      className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
                    >
                      <option value="SEMUA">Semua jenis</option>
                      <option value="FISIK">Buku fisik</option>
                      <option value="EBOOK">E-Book</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                      Kategori
                    </label>
                    <select
                      value={filterKategori}
                      onChange={(event) =>
                        setFilterKategori(event.target.value)
                      }
                      className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
                    >
                      <option value="">Semua kategori</option>
                      {kategoriOptions.map((kategori) => (
                        <option key={kategori} value={kategori}>
                          {kategori}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setFilterKategori("");
                        setFilterTipe("SEMUA");
                      }}
                      className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                    >
                      Reset filter
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-slate-500">
                    <Loader2 className="animate-spin" size={22} />
                    Memuat katalog buku...
                  </div>
                ) : paginatedBooks.length === 0 ? (
                  <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
                    <div className="rounded-full bg-slate-100 p-4 text-slate-400">
                      <BookOpen size={28} />
                    </div>
                    <h3 className="mt-4 font-semibold text-slate-800">
                      Buku tidak ditemukan
                    </h3>
                    <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
                      Coba ubah kata kunci pencarian atau filter yang digunakan.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                      {paginatedBooks.map((item) => {
                        const isPhysical =
                          String(item?.tipe || "").toUpperCase() === "FISIK";
                        const isActive =
                          String(item?.status || "").toLowerCase() === "aktif";
                        const stock = getBookStock(item);
                        const canBorrow = isPhysical && isActive && stock > 0;

                        return (
                          <article
                            key={item.id}
                            className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-blue-200 hover:shadow-sm"
                          >
                            <div className="flex min-h-36 items-center justify-center bg-slate-100 p-4">
                              {item?.coverUrl ? (
                                <img
                                  src={item.coverUrl}
                                  alt={`Sampul ${item?.judul || "buku"}`}
                                  className="h-32 max-w-full rounded-md object-contain"
                                  loading="lazy"
                                  onError={(event) => {
                                    event.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                <div className="flex h-24 w-20 items-center justify-center rounded-lg border border-slate-200 bg-white text-blue-700">
                                  <BookOpen size={34} />
                                </div>
                              )}
                            </div>

                            <div className="flex flex-1 flex-col p-4">
                              <div className="mb-3 flex flex-wrap items-center gap-2">
                                <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                                  {getBookTypeLabel(item?.tipe)}
                                </span>
                                {item?.kategori && (
                                  <span className="max-w-full truncate rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
                                    {item.kategori}
                                  </span>
                                )}
                              </div>

                              <h3 className="line-clamp-2 min-h-12 text-base font-bold leading-6 text-slate-900">
                                {item?.judul || "Tanpa judul"}
                              </h3>

                              <div className="mt-3 space-y-2 text-sm text-slate-500">
                                <p className="flex items-start gap-2">
                                  <UserRound
                                    size={15}
                                    className="mt-0.5 shrink-0"
                                  />
                                  <span className="break-words">
                                    {item?.penulis || "Penulis tidak dicantumkan"}
                                  </span>
                                </p>

                                <p className="flex items-start gap-2">
                                  <FileText
                                    size={15}
                                    className="mt-0.5 shrink-0"
                                  />
                                  <span className="break-words">
                                    Kode: {item?.kodeBuku || "-"}
                                  </span>
                                </p>

                                {item?.mataPelajaran?.nama && (
                                  <p className="flex items-start gap-2">
                                    <BookMarked
                                      size={15}
                                      className="mt-0.5 shrink-0"
                                    />
                                    <span className="break-words">
                                      {item.mataPelajaran.nama}
                                    </span>
                                  </p>
                                )}
                              </div>

                              <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                                <div>
                                  <p className="text-xs text-slate-500">
                                    {isPhysical ? "Stok tersedia" : "Jenis"}
                                  </p>
                                  <p
                                    className={`mt-1 text-sm font-bold ${
                                      isPhysical && stock <= 0
                                        ? "text-red-600"
                                        : "text-slate-800"
                                    }`}
                                  >
                                    {isPhysical ? `${stock} buku` : "Digital"}
                                  </p>
                                </div>

                                <StatusBadge status={item?.status} />
                              </div>

                              <button
                                type="button"
                                disabled={!canBorrow || submitting}
                                onClick={() => openBorrowModal(item)}
                                className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                              >
                                <BookMarked size={16} />
                                {!isPhysical
                                  ? "Tidak perlu dipinjam"
                                  : !isActive
                                    ? "Buku tidak aktif"
                                    : stock <= 0
                                      ? "Stok habis"
                                      : "Pinjam buku"}
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>

                    <Pagination
                      page={pageBuku}
                      totalPages={totalPagesBuku}
                      totalItems={filteredBooks.length}
                      pageSize={PAGE_SIZE}
                      onPageChange={setPageBuku}
                    />
                  </>
                )}
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 gap-3 border-b border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                      Status peminjaman
                    </label>
                    <select
                      value={filterStatusPinjam}
                      onChange={(event) =>
                        setFilterStatusPinjam(event.target.value)
                      }
                      className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
                    >
                      <option value="SEMUA">Semua status</option>
                      <option value="dipinjam">Sedang dipinjam</option>
                      <option value="dikembalikan">Dikembalikan</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setFilterStatusPinjam("SEMUA");
                      }}
                      className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                    >
                      Reset filter
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-slate-500">
                    <Loader2 className="animate-spin" size={22} />
                    Memuat data peminjaman...
                  </div>
                ) : paginatedBorrowings.length === 0 ? (
                  <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
                    <div className="rounded-full bg-slate-100 p-4 text-slate-400">
                      <CalendarDays size={28} />
                    </div>
                    <h3 className="mt-4 font-semibold text-slate-800">
                      Belum ada data peminjaman
                    </h3>
                    <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
                      Data peminjaman akan muncul di sini setelah tersedia.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("buku")}
                      className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                    >
                      Cari buku
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="hidden overflow-x-auto md:block">
                      <table className="w-full min-w-[850px] text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                          <tr>
                            <th className="px-5 py-4 font-semibold">Buku</th>
                            <th className="px-5 py-4 font-semibold">
                              Nomor peminjaman
                            </th>
                            <th className="px-5 py-4 font-semibold">
                              Tanggal pinjam
                            </th>
                            <th className="px-5 py-4 font-semibold">
                              Jatuh tempo
                            </th>
                            <th className="px-5 py-4 font-semibold">Status</th>
                            <th className="px-5 py-4 text-right font-semibold">
                              Aksi
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                          {paginatedBorrowings.map((item) => {
                            const isBorrowed =
                              String(item?.status || "").toLowerCase() ===
                              "dipinjam";

                            return (
                              <tr
                                key={item.id}
                                className="transition hover:bg-slate-50/70"
                              >
                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                                      <BookOpen size={19} />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="max-w-xs truncate font-semibold text-slate-800">
                                        {getBorrowingBookTitle(item)}
                                      </p>
                                      <p className="mt-1 text-xs text-slate-500">
                                        {item?.buku?.kodeBuku || "-"}
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                <td className="px-5 py-4 text-slate-600">
                                  {getBorrowingNumber(item)}
                                </td>

                                <td className="px-5 py-4 text-slate-600">
                                  {formatDate(
                                    item?.tanggalPinjam || item?.dibuatPada
                                  )}
                                </td>

                                <td className="px-5 py-4 text-slate-600">
                                  {formatDate(item?.tanggalJatuhTempo)}
                                </td>

                                <td className="px-5 py-4">
                                  <StatusBadge status={item?.status} />
                                </td>

                                <td className="px-5 py-4 text-right">
                                  {isBorrowed ? (
                                    <button
                                      type="button"
                                      onClick={() => setSelectedReturn(item)}
                                      disabled={submitting}
                                      className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                                    >
                                      <RotateCcw size={15} />
                                      Kembalikan
                                    </button>
                                  ) : (
                                    <span className="text-xs text-slate-400">
                                      Selesai
                                    </span>
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
                        const isBorrowed =
                          String(item?.status || "").toLowerCase() ===
                          "dipinjam";

                        return (
                          <article
                            key={item.id}
                            className="rounded-xl border border-slate-200 p-4"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                                <BookOpen size={20} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="break-words font-semibold text-slate-900">
                                  {getBorrowingBookTitle(item)}
                                </h3>
                                <p className="mt-1 break-all text-xs text-slate-500">
                                  {getBorrowingNumber(item)}
                                </p>
                                <div className="mt-2">
                                  <StatusBadge status={item?.status} />
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                              <div>
                                <p className="text-xs text-slate-500">
                                  Tanggal pinjam
                                </p>
                                <p className="mt-1 text-sm font-medium text-slate-800">
                                  {formatDate(
                                    item?.tanggalPinjam || item?.dibuatPada
                                  )}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">
                                  Jatuh tempo
                                </p>
                                <p className="mt-1 text-sm font-medium text-slate-800">
                                  {formatDate(item?.tanggalJatuhTempo)}
                                </p>
                              </div>
                            </div>

                            {isBorrowed && (
                              <button
                                type="button"
                                onClick={() => setSelectedReturn(item)}
                                disabled={submitting}
                                className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                              >
                                <RotateCcw size={16} />
                                Kembalikan buku
                              </button>
                            )}
                          </article>
                        );
                      })}
                    </div>

                    <Pagination
                      page={pagePinjam}
                      totalPages={totalPagesPinjam}
                      totalItems={filteredBorrowings.length}
                      pageSize={PAGE_SIZE}
                      onPageChange={setPagePinjam}
                    />
                  </>
                )}
              </div>
            )}
          </section>

          <section className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
            <div className="rounded-lg bg-white p-2 text-blue-700">
              <Clock3 size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-900">
                Informasi peminjaman
              </h3>
              <p className="mt-1 text-sm leading-6 text-blue-800/80">
                Pastikan tanggal jatuh tempo sesuai kebutuhan. Stok buku
                diperbarui oleh sistem ketika peminjaman dan pengembalian
                berhasil diproses. E-book tidak memerlukan proses peminjaman.
              </p>
            </div>
          </section>
        </main>
      </div>

      {selectedBook && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeBorrowModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="borrow-modal-title"
            className="my-auto w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
              <div>
                <h2
                  id="borrow-modal-title"
                  className="text-lg font-bold text-slate-900"
                >
                  Pinjam buku
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Lengkapi tanggal jatuh tempo peminjaman.
                </p>
              </div>
              <button
                type="button"
                onClick={closeBorrowModal}
                disabled={submitting}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
                aria-label="Tutup dialog"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleBorrow}>
              <div className="space-y-5 p-5">
                <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                    <BookOpen size={22} />
                  </div>
                  <div className="min-w-0">
                    <p className="break-words font-semibold text-slate-900">
                      {selectedBook?.judul}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Kode buku: {selectedBook?.kodeBuku || "-"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Stok tersedia: {getBookStock(selectedBook)}
                    </p>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="tanggalJatuhTempo"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Tanggal jatuh tempo
                    <span className="ml-1 text-red-500">*</span>
                  </label>
                  <input
                    id="tanggalJatuhTempo"
                    type="date"
                    value={tanggalJatuhTempo}
                    min={toLocalDateInput()}
                    onChange={(event) =>
                      setTanggalJatuhTempo(event.target.value)
                    }
                    required
                    className="min-h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <p className="mt-1.5 text-xs leading-5 text-slate-500">
                    Tanggal jatuh tempo tidak boleh sebelum hari ini.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="catatanPeminjaman"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Catatan
                    <span className="ml-1 font-normal text-slate-400">
                      (opsional)
                    </span>
                  </label>
                  <textarea
                    id="catatanPeminjaman"
                    value={catatan}
                    onChange={(event) => setCatatan(event.target.value)}
                    rows={3}
                    maxLength={1000}
                    placeholder="Tambahkan catatan jika diperlukan..."
                    className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 p-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeBorrowModal}
                  disabled={submitting}
                  className="min-h-10 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting || !tanggalJatuhTempo}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting && (
                    <Loader2 className="animate-spin" size={16} />
                  )}
                  Ajukan peminjaman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedReturn && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="return-modal-title"
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <RotateCcw size={23} />
            </div>

            <h2
              id="return-modal-title"
              className="mt-4 text-lg font-bold text-slate-900"
            >
              Konfirmasi pengembalian
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Apakah kamu yakin ingin mengembalikan buku{" "}
              <span className="font-semibold text-slate-900">
                {getBorrowingBookTitle(selectedReturn)}
              </span>
              ?
            </p>

            <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm">
              <p className="text-slate-500">Nomor peminjaman</p>
              <p className="mt-1 break-all font-semibold text-slate-800">
                {getBorrowingNumber(selectedReturn)}
              </p>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setSelectedReturn(null)}
                disabled={submitting}
                className="min-h-10 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleReturn}
                disabled={submitting}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                Ya, kembalikan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Pagination({ page, totalPages, totalItems, pageSize, onPageChange }) {
  if (totalItems === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <p className="text-sm text-slate-500">
        Menampilkan{" "}
        <span className="font-semibold text-slate-700">{start}</span>–
        <span className="font-semibold text-slate-700">{end}</span> dari{" "}
        <span className="font-semibold text-slate-700">{totalItems}</span> data
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange((current) => Math.max(1, current - 1))}
          disabled={page <= 1}
          aria-label="Halaman sebelumnya"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={17} />
        </button>

        <span className="min-w-20 text-center text-sm font-medium text-slate-600">
          {page} / {totalPages}
        </span>

        <button
          type="button"
          onClick={() =>
            onPageChange((current) => Math.min(totalPages, current + 1))
          }
          disabled={page >= totalPages}
          aria-label="Halaman berikutnya"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={17} />
        </button>
      </div>
    </div>
  );
}
