import Link from "next/link";
import Image from "next/image";
import { CalendarDays, ArrowRight, Image as ImageIcon, Sparkles } from "lucide-react";

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
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
      style={{ borderColor: "var(--school-border, #E2E8F0)" }}
    >
      <div
        className="relative aspect-[16/9] w-full overflow-hidden"
        style={{ backgroundColor: "var(--school-background, #F1F5F9)" }}
      >
        <div className="absolute left-4 top-4 z-20 flex flex-wrap items-center gap-2">
          {kategori && (
            <span
              className="inline-flex rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                color: "var(--school-primary, #1E3A8A)",
              }}
            >
              {kategori}
            </span>
          )}

          {isNew && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm"
              style={{
                backgroundColor: "var(--school-accent, #F59E0B)", 
              }}
            >
              <Sparkles size={12} />
              Terbaru
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
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
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
            <ImageIcon size={40} className="opacity-50" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3
          className="mb-3 line-clamp-2 text-xl font-bold leading-snug transition-colors group-hover:text-[var(--school-primary)]"
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
            className="mb-6 line-clamp-3 text-sm leading-relaxed"
            style={{ color: "var(--school-secondary, #475569)" }}
          >
            {ringkasan}
          </p>
        )}

        <div
          className="mt-auto flex items-center justify-between border-t pt-4"
          style={{ borderColor: "var(--school-border, #F1F5F9)" }}
        >
          <div
            className="flex items-center gap-1.5 text-xs font-medium"
            style={{ color: "var(--school-secondary, #64748B)" }}
          >
            <CalendarDays size={14} />
            {tanggal || "-"}
          </div>

          {href && (
            <Link
              href={href}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-bold transition-all group-hover:bg-[var(--school-primary)] group-hover:text-white"
              style={{ 
                color: "var(--school-primary, #2563EB)",
                backgroundColor: "color-mix(in srgb, var(--school-primary, #2563EB) 8%, transparent)"
              }}
            >
              Baca
              <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}