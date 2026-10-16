
"use client";

import { useEffect, useState, useCallback } from "react";
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

  const loadArtikel = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const apiBaseUrl = getApiBaseUrl();

      if (!SUBDOMAIN) {
        throw new Error("Subdomain sekolah belum dikonfigurasi.");
      }

      const url =
        `${apiBaseUrl}/api/publik/` +
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
      } catch {
        console.error("Raw response:", responseText);
        throw new Error("Server mengembalikan response yang tidak valid.");
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
        throw new Error("Format data artikel dari server tidak valid.");
      }

      setArticles(data);
    } catch (err) {
      console.error("LOAD ARTIKEL ERROR:", err);
      setError(err?.message || "Terjadi kesalahan saat mengambil artikel.");
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArtikel();
  }, [loadArtikel]);

  const formatDate = (date) => {
    if (!date) return "-";

    try {
      const parsedDate = new Date(date);

      if (Number.isNaN(parsedDate.getTime())) return "-";

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

    if (!image || typeof image !== "string") return null;

    const trimmedImage = image.trim();

    if (!trimmedImage) return null;

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

  const closeMobileMenu = () => setMobileMenu(false);

  const featuredArticle = articles[0];
  const otherArticles = articles.slice(1);

  const linkStyle = {
    color: THEME.primary,
  };

  const buttonStyle = {
    backgroundColor: THEME.primary,
    color: "#FFFFFF",
  };

  const secondaryButtonStyle = {
    backgroundColor: THEME.primaryHover,
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
  };

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: THEME.background,
        color: THEME.text,
      }}
    >
      {/* HEADER */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-xl"
        style={{
          backgroundColor: THEME.surface,
          borderColor: THEME.border,
        }}
      >
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl shadow-lg transition duration-300 group-hover:scale-105"
              style={buttonStyle}
            >
              <School size={22} strokeWidth={2.2} />
            </div>

            <div>
              <p className="text-[17px] font-bold tracking-tight">
                SmartSchool
              </p>
              <p className="text-[11px] font-medium tracking-wide" style={mutedTextStyle}>
                PORTAL SEKOLAH
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/" className="text-sm font-medium transition hover:opacity-70">
              Beranda
            </Link>
            <Link href="/tentang" className="text-sm font-medium transition hover:opacity-70">
              Tentang
            </Link>
            <Link href="/akademik" className="text-sm font-medium transition hover:opacity-70">
              Akademik
            </Link>
            <Link
              href="/articles"
              className="relative text-sm font-semibold"
              style={linkStyle}
            >
              Artikel
              <span
                className="absolute -bottom-[28px] left-0 h-0.5 w-full rounded-full"
                style={{ backgroundColor: THEME.primary }}
              />
            </Link>
            <Link href="/kontak" className="text-sm font-medium transition hover:opacity-70">
              Kontak
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setMobileMenu((prev) => !prev)}
            className="rounded-xl border p-2.5 transition hover:opacity-70 md:hidden"
            style={borderStyle}
            aria-label={mobileMenu ? "Tutup menu" : "Buka menu"}
            aria-expanded={mobileMenu}
          >
            {mobileMenu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileMenu && (
          <div
            className="border-t px-6 py-5 md:hidden"
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
              ].map((item) => {
                const active = item.href === "/articles";

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className="rounded-xl px-4 py-3 text-sm font-medium transition hover:opacity-70"
                    style={
                      active
                        ? {
                            backgroundColor: `color-mix(in srgb, ${THEME.primary} 10%, transparent)`,
                            color: THEME.primary,
                          }
                        : mutedTextStyle
                    }
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* HERO */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: THEME.hero }}
      >
        <div
          className="absolute right-[-160px] top-[-180px] h-[440px] w-[440px] rounded-full blur-3xl"
          style={{
            backgroundColor: `color-mix(in srgb, ${THEME.primary} 20%, transparent)`,
          }}
        />
        <div
          className="absolute bottom-[-180px] left-[-120px] h-[380px] w-[380px] rounded-full blur-3xl"
          style={{
            backgroundColor: `color-mix(in srgb, ${THEME.secondary} 10%, transparent)`,
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
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
                Ikuti berbagai informasi terbaru mengenai kegiatan,
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
                <p className="mt-1 text-sm text-slate-400">artikel tersedia</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DAFTAR ARTIKEL */}
      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-16">
        {loading && (
          <div
            className="flex min-h-[420px] items-center justify-center rounded-3xl border shadow-sm"
            style={surfaceStyle}
          >
            <div className="flex flex-col items-center text-center">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: `color-mix(in srgb, ${THEME.primary} 10%, transparent)`,
                  color: THEME.primary,
                }}
              >
                <Loader2 size={30} className="animate-spin" />
              </div>
              <h3 className="mt-5 text-lg font-bold">Memuat artikel</h3>
              <p className="mt-2 text-sm" style={mutedTextStyle}>
                Mengambil informasi terbaru dari server sekolah.
              </p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-3xl border bg-white p-8 shadow-sm lg:p-10" style={borderStyle}>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <AlertCircle size={23} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold">Artikel tidak dapat dimuat</h3>
                <p className="mt-2 text-sm leading-6" style={mutedTextStyle}>
                  {error}
                </p>

                <div className="mt-5 rounded-xl border bg-slate-50 p-4" style={borderStyle}>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Endpoint
                  </p>
                  <p className="mt-2 break-all font-mono text-xs text-slate-600">
                    {API_URL}/api/publik/{SUBDOMAIN}/artikel
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
                backgroundColor: `color-mix(in srgb, ${THEME.primary} 10%, transparent)`,
                color: THEME.primary,
              }}
            >
              <Newspaper size={28} />
            </div>
            <h3 className="mt-6 text-xl font-bold">Belum ada artikel</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6" style={mutedTextStyle}>
              Belum terdapat artikel yang dipublikasikan oleh sekolah.
            </p>
            <Link
              href="/"
              className="mt-7 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition hover:opacity-90"
              style={buttonStyle}
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
                    <p
                      className="text-xs font-bold uppercase tracking-[0.18em]"
                      style={linkStyle}
                    >
                      Pilihan Utama
                    </p>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                      Informasi terbaru
                    </h2>
                  </div>
                  <Link
                    href={`/articles/${featuredArticle.id}`}
                    className="hidden items-center gap-2 text-sm font-semibold transition hover:opacity-70 sm:flex"
                    style={linkStyle}
                  >
                    Baca artikel
                    <ChevronRight size={17} />
                  </Link>
                </div>

                <article
                  className="group overflow-hidden rounded-3xl border shadow-sm transition duration-300 hover:shadow-xl"
                  style={surfaceStyle}
                >
                  <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="relative min-h-[280px] overflow-hidden bg-slate-100 lg:min-h-[430px]">
                      {getImage(featuredArticle) ? (
                        <img
                          src={getImage(featuredArticle)}
                          alt={featuredArticle.judul || "Artikel sekolah"}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                          loading="eager"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="flex min-h-[280px] h-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 lg:min-h-[430px]">
                          <Newspaper size={58} className="text-slate-300" />
                        </div>
                      )}

                      <div className="absolute left-5 top-5">
                        <span
                          className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold text-white backdrop-blur"
                          style={{ backgroundColor: THEME.hero }}
                        >
                          <Sparkles size={13} />
                          Artikel Terbaru
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

                      <div className="mt-3 flex items-center gap-2 text-xs font-medium" style={mutedTextStyle}>
                        <CalendarDays size={14} />
                        <span>
                          {formatDate(
                            featuredArticle.dibuatPada ||
                              featuredArticle.createdAt
                          )}
                        </span>
                      </div>

                      <h3
                        className="mt-5 text-2xl font-bold leading-tight tracking-tight transition sm:text-3xl"
                        style={{ color: THEME.text }}
                      >
                        {featuredArticle.judul}
                      </h3>

                      <p className="mt-5 line-clamp-4 text-sm leading-7 sm:text-base" style={mutedTextStyle}>
                        {featuredArticle.ringkasan ||
                          "Baca informasi selengkapnya mengenai artikel ini."}
                      </p>

                      <Link
                        href={`/articles/${featuredArticle.id}`}
                        className="mt-8 inline-flex w-fit items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition hover:opacity-90"
                        style={buttonStyle}
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
                    <p className="text-xs font-bold uppercase tracking-[0.18em]" style={mutedTextStyle}>
                      Informasi Sekolah
                    </p>
                    <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                      Artikel lainnya
                    </h2>
                  </div>
                  <div
                    className="hidden h-10 w-10 items-center justify-center rounded-xl sm:flex"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${THEME.primary} 10%, transparent)`,
                      color: THEME.primary,
                    }}
                  >
                    <Newspaper size={18} />
                  </div>
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
                          href={`/articles/${article.id}`}
                          className="relative block aspect-[16/10] overflow-hidden bg-slate-100"
                        >
                          {image ? (
                            <img
                              src={image}
                              alt={article.judul || "Artikel sekolah"}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                              loading="lazy"
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                              <Newspaper size={42} className="text-slate-300" />
                            </div>
                          )}

                          {article.kategoriArtikel?.nama && (
                            <div className="absolute left-4 top-4">
                              <span
                                className="rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold shadow-sm backdrop-blur"
                                style={linkStyle}
                              >
                                {article.kategoriArtikel.nama}
                              </span>
                            </div>
                          )}
                        </Link>

                        <div className="flex flex-1 flex-col p-6">
                          <div className="flex items-center gap-2 text-xs font-medium" style={mutedTextStyle}>
                            <CalendarDays size={14} />
                            <span>
                              {formatDate(
                                article.dibuatPada || article.createdAt
                              )}
                            </span>
                          </div>

                          <Link
                            href={`/articles/${article.id}`}
                            className="mt-3"
                          >
                            <h3
                              className="line-clamp-2 text-lg font-bold leading-7 transition group-hover:opacity-80"
                              style={{ color: THEME.text }}
                            >
                              {article.judul}
                            </h3>
                          </Link>

                          <p className="mt-3 line-clamp-3 text-sm leading-6" style={mutedTextStyle}>
                            {article.ringkasan ||
                              "Baca informasi selengkapnya mengenai artikel ini."}
                          </p>

                          <div className="mt-auto pt-6">
                            <Link
                              href={`/articles/${article.id}`}
                              className="inline-flex items-center gap-2 text-sm font-semibold transition hover:opacity-70"
                              style={linkStyle}
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

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
        <div
          className="relative overflow-hidden rounded-3xl px-7 py-10 sm:px-10 lg:px-12 lg:py-12"
          style={{ backgroundColor: THEME.primaryHover }}
        >
          <div className="absolute right-[-100px] top-[-120px] h-72 w-72 rounded-full bg-white/10 blur-3xl" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">
                SmartSchool
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Kenali sekolah lebih dekat
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/80 sm:text-base">
                Jelajahi informasi mengenai sekolah, program akademik,
                serta berbagai layanan yang tersedia.
              </p>
            </div>

            <Link
              href="/tentang"
              className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold transition hover:bg-slate-100"
              style={{ color: THEME.primaryHover }}
            >
              Tentang Sekolah
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="border-t"
        style={{
          backgroundColor: THEME.surface,
          borderColor: THEME.border,
        }}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-9 lg:px-8">
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
                <p className="text-xs" style={mutedTextStyle}>
                  Portal informasi sekolah
                </p>
              </div>
            </div>

            <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
              <Link href="/" className="transition hover:opacity-70">Beranda</Link>
              <Link href="/tentang" className="transition hover:opacity-70">Tentang</Link>
              <Link href="/akademik" className="transition hover:opacity-70">Akademik</Link>
              <Link href="/articles" className="font-semibold" style={linkStyle}>Artikel</Link>
              <Link href="/kontak" className="transition hover:opacity-70">Kontak</Link>
            </nav>
          </div>

          <div className="border-t pt-5" style={borderStyle}>
            <p className="text-xs" style={mutedTextStyle}>
              © {new Date().getFullYear()} SmartSchool. Seluruh informasi
              sekolah dikelola melalui portal resmi.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
