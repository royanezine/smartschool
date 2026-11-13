"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import RichTextEditor from "@/app/components/cms/RichTextEditor";
import { apiFetch } from "../../../../../../../lib/api";

import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileText,
  Globe2,
  Eye,
  X,
  Plus,
  Pencil,
  Trash2,
  Layers3,
  Image as ImageIcon,
  RefreshCw,
  Lightbulb,
} from "lucide-react";

const HALAMAN_API_URL = "/api/cms/halaman";
const SECTION_API_URL = "/api/cms/menu-konfigurasi";

const INITIAL_SECTION_FORM = {
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

const SECTION_OPTIONS = [
  {
    value: "hero",
    label: "Hero / Banner Utama",
    description: "Bagian utama halaman website.",
  },
  {
    value: "tentang",
    label: "Tentang Sekolah",
    description: "Bagian profil dan informasi sekolah.",
  },
  {
    value: "keunggulan",
    label: "Keunggulan Sekolah",
    description: "Bagian keunggulan dan fasilitas sekolah.",
  },
  {
    value: "program",
    label: "Program Sekolah",
    description: "Bagian program pendidikan dan kegiatan.",
  },
  {
    value: "informasi-terbaru",
    label: "Informasi Terbaru",
    description: "Bagian informasi dan artikel terbaru.",
  },
  {
    value: "sambutan-kepala-sekolah",
    label: "Sambutan Kepala Sekolah",
    description:
      "Menampilkan sambutan, nama, jabatan, dan foto kepala sekolah.",
  },
  {
    value: "cta",
    label: "Call to Action",
    description: "Bagian ajakan dengan tombol atau tautan.",
  },
  {
    value: "identitas",
    label: "Footer - Identitas Sekolah",
    description: "Judul, deskripsi, dan identitas sekolah di footer.",
  },
  {
    value: "navigasi",
    label: "Footer - Navigasi Website",
    description: "Judul dan deskripsi navigasi footer.",
  },
  {
    value: "info_utama",
    label: "Footer - Informasi Kontak",
    description: "Judul dan deskripsi bagian kontak footer.",
  },
  {
    value: "sosmed",
    label: "Footer - Media Sosial",
    description: "Judul dan deskripsi media sosial footer.",
  },
];

function unwrapArray(result) {
  let data = result;

  for (let i = 0; i < 5; i += 1) {
    if (Array.isArray(data)) return data;
    if (!data || typeof data !== "object") return [];

    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.data)) return data.data;

    if (data.data && typeof data.data === "object") {
      data = data.data;
      continue;
    }

    return [];
  }

  return Array.isArray(data) ? data : [];
}

function getErrorMessage(error, fallback) {
  return error?.message || fallback;
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function getPlainText(value) {
  if (typeof value !== "string") return "";

  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function getPreviewUrl(page) {
  if (typeof window === "undefined" || !page?.slug) {
    return "";
  }

  const slug = String(page.slug).replace(/^\/+|\/+$/g, "");
  const subdomain = page?.sekolah?.subdomain || page?.subdomain;

  if (subdomain) {
    return `https://${subdomain}.smartschool.citrasolusi.id/${slug}`;
  }

  return `${window.location.origin}/${slug}`;
}

function normalizeSectionStatus(status) {
  return status === "nonaktif" ? "nonaktif" : "aktif";
}

function normalizeSection(item) {
  if (!item || typeof item !== "object") return null;

  return {
    ...item,
    id: item.id,
    halamanCmsId: item.halamanCmsId,
    section: item.section || "hero",
    judul: item.judul || "",
    subJudul: item.subJudul || "",
    konten: item.konten || "",
    gambarUrl: item.gambarUrl || "",
    ctaText: item.ctaText || "",
    ctaLink: item.ctaLink || "",
    urutan: Number(item.urutan ?? 1),
    status: normalizeSectionStatus(item.status),
  };
}

export default function EditPageCms() {
  const params = useParams();
  const id = params?.id;

  const [active, setActive] = useState("pages");
  const [collapsed, setCollapsed] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    judul: "",
    konten: "",
    status: "draft",
  });

  const [originalPage, setOriginalPage] = useState(null);

  const [sections, setSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [savingSection, setSavingSection] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [showSectionForm, setShowSectionForm] = useState(false);

  const [sectionForm, setSectionForm] = useState({
    ...INITIAL_SECTION_FORM,
  });

  const [sectionError, setSectionError] = useState("");
  const [sectionSuccess, setSectionSuccess] = useState("");

  const fetchPage = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setError("ID halaman tidak ditemukan.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await apiFetch(HALAMAN_API_URL);
      const pages = unwrapArray(result);

      const foundPage = pages.find(
        (page) => String(page?.id) === String(id)
      );

      if (!foundPage) {
        throw new Error(
          "Halaman yang ingin diedit tidak ditemukan."
        );
      }

      setOriginalPage(foundPage);

      setForm({
        judul: foundPage.judul || "",
        konten: foundPage.konten || "",
        status: foundPage.status || "draft",
      });
    } catch (err) {
      console.error("Gagal mengambil detail halaman:", err);

      setError(
        getErrorMessage(
          err,
          "Gagal mengambil data halaman dari server."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchSections = useCallback(async () => {
    if (!id) return;

    try {
      setLoadingSections(true);
      setSectionError("");

      const result = await apiFetch(SECTION_API_URL);
      const items = unwrapArray(result);

      const filteredItems = items
        .filter(
          (item) =>
            String(item?.halamanCmsId) === String(id)
        )
        .map(normalizeSection)
        .filter(Boolean)
        .sort(
          (a, b) =>
            Number(a.urutan ?? 0) - Number(b.urutan ?? 0)
        );

      setSections(filteredItems);
    } catch (err) {
      console.error(
        "Gagal mengambil konfigurasi section:",
        err
      );

      setSectionError(
        getErrorMessage(
          err,
          "Gagal mengambil konfigurasi section dari server."
        )
      );
    } finally {
      setLoadingSections(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const handleChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const judul = normalizeText(form.judul);

    if (!id) {
      setError("ID halaman tidak ditemukan.");
      return;
    }

    if (!judul) {
      setError("Judul halaman wajib diisi.");
      return;
    }

    if (judul.length < 3) {
      setError("Judul halaman minimal 3 karakter.");
      return;
    }

    try {
      setSaving(true);

      await apiFetch(
        `${HALAMAN_API_URL}/${encodeURIComponent(id)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            judul,
            konten: form.konten || "",
            status: form.status,
          }),
        }
      );

      setSuccess("Perubahan halaman berhasil disimpan.");

      await fetchPage();
    } catch (err) {
      console.error("Gagal memperbarui halaman:", err);

      setError(
        getErrorMessage(
          err,
          "Gagal memperbarui halaman. Silakan coba lagi."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const openCreateSection = () => {
    setEditingSectionId(null);

    setSectionForm({
      ...INITIAL_SECTION_FORM,
      urutan: sections.length + 1,
    });

    setSectionError("");
    setSectionSuccess("");
    setShowSectionForm(true);
  };

  const openEditSection = (item) => {
    setEditingSectionId(item.id);

    setSectionForm({
      section: item.section || "hero",
      judul: item.judul || "",
      subJudul: item.subJudul || "",
      konten: item.konten || "",
      gambarUrl: item.gambarUrl || "",
      ctaText: item.ctaText || "",
      ctaLink: item.ctaLink || "",
      urutan: Number(item.urutan ?? 1),
      status: normalizeSectionStatus(item.status),
    });

    setSectionError("");
    setSectionSuccess("");
    setShowSectionForm(true);
  };

  const closeSectionForm = () => {
    setShowSectionForm(false);
    setEditingSectionId(null);
    setSectionForm({ ...INITIAL_SECTION_FORM });
    setSectionError("");
  };

  const handleSectionChange = (field, value) => {
    setSectionForm((current) => ({
      ...current,
      [field]: value,
    }));

    setSectionError("");
    setSectionSuccess("");
  };

  const handleSaveSection = async () => {
    setSectionError("");
    setSectionSuccess("");

    if (!id) {
      setSectionError("ID halaman tidak ditemukan.");
      return;
    }

    const judul = normalizeText(sectionForm.judul);
    const section = normalizeText(sectionForm.section);
    const subJudul = normalizeText(sectionForm.subJudul);
    const konten = normalizeText(sectionForm.konten);
    const gambarUrl = normalizeText(sectionForm.gambarUrl);
    const ctaText = normalizeText(sectionForm.ctaText);
    const ctaLink = normalizeText(sectionForm.ctaLink);
    const urutan = Number(sectionForm.urutan);

    if (!section) {
      setSectionError("Jenis section wajib dipilih.");
      return;
    }

    if (!SECTION_OPTIONS.some((item) => item.value === section)) {
      setSectionError("Jenis section tidak valid.");
      return;
    }

    if (!judul) {
      setSectionError("Judul section wajib diisi.");
      return;
    }

    if (judul.length > 100) {
      setSectionError("Judul section maksimal 100 karakter.");
      return;
    }

    if (subJudul.length > 255) {
      setSectionError("Subjudul maksimal 255 karakter.");
      return;
    }

    if (gambarUrl.length > 255) {
      setSectionError("URL gambar maksimal 255 karakter.");
      return;
    }

    if (ctaText.length > 50) {
      setSectionError("Teks tombol CTA maksimal 50 karakter.");
      return;
    }

    if (ctaLink.length > 255) {
      setSectionError("Link tombol CTA maksimal 255 karakter.");
      return;
    }

    if (
      !Number.isInteger(urutan) ||
      urutan < 0
    ) {
      setSectionError(
        "Urutan section harus berupa angka bulat minimal 0."
      );
      return;
    }

    if (
      !["aktif", "nonaktif"].includes(sectionForm.status)
    ) {
      setSectionError("Status section tidak valid.");
      return;
    }

    if (gambarUrl) {
      try {
        const url = new URL(gambarUrl);

        if (!["http:", "https:"].includes(url.protocol)) {
          setSectionError(
            "URL gambar harus menggunakan HTTP atau HTTPS."
          );
          return;
        }
      } catch {
        setSectionError("Format URL gambar tidak valid.");
        return;
      }
    }

    const payload = {
      halamanCmsId: String(id),
      section,
      judul,
      subJudul: subJudul || null,
      konten: konten || null,
      gambarUrl: gambarUrl || null,
      ctaText: ctaText || null,
      ctaLink: ctaLink || null,
      urutan,
      status: sectionForm.status,
    };

    try {
      setSavingSection(true);

      if (editingSectionId) {
        await apiFetch(
          `${SECTION_API_URL}/${encodeURIComponent(
            editingSectionId
          )}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );
      } else {
        await apiFetch(SECTION_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      const message = editingSectionId
        ? "Konfigurasi section berhasil diperbarui."
        : "Konfigurasi section berhasil ditambahkan.";

      setShowSectionForm(false);
      setEditingSectionId(null);
      setSectionForm({ ...INITIAL_SECTION_FORM });

      await fetchSections();
      setSectionSuccess(message);
    } catch (err) {
      console.error(
        "Gagal menyimpan konfigurasi section:",
        err
      );

      setSectionError(
        getErrorMessage(
          err,
          "Gagal menyimpan konfigurasi section."
        )
      );
    } finally {
      setSavingSection(false);
    }
  };

  const handleDeactivateSection = async (item) => {
    if (!item?.id || item.status === "nonaktif") return;

    const confirmed = window.confirm(
      `Nonaktifkan section "${item.judul}"?`
    );

    if (!confirmed) return;

    setSectionError("");
    setSectionSuccess("");

    try {
      setSavingSection(true);

      await apiFetch(
        `${SECTION_API_URL}/${encodeURIComponent(item.id)}`,
        {
          method: "DELETE",
        }
      );

      await fetchSections();

      setSectionSuccess(
        "Permintaan menonaktifkan section berhasil diproses."
      );
    } catch (err) {
      console.error(
        "Gagal menonaktifkan section:",
        err
      );

      setSectionError(
        getErrorMessage(
          err,
          "Gagal menonaktifkan section."
        )
      );
    } finally {
      setSavingSection(false);
    }
  };

  const activeSections = sections.filter(
    (item) => item.status === "aktif"
  );

  const inactiveSections = sections.filter(
    (item) => item.status === "nonaktif"
  );

  const previewUrl = getPreviewUrl(originalPage);

  if (loading) {
    return (
      <div className="theme-page flex h-screen w-full overflow-hidden">
        <Sidebar
          active={active}
          setActive={setActive}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0">
            <Header
              title="Edit Halaman"
              user={{
                name: "CMS Admin",
                email: "cms@smartschool.com",
                avatar: "CA",
              }}
            />
          </div>

          <main className="flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-y-auto p-6">
            <div className="flex flex-col items-center text-center">
              <div className="bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>

              <h2 className="theme-text text-sm font-bold">
                Memuat halaman...
              </h2>

              <p className="theme-text-muted mt-1 text-xs">
                Mengambil data halaman dari server.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active={active}
        setActive={setActive}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0">
          <Header
            title="Edit Halaman"
            user={{
              name: "CMS Admin",
              email: "cms@smartschool.com",
              avatar: "CA",
            }}
          />
        </div>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="w-full p-4 sm:p-6 lg:p-8">
            <div className="mb-5">
              <Link
                href="/admin/cms/pages"
                className="theme-text-muted inline-flex items-center gap-2 text-sm font-semibold transition hover:text-[var(--color-primary)]"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Halaman
              </Link>
            </div>

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl">
                  <FileText className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h1 className="theme-text truncate text-2xl font-bold tracking-tight sm:text-3xl">
                    Edit Halaman
                  </h1>

                  <p className="theme-text-secondary mt-0.5 text-xs sm:text-sm">
                    Perbarui informasi, konten, dan konfigurasi
                    section website sekolah.
                  </p>
                </div>
              </div>

              
            </div>

            <section className="theme-card theme-border mb-6 overflow-hidden rounded-2xl border shadow-sm">
              <div className="theme-card-soft theme-border flex items-start gap-3 border-b px-5 py-4 sm:px-6">
                <div className="bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                  <Lightbulb className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="theme-text text-sm font-bold sm:text-base">
                    Panduan Mengelola Halaman
                  </h2>

                  <p className="theme-text-muted mt-1 text-xs leading-5 sm:text-sm">
                    Informasi halaman dan konfigurasi section disimpan
                    secara terpisah melalui endpoint CMS.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-4">
                {[
                  {
                    number: "01",
                    title: "Informasi Halaman",
                    description:
                      "Atur judul dan konten utama menggunakan editor.",
                  },
                  {
                    number: "02",
                    title: "Konfigurasi Section",
                    description:
                      "Atur hero, tentang, program, gambar, CTA, atau footer.",
                  },
                  {
                    number: "03",
                    title: "Status Publikasi",
                    description:
                      "Pilih status halaman sesuai alur publikasi yang didukung BE.",
                  },
                  {
                    number: "04",
                    title: "Simpan dan Periksa",
                    description:
                      "Simpan halaman dan section, lalu periksa hasil melalui preview.",
                  },
                ].map((item) => (
                  <div
                    key={item.number}
                    className="theme-card-soft theme-border rounded-xl border p-4"
                  >
                    <p className="theme-text-muted mb-3 text-[10px] font-bold uppercase tracking-wider">
                      Langkah {item.number}
                    </p>

                    <h3 className="theme-text text-sm font-bold">
                      {item.title}
                    </h3>

                    <p className="theme-text-secondary mt-2 text-xs leading-5">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {error && (
              <div className="theme-danger mb-5 flex items-start gap-3 rounded-2xl border p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold">
                    Terjadi kesalahan
                  </h3>
                  <p className="mt-1 text-xs leading-5">
                    {error}
                  </p>
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

            {success && (
              <div className="theme-success mb-5 flex items-start gap-3 rounded-2xl border p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold">Berhasil</h3>
                  <p className="mt-1 text-xs leading-5">
                    {success}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSuccess("")}
                  aria-label="Tutup pesan berhasil"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_380px]">
                <div className="min-w-0 space-y-6">
                  <section className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">
                    <div className="theme-card-soft theme-border border-b px-5 py-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text flex h-9 w-9 items-center justify-center rounded-xl">
                          <FileText className="h-4 w-4" />
                        </div>

                        <div>
                          <h2 className="theme-text text-sm font-bold">
                            Informasi Halaman
                          </h2>
                          <p className="theme-text-muted mt-0.5 text-[11px]">
                            Judul dan konten utama halaman.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 p-5 sm:p-6">
                      <div>
                        <label
                          htmlFor="judul"
                          className="theme-text-secondary mb-2 block text-sm font-semibold"
                        >
                          Judul Halaman
                          <span className="ml-1 text-red-500">*</span>
                        </label>

                        <input
                          id="judul"
                          type="text"
                          value={form.judul}
                          onChange={(event) =>
                            handleChange("judul", event.target.value)
                          }
                          placeholder="Contoh: Tentang Sekolah"
                          className="theme-input w-full rounded-xl border px-4 py-3 text-sm outline-none shadow-sm transition focus:border-[var(--color-primary)]"
                          required
                          minLength={3}
                        />

                        <p className="theme-text-muted mt-2 text-[11px]">
                          Minimal 3 karakter.
                        </p>
                      </div>

                      <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <label className="theme-text-secondary block text-sm font-semibold">
                            Konten Halaman
                          </label>

                          <span className="theme-text-muted text-[10px] font-medium">
                            Rich Text
                          </span>
                        </div>

                        <div className="theme-input overflow-hidden rounded-xl border focus-within:border-[var(--color-primary)]">
                          <RichTextEditor
                            value={form.konten}
                            onChange={(value) =>
                              handleChange("konten", value)
                            }
                          />
                        </div>

                        <p className="theme-text-muted mt-2 text-[11px] leading-5">
                          Gunakan editor untuk mengatur paragraf,
                          judul, daftar, tautan, dan format konten.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">
                    <div className="theme-card-soft theme-border flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                          <Layers3 className="h-5 w-5" />
                        </div>

                        <div>
                          <h2 className="theme-text text-sm font-bold">
                            Konfigurasi Section Website
                          </h2>

                          <p className="theme-text-muted mt-1 text-xs leading-5">
                            Atur bagian halaman melalui konfigurasi CMS.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={openCreateSection}
                        className="theme-primary inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
                      >
                        <Plus className="h-4 w-4" />
                        Tambah Section
                      </button>
                    </div>

                    <div className="space-y-4 p-5 sm:p-6">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="theme-card-soft theme-border rounded-xl border p-3">
                          <p className="theme-text-muted text-[10px] font-semibold uppercase">
                            Total Section
                          </p>
                          <p className="theme-text mt-1 text-xl font-bold">
                            {sections.length}
                          </p>
                        </div>

                        <div className="theme-card-soft theme-border rounded-xl border p-3">
                          <p className="theme-text-muted text-[10px] font-semibold uppercase">
                            Aktif
                          </p>
                          <p className="mt-1 text-xl font-bold text-[var(--color-success)]">
                            {activeSections.length}
                          </p>
                        </div>

                        <div className="theme-card-soft theme-border rounded-xl border p-3">
                          <p className="theme-text-muted text-[10px] font-semibold uppercase">
                            Nonaktif
                          </p>
                          <p className="theme-text mt-1 text-xl font-bold">
                            {inactiveSections.length}
                          </p>
                        </div>
                      </div>

                      {sectionError && (
                        <div className="theme-danger flex items-start gap-2 rounded-xl border p-3">
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                          <p className="min-w-0 flex-1 text-xs leading-5">
                            {sectionError}
                          </p>

                          <button
                            type="button"
                            onClick={() => setSectionError("")}
                            aria-label="Tutup pesan error section"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}

                      {sectionSuccess && (
                        <div className="theme-success flex items-start gap-2 rounded-xl border p-3">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />

                          <p className="min-w-0 flex-1 text-xs leading-5">
                            {sectionSuccess}
                          </p>

                          <button
                            type="button"
                            onClick={() => setSectionSuccess("")}
                            aria-label="Tutup pesan berhasil"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}

                      {loadingSections ? (
                        <div className="theme-text-muted flex items-center justify-center gap-2 py-10 text-sm">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Memuat konfigurasi section...
                        </div>
                      ) : sections.length === 0 ? (
                        <div className="theme-card-soft theme-border rounded-xl border border-dashed p-7 text-center">
                          <Layers3 className="theme-text-muted mx-auto mb-3 h-8 w-8" />

                          <p className="theme-text text-sm font-semibold">
                            Belum ada konfigurasi section
                          </p>

                          <p className="theme-text-muted mx-auto mt-1 max-w-sm text-xs leading-5">
                            Tambahkan section untuk mengatur bagian
                            halaman website ini.
                          </p>

                          <button
                            type="button"
                            onClick={openCreateSection}
                            className="theme-primary mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold"
                          >
                            <Plus className="h-4 w-4" />
                            Tambah Section Pertama
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {sections.map((item) => (
                            <div
                              key={item.id}
                              className="theme-card theme-border rounded-xl border p-4"
                            >
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0 flex-1">
                                  <div className="mb-2 flex flex-wrap items-center gap-2">
                                    <span className="theme-info rounded-md px-2 py-1 text-[10px] font-bold uppercase">
                                      {item.section}
                                    </span>

                                    <span className="theme-text-muted text-[11px]">
                                      Urutan {item.urutan}
                                    </span>

                                    <span
                                      className={
                                        item.status === "aktif"
                                          ? "theme-success rounded-full border px-2 py-1 text-[10px] font-semibold"
                                          : "theme-text-muted rounded-full border px-2 py-1 text-[10px] font-semibold"
                                      }
                                    >
                                      {item.status}
                                    </span>
                                  </div>

                                  <h3 className="theme-text break-words text-sm font-bold">
                                    {item.judul}
                                  </h3>

                                  {item.subJudul && (
                                    <p className="theme-text-secondary mt-1 break-words text-xs">
                                      {item.subJudul}
                                    </p>
                                  )}

                                  {item.konten && (
                                    <p className="theme-text-muted mt-2 line-clamp-3 break-words text-xs leading-5">
                                      {getPlainText(item.konten)}
                                    </p>
                                  )}

                                  {item.gambarUrl && (
                                    <div className="theme-text-muted mt-2 flex items-center gap-1.5 break-all text-[11px]">
                                      <ImageIcon className="h-3.5 w-3.5 shrink-0" />
                                      {item.gambarUrl}
                                    </div>
                                  )}

                                  {(item.ctaText || item.ctaLink) && (
                                    <p className="theme-text-muted mt-2 break-words text-[11px]">
                                      CTA: {item.ctaText || "-"}
                                      {item.ctaLink
                                        ? ` → ${item.ctaLink}`
                                        : ""}
                                    </p>
                                  )}
                                </div>

                                <div className="flex shrink-0 items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => openEditSection(item)}
                                    className="theme-card-soft theme-border theme-text-secondary inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeactivateSection(item)
                                    }
                                    disabled={
                                      savingSection ||
                                      item.status === "nonaktif"
                                    }
                                    className="theme-danger inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Nonaktifkan
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {showSectionForm && (
                        <div className="theme-card-soft theme-border space-y-5 rounded-xl border p-4 sm:p-5">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <h3 className="theme-text text-sm font-bold">
                                {editingSectionId
                                  ? "Edit Section"
                                  : "Tambah Section"}
                              </h3>

                              <p className="theme-text-muted mt-1 text-xs">
                                Perubahan disimpan ke konfigurasi CMS.
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={closeSectionForm}
                              disabled={savingSection}
                              className="theme-text-muted rounded-lg p-2 transition hover:opacity-70"
                              aria-label="Tutup form section"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                              <label className="theme-text-secondary mb-2 block text-xs font-semibold">
                                Jenis Section *
                              </label>

                              <select
                                value={sectionForm.section}
                                onChange={(event) =>
                                  handleSectionChange(
                                    "section",
                                    event.target.value
                                  )
                                }
                                className="theme-input w-full rounded-xl border px-3 py-2.5 text-sm"
                                required
                              >
                                {SECTION_OPTIONS.map((option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="theme-text-secondary mb-2 block text-xs font-semibold">
                                Judul Section *
                              </label>

                              <input
                                value={sectionForm.judul}
                                onChange={(event) =>
                                  handleSectionChange(
                                    "judul",
                                    event.target.value
                                  )
                                }
                                className="theme-input w-full rounded-xl border px-3 py-2.5 text-sm"
                                placeholder="Masukkan judul section"
                                maxLength={100}
                                required
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="theme-text-secondary mb-2 block text-xs font-semibold">
                                Subjudul
                              </label>

                              <input
                                value={sectionForm.subJudul}
                                onChange={(event) =>
                                  handleSectionChange(
                                    "subJudul",
                                    event.target.value
                                  )
                                }
                                className="theme-input w-full rounded-xl border px-3 py-2.5 text-sm"
                                placeholder="Subjudul (opsional)"
                                maxLength={255}
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="theme-text-secondary mb-2 block text-xs font-semibold">
                                Konten Section
                              </label>

                              <textarea
                                value={sectionForm.konten}
                                onChange={(event) =>
                                  handleSectionChange(
                                    "konten",
                                    event.target.value
                                  )
                                }
                                className="theme-input min-h-32 w-full rounded-xl border px-3 py-3 text-sm"
                                placeholder="Masukkan isi section"
                                rows={5}
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="theme-text-secondary mb-2 block text-xs font-semibold">
                                URL Gambar
                              </label>

                              <input
                                type="url"
                                value={sectionForm.gambarUrl}
                                onChange={(event) =>
                                  handleSectionChange(
                                    "gambarUrl",
                                    event.target.value
                                  )
                                }
                                className="theme-input w-full rounded-xl border px-3 py-2.5 text-sm"
                                placeholder="https://..."
                                maxLength={255}
                              />
                            </div>

                            <div>
                              <label className="theme-text-secondary mb-2 block text-xs font-semibold">
                                Teks Tombol CTA
                              </label>

                              <input
                                value={sectionForm.ctaText}
                                onChange={(event) =>
                                  handleSectionChange(
                                    "ctaText",
                                    event.target.value
                                  )
                                }
                                className="theme-input w-full rounded-xl border px-3 py-2.5 text-sm"
                                placeholder="Contoh: Daftar Sekarang"
                                maxLength={50}
                              />
                            </div>

                            <div>
                              <label className="theme-text-secondary mb-2 block text-xs font-semibold">
                                Link Tombol CTA
                              </label>

                              <input
                                value={sectionForm.ctaLink}
                                onChange={(event) =>
                                  handleSectionChange(
                                    "ctaLink",
                                    event.target.value
                                  )
                                }
                                className="theme-input w-full rounded-xl border px-3 py-2.5 text-sm"
                                placeholder="/pendaftaran"
                                maxLength={255}
                              />
                            </div>

                            <div>
                              <label className="theme-text-secondary mb-2 block text-xs font-semibold">
                                Urutan Section
                              </label>

                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={sectionForm.urutan}
                                onChange={(event) =>
                                  handleSectionChange(
                                    "urutan",
                                    event.target.value
                                  )
                                }
                                className="theme-input w-full rounded-xl border px-3 py-2.5 text-sm"
                                required
                              />
                            </div>

                            <div>
                              <label className="theme-text-secondary mb-2 block text-xs font-semibold">
                                Status Section
                              </label>

                              <select
                                value={sectionForm.status}
                                onChange={(event) =>
                                  handleSectionChange(
                                    "status",
                                    event.target.value
                                  )
                                }
                                className="theme-input w-full rounded-xl border px-3 py-2.5 text-sm"
                              >
                                <option value="aktif">Aktif</option>
                                <option value="nonaktif">Nonaktif</option>
                              </select>
                            </div>
                          </div>

                          {sectionError && (
                            <div className="theme-danger flex items-start gap-2 rounded-xl border p-3">
                              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                              <p className="text-xs leading-5">
                                {sectionError}
                              </p>
                            </div>
                          )}

                          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button
                              type="button"
                              onClick={closeSectionForm}
                              disabled={savingSection}
                              className="theme-card theme-border theme-text-secondary rounded-xl border px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
                            >
                              Batal
                            </button>

                            <button
                              type="button"
                              onClick={handleSaveSection}
                              disabled={savingSection}
                              className="theme-primary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {savingSection ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Menyimpan...
                                </>
                              ) : (
                                <>
                                  <Save className="h-4 w-4" />
                                  Simpan Section
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={fetchSections}
                          disabled={loadingSections || savingSection}
                          className="theme-text-muted inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition hover:opacity-70 disabled:opacity-50"
                        >
                          <RefreshCw
                            className={`h-3.5 w-3.5 ${
                              loadingSections ? "animate-spin" : ""
                            }`}
                          />
                          Muat Ulang Section
                        </button>
                      </div>
                    </div>
                  </section>

                  <section className="theme-card theme-border rounded-2xl border p-5 shadow-sm sm:p-6">
                    <div className="flex items-start gap-3">
                      <div className="theme-card-soft theme-text-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                        <Globe2 className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="theme-text text-sm font-bold">
                          URL Halaman
                        </h3>

                        <p className="theme-text-muted mt-1 text-xs leading-5">
                          Slug dikelola oleh backend CMS.
                        </p>

                        <div className="theme-card-soft theme-border mt-4 overflow-hidden rounded-xl border">
                          <div className="flex items-center gap-2 px-4 py-3">
                            <Globe2
                              className="h-4 w-4 shrink-0"
                              style={{
                                color: "var(--color-primary)",
                              }}
                            />

                            <span className="theme-text-secondary break-all text-sm font-medium">
                              /{originalPage?.slug || "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="min-w-0 space-y-6">
                  <section className="theme-card theme-border rounded-2xl border shadow-sm">
                    <div className="theme-border border-b px-5 py-4">
                      <h2 className="theme-text text-sm font-bold">
                        Status Publikasi
                      </h2>

                      <p className="theme-text-muted mt-0.5 text-[11px]">
                        Pilih status sesuai dukungan backend.
                      </p>
                    </div>

                    <div className="p-5">
                      <label
                        htmlFor="status"
                        className="theme-text-secondary mb-2 block text-sm font-semibold"
                      >
                        Status
                      </label>

                      <select
                        id="status"
                        value={form.status}
                        onChange={(event) =>
                          handleChange("status", event.target.value)
                        }
                        className="theme-input w-full rounded-xl border px-4 py-3 text-sm outline-none shadow-sm transition focus:border-[var(--color-primary)]"
                      >
                        <option value="draft">Draft</option>
                        <option value="dipublikasikan">
                          Dipublikasikan
                        </option>
                        <option value="aktif">Aktif</option>
                        <option value="nonaktif">Nonaktif</option>
                        <option value="arsip">Arsip</option>
                      </select>

                      <div className="theme-card-soft theme-border mt-4 rounded-xl border p-3">
                        <p className="theme-text text-xs font-semibold">
                          Panduan status
                        </p>

                        <ul className="theme-text-secondary mt-2 space-y-2 text-xs leading-5">
                          <li>
                            <strong>Draft:</strong> halaman masih dalam
                            pengerjaan.
                          </li>
                          <li>
                            <strong>Dipublikasikan:</strong> halaman
                            ditujukan untuk ditampilkan secara publik.
                          </li>
                          <li>
                            <strong>Aktif:</strong> status aktif sesuai
                            aturan publikasi backend.
                          </li>
                          <li>
                            <strong>Nonaktif / Arsip:</strong> digunakan
                            jika didukung oleh alur CMS backend.
                          </li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  <section className="theme-card theme-border rounded-2xl border shadow-sm">
                    <div className="theme-border border-b px-5 py-4">
                      <h2 className="theme-text text-sm font-bold">
                        Informasi Halaman
                      </h2>
                    </div>

                    <div className="space-y-4 p-5">
                      <div>
                        <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wider">
                          ID Halaman
                        </p>

                        <p className="theme-text-secondary mt-1 break-all text-xs">
                          {originalPage?.id || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wider">
                          Slug
                        </p>

                        <p className="theme-text-secondary mt-1 break-all text-xs">
                          {originalPage?.slug || "-"}
                        </p>
                      </div>

                      {originalPage?.dibuatPada && (
                        <div>
                          <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wider">
                            Dibuat
                          </p>

                          <p className="theme-text-secondary mt-1 text-xs">
                            {new Date(
                              originalPage.dibuatPada
                            ).toLocaleString("id-ID", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </p>
                        </div>
                      )}

                      {originalPage?.diperbaruiPada && (
                        <div>
                          <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wider">
                            Terakhir diperbarui
                          </p>

                          <p className="theme-text-secondary mt-1 text-xs">
                            {new Date(
                              originalPage.diperbaruiPada
                            ).toLocaleString("id-ID", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="theme-card theme-border rounded-2xl border p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                        <Save className="h-4 w-4" />
                      </div>

                      <div>
                        <h3 className="theme-text text-sm font-bold">
                          Simpan Perubahan
                        </h3>

                        <p className="theme-text-muted mt-1 text-xs leading-5">
                          Simpan informasi halaman secara terpisah
                          dari konfigurasi section.
                        </p>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      className="theme-primary mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Simpan Halaman
                        </>
                      )}
                    </button>

                    <Link
                      href="/admin/cms/pages"
                      className="theme-card theme-border theme-text-secondary mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Batal
                    </Link>
                  </section>
                </div>
              </div>
            </form>

            <footer className="py-7 text-center">
              <p className="theme-text-muted text-[11px]">
                © 2026 SmartSchool • CMS Management
              </p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}