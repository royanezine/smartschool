"use client";

import {
  BarChart3,
  ArrowLeft,
  Construction,
} from "lucide-react";
import { useRouter } from "next/navigation";

// ============================================================
// THEME HELPERS
// ============================================================

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

export default function MonitoringAkademikNilaiPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/yayasan/monitoringAkademik");
  };

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="w-full max-w-[1500px] mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">

        {/* ======================================================
            BACK BUTTON
        ====================================================== */}

        <div className="mb-5 flex items-center">
          <button
            type="button"
            onClick={handleBack}
            className={`
              inline-flex items-center gap-2
              rounded-xl
              border theme-border
              theme-card
              px-3.5 py-2.5
              text-sm font-semibold
              theme-text-secondary
              ${themeCardShadow}
              transition-all
              hover:-translate-x-0.5
              hover:border-[color-mix(in_srgb,var(--color-primary)_28%,transparent)]
              hover:text-[var(--color-primary)]
              ${themeNeutralHover}
            `}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali</span>
          </button>
        </div>

        {/* ======================================================
            HERO
        ====================================================== */}

        <section
          className={`
            relative mb-6 overflow-hidden rounded-2xl
            border ${themePrimarySoftBorder}
            ${themePrimaryGradient}
            ${themePrimaryShadow}
          `}
        >
          {/* Decorative background */}
          <div
            className="
              pointer-events-none
              absolute
              -right-20
              -top-24
              h-64
              w-64
              rounded-full
              bg-[color-mix(in_srgb,var(--color-card)_12%,transparent)]
              blur-3xl
            "
          />

          <div className="relative p-5 sm:p-6 md:p-8">
            <div className="flex items-start gap-4">

              {/* ICON */}
              <div
                className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-[color-mix(in_srgb,var(--color-card)_22%,transparent)]
                  bg-[color-mix(in_srgb,var(--color-card)_12%,transparent)]
                  text-[var(--color-card)]
                  shadow-[0_4px_16px_color-mix(in_srgb,var(--color-text)_12%,transparent)]
                  backdrop-blur-md
                  sm:h-14
                  sm:w-14
                "
              >
                <BarChart3 className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>

              {/* TITLE */}
              <div className="min-w-0">
                <p
                  className="
                    mb-1
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.18em]
                    text-[color-mix(in_srgb,var(--color-card)_78%,transparent)]
                    sm:text-xs
                  "
                >
                  Monitoring Akademik
                </p>

                <h1 className="text-2xl font-bold tracking-tight text-[var(--color-card)] sm:text-3xl lg:text-4xl">
                  Monitoring Nilai
                </h1>

                <p
                  className="
                    mt-1.5
                    max-w-2xl
                    text-xs
                    leading-relaxed
                    text-[color-mix(in_srgb,var(--color-card)_78%,transparent)]
                    sm:text-sm
                  "
                >
                  Pantau perkembangan nilai siswa di seluruh
                  sekolah jenjang.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================
            DEVELOPMENT CARD
        ====================================================== */}

        <div
          className={`
            theme-card
            flex
            flex-col
            items-center
            justify-center
            rounded-2xl
            border theme-border
            px-6
            py-16
            text-center
            ${themeCardShadow}
          `}
        >
          {/* ICON */}
          <div
            className={`
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              border
              ${themePrimarySoftBorder}
              ${themePrimarySoft}
              text-[var(--color-primary)]
            `}
          >
            <Construction className="h-6 w-6" />
          </div>

          {/* TITLE */}
          <h3 className="mt-4 text-sm font-bold theme-text">
            Halaman dalam pengembangan
          </h3>

          {/* DESCRIPTION */}
          <p className="mt-1 max-w-sm text-sm leading-relaxed theme-text-muted">
            Fitur monitoring nilai per sekolah dan per mata
            pelajaran belum tersedia saat ini.
          </p>

          {/* BACK BUTTON */}
          <button
            type="button"
            onClick={handleBack}
            className={`
              mt-5
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-[var(--color-primary)]
              px-4
              py-2.5
              text-xs
              font-semibold
              text-[var(--color-card)]
              ${themePrimaryShadow}
              transition-all
              hover:opacity-90
            `}
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Monitoring
          </button>
        </div>
      </div>
    </div>
  );
}