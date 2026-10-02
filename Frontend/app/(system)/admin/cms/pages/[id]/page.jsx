"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { apiFetch } from "../../../../../../lib/api";

import {
  ArrowLeft,
  Pencil,
  Trash2,
  Eye,
  ExternalLink,
  Globe2,
  FileText,
  LayoutTemplate,
  CheckCircle2,
  Clock3,
  CalendarDays,
  Loader2,
  AlertCircle,
  X,
  RefreshCw,
} from "lucide-react";

export default function PageDetail() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id;

  const [active, setActive] = useState("pages");
  const [collapsed, setCollapsed] = useState(false);

  const [page, setPage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ============================================================
  // FETCH DETAIL
  // ============================================================

  const fetchPage = async (showRefresh = false) => {
    if (!id) return;

    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

     

      const result = await apiFetch("/api/cms/halaman");

      const responseData = result?.data;

      let pages = [];

      if (Array.isArray(responseData)) {
        pages = responseData;
      } else if (Array.isArray(responseData?.data)) {
        pages = responseData.data;
      }

      const foundPage = pages.find(
        (item) => String(item?.id) === String(id)
      );

      if (!foundPage) {
        setPage(null);
        setError("Halaman yang kamu cari tidak ditemukan.");
        return;
      }

      setPage(foundPage);
    } catch (err) {
      console.error("Gagal mengambil detail halaman:", err);

      setError(
        err?.message ||
          "Gagal mengambil detail halaman dari server."
      );

      setPage(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPage();
  }, [id]);

  // ============================================================
  // HELPERS
  // ============================================================

  const getTitle = () => {
    return page?.judul || "Tanpa Judul";
  };

  const getSlug = () => {
    return page?.slug || "-";
  };

  const getStatusLabel = () => {
    const value = String(page?.status || "").toLowerCase();

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

    return page?.status || "-";
  };

  const isPublished = () => {
    const value = String(page?.status || "").toLowerCase();

    return (
      value === "dipublikasikan" ||
      value === "published" ||
      value === "aktif"
    );
  };

  const getStatusStyle = () => {
    if (isPublished()) {
      return {
        wrapper: "theme-success border",
        dot: "bg-[var(--color-success)]",
      };
    }

    const value = String(page?.status || "").toLowerCase();

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

  const formatDate = (date) => {
    if (!date) return "-";

    try {
      return new Date(date).toLocaleDateString(
        "id-ID",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      );
    } catch {
      return "-";
    }
  };

  const formatDateTime = (date) => {
    if (!date) return "-";

    try {
      return new Date(date).toLocaleString(
        "id-ID",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch {
      return "-";
    }
  };

  

  const getWebsiteUrl = () => {
    const slug = String(page?.slug || "").toLowerCase();

    if (!slug) {
      return "/website";
    }

    if (slug.includes("kontak")) {
      return "/website/kontak";
    }

    if (slug.includes("akademik")) {
      return "/website/akademik";
    }

    if (
      slug.includes("tentang") ||
      slug.includes("profil")
    ) {
      return "/website/tentang";
    }

    return `/website/${page.slug}`;
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async () => {
    if (!page?.id) return;

    try {
      setDeleting(true);
      setError("");

      await apiFetch(
        `/api/cms/halaman/${page.id}`,
        {
          method: "DELETE",
        }
      );

      router.push("/cmsAdmin/pages");
    } catch (err) {
      console.error("Gagal menghapus halaman:", err);

      setError(
        err?.message ||
          "Gagal menghapus halaman."
      );

      setDeleteTarget(false);
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
            title="Detail Halaman"
            user={{
              name: "CMS Admin",
              email: "cms@smartschool.com",
              avatar: "CA",
            }}
          />

          <main className="flex flex-1 items-center justify-center p-6">
            <div className="flex flex-col items-center text-center">
              <div className="theme-info mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>

              <h2 className="theme-text text-sm font-bold">
                Memuat detail halaman...
              </h2>

              <p className="theme-text-muted mt-1 text-xs">
                Mengambil data dari CMS backend.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR / NOT FOUND
  // ============================================================

  if (!page) {
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
            title="Detail Halaman"
            user={{
              name: "CMS Admin",
              email: "cms@smartschool.com",
              avatar: "CA",
            }}
          />

          <main className="flex flex-1 items-center justify-center p-6">
            <div className="theme-card theme-border w-full max-w-md rounded-3xl border p-8 text-center shadow-sm">
              <div className="theme-danger mx-auto flex h-14 w-14 items-center justify-center rounded-2xl">
                <AlertCircle className="h-6 w-6" />
              </div>

              <h2 className="theme-text mt-5 text-lg font-bold">
                Halaman tidak ditemukan
              </h2>

              <p className="theme-text-secondary mt-2 text-sm leading-6">
                {error ||
                  "Data halaman tidak tersedia atau sudah dihapus."}
              </p>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => fetchPage(true)}
                  className="theme-card theme-border theme-text-secondary inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition theme-sidebar-hover"
                >
                  <RefreshCw className="h-4 w-4" />
                  Coba Lagi
                </button>

                <Link
                  href="/cmsAdmin/pages"
                  className="theme-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Kembali
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN
  // ============================================================

  const statusStyle = getStatusStyle();

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
          title="Detail Halaman"
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
          <div className="w-full px-3 py-4 sm:px-5 sm:py-6 md:px-7 lg:px-9 xl:px-10">
            <div className="mx-auto w-full max-w-[1500px]">

              {/* ==================================================
                  BREADCRUMB / BACK
              ================================================== */}

              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Link
                  href="/cmsAdmin/pages"
                  className="theme-text-muted inline-flex w-fit items-center gap-2 text-sm font-semibold transition hover:text-[var(--color-primary)]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Kembali ke Halaman
                </Link>

                <button
                  type="button"
                  onClick={() => fetchPage(true)}
                  disabled={refreshing}
                  className="theme-card theme-border theme-text-secondary inline-flex w-fit items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold shadow-sm transition theme-sidebar-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${
                      refreshing ? "animate-spin" : ""
                    }`}
                  />

                  Refresh
                </button>
              </div>

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

                    <p className="mt-1 text-xs leading-5">
                      {error}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setError("")}
                    className="transition hover:opacity-70"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* ==================================================
                  PAGE HEADER
              ================================================== */}

              <section className="theme-card theme-border mb-6 overflow-hidden rounded-3xl border shadow-sm">
                <div className="relative overflow-hidden bg-gradient-to-br from-[var(--color-sidebar)] via-[var(--color-sidebar-active)] to-[var(--color-card-soft)] px-5 py-7 sm:px-7 sm:py-8 lg:px-9">
                  <div
                    className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full blur-3xl"
                    style={{
                      background:
                        "color-mix(in srgb, var(--color-primary) 10%, transparent)",
                    }}
                  />

                  <div
                    className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full blur-3xl"
                    style={{
                      background:
                        "color-mix(in srgb, var(--color-info) 10%, transparent)",
                    }}
                  />

                  <div className="relative">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <span className="theme-primary-outline inline-flex items-center gap-2 rounded-full border bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] px-3 py-1.5 text-[11px] font-semibold">
                        <LayoutTemplate className="h-3.5 w-3.5" />
                        Halaman Statis
                      </span>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold ${statusStyle.wrapper}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                        />

                        {getStatusLabel()}
                      </span>
                    </div>

                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                      <div className="min-w-0">
                        <h1 className="theme-text break-words text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                          {getTitle()}
                        </h1>

                        <div className="theme-text-secondary mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                          <span className="inline-flex items-center gap-1.5">
                            <Globe2 className="h-3.5 w-3.5" />

                            /{getSlug()}
                          </span>

                          <span className="theme-text-muted hidden h-1 w-1 rounded-full sm:block" />

                          <span className="inline-flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5" />

                            Static Page
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
                        <Link
                          href={getWebsiteUrl()}
                          target="_blank"
                          className="theme-card theme-border theme-text-secondary inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-sm transition theme-sidebar-hover"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Buka Website
                        </Link>

                        <Link
                          href={`/cmsAdmin/pages/${page.id}/edit`}
                          className="theme-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-lg transition"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit Halaman
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ==================================================
                    META
                ================================================== */}

                <div className="theme-card grid grid-cols-1 divide-y divide-[var(--color-border-soft)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                  <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
                    <div className="theme-info flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                      <CalendarDays className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wider">
                        Dibuat
                      </p>

                      <p className="theme-text-secondary mt-0.5 text-xs font-semibold">
                        {formatDate(page?.dibuatPada)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
                    <div className="theme-card-soft theme-text-secondary flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                      <Clock3 className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wider">
                        Diperbarui
                      </p>

                      <p className="theme-text-secondary mt-0.5 text-xs font-semibold">
                        {formatDate(page?.diubahPada)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
                    <div className="theme-success flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wider">
                        Status
                      </p>

                      <p className="theme-text-secondary mt-0.5 text-xs font-semibold">
                        {getStatusLabel()}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* ==================================================
                  MAIN GRID
              ================================================== */}

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">

                {/* ==================================================
                    CONTENT
                ================================================== */}

                <section className="theme-card theme-border min-w-0 overflow-hidden rounded-2xl border shadow-sm">
                  <div className="theme-border flex items-center justify-between border-b px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="theme-info flex h-9 w-9 items-center justify-center rounded-xl">
                        <FileText className="h-4 w-4" />
                      </div>

                      <div>
                        <h2 className="theme-text text-sm font-bold">
                          Konten Halaman
                        </h2>

                        <p className="theme-text-muted text-[11px]">
                          Isi halaman yang tersimpan di CMS
                        </p>
                      </div>
                    </div>

                    <span className="theme-text-muted hidden text-[10px] font-semibold uppercase tracking-wider sm:block">
                      CMS Content
                    </span>
                  </div>

                  <div className="p-5 sm:p-7 lg:p-8">
                    {page?.konten ? (
                      <article
                        className="
                          cms-content
                          theme-text-secondary
                          max-w-none
                          text-[15px]
                          leading-8

                          [&_p]:mb-5

                          [&_h1]:mb-5
                          [&_h1]:mt-8
                          [&_h1]:text-3xl
                          [&_h1]:font-bold
                          [&_h1]:leading-tight
                          [&_h1]:text-[var(--color-text)]

                          [&_h2]:mb-4
                          [&_h2]:mt-8
                          [&_h2]:text-2xl
                          [&_h2]:font-bold
                          [&_h2]:leading-tight
                          [&_h2]:text-[var(--color-text)]

                          [&_h3]:mb-3
                          [&_h3]:mt-6
                          [&_h3]:text-xl
                          [&_h3]:font-bold
                          [&_h3]:text-[var(--color-text)]

                          [&_h4]:mb-2
                          [&_h4]:mt-5
                          [&_h4]:text-lg
                          [&_h4]:font-bold
                          [&_h4]:text-[var(--color-text)]

                          [&_ul]:mb-5
                          [&_ul]:list-disc
                          [&_ul]:space-y-2
                          [&_ul]:pl-6

                          [&_ol]:mb-5
                          [&_ol]:list-decimal
                          [&_ol]:space-y-2
                          [&_ol]:pl-6

                          [&_li]:pl-1

                          [&_a]:font-semibold
                          [&_a]:text-[var(--color-primary)]
                          [&_a]:underline
                          [&_a]:underline-offset-2
                          [&_a]:hover:text-[var(--color-primary-hover)]

                          [&_strong]:font-bold
                          [&_strong]:text-[var(--color-text)]

                          [&_blockquote]:my-6
                          [&_blockquote]:border-l-4
                          [&_blockquote]:border-[var(--color-primary)]
                          [&_blockquote]:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]
                          [&_blockquote]:px-5
                          [&_blockquote]:py-4
                          [&_blockquote]:text-[var(--color-text-secondary)]

                          [&_img]:my-6
                          [&_img]:h-auto
                          [&_img]:max-w-full
                          [&_img]:rounded-2xl
                          [&_img]:border
                          [&_img]:border-[var(--color-border)]

                          [&_table]:my-6
                          [&_table]:w-full
                          [&_table]:border-collapse

                          [&_th]:border
                          [&_th]:border-[var(--color-border)]
                          [&_th]:bg-[var(--color-table-header)]
                          [&_th]:px-4
                          [&_th]:py-3
                          [&_th]:text-left
                          [&_th]:font-semibold

                          [&_td]:border
                          [&_td]:border-[var(--color-border)]
                          [&_td]:px-4
                          [&_td]:py-3
                        "
                        dangerouslySetInnerHTML={{
                          __html: page.konten,
                        }}
                      />
                    ) : (
                      <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                        <div className="theme-card-soft flex h-14 w-14 items-center justify-center rounded-2xl">
                          <FileText className="theme-text-muted h-6 w-6" />
                        </div>

                        <h3 className="theme-text-secondary mt-4 text-sm font-bold">
                          Belum ada konten
                        </h3>

                        <p className="theme-text-muted mt-1 max-w-sm text-xs leading-5">
                          Halaman ini belum memiliki isi.
                          Silakan edit halaman untuk menambahkan
                          konten.
                        </p>

                        <Link
                          href={`/cmsAdmin/pages/${page.id}/edit`}
                          className="theme-primary mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Tambahkan Konten
                        </Link>
                      </div>
                    )}
                  </div>
                </section>

                {/* ==================================================
                    SIDEBAR DETAIL
                ================================================== */}

                <aside className="space-y-5">

                  {/* STATUS CARD */}

                  <section className="theme-card theme-border rounded-2xl border p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="theme-info flex h-9 w-9 items-center justify-center rounded-xl">
                        <Eye className="h-4 w-4" />
                      </div>

                      <div>
                        <h3 className="theme-text text-sm font-bold">
                          Status Publikasi
                        </h3>

                        <p className="theme-text-muted text-[11px]">
                          Status halaman saat ini
                        </p>
                      </div>
                    </div>

                    <div className="mt-5">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold ${statusStyle.wrapper}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                        />

                        {getStatusLabel()}
                      </span>
                    </div>

                    <div className="theme-border mt-4 border-t pt-4">
                      <p className="theme-text-secondary text-xs leading-5">
                        {isPublished()
                          ? "Halaman ini dapat ditampilkan pada website sekolah."
                          : "Halaman masih dalam status draft dan belum dipublikasikan."}
                      </p>
                    </div>
                  </section>

                  {/* URL CARD */}

                  <section className="theme-card theme-border rounded-2xl border p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="theme-info flex h-9 w-9 items-center justify-center rounded-xl">
                        <Globe2 className="h-4 w-4" />
                      </div>

                      <div>
                        <h3 className="theme-text text-sm font-bold">
                          URL Halaman
                        </h3>

                        <p className="theme-text-muted text-[11px]">
                          Slug dari backend CMS
                        </p>
                      </div>
                    </div>

                    <div className="theme-card-soft mt-4 rounded-xl p-3">
                      <p className="theme-text-secondary break-all text-xs leading-5">
                        /{getSlug()}
                      </p>
                    </div>

                    <Link
                      href={getWebsiteUrl()}
                      target="_blank"
                      className="theme-card theme-border theme-text-secondary mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition theme-sidebar-hover"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Lihat di Website
                    </Link>
                  </section>

                  {/* INFORMATION CARD */}

                  <section className="theme-card theme-border rounded-2xl border p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="theme-card-soft theme-text-secondary flex h-9 w-9 items-center justify-center rounded-xl">
                        <CalendarDays className="h-4 w-4" />
                      </div>

                      <div>
                        <h3 className="theme-text text-sm font-bold">
                          Informasi
                        </h3>

                        <p className="theme-text-muted text-[11px]">
                          Metadata halaman
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-4">
                      <div>
                        <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wider">
                          ID
                        </p>

                        <p className="theme-text-secondary mt-1 break-all text-xs font-medium">
                          {page?.id || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wider">
                          Dibuat Pada
                        </p>

                        <p className="theme-text-secondary mt-1 text-xs font-medium">
                          {formatDateTime(page?.dibuatPada)}
                        </p>
                      </div>

                      <div>
                        <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wider">
                          Diubah Pada
                        </p>

                        <p className="theme-text-secondary mt-1 text-xs font-medium">
                          {formatDateTime(page?.diubahPada)}
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* ACTION CARD */}

                  <section className="theme-card theme-border rounded-2xl border p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="theme-danger flex h-9 w-9 items-center justify-center rounded-xl">
                        <Trash2 className="h-4 w-4" />
                      </div>

                      <div>
                        <h3 className="theme-text text-sm font-bold">
                          Zona Tindakan
                        </h3>

                        <p className="theme-text-muted text-[11px]">
                          Tindakan pada halaman
                        </p>
                      </div>
                    </div>

                    <p className="theme-text-secondary mt-4 text-xs leading-5">
                      Hapus halaman jika sudah tidak diperlukan
                      lagi dari CMS.
                    </p>

                    <button
                      type="button"
                      onClick={() => setDeleteTarget(true)}
                      className="theme-danger mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition hover:opacity-80"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Hapus Halaman
                    </button>
                  </section>
                </aside>
              </div>

              {/* ==================================================
                  FOOTER
              ================================================== */}

              <footer className="py-8 text-center">
                <p className="theme-text-muted text-[11px]">
                  © 2026 SmartSchool • CMS Management
                </p>
              </footer>
            </div>
          </div>
        </main>
      </div>

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
                  "{getTitle()}"
                </span>
                .
              </p>

              <div className="theme-warning mt-4 rounded-xl border p-3">
                <p className="text-xs leading-5">
                  Pastikan halaman ini memang sudah tidak
                  diperlukan sebelum melanjutkan.
                </p>
              </div>
            </div>

            <div className="theme-card-soft theme-border flex flex-col gap-2 border-t p-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(false)}
                className="theme-card theme-border theme-text-secondary rounded-xl border px-4 py-2.5 text-sm font-medium transition theme-sidebar-hover disabled:opacity-50"
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