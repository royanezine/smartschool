"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";
import { apiFetch } from "../../../../../lib/api";

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

      const result = await apiFetch("/api/cms/halaman");

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
        wrapper: "theme-success border",
        dot: "bg-[var(--color-success)]",
      };
    }

    if (value === "draft") {
      return {
        wrapper: "theme-warning border",
        dot: "bg-[var(--color-warning)]",
      };
    }

    return {
      wrapper: "theme-card-soft theme-text-secondary border",
      dot: "bg-[var(--color-text-muted)]",
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
        `/api/cms/halaman/${deleteTarget.id}`,
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
      <div className="theme-page flex min-h-screen w-full">
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

          <main className="theme-page flex flex-1 items-center justify-center p-6">
            <div className="flex flex-col items-center text-center">
              <div className="theme-info mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border">
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

  // ============================================================
  // MAIN
  // ============================================================

  return (
    <div className="theme-page flex min-h-screen w-full">
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

        <main className="theme-page min-w-0 flex-1 overflow-y-auto">
          <div className="w-full min-w-0 px-3 py-4 sm:px-5 sm:py-6 md:px-7 lg:px-9 xl:px-10">
            <div className="mx-auto w-full max-w-[1700px]">

              {/* ==================================================
                  TOP BAR
              ================================================== */}

              <div className="mb-6 flex flex-col gap-4 lg:mb-7 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="theme-info flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border">
                      <LayoutTemplate className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <h1 className="theme-text truncate text-2xl font-bold tracking-tight sm:text-3xl">
                        Halaman Statis
                      </h1>

                      <p className="theme-text-secondary mt-0.5 text-xs sm:text-sm">
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
                    className="
                      theme-card theme-border theme-text-secondary
                      inline-flex h-11 items-center justify-center gap-2
                      rounded-xl border px-4 text-sm font-semibold shadow-sm
                      transition
                      hover:bg-[var(--color-header-hover)]
                      hover:text-[var(--color-primary)]
                      disabled:cursor-not-allowed disabled:opacity-60
                    "
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
                    className="theme-primary inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-lg transition-all duration-200 hover:-translate-y-0.5 sm:flex-none"
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
                <div className="theme-success mb-5 flex items-start gap-3 rounded-2xl border p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-success)_15%,transparent)]">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold">
                      Berhasil
                    </h3>

                    <p className="mt-1 text-xs leading-5 opacity-90">
                      {success}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSuccess("")}
                    className="opacity-60 transition hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* ==================================================
                  ERROR
              ================================================== */}

              {error && (
                <div className="theme-danger mb-5 flex items-start gap-3 rounded-2xl border p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-danger)_15%,transparent)]">
                    <AlertCircle className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold">
                      Terjadi kesalahan
                    </h3>

                    <p className="mt-1 text-xs leading-5 opacity-90">
                      {error}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setError("")}
                    className="opacity-60 transition hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* ==================================================
                  HERO
              ================================================== */}

              <section
                className="
                  relative mb-6 overflow-hidden rounded-3xl p-5
                  shadow-xl sm:p-6 lg:p-7
                "
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-card-soft), var(--color-sidebar-active))",
                }}
              >
                <div
                  className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full blur-3xl"
                  style={{
                    background:
                      "color-mix(in srgb, var(--color-primary) 15%, transparent)",
                  }}
                />

                <div
                  className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full blur-3xl"
                  style={{
                    background:
                      "color-mix(in srgb, var(--color-info) 10%, transparent)",
                  }}
                />

                <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0 max-w-2xl">
                    <div className="theme-info mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium">
                      <Globe2 className="h-3.5 w-3.5" />

                      Website Content
                    </div>

                    <h2 className="theme-text text-xl font-bold tracking-tight sm:text-2xl">
                      Kelola halaman website sekolah
                    </h2>

                    <p className="theme-text-secondary mt-2 max-w-xl text-xs leading-6 sm:text-sm">
                      Buat dan kelola halaman seperti Tentang
                      Sekolah, Akademik, Kontak, Profil Sekolah,
                      dan halaman informasi lainnya.
                    </p>
                  </div>

                  {/* STATS */}

                  <div className="grid w-full grid-cols-3 gap-2 sm:max-w-lg sm:gap-3">

                    {/* TOTAL */}

                    <div className="theme-card rounded-2xl border p-3 shadow-sm sm:p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="theme-text-muted text-[9px] font-medium uppercase tracking-wider sm:text-[10px]">
                          Total
                        </span>

                        <File className="hidden h-4 w-4 text-[var(--color-primary)] sm:block" />
                      </div>

                      <p className="theme-text text-xl font-bold sm:text-2xl">
                        {totalPages}
                      </p>

                      <p className="theme-text-muted mt-1 text-[9px] sm:text-[11px]">
                        halaman
                      </p>
                    </div>

                    {/* PUBLISH */}

                    <div className="theme-card rounded-2xl border p-3 shadow-sm sm:p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="theme-text-muted text-[9px] font-medium uppercase tracking-wider sm:text-[10px]">
                          Publish
                        </span>

                        <CheckCircle2 className="hidden h-4 w-4 text-[var(--color-success)] sm:block" />
                      </div>

                      <p className="theme-text text-xl font-bold sm:text-2xl">
                        {publishedCount}
                      </p>

                      <p className="theme-text-muted mt-1 text-[9px] sm:text-[11px]">
                        aktif
                      </p>
                    </div>

                    {/* DRAFT */}

                    <div className="theme-card rounded-2xl border p-3 shadow-sm sm:p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="theme-text-muted text-[9px] font-medium uppercase tracking-wider sm:text-[10px]">
                          Draft
                        </span>

                        <FileText className="hidden h-4 w-4 text-[var(--color-warning)] sm:block" />
                      </div>

                      <p className="theme-text text-xl font-bold sm:text-2xl">
                        {draftCount}
                      </p>

                      <p className="theme-text-muted mt-1 text-[9px] sm:text-[11px]">
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
                  <h2 className="theme-text text-base font-bold">
                    Daftar Halaman
                  </h2>

                  <p className="theme-text-secondary mt-0.5 text-xs">
                    Data berikut diambil langsung dari CMS backend.
                  </p>
                </div>

                {/* SEARCH */}

                <div className="relative w-full xl:w-[360px]">
                  <Search className="theme-text-muted absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2" />

                  <input
                    type="text"
                    placeholder="Cari judul, slug, status..."
                    value={searchQuery}
                    onChange={(e) =>
                      setSearchQuery(e.target.value)
                    }
                    className="theme-input w-full rounded-xl border py-3 pl-10 pr-10 text-sm outline-none shadow-sm transition focus:border-[var(--color-primary)]"
                  />

                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="theme-text-muted absolute right-3 top-1/2 -translate-y-1/2 transition hover:text-[var(--color-text)]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* ==================================================
                  TABLE
              ================================================== */}

              <section className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">
                <div className="theme-card-soft theme-border flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="theme-info flex h-9 w-9 items-center justify-center rounded-xl border">
                      <File className="h-4 w-4" />
                    </div>

                    <div>
                      <h3 className="theme-text text-sm font-bold">
                        Semua Halaman
                      </h3>

                      <p className="theme-text-muted text-[11px]">
                        {filteredPages.length} halaman ditemukan
                      </p>
                    </div>
                  </div>

                  <div className="theme-success inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold">
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
                          <tr className="theme-table-header border-b">
                            <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider">
                              Halaman
                            </th>

                            <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider">
                              URL / Slug
                            </th>

                            <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider">
                              Status
                            </th>

                            <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider">
                              Tipe
                            </th>

                            <th className="px-6 py-3.5 text-right text-[10px] font-bold uppercase tracking-wider">
                              Aksi
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {filteredPages.map((page) => {
                            const statusStyle =
                              getStatusStyle(page?.status);

                            return (
                              <tr
                                key={page.id}
                                className="theme-table-hover theme-border-soft border-b transition-colors"
                              >
                                {/* PAGE */}

                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="theme-info flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border">
                                      <File className="h-4 w-4" />
                                    </div>

                                    <div className="min-w-0">
                                      <p className="theme-text max-w-[280px] truncate text-sm font-semibold">
                                        {getPageTitle(page)}
                                      </p>

                                      <p className="theme-text-muted mt-0.5 text-[11px]">
                                        Halaman statis
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                {/* SLUG */}

                                <td className="px-6 py-4">
                                  <div className="theme-card-soft inline-flex max-w-[300px] items-center gap-1.5 rounded-lg border px-2.5 py-1.5">
                                    <Globe2 className="theme-text-muted h-3.5 w-3.5 shrink-0" />

                                    <span className="theme-text-secondary truncate text-xs">
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
                                  <span className="theme-text-secondary text-xs font-medium">
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
                                      className="theme-text-muted flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-[var(--color-sidebar-active)] hover:text-[var(--color-primary)]"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Link>

                                    {/* EDIT */}

                                    <Link
                                      href={`/cmsAdmin/pages/${page.id}/edit`}
                                      title="Edit"
                                      className="theme-text-muted flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-[var(--color-sidebar-active)] hover:text-[var(--color-primary)]"
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
                                      className="theme-text-muted flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-[var(--color-danger-background)] hover:text-[var(--color-danger)]"
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
                                      className="theme-text-muted flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-[var(--color-header-hover)] hover:text-[var(--color-text)]"
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

                    <div className="theme-border-soft divide-y md:hidden">
                      {filteredPages.map((page) => {
                        const statusStyle =
                          getStatusStyle(page?.status);

                        return (
                          <div
                            key={page.id}
                            className="p-4"
                          >
                            <div className="flex items-start gap-3">
                              <div className="theme-info flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border">
                                <File className="h-4 w-4" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-col gap-2">
                                  <div className="min-w-0">
                                    <h3 className="theme-text truncate text-sm font-bold">
                                      {getPageTitle(page)}
                                    </h3>

                                    <p className="theme-text-muted mt-0.5 truncate text-[11px]">
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
                                  <span className="theme-text-muted text-[11px]">
                                    Static Page
                                  </span>

                                  <div className="flex items-center gap-1">

                                    {/* DETAIL */}

                                    <Link
                                      href={`/cmsAdmin/pages/${page.id}`}
                                      className="theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-[var(--color-sidebar-active)] hover:text-[var(--color-primary)]"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Link>

                                    {/* EDIT */}

                                    <Link
                                      href={`/cmsAdmin/pages/${page.id}/edit`}
                                      className="theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-[var(--color-sidebar-active)] hover:text-[var(--color-primary)]"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Link>

                                    {/* DELETE */}

                                    <button
                                      type="button"
                                      onClick={() =>
                                        setDeleteTarget(page)
                                      }
                                      className="theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-[var(--color-danger-background)] hover:text-[var(--color-danger)]"
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
                      <div className="theme-card-soft theme-text-muted mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border">
                        <File className="h-6 w-6" />
                      </div>

                      <h3 className="theme-text-secondary text-sm font-bold">
                        {searchQuery
                          ? "Halaman tidak ditemukan"
                          : "Belum ada halaman"}
                      </h3>

                      <p className="theme-text-muted mt-1 text-xs leading-5">
                        {searchQuery
                          ? "Coba gunakan kata kunci pencarian yang berbeda."
                          : "Belum ada halaman statis yang dibuat melalui CMS."}
                      </p>

                      {!searchQuery && (
                        <Link
                          href="/cmsAdmin/pages/tambah"
                          className="theme-primary mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition"
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

                <div className="theme-card-soft theme-border flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <p className="theme-text-muted text-xs">
                    Menampilkan{" "}
                    <span className="theme-text-secondary font-semibold">
                      {filteredPages.length}
                    </span>{" "}
                    dari{" "}
                    <span className="theme-text-secondary font-semibold">
                      {totalPages}
                    </span>{" "}
                    halaman
                  </p>

                  <Link
                    href="/cmsAdmin/pages/tambah"
                    className="inline-flex w-fit items-center gap-2 text-xs font-semibold text-[var(--color-primary)] transition hover:text-[var(--color-primary-hover)]"
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

                <div className="theme-card theme-border rounded-2xl border p-5">
                  <div className="theme-info mb-3 flex h-9 w-9 items-center justify-center rounded-xl border">
                    <LayoutTemplate className="h-4 w-4" />
                  </div>

                  <h3 className="theme-text text-sm font-bold">
                    Halaman Statis
                  </h3>

                  <p className="theme-text-secondary mt-1 text-xs leading-5">
                    Cocok digunakan untuk Tentang Sekolah,
                    Akademik, Kontak, Profil, dan informasi
                    lainnya.
                  </p>
                </div>

                {/* CARD 2 */}

                <div className="theme-card theme-border rounded-2xl border p-5">
                  <div className="theme-info mb-3 flex h-9 w-9 items-center justify-center rounded-xl border">
                    <Globe2 className="h-4 w-4" />
                  </div>

                  <h3 className="theme-text text-sm font-bold">
                    Slug Otomatis
                  </h3>

                  <p className="theme-text-secondary mt-1 text-xs leading-5">
                    Slug halaman berasal dari backend CMS sehingga
                    frontend tidak perlu membuat slug sendiri.
                  </p>
                </div>

                {/* CARD 3 */}

                <div className="theme-card theme-border rounded-2xl border p-5">
                  <div className="theme-success mb-3 flex h-9 w-9 items-center justify-center rounded-xl border">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>

                  <h3 className="theme-text text-sm font-bold">
                    Terhubung Backend
                  </h3>

                  <p className="theme-text-secondary mt-1 text-xs leading-5">
                    Data halaman diambil langsung dari API CMS
                    sekolah yang sedang login.
                  </p>
                </div>
              </div>

              {/* ==================================================
                  FOOTER
              ================================================== */}

              <footer className="py-7 text-center">
                <p className="theme-text-muted text-[11px]">
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
          <div className="theme-card theme-border max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl border shadow-2xl">

            {/* HEADER */}

            <div className="theme-border flex items-center justify-between border-b px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="theme-info flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border">
                  <Eye className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <h3 className="theme-text text-sm font-bold">
                    Preview Halaman
                  </h3>

                  <p className="theme-text-muted truncate text-[11px]">
                    {getPageTitle(selectedPage)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPage(null)}
                className="theme-text-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition hover:bg-[var(--color-header-hover)] hover:text-[var(--color-text)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* CONTENT */}

            <div className="max-h-[65vh] overflow-y-auto p-5 sm:p-6">

              {/* TITLE */}

              <div className="mb-5">
                <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wider">
                  Judul
                </p>

                <h4 className="theme-text mt-1 text-xl font-bold">
                  {getPageTitle(selectedPage)}
                </h4>
              </div>

              {/* SLUG */}

              <div className="mb-5">
                <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wider">
                  Slug
                </p>

                <div className="theme-card-soft theme-border mt-2 flex items-center gap-2 rounded-xl border px-3 py-3">
                  <Globe2 className="h-4 w-4 shrink-0 text-[var(--color-primary)]" />

                  <span className="theme-text-secondary break-all text-sm">
                    /{getPageSlug(selectedPage)}
                  </span>
                </div>
              </div>

              {/* STATUS */}

              <div className="mb-5">
                <p className="theme-text-muted mb-2 text-[10px] font-bold uppercase tracking-wider">
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
                <p className="theme-text-muted mb-2 text-[10px] font-bold uppercase tracking-wider">
                  Konten
                </p>

                <div className="theme-card-soft theme-border rounded-2xl border p-5">
                  {selectedPage?.konten ? (
                    <div
                      className="
                        theme-text-secondary
                        text-sm leading-7

                        [&_p]:mb-4

                        [&_h1]:mb-4
                        [&_h1]:text-2xl
                        [&_h1]:font-bold
                        [&_h1]:text-[var(--color-text)]

                        [&_h2]:mb-3
                        [&_h2]:text-xl
                        [&_h2]:font-bold
                        [&_h2]:text-[var(--color-text)]

                        [&_h3]:mb-2
                        [&_h3]:text-lg
                        [&_h3]:font-bold
                        [&_h3]:text-[var(--color-text)]

                        [&_ul]:mb-4
                        [&_ul]:list-disc
                        [&_ul]:pl-6

                        [&_ol]:mb-4
                        [&_ol]:list-decimal
                        [&_ol]:pl-6

                        [&_li]:mb-1

                        [&_strong]:font-bold
                        [&_strong]:text-[var(--color-text)]

                        [&_a]:text-[var(--color-primary)]
                        [&_a]:underline

                        [&_img]:my-4
                        [&_img]:max-w-full
                        [&_img]:rounded-xl
                        [&_img]:border
                        [&_img]:border-[var(--color-border)]
                      "
                      dangerouslySetInnerHTML={{
                        __html: selectedPage.konten,
                      }}
                    />
                  ) : (
                    <div className="theme-text-muted flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4" />

                      Belum ada konten.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* FOOTER */}

            <div className="theme-card-soft theme-border flex flex-col gap-2 border-t p-4 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() => setSelectedPage(null)}
                className="theme-card theme-border theme-text-secondary rounded-xl border px-4 py-2.5 text-sm font-medium transition hover:bg-[var(--color-header-hover)]"
              >
                Tutup
              </button>

              {selectedPage?.slug && (
                <Link
                  href={getPageUrl(selectedPage)}
                  target="_blank"
                  className="theme-card theme-border theme-text-secondary inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition hover:border-[var(--color-primary)] hover:bg-[var(--color-sidebar-active)] hover:text-[var(--color-primary)]"
                >
                  <ExternalLink className="h-4 w-4" />

                  Buka Website
                </Link>
              )}

              <Link
                href={`/cmsAdmin/pages/${selectedPage.id}/edit`}
                className="theme-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition"
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
          <div className="theme-card theme-border w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl">

            <div className="p-6">
              <div className="theme-danger flex h-12 w-12 items-center justify-center rounded-2xl">
                <Trash2 className="h-5 w-5" />
              </div>

              <h3 className="theme-text mt-4 text-lg font-bold">
                Hapus halaman?
              </h3>

              <p className="theme-text-secondary mt-2 text-sm leading-6">
                Kamu akan menghapus halaman{" "}
                <span className="theme-text font-semibold">
                  "{getPageTitle(deleteTarget)}"
                </span>
                .
              </p>

              <p className="theme-text-muted mt-2 text-xs leading-5">
                Data akan dihapus melalui endpoint CMS backend.
              </p>
            </div>

            <div className="theme-card-soft theme-border flex flex-col gap-2 border-t p-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="theme-card theme-border theme-text-secondary rounded-xl border px-4 py-2.5 text-sm font-medium transition hover:bg-[var(--color-header-hover)] disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-danger)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
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