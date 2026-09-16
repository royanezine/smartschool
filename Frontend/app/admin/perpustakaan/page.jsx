"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";

import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  FileText,
  GraduationCap,
  Library,
  MonitorPlay,
  MoreHorizontal,
  PackageOpen,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Settings2,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";

/* =========================================================
   DATA
========================================================= */

const QUICK_MODULES = [
  {
    title: "Buku Digital",
    description:
      "Kelola koleksi buku digital, modul, dan bahan bacaan elektronik.",
    href: "/admin/perpustakaan/buku-digital",
    icon: BookOpen,
    tone: "blue",
  },
  {
    title: "Data Buku Perpustakaan",
    description:
      "Kelola katalog buku fisik, kategori, penulis, dan stok koleksi.",
    href: "/admin/perpustakaan/data-buku",
    icon: Library,
    tone: "violet",
  },
  {
    title: "Peminjaman",
    description:
      "Pantau transaksi peminjaman buku oleh siswa dan warga sekolah.",
    href: "/admin/perpustakaan/pinjam",
    icon: BookOpenCheck,
    tone: "indigo",
  },
  {
    title: "Pengembalian",
    description:
      "Kelola pengembalian buku dan pantau buku yang belum dikembalikan.",
    href: "/admin/perpustakaan/pengembalian",
    icon: RotateCcw,
    tone: "emerald",
  },
];

const POPULAR_BOOKS = [
  {
    title: "Matematika SMP Kelas IX",
    author: "Budi Santoso",
    category: "Pelajaran",
    borrowed: 48,
    available: 7,
    tone: "blue",
  },
  {
    title: "Ensiklopedia Sains Remaja",
    author: "Dewi Lestari",
    category: "Sains",
    borrowed: 41,
    available: 5,
    tone: "emerald",
  },
  {
    title: "Bahasa Indonesia untuk SMP",
    author: "Siti Rahma",
    category: "Pelajaran",
    borrowed: 37,
    available: 9,
    tone: "violet",
  },
  {
    title: "Kumpulan Cerita Nusantara",
    author: "Anwar Hidayat",
    category: "Literasi",
    borrowed: 32,
    available: 12,
    tone: "amber",
  },
  {
    title: "English Conversation",
    author: "Rina Amelia",
    category: "Bahasa",
    borrowed: 29,
    available: 6,
    tone: "indigo",
  },
];

const RECENT_TRANSACTIONS = [
  {
    name: "Andi Saputra",
    className: "IX A",
    book: "Matematika SMP Kelas IX",
    type: "Peminjaman",
    date: "10 Sep 2026 · 09:12",
    status: "Dipinjam",
    avatar: "AS",
  },
  {
    name: "Nadia Putri",
    className: "VIII B",
    book: "Ensiklopedia Sains Remaja",
    type: "Pengembalian",
    date: "10 Sep 2026 · 08:46",
    status: "Selesai",
    avatar: "NP",
  },
  {
    name: "Rizky Ramadhan",
    className: "IX B",
    book: "English Conversation",
    type: "Peminjaman",
    date: "10 Sep 2026 · 08:20",
    status: "Dipinjam",
    avatar: "RR",
  },
  {
    name: "Salsa Aulia",
    className: "VII A",
    book: "Kumpulan Cerita Nusantara",
    type: "Peminjaman",
    date: "09 Sep 2026 · 14:32",
    status: "Dipinjam",
    avatar: "SA",
  },
  {
    name: "Fajar Maulana",
    className: "VIII A",
    book: "Bahasa Indonesia untuk SMP",
    type: "Pengembalian",
    date: "09 Sep 2026 · 13:15",
    status: "Selesai",
    avatar: "FM",
  },
];

const CATEGORY_DATA = [
  {
    label: "Pelajaran",
    value: 186,
    percentage: 42,
    tone: "blue",
  },
  {
    label: "Literasi",
    value: 94,
    percentage: 21,
    tone: "violet",
  },
  {
    label: "Sains",
    value: 72,
    percentage: 16,
    tone: "emerald",
  },
  {
    label: "Bahasa",
    value: 58,
    percentage: 13,
    tone: "indigo",
  },
  {
    label: "Lainnya",
    value: 34,
    percentage: 8,
    tone: "amber",
  },
];

const ACTIVITY_DATA = [
  {
    title: "Buku baru ditambahkan",
    detail: "15 koleksi baru masuk ke katalog.",
    time: "18 menit lalu",
    icon: BookOpen,
    tone: "blue",
  },
  {
    title: "Pengembalian selesai",
    detail: "12 buku berhasil dikembalikan hari ini.",
    time: "42 menit lalu",
    icon: RotateCcw,
    tone: "emerald",
  },
  {
    title: "Peminjaman meningkat",
    detail: "Aktivitas peminjaman naik 14% minggu ini.",
    time: "1 jam lalu",
    icon: TrendingUp,
    tone: "violet",
  },
  {
    title: "Koleksi digital diperbarui",
    detail: "8 materi digital diperbarui oleh admin.",
    time: "2 jam lalu",
    icon: MonitorPlay,
    tone: "indigo",
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
   COMPONENT
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
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_16px_42px_rgba(37,99,235,0.08)]">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-50/60 transition-transform duration-500 group-hover:scale-150" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-1.5 text-xs text-slate-500">
            {description}
          </p>

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
          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
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

/* =========================================================
   PAGE
========================================================= */

export default function PerpustakaanPage() {
  const [activePeriod, setActivePeriod] = useState("Minggu ini");

  const totalBooks = useMemo(
    () =>
      CATEGORY_DATA.reduce(
        (sum, category) => sum + category.value,
        0
      ),
    []
  );

  const totalBorrowed = useMemo(
    () =>
      POPULAR_BOOKS.reduce(
        (sum, book) => sum + book.borrowed,
        0
      ),
    []
  );

  return (
    <div className="flex h-screen min-h-0 overflow-hidden bg-[#F8FAFC]">
      <Sidebar
        role="admin"
        active="perpustakaan"
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
                    Literasi · Perpustakaan Digital
                  </div>

                  <h1 className="max-w-2xl text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-[38px] lg:leading-tight">
                    Perpustakaan Sekolah
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100/75 sm:text-[15px]">
                    Kelola koleksi buku, perpustakaan digital, peminjaman,
                    pengembalian, dan aktivitas literasi siswa dalam satu
                    dashboard.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href="/admin/perpustakaan/data-buku"
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#0D47C9] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-blue-50"
                    >
                      <Library size={17} />
                      Kelola Koleksi
                    </Link>

                    <Link
                      href="/admin/perpustakaan/peminjaman"
                      className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/15"
                    >
                      <BookOpenCheck size={17} />
                      Peminjaman
                    </Link>
                  </div>
                </div>

                {/* HERO SUMMARY */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-blue-100/60">
                        Kondisi Perpustakaan
                      </p>

                      <p className="mt-1 text-lg font-bold text-white">
                        Aktivitas berjalan normal
                      </p>

                      <p className="mt-1 text-xs text-blue-100/55">
                        Update terakhir hari ini
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
                      <CheckCircle2 size={20} />
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white/[0.06] p-3.5">
                      <p className="text-[11px] text-blue-100/50">
                        Koleksi
                      </p>

                      <p className="mt-1 text-xl font-bold text-white">
                        {totalBooks}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white/[0.06] p-3.5">
                      <p className="text-[11px] text-blue-100/50">
                        Digital
                      </p>

                      <p className="mt-1 text-xl font-bold text-white">
                        128
                      </p>
                    </div>

                    <div className="rounded-xl bg-white/[0.06] p-3.5">
                      <p className="text-[11px] text-blue-100/50">
                        Dipinjam
                      </p>

                      <p className="mt-1 text-xl font-bold text-white">
                        84
                      </p>
                    </div>

                    <div className="rounded-xl bg-white/[0.06] p-3.5">
                      <p className="text-[11px] text-blue-100/50">
                        Tersedia
                      </p>

                      <p className="mt-1 text-xl font-bold text-white">
                        356
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* =====================================================
                QUICK MODULES
            ====================================================== */}

            <section className="mb-7">
              <SectionHeader
                eyebrow="PERPUSTAKAAN"
                title="Modul utama"
                description="Akses cepat untuk pengelolaan perpustakaan sekolah."
              />

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
                  label="Total Koleksi"
                  value={totalBooks}
                  description="Buku dalam katalog"
                  icon={Library}
                  tone="blue"
                  href="/admin/perpustakaan/data-buku"
                />

                <StatCard
                  label="Buku Digital"
                  value="128"
                  description="Koleksi elektronik aktif"
                  icon={MonitorPlay}
                  tone="violet"
                  href="/admin/perpustakaan/buku-digital"
                />

                <StatCard
                  label="Sedang Dipinjam"
                  value="84"
                  description="Transaksi aktif saat ini"
                  icon={BookOpenCheck}
                  tone="indigo"
                  href="/admin/perpustakaan/peminjaman"
                />

                <StatCard
                  label="Jatuh Tempo"
                  value="17"
                  description="Perlu dikembalikan"
                  icon={Clock3}
                  tone="amber"
                  href="/admin/perpustakaan/pengembalian"
                />
              </div>
            </section>

            {/* =====================================================
                OVERVIEW
            ====================================================== */}

            <section className="mb-7 grid gap-5 xl:grid-cols-[1.3fr_.7fr]">

              {/* POPULAR BOOK */}
              <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.035)]">
                <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#155DFC]">
                      Koleksi populer
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-slate-900">
                      Buku paling banyak dipinjam
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Koleksi dengan aktivitas peminjaman tertinggi.
                    </p>
                  </div>

                  <div className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-semibold text-[#155DFC]">
                    {totalBorrowed} peminjaman
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {POPULAR_BOOKS.map((book, index) => {
                    const theme = toneMap[book.tone];

                    return (
                      <div
                        key={book.title}
                        className="group flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50/70 sm:px-6"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-xs font-bold text-slate-400">
                          {String(index + 1).padStart(2, "0")}
                        </div>

                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${theme.iconBg} ${theme.iconText}`}
                        >
                          <BookOpen size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {book.title}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {book.author} · {book.category}
                          </p>
                        </div>

                        <div className="hidden min-w-[100px] sm:block">
                          <p className="text-[11px] text-slate-400">
                            Dipinjam
                          </p>

                          <p className="mt-1 text-sm font-bold text-slate-800">
                            {book.borrowed} kali
                          </p>
                        </div>

                        <div className="hidden min-w-[75px] sm:block">
                          <p className="text-[11px] text-slate-400">
                            Tersedia
                          </p>

                          <p className="mt-1 text-sm font-bold text-emerald-600">
                            {book.available}
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

                <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
                  <Link
                    href="/admin/perpustakaan/data-buku"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#155DFC]"
                  >
                    Lihat seluruh katalog
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>

              {/* CATEGORY */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.035)] sm:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#155DFC]">
                      Koleksi
                    </p>

                    <h2 className="mt-1 text-lg font-bold text-slate-900">
                      Kategori buku
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Distribusi koleksi berdasarkan kategori.
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#155DFC]">
                    <BarChart3 size={19} />
                  </div>
                </div>

                <div className="mt-6 space-y-5">
                  {CATEGORY_DATA.map((item) => {
                    const theme = toneMap[item.tone];

                    return (
                      <div key={item.label}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${theme.iconBg.replace(
                                "bg-",
                                "bg-"
                              )}`}
                              style={{
                                backgroundColor:
                                  item.tone === "blue"
                                    ? "#155DFC"
                                    : item.tone === "violet"
                                    ? "#7C3AED"
                                    : item.tone === "emerald"
                                    ? "#10B981"
                                    : item.tone === "indigo"
                                    ? "#4F46E5"
                                    : "#F59E0B",
                              }}
                            />

                            <span className="text-xs font-medium text-slate-600">
                              {item.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800">
                              {item.value}
                            </span>

                            <span className="text-[10px] text-slate-400">
                              ({item.percentage}%)
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${item.percentage * 2.38}%`,
                              backgroundColor:
                                item.tone === "blue"
                                  ? "#155DFC"
                                  : item.tone === "violet"
                                  ? "#7C3AED"
                                  : item.tone === "emerald"
                                  ? "#10B981"
                                  : item.tone === "indigo"
                                  ? "#4F46E5"
                                  : "#F59E0B",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#155DFC] shadow-sm">
                      <Library size={17} />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        Total koleksi
                      </p>

                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {totalBooks} buku terdaftar dalam katalog.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* =====================================================
                TRANSACTION + ACTIVITY
            ====================================================== */}

            <section className="mb-7 grid gap-5 xl:grid-cols-[1.2fr_.8fr]">

              {/* TRANSACTION */}
              <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.035)]">
                <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Transaksi terbaru
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Aktivitas peminjaman dan pengembalian terbaru.
                    </p>
                  </div>

                  <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
                    {["Hari ini", "Minggu ini"].map((period) => (
                      <button
                        key={period}
                        type="button"
                        onClick={() => setActivePeriod(period)}
                        className={`rounded-lg px-3 py-2 text-[11px] font-semibold transition ${
                          activePeriod === period
                            ? "bg-white text-[#155DFC] shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {RECENT_TRANSACTIONS.map((item) => (
                    <div
                      key={`${item.name}-${item.book}`}
                      className="flex items-center gap-3 px-5 py-4 transition hover:bg-slate-50/70 sm:px-6"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-[#155DFC]">
                        {item.avatar}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-800">
                            {item.name}
                          </p>

                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-500">
                            {item.className}
                          </span>
                        </div>

                        <p className="mt-1 truncate text-xs text-slate-500">
                          {item.book}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          {item.date}
                        </p>
                      </div>

                      <div className="hidden text-right sm:block">
                        <p
                          className={`text-[10px] font-bold ${
                            item.type === "Peminjaman"
                              ? "text-[#155DFC]"
                              : "text-emerald-600"
                          }`}
                        >
                          {item.type}
                        </p>

                        <span
                          className={`mt-1 inline-flex rounded-full px-2 py-1 text-[9px] font-bold ${
                            item.status === "Selesai"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-blue-50 text-[#155DFC]"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-300 transition hover:bg-blue-50 hover:text-[#155DFC]"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
                  <Link
                    href="/admin/perpustakaan/peminjaman"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#155DFC]"
                  >
                    Lihat seluruh transaksi
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>

              {/* ACTIVITY */}
              <div className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.035)]">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Aktivitas perpustakaan
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Ringkasan aktivitas terbaru.
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
                      {ACTIVITY_DATA.map((item) => {
                        const Icon = item.icon;
                        const theme = toneMap[item.tone];

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

                            <div className="min-w-0 flex-1 pt-0.5">
                              <p className="text-xs font-semibold leading-5 text-slate-800">
                                {item.title}
                              </p>

                              <p className="mt-0.5 text-[11px] leading-5 text-slate-500">
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
                        <Library size={18} />
                      </div>

                      <p className="text-sm font-bold text-slate-900">
                        Kelola perpustakaan dengan lebih mudah
                      </p>
                    </div>

                    <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-500">
                      Tambahkan koleksi baru, proses peminjaman, atau pantau
                      pengembalian buku dari akses cepat berikut.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/admin/perpustakaan/data-buku/tambah"
                      className="inline-flex items-center gap-2 rounded-xl bg-[#155DFC] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0D47C9]"
                    >
                      <Plus size={15} />
                      Tambah Buku
                    </Link>

                    <Link
                      href="/admin/perpustakaan/peminjaman/tambah"
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:text-[#155DFC]"
                    >
                      <BookOpenCheck size={15} />
                      Peminjaman
                    </Link>

                    <Link
                      href="/admin/perpustakaan/buku-digital"
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:text-[#155DFC]"
                    >
                      <MonitorPlay size={15} />
                      Buku Digital
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
                  SmartSchool · Perpustakaan Digital
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2
                    size={13}
                    className="text-emerald-500"
                  />
                  Sistem aktif
                </span>

                <span>
                  Tahun Ajaran 2026/2027
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}