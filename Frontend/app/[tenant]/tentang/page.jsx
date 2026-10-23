"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Heart,
  Lightbulb,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Target,
  Users,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const SLUG_TENTANG = "tentang-sma-smart-school-1789493637943";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=2000&q=85";

const DEFAULT_THEME = {
  primary: "#2563EB",
  secondary: "#64748B",
  accent: "#F59E0B",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  text: "#0F172A",
  border: "#E2E8F0",
};

function getSubdomain() {
  if (typeof window === "undefined") return "";

  const hostname = window.location.hostname.toLowerCase();

  if (hostname.endsWith(".localhost")) {
    return hostname.slice(0, -".localhost".length);
  }

  const parts = hostname.split(".");

  if (parts.length >= 3) {
    return parts[0];
  }

  return "";
}

function getImageUrl(imageUrl) {
  if (!imageUrl) return "";

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  return `${API_URL}/${imageUrl.replace(/^\/+/, "")}`;
}

function isValidHex(value) {
  return typeof value === "string" &&
    /^#[0-9a-fA-F]{6}$/.test(value);
}

function getThemeColor(theme, key) {
  return isValidHex(theme?.[key])
    ? theme[key]
    : DEFAULT_THEME[key];
}

function getPublicApiBase() {
  if (API_URL.endsWith("/api")) {
    return `${API_URL}/publik`;
  }

  return `${API_URL}/api/publik`;
}

export default function TentangPage() {
  const [halaman, setHalaman] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState(DEFAULT_THEME);

  useEffect(() => {
    let cancelled = false;

    async function fetchTentang() {
      try {
        setLoading(true);
        setError("");

        const subdomain = getSubdomain();

        if (!subdomain) {
          throw new Error(
            "Subdomain sekolah tidak ditemukan. Buka halaman melalui domain sekolah."
          );
        }

        const url =
          `${getPublicApiBase()}/${encodeURIComponent(subdomain)}/halaman/` +
          encodeURIComponent(SLUG_TENTANG);

        const response = await fetch(url, {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            result?.message ||
              result?.error ||
              `Gagal mengambil halaman Tentang (${response.status}).`
          );
        }

        if (!cancelled) {
          setHalaman(result?.data ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.message ||
              "Terjadi kesalahan saat mengambil halaman Tentang."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchTentang();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    function readTheme() {
      const computed = getComputedStyle(root);

      const nextTheme = {};

      for (const key of Object.keys(DEFAULT_THEME)) {
        const value = computed
          .getPropertyValue(`--school-${key}`)
          .trim();

        nextTheme[key] = isValidHex(value)
          ? value
          : DEFAULT_THEME[key];
      }

      setTheme(nextTheme);
    }

    readTheme();

    const observer = new MutationObserver(readTheme);

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    return () => observer.disconnect();
  }, []);

  const primary = getThemeColor(theme, "primary");
  const secondary = getThemeColor(theme, "secondary");
  const accent = getThemeColor(theme, "accent");
  const background = getThemeColor(theme, "background");
  const surface = getThemeColor(theme, "surface");
  const text = getThemeColor(theme, "text");
  const border = getThemeColor(theme, "border");

  const imageUrl = getImageUrl(halaman?.gambarUrl);

  if (loading) {
    return (
      <main
        className="flex min-h-screen items-center justify-center px-6"
        style={{ backgroundColor: background, color: text }}
      >
        <div
          className="w-full max-w-md rounded-3xl border p-10 text-center shadow-sm"
          style={{ backgroundColor: surface, borderColor: border }}
        >
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ backgroundColor: `${primary}18` }}
          >
            <Loader2
              className="h-7 w-7 animate-spin"
              style={{ color: primary }}
            />
          </div>

          <h2 className="mt-6 text-xl font-bold">
            Memuat informasi sekolah
          </h2>

          <p className="mt-2 text-sm leading-6" style={{ color: secondary }}>
            Sedang mengambil informasi tentang sekolah.
          </p>
        </div>
      </main>
    );
  }

  if (error || !halaman) {
    return (
      <main
        className="flex min-h-screen items-center justify-center px-6"
        style={{ backgroundColor: background, color: text }}
      >
        <div
          className="w-full max-w-lg rounded-3xl border p-10 text-center shadow-sm"
          style={{ backgroundColor: surface, borderColor: border }}
        >
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ backgroundColor: `${primary}18` }}
          >
            {error ? (
              <AlertCircle className="h-7 w-7 text-red-500" />
            ) : (
              <BookOpen className="h-7 w-7" style={{ color: primary }} />
            )}
          </div>

          <h2 className="mt-6 text-2xl font-bold">
            {error ? "Gagal Memuat Halaman" : "Informasi Belum Tersedia"}
          </h2>

          <p className="mt-3 text-sm leading-7" style={{ color: secondary }}>
            {error || "Informasi tentang sekolah belum tersedia saat ini."}
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {error && (
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white"
                style={{ backgroundColor: primary }}
              >
                Coba Lagi
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-semibold"
              style={{ borderColor: border, color: text }}
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const judul =
    halaman.judul ||
    halaman.nama ||
    "Tentang Sekolah";

  const konten =
    halaman.konten ||
    halaman.isi ||
    halaman.deskripsi ||
    "<p>Informasi tentang sekolah belum tersedia.</p>";

  const navClass =
    "text-sm font-medium transition hover:opacity-75";

  const sectionTitleStyle = { color: text };
  const mutedStyle = { color: secondary };
  const borderStyle = { borderColor: border };
  const surfaceStyle = {
    backgroundColor: surface,
    borderColor: border,
  };

  const iconBoxStyle = {
    backgroundColor: `${primary}18`,
    color: primary,
  };

  const primaryButtonStyle = {
    backgroundColor: primary,
    color: "#FFFFFF",
  };

  const accentTextStyle = { color: accent };

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: surface, color: text }}
    >
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-xl"
        style={{
          backgroundColor: `${surface}F2`,
          ...borderStyle,
        }}
      >
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={primaryButtonStyle}
            >
              <GraduationCap className="h-5 w-5" />
            </div>

            <div>
              <p className="text-[15px] font-bold tracking-tight" style={sectionTitleStyle}>
                {halaman.namaSekolah || "SmartSchool"}
              </p>
              <p className="text-[11px] font-medium" style={mutedStyle}>
                Sekolah Modern & Berkualitas
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/" className={navClass} style={mutedStyle}>
              Beranda
            </Link>
            <Link
              href="/tentang"
              className="relative text-sm font-semibold"
              style={{ color: primary }}
            >
              Tentang
              <span
                className="absolute -bottom-[28px] left-0 right-0 h-0.5 rounded-full"
                style={{ backgroundColor: primary }}
              />
            </Link>
            <Link href="/akademik" className={navClass} style={mutedStyle}>
              Akademik
            </Link>
            <Link href="/articles" className={navClass} style={mutedStyle}>
              Artikel
            </Link>
            <Link href="/kontak" className={navClass} style={mutedStyle}>
              Kontak
            </Link>
          </nav>

          <Link
            href="/akademik"
            className="hidden items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition hover:opacity-90 lg:inline-flex"
            style={primaryButtonStyle}
          >
            Jelajahi Akademik
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: text }}
      >
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt="Lingkungan sekolah"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/75" />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(105deg, ${text}F2 0%, ${primary}A6 100%)`,
            }}
          />
        </div>

        <div
          className="absolute -left-32 top-0 h-80 w-80 rounded-full blur-3xl"
          style={{ backgroundColor: `${primary}35` }}
        />
        <div
          className="absolute -bottom-40 right-0 h-[500px] w-[500px] rounded-full blur-3xl"
          style={{ backgroundColor: `${accent}25` }}
        />

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="max-w-3xl">
              <div
                className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium backdrop-blur"
                style={{
                  color: "#FFFFFF",
                  borderColor: `${surface}40`,
                  backgroundColor: `${surface}12`,
                }}
              >
                <ShieldCheck className="h-4 w-4" style={accentTextStyle} />
                Profil Sekolah
              </div>

              <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Mengenal Lebih Dekat
                <span className="block" style={{ color: accent }}>
                  {halaman.namaSekolah || "Sekolah Kami"}
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">
                Mengenal profil, visi, misi, dan komitmen sekolah
                dalam mendukung pendidikan yang berkualitas.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/akademik"
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold transition hover:opacity-90"
                  style={primaryButtonStyle}
                >
                  Lihat Akademik
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/kontak"
                  className="inline-flex items-center gap-2 rounded-xl border px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
                  style={{ borderColor: `${surface}55` }}
                >
                  Hubungi Kami
                </Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <div
                className="ml-auto max-w-md rounded-3xl border p-3 shadow-2xl backdrop-blur-md"
                style={{
                  borderColor: `${surface}50`,
                  backgroundColor: `${surface}18`,
                }}
              >
                <div className="relative overflow-hidden rounded-2xl">
                  <img
                    src={HERO_IMAGE}
                    alt="Lingkungan pendidikan"
                    className="h-[320px] w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-6">
                    <p
                      className="text-xs font-semibold uppercase tracking-[0.2em]"
                      style={accentTextStyle}
                    >
                      Profil Sekolah
                    </p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      Pendidikan untuk masa depan
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b" style={borderStyle}>
        <div className="mx-auto grid max-w-7xl gap-0 px-6 lg:grid-cols-3 lg:px-8">
          {[
            {
              icon: GraduationCap,
              title: "Pendidikan Berkualitas",
              description: "Pembelajaran terstruktur dan berorientasi pada perkembangan siswa.",
            },
            {
              icon: Users,
              title: "Lingkungan Kolaboratif",
              description: "Membangun hubungan positif antara siswa, guru, dan orang tua.",
            },
            {
              icon: Sparkles,
              title: "Pengembangan Potensi",
              description: "Mendukung kreativitas, karakter, dan kemampuan setiap peserta didik.",
            },
          ].map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className={`flex items-start gap-4 py-7 ${
                  index < 2 ? "border-b lg:border-b-0 lg:border-r" : ""
                } ${index === 1 ? "lg:px-8" : ""} ${
                  index === 2 ? "lg:pl-8" : ""
                }`}
                style={borderStyle}
              >
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={iconBoxStyle}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={sectionTitleStyle}>
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm leading-6" style={mutedStyle}>
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="py-20 lg:py-24" style={{ backgroundColor: surface }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
            <article className="min-w-0">
              <div className="mb-8">
                <span
                  className="text-xs font-bold uppercase tracking-[0.2em]"
                  style={{ color: primary }}
                >
                  Profil Sekolah
                </span>
                <h2
                  className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
                  style={sectionTitleStyle}
                >
                  {judul}
                </h2>
                <div
                  className="mt-5 h-1 w-14 rounded-full"
                  style={{ backgroundColor: accent }}
                />
              </div>

              {imageUrl && (
                <div
                  className="group mb-9 overflow-hidden rounded-3xl border shadow-sm"
                  style={{ ...surfaceStyle, backgroundColor: background }}
                >
                  <img
                    src={imageUrl}
                    alt={judul}
                    className="max-h-[520px] w-full object-cover transition duration-700 group-hover:scale-[1.02]"
                  />
                </div>
              )}

              <div
                className="prose max-w-none
                  prose-headings:font-bold
                  prose-headings:tracking-tight
                  prose-p:leading-8
                  prose-li:leading-7
                  prose-a:font-semibold
                  prose-img:rounded-2xl"
                style={{
                  color: secondary,
                  "--tw-prose-headings": text,
                  "--tw-prose-body": secondary,
                  "--tw-prose-bold": text,
                  "--tw-prose-links": primary,
                  "--tw-prose-bullets": accent,
                }}
                dangerouslySetInnerHTML={{ __html: konten }}
              />
            </article>

            <aside className="space-y-5">
              <div
                className="rounded-3xl border p-7"
                style={{ backgroundColor: background, borderColor: border }}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={primaryButtonStyle}
                >
                  <Target className="h-5 w-5" />
                </div>
                <p
                  className="mt-6 text-xs font-bold uppercase tracking-[0.18em]"
                  style={{ color: primary }}
                >
                  Arah Pendidikan
                </p>
                <h3 className="mt-2 text-xl font-bold" style={sectionTitleStyle}>
                  Visi
                </h3>
                <p className="mt-4 text-sm leading-7" style={mutedStyle}>
                  Menjadi institusi pendidikan yang unggul, inovatif,
                  dan mampu membentuk generasi berkarakter serta berprestasi.
                </p>
              </div>

              <div
                className="rounded-3xl border p-7 shadow-sm"
                style={surfaceStyle}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={iconBoxStyle}
                >
                  <Lightbulb className="h-5 w-5" />
                </div>
                <p
                  className="mt-6 text-xs font-bold uppercase tracking-[0.18em]"
                  style={{ color: primary }}
                >
                  Komitmen Kami
                </p>
                <h3 className="mt-2 text-xl font-bold" style={sectionTitleStyle}>
                  Misi
                </h3>

                <div className="mt-5 space-y-4">
                  {[
                    "Menyelenggarakan pendidikan yang berkualitas.",
                    "Mengembangkan potensi dan kreativitas peserta didik.",
                    "Membentuk karakter yang bertanggung jawab dan berintegritas.",
                  ].map((item) => (
                    <div key={item} className="flex gap-3">
                      <CheckCircle2
                        className="mt-1 h-4 w-4 shrink-0"
                        style={{ color: primary }}
                      />
                      <p className="text-sm leading-6" style={mutedStyle}>
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-24" style={{ backgroundColor: background }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl">
            <span
              className="text-xs font-bold uppercase tracking-[0.2em]"
              style={{ color: primary }}
            >
              Nilai Utama
            </span>
            <h2
              className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
              style={sectionTitleStyle}
            >
              Pendidikan yang Berpusat pada Siswa
            </h2>
            <p className="mt-4 text-base leading-7" style={mutedStyle}>
              Setiap peserta didik memiliki potensi yang unik. Sekolah
              hadir untuk mendukung proses belajar dan perkembangan mereka.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: GraduationCap,
                title: "Akademik",
                description: "Mendukung siswa mencapai prestasi akademik melalui pembelajaran berkualitas.",
                link: "/akademik",
                action: "Lihat program",
              },
              {
                icon: Heart,
                title: "Karakter",
                description: "Membentuk peserta didik yang memiliki integritas, tanggung jawab, dan empati.",
                action: "Karakter unggul",
              },
              {
                icon: Users,
                title: "Kolaborasi",
                description: "Membangun kerja sama sekolah, siswa, guru, dan orang tua.",
                action: "Tumbuh bersama",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="group rounded-3xl border p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                  style={surfaceStyle}
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={iconBoxStyle}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-lg font-bold" style={sectionTitleStyle}>
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7" style={mutedStyle}>
                    {item.description}
                  </p>

                  {item.link ? (
                    <Link
                      href={item.link}
                      className="mt-5 inline-flex items-center gap-2 text-sm font-semibold"
                      style={{ color: primary }}
                    >
                      {item.action}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <div
                      className="mt-5 flex items-center gap-2 text-sm font-semibold"
                      style={{ color: primary }}
                    >
                      {item.action}
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20" style={{ backgroundColor: surface }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div
            className="relative overflow-hidden rounded-[32px] px-8 py-12 shadow-xl sm:px-12 lg:px-16 lg:py-14"
            style={{ backgroundColor: text }}
          >
            <div
              className="absolute -right-24 -top-32 h-80 w-80 rounded-full blur-3xl"
              style={{ backgroundColor: `${primary}45` }}
            />
            <div
              className="absolute -bottom-40 -left-20 h-80 w-80 rounded-full blur-3xl"
              style={{ backgroundColor: `${accent}30` }}
            />

            <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <span
                  className="text-xs font-bold uppercase tracking-[0.2em]"
                  style={accentTextStyle}
                >
                  Langkah Berikutnya
                </span>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Kenali Program Akademik Kami
                </h2>
                <p className="mt-4 text-base leading-7 text-white/75">
                  Temukan program, mata pelajaran, dan berbagai kegiatan
                  akademik yang tersedia di sekolah.
                </p>
              </div>

              <Link
                href="/akademik"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold transition hover:opacity-90"
                style={primaryButtonStyle}
              >
                Jelajahi Akademik
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        className="border-t py-16"
        style={{ backgroundColor: background, borderColor: border }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <span
              className="text-xs font-bold uppercase tracking-[0.2em]"
              style={{ color: primary }}
            >
              Informasi
            </span>
            <h2 className="mt-3 text-2xl font-bold tracking-tight" style={sectionTitleStyle}>
              Terhubung dengan Sekolah
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                icon: MapPin,
                title: "Alamat",
                description: "Lihat lokasi dan informasi alamat sekolah.",
              },
              {
                icon: Phone,
                title: "Telepon",
                description: "Hubungi pihak sekolah untuk informasi lebih lanjut.",
              },
              {
                icon: Mail,
                title: "Email",
                description: "Kirim pertanyaan melalui halaman kontak sekolah.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href="/kontak"
                  className="group rounded-2xl border p-6 transition hover:-translate-y-1 hover:shadow-md"
                  style={surfaceStyle}
                >
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={iconBoxStyle}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-bold" style={sectionTitleStyle}>
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6" style={mutedStyle}>
                    {item.description}
                  </p>
                  <div
                    className="mt-4 flex items-center gap-2 text-sm font-semibold"
                    style={{ color: primary }}
                  >
                    Lihat kontak
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <footer style={{ backgroundColor: text, color: "#FFFFFF" }}>
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
                  <p className="font-bold tracking-tight">
                    {halaman.namaSekolah || "SmartSchool"}
                  </p>
                  <p className="text-xs text-white/60">
                    Sekolah Modern & Berkualitas
                  </p>
                </div>
              </Link>

              <p className="mt-5 max-w-md text-sm leading-7 text-white/65">
                Membangun generasi unggul melalui pendidikan berkualitas,
                berkarakter, dan adaptif terhadap perkembangan zaman.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold">Navigasi</h3>
              <div className="mt-4 space-y-3">
                {[
                  ["Beranda", "/"],
                  ["Tentang", "/tentang"],
                  ["Akademik", "/akademik"],
                  ["Artikel", "/articles"],
                  ["Kontak", "/kontak"],
                ].map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    className="block text-sm text-white/65 transition hover:text-white"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold">Informasi</h3>
              <div className="mt-4 space-y-3">
                {[
                  ["Program Akademik", "/akademik"],
                  ["Artikel Sekolah", "/articles"],
                  ["Hubungi Kami", "/kontak"],
                ].map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    className="block text-sm text-white/65 transition hover:text-white"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-white/15 pt-6">
            <p className="text-center text-sm text-white/50">
              © {new Date().getFullYear()}{" "}
              {halaman.namaSekolah || "SmartSchool"}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}