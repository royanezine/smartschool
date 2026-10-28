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

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b theme-border">
          <Header />
        </div>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-4xl">
              
              <div className="mb-6 flex flex-col gap-4">
                <Link
                  href="/admin/cms/articles/categories"
                  className="theme-text-muted inline-flex w-fit items-center gap-2 text-sm font-medium transition hover:opacity-70"
                >
                  <ArrowLeft size={16} />
                  Kembali ke Daftar Kategori
                </Link>

                <div>
                  <h1 className="theme-text text-2xl font-bold">Tambah Kategori</h1>
                  <p className="theme-text-muted mt-1 text-sm">Buat kategori baru untuk mengelompokkan artikel.</p>
                </div>
              </div>

              {error && (
                <div className="theme-danger mb-6 flex items-start gap-3 rounded-xl border p-4">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="theme-card theme-border rounded-2xl border shadow-sm overflow-hidden">
                <div className="grid grid-cols-1 gap-6 p-6 sm:p-8 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="theme-text-secondary mb-2 block text-sm font-semibold">
                      Nama Kategori <span className="text-[var(--color-danger)]">*</span>
                    </label>
                    <div className="relative">
                      <Tags size={18} className="theme-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        name="nama"
                        value={form.nama}
                        onChange={handleChange}
                        placeholder="Contoh: Berita Sekolah"
                        className="theme-input w-full rounded-xl border pl-10 pr-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
                        autoFocus
                      />
                    </div>
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
                  </div>
                </div>

                <div className="theme-card-soft theme-border-soft flex flex-col-reverse gap-3 border-t p-4 sm:flex-row sm:justify-end sm:px-8 sm:py-5">
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
                    {saving ? <><Loader2 size={18} className="animate-spin" /> Menyimpan...</> : <><Save size={18} /> Simpan Kategori</>}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}