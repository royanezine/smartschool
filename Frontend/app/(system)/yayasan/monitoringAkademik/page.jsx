"use client";

import { useState, useMemo } from "react";
import {
  ClipboardCheck,
  Search,
  ChevronDown,
  Sparkles,
  Download,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  School,
  CalendarCheck,
  Trophy,
  BarChart3,
  ChevronRight,
  Minus,
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

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

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

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

// ============================================================
// DUMMY DATA
// ============================================================

const JENJANG_OPTIONS = [
  "Semua Jenjang",
  "SD",
  "SMP",
  "SMA",
];

const TAHUN_AJARAN_OPTIONS = [
  "2025/2026 - Genap",
  "2025/2026 - Ganjil",
  "2024/2025 - Genap",
];

const STATUS_OPTIONS = [
  "Semua Status",
  "Baik",
  "Perlu Perhatian",
  "Kritis",
];

const dataSekolah = [
  {
    id: 1,
    nama: "SD Smart School 1",
    jenjang: "SD",
    rataRataNilai: 84,
    trend: "up",
    perubahan: 2.1,
    kehadiran: 96,
    mapelLemah: null,
    siswaPerluPerhatian: 6,
    totalSiswa: 612,
    status: "Baik",
  },
  {
    id: 2,
    nama: "SD Smart School 2",
    jenjang: "SD",
    rataRataNilai: 79,
    trend: "up",
    perubahan: 1.4,
    kehadiran: 93,
    mapelLemah: null,
    siswaPerluPerhatian: 11,
    totalSiswa: 548,
    status: "Baik",
  },
  {
    id: 3,
    nama: "SMP Smart School 1",
    jenjang: "SMP",
    rataRataNilai: 76,
    trend: "down",
    perubahan: -0.8,
    kehadiran: 90,
    mapelLemah: "Matematika",
    siswaPerluPerhatian: 24,
    totalSiswa: 734,
    status: "Baik",
  },
  {
    id: 4,
    nama: "SMP Smart School 2",
    jenjang: "SMP",
    rataRataNilai: 68,
    trend: "down",
    perubahan: -3.2,
    kehadiran: 82,
    mapelLemah: "IPA",
    siswaPerluPerhatian: 47,
    totalSiswa: 689,
    status: "Perlu Perhatian",
  },
  {
    id: 5,
    nama: "SMA Smart School 1",
    jenjang: "SMA",
    rataRataNilai: 81,
    trend: "up",
    perubahan: 0.6,
    kehadiran: 91,
    mapelLemah: null,
    siswaPerluPerhatian: 18,
    totalSiswa: 812,
    status: "Baik",
  },
  {
    id: 6,
    nama: "SMA Smart School 2",
    jenjang: "SMA",
    rataRataNilai: 59,
    trend: "down",
    perubahan: -4.5,
    kehadiran: 74,
    mapelLemah: "Matematika",
    siswaPerluPerhatian: 63,
    totalSiswa: 917,
    status: "Kritis",
  },
];

const mapelOverview = [
  {
    mapel: "Matematika",
    rataRata: 71,
    target: 75,
  },
  {
    mapel: "Bahasa Indonesia",
    rataRata: 79,
    target: 75,
  },
  {
    mapel: "IPA",
    rataRata: 70,
    target: 75,
  },
  {
    mapel: "IPS",
    rataRata: 76,
    target: 75,
  },
  {
    mapel: "Bahasa Inggris",
    rataRata: 74,
    target: 75,
  },
];

// ============================================================
// THEME STATUS
// ============================================================

function statusStyle(status) {
  switch (status) {
    case "Baik":
      return `${themeSuccessSurface} ${themeSuccessBorder} text-[var(--color-success)]`;

    case "Perlu Perhatian":
      return `${themeWarningSurface} ${themeWarningBorder} text-[var(--color-warning)]`;

    case "Kritis":
      return `${themeDangerSurface} ${themeDangerBorder} text-[var(--color-text)]`;

    default:
      return `${themeNeutralSurface} ${themeNeutralBorder} theme-text-muted`;
  }
}

// ============================================================
// PROGRESS BAR THEME
// ============================================================

function barColor(value, kind) {
  if (kind === "kehadiran") {
    if (value >= 90) {
      return "bg-[var(--color-success)]";
    }

    if (value >= 80) {
      return "bg-[var(--color-warning)]";
    }

    return "bg-[var(--color-text)]";
  }

  if (value >= 75) {
    return "bg-[var(--color-success)]";
  }

  if (value >= 65) {
    return "bg-[var(--color-warning)]";
  }

  return "bg-[var(--color-text)]";
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function MonitoringAkademikPage() {
  const [jenjang, setJenjang] = useState(JENJANG_OPTIONS[0]);
  const [tahunAjaran, setTahunAjaran] = useState(
    TAHUN_AJARAN_OPTIONS[0]
  );
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);
  const [search, setSearch] = useState("");

  // ==========================================================
  // FILTER SEKOLAH
  // ==========================================================

  const filteredSekolah = useMemo(() => {
    return dataSekolah
      .filter((s) => {
        const matchJenjang =
          jenjang === "Semua Jenjang" ||
          s.jenjang === jenjang;

        const matchStatus =
          status === "Semua Status" ||
          s.status === status;

        const matchSearch =
          !search.trim() ||
          s.nama
            .toLowerCase()
            .includes(search.toLowerCase());

        return (
          matchJenjang &&
          matchStatus &&
          matchSearch
        );
      })
      .sort(
        (a, b) =>
          b.rataRataNilai - a.rataRataNilai
      );
  }, [jenjang, status, search]);

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const summary = useMemo(() => {
    const total = filteredSekolah.length;

    const rataRataNilai = total
      ? Math.round(
          filteredSekolah.reduce(
            (a, s) => a + s.rataRataNilai,
            0
          ) / total
        )
      : 0;

    const rataRataKehadiran = total
      ? Math.round(
          filteredSekolah.reduce(
            (a, s) => a + s.kehadiran,
            0
          ) / total
        )
      : 0;

    const perluPerhatian =
      filteredSekolah.filter(
        (s) =>
          s.status === "Perlu Perhatian" ||
          s.status === "Kritis"
      ).length;

    const totalSiswaPerluPerhatian =
      filteredSekolah.reduce(
        (a, s) => a + s.siswaPerluPerhatian,
        0
      );

    return {
      total,
      rataRataNilai,
      rataRataKehadiran,
      perluPerhatian,
      totalSiswaPerluPerhatian,
    };
  }, [filteredSekolah]);

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="w-full max-w-[1800px] mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 space-y-6">

        {/* ====================================================
            PAGE HEADER
        ==================================================== */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium theme-text-muted mb-1">
              Akademik
            </p>

            <div className="flex items-center gap-2.5">
              <div
                className={`
                  p-2
                  rounded-lg
                  ${themePrimaryGradient}
                  text-[var(--color-card)]
                  ${themePrimaryShadow}
                  flex-shrink-0
                `}
              >
                <ClipboardCheck size={18} />
              </div>

              <h1 className="text-xl sm:text-2xl font-semibold theme-text truncate">
                Monitoring Akademik
              </h1>
            </div>

            <p className="text-sm theme-text-secondary mt-1 ml-[42px] flex items-center gap-1.5">
              <Sparkles
                size={14}
                className="theme-text-muted flex-shrink-0"
              />

              <span className="truncate">
                Pantau performa akademik seluruh unit
                sekolah di lingkungan yayasan.
              </span>
            </p>
          </div>

          <button
            type="button"
            className={`
              flex
              items-center
              justify-center
              gap-2
              px-4
              py-2.5
              text-sm
              font-medium
              text-[var(--color-card)]
              bg-[var(--color-primary)]
              rounded-lg
              hover:opacity-90
              transition-colors
              ${themePrimaryShadow}
              whitespace-nowrap
              flex-shrink-0
            `}
          >
            <Download size={16} />
            Unduh Laporan
          </button>
        </div>

        {/* ====================================================
            FILTER BAR
        ==================================================== */}

        <div
          className={`
            theme-card
            rounded-xl
            border theme-border
            p-4
            ${themeCardShadow}
          `}
        >
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">

            {/* SEARCH */}
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={15}
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  theme-text-muted
                "
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Cari nama sekolah..."
                className={`
                  theme-input
                  w-full
                  pl-9
                  pr-3
                  py-2.5
                  text-sm
                  rounded-lg
                  transition-colors
                  ${themeFocus}
                  placeholder:text-[var(--color-text-placeholder)]
                `}
              />
            </div>

            {/* JENJANG */}
            <div className="relative flex-1 min-w-[150px]">
              <select
                value={jenjang}
                onChange={(e) =>
                  setJenjang(e.target.value)
                }
                className={`
                  theme-input
                  w-full
                  appearance-none
                  pl-3
                  pr-9
                  py-2.5
                  text-sm
                  font-medium
                  rounded-lg
                  transition-colors
                  cursor-pointer
                  ${themeFocus}
                `}
              >
                {JENJANG_OPTIONS.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={14}
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  theme-text-muted
                  pointer-events-none
                "
              />
            </div>

            {/* TAHUN AJARAN */}
            <div className="relative flex-1 min-w-[190px]">
              <select
                value={tahunAjaran}
                onChange={(e) =>
                  setTahunAjaran(e.target.value)
                }
                className={`
                  theme-input
                  w-full
                  appearance-none
                  pl-3
                  pr-9
                  py-2.5
                  text-sm
                  font-medium
                  rounded-lg
                  transition-colors
                  cursor-pointer
                  ${themeFocus}
                `}
              >
                {TAHUN_AJARAN_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={14}
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  theme-text-muted
                  pointer-events-none
                "
              />
            </div>

            {/* STATUS */}
            <div className="relative flex-1 min-w-[160px]">
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
                className={`
                  theme-input
                  w-full
                  appearance-none
                  pl-3
                  pr-9
                  py-2.5
                  text-sm
                  font-medium
                  rounded-lg
                  transition-colors
                  cursor-pointer
                  ${themeFocus}
                `}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={14}
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  theme-text-muted
                  pointer-events-none
                "
              />
            </div>
          </div>
        </div>

        {/* ====================================================
            SUMMARY CARDS
        ==================================================== */}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

          {/* RATA-RATA NILAI */}
          <div
            className={`
              theme-card
              rounded-xl
              border theme-border
              p-3.5
              ${themeCardShadow}
              flex
              items-center
              gap-3
              min-w-0
            `}
          >
            <div
              className={`
                p-2
                rounded-lg
                border
                ${themeInfoSurface}
                ${themeInfoBorder}
                text-[var(--color-info)]
                flex-shrink-0
              `}
            >
              <BarChart3 size={16} />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wider truncate">
                Rata-rata Nilai Yayasan
              </p>

              <p className="text-lg font-bold theme-text">
                {summary.rataRataNilai}
              </p>
            </div>
          </div>

          {/* KEHADIRAN */}
          <div
            className={`
              theme-card
              rounded-xl
              border theme-border
              p-3.5
              ${themeCardShadow}
              flex
              items-center
              gap-3
              min-w-0
            `}
          >
            <div
              className={`
                p-2
                rounded-lg
                border
                ${themeSuccessSurface}
                ${themeSuccessBorder}
                text-[var(--color-success)]
                flex-shrink-0
              `}
            >
              <CalendarCheck size={16} />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wider truncate">
                Rata-rata Kehadiran
              </p>

              <p className="text-lg font-bold theme-text">
                {summary.rataRataKehadiran}%
              </p>
            </div>
          </div>

          {/* UNIT PERHATIAN */}
          <div
            className={`
              theme-card
              rounded-xl
              border theme-border
              p-3.5
              ${themeCardShadow}
              flex
              items-center
              gap-3
              min-w-0
            `}
          >
            <div
              className={`
                p-2
                rounded-lg
                border
                ${themeDangerSurface}
                ${themeDangerBorder}
                text-[var(--color-text)]
                flex-shrink-0
              `}
            >
              <AlertTriangle size={16} />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wider truncate">
                Unit Perlu Perhatian
              </p>

              <p className="text-lg font-bold theme-text">
                {summary.perluPerhatian}
              </p>
            </div>
          </div>

          {/* SISWA PERHATIAN */}
          <div
            className={`
              theme-card
              rounded-xl
              border theme-border
              p-3.5
              ${themeCardShadow}
              flex
              items-center
              gap-3
              min-w-0
            `}
          >
            <div
              className={`
                p-2
                rounded-lg
                border
                ${themeWarningSurface}
                ${themeWarningBorder}
                text-[var(--color-warning)]
                flex-shrink-0
              `}
            >
              <School size={16} />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wider truncate">
                Siswa Perlu Perhatian
              </p>

              <p className="text-lg font-bold theme-text">
                {summary.totalSiswaPerluPerhatian}
              </p>
            </div>
          </div>
        </div>

        {/* ====================================================
            RATA-RATA PER MAPEL
        ==================================================== */}

        <div
          className={`
            theme-card
            rounded-xl
            border theme-border
            ${themeCardShadow}
            p-4
            sm:p-5
          `}
        >
          <div className="flex items-center justify-between mb-4 gap-3">
            <h3 className="text-sm font-semibold theme-text-secondary flex items-center gap-2">
              <BarChart3
                size={15}
                className="theme-text-muted"
              />

              <span>
                Rata-rata Nilai per Mata Pelajaran —
                Seluruh Yayasan
              </span>
            </h3>

            <span className="text-xs theme-text-muted whitespace-nowrap">
              Target KKM: 75
            </span>
          </div>

          <div className="space-y-3.5">
            {mapelOverview.map((m) => {
              const belowTarget =
                m.rataRata < m.target;

              return (
                <div key={m.mapel}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium theme-text-secondary">
                      {m.mapel}
                    </span>

                    <span
                      className={`
                        text-xs
                        font-semibold
                        ${
                          belowTarget
                            ? "text-[var(--color-warning)]"
                            : "text-[var(--color-success)]"
                        }
                      `}
                    >
                      {m.rataRata}
                    </span>
                  </div>

                  <div
                    className={`
                      relative
                      h-2
                      rounded-full
                      ${themeNeutralSurface}
                      overflow-hidden
                    `}
                  >
                    <div
                      className={`
                        h-full
                        rounded-full
                        ${
                          belowTarget
                            ? "bg-[var(--color-warning)]"
                            : "bg-[var(--color-success)]"
                        }
                      `}
                      style={{
                        width: `${m.rataRata}%`,
                      }}
                    />

                    {/* TARGET KKM */}
                    <div
                      className="
                        absolute
                        top-0
                        h-full
                        w-[2px]
                        bg-[var(--color-text-muted)]
                      "
                      style={{
                        left: `${m.target}%`,
                      }}
                      title={`Target KKM ${m.target}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ====================================================
            PERINGKAT UNIT SEKOLAH
        ==================================================== */}

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold theme-text-secondary">
              Peringkat Performa Unit Sekolah
            </h3>

            <span className="text-xs theme-text-muted">
              {filteredSekolah.length} unit
            </span>
          </div>

          {filteredSekolah.length === 0 ? (
            <div
              className={`
                theme-card
                rounded-xl
                border theme-border
                ${themeCardShadow}
                p-10
                text-center
              `}
            >
              <School
                size={28}
                className="mx-auto theme-text-muted mb-2"
              />

              <p className="text-sm theme-text-muted">
                Tidak ada unit sekolah yang cocok
                dengan filter.
              </p>
            </div>
          ) : (
            <div
              className={`
                theme-card
                rounded-xl
                border theme-border
                ${themeCardShadow}
                overflow-hidden
              `}
            >
              <div className={`divide-y ${themeDivider}`}>
                {filteredSekolah.map((s, idx) => (
                  <div
                    key={s.id}
                    className={`
                      flex
                      flex-col
                      lg:flex-row
                      lg:items-center
                      gap-4
                      p-4
                      sm:p-5
                      ${themeNeutralHover}
                      transition-colors
                    `}
                  >
                    {/* ========================================
                        PERINGKAT + IDENTITAS
                    ======================================== */}

                    <div className="flex items-center gap-3 lg:w-[240px] flex-shrink-0 min-w-0">
                      <div
                        className={`
                          w-8
                          h-8
                          rounded-lg
                          flex
                          items-center
                          justify-center
                          text-xs
                          font-bold
                          flex-shrink-0
                          ${
                            idx === 0
                              ? `${themeWarningSurface} ${themeWarningBorder} text-[var(--color-warning)]`
                              : `${themeNeutralSurface} ${themeNeutralBorder} theme-text-muted`
                          }
                          border
                        `}
                      >
                        {idx === 0 ? (
                          <Trophy size={14} />
                        ) : (
                          idx + 1
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold theme-text truncate">
                          {s.nama}
                        </p>

                        <p className="text-xs theme-text-muted">
                          {s.jenjang} &middot;{" "}
                          {s.totalSiswa.toLocaleString(
                            "id-ID"
                          )}{" "}
                          siswa
                        </p>
                      </div>
                    </div>

                    {/* ========================================
                        NILAI
                    ======================================== */}

                    <div className="flex-1 min-w-[140px]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-medium theme-text-muted uppercase tracking-wide">
                          Rata-rata Nilai
                        </span>

                        <span className="flex items-center gap-1 text-xs font-semibold theme-text-secondary">
                          {s.rataRataNilai}

                          {s.trend === "up" ? (
                            <TrendingUp
                              size={12}
                              className="text-[var(--color-success)]"
                            />
                          ) : s.trend === "down" ? (
                            <TrendingDown
                              size={12}
                              className="text-[var(--color-warning)]"
                            />
                          ) : (
                            <Minus
                              size={12}
                              className="theme-text-muted"
                            />
                          )}

                          <span
                            className={
                              s.perubahan >= 0
                                ? "text-[var(--color-success)]"
                                : "text-[var(--color-warning)]"
                            }
                          >
                            (
                            {s.perubahan >= 0
                              ? "+"
                              : ""}
                            {s.perubahan})
                          </span>
                        </span>
                      </div>

                      <div
                        className={`
                          h-2
                          rounded-full
                          ${themeNeutralSurface}
                          overflow-hidden
                        `}
                      >
                        <div
                          className={`
                            h-full
                            rounded-full
                            ${barColor(
                              s.rataRataNilai,
                              "nilai"
                            )}
                          `}
                          style={{
                            width: `${s.rataRataNilai}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* ========================================
                        KEHADIRAN
                    ======================================== */}

                    <div className="flex-1 min-w-[140px]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-medium theme-text-muted uppercase tracking-wide">
                          Kehadiran
                        </span>

                        <span className="text-xs font-semibold theme-text-secondary">
                          {s.kehadiran}%
                        </span>
                      </div>

                      <div
                        className={`
                          h-2
                          rounded-full
                          ${themeNeutralSurface}
                          overflow-hidden
                        `}
                      >
                        <div
                          className={`
                            h-full
                            rounded-full
                            ${barColor(
                              s.kehadiran,
                              "kehadiran"
                            )}
                          `}
                          style={{
                            width: `${s.kehadiran}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* ========================================
                        SISWA PERLU PERHATIAN
                    ======================================== */}

                    <div className="flex-shrink-0 lg:w-[130px]">
                      <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wide mb-1">
                        Perlu Perhatian
                      </p>

                      <p className="text-xs font-semibold theme-text-secondary">
                        {s.siswaPerluPerhatian} siswa
                      </p>
                    </div>

                    {/* ========================================
                        STATUS
                    ======================================== */}

                    <div className="flex items-center justify-between gap-3 lg:w-[200px] flex-shrink-0">
                      <div className="min-w-0">
                        <span
                          className={`
                            inline-flex
                            items-center
                            gap-1
                            text-[10px]
                            font-medium
                            px-2
                            py-1
                            rounded-full
                            border
                            ${statusStyle(s.status)}
                          `}
                        >
                          {s.status}
                        </span>

                        {s.mapelLemah && (
                          <p className="text-[11px] theme-text-muted mt-1 truncate">
                            Terlemah: {s.mapelLemah}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        className={`
                          p-1.5
                          rounded-md
                          theme-text-muted
                          hover:text-[var(--color-primary)]
                          ${themePrimarySoft}
                          transition-colors
                          flex-shrink-0
                        `}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}