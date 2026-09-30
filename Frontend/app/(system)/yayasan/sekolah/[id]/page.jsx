"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "../../../../../lib/api";

import {
  School,
  ArrowLeft,
  Phone,
  Mail,
  Users,
  GraduationCap,
  Layers,
  BadgeCheck,
  Sparkles,
  CalendarClock,
} from "lucide-react";

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

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function DetailSekolahPage() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    async function fetchDetail() {
      try {
        setLoading(true);
        setError(null);

        const res = await apiFetch(`/yayasan/sekolah/${id}`);

        if (res) {
          setData(res.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [id]);

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="w-full max-w-[1500px] mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="w-full space-y-6">

          {/* ================================================== */}
          {/* BACK LINK */}
          {/* ================================================== */}

          <Link
            href="/yayasan/sekolah"
            className={`
              inline-flex items-center gap-1.5
              text-sm
              theme-text-secondary
              transition-colors
              hover:text-[var(--color-primary)]
            `}
          >
            <ArrowLeft size={15} />
            Kembali ke Daftar Sekolah
          </Link>

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
                px-4 py-3
                text-sm
                text-[var(--color-warning)]
              `}
            >
              Gagal memuat detail sekolah: {error}
            </div>
          )}

          {/* ================================================== */}
          {/* LOADING */}
          {/* ================================================== */}

          {loading && (
            <div className="space-y-6">
              {/* Header skeleton */}
              <div
                className={`
                  h-28
                  rounded-2xl
                  border
                  theme-border
                  ${themeNeutralSurface}
                  animate-pulse
                `}
              />

              {/* Stats skeleton */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`
                      h-24
                      rounded-xl
                      border
                      theme-border
                      ${themeNeutralSurface}
                      animate-pulse
                    `}
                  />
                ))}
              </div>

              {/* Content skeleton */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className={`
                      h-52
                      rounded-2xl
                      border
                      theme-border
                      ${themeNeutralSurface}
                      animate-pulse
                    `}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ================================================== */}
          {/* NOT FOUND */}
          {/* ================================================== */}

          {!loading && !error && !data && (
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
                <School size={24} />
              </div>

              <p className="text-sm theme-text-muted">
                Sekolah tidak ditemukan.
              </p>

              <Link
                href="/yayasan/sekolah"
                className={`
                  mt-4
                  inline-flex
                  items-center
                  gap-2
                  rounded-lg
                  bg-[var(--color-primary)]
                  px-4
                  py-2.5
                  text-xs
                  font-semibold
                  text-[var(--color-card)]
                  transition-all
                  hover:opacity-90
                  ${themeSmallShadow}
                `}
              >
                <ArrowLeft size={14} />
                Kembali ke Daftar Sekolah
              </Link>
            </div>
          )}

          {/* ================================================== */}
          {/* CONTENT */}
          {/* ================================================== */}

          {!loading &&
            !error &&
            data &&
            (() => {
              const { profil, statistik } = data;
              const langganan = profil.langgananSekolah?.[0];

              return (
                <>
                  {/* ========================================== */}
                  {/* PAGE HEADER */}
                  {/* ========================================== */}

                  <div
                    className={`
                      theme-card
                      rounded-2xl
                      border
                      theme-border
                      ${themeCardShadow}
                      p-5
                      sm:p-6
                    `}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 items-start gap-3.5">
                        {/* School Icon */}
                        <div
                          className={`
                            flex
                            h-14
                            w-14
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            border
                            ${themePrimarySoftBorder}
                            ${themePrimarySoft}
                            text-[var(--color-primary)]
                          `}
                        >
                          <School size={26} />
                        </div>

                        {/* School Identity */}
                        <div className="min-w-0">
                          <h1 className="truncate text-xl font-semibold theme-text sm:text-2xl">
                            {profil.nama}
                          </h1>

                          <p className="mt-0.5 truncate text-sm theme-text-muted">
                            {profil.subdomain}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-1.5">
                            {/* Status */}
                            <span
                              className={`
                                inline-flex
                                items-center
                                rounded-full
                                border
                                px-2.5
                                py-0.5
                                text-[11px]
                                font-medium
                                capitalize
                                ${
                                  profil.status === "aktif"
                                    ? `${themeSuccessSurface} ${themeSuccessBorder} text-[var(--color-success)]`
                                    : `${themeWarningSurface} ${themeWarningBorder} text-[var(--color-warning)]`
                                }
                              `}
                            >
                              {profil.status}
                            </span>

                            {/* Package */}
                            {langganan?.paket?.nama && (
                              <span
                                className={`
                                  inline-flex
                                  items-center
                                  rounded-full
                                  border
                                  ${themePrimarySoftBorder}
                                  ${themePrimarySoft}
                                  px-2.5
                                  py-0.5
                                  text-[11px]
                                  font-medium
                                  text-[var(--color-primary)]
                                `}
                              >
                                Paket {langganan.paket.nama}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ========================================== */}
                  {/* STATISTIK */}
                  {/* ========================================== */}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <StatCard
                      icon={GraduationCap}
                      label="Total Guru"
                      value={statistik.totalGuru}
                      variant="primary"
                    />

                    <StatCard
                      icon={Users}
                      label="Total Siswa"
                      value={statistik.totalSiswa}
                      variant="success"
                    />

                    <StatCard
                      icon={Layers}
                      label="Total Kelas"
                      value={statistik.totalKelas}
                      variant="warning"
                    />
                  </div>

                  {/* ========================================== */}
                  {/* INFO SEKOLAH + LANGGANAN */}
                  {/* ========================================== */}

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

                    {/* INFO SEKOLAH */}
                    <div
                      className={`
                        theme-card
                        overflow-hidden
                        rounded-2xl
                        border
                        theme-border
                        ${themeCardShadow}
                      `}
                    >
                      <div
                        className={`
                          flex
                          items-center
                          gap-2.5
                          border-b
                          ${themeDivider}
                          p-4
                          sm:p-5
                        `}
                      >
                        <div
                          className={`
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            border
                            ${themePrimarySoftBorder}
                            ${themePrimarySoft}
                            text-[var(--color-primary)]
                          `}
                        >
                          <Sparkles size={16} />
                        </div>

                        <h3 className="text-sm font-semibold theme-text">
                          Informasi Sekolah
                        </h3>
                      </div>

                      <div className="space-y-3 p-4 sm:p-5">
                        <InfoRow
                          icon={Phone}
                          label="Telepon"
                          value={profil.telepon || "-"}
                        />

                        <InfoRow
                          icon={Mail}
                          label="Email"
                          value={profil.email || "-"}
                        />
                      </div>
                    </div>

                    {/* LANGGANAN */}
                    <div
                      className={`
                        theme-card
                        overflow-hidden
                        rounded-2xl
                        border
                        theme-border
                        ${themeCardShadow}
                      `}
                    >
                      <div
                        className={`
                          flex
                          items-center
                          gap-2.5
                          border-b
                          ${themeDivider}
                          p-4
                          sm:p-5
                        `}
                      >
                        <div
                          className={`
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            border
                            ${themeSuccessBorder}
                            ${themeSuccessSurface}
                            text-[var(--color-success)]
                          `}
                        >
                          <BadgeCheck size={16} />
                        </div>

                        <h3 className="text-sm font-semibold theme-text">
                          Langganan Aktif
                        </h3>
                      </div>

                      <div className="space-y-3 p-4 sm:p-5">
                        {langganan ? (
                          <>
                            <InfoRow
                              icon={BadgeCheck}
                              label="Paket"
                              value={langganan.paket?.nama || "-"}
                            />

                            <InfoRow
                              icon={CalendarClock}
                              label="Berakhir Pada"
                              value={
                                langganan.tanggalBerakhir
                                  ? new Date(
                                      langganan.tanggalBerakhir
                                    ).toLocaleDateString("id-ID", {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    })
                                  : "-"
                              }
                            />

                            <InfoRow
                              icon={Sparkles}
                              label="Status Langganan"
                              value={
                                langganan.statusLangganan || "-"
                              }
                            />
                          </>
                        ) : (
                          <div
                            className={`
                              rounded-lg
                              border
                              ${themeNeutralBorder}
                              ${themeNeutralSurface}
                              px-3.5
                              py-3
                            `}
                          >
                            <p className="text-sm theme-text-muted">
                              Belum ada data langganan.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
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
        items-center
        gap-3.5
        rounded-xl
        border
        theme-border
        ${themeCardShadow}
        p-4
        sm:p-5
      `}
    >
      <div
        className={`
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-xl
          border
          ${styles.bg}
          ${styles.border}
          ${styles.text}
        `}
      >
        <Icon size={19} />
      </div>

      <div className="min-w-0">
        <p className="text-xl font-bold theme-text">
          {value ?? "-"}
        </p>

        <p className="mt-0.5 text-xs theme-text-secondary">
          {label}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// INFO ROW
// ============================================================

function InfoRow({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <div
        className={`
          flex
          h-7
          w-7
          shrink-0
          items-center
          justify-center
          rounded-lg
          border
          ${themeNeutralBorder}
          ${themeNeutralSurface}
          theme-text-muted
        `}
      >
        <Icon size={14} />
      </div>

      <span className="w-28 shrink-0 theme-text-secondary">
        {label}
      </span>

      <span className="min-w-0 truncate font-medium theme-text">
        {value}
      </span>
    </div>
  );
}