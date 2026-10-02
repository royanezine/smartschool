// app/cmsAdmin/pengaturan/sosial-media/page.jsx
"use client";

import { useState } from "react";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  Save,
  Share2,
  Link as LinkIcon,
  ChevronRight,
  Sparkles,
} from "lucide-react";

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
      case "facebook":
        return <FaFacebookF className={iconClass} />;
      case "instagram":
        return <FaInstagram className={iconClass} />;
      case "twitter":
        return <FaTwitter className={iconClass} />;
      case "youtube":
        return <FaYoutube className={iconClass} />;
      case "linkedin":
        return <FaLinkedinIn className={iconClass} />;
      default:
        return null;
    }
  };

  const getPlatformColor = (id) => {
    switch (id) {
      case "facebook":
        return "text-blue-600 dark:text-blue-400";
      case "instagram":
        return "text-pink-500 dark:text-pink-400";
      case "twitter":
        return "text-sky-500 dark:text-sky-400";
      case "youtube":
        return "text-red-600 dark:text-red-400";
      case "linkedin":
        return "text-blue-700 dark:text-blue-400";
      default:
        return "theme-text-muted";
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
          title="Sosial Media"
          user={{
            name: "CMS Admin",
            email: "cms@smartschool.com",
            avatar: "CA",
          }}
          notifications={[]}
        />

        <main className="flex-1 min-w-0 overflow-y-auto p-4 md:p-6 lg:p-8 theme-page">
          <div className="w-full min-w-0 max-w-6xl mx-auto space-y-6">
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
                Sosial Media
              </span>
            </nav>

            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="shrink-0 p-3 rounded-xl theme-info border">
                <Share2 className="w-6 h-6" />
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full theme-info border text-[10px] font-bold uppercase tracking-wider mb-1.5">
                  <Sparkles className="w-3 h-3" />
                  Koneksi Media Sosial
                </div>

                <h1 className="text-2xl font-bold theme-text">
                  Sosial Media
                </h1>

                <p className="text-sm theme-text-muted mt-1">
                  Hubungkan akun media sosial sekolah ke website.
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-3 theme-card-soft border theme-border rounded-xl px-4 py-3">
              <span className="text-xs font-medium theme-text-secondary">
                Status:
              </span>

              <span className="inline-flex items-center gap-1.5 text-xs font-medium theme-success px-3 py-1 rounded-full border">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
                {activeCount} Aktif
              </span>

              {inactiveCount > 0 && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium theme-card theme-text-muted px-3 py-1 rounded-full border theme-border">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)]" />
                  {inactiveCount} Nonaktif
                </span>
              )}

              <span className="ml-auto text-xs theme-text-muted">
                Total {platforms.length} platform
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {platforms.map((platform) => (
                <div
                  key={platform.id}
                  className={`border rounded-xl p-4 transition-all duration-200 ${
                    platform.enabled
                      ? "theme-info"
                      : "theme-card theme-border"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                    {/* Icon & Label */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div
                        className={`
                          p-2 rounded-lg border shadow-sm
                          ${
                            platform.enabled
                              ? "theme-card theme-border"
                              : "theme-card-soft theme-border"
                          }
                          ${
                            platform.enabled
                              ? getPlatformColor(platform.id)
                              : "theme-text-muted"
                          }
                        `}
                      >
                        {renderIcon(platform.id)}
                      </div>

                      <span className="text-sm font-semibold theme-text min-w-[100px]">
                        {platform.label}
                      </span>
                    </div>

                    {/* URL Input */}
                    <div className="flex-1 min-w-0">
                      <div className="relative">
                        {platform.enabled && (
                          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-muted" />
                        )}

                        <input
                          type="url"
                          value={platform.url}
                          onChange={(e) =>
                            handleUrlChange(
                              platform.id,
                              e.target.value
                            )
                          }
                          disabled={!platform.enabled}
                          placeholder="https://..."
                          className={`
                            w-full px-3 py-2.5 rounded-lg border text-sm transition
                            ${
                              platform.enabled
                                ? "theme-input pl-9 focus:outline-none focus:border-[var(--color-primary)]"
                                : "theme-card-soft theme-text-muted theme-border pl-3 cursor-not-allowed opacity-70"
                            }
                          `}
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

                      <div
                        className="
                          w-11 h-6
                          bg-[var(--color-border)]
                          rounded-full
                          peer
                          peer-focus:ring-4
                          peer-focus:ring-[var(--color-primary)]/20
                          peer-checked:bg-[var(--color-primary)]
                          after:content-['']
                          after:absolute
                          after:top-[2px]
                          after:left-[2px]
                          after:bg-white
                          after:border
                          after:border-[var(--color-border)]
                          after:rounded-full
                          after:h-5
                          after:w-5
                          after:transition-all
                          peer-checked:after:translate-x-full
                          peer-checked:after:border-white
                          shadow-inner
                        "
                      />
                    </label>
                  </div>
                </div>
              ))}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t theme-border">
                {/* Batal */}
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

                {/* Simpan */}
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

            {/* Live Preview */}
            <div
              className="
                rounded-xl border p-6
                theme-sidebar
                theme-sidebar-text
              "
            >
              <div className="flex items-center gap-2 mb-4 pb-3 border-b theme-sidebar-border">
                <span className="text-[10px] font-bold theme-sidebar-text-muted uppercase tracking-wider">
                  Live Preview
                </span>

                <div className="flex-1 h-px bg-[var(--color-sidebar-divider)]" />

                <span className="text-[10px] theme-sidebar-text-muted">
                  Footer Website
                </span>
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
                      className={`
                        flex items-center justify-center
                        w-10 h-10 rounded-full
                        theme-sidebar-hover
                        theme-sidebar-text-muted
                        hover:text-[var(--color-primary)]
                        transition-all duration-200
                        hover:scale-110
                        hover:shadow-lg
                        ${getPlatformColor(platform.id)}
                      `}
                    >
                      {renderIcon(platform.id)}
                    </a>
                  );
                })}

                {activeCount === 0 && (
                  <p className="text-sm theme-sidebar-text-muted italic">
                    Tidak ada platform yang aktif
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <footer className="pt-4 border-t theme-border text-center text-xs theme-text-muted">
              © 2026 SmartSchool CMS • Sosial Media
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}