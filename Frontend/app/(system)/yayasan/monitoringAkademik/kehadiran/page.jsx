"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ClipboardCheck,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  Loader2,
  Users,
  CheckCircle,
  Search,
} from "lucide-react";
import { getMonitoringKehadiran } from "@/services/yayasan.service";

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

export default function MonitoringKehadiranPage() {
  const router = useRouter();
  const [ringkasan, setRingkasan] = useState(null);
  const [perSekolah, setPerSekolah] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleBack = () => {
    router.push("/yayasan/monitoringAkademik");
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMonitoringKehadiran();
      const data = res?.data || res;
      setRingkasan(data?.ringkasan || null);
      setPerSekolah(Array.isArray(data?.perSekolah) ? data.perSekolah : []);
    } catch (err) {
      setError(err?.message || "Gagal memuat data monitoring kehadiran.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await getMonitoringKehadiran();
        if (cancelled) return;
        const data = res?.data || res;
        setRingkasan(data?.ringkasan || null);
        setPerSekolah(Array.isArray(data?.perSekolah) ? data.perSekolah : []);
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Gagal memuat data monitoring kehadiran.");
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

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {/* Back Button */}
        <div className="mb-5 flex items-center">
          <button
            type="button"
            onClick={handleBack}
            className={`theme-border theme-card theme-text-secondary inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-semibold ${themeCardShadow} transition-all hover:-translate-x-0.5 hover:border-[color-mix(in_srgb,var(--color-primary)_28%,transparent)] hover:text-[var(--color-primary)] ${themeNeutralHover}`}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali</span>
          </button>
        </div>

        {/* Hero Header */}
        <section
          className={`relative mb-6 overflow-hidden rounded-2xl border ${themePrimarySoftBorder} ${themePrimaryGradient} ${themePrimaryShadow}`}
        >
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[color-mix(in_srgb,var(--color-card)_12%,transparent)] blur-3xl" />
          <div className="relative p-5 sm:p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[color-mix(in_srgb,var(--color-card)_22%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_12%,transparent)] text-[var(--color-card)] shadow-[0_4px_16px_color-mix(in_srgb,var(--color-text)_12%,transparent)] backdrop-blur-md sm:h-14 sm:w-14">
                <ClipboardCheck className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <div className="min-w-0">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color-mix(in_srgb,var(--color-card)_78%,transparent)] sm:text-xs">
                  Monitoring Akademik
                </p>
                <h1 className="text-2xl font-bold tracking-tight text-[var(--color-card)] sm:text-3xl lg:text-4xl">
                  Monitoring Kehadiran
                </h1>
                <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-[color-mix(in_srgb,var(--color-card)_78%,transparent)] sm:text-sm">
                  Pantau ringkasan kehadiran siswa dan guru di seluruh sekolah naungan.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-6">
          {/* Loading Skeleton */}
          {loading && (
            <div className="space-y-4">
              <div
                className={`theme-card theme-border rounded-xl border p-6 ${themeSmallShadow}`}
              >
                <div className="flex animate-pulse items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]" />
                  <div className="space-y-2">
                    <div className="h-3 w-32 rounded bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]" />
                    <div className="h-8 w-20 rounded bg-[color-mix(in_srgb,var(--color-text)_10%,transparent)]" />
                  </div>
                </div>
              </div>
              <div
                className={`theme-card theme-border rounded-xl border p-8 ${themeSmallShadow}`}
              >
                <div className="animate-pulse space-y-3">
                  <div className="h-4 w-48 rounded bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]" />
                  <div className="h-4 w-full rounded bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]" />
                  <div className="h-4 w-full rounded bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]" />
                  <div className="h-4 w-3/4 rounded bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]" />
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
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
          )}

          {/* Ringkasan Card */}
          {!loading && !error && ringkasan && (
            <div
              className={`theme-card theme-border rounded-xl border p-5 ${themeSmallShadow}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${themePrimarySoft} text-[var(--color-primary)]`}
                >
                  <CheckCircle size={22} />
                </div>
                <div>
                  <p className="theme-text-secondary text-sm">
                    Persentase Kehadiran Global
                  </p>
                  <p className="theme-text mt-1 text-3xl font-bold">
                    {ringkasan.persentaseGlobal != null
                      ? `${ringkasan.persentaseGlobal}%`
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Per-Sekolah Table */}
          {!loading && !error && perSekolah.length > 0 && (
            <div
              className={`theme-border theme-card overflow-hidden rounded-xl border ${themeCardShadow}`}
            >
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[800px] text-left text-sm">
                  <thead
                    className={`${themeNeutralSurface} theme-text-secondary text-xs uppercase`}
                  >
                    <tr>
                      <th className="px-4 py-3 font-semibold">Sekolah</th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Total Absen
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">Hadir</th>
                      <th className="px-4 py-3 text-right font-semibold">Izin</th>
                      <th className="px-4 py-3 text-right font-semibold">Sakit</th>
                      <th className="px-4 py-3 text-right font-semibold">Alpha</th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Persentase
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {perSekolah.map((s, index) => (
                      <tr
                        key={s.sekolahId}
                        className={`${themeNeutralHover} transition-colors ${
                          index !== perSekolah.length - 1
                            ? `border-b ${themeDivider}`
                            : ""
                        }`}
                      >
                        <td className="theme-text px-4 py-3 font-medium">
                          {s.namaSekolah}
                        </td>
                        <td className="theme-text-secondary px-4 py-3 text-right">
                          {s.totalAbsen ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-right text-[var(--color-success)]">
                          {s.hadir ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-right text-[var(--color-info)]">
                          {s.izin ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-right text-[var(--color-warning)]">
                          {s.sakit ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-right text-[var(--color-danger)]">
                          {s.alpha ?? "-"}
                        </td>
                        <td className="theme-text px-4 py-3 text-right font-semibold">
                          {s.persentase != null ? `${s.persentase}%` : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && perSekolah.length === 0 && (
            <div
              className={`theme-card theme-border flex flex-col items-center justify-center rounded-2xl border px-6 py-16 text-center ${themeCardShadow}`}
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${themePrimarySoftBorder} ${themePrimarySoft} text-[var(--color-primary)]`}
              >
                <Search className="h-6 w-6" />
              </div>
              <h3 className="theme-text mt-4 text-sm font-bold">
                Belum Ada Data Kehadiran
              </h3>
              <p className="theme-text-muted mt-1 max-w-sm text-sm leading-relaxed">
                Data kehadiran lintas sekolah belum tersedia saat ini.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}