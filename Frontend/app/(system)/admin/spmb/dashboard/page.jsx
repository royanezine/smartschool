"use client";

import { useState, useMemo } from "react";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  Info,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Send,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  GraduationCap,
} from "lucide-react";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// =========================================================
// THEME HELPERS
// =========================================================

const themePrimary =
  "var(--color-primary)";

const themeInfo =
  "var(--color-info)";

const themeSuccess =
  "var(--color-success)";

const themeWarning =
  "var(--color-warning)";

const themeCard =
  "var(--color-card)";

const themeText =
  "var(--color-text)";

const themeMuted =
  "var(--color-text-muted)";

const themePlaceholder =
  "var(--color-text-placeholder)";

const themeBorder =
  "var(--color-border)";

const themeBorderSoft =
  "var(--color-border-soft)";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themeInfoSoft =
  "bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)]";

const themeInfoSoftBorder =
  "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";

const themeSuccessSoft =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessSoftBorder =
  "border-[color-mix(in_srgb,var(--color-success)_22%,transparent)]";

const themeWarningSoft =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningSoftBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_22%,transparent)]";

const themeNeutralSoft =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

// =========================================================
// DUMMY DATA
// =========================================================

const verifikasiHarian = [
  { j: "06", a: 4, b: 2 },
  { j: "08", a: 12, b: 6 },
  { j: "10", a: 18, b: 14 },
  { j: "12", a: 14, b: 10 },
  { j: "14", a: 20, b: 16 },
  { j: "16", a: 16, b: 12 },
  { j: "18", a: 8, b: 4 },
  { j: "20", a: 4, b: 2 },
];

const kelulusanMingguan = [
  { h: "Sen", v: 40 },
  { h: "Sel", v: 62 },
  { h: "Rab", v: 98 },
  { h: "Kam", v: 54 },
  { h: "Jum", v: 86 },
];

const pendaftarHarian = [
  { label: "Sen", jumlah: 62 },
  { label: "Sel", jumlah: 78 },
  { label: "Rab", jumlah: 140 },
  { label: "Kam", jumlah: 96 },
  { label: "Jum", jumlah: 120 },
  { label: "Sab", jumlah: 54 },
  { label: "Min", jumlah: 30 },
];

const pendaftarMingguan = [
  { label: "M1", jumlah: 210 },
  { label: "M2", jumlah: 340 },
  { label: "M3", jumlah: 280 },
  { label: "M4", jumlah: 418 },
];

const rankingJurusan = [
  {
    key: "rpl",
    nama: "RPL",
    jumlah: 412,
    color: "var(--color-primary)",
  },
  {
    key: "tkj",
    nama: "TKJ",
    jumlah: 356,
    color: "var(--color-info)",
  },
  {
    key: "multimedia",
    nama: "Multimedia",
    jumlah: 298,
    color: "var(--color-success)",
  },
  {
    key: "akuntansi",
    nama: "Akuntansi",
    jumlah: 182,
    color: "var(--color-warning)",
  },
];

const gelombangTahunan = [
  { tahun: "2023", gel1: 320, gel2: 240 },
  { tahun: "2024", gel1: 280, gel2: 340 },
  { tahun: "2025", gel1: 460, gel2: 402 },
  { tahun: "2026", gel1: 520, gel2: 486 },
];

const aktivitasTerbaru = [
  {
    waktu: "10:32",
    nama: "Andi Saputra",
    aksi: "mengirim pendaftaran",
    tipe: "daftar",
  },
  {
    waktu: "10:15",
    nama: "Budi Hartono",
    aksi: "telah diverifikasi",
    tipe: "verifikasi",
  },
  {
    waktu: "09:48",
    nama: "Citra Ayu",
    aksi: "dinyatakan lulus",
    tipe: "lulus",
  },
  {
    waktu: "09:30",
    nama: "Deni Firmansyah",
    aksi: "melakukan daftar ulang",
    tipe: "daftarulang",
  },
  {
    waktu: "09:12",
    nama: "Eka Putri",
    aksi: "dinyatakan tidak lulus",
    tipe: "tidaklulus",
  },
  {
    waktu: "08:55",
    nama: "Fajar Nugroho",
    aksi: "mengirim pendaftaran",
    tipe: "daftar",
  },
  {
    waktu: "08:40",
    nama: "Gita Lestari",
    aksi: "telah diverifikasi",
    tipe: "verifikasi",
  },
];

// =========================================================
// ACTIVITY STYLE
// =========================================================

const ACTIVITY_STYLES = {
  daftar: {
    icon: Send,
    tone: "text-[var(--color-primary)]",
    bg: themePrimarySoft,
  },

  verifikasi: {
    icon: ShieldCheck,
    tone: "text-[var(--color-warning)]",
    bg: themeWarningSoft,
  },

  lulus: {
    icon: CheckCircle2,
    tone: "text-[var(--color-success)]",
    bg: themeSuccessSoft,
  },

  tidaklulus: {
    icon: XCircle,
    tone: "theme-text",
    bg: themeNeutralSoft,
  },

  daftarulang: {
    icon: GraduationCap,
    tone: "text-[var(--color-info)]",
    bg: themeInfoSoft,
  },
};

const TIME_FILTERS = [
  "Harian",
  "Mingguan",
];

// =========================================================
// CHART TOOLTIP
// =========================================================

function ChartTooltip({
  active,
  payload,
  label,
  unit = "",
}) {
  if (
    !active ||
    !payload ||
    !payload.length
  ) {
    return null;
  }

  return (
    <div
      className={`rounded-lg border ${themeBorderSoft} ${themeCardShadow} px-3 py-2`}
      style={{
        backgroundColor: themeCard,
        color: themeText,
      }}
    >
      <p
        className="mb-0.5 text-[11px]"
        style={{
          color: themeMuted,
        }}
      >
        {label}
      </p>

      {payload.map((p) => (
        <p
          key={p.dataKey}
          className="font-mono text-[11px] font-semibold"
          style={{
            color: themeText,
          }}
        >
          {p.value} {unit}
        </p>
      ))}
    </div>
  );
}

// =========================================================
// PAGE
// =========================================================

export default function AdminPPDBDashboardPage() {
  const [isCollapsed, setIsCollapsed] =
    useState(false);

  const [activeFilter, setActiveFilter] =
    useState("Harian");

  const toggleSidebar = () =>
    setIsCollapsed((prev) => !prev);

  const trendData =
    activeFilter === "Harian"
      ? pendaftarHarian
      : pendaftarMingguan;

  const tingkatKelulusan = useMemo(
    () =>
      Math.round(
        (640 / (640 + 172)) * 100
      ),
    []
  );

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar
        role="adminPPDB"
        active="dashboard"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">

        {/* ===================================================
            HEADER
        =================================================== */}

        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: "Admin PPDB",
            email:
              "adminppdb@smartschool.com",
            avatar: "PP",
          }}
        />

        {/* ===================================================
            MAIN
        =================================================== */}

        <main className="flex-1 overflow-y-auto">

          <div className="w-full p-4 md:p-6 lg:p-8">

            <div className="mx-auto w-full max-w-[1320px] space-y-5">

              {/* =================================================
                  BREADCRUMB
              ================================================= */}

              <div
                className="flex items-center gap-1.5 text-xs"
                style={{
                  color: themeMuted,
                }}
              >
                <span>PPDB</span>

                <ChevronRight size={12} />

                <span
                  className="font-medium"
                  style={{
                    color: themeText,
                  }}
                >
                  Dashboard
                </span>
              </div>

              {/* =================================================
                  SUMMARY ROW 1
              ================================================= */}

              <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">

                {/* TOTAL PENDAFTAR */}

                <div
                  className={`theme-card rounded-xl p-5 ${themeCardShadow}`}
                >
                  <div className="flex items-center justify-between">

                    <p className="theme-text-muted text-xs">
                      Total Pendaftar
                    </p>

                    <Info
                      size={13}
                      className="theme-text-placeholder"
                    />

                  </div>

                  <p className="theme-text mt-2 text-2xl font-bold">
                    1.248
                  </p>

                  <div className="mt-3 space-y-1.5">

                    <p className="theme-text-muted flex items-center gap-1.5 text-xs">

                      Rasio minggu ini

                      <span className="theme-text font-semibold">
                        13%
                      </span>

                      <TrendingUp
                        size={12}
                        className="text-[var(--color-warning)]"
                      />

                    </p>

                    <p className="theme-text-muted flex items-center gap-1.5 text-xs">

                      Rasio hari ini

                      <span className="theme-text font-semibold">
                        10%
                      </span>

                      <TrendingDown
                        size={12}
                        className="text-[var(--color-success)]"
                      />

                    </p>

                  </div>

                  <div
                    className="mt-4 border-t pt-3"
                    style={{
                      borderColor:
                        themeBorderSoft,
                    }}
                  >
                    <p className="theme-text-muted text-center text-xs">
                      Pendaftar hari ini{" "}
                      <span className="theme-text font-semibold">
                        86
                      </span>
                    </p>
                  </div>
                </div>

                {/* MENUNGGU VERIFIKASI */}

                <div
                  className={`theme-card rounded-xl p-5 ${themeCardShadow}`}
                >
                  <div className="flex items-center justify-between">

                    <p className="theme-text-muted text-xs">
                      Menunggu Verifikasi
                    </p>

                    <Info
                      size={13}
                      className="theme-text-placeholder"
                    />

                  </div>

                  <p className="theme-text mt-2 text-2xl font-bold">
                    186
                  </p>

                  <div className="-mx-1 mt-2 h-14">

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <AreaChart
                        data={verifikasiHarian}
                      >
                        <defs>

                          <linearGradient
                            id="fillA"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor={themeWarning}
                              stopOpacity={0.5}
                            />

                            <stop
                              offset="100%"
                              stopColor={themeWarning}
                              stopOpacity={0}
                            />
                          </linearGradient>

                          <linearGradient
                            id="fillB"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor={themeSuccess}
                              stopOpacity={0.5}
                            />

                            <stop
                              offset="100%"
                              stopColor={themeSuccess}
                              stopOpacity={0}
                            />
                          </linearGradient>

                        </defs>

                        <Area
                          type="monotone"
                          dataKey="a"
                          stroke={themeWarning}
                          strokeWidth={1.5}
                          fill="url(#fillA)"
                        />

                        <Area
                          type="monotone"
                          dataKey="b"
                          stroke={themeSuccess}
                          strokeWidth={1.5}
                          fill="url(#fillB)"
                        />

                      </AreaChart>
                    </ResponsiveContainer>

                  </div>

                  <div
                    className="mt-3 border-t pt-3"
                    style={{
                      borderColor:
                        themeBorderSoft,
                    }}
                  >
                    <p className="theme-text-muted text-center text-xs">
                      Masuk hari ini{" "}
                      <span className="theme-text font-semibold">
                        24
                      </span>
                    </p>
                  </div>
                </div>

                {/* BERKAS TERVERIFIKASI */}

                <div
                  className={`theme-card rounded-xl p-5 ${themeCardShadow}`}
                >
                  <div className="flex items-center justify-between">

                    <p className="theme-text-muted text-xs">
                      Berkas Terverifikasi
                    </p>

                    <Info
                      size={13}
                      className="theme-text-placeholder"
                    />

                  </div>

                  <p className="theme-text mt-2 text-2xl font-bold">
                    812
                  </p>

                  <div className="mt-2 h-14">

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <BarChart
                        data={
                          kelulusanMingguan
                        }
                      >
                        <Bar
                          dataKey="v"
                          radius={[
                            2,
                            2,
                            0,
                            0,
                          ]}
                          fill={themePrimary}
                          barSize={12}
                        />
                      </BarChart>
                    </ResponsiveContainer>

                  </div>

                  <div
                    className="mt-3 border-t pt-3"
                    style={{
                      borderColor:
                        themeBorderSoft,
                    }}
                  >
                    <p className="theme-text-muted text-center text-xs">
                      Tingkat verifikasi{" "}
                      <span className="theme-text font-semibold">
                        65%
                      </span>
                    </p>
                  </div>
                </div>

                {/* TINGKAT KELULUSAN */}

                <div
                  className={`theme-card-soft flex flex-col items-center justify-center rounded-xl p-5 text-center ${themeCardShadow}`}
                >
                  <p className="theme-text-muted text-xs">
                    Tingkat Kelulusan
                  </p>

                  <p className="theme-text mt-3 text-3xl font-bold">
                    {tingkatKelulusan}%
                  </p>
                </div>

              </section>

              {/* =================================================
                  SUMMARY ROW 2
              ================================================= */}

              <section className="grid grid-cols-1 gap-4 md:grid-cols-3">

                {/* LULUS */}

                <div
                  className={`theme-card flex items-center gap-4 rounded-xl p-5 ${themeCardShadow}`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${themeSuccessSoft}`}
                  >
                    <CheckCircle2
                      size={18}
                      className="text-[var(--color-success)]"
                    />
                  </div>

                  <div>
                    <p className="theme-text-muted text-xs">
                      Lulus Seleksi
                    </p>

                    <p className="theme-text mt-1 text-xl font-bold">
                      640
                    </p>
                  </div>
                </div>

                {/* TIDAK LULUS */}

                <div
                  className={`theme-card flex items-center gap-4 rounded-xl p-5 ${themeCardShadow}`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${themeNeutralSoft}`}
                  >
                    <XCircle
                      size={18}
                      className="theme-text"
                    />
                  </div>

                  <div>
                    <p className="theme-text-muted text-xs">
                      Tidak Lulus
                    </p>

                    <p className="theme-text mt-1 text-xl font-bold">
                      172
                    </p>
                  </div>
                </div>

                {/* DAFTAR ULANG */}

                <div
                  className={`theme-card flex items-center gap-4 rounded-xl p-5 ${themeCardShadow}`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${themeInfoSoft}`}
                  >
                    <GraduationCap
                      size={18}
                      className="text-[var(--color-info)]"
                    />
                  </div>

                  <div>
                    <p className="theme-text-muted text-xs">
                      Sudah Daftar Ulang
                    </p>

                    <p className="theme-text mt-1 text-xl font-bold">
                      512
                    </p>
                  </div>
                </div>

              </section>

              {/* =================================================
                  PANEL GRAFIK PENDAFTAR
              ================================================= */}

              <section
                className={`theme-card overflow-hidden rounded-xl ${themeCardShadow}`}
              >

                <div
                  className="flex flex-wrap items-center justify-between gap-3 border-b px-5 pb-3 pt-4"
                  style={{
                    borderColor:
                      themeBorderSoft,
                  }}
                >

                  <h3 className="theme-text text-sm font-semibold">
                    Grafik Pendaftar
                  </h3>

                  <div className="flex items-center gap-5">

                    {TIME_FILTERS.map(
                      (filter) => (
                        <button
                          key={filter}
                          type="button"
                          onClick={() =>
                            setActiveFilter(
                              filter
                            )
                          }
                          className="text-xs transition-colors"
                          style={{
                            color:
                              activeFilter ===
                              filter
                                ? themePrimary
                                : themeMuted,
                            fontWeight:
                              activeFilter ===
                              filter
                                ? 600
                                : 400,
                          }}
                        >
                          {filter}
                        </button>
                      )
                    )}

                  </div>

                </div>

                <div className="flex flex-col lg:flex-row">

                  {/* CHART */}

                  <div
                    className="flex-1 p-5 lg:border-r"
                    style={{
                      borderColor:
                        themeBorderSoft,
                    }}
                  >

                    <h3 className="theme-text mb-4 text-sm font-semibold">
                      Pendaftar per{" "}
                      {activeFilter ===
                      "Harian"
                        ? "Hari"
                        : "Minggu"}
                    </h3>

                    <div className="h-64">

                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >

                        <AreaChart
                          data={trendData}
                          margin={{
                            top: 8,
                            right: 8,
                            left: 0,
                            bottom: 0,
                          }}
                        >

                          <defs>

                            <linearGradient
                              id="fillTrend"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor={
                                  themePrimary
                                }
                                stopOpacity={
                                  0.35
                                }
                              />

                              <stop
                                offset="100%"
                                stopColor={
                                  themePrimary
                                }
                                stopOpacity={
                                  0
                                }
                              />
                            </linearGradient>

                          </defs>

                          <XAxis
                            dataKey="label"
                            tick={{
                              fontSize: 11,
                              fill: themePlaceholder,
                            }}
                            axisLine={false}
                            tickLine={false}
                          />

                          <Tooltip
                            content={
                              <ChartTooltip
                                unit="pendaftar"
                              />
                            }
                            cursor={{
                              stroke:
                                themeBorder,
                              strokeWidth: 1,
                            }}
                          />

                          <Area
                            type="monotone"
                            dataKey="jumlah"
                            stroke={
                              themePrimary
                            }
                            strokeWidth={2}
                            fill="url(#fillTrend)"
                          />

                        </AreaChart>

                      </ResponsiveContainer>

                    </div>
                  </div>

                  {/* RANKING JURUSAN */}

                  <div className="w-full p-5 lg:w-72">

                    <h3 className="theme-text mb-4 text-sm font-semibold">
                      Pendaftar Berdasarkan
                      Jurusan
                    </h3>

                    <ul className="space-y-3.5">

                      {rankingJurusan.map(
                        (jurusan, index) => (
                          <li
                            key={
                              jurusan.key
                            }
                            className="flex items-center gap-3"
                          >

                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                                index === 0
                                  ? "text-[var(--color-card)]"
                                  : "theme-text-muted"
                              }`}
                              style={
                                index === 0
                                  ? {
                                      backgroundColor:
                                        themeText,
                                    }
                                  : undefined
                              }
                            >
                              {index + 1}
                            </span>

                            <span
                              className="h-2 w-2 shrink-0 rounded-full"
                              style={{
                                backgroundColor:
                                  jurusan.color,
                              }}
                            />

                            <span className="theme-text-secondary flex-1 truncate text-sm">
                              {
                                jurusan.nama
                              }
                            </span>

                            <span className="theme-text font-mono text-sm font-semibold tabular-nums">
                              {jurusan.jumlah.toLocaleString(
                                "id-ID"
                              )}
                            </span>

                          </li>
                        )
                      )}

                    </ul>

                    <p
                      className="theme-text-muted mt-4 border-t pt-3 text-[11px]"
                      style={{
                        borderColor:
                          themeBorderSoft,
                      }}
                    >
                      Diurutkan dari jumlah
                      pendaftar terbanyak
                    </p>

                  </div>

                </div>

              </section>

              {/* =================================================
                  GELOMBANG
              ================================================= */}

              <section
                className={`theme-card rounded-xl p-5 ${themeCardShadow}`}
              >

                <div className="mb-4 flex items-center justify-between">

                  <h3 className="theme-text text-sm font-semibold">
                    Pendaftar Berdasarkan
                    Gelombang
                  </h3>

                </div>

                <div className="h-64">

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <BarChart
                      data={gelombangTahunan}
                      margin={{
                        top: 8,
                        right: 8,
                        left: 0,
                        bottom: 0,
                      }}
                      barGap={4}
                    >

                      <XAxis
                        dataKey="tahun"
                        tick={{
                          fontSize: 11,
                          fill: themePlaceholder,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip
                        content={
                          <ChartTooltip
                            unit="orang"
                          />
                        }
                        cursor={{
                          fill: `color-mix(in srgb, ${themeText} 5%, transparent)`,
                        }}
                      />

                      <Legend
                        verticalAlign="top"
                        align="right"
                        height={24}
                        iconType="circle"
                        iconSize={8}
                        formatter={(value) => (
                          <span className="theme-text-muted text-xs">
                            {value}
                          </span>
                        )}
                      />

                      <Bar
                        dataKey="gel1"
                        name="Gelombang 1"
                        fill={`color-mix(in srgb, ${themePrimary} 25%, ${themeCard})`}
                        radius={[
                          3,
                          3,
                          0,
                          0,
                        ]}
                        barSize={22}
                      />

                      <Bar
                        dataKey="gel2"
                        name="Gelombang 2"
                        fill={themePrimary}
                        radius={[
                          3,
                          3,
                          0,
                          0,
                        ]}
                        barSize={22}
                      />

                    </BarChart>

                  </ResponsiveContainer>

                </div>

              </section>

              {/* =================================================
                  AKTIVITAS TERBARU
              ================================================= */}

              <section
                className={`theme-card rounded-xl p-5 ${themeCardShadow}`}
              >

                <h3 className="theme-text mb-4 text-sm font-semibold">
                  Aktivitas Terbaru
                </h3>

                <ul
                  className="divide-y"
                  style={{
                    borderColor:
                      themeBorderSoft,
                  }}
                >

                  {aktivitasTerbaru.map(
                    (activity, index) => {
                      const style =
                        ACTIVITY_STYLES[
                          activity.tipe
                        ];

                      const Icon =
                        style.icon;

                      return (
                        <li
                          key={index}
                          className="flex items-center gap-3 py-2.5"
                        >

                          <div
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${style.bg}`}
                          >
                            <Icon
                              size={13}
                              className={
                                style.tone
                              }
                            />
                          </div>

                          <p className="theme-text-secondary flex-1 truncate text-sm">

                            <span className="theme-text font-medium">
                              {
                                activity.nama
                              }
                            </span>{" "}

                            {
                              activity.aksi
                            }

                          </p>

                          <span className="theme-text-muted shrink-0 font-mono text-xs">
                            {
                              activity.waktu
                            }
                          </span>

                        </li>
                      );
                    }
                  )}

                </ul>

              </section>

              {/* =================================================
                  FOOTER
              ================================================= */}

              <footer className="theme-text-muted py-3 text-center text-[11px]">
                © 2026 SmartSchool ·
                Dashboard Admin PPDB ·
                All rights reserved
              </footer>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}