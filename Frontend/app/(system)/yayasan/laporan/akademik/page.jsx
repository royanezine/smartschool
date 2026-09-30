"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

import {
  BookOpen,
  Search,
  ChevronDown,
  ChevronLeft,
  Sparkles,
  Download,
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle2,
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

// ============================================================
// DUMMY DATA
// ============================================================

const SEMESTER_OPTIONS = [
  "Ganjil 2025/2026",
  "Genap 2024/2025",
  "Ganjil 2024/2025",
];

const JENJANG_OPTIONS = [
  "Semua Jenjang",
  "SD",
  "SMP",
  "SMA",
];

const KKM = 75;

const unitAkademik = [
  {
    id: 1,
    nama: "SD Smart School 1",
    jenjang: "SD",
    siswa: 612,
    rataNilai: 82.4,
    kehadiran: 97,
    tuntas: 588,
  },
  {
    id: 2,
    nama: "SD Smart School 2",
    jenjang: "SD",
    siswa: 548,
    rataNilai: 78.1,
    kehadiran: 95,
    tuntas: 501,
  },
  {
    id: 3,
    nama: "SMP Smart School 1",
    jenjang: "SMP",
    siswa: 734,
    rataNilai: 80.6,
    kehadiran: 96,
    tuntas: 690,
  },
  {
    id: 4,
    nama: "SMP Smart School 2",
    jenjang: "SMP",
    siswa: 689,
    rataNilai: 74.9,
    kehadiran: 94,
    tuntas: 601,
  },
  {
    id: 5,
    nama: "SMA Smart School 1",
    jenjang: "SMA",
    siswa: 812,
    rataNilai: 85.2,
    kehadiran: 98,
    tuntas: 779,
  },
  {
    id: 6,
    nama: "SMA Smart School 2",
    jenjang: "SMA",
    siswa: 917,
    rataNilai: 81.7,
    kehadiran: 96,
    tuntas: 862,
  },
];

// ============================================================
// HELPERS
// ============================================================

const round1 = (n) => Math.round(n * 10) / 10;

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function LaporanAkademikPage() {
  const router = useRouter();

  const [semester, setSemester] = useState(
    SEMESTER_OPTIONS[0]
  );

  const [jenjang, setJenjang] = useState(
    JENJANG_OPTIONS[0]
  );

  const [search, setSearch] = useState("");

  // ============================================================
  // FILTER
  // ============================================================

  const filteredUnits = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return unitAkademik.filter((unit) => {
      const matchJenjang =
        jenjang === "Semua Jenjang" ||
        unit.jenjang === jenjang;

      const matchSearch =
        !keyword ||
        unit.nama.toLowerCase().includes(keyword);

      return matchJenjang && matchSearch;
    });
  }, [jenjang, search]);

  // ============================================================
  // SUMMARY
  // ============================================================

  const summary = useMemo(() => {
    if (filteredUnits.length === 0) {
      return {
        rataNilai: null,
        rataKehadiran: null,
        totalSiswa: 0,
        totalTuntas: 0,
      };
    }

    const totalSiswa = filteredUnits.reduce(
      (total, unit) => total + unit.siswa,
      0
    );

    const totalTuntas = filteredUnits.reduce(
      (total, unit) => total + unit.tuntas,
      0
    );

    const rataNilai = round1(
      filteredUnits.reduce(
        (total, unit) => total + unit.rataNilai,
        0
      ) / filteredUnits.length
    );

    const rataKehadiran = round1(
      filteredUnits.reduce(
        (total, unit) => total + unit.kehadiran,
        0
      ) / filteredUnits.length
    );

    return {
      rataNilai,
      rataKehadiran,
      totalSiswa,
      totalTuntas,
    };
  }, [filteredUnits]);

  // ============================================================
  // DOWNLOAD
  // ============================================================

  const handleDownload = () => {
    const header = [
      "Unit Sekolah",
      "Jenjang",
      "Siswa",
      "Rata Nilai",
      "Kehadiran",
      "Tuntas KKM",
      "Persentase Tuntas",
    ];

    const rows = filteredUnits.map((unit) => {
      const persenTuntas = round1(
        (unit.tuntas / unit.siswa) * 100
      );

      return [
        unit.nama,
        unit.jenjang,
        unit.siswa,
        unit.rataNilai,
        `${unit.kehadiran}%`,
        unit.tuntas,
        `${persenTuntas}%`,
      ];
    });

    const csv = [
      header,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      ["\ufeff" + csv],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `laporan-akademik-${semester
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
      <div className="w-full max-w-[1800px] mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="space-y-6">

          {/* ==================================================
              PAGE HEADER
          ================================================== */}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">

              {/* BACK */}
              <button
                type="button"
                onClick={() =>
                  router.push("/yayasan/laporan")
                }
                className={`inline-flex items-center gap-1 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors mb-1`}
              >
                <ChevronLeft size={13} />
                Laporan & Analitik
              </button>

              {/* TITLE */}
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-lg ${themePrimaryGradient} text-[var(--color-card)] ${themeSmallShadow} flex-shrink-0`}
                >
                  <BookOpen size={18} />
                </div>

                <h1 className="text-xl sm:text-2xl font-semibold theme-text truncate">
                  Laporan Akademik
                </h1>
              </div>

              {/* DESCRIPTION */}
              <p className="theme-text-secondary text-sm mt-1 ml-[42px] flex items-center gap-1.5">
                <Sparkles
                  size={14}
                  className="text-[var(--color-text-muted)] flex-shrink-0"
                />

                <span className="truncate">
                  Rekap nilai dan kehadiran akademik per unit sekolah.
                </span>
              </p>
            </div>

            {/* DOWNLOAD */}
            <button
              type="button"
              onClick={handleDownload}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[var(--color-card)] bg-[var(--color-primary)] ${themePrimaryHover} rounded-lg transition-colors ${themeSmallShadow} whitespace-nowrap flex-shrink-0`}
            >
              <Download size={16} />
              Unduh Laporan
            </button>
          </div>

          {/* ==================================================
              FILTER BAR
          ================================================== */}

          <div
            className={`theme-card rounded-xl border theme-border p-4 ${themeCardShadow}`}
          >
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">

              {/* SEMESTER */}
              <div className="relative flex-1 min-w-[160px]">
                <select
                  value={semester}
                  onChange={(event) =>
                    setSemester(event.target.value)
                  }
                  className={`w-full appearance-none pl-3 pr-9 py-2.5 text-sm font-medium theme-text-secondary ${themeNeutralSurface} border theme-border rounded-lg ${themeNeutralHover} focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)] transition-colors cursor-pointer`}
                >
                  {SEMESTER_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
                />
              </div>

              {/* JENJANG */}
              <div className="relative flex-1 min-w-[140px]">
                <select
                  value={jenjang}
                  onChange={(event) =>
                    setJenjang(event.target.value)
                  }
                  className={`w-full appearance-none pl-3 pr-9 py-2.5 text-sm font-medium theme-text-secondary ${themeNeutralSurface} border theme-border rounded-lg ${themeNeutralHover} focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)] transition-colors cursor-pointer`}
                >
                  {JENJANG_OPTIONS.map((option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
                />
              </div>

              {/* SEARCH */}
              <div className="relative flex-1 min-w-[200px]">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Cari nama unit sekolah..."
                  className={`w-full pl-9 pr-3 py-2.5 text-sm theme-text-secondary ${themeNeutralSurface} border theme-border rounded-lg focus:outline-none focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)] transition-colors placeholder:text-[var(--color-text-placeholder)]`}
                />
              </div>
            </div>
          </div>

          {/* ==================================================
              SUMMARY CARDS
          ================================================== */}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

            {/* RATA NILAI */}
            <div
              className={`theme-card rounded-xl border theme-border p-3.5 ${themeSmallShadow} flex items-center gap-3 min-w-0`}
            >
              <div
                className={`p-2 rounded-lg border ${themePrimarySoft} ${themePrimaryText} ${themePrimarySoftBorder} flex-shrink-0`}
              >
                <BarChart3 size={16} />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider truncate">
                  Rata Nilai
                </p>

                <p className="text-lg font-bold theme-text">
                  {summary.rataNilai ?? "—"}
                </p>
              </div>
            </div>

            {/* RATA KEHADIRAN */}
            <div
              className={`theme-card rounded-xl border theme-border p-3.5 ${themeSmallShadow} flex items-center gap-3 min-w-0`}
            >
              <div
                className={`p-2 rounded-lg border ${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder} flex-shrink-0`}
              >
                <TrendingUp size={16} />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider truncate">
                  Rata Kehadiran
                </p>

                <p className="text-lg font-bold theme-text">
                  {summary.rataKehadiran ?? "—"}%
                </p>
              </div>
            </div>

            {/* TOTAL SISWA */}
            <div
              className={`theme-card rounded-xl border theme-border p-3.5 ${themeSmallShadow} flex items-center gap-3 min-w-0`}
            >
              <div
                className={`p-2 rounded-lg border ${themeInfoSurface} text-[var(--color-info)] ${themeInfoBorder} flex-shrink-0`}
              >
                <Users size={16} />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider truncate">
                  Total Siswa
                </p>

                <p className="text-lg font-bold theme-text">
                  {summary.totalSiswa.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            {/* TUNTAS */}
            <div
              className={`theme-card rounded-xl border theme-border p-3.5 ${themeSmallShadow} flex items-center gap-3 min-w-0`}
            >
              <div
                className={`p-2 rounded-lg border ${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder} flex-shrink-0`}
              >
                <CheckCircle2 size={16} />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider truncate">
                  Tuntas (KKM {KKM})
                </p>

                <p className="text-lg font-bold theme-text">
                  {summary.totalTuntas.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>

          {/* ==================================================
              TABLE
          ================================================== */}

          <div
            className={`theme-card rounded-xl border theme-border ${themeCardShadow} overflow-hidden`}
          >

            {/* TABLE HEADER */}
            <div
              className={`p-4 sm:p-5 border-b ${themeDivider} flex items-center justify-between gap-2`}
            >
              <h3 className="text-sm font-semibold theme-text truncate">
                Rekap per Unit Sekolah · {semester}
              </h3>

              <span className="text-xs text-[var(--color-text-muted)] flex-shrink-0">
                {filteredUnits.length} unit
              </span>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[720px] text-sm border-collapse">

                {/* THEAD */}
                <thead>
                  <tr
                    className={themeNeutralSurface}
                  >
                    <th
                      className={`border theme-border text-left font-medium text-[var(--color-text-muted)] text-xs uppercase tracking-wider px-4 sm:px-5 py-3 whitespace-nowrap`}
                    >
                      Unit Sekolah
                    </th>

                    <th
                      className={`border theme-border text-center font-medium text-[var(--color-text-muted)] text-xs uppercase tracking-wider px-3 py-3 whitespace-nowrap`}
                    >
                      Jenjang
                    </th>

                    <th
                      className={`border theme-border text-center font-medium text-[var(--color-text-muted)] text-xs uppercase tracking-wider px-3 py-3 whitespace-nowrap`}
                    >
                      Siswa
                    </th>

                    <th
                      className={`border theme-border text-center font-medium text-[var(--color-text-muted)] text-xs uppercase tracking-wider px-3 py-3 whitespace-nowrap`}
                    >
                      Rata Nilai
                    </th>

                    <th
                      className={`border theme-border text-center font-medium text-[var(--color-text-muted)] text-xs uppercase tracking-wider px-3 py-3 whitespace-nowrap`}
                    >
                      Kehadiran
                    </th>

                    <th
                      className={`border theme-border text-center font-medium text-[var(--color-text-muted)] text-xs uppercase tracking-wider px-3 py-3 whitespace-nowrap`}
                    >
                      Tuntas KKM
                    </th>
                  </tr>
                </thead>

                {/* TBODY */}
                <tbody>
                  {/* EMPTY */}
                  {filteredUnits.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="border theme-border p-10 text-center"
                      >
                        <Users
                          size={28}
                          className="mx-auto text-[var(--color-text-placeholder)] mb-2"
                        />

                        <p className="text-sm text-[var(--color-text-muted)]">
                          Tidak ada unit sekolah yang cocok.
                        </p>
                      </td>
                    </tr>
                  )}

                  {/* DATA */}
                  {filteredUnits.map((unit) => {
                    const persenTuntas = round1(
                      (unit.tuntas / unit.siswa) * 100
                    );

                    const tuntasStyle =
                      persenTuntas >= 80
                        ? `${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`
                        : `${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder}`;

                    return (
                      <tr
                        key={unit.id}
                        className={`${themeNeutralHover} transition-colors`}
                      >
                        {/* UNIT */}
                        <td className="border theme-border px-4 sm:px-5 py-3 whitespace-nowrap">
                          <span className="text-sm font-medium theme-text">
                            {unit.nama}
                          </span>
                        </td>

                        {/* JENJANG */}
                        <td className="border theme-border px-3 py-3 text-center whitespace-nowrap">
                          <span
                            className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${themeNeutralSurface} text-[var(--color-text-muted)] ${themeNeutralBorder}`}
                          >
                            {unit.jenjang}
                          </span>
                        </td>

                        {/* SISWA */}
                        <td className="border theme-border px-3 py-3 text-center theme-text-secondary whitespace-nowrap">
                          {unit.siswa.toLocaleString("id-ID")}
                        </td>

                        {/* RATA NILAI */}
                        <td className="border theme-border px-3 py-3 text-center whitespace-nowrap">
                          <span className="text-sm font-semibold theme-text">
                            {unit.rataNilai}
                          </span>
                        </td>

                        {/* KEHADIRAN */}
                        <td className="border theme-border px-3 py-3 text-center theme-text-secondary whitespace-nowrap">
                          {unit.kehadiran}%
                        </td>

                        {/* TUNTAS */}
                        <td className="border theme-border px-3 py-3 text-center whitespace-nowrap">
                          <span
                            className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${tuntasStyle}`}
                          >
                            {unit.tuntas}/{unit.siswa} ({persenTuntas}%)
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
    </div>
  );
}