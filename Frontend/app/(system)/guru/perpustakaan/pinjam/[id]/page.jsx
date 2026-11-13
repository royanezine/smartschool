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
  AlertCircle,
  CheckCircle2,
  CalendarDays,
  User,
  Info,
  FileText,
  ShieldCheck,
  Clock3,
  ChevronRight,
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

export default function PinjamBukuGuruPage() {
  const router = useRouter();
  const { id } = useParams();

  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [tanggalJatuhTempo, setTanggalJatuhTempo] = useState("");
  const [catatan, setCatatan] = useState("");

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
          
          // Mengambil rekomendasi buku lain dengan kategori yang sama
          const related = books
            .filter((b) => b.kategori === found.kategori && String(b.id) !== String(id))
            .slice(0, 3);
          setRelatedBooks(related);
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

      setNotice(result?.message || "Buku berhasil dipinjam.");
      
      setTimeout(() => {
        router.push("/guru/perpustakaan");
        router.refresh();
      }, 1500);
      
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar active="perpustakaan" />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b theme-border">
          <Header user={{ name: "Guru", email: "", avatar: "GU" }} />
        </div>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          {/* Konten menggunakan w-full agar melebar saat zoom out */}
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
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">Form Peminjaman</p>
                  <h1 className="theme-text text-xl font-bold sm:text-2xl">Pinjam Buku</h1>
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
                <p className="mt-4 text-sm theme-text-muted">Memuat data buku...</p>
              </div>
            ) : !book ? (
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed theme-border">
                <AlertCircle className="mb-4 text-[var(--color-warning)]" size={48} />
                <h2 className="theme-text text-lg font-bold">Buku tidak ditemukan</h2>
                <p className="mt-2 text-sm theme-text-muted">Data buku yang Anda cari tidak tersedia.</p>
                <button onClick={() => router.push("/guru/perpustakaan")} className="mt-6 rounded-xl bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110">
                  Kembali ke Katalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 2xl:grid-cols-4">
                
                {/* KOLOM KIRI (FORM PEMINJAMAN & INFO BUKU) */}
                <div className="lg:col-span-2 2xl:col-span-3 space-y-6">
                  <form onSubmit={handleBorrow} className={`theme-card ${themeNeutralBorder} ${themeCardShadow} overflow-hidden rounded-2xl border`}>
                    
                    <div className={`p-6 sm:p-8 border-b ${themeDivider}`}>
                      <div className="flex flex-col sm:flex-row gap-6">
                        <div className={`mx-auto sm:mx-0 flex h-[180px] w-[130px] shrink-0 items-center justify-center overflow-hidden rounded-xl border ${themeNeutralBorder} ${themePrimarySoft}`}>
                          {safeExternalUrl(book.coverUrl) ? (
                            <img src={safeExternalUrl(book.coverUrl)} alt={`Cover ${book.judul}`} className="h-full w-full object-cover" />
                          ) : (
                            <BookOpen size={40} className="text-[var(--color-primary)]" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1 flex flex-col justify-center">
                          <div className="flex flex-wrap gap-2 mb-2">
                            <span className={`rounded-md border ${themePrimaryBorder} ${themePrimarySoft} px-2 py-0.5 text-[10px] font-semibold text-[var(--color-primary)]`}>
                              {book.kodeBuku}
                            </span>
                            <span className={`rounded-md border ${themeNeutralBorder} ${themeNeutralSurface} px-2 py-0.5 text-[10px] font-semibold theme-text-secondary`}>
                              {book.kategori || "Umum"}
                            </span>
                          </div>
                          <h2 className="theme-text text-xl font-bold leading-tight">{book.judul}</h2>
                          <div className="mt-2 flex items-center gap-2 text-sm theme-text-secondary">
                            <User size={15} />
                            <span>{book.penulis || "Penulis belum tersedia"}</span>
                          </div>
                          <div className="mt-4 grid grid-cols-2 gap-3">
                            <div className={`rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} p-2`}>
                              <p className="text-[10px] theme-text-muted">Penerbit</p>
                              <p className="theme-text mt-1 text-xs font-semibold truncate">{book.penerbit || "-"}</p>
                            </div>
                            <div className={`rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} p-2`}>
                              <p className="text-[10px] theme-text-muted">Stok Tersedia</p>
                              <p className="mt-1 text-xs font-semibold text-[var(--color-success)]">{getBookStock(book)} Buku</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 sm:p-8 space-y-5">
                      <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase theme-text-secondary">Tanggal Jatuh Tempo <span className="text-[var(--color-danger)]">*</span></label>
                        <input 
                          type="date" 
                          value={tanggalJatuhTempo} 
                          onChange={(event) => setTanggalJatuhTempo(event.target.value)} 
                          required 
                          className={`h-11 w-full rounded-xl border ${themeNeutralBorder} theme-input px-3 text-sm outline-none focus:border-[var(--color-primary)]`} 
                        />
                        <p className="mt-1 text-[10px] theme-text-placeholder">Pilih tanggal kapan buku ini akan dikembalikan.</p>
                      </div>
                      
                      <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase theme-text-secondary">Catatan <span className="font-normal theme-text-placeholder">(Opsional)</span></label>
                        <textarea 
                          value={catatan} 
                          onChange={(event) => setCatatan(event.target.value)} 
                          rows={4} 
                          maxLength={1000} 
                          placeholder="Tambahkan catatan jika diperlukan..." 
                          className={`w-full resize-none rounded-xl border ${themeNeutralBorder} theme-input px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]`} 
                        />
                        <p className="mt-1 text-right text-[10px] theme-text-placeholder">{catatan.length}/1000</p>
                      </div>
                    </div>

                    <div className={`flex flex-col-reverse gap-3 border-t ${themeDivider} bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] px-6 py-5 sm:flex-row sm:justify-end`}>
                      <button 
                        type="button" 
                        onClick={() => router.back()} 
                        disabled={submitting} 
                        className={`theme-card theme-border theme-text-secondary flex h-11 items-center justify-center rounded-xl border px-6 text-sm font-semibold transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:opacity-50`}
                      >
                        Batal
                      </button>
                      <button 
                        type="submit" 
                        disabled={submitting || !tanggalJatuhTempo} 
                        className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-8 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {submitting ? <Loader2 size={17} className="animate-spin" /> : <BookOpenCheck size={17} />}
                        {submitting ? "Memproses..." : "Konfirmasi Pinjam"}
                      </button>
                    </div>
                  </form>
                  
                  {book.deskripsi && (
                    <div className={`theme-card ${themeNeutralBorder} ${themeCardShadow} rounded-2xl border p-6 sm:p-8`}>
                      <div className="flex items-center gap-2 mb-3">
                        <FileText size={18} className="text-[var(--color-primary)]" />
                        <p className="theme-text text-sm font-bold">Deskripsi Buku</p>
                      </div>
                      <p className="theme-text-secondary text-sm leading-relaxed whitespace-pre-wrap">{book.deskripsi}</p>
                    </div>
                  )}
                </div>

                {/* KOLOM KANAN (PANEL INFO TAMBAHAN AGAR TIDAK KOSONG) */}
                <div className="space-y-6">
                  <div className={`theme-card ${themeNeutralBorder} ${themeCardShadow} rounded-2xl border p-5 sm:p-6`}>
                    <div className="flex items-center gap-3 mb-5">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}>
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <h3 className="theme-text text-sm font-bold">Panduan Peminjaman</h3>
                        <p className="theme-text-muted text-xs">Harap dibaca sebelum meminjam</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${themeNeutralSurface} text-[10px] font-bold theme-text-muted`}>1</div>
                        <div>
                          <p className="theme-text text-xs font-semibold">Durasi Peminjaman</p>
                          <p className="theme-text-muted mt-0.5 text-[11px]">Maksimal 7 hari sejak tanggal peminjaman. Denda akan dikenakan jika melewati batas.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${themeNeutralSurface} text-[10px] font-bold theme-text-muted`}>2</div>
                        <div>
                          <p className="theme-text text-xs font-semibold">Kondisi Buku</p>
                          <p className="theme-text-muted mt-0.5 text-[11px]">Pastikan buku dalam kondisi baik saat dipinjam dan dikembalikan.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${themeNeutralSurface} text-[10px] font-bold theme-text-muted`}>3</div>
                        <div>
                          <p className="theme-text text-xs font-semibold">Pengembalian</p>
                          <p className="theme-text-muted mt-0.5 text-[11px]">Kembalikan buku tepat waktu melalui menu &quot;Peminjaman&quot; di halaman katalog.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`theme-card ${themeNeutralBorder} ${themeCardShadow} rounded-2xl border p-5 sm:p-6`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}>
                        <Clock3 size={20} />
                      </div>
                      <div>
                        <h3 className="theme-text text-sm font-bold">Rekomendasi Buku</h3>
                        <p className="theme-text-muted text-xs">Kategori {book.kategori || "Umum"}</p>
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
                              router.push(`/guru/perpustakaan/pinjam/${b.id}`);
                              setBook(null);
                              setLoading(true);
                            }}
                            className={`group flex w-full items-center gap-3 rounded-xl border ${themeNeutralBorder} p-2 text-left transition hover:border-[var(--color-primary)] hover:bg-[color-mix(in_srgb,var(--color-primary)_4%,transparent)]`}
                          >
                            <div className={`flex h-12 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg ${themePrimarySoft} text-[var(--color-primary)]`}>
                              {safeExternalUrl(b.coverUrl) ? (
                                <img src={safeExternalUrl(b.coverUrl)} alt="" className="h-full w-full object-cover" />
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
        </main>
      </div>
    </div>
  );
}