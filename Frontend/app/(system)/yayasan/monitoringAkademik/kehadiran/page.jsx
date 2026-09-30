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
  Users,
  GraduationCap,
  ChevronRight,
  Minus,
  CalendarDays,
} from "lucide-react";

// ============================================================
// DUMMY DATA
// Catatan: ganti dengan data asli dari API/DB begitu tersedia.
// ============================================================

const JENJANG_OPTIONS = ["Semua Jenjang", "SD", "SMP", "SMA"];

const PERIODE_OPTIONS = [
  "Agustus 2026",
  "Juli 2026",
  "Juni 2026",
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
    kehadiranSiswa: 97,
    kehadiranGuru: 99,
    trend: "up",
    perubahan: 0.8,
    totalAlpa: 14,
    totalSakitIzin: 62,
    totalTerlambat: 21,
    status: "Baik",
  },
  {
    id: 2,
    nama: "SD Smart School 2",
    jenjang: "SD",
    kehadiranSiswa: 94,
    kehadiranGuru: 97,
    trend: "up",
    perubahan: 0.3,
    totalAlpa: 22,
    totalSakitIzin: 58,
    totalTerlambat: 17,
    status: "Baik",
  },
  {
    id: 3,
    nama: "SMP Smart School 1",
    jenjang: "SMP",
    kehadiranSiswa: 90,
    kehadiranGuru: 95,
    trend: "down",
    perubahan: -0.6,
    totalAlpa: 41,
    totalSakitIzin: 74,
    totalTerlambat: 33,
    status: "Baik",
  },
  {
    id: 4,
    nama: "SMP Smart School 2",
    jenjang: "SMP",
    kehadiranSiswa: 81,
    kehadiranGuru: 91,
    trend: "down",
    perubahan: -3.4,
    totalAlpa: 96,
    totalSakitIzin: 88,
    totalTerlambat: 57,
    status: "Perlu Perhatian",
  },
  {
    id: 5,
    nama: "SMA Smart School 1",
    jenjang: "SMA",
    kehadiranSiswa: 92,
    kehadiranGuru: 96,
    trend: "up",
    perubahan: 1.1,
    totalAlpa: 38,
    totalSakitIzin: 65,
    totalTerlambat: 29,
    status: "Baik",
  },
  {
    id: 6,
    nama: "SMA Smart School 2",
    jenjang: "SMA",
    kehadiranSiswa: 73,
    kehadiranGuru: 88,
    trend: "down",
    perubahan: -5.2,
    totalAlpa: 142,
    totalSakitIzin: 96,
    totalTerlambat: 84,
    status: "Kritis",
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

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

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

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

// ============================================================
// STATUS STYLE
// ============================================================

function statusStyle(status) {
  switch (status) {
    case "Baik":
      return `
        bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]
        text-[var(--color-success)]
        border-[color-mix(in_srgb,var(--color-success)_22%,transparent)]
      `;

    case "Perlu Perhatian":
      return `
        bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]
        text-[var(--color-warning)]
        border-[color-mix(in_srgb,var(--color-warning)_22%,transparent)]
      `;

    case "Kritis":
      return `
        bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]
        text-[var(--color-text)]
        border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]
      `;

    default:
      return `
        ${themeNeutralSurface}
        theme-text-muted
        ${themeNeutralBorder}
      `;
  }
}

// ============================================================
// BAR STYLE
// ============================================================

function barColor(value) {
  if (value >= 90) {
    return "bg-[var(--color-success)]";
  }

  if (value >= 80) {
    return "bg-[var(--color-warning)]";
  }

  return "bg-[var(--color-primary)]";
}

// ============================================================
// TREND ICON
// ============================================================

function TrendIcon({ trend }) {
  if (trend === "up") {
    return (
      <TrendingUp
        size={12}
        className="text-[var(--color-success)]"
      />
    );
  }

  if (trend === "down") {
    return (
      <TrendingDown
        size={12}
        className="text-[var(--color-warning)]"
      />
    );
  }

  return (
    <Minus
      size={12}
      className="theme-text-muted"
    />
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function MonitoringKehadiranPage() {
  const [jenjang, setJenjang] = useState(JENJANG_OPTIONS[0]);
  const [periode, setPeriode] = useState(PERIODE_OPTIONS[0]);
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);
  const [search, setSearch] = useState("");

  // ==========================================================
  // FILTER + SORT
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
          a.kehadiranSiswa -
          b.kehadiranSiswa
      );
  }, [jenjang, status, search]);

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const summary = useMemo(() => {
    const total = filteredSekolah.length;

    const rataRataSiswa = total
      ? Math.round(
          filteredSekolah.reduce(
            (a, s) =>
              a + s.kehadiranSiswa,
            0
          ) / total
        )
      : 0;

    const rataRataGuru = total
      ? Math.round(
          filteredSekolah.reduce(
            (a, s) =>
              a + s.kehadiranGuru,
            0
          ) / total
        )
      : 0;

    const totalAlpa =
      filteredSekolah.reduce(
        (a, s) =>
          a + s.totalAlpa,
        0
      );

    const perluPerhatian =
      filteredSekolah.filter(
        (s) =>
          s.status ===
            "Perlu Perhatian" ||
          s.status === "Kritis"
      ).length;

    return {
      total,
      rataRataSiswa,
      rataRataGuru,
      totalAlpa,
      perluPerhatian,
    };
  }, [filteredSekolah]);

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="w-full max-w-[1800px] mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 space-y-6">

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">

            <p className="text-xs font-medium theme-text-muted mb-1">
              Monitoring Akademik
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
                Kehadiran
              </h1>
            </div>

            <p className="text-sm theme-text-secondary mt-1 ml-[42px] flex items-center gap-1.5">
              <Sparkles
                size={14}
                className="theme-text-muted flex-shrink-0"
              />

              <span className="truncate">
                Pantau tingkat kehadiran siswa dan guru di seluruh unit sekolah.
              </span>
            </p>
          </div>

          {/* Download */}
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
              bg-[var(--color-primary)]
              text-[var(--color-card)]
              rounded-lg
              hover:bg-[color-mix(in_srgb,var(--color-primary)_88%,black)]
              ${themePrimaryShadow}
              transition-colors
              whitespace-nowrap
              flex-shrink-0
            `}
          >
            <Download size={16} />
            Unduh Laporan
          </button>
        </div>

        {/* =====================================================
            FILTER BAR
        ===================================================== */}

        <div
          className={`
            theme-card
            rounded-xl
            border
            theme-border
            p-4
            ${themeSmallShadow}
          `}
        >
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">

            {/* Search */}
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
                  w-full
                  pl-9
                  pr-3
                  py-2.5
                  text-sm
                  theme-text-secondary
                  ${themeNeutralSurface}
                  border
                  ${themeNeutralBorder}
                  rounded-lg
                  outline-none
                  transition-colors
                  ${themeFocus}
                  placeholder:text-[var(--color-text-placeholder)]
                `}
              />
            </div>

            {/* Jenjang */}
            <div className="relative flex-1 min-w-[150px]">
              <select
                value={jenjang}
                onChange={(e) =>
                  setJenjang(e.target.value)
                }
                className={`
                  w-full
                  appearance-none
                  pl-3
                  pr-9
                  py-2.5
                  text-sm
                  font-medium
                  theme-text-secondary
                  ${themeNeutralSurface}
                  border
                  ${themeNeutralBorder}
                  rounded-lg
                  hover:border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)]
                  outline-none
                  focus:border-[var(--color-primary)]
                  focus:ring-2
                  focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]
                  transition-colors
                  cursor-pointer
                `}
              >
                {JENJANG_OPTIONS.map(
                  (j) => (
                    <option
                      key={j}
                      value={j}
                    >
                      {j}
                    </option>
                  )
                )}
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

            {/* Periode */}
            <div className="relative flex-1 min-w-[170px]">
              <select
                value={periode}
                onChange={(e) =>
                  setPeriode(e.target.value)
                }
                className={`
                  w-full
                  appearance-none
                  pl-3
                  pr-9
                  py-2.5
                  text-sm
                  font-medium
                  theme-text-secondary
                  ${themeNeutralSurface}
                  border
                  ${themeNeutralBorder}
                  rounded-lg
                  hover:border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)]
                  outline-none
                  focus:border-[var(--color-primary)]
                  focus:ring-2
                  focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]
                  transition-colors
                  cursor-pointer
                `}
              >
                {PERIODE_OPTIONS.map(
                  (p) => (
                    <option
                      key={p}
                      value={p}
                    >
                      {p}
                    </option>
                  )
                )}
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

            {/* Status */}
            <div className="relative flex-1 min-w-[160px]">
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
                className={`
                  w-full
                  appearance-none
                  pl-3
                  pr-9
                  py-2.5
                  text-sm
                  font-medium
                  theme-text-secondary
                  ${themeNeutralSurface}
                  border
                  ${themeNeutralBorder}
                  rounded-lg
                  hover:border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)]
                  outline-none
                  focus:border-[var(--color-primary)]
                  focus:ring-2
                  focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]
                  transition-colors
                  cursor-pointer
                `}
              >
                {STATUS_OPTIONS.map(
                  (s) => (
                    <option
                      key={s}
                      value={s}
                    >
                      {s}
                    </option>
                  )
                )}
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

        {/* =====================================================
            SUMMARY CARDS
        ===================================================== */}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

          {/* Kehadiran Siswa */}
          <div
            className={`
              theme-card
              rounded-xl
              border
              theme-border
              p-3.5
              ${themeSmallShadow}
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
                ${themePrimarySoft}
                ${themePrimarySoftBorder}
                text-[var(--color-primary)]
                flex-shrink-0
              `}
            >
              <Users size={16} />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wider truncate">
                Kehadiran Siswa
              </p>

              <p className="text-lg font-bold theme-text">
                {summary.rataRataSiswa}%
              </p>
            </div>
          </div>

          {/* Kehadiran Guru */}
          <div
            className={`
              theme-card
              rounded-xl
              border
              theme-border
              p-3.5
              ${themeSmallShadow}
              flex
              items-center
              gap-3
              min-w-0
            `}
          >
            <div
              className="
                p-2
                rounded-lg
                border
                bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)]
                border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]
                text-[var(--color-info)]
                flex-shrink-0
              "
            >
              <GraduationCap size={16} />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wider truncate">
                Kehadiran Guru
              </p>

              <p className="text-lg font-bold theme-text">
                {summary.rataRataGuru}%
              </p>
            </div>
          </div>

          {/* Total Alpa */}
          <div
            className={`
              theme-card
              rounded-xl
              border
              theme-border
              p-3.5
              ${themeSmallShadow}
              flex
              items-center
              gap-3
              min-w-0
            `}
          >
            <div
              className="
                p-2
                rounded-lg
                border
                bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]
                border-[color-mix(in_srgb,var(--color-text)_16%,transparent)]
                theme-text
                flex-shrink-0
              "
            >
              <AlertTriangle size={16} />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wider truncate">
                Total Alpa Bulan Ini
              </p>

              <p className="text-lg font-bold theme-text">
                {summary.totalAlpa}
              </p>
            </div>
          </div>

          {/* Unit Perlu Perhatian */}
          <div
            className={`
              theme-card
              rounded-xl
              border
              theme-border
              p-3.5
              ${themeSmallShadow}
              flex
              items-center
              gap-3
              min-w-0
            `}
          >
            <div
              className="
                p-2
                rounded-lg
                border
                bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]
                border-[color-mix(in_srgb,var(--color-warning)_22%,transparent)]
                text-[var(--color-warning)]
                flex-shrink-0
              "
            >
              <School size={16} />
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
        </div>

        {/* =====================================================
            KEHADIRAN PER UNIT SEKOLAH
        ===================================================== */}

        <div>
          <div className="flex items-center justify-between mb-3 gap-3">
            <h3 className="text-sm font-semibold theme-text-secondary">
              Kehadiran per Unit Sekolah
            </h3>

            <span className="text-xs theme-text-muted flex items-center gap-1.5 whitespace-nowrap">
              <CalendarDays size={12} />
              {periode} &middot;{" "}
              {filteredSekolah.length} unit
            </span>
          </div>

          {/* Empty */}
          {filteredSekolah.length === 0 ? (
            <div
              className={`
                theme-card
                rounded-xl
                border
                theme-border
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
                Tidak ada unit sekolah yang cocok dengan filter.
              </p>
            </div>
          ) : (
            <div
              className={`
                theme-card
                rounded-xl
                border
                theme-border
                ${themeCardShadow}
                overflow-hidden
              `}
            >
              <div>
                {filteredSekolah.map(
                  (s, index) => (
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
                        ${
                          index !==
                          filteredSekolah.length - 1
                            ? `border-b ${themeDivider}`
                            : ""
                        }
                      `}
                    >

                      {/* =====================================
                          IDENTITAS SEKOLAH
                      ====================================== */}

                      <div className="flex items-center gap-3 lg:w-[220px] flex-shrink-0 min-w-0">
                        <div
                          className={`
                            w-9
                            h-9
                            rounded-lg
                            ${themePrimaryGradient}
                            text-[var(--color-card)]
                            flex
                            items-center
                            justify-center
                            flex-shrink-0
                          `}
                        >
                          <School size={16} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold theme-text truncate">
                            {s.nama}
                          </p>

                          <p className="text-xs theme-text-muted">
                            {s.jenjang}
                          </p>
                        </div>
                      </div>

                      {/* =====================================
                          KEHADIRAN SISWA
                      ====================================== */}

                      <div className="flex-1 min-w-[150px]">
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <span className="text-[11px] font-medium theme-text-muted uppercase tracking-wide">
                            Kehadiran Siswa
                          </span>

                          <span className="flex items-center gap-1 text-xs font-semibold theme-text-secondary whitespace-nowrap">
                            {s.kehadiranSiswa}%

                            <TrendIcon
                              trend={s.trend}
                            />

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
                              {s.perubahan}%)
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
                                s.kehadiranSiswa
                              )}
                            `}
                            style={{
                              width: `${s.kehadiranSiswa}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* =====================================
                          KEHADIRAN GURU
                      ====================================== */}

                      <div className="flex-1 min-w-[150px]">
                        <div className="flex items-center justify-between mb-1 gap-2">
                          <span className="text-[11px] font-medium theme-text-muted uppercase tracking-wide">
                            Kehadiran Guru
                          </span>

                          <span className="text-xs font-semibold theme-text-secondary">
                            {s.kehadiranGuru}%
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
                                s.kehadiranGuru
                              )}
                            `}
                            style={{
                              width: `${s.kehadiranGuru}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* =====================================
                          RINCIAN KETIDAKHADIRAN
                      ====================================== */}

                      <div className="flex-shrink-0 lg:w-[220px] flex items-center gap-4">

                        <div>
                          <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wide mb-1">
                            Alpa
                          </p>

                          <p className="text-xs font-semibold theme-text">
                            {s.totalAlpa}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wide mb-1">
                            Sakit/Izin
                          </p>

                          <p className="text-xs font-semibold theme-text-secondary">
                            {s.totalSakitIzin}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wide mb-1">
                            Terlambat
                          </p>

                          <p className="text-xs font-semibold theme-text-secondary">
                            {s.totalTerlambat}
                          </p>
                        </div>
                      </div>

                      {/* =====================================
                          STATUS
                      ====================================== */}

                      <div className="flex items-center justify-between gap-3 lg:w-[150px] flex-shrink-0">

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
                            ${statusStyle(
                              s.status
                            )}
                          `}
                        >
                          {s.status}
                        </span>

                        <button
                          type="button"
                          className="
                            p-1.5
                            rounded-md
                            theme-text-muted
                            hover:text-[var(--color-primary)]
                            hover:bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]
                            transition-colors
                            flex-shrink-0
                          "
                          title={`Lihat detail ${s.nama}`}
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}