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

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const SLUG_TENTANG = "tentang-sma-smart-school-1789493637943";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=2000&q=85";

export default function TentangPage() {
  const [halaman, setHalaman] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getSubdomain = () => {
    if (typeof window === "undefined") {
      return "";
    }

    const hostname = window.location.hostname;

    if (hostname.endsWith(".localhost")) {
      return hostname.replace(".localhost", "");
    }

    const parts = hostname.split(".");

    if (parts.length > 2) {
      return parts[0];
    }

    return "";
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) {
      return "";
    }

    if (
      imageUrl.startsWith("http://") ||
      imageUrl.startsWith("https://")
    ) {
      return imageUrl;
    }

    if (!API_URL) {
      return imageUrl;
    }

    return `${API_URL.replace(/\/$/, "")}/${imageUrl.replace(
      /^\//,
      ""
    )}`;
  };

  useEffect(() => {
    async function fetchTentang() {
      try {
        setLoading(true);
        setError("");

        if (!API_URL) {
          throw new Error(
            "NEXT_PUBLIC_API_URL belum dikonfigurasi."
          );
        }

        if (!SLUG_TENTANG) {
          throw new Error(
            "Slug halaman Tentang belum diatur di frontend."
          );
        }

        const subdomain = getSubdomain();

        if (!subdomain) {
          throw new Error(
            "Subdomain sekolah tidak ditemukan."
          );
        }

        const url =
          `${API_URL.replace(/\/$/, "")}/api/v1/publik/` +
          `${encodeURIComponent(subdomain)}/halaman/` +
          `${encodeURIComponent(SLUG_TENTANG)}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message ||
              result?.error ||
              "Gagal mengambil halaman Tentang."
          );
        }

        setHalaman(result?.data || null);
      } catch (err) {
        setError(
          err?.message ||
            "Terjadi kesalahan saat mengambil halaman Tentang."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchTentang();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
            <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
          </div>

          <h2 className="mt-6 text-xl font-bold text-slate-900">
            Memuat informasi sekolah
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Sedang mengambil informasi tentang SmartSchool.
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
            <AlertCircle className="h-7 w-7 text-red-500" />
          </div>

          <h2 className="mt-6 text-2xl font-bold text-slate-900">
            Gagal Memuat Halaman
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-500">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Coba Lagi
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </main>
    );
  }

  if (!halaman) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
            <BookOpen className="h-7 w-7 text-blue-600" />
          </div>

          <h2 className="mt-6 text-2xl font-bold text-slate-900">
            Informasi Belum Tersedia
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-500">
            Informasi tentang sekolah belum tersedia untuk
            saat ini.
          </p>

          <Link
            href="/"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Kembali ke Beranda
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    );
  }

  const judul =
    halaman.judul ||
    halaman.nama ||
    "Tentang SmartSchool";

  const konten =
    halaman.konten ||
    halaman.isi ||
    halaman.deskripsi ||
    "<p>Informasi tentang sekolah belum tersedia.</p>";

  const imageUrl = getImageUrl(halaman.gambarUrl);

  return (
    <main className="min-h-screen bg-white text-slate-800">
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
            <Link
              href="/"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              Beranda
            </Link>

            <Link
              href="/tentang"
              className="relative text-sm font-semibold text-blue-600"
            >
              Tentang
              <span className="absolute -bottom-[28px] left-0 right-0 h-0.5 rounded-full bg-blue-600" />
            </Link>

            <Link
              href="/akademik"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              Akademik
            </Link>

            <Link
              href="/articles"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              Artikel
            </Link>

            <Link
              href="/kontak"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              Kontak
            </Link>
          </nav>

          <Link
            href="/akademik"
            className="hidden items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 lg:inline-flex"
          >
            Jelajahi Akademik
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0">
          <img
            src={HERO_IMAGE}
            alt="Lingkungan sekolah SmartSchool"
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-slate-950/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-blue-950/50" />
        </div>

        <div className="absolute -left-32 top-0 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-40 right-0 h-[500px] w-[500px] rounded-full bg-blue-500/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-blue-200 backdrop-blur">
                <ShieldCheck className="h-4 w-4" />
                Profil SmartSchool
              </div>

              <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Mengenal Lebih Dekat
                <span className="block text-blue-400">
                  SmartSchool
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Platform pendidikan yang mendukung proses
                pembelajaran modern dengan mengutamakan
                akademik, karakter, kreativitas, dan potensi
                setiap peserta didik.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/akademik"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500"
                >
                  Lihat Akademik
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/kontak"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  Hubungi Kami
                </Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="ml-auto max-w-md rounded-3xl border border-white/10 bg-white/10 p-3 shadow-2xl backdrop-blur-md">
                <div className="relative overflow-hidden rounded-2xl">
                  <img
                    src={HERO_IMAGE}
                    alt="Lingkungan pendidikan SmartSchool"
                    className="h-[320px] w-full object-cover"
                  />

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
                      SmartSchool
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

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-0 px-6 lg:grid-cols-3 lg:px-8">
          <div className="flex items-start gap-4 border-b border-slate-200 py-7 lg:border-b-0 lg:border-r lg:pr-8">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">
              <GraduationCap className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Pendidikan Berkualitas
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Pembelajaran terstruktur dan berorientasi pada
                perkembangan siswa.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 border-b border-slate-200 py-7 lg:border-b-0 lg:px-8 lg:border-r">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">
              <Users className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Lingkungan Kolaboratif
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Membangun hubungan positif antara siswa, guru,
                dan orang tua.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 py-7 lg:pl-8">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">
              <Sparkles className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Pengembangan Potensi
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Mendukung kreativitas, karakter, dan kemampuan
                setiap peserta didik.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
            <article className="min-w-0">
              <div className="mb-8">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                  Profil Sekolah
                </span>

                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  {judul}
                </h2>

                <div className="mt-5 h-1 w-14 rounded-full bg-blue-600" />
              </div>

              {imageUrl && (
                <div className="group mb-9 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm">
                  <img
                    src={imageUrl}
                    alt={judul}
                    className="max-h-[520px] w-full object-cover transition duration-700 group-hover:scale-[1.02]"
                  />
                </div>
              )}

              <div
                className="prose prose-slate max-w-none
                  prose-headings:font-bold
                  prose-headings:tracking-tight
                  prose-headings:text-slate-950
                  prose-p:text-slate-600
                  prose-p:leading-8
                  prose-li:text-slate-600
                  prose-a:font-semibold
                  prose-a:text-blue-600
                  prose-strong:text-slate-900
                  prose-img:rounded-2xl"
                dangerouslySetInnerHTML={{
                  __html: konten,
                }}
              />
            </article>

            <aside className="space-y-5">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-sm shadow-blue-600/20">
                  <Target className="h-5 w-5 text-white" />
                </div>

                <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                  Arah Pendidikan
                </p>

                <h3 className="mt-2 text-xl font-bold text-slate-950">
                  Visi
                </h3>

                <p className="mt-4 text-sm leading-7 text-slate-600">
                  Menjadi institusi pendidikan yang unggul,
                  inovatif, dan mampu membentuk generasi
                  berkarakter serta berprestasi.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                  <Lightbulb className="h-5 w-5 text-blue-600" />
                </div>

                <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                  Komitmen Kami
                </p>

                <h3 className="mt-2 text-xl font-bold text-slate-950">
                  Misi
                </h3>

                <div className="mt-5 space-y-4">
                  <div className="flex gap-3">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-blue-600" />
                    <p className="text-sm leading-6 text-slate-600">
                      Menyelenggarakan pendidikan yang
                      berkualitas.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-blue-600" />
                    <p className="text-sm leading-6 text-slate-600">
                      Mengembangkan potensi dan kreativitas
                      peserta didik.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-blue-600" />
                    <p className="text-sm leading-6 text-slate-600">
                      Membentuk karakter yang bertanggung
                      jawab dan berintegritas.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              Nilai Utama
            </span>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Pendidikan yang Berpusat pada Siswa
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-600">
              Setiap peserta didik memiliki potensi yang unik.
              SmartSchool hadir untuk memberikan lingkungan
              yang mendukung proses belajar dan perkembangan
              mereka secara menyeluruh.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <div className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 transition group-hover:bg-blue-600">
                <GraduationCap className="h-6 w-6 text-blue-600 transition group-hover:text-white" />
              </div>

              <h3 className="mt-6 text-lg font-bold text-slate-950">
                Akademik
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                Mendukung siswa untuk mencapai prestasi
                akademik melalui pembelajaran yang
                terstruktur dan berkualitas.
              </p>

              <Link
                href="/akademik"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
              >
                Lihat program
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 transition group-hover:bg-blue-600">
                <Heart className="h-6 w-6 text-blue-600 transition group-hover:text-white" />
              </div>

              <h3 className="mt-6 text-lg font-bold text-slate-950">
                Karakter
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                Membentuk peserta didik yang memiliki
                integritas, tanggung jawab, empati, dan
                kepedulian terhadap lingkungan.
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-blue-600">
                Karakter unggul
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>

            <div className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 transition group-hover:bg-blue-600">
                <Users className="h-6 w-6 text-blue-600 transition group-hover:text-white" />
              </div>

              <h3 className="mt-6 text-lg font-bold text-slate-950">
                Kolaborasi
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                Membangun kerja sama antara sekolah, siswa,
                guru, dan orang tua untuk menciptakan ekosistem
                pendidikan yang positif.
              </p>

              <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-blue-600">
                Tumbuh bersama
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[32px] bg-slate-950 px-8 py-12 shadow-xl sm:px-12 lg:px-16 lg:py-14">
            <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
            <div className="absolute -bottom-40 -left-20 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
                  Langkah Berikutnya
                </span>

                <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Kenali Program Akademik Kami
                </h2>

                <p className="mt-4 text-base leading-7 text-slate-300">
                  Temukan program, mata pelajaran, dan berbagai
                  kegiatan akademik yang tersedia di
                  SmartSchool.
                </p>
              </div>

              <Link
                href="/akademik"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Jelajahi Akademik
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              Informasi
            </span>

            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
              Terhubung dengan SmartSchool
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <Link
              href="/kontak"
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>

              <h3 className="mt-5 font-bold text-slate-900">
                Alamat
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Lihat lokasi dan informasi alamat sekolah
                melalui halaman kontak.
              </p>

              <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-blue-600">
                Lihat kontak
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/kontak"
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                <Phone className="h-5 w-5 text-blue-600" />
              </div>

              <h3 className="mt-5 font-bold text-slate-900">
                Telepon
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Hubungi pihak sekolah untuk mendapatkan
                informasi lebih lanjut.
              </p>

              <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-blue-600">
                Hubungi kami
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/kontak"
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>

              <h3 className="mt-5 font-bold text-slate-900">
                Email
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Kirim pertanyaan atau kebutuhan informasi
                melalui kontak sekolah.
              </p>

              <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-blue-600">
                Kirim pertanyaan
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </Link>
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
              <h3 className="text-sm font-semibold text-white">
                Navigasi
              </h3>

              <div className="mt-4 space-y-3">
                <Link
                  href="/"
                  className="block text-sm text-slate-400 transition hover:text-white"
                >
                  Beranda
                </Link>

                <Link
                  href="/tentang"
                  className="block text-sm text-slate-400 transition hover:text-white"
                >
                  Tentang
                </Link>

                <Link
                  href="/akademik"
                  className="block text-sm text-slate-400 transition hover:text-white"
                >
                  Akademik
                </Link>

                <Link
                  href="/articles"
                  className="block text-sm text-slate-400 transition hover:text-white"
                >
                  Artikel
                </Link>

                <Link
                  href="/kontak"
                  className="block text-sm text-slate-400 transition hover:text-white"
                >
                  Kontak
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white">
                Informasi
              </h3>

              <div className="mt-4 space-y-3">
                <Link
                  href="/akademik"
                  className="block text-sm text-slate-400 transition hover:text-white"
                >
                  Program Akademik
                </Link>

                <Link
                  href="/articles"
                  className="block text-sm text-slate-400 transition hover:text-white"
                >
                  Artikel Sekolah
                </Link>

                <Link
                  href="/kontak"
                  className="block text-sm text-slate-400 transition hover:text-white"
                >
                  Hubungi Kami
                </Link>
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