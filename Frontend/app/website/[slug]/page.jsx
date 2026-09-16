"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Users,
  Award,
  Menu,
  X,
  Sparkles,
  CalendarDays,
  School,
  TrendingUp,
} from "lucide-react";

/* =========================================================
   API
========================================================= */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getApiBaseUrl() {
  return API_URL
    .replace(/\/+$/, "")
    .replace(/\/api\/v1$/, "")
    .replace(/\/api$/, "");
}

/* =========================================================
   SUBDOMAIN
========================================================= */

function getSubdomain() {
  if (typeof window === "undefined") {
    return "smart";
  }

  const hostname = window.location.hostname;

  console.log("=================================");
  console.log("PUBLIC WEBSITE");
  console.log("HOSTNAME:", hostname);
  console.log("=================================");

  // smart.localhost -> smart
  if (hostname.endsWith(".localhost")) {
    const subdomain = hostname.split(".")[0];

    if (subdomain) {
      return subdomain;
    }
  }

  // localhost biasa
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1"
  ) {
    return "smart";
  }

  return "smart";
}

/* =========================================================
   PAGE
========================================================= */

export default function WebsiteHomePage() {
  const [subdomain, setSubdomain] = useState("smart");

  const [menuOpen, setMenuOpen] = useState(false);

  const [articles, setArticles] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [errorArticles, setErrorArticles] = useState("");

  /* =======================================================
     DETECT SUBDOMAIN
  ======================================================= */

  useEffect(() => {
    const detected = getSubdomain();

    console.log("DETECTED SUBDOMAIN:", detected);

    setSubdomain(detected);
  }, []);

  /* =======================================================
     FETCH ARTICLES
  ======================================================= */

  useEffect(() => {
    if (!subdomain) {
      return;
    }

    let cancelled = false;

    async function fetchArticles() {
      try {
        setLoadingArticles(true);
        setErrorArticles("");

        const apiBaseUrl = getApiBaseUrl();

        const endpoint =
          `${apiBaseUrl}/api/v1/publik/` +
          `${encodeURIComponent(subdomain)}/artikel`;

        console.log("=================================");
        console.log("FETCH PUBLIC ARTICLES");
        console.log("API BASE:", apiBaseUrl);
        console.log("SUBDOMAIN:", subdomain);
        console.log("ENDPOINT:", endpoint);
        console.log("=================================");

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        });

        const contentType =
          response.headers.get("content-type") || "";

        let result = null;

        if (
          contentType.includes(
            "application/json"
          )
        ) {
          result = await response.json();
        } else {
          const text = await response.text();

          console.error(
            "Response bukan JSON:",
            text
          );

          throw new Error(
            `Response backend bukan JSON. Status: ${response.status}`
          );
        }

        console.log(
          "ARTICLE STATUS:",
          response.status
        );

        console.log(
          "ARTICLE RESULT:",
          result
        );

        if (!response.ok) {
          throw new Error(
            result?.message ||
              result?.error ||
              "Gagal mengambil artikel."
          );
        }

        const data = result?.data ?? result;

        if (!Array.isArray(data)) {
          console.error(
            "Format artikel tidak sesuai:",
            data
          );

          throw new Error(
            "Format data artikel tidak sesuai."
          );
        }

        if (!cancelled) {
          setArticles(data);
        }
      } catch (error) {
        console.error(
          "Gagal mengambil artikel:",
          error
        );

        if (!cancelled) {
          setArticles([]);

          setErrorArticles(
            error?.message ||
              "Gagal mengambil artikel."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingArticles(false);
        }
      }
    }

    fetchArticles();

    return () => {
      cancelled = true;
    };
  }, [subdomain]);

  /* =======================================================
     WEBSITE URL
  ======================================================= */

  const websiteUrl = (path = "") => {
    if (!path) {
      return "/";
    }

    if (!path.startsWith("/")) {
      return `/${path}`;
    }

    return path;
  };

  /* =======================================================
     IMAGE URL
  ======================================================= */

  const getImageUrl = (image) => {
    if (!image) {
      return null;
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    const apiBaseUrl = getApiBaseUrl();

    return `${apiBaseUrl}${
      image.startsWith("/")
        ? image
        : `/${image}`
    }`;
  };

  /* =======================================================
     DATE
  ======================================================= */

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    try {
      const parsed = new Date(date);

      if (
        Number.isNaN(
          parsed.getTime()
        )
      ) {
        return "-";
      }

      return parsed.toLocaleDateString(
        "id-ID",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      );
    } catch {
      return "-";
    }
  };

  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">

          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-sm">
              <School size={20} />
            </div>

            <div className="flex flex-col leading-tight">
              <span className="text-lg font-bold tracking-tight text-[#0F172A]">
                Smart
                <span className="text-[#2563EB]">
                  School
                </span>
              </span>

              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Website Resmi Sekolah
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">

            <Link
              href="/"
              className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-[#2563EB]"
            >
              Beranda
            </Link>

            <Link
              href="/tentang"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-[#2563EB]"
            >
              Tentang
            </Link>

            <Link
              href="/akademik"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-[#2563EB]"
            >
              Akademik
            </Link>

            <Link
              href="/articles"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-[#2563EB]"
            >
              Artikel
            </Link>

            <Link
              href="/kontak"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-[#2563EB]"
            >
              Kontak
            </Link>

          </nav>

          <div className="hidden md:block">
            <Link
              href="/kontak"
              className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1D4ED8]"
            >
              Hubungi Kami
              <ArrowRight size={16} />
            </Link>
          </div>

          <button
            type="button"
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 md:hidden"
          >
            {menuOpen ? (
              <X size={20} />
            ) : (
              <Menu size={20} />
            )}
          </button>

        </div>

        {menuOpen && (
          <div className="border-t border-slate-200 bg-white px-5 py-4 md:hidden">

            <div className="flex flex-col gap-1">

              <Link
                href="/"
                onClick={() =>
                  setMenuOpen(false)
                }
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Beranda
              </Link>

              <Link
                href="/tentang"
                onClick={() =>
                  setMenuOpen(false)
                }
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Tentang
              </Link>

              <Link
                href="/akademik"
                onClick={() =>
                  setMenuOpen(false)
                }
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Akademik
              </Link>

              <Link
                href="/articles"
                onClick={() =>
                  setMenuOpen(false)
                }
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Artikel
              </Link>

              <Link
                href="/kontak"
                onClick={() =>
                  setMenuOpen(false)
                }
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Kontak
              </Link>

            </div>
          </div>
        )}
      </header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-[#F8FAFC] to-indigo-50" />

        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#2563EB]/10 blur-3xl" />

        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-indigo-400/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-28">

          <div className="flex flex-col justify-center">

            <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#2563EB] shadow-sm">
              <Sparkles size={14} />
              Website Resmi Sekolah
            </span>

            <h1 className="text-4xl font-bold leading-tight tracking-tight text-[#0F172A] md:text-5xl lg:text-6xl">
              Selamat Datang di

              <span className="mt-1 block text-[#2563EB]">
                SmartSchool
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Platform informasi sekolah yang membantu
              siswa, guru, orang tua, dan masyarakat
              mendapatkan informasi pendidikan dengan
              mudah dan cepat.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">

              <Link
                href="/tentang"
                className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1D4ED8]"
              >
                Tentang Sekolah
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/articles"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <BookOpen size={18} />
                Lihat Artikel
              </Link>

            </div>

            <div className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-slate-200 pt-6">

              <div>
                <p className="text-2xl font-bold">
                  100+
                </p>

                <p className="mt-1 text-xs font-medium text-slate-500">
                  Siswa Aktif
                </p>
              </div>

              <div>
                <p className="text-2xl font-bold">
                  20+
                </p>

                <p className="mt-1 text-xs font-medium text-slate-500">
                  Guru Berpengalaman
                </p>
              </div>

              <div>
                <p className="text-2xl font-bold">
                  A
                </p>

                <p className="mt-1 text-xs font-medium text-slate-500">
                  Akreditasi
                </p>
              </div>

            </div>

          </div>

          <div className="flex items-center justify-center">

            <div className="grid w-full max-w-lg grid-cols-2 gap-4">

              <FeatureCard
                icon={GraduationCap}
                title="Pendidikan"
                description="Pendidikan berkualitas untuk masa depan."
              />

              <FeatureCard
                icon={Users}
                title="Siswa"
                description="Mendukung perkembangan setiap siswa."
                offset
              />

              <FeatureCard
                icon={BookOpen}
                title="Akademik"
                description="Informasi akademik sekolah."
              />

              <FeatureCard
                icon={Award}
                title="Prestasi"
                description="Mengembangkan potensi dan prestasi."
                offset
              />

            </div>
          </div>

        </div>
      </section>

      {/* =====================================================
          ARTICLES
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">

        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#2563EB]">
              <TrendingUp size={13} />
              Informasi Terbaru
            </span>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">
              Artikel Sekolah
            </h2>

            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Berita, kegiatan, dan informasi terbaru
              dari sekolah kami.
            </p>

          </div>

          <Link
            href="/articles"
            className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:inline-flex"
          >
            Lihat Semua
            <ArrowRight size={16} />
          </Link>

        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {loadingArticles && (
          <div className="grid gap-6 md:grid-cols-3">

            {[1, 2, 3].map((item) => (
              <ArticleSkeleton key={item} />
            ))}

          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {!loadingArticles &&
          errorArticles && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-6">

              <p className="text-sm font-bold text-red-700">
                Gagal memuat artikel
              </p>

              <p className="mt-1 text-xs text-red-600">
                {errorArticles}
              </p>

              <p className="mt-3 text-xs text-red-500">
                Subdomain:{" "}
                <strong>
                  {subdomain}
                </strong>
              </p>

            </div>
          )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!loadingArticles &&
          !errorArticles &&
          articles.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">

              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <BookOpen size={26} />
              </div>

              <h3 className="text-base font-semibold text-slate-800">
                Belum ada artikel
              </h3>

              <p className="mt-1 max-w-md text-sm text-slate-500">
                Artikel akan muncul di sini setelah
                dipublikasikan oleh admin sekolah.
              </p>

            </div>
          )}

        {/* =================================================
            ARTICLES
        ================================================= */}

        {!loadingArticles &&
          !errorArticles &&
          articles.length > 0 && (
            <div className="grid gap-6 md:grid-cols-3">

              {articles
                .slice(0, 3)
                .map((article) => (
                  <article
                    key={article.id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-md"
                  >

                    {/* IMAGE */}

                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">

                      {article.gambarUtama ? (
                        <img
                          src={getImageUrl(
                            article.gambarUtama
                          )}
                          alt={
                            article.judul ||
                            "Artikel"
                          }
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">

                          <BookOpen
                            size={40}
                            className="text-[#2563EB]/60"
                          />

                        </div>
                      )}

                      {article
                        .kategoriArtikel
                        ?.nama && (
                        <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#2563EB] shadow-sm">
                          {
                            article
                              .kategoriArtikel
                              .nama
                          }
                        </span>
                      )}

                    </div>

                    {/* CONTENT */}

                    <div className="flex flex-1 flex-col p-6">

                      <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-slate-400">

                        <CalendarDays size={13} />

                        {formatDate(
                          article.dibuatPada ||
                            article.createdAt ||
                            article.created_at
                        )}

                      </div>

                      <h3 className="line-clamp-2 text-lg font-bold leading-snug text-[#0F172A] transition group-hover:text-[#2563EB]">
                        {article.judul ||
                          "Tanpa judul"}
                      </h3>

                      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-500">
                        {article.ringkasan ||
                          "Baca informasi terbaru dari sekolah."}
                      </p>

                      <Link
                        href={`/articles/${article.id}`}
                        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB] transition group-hover:gap-3"
                      >
                        Baca Selengkapnya
                        <ArrowRight size={16} />
                      </Link>

                    </div>

                  </article>
                ))}

            </div>
          )}

        {/* =================================================
            MOBILE
        ================================================= */}

        {!loadingArticles &&
          !errorArticles &&
          articles.length > 0 && (
            <div className="mt-8 flex justify-center sm:hidden">

              <Link
                href="/articles"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm"
              >
                Lihat Semua Artikel
                <ArrowRight size={16} />
              </Link>

            </div>
          )}

      </section>

      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] px-8 py-12 shadow-lg sm:px-12 sm:py-16">

          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

          <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

          <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">

            <div className="max-w-2xl">

              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Butuh informasi lebih lanjut?
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-blue-100 sm:text-base">
                Hubungi kami untuk pertanyaan seputar
                pendaftaran, akademik, atau informasi
                sekolah lainnya.
              </p>

            </div>

            <Link
              href="/kontak"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-[#2563EB] shadow-sm transition hover:bg-blue-50"
            >
              Hubungi Kami
              <ArrowRight size={18} />
            </Link>

          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="bg-[#0F172A] px-5 py-12 text-white lg:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">

            <div>

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563EB] text-white">
                  <School size={20} />
                </div>

                <div className="flex flex-col leading-tight">

                  <span className="text-lg font-bold tracking-tight text-white">
                    Smart
                    <span className="text-blue-400">
                      School
                    </span>
                  </span>

                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Website Resmi Sekolah
                  </span>

                </div>
              </div>

              <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-400">
                Platform informasi dan layanan
                pendidikan sekolah yang modern,
                cepat, dan mudah diakses.
              </p>

            </div>

            <div>

              <h4 className="text-sm font-bold uppercase tracking-wider text-blue-400">
                Navigasi
              </h4>

              <ul className="mt-4 space-y-2.5 text-sm">

                <li>
                  <Link
                    href="/"
                    className="text-slate-400 transition hover:text-white"
                  >
                    Beranda
                  </Link>
                </li>

                <li>
                  <Link
                    href="/tentang"
                    className="text-slate-400 transition hover:text-white"
                  >
                    Tentang
                  </Link>
                </li>

                <li>
                  <Link
                    href="/akademik"
                    className="text-slate-400 transition hover:text-white"
                  >
                    Akademik
                  </Link>
                </li>

                <li>
                  <Link
                    href="/articles"
                    className="text-slate-400 transition hover:text-white"
                  >
                    Artikel
                  </Link>
                </li>

                <li>
                  <Link
                    href="/kontak"
                    className="text-slate-400 transition hover:text-white"
                  >
                    Kontak
                  </Link>
                </li>

              </ul>

            </div>

            <div>

              <h4 className="text-sm font-bold uppercase tracking-wider text-blue-400">
                Kontak
              </h4>

              <ul className="mt-4 space-y-2.5 text-sm text-slate-400">

                <li>
                  info@smartschool.sch.id
                </li>

                <li>
                  (021) 1234-5678
                </li>

                <li>
                  Senin – Jumat, 07.00 – 16.00
                </li>

              </ul>

            </div>

          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-slate-800 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">

            <p>
              ©{" "}
              {new Date().getFullYear()}{" "}
              SmartSchool. All rights reserved.
            </p>

            <p>
              Dibuat untuk pendidikan Indonesia.
            </p>

          </div>

        </div>
      </footer>

    </div>
  );
}

/* =========================================================
   FEATURE CARD
========================================================= */

function FeatureCard({
  icon: Icon,
  title,
  description,
  offset = false,
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-md ${
        offset
          ? "sm:translate-y-6"
          : ""
      }`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
        <Icon size={24} />
      </div>

      <h3 className="mt-5 text-base font-bold text-[#0F172A]">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   ARTICLE SKELETON
========================================================= */

function ArticleSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      <div className="h-48 w-full animate-pulse bg-slate-100" />

      <div className="space-y-3 p-6">

        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />

        <div className="h-3 w-full animate-pulse rounded bg-slate-100" />

        <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />

      </div>

    </div>
  );
}