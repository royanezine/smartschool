"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Play } from "lucide-react";

export default function Hero() {
  const bgAnimation = {
    scale: [1, 1.08, 1], 
    x: [0, 30, 0],       
    y: [0, -20, 0],      
    transition: {
      duration: 14,      
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  const badgeAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,       
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

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
        type: "spring", 
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

        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0.98) 18%, rgba(255,255,255,0.82) 32%, rgba(255,255,255,0.35) 48%, rgba(255,255,255,0) 68%)",
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(255,255,255,0.35) 0%, transparent 30%)",
          }}
        />
      </motion.div>

      <div className="relative z-10 min-h-[calc(100vh-80px)] flex items-center">
        <div className="w-full max-w-[1800px] mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-24 2xl:px-32">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-xl py-20 lg:py-28"
          >
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

            <motion.h1
              variants={itemVariants}
              className="mt-6 text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-slate-900"
            >
              Kelola Sekolah Lebih Cerdas, Bersama{" "}
              <span className="text-blue-600 inline-block">
                SmartSchool
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-6 max-w-lg text-base md:text-lg leading-8 text-slate-600"
            >
              Platform digital terintegrasi untuk membantu sekolah
              mengelola data siswa, guru, akademik, presensi, jadwal,
              dan administrasi dalam satu sistem yang aman dan mudah
              digunakan.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 50px -8px rgba(37, 99, 235, 0.5)",
                }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: [
                    "0 10px 20px -8px rgba(37, 99, 235, 0.2)",
                    "0 25px 45px -8px rgba(37, 99, 235, 0.5)", 
                    "0 10px 20px -8px rgba(37, 99, 235, 0.2)",
                  ],
                }}
                transition={{
                  duration: 2.5, 
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="
                  inline-flex items-center gap-3
                  bg-blue-600 hover:bg-blue-700
                  text-white
                  px-7 py-3.5
                  rounded-xl
                  font-semibold
                  shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30
                  transition-all duration-300
                "
              >
                Daftar Sekarang
                <motion.span
                  animate={{ x: [0, 12, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2, 
                    repeatType: "mirror",
                    ease: "easeInOut"
                  }}
                >
                  <ArrowRight size={19} />
                </motion.span>
              </motion.button>

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