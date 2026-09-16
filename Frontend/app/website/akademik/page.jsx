"use client";

import { useEffect, useState } from "react";
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

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const SLUG_AKADEMIK = "akademik-1789494009456";

export default function AkademikPage() {
  const [subdomain, setSubdomain] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hostname = window.location.hostname;
    let currentSubdomain = "";

    if (hostname.endsWith(".localhost")) {
      currentSubdomain = hostname.replace(".localhost", "");
    } else {
      const parts = hostname.split(".");

      if (parts.length > 2) {
        currentSubdomain = parts[0];
      }
    }

    setSubdomain(currentSubdomain);
  }, []);

  const fetchAkademik = async () => {
    if (!subdomain) {
      return;
    }

    if (!API_URL) {
      setError("NEXT_PUBLIC_API_URL belum dikonfigurasi.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const url =
        `${API_URL}/api/v1/publik/` +
        `${encodeURIComponent(subdomain)}/halaman/` +
        `${encodeURIComponent(SLUG_AKADEMIK)}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      const text = await response.text();

      let result;

      try {
        result = text ? JSON.parse(text) : null;
      } catch {
        throw new Error(
          "Server mengembalikan response yang tidak valid."
        );
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            "Gagal mengambil halaman akademik."
        );
      }

      setPage(result?.data || null);
    } catch (err) {
      console.error("Akademik error:", err);
      setPage(null);
      setError(
        err?.message ||
          "Terjadi kesalahan saat mengambil data akademik."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!subdomain) return;

    fetchAkademik();
  }, [subdomain]);

  const navigation = [
    {
      label: "Beranda",
      path: "/",
    },
    {
      label: "Tentang",
      path: "/tentang",
    },
    {
      label: "Akademik",
      path: "/akademik",
      active: true,
    },
    {
      label: "Artikel",
      path: "/articles",
    },
    {
      label: "Kontak",
      path: "/kontak",
    },
  ];

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
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.path}
                className={`relative text-sm font-medium transition ${
                  item.active
                    ? "font-semibold text-[#155DFC]"
                    : "text-slate-500 hover:text-[#155DFC]"
                }`}
              >
                {item.label}

                {item.active && (
                  <span className="absolute -bottom-[29px] left-0 h-0.5 w-full rounded-full bg-[#155DFC]" />
                )}
              </Link>
            ))}
          </nav>

          <div className="hidden md:block">
            <Link
              href="/kontak"
              className="inline-flex items-center gap-2 rounded-xl bg-[#155DFC] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0D47C9]"
            >
              Hubungi Kami
              <ArrowRight size={16} />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#155DFC] md:hidden"
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-200 bg-white px-6 py-5 md:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.label}
                  href={item.path}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
                    item.active
                      ? "bg-blue-50 font-semibold text-[#155DFC]"
                      : "text-slate-600 hover:bg-slate-50 hover:text-[#155DFC]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              <Link
                href="/kontak"
                onClick={() => setMenuOpen(false)}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#155DFC] px-4 py-3 text-sm font-semibold text-white"
              >
                Hubungi Kami
                <ArrowRight size={16} />
              </Link>
            </nav>
          </div>
        )}
      </header>

      <section className="relative overflow-hidden bg-[#071A36]">
        <div className="absolute right-[-160px] top-[-180px] h-[460px] w-[460px] rounded-full bg-blue-600/20 blur-3xl" />

        <div className="absolute bottom-[-220px] left-[-140px] h-[420px] w-[420px] rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <Link
                href="/"
                className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-blue-300 transition hover:text-white"
              >
                <ChevronRight
                  size={16}
                  className="rotate-180"
                />
                Kembali ke Beranda
              </Link>

              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-300">
                <BookOpen size={15} />
                Informasi Akademik
              </div>

              <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                {page?.judul || "Akademik"}
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Informasi mengenai sistem pembelajaran,
                kurikulum, tenaga pendidik, serta berbagai
                kegiatan akademik yang mendukung perkembangan
                peserta didik.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="#informasi-akademik"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#0D47C9] transition hover:bg-blue-50"
                >
                  Lihat Informasi
                  <ArrowRight size={16} />
                </Link>

                <Link
                  href="/kontak"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Hubungi Sekolah
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-xl">
                <div className="rounded-2xl bg-white p-6 sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#155DFC]">
                        Fokus Pendidikan
                      </p>

                      <h2 className="mt-2 text-xl font-bold text-slate-900">
                        Pembelajaran berkualitas
                      </h2>
                    </div>

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#155DFC]">
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

      <section
        id="informasi-akademik"
        className="mx-auto max-w-7xl px-6 py-14 lg:px-8 lg:py-20"
      >
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#155DFC]">
            Lingkup Akademik
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Pendidikan yang terarah
          </h2>

          <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
            Informasi akademik sekolah mencakup berbagai
            aspek pembelajaran dan pengembangan peserta didik.
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

      <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-8 lg:pb-20">
        {loading && (
          <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                <Loader2
                  size={28}
                  className="animate-spin text-[#155DFC]"
                />
              </div>

              <h3 className="mt-5 font-bold text-slate-900">
                Memuat informasi akademik
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Mengambil konten terbaru dari server sekolah.
              </p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="overflow-hidden rounded-3xl border border-red-200 bg-white shadow-sm">
            <div className="border-b border-red-100 bg-red-50 px-6 py-5 sm:px-8">
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
              <p className="text-sm leading-7 text-slate-600">
                {error}
              </p>

              <button
                type="button"
                onClick={fetchAkademik}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#155DFC] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0D47C9]"
              >
                <RefreshCw size={16} />
                Coba Lagi
              </button>
            </div>
          </div>
        )}

        {!loading && !error && page?.konten && (
          <div className="grid gap-7 lg:grid-cols-[280px_1fr]">
            <aside className="h-fit rounded-3xl bg-[#071A36] p-6 text-white lg:sticky lg:top-28">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
                <Target size={23} />
              </div>

              <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-blue-300">
                Akademik
              </p>

              <h2 className="mt-2 text-xl font-bold leading-7">
                Sistem pembelajaran sekolah
              </h2>

              <p className="mt-4 text-sm leading-6 text-slate-400">
                Informasi akademik resmi yang dikelola
                melalui portal SmartSchool.
              </p>

              <div className="mt-7 space-y-3 border-t border-white/10 pt-6">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle2
                    size={17}
                    className="shrink-0 text-blue-400"
                  />
                  Kurikulum
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle2
                    size={17}
                    className="shrink-0 text-blue-400"
                  />
                  Pembelajaran
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle2
                    size={17}
                    className="shrink-0 text-blue-400"
                  />
                  Tenaga pendidik
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle2
                    size={17}
                    className="shrink-0 text-blue-400"
                  />
                  Prestasi siswa
                </div>
              </div>
            </aside>

            <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-6 sm:px-9">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#155DFC]">
                    <BookOpen size={20} />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#155DFC]">
                      Informasi Resmi
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-slate-900">
                      {page?.judul || "Informasi Akademik"}
                    </h2>
                  </div>
                </div>
              </div>

              <div className="px-6 py-8 sm:px-9 sm:py-10">
                <div
                  className="prose prose-slate max-w-none text-sm leading-8 sm:text-base"
                  dangerouslySetInnerHTML={{
                    __html: page.konten,
                  }}
                />
              </div>
            </article>
          </div>
        )}

        {!loading && !error && !page?.konten && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <InfoCard
                icon={GraduationCap}
                number="01"
                title="Kurikulum"
                description="Informasi kurikulum dan sistem pembelajaran sekolah."
              />

              <InfoCard
                icon={BookOpen}
                number="02"
                title="Mata Pelajaran"
                description="Daftar bidang studi yang tersedia di sekolah."
              />

              <InfoCard
                icon={Users}
                number="03"
                title="Tenaga Pendidik"
                description="Guru dan tenaga pendidik profesional."
              />

              <InfoCard
                icon={Award}
                number="04"
                title="Prestasi"
                description="Berbagai pencapaian peserta didik."
              />
            </div>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[#155DFC] px-7 py-10 sm:px-10 lg:px-12 lg:py-12">
          <div className="absolute right-[-100px] top-[-120px] h-72 w-72 rounded-full bg-white/10 blur-3xl" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">
                SmartSchool
              </p>

              <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Ingin mengetahui informasi sekolah lebih lanjut?
              </h2>

              <p className="mt-3 text-sm leading-7 text-blue-100 sm:text-base">
                Hubungi sekolah untuk mendapatkan informasi
                lebih lengkap mengenai program dan layanan
                pendidikan.
              </p>
            </div>

            <Link
              href="/kontak"
              className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#155DFC] transition hover:bg-blue-50"
            >
              Hubungi Kami
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-9 lg:px-8">
          <div className="flex flex-col justify-between gap-7 md:flex-row md:items-center">
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
              {navigation.map((item) => (
                <Link
                  key={item.label}
                  href={item.path}
                  className={`transition ${
                    item.active
                      ? "font-semibold text-[#155DFC]"
                      : "text-slate-500 hover:text-[#155DFC]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="mt-7 border-t border-slate-100 pt-5">
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

function AcademicPoint({ icon: Icon, title, text }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#155DFC]">
        <Icon size={18} />
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-900">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {text}
        </p>
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  number,
  title,
  description,
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#155DFC] transition duration-300 group-hover:bg-[#155DFC] group-hover:text-white">
          <Icon size={21} />
        </div>

        <span className="text-xs font-bold tracking-widest text-slate-300">
          {number}
        </span>
      </div>

      <h3 className="mt-6 text-base font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}