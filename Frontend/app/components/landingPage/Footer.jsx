"use client";

import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="relative bg-slate-950 text-slate-300 overflow-hidden">
      
      {/* 🌟 Background Glowing Blob Profesional (Hanya Biru) */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* 🔥 Garis Aksen Biru Tipis di Bagian Paling Atas */}
      <div className="relative z-10 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

      {/* Top Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 lg:py-20 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        
        {/* 1. Logo & Deskripsi */}
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-full shadow-lg shadow-blue-500/20">
              <Image
                src="/logo/logoSS.png"
                alt="Smart School"
                width={38}
                height={38}
                className="object-contain"
              />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Smart <span className="text-blue-500">School</span>
              </h3>
              <p className="text-[10px] font-medium text-slate-400 tracking-wider uppercase mt-0.5">
                School Management System
              </p>
            </div>
          </div>

          <p className="mt-5 leading-7 text-slate-400 text-sm">
            Platform digital terpadu untuk membantu sekolah mengelola administrasi, akademik, keuangan, absensi, dan komunikasi dalam satu sistem.
          </p>

          {/* 🌟 Sosial Media dengan Warna Biru Profesional */}
          <div className="mt-6 flex gap-3">
            <a
              href="#"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800/80 text-slate-400 transition-all duration-300 hover:bg-blue-600 hover:text-white hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30"
            >
              <FaFacebookF size={16} />
            </a>
            <a
              href="#"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800/80 text-slate-400 transition-all duration-300 hover:bg-blue-600 hover:text-white hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30"
            >
              <FaInstagram size={16} />
            </a>
            <a
              href="#"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800/80 text-slate-400 transition-all duration-300 hover:bg-blue-600 hover:text-white hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30"
            >
              <FaLinkedinIn size={16} />
            </a>
            <a
              href="#"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800/80 text-slate-400 transition-all duration-300 hover:bg-blue-600 hover:text-white hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30"
            >
              <FaYoutube size={16} />
            </a>
          </div>
        </div>

        {/* 2. Navigasi */}
        <div>
          <h4 className="text-base font-bold text-white tracking-wide relative inline-block pb-2">
            Navigasi
            <span className="absolute bottom-0 left-0 w-8 h-0.5 bg-blue-500 rounded-full" />
          </h4>
          <ul className="mt-6 space-y-3.5">
            <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors duration-200">Beranda</a></li>
            <li><a href="#fitur" className="text-slate-400 hover:text-blue-400 transition-colors duration-200">Fitur</a></li>
            <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors duration-200">Modul</a></li>
            <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors duration-200">Harga</a></li>
            <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors duration-200">FAQ</a></li>
          </ul>
        </div>

        {/* 3. Modul */}
        <div>
          <h4 className="text-base font-bold text-white tracking-wide relative inline-block pb-2">
            Modul
            <span className="absolute bottom-0 left-0 w-8 h-0.5 bg-blue-500 rounded-full" />
          </h4>
          <ul className="mt-6 space-y-3.5">
            <li className="text-slate-400 hover:text-blue-400 transition-colors duration-200 cursor-default">Akademik</li>
            <li className="text-slate-400 hover:text-blue-400 transition-colors duration-200 cursor-default">Absensi</li>
            <li className="text-slate-400 hover:text-blue-400 transition-colors duration-200 cursor-default">Keuangan</li>
            <li className="text-slate-400 hover:text-blue-400 transition-colors duration-200 cursor-default">PPDB</li>
            <li className="text-slate-400 hover:text-blue-400 transition-colors duration-200 cursor-default">E-Learning</li>
          </ul>
        </div>

        {/* 4. Kontak - Card Glassmorphism dengan Aksen Biru */}
        <div>
          <h4 className="text-base font-bold text-white tracking-wide relative inline-block pb-2">
            Hubungi Kami
            <span className="absolute bottom-0 left-0 w-8 h-0.5 bg-blue-500 rounded-full" />
          </h4>
          
          <div className="mt-6 space-y-5 bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-2xl hover:border-blue-500/50 transition-all duration-300 shadow-lg shadow-blue-900/20">
            <div className="flex gap-3 items-start">
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
                <MapPin size={16} />
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Jl. Pendidikan No.123,<br />Jakarta, Indonesia
              </p>
            </div>

            <div className="flex gap-3 items-center">
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
                <Phone size={16} />
              </div>
              <p className="text-sm text-slate-300">+62 812 3456 7890</p>
            </div>

            <div className="flex gap-3 items-center">
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
                <Mail size={16} />
              </div>
              <p className="text-sm text-slate-300">info@smartschool.id</p>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Section */}
      <div className="relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} <span className="text-slate-300 font-medium">Smart School</span>. All Rights Reserved.
          </p>

          <div className="flex gap-6 text-xs text-slate-500">
            <a href="#" className="hover:text-blue-400 hover:underline transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-blue-400 hover:underline transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>

    </footer>
  );
}