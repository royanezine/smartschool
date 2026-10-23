"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  CalendarDays,
  BookOpen,
  GraduationCap,
} from "lucide-react";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  getDetailTugas,
  updateTugas,
} from "@/services/tugas.service";

function toDatetimeLocal(isoStr) {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

export default function EditTugasAdminPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [tugasData, setTugasData] = useState(null);

  const [form, setForm] = useState({
    judul: "",
    deskripsi: "",
    batasWaktu: "",
  });

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const res = await getDetailTugas(id);
        const data = res?.data ?? res;
        if (isMounted && data) {
          setTugasData(data);
          setForm({
            judul: data.judul || "",
            deskripsi: data.deskripsi || "",
            batasWaktu: toDatetimeLocal(data.batasWaktu),
          });
        }
      } catch (err) {
        console.error("Gagal memuat detail tugas:", err);
        if (isMounted) {
          setError(
            err?.message || "Gagal memuat detail tugas dari server atau data telah dihapus."
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    const t = setTimeout(() => {
      load();
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(t);
    };
  }, [id]);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        judul: form.judul.trim(),
        deskripsi: form.deskripsi?.trim() || undefined,
        batasWaktu: form.batasWaktu
          ? new Date(form.batasWaktu).toISOString()
          : undefined,
      };

      await updateTugas(id, payload);
      setSuccess(`Perubahan tugas "${form.judul}" berhasil disimpan!`);

      setTimeout(() => {
        router.push(`/admin/lms-cbt/tugas-siswa/${id}`);
      }, 1000);
    } catch (err) {
      console.error("Gagal memperbarui tugas:", err);
      setError(err?.message || "Gagal memperbarui tugas. Periksa input data Anda.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen theme-page flex">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Header />

        <main className="flex-1 px-4 md:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-2 text-sm theme-text-secondary mb-4">
            <Link
              href="/admin/lms-cbt/tugas-siswa"
              className="hover:text-[var(--color-primary)] transition"
            >
              Tugas Siswa
            </Link>
            <span>/</span>
            <Link
              href={`/admin/lms-cbt/tugas-siswa/${id}`}
              className="hover:text-[var(--color-primary)] transition truncate max-w-xs"
            >
              {tugasData?.judul || "Detail Tugas"}
            </Link>
            <span>/</span>
            <span className="theme-text font-medium">Edit Tugas</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/lms-cbt/tugas-siswa/${id}`}
                className="
                  p-2 border theme-border rounded-lg theme-text-secondary
                  hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
                  hover:theme-text transition
                "
                title="Kembali ke detail tugas"
              >
                <ArrowLeft size={18} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold theme-text tracking-tight">
                  Edit Tugas Siswa
                </h1>
                <p className="text-sm theme-text-secondary mt-0.5">
                  Perbarui judul penugasan, instruksi deskripsi, dan batas waktu pengumpulan.
                </p>
              </div>
            </div>
          </div>

          {success && (
            <div className="w-full mb-6 p-4 rounded-xl border border-[color-mix(in_srgb,var(--color-success)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] flex items-center gap-2.5 text-sm text-[var(--color-success)]">
              <CheckCircle2 size={18} />
              <span className="font-medium">{success}</span>
            </div>
          )}

          {loading ? (
            <div className="w-full p-12 text-center theme-card border theme-border rounded-xl">
              <Loader2
                size={32}
                className="animate-spin text-[var(--color-primary)] mx-auto mb-3"
              />
              <p className="text-sm theme-text-secondary">
                Memuat data tugas dari server...
              </p>
            </div>
          ) : error && !tugasData ? (
            <div className="w-full p-6 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] flex items-start gap-3 text-sm text-[var(--color-danger)]">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Gagal Memuat Data Tugas</p>
                <p className="mt-1">{error}</p>
                <Link
                  href="/admin/lms-cbt/tugas-siswa"
                  className="inline-block mt-3 px-3.5 py-1.5 bg-[var(--color-danger)] text-white rounded-md text-xs font-medium hover:opacity-90 transition"
                >
                  Kembali ke Daftar Tugas
                </Link>
              </div>
            </div>
          ) : (
            <div className="w-full theme-card border theme-border rounded-xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="p-4 rounded-xl theme-card-soft border theme-border flex flex-wrap items-center justify-between gap-4 text-xs">
                <div>
                  <span className="theme-text-muted block text-[11px]">Kelas:</span>
                  <span className="font-semibold theme-text text-sm flex items-center gap-1.5 mt-0.5">
                    <GraduationCap size={15} className="theme-text-muted" />
                    {tugasData?.kelasMapel?.kelas?.nama || "-"}
                  </span>
                </div>
                <div>
                  <span className="theme-text-muted block text-[11px]">Mata Pelajaran:</span>
                  <span className="font-semibold theme-text text-sm flex items-center gap-1.5 mt-0.5">
                    <BookOpen size={15} className="theme-text-muted" />
                    {tugasData?.kelasMapel?.mataPelajaran?.nama || "-"}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 rounded-lg border border-[color-mix(in_srgb,var(--color-danger)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] text-xs text-[var(--color-danger)] flex items-start gap-2.5">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Gagal Menyimpan Perubahan</p>
                      <p className="mt-0.5 leading-relaxed">{error}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-2">
                    Judul Tugas *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.judul}
                    onChange={(e) => update("judul", e.target.value)}
                    placeholder="Contoh: Analisis Kebutuhan Sistem Informasi"
                    className="theme-input w-full px-3.5 py-2.5 border theme-border rounded-lg text-sm theme-text outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] focus:border-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-2">
                    Batas Waktu Pengumpulan (Tenggat) *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={form.batasWaktu}
                    onChange={(e) => update("batasWaktu", e.target.value)}
                    className="theme-input w-full px-3.5 py-2.5 border theme-border rounded-lg text-sm theme-text-secondary outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] focus:border-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-2">
                    Deskripsi / Instruksi Pengerjaan *
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={form.deskripsi}
                    onChange={(e) => update("deskripsi", e.target.value)}
                    placeholder="Tuliskan detail petunjuk tugas yang harus dikerjakan siswa..."
                    className="theme-input w-full px-3.5 py-2.5 border theme-border rounded-lg text-sm theme-text outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] focus:border-[var(--color-primary)]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 border-t theme-border">
                  <Link
                    href={`/admin/lms-cbt/tugas-siswa/${id}`}
                    className="px-5 py-2.5 border theme-border rounded-lg text-sm font-medium theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] transition"
                  >
                    Batal
                  </Link>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50 shadow-sm"
                  >
                    {submitting && <Loader2 size={16} className="animate-spin" />}
                    <span>{submitting ? "Menyimpan..." : "Simpan Perubahan"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
