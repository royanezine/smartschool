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
      setIsScroll(window.scrollY > 20);
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
        ease: "easeInOut"
      }
    },
    visible: { 
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.4,
        ease: "easeInOut",
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const mobileItemVariants = {
    hidden: { 
      opacity: 0,
      x: -20
    },
    visible: { 
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  // Variants untuk logo dan teks
  const logoVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ 
        duration: 0.5,
        ease: "easeOut"
      }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScroll
          ? "bg-white/90 backdrop-blur-md shadow-lg"
          : "bg-white/80 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto h-20 px-6 flex items-center justify-between">
        {/* Logo dengan animasi hover */}
        <motion.div
          variants={logoVariants}
          initial="initial"
          whileHover="hover"
        >
          <Link href="/" className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <Image
                src="/logo/logoSS.png"
                alt="Logo"
                width={42}
                height={42}
                priority
                className="object-contain"
              />
            </motion.div>

            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Smart
                <motion.span 
                  className="text-blue-600 inline-block"
                  whileHover={{ 
                    scale: 1.1,
                    color: "#2563eb"
                  }}
                  transition={{ duration: 0.2 }}
                >
                  School
                </motion.span>
              </h1>
            </div>
          </Link>
        </motion.div>

        {/* Desktop Menu dengan animasi */}
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
                ease: "easeOut"
              }}
              whileHover={{ 
                scale: 1.1,
                color: "#2563eb"
              }}
              whileTap={{ scale: 0.95 }}
              className="text-[15px] font-medium text-gray-700 hover:text-blue-600 transition"
            >
              {menu.name}
            </motion.a>
          ))}
        </nav>

        {/* Desktop Buttons dengan animasi */}
        <div className="hidden lg:flex items-center gap-4">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Link
              href="/login"
              className="text-[15px] font-medium text-gray-700 hover:text-blue-600 transition"
            >
              Masuk
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg transition-all duration-300 font-medium shadow-lg hover:shadow-blue-500/30"
            >
              Daftar
            </Link>
          </motion.div>
        </div>

        {/* Hamburger Button dengan animasi */}
        <motion.button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition relative"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {isOpen ? (
              <X size={28} className="text-slate-700" />
            ) : (
              <Menu size={28} className="text-slate-700" />
            )}
          </motion.div>
        </motion.button>
      </div>

      {/* Mobile Menu dengan animasi lebih halus */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="lg:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-sm border-t shadow-2xl overflow-hidden"
          >
            <nav className="flex flex-col px-6 py-5 gap-5">
              {menus.map((menu) => (
                <motion.a
                  key={menu.name}
                  href={menu.href}
                  onClick={() => setIsOpen(false)}
                  variants={mobileItemVariants}
                  whileHover={{ 
                    x: 10,
                    color: "#2563eb"
                  }}
                  className="text-gray-700 font-medium hover:text-blue-600 transition"
                >
                  {menu.name}
                </motion.a>
              ))}

              <motion.hr 
                variants={mobileItemVariants}
                className="border-gray-200"
              />

              <motion.div variants={mobileItemVariants}>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-700 font-medium hover:text-blue-600 transition block"
                >
                  Masuk
                </Link>
              </motion.div>

              <motion.div 
                variants={mobileItemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg transition shadow-lg hover:shadow-blue-500/30 block"
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