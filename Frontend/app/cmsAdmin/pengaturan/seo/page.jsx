// app/cmsAdmin/pengaturan/seo/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";
import {
  Save,
  Search,
  Code,
  ChevronRight,
  Sparkles,
  Globe2,
  FileText,
  Tag,
  Link2,
  BarChart3,
} from "lucide-react";

export default function SeoPage() {
  const router = useRouter();

  const [active, setActive] = useState("pengaturan");
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    metaTitle: "SmartSchool CMS | Website Resmi Sekolah",
    metaDescription:
      "Sistem manajemen sekolah berbasis web terintegrasi dengan fitur modern untuk pengelolaan data siswa, guru, dan akademik.",
    metaKeywords:
      "sekolah, cms, manajemen sekolah, pendaftaran siswa, akademik",
    canonicalUrl: "https://sekolah.sch.id",
    gaCode: "G-XXXXXXXXXX",
    customHeader: "",
    customFooter: "",
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
      alert("✅ Pengaturan SEO berhasil disimpan!");
    }, 1500);
  };

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
          title="SEO"
          user={{
            name: "CMS Admin",
            email: "cms@smartschool.com",
            avatar: "CA",
          }}
          notifications={[]}
        />

        <main className="flex-1 min-w-0 overflow-y-auto p-4 md:p-6 lg:p-8 bg-white">
          <div className="w-full min-w-0 max-w-6xl mx-auto space-y-6">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-slate-500">
              <a href="/cmsAdmin" className="hover:text-blue-800 transition">Dashboard</a>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <a href="/cmsAdmin/pengaturan" className="hover:text-blue-800 transition">Pengaturan</a>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="text-blue-900 font-semibold">SEO</span>
            </nav>

            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="shrink-0 p-3 rounded-xl bg-blue-900/10 text-blue-900 border border-blue-900/5">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-bold uppercase tracking-wider text-blue-900 mb-1.5">
                  <Sparkles className="w-3 h-3" />
                  Optimasi Mesin Pencari
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Pengaturan SEO</h1>
                <p className="text-sm text-slate-500 mt-1">Optimalkan website agar mudah ditemukan di mesin pencari Google.</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Meta Tags Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-900" />
                      Meta Tags
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Informasi yang muncul di hasil pencarian</p>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 bg-white px-2.5 py-1 rounded-full border border-slate-200">SEO Dasar</span>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1.5">Meta Title <span className="text-red-500">*</span></label>
                    <input
                      name="metaTitle"
                      value={form.metaTitle}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                    />
                    <p className="mt-1 text-xs text-slate-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-900/20" />
                      {form.metaTitle.length} / 60 karakter (disarankan)
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1.5">Meta Description <span className="text-red-500">*</span></label>
                    <textarea
                      name="metaDescription"
                      rows={3}
                      value={form.metaDescription}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition resize-none"
                    />
                    <p className="mt-1 text-xs text-slate-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-900/20" />
                      {form.metaDescription.length} / 160 karakter (disarankan)
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-600 block mb-1.5 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-slate-400" />
                        Keywords
                      </label>
                      <input
                        name="metaKeywords"
                        value={form.metaKeywords}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 block mb-1.5 flex items-center gap-1.5">
                        <Link2 className="w-3.5 h-3.5 text-slate-400" />
                        Canonical URL
                      </label>
                      <input
                        name="canonicalUrl"
                        value={form.canonicalUrl}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-900" />
                      Analytics & Tracking
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Integrasikan layanan analitik dan pelacakan</p>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 bg-white px-2.5 py-1 rounded-full border border-slate-200">Google</span>
                </div>
                <div className="p-5">
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1.5 flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-slate-400" />
                      Google Analytics ID
                    </label>
                    <input
                      name="gaCode"
                      value={form.gaCode}
                      onChange={handleChange}
                      placeholder="Contoh: G-XXXXXXXXXX"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                    />
                    <p className="mt-1 text-xs text-slate-400">Masukkan Google Analytics Measurement ID (format G-XXXXXXXXXX)</p>
                  </div>
                </div>
              </div>

              {/* Custom Scripts Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <Code className="w-4 h-4 text-blue-900" />
                      Custom Scripts
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Tambahkan kode JavaScript kustom (lanjutan)</p>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 bg-white px-2.5 py-1 rounded-full border border-slate-200">Advanced</span>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1.5">Custom Header Script</label>
                    <textarea
                      name="customHeader"
                      rows={3}
                      value={form.customHeader}
                      onChange={handleChange}
                      placeholder="<script>// Kode JavaScript di sini</script>"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-sm font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition resize-none"
                    />
                    <p className="mt-1 text-xs text-slate-400">Akan ditempatkan di bagian &lt;head&gt; halaman</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1.5">Custom Footer Script</label>
                    <textarea
                      name="customFooter"
                      rows={3}
                      value={form.customFooter}
                      onChange={handleChange}
                      placeholder="<script>// Kode JavaScript di sini</script>"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-sm font-mono text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition resize-none"
                    />
                    <p className="mt-1 text-xs text-slate-400">Akan ditempatkan sebelum tag &lt;/body&gt; penutup</p>
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
              © 2026 SmartSchool CMS • Pengaturan SEO
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}