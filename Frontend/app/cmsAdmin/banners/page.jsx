"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { dummyBanners } from "../../../lib/dummyData";

import {
  LayoutPanelTop,
  Plus,
  Search,
  X,
  Eye,
  Pencil,
  Trash2,
  LayoutGrid,
  CheckCircle2,
  FileEdit,
  Image as ImageIcon,
  ArrowUpRight,
} from "lucide-react";

export default function BannersPage() {
  const [active, setActive] = useState("banners");
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [banners, setBanners] = useState(dummyBanners);

  const filteredBanners = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return banners;
    return banners.filter((banner) =>
      banner.title?.toLowerCase().includes(query)
    );
  }, [banners, searchQuery]);

  const totalBanners = banners.length;
  const activeBanners = banners.filter((banner) => banner.status === "active").length;
  const draftBanners = banners.filter((banner) => banner.status === "draft").length;

  const handleDelete = (id) => {
    if (!confirm("Yakin ingin menghapus banner ini? Tindakan ini tidak dapat dibatalkan.")) return;
    setBanners((prev) => prev.filter((banner) => banner.id !== id));
  };

  const getPositionStyle = (position) => {
    const styles = {
      hero: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/60",
      promo: "bg-violet-50 text-violet-700 ring-1 ring-violet-200/60",
      news: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60",
    };
    return styles[position?.toLowerCase()] || "bg-slate-50 text-slate-600 ring-1 ring-slate-200/60";
  };

  const getStatusStyle = (status) => {
    if (status === "active") {
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60";
    }
    return "bg-slate-100 text-slate-500 ring-1 ring-slate-200";
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      <Sidebar
        active={active}
        setActive={setActive}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* ===== HEADER dengan props CMS Admin ===== */}
        <Header
          user={{
            name: "CMS Admin",
            email: "cms@smartschool.com",
            avatar: "CA",
          }}
        />

        <main className="min-w-0 flex-1">
          <div className="w-full min-w-0 px-3 py-4 sm:px-5 sm:py-5 md:px-7 md:py-7 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-[1800px]">
              {/* TOP BAR */}
              <div className="mb-6 flex flex-col gap-4 xl:mb-8 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 sm:h-12 sm:w-12">
                    <LayoutPanelTop className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600 sm:text-xs">
                        CMS Management
                      </span>
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      <span className="text-[10px] font-medium text-slate-400 sm:text-xs">
                        Banner
                      </span>
                    </div>
                    <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                      Daftar Banner
                    </h1>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">
                      Kelola banner website sekolah dengan mudah dan terorganisir.
                    </p>
                  </div>
                </div>

                <Link
                  href="/cmsAdmin/banners/tambah"
                  className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl sm:w-fit"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Banner
                </Link>
              </div>

              {/* STATISTICS */}
              <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 lg:mb-8">
                <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-5">
                  <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-indigo-500/5 blur-2xl" />
                  <div className="relative flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <LayoutGrid className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:text-xs">
                        Total Banner
                      </p>
                      <p className="mt-0.5 text-2xl font-bold text-slate-900">{totalBanners}</p>
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-5">
                  <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-emerald-500/5 blur-2xl" />
                  <div className="relative flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 sm:text-xs">
                        Active
                      </p>
                      <p className="mt-0.5 text-2xl font-bold text-emerald-600">{activeBanners}</p>
                    </div>
                  </div>
                </div>

                <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-5">
                  <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-slate-500/5 blur-2xl" />
                  <div className="relative flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                      <FileEdit className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:text-xs">
                        Draft
                      </p>
                      <p className="mt-0.5 text-2xl font-bold text-slate-600">{draftBanners}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SEARCH */}
              <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="relative w-full min-w-0 lg:max-w-xl">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari berdasarkan judul banner..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-10 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-slate-400">
                      Menampilkan{" "}
                      <span className="font-semibold text-slate-700">
                        {filteredBanners.length}
                      </span>{" "}
                      banner
                    </p>
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </section>

              {/* BANNER LIST */}
              {filteredBanners.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white px-5 py-16 text-center shadow-sm">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                    <LayoutPanelTop className="h-7 w-7 text-slate-400" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 sm:text-lg">
                    {searchQuery ? "Banner tidak ditemukan" : "Belum ada banner"}
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-400">
                    {searchQuery
                      ? "Coba gunakan kata kunci pencarian yang berbeda."
                      : "Tambahkan banner pertama untuk mempercantik tampilan website sekolah."}
                  </p>
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
                    >
                      <X className="h-4 w-4" />
                      Reset Pencarian
                    </button>
                  ) : (
                    <Link
                      href="/cmsAdmin/banners/tambah"
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700"
                    >
                      <Plus className="h-4 w-4" />
                      Tambah Banner
                    </Link>
                  )}
                </div>
              ) : (
                <section className="w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  {/* Desktop Table */}
                  <div className="hidden sm:block w-full overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/80">
                          <th className="px-5 py-4 sm:px-6">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Banner</span>
                          </th>
                          <th className="px-5 py-4 sm:px-6">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Judul</span>
                          </th>
                          <th className="hidden px-5 py-4 md:table-cell sm:px-6">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Posisi</span>
                          </th>
                          <th className="hidden px-5 py-4 lg:table-cell sm:px-6">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</span>
                          </th>
                          <th className="px-5 py-4 text-right sm:px-6">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Aksi</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredBanners.map((banner) => (
                          <tr key={banner.id} className="group transition-colors hover:bg-indigo-50/20">
                            <td className="px-5 py-4 sm:px-6">
                              <div className="h-14 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm">
                                {banner.image ? (
                                  <img
                                    src={banner.image}
                                    alt={banner.title}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <ImageIcon className="h-5 w-5 text-slate-400" />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-4 sm:px-6">
                              <div className="min-w-0">
                                <p
                                  title={banner.title}
                                  className="max-w-[300px] truncate text-sm font-semibold text-slate-800 transition-colors group-hover:text-indigo-600"
                                >
                                  {banner.title}
                                </p>
                                <p className="mt-1 text-[10px] text-slate-400">Banner Website</p>
                                <div className="mt-2 flex flex-wrap items-center gap-2 md:hidden">
                                  <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-semibold ${getStatusStyle(
                                      banner.status
                                    )}`}
                                  >
                                    <span
                                      className={`h-1.5 w-1.5 rounded-full ${
                                        banner.status === "active" ? "bg-emerald-500" : "bg-slate-400"
                                      }`}
                                    />
                                    {banner.status === "active" ? "Active" : "Draft"}
                                  </span>
                                  <span
                                    className={`rounded-full px-2.5 py-1 text-[9px] font-semibold capitalize ${getPositionStyle(
                                      banner.position
                                    )}`}
                                  >
                                    {banner.position}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="hidden px-5 py-4 md:table-cell sm:px-6">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${getPositionStyle(
                                  banner.position
                                )}`}
                              >
                                <LayoutPanelTop className="h-3 w-3" />
                                {banner.position}
                              </span>
                            </td>
                            <td className="hidden px-5 py-4 lg:table-cell sm:px-6">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${getStatusStyle(
                                  banner.status
                                )}`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    banner.status === "active" ? "bg-emerald-500" : "bg-slate-400"
                                  }`}
                                />
                                {banner.status === "active" ? "Active" : "Draft"}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right sm:px-6">
                              <div className="flex items-center justify-end gap-1">
                                <Link
                                  href={`/cmsAdmin/banners/${banner.id}/preview`}
                                  target="_blank"
                                  title="Preview"
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                                >
                                  <Eye className="h-4 w-4" />
                                </Link>
                                <Link
                                  href={`/cmsAdmin/banners/${banner.id}/edit`}
                                  title="Edit"
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(banner.id)}
                                  title="Hapus"
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
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

                  {/* Mobile View */}
                  <div className="divide-y divide-slate-100 sm:hidden">
                    {filteredBanners.map((banner) => (
                      <div key={banner.id} className="p-4 transition-colors hover:bg-slate-50">
                        <div className="flex items-start gap-3">
                          <div className="h-12 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                            {banner.image ? (
                              <img src={banner.image} alt={banner.title} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <ImageIcon className="h-4 w-4 text-slate-400" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-800">{banner.title}</p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-semibold ${getStatusStyle(
                                  banner.status
                                )}`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    banner.status === "active" ? "bg-emerald-500" : "bg-slate-400"
                                  }`}
                                />
                                {banner.status === "active" ? "Active" : "Draft"}
                              </span>
                              <span
                                className={`rounded-full px-2 py-1 text-[9px] font-semibold capitalize ${getPositionStyle(
                                  banner.position
                                )}`}
                              >
                                {banner.position}
                              </span>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            <Link
                              href={`/cmsAdmin/banners/${banner.id}/edit`}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDelete(banner.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Table Footer */}
                  <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="flex items-center gap-3 text-[10px] font-medium text-slate-400 sm:text-xs">
                      <span className="flex items-center gap-1.5">
                        <LayoutGrid className="h-3.5 w-3.5" />
                        Total <strong className="text-slate-700">{filteredBanners.length}</strong>
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-emerald-600">
                        {filteredBanners.filter((b) => b.status === "active").length} active
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500">
                        {filteredBanners.filter((b) => b.status === "draft").length} draft
                      </span>
                    </div>
                    <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-[9px] font-semibold text-slate-400">
                      Data simulasi
                    </span>
                  </div>
                </section>
              )}

              {/* Footer */}
              <footer className="py-8 text-center">
                <p className="text-[10px] font-medium text-slate-400 sm:text-xs">
                  © 2026 SmartSchool • CMS Banner Management
                </p>
              </footer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}