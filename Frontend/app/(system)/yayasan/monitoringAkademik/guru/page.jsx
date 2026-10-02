"use client";

import { useState } from "react";
import {
  Search,
  Download,
  GraduationCap,
  Mail,
  Phone,
} from "lucide-react";

// ============================================================
// DUMMY DATA
// Catatan: ganti dengan data asli dari API/DB begitu tersedia.
// ============================================================

const dummyGuru = [
  {
    id: 1,
    nama: "Siti Aminah",
    nip: "198501012010012001",
    mapel: "Matematika",
    sekolah: "SMA Harapan 1",
    status: "Aktif",
    email: "siti.aminah@smartschool.com",
    telp: "0812-3456-7890",
  },
  {
    id: 2,
    nama: "Budi Santoso",
    nip: "198703152011011002",
    mapel: "Bahasa Indonesia",
    sekolah: "SMA Harapan 1",
    status: "Aktif",
    email: "budi.santoso@smartschool.com",
    telp: "0813-4567-8901",
  },
  {
    id: 3,
    nama: "Dewi Lestari",
    nip: "199002202012012003",
    mapel: "Fisika",
    sekolah: "SMA Harapan 2",
    status: "Aktif",
    email: "dewi.lestari@smartschool.com",
    telp: "0814-5678-9012",
  },
  {
    id: 4,
    nama: "Ahmad Fauzi",
    nip: "198812252013011004",
    mapel: "Bahasa Inggris",
    sekolah: "SMA Harapan 2",
    status: "Cuti",
    email: "ahmad.fauzi@smartschool.com",
    telp: "0815-6789-0123",
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

const themePrimaryHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

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
// MAIN COMPONENT
// ============================================================

export default function LaporanGuruPage() {
  const [search, setSearch] = useState("");

  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredGuru = dummyGuru.filter(
    (g) =>
      g.nama.toLowerCase().includes(search.toLowerCase()) ||
      g.mapel.toLowerCase().includes(search.toLowerCase()) ||
      g.sekolah.toLowerCase().includes(search.toLowerCase())
  );

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const totalGuru = dummyGuru.length;

  const guruAktif = dummyGuru.filter(
    (g) => g.status === "Aktif"
  ).length;

  const guruCuti = dummyGuru.filter(
    (g) => g.status === "Cuti"
  ).length;

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="w-full max-w-[1800px] mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 space-y-6">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0">
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
                <GraduationCap size={18} />
              </div>

              <h1 className="text-xl sm:text-2xl font-semibold theme-text truncate">
                Laporan Guru
              </h1>
            </div>

            <p className="text-sm theme-text-secondary mt-1 ml-[42px]">
              Data dan status guru di seluruh sekolah
            </p>
          </div>

          {/* Export */}
          <button
            type="button"
            className={`
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-lg
              px-4
              py-2
              text-sm
              font-medium
              bg-[var(--color-primary)]
              text-[var(--color-card)]
              hover:bg-[color-mix(in_srgb,var(--color-primary)_88%,black)]
              ${themePrimaryShadow}
              transition-colors
              shrink-0
            `}
          >
            <Download className="h-4 w-4" />
            Ekspor Data
          </button>
        </div>

        {/* =====================================================
            SUMMARY
        ===================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

          {/* Total Guru */}
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
            <div className="flex items-center gap-3">
              <div
                className={`
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  ${themePrimarySoft}
                  text-[var(--color-primary)]
                `}
              >
                <GraduationCap size={18} />
              </div>

              <div>
                <p className="text-sm theme-text-secondary">
                  Total Guru
                </p>

                <p className="mt-1 text-2xl font-semibold theme-text">
                  {totalGuru}
                </p>
              </div>
            </div>
          </div>

          {/* Guru Aktif */}
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
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]
                  text-[var(--color-success)]
                "
              >
                <GraduationCap size={18} />
              </div>

              <div>
                <p className="text-sm theme-text-secondary">
                  Guru Aktif
                </p>

                <p className="mt-1 text-2xl font-semibold text-[var(--color-success)]">
                  {guruAktif}
                </p>
              </div>
            </div>
          </div>

          {/* Guru Cuti */}
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
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]
                  text-[var(--color-warning)]
                "
              >
                <GraduationCap size={18} />
              </div>

              <div>
                <p className="text-sm theme-text-secondary">
                  Guru Cuti
                </p>

                <p className="mt-1 text-2xl font-semibold text-[var(--color-warning)]">
                  {guruCuti}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            SEARCH
        ===================================================== */}

        <div className="relative max-w-sm">
          <Search
            className="
              absolute
              left-3
              top-1/2
              h-4
              w-4
              -translate-y-1/2
              theme-text-muted
            "
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, mapel, atau sekolah..."
            className={`
              w-full
              rounded-lg
              border
              theme-border
              theme-card
              py-2
              pl-9
              pr-3
              text-sm
              theme-text-secondary
              outline-none
              transition-colors
              ${themeFocus}
              placeholder:text-[var(--color-text-placeholder)]
            `}
          />
        </div>

        {/* =====================================================
            TABLE
        ===================================================== */}

        <div
          className={`
            overflow-hidden
            rounded-xl
            border
            theme-border
            theme-card
            ${themeCardShadow}
          `}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">

              {/* Table Header */}
              <thead
                className={`
                  ${themeNeutralSurface}
                  theme-text-secondary
                  text-xs
                  uppercase
                `}
              >
                <tr>
                  <th className="px-4 py-3 font-semibold">
                    Nama
                  </th>

                  <th className="px-4 py-3 font-semibold">
                    NIP
                  </th>

                  <th className="px-4 py-3 font-semibold">
                    Mata Pelajaran
                  </th>

                  <th className="px-4 py-3 font-semibold">
                    Sekolah
                  </th>

                  <th className="px-4 py-3 font-semibold">
                    Kontak
                  </th>

                  <th className="px-4 py-3 font-semibold">
                    Status
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {filteredGuru.map((g, index) => (
                  <tr
                    key={g.id}
                    className={`
                      ${themeNeutralHover}
                      transition-colors
                      ${
                        index !== filteredGuru.length - 1
                          ? `border-b ${themeDivider}`
                          : ""
                      }
                    `}
                  >
                    {/* Nama */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">

                        <div
                          className={`
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            ${themePrimarySoft}
                            text-[var(--color-primary)]
                          `}
                        >
                          <GraduationCap className="h-4 w-4" />
                        </div>

                        <span className="font-medium theme-text">
                          {g.nama}
                        </span>
                      </div>
                    </td>

                    {/* NIP */}
                    <td className="px-4 py-3 theme-text-secondary">
                      {g.nip}
                    </td>

                    {/* Mapel */}
                    <td className="px-4 py-3 theme-text-secondary">
                      {g.mapel}
                    </td>

                    {/* Sekolah */}
                    <td className="px-4 py-3 theme-text-secondary">
                      {g.sekolah}
                    </td>

                    {/* Kontak */}
                    <td className="px-4 py-3 theme-text-secondary">
                      <div className="flex flex-col gap-1 text-xs">

                        <span className="flex items-center gap-1.5">
                          <Mail
                            className="
                              h-3
                              w-3
                              shrink-0
                              theme-text-muted
                            "
                          />

                          <span className="truncate">
                            {g.email}
                          </span>
                        </span>

                        <span className="flex items-center gap-1.5">
                          <Phone
                            className="
                              h-3
                              w-3
                              shrink-0
                              theme-text-muted
                            "
                          />

                          <span>
                            {g.telp}
                          </span>
                        </span>

                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span
                        className={`
                          inline-flex
                          rounded-full
                          px-2
                          py-1
                          text-xs
                          font-medium
                          ${
                            g.status === "Aktif"
                              ? `
                                bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]
                                text-[var(--color-success)]
                              `
                              : `
                                bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)]
                                text-[var(--color-warning)]
                              `
                          }
                        `}
                      >
                        {g.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {/* Empty State */}
                {filteredGuru.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center"
                    >
                      <div
                        className={`
                          mx-auto
                          flex
                          h-10
                          w-10
                          items-center
                          justify-center
                          rounded-full
                          ${themeNeutralSurface}
                          theme-text-muted
                        `}
                      >
                        <Search size={18} />
                      </div>

                      <p className="mt-3 text-sm theme-text-muted">
                        Tidak ada data guru yang cocok.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}