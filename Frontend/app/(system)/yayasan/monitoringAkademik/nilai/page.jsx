"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Users,
  Award,
  Search,
} from "lucide-react";
import { getMonitoringNilai } from "@/services/yayasan.service";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_80%,#000))]";

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

export default function MonitoringNilaiPage() {
  const router = useRouter();
  const [ringkasan, setRingkasan] = useState(null);
  const [distribusiPredikat, setDistribusiPredikat] = useState(null);
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
      const res = await getMonitoringNilai();
      const data = res?.data || res;
      setRingkasan(data?.ringkasan || null);
      setDistribusiPredikat(data?.distribusiPredikat || null);
      setPerSekolah(Array.isArray(data?.perSekolah) ? data.perSekolah : []);
    } catch (err) {
      setError(err?.message || "Gagal memuat data monitoring nilai.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await getMonitoringNilai();
        if (cancelled) return;
        const data = res?.data || res;
        setRingkasan(data?.ringkasan || null);
        setDistribusiPredikat(data?.distribusiPredikat || null);
        setPerSekolah(Array.isArray(data?.perSekolah) ? data.perSekolah : []);
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || "Gagal memuat data monitoring nilai.");
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
          label: "Rata-rata Keseluruhan",
          value: ringkasan.rataRataKeseluruhan ?? "-",
          icon: TrendingUp,
        },
        {
          label: "Siswa di Bawah KKM",
          value: ringkasan.jumlahSiswaDiBawahKKM ?? "-",
          icon: Users,
        },
      ]
    : [];

  const predikatColors = {
    A: "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)]",
    B: "bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)] text-[var(--color-info)]",
    C: "bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] text-[var(--color-warning)]",
    D: "bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] text-[var(--color-danger)]",
  };

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
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="relative p-5 sm:p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white shadow-[0_4px_16px_color-mix(in_srgb,var(--color-text)_12%,transparent)] backdrop-blur-md sm:h-14 sm:w-14">
                <GraduationCap className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <div className="min-w-0">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80 sm:text-xs">
                  Monitoring Akademik
                </p>
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                  Monitoring Nilai &amp; Prestasi
                </h1>
                <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-white/80 sm:text-sm">
                  Pantau rata-rata capaian nilai akademik dan ketuntasan belajar siswa di seluruh unit naungan yayasan.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-6">
          {/* Loading Skeleton */}
          {loading && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    className={`theme-card theme-border rounded-xl border p-4 ${themeSmallShadow}`}
                  >
                    <div className="flex animate-pulse items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-28 rounded bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]" />
                        <div className="h-6 w-14 rounded bg-[color-mix(in_srgb,var(--color-text)_10%,transparent)]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div
                className={`theme-card theme-border rounded-xl border p-6 ${themeSmallShadow}`}
              >
                <div className="grid animate-pulse grid-cols-2 gap-4 sm:grid-cols-4">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-16 rounded-lg bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]"
                    />
                  ))}
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

          {/* Summary Cards */}
          {!loading && !error && ringkasan && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {summaryCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.label}
                    className={`theme-card theme-border rounded-xl border p-4 ${themeSmallShadow}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]">
                        <Icon size={18} className="theme-primary-text" />
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
          )}

          {/* Distribusi Predikat */}
          {!loading && !error && distribusiPredikat && (
            <section
              className={`theme-card theme-border rounded-xl border p-5 ${themeSmallShadow}`}
            >
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-[var(--color-primary)]" />
                <h2 className="theme-text text-base font-bold">
                  Distribusi Predikat
                </h2>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {["A", "B", "C", "D"].map((predikat) => (
                  <div
                    key={predikat}
                    className={`rounded-lg px-4 py-3 ${predikatColors[predikat]}`}
                  >
                    <p className="text-xs font-semibold uppercase">
                      Predikat {predikat}
                    </p>
                    <p className="mt-1 text-2xl font-bold">
                      {distribusiPredikat[predikat] ?? 0}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Per-Sekolah Table */}
          {!loading && !error && perSekolah.length > 0 && (
            <div
              className={`theme-border theme-card overflow-hidden rounded-xl border ${themeCardShadow}`}
            >
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead
                    className={`${themeNeutralSurface} theme-text-secondary text-xs uppercase`}
                  >
                    <tr>
                      <th className="px-4 py-3 font-semibold">Sekolah</th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Rata-rata Nilai
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Nilai Tertinggi
                      </th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Nilai Terendah
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
                        <td className="theme-text px-4 py-3 text-right font-semibold">
                          {s.rataNilai ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-right text-[var(--color-success)]">
                          {s.tertinggi ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-right text-[var(--color-warning)]">
                          {s.terendah ?? "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && !ringkasan && !distribusiPredikat && perSekolah.length === 0 && (
            <div
              className={`theme-card theme-border flex flex-col items-center justify-center rounded-2xl border px-6 py-16 text-center ${themeCardShadow}`}
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${themePrimarySoftBorder} ${themePrimarySoft} text-[var(--color-primary)]`}
              >
                <Search className="h-6 w-6" />
              </div>
              <h3 className="theme-text mt-4 text-sm font-bold">
                Belum Ada Data Nilai
              </h3>
              <p className="theme-text-muted mt-1 max-w-sm text-sm leading-relaxed">
                Data nilai dan prestasi lintas sekolah belum tersedia saat ini.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}