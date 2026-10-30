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

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active={active}
        setActive={setActive}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b theme-border">
          <Header active={active} />
        </div>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-4xl space-y-6">
            {/* Top Navigation */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Link
                  href="/admin/lms-cbt/materi-modul-ajar"
                  className="theme-text-muted inline-flex items-center gap-2 text-sm transition-colors hover:text-[var(--color-primary)]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Kembali ke Materi & Modul Ajar
                </Link>
                <h1 className="theme-text mt-2 text-2xl font-bold">
                  Tambah Materi Pembelajaran
                </h1>
                <p className="theme-text-secondary mt-1 text-sm">
                  Unggah bahan ajar baru berupa modul teks, berkas PDF, video, atau tautan daring.
                </p>
              </div>
            </div>

            {/* Error / Success Banners */}
            {error && (
              <div className="theme-danger flex items-start gap-3 rounded-xl border p-4 text-sm">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="flex-1">{error}</div>
              </div>
            )}

            {success && (
              <div className="theme-success flex items-start gap-3 rounded-xl border p-4 text-sm">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="flex-1">{success}</div>
              </div>
            )}

            {/* Form Container */}
            <form
              onSubmit={handleSubmit}
              className="theme-card theme-border rounded-2xl border p-6 shadow-sm sm:p-8"
            >
              <div className="space-y-6">
                {/* Kelas & Mapel */}
                <div>
                  <label className="theme-text mb-2 block text-sm font-semibold">
                    Kelas & Mata Pelajaran <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formKelasMapelId}
                    onChange={(e) => setFormKelasMapelId(e.target.value)}
                    disabled={loadingKelas || submitting}
                    className="theme-input w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none"
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
                    <p className="theme-text-muted mt-1 text-xs">
                      Memuat daftar kelas pembelajaran...
                    </p>
                  )}
                </div>

                {/* Judul & Kategori */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <label className="theme-text mb-2 block text-sm font-semibold">
                      Judul Materi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={100}
                      value={formJudul}
                      onChange={(e) => setFormJudul(e.target.value)}
                      placeholder="Contoh: Bab 1: Eksponen dan Logaritma"
                      disabled={submitting}
                      className="theme-input w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none"
                      required
                    />
                    <p className="theme-text-muted mt-1 text-xs">
                      Maksimal 100 karakter.
                    </p>
                  </div>

                  <div>
                    <label className="theme-text mb-2 block text-sm font-semibold">
                      Kategori <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formKategori}
                      onChange={(e) => setFormKategori(e.target.value)}
                      disabled={submitting}
                      className="theme-input w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none"
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
                    className="theme-input w-full rounded-xl border p-3.5 text-sm outline-none"
                  />
                </div>

                {/* Sumber Materi Mode */}
                <div>
                  <label className="theme-text mb-2 block text-sm font-semibold">
                    Tipe Sumber Materi <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setFormSumberTipe("file")}
                      className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                        formSumberTipe === "file"
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                          : "theme-card theme-border theme-text hover:bg-[var(--color-sidebar-active)]"
                      }`}
                    >
                      <Upload className="h-4 w-4" />
                      Unggah File (PDF / Dokumen / Video)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormSumberTipe("link")}
                      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                        formSumberTipe === "link"
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                          : "theme-card theme-border theme-text hover:bg-[var(--color-sidebar-active)]"
                      }`}
                    >
                      <Link2 className="h-4 w-4" />
                      Tautan URL (Drive / YouTube / Web)
                    </button>
                  </div>
                </div>

                {/* Input File atau Link */}
                {formSumberTipe === "file" ? (
                  <div>
                    <label className="theme-text mb-2 block text-sm font-semibold">
                      Pilih Berkas Materi <span className="text-red-500">*</span>
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
                      Tautan Eksternal (URL) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      value={formUrlLink}
                      onChange={(e) => setFormUrlLink(e.target.value)}
                      placeholder="https://youtube.com/watch?v=... atau https://docs.google.com/..."
                      disabled={submitting}
                      className="theme-input w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="theme-border mt-8 flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
                <Link
                  href="/admin/lms-cbt/materi-modul-ajar"
                  className="theme-card theme-border theme-text-secondary inline-flex items-center justify-center rounded-xl border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-[var(--color-sidebar-active)]"
                >
                  Batal
                </Link>

                <button
                  type="submit"
                  disabled={submitting}
                  className="theme-primary inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold shadow-sm transition-opacity hover:opacity-95 disabled:opacity-50"
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
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
