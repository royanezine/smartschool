"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";

import {
  ArrowUpRight,
  Award,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  LayoutGrid,
  MoreHorizontal,
  PenLine,
  Printer,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";

/* =========================================================
   DATA
========================================================= */

const QUICK_MODULES = [
  {
    title: "Entry Nilai",
    description:
      "Kelola dan input nilai siswa berdasarkan mata pelajaran.",
    href: "/admin/eraport/entry-nilai",
    icon: PenLine,
    tone: "blue",
  },
  {
    title: "Cetak Raport",
    description:
      "Preview dan cetak raport siswa secara terstruktur.",
    href: "/admin/eraport/cetak-raport",
    icon: Printer,
    tone: "violet",
  },
  {
    title: "Pengaturan Agregat Nilai",
    description:
      "Atur bobot dan perhitungan nilai akhir raport.",
    href: "/admin/eraport/pengaturan-agregat",
    icon: Settings2,
    tone: "indigo",
  },
];

const CLASS_PROGRESS = [
  {
    kelas: "Kelas 7A",
    tingkat: "VII",
    siswa: 32,
    nilai: 94,
    raport: 88,
    status: "Hampir selesai",
  },
  {
    kelas: "Kelas 7B",
    tingkat: "VII",
    siswa: 30,
    nilai: 87,
    raport: 81,
    status: "Berjalan",
  },
  {
    kelas: "Kelas 8A",
    tingkat: "VIII",
    siswa: 31,
    nilai: 96,
    raport: 92,
    status: "Hampir selesai",
  },
  {
    kelas: "Kelas 8B",
    tingkat: "VIII",
    siswa: 29,
    nilai: 78,
    raport: 70,
    status: "Perlu perhatian",
  },
  {
    kelas: "Kelas 9A",
    tingkat: "IX",
    siswa: 32,
    nilai: 98,
    raport: 95,
    status: "Selesai",
  },
  {
    kelas: "Kelas 9B",
    tingkat: "IX",
    siswa: 31,
    nilai: 91,
    raport: 87,
    status: "Hampir selesai",
  },
];

const RECENT_ACTIVITY = [
  {
    title: "Entry nilai diperbarui",
    detail: "Matematika · Kelas 9A",
    user: "Budi Santoso",
    time: "8 menit lalu",
    icon: PenLine,
    tone: "blue",
  },
  {
    title: "Raport berhasil diproses",
    detail: "32 siswa · Kelas 9A",
    user: "Admin Sekolah",
    time: "24 menit lalu",
    icon: FileCheck2,
    tone: "emerald",
  },
  {
    title: "Pengaturan agregat diperbarui",
    detail: "Semester Ganjil 2026/2027",
    user: "Admin Sekolah",
    time: "1 jam lalu",
    icon: Settings2,
    tone: "violet",
  },
  {
    title: "Entry nilai baru",
    detail: "Bahasa Inggris · Kelas 8A",
    user: "Rina Amelia",
    time: "2 jam lalu",
    icon: BookOpen,
    tone: "indigo",
  },
];

const SUBJECT_PROGRESS = [
  {
    subject: "Matematika",
    teacher: "Budi Santoso",
    progress: 96,
    students: 184,
  },
  {
    subject: "Bahasa Indonesia",
    teacher: "Siti Rahma",
    progress: 91,
    students: 184,
  },
  {
    subject: "IPA",
    teacher: "Dewi Lestari",
    progress: 88,
    students: 184,
  },
  {
    subject: "Bahasa Inggris",
    teacher: "Rina Amelia",
    progress: 83,
    students: 184,
  },
  {
    subject: "IPS",
    teacher: "Anwar Hidayat",
    progress: 76,
    students: 184,
  },
];

const RAPORT_STATUS = [
  {
    label: "Sudah lengkap",
    value: 428,
    percentage: 78,
    tone: "emerald",
  },
  {
    label: "Sedang diproses",
    value: 82,
    percentage: 15,
    tone: "blue",
  },
  {
    label: "Belum lengkap",
    value: 38,
    percentage: 7,
    tone: "amber",
  },
];

/* =========================================================
   THEME MAP
========================================================= */

const toneMap = {
  blue: {
    iconBg: "theme-info",
    iconText: "text-[var(--color-info)]",
    border: "theme-border",
    soft: "theme-card-soft",
    bar: "bg-[var(--color-primary)]",
  },

  violet: {
    iconBg: "theme-card-soft",
    iconText: "text-[var(--color-primary)]",
    border: "theme-border",
    soft: "theme-card-soft",
    bar: "bg-[var(--color-primary)]",
  },

  indigo: {
    iconBg: "theme-card-soft",
    iconText: "text-[var(--color-primary)]",
    border: "theme-border",
    soft: "theme-card-soft",
    bar: "bg-[var(--color-primary)]",
  },

  emerald: {
    iconBg: "theme-success",
    iconText: "text-[var(--color-success)]",
    border: "theme-border",
    soft: "theme-card-soft",
    bar: "bg-[var(--color-success)]",
  },

  amber: {
    iconBg: "theme-warning",
    iconText: "text-[var(--color-warning)]",
    border: "theme-border",
    soft: "theme-card-soft",
    bar: "bg-[var(--color-warning)]",
  },
};

/* =========================================================
   COMPONENTS
========================================================= */

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
    <div
      className="
        group relative overflow-hidden rounded-2xl
        border theme-border theme-card
        p-5 shadow-md
        transition-all duration-300
        hover:-translate-y-0.5
        hover:border-[var(--color-primary)]
        hover:shadow-lg
      "
    >
      <div
        className="
          absolute -right-7 -top-7
          h-24 w-24 rounded-full
          bg-[var(--color-primary)]
          opacity-[0.05]
          transition-transform duration-500
          group-hover:scale-150
        "
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium theme-text-muted">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight theme-text">
            {value}
          </p>

          <p className="mt-1.5 text-xs theme-text-muted">
            {description}
          </p>

          {href && (
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)]">
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

        <div
          className={`
            flex h-11 w-11 shrink-0 items-center
            justify-center rounded-xl
            ${theme.iconBg}
            ${theme.iconText}
          `}
        >
          <Icon size={21} strokeWidth={1.8} />
        </div>
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  action = "Lihat semua",
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
            {eyebrow}
          </p>
        )}

        <h2 className="text-lg font-bold tracking-tight theme-text">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm theme-text-muted">
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
            hover:text-[var(--color-primary-hover)]
          "
        >
          {action}
          <ChevronRight size={16} />
        </Link>
      )}
    </div>
  );
}

function ProgressBar({ value, tone = "blue" }) {
  const bar =
    tone === "emerald"
      ? "bg-[var(--color-success)]"
      : tone === "amber"
      ? "bg-[var(--color-warning)]"
      : "bg-[var(--color-primary)]";

  return (
    <div className="theme-card-soft h-2 overflow-hidden rounded-full">
      <div
        className={`
          h-full rounded-full
          ${bar}
          transition-all duration-700
        `}
        style={{
          width: `${Math.min(Math.max(value, 0), 100)}%`,
        }}
      />
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function ERaportPage() {
  const [activeView, setActiveView] = useState("ringkasan");

  const totalSiswa = useMemo(
    () =>
      CLASS_PROGRESS.reduce(
        (sum, item) => sum + item.siswa,
        0
      ),
    []
  );

  const averageNilai = useMemo(
    () =>
      Math.round(
        CLASS_PROGRESS.reduce(
          (sum, item) => sum + item.nilai,
          0
        ) / CLASS_PROGRESS.length
      ),
    []
  );

  const averageRaport = useMemo(
    () =>
      Math.round(
        CLASS_PROGRESS.reduce(
          (sum, item) => sum + item.raport,
          0
        ) / CLASS_PROGRESS.length
      ),
    []
  );

  return (
    <div className="theme-page flex h-screen min-h-0 overflow-hidden">
      <Sidebar
        role="admin"
        active="eraport"
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

            {/* =====================================================
                HERO
            ====================================================== */}

            <section
              className="
                relative mb-6 overflow-hidden
                rounded-[28px]
                border theme-border
                theme-sidebar
                shadow-lg
              "
            >
              <div
                className="
                  absolute -right-24 -top-28
                  h-80 w-80 rounded-full
                  bg-[var(--color-primary)]
                  opacity-[0.12]
                  blur-3xl
                "
              />

              <div
                className="
                  absolute -bottom-40 left-1/3
                  h-96 w-96 rounded-full
                  bg-[var(--color-info)]
                  opacity-[0.08]
                  blur-3xl
                "
              />

              <div
                className="absolute inset-0 opacity-[0.05]"
                style={{
                  backgroundImage:
                    "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
                  backgroundSize: "34px 34px",
                }}
              />

              <div className="relative grid gap-8 px-6 py-7 sm:px-8 sm:py-8 lg:grid-cols-[1fr_390px] lg:px-10 lg:py-9">

                {/* HERO CONTENT */}

                <div className="flex flex-col justify-center">
                  <div
                    className="
                      mb-4 inline-flex w-fit items-center gap-2
                      rounded-full border theme-border
                      theme-card-soft
                      px-3 py-1.5
                      text-xs font-semibold
                      theme-text-secondary
                    "
                  >
                    <Sparkles size={13} />
                    Akademik · E-Raport
                  </div>

                  <h1
                    className="
                      max-w-2xl
                      text-2xl font-bold tracking-tight
                      theme-text
                      sm:text-3xl
                      lg:text-[38px]
                      lg:leading-tight
                    "
                  >
                    Kelola E-Raport Sekolah
                  </h1>

                  <p
                    className="
                      mt-3 max-w-2xl
                      text-sm leading-6
                      theme-text-secondary
                      sm:text-[15px]
                    "
                  >
                    Pantau pengisian nilai, kelengkapan raport,
                    proses agregasi, dan pencetakan raport siswa
                    dalam satu dashboard akademik.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href="/admin/eraport/entry-nilai"
                      className="
                        theme-primary
                        inline-flex items-center gap-2
                        rounded-xl
                        px-4 py-2.5
                        text-sm font-semibold
                        shadow-md
                        transition
                        hover:-translate-y-0.5
                      "
                    >
                      <PenLine size={17} />
                      Entry Nilai
                    </Link>

                    <Link
                      href="/admin/eraport/cetak-raport"
                      className="
                        theme-card
                        theme-sidebar-hover
                        inline-flex items-center gap-2
                        rounded-xl
                        border theme-border
                        px-4 py-2.5
                        text-sm font-semibold
                        theme-text-secondary
                        transition
                        hover:border-[var(--color-primary)]
                        hover:text-[var(--color-primary)]
                      "
                    >
                      <Printer size={17} />
                      Cetak Raport
                    </Link>
                  </div>
                </div>

                {/* HERO SIDE */}

                <div
                  className="
                    rounded-2xl
                    border theme-border
                    theme-card-soft
                    p-5
                  "
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium theme-text-muted">
                        Tahun Ajaran
                      </p>

                      <p className="mt-1 text-lg font-bold theme-text">
                        2026/2027
                      </p>

                      <p className="mt-1 text-xs theme-text-muted">
                        Semester Ganjil
                      </p>
                    </div>

                    <div
                      className="
                        flex h-10 w-10 items-center
                        justify-center rounded-xl
                        theme-info
                      "
                    >
                      <CalendarDays size={20} />
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl theme-card p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs theme-text-muted">
                          Kelengkapan Raport
                        </p>

                        <p className="mt-1 text-2xl font-bold theme-text">
                          {averageRaport}%
                        </p>
                      </div>

                      <div
                        className="
                          flex h-12 w-12 items-center
                          justify-center rounded-full
                          border-4
                          border-[var(--color-success)]
                          border-opacity-20
                        "
                      >
                        <CheckCircle2
                          size={22}
                          className="text-[var(--color-success)]"
                        />
                      </div>
                    </div>

                    <div className="theme-card-soft mt-4 h-2 overflow-hidden rounded-full">
                      <div
                        className="
                          h-full rounded-full
                          bg-[var(--color-success)]
                          transition-all duration-700
                        "
                        style={{
                          width: `${averageRaport}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* =====================================================
                QUICK MODULE
            ====================================================== */}

            <section className="mb-7">
              <SectionHeader
                eyebrow="E-RAPORT"
                title="Modul utama"
                description="Akses cepat ke seluruh pengelolaan E-Raport."
              />

              <div className="grid gap-4 md:grid-cols-3">
                {QUICK_MODULES.map((item) => {
                  const Icon = item.icon;
                  const theme =
                    toneMap[item.tone] || toneMap.blue;

                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="
                        group relative overflow-hidden
                        rounded-2xl
                        border theme-border
                        theme-card
                        p-5
                        shadow-md
                        transition-all duration-300
                        hover:-translate-y-1
                        hover:border-[var(--color-primary)]
                        hover:shadow-lg
                      "
                    >
                      <div
                        className="
                          absolute right-0 top-0
                          h-28 w-28
                          translate-x-10
                          -translate-y-10
                          rounded-full
                          bg-[var(--color-primary)]
                          opacity-[0.05]
                          transition-transform duration-500
                          group-hover:scale-150
                        "
                      />

                      <div className="relative">
                        <div className="flex items-start justify-between">
                          <div
                            className={`
                              flex h-11 w-11
                              items-center justify-center
                              rounded-xl
                              ${theme.iconBg}
                              ${theme.iconText}
                            `}
                          >
                            <Icon
                              size={21}
                              strokeWidth={1.8}
                            />
                          </div>

                          <ArrowUpRight
                            size={17}
                            className="
                              theme-text-placeholder
                              transition-all
                              group-hover:-translate-y-0.5
                              group-hover:translate-x-0.5
                              group-hover:text-[var(--color-primary)]
                            "
                          />
                        </div>

                        <h3 className="mt-5 text-[15px] font-bold theme-text">
                          {item.title}
                        </h3>

                        <p className="mt-1.5 min-h-[40px] text-xs leading-5 theme-text-muted">
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

            {/* =====================================================
                STATISTICS
            ====================================================== */}

            <section className="mb-7">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Total Siswa"
                  value={totalSiswa}
                  description="Siswa dalam periode aktif"
                  icon={Users}
                  tone="blue"
                />

                <StatCard
                  label="Nilai Terisi"
                  value={`${averageNilai}%`}
                  description="Rata-rata kelengkapan nilai"
                  icon={FileSpreadsheet}
                  tone="violet"
                  href="/admin/eraport/entry-nilai"
                />

                <StatCard
                  label="Raport Lengkap"
                  value="428"
                  description="Raport siap diproses"
                  icon={FileCheck2}
                  tone="emerald"
                  href="/admin/eraport/cetak-raport"
                />

                <StatCard
                  label="Belum Lengkap"
                  value="38"
                  description="Perlu ditindaklanjuti"
                  icon={XCircle}
                  tone="amber"
                />
              </div>
            </section>

            {/* =====================================================
                OVERVIEW
            ====================================================== */}

            <section className="mb-7 grid gap-5 xl:grid-cols-[1.3fr_.7fr]">

              {/* CLASS PROGRESS */}

              <div
                className="
                  rounded-2xl
                  border theme-border
                  theme-card
                  shadow-md
                "
              >
                <div
                  className="
                    flex flex-col gap-4
                    border-b theme-border
                    px-5 py-5
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                    sm:px-6
                  "
                >
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                      Monitoring
                    </p>

                    <h2 className="mt-1 text-lg font-bold theme-text">
                      Progres E-Raport per kelas
                    </h2>

                    <p className="mt-1 text-sm theme-text-muted">
                      Pantau kelengkapan nilai dan raport setiap kelas.
                    </p>
                  </div>

                  <div className="theme-card-soft flex items-center gap-1 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveView("ringkasan")
                      }
                      className={`
                        rounded-lg px-3 py-2
                        text-xs font-semibold
                        transition
                        ${
                          activeView === "ringkasan"
                            ? "theme-card text-[var(--color-primary)] shadow-sm"
                            : "theme-text-muted hover:text-[var(--color-text)]"
                        }
                      `}
                    >
                      Ringkasan
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setActiveView("detail")
                      }
                      className={`
                        rounded-lg px-3 py-2
                        text-xs font-semibold
                        transition
                        ${
                          activeView === "detail"
                            ? "theme-card text-[var(--color-primary)] shadow-sm"
                            : "theme-text-muted hover:text-[var(--color-text)]"
                        }
                      `}
                    >
                      Detail
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px]">
                    <thead>
                      <tr className="theme-table-header border-b theme-border">
                        <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider">
                          Kelas
                        </th>

                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">
                          Siswa
                        </th>

                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">
                          Nilai
                        </th>

                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">
                          Raport
                        </th>

                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">
                          Status
                        </th>

                        <th className="px-6 py-3 text-right text-[11px] font-bold uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[var(--color-border-soft)]">
                      {CLASS_PROGRESS.map((item) => (
                        <tr
                          key={item.kelas}
                          className="
                            group
                            transition
                            theme-table-hover
                          "
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="
                                  theme-info
                                  flex h-9 w-9
                                  items-center justify-center
                                  rounded-lg
                                  text-xs font-bold
                                "
                              >
                                {item.tingkat}
                              </div>

                              <div>
                                <p className="text-sm font-semibold theme-text">
                                  {item.kelas}
                                </p>

                                <p className="mt-0.5 text-[11px] theme-text-placeholder">
                                  Semester Ganjil
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span className="text-sm font-semibold theme-text-secondary">
                              {item.siswa}
                            </span>
                          </td>

                          <td className="w-[150px] px-4 py-4">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold theme-text-secondary">
                                {item.nilai}%
                              </span>
                            </div>

                            <div className="mt-2">
                              <ProgressBar
                                value={item.nilai}
                                tone={
                                  item.nilai >= 90
                                    ? "emerald"
                                    : item.nilai >= 80
                                    ? "blue"
                                    : "amber"
                                }
                              />
                            </div>
                          </td>

                          <td className="w-[150px] px-4 py-4">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold theme-text-secondary">
                                {item.raport}%
                              </span>
                            </div>

                            <div className="mt-2">
                              <ProgressBar
                                value={item.raport}
                                tone={
                                  item.raport >= 90
                                    ? "emerald"
                                    : item.raport >= 80
                                    ? "blue"
                                    : "amber"
                                }
                              />
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={`
                                inline-flex rounded-full
                                px-2.5 py-1
                                text-[10px] font-bold
                                ${
                                  item.status === "Selesai"
                                    ? "theme-success"
                                    : item.status ===
                                      "Hampir selesai"
                                    ? "theme-info"
                                    : item.status ===
                                      "Berjalan"
                                    ? "theme-card-soft text-[var(--color-primary)]"
                                    : "theme-warning"
                                }
                              `}
                            >
                              {item.status}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <Link
                              href="/admin/eraport/entry-nilai"
                              className="
                                theme-text-muted
                                theme-sidebar-hover
                                inline-flex h-8 w-8
                                items-center justify-center
                                rounded-lg
                                transition
                                hover:text-[var(--color-primary)]
                              "
                            >
                              <ChevronRight size={16} />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {activeView === "detail" && (
                  <div className="theme-card-soft border-t theme-border px-5 py-4 sm:px-6">
                    <div className="flex items-start gap-3">
                      <div className="theme-info flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                        <BarChart3 size={17} />
                      </div>

                      <div>
                        <p className="text-xs font-semibold theme-text">
                          Insight E-Raport
                        </p>

                        <p className="mt-1 text-xs leading-5 theme-text-secondary">
                          Kelas 9 memiliki tingkat kelengkapan
                          raport paling tinggi. Kelas 8B masih
                          membutuhkan perhatian karena progres
                          pengisian nilai berada di bawah kelas
                          lainnya.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* RAPORT STATUS */}

              <div
                className="
                  rounded-2xl
                  border theme-border
                  theme-card
                  p-5
                  shadow-md
                  sm:p-6
                "
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                      Status
                    </p>

                    <h2 className="mt-1 text-lg font-bold theme-text">
                      Status raport
                    </h2>

                    <p className="mt-1 text-sm theme-text-muted">
                      Distribusi kelengkapan raport siswa.
                    </p>
                  </div>

                  <div className="theme-info flex h-10 w-10 items-center justify-center rounded-xl">
                    <FileText size={19} />
                  </div>
                </div>

                <div className="mt-7 flex justify-center">
                  <div
                    className="
                      relative flex h-44 w-44
                      items-center justify-center
                      rounded-full
                      border-[18px]
                      border-[var(--color-success)]
                      border-opacity-20
                    "
                  >
                    <div
                      className="
                        absolute inset-[-18px]
                        rounded-full
                        border-[18px]
                        border-transparent
                        border-t-[var(--color-primary)]
                        border-r-[var(--color-primary)]
                        rotate-[-35deg]
                      "
                    />

                    <div className="text-center">
                      <p className="text-3xl font-bold theme-text">
                        78%
                      </p>

                      <p className="mt-1 text-[11px] font-medium theme-text-placeholder">
                        Lengkap
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-7 space-y-4">
                  {RAPORT_STATUS.map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`
                              h-2.5 w-2.5 rounded-full
                              ${
                                item.tone === "emerald"
                                  ? "bg-[var(--color-success)]"
                                  : item.tone === "blue"
                                  ? "bg-[var(--color-primary)]"
                                  : "bg-[var(--color-warning)]"
                              }
                            `}
                          />

                          <span className="text-xs font-medium theme-text-secondary">
                            {item.label}
                          </span>
                        </div>

                        <span className="text-xs font-bold theme-text">
                          {item.value}
                        </span>
                      </div>

                      <div className="theme-card-soft mt-2 h-1.5 overflow-hidden rounded-full">
                        <div
                          className={`
                            h-full rounded-full
                            ${
                              item.tone === "emerald"
                                ? "bg-[var(--color-success)]"
                                : item.tone === "blue"
                                ? "bg-[var(--color-primary)]"
                                : "bg-[var(--color-warning)]"
                            }
                          `}
                          style={{
                            width: `${item.percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/admin/eraport/cetak-raport"
                  className="
                    theme-card
                    theme-sidebar-hover
                    mt-6 flex items-center justify-center
                    gap-2 rounded-xl
                    border theme-border
                    px-4 py-2.5
                    text-xs font-semibold
                    theme-text-secondary
                    transition
                    hover:border-[var(--color-primary)]
                    hover:text-[var(--color-primary)]
                  "
                >
                  <Printer size={15} />
                  Kelola pencetakan raport
                </Link>
              </div>
            </section>

            {/* =====================================================
                SUBJECT + ACTIVITY
            ====================================================== */}

            <section className="mb-7 grid gap-5 xl:grid-cols-[1fr_.85fr]">

              {/* SUBJECT */}

              <div
                className="
                  rounded-2xl
                  border theme-border
                  theme-card
                  shadow-md
                "
              >
                <div className="flex items-center justify-between border-b theme-border px-5 py-4 sm:px-6">
                  <div>
                    <p className="text-sm font-bold theme-text">
                      Progres berdasarkan mata pelajaran
                    </p>

                    <p className="mt-1 text-xs theme-text-muted">
                      Kelengkapan entry nilai dari setiap guru.
                    </p>
                  </div>

                  <Link
                    href="/admin/eraport/entry-nilai"
                    className="text-xs font-semibold text-[var(--color-primary)]"
                  >
                    Entry nilai
                  </Link>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="space-y-5">
                    {SUBJECT_PROGRESS.map((item, index) => (
                      <div key={item.subject}>
                        <div className="flex items-center gap-3">
                          <div
                            className="
                              theme-card-soft
                              theme-text-muted
                              flex h-9 w-9
                              shrink-0 items-center justify-center
                              rounded-lg
                              text-xs font-bold
                            "
                          >
                            {String(index + 1).padStart(2, "0")}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-sm font-semibold theme-text">
                                  {item.subject}
                                </p>

                                <p className="mt-0.5 text-[11px] theme-text-placeholder">
                                  {item.teacher} · {item.students} siswa
                                </p>
                              </div>

                              <span className="text-xs font-bold theme-text-secondary">
                                {item.progress}%
                              </span>
                            </div>

                            <div className="mt-2">
                              <ProgressBar
                                value={item.progress}
                                tone={
                                  item.progress >= 90
                                    ? "emerald"
                                    : item.progress >= 80
                                    ? "blue"
                                    : "amber"
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ACTIVITY */}

              <div
                className="
                  rounded-2xl
                  border theme-border
                  theme-card
                  shadow-md
                "
              >
                <div className="flex items-center justify-between border-b theme-border px-5 py-4 sm:px-6">
                  <div>
                    <p className="text-sm font-bold theme-text">
                      Aktivitas terbaru
                    </p>

                    <p className="mt-1 text-xs theme-text-muted">
                      Aktivitas terakhir pada E-Raport.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="
                      theme-card-soft
                      theme-text-muted
                      theme-sidebar-hover
                      flex h-8 w-8
                      items-center justify-center
                      rounded-lg
                      transition
                      hover:text-[var(--color-primary)]
                    "
                  >
                    <RefreshCw size={15} />
                  </button>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="relative">
                    <div className="absolute bottom-5 left-[17px] top-5 w-px bg-[var(--color-border-soft)]" />

                    <div className="space-y-5">
                      {RECENT_ACTIVITY.map((item) => {
                        const Icon = item.icon;
                        const theme =
                          toneMap[item.tone] ||
                          toneMap.blue;

                        return (
                          <div
                            key={item.title + item.time}
                            className="relative flex gap-3"
                          >
                            <div
                              className={`
                                relative z-10
                                flex h-9 w-9 shrink-0
                                items-center justify-center
                                rounded-xl
                                ${theme.iconBg}
                                ${theme.iconText}
                                ring-4
                                ring-[var(--color-card)]
                              `}
                            >
                              <Icon size={16} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold leading-5 theme-text">
                                {item.title}
                              </p>

                              <p className="mt-0.5 truncate text-[11px] theme-text-muted">
                                {item.detail}
                              </p>

                              <div className="mt-1 flex items-center gap-2 text-[10px] theme-text-placeholder">
                                <span>{item.user}</span>
                                <span>•</span>
                                <span>{item.time}</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              className="
                                theme-text-placeholder
                                theme-sidebar-hover
                                hidden h-7 w-7
                                shrink-0
                                items-center justify-center
                                rounded-lg
                                transition
                                hover:text-[var(--color-text-secondary)]
                                sm:flex
                              "
                            >
                              <MoreHorizontal size={15} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* =====================================================
                QUICK ACTION
            ====================================================== */}

            <section className="mb-7">
              <div
                className="
                  theme-info
                  relative overflow-hidden
                  rounded-2xl
                  border theme-border
                  p-5 sm:p-6
                "
              >
                <div
                  className="
                    absolute -right-16 -top-20
                    h-44 w-44 rounded-full
                    bg-[var(--color-primary)]
                    opacity-[0.10]
                    blur-2xl
                  "
                />

                <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div
                        className="
                          theme-card
                          flex h-9 w-9
                          items-center justify-center
                          rounded-xl
                          text-[var(--color-primary)]
                          shadow-sm
                        "
                      >
                        <GraduationCap size={18} />
                      </div>

                      <p className="text-sm font-bold theme-text">
                        Pengelolaan akademik lebih terarah
                      </p>
                    </div>

                    <p className="mt-2 max-w-2xl text-xs leading-5 theme-text-secondary">
                      Pastikan seluruh nilai telah terisi sebelum
                      proses agregasi dan pencetakan raport dilakukan.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/admin/eraport/entry-nilai"
                      className="
                        theme-primary
                        inline-flex items-center gap-2
                        rounded-xl
                        px-4 py-2.5
                        text-xs font-semibold
                        shadow-sm
                        transition
                      "
                    >
                      <PenLine size={15} />
                      Entry Nilai
                    </Link>

                    <Link
                      href="/admin/eraport/pengaturan-agregat"
                      className="
                        theme-card
                        theme-sidebar-hover
                        inline-flex items-center gap-2
                        rounded-xl
                        border theme-border
                        px-4 py-2.5
                        text-xs font-semibold
                        theme-text-secondary
                        transition
                        hover:border-[var(--color-primary)]
                        hover:text-[var(--color-primary)]
                      "
                    >
                      <Settings2 size={15} />
                      Pengaturan
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* =====================================================
                FOOTER
            ====================================================== */}

            <div
              className="
                flex flex-col gap-3
                border-t theme-border
                py-5
                text-xs
                theme-text-muted
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div className="flex items-center gap-2">
                <GraduationCap size={15} />

                <span>
                  SmartSchool · E-Raport Management
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck
                    size={13}
                    className="text-[var(--color-success)]"
                  />

                  Sistem aktif
                </span>

                <span>
                  Semester Ganjil 2026/2027
                </span>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}