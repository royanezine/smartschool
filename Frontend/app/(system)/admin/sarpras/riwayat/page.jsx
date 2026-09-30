"use client";

import { useState } from "react";
import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";
import {
  History,
  Search,
  SlidersHorizontal,
  Package,
  Building2,
  Calendar,
  HandCoins,
  Undo2,
  FileBarChart,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";

// ============================================================
// THEME HELPERS
// ============================================================

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themePrimaryRing =
  "focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_24%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

// ============================================================
// DUMMY DATA
// ============================================================

const riwayatList = [
  {
    id: "riw-001",
    aktivitas: "Peminjaman",
    nama: "Proyektor Epson",
    tipe: "Inventaris",
    pelaku: "Pak Budi",
    tanggal: "18 Agu 2026",
    status: "Dipinjam",
  },
  {
    id: "riw-002",
    aktivitas: "Pengembalian",
    nama: "Sound System",
    tipe: "Inventaris",
    pelaku: "Bu Sari",
    tanggal: "12 Agu 2026",
    status: "Selesai",
  },
  {
    id: "riw-003",
    aktivitas: "Laporan",
    nama: "Kerusakan AC Ruang Guru",
    tipe: "Fasilitas",
    pelaku: "Bu Sari",
    tanggal: "20 Agu 2026",
    status: "Menunggu",
  },
  {
    id: "riw-004",
    aktivitas: "Peminjaman",
    nama: "Aula Sekolah",
    tipe: "Fasilitas",
    pelaku: "OSIS",
    tanggal: "20 Agu 2026",
    status: "Menunggu",
  },
  {
    id: "riw-005",
    aktivitas: "Pengembalian",
    nama: "Lab Komputer",
    tipe: "Fasilitas",
    pelaku: "Pak Anwar",
    tanggal: "1 Agu 2026",
    status: "Selesai",
  },
  {
    id: "riw-006",
    aktivitas: "Laporan",
    nama: "Kebocoran atap Lab IPA",
    tipe: "Fasilitas",
    pelaku: "Pak Anwar",
    tanggal: "18 Agu 2026",
    status: "Diproses",
  },
  {
    id: "riw-007",
    aktivitas: "Peminjaman",
    nama: "Mikroskop",
    tipe: "Inventaris",
    pelaku: "Bu Dewi",
    tanggal: "5 Agu 2026",
    status: "Terlambat",
  },
  {
    id: "riw-008",
    aktivitas: "Pengembalian",
    nama: "Kursi Kayu (10 unit)",
    tipe: "Inventaris",
    pelaku: "Panitia 17-an",
    tanggal: "17 Agu 2026",
    status: "Selesai",
  },
];

// ============================================================
// OPTIONS
// ============================================================

const aktivitasOptions = [
  "Semua",
  "Peminjaman",
  "Pengembalian",
  "Laporan",
];

const tipeOptions = [
  "Semua",
  "Inventaris",
  "Fasilitas",
];

// ============================================================
// AKTIVITAS ICON
// ============================================================

const aktivitasIcon = {
  Peminjaman: HandCoins,
  Pengembalian: Undo2,
  Laporan: FileBarChart,
};

// ============================================================
// AKTIVITAS STYLE
// ============================================================

const aktivitasStyle = {
  Peminjaman: `
    text-[var(--color-info)]
    ${themeInfoSurface}
    ${themeInfoBorder}
  `,

  Pengembalian: `
    text-[var(--color-primary)]
    ${themePrimarySoft}
    border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]
  `,

  Laporan: `
    text-[var(--color-warning)]
    ${themeWarningSurface}
    ${themeWarningBorder}
  `,
};

// ============================================================
// TIPE ICON
// ============================================================

const tipeIcon = {
  Inventaris: Package,
  Fasilitas: Building2,
};

// ============================================================
// STATUS STYLE
// ============================================================

const statusStyle = {
  Menunggu: `
    text-[var(--color-warning)]
    ${themeWarningSurface}
    ${themeWarningBorder}
  `,

  Diproses: `
    text-[var(--color-info)]
    ${themeInfoSurface}
    ${themeInfoBorder}
  `,

  Dipinjam: `
    text-[var(--color-info)]
    ${themeInfoSurface}
    ${themeInfoBorder}
  `,

  Terlambat: `
    text-[var(--color-warning)]
    ${themeWarningSurface}
    ${themeWarningBorder}
  `,

  Selesai: `
    text-[var(--color-success)]
    ${themeSuccessSurface}
    ${themeSuccessBorder}
  `,
};

// ============================================================
// STATUS ICON
// ============================================================

const statusIcon = {
  Menunggu: Clock,
  Diproses: AlertTriangle,
  Dipinjam: Clock,
  Terlambat: AlertTriangle,
  Selesai: CheckCircle2,
};

// ============================================================
// PAGE
// ============================================================

export default function RiwayatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [aktivitasFilter, setAktivitasFilter] =
    useState("Semua");
  const [tipeFilter, setTipeFilter] =
    useState("Semua");

  const notifications = [
    {
      id: 1,
      title: "Peminjaman Mikroskop terlambat dikembalikan",
      desc: "Dikirim 1 jam lalu",
      read: false,
    },
  ];

  // ============================================================
  // FILTER
  // ============================================================

  const filteredList = riwayatList.filter((r) => {
    const matchSearch =
      r.nama
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      r.pelaku
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchAktivitas =
      aktivitasFilter === "Semua" ||
      r.aktivitas === aktivitasFilter;

    const matchTipe =
      tipeFilter === "Semua" ||
      r.tipe === tipeFilter;

    return (
      matchSearch &&
      matchAktivitas &&
      matchTipe
    );
  });

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="theme-page flex min-h-screen">

      {/* SIDEBAR */}
      <Sidebar
        role="adminSarpras"
        active="riwayat"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() =>
          setSidebarOpen(!sidebarOpen)
        }
      />

      <div className="flex-1 flex flex-col min-w-0">

        {/* HEADER */}
        <Header
          toggleSidebar={() =>
            setSidebarOpen(!sidebarOpen)
          }
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
                  className={`
                    text-xs
                    font-medium
                    ${themePrimaryText}
                    uppercase
                    tracking-wide
                  `}
                >
                  Sarana & Prasarana
                </p>

                <h1 className="text-2xl sm:text-[28px] font-bold theme-text mt-1 tracking-tight">
                  Riwayat
                </h1>

                <p className="text-sm theme-text-secondary mt-1">
                  Riwayat seluruh aktivitas peminjaman,
                  pengembalian, dan laporan sarpras.
                </p>

              </div>

            </div>

            {/* ==================================================
                SEARCH & FILTER
            ================================================== */}

            <div
              className={`
                theme-card
                rounded-2xl
                border
                ${themeNeutralBorder}
                ${themeCardShadow}
                p-4
                flex
                flex-col
                lg:flex-row
                gap-3
              `}
            >

              {/* SEARCH */}
              <div className="relative flex-1">

                <Search
                  size={16}
                  className="
                    absolute
                    left-3.5
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
                  placeholder="Cari nama barang/ruangan atau pelaku..."
                  className={`
                    theme-input
                    w-full
                    pl-10
                    pr-4
                    py-2.5
                    rounded-xl
                    border
                    text-sm
                    theme-text
                    placeholder:theme-text-placeholder
                    focus:outline-none
                    ${themePrimaryRing}
                    focus:border-[var(--color-primary)]
                    transition-colors
                  `}
                />

              </div>

              {/* FILTER */}
              <div className="flex flex-wrap gap-3">

                {/* AKTIVITAS */}
                <div className="relative">

                  <SlidersHorizontal
                    size={14}
                    className="
                      absolute
                      left-3.5
                      top-1/2
                      -translate-y-1/2
                      theme-text-muted
                      pointer-events-none
                    "
                  />

                  <select
                    value={aktivitasFilter}
                    onChange={(e) =>
                      setAktivitasFilter(
                        e.target.value
                      )
                    }
                    className={`
                      theme-input
                      pl-9
                      pr-8
                      py-2.5
                      rounded-xl
                      border
                      text-sm
                      theme-text
                      focus:outline-none
                      ${themePrimaryRing}
                      focus:border-[var(--color-primary)]
                      transition-colors
                      appearance-none
                    `}
                  >
                    {aktivitasOptions.map((a) => (
                      <option
                        key={a}
                        value={a}
                      >
                        {a}
                      </option>
                    ))}
                  </select>

                </div>

                {/* TIPE */}
                <select
                  value={tipeFilter}
                  onChange={(e) =>
                    setTipeFilter(e.target.value)
                  }
                  className={`
                    theme-input
                    px-4
                    py-2.5
                    rounded-xl
                    border
                    text-sm
                    theme-text
                    focus:outline-none
                    ${themePrimaryRing}
                    focus:border-[var(--color-primary)]
                    transition-colors
                    appearance-none
                  `}
                >
                  {tipeOptions.map((t) => (
                    <option
                      key={t}
                      value={t}
                    >
                      {t}
                    </option>
                  ))}
                </select>

              </div>

            </div>

            {/* ==================================================
                TIMELINE / LIST RIWAYAT
            ================================================== */}

            <div
              className={`
                theme-card
                rounded-2xl
                border
                ${themeNeutralBorder}
                ${themeCardShadow}
                overflow-hidden
              `}
            >

              {/* HEADER LIST */}
              <div
                className={`
                  flex
                  items-center
                  justify-between
                  gap-2
                  px-5
                  py-4
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
                      ${themePrimaryText}
                      flex-shrink-0
                    `}
                  >
                    <History size={16} />
                  </div>

                  <div className="min-w-0">

                    <h3 className="text-sm font-semibold theme-text truncate">
                      Riwayat Aktivitas
                    </h3>

                    <p className="text-xs theme-text-muted">
                      {filteredList.length} aktivitas ditemukan
                    </p>

                  </div>

                </div>

              </div>

              {/* LIST */}
              <div
                className="
                  divide-y
                  divide-[color-mix(in_srgb,var(--color-text)_8%,transparent)]
                "
              >

                {filteredList.map((r) => {
                  const AktivitasIcon =
                    aktivitasIcon[r.aktivitas];

                  const TipeIcon =
                    tipeIcon[r.tipe];

                  const StatusIcon =
                    statusIcon[r.status];

                  return (
                    <div
                      key={r.id}
                      className="
                        flex
                        items-center
                        gap-3.5
                        px-5
                        py-3.5
                        hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]
                        transition-colors
                      "
                    >

                      {/* AKTIVITAS ICON */}
                      <div
                        className={`
                          w-9
                          h-9
                          rounded-lg
                          ${themeNeutralSurface}
                          theme-text-muted
                          flex
                          items-center
                          justify-center
                          flex-shrink-0
                        `}
                      >
                        <AktivitasIcon size={16} />
                      </div>

                      {/* CONTENT */}
                      <div className="min-w-0 flex-1">

                        <div className="flex items-center gap-2 flex-wrap">

                          <span
                            className={`
                              text-[11px]
                              font-medium
                              px-2
                              py-0.5
                              rounded-full
                              border
                              ${aktivitasStyle[r.aktivitas]}
                            `}
                          >
                            {r.aktivitas}
                          </span>

                          <p className="text-sm font-medium theme-text truncate">
                            {r.nama}
                          </p>

                        </div>

                        <div className="flex items-center gap-3 mt-1 text-xs theme-text-secondary">

                          {/* TIPE */}
                          <span className="flex items-center gap-1">

                            <TipeIcon
                              size={12}
                              className="theme-text-muted"
                            />

                            {r.tipe}

                          </span>

                          {/* PELAKU */}
                          <span>
                            {r.pelaku}
                          </span>

                          {/* TANGGAL */}
                          <span className="flex items-center gap-1">

                            <Calendar
                              size={12}
                              className="theme-text-muted"
                            />

                            {r.tanggal}

                          </span>

                        </div>

                      </div>

                      {/* STATUS */}
                      <span
                        className={`
                          inline-flex
                          items-center
                          gap-1
                          text-[11px]
                          font-medium
                          px-2
                          py-0.5
                          rounded-full
                          border
                          flex-shrink-0
                          ${statusStyle[r.status]}
                        `}
                      >
                        <StatusIcon size={11} />
                        {r.status}
                      </span>

                    </div>
                  );
                })}

                {/* EMPTY STATE */}
                {filteredList.length === 0 && (
                  <div className="text-center py-12 text-sm theme-text-muted">
                    Tidak ada aktivitas yang cocok
                    dengan filter.
                  </div>
                )}

              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}