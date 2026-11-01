"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  Search,
  ChevronDown,
  Sparkles,
  School,
  GraduationCap,
  Layers,
  ChevronRight,
  Loader2,
  AlertCircle,
  Construction,
} from "lucide-react";
import { getMonitoringAkademik } from "@/services/yayasan.service";

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

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const subModules = [
  {
    title: "Monitoring Guru",
    desc: "Pantau data tenaga pendidik di seluruh sekolah naungan yayasan secara real-time.",
    icon: GraduationCap,
    path: "/yayasan/monitoringAkademik/guru",
    status: "Tersedia",
    badgeColor:
      "bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[var(--color-success)] border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]",
  },
  {
    title: "Monitoring Kehadiran",
    desc: "Rekap persentase kehadiran siswa dan guru lintas unit sekolah.",
    icon: ClipboardCheck,
    path: "/yayasan/monitoringAkademik/kehadiran",
    status: "Backend Gap",
    badgeColor:
      "bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)] text-[var(--color-warning)] border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]",
  },
  {
    title: "Monitoring LMS & Tugas",
    desc: "Adopsi platform pembelajaran digital dan pengumpulan tugas siswa.",
    icon: Layers,
    path: "/yayasan/monitoringAkademik/lms",
    status: "Backend Gap",
    badgeColor:
      "bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)] text-[var(--color-warning)] border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]",
  },
  {
    title: "Monitoring Nilai & Prestasi",
    desc: "Capaian ketuntasan belajar dan statistik nilai akademik siswa.",
    icon: School,
    path: "/yayasan/monitoringAkademik/nilai",
    status: "Backend Gap",
    badgeColor:
      "bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)] text-[var(--color-warning)] border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]",
  },
];

export default function MonitoringAkademikPage() {
  const [dataSekolah, setDataSekolah] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMonitoring = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMonitoringAkademik();
      const list = Array.isArray(res?.data?.items)
        ? res.data.items
        : Array.isArray(res?.data)
        ? res.data
        : [];
      setDataSekolah(list);
    } catch (err) {
      setError(err?.message || "Fitur ringkasan agregasi akademik belum didukung API Backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await getMonitoringAkademik();
        if (cancelled) return;
        const list = Array.isArray(res?.data?.items)
          ? res.data.items
          : Array.isArray(res?.data)
          ? res.data
          : [];
        setDataSekolah(list);
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.message ||
              "Fitur ringkasan agregasi akademik belum didukung API Backend."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="w-full max-w-[1500px] mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 space-y-6">
        <section
          className={`
            relative overflow-hidden rounded-2xl
            border ${themePrimarySoftBorder}
            ${themePrimaryGradient}
            ${themePrimaryShadow}
          `}
        >
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
                <ClipboardCheck className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>

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
                  Pusat Kendali
                </p>

                <h1 className="text-2xl font-bold tracking-tight text-[var(--color-card)] sm:text-3xl lg:text-4xl">
                  Monitoring Akademik
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
                  Pantau performa akademik, kehadiran, dan aktivitas pembelajaran di seluruh sekolah naungan yayasan.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div>
          <h2 className="text-base sm:text-lg font-bold theme-text mb-4">
            Pilih Modul Monitoring
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subModules.map((mod) => {
              const Icon = mod.icon;
              return (
                <Link
                  key={mod.path}
                  href={mod.path}
                  className={`
                    group
                    theme-card
                    flex
                    flex-col
                    justify-between
                    rounded-2xl
                    border
                    theme-border
                    p-5
                    ${themeCardShadow}
                    transition-all
                    hover:-translate-y-1
                    hover:border-[color-mix(in_srgb,var(--color-primary)_35%,transparent)]
                    ${themeNeutralHover}
                  `}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`
                          flex
                          h-11
                          w-11
                          items-center
                          justify-center
                          rounded-xl
                          border
                          ${themePrimarySoftBorder}
                          ${themePrimarySoft}
                          text-[var(--color-primary)]
                        `}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <span
                        className={`
                          inline-flex
                          items-center
                          rounded-full
                          border
                          px-2.5
                          py-0.5
                          text-[11px]
                          font-semibold
                          ${mod.badgeColor}
                        `}
                      >
                        {mod.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold theme-text group-hover:text-[var(--color-primary)] transition-colors">
                      {mod.title}
                    </h3>

                    <p className="mt-1 text-xs sm:text-sm leading-relaxed theme-text-secondary">
                      {mod.desc}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)]">
                    <span>Buka Monitoring</span>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
