"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Users,
  ClipboardCheck,
  CreditCard,
  BellRing,
  BarChart3,
} from "lucide-react";

const modules = [
  {
    title: "Akademik",
    icon: BookOpen,
    desc: "Mengelola kurikulum, jadwal, nilai, dan rapor siswa secara digital.",
  },
  {
    title: "Data Guru & Siswa",
    icon: Users,
    desc: "Seluruh data guru dan siswa tersimpan dalam satu sistem terintegrasi.",
  },
  {
    title: "Absensi Digital",
    icon: ClipboardCheck,
    desc: "Absensi guru maupun siswa dilakukan secara cepat dan real-time.",
  },
  {
    title: "Keuangan",
    icon: CreditCard,
    desc: "Pembayaran SPP, tagihan, dan laporan keuangan menjadi lebih mudah.",
  },
  {
    title: "Notifikasi",
    icon: BellRing,
    desc: "Informasi penting langsung dikirim ke guru, siswa, maupun orang tua.",
  },
  {
    title: "Dashboard Analitik",
    icon: BarChart3,
    desc: "Monitoring perkembangan sekolah melalui dashboard interaktif.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 16, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

export default function FeaturedModule() {
  return (
    <section className="relative overflow-hidden bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
            <span className="h-px w-8 bg-blue-600" />
            Modul Unggulan
            <span className="h-px w-8 bg-blue-600" />
          </p>

          <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Modul Smart School yang{" "}
            <span className="text-blue-600">Lengkap & Terintegrasi</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600">
            Pilihan modul lengkap untuk membantu sekolah mengelola
            administrasi, akademik, komunikasi, dan keuangan dalam satu
            platform.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {modules.map((module, index) => {
            const Icon = module.icon;

            return (
              <motion.article
                key={module.title}
                variants={itemVariants}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 transition-all duration-300 hover:border-blue-600/40 hover:shadow-lg hover:shadow-slate-900/5"
              >
                <span className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-blue-600 transition-transform duration-500 group-hover:scale-x-100" />

                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition-colors duration-300 group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white">
                    <Icon size={24} strokeWidth={1.75} />
                  </div>

                  <span className="text-sm font-semibold tabular-nums text-slate-300">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="mt-8 text-lg font-semibold tracking-tight text-slate-900">
                  {module.title}
                </h3>

                <p className="mt-3 flex-1 text-[15px] leading-7 text-slate-600">
                  {module.desc}
                </p>

                <button
                  type="button"
                  className="mt-7 inline-flex w-fit items-center gap-2 border-b border-transparent pb-0.5 text-sm font-semibold text-slate-900 transition-all duration-300 hover:border-blue-600 hover:text-blue-600 group-hover:gap-3"
                >
                  Pelajari Modul
                  <ArrowRight size={16} />
                </button>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}