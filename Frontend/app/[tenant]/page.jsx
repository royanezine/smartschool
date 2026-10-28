import { publikService } from "@/services/publik.service";
import Link from "next/link";
import { ArrowRight, Newspaper, BookOpen, CheckCircle2 } from "lucide-react";
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

function getText(value) {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return "";
}

function getValue(item, ...keys) {
  for (const key of keys) {
    const value = getText(item?.[key]);

    if (value.trim()) return value;
  }

  return "";
}


function normalizeSections(response) {
  const config = unwrap(response);

  if (!config || typeof config !== "object") {
    return [];
  }

  // Mendukung struktur response konfigurasi publik.
  const beranda =
    config?.beranda ??
    config?.Beranda ??
    config?.home ??
    config?.homepage ??
    config?.konfigurasi?.beranda ??
    config?.konfigurasi?.home;

  if (!beranda || typeof beranda !== "object") {
    return [];
  }

  const sections = Array.isArray(beranda)
    ? beranda
    : Object.entries(beranda).map(([key, item]) => ({
        ...item,
        section: item?.section ?? key,
      }));

  return sections
    .filter(
      (item) =>
        item &&
        typeof item === "object" &&
        String(item.status ?? "aktif").toLowerCase() !== "nonaktif"
    )
    .map((item, index) => ({
      ...item,
      section: String(item.section ?? `section-${index + 1}`)
        .trim()
        .toLowerCase(),
      urutan: Number(item.urutan ?? item.order ?? index + 1),
    }))
    .sort((a, b) => {
      const aHero = a.section === "hero";
      const bHero = b.section === "hero";

      if (aHero && !bHero) return -1;
      if (!aHero && bHero) return 1;

      return a.urutan - b.urutan;
    });
}


function getArticles(response) {
  const result = unwrap(response);

  if (Array.isArray(result)) return result;
  if (!result || typeof result !== "object") return [];

  for (const key of [
    "artikel",
    "artikels",
    "articles",
    "daftarArtikel",
    "items",
    "results",
  ]) {
    if (Array.isArray(result[key])) return result[key];
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

const themeStyles = {
  primary: { color: "var(--school-primary, #2563EB)" },
  primaryBackground: { backgroundColor: "var(--school-primary, #2563EB)" },
  accentBackground: { backgroundColor: "var(--school-accent, #F59E0B)" },
  text: { color: "var(--school-text, #0F172A)" },
  mutedText: { color: "var(--school-secondary, #64748B)" },
};

function SectionItem({ item }) {
  const sectionName = String(item.section || "").toLowerCase();

  const title = getValue(item, "judul", "title", "nama", "heading", "label");
  const subtitle = getValue(
    item,
    "subJudul",
    "subjudul",
    "subtitle",
    "sub_title"
  );
  const content = getValue(
    item,
    "konten",
    "content",
    "deskripsi",
    "deskripsiSection",
    "isi",
    "text",
    "value"
  );
  const image = getValue(
    item,
    "gambarUrl",
    "gambar",
    "gambarUtama",
    "image",
    "imageUrl",
    "urlGambar"
  );
  const ctaText = getValue(
    item,
    "ctaText",
    "teksTombol",
    "buttonText",
    "tombolText"
  );
  const ctaLink = getValue(
    item,
    "ctaLink",
    "tautan",
    "buttonLink",
    "urlTombol"
  );

  const sectionId = sectionName.replace(/[^a-z0-9-_]/g, "-");

  if (!title && !subtitle && !content && !image && !ctaText) {
    return null;
  }

  const isHero = sectionName === "hero";

  if (isHero) {
    return (
      <section
        id={sectionId || "hero"}
        className="relative flex min-h-[90vh] w-full items-center justify-center overflow-hidden bg-slate-900 pt-32 pb-20 sm:pb-28"
      >
        {image && (
          <div className="absolute inset-0 h-full w-full">
            <img
              src={image}
              alt={title || "Foto sekolah"}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-50" />
          </div>
        )}

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-start px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            {subtitle && (
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md">
                <span
                  className="h-2 w-2 rounded-full animate-pulse"
                  style={{
                    backgroundColor: "var(--school-primary, #3B82F6)",
                  }}
                />
                {subtitle}
              </div>
            )}

            {title && (
              <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl drop-shadow-lg">
                {title}
              </h1>
            )}

            {content && (
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-200 sm:text-xl drop-shadow-md">
                {content}
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm font-medium text-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={18}
                  style={{ color: "var(--school-primary, #10B981)" }}
                />
                Akreditasi A
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={18}
                  style={{ color: "var(--school-primary, #10B981)" }}
                />
                Fasilitas Modern
              </div>
            </div>

            {ctaText && ctaLink && (
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  href={ctaLink}
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-sm font-bold text-white shadow-xl transition hover:opacity-90 hover:-translate-y-0.5"
                  style={{
                    backgroundColor: "var(--school-primary, #2563EB)",
                    boxShadow:
                      "0 10px 25px -5px var(--school-primary, rgba(37, 99, 235, 0.5))",
                  }}
                >
                  {ctaText} <ArrowRight size={18} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id={sectionId}
      className="w-full border-t px-6 py-20 sm:px-8 sm:py-28"
      style={{
        backgroundColor: "var(--school-surface, #FFFFFF)",
        borderColor: "var(--school-border, #E2E8F0)",
      }}
    >
      <div
        className={`mx-auto grid max-w-6xl gap-12 sm:gap-16 ${
          image ? "md:grid-cols-2 md:items-center" : ""
        }`}
      >
        <div className="min-w-0">
          {subtitle && (
            <div className="mb-4 flex items-center gap-3">
              <span
                className="h-1 w-8 rounded-full"
                style={themeStyles.accentBackground}
              />
              <p
                className="text-sm font-bold uppercase tracking-widest"
                style={themeStyles.primary}
              >
                {subtitle}
              </p>
            </div>
          )}

          {title && (
            <h2
              className="text-3xl font-extrabold tracking-tight sm:text-4xl"
              style={themeStyles.text}
            >
              {title}
            </h2>
          )}

          {content && (
            <p
              className="mt-5 whitespace-pre-line text-base leading-relaxed sm:text-lg"
              style={themeStyles.mutedText}
            >
              {content}
            </p>
          )}

          {ctaText && ctaLink && (
            <div className="mt-8">
              <Link
                href={ctaLink}
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white transition hover:opacity-90"
                style={themeStyles.primaryBackground}
              >
                {ctaText} <ArrowRight size={17} />
              </Link>
            </div>
          )}
        </div>

        {image && (
          <div
            className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-xl"
            style={{ border: "1px solid var(--school-border, #E2E8F0)" }}
          >
            <img
              src={image}
              alt={title || "Informasi sekolah"}
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              loading="lazy"
            />
          </div>
        )}
      </div>
    </section>
  );
}

function getTenantArticleLink(tenant, link) {
  const target = link.trim();

  if (!target) return `/${tenant}/articles`;

  // URL eksternal tetap digunakan sebagaimana dikonfigurasi.
  if (/^(https?:\/\/|mailto:|tel:)/i.test(target)) {
    return target;
  }

  // Pertahankan subdomain pada navigasi website sekolah.
  const path = target.startsWith("/") ? target : `/${target}`;
  const tenantPrefix = `/${tenant}`;

  if (path === tenantPrefix || path.startsWith(`${tenantPrefix}/`)) {
    return path;
  }

  return `${tenantPrefix}${path === "/" ? "" : path}`;
}

export default async function TenantHomePage({ params }) {
  const resolvedParams = await params;
  const tenant = resolvedParams?.tenant;

  if (!tenant) {
    return (
      <section className="flex min-h-screen items-center justify-center px-5 pt-32">
        <div className="text-center">
          <BookOpen size={48} className="mx-auto mb-4 text-slate-300" />
          <h1 className="text-2xl font-bold text-slate-900">
            Subdomain sekolah tidak ditemukan
          </h1>
          <p className="mt-2 text-slate-500">
            Pastikan alamat website sekolah sudah benar.
          </p>
        </div>
      </section>
    );
  }

  const [konfigurasiResult, artikelResult] = await Promise.allSettled([
    publikService.getKonfigurasi(tenant),
    publikService.getArtikel(tenant),
  ]);

  const sections =
    konfigurasiResult.status === "fulfilled"
      ? normalizeSections(konfigurasiResult.value)
      : [];

  const articles =
    artikelResult.status === "fulfilled"
      ? getArticles(artikelResult.value)
          .filter((item) => item && typeof item === "object")
          .sort((a, b) => {
            const dateA = new Date(getArticleDate(a)).getTime() || 0;
            const dateB = new Date(getArticleDate(b)).getTime() || 0;
            return dateB - dateA;
          })
          .slice(0, 3)
      : [];

  // Ambil konfigurasi section informasi dari data CMS.
  const informasiConfig = sections.find(
    (item) =>
      String(item.section || "").toLowerCase() === "informasi-terbaru"
  );

  const informasiTitle =
    getValue(informasiConfig, "judul", "title") ||
    "Informasi & Artikel Terbaru";

  const informasiSubtitle =
    getValue(informasiConfig, "subJudul", "subjudul", "subtitle") ||
    "Kabar Sekolah";

  const informasiContent =
    getValue(informasiConfig, "konten", "content", "deskripsi") ||
    "Ikuti informasi, kegiatan, prestasi, dan artikel terbaru yang dipublikasikan oleh sekolah.";

  const informasiCtaText =
    getValue(informasiConfig, "ctaText", "teksTombol", "buttonText") ||
    "Lihat Semua";

  const informasiCtaLink = getTenantArticleLink(
    tenant,
    getValue(informasiConfig, "ctaLink", "tautan", "buttonLink") ||
      "/articles"
  );

  // Jangan menghapus informasi-terbaru. Semua section konfigurasi dirender.
  const visibleSections = sections;

  return (
    <main className="min-h-screen w-full bg-white">
      {visibleSections.length > 0 ? (
        visibleSections.map((item, index) => (
          <SectionItem key={`${item.section}-${index}`} item={item} />
        ))
      ) : (
        <section className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-6 pt-32 pb-20 text-center">
          <div className="max-w-2xl">
            <BookOpen size={56} className="mx-auto mb-5 text-blue-600" />
            <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl">
              Selamat Datang
            </h1>
            <p className="mt-5 leading-relaxed text-slate-600">
              Informasi sekolah, kegiatan, dan berita terbaru dapat dilihat
              melalui website resmi sekolah ini.
            </p>
          </div>
        </section>
      )}

      <section
        id="artikel-terbaru"
        className="w-full bg-slate-50 px-6 py-20 sm:px-8 sm:py-28"
        style={{ borderColor: "var(--school-border, #E2E8F0)" }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 flex items-center gap-3">
                <span
                  className="h-1 w-8 rounded-full"
                  style={themeStyles.accentBackground}
                />
                <span
                  className="text-sm font-bold uppercase tracking-widest"
                  style={themeStyles.primary}
                >
                  {informasiSubtitle}
                </span>
              </div>

              <h2
                className="text-3xl font-extrabold tracking-tight sm:text-4xl"
                style={themeStyles.text}
              >
                {informasiTitle}
              </h2>

              <p
                className="mt-4 text-base leading-relaxed"
                style={themeStyles.mutedText}
              >
                {informasiContent}
              </p>
            </div>

            <Link
              href={informasiCtaLink}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border bg-white px-6 py-3 text-sm font-bold shadow-sm transition hover:-translate-y-0.5"
              style={{
                color: "var(--school-primary, #2563EB)",
                borderColor: "var(--school-border, #E2E8F0)",
              }}
            >
              {informasiCtaText} <ArrowRight size={16} />
            </Link>
          </div>

          {articles.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((artikel, index) => (
                <ArticleCard
                  key={
                    artikel.id ??
                    artikel.slug ??
                    artikel.slugArtikel ??
                    `artikel-${index}`
                  }
                  artikel={artikel}
                  subdomain={tenant}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
              <Newspaper size={56} className="mx-auto mb-4 text-slate-300" />
              <h3 className="text-xl font-bold text-slate-800">
                Belum Ada Artikel Terbaru
              </h3>
              <p className="mx-auto mt-3 max-w-md text-slate-500">
                Artikel akan ditampilkan di sini setelah tersedia dan
                dipublikasikan melalui CMS sekolah.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}