"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import { apiFetch } from "../../../../lib/api";

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

      /*
       * Backend yang tersedia:
       *
       * GET /api/v1/cms/halaman
       *
       * Belum ada:
       * GET /api/v1/cms/halaman/:id
       *
       * Jadi detail mengambil semua halaman,
       * lalu mencari berdasarkan ID.
       */

      const result = await apiFetch("/api/v1/cms/halaman");

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
        wrapper:
          "border border-emerald-200 bg-emerald-50 text-emerald-700",
        dot: "bg-emerald-500",
      };
    }

    const value = String(page?.status || "").toLowerCase();

    if (value === "draft") {
      return {
        wrapper:
          "border border-amber-200 bg-amber-50 text-amber-700",
        dot: "bg-amber-500",
      };
    }

    return {
      wrapper:
        "border border-slate-200 bg-slate-50 text-slate-600",
      dot: "bg-slate-400",
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

  /*
   * URL website publik.
   *
   * Backend publik:
   * /api/v1/publik/:subdomain/halaman/:slug
   *
   * Frontend website menggunakan route halaman
   * sesuai kebutuhan website sekolah.
   */

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
        `/api/v1/cms/halaman/${page.id}`,
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
      <div className="flex min-h-screen w-full bg-[#f6f8fc]">
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
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 ring-1 ring-blue-100">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>

              <h2 className="text-sm font-bold text-slate-800">
                Memuat detail halaman...
              </h2>

              <p className="mt-1 text-xs text-slate-400">
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
      <div className="flex min-h-screen w-full bg-[#f6f8fc]">
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
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-900">
                Halaman tidak ditemukan
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {error ||
                  "Data halaman tidak tersedia atau sudah dihapus."}
              </p>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => fetchPage(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Coba Lagi
                </button>

                <Link
                  href="/cmsAdmin/pages"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
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
    <div className="flex min-h-screen w-full bg-[#f6f8fc]">
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
                  className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Kembali ke Halaman
                </Link>

                <button
                  type="button"
                  onClick={() => fetchPage(true)}
                  disabled={refreshing}
                  className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${
                      refreshing
                        ? "animate-spin"
                        : ""
                    }`}
                  />

                  Refresh
                </button>
              </div>

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
                  PAGE HEADER
              ================================================== */}

              <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#172554] to-[#081b4f] px-5 py-7 sm:px-7 sm:py-8 lg:px-9">
                  <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />

                  <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

                  <div className="relative">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-blue-100">
                        <LayoutTemplate className="h-3.5 w-3.5" />
                        Halaman Statis
                      </span>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
                          isPublished()
                            ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                            : "border-amber-400/20 bg-amber-400/10 text-amber-200"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isPublished()
                              ? "bg-emerald-400"
                              : "bg-amber-400"
                          }`}
                        />

                        {getStatusLabel()}
                      </span>
                    </div>

                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                      <div className="min-w-0">
                        <h1 className="break-words text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                          {getTitle()}
                        </h1>

                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-300">
                          <span className="inline-flex items-center gap-1.5">
                            <Globe2 className="h-3.5 w-3.5" />

                            /{getSlug()}
                          </span>

                          <span className="hidden h-1 w-1 rounded-full bg-slate-500 sm:block" />

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
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Buka Website
                        </Link>

                        <Link
                          href={`/cmsAdmin/pages/${page.id}/edit`}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/20 transition hover:bg-blue-500"
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

                <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                  <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <CalendarDays className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Dibuat
                      </p>

                      <p className="mt-0.5 text-xs font-semibold text-slate-700">
                        {formatDate(page?.dibuatPada)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      <Clock3 className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Diperbarui
                      </p>

                      <p className="mt-0.5 text-xs font-semibold text-slate-700">
                        {formatDate(page?.diubahPada)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Status
                      </p>

                      <p className="mt-0.5 text-xs font-semibold text-slate-700">
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

                <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <FileText className="h-4 w-4" />
                      </div>

                      <div>
                        <h2 className="text-sm font-bold text-slate-800">
                          Konten Halaman
                        </h2>

                        <p className="text-[11px] text-slate-400">
                          Isi halaman yang tersimpan di CMS
                        </p>
                      </div>
                    </div>

                    <span className="hidden text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:block">
                      CMS Content
                    </span>
                  </div>

                  <div className="p-5 sm:p-7 lg:p-8">
                    {page?.konten ? (
                      <article
                        className="
                          cms-content
                          max-w-none
                          text-[15px]
                          leading-8
                          text-slate-700

                          [&_p]:mb-5

                          [&_h1]:mb-5
                          [&_h1]:mt-8
                          [&_h1]:text-3xl
                          [&_h1]:font-bold
                          [&_h1]:leading-tight
                          [&_h1]:text-slate-900

                          [&_h2]:mb-4
                          [&_h2]:mt-8
                          [&_h2]:text-2xl
                          [&_h2]:font-bold
                          [&_h2]:leading-tight
                          [&_h2]:text-slate-900

                          [&_h3]:mb-3
                          [&_h3]:mt-6
                          [&_h3]:text-xl
                          [&_h3]:font-bold
                          [&_h3]:text-slate-900

                          [&_h4]:mb-2
                          [&_h4]:mt-5
                          [&_h4]:text-lg
                          [&_h4]:font-bold
                          [&_h4]:text-slate-900

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
                          [&_a]:text-blue-600
                          [&_a]:underline
                          [&_a]:underline-offset-2
                          [&_a]:hover:text-blue-700

                          [&_strong]:font-bold
                          [&_strong]:text-slate-900

                          [&_blockquote]:my-6
                          [&_blockquote]:border-l-4
                          [&_blockquote]:border-blue-500
                          [&_blockquote]:bg-blue-50
                          [&_blockquote]:px-5
                          [&_blockquote]:py-4
                          [&_blockquote]:text-slate-600

                          [&_img]:my-6
                          [&_img]:h-auto
                          [&_img]:max-w-full
                          [&_img]:rounded-2xl
                          [&_img]:border
                          [&_img]:border-slate-200

                          [&_table]:my-6
                          [&_table]:w-full
                          [&_table]:border-collapse

                          [&_th]:border
                          [&_th]:border-slate-200
                          [&_th]:bg-slate-50
                          [&_th]:px-4
                          [&_th]:py-3
                          [&_th]:text-left
                          [&_th]:font-semibold

                          [&_td]:border
                          [&_td]:border-slate-200
                          [&_td]:px-4
                          [&_td]:py-3
                        "
                        dangerouslySetInnerHTML={{
                          __html: page.konten,
                        }}
                      />
                    ) : (
                      <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                          <FileText className="h-6 w-6 text-slate-400" />
                        </div>

                        <h3 className="mt-4 text-sm font-bold text-slate-700">
                          Belum ada konten
                        </h3>

                        <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
                          Halaman ini belum memiliki isi.
                          Silakan edit halaman untuk menambahkan
                          konten.
                        </p>

                        <Link
                          href={`/cmsAdmin/pages/${page.id}/edit`}
                          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700"
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

                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Eye className="h-4 w-4" />
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-800">
                          Status Publikasi
                        </h3>

                        <p className="text-[11px] text-slate-400">
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

                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <p className="text-xs leading-5 text-slate-500">
                        {isPublished()
                          ? "Halaman ini dapat ditampilkan pada website sekolah."
                          : "Halaman masih dalam status draft dan belum dipublikasikan."}
                      </p>
                    </div>
                  </section>

                  {/* URL CARD */}

                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                        <Globe2 className="h-4 w-4" />
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-800">
                          URL Halaman
                        </h3>

                        <p className="text-[11px] text-slate-400">
                          Slug dari backend CMS
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl bg-slate-50 p-3">
                      <p className="break-all text-xs leading-5 text-slate-600">
                        /{getSlug()}
                      </p>
                    </div>

                    <Link
                      href={getWebsiteUrl()}
                      target="_blank"
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Lihat di Website
                    </Link>
                  </section>

                  {/* INFORMATION CARD */}

                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <CalendarDays className="h-4 w-4" />
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-800">
                          Informasi
                        </h3>

                        <p className="text-[11px] text-slate-400">
                          Metadata halaman
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 space-y-4">

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          ID
                        </p>

                        <p className="mt-1 break-all text-xs font-medium text-slate-600">
                          {page?.id || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Dibuat Pada
                        </p>

                        <p className="mt-1 text-xs font-medium text-slate-600">
                          {formatDateTime(
                            page?.dibuatPada
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Diubah Pada
                        </p>

                        <p className="mt-1 text-xs font-medium text-slate-600">
                          {formatDateTime(
                            page?.diubahPada
                          )}
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* ACTION CARD */}

                  <section className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-800">
                          Zona Tindakan
                        </h3>

                        <p className="text-[11px] text-slate-400">
                          Tindakan pada halaman
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 text-xs leading-5 text-slate-500">
                      Hapus halaman jika sudah tidak diperlukan
                      lagi dari CMS.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget(true)
                      }
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
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
                <p className="text-[11px] text-slate-400">
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
                  "{getTitle()}"
                </span>
                .
              </p>

              <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 p-3">
                <p className="text-xs leading-5 text-amber-700">
                  Pastikan halaman ini memang sudah tidak
                  diperlukan sebelum melanjutkan.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/50 p-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={deleting}
                onClick={() =>
                  setDeleteTarget(false)
                }
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