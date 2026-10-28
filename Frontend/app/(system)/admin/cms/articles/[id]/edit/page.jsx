"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  FileText,
} from "lucide-react";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import { apiFetch } from "../../../../../../../lib/api";

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [categories, setCategories] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [form, setForm] = useState({
    judul: "",
    kategoriArtikelId: "",
    ringkasan: "",
    konten: "",
    gambarUtama: "",
    status: "draft",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const artikelResponse = await apiFetch("/api/cms/artikel");

      let artikelList = [];
      if (Array.isArray(artikelResponse)) {
        artikelList = artikelResponse;
      } else if (Array.isArray(artikelResponse?.data)) {
        artikelList = artikelResponse.data;
      } else if (Array.isArray(artikelResponse?.data?.data)) {
        artikelList = artikelResponse.data.data;
      } else if (Array.isArray(artikelResponse?.result)) {
        artikelList = artikelResponse.result;
      } else if (Array.isArray(artikelResponse?.result?.data)) {
        artikelList = artikelResponse.result.data;
      }

      const selectedArticle = artikelList.find(
        (item) => String(item?.id) === String(id)
      );

      if (!selectedArticle) {
        throw new Error("Artikel yang ingin diedit tidak ditemukan.");
      }

      const kategoriResponse = await apiFetch("/api/cms/kategori-artikel");

      let kategoriList = [];
      if (Array.isArray(kategoriResponse)) {
        kategoriList = kategoriResponse;
      } else if (Array.isArray(kategoriResponse?.data)) {
        kategoriList = kategoriResponse.data;
      } else if (Array.isArray(kategoriResponse?.data?.data)) {
        kategoriList = kategoriResponse.data.data;
      } else if (Array.isArray(kategoriResponse?.result)) {
        kategoriList = kategoriResponse.result;
      } else if (Array.isArray(kategoriResponse?.result?.data)) {
        kategoriList = kategoriResponse.result.data;
      }

      setCategories(kategoriList);

      setForm({
        judul: selectedArticle?.judul || "",
        kategoriArtikelId:
          selectedArticle?.kategoriArtikelId ||
          selectedArticle?.kategoriArtikel?.id ||
          "",
        ringkasan:
          selectedArticle?.ringkasan || selectedArticle?.excerpt || "",
        konten: selectedArticle?.konten || selectedArticle?.isi || "",
        gambarUtama:
          selectedArticle?.gambarUtama || selectedArticle?.gambar || "",
        status: selectedArticle?.status || "draft",
      });
    } catch (err) {
      console.error("LOAD EDIT ARTIKEL ERROR:", err);
      setError(err?.message || "Gagal mengambil data artikel.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!id) {
      setError("ID artikel tidak ditemukan.");
      return;
    }

    if (!form.judul.trim()) {
      setError("Judul artikel wajib diisi.");
      return;
    }

    if (!form.kategoriArtikelId) {
      setError("Kategori artikel wajib dipilih.");
      return;
    }

    if (!form.konten.trim()) {
      setError("Konten artikel wajib diisi.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        judul: form.judul.trim(),
        kategoriArtikelId: form.kategoriArtikelId,
        ringkasan: form.ringkasan.trim(),
        konten: form.konten,
        gambarUtama: form.gambarUtama.trim() || null,
        status: form.status,
      };

      await apiFetch(`/api/cms/artikel/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setSuccess("Artikel berhasil diperbarui.");

      setTimeout(() => {
        router.push("/admin/cms/articles");
        router.refresh();
      }, 1000);
    } catch (err) {
      console.error("UPDATE ARTIKEL ERROR:", err);
      setError(err?.message || "Gagal memperbarui artikel.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="theme-page flex h-screen w-full overflow-hidden">
        <Sidebar
          role="cms"
          collapsed={!sidebarOpen}
          setCollapsed={(value) => {
            const next = typeof value === "function" ? value(!sidebarOpen) : value;
            setSidebarOpen(!next);
          }}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="shrink-0">
            <Header onMenuClick={() => setSidebarOpen((prev) => !prev)} />
          </div>
          <main className="theme-page flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-y-auto p-6">
            <div className="flex flex-col items-center gap-3">
              <Loader2
                className="h-8 w-8 animate-spin"
                style={{ color: "var(--color-primary)" }}
              />
              <p className="theme-text-secondary text-sm">Memuat data artikel...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    // 1. ROOT: flex h-screen overflow-hidden (halaman tidak bisa scroll)
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        role="cms"
        collapsed={!sidebarOpen}
        setCollapsed={(value) => {
          const next = typeof value === "function" ? value(!sidebarOpen) : value;
          setSidebarOpen(!next);
        }}
      />

      {/* 2. BODY: min-h-0 flex-1 (sejajar dengan sidebar) */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* 3. HEADER: shrink-0 (tetap di atas) */}
        <div className="shrink-0 border-b theme-border">
          <Header onMenuClick={() => setSidebarOpen((prev) => !prev)} />
        </div>

        {/* 4. MAIN: min-w-0 flex-1 overflow-y-auto (hanya ini yang scroll) */}
        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          {/* 5. KONTEN: w-full (bukan max-w-[1600px]) */}
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <div className="w-full space-y-6">
              
              {/* HEADER PAGE */}
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Link
                      href="/admin/cms/articles"
                      className="theme-text-muted inline-flex items-center gap-1 text-sm transition-opacity hover:opacity-70"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Kembali
                    </Link>
                  </div>

                  <h1 className="theme-text text-2xl font-bold">
                    Edit Artikel
                  </h1>

                  <p className="theme-text-secondary mt-1 text-sm">
                    Perbarui informasi dan isi artikel.
                  </p>
                </div>
              </div>

              {/* ALERTS */}
              {error && (
                <div className="theme-danger flex items-start gap-3 rounded-xl border p-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-semibold">Terjadi kesalahan</p>
                    <p className="mt-1 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="theme-success flex items-start gap-3 rounded-xl border p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-semibold">Berhasil</p>
                    <p className="mt-1 text-sm">{success}</p>
                  </div>
                </div>
              )}

              {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <section className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">
                  <div className="theme-card-soft theme-border-soft border-b px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="theme-info flex h-10 w-10 items-center justify-center rounded-lg">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="theme-text font-semibold">Informasi Artikel</h2>
                        <p className="theme-text-muted text-sm">Informasi utama artikel.</p>
                      </div>
                    </div>
                  </div>

                  {/* Grid Responsif untuk form input */}
                  <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2 2xl:grid-cols-3">
                    
                    <div className="md:col-span-2 2xl:col-span-1">
                      <label htmlFor="judul" className="theme-text-secondary mb-2 block text-sm font-medium">
                        Judul Artikel <span className="ml-1 text-[var(--color-danger)]">*</span>
                      </label>
                      <input
                        id="judul"
                        name="judul"
                        type="text"
                        value={form.judul}
                        onChange={handleChange}
                        placeholder="Masukkan judul artikel"
                        className="theme-input w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
                      />
                    </div>

                    <div>
                      <label htmlFor="kategoriArtikelId" className="theme-text-secondary mb-2 block text-sm font-medium">
                        Kategori <span className="ml-1 text-[var(--color-danger)]">*</span>
                      </label>
                      <select
                        id="kategoriArtikelId"
                        name="kategoriArtikelId"
                        value={form.kategoriArtikelId}
                        onChange={handleChange}
                        className="theme-input w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
                      >
                        <option value="">Pilih kategori</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.nama}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="status" className="theme-text-secondary mb-2 block text-sm font-medium">
                        Status Publikasi
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className="theme-input w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
                      >
                        <option value="draft">Draft</option>
                        <option value="dipublikasikan">Dipublikasikan</option>
                      </select>
                    </div>

                    <div className="md:col-span-2 2xl:col-span-3">
                      <label htmlFor="ringkasan" className="theme-text-secondary mb-2 block text-sm font-medium">
                        Ringkasan
                      </label>
                      <textarea
                        id="ringkasan"
                        name="ringkasan"
                        value={form.ringkasan}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Masukkan ringkasan singkat artikel"
                        className="theme-input w-full resize-y rounded-xl border px-4 py-3 text-sm outline-none transition placeholder:opacity-70 focus:border-[var(--color-primary)]"
                      />
                    </div>

                    <div className="md:col-span-2 2xl:col-span-3">
                      <label htmlFor="gambarUtama" className="theme-text-secondary mb-2 flex items-center gap-2 text-sm font-medium">
                        <ImageIcon className="h-4 w-4" />
                        URL Gambar Utama
                      </label>
                      <input
                        id="gambarUtama"
                        name="gambarUtama"
                        type="text"
                        value={form.gambarUtama}
                        onChange={handleChange}
                        placeholder="https://..."
                        className="theme-input w-full rounded-xl border px-4 py-3 text-sm outline-none transition placeholder:opacity-70 focus:border-[var(--color-primary)]"
                      />
                      {form.gambarUtama && (
                        <div className="theme-card-soft theme-border mt-4 max-w-md overflow-hidden rounded-xl border">
                          <img
                            src={form.gambarUtama}
                            alt="Preview gambar utama"
                            className="max-h-64 w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <section className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">
                  <div className="theme-card-soft theme-border-soft border-b px-6 py-5">
                    <h2 className="theme-text font-semibold">Konten Artikel</h2>
                    <p className="theme-text-muted mt-1 text-sm">
                      Tulis isi artikel yang akan ditampilkan.
                    </p>
                  </div>

                  <div className="p-6">
                    <label htmlFor="konten" className="theme-text-secondary mb-2 block text-sm font-medium">
                      Konten <span className="ml-1 text-[var(--color-danger)]">*</span>
                    </label>
                    <textarea
                      id="konten"
                      name="konten"
                      value={form.konten}
                      onChange={handleChange}
                      rows={18}
                      placeholder="Tulis konten artikel..."
                      className="theme-input w-full resize-y rounded-xl border px-4 py-3 text-sm leading-7 outline-none transition placeholder:opacity-70 focus:border-[var(--color-primary)]"
                    />
                    <p className="theme-text-muted mt-2 text-xs">
                      Kamu bisa memasukkan teks atau HTML sesuai format yang digunakan CMS kamu.
                    </p>
                  </div>
                </section>

                {/* TOMBOL SUBMIT */}
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <Link
                    href="/admin/cms/articles"
                    className="theme-card theme-border theme-text-secondary inline-flex items-center justify-center rounded-xl border px-5 py-3 text-sm font-medium transition-opacity hover:opacity-80"
                  >
                    Batal
                  </Link>

                  <button
                    type="submit"
                    disabled={saving}
                    className="theme-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
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
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}