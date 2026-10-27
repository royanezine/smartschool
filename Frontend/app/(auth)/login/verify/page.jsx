"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AlertCircle, ArrowLeft, ShieldCheck } from "lucide-react";

const IDENTIFIER_KEY = "login_identifier";


export default function VerifyLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = sessionStorage.getItem(IDENTIFIER_KEY);

        if (saved) {
          setIdentifier(saved);
        }
      } catch {
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleBackToLogin = () => {
    try {
      sessionStorage.removeItem(IDENTIFIER_KEY);
    } catch {
    }

    router.push("/login");
  };

  return (
    <main className="relative min-h-screen overflow-hidden flex items-center justify-center">
      <Image
        src="/hero/hero.png"
        alt="Smart School"
        fill
        priority
        className="object-cover"
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.65) 35%, rgba(255,255,255,0.3) 65%, rgba(255,255,255,0.65) 100%)",
        }}
      />

      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400" />

      <div className="relative z-10 w-full max-w-md px-6 py-10">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="relative w-10 h-10 rounded-lg bg-white flex items-center justify-center overflow-hidden shadow-sm">
            <Image
              src="/logo/logoSS.png"
              alt="Smart School Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>

          <span className="font-bold text-lg text-slate-900">
            SMART <span className="text-blue-600">SCHOOL</span>
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-7">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-3">
              <AlertCircle size={25} className="text-amber-500" />
            </div>

            <h1 className="font-bold text-xl text-slate-900">
              Verifikasi Login Belum Tersedia
            </h1>

            <p className="text-sm text-gray-500 mt-1 leading-5">
              Login dengan kode OTP belum didukung oleh server SmartSchool
              saat ini.
            </p>

            {identifier && (
              <p className="text-xs text-blue-600 font-medium mt-2 break-all">
                {identifier}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
            <p className="text-xs leading-5 text-amber-800">
              Halaman ini tidak mengirim permintaan ke server dan tidak
              membuat sesi login. Tidak ada alur login berbasis OTP pada
              Backend, sehingga login tidak dapat dinyatakan berhasil dari
              sini.
            </p>
          </div>

          <div className="mt-5">
            <p className="text-xs font-semibold text-slate-700 mb-2">
              Gunakan salah satu alur login yang tersedia:
            </p>

            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-xs leading-5 text-slate-600">
                <ShieldCheck
                  size={14}
                  className="mt-0.5 shrink-0 text-blue-600"
                />
                Email/username dan kata sandi untuk admin sekolah, guru, dan
                super admin.
              </li>

              <li className="flex items-start gap-2 text-xs leading-5 text-slate-600">
                <ShieldCheck
                  size={14}
                  className="mt-0.5 shrink-0 text-blue-600"
                />
                Siswa memasukkan kata sandi lebih dahulu, lalu membuat atau
                memverifikasi PIN 6 digit sesuai arahan server.
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={handleBackToLogin}
            className="w-full mt-6 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-lg transition duration-300 shadow-lg shadow-blue-200"
          >
            <ArrowLeft size={16} />
            Kembali ke halaman login
          </button>
        </div>

        <p className="text-center text-[11px] text-slate-500 mt-5">
          SmartSchool • Sistem Informasi Sekolah
        </p>
      </div>
    </main>
  );
}
