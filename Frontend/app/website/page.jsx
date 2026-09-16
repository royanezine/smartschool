"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  GraduationCap,
  Menu,
  Newspaper,
  School,
  Trophy,
  Users,
  X,
  UserCircle,
  Lock,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Award,
  Building2,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const SUBDOMAIN = "smart";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=2000&q=85";

export default function WebsiteHomePage() {
  const [artikel, setArtikel] = useState([]);
  const [loadingArtikel, setLoadingArtikel] = useState(true);
  const [errorArtikel, setErrorArtikel] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    async function fetchArtikel() {
      try {
        setLoadingArtikel(true);
        setErrorArtikel("");

        if (!API_URL) {
          throw new Error("NEXT_PUBLIC_API_URL belum dikonfigurasi.");
        }

        const response = await fetch(
          `${API_URL}/api/v1/publik/${SUBDOMAIN}/artikel`
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message || "Gagal mengambil artikel."
          );
        }

        setArtikel(Array.isArray(result?.data) ? result.data : []);
      } catch (error) {
        console.error("Gagal mengambil artikel publik:", error);
        setErrorArtikel(
          error?.message || "Gagal mengambil artikel."
        );
      } finally {
        setLoadingArtikel(false);
      }
    }

    fetchArtikel();
  }, []);

  const artikelTerbaru = artikel.slice(0, 3);

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-[#0f3b91] text-white shadow-lg shadow-blue-900/20 transition-transform duration-300 group-hover:scale-105">
              <School size={22} />
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[8px] font-bold text-slate-900">
                S
              </span>
            </div>

            <div>
              <p className="text-[15px] font-extrabold tracking-tight text-[#0f172a]">
                SMK SMART SCHOOL
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Sekolah Digital
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/"
              className="relative text-sm font-semibold text-blue-600"
            >
              Beranda
              <span className="absolute -bottom-2 left-0 h-0.5 w-full rounded-full bg-blue-600" />
            </Link>

            <NavLink href="/tentang" label="Tentang" />
            <NavLink href="/akademik" label="Akademik" />
            <NavLink href="/articles" label="Artikel" />
            <NavLink href="/kontak" label="Kontak" />
          </nav>

          <div className="hidden md:block">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0f3b91] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-900/20 transition hover:bg-blue-700"
            >
              Portal Sekolah
              <ArrowRight size={15} />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenu(!mobileMenu)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 md:hidden"
          >
            {mobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileMenu && (
          <div className="border-t border-slate-100 bg-white px-5 py-4 shadow-xl md:hidden">
            <nav className="space-y-1">
              <MobileNavLink
                href="/"
                label="Beranda"
                onClick={() => setMobileMenu(false)}
              />
              <MobileNavLink
                href="/tentang"
                label="Tentang"
                onClick={() => setMobileMenu(false)}
              />
              <MobileNavLink
                href="/akademik"
                label="Akademik"
                onClick={() => setMobileMenu(false)}
              />
              <MobileNavLink
                href="/articles"
                label="Artikel"
                onClick={() => setMobileMenu(false)}
              />
              <MobileNavLink
                href="/kontak"
                label="Kontak"
                onClick={() => setMobileMenu(false)}
              />

              <Link
                href="/login"
                onClick={() => setMobileMenu(false)}
                className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-[#0f3b91] px-4 py-3 text-sm font-semibold text-white"
              >
                Portal Sekolah
                <ArrowRight size={15} />
              </Link>
            </nav>
          </div>
        )}
      </header>

      <section className="relative min-h-[680px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url("${HERO_IMAGE}")`,
          }}
        />

        <div className="absolute inset-0 bg-[#07152f]/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07152f] via-[#0d2b63]/75 to-[#0d2b63]/35" />

        <div className="absolute right-[-120px] top-[-120px] h-[420px] w-[420px] rounded-full border border-white/10 bg-blue-500/10 blur-3xl" />

        <div className="absolute bottom-[-180px] left-[-120px] h-[420px] w-[420px] rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative mx-auto flex min-h-[680px] max-w-7xl items-center px-5 py-20 sm:px-8">
          <div className="grid w-full items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="max-w-3xl animate-fade-up">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-blue-100 backdrop-blur-md">
                <Sparkles size={14} />
                Portal Resmi Sekolah Digital
              </div>

              <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[64px]">
                Membangun Generasi
                <span className="mt-2 block text-blue-300">
                  Berprestasi & Berkarakter
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
                Selamat datang di website resmi SMK Smart School.
                Temukan informasi akademik, kegiatan, prestasi,
                berita, dan layanan sekolah dalam satu platform
                digital yang terintegrasi.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/articles"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-blue-900/30 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-500"
                >
                  Jelajahi Informasi
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>

                <Link
                  href="/tentang"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/15"
                >
                  Tentang Sekolah
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-blue-300" />
                  Pendidikan Terintegrasi
                </div>

                <div className="flex items-center gap-2">
                  <Award size={16} className="text-blue-300" />
                  Berorientasi Prestasi
                </div>

                <div className="flex items-center gap-2">
                  <Users size={16} className="text-blue-300" />
                  Komunitas Positif
                </div>
              </div>
            </div>

            <div className="hidden lg:block animate-fade-up-delay">
              <div className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40">
                  <div className="relative h-[270px] overflow-hidden">
                    <img
                      src={HERO_IMAGE}
                      alt="Gedung sekolah"
                      className="h-full w-full object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#07152f] via-transparent to-transparent" />

                    <div className="absolute bottom-5 left-5 right-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">
                        SmartSchool
                      </p>

                      <h2 className="mt-2 text-xl font-bold text-white">
                        Lingkungan belajar untuk masa depan
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-px bg-white/10">
                    <HeroMiniStat
                      icon={<Users size={18} />}
                      value="1.200+"
                      label="Siswa Aktif"
                    />

                    <HeroMiniStat
                      icon={<GraduationCap size={18} />}
                      value="80+"
                      label="Guru & Staff"
                    />

                    <HeroMiniStat
                      icon={<Trophy size={18} />}
                      value="50+"
                      label="Prestasi"
                    />

                    <HeroMiniStat
                      icon={<Building2 size={18} />}
                      value="25+"
                      label="Program"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-10 px-5 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          <QuickInfo
            icon={<GraduationCap size={22} />}
            title="Pendidikan Berkualitas"
            description="Pembelajaran terarah untuk mendukung kompetensi dan karakter siswa."
          />

          <QuickInfo
            icon={<Trophy size={22} />}
            title="Pengembangan Prestasi"
            description="Mendorong siswa berkembang melalui berbagai program akademik dan nonakademik."
          />

          <QuickInfo
            icon={<ShieldCheck size={22} />}
            title="Lingkungan Positif"
            description="Membangun lingkungan sekolah yang aman, nyaman, dan kolaboratif."
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-blue-600">
            <Lock size={14} />
            Akses Cepat
          </span>

          <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Portal Sekolah
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">
            Akses layanan digital sesuai kebutuhan Anda.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <PortalCard
            icon={<UserCircle size={27} />}
            title="Portal Siswa"
            description="Akses jadwal, nilai, tugas, ujian, dan informasi akademik."
            link="/login"
            variant="blue"
          />

          <PortalCard
            icon={<GraduationCap size={27} />}
            title="Portal Guru"
            description="Kelola kelas, materi, tugas, ujian, dan penilaian siswa."
            link="/login"
            variant="indigo"
          />

          <PortalCard
            icon={<Users size={27} />}
            title="Portal Orang Tua"
            description="Pantau perkembangan akademik dan kegiatan siswa."
            link="/login"
            variant="slate"
          />
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-600">
                <Newspaper size={15} />
                Informasi Sekolah
              </span>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Artikel Terbaru
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-500">
                Berita, kegiatan, dan informasi terbaru dari sekolah.
              </p>
            </div>

            <Link
              href="/articles"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Lihat Semua
              <ChevronRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>

          {loadingArtikel && (
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <ArticleSkeleton key={item} />
              ))}
            </div>
          )}

          {!loadingArtikel && errorArtikel && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
              <p className="text-sm font-bold text-red-700">
                Gagal memuat artikel
              </p>

              <p className="mt-1 text-xs text-red-600">
                {errorArtikel}
              </p>
            </div>
          )}

          {!loadingArtikel &&
            !errorArtikel &&
            artikelTerbaru.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
                <Newspaper
                  size={42}
                  className="mx-auto text-slate-300"
                />

                <h3 className="mt-4 text-sm font-bold text-slate-700">
                  Belum ada artikel
                </h3>

                <p className="mt-2 text-xs text-slate-400">
                  Artikel yang dipublikasikan melalui CMS akan
                  muncul di sini.
                </p>
              </div>
            )}

          {!loadingArtikel &&
            !errorArtikel &&
            artikelTerbaru.length > 0 && (
              <div className="grid gap-6 md:grid-cols-3">
                {artikelTerbaru.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                  />
                ))}
              </div>
            )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="grid overflow-hidden rounded-3xl bg-[#0d2b63] shadow-2xl lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative overflow-hidden p-10 sm:p-14">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />

            <div className="relative">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">
                Tentang SmartSchool
              </span>

              <h2 className="mt-4 max-w-2xl text-3xl font-bold leading-tight text-white sm:text-4xl">
                Mempersiapkan siswa untuk masa depan yang lebih baik.
              </h2>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-blue-100">
                Kami berkomitmen menghadirkan lingkungan pendidikan
                yang mendukung perkembangan akademik, karakter,
                keterampilan, kreativitas, dan prestasi siswa.
              </p>

              <Link
                href="/tentang"
                className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-[#0d2b63] shadow-lg transition hover:bg-blue-50"
              >
                Kenali Sekolah Kami
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>

          <div className="relative hidden min-h-[330px] lg:block">
            <img
              src={HERO_IMAGE}
              alt="Lingkungan sekolah"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-[#07152f]/60" />

            <div className="absolute inset-0 flex items-center justify-center p-10">
              <div className="w-full rounded-2xl border border-white/15 bg-white/10 p-7 backdrop-blur-xl">
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-200">
                  SmartSchool
                </p>

                <p className="mt-3 text-xl font-bold leading-8 text-white">
                  Satu platform untuk informasi sekolah yang modern
                  dan terintegrasi.
                </p>

                <div className="mt-6 space-y-3">
                  <FeatureItem
                    icon={<BookOpen size={15} />}
                    text="Informasi akademik"
                  />

                  <FeatureItem
                    icon={<Newspaper size={15} />}
                    text="Berita & artikel sekolah"
                  />

                  <FeatureItem
                    icon={<Award size={15} />}
                    text="Prestasi siswa"
                  />

                  <FeatureItem
                    icon={<CalendarDays size={15} />}
                    text="Kegiatan sekolah"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#07152f]">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <School size={19} />
                </div>

                <div>
                  <p className="text-sm font-bold text-white">
                    SMK SMART SCHOOL
                  </p>

                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    Sekolah Digital
                  </p>
                </div>
              </div>

              <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
                Website resmi sekolah sebagai pusat informasi,
                berita, kegiatan, prestasi, dan layanan digital
                sekolah.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">
                Navigasi
              </h3>

              <div className="mt-5 space-y-3">
                <FooterLink href="/" label="Beranda" />
                <FooterLink href="/tentang" label="Tentang Sekolah" />
                <FooterLink href="/akademik" label="Akademik" />
                <FooterLink href="/articles" label="Artikel" />
                <FooterLink href="/kontak" label="Kontak" />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">
                Kontak
              </h3>

              <div className="mt-5 space-y-4 text-sm text-slate-400">
                <div className="flex gap-3">
                  <MapPin
                    size={18}
                    className="mt-0.5 shrink-0 text-blue-400"
                  />

                  <span>Jl. Pendidikan No. 1, Indonesia</span>
                </div>

                <div className="flex gap-3">
                  <Phone
                    size={18}
                    className="mt-0.5 shrink-0 text-blue-400"
                  />

                  <span>021-12345678</span>
                </div>

                <div className="flex gap-3">
                  <Mail
                    size={18}
                    className="mt-0.5 shrink-0 text-blue-400"
                  />

                  <span>info@smartschool.id</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-white/10 pt-6">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} SmartSchool. Semua hak
              dilindungi.
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(25px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-up {
          animation: fade-up 0.8s ease-out forwards;
        }

        .animate-fade-up-delay {
          opacity: 0;
          animation: fade-up 1s ease-out 0.2s forwards;
        }
      `}</style>
    </main>
  );
}

function NavLink({ href, label }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-slate-500 transition hover:text-blue-600"
    >
      {label}
    </Link>
  );
}

function MobileNavLink({ href, label, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block border-b border-slate-100 px-2 py-3 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
    >
      {label}
    </Link>
  );
}

function HeroMiniStat({ icon, value, label }) {
  return (
    <div className="bg-slate-950/30 p-5">
      <div className="text-blue-300">{icon}</div>

      <p className="mt-3 text-xl font-bold text-white">
        {value}
      </p>

      <p className="mt-1 text-[11px] text-slate-400">
        {label}
      </p>
    </div>
  );
}

function QuickInfo({ icon, title, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
          {icon}
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-950">
            {title}
          </h3>

          <p className="mt-1 text-xs leading-6 text-slate-500">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function PortalCard({
  icon,
  title,
  description,
  link,
  variant,
}) {
  const variants = {
    blue: "bg-blue-600 shadow-blue-600/20",
    indigo: "bg-indigo-600 shadow-indigo-600/20",
    slate: "bg-slate-800 shadow-slate-800/20",
  };

  return (
    <Link
      href={link}
      className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-xl"
    >
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg transition duration-300 group-hover:scale-105 ${variants[variant]}`}
      >
        {icon}
      </div>

      <h3 className="mt-6 text-lg font-bold text-slate-950">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

      <div className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-blue-600">
        Masuk ke Portal
        <ArrowRight
          size={14}
          className="transition-transform group-hover:translate-x-1"
        />
      </div>
    </Link>
  );
}

function ArticleCard({ article }) {
  return (
    <Link
      href={`/articles/${article.id}`}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-xl"
    >
      <div className="aspect-[16/9] overflow-hidden bg-slate-100">
        {article.gambarUtama ? (
          <img
            src={article.gambarUtama}
            alt={article.judul || "Artikel"}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 text-blue-200">
            <Newspaper size={46} />
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex flex-wrap items-center gap-2">
          {article.kategoriArtikel?.nama && (
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-600">
              {article.kategoriArtikel.nama}
            </span>
          )}

          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
            <CalendarDays size={12} />
            {formatDate(article.dibuatPada)}
          </span>
        </div>

        <h3 className="mt-4 line-clamp-2 text-lg font-bold leading-7 text-slate-950 transition group-hover:text-blue-600">
          {article.judul}
        </h3>

        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
          {article.ringkasan ||
            "Baca informasi lengkap mengenai artikel ini."}
        </p>

        <div className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-blue-600">
          Baca Selengkapnya
          <ArrowRight size={14} />
        </div>
      </div>
    </Link>
  );
}

function FeatureItem({ icon, text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-blue-200">
        {icon}
      </div>

      <span className="text-sm text-blue-100">{text}</span>
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

function ArticleSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="aspect-[16/9] animate-pulse bg-slate-100" />

      <div className="space-y-3 p-6">
        <div className="h-3 w-24 animate-pulse bg-slate-100" />
        <div className="h-5 w-full animate-pulse bg-slate-100" />
        <div className="h-5 w-4/5 animate-pulse bg-slate-100" />
        <div className="h-4 w-full animate-pulse bg-slate-100" />
        <div className="h-4 w-3/4 animate-pulse bg-slate-100" />
      </div>
    </div>
  );
}

function formatDate(date) {
  if (!date) return "-";

  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return "-";
  }
}