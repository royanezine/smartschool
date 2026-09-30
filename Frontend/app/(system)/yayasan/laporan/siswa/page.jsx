"use client";

import { useState, useMemo } from "react";
import {
  Users,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  UserPlus,
  School,
  Venus,
  Mars,
  MapPin,
} from "lucide-react";
import { useRouter } from "next/navigation";

// ============================================================
// DUMMY DATA
// Catatan: ganti dengan data asli dari API/DB begitu tersedia.
// ============================================================

const JENJANG_OPTIONS = ["Semua Jenjang", "SD", "SMP", "SMA"];

const dataSekolah = [
  {
    id: 1,
    nama: "SD Smart School 1",
    jenjang: "SD",
    alamat: "Jl. Melati No. 12, Jakarta Selatan",
    tingkat: [
      { label: "Kelas 1", laki: 48, perempuan: 52 },
      { label: "Kelas 2", laki: 50, perempuan: 49 },
      { label: "Kelas 3", laki: 47, perempuan: 51 },
      { label: "Kelas 4", laki: 45, perempuan: 48 },
      { label: "Kelas 5", laki: 44, perempuan: 46 },
      { label: "Kelas 6", laki: 42, perempuan: 40 },
    ],
  },
  {
    id: 2,
    nama: "SD Smart School 2",
    jenjang: "SD",
    alamat: "Jl. Anggrek No. 8, Jakarta Timur",
    tingkat: [
      { label: "Kelas 1", laki: 45, perempuan: 43 },
      { label: "Kelas 2", laki: 44, perempuan: 46 },
      { label: "Kelas 3", laki: 43, perempuan: 41 },
      { label: "Kelas 4", laki: 40, perempuan: 45 },
      { label: "Kelas 5", laki: 42, perempuan: 39 },
      { label: "Kelas 6", laki: 38, perempuan: 42 },
    ],
  },
  {
    id: 3,
    nama: "SMP Smart School 1",
    jenjang: "SMP",
    alamat: "Jl. Kenanga No. 21, Jakarta Selatan",
    tingkat: [
      { label: "Kelas 7", laki: 128, perempuan: 120 },
      { label: "Kelas 8", laki: 122, perempuan: 118 },
      { label: "Kelas 9", laki: 119, perempuan: 127 },
    ],
  },
  {
    id: 4,
    nama: "SMP Smart School 2",
    jenjang: "SMP",
    alamat: "Jl. Mawar No. 5, Jakarta Barat",
    tingkat: [
      { label: "Kelas 7", laki: 115, perempuan: 110 },
      { label: "Kelas 8", laki: 108, perempuan: 116 },
      { label: "Kelas 9", laki: 112, perempuan: 118 },
    ],
  },
  {
    id: 5,
    nama: "SMA Smart School 1",
    jenjang: "SMA",
    alamat: "Jl. Dahlia No. 3, Jakarta Selatan",
    tingkat: [
      { label: "Kelas 10", laki: 140, perempuan: 132 },
      { label: "Kelas 11", laki: 135, perempuan: 138 },
      { label: "Kelas 12", laki: 130, perempuan: 137 },
    ],
  },
  {
    id: 6,
    nama: "SMA Smart School 2",
    jenjang: "SMA",
    alamat: "Jl. Cempaka No. 17, Jakarta Utara",
    tingkat: [
      { label: "Kelas 10", laki: 152, perempuan: 148 },
      { label: "Kelas 11", laki: 149, perempuan: 155 },
      { label: "Kelas 12", laki: 156, perempuan: 157 },
    ],
  },
];

// ============================================================
// HELPERS
// ============================================================

const totalSekolah = (s) =>
  s.tingkat.reduce((acc, t) => acc + t.laki + t.perempuan, 0);

const totalLaki = (s) =>
  s.tingkat.reduce((acc, t) => acc + t.laki, 0);

const totalPerempuan = (s) =>
  s.tingkat.reduce((acc, t) => acc + t.perempuan, 0);

// ============================================================
// THEME HELPERS
// ============================================================

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

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
// MAIN COMPONENT
// ============================================================

export default function DataSiswaPage() {
  const router = useRouter();

  const [jenjang, setJenjang] = useState(JENJANG_OPTIONS[0]);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  // ============================================================
  // FILTER
  // ============================================================

  const filteredSekolah = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return dataSekolah.filter((s) => {
      const matchJenjang =
        jenjang === "Semua Jenjang" || s.jenjang === jenjang;

      const matchSearch =
        !keyword || s.nama.toLowerCase().includes(keyword);

      return matchJenjang && matchSearch;
    });
  }, [jenjang, search]);

  // ============================================================
  // SUMMARY
  // ============================================================

  const summary = useMemo(() => {
    const totalSiswa = filteredSekolah.reduce(
      (acc, s) => acc + totalSekolah(s),
      0
    );

    const totalUnit = filteredSekolah.length;

    const laki = filteredSekolah.reduce(
      (acc, s) => acc + totalLaki(s),
      0
    );

    const perempuan = filteredSekolah.reduce(
      (acc, s) => acc + totalPerempuan(s),
      0
    );

    return {
      totalSiswa,
      totalUnit,
      laki,
      perempuan,
    };
  }, [filteredSekolah]);

  // ============================================================
  // ACCORDION
  // ============================================================

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
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
              <button
                type="button"
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
                    ${themePrimaryGradient}
                    text-[var(--color-card)]
                    ${themeSmallShadow}
                    flex-shrink-0
                  `}
                >
                  <Users size={18} />
                </div>

                <h1 className="text-xl sm:text-2xl font-semibold theme-text truncate">
                  Data Siswa
                </h1>
              </div>

              <p className="theme-text-secondary text-sm mt-1 ml-[42px] flex items-center gap-1.5">
                <Sparkles
                  size={14}
                  className="text-[var(--color-primary)] flex-shrink-0"
                />

                <span className="truncate">
                  Total siswa per unit sekolah — klik untuk lihat rincian per tingkat.
                </span>
              </p>
            </div>

            <button
              type="button"
              className="
                inline-flex items-center justify-center gap-2
                px-4 py-2.5
                text-sm font-medium
                rounded-lg
                bg-[var(--color-primary)]
                text-[var(--color-card)]
                hover:bg-[color-mix(in_srgb,var(--color-primary)_88%,var(--color-text))]
                transition-colors
                shadow-[0_4px_12px_color-mix(in_srgb,var(--color-primary)_16%,transparent)]
                whitespace-nowrap
                flex-shrink-0
              "
            >
              <UserPlus size={16} />
              Tambah Siswa
            </button>
          </div>

          {/* ==================================================
              FILTER BAR
          ================================================== */}

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
                    absolute left-3 top-1/2 -translate-y-1/2
                    text-[var(--color-text-muted)]
                  "
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama sekolah..."
                  className={`
                    theme-input
                    w-full
                    pl-9 pr-3
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

              <div className="relative flex-1 min-w-[160px]">
                <select
                  value={jenjang}
                  onChange={(e) => setJenjang(e.target.value)}
                  className={`
                    theme-input
                    w-full
                    appearance-none
                    pl-3 pr-9
                    py-2.5
                    text-sm font-medium
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
                    absolute right-3 top-1/2 -translate-y-1/2
                    text-[var(--color-text-muted)]
                    pointer-events-none
                  "
                />
              </div>
            </div>
          </div>

          {/* ==================================================
              SUMMARY CARDS
          ================================================== */}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

            {/* TOTAL SISWA */}

            <div
              className={`
                theme-card
                rounded-xl
                border theme-border
                p-3.5
                ${themeCardShadow}
                flex items-center gap-3
                min-w-0
              `}
            >
              <div
                className={`
                  p-2 rounded-lg border
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
                  Total Siswa
                </p>

                <p className="text-lg font-bold theme-text">
                  {summary.totalSiswa.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            {/* UNIT SEKOLAH */}

            <div
              className={`
                theme-card
                rounded-xl
                border theme-border
                p-3.5
                ${themeCardShadow}
                flex items-center gap-3
                min-w-0
              `}
            >
              <div
                className="
                  p-2 rounded-lg border
                  bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)]
                  border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]
                  text-[var(--color-info)]
                  flex-shrink-0
                "
              >
                <School size={16} />
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

            {/* LAKI-LAKI */}

            <div
              className={`
                theme-card
                rounded-xl
                border theme-border
                p-3.5
                ${themeCardShadow}
                flex items-center gap-3
                min-w-0
              `}
            >
              <div
                className="
                  p-2 rounded-lg border
                  bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)]
                  border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]
                  text-[var(--color-info)]
                  flex-shrink-0
                "
              >
                <Mars size={16} />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wider truncate">
                  Siswa Laki-laki
                </p>

                <p className="text-lg font-bold theme-text">
                  {summary.laki.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            {/* PEREMPUAN */}

            <div
              className={`
                theme-card
                rounded-xl
                border theme-border
                p-3.5
                ${themeCardShadow}
                flex items-center gap-3
                min-w-0
              `}
            >
              <div
                className="
                  p-2 rounded-lg border
                  bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]
                  border-[color-mix(in_srgb,var(--color-warning)_22%,transparent)]
                  text-[var(--color-warning)]
                  flex-shrink-0
                "
              >
                <Venus size={16} />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wider truncate">
                  Siswa Perempuan
                </p>

                <p className="text-lg font-bold theme-text">
                  {summary.perempuan.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>

          {/* ==================================================
              DAFTAR SEKOLAH
          ================================================== */}

          <div className="space-y-3">

            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold theme-text">
                Per Unit Sekolah
              </h3>

              <span className="text-xs theme-text-muted">
                {filteredSekolah.length} unit
              </span>
            </div>

            {/* EMPTY STATE */}

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
                <Users
                  size={28}
                  className="
                    mx-auto
                    text-[var(--color-text-placeholder)]
                    mb-2
                  "
                />

                <p className="text-sm theme-text-muted">
                  Tidak ada sekolah yang cocok.
                </p>
              </div>
            ) : (
              filteredSekolah.map((s) => {
                const total = totalSekolah(s);
                const isOpen = expandedId === s.id;

                return (
                  <div
                    key={s.id}
                    className={`
                      theme-card
                      rounded-xl
                      border theme-border
                      ${themeCardShadow}
                      overflow-hidden
                    `}
                  >
                    {/* ==================================================
                        HEADER SEKOLAH
                    ================================================== */}

                    <button
                      type="button"
                      onClick={() => toggleExpand(s.id)}
                      className={`
                        w-full
                        flex items-center justify-between
                        gap-3
                        p-4 sm:p-5
                        ${themeNeutralHover}
                        transition-colors
                        text-left
                      `}
                    >
                      <div className="flex items-center gap-3 min-w-0">

                        {/* SCHOOL ICON */}

                        <div
                          className={`
                            p-2.5 rounded-lg border
                            ${themePrimarySoft}
                            ${themePrimarySoftBorder}
                            text-[var(--color-primary)]
                            flex-shrink-0
                          `}
                        >
                          <School size={17} />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">

                            <p className="text-sm font-semibold theme-text truncate">
                              {s.nama}
                            </p>

                            <span
                              className="
                                text-[10px]
                                font-medium
                                px-2 py-0.5
                                rounded-full
                                border
                                bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]
                                border-[color-mix(in_srgb,var(--color-text)_12%,transparent)]
                                text-[var(--color-text-muted)]
                                flex-shrink-0
                              "
                            >
                              {s.jenjang}
                            </span>
                          </div>

                          <p className="text-xs theme-text-muted truncate flex items-center gap-1 mt-0.5">
                            <MapPin size={11} className="flex-shrink-0" />
                            {s.alamat}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0">

                        {/* GENDER SUMMARY */}

                        <div className="hidden sm:flex items-center gap-3 text-xs theme-text-secondary">
                          <span className="flex items-center gap-1">
                            <Mars
                              size={12}
                              className="text-[var(--color-info)]"
                            />
                            {totalLaki(s)}
                          </span>

                          <span className="flex items-center gap-1">
                            <Venus
                              size={12}
                              className="text-[var(--color-warning)]"
                            />
                            {totalPerempuan(s)}
                          </span>
                        </div>

                        {/* TOTAL */}

                        <div className="text-right">
                          <span className="text-base font-bold theme-text">
                            {total.toLocaleString("id-ID")}
                          </span>

                          <span className="text-xs theme-text-muted ml-1">
                            siswa
                          </span>
                        </div>

                        <ChevronRight
                          size={16}
                          className={`
                            text-[var(--color-text-muted)]
                            transition-transform
                            flex-shrink-0
                            ${isOpen ? "rotate-90" : ""}
                          `}
                        />
                      </div>
                    </button>

                    {/* ==================================================
                        DETAIL PER TINGKAT
                    ================================================== */}

                    {isOpen && (
                      <div
                        className={`
                          border-t
                          ${themeDivider}
                          bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)]
                        `}
                      >
                        <div className="overflow-x-auto w-full">
                          <table className="w-full min-w-[480px] text-sm border-collapse">

                            <thead>
                              <tr
                                className="
                                  bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]
                                "
                              >
                                <th
                                  className="
                                    border
                                    border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]
                                    text-left
                                    font-medium
                                    theme-text-muted
                                    text-xs
                                    uppercase
                                    tracking-wider
                                    px-4 sm:px-5
                                    py-2.5
                                    whitespace-nowrap
                                  "
                                >
                                  Tingkat
                                </th>

                                <th
                                  className="
                                    border
                                    border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]
                                    text-center
                                    font-medium
                                    theme-text-muted
                                    text-xs
                                    uppercase
                                    tracking-wider
                                    px-3
                                    py-2.5
                                    whitespace-nowrap
                                  "
                                >
                                  Laki-laki
                                </th>

                                <th
                                  className="
                                    border
                                    border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]
                                    text-center
                                    font-medium
                                    theme-text-muted
                                    text-xs
                                    uppercase
                                    tracking-wider
                                    px-3
                                    py-2.5
                                    whitespace-nowrap
                                  "
                                >
                                  Perempuan
                                </th>

                                <th
                                  className="
                                    border
                                    border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]
                                    text-center
                                    font-medium
                                    theme-text-muted
                                    text-xs
                                    uppercase
                                    tracking-wider
                                    px-3
                                    py-2.5
                                    whitespace-nowrap
                                  "
                                >
                                  Total
                                </th>
                              </tr>
                            </thead>

                            <tbody
                              className="
                                divide-y
                                divide-[color-mix(in_srgb,var(--color-text)_8%,transparent)]
                                theme-card
                              "
                            >
                              {s.tingkat.map((t, i) => (
                                <tr
                                  key={i}
                                  className={`
                                    ${themeNeutralHover}
                                    transition-colors
                                  `}
                                >
                                  <td
                                    className="
                                      border
                                      border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]
                                      px-4 sm:px-5
                                      py-2.5
                                      whitespace-nowrap
                                    "
                                  >
                                    <span className="text-sm font-medium theme-text">
                                      {t.label}
                                    </span>
                                  </td>

                                  <td
                                    className="
                                      border
                                      border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]
                                      px-3
                                      py-2.5
                                      text-center
                                      theme-text-secondary
                                      whitespace-nowrap
                                    "
                                  >
                                    {t.laki}
                                  </td>

                                  <td
                                    className="
                                      border
                                      border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]
                                      px-3
                                      py-2.5
                                      text-center
                                      theme-text-secondary
                                      whitespace-nowrap
                                    "
                                  >
                                    {t.perempuan}
                                  </td>

                                  <td
                                    className="
                                      border
                                      border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]
                                      px-3
                                      py-2.5
                                      text-center
                                      whitespace-nowrap
                                    "
                                  >
                                    <span className="text-sm font-semibold theme-text">
                                      {t.laki + t.perempuan}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>

                            {/* TOTAL */}

                            <tfoot>
                              <tr
                                className="
                                  bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]
                                "
                              >
                                <td
                                  className="
                                    border
                                    border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]
                                    px-4 sm:px-5
                                    py-2.5
                                    text-sm
                                    font-semibold
                                    theme-text-secondary
                                  "
                                >
                                  Total {s.nama}
                                </td>

                                <td
                                  className="
                                    border
                                    border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]
                                    px-3
                                    py-2.5
                                    text-center
                                    text-sm
                                    font-semibold
                                    theme-text-secondary
                                  "
                                >
                                  {totalLaki(s)}
                                </td>

                                <td
                                  className="
                                    border
                                    border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]
                                    px-3
                                    py-2.5
                                    text-center
                                    text-sm
                                    font-semibold
                                    theme-text-secondary
                                  "
                                >
                                  {totalPerempuan(s)}
                                </td>

                                <td
                                  className="
                                    border
                                    border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]
                                    px-3
                                    py-2.5
                                    text-center
                                    text-sm
                                    font-bold
                                    theme-text
                                  "
                                >
                                  {total}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}