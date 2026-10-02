"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  Undo2,
  Search,
  ChevronRight,
  SlidersHorizontal,
  Package,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

// ============================================================
// THEME HELPERS
// ============================================================

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themePrimaryBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryRing =
  "focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

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

// ============================================================
// DUMMY DATA
// ============================================================

const pengembalianList = [
  {
    id: "pjm-001",
    nama: "Proyektor Epson",
    tipe: "Inventaris",
    peminjam: "Pak Budi",
    tanggalKembali: "22 Agu 2026",
    kondisiKembali: "-",
    status: "Belum Dikembalikan",
  },
  {
    id: "pjm-004",
    nama: "Lapangan Basket",
    tipe: "Fasilitas",
    peminjam: "Pak Rudi",
    tanggalKembali: "19 Agu 2026",
    kondisiKembali: "-",
    status: "Belum Dikembalikan",
  },
  {
    id: "pjm-005",
    nama: "Mikroskop",
    tipe: "Inventaris",
    peminjam: "Bu Dewi",
    tanggalKembali: "6 Agu 2026",
    kondisiKembali: "-",
    status: "Terlambat",
  },
  {
    id: "pjm-003",
    nama: "Sound System",
    tipe: "Inventaris",
    peminjam: "Bu Sari",
    tanggalKembali: "12 Agu 2026",
    kondisiKembali: "Baik",
    status: "Sudah Dikembalikan",
  },
  {
    id: "pjm-006",
    nama: "Lab Komputer",
    tipe: "Fasilitas",
    peminjam: "Pak Anwar",
    tanggalKembali: "1 Agu 2026",
    kondisiKembali: "Baik",
    status: "Sudah Dikembalikan",
  },
  {
    id: "pjm-007",
    nama: "Kursi Kayu (10 unit)",
    tipe: "Inventaris",
    peminjam: "Panitia 17-an",
    tanggalKembali: "17 Agu 2026",
    kondisiKembali: "Rusak Ringan",
    status: "Sudah Dikembalikan",
  },
];

const tipeOptions = [
  "Semua",
  "Inventaris",
  "Fasilitas",
];

const statusOptions = [
  "Semua",
  "Belum Dikembalikan",
  "Terlambat",
  "Sudah Dikembalikan",
];

// ============================================================
// STATUS STYLE
// ============================================================

const statusStyle = {
  "Belum Dikembalikan": `
    text-[var(--color-info)]
    ${themeInfoSurface}
    ${themeInfoBorder}
  `,

  Terlambat: `
    text-[var(--color-warning)]
    ${themeWarningSurface}
    ${themeWarningBorder}
  `,

  "Sudah Dikembalikan": `
    text-[var(--color-success)]
    ${themeSuccessSurface}
    ${themeSuccessBorder}
  `,
};

const statusIcon = {
  "Belum Dikembalikan": {
    icon: Clock,
    tone: `
      text-[var(--color-info)]
      ${themeInfoSurface}
    `,
  },

  Terlambat: {
    icon: AlertTriangle,
    tone: `
      text-[var(--color-warning)]
      ${themeWarningSurface}
    `,
  },

  "Sudah Dikembalikan": {
    icon: CheckCircle2,
    tone: `
      text-[var(--color-success)]
      ${themeSuccessSurface}
    `,
  },
};

// ============================================================
// TIPE ICON
// ============================================================

const tipeIcon = {
  Inventaris: Package,
  Fasilitas: Building2,
};

// ============================================================
// QUICK STATS
// ============================================================

const quickStats = [
  {
    key: "belum",
    label: "Belum Dikembalikan",
    value: pengembalianList.filter(
      (p) => p.status === "Belum Dikembalikan"
    ).length,
    icon: Clock,
    tone: `
      text-[var(--color-info)]
      ${themeInfoSurface}
    `,
  },

  {
    key: "terlambat",
    label: "Terlambat",
    value: pengembalianList.filter(
      (p) => p.status === "Terlambat"
    ).length,
    icon: AlertTriangle,
    tone: `
      text-[var(--color-warning)]
      ${themeWarningSurface}
    `,
  },

  {
    key: "selesai",
    label: "Sudah Dikembalikan",
    value: pengembalianList.filter(
      (p) => p.status === "Sudah Dikembalikan"
    ).length,
    icon: CheckCircle2,
    tone: `
      text-[var(--color-success)]
      ${themeSuccessSurface}
    `,
  },
];

// ============================================================
// PAGE
// ============================================================

export default function PengembalianPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [tipeFilter, setTipeFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");

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

  const filteredList = pengembalianList.filter((p) => {
    const matchSearch =
      p.nama
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      p.peminjam
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchTipe =
      tipeFilter === "Semua" ||
      p.tipe === tipeFilter;

    const matchStatus =
      statusFilter === "Semua" ||
      p.status === statusFilter;

    return (
      matchSearch &&
      matchTipe &&
      matchStatus
    );
  });

  // ============================================================
  // DETAIL
  // ============================================================

  const handleOpenDetail = (id) => {
    router.push(
      `/adminSarpras/pengembalian/${id}`
    );
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="theme-page flex min-h-screen">

      {/* SIDEBAR */}
      <Sidebar
        role="adminSarpras"
        active="pengembalian"
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
                  Pengembalian
                </h1>

                <p className="text-sm theme-text-secondary mt-1">
                  Pantau dan proses pengembalian barang
                  atau ruangan yang dipinjam.
                </p>

              </div>
            </div>

            {/* ==================================================
                QUICK STATS
            ================================================== */}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {quickStats.map(
                ({
                  key,
                  label,
                  value,
                  icon: Icon,
                  tone,
                }) => (
                  <div
                    key={key}
                    className={`
                      theme-card
                      rounded-2xl
                      border
                      ${themeNeutralBorder}
                      ${themeCardShadow}
                      p-4
                      flex
                      items-center
                      gap-3.5
                    `}
                  >
                    <div
                      className={`
                        w-11
                        h-11
                        rounded-xl
                        flex
                        items-center
                        justify-center
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
                  placeholder="Cari nama barang/ruangan atau peminjam..."
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

                {/* TIPE */}
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
                    value={tipeFilter}
                    onChange={(e) =>
                      setTipeFilter(e.target.value)
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

                {/* STATUS */}
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
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
                  {statusOptions.map((s) => (
                    <option
                      key={s}
                      value={s}
                    >
                      {s}
                    </option>
                  ))}
                </select>

              </div>
            </div>

            {/* ==================================================
                TABLE
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

              {/* TABLE HEADER */}
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
                    <Undo2 size={16} />
                  </div>

                  <div className="min-w-0">

                    <h3 className="text-sm font-semibold theme-text truncate">
                      Daftar Pengembalian
                    </h3>

                    <p className="text-xs theme-text-muted">
                      {filteredList.length} data ditemukan
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
                        Nama
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Tipe
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Peminjam
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Jatuh Tempo
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Kondisi Kembali
                      </th>

                      <th className="px-5 py-3 font-medium">
                        Status
                      </th>

                      <th className="px-5 py-3 font-medium w-8">
                      </th>
                    </tr>
                  </thead>

                  <tbody
                    className={`
                      divide-y
                      divide-[color-mix(in_srgb,var(--color-text)_8%,transparent)]
                    `}
                  >

                    {filteredList.map((p) => {
                      const s = statusIcon[p.status];

                      const StatusIcon = s.icon;
                      const TipeIcon = tipeIcon[p.tipe];

                      return (
                        <tr
                          key={p.id}
                          onClick={() =>
                            handleOpenDetail(p.id)
                          }
                          className="
                            cursor-pointer
                            hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]
                            transition-colors
                            group
                          "
                        >

                          {/* NAMA */}
                          <td className="px-5 py-3.5">

                            <div className="flex items-center gap-2.5">

                              <div
                                className={`
                                  w-9
                                  h-9
                                  rounded-lg
                                  flex
                                  items-center
                                  justify-center
                                  flex-shrink-0
                                  ${s.tone}
                                `}
                              >
                                <StatusIcon size={16} />
                              </div>

                              <span className="font-medium theme-text">
                                {p.nama}
                              </span>

                            </div>

                          </td>

                          {/* TIPE */}
                          <td className="px-5 py-3.5">

                            <div className="flex items-center gap-1.5 theme-text-secondary">

                              <TipeIcon
                                size={14}
                                className="theme-text-muted"
                              />

                              {p.tipe}

                            </div>

                          </td>

                          {/* PEMINJAM */}
                          <td className="px-5 py-3.5 theme-text-secondary">
                            {p.peminjam}
                          </td>

                          {/* TANGGAL */}
                          <td className="px-5 py-3.5">

                            <div className="flex items-center gap-1.5 theme-text-secondary">

                              <Calendar
                                size={13}
                                className="theme-text-muted"
                              />

                              {p.tanggalKembali}

                            </div>

                          </td>

                          {/* KONDISI */}
                          <td className="px-5 py-3.5 theme-text-secondary">
                            {p.kondisiKembali}
                          </td>

                          {/* STATUS */}
                          <td className="px-5 py-3.5">

                            <span
                              className={`
                                text-[11px]
                                font-medium
                                px-2
                                py-0.5
                                rounded-full
                                border
                                ${statusStyle[p.status]}
                              `}
                            >
                              {p.status}
                            </span>

                          </td>

                          {/* ARROW */}
                          <td className="px-5 py-3.5">

                            <ChevronRight
                              size={16}
                              className="
                                theme-text-muted
                                opacity-50
                                group-hover:opacity-100
                                group-hover:translate-x-0.5
                                transition-all
                                duration-300
                              "
                            />

                          </td>

                        </tr>
                      );
                    })}

                    {/* EMPTY STATE */}
                    {filteredList.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="
                            text-center
                            py-12
                            text-sm
                            theme-text-muted
                          "
                        >
                          Tidak ada data yang cocok
                          dengan filter.
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