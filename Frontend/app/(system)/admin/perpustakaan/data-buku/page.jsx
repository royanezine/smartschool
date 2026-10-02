"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

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
  ExternalLink,
  AlertCircle,
  Loader2,
} from "lucide-react";

import {
  getBuku,
  getBukuById,
  createBuku,
  updateBuku,
  deleteBuku,
} from "@/services/perpustakaan.service";

/* =========================================================
   THEME HELPERS
========================================================= */

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

/* =========================================================
   FORM DEFAULT
========================================================= */

const emptyForm = {
  kodeBuku: "",
  judul: "",
  penulis: "",
  penerbit: "",
  tahunTerbit: "",
  isbn: "",
  tipe: "FISIK",
  kategori: "",
  deskripsi: "",
  coverUrl: "",
  urlEbook: "",
  jumlah: "0",
  status: "aktif",
};

/* =========================================================
   HELPERS
========================================================= */

function normalizeBook(book) {
  if (!book) return null;

  const jumlah = Number(book.jumlah ?? 0);
  const jumlahTersedia = Number(
    book.jumlahTersedia ?? 0,
  );

  return {
    ...book,

    id: book.id ?? book.bukuId,

    kodeBuku: book.kodeBuku ?? "",
    judul: book.judul ?? "",
    penulis: book.penulis ?? "",
    penerbit: book.penerbit ?? "",
    tahunTerbit: book.tahunTerbit ?? "",
    isbn: book.isbn ?? "",

    tipe: book.tipe ?? "FISIK",
    kategori: book.kategori ?? "",

    deskripsi: book.deskripsi ?? "",
    coverUrl: book.coverUrl ?? "",
    urlEbook: book.urlEbook ?? "",

    jumlah,
    jumlahTersedia,

    dipinjam: Math.max(
      0,
      jumlah - jumlahTersedia,
    ),

    status: String(
      book.status ?? "aktif",
    ).toLowerCase(),
  };
}

function getErrorMessage(error) {
  if (!error) {
    return "Terjadi kesalahan.";
  }

  if (typeof error === "string") {
    return error;
  }

  return (
    error?.message ||
    error?.response?.data?.message ||
    "Terjadi kesalahan pada server."
  );
}

function statusLabel(status) {
  return status === "aktif"
    ? "Aktif"
    : "Nonaktif";
}

function typeLabel(tipe) {
  return tipe === "EBOOK"
    ? "E-Book"
    : "Buku Fisik";
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
  type = "blue",
}) {
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

          <p
            className={`mt-1 text-2xl font-bold tracking-tight ${style.value}`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

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
      {active ? (
        <CheckCircle2 size={13} />
      ) : (
        <Archive size={13} />
      )}

      {statusLabel(status)}
    </span>
  );
}

/* =========================================================
   TYPE BADGE
========================================================= */

function TypeBadge({ tipe }) {
  const ebook = tipe === "EBOOK";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
        ebook
          ? "border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]"
          : "border-[color-mix(in_srgb,var(--color-success)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)]"
      }`}
    >
      <BookOpen size={12} />
      {typeLabel(tipe)}
    </span>
  );
}

/* =========================================================
   BOOK FORM
========================================================= */

function BookForm({
  initial,
  onCancel,
  onSave,
  editMode,
  saving,
  error,
}) {
  const [form, setForm] = useState({
    ...emptyForm,
    ...initial,
  });

  useEffect(() => {
    setForm({
      ...emptyForm,
      ...initial,
    });
  }, [initial]);

  const update = (key) => (event) => {
    setForm((current) => ({
      ...current,
      [key]: event.target.value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();

    if (!form.kodeBuku.trim()) {
      return;
    }

    if (!form.judul.trim()) {
      return;
    }

    if (!form.penulis.trim()) {
      return;
    }

    if (!form.kategori.trim()) {
      return;
    }

    if (
      form.tipe === "EBOOK" &&
      !form.urlEbook.trim()
    ) {
      return;
    }

    await onSave(form);
  };

  const inputClass =
    "theme-input theme-border theme-text h-11 w-full rounded-lg border px-3.5 text-sm outline-none transition placeholder:text-[var(--color-text-placeholder)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";

  const selectClass =
    "theme-input theme-border theme-text h-11 w-full appearance-none rounded-lg border px-3.5 pr-9 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";

  const labelClass =
    "theme-text-secondary mb-2 block text-xs font-semibold";

  return (
    <form
      onSubmit={submit}
      className="space-y-5"
    >
      {error && (
        <div className="theme-border flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle
            size={17}
            className="mt-0.5 shrink-0 theme-danger"
          />

          <p className="theme-text-secondary">
            {error}
          </p>
        </div>
      )}

      {/* KODE + ISBN */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>
            Kode Buku
          </label>

          <input
            required
            value={form.kodeBuku}
            onChange={update("kodeBuku")}
            placeholder="Contoh: BK-0011"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>
            ISBN
          </label>

          <input
            value={form.isbn}
            onChange={update("isbn")}
            placeholder="978-602-xxxx-xx-x"
            className={inputClass}
          />
        </div>
      </div>

      {/* JUDUL */}

      <div>
        <label className={labelClass}>
          Judul Buku
        </label>

        <input
          required
          value={form.judul}
          onChange={update("judul")}
          placeholder="Masukkan judul buku"
          className={inputClass}
        />
      </div>

      {/* PENULIS + PENERBIT */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>
            Penulis
          </label>

          <input
            required
            value={form.penulis}
            onChange={update("penulis")}
            placeholder="Nama penulis"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>
            Penerbit
          </label>

          <input
            value={form.penerbit}
            onChange={update("penerbit")}
            placeholder="Nama penerbit"
            className={inputClass}
          />
        </div>
      </div>

      {/* TAHUN + TIPE + KATEGORI */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>
            Tahun Terbit
          </label>

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
          <label className={labelClass}>
            Tipe Buku
          </label>

          <div className="relative">
            <select
              value={form.tipe}
              onChange={update("tipe")}
              className={selectClass}
            >
              <option value="FISIK">
                Buku Fisik
              </option>

              <option value="EBOOK">
                E-Book
              </option>
            </select>

            <ChevronDown
              size={15}
              className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>
            Kategori
          </label>

          <input
            required
            value={form.kategori}
            onChange={update("kategori")}
            placeholder="Contoh: Matematika"
            className={inputClass}
          />
        </div>
      </div>

      {/* STOK + STATUS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>
            Jumlah
          </label>

          <input
            type="number"
            min="0"
            value={
              form.tipe === "EBOOK"
                ? 0
                : form.jumlah
            }
            disabled={form.tipe === "EBOOK"}
            onChange={update("jumlah")}
            className={`${inputClass} ${
              form.tipe === "EBOOK"
                ? "cursor-not-allowed opacity-60"
                : ""
            }`}
          />

          <p className="theme-text-muted mt-1 text-[11px]">
            {form.tipe === "EBOOK"
              ? "E-Book otomatis memiliki jumlah 0."
              : "Jumlah adalah total eksemplar buku fisik."}
          </p>
        </div>

        <div>
          <label className={labelClass}>
            Status
          </label>

          <div className="relative">
            <select
              value={form.status}
              onChange={update("status")}
              className={selectClass}
            >
              <option value="aktif">
                Aktif
              </option>

              <option value="nonaktif">
                Nonaktif
              </option>
            </select>

            <ChevronDown
              size={15}
              className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
            />
          </div>
        </div>
      </div>

      {/* URL EBOOK */}

      <div>
        <label className={labelClass}>
          URL E-Book
          {form.tipe === "EBOOK" && (
            <span className="theme-danger ml-1">
              *
            </span>
          )}
        </label>

        <input
          type="url"
          required={form.tipe === "EBOOK"}
          value={form.urlEbook}
          onChange={update("urlEbook")}
          placeholder="https://..."
          className={inputClass}
        />

        <p className="theme-text-muted mt-1 text-[11px]">
          Wajib diisi jika tipe buku adalah E-Book.
        </p>
      </div>

      {/* COVER */}

      <div>
        <label className={labelClass}>
          URL Cover
        </label>

        <input
          type="url"
          value={form.coverUrl}
          onChange={update("coverUrl")}
          placeholder="https://..."
          className={inputClass}
        />
      </div>

      {/* DESKRIPSI */}

      <div>
        <label className={labelClass}>
          Deskripsi
        </label>

        <textarea
          value={form.deskripsi}
          onChange={update("deskripsi")}
          placeholder="Deskripsi buku..."
          rows={4}
          className="theme-input theme-border theme-text w-full resize-none rounded-lg border px-3.5 py-3 text-sm outline-none transition placeholder:text-[var(--color-text-placeholder)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]"
        />
      </div>

      {/* FOOTER */}

      <div className="flex flex-col-reverse gap-2 border-t border-[var(--color-border-soft)] pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled={saving}
          onClick={onCancel}
          className={`theme-card theme-border theme-text-secondary h-10 rounded-lg border px-5 text-sm font-medium transition ${themeTextHover}`}
        >
          Batal
        </button>

        <button
          type="submit"
          disabled={saving}
          className={`flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 text-sm font-semibold text-[var(--color-card)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 ${themePrimaryShadow}`}
        >
          {saving && (
            <Loader2
              size={16}
              className="animate-spin"
            />
          )}

          {editMode
            ? "Simpan Perubahan"
            : "Simpan Buku"}
        </button>
      </div>
    </form>
  );
}

/* =========================================================
   DETAIL MODAL
========================================================= */

function DetailModal({
  book,
  onClose,
  loading,
}) {
  if (!book && !loading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <div
        className={`theme-card theme-border max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border ${themeCardShadow}`}
      >
        <div className="theme-card sticky top-0 z-10 flex items-center justify-between border-b border-[var(--color-border-soft)] px-5 py-4">
          <div>
            <h2 className="theme-text text-lg font-bold">
              Detail Data Buku
            </h2>

            <p className="theme-text-muted mt-0.5 text-xs">
              Informasi lengkap koleksi perpustakaan
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

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-2 theme-text-muted text-sm">
              <Loader2
                size={18}
                className="animate-spin"
              />
              Memuat detail buku...
            </div>
          </div>
        ) : book ? (
          <div className="p-5 sm:p-6">
            {/* HEADER */}

            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex h-36 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--color-primary)] text-[var(--color-card)] sm:w-28">
                {book.coverUrl ? (
                  <img
                    src={book.coverUrl}
                    alt={book.judul}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <BookOpen
                    size={45}
                    strokeWidth={1.5}
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`${themePrimarySoft} border ${themePrimarySoftBorder} rounded-md px-2.5 py-1 text-xs font-semibold text-[var(--color-primary)]`}
                  >
                    {book.kodeBuku}
                  </span>

                  <TypeBadge
                    tipe={book.tipe}
                  />

                  <StatusBadge
                    status={book.status}
                  />
                </div>

                <h3 className="theme-text mt-3 text-xl font-bold leading-7">
                  {book.judul}
                </h3>

                <p className="theme-text-secondary mt-1 text-sm">
                  {book.penulis}
                </p>
              </div>
            </div>

            {/* INFORMATION */}

            <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 border-t border-[var(--color-border-soft)] pt-5 sm:grid-cols-2">
              <div>
                <p className="theme-text-muted text-xs">
                  ISBN
                </p>

                <p className="theme-text-secondary mt-1 text-sm font-medium">
                  {book.isbn || "-"}
                </p>
              </div>

              <div>
                <p className="theme-text-muted text-xs">
                  Penerbit
                </p>

                <p className="theme-text-secondary mt-1 text-sm font-medium">
                  {book.penerbit || "-"}
                </p>
              </div>

              <div>
                <p className="theme-text-muted text-xs">
                  Tahun Terbit
                </p>

                <p className="theme-text-secondary mt-1 text-sm font-medium">
                  {book.tahunTerbit || "-"}
                </p>
              </div>

              <div>
                <p className="theme-text-muted text-xs">
                  Kategori
                </p>

                <p className="theme-text-secondary mt-1 text-sm font-medium">
                  {book.kategori || "-"}
                </p>
              </div>

              <div>
                <p className="theme-text-muted text-xs">
                  Tipe
                </p>

                <div className="mt-1">
                  <TypeBadge
                    tipe={book.tipe}
                  />
                </div>
              </div>

              <div>
                <p className="theme-text-muted text-xs">
                  Status
                </p>

                <div className="mt-1">
                  <StatusBadge
                    status={book.status}
                  />
                </div>
              </div>
            </div>

            {/* STOCK */}

            <div className="mt-6">
              <p className="theme-text-muted mb-3 text-xs font-semibold uppercase tracking-wide">
                Informasi Stok
              </p>

              <div className="grid grid-cols-3 gap-2">
                <div className="theme-card-soft theme-border rounded-xl border p-4 text-center">
                  <p className="theme-text-muted text-xs">
                    Total
                  </p>

                  <p className="theme-text mt-1 text-xl font-bold">
                    {book.jumlah}
                  </p>
                </div>

                <div className="rounded-xl border border-[color-mix(in_srgb,var(--color-success)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_8%,transparent)] p-4 text-center">
                  <p className="text-xs text-[var(--color-success)]">
                    Tersedia
                  </p>

                  <p className="mt-1 text-xl font-bold text-[var(--color-success)]">
                    {book.jumlahTersedia}
                  </p>
                </div>

                <div className="rounded-xl border border-[color-mix(in_srgb,var(--color-warning)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] p-4 text-center">
                  <p className="text-xs text-[var(--color-warning)]">
                    Dipinjam
                  </p>

                  <p className="mt-1 text-xl font-bold text-[var(--color-warning)]">
                    {book.dipinjam}
                  </p>
                </div>
              </div>
            </div>

            {/* DESCRIPTION */}

            {book.deskripsi && (
              <div className="theme-border mt-5 rounded-xl border p-4">
                <div className="flex items-center gap-2">
                  <FileText
                    size={16}
                    className="text-[var(--color-primary)]"
                  />

                  <p className="theme-text text-sm font-semibold">
                    Deskripsi
                  </p>
                </div>

                <p className="theme-text-secondary mt-2 whitespace-pre-line text-sm leading-6">
                  {book.deskripsi}
                </p>
              </div>
            )}

            {/* EBOOK URL */}

            {book.urlEbook && (
              <div className="theme-border mt-5 flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="theme-text-muted text-xs">
                    URL E-Book
                  </p>

                  <p className="theme-text-secondary mt-1 max-w-[450px] truncate text-sm">
                    {book.urlEbook}
                  </p>
                </div>

                <a
                  href={book.urlEbook}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-card)]"
                >
                  Buka E-Book
                  <ExternalLink size={14} />
                </a>
              </div>
            )}

            {/* FOOTER */}

            <div className="mt-5 flex justify-end border-t border-[var(--color-border-soft)] pt-5">
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

/* =========================================================
   MAIN PAGE
========================================================= */

export default function DataBukuPage() {
  const [books, setBooks] = useState([]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState("Semua");
  const [typeFilter, setTypeFilter] =
    useState("Semua");
  const [statusFilter, setStatusFilter] =
    useState("Semua");

  const [modal, setModal] = useState(null);
  const [activeBook, setActiveBook] =
    useState(null);

  const [detailBook, setDetailBook] =
    useState(null);

  const [detailLoading, setDetailLoading] =
    useState(false);

  const [deleteBook, setDeleteBook] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [formError, setFormError] =
    useState("");

  /* =========================================================
     LOAD BUKU DARI BE
  ========================================================= */

  const loadBooks = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getBuku();

      const normalized = Array.isArray(result)
        ? result.map(normalizeBook)
        : [];

      setBooks(normalized);
    } catch (err) {
      console.error(
        "Gagal mengambil data buku:",
        err,
      );

      setError(getErrorMessage(err));
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  /* =========================================================
     CATEGORY OPTIONS DARI DATA BE
  ========================================================= */

  const categories = useMemo(() => {
    const values = books
      .map((book) => book.kategori)
      .filter(Boolean);

    return [...new Set(values)].sort(
      (a, b) => a.localeCompare(b),
    );
  }, [books]);

  /* =========================================================
     FILTER
  ========================================================= */

  const filteredBooks = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return books.filter((book) => {
      const matchSearch =
        !query ||
        book.judul
          .toLowerCase()
          .includes(query) ||
        book.penulis
          .toLowerCase()
          .includes(query) ||
        book.kodeBuku
          .toLowerCase()
          .includes(query);

      const matchCategory =
        categoryFilter === "Semua" ||
        book.kategori === categoryFilter;

      const matchType =
        typeFilter === "Semua" ||
        book.tipe === typeFilter;

      const matchStatus =
        statusFilter === "Semua" ||
        book.status === statusFilter;

      return (
        matchSearch &&
        matchCategory &&
        matchType &&
        matchStatus
      );
    });
  }, [
    books,
    search,
    categoryFilter,
    typeFilter,
    statusFilter,
  ]);

  /* =========================================================
     STATISTIC
  ========================================================= */

  const totalJudul = books.length;

  const totalStok = books.reduce(
    (sum, book) =>
      sum + Number(book.jumlah || 0),
    0,
  );

  const totalTersedia = books.reduce(
    (sum, book) =>
      sum +
      Number(book.jumlahTersedia || 0),
    0,
  );

  const totalDipinjam = books.reduce(
    (sum, book) =>
      sum + Number(book.dipinjam || 0),
    0,
  );

  /* =========================================================
     ADD
  ========================================================= */

  const openAdd = () => {
    setFormError("");

    setActiveBook({
      ...emptyForm,
    });

    setModal("add");
  };

  /* =========================================================
     EDIT
  ========================================================= */

  const openEdit = (book) => {
    setFormError("");

    setActiveBook({
      kodeBuku: book.kodeBuku ?? "",
      judul: book.judul ?? "",
      penulis: book.penulis ?? "",
      penerbit: book.penerbit ?? "",
      tahunTerbit:
        book.tahunTerbit ?? "",
      isbn: book.isbn ?? "",
      tipe: book.tipe ?? "FISIK",
      kategori: book.kategori ?? "",
      deskripsi: book.deskripsi ?? "",
      coverUrl: book.coverUrl ?? "",
      urlEbook: book.urlEbook ?? "",
      jumlah: String(
        book.jumlah ?? 0,
      ),
      status:
        book.status ?? "aktif",

      id: book.id,
    });

    setModal("edit");
  };

  /* =========================================================
     CLOSE
  ========================================================= */

  const closeModal = () => {
    if (saving) return;

    setModal(null);
    setActiveBook(null);
    setFormError("");
  };

  /* =========================================================
     BUILD PAYLOAD
  ========================================================= */

  const buildPayload = (form) => {
    const payload = {
      kodeBuku:
        form.kodeBuku.trim(),

      judul:
        form.judul.trim(),

      penulis:
        form.penulis.trim(),

      penerbit:
        form.penerbit.trim(),

      isbn:
        form.isbn.trim(),

      tipe:
        form.tipe,

      kategori:
        form.kategori.trim(),

      deskripsi:
        form.deskripsi.trim(),

      coverUrl:
        form.coverUrl.trim(),

      urlEbook:
        form.urlEbook.trim(),

      jumlah:
        form.tipe === "EBOOK"
          ? 0
          : Number(form.jumlah) || 0,

      status:
        form.status,
    };

    if (
      form.tahunTerbit !== "" &&
      form.tahunTerbit != null
    ) {
      payload.tahunTerbit =
        Number(form.tahunTerbit);
    }

    return payload;
  };

  /* =========================================================
     SAVE -> BE
  ========================================================= */

  const saveBook = async (form) => {
    try {
      setSaving(true);
      setFormError("");

      if (!form.kodeBuku.trim()) {
        setFormError(
          "Kode buku wajib diisi.",
        );
        return;
      }

      if (!form.judul.trim()) {
        setFormError(
          "Judul buku wajib diisi.",
        );
        return;
      }

      if (!form.penulis.trim()) {
        setFormError(
          "Penulis wajib diisi.",
        );
        return;
      }

      if (!form.kategori.trim()) {
        setFormError(
          "Kategori wajib diisi.",
        );
        return;
      }

      if (
        form.tipe === "EBOOK" &&
        !form.urlEbook.trim()
      ) {
        setFormError(
          "URL E-Book wajib diisi untuk tipe EBOOK.",
        );
        return;
      }

      const payload =
        buildPayload(form);

      if (modal === "add") {
        await createBuku(payload);
      } else {
        await updateBuku(
          activeBook.id,
          payload,
        );
      }

      await loadBooks();

      closeModal();
    } catch (err) {
      console.error(
        "Gagal menyimpan buku:",
        err,
      );

      setFormError(
        getErrorMessage(err),
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     DETAIL -> BE
  ========================================================= */

  const openDetail = async (book) => {
    setDetailBook(null);
    setDetailLoading(true);

    try {
      const result =
        await getBukuById(book.id);

      setDetailBook(
        normalizeBook(result),
      );
    } catch (err) {
      setError(
        getErrorMessage(err),
      );
    } finally {
      setDetailLoading(false);
    }
  };

  /* =========================================================
     DELETE -> BE
  ========================================================= */

  const confirmDelete = async () => {
    if (!deleteBook) return;

    try {
      setDeleting(true);
      setError("");

      await deleteBuku(
        deleteBook.id,
      );

      setDeleteBook(null);

      await loadBooks();
    } catch (err) {
      console.error(
        "Gagal menghapus buku:",
        err,
      );

      setError(
        getErrorMessage(err),
      );
    } finally {
      setDeleting(false);
    }
  };

  /* =========================================================
     RESET
  ========================================================= */

  const resetFilter = () => {
    setSearch("");
    setCategoryFilter("Semua");
    setTypeFilter("Semua");
    setStatusFilter("Semua");
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="theme-page flex min-h-screen">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1400px]">

            {/* HEADER */}

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
                    Kelola koleksi buku berdasarkan data perpustakaan sekolah
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
                    className={
                      loading
                        ? "animate-spin"
                        : ""
                    }
                  />

                  <span className="hidden sm:inline">
                    Refresh
                  </span>
                </button>

                <button
                  type="button"
                  onClick={resetFilter}
                  className={`theme-card theme-border theme-text-secondary flex h-10 items-center gap-2 rounded-lg border px-3.5 text-sm font-medium transition ${themeTextHover}`}
                >
                  <RefreshCw size={16} />

                  <span className="hidden sm:inline">
                    Reset
                  </span>
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

            {/* ERROR */}

            {error && (
              <div className="theme-border mb-5 flex items-start gap-3 rounded-xl border p-4">
                <AlertCircle
                  size={19}
                  className="theme-danger mt-0.5 shrink-0"
                />

                <div className="min-w-0 flex-1">
                  <p className="theme-text text-sm font-semibold">
                    Gagal memuat data
                  </p>

                  <p className="theme-text-secondary mt-1 text-sm">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setError("")
                  }
                  className="theme-text-muted"
                >
                  <X size={17} />
                </button>
              </div>
            )}

            {/* STATISTIC */}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={BookOpen}
                label="Judul Buku"
                value={totalJudul}
                type="blue"
              />

              <StatCard
                icon={Library}
                label="Total Eksemplar"
                value={totalStok}
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

            {/* FILTER */}

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
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Cari kode, judul buku, atau penulis..."
                  className="theme-input theme-border theme-text h-11 w-full rounded-lg border pl-10 pr-4 text-sm outline-none transition placeholder:text-[var(--color-text-placeholder)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]"
                />
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3 xl:flex xl:items-center">

                {/* CATEGORY */}

                <div className="relative xl:w-52">
                  <select
                    value={categoryFilter}
                    onChange={(event) =>
                      setCategoryFilter(
                        event.target.value,
                      )
                    }
                    className="theme-input theme-border theme-text h-10 w-full appearance-none rounded-lg border px-3.5 pr-9 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]"
                  >
                    <option value="Semua">
                      Semua Kategori
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={category}
                          value={category}
                        >
                          {category}
                        </option>
                      ),
                    )}
                  </select>

                  <ChevronDown
                    size={15}
                    className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                  />
                </div>

                {/* TYPE */}

                <div className="relative xl:w-44">
                  <select
                    value={typeFilter}
                    onChange={(event) =>
                      setTypeFilter(
                        event.target.value,
                      )
                    }
                    className="theme-input theme-border theme-text h-10 w-full appearance-none rounded-lg border px-3.5 pr-9 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]"
                  >
                    <option value="Semua">
                      Semua Tipe
                    </option>

                    <option value="FISIK">
                      Buku Fisik
                    </option>

                    <option value="EBOOK">
                      E-Book
                    </option>
                  </select>

                  <ChevronDown
                    size={15}
                    className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                  />
                </div>

                {/* STATUS */}

                <div className="relative xl:w-40">
                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(
                        event.target.value,
                      )
                    }
                    className="theme-input theme-border theme-text h-10 w-full appearance-none rounded-lg border px-3.5 pr-9 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]"
                  >
                    <option value="Semua">
                      Semua Status
                    </option>

                    <option value="aktif">
                      Aktif
                    </option>

                    <option value="nonaktif">
                      Nonaktif
                    </option>
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

            {/* TABLE */}

            <div
              className={`theme-card theme-border mt-5 overflow-hidden rounded-xl border ${themeCardShadow}`}
            >
              <div className="theme-border flex flex-col gap-1 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="theme-text text-sm font-bold">
                    Koleksi Buku
                  </h2>

                  <p className="theme-text-muted mt-0.5 text-xs">
                    Daftar seluruh koleksi buku perpustakaan
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
                        ISBN
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
                        <td
                          colSpan={7}
                          className="px-5 py-16 text-center"
                        >
                          <div className="flex items-center justify-center gap-2 theme-text-muted text-sm">
                            <Loader2
                              size={18}
                              className="animate-spin"
                            />

                            Memuat data buku...
                          </div>
                        </td>
                      </tr>
                    ) : filteredBooks.length > 0 ? (
                      filteredBooks.map(
                        (book) => (
                          <tr
                            key={book.id}
                            className={`transition ${themeTextHover}`}
                          >
                            {/* BOOK */}

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg ${themePrimarySoft} text-[var(--color-primary)]`}
                                >
                                  {book.coverUrl ? (
                                    <img
                                      src={
                                        book.coverUrl
                                      }
                                      alt={
                                        book.judul
                                      }
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <BookOpen
                                      size={19}
                                    />
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <p className="theme-text max-w-[280px] truncate text-sm font-semibold">
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
                                          {
                                            book.tahunTerbit
                                          }
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

                            {/* ISBN */}

                            <td className="px-4 py-4">
                              <span className="theme-text-secondary text-xs">
                                {book.isbn ||
                                  "-"}
                              </span>
                            </td>

                            {/* TYPE */}

                            <td className="px-4 py-4">
                              <TypeBadge
                                tipe={
                                  book.tipe
                                }
                              />
                            </td>

                            {/* CATEGORY */}

                            <td className="px-4 py-4">
                              <span className="theme-card-soft theme-border theme-text-secondary inline-flex rounded-md border px-2.5 py-1 text-xs font-medium">
                                {book.kategori ||
                                  "-"}
                              </span>
                            </td>

                            {/* STOCK */}

                            <td className="px-4 py-4">
                              <div className="min-w-[120px]">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="theme-text font-semibold">
                                    {
                                      book.jumlahTersedia
                                    }
                                  </span>

                                  <span className="theme-text-muted">
                                    /{" "}
                                    {
                                      book.jumlah
                                    }
                                  </span>
                                </div>

                                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]">
                                  <div
                                    className="h-full rounded-full bg-[var(--color-primary)]"
                                    style={{
                                      width:
                                        book.jumlah >
                                        0
                                          ? `${Math.min(
                                              100,
                                              (book.jumlahTersedia /
                                                book.jumlah) *
                                                100,
                                            )}%`
                                          : "0%",
                                    }}
                                  />
                                </div>

                                <p className="theme-text-muted mt-1 text-[10px]">
                                  {
                                    book.dipinjam
                                  }{" "}
                                  dipinjam
                                </p>
                              </div>
                            </td>

                            {/* STATUS */}

                            <td className="px-4 py-4">
                              <StatusBadge
                                status={
                                  book.status
                                }
                              />
                            </td>

                            {/* ACTION */}

                            <td className="px-5 py-4">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openDetail(
                                      book,
                                    )
                                  }
                                  title="Detail"
                                  className={`theme-text-muted flex h-8 w-8 items-center justify-center rounded-md transition ${themePrimaryHover} hover:text-[var(--color-primary)]`}
                                >
                                  <Eye
                                    size={16}
                                  />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    openEdit(
                                      book,
                                    )
                                  }
                                  title="Edit"
                                  className={`theme-text-muted flex h-8 w-8 items-center justify-center rounded-md transition ${themePrimaryHover} hover:text-[var(--color-primary)]`}
                                >
                                  <Pencil
                                    size={16}
                                  />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeleteBook(
                                      book,
                                    )
                                  }
                                  title="Hapus"
                                  className="theme-text-muted flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] theme-danger"
                                >
                                  <Trash2
                                    size={16}
                                  />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ),
                      )
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-5 py-16 text-center"
                        >
                          <div
                            className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${themePrimarySoft} text-[var(--color-primary)]`}
                          >
                            <Search size={20} />
                          </div>

                          <p className="theme-text mt-3 text-sm font-semibold">
                            Data buku tidak ditemukan
                          </p>

                          <p className="theme-text-muted mt-1 text-xs">
                            Belum ada data buku atau filter tidak menemukan hasil.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* FOOTER */}

              <div className="theme-border flex flex-col gap-2 border-t px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="theme-text-muted text-xs">
                  Menampilkan{" "}
                  <span className="theme-text-secondary font-medium">
                    {
                      filteredBooks.length
                    }
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
                    {totalStok}
                  </span>{" "}
                  eksemplar
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* =====================================================
          ADD / EDIT
      ===================================================== */}

      {modal && activeBook && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
          <div
            className={`theme-card theme-border max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border ${themeCardShadow}`}
          >
            <div className="theme-card sticky top-0 z-10 flex items-center justify-between border-b border-[var(--color-border-soft)] px-5 py-4 sm:px-6">
              <div>
                <h2 className="theme-text text-lg font-bold">
                  {modal === "add"
                    ? "Tambah Data Buku"
                    : "Edit Data Buku"}
                </h2>

                <p className="theme-text-muted mt-0.5 text-xs">
                  {modal === "add"
                    ? "Tambahkan koleksi buku baru"
                    : "Perbarui informasi buku"}
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
                editMode={
                  modal === "edit"
                }
                onCancel={closeModal}
                onSave={saveBook}
                saving={saving}
                error={formError}
              />
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          DETAIL
      ===================================================== */}

      {(detailBook || detailLoading) && (
        <DetailModal
          book={detailBook}
          loading={detailLoading}
          onClose={() =>
            setDetailBook(null)
          }
        />
      )}

      {/* =====================================================
          DELETE
      ===================================================== */}

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
                  akan dihapus dari daftar perpustakaan.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={deleting}
                onClick={() =>
                  setDeleteBook(null)
                }
                className={`theme-card theme-border theme-text-secondary h-10 rounded-lg border px-5 text-sm font-medium transition ${themeTextHover}`}
              >
                Batal
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="theme-danger flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--color-text)] px-5 text-sm font-semibold text-[var(--color-card)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting && (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                )}

                {deleting
                  ? "Menghapus..."
                  : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}