"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { apiFetch } from "@/lib/api";
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
  CalendarDays,
  X,
  CheckCircle2,
} from "lucide-react";

const themeCardShadow = "shadow-[0_8px_30px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";
const themePrimarySoft = "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";
const themePrimaryBorder = "border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]";
const themeNeutralSurface = "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";
const themeNeutralBorder = "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";
const themeDivider = "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

function unwrapData(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
}

function readResponse(response) {
  if (response?.success === false) {
    throw new Error(response?.message || "Permintaan gagal.");
  }
  return response;
}

function getErrorMessage(error) {
  if (error instanceof Error && error.message) return error.message;
  return "Terjadi kesalahan. Silakan coba kembali.";
}

function getBookStock(book) {
  const stock = Number(book?.jumlahTersedia ?? book?.jumlah ?? 0);
  return Number.isFinite(stock) ? stock : 0;
}

function getBookTypeLabel(tipe) {
  return String(tipe || "").toUpperCase() === "EBOOK" ? "E-Book" : "Buku Fisik";
}

function safeExternalUrl(value) {
  if (!value || typeof value !== "string") return "";
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return url.href;
  } catch {
    return "";
  }
}

export default function DetailBukuGuruPage() {
  const router = useRouter();
  const { id } = useParams();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // State untuk Modal Peminjaman
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [tanggalJatuhTempo, setTanggalJatuhTempo] = useState("");
  const [catatan, setCatatan] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    async function fetchBook() {
      try {
        setLoading(true);
        setError("");
        const response = await apiFetch("/perpustakaan/buku");
        const books = unwrapData(readResponse(response));
        
        const found = books.find((b) => String(b.id) === String(id));
        
        if (found) {
          setBook(found);
        } else {
          setError("Buku tidak ditemukan.");
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchBook();
  }, [id]);

  const handleBorrow = async (event) => {
    event.preventDefault();
    if (!book?.id) { setError("Buku tidak valid."); return; }
    if (!tanggalJatuhTempo) { setError("Tanggal jatuh tempo wajib diisi."); return; }
    
    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      const payload = { bukuId: book.id, tanggalJatuhTempo };
      if (catatan.trim()) payload.catatan = catatan.trim();

      const response = await apiFetch("/perpustakaan/peminjaman", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const result = readResponse(response);

      setShowBorrowModal(false);
      setTanggalJatuhTempo("");
      setCatatan("");
      setNotice(result?.message || "Buku berhasil dipinjam.");
      
      // Refresh halaman setelah 1.5 detik agar stok terupdate
      setTimeout(() => {
        router.refresh();
        router.push("/guru/perpustakaan");
      }, 1500);
      
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const openBorrowModal = () => {
    setTanggalJatuhTempo("");
    setCatatan("");
    setError("");
    setShowBorrowModal(true);
  };

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar active="perpustakaan" />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b theme-border">
          <Header user={{ name: "Guru", email: "", avatar: "GU" }} />
        </div>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
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

            {notice && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-success)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)] p-3 text-sm text-[var(--color-success)]">
                <CheckCircle2 size={18} className="shrink-0" />
                <span className="flex-1">{notice}</span>
              </div>
            )}

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
                <button onClick={() => router.push("/guru/perpustakaan")} className="mt-6 rounded-xl bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110">
                  Kembali ke Katalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                
                <div className={`lg:col-span-2 theme-card ${themeNeutralBorder} ${themeCardShadow} overflow-hidden rounded-2xl border flex flex-col`}>
                  <div className="p-6 sm:p-8 flex-1">
                    <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
                      <div className={`mx-auto sm:mx-0 flex h-[280px] w-[200px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themePrimarySoft} shadow-sm`}>
                        {safeExternalUrl(book.coverUrl) ? (
                          <img src={safeExternalUrl(book.coverUrl)} alt={`Cover ${book.judul}`} className="h-full w-full object-cover" />
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
                            {getBookTypeLabel(book.tipe)}
                          </span>
                          <span className={`rounded-md border ${themeNeutralBorder} ${themeNeutralSurface} px-2.5 py-1 text-[10px] font-semibold theme-text-secondary`}>
                            {book.kategori || "Umum"}
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
                            <p className={`mt-1 text-xs font-semibold ${getBookStock(book) > 0 || String(book.tipe).toUpperCase() === "EBOOK" ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>
                              {String(book.tipe).toUpperCase() === "EBOOK" ? "Akses Digital" : `${getBookStock(book)} Eksemplar`}
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

                    {String(book.tipe).toUpperCase() === "EBOOK" && safeExternalUrl(book.urlEbook) ? (
                      <a
                        href={safeExternalUrl(book.urlEbook)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-8 text-sm font-semibold text-[var(--color-card)] transition hover:brightness-110"
                      >
                        <MonitorPlay size={17} /> Baca E-Book
                      </a>
                    ) : String(book.tipe).toUpperCase() === "FISIK" ? (
                      <button
                        type="button"
                        onClick={openBorrowModal}
                        disabled={getBookStock(book) <= 0 || String(book.status).toLowerCase() !== "aktif"}
                        className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-8 text-sm font-semibold text-[var(--color-card)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <BookOpenCheck size={17} />
                        {getBookStock(book) > 0 ? "Pinjam Buku" : "Stok Habis"}
                      </button>
                    ) : null}
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
                </div>

              </div>
            )}
          </div>
        </main>
      </div>

      {/* MODAL PEMINJAMAN (Hanya muncul dari halaman detail ini) */}
      {showBorrowModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className={`w-full max-w-md overflow-hidden rounded-2xl theme-card ${themeCardShadow} shadow-2xl`}>
            <div className={`flex items-center justify-between border-b ${themeDivider} p-5`}>
              <div>
                <h2 className="theme-text text-lg font-bold">Form Peminjaman</h2>
                <p className="mt-1 text-xs theme-text-placeholder">Lengkapi tanggal pengembalian buku.</p>
              </div>
              <button type="button" onClick={() => setShowBorrowModal(false)} disabled={submitting} className="rounded-lg p-1.5 theme-text-muted hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:opacity-50">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleBorrow}>
              <div className="space-y-4 p-5">
                <div className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-4`}>
                  <p className="mb-1 text-xs font-bold uppercase theme-text-muted">Buku yang dipilih</p>
                  <p className="font-semibold theme-text">{book?.judul}</p>
                  <p className="mt-1 text-xs theme-text-muted">Kode: {book?.kodeBuku || "-"}</p>
                  <p className="mt-1 text-xs theme-text-muted">Stok tersedia: {getBookStock(book)}</p>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase theme-text-secondary">Tanggal Jatuh Tempo <span className="text-[var(--color-danger)]">*</span></label>
                  <input type="date" value={tanggalJatuhTempo} onChange={(event) => setTanggalJatuhTempo(event.target.value)} required className={`h-10 w-full rounded-xl border ${themeNeutralBorder} theme-input px-3 text-sm outline-none focus:border-[var(--color-primary)]`} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase theme-text-secondary">Catatan <span className="font-normal theme-text-placeholder">(Opsional)</span></label>
                  <textarea value={catatan} onChange={(event) => setCatatan(event.target.value)} rows={3} maxLength={1000} placeholder="Tambahkan catatan jika diperlukan..." className={`w-full resize-none rounded-xl border ${themeNeutralBorder} theme-input px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]`} />
                </div>
              </div>
              <div className={`flex flex-col-reverse gap-2 border-t ${themeDivider} bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] p-4 sm:flex-row sm:justify-end`}>
                <button type="button" onClick={() => setShowBorrowModal(false)} disabled={submitting} className={`h-9 w-full rounded-lg px-4 text-xs font-semibold theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:opacity-50 sm:w-auto`}>Batal</button>
                <button type="submit" disabled={submitting || !tanggalJatuhTempo} className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg theme-primary px-4 text-xs font-semibold text-[var(--color-card)] disabled:opacity-50 sm:w-auto">
                  {submitting && <Loader2 className="animate-spin" size={14} />} Konfirmasi Pinjam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}