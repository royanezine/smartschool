"use client";

import { useState } from "react";
import {
  Search,
  MapPin,
  Phone,
  Users,
  ExternalLink,
  Building2,
  GraduationCap,
} from "lucide-react";

// ============================================================
// DUMMY DATA
// Catatan: ganti dengan data asli dari API/DB begitu tersedia.
// ============================================================

const dummySekolah = [
  {
    id: 1,
    nama: "SMA Harapan 1",
    alamat: "Jl. Kemerdekaan No. 45, Jakarta Pusat",
    telp: "021-5551234",
    jumlahSiswa: 480,
    jumlahGuru: 32,
    lat: -6.1751,
    lng: 106.865,
  },
  {
    id: 2,
    nama: "SMA Harapan 2",
    alamat: "Jl. Sudirman No. 88, Jakarta Selatan",
    telp: "021-5555678",
    jumlahSiswa: 512,
    jumlahGuru: 35,
    lat: -6.2088,
    lng: 106.8228,
  },
  {
    id: 3,
    nama: "SMP Harapan Bangsa",
    alamat: "Jl. Diponegoro No. 12, Jakarta Timur",
    telp: "021-5559012",
    jumlahSiswa: 390,
    jumlahGuru: 28,
    lat: -6.2251,
    lng: 106.9004,
  },
  {
    id: 4,
    nama: "SD Harapan Ceria",
    alamat: "Jl. Cendrawasih No. 7, Jakarta Barat",
    telp: "021-5553456",
    jumlahSiswa: 350,
    jumlahGuru: 24,
    lat: -6.1683,
    lng: 106.7588,
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

export default function LokasiSekolahPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(dummySekolah[0]);

  // ==========================================================
  // FILTER SEKOLAH
  // ==========================================================

  const filtered = dummySekolah.filter(
    (s) =>
      s.nama.toLowerCase().includes(search.toLowerCase()) ||
      s.alamat.toLowerCase().includes(search.toLowerCase())
  );

  // ==========================================================
  // GOOGLE MAPS
  // ==========================================================

  const mapSrc = `https://www.google.com/maps?q=${selected.lat},${selected.lng}&z=15&output=embed`;

  const mapLink = `https://www.google.com/maps?q=${selected.lat},${selected.lng}`;

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const totalSiswa = dummySekolah.reduce(
    (total, sekolah) => total + sekolah.jumlahSiswa,
    0
  );

  const totalGuru = dummySekolah.reduce(
    (total, sekolah) => total + sekolah.jumlahGuru,
    0
  );

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="w-full max-w-[1800px] mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 space-y-6">

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <div>
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
              <MapPin size={18} />
            </div>

            <h1 className="text-xl sm:text-2xl font-semibold theme-text">
              Lokasi Sekolah
            </h1>
          </div>

          <p className="text-sm theme-text-secondary mt-1 ml-[42px]">
            Peta lokasi seluruh sekolah yang dinaungi yayasan
          </p>
        </div>

        {/* =====================================================
            SUMMARY CARDS
        ===================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

          {/* Total Sekolah */}
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
                <Building2 size={18} />
              </div>

              <div className="min-w-0">
                <p className="text-sm theme-text-secondary">
                  Total Sekolah
                </p>

                <p className="mt-0.5 text-2xl font-bold theme-text">
                  {dummySekolah.length}
                </p>
              </div>
            </div>
          </div>

          {/* Total Siswa */}
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
                  bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)]
                  text-[var(--color-info)]
                "
              >
                <Users size={18} />
              </div>

              <div className="min-w-0">
                <p className="text-sm theme-text-secondary">
                  Total Siswa
                </p>

                <p className="mt-0.5 text-2xl font-bold text-[var(--color-info)]">
                  {totalSiswa}
                </p>
              </div>
            </div>
          </div>

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

              <div className="min-w-0">
                <p className="text-sm theme-text-secondary">
                  Total Guru
                </p>

                <p className="mt-0.5 text-2xl font-bold text-[var(--color-success)]">
                  {totalGuru}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            CONTENT
        ===================================================== */}

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ===================================================
              LIST SEKOLAH
          =================================================== */}

          <div className="lg:w-80 shrink-0 space-y-3">

            {/* Search */}
            <div className="relative">
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
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama atau alamat sekolah..."
                className={`
                  w-full
                  pl-9
                  pr-3
                  py-2.5
                  text-sm
                  theme-text-secondary
                  theme-card
                  border
                  theme-border
                  rounded-lg
                  outline-none
                  transition-colors
                  ${themeFocus}
                  placeholder:text-[var(--color-text-placeholder)]
                `}
              />
            </div>

            {/* School List */}
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">

              {filtered.map((s) => {
                const isActive = selected.id === s.id;

                return (
                  <button
                    key={s.id}
                    onClick={() => setSelected(s)}
                    type="button"
                    className={`
                      w-full
                      text-left
                      rounded-xl
                      border
                      p-3
                      transition-all
                      duration-200
                      ${
                        isActive
                          ? `${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryShadow}`
                          : `theme-border theme-card ${themeNeutralHover}`
                      }
                    `}
                  >
                    <div className="flex items-start gap-2">

                      {/* School Icon */}
                      <div
                        className={`
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-lg
                          ${
                            isActive
                              ? `${themePrimaryGradient} text-[var(--color-card)]`
                              : `${themeNeutralSurface} theme-text-muted`
                          }
                        `}
                      >
                        <Building2 size={16} />
                      </div>

                      {/* School Info */}
                      <div className="min-w-0">
                        <p
                          className={`
                            text-sm
                            font-semibold
                            truncate
                            ${
                              isActive
                                ? "text-[var(--color-primary)]"
                                : "theme-text"
                            }
                          `}
                        >
                          {s.nama}
                        </p>

                        <p className="text-xs theme-text-muted line-clamp-2">
                          {s.alamat}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* Empty State */}
              {filtered.length === 0 && (
                <div
                  className={`
                    theme-card
                    rounded-xl
                    border
                    theme-border
                    ${themeCardShadow}
                    p-8
                    text-center
                  `}
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

                  <p className="text-sm theme-text-muted mt-3">
                    Tidak ada sekolah yang cocok.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ===================================================
              MAP & DETAIL
          =================================================== */}

          <div className="flex-1 min-w-0 space-y-4">

            {/* Map */}
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
              <iframe
                title="Peta Lokasi Sekolah"
                src={mapSrc}
                className="h-80 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Detail */}
            <div
              className={`
                rounded-xl
                border
                theme-border
                theme-card
                p-5
                ${themeCardShadow}
              `}
            >
              <div className="flex items-start justify-between gap-3">

                {/* School Detail */}
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold theme-text truncate">
                    {selected.nama}
                  </h2>

                  <p className="mt-1 flex items-start gap-1.5 text-sm theme-text-secondary">
                    <MapPin
                      size={15}
                      className="mt-0.5 shrink-0 theme-text-muted"
                    />

                    <span>{selected.alamat}</span>
                  </p>
                </div>

                {/* Google Maps */}
                <a
                  href={mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`
                    flex
                    shrink-0
                    items-center
                    gap-1.5
                    rounded-lg
                    border
                    ${themePrimarySoftBorder}
                    px-3
                    py-1.5
                    text-xs
                    font-medium
                    text-[var(--color-primary)]
                    ${themePrimaryHover}
                    transition-colors
                  `}
                >
                  <ExternalLink size={14} />
                  <span className="hidden sm:inline">
                    Buka di Google Maps
                  </span>
                  <span className="sm:hidden">
                    Maps
                  </span>
                </a>
              </div>

              {/* Detail Stats */}
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">

                {/* Telepon */}
                <div
                  className={`
                    flex
                    items-center
                    gap-2
                    rounded-lg
                    border
                    ${themeNeutralBorder}
                    ${themeNeutralSurface}
                    p-3
                  `}
                >
                  <Phone
                    size={16}
                    className="theme-text-muted shrink-0"
                  />

                  <div className="min-w-0">
                    <p className="text-xs theme-text-muted">
                      Telepon
                    </p>

                    <p className="text-sm font-medium theme-text truncate">
                      {selected.telp}
                    </p>
                  </div>
                </div>

                {/* Jumlah Siswa */}
                <div
                  className={`
                    flex
                    items-center
                    gap-2
                    rounded-lg
                    border
                    ${themeNeutralBorder}
                    ${themeNeutralSurface}
                    p-3
                  `}
                >
                  <Users
                    size={16}
                    className="text-[var(--color-info)] shrink-0"
                  />

                  <div className="min-w-0">
                    <p className="text-xs theme-text-muted">
                      Jumlah Siswa
                    </p>

                    <p className="text-sm font-medium theme-text">
                      {selected.jumlahSiswa}
                    </p>
                  </div>
                </div>

                {/* Jumlah Guru */}
                <div
                  className={`
                    flex
                    items-center
                    gap-2
                    rounded-lg
                    border
                    ${themeNeutralBorder}
                    ${themeNeutralSurface}
                    p-3
                  `}
                >
                  <GraduationCap
                    size={16}
                    className="text-[var(--color-success)] shrink-0"
                  />

                  <div className="min-w-0">
                    <p className="text-xs theme-text-muted">
                      Jumlah Guru
                    </p>

                    <p className="text-sm font-medium theme-text">
                      {selected.jumlahGuru}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}