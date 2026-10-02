"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  ArrowUpRight,
  BookOpen,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  FileText,
  GraduationCap,
  MonitorPlay,
  MoreHorizontal,
  RefreshCw,
  Server,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Wifi,
} from "lucide-react";

const LMS_MENU = [
  {
    title: "Materi dan Modul Ajar",
    description: "Kelola materi, modul, video, dan bahan pembelajaran.",
    href: "/admin/lms-cbt/materi-modul-ajar",
    icon: BookOpen,
    tone: "primary",
  },
  {
    title: "Tugas Siswa",
    description: "Kelola tugas dan pantau pengumpulan siswa.",
    href: "/admin/lms-cbt/tugas-siswa",
    icon: ClipboardCheck,
    tone: "secondary",
  },
  {
    title: "Ujian CBT Online",
    description: "Kelola ujian, soal, peserta, dan hasil CBT.",
    href: "/admin/lms-cbt/ujian",
    icon: MonitorPlay,
    tone: "info",
  },
  {
    title: "Kapasitas & Server CBT",
    description: "Pantau kapasitas, koneksi, dan kondisi server CBT.",
    href: "/admin/lms-cbt/server",
    icon: Server,
    tone: "success",
  },
];

const RECENT_MATERIALS = [
  {
    title: "Persamaan Kuadrat",
    subject: "Matematika",
    teacher: "Budi Santoso",
    type: "Modul Ajar",
    updated: "Hari ini, 08:30",
    color: "primary",
  },
  {
    title: "Sistem Pernapasan Manusia",
    subject: "IPA",
    teacher: "Dewi Lestari",
    type: "Materi",
    updated: "Hari ini, 07:45",
    color: "success",
  },
  {
    title: "Teks Eksplanasi",
    subject: "Bahasa Indonesia",
    teacher: "Budi Pratama",
    type: "PDF",
    updated: "Kemarin, 15:20",
    color: "danger",
  },
  {
    title: "Daily English Practice",
    subject: "Bahasa Inggris",
    teacher: "Rina Amelia",
    type: "Video",
    updated: "Kemarin, 13:10",
    color: "info",
  },
];

const PENDING_TASKS = [
  {
    title: "Latihan Persamaan Kuadrat",
    subject: "Matematika",
    className: "Kelas 9A",
    collected: 28,
    total: 32,
    deadline: "12 Sep 2026",
  },
  {
    title: "Teks Eksplanasi",
    subject: "Bahasa Indonesia",
    className: "Kelas 9B",
    collected: 25,
    total: 30,
    deadline: "13 Sep 2026",
  },
  {
    title: "Interaksi Sosial",
    subject: "IPS",
    className: "Kelas 8A",
    collected: 21,
    total: 29,
    deadline: "15 Sep 2026",
  },
];

const CBT_SCHEDULE = [
  {
    title: "Penilaian Tengah Semester",
    subject: "Matematika",
    className: "Kelas 9",
    date: "10 Sep 2026",
    time: "08:00 - 09:30",
    participants: 96,
    status: "Berlangsung",
  },
  {
    title: "Ujian Bahasa Inggris",
    subject: "Bahasa Inggris",
    className: "Kelas 8",
    date: "11 Sep 2026",
    time: "09:00 - 10:00",
    participants: 82,
    status: "Terjadwal",
  },
  {
    title: "Evaluasi IPA",
    subject: "IPA",
    className: "Kelas 9",
    date: "12 Sep 2026",
    time: "10:00 - 11:30",
    participants: 91,
    status: "Terjadwal",
  },
];

const ACTIVITY_DATA = [
  {
    title: "Guru menambahkan materi baru",
    detail: "Persamaan Kuadrat · Matematika",
    time: "8 menit lalu",
    icon: BookOpen,
    tone: "primary",
  },
  {
    title: "Ujian CBT dipublikasikan",
    detail: "Penilaian Tengah Semester · Kelas 9",
    time: "24 menit lalu",
    icon: MonitorPlay,
    tone: "info",
  },
  {
    title: "32 siswa mengumpulkan tugas",
    detail: "Latihan Persamaan Kuadrat",
    time: "1 jam lalu",
    icon: ClipboardCheck,
    tone: "success",
  },
  {
    title: "Modul ajar diperbarui",
    detail: "Sistem Pernapasan Manusia",
    time: "2 jam lalu",
    icon: FileText,
    tone: "secondary",
  },
];

const toneMap = {
  primary: {
    iconBg:
      "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]",
    iconText: "text-[var(--color-primary)]",
    soft:
      "bg-[color-mix(in_srgb,var(--color-primary)_6%,transparent)]",
    border:
      "border-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]",
  },

  secondary: {
    iconBg:
      "bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]",
    iconText: "theme-text-secondary",
    soft:
      "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]",
    border: "theme-border-soft",
  },

  info: {
    iconBg:
      "bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)]",
    iconText: "text-[var(--color-info)]",
    soft:
      "bg-[color-mix(in_srgb,var(--color-info)_6%,transparent)]",
    border:
      "border-[color-mix(in_srgb,var(--color-info)_18%,transparent)]",
  },

  success: {
    iconBg:
      "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]",
    iconText: "text-[var(--color-success)]",
    soft:
      "bg-[color-mix(in_srgb,var(--color-success)_6%,transparent)]",
    border:
      "border-[color-mix(in_srgb,var(--color-success)_18%,transparent)]",
  },

  danger: {
    iconBg:
      "bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)]",
    iconText: "theme-danger",
    soft:
      "bg-[color-mix(in_srgb,var(--color-danger)_6%,transparent)]",
    border:
      "border-[color-mix(in_srgb,var(--color-danger)_18%,transparent)]",
  },
};

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  tone = "primary",
  href,
}) {
  const theme = toneMap[tone] || toneMap.primary;

  const content = (
    <div
      className="
        group relative overflow-hidden rounded-2xl
        theme-card theme-border
        p-5
        shadow-[0_6px_24px_color-mix(in_srgb,var(--color-text)_6%,transparent)]
        transition-all duration-300
        hover:-translate-y-0.5
        hover:border-[color-mix(in_srgb,var(--color-primary)_30%,var(--color-border))]
        hover:shadow-[0_14px_40px_color-mix(in_srgb,var(--color-primary)_10%,transparent)]
      "
    >
      <div
        className="
          absolute right-0 top-0 h-24 w-24
          translate-x-8 -translate-y-8 rounded-full
          bg-[color-mix(in_srgb,var(--color-primary)_5%,transparent)]
          transition-transform duration-500
          group-hover:scale-150
        "
      />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="theme-text-secondary text-sm font-medium">
            {label}
          </p>

          <div className="mt-2 flex items-end gap-2">
            <p className="theme-text text-3xl font-bold tracking-tight">
              {value}
            </p>
          </div>

          <p className="theme-text-muted mt-1.5 text-xs">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${theme.iconBg} ${theme.iconText}`}
        >
          <Icon size={21} strokeWidth={1.9} />
        </div>
      </div>

      {href && (
        <div className="relative mt-4 flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)]">
          Lihat detail
          <ArrowUpRight
            size={14}
            className="
              transition-transform
              group-hover:-translate-y-0.5
              group-hover:translate-x-0.5
            "
          />
        </div>
      )}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  action,
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
            {eyebrow}
          </p>
        )}

        <h2 className="theme-text text-lg font-bold tracking-tight">
          {title}
        </h2>

        {description && (
          <p className="theme-text-secondary mt-1 text-sm">
            {description}
          </p>
        )}
      </div>

      {href && (
        <Link
          href={href}
          className="
            inline-flex items-center gap-1
            text-sm font-semibold
            text-[var(--color-primary)]
            transition
            hover:opacity-80
          "
        >
          {action || "Lihat semua"}
          <ChevronRight size={16} />
        </Link>
      )}
    </div>
  );
}

export default function LMSCBTDashboardPage() {
  const [activeQuickAction, setActiveQuickAction] = useState(null);

  const totalCollected = useMemo(
    () =>
      PENDING_TASKS.reduce(
        (sum, item) => sum + item.collected,
        0
      ),
    []
  );

  const totalTask = useMemo(
    () =>
      PENDING_TASKS.reduce(
        (sum, item) => sum + item.total,
        0
      ),
    []
  );

  const taskProgress = totalTask
    ? Math.round((totalCollected / totalTask) * 100)
    : 0;

  return (
    <div className="theme-page flex h-screen min-h-0 overflow-hidden">
      <Sidebar
        role="admin"
        active="lmsCbt"
        setActive={() => {}}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AS",
          }}
        />

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            {/* =========================================================
                HERO
            ========================================================= */}
            <section
              className="
                relative mb-6 overflow-hidden rounded-[28px]
                bg-[var(--color-primary)]
                shadow-[0_20px_55px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]
              "
            >
              <div
                className="
                  absolute -right-24 -top-28 h-80 w-80
                  translate-x-0 rounded-full
                  bg-white/10 blur-3xl
                "
              />

              <div
                className="
                  absolute -bottom-40 left-1/3 h-96 w-96
                  rounded-full bg-white/5 blur-3xl
                "
              />

              <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
                  backgroundSize: "34px 34px",
                }}
              />

              <div className="relative grid gap-7 px-6 py-7 sm:px-8 sm:py-8 lg:grid-cols-[1fr_390px] lg:px-10 lg:py-9">
                <div className="flex flex-col justify-center">
                  <div
                    className="
                      mb-4 inline-flex w-fit items-center gap-2
                      rounded-full border border-white/10
                      bg-white/10 px-3 py-1.5
                      text-xs font-semibold text-white
                      backdrop-blur-md
                    "
                  >
                    <Sparkles size={13} />
                    Pusat Pembelajaran Digital
                  </div>

                  <h1 className="max-w-2xl text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-[38px] lg:leading-tight">
                    LMS & CBT Sekolah
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75 sm:text-[15px]">
                    Kelola seluruh aktivitas pembelajaran digital,
                    materi, tugas, ujian CBT, hingga infrastruktur
                    server dari satu tempat.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href="/admin/lms-cbt/materi"
                      className="
                        inline-flex items-center gap-2
                        rounded-xl bg-white px-4 py-2.5
                        text-sm font-semibold
                        text-[var(--color-primary)]
                        shadow-lg shadow-black/10
                        transition
                        hover:-translate-y-0.5
                        hover:bg-white/90
                      "
                    >
                      <BookOpen size={17} />
                      Kelola Materi
                    </Link>

                    <Link
                      href="/admin/lms-cbt/ujian"
                      className="
                        inline-flex items-center gap-2
                        rounded-xl border border-white/15
                        bg-white/10 px-4 py-2.5
                        text-sm font-semibold text-white
                        backdrop-blur-md transition
                        hover:bg-white/15
                      "
                    >
                      <MonitorPlay size={17} />
                      Kelola CBT
                    </Link>
                  </div>
                </div>

                {/* HERO STATUS */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-white/60">
                        Status Sistem
                      </p>

                      <p className="mt-1 text-lg font-bold text-white">
                        Semua layanan aktif
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                      <ShieldCheck size={20} />
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {[
                      {
                        label: "LMS Platform",
                        status: "Online",
                      },
                      {
                        label: "CBT Server",
                        status: "Normal",
                      },
                      {
                        label: "Database",
                        status: "Normal",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="
                          flex items-center justify-between
                          rounded-xl bg-white/[0.06]
                          px-3.5 py-3
                        "
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="
                              h-2.5 w-2.5 rounded-full
                              bg-white
                              shadow-[0_0_12px_rgba(255,255,255,.8)]
                            "
                          />

                          <span className="text-sm text-white/90">
                            {item.label}
                          </span>
                        </div>

                        <span className="text-xs font-semibold text-white">
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* =========================================================
                QUICK MODULES
            ========================================================= */}
            <section className="mb-7">
              <SectionHeader
                eyebrow="LMS & CBT"
                title="Modul utama"
                description="Akses cepat untuk pengelolaan pembelajaran digital."
              />

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {LMS_MENU.map((item) => {
                  const Icon = item.icon;
                  const theme =
                    toneMap[item.tone] || toneMap.primary;

                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="
                        group relative overflow-hidden
                        rounded-2xl theme-card theme-border
                        p-5
                        shadow-[0_6px_24px_color-mix(in_srgb,var(--color-text)_6%,transparent)]
                        transition-all duration-300
                        hover:-translate-y-1
                        hover:border-[color-mix(in_srgb,var(--color-primary)_30%,var(--color-border))]
                        hover:shadow-[0_18px_45px_color-mix(in_srgb,var(--color-primary)_10%,transparent)]
                      "
                    >
                      <div
                        className="
                          absolute right-0 top-0 h-24 w-24
                          translate-x-10 -translate-y-10
                          rounded-full
                          bg-[color-mix(in_srgb,var(--color-primary)_6%,transparent)]
                          transition-transform duration-500
                          group-hover:scale-150
                        "
                      />

                      <div className="relative">
                        <div className="flex items-start justify-between">
                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-xl ${theme.iconBg} ${theme.iconText}`}
                          >
                            <Icon size={21} strokeWidth={1.8} />
                          </div>

                          <ArrowUpRight
                            size={17}
                            className="
                              theme-text-muted
                              transition-all
                              group-hover:-translate-y-0.5
                              group-hover:translate-x-0.5
                              group-hover:text-[var(--color-primary)]
                            "
                          />
                        </div>

                        <h3 className="theme-text mt-5 text-[15px] font-bold">
                          {item.title}
                        </h3>

                        <p className="theme-text-secondary mt-1.5 min-h-[40px] text-xs leading-5">
                          {item.description}
                        </p>

                        <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)]">
                          Buka modul
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* =========================================================
                STATS
            ========================================================= */}
            <section className="mb-7">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Materi & Modul"
                  value="128"
                  description="Materi aktif tersedia"
                  icon={BookOpen}
                  tone="primary"
                  href="/admin/lms-cbt/materi"
                />

                <StatCard
                  label="Tugas Siswa"
                  value="46"
                  description="Tugas aktif minggu ini"
                  icon={ClipboardCheck}
                  tone="secondary"
                  href="/admin/lms-cbt/tugas"
                />

                <StatCard
                  label="Ujian CBT"
                  value="12"
                  description="Ujian terjadwal"
                  icon={MonitorPlay}
                  tone="info"
                  href="/admin/lms-cbt/ujian"
                />

                <StatCard
                  label="Peserta Aktif"
                  value="684"
                  description="Siswa menggunakan LMS"
                  icon={Users}
                  tone="success"
                />
              </div>
            </section>

            {/* =========================================================
                OVERVIEW
            ========================================================= */}
            <section className="mb-7 grid gap-5 xl:grid-cols-[1.45fr_.8fr]">
              {/* LMS ACTIVITY */}
              <div className="theme-card theme-border rounded-2xl p-5 shadow-[0_6px_24px_color-mix(in_srgb,var(--color-text)_6%,transparent)] sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                      Aktivitas LMS
                    </p>

                    <h2 className="theme-text mt-1 text-lg font-bold">
                      Aktivitas pembelajaran
                    </h2>

                    <p className="theme-text-secondary mt-1 text-sm">
                      Ringkasan aktivitas siswa dan guru pada LMS.
                    </p>
                  </div>

                  <div className="theme-primary rounded-xl px-3 py-2 text-xs font-semibold">
                    Minggu ini
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="theme-card-soft rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="theme-text-secondary text-xs font-medium">
                        Materi dipelajari
                      </span>

                      <BookOpen
                        size={16}
                        className="text-[var(--color-primary)]"
                      />
                    </div>

                    <p className="theme-text mt-3 text-2xl font-bold">
                      842
                    </p>

                    <p className="theme-success mt-1 text-xs">
                      +12,8% dari minggu lalu
                    </p>
                  </div>

                  <div className="theme-card-soft rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="theme-text-secondary text-xs font-medium">
                        Tugas terkumpul
                      </span>

                      <BookOpenCheck
                        size={16}
                        className="theme-text-secondary"
                      />
                    </div>

                    <p className="theme-text mt-3 text-2xl font-bold">
                      {totalCollected}
                    </p>

                    <p className="theme-text-muted mt-1 text-xs">
                      dari {totalTask} pengumpulan
                    </p>
                  </div>

                  <div className="theme-card-soft rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="theme-text-secondary text-xs font-medium">
                        Rata-rata progres
                      </span>

                      <Target
                        size={16}
                        className="text-[var(--color-success)]"
                      />
                    </div>

                    <p className="theme-text mt-3 text-2xl font-bold">
                      87%
                    </p>

                    <p className="theme-success mt-1 text-xs">
                      Aktivitas belajar siswa
                    </p>
                  </div>
                </div>

                {/* PROGRESS */}
                <div className="theme-border-soft mt-6 rounded-xl border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="theme-text text-sm font-semibold">
                        Pengumpulan tugas
                      </p>

                      <p className="theme-text-muted mt-1 text-xs">
                        Persentase tugas yang sudah dikumpulkan siswa.
                      </p>
                    </div>

                    <span className="text-sm font-bold text-[var(--color-primary)]">
                      {taskProgress}%
                    </span>
                  </div>

                  <div className="theme-card-soft mt-4 h-2 overflow-hidden rounded-full">
                    <div
                      className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-700"
                      style={{ width: `${taskProgress}%` }}
                    />
                  </div>

                  <div className="theme-text-muted mt-3 flex items-center justify-between text-[11px]">
                    <span>{totalCollected} sudah dikumpulkan</span>
                    <span>{totalTask - totalCollected} belum</span>
                  </div>
                </div>
              </div>

              {/* SERVER */}
              <div className="theme-card theme-border rounded-2xl p-5 shadow-[0_6px_24px_color-mix(in_srgb,var(--color-text)_6%,transparent)] sm:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-success)]">
                      Infrastruktur
                    </p>

                    <h2 className="theme-text mt-1 text-lg font-bold">
                      CBT Server
                    </h2>

                    <p className="theme-text-secondary mt-1 text-sm">
                      Kondisi server saat ini.
                    </p>
                  </div>

                  <Link
                    href="/admin/lms-cbt/server"
                    className="
                      theme-card-soft theme-text-secondary
                      flex h-9 w-9 items-center justify-center
                      rounded-lg transition
                      hover:text-[var(--color-primary)]
                    "
                  >
                    <Settings2 size={17} />
                  </Link>
                </div>

                <div className="theme-card-soft mt-5 rounded-2xl p-5">
                  <div className="flex items-center gap-4">
                    <div
                      className="
                        relative flex h-14 w-14
                        items-center justify-center
                        rounded-2xl
                        bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]
                        text-[var(--color-success)]
                      "
                    >
                      <Server size={25} />

                      <span
                        className="
                          absolute right-1.5 top-1.5 h-2.5 w-2.5
                          rounded-full bg-[var(--color-success)]
                          ring-4
                          ring-[color-mix(in_srgb,var(--color-success)_10%,transparent)]
                        "
                      />
                    </div>

                    <div>
                      <p className="theme-text text-base font-bold">
                        Server Normal
                      </p>

                      <p className="theme-text-muted mt-1 text-xs">
                        Semua layanan CBT berjalan baik
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {[
                      ["CPU Usage", "34%"],
                      ["Memory", "48%"],
                      ["Peserta Online", "96"],
                      ["Response", "42ms"],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="theme-card rounded-xl p-3.5"
                      >
                        <p className="theme-text-muted text-[11px]">
                          {label}
                        </p>

                        <p className="theme-text mt-1 text-lg font-bold">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/admin/lms-cbt/server"
                    className="
                      theme-card theme-border theme-text-secondary
                      mt-4 flex items-center justify-center gap-2
                      rounded-xl border px-4 py-2.5
                      text-xs font-semibold transition
                      hover:border-[color-mix(in_srgb,var(--color-primary)_30%,var(--color-border))]
                      hover:text-[var(--color-primary)]
                    "
                  >
                    <Wifi size={15} />
                    Lihat monitoring server
                  </Link>
                </div>
              </div>
            </section>

            {/* =========================================================
                MATERIAL + TASK
            ========================================================= */}
            <section className="mb-7 grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
              {/* MATERIAL */}
              <div className="theme-card theme-border overflow-hidden rounded-2xl border shadow-[0_6px_24px_color-mix(in_srgb,var(--color-text)_6%,transparent)]">
                <div className="theme-border-soft flex items-center justify-between border-b px-5 py-4 sm:px-6">
                  <div>
                    <p className="theme-text text-sm font-bold">
                      Materi terbaru
                    </p>

                    <p className="theme-text-secondary mt-1 text-xs">
                      Materi yang baru ditambahkan oleh guru.
                    </p>
                  </div>

                  <Link
                    href="/admin/lms-cbt/materi"
                    className="text-xs font-semibold text-[var(--color-primary)]"
                  >
                    Semua materi
                  </Link>
                </div>

                <div className="divide-y theme-border-soft">
                  {RECENT_MATERIALS.map((item) => {
                    const theme =
                      toneMap[item.color] || toneMap.primary;

                    const Icon =
                      item.type === "Video"
                        ? MonitorPlay
                        : FileText;

                    return (
                      <div
                        key={item.title}
                        className="
                          group flex items-center gap-4
                          px-5 py-4 transition
                          hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)]
                          sm:px-6
                        "
                      >
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${theme.iconBg} ${theme.iconText}`}
                        >
                          <Icon size={19} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="theme-text truncate text-sm font-semibold">
                            {item.title}
                          </p>

                          <div className="theme-text-secondary mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                            <span>{item.subject}</span>
                            <span className="theme-text-muted">•</span>
                            <span>{item.teacher}</span>
                          </div>
                        </div>

                        <div className="hidden text-right sm:block">
                          <p className="theme-text-muted text-[11px] font-medium">
                            {item.type}
                          </p>

                          <p className="theme-text-muted mt-1 text-[11px]">
                            {item.updated}
                          </p>
                        </div>

                        <ChevronRight
                          size={16}
                          className="
                            theme-text-muted shrink-0
                            transition
                            group-hover:translate-x-0.5
                            group-hover:text-[var(--color-primary)]
                          "
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* TASK */}
              <div className="theme-card theme-border overflow-hidden rounded-2xl border shadow-[0_6px_24px_color-mix(in_srgb,var(--color-text)_6%,transparent)]">
                <div className="theme-border-soft flex items-center justify-between border-b px-5 py-4 sm:px-6">
                  <div>
                    <p className="theme-text text-sm font-bold">
                      Tugas perlu diperiksa
                    </p>

                    <p className="theme-text-secondary mt-1 text-xs">
                      Ringkasan pengumpulan tugas terbaru.
                    </p>
                  </div>

                  <Link
                    href="/admin/lms-cbt/tugas"
                    className="text-xs font-semibold text-[var(--color-primary)]"
                  >
                    Lihat tugas
                  </Link>
                </div>

                <div className="divide-y theme-border-soft">
                  {PENDING_TASKS.map((item) => {
                    const progress = Math.round(
                      (item.collected / item.total) * 100
                    );

                    return (
                      <div
                        key={item.title}
                        className="px-5 py-4 sm:px-6"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="theme-text truncate text-sm font-semibold">
                              {item.title}
                            </p>

                            <p className="theme-text-secondary mt-1 text-xs">
                              {item.subject} · {item.className}
                            </p>
                          </div>

                          <span className="theme-primary shrink-0 rounded-lg px-2 py-1 text-[10px] font-bold">
                            {item.deadline}
                          </span>
                        </div>

                        <div className="mt-3">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="theme-text-muted">
                              Pengumpulan
                            </span>

                            <span className="theme-text-secondary font-semibold">
                              {item.collected}/{item.total}
                            </span>
                          </div>

                          <div className="theme-card-soft mt-2 h-1.5 overflow-hidden rounded-full">
                            <div
                              className="h-full rounded-full bg-[var(--color-primary)]"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* =========================================================
                CBT SCHEDULE + ACTIVITY
            ========================================================= */}
            <section className="mb-7 grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
              {/* CBT */}
              <div className="theme-card theme-border overflow-hidden rounded-2xl border shadow-[0_6px_24px_color-mix(in_srgb,var(--color-text)_6%,transparent)]">
                <div className="theme-border-soft flex items-center justify-between border-b px-5 py-4 sm:px-6">
                  <div>
                    <p className="theme-text text-sm font-bold">
                      Jadwal CBT
                    </p>

                    <p className="theme-text-secondary mt-1 text-xs">
                      Ujian CBT yang sedang dan akan berlangsung.
                    </p>
                  </div>

                  <Link
                    href="/admin/lms-cbt/ujian"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)]"
                  >
                    Kelola
                    <ChevronRight size={14} />
                  </Link>
                </div>

                <div className="divide-y theme-border-soft">
                  {CBT_SCHEDULE.map((item, index) => {
                    const ongoing =
                      item.status === "Berlangsung";

                    return (
                      <div
                        key={`${item.title}-${index}`}
                        className="
                          group flex gap-4 px-5 py-4 transition
                          hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)]
                          sm:px-6
                        "
                      >
                        <div className="hidden w-14 shrink-0 sm:block">
                          <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]">
                            <CalendarDays size={16} />

                            <span className="mt-0.5 text-[9px] font-bold uppercase">
                              Sep
                            </span>
                          </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="theme-text text-sm font-semibold">
                              {item.title}
                            </p>

                            <span
                              className={
                                ongoing
                                  ? "theme-success rounded-full px-2 py-1 text-[10px] font-bold"
                                  : "theme-primary rounded-full px-2 py-1 text-[10px] font-bold"
                              }
                            >
                              {item.status}
                            </span>
                          </div>

                          <p className="theme-text-secondary mt-1 text-xs">
                            {item.subject} · {item.className}
                          </p>

                          <div className="theme-text-muted mt-2 flex flex-wrap items-center gap-3 text-[11px]">
                            <span className="inline-flex items-center gap-1">
                              <CalendarDays size={12} />
                              {item.date}
                            </span>

                            <span className="inline-flex items-center gap-1">
                              <Clock3 size={12} />
                              {item.time}
                            </span>

                            <span className="inline-flex items-center gap-1">
                              <Users size={12} />
                              {item.participants} peserta
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="
                            theme-text-muted
                            hidden h-8 w-8 shrink-0
                            items-center justify-center
                            self-center rounded-lg
                            transition
                            hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]
                            hover:text-[var(--color-primary)]
                            sm:flex
                          "
                        >
                          <MoreHorizontal size={17} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ACTIVITY */}
              <div className="theme-card theme-border overflow-hidden rounded-2xl border shadow-[0_6px_24px_color-mix(in_srgb,var(--color-text)_6%,transparent)]">
                <div className="theme-border-soft flex items-center justify-between border-b px-5 py-4 sm:px-6">
                  <div>
                    <p className="theme-text text-sm font-bold">
                      Aktivitas terbaru
                    </p>

                    <p className="theme-text-secondary mt-1 text-xs">
                      Aktivitas terakhir pada LMS & CBT.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="
                      theme-card-soft theme-text-muted
                      flex h-8 w-8 items-center justify-center
                      rounded-lg transition
                      hover:text-[var(--color-primary)]
                    "
                    title="Refresh"
                  >
                    <RefreshCw size={15} />
                  </button>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="relative">
                    <div className="theme-border-soft absolute bottom-5 left-[17px] top-5 w-px" />

                    <div className="space-y-5">
                      {ACTIVITY_DATA.map((item) => {
                        const theme =
                          toneMap[item.tone] || toneMap.primary;

                        const Icon = item.icon;

                        return (
                          <div
                            key={item.title}
                            className="relative flex gap-3"
                          >
                            <div
                              className={`
                                relative z-10 flex h-9 w-9
                                shrink-0 items-center justify-center
                                rounded-xl ${theme.iconBg}
                                ${theme.iconText}
                                ring-4
                                ring-[var(--color-card)]
                              `}
                            >
                              <Icon size={16} />
                            </div>

                            <div className="min-w-0 pt-0.5">
                              <p className="theme-text text-xs font-semibold leading-5">
                                {item.title}
                              </p>

                              <p className="theme-text-secondary mt-0.5 truncate text-[11px]">
                                {item.detail}
                              </p>

                              <p className="theme-text-muted mt-1 text-[10px]">
                                {item.time}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* =========================================================
                QUICK ACTION
            ========================================================= */}
            <section className="mb-7">
              <div className="theme-card theme-border rounded-2xl border p-5 shadow-[0_6px_24px_color-mix(in_srgb,var(--color-text)_6%,transparent)] sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                      Aksi cepat
                    </p>

                    <h2 className="theme-text mt-1 text-lg font-bold">
                      Kelola pembelajaran sekolah
                    </h2>

                    <p className="theme-text-secondary mt-1 text-sm">
                      Gunakan akses cepat untuk membuat dan mengelola
                      konten LMS maupun ujian CBT.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      {
                        label: "Tambah Materi",
                        icon: BookOpen,
                        href: "/admin/lms-cbt/materi/tambah",
                      },
                      {
                        label: "Tambah Tugas",
                        icon: ClipboardCheck,
                        href: "/admin/lms-cbt/tugas/tambah",
                      },
                      {
                        label: "Buat Ujian",
                        icon: MonitorPlay,
                        href: "/admin/lms-cbt/ujian/tambah",
                      },
                      {
                        label: "Server CBT",
                        icon: Server,
                        href: "/admin/lms-cbt/server",
                      },
                    ].map((item) => {
                      const Icon = item.icon;
                      const active =
                        activeQuickAction === item.label;

                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() =>
                            setActiveQuickAction(item.label)
                          }
                          className={`
                            group flex min-w-[125px]
                            items-center gap-2 rounded-xl
                            border px-3 py-3
                            text-xs font-semibold transition
                            ${
                              active
                                ? "theme-primary theme-border"
                                : "theme-card theme-border theme-text-secondary hover:border-[color-mix(in_srgb,var(--color-primary)_30%,var(--color-border))] hover:text-[var(--color-primary)]"
                            }
                          `}
                        >
                          <Icon size={16} />

                          <span className="truncate">
                            {item.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* =========================================================
                FOOTER INFO
            ========================================================= */}
            <div className="theme-border-soft theme-text-muted flex flex-col gap-3 border-t py-5 text-xs sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap size={15} />

                <span>
                  SmartSchool · LMS & CBT Management
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2
                    size={13}
                    className="text-[var(--color-success)]"
                  />
                  LMS Online
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2
                    size={13}
                    className="text-[var(--color-success)]"
                  />
                  CBT Normal
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}