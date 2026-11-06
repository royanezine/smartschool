"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  School,
  GraduationCap,
  Layers,
  ChevronRight,
  AlertCircle,
  Users,
  TrendingUp,
  CheckCircle,
  RefreshCw,
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

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

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
    status: "Tersedia",
    badgeColor:
      "bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[var(--color-success)] border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]",
  },
  {
    title: "Monitoring LMS & Tugas",
    desc: "Adopsi platform pembelajaran digital dan pengumpulan tugas siswa.",
    icon: Layers,
    path: "/yayasan/monitoringAkademik/lms",
    status: "Tersedia",
    badgeColor:
      "bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[var(--color-success)] border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]",
  },
  {
    title: "Monitoring Nilai & Prestasi",
    desc: "Capaian ketuntasan belajar dan statistik nilai akademik siswa.",
    icon: School,
    path: "/yayasan/monitoringAkademik/nilai",
    status: "Tersedia",
    badgeColor:
      "bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[var(--color-success)] border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]",
  },
];

export default function MonitoringAkademikPage() {
  const [ringkasan, setRingkasan] = useState(null);
  const [perSekolah, setPerSekolah] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMonitoringAkademik();
      const data = res?.data || res;
      setRingkasan(data?.ringkasan || null);
      setPerSekolah(Array.isArray(data?.perSekolah) ? data.perSekolah : []);
    } catch (err) {
      setError(err?.message || "Gagal memuat data monitoring akademik.");
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
        const data = res?.data || res;
        setRingkasan(data?.ringkasan || null);
        setPerSekolah(Array.isArray(data?.perSekolah) ? data.perSekolah : []);
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Gagal memuat data monitoring akademik.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const summaryCards = ringkasan
    ? [
        {
          label: "Rata-rata Nilai Global",
          value: ringkasan.rataNilaiGlobal ?? "-",
          icon: TrendingUp,
          color: "primary",
        },
        {
          label: "Rata-rata Kehadiran",
          value:
            ringkasan.rataKehadiranGlobal != null
              ? `${ringkasan.rataKehadiranGlobal}%`
              : "-",
          icon: ClipboardCheck,
          color: "info",
        },
        {
          label: "Total Siswa",
          value: ringkasan.totalSiswa ?? "-",
          icon: Users,
          color: "success",
        },
        {
          label: "Tuntas KKM",
          value:
            ringkasan.tuntasKKM != null ? `${ringkasan.tuntasKKM}%` : "-",
          icon: CheckCircle,
          color: "warning",
        },
      ]
    : [];

  const colorMap = {
    primary: {
      bg: "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]",
      text: "text-[var(--color-primary)]",
    },
    info: {
      bg: "bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)]",
      text: "text-[var(--color-info)]",
    },
    success: {
      bg: "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]",
      text: "text-[var(--color-success)]",
    },
    warning: {
      bg: "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]",
      text: "text-[var(--color-warning)]",
    },
  };

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="w-full space-y-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {/* Hero Header */}
        <section
          className={`relative overflow-hidden rounded-2xl border ${themePrimarySoftBorder} ${themePrimaryGradient} ${themePrimaryShadow}`}
        >
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[color-mix(in_srgb,var(--color-card)_12%,transparent)] blur-3xl" />
          <div className="relative p-5 sm:p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[color-mix(in_srgb,var(--color-card)_22%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_12%,transparent)] text-[var(--color-card)] shadow-[0_4px_16px_color-mix(in_srgb,var(--color-text)_12%,transparent)] backdrop-blur-md sm:h-14 sm:w-14">
                <ClipboardCheck className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <div className="min-w-0">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color-mix(in_srgb,var(--color-card)_78%,transparent)] sm:text-xs">
                  Pusat Kendali
                </p>
                <h1 className="text-2xl font-bold tracking-tight text-[var(--color-card)] sm:text-3xl lg:text-4xl">
                  Monitoring Akademik
                </h1>
                <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-[color-mix(in_srgb,var(--color-card)_78%,transparent)] sm:text-sm">
                  Pantau performa akademik, kehadiran, dan aktivitas pembelajaran di seluruh sekolah naungan yayasan.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Ringkasan Cards */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`theme-card theme-border rounded-xl border p-4 ${themeSmallShadow}`}
              >
                <div className="flex animate-pulse items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-20 rounded bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]" />
                    <div className="h-6 w-14 rounded bg-[color-mix(in_srgb,var(--color-text)_10%,transparent)]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div
            className={`theme-card rounded-xl border border-[color-mix(in_srgb,var(--color-warning)_30%,transparent)] p-5 ${themeSmallShadow}`}
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-[var(--color-warning)]" />
              <div>
                <p className="text-sm font-medium text-[var(--color-warning)]">
                  {error}
                </p>
                <button
                  type="button"
                  onClick={fetchData}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)] hover:underline"
                >
                  <RefreshCw className="h-3 w-3" />
                  Coba Lagi
                </button>
              </div>
            </div>
          </div>
        ) : ringkasan ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6">
            {summaryCards.map((card) => {
              const Icon = card.icon;
              const colors = colorMap[card.color] || colorMap.primary;
              return (
                <div
                  key={card.label}
                  className={`theme-card theme-border rounded-xl border p-4 ${themeSmallShadow}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colors.bg} ${colors.text}`}
                    >
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="theme-text-secondary text-sm">{card.label}</p>
                      <p className="theme-text mt-1 text-2xl font-semibold">{card.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {/* Per-Sekolah Table */}
        {!loading && !error && perSekolah.length > 0 && (
          <div
            className={`theme-border theme-card overflow-hidden rounded-xl border ${themeCardShadow}`}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead
                  className={`${themeNeutralSurface} theme-text-secondary text-xs uppercase`}
                >
                  <tr>
                    <th className="px-4 py-3 font-semibold">Sekolah</th>
                    <th className="px-4 py-3 font-semibold">Jenjang</th>
                    <th className="px-4 py-3 text-right font-semibold">Siswa</th>
                    <th className="px-4 py-3 text-right font-semibold">Rata Nilai</th>
                    <th className="px-4 py-3 text-right font-semibold">Kehadiran</th>
                    <th className="px-4 py-3 text-right font-semibold">Tuntas KKM</th>
                  </tr>
                </thead>
                <tbody>
                  {perSekolah.map((s, index) => (
                    <tr
                      key={s.sekolahId}
                      className={`${themeNeutralHover} transition-colors ${
                        index !== perSekolah.length - 1 ? `border-b ${themeDivider}` : ""
                      }`}
                    >
                      <td className="theme-text px-4 py-3 font-medium">{s.namaSekolah}</td>
                      <td className="theme-text-secondary px-4 py-3 capitalize">{s.jenjang || "-"}</td>
                      <td className="theme-text-secondary px-4 py-3 text-right">{s.siswa ?? "-"}</td>
                      <td className="theme-text-secondary px-4 py-3 text-right">{s.rataNilai ?? "-"}</td>
                      <td className="theme-text-secondary px-4 py-3 text-right">
                        {s.kehadiran != null ? `${s.kehadiran}%` : "-"}
                      </td>
                      <td className="theme-text-secondary px-4 py-3 text-right">
                        {s.tuntasKKM != null ? `${s.tuntasKKM}%` : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sub-module Navigation */}
        <div>
          <h2 className="theme-text mb-4 text-base font-bold sm:text-lg">
            Pilih Modul Monitoring
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {subModules.map((mod) => {
              const Icon = mod.icon;
              return (
                <Link
                  key={mod.path}
                  href={mod.path}
                  className={`group theme-card theme-border flex flex-col justify-between rounded-2xl border p-5 ${themeCardShadow} transition-all hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--color-primary)_35%,transparent)] ${themeNeutralHover}`}
                >
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl border ${themePrimarySoftBorder} ${themePrimarySoft} text-[var(--color-primary)]`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${mod.badgeColor}`}
                      >
                        {mod.status}
                      </span>
                    </div>
                    <h3 className="theme-text text-base font-bold transition-colors group-hover:text-[var(--color-primary)]">
                      {mod.title}
                    </h3>
                    <p className="theme-text-secondary mt-1 text-xs leading-relaxed sm:text-sm">
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