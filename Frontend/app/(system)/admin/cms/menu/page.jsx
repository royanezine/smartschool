
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { apiFetch } from "../../../../../lib/api";

import {
  Menu,
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Eye,
  Image as ImageIcon,
  ArrowUpDown,
} from "lucide-react";

const API_URL = "/api/cms/menu-konfigurasi";

const INITIAL_FORM = {
  halaman: "beranda",
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

function getStatusLabel(status) {
  const value = String(status || "").toLowerCase();

  if (value === "aktif") return "Aktif";
  if (value === "nonaktif") return "Nonaktif";
  if (value === "draft") return "Draft";

  return status || "-";
}

function getStatusStyle(status) {
  if (String(status || "").toLowerCase() === "aktif") {
    return "theme-success border";
  }

  if (String(status || "").toLowerCase() === "draft") {
    return "theme-warning border";
  }

  return "theme-card-soft theme-text-secondary border";
}

function formatLabel(value) {
  return String(value || "-")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function CmsMenuPage() {
  const router = useRouter();

  const [active, setActive] = useState("menu");
  const [collapsed, setCollapsed] = useState(false);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ ...INITIAL_FORM });

  const [previewItem, setPreviewItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);


  const fetchItems = useCallback(async (showRefresh = false) => {
    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const result = await apiFetch(API_URL);
      const data = unwrapData(result);

      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal mengambil konfigurasi menu:", err);
      setError(
        getErrorMessage(err, "Gagal mengambil konfigurasi menu dari server.")
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);


  const filteredItems = items.filter((item) => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return true;

    return [
      item?.halaman,
      item?.section,
      item?.judul,
      item?.subJudul,
      item?.status,
    ].some((value) => String(value || "").toLowerCase().includes(keyword));
  });

  const activeCount = items.filter(
    (item) => String(item?.status || "").toLowerCase() === "aktif"
  ).length;

  const inactiveCount = items.filter(
    (item) => String(item?.status || "").toLowerCase() === "nonaktif"
  ).length;


  const openCreateForm = () => {
    setEditingItem(null);
    setFormData({ ...INITIAL_FORM });
    setError("");
    setSuccess("");
    setFormOpen(true);
  };

  const openEditForm = (item) => {
    setEditingItem(item);

    setFormData({
      halaman: item?.halaman || "beranda",
      section: item?.section || "hero",
      judul: item?.judul || "",
      subJudul: item?.subJudul || "",
      konten: item?.konten || "",
      gambarUrl: item?.gambarUrl || "",
      ctaText: item?.ctaText || "",
      ctaLink: item?.ctaLink || "",
      urutan: Number(item?.urutan) || 1,
      status: item?.status || "aktif",
    });

    setError("");
    setSuccess("");
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;

    setFormOpen(false);
    setEditingItem(null);
    setFormData({ ...INITIAL_FORM });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: name === "urutan" ? value : value,
    }));
  };


  const handleSave = async (event) => {
    event.preventDefault();

    const halaman = formData.halaman.trim();
    const section = formData.section.trim();
    const judul = formData.judul.trim();

    if (!halaman) {
      setError("Nama halaman wajib diisi.");
      return;
    }

    if (!section) {
      setError("Section wajib diisi.");
      return;
    }

    if (!judul) {
      setError("Judul menu atau konten wajib diisi.");
      return;
    }

    const parsedUrutan = Number(formData.urutan);

    if (!Number.isInteger(parsedUrutan) || parsedUrutan < 1) {
      setError("Urutan harus berupa angka bulat minimal 1.");
      return;
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
      setSuccess("");

      if (editingItem?.id) {
        await apiFetch(`${API_URL}/${editingItem.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      const message = editingItem
        ? "Konfigurasi menu berhasil diperbarui."
        : "Konfigurasi menu berhasil ditambahkan.";

      setFormOpen(false);
      setEditingItem(null);
      setFormData({ ...INITIAL_FORM });

      await fetchItems(true);
      setSuccess(message);
    } catch (err) {
      console.error("Gagal menyimpan konfigurasi menu:", err);
      setError(getErrorMessage(err, "Gagal menyimpan konfigurasi menu."));
    } finally {
      setSaving(false);
    }
  };


  const handleDelete = async () => {
    if (!deleteTarget?.id) return;

    try {
      setDeletingId(deleteTarget.id);
      setError("");
      setSuccess("");

      await apiFetch(`${API_URL}/${deleteTarget.id}`, {
        method: "DELETE",
      });

      const title = deleteTarget.judul || "Konfigurasi menu";

      setDeleteTarget(null);
      setPreviewItem(null);

      await fetchItems(true);
      setSuccess(`Konfigurasi "${title}" berhasil dinonaktifkan.`);
    } catch (err) {
      console.error("Gagal menonaktifkan konfigurasi menu:", err);
      setError(getErrorMessage(err, "Gagal menonaktifkan konfigurasi menu."));
    } finally {
      setDeletingId(null);
    }
  };


  if (loading) {
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
            title="Pengaturan Menu Website"
            user={{
              name: "CMS Admin",
              email: "cms@smartschool.com",
              avatar: "CA",
            }}
          />

          <main className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-[var(--color-primary)]" />
              <p className="theme-text text-sm font-semibold">
                Memuat konfigurasi menu...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }


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
          title="Pengaturan Menu Website"
          user={{
            name: "CMS Admin",
            email: "cms@smartschool.com",
            avatar: "CA",
          }}
        />

        <main className="theme-page min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1700px] px-3 py-5 sm:px-6 lg:px-9">

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="theme-info flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border">
                  <Menu className="h-5 w-5" />
                </div>

                <div>
                  <h1 className="theme-text text-2xl font-bold">
                    Pengaturan Menu Website
                  </h1>
                  <p className="theme-text-secondary mt-1 text-sm">
                    Kelola konfigurasi bagian menu dan konten website sekolah.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fetchItems(true)}
                  disabled={refreshing}
                  className="theme-card theme-border theme-text-secondary inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-semibold disabled:opacity-60"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>

<button
  type="button"
  onClick={() => router.push("/admin/cms/menu/tambah")}
  className="theme-primary inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold"
>
  <Plus className="h-4 w-4" />
  Tambah Konfigurasi
</button>
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

            {success && (
              <div className="theme-success mb-4 flex items-start gap-3 rounded-xl border p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="min-w-0 flex-1 text-sm">{success}</div>
                <button type="button" onClick={() => setSuccess("")}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}


            <section className="theme-card theme-border mb-6 rounded-2xl border p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="theme-card-soft rounded-xl border p-4">
                  <p className="theme-text-muted text-xs">Total konfigurasi</p>
                  <p className="theme-text mt-2 text-2xl font-bold">
                    {items.length}
                  </p>
                </div>

                <div className="theme-card-soft rounded-xl border p-4">
                  <p className="theme-text-muted text-xs">Konfigurasi aktif</p>
                  <p className="theme-text mt-2 text-2xl font-bold">
                    {activeCount}
                  </p>
                </div>

                <div className="theme-card-soft rounded-xl border p-4">
                  <p className="theme-text-muted text-xs">Konfigurasi nonaktif</p>
                  <p className="theme-text mt-2 text-2xl font-bold">
                    {inactiveCount}
                  </p>
                </div>
              </div>
            </section>


            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="theme-text text-base font-bold">
                  Daftar Konfigurasi
                </h2>
                <p className="theme-text-secondary mt-1 text-xs">
                  Pengaturan diambil dari endpoint CMS backend.
                </p>
              </div>

              <div className="relative w-full sm:max-w-sm">
                <Search className="theme-text-muted absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari halaman, section, atau judul..."
                  className="theme-input w-full rounded-xl border py-3 pl-9 pr-9 text-sm outline-none focus:border-[var(--color-primary)]"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="theme-text-muted absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>


            <section className="theme-card theme-border overflow-hidden rounded-2xl border">
              <div className="theme-card-soft theme-border flex items-center justify-between border-b px-5 py-4">
                <div>
                  <h3 className="theme-text text-sm font-bold">
                    Semua Konfigurasi Menu
                  </h3>
                  <p className="theme-text-muted mt-1 text-xs">
                    {filteredItems.length} konfigurasi ditemukan
                  </p>
                </div>
              </div>

              {filteredItems.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[950px]">
                    <thead className="theme-table-header">
                      <tr className="border-b">
                        <th className="px-5 py-4 text-left text-xs font-bold uppercase">
                          Halaman / Section
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-bold uppercase">
                          Judul
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-bold uppercase">
                          Urutan
                        </th>
                        <th className="px-5 py-4 text-left text-xs font-bold uppercase">
                          Status
                        </th>
                        <th className="px-5 py-4 text-right text-xs font-bold uppercase">
                          Aksi
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredItems.map((item) => (
                        <tr
                          key={item.id}
                          className="theme-table-hover theme-border-soft border-b"
                        >
                          <td className="px-5 py-4">
                            <p className="theme-text text-sm font-semibold">
                              {formatLabel(item.halaman)}
                            </p>
                            <p className="theme-text-muted mt-1 text-xs">
                              Section: {formatLabel(item.section)}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              {item.gambarUrl ? (
                                <div className="theme-card-soft flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border">
                                  <img
                                    src={item.gambarUrl}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="theme-info flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border">
                                  <ImageIcon className="h-4 w-4" />
                                </div>
                              )}

                              <div className="min-w-0">
                                <p className="theme-text max-w-[320px] truncate text-sm font-semibold">
                                  {item.judul || "Tanpa Judul"}
                                </p>
                                {item.subJudul && (
                                  <p className="theme-text-muted mt-1 max-w-[320px] truncate text-xs">
                                    {item.subJudul}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="theme-card-soft theme-text-secondary inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs">
                              <ArrowUpDown className="h-3.5 w-3.5" />
                              {item.urutan ?? 1}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(item.status)}`}
                            >
                              {getStatusLabel(item.status)}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-1">
                              <button
                                type="button"
                                title="Preview"
                                onClick={() => setPreviewItem(item)}
                                className="theme-text-muted flex h-9 w-9 items-center justify-center rounded-lg hover:bg-[var(--color-sidebar-active)] hover:text-[var(--color-primary)]"
                              >
                                <Eye className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                title="Edit"
                                onClick={() => openEditForm(item)}
                                className="theme-text-muted flex h-9 w-9 items-center justify-center rounded-lg hover:bg-[var(--color-sidebar-active)] hover:text-[var(--color-primary)]"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                title="Nonaktifkan"
                                onClick={() => setDeleteTarget(item)}
                                className="theme-text-muted flex h-9 w-9 items-center justify-center rounded-lg hover:bg-[var(--color-danger-background)] hover:text-[var(--color-danger)]"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-5 py-14 text-center">
                  <Menu className="theme-text-muted mx-auto mb-3 h-8 w-8" />
                  <h3 className="theme-text text-sm font-bold">
                    {search ? "Konfigurasi tidak ditemukan" : "Belum ada konfigurasi"}
                  </h3>
                  <p className="theme-text-secondary mx-auto mt-2 max-w-md text-xs leading-5">
                    {search
                      ? "Coba kata kunci pencarian lain."
                      : "Tambahkan konfigurasi agar konten website dapat dikelola melalui CMS."}
                  </p>

                  {!search && (
<button
  type="button"
  onClick={() => router.push("/admin/cms/menu/tambah")}
  className="theme-primary inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold"
>
  <Plus className="h-4 w-4" />
  Tambah Konfigurasi
</button>
                  )}
                </div>
              )}
            </section>

            <footer className="py-7 text-center">
              <p className="theme-text-muted text-xs">
                © 2026 SmartSchool • CMS Management
              </p>
            </footer>
          </div>
        </main>
      </div>


      {formOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSave}
            className="theme-card theme-border max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border shadow-2xl"
          >
            <div className="theme-border sticky top-0 z-10 flex items-center justify-between border-b p-5">
              <div>
                <h2 className="theme-text text-lg font-bold">
                  {editingItem ? "Edit Konfigurasi" : "Tambah Konfigurasi"}
                </h2>
                <p className="theme-text-secondary mt-1 text-xs">
                  Data akan disimpan melalui backend CMS.
                </p>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={closeForm}
                className="theme-text-muted rounded-lg p-2 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-5">
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

                {formData.gambarUrl && (
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="theme-text mb-2 block text-sm font-semibold">
                    Urutan
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    step="1"
                    name="urutan"
                    value={formData.urutan}
                    onChange={handleChange}
                    className="theme-input w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
                  />
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

              {error && (
                <div className="theme-danger flex items-start gap-2 rounded-xl border p-3 text-sm">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <div className="theme-card-soft theme-border sticky bottom-0 flex flex-col-reverse gap-2 border-t p-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={saving}
                onClick={closeForm}
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
                    <CheckCircle2 className="h-4 w-4" />
                    {editingItem ? "Simpan Perubahan" : "Simpan Konfigurasi"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}


      {previewItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="theme-card theme-border max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border shadow-2xl">
            <div className="theme-border flex items-center justify-between border-b p-5">
              <div>
                <h2 className="theme-text text-lg font-bold">
                  Preview Konfigurasi
                </h2>
                <p className="theme-text-muted mt-1 text-xs">
                  {formatLabel(previewItem.halaman)} /{" "}
                  {formatLabel(previewItem.section)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="theme-text-muted rounded-lg p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              {previewItem.gambarUrl && (
                <img
                  src={previewItem.gambarUrl}
                  alt={previewItem.judul || "Gambar konten"}
                  className="max-h-72 w-full rounded-xl object-cover"
                />
              )}

              <div>
                <p className="theme-text-muted text-xs">Judul</p>
                <h3 className="theme-text mt-1 text-2xl font-bold">
                  {previewItem.judul || "-"}
                </h3>
              </div>

              {previewItem.subJudul && (
                <div>
                  <p className="theme-text-muted text-xs">Subjudul</p>
                  <p className="theme-text-secondary mt-1 text-sm">
                    {previewItem.subJudul}
                  </p>
                </div>
              )}

              <div>
                <p className="theme-text-muted text-xs">Konten</p>
                <div className="theme-card-soft theme-border mt-2 rounded-xl border p-4">
                  <p className="theme-text-secondary whitespace-pre-wrap break-words text-sm leading-7">
                    {previewItem.konten || "Belum ada konten."}
                  </p>
                </div>
              </div>

              {(previewItem.ctaText || previewItem.ctaLink) && (
                <div className="theme-card-soft rounded-xl border p-4">
                  <p className="theme-text-muted text-xs">Tombol CTA</p>
                  <p className="theme-text mt-1 text-sm font-semibold">
                    {previewItem.ctaText || "Tanpa teks tombol"}
                  </p>
                  <p className="theme-text-secondary mt-1 break-all text-xs">
                    {previewItem.ctaLink || "Tanpa link"}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="theme-card-soft rounded-lg border px-3 py-2">
                  Urutan: {previewItem.urutan ?? 1}
                </span>
                <span
                  className={`rounded-lg border px-3 py-2 ${getStatusStyle(previewItem.status)}`}
                >
                  {getStatusLabel(previewItem.status)}
                </span>
              </div>
            </div>

            <div className="theme-card-soft theme-border flex flex-col-reverse gap-2 border-t p-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="theme-card theme-border theme-text-secondary rounded-xl border px-4 py-2.5 text-sm font-semibold"
              >
                Tutup
              </button>

              <button
                type="button"
                onClick={() => {
                  const item = previewItem;
                  setPreviewItem(null);
                  openEditForm(item);
                }}
                className="theme-primary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
              >
                <Pencil className="h-4 w-4" />
                Edit Konfigurasi
              </button>
            </div>
          </div>
        </div>
      )}


      {deleteTarget && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="theme-card theme-border w-full max-w-md rounded-2xl border shadow-2xl">
            <div className="p-6">
              <div className="theme-danger flex h-11 w-11 items-center justify-center rounded-xl">
                <Trash2 className="h-5 w-5" />
              </div>

              <h3 className="theme-text mt-4 text-lg font-bold">
                Nonaktifkan konfigurasi?
              </h3>

              <p className="theme-text-secondary mt-2 text-sm leading-6">
                Konfigurasi{" "}
                <strong className="theme-text">
                  "{deleteTarget.judul || "Tanpa Judul"}"
                </strong>{" "}
                akan dinonaktifkan melalui endpoint backend.
              </p>
            </div>

            <div className="theme-card-soft theme-border flex flex-col-reverse gap-2 border-t p-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={deletingId === deleteTarget.id}
                onClick={() => setDeleteTarget(null)}
                className="theme-card theme-border theme-text-secondary rounded-xl border px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={deletingId === deleteTarget.id}
                onClick={handleDelete}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-danger)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {deletingId === deleteTarget.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Ya, Nonaktifkan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
