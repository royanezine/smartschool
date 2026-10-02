"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "../../../../lib/api";

import {
  School,
  Search,
  ChevronDown,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  Users,
  BadgeCheck,
} from "lucide-react";

// ============================================================
// STATUS OPTIONS
// ============================================================

const STATUS_OPTIONS = ["Semua Status", "aktif", "uji coba"];

// ============================================================
// THEME HELPERS
// ============================================================

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

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

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function DataMasterSekolahPage() {
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);
  const [search, setSearch] = useState("");

  const [dataSekolah, setDataSekolah] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ==========================================================
  // FETCH DATA
  // ==========================================================

  useEffect(() => {
    async function fetchSekolah() {
      try {
        setLoading(true);
        setError(null);

        const res = await apiFetch("/yayasan/sekolah");

        if (res) {
          setDataSekolah(res.data || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSekolah();
  }, []);

  // ==========================================================
  // FILTER DATA
  // ==========================================================

  const filteredSekolah = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return dataSekolah.filter((s) => {
      const matchStatus =
        status === "Semua Status" || s.status === status;

      const matchSearch =
        !keyword ||
        s.nama?.toLowerCase().includes(keyword) ||
        s.subdomain?.toLowerCase().includes(keyword);

      return matchStatus && matchSearch;
    });
  }, [dataSekolah, status, search]);

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const summary = useMemo(() => {
    const totalUnit = filteredSekolah.length;

    const totalAktif = filteredSekolah.filter(
      (s) => s.status === "aktif"
    ).length;

    const totalUjiCoba = filteredSekolah.filter(
      (s) => s.status === "uji coba"
    ).length;

    return {
      totalUnit,
      totalAktif,
      totalUjiCoba,
    };
  }, [filteredSekolah]);

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="w-full max-w-[1500px] mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="w-full space-y-6">

          {/* ================================================== */}
          {/* PAGE HEADER */}
          {/* ================================================== */}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="mb-1 text-xs font-medium theme-text-muted">
                Data Master
              </p>

              <div className="flex items-center gap-2.5">
                <div
                  className={`
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    border
                    ${themePrimarySoftBorder}
                    ${themePrimarySoft}
                    text-[var(--color-primary)]
                    ${themeSmallShadow}
                  `}
                >
                  <School size={18} />
                </div>

                <h1 className="truncate text-xl font-semibold theme-text sm:text-2xl">
                  Data Sekolah
                </h1>
              </div>

              <p className="mt-1 ml-[42px] flex items-center gap-1.5 text-sm theme-text-secondary">
                <Sparkles
                  size={14}
                  className="shrink-0 theme-text-muted"
                />

                <span className="truncate">
                  Kelola data unit sekolah di lingkungan yayasan.
                </span>
              </p>
            </div>
          </div>

          {/* ================================================== */}
          {/* ERROR */}
          {/* ================================================== */}

          {error && (
            <div
              className={`
                rounded-xl
                border
                ${themeWarningBorder}
                ${themeWarningSurface}
                p-3
                text-sm
                text-[var(--color-warning)]
              `}
            >
              Gagal memuat data sekolah: {error}
            </div>
          )}

          {/* ================================================== */}
          {/* FILTER BAR */}
          {/* ================================================== */}

          <div
            className={`
              theme-card
              rounded-xl
              border
              theme-border
              ${themeCardShadow}
              p-4
            `}
          >
            <div className="flex flex-col flex-wrap gap-3 sm:flex-row">

              {/* SEARCH */}
              <div className="relative min-w-[200px] flex-1">
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
                  placeholder="Cari nama sekolah atau subdomain..."
                  className={`
                    w-full
                    rounded-lg
                    border
                    theme-border
                    ${themeNeutralSurface}
                    py-2.5
                    pl-9
                    pr-3
                    text-sm
                    theme-text
                    outline-none
                    transition-colors
                    placeholder:text-[var(--color-text-placeholder)]
                    ${themeFocus}
                  `}
                />
              </div>

              {/* STATUS */}
              <div className="relative min-w-[160px] flex-1">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={`
                    w-full
                    cursor-pointer
                    appearance-none
                    rounded-lg
                    border
                    theme-border
                    ${themeNeutralSurface}
                    py-2.5
                    pl-3
                    pr-9
                    text-sm
                    font-medium
                    theme-text
                    outline-none
                    transition-colors
                    capitalize
                    ${themeFocus}
                  `}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option
                      key={s}
                      value={s}
                      className="capitalize"
                    >
                      {s}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={14}
                  className="
                    pointer-events-none
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    theme-text-muted
                  "
                />
              </div>
            </div>
          </div>

          {/* ================================================== */}
          {/* SUMMARY CARDS */}
          {/* ================================================== */}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

            <SummaryCard
              icon={School}
              label="Total Unit Sekolah"
              value={loading ? "-" : summary.totalUnit}
              variant="primary"
            />

            <SummaryCard
              icon={BadgeCheck}
              label="Sekolah Aktif"
              value={loading ? "-" : summary.totalAktif}
              variant="success"
            />

            <SummaryCard
              icon={Users}
              label="Sekolah Uji Coba"
              value={loading ? "-" : summary.totalUjiCoba}
              variant="warning"
            />

          </div>

          {/* ================================================== */}
          {/* SCHOOL LIST */}
          {/* ================================================== */}

          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold theme-text">
                Daftar Unit Sekolah
              </h3>

              <span className="text-xs theme-text-muted">
                {loading
                  ? "Memuat..."
                  : `${filteredSekolah.length} sekolah`}
              </span>
            </div>

            {/* ================================================= */}
            {/* LOADING */}
            {/* ================================================= */}

            {loading ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className={`
                      h-40
                      animate-pulse
                      rounded-xl
                      border
                      theme-border
                      ${themeNeutralSurface}
                      ${themeSmallShadow}
                    `}
                  />
                ))}
              </div>
            ) : filteredSekolah.length === 0 ? (

              /* =============================================== */
              /* EMPTY STATE */
              /* =============================================== */

              <div
                className={`
                  theme-card
                  rounded-xl
                  border
                  theme-border
                  ${themeCardShadow}
                  p-10
                  text-center
                `}
              >
                <div
                  className={`
                    mx-auto
                    mb-3
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-xl
                    border
                    ${themeNeutralBorder}
                    ${themeNeutralSurface}
                    theme-text-muted
                  `}
                >
                  <School size={25} />
                </div>

                <p className="text-sm theme-text-muted">
                  Tidak ada sekolah yang cocok.
                </p>
              </div>

            ) : (

              /* =============================================== */
              /* SCHOOL CARDS */
              /* =============================================== */

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {filteredSekolah.map((s) => {
                  const langganan =
                    s.langgananSekolah?.[0];

                  return (
                    <Link
                      key={s.id}
                      href={`/yayasan/sekolah/${s.id}`}
                      className={`
                        theme-card
                        group
                        flex
                        flex-col
                        overflow-hidden
                        rounded-xl
                        border
                        theme-border
                        ${themeCardShadow}
                        transition-all
                        hover:border-[color-mix(in_srgb,var(--color-primary)_28%,var(--color-border))]
                        hover:shadow-[0_10px_30px_color-mix(in_srgb,var(--color-text)_9%,transparent)]
                      `}
                    >

                      {/* ====================================== */}
                      {/* CARD HEADER */}
                      {/* ====================================== */}

                      <div
                        className={`
                          flex
                          items-start
                          justify-between
                          gap-3
                          border-b
                          ${themeDivider}
                          p-4
                          sm:p-5
                        `}
                      >
                        <div className="flex min-w-0 items-start gap-3">

                          {/* SCHOOL ICON */}
                          <div
                            className={`
                              flex
                              h-11
                              w-11
                              shrink-0
                              items-center
                              justify-center
                              rounded-lg
                              border
                              ${themePrimarySoftBorder}
                              ${themePrimarySoft}
                              text-[var(--color-primary)]
                              transition-transform
                              group-hover:scale-[1.03]
                            `}
                          >
                            <School size={19} />
                          </div>

                          {/* SCHOOL INFO */}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold theme-text">
                              {s.nama}
                            </p>

                            <p className="truncate text-xs theme-text-muted">
                              {s.subdomain}
                            </p>

                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">

                              {/* STATUS */}
                              <span
                                className={`
                                  rounded-full
                                  border
                                  px-2
                                  py-0.5
                                  text-[10px]
                                  font-medium
                                  capitalize
                                  ${
                                    s.status === "aktif"
                                      ? `${themeSuccessSurface} ${themeSuccessBorder} text-[var(--color-success)]`
                                      : `${themeWarningSurface} ${themeWarningBorder} text-[var(--color-warning)]`
                                  }
                                `}
                              >
                                {s.status}
                              </span>

                              {/* PACKAGE */}
                              {langganan?.paket?.nama && (
                                <span
                                  className={`
                                    rounded-full
                                    border
                                    ${themePrimarySoftBorder}
                                    ${themePrimarySoft}
                                    px-2
                                    py-0.5
                                    text-[10px]
                                    font-medium
                                    text-[var(--color-primary)]
                                  `}
                                >
                                  {langganan.paket.nama}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ====================================== */}
                      {/* CARD DETAILS */}
                      {/* ====================================== */}

                      <div className="flex-1 space-y-2.5 p-4 sm:p-5">

                        {/* PHONE */}
                        <div className="flex items-center gap-2 text-xs theme-text-secondary">
                          <Phone
                            size={13}
                            className="shrink-0 theme-text-muted"
                          />

                          <span className="truncate">
                            {s.telepon || "-"}
                          </span>
                        </div>

                        {/* EMAIL */}
                        <div className="flex items-center gap-2 text-xs theme-text-secondary">
                          <Mail
                            size={13}
                            className="shrink-0 theme-text-muted"
                          />

                          <span className="truncate">
                            {s.email || "-"}
                          </span>
                        </div>

                        {/* SUBSCRIPTION END */}
                        {langganan?.tanggalBerakhir && (
                          <div className="flex items-center gap-2 text-xs theme-text-secondary">
                            <MapPin
                              size={13}
                              className="shrink-0 theme-text-muted"
                            />

                            <span className="truncate">
                              Langganan berakhir{" "}
                              {new Date(
                                langganan.tanggalBerakhir
                              ).toLocaleDateString("id-ID")}
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SUMMARY CARD
// ============================================================

function SummaryCard({
  icon: Icon,
  label,
  value,
  variant = "primary",
}) {
  const variantMap = {
    primary: {
      bg: "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]",
      border:
        "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]",
      text: "text-[var(--color-primary)]",
    },

    success: {
      bg: "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]",
      border:
        "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]",
      text: "text-[var(--color-success)]",
    },

    warning: {
      bg: "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]",
      border:
        "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]",
      text: "text-[var(--color-warning)]",
    },
  };

  const styles = variantMap[variant] || variantMap.primary;

  return (
    <div
      className={`
        theme-card
        flex
        min-w-0
        items-center
        gap-3
        rounded-xl
        border
        theme-border
        ${themeCardShadow}
        p-3.5
      `}
    >
      <div
        className={`
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-lg
          border
          ${styles.bg}
          ${styles.border}
          ${styles.text}
        `}
      >
        <Icon size={16} />
      </div>

      <div className="min-w-0">
        <p
          className="
            truncate
            text-[11px]
            font-medium
            uppercase
            tracking-wider
            theme-text-muted
          "
        >
          {label}
        </p>

        <p className="text-lg font-bold theme-text">
          {value}
        </p>
      </div>
    </div>
  );
}