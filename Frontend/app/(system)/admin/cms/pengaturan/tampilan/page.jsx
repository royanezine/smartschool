// app/cmsAdmin/pengaturan/tampilan/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../../../components/Header";
import Sidebar from "../../../../../components/Sidebar";
import {
  Save,
  Palette,
  Monitor,
  Type,
  Layout as LayoutIcon,
  ChevronRight,
  Sparkles,
  Sun,
  Moon,
  Laptop,
  Check,
  Eye,
} from "lucide-react";

export default function TampilanPage() {
  const router = useRouter();

  const [active, setActive] = useState("pengaturan");
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    theme: "light",
    font: "sans",
    layout: "fullwidth",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      alert("✅ Pengaturan Tampilan berhasil disimpan!");
    }, 1500);
  };

  const themeOptions = [
    {
      value: "light",
      label: "Terang",
      icon: Sun,
    },
    {
      value: "dark",
      label: "Gelap",
      icon: Moon,
    },
    {
      value: "system",
      label: "Sistem",
      icon: Laptop,
    },
  ];

  const fontOptions = [
    {
      value: "sans",
      label: "Sans Serif",
      desc: "Modern & bersih",
    },
    {
      value: "serif",
      label: "Serif",
      desc: "Klasik & elegan",
    },
    {
      value: "mono",
      label: "Monospace",
      desc: "Teknologi & tegas",
    },
  ];

  const layoutOptions = [
    {
      value: "fullwidth",
      label: "Full Width",
      desc: "Konten memenuhi layar",
    },
    {
      value: "boxed",
      label: "Boxed",
      desc: "Konten terpusat",
    },
  ];

  const getThemeIcon = () => {
    switch (form.theme) {
      case "light":
        return Sun;
      case "dark":
        return Moon;
      default:
        return Laptop;
    }
  };

  const ThemeIcon = getThemeIcon();

  const getFontClass = () => {
    switch (form.font) {
      case "serif":
        return "font-serif";
      case "mono":
        return "font-mono";
      default:
        return "font-sans";
    }
  };

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
          title="Pengaturan Tampilan"
          user={{
            name: "CMS Admin",
            email: "cms@smartschool.com",
            avatar: "CA",
          }}
          notifications={[]}
        />

        <main className="flex-1 min-w-0 overflow-y-auto p-4 md:p-6 lg:p-8 theme-page">
          <div className="w-full min-w-0 max-w-none space-y-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm">
              <a
                href="/cmsAdmin"
                className="theme-text-muted hover:text-[var(--color-primary)] transition"
              >
                Dashboard
              </a>

              <ChevronRight className="w-4 h-4 theme-text-placeholder" />

              <a
                href="/cmsAdmin/pengaturan"
                className="theme-text-muted hover:text-[var(--color-primary)] transition"
              >
                Pengaturan
              </a>

              <ChevronRight className="w-4 h-4 theme-text-placeholder" />

              <span className="theme-text font-semibold">
                Tampilan
              </span>
            </nav>

            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="shrink-0 p-3 rounded-xl theme-info border">
                <Palette className="w-6 h-6" />
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full theme-info border text-[10px] font-bold uppercase tracking-wider mb-1.5">
                  <Sparkles className="w-3 h-3" />
                  Tampilan Website
                </div>

                <h1 className="text-2xl font-bold theme-text">
                  Pengaturan Tampilan
                </h1>

                <p className="text-sm theme-text-muted mt-1">
                  Sesuaikan tema, font, dan layout tampilan website publik
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Theme Card */}
              <div className="theme-card rounded-xl border theme-border shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b theme-border theme-card-soft flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold theme-text flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-[var(--color-primary)]" />
                      Tema Warna
                    </h3>

                    <p className="text-xs theme-text-muted mt-0.5">
                      Pilih tema yang sesuai dengan preferensi pengunjung
                    </p>
                  </div>

                  <span className="text-[10px] font-medium theme-text-muted theme-card px-2.5 py-1 rounded-full border theme-border">
                    Utama
                  </span>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {themeOptions.map((option) => {
                      const Icon = option.icon;
                      const isActive = form.theme === option.value;

                      return (
                        <label
                          key={option.value}
                          className={`
                            cursor-pointer relative flex items-center gap-3
                            px-4 py-3.5 rounded-xl border transition-all
                            ${
                              isActive
                                ? "theme-info border-[var(--color-primary)]"
                                : "theme-card theme-border theme-sidebar-hover"
                            }
                          `}
                        >
                          <input
                            type="radio"
                            name="theme"
                            value={option.value}
                            checked={isActive}
                            onChange={handleChange}
                            className="sr-only"
                          />

                          <div
                            className={`
                              p-1.5 rounded-lg
                              ${
                                isActive
                                  ? "text-[var(--color-primary)]"
                                  : "theme-text-muted"
                              }
                            `}
                          >
                            <Icon className="w-4 h-4" />
                          </div>

                          <span
                            className={`
                              text-sm font-medium
                              ${
                                isActive
                                  ? "text-[var(--color-primary)]"
                                  : "theme-text-secondary"
                              }
                            `}
                          >
                            {option.label}
                          </span>

                          {isActive && (
                            <div className="ml-auto">
                              <div className="w-5 h-5 rounded-full theme-primary flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            </div>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Font Card */}
              <div className="theme-card rounded-xl border theme-border shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b theme-border theme-card-soft flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold theme-text flex items-center gap-2">
                      <Type className="w-4 h-4 text-[var(--color-primary)]" />
                      Font Utama
                    </h3>

                    <p className="text-xs theme-text-muted mt-0.5">
                      Pilih jenis huruf yang digunakan di seluruh website
                    </p>
                  </div>

                  <span className="text-[10px] font-medium theme-text-muted theme-card px-2.5 py-1 rounded-full border theme-border">
                    Tipografi
                  </span>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {fontOptions.map((option) => {
                      const isActive = form.font === option.value;

                      return (
                        <label
                          key={option.value}
                          className={`
                            cursor-pointer relative flex flex-col items-center
                            gap-1 px-4 py-4 rounded-xl border transition-all
                            ${
                              isActive
                                ? "theme-info border-[var(--color-primary)]"
                                : "theme-card theme-border theme-sidebar-hover"
                            }
                          `}
                        >
                          <input
                            type="radio"
                            name="font"
                            value={option.value}
                            checked={isActive}
                            onChange={handleChange}
                            className="sr-only"
                          />

                          <span
                            className={`
                              text-lg font-semibold
                              ${
                                option.value === "sans"
                                  ? "font-sans"
                                  : option.value === "serif"
                                  ? "font-serif"
                                  : "font-mono"
                              }
                              ${
                                isActive
                                  ? "text-[var(--color-primary)]"
                                  : "theme-text-secondary"
                              }
                            `}
                          >
                            Aa
                          </span>

                          <span
                            className={`
                              text-sm font-medium
                              ${
                                isActive
                                  ? "text-[var(--color-primary)]"
                                  : "theme-text-secondary"
                              }
                            `}
                          >
                            {option.label}
                          </span>

                          <span className="text-[10px] theme-text-muted">
                            {option.desc}
                          </span>

                          {isActive && (
                            <div className="absolute top-2 right-2">
                              <div className="w-5 h-5 rounded-full theme-primary flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            </div>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Layout Card */}
              <div className="theme-card rounded-xl border theme-border shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b theme-border theme-card-soft flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold theme-text flex items-center gap-2">
                      <LayoutIcon className="w-4 h-4 text-[var(--color-primary)]" />
                      Layout Halaman
                    </h3>

                    <p className="text-xs theme-text-muted mt-0.5">
                      Pilih tata letak konten website
                    </p>
                  </div>

                  <span className="text-[10px] font-medium theme-text-muted theme-card px-2.5 py-1 rounded-full border theme-border">
                    Struktur
                  </span>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {layoutOptions.map((option) => {
                      const isActive = form.layout === option.value;

                      return (
                        <label
                          key={option.value}
                          className={`
                            cursor-pointer relative flex items-center gap-4
                            px-4 py-3.5 rounded-xl border transition-all
                            ${
                              isActive
                                ? "theme-info border-[var(--color-primary)]"
                                : "theme-card theme-border theme-sidebar-hover"
                            }
                          `}
                        >
                          <input
                            type="radio"
                            name="layout"
                            value={option.value}
                            checked={isActive}
                            onChange={handleChange}
                            className="sr-only"
                          />

                          <div className="flex-1">
                            <span
                              className={`
                                text-sm font-medium
                                ${
                                  isActive
                                    ? "text-[var(--color-primary)]"
                                    : "theme-text-secondary"
                                }
                              `}
                            >
                              {option.label}
                            </span>

                            <p className="text-[10px] theme-text-muted">
                              {option.desc}
                            </p>
                          </div>

                          {isActive && (
                            <div className="ml-auto">
                              <div className="w-5 h-5 rounded-full theme-primary flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            </div>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Preview Card */}
              <div className="theme-sidebar rounded-xl border theme-sidebar-border shadow-sm overflow-hidden p-5">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b theme-sidebar-border">
                  <Eye className="w-3.5 h-3.5 theme-sidebar-text-muted" />

                  <span className="text-[9px] font-bold theme-sidebar-text-muted uppercase tracking-wider">
                    Live Preview
                  </span>

                  <div className="flex-1 h-px bg-[var(--color-sidebar-divider)]" />

                  <div className="flex items-center gap-1.5 text-[9px] theme-sidebar-text-muted">
                    <ThemeIcon className="w-3 h-3" />

                    <span>
                      {form.theme === "light"
                        ? "Terang"
                        : form.theme === "dark"
                        ? "Gelap"
                        : "Sistem"}
                    </span>

                    <span className="theme-sidebar-section-label">
                      •
                    </span>

                    <span>
                      {form.font === "sans"
                        ? "Sans"
                        : form.font === "serif"
                        ? "Serif"
                        : "Mono"}
                    </span>

                    <span className="theme-sidebar-section-label">
                      •
                    </span>

                    <span>
                      {form.layout === "fullwidth"
                        ? "Full"
                        : "Boxed"}
                    </span>
                  </div>
                </div>

                <div
                  className={`
                    p-4 rounded-lg border
                    ${
                      form.theme === "dark"
                        ? "bg-slate-950 border-slate-700"
                        : "theme-card theme-border"
                    }
                  `}
                >
                  <div
                    className={`
                      text-sm font-medium
                      ${getFontClass()}
                      ${
                        form.theme === "dark"
                          ? "text-slate-100"
                          : "theme-text"
                      }
                    `}
                  >
                    Contoh Teks
                  </div>

                  <div
                    className={`
                      text-xs mt-1
                      ${getFontClass()}
                      ${
                        form.theme === "dark"
                          ? "text-slate-400"
                          : "theme-text-muted"
                      }
                    `}
                  >
                    Tampilan website akan menyesuaikan dengan pengaturan di
                    atas.
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="
                    inline-flex items-center justify-center gap-2
                    px-5 py-2.5
                    w-full sm:w-auto
                    theme-card theme-text-secondary
                    text-sm font-medium rounded-lg
                    border theme-border
                    theme-sidebar-hover
                    transition
                  "
                >
                  <span className="w-4 h-4 flex items-center justify-center">
                    ✕
                  </span>
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    inline-flex items-center justify-center gap-2
                    px-6 py-2.5
                    w-full sm:w-auto
                    theme-primary
                    text-sm font-medium rounded-lg
                    shadow-md
                    transition
                    disabled:opacity-60
                  "
                >
                  {loading ? (
                    <span className="animate-pulse">
                      Menyimpan...
                    </span>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Footer */}
            <footer className="pt-4 border-t theme-border text-center text-xs theme-text-muted">
              © 2026 SmartSchool CMS • Pengaturan Tampilan
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}