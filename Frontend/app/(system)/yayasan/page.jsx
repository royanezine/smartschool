"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../../lib/api";

import {
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  UserSquare2,
  ClipboardCheck,
  FileText,
  Settings,
  ChevronRight,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Bell,
} from "lucide-react";

// ============================================================
// THEME HELPERS
// ============================================================

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themePrimaryHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_88%,var(--color-text))]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

// ============================================================
// QUICK MENU
// ============================================================

const quickMenu = [
  {
    id: "sekolah",
    title: "Sekolah",
    desc: "Kelola profil dan data seluruh unit sekolah di bawah yayasan",
    icon: Building2,
    color: "primary",
    path: "/yayasan/sekolah",
    stat: "6 unit sekolah",
    featured: true,
  },
  {
    id: "laporan",
    title: "Laporan & Analitik",
    desc: "Ringkasan laporan akademik, guru, inventaris, dan siswa",
    icon: FileText,
    color: "info",
    path: "/yayasan/laporan",
    stat: "4 kategori laporan",
    featured: true,
  },
  {
    id: "guru",
    title: "Guru",
    desc: "Data induk tenaga pendidik",
    icon: GraduationCap,
    color: "info",
    path: "/yayasan/guru",
    stat: "184 aktif",
  },
  {
    id: "siswa",
    title: "Siswa",
    desc: "Data induk siswa lintas unit",
    icon: UserSquare2,
    color: "success",
    path: "/yayasan/siswa",
    stat: "4.312 siswa",
  },
  {
    id: "monitoringAkademik",
    title: "Monitoring Akademik",
    desc: "Kehadiran, nilai, LMS, mapel",
    icon: ClipboardCheck,
    color: "warning",
    path: "/yayasan/monitoringAkademik",
    stat: "Update harian",
  },
  {
    id: "pengaturan",
    title: "Pengaturan",
    desc: "Konfigurasi sistem yayasan",
    icon: Settings,
    color: "neutral",
    path: "/yayasan/pengaturan",
    stat: "3 hari lalu",
  },
];

// ============================================================
// UNIT LIST
// ============================================================

const unitList = [
  {
    id: 1,
    nama: "SD Smart School 1",
    siswa: 612,
    guru: 34,
    kehadiran: 97,
    trend: "up",
  },
  {
    id: 2,
    nama: "SD Smart School 2",
    siswa: 548,
    guru: 30,
    kehadiran: 95,
    trend: "down",
  },
  {
    id: 3,
    nama: "SMP Smart School 1",
    siswa: 734,
    guru: 41,
    kehadiran: 96,
    trend: "same",
  },
  {
    id: 4,
    nama: "SMP Smart School 2",
    siswa: 689,
    guru: 38,
    kehadiran: 94,
    trend: "down",
  },
  {
    id: 5,
    nama: "SMA Smart School 1",
    siswa: 812,
    guru: 45,
    kehadiran: 98,
    trend: "up",
  },
  {
    id: 6,
    nama: "SMA Smart School 2",
    siswa: 917,
    guru: 49,
    kehadiran: 96,
    trend: "same",
  },
];

// ============================================================
// THEME COLOR MAP
// ============================================================

const colorMap = {
  primary: {
    bg: themePrimarySoft,
    text: themePrimaryText,
    border: themePrimarySoftBorder,
    hoverBorder:
      "hover:border-[color-mix(in_srgb,var(--color-primary)_36%,transparent)]",
    ring:
      "group-hover:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]",
    bar: "bg-[var(--color-primary)]",
  },

  info: {
    bg: themeInfoSurface,
    text: "text-[var(--color-info)]",
    border: themeInfoBorder,
    hoverBorder:
      "hover:border-[color-mix(in_srgb,var(--color-info)_36%,transparent)]",
    ring:
      "group-hover:ring-[color-mix(in_srgb,var(--color-info)_12%,transparent)]",
    bar: "bg-[var(--color-info)]",
  },

  success: {
    bg: themeSuccessSurface,
    text: "text-[var(--color-success)]",
    border: themeSuccessBorder,
    hoverBorder:
      "hover:border-[color-mix(in_srgb,var(--color-success)_36%,transparent)]",
    ring:
      "group-hover:ring-[color-mix(in_srgb,var(--color-success)_12%,transparent)]",
    bar: "bg-[var(--color-success)]",
  },

  warning: {
    bg: themeWarningSurface,
    text: "text-[var(--color-warning)]",
    border: themeWarningBorder,
    hoverBorder:
      "hover:border-[color-mix(in_srgb,var(--color-warning)_36%,transparent)]",
    ring:
      "group-hover:ring-[color-mix(in_srgb,var(--color-warning)_12%,transparent)]",
    bar: "bg-[var(--color-warning)]",
  },

  neutral: {
    bg: themeNeutralSurface,
    text: "text-[var(--color-text-muted)]",
    border: themeNeutralBorder,
    hoverBorder:
      "hover:border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]",
    ring:
      "group-hover:ring-[color-mix(in_srgb,var(--color-text)_8%,transparent)]",
    bar: "bg-[var(--color-text-muted)]",
  },
};

// ============================================================
// TREND ICON
// ============================================================

function TrendIcon({ trend }) {
  if (trend === "up") {
    return (
      <TrendingUp
        size={13}
        className="text-[var(--color-success)] flex-shrink-0"
      />
    );
  }

  if (trend === "down") {
    return (
      <TrendingDown
        size={13}
        className="text-[var(--color-warning)] flex-shrink-0"
      />
    );
  }

  return (
    <Minus
      size={13}
      className="text-[var(--color-text-muted)] flex-shrink-0"
    />
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function YayasanDashboardPage() {
  const router = useRouter();

  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  // ============================================================
  // FETCH SUMMARY
  // ============================================================

  useEffect(() => {
    let mounted = true;

    async function fetchSummary() {
      try {
        setLoadingSummary(true);
        setSummaryError(null);

        const res = await apiFetch("/yayasan/summary");

        if (!mounted) return;

        if (res) {
          setSummary(res.data);
        }
      } catch (err) {
        if (!mounted) return;

        setSummaryError(
          err?.message || "Terjadi kesalahan saat mengambil data dashboard."
        );
      } finally {
        if (mounted) {
          setLoadingSummary(false);
        }
      }
    }

    fetchSummary();

    return () => {
      mounted = false;
    };
  }, []);

  // ============================================================
  // KPI STRIP
  // ============================================================

  const kpiStrip = [
    {
      id: "sekolah",
      label: "Unit Sekolah",
      value: summary?.totalSekolah ?? "-",
      icon: Building2,
      color: "primary",
    },
    {
      id: "siswaGuru",
      label: "Total Pengguna Aktif",
      value: summary?.totalPenggunaAktif ?? "-",
      icon: UserSquare2,
      color: "info",
    },
    {
      id: "aktif",
      label: "Sekolah Aktif",
      value: summary?.sekolahAktif ?? "-",
      icon: Users,
      color: "success",
    },
    {
      id: "ujiCoba",
      label: "Sekolah Uji Coba",
      value: summary?.sekolahUjiCoba ?? "-",
      icon: ClipboardCheck,
      color: "warning",
    },
  ];

  // ============================================================
  // NOTIFICATIONS
  // ============================================================

  const notifications = [
    {
      id: 1,
      title: "Pengumuman Libur Semester",
      desc: "Dikirim 2 jam lalu",
      read: false,
    },
    {
      id: 2,
      title: "Deadline Input Nilai",
      desc: "Dikirim 5 jam lalu",
      read: false,
    },
  ];

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="w-full max-w-[1800px] mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="space-y-6">
          {/* ==================================================
              PAGE HEADER
          ================================================== */}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-lg ${themePrimaryGradient} text-[var(--color-card)] ${themeSmallShadow} flex-shrink-0`}
                >
                  <LayoutDashboard size={18} />
                </div>

                <h1 className="text-xl sm:text-2xl font-semibold theme-text truncate">
                  Dashboard Yayasan
                </h1>
              </div>

              <p className="theme-text-secondary text-sm mt-1 ml-[42px] flex items-center gap-1.5">
                <Sparkles
                  size={14}
                  className="text-[var(--color-text-muted)] flex-shrink-0"
                />

                <span className="truncate">
                  Ringkasan kondisi seluruh unit sekolah di bawah naungan
                  yayasan.
                </span>
              </p>
            </div>
          </div>

          {/* ==================================================
              ERROR SUMMARY
          ================================================== */}

          {summaryError && (
            <div
              className={`rounded-xl border ${themeDangerBorder} ${themeDangerSurface} p-3.5 sm:p-4`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-lg ${themeWarningSurface} text-[var(--color-warning)] flex items-center justify-center flex-shrink-0`}
                >
                  <Bell size={16} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--color-warning)]">
                    Gagal memuat metrik dashboard
                  </p>

                  <p className="text-xs theme-text-secondary mt-0.5 break-words">
                    {summaryError}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================
              KPI STRIP
          ================================================== */}

          <div
            className={`theme-card rounded-2xl border theme-border ${themeCardShadow} divide-y divide-[color-mix(in_srgb,var(--color-text)_8%,transparent)] sm:divide-y-0 sm:divide-x sm:divide-[color-mix(in_srgb,var(--color-text)_8%,transparent)] grid grid-cols-2 sm:grid-cols-4 overflow-hidden`}
          >
            {kpiStrip.map((kpi) => {
              const Icon = kpi.icon;
              const c = colorMap[kpi.color];

              return (
                <div
                  key={kpi.id}
                  className="p-3.5 sm:p-5 flex items-center gap-3 sm:gap-3.5 min-w-0"
                >
                  <div
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${c.bg} ${c.text} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon size={18} />
                  </div>

                  <div className="min-w-0">
                    {loadingSummary ? (
                      <div
                        className="h-5 w-10 rounded animate-pulse"
                        style={{
                          background:
                            "color-mix(in srgb, var(--color-text) 7%, transparent)",
                        }}
                      />
                    ) : (
                      <p className="text-base sm:text-lg font-semibold theme-text leading-tight truncate">
                        {kpi.value}
                      </p>
                    )}

                    <p className="text-[11px] sm:text-xs theme-text-secondary mt-0.5 truncate">
                      {kpi.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ==================================================
              QUICK MENU
          ================================================== */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-min">
            {quickMenu.map((item) => {
              const Icon = item.icon;
              const c = colorMap[item.color];

              // =================================================
              // FEATURED CARD
              // =================================================

              if (item.featured) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => router.push(item.path)}
                    className={`group text-left theme-card rounded-2xl border ${c.border} ${c.hoverBorder} p-5 sm:p-6 ${themeCardShadow} hover:shadow-[0_10px_30px_color-mix(in_srgb,var(--color-text)_10%,transparent)] transition-all duration-300 sm:col-span-1 lg:col-span-2 relative overflow-hidden min-w-0`}
                  >
                    <div
                      className={`absolute -right-6 -top-6 w-28 h-28 rounded-full ${c.bg} opacity-70`}
                    />

                    <div className="relative min-w-0">
                      <div className="flex items-start justify-between">
                        <div
                          className={`p-3 sm:p-3.5 rounded-xl ${c.bg} ${c.text} ring-4 ring-transparent ${c.ring} transition-all duration-300 flex-shrink-0`}
                        >
                          <Icon size={22} />
                        </div>

                        <ChevronRight
                          size={20}
                          className="text-[var(--color-text-placeholder)] group-hover:text-[var(--color-text-muted)] group-hover:translate-x-0.5 transition-all duration-300 mt-1 flex-shrink-0"
                        />
                      </div>

                      <h3 className="mt-4 sm:mt-5 text-base sm:text-lg font-semibold theme-text truncate">
                        {item.title}
                      </h3>

                      <p className="mt-1.5 text-sm theme-text-secondary leading-relaxed line-clamp-2">
                        {item.desc}
                      </p>

                      <div
                        className={`mt-4 inline-flex items-center text-xs font-medium ${c.text} ${c.bg} px-2.5 py-1 rounded-full max-w-full truncate`}
                      >
                        {item.stat}
                      </div>
                    </div>
                  </button>
                );
              }

              // =================================================
              // NORMAL CARD
              // =================================================

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => router.push(item.path)}
                  className={`group text-left theme-card rounded-2xl border ${c.border} ${c.hoverBorder} p-4 ${themeSmallShadow} hover:shadow-[0_8px_24px_color-mix(in_srgb,var(--color-text)_9%,transparent)] hover:-translate-y-0.5 transition-all duration-300 min-w-0`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg ${c.bg} ${c.text} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon size={17} />
                  </div>

                  <h3 className="mt-3 text-sm font-semibold theme-text truncate">
                    {item.title}
                  </h3>

                  <p className="mt-0.5 text-xs theme-text-secondary leading-relaxed line-clamp-2">
                    {item.desc}
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-2 min-w-0">
                    <span className="text-[11px] font-medium text-[var(--color-text-muted)] truncate">
                      {item.stat}
                    </span>

                    <ChevronRight
                      size={14}
                      className="text-[var(--color-text-placeholder)] group-hover:text-[var(--color-text-muted)] group-hover:translate-x-0.5 transition-all duration-300 flex-shrink-0"
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* ==================================================
              UNIT OVERVIEW + NOTIFICATIONS
          ================================================== */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* =================================================
                UNIT OVERVIEW
            ================================================= */}

            <div
              className={`lg:col-span-2 theme-card rounded-2xl border theme-border ${themeCardShadow} overflow-hidden`}
            >
              <div
                className={`flex items-center justify-between gap-2 p-4 sm:p-5 border-b ${themeDivider}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg ${themePrimarySoft} ${themePrimaryText} flex-shrink-0`}
                  >
                    <Building2 size={16} />
                  </div>

                  <h3 className="text-sm font-semibold theme-text truncate">
                    Kehadiran per Unit Sekolah
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/yayasan/sekolah")}
                  className={`text-xs font-medium ${themePrimaryText} hover:opacity-80 transition-opacity inline-flex items-center gap-0.5 flex-shrink-0`}
                >
                  Lihat semua
                  <ChevronRight size={12} />
                </button>
              </div>

              <div className="p-4 sm:p-5 space-y-4">
                {unitList.map((unit) => (
                  <div
                    key={unit.id}
                    className="flex items-center gap-3 sm:gap-4"
                  >
                    <span className="w-24 sm:w-40 flex-shrink-0 text-sm theme-text font-medium truncate">
                      {unit.nama}
                    </span>

                    <div
                      className="flex-1 min-w-0 h-2 rounded-full overflow-hidden"
                      style={{
                        background:
                          "color-mix(in srgb, var(--color-text) 7%, transparent)",
                      }}
                    >
                      <div
                        className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-500"
                        style={{
                          width: `${unit.kehadiran}%`,
                        }}
                      />
                    </div>

                    <span className="w-10 flex-shrink-0 text-right text-sm theme-text-secondary">
                      {unit.kehadiran}%
                    </span>

                    <TrendIcon trend={unit.trend} />
                  </div>
                ))}
              </div>
            </div>

            {/* =================================================
                NOTIFICATIONS
            ================================================= */}

            <div
              className={`theme-card rounded-2xl border theme-border ${themeCardShadow} overflow-hidden`}
            >
              <div
                className={`flex items-center justify-between p-4 sm:p-5 border-b ${themeDivider}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg ${themeInfoSurface} text-[var(--color-info)] flex-shrink-0`}
                  >
                    <Bell size={16} />
                  </div>

                  <h3 className="text-sm font-semibold theme-text truncate">
                    Notifikasi Terbaru
                  </h3>
                </div>
              </div>

              <div className="divide-y divide-[color-mix(in_srgb,var(--color-text)_7%,transparent)]">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 sm:p-5 flex items-start gap-3 ${themeNeutralHover} transition-colors`}
                  >
                    <div
                      className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        notification.read
                          ? "bg-[var(--color-text-placeholder)]"
                          : "bg-[var(--color-primary)]"
                      }`}
                    />

                    <div className="min-w-0">
                      <p className="text-sm font-medium theme-text truncate">
                        {notification.title}
                      </p>

                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                        {notification.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}