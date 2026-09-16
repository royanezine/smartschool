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
    <footer className="bg-slate-950 text-gray-300">

      {/* Top */}
      <div className="max-w-7xl mx-auto px-6 py-20 grid gap-12 md:grid-cols-2 lg:grid-cols-4">

        {/* Logo */}
        <div>

          <div className="flex items-center gap-3">

            <Image
                src="/logo/logoSS.png"
                alt="Smart School"
                width={45}
                height={45}
                />

            <div>

              <h3 className="text-xl font-bold text-white">
                Smart School
              </h3>

              <p className="text-sm text-gray-400">
                School Management System
              </p>

            </div>

          </div>

          <p className="mt-6 leading-7 text-gray-400">
            Platform digital terpadu untuk membantu sekolah
            mengelola administrasi, akademik, keuangan,
            absensi, dan komunikasi dalam satu sistem.
          </p>

          <div className="mt-6 flex gap-3">
                <a
                    href="#"
                    className="rounded-xl bg-slate-800 p-3 hover:bg-blue-600 transition"
                >
                    <FaFacebookF size={18} />
                </a>

                <a
                    href="#"
                    className="rounded-xl bg-slate-800 p-3 hover:bg-pink-600 transition"
                >
                    <FaInstagram size={18} />
                </a>

                <a
                    href="#"
                    className="rounded-xl bg-slate-800 p-3 hover:bg-blue-500 transition"
                >
                    <FaLinkedinIn size={18} />
                </a>

                <a
                    href="#"
                    className="rounded-xl bg-slate-800 p-3 hover:bg-red-600 transition"
                >
                    <FaYoutube size={18} />
                </a>
                </div>

        </div>

        {/* Menu */}
        <div>

          <h4 className="text-lg font-semibold text-white">
            Navigasi
          </h4>

          <ul className="mt-6 space-y-4">

            <li><a href="#" className="hover:text-white">Beranda</a></li>
            <li><a href="#fitur" className="hover:text-white">Fitur</a></li>
            <li><a href="#" className="hover:text-white">Modul</a></li>
            <li><a href="#" className="hover:text-white">Harga</a></li>
            <li><a href="#" className="hover:text-white">FAQ</a></li>

          </ul>

        </div>

        {/* Modul */}
        <div>

          <h4 className="text-lg font-semibold text-white">
            Modul
          </h4>

          <ul className="mt-6 space-y-4">

            <li>Akademik</li>
            <li>Absensi</li>
            <li>Keuangan</li>
            <li>PPDB</li>
            <li>E-Learning</li>

          </ul>

        </div>

        {/* Contact */}
        <div>

          <h4 className="text-lg font-semibold text-white">
            Hubungi Kami
          </h4>

          <div className="mt-6 space-y-5">

            <div className="flex gap-3">

              <MapPin className="text-blue-500 mt-1" size={18} />

              <p>
                Jl. Pendidikan No.123,
                <br />
                Jakarta, Indonesia
              </p>

            </div>

            <div className="flex gap-3">

              <Phone className="text-blue-500 mt-1" size={18} />

              <p>+62 812 3456 7890</p>

            </div>

            <div className="flex gap-3">

              <Mail className="text-blue-500 mt-1" size={18} />

              <p>info@smartschool.id</p>

            </div>

          </div>

        </div>

      </div>

      {/* Bottom */}

      <div className="border-t border-slate-800">

        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">

          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Smart School. All Rights Reserved.
          </p>

          <div className="flex gap-6 text-sm text-gray-500">

            <a href="#" className="hover:text-white">
              Privacy Policy
            </a>

            <a href="#" className="hover:text-white">
              Terms of Service
            </a>

          </div>

        </div>

      </div>

    </footer>
  );
}