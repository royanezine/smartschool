"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import {
  BookOpen,
  Users,
  ClipboardCheck,
  CreditCard,
  BellRing,
  BarChart3,
} from "lucide-react";

export default function FeaturedModule() {
  // Data dengan pilihan warna aksen yang berbeda untuk setiap kartu
  const modules = [
    {
      title: "Akademik",
      icon: <BookOpen size={28} />,
      desc: "Mengelola kurikulum, jadwal, nilai, dan rapor siswa secara digital.",
      color: "blue",
    },
    {
      title: "Data Guru & Siswa",
      icon: <Users size={28} />,
      desc: "Seluruh data guru dan siswa tersimpan dalam satu sistem terintegrasi.",
      color: "violet",
    },
    {
      title: "Absensi Digital",
      icon: <ClipboardCheck size={28} />,
      desc: "Absensi guru maupun siswa dilakukan secara cepat dan real-time.",
      color: "green",
    },
    {
      title: "Keuangan",
      icon: <CreditCard size={28} />,
      desc: "Pembayaran SPP, tagihan, dan laporan keuangan menjadi lebih mudah.",
      color: "orange",
    },
    {
      title: "Notifikasi",
      icon: <BellRing size={28} />,
      desc: "Informasi penting langsung dikirim ke guru, siswa, maupun orang tua.",
      color: "pink",
    },
    {
      title: "Dashboard Analitik",
      icon: <BarChart3 size={28} />,
      desc: "Monitoring perkembangan sekolah melalui dashboard interaktif.",
      color: "cyan",
    },
  ];

  // Palet warna pastel yang elegan untuk setiap kategori
  const colorPalette = {
    blue: { 
      stripe: "bg-blue-400", 
      iconBg: "bg-blue-50", 
      iconText: "text-blue-500",
      hoverGlow: "hover:shadow-blue-200/50"
    },
    violet: { 
      stripe: "bg-violet-400", 
      iconBg: "bg-violet-50", 
      iconText: "text-violet-500",
      hoverGlow: "hover:shadow-violet-200/50"
    },
    green: { 
      stripe: "bg-green-400", 
      iconBg: "bg-green-50", 
      iconText: "text-green-500",
      hoverGlow: "hover:shadow-green-200/50"
    },
    orange: { 
      stripe: "bg-orange-400", 
      iconBg: "bg-orange-50", 
      iconText: "text-orange-500",
      hoverGlow: "hover:shadow-orange-200/50"
    },
    pink: { 
      stripe: "bg-pink-400", 
      iconBg: "bg-pink-50", 
      iconText: "text-pink-500",
      hoverGlow: "hover:shadow-pink-200/50"
    },
    cyan: { 
      stripe: "bg-cyan-400", 
      iconBg: "bg-cyan-50", 
      iconText: "text-cyan-500",
      hoverGlow: "hover:shadow-cyan-200/50"
    },
  };

  // Animasi
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <section className="relative bg-white overflow-hidden py-24">
      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Modul Unggulan
          </span>

          <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
            Modul Smart School yang{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Paling Banyak Digunakan
            </span>
          </h2>

          <p className="mt-4 text-slate-500 leading-7 max-w-xl mx-auto">
            Pilihan modul lengkap untuk membantu sekolah mengelola administrasi, akademik, komunikasi, dan keuangan dalam satu platform.
          </p>
        </div>

        {/* Grid Kartu */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {modules.map((module, index) => {
            // Ambil warna berdasarkan nama color di data
            const colors = colorPalette[module.color];

            return (
              <motion.div
                key={index}
                variants={itemVariants}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`relative group bg-white rounded-2xl border border-slate-200/60 p-7 shadow-sm hover:shadow-xl ${colors.hoverGlow} hover:-translate-y-1.5 transition-all duration-300 overflow-hidden`}
              >
                {/* 🔹 Garis Aksen Warna di Bagian Atas */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${colors.stripe} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-t-2xl`} />

                {/* 🔹 Ikon Utama dengan warna pastel */}
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${colors.iconBg} ${colors.iconText} transition-transform duration-300 group-hover:scale-105`}>
                  {module.icon}
                </div>

                <h3 className="mt-6 text-xl font-bold text-slate-800 group-hover:text-slate-900 transition-colors">
                  {module.title}
                </h3>

                <p className="mt-3 text-slate-500 leading-relaxed flex-1">
                  {module.desc}
                </p>

                {/* Tombol Aksi */}
                <button className="mt-6 w-fit flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors group/btn">
                  <span>Pelajari Modul</span>
                  <ArrowRight size={15} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>

              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}