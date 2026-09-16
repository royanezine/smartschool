"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

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
        className="shrink-0 text-emerald-500"
      />
    );
  }

  if (trend === "down") {
    return (
      <TrendingDown
        size={14}
        className="shrink-0 text-rose-500"
      />
    );
  }

  return (
    <Minus
      size={14}
      className="shrink-0 text-slate-400"
    />
  );
}

function QuickIcon({ Icon }) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf1ff] text-[#155DFC] transition group-hover:bg-[#155DFC] group-hover:text-white">
      <Icon size={19} strokeWidth={1.8} />
    </div>
  );
}

function ActivityIcon({ Icon, type }) {
  const styles = {
    blue: "bg-[#eaf1ff] text-[#155DFC]",
    green: "bg-emerald-50 text-emerald-600",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
        styles[type] || styles.slate
      }`}
    >
      <Icon size={16} />
    </div>
  );
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
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
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

              <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                {/* subtle decoration */}

                <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[#eaf1ff]" />

                <div className="pointer-events-none absolute -bottom-20 right-28 h-36 w-36 rounded-full bg-slate-50" />

                <div className="relative flex min-w-0 flex-col justify-between gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:p-7">
                  <div className="min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#155DFC] text-white shadow-sm">
                        <LayoutDashboard
                          size={20}
                          strokeWidth={1.8}
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-medium text-[#155DFC]">
                          Dashboard Guru
                        </p>

                        <h1 className="mt-1 truncate text-xl font-bold tracking-tight text-slate-800 sm:text-2xl lg:text-[26px]">
                          Selamat pagi, Bu Sari
                        </h1>

                        <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-500 sm:text-sm">
                          Pantau aktivitas mengajar, kehadiran,
                          tugas, dan perkembangan siswa dalam
                          satu tempat.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <CalendarDays
                          size={15}
                          className="text-[#155DFC]"
                        />

                        <span className="text-xs font-semibold text-slate-700">
                          Senin, 17 Agustus 2026
                        </span>
                      </div>

                      <p className="mt-1 pl-5 text-[10px] text-slate-400">
                        Wali Kelas 9A
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* =================================================
                  KPI
              ================================================= */}

              <section className="grid grid-cols-2 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm lg:grid-cols-4">
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
                        ${
                          index === 0 || index === 2
                            ? "border-slate-100"
                            : ""
                        }
                        ${
                          index === 1
                            ? "border-slate-100 sm:border-r"
                            : ""
                        }
                      `}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf1ff] text-[#155DFC]">
                          <Icon size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-[10px] font-medium text-slate-400 sm:text-xs">
                            {item.label}
                          </p>

                          <div className="mt-0.5 flex items-end gap-2">
                            <span className="text-lg font-bold leading-none text-slate-800 sm:text-xl">
                              {item.value}
                            </span>
                          </div>

                          <p className="mt-1 truncate text-[9px] text-slate-400 sm:text-[10px]">
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
                    <h2 className="text-sm font-bold text-slate-800 sm:text-base">
                      Akses Cepat
                    </h2>

                    <p className="mt-0.5 text-[10px] text-slate-400 sm:text-xs">
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
                        className="group relative flex min-w-0 items-center gap-4 overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#c7dbff] hover:shadow-md"
                      >
                        <QuickIcon Icon={Icon} />

                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 items-center justify-between gap-2">
                            <h3 className="truncate text-sm font-semibold text-slate-800">
                              {item.title}
                            </h3>

                            <ChevronRight
                              size={15}
                              className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#155DFC]"
                            />
                          </div>

                          <p className="mt-1 line-clamp-1 text-[10px] leading-relaxed text-slate-400 sm:text-xs">
                            {item.desc}
                          </p>

                          <span className="mt-2 inline-flex max-w-full rounded-md bg-slate-50 px-2 py-1 text-[9px] font-medium text-slate-500">
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

                <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm xl:col-span-2">
                  <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eaf1ff] text-[#155DFC]">
                        <Clock3 size={17} />
                      </div>

                      <div className="min-w-0">
                        <h2 className="text-sm font-bold text-slate-800">
                          Jadwal Hari Ini
                        </h2>

                        <p className="mt-0.5 text-[10px] text-slate-400">
                          Senin, 17 Agustus 2026
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        router.push("/guru/jadwal")
                      }
                      className="flex shrink-0 items-center gap-1 text-[10px] font-semibold text-[#155DFC] hover:text-[#0d47c9] sm:text-xs"
                    >
                      Lihat jadwal
                      <ChevronRight size={13} />
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {scheduleData.map((item) => {
                      const isActive =
                        item.status ===
                        "Berlangsung";

                      return (
                        <div
                          key={item.id}
                          className={`flex min-w-0 items-center gap-3 p-4 sm:p-5 ${
                            isActive
                              ? "bg-[#f7faff]"
                              : ""
                          }`}
                        >
                          {/* TIME */}

                          <div className="w-[82px] shrink-0 sm:w-[100px]">
                            <p className="text-xs font-bold text-slate-700 sm:text-sm">
                              {item.time.split(
                                " - "
                              )[0]}
                            </p>

                            <p className="mt-0.5 text-[9px] text-slate-400 sm:text-[10px]">
                              {item.time.split(
                                " - "
                              )[1]}
                            </p>
                          </div>

                          {/* LINE */}

                          <div className="relative flex h-12 shrink-0 items-center">
                            <div className="h-2.5 w-2.5 rounded-full border-2 border-[#155DFC] bg-white" />

                            {item.id !==
                              scheduleData.length && (
                              <div className="absolute left-1/2 top-7 h-8 w-px -translate-x-1/2 bg-slate-200" />
                            )}
                          </div>

                          {/* CONTENT */}

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-slate-800 sm:text-sm">
                              {item.subject}
                            </p>

                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                              <span className="inline-flex items-center gap-1 text-[9px] text-slate-400 sm:text-[10px]">
                                <Users size={11} />
                                {item.className}
                              </span>

                              <span className="inline-flex items-center gap-1 text-[9px] text-slate-400 sm:text-[10px]">
                                <BookOpen size={11} />
                                {item.room}
                              </span>
                            </div>
                          </div>

                          {/* STATUS */}

                          <span
                            className={`hidden shrink-0 rounded-full px-2.5 py-1 text-[9px] font-semibold sm:inline-flex ${
                              item.status ===
                              "Berlangsung"
                                ? "bg-blue-50 text-blue-600"
                                : item.status ===
                                  "Selesai"
                                ? "bg-slate-100 text-slate-500"
                                : "bg-amber-50 text-amber-600"
                            }`}
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

                <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eaf1ff] text-[#155DFC]">
                        <MoreHorizontal size={17} />
                      </div>

                      <div>
                        <h2 className="text-sm font-bold text-slate-800">
                          Aktivitas Terbaru
                        </h2>

                        <p className="mt-0.5 text-[10px] text-slate-400">
                          Aktivitas pembelajaran
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {activityData.map((item) => {
                      const Icon = item.icon;

                      return (
                        <div
                          key={item.id}
                          className="flex gap-3 p-4 transition hover:bg-slate-50/70 sm:p-5"
                        >
                          <ActivityIcon
                            Icon={Icon}
                            type={item.type}
                          />

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-slate-700">
                              {item.title}
                            </p>

                            <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-slate-400">
                              {item.desc}
                            </p>

                            <p className="mt-1.5 text-[9px] text-slate-300">
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

                <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm lg:col-span-2">
                  <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eaf1ff] text-[#155DFC]">
                        <CalendarCheck2 size={17} />
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate text-sm font-bold text-slate-800">
                          Kehadiran per Kelas
                        </h2>

                        <p className="mt-0.5 text-[10px] text-slate-400">
                          Rekap kehadiran siswa
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        router.push("/guru/absensi")
                      }
                      className="flex shrink-0 items-center gap-1 text-[10px] font-semibold text-[#155DFC] hover:text-[#0d47c9] sm:text-xs"
                    >
                      Lihat semua
                      <ChevronRight size={13} />
                    </button>
                  </div>

                  <div className="p-4 sm:p-5">
                    <div className="space-y-5">
                      {classAttendance.map(
                        (kelas) => (
                          <div
                            key={kelas.id}
                            className="min-w-0"
                          >
                            <div className="mb-2 flex items-center justify-between gap-3">
                              <div className="flex min-w-0 items-center gap-2">
                                <span className="truncate text-xs font-semibold text-slate-700 sm:text-sm">
                                  {kelas.className}
                                </span>

                                <span className="shrink-0 text-[9px] text-slate-400">
                                  {kelas.present}/
                                  {kelas.students}{" "}
                                  hadir
                                </span>
                              </div>

                              <div className="flex shrink-0 items-center gap-1.5">
                                <span className="text-xs font-semibold text-slate-700">
                                  {
                                    kelas.percentage
                                  }
                                  %
                                </span>

                                <TrendIcon
                                  trend={
                                    kelas.trend
                                  }
                                />
                              </div>
                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-[#155DFC] transition-all duration-500"
                                style={{
                                  width: `${kelas.percentage}%`,
                                }}
                              />
                            </div>
                          </div>
                        )
                      )}
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3">
                      <div>
                        <p className="text-[9px] text-slate-400">
                          Rata-rata
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-800">
                          96.0%
                        </p>
                      </div>

                      <div>
                        <p className="text-[9px] text-slate-400">
                          Hadir Hari Ini
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-800">
                          132 siswa
                        </p>
                      </div>

                      <div className="col-span-2 sm:col-span-1">
                        <p className="text-[9px] text-slate-400">
                          Tidak Hadir
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-800">
                          6 siswa
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* =================================================
                    NOTIFICATION
                ================================================= */}

                <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-[#eaf1ff] text-[#155DFC]">
                        <Bell size={17} />

                        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
                      </div>

                      <div>
                        <h2 className="text-sm font-bold text-slate-800">
                          Notifikasi
                        </h2>

                        <p className="mt-0.5 text-[10px] text-slate-400">
                          Informasi terbaru
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-[#eaf1ff] px-2 py-1 text-[9px] font-semibold text-[#155DFC]">
                      2 baru
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {notificationData.map(
                      (item) => (
                        <div
                          key={item.id}
                          className="flex gap-3 p-4 transition hover:bg-slate-50/70"
                        >
                          <div className="pt-1">
                            <span
                              className={`block h-2 w-2 rounded-full ${
                                item.unread
                                  ? "bg-[#155DFC]"
                                  : "bg-slate-200"
                              }`}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="min-w-0 truncate text-xs font-semibold text-slate-700">
                                {item.title}
                              </p>

                              {item.unread && (
                                <span className="shrink-0 text-[8px] font-semibold text-[#155DFC]">
                                  BARU
                                </span>
                              )}
                            </div>

                            <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-slate-400">
                              {item.desc}
                            </p>

                            <p className="mt-1.5 text-[9px] text-slate-300">
                              {item.time}
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-1 border-t border-slate-100 p-3 text-[10px] font-semibold text-[#155DFC] transition hover:bg-slate-50 sm:text-xs"
                  >
                    Lihat semua notifikasi
                    <ArrowUpRight size={13} />
                  </button>
                </div>
              </section>

              {/* =================================================
                  REMINDER
              ================================================= */}

              <section className="rounded-2xl border border-[#c7dbff] bg-[#f5f8ff] p-4 sm:p-5">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#155DFC]">
                    <AlertCircle size={17} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-700">
                      Pengingat
                    </p>

                    <p className="mt-1 text-[10px] leading-relaxed text-slate-500 sm:text-xs">
                      Masih ada{" "}
                      <span className="font-semibold text-slate-700">
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
                    className="hidden shrink-0 items-center gap-1 rounded-lg bg-white px-3 py-2 text-[10px] font-semibold text-[#155DFC] shadow-sm transition hover:bg-[#155DFC] hover:text-white sm:flex"
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
                  className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg bg-white px-3 py-2 text-[10px] font-semibold text-[#155DFC] shadow-sm sm:hidden"
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