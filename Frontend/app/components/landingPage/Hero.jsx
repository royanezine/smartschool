"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  ArrowRight,
  Play,
  BookOpen,
  ClipboardCheck,
  CreditCard,
  BellRing,
  LayoutDashboard,
  Users,
  ShieldCheck,
  Check,
} from "lucide-react";

const WIDE_CONTAINER =
  "mx-auto w-full max-w-[1800px] px-6 sm:px-8 md:px-12 lg:px-16 xl:px-24 2xl:px-32";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { y: 32, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 80, damping: 14 },
  },
};

const highlights = [
  { icon: BookOpen, title: "Akademik", desc: "Nilai, jadwal & rapor" },
  { icon: ClipboardCheck, title: "Absensi", desc: "Guru & siswa real-time" },
  { icon: CreditCard, title: "Keuangan", desc: "SPP & tagihan digital" },
  { icon: BellRing, title: "Notifikasi" },
];

const sideNav = [
  LayoutDashboard,
  Users,
  ClipboardCheck,
  CreditCard,
  BellRing,
];

const weekly = [
  { day: "Sen", h: 58 },
  { day: "Sel", h: 72 },
  { day: "Rab", h: 64 },
  { day: "Kam", h: 82 },
  { day: "Jum", h: 94 },
];

const classes = [
  { name: "Kelas X", w: "92%" },
  { name: "Kelas XI", w: "84%" },
  { name: "Kelas XII", w: "76%" },
];

const stats = [
  { icon: Users, label: "Siswa" },
  { icon: BookOpen, label: "Guru" },
  { icon: ClipboardCheck, label: "Kehadiran" },
];

function DashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
      className="relative ml-auto w-full max-w-[580px]"
    >
      {/* Jendela dashboard */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{ rotateY: -6, rotateX: 2, transformPerspective: 1400 }}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-2xl shadow-slate-900/20 backdrop-blur"
      >
        {/* Bar jendela */}
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          <span className="ml-3 rounded-md bg-white px-3 py-1 text-[11px] font-medium text-slate-400 ring-1 ring-slate-200">
            SmartSchool · Dashboard
          </span>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="flex w-14 shrink-0 flex-col items-center gap-3 border-r border-slate-100 py-5">
            {sideNav.map((Icon, i) => (
              <div
                key={i}
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  i === 0
                    ? "bg-blue-600 text-white"
                    : "text-slate-400"
                }`}
              >
                <Icon size={18} strokeWidth={1.75} />
              </div>
            ))}
          </div>

          {/* Konten */}
          <div className="min-w-0 flex-1 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">
                Ringkasan Sekolah
              </p>
              <span className="h-2 w-16 rounded-full bg-slate-100" />
            </div>

            {/* Tile statistik */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              {stats.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="rounded-xl border border-slate-200 p-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Icon size={16} strokeWidth={1.75} />
                  </div>
                  <p className="mt-3 text-[11px] font-medium text-slate-500">
                    {label}
                  </p>
                  <span className="mt-1.5 block h-2.5 w-12 rounded-full bg-slate-200" />
                </div>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-5 gap-3">
              {/* Grafik kehadiran mingguan */}
              <div className="col-span-3 rounded-xl border border-slate-200 p-4">
                <p className="text-[11px] font-semibold text-slate-700">
                  Kehadiran Mingguan
                </p>

                <div className="mt-4 flex h-24 items-end gap-3">
                  {weekly.map((item, i) => (
                    <div
                      key={item.day}
                      className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
                    >
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${item.h}%` }}
                        transition={{
                          duration: 0.8,
                          delay: 1 + i * 0.08,
                          ease: "easeOut",
                        }}
                        className={`w-full rounded-md ${
                          i === weekly.length - 1
                            ? "bg-blue-600"
                            : "bg-blue-100"
                        }`}
                      />
                      <span className="text-[10px] text-slate-400">
                        {item.day}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progres per kelas */}
              <div className="col-span-2 rounded-xl border border-slate-200 p-4">
                <p className="text-[11px] font-semibold text-slate-700">
                  Per Kelas
                </p>

                <div className="mt-4 space-y-3.5">
                  {classes.map((c, i) => (
                    <div key={c.name}>
                      <p className="text-[10px] text-slate-500">{c.name}</p>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: c.w }}
                          transition={{
                            duration: 1,
                            delay: 1.1 + i * 0.12,
                            ease: "easeOut",
                          }}
                          className="h-full rounded-full bg-blue-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chip kecil yang menempel di dashboard */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
        className="absolute -right-4 -top-5 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl shadow-slate-900/10"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
          <ShieldCheck size={18} strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-900">Data Aman</p>
          <p className="text-[11px] text-slate-500">Hak akses per peran</p>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute -bottom-6 -left-6 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl shadow-slate-900/10"
      >
        <div className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
          <BellRing size={18} strokeWidth={1.75} />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white">
            <Check size={8} strokeWidth={4} />
          </span>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-900">
            Notifikasi Terkirim
          </p>
          <p className="text-[11px] text-slate-500"></p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Hero() {
  return (
    <section
      id="beranda"
      className="relative flex min-h-screen flex-col overflow-hidden bg-white pt-20"
    >
      {/* Background image (tetap) */}
      <motion.div
        className="absolute inset-0"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src="/hero/herobg2.png"
          alt="Gedung SmartSchool"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.88) 28%, rgba(255,255,255,0.45) 46%, rgba(255,255,255,0) 64%)",
          }}
        />
      </motion.div>

      {/* Pudar halus ke section berikutnya */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-24 bg-gradient-to-t from-white/80 to-transparent" />

      {/* Konten utama */}
      <div className="relative z-10 flex flex-1 items-center">
        <div className={WIDE_CONTAINER}>
          <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-3xl py-16 lg:py-20"
            >
              <motion.p
                variants={itemVariants}
                className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-blue-600"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
                </span>
                School Management System
                <span className="h-px w-10 bg-blue-600" />
              </motion.p>

              <motion.h1
                variants={itemVariants}
                className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
              >
                Kelola Sekolah Lebih Cerdas, Bersama{" "}
                <span className="relative inline-block whitespace-nowrap text-blue-600">
                  SmartSchool
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 300 12"
                    preserveAspectRatio="none"
                    className="absolute -bottom-2 left-0 h-3 w-full text-blue-500/60"
                  >
                    <path
                      d="M2 8 C 40 2, 70 2, 110 7 S 190 12, 230 6 S 280 3, 298 7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="mt-8 max-w-xl text-base leading-8 text-slate-600 md:text-lg"
              >
                Platform digital terintegrasi untuk membantu sekolah mengelola
                data siswa, guru, akademik, presensi, jadwal, dan administrasi
                dalam satu sistem yang aman dan mudah digunakan.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="mt-10 flex flex-wrap items-center gap-4"
              >
                <button
                  type="button"
                  className="group inline-flex items-center gap-3 rounded-xl bg-blue-600 px-7 py-4 font-semibold text-white shadow-lg shadow-blue-600/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30 focus:outline-none focus:ring-4 focus:ring-blue-600/20"
                >
                  Daftar Sekarang
                  <ArrowRight
                    size={19}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>

                <button
                  type="button"
                  className="group inline-flex items-center gap-3 rounded-xl border border-slate-300 bg-white/90 px-6 py-4 font-semibold text-slate-800 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-600 hover:text-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-100 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white">
                    <Play size={12} fill="currentColor" className="ml-0.5" />
                  </span>
                  Lihat Demo
                </button>
              </motion.div>
            </motion.div>

            {/* Preview dashboard (desktop) */}
            <div className="hidden lg:block">
              <DashboardPreview />
            </div>
          </div>
        </div>
      </div>

      {/* Strip highlight di bagian bawah hero */}
      <div className="relative z-10 pb-10">
        <div className={WIDE_CONTAINER}>
          <motion.ul
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7, ease: "easeOut" }}
            className="grid grid-cols-2 divide-x divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 lg:grid-cols-4 [&>li:nth-child(n+3)]:border-t [&>li:nth-child(n+3)]:border-slate-200 lg:[&>li:nth-child(n+3)]:border-t-0"
          >
            {highlights.map(({ icon: Icon, title, desc }) => (
              <li
                key={title}
                className="group flex items-center gap-4 px-5 py-5 transition-colors duration-300 hover:bg-slate-50 sm:px-6"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition-colors duration-300 group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white">
                  <Icon size={21} strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {desc}
                  </p>
                </div>
              </li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}