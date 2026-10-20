
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  Plus,
  Loader2,
  AlertCircle,
  UserRound,
  CalendarDays,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  getBuku,
  pinjamBuku,
} from "@/services/perpustakaan.service";

/* =========================================================
   HELPERS
========================================================= */

function unwrapValue(response) {
  if (response?.data !== undefined) return response.data;
  return response;
}

function toArray(value) {
  const first = unwrapValue(value);

  if (Array.isArray(first)) return first;
  if (Array.isArray(first?.data)) return first.data;
  if (Array.isArray(first?.rows)) return first.rows;

  return [];
}

function asString(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function normalizeBook(item) {
  const raw = item || {};

  return {
    ...raw,
    id: raw?.id ?? raw?.bukuId ?? null,
    kodeBuku: raw?.kodeBuku ?? raw?.kode ?? "-",
    judul: raw?.judul ?? raw?.title ?? "Tanpa Judul",
    tipe: asString(raw?.tipe).toUpperCase(),
    status: asString(raw?.status).toLowerCase(),
    jumlah: Number(raw?.jumlah ?? 0) || 0,
    jumlahTersedia: Number(
      raw?.jumlahTersedia ?? raw?.tersedia ?? raw?.jumlah ?? 0
    ),
  };
}

function getErrorMessage(error, fallback) {
  if (!error) return fallback;
  if (typeof error === "string") return error;

  return error?.message || error?.error || fallback;
}

/* =========================================================
   PAGE
========================================================= */

export default function PinjamBukuPage() {
  const router = useRouter();

  const [books, setBooks] = useState([]);
  const [penggunaId, setPenggunaId] = useState("");
  const [bukuId, setBukuId] = useState("");
  const [tanggalJatuhTempo, setTanggalJatuhTempo] = useState("");
  const [catatan, setCatatan] = useState("");

  const [loadingBooks, setLoadingBooks] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* =========================================================
     LOAD BUKU
  ========================================================= */

  const loadBooks = async () => {
    try {
      setLoadingBooks(true);
      setError("");

      const response = await getBuku();

      setBooks(toArray(response).map(normalizeBook));
    } catch (err) {
      console.error("Gagal memuat data buku:", err);

      setError(
        getErrorMessage(err, "Gagal memuat data buku.")
      );
    } finally {
      setLoadingBooks(false);
    }
  };

  useEffect(() => {
    loadBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =========================================================
     BUKU TERSEDIA
  ========================================================= */

  const availableBooks = useMemo(
    () =>
      books.filter(
        (book) =>
          book?.id &&
          book?.status === "aktif" &&
          book?.tipe === "FISIK" &&
          Number(book?.jumlahTersedia || 0) > 0
      ),
    [books]
  );

  const selectedBook = useMemo(
    () => availableBooks.find((book) => book.id === bukuId) || null,
    [availableBooks, bukuId]
  );

  /* =========================================================
     SUBMIT PEMINJAMAN
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!penggunaId.trim()) {
      setError("ID pengguna wajib diisi.");
      return;
    }

    if (!bukuId) {
      setError("Buku wajib dipilih.");
      return;
    }

    if (!tanggalJatuhTempo) {
      setError("Tanggal jatuh tempo wajib diisi.");
      return;
    }

    // Format input date adalah YYYY-MM-DD.
    if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggalJatuhTempo)) {
      setError("Format tanggal jatuh tempo tidak valid.");
      return;
    }

    try {
      setSaving(true);

      await pinjamBuku({
        bukuId,
        tanggalJatuhTempo,
        catatan: catatan.trim(),
      });

      router.push("/admin/perpustakaan/peminjaman");
    } catch (err) {
      console.error("Gagal membuat peminjaman:", err);

      setError(
        getErrorMessage(
          err,
          "Gagal membuat transaksi peminjaman."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     STYLING
  ========================================================= */

  const inputClass =
    "theme-input theme-border theme-text h-11 w-full rounded-lg border px-3.5 text-sm outline-none transition placeholder:text-[var(--color-text-placeholder)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";

  const selectClass =
    "theme-input theme-border theme-text h-11 w-full appearance-none rounded-lg border px-3.5 pr-9 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";

  const labelClass =
    "theme-text-secondary mb-2 block text-xs font-semibold";

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0">
          <Header />
        </div>

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            {/* Tombol kembali */}
            <button
              type="button"
              onClick={() =>
                router.push("/admin/perpustakaan/peminjaman")
              }
              className="mb-5 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium theme-text-secondary transition hover:theme-card-soft"
            >
              <ArrowLeft size={17} />
              Kembali ke Peminjaman
            </button>

            {/* Header halaman */}
            <div className="mb-6 flex items-center gap-3">
              <div className="theme-primary-soft flex h-12 w-12 items-center justify-center rounded-xl">
                <BookOpen size={23} />
              </div>

              <div>
                <h1 className="theme-text text-2xl font-bold tracking-tight">
                  Pinjam Buku
                </h1>

                <p className="theme-text-secondary mt-0.5 text-sm">
                  Buat transaksi peminjaman buku fisik.
                </p>
              </div>
            </div>

            {/* Pesan error */}
            {error && (
              <div
                role="alert"
                className="theme-danger mb-5 flex items-start gap-3 rounded-xl border theme-border p-4"
              >
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0"
                />

                <p className="break-words text-sm">{error}</p>
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <section className="theme-card overflow-hidden rounded-2xl border theme-border shadow-sm">
                <div className="border-b theme-border px-5 py-4 sm:px-6">
                  <h2 className="theme-text text-sm font-semibold">
                    Data Peminjaman
                  </h2>

                  <p className="theme-text-muted mt-1 text-xs">
                    Lengkapi identitas peminjam, buku, dan tanggal
                    jatuh tempo.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 p-5 sm:p-6">
                  {/* ID Pengguna */}
                  <div>
                    <label
                      htmlFor="penggunaId"
                      className={labelClass}
                    >
                      ID Pengguna
                    </label>

                    <div className="relative">
                      <UserRound
                        size={17}
                        className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                      />

                      <input
                        id="penggunaId"
                        name="penggunaId"
                        type="text"
                        required
                        value={penggunaId}
                        onChange={(event) =>
                          setPenggunaId(event.target.value)
                        }
                        placeholder="Masukkan UUID pengguna/siswa"
                        className={`${inputClass} pl-10`}
                      />
                    </div>

                    <p className="theme-text-muted mt-1.5 text-[11px] leading-5">
                      Isi ID pengguna yang akan meminjam buku.
                    </p>
                  </div>

                  {/* Pilih buku */}
                  <div>
                    <label
                      htmlFor="bukuId"
                      className={labelClass}
                    >
                      Buku
                    </label>

                    <div className="relative">
                      <select
                        id="bukuId"
                        name="bukuId"
                        required
                        value={bukuId}
                        onChange={(event) =>
                          setBukuId(event.target.value)
                        }
                        disabled={loadingBooks}
                        className={selectClass}
                      >
                        <option value="">
                          {loadingBooks
                            ? "Memuat buku..."
                            : "Pilih buku fisik yang tersedia"}
                        </option>

                        {availableBooks.map((book) => (
                          <option
                            key={book.id}
                            value={book.id}
                          >
                            {book.kodeBuku} — {book.judul} (
                            {book.jumlahTersedia} tersedia)
                          </option>
                        ))}
                      </select>

                      <ChevronDown
                        size={15}
                        className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                      />
                    </div>

                    {!loadingBooks &&
                      availableBooks.length === 0 && (
                        <p className="theme-text-muted mt-1.5 text-[11px]">
                          Tidak ada buku fisik berstatus aktif dengan
                          stok tersedia.
                        </p>
                      )}
                  </div>

                  {/* Detail buku terpilih */}
                  {selectedBook && (
                    <div className="theme-card-soft rounded-xl border theme-border p-4">
                      <div className="flex items-start gap-3">
                        <div className="theme-card theme-border theme-primary-text flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border">
                          <BookOpen size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="theme-text text-sm font-semibold">
                            {selectedBook.judul}
                          </p>

                          <p className="theme-text-muted mt-0.5 text-xs">
                            {selectedBook.kodeBuku} •{" "}
                            {selectedBook.jumlahTersedia} tersedia
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tanggal jatuh tempo */}
                  <div>
                    <label
                      htmlFor="tanggalJatuhTempo"
                      className={labelClass}
                    >
                      Tanggal Jatuh Tempo
                    </label>

                    <div className="relative">
                      <CalendarDays
                        size={17}
                        className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                      />

                      <input
                        id="tanggalJatuhTempo"
                        name="tanggalJatuhTempo"
                        type="date"
                        required
                        value={tanggalJatuhTempo}
                        onChange={(event) =>
                          setTanggalJatuhTempo(event.target.value)
                        }
                        className={`${inputClass} pl-10`}
                      />
                    </div>

                    <p className="theme-text-muted mt-1.5 text-[11px] leading-5">
                      Wajib diisi sebelum transaksi dikirim ke backend.
                    </p>
                  </div>

                  {/* Catatan */}
                  <div>
                    <label
                      htmlFor="catatan"
                      className={labelClass}
                    >
                      Catatan (Opsional)
                    </label>

                    <textarea
                      id="catatan"
                      name="catatan"
                      value={catatan}
                      onChange={(event) =>
                        setCatatan(event.target.value)
                      }
                      rows={3}
                      maxLength={500}
                      placeholder="Tambahkan catatan jika diperlukan..."
                      className="theme-input theme-border theme-text w-full rounded-lg border px-3.5 py-3 text-sm outline-none transition placeholder:text-[var(--color-text-placeholder)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]"
                    />
                  </div>

                  <div className="theme-card-soft rounded-xl border theme-border p-4">
                    <p className="theme-text-secondary text-xs leading-5">
                      Tanggal jatuh tempo dikirim dengan format
                      YYYY-MM-DD. Status peminjaman dan perubahan stok
                      tetap dikelola oleh backend.
                    </p>
                  </div>
                </div>
              </section>

              {/* Tombol aksi */}
              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    router.push("/admin/perpustakaan/peminjaman")
                  }
                  disabled={saving}
                  className="theme-card theme-border theme-text-secondary h-10 rounded-lg border px-5 text-sm font-medium transition hover:theme-card-soft disabled:opacity-60"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    loadingBooks ||
                    availableBooks.length === 0
                  }
                  className="theme-primary inline-flex h-10 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Simpan Peminjaman
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
