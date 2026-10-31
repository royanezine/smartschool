
import Link from "next/link";
import { publikService } from "@/services/publik.service";
import { ArrowRight, Newspaper, BookOpen } from "lucide-react";
import ArticleCard from "@/app/components/tenant/ArticleCard";

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

function visible(item) {
  const status = text(item?.status).toLowerCase();
  return status !== "nonaktif" && status !== "draft";
}

function getPageList(response) {
  const result = unwrap(response);

  if (Array.isArray(result)) return result;

  for (const key of ["daftarCms", "halamanCms", "halaman", "pages", "items"]) {
    if (Array.isArray(result?.[key])) return result[key];
  }

  return [];
}

function normalizeSectionList(value) {
  const result = unwrap(value);
  let items = [];

  if (Array.isArray(result)) {
    items = result;
  } else if (result && typeof result === "object") {
    for (const key of ["menuKonfigurasi", "sections", "section", "items"]) {
      if (Array.isArray(result[key])) {
        items = result[key];
        break;
      }
    }

    if (!items.length) {
      const values = Object.values(result);

      if (
        values.length > 0 &&
        values.every((item) => item && typeof item === "object")
      ) {
        items = values.map((item, index) => ({
          ...item,
          section: item.section ?? Object.keys(result)[index],
        }));
      }
    }
  }

  return items
    .filter(
      (item) =>
        item &&
        typeof item === "object" &&
        visible(item)
    )
    .map((item, index) => ({
      ...item,
      section: text(item.section).toLowerCase() || `section-${index + 1}`,
      urutan: Number(item.urutan ?? index + 1),
    }))
    .sort((a, b) => {
      if (a.section === "hero" && b.section !== "hero") return -1;
      if (b.section === "hero" && a.section !== "hero") return 1;
      return a.urutan - b.urutan;
    });
}

function findHomePage(pages) {
  return pages.find((page) => {
    const slug = text(page.slug).toLowerCase();
    const title = text(page.judul ?? page.title).toLowerCase();

    return (
      ["beranda", "home", "homepage"].includes(slug) ||
      ["beranda", "home"].includes(title)
    );
  });
}

function findHomeSections(response, homePage) {
  const config = unwrap(response);

  if (!homePage || !config) return [];

  // Bentuk response berupa daftar konfigurasi langsung.
  if (Array.isArray(config)) {
    return normalizeSectionList(
      config.filter(
        (item) => item.halamanCmsId === homePage.id
      )
    );
  }

  // Bentuk response dikelompokkan berdasarkan halamanCmsId.
  const candidates = [
    config[homePage.id],
    config.konfigurasi?.[homePage.id],
    config.data?.[homePage.id],
    config.halamanCms?.[homePage.id],
    config.halaman?.[homePage.id],
  ];

  for (const candidate of candidates) {
    const sections = normalizeSectionList(candidate);
    if (sections.length) return sections;
  }

  // Bentuk response berupa daftar halaman yang memiliki menuKonfigurasi.
  const pages = getPageList(config);
  const matchingPage = pages.find((page) => page.id === homePage.id);

  if (matchingPage) {
    return normalizeSectionList(
      matchingPage.menuKonfigurasi ??
      matchingPage.konfigurasi ??
      matchingPage.sections ??
      []
    );
  }

  // Jangan mengambil konfigurasi halaman lain secara sembarangan.
  return [];
}

function getArticles(response) {
  const result = unwrap(response);

  if (Array.isArray(result)) return result;

  for (const key of ["artikel", "artikels", "articles", "daftarArtikel", "items", "results"]) {
    if (Array.isArray(result?.[key])) return result[key];
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
  if (/^(https?:\/\/|mailto:|tel:)/i.test(target)) return target;

  const path = target.startsWith("/") ? target : `/${target}`;
  const prefix = `/${tenant}`;

  if (path === prefix || path.startsWith(`${prefix}/`)) return path;

  return `${prefix}${path === "/" ? "" : path}`;
}

function CmsSection({ item, tenant }) {
  const section = text(item.section).toLowerCase();
  const title = getField(item, "judul", "title", "nama", "heading");
  const subtitle = getField(item, "subJudul", "subjudul", "subtitle");
  const content = getField(item, "konten", "content", "deskripsi", "isi");
  const image = getField(item, "gambarUrl", "gambar", "gambarUtama", "imageUrl");
  const ctaText = getField(item, "ctaText", "teksTombol", "buttonText");
  const ctaLink = getField(item, "ctaLink", "tautan", "buttonLink");
  const hero = section === "hero";

  if (!visible(item) || !(title || subtitle || content || image || ctaText)) {
    return null;
  }

  return (
    <section
      id={section.replace(/[^a-z0-9_-]/g, "-")}
      className={
        hero
          ? "relative flex min-h-[75vh] items-center overflow-hidden bg-slate-900 px-6 py-24 sm:px-10 lg:px-16"
          : "border-t border-slate-200 bg-white px-6 py-16 sm:px-10 sm:py-20"
      }
    >
      {hero && image && (
        <>
          <img
            src={image}
            alt={title || "Foto sekolah"}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/55 to-transparent" />
        </>
      )}

      <div
        className={
          hero
            ? "relative z-10 mx-auto w-full max-w-7xl"
            : "mx-auto grid w-full max-w-6xl gap-10 md:grid-cols-2 md:items-center"
        }
      >
        <div className="min-w-0">
          {subtitle && (
            <p
              className={
                hero
                  ? "mb-4 text-sm font-bold uppercase tracking-widest text-blue-200"
                  : "mb-4 text-sm font-bold uppercase tracking-widest text-blue-700"
              }
            >
              {subtitle}
            </p>
          )}

          {title && (
            <h2
              className={
                hero
                  ? "text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl"
                  : "text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl"
              }
            >
              {title}
            </h2>
          )}

          {content && (
            <p
              className={
                hero
                  ? "mt-6 max-w-3xl whitespace-pre-line text-lg leading-8 text-slate-100"
                  : "mt-5 whitespace-pre-line text-base leading-8 text-slate-600"
              }
            >
              {content}
            </p>
          )}

          {ctaText && ctaLink && (
            <Link
              href={tenantLink(tenant, ctaLink)}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white hover:bg-blue-700"
            >
              {ctaText} <ArrowRight size={17} />
            </Link>
          )}
        </div>

        {!hero && image && (
          <img
            src={image}
            alt={title || "Informasi sekolah"}
            className="max-h-[420px] w-full rounded-2xl border border-slate-200 object-cover"
            loading="lazy"
          />
        )}
      </div>
    </section>
  );
}

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

  const sections =
    configResult.status === "fulfilled"
      ? findHomeSections(configResult.value, homePage)
      : [];

  const articles =
    articlesResult.status === "fulfilled"
      ? getArticles(articlesResult.value)
          .filter((item) => item && typeof item === "object" && visible(item))
          .sort((a, b) => {
            const dateA = new Date(getArticleDate(a)).getTime() || 0;
            const dateB = new Date(getArticleDate(b)).getTime() || 0;
            return dateB - dateA;
          })
          .slice(0, 3)
      : [];

  const informationSection = sections.find(
    (item) => item.section === "informasi-terbaru"
  );

  const infoTitle =
    getField(informationSection, "judul", "title") ||
    "Informasi & Artikel Terbaru";

  const infoSubtitle =
    getField(informationSection, "subJudul", "subjudul", "subtitle") ||
    "Kabar Sekolah";

  const infoContent =
    getField(informationSection, "konten", "content", "deskripsi") ||
    "Ikuti informasi, kegiatan, prestasi, dan artikel terbaru sekolah.";

  const infoButton =
    getField(informationSection, "ctaText", "teksTombol", "buttonText") ||
    "Lihat Semua";

  const infoLink = tenantLink(
    tenant,
    getField(informationSection, "ctaLink", "tautan", "buttonLink") ||
      "/articles"
  );

  return (
    <main className="min-h-screen w-full bg-white">
      {sections.length ? (
        sections.map((item, index) => (
          <CmsSection
            key={item.id ?? `${item.section}-${index}`}
            item={item}
            tenant={tenant}
          />
        ))
      ) : (
        <section className="flex min-h-[65vh] items-center justify-center bg-slate-50 px-6 py-20 text-center">
          <div className="max-w-2xl">
            <BookOpen size={52} className="mx-auto mb-5 text-blue-600" />
            <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl">
              Selamat Datang
            </h1>
            <p className="mt-5 leading-8 text-slate-600">
              Informasi sekolah, kegiatan, dan berita terbaru dapat dilihat
              melalui website resmi sekolah ini.
            </p>
          </div>
        </section>
      )}

      <section
        id="artikel-terbaru"
        className="bg-slate-50 px-6 py-16 sm:px-10 sm:py-20"
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
              <p className="mt-4 leading-7 text-slate-600">{infoContent}</p>
            </div>

            <Link
              href={infoLink}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-blue-700 hover:bg-blue-50"
            >
              {infoButton} <ArrowRight size={16} />
            </Link>
          </div>

          {articles.length ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article, index) => (
                <ArticleCard
                  key={article.id ?? article.slug ?? `artikel-${index}`}
                  artikel={article}
                  subdomain={tenant}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white px-6 py-14 text-center">
              <Newspaper size={48} className="mx-auto mb-4 text-slate-300" />
              <h3 className="text-xl font-bold text-slate-800">
                Belum Ada Artikel Terbaru
              </h3>
              <p className="mt-3 text-slate-500">
                Artikel akan muncul di sini setelah dipublikasikan melalui CMS.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
