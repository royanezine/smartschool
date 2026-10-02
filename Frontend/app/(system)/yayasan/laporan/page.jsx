"use client";

import { useRouter } from "next/navigation";
import {
  FileText,
  BookOpen,
  GraduationCap,
  Package,
  UserSquare2,
  ChevronRight,
  Sparkles,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

// ============================================================
// DUMMY DATA
// Catatan: ganti dengan data asli dari API/DB begitu tersedia.
// ============================================================

const categories = [
  {
    id: "akademik",
    title: "Akademik",
    desc: "Rekap nilai, kehadiran, dan capaian belajar per unit sekolah",
    icon: BookOpen,
    color: "primary",
    path: "/yayasan/laporan/akademik",
    stat: "6 unit sekolah",
  },
  {
    id: "guru",
    title: "Guru",
    desc: "Rekap kinerja, kehadiran, dan beban mengajar tenaga pendidik",
    icon: GraduationCap,
    color: "info",
    path: "/yayasan/laporan/guru",
    stat: "237 guru aktif",
  },
  {
    id: "iventaris",
    title: "Inventaris",
    desc: "Kondisi aset dan sarana-prasarana tiap unit sekolah",
    icon: Package,
    color: "warning",
    path: "/yayasan/laporan/iventaris",
    stat: "Update bulanan",
  },
  {
    id: "siswa",
    title: "Siswa",
    desc: "Rekap data induk, mutasi, dan demografi siswa lintas unit",
    icon: UserSquare2,
    color: "success",
    path: "/yayasan/laporan/siswa",
    stat: "4.312 siswa",
  },
];

const recentReports = [
  {
    id: 1,
    title: "Rekap Nilai Semester Ganjil 2025/2026",
    category: "Akademik",
    date: "12 Agu 2026",
    trend: "up",
  },
  {
    id: 2,
    title: "Laporan Kehadiran Guru Bulan Juli",
    category: "Guru",
    date: "3 Agu 2026",
    trend: "up",
  },
  {
    id: 3,
    title: "Audit Inventaris Triwulan II",
    category: "Inventaris",
    date: "28 Jul 2026",
    trend: "down",
  },
  {
    id: 4,
    title: "Data Mutasi Siswa Semester Ganjil",
    category: "Siswa",
    date: "15 Jul 2026",
    trend: "same",
  },
];

// ============================================================
// THEME HELPERS
// ============================================================

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_22%,transparent)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_22%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

// ============================================================
// CATEGORY THEME
// ============================================================

const categoryTheme = {
  primary: {
    surface: themePrimarySoft,
    border: themePrimarySoftBorder,
    text: "text-[var(--color-primary)]",
    hoverBorder:
      "hover:border-[color-mix(in_srgb,var(--color-primary)_38%,transparent)]",
    ring:
      "group-hover:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]",
    decoration:
      "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]",
  },

  info: {
    surface: themeInfoSurface,
    border: themeInfoBorder,
    text: "text-[var(--color-info)]",
    hoverBorder:
      "hover:border-[color-mix(in_srgb,var(--color-info)_38%,transparent)]",
    ring:
      "group-hover:ring-[color-mix(in_srgb,var(--color-info)_10%,transparent)]",
    decoration:
      "bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)]",
  },

  warning: {
    surface: themeWarningSurface,
    border: themeWarningBorder,
    text: "text-[var(--color-warning)]",
    hoverBorder:
      "hover:border-[color-mix(in_srgb,var(--color-warning)_38%,transparent)]",
    ring:
      "group-hover:ring-[color-mix(in_srgb,var(--color-warning)_10%,transparent)]",
    decoration:
      "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]",
  },

  success: {
    surface: themeSuccessSurface,
    border: themeSuccessBorder,
    text: "text-[var(--color-success)]",
    hoverBorder:
      "hover:border-[color-mix(in_srgb,var(--color-success)_38%,transparent)]",
    ring:
      "group-hover:ring-[color-mix(in_srgb,var(--color-success)_10%,transparent)]",
    decoration:
      "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]",
  },
};

// ============================================================
// TREND ICON
// ============================================================

const TrendIcon = ({ trend }) => {
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
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function LaporanYayasanPage() {
  const router = useRouter();

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="w-full max-w-[1800px] mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 space-y-6">

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <div
                className={`
                  p-2 rounded-lg
                  ${themePrimaryGradient}
                  text-[var(--color-card)]
                  ${themePrimaryShadow}
                  flex-shrink-0
                `}
              >
                <FileText size={18} />
              </div>

              <h1 className="text-xl sm:text-2xl font-semibold theme-text truncate">
                Laporan & Analitik
              </h1>
            </div>

            <p className="theme-text-secondary text-sm mt-1 ml-[42px] flex items-center gap-1.5">
              <Sparkles
                size={14}
                className="theme-text-muted flex-shrink-0"
              />

              <span className="truncate">
                Pilih kategori laporan yang ingin dilihat lebih detail.
              </span>
            </p>
          </div>
        </div>

        {/* =====================================================
            CATEGORY CARDS
        ===================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map((item) => {
            const Icon = item.icon;
            const c = categoryTheme[item.color];

            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                className={`
                  group
                  text-left
                  theme-card
                  rounded-2xl
                  border
                  ${c.border}
                  ${c.hoverBorder}
                  p-5 sm:p-6
                  ${themeCardShadow}
                  hover:shadow-[0_12px_32px_color-mix(in_srgb,var(--color-text)_9%,transparent)]
                  transition-all
                  duration-300
                  relative
                  overflow-hidden
                  min-w-0
                `}
              >
                {/* Decorative background */}
                <div
                  className={`
                    absolute
                    -right-6
                    -top-6
                    w-28
                    h-28
                    rounded-full
                    ${c.decoration}
                    opacity-70
                  `}
                />

                <div className="relative min-w-0">
                  <div className="flex items-start justify-between">
                    {/* Icon */}
                    <div
                      className={`
                        p-3
                        sm:p-3.5
                        rounded-xl
                        ${c.surface}
                        ${c.text}
                        ring-4
                        ring-transparent
                        ${c.ring}
                        transition-all
                        duration-300
                        flex-shrink-0
                      `}
                    >
                      <Icon size={22} />
                    </div>

                    {/* Arrow */}
                    <ChevronRight
                      size={20}
                      className="
                        theme-text-muted
                        group-hover:text-[var(--color-primary)]
                        group-hover:translate-x-0.5
                        transition-all
                        duration-300
                        mt-1
                        flex-shrink-0
                      "
                    />
                  </div>

                  {/* Title */}
                  <h3 className="mt-4 sm:mt-5 text-base sm:text-lg font-semibold theme-text truncate">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-1.5 theme-text-secondary text-sm leading-relaxed line-clamp-2">
                    {item.desc}
                  </p>

                  {/* Stat */}
                  <div
                    className={`
                      mt-4
                      inline-flex
                      items-center
                      text-xs
                      font-medium
                      ${c.text}
                      ${c.surface}
                      px-2.5
                      py-1
                      rounded-full
                      max-w-full
                      truncate
                    `}
                  >
                    {item.stat}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* =====================================================
            RECENT REPORTS
        ===================================================== */}

        <div
          className={`
            theme-card
            rounded-2xl
            border
            theme-border
            ${themeCardShadow}
            overflow-hidden
          `}
        >
          {/* Header */}
          <div
            className={`
              flex
              items-center
              justify-between
              gap-2
              p-4
              sm:p-5
              border-b
              ${themeDivider}
            `}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`
                  p-1.5
                  rounded-lg
                  ${themePrimarySoft}
                  text-[var(--color-primary)]
                  flex-shrink-0
                `}
              >
                <Calendar size={16} />
              </div>

              <h3 className="text-sm font-semibold theme-text truncate">
                Laporan Terbaru
              </h3>
            </div>
          </div>

          {/* List */}
          <div>
            {recentReports.map((r, index) => (
              <div
                key={r.id}
                className={`
                  p-4
                  sm:p-5
                  flex
                  items-center
                  gap-3
                  ${themeNeutralHover}
                  transition-colors
                  ${
                    index !== recentReports.length - 1
                      ? `border-b ${themeDivider}`
                      : ""
                  }
                `}
              >
                {/* Report info */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium theme-text truncate">
                    {r.title}
                  </p>

                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`
                        text-[11px]
                        font-medium
                        theme-text-secondary
                        ${themeNeutralSurface}
                        px-2
                        py-0.5
                        rounded-full
                        border
                        ${themeNeutralBorder}
                      `}
                    >
                      {r.category}
                    </span>

                    <span className="text-xs theme-text-muted">
                      {r.date}
                    </span>
                  </div>
                </div>

                {/* Trend */}
                <TrendIcon trend={r.trend} />

                {/* Download */}
                <button
                  className="
                    p-2
                    rounded-lg
                    theme-text-muted
                    hover:text-[var(--color-primary)]
                    hover:bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]
                    transition-colors
                    flex-shrink-0
                  "
                  title="Unduh laporan"
                  type="button"
                >
                  <Download size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}