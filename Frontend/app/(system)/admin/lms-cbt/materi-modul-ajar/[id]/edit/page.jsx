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
  Upload,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

import {
  getKelasMapel,
  getMateriPembelajaranById,
  updateMateriDenganFile,
  updateMateriDenganLink,
  updateMateriTanpaSumber,
} from "@/services/materiPembelajaran.service";

const KATEGORI_OPTIONS = [
  "Modul Ajar",
  "Bahan Tayang",
  "Buku Referensi",
  "Lembar Kerja Siswa",
  "Lainnya",
];

export default function EditMateriPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [active, setActive] = useState("materi");
  const [collapsed, setCollapsed] = useState(false);

  const [loading, setLoading] = useState(true);
  const [kelasList, setKelasList] = useState([]);

  const [formKelasMapelId, setFormKelasMapelId] = useState("");
  const [formJudul, setFormJudul] = useState("");
  const [formKategori, setFormKategori] = useState("Modul Ajar");
  const [formDeskripsi, setFormDeskripsi] = useState("");
  const [initialData, setInitialData] = useState(null);

  const [formEditModeSumber, setFormEditModeSumber] = useState("keep"); // "keep" | "change-file" | "change-link"
  const [formFile, setFormFile] = useState(null);
  const [formUrlLink, setFormUrlLink] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      if (!id) return;
      setLoading(true);
      setError("");

      try {
        const [materiRes, kelasRes] = await Promise.all([
          getMateriPembelajaranById(id),
          getKelasMapel(),
        ]);

        if (mounted) {
          setKelasList(Array.isArray(kelasRes) ? kelasRes : []);
          if (!materiRes) {
            setError("Data materi pembelajaran tidak ditemukan.");
          } else {
            setInitialData(materiRes);
            setFormKelasMapelId(materiRes.kelasMapelId || materiRes.kelasMapel?.id || "");
            setFormJudul(materiRes.judul || "");
            setFormKategori(materiRes.kategori || "Modul Ajar");
            setFormDeskripsi(materiRes.deskripsi || "");
            setFormUrlLink(materiRes.urlLink || "");
          }
        }
      } catch (err) {
        if (mounted) {
          console.error("Gagal memuat materi:", err);
          setError(err?.message || "Gagal memuat data materi pembelajaran.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, [id]);

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
      if (formEditModeSumber === "keep") {
        if (initialData?.tipe === "link") {
          await updateMateriDenganLink(id, {
            kelasMapelId: formKelasMapelId,
            judul: formJudul.trim(),
            kategori: formKategori.trim() || undefined,
            deskripsi: formDeskripsi.trim() || undefined,
            urlLink: initialData.urlLink || formUrlLink.trim(),
          });
        } else {
          await updateMateriTanpaSumber(id, {
            kelasMapelId: formKelasMapelId,
            judul: formJudul.trim(),
            kategori: formKategori.trim() || undefined,
            deskripsi: formDeskripsi.trim() || undefined,
          });
        }
      } else if (formEditModeSumber === "change-file") {
        if (!formFile) {
          setError("Pilih berkas baru (PDF atau Video) untuk diunggah.");
          setSubmitting(false);
          return;
        }
        await updateMateriDenganFile(id, {
          kelasMapelId: formKelasMapelId,
          judul: formJudul.trim(),
          kategori: formKategori.trim() || undefined,
          deskripsi: formDeskripsi.trim() || undefined,
          file: formFile,
        });
      } else if (formEditModeSumber === "change-link") {
        if (!formUrlLink.trim()) {
          setError("Masukkan URL tautan baru.");
          setSubmitting(false);
          return;
        }
        if (!/^https?:\/\//i.test(formUrlLink.trim())) {
          setError("Format URL tidak valid. Awali dengan http:// atau https://");
          setSubmitting(false);
          return;
        }
        await updateMateriDenganLink(id, {
          kelasMapelId: formKelasMapelId,
          judul: formJudul.trim(),
          kategori: formKategori.trim() || undefined,
          deskripsi: formDeskripsi.trim() || undefined,
          urlLink: formUrlLink.trim(),
        });
      }

      setSuccess("Materi pembelajaran berhasil diperbarui.");
      setTimeout(() => {
        router.push("/admin/lms-cbt/materi-modul-ajar");
      }, 1000);
    } catch (err) {
      setError(err?.message || "Gagal memperbarui data materi.");
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
                  Edit Materi Pembelajaran
                </h1>
                <p className="theme-text-secondary mt-1 text-sm">
                  Perbarui informasi, kelas target, atau ganti berkas materi pembelajaran.
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

            {loading ? (
              <div className="theme-card theme-border flex flex-col items-center justify-center rounded-2xl border p-12 shadow-sm">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
                <p className="theme-text-muted mt-3 text-sm">
                  Memuat data formulir materi...
                </p>
              </div>
            ) : (
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
                      disabled={submitting}
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

                  {/* Pengaturan Sumber Materi */}
                  <div>
                    <label className="theme-text mb-2 block text-sm font-semibold">
                      Opsi Berkas / Sumber Materi
                    </label>

                    {initialData && (
                      <div className="theme-card-soft mb-3 rounded-xl border border-[var(--color-border)] p-3 text-xs">
                        <span className="theme-text-muted block">Sumber Saat Ini:</span>
                        <span className="theme-text font-semibold">
                          {initialData.tipe === "link"
                            ? `Tautan Daring: ${initialData.urlLink || "-"}`
                            : `Berkas Terunggah: ${initialData.urlFile || "-"}`}
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <button
                        type="button"
                        onClick={() => setFormEditModeSumber("keep")}
                        className={`rounded-xl border p-3 text-left text-xs font-semibold transition-all ${
                          formEditModeSumber === "keep"
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                            : "theme-card theme-border theme-text hover:bg-[var(--color-sidebar-active)]"
                        }`}
                      >
                        Tetap Gunakan Sumber Saat Ini
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormEditModeSumber("change-file")}
                        className={`rounded-xl border p-3 text-left text-xs font-semibold transition-all ${
                          formEditModeSumber === "change-file"
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                            : "theme-card theme-border theme-text hover:bg-[var(--color-sidebar-active)]"
                        }`}
                      >
                        Unggah Berkas Baru (File)
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormEditModeSumber("change-link")}
                        className={`rounded-xl border p-3 text-left text-xs font-semibold transition-all ${
                          formEditModeSumber === "change-link"
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                            : "theme-card theme-border theme-text hover:bg-[var(--color-sidebar-active)]"
                        }`}
                      >
                        Ganti dengan Tautan (Link)
                      </button>
                    </div>
                  </div>

                  {/* Input File atau Link jika mode ganti */}
                  {formEditModeSumber === "change-file" && (
                    <div>
                      <label className="theme-text mb-2 block text-sm font-semibold">
                        Pilih Berkas Baru <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp4,.zip"
                        onChange={(e) => setFormFile(e.target.files?.[0] || null)}
                        disabled={submitting}
                        className="theme-input w-full rounded-xl border p-2 text-sm outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--color-primary)] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white"
                        required
                      />
                    </div>
                  )}

                  {formEditModeSumber === "change-link" && (
                    <div>
                      <label className="theme-text mb-2 block text-sm font-semibold">
                        Tautan Baru (URL) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="url"
                        value={formUrlLink}
                        onChange={(e) => setFormUrlLink(e.target.value)}
                        placeholder="https://..."
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
                        Simpan Perubahan
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
