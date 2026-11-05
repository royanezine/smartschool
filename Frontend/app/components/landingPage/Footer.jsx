"use client";

import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";

const navLinks = [
  { label: "Beranda", href: "#" },
  { label: "Fitur", href: "#fitur" },
  { label: "Modul", href: "#" },
  { label: "Harga", href: "#" },
  { label: "FAQ", href: "#" },
];

const modules = ["Akademik", "Absensi", "Keuangan", "PPDB", "E-Learning"];

const socials = [
  { label: "Facebook", icon: FaFacebookF },
  { label: "Instagram", icon: FaInstagram },
  { label: "LinkedIn", icon: FaLinkedinIn },
  { label: "YouTube", icon: FaYoutube },
];

function ColumnTitle({ children }) {
  return (
    <h4 className="relative inline-block pb-2 text-base font-bold tracking-wide text-white">
      {children}
      <span className="absolute bottom-0 left-0 h-0.5 w-8 rounded-full bg-white/70" />
    </h4>
  );
}

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-blue-600 text-blue-100">
      {/* Pola kisi tipis, sama seperti kartu biru di section testimoni */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "linear-gradient(135deg, transparent 35%, black 100%)",
          WebkitMaskImage: "linear-gradient(135deg, transparent 35%, black 100%)",
        }}
      />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-2 lg:grid-cols-4 lg:py-20">
        {/* Brand */}
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white p-1 shadow-lg shadow-blue-900/20">
              <Image
                src="/logo/logoSS.png"
                alt="Smart School"
                width={38}
                height={38}
                className="object-contain"
              />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-white">
                Smart School
              </h3>
              <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-blue-200">
                School Management System
              </p>
            </div>
          </div>

          <p className="mt-5 text-sm leading-7 text-blue-100/90">
            Platform digital terpadu untuk membantu sekolah mengelola
            administrasi, akademik, keuangan, absensi, dan komunikasi dalam
            satu sistem.
          </p>

          <div className="mt-6 flex gap-3">
            {socials.map(({ label, icon: Icon }) => (
              <a
                key={label}
                href="#"
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-blue-600"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* Navigasi */}
        <div>
          <ColumnTitle>Navigasi</ColumnTitle>
          <ul className="mt-6 space-y-3.5">
            {navLinks.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="text-blue-100 transition-colors duration-200 hover:text-white hover:underline hover:underline-offset-4"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Modul */}
        <div>
          <ColumnTitle>Modul</ColumnTitle>
          <ul className="mt-6 space-y-3.5">
            {modules.map((item) => (
              <li
                key={item}
                className="cursor-default text-blue-100 transition-colors duration-200 hover:text-white"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Kontak */}
        <div>
          <ColumnTitle>Hubungi Kami</ColumnTitle>

          <div className="mt-6 space-y-5 rounded-2xl border border-white/20 bg-white/10 p-5 transition-colors duration-300 hover:border-white/40">
            <div className="flex items-start gap-3">
              <div className="shrink-0 rounded-lg bg-white/15 p-2 text-white">
                <MapPin size={16} />
              </div>
              <p className="text-sm leading-relaxed text-blue-50">
                Jl. Pendidikan No.123,
                <br />
                Jakarta, Indonesia
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="shrink-0 rounded-lg bg-white/15 p-2 text-white">
                <Phone size={16} />
              </div>
              <p className="text-sm text-blue-50">+62 812 3456 7890</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="shrink-0 rounded-lg bg-white/15 p-2 text-white">
                <Mail size={16} />
              </div>
              <p className="text-sm text-blue-50">info@smartschool.id</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bar bawah */}
      <div className="relative z-10 border-t border-white/20">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 md:flex-row">
          <p className="text-xs text-blue-100">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-white">Smart School</span>. All
            Rights Reserved.
          </p>

          <div className="flex gap-6 text-xs text-blue-100">
            <a
              href="#"
              className="transition-colors hover:text-white hover:underline hover:underline-offset-4"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="transition-colors hover:text-white hover:underline hover:underline-offset-4"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}