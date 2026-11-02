
import Link from "next/link";
import { publikService } from "@/services/publik.service";
import ArticleCard from "@/app/components/tenant/ArticleCard";
import {
  ArrowLeft,
  ArrowUpRight,
  Newspaper,
  AlertCircle,
  BookOpen,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const theme = {
  primary: "var(--school-primary, #2563EB)",
  secondary: "var(--school-secondary, #64748B)",
  accent: "var(--school-accent, #F59E0B)",
  background: "var(--school-background, #F8FAFC)",
  surface: "var(--school-surface, #FFFFFF)",
  text: "var(--school-text, #0F172A)",
  border: "var(--school-border, #E2E8F0)",
};

function getText(value, fallback = "") {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : fallback;
}

function unwrapResponse(value) {
  let result = value;

  for (let i = 0; i < 8; i += 1) {
    if (
      result &&
      typeof result === "object" &&
      !Array.isArray(result) &&
      Object.prototype.hasOwnProperty.call(result, "data")
    ) {
      result = result.data;
    } else {
      break;
    }
  }

  return result;
}

function normalizeArticles(response) {
  let data = unwrapResponse(response);

  for (let i = 0; i < 6; i += 1) {
    if (Array.isArray(data)) return data;
    if (!data || typeof data !== "object") return [];

    const candidates = [
      data.artikel,
      data.articles,
      data.items,
      data.results,
      data.data,
    ];

    const found = candidates.find(Array.isArray);
    if (found) return found;

    const nested = candidates.find(
      (item) => item && typeof item === "object"
    );

    if (nested) {
      data = nested;
      continue;
    }

    return [];
  }

  return [];
}

function normalizePages(response) {
  let data = unwrapResponse(response);

  for (let i = 0; i < 6; i += 1) {
    if (Array.isArray(data)) return data;
    if (!data || typeof data !== "object") return [];

    const candidates = [
      data.halaman,
      data.pages,
      data.items,
      data.results,
      data.data,
    ];

    const found = candidates.find(Array.isArray);
    if (found) return found;

    const nested = candidates.find(
      (item) => item && typeof item === "object"
    );

    if (nested) {
      data = nested;
      continue;
    }

    return [];
  }

  return [];
}

function isActiveSection(item) {
  const status = getText(item?.status).toLowerCase();
  return !status || status === "aktif";
}

function findHeroInPageConfig(pageConfig) {
  if (!pageConfig) return null;

  if (
    pageConfig.hero &&
    typeof pageConfig.hero === "object" &&
    !Array.isArray(pageConfig.hero) &&
    isActiveSection(pageConfig.hero)
  ) {
    return pageConfig.hero;
  }

  if (Array.isArray(pageConfig)) {
    return (
      pageConfig.find(
        (item) =>
          getText(item?.section).toLowerCase() === "hero" &&
          isActiveSection(item)
      ) || null
    );
  }

  const candidates = [
    pageConfig.sections,
    pageConfig.konfigurasi,
    pageConfig.items,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      const hero = candidate.find(
        (item) =>
          getText(item?.section).toLowerCase() === "hero" &&
          isActiveSection(item)
      );

      if (hero) return hero;
    }
  }

  return null;
}

function getArticleHeroConfig(response, pageId) {
  const config = unwrapResponse(response);

  if (!config || typeof config !== "object" || !pageId) {
    return null;
  }

  const pageConfig = config[String(pageId)];

  if (pageConfig) {
    return findHeroInPageConfig(pageConfig);
  }

  const containers = [
    config.konfigurasi,
    config.data,
    config.items,
  ];

  for (const container of containers) {
    if (
      container &&
      typeof container === "object" &&
      !Array.isArray(container)
    ) {
      const nestedPageConfig = container[String(pageId)];

      if (nestedPageConfig) {
        return findHeroInPageConfig(nestedPageConfig);
      }
    }
  }

  const list = Array.isArray(config)
    ? config
    : Array.isArray(config.konfigurasi)
      ? config.konfigurasi
      : Array.isArray(config.items)
        ? config.items
        : [];

  return (
    list.find(
      (item) =>
        String(item?.halamanCmsId) === String(pageId) &&
        getText(item?.section).toLowerCase() === "hero" &&
        isActiveSection(item)
    ) || null
  );
}

function findArticlePage(pages) {
  const slugCandidates = [
    "artikel",
    "articles",
    "berita",
    "berita-sekolah",
  ];

  const normalizedPages = pages.filter(
    (page) => page && typeof page === "object"
  );

  const bySlug = normalizedPages.find((page) =>
    slugCandidates.includes(
      getText(page.slug)
        .toLowerCase()
        .replace(/^\/+|\/+$/g, "")
    )
  );

  if (bySlug) return bySlug;

  return (
    normalizedPages.find((page) => {
      const judul = getText(page.judul).toLowerCase();

      return [
        "artikel",
        "artikel & berita",
        "artikel dan berita",
        "berita sekolah",
        "daftar artikel",
      ].includes(judul);
    }) || null
  );
}

function getCtaHref(value, tenant) {
  const href = getText(value);

  if (!href) return "";
  if (/^(javascript|data|vbscript):/i.test(href)) return "";

  if (href.startsWith("/") && !href.startsWith("//")) {
    return href;
  }

  try {
    const url = new URL(href);

    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.toString();
    }
  } catch {
    // Path internal ditangani di bawah.
  }

  return `/${tenant}/${href.replace(/^\/+/, "")}`;
}

function ErrorState({ title, description, children }) {
  return (
    <div
      className="rounded-2xl border p-8 text-center sm:p-10"
      style={{
        backgroundColor: theme.surface,
        borderColor: theme.border,
        color: theme.text,
      }}
    >
      <div
        className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
        style={{
          backgroundColor: `color-mix(in srgb, ${theme.accent} 12%, ${theme.surface})`,
          color: theme.accent,
        }}
      >
        <AlertCircle size={24} strokeWidth={1.8} />
      </div>

      <h2 className="text-lg font-bold tracking-tight sm:text-xl">
        {title}
      </h2>

      <p
        className="mx-auto mt-2 max-w-lg text-sm leading-6"
        style={{ color: theme.secondary }}
      >
        {description}
      </p>

      {children}
    </div>
  );
}

function BackToHome({ tenant }) {
  return (
    <Link
      href={`/${tenant}`}
      className="mt-6 inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:opacity-75"
      style={{
        backgroundColor: theme.surface,
        borderColor: theme.border,
        color: theme.text,
      }}
    >
      <ArrowLeft size={16} />
      Kembali ke Beranda
    </Link>
  );
}

function ArticleHero({ tenant, articlesCount, apiError, heroConfig }) {
  const title = getText(heroConfig?.judul, "Artikel & Berita");
  const subtitle = getText(heroConfig?.subJudul, "Informasi Sekolah");
  const description = getText(
    heroConfig?.konten,
    "Temukan informasi terbaru, kegiatan, pengumuman, dan cerita menarik dari lingkungan sekolah."
  );

  const imageUrl = getText(heroConfig?.gambarUrl);
  const ctaText = getText(heroConfig?.ctaText);
  const ctaHref = getCtaHref(heroConfig?.ctaLink, tenant);

  return (
    <section
      className="relative isolate overflow-hidden"
      style={{
        backgroundColor: theme.primary,
        color: "#FFFFFF",
      }}
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
      )}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: imageUrl
            ? "linear-gradient(100deg, rgba(15,23,42,0.90) 0%, rgba(15,23,42,0.74) 58%, rgba(15,23,42,0.42) 100%)"
            : `linear-gradient(120deg, ${theme.primary}, color-mix(in srgb, ${theme.primary} 70%, #0F172A))`,
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-32 -z-10 h-72 w-72 rounded-full blur-3xl"
        style={{
          backgroundColor: theme.accent,
          opacity: 0.13,
        }}
      />

      <div className="mx-auto w-full max-w-[1280px] px-5 pb-10 pt-24 sm:px-8 sm:pb-12 sm:pt-28 lg:px-12 lg:pb-14 lg:pt-28">
        <Link
          href={`/${tenant}`}
          className="inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium transition hover:bg-white/10 sm:text-sm"
          style={{
            color: "#FFFFFF",
            borderColor: "rgba(255,255,255,0.24)",
            backgroundColor: "rgba(255,255,255,0.05)",
          }}
        >
          <ArrowLeft size={15} />
          Beranda
        </Link>

        <div className="mt-8 flex flex-col justify-between gap-7 sm:mt-10 lg:flex-row lg:items-end lg:gap-12">
          <div className="max-w-3xl">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/75 sm:text-sm">
              <Newspaper size={16} />
              {subtitle}
            </div>

            <h1 className="max-w-3xl break-words text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
              {title}
            </h1>

            <p className="mt-4 max-w-2xl whitespace-pre-line text-sm leading-6 text-white/80 sm:text-base sm:leading-7">
              {description}
            </p>

            {ctaText && ctaHref && (
              <Link
                href={ctaHref}
                className="mt-6 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition hover:opacity-90"
                style={{
                  backgroundColor: "#FFFFFF",
                  color: theme.primary,
                }}
              >
                {ctaText}
                <ArrowUpRight size={16} />
              </Link>
            )}
          </div>

          <div
            className="flex w-fit items-center gap-3 rounded-xl border px-4 py-3 sm:px-5 sm:py-4"
            style={{
              borderColor: "rgba(255,255,255,0.18)",
              backgroundColor: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
            >
              <BookOpen size={20} />
            </div>

            <div>
              <p className="text-xs text-white/70">
                Total publikasi
              </p>
              <p className="mt-0.5 text-xl font-bold text-white">
                {apiError ? "—" : articlesCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute inset-x-0 bottom-0 h-px"
        style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
      />
    </section>
  );
}

export default async function DaftarArtikelPage({ params }) {
  const resolvedParams = await params;
  const tenant = getText(resolvedParams?.tenant);

  if (!tenant) {
    return (
      <main
        className="flex min-h-[60vh] items-center justify-center px-5 py-16"
        style={{
          backgroundColor: theme.background,
          color: theme.text,
        }}
      >
        <ErrorState
          title="Subdomain sekolah tidak ditemukan"
          description="Website ini tidak memiliki identitas subdomain yang valid."
        />
      </main>
    );
  }

  let articles = [];
  let apiError = null;
  let heroConfig = null;

  try {
    const response = await publikService.getArtikel(tenant);

    articles = normalizeArticles(response).filter(
      (article) =>
        article &&
        typeof article === "object" &&
        (article.slug || article.id)
    );
  } catch (error) {
    apiError = error;

    console.error(
      "[ARTIKEL PUBLIK] Gagal mengambil artikel:",
      error
    );
  }

  try {
    const [pagesResponse, configResponse] = await Promise.all([
      publikService.getDaftarHalaman(tenant),
      publikService.getKonfigurasi(tenant),
    ]);

    const pages = normalizePages(pagesResponse);
    const articlePage = findArticlePage(pages);

    if (articlePage?.id) {
      heroConfig = getArticleHeroConfig(configResponse, articlePage.id);
    }

    console.info("[ARTIKEL PUBLIK] Konfigurasi hero:", {
      tenant,
      articlePageId: articlePage?.id || null,
      articlePageSlug: articlePage?.slug || null,
      heroDitemukan: Boolean(heroConfig),
    });
  } catch (error) {
    console.error(
      "[ARTIKEL PUBLIK] Gagal mengambil konfigurasi hero:",
      error
    );
  }

  return (
    <main
      className="min-h-screen w-full overflow-x-clip pb-16"
      style={{
        backgroundColor: theme.background,
        color: theme.text,
      }}
    >
      <ArticleHero
        tenant={tenant}
        articlesCount={articles.length}
        apiError={apiError}
        heroConfig={heroConfig}
      />

      <section className="mx-auto w-full max-w-[1280px] px-5 pt-9 sm:px-8 sm:pt-12 lg:px-12 lg:pt-14">
        {apiError ? (
          <ErrorState
            title="Artikel belum dapat dimuat"
            description="Data artikel belum berhasil diambil dari server. Silakan periksa koneksi backend dan coba kembali nanti."
          >
            {process.env.NODE_ENV === "development" && (
              <p
                className="mx-auto mt-4 max-w-2xl break-words rounded-lg p-3 text-left text-xs"
                style={{
                  backgroundColor: theme.background,
                  color: theme.secondary,
                }}
              >
                {apiError.message}
              </p>
            )}
            <BackToHome tenant={tenant} />
          </ErrorState>
        ) : articles.length === 0 ? (
          <div
            className="rounded-xl border border-dashed px-5 py-14 text-center sm:px-10 sm:py-20"
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.border,
            }}
          >
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl"
              style={{
                backgroundColor: `color-mix(in srgb, ${theme.primary} 8%, ${theme.surface})`,
                color: theme.primary,
              }}
            >
              <Newspaper size={27} strokeWidth={1.7} />
            </div>

            <h2
              className="text-xl font-bold tracking-tight sm:text-2xl"
              style={{ color: theme.text }}
            >
              Belum Ada Artikel
            </h2>

            <p
              className="mx-auto mt-3 max-w-md text-sm leading-6"
              style={{ color: theme.secondary }}
            >
              Belum ada artikel yang dipublikasikan. Informasi terbaru
              akan muncul di halaman ini setelah diterbitkan melalui CMS sekolah.
            </p>

            <BackToHome tenant={tenant} />
          </div>
        ) : (
          <>
            <div
              className="mb-7 flex flex-col justify-between gap-3 border-b pb-5 sm:mb-9 sm:flex-row sm:items-end"
              style={{ borderColor: theme.border }}
            >
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-[0.15em]"
                  style={{ color: theme.primary }}
                >
                  Jelajahi Publikasi
                </p>

                <h2
                  className="mt-2 text-xl font-bold tracking-tight sm:text-2xl"
                  style={{ color: theme.text }}
                >
                  Informasi Terbaru
                </h2>

                <p
                  className="mt-1.5 text-sm leading-6"
                  style={{ color: theme.secondary }}
                >
                  Berita, kegiatan, dan cerita dari sekolah.
                </p>
              </div>

              <div
                className="inline-flex w-fit items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium sm:text-sm"
                style={{
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  color: theme.secondary,
                }}
              >
                <Newspaper size={15} style={{ color: theme.primary }} />
                {articles.length} artikel
              </div>
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-7 lg:gap-y-8">
              {articles.map((article, index) => (
                <ArticleCard
                  key={
                    article.id ??
                    article.slug ??
                    `article-${index}`
                  }
                  artikel={article}
                  subdomain={tenant}
                />
              ))}
            </div>

            <div
              className="mt-10 flex flex-col items-start justify-between gap-3 border-t pt-6 sm:flex-row sm:items-center"
              style={{ borderColor: theme.border }}
            >
              <p
                className="text-sm leading-6"
                style={{ color: theme.secondary }}
              >
                Publikasi resmi dan informasi terbaru sekolah.
              </p>

              <Link
                href={`/${tenant}`}
                className="inline-flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-75"
                style={{ color: theme.primary }}
              >
                Kembali ke Beranda
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
