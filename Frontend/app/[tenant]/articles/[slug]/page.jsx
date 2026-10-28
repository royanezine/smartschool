import Link from "next/link";
import { notFound } from "next/navigation";
import { publikService } from "@/services/publik.service";
import {
  ArrowLeft,
  CalendarDays,
  User,
  Tag,
  AlertCircle,
  Newspaper,
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

function unwrapResponse(value) {
  let result = value;

  for (let i = 0; i < 6; i += 1) {
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
  const data = unwrapResponse(response);

  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];

  const candidates = [
    data.artikel,
    data.articles,
    data.items,
    data.results,
    data.data,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;

    if (candidate && typeof candidate === "object") {
      const nested = normalizeArticles(candidate);
      if (nested.length > 0) return nested;
    }
  }

  return [];
}

function formatTanggal(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function getArticleImage(article) {
  return (
    article?.gambarUtama ||
    article?.gambarUrl ||
    article?.gambar_utama ||
    article?.gambar_url ||
    article?.imageUrl ||
    article?.image_url ||
    null
  );
}

function getArticleCategory(article) {
  const category =
    article?.kategoriArtikel ??
    article?.kategori_artikel ??
    article?.kategori ??
    article?.category;

  if (typeof category === "string") return category;
  return category?.nama ?? category?.name ?? "";
}

function getArticleDate(article) {
  return (
    article?.tanggalPublikasi ||
    article?.tanggal_publikasi ||
    article?.dipublikasikanPada ||
    article?.dibuatPada ||
    article?.createdAt ||
    article?.created_at ||
    null
  );
}

function getArticleAuthor(article) {
  return (
    article?.penulis?.nama ||
    article?.penulis?.name ||
    article?.author?.nama ||
    article?.author?.name ||
    article?.namaPenulis ||
    article?.nama_penulis ||
    article?.penulis ||
    article?.author ||
    "Admin Sekolah"
  );
}

function ErrorState({ title, description, children }) {
  return (
    <main
      className="flex min-h-[70vh] items-center justify-center px-6 py-28"
      style={{
        backgroundColor: theme.background,
        color: theme.text,
      }}
    >
      <div
        className="w-full max-w-md rounded-3xl border p-8 text-center shadow-sm"
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.border,
        }}
      >
        <div
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
          style={{
            backgroundColor: `color-mix(in srgb, ${theme.accent} 12%, ${theme.surface})`,
            color: theme.accent,
          }}
        >
          <AlertCircle size={40} />
        </div>

        <h1 className="text-2xl font-bold" style={{ color: theme.text }}>
          {title}
        </h1>

        <p className="mt-3 leading-relaxed" style={{ color: theme.secondary }}>
          {description}
        </p>

        {children}
      </div>
    </main>
  );
}

export default async function DetailArtikelPage({ params }) {
  const resolvedParams = await params;
  const tenant = resolvedParams?.tenant;
  const slug = resolvedParams?.slug;

  if (!tenant || !slug) notFound();

  let article = null;

  try {
    const response = await publikService.getArtikel(tenant);
    const articles = normalizeArticles(response);

    article =
      articles.find(
        (item) =>
          item &&
          typeof item.slug === "string" &&
          item.slug === slug
      ) ?? null;
  } catch (error) {
    console.error("[DETAIL ARTIKEL PUBLIK] Gagal mengambil artikel:", error);

    return (
      <ErrorState
        title="Artikel belum dapat dimuat"
        description="Data artikel gagal diambil dari server. Pastikan backend aktif dan koneksi ke API berjalan dengan baik."
      >
        <Link
          href={`/${tenant}/articles`}
          className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition"
          style={{
            backgroundColor: theme.primary,
            color: "#FFFFFF",
          }}
        >
          <ArrowLeft size={16} />
          Kembali ke Artikel
        </Link>
      </ErrorState>
    );
  }

  if (!article) notFound();

  const title = article.judul || article.title || "Artikel sekolah";
  const image = getArticleImage(article);
  const category = getArticleCategory(article);
  const date = formatTanggal(getArticleDate(article));
  const author = getArticleAuthor(article);

  const summary =
    article.ringkasan ||
    article.excerpt ||
    article.deskripsi ||
    article.description ||
    "";

  const content =
    article.konten ||
    article.content ||
    article.isi ||
    "";

  return (
    <main
      className="min-h-screen pb-24 pt-28"
      style={{
        backgroundColor: theme.background,
        color: theme.text,
      }}
    >
      {/* HEADER ARTIKEL */}
      <section
        className="relative isolate overflow-hidden py-16 sm:py-20"
        style={{
          backgroundColor: theme.primary,
          color: "#FFFFFF",
        }}
      >
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div
            className="absolute -left-1/4 -top-1/4 h-full w-1/2 rounded-full blur-3xl"
            style={{
              backgroundColor: theme.accent,
              opacity: 0.25,
            }}
          />

          <div
            className="absolute -right-1/4 bottom-0 h-full w-1/2 rounded-full blur-3xl"
            style={{
              backgroundColor: theme.secondary,
              opacity: 0.35,
            }}
          />

          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(120deg, transparent 20%, rgba(255,255,255,0.08) 50%, transparent 80%)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-4xl px-6">
          <Link
            href={`/${tenant}/articles`}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition"
            style={{
              borderColor: "rgba(255,255,255,0.3)",
              backgroundColor: "rgba(255,255,255,0.12)",
              color: "#FFFFFF",
            }}
          >
            <ArrowLeft size={16} />
            Kembali ke Daftar Artikel
          </Link>

          <div className="mt-8 text-center">
            {category && (
              <span
                className="mb-5 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
                style={{
                  backgroundColor: `color-mix(in srgb, ${theme.accent} 25%, transparent)`,
                  color: "#FFFFFF",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <Tag size={14} />
                {category}
              </span>
            )}

            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
              {title}
            </h1>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm text-white/80">
              {date && (
                <span className="inline-flex items-center gap-2">
                  <CalendarDays size={16} style={{ color: theme.accent }} />
                  {date}
                </span>
              )}

              <span className="inline-flex items-center gap-2">
                <User size={16} style={{ color: theme.accent }} />
                {typeof author === "string" ? author : "Admin Sekolah"}
              </span>
            </div>

            <div
              className="mx-auto mt-8 h-1.5 w-24 rounded-full"
              style={{ backgroundColor: theme.accent }}
            />
          </div>
        </div>
      </section>

      {/* KONTEN ARTIKEL */}
      <section className="relative z-10 mx-auto -mt-8 max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* KONTEN UTAMA */}
          <article className="min-w-0">
            {image && (
              <figure
                className="mb-8 overflow-hidden rounded-3xl border shadow-lg"
                style={{
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                }}
              >
                <img
                  src={image}
                  alt={title}
                  className="aspect-video h-full w-full object-cover"
                />
              </figure>
            )}

            <div
              className="rounded-3xl border p-6 shadow-sm sm:p-10"
              style={{
                backgroundColor: theme.surface,
                borderColor: theme.border,
                color: theme.text,
              }}
            >
              {summary && (
                <div
                  className="mb-8 rounded-r-xl border-l-4 py-3 pl-5 pr-3"
                  style={{
                    borderColor: theme.primary,
                    backgroundColor: `color-mix(in srgb, ${theme.primary} 5%, ${theme.surface})`,
                  }}
                >
                  <p
                    className="text-lg font-medium italic leading-relaxed"
                    style={{ color: theme.secondary }}
                  >
                    “{summary}”
                  </p>
                </div>
              )}

              {content ? (
                <div
                  className="article-content max-w-none"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              ) : !summary ? (
                <div className="py-10 text-center">
                  <Newspaper
                    size={40}
                    className="mx-auto mb-4"
                    style={{ color: theme.secondary }}
                  />
                  <p style={{ color: theme.secondary }}>
                    Konten artikel ini belum tersedia.
                  </p>
                </div>
              ) : null}
            </div>
          </article>

          {/* SIDEBAR INFORMASI */}
          <aside className="min-w-0">
            <div
              className="space-y-6 rounded-2xl border p-6 shadow-sm lg:sticky lg:top-28"
              style={{
                backgroundColor: theme.surface,
                borderColor: theme.border,
              }}
            >
              <h2
                className="border-b pb-4 text-sm font-bold uppercase tracking-widest"
                style={{
                  color: theme.text,
                  borderColor: theme.border,
                }}
              >
                Informasi Artikel
              </h2>

              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div
                    className="mt-0.5 rounded-lg p-2"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${theme.primary} 10%, ${theme.surface})`,
                      color: theme.primary,
                    }}
                  >
                    <CalendarDays size={18} />
                  </div>

                  <div className="min-w-0">
                    <p
                      className="text-xs font-semibold"
                      style={{ color: theme.secondary }}
                    >
                      Diterbitkan
                    </p>
                    <p
                      className="mt-1 break-words text-sm font-medium"
                      style={{ color: theme.text }}
                    >
                      {date || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div
                    className="mt-0.5 rounded-lg p-2"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${theme.primary} 10%, ${theme.surface})`,
                      color: theme.primary,
                    }}
                  >
                    <User size={18} />
                  </div>

                  <div className="min-w-0">
                    <p
                      className="text-xs font-semibold"
                      style={{ color: theme.secondary }}
                    >
                      Penulis
                    </p>
                    <p
                      className="mt-1 break-words text-sm font-medium"
                      style={{ color: theme.text }}
                    >
                      {typeof author === "string" ? author : "Admin Sekolah"}
                    </p>
                  </div>
                </div>

                {category && (
                  <div className="flex items-start gap-3">
                    <div
                      className="mt-0.5 rounded-lg p-2"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${theme.primary} 10%, ${theme.surface})`,
                        color: theme.primary,
                      }}
                    >
                      <Tag size={18} />
                    </div>

                    <div className="min-w-0">
                      <p
                        className="text-xs font-semibold"
                        style={{ color: theme.secondary }}
                      >
                        Kategori
                      </p>
                      <p
                        className="mt-1 break-words text-sm font-medium"
                        style={{ color: theme.text }}
                      >
                        {category}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t pt-6" style={{ borderColor: theme.border }}>
                <Link
                  href={`/${tenant}/articles`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition"
                  style={{
                    borderColor: theme.border,
                    backgroundColor: theme.background,
                    color: theme.text,
                  }}
                >
                  <ArrowLeft size={16} />
                  Lihat Artikel Lainnya
                </Link>

                <Link
                  href={`/${tenant}`}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition"
                  style={{
                    backgroundColor: theme.primary,
                    color: "#FFFFFF",
                  }}
                >
                  Kembali ke Beranda
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* STYLE KONTEN DARI CMS */}
      <style>{`
        .article-content {
          color: var(--school-text, #0F172A);
          font-size: 1rem;
          line-height: 1.9;
          overflow-wrap: anywhere;
        }

        .article-content h1,
        .article-content h2,
        .article-content h3,
        .article-content h4,
        .article-content h5,
        .article-content h6 {
          color: var(--school-text, #0F172A);
          font-weight: 700;
          line-height: 1.35;
          margin-top: 1.75em;
          margin-bottom: 0.75em;
        }

        .article-content h1 { font-size: 2rem; }
        .article-content h2 { font-size: 1.65rem; }
        .article-content h3 { font-size: 1.35rem; }

        .article-content p {
          margin-top: 1em;
          margin-bottom: 1em;
        }

        .article-content a {
          color: var(--school-primary, #2563EB);
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .article-content ul,
        .article-content ol {
          margin-top: 1em;
          margin-bottom: 1em;
          padding-left: 1.5em;
        }

        .article-content ul { list-style: disc; }
        .article-content ol { list-style: decimal; }

        .article-content blockquote {
          border-left: 4px solid var(--school-accent, #F59E0B);
          margin: 1.5em 0;
          padding: 0.5em 1em;
          background: color-mix(in srgb, var(--school-primary, #2563EB) 5%, var(--school-surface, #FFFFFF));
          color: var(--school-secondary, #64748B);
          border-radius: 0 0.75rem 0.75rem 0;
        }

        .article-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem;
          margin: 1.5em auto;
        }

        .article-content table {
          display: block;
          max-width: 100%;
          overflow-x: auto;
          border-collapse: collapse;
        }

        .article-content th,
        .article-content td {
          border: 1px solid var(--school-border, #E2E8F0);
          padding: 0.65em 0.8em;
          text-align: left;
        }

        .article-content th {
          background: color-mix(in srgb, var(--school-primary, #2563EB) 8%, var(--school-surface, #FFFFFF));
          font-weight: 700;
        }

        .article-content hr {
          border-color: var(--school-border, #E2E8F0);
          margin: 2em 0;
        }
      `}</style>
    </main>
  );
}