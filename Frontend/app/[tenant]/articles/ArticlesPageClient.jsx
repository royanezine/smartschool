
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Loader2,
  AlertCircle,
  Menu,
  X,
  Newspaper,
  School,
  RefreshCw,
  Sparkles,
  BookOpen,
} from "lucide-react";


const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

function getApiBaseUrl() {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL belum dikonfigurasi."
    );
  }

  return API_URL.replace(/\/+$/, "")
    .replace(/\/api\/v1$/, "")
    .replace(/\/api$/, "");
}


const THEME = {
  primary: "var(--school-primary, #155DFC)",
  primaryHover: "var(--school-primary-hover, #0D47C9)",
  secondary: "var(--school-secondary, #3B82F6)",
  background: "var(--school-background, #F6F8FC)",
  surface: "var(--school-surface, #FFFFFF)",
  text: "var(--school-text, #0F172A)",
  muted: "var(--school-muted, #64748B)",
  border: "var(--school-border, #E2E8F0)",
  hero: "var(--school-hero-background, #071A36)",
};


export default function ArticlesPageClient({ tenant }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

 

  const loadArtikel = useCallback(async () => {
    if (!tenant || typeof tenant !== "string") {
      setArticles([]);
      setError("Subdomain sekolah tidak ditemukan.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const apiBaseUrl = getApiBaseUrl();

      const endpoint =
        `${apiBaseUrl}/api/publik/` +
        `${encodeURIComponent(tenant)}/artikel`;

      console.log("PUBLIC ARTICLES:", {
        tenant,
        endpoint,
      });

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      const responseText = await response.text();

      let result;

      try {
        result = responseText
          ? JSON.parse(responseText)
          : null;
      } catch {
        console.error(
          "Invalid API response:",
          responseText
        );

        throw new Error(
          `Respons server bukan JSON. Status: ${response.status}`
        );
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            `Gagal mengambil artikel. Status: ${response.status}`
        );
      }

      const data = result?.data ?? result;

      if (!Array.isArray(data)) {
        console.error(
          "Format artikel tidak sesuai:",
          result
        );

        throw new Error(
          "Format data artikel dari backend tidak sesuai."
        );
      }

      setArticles(data);
    } catch (err) {
      console.error("LOAD ARTIKEL ERROR:", err);

      setArticles([]);

      setError(
        err?.message ||
          "Terjadi kesalahan saat mengambil artikel."
      );
    } finally {
      setLoading(false);
    }
  }, [tenant]);

  useEffect(() => {
    loadArtikel();
  }, [loadArtikel]);


  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(parsedDate);
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

    if (/^https?:\/\//i.test(trimmedImage)) {
      return trimmedImage;
    }

    try {
      return `${getApiBaseUrl()}/${
        trimmedImage.replace(/^\/+/, "")
      }`;
    } catch {
      return null;
    }
  };


  const closeMobileMenu = () => {
    setMobileMenu(false);
  };

  const featuredArticle = articles[0];
  const otherArticles = articles.slice(1);

  const linkStyle = {
    color: THEME.primary,
  };

  const buttonStyle = {
    backgroundColor: THEME.primary,
    color: "#FFFFFF",
  };

  const mutedTextStyle = {
    color: THEME.muted,
  };

  const borderStyle = {
    borderColor: THEME.border,
  };

  const surfaceStyle = {
    backgroundColor: THEME.surface,
    borderColor: THEME.border,
    color: THEME.text,
  };


  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: THEME.background,
        color: THEME.text,
      }}
    >

      <header
        className="sticky top-0 z-50 border-b backdrop-blur-xl"
        style={{
          backgroundColor: THEME.surface,
          borderColor: THEME.border,
        }}
      >
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link
            href="/"
            className="group flex items-center gap-3"
            onClick={closeMobileMenu}
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl shadow-sm transition group-hover:scale-105"
              style={buttonStyle}
            >
              <School size={22} />
            </div>

            <div>
              <p className="text-[17px] font-bold tracking-tight">
                SmartSchool
              </p>

              <p
                className="text-[11px] font-medium tracking-wide"
                style={mutedTextStyle}
              >
                PORTAL SEKOLAH
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <Link
              href="/"
              className="text-sm font-medium transition hover:opacity-70"
            >
              Beranda
            </Link>

            <Link
              href="/tentang"
              className="text-sm font-medium transition hover:opacity-70"
            >
              Tentang
            </Link>

            <Link
              href="/akademik"
              className="text-sm font-medium transition hover:opacity-70"
            >
              Akademik
            </Link>

            <Link
              href="/articles"
              className="text-sm font-semibold"
              style={linkStyle}
            >
              Artikel
            </Link>

            <Link
              href="/kontak"
              className="text-sm font-medium transition hover:opacity-70"
            >
              Kontak
            </Link>
          </nav>

          <button
            type="button"
            onClick={() =>
              setMobileMenu((previous) => !previous)
            }
            className="rounded-xl border p-2.5 md:hidden"
            style={borderStyle}
            aria-label={
              mobileMenu ? "Tutup menu" : "Buka menu"
            }
            aria-expanded={mobileMenu}
          >
            {mobileMenu ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}
          </button>
        </div>

        {mobileMenu && (
          <div
            className="border-t px-5 py-4 md:hidden"
            style={{
              backgroundColor: THEME.surface,
              borderColor: THEME.border,
            }}
          >
            <nav className="mx-auto flex max-w-7xl flex-col gap-1">
              {[
                { href: "/", label: "Beranda" },
                { href: "/tentang", label: "Tentang" },
                { href: "/akademik", label: "Akademik" },
                { href: "/articles", label: "Artikel" },
                { href: "/kontak", label: "Kontak" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className="rounded-xl px-4 py-3 text-sm font-medium transition hover:opacity-70"
                  style={
                    item.href === "/articles"
                      ? {
                          color: THEME.primary,
                          backgroundColor:
                            "color-mix(in srgb, var(--school-primary, #155DFC) 10%, transparent)",
                        }
                      : mutedTextStyle
                  }
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>


      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: THEME.hero }}
      >
        <div
          className="absolute -right-40 -top-40 h-[440px] w-[440px] rounded-full blur-3xl"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--school-primary, #155DFC) 20%, transparent)",
          }}
        />

        <div
          className="absolute -bottom-40 -left-32 h-[380px] w-[380px] rounded-full blur-3xl"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--school-secondary, #3B82F6) 15%, transparent)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
          <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <div
                className="mb-6 flex items-center gap-2 text-sm font-medium"
                style={{ color: THEME.secondary }}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                  <Newspaper size={17} />
                </span>

                Pusat Informasi Sekolah
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Berita & Artikel
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Ikuti informasi terbaru mengenai kegiatan,
                program, prestasi, dan perkembangan sekolah.
              </p>
            </div>

            <div className="hidden shrink-0 lg:block">
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-6 py-5 backdrop-blur">
                <p
                  className="text-xs font-semibold uppercase tracking-[0.18em]"
                  style={{ color: THEME.secondary }}
                >
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


      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-16">

        {loading && (
          <div
            className="flex min-h-[350px] items-center justify-center rounded-3xl border shadow-sm"
            style={surfaceStyle}
          >
            <div className="flex flex-col items-center text-center">
              <Loader2
                size={36}
                className="animate-spin"
                style={linkStyle}
              />

              <h3 className="mt-5 text-lg font-bold">
                Memuat artikel
              </h3>

              <p
                className="mt-2 text-sm"
                style={mutedTextStyle}
              >
                Mengambil artikel dari website sekolah.
              </p>
            </div>
          </div>
        )}


        {!loading && error && (
          <div
            className="rounded-3xl border p-6 shadow-sm sm:p-9"
            style={surfaceStyle}
          >
            <div className="flex flex-col gap-5 sm:flex-row">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <AlertCircle size={23} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold">
                  Artikel tidak dapat dimuat
                </h3>

                <p
                  className="mt-2 text-sm leading-6"
                  style={mutedTextStyle}
                >
                  {error}
                </p>

                <div
                  className="mt-5 rounded-xl border bg-slate-50 p-4"
                  style={borderStyle}
                >
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Tenant
                  </p>

                  <p className="mt-2 break-all font-mono text-xs text-slate-600">
                    {tenant}
                  </p>

                  <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Endpoint
                  </p>

                  <p className="mt-2 break-all font-mono text-xs text-slate-600">
                    {API_URL}/api/publik/{encodeURIComponent(
                      tenant || ""
                    )}/artikel
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadArtikel}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition hover:opacity-90"
                  style={buttonStyle}
                >
                  <RefreshCw size={16} />
                  Coba Lagi
                </button>
              </div>
            </div>
          </div>
        )}


        {!loading && !error && articles.length === 0 && (
          <div
            className="rounded-3xl border px-6 py-20 text-center shadow-sm"
            style={surfaceStyle}
          >
            <div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--school-primary, #155DFC) 10%, transparent)",
                color: THEME.primary,
              }}
            >
              <Newspaper size={28} />
            </div>

            <h3 className="mt-6 text-xl font-bold">
              Belum ada artikel
            </h3>

            <p
              className="mx-auto mt-2 max-w-md text-sm leading-6"
              style={mutedTextStyle}
            >
              Artikel akan tampil setelah dipublikasikan
              oleh admin sekolah.
            </p>

            <Link
              href="/"
              className="mt-7 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition hover:opacity-90"
              style={buttonStyle}
            >
              <ArrowRight size={16} />
              Kembali ke Beranda
            </Link>
          </div>
        )}


        {!loading && !error && articles.length > 0 && (
          <>

            {featuredArticle && (
              <div className="mb-14">
                <div className="mb-6">
                  <p
                    className="text-xs font-bold uppercase tracking-[0.18em]"
                    style={linkStyle}
                  >
                    <Sparkles
                      size={14}
                      className="mr-2 inline"
                    />
                    Pilihan Utama
                  </p>

                  <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                    Informasi terbaru
                  </h2>
                </div>

                <article
                  className="group overflow-hidden rounded-3xl border shadow-sm transition hover:shadow-xl"
                  style={surfaceStyle}
                >
                  <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="relative min-h-[260px] overflow-hidden bg-slate-100 lg:min-h-[420px]">
                      {getImage(featuredArticle) ? (
                        <img
                          src={getImage(featuredArticle)}
                          alt={
                            featuredArticle.judul ||
                            "Artikel sekolah"
                          }
                          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                          loading="eager"
                          onError={(event) => {
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div className="flex min-h-[260px] h-full items-center justify-center">
                          <Newspaper
                            size={58}
                            className="text-slate-300"
                          />
                        </div>
                      )}

                      <div className="absolute left-5 top-5">
                        <span
                          className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold text-white"
                          style={{
                            backgroundColor: THEME.hero,
                          }}
                        >
                          <Sparkles size={13} />
                          Artikel Pilihan
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center p-7 sm:p-9 lg:p-12">
                      {featuredArticle.kategoriArtikel?.nama && (
                        <p
                          className="text-xs font-bold uppercase tracking-[0.16em]"
                          style={linkStyle}
                        >
                          {featuredArticle.kategoriArtikel.nama}
                        </p>
                      )}

                      <div
                        className="mt-3 flex items-center gap-2 text-xs font-medium"
                        style={mutedTextStyle}
                      >
                        <CalendarDays size={14} />

                        {formatDate(
                          featuredArticle.dibuatPada ||
                            featuredArticle.createdAt ||
                            featuredArticle.created_at
                        )}
                      </div>

                      <h3 className="mt-5 text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
                        {featuredArticle.judul ||
                          "Tanpa judul"}
                      </h3>

                      <p
                        className="mt-5 line-clamp-4 text-sm leading-7 sm:text-base"
                        style={mutedTextStyle}
                      >
                        {featuredArticle.ringkasan ||
                          "Baca informasi selengkapnya mengenai artikel ini."}
                      </p>

                      <Link
                        href={`${base}/articles/${featuredArticle.slug || featuredArticle.id}`}
                        className="mt-8 inline-flex w-fit items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition hover:opacity-90"
                        style={buttonStyle}
                      >
                        Baca Selengkapnya
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </article>
              </div>
            )}


            {otherArticles.length > 0 && (
              <div>
                <div className="mb-7">
                  <p
                    className="text-xs font-bold uppercase tracking-[0.18em]"
                    style={mutedTextStyle}
                  >
                    Informasi Sekolah
                  </p>

                  <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                    Artikel lainnya
                  </h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {otherArticles.map((article) => {
                    const image = getImage(article);

                    return (
                      <article
                        key={article.id}
                        className="group flex h-full flex-col overflow-hidden rounded-2xl border shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                        style={surfaceStyle}
                      >
                        <Link
                          href={`${base}/articles/${article.slug || article.id}`}
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
                            <div className="flex h-full items-center justify-center">
                              <Newspaper
                                size={42}
                                className="text-slate-300"
                              />
                            </div>
                          )}
                        </Link>

                        <div className="flex flex-1 flex-col p-6">
                          {article.kategoriArtikel?.nama && (
                            <p
                              className="text-xs font-semibold uppercase tracking-wider"
                              style={linkStyle}
                            >
                              {article.kategoriArtikel.nama}
                            </p>
                          )}

                          <div
                            className="mt-3 flex items-center gap-2 text-xs font-medium"
                            style={mutedTextStyle}
                          >
                            <CalendarDays size={14} />

                            {formatDate(
                              article.dibuatPada ||
                                article.createdAt ||
                                article.created_at
                            )}
                          </div>

                          <Link
                            href={`${base}/articles/${article.slug || article.id}`}
                            className="mt-3"
                          >
                            <h3 className="line-clamp-2 text-lg font-bold leading-7 transition group-hover:opacity-75">
                              {article.judul || "Tanpa judul"}
                            </h3>
                          </Link>

                          <p
                            className="mt-3 line-clamp-3 text-sm leading-6"
                            style={mutedTextStyle}
                          >
                            {article.ringkasan ||
                              "Baca informasi selengkapnya mengenai artikel ini."}
                          </p>

                          <div className="mt-auto pt-6">
                            <Link
                              href={`${base}/articles/${article.slug || article.id}`}
                              className="inline-flex items-center gap-2 text-sm font-semibold transition hover:opacity-70"
                              style={linkStyle}
                            >
                              Baca Selengkapnya
                              <ArrowRight size={16} />
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


      <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8">
        <div
          className="relative overflow-hidden rounded-3xl px-7 py-10 sm:px-10 lg:px-12 lg:py-12"
          style={{
            backgroundColor: THEME.primaryHover,
          }}
        >
          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">
                SmartSchool
              </p>

              <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Kenali sekolah lebih dekat
              </h2>

              <p className="mt-3 text-sm leading-7 text-white/80 sm:text-base">
                Jelajahi informasi mengenai sekolah,
                program akademik, serta layanan yang tersedia.
              </p>
            </div>

            <Link
              href="/tentang"
              className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold transition hover:bg-slate-100"
              style={{
                color: THEME.primaryHover,
              }}
            >
              Tentang Sekolah
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>


      <footer
        className="border-t"
        style={{
          backgroundColor: THEME.surface,
          borderColor: THEME.border,
        }}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-9 lg:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={buttonStyle}
              >
                <School size={19} />
              </div>

              <div>
                <p className="font-bold">SmartSchool</p>

                <p
                  className="text-xs"
                  style={mutedTextStyle}
                >
                  Portal informasi sekolah
                </p>
              </div>
            </div>

            <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
              <Link href="/" className="transition hover:opacity-70">
                Beranda
              </Link>

              <Link href="/tentang" className="transition hover:opacity-70">
                Tentang
              </Link>

              <Link href="/akademik" className="transition hover:opacity-70">
                Akademik
              </Link>

              <Link
                href="/articles"
                className="font-semibold"
                style={linkStyle}
              >
                Artikel
              </Link>

              <Link href="/kontak" className="transition hover:opacity-70">
                Kontak
              </Link>
            </nav>
          </div>

          <div
            className="border-t pt-5"
            style={borderStyle}
          >
            <p
              className="text-xs"
              style={mutedTextStyle}
            >
              © {new Date().getFullYear()} SmartSchool.
              Seluruh informasi sekolah dikelola melalui
              portal resmi.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
