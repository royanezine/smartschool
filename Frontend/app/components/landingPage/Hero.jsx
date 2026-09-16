"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Play } from "lucide-react";

export default function Hero() {
  // 🎬 ANIMASI INFINITE YANG LEBIH TERLIHAT (Background zoom & geser)
  const bgAnimation = {
    scale: [1, 1.08, 1], // Zoom in/out lebih terasa
    x: [0, 30, 0],       // Geser ke kanan-kiri lebih jelas
    y: [0, -20, 0],      // Geser naik-turun lebih jelas
    transition: {
      duration: 14,      // Lebih cepat dari sebelumnya (28 -> 14 detik)
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  // 🎬 BADGE MELAYANG (Lebih cepat dan naik turunnya lebih tinggi)
  const badgeAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,       // 3 detik sekali putaran
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  // Animasi masuk bertahap dengan efek "Spring" ringan agar terasa hidup
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { 
        type: "spring", // Efek membal alami, sangat terlihat tapi halus
        stiffness: 80, 
        damping: 12 
      } 
    },
  };

  return (
    <section
      id="beranda"
      className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-white"
    >
      {/* 🎬 Background Image dengan Slow Cinematic Loop */}
      <motion.div
        className="absolute inset-0"
        animate={bgAnimation}
      >
        <Image
          src="/hero/herobg2.png"
          alt="Gedung SmartSchool"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        {/* Fade putih dari kiri */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0.98) 18%, rgba(255,255,255,0.82) 32%, rgba(255,255,255,0.35) 48%, rgba(255,255,255,0) 68%)",
          }}
        />

        {/* Fade bawah */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(255,255,255,0.35) 0%, transparent 30%)",
          }}
        />
      </motion.div>

      {/* Content */}
      {/*
        FIX RESPONSIVE — kenapa dulu ada ruang kosong gede di kiri:
        Container lama pakai `max-w-7xl mx-auto` (maks 1280px, dipusatkan).
        Begitu lebar layar > 1280px (laptop/monitor biasa udah 1440-1920px),
        sisa lebar itu otomatis jadi margin kosong simetris kiri-kanan.
        Karena teks di dalamnya cuma `max-w-xl` dan nempel ke kiri container,
        hasilnya keliatan seperti "bolong" lebar banget sebelum teks mulai.

        Solusinya di sini:
        1. Ganti breakpoint max-width jadi lebih lebar (max-w-[1800px]) supaya
           baru "berhenti melebar" di layar SANGAT lebar (ultrawide),
           bukan di 1280px.
        2. Padding kiri-kanan dibikin fluid/bertahap per breakpoint
           (px-6 di HP sampai xl:px-28 di layar besar) supaya jarak teks ke
           tepi layar terasa proporsional di semua ukuran, bukan cuma
           andalan margin otomatis dari mx-auto.
      */}
      <div className="relative z-10 min-h-[calc(100vh-80px)] flex items-center">
        <div className="w-full max-w-[1800px] mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-24 2xl:px-32">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-xl py-20 lg:py-28"
          >
            {/* Badge dengan Floating Loop */}
            <motion.div
              variants={itemVariants}
              animate={badgeAnimation}
              className="inline-flex items-center gap-2 rounded-full bg-blue-50/90 backdrop-blur-sm border border-blue-100 px-4 py-2 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-xs font-semibold tracking-wide text-blue-700 uppercase">
                SmartSchool
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={itemVariants}
              className="mt-6 text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-slate-900"
            >
              Kelola Sekolah Lebih Cerdas, Bersama{" "}
              <motion.span
                className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 5, // Lebih cepat berpindahnya
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  backgroundSize: "200% 200%",
                }}
              >
                SmartSchool
              </motion.span>
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="mt-6 max-w-lg text-base md:text-lg leading-8 text-slate-600"
            >
              Platform digital terintegrasi untuk membantu sekolah
              mengelola data siswa, guru, akademik, presensi, jadwal,
              dan administrasi dalam satu sistem yang aman dan mudah
              digunakan.
            </motion.p>

            {/* Buttons */}
            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              {/* Tombol Daftar - Dengan Glow Looping */}
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 50px -8px rgba(37, 99, 235, 0.5)",
                }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  // Shadownya berdenyut lebih cepat dan jelas
                  boxShadow: [
                    "0 10px 20px -8px rgba(37, 99, 235, 0.2)",
                    "0 25px 45px -8px rgba(37, 99, 235, 0.5)", // Cahaya lebih besar
                    "0 10px 20px -8px rgba(37, 99, 235, 0.2)",
                  ],
                }}
                transition={{
                  duration: 2.5, // 2.5 detik
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="
                  inline-flex items-center gap-3
                  bg-gradient-to-r from-blue-600 to-indigo-600
                  hover:from-blue-700 hover:to-indigo-700
                  text-white
                  px-7 py-3.5
                  rounded-xl
                  font-semibold
                  shadow-lg shadow-blue-600/25
                  transition-all duration-300
                "
              >
                Daftar Sekarang
                {/* Panah bergerak maju mundur lebih jauh */}
                <motion.span
                  animate={{ x: [0, 12, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2, // 2 detik sekali bolak-balik
                    repeatType: "mirror",
                    ease: "easeInOut"
                  }}
                >
                  <ArrowRight size={19} />
                </motion.span>
              </motion.button>

              {/* Tombol Demo */}
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  backgroundColor: "rgba(255,255,255,1)",
                  borderColor: "#2563eb",
                  color: "#2563eb"
                }}
                whileTap={{ scale: 0.95 }}
                className="
                  inline-flex items-center gap-3
                  border border-slate-300
                  bg-white/80
                  backdrop-blur-sm
                  text-slate-700
                  px-7 py-3.5
                  rounded-xl
                  font-semibold
                  transition-all duration-300
                "
              >
                <Play size={18} />
                Lihat Demo
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}