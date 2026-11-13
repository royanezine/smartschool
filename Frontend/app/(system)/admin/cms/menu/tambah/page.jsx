"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { apiFetch } from "../../../../../../lib/api";

import {
  Menu,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Save,
} from "lucide-react";

const API_URL = "/api/cms/menu-konfigurasi";
const HALAMAN_API_URL = "/api/cms/halaman";

const SECTION_OPTIONS = [
  { value: "hero", label: "Hero / Banner Utama" },
  { value: "tentang", label: "Tentang Sekolah" },
  { value: "keunggulan", label: "Keunggulan Sekolah" },
  { value: "program", label: "Program Sekolah" },
  { value: "informasi-terbaru", label: "Informasi Terbaru" },
  { value: "cta", label: "Call to Action" },
];

const INITIAL_FORM = {
  halamanCmsId: "",
  section: "hero",
  judul: "",
  subJudul: "",
  konten: "",
  gambarUrl: "",
  ctaText: "",
  ctaLink: "",
  urutan: 1,
  status: "aktif",
};

function unwrapData(result) {
  let data = result?.data ?? result;
  for (let i = 0; i < 3; i += 1) {
    if (data && !Array.isArray(data) && typeof data === "object" && "data" in data) {
      data = data.data;
    } else {
      break;
    }
  }
  return data;
}

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

function formatLabel(value) {
  return String(value || "-")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeId(value) {
  return value === null || value === undefined ? "" : String(value);
}

function getPageTitle(page) {
  return page?.judul || page?.title || "Halaman tanpa judul";
}

function getPageSlug(page) {
  return page?.slug || "";
}

export default function TambahMenuKonfigurasiPage() {
  const router = useRouter();
  const [active, setActive] = useState("menu");
  const [collapsed, setCollapsed] = useState(false);

  const [halamanList, setHalamanList] = useState([]);
  const [loadingHalaman, setLoadingHalaman] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [halamanError, setHalamanError] = useState("");
  const [formData, setFormData] = useState({ ...INITIAL_FORM });

  const fetchHalaman = useCallback(async () => {
    try {
      setLoadingHalaman(true);
      setHalamanError("");
      const result = await apiFetch(HALAMAN_API_URL);
      const data = unwrapData(result);
      if (!Array.isArray(data)) {
        throw new Error("Format daftar halaman CMS dari server tidak valid.");
      }
      setHalamanList(data);
    } catch (err) {
      console.error("Gagal mengambil daftar halaman CMS:", err);
      setHalamanError(getErrorMessage(err, "Gagal mengambil daftar halaman CMS."));
    } finally {
      setLoadingHalaman(false);
    }
  }, []);

  useEffect(() => {
    fetchHalaman();
  }, [fetchHalaman]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (saving) return;

    const halamanCmsId = formData.halamanCmsId;
    const section = formData.section.trim();
    const judul = formData.judul.trim();

    if (!halamanCmsId) return setError("Halaman CMS wajib dipilih.");
    if (!section || section.length > 50)
      return setError("Section wajib diisi dan maksimal 50 karakter.");
    if (!judul || judul.length > 100)
      return setError("Judul wajib diisi dan maksimal 100 karakter.");
    if (formData.subJudul.length > 255) return setError("Subjudul maksimal 255 karakter.");
    if (formData.gambarUrl.length > 255) return setError("URL gambar maksimal 255 karakter.");
    if (formData.ctaText.length > 50) return setError("Teks tombol CTA maksimal 50 karakter.");
    if (formData.ctaLink.length > 255) return setError("Link tombol CTA maksimal 255 karakter.");

    const parsedUrutan = Number(formData.urutan);
    if (!Number.isInteger(parsedUrutan) || parsedUrutan < 0 || parsedUrutan > 2147483647) {
      return setError("Urutan harus berupa angka bulat antara 0 sampai 2147483647.");
    }
    if (!["aktif", "nonaktif"].includes(formData.status)) {
      return setError("Status hanya boleh aktif atau nonaktif.");
    }

    const payload = {
      halamanCmsId,
      section,
      judul,
      subJudul: formData.subJudul.trim() || null,
      konten: formData.konten.trim() || null,
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
      console.error("Gagal menyimpan konfigurasi menu:", err);
      setError(getErrorMessage(err, "Gagal menyimpan konfigurasi menu."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar active={active} setActive={setActive} collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="shrink-0">
          <Header
            title="Tambah Konfigurasi Menu"
            user={{ name: "CMS Admin", email: "cms@smartschool.com", avatar: "CA" }}
          />
        </div>

        <main className="theme-page flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="w-full flex-1 px-3 py-5 sm:px-6 lg:px-9">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/admin/cms/menu")}
                  className="theme-card theme-border theme-text-secondary inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Kembali
                </button>
                <div className="bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border">
                  <Menu className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="theme-text text-2xl font-bold">Tambah Konfigurasi Menu</h1>
                  <p className="theme-text-secondary mt-1 text-sm">
                    Atur konten untuk bagian template website sekolah.
                  </p>
                </div>
              </div>
            </div>

            {halamanError && (
              <div className="theme-danger mb-4 flex items-start gap-3 rounded-xl border p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="min-w-0 flex-1 text-sm">
                  Gagal mengambil daftar halaman CMS: {halamanError}
                </div>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="theme-card theme-border rounded-2xl border p-5">
                  <h2 className="theme-text mb-4 text-base font-bold">Informasi Dasar</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="theme-text mb-2 block text-sm font-semibold">
                        Halaman <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        name="halamanCmsId"
                        value={formData.halamanCmsId}
                        onChange={handleChange}
                        disabled={loadingHalaman || halamanList.length === 0}
                        className="theme-input w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
                      >
                        <option value="">
                          {loadingHalaman
                            ? "Memuat halaman..."
                            : halamanList.length === 0
                            ? "Belum ada halaman CMS"
                            : "Pilih halaman CMS"}
                        </option>
                        {halamanList.map((halaman) => (
                          <option key={halaman.id} value={normalizeId(halaman.id)}>
                            {getPageTitle(halaman)}
                            {getPageSlug(halaman) ? ` (${getPageSlug(halaman)})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="theme-text mb-2 block text-sm font-semibold">
                        Section <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        name="section"
                        value={formData.section}
                        onChange={handleChange}
                        className="theme-input w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
                      >
                        {formData.section &&
                          !SECTION_OPTIONS.some((option) => option.value === formData.section) && (
                            <option value={formData.section}>
                              {formatLabel(formData.section)} (konfigurasi lama)
                            </option>
                          )}
                        {SECTION_OPTIONS.map((section) => (
                          <option key={section.value} value={section.value}>
                            {section.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="theme-text mb-2 block text-sm font-semibold">
                        Judul <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        maxLength={100}
                        name="judul"
                        value={formData.judul}
                        onChange={handleChange}
                        placeholder="Contoh: Selamat Datang di Sekolah Kami"
                        className="theme-input w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
                      />
                    </div>

                    <div>
                      <label className="theme-text mb-2 block text-sm font-semibold">Subjudul</label>
                      <input
                        maxLength={255}
                        name="subJudul"
                        value={formData.subJudul}
                        onChange={handleChange}
                        placeholder="Masukkan subjudul atau deskripsi singkat"
                        className="theme-input w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
                      />
                    </div>
                  </div>
                </div>

                <div className="theme-card theme-border rounded-2xl border p-5">
                  <h2 className="theme-text mb-4 text-base font-bold">Pengaturan Tambahan</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="theme-text mb-2 block text-sm font-semibold">
                          Urutan <span className="text-red-500">*</span>
                        </label>
                        <input
                          required
                          type="number"
                          min="0"
                          max="2147483647"
                          step="1"
                          name="urutan"
                          value={formData.urutan}
                          onChange={handleChange}
                          className="theme-input w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
                        />
                      </div>
                      <div>
                        <label className="theme-text mb-2 block text-sm font-semibold">Status</label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="theme-input w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
                        >
                          <option value="aktif">Aktif</option>
                          <option value="nonaktif">Nonaktif</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="theme-text mb-2 block text-sm font-semibold">URL Gambar</label>
                      <input
                        maxLength={255}
                        name="gambarUrl"
                        type="url"
                        value={formData.gambarUrl}
                        onChange={handleChange}
                        placeholder="https://contoh.com/gambar.jpg"
                        className="theme-input w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
                      />
                      {formData.gambarUrl && (
                        <div className="theme-card-soft mt-3 overflow-hidden rounded-xl border p-2">
                          <img
                            src={formData.gambarUrl}
                            alt="Preview gambar"
                            className="max-h-56 w-full rounded-lg object-contain"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                            onLoad={(event) => {
                              event.currentTarget.style.display = "block";
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="theme-text mb-2 block text-sm font-semibold">Teks tombol CTA</label>
                        <input
                          maxLength={50}
                          name="ctaText"
                          value={formData.ctaText}
                          onChange={handleChange}
                          placeholder="Contoh: Pelajari Selengkapnya"
                          className="theme-input w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
                        />
                      </div>
                      <div>
                        <label className="theme-text mb-2 block text-sm font-semibold">Link tombol CTA</label>
                        <input
                          maxLength={255}
                          name="ctaLink"
                          value={formData.ctaLink}
                          onChange={handleChange}
                          placeholder="/profil atau https://contoh.com"
                          className="theme-input w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="theme-card theme-border rounded-2xl border p-5 lg:col-span-2">
                  <h2 className="theme-text mb-4 text-base font-bold">Konten</h2>
                  <div>
                    <label className="theme-text mb-2 block text-sm font-semibold">Konten</label>
                    <textarea
                      rows={8}
                      name="konten"
                      value={formData.konten}
                      onChange={handleChange}
                      placeholder="Masukkan isi konten yang akan ditampilkan pada website..."
                      className="theme-input w-full rounded-xl border px-3 py-3 text-sm leading-6 outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="theme-danger flex items-start gap-2 rounded-xl border p-3 text-sm">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="theme-card theme-border flex flex-col-reverse gap-2 rounded-2xl border p-4 sm:flex-row sm:justify-end">
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
                  disabled={saving || loadingHalaman || halamanList.length === 0}
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
          </div>
        </main>
      </div>
    </div>
  );
}