
import Link from "next/link";
import { notFound } from "next/navigation";
import { publikService } from "@/services/publik.service";
import { ArrowRight, Newspaper, BookOpen } from "lucide-react";
import ArticleCard from "@/app/components/tenant/ArticleCard";
import PrincipalWelcome from "@/app/components/tenant/PrincipalWelcome";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function unwrap(value) {
  let result = value;

  for (let i = 0; i < 8; i++) {
    if (
      !result ||
      typeof result !== "object" ||
      Array.isArray(result) ||
      !Object.prototype.hasOwnProperty.call(result, "data")
    ) {
      break;
    }

    result = result.data;
  }

  return result;
}

function text(value) {
  return typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : "";
}

function getField(item, ...keys) {
  for (const key of keys) {
    const value = text(item?.[key]);
    if (value) return value;
  }

  return "";
}

function normalizeKey(value) {
  return text(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function visible(item) {
  const status = normalizeKey(item?.status);

  return ![
    "nonaktif",
    "inactive",
    "draft",
    "arsip",
    "unpublished",
  ].includes(status);
}

const FOOTER_ONLY_SECTIONS = new Set([
  "footer",
  "identitas",
  "footeridentitas",
  "navigasi",
  "footernavigasi",
  "infoutama",
  "footerinfoutama",
  "sosmed",
  "footersosmed",
  "kontak",
  "footerkontak",
  "mediasosial",
  "socialmedia",
  "social",
]);

function isFooterOnlySection(item) {
  const section = normalizeKey(
    item?.section ??
      item?.jenisSection ??
      item?.tipeSection ??
      item?.kategori
  );

  const pageValues = [
    item?.halamanCms?.slug,
    item?.halamanCms?.nama,
    item?.halamanCms?.judul,
    item?.halamanSlug,
    item?.halaman,
  ]
    .map(normalizeKey)
    .filter(Boolean);

  if (FOOTER_ONLY_SECTIONS.has(section)) {
    return true;
  }

  if (pageValues.some((value) => ["footer", "kontak"].includes(value))) {
    return true;
  }

  return false;
}

function isArticleHeadingSection(item) {
  const section = normalizeKey(item?.section);

  const title = normalizeKey(
    getField(item, "judul", "title", "nama", "heading")
  );

  return (
    [
      "informasiterbaru",
      "artikelterbaru",
      "informasiartikel",
      "artikel",
    ].includes(section) ||
    [
      "informasiterbarusekolah",
      "artikelterbarusekolah",
      "informasidanartikelterbaru",
    ].includes(title)
  );
}

function isPrincipalWelcomeSection(item) {
  const section = normalizeKey(
    item?.section ??
      item?.jenisSection ??
      item?.tipeSection ??
      item?.kategori
  );

  return [
    "sambutankepalasekolah",
    "sambutankepsek",
    "sambutankepala",
    "welcomeschoolprincipal",
  ].includes(section);
}

function getPageList(response) {
  const result = unwrap(response);

  if (Array.isArray(result)) return result;

  for (const key of [
    "daftarCms",
    "halamanCms",
    "halaman",
    "pages",
    "items",
  ]) {
    if (Array.isArray(result?.[key])) {
      return result[key];
    }
  }

  return [];
}

function normalizeSectionList(value) {
  const result = unwrap(value);
  let items = [];

  if (Array.isArray(result)) {
    items = result;
  } else if (result && typeof result === "object") {
    for (const key of [
      "menuKonfigurasi",
      "konfigurasi",
      "sections",
      "section",
      "items",
    ]) {
      if (Array.isArray(result[key])) {
        items = result[key];
        break;
      }
    }

    if (!items.length) {
      const entries = Object.entries(result).filter(
        ([, item]) =>
          item &&
          typeof item === "object" &&
          !Array.isArray(item)
      );

      items = entries.map(([key, item]) => ({
        ...item,
        section: item.section ?? key,
      }));
    }
  }

  return items
    .filter(
      (item) =>
        item &&
        typeof item === "object" &&
        !Array.isArray(item) &&
        visible(item) &&
        !isFooterOnlySection(item)
    )
    .map((item, index) => ({
      ...item,
      section: text(item.section) || `section-${index + 1}`,
      urutan: Number(item.urutan ?? index + 1),
    }))
    .sort((a, b) => {
      const sectionA = normalizeKey(a.section);
      const sectionB = normalizeKey(b.section);

      if (sectionA === "hero" && sectionB !== "hero") return -1;
      if (sectionB === "hero" && sectionA !== "hero") return 1;

      return a.urutan - b.urutan;
    });
}

function findHomePage(pages) {
  return pages.find((page) => {
    const slug = normalizeKey(page.slug);
    const title = normalizeKey(page.judul ?? page.title);

    return (
      ["beranda", "home", "homepage"].includes(slug) ||
      ["beranda", "home", "homepage"].includes(title)
    );
  });
}

function findHomeSections(response, homePage) {
  const config = unwrap(response);

  if (!homePage || !config) return [];

  if (Array.isArray(config)) {
    const homeConfigs = config.filter((item) => {
      const configPageId =
        item?.halamanCmsId ??
        item?.halamanId ??
        item?.pageId;

      return (
        configPageId != null &&
        String(configPageId) === String(homePage.id)
      );
    });

    return normalizeSectionList(homeConfigs);
  }

  const candidates = [
    config[String(homePage.id)],
    config.konfigurasi?.[String(homePage.id)],
    config.data?.[String(homePage.id)],
    config.halamanCms?.[String(homePage.id)],
    config.halaman?.[String(homePage.id)],
  ];

  for (const candidate of candidates) {
    const sections = normalizeSectionList(candidate);

    if (sections.length) return sections;
  }

  const pages = getPageList(config);

  const matchingPage = pages.find(
    (page) => String(page.id) === String(homePage.id)
  );

  if (matchingPage) {
    return normalizeSectionList(
      matchingPage.menuKonfigurasi ??
        matchingPage.konfigurasi ??
        matchingPage.sections ??
        []
    );
  }

  return [];
}

function getArticles(response) {
  const result = unwrap(response);

  if (Array.isArray(result)) return result;

  for (const key of [
    "artikel",
    "artikels",
    "articles",
    "daftarArtikel",
    "items",
    "results",
  ]) {
    if (Array.isArray(result?.[key])) {
      return result[key];
    }
  }

  return [];
}

function getArticleDate(article) {
  return (
    article?.tanggalPublikasi ||
    article?.publishedAt ||
    article?.dibuatPada ||
    article?.createdAt ||
    article?.updatedAt ||
    ""
  );
}

function tenantLink(tenant, value) {
  const target = text(value);

  if (!target) return `/${tenant}/articles`;

  if (/^(https?:\/\/|mailto:|tel:)/i.test(target)) {
    return target;
  }

  const path = target.startsWith("/") ? target : `/${target}`;
  const prefix = `/${tenant}`;

  if (path === prefix || path.startsWith(`${prefix}/`)) {
    return path;
  }

  return `${prefix}${path === "/" ? "" : path}`;
}

/* ============================================================
   HERO
   ============================================================ */
function HeroSection({ item, tenant }) {
  const title = getField(item, "judul", "title", "nama", "heading");
  const subtitle = getField(item, "subJudul", "subjudul", "subtitle");
  const content = getField(item, "konten", "content", "deskripsi", "isi");
  const image = getField(item, "gambarUrl", "gambar", "gambarUtama", "imageUrl");
  const ctaText = getField(item, "ctaText", "teksTombol", "buttonText");
  const ctaLink = getField(item, "ctaLink", "tautan", "buttonLink");

  return (
    <section
      id="hero"
      className="relative isolate flex min-h-[560px] w-full items-center overflow-hidden bg-slate-950 px-5 py-24 sm:min-h-[620px] sm:px-10 sm:py-28 lg:min-h-[680px] lg:px-16"
    >
      {image && (
        <>
          <img
            src={image}
            alt={title || "Foto sekolah"}
            className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
            fetchPriority="high"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/85 via-slate-950/60 to-slate-950/30" />
        </>
      )}

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="max-w-3xl">
          {subtitle && (
            <p className="hero-fade mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-blue-100 sm:text-[13px]">
              {subtitle}
            </p>
          )}

          {title && (
            <h1 className="hero-fade hero-fade-delay-1 max-w-3xl break-words text-4xl font-bold leading-[1.15] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[68px]">
              {title}
            </h1>
          )}

          {content && (
            <p className="hero-fade hero-fade-delay-2 mt-6 max-w-2xl whitespace-pre-line break-words text-base leading-relaxed text-slate-200 sm:mt-7 sm:text-lg sm:leading-8">
              {content}
            </p>
          )}

          {ctaText && ctaLink && (
            <div className="hero-fade hero-fade-delay-3 mt-9 sm:mt-10">
              <Link
                href={tenantLink(tenant, ctaLink)}
                className="group/hero-cta inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition-colors duration-300 hover:bg-slate-100 sm:text-base"
              >
                {ctaText}
                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover/hero-cta:translate-x-0.5"
                />
              </Link>
            </div>
          )}
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes heroFade {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            .hero-fade {
              animation: heroFade 900ms ease-out both;
            }
            .hero-fade-delay-1 { animation-delay: 120ms; }
            .hero-fade-delay-2 { animation-delay: 240ms; }
            .hero-fade-delay-3 { animation-delay: 360ms; }
            @media (prefers-reduced-motion: reduce) {
              .hero-fade,
              .hero-fade-delay-1,
              .hero-fade-delay-2,
              .hero-fade-delay-3 {
                animation: none !important;
              }
            }
          `,
        }}
      />
    </section>
  );
}

/* ============================================================
   SECTION CMS UMUM
   ============================================================ */
function CmsSection({ item, tenant }) {
  const section = normalizeKey(item.section);

  if (
    !visible(item) ||
    isFooterOnlySection(item) ||
    isArticleHeadingSection(item) ||
    isPrincipalWelcomeSection(item)
  ) {
    return null;
  }

  const title = getField(item, "judul", "title", "nama", "heading");
  const subtitle = getField(item, "subJudul", "subjudul", "subtitle");
  const content = getField(item, "konten", "content", "deskripsi", "isi");
  const image = getField(item, "gambarUrl", "gambar", "gambarUtama", "imageUrl");
  const ctaText = getField(item, "ctaText", "teksTombol", "buttonText");
  const ctaLink = getField(item, "ctaLink", "tautan", "buttonLink");

  if (!(title || subtitle || content || image || ctaText)) {
    return null;
  }

  if (section === "hero") {
    return <HeroSection item={item} tenant={tenant} />;
  }

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      {image && (
        <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100">
          <img
            src={image}
            alt={title || "Informasi sekolah"}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        {subtitle && (
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-blue-700">
            {subtitle}
          </p>
        )}

        {title && (
          <h2 className="break-words text-xl font-bold leading-snug text-slate-900 sm:text-2xl">
            {title}
          </h2>
        )}

        {content && (
          <p className="mt-3 flex-1 whitespace-pre-line break-words text-sm leading-7 text-slate-600 sm:text-base">
            {content}
          </p>
        )}

        {ctaText && ctaLink && (
          <div className="mt-5">
            <Link
              href={tenantLink(tenant, ctaLink)}
              className="inline-flex items-center gap-2 font-semibold text-blue-700 transition hover:text-blue-900"
            >
              {ctaText}
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}

/* ============================================================
   KONTEN HALAMAN DARI CMS
   ============================================================ */
function MainPageContent({ page }) {
  const title = getField(page, "judul", "title");
  const content = getField(page, "konten", "content");

  if (!content) return null;

  return (
    <section
      id="konten-halaman"
      className="bg-white px-6 py-12 sm:px-10 sm:py-16 lg:px-12"
    >
      <div className="mx-auto w-full max-w-5xl">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
          {title && (
            <h2 className="mb-6 break-words text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
              {title}
            </h2>
          )}

          <div
            className="cms-page-content break-words text-base leading-8 text-slate-700"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>

      <style>{`
        .cms-page-content p {
          margin-bottom: 1rem;
        }

        .cms-page-content h1,
        .cms-page-content h2,
        .cms-page-content h3 {
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          font-weight: 700;
          line-height: 1.4;
          color: #0f172a;
        }

        .cms-page-content h1 { font-size: 1.875rem; }
        .cms-page-content h2 { font-size: 1.5rem; }
        .cms-page-content h3 { font-size: 1.25rem; }

        .cms-page-content ul {
          list-style: disc;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }

        .cms-page-content ol {
          list-style: decimal;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }

        .cms-page-content a {
          color: #1d4ed8;
          text-decoration: underline;
        }

        .cms-page-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem;
          margin: 1rem 0;
        }

        .cms-page-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }

        .cms-page-content th,
        .cms-page-content td {
          border: 1px solid #e2e8f0;
          padding: 0.75rem;
          text-align: left;
        }
      `}</style>
    </section>
  );
}

/* ============================================================
   HOMEPAGE TENANT
   ============================================================ */
export default async function TenantHomePage({ params }) {
  const { tenant } = await params;

  if (!tenant) notFound();

  const [profileResult, configResult, articlesResult] =
    await Promise.allSettled([
      publikService.getProfil(tenant),
      publikService.getKonfigurasi(tenant),
      publikService.getArtikel(tenant),
    ]);

  const profile =
    profileResult.status === "fulfilled"
      ? unwrap(profileResult.value)
      : null;

  const pages = getPageList(profile);
  const homePage = findHomePage(pages);

  // Konten Halaman utama dari CMS
  const homePageContent = getField(
    homePage,
    "konten",
    "content"
  );

  const sections =
    configResult.status === "fulfilled"
      ? findHomeSections(configResult.value, homePage)
      : [];

  const informationSection = sections.find(isArticleHeadingSection);

  const heroSections = sections.filter(
    (item) => normalizeKey(item.section) === "hero"
  );

  const welcomeSections = sections.filter(
    (item) => isPrincipalWelcomeSection(item) && visible(item)
  );

  const contentSections = sections.filter(
    (item) =>
      normalizeKey(item.section) !== "hero" &&
      !isPrincipalWelcomeSection(item) &&
      !isArticleHeadingSection(item) &&
      !isFooterOnlySection(item)
  );

  const articles =
    articlesResult.status === "fulfilled"
      ? getArticles(articlesResult.value)
          .filter(
            (item) =>
              item &&
              typeof item === "object" &&
              visible(item)
          )
          .sort((a, b) => {
            const dateA =
              new Date(getArticleDate(a)).getTime() || 0;
            const dateB =
              new Date(getArticleDate(b)).getTime() || 0;

            return dateB - dateA;
          })
          .slice(0, 3)
      : [];

  const infoTitle =
    getField(informationSection, "judul", "title") ||
    "Artikel Terbaru Sekolah";

  const infoSubtitle =
    getField(
      informationSection,
      "subJudul",
      "subjudul",
      "subtitle"
    ) || "Artikel Sekolah";

  const infoContent =
    getField(
      informationSection,
      "konten",
      "content",
      "deskripsi"
    ) || "Informasi, kegiatan, prestasi, dan berita terbaru sekolah.";

  const infoButton =
    getField(
      informationSection,
      "ctaText",
      "teksTombol",
      "buttonText"
    ) || "Lihat Semua Artikel";

  const infoLink = tenantLink(
    tenant,
    getField(
      informationSection,
      "ctaLink",
      "tautan",
      "buttonLink"
    ) || "/articles"
  );

  return (
    <main className="min-h-screen w-full bg-white">
      {/* HERO */}
      {heroSections.length > 0 ? (
        heroSections.map((item, index) => (
          <CmsSection
            key={item.id ?? `hero-${index}`}
            item={item}
            tenant={tenant}
          />
        ))
      ) : (
        <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-slate-950 px-6 py-24 text-center">
          <div className="relative max-w-3xl">
            <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <BookOpen size={32} className="text-blue-300" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Selamat Datang
            </h1>
            <p className="mx-auto mt-6 max-w-xl leading-8 text-slate-300">
              Informasi sekolah, kegiatan, dan berita terbaru dapat
              dilihat melalui website resmi sekolah ini.
            </p>
          </div>
        </section>
      )}

      {/* SAMBUTAN KEPALA SEKOLAH */}
      {welcomeSections.map((item, index) => (
        <PrincipalWelcome
          key={item.id ?? `sambutan-kepala-sekolah-${index}`}
          item={item}
        />
      ))}

      {/* KONTEN HALAMAN DARI CMS */}
      {homePageContent && <MainPageContent page={homePage} />}

      {/* SECTION CMS LAINNYA */}
      {contentSections.length > 0 && (
        <section
          id="konten-sekolah"
          className="bg-slate-50 px-6 py-12 sm:px-10 sm:py-16 lg:px-12"
        >
          <div className="mx-auto w-full max-w-7xl">
            <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {contentSections.map((item, index) => (
                <CmsSection
                  key={item.id ?? `${item.section}-${index}`}
                  item={item}
                  tenant={tenant}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ARTIKEL TERBARU */}
      <section
        id="artikel-terbaru"
        className="bg-white px-6 py-16 sm:px-10 sm:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="mb-3 text-sm font-bold uppercase tracking-widest text-blue-700">
                {infoSubtitle}
              </p>
              <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
                {infoTitle}
              </h2>
              <p className="mt-4 leading-7 text-slate-600">
                {infoContent}
              </p>
            </div>
            <Link
              href={infoLink}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              {infoButton}
              <ArrowRight size={16} />
            </Link>
          </div>

          {articles.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article, index) => (
                <ArticleCard
                  key={
                    article.id ??
                    article.slug ??
                    `artikel-${index}`
                  }
                  artikel={article}
                  subdomain={tenant}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
              <Newspaper
                size={48}
                className="mx-auto mb-4 text-slate-300"
              />
              <h3 className="text-xl font-bold text-slate-800">
                Belum Ada Artikel Terbaru
              </h3>
              <p className="mt-3 text-slate-500">
                Artikel akan muncul di sini setelah dipublikasikan
                melalui CMS.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
