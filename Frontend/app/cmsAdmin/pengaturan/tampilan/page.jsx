"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";
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
    { value: "light", label: "Terang", icon: Sun },
    { value: "dark", label: "Gelap", icon: Moon },
    { value: "system", label: "Sistem", icon: Laptop },
  ];

  const fontOptions = [
    { value: "sans", label: "Sans Serif", desc: "Modern & bersih" },
    { value: "serif", label: "Serif", desc: "Klasik & elegan" },
    { value: "mono", label: "Monospace", desc: "Teknologi & tegas" },
  ];

  const layoutOptions = [
    { value: "fullwidth", label: "Full Width", desc: "Konten memenuhi layar" },
    { value: "boxed", label: "Boxed", desc: "Konten terpusat" },
  ];

  const getThemeIcon = () => {
    switch (form.theme) {
      case "light": return Sun;
      case "dark": return Moon;
      default: return Laptop;
    }
  };

  const ThemeIcon = getThemeIcon();

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
          title="Pengaturan Tampilan"
          user={{
            name: "CMS Admin",
            email: "cms@smartschool.com",
            avatar: "CA",
          }}
          notifications={[]}
        />

        <main className="flex-1 min-w-0 overflow-y-auto p-4 md:p-6 lg:p-8 bg-white">
          <div className="w-full min-w-0 max-w-none space-y-6">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-slate-500">
              <a href="/cmsAdmin" className="hover:text-blue-800 transition">Dashboard</a>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <a href="/cmsAdmin/pengaturan" className="hover:text-blue-800 transition">Pengaturan</a>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="text-blue-900 font-semibold">Tampilan</span>
            </nav>

            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="shrink-0 p-3 rounded-xl bg-blue-900/10 text-blue-900 border border-blue-900/5">
                <Palette className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-bold uppercase tracking-wider text-blue-900 mb-1.5">
                  <Sparkles className="w-3 h-3" />
                  Tampilan Website
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Pengaturan Tampilan</h1>
                <p className="text-sm text-slate-500 mt-1">Sesuaikan tema, font, dan layout tampilan website publik</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Theme Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-blue-900" />
                      Tema Warna
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Pilih tema yang sesuai dengan preferensi pengunjung</p>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 bg-white px-2.5 py-1 rounded-full border border-slate-200">Utama</span>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {themeOptions.map((option) => {
                      const Icon = option.icon;
                      const isActive = form.theme === option.value;
                      return (
                        <label
                          key={option.value}
                          className={`cursor-pointer relative flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all ${
                            isActive
                              ? "border-blue-900 bg-blue-50/50 ring-1 ring-blue-900/20"
                              : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="theme"
                            value={option.value}
                            checked={isActive}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <div className={`p-1.5 rounded-lg ${isActive ? "text-blue-900" : "text-slate-400"}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className={`text-sm font-medium ${isActive ? "text-blue-900" : "text-slate-700"}`}>
                            {option.label}
                          </span>
                          {isActive && (
                            <div className="ml-auto">
                              <div className="w-5 h-5 rounded-full bg-blue-900 flex items-center justify-center">
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
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <Type className="w-4 h-4 text-blue-900" />
                      Font Utama
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Pilih jenis huruf yang digunakan di seluruh website</p>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 bg-white px-2.5 py-1 rounded-full border border-slate-200">Tipografi</span>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {fontOptions.map((option) => {
                      const isActive = form.font === option.value;
                      return (
                        <label
                          key={option.value}
                          className={`cursor-pointer relative flex flex-col items-center gap-1 px-4 py-4 rounded-xl border transition-all ${
                            isActive
                              ? "border-blue-900 bg-blue-50/50 ring-1 ring-blue-900/20"
                              : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300"
                          }`}
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
                            className={`text-lg font-semibold ${
                              option.value === "sans"
                                ? "font-sans"
                                : option.value === "serif"
                                ? "font-serif"
                                : "font-mono"
                            } ${isActive ? "text-blue-900" : "text-slate-700"}`}
                          >
                            Aa
                          </span>
                          <span className={`text-sm font-medium ${isActive ? "text-blue-900" : "text-slate-700"}`}>
                            {option.label}
                          </span>
                          <span className="text-[10px] text-slate-400">{option.desc}</span>
                          {isActive && (
                            <div className="absolute top-2 right-2">
                              <div className="w-5 h-5 rounded-full bg-blue-900 flex items-center justify-center">
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
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <LayoutIcon className="w-4 h-4 text-blue-900" />
                      Layout Halaman
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Pilih tata letak konten website</p>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 bg-white px-2.5 py-1 rounded-full border border-slate-200">Struktur</span>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {layoutOptions.map((option) => {
                      const isActive = form.layout === option.value;
                      return (
                        <label
                          key={option.value}
                          className={`cursor-pointer relative flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all ${
                            isActive
                              ? "border-blue-900 bg-blue-50/50 ring-1 ring-blue-900/20"
                              : "border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300"
                          }`}
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
                            <span className={`text-sm font-medium ${isActive ? "text-blue-900" : "text-slate-700"}`}>
                              {option.label}
                            </span>
                            <p className="text-[10px] text-slate-400">{option.desc}</p>
                          </div>
                          {isActive && (
                            <div className="ml-auto">
                              <div className="w-5 h-5 rounded-full bg-blue-900 flex items-center justify-center">
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

              {/* Preview Card - GANTI EMOJI DENGAN ICON */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-sm overflow-hidden p-5">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Live Preview</span>
                  <div className="flex-1 h-px bg-slate-700" />
                  <div className="flex items-center gap-1.5 text-[9px] text-slate-500">
                    <ThemeIcon className="w-3 h-3" />
                    <span>{form.theme === "light" ? "Terang" : form.theme === "dark" ? "Gelap" : "Sistem"}</span>
                    <span className="text-slate-600">•</span>
                    <span>{form.font === "sans" ? "Sans" : form.font === "serif" ? "Serif" : "Mono"}</span>
                    <span className="text-slate-600">•</span>
                    <span>{form.layout === "fullwidth" ? "Full" : "Boxed"}</span>
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${
                  form.theme === "light" ? "bg-white" : "bg-slate-900"
                } border ${form.theme === "light" ? "border-slate-200" : "border-slate-700"}`}>
                  <div className={`text-sm font-medium ${
                    form.theme === "light" ? "text-slate-800" : "text-white"
                  } ${form.font === "sans" ? "font-sans" : form.font === "serif" ? "font-serif" : "font-mono"}`}>
                    Contoh Teks
                  </div>
                  <div className={`text-xs mt-1 ${
                    form.theme === "light" ? "text-slate-500" : "text-slate-400"
                  } ${form.font === "sans" ? "font-sans" : form.font === "serif" ? "font-serif" : "font-mono"}`}>
                    Tampilan website akan menyesuaikan dengan pengaturan di atas.
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 w-full sm:w-auto bg-white text-slate-600 text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                >
                  <span className="w-4 h-4 flex items-center justify-center">✕</span> Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 w-full sm:w-auto bg-blue-900 text-white text-sm font-medium rounded-lg shadow-md shadow-blue-900/10 hover:bg-blue-800 transition disabled:opacity-60"
                >
                  {loading ? (
                    <span className="animate-pulse">Menyimpan...</span>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Footer */}
            <footer className="pt-4 border-t border-slate-200/60 text-center text-xs text-slate-400">
              © 2026 SmartSchool CMS • Pengaturan Tampilan
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}