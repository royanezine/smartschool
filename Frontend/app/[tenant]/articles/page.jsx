"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Loader2,
  AlertCircle,
  Menu,
  X,
  Newspaper,
  School,
  RefreshCw,
  Sparkles,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const SUBDOMAIN = "smart";

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  const getApiBaseUrl = () => {
    if (!API_URL) {
      throw new Error("NEXT_PUBLIC_API_URL belum dikonfigurasi.");
    }

    return API_URL.replace(/\/+$/, "")
      .replace(/\/api\/v1$/, "")
      .replace(/\/api$/, "");
  };

  const loadArtikel = async () => {
    try {
      setLoading(true);
      setError("");

      const apiBaseUrl = getApiBaseUrl();

      if (!SUBDOMAIN) {
        throw new Error("Subdomain sekolah belum dikonfigurasi.");
      }

      const url =
        `${apiBaseUrl}/api/v1/publik/` +
        `${encodeURIComponent(SUBDOMAIN)}/artikel`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      const responseText = await response.text();

      let result = null;

      try {
        result = responseText ? JSON.parse(responseText) : null;
      } catch (jsonError) {
        console.error("Gagal membaca JSON:", jsonError);
        console.error("Raw response:", responseText);

        throw new Error(
          "Server mengembalikan response yang tidak valid."
        );
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            `Gagal mengambil artikel. Status: ${response.status}`
        );
      }

      const data = result?.data;

      if (!Array.isArray(data)) {
        throw new Error(
          "Format data artikel dari server tidak valid."
        );
      }

      setArticles(data);
    } catch (err) {
      console.error("LOAD ARTIKEL ERROR:", err);

      setError(
        err?.message ||
          "Terjadi kesalahan saat mengambil artikel."
      );

      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArtikel();
  }, []);

  const formatDate = (date) => {
    if (!date) return "-";

    try {
      const parsedDate = new Date(date);

      if (Number.isNaN(parsedDate.getTime())) {
        return "-";
      }

      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(parsedDate);
    } catch {
      return "-";
    }
  };

  const getImage = (article) => {
    const image = article?.gambarUtama;

    if (!image || typeof image !== "string") {
      return null;
    }

    const trimmedImage = image.trim();

    if (!trimmedImage) {
      return null;
    }

    if (
      trimmedImage.startsWith("http://") ||
      trimmedImage.startsWith("https://")
    ) {
      return trimmedImage;
    }

    if (API_URL) {
      return `${API_URL.replace(/\/+$/, "")}/${trimmedImage.replace(
        /^\/+/,
        ""
      )}`;
    }

    return trimmedImage;
  };

  const closeMobileMenu = () => {
    setMobileMenu(false);
  };

  const featuredArticle = articles[0];
  const otherArticles = articles.slice(1);

  return (
    <main className="min-h-screen bg-[#F6F8FC] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link
            href="/"
            className="group flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#155DFC] text-white shadow-lg shadow-blue-600/20 transition duration-300 group-hover:scale-105">
              <School size={22} strokeWidth={2.2} />
            </div>

            <div>
              <p className="text-[17px] font-bold tracking-tight text-slate-950">
                SmartSchool
              </p>
              <p className="text-[11px] font-medium tracking-wide text-slate-400">
                PORTAL SEKOLAH
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/"
              className="text-sm font-medium text-slate-500 transition hover:text-[#155DFC]"
            >
              Beranda
            </Link>

            <Link
              href="/tentang"
              className="text-sm font-medium text-slate-500 transition hover:text-[#155DFC]"
            >
              Tentang
            </Link>

            <Link
              href="/akademik"
              className="text-sm font-medium text-slate-500 transition hover:text-[#155DFC]"
            >
              Akademik
            </Link>

            <Link
              href="/articles"
              className="relative text-sm font-semibold text-[#155DFC]"
            >
              Artikel
              <span className="absolute -bottom-[28px] left-0 h-0.5 w-full rounded-full bg-[#155DFC]" />
            </Link>

            <Link
              href="/kontak"
              className="text-sm font-medium text-slate-500 transition hover:text-[#155DFC]"
            >
              Kontak
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setMobileMenu((prev) => !prev)}
            className="rounded-xl border border-slate-200 p-2.5 text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#155DFC] md:hidden"
            aria-label={mobileMenu ? "Tutup menu" : "Buka menu"}
            aria-expanded={mobileMenu}
          >
            {mobileMenu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileMenu && (
          <div className="border-t border-slate-200 bg-white px-6 py-5 md:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col gap-1">
              <Link
                href="/"
                onClick={closeMobileMenu}
                className="rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-[#155DFC]"
              >
                Beranda
              </Link>

              <Link
                href="/tentang"
                onClick={closeMobileMenu}
                className="rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-[#155DFC]"
              >
                Tentang
              </Link>

              <Link
                href="/akademik"
                onClick={closeMobileMenu}
                className="rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-[#155DFC]"
              >
                Akademik
              </Link>

              <Link
                href="/articles"
                onClick={closeMobileMenu}
                className="rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-[#155DFC]"
              >
                Artikel
              </Link>

              <Link
                href="/kontak"
                onClick={closeMobileMenu}
                className="rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-[#155DFC]"
              >
                Kontak
              </Link>
            </nav>
          </div>
        )}
      </header>

      <section className="relative overflow-hidden bg-[#071A36]">
        <div className="absolute right-[-160px] top-[-180px] h-[440px] w-[440px] rounded-full bg-blue-600/20 blur-3xl" />

        <div className="absolute bottom-[-180px] left-[-120px] h-[380px] w-[380px] rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <div className="mb-6 flex items-center gap-2 text-sm font-medium text-blue-300">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                  <Newspaper size={17} />
                </span>
                Pusat Informasi Sekolah
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Berita & Artikel
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Ikuti berbagai informasi terbaru mengenai kegiatan,
                program, prestasi, dan perkembangan sekolah.
              </p>
            </div>

            <div className="hidden shrink-0 lg:block">
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-6 py-5 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
                  Koleksi Informasi
                </p>

                <p className="mt-2 text-3xl font-bold text-white">
                  {articles.length}
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  artikel tersedia
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-16">
        {loading && (
          <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                <Loader2
                  size={30}
                  className="animate-spin text-[#155DFC]"
                />
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                Memuat artikel
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Mengambil informasi terbaru dari server sekolah.
              </p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-3xl border border-red-200 bg-white p-8 shadow-sm lg:p-10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <AlertCircle size={23} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-slate-900">
                  Artikel tidak dapat dimuat
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {error}
                </p>

                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Endpoint
                  </p>

                  <p className="mt-2 break-all font-mono text-xs text-slate-600">
                    {API_URL}/api/v1/publik/{SUBDOMAIN}/artikel
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadArtikel}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#155DFC] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0D47C9]"
                >
                  <RefreshCw size={16} />
                  Coba Lagi
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && articles.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#155DFC]">
              <Newspaper size={28} />
            </div>

            <h3 className="mt-6 text-xl font-bold text-slate-900">
              Belum ada artikel
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Belum terdapat artikel yang dipublikasikan oleh
              sekolah.
            </p>

            <Link
              href="/"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#155DFC] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0D47C9]"
            >
              Kembali ke Beranda
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {!loading && !error && articles.length > 0 && (
          <>
            {featuredArticle && (
              <div className="mb-14">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#155DFC]">
                      Pilihan Utama
                    </p>

                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                      Informasi terbaru
                    </h2>
                  </div>

                  <Link
                    href={`/articles/${featuredArticle.id}`}
                    className="hidden items-center gap-2 text-sm font-semibold text-[#155DFC] transition hover:text-[#0D47C9] sm:flex"
                  >
                    Baca artikel
                    <ChevronRight size={17} />
                  </Link>
                </div>

                <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:shadow-xl">
                  <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="relative min-h-[280px] overflow-hidden bg-slate-100 lg:min-h-[430px]">
                      {getImage(featuredArticle) ? (
                        <img
                          src={getImage(featuredArticle)}
                          alt={
                            featuredArticle.judul ||
                            "Artikel sekolah"
                          }
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                          loading="eager"
                          onError={(event) => {
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div className="flex h-full min-h-[280px] items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 lg:min-h-[430px]">
                          <Newspaper
                            size={58}
                            className="text-blue-200"
                          />
                        </div>
                      )}

                      <div className="absolute left-5 top-5">
                        <span className="inline-flex items-center gap-2 rounded-lg bg-[#071A36]/90 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur">
                          <Sparkles size={13} />
                          Artikel Terbaru
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center p-7 sm:p-9 lg:p-12">
                      {featuredArticle.kategoriArtikel?.nama && (
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#155DFC]">
                          {featuredArticle.kategoriArtikel.nama}
                        </p>
                      )}

                      <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-400">
                        <CalendarDays size={14} />

                        <span>
                          {formatDate(
                            featuredArticle.dibuatPada ||
                              featuredArticle.createdAt
                          )}
                        </span>
                      </div>

                      <h3 className="mt-5 text-2xl font-bold leading-tight tracking-tight text-slate-900 transition group-hover:text-[#155DFC] sm:text-3xl">
                        {featuredArticle.judul}
                      </h3>

                      <p className="mt-5 line-clamp-4 text-sm leading-7 text-slate-500 sm:text-base">
                        {featuredArticle.ringkasan ||
                          "Baca informasi selengkapnya mengenai artikel ini."}
                      </p>

                      <Link
                        href={`/articles/${featuredArticle.id}`}
                        className="mt-8 inline-flex w-fit items-center gap-2 rounded-xl bg-[#155DFC] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0D47C9]"
                      >
                        Baca Selengkapnya
                        <ArrowRight
                          size={16}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </Link>
                    </div>
                  </div>
                </article>
              </div>
            )}

            {otherArticles.length > 0 && (
              <div>
                <div className="mb-7 flex items-end justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                      Informasi Sekolah
                    </p>

                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                      Artikel lainnya
                    </h2>
                  </div>

                  <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#155DFC] sm:flex">
                    <Newspaper size={18} />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {otherArticles.map((article) => {
                    const image = getImage(article);

                    return (
                      <article
                        key={article.id}
                        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
                      >
                        <Link
                          href={`/articles/${article.id}`}
                          className="relative block aspect-[16/10] overflow-hidden bg-slate-100"
                        >
                          {image ? (
                            <img
                              src={image}
                              alt={
                                article.judul ||
                                "Artikel sekolah"
                              }
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                              loading="lazy"
                              onError={(event) => {
                                event.currentTarget.style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
                              <Newspaper
                                size={42}
                                className="text-blue-200"
                              />
                            </div>
                          )}

                          {article.kategoriArtikel?.nama && (
                            <div className="absolute left-4 top-4">
                              <span className="rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#155DFC] shadow-sm backdrop-blur">
                                {article.kategoriArtikel.nama}
                              </span>
                            </div>
                          )}
                        </Link>

                        <div className="flex flex-1 flex-col p-6">
                          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                            <CalendarDays size={14} />

                            <span>
                              {formatDate(
                                article.dibuatPada ||
                                  article.createdAt
                              )}
                            </span>
                          </div>

                          <Link
                            href={`/articles/${article.id}`}
                            className="mt-3"
                          >
                            <h3 className="line-clamp-2 text-lg font-bold leading-7 text-slate-900 transition group-hover:text-[#155DFC]">
                              {article.judul}
                            </h3>
                          </Link>

                          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                            {article.ringkasan ||
                              "Baca informasi selengkapnya mengenai artikel ini."}
                          </p>

                          <div className="mt-auto pt-6">
                            <Link
                              href={`/articles/${article.id}`}
                              className="inline-flex items-center gap-2 text-sm font-semibold text-[#155DFC] transition hover:text-[#0D47C9]"
                            >
                              Baca Selengkapnya
                              <ArrowRight
                                size={16}
                                className="transition-transform duration-300 group-hover:translate-x-1"
                              />
                            </Link>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[#0D47C9] px-7 py-10 sm:px-10 lg:px-12 lg:py-12">
          <div className="absolute right-[-100px] top-[-120px] h-72 w-72 rounded-full bg-white/10 blur-3xl" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">
                SmartSchool
              </p>

              <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Kenali sekolah lebih dekat
              </h2>

              <p className="mt-3 text-sm leading-7 text-blue-100 sm:text-base">
                Jelajahi informasi mengenai sekolah, program
                akademik, serta berbagai layanan yang tersedia.
              </p>
            </div>

            <Link
              href="/tentang"
              className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#0D47C9] transition hover:bg-blue-50"
            >
              Tentang Sekolah
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-9 lg:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#155DFC] text-white">
                <School size={19} />
              </div>

              <div>
                <p className="font-bold text-slate-900">
                  SmartSchool
                </p>

                <p className="text-xs text-slate-400">
                  Portal informasi sekolah
                </p>
              </div>
            </div>

            <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
              <Link
                href="/"
                className="text-slate-500 transition hover:text-[#155DFC]"
              >
                Beranda
              </Link>

              <Link
                href="/tentang"
                className="text-slate-500 transition hover:text-[#155DFC]"
              >
                Tentang
              </Link>

              <Link
                href="/akademik"
                className="text-slate-500 transition hover:text-[#155DFC]"
              >
                Akademik
              </Link>

              <Link
                href="/articles"
                className="font-semibold text-[#155DFC]"
              >
                Artikel
              </Link>

              <Link
                href="/kontak"
                className="text-slate-500 transition hover:text-[#155DFC]"
              >
                Kontak
              </Link>
            </nav>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} SmartSchool. Seluruh
              informasi sekolah dikelola melalui portal resmi.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}