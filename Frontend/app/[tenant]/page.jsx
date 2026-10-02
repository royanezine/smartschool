"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
  Sparkles,
  ShieldCheck,
  BookOpen,
  Award,
  Building2,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

/* =========================================================
   API CONFIG
========================================================= */

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=2000&q=85";

/* =========================================================
   DEFAULT THEME
   Dipakai jika theme dari CMS belum tersedia / gagal diambil
========================================================= */

const DEFAULT_THEME = {
  primary: "#2563EB",
  secondary: "#64748B",
  accent: "#F59E0B",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  text: "#0F172A",
  border: "#E2E8F0",
};

/* =========================================================
   HELPER API
========================================================= */

function getPublicApiBase() {
  if (API_URL.endsWith("/api")) {
    return `${API_URL}/v1/publik`;
  }

  return `${API_URL}/api/v1/publik`;
}

/* =========================================================
   HELPER HEX
========================================================= */

function getThemeColor(theme, key) {
  return theme?.[key] || DEFAULT_THEME[key];
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function WebsiteHomePage() {
  const params = useParams();

  const tenant =
    typeof params?.tenant === "string"
      ? params.tenant
      : Array.isArray(params?.tenant)
        ? params.tenant[0]
        : "smart";

  const [artikel, setArtikel] = useState([]);
  const [loadingArtikel, setLoadingArtikel] = useState(true);
  const [errorArtikel, setErrorArtikel] = useState("");

  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [loadingTheme, setLoadingTheme] = useState(true);

  const [mobileMenu, setMobileMenu] = useState(false);

  /* =======================================================
     URL TENANT
  ======================================================= */

  const homeUrl = `/${tenant}`;
  const tentangUrl = `/${tenant}/tentang`;
  const akademikUrl = `/${tenant}/akademik`;
  const artikelUrl = `/${tenant}/articles`;
  const kontakUrl = `/${tenant}/kontak`;
  const loginUrl = "/login";

  /* =======================================================
     FETCH THEME DARI CMS
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function fetchTheme() {
      try {
        setLoadingTheme(true);

        if (!tenant) {
          return;
        }

        const apiBase = getPublicApiBase();

        const response = await fetch(
          `${apiBase}/${encodeURIComponent(tenant)}/tema`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        /*
         * Kalau endpoint theme belum ada / error,
         * jangan bikin website rusak.
         */
        if (!response.ok) {
          console.warn(
            "Theme publik belum tersedia. Menggunakan warna default."
          );

          if (mounted) {
            setTheme(DEFAULT_THEME);
          }

          return;
        }

        const result = await response.json();

        const data = result?.data;

        if (!data) {
          if (mounted) {
            setTheme(DEFAULT_THEME);
          }

          return;
        }

        const cmsTheme = {
          primary:
            data?.tema?.primary?.hex || DEFAULT_THEME.primary,

          secondary:
            data?.tema?.secondary?.hex || DEFAULT_THEME.secondary,

          accent:
            data?.tema?.accent?.hex || DEFAULT_THEME.accent,

          background:
            data?.tema?.background?.hex || DEFAULT_THEME.background,

          surface:
            data?.tema?.surface?.hex || DEFAULT_THEME.surface,

          text:
            data?.tema?.text?.hex || DEFAULT_THEME.text,

          border:
            data?.tema?.border?.hex || DEFAULT_THEME.border,
        };

        if (mounted) {
          setTheme(cmsTheme);
        }
      } catch (error) {
        console.error("Gagal mengambil theme publik:", error);

        if (mounted) {
          setTheme(DEFAULT_THEME);
        }
      } finally {
        if (mounted) {
          setLoadingTheme(false);
        }
      }
    }

    fetchTheme();

    return () => {
      mounted = false;
    };
  }, [tenant]);

  /* =======================================================
     APPLY THEME KE CSS VARIABLE
  ======================================================= */

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const root = document.documentElement;

    root.style.setProperty(
      "--school-primary",
      getThemeColor(theme, "primary")
    );

    root.style.setProperty(
      "--school-secondary",
      getThemeColor(theme, "secondary")
    );

    root.style.setProperty(
      "--school-accent",
      getThemeColor(theme, "accent")
    );

    root.style.setProperty(
      "--school-background",
      getThemeColor(theme, "background")
    );

    root.style.setProperty(
      "--school-surface",
      getThemeColor(theme, "surface")
    );

    root.style.setProperty(
      "--school-text",
      getThemeColor(theme, "text")
    );

    root.style.setProperty(
      "--school-border",
      getThemeColor(theme, "border")
    );
  }, [theme]);

  /* =======================================================
     FETCH ARTIKEL CMS
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function fetchArtikel() {
      try {
        setLoadingArtikel(true);
        setErrorArtikel("");

        if (!tenant) {
          throw new Error("Tenant sekolah tidak ditemukan.");
        }

        const apiBase = getPublicApiBase();

        const response = await fetch(
          `${apiBase}/${encodeURIComponent(tenant)}/artikel`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message || "Gagal mengambil artikel."
          );
        }

        const data = Array.isArray(result?.data)
          ? result.data
          : [];

        if (mounted) {
          setArtikel(data);
        }
      } catch (error) {
        console.error(
          "Gagal mengambil artikel publik:",
          error
        );

        if (mounted) {
          setErrorArtikel(
            error?.message || "Gagal mengambil artikel."
          );
          setArtikel([]);
        }
      } finally {
        if (mounted) {
          setLoadingArtikel(false);
        }
      }
    }

    fetchArtikel();

    return () => {
      mounted = false;
    };
  }, [tenant]);

  const artikelTerbaru = artikel.slice(0, 3);

  return (
    <main
      className="min-h-screen overflow-x-hidden"
      style={{
        backgroundColor: "var(--school-background)",
        color: "var(--school-text)",
      }}
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <header
        className="sticky top-0 z-50 border-b backdrop-blur-xl"
        style={{
          borderColor: "var(--school-border)",
          backgroundColor: "rgba(255,255,255,0.92)",
        }}
      >
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
          {/* LOGO */}

          <Link
            href={homeUrl}
            className="group flex items-center gap-3"
          >
            <div
              className="relative flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-lg transition-transform duration-300 group-hover:scale-105"
              style={{
                backgroundColor: "var(--school-primary)",
                boxShadow:
                  "0 10px 25px color-mix(in srgb, var(--school-primary) 25%, transparent)",
              }}
            >
              <School size={22} />

              <span
                className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold"
                style={{
                  backgroundColor: "var(--school-accent)",
                  color: "var(--school-text)",
                }}
              >
                S
              </span>
            </div>

            <div>
              <p
                className="text-[15px] font-extrabold tracking-tight"
                style={{
                  color: "var(--school-text)",
                }}
              >
                SMK SMART SCHOOL
              </p>

              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Sekolah Digital
              </p>
            </div>
          </Link>

          {/* DESKTOP NAV */}

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href={homeUrl}
              className="relative text-sm font-semibold"
              style={{
                color: "var(--school-primary)",
              }}
            >
              Beranda

              <span
                className="absolute -bottom-2 left-0 h-0.5 w-full rounded-full"
                style={{
                  backgroundColor: "var(--school-primary)",
                }}
              />
            </Link>

            <NavLink
              href={tentangUrl}
              label="Tentang"
            />

            <NavLink
              href={akademikUrl}
              label="Akademik"
            />

            <NavLink
              href={artikelUrl}
              label="Artikel"
            />

            <NavLink
              href={kontakUrl}
              label="Kontak"
            />
          </nav>

          {/* LOGIN DESKTOP */}

          <div className="hidden md:block">
            <Link
              href={loginUrl}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5"
              style={{
                backgroundColor: "var(--school-primary)",
              }}
            >
              Portal Sekolah

              <ArrowRight size={15} />
            </Link>
          </div>

          {/* MOBILE BUTTON */}

          <button
            type="button"
            onClick={() => setMobileMenu(!mobileMenu)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border text-slate-600 transition md:hidden"
            style={{
              borderColor: "var(--school-border)",
            }}
          >
            {mobileMenu ? (
              <X size={20} />
            ) : (
              <Menu size={20} />
            )}
          </button>
        </div>

        {/* MOBILE MENU */}

        {mobileMenu && (
          <div
            className="border-t px-5 py-4 shadow-xl md:hidden"
            style={{
              borderColor: "var(--school-border)",
              backgroundColor: "var(--school-surface)",
            }}
          >
            <nav className="space-y-1">
              <MobileNavLink
                href={homeUrl}
                label="Beranda"
                onClick={() => setMobileMenu(false)}
              />

              <MobileNavLink
                href={tentangUrl}
                label="Tentang"
                onClick={() => setMobileMenu(false)}
              />

              <MobileNavLink
                href={akademikUrl}
                label="Akademik"
                onClick={() => setMobileMenu(false)}
              />

              <MobileNavLink
                href={artikelUrl}
                label="Artikel"
                onClick={() => setMobileMenu(false)}
              />

              <MobileNavLink
                href={kontakUrl}
                label="Kontak"
                onClick={() => setMobileMenu(false)}
              />

              <Link
                href={loginUrl}
                onClick={() => setMobileMenu(false)}
                className="mt-3 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white"
                style={{
                  backgroundColor: "var(--school-primary)",
                }}
              >
                Portal Sekolah

                <ArrowRight size={15} />
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* ===================================================
          HERO
      =================================================== */}

      <section className="relative min-h-[680px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url("${HERO_IMAGE}")`,
          }}
        />

        <div className="absolute inset-0 bg-slate-950/80" />

        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(
              90deg,
              color-mix(in srgb, var(--school-primary) 90%, #000 35%),
              color-mix(in srgb, var(--school-primary) 70%, #000 20%),
              color-mix(in srgb, var(--school-secondary) 40%, transparent)
            )`,
          }}
        />

        <div
          className="absolute right-[-120px] top-[-120px] h-[420px] w-[420px] rounded-full border blur-3xl"
          style={{
            borderColor:
              "color-mix(in srgb, var(--school-primary) 25%, transparent)",
            backgroundColor:
              "color-mix(in srgb, var(--school-primary) 20%, transparent)",
          }}
        />

        <div
          className="absolute bottom-[-180px] left-[-120px] h-[420px] w-[420px] rounded-full blur-3xl"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--school-primary) 20%, transparent)",
          }}
        />

        <div className="relative mx-auto flex min-h-[680px] max-w-7xl items-center px-5 py-20 sm:px-8">
          <div className="grid w-full items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
            {/* HERO CONTENT */}

            <div className="max-w-3xl animate-fade-up">
              <div
                className="mb-7 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold backdrop-blur-md"
                style={{
                  borderColor: "rgba(255,255,255,0.15)",
                  backgroundColor: "rgba(255,255,255,0.10)",
                  color: "#dbeafe",
                }}
              >
                <Sparkles size={14} />

                Portal Resmi Sekolah Digital
              </div>

              <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[64px]">
                Membangun Generasi

                <span
                  className="mt-2 block"
                  style={{
                    color:
                      "color-mix(in srgb, var(--school-accent) 80%, white)",
                  }}
                >
                  Berprestasi & Berkarakter
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
                Selamat datang di website resmi SMK Smart
                School. Temukan informasi akademik,
                kegiatan, prestasi, berita, dan layanan
                sekolah dalam satu platform digital yang
                terintegrasi.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={artikelUrl}
                  className="group inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-white shadow-xl transition duration-300 hover:-translate-y-0.5"
                  style={{
                    backgroundColor:
                      "var(--school-primary)",
                  }}
                >
                  Jelajahi Informasi

                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>

                <Link
                  href={tentangUrl}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/15"
                  style={{
                    borderColor:
                      "rgba(255,255,255,0.20)",
                  }}
                >
                  Tentang Sekolah
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    size={16}
                    style={{
                      color:
                        "color-mix(in srgb, var(--school-accent) 70%, white)",
                    }}
                  />

                  Pendidikan Terintegrasi
                </div>

                <div className="flex items-center gap-2">
                  <Award
                    size={16}
                    style={{
                      color:
                        "color-mix(in srgb, var(--school-accent) 70%, white)",
                    }}
                  />

                  Berorientasi Prestasi
                </div>

                <div className="flex items-center gap-2">
                  <Users
                    size={16}
                    style={{
                      color:
                        "color-mix(in srgb, var(--school-accent) 70%, white)",
                    }}
                  />

                  Komunitas Positif
                </div>
              </div>
            </div>

            {/* HERO CARD */}

            <div className="hidden lg:block animate-fade-up-delay">
              <div className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40">
                  <div className="relative h-[270px] overflow-hidden">
                    <img
                      src={HERO_IMAGE}
                      alt="Gedung sekolah"
                      className="h-full w-full object-cover"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                    <div className="absolute bottom-5 left-5 right-5">
                      <p
                        className="text-xs font-semibold uppercase tracking-[0.18em]"
                        style={{
                          color:
                            "color-mix(in srgb, var(--school-accent) 70%, white)",
                        }}
                      >
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

      {/* ===================================================
          QUICK INFO
      =================================================== */}

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

      {/* ===================================================
          PORTAL
      =================================================== */}

      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--school-primary) 10%, white)",
              color: "var(--school-primary)",
            }}
          >
            <Lock size={14} />

            Akses Cepat
          </span>

          <h2
            className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl"
            style={{
              color: "var(--school-text)",
            }}
          >
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
            link={loginUrl}
          />

          <PortalCard
            icon={<GraduationCap size={27} />}
            title="Portal Guru"
            description="Kelola kelas, materi, tugas, ujian, dan penilaian siswa."
            link={loginUrl}
          />

          <PortalCard
            icon={<Users size={27} />}
            title="Portal Orang Tua"
            description="Pantau perkembangan akademik dan kegiatan siswa."
            link={loginUrl}
          />
        </div>
      </section>

      {/* ===================================================
          ARTIKEL
      =================================================== */}

      <section
        className="border-y py-24"
        style={{
          borderColor: "var(--school-border)",
          backgroundColor: "var(--school-surface)",
        }}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <span
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
                style={{
                  color: "var(--school-primary)",
                }}
              >
                <Newspaper size={15} />

                Informasi Sekolah
              </span>

              <h2
                className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
                style={{
                  color: "var(--school-text)",
                }}
              >
                Artikel Terbaru
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-500">
                Berita, kegiatan, dan informasi terbaru dari
                sekolah.
              </p>
            </div>

            <Link
              href={artikelUrl}
              className="group inline-flex items-center gap-2 text-sm font-semibold transition"
              style={{
                color: "var(--school-primary)",
              }}
            >
              Lihat Semua

              <ChevronRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>

          {/* LOADING */}

          {loadingArtikel && (
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <ArticleSkeleton key={item} />
              ))}
            </div>
          )}

          {/* ERROR */}

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

          {/* EMPTY */}

          {!loadingArtikel &&
            !errorArtikel &&
            artikelTerbaru.length === 0 && (
              <div
                className="rounded-2xl border border-dashed px-6 py-16 text-center"
                style={{
                  borderColor: "var(--school-border)",
                  backgroundColor:
                    "color-mix(in srgb, var(--school-background) 80%, white)",
                }}
              >
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

          {/* ARTIKEL */}

          {!loadingArtikel &&
            !errorArtikel &&
            artikelTerbaru.length > 0 && (
              <div className="grid gap-6 md:grid-cols-3">
                {artikelTerbaru.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    tenant={tenant}
                  />
                ))}
              </div>
            )}
        </div>
      </section>

      {/* ===================================================
          ABOUT
      =================================================== */}

      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div
          className="grid overflow-hidden rounded-3xl shadow-2xl lg:grid-cols-[1.1fr_0.9fr]"
          style={{
            backgroundColor: "var(--school-primary)",
          }}
        >
          <div className="relative overflow-hidden p-10 sm:p-14">
            <div
              className="absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--school-accent) 20%, transparent)",
              }}
            />

            <div className="relative">
              <span
                className="text-xs font-bold uppercase tracking-[0.2em]"
                style={{
                  color:
                    "color-mix(in srgb, var(--school-accent) 70%, white)",
                }}
              >
                Tentang SmartSchool
              </span>

              <h2 className="mt-4 max-w-2xl text-3xl font-bold leading-tight text-white sm:text-4xl">
                Mempersiapkan siswa untuk masa depan yang
                lebih baik.
              </h2>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-blue-100">
                Kami berkomitmen menghadirkan lingkungan
                pendidikan yang mendukung perkembangan
                akademik, karakter, keterampilan,
                kreativitas, dan prestasi siswa.
              </p>

              <Link
                href={tentangUrl}
                className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold shadow-lg transition hover:bg-slate-50"
                style={{
                  color: "var(--school-primary)",
                }}
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

            <div className="absolute inset-0 bg-slate-950/60" />

            <div className="absolute inset-0 flex items-center justify-center p-10">
              <div className="w-full rounded-2xl border border-white/15 bg-white/10 p-7 backdrop-blur-xl">
                <p
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{
                    color:
                      "color-mix(in srgb, var(--school-accent) 70%, white)",
                  }}
                >
                  SmartSchool
                </p>

                <p className="mt-3 text-xl font-bold leading-8 text-white">
                  Satu platform untuk informasi sekolah yang
                  modern dan terintegrasi.
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

      {/* ===================================================
          FOOTER
      =================================================== */}

      <footer
        style={{
          backgroundColor:
            "color-mix(in srgb, var(--school-primary) 70%, #020617)",
        }}
      >
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <div className="grid gap-10 md:grid-cols-3">
            {/* FOOTER BRAND */}

            <div>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                  style={{
                    backgroundColor: "var(--school-primary)",
                  }}
                >
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

            {/* NAVIGASI */}

            <div>
              <h3 className="text-sm font-bold text-white">
                Navigasi
              </h3>

              <div className="mt-5 space-y-3">
                <FooterLink
                  href={homeUrl}
                  label="Beranda"
                />

                <FooterLink
                  href={tentangUrl}
                  label="Tentang Sekolah"
                />

                <FooterLink
                  href={akademikUrl}
                  label="Akademik"
                />

                <FooterLink
                  href={artikelUrl}
                  label="Artikel"
                />

                <FooterLink
                  href={kontakUrl}
                  label="Kontak"
                />
              </div>
            </div>

            {/* KONTAK */}

            <div>
              <h3 className="text-sm font-bold text-white">
                Kontak
              </h3>

              <div className="mt-5 space-y-4 text-sm text-slate-400">
                <div className="flex gap-3">
                  <MapPin
                    size={18}
                    className="mt-0.5 shrink-0"
                    style={{
                      color: "var(--school-accent)",
                    }}
                  />

                  <span>
                    Jl. Pendidikan No. 1, Indonesia
                  </span>
                </div>

                <div className="flex gap-3">
                  <Phone
                    size={18}
                    className="mt-0.5 shrink-0"
                    style={{
                      color: "var(--school-accent)",
                    }}
                  />

                  <span>021-12345678</span>
                </div>

                <div className="flex gap-3">
                  <Mail
                    size={18}
                    className="mt-0.5 shrink-0"
                    style={{
                      color: "var(--school-accent)",
                    }}
                  />

                  <span>info@smartschool.id</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-white/10 pt-6">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} SmartSchool. Semua
              hak dilindungi.
            </p>
          </div>
        </div>
      </footer>

      {/* ===================================================
          ANIMATION
      =================================================== */}

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

/* =========================================================
   NAV LINK
========================================================= */

function NavLink({ href, label }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-slate-500 transition"
      style={{
        color: undefined,
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.color =
          "var(--school-primary)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.color = "";
      }}
    >
      {label}
    </Link>
  );
}

/* =========================================================
   MOBILE NAV LINK
========================================================= */

function MobileNavLink({ href, label, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block border-b px-2 py-3 text-sm font-semibold text-slate-600 transition"
      style={{
        borderColor: "var(--school-border)",
      }}
    >
      {label}
    </Link>
  );
}

/* =========================================================
   HERO MINI STAT
========================================================= */

function HeroMiniStat({ icon, value, label }) {
  return (
    <div className="bg-slate-950/30 p-5">
      <div
        style={{
          color:
            "color-mix(in srgb, var(--school-accent) 75%, white)",
        }}
      >
        {icon}
      </div>

      <p className="mt-3 text-xl font-bold text-white">
        {value}
      </p>

      <p className="mt-1 text-[11px] text-slate-400">
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   QUICK INFO
========================================================= */

function QuickInfo({ icon, title, description }) {
  return (
    <div
      className="rounded-2xl border bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{
        borderColor: "var(--school-border)",
        backgroundColor: "var(--school-surface)",
      }}
    >
      <div className="flex gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-lg"
          style={{
            backgroundColor: "var(--school-primary)",
          }}
        >
          {icon}
        </div>

        <div>
          <h3
            className="text-sm font-bold"
            style={{
              color: "var(--school-text)",
            }}
          >
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

/* =========================================================
   PORTAL CARD
========================================================= */

function PortalCard({
  icon,
  title,
  description,
  link,
}) {
  return (
    <Link
      href={link}
      className="group rounded-2xl border bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl"
      style={{
        borderColor: "var(--school-border)",
        backgroundColor: "var(--school-surface)",
      }}
    >
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg transition duration-300 group-hover:scale-105"
        style={{
          backgroundColor: "var(--school-primary)",
        }}
      >
        {icon}
      </div>

      <h3
        className="mt-6 text-lg font-bold"
        style={{
          color: "var(--school-text)",
        }}
      >
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

      <div
        className="mt-6 inline-flex items-center gap-2 text-xs font-bold"
        style={{
          color: "var(--school-primary)",
        }}
      >
        Masuk ke Portal

        <ArrowRight
          size={14}
          className="transition-transform group-hover:translate-x-1"
        />
      </div>
    </Link>
  );
}

/* =========================================================
   ARTICLE CARD
========================================================= */

function ArticleCard({ article, tenant }) {
  const articleSlug =
    article?.slug || article?.id || "";

  const articleUrl = `/${tenant}/articles/${articleSlug}`;

  return (
    <Link
      href={articleUrl}
      className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl"
      style={{
        borderColor: "var(--school-border)",
        backgroundColor: "var(--school-surface)",
      }}
    >
      {/* IMAGE */}

      <div className="aspect-[16/9] overflow-hidden bg-slate-100">
        {article?.gambarUtama ? (
          <img
            src={article.gambarUtama}
            alt={article.judul || "Artikel"}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in srgb, var(--school-primary) 10%, white), var(--school-background))",
              color:
                "color-mix(in srgb, var(--school-primary) 35%, white)",
            }}
          >
            <Newspaper size={46} />
          </div>
        )}
      </div>

      {/* CONTENT */}

      <div className="p-6">
        <div className="flex flex-wrap items-center gap-2">
          {article?.kategoriArtikel?.nama && (
            <span
              className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--school-primary) 10%, white)",
                color: "var(--school-primary)",
              }}
            >
              {article.kategoriArtikel.nama}
            </span>
          )}

          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
            <CalendarDays size={12} />

            {formatDate(article?.dibuatPada)}
          </span>
        </div>

        <h3
          className="mt-4 line-clamp-2 text-lg font-bold leading-7 transition"
          style={{
            color: "var(--school-text)",
          }}
        >
          {article?.judul || "Artikel sekolah"}
        </h3>

        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
          {article?.ringkasan ||
            "Baca informasi lengkap mengenai artikel ini."}
        </p>

        <div
          className="mt-5 inline-flex items-center gap-2 text-xs font-bold"
          style={{
            color: "var(--school-primary)",
          }}
        >
          Baca Selengkapnya

          <ArrowRight size={14} />
        </div>
      </div>
    </Link>
  );
}

/* =========================================================
   FEATURE ITEM
========================================================= */

function FeatureItem({ icon, text }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-7 w-7 items-center justify-center rounded-lg"
        style={{
          backgroundColor: "rgba(255,255,255,0.10)",
          color:
            "color-mix(in srgb, var(--school-accent) 70%, white)",
        }}
      >
        {icon}
      </div>

      <span className="text-sm text-blue-100">
        {text}
      </span>
    </div>
  );
}

/* =========================================================
   FOOTER LINK
========================================================= */

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

/* =========================================================
   ARTICLE SKELETON
========================================================= */

function ArticleSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-2xl border bg-white"
      style={{
        borderColor: "var(--school-border)",
      }}
    >
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

/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(date) {
  if (!date) {
    return "-";
  }

  try {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(parsedDate);
  } catch {
    return "-";
  }
}