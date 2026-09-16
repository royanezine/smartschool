// app/cmsAdmin/pengaturan/identitas/page.jsx
"use client";

import { useState } from "react";
import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";
import {
  Save,
  Globe,
  Mail,
  Phone,
  MapPin,
  UploadCloud,
  X,
  ChevronRight,
  Building2,
} from "lucide-react";

export default function IdentitasPage() {
  const [active, setActive] = useState("pengaturan");
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "SmartSchool CMS",
    description: "Sistem manajemen sekolah berbasis web terintegrasi.",
    email: "admin@sekolah.sch.id",
    phone: "+62 812 3456 7890",
    address: "Jl. Pendidikan No. 1, Kota Smart, Indonesia",
  });

  const [logoPreview, setLogoPreview] = useState(
    "https://placehold.co/150x150/1e3a5f/white?text=Logo"
  );
  const [faviconPreview, setFaviconPreview] = useState(
    "https://placehold.co/32x32/1e3a5f/white?text=F"
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === "logo") setLogoPreview(url);
    else setFaviconPreview(url);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("✅ Identitas website berhasil disimpan!");
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
          title="Identitas Website"
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
              <span className="text-blue-900 font-semibold">Identitas</span>
            </nav>

            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="shrink-0 p-3 rounded-xl bg-blue-900/10 text-blue-900 border border-blue-900/5">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Identitas Website</h1>
                <p className="text-sm text-slate-500 mt-1">Atur informasi dasar, logo, dan profil website sekolah Anda.</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Branding Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-900" />
                      Branding Website
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Upload logo utama dan favicon</p>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">PNG / JPG</span>
                </div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Logo */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-white">
                    <label className="text-xs font-medium text-slate-600 block mb-2">Logo Website</label>
                    <div className="relative aspect-square max-w-[180px] mx-auto border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-white hover:border-blue-900/30 transition">
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-3" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 hover:opacity-100 transition cursor-pointer">
                        <span className="bg-white/90 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 shadow-sm flex items-center gap-1.5">
                          <UploadCloud className="w-3.5 h-3.5" /> Ganti
                        </span>
                      </div>
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleFileChange(e, "logo")} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 text-center">Ukuran 150×150px</p>
                  </div>

                  {/* Favicon */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-white">
                    <label className="text-xs font-medium text-slate-600 block mb-2">Favicon</label>
                    <div className="relative w-24 h-24 mx-auto border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-white hover:border-blue-900/30 transition">
                      <img src={faviconPreview} alt="Favicon" className="w-full h-full object-contain p-2" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 hover:opacity-100 transition cursor-pointer">
                        <span className="bg-white/90 px-2 py-1 rounded-lg text-[10px] font-medium text-slate-700 shadow-sm flex items-center gap-1">
                          <UploadCloud className="w-3 h-3" /> Ganti
                        </span>
                      </div>
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleFileChange(e, "favicon")} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 text-center">Ukuran 32×32px</p>
                  </div>
                </div>
              </div>

              {/* Informasi Dasar Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-800">Informasi Dasar</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Informasi ini akan digunakan sebagai identitas utama website</p>
                </div>
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1.5">Nama Website</label>
                    <input
                      required
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1.5">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-slate-600 block mb-1.5">Deskripsi Singkat</label>
                    <textarea
                      name="description"
                      rows={3}
                      value={form.description}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1.5">Telepon</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1.5">Alamat</label>
                    <input
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition"
                    />
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
                  <X className="w-4 h-4" /> Batal
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
              © 2026 SmartSchool CMS • Identitas Website
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}