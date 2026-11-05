"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { apiFetch } from "../../../../../../../lib/api";

import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  Tags,
  Eye,
  BookOpen,
  CheckCircle2,
  Lightbulb,
  Info,
} from "lucide-react";

export default function CreateCategoryPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nama: "",
    status: "aktif",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nama.trim()) {
      setError("Nama kategori wajib diisi.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await apiFetch("/api/cms/kategori-artikel", {
        method: "POST",
        body: JSON.stringify({
          nama: form.nama.trim(),
          status: form.status,
        }),
      });

      router.push("/admin/cms/articles/categories");
      router.refresh();
    } catch (err) {
      setError(err?.message || "Gagal menyimpan kategori.");
    } finally {
      setSaving(false);
    }
  }

  const isAktif = form.status === "aktif";

  return (
    // ✅ ROOT pakai flex h-screen overflow-hidden
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        
        {/* ✅ Header dibungkus shrink-0 */}
        <div className="shrink-0 border-b theme-border">
          <Header />
        </div>

        {/* ✅ Body flex min-h-0 flex-1 */}
        <div className="flex min-h-0 flex-1">
          
          {/* ✅ Main min-w-0 flex-1 overflow-y-auto */}
          <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
            
            {/* ✅ Konten w-full (max-w dihapus) agar melebar penuh saat zoom out */}
            <div className="w-full px-4 py-6 sm:px-6 lg:px-8 2xl:px-12">
              
              {/* Header Halaman */}
              <div className="mb-6 flex flex-col gap-4">
                <Link
                  href="/admin/cms/articles/categories"
                  className="theme-text-muted inline-flex w-fit items-center gap-2 text-sm font-medium transition hover:opacity-70"
                >
                  <ArrowLeft size={16} />
                  Kembali ke Daftar Kategori
                </Link>

                <div className="flex min-w-0 items-center gap-3">
                  <div className="theme-info flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                    <Tags className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="theme-text text-2xl font-bold">Tambah Kategori</h1>
                    <p className="theme-text-muted mt-1 text-sm">
                      Buat kategori baru untuk mengelompokkan artikel.
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="theme-danger mb-6 flex items-start gap-3 rounded-xl border p-4">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* ✅ Grid Responsif (Tanpa space kosong di tengah karena minmax(0,...)) */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)] 2xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                
                {/* === FORM (KIRI) === */}
                <form
                  onSubmit={handleSubmit}
                  className="theme-card theme-border flex h-fit min-w-0 flex-col overflow-hidden rounded-2xl border shadow-sm"
                >
                  <div className="grid grid-cols-1 gap-6 p-6 sm:p-8 md:grid-cols-2">
                    
                    <div className="md:col-span-2">
                      <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                        Nama Kategori <span className="text-[var(--color-danger)]">*</span>
                      </label>
                      <div className="relative">
                        <Tags
                          size={18}
                          className="theme-text-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                        />
                        <input
                          type="text"
                          name="nama"
                          value={form.nama}
                          onChange={handleChange}
                          placeholder="Contoh: Berita Sekolah"
                          className="theme-input w-full rounded-xl border py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)]"
                          autoFocus
                        />
                      </div>
                      <p className="theme-text-muted mt-2 text-xs">
                        Gunakan nama yang singkat dan jelas agar mudah dikenali.
                      </p>
                    </div>

                    <div>
                      <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                        Status
                      </label>
                      <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className="theme-input w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
                      >
                        <option value="aktif">Aktif</option>
                        <option value="nonaktif">Nonaktif</option>
                      </select>
                      <p className="theme-text-muted mt-2 text-xs leading-5">
                        Kategori nonaktif tidak akan muncul saat memilih kategori artikel.
                      </p>
                    </div>

                    <div>
                      <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                        Preview Status
                      </label>
                      <div
                        className={`flex h-[46px] items-center gap-2 rounded-xl border px-4 ${
                          isAktif ? "theme-success" : "theme-card-soft theme-text-secondary"
                        }`}
                      >
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            isAktif ? "bg-[var(--color-success)]" : "bg-[var(--color-text-muted)]"
                          }`}
                        />
                        <span className="text-sm font-semibold">
                          {isAktif ? "Aktif" : "Nonaktif"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Form (Tombol) */}
                  <div className="theme-card-soft theme-border-soft mt-auto flex flex-col-reverse gap-3 border-t p-4 sm:flex-row sm:justify-end sm:px-8 sm:py-5">
                    <Link
                      href="/admin/cms/articles/categories"
                      className="theme-card theme-border theme-text-secondary inline-flex h-11 items-center justify-center rounded-xl border px-5 text-sm font-semibold transition hover:opacity-80"
                    >
                      Batal
                    </Link>
                    <button
                      type="submit"
                      disabled={saving}
                      className="theme-primary inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold shadow-sm transition disabled:opacity-60"
                    >
                      {saving ? (
                        <>
                          <Loader2 size={18} className="animate-spin" /> Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save size={18} /> Simpan Kategori
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* === SIDEBAR CARD (KANAN) — Mengisi ruang kosong === */}
                <aside className="flex min-w-0 flex-col gap-4">
                  
                  {/* Card: Preview */}
                  <section className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">
                    <div className="theme-card-soft theme-border flex items-center gap-3 border-b px-5 py-3">
                      <div className="theme-info flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                        <Eye className="h-4 w-4" />
                      </div>
                      <h2 className="theme-text text-sm font-bold">Preview</h2>
                    </div>
                    <div className="p-4">
                      <div className="theme-card-soft theme-border rounded-xl border p-4">
                        <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                          Nama Kategori
                        </p>
                        <p className="theme-text mt-1.5 break-words text-sm font-semibold">
                          {form.nama.trim() || "Belum ada nama"}
                        </p>
                        <div className="theme-border-soft my-3 h-px" />
                        <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                          Status
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              isAktif ? "bg-[var(--color-success)]" : "bg-[var(--color-text-muted)]"
                            }`}
                          />
                          <span className="theme-text text-sm font-semibold">
                            {isAktif ? "Aktif" : "Nonaktif"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Card: Panduan */}
                  <section className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">
                    <div className="theme-card-soft theme-border flex items-center gap-3 border-b px-5 py-3">
                      <div className="theme-info flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <h2 className="theme-text text-sm font-bold">Panduan</h2>
                    </div>
                    <div className="p-4">
                      <ul className="space-y-3 text-xs leading-5">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[var(--color-success)]" />
                          <span className="theme-text-secondary">
                            Gunakan nama yang singkat, misalnya &quot;Berita&quot;.
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[var(--color-success)]" />
                          <span className="theme-text-secondary">
                            Hindari nama yang mirip dengan kategori lain.
                          </span>
                        </li>
                      </ul>
                    </div>
                  </section>

                  {/* Card: Info Biru */}
                  <section className="theme-info theme-border flex items-start gap-3 rounded-2xl border p-4">
                    <Lightbulb size={16} className="mt-0.5 shrink-0 text-[var(--color-info)]" />
                    <p className="text-xs leading-5">
                      Kategori membantu pembaca menemukan artikel yang relevan.
                    </p>
                  </section>

                  {/* Card: Info Sistem */}
                  <section className="theme-card theme-border rounded-2xl border p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="theme-card-soft theme-text-secondary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                        <Info className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="theme-text text-sm font-bold">
                          Informasi Sistem
                        </h3>
                        <div className="theme-text-secondary mt-1.5 space-y-1.5 text-xs leading-5">
                          <p>• Nama wajib diisi.</p>
                          <p>• Status default: Aktif.</p>
                          <p>• Dapat diubah kapan saja.</p>
                        </div>
                      </div>
                    </div>
                  </section>
                </aside>

              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}