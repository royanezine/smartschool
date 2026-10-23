"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  X,
  RefreshCw,
  ChevronDown,
  Library,
  CheckCircle2,
  Archive,
  FileText,
} from "lucide-react";

import {
  getBuku,
  deleteBuku,
} from "@/services/perpustakaan.service";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";


const themeCardShadow =
  "shadow-[0_6px_24px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";

function normalizeBook(book) {
  return {
    ...book,
    jumlah: Number(book?.jumlah ?? 0),
    jumlahTersedia: Number(book?.jumlahTersedia ?? 0),
    tahunTerbit: book?.tahunTerbit ?? "",
    status: String(book?.status ?? "aktif").toLowerCase(),
    tipe: String(book?.tipe ?? "FISIK").toUpperCase(),
    kodeBuku: book?.kodeBuku ?? "",
    judul: book?.judul ?? "",
    penulis: book?.penulis ?? "",
    penerbit: book?.penerbit ?? "",
    isbn: book?.isbn ?? "",
    kategori: book?.kategori ?? "",
    deskripsi: book?.deskripsi ?? "",
    coverUrl: book?.coverUrl ?? "",
    urlEbook: book?.urlEbook ?? "",
  };
}

const getErrorMessage = (error) =>
  error instanceof Error
    ? error.message
    : error?.message || "Terjadi kesalahan pada server.";

const getDipinjam = (book) =>
  Math.max(0, Number(book?.jumlah ?? 0) - Number(book?.jumlahTersedia ?? 0));

const formatTipe = (tipe) => (tipe === "EBOOK" ? "E-Book" : "Buku Fisik");
const formatStatus = (status) =>
  status === "aktif"
    ? "Aktif"
    : status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "-";

function StatCard({ icon: Icon, label, value, type = "blue" }) {
  const styles = {
    blue: "theme-primary-soft",
    green: "theme-success",
    orange: "theme-warning",
    purple: "theme-primary-soft",
  };
  return (
    <div
      className={`theme-card theme-border rounded-xl border p-4 ${themeCardShadow} sm:p-5`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            styles[type] || styles.blue
          }`}
        >
          <Icon size={19} />
        </div>
        <div>
          <p className="theme-text-muted text-[11px] font-medium uppercase tracking-wide">
            {label}
          </p>
          <p className="theme-text mt-1 text-2xl font-bold tracking-tight">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const active = status === "aktif";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border theme-border px-2.5 py-1 text-xs font-medium ${
        active ? "theme-success" : "theme-card-soft theme-text-muted"
      }`}
    >
      {active ? <CheckCircle2 size={13} /> : <Archive size={13} />}
      {formatStatus(status)}
    </span>
  );
}

function TypeBadge({ tipe }) {
  const ebook = tipe === "EBOOK";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${
        ebook
          ? "theme-primary-soft theme-border"
          : "theme-card-soft theme-border theme-text-secondary"
      }`}
    >
      {ebook ? <FileText size={12} /> : <BookOpen size={12} />}
      {formatTipe(tipe)}
    </span>
  );
}

export default function DataBukuPage() {
  const router = useRouter();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [typeFilter, setTypeFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [deleteBook, setDeleteBook] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function loadBooks() {
    try {
      setLoading(true);
      setError("");
      const result = await getBuku();
      const normalized = Array.isArray(result) ? result.map(normalizeBook) : [];
      setBooks(normalized);
    } catch (err) {
      console.error("Gagal mengambil data buku:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categories = useMemo(() => {
    const values = books.map((b) => b.kategori).filter(Boolean);
    return [...new Set(values)].sort((a, b) => a.localeCompare(b));
  }, [books]);

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return books.filter((book) => {
      const matchSearch =
        !query ||
        book.kodeBuku.toLowerCase().includes(query) ||
        book.judul.toLowerCase().includes(query) ||
        book.penulis.toLowerCase().includes(query);
      const matchCategory =
        categoryFilter === "Semua" || book.kategori === categoryFilter;
      const matchType = typeFilter === "Semua" || book.tipe === typeFilter;
      const matchStatus =
        statusFilter === "Semua" || book.status === statusFilter;
      return matchSearch && matchCategory && matchType && matchStatus;
    });
  }, [books, search, categoryFilter, typeFilter, statusFilter]);

  const totalJudul = books.length;
  const totalAktif = books.filter((b) => b.status === "aktif").length;
  const totalTersedia = books.reduce(
    (sum, b) => sum + Number(b.jumlahTersedia || 0),
    0
  );
  const totalDipinjam = books.reduce((sum, b) => sum + getDipinjam(b), 0);

  const resetFilter = () => {
    setSearch("");
    setCategoryFilter("Semua");
    setTypeFilter("Semua");
    setStatusFilter("Semua");
  };

  const confirmDelete = async () => {
    if (!deleteBook) return;
    try {
      setDeleting(true);
      setError("");
      await deleteBuku(String(deleteBook.id));
      setDeleteBook(null);
      await loadBooks();
    } catch (err) {
      console.error("Gagal menghapus buku:", err);
      setError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0">
          <Header />
        </div>

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="w-full px-4 py-5 sm:px-6 lg:px-8">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="theme-primary-soft flex h-12 w-12 items-center justify-center rounded-xl">
                  <Library size={23} />
                </div>
                <div>
                  <h1 className="theme-text text-[25px] font-bold tracking-tight">
                    Data Buku Perpustakaan
                  </h1>
                  <p className="theme-text-secondary mt-0.5 text-sm">
                    Kelola koleksi buku perpustakaan sekolah
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadBooks}
                  disabled={loading}
                  className="theme-card theme-border theme-text-secondary flex h-10 items-center gap-2 rounded-lg border px-3.5 text-sm font-medium transition hover:theme-card-soft"
                >
                  <RefreshCw
                    size={16}
                    className={loading ? "animate-spin" : ""}
                  />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                <button
                  type="button"
                  onClick={resetFilter}
                  className="theme-card theme-border theme-text-secondary flex h-10 items-center gap-2 rounded-lg border px-3.5 text-sm font-medium transition hover:theme-card-soft"
                >
                  <X size={16} />
                  <span className="hidden sm:inline">Reset</span>
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/admin/perpustakaan/buku-digital/tambah")}
                  className="theme-primary flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold shadow-sm transition hover:opacity-90"
                >
                  <Plus size={17} />
                  Tambah Buku
                </button>
              </div>
            </div>

            {error && (
              <div className="theme-danger mb-5 flex items-start gap-3 rounded-xl border theme-border p-4">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">Gagal memuat data</p>
                  <p className="mt-1 break-words text-xs">{error}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="ml-auto"
                >
                  <X size={17} />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard icon={BookOpen} label="Total Buku" value={totalJudul} type="blue" />
              <StatCard icon={CheckCircle2} label="Buku Aktif" value={totalAktif} type="green" />
              <StatCard icon={Library} label="Buku Tersedia" value={totalTersedia} type="purple" />
              <StatCard icon={Archive} label="Sedang Dipinjam" value={totalDipinjam} type="orange" />
            </div>

            <div
              className={`theme-card theme-border mt-5 rounded-xl border p-4 ${themeCardShadow}`}
            >
              <div className="relative">
                <Search
                  size={18}
                  className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari kode, judul, atau penulis..."
                  className="theme-input theme-border theme-text h-11 w-full rounded-lg border pl-10 pr-4 text-sm outline-none transition placeholder:text-[var(--color-text-placeholder)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]"
                />
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3 xl:flex xl:items-center">
                <div className="relative xl:w-52">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="theme-input theme-border theme-text h-10 w-full appearance-none rounded-lg border px-3.5 pr-9 text-sm outline-none transition focus:border-[var(--color-primary)]"
                  >
                    <option value="Semua">Semua Kategori</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={15}
                    className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                  />
                </div>

                <div className="relative xl:w-40">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="theme-input theme-border theme-text h-10 w-full appearance-none rounded-lg border px-3.5 pr-9 text-sm outline-none transition focus:border-[var(--color-primary)]"
                  >
                    <option value="Semua">Semua Tipe</option>
                    <option value="FISIK">Buku Fisik</option>
                    <option value="EBOOK">E-Book</option>
                  </select>
                  <ChevronDown
                    size={15}
                    className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                  />
                </div>

                <div className="relative xl:w-40">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="theme-input theme-border theme-text h-10 w-full appearance-none rounded-lg border px-3.5 pr-9 text-sm outline-none transition focus:border-[var(--color-primary)]"
                  >
                    <option value="Semua">Semua Status</option>
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                  <ChevronDown
                    size={15}
                    className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                  />
                </div>

                <button
                  type="button"
                  onClick={resetFilter}
                  className="h-10 px-3 text-left text-sm font-medium theme-primary-text transition hover:opacity-80"
                >
                  Reset Filter
                </button>

                <div className="xl:ml-auto">
                  <span className="theme-text-secondary text-sm">
                    {filteredBooks.length} buku ditemukan
                  </span>
                </div>
              </div>
            </div>

            <div
              className={`theme-card theme-border mt-5 overflow-hidden rounded-xl border ${themeCardShadow}`}
            >
              <div className="theme-border flex flex-col gap-1 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="theme-text text-sm font-bold">Koleksi Buku</h2>
                  <p className="theme-text-muted mt-0.5 text-xs">
                    Data buku yang tersimpan pada perpustakaan sekolah
                  </p>
                </div>
                <div className="theme-text-secondary flex items-center gap-2 text-xs">
                  <BookOpen size={14} />
                  {filteredBooks.length} buku
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px] text-left">
                  <thead>
                    <tr className="border-b theme-border theme-card-soft">
                      <th className="theme-text-muted px-5 py-3 text-[11px] font-semibold uppercase tracking-wide">
                        Buku
                      </th>
                      <th className="theme-text-muted px-4 py-3 text-[11px] font-semibold uppercase tracking-wide">
                        Tipe
                      </th>
                      <th className="theme-text-muted px-4 py-3 text-[11px] font-semibold uppercase tracking-wide">
                        Kategori
                      </th>
                      <th className="theme-text-muted px-4 py-3 text-[11px] font-semibold uppercase tracking-wide">
                        Stok
                      </th>
                      <th className="theme-text-muted px-4 py-3 text-[11px] font-semibold uppercase tracking-wide">
                        Status
                      </th>
                      <th className="theme-text-muted px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[var(--color-border)]">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-16 text-center">
                          <RefreshCw
                            size={24}
                            className="theme-text-muted mx-auto animate-spin"
                          />
                          <p className="theme-text-secondary mt-3 text-sm">
                            Memuat data buku...
                          </p>
                        </td>
                      </tr>
                    ) : filteredBooks.length > 0 ? (
                      filteredBooks.map((book) => {
                        const borrowed = getDipinjam(book);
                        const percentage =
                          book.jumlah > 0
                            ? Math.min(
                                100,
                                (book.jumlahTersedia / book.jumlah) * 100
                              )
                            : 0;

                        return (
                          <tr key={book.id} className="theme-table-hover transition">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="theme-primary-soft flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                                  {book.coverUrl ? (
                                    <img
                                      src={book.coverUrl}
                                      alt=""
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <BookOpen size={19} />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="theme-text max-w-[320px] truncate text-sm font-semibold">
                                    {book.judul}
                                  </p>
                                  <div className="mt-1 flex items-center gap-2">
                                    <span className="text-[11px] font-medium theme-primary-text">
                                      {book.kodeBuku}
                                    </span>
                                    <span className="theme-text-muted text-[11px]">
                                      •
                                    </span>
                                    <span className="theme-text-muted text-[11px]">
                                      {book.tahunTerbit || "-"}
                                    </span>
                                  </div>
                                  <p className="theme-text-muted mt-0.5 text-xs">
                                    {book.penulis}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-4">
                              <TypeBadge tipe={book.tipe} />
                            </td>

                            <td className="px-4 py-4">
                              <span className="theme-card-soft theme-border theme-text-secondary inline-flex rounded-md border px-2.5 py-1 text-xs font-medium">
                                {book.kategori || "-"}
                              </span>
                            </td>

                            <td className="px-4 py-4">
                              <div className="min-w-[120px]">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="theme-text font-semibold">
                                    {book.jumlahTersedia}
                                  </span>
                                  <span className="theme-text-muted">
                                    / {book.jumlah}
                                  </span>
                                </div>
                                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]">
                                  <div
                                    className="h-full rounded-full bg-[var(--color-primary)]"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <p className="theme-text-muted mt-1 text-[10px]">
                                  {borrowed} dipinjam
                                </p>
                              </div>
                            </td>

                            <td className="px-4 py-4">
                              <StatusBadge status={book.status} />
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    router.push(
                                      `/admin/perpustakaan/buku-digital/${book.id}`
                                    )
                                  }
                                  title="Detail"
                                  className="theme-text-muted flex h-8 w-8 items-center justify-center rounded-md transition hover:theme-primary-soft hover:theme-primary-text"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    router.push(
                                      `/admin/perpustakaan/buku-digital/${book.id}/edit`
                                    )
                                  }
                                  title="Edit"
                                  className="theme-text-muted flex h-8 w-8 items-center justify-center rounded-md transition hover:theme-primary-soft hover:theme-primary-text"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteBook(book)}
                                  title="Hapus"
                                  className="theme-text-muted flex h-8 w-8 items-center justify-center rounded-md transition hover:theme-danger"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-5 py-16 text-center">
                          <div className="theme-primary-soft mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                            <Search size={20} />
                          </div>
                          <p className="theme-text mt-3 text-sm font-semibold">
                            Buku tidak ditemukan
                          </p>
                          <p className="theme-text-muted mt-1 text-xs">
                            Coba ubah kata kunci atau filter pencarian.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="theme-border flex flex-col gap-2 border-t px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="theme-text-muted text-xs">
                  Menampilkan{" "}
                  <span className="theme-text font-medium">
                    {filteredBooks.length}
                  </span>{" "}
                  dari{" "}
                  <span className="theme-text font-medium">{books.length}</span>{" "}
                  buku
                </p>
                <p className="theme-text-muted text-xs">
                  {totalTersedia} eksemplar tersedia
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {deleteBook && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
          <div
            className={`theme-card theme-border w-full max-w-md rounded-2xl border p-6 ${themeCardShadow}`}
          >
            <div className="flex items-start gap-4">
              <div className="theme-danger flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
                <Trash2 size={20} />
              </div>
              <div>
                <h2 className="theme-text text-lg font-bold">
                  Hapus data buku?
                </h2>
                <p className="theme-text-secondary mt-1.5 text-sm leading-6">
                  Data buku{" "}
                  <span className="theme-text font-semibold">
                    "{deleteBook.judul}"
                  </span>{" "}
                  akan dihapus dari daftar perpustakaan.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteBook(null)}
                className="theme-card theme-border theme-text-secondary h-10 rounded-lg border px-5 text-sm font-medium transition hover:theme-card-soft"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="theme-danger h-10 rounded-lg border theme-border px-5 text-sm font-semibold transition hover:opacity-80 disabled:opacity-60"
              >
                {deleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}