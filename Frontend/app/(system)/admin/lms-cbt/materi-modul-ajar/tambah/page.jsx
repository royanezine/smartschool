"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  ArrowLeft,
  BookOpen,
  FileText,
  Link2,
  Upload,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Layers,
  GraduationCap,
  Eye,
  Info,
  Lightbulb,
  FileBox,
} from "lucide-react";

import {
  getKelasMapel,
  createMateriDenganFile,
  createMateriDenganLink,
} from "@/services/materiPembelajaran.service";

const KATEGORI_OPTIONS = [
  "Modul Ajar",
  "Bahan Tayang",
  "Buku Referensi",
  "Lembar Kerja Siswa",
  "Lainnya",
];

export default function TambahMateriPage() {
  const router = useRouter();

  const [active, setActive] = useState("materi");
  const [collapsed, setCollapsed] = useState(false);

  const [kelasList, setKelasList] = useState([]);
  const [loadingKelas, setLoadingKelas] = useState(true);

  const [formKelasMapelId, setFormKelasMapelId] = useState("");
  const [formJudul, setFormJudul] = useState("");
  const [formKategori, setFormKategori] = useState("Modul Ajar");
  const [formDeskripsi, setFormDeskripsi] = useState("");
  const [formSumberTipe, setFormSumberTipe] = useState("file");
  const [formFile, setFormFile] = useState(null);
  const [formUrlLink, setFormUrlLink] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;
    async function fetchKelas() {
      try {
        setLoadingKelas(true);
        const data = await getKelasMapel();
        if (mounted) {
          setKelasList(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (mounted) {
          console.error("Gagal memuat daftar kelas-mapel:", err);
          setError("Gagal memuat pilihan kelas dan mata pelajaran.");
        }
      } finally {
        if (mounted) setLoadingKelas(false);
      }
    }
    fetchKelas();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formKelasMapelId) {
      setError("Silakan pilih Kelas dan Mata Pelajaran.");
      return;
    }
    if (!formJudul.trim()) {
      setError("Judul materi wajib diisi.");
      return;
    }
    if (formJudul.trim().length > 100) {
      setError("Judul materi maksimal 100 karakter.");
      return;
    }

    setSubmitting(true);

    try {
      if (formSumberTipe === "file") {
        if (!formFile) {
          setError("Pilih file materi (PDF atau Video) untuk diunggah.");
          setSubmitting(false);
          return;
        }
        await createMateriDenganFile({
          kelasMapelId: formKelasMapelId,
          judul: formJudul.trim(),
          kategori: formKategori.trim() || undefined,
          deskripsi: formDeskripsi.trim() || undefined,
          file: formFile,
        });
      } else {
        if (!formUrlLink.trim()) {
          setError("Masukkan tautan link materi (URL).");
          setSubmitting(false);
          return;
        }
        if (!/^https?:\/\//i.test(formUrlLink.trim())) {
          setError("Format URL tidak valid. Awali dengan http:// atau https://");
          setSubmitting(false);
          return;
        }
        await createMateriDenganLink({
          kelasMapelId: formKelasMapelId,
          judul: formJudul.trim(),
          kategori: formKategori.trim() || undefined,
          deskripsi: formDeskripsi.trim() || undefined,
          urlLink: formUrlLink.trim(),
        });
      }

      setSuccess("Materi pembelajaran berhasil ditambahkan.");
      setTimeout(() => {
        router.push("/admin/lms-cbt/materi-modul-ajar");
      }, 1000);
    } catch (err) {
      setError(err?.message || "Gagal menyimpan materi pembelajaran.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedKelasMapel = kelasList.find(
    (km) => String(km.id) === String(formKelasMapelId)
  );

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
              
              <div className="mb-6 flex flex-col gap-4">
                <Link
                  href="/admin/lms-cbt/materi-modul-ajar"
                  className="theme-text-muted inline-flex w-fit items-center gap-2 text-sm transition-colors hover:text-[var(--color-primary)]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Kembali ke Materi & Modul Ajar
                </Link>

                <div className="flex min-w-0 items-center gap-3">
                  <div className="theme-info flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="theme-text text-2xl font-bold">
                      Tambah Materi Pembelajaran
                    </h1>
                    <p className="theme-text-muted mt-1 text-sm">
                      Unggah bahan ajar baru berupa modul teks, berkas PDF, video, atau tautan daring.
                    </p>
                  </div>
                </div>
              </div>

              {/* Error / Success Banners */}
              {error && (
                <div className="theme-danger mb-6 flex items-start gap-3 rounded-xl border p-4 text-sm">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <div className="flex-1">{error}</div>
                </div>
              )}

              {success && (
                <div className="theme-success mb-6 flex items-start gap-3 rounded-xl border p-4 text-sm">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                  <div className="flex-1">{success}</div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                
                {/* ✅ Grid 2 Kolom Responsif (Kiri: Form, Kanan: Info) */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                  
                  {/* === KOLOM KIRI: Form Utama === */}
                  <div className="theme-card theme-border min-w-0 space-y-6 overflow-hidden rounded-2xl border p-6 shadow-sm sm:p-8">
                    
                    {/* Kelas & Mapel */}
                    <div>
                      <label className="theme-text mb-2 block text-sm font-semibold">
                        Kelas & Mata Pelajaran <span className="text-[var(--color-danger)]">*</span>
                      </label>
                      <select
                        value={formKelasMapelId}
                        onChange={(e) => setFormKelasMapelId(e.target.value)}
                        disabled={loadingKelas || submitting}
                        className="theme-input w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)]"
                        required
                      >
                        <option value="">-- Pilih Kelas & Mata Pelajaran --</option>
                        {kelasList.map((km) => (
                          <option key={km.id} value={km.id}>
                            {km.kelas?.nama || "Kelas ?"} - {km.mataPelajaran?.nama || "Mapel ?"} (Guru: {km.guruPengajar?.namaLengkap || "-"})
                          </option>
                        ))}
                      </select>
                      {loadingKelas && (
                        <p className="theme-text-muted mt-1 text-xs flex items-center gap-1.5">
                          <Loader2 className="h-3 w-3 animate-spin" /> Memuat daftar kelas pembelajaran...
                        </p>
                      )}
                    </div>

                    {/* Judul & Kategori */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                      <div className="sm:col-span-2">
                        <label className="theme-text mb-2 block text-sm font-semibold">
                          Judul Materi <span className="text-[var(--color-danger)]">*</span>
                        </label>
                        <input
                          type="text"
                          maxLength={100}
                          value={formJudul}
                          onChange={(e) => setFormJudul(e.target.value)}
                          placeholder="Contoh: Bab 1: Eksponen dan Logaritma"
                          disabled={submitting}
                          className="theme-input w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)]"
                          required
                        />
                        <p className="theme-text-muted mt-1 text-xs">
                          Maksimal 100 karakter.
                        </p>
                      </div>

                      <div>
                        <label className="theme-text mb-2 block text-sm font-semibold">
                          Kategori <span className="text-[var(--color-danger)]">*</span>
                        </label>
                        <select
                          value={formKategori}
                          onChange={(e) => setFormKategori(e.target.value)}
                          disabled={submitting}
                          className="theme-input w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)]"
                        >
                          {KATEGORI_OPTIONS.map((kat) => (
                            <option key={kat} value={kat}>
                              {kat}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Deskripsi */}
                    <div>
                      <label className="theme-text mb-2 block text-sm font-semibold">
                        Deskripsi / Petunjuk Belajar
                      </label>
                      <textarea
                        rows={4}
                        value={formDeskripsi}
                        onChange={(e) => setFormDeskripsi(e.target.value)}
                        placeholder="Tuliskan ringkasan materi atau petunjuk belajar bagi siswa..."
                        disabled={submitting}
                        className="theme-input w-full rounded-xl border p-3.5 text-sm outline-none transition focus:border-[var(--color-primary)]"
                      />
                    </div>

                    {/* Sumber Materi Mode */}
                    <div>
                      <label className="theme-text mb-2 block text-sm font-semibold">
                        Tipe Sumber Materi <span className="text-[var(--color-danger)]">*</span>
                      </label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          type="button"
                          onClick={() => setFormSumberTipe("file")}
                          className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                            formSumberTipe === "file"
                              ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-sm"
                              : "theme-card theme-border theme-text hover:bg-[var(--color-sidebar-active)]"
                          }`}
                        >
                          <Upload className="h-4 w-4" />
                          Unggah File
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormSumberTipe("link")}
                          className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                            formSumberTipe === "link"
                              ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-sm"
                              : "theme-card theme-border theme-text hover:bg-[var(--color-sidebar-active)]"
                          }`}
                        >
                          <Link2 className="h-4 w-4" />
                          Tautan URL
                        </button>
                      </div>
                    </div>

                    {/* Input File atau Link */}
                    {formSumberTipe === "file" ? (
                      <div>
                        <label className="theme-text mb-2 block text-sm font-semibold">
                          Pilih Berkas Materi <span className="text-[var(--color-danger)]">*</span>
                        </label>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp4,.zip"
                          onChange={(e) => setFormFile(e.target.files?.[0] || null)}
                          disabled={submitting}
                          className="theme-input w-full rounded-xl border p-2 text-sm outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--color-primary)] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white"
                          required
                        />
                        <p className="theme-text-muted mt-1 text-xs">
                          Format yang didukung: PDF, DOC, PPT, MP4 (Maks. 25MB).
                        </p>
                      </div>
                    ) : (
                      <div>
                        <label className="theme-text mb-2 block text-sm font-semibold">
                          Tautan Eksternal (URL) <span className="text-[var(--color-danger)]">*</span>
                        </label>
                        <input
                          type="url"
                          value={formUrlLink}
                          onChange={(e) => setFormUrlLink(e.target.value)}
                          placeholder="https://youtube.com/watch?v=... atau https://docs.google.com/..."
                          disabled={submitting}
                          className="theme-input w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)]"
                          required
                        />
                      </div>
                    )}
                  </div>

                  {/* === KOLOM KANAN: Preview & Action === */}
                  <aside className="flex min-w-0 flex-col gap-6">
                    
                    {/* Card Preview */}
                    <div className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">
                      <div className="theme-card-soft theme-border flex items-center gap-3 border-b px-5 py-3">
                        <div className="theme-info flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                          <Eye className="h-4 w-4" />
                        </div>
                        <h2 className="theme-text text-sm font-bold">Preview Materi</h2>
                      </div>
                      <div className="p-5">
                        <div className="space-y-4 text-xs">
                          <div>
                            <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                              Judul
                            </p>
                            <p className="theme-text mt-1 text-sm font-semibold break-words">
                              {formJudul || "Belum ada judul"}
                            </p>
                          </div>
                          <div className="theme-border-soft h-px" />
                          <div>
                            <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                              Kelas & Mapel
                            </p>
                            <p className="theme-text mt-1 text-sm font-semibold">
                              {selectedKelasMapel
                                ? `${selectedKelasMapel.kelas?.nama} - ${selectedKelasMapel.mataPelajaran?.nama}`
                                : "Belum dipilih"}
                            </p>
                          </div>
                          <div className="theme-border-soft h-px" />
                          <div>
                            <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                              Tipe Sumber
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              {formSumberTipe === "file" ? (
                                <><FileBox size={14} className="text-[var(--color-primary)]"/> <span className="theme-text font-semibold text-sm">Unggah File</span></>
                              ) : (
                                <><Link2 size={14} className="text-[var(--color-primary)]"/> <span className="theme-text font-semibold text-sm">Tautan URL</span></>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Panduan */}
                    <div className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">
                      <div className="theme-card-soft theme-border flex items-center gap-3 border-b px-5 py-3">
                        <div className="theme-warning flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                          <Lightbulb className="h-4 w-4" />
                        </div>
                        <h2 className="theme-text text-sm font-bold">Panduan</h2>
                      </div>
                      <div className="p-5">
                        <ul className="space-y-3 text-xs leading-5">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[var(--color-success)]" />
                            <span className="theme-text-secondary">
                              Pastikan judul materi mencerminkan isinya.
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[var(--color-success)]" />
                            <span className="theme-text-secondary">
                              Jika mengunggah file, maksimal ukuran adalah 25MB.
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[var(--color-success)]" />
                            <span className="theme-text-secondary">
                              Tautan eksternal harus bisa diakses publik.
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Info Biru */}
                    <div className="theme-info theme-border flex items-start gap-3 rounded-2xl border p-4">
                      <Info size={16} className="mt-0.5 shrink-0 text-[var(--color-info)]" />
                      <p className="text-[11px] leading-5">
                        Materi yang ditambahkan akan langsung tersedia untuk siswa di kelas yang dipilih.
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={submitting || loadingKelas}
                        className="theme-primary inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Simpan Materi
                          </>
                        )}
                      </button>

                      <Link
                        href="/admin/lms-cbt/materi-modul-ajar"
                        className="theme-card theme-border theme-text-secondary inline-flex w-full items-center justify-center rounded-xl border px-5 py-3 text-sm font-semibold transition-colors hover:bg-[var(--color-sidebar-active)]"
                      >
                        Batal
                      </Link>
                    </div>
                  </aside>

                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}