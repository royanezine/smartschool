
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Loader2,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  School,
  X,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const SLUG_KONTAK = "kontak-1789495236882";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=2000&q=85";

const THEME = {
  primary: "var(--school-primary, #155DFC)",
  primaryHover: "var(--school-primary-hover, #0D47C9)",
  secondary: "var(--school-secondary, #3B82F6)",
  background: "var(--school-background, #F8FAFC)",
  surface: "var(--school-surface, #FFFFFF)",
  text: "var(--school-text, #0F172A)",
  muted: "var(--school-muted, #64748B)",
  border: "var(--school-border, #E2E8F0)",
  hero: "var(--school-hero-background, #071A36)",
};

export default function KontakPage() {
  const params = useParams();

  const subdomain =
    typeof params?.tenant === "string"
      ? params.tenant
      : Array.isArray(params?.tenant)
        ? params.tenant[0] || ""
        : "";

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  const fetchKontak = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      if (!API_URL) {
        throw new Error(
          "NEXT_PUBLIC_API_URL belum dikonfigurasi."
        );
      }

      if (!SLUG_KONTAK) {
        throw new Error("Slug halaman kontak belum diatur.");
      }

      const apiBaseUrl = API_URL.replace(/\/+$/, "")
        .replace(/\/api\/v1$/, "")
        .replace(/\/api$/, "");

      const response = await fetch(
        `${apiBaseUrl}/api/publik/${encodeURIComponent(
          subdomain
        )}/halaman/${encodeURIComponent(SLUG_KONTAK)}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      const responseText = await response.text();
      let result = null;

      try {
        result = responseText ? JSON.parse(responseText) : null;
      } catch {
        throw new Error(
          "Server mengembalikan response yang tidak valid."
        );
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            `Gagal mengambil data kontak. Status: ${response.status}`
        );
      }

      setPage(result?.data || null);
    } catch (err) {
      console.error("FETCH KONTAK ERROR:", err);
      setError(
        err?.message ||
          "Terjadi kesalahan saat mengambil data kontak."
      );
      setPage(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKontak();
  }, [fetchKontak]);

  const navigation = [
    { label: "Beranda", href: "/" },
    { label: "Tentang", href: "/tentang" },
    { label: "Akademik", href: "/akademik" },
    { label: "Artikel", href: "/articles" },
    { label: "Kontak", href: "/kontak" },
  ];

  const surfaceStyle = {
    backgroundColor: THEME.surface,
    borderColor: THEME.border,
  };

  const mutedStyle = {
    color: THEME.muted,
  };

  const primaryButtonStyle = {
    backgroundColor: THEME.primary,
    color: "#FFFFFF",
  };

  const getPageImage = () => {
    const image = page?.gambarUrl;

    if (!image || typeof image !== "string") {
      return null;
    }

    if (/^https?:\/\//i.test(image)) {
      return image;
    }

    if (!API_URL) {
      return image;
    }

    return `${API_URL.replace(/\/+$/, "")}/${image.replace(
      /^\/+/,
      ""
    )}`;
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
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm"
              style={primaryButtonStyle}
            >
              <GraduationCap className="h-5 w-5" />
            </div>

            <div>
              <p className="text-[15px] font-bold tracking-tight">
                SmartSchool
              </p>
              <p className="text-[11px] font-medium" style={mutedStyle}>
                Sekolah Modern & Berkualitas
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navigation.map((item) => {
              const active = item.href === "/kontak";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative text-sm transition hover:opacity-70"
                  style={{
                    color: active ? THEME.primary : THEME.muted,
                    fontWeight: active ? 600 : 500,
                  }}
                >
                  {item.label}

                  {active && (
                    <span
                      className="absolute -bottom-[29px] left-0 right-0 h-0.5 rounded-full"
                      style={{ backgroundColor: THEME.primary }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/akademik"
              className="hidden items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition hover:opacity-90 lg:inline-flex"
              style={primaryButtonStyle}
            >
              Jelajahi Akademik
              <ArrowRight className="h-4 w-4" />
            </Link>

            <button
              type="button"
              aria-label={mobileMenu ? "Tutup menu" : "Buka menu"}
              aria-expanded={mobileMenu}
              onClick={() => setMobileMenu((current) => !current)}
              className="rounded-xl border p-2.5 transition hover:opacity-70 md:hidden"
              style={surfaceStyle}
            >
              {mobileMenu ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div
            className="border-t px-6 py-5 md:hidden"
            style={surfaceStyle}
          >
            <nav className="mx-auto flex max-w-7xl flex-col gap-1">
              {navigation.map((item) => {
                const active = item.href === "/kontak";

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenu(false)}
                    className="rounded-xl px-4 py-3 text-sm transition"
                    style={{
                      backgroundColor: active
                        ? `color-mix(in srgb, ${THEME.primary} 10%, transparent)`
                        : "transparent",
                      color: active ? THEME.primary : THEME.muted,
                      fontWeight: active ? 600 : 500,
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: THEME.hero }}
      >
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt="Lingkungan SmartSchool"
            className="h-full w-full object-cover"
          />

          <div
            className="absolute inset-0"
            style={{
              backgroundColor: "rgb(2 6 23 / 75%)",
            }}
          />

          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right, ${THEME.hero}, color-mix(in srgb, ${THEME.hero} 80%, transparent), color-mix(in srgb, ${THEME.primary} 40%, transparent))`,
            }}
          />
        </div>

        <div
          className="absolute -right-32 -top-32 h-96 w-96 rounded-full blur-3xl"
          style={{
            backgroundColor: `color-mix(in srgb, ${THEME.primary} 25%, transparent)`,
          }}
        />

        <div
          className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full blur-3xl"
          style={{
            backgroundColor: `color-mix(in srgb, ${THEME.secondary} 15%, transparent)`,
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_420px]">
            <div className="max-w-3xl">
              <div
                className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] backdrop-blur"
                style={{
                  borderColor: `color-mix(in srgb, ${THEME.secondary} 30%, transparent)`,
                  backgroundColor: `color-mix(in srgb, ${THEME.primary} 15%, transparent)`,
                  color: THEME.secondary,
                }}
              >
                <MessageCircle className="h-4 w-4" />
                Contact Center
              </div>

              <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Mari Terhubung
                <span
                  className="block"
                  style={{ color: THEME.secondary }}
                >
                  Bersama SmartSchool
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Punya pertanyaan mengenai sekolah, program akademik,
                kegiatan, atau informasi lainnya? Temukan informasi
                kontak SmartSchool melalui halaman ini.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="#informasi-kontak"
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold shadow-lg transition hover:opacity-90"
                  style={primaryButtonStyle}
                >
                  Lihat Informasi
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/akademik"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  Program Akademik
                </Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="rounded-[28px] border border-white/10 bg-white/10 p-3 shadow-2xl backdrop-blur-md">
                <div className="relative overflow-hidden rounded-2xl">
                  <img
                    src={HERO_IMAGE}
                    alt="Fasilitas sekolah SmartSchool"
                    className="h-[330px] w-full object-cover"
                  />

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent p-6">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={primaryButtonStyle}
                      >
                        <School className="h-5 w-5" />
                      </div>

                      <div>
                        <p
                          className="text-xs font-medium"
                          style={{ color: THEME.secondary }}
                        >
                          SmartSchool
                        </p>
                        <p className="text-sm font-semibold text-white">
                          Ruang untuk tumbuh dan berkembang
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="informasi-kontak"
        className="relative z-10 -mt-8 px-6 lg:px-8"
      >
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 lg:grid-cols-4">
          <ContactCard
            icon={<MapPin className="h-5 w-5" />}
            title="Alamat"
            description="Informasi lokasi dan alamat sekolah."
          />
          <ContactCard
            icon={<Phone className="h-5 w-5" />}
            title="Telepon"
            description="Hubungi sekolah melalui nomor resmi."
          />
          <ContactCard
            icon={<Mail className="h-5 w-5" />}
            title="Email"
            description="Kirim pertanyaan melalui email sekolah."
          />
          <ContactCard
            icon={<Clock3 className="h-5 w-5" />}
            title="Jam Layanan"
            description="Informasi waktu pelayanan sekolah."
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_330px] lg:gap-16">
          <div>
            <div className="mb-8">
              <span
                className="text-xs font-bold uppercase tracking-[0.2em]"
                style={{ color: THEME.primary }}
              >
                Informasi Sekolah
              </span>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                {page?.judul || "Kontak SmartSchool"}
              </h2>

              <p className="mt-4 max-w-2xl text-base leading-7" style={mutedStyle}>
                Informasi berikut dikelola melalui sistem SmartSchool
                sehingga pihak sekolah dapat memperbarui informasi
                kontak sesuai kebutuhan.
              </p>
            </div>

            {loading && (
              <div
                className="flex min-h-[360px] items-center justify-center rounded-3xl border shadow-sm"
                style={surfaceStyle}
              >
                <div className="text-center">
                  <div
                    className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${THEME.primary} 10%, transparent)`,
                      color: THEME.primary,
                    }}
                  >
                    <Loader2 className="h-7 w-7 animate-spin" />
                  </div>

                  <h3 className="mt-5 font-semibold">
                    Memuat informasi kontak
                  </h3>

                  <p className="mt-2 text-sm" style={mutedStyle}>
                    Sedang mengambil informasi dari server.
                  </p>
                </div>
              </div>
            )}

            {!loading && error && (
              <div
                className="rounded-3xl border p-8 shadow-sm"
                style={surfaceStyle}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50">
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  </div>

                  <div>
                    <h3 className="font-bold">
                      Informasi belum dapat dimuat
                    </h3>

                    <p className="mt-2 text-sm leading-7" style={mutedStyle}>
                      {error}
                    </p>

                    <button
                      type="button"
                      onClick={fetchKontak}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition hover:opacity-90"
                      style={primaryButtonStyle}
                    >
                      <ArrowRight className="h-4 w-4" />
                      Coba Lagi
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!loading && !error && !page && (
              <div
                className="rounded-3xl border p-12 text-center shadow-sm"
                style={surfaceStyle}
              >
                <div
                  className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${THEME.primary} 10%, transparent)`,
                    color: THEME.primary,
                  }}
                >
                  <MessageCircle className="h-6 w-6" />
                </div>

                <h3 className="mt-5 text-lg font-bold">
                  Informasi belum tersedia
                </h3>

                <p className="mt-2 text-sm leading-6" style={mutedStyle}>
                  Konten halaman kontak belum tersedia untuk saat ini.
                </p>
              </div>
            )}

            {!loading && !error && page && (
              <article
                className="overflow-hidden rounded-3xl border shadow-sm"
                style={surfaceStyle}
              >
                {getPageImage() && (
                  <div className="overflow-hidden">
                    <img
                      src={getPageImage()}
                      alt={page.judul || "Informasi SmartSchool"}
                      className="max-h-[480px] w-full object-cover"
                    />
                  </div>
                )}

                <div className="p-7 sm:p-10">
                  <div className="mb-7 flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${THEME.primary} 10%, transparent)`,
                        color: THEME.primary,
                      }}
                    >
                      <School className="h-5 w-5" />
                    </div>

                    <div>
                      <p
                        className="text-xs font-bold uppercase tracking-[0.16em]"
                        style={{ color: THEME.primary }}
                      >
                        SmartSchool
                      </p>
                      <p className="text-sm" style={mutedStyle}>
                        Informasi resmi sekolah
                      </p>
                    </div>
                  </div>

                  <div
                    className="
                      text-[15px] leading-8
                      [&_p]:mb-5 [&_p:last-child]:mb-0
                      [&_h1]:mb-5 [&_h1]:text-3xl [&_h1]:font-bold
                      [&_h2]:mb-4 [&_h2]:mt-9 [&_h2]:text-2xl [&_h2]:font-bold
                      [&_h3]:mb-3 [&_h3]:mt-7 [&_h3]:text-xl [&_h3]:font-bold
                      [&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-6
                      [&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:pl-6
                      [&_li]:mb-2 [&_strong]:font-semibold
                      [&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-2
                      [&_blockquote]:my-7 [&_blockquote]:border-l-4 [&_blockquote]:pl-5
                      [&_img]:my-7 [&_img]:rounded-2xl
                    "
                    style={{ color: THEME.text }}
                    dangerouslySetInnerHTML={{
                      __html:
                        page.konten ||
                        page.isi ||
                        page.deskripsi ||
                        "<p>Informasi kontak belum tersedia.</p>",
                    }}
                  />
                </div>
              </article>
            )}
          </div>

          <aside className="space-y-5">
            <div
              className="rounded-3xl p-7 text-white shadow-lg"
              style={{ backgroundColor: THEME.hero }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl"
                style={primaryButtonStyle}
              >
                <MessageCircle className="h-5 w-5" />
              </div>

              <p
                className="mt-6 text-xs font-bold uppercase tracking-[0.18em]"
                style={{ color: THEME.secondary }}
              >
                Butuh Informasi?
              </p>

              <h3 className="mt-2 text-xl font-bold">
                Kami siap membantu
              </h3>

              <p className="mt-4 text-sm leading-7 text-white/75">
                Gunakan informasi kontak sekolah untuk mendapatkan
                informasi lebih lanjut mengenai SmartSchool.
              </p>

              <Link
                href="/akademik"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition hover:opacity-90"
                style={primaryButtonStyle}
              >
                Lihat Akademik
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div
              className="rounded-3xl border p-7 shadow-sm"
              style={surfaceStyle}
            >
              <p
                className="text-xs font-bold uppercase tracking-[0.18em]"
                style={{ color: THEME.primary }}
              >
                Mengapa SmartSchool
              </p>

              <h3 className="mt-2 text-xl font-bold">
                Terhubung dalam satu ekosistem
              </h3>

              <div className="mt-6 space-y-5">
                <InfoItem
                  title="Informasi Terpusat"
                  description="Informasi sekolah dapat dikelola melalui satu sistem."
                />
                <InfoItem
                  title="Komunikasi Lebih Mudah"
                  description="Memudahkan siswa, orang tua, dan masyarakat mendapatkan informasi."
                />
                <InfoItem
                  title="Layanan Terintegrasi"
                  description="Berbagai kebutuhan informasi sekolah tersedia secara digital."
                />
              </div>
            </div>

            <div
              className="rounded-3xl border p-7"
              style={{
                backgroundColor: `color-mix(in srgb, ${THEME.primary} 7%, ${THEME.surface})`,
                borderColor: `color-mix(in srgb, ${THEME.primary} 20%, ${THEME.border})`,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: THEME.surface,
                    color: THEME.primary,
                  }}
                >
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-bold">SmartSchool</p>
                  <p className="text-xs" style={mutedStyle}>
                    Sekolah modern & berkualitas
                  </p>
                </div>
              </div>

              <p className="mt-5 text-sm leading-7" style={mutedStyle}>
                Membangun lingkungan pendidikan yang mendukung
                pembelajaran, karakter, dan perkembangan potensi siswa.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section
        className="py-20"
        style={{ backgroundColor: THEME.surface }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div
            className="relative overflow-hidden rounded-[32px] px-8 py-12 shadow-xl sm:px-12 lg:px-16 lg:py-14"
            style={{ backgroundColor: THEME.primary }}
          >
            <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-40 -left-20 h-80 w-80 rounded-full bg-black/10 blur-2xl" />

            <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/75">
                  Temukan Lebih Banyak
                </p>

                <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Kenali SmartSchool lebih dekat
                </h2>

                <p className="mt-4 text-base leading-7 text-white/80">
                  Jelajahi program akademik dan berbagai informasi
                  sekolah yang tersedia untuk peserta didik dan masyarakat.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/tentang"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold transition hover:bg-slate-100"
                  style={{ color: THEME.primary }}
                >
                  Tentang Kami
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/articles"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  Artikel Sekolah
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer
        className="text-white"
        style={{ backgroundColor: THEME.hero }}
      >
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <Link href="/" className="inline-flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={primaryButtonStyle}
                >
                  <GraduationCap className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-bold tracking-tight">SmartSchool</p>
                  <p className="text-xs text-white/60">
                    Sekolah Modern & Berkualitas
                  </p>
                </div>
              </Link>

              <p className="mt-5 max-w-md text-sm leading-7 text-white/60">
                Membangun generasi unggul melalui pendidikan yang
                berkualitas, berkarakter, dan adaptif terhadap perkembangan zaman.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold">Navigasi</h3>
              <div className="mt-4 space-y-3">
                <FooterLink href="/" label="Beranda" />
                <FooterLink href="/tentang" label="Tentang" />
                <FooterLink href="/akademik" label="Akademik" />
                <FooterLink href="/articles" label="Artikel" />
                <FooterLink href="/kontak" label="Kontak" />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold">Informasi</h3>
              <div className="mt-4 space-y-3">
                <FooterLink href="/akademik" label="Program Akademik" />
                <FooterLink href="/articles" label="Artikel Sekolah" />
                <FooterLink href="/tentang" label="Profil Sekolah" />
                <FooterLink href="/kontak" label="Hubungi Kami" />
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6">
            <p className="text-center text-sm text-white/50">
              © {new Date().getFullYear()} SmartSchool. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function ContactCard({ icon, title, description }) {
  return (
    <div
      className="group rounded-2xl border p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
      style={{
        backgroundColor: THEME.surface,
        borderColor: THEME.border,
      }}
    >
      <div
        className="flex h-11 w-11 items-center justify-center rounded-xl"
        style={{
          backgroundColor: `color-mix(in srgb, ${THEME.primary} 10%, transparent)`,
          color: THEME.primary,
        }}
      >
        {icon}
      </div>

      <h3 className="mt-5 font-bold">{title}</h3>

      <p className="mt-2 text-sm leading-6" style={{ color: THEME.muted }}>
        {description}
      </p>

      <div
        className="mt-4 flex items-center gap-2 text-xs font-semibold"
        style={{ color: THEME.primary }}
      >
        Informasi tersedia
        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
      </div>
    </div>
  );
}

function InfoItem({ title, description }) {
  return (
    <div className="flex gap-3">
      <div
        className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
        style={{
          backgroundColor: `color-mix(in srgb, ${THEME.primary} 10%, transparent)`,
        }}
      >
        <CheckCircle2
          className="h-3.5 w-3.5"
          style={{ color: THEME.primary }}
        />
      </div>

      <div>
        <h4 className="text-sm font-semibold">{title}</h4>
        <p className="mt-1 text-sm leading-6" style={{ color: THEME.muted }}>
          {description}
        </p>
      </div>
    </div>
  );
}

function FooterLink({ href, label }) {
  return (
    <Link
      href={href}
      className="block text-sm text-white/60 transition hover:text-white"
    >
      {label}
    </Link>
  );
}
