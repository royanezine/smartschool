"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Search,
  ChevronDown,
  ChevronLeft,
  Sparkles,
  Download,
  Users,
  UserCheck,
  Building2,
  BookOpen,
} from "lucide-react";

// ============================================================
// DUMMY DATA
// Catatan: ganti dengan data asli dari API/DB begitu tersedia.
// ============================================================

const SEMESTER_OPTIONS = [
  "Ganjil 2025/2026",
  "Genap 2024/2025",
  "Ganjil 2024/2025",
];

const UNIT_OPTIONS = [
  "Semua Unit",
  "SD Smart School 1",
  "SD Smart School 2",
  "SMP Smart School 1",
  "SMP Smart School 2",
  "SMA Smart School 1",
  "SMA Smart School 2",
];

const dataGuru = [
  {
    id: 1,
    nama: "Budi Santoso, S.Pd",
    mapel: "Matematika",
    unit: "SMP Smart School 1",
    kelasDiampu: 4,
    status: "Aktif",
    berlakuSejak: "12 Jul 2023",
  },
  {
    id: 2,
    nama: "Siti Aminah, S.Pd",
    mapel: "Bahasa Indonesia",
    unit: "SD Smart School 1",
    kelasDiampu: 6,
    status: "Aktif",
    berlakuSejak: "03 Jan 2021",
  },
  {
    id: 3,
    nama: "Rudi Hartono, M.Pd",
    mapel: "IPA",
    unit: "SMP Smart School 2",
    kelasDiampu: 5,
    status: "Aktif",
    berlakuSejak: "18 Aug 2022",
  },
  {
    id: 4,
    nama: "Dewi Kusuma, S.Pd",
    mapel: "Bahasa Inggris",
    unit: "SMA Smart School 1",
    kelasDiampu: 3,
    status: "Aktif",
    berlakuSejak: "25 Feb 2024",
  },
  {
    id: 5,
    nama: "Ahmad Fauzan, S.Pd",
    mapel: "Matematika",
    unit: "SMA Smart School 2",
    kelasDiampu: 4,
    status: "Nonaktif",
    berlakuSejak: "10 Jun 2019",
  },
  {
    id: 6,
    nama: "Nurul Hidayah, S.Pd",
    mapel: "IPS",
    unit: "SD Smart School 2",
    kelasDiampu: 6,
    status: "Aktif",
    berlakuSejak: "07 Sep 2023",
  },
  {
    id: 7,
    nama: "Eko Prasetyo, M.Pd",
    mapel: "Fisika",
    unit: "SMA Smart School 1",
    kelasDiampu: 3,
    status: "Aktif",
    berlakuSejak: "14 Apr 2022",
  },
  {
    id: 8,
    nama: "Fitriani, S.Pd",
    mapel: "Seni Budaya",
    unit: "SMP Smart School 1",
    kelasDiampu: 5,
    status: "Aktif",
    berlakuSejak: "29 Nov 2020",
  },
];

// ============================================================
// THEME HELPERS
// ============================================================

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

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const themePrimaryButton =
  "bg-[var(--color-primary)] text-[var(--color-card)] hover:bg-[color-mix(in_srgb,var(--color-primary)_88%,var(--color-text))]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_24%,transparent)]";

// ============================================================
// STATUS THEME
// ============================================================

const statusTheme = {
  Aktif: {
    surface: themeSuccessSurface,
    text: "text-[var(--color-success)]",
    border: themeSuccessBorder,
  },

  Nonaktif: {
    surface:
      "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]",
    text: "text-[var(--color-text-muted)]",
    border:
      "border-[color-mix(in_srgb,var(--color-text)_16%,transparent)]",
  },
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function LaporanGuruPage() {
  const router = useRouter();

  const [semester, setSemester] = useState(SEMESTER_OPTIONS[0]);
  const [unit, setUnit] = useState(UNIT_OPTIONS[0]);
  const [search, setSearch] = useState("");

  // ============================================================
  // FILTER DATA
  // ============================================================

  const filteredGuru = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return dataGuru.filter((g) => {
      const matchUnit =
        unit === "Semua Unit" || g.unit === unit;

      const matchSearch =
        !keyword ||
        g.nama.toLowerCase().includes(keyword) ||
        g.mapel.toLowerCase().includes(keyword);

      return matchUnit && matchSearch;
    });
  }, [unit, search]);

  // ============================================================
  // SUMMARY
  // ============================================================

  const summary = useMemo(() => {
    const totalGuru = filteredGuru.length;

    const guruAktif = filteredGuru.filter(
      (g) => g.status === "Aktif"
    ).length;

    const totalUnit = new Set(
      filteredGuru.map((g) => g.unit)
    ).size;

    const totalKelasDiampu = filteredGuru.reduce(
      (total, g) => total + g.kelasDiampu,
      0
    );

    return {
      totalGuru,
      guruAktif,
      totalUnit,
      totalKelasDiampu,
    };
  }, [filteredGuru]);

  // ============================================================
  // EXPORT
  // ============================================================

  const handleDownload = () => {
    const headers = [
      "Nama Guru",
      "Mapel",
      "Unit",
      "Kelas Diampu",
      "Berlaku Sejak",
      "Status",
    ];

    const rows = filteredGuru.map((g) => [
      g.nama,
      g.mapel,
      g.unit,
      g.kelasDiampu,
      g.berlakuSejak,
      g.status,
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `laporan-guru-${semester
      .replace(/\//g, "-")
      .replace(/\s+/g, "-")
      .toLowerCase()}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="w-full max-w-[1800px] mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 space-y-6">

        {/* ======================================================
            PAGE HEADER
        ====================================================== */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">

            <button
              onClick={() => router.push("/yayasan/laporan")}
              className="
                inline-flex items-center gap-1
                text-xs font-medium
                text-[var(--color-text-muted)]
                hover:text-[var(--color-primary)]
                transition-colors
                mb-1
              "
            >
              <ChevronLeft size={13} />
              Laporan & Analitik
            </button>

            <div className="flex items-center gap-2.5">
              <div
                className={`
                  p-2 rounded-lg
                  ${themePrimarySoft}
                  text-[var(--color-primary)]
                  ${themePrimarySoftBorder}
                  border
                  ${themeSmallShadow}
                  flex-shrink-0
                `}
              >
                <GraduationCap size={18} />
              </div>

              <h1 className="text-xl sm:text-2xl font-semibold theme-text truncate">
                Laporan Guru
              </h1>
            </div>

            <p className="text-sm theme-text-secondary mt-1 ml-[42px] flex items-center gap-1.5">
              <Sparkles
                size={14}
                className="text-[var(--color-primary)] flex-shrink-0"
              />

              <span className="truncate">
                Rekap data guru, mapel yang diampu, dan unit sekolah tempat mengajar.
              </span>
            </p>
          </div>

          {/* DOWNLOAD */}

          <button
            type="button"
            onClick={handleDownload}
            className={`
              inline-flex items-center justify-center
              gap-2 px-4 py-2.5
              text-sm font-medium
              rounded-lg
              transition-all
              shadow-sm
              whitespace-nowrap
              flex-shrink-0
              ${themePrimaryButton}
            `}
          >
            <Download size={16} />
            Unduh Laporan
          </button>
        </div>

        {/* ======================================================
            FILTER BAR
        ====================================================== */}

        <div
          className={`
            theme-card
            rounded-xl
            ${themeNeutralBorder}
            border
            p-4
            ${themeCardShadow}
          `}
        >
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">

            {/* SEMESTER */}

            <div className="relative flex-1 min-w-[160px]">
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className={`
                  w-full appearance-none
                  pl-3 pr-9 py-2.5
                  text-sm font-medium
                  theme-text-secondary
                  ${themeNeutralSurface}
                  ${themeNeutralBorder}
                  border
                  rounded-lg
                  hover:border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]
                  focus:outline-none
                  ${themeFocus}
                  transition-colors
                  cursor-pointer
                `}
              >
                {SEMESTER_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={14}
                className="
                  absolute right-3 top-1/2
                  -translate-y-1/2
                  text-[var(--color-text-muted)]
                  pointer-events-none
                "
              />
            </div>

            {/* UNIT */}

            <div className="relative flex-1 min-w-[180px]">
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className={`
                  w-full appearance-none
                  pl-3 pr-9 py-2.5
                  text-sm font-medium
                  theme-text-secondary
                  ${themeNeutralSurface}
                  ${themeNeutralBorder}
                  border
                  rounded-lg
                  hover:border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]
                  focus:outline-none
                  ${themeFocus}
                  transition-colors
                  cursor-pointer
                `}
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={14}
                className="
                  absolute right-3 top-1/2
                  -translate-y-1/2
                  text-[var(--color-text-muted)]
                  pointer-events-none
                "
              />
            </div>

            {/* SEARCH */}

            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={15}
                className="
                  absolute left-3 top-1/2
                  -translate-y-1/2
                  text-[var(--color-text-muted)]
                "
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama guru atau mapel..."
                className={`
                  w-full
                  pl-9 pr-3 py-2.5
                  text-sm
                  theme-text-secondary
                  placeholder:text-[var(--color-text-placeholder)]
                  ${themeNeutralSurface}
                  ${themeNeutralBorder}
                  border
                  rounded-lg
                  focus:outline-none
                  ${themeFocus}
                  transition-colors
                `}
              />
            </div>
          </div>
        </div>

        {/* ======================================================
            SUMMARY CARDS
        ====================================================== */}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

          {/* TOTAL GURU */}

          <div
            className={`
              theme-card
              rounded-xl
              ${themeNeutralBorder}
              border
              p-3.5
              ${themeCardShadow}
              flex items-center gap-3
              min-w-0
            `}
          >
            <div
              className={`
                p-2 rounded-lg
                ${themePrimarySoft}
                text-[var(--color-primary)]
                ${themePrimarySoftBorder}
                border
                flex-shrink-0
              `}
            >
              <Users size={16} />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wider truncate">
                Total Guru
              </p>

              <p className="text-lg font-bold theme-text">
                {summary.totalGuru}
              </p>
            </div>
          </div>

          {/* GURU AKTIF */}

          <div
            className={`
              theme-card
              rounded-xl
              ${themeNeutralBorder}
              border
              p-3.5
              ${themeCardShadow}
              flex items-center gap-3
              min-w-0
            `}
          >
            <div
              className={`
                p-2 rounded-lg
                ${themeSuccessSurface}
                text-[var(--color-success)]
                ${themeSuccessBorder}
                border
                flex-shrink-0
              `}
            >
              <UserCheck size={16} />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wider truncate">
                Guru Aktif
              </p>

              <p className="text-lg font-bold theme-text">
                {summary.guruAktif}
              </p>
            </div>
          </div>

          {/* UNIT SEKOLAH */}

          <div
            className={`
              theme-card
              rounded-xl
              ${themeNeutralBorder}
              border
              p-3.5
              ${themeCardShadow}
              flex items-center gap-3
              min-w-0
            `}
          >
            <div
              className={`
                p-2 rounded-lg
                ${themeInfoSurface}
                text-[var(--color-info)]
                ${themeInfoBorder}
                border
                flex-shrink-0
              `}
            >
              <Building2 size={16} />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wider truncate">
                Unit Sekolah
              </p>

              <p className="text-lg font-bold theme-text">
                {summary.totalUnit}
              </p>
            </div>
          </div>

          {/* KELAS DIAMPU */}

          <div
            className={`
              theme-card
              rounded-xl
              ${themeNeutralBorder}
              border
              p-3.5
              ${themeCardShadow}
              flex items-center gap-3
              min-w-0
            `}
          >
            <div
              className={`
                p-2 rounded-lg
                ${themeWarningSurface}
                text-[var(--color-warning)]
                ${themeWarningBorder}
                border
                flex-shrink-0
              `}
            >
              <BookOpen size={16} />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wider truncate">
                Total Kelas Diampu
              </p>

              <p className="text-lg font-bold theme-text">
                {summary.totalKelasDiampu}
              </p>
            </div>
          </div>
        </div>

        {/* ======================================================
            TABLE
        ====================================================== */}

        <div
          className={`
            theme-card
            rounded-xl
            ${themeNeutralBorder}
            border
            ${themeCardShadow}
            overflow-hidden
          `}
        >
          {/* TABLE HEADER */}

          <div
            className={`
              p-4 sm:p-5
              ${themeDivider}
              border-b
              flex items-center justify-between
              gap-2
            `}
          >
            <h3 className="text-sm font-semibold theme-text-secondary truncate">
              Daftar Guru · {semester}
            </h3>

            <span className="text-xs theme-text-muted flex-shrink-0">
              {filteredGuru.length} guru
            </span>
          </div>

          {/* TABLE */}

          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[760px] text-sm border-collapse">

              <thead>
                <tr
                  className={`
                    ${themeNeutralSurface}
                  `}
                >
                  <th
                    className={`
                      border ${themeNeutralBorder}
                      text-left
                      font-medium
                      theme-text-muted
                      text-xs
                      uppercase
                      tracking-wider
                      px-4 sm:px-5 py-3
                      whitespace-nowrap
                    `}
                  >
                    Nama Guru
                  </th>

                  <th
                    className={`
                      border ${themeNeutralBorder}
                      text-center
                      font-medium
                      theme-text-muted
                      text-xs
                      uppercase
                      tracking-wider
                      px-3 py-3
                      whitespace-nowrap
                    `}
                  >
                    Mapel
                  </th>

                  <th
                    className={`
                      border ${themeNeutralBorder}
                      text-left
                      font-medium
                      theme-text-muted
                      text-xs
                      uppercase
                      tracking-wider
                      px-3 py-3
                      whitespace-nowrap
                    `}
                  >
                    Mengajar di
                  </th>

                  <th
                    className={`
                      border ${themeNeutralBorder}
                      text-center
                      font-medium
                      theme-text-muted
                      text-xs
                      uppercase
                      tracking-wider
                      px-3 py-3
                      whitespace-nowrap
                    `}
                  >
                    Kelas Diampu
                  </th>

                  <th
                    className={`
                      border ${themeNeutralBorder}
                      text-center
                      font-medium
                      theme-text-muted
                      text-xs
                      uppercase
                      tracking-wider
                      px-3 py-3
                      whitespace-nowrap
                    `}
                  >
                    Berlaku Sejak
                  </th>

                  <th
                    className={`
                      border ${themeNeutralBorder}
                      text-center
                      font-medium
                      theme-text-muted
                      text-xs
                      uppercase
                      tracking-wider
                      px-3 py-3
                      whitespace-nowrap
                    `}
                  >
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {/* EMPTY */}

                {filteredGuru.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className={`
                        border ${themeNeutralBorder}
                        p-10
                        text-center
                      `}
                    >
                      <Users
                        size={28}
                        className="
                          mx-auto
                          text-[var(--color-text-placeholder)]
                          mb-2
                        "
                      />

                      <p className="text-sm theme-text-muted">
                        Tidak ada guru yang cocok.
                      </p>
                    </td>
                  </tr>
                )}

                {/* DATA */}

                {filteredGuru.map((g) => {
                  const status =
                    statusTheme[g.status] || statusTheme.Nonaktif;

                  return (
                    <tr
                      key={g.id}
                      className={`
                        border-b
                        ${themeDivider}
                        hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)]
                        transition-colors
                      `}
                    >
                      {/* NAMA */}

                      <td
                        className={`
                          border-r ${themeNeutralBorder}
                          px-4 sm:px-5 py-3
                          whitespace-nowrap
                        `}
                      >
                        <span className="text-sm font-medium theme-text">
                          {g.nama}
                        </span>
                      </td>

                      {/* MAPEL */}

                      <td
                        className={`
                          border-r ${themeNeutralBorder}
                          px-3 py-3
                          text-center
                          whitespace-nowrap
                        `}
                      >
                        <span
                          className={`
                            text-[11px]
                            font-medium
                            px-2 py-0.5
                            rounded-full
                            border
                            ${themeNeutralSurface}
                            theme-text-secondary
                            ${themeNeutralBorder}
                          `}
                        >
                          {g.mapel}
                        </span>
                      </td>

                      {/* UNIT */}

                      <td
                        className={`
                          border-r ${themeNeutralBorder}
                          px-3 py-3
                          theme-text-secondary
                          whitespace-nowrap
                        `}
                      >
                        <div className="flex items-center gap-1.5">
                          <Building2
                            size={13}
                            className="
                              text-[var(--color-text-muted)]
                              flex-shrink-0
                            "
                          />

                          {g.unit}
                        </div>
                      </td>

                      {/* KELAS */}

                      <td
                        className={`
                          border-r ${themeNeutralBorder}
                          px-3 py-3
                          text-center
                          theme-text-secondary
                          whitespace-nowrap
                        `}
                      >
                        {g.kelasDiampu} kelas
                      </td>

                      {/* BERLAKU SEJAK */}

                      <td
                        className={`
                          border-r ${themeNeutralBorder}
                          px-3 py-3
                          text-center
                          theme-text-secondary
                          whitespace-nowrap
                        `}
                      >
                        {g.berlakuSejak}
                      </td>

                      {/* STATUS */}

                      <td
                        className={`
                          px-3 py-3
                          text-center
                          whitespace-nowrap
                        `}
                      >
                        <span
                          className={`
                            text-[11px]
                            font-medium
                            px-2 py-0.5
                            rounded-full
                            border
                            ${status.surface}
                            ${status.text}
                            ${status.border}
                          `}
                        >
                          {g.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}