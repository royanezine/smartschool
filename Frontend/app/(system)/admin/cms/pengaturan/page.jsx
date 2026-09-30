// app/cmsAdmin/pengaturan/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";
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
      description:
        "Hubungkan akun Facebook, Instagram, YouTube, dan lainnya.",
      icon: Share2,
      route: "/cmsAdmin/pengaturan/sosial-media",
      count: "5 Platform",
    },
    {
      id: "tampilan",
      title: "Pengaturan Tampilan",
      description:
        "Sesuaikan tema warna, jenis font, dan layout website.",
      icon: Palette,
      route: "/cmsAdmin/pengaturan/tampilan",
      count: "3 Pengaturan",
    },
  ];

  return (
    <div className="flex min-h-screen w-full theme-page">
      <Sidebar
        active={active}
        setActive={setActive}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* ===== HEADER ===== */}
        <Header
          title="Pengaturan CMS"
          user={{
            name: "CMS Admin",
            email: "cms@smartschool.com",
            avatar: "CA",
          }}
          notifications={[]}
        />

        <main className="flex-1 min-w-0 overflow-y-auto p-4 md:p-6 lg:p-8 theme-page">
          <div className="w-full min-w-0 max-w-6xl mx-auto space-y-7">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm">
              <a
                href="/cmsAdmin"
                className="theme-text-muted hover:text-[var(--color-primary)] transition"
              >
                Dashboard
              </a>

              <ChevronRight className="w-4 h-4 theme-text-placeholder" />

              <span className="text-[var(--color-primary)] font-semibold">
                Pengaturan
              </span>
            </nav>

            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="shrink-0 p-3 rounded-xl theme-info border">
                <Settings className="w-6 h-6" />
              </div>

              <div>
                <h1 className="text-2xl font-bold theme-text">
                  Pengaturan CMS
                </h1>

                <p className="text-sm theme-text-muted mt-1">
                  Konfigurasikan semua aspek website sekolah dari satu
                  tempat.
                </p>
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
                    className="
                      group text-left
                      theme-card
                      border theme-border
                      rounded-xl p-4
                      hover:border-[var(--color-primary)]
                      hover:shadow-md
                      transition-all duration-200
                    "
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="
                          p-2 rounded-lg
                          theme-info
                          border
                          transition-colors
                        "
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[11px] font-medium theme-text-muted truncate">
                          {item.title}
                        </p>

                        <p className="text-sm font-bold theme-text">
                          {item.count}
                        </p>
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
                    className="
                      group text-left
                      theme-card
                      border theme-border
                      rounded-xl p-5
                      hover:border-[var(--color-primary)]
                      hover:shadow-lg
                      transition-all duration-200
                      flex flex-col
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
                        <h3
                          className="
                            text-base font-semibold theme-text
                            group-hover:text-[var(--color-primary)]
                            transition-colors
                          "
                        >
                          {item.title}
                        </h3>

                        <p className="text-sm theme-text-muted mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t theme-border flex items-center justify-end">
                      <span
                        className="
                          inline-flex items-center gap-1.5
                          text-sm font-medium
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

            {/* Tips */}
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
                  <strong className="theme-text">
                    Identitas Website
                  </strong>{" "}
                  terlebih dahulu. Selanjutnya, lengkapi{" "}
                  <strong className="theme-text">SEO</strong> agar website
                  mudah ditemukan, lalu sesuaikan{" "}
                  <strong className="theme-text">Tampilan</strong> dengan
                  branding sekolah Anda.
                </p>
              </div>
            </div>

            {/* Footer */}
            <footer className="pt-4 border-t theme-border text-center text-xs theme-text-muted">
              © 2026 SmartSchool CMS • Pengaturan
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}