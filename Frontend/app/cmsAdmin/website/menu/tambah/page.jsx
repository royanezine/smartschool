// app/cmsAdmin/website/menu/tambah/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";

import {
  Save,
  X,
  ArrowLeft,
  Menu as MenuIcon,
  Link as LinkIcon,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

export default function TambahMenuPage() {
  const router = useRouter();

  // SIDEBAR
  const [active, setActive] = useState("menu");
  const [collapsed, setCollapsed] = useState(false);

  // FORM
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // CLEAR ERROR
  const clearError = (field) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // SUBMIT
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!label.trim()) newErrors.label = "Nama menu wajib diisi.";
    if (!url.trim()) newErrors.url = "URL / Link wajib diisi.";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert(`Menu "${label}" berhasil ditambahkan!`);
      router.push("/cmsAdmin/website/menu");
    }, 1200);
  };

  // =========================================================
  // RENDER
  // =========================================================
  return (
    // PERBAIKAN: gunakan flex, tanpa overflow-x-hidden
    <div className="flex min-h-screen w-full bg-slate-50">
      {/* SIDEBAR - flex-shrink-0 */}
      <Sidebar
        active={active}
        setActive={setActive}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* CONTENT AREA - flex-1 min-w-0 */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Header
          title="Tambah Menu"
          user={{ name: "Admin" }}
          notifications={[]}
        />

        <main className="flex-1 min-w-0 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6">
            {/* BREADCRUMB & BACK */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 overflow-x-auto">
                <a href="/cmsAdmin" className="hover:text-indigo-600 transition">Dashboard</a>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                <a href="/cmsAdmin/website/menu" className="hover:text-indigo-600 transition">Menu Website</a>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                <span className="text-indigo-600 font-semibold shrink-0">Tambah Baru</span>
              </nav>
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 hover:text-indigo-600 transition shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali
              </button>
            </div>

            {/* HEADER */}
            <div className="flex items-start gap-4">
              <div className="shrink-0 p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/20">
                <MenuIcon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-bold uppercase tracking-wider text-indigo-600 mb-1.5">
                  <Sparkles className="w-3 h-3" />
                  Website CMS
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Tambah Menu Baru</h1>
                <p className="text-sm text-slate-500 mt-1">Tambahkan item navigasi baru untuk header atau footer website sekolah.</p>
              </div>
            </div>

            {/* FORM + SIDEBAR */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] 2xl:grid-cols-[1fr_340px] gap-6 items-start">
              {/* FORM CARD */}
              <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-800">Detail Menu</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Lengkapi informasi menu website</p>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-[10px] font-bold text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Menu Baru
                  </span>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* LABEL */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Nama Menu <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MenuIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={label}
                        onChange={(e) => { setLabel(e.target.value); clearError("label"); }}
                        placeholder="Contoh: Beranda, Profil, Galeri"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-white outline-none text-sm font-medium text-slate-800 placeholder:text-slate-300 transition-all ${
                          errors.label
                            ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                            : "border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                        }`}
                      />
                    </div>
                    {errors.label && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-500">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.label}
                      </p>
                    )}
                  </div>

                  {/* URL */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      URL / Tautan <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={url}
                        onChange={(e) => { setUrl(e.target.value); clearError("url"); }}
                        placeholder="Contoh: /tentang-kami atau https://website.com"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-white outline-none text-sm font-mono text-slate-800 placeholder:text-slate-300 transition-all ${
                          errors.url
                            ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                            : "border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                        }`}
                      />
                    </div>
                    {errors.url ? (
                      <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-500">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.url}
                      </p>
                    ) : (
                      <p className="mt-2 text-xs text-slate-400">
                        Gunakan URL internal seperti <span className="font-mono text-slate-500">/galeri</span> atau URL eksternal lengkap.
                      </p>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition"
                    >
                      <X className="w-4 h-4" />
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {isLoading ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Simpan Menu
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </section>

              {/* SIDEBAR KANAN */}
              <aside className="space-y-4 xl:sticky xl:top-6">
                {/* PREVIEW */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/70">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Live Preview</p>
                    <h3 className="text-sm font-bold text-slate-800 mt-1">Tampilan Menu</h3>
                  </div>
                  <div className="p-5">
                    <div className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                            <MenuIcon className="w-4 h-4 text-indigo-600" />
                          </div>
                          <span className="text-sm font-semibold text-slate-700 truncate">
                            {label || "Nama Menu"}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">URL</p>
                      <p className="text-xs font-mono text-slate-500 break-all">{url || "/contoh-link"}</p>
                    </div>
                  </div>
                </div>

                {/* TIPS */}
                <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-indigo-100 flex items-center justify-center shrink-0 shadow-sm">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Tips Menu</h3>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                        Gunakan nama menu yang singkat, jelas, dan mudah dipahami agar navigasi website terlihat rapi.
                      </p>
                    </div>
                  </div>
                </div>

                {/* INFO */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Informasi</h3>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                        Field dengan tanda <span className="font-bold text-red-500">*</span> wajib diisi sebelum menu dapat disimpan.
                      </p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>

            {/* FOOTER */}
            <footer className="pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
              <span>© 2026 SmartSchool CMS. All rights reserved.</span>
              <span className="font-medium">Website Management</span>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}