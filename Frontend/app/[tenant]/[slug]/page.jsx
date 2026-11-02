import Link from "next/link";
import { notFound } from "next/navigation";
import { publikService } from "@/services/publik.service";
import { ArrowLeft } from "lucide-react";

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

function unwrapResponse(response) {
  let result = response;

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

function isVisible(item) {
  const status = text(item?.status).toLowerCase();

  return status !== "nonaktif" && status !== "draft";
}

function tenantLink(tenant, value) {
  const target = text(value);

  if (!target) return `/${tenant}`;

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

function CmsSection({ item, tenant }) {
  const title = getField(item, "judul", "title");
  const subtitle = getField(item, "subJudul", "subjudul", "subtitle");
  const content = getField(item, "konten", "content", "deskripsi");
  const image = getField(item, "gambarUrl", "gambar", "imageUrl");
  const ctaText = getField(item, "ctaText", "teksTombol", "buttonText");
  const ctaLink = getField(item, "ctaLink", "tautan", "buttonLink");
  const section = getField(item, "section").toLowerCase();
  const isHero = section === "hero";

  if (
    !isVisible(item) ||
    !(title || subtitle || content || image || ctaText)
  ) {
    return null;
  }

  return (
    <section
      id={section.replace(/[^a-z0-9_-]/g, "-") || undefined}
      className={
        isHero
          ? "relative isolate flex min-h-[480px] w-full items-center overflow-hidden px-5 py-20 sm:min-h-[540px] sm:px-10 sm:py-24 lg:min-h-[600px] lg:px-16"
          : "border-b px-6 py-14 sm:px-10 sm:py-20"
      }
      style={{
        backgroundColor: isHero ? "#0F172A" : theme.surface,
        borderColor: theme.border,
      }}
    >
      {/* BACKGROUND HERO */}
      {isHero && (
        <>
          {image ? (
            <img
              src={image}
              alt={title || "Gambar sekolah"}
              className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
              fetchPriority="high"
            />
          ) : (
            <div
              className="absolute inset-0 -z-20 h-full w-full"
              style={{ backgroundColor: theme.primary }}
            />
          )}

          {/* Overlay gradient gelap khas premium/enterprise */}
          <div
            className="absolute inset-0 -z-10"
            style={{
              background:
                "linear-gradient(90deg, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.65) 55%, rgba(15,23,42,0.4) 100%)",
            }}
          />
        </>
      )}

      <div
        className={
          isHero
            ? "relative z-10 mx-auto w-full max-w-7xl"
            : "mx-auto grid w-full max-w-6xl gap-8 md:grid-cols-2 md:items-center"
        }
      >
        <div className={isHero ? "max-w-3xl" : "min-w-0"}>
          {subtitle && (
            <p
              className={
                isHero
                  ? "mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-100 sm:text-xs"
                  : "mb-3 text-[11px] font-semibold uppercase tracking-[0.18em]"
              }
              style={
                !isHero
                  ? { color: theme.primary }
                  : undefined
              }
            >
              {subtitle}
            </p>
          )}

          {title && (
            <h2
              className={
                isHero
                  ? "max-w-3xl break-words text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[54px]"
                  : "break-words text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl"
              }
              style={
                !isHero ? { color: theme.text } : undefined
              }
            >
              {title}
            </h2>
          )}

          {content && (
            <p
              className={
                isHero
                  ? "mt-6 max-w-2xl whitespace-pre-line break-words text-sm leading-relaxed text-slate-200 sm:text-base sm:leading-8"
                  : "mt-5 whitespace-pre-line break-words text-sm leading-8 sm:text-base"
              }
              style={
                !isHero
                  ? { color: theme.secondary }
                  : undefined
              }
            >
              {content}
            </p>
          )}

          {ctaText && ctaLink && (
            <div className={isHero ? "mt-8 sm:mt-10" : "mt-7"}>
              <Link
                href={tenantLink(tenant, ctaLink)}
                className={
                  isHero
                    ? "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition-colors duration-300 hover:bg-slate-100 sm:text-base"
                    : "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity duration-300 hover:opacity-90 sm:text-base"
                }
                style={
                  !isHero
                    ? {
                        backgroundColor: theme.primary,
                        boxShadow: `0 4px 14px color-mix(in srgb, ${theme.primary} 25%, transparent)`,
                      }
                    : undefined
                }
              >
                {ctaText}
                <span className="ml-1" aria-hidden="true">
                  →
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* GAMBAR NON-HERO */}
        {!isHero && image && (
          <div
            className="overflow-hidden rounded-xl border shadow-sm"
            style={{ 
              borderColor: theme.border,
              backgroundColor: theme.background 
            }}
          >
            <img
              src={image}
              alt={title || "Gambar informasi sekolah"}
              className="max-h-[420px] w-full object-cover"
              loading="lazy"
            />
          </div>
        )}
      </div>
    </section>
  );
}

export default async function HalamanCmsPublik({ params }) {
  const { tenant, slug } = await params;

  let halaman;

  try {
    const response = await publikService.getHalamanBySlug(tenant, slug);
    halaman = unwrapResponse(response);

    if (halaman?.halaman && typeof halaman.halaman === "object") {
      halaman = halaman.halaman;
    }
  } catch (error) {
    const status = error?.status ?? error?.response?.status;

    console.error("[HALAMAN CMS PUBLIK]", {
      tenant,
      slug,
      status,
      message: error?.message,
    });

    if (status === 404) notFound();

    return (
      <main
        className="flex min-h-screen items-center justify-center px-5 py-20"
        style={{ backgroundColor: theme.background }}
      >
        <div
          className="max-w-md rounded-xl border bg-white p-8 text-center shadow-sm"
          style={{ borderColor: theme.border }}
        >
          <h1
            className="text-xl font-bold tracking-tight"
            style={{ color: theme.text }}
          >
            Halaman belum dapat dimuat
          </h1>

          <p
            className="mt-3 text-sm leading-relaxed"
            style={{ color: theme.secondary }}
          >
            Periksa koneksi server atau coba kembali beberapa saat lagi.
          </p>

          <Link
            href={`/${tenant}`}
            className="mt-6 inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90"
            style={{ backgroundColor: theme.primary }}
          >
            Kembali ke Beranda
          </Link>
        </div>
      </main>
    );
  }

  if (
    !halaman ||
    typeof halaman !== "object" ||
    Array.isArray(halaman) ||
    !halaman.slug ||
    String(halaman.slug).toLowerCase() !== String(slug).toLowerCase()
  ) {
    notFound();
  }

  const judul = getField(halaman, "judul", "title") || "Halaman Sekolah";
  const konten = getField(halaman, "konten", "content");
  const gambarUrl = getField(
    halaman,
    "gambarUrl",
    "gambar",
    "gambarUtama"
  );
  const subJudul = getField(
    halaman,
    "subJudul",
    "subjudul",
    "ringkasan"
  );

  const sections = Array.isArray(halaman.menuKonfigurasi)
    ? [...halaman.menuKonfigurasi]
        .filter(isVisible)
        .sort(
          (a, b) => Number(a.urutan ?? 0) - Number(b.urutan ?? 0)
        )
    : [];

  const hasHero = sections.some(
    (item) =>
      getField(item, "section").toLowerCase() === "hero" &&
      isVisible(item) &&
      Boolean(
        getField(
          item,
          "judul",
          "title",
          "subJudul",
          "subjudul",
          "subtitle",
          "konten",
          "content",
          "deskripsi",
          "gambarUrl",
          "gambar",
          "imageUrl",
          "ctaText",
          "teksTombol",
          "buttonText"
        )
      )
  );

  const tanggalRaw = halaman.diperbaruiPada;
  const tanggal =
    tanggalRaw && !Number.isNaN(new Date(tanggalRaw).getTime())
      ? new Intl.DateTimeFormat("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date(tanggalRaw))
      : null;

  return (
    <main
      className="min-h-screen w-full overflow-x-hidden"
      style={{
        backgroundColor: theme.background,
        color: theme.text,
      }}
    >
      {!hasHero && (
        <nav
          aria-label="Breadcrumb"
          className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-5 py-5 text-sm sm:px-8"
          style={{ color: theme.secondary }}
        >
          <Link
            href={`/${tenant}`}
            className="transition-colors duration-200 hover:opacity-80"
          >
            Beranda
          </Link>

          <span aria-hidden="true">/</span>

          <span
            className="font-medium"
            style={{ color: theme.text }}
          >
            {judul}
          </span>
        </nav>
      )}

      {sections.map((item, index) => (
        <CmsSection
          key={item.id ?? `${item.section}-${index}`}
          item={item}
          tenant={tenant}
        />
      ))}

      {(judul || konten || gambarUrl || subJudul) && (
        <section
          className={
            hasHero
              ? "mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14"
              : "mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-12"
          }
        >
          <article
            className="overflow-hidden rounded-xl border bg-white shadow-sm"
            style={{ borderColor: theme.border }}
          >
            {(gambarUrl || subJudul) && (
              <div
                className="border-b"
                style={{ borderColor: theme.border }}
              >
                {gambarUrl && (
                  <img
                    src={gambarUrl}
                    alt={judul}
                    className="max-h-[460px] w-full bg-slate-100 object-cover"
                    loading="lazy"
                  />
                )}

                {subJudul && (
                  <p
                    className="px-5 py-5 text-base leading-relaxed sm:px-8 sm:text-lg sm:leading-8"
                    style={{ color: theme.secondary }}
                  >
                    {subJudul}
                  </p>
                )}
              </div>
            )}

            <div className="px-5 py-7 sm:px-8 sm:py-10">
              <h1
                className="mb-5 break-words text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl"
                style={{ color: theme.text }}
              >
                {judul}
              </h1>

              {tanggal && (
                <p
                  className="mb-6 text-xs font-medium uppercase tracking-wider sm:text-sm"
                  style={{ color: theme.secondary }}
                >
                  Terakhir diperbarui {tanggal}
                </p>
              )}

              {konten ? (
                <div
                  className={[
                    "cms-content break-words text-base leading-8",
                    "[&_h1]:mb-5 [&_h1]:mt-8 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-slate-900",
                    "[&_h2]:mb-4 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-slate-900",
                    "[&_h3]:mb-3 [&_h3]:mt-7 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-slate-900",
                    "[&_p]:mb-5 [&_ul]:mb-6 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6",
                    "[&_ol]:mb-6 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6",
                    "[&_a]:text-blue-700 [&_a]:underline",
                    "[&_img]:my-6 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl",
                    "[&_table]:my-6 [&_table]:w-full [&_table]:border-collapse",
                    "[&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:p-3",
                    "[&_td]:border [&_td]:border-slate-200 [&_td]:p-3",
                  ].join(" ")}
                  style={{ color: theme.text }}
                  dangerouslySetInnerHTML={{ __html: konten }}
                />
              ) : (
                <p style={{ color: theme.secondary }}>
                  Belum ada konten utama untuk halaman ini.
                </p>
              )}
            </div>
          </article>

          <Link
            href={`/${tenant}`}
            className="mt-8 inline-flex items-center gap-2 rounded-lg border bg-white px-5 py-2.5 text-sm font-semibold shadow-sm transition-colors duration-200 hover:bg-slate-50"
            style={{
              borderColor: theme.border,
              color: theme.text,
            }}
          >
            <ArrowLeft size={16} />
            Kembali ke Beranda
          </Link>
        </section>
      )}
    </main>
  );
}