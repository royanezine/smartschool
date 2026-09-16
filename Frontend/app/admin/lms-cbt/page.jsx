"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";

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
  LayoutGrid,
  MonitorPlay,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Server,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Wifi,
  XCircle,
} from "lucide-react";

const LMS_MENU = [
  {
    title: "Materi dan Modul Ajar",
    description: "Kelola materi, modul, video, dan bahan pembelajaran.",
    href: "/admin/lms-cbt/materi-modul-ajar",
    icon: BookOpen,
    tone: "blue",
  },
  {
    title: "Tugas Siswa",
    description: "Kelola tugas dan pantau pengumpulan siswa.",
    href: "/admin/lms-cbt/tugas-siswa",
    icon: ClipboardCheck,
    tone: "violet",
  },
  {
    title: "Ujian CBT Online",
    description: "Kelola ujian, soal, peserta, dan hasil CBT.",
    href: "/admin/lms-cbt/ujian",
    icon: MonitorPlay,
    tone: "indigo",
  },
  {
    title: "Kapasitas & Server CBT",
    description: "Pantau kapasitas, koneksi, dan kondisi server CBT.",
    href: "/admin/lms-cbt/server",
    icon: Server,
    tone: "emerald",
  },
];

const RECENT_MATERIALS = [
  {
    title: "Persamaan Kuadrat",
    subject: "Matematika",
    teacher: "Budi Santoso",
    type: "Modul Ajar",
    updated: "Hari ini, 08:30",
    color: "blue",
  },
  {
    title: "Sistem Pernapasan Manusia",
    subject: "IPA",
    teacher: "Dewi Lestari",
    type: "Materi",
    updated: "Hari ini, 07:45",
    color: "emerald",
  },
  {
    title: "Teks Eksplanasi",
    subject: "Bahasa Indonesia",
    teacher: "Budi Pratama",
    type: "PDF",
    updated: "Kemarin, 15:20",
    color: "rose",
  },
  {
    title: "Daily English Practice",
    subject: "Bahasa Inggris",
    teacher: "Rina Amelia",
    type: "Video",
    updated: "Kemarin, 13:10",
    color: "indigo",
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
    tone: "blue",
  },
  {
    title: "Ujian CBT dipublikasikan",
    detail: "Penilaian Tengah Semester · Kelas 9",
    time: "24 menit lalu",
    icon: MonitorPlay,
    tone: "indigo",
  },
  {
    title: "32 siswa mengumpulkan tugas",
    detail: "Latihan Persamaan Kuadrat",
    time: "1 jam lalu",
    icon: ClipboardCheck,
    tone: "emerald",
  },
  {
    title: "Modul ajar diperbarui",
    detail: "Sistem Pernapasan Manusia",
    time: "2 jam lalu",
    icon: FileText,
    tone: "violet",
  },
];

const toneMap = {
  blue: {
    iconBg: "bg-blue-50",
    iconText: "text-[#155DFC]",
    soft: "bg-blue-50/70",
    border: "border-blue-100",
  },
  violet: {
    iconBg: "bg-violet-50",
    iconText: "text-violet-600",
    soft: "bg-violet-50/70",
    border: "border-violet-100",
  },
  indigo: {
    iconBg: "bg-indigo-50",
    iconText: "text-indigo-600",
    soft: "bg-indigo-50/70",
    border: "border-indigo-100",
  },
  emerald: {
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-600",
    soft: "bg-emerald-50/70",
    border: "border-emerald-100",
  },
  rose: {
    iconBg: "bg-rose-50",
    iconText: "text-rose-600",
    soft: "bg-rose-50/70",
    border: "border-rose-100",
  },
};

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  tone = "blue",
  href,
}) {
  const theme = toneMap[tone] || toneMap.blue;

  const content = (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_14px_40px_rgba(37,99,235,0.09)]">
      <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-blue-50/50 transition-transform duration-500 group-hover:scale-150" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>

          <div className="mt-2 flex items-end gap-2">
            <p className="text-3xl font-bold tracking-tight text-slate-900">
              {value}
            </p>
          </div>

          <p className="mt-1.5 text-xs text-slate-500">{description}</p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${theme.iconBg} ${theme.iconText}`}
        >
          <Icon size={21} strokeWidth={1.9} />
        </div>
      </div>

      {href && (
        <div className="relative mt-4 flex items-center gap-1 text-xs font-semibold text-[#155DFC]">
          Lihat detail
          <ArrowUpRight
            size={14}
            className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </div>
      )}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function SectionHeader({ eyebrow, title, description, href, action }) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#155DFC]">
            {eyebrow}
          </p>
        )}

        <h2 className="text-lg font-bold tracking-tight text-slate-900">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>

      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#155DFC] transition hover:text-[#0D47C9]"
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
      PENDING_TASKS.reduce((sum, item) => sum + item.collected, 0),
    []
  );

  const totalTask = useMemo(
    () => PENDING_TASKS.reduce((sum, item) => sum + item.total, 0),
    []
  );

  const taskProgress = totalTask
    ? Math.round((totalCollected / totalTask) * 100)
    : 0;

  return (
    <div className="flex h-screen min-h-0 overflow-hidden bg-[#F8FAFC]">
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
            {/* HERO */}
            <section className="relative mb-6 overflow-hidden rounded-[28px] bg-[#071A3A] shadow-[0_20px_55px_rgba(15,23,42,0.14)]">
              {/* Decorative background */}
              <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-[#2563EB]/25 blur-3xl" />
              <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-indigo-500/15 blur-3xl" />

              <div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
                  backgroundSize: "34px 34px",
                }}
              />

              <div className="relative grid gap-7 px-6 py-7 sm:px-8 sm:py-8 lg:grid-cols-[1fr_390px] lg:px-10 lg:py-9">
                <div className="flex flex-col justify-center">
                  <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100 backdrop-blur-md">
                    <Sparkles size={13} />
                    Pusat Pembelajaran Digital
                  </div>

                  <h1 className="max-w-2xl text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-[38px] lg:leading-tight">
                    LMS & CBT Sekolah
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100/75 sm:text-[15px]">
                    Kelola seluruh aktivitas pembelajaran digital, materi,
                    tugas, ujian CBT, hingga infrastruktur server dari satu
                    tempat.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href="/admin/lms-cbt/materi"
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#0D47C9] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-blue-50"
                    >
                      <BookOpen size={17} />
                      Kelola Materi
                    </Link>

                    <Link
                      href="/admin/lms-cbt/ujian"
                      className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/15"
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
                      <p className="text-xs font-medium text-blue-100/60">
                        Status Sistem
                      </p>
                      <p className="mt-1 text-lg font-bold text-white">
                        Semua layanan aktif
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
                      <ShieldCheck size={20} />
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between rounded-xl bg-white/[0.06] px-3.5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]" />
                        <span className="text-sm text-blue-50">
                          LMS Platform
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-emerald-300">
                        Online
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-white/[0.06] px-3.5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]" />
                        <span className="text-sm text-blue-50">
                          CBT Server
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-emerald-300">
                        Normal
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-white/[0.06] px-3.5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]" />
                        <span className="text-sm text-blue-50">
                          Database
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-emerald-300">
                        Normal
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* QUICK MODULES */}
            <section className="mb-7">
              <SectionHeader
                eyebrow="LMS & CBT"
                title="Modul utama"
                description="Akses cepat untuk pengelolaan pembelajaran digital."
              />

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {LMS_MENU.map((item) => {
                  const Icon = item.icon;
                  const theme = toneMap[item.tone];

                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_45px_rgba(37,99,235,0.09)]"
                    >
                      <div className="absolute right-0 top-0 h-24 w-24 translate-x-10 -translate-y-10 rounded-full bg-blue-50/70 transition-transform duration-500 group-hover:scale-150" />

                      <div className="relative">
                        <div className="flex items-start justify-between">
                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-xl ${theme.iconBg} ${theme.iconText}`}
                          >
                            <Icon size={21} strokeWidth={1.8} />
                          </div>

                          <ArrowUpRight
                            size={17}
                            className="text-slate-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#155DFC]"
                          />
                        </div>

                        <h3 className="mt-5 text-[15px] font-bold text-slate-900">
                          {item.title}
                        </h3>

                        <p className="mt-1.5 min-h-[40px] text-xs leading-5 text-slate-500">
                          {item.description}
                        </p>

                        <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#155DFC]">
                          Buka modul
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* STATS */}
            <section className="mb-7">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Materi & Modul"
                  value="128"
                  description="Materi aktif tersedia"
                  icon={BookOpen}
                  tone="blue"
                  href="/admin/lms-cbt/materi"
                />

                <StatCard
                  label="Tugas Siswa"
                  value="46"
                  description="Tugas aktif minggu ini"
                  icon={ClipboardCheck}
                  tone="violet"
                  href="/admin/lms-cbt/tugas"
                />

                <StatCard
                  label="Ujian CBT"
                  value="12"
                  description="Ujian terjadwal"
                  icon={MonitorPlay}
                  tone="indigo"
                  href="/admin/lms-cbt/ujian"
                />

                <StatCard
                  label="Peserta Aktif"
                  value="684"
                  description="Siswa menggunakan LMS"
                  icon={Users}
                  tone="emerald"
                />
              </div>
            </section>

            {/* OVERVIEW GRID */}
            <section className="mb-7 grid gap-5 xl:grid-cols-[1.45fr_.8fr]">
              {/* LMS ACTIVITY */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#155DFC]">
                      Aktivitas LMS
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-slate-900">
                      Aktivitas pembelajaran
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Ringkasan aktivitas siswa dan guru pada LMS.
                    </p>
                  </div>

                  <div className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-semibold text-[#155DFC]">
                    Minggu ini
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">
                        Materi dipelajari
                      </span>
                      <BookOpen size={16} className="text-[#155DFC]" />
                    </div>

                    <p className="mt-3 text-2xl font-bold text-slate-900">
                      842
                    </p>

                    <p className="mt-1 text-xs text-emerald-600">
                      +12,8% dari minggu lalu
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">
                        Tugas terkumpul
                      </span>
                      <BookOpenCheck
                        size={16}
                        className="text-violet-600"
                      />
                    </div>

                    <p className="mt-3 text-2xl font-bold text-slate-900">
                      {totalCollected}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      dari {totalTask} pengumpulan
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">
                        Rata-rata progres
                      </span>
                      <Target size={16} className="text-emerald-600" />
                    </div>

                    <p className="mt-3 text-2xl font-bold text-slate-900">
                      87%
                    </p>

                    <p className="mt-1 text-xs text-emerald-600">
                      Aktivitas belajar siswa
                    </p>
                  </div>
                </div>

                {/* PROGRESS */}
                <div className="mt-6 rounded-xl border border-slate-200/80 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Pengumpulan tugas
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Persentase tugas yang sudah dikumpulkan siswa.
                      </p>
                    </div>

                    <span className="text-sm font-bold text-[#155DFC]">
                      {taskProgress}%
                    </span>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#155DFC] to-[#60A5FA] transition-all duration-700"
                      style={{ width: `${taskProgress}%` }}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{totalCollected} sudah dikumpulkan</span>
                    <span>{totalTask - totalCollected} belum</span>
                  </div>
                </div>
              </div>

              {/* SERVER */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] sm:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-600">
                      Infrastruktur
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-slate-900">
                      CBT Server
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Kondisi server saat ini.
                    </p>
                  </div>

                  <Link
                    href="/admin/lms-cbt/server"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-500 transition hover:bg-blue-50 hover:text-[#155DFC]"
                  >
                    <Settings2 size={17} />
                  </Link>
                </div>

                <div className="mt-5 rounded-2xl bg-[#F8FAFC] p-5">
                  <div className="flex items-center gap-4">
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                      <Server size={25} />
                      <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
                    </div>

                    <div>
                      <p className="text-base font-bold text-slate-900">
                        Server Normal
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Semua layanan CBT berjalan baik
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white p-3.5">
                      <p className="text-[11px] text-slate-400">
                        CPU Usage
                      </p>
                      <p className="mt-1 text-lg font-bold text-slate-900">
                        34%
                      </p>
                    </div>

                    <div className="rounded-xl bg-white p-3.5">
                      <p className="text-[11px] text-slate-400">
                        Memory
                      </p>
                      <p className="mt-1 text-lg font-bold text-slate-900">
                        48%
                      </p>
                    </div>

                    <div className="rounded-xl bg-white p-3.5">
                      <p className="text-[11px] text-slate-400">
                        Peserta Online
                      </p>
                      <p className="mt-1 text-lg font-bold text-slate-900">
                        96
                      </p>
                    </div>

                    <div className="rounded-xl bg-white p-3.5">
                      <p className="text-[11px] text-slate-400">
                        Response
                      </p>
                      <p className="mt-1 text-lg font-bold text-slate-900">
                        42ms
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/admin/lms-cbt/server"
                    className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#155DFC]"
                  >
                    <Wifi size={15} />
                    Lihat monitoring server
                  </Link>
                </div>
              </div>
            </section>

            {/* CONTENT GRID */}
            <section className="mb-7 grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
              {/* MATERIAL */}
              <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.035)]">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Materi terbaru
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Materi yang baru ditambahkan oleh guru.
                    </p>
                  </div>

                  <Link
                    href="/admin/lms-cbt/materi"
                    className="text-xs font-semibold text-[#155DFC]"
                  >
                    Semua materi
                  </Link>
                </div>

                <div className="divide-y divide-slate-100">
                  {RECENT_MATERIALS.map((item) => {
                    const theme = toneMap[item.color];
                    const Icon =
                      item.type === "Video" ? MonitorPlay : FileText;

                    return (
                      <div
                        key={item.title}
                        className="group flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50/70 sm:px-6"
                      >
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${theme.iconBg} ${theme.iconText}`}
                        >
                          <Icon size={19} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {item.title}
                          </p>

                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                            <span>{item.subject}</span>
                            <span className="text-slate-300">•</span>
                            <span>{item.teacher}</span>
                          </div>
                        </div>

                        <div className="hidden text-right sm:block">
                          <p className="text-[11px] font-medium text-slate-400">
                            {item.type}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-400">
                            {item.updated}
                          </p>
                        </div>

                        <ChevronRight
                          size={16}
                          className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#155DFC]"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* TASK */}
              <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.035)]">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Tugas perlu diperiksa
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Ringkasan pengumpulan tugas terbaru.
                    </p>
                  </div>

                  <Link
                    href="/admin/lms-cbt/tugas"
                    className="text-xs font-semibold text-[#155DFC]"
                  >
                    Lihat tugas
                  </Link>
                </div>

                <div className="divide-y divide-slate-100">
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
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {item.title}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {item.subject} · {item.className}
                            </p>
                          </div>

                          <span className="shrink-0 rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-bold text-[#155DFC]">
                            {item.deadline}
                          </span>
                        </div>

                        <div className="mt-3">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">
                              Pengumpulan
                            </span>

                            <span className="font-semibold text-slate-600">
                              {item.collected}/{item.total}
                            </span>
                          </div>

                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-[#155DFC]"
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

            {/* CBT SCHEDULE + ACTIVITY */}
            <section className="mb-7 grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
              {/* CBT */}
              <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.035)]">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Jadwal CBT
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Ujian CBT yang sedang dan akan berlangsung.
                    </p>
                  </div>

                  <Link
                    href="/admin/lms-cbt/ujian"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#155DFC]"
                  >
                    Kelola
                    <ChevronRight size={14} />
                  </Link>
                </div>

                <div className="divide-y divide-slate-100">
                  {CBT_SCHEDULE.map((item, index) => (
                    <div
                      key={`${item.title}-${index}`}
                      className="group flex gap-4 px-5 py-4 transition hover:bg-slate-50/70 sm:px-6"
                    >
                      <div className="hidden w-14 shrink-0 sm:block">
                        <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-blue-50 text-[#155DFC]">
                          <CalendarDays size={16} />
                          <span className="mt-0.5 text-[9px] font-bold uppercase">
                            Sep
                          </span>
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-800">
                            {item.title}
                          </p>

                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                              item.status === "Berlangsung"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-blue-50 text-[#155DFC]"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                          {item.subject} · {item.className}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
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
                        className="hidden h-8 w-8 shrink-0 items-center justify-center self-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-[#155DFC] sm:flex"
                      >
                        <MoreHorizontal size={17} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ACTIVITY */}
              <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.035)]">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Aktivitas terbaru
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Aktivitas terakhir pada LMS & CBT.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition hover:bg-blue-50 hover:text-[#155DFC]"
                    title="Refresh"
                  >
                    <RefreshCw size={15} />
                  </button>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="relative">
                    <div className="absolute bottom-5 left-[17px] top-5 w-px bg-slate-100" />

                    <div className="space-y-5">
                      {ACTIVITY_DATA.map((item) => {
                        const theme = toneMap[item.tone];
                        const Icon = item.icon;

                        return (
                          <div
                            key={item.title}
                            className="relative flex gap-3"
                          >
                            <div
                              className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${theme.iconBg} ${theme.iconText} ring-4 ring-white`}
                            >
                              <Icon size={16} />
                            </div>

                            <div className="min-w-0 pt-0.5">
                              <p className="text-xs font-semibold leading-5 text-slate-800">
                                {item.title}
                              </p>

                              <p className="mt-0.5 truncate text-[11px] text-slate-500">
                                {item.detail}
                              </p>

                              <p className="mt-1 text-[10px] text-slate-400">
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

            {/* QUICK ACTION */}
            <section className="mb-7">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#155DFC]">
                      Aksi cepat
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-slate-900">
                      Kelola pembelajaran sekolah
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Gunakan akses cepat untuk membuat dan mengelola konten
                      LMS maupun ujian CBT.
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

                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() => setActiveQuickAction(item.label)}
                          className={`group flex min-w-[125px] items-center gap-2 rounded-xl border px-3 py-3 text-xs font-semibold transition ${
                            activeQuickAction === item.label
                              ? "border-blue-200 bg-blue-50 text-[#155DFC]"
                              : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-[#155DFC]"
                          }`}
                        >
                          <Icon size={16} />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* FOOTER INFO */}
            <div className="flex flex-col gap-3 border-t border-slate-200/70 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
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
                    className="text-emerald-500"
                  />
                  LMS Online
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2
                    size={13}
                    className="text-emerald-500"
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