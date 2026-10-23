import Link from "next/link";
import Image from "next/image";

function formatTanggal(iso) {
  if (!iso) return "";
  const tanggal = new Date(iso);
  if (Number.isNaN(tanggal.getTime())) return "";
  return tanggal.toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
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
    typeof tenant === "string" && tenant.trim() &&
    typeof slug === "string" && slug.trim()
      ? `/${encodeURIComponent(tenant.trim())}/articles/${encodeURIComponent(slug.trim())}`
      : null;

  const judul = artikel.judul || "Artikel sekolah";
  const ringkasan = getRingkasan(artikel);
  const tanggal = formatTanggal(artikel.dibuatPada);
  const kategori = artikel.kategoriArtikel?.nama;
  const gambarUrl = artikel.gambarUtama || artikel.gambarUrl;

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{
        borderColor: "var(--warna-netral-garis, #E2E8F0)",
        backgroundColor: "var(--warna-netral-putih, #FFFFFF)",
      }}
    >
      <div
        className="relative aspect-[4/3] w-full overflow-hidden"
        style={{ backgroundColor: "var(--warna-netral-garis, #E2E8F0)" }}
      >
        {kategori && (
          <div className="absolute left-4 top-4 z-10">
            <span
              className="inline-flex rounded-full px-3 py-1 text-xs font-bold shadow-md backdrop-blur-md"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                color: "var(--warna-primer-gelap, #1E3A8A)",
              }}
            >
              {kategori}
            </span>
          </div>
        )}

        {gambarUrl ? (
          href ? (
            <Link href={href} className="block h-full w-full relative">
              <Image
                src={gambarUrl}
                alt={judul}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
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
          <div className="flex h-full items-center justify-center text-sm font-medium" style={{ color: "var(--warna-netral-teksLembut, #64748B)" }}>
            <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Tidak ada gambar
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-3 line-clamp-2 text-lg font-bold leading-snug transition-colors group-hover:text-[var(--warna-primer-utama)]" style={{ color: "var(--warna-netral-teks, #0F172A)" }}>
          {href ? (
            <Link href={href} className="focus:outline-none">
              {judul}
            </Link>
          ) : (
            judul
          )}
        </h3>

        {ringkasan && (
          <p className="mb-5 line-clamp-3 text-sm leading-relaxed" style={{ color: "var(--warna-netral-teksLembut, #64748B)" }}>
            {ringkasan}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between border-t pt-4" style={{ borderColor: "var(--warna-netral-garis, #E2E8F0)" }}>
          <div className="flex items-center gap-2 text-xs font-medium" style={{ color: "var(--warna-netral-teksLembut)" }}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {tanggal}
          </div>

          {href && (
            <Link
              href={href}
              className="flex items-center gap-1 text-xs font-bold transition-transform group-hover:translate-x-1"
              style={{ color: "var(--warna-primer-utama, #2563EB)" }}
            >
              Baca
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}