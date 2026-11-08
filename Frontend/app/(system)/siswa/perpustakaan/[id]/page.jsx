"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  BookOpenCheck,
  Loader2,
  MonitorPlay,
  AlertCircle,
  FileText,
  User,
  Info,
  ChevronRight,
  BookMarked,
} from "lucide-react";

import {
  getBuku,
  pinjamBuku,
} from "@/services/perpustakaan.service";

import { getSessionUser } from "@/lib/auth";

const themeCardShadow = "shadow-[0_8px_30px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";
const themePrimarySoft = "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";
const themePrimaryBorder = "border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]";
const themeNeutralSurface = "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";
const themeNeutralBorder = "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";
const themeDivider = "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

function unwrapValue(response) {
  if (response?.data !== undefined) return response.data;
  return response;
}

function toArray(response) {
  const data = unwrapValue(response);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.list)) return data.list;
  return [];
}

function asString(value, fallback = "") {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function getErrorMessage(error, fallback) {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  return error?.message || error?.error || fallback;
}

function getStoredUser() {
  return getSessionUser();
}

function getUserId(user) {
  if (!user) return "";
  const id = user?.userId || user?.id || user?.penggunaId || user?.siswaId || user?.siswa?.id || user?.data?.userId || user?.data?.id || user?.data?.penggunaId || user?.data?.siswaId || user?.data?.siswa?.id || "";
  return id ? String(id) : "";
}

function normalizeBook(item) {
  const raw = item || {};
  return {
    ...raw,
    id: raw?.id ?? raw?.bukuId ?? "",
    kodeBuku: raw?.kodeBuku ?? raw?.kode ?? "-",
    judul: raw?.judul ?? raw?.title ?? "Tanpa Judul",
    penulis: raw?.penulis ?? raw?.author ?? "-",
    penerbit: raw?.penerbit ?? "",
    tahunTerbit: raw?.tahunTerbit ?? "",
    isbn: raw?.isbn ?? "",
    tipe: asString(raw?.tipe || "FISIK").toUpperCase(),
    kategori: raw?.kategori ?? "Umum",
    deskripsi: raw?.deskripsi ?? "",
    coverUrl: raw?.coverUrl ?? "",
    urlEbook: raw?.urlEbook ?? "",
    jumlah: Number(raw?.jumlah ?? 0) || 0,
    jumlahTersedia: Number(raw?.jumlahTersedia ?? raw?.tersedia ?? raw?.jumlah ?? 0) || 0,
    status: asString(raw?.status || "aktif").toLowerCase(),
  };
}

export default function DetailBukuPage() {
  const router = useRouter();
  const { id } = useParams();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState("");
  const [relatedBooks, setRelatedBooks] = useState([]);

  useEffect(() => {
    const user = getStoredUser();
    setUserId(getUserId(user));
  }, []);

  useEffect(() => {
    async function fetchBook() {
      try {
        setLoading(true);
        setError("");
        const response = await getBuku();
        const books = toArray(response).map(normalizeBook);
        
        const found = books.find((b) => String(b.id) === String(id));
        
        if (found) {
          setBook(found);
          const related = books
            .filter((b) => b.kategori === found.kategori && String(b.id) !== String(id))
            .slice(0, 4);
          setRelatedBooks(related);
        } else {
          setError("Buku tidak ditemukan.");
        }
      } catch (err) {
        setError(getErrorMessage(err, "Gagal memuat detail buku."));
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchBook();
  }, [id]);

  const handleBorrow = async () => {
    if (!book?.id || !userId) {
      setError("Data siswa atau buku tidak lengkap.");
      return;
    }

    if (
      book.tipe === "EBOOK" ||
      book.status !== "aktif" ||
      Number(book.jumlahTersedia || 0) <= 0
    ) {
      setError("Buku tidak tersedia untuk dipinjam.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const tanggalJatuhTempo = new Date();
      tanggalJatuhTempo.setDate(tanggalJatuhTempo.getDate() + 7);
      const tahun = tanggalJatuhTempo.getFullYear();
      const bulan = String(tanggalJatuhTempo.getMonth() + 1).padStart(2, "0");
      const tanggal = String(tanggalJatuhTempo.getDate()).padStart(2, "0");
      const tanggalJatuhTempoString = `${tahun}-${bulan}-${tanggal}`;

      await pinjamBuku({
        bukuId: String(book.id),
        tanggalJatuhTempo: tanggalJatuhTempoString,
      });

      router.push("/siswa/perpustakaan");
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, "Gagal membuat transaksi peminjaman."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="theme-page min-h-screen w-full overflow-y-auto">
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8 2xl:px-12">
        
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${themeNeutralBorder} theme-card theme-text-muted transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]`}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">Katalog Perpustakaan</p>
              <h1 className="theme-text text-xl font-bold sm:text-2xl">Detail Buku</h1>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-500">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center">
            <Loader2 className="animate-spin text-[var(--color-primary)]" size={32} />
            <p className="mt-4 text-sm theme-text-muted">Memuat detail buku...</p>
          </div>
        ) : !book ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed theme-border">
            <AlertCircle className="mb-4 text-[var(--color-warning)]" size={48} />
            <h2 className="theme-text text-lg font-bold">Buku tidak ditemukan</h2>
            <p className="mt-2 text-sm theme-text-muted">Data buku yang Anda cari tidak tersedia atau telah dihapus.</p>
            <button onClick={() => router.push("/siswa/perpustakaan")} className="mt-6 rounded-xl bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110">
              Kembali ke Katalog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            
            <div className={`lg:col-span-2 theme-card ${themeNeutralBorder} ${themeCardShadow} overflow-hidden rounded-2xl border flex flex-col`}>
              <div className="p-6 sm:p-8 flex-1">
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
                  <div className={`mx-auto sm:mx-0 flex h-[280px] w-[200px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themePrimarySoft} shadow-sm`}>
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt={`Cover ${book.judul}`} className="h-full w-full object-cover" />
                    ) : (
                      <BookOpen size={64} className="text-[var(--color-primary)]" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 flex flex-col justify-center">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-md border ${themePrimaryBorder} ${themePrimarySoft} px-2.5 py-1 text-[10px] font-semibold text-[var(--color-primary)]`}>
                        {book.kodeBuku}
                      </span>
                      <span className={`rounded-md border ${themeNeutralBorder} ${themeNeutralSurface} px-2.5 py-1 text-[10px] font-semibold theme-text-secondary`}>
                        {book.tipe === "EBOOK" ? "E-Book" : "Buku Fisik"}
                      </span>
                      <span className={`rounded-md border ${themeNeutralBorder} ${themeNeutralSurface} px-2.5 py-1 text-[10px] font-semibold theme-text-secondary`}>
                        {book.kategori}
                      </span>
                    </div>

                    <h2 className="theme-text mt-4 text-2xl sm:text-3xl font-bold leading-tight">{book.judul}</h2>
                    <div className="mt-2 flex items-center gap-2 text-sm theme-text-secondary">
                      <User size={15} />
                      <span>{book.penulis || "Penulis belum tersedia"}</span>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <div className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-3`}>
                        <p className="theme-text-muted text-[10px]">Penerbit</p>
                        <p className="theme-text mt-1 text-xs font-semibold">{book.penerbit || "-"}</p>
                      </div>
                      <div className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-3`}>
                        <p className="theme-text-muted text-[10px]">Tahun Terbit</p>
                        <p className="theme-text mt-1 text-xs font-semibold">{book.tahunTerbit || "-"}</p>
                      </div>
                      <div className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-3`}>
                        <p className="theme-text-muted text-[10px]">ISBN</p>
                        <p className="theme-text mt-1 break-all text-xs font-semibold">{book.isbn || "-"}</p>
                      </div>
                      <div className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-3`}>
                        <p className="theme-text-muted text-[10px]">Ketersediaan</p>
                        <p className={`mt-1 text-xs font-semibold ${book.jumlahTersedia > 0 || book.tipe === "EBOOK" ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>
                          {book.tipe === "EBOOK" ? "Akses Digital" : `${book.jumlahTersedia} Eksemplar`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`mt-8 rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-5`}>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText size={16} className="text-[var(--color-primary)]" />
                    <p className="theme-text text-sm font-semibold">Deskripsi Buku</p>
                  </div>
                  <p className="theme-text-secondary text-sm leading-relaxed whitespace-pre-wrap">
                    {book.deskripsi || "Belum ada deskripsi untuk buku ini."}
                  </p>
                </div>
              </div>

              <div className={`flex flex-col-reverse gap-3 border-t ${themeDivider} bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] px-6 py-5 sm:flex-row sm:justify-end sm:px-8`}>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className={`theme-card theme-border theme-text-secondary flex h-11 items-center justify-center rounded-xl border px-6 text-sm font-semibold transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]`}
                >
                  Kembali
                </button>

                {book.tipe === "EBOOK" && book.urlEbook ? (
                  <a
                    href={book.urlEbook}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-8 text-sm font-semibold text-[var(--color-card)] transition hover:brightness-110"
                  >
                    <MonitorPlay size={17} /> Baca E-Book
                  </a>
                ) : (
                  <button
                    type="button"
                    disabled={!userId || book.status !== "aktif" || Number(book.jumlahTersedia || 0) <= 0 || saving}
                    onClick={handleBorrow}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-8 text-sm font-semibold text-[var(--color-card)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? <Loader2 size={17} className="animate-spin" /> : <BookOpenCheck size={17} />}
                    {saving ? "Memproses..." : Number(book.jumlahTersedia || 0) > 0 ? "Pinjam Buku" : "Stok Habis"}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className={`theme-card ${themeNeutralBorder} ${themeCardShadow} rounded-2xl border p-5 sm:p-6`}>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}>
                    <Info size={20} />
                  </div>
                  <div>
                    <h3 className="theme-text text-sm font-bold">Informasi Peminjaman</h3>
                    <p className="theme-text-muted text-xs">Ketentuan perpustakaan</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${themeNeutralSurface} text-[10px] font-bold theme-text-muted`}>1</div>
                    <div>
                      <p className="theme-text text-xs font-semibold">Durasi Peminjaman</p>
                      <p className="theme-text-muted mt-0.5 text-[11px]">Maksimal 7 hari sejak tanggal peminjaman.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${themeNeutralSurface} text-[10px] font-bold theme-text-muted`}>2</div>
                    <div>
                      <p className="theme-text text-xs font-semibold">Pengembalian</p>
                      <p className="theme-text-muted mt-0.5 text-[11px]">Kembalikan buku tepat waktu untuk menghindari denda.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${themeNeutralSurface} text-[10px] font-bold theme-text-muted`}>3</div>
                    <div>
                      <p className="theme-text text-xs font-semibold">Kondisi Buku</p>
                      <p className="theme-text-muted mt-0.5 text-[11px]">Jaga kondisi buku agar tetap layak dibaca oleh siswa lain.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`theme-card ${themeNeutralBorder} ${themeCardShadow} rounded-2xl border p-5 sm:p-6`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}>
                    <BookMarked size={20} />
                  </div>
                  <div>
                    <h3 className="theme-text text-sm font-bold">Rekomendasi Buku</h3>
                    <p className="theme-text-muted text-xs">Kategori {book.kategori}</p>
                  </div>
                </div>

                {relatedBooks.length === 0 ? (
                  <div className="rounded-xl border border-dashed theme-border px-4 py-6 text-center">
                    <p className="theme-text-muted text-xs">Belum ada buku lain di kategori ini.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {relatedBooks.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          router.push(`/siswa/perpustakaan/${b.id}`);
                          setBook(null);
                          setLoading(true);
                        }}
                        className={`group flex w-full items-center gap-3 rounded-xl border ${themeNeutralBorder} p-2 text-left transition hover:border-[var(--color-primary)] hover:bg-[color-mix(in_srgb,var(--color-primary)_4%,transparent)]`}
                      >
                        <div className={`flex h-12 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg ${themePrimarySoft} text-[var(--color-primary)]`}>
                          {b.coverUrl ? (
                            <img src={b.coverUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <BookOpen size={18} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="theme-text truncate text-xs font-semibold">{b.judul}</p>
                          <p className="theme-text-muted mt-0.5 truncate text-[10px]">{b.penulis}</p>
                        </div>
                        <ChevronRight size={14} className="theme-text-muted shrink-0 transition group-hover:text-[var(--color-primary)]" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}