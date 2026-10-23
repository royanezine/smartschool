import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import PublicLayout, {
  loadPublicLayout,
} from "../../../components/tenant/PublicLayout";
import { publikService } from "@/services/publik.service";

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

function normalizeParam(value) {
  if (typeof value !== "string") return "";

  try {
    return decodeURIComponent(value).trim();
  } catch {
    return value.trim();
  }
}

function cariArtikel(daftarArtikel, slugOrId) {
  if (!Array.isArray(daftarArtikel)) return null;

  const target = normalizeParam(slugOrId);
  if (!target) return null;

  return (
    daftarArtikel.find((item) => {
      if (!item) return false;
      const matchSlug =
        typeof item.slug === "string" &&
        normalizeParam(item.slug).toLowerCase() === target.toLowerCase();
      const matchId = String(item.id) === target;
      return matchSlug || matchId;
    }) || null
  );
}

function getGambarArtikel(artikel) {
  return artikel?.gambarUtama || artikel?.gambarUrl || null;
}

export async function generateMetadata({ params }) {
  const { tenant, slug } = await params;

  try {
    const [profil, daftarArtikel] = await Promise.all([
      publikService.getProfil(tenant),
      publikService.getArtikel(tenant),
    ]);

    const artikel = cariArtikel(daftarArtikel, slug);

    if (!artikel) {
      return {
        title: `Artikel — ${profil?.nama || "Sekolah"}`,
      };
    }

    return {
      title: `${artikel.judul || "Artikel"} — ${
        profil?.nama || "Sekolah"
      }`,
      description:
        artikel.ringkasan || artikel.judul || "Artikel sekolah",
    };
  } catch {
    return {
      title: "Artikel Sekolah",
    };
  }
}

export default async function ArticleDetailPage({ params }) {
  const { tenant, slug } = await params;

  let layout;
  let daftarArtikel;

  try {
    [layout, daftarArtikel] = await Promise.all([
      loadPublicLayout(tenant),
      publikService.getArtikel(tenant),
    ]);
  } catch (error) {
    console.error("[CMS DETAIL] Gagal memuat data:", error);
    throw error;
  }

  const {
    profil,
    tema,
    halaman = [],
    konfigurasi = [],
  } = layout || {};

  if (!profil) {
    notFound();
  }

  const artikel = cariArtikel(daftarArtikel, slug);

  if (!artikel) {
    notFound();
  }

  const base = `/${tenant}`;
  const gambar = getGambarArtikel(artikel);

  return (
    <PublicLayout
      profil={profil}
      tema={tema}
      halaman={halaman}
      konfigurasi={konfigurasi}
    >
      <div
        className="min-h-screen px-4 py-10 sm:px-6 lg:px-8"
        style={{
          backgroundColor: "var(--warna-netral-latar, #F8FAFC)",
        }}
      >
        <div className="mx-auto max-w-5xl">
          <nav
            className="mb-6 flex items-center gap-2 text-sm font-bold"
            style={{
              color: "var(--warna-netral-teksLembut, #64748B)",
            }}
          >
            <Link
              href={base}
              className="transition-colors hover:text-[var(--warna-primer-utama)]"
            >
              Beranda
            </Link>

            <span className="text-gray-300">/</span>

            <Link
              href={`${base}/articles`}
              className="transition-colors hover:text-[var(--warna-primer-utama)]"
            >
              Artikel
            </Link>
          </nav>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div
              className="flex flex-col justify-center rounded-[2rem] p-8 sm:p-10 lg:col-span-8"
              style={{
                backgroundColor: "var(--warna-netral-putih, #fff)",
              }}
            >
              {artikel.kategoriArtikel?.nama && (
                <div className="mb-4">
                  <span
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest text-white shadow-sm"
                    style={{
                      backgroundColor: "var(--warna-primer-utama)",
                    }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-white opacity-80" />
                    {artikel.kategoriArtikel.nama}
                  </span>
                </div>
              )}

              <h1
                className="mb-6 text-3xl font-black leading-tight sm:text-4xl lg:text-[2.75rem]"
                style={{
                  color: "var(--warna-netral-teks, #0F172A)",
                }}
              >
                {artikel.judul}
              </h1>

              <div
                className="flex flex-wrap items-center gap-4 text-sm font-bold"
                style={{
                  color: "var(--warna-netral-teksLembut, #64748B)",
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: "var(--warna-netral-latar, #F8FAFC)",
                    }}
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  Admin Sekolah
                </div>

                <span className="h-1 w-1 rounded-full bg-gray-300" />

                <div className="flex items-center gap-1.5">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {formatTanggal(artikel.dibuatPada)}
                </div>
              </div>
            </div>

            <div className="relative min-h-[300px] overflow-hidden rounded-[2rem] shadow-sm lg:col-span-4">
              {gambar ? (
                <Image
                  src={gambar}
                  alt={artikel.judul || "Gambar artikel"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover"
                  unoptimized
                  priority
                />
              ) : (
                <div
                  className="flex h-full min-h-[300px] w-full items-center justify-center text-sm font-bold text-gray-400"
                  style={{
                    backgroundColor: "var(--warna-netral-garis, #E2E8F0)",
                  }}
                >
                  Tanpa Gambar
                </div>
              )}
            </div>

            {artikel.ringkasan && (
              <div
                className="relative overflow-hidden rounded-[2rem] p-8 sm:p-10 lg:col-span-12"
                style={{
                  backgroundColor: "var(--warna-primer-utama)",
                }}
              >
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white opacity-10" />
                <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-black opacity-10" />

                <div className="relative z-10 flex flex-col items-center text-center">
                  <svg
                    className="mb-4 h-8 w-8 text-white opacity-50"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>

                  <p className="text-lg font-bold leading-relaxed text-white sm:text-xl md:text-2xl">
                    "{artikel.ringkasan}"
                  </p>
                </div>
              </div>
            )}

            <div
              className="rounded-[2rem] p-8 sm:p-12 lg:col-span-12"
              style={{
                backgroundColor: "var(--warna-netral-putih, #fff)",
              }}
            >
              <div
                className="prose prose-base mx-auto max-w-4xl break-words leading-loose sm:prose-lg prose-headings:font-black prose-headings:text-gray-900 prose-a:font-bold prose-a:text-[var(--warna-primer-utama)] prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:shadow-lg"
                style={{
                  color: "var(--warna-netral-teksLembut, #475569)",
                }}
                dangerouslySetInnerHTML={{
                  __html: artikel.konten || "",
                }}
              />
            </div>

            <div
              className="flex flex-col items-center justify-between gap-6 rounded-[2rem] p-8 sm:flex-row lg:col-span-12"
              style={{
                backgroundColor: "var(--warna-netral-putih, #fff)",
              }}
            >
              <Link
                href={`${base}/articles`}
                className="group inline-flex items-center gap-3 rounded-2xl bg-gray-100 px-6 py-3.5 text-sm font-black uppercase tracking-wider transition-all hover:scale-105 hover:bg-gray-200"
                style={{
                  color: "var(--warna-netral-teks)",
                }}
              >
                <svg
                  className="h-5 w-5 transition-transform group-hover:-translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Kembali
              </Link>

              <div className="flex items-center gap-3">
                <span
                  className="text-xs font-black uppercase tracking-widest"
                  style={{
                    color: "var(--warna-netral-teksLembut, #64748B)",
                  }}
                >
                  Bagikan
                </span>

                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    artikel.judul || "Artikel sekolah"
                  )}&url=${encodeURIComponent(
                    `/${tenant}/articles/${slug}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Bagikan artikel ke Twitter"
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 transition-all hover:-translate-y-1 hover:bg-[var(--warna-primer-utama)] hover:text-white hover:shadow-lg"
                  style={{
                    color: "var(--warna-netral-teks)",
                  }}
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>

                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                    `/${tenant}/articles/${slug}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Bagikan artikel ke LinkedIn"
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 transition-all hover:-translate-y-1 hover:bg-[var(--warna-primer-utama)] hover:text-white hover:shadow-lg"
                  style={{
                    color: "var(--warna-netral-teks)",
                  }}
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}