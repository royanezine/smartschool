"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ExternalLink,
  Filter,
  Library,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from "lucide-react";

import { getBuku } from "@/services/perpustakaan.service";

/* =========================================================
   THEME HELPERS
========================================================= */

const themeCardShadow =
  "shadow-[0_8px_30px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";

const themeCardHoverShadow =
  "hover:shadow-[0_18px_45px_color-mix(in_srgb,var(--color-primary)_12%,transparent)]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";

const themePrimarySoftHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";

const themePrimaryBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";

/* =========================================================
   HELPERS
========================================================= */

function unwrapValue(response) {
  if (response?.data !== undefined) {
    return response.data;
  }

  return response;
}

function toArray(response) {
  const data = unwrapValue(response);

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.rows)) {
    return data.rows;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.list)) {
    return data.list;
  }

  return [];
}

function asString(value, fallback = "") {
  if (value === null || value === undefined) {
    return fallback;
  }

  return String(value);
}

function getErrorMessage(error, fallback) {
  if (!error) {
    return fallback;
  }

  if (typeof error === "string") {
    return error;
  }

  return (
    error?.message ||
    error?.error ||
    error?.response?.data?.message ||
    fallback
  );
}

function normalizeBook(item) {
  const raw = item || {};

  return {
    ...raw,

    id:
      raw?.id ??
      raw?.bukuId ??
      "",

    kodeBuku:
      raw?.kodeBuku ??
      raw?.kode ??
      "-",

    judul:
      raw?.judul ??
      raw?.title ??
      "Tanpa Judul",

    penulis:
      raw?.penulis ??
      raw?.author ??
      "-",

    penerbit:
      raw?.penerbit ??
      "",

    tahunTerbit:
      raw?.tahunTerbit ??
      "",

    isbn:
      raw?.isbn ??
      "",

    tipe:
      asString(
        raw?.tipe ||
        raw?.type ||
        "FISIK",
      ).toUpperCase(),

    kategori:
      raw?.kategori ??
      "Umum",

    deskripsi:
      raw?.deskripsi ??
      raw?.description ??
      "",

    coverUrl:
      raw?.coverUrl ??
      raw?.cover ??
      raw?.gambar ??
      "",

    urlEbook:
      raw?.urlEbook ??
      raw?.ebookUrl ??
      raw?.url ??
      "",

    jumlah:
      Number(
        raw?.jumlah ??
        0,
      ) || 0,

    jumlahTersedia:
      Number(
        raw?.jumlahTersedia ??
        raw?.tersedia ??
        raw?.jumlah ??
        0,
      ) || 0,

    status:
      asString(
        raw?.status ||
        "aktif",
      ).toLowerCase(),

    dibuatPada:
      raw?.dibuatPada ??
      raw?.createdAt ??
      raw?.created_at ??
      null,
  };
}

function formatYear(value) {
  if (!value) {
    return "-";
  }

  return String(value);
}

function getCategories(books) {
  const values = books
    .map((book) =>
      asString(
        book.kategori,
        "Umum",
      ).trim(),
    )
    .filter(Boolean);

  return Array.from(
    new Set(values),
  ).sort((a, b) =>
    a.localeCompare(
      b,
      "id-ID",
      {
        sensitivity: "base",
      },
    ),
  );
}

/* =========================================================
   BOOK CARD
========================================================= */

function DigitalBookCard({ book }) {
  const hasEbookUrl =
    Boolean(book.urlEbook);

  return (
    <article
      className={`group overflow-hidden rounded-2xl border ${themeNeutralBorder} theme-card ${themeCardShadow} ${themeCardHoverShadow} transition-all duration-300 hover:-translate-y-1`}
    >
      {/* COVER */}

      <div className="relative flex h-56 items-center justify-center overflow-hidden bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={`Cover ${book.judul}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center ${themePrimarySoft}`}
          >
            <BookOpen
              size={52}
              className="text-[var(--color-primary)]"
            />
          </div>
        )}

        <div className="absolute left-3 top-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border ${themePrimaryBorder} ${themePrimarySoft} px-2.5 py-1.5 text-[10px] font-bold text-[var(--color-primary)] backdrop-blur-md`}
          >
            <Library size={11} />
            E-Book
          </span>
        </div>

        {book.status !== "aktif" && (
          <div className="absolute right-3 top-3">
            <span className="inline-flex rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-[10px] font-bold text-red-500 backdrop-blur-md">
              Tidak aktif
            </span>
          </div>
        )}
      </div>

      {/* CONTENT */}

      <div className="p-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`rounded-md border ${themePrimaryBorder} ${themePrimarySoft} px-2 py-1 text-[9px] font-semibold text-[var(--color-primary)]`}
          >
            {book.kategori}
          </span>

          {book.tahunTerbit && (
            <span className="rounded-md border theme-border-soft bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] px-2 py-1 text-[9px] font-semibold theme-text-muted">
              {formatYear(book.tahunTerbit)}
            </span>
          )}
        </div>

        <h2 className="theme-text mt-3 line-clamp-2 text-base font-bold leading-6">
          {book.judul}
        </h2>

        <p className="theme-text-secondary mt-1.5 line-clamp-1 text-xs">
          {book.penulis}
        </p>

        <p className="theme-text-muted mt-1 text-[10px]">
          Kode: {book.kodeBuku}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div
            className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-3`}
          >
            <p className="theme-text-muted text-[10px]">
              Penerbit
            </p>

            <p className="theme-text mt-1 line-clamp-1 text-xs font-semibold">
              {book.penerbit || "-"}
            </p>
          </div>

          <div
            className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-3`}
          >
            <p className="theme-text-muted text-[10px]">
              ISBN
            </p>

            <p className="theme-text mt-1 line-clamp-1 text-xs font-semibold">
              {book.isbn || "-"}
            </p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Link
            href={`/siswa/perpustakaan/buku-digital/${book.id}`}
            className={`inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border ${themeNeutralBorder} theme-card theme-text-secondary px-3 text-xs font-semibold transition ${themePrimarySoftHover} hover:text-[var(--color-primary)]`}
          >
            Detail
            <ArrowRight size={14} />
          </Link>

          {hasEbookUrl ? (
            <a
              href={book.urlEbook}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-3 text-xs font-semibold text-[var(--color-card)] transition hover:brightness-110"
            >
              Baca
              <ExternalLink size={14} />
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex h-10 flex-1 cursor-not-allowed items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] px-3 text-xs font-semibold theme-text-muted"
            >
              Belum tersedia
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function BukuDigitalSiswaPage() {
  const [mounted, setMounted] =
    useState(false);

  const [books, setBooks] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("Semua");

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadBooks = async (
    showRefresh = false,
  ) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      /*
       * Backend:
       * GET /api/perpustakaan/buku
       *
       * Filter tipe dikirim ke service.
       * Jika service belum meneruskan parameter tipe,
       * halaman tetap melakukan filter EBOOK di frontend.
       */

      const response =
        await getBuku({
          tipe: "EBOOK",
        });

      const normalized =
        toArray(response)
          .map(normalizeBook)
          .filter(
            (book) =>
              book.tipe ===
              "EBOOK",
          );

      setBooks(normalized);
    } catch (err) {
      setBooks([]);

      setError(
        getErrorMessage(
          err,
          "Gagal mengambil data buku digital dari server.",
        ),
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const categories = useMemo(
    () =>
      getCategories(
        books,
      ),
    [books],
  );

  const filteredBooks =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return books.filter(
        (book) => {
          const matchesSearch =
            !query ||
            book.judul
              .toLowerCase()
              .includes(query) ||
            book.penulis
              .toLowerCase()
              .includes(query) ||
            book.kodeBuku
              .toLowerCase()
              .includes(query) ||
            book.isbn
              .toLowerCase()
              .includes(query);

          const matchesCategory =
            categoryFilter ===
              "Semua" ||
            book.kategori ===
              categoryFilter;

          return (
            matchesSearch &&
            matchesCategory
          );
        },
      );
    }, [
      books,
      search,
      categoryFilter,
    ]);

  const activeBooks =
    useMemo(
      () =>
        books.filter(
          (book) =>
            book.status ===
            "aktif",
        ).length,
      [books],
    );

  const availableReaderBooks =
    useMemo(
      () =>
        books.filter(
          (book) =>
            Boolean(
              book.urlEbook,
            ) &&
            book.status ===
              "aktif",
        ).length,
      [books],
    );

  const resetFilter = () => {
    setSearch("");
    setCategoryFilter(
      "Semua",
    );
  };

  return (
    <div className="theme-page min-h-full w-full">
      <div
        className={`mx-auto w-full max-w-[1600px] space-y-6 p-4 transition-all duration-700 sm:p-6 lg:p-8 ${
          mounted
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0"
        }`}
      >
        {/* =====================================================
            HERO
        ====================================================== */}

        <section
          className={`relative overflow-hidden rounded-[28px] border ${themePrimaryBorder} ${themeCardShadow} bg-[color-mix(in_srgb,var(--color-primary)_10%,var(--color-card))]`}
        >
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_18%,transparent)] blur-3xl" />

          <div className="absolute -bottom-36 left-[35%] h-80 w-80 rounded-full bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)] blur-3xl" />

          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(color-mix(in srgb, var(--color-text) 35%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--color-text) 35%, transparent) 1px, transparent 1px)",
              backgroundSize:
                "34px 34px",
            }}
          />

          <div className="relative grid gap-8 px-5 py-7 sm:px-7 sm:py-8 lg:grid-cols-[1fr_360px] lg:px-10 lg:py-10">
            <div>
              <div
                className={`mb-4 inline-flex items-center gap-2 rounded-full border ${themePrimaryBorder} ${themePrimarySoft} px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)]`}
              >
                <Sparkles
                  size={13}
                />
                Perpustakaan Digital
              </div>

              <h1 className="theme-text max-w-3xl text-2xl font-bold tracking-tight sm:text-3xl lg:text-[38px] lg:leading-tight">
                Baca buku digital kapan saja.
              </h1>

              <p className="theme-text-secondary mt-3 max-w-2xl text-sm leading-6 sm:text-[15px]">
                Jelajahi koleksi e-book sekolah yang
                tersedia dari backend SmartSchool. Cari
                berdasarkan judul, penulis, kode buku,
                atau kategori.
              </p>
            </div>

            <div
              className={`rounded-2xl border ${themePrimaryBorder} ${themePrimarySoft} p-5 backdrop-blur-md`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="theme-text-muted text-xs font-medium">
                    Koleksi digital
                  </p>

                  <p className="theme-text mt-1 text-3xl font-bold">
                    {books.length}
                  </p>

                  <p className="theme-text-muted mt-1 text-xs">
                    E-book dari katalog sekolah
                  </p>
                </div>

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}
                >
                  <BookOpen
                    size={21}
                  />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div
                  className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-3.5`}
                >
                  <p className="theme-text-muted text-[11px]">
                    Aktif
                  </p>

                  <p className="theme-text mt-1 text-xl font-bold">
                    {activeBooks}
                  </p>
                </div>

                <div
                  className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-3.5`}
                >
                  <p className="theme-text-muted text-[11px]">
                    Bisa dibaca
                  </p>

                  <p className="theme-text mt-1 text-xl font-bold">
                    {availableReaderBooks}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
              <RefreshCw
                size={17}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-red-500">
                Gagal memuat buku digital
              </p>

              <p className="mt-1 text-xs leading-5 text-red-500/80">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                loadBooks(true)
              }
              disabled={
                loading ||
                refreshing
              }
              className="shrink-0 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-500/15 disabled:opacity-60"
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* =====================================================
            FILTER
        ====================================================== */}

        <section
          className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
        >
          <div
            className={`border-b ${themeDivider} px-5 py-5 sm:px-6`}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                  Koleksi digital
                </p>

                <h2 className="theme-text mt-1 text-lg font-bold">
                  Buku Digital
                </h2>

                <p className="theme-text-muted mt-1 text-sm">
                  Semua data diambil dari katalog
                  perpustakaan sekolah.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  loadBooks(true)
                }
                disabled={
                  loading ||
                  refreshing
                }
                className={`theme-card theme-border theme-text-secondary inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-3.5 text-sm font-medium transition ${themePrimarySoftHover} disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <RefreshCw
                  size={15}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />
                Refresh
              </button>
            </div>

            <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
              <div className="relative">
                <Search
                  size={17}
                  className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target
                        .value,
                    )
                  }
                  placeholder="Cari judul, penulis, kode buku, atau ISBN..."
                  className={`theme-input theme-border theme-text ${themeFocus} h-11 w-full rounded-lg border pl-10 pr-4 text-sm outline-none transition placeholder:text-[var(--color-text-placeholder)]`}
                />
              </div>

              <div className="relative">
                <Filter
                  size={15}
                  className="theme-text-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                />

                <select
                  value={
                    categoryFilter
                  }
                  onChange={(
                    event,
                  ) =>
                    setCategoryFilter(
                      event.target
                        .value,
                    )
                  }
                  className={`theme-input theme-border theme-text ${themeFocus} h-11 w-full appearance-none rounded-lg border pl-9 pr-10 text-sm outline-none lg:min-w-[190px]`}
                >
                  <option value="Semua">
                    Semua Kategori
                  </option>

                  {categories.map(
                    (
                      category,
                    ) => (
                      <option
                        key={
                          category
                        }
                        value={
                          category
                        }
                      >
                        {
                          category
                        }
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="theme-text-muted text-xs">
                {filteredBooks.length} buku digital ditemukan
              </p>

              {(search ||
                categoryFilter !==
                  "Semua") && (
                <button
                  type="button"
                  onClick={
                    resetFilter
                  }
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] transition hover:opacity-80"
                >
                  <X
                    size={13}
                  />
                  Reset filter
                </button>
              )}
            </div>
          </div>

          {/* ===================================================
              BOOK GRID
          ==================================================== */}

          <div className="p-5 sm:p-6">
            {loading ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full ${themePrimarySoft} text-[var(--color-primary)]`}
                >
                  <Loader2
                    size={24}
                    className="animate-spin"
                  />
                </div>

                <p className="theme-text mt-4 text-sm font-semibold">
                  Memuat buku digital...
                </p>

                <p className="theme-text-muted mt-1 text-xs">
                  Mengambil katalog e-book dari server.
                </p>
              </div>
            ) : filteredBooks.length ===
              0 ? (
              <div
                className={`flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed ${themeNeutralBorder} ${themeNeutralSurface} px-5 text-center`}
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full ${themePrimarySoft} text-[var(--color-primary)]`}
                >
                  <BookOpen
                    size={24}
                  />
                </div>

                <p className="theme-text mt-4 text-sm font-semibold">
                  Tidak ada buku digital
                </p>

                <p className="theme-text-muted mt-1 max-w-md text-xs leading-5">
                  Belum ada e-book yang sesuai
                  dengan pencarian atau kategori
                  yang dipilih.
                </p>

                {(search ||
                  categoryFilter !==
                    "Semua") && (
                  <button
                    type="button"
                    onClick={
                      resetFilter
                    }
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)]"
                  >
                    Reset filter
                    <X
                      size={13}
                    />
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredBooks.map(
                  (book) => (
                    <DigitalBookCard
                      key={String(
                        book.id,
                      )}
                      book={book}
                    />
                  ),
                )}
              </div>
            )}
          </div>
        </section>

        {/* =====================================================
            INFORMATION
        ====================================================== */}

        <section className="grid gap-5 lg:grid-cols-3">
          <div
            className={`theme-card rounded-2xl border ${themeNeutralBorder} ${themeCardShadow} p-5`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}
              >
                <BookOpen
                  size={19}
                />
              </div>

              <div>
                <h3 className="theme-text text-sm font-bold">
                  Koleksi E-Book
                </h3>

                <p className="theme-text-muted mt-1 text-xs leading-5">
                  Daftar buku digital mengikuti data
                  katalog yang tersimpan di backend
                  perpustakaan sekolah.
                </p>
              </div>
            </div>
          </div>

          <div
            className={`theme-card rounded-2xl border ${themeNeutralBorder} ${themeCardShadow} p-5`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}
              >
                <ExternalLink
                  size={19}
                />
              </div>

              <div>
                <h3 className="theme-text text-sm font-bold">
                  Akses Buku
                </h3>

                <p className="theme-text-muted mt-1 text-xs leading-5">
                  Tombol baca akan tersedia apabila data
                  buku memiliki URL e-book dari backend.
                </p>
              </div>
            </div>
          </div>

          <div
            className={`theme-card rounded-2xl border ${themeNeutralBorder} ${themeCardShadow} p-5`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}
              >
                <CalendarDays
                  size={19}
                />
              </div>

              <div>
                <h3 className="theme-text text-sm font-bold">
                  Data Real-Time
                </h3>

                <p className="theme-text-muted mt-1 text-xs leading-5">
                  Gunakan tombol refresh untuk mengambil
                  katalog terbaru dari server.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <div
          className={`flex flex-col gap-3 border-t ${themeDivider} py-5 text-xs theme-text-muted sm:flex-row sm:items-center sm:justify-between`}
        >
          <div className="flex items-center gap-2">
            <Library size={15} />

            <span>
              SmartSchool · Buku Digital Siswa
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span>
              {books.length} e-book
            </span>

            <span>
              {activeBooks} aktif
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}