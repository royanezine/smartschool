"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Loader2,
  AlertCircle,
  Menu,
  X,
  School,
  Users,
  Award,
  RefreshCw,
  Target,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const SLUG_AKADEMIK = "akademik-1789494009456";

function getPublicApiBase() {
  if (API_URL.endsWith("/api")) {
    return `${API_URL}/publik`;
  }

  return `${API_URL}/api/publik`;
}

function getTenantFromHostname() {
  if (typeof window === "undefined") return "";

  const hostname = window.location.hostname.toLowerCase();

  if (hostname.endsWith(".localhost")) {
    return hostname.slice(0, -".localhost".length);
  }

  const parts = hostname.split(".");

  if (parts.length > 2 && parts[0] !== "www") {
    return parts[0];
  }

  return "";
}

function getSchoolColor(name, fallback) {
  if (typeof window === "undefined") return fallback;

  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();

  return value || fallback;
}

export default function AkademikPage() {
  const [subdomain, setSubdomain] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setSubdomain(getTenantFromHostname());
  }, []);

  const fetchAkademik = useCallback(async () => {
    if (!subdomain) {
      setLoading(false);
      setError("Subdomain sekolah tidak ditemukan.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const url =
        `${getPublicApiBase()}/${encodeURIComponent(subdomain)}/halaman/` +
        encodeURIComponent(SLUG_AKADEMIK);

      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      const text = await response.text();
      let result;

      try {
        result = text ? JSON.parse(text) : null;
      } catch {
        throw new Error("Server mengembalikan respons yang tidak valid.");
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            `Gagal mengambil halaman akademik (HTTP ${response.status}).`
        );
      }

      setPage(result?.data || null);

      if (!result?.data) {
        setError("Data halaman akademik belum tersedia.");
      }
    } catch (err) {
      console.error("Akademik error:", err);
      setPage(null);
      setError(
        err?.message || "Terjadi kesalahan saat mengambil data akademik."
      );
    } finally {
      setLoading(false);
    }
  }, [subdomain]);

  useEffect(() => {
    if (subdomain) {
      fetchAkademik();
    }
  }, [subdomain, fetchAkademik]);

  const navigation = [
    { label: "Beranda", path: "/" },
    { label: "Tentang", path: "/tentang" },
    { label: "Akademik", path: "/akademik", active: true },
    { label: "Artikel", path: "/articles" },
    { label: "Kontak", path: "/kontak" },
  ];

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: "var(--school-background, #F8FAFC)",
        color: "var(--school-text, #0F172A)",
      }}
    >
      {/* HEADER */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-xl"
        style={{
          borderColor: "var(--school-border, #E2E8F0)",
          backgroundColor:
            "color-mix(in srgb, var(--school-surface, #FFFFFF) 95%, transparent)",
        }}
      >
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm transition duration-300 group-hover:scale-105"
              style={{ backgroundColor: "var(--school-primary, #2563EB)" }}
            >
              <School size={22} strokeWidth={2.2} />
            </div>

            <div>
              <p className="text-[17px] font-bold tracking-tight">
                SmartSchool
              </p>
              <p
                className="text-[11px] font-medium tracking-wide"
                style={{ color: "var(--school-secondary, #64748B)" }}
              >
                PORTAL SEKOLAH
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.path}
                className="relative text-sm transition"
                style={{
                  color: item.active
                    ? "var(--school-primary, #2563EB)"
                    : "var(--school-secondary, #64748B)",
                  fontWeight: item.active ? 700 : 500,
                }}
              >
                {item.label}
                {item.active && (
                  <span
                    className="absolute -bottom-[29px] left-0 h-0.5 w-full rounded-full"
                    style={{
                      backgroundColor: "var(--school-primary, #2563EB)",
                    }}
                  />
                )}
              </Link>
            ))}
          </nav>

          <Link
            href="/kontak"
            className="hidden items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 md:inline-flex"
            style={{ backgroundColor: "var(--school-primary, #2563EB)" }}
          >
            Hubungi Kami
            <ArrowRight size={16} />
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border md:hidden"
            style={{
              borderColor: "var(--school-border, #E2E8F0)",
              color: "var(--school-primary, #2563EB)",
              backgroundColor: "var(--school-surface, #FFFFFF)",
            }}
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <div
            className="border-t px-6 py-5 md:hidden"
            style={{
              borderColor: "var(--school-border, #E2E8F0)",
              backgroundColor: "var(--school-surface, #FFFFFF)",
            }}
          >
            <nav className="mx-auto flex max-w-7xl flex-col gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.label}
                  href={item.path}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm transition"
                  style={{
                    color: item.active
                      ? "var(--school-primary, #2563EB)"
                      : "var(--school-text, #0F172A)",
                    fontWeight: item.active ? 700 : 500,
                    backgroundColor: item.active
                      ? "var(--school-background, #F8FAFC)"
                      : "transparent",
                  }}
                >
                  {item.label}
                </Link>
              ))}

              <Link
                href="/kontak"
                onClick={() => setMenuOpen(false)}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white"
                style={{ backgroundColor: "var(--school-primary, #2563EB)" }}
              >
                Hubungi Kami
                <ArrowRight size={16} />
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* HERO */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundColor: "var(--school-text, #0F172A)",
        }}
      >
        <div
          className="absolute -right-40 -top-44 h-[460px] w-[460px] rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: "var(--school-primary, #2563EB)" }}
        />
        <div
          className="absolute -bottom-52 -left-36 h-[420px] w-[420px] rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: "var(--school-accent, #F59E0B)" }}
        />

        <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <Link
                href="/"
                className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-white/80 transition hover:text-white"
              >
                <ChevronRight size={16} className="rotate-180" />
                Kembali ke Beranda
              </Link>

              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white">
                <BookOpen size={15} />
                Informasi Akademik
              </div>

              <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                {page?.judul || "Akademik"}
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
                Informasi mengenai sistem pembelajaran, kurikulum,
                tenaga pendidik, serta berbagai kegiatan akademik
                yang mendukung perkembangan peserta didik.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="#informasi-akademik"
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition hover:opacity-90"
                  style={{
                    backgroundColor: "var(--school-surface, #FFFFFF)",
                    color: "var(--school-primary, #2563EB)",
                  }}
                >
                  Lihat Informasi
                  <ArrowRight size={16} />
                </Link>

                <Link
                  href="/kontak"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Hubungi Sekolah
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-xl">
                <div
                  className="rounded-2xl p-6 sm:p-7"
                  style={{ backgroundColor: "var(--school-surface, #FFFFFF)" }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p
                        className="text-xs font-bold uppercase tracking-[0.16em]"
                        style={{ color: "var(--school-primary, #2563EB)" }}
                      >
                        Fokus Pendidikan
                      </p>
                      <h2
                        className="mt-2 text-xl font-bold"
                        style={{ color: "var(--school-text, #0F172A)" }}
                      >
                        Pembelajaran berkualitas
                      </h2>
                    </div>

                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: "var(--school-background, #F8FAFC)",
                        color: "var(--school-primary, #2563EB)",
                      }}
                    >
                      <GraduationCap size={22} />
                    </div>
                  </div>

                  <div className="mt-7 space-y-4">
                    <AcademicPoint
                      icon={BookOpen}
                      title="Kurikulum"
                      text="Pembelajaran terstruktur sesuai kebutuhan peserta didik."
                    />
                    <AcademicPoint
                      icon={Users}
                      title="Tenaga Pendidik"
                      text="Didukung guru dan tenaga pendidikan yang profesional."
                    />
                    <AcademicPoint
                      icon={Award}
                      title="Prestasi"
                      text="Mendorong pencapaian akademik dan non-akademik."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LINGKUP AKADEMIK */}
      <section
        id="informasi-akademik"
        className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-20"
      >
        <div className="mb-10 max-w-2xl">
          <p
            className="text-xs font-bold uppercase tracking-[0.18em]"
            style={{ color: "var(--school-primary, #2563EB)" }}
          >
            Lingkup Akademik
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Pendidikan yang terarah
          </h2>

          <p
            className="mt-4 text-sm leading-7 sm:text-base"
            style={{ color: "var(--school-secondary, #64748B)" }}
          >
            Informasi akademik sekolah mencakup berbagai aspek
            pembelajaran dan pengembangan peserta didik.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <InfoCard
            icon={GraduationCap}
            number="01"
            title="Kurikulum"
            description="Sistem dan struktur pembelajaran yang diterapkan sekolah."
          />
          <InfoCard
            icon={BookOpen}
            number="02"
            title="Mata Pelajaran"
            description="Informasi bidang studi dan pembelajaran yang tersedia."
          />
          <InfoCard
            icon={Users}
            number="03"
            title="Tenaga Pendidik"
            description="Guru dan tenaga pendidikan yang mendukung proses belajar."
          />
          <InfoCard
            icon={Award}
            number="04"
            title="Prestasi"
            description="Pencapaian siswa dalam bidang akademik dan non-akademik."
          />
        </div>
      </section>

      {/* KONTEN DARI CMS */}
      <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-8 lg:pb-20">
        {loading && (
          <div
            className="flex min-h-[300px] items-center justify-center rounded-3xl border shadow-sm"
            style={{
              borderColor: "var(--school-border, #E2E8F0)",
              backgroundColor: "var(--school-surface, #FFFFFF)",
            }}
          >
            <div className="text-center">
              <Loader2
                size={28}
                className="mx-auto animate-spin"
                style={{ color: "var(--school-primary, #2563EB)" }}
              />
              <h3 className="mt-5 font-bold">Memuat informasi akademik</h3>
              <p
                className="mt-2 text-sm"
                style={{ color: "var(--school-secondary, #64748B)" }}
              >
                Mengambil konten terbaru dari server sekolah.
              </p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div
            className="overflow-hidden rounded-3xl border shadow-sm"
            style={{
              borderColor: "var(--school-border, #E2E8F0)",
              backgroundColor: "var(--school-surface, #FFFFFF)",
            }}
          >
            <div className="border-b bg-red-50 px-6 py-5 sm:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  <AlertCircle size={21} />
                </div>
                <div>
                  <h2 className="font-bold text-red-800">
                    Gagal memuat informasi
                  </h2>
                  <p className="mt-1 text-xs text-red-600">
                    Terjadi kendala saat mengambil data akademik.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <p className="text-sm leading-7">{error}</p>
              <button
                type="button"
                onClick={fetchAkademik}
                className="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: "var(--school-primary, #2563EB)" }}
              >
                <RefreshCw size={16} />
                Coba Lagi
              </button>
            </div>
          </div>
        )}

        {!loading && !error && page?.konten && (
          <div className="grid gap-7 lg:grid-cols-[280px_1fr]">
            <aside
              className="h-fit rounded-3xl p-6 text-white lg:sticky lg:top-28"
              style={{ backgroundColor: "var(--school-text, #0F172A)" }}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: "var(--school-primary, #2563EB)" }}
              >
                <Target size={23} />
              </div>

              <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-white/70">
                Akademik
              </p>
              <h2 className="mt-2 text-xl font-bold leading-7">
                Sistem pembelajaran sekolah
              </h2>
              <p className="mt-4 text-sm leading-6 text-white/65">
                Informasi akademik resmi yang dikelola melalui portal SmartSchool.
              </p>

              <div className="mt-7 space-y-3 border-t border-white/10 pt-6">
                {["Kurikulum", "Pembelajaran", "Tenaga pendidik", "Prestasi siswa"].map(
                  (label) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 text-sm text-white/80"
                    >
                      <CheckCircle2
                        size={17}
                        className="shrink-0"
                        style={{ color: "var(--school-accent, #F59E0B)" }}
                      />
                      {label}
                    </div>
                  )
                )}
              </div>
            </aside>

            <article
              className="overflow-hidden rounded-3xl border shadow-sm"
              style={{
                borderColor: "var(--school-border, #E2E8F0)",
                backgroundColor: "var(--school-surface, #FFFFFF)",
              }}
            >
              <div
                className="border-b px-6 py-6 sm:px-9"
                style={{ borderColor: "var(--school-border, #E2E8F0)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: "var(--school-background, #F8FAFC)",
                      color: "var(--school-primary, #2563EB)",
                    }}
                  >
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <p
                      className="text-xs font-bold uppercase tracking-[0.15em]"
                      style={{ color: "var(--school-primary, #2563EB)" }}
                    >
                      Informasi Resmi
                    </p>
                    <h2 className="mt-1 text-xl font-bold">
                      {page.judul || "Informasi Akademik"}
                    </h2>
                  </div>
                </div>
              </div>

              <div className="px-6 py-8 sm:px-9 sm:py-10">
                <div
                  className="prose max-w-none text-sm leading-8 sm:text-base"
                  style={{
                    color: "var(--school-text, #0F172A)",
                    "--tw-prose-headings": "var(--school-text, #0F172A)",
                    "--tw-prose-links": "var(--school-primary, #2563EB)",
                    "--tw-prose-bold": "var(--school-text, #0F172A)",
                  }}
                  dangerouslySetInnerHTML={{ __html: page.konten }}
                />
              </div>
            </article>
          </div>
        )}

        {!loading && !error && !page?.konten && (
          <div
            className="rounded-3xl border p-8 shadow-sm sm:p-10"
            style={{
              borderColor: "var(--school-border, #E2E8F0)",
              backgroundColor: "var(--school-surface, #FFFFFF)",
            }}
          >
            <p
              className="text-sm leading-7"
              style={{ color: "var(--school-secondary, #64748B)" }}
            >
              Halaman akademik berhasil dimuat, tetapi belum memiliki konten
              yang bisa ditampilkan.
            </p>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
        <div
          className="relative overflow-hidden rounded-3xl px-7 py-10 sm:px-10 lg:px-12 lg:py-12"
          style={{ backgroundColor: "var(--school-primary, #2563EB)" }}
        >
          <div
            className="absolute -right-24 -top-32 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          />
          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/75">
                SmartSchool
              </p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Ingin mengetahui informasi sekolah lebih lanjut?
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/85 sm:text-base">
                Hubungi sekolah untuk mendapatkan informasi lebih lengkap
                mengenai program dan layanan pendidikan.
              </p>
            </div>

            <Link
              href="/kontak"
              className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold transition hover:opacity-90"
              style={{ color: "var(--school-primary, #2563EB)" }}
            >
              Hubungi Kami
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="border-t"
        style={{
          borderColor: "var(--school-border, #E2E8F0)",
          backgroundColor: "var(--school-surface, #FFFFFF)",
        }}
      >
        <div className="mx-auto max-w-7xl px-6 py-9 lg:px-8">
          <div className="flex flex-col justify-between gap-7 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                style={{ backgroundColor: "var(--school-primary, #2563EB)" }}
              >
                <School size={19} />
              </div>
              <div>
                <p className="font-bold">SmartSchool</p>
                <p
                  className="text-xs"
                  style={{ color: "var(--school-secondary, #64748B)" }}
                >
                  Portal informasi sekolah
                </p>
              </div>
            </div>

            <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
              {navigation.map((item) => (
                <Link
                  key={item.label}
                  href={item.path}
                  className="transition"
                  style={{
                    color: item.active
                      ? "var(--school-primary, #2563EB)"
                      : "var(--school-secondary, #64748B)",
                    fontWeight: item.active ? 700 : 500,
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div
            className="mt-7 border-t pt-5"
            style={{ borderColor: "var(--school-border, #E2E8F0)" }}
          >
            <p
              className="text-xs"
              style={{ color: "var(--school-secondary, #64748B)" }}
            >
              © {new Date().getFullYear()} SmartSchool. Seluruh informasi
              sekolah dikelola melalui portal resmi.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function AcademicPoint({ icon: Icon, title, text }) {
  return (
    <div className="flex gap-3">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{
          backgroundColor: "var(--school-background, #F8FAFC)",
          color: "var(--school-primary, #2563EB)",
        }}
      >
        <Icon size={18} />
      </div>
      <div>
        <h3
          className="text-sm font-bold"
          style={{ color: "var(--school-text, #0F172A)" }}
        >
          {title}
        </h3>
        <p
          className="mt-1 text-xs leading-5"
          style={{ color: "var(--school-secondary, #64748B)" }}
        >
          {text}
        </p>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, number, title, description }) {
  return (
    <div
      className="group rounded-2xl border p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
      style={{
        borderColor: "var(--school-border, #E2E8F0)",
        backgroundColor: "var(--school-surface, #FFFFFF)",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl transition duration-300 group-hover:text-white"
          style={{
            backgroundColor: "var(--school-background, #F8FAFC)",
            color: "var(--school-primary, #2563EB)",
          }}
        >
          <Icon size={21} />
        </div>
        <span className="text-xs font-bold tracking-widest text-slate-300">
          {number}
        </span>
      </div>
      <h3 className="mt-6 text-base font-bold">{title}</h3>
      <p
        className="mt-2 text-sm leading-6"
        style={{ color: "var(--school-secondary, #64748B)" }}
      >
        {description}
      </p>
    </div>
  );
}