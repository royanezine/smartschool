"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Pencil,
  Loader2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Archive,
  FileText,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { getBukuById } from "@/services/perpustakaan.service";

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

const formatTipe = (tipe) => (tipe === "EBOOK" ? "E-Book" : "Buku Fisik");
const formatStatus = (status) =>
  status ? status.charAt(0).toUpperCase() + status.slice(1) : "-";
const getDipinjam = (book) =>
  Math.max(0, Number(book?.jumlah ?? 0) - Number(book?.jumlahTersedia ?? 0));

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

function StatusBadge({ status }) {
  const active = status === "aktif";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border theme-border px-2.5 py-1 text-xs font-medium ${
        active
          ? "theme-success"
          : "theme-card-soft theme-text-muted"
      }`}
    >
      {active ? <CheckCircle2 size={13} /> : <Archive size={13} />}
      {formatStatus(status)}
    </span>
  );
}

export default function DetailBukuPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBook = useCallback(async () => {
    if (!id) {
      setError("ID buku tidak ditemukan.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await getBukuById(String(id));
      setBook(normalizeBook(result));
    } catch (err) {
      console.error("Gagal mengambil detail buku:", err);
      setError(
        err instanceof Error ? err.message : "Gagal mengambil detail buku."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadBook();
  }, [loadBook]);

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0">
          <Header />
        </div>

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => router.push("/admin/perpustakaan/buku-digital")}
              className="mb-5 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium theme-text-secondary transition hover:theme-card-soft"
            >
              <ArrowLeft size={17} />
              Kembali ke Data Buku
            </button>

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="theme-primary-soft flex h-12 w-12 items-center justify-center rounded-xl">
                  <BookOpen size={23} />
                </div>
                <div>
                  <h1 className="theme-text text-2xl font-bold tracking-tight">
                    Detail Data Buku
                  </h1>
                  <p className="theme-text-secondary mt-0.5 text-sm">
                    Informasi lengkap koleksi perpustakaan.
                  </p>
                </div>
              </div>

              {!loading && book && (
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/admin/perpustakaan/buku-digital/${id}/edit`)
                  }
                  className="theme-primary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:opacity-90"
                >
                  <Pencil size={17} />
                  Edit Buku
                </button>
              )}
            </div>

            {error && (
              <div className="theme-danger mb-5 flex items-start gap-3 rounded-xl border theme-border p-4">
                <AlertCircle size={19} className="mt-0.5 shrink-0" />
                <p className="flex-1 text-sm">{error}</p>
                <button
                  onClick={loadBook}
                  className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold"
                >
                  <RefreshCw size={14} />
                  Coba lagi
                </button>
              </div>
            )}

            {loading ? (
              <div className="theme-card flex min-h-64 items-center justify-center rounded-2xl border theme-border">
                <Loader2 size={20} className="animate-spin theme-primary-text" />
                <span className="ml-3 text-sm theme-text-muted">
                  Memuat detail buku...
                </span>
              </div>
            ) : book ? (
              <div className="space-y-5">
                <section className="theme-card overflow-hidden rounded-2xl border theme-border shadow-sm">
                  <div className="flex flex-col gap-4 p-5 sm:flex-row sm:p-6">
                    <div className="theme-primary-soft flex h-40 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl sm:h-36 sm:w-28">
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
                        <span className="theme-primary-soft rounded-md border theme-border px-2.5 py-1 text-xs font-semibold">
                          {book.kodeBuku || "-"}
                        </span>
                        <TypeBadge tipe={book.tipe} />
                        <StatusBadge status={book.status} />
                      </div>

                      <h2 className="theme-text mt-3 text-xl font-bold leading-7">
                        {book.judul || "-"}
                      </h2>
                      <p className="theme-text-secondary mt-1 text-sm">
                        {book.penulis || "-"}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="theme-card overflow-hidden rounded-2xl border theme-border shadow-sm">
                  <div className="border-b theme-border px-5 py-4 sm:px-6">
                    <h3 className="theme-text text-sm font-semibold">
                      Informasi Buku
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-4 p-5 sm:grid-cols-2 sm:p-6">
                    <Info label="ISBN" value={book.isbn} />
                    <Info label="Penerbit" value={book.penerbit} />
                    <Info label="Tahun Terbit" value={book.tahunTerbit} />
                    <Info label="Kategori" value={book.kategori} />
                    <Info label="Tipe" value={formatTipe(book.tipe)} />
                    <Info label="Status" value={formatStatus(book.status)} />
                  </div>
                </section>

                <section className="theme-card overflow-hidden rounded-2xl border theme-border shadow-sm">
                  <div className="border-b theme-border px-5 py-4 sm:px-6">
                    <h3 className="theme-text text-sm font-semibold">
                      Informasi Stok
                    </h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2 p-5 sm:p-6">
                    <div className="theme-card-soft rounded-xl border theme-border p-4 text-center">
                      <p className="theme-text-muted text-xs">Total</p>
                      <p className="theme-text mt-1 text-xl font-bold">
                        {book.jumlah}
                      </p>
                    </div>
                    <div className="theme-success rounded-xl border theme-border p-4 text-center">
                      <p className="text-xs opacity-80">Tersedia</p>
                      <p className="mt-1 text-xl font-bold">
                        {book.jumlahTersedia}
                      </p>
                    </div>
                    <div className="theme-warning rounded-xl border theme-border p-4 text-center">
                      <p className="text-xs opacity-80">Dipinjam</p>
                      <p className="mt-1 text-xl font-bold">
                        {getDipinjam(book)}
                      </p>
                    </div>
                  </div>
                </section>

                {book.deskripsi && (
                  <section className="theme-card overflow-hidden rounded-2xl border theme-border shadow-sm">
                    <div className="border-b theme-border px-5 py-4 sm:px-6">
                      <h3 className="theme-text text-sm font-semibold">
                        Deskripsi
                      </h3>
                    </div>
                    <p className="theme-text-secondary whitespace-pre-wrap p-5 text-sm leading-6 sm:p-6">
                      {book.deskripsi}
                    </p>
                  </section>
                )}

                {book.urlEbook && (
                  <section className="theme-card flex flex-col items-start justify-between gap-4 rounded-2xl border theme-border p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
                    <div>
                      <p className="theme-text-muted text-xs">URL E-Book</p>
                      <p className="theme-text-secondary mt-1 max-w-[500px] truncate text-sm">
                        {book.urlEbook}
                      </p>
                    </div>
                    <a
                      href={book.urlEbook}
                      target="_blank"
                      rel="noreferrer"
                      className="theme-primary inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition hover:opacity-90"
                    >
                      <ExternalLink size={15} />
                      Buka E-Book
                    </a>
                  </section>
                )}
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}