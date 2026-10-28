"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  Settings,
  Globe,
  Palette,
  ArrowRight,
  Monitor,
  ChevronRight,
} from "lucide-react";

export default function PengaturanPage() {
  const router = useRouter();

  const [active, setActive] = useState("pengaturan");
  const [collapsed, setCollapsed] = useState(false);

  // Menu SEO dan Sosial Media telah dihapus
  const menuItems = [
    {
      id: "identitas",
      title: "Identitas Website",
      description: "Atur nama, deskripsi, logo, favicon, dan kontak sekolah.",
      icon: Globe,
      route: "/admin/cms/pengaturan/identitas",
      count: "1 Pengaturan",
    },
    {
      id: "tampilan",
      title: "Pengaturan Tampilan",
      description: "Sesuaikan tema warna, jenis font, dan layout website.",
      icon: Palette,
      route: "/admin/cms/pengaturan/tampilan",
      count: "3 Pengaturan",
    },
  ];

  return (
    // ROOT: h-screen overflow-hidden agar halaman tidak bisa scroll
    <div className="theme-page flex h-screen w-full overflow-hidden">
      
      <Sidebar
        active={active}
        setActive={setActive}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* BODY: min-h-0 flex-1 agar sidebar + main sejajar */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        
        {/* HEADER: shrink-0 agar tetap di atas */}
        <div className="shrink-0 border-b theme-border">
          <Header
            title="Pengaturan CMS"
            user={{
              name: "CMS Admin",
              email: "cms@smartschool.com",
              avatar: "CA",
            }}
            notifications={[]}
          />
        </div>

        {/* MAIN: min-w-0 flex-1 overflow-y-auto agar hanya ini yang scroll */}
        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          
          {/* KONTEN: w-full tanpa max-w agar melebar saat zoom out */}
          <div className="w-full px-4 py-6 md:px-6 lg:px-8 space-y-7">
            
            {/* BREADCRUMB */}
            <nav className="flex items-center gap-2 text-sm">
              <a
                href="/admin/cms"
                className="theme-text-muted hover:text-[var(--color-primary)] transition"
              >
                Dashboard
              </a>
              <ChevronRight className="w-4 h-4 theme-text-placeholder" />
              <span className="text-[var(--color-primary)] font-semibold">
                Pengaturan
              </span>
            </nav>

            {/* HEADER PAGE */}
            <div className="flex items-start gap-4">
              <div className="shrink-0 p-3 rounded-xl theme-info border">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold theme-text">
                  Pengaturan CMS
                </h1>
                <p className="text-sm theme-text-muted mt-1 max-w-2xl">
                  Konfigurasikan identitas dan tampilan website sekolah dari satu tempat.
                </p>
              </div>
            </div>

            {/* GRID MENU UTAMA */}
            {/* Grid responsif, 2xl:grid-cols-6 untuk stat cards/menu card */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-6">
              {menuItems.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => router.push(item.route)}
                    className="
                      group text-left
                      theme-card
                      border theme-border
                      rounded-xl p-5
                      hover:border-[var(--color-primary)]
                      hover:shadow-lg
                      transition-all duration-200
                      flex flex-col
                      md:col-span-1
                      2xl:col-span-3
                    "
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="
                          shrink-0 p-3 rounded-xl
                          theme-info
                          border
                          transition-colors
                        "
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3
                            className="
                              text-base font-semibold theme-text
                              group-hover:text-[var(--color-primary)]
                              transition-colors
                            "
                          >
                            {item.title}
                          </h3>
                          
                          {/* Badge Count */}
                          <span className="inline-flex items-center rounded-md bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] px-2 py-1 text-[10px] font-bold theme-text-muted">
                            {item.count}
                          </span>
                        </div>

                        <p className="text-sm theme-text-muted mt-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t theme-border flex items-center justify-end">
                      <span
                        className="
                          inline-flex items-center gap-1.5
                          text-sm font-bold
                          text-[var(--color-primary)]
                          group-hover:gap-2.5
                          transition-all
                        "
                      >
                        Kelola
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* TIPS KONFIGURASI */}
            <div className="theme-info border rounded-xl p-5 flex items-start gap-4">
              <div
                className="
                  shrink-0 p-2.5
                  theme-card
                  rounded-lg
                  shadow-sm
                  border theme-border
                "
              >
                <Monitor className="w-5 h-5" />
              </div>

              <div>
                <h4 className="text-sm font-semibold theme-text">
                  Tips Konfigurasi
                </h4>
                <p className="text-sm theme-text-secondary mt-1 leading-relaxed">
                  Pastikan Anda telah mengatur{" "}
                  <strong className="theme-text">Identitas Website</strong>{" "}
                  terlebih dahulu. Selanjutnya, sesuaikan{" "}
                  <strong className="theme-text">Tampilan</strong> dengan branding sekolah Anda agar website terlihat lebih profesional.
                </p>
              </div>
            </div>

            {/* FOOTER */}
            <footer className="pt-4 border-t theme-border text-center text-xs theme-text-muted">
              © 2026 SmartSchool CMS • Pengaturan
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}