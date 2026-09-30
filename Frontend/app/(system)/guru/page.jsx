"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

import {
  LayoutDashboard,
  CalendarDays,
  NotebookPen,
  ClipboardCheck,
  BookOpen,
  ClipboardList,
  HelpCircle,
  ChevronRight,
  Users,
  Clock3,
  TrendingUp,
  TrendingDown,
  Minus,
  Bell,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  GraduationCap,
  FileCheck2,
  BookMarked,
  CalendarCheck2,
  MoreHorizontal,
} from "lucide-react";

// =====================================================
// THEME HELPERS
// =====================================================

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themePrimaryHover =
  "hover:text-[var(--color-primary)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

// =====================================================
// DUMMY DATA
// =====================================================

const kpiData = [
  {
    id: "kelas",
    label: "Kelas Diampu",
    value: "4",
    sub: "Kelas aktif",
    icon: GraduationCap,
  },
  {
    id: "siswa",
    label: "Siswa Diampu",
    value: "138",
    sub: "Total siswa",
    icon: Users,
  },
  {
    id: "tugas",
    label: "Tugas Belum Dinilai",
    value: "12",
    sub: "Perlu ditinjau",
    icon: ClipboardList,
  },
  {
    id: "kehadiran",
    label: "Rata-rata Kehadiran",
    value: "96.0%",
    sub: "+1.8% bulan ini",
    icon: CalendarCheck2,
  },
];

const quickMenu = [
  {
    id: "jadwal",
    title: "Jadwal Mengajar",
    desc: "Lihat jadwal mengajar dan agenda hari ini",
    stat: "3 sesi hari ini",
    icon: CalendarDays,
    path: "/guru/jadwal",
  },
  {
    id: "nilai",
    title: "Kelola Nilai",
    desc: "Input dan rekap nilai siswa",
    stat: "12 belum dinilai",
    icon: NotebookPen,
    path: "/guru/nilai",
  },
  {
    id: "absensi",
    title: "Absensi",
    desc: "Kelola kehadiran siswa per kelas",
    stat: "4 kelas aktif",
    icon: ClipboardCheck,
    path: "/guru/absensi",
  },
  {
    id: "materi",
    title: "Materi Pembelajaran",
    desc: "Kelola bahan ajar dan materi kelas",
    stat: "18 materi",
    icon: BookOpen,
    path: "/guru/materi",
  },
  {
    id: "tugas",
    title: "Tugas Siswa",
    desc: "Buat dan pantau pengumpulan tugas",
    stat: "5 tugas aktif",
    icon: ClipboardList,
    path: "/guru/tugas",
  },
  {
    id: "quiz",
    title: "Quiz & CBT",
    desc: "Kelola soal dan sesi evaluasi",
    stat: "2 quiz aktif",
    icon: HelpCircle,
    path: "/guru/quiz",
  },
];

const scheduleData = [
  {
    id: 1,
    time: "07:00 - 08:30",
    subject: "Matematika",
    className: "Kelas 9A",
    room: "Ruang 09",
    status: "Selesai",
  },
  {
    id: 2,
    time: "09:00 - 10:30",
    subject: "Matematika",
    className: "Kelas 9B",
    room: "Ruang 10",
    status: "Berlangsung",
  },
  {
    id: 3,
    time: "11:00 - 12:30",
    subject: "Matematika",
    className: "Kelas 8A",
    room: "Ruang 08",
    status: "Berikutnya",
  },
];

const classAttendance = [
  {
    id: 1,
    className: "Kelas 9A",
    students: 34,
    present: 33,
    percentage: 98,
    trend: "up",
  },
  {
    id: 2,
    className: "Kelas 9B",
    students: 33,
    present: 31,
    percentage: 95,
    trend: "down",
  },
  {
    id: 3,
    className: "Kelas 8A",
    students: 36,
    present: 35,
    percentage: 97,
    trend: "up",
  },
  {
    id: 4,
    className: "Kelas 8B",
    students: 35,
    present: 33,
    percentage: 94,
    trend: "same",
  },
];

const activityData = [
  {
    id: 1,
    title: "Nilai tugas diperbarui",
    desc: "Tugas Matematika Kelas 9A",
    time: "10 menit lalu",
    icon: FileCheck2,
    type: "blue",
  },
  {
    id: 2,
    title: "Materi baru ditambahkan",
    desc: "Persamaan Kuadrat · Kelas 9B",
    time: "1 jam lalu",
    icon: BookMarked,
    type: "green",
  },
  {
    id: 3,
    title: "Presensi berhasil disimpan",
    desc: "Kelas 8A · 35 siswa hadir",
    time: "2 jam lalu",
    icon: CheckCircle2,
    type: "slate",
  },
];

const notificationData = [
  {
    id: 1,
    title: "Rapat Wali Kelas",
    desc: "Rapat wali kelas dijadwalkan pukul 14:00",
    time: "2 jam lalu",
    unread: true,
  },
  {
    id: 2,
    title: "Batas Input Nilai Rapor",
    desc: "Penginputan nilai ditutup dalam 3 hari",
    time: "5 jam lalu",
    unread: true,
  },
  {
    id: 3,
    title: "Jadwal Mengajar Diperbarui",
    desc: "Terdapat perubahan jadwal hari Jumat",
    time: "Kemarin",
    unread: false,
  },
];

// =====================================================
// HELPERS
// =====================================================

function TrendIcon({ trend }) {
  if (trend === "up") {
    return (
      <TrendingUp
        size={14}
        className="shrink-0 text-[var(--color-success)]"
      />
    );
  }

  if (trend === "down") {
    return (
      <TrendingDown
        size={14}
        className="shrink-0 theme-danger"
      />
    );
  }

  return (
    <Minus
      size={14}
      className="shrink-0 theme-text-muted"
    />
  );
}

function QuickIcon({ Icon }) {
  return (
    <div
      className={`
        flex h-10 w-10 shrink-0 items-center justify-center
        rounded-xl
        ${themePrimarySoft}
        ${themePrimaryText}
        transition
        group-hover:${themePrimaryText}
        group-hover:bg-[var(--color-primary)]
        group-hover:text-[var(--color-card)]
      `}
    >
      <Icon size={19} strokeWidth={1.8} />
    </div>
  );
}

function ActivityIcon({ Icon, type }) {
  const styles = {
    blue: `${themePrimarySoft} ${themePrimaryText}`,
    green: `${themeSuccessSurface} text-[var(--color-success)]`,
    slate: `${themeNeutralSurface} theme-text-secondary`,
  };

  return (
    <div
      className={`
        flex h-9 w-9 shrink-0 items-center justify-center
        rounded-lg
        ${styles[type] || styles.slate}
      `}
    >
      <Icon size={16} />
    </div>
  );
}

function getScheduleStatusClass(status) {
  if (status === "Berlangsung") {
    return `${themeInfoSurface} border ${themeInfoBorder} text-[var(--color-info)]`;
  }

  if (status === "Selesai") {
    return `${themeNeutralSurface} border ${themeNeutralBorder} theme-text-muted`;
  }

  return `${themeWarningSurface} border ${themeWarningBorder} text-[var(--color-warning)]`;
}

// =====================================================
// MAIN
// =====================================================

export default function GuruDashboardPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const notifications = useMemo(
    () =>
      notificationData.map((item) => ({
        id: item.id,
        title: item.title,
        desc: item.time,
        read: !item.unread,
      })),
    []
  );

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <Sidebar
        active="dashboard"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() =>
          setSidebarOpen((prev) => !prev)
        }
      />

      {/* =================================================
          CONTENT WRAPPER
      ================================================= */}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="shrink-0">
          <Header
            toggleSidebar={() =>
              setSidebarOpen((prev) => !prev)
            }
            notifications={notifications}
            user={{
              name: "Bu Sari",
              email: "guru@smartschool.com",
              avatar: "AS",
            }}
          />
        </div>

        {/* =================================================
            MAIN
        ================================================= */}

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">

          <div className="mx-auto w-full max-w-[1600px] p-3 sm:p-4 md:p-5 lg:p-6 xl:p-7">

            <div className="space-y-5 lg:space-y-6">

              {/* =================================================
                  WELCOME HEADER
              ================================================= */}

              <section
                className={`
                  relative overflow-hidden rounded-2xl
                  border ${themeNeutralBorder}
                  theme-card
                  ${themeCardShadow}
                `}
              >

                {/* THEME DECORATION */}

                <div
                  className={`
                    pointer-events-none absolute
                    -right-16 -top-20
                    h-48 w-48 rounded-full
                    ${themePrimarySoft}
                  `}
                />

                <div
                  className={`
                    pointer-events-none absolute
                    -bottom-20 right-28
                    h-36 w-36 rounded-full
                    ${themeNeutralSurface}
                  `}
                />

                <div className="relative flex min-w-0 flex-col justify-between gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:p-7">

                  <div className="min-w-0">

                    <div className="flex items-start gap-3">

                      <div
                        className={`
                          flex h-11 w-11 shrink-0
                          items-center justify-center
                          rounded-xl
                          ${themePrimaryGradient}
                          text-[var(--color-card)]
                          ${themePrimaryShadow}
                        `}
                      >
                        <LayoutDashboard
                          size={20}
                          strokeWidth={1.8}
                        />
                      </div>

                      <div className="min-w-0">

                        <p
                          className={`text-xs font-medium ${themePrimaryText}`}
                        >
                          Dashboard Guru
                        </p>

                        <h1 className="mt-1 truncate text-xl font-bold tracking-tight theme-text sm:text-2xl lg:text-[26px]">
                          Selamat pagi, Bu Sari
                        </h1>

                        <p className="mt-2 max-w-2xl text-xs leading-relaxed theme-text-secondary sm:text-sm">
                          Pantau aktivitas mengajar, kehadiran,
                          tugas, dan perkembangan siswa dalam
                          satu tempat.
                        </p>

                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">

                    <div
                      className={`
                        rounded-xl
                        border ${themeNeutralBorder}
                        ${themeNeutralSurface}
                        px-4 py-3
                      `}
                    >

                      <div className="flex items-center gap-2">

                        <CalendarDays
                          size={15}
                          className={themePrimaryText}
                        />

                        <span className="text-xs font-semibold theme-text">
                          Senin, 17 Agustus 2026
                        </span>

                      </div>

                      <p className="mt-1 pl-5 text-[10px] theme-text-muted">
                        Wali Kelas 9A
                      </p>

                    </div>
                  </div>
                </div>
              </section>

              {/* =================================================
                  KPI
              ================================================= */}

              <section
                className={`
                  grid grid-cols-2 overflow-hidden
                  rounded-2xl
                  border ${themeNeutralBorder}
                  theme-card
                  ${themeCardShadow}
                  lg:grid-cols-4
                `}
              >

                {kpiData.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.id}
                      className={`
                        min-w-0 p-4 sm:p-5
                        ${
                          index < 3
                            ? "border-b lg:border-b-0 lg:border-r"
                            : ""
                        }
                        ${themeDivider}
                        ${
                          index === 1
                            ? "sm:border-r"
                            : ""
                        }
                      `}
                    >

                      <div className="flex min-w-0 items-center gap-3">

                        <div
                          className={`
                            flex h-10 w-10 shrink-0
                            items-center justify-center
                            rounded-xl
                            ${themePrimarySoft}
                            ${themePrimaryText}
                          `}
                        >
                          <Icon size={18} />
                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-[10px] font-medium theme-text-muted sm:text-xs">
                            {item.label}
                          </p>

                          <div className="mt-0.5 flex items-end gap-2">

                            <span className="text-lg font-bold leading-none theme-text sm:text-xl">
                              {item.value}
                            </span>

                          </div>

                          <p className="mt-1 truncate text-[9px] theme-text-muted sm:text-[10px]">
                            {item.sub}
                          </p>

                        </div>
                      </div>
                    </div>
                  );
                })}
              </section>

              {/* =================================================
                  QUICK ACCESS
              ================================================= */}

              <section>

                <div className="mb-3 flex items-center justify-between">

                  <div>

                    <h2 className="text-sm font-bold theme-text sm:text-base">
                      Akses Cepat
                    </h2>

                    <p className="mt-0.5 text-[10px] theme-text-muted sm:text-xs">
                      Kelola aktivitas pembelajaran
                    </p>

                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">

                  {quickMenu.map((item) => {
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          router.push(item.path)
                        }
                        className={`
                          group relative flex min-w-0
                          items-center gap-4
                          overflow-hidden rounded-xl
                          border ${themeNeutralBorder}
                          theme-card
                          p-4 text-left
                          ${themeCardShadow}
                          transition duration-200
                          hover:-translate-y-0.5
                          hover:border-[color-mix(in_srgb,var(--color-primary)_28%,var(--color-text)_10%,transparent)]
                          ${themeNeutralHover}
                        `}
                      >

                        <QuickIcon Icon={Icon} />

                        <div className="min-w-0 flex-1">

                          <div className="flex min-w-0 items-center justify-between gap-2">

                            <h3 className="truncate text-sm font-semibold theme-text">
                              {item.title}
                            </h3>

                            <ChevronRight
                              size={15}
                              className={`
                                shrink-0
                                theme-text-muted
                                transition
                                group-hover:translate-x-0.5
                                group-hover:text-[var(--color-primary)]
                              `}
                            />

                          </div>

                          <p className="mt-1 line-clamp-1 text-[10px] leading-relaxed theme-text-secondary sm:text-xs">
                            {item.desc}
                          </p>

                          <span
                            className={`
                              mt-2 inline-flex max-w-full
                              rounded-md
                              ${themeNeutralSurface}
                              px-2 py-1
                              text-[9px] font-medium
                              theme-text-secondary
                            `}
                          >
                            {item.stat}
                          </span>

                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* =================================================
                  MAIN INFORMATION
              ================================================= */}

              <section className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-3">

                {/* =================================================
                    JADWAL HARI INI
                ================================================= */}

                <div
                  className={`
                    min-w-0 overflow-hidden
                    rounded-2xl
                    border ${themeNeutralBorder}
                    theme-card
                    ${themeCardShadow}
                    xl:col-span-2
                  `}
                >

                  <div
                    className={`
                      flex items-center justify-between
                      border-b ${themeDivider}
                      p-4 sm:p-5
                    `}
                  >

                    <div className="flex min-w-0 items-center gap-3">

                      <div
                        className={`
                          flex h-9 w-9 shrink-0
                          items-center justify-center
                          rounded-lg
                          ${themePrimarySoft}
                          ${themePrimaryText}
                        `}
                      >
                        <Clock3 size={17} />
                      </div>

                      <div className="min-w-0">

                        <h2 className="text-sm font-bold theme-text">
                          Jadwal Hari Ini
                        </h2>

                        <p className="mt-0.5 text-[10px] theme-text-muted">
                          Senin, 17 Agustus 2026
                        </p>

                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        router.push("/guru/jadwal")
                      }
                      className={`
                        flex shrink-0 items-center gap-1
                        text-[10px] font-semibold
                        ${themePrimaryText}
                        ${themePrimaryHover}
                        sm:text-xs
                      `}
                    >
                      Lihat jadwal
                      <ChevronRight size={13} />
                    </button>
                  </div>

                  <div className={`divide-y ${themeDivider}`}>

                    {scheduleData.map((item) => {
                      const isActive =
                        item.status === "Berlangsung";

                      return (
                        <div
                          key={item.id}
                          className={`
                            flex min-w-0 items-center gap-3
                            p-4 sm:p-5
                            ${
                              isActive
                                ? themeInfoSurface
                                : ""
                            }
                          `}
                        >

                          {/* TIME */}

                          <div className="w-[82px] shrink-0 sm:w-[100px]">

                            <p className="text-xs font-bold theme-text sm:text-sm">
                              {item.time.split(" - ")[0]}
                            </p>

                            <p className="mt-0.5 text-[9px] theme-text-muted sm:text-[10px]">
                              {item.time.split(" - ")[1]}
                            </p>

                          </div>

                          {/* LINE */}

                          <div className="relative flex h-12 shrink-0 items-center">

                            <div
                              className={`
                                h-2.5 w-2.5
                                rounded-full
                                border-2
                                border-[var(--color-primary)]
                                theme-card
                              `}
                            />

                            {item.id !== scheduleData.length && (
                              <div
                                className={`
                                  absolute left-1/2 top-7
                                  h-8 w-px
                                  -translate-x-1/2
                                  bg-[color-mix(in_srgb,var(--color-text)_12%,transparent)]
                                `}
                              />
                            )}

                          </div>

                          {/* CONTENT */}

                          <div className="min-w-0 flex-1">

                            <p className="truncate text-xs font-semibold theme-text sm:text-sm">
                              {item.subject}
                            </p>

                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">

                              <span className="inline-flex items-center gap-1 text-[9px] theme-text-muted sm:text-[10px]">
                                <Users size={11} />
                                {item.className}
                              </span>

                              <span className="inline-flex items-center gap-1 text-[9px] theme-text-muted sm:text-[10px]">
                                <BookOpen size={11} />
                                {item.room}
                              </span>

                            </div>
                          </div>

                          {/* STATUS */}

                          <span
                            className={`
                              hidden shrink-0
                              rounded-full
                              border
                              px-2.5 py-1
                              text-[9px] font-semibold
                              sm:inline-flex
                              ${getScheduleStatusClass(
                                item.status
                              )}
                            `}
                          >
                            {item.status}
                          </span>

                        </div>
                      );
                    })}

                  </div>
                </div>

                {/* =================================================
                    AKTIVITAS TERBARU
                ================================================= */}

                <div
                  className={`
                    min-w-0 overflow-hidden
                    rounded-2xl
                    border ${themeNeutralBorder}
                    theme-card
                    ${themeCardShadow}
                  `}
                >

                  <div
                    className={`
                      flex items-center justify-between
                      border-b ${themeDivider}
                      p-4 sm:p-5
                    `}
                  >

                    <div className="flex items-center gap-3">

                      <div
                        className={`
                          flex h-9 w-9
                          items-center justify-center
                          rounded-lg
                          ${themePrimarySoft}
                          ${themePrimaryText}
                        `}
                      >
                        <MoreHorizontal size={17} />
                      </div>

                      <div>

                        <h2 className="text-sm font-bold theme-text">
                          Aktivitas Terbaru
                        </h2>

                        <p className="mt-0.5 text-[10px] theme-text-muted">
                          Aktivitas pembelajaran
                        </p>

                      </div>
                    </div>
                  </div>

                  <div className={`divide-y ${themeDivider}`}>

                    {activityData.map((item) => {
                      const Icon = item.icon;

                      return (
                        <div
                          key={item.id}
                          className={`
                            flex gap-3 p-4
                            transition
                            ${themeNeutralHover}
                            sm:p-5
                          `}
                        >

                          <ActivityIcon
                            Icon={Icon}
                            type={item.type}
                          />

                          <div className="min-w-0 flex-1">

                            <p className="truncate text-xs font-semibold theme-text">
                              {item.title}
                            </p>

                            <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed theme-text-secondary">
                              {item.desc}
                            </p>

                            <p className="mt-1.5 text-[9px] theme-text-muted">
                              {item.time}
                            </p>

                          </div>
                        </div>
                      );
                    })}

                  </div>
                </div>
              </section>

              {/* =================================================
                  BOTTOM
              ================================================= */}

              <section className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-3">

                {/* =================================================
                    KEHADIRAN
                ================================================= */}

                <div
                  className={`
                    min-w-0 overflow-hidden
                    rounded-2xl
                    border ${themeNeutralBorder}
                    theme-card
                    ${themeCardShadow}
                    lg:col-span-2
                  `}
                >

                  <div
                    className={`
                      flex items-center justify-between
                      border-b ${themeDivider}
                      p-4 sm:p-5
                    `}
                  >

                    <div className="flex min-w-0 items-center gap-3">

                      <div
                        className={`
                          flex h-9 w-9 shrink-0
                          items-center justify-center
                          rounded-lg
                          ${themePrimarySoft}
                          ${themePrimaryText}
                        `}
                      >
                        <CalendarCheck2 size={17} />
                      </div>

                      <div className="min-w-0">

                        <h2 className="truncate text-sm font-bold theme-text">
                          Kehadiran per Kelas
                        </h2>

                        <p className="mt-0.5 text-[10px] theme-text-muted">
                          Rekap kehadiran siswa
                        </p>

                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        router.push("/guru/absensi")
                      }
                      className={`
                        flex shrink-0 items-center gap-1
                        text-[10px] font-semibold
                        ${themePrimaryText}
                        ${themePrimaryHover}
                        sm:text-xs
                      `}
                    >
                      Lihat semua
                      <ChevronRight size={13} />
                    </button>
                  </div>

                  <div className="p-4 sm:p-5">

                    <div className="space-y-5">

                      {classAttendance.map((kelas) => (
                        <div
                          key={kelas.id}
                          className="min-w-0"
                        >

                          <div className="mb-2 flex items-center justify-between gap-3">

                            <div className="flex min-w-0 items-center gap-2">

                              <span className="truncate text-xs font-semibold theme-text-secondary sm:text-sm">
                                {kelas.className}
                              </span>

                              <span className="shrink-0 text-[9px] theme-text-muted">
                                {kelas.present}/
                                {kelas.students} hadir
                              </span>

                            </div>

                            <div className="flex shrink-0 items-center gap-1.5">

                              <span className="text-xs font-semibold theme-text-secondary">
                                {kelas.percentage}%
                              </span>

                              <TrendIcon
                                trend={kelas.trend}
                              />

                            </div>
                          </div>

                          <div
                            className={`
                              h-2 overflow-hidden
                              rounded-full
                              ${themeNeutralSurface}
                            `}
                          >
                            <div
                              className="
                                h-full rounded-full
                                bg-[var(--color-primary)]
                                transition-all duration-500
                              "
                              style={{
                                width: `${kelas.percentage}%`,
                              }}
                            />
                          </div>

                        </div>
                      ))}

                    </div>

                    <div
                      className={`
                        mt-5 grid grid-cols-2 gap-3
                        border-t ${themeDivider}
                        pt-5 sm:grid-cols-3
                      `}
                    >

                      <div>

                        <p className="text-[9px] theme-text-muted">
                          Rata-rata
                        </p>

                        <p className="mt-1 text-sm font-bold theme-text">
                          96.0%
                        </p>

                      </div>

                      <div>

                        <p className="text-[9px] theme-text-muted">
                          Hadir Hari Ini
                        </p>

                        <p className="mt-1 text-sm font-bold theme-text">
                          132 siswa
                        </p>

                      </div>

                      <div className="col-span-2 sm:col-span-1">

                        <p className="text-[9px] theme-text-muted">
                          Tidak Hadir
                        </p>

                        <p className="mt-1 text-sm font-bold theme-text">
                          6 siswa
                        </p>

                      </div>

                    </div>
                  </div>
                </div>

                {/* =================================================
                    NOTIFICATION
                ================================================= */}

                <div
                  className={`
                    min-w-0 overflow-hidden
                    rounded-2xl
                    border ${themeNeutralBorder}
                    theme-card
                    ${themeCardShadow}
                  `}
                >

                  <div
                    className={`
                      flex items-center justify-between
                      border-b ${themeDivider}
                      p-4 sm:p-5
                    `}
                  >

                    <div className="flex items-center gap-3">

                      <div
                        className={`
                          relative flex h-9 w-9
                          items-center justify-center
                          rounded-lg
                          ${themePrimarySoft}
                          ${themePrimaryText}
                        `}
                      >

                        <Bell size={17} />

                        <span
                          className="
                            absolute right-1.5 top-1.5
                            h-1.5 w-1.5 rounded-full
                            bg-[var(--color-warning)]
                          "
                        />

                      </div>

                      <div>

                        <h2 className="text-sm font-bold theme-text">
                          Notifikasi
                        </h2>

                        <p className="mt-0.5 text-[10px] theme-text-muted">
                          Informasi terbaru
                        </p>

                      </div>
                    </div>

                    <span
                      className={`
                        rounded-full
                        ${themePrimarySoft}
                        px-2 py-1
                        text-[9px] font-semibold
                        ${themePrimaryText}
                      `}
                    >
                      2 baru
                    </span>

                  </div>

                  <div className={`divide-y ${themeDivider}`}>

                    {notificationData.map((item) => (
                      <div
                        key={item.id}
                        className={`
                          flex gap-3 p-4
                          transition
                          ${themeNeutralHover}
                        `}
                      >

                        <div className="pt-1">

                          <span
                            className={`
                              block h-2 w-2 rounded-full
                              ${
                                item.unread
                                  ? "bg-[var(--color-primary)]"
                                  : "bg-[var(--color-text-muted)]"
                              }
                            `}
                          />

                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex items-start justify-between gap-2">

                            <p className="min-w-0 truncate text-xs font-semibold theme-text-secondary">
                              {item.title}
                            </p>

                            {item.unread && (
                              <span
                                className={`
                                  shrink-0
                                  text-[8px] font-semibold
                                  ${themePrimaryText}
                                `}
                              >
                                BARU
                              </span>
                            )}

                          </div>

                          <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed theme-text-muted">
                            {item.desc}
                          </p>

                          <p className="mt-1.5 text-[9px] theme-text-muted">
                            {item.time}
                          </p>

                        </div>
                      </div>
                    ))}

                  </div>

                  <button
                    type="button"
                    className={`
                      flex w-full items-center
                      justify-center gap-1
                      border-t ${themeDivider}
                      p-3
                      text-[10px] font-semibold
                      ${themePrimaryText}
                      ${themeNeutralHover}
                      sm:text-xs
                    `}
                  >
                    Lihat semua notifikasi
                    <ArrowUpRight size={13} />
                  </button>

                </div>
              </section>

              {/* =================================================
                  REMINDER
              ================================================= */}

              <section
                className={`
                  rounded-2xl
                  border ${themeInfoBorder}
                  ${themeInfoSurface}
                  p-4 sm:p-5
                `}
              >

                <div className="flex min-w-0 items-start gap-3">

                  <div
                    className={`
                      flex h-9 w-9 shrink-0
                      items-center justify-center
                      rounded-lg
                      theme-card
                      border ${themeInfoBorder}
                      text-[var(--color-info)]
                    `}
                  >
                    <AlertCircle size={17} />
                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="text-xs font-bold theme-text">
                      Pengingat
                    </p>

                    <p className="mt-1 text-[10px] leading-relaxed theme-text-secondary sm:text-xs">
                      Masih ada{" "}
                      <span className="font-semibold theme-text">
                        12 tugas
                      </span>{" "}
                      yang belum dinilai. Segera lakukan
                      penilaian agar progres pembelajaran
                      tetap terpantau.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      router.push("/guru/nilai")
                    }
                    className={`
                      hidden shrink-0
                      items-center gap-1
                      rounded-lg
                      theme-card
                      border ${themeNeutralBorder}
                      px-3 py-2
                      text-[10px] font-semibold
                      ${themePrimaryText}
                      ${themePrimaryHover}
                      shadow-sm
                      transition
                      sm:flex
                    `}
                  >
                    Periksa Nilai
                    <ArrowUpRight size={13} />
                  </button>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/guru/nilai")
                  }
                  className={`
                    mt-3 flex w-full
                    items-center justify-center gap-1
                    rounded-lg
                    theme-card
                    border ${themeNeutralBorder}
                    px-3 py-2
                    text-[10px] font-semibold
                    ${themePrimaryText}
                    shadow-sm
                    sm:hidden
                  `}
                >
                  Periksa Nilai
                  <ArrowUpRight size={13} />
                </button>

              </section>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}