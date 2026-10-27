"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  Save,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  getBukuById,
  updateBuku,
} from "@/services/perpustakaan.service";

const inputClass =
  "theme-input theme-border theme-text h-11 w-full rounded-lg border px-3.5 text-sm outline-none transition placeholder:text-[var(--color-text-placeholder)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";

const selectClass =
  "theme-input theme-border theme-text h-11 w-full appearance-none rounded-lg border px-3.5 pr-9 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";

const labelClass =
  "theme-text-secondary mb-2 block text-xs font-semibold";

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

export default function EditBukuPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      setForm(normalizeBook(result));
    } catch (err) {
      console.error("Gagal memuat detail buku:", err);
      setError(
        err instanceof Error ? err.message : "Gagal memuat detail buku."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadBook();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadBook]);

  const update = (key) => (event) => {
    const value = event.target.value;
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "tipe" && value === "EBOOK" ? { jumlah: 0 } : {}),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.kodeBuku?.trim()) return setError("Kode buku wajib diisi.");
    if (!form.judul?.trim()) return setError("Judul buku wajib diisi.");
    if (!form.penulis?.trim()) return setError("Penulis wajib diisi.");
    if (!form.kategori?.trim()) return setError("Kategori wajib diisi.");
    if (form.tipe === "EBOOK" && !form.urlEbook?.trim())
      return setError("URL E-Book wajib diisi untuk tipe E-Book.");

    try {
      setSaving(true);
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
        jumlah: form.tipe === "EBOOK" ? 0 : Number(form.jumlah || 0),
        status: form.status || "aktif",
      };

      if (form.tahunTerbit !== "" && form.tahunTerbit != null) {
        payload.tahunTerbit = Number(form.tahunTerbit);
      }

      await updateBuku(String(id), payload);
      router.push("/admin/perpustakaan/buku-digital");
    } catch (err) {
      console.error("Gagal menyimpan buku:", err);
      setError(
        err instanceof Error ? err.message : "Gagal menyimpan buku."
      );
    } finally {
      setSaving(false);
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
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => router.push("/admin/perpustakaan/buku-digital")}
              className="mb-5 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium theme-text-secondary transition hover:theme-card-soft"
            >
              <ArrowLeft size={17} />
              Kembali ke Data Buku
            </button>

            <div className="mb-6 flex items-center gap-3">
              <div className="theme-primary-soft flex h-12 w-12 items-center justify-center rounded-xl">
                <BookOpen size={23} />
              </div>
              <div>
                <h1 className="theme-text text-2xl font-bold tracking-tight">
                  Edit Data Buku
                </h1>
                <p className="theme-text-secondary mt-0.5 text-sm">
                  Perbarui informasi koleksi buku perpustakaan.
                </p>
              </div>
            </div>

            {error && (
              <div className="theme-danger mb-5 flex items-start gap-3 rounded-xl border theme-border p-4">
                <AlertCircle size={19} className="mt-0.5 shrink-0" />
                <p className="flex-1 text-sm">{error}</p>
                {!loading && (
                  <button
                    onClick={loadBook}
                    className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold"
                  >
                    <RefreshCw size={14} />
                    Coba lagi
                  </button>
                )}
              </div>
            )}

            {loading ? (
              <div className="theme-card flex min-h-64 items-center justify-center rounded-2xl border theme-border">
                <Loader2
                  size={20}
                  className="animate-spin theme-primary-text"
                />
                <span className="ml-3 text-sm theme-text-muted">
                  Memuat data buku...
                </span>
              </div>
            ) : form ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <section className="theme-card overflow-hidden rounded-2xl border theme-border shadow-sm">
                  <div className="border-b theme-border px-5 py-4 sm:px-6">
                    <h2 className="theme-text text-sm font-semibold">
                      Informasi Buku
                    </h2>
                    <p className="theme-text-muted mt-1 text-xs">
                      Data utama identitas buku.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
                    <div>
                      <label className={labelClass}>Kode Buku *</label>
                      <input
                        required
                        value={form.kodeBuku}
                        onChange={update("kodeBuku")}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>ISBN</label>
                      <input
                        value={form.isbn}
                        onChange={update("isbn")}
                        className={inputClass}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Judul Buku *</label>
                      <input
                        required
                        value={form.judul}
                        onChange={update("judul")}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Penulis *</label>
                      <input
                        required
                        value={form.penulis}
                        onChange={update("penulis")}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Penerbit</label>
                      <input
                        value={form.penerbit}
                        onChange={update("penerbit")}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Tahun Terbit</label>
                      <input
                        type="number"
                        min="0"
                        value={form.tahunTerbit}
                        onChange={update("tahunTerbit")}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Tipe *</label>
                      <div className="relative">
                        <select
                          required
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
                      <label className={labelClass}>Kategori *</label>
                      <input
                        required
                        value={form.kategori}
                        onChange={update("kategori")}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Jumlah Eksemplar</label>
                      <input
                        type="number"
                        min="0"
                        disabled={form.tipe === "EBOOK"}
                        value={form.tipe === "EBOOK" ? 0 : form.jumlah ?? 0}
                        onChange={update("jumlah")}
                        className={`${inputClass} ${
                          form.tipe === "EBOOK"
                            ? "cursor-not-allowed opacity-60"
                            : ""
                        }`}
                      />
                      <p className="theme-text-muted mt-1.5 text-[11px]">
                        {form.tipe === "EBOOK"
                          ? "Untuk E-Book, BE otomatis menetapkan jumlah menjadi 0."
                          : "Jumlah tersedia dihitung otomatis oleh BE berdasarkan peminjaman."}
                      </p>
                    </div>
                    <div>
                      <label className={labelClass}>Status</label>
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
                </section>

                <section className="theme-card overflow-hidden rounded-2xl border theme-border shadow-sm">
                  <div className="border-b theme-border px-5 py-4 sm:px-6">
                    <h2 className="theme-text text-sm font-semibold">
                      Media & Deskripsi
                    </h2>
                    <p className="theme-text-muted mt-1 text-xs">
                      Cover, URL e-book, dan deskripsi buku.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-5 p-5 sm:p-6">
                    <div>
                      <label className={labelClass}>
                        URL E-Book{form.tipe === "EBOOK" ? " *" : ""}
                      </label>
                      <input
                        type="url"
                        required={form.tipe === "EBOOK"}
                        value={form.urlEbook}
                        onChange={update("urlEbook")}
                        placeholder="https://..."
                        className={inputClass}
                      />
                      <p className="theme-text-muted mt-1.5 text-[11px]">
                        Wajib diisi jika tipe buku adalah E-Book.
                      </p>
                    </div>
                    <div>
                      <label className={labelClass}>Cover URL</label>
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
                        rows={4}
                        className="theme-input theme-border theme-text w-full resize-none rounded-lg border px-3.5 py-3 text-sm outline-none transition placeholder:text-[var(--color-text-placeholder)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]"
                      />
                    </div>
                  </div>
                </section>

                <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => router.push("/admin/perpustakaan/buku-digital")}
                    disabled={saving}
                    className="theme-card theme-border theme-text-secondary h-10 rounded-lg border px-5 text-sm font-medium transition hover:theme-card-soft"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="theme-primary inline-flex h-10 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Simpan Perubahan
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}