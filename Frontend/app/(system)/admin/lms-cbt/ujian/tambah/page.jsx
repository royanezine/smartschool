"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Loader2,
  AlertCircle,
  FileQuestion,
  Info,
  CalendarDays,
  Clock3,
} from "lucide-react";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  createUjian,
  getKelasMapelAdmin,
} from "@/services/ujian.service";

export default function TambahUjianAdminPage() {
  const router = useRouter();

  const [kelasList, setKelasList] = useState([]);
  const [loadingKelas, setLoadingKelas] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    kelasMapelId: "",
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
    async function loadKelasMapel() {
      try {
        setLoadingKelas(true);
        const data = await getKelasMapelAdmin();
        if (isMounted) {
          setKelasList(Array.isArray(data) ? data : []);
          if (data && data.length > 0) {
            setForm((prev) => ({
              ...prev,
              kelasMapelId: prev.kelasMapelId || data[0].id,
            }));
          }
        }
      } catch (err) {
        console.error("Gagal memuat daftar kelas-mapel:", err);
      } finally {
        if (isMounted) setLoadingKelas(false);
      }
    }
    loadKelasMapel();
    return () => {
      isMounted = false;
    };
  }, []);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        kelasMapelId: form.kelasMapelId,
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

      await createUjian(payload);
      router.push("/admin/lms-cbt/ujian");
    } catch (err) {
      console.error("Gagal membuat ujian baru:", err);
      setError(
        err?.message ||
          "Gagal membuat ujian. Backend mensyaratkan pengguna merupakan guru pengampu mata pelajaran terkait."
      );
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
              href="/admin/lms-cbt/ujian"
              className="hover:text-[var(--color-primary)] transition"
            >
              Ujian CBT Online
            </Link>
            <span>/</span>
            <span className="theme-text font-medium">Buat Ujian Baru</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Link
                href="/admin/lms-cbt/ujian"
                className="
                  p-2 border theme-border rounded-lg theme-text-secondary
                  hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
                  hover:theme-text transition
                "
                title="Kembali ke daftar ujian"
              >
                <ArrowLeft size={18} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold theme-text tracking-tight">
                  Buat Ujian CBT
                </h1>
                <p className="text-sm theme-text-secondary mt-0.5">
                  Konfigurasikan judul, kelas mata pelajaran, durasi, dan jadwal ujian sekolah.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full mb-6 p-4 rounded-xl border border-[color-mix(in_srgb,var(--color-info)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)] flex items-start gap-3 text-xs theme-text">
            <Info size={18} className="text-[var(--color-info)] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <p className="font-semibold text-[var(--color-info)]">
                Informasi Aturan Backend
              </p>
              <p className="mt-0.5 text-xs opacity-90">
                Sesuai arsitektur backend, pembuatan asesmen baru pada kelas-mapel tertentu terikat pada akun guru pengampu. Jika akun admin belum ditugaskan sebagai pengampu kelas tersebut, backend akan merespons dengan penolakan hak akses.
              </p>
            </div>
          </div>

          <div className="w-full theme-card border theme-border rounded-xl p-6 md:p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-lg border border-[color-mix(in_srgb,var(--color-danger)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] text-xs text-[var(--color-danger)] flex items-start gap-2.5">
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Gagal Menyimpan Ujian</p>
                    <p className="mt-0.5 leading-relaxed">{error}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-2">
                    Kelas & Mata Pelajaran *
                  </label>
                  {loadingKelas ? (
                    <div className="flex items-center gap-2 p-2.5 text-xs theme-text-muted border theme-border rounded-lg">
                      <Loader2 size={14} className="animate-spin" />
                      <span>Memuat daftar kelas mata pelajaran sekolah...</span>
                    </div>
                  ) : (
                    <select
                      required
                      value={form.kelasMapelId}
                      onChange={(e) => update("kelasMapelId", e.target.value)}
                      className="theme-input w-full px-3.5 py-2.5 border theme-border rounded-lg text-sm theme-text-secondary outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] focus:border-[var(--color-primary)]"
                    >
                      {kelasList.length === 0 ? (
                        <option value="">Tidak ada kelas-mapel tersedia</option>
                      ) : (
                        kelasList.map((km) => (
                          <option key={km.id} value={km.id}>
                            {km.kelas?.nama || km.kelas?.namaKelas || "Kelas"} - {" "}
                            {km.mataPelajaran?.nama || km.mataPelajaran?.namaMapel || "Mapel"}
                            {km.guruPengajar?.namaLengkap ? ` (${km.guruPengajar.namaLengkap})` : ""}
                          </option>
                        ))
                      )}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-2">
                    Judul / Nama Ujian *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.judul}
                    onChange={(e) => update("judul", e.target.value)}
                    placeholder="Contoh: Penilaian Harian Bab 1 Algoritma & Pemrograman"
                    className="theme-input w-full px-3.5 py-2.5 border theme-border rounded-lg text-sm theme-text outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold theme-text uppercase tracking-wider mb-2">
                  Deskripsi / Petunjuk Ujian
                </label>
                <textarea
                  rows={3}
                  value={form.deskripsi}
                  onChange={(e) => update("deskripsi", e.target.value)}
                  placeholder="Tuliskan petunjuk pengerjaan, tata tertib, atau informasi asesmen bagi siswa..."
                  className="theme-input w-full px-3.5 py-2.5 border theme-border rounded-lg text-sm theme-text outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] focus:border-[var(--color-primary)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-center pt-2">
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

                <div className="pt-2 sm:pt-4">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.dipublikasikan}
                      onChange={(e) => update("dipublikasikan", e.target.checked)}
                      className="rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] h-4 w-4"
                    />
                    <span className="text-xs font-medium theme-text">
                      Publikasikan Ujian Sekarang
                    </span>
                  </label>
                  <p className="text-[11px] theme-text-muted mt-1 pl-6">
                    Ujian langsung dapat dikerjakan siswa.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t theme-border">
                <Link
                  href="/admin/lms-cbt/ujian"
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
                  <span>{submitting ? "Menyimpan..." : "Buat Ujian"}</span>
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
