"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Save,
  Info,
  CalendarDays,
  Clock3,
} from "lucide-react";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  getDetailUjian,
  updateUjian,
} from "@/services/ujian.service";

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

export default function EditUjianAdminPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [ujianData, setUjianData] = useState(null);

  const [form, setForm] = useState({
    judul: "",
    deskripsi: "",
    jenis: "Harian",
    durasi: 60,
    waktuMulai: "",
    waktuSelesai: "",
    nilaiKelulusan: "75",
    dipublikasikan: false,
  });

  useEffect(() => {
    let isMounted = true;
    async function fetchDetail() {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await getDetailUjian(id);
        if (isMounted && data) {
          setUjianData(data);
          setForm({
            judul: data.judul || "",
            deskripsi: data.deskripsi || "",
            jenis: data.tipe || "Harian",
            durasi: data.durasi || 60,
            waktuMulai: toDatetimeLocal(data.waktuMulai),
            waktuSelesai: toDatetimeLocal(data.waktuSelesai),
            nilaiKelulusan:
              data.nilaiKelulusan != null ? String(data.nilaiKelulusan) : "75",
            dipublikasikan: Boolean(data.dipublikasikan),
          });
        }
      } catch (err) {
        console.error("Gagal memuat detail ujian:", err);
        if (isMounted) {
          setError(
            err?.message || "Gagal memuat data ujian dari server atau data tidak ditemukan."
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchDetail();
    return () => {
      isMounted = false;
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
        jenis: form.jenis,
        durasi: Number(form.durasi),
        waktuMulai: form.waktuMulai
          ? new Date(form.waktuMulai).toISOString()
          : undefined,
        waktuSelesai: form.waktuSelesai
          ? new Date(form.waktuSelesai).toISOString()
          : undefined,
        nilaiKelulusan:
          form.nilaiKelulusan !== "" && form.nilaiKelulusan != null
            ? Number(form.nilaiKelulusan)
            : undefined,
        dipublikasikan: Boolean(form.dipublikasikan),
      };

      await updateUjian(id, payload);
      setSuccess(`Perubahan ujian "${form.judul}" berhasil disimpan.`);
      setTimeout(() => {
        router.push(`/admin/lms-cbt/ujian/${id}`);
      }, 1200);
    } catch (err) {
      console.error("Gagal memperbarui ujian:", err);
      setError(err?.message || "Gagal memperbarui ujian. Periksa input data Anda.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen theme-page flex">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Header />

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm theme-text-secondary mb-4">
            <Link
              href="/admin/lms-cbt/ujian"
              className="hover:text-[var(--color-primary)] transition"
            >
              Ujian CBT Online
            </Link>
            <span>/</span>
            <Link
              href={`/admin/lms-cbt/ujian/${id}`}
              className="hover:text-[var(--color-primary)] transition truncate max-w-xs"
            >
              {ujianData?.judul || "Detail Ujian"}
            </Link>
            <span>/</span>
            <span className="theme-text font-medium">Edit Ujian</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/lms-cbt/ujian/${id}`}
                className="
                  p-2 border theme-border rounded-lg theme-text-secondary
                  hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
                  hover:theme-text transition
                "
                title="Kembali ke rincian ujian"
              >
                <ArrowLeft size={18} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold theme-text tracking-tight">
                  Edit Ujian CBT
                </h1>
                <p className="text-sm theme-text-secondary mt-0.5">
                  Perbarui judul, jenis, durasi, jadwal, nilai kelulusan, dan status publikasi.
                </p>
              </div>
            </div>
          </div>

          {success && (
            <div className="max-w-3xl mb-6 p-4 rounded-xl border border-[color-mix(in_srgb,var(--color-success)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] flex items-center gap-2.5 text-sm text-[var(--color-success)]">
              <CheckCircle2 size={18} />
              <span className="font-medium">{success}</span>
            </div>
          )}

          {loading ? (
            <div className="max-w-3xl p-12 text-center theme-card border theme-border rounded-xl">
              <Loader2
                size={32}
                className="animate-spin text-[var(--color-primary)] mx-auto mb-3"
              />
              <p className="text-sm theme-text-secondary">
                Memuat data ujian dari server...
              </p>
            </div>
          ) : error && !ujianData ? (
            <div className="max-w-3xl p-6 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] flex items-start gap-3 text-sm text-[var(--color-danger)]">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Gagal Memuat Data Ujian</p>
                <p className="mt-1">{error}</p>
                <Link
                  href="/admin/lms-cbt/ujian"
                  className="inline-block mt-3 px-3.5 py-1.5 bg-[var(--color-danger)] text-white rounded-md text-xs font-medium hover:opacity-90 transition"
                >
                  Kembali ke Daftar Ujian
                </Link>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl theme-card border theme-border rounded-xl p-6 shadow-sm">
              <div className="mb-6 p-4 rounded-xl theme-card-soft border theme-border flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="theme-text-muted block text-[11px]">Kelas & Mata Pelajaran:</span>
                  <span className="font-semibold theme-text text-sm">
                    {ujianData?.kelasMapel?.kelas?.nama || "-"} • {ujianData?.kelasMapel?.mataPelajaran?.nama || "-"}
                  </span>
                </div>
                <div>
                  <span className="theme-text-muted block text-[11px]">Guru Pengajar:</span>
                  <span className="font-medium theme-text">
                    {ujianData?.kelasMapel?.guruPengajar?.namaLengkap || "-"}
                  </span>
                </div>
                <div>
                  <span className="theme-text-muted block text-[11px]">Total Soal:</span>
                  <span className="font-semibold theme-text text-[var(--color-primary)]">
                    {ujianData?.soalAsesmen?.length || 0} Soal
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
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
                    Judul / Nama Ujian *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.judul}
                    onChange={(e) => update("judul", e.target.value)}
                    placeholder="Contoh: Penilaian Harian Bab 2 Fisika Terapan"
                    className="theme-input w-full px-3.5 py-2.5 border theme-border rounded-lg text-sm theme-text outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] focus:border-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-2">
                    Deskripsi / Petunjuk Ujian
                  </label>
                  <textarea
                    rows={3}
                    value={form.deskripsi}
                    onChange={(e) => update("deskripsi", e.target.value)}
                    placeholder="Petunjuk atau catatan bagi siswa..."
                    className="theme-input w-full px-3.5 py-2.5 border theme-border rounded-lg text-sm theme-text outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] focus:border-[var(--color-primary)]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-2">
                      Tipe / Jenis Ujian *
                    </label>
                    <select
                      value={form.jenis}
                      onChange={(e) => update("jenis", e.target.value)}
                      className="theme-input w-full px-3.5 py-2.5 border theme-border rounded-lg text-sm theme-text-secondary outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] focus:border-[var(--color-primary)]"
                    >
                      <option value="Harian">Ulangan Harian</option>
                      <option value="UTS">UTS (Tengah Semester)</option>
                      <option value="UAS">UAS (Akhir Semester)</option>
                      <option value="Kuis">Kuis</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-2">
                      Durasi Pengerjaan (Menit) *
                    </label>
                    <input
                      type="number"
                      min={5}
                      required
                      value={form.durasi}
                      onChange={(e) => update("durasi", e.target.value)}
                      className="theme-input w-full px-3.5 py-2.5 border theme-border rounded-lg text-sm theme-text outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] focus:border-[var(--color-primary)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-2">
                      Waktu Mulai
                    </label>
                    <input
                      type="datetime-local"
                      value={form.waktuMulai}
                      onChange={(e) => update("waktuMulai", e.target.value)}
                      className="theme-input w-full px-3.5 py-2.5 border theme-border rounded-lg text-sm theme-text-secondary outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] focus:border-[var(--color-primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-2">
                      Waktu Selesai
                    </label>
                    <input
                      type="datetime-local"
                      value={form.waktuSelesai}
                      onChange={(e) => update("waktuSelesai", e.target.value)}
                      className="theme-input w-full px-3.5 py-2.5 border theme-border rounded-lg text-sm theme-text-secondary outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] focus:border-[var(--color-primary)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
                  <div>
                    <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-2">
                      Nilai Kelulusan (KKM)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={form.nilaiKelulusan}
                      onChange={(e) => update("nilaiKelulusan", e.target.value)}
                      placeholder="Contoh: 75"
                      className="theme-input w-full px-3.5 py-2.5 border theme-border rounded-lg text-sm theme-text outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] focus:border-[var(--color-primary)]"
                    />
                  </div>

                  <div className="pt-4 sm:pt-6">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={form.dipublikasikan}
                        onChange={(e) => update("dipublikasikan", e.target.checked)}
                        className="rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] h-4 w-4"
                      />
                      <span className="text-xs font-medium theme-text">
                        Publikasikan Ujian (Dapat Diakses Siswa)
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 border-t theme-border">
                  <Link
                    href={`/admin/lms-cbt/ujian/${id}`}
                    className="px-4 py-2.5 border theme-border rounded-lg text-sm font-medium theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] transition"
                  >
                    Batal
                  </Link>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50 shadow-sm"
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
