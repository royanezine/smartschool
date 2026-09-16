"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const menus = [
  { name: "Beranda", href: "#" },
  { name: "Fitur", href: "#fitur" },
  { name: "Penawaran", href: "#pricing" },
  { name: "Demo", href: "#demo" },
  { name: "Kontak", href: "#footer" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScroll, setIsScroll] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      setIsScroll(scrolled);
      
      // 🔥 CEK DI CONSOLE BROWSER (F12) UNTUK MEMASTIKAN LOGIKANYA
      console.log("Posisi Scroll:", window.scrollY, "Status Gelap/Transparan:", scrolled ? "Transparan (Tengah Scroll)" : "GELAP (Berhenti)");
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Variants untuk animasi mobile menu
  const mobileMenuVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.4,
        ease: "easeInOut",
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const mobileItemVariants = {
    hidden: {
      opacity: 0,
      x: -20,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  // Variants untuk logo dan teks
  const logoVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{
        duration: 0.5,
        ease: "easeOut",
      }}
      // LOGIKA DI SINI SUDAH BENAR (Sesuai permintaan Anda)
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b border-white/10 ${
        isScroll
          ? "bg-slate-900/70 backdrop-blur-lg"            // SAAT SCROLL (Transparan)
          : "bg-slate-900/90 backdrop-blur-xl shadow-2xl shadow-slate-900/20" // SAAT BERHENTI (Gelap)
      }`}
    >
      <div className="max-w-7xl mx-auto h-20 px-6 flex items-center justify-between">
        {/* =========================
            LOGO
        ========================= */}
        <motion.div
          variants={logoVariants}
          initial="initial"
          whileHover="hover"
        >
          <Link href="/" className="flex items-center gap-3">
            {/* Card putih di belakang logo */}
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{
                duration: 0.6,
                ease: "easeInOut",
              }}
              className="w-[42px] h-[42px] bg-white flex items-center justify-center rounded-xl"
            >
              <Image
                src="/logo/logoSS.png"
                alt="Logo SmartSchool"
                width={42}
                height={42}
                priority
                className="object-contain"
              />
            </motion.div>

            {/* Nama SmartSchool */}
            <div>
              <h1 className="text-xl font-bold text-white">
                Smart
                <motion.span
                  className="text-blue-400 inline-block"
                  whileHover={{
                    scale: 1.1,
                    color: "#60a5fa",
                  }}
                  transition={{ duration: 0.2 }}
                >
                  School
                </motion.span>
              </h1>
            </div>
          </Link>
        </motion.div>

        {/* =========================
            DESKTOP MENU
        ========================= */}
        <nav className="hidden lg:flex items-center gap-10">
          {menus.map((menu, index) => (
            <motion.a
              key={menu.name}
              href={menu.href}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
                ease: "easeOut",
              }}
              whileHover={{
                scale: 1.1,
                color: "#60a5fa",
              }}
              whileTap={{ scale: 0.95 }}
              className="text-[15px] font-medium text-slate-300 hover:text-blue-400 transition"
            >
              {menu.name}
            </motion.a>
          ))}
        </nav>

        {/* =========================
            DESKTOP BUTTONS
        ========================= */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Tombol Masuk */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.3,
              delay: 0.2,
            }}
          >
            <Link
              href="/login"
              className="text-[15px] font-medium text-slate-300 hover:text-blue-400 transition"
            >
              Masuk
            </Link>
          </motion.div>

          {/* Tombol Daftar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.3,
              delay: 0.3,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/daftar-sekolah"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl transition-all duration-300 font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
            >
              Daftar
            </Link>
          </motion.div>
        </div>

        {/* =========================
            HAMBURGER BUTTON
        ========================= */}
        <motion.button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-800 transition relative"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div
            animate={{
              rotate: isOpen ? 90 : 0,
            }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
          >
            {isOpen ? (
              <X size={28} className="text-white" />
            ) : (
              <Menu size={28} className="text-white" />
            )}
          </motion.div>
        </motion.button>
      </div>

      {/* =========================
          MOBILE MENU
      ========================= */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="lg:hidden absolute top-full left-0 w-full bg-slate-900/95 backdrop-blur-lg border-t border-slate-700/50 shadow-2xl overflow-hidden"
          >
            <nav className="flex flex-col px-6 py-5 gap-5">
              {/* Menu Mobile */}
              {menus.map((menu) => (
                <motion.a
                  key={menu.name}
                  href={menu.href}
                  onClick={() => setIsOpen(false)}
                  variants={mobileItemVariants}
                  whileHover={{
                    x: 10,
                    color: "#60a5fa",
                  }}
                  className="text-slate-300 font-medium hover:text-blue-400 transition"
                >
                  {menu.name}
                </motion.a>
              ))}

              <motion.hr
                variants={mobileItemVariants}
                className="border-slate-700/60"
              />

              {/* Masuk */}
              <motion.div variants={mobileItemVariants}>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="text-slate-300 font-medium hover:text-blue-400 transition block"
                >
                  Masuk
                </Link>
              </motion.div>

              {/* Daftar */}
              <motion.div
                variants={mobileItemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/daftar-sekolah"
                  onClick={() => setIsOpen(false)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-center py-3 rounded-xl transition shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 block"
                >
                  Daftar
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}