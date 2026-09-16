// app/cmsAdmin/pengaturan/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import {
  Settings,
  Globe,
  Search,
  Share2,
  Palette,
  ArrowRight,
  Monitor,
  ChevronRight,
} from "lucide-react";

export default function PengaturanPage() {
  const router = useRouter();

  const [active, setActive] = useState("pengaturan");
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      id: "identitas",
      title: "Identitas Website",
      description: "Atur nama, deskripsi, logo, favicon, dan kontak sekolah.",
      icon: Globe,
      route: "/cmsAdmin/pengaturan/identitas",
      count: "1 Pengaturan",
    },
    {
      id: "seo",
      title: "SEO",
      description: "Optimalkan meta title, description, dan script tracking.",
      icon: Search,
      route: "/cmsAdmin/pengaturan/seo",
      count: "4 Pengaturan",
    },
    {
      id: "sosial-media",
      title: "Sosial Media",
      description: "Hubungkan akun Facebook, Instagram, YouTube, dan lainnya.",
      icon: Share2,
      route: "/cmsAdmin/pengaturan/sosial-media",
      count: "5 Platform",
    },
    {
      id: "tampilan",
      title: "Pengaturan Tampilan",
      description: "Sesuaikan tema warna, jenis font, dan layout website.",
      icon: Palette,
      route: "/cmsAdmin/pengaturan/tampilan",
      count: "3 Pengaturan",
    },
  ];

  return (
    <div className="flex min-h-screen w-full bg-white">
      <Sidebar
        active={active}
        setActive={setActive}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* ===== HEADER dengan CMS Admin ===== */}
        <Header
          title="Pengaturan CMS"
          user={{
            name: "CMS Admin",
            email: "cms@smartschool.com",
            avatar: "CA",
          }}
          notifications={[]}
        />

        <main className="flex-1 min-w-0 overflow-y-auto p-4 md:p-6 lg:p-8 bg-white">
          <div className="w-full min-w-0 max-w-6xl mx-auto space-y-7">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-slate-500">
              <a href="/cmsAdmin" className="hover:text-blue-800 transition">Dashboard</a>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="text-blue-800 font-semibold">Pengaturan</span>
            </nav>

            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="shrink-0 p-3 rounded-xl bg-blue-900/10 text-blue-900">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Pengaturan CMS</h1>
                <p className="text-sm text-slate-500 mt-1">Konfigurasikan semua aspek website sekolah dari satu tempat.</p>
              </div>
            </div>

            {/* Ringkasan */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => router.push(item.route)}
                    className="group text-left bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-900/30 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-800 group-hover:bg-blue-100 transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium text-slate-500 truncate">{item.title}</p>
                        <p className="text-sm font-bold text-slate-800">{item.count}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Kartu Pengaturan Utama */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => router.push(item.route)}
                    className="group text-left bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-900/40 hover:shadow-lg transition-all duration-200 flex flex-col"
                  >
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 p-3 rounded-xl bg-blue-50 text-blue-800 group-hover:bg-blue-100 transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-900 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-end">
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-800 group-hover:gap-2.5 transition-all">
                        Kelola
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Tips */}
            <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-5 flex items-start gap-4">
              <div className="shrink-0 p-2.5 bg-white rounded-lg shadow-sm text-blue-800 border border-blue-100">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-blue-900">Tips Konfigurasi</h4>
                <p className="text-sm text-blue-800/80 mt-1 leading-relaxed">
                  Pastikan Anda telah mengatur <strong>Identitas Website</strong> terlebih dahulu. 
                  Selanjutnya, lengkapi <strong>SEO</strong> agar website mudah ditemukan, 
                  lalu sesuaikan <strong>Tampilan</strong> dengan branding sekolah Anda.
                </p>
              </div>
            </div>

            {/* Footer */}
            <footer className="pt-4 border-t border-slate-200 text-center text-xs text-slate-400">
              © 2026 SmartSchool CMS • Pengaturan
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}