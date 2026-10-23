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

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleNavClick = (e, href) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    setIsOpen(false);

    if (!href || href === "#") {
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }, 50);
      return;
    }

    if (href.startsWith("#")) {
      const targetId = href.replace("#", "");
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          const navbarHeight = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - navbarHeight;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }, 50);
    }
  };

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
      className={`fixed top-0 inset-x-0 w-full z-50 transition-all duration-300 border-b ${
        isScroll
          ? "bg-white/90 backdrop-blur-xl border-[#0F2A66]/10 shadow-lg shadow-[#0F2A66]/10"
          : "bg-white/70 backdrop-blur-md border-white/60 shadow-sm shadow-[#0F2A66]/5"
      }`}
    >
      <div className="max-w-7xl mx-auto h-20 px-6 flex items-center justify-between">
        <motion.div
          variants={logoVariants}
          initial="initial"
          whileHover="hover"
        >
          <Link href="/" className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{
                duration: 0.6,
                ease: "easeInOut",
              }}
              className="w-[42px] h-[42px] bg-white flex items-center justify-center rounded-xl shadow-md shadow-[#0F2A66]/10 ring-1 ring-[#0F2A66]/10"
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

            <div>
              <h1 className="text-xl font-bold text-[#0B1F4F]">
                Smart
                <motion.span
                  className="text-[#1F6AE0] inline-block font-extrabold"
                  whileHover={{
                    scale: 1.05,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  School
                </motion.span>
              </h1>
            </div>
          </Link>
        </motion.div>

        <nav className="hidden lg:flex items-center gap-8">
          {menus.map((menu, index) => (
            <motion.a
              key={menu.name}
              href={menu.href}
              onClick={(e) => handleNavClick(e, menu.href)}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
                ease: "easeOut",
              }}
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{ scale: 0.95 }}
              className="text-[14px] font-semibold text-[#0B1F4F]/80 hover:text-[#1F6AE0] hover:bg-[#1F6AE0]/10 px-3.5 py-1.5 rounded-lg transition-colors"
            >
              {menu.name}
            </motion.a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
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
              className="text-[14px] font-semibold text-[#0B1F4F]/80 hover:text-[#1F6AE0] hover:bg-[#1F6AE0]/10 px-4 py-2 rounded-xl transition-colors"
            >
              Masuk
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.3,
              delay: 0.3,
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Link
              href="/daftar-sekolah"
              className="bg-[#1A5CFF] hover:bg-[#1450E6] text-white px-5 py-2.5 rounded-xl transition-all duration-200 font-semibold text-[14px] shadow-lg shadow-[#1A5CFF]/30 hover:shadow-xl hover:shadow-[#1A5CFF]/40 block"
            >
              Daftar
            </Link>
          </motion.div>
        </div>

        <motion.button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 rounded-lg hover:bg-[#1F6AE0]/10 text-[#0B1F4F] transition-colors relative"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Toggle Menu"
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
              <X size={24} className="text-[#0B1F4F]" />
            ) : (
              <Menu size={24} className="text-[#0B1F4F]" />
            )}
          </motion.div>
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="lg:hidden absolute top-full inset-x-0 w-full bg-white/95 backdrop-blur-xl border-b border-[#0F2A66]/10 shadow-xl shadow-[#0F2A66]/10 overflow-hidden"
          >
            <nav className="flex flex-col px-6 py-5 gap-3">
              {menus.map((menu) => (
                <motion.a
                  key={menu.name}
                  href={menu.href}
                  onClick={(e) => handleNavClick(e, menu.href)}
                  variants={mobileItemVariants}
                  whileHover={{
                    x: 6,
                  }}
                  className="text-[#0B1F4F]/80 font-semibold hover:text-[#1F6AE0] hover:bg-[#1F6AE0]/10 px-3 py-2 rounded-lg transition-colors"
                >
                  {menu.name}
                </motion.a>
              ))}

              <motion.hr
                variants={mobileItemVariants}
                className="border-[#0F2A66]/10 my-1"
              />

              <motion.div variants={mobileItemVariants}>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="text-[#0B1F4F]/80 font-semibold hover:text-[#1F6AE0] hover:bg-[#1F6AE0]/10 px-3 py-2 rounded-lg transition-colors block"
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
                  href="/daftar-sekolah"
                  onClick={() => setIsOpen(false)}
                  className="bg-[#1A5CFF] hover:bg-[#1450E6] text-white text-center py-2.5 rounded-xl transition shadow-lg shadow-[#1A5CFF]/30 block font-semibold text-[14px]"
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