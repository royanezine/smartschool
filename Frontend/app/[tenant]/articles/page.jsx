import Link from "next/link";
import { publikService } from "@/services/publik.service";
import ArticleCard from "@/app/components/tenant/ArticleCard";
import { ArrowLeft, Newspaper, AlertCircle } from "lucide-react";

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

  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const candidates = [
    data.artikel,
    data.articles,
    data.items,
    data.results,
    data.data,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }

    if (candidate && typeof candidate === "object") {
      const nested = normalizeArticles(candidate);

      if (nested.length > 0) {
        return nested;
      }
    }
  }

  return [];
}

function ErrorState({ title, description, children }) {
  return (
    <div
      className="rounded-3xl border p-8 text-center shadow-sm sm:p-10"
      style={{
        backgroundColor: theme.surface,
        borderColor: theme.border,
        color: theme.text,
      }}
    >
      <div
        className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
        style={{
          backgroundColor: `color-mix(in srgb, ${theme.accent} 12%, ${theme.surface})`,
          color: theme.accent,
        }}
      >
        <AlertCircle size={32} />
      </div>

      <h2 className="text-xl font-bold" style={{ color: theme.text }}>
        {title}
      </h2>

      <p
        className="mx-auto mt-3 max-w-xl leading-relaxed"
        style={{ color: theme.secondary }}
      >
        {description}
      </p>

      {children}
    </div>
  );
}

export default async function DaftarArtikelPage({ params }) {
  const resolvedParams = await params;
  const tenant = resolvedParams?.tenant;

  if (!tenant) {
    return (
      <main
        className="flex min-h-[70vh] items-center justify-center px-6 py-28"
        style={{
          backgroundColor: theme.background,
          color: theme.text,
        }}
      >
        <div className="max-w-md text-center">
          <div
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
            style={{
              backgroundColor: `color-mix(in srgb, ${theme.accent} 12%, ${theme.surface})`,
              color: theme.accent,
            }}
          >
            <AlertCircle size={40} />
          </div>

          <h1 className="text-2xl font-bold">
            Subdomain sekolah tidak ditemukan
          </h1>

          <p className="mt-3" style={{ color: theme.secondary }}>
            Website ini tidak memiliki identitas subdomain yang valid.
          </p>
        </div>
      </main>
    );
  }

  let articles = [];
  let apiError = null;

  try {
    const response = await publikService.getArtikel(tenant);
    articles = normalizeArticles(response);

    articles = articles.filter(
      (article) =>
        article &&
        typeof article === "object" &&
        (article.slug || article.id)
    );
  } catch (error) {
    apiError = error;
    console.error("[ARTIKEL PUBLIK] Gagal mengambil artikel:", error);
  }

  return (
    <main
      className="min-h-screen pb-24 pt-28"
      style={{
        backgroundColor: theme.background,
        color: theme.text,
      }}
    >
      {/* HEADER / HERO */}
      <section
        className="relative isolate overflow-hidden py-16 sm:py-20"
        style={{
          backgroundColor: theme.primary,
          color: theme.surface,
        }}
      >
        {/* Dekorasi mengikuti warna tema CMS */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div
            className="absolute -left-1/4 -top-1/4 h-full w-1/2 rounded-full blur-3xl"
            style={{
              backgroundColor: theme.accent,
              opacity: 0.22,
            }}
          />

          <div
            className="absolute -right-1/4 bottom-0 h-full w-1/2 rounded-full blur-3xl"
            style={{
              backgroundColor: theme.secondary,
              opacity: 0.3,
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

        <div className="relative mx-auto max-w-6xl px-6">
          <Link
            href={`/${tenant}`}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition"
            style={{
              borderColor: "rgba(255,255,255,0.3)",
              backgroundColor: "rgba(255,255,255,0.12)",
              color: "#FFFFFF",
            }}
          >
            <ArrowLeft size={16} />
            Kembali ke Beranda
          </Link>

          <div className="mt-10 max-w-3xl">
            <div
              className="mb-4 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest"
              style={{ color: theme.accent }}
            >
              <Newspaper size={18} />
              Kabar & Informasi
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
              Artikel Terbaru
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
              Temukan informasi, pengumuman, berita kegiatan, dan prestasi
              terbaru dari lingkungan sekolah kami.
            </p>

            <div
              className="mt-8 h-1.5 w-24 rounded-full"
              style={{ backgroundColor: theme.accent }}
            />
          </div>
        </div>
      </section>

      {/* KONTEN ARTIKEL */}
      <section className="relative z-10 mx-auto -mt-8 max-w-6xl px-6">
        {apiError ? (
          <ErrorState
            title="Artikel belum dapat dimuat"
            description="Data artikel belum berhasil diambil dari server. Pastikan backend aktif dan koneksi ke API berjalan dengan baik."
          >
            {process.env.NODE_ENV === "development" && (
              <p
                className="mt-4 break-words rounded-xl p-3 text-left text-sm"
                style={{
                  backgroundColor: theme.background,
                  color: theme.secondary,
                }}
              >
                {apiError?.message}
              </p>
            )}
          </ErrorState>
        ) : articles.length === 0 ? (
          <div
            className="rounded-3xl border-2 border-dashed px-6 py-20 text-center shadow-sm sm:py-24"
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.border,
              color: theme.text,
            }}
          >
            <div
              className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: `color-mix(in srgb, ${theme.primary} 10%, ${theme.surface})`,
                color: theme.primary,
              }}
            >
              <Newspaper size={40} />
            </div>

            <h2 className="text-xl font-bold">Belum Ada Artikel</h2>

            <p
              className="mx-auto mt-3 max-w-md leading-relaxed"
              style={{ color: theme.secondary }}
            >
              Saat ini belum ada artikel yang dipublikasikan ke website sekolah.
              Artikel yang sudah diterbitkan melalui CMS akan ditampilkan di sini.
            </p>

            <Link
              href={`/${tenant}`}
              className="mt-7 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition"
              style={{
                backgroundColor: theme.primary,
                color: "#FFFFFF",
              }}
            >
              <ArrowLeft size={16} className="mr-2" />
              Kembali ke Beranda
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p
                  className="text-sm font-semibold uppercase tracking-widest"
                  style={{ color: theme.primary }}
                >
                  Informasi Sekolah
                </p>

                <h2
                  className="mt-2 text-2xl font-bold sm:text-3xl"
                  style={{ color: theme.text }}
                >
                  Berita dan Artikel
                </h2>

                <p className="mt-2" style={{ color: theme.secondary }}>
                  Informasi terbaru dari lingkungan sekolah.
                </p>
              </div>

              <span
                className="inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold"
                style={{
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  color: theme.secondary,
                }}
              >
                <Newspaper size={16} style={{ color: theme.primary }} />
                {articles.length} artikel
              </span>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article, index) => (
                <ArticleCard
                  key={article.id ?? article.slug ?? `article-${index}`}
                  artikel={article}
                  subdomain={tenant}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}