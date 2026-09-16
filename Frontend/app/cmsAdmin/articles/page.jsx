"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { apiFetch } from "../../../lib/api";

import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  FileText,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function ArtikelPage() {
  const router = useRouter();

  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingCategory, setLoadingCategory] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [error, setError] = useState("");

  /*
   * State sidebar.
   * Default true (expanded).
   */
  const [sidebarOpen, setSidebarOpen] = useState(true);

  /* =========================================================
     STATUS HELPER
  ========================================================= */

  function normalizeStatus(status) {
    return String(status || "").trim().toLowerCase();
  }

  function isPublishedStatus(status) {
    const value = normalizeStatus(status);

    return [
      "published",
      "dipublikasikan",
      "aktif",
    ].includes(value);
  }

  function isDraftStatus(status) {
    return normalizeStatus(status) === "draft";
  }

  function getStatus(status) {
    if (isPublishedStatus(status)) {
      return {
        label: "Published",
        className:
          "bg-emerald-50 text-emerald-700 border-emerald-100",
        dot: "bg-emerald-500",
      };
    }

    return {
      label: "Draft",
      className:
        "bg-amber-50 text-amber-700 border-amber-100",
      dot: "bg-amber-500",
    };
  }

  /* =========================================================
     FETCH ARTIKEL
  ========================================================= */

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch("/api/v1/cms/artikel");

      const data =
        response?.data ||
        response?.result?.data ||
        response?.result ||
        [];

      setArticles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal mengambil artikel:", err);

      setError(
        err?.message ||
          "Gagal mengambil data artikel."
      );

      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================================================
     FETCH KATEGORI
  ========================================================= */

  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategory(true);

      const response = await apiFetch(
        "/api/v1/cms/kategori-artikel"
      );

      const data =
        response?.data ||
        response?.result?.data ||
        response?.result ||
        [];

      setCategories(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "Gagal mengambil kategori:",
        err
      );

      setCategories([]);
    } finally {
      setLoadingCategory(false);
    }
  }, []);

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, [fetchArticles, fetchCategories]);

  /* =========================================================
     DELETE
  ========================================================= */

  async function handleDelete(id) {
    if (!id) return;

    const confirmed = window.confirm(
      "Apakah kamu yakin ingin menghapus artikel ini?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      await apiFetch(
        `/api/v1/cms/artikel/${id}`,
        {
          method: "DELETE",
        }
      );

      await fetchArticles();
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
      setDeletingId(null);
    }
  }

  /* =========================================================
     FILTER ARTICLE
  ========================================================= */

  const filteredArticles = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    return articles.filter((article) => {
      const title = String(
        article?.judul ||
          article?.title ||
          ""
      ).toLowerCase();

      const categoryName = String(
        article?.kategoriArtikel?.nama ||
          article?.kategoriArtikel?.name ||
          article?.kategori?.nama ||
          article?.kategori?.name ||
          ""
      ).toLowerCase();

      const articleStatus =
        normalizeStatus(article?.status);

      const matchesSearch =
        !keyword ||
        title.includes(keyword) ||
        categoryName.includes(keyword);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published"
          ? isPublishedStatus(articleStatus)
          : articleStatus === statusFilter);

      const articleCategoryId =
        article?.kategoriArtikelId ||
        article?.kategoriId ||
        article?.kategoriArtikel?.id ||
        article?.kategori?.id ||
        "";

      const matchesCategory =
        categoryFilter === "all" ||
        String(articleCategoryId) ===
          String(categoryFilter);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });
  }, [
    articles,
    search,
    statusFilter,
    categoryFilter,
  ]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalArticles = articles.length;

  const publishedArticles = articles.filter(
    (article) =>
      isPublishedStatus(article?.status)
  ).length;

  const draftArticles = articles.filter(
    (article) =>
      isDraftStatus(article?.status)
  ).length;

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredArticles.length / limit
    )
  );

  const currentPage = Math.min(
    page,
    totalPages
  );

  const paginatedArticles =
    filteredArticles.slice(
      (currentPage - 1) * limit,
      currentPage * limit
    );

  useEffect(() => {
    setPage(1);
  }, [
    search,
    statusFilter,
    categoryFilter,
  ]);

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  function formatDate(date) {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "-";
    }

    return parsed.toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  /* =========================================================
     GET ARTICLE DATA
  ========================================================= */

  function getArticleTitle(article) {
    return (
      article?.judul ||
      article?.title ||
      "Tanpa Judul"
    );
  }

  function getArticleCategory(article) {
    return (
      article?.kategoriArtikel?.nama ||
      article?.kategoriArtikel?.name ||
      article?.kategori?.nama ||
      article?.kategori?.name ||
      "-"
    );
  }

  function getArticleDate(article) {
    return (
      article?.dibuatPada ||
      article?.createdAt ||
      article?.created_at ||
      null
    );
  }

  function getArticleId(article) {
    return (
      article?.id ||
      article?._id
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
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
          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Artikel
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Kelola artikel dan informasi yang
                ditampilkan pada website sekolah.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push("/cmsAdmin/articles/tambah")
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Plus size={18} />

              Tambah Artikel
            </button>
          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span>{error}</span>

              <button
                type="button"
                onClick={fetchArticles}
                className="font-semibold underline"
              >
                Coba lagi
              </button>
            </div>
          )}

          {/* =================================================
              STATISTICS
          ================================================= */}

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Artikel
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {totalArticles}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FileText size={21} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Published
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {publishedArticles}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={21} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Draft
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {draftArticles}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Clock3 size={21} />
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              FILTER
          ================================================= */}

          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Filter size={17} />

              Filter Artikel
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {/* SEARCH */}

              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Cari artikel..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* STATUS */}

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">
                  Semua Status
                </option>

                <option value="published">
                  Published
                </option>

                <option value="draft">
                  Draft
                </option>
              </select>

              {/* CATEGORY */}

              <select
                value={categoryFilter}
                onChange={(e) =>
                  setCategoryFilter(e.target.value)
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="all">
                  Semua Kategori
                </option>

                {!loadingCategory &&
                  categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.nama ||
                        category.name ||
                        "Tanpa Nama"}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* =================================================
              ARTICLE TABLE
          ================================================= */}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* TABLE HEADER */}

            <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Daftar Artikel
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Menampilkan{" "}
                  {paginatedArticles.length} dari{" "}
                  {filteredArticles.length} artikel
                </p>
              </div>

              <button
                type="button"
                onClick={fetchArticles}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
              >
                <RefreshCw
                  size={16}
                  className={
                    loading ? "animate-spin" : ""
                  }
                />

                Refresh
              </button>
            </div>

            {/* LOADING */}

            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <RefreshCw
                    size={28}
                    className="animate-spin text-blue-600"
                  />

                  <p className="text-sm text-slate-500">
                    Memuat artikel...
                  </p>
                </div>
              </div>
            ) : paginatedArticles.length === 0 ? (
              /* EMPTY */

              <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <FileText size={26} />
                </div>

                <h3 className="text-base font-semibold text-slate-800">
                  Data artikel belum ditemukan
                </h3>

                <p className="mt-1 max-w-md text-sm text-slate-500">
                  Belum ada artikel yang sesuai
                  dengan pencarian atau filter yang
                  kamu pilih.
                </p>
              </div>
            ) : (
              <>
                {/* DESKTOP TABLE */}

                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[850px]">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70">
                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Artikel
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Kategori
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Status
                        </th>

                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Tanggal
                        </th>

                        <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Aksi
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {paginatedArticles.map(
                        (article) => {
                          const id =
                            getArticleId(article);

                          const status =
                            getStatus(article?.status);

                          return (
                            <tr
                              key={id}
                              className="transition hover:bg-slate-50/70"
                            >
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <FileText size={18} />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="truncate font-semibold text-slate-800">
                                      {getArticleTitle(
                                        article
                                      )}
                                    </p>

                                    {article?.slug && (
                                      <p className="mt-0.5 truncate text-xs text-slate-400">
                                        /{article.slug}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <span className="text-sm text-slate-600">
                                  {getArticleCategory(
                                    article
                                  )}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <span
                                  className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold ${status.className}`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                                  />

                                  {status.label}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <span className="text-sm text-slate-600">
                                  {formatDate(
                                    getArticleDate(article)
                                  )}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    title="Lihat artikel"
                                    onClick={() =>
                                      router.push(
                                        `/cmsAdmin/articles/${id}`
                                      )
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                                  >
                                    <Eye size={17} />
                                  </button>

                                  <button
                                    type="button"
                                    title="Edit artikel"
                                    onClick={() =>
                                      router.push(
                                        `/cmsAdmin/articles/${id}/edit`
                                      )
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-blue-500 transition hover:bg-blue-50 hover:text-blue-700"
                                  >
                                    <Pencil size={17} />
                                  </button>

                                  <button
                                    type="button"
                                    title="Hapus artikel"
                                    disabled={
                                      deletingId === id
                                    }
                                    onClick={() =>
                                      handleDelete(id)
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {deletingId === id ? (
                                      <RefreshCw
                                        size={17}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Trash2 size={17} />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE CARD */}

                <div className="divide-y divide-slate-100 md:hidden">
                  {paginatedArticles.map(
                    (article) => {
                      const id =
                        getArticleId(article);

                      const status =
                        getStatus(article?.status);

                      return (
                        <div key={id} className="p-4">
                          <div className="flex gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                              <FileText size={18} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-slate-800">
                                {getArticleTitle(
                                  article
                                )}
                              </h3>

                              <p className="mt-1 text-xs text-slate-500">
                                {getArticleCategory(
                                  article
                                )}
                              </p>

                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                <span
                                  className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold ${status.className}`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                                  />

                                  {status.label}
                                </span>

                                <span className="text-xs text-slate-400">
                                  {formatDate(
                                    getArticleDate(
                                      article
                                    )
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                router.push(
                                  `/cms/artikel/${id}`
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                            >
                              <Eye size={15} />
                              Lihat
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                router.push(
                                  `/cms/artikel/${id}/edit`
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-100"
                            >
                              <Pencil size={15} />
                              Edit
                            </button>

                            <button
                              type="button"
                              disabled={deletingId === id}
                              onClick={() =>
                                handleDelete(id)
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
                            >
                              {deletingId === id ? (
                                <RefreshCw
                                  size={15}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2 size={15} />
                              )}

                              Hapus
                            </button>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </>
            )}

            {/* PAGINATION */}

            {!loading &&
              filteredArticles.length > 0 && (
                <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-500">
                    Halaman{" "}
                    <span className="font-semibold text-slate-700">
                      {currentPage}
                    </span>{" "}
                    dari{" "}
                    <span className="font-semibold text-slate-700">
                      {totalPages}
                    </span>
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() =>
                        setPage((prev) =>
                          Math.max(1, prev - 1)
                        )
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft size={17} />
                    </button>

                    <button
                      type="button"
                      disabled={
                        currentPage >= totalPages
                      }
                      onClick={() =>
                        setPage((prev) =>
                          Math.min(
                            totalPages,
                            prev + 1
                          )
                        )
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronRight size={17} />
                    </button>
                  </div>
                </div>
              )}
          </div>
        </main>
      </div>
    </div>
  );
}