"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  GraduationCap,
  Users,
  BellRing,
  BarChart3,
  ShieldCheck,
  FileText,
  UserCog,
  MessageSquare,
} from "lucide-react";

export default function Features() {
  const features = [
    {
      title: "Akademik",
      desc: "Kelola kurikulum, nilai, dan proses belajar mengajar.",
      icon: <BookOpen size={24} />,
    },
    {
      title: "Jadwal Pelajaran",
      desc: "Penyusunan jadwal otomatis dan mudah diakses.",
      icon: <CalendarDays size={24} />,
    },
    {
      title: "Absensi",
      desc: "Absensi guru dan siswa secara real-time.",
      icon: <ClipboardCheck size={24} />,
    },
    {
      title: "Keuangan",
      desc: "Kelola pembayaran dan laporan keuangan sekolah.",
      icon: <CreditCard size={24} />,
    },
    {
      title: "Guru",
      desc: "Manajemen data guru, tugas, dan jadwal mengajar.",
      icon: <GraduationCap size={24} />,
    },
    {
      title: "Siswa",
      desc: "Data siswa terintegrasi dalam satu sistem.",
      icon: <Users size={24} />,
    },
    {
      title: "Notifikasi",
      desc: "Pemberitahuan otomatis ke guru dan orang tua.",
      icon: <BellRing size={24} />,
    },
    {
      title: "Laporan",
      desc: "Laporan akademik dan administrasi secara instan.",
      icon: <BarChart3 size={24} />,
    },
    {
      title: "Keamanan",
      desc: "Data sekolah terlindungi dengan sistem keamanan.",
      icon: <ShieldCheck size={24} />,
    },
    {
      title: "Dokumen",
      desc: "Penyimpanan seluruh dokumen sekolah secara digital.",
      icon: <FileText size={24} />,
    },
    {
      title: "Manajemen User",
      desc: "Pengaturan hak akses guru, siswa, dan admin.",
      icon: <UserCog size={24} />,
    },
    {
      title: "Komunikasi",
      desc: "Komunikasi sekolah lebih cepat dan terintegrasi.",
      icon: <MessageSquare size={24} />,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08, // Muncul bergantian
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <section 
      id="fitur" 
      className="relative bg-blue-50 overflow-hidden py-24"
    >
      {/* 🌟 Elemen Dekoratif Latar Belakang: Glowing Blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-300/30 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3 pointer-events-none" />
      
      {/* 🌟 Pola Grid Halus di Latar Belakang (Memberi tekstur) */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#3b82f6 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 z-10">
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-100/70 border border-blue-200 px-4 py-1.5 text-xs font-semibold text-blue-600">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Fitur Lengkap
          </span>

          <h2 className="mt-5 text-4xl font-bold text-slate-800">
            Semua Kebutuhan Sekolah
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
              {" "}Dalam Satu Platform
            </span>
          </h2>

          <p className="mt-5 text-slate-500 leading-8 max-w-2xl mx-auto">
            Smart School menyediakan berbagai fitur untuk mendukung
            pengelolaan sekolah yang lebih modern, efisien,
            dan terintegrasi.
          </p>
        </div>

        {/* Features Grid dengan Animasi */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="relative group rounded-2xl bg-white/80 backdrop-blur-sm border border-blue-100/60 p-6 shadow-sm hover:shadow-xl hover:shadow-blue-200/40 transition-all duration-300 hover:-translate-y-2 hover:border-blue-300"
            >
              {/* Garis aksen warna di bagian atas kartu saat di-hover */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-blue-300 rounded-t-2xl scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

              {/* Icon Container */}
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100/50 text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-blue-500/30 transition-all duration-300">
                {item.icon}
              </div>

              {/* Title */}
              <h3 className="mt-5 text-lg font-semibold text-slate-800 group-hover:text-slate-900 transition-colors">
                {item.title}
              </h3>

              {/* Desc */}
              <p className="mt-3 text-sm leading-relaxed text-slate-500 group-hover:text-slate-600 transition-colors">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}