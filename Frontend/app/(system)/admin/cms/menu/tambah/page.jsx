
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { apiFetch } from "../../../../../../lib/api";

import {
  Plus,
  X,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Save,
  Image as ImageIcon,
  ArrowUpDown,
} from "lucide-react";

const API_URL = "/api/cms/menu-konfigurasi";
const HALAMAN_API_URL = "/api/cms/halaman";

const SECTION_OPTIONS = [
  {
    value: "hero",
    label: "Hero / Banner Utama",
    description: "Bagian utama halaman dengan judul, deskripsi, gambar, dan tombol.",
  },
  {
    value: "tentang",
    label: "Tentang Sekolah",
    description: "Bagian profil dan informasi sekolah.",
  },
  {
    value: "keunggulan",
    label: "Keunggulan Sekolah",
    description: "Bagian keunggulan, fasilitas, atau nilai tambah sekolah.",
  },
  {
    value: "program",
    label: "Program Sekolah",
    description: "Bagian program pendidikan dan kegiatan sekolah.",
  },
  {
    value: "informasi-terbaru",
    label: "Informasi Terbaru",
    description: "Bagian informasi atau artikel terbaru.",
  },
  {
    value: "cta",
    label: "Call to Action",
    description: "Bagian ajakan dengan tombol atau tautan.",
  },
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
    if (
      data &&
      !Array.isArray(data) &&
      typeof data === "object" &&
      "data" in data
    ) {
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

export default function TambahMenuPage() {
  const router = useRouter();

  const [active, setActive] = useState("menu");
  const [collapsed, setCollapsed] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ ...INITIAL_FORM });

  const [halamanList, setHalamanList] = useState([]);
  const [loadingHalaman, setLoadingHalaman] = useState(true);
  const [halamanError, setHalamanError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchHalaman() {
      try {
        setLoadingHalaman(true);
        setHalamanError("");

        const result = await apiFetch(HALAMAN_API_URL);
        const data = unwrapData(result);

        if (!cancelled) {
          setHalamanList(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setHalamanError(
            getErrorMessage(
              err,
              "Gagal mengambil daftar halaman CMS."
            )
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingHalaman(false);
        }
      }
    }

    fetchHalaman();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const halamanCmsId = formData.halamanCmsId;
    const section = formData.section.trim();
    const judul = formData.judul.trim();
    const parsedUrutan = Number(formData.urutan);

    if (!halamanCmsId) {
      setError("Halaman CMS wajib dipilih.");
      return;
    }

    if (!section) {
      setError("Section wajib dipilih.");
      return;
    }

    if (!judul) {
      setError("Judul wajib diisi.");
      return;
    }

    if (!Number.isInteger(parsedUrutan) || parsedUrutan < 1) {
      setError("Urutan harus berupa angka bulat minimal 1.");
      return;
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

      await apiFetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      router.push("/admin/cms/menu?success=created");
    } catch (err) {
      console.error("Gagal menyimpan konfigurasi menu:", err);

      setError(
        getErrorMessage(
          err,
          "Gagal menyimpan konfigurasi menu."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const selectedSection = SECTION_OPTIONS.find(
    (item) => item.value === formData.section
  );

  return (
    <div className="theme-page flex min-h-screen w-full">
      <Sidebar
        active={active}
        setActive={setActive}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title="Tambah Konfigurasi Menu"
          user={{
            name: "CMS Admin",
            email: "cms@smartschool.com",
            avatar: "CA",
          }}
        />

        <main className="theme-page min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1400px] px-3 py-5 sm:px-6 lg:px-9">
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
                    Isi konten untuk section pada template halaman website sekolah.
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="theme-danger mb-4 flex items-start gap-3 rounded-xl border p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                <div className="min-w-0 flex-1 text-sm">
                  {error}
                </div>

                <button
                  type="button"
                  onClick={() => setError("")}
                  aria-label="Tutup pesan error"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="theme-card theme-border rounded-2xl border"
            >
              <div className="space-y-5 p-5 sm:p-6">
                <div>
                  <h2 className="theme-text text-base font-bold">
                    Informasi Konfigurasi
                  </h2>
                  <p className="theme-text-secondary mt-1 text-sm">
                    Pilih halaman dan jenis section yang akan diisi.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="theme-text mb-2 block text-sm font-semibold">
                      Halaman CMS <span className="text-red-500">*</span>
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
                          : "Pilih halaman CMS"}
                      </option>

                      {halamanList.map((halaman) => (
                        <option key={halaman.id} value={halaman.id}>
                          {halaman.judul || "Tanpa judul"}
                          {halaman.slug ? ` (${halaman.slug})` : ""}
                        </option>
                      ))}
                    </select>

                    {halamanError ? (
                      <p className="mt-1 text-xs text-red-500">
                        {halamanError}
                      </p>
                    ) : (
                      <p className="theme-text-muted mt-1 text-xs">
                        Pilih halaman CMS yang akan menampilkan konten ini.
                      </p>
                    )}

                    {!loadingHalaman &&
                      !halamanError &&
                      halamanList.length === 0 && (
                        <p className="mt-1 text-xs text-red-500">
                          Belum ada halaman CMS. Buat halaman terlebih dahulu.
                        </p>
                      )}
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
                      {SECTION_OPTIONS.map((section) => (
                        <option
                          key={section.value}
                          value={section.value}
                        >
                          {section.label}
                        </option>
                      ))}
                    </select>

                    {selectedSection && (
                      <p className="theme-text-muted mt-1 text-xs leading-5">
                        {selectedSection.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="theme-border border-t pt-5">
                  <h2 className="theme-text text-base font-bold">
                    Konten Section
                  </h2>
                  <p className="theme-text-secondary mt-1 text-sm">
                    Konten ini akan ditampilkan oleh komponen frontend sesuai jenis section.
                  </p>
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
                    Konten / Deskripsi
                  </label>

                  <textarea
                    rows={6}
                    name="konten"
                    value={formData.konten}
                    onChange={handleChange}
                    placeholder="Masukkan deskripsi atau isi konten section..."
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
                        className="max-h-64 w-full rounded-lg object-contain"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="theme-card-soft mt-3 flex items-center gap-2 rounded-xl border p-3">
                      <ImageIcon className="theme-text-muted h-4 w-4" />
                      <span className="theme-text-muted text-xs">
                        Belum ada gambar.
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="theme-text mb-2 block text-sm font-semibold">
                      Teks Tombol CTA
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
                      Link Tombol CTA
                    </label>

                    <input
                      name="ctaLink"
                      value={formData.ctaLink}
                      onChange={handleChange}
                      placeholder="/profil atau https://contoh.com"
                      className="theme-input w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                </div>

                <div className="theme-border border-t pt-5">
                  <h2 className="theme-text text-base font-bold">
                    Pengaturan Tampilan
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="theme-text mb-2 block text-sm font-semibold">
                      Urutan Tampilan <span className="text-red-500">*</span>
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
                  disabled={
                    saving ||
                    loadingHalaman ||
                    Boolean(halamanError) ||
                    halamanList.length === 0
                  }
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
