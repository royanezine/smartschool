"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  ArrowLeft,
  BookOpen,
  FileText,
  Link2,
  Download,
  Calendar,
  User,
  GraduationCap,
  Edit3,
  Trash2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Info,
  Clock,
  Layers,
  ShieldCheck,
} from "lucide-react";

import {
  getMateriPembelajaranById,
  deleteMateriPembelajaran,
} from "@/services/materiPembelajaran.service";

export default function DetailMateriPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [active, setActive] = useState("materi");
  const [collapsed, setCollapsed] = useState(false);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function fetchDetail() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const result = await getMateriPembelajaranById(id);
        if (mounted) {
          if (!result) {
            setError("Data materi pembelajaran tidak ditemukan.");
          } else {
            setData(result);
          }
        }
      } catch (err) {
        if (mounted) {
          console.error("Gagal memuat detail materi:", err);
          setError(err?.message || "Gagal memuat detail materi pembelajaran.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchDetail();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteMateriPembelajaran(id);
      router.push("/admin/lms-cbt/materi-modul-ajar");
    } catch (err) {
      setDeleteError(err?.message || "Gagal menghapus materi pembelajaran.");
      setDeleting(false);
    }
  };

  return (
    // ✅ ROOT pakai flex h-screen overflow-hidden
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active={active}
        setActive={setActive}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* ✅ Header dibungkus shrink-0 */}
        <div className="shrink-0 border-b theme-border">
          <Header active={active} />
        </div>

        {/* ✅ Body flex min-h-0 flex-1 */}
        <div className="flex min-h-0 flex-1">
          
          {/* ✅ Main min-w-0 flex-1 overflow-y-auto */}
          <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
            
            {/* ✅ Konten w-full (max-w dihapus agar melebar penuh saat zoom out) */}
            <div className="w-full p-4 sm:p-6 lg:p-8 2xl:px-12">
              
              {/* Navigation & Header */}
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Link
                    href="/admin/lms-cbt/materi-modul-ajar"
                    className="theme-text-muted inline-flex items-center gap-2 text-sm transition-colors hover:text-[var(--color-primary)]"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke Materi & Modul Ajar
                  </Link>
                  <h1 className="theme-text mt-3 text-2xl font-bold">
                    Detail Materi Pembelajaran
                  </h1>
                  <p className="theme-text-secondary mt-1 text-sm">
                    Informasi lengkap bahan modul ajar dan berkas materi siswa.
                  </p>
                </div>

                {data && (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowDeleteModal(true)}
                      className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger-background)] px-4 py-2.5 text-sm font-semibold text-[var(--color-danger)] hover:opacity-90 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                      Hapus
                    </button>

                    <Link
                      href={`/admin/lms-cbt/materi-modul-ajar/${id}/edit`}
                      className="theme-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-opacity hover:opacity-95"
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit Materi
                    </Link>
                  </div>
                )}
              </div>

              {/* Loading */}
              {loading && (
                <div className="theme-card theme-border flex flex-col items-center justify-center rounded-2xl border p-12 shadow-sm">
                  <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
                  <p className="theme-text-muted mt-3 text-sm">
                    Memuat data materi pembelajaran...
                  </p>
                </div>
              )}

              {/* Error */}
              {error && !loading && (
                <div className="theme-danger flex items-start gap-3 rounded-2xl border p-6 text-sm">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <h3 className="font-bold">Terjadi Kesalahan</h3>
                    <p className="mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Data Detail Content (Grid Layout) */}
              {data && !loading && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                  
                  {/* === KOLOM KIRI: Konten Utama === */}
                  <div className="flex min-w-0 flex-col gap-6">
                    
                    {/* Main Card */}
                    <div className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">
                      <div className="p-6 sm:p-8">
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                          <span className="theme-badge inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold">
                            <BookOpen className="h-3.5 w-3.5" />
                            {data.kategori || "Modul Ajar"}
                          </span>
                          <span className="theme-badge-info inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold">
                            {data.tipe === "link" ? "Tautan Daring" : "Berkas Terunggah"}
                          </span>
                        </div>

                        <h2 className="theme-text text-2xl font-bold">
                          {data.judul}
                        </h2>

                        <div className="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] p-4 sm:grid-cols-2">
                          <div>
                            <span className="theme-text-muted text-[11px] font-semibold uppercase tracking-wider">Kelas:</span>
                            <p className="theme-text font-semibold mt-0.5">
                              {data.kelasMapel?.kelas?.nama || "-"}
                            </p>
                          </div>

                          <div>
                            <span className="theme-text-muted text-[11px] font-semibold uppercase tracking-wider">Mata Pelajaran:</span>
                            <p className="theme-text font-semibold mt-0.5">
                              {data.kelasMapel?.mataPelajaran?.nama || "-"}
                            </p>
                          </div>

                          <div>
                            <span className="theme-text-muted text-[11px] font-semibold uppercase tracking-wider">Guru Pengampu:</span>
                            <p className="theme-text font-semibold mt-0.5">
                              {data.kelasMapel?.guruPengajar?.namaLengkap || "-"}
                            </p>
                          </div>

                          <div>
                            <span className="theme-text-muted text-[11px] font-semibold uppercase tracking-wider">Tanggal Dibuat:</span>
                            <p className="theme-text font-semibold mt-0.5">
                              {data.dibuatPada
                                ? new Date(data.dibuatPada).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  })
                                : "-"}
                            </p>
                          </div>
                        </div>

                        {/* Deskripsi */}
                        <div className="mt-6">
                          <h3 className="theme-text mb-2 text-sm font-semibold">
                            Deskripsi / Petunjuk
                          </h3>
                          <div className="theme-card-soft rounded-xl p-4 text-sm leading-relaxed text-[var(--color-text-secondary)] whitespace-pre-wrap">
                            {data.deskripsi || "Tidak ada deskripsi yang dicantumkan."}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* === KOLOM KANAN: Sumber & Informasi === */}
                  <aside className="flex min-w-0 flex-col gap-6">
                    
                    {/* Card Sumber Bahan Ajar */}
                    <div className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">
                      <div className="theme-card-soft theme-border flex items-center gap-3 border-b px-5 py-3.5">
                        <div className="theme-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                          {data.tipe === "link" ? <Link2 className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                        </div>
                        <h2 className="theme-text text-sm font-bold">Sumber Bahan Ajar</h2>
                      </div>
                      
                      <div className="p-5">
                        {data.tipe === "link" && data.urlLink ? (
                          <div className="flex flex-col gap-4">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                                <Link2 className="h-5 w-5" />
                              </div>
                              <div className="min-w-0">
                                <p className="theme-text text-sm font-semibold">
                                  Tautan Sumber Daring
                                </p>
                                <p className="theme-text-muted break-all text-xs mt-0.5">
                                  {data.urlLink}
                                </p>
                              </div>
                            </div>

                            <a
                              href={data.urlLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="theme-primary inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold"
                            >
                              Buka Tautan
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        ) : data.urlFile ? (
                          <div className="flex flex-col gap-4">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary-background)] text-[var(--color-primary)]">
                                <FileText className="h-5 w-5" />
                              </div>
                              <div className="min-w-0">
                                <p className="theme-text text-sm font-semibold">
                                  Berkas Materi
                                </p>
                                <p className="theme-text-muted break-all text-xs mt-0.5">
                                  {data.urlFile}
                                </p>
                              </div>
                            </div>

                            <a
                              href={data.urlFile}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className="theme-primary inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold"
                            >
                              Unduh Berkas
                              <Download className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        ) : (
                          <p className="theme-text-muted text-sm italic">
                            Tidak ada berkas atau tautan sumber.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Card Metadata */}
                    <div className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">
                      <div className="theme-card-soft theme-border flex items-center gap-3 border-b px-5 py-3.5">
                        <div className="bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                          <Layers className="h-4 w-4" />
                        </div>
                        <h2 className="theme-text text-sm font-bold">Metadata</h2>
                      </div>
                      <div className="p-5">
                        <div className="space-y-3 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="theme-text-muted flex items-center gap-1.5"><ShieldCheck size={13}/> Status</span>
                            <span className="theme-success px-2 py-0.5 rounded-md font-semibold text-[10px]">Aktif</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="theme-text-muted flex items-center gap-1.5"><Clock size={13}/> Tipe</span>
                            <span className="theme-text font-semibold">{data.tipe === 'link' ? 'Tautan' : 'File'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="theme-text-muted flex items-center gap-1.5"><GraduationCap size={13}/> Kurikulum</span>
                            <span className="theme-text font-semibold">Merdeka</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Info (Biru) */}
                    <div className="bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text theme-border flex items-start gap-3 rounded-2xl border p-4">
                      <Info size={16} className="mt-0.5 shrink-0 theme-primary-text" />
                      <p className="text-[11px] leading-5">
                        Materi ini dapat diakses oleh siswa di kelas yang terdaftar. Pastikan tautan atau berkas masih valid.
                      </p>
                    </div>
                  </aside>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Confirmation Modal for Delete */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="theme-card theme-border w-full max-w-md rounded-2xl border p-6 shadow-2xl">
            <h3 className="theme-text text-lg font-bold">Hapus Materi?</h3>
            <p className="theme-text-secondary mt-2 text-sm leading-relaxed">
              Materi <strong>"{data?.judul}"</strong> akan dihapus dari sistem. Tindakan ini tidak dapat dibatalkan.
            </p>

            {deleteError && (
              <div className="theme-danger mt-3 rounded-xl border p-3 text-xs">
                {deleteError}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setShowDeleteModal(false)}
                className="theme-card theme-border theme-text rounded-xl border px-4 py-2 text-sm font-semibold"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-danger)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Ya, Hapus
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}