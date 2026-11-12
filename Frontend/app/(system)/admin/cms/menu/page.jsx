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
  Eye,
  Image as ImageIcon,
  ArrowUpDown,
} from "lucide-react";

const API_URL = "/api/cms/menu-konfigurasi";
const HALAMAN_API_URL = "/api/cms/halaman";

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

function getStatusLabel(status) {
  const value = String(status || "").toLowerCase();
  if (value === "aktif") return "Aktif";
  if (value === "nonaktif") return "Nonaktif";
  return status || "-";
}

function getStatusStyle(status) {
  const value = String(status || "").toLowerCase();
  if (value === "aktif") return "theme-success border";
  return "theme-card-soft theme-text-secondary border";
}

function formatLabel(value) {
  return String(value || "-")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeId(value) {
  return value === null || value === undefined ? "" : String(value);
}

export default function CmsMenuPage() {
  const router = useRouter();
  const [active, setActive] = useState("menu");
  const [collapsed, setCollapsed] = useState(false);

  const [items, setItems] = useState([]);
  const [halamanList, setHalamanList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingHalaman, setLoadingHalaman] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [halamanError, setHalamanError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchItems = useCallback(async (showRefresh = false) => {
    try {
      setError("");
      if (showRefresh) setRefreshing(true);
      else setLoading(true);

      const result = await apiFetch(API_URL);
      const data = unwrapData(result);

      if (!Array.isArray(data)) {
        throw new Error("Format data konfigurasi menu dari server tidak valid.");
      }
      setItems(data);
    } catch (err) {
      console.error("Gagal mengambil konfigurasi menu:", err);
      setError(getErrorMessage(err, "Gagal mengambil konfigurasi menu dari server."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

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
    fetchItems();
    fetchHalaman();
  }, [fetchItems, fetchHalaman]);

  const filteredItems = items.filter((item) => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return true;
    const searchableValues = [
      item?.halamanCms?.judul,
      item?.halamanCms?.slug,
      item?.halamanCmsId,
      item?.section,
      item?.judul,
      item?.subJudul,
      item?.status,
    ];
    return searchableValues.some((value) =>
      String(value ?? "").toLowerCase().includes(keyword)
    );
  });

  const activeCount = items.filter(
    (item) => String(item?.status || "").toLowerCase() === "aktif"
  ).length;

  const handleDelete = async () => {
    if (!deleteTarget?.id || deletingId !== null) return;
    try {
      setDeletingId(deleteTarget.id);
      setError("");
      setSuccess("");

      await apiFetch(`${API_URL}/${encodeURIComponent(deleteTarget.id)}`, {
        method: "DELETE",
      });

      const title = deleteTarget.judul || "Konfigurasi menu";
      setDeleteTarget(null);
      await fetchItems(true);
      setSuccess(`Konfigurasi "${title}" berhasil dinonaktifkan.`);
    } catch (err) {
      console.error("Gagal menonaktifkan konfigurasi menu:", err);
      setError(getErrorMessage(err, "Gagal menonaktifkan konfigurasi menu."));
    } finally {
      setDeletingId(null);
    }
  };

  const halamanLabel = (item) => item?.halamanCms?.judul || "Halaman tidak ditemukan";

  const refreshAll = async () => {
    await Promise.all([fetchItems(true), fetchHalaman()]);
  };

  if (loading) {
    return (
      <div className="theme-page flex h-screen w-full overflow-hidden">
        <Sidebar active={active} setActive={setActive} collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="shrink-0">
            <Header
              title="Pengaturan Menu Website"
              user={{ name: "CMS Admin", email: "cms@smartschool.com", avatar: "CA" }}
            />
          </div>
          <main className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto">
            <div className="text-center">
              <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-[var(--color-primary)]" />
              <p className="theme-text text-sm font-semibold">Memuat konfigurasi menu...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar active={active} setActive={setActive} collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="shrink-0">
          <Header
            title="Pengaturan Menu Website"
            user={{ name: "CMS Admin", email: "cms@smartschool.com", avatar: "CA" }}
          />
        </div>

        <main className="theme-page flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="w-full flex-1 px-3 py-5 sm:px-6 lg:px-9">
            <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
              <div className="flex items-center gap-3 lg:col-span-2">
                <div className="bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border">
                  <Menu className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h1 className="theme-text text-2xl font-bold">Pengaturan Menu Website</h1>
                  <p className="theme-text-secondary mt-1 text-sm">
                    Kelola konten pada bagian-bagian template website sekolah.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2 lg:col-span-2">
                <button
                  type="button"
                  onClick={refreshAll}
                  disabled={refreshing || loadingHalaman}
                  className="theme-card theme-border theme-text-secondary inline-flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-semibold disabled:opacity-60"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing || loadingHalaman ? "animate-spin" : ""}`} />
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

            {halamanError && (
              <div className="theme-danger mb-4 flex items-start gap-3 rounded-xl border p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="min-w-0 flex-1 text-sm">
                  Gagal mengambil daftar halaman CMS: {halamanError}
                </div>
                <button type="button" onClick={fetchHalaman}>
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            )}

            <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
              <div className="theme-card theme-border rounded-2xl border p-5">
                <p className="theme-text-muted text-xs">Total konfigurasi</p>
                <p className="theme-text mt-2 text-2xl font-bold">{items.length}</p>
              </div>
              <div className="theme-card theme-border rounded-2xl border p-5">
                <p className="theme-text-muted text-xs">Konfigurasi aktif</p>
                <p className="theme-text mt-2 text-2xl font-bold">{activeCount}</p>
              </div>
              <div className="theme-card theme-border rounded-2xl border p-5">
                <p className="theme-text-muted text-xs">Total halaman CMS</p>
                <p className="theme-text mt-2 text-2xl font-bold">{halamanList.length}</p>
              </div>
              <div className="theme-card theme-border rounded-2xl border p-5">
                <p className="theme-text-muted text-xs">Nonaktif</p>
                <p className="theme-text mt-2 text-2xl font-bold">{items.length - activeCount}</p>
              </div>
              <div className="theme-card theme-border rounded-2xl border p-5">
                <p className="theme-text-muted text-xs">Ditampilkan</p>
                <p className="theme-text mt-2 text-2xl font-bold">{filteredItems.length}</p>
              </div>
              <div className="theme-card theme-border rounded-2xl border p-5">
                <p className="theme-text-muted text-xs">Section unik</p>
                <p className="theme-text mt-2 text-2xl font-bold">
                  {new Set(items.map((i) => i.section)).size}
                </p>
              </div>
            </section>

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="theme-text text-base font-bold">Daftar Konfigurasi</h2>
                <p className="theme-text-secondary mt-1 text-xs">Konten disimpan melalui API backend CMS.</p>
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
                  <h3 className="theme-text text-sm font-bold">Semua Konfigurasi Menu</h3>
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
                        <th className="px-5 py-4 text-left text-xs font-bold uppercase">Halaman / Section</th>
                        <th className="px-5 py-4 text-left text-xs font-bold uppercase">Judul</th>
                        <th className="px-5 py-4 text-left text-xs font-bold uppercase">Urutan</th>
                        <th className="px-5 py-4 text-left text-xs font-bold uppercase">Status</th>
                        <th className="px-5 py-4 text-right text-xs font-bold uppercase">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item) => (
                        <tr key={item.id} className="theme-table-hover theme-border-soft border-b">
                          <td className="px-5 py-4">
                            <p className="theme-text text-sm font-semibold">{halamanLabel(item)}</p>
                            <p className="theme-text-muted mt-1 text-xs">Section: {formatLabel(item.section)}</p>
                            {item.halamanCms?.slug && (
                              <p className="theme-text-muted mt-1 text-xs">Slug: {item.halamanCms.slug}</p>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              {item.gambarUrl ? (
                                <div className="theme-card-soft flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border">
                                  <img src={item.gambarUrl} alt="" className="h-full w-full object-cover" />
                                </div>
                              ) : (
                                <div className="bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border">
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
                            <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(item.status)}`}>
                              {getStatusLabel(item.status)}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-1">
                              <button
                                type="button"
                                title="Lihat Detail"
                                onClick={() =>
                                  router.push(`/admin/cms/menu/${encodeURIComponent(normalizeId(item.id))}`)
                                }
                                className="theme-text-muted flex h-9 w-9 items-center justify-center rounded-lg hover:bg-[var(--color-sidebar-active)] hover:text-[var(--color-primary)]"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                title="Edit"
                                onClick={() =>
                                  router.push(
                                    `/admin/cms/menu/${encodeURIComponent(normalizeId(item.id))}/edit`
                                  )
                                }
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
                      className="theme-primary mt-4 inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold"
                    >
                      <Plus className="h-4 w-4" />
                      Tambah Konfigurasi
                    </button>
                  )}
                </div>
              )}
            </section>

            <footer className="py-7 text-center">
              <p className="theme-text-muted text-xs">© 2026 SmartSchool • CMS Management</p>
            </footer>
          </div>
        </main>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="theme-card theme-border w-full max-w-md rounded-2xl border shadow-2xl">
            <div className="p-6">
              <div className="theme-danger flex h-11 w-11 items-center justify-center rounded-xl">
                <Trash2 className="h-5 w-5" />
              </div>
              <h3 className="theme-text mt-4 text-lg font-bold">Nonaktifkan konfigurasi?</h3>
              <p className="theme-text-secondary mt-2 text-sm leading-6">
                Konfigurasi{" "}
                <strong className="theme-text">"{deleteTarget.judul || "Tanpa Judul"}"</strong>{" "}
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