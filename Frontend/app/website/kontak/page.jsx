"use client";

import { useEffect, useState } from "react";
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
const SUBDOMAIN = "smart";
const SLUG_KONTAK = "kontak-1789495236882";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=2000&q=85";

export default function KontakPage() {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchKontak() {
      try {
        setLoading(true);
        setError("");

        if (!API_URL) {
          throw new Error(
            "NEXT_PUBLIC_API_URL belum dikonfigurasi."
          );
        }

        if (!SLUG_KONTAK) {
          throw new Error(
            "Slug halaman kontak belum diatur."
          );
        }

        const response = await fetch(
          `${API_URL}/api/v1/publik/${SUBDOMAIN}/halaman/${SLUG_KONTAK}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message ||
              result?.error ||
              "Gagal mengambil data halaman kontak."
          );
        }

        if (!mounted) {
          return;
        }

        setPage(result?.data || null);
      } catch (err) {
        if (!mounted) {
          return;
        }

        setError(
          err?.message ||
            "Terjadi kesalahan saat mengambil data kontak."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchKontak();

    return () => {
      mounted = false;
    };
  }, []);

  const navigation = [
    {
      label: "Beranda",
      href: "/",
    },
    {
      label: "Tentang",
      href: "/tentang",
    },
    {
      label: "Akademik",
      href: "/akademik",
    },
    {
      label: "Artikel",
      href: "/articles",
    },
    {
      label: "Kontak",
      href: "/kontak",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-sm shadow-blue-600/20">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>

            <div>
              <p className="text-[15px] font-bold tracking-tight text-slate-950">
                SmartSchool
              </p>

              <p className="text-[11px] font-medium text-slate-500">
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
                  className={`relative text-sm transition ${
                    active
                      ? "font-semibold text-blue-600"
                      : "font-medium text-slate-600 hover:text-blue-600"
                  }`}
                >
                  {item.label}

                  {active && (
                    <span className="absolute -bottom-[29px] left-0 right-0 h-0.5 rounded-full bg-blue-600" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/akademik"
              className="hidden items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 lg:inline-flex"
            >
              Jelajahi Akademik
              <ArrowRight className="h-4 w-4" />
            </Link>

            <button
              type="button"
              aria-label={
                mobileMenu ? "Tutup menu" : "Buka menu"
              }
              aria-expanded={mobileMenu}
              onClick={() =>
                setMobileMenu((current) => !current)
              }
              className="rounded-xl border border-slate-200 p-2.5 text-slate-700 transition hover:bg-slate-50 md:hidden"
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
          <div className="border-t border-slate-200 bg-white px-6 py-5 md:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col gap-1">
              {navigation.map((item) => {
                const active = item.href === "/kontak";

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenu(false)}
                    className={`rounded-xl px-4 py-3 text-sm transition ${
                      active
                        ? "bg-blue-50 font-semibold text-blue-600"
                        : "font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt="Lingkungan SmartSchool"
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-slate-950/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-blue-950/60" />
        </div>

        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_420px]">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-300 backdrop-blur">
                <MessageCircle className="h-4 w-4" />
                Contact Center
              </div>

              <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Mari Terhubung
                <span className="block text-blue-400">
                  Bersama SmartSchool
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Punya pertanyaan mengenai sekolah, program
                akademik, kegiatan, atau informasi lainnya?
                Temukan informasi kontak SmartSchool melalui
                halaman ini.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="#informasi-kontak"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500"
                >
                  Lihat Informasi
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/akademik"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
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
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                        <School className="h-5 w-5 text-white" />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-blue-300">
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
            iconClass="bg-blue-50 text-blue-600"
          />

          <ContactCard
            icon={<Phone className="h-5 w-5" />}
            title="Telepon"
            description="Hubungi sekolah melalui nomor resmi."
            iconClass="bg-indigo-50 text-indigo-600"
          />

          <ContactCard
            icon={<Mail className="h-5 w-5" />}
            title="Email"
            description="Kirim pertanyaan melalui email sekolah."
            iconClass="bg-sky-50 text-sky-600"
          />

          <ContactCard
            icon={<Clock3 className="h-5 w-5" />}
            title="Jam Layanan"
            description="Informasi waktu pelayanan sekolah."
            iconClass="bg-emerald-50 text-emerald-600"
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_330px] lg:gap-16">
          <div>
            <div className="mb-8">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                Informasi Sekolah
              </span>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                {page?.judul || "Kontak SmartSchool"}
              </h2>

              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Informasi berikut dikelola melalui sistem
                SmartSchool sehingga pihak sekolah dapat
                memperbarui informasi kontak sesuai kebutuhan.
              </p>
            </div>

            {loading && (
              <div className="flex min-h-[360px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                    <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
                  </div>

                  <h3 className="mt-5 font-semibold text-slate-900">
                    Memuat informasi kontak
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Sedang mengambil informasi dari server.
                  </p>
                </div>
              </div>
            )}

            {!loading && error && (
              <div className="rounded-3xl border border-red-200 bg-white p-8 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50">
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900">
                      Informasi belum dapat dimuat
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-slate-500">
                      {error}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        window.location.reload()
                      }
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Coba Lagi
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!loading && !error && !page && (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                  <MessageCircle className="h-6 w-6 text-slate-400" />
                </div>

                <h3 className="mt-5 text-lg font-bold text-slate-900">
                  Informasi belum tersedia
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Konten halaman kontak belum tersedia untuk
                  saat ini.
                </p>
              </div>
            )}

            {!loading && !error && page && (
              <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                {page.gambarUrl && (
                  <div className="overflow-hidden">
                    <img
                      src={
                        page.gambarUrl.startsWith("http")
                          ? page.gambarUrl
                          : `${API_URL}/${page.gambarUrl.replace(
                              /^\//,
                              ""
                            )}`
                      }
                      alt={
                        page.judul ||
                        "Informasi SmartSchool"
                      }
                      className="max-h-[480px] w-full object-cover"
                    />
                  </div>
                )}

                <div className="p-7 sm:p-10">
                  <div className="mb-7 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                      <School className="h-5 w-5 text-blue-600" />
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
                        SmartSchool
                      </p>

                      <p className="text-sm font-medium text-slate-500">
                        Informasi resmi sekolah
                      </p>
                    </div>
                  </div>

                  <div
                    className="
                      text-[15px]
                      leading-8
                      text-slate-600
                      [&_p]:mb-5
                      [&_p:last-child]:mb-0
                      [&_h1]:mb-5
                      [&_h1]:text-3xl
                      [&_h1]:font-bold
                      [&_h1]:tracking-tight
                      [&_h1]:text-slate-950
                      [&_h2]:mb-4
                      [&_h2]:mt-9
                      [&_h2]:text-2xl
                      [&_h2]:font-bold
                      [&_h2]:tracking-tight
                      [&_h2]:text-slate-950
                      [&_h3]:mb-3
                      [&_h3]:mt-7
                      [&_h3]:text-xl
                      [&_h3]:font-bold
                      [&_h3]:text-slate-950
                      [&_ul]:mb-5
                      [&_ul]:list-disc
                      [&_ul]:pl-6
                      [&_ol]:mb-5
                      [&_ol]:list-decimal
                      [&_ol]:pl-6
                      [&_li]:mb-2
                      [&_strong]:font-semibold
                      [&_strong]:text-slate-900
                      [&_a]:font-semibold
                      [&_a]:text-blue-600
                      [&_a]:underline
                      [&_a]:underline-offset-2
                      [&_blockquote]:my-7
                      [&_blockquote]:border-l-4
                      [&_blockquote]:border-blue-600
                      [&_blockquote]:pl-5
                      [&_blockquote]:italic
                      [&_blockquote]:text-slate-500
                      [&_img]:my-7
                      [&_img]:rounded-2xl
                    "
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
            <div className="rounded-3xl bg-slate-950 p-7 text-white shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600">
                <MessageCircle className="h-5 w-5" />
              </div>

              <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-blue-400">
                Butuh Informasi?
              </p>

              <h3 className="mt-2 text-xl font-bold">
                Kami siap membantu
              </h3>

              <p className="mt-4 text-sm leading-7 text-slate-300">
                Gunakan informasi kontak sekolah untuk
                mendapatkan informasi lebih lanjut mengenai
                SmartSchool.
              </p>

              <Link
                href="/akademik"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Lihat Akademik
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                Mengapa SmartSchool
              </p>

              <h3 className="mt-2 text-xl font-bold text-slate-950">
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

            <div className="rounded-3xl border border-blue-100 bg-blue-50 p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    SmartSchool
                  </p>

                  <p className="text-xs text-slate-500">
                    Sekolah modern & berkualitas
                  </p>
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-slate-600">
                Membangun lingkungan pendidikan yang
                mendukung pembelajaran, karakter, dan
                perkembangan potensi siswa.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[32px] bg-blue-600 px-8 py-12 shadow-xl shadow-blue-900/10 sm:px-12 lg:px-16 lg:py-14">
            <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-40 -left-20 h-80 w-80 rounded-full bg-blue-950/20 blur-2xl" />

            <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-100">
                  Temukan Lebih Banyak
                </p>

                <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Kenali SmartSchool lebih dekat
                </h2>

                <p className="mt-4 text-base leading-7 text-blue-100">
                  Jelajahi program akademik dan berbagai
                  informasi sekolah yang tersedia untuk
                  peserta didik dan masyarakat.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/tentang"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                >
                  Tentang Kami
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/articles"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Artikel Sekolah
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <Link
                href="/"
                className="inline-flex items-center gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>

                <div>
                  <p className="font-bold tracking-tight">
                    SmartSchool
                  </p>

                  <p className="text-xs text-slate-400">
                    Sekolah Modern & Berkualitas
                  </p>
                </div>
              </Link>

              <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
                Membangun generasi unggul melalui pendidikan
                yang berkualitas, berkarakter, dan adaptif
                terhadap perkembangan zaman.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold">
                Navigasi
              </h3>

              <div className="mt-4 space-y-3">
                <FooterLink href="/" label="Beranda" />
                <FooterLink
                  href="/tentang"
                  label="Tentang"
                />
                <FooterLink
                  href="/akademik"
                  label="Akademik"
                />
                <FooterLink
                  href="/articles"
                  label="Artikel"
                />
                <FooterLink
                  href="/kontak"
                  label="Kontak"
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold">
                Informasi
              </h3>

              <div className="mt-4 space-y-3">
                <FooterLink
                  href="/akademik"
                  label="Program Akademik"
                />

                <FooterLink
                  href="/articles"
                  label="Artikel Sekolah"
                />

                <FooterLink
                  href="/tentang"
                  label="Profil Sekolah"
                />

                <FooterLink
                  href="/kontak"
                  label="Hubungi Kami"
                />
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6">
            <p className="text-center text-sm text-slate-500">
              © {new Date().getFullYear()} SmartSchool. All
              rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function ContactCard({
  icon,
  title,
  description,
  iconClass,
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
      >
        {icon}
      </div>

      <h3 className="mt-5 font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

      <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-blue-600">
        Informasi tersedia
        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
      </div>
    </div>
  );
}

function InfoItem({ title, description }) {
  return (
    <div className="flex gap-3">
      <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50">
        <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
      </div>

      <div>
        <h4 className="text-sm font-semibold text-slate-900">
          {title}
        </h4>

        <p className="mt-1 text-sm leading-6 text-slate-500">
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
      className="block text-sm text-slate-400 transition hover:text-white"
    >
      {label}
    </Link>
  );
}