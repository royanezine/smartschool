"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  School,
  BookOpen,
  GraduationCap,
  BriefcaseBusiness,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

const levels = [
  {
    id: "sd",
    title: "Sekolah Dasar (SD)",
    icon: School,
    description:
      "Mendukung pengelolaan administrasi, absensi, nilai, dan komunikasi sekolah dasar.",
    summary:
      "Smart School membantu Sekolah Dasar menyederhanakan pengelolaan administrasi kelas harian, pencatatan kehadiran siswa, pengolahan nilai rapor, hingga penyampaian informasi resmi sekolah secara terpusat dan mudah digunakan oleh guru kelas.",
    highlights: [
      {
        title: "Administrasi Kelas & Data Siswa Terpusat",
        detail:
          "Pengelolaan data induk siswa, pembagian rombongan belajar, serta penugasan wali kelas dalam satu dasbor yang rapi.",
      },
      {
        title: "Rekap Absensi Harian & Perizinan Siswa",
        detail:
          "Pencatatan kehadiran harian serta pengajuan izin atau sakit siswa yang langsung terekap otomatis untuk wali kelas.",
      },
      {
        title: "Input Nilai, Sikap & E-Rapor Terstruktur",
        detail:
          "Pengolahan nilai harian, penilaian sikap spiritual dan sosial, hingga penyusunan rapor semester sesuai KKM sekolah.",
      },
      {
        title: "Pengumuman & Komunikasi Sekolah",
        detail:
          "Penyampaian agenda kegiatan, berita sekolah, dan pengumuman resmi kepada warga sekolah secara cepat dan terjadwal.",
      },
    ],
  },
  {
    id: "smp",
    title: "Sekolah Menengah Pertama (SMP)",
    icon: BookOpen,
    description:
      "Membantu proses pembelajaran, jadwal, penilaian, hingga monitoring akademik siswa.",
    summary:
      "Dirancang untuk mendukung dinamika pembelajaran SMP dengan banyak guru mata pelajaran, mulai dari penyusunan jadwal mengajar, evaluasi berbasis LMS dan CBT, hingga pemantauan perkembangan akademik serta kedisiplinan siswa.",
    highlights: [
      {
        title: "Manajemen Jadwal Pelajaran & Guru Mapel",
        detail:
          "Penyusunan jadwal mengajar lintas kelas dan mata pelajaran yang terkoordinasi serta mudah diakses oleh guru dan siswa.",
      },
      {
        title: "Penilaian Berjenjang, LMS & CBT",
        detail:
          "Distribusi materi modul ajar, penugasan kelas, serta pelaksanaan ujian berbasis komputer dengan koreksi otomatis.",
      },
      {
        title: "Pemantauan Akademik & E-Rapor",
        detail:
          "Agregasi bobot nilai komponen, pemantauan ketuntasan belajar per mata pelajaran, dan finalisasi rapor digital.",
      },
      {
        title: "Pendampingan BK & Catatan Perilaku",
        detail:
          "Pencatatan sesi konseling, poin pelanggaran maupun prestasi, serta pemantauan perkembangan karakter siswa.",
      },
    ],
  },
  {
    id: "sma",
    title: "Sekolah Menengah Atas (SMA)",
    icon: GraduationCap,
    description:
      "Kelola seluruh aktivitas akademik dan administrasi sekolah dengan sistem yang terintegrasi.",
    summary:
      "Mengintegrasikan seluruh kegiatan akademik, pengelompokan jurusan, evaluasi pembelajaran, layanan kesiswaan, serta tata kelola administrasi Sekolah Menengah Atas dalam satu platform digital yang transparan dan akurat.",
    highlights: [
      {
        title: "Pengelolaan Akademik & Peminatan Jurusan",
        detail:
          "Pengaturan struktur kelas berdasarkan tingkat dan jurusan beserta pemetaan mata pelajaran, KKM, dan beban mengajar guru.",
      },
      {
        title: "Asesmen CBT, Rekap Nilai & E-Rapor",
        detail:
          "Pelaksanaan ujian digital dengan bank soal, pengaturan bobot komponen nilai fleksibel, dan penerbitan rapor resmi.",
      },
      {
        title: "Administrasi Keuangan, SPP & Sarpras",
        detail:
          "Pengelolaan tagihan SPP, pemantauan tunggakan, jurnal kas, penggajian, hingga inventarisasi sarana prasarana sekolah.",
      },
      {
        title: "SPMB Online, Presensi Shift & Layanan BK",
        detail:
          "Penerimaan peserta didik baru secara daring, monitoring presensi guru dan siswa, serta layanan bimbingan konseling.",
      },
    ],
  },
  {
    id: "smk",
    title: "Sekolah Menengah Kejuruan (SMK)",
    icon: BriefcaseBusiness,
    description:
      "Mendukung pengelolaan kompetensi keahlian, praktik industri, dan administrasi sekolah.",
    summary:
      "Mendukung tata kelola Sekolah Menengah Kejuruan yang membutuhkan pengaturan program kompetensi keahlian, pemantauan agenda praktik dan pembelajaran produktif, serta administrasi operasional sekolah yang terintegrasi.",
    highlights: [
      {
        title: "Manajemen Program & Kompetensi Keahlian",
        detail:
          "Pengelolaan struktur jurusan kejuruan, rombongan belajar per kompetensi, serta pemetaan mata pelajaran produktif.",
      },
      {
        title: "Pemantauan Praktik & Evaluasi Kompetensi",
        detail:
          "Pendistribusian modul ajar praktik, pencatatan kehadiran dan agenda kegiatan praktik, serta rekapitulasi nilai ke E-Rapor.",
      },
      {
        title: "Pengelolaan Ruang Praktik, Bengkel & Aset",
        detail:
          "Inventarisasi ruang laboratorium/bengkel, pencatatan peminjaman peralatan praktik, serta pelaporan kondisi fasilitas.",
      },
      {
        title: "Administrasi Sekolah, Keuangan & SPMB Jurusan",
        detail:
          "Seleksi pendaftaran siswa baru berbasis pilihan jurusan keahlian, pengelolaan SPP, penggajian, dan tata usaha sekolah.",
      },
    ],
  },
];

function EducationDetailPanel({
  level,
  layoutTransition,
  fadeTransition,
  shouldReduceMotion = false,
}) {
  const titleId = useId();

  if (!level) return null;

  const Icon = level.icon;

  return (
    <motion.aside
      layout={!shouldReduceMotion}
      transition={{ layout: layoutTransition }}
      id="education-level-detail-panel"
      role="region"
      aria-labelledby={titleId}
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <span className="absolute inset-y-0 left-0 w-1 bg-blue-600" />

      <motion.div
        key={level.id}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={fadeTransition}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-600 bg-blue-600 text-white sm:h-14 sm:w-14">
            <Icon size={24} strokeWidth={1.75} />
          </div>

          <h3
            id={titleId}
            className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
          >
            {level.title}
          </h3>
        </div>

        <p className="mt-5 text-[15px] leading-7 text-slate-600">
          {level.summary}
        </p>

        <div className="mt-6 border-t border-slate-100 pt-6">
          <ul className="grid gap-3.5 sm:grid-cols-2">
            {level.highlights.map((point) => (
              <li
                key={point.title}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4"
              >
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0 text-blue-600"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {point.title}
                  </p>
                  <p className="mt-1 text-xs leading-6 text-slate-600 sm:text-[13px]">
                    {point.detail}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </motion.aside>
  );
}

export default function EducationLevel() {
  const [selectedId, setSelectedId] = useState(null);
  const [isDesktop, setIsDesktop] = useState(true);

  const shouldReduceMotion = useReducedMotion();
  const savedScrollYRef = useRef(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const updateViewportMode = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    updateViewportMode();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateViewportMode);
    } else if (typeof mediaQuery.addListener === "function") {
      mediaQuery.addListener(updateViewportMode);
    }
    window.addEventListener("resize", updateViewportMode);

    return () => {
      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", updateViewportMode);
      } else if (typeof mediaQuery.removeListener === "function") {
        mediaQuery.removeListener(updateViewportMode);
      }
      window.removeEventListener("resize", updateViewportMode);
    };
  }, []);

  useLayoutEffect(() => {
    if (savedScrollYRef.current !== null) {
      const targetY = savedScrollYRef.current;
      savedScrollYRef.current = null;
      if (Math.abs(window.scrollY - targetY) > 1) {
        window.scrollTo({ top: targetY, behavior: "instant" });
      }
    }
  }, [selectedId]);

  const handleToggleLevel = (id) => {
    savedScrollYRef.current = window.scrollY;
    setSelectedId((prevId) => (prevId === id ? null : id));
  };

  const activeLevel =
    levels.find((item) => item.id === selectedId) || null;
  const isOpenDesktop = isDesktop && Boolean(activeLevel);

  // Durasi ~280 ms ease-in-out untuk perpindahan layout, ~150 ms untuk fade singkat
  const layoutTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: [0.4, 0, 0.2, 1] };

  const fadeTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.15, ease: "easeInOut" };

  const renderDesktopCard = (item) => {
    const Icon = item.icon;
    const isActive = selectedId === item.id;

    return (
      <motion.article
        key={item.id}
        layout={!shouldReduceMotion}
        transition={{ layout: layoutTransition }}
        onClick={() => handleToggleLevel(item.id)}
        className={`group relative cursor-pointer overflow-hidden rounded-2xl border bg-white transition-colors duration-200 ${
          isOpenDesktop ? "px-5 py-4" : "p-8"
        } ${
          isActive
            ? "border-blue-600 shadow-md shadow-slate-900/5"
            : "border-slate-200 hover:border-blue-600/40 hover:bg-slate-50/30 hover:shadow-md hover:shadow-slate-900/5"
        }`}
      >
        <span
          className={`absolute inset-y-0 left-0 w-1 origin-top bg-blue-600 transition-transform duration-200 ${
            isActive
              ? "scale-y-100"
              : isOpenDesktop
                ? "scale-y-0"
                : "scale-y-0 group-hover:scale-y-100"
          }`}
        />

        {isOpenDesktop ? (
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <motion.div
                layout="position"
                transition={{ layout: layoutTransition }}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors duration-200 ${
                  isActive
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 bg-slate-50 text-slate-700 group-hover:border-blue-600/40 group-hover:text-blue-600"
                }`}
              >
                <Icon size={20} strokeWidth={1.8} />
              </motion.div>

              <motion.h3
                layout="position"
                transition={{ layout: layoutTransition }}
                className={`text-base font-semibold tracking-tight transition-colors duration-200 ${
                  isActive
                    ? "text-blue-600"
                    : "text-slate-900 group-hover:text-blue-600"
                }`}
              >
                {item.title}
              </motion.h3>
            </div>

            <button
              type="button"
              aria-expanded={isActive}
              aria-controls="education-level-detail-panel"
              aria-label={item.title}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleLevel(item.id);
              }}
              className="inline-flex items-center justify-center rounded-lg p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <ChevronRight
                size={18}
                className={`shrink-0 transition-transform duration-200 ${
                  isActive
                    ? "translate-x-0.5 text-blue-600"
                    : "text-slate-400 group-hover:translate-x-0.5 group-hover:text-blue-600"
                }`}
              />
            </button>
          </div>
        ) : (
          <div className="flex items-start gap-6">
            <motion.div
              layout="position"
              transition={{ layout: layoutTransition }}
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border transition-colors duration-200 ${
                isActive
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-700 group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white"
              }`}
            >
              <Icon size={26} strokeWidth={1.75} />
            </motion.div>

            <div className="flex-1">
              <motion.h3
                layout="position"
                transition={{ layout: layoutTransition }}
                className="text-xl font-semibold tracking-tight text-slate-900"
              >
                {item.title}
              </motion.h3>

              <p className="mt-3 text-[15px] leading-7 text-slate-600">
                {item.description}
              </p>

              <button
                type="button"
                aria-expanded={isActive}
                aria-controls="education-level-detail-panel"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleLevel(item.id);
                }}
                className="mt-6 inline-flex items-center gap-2 border-b border-transparent pb-0.5 text-sm font-semibold text-slate-900 transition-all duration-200 hover:border-blue-600 hover:text-blue-600 focus:outline-none focus-visible:border-blue-600 focus-visible:text-blue-600 group-hover:gap-3"
              >
                Pelajari Selengkapnya
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </motion.article>
    );
  };

  const renderMobileCard = (item) => {
    const Icon = item.icon;
    const isActive = selectedId === item.id;

    return (
      <article
        onClick={() => handleToggleLevel(item.id)}
        className={`group relative cursor-pointer overflow-hidden rounded-2xl border bg-white p-6 transition-colors duration-200 sm:p-8 ${
          isActive
            ? "border-blue-600 shadow-md shadow-slate-900/5"
            : "border-slate-200 hover:border-blue-600/40"
        }`}
      >
        <span
          className={`absolute inset-y-0 left-0 w-1 origin-top bg-blue-600 transition-transform duration-200 ${
            isActive ? "scale-y-100" : "scale-y-0"
          }`}
        />

        <div className="flex items-start gap-5">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-colors duration-200 sm:h-14 sm:w-14 ${
              isActive
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-slate-200 bg-slate-50 text-slate-700"
            }`}
          >
            <Icon size={24} strokeWidth={1.75} />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
              {item.title}
            </h3>

            <p className="mt-2.5 text-sm leading-6 text-slate-600 sm:text-[15px] sm:leading-7">
              {item.description}
            </p>

            <button
              type="button"
              aria-expanded={isActive}
              aria-controls="education-level-detail-panel"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleLevel(item.id);
              }}
              className={`mt-5 inline-flex items-center gap-2 border-b pb-0.5 text-sm font-semibold transition-all duration-200 focus:outline-none ${
                isActive
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-900 hover:border-blue-600 hover:text-blue-600"
              }`}
            >
              Pelajari Selengkapnya
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </article>
    );
  };

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
            <span className="h-px w-8 bg-blue-600" />
            Jenjang Pendidikan
            <span className="h-px w-8 bg-blue-600" />
          </p>

          <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Solusi untuk Semua{" "}
            <span className="text-blue-600">Jenjang Pendidikan</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600">
            Smart School dirancang untuk memenuhi kebutuhan setiap jenjang
            pendidikan, mulai dari Sekolah Dasar hingga Sekolah Menengah
            Kejuruan.
          </p>
        </div>

        {isDesktop ? (
          <LayoutGroup id="education-level-desktop">
            <div
              className={`mt-16 grid items-start gap-6 ${
                isOpenDesktop
                  ? "lg:grid-cols-[35%_minmax(0,1fr)] lg:gap-8"
                  : "lg:grid-cols-1"
              }`}
            >
              <motion.div
                layout={!shouldReduceMotion}
                transition={{ layout: layoutTransition }}
                role={isOpenDesktop ? "tablist" : undefined}
                aria-label={
                  isOpenDesktop ? "Pilihan Jenjang Pendidikan" : undefined
                }
                className={
                  isOpenDesktop
                    ? "grid grid-cols-1 gap-3.5"
                    : "grid grid-cols-1 gap-6 lg:grid-cols-2"
                }
              >
                {levels.map((item) => renderDesktopCard(item))}
              </motion.div>

              <AnimatePresence initial={false} mode="popLayout">
                {activeLevel && (
                  <motion.div
                    key="desktop-detail-panel-wrapper"
                    initial={
                      shouldReduceMotion
                        ? { opacity: 1, x: 0 }
                        : { opacity: 0, x: 8 }
                    }
                    animate={{ opacity: 1, x: 0 }}
                    exit={
                      shouldReduceMotion
                        ? { opacity: 0, x: 0 }
                        : { opacity: 0, x: 8 }
                    }
                    transition={{
                      opacity: fadeTransition,
                      x: layoutTransition,
                    }}
                    className="w-full"
                  >
                    <EducationDetailPanel
                      level={activeLevel}
                      layoutTransition={layoutTransition}
                      fadeTransition={fadeTransition}
                      shouldReduceMotion={Boolean(shouldReduceMotion)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </LayoutGroup>
        ) : (
          <div className="mt-12 flex flex-col gap-4">
            {levels.map((item) => {
              const isActive = selectedId === item.id;
              return (
                <div key={item.id} className="flex flex-col">
                  {renderMobileCard(item)}
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        key={`mobile-detail-${item.id}`}
                        initial={
                          shouldReduceMotion
                            ? { height: "auto", opacity: 1 }
                            : { height: 0, opacity: 0 }
                        }
                        animate={{ height: "auto", opacity: 1 }}
                        exit={
                          shouldReduceMotion
                            ? { height: 0, opacity: 0 }
                            : { height: 0, opacity: 0 }
                        }
                        transition={{
                          height: layoutTransition,
                          opacity: fadeTransition,
                        }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4">
                          <EducationDetailPanel
                            level={item}
                            layoutTransition={layoutTransition}
                            fadeTransition={fadeTransition}
                            shouldReduceMotion={Boolean(shouldReduceMotion)}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}