"use client";

import { useState } from "react";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  Save,
  Globe,
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

    if (type === "logo") {
      setLogoPreview(url);
    } else {
      setFaviconPreview(url);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Identitas website berhasil disimpan!");
    }, 1500);
  };

  return (
    // ROOT: flex h-screen overflow-hidden
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active={active}
        setActive={setActive}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* BODY: min-h-0 flex-1 */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        
        {/* HEADER: shrink-0 */}
        <div className="shrink-0 border-b theme-border">
          <Header
            title="Identitas Website"
            user={{
              name: "CMS Admin",
              email: "cms@smartschool.com",
              avatar: "CA",
            }}
            notifications={[]}
          />
        </div>

        {/* MAIN: min-w-0 flex-1 overflow-y-auto */}
        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          
          {/* KONTEN: w-full tanpa max-w */}
          <div className="w-full px-4 py-6 md:px-6 lg:px-8 space-y-6">
            
            {/* BREADCRUMB */}
            <nav className="flex items-center gap-2 text-sm">
              <a
                href="/cmsAdmin"
                className="theme-text-muted hover:text-[var(--color-primary)] transition"
              >
                Dashboard
              </a>
              <ChevronRight className="w-4 h-4 theme-text-placeholder" />
              <a
                href="/admin/cms/pengaturan"
                className="theme-text-muted hover:text-[var(--color-primary)] transition"
              >
                Pengaturan
              </a>
              <ChevronRight className="w-4 h-4 theme-text-placeholder" />
              <span className="theme-text font-semibold">Identitas</span>
            </nav>

            {/* HEADER PAGE */}
            <div className="flex items-start gap-4">
              <div className="shrink-0 p-3 rounded-xl theme-info border">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold theme-text">
                  Identitas Website
                </h1>
                <p className="text-sm theme-text-muted mt-1 max-w-2xl">
                  Atur informasi dasar, logo, dan profil website sekolah Anda.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* CARD: BRANDING (Logo & Favicon) */}
              <div className="theme-card rounded-xl border theme-border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b theme-border flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold theme-text flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[var(--color-primary)]" />
                      Branding Website
                    </h3>
                    <p className="text-xs theme-text-muted mt-1">
                      Upload logo utama dan favicon
                    </p>
                  </div>
                  <span className="text-[10px] font-bold theme-text-muted theme-card-soft px-3 py-1.5 rounded-lg border theme-border">
                    PNG / JPG / SVG
                  </span>
                </div>

                {/* Grid Responsif untuk Upload Gambar */}
                <div className="p-6 grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-4">
                  
                  <div className="theme-card-soft border theme-border rounded-xl p-5">
                    <label className="text-xs font-bold theme-text-secondary uppercase tracking-wider block mb-3">
                      Logo Utama
                    </label>
                    <div className="relative aspect-square max-w-[200px] mx-auto border-2 border-dashed theme-border rounded-xl overflow-hidden theme-card group">
                      <img
                        src={logoPreview}
                        alt="Logo"
                        className="w-full h-full object-contain p-4 transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 opacity-0 group-hover:opacity-100 transition cursor-pointer">
                        <span className="theme-card px-4 py-2 rounded-lg text-xs font-bold theme-text shadow-sm flex items-center gap-2 border theme-border">
                          <UploadCloud className="w-4 h-4" /> Ganti Logo
                        </span>
                      </div>
                      <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "logo")}
                      />
                    </div>
                    <p className="text-[11px] theme-text-muted mt-3 text-center">
                      Rekomendasi: 150×150px atau rasio 1:1
                    </p>
                  </div>

                  <div className="theme-card-soft border theme-border rounded-xl p-5">
                    <label className="text-xs font-bold theme-text-secondary uppercase tracking-wider block mb-3">
                      Favicon
                    </label>
                    <div className="relative w-32 h-32 mx-auto border-2 border-dashed theme-border rounded-xl overflow-hidden theme-card group">
                      <img
                        src={faviconPreview}
                        alt="Favicon"
                        className="w-full h-full object-contain p-3 transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 opacity-0 group-hover:opacity-100 transition cursor-pointer">
                        <span className="theme-card px-3 py-1.5 rounded-lg text-[11px] font-bold theme-text shadow-sm flex items-center gap-1.5 border theme-border">
                          <UploadCloud className="w-3.5 h-3.5" /> Ganti
                        </span>
                      </div>
                      <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "favicon")}
                      />
                    </div>
                    <p className="text-[11px] theme-text-muted mt-3 text-center">
                      Rekomendasi: 32×32px
                    </p>
                  </div>

                  {/* Info Tambahan (Mengisi Grid agar seimbang di layar besar) */}
                  <div className="hidden 2xl:col-span-2 2xl:flex flex-col justify-center rounded-xl border theme-border p-6 bg-[color-mix(in_srgb,var(--color-primary)_5%,transparent)]">
                    <h4 className="text-sm font-bold theme-text mb-2">Tips Branding</h4>
                    <p className="text-xs leading-relaxed theme-text-muted">
                      Gunakan logo dengan latar belakang transparan (PNG) agar terlihat menyatu dengan warna header website. Pastikan resolusi gambar cukup tajam untuk ditampilkan di layar beresolusi tinggi.
                    </p>
                  </div>
                </div>
              </div>

              {/* CARD: INFORMASI DASAR */}
              <div className="theme-card rounded-xl border theme-border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b theme-border">
                  <h3 className="text-sm font-bold theme-text">Informasi Dasar</h3>
                  <p className="text-xs theme-text-muted mt-1">
                    Informasi ini akan digunakan sebagai identitas utama website.
                  </p>
                </div>

                {/* Grid Responsif untuk Form */}
                <div className="p-6 grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
                  
                  <div>
                    <label className="text-xs font-bold theme-text-secondary block mb-2">
                      Nama Website <span className="text-[var(--color-danger)]">*</span>
                    </label>
                    <input
                      required
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="theme-input w-full h-11 px-4 rounded-xl border text-sm font-medium outline-none transition focus:border-[var(--color-primary)]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold theme-text-secondary block mb-2">
                      Email Kontak
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="theme-input w-full h-11 px-4 rounded-xl border text-sm font-medium outline-none transition focus:border-[var(--color-primary)]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold theme-text-secondary block mb-2">
                      Telepon
                    </label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="theme-input w-full h-11 px-4 rounded-xl border text-sm font-medium outline-none transition focus:border-[var(--color-primary)]"
                    />
                  </div>

                  <div className="md:col-span-2 2xl:col-span-3">
                    <label className="text-xs font-bold theme-text-secondary block mb-2">
                      Deskripsi Singkat
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      value={form.description}
                      onChange={handleChange}
                      className="theme-input w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none transition focus:border-[var(--color-primary)] resize-y"
                    />
                  </div>

                  <div className="md:col-span-2 2xl:col-span-3">
                    <label className="text-xs font-bold theme-text-secondary block mb-2">
                      Alamat Lengkap
                    </label>
                    <input
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      className="theme-input w-full h-11 px-4 rounded-xl border text-sm font-medium outline-none transition focus:border-[var(--color-primary)]"
                    />
                  </div>
                </div>
              </div>

              {/* FOOTER ACTION (Tombol Simpan) */}
              <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="inline-flex h-11 items-center justify-center gap-2 px-6 w-full sm:w-auto theme-card theme-text-secondary text-sm font-semibold rounded-xl border theme-border hover:opacity-80 transition"
                >
                  <X className="w-4 h-4" />
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-11 items-center justify-center gap-2 px-8 w-full sm:w-auto theme-primary text-sm font-bold rounded-xl shadow-md disabled:opacity-60 transition hover:opacity-90"
                >
                  {loading ? (
                    <span className="animate-pulse">Menyimpan...</span>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* FOOTER */}
            <footer className="pt-6 border-t theme-border text-center text-xs theme-text-muted">
              © 2026 SmartSchool CMS • Identitas Website
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}