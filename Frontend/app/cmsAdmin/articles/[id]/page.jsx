"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import { apiFetch } from "../../../../lib/api";

import {
  ArrowLeft,
  Pencil,
  Trash2,
  FileText,
  CalendarDays,
  Tag,
  User,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";

function extractList(data) {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.data?.data)) {
    return data.data.data;
  }

  if (Array.isArray(data?.result)) {
    return data.result;
  }

  return [];
}

function formatDate(date) {
  if (!date) return "-";

  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  } catch {
    return "-";
  }
}

function getStatusLabel(status) {
  const value = String(status || "").toLowerCase();

  if (
    value === "published" ||
    value === "terbit" ||
    value === "aktif"
  ) {
    return "Terbit";
  }

  return "Draft";
}

function StatusBadge({ status }) {
  const isPublished =
    String(status || "").toLowerCase() ===
      "published" ||
    String(status || "").toLowerCase() ===
      "terbit" ||
    String(status || "").toLowerCase() ===
      "aktif";

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold ${
        isPublished
          ? "bg-emerald-50 text-emerald-600"
          : "bg-amber-50 text-amber-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isPublished
            ? "bg-emerald-500"
            : "bg-amber-500"
        }`}
      />

      {isPublished ? "Terbit" : "Draft"}
    </span>
  );
}

export default function ArticleDetailPage() {
  const router = useRouter();
  const params = useParams();

  const articleId = params?.id;

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  /*
   * State sidebar.
   * Default true (expanded).
   */
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!articleId) return;

    loadArticle();
  }, [articleId]);

  async function loadArticle() {
    try {
      setLoading(true);
      setError("");

      /*
       * Backend belum menyediakan:
       *
       * GET /api/v1/cms/artikel/:id
       *
       * Jadi ambil semua artikel lalu cari berdasarkan ID.
       */
      const data = await apiFetch(
        "/api/v1/cms/artikel"
      );

      const articles = extractList(data);

      const found = articles.find(
        (item) =>
          String(item.id) ===
          String(articleId)
      );

      if (!found) {
        setError("Artikel tidak ditemukan.");
        setArticle(null);
        return;
      }

      setArticle(found);
    } catch (err) {
      console.error(
        "Gagal mengambil detail artikel:",
        err
      );

      setError(
        err?.message ||
          "Gagal mengambil detail artikel."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!article) return;

    const confirmed = window.confirm(
      `Yakin ingin menghapus artikel "${article.judul}"?`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      await apiFetch(
        `/api/v1/cms/artikel/${article.id}`,
        {
          method: "DELETE",
        }
      );

      alert("Artikel berhasil dihapus.");

      router.push("/cmsAdmin/articles");
    } catch (err) {
      console.error(
        "Gagal menghapus artikel:",
        err
      );

      alert(
        err?.message ||
          "Gagal menghapus artikel."
      );
    } finally {
      setDeleting(false);
    }
  }

  /* =========================================================
     LOADING STATE
  ========================================================= */

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
        <Sidebar
          role="cms"
          collapsed={!sidebarOpen}
          setCollapsed={(value) => {
            const next =
              typeof value === "function"
                ? value(!sidebarOpen)
                : value;

            setSidebarOpen(!next);
          }}
        />

        <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
          <div className="sticky top-0 z-30 shrink-0">
            <Header
              onMenuClick={() =>
                setSidebarOpen((prev) => !prev)
              }
            />
          </div>

          <main className="flex flex-1 items-center justify-center overflow-y-auto p-6">
            <div className="text-center">
              <Loader2
                size={32}
                className="mx-auto animate-spin text-blue-600"
              />

              <p className="mt-4 text-sm font-medium text-slate-500">
                Memuat detail artikel...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR STATE
  ========================================================= */

  if (error || !article) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
        <Sidebar
          role="cms"
          collapsed={!sidebarOpen}
          setCollapsed={(value) => {
            const next =
              typeof value === "function"
                ? value(!sidebarOpen)
                : value;

            setSidebarOpen(!next);
          }}
        />

        <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
          <div className="sticky top-0 z-30 shrink-0">
            <Header
              onMenuClick={() =>
                setSidebarOpen((prev) => !prev)
              }
            />
          </div>

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <button
              onClick={() =>
                router.push("/cmsAdmin/articles")
              }
              className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
            >
              <ArrowLeft size={17} />

              Kembali ke Artikel
            </button>

            <div className="border border-red-100 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center bg-red-50 text-red-500">
                <AlertCircle size={26} />
              </div>

              <h2 className="mt-4 text-lg font-bold text-[#0F172A]">
                Artikel Tidak Ditemukan
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {error ||
                  "Artikel yang kamu cari tidak tersedia."}
              </p>

              <button
                onClick={() =>
                  router.push("/cmsAdmin/articles")
                }
                className="mt-5 inline-flex items-center gap-2 bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
              >
                <ArrowLeft size={16} />

                Kembali
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN RENDER
  ========================================================= */

  const categoryName =
    article.kategoriArtikel?.nama ||
    article.kategori?.nama ||
    "Tanpa Kategori";

  const imageUrl =
    article.gambarUtama ||
    article.image ||
    "";

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar
        role="cms"
        collapsed={!sidebarOpen}
        setCollapsed={(value) => {
          const next =
            typeof value === "function"
              ? value(!sidebarOpen)
              : value;

          setSidebarOpen(!next);
        }}
      />

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        {/* ===================================================
            HEADER (STICKY)
        =================================================== */}

        <div className="sticky top-0 z-30 shrink-0">
          <Header
            onMenuClick={() =>
              setSidebarOpen((prev) => !prev)
            }
          />
        </div>

        {/* ===================================================
            MAIN (SCROLL INTERNAL)
        =================================================== */}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* TOP BAR */}

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={() =>
                router.push("/cmsAdmin/articles")
              }
              className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
            >
              <ArrowLeft size={17} />

              Kembali ke Artikel
            </button>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  router.push(
                    `/cmsAdmin/articles/${article.id}/edit`
                  )
                }
                className="inline-flex items-center gap-2 border border-blue-100 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
              >
                <Pencil size={16} />

                Edit
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Trash2 size={16} />
                )}

                {deleting ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>

          {/* ARTICLE */}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            {/* CONTENT */}

            <article className="overflow-hidden border border-slate-200 bg-white shadow-sm">
              {/* IMAGE */}

              {imageUrl ? (
                <div className="aspect-[16/7] w-full overflow-hidden bg-slate-100">
                  <img
                    src={imageUrl}
                    alt={article.judul}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display =
                        "none";
                    }}
                  />
                </div>
              ) : (
                <div className="flex aspect-[16/7] w-full items-center justify-center bg-slate-100">
                  <div className="text-center">
                    <ImageIcon
                      size={40}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-2 text-sm text-slate-400">
                      Tidak ada gambar utama
                    </p>
                  </div>
                </div>
              )}

              <div className="p-5 sm:p-7 lg:p-9">
                {/* CATEGORY + STATUS */}

                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600">
                    <Tag size={13} />

                    {categoryName}
                  </span>

                  <StatusBadge
                    status={article.status}
                  />
                </div>

                {/* TITLE */}

                <h1 className="text-2xl font-bold leading-tight tracking-tight text-[#0F172A] sm:text-3xl lg:text-4xl">
                  {article.judul}
                </h1>

                {/* META */}

                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-b border-slate-100 pb-5 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={14} />

                    {formatDate(
                      article.dibuatPada ||
                        article.createdAt ||
                        article.created_at
                    )}
                  </span>

                  {article.dibuatOleh && (
                    <span className="inline-flex items-center gap-1.5">
                      <User size={14} />

                      {typeof article.dibuatOleh ===
                      "object"
                        ? article.dibuatOleh.nama ||
                          article.dibuatOleh.email ||
                          "Admin"
                        : article.dibuatOleh}
                    </span>
                  )}
                </div>

                {/* SUMMARY */}

                {article.ringkasan && (
                  <div className="mt-6 border-l-4 border-blue-500 bg-blue-50/60 px-5 py-4">
                    <p className="text-sm font-medium leading-7 text-slate-600">
                      {article.ringkasan}
                    </p>
                  </div>
                )}

                {/* CONTENT */}

                <div className="mt-7">
                  {article.konten ? (
                    <div
                      className="prose prose-slate max-w-none text-sm leading-7 sm:text-base"
                      dangerouslySetInnerHTML={{
                        __html: article.konten,
                      }}
                    />
                  ) : (
                    <div className="py-10 text-center">
                      <FileText
                        size={34}
                        className="mx-auto text-slate-300"
                      />

                      <p className="mt-3 text-sm text-slate-400">
                        Artikel belum memiliki konten.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </article>

            {/* SIDEBAR DETAIL */}

            <aside className="space-y-5">
              {/* INFO */}

              <div className="border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h2 className="text-sm font-bold text-[#0F172A]">
                    Informasi Artikel
                  </h2>
                </div>

                <div className="divide-y divide-slate-100">
                  <InfoRow
                    label="Status"
                    value={
                      <StatusBadge
                        status={article.status}
                      />
                    }
                  />

                  <InfoRow
                    label="Kategori"
                    value={categoryName}
                  />

                  <InfoRow
                    label="Slug"
                    value={article.slug || "-"}
                  />

                  <InfoRow
                    label="Dibuat"
                    value={formatDate(
                      article.dibuatPada ||
                        article.createdAt ||
                        article.created_at
                    )}
                  />

                  {article.diperbaruiPada && (
                    <InfoRow
                      label="Diperbarui"
                      value={formatDate(
                        article.diperbaruiPada
                      )}
                    />
                  )}
                </div>
              </div>

              {/* QUICK ACTION */}

              <div className="border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center bg-blue-50 text-blue-600">
                    <FileText size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[#0F172A]">
                      Kelola Artikel
                    </p>

                    <p className="mt-0.5 text-xs text-slate-400">
                      Perbarui informasi artikel
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    router.push(
                      `/cmsAdmin/articles/${article.id}/edit`
                    )
                  }
                  className="mt-5 flex h-11 w-full items-center justify-center gap-2 bg-[#2563EB] text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
                >
                  <Pencil size={16} />

                  Edit Artikel
                </button>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="px-5 py-4">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <div className="mt-1.5 break-words text-sm font-medium text-slate-600">
        {value}
      </div>
    </div>
  );
}