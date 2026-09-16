"use client";

import { useState } from "react";
import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";
import { Save, Share2, Link as LinkIcon, ChevronRight, Sparkles, Globe } from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaLinkedinIn,
} from "react-icons/fa";

export default function SosialMediaPage() {
  const [active, setActive] = useState("pengaturan");
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);

  const [platforms, setPlatforms] = useState([
    {
      id: "facebook",
      label: "Facebook",
      url: "https://facebook.com/smartschool",
      enabled: true,
    },
    {
      id: "instagram",
      label: "Instagram",
      url: "https://instagram.com/smartschool",
      enabled: true,
    },
    {
      id: "twitter",
      label: "Twitter / X",
      url: "https://twitter.com/smartschool",
      enabled: false,
    },
    {
      id: "youtube",
      label: "YouTube",
      url: "https://youtube.com/@smartschool",
      enabled: true,
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      url: "https://linkedin.com/company/smartschool",
      enabled: false,
    },
  ]);

  const activeCount = platforms.filter((p) => p.enabled).length;
  const inactiveCount = platforms.length - activeCount;

  const handleToggle = (id) => {
    setPlatforms((prev) =>
      prev.map((platform) =>
        platform.id === id
          ? { ...platform, enabled: !platform.enabled }
          : platform
      )
    );
  };

  const handleUrlChange = (id, url) => {
    setPlatforms((prev) =>
      prev.map((platform) =>
        platform.id === id ? { ...platform, url } : platform
      )
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("✅ Pengaturan Sosial Media berhasil disimpan!");
    }, 1500);
  };

  const renderIcon = (id) => {
    const iconClass = "w-4 h-4 sm:w-5 sm:h-5";
    switch (id) {
      case "facebook": return <FaFacebookF className={iconClass} />;
      case "instagram": return <FaInstagram className={iconClass} />;
      case "twitter": return <FaTwitter className={iconClass} />;
      case "youtube": return <FaYoutube className={iconClass} />;
      case "linkedin": return <FaLinkedinIn className={iconClass} />;
      default: return null;
    }
  };

  const getPlatformColor = (id) => {
    switch (id) {
      case "facebook": return "text-blue-600";
      case "instagram": return "text-pink-500";
      case "twitter": return "text-sky-500";
      case "youtube": return "text-red-600";
      case "linkedin": return "text-blue-700";
      default: return "text-slate-400";
    }
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
          title="Sosial Media"
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
              <span className="text-blue-900 font-semibold">Sosial Media</span>
            </nav>

            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="shrink-0 p-3 rounded-xl bg-blue-900/10 text-blue-900 border border-blue-900/5">
                <Share2 className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-bold uppercase tracking-wider text-blue-900 mb-1.5">
                  <Sparkles className="w-3 h-3" />
                  Koneksi Media Sosial
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Sosial Media</h1>
                <p className="text-sm text-slate-500 mt-1">Hubungkan akun media sosial sekolah ke website.</p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-3 bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-3">
              <span className="text-xs font-medium text-slate-600">Status:</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {activeCount} Aktif
              </span>
              {inactiveCount > 0 && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  {inactiveCount} Nonaktif
                </span>
              )}
              <span className="ml-auto text-xs text-slate-400">Total {platforms.length} platform</span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {platforms.map((platform) => (
                <div
                  key={platform.id}
                  className={`bg-white border rounded-xl p-4 transition-all duration-200 ${
                    platform.enabled
                      ? "border-blue-200/60 bg-blue-50/30"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                    {/* Icon & Label */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className={`p-2 rounded-lg bg-white shadow-sm border ${platform.enabled ? 'border-blue-200' : 'border-slate-200'} ${platform.enabled ? getPlatformColor(platform.id) : 'text-slate-400'}`}>
                        {renderIcon(platform.id)}
                      </div>
                      <span className="text-sm font-semibold text-slate-800 min-w-[100px]">
                        {platform.label}
                      </span>
                    </div>

                    {/* URL Input */}
                    <div className="flex-1 min-w-0">
                      <div className="relative">
                        {platform.enabled && (
                          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        )}
                        <input
                          type="url"
                          value={platform.url}
                          onChange={(e) => handleUrlChange(platform.id, e.target.value)}
                          disabled={!platform.enabled}
                          placeholder="https://..."
                          className={`w-full px-3 py-2.5 rounded-lg border text-sm transition ${
                            platform.enabled
                              ? "pl-9 border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
                              : "pl-3 border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Toggle */}
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={platform.enabled}
                        onChange={() => handleToggle(platform.id)}
                      />
                      <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-900/20 peer-checked:bg-blue-900 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-slate-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white shadow-inner" />
                    </label>
                  </div>
                </div>
              ))}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200">
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

            {/* Live Preview */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live Preview</span>
                <div className="flex-1 h-px bg-slate-700" />
                <span className="text-[10px] text-slate-500">Footer Website</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {platforms.map((platform) => {
                  if (!platform.enabled) return null;
                  return (
                    <a
                      key={platform.id}
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={platform.label}
                      className={`flex items-center justify-center w-10 h-10 rounded-full bg-slate-700/50 text-slate-300 hover:bg-blue-900 hover:text-white transition-all duration-200 hover:scale-110 hover:shadow-lg hover:shadow-blue-900/20 ${getPlatformColor(platform.id)}`}
                    >
                      {renderIcon(platform.id)}
                    </a>
                  );
                })}
                {activeCount === 0 && (
                  <p className="text-sm text-slate-500 italic">Tidak ada platform yang aktif</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <footer className="pt-4 border-t border-slate-200/60 text-center text-xs text-slate-400">
              © 2026 SmartSchool CMS • Sosial Media
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}