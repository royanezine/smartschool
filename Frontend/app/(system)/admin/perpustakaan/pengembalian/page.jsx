"use client";

import { useEffect, useMemo, useState } from "react";
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
  ExternalLink,
  FileText,
  AlertTriangle,
} from "lucide-react";

import {
  getBuku,
  getBukuById,
  createBuku,
  updateBuku,
  deleteBuku,
} from "../../../../../services/perpustakaan.service";

import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";
const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]";
const themePrimaryHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";
const themeTextHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";
const themeCardShadow =
  "shadow-[0_6px_24px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";
const themePrimaryShadow =
  "shadow-[0_10px_25px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]";

function normalizeBook(book) {
  return {
    ...book,
    id: book?.id ?? book?.bukuId ?? "",
    kodeBuku: book?.kodeBuku ?? book?.kode ?? "",
    judul: book?.judul ?? "",
    penulis: book?.penulis ?? "",
    penerbit: book?.penerbit ?? "",
    tahunTerbit: book?.tahunTerbit ?? "",
    isbn: book?.isbn ?? "",
    tipe: String(book?.tipe ?? "FISIK").toUpperCase(),
    kategori: book?.kategori ?? "",
    deskripsi: book?.deskripsi ?? "",
    coverUrl: book?.coverUrl ?? "",
    urlEbook: book?.urlEbook ?? "",
    jumlah: Number(book?.jumlah ?? 0),
    jumlahTersedia: Number(book?.jumlahTersedia ?? 0),
    status: String(book?.status ?? "aktif").toLowerCase(),
  };
}

function getDipinjam(book) {
  return Math.max(
    0,
    Number(book?.jumlah ?? 0) - Number(book?.jumlahTersedia ?? 0),
  );
}

function getErrorMessage(error) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return (
    error?.message ||
    error?.error ||
    "Terjadi kesalahan pada server."
  );
}

function formatTipe(tipe) {
  return tipe === "EBOOK" ? "E-Book" : "Buku Fisik";
}

function formatStatus(status) {
  if (status === "aktif") return "Aktif";
  if (status === "nonaktif") return "Nonaktif";
  return status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "-";
}

function StatCard({ icon: Icon, label, value, type = "blue" }) {
  const styles = {
    blue: {
      iconBg: themePrimarySoft,
      iconText: "text-[var(--color-primary)]",
      value: "theme-text",
    },
    green: {
      iconBg:
        "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]",
      iconText: "text-[var(--color-success)]",
      value: "text-[var(--color-success)]",
    },
    orange: {
      iconBg:
        "bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)]",
      iconText: "text-[var(--color-warning)]",
      value: "text-[var(--color-warning)]",
    },
    purple: {
      iconBg:
        "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]",
      iconText: "text-[var(--color-primary)]",
      value: "text-[var(--color-primary)]",
    },
  };

  const style = styles[type];

  return (
    <div
      className={`theme-card theme-border rounded-xl border p-4 ${themeCardShadow} sm:p-5`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${style.iconBg} ${style.iconText}`}
        >
          <Icon size={19} />
        </div>
        <div>
          <p className="theme-text-muted text-[11px] font-medium uppercase tracking-wide">
            {label}
          </p>
          <p className={`mt-1 text-2xl font-bold tracking-tight ${style.value}`}>
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
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
        active
          ? "border-[color-mix(in_srgb,var(--color-success)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)]"
          : "theme-border theme-card-soft theme-text-muted"
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
          ? "border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]"
          : "theme-border theme-card-soft theme-text-secondary"
      }`}
    >
      {ebook ? <FileText size={12} /> : <BookOpen size={12} />}
      {formatTipe(tipe)}
    </span>
  );
}

function BookForm({
  initial,
  onCancel,
  onSave,
  editMode,
  saving,
  error,
}) {
  const [form, setForm] = useState(initial);

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  const update = (key) => (event) => {
    const value = event.target.value;

    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "tipe" && value === "EBOOK" ? { jumlah: 0 } : {}),
    }));
  };

  const submit = (event) => {
    event.preventDefault();

    if (!form.kodeBuku?.trim()) return;
    if (!form.judul?.trim()) return;
    if (!form.penulis?.trim()) return;
    if (!form.kategori?.trim()) return;

    if (form.tipe === "EBOOK" && !form.urlEbook?.trim()) return;

    onSave(form);
  };

  const inputClass =
    "theme-input theme-border theme-text h-11 w-full rounded-lg border px-3.5 text-sm outline-none transition placeholder:text-[var(--color-text-placeholder)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";

  const selectClass =
    "theme-input theme-border theme-text h-11 w-full appearance-none rounded-lg border px-3.5 pr-9 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";

  const labelClass = "theme-text-secondary mb-2 block text-xs font-semibold";

  return (
    <form onSubmit={submit} className="space-y-5">
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-[color-mix(in_srgb,var(--color-danger,#ef4444)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-danger,#ef4444)_8%,transparent)] p-3 text-sm theme-danger">
          <AlertTriangle size={17} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Kode Buku *</label>
          <input
            required
            value={form.kodeBuku}
            onChange={update("kodeBuku")}
            placeholder="Contoh: BK-0011"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>ISBN</label>
          <input
            value={form.isbn}
            onChange={update("isbn")}
            placeholder="978-602-xxxx-xx-x"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Judul Buku *</label>
        <input
          required
          value={form.judul}
          onChange={update("judul")}
          placeholder="Masukkan judul buku"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Penulis *</label>
          <input
            required
            value={form.penulis}
            onChange={update("penulis")}
            placeholder="Nama penulis"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Penerbit</label>
          <input
            value={form.penerbit}
            onChange={update("penerbit")}
            placeholder="Nama penerbit"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Tahun Terbit</label>
          <input
            type="number"
            min="0"
            value={form.tahunTerbit}
            onChange={update("tahunTerbit")}
            placeholder="2025"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Tipe *</label>
          <div className="relative">
            <select
              value={form.tipe}
              onChange={update("tipe")}
              className={selectClass}
            >
              <option value="FISIK">Buku Fisik</option>
              <option value="EBOOK">E-Book</option>
            </select>
            <ChevronDown
              size={15}
              className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Status *</label>
          <div className="relative">
            <select
              value={form.status}
              onChange={update("status")}
              className={selectClass}
            >
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
            <ChevronDown
              size={15}
              className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
            />
          </div>
        </div>
      </div>

      <div>
        <label className={labelClass}>Kategori *</label>
        <input
          required
          value={form.kategori}
          onChange={update("kategori")}
          placeholder="Contoh: Matematika, IPA, Sejarah"
          className={inputClass}
        />
        <p className="theme-text-muted mt-1.5 text-[11px]">
          Kategori mengikuti data yang tersimpan di backend.
        </p>
      </div>

      <div>
        <label className={labelClass}>Jumlah Eksemplar</label>
        <input
          type="number"
          min="0"
          disabled={form.tipe === "EBOOK"}
          value={form.tipe === "EBOOK" ? 0 : form.jumlah}
          onChange={update("jumlah")}
          placeholder="10"
          className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-60`}
        />
        <p className="theme-text-muted mt-1.5 text-[11px]">
          Jumlah tersedia dan jumlah dipinjam dihitung oleh backend.
          {form.tipe === "EBOOK" ? " E-Book otomatis memiliki jumlah 0." : ""}
        </p>
      </div>

      {form.tipe === "EBOOK" && (
        <div>
          <label className={labelClass}>URL E-Book *</label>
          <input
            required
            type="url"
            value={form.urlEbook}
            onChange={update("urlEbook")}
            placeholder="https://..."
            className={inputClass}
          />
        </div>
      )}

      <div>
        <label className={labelClass}>URL Cover</label>
        <input
          type="url"
          value={form.coverUrl}
          onChange={update("coverUrl")}
          placeholder="https://..."
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Deskripsi</label>
        <textarea
          value={form.deskripsi}
          onChange={update("deskripsi")}
          placeholder="Deskripsi buku..."
          rows={4}
          className={`${inputClass} h-auto py-3`}
        />
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-[var(--color-border-soft)] pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className={`theme-card theme-border theme-text-secondary h-10 rounded-lg border px-5 text-sm font-medium transition ${themeTextHover} disabled:opacity-50`}
        >
          Batal
        </button>

        <button
          type="submit"
          disabled={saving}
          className={`flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 text-sm font-semibold text-[var(--color-card)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 ${themePrimaryShadow}`}
        >
          {saving && <RefreshCw size={15} className="animate-spin" />}
          {saving ? "Menyimpan..." : editMode ? "Simpan Perubahan" : "Simpan Buku"}
        </button>
      </div>
    </form>
  );
}

function DetailModal({ book, loading, onClose }) {
  if (!book && !loading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <div
        className={`theme-card theme-border max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border ${themeCardShadow}`}
      >
        <div className="theme-card sticky top-0 z-10 flex items-center justify-between border-b border-[var(--color-border-soft)] px-5 py-4">
          <div>
            <h2 className="theme-text text-lg font-bold">Detail Data Buku</h2>
            <p className="theme-text-muted mt-0.5 text-xs">
              Informasi dari backend perpustakaan
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`theme-text-muted flex h-9 w-9 items-center justify-center rounded-lg transition ${themeTextHover}`}
          >
            <X size={18} />
          </button>
        </div>

        {loading && !book ? (
          <div className="px-6 py-16 text-center">
            <RefreshCw size={24} className="theme-text-muted mx-auto animate-spin" />
            <p className="theme-text-secondary mt-3 text-sm">
              Memuat detail buku...
            </p>
          </div>
        ) : book ? (
          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex h-36 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--color-primary)] text-[var(--color-card)] sm:w-28">
                {book.coverUrl ? (
                  <img
                    src={book.coverUrl}
                    alt={book.judul}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <BookOpen size={45} strokeWidth={1.5} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`${themePrimarySoft} ${themePrimarySoftBorder} rounded-md border px-2.5 py-1 text-xs font-semibold text-[var(--color-primary)]`}
                  >
                    {book.kodeBuku}
                  </span>
                  <TypeBadge tipe={book.tipe} />
                  <StatusBadge status={book.status} />
                </div>

                <h3 className="theme-text mt-3 text-xl font-bold leading-7">
                  {book.judul}
                </h3>
                <p className="theme-text-secondary mt-1 text-sm">
                  {book.penulis}
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 border-t border-[var(--color-border-soft)] pt-5 sm:grid-cols-2">
              <Info label="ISBN" value={book.isbn} />
              <Info label="Penerbit" value={book.penerbit} />
              <Info label="Tahun Terbit" value={book.tahunTerbit} />
              <Info label="Kategori" value={book.kategori} />
              <Info label="Tipe" value={formatTipe(book.tipe)} />
              <Info label="Status" value={formatStatus(book.status)} />
            </div>

            <div className="mt-6">
              <p className="theme-text-muted mb-3 text-xs font-semibold uppercase tracking-wide">
                Informasi Stok
              </p>

              <div className="grid grid-cols-3 gap-2">
                <StockBox label="Total" value={book.jumlah} />
                <StockBox
                  label="Tersedia"
                  value={book.jumlahTersedia}
                  type="success"
                />
                <StockBox
                  label="Dipinjam"
                  value={getDipinjam(book)}
                  type="warning"
                />
              </div>
            </div>

            {book.deskripsi && (
              <div className="theme-border mt-5 rounded-xl border p-4">
                <p className="theme-text-muted text-xs">Deskripsi</p>
                <p className="theme-text-secondary mt-2 whitespace-pre-wrap text-sm leading-6">
                  {book.deskripsi}
                </p>
              </div>
            )}

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              {book.urlEbook && (
                <a
                  href={book.urlEbook}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-10 items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-card)] transition hover:brightness-110"
                >
                  <ExternalLink size={15} />
                  Buka E-Book
                </a>
              )}

              <button
                type="button"
                onClick={onClose}
                className={`theme-card theme-border theme-text-secondary h-10 rounded-lg border px-5 text-sm font-medium transition ${themeTextHover}`}
              >
                Tutup
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="theme-text-muted text-xs">{label}</p>
      <p className="theme-text-secondary mt-1 text-sm font-medium">
        {value || "-"}
      </p>
    </div>
  );
}

function StockBox({ label, value, type }) {
  const classes =
    type === "success"
      ? "border-[color-mix(in_srgb,var(--color-success)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_8%,transparent)] text-[var(--color-success)]"
      : type === "warning"
        ? "border-[color-mix(in_srgb,var(--color-warning)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] text-[var(--color-warning)]"
        : "theme-card-soft theme-border theme-text";

  return (
    <div className={`rounded-xl border p-4 text-center ${classes}`}>
      <p className="text-xs opacity-80">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}

export default function DataBukuPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [typeFilter, setTypeFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");

  const [modal, setModal] = useState(null);
  const [activeBook, setActiveBook] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [detailBook, setDetailBook] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [deleteBook, setDeleteBook] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function loadBooks() {
    try {
      setLoading(true);
      setError("");

      const result = await getBuku();

      const normalized = Array.isArray(result)
        ? result.map(normalizeBook)
        : [];

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
  }, []);

  const categories = useMemo(() => {
    return [...new Set(
      books.map((book) => book.kategori).filter(Boolean),
    )].sort((a, b) => a.localeCompare(b));
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

      const matchType =
        typeFilter === "Semua" || book.tipe === typeFilter;

      const matchStatus =
        statusFilter === "Semua" || book.status === statusFilter;

      return matchSearch && matchCategory && matchType && matchStatus;
    });
  }, [books, search, categoryFilter, typeFilter, statusFilter]);

  const totalJudul = books.length;
  const totalAktif = books.filter((book) => book.status === "aktif").length;
  const totalTersedia = books.reduce(
    (sum, book) => sum + Number(book.jumlahTersedia || 0),
    0,
  );
  const totalDipinjam = books.reduce(
    (sum, book) => sum + getDipinjam(book),
    0,
  );

  const openAdd = () => {
    setFormError("");
    setActiveBook({
      kodeBuku: "",
      isbn: "",
      judul: "",
      penulis: "",
      penerbit: "",
      tahunTerbit: "",
      tipe: "FISIK",
      kategori: "",
      deskripsi: "",
      coverUrl: "",
      urlEbook: "",
      jumlah: 0,
      jumlahTersedia: 0,
      status: "aktif",
    });
    setModal("add");
  };

  const openEdit = (book) => {
    setFormError("");
    setActiveBook(normalizeBook(book));
    setModal("edit");
  };

  const closeModal = () => {
    if (saving) return;
    setModal(null);
    setActiveBook(null);
    setFormError("");
  };

  const saveBook = async (form) => {
    try {
      setSaving(true);
      setFormError("");

      const payload = {
        kodeBuku: form.kodeBuku.trim(),
        judul: form.judul.trim(),
        penulis: form.penulis.trim(),
        penerbit: form.penerbit?.trim() || "",
        isbn: form.isbn?.trim() || "",
        tipe: form.tipe,
        kategori: form.kategori.trim(),
        deskripsi: form.deskripsi?.trim() || "",
        coverUrl: form.coverUrl?.trim() || "",
        urlEbook: form.urlEbook?.trim() || "",
        jumlah:
          form.tipe === "EBOOK" ? 0 : Number(form.jumlah || 0),
        status: form.status || "aktif",
      };

      if (form.tahunTerbit !== "" && form.tahunTerbit != null) {
        payload.tahunTerbit = Number(form.tahunTerbit);
      }

      if (modal === "add") {
        await createBuku(payload);
      } else {
        await updateBuku(String(form.id), payload);
      }

      await loadBooks();
      closeModal();
    } catch (err) {
      console.error("Gagal menyimpan buku:", err);
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const openDetail = async (book) => {
    try {
      setDetailLoading(true);
      setDetailBook(normalizeBook(book));

      const result = await getBukuById(String(book.id));
      setDetailBook(normalizeBook(result));
    } catch (err) {
      console.error("Gagal mengambil detail buku:", err);
      setError(getErrorMessage(err));
      setDetailBook(null);
    } finally {
      setDetailLoading(false);
    }
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

  const resetFilter = () => {
    setSearch("");
    setCategoryFilter("Semua");
    setTypeFilter("Semua");
    setStatusFilter("Semua");
  };

  return (
    <div className="theme-page flex min-h-screen">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary)] text-[var(--color-card)] ${themePrimaryShadow}`}
                >
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
                  className={`theme-card theme-border theme-text-secondary flex h-10 items-center gap-2 rounded-lg border px-3.5 text-sm font-medium transition ${themeTextHover}`}
                >
                  <RefreshCw
                    size={16}
                    className={loading ? "animate-spin" : ""}
                  />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                <button
                  type="button"
                  onClick={openAdd}
                  className={`flex h-10 items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-card)] transition hover:brightness-110 ${themePrimaryShadow}`}
                >
                  <Plus size={17} />
                  Tambah Buku
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-2 rounded-xl border border-[color-mix(in_srgb,var(--color-warning)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_8%,transparent)] p-4 text-sm text-[var(--color-warning)]">
                <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">Gagal memuat data</p>
                  <p className="mt-1">{error}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="shrink-0"
                >
                  <X size={17} />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={BookOpen}
                label="Judul Buku"
                value={totalJudul}
                type="blue"
              />
              <StatCard
                icon={Library}
                label="Buku Aktif"
                value={totalAktif}
                type="purple"
              />
              <StatCard
                icon={CheckCircle2}
                label="Buku Tersedia"
                value={totalTersedia}
                type="green"
              />
              <StatCard
                icon={Archive}
                label="Sedang Dipinjam"
                value={totalDipinjam}
                type="orange"
              />
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
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari kode, judul buku, atau penulis..."
                  className="theme-input theme-border theme-text h-11 w-full rounded-lg border pl-10 pr-4 text-sm outline-none transition placeholder:text-[var(--color-text-placeholder)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]"
                />
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:flex xl:items-center">
                <div className="relative xl:w-56">
                  <select
                    value={categoryFilter}
                    onChange={(event) => setCategoryFilter(event.target.value)}
                    className="theme-input theme-border theme-text h-10 w-full appearance-none rounded-lg border px-3.5 pr-9 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]"
                  >
                    <option value="Semua">Semua Kategori</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={15}
                    className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                  />
                </div>

                <div className="relative xl:w-44">
                  <select
                    value={typeFilter}
                    onChange={(event) => setTypeFilter(event.target.value)}
                    className="theme-input theme-border theme-text h-10 w-full appearance-none rounded-lg border px-3.5 pr-9 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]"
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

                <div className="relative xl:w-44">
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="theme-input theme-border theme-text h-10 w-full appearance-none rounded-lg border px-3.5 pr-9 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]"
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
                  className={`h-10 px-3 text-left text-sm font-medium text-[var(--color-primary)] transition ${themePrimaryHover} xl:text-center`}
                >
                  Reset Filter
                </button>

                <div className="xl:ml-auto">
                  <span className="theme-text-secondary text-sm">
                    {filteredBooks.length} data ditemukan
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
                    Data langsung dari backend perpustakaan
                  </p>
                </div>
                <div className="theme-text-secondary flex items-center gap-2 text-xs">
                  <BookOpen size={14} />
                  {filteredBooks.length} buku
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left">
                  <thead>
                    <tr className="border-b border-[var(--color-border-soft)] bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]">
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

                  <tbody className="divide-y divide-[var(--color-border-soft)]">
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
                                (book.jumlahTersedia / book.jumlah) * 100,
                              )
                            : 0;

                        return (
                          <tr
                            key={book.id}
                            className={`transition ${themeTextHover}`}
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg ${themePrimarySoft} text-[var(--color-primary)]`}
                                >
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
                                  <p className="theme-text max-w-[300px] truncate text-sm font-semibold">
                                    {book.judul}
                                  </p>
                                  <div className="mt-1 flex items-center gap-2">
                                    <span className="text-[11px] font-medium text-[var(--color-primary)]">
                                      {book.kodeBuku}
                                    </span>
                                    {book.tahunTerbit && (
                                      <>
                                        <span className="theme-text-muted text-[11px]">
                                          •
                                        </span>
                                        <span className="theme-text-muted text-[11px]">
                                          {book.tahunTerbit}
                                        </span>
                                      </>
                                    )}
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
                                  onClick={() => openDetail(book)}
                                  title="Detail"
                                  className={`theme-text-muted flex h-8 w-8 items-center justify-center rounded-md transition ${themePrimaryHover} hover:text-[var(--color-primary)]`}
                                >
                                  <Eye size={16} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => openEdit(book)}
                                  title="Edit"
                                  className={`theme-text-muted flex h-8 w-8 items-center justify-center rounded-md transition ${themePrimaryHover} hover:text-[var(--color-primary)]`}
                                >
                                  <Pencil size={16} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setDeleteBook(book)}
                                  title="Hapus"
                                  className="theme-text-muted theme-danger flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]"
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
                          <div
                            className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${themePrimarySoft} text-[var(--color-primary)]`}
                          >
                            <Search size={20} />
                          </div>
                          <p className="theme-text mt-3 text-sm font-semibold">
                            Data buku tidak ditemukan
                          </p>
                          <p className="theme-text-muted mt-1 text-xs">
                            Coba ubah kata kunci atau filter.
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
                  <span className="theme-text-secondary font-medium">
                    {filteredBooks.length}
                  </span>{" "}
                  dari{" "}
                  <span className="theme-text-secondary font-medium">
                    {books.length}
                  </span>{" "}
                  buku
                </p>

                <p className="theme-text-muted text-xs">
                  Total{" "}
                  <span className="theme-text-secondary font-medium">
                    {books.reduce(
                      (sum, book) => sum + Number(book.jumlah || 0),
                      0,
                    )}
                  </span>{" "}
                  eksemplar
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {modal && activeBook && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
          <div
            className={`theme-card theme-border max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border ${themeCardShadow}`}
          >
            <div className="theme-card sticky top-0 z-10 flex items-center justify-between border-b border-[var(--color-border-soft)] px-5 py-4 sm:px-6">
              <div>
                <h2 className="theme-text text-lg font-bold">
                  {modal === "add" ? "Tambah Data Buku" : "Edit Data Buku"}
                </h2>
                <p className="theme-text-muted mt-0.5 text-xs">
                  {modal === "add"
                    ? "Tambahkan koleksi buku baru ke database"
                    : "Perbarui data buku yang tersimpan di database"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className={`theme-text-muted flex h-9 w-9 items-center justify-center rounded-lg transition ${themeTextHover}`}
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 sm:p-6">
              <BookForm
                initial={activeBook}
                editMode={modal === "edit"}
                onCancel={closeModal}
                onSave={saveBook}
                saving={saving}
                error={formError}
              />
            </div>
          </div>
        </div>
      )}

      <DetailModal
        book={detailBook}
        loading={detailLoading}
        onClose={() => {
          if (!detailLoading) setDetailBook(null);
        }}
      />

      {deleteBook && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
          <div
            className={`theme-card theme-border w-full max-w-md rounded-2xl border p-6 ${themeCardShadow}`}
          >
            <div className="flex items-start gap-4">
              <div className="theme-danger flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]">
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
                  akan dihapus melalui backend.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteBook(null)}
                disabled={deleting}
                className={`theme-card theme-border theme-text-secondary h-10 rounded-lg border px-5 text-sm font-medium transition ${themeTextHover} disabled:opacity-50`}
              >
                Batal
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="theme-danger flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--color-text)] px-5 text-sm font-semibold text-[var(--color-card)] transition hover:opacity-90 disabled:opacity-50"
              >
                {deleting && <RefreshCw size={15} className="animate-spin" />}
                {deleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
