"use client";

import { useState } from "react";
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

// =========================================================
// THEME HELPERS
// =========================================================

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

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

// =========================================================
// DUMMY DATA
// =========================================================

const summaryStats = [
  {
    label: "Total Sekolah",
    value: "128",
    change: "+12",
    trend: "up",
  },
  {
    label: "Total Yayasan",
    value: "42",
    change: "+3",
    trend: "up",
  },
  {
    label: "Pengguna Aktif",
    value: "1.198",
    change: "+54",
    trend: "up",
  },
  {
    label: "Total Pendapatan",
    value: "Rp 2,4 M",
    change: "+18%",
    trend: "up",
  },
  {
    label: "Langganan Aktif",
    value: "105",
    change: "-2",
    trend: "down",
  },
  {
    label: "Tingkat Retensi",
    value: "92%",
    change: "+5%",
    trend: "up",
  },
];

const monthlyData = [
  { month: "Jan", sekolah: 42, pendapatan: 180, pengguna: 850 },
  { month: "Feb", sekolah: 48, pendapatan: 210, pengguna: 920 },
  { month: "Mar", sekolah: 55, pendapatan: 250, pengguna: 980 },
  { month: "Apr", sekolah: 62, pendapatan: 290, pengguna: 1050 },
  { month: "May", sekolah: 70, pendapatan: 340, pengguna: 1120 },
  { month: "Jun", sekolah: 78, pendapatan: 390, pengguna: 1180 },
  { month: "Jul", sekolah: 85, pendapatan: 430, pengguna: 1198 },
  { month: "Aug", sekolah: 92, pendapatan: 480, pengguna: 1198 },
];

const reportData = [
  {
    id: 1,
    sekolah: "SMA Negeri 1 Jakarta",
    yayasan: "-",
    paket: "Professional",
    siswa: 720,
    guru: 45,
    pendapatan: 550000,
    status: "Aktif",
  },
  {
    id: 2,
    sekolah: "SMA Al-Azhar",
    yayasan: "Yayasan Al-Azhar",
    paket: "Enterprise",
    siswa: 560,
    guru: 38,
    pendapatan: 1200000,
    status: "Aktif",
  },
  {
    id: 3,
    sekolah: "SMP BPK Penabur",
    yayasan: "Yayasan BPK Penabur",
    paket: "Starter",
    siswa: 380,
    guru: 28,
    pendapatan: 250000,
    status: "Nonaktif",
  },
  {
    id: 4,
    sekolah: "SMA Taruna Nusantara",
    yayasan: "Yayasan Pengembangan",
    paket: "Professional",
    siswa: 450,
    guru: 30,
    pendapatan: 550000,
    status: "Trial",
  },
  {
    id: 5,
    sekolah: "SDN 01 Menteng",
    yayasan: "-",
    paket: "Professional",
    siswa: 320,
    guru: 22,
    pendapatan: 550000,
    status: "Aktif",
  },
  {
    id: 6,
    sekolah: "SMK Bina Insani",
    yayasan: "Yayasan Bina Insani",
    paket: "Enterprise",
    siswa: 850,
    guru: 52,
    pendapatan: 1200000,
    status: "Aktif",
  },
  {
    id: 7,
    sekolah: "SMP Islam Al-Falah",
    yayasan: "Yayasan Al-Falah",
    paket: "Starter",
    siswa: 340,
    guru: 25,
    pendapatan: 250000,
    status: "Trial",
  },
];

// =========================================================
// UTILITY
// =========================================================

const formatRupiah = (angka) => {
  if (!angka) return "Rp0";
  return "Rp" + angka.toLocaleString("id-ID");
};

const getStatusColor = (status) => {
  const map = {
    Aktif: `${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`,
    Trial: `${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder}`,
    Nonaktif: `${themeDangerSurface} theme-text-secondary ${themeDangerBorder}`,
  };

  return map[status] || map.Nonaktif;
};

// =========================================================
// MAIN COMPONENT
// =========================================================

export default function LaporanAnalitikPage() {
  const [activeTab, setActiveTab] =
    useState("ringkasan");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [filterPaket, setFilterPaket] =
    useState("Semua");

  const [filterStatus, setFilterStatus] =
    useState("Semua");

  const [currentPage, setCurrentPage] =
    useState(1);

  const itemsPerPage = 5;

  const maxSekolah = Math.max(
    ...monthlyData.map((d) => d.sekolah)
  );

  const maxPendapatan = Math.max(
    ...monthlyData.map((d) => d.pendapatan)
  );

  const maxPengguna = Math.max(
    ...monthlyData.map((d) => d.pengguna)
  );

  const filteredReport = reportData.filter(
    (item) => {
      const matchSearch =
        item.sekolah
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        item.yayasan
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchPaket =
        filterPaket === "Semua" ||
        item.paket === filterPaket;

      const matchStatus =
        filterStatus === "Semua" ||
        item.status === filterStatus;

      return (
        matchSearch &&
        matchPaket &&
        matchStatus
      );
    }
  );

  const totalPages = Math.ceil(
    filteredReport.length / itemsPerPage
  );

  const paginatedReport =
    filteredReport.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

  const tabs = [
    {
      id: "ringkasan",
      label: "Ringkasan",
    },
    {
      id: "sekolah",
      label: "Data Sekolah",
    },
    {
      id: "keuangan",
      label: "Keuangan",
    },
    {
      id: "pengguna",
      label: "Pengguna",
    },
  ];

  const paketOptions = [
    "Semua",
    "Starter",
    "Professional",
    "Enterprise",
  ];

  const statusOptions = [
    "Semua",
    "Aktif",
    "Trial",
    "Nonaktif",
  ];

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-xl font-semibold tracking-tight theme-text sm:text-2xl">
              Laporan & Analitik
            </h1>

            <p className="mt-0.5 text-sm theme-text-secondary">
              Pantau performa sistem dan analisis data
              secara mendalam.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">

            <button
              type="button"
              className={`rounded-lg border ${themeNeutralBorder} theme-card px-4 py-2 text-sm font-medium theme-text-secondary transition-colors ${themeNeutralHover}`}
            >
              Export
            </button>

            <button
              type="button"
              className={`rounded-lg border ${themeNeutralBorder} theme-card px-4 py-2 text-sm font-medium theme-text-secondary transition-colors ${themeNeutralHover}`}
            >
              Cetak
            </button>

          </div>
        </div>

        {/* =====================================================
            STATS CARDS
        ===================================================== */}

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">

          {summaryStats.map((stat) => {
            const TrendIcon =
              stat.trend === "up"
                ? ArrowUpRight
                : ArrowDownRight;

            const trendColor =
              stat.trend === "up"
                ? "text-[var(--color-success)]"
                : "theme-text-secondary";

            return (
              <div
                key={stat.label}
                className={`theme-card rounded-xl border ${themeNeutralBorder} p-3.5 ${themeCardShadow} transition-shadow duration-200 hover:shadow-[0_8px_24px_color-mix(in_srgb,var(--color-text)_8%,transparent)]`}
              >
                <div className="flex items-center justify-between gap-1">

                  <p className="truncate text-[10px] font-medium uppercase tracking-wider theme-text-muted">
                    {stat.label}
                  </p>

                  <span
                    className={`flex shrink-0 items-center gap-0.5 whitespace-nowrap text-[10px] font-semibold ${trendColor}`}
                  >
                    <TrendIcon size={11} />
                    {stat.change}
                  </span>

                </div>

                <p className="mt-1.5 text-lg font-bold theme-text">
                  {stat.value}
                </p>

              </div>
            );
          })}

        </div>

        {/* =====================================================
            TABS
        ===================================================== */}

        <div
          className={`mb-6 overflow-x-auto border-b ${themeDivider}`}
        >
          <nav className="flex min-w-max gap-1">

            {tabs.map((tab) => {
              const isActive =
                activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? `border-[var(--color-primary)] ${themePrimaryText}`
                      : `border-transparent theme-text-muted hover:text-[var(--color-primary)]`
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}

          </nav>
        </div>

        {/* =====================================================
            CONTENT
        ===================================================== */}

        <div className="space-y-4">

          {activeTab === "ringkasan" && (
            <RingkasanTab
              monthlyData={monthlyData}
              maxSekolah={maxSekolah}
              maxPendapatan={maxPendapatan}
              maxPengguna={maxPengguna}
            />
          )}

          {activeTab === "sekolah" && (
            <SekolahTab
              reportData={paginatedReport}
              filteredData={filteredReport}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterPaket={filterPaket}
              setFilterPaket={setFilterPaket}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              paketOptions={paketOptions}
              statusOptions={statusOptions}
              formatRupiah={formatRupiah}
              getStatusColor={getStatusColor}
            />
          )}

          {activeTab === "keuangan" && (
            <KeuanganTab
              monthlyData={monthlyData}
              formatRupiah={formatRupiah}
            />
          )}

          {activeTab === "pengguna" && (
            <PenggunaTab
              monthlyData={monthlyData}
            />
          )}

        </div>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div
          className={`mt-6 border-t ${themeDivider} py-3 text-center text-xs theme-text-muted`}
        >
          © 2026 SmartSchool • Data diperbarui
          secara real-time
        </div>

      </div>
    </div>
  );
}

// =========================================================
// TAB RINGKASAN
// =========================================================

function RingkasanTab({
  monthlyData,
  maxSekolah,
  maxPendapatan,
  maxPengguna,
}) {
  const [selectedMetric, setSelectedMetric] =
    useState("sekolah");

  const metrics = [
    {
      id: "sekolah",
      label: "Sekolah",
      dataKey: "sekolah",
      max: maxSekolah,
    },
    {
      id: "pendapatan",
      label: "Pendapatan (Juta)",
      dataKey: "pendapatan",
      max: maxPendapatan,
    },
    {
      id: "pengguna",
      label: "Pengguna",
      dataKey: "pengguna",
      max: maxPengguna,
    },
  ];

  const currentMetric =
    metrics.find(
      (m) => m.id === selectedMetric
    ) || metrics[0];

  const maxVal =
    currentMetric.max || 1;

  return (
    <div className="space-y-4">

      {/* =====================================================
          CHART CONTROLS
      ===================================================== */}

      <div
        className={`theme-card flex flex-wrap items-center gap-2 rounded-xl border ${themeNeutralBorder} p-3 ${themeCardShadow}`}
      >
        <span className="mr-1 text-xs font-medium theme-text-secondary">
          Tampilkan:
        </span>

        {metrics.map((metric) => {
          const active =
            selectedMetric === metric.id;

          return (
            <button
              key={metric.id}
              type="button"
              onClick={() =>
                setSelectedMetric(
                  metric.id
                )
              }
              className={
                active
                  ? `${themePrimaryGradient} rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--color-card)]`
                  : `rounded-lg px-3 py-1.5 text-xs font-medium theme-text-secondary ${themeNeutralHover}`
              }
            >
              {metric.label}
            </button>
          );
        })}
      </div>

      {/* =====================================================
          AREA CHART
      ===================================================== */}

      <div
        className={`theme-card rounded-xl border ${themeNeutralBorder} p-4 ${themeCardShadow}`}
      >

        <div className="mb-3 flex items-center justify-between">

          <h3 className="text-sm font-semibold theme-text">
            Analitik {currentMetric.label}
          </h3>

          <span
            className={`rounded-full border ${themeNeutralBorder} ${themeNeutralSurface} px-2 py-0.5 text-[10px] font-medium theme-text-muted`}
          >
            {monthlyData.length} bulan
          </span>

        </div>

        <div className="relative">

          <svg
            className="h-56 w-full"
            viewBox="0 0 700 220"
            preserveAspectRatio="none"
          >

            <defs>
              <linearGradient
                id="areaGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="var(--color-primary)"
                  stopOpacity="0.25"
                />

                <stop
                  offset="100%"
                  stopColor="var(--color-primary)"
                  stopOpacity="0.02"
                />
              </linearGradient>
            </defs>

            {/* Grid Lines */}

            {[0, 25, 50, 75, 100].map(
              (percent) => {
                const y =
                  205 -
                  (percent / 100) * 190;

                return (
                  <line
                    key={percent}
                    x1="25"
                    y1={y}
                    x2="675"
                    y2={y}
                    stroke="var(--color-border)"
                    strokeWidth="0.8"
                  />
                );
              }
            )}

            {/* Area */}

            <polygon
              points={
                monthlyData
                  .map((d, i) => {
                    const x =
                      25 +
                      (i /
                        (monthlyData.length -
                          1)) *
                        650;

                    const val =
                      d[
                        currentMetric
                          .dataKey
                      ];

                    const y =
                      205 -
                      (val / maxVal) *
                        190;

                    return `${x},${y}`;
                  })
                  .join(" ") +
                `,675,205,25,205`
              }
              fill="url(#areaGradient)"
            />

            {/* Line */}

            <polyline
              points={monthlyData
                .map((d, i) => {
                  const x =
                    25 +
                    (i /
                      (monthlyData.length -
                        1)) *
                      650;

                  const val =
                    d[
                      currentMetric
                        .dataKey
                    ];

                  const y =
                    205 -
                    (val / maxVal) *
                      190;

                  return `${x},${y}`;
                })
                .join(" ")}
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data Points */}

            {monthlyData.map(
              (d, i) => {
                const x =
                  25 +
                  (i /
                    (monthlyData.length -
                      1)) *
                    650;

                const val =
                  d[
                    currentMetric
                      .dataKey
                  ];

                const y =
                  205 -
                  (val / maxVal) *
                    190;

                const isLast =
                  i ===
                  monthlyData.length -
                    1;

                return (
                  <g
                    key={i}
                    className="group"
                  >
                    <circle
                      cx={x}
                      cy={y}
                      r={
                        isLast
                          ? 4.5
                          : 3
                      }
                      fill={
                        isLast
                          ? "var(--color-primary)"
                          : "var(--color-card)"
                      }
                      stroke="var(--color-primary)"
                      strokeWidth="1.8"
                    />

                    <foreignObject
                      x={x - 25}
                      y={y - 32}
                      width="50"
                      height="24"
                      className="pointer-events-none opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <div
                        className={`${themePrimaryGradient} rounded px-2 py-1 text-center text-[10px] text-[var(--color-card)]`}
                      >
                        {val}
                      </div>
                    </foreignObject>
                  </g>
                );
              }
            )}

            {/* X Axis */}

            {monthlyData.map(
              (d, i) => {
                const x =
                  25 +
                  (i /
                    (monthlyData.length -
                      1)) *
                    650;

                return (
                  <text
                    key={i}
                    x={x}
                    y="215"
                    fontSize="10"
                    fill="var(--color-text-muted)"
                    textAnchor="middle"
                  >
                    {d.month}
                  </text>
                );
              }
            )}

            {/* Y Axis */}

            {[0, 25, 50, 75, 100].map(
              (percent) => {
                const y =
                  205 -
                  (percent / 100) *
                    190;

                const value =
                  Math.round(
                    (percent / 100) *
                      maxVal
                  );

                return (
                  <text
                    key={percent}
                    x="20"
                    y={y + 3}
                    fontSize="9"
                    fill="var(--color-text-muted)"
                    textAnchor="end"
                  >
                    {value}
                  </text>
                );
              }
            )}

          </svg>

          <div
            className={`absolute right-4 top-2 rounded-lg border ${themeNeutralBorder} theme-card px-3 py-1.5`}
          >
            <span className="text-xs font-bold theme-text">
              {
                monthlyData[
                  monthlyData.length - 1
                ][currentMetric.dataKey]
              }

              {selectedMetric ===
                "pendapatan" &&
                " Jt"}
            </span>
          </div>

        </div>

        {/* Metric Summary */}

        <div
          className={`mt-4 grid grid-cols-3 gap-3 border-t ${themeDivider} pt-3`}
        >

          <div className="text-center">
            <p className="text-[9px] theme-text-muted">
              Terendah
            </p>

            <p className="text-sm font-bold theme-text">
              {Math.min(
                ...monthlyData.map(
                  (d) =>
                    d[
                      currentMetric
                        .dataKey
                    ]
                )
              )}

              {selectedMetric ===
                "pendapatan" &&
                " Jt"}
            </p>
          </div>

          <div className="text-center">
            <p className="text-[9px] theme-text-muted">
              Rata-rata
            </p>

            <p className="text-sm font-bold theme-text">
              {Math.round(
                monthlyData.reduce(
                  (sum, d) =>
                    sum +
                    d[
                      currentMetric
                        .dataKey
                    ],
                  0
                ) /
                  monthlyData.length
              )}

              {selectedMetric ===
                "pendapatan" &&
                " Jt"}
            </p>
          </div>

          <div className="text-center">
            <p className="text-[9px] theme-text-muted">
              Tertinggi
            </p>

            <p className="text-sm font-bold theme-text">
              {Math.max(
                ...monthlyData.map(
                  (d) =>
                    d[
                      currentMetric
                        .dataKey
                    ]
                )
              )}

              {selectedMetric ===
                "pendapatan" &&
                " Jt"}
            </p>
          </div>

        </div>
      </div>

      {/* =====================================================
          RINGKASAN 3 METRIK
      ===================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        {metrics.map((metric) => {
          const currentVal =
            monthlyData[
              monthlyData.length - 1
            ][metric.dataKey];

          const firstVal =
            monthlyData[0][
              metric.dataKey
            ];

          const growth =
            firstVal > 0
              ? ((currentVal -
                  firstVal) /
                  firstVal) *
                100
              : 0;

          const max =
            Math.max(
              ...monthlyData.map(
                (d) =>
                  d[
                    metric.dataKey
                  ]
              )
            ) || 1;

          return (
            <div
              key={metric.id}
              onClick={() =>
                setSelectedMetric(
                  metric.id
                )
              }
              className={`theme-card cursor-pointer rounded-xl border ${themeNeutralBorder} p-3 ${themeCardShadow} transition-shadow hover:shadow-[0_8px_24px_color-mix(in_srgb,var(--color-text)_8%,transparent)]`}
            >

              <div className="flex items-center justify-between">

                <p className="text-[10px] theme-text-muted">
                  {metric.label}
                </p>

                <span
                  className={`text-xs font-medium ${
                    growth >= 0
                      ? "text-[var(--color-success)]"
                      : "theme-text-secondary"
                  }`}
                >
                  {growth >= 0
                    ? "+"
                    : ""}
                  {growth.toFixed(1)}%
                </span>

              </div>

              <p className="mt-1 text-lg font-bold theme-text">
                {currentVal}
                {metric.id ===
                  "pendapatan" &&
                  " Jt"}
              </p>

              <div
                className={`mt-1.5 h-1.5 w-full overflow-hidden rounded-full ${themeNeutralSurface}`}
              >
                <div
                  className="h-full rounded-full bg-[var(--color-primary)]"
                  style={{
                    width: `${
                      (currentVal /
                        max) *
                      100
                    }%`,
                  }}
                />
              </div>

            </div>
          );
        })}

      </div>
    </div>
  );
}

// =========================================================
// TAB SEKOLAH
// =========================================================

function SekolahTab({
  reportData,
  filteredData,
  searchQuery,
  setSearchQuery,
  filterPaket,
  setFilterPaket,
  filterStatus,
  setFilterStatus,
  currentPage,
  setCurrentPage,
  totalPages,
  paketOptions,
  statusOptions,
  formatRupiah,
  getStatusColor,
}) {
  return (
    <div
      className={`theme-card overflow-hidden rounded-xl border ${themeNeutralBorder} ${themeCardShadow}`}
    >

      {/* FILTER */}

      <div
        className={`flex flex-col gap-3 border-b ${themeDivider} p-4 sm:flex-row`}
      >

        <div className="relative flex-1">

          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
          />

          <input
            type="text"
            placeholder="Cari sekolah atau yayasan..."
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(
                e.target.value
              )
            }
            className={`theme-input w-full rounded-lg border px-3 py-2 pl-9 text-sm outline-none transition-shadow ${themeFocus}`}
          />

        </div>

        <div className="flex flex-wrap gap-2">

          <select
            value={filterPaket}
            onChange={(e) =>
              setFilterPaket(
                e.target.value
              )
            }
            className={`theme-input cursor-pointer rounded-lg border px-3 py-2 text-sm outline-none ${themeFocus}`}
          >
            {paketOptions.map(
              (opt) => (
                <option
                  key={opt}
                  value={opt}
                >
                  {opt}
                </option>
              )
            )}
          </select>

          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(
                e.target.value
              )
            }
            className={`theme-input cursor-pointer rounded-lg border px-3 py-2 text-sm outline-none ${themeFocus}`}
          >
            {statusOptions.map(
              (opt) => (
                <option
                  key={opt}
                  value={opt}
                >
                  {opt}
                </option>
              )
            )}
          </select>

          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setFilterPaket("Semua");
              setFilterStatus("Semua");
              setCurrentPage(1);
            }}
            className={`rounded-lg px-3 py-2 text-sm theme-text-secondary transition-colors ${themeNeutralHover}`}
          >
            Reset
          </button>

        </div>
      </div>

      {/* TABLE */}

      <div className="overflow-x-auto">

        <table className="w-full text-sm">

          <thead>
            <tr
              className={`${themeNeutralSurface} border-b ${themeDivider}`}
            >
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider theme-text-muted">
                Sekolah
              </th>

              <th className="hidden px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider theme-text-muted md:table-cell">
                Yayasan
              </th>

              <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider theme-text-muted">
                Paket
              </th>

              <th className="hidden px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider theme-text-muted sm:table-cell">
                Siswa
              </th>

              <th className="hidden px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider theme-text-muted lg:table-cell">
                Guru
              </th>

              <th className="hidden px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider theme-text-muted md:table-cell">
                Pendapatan
              </th>

              <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider theme-text-muted">
                Status
              </th>
            </tr>
          </thead>

          <tbody>

            {reportData.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center theme-text-muted"
                >
                  Tidak ada data
                </td>
              </tr>
            ) : (
              reportData.map(
                (item) => {
                  const statusColor =
                    getStatusColor(
                      item.status
                    );

                  return (
                    <tr
                      key={item.id}
                      className={`border-b ${themeDivider} transition-colors ${themeNeutralHover}`}
                    >

                      <td className="px-4 py-2.5 font-medium theme-text">
                        {item.sekolah}
                      </td>

                      <td className="hidden px-4 py-2.5 theme-text-secondary md:table-cell">
                        {item.yayasan}
                      </td>

                      <td className="px-4 py-2.5">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs font-medium ${themePrimarySoft} ${themePrimarySoftBorder} ${themePrimaryText}`}
                        >
                          {item.paket}
                        </span>
                      </td>

                      <td className="hidden px-4 py-2.5 theme-text-secondary sm:table-cell">
                        {item.siswa}
                      </td>

                      <td className="hidden px-4 py-2.5 theme-text-secondary lg:table-cell">
                        {item.guru}
                      </td>

                      <td className="hidden px-4 py-2.5 theme-text-secondary md:table-cell">
                        {formatRupiah(
                          item.pendapatan
                        )}
                      </td>

                      <td className="px-4 py-2.5">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColor}`}
                        >
                          {item.status}
                        </span>
                      </td>

                    </tr>
                  );
                }
              )
            )}

          </tbody>

        </table>
      </div>

      {/* PAGINATION */}

      {totalPages > 1 && (
        <div
          className={`flex flex-col items-center justify-between gap-2 border-t ${themeDivider} px-4 py-3 sm:flex-row`}
        >

          <span className="text-xs theme-text-secondary">
            {filteredData.length} data
          </span>

          <div className="flex items-center gap-0.5">

            <button
              type="button"
              onClick={() =>
                setCurrentPage(
                  Math.max(
                    1,
                    currentPage - 1
                  )
                )
              }
              disabled={
                currentPage === 1
              }
              className={`rounded-lg px-3 py-1 text-sm theme-text-secondary transition-colors ${themeNeutralHover} disabled:opacity-40`}
            >
              Previous
            </button>

            {[
              ...Array(
                Math.min(
                  totalPages,
                  5
                )
              ),
            ].map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() =>
                  setCurrentPage(
                    i + 1
                  )
                }
                className={`h-8 w-8 rounded-lg text-sm transition-colors ${
                  currentPage ===
                  i + 1
                    ? `${themePrimaryGradient} text-[var(--color-card)]`
                    : `theme-text-secondary ${themeNeutralHover}`
                }`}
              >
                {i + 1}
              </button>
            ))}

            {totalPages > 5 && (
              <span className="px-1 theme-text-muted">
                …
              </span>
            )}

            <button
              type="button"
              onClick={() =>
                setCurrentPage(
                  Math.min(
                    totalPages,
                    currentPage + 1
                  )
                )
              }
              disabled={
                currentPage ===
                totalPages
              }
              className={`rounded-lg px-3 py-1 text-sm theme-text-secondary transition-colors ${themeNeutralHover} disabled:opacity-40`}
            >
              Next
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

// =========================================================
// TAB KEUANGAN
// =========================================================

function KeuanganTab({
  monthlyData,
  formatRupiah,
}) {
  const totalPendapatan =
    monthlyData.reduce(
      (sum, d) =>
        sum + d.pendapatan,
      0
    );

  const rataRata =
    totalPendapatan /
    monthlyData.length;

  const maxPendapatan =
    Math.max(
      ...monthlyData.map(
        (d) => d.pendapatan
      )
    );

  return (
    <div className="space-y-4">

      {/* SUMMARY */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div
          className={`theme-card rounded-xl border ${themeNeutralBorder} p-4 ${themeCardShadow}`}
        >
          <p className="text-xs theme-text-muted">
            Total Pendapatan
          </p>

          <p className="text-2xl font-bold theme-text">
            {formatRupiah(
              totalPendapatan
            )}
          </p>
        </div>

        <div
          className={`theme-card rounded-xl border ${themeNeutralBorder} p-4 ${themeCardShadow}`}
        >
          <p className="text-xs theme-text-muted">
            Rata-rata / Bulan
          </p>

          <p className="text-2xl font-bold theme-text">
            {formatRupiah(
              Math.round(
                rataRata
              )
            )}
          </p>

          <p className="mt-1 text-[10px] theme-text-muted">
            Dari {monthlyData.length} bulan
          </p>
        </div>

        <div
          className={`theme-card rounded-xl border ${themeNeutralBorder} p-4 ${themeCardShadow}`}
        >
          <p className="text-xs theme-text-muted">
            Bulan Tertinggi
          </p>

          <p className="text-2xl font-bold text-[var(--color-success)]">
            {formatRupiah(
              maxPendapatan
            )}
          </p>

          <p className="mt-1 text-[10px] theme-text-muted">
            {
              monthlyData.find(
                (d) =>
                  d.pendapatan ===
                  maxPendapatan
              )?.month
            }
          </p>
        </div>

      </div>

      {/* DETAIL */}

      <div
        className={`theme-card rounded-xl border ${themeNeutralBorder} p-4 ${themeCardShadow}`}
      >

        <h4 className="mb-3 text-sm font-semibold theme-text">
          Detail Pendapatan per Bulan
        </h4>

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead>
              <tr
                className={`border-b ${themeDivider} ${themeNeutralSurface}`}
              >
                <th className="px-3 py-2 text-left text-xs font-medium theme-text-muted">
                  Bulan
                </th>

                <th className="px-3 py-2 text-right text-xs font-medium theme-text-muted">
                  Pendapatan
                </th>

                <th className="px-3 py-2 text-right text-xs font-medium theme-text-muted">
                  %
                </th>
              </tr>
            </thead>

            <tbody>

              {monthlyData.map(
                (item, idx) => {
                  const persen =
                    totalPendapatan > 0
                      ? (item.pendapatan /
                          totalPendapatan) *
                        100
                      : 0;

                  return (
                    <tr
                      key={idx}
                      className={`border-b ${themeDivider} transition-colors ${themeNeutralHover}`}
                    >

                      <td className="px-3 py-2 font-medium theme-text">
                        {item.month}
                      </td>

                      <td className="px-3 py-2 text-right theme-text-secondary">
                        {formatRupiah(
                          item.pendapatan
                        )}
                      </td>

                      <td className="px-3 py-2 text-right">
                        <span className="text-xs theme-text-secondary">
                          {persen.toFixed(
                            1
                          )}
                          %
                        </span>
                      </td>

                    </tr>
                  );
                }
              )}

            </tbody>

          </table>
        </div>
      </div>

    </div>
  );
}

// =========================================================
// TAB PENGGUNA
// =========================================================

function PenggunaTab({
  monthlyData,
}) {
  const totalPengguna =
    monthlyData[
      monthlyData.length - 1
    ]?.pengguna || 0;

  const growth =
    monthlyData.length > 1
      ? ((monthlyData[
          monthlyData.length - 1
        ].pengguna -
          monthlyData[0].pengguna) /
          monthlyData[0].pengguna) *
        100
      : 0;

  const maxPengguna =
    Math.max(
      ...monthlyData.map(
        (d) => d.pengguna
      )
    );

  return (
    <div className="space-y-4">

      {/* SUMMARY */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div
          className={`theme-card rounded-xl border ${themeNeutralBorder} p-4 ${themeCardShadow}`}
        >
          <p className="text-xs theme-text-muted">
            Total Pengguna
          </p>

          <p className="text-2xl font-bold theme-text">
            {totalPengguna.toLocaleString()}
          </p>
        </div>

        <div
          className={`theme-card rounded-xl border ${themeNeutralBorder} p-4 ${themeCardShadow}`}
        >
          <p className="text-xs theme-text-muted">
            Pertumbuhan
          </p>

          <p
            className={`text-2xl font-bold ${
              growth >= 0
                ? "text-[var(--color-success)]"
                : "theme-text-secondary"
            }`}
          >
            {growth >= 0
              ? "+"
              : ""}
            {growth.toFixed(1)}%
          </p>

          <p className="mt-1 text-[10px] theme-text-muted">
            Sejak awal
          </p>
        </div>

        <div
          className={`theme-card rounded-xl border ${themeNeutralBorder} p-4 ${themeCardShadow}`}
        >
          <p className="text-xs theme-text-muted">
            Bulan Ini
          </p>

          <p className="text-2xl font-bold theme-text">
            {monthlyData[
              monthlyData.length - 1
            ]?.pengguna?.toLocaleString()}
          </p>

          <p className="mt-1 text-[10px] theme-text-muted">
            {
              monthlyData[
                monthlyData.length - 1
              ]?.month
            }
          </p>
        </div>

      </div>

      {/* CHART */}

      <div
        className={`theme-card rounded-xl border ${themeNeutralBorder} p-4 ${themeCardShadow}`}
      >

        <h4 className="mb-3 text-sm font-semibold theme-text">
          Distribusi Pengguna per Bulan
        </h4>

        <div className="relative">

          <svg
            className="h-40 w-full"
            viewBox="0 0 680 150"
            preserveAspectRatio="none"
          >

            {[0, 25, 50, 75, 100].map(
              (percent) => {
                const y =
                  135 -
                  (percent / 100) *
                    120;

                return (
                  <line
                    key={percent}
                    x1="30"
                    y1={y}
                    x2="660"
                    y2={y}
                    stroke="var(--color-border)"
                    strokeWidth="0.5"
                  />
                );
              }
            )}

            {monthlyData.map(
              (item, idx) => {
                const x =
                  30 +
                  (idx /
                    (monthlyData.length -
                      1)) *
                    630;

                const height =
                  (item.pengguna /
                    maxPengguna) *
                  120;

                const y =
                  135 - height;

                return (
                  <rect
                    key={idx}
                    x={x - 6}
                    y={y}
                    width="12"
                    height={
                      height || 2
                    }
                    rx="2"
                    fill="var(--color-primary)"
                    className="cursor-pointer transition-all duration-700 hover:opacity-80"
                  >
                    <title>
                      {item.month}:{" "}
                      {item.pengguna}{" "}
                      pengguna
                    </title>
                  </rect>
                );
              }
            )}

            {monthlyData.map(
              (item, idx) => {
                const x =
                  30 +
                  (idx /
                    (monthlyData.length -
                      1)) *
                    630;

                return (
                  <text
                    key={idx}
                    x={x}
                    y="142"
                    fontSize="9"
                    fill="var(--color-text-muted)"
                    textAnchor="middle"
                  >
                    {item.month}
                  </text>
                );
              }
            )}

          </svg>

          <div
            className={`absolute right-4 top-2 rounded-lg border ${themeNeutralBorder} theme-card px-3 py-1.5`}
          >
            <span className="text-xs font-bold theme-text">
              {
                monthlyData[
                  monthlyData.length - 1
                ]?.pengguna
              }
            </span>

            <span className="ml-1 text-[10px] theme-text-muted">
              terbaru
            </span>
          </div>

        </div>

        <div className="mt-1 flex justify-between px-1 text-[9px] theme-text-muted">
          <span>0</span>
          <span>{maxPengguna}</span>
        </div>

      </div>

    </div>
  );
}