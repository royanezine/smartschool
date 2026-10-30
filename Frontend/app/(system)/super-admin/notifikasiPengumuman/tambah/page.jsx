"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Megaphone,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Save,
} from "lucide-react";

import { kirimBroadcastPengumuman } from "@/services/notifikasi.service";

export default function TambahPengumumanPage() {
  const router = useRouter();

  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");
  const [targetRole, setTargetRole] = useState("semua");
  const [kategori, setKategori] = useState("Pengumuman");
  const [prioritas, setPrioritas] = useState("medium");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!judul.trim() || !isi.trim()) {
      setError("Judul dan isi pengumuman wajib diisi.");
      return;
    }

    setSubmitting(true);

    try {
      await kirimBroadcastPengumuman({
        judul: judul.trim(),
        isi: isi.trim(),
        targetRole,
      });

      setSuccess("Pengumuman berhasil disiarkan ke seluruh target pengguna.");
      setTimeout(() => {
        router.push("/super-admin/notifikasiPengumuman");
      }, 1000);
    } catch (err) {
      console.error("Gagal mengirim broadcast pengumuman:", err);
      setError(err?.message || "Gagal menyiarkan pengumuman.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
        <div className="space-y-6">
          <div>
            <Link
              href="/super-admin/notifikasiPengumuman"
              className="theme-text-muted inline-flex items-center gap-2 text-sm transition-colors hover:text-[var(--color-primary)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Notifikasi & Pengumuman
            </Link>
            <h1 className="theme-text mt-2 text-2xl font-bold">
              Buat Pengumuman Baru
            </h1>
            <p className="theme-text-secondary mt-1 text-sm">
              Siarkan pesan pengumuman sistem kepada sekolah, guru, yayasan, atau seluruh pengguna.
            </p>
          </div>

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

          <form
            onSubmit={handleSubmit}
            className="theme-card theme-border rounded-2xl border p-6 shadow-sm sm:p-8"
          >
            <div className="space-y-5">
              <div>
                <label className="theme-text mb-2 block text-sm font-semibold">
                  Judul Pengumuman <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="Contoh: Pemeliharaan Server Terjadwal"
                  disabled={submitting}
                  className="theme-input w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div>
                  <label className="theme-text mb-2 block text-sm font-semibold">
                    Target Penerima
                  </label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    disabled={submitting}
                    className="theme-input w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none"
                  >
                    <option value="semua">Semua Pengguna</option>
                    <option value="admin_sekolah">Admin Sekolah</option>
                    <option value="guru">Guru</option>
                    <option value="siswa">Siswa</option>
                    <option value="yayasan">Yayasan</option>
                  </select>
                </div>

                <div>
                  <label className="theme-text mb-2 block text-sm font-semibold">
                    Kategori
                  </label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    disabled={submitting}
                    className="theme-input w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none"
                  >
                    <option value="Pengumuman">Pengumuman</option>
                    <option value="Sistem">Sistem</option>
                    <option value="Keamanan">Keamanan</option>
                    <option value="Kebijakan">Kebijakan</option>
                    <option value="Acara">Acara</option>
                  </select>
                </div>

                <div>
                  <label className="theme-text mb-2 block text-sm font-semibold">
                    Prioritas
                  </label>
                  <select
                    value={prioritas}
                    onChange={(e) => setPrioritas(e.target.value)}
                    disabled={submitting}
                    className="theme-input w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none"
                  >
                    <option value="low">Rendah (Info)</option>
                    <option value="medium">Sedang (Penting)</option>
                    <option value="high">Tinggi (Mendesak)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="theme-text mb-2 block text-sm font-semibold">
                  Isi Pengumuman <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={6}
                  value={isi}
                  onChange={(e) => setIsi(e.target.value)}
                  placeholder="Tuliskan isi pengumuman secara rinci..."
                  disabled={submitting}
                  className="theme-input w-full rounded-xl border p-3.5 text-sm outline-none"
                  required
                />
              </div>
            </div>

            <div className="theme-border mt-8 flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
              <Link
                href="/super-admin/notifikasiPengumuman"
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
                    Menyiarkan...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Siarkan Pengumuman
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
