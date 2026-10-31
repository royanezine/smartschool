
import Link from "next/link";
import { notFound } from "next/navigation";
import { publikService } from "@/services/publik.service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

  if (!isVisible(item) || !(title || subtitle || content || image || ctaText)) {
    return null;
  }

  return (
    <section
      id={section.replace(/[^a-z0-9_-]/g, "-") || undefined}
      className={
        isHero
          ? "relative flex min-h-[420px] w-full items-center overflow-hidden bg-slate-900 px-6 py-24 sm:px-10 lg:px-16"
          : "border-b border-slate-200 bg-white px-6 py-14 sm:px-10 sm:py-20"
      }
    >
      {isHero && image && (
        <>
          <img
            src={image}
            alt={title || "Gambar sekolah"}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/60 to-slate-900/20" />
        </>
      )}

      <div
        className={
          isHero
            ? "relative z-10 mx-auto w-full max-w-6xl"
            : "mx-auto grid w-full max-w-6xl gap-8 md:grid-cols-2 md:items-center"
        }
      >
        <div className="min-w-0">
          {subtitle && (
            <p
              className={
                isHero
                  ? "mb-4 text-sm font-semibold uppercase tracking-widest text-blue-200"
                  : "mb-3 text-sm font-semibold uppercase tracking-widest text-blue-700"
              }
            >
              {subtitle}
            </p>
          )}

          {title && (
            <h2
              className={
                isHero
                  ? "text-3xl font-extrabold leading-tight text-white sm:text-5xl"
                  : "text-2xl font-bold leading-tight text-slate-900 sm:text-4xl"
              }
            >
              {title}
            </h2>
          )}

          {content && (
            <p
              className={
                isHero
                  ? "mt-5 max-w-3xl whitespace-pre-line text-base leading-8 text-slate-100 sm:text-lg"
                  : "mt-5 whitespace-pre-line text-base leading-8 text-slate-600"
              }
            >
              {content}
            </p>
          )}

          {ctaText && ctaLink && (
            <Link
              href={tenantLink(tenant, ctaLink)}
              className="mt-7 inline-flex items-center rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              {ctaText} <span className="ml-2" aria-hidden="true">→</span>
            </Link>
          )}
        </div>

        {!isHero && image && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
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
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-20">
        <div className="max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Halaman belum dapat dimuat
          </h1>
          <p className="mt-3 text-slate-600">
            Periksa koneksi server atau coba kembali beberapa saat lagi.
          </p>
          <Link
            href={`/${tenant}`}
            className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
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
  const gambarUrl = getField(halaman, "gambarUrl", "gambar", "gambarUtama");
  const subJudul = getField(halaman, "subJudul", "subjudul", "ringkasan");

  const sections = Array.isArray(halaman.menuKonfigurasi)
    ? [...halaman.menuKonfigurasi]
        .filter(isVisible)
        .sort((a, b) => Number(a.urutan ?? 0) - Number(b.urutan ?? 0))
    : [];

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
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <nav
        aria-label="Breadcrumb"
        className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-5 py-5 text-sm text-slate-500 sm:px-8"
      >
        <Link href={`/${tenant}`} className="hover:text-blue-700">
          Beranda
        </Link>
        <span aria-hidden="true">/</span>
        <span className="font-medium text-slate-900">{judul}</span>
      </nav>

      {sections.map((item, index) => (
        <CmsSection
          key={item.id ?? `${item.section}-${index}`}
          item={item}
          tenant={tenant}
        />
      ))}

      <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {(gambarUrl || subJudul) && (
            <div className="border-b border-slate-100">
              {gambarUrl && (
                <img
                  src={gambarUrl}
                  alt={judul}
                  className="max-h-[460px] w-full bg-slate-100 object-cover"
                />
              )}
              {subJudul && (
                <p className="px-5 py-5 text-lg leading-8 text-slate-600 sm:px-8">
                  {subJudul}
                </p>
              )}
            </div>
          )}

          <div className="px-5 py-7 sm:px-8 sm:py-10">
            <h1 className="mb-6 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              {judul}
            </h1>

            {tanggal && (
              <p className="mb-6 text-sm text-slate-500">
                Terakhir diperbarui {tanggal}
              </p>
            )}

            {konten ? (
              <div
                className={[
                  "cms-content break-words text-base leading-8 text-slate-700",
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
                dangerouslySetInnerHTML={{ __html: konten }}
              />
            ) : (
              <p className="text-slate-500">
                Belum ada konten utama untuk halaman ini.
              </p>
            )}
          </div>
        </article>

        <Link
          href={`/${tenant}`}
          className="mt-6 inline-flex rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100"
        >
          ← Kembali ke Beranda
        </Link>
      </section>
    </main>
  );
}
