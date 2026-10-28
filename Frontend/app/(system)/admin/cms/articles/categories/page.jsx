"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { apiFetch } from "../../../../../../lib/api";

import {
  Tags,
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  Check,
  Loader2,
  FolderOpen,
  FileText,
} from "lucide-react";

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.data)) return data.data.data;
  if (Array.isArray(data?.result)) return data.result;
  return [];
}

function StatusBadge({ status }) {
  const normalizedStatus = String(status || "").toLowerCase();
  const isActive = normalizedStatus === "aktif" || normalizedStatus === "active";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[11px] font-semibold ${
        isActive ? "theme-success" : "theme-card theme-text-muted theme-border border"
      }`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: isActive ? "var(--color-success)" : "var(--color-text-muted)" }}
      />
      {isActive ? "Aktif" : "Nonaktif"}
    </span>
  );
}

// StatCard dengan desain bersih dan teks utuh
function StatCard({ label, value, description, icon, iconClassName }) {
  return (
    <div className="theme-card theme-border flex flex-col justify-between rounded-xl border p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="theme-text-muted text-[10px] font-bold uppercase tracking-[0.14em]">{label}</p>
          <p className="theme-text mt-2 truncate text-2xl font-bold tracking-tight">{value}</p>
        </div>
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}>
          {icon}
        </div>
      </div>
      <p className="theme-text-muted mt-2 text-xs">{description}</p>
    </div>
  );
}

export default function ArticleCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);
      const response = await apiFetch("/api/cms/kategori-artikel");
      const data = extractList(response);
      setCategories(data);
    } catch (error) {
      console.error("Gagal mengambil kategori artikel:", error);
      alert(error?.message || "Gagal mengambil kategori artikel.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await apiFetch(`/api/cms/kategori-artikel/${deleteTarget.id}`, { method: "DELETE" });
      alert("Kategori berhasil dihapus.");
      setDeleteTarget(null);
      await loadCategories();
    } catch (error) {
      console.error("Gagal menghapus kategori:", error);
      alert(error?.message || "Gagal menghapus kategori.");
    } finally {
      setDeleting(false);
    }
  }

  const filteredCategories = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return categories;
    return categories.filter((category) =>
      String(category?.nama || "").toLowerCase().includes(keyword)
    );
  }, [categories, search]);

  const totalCategories = categories.length;
  const activeCategories = categories.filter((category) => {
    const status = String(category?.status || "").toLowerCase();
    return status === "aktif" || status === "active";
  }).length;
  const inactiveCategories = totalCategories - activeCategories;

  return (
    // ROOT: h-screen overflow-hidden
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar />

      {/* BODY: min-h-0 flex-1 */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* HEADER: shrink-0 */}
        <div className="shrink-0 border-b theme-border">
          <Header />
        </div>

        {/* MAIN: min-w-0 flex-1 overflow-y-auto */}
        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          {/* KONTEN: w-full tanpa max-w */}
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            
            {/* HEADER PAGE */}
            <div className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em]">
                  <span style={{ color: "var(--color-primary)" }}>CMS</span>
                  <span className="theme-text-placeholder">/</span>
                  <span className="theme-text-muted">Artikel</span>
                  <span className="theme-text-placeholder">/</span>
                  <span className="theme-text-muted">Kategori</span>
                </div>
                <h1 className="theme-text text-[26px] font-bold tracking-tight sm:text-[30px]">
                  Kategori Artikel
                </h1>
                <p className="theme-text-muted mt-1.5 max-w-2xl text-sm leading-6">
                  Kelola kategori untuk mengorganisir konten artikel sekolah.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={loadCategories}
                  disabled={loading}
                  className="theme-card theme-border theme-text-secondary inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold shadow-sm transition hover:opacity-80 disabled:opacity-50"
                >
                  <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                  Refresh
                </button>

                <Link
                  href="/admin/cms/articles/categories/tambah"
                  className="theme-primary inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold shadow-sm transition"
                >
                  <Plus size={16} />
                  Tambah Kategori
                </Link>
              </div>
            </div>

            {/* STATISTIK: Grid Responsif */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard
                label="Total Kategori"
                value={totalCategories}
                description="Semua kategori artikel"
                icon={<Tags size={18} />}
                iconClassName="theme-info"
              />
              <StatCard
                label="Kategori Aktif"
                value={activeCategories}
                description="Dapat digunakan"
                icon={<Check size={18} />}
                iconClassName="theme-success"
              />
              <StatCard
                label="Nonaktif"
                value={inactiveCategories}
                description="Tidak digunakan"
                icon={<FolderOpen size={18} />}
                iconClassName="theme-card theme-text-muted"
              />
            </div>

            {/* TABEL */}
            <div className="theme-card theme-border overflow-hidden rounded-xl border shadow-sm">
              <div className="theme-border-soft flex flex-col gap-4 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                  <p className="theme-text text-sm font-bold">Daftar Kategori</p>
                  <p className="theme-text-muted mt-0.5 text-xs">Kelola kategori artikel yang tersedia.</p>
                </div>

                <div className="relative w-full sm:w-[300px]">
                  <Search size={16} className="theme-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Cari kategori..."
                    className="theme-input h-10 w-full rounded-lg border pl-9 pr-9 text-sm outline-none transition focus:border-[var(--color-primary)]"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="theme-text-muted absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md transition hover:opacity-80"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Tabel overflow-x-auto */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px]">
                  <thead>
                    <tr className="theme-table-header theme-border-soft border-b">
                      <th className="w-16 px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em]">No</th>
                      <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em]">Kategori</th>
                      <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em]">Slug</th>
                      <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em]">Status</th>
                      <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.12em]">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border-soft)]">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-16 text-center">
                          <Loader2 size={26} className="mx-auto animate-spin text-[var(--color-primary)]" />
                          <p className="theme-text-secondary mt-3 text-sm font-semibold">Memuat kategori...</p>
                        </td>
                      </tr>
                    ) : filteredCategories.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-16 text-center">
                          <div className="theme-card-soft theme-text-muted mx-auto flex h-12 w-12 items-center justify-center rounded-xl border">
                            {search ? <Search size={21} /> : <FolderOpen size={21} />}
                          </div>
                          <h3 className="theme-text-secondary mt-4 text-sm font-bold">
                            {search ? "Kategori tidak ditemukan" : "Belum ada kategori"}
                          </h3>
                        </td>
                      </tr>
                    ) : (
                      filteredCategories.map((category, index) => (
                        <tr key={category.id} className="theme-table-hover group transition">
                          <td className="theme-text-muted px-5 py-4 text-sm font-medium">{index + 1}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="theme-info flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border">
                                <Tags size={16} />
                              </div>
                              <div className="min-w-0">
                                <p className="theme-text truncate text-sm font-semibold">{category.nama}</p>
                                <p className="theme-text-muted mt-0.5 text-[11px]">Kategori artikel</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="theme-card-soft theme-text-muted inline-block rounded-md border px-2 py-1 font-mono text-[11px]">
                              {category.slug || "-"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge status={category.status} />
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-1.5">
                              <Link
                                href={`/admin/cms/articles/categories/${category.id}/edit`}
                                className="theme-card theme-border theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg border transition hover:opacity-80"
                                title="Edit kategori"
                              >
                                <Pencil size={14} />
                              </Link>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(category)}
                                className="theme-card theme-border theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg border transition hover:opacity-80"
                                title="Hapus kategori"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {!loading && categories.length > 0 && (
                <div className="theme-border-soft theme-text-muted flex items-center gap-2 border-t px-5 py-3.5 text-[11px] sm:px-6">
                  <FileText size={13} />
                  Menampilkan <span className="theme-text-secondary font-semibold">{filteredCategories.length}</span> dari <span className="theme-text-secondary font-semibold">{categories.length}</span> kategori
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* MODAL HAPUS */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">
          <div className="theme-card theme-border w-full max-w-md overflow-hidden rounded-xl border shadow-xl">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="theme-danger flex h-10 w-10 items-center justify-center rounded-lg">
                  <Trash2 size={18} />
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg transition hover:opacity-80 disabled:opacity-50"
                >
                  <X size={17} />
                </button>
              </div>
              <h2 className="theme-text mt-5 text-lg font-bold tracking-tight">Hapus Kategori?</h2>
              <p className="theme-text-secondary mt-2 text-sm leading-6">
                Kamu yakin ingin menghapus kategori <span className="theme-text font-semibold">"{deleteTarget.nama}"</span>?
              </p>
            </div>
            <div className="theme-card-soft theme-border-soft flex flex-col-reverse gap-2 border-t px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="theme-card theme-border theme-text-secondary h-10 rounded-lg border px-5 text-sm font-semibold transition hover:opacity-80 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="theme-danger inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-5 text-sm font-semibold transition hover:opacity-80 disabled:opacity-50"
              >
                {deleting ? <><Loader2 size={15} className="animate-spin" /> Menghapus...</> : <><Trash2 size={15} /> Hapus</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}