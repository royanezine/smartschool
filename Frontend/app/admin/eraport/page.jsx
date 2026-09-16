"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";

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
    description: "Kelola dan input nilai siswa berdasarkan mata pelajaran.",
    href: "/admin/eraport/entry-nilai",
    icon: PenLine,
    tone: "blue",
  },
  {
    title: "Cetak Raport",
    description: "Preview dan cetak raport siswa secara terstruktur.",
    href: "/admin/eraport/cetak-raport",
    icon: Printer,
    tone: "violet",
  },
  {
    title: "Pengaturan Agregat Nilai",
    description: "Atur bobot dan perhitungan nilai akhir raport.",
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

const toneMap = {
  blue: {
    iconBg: "bg-blue-50",
    iconText: "text-[#155DFC]",
    border: "border-blue-100",
    soft: "bg-blue-50/70",
  },
  violet: {
    iconBg: "bg-violet-50",
    iconText: "text-violet-600",
    border: "border-violet-100",
    soft: "bg-violet-50/70",
  },
  indigo: {
    iconBg: "bg-indigo-50",
    iconText: "text-indigo-600",
    border: "border-indigo-100",
    soft: "bg-indigo-50/70",
  },
  emerald: {
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-600",
    border: "border-emerald-100",
    soft: "bg-emerald-50/70",
  },
  amber: {
    iconBg: "bg-amber-50",
    iconText: "text-amber-600",
    border: "border-amber-100",
    soft: "bg-amber-50/70",
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
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_15px_40px_rgba(37,99,235,0.08)]">
      <div className="absolute -right-7 -top-7 h-24 w-24 rounded-full bg-blue-50/60 transition-transform duration-500 group-hover:scale-150" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-1.5 text-xs text-slate-500">{description}</p>

          {href && (
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#155DFC]">
              Lihat detail
              <ArrowUpRight
                size={14}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </div>
          )}
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${theme.iconBg} ${theme.iconText}`}
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
      ? "from-emerald-500 to-emerald-400"
      : tone === "violet"
      ? "from-violet-600 to-violet-400"
      : tone === "amber"
      ? "from-amber-500 to-amber-400"
      : "from-[#155DFC] to-[#60A5FA]";

  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${bar} transition-all duration-700`}
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
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
    () => CLASS_PROGRESS.reduce((sum, item) => sum + item.siswa, 0),
    []
  );

  const averageNilai = useMemo(
    () =>
      Math.round(
        CLASS_PROGRESS.reduce((sum, item) => sum + item.nilai, 0) /
          CLASS_PROGRESS.length
      ),
    []
  );

  const averageRaport = useMemo(
    () =>
      Math.round(
        CLASS_PROGRESS.reduce((sum, item) => sum + item.raport, 0) /
          CLASS_PROGRESS.length
      ),
    []
  );

  return (
    <div className="flex h-screen min-h-0 overflow-hidden bg-[#F8FAFC]">
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

            <section className="relative mb-6 overflow-hidden rounded-[28px] bg-[#071A3A] shadow-[0_20px_55px_rgba(15,23,42,0.14)]">
              <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-[#2563EB]/25 blur-3xl" />
              <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-indigo-500/15 blur-3xl" />

              <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
                  backgroundSize: "34px 34px",
                }}
              />

              <div className="relative grid gap-8 px-6 py-7 sm:px-8 sm:py-8 lg:grid-cols-[1fr_390px] lg:px-10 lg:py-9">
                <div className="flex flex-col justify-center">
                  <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100 backdrop-blur-md">
                    <Sparkles size={13} />
                    Akademik · E-Raport
                  </div>

                  <h1 className="max-w-2xl text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-[38px] lg:leading-tight">
                    Kelola E-Raport Sekolah
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100/75 sm:text-[15px]">
                    Pantau pengisian nilai, kelengkapan raport, proses agregasi,
                    dan pencetakan raport siswa dalam satu dashboard akademik.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href="/admin/eraport/entry-nilai"
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#0D47C9] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-blue-50"
                    >
                      <PenLine size={17} />
                      Entry Nilai
                    </Link>

                    <Link
                      href="/admin/eraport/cetak-raport"
                      className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/15"
                    >
                      <Printer size={17} />
                      Cetak Raport
                    </Link>
                  </div>
                </div>

                {/* HERO SIDE */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-blue-100/60">
                        Tahun Ajaran
                      </p>

                      <p className="mt-1 text-lg font-bold text-white">
                        2026/2027
                      </p>

                      <p className="mt-1 text-xs text-blue-100/55">
                        Semester Ganjil
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-blue-200">
                      <CalendarDays size={20} />
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl bg-white/[0.06] p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-blue-100/55">
                          Kelengkapan Raport
                        </p>

                        <p className="mt-1 text-2xl font-bold text-white">
                          {averageRaport}%
                        </p>
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-emerald-400/30">
                        <CheckCircle2
                          size={22}
                          className="text-emerald-300"
                        />
                      </div>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-300"
                        style={{ width: `${averageRaport}%` }}
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
                  const theme = toneMap[item.tone];

                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_45px_rgba(37,99,235,0.09)]"
                    >
                      <div className="absolute right-0 top-0 h-28 w-28 translate-x-10 -translate-y-10 rounded-full bg-blue-50/70 transition-transform duration-500 group-hover:scale-150" />

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
              <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.035)]">
                <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#155DFC]">
                      Monitoring
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-slate-900">
                      Progres E-Raport per kelas
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Pantau kelengkapan nilai dan raport setiap kelas.
                    </p>
                  </div>

                  <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
                    <button
                      type="button"
                      onClick={() => setActiveView("ringkasan")}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                        activeView === "ringkasan"
                          ? "bg-white text-[#155DFC] shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Ringkasan
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveView("detail")}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                        activeView === "detail"
                          ? "bg-white text-[#155DFC] shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Detail
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px]">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70">
                        <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Kelas
                        </th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Siswa
                        </th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Nilai
                        </th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Raport
                        </th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Aksi
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {CLASS_PROGRESS.map((item) => (
                        <tr
                          key={item.kelas}
                          className="group transition hover:bg-blue-50/30"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-[#155DFC]">
                                {item.tingkat}
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  {item.kelas}
                                </p>

                                <p className="mt-0.5 text-[11px] text-slate-400">
                                  Semester Ganjil
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span className="text-sm font-semibold text-slate-700">
                              {item.siswa}
                            </span>
                          </td>

                          <td className="w-[150px] px-4 py-4">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-slate-700">
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
                              <span className="text-xs font-semibold text-slate-700">
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
                              className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                item.status === "Selesai"
                                  ? "bg-emerald-50 text-emerald-600"
                                  : item.status === "Hampir selesai"
                                  ? "bg-blue-50 text-[#155DFC]"
                                  : item.status === "Berjalan"
                                  ? "bg-violet-50 text-violet-600"
                                  : "bg-amber-50 text-amber-600"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <Link
                              href="/admin/eraport/entry-nilai"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-[#155DFC]"
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
                  <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:px-6">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#155DFC]">
                        <BarChart3 size={17} />
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-slate-800">
                          Insight E-Raport
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Kelas 9 memiliki tingkat kelengkapan raport paling
                          tinggi. Kelas 8B masih membutuhkan perhatian karena
                          progres pengisian nilai berada di bawah kelas lainnya.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* RAPORT STATUS */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] sm:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#155DFC]">
                      Status
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-slate-900">
                      Status raport
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Distribusi kelengkapan raport siswa.
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#155DFC]">
                    <FileText size={19} />
                  </div>
                </div>

                <div className="mt-7 flex justify-center">
                  <div className="relative flex h-44 w-44 items-center justify-center rounded-full border-[18px] border-emerald-100">
                    <div className="absolute inset-[-18px] rounded-full border-[18px] border-transparent border-t-[#155DFC] border-r-[#155DFC] rotate-[-35deg]" />

                    <div className="text-center">
                      <p className="text-3xl font-bold text-slate-900">
                        78%
                      </p>
                      <p className="mt-1 text-[11px] font-medium text-slate-400">
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
                            className={`h-2.5 w-2.5 rounded-full ${
                              item.tone === "emerald"
                                ? "bg-emerald-500"
                                : item.tone === "blue"
                                ? "bg-[#155DFC]"
                                : "bg-amber-500"
                            }`}
                          />

                          <span className="text-xs font-medium text-slate-600">
                            {item.label}
                          </span>
                        </div>

                        <span className="text-xs font-bold text-slate-800">
                          {item.value}
                        </span>
                      </div>

                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${
                            item.tone === "emerald"
                              ? "bg-emerald-500"
                              : item.tone === "blue"
                              ? "bg-[#155DFC]"
                              : "bg-amber-500"
                          }`}
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
                  className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#155DFC]"
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
              <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.035)]">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Progres berdasarkan mata pelajaran
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Kelengkapan entry nilai dari setiap guru.
                    </p>
                  </div>

                  <Link
                    href="/admin/eraport/entry-nilai"
                    className="text-xs font-semibold text-[#155DFC]"
                  >
                    Entry nilai
                  </Link>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="space-y-5">
                    {SUBJECT_PROGRESS.map((item, index) => (
                      <div key={item.subject}>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-xs font-bold text-slate-500">
                            {String(index + 1).padStart(2, "0")}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  {item.subject}
                                </p>

                                <p className="mt-0.5 text-[11px] text-slate-400">
                                  {item.teacher} · {item.students} siswa
                                </p>
                              </div>

                              <span className="text-xs font-bold text-slate-700">
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
              <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.035)]">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Aktivitas terbaru
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Aktivitas terakhir pada E-Raport.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400 transition hover:bg-blue-50 hover:text-[#155DFC]"
                  >
                    <RefreshCw size={15} />
                  </button>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="relative">
                    <div className="absolute bottom-5 left-[17px] top-5 w-px bg-slate-100" />

                    <div className="space-y-5">
                      {RECENT_ACTIVITY.map((item) => {
                        const Icon = item.icon;
                        const theme = toneMap[item.tone];

                        return (
                          <div
                            key={item.title + item.time}
                            className="relative flex gap-3"
                          >
                            <div
                              className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${theme.iconBg} ${theme.iconText} ring-4 ring-white`}
                            >
                              <Icon size={16} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold leading-5 text-slate-800">
                                {item.title}
                              </p>

                              <p className="mt-0.5 truncate text-[11px] text-slate-500">
                                {item.detail}
                              </p>

                              <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                                <span>{item.user}</span>
                                <span>•</span>
                                <span>{item.time}</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-300 hover:bg-slate-50 hover:text-slate-500 sm:flex"
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
              <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50 p-5 sm:p-6">
                <div className="absolute -right-16 -top-20 h-44 w-44 rounded-full bg-blue-100/50 blur-2xl" />

                <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#155DFC] shadow-sm">
                        <GraduationCap size={18} />
                      </div>

                      <p className="text-sm font-bold text-slate-900">
                        Pengelolaan akademik lebih terarah
                      </p>
                    </div>

                    <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-500">
                      Pastikan seluruh nilai telah terisi sebelum proses
                      agregasi dan pencetakan raport dilakukan.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/admin/eraport/entry-nilai"
                      className="inline-flex items-center gap-2 rounded-xl bg-[#155DFC] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0D47C9]"
                    >
                      <PenLine size={15} />
                      Entry Nilai
                    </Link>

                    <Link
                      href="/admin/eraport/pengaturan-agregat"
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:text-[#155DFC]"
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

            <div className="flex flex-col gap-3 border-t border-slate-200/70 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
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
                    className="text-emerald-500"
                  />
                  Sistem aktif
                </span>

                <span>Semester Ganjil 2026/2027</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}