"use client";

import { useState } from "react";
import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";
import {
  FileBarChart,
  Search,
  Download,
  SlidersHorizontal,
  Building2,
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
} from "lucide-react";

// Dummy data laporan. Ganti dengan data asli dari API kalau sudah ada.
const laporanList = [
  {
    id: "lap-001",
    judul: "Kerusakan AC Ruang Guru",
    jenis: "Kerusakan",
    target: "Fasilitas",
    pelapor: "Bu Sari",
    tanggal: "20 Agu 2026",
    status: "Menunggu",
  },
  {
    id: "lap-002",
    judul: "Kebocoran atap Lab IPA",
    jenis: "Kerusakan",
    target: "Fasilitas",
    pelapor: "Pak Anwar",
    tanggal: "18 Agu 2026",
    status: "Diproses",
  },
  {
    id: "lap-003",
    judul: "Pemeriksaan rutin kursi kelas",
    jenis: "Pemeriksaan",
    target: "Inventaris",
    pelapor: "Admin Sarpras",
    tanggal: "15 Agu 2026",
    status: "Selesai",
  },
  {
    id: "lap-004",
    judul: "Papan tulis rusak berat",
    jenis: "Kerusakan",
    target: "Inventaris",
    pelapor: "Pak Budi",
    tanggal: "12 Agu 2026",
    status: "Selesai",
  },
  {
    id: "lap-005",
    judul: "Proyektor lab komputer bermasalah",
    jenis: "Kerusakan",
    target: "Inventaris",
    pelapor: "Bu Dewi",
    tanggal: "10 Agu 2026",
    status: "Diproses",
  },
  {
    id: "lap-006",
    judul: "Pengecekan kondisi lapangan basket",
    jenis: "Pemeriksaan",
    target: "Fasilitas",
    pelapor: "Admin Sarpras",
    tanggal: "5 Agu 2026",
    status: "Selesai",
  },
];

const jenisOptions = ["Semua", "Kerusakan", "Pemeriksaan"];
const targetOptions = ["Semua", "Fasilitas", "Inventaris"];
const statusOptions = ["Semua", "Menunggu", "Diproses", "Selesai"];

// ============================================================
// THEME HELPERS
// ============================================================

const themePrimarySurface =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimaryBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themePrimaryHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_88%,var(--color-text))]";

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
  "focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeSuccessText =
  "text-[var(--color-success)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeWarningText =
  "text-[var(--color-warning)]";

// ============================================================
// STATUS STYLE
// ============================================================

const statusStyle = {
  Menunggu: `${themeWarningText} ${themeWarningSurface} ${themeWarningBorder}`,
  Diproses: `${themePrimaryText} ${themePrimarySurface} ${themePrimaryBorder}`,
  Selesai: `${themeSuccessText} ${themeSuccessSurface} ${themeSuccessBorder}`,
};

const statusIcon = {
  Menunggu: {
    icon: Clock,
    tone: `${themeWarningText} ${themeWarningSurface}`,
  },
  Diproses: {
    icon: AlertTriangle,
    tone: `${themePrimaryText} ${themePrimarySurface}`,
  },
  Selesai: {
    icon: CheckCircle2,
    tone: `${themeSuccessText} ${themeSuccessSurface}`,
  },
};

const targetIcon = {
  Fasilitas: Building2,
  Inventaris: Package,
};

const quickStats = [
  {
    key: "total",
    label: "Total Laporan",
    value: laporanList.length,
    icon: FileBarChart,
    tone: `${themePrimaryText} ${themePrimarySurface}`,
  },
  {
    key: "menunggu",
    label: "Menunggu Tindak Lanjut",
    value: laporanList.filter((l) => l.status === "Menunggu").length,
    icon: Clock,
    tone: `${themeWarningText} ${themeWarningSurface}`,
  },
  {
    key: "diproses",
    label: "Sedang Diproses",
    value: laporanList.filter((l) => l.status === "Diproses").length,
    icon: AlertTriangle,
    tone: `${themePrimaryText} ${themePrimarySurface}`,
  },
  {
    key: "selesai",
    label: "Selesai",
    value: laporanList.filter((l) => l.status === "Selesai").length,
    icon: CheckCircle2,
    tone: `${themeSuccessText} ${themeSuccessSurface}`,
  },
];

export default function LaporanPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [jenisFilter, setJenisFilter] = useState("Semua");
  const [targetFilter, setTargetFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");

  const notifications = [
    {
      id: 1,
      title: "Laporan kerusakan AC Ruang Guru menunggu tindak lanjut",
      desc: "Dikirim 2 jam lalu",
      read: false,
    },
  ];

  const filteredList = laporanList.filter((l) => {
    const matchSearch =
      l.judul.toLowerCase().includes(search.toLowerCase()) ||
      l.pelapor.toLowerCase().includes(search.toLowerCase());

    const matchJenis =
      jenisFilter === "Semua" || l.jenis === jenisFilter;

    const matchTarget =
      targetFilter === "Semua" || l.target === targetFilter;

    const matchStatus =
      statusFilter === "Semua" || l.status === statusFilter;

    return matchSearch && matchJenis && matchTarget && matchStatus;
  });

  const handleExport = () => {
    // TODO: ganti dengan pemanggilan API asli untuk export (PDF/Excel)
    console.log("Export laporan:", filteredList);
  };

  return (
    <div className="flex min-h-screen theme-page">
      {/* ========================================================
          SIDEBAR
      ======================================================== */}
      <Sidebar
        role="adminSarpras"
        active="laporan"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* ======================================================
            HEADER
        ====================================================== */}
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          notifications={notifications}
          user={{
            name: "Admin Sarpras",
            email: "adminsarpras@smartschool.com",
            avatar: "SP",
          }}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="w-full space-y-6">

            {/* ==================================================
                PAGE HEADER
            ================================================== */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div className="min-w-0">
                <p
                  className={`text-xs font-medium ${themePrimaryText} uppercase tracking-wide`}
                >
                  Sarana & Prasarana
                </p>

                <h1 className="text-2xl sm:text-[28px] font-bold theme-text mt-1 tracking-tight">
                  Laporan
                </h1>

                <p className="text-sm theme-text-secondary mt-1">
                  Pantau laporan kerusakan dan pemeriksaan fasilitas serta
                  inventaris.
                </p>
              </div>

              <button
                onClick={handleExport}
                className={`
                  inline-flex items-center gap-2
                  px-4 py-2.5
                  rounded-xl
                  bg-[var(--color-primary)]
                  ${themePrimaryHover}
                  text-[var(--color-card)]
                  text-sm font-medium
                  ${themePrimaryShadow}
                  transition-all
                  flex-shrink-0
                `}
              >
                <Download size={16} />
                Export Laporan
              </button>
            </div>

            {/* ==================================================
                QUICK STATS
            ================================================== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickStats.map(
                ({ key, label, value, icon: Icon, tone }) => (
                  <div
                    key={key}
                    className={`
                      theme-card
                      rounded-2xl
                      border theme-border
                      ${themeCardShadow}
                      p-4
                      flex items-center gap-3.5
                    `}
                  >
                    <div
                      className={`
                        w-11 h-11
                        rounded-xl
                        flex items-center justify-center
                        flex-shrink-0
                        ${tone}
                      `}
                    >
                      <Icon size={20} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xl font-bold theme-text leading-none">
                        {value}
                      </p>

                      <p className="text-xs theme-text-muted mt-1 truncate">
                        {label}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* ==================================================
                SEARCH & FILTER
            ================================================== */}
            <div
              className={`
                theme-card
                rounded-2xl
                border theme-border
                ${themeCardShadow}
                p-4
                flex flex-col lg:flex-row gap-3
              `}
            >
              {/* SEARCH */}
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="
                    absolute left-3.5 top-1/2
                    -translate-y-1/2
                    theme-text-placeholder
                  "
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari judul laporan atau pelapor..."
                  className={`
                    w-full
                    pl-10 pr-4 py-2.5
                    rounded-xl
                    theme-input
                    text-sm
                    theme-text
                    placeholder:theme-text-placeholder
                    focus:outline-none
                    ${themeFocus}
                    transition-colors
                  `}
                />
              </div>

              {/* FILTERS */}
              <div className="flex flex-wrap gap-3">
                {/* JENIS */}
                <div className="relative">
                  <SlidersHorizontal
                    size={14}
                    className="
                      absolute left-3.5 top-1/2
                      -translate-y-1/2
                      theme-text-placeholder
                      pointer-events-none
                    "
                  />

                  <select
                    value={jenisFilter}
                    onChange={(e) => setJenisFilter(e.target.value)}
                    className={`
                      pl-9 pr-8 py-2.5
                      rounded-xl
                      theme-input
                      text-sm
                      theme-text
                      focus:outline-none
                      ${themeFocus}
                      transition-colors
                      appearance-none
                    `}
                  >
                    {jenisOptions.map((j) => (
                      <option key={j} value={j}>
                        {j}
                      </option>
                    ))}
                  </select>
                </div>

                {/* TARGET */}
                <select
                  value={targetFilter}
                  onChange={(e) => setTargetFilter(e.target.value)}
                  className={`
                    px-4 py-2.5
                    rounded-xl
                    theme-input
                    text-sm
                    theme-text
                    focus:outline-none
                    ${themeFocus}
                    transition-colors
                    appearance-none
                  `}
                >
                  {targetOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                {/* STATUS */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`
                    px-4 py-2.5
                    rounded-xl
                    theme-input
                    text-sm
                    theme-text
                    focus:outline-none
                    ${themeFocus}
                    transition-colors
                    appearance-none
                  `}
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ==================================================
                TABLE LAPORAN
            ================================================== */}
            <div
              className={`
                theme-card
                rounded-2xl
                border theme-border
                ${themeCardShadow}
                overflow-hidden
              `}
            >
              {/* TABLE HEADER */}
              <div
                className={`
                  flex items-center justify-between gap-2
                  px-5 py-4
                  border-b ${themeDivider}
                `}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`
                      p-1.5
                      rounded-lg
                      ${themePrimarySurface}
                      ${themePrimaryText}
                      flex-shrink-0
                    `}
                  >
                    <FileBarChart size={16} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold theme-text truncate">
                      Daftar Laporan
                    </h3>

                    <p className="text-xs theme-text-muted">
                      {filteredList.length} laporan ditemukan
                    </p>
                  </div>
                </div>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      className={`
                        text-left
                        text-xs
                        theme-text-muted
                        border-b
                        ${themeDivider}
                      `}
                    >
                      <th className="px-5 py-3 font-medium">
                        Judul Laporan
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Jenis
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Target
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Pelapor
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Tanggal
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody
                    className={`
                      divide-y
                      divide-[color-mix(in_srgb,var(--color-text)_8%,transparent)]
                    `}
                  >
                    {filteredList.map((l) => {
                      const s = statusIcon[l.status];
                      const StatusIcon = s.icon;
                      const TargetIcon = targetIcon[l.target];

                      return (
                        <tr
                          key={l.id}
                          className={`
                            transition-colors
                            hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)]
                          `}
                        >
                          {/* JUDUL */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`
                                  w-9 h-9
                                  rounded-lg
                                  flex items-center justify-center
                                  flex-shrink-0
                                  ${s.tone}
                                `}
                              >
                                <StatusIcon size={16} />
                              </div>

                              <span className="font-medium theme-text">
                                {l.judul}
                              </span>
                            </div>
                          </td>

                          {/* JENIS */}
                          <td className="px-5 py-3.5 theme-text-secondary">
                            {l.jenis}
                          </td>

                          {/* TARGET */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5 theme-text-secondary">
                              <TargetIcon
                                size={14}
                                className="theme-text-placeholder"
                              />

                              {l.target}
                            </div>
                          </td>

                          {/* PELAPOR */}
                          <td className="px-5 py-3.5 theme-text-secondary">
                            {l.pelapor}
                          </td>

                          {/* TANGGAL */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5 theme-text-secondary">
                              <Calendar
                                size={13}
                                className="theme-text-placeholder"
                              />

                              {l.tanggal}
                            </div>
                          </td>

                          {/* STATUS */}
                          <td className="px-5 py-3.5">
                            <span
                              className={`
                                text-[11px]
                                font-medium
                                px-2 py-0.5
                                rounded-full
                                border
                                ${statusStyle[l.status]}
                              `}
                            >
                              {l.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}

                    {/* EMPTY STATE */}
                    {filteredList.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="
                            text-center
                            py-12
                            text-sm
                            theme-text-muted
                          "
                        >
                          Tidak ada laporan yang cocok dengan filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}