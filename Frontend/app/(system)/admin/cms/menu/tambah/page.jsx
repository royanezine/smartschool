"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { apiFetch } from "../../../../../../lib/api";

import {
  Plus,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Save,
  Image as ImageIcon,
  ArrowUpDown,
} from "lucide-react";

const API_URL = "/api/cms/menu-konfigurasi";

const INITIAL_FORM = {
  halaman: "",
  section: "",
  judul: "",
  subJudul: "",
  konten: "",
  gambarUrl: "",
  ctaText: "",
  ctaLink: "",
  urutan: 1,
  status: "aktif",
};

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

export default function TambahMenuPage() {
  const router = useRouter();

  const [active, setActive] = useState("menu");
  const [collapsed, setCollapsed] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ ...INITIAL_FORM });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const halaman = formData.halaman.trim();
    const section = formData.section.trim();
    const judul = formData.judul.trim();

    if (!halaman) return setError("Nama halaman wajib diisi.");
    if (!section) return setError("Section wajib diisi.");
    if (!judul) return setError("Judul menu atau konten wajib diisi.");

    const parsedUrutan = Number(formData.urutan);
    if (!Number.isInteger(parsedUrutan) || parsedUrutan < 1) {
      return setError("Urutan harus berupa angka bulat minimal 1.");
    }

    const payload = {
      halaman,
      section,
      judul,
      subJudul: formData.subJudul.trim() || null,
      konten: formData.konten || null,
      gambarUrl: formData.gambarUrl.trim() || null,
      ctaText: formData.ctaText.trim() || null,
      ctaLink: formData.ctaLink.trim() || null,
      urutan: parsedUrutan,
      status: formData.status,
    };

    try {
      setSaving(true);
      setError("");

      await apiFetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      router.push("/admin/cms/menu?success=created");
    } catch (err) {
      console.error("Gagal menyimpan:", err);
      setError(getErrorMessage(err, "Gagal menyimpan konfigurasi menu."));
    } finally {
      setSaving(false);
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

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="shrink-0">
          <Header
            title="Tambah Konfigurasi Menu"
            user={{
              name: "CMS Admin",
              email: "cms@smartschool.com",
              avatar: "CA",
            }}
          />
        </div>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="w-full px-3 py-5 sm:px-6 lg:px-9">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/admin/cms/menu")}
                  className="theme-card theme-border theme-text-secondary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
                  title="Kembali"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>

                <div className="theme-info flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border">
                  <Plus className="h-5 w-5" />
                </div>

                <div>
                  <h1 className="theme-text text-2xl font-bold">
                    Tambah Konfigurasi
                  </h1>
                  <p className="theme-text-secondary mt-1 text-sm">
                    Buat konfigurasi menu baru untuk website sekolah.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="theme-danger mb-4 flex items-start gap-3 rounded-xl border p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="min-w-0 flex-1 text-sm">{error}</div>
                <button type="button" onClick={() => setError("")}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="theme-card theme-border rounded-2xl border"
            >
              <div className="space-y-5 p-5 sm:p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="theme-text mb-2 block text-sm font-semibold">
                      Halaman <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      name="halaman"
                      value={formData.halaman}
                      onChange={handleChange}
                      placeholder="Contoh: beranda"
                      className="theme-input w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
                    />
                    <p className="theme-text-muted mt-1 text-xs">
                      Contoh: beranda, profil, kontak.
                    </p>
                  </div>

                  <div>
                    <label className="theme-text mb-2 block text-sm font-semibold">
                      Section <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      name="section"
                      value={formData.section}
                      onChange={handleChange}
                      placeholder="Contoh: hero"
                      className="theme-input w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
                    />
                    <p className="theme-text-muted mt-1 text-xs">
                      Contoh: hero, sambutan, fasilitas.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="theme-text mb-2 block text-sm font-semibold">
                    Judul <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    name="judul"
                    value={formData.judul}
                    onChange={handleChange}
                    placeholder="Contoh: Selamat Datang di Website Sekolah"
                    className="theme-input w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="theme-text mb-2 block text-sm font-semibold">
                    Subjudul
                  </label>
                  <input
                    name="subJudul"
                    value={formData.subJudul}
                    onChange={handleChange}
                    placeholder="Masukkan subjudul jika diperlukan"
                    className="theme-input w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="theme-text mb-2 block text-sm font-semibold">
                    Konten
                  </label>
                  <textarea
                    rows={6}
                    name="konten"
                    value={formData.konten}
                    onChange={handleChange}
                    placeholder="Masukkan isi konten..."
                    className="theme-input w-full rounded-xl border px-3 py-3 text-sm leading-6 outline-none focus:border-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="theme-text mb-2 block text-sm font-semibold">
                    URL Gambar
                  </label>
                  <input
                    name="gambarUrl"
                    type="url"
                    value={formData.gambarUrl}
                    onChange={handleChange}
                    placeholder="https://contoh.com/gambar.jpg"
                    className="theme-input w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
                  />

                  {formData.gambarUrl ? (
                    <div className="theme-card-soft mt-3 overflow-hidden rounded-xl border p-2">
                      <img
                        src={formData.gambarUrl}
                        alt="Preview gambar"
                        className="max-h-56 w-full rounded-lg object-contain"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="theme-card-soft mt-3 flex items-center gap-2 rounded-xl border p-3">
                      <ImageIcon className="theme-text-muted h-4 w-4" />
                      <span className="theme-text-muted text-xs">
                        Belum ada gambar
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="theme-text mb-2 block text-sm font-semibold">
                      Teks tombol CTA
                    </label>
                    <input
                      name="ctaText"
                      value={formData.ctaText}
                      onChange={handleChange}
                      placeholder="Contoh: Pelajari Selengkapnya"
                      className="theme-input w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>

                  <div>
                    <label className="theme-text mb-2 block text-sm font-semibold">
                      Link tombol CTA
                    </label>
                    <input
                      name="ctaLink"
                      value={formData.ctaLink}
                      onChange={handleChange}
                      placeholder="/profil atau https://..."
                      className="theme-input w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
                  <div>
                    <label className="theme-text mb-2 block text-sm font-semibold">
                      Urutan
                    </label>
                    <div className="relative">
                      <ArrowUpDown className="theme-text-muted pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                      <input
                        required
                        type="number"
                        min="1"
                        step="1"
                        name="urutan"
                        value={formData.urutan}
                        onChange={handleChange}
                        className="theme-input w-full rounded-xl border py-3 pl-9 pr-3 text-sm outline-none focus:border-[var(--color-primary)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="theme-text mb-2 block text-sm font-semibold">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="theme-input w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
                    >
                      <option value="aktif">Aktif</option>
                      <option value="nonaktif">Nonaktif</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="theme-card-soft theme-border flex flex-col-reverse gap-2 rounded-b-2xl border-t p-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => router.push("/admin/cms/menu")}
                  className="theme-card theme-border theme-text-secondary rounded-xl border px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="theme-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Simpan Konfigurasi
                    </>
                  )}
                </button>
              </div>
            </form>

            <footer className="py-7 text-center">
              <p className="theme-text-muted text-xs">
                © 2026 SmartSchool • CMS Management
              </p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}