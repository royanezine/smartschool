"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { apiFetch } from "../../../lib/api";

import {
  File,
  Plus,
  Search,
  X,
  Pencil,
  Trash2,
  MoreHorizontal,
  CheckCircle2,
  Globe2,
  LayoutTemplate,
  Eye,
  Loader2,
  AlertCircle,
  FileText,
  RefreshCw,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

export default function PagesPage() {
  const [active, setActive] = useState("pages");
  const [collapsed, setCollapsed] = useState(false);

  const [pages, setPages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedPage, setSelectedPage] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ============================================================
  // FETCH DATA
  // ============================================================

  const fetchPages = async (showRefresh = false) => {
    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const result = await apiFetch("/api/v1/cms/halaman");

      const responseData = result?.data;

      if (Array.isArray(responseData)) {
        setPages(responseData);
      } else if (Array.isArray(responseData?.data)) {
        setPages(responseData.data);
      } else {
        setPages([]);
      }
    } catch (err) {
      console.error("Gagal mengambil halaman CMS:", err);

      setError(
        err?.message || "Gagal mengambil data halaman dari server."
      );

      setPages([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  // ============================================================
  // FILTER
  // ============================================================

  const filteredPages = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();

    if (!keyword) {
      return pages;
    }

    return pages.filter((page) => {
      const title = String(page?.judul || "").toLowerCase();
      const slug = String(page?.slug || "").toLowerCase();
      const status = String(page?.status || "").toLowerCase();

      return (
        title.includes(keyword) ||
        slug.includes(keyword) ||
        status.includes(keyword)
      );
    });
  }, [pages, searchQuery]);

  // ============================================================
  // STATISTICS
  // ============================================================

  const totalPages = pages.length;

  const publishedCount = pages.filter((page) => {
    const status = String(page?.status || "").toLowerCase();

    return (
      status === "dipublikasikan" ||
      status === "published" ||
      status === "aktif"
    );
  }).length;

  const draftCount = pages.filter((page) => {
    const status = String(page?.status || "").toLowerCase();

    return status === "draft";
  }).length;

  // ============================================================
  // HELPERS
  // ============================================================

  const getPageTitle = (page) => {
    return page?.judul || "Tanpa Judul";
  };

  const getPageSlug = (page) => {
    return page?.slug || "-";
  };

  const getStatusLabel = (status) => {
    const value = String(status || "").toLowerCase();

    if (
      value === "dipublikasikan" ||
      value === "published" ||
      value === "aktif"
    ) {
      return "Dipublikasikan";
    }

    if (value === "draft") {
      return "Draft";
    }

    return status || "-";
  };

  const getStatusStyle = (status) => {
    const value = String(status || "").toLowerCase();

    if (
      value === "dipublikasikan" ||
      value === "published" ||
      value === "aktif"
    ) {
      return {
        wrapper:
          "border border-emerald-100 bg-emerald-50 text-emerald-700",
        dot: "bg-emerald-500",
      };
    }

    if (value === "draft") {
      return {
        wrapper:
          "border border-amber-100 bg-amber-50 text-amber-700",
        dot: "bg-amber-500",
      };
    }

    return {
      wrapper:
        "border border-slate-200 bg-slate-50 text-slate-600",
      dot: "bg-slate-400",
    };
  };

  // ============================================================
  // PUBLIC WEBSITE URL
  // ============================================================

  const getPageUrl = (page) => {
    if (!page?.slug) {
      return "#";
    }

    return `/website/${page.slug}`;
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async () => {
    if (!deleteTarget?.id) {
      return;
    }

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      await apiFetch(
        `/api/v1/cms/halaman/${deleteTarget.id}`,
        {
          method: "DELETE",
        }
      );

      setPages((currentPages) =>
        currentPages.filter(
          (page) => page.id !== deleteTarget.id
        )
      );

      setSuccess(
        `Halaman "${getPageTitle(deleteTarget)}" berhasil dihapus.`
      );

      setDeleteTarget(null);

      setTimeout(() => {
        setSuccess("");
      }, 4000);
    } catch (err) {
      console.error("Gagal menghapus halaman:", err);

      setError(
        err?.message || "Gagal menghapus halaman."
      );
    } finally {
      setDeleting(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-screen w-full bg-[#f8fafc]">
        <Sidebar
          active={active}
          setActive={setActive}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            title="Halaman Statis"
            user={{
              name: "CMS Admin",
              email: "cms@smartschool.com",
              avatar: "CA",
            }}
          />

          <main className="flex flex-1 items-center justify-center p-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>

              <h2 className="text-sm font-bold text-slate-800">
                Memuat halaman...
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Mengambil data halaman dari server.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN
  // ============================================================

  return (
    <div className="flex min-h-screen w-full bg-[#f8fafc]">
      {/* ========================================================
          SIDEBAR
      ======================================================== */}

      <Sidebar
        active={active}
        setActive={setActive}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* ========================================================
          MAIN AREA
      ======================================================== */}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* ======================================================
            HEADER
        ====================================================== */}

        <Header
          title="Halaman Statis"
          user={{
            name: "CMS Admin",
            email: "cms@smartschool.com",
            avatar: "CA",
          }}
        />

        {/* ======================================================
            CONTENT
        ====================================================== */}

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="w-full min-w-0 px-3 py-4 sm:px-5 sm:py-6 md:px-7 lg:px-9 xl:px-10">
            <div className="mx-auto w-full max-w-[1700px]">

              {/* ==================================================
                  TOP BAR
              ================================================== */}

              <div className="mb-6 flex flex-col gap-4 lg:mb-7 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50">
                      <LayoutTemplate className="h-5 w-5 text-blue-600" />
                    </div>

                    <div className="min-w-0">
                      <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Halaman Statis
                      </h1>

                      <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                        Kelola halaman informasi website sekolah.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex w-full gap-2 sm:w-auto">
                  <button
                    type="button"
                    onClick={() => fetchPages(true)}
                    disabled={refreshing}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${
                        refreshing ? "animate-spin" : ""
                      }`}
                    />

                    <span className="hidden sm:inline">
                      Refresh
                    </span>
                  </button>

                  <Link
                    href="/cmsAdmin/pages/tambah"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1d4ed8] hover:shadow-xl sm:flex-none"
                  >
                    <Plus className="h-4 w-4" />
                    Buat Halaman
                  </Link>
                </div>
              </div>

              {/* ==================================================
                  SUCCESS
              ================================================== */}

              {success && (
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-emerald-800">
                      Berhasil
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-emerald-600">
                      {success}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSuccess("")}
                    className="text-emerald-400 transition hover:text-emerald-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* ==================================================
                  ERROR
              ================================================== */}

              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-red-800">
                      Terjadi kesalahan
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-red-600">
                      {error}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setError("")}
                    className="text-red-400 transition hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* ==================================================
                  HERO
              ================================================== */}

              <section className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f172a] via-[#172554] to-[#081b4f] p-5 shadow-xl shadow-slate-300/30 sm:p-6 lg:p-7">
                <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />

                <div className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

                <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0 max-w-2xl">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-medium text-blue-100">
                      <Globe2 className="h-3.5 w-3.5" />

                      Website Content
                    </div>

                    <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                      Kelola halaman website sekolah
                    </h2>

                    <p className="mt-2 max-w-xl text-xs leading-6 text-slate-300 sm:text-sm">
                      Buat dan kelola halaman seperti Tentang
                      Sekolah, Akademik, Kontak, Profil Sekolah,
                      dan halaman informasi lainnya.
                    </p>
                  </div>

                  {/* STATS */}

                  <div className="grid w-full grid-cols-3 gap-2 sm:max-w-lg sm:gap-3">

                    {/* TOTAL */}

                    <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-3 backdrop-blur-md sm:p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[9px] font-medium uppercase tracking-wider text-slate-400 sm:text-[10px]">
                          Total
                        </span>

                        <File className="hidden h-4 w-4 text-blue-300 sm:block" />
                      </div>

                      <p className="text-xl font-bold text-white sm:text-2xl">
                        {totalPages}
                      </p>

                      <p className="mt-1 text-[9px] text-slate-400 sm:text-[11px]">
                        halaman
                      </p>
                    </div>

                    {/* PUBLISH */}

                    <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-3 backdrop-blur-md sm:p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[9px] font-medium uppercase tracking-wider text-slate-400 sm:text-[10px]">
                          Publish
                        </span>

                        <CheckCircle2 className="hidden h-4 w-4 text-emerald-300 sm:block" />
                      </div>

                      <p className="text-xl font-bold text-white sm:text-2xl">
                        {publishedCount}
                      </p>

                      <p className="mt-1 text-[9px] text-slate-400 sm:text-[11px]">
                        aktif
                      </p>
                    </div>

                    {/* DRAFT */}

                    <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-3 backdrop-blur-md sm:p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[9px] font-medium uppercase tracking-wider text-slate-400 sm:text-[10px]">
                          Draft
                        </span>

                        <FileText className="hidden h-4 w-4 text-amber-300 sm:block" />
                      </div>

                      <p className="text-xl font-bold text-white sm:text-2xl">
                        {draftCount}
                      </p>

                      <p className="mt-1 text-[9px] text-slate-400 sm:text-[11px]">
                        belum publish
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* ==================================================
                  CONTENT HEADER
              ================================================== */}

              <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-800">
                    Daftar Halaman
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Data berikut diambil langsung dari CMS backend.
                  </p>
                </div>

                {/* SEARCH */}

                <div className="relative w-full xl:w-[360px]">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    placeholder="Cari judul, slug, status..."
                    value={searchQuery}
                    onChange={(e) =>
                      setSearchQuery(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm text-slate-700 outline-none shadow-sm transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                  />

                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* ==================================================
                  TABLE
              ================================================== */}

              <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                      <File className="h-4 w-4 text-blue-600" />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-800">
                        Semua Halaman
                      </h3>

                      <p className="text-[11px] text-slate-400">
                        {filteredPages.length} halaman ditemukan
                      </p>
                    </div>
                  </div>

                  <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />

                    Terhubung Backend
                  </div>
                </div>

                {filteredPages.length > 0 ? (
                  <>
                    {/* ==================================================
                        DESKTOP
                    ================================================== */}

                    <div className="hidden w-full overflow-x-auto md:block">
                      <table className="w-full min-w-[900px] border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50/70">
                            <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Halaman
                            </th>

                            <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              URL / Slug
                            </th>

                            <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Status
                            </th>

                            <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Tipe
                            </th>

                            <th className="px-6 py-3.5 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Aksi
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                          {filteredPages.map((page) => {
                            const statusStyle =
                              getStatusStyle(page?.status);

                            return (
                              <tr
                                key={page.id}
                                className="group transition-colors hover:bg-blue-50/30"
                              >
                                {/* PAGE */}

                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                                      <File className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0">
                                      <p className="max-w-[280px] truncate text-sm font-semibold text-slate-800">
                                        {getPageTitle(page)}
                                      </p>

                                      <p className="mt-0.5 text-[11px] text-slate-400">
                                        Halaman statis
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                {/* SLUG */}

                                <td className="px-6 py-4">
                                  <div className="inline-flex max-w-[300px] items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5">
                                    <Globe2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />

                                    <span className="truncate text-xs text-slate-500">
                                      /{getPageSlug(page)}
                                    </span>
                                  </div>
                                </td>

                                {/* STATUS */}

                                <td className="px-6 py-4">
                                  <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-semibold ${statusStyle.wrapper}`}
                                  >
                                    <span
                                      className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                                    />

                                    {getStatusLabel(
                                      page?.status
                                    )}
                                  </span>
                                </td>

                                {/* TYPE */}

                                <td className="px-6 py-4">
                                  <span className="text-xs font-medium text-slate-500">
                                    Static Page
                                  </span>
                                </td>

                                {/* ACTION */}

                                <td className="px-6 py-4">
                                  <div className="flex items-center justify-end gap-1">

                                    {/* DETAIL */}

                                    <Link
                                      href={`/cmsAdmin/pages/${page.id}`}
                                      title="Lihat detail"
                                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Link>

                                    {/* EDIT */}

                                    <Link
                                      href={`/cmsAdmin/pages/${page.id}/edit`}
                                      title="Edit"
                                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Link>

                                    {/* DELETE */}

                                    <button
                                      type="button"
                                      title="Hapus"
                                      onClick={() =>
                                        setDeleteTarget(page)
                                      }
                                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>

                                    {/* MENU */}

                                    <button
                                      type="button"
                                      title="Menu"
                                      onClick={() =>
                                        setSelectedPage(page)
                                      }
                                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* ==================================================
                        MOBILE
                    ================================================== */}

                    <div className="divide-y divide-slate-100 md:hidden">
                      {filteredPages.map((page) => {
                        const statusStyle =
                          getStatusStyle(page?.status);

                        return (
                          <div
                            key={page.id}
                            className="p-4"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                                <File className="h-4 w-4" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-col gap-2">
                                  <div className="min-w-0">
                                    <h3 className="truncate text-sm font-bold text-slate-800">
                                      {getPageTitle(page)}
                                    </h3>

                                    <p className="mt-0.5 truncate text-[11px] text-slate-400">
                                      /{getPageSlug(page)}
                                    </p>
                                  </div>

                                  <span
                                    className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-semibold ${statusStyle.wrapper}`}
                                  >
                                    <span
                                      className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                                    />

                                    {getStatusLabel(
                                      page?.status
                                    )}
                                  </span>
                                </div>

                                <div className="mt-4 flex items-center justify-between">
                                  <span className="text-[11px] text-slate-400">
                                    Static Page
                                  </span>

                                  <div className="flex items-center gap-1">

                                    {/* DETAIL */}

                                    <Link
                                      href={`/cmsAdmin/pages/${page.id}`}
                                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Link>

                                    {/* EDIT */}

                                    <Link
                                      href={`/cmsAdmin/pages/${page.id}/edit`}
                                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Link>

                                    {/* DELETE */}

                                    <button
                                      type="button"
                                      onClick={() =>
                                        setDeleteTarget(page)
                                      }
                                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  /* ==================================================
                     EMPTY
                  ================================================== */

                  <div className="px-6 py-16 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                        <File className="h-6 w-6 text-slate-400" />
                      </div>

                      <h3 className="text-sm font-bold text-slate-700">
                        {searchQuery
                          ? "Halaman tidak ditemukan"
                          : "Belum ada halaman"}
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        {searchQuery
                          ? "Coba gunakan kata kunci pencarian yang berbeda."
                          : "Belum ada halaman statis yang dibuat melalui CMS."}
                      </p>

                      {!searchQuery && (
                        <Link
                          href="/cmsAdmin/pages/tambah"
                          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                        >
                          <Plus className="h-3.5 w-3.5" />

                          Buat Halaman
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                {/* ==================================================
                    FOOTER TABLE
                ================================================== */}

                <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <p className="text-xs text-slate-400">
                    Menampilkan{" "}
                    <span className="font-semibold text-slate-600">
                      {filteredPages.length}
                    </span>{" "}
                    dari{" "}
                    <span className="font-semibold text-slate-600">
                      {totalPages}
                    </span>{" "}
                    halaman
                  </p>

                  <Link
                    href="/cmsAdmin/pages/tambah"
                    className="inline-flex w-fit items-center gap-2 text-xs font-semibold text-blue-600 transition hover:text-blue-700"
                  >
                    <Plus className="h-3.5 w-3.5" />

                    Tambah halaman baru

                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </section>

              {/* ==================================================
                  INFO CARDS
              ================================================== */}

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

                {/* CARD 1 */}

                <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <LayoutTemplate className="h-4 w-4" />
                  </div>

                  <h3 className="text-sm font-bold text-slate-800">
                    Halaman Statis
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Cocok digunakan untuk Tentang Sekolah,
                    Akademik, Kontak, Profil, dan informasi
                    lainnya.
                  </p>
                </div>

                {/* CARD 2 */}

                <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-5">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                    <Globe2 className="h-4 w-4" />
                  </div>

                  <h3 className="text-sm font-bold text-slate-800">
                    Slug Otomatis
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Slug halaman berasal dari backend CMS sehingga
                    frontend tidak perlu membuat slug sendiri.
                  </p>
                </div>

                {/* CARD 3 */}

                <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>

                  <h3 className="text-sm font-bold text-slate-800">
                    Terhubung Backend
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Data halaman diambil langsung dari API CMS
                    sekolah yang sedang login.
                  </p>
                </div>
              </div>

              {/* ==================================================
                  FOOTER
              ================================================== */}

              <footer className="py-7 text-center">
                <p className="text-[11px] text-slate-400">
                  © 2026 SmartSchool • CMS Management
                </p>
              </footer>
            </div>
          </div>
        </main>
      </div>

      {/* ========================================================
          PREVIEW MODAL
      ======================================================== */}

      {selectedPage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Eye className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-800">
                    Preview Halaman
                  </h3>

                  <p className="truncate text-[11px] text-slate-400">
                    {getPageTitle(selectedPage)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPage(null)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* CONTENT */}

            <div className="max-h-[65vh] overflow-y-auto p-5 sm:p-6">

              {/* TITLE */}

              <div className="mb-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Judul
                </p>

                <h4 className="mt-1 text-xl font-bold text-slate-900">
                  {getPageTitle(selectedPage)}
                </h4>
              </div>

              {/* SLUG */}

              <div className="mb-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Slug
                </p>

                <div className="mt-2 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-3">
                  <Globe2 className="h-4 w-4 shrink-0 text-blue-500" />

                  <span className="break-all text-sm text-slate-600">
                    /{getPageSlug(selectedPage)}
                  </span>
                </div>
              </div>

              {/* STATUS */}

              <div className="mb-5">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Status
                </p>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    getStatusStyle(
                      selectedPage?.status
                    ).wrapper
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      getStatusStyle(
                        selectedPage?.status
                      ).dot
                    }`}
                  />

                  {getStatusLabel(
                    selectedPage?.status
                  )}
                </span>
              </div>

              {/* CONTENT */}

              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Konten
                </p>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  {selectedPage?.konten ? (
                    <div
                      className="
                        text-sm leading-7 text-slate-600
                        [&_p]:mb-4
                        [&_h1]:mb-4
                        [&_h1]:text-2xl
                        [&_h1]:font-bold
                        [&_h1]:text-slate-900
                        [&_h2]:mb-3
                        [&_h2]:text-xl
                        [&_h2]:font-bold
                        [&_h2]:text-slate-900
                        [&_h3]:mb-2
                        [&_h3]:text-lg
                        [&_h3]:font-bold
                        [&_h3]:text-slate-900
                        [&_ul]:mb-4
                        [&_ul]:list-disc
                        [&_ul]:pl-6
                        [&_ol]:mb-4
                        [&_ol]:list-decimal
                        [&_ol]:pl-6
                        [&_li]:mb-1
                        [&_strong]:font-bold
                        [&_a]:text-blue-600
                        [&_a]:underline
                        [&_img]:my-4
                        [&_img]:max-w-full
                        [&_img]:rounded-xl
                      "
                      dangerouslySetInnerHTML={{
                        __html: selectedPage.konten,
                      }}
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <FileText className="h-4 w-4" />

                      Belum ada konten.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* FOOTER */}

            <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/50 p-4 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() => setSelectedPage(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Tutup
              </button>

              {selectedPage?.slug && (
                <Link
                  href={getPageUrl(selectedPage)}
                  target="_blank"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  <ExternalLink className="h-4 w-4" />

                  Buka Website
                </Link>
              )}

              <Link
                href={`/cmsAdmin/pages/${selectedPage.id}/edit`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <Pencil className="h-4 w-4" />

                Edit Halaman
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          DELETE MODAL
      ======================================================== */}

      {deleteTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">

            <div className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-900">
                Hapus halaman?
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Kamu akan menghapus halaman{" "}
                <span className="font-semibold text-slate-700">
                  "{getPageTitle(deleteTarget)}"
                </span>
                .
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-400">
                Data akan dihapus melalui endpoint CMS backend.
              </p>
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/50 p-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Hapus Halaman
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