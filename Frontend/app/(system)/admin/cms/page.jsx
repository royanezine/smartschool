"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { cmsService } from "@/services/cms.service";
import {
  FileText,
  CheckCircle,
  File,
  Eye,
  Plus,
  ArrowRight,
  Lightbulb,
  TrendingUp,
  LayoutDashboard,
  PenLine,
  ExternalLink,
  BarChart3,
  Clock3,
  RefreshCw,
} from "lucide-react";

// Mengambil array dari beberapa kemungkinan bentuk response API.
function extractList(response) {
  let result = response;

  for (let i = 0; i < 4; i += 1) {
    if (Array.isArray(result)) return result;

    if (result && typeof result === "object") {
      if (Array.isArray(result.data)) return result.data;
      if (Array.isArray(result.items)) return result.items;
      if (Array.isArray(result.results)) return result.results;

      if (result.data && typeof result.data === "object") {
        result = result.data;
        continue;
      }
    }

    break;
  }

  return [];
}

function getArticleTitle(article) {
  return article?.judul || article?.title || "Tanpa judul";
}

function getArticleStatus(article) {
  const status = String(article?.status || "").toLowerCase();

  return ["dipublikasikan", "published", "aktif", "publikasi"].includes(
    status
  )
    ? "published"
    : "draft";
}

function getArticleCategory(article) {
  return (
    article?.kategoriArtikel?.nama ||
    article?.kategori?.nama ||
    article?.category ||
    article?.kategoriArtikel?.slug ||
    "Belum berkategori"
  );
}

function getArticleDate(article) {
  const date =
    article?.createdAt ||
    article?.created_at ||
    article?.tanggalDibuat ||
    article?.updatedAt;

  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "-";

  return parsedDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getViewCount(item) {
  const possibleFields = [
    "views",
    "viewCount",
    "jumlahViews",
    "totalViews",
    "jumlahDilihat",
  ];

  for (const field of possibleFields) {
    const value = item?.[field];

    if (value !== undefined && value !== null && value !== "") {
      const number = Number(value);

      if (Number.isFinite(number) && number >= 0) {
        return number;
      }
    }
  }

  return null;
}

function isPagePublished(page) {
  const status = String(page?.status || "").toLowerCase();

  return ["dipublikasikan", "published", "aktif", "publikasi"].includes(
    status
  );
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("id-ID");
}

export default function CmsDashboardPage() {
  const [active, setActive] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  const [articles, setArticles] = useState([]);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function fetchDashboardData(isRefresh = false) {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const [articleResponse, pageResponse] = await Promise.all([
        cmsService.getArtikel(),
        cmsService.getHalaman(),
      ]);

      setArticles(extractList(articleResponse));
      setPages(extractList(pageResponse));
    } catch (err) {
      console.error("Gagal mengambil data Dashboard CMS:", err);
      setError(
        err?.message ||
          "Data dashboard gagal dimuat. Periksa koneksi API dan sesi login."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const publishedArticles = articles.filter(
    (article) => getArticleStatus(article) === "published"
  );

  const draftArticles = articles.filter(
    (article) => getArticleStatus(article) === "draft"
  );

  const publishedPages = pages.filter(isPagePublished);

  const latestArticles = [...articles]
    .sort((a, b) => {
      const dateA = new Date(
        a?.createdAt || a?.created_at || a?.tanggalDibuat || 0
      ).getTime();

      const dateB = new Date(
        b?.createdAt || b?.created_at || b?.tanggalDibuat || 0
      ).getTime();

      return dateB - dateA;
    })
    .slice(0, 5);

  // Views hanya dihitung jika data jumlah views memang tersedia di response API.
  const viewCounts = [
    ...articles.map(getViewCount),
    ...pages.map(getViewCount),
  ].filter((value) => value !== null);

  const totalViews =
    viewCounts.length > 0
      ? viewCounts.reduce((total, value) => total + value, 0)
      : null;

  const statCards = [
    {
      title: "Total Artikel",
      value: formatNumber(articles.length),
      subtitle: `${publishedArticles.length} artikel dipublikasikan`,
      icon: FileText,
      color: "info",
    },
    {
      title: "Artikel Terbit",
      value: formatNumber(publishedArticles.length),
      subtitle: `${draftArticles.length} artikel belum terbit`,
      icon: CheckCircle,
      color: "success",
    },
    {
      title: "Halaman Statis",
      value: formatNumber(pages.length),
      subtitle: `${publishedPages.length} halaman aktif`,
      icon: File,
      color: "primary",
    },
    {
      title: "Total Dilihat",
      value: totalViews === null ? "—" : formatNumber(totalViews),
      subtitle:
        totalViews === null
          ? "Data views belum tersedia dari API"
          : "Total views dari data yang tersedia",
      icon: Eye,
      color: "warning",
    },
  ];

  const tips = [
    {
      number: "01",
      title: "Gunakan judul yang jelas",
      desc: "Buat judul singkat, informatif, dan mudah dipahami pembaca.",
    },
    {
      number: "02",
      title: "Tambahkan visual",
      desc: "Gunakan gambar yang relevan untuk memperkuat isi artikel.",
    },
    {
      number: "03",
      title: "Periksa sebelum terbit",
      desc: "Pastikan ejaan, struktur, dan informasi sudah sesuai.",
    },
    {
      number: "04",
      title: "Gunakan subjudul",
      desc: "Pisahkan konten menjadi beberapa bagian agar lebih nyaman dibaca.",
    },
  ];

  const colorClasses = {
    info: {
      icon: "text-[var(--color-info)]",
      iconBg: "theme-info",
      accent: "bg-[var(--color-info)]",
    },
    success: {
      icon: "text-[var(--color-success)]",
      iconBg: "theme-success",
      accent: "bg-[var(--color-success)]",
    },
    primary: {
      icon: "text-[var(--color-primary)]",
      iconBg: "theme-card-soft",
      accent: "bg-[var(--color-primary)]",
    },
    warning: {
      icon: "text-[var(--color-warning)]",
      iconBg: "theme-warning",
      accent: "bg-[var(--color-warning)]",
    },
  };

  const publishPercentage =
    articles.length > 0
      ? Math.min((publishedArticles.length / articles.length) * 100, 100)
      : 0;

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
          user={{
            name: "CMS Admin",
            email: "admin@smartschool.com",
            avatar: "CA",
          }}
          notifications={[]}
        />

        <main className="theme-page min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1600px]">
            <section className="mb-7">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="theme-card theme-border flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-[var(--color-primary)] shadow-sm">
                    <LayoutDashboard size={21} strokeWidth={2} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h1 className="theme-text text-2xl font-semibold tracking-tight sm:text-3xl">
                        Dashboard CMS
                      </h1>

                      <span className="theme-card-soft theme-border rounded-md border px-2.5 py-1 text-[11px] font-semibold text-[var(--color-primary)]">
                        Admin
                      </span>
                    </div>

                    <p className="theme-text-muted mt-1 text-sm">
                      Kelola dan pantau konten website SmartSchool.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fetchDashboardData(true)}
                    disabled={loading || refreshing}
                    className="theme-card theme-border theme-text-secondary inline-flex items-center justify-center gap-2 rounded-lg border px-3.5 py-2.5 text-sm font-medium shadow-sm transition-all hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RefreshCw
                      size={16}
                      className={refreshing ? "animate-spin" : ""}
                    />
                    <span>{refreshing ? "Memuat..." : "Refresh Data"}</span>
                  </button>

                  <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="theme-card theme-border theme-text-secondary inline-flex items-center justify-center gap-2 rounded-lg border px-3.5 py-2.5 text-sm font-medium shadow-sm transition-all hover:opacity-80"
                  >
                    <ExternalLink size={16} />
                    <span>Preview Website</span>
                  </a>

                  <Link
                    href="/admin/cms/articles/tambah"
                    className="theme-primary inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all"
                  >
                    <Plus size={17} />
                    <span>Buat Artikel</span>
                  </Link>
                </div>
              </div>

              <div className="theme-border mt-6 border-b" />
            </section>

            {error && (
              <div className="theme-warning mb-6 flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm">{error}</p>
                <button
                  type="button"
                  onClick={() => fetchDashboardData(true)}
                  className="shrink-0 text-sm font-semibold underline"
                >
                  Coba lagi
                </button>
              </div>
            )}

            <section className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
              {statCards.map((stat) => {
                const Icon = stat.icon;
                const color = colorClasses[stat.color];

                return (
                  <div
                    key={stat.title}
                    className={`theme-card theme-border relative overflow-hidden rounded-xl border p-4 shadow-sm transition-all duration-200 hover:shadow-md sm:p-5`}
                  >
                    <div
                      className={`absolute bottom-0 left-0 top-0 w-1 ${color.accent}`}
                    />

                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="theme-text-muted text-[11px] font-semibold uppercase tracking-wide sm:text-xs">
                          {stat.title}
                        </p>

                        <p className="theme-text mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                          {loading ? "..." : stat.value}
                        </p>

                        <p className="theme-text-muted mt-1 text-xs">
                          {loading ? "Mengambil data..." : stat.subtitle}
                        </p>
                      </div>

                      <div
                        className={`${color.iconBg} ${color.icon} flex h-10 w-10 shrink-0 items-center justify-center rounded-lg`}
                      >
                        <Icon size={19} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>

            <div className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-3">
              <section className="theme-card theme-border overflow-hidden rounded-xl border shadow-sm xl:col-span-2">
                <div className="theme-border-soft border-b px-5 py-5 sm:px-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="theme-info flex h-9 w-9 items-center justify-center rounded-lg">
                        <FileText size={18} />
                      </div>

                      <div>
                        <h2 className="theme-text text-sm font-semibold sm:text-base">
                          Artikel Terbaru
                        </h2>
                        <p className="theme-text-muted mt-0.5 text-xs">
                          Artikel dari data CMS
                        </p>
                      </div>
                    </div>

                    <span className="theme-card-soft theme-border theme-text-secondary inline-flex w-fit items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium">
                      <FileText size={12} />
                      {loading ? "Memuat..." : `${latestArticles.length} artikel`}
                    </span>
                  </div>
                </div>

                <div className="px-5 sm:px-6">
                  {loading ? (
                    <div className="theme-text-muted py-12 text-center text-sm">
                      Memuat artikel dari server...
                    </div>
                  ) : latestArticles.length > 0 ? (
                    <div className="divide-y divide-[var(--color-border-soft)]">
                      {latestArticles.map((article, index) => {
                        const published =
                          getArticleStatus(article) === "published";

                        return (
                          <div
                            key={article.id || article.slug || index}
                            className="theme-table-hover group flex items-center gap-4 py-4"
                          >
                            <div className="theme-card-soft theme-border theme-text-muted hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-all group-hover:text-[var(--color-primary)] sm:flex">
                              <PenLine size={16} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="theme-text-secondary truncate text-sm font-medium transition-colors group-hover:text-[var(--color-primary)]">
                                {getArticleTitle(article)}
                              </p>

                              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${
                                    published ? "theme-success" : "theme-warning"
                                  }`}
                                >
                                  {published ? (
                                    <CheckCircle size={11} />
                                  ) : (
                                    <Clock3 size={11} />
                                  )}
                                  {published ? "Terbit" : "Draft"}
                                </span>

                                <span className="theme-text-muted text-[11px]">
                                  {getArticleCategory(article)}
                                </span>
                              </div>
                            </div>

                            <div className="theme-text-muted hidden shrink-0 items-center gap-1.5 text-xs md:flex">
                              <Clock3 size={13} />
                              {getArticleDate(article)}
                            </div>

                            <ArrowRight
                              size={15}
                              className="theme-text-placeholder shrink-0 transition-all group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)]"
                            />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <FileText
                        size={30}
                        className="theme-text-placeholder mx-auto"
                      />
                      <p className="theme-text-secondary mt-3 text-sm font-medium">
                        Belum ada artikel
                      </p>
                      <p className="theme-text-muted mt-1 text-xs">
                        Artikel yang tersimpan akan ditampilkan di sini.
                      </p>
                    </div>
                  )}
                </div>

                <div className="theme-border-soft theme-card-soft border-t px-5 py-4 sm:px-6">
                  <Link
                    href="/admin/cms/articles"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] transition-colors hover:opacity-80"
                  >
                    Lihat semua artikel
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </section>

              <section className="theme-card theme-border overflow-hidden rounded-xl border shadow-sm">
                <div className="theme-border-soft border-b px-5 py-5 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="theme-card-soft flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-primary)]">
                      <BarChart3 size={18} />
                    </div>

                    <div>
                      <h2 className="theme-text text-sm font-semibold sm:text-base">
                        Ringkasan Konten
                      </h2>
                      <p className="theme-text-muted mt-0.5 text-xs">
                        Berdasarkan data CMS
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5 p-5 sm:p-6">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="theme-text-secondary text-xs font-medium">
                        Artikel Terbit
                      </span>
                      <span className="theme-text-secondary text-xs font-semibold">
                        {loading
                          ? "..."
                          : `${publishedArticles.length}/${articles.length}`}
                      </span>
                    </div>

                    <div className="theme-card-soft h-2 overflow-hidden rounded-full">
                      <div
                        className="h-full rounded-full bg-[var(--color-success)] transition-all"
                        style={{
                          width: loading ? "0%" : `${publishPercentage}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="theme-card-soft theme-border-soft flex items-center justify-between rounded-lg border p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="theme-card theme-border flex h-8 w-8 items-center justify-center rounded-lg border text-[var(--color-primary)]">
                        <File size={15} />
                      </div>
                      <div>
                        <p className="theme-text-secondary text-xs font-medium">
                          Halaman Statis
                        </p>
                        <p className="theme-text-muted text-[11px]">
                          Halaman aktif
                        </p>
                      </div>
                    </div>
                    <span className="theme-text text-lg font-semibold">
                      {loading ? "..." : formatNumber(publishedPages.length)}
                    </span>
                  </div>

                  <div className="theme-card-soft theme-border-soft flex items-center justify-between rounded-lg border p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="theme-card theme-border flex h-8 w-8 items-center justify-center rounded-lg border text-[var(--color-warning)]">
                        <Eye size={15} />
                      </div>
                      <div>
                        <p className="theme-text-secondary text-xs font-medium">
                          Total Views
                        </p>
                        <p className="theme-text-muted text-[11px]">
                          Jika disediakan oleh API
                        </p>
                      </div>
                    </div>
                    <span className="theme-text text-lg font-semibold">
                      {loading
                        ? "..."
                        : totalViews === null
                          ? "—"
                          : formatNumber(totalViews)}
                    </span>
                  </div>

                  <Link
                    href="/admin/cms/articles/tambah"
                    className="theme-primary inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-all"
                  >
                    <PenLine size={16} />
                    Tulis Artikel Baru
                  </Link>
                </div>
              </section>
            </div>

            <section className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
              <div className="theme-card theme-border overflow-hidden rounded-xl border shadow-sm lg:col-span-2">
                <div className="theme-border-soft border-b px-5 py-5 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="theme-warning flex h-9 w-9 items-center justify-center rounded-lg">
                      <Lightbulb size={18} />
                    </div>
                    <div>
                      <h2 className="theme-text text-sm font-semibold sm:text-base">
                        Panduan Menulis Konten
                      </h2>
                      <p className="theme-text-muted mt-0.5 text-xs">
                        Beberapa hal yang perlu diperhatikan
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {tips.map((tip) => (
                      <div
                        key={tip.number}
                        className="theme-card-soft theme-border-soft flex gap-3.5 rounded-lg border p-4 transition-all"
                      >
                        <div className="theme-card theme-border flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border">
                          <span className="text-[11px] font-bold text-[var(--color-primary)]">
                            {tip.number}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <h3 className="theme-text-secondary text-sm font-semibold">
                            {tip.title}
                          </h3>
                          <p className="theme-text-muted mt-1 text-xs leading-relaxed">
                            {tip.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="theme-border overflow-hidden rounded-xl border bg-[var(--color-sidebar)] shadow-sm">
                <div className="p-5 sm:p-6">
                  <div className="theme-card-soft mb-4 flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-primary)]">
                    <TrendingUp size={18} />
                  </div>

                  <h2 className="theme-text text-base font-semibold">
                    Kelola Konten
                  </h2>
                  <p className="theme-text-muted mt-1 text-xs leading-relaxed">
                    Kelola artikel, halaman statis, dan konten website dari
                    satu tempat.
                  </p>

                  <div className="mt-5 space-y-2">
                    <Link
                      href="/admin/cms/articles"
                      className="theme-card-soft theme-text flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-sm transition-all hover:opacity-80"
                    >
                      <span className="flex items-center gap-2">
                        <FileText size={15} />
                        Kelola Artikel
                      </span>
                      <ArrowRight size={15} />
                    </Link>

                    <Link
                      href="/admin/cms/pages"
                      className="theme-card-soft theme-text flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-sm transition-all hover:opacity-80"
                    >
                      <span className="flex items-center gap-2">
                        <File size={15} />
                        Kelola Halaman
                      </span>
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            <footer className="theme-border border-t pb-2 pt-5 text-center">
              <p className="theme-text-muted text-xs">
                © {new Date().getFullYear()} SmartSchool • CMS Dashboard
              </p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}