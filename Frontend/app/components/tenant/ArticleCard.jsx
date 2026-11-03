import Link from "next/link";
import Image from "next/image";
import {
  CalendarDays,
  ArrowRight,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";

function formatTanggal(iso) {
  if (!iso) return "";
  const tanggal = new Date(iso);
  if (Number.isNaN(tanggal.getTime())) return "";

  return tanggal.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function isNewArticle(iso) {
  if (!iso) return false;
  const tanggal = new Date(iso);
  if (Number.isNaN(tanggal.getTime())) return false;

  const today = new Date();
  const diffTime = Math.abs(today - tanggal);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays <= 7;
}

function getRingkasan(artikel) {
  if (artikel.ringkasan?.trim()) {
    return artikel.ringkasan.trim();
  }
  if (!artikel.konten) return "";

  const teks = artikel.konten
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

  return teks.length > 140 ? `${teks.slice(0, 140).trimEnd()}...` : teks;
}

export default function ArticleCard({ artikel, subdomain }) {
  if (!artikel) return null;

  const slug = artikel.slug;
  const tenant = subdomain;

  const href =
    typeof tenant === "string" &&
    tenant.trim() &&
    typeof slug === "string" &&
    slug.trim()
      ? `/${encodeURIComponent(tenant.trim())}/articles/${encodeURIComponent(
          slug.trim()
        )}`
      : null;

  const judul = artikel.judul || "Artikel sekolah";
  const ringkasan = getRingkasan(artikel);
  const tanggal = formatTanggal(artikel.dibuatPada || artikel.tanggalPublikasi);
  const kategori = artikel.kategoriArtikel?.nama;
  const gambarUrl = artikel.gambarUtama || artikel.gambarUrl;

  const isNew = isNewArticle(artikel.dibuatPada || artikel.tanggalPublikasi);

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-xl border transition-all duration-500 ease-out hover:-translate-y-1"
      style={{
        borderColor: "var(--school-border, #E2E8F0)",
        backgroundColor: "var(--school-surface, #FFFFFF)",
        boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
      }}
    >
      <div
        className="relative aspect-[16/10] w-full overflow-hidden"
        style={{ backgroundColor: "var(--school-background, #F1F5F9)" }}
      >
        <div className="absolute left-3 top-3 z-20 flex flex-wrap items-center gap-1.5">
          {kategori && (
            <span
              className="inline-flex rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] backdrop-blur-md"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.92)",
                color: "var(--school-primary, #1E3A8A)",
                border: "1px solid rgba(255,255,255,0.6)",
              }}
            >
              {kategori}
            </span>
          )}

          {isNew && (
            <span
              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white"
              style={{
                backgroundColor: "var(--school-accent, #F59E0B)",
              }}
            >
              <Sparkles size={10} />
              Baru
            </span>
          )}
        </div>

        {gambarUrl ? (
          href ? (
            <Link href={href} className="relative block h-full w-full">
              <Image
                src={gambarUrl}
                alt={judul}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
                unoptimized
              />
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "linear-gradient(to top, rgba(15,23,42,0.15), transparent 60%)",
                }}
              />
            </Link>
          ) : (
            <Image
              src={gambarUrl}
              alt={judul}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              unoptimized
            />
          )
        ) : (
          <div
            className="flex h-full items-center justify-center"
            style={{ color: "var(--school-secondary, #94A3B8)" }}
          >
            <ImageIcon size={36} className="opacity-40" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3
          className="mb-2.5 line-clamp-2 text-base font-semibold leading-snug tracking-tight transition-colors duration-300 sm:text-lg group-hover:text-[var(--school-primary)]"
          style={{ color: "var(--school-text, #0F172A)" }}
        >
          {href ? (
            <Link href={href} className="focus:outline-none">
              {judul}
            </Link>
          ) : (
            judul
          )}
        </h3>

        {ringkasan && (
          <p
            className="mb-5 line-clamp-3 text-sm leading-relaxed"
            style={{ color: "var(--school-secondary, #475569)" }}
          >
            {ringkasan}
          </p>
        )}

        <div
          className="mt-auto flex items-center justify-between gap-3 border-t pt-4"
          style={{ borderColor: "var(--school-border, #F1F5F9)" }}
        >
          <div
            className="flex items-center gap-1.5 text-xs font-medium"
            style={{ color: "var(--school-secondary, #64748B)" }}
          >
            <CalendarDays size={13} className="shrink-0 opacity-70" />
            <span className="truncate">{tanggal || "-"}</span>
          </div>

          {href && (
            <Link
              href={href}
              aria-label={`Baca artikel ${judul}`}
              className="group/cta inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all duration-300 hover:bg-[color-mix(in_srgb,var(--school-primary,#2563EB)_8%,transparent)]"
              style={{ color: "var(--school-primary, #2563EB)" }}
            >
              <span>Baca</span>
              <ArrowRight
                size={14}
                className="transition-transform duration-300 group-hover/cta:translate-x-0.5"
              />
            </Link>
          )}
        </div>
      </div>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100"
        style={{ backgroundColor: "var(--school-primary, #2563EB)" }}
      />
    </article>
  );
}