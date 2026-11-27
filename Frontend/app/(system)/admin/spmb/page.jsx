"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Layers3,
  RefreshCw,
  Route,
  Table2,
  UserPlus,
  Users,
} from "lucide-react";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { useSpmbRekap } from "@/lib/useSpmbRekap";
import { formatAngka, hitungRekapJalur } from "@/lib/spmb";

export default function SpmbOverviewPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    pendaftar,
    jalur,
    statistik,
    loading,
    refreshing,
    error,
    muatUlang,
  } = useSpmbRekap();

  const rekapJalur = useMemo(
    () => hitungRekapJalur(pendaftar, jalur),
    [pendaftar, jalur]
  );

  const metrics = useMemo(() => {
    const totalPendaftar = Number(statistik?.total ?? pendaftar.length ?? 0);
    const totalTerverifikasi = Number(statistik?.lulus ?? 0);
    const totalMenunggu = Number(statistik?.menunggu ?? 0);
    const totalJalur = jalur.length;

    const totalKuota = rekapJalur.reduce(
      (sum, item) => sum + Number(item.kuota || 0),
      0
    );
    const totalTerisi = rekapJalur.reduce(
      (sum, item) => sum + Number(item.nonDitolak || 0),
      0
    );
    const totalSisaKuota =
      totalKuota > 0 ? Math.max(totalKuota - totalTerisi, 0) : 0;

    const fillPercentage =
      totalKuota > 0
        ? Math.min(100, Math.round((totalTerisi / totalKuota) * 100))
        : 0;

    const maxJalurCount = rekapJalur.reduce(
      (max, item) => Math.max(max, Number(item.total || 0), Number(item.kuota || 0)),
      0
    );

    return {
      totalPendaftar,
      totalJalur,
      totalTerverifikasi,
      totalMenunggu,
      totalKuota,
      totalTerisi,
      totalSisaKuota,
      fillPercentage,
      maxJalurCount,
    };
  }, [statistik, pendaftar, jalur, rekapJalur]);

  const isBusy = loading || refreshing;

  return (
    <div className="flex h-screen overflow-hidden theme-page theme-text">
      <Sidebar
        role="admin"
        active="spmb"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="shrink-0">
          <Header
            title="Penerimaan (SPMB)"
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8">
            {/* Header Section */}
            <section className="theme-card theme-border rounded-2xl border p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="theme-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-md">
                    <UserPlus size={23} />
                  </div>

                  <div className="min-w-0">
                    <h1 className="text-xl font-bold tracking-tight theme-text sm:text-2xl">
                      Penerimaan (SPMB)
                    </h1>

                    <p className="mt-1 max-w-2xl text-sm theme-text-muted">
                      Pantau jumlah pendaftar, keterisian kuota, distribusi
                      pendaftar per jalur, serta daftar Jalur Pendaftaran yang
                      berlaku di sekolah.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => muatUlang(true)}
                    disabled={isBusy}
                    className="theme-card theme-border theme-text-secondary inline-flex min-h-10 items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold shadow-sm transition hover:border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)] hover:text-[var(--color-primary)] disabled:opacity-60"
                  >
                    <RefreshCw
                      size={14}
                      className={isBusy ? "animate-spin theme-primary-text" : ""}
                    />
                    Muat Ulang
                  </button>
                </div>
              </div>
            </section>

            {/* Error State */}
            {error && (
              <div className="flex items-start justify-between gap-4 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)] p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-[var(--color-danger)]"
                  />
                  <div>
                    <p className="text-sm font-semibold theme-text">
                      Gagal memuat data Penerimaan (SPMB)
                    </p>
                    <p className="mt-1 text-xs theme-text-muted">{error}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => muatUlang(true)}
                  className="shrink-0 rounded-lg border theme-border theme-card px-3 py-1.5 text-xs font-semibold theme-text transition hover:border-[var(--color-primary)]"
                >
                  Coba Lagi
                </button>
              </div>
            )}

            {/* 1. Empat Kartu Angka di Bagian Atas */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="theme-card theme-border rounded-xl border p-4 shadow-sm sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
                      Total Pendaftar
                    </p>
                    <p
                      data-testid="stat-total-pendaftar"
                      className="mt-2 text-2xl font-bold tracking-tight tabular-nums theme-text sm:text-3xl"
                    >
                      {loading ? "—" : formatAngka(metrics.totalPendaftar)}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                    <Users size={20} />
                  </div>
                </div>
              </div>

              <div className="theme-card theme-border rounded-xl border p-4 shadow-sm sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
                      <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                      Jalur Pendaftaran
                    </p>
                    <p
                      data-testid="stat-total-jalur"
                      className="mt-2 text-2xl font-bold tracking-tight tabular-nums theme-text sm:text-3xl"
                    >
                      {loading ? "—" : formatAngka(metrics.totalJalur)}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                    <Route size={20} />
                  </div>
                </div>
              </div>

              <div className="theme-card theme-border rounded-xl border p-4 shadow-sm sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
                      <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
                      Terverifikasi
                    </p>
                    <p
                      data-testid="stat-terverifikasi"
                      className="mt-2 text-2xl font-bold tracking-tight tabular-nums theme-text sm:text-3xl"
                    >
                      {loading ? "—" : formatAngka(metrics.totalTerverifikasi)}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                    <CheckCircle2 size={20} />
                  </div>
                </div>
              </div>

              <div className="theme-card theme-border rounded-xl border p-4 shadow-sm sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
                      <span className="h-2 w-2 rounded-full bg-[var(--color-warning)]" />
                      Menunggu Verifikasi
                    </p>
                    <p
                      data-testid="stat-menunggu"
                      className="mt-2 text-2xl font-bold tracking-tight tabular-nums theme-text sm:text-3xl"
                    >
                      {loading ? "—" : formatAngka(metrics.totalMenunggu)}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                    <Clock3 size={20} />
                  </div>
                </div>
              </div>
            </div>

            {/* 2 & 3. Panel Utama: Keterisian Kuota SPMB & Distribusi Pendaftar per Jalur */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Panel Utama: Keterisian Kuota SPMB */}
              <section
                id="keterisian-kuota-spmb-panel"
                className="theme-card theme-border flex flex-col justify-between rounded-2xl border p-6 shadow-sm lg:col-span-5"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                        <Layers3 size={22} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold theme-text">
                          Keterisian Kuota SPMB
                        </h2>
                        <p className="mt-0.5 text-xs theme-text-muted">
                          Proporsi kuota penerimaan yang sudah terisi pendaftar
                        </p>
                      </div>
                    </div>
                  </div>

                  {loading ? (
                    <div className="mt-6 rounded-xl border theme-border p-8 text-center text-xs theme-text-muted">
                      Menghitung keterisian kuota SPMB...
                    </div>
                  ) : metrics.totalKuota === 0 ? (
                    <div className="mt-6 rounded-xl border border-dashed theme-border p-8 text-center">
                      <p className="text-sm font-semibold theme-text">
                        Belum ada data kuota jalur
                      </p>
                      <p className="mt-1 text-xs theme-text-muted">
                        Tambahkan jalur dan kuota pada menu Jalur Pendaftaran
                        untuk memantau persentase keterisian SPMB.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-6">
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="text-4xl font-extrabold tracking-tight tabular-nums theme-primary-text sm:text-5xl">
                          {metrics.fillPercentage}%
                        </span>
                        <span className="rounded-full border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] px-3 py-1 text-xs font-semibold theme-primary-text">
                          Kuota Terisi
                        </span>
                      </div>

                      <p className="mt-2 text-sm font-medium theme-text-secondary">
                        {formatAngka(metrics.totalTerisi)} dari{" "}
                        {formatAngka(metrics.totalKuota)} kuota jalur sudah
                        terisi
                      </p>

                      {/* Progress Bar */}
                      <div
                        role="progressbar"
                        aria-label="Keterisian Kuota SPMB"
                        aria-valuenow={metrics.fillPercentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        className="mt-4 h-3.5 w-full overflow-hidden rounded-full bg-[var(--color-input)]"
                      >
                        <div
                          className="theme-primary h-full rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${metrics.fillPercentage}%` }}
                        />
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border theme-border bg-[var(--color-input)] p-3.5">
                          <p className="text-[11px] font-medium theme-text-muted">
                            Kuota Terisi
                          </p>
                          <p className="mt-1 text-lg font-bold tabular-nums text-[var(--color-success)]">
                            {formatAngka(metrics.totalTerisi)} siswa
                          </p>
                        </div>

                        <div className="rounded-xl border theme-border bg-[var(--color-input)] p-3.5">
                          <p className="text-[11px] font-medium theme-text-muted">
                            Sisa Kuota
                          </p>
                          <p className="mt-1 text-lg font-bold tabular-nums text-[var(--color-warning)]">
                            {formatAngka(metrics.totalSisaKuota)} kursi
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 border-t theme-border pt-4">
                  <Link
                    href="/admin/spmb/data-pendaftaran"
                    className="inline-flex items-center gap-2 text-xs font-semibold theme-primary-text transition hover:opacity-80 sm:text-sm"
                  >
                    Kelola Data Pendaftaran
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </section>

              {/* Panel Samping: Distribusi Pendaftar per Jalur */}
              <section
                id="distribusi-jalur-spmb-panel"
                className="theme-card theme-border flex flex-col justify-between rounded-2xl border p-6 shadow-sm lg:col-span-7"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                        <BarChart3 size={22} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold theme-text">
                          Distribusi Pendaftar per Jalur
                        </h2>
                        <p className="mt-0.5 text-xs theme-text-muted">
                          Perbandingan jumlah pendaftar pada setiap jalur
                          penerimaan
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full border theme-border bg-[var(--color-input)] px-3 py-1 text-xs font-semibold theme-text-secondary">
                      {loading ? "..." : `${rekapJalur.length} Jalur`}
                    </span>
                  </div>

                  <div className="mt-6">
                    {loading ? (
                      <div className="rounded-xl border theme-border p-8 text-center text-xs theme-text-muted">
                        Memuat grafik distribusi jalur...
                      </div>
                    ) : rekapJalur.length === 0 ? (
                      <div className="rounded-xl border border-dashed theme-border p-8 text-center">
                        <p className="text-sm font-semibold theme-text">
                          Belum ada jalur pendaftaran
                        </p>
                        <p className="mt-1 text-xs theme-text-muted">
                          Tambahkan jalur pada menu Jalur Pendaftaran untuk
                          melihat distribusi pendaftar per jalur.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {rekapJalur.map((item) => {
                          const denominator = Math.max(
                            item.kuota || 0,
                            metrics.maxJalurCount,
                            1
                          );
                          const barPercent =
                            item.total > 0
                              ? Math.max(
                                  6,
                                  Math.min(
                                    100,
                                    Math.round((item.total / denominator) * 100)
                                  )
                                )
                              : 0;

                          return (
                            <div
                              key={item.id || item.nama}
                              className="rounded-xl border theme-border bg-[var(--color-input)] p-4"
                            >
                              <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
                                <span className="truncate font-semibold theme-text">
                                  {item.nama}
                                </span>

                                <span className="shrink-0 font-bold tabular-nums theme-text">
                                  {formatAngka(item.total)} pendaftar
                                </span>
                              </div>

                              <div className="mt-2.5 h-3 w-full overflow-hidden rounded-full bg-[var(--color-card)]">
                                <div
                                  className="theme-primary h-full rounded-full transition-all duration-500 ease-out"
                                  style={{ width: `${barPercent}%` }}
                                />
                              </div>

                              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] theme-text-muted">
                                <span>
                                  Kuota: {formatAngka(item.kuota)} • Sisa:{" "}
                                  {formatAngka(item.sisaKuota)}
                                </span>
                                <span>
                                  Terverifikasi: {formatAngka(item.lulus)} •
                                  Menunggu: {formatAngka(item.menunggu)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t theme-border pt-4">
                  <Link
                    href="/admin/spmb/jalur"
                    className="inline-flex items-center gap-2 text-xs font-semibold theme-primary-text transition hover:opacity-80 sm:text-sm"
                  >
                    Kelola Jalur Pendaftaran
                    <ArrowRight size={15} />
                  </Link>

                  <Link
                    href="/admin/spmb/pengaturan"
                    className="inline-flex items-center gap-2 text-xs font-semibold theme-text-secondary transition hover:text-[var(--color-primary)] sm:text-sm"
                  >
                    Pengaturan SPMB
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </section>
            </div>

            {/* 4. Tabel Jalur Pendaftaran di Bawah Grafik */}
            <section
              id="tabel-jalur-spmb-section"
              className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm"
            >
              <div className="flex flex-col gap-4 border-b theme-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                    <Table2 size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold theme-text">
                      Jalur Pendaftaran
                    </h2>
                    <p className="mt-0.5 text-xs theme-text-muted">
                      Ringkasan kuota, jumlah pendaftar, status verifikasi, dan
                      sisa kuota tiap jalur SPMB
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <Link
                    href="/admin/spmb/jalur"
                    className="theme-card theme-border theme-text-secondary inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  >
                    Kelola Jalur Pendaftaran
                    <ArrowRight size={14} />
                  </Link>

                  <Link
                    href="/admin/spmb/data-pendaftaran"
                    className="theme-primary inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold shadow-sm transition hover:opacity-90"
                  >
                    Kelola Data Pendaftaran
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              {loading ? (
                <div className="p-8 text-center text-xs theme-text-muted">
                  Memuat daftar jalur pendaftaran...
                </div>
              ) : rekapJalur.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm font-semibold theme-text">
                    Belum ada data Jalur Pendaftaran
                  </p>
                  <p className="mt-1 text-xs theme-text-muted">
                    Tambahkan jalur penerimaan melalui halaman Jalur Pendaftaran
                    untuk mulai menerima pendaftar.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b theme-border bg-[var(--color-input)] text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
                        <th className="px-6 py-3.5">Nama Jalur</th>
                        <th className="px-4 py-3.5 text-right">Kuota</th>
                        <th className="px-4 py-3.5 text-right">Pendaftar</th>
                        <th className="px-4 py-3.5 text-right">
                          Terverifikasi
                        </th>
                        <th className="px-4 py-3.5 text-right">Menunggu</th>
                        <th className="px-6 py-3.5 text-right">Sisa Kuota</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y theme-border">
                      {rekapJalur.map((item) => (
                        <tr
                          key={item.id || item.nama}
                          className="transition hover:bg-[color-mix(in_srgb,var(--color-primary)_4%,transparent)]"
                        >
                          <td className="px-6 py-4 font-semibold theme-text">
                            {item.nama}
                          </td>
                          <td className="px-4 py-4 text-right tabular-nums theme-text-secondary">
                            {formatAngka(item.kuota)}
                          </td>
                          <td className="px-4 py-4 text-right font-semibold tabular-nums theme-text">
                            {formatAngka(item.total)}
                          </td>
                          <td className="px-4 py-4 text-right tabular-nums text-[var(--color-success)]">
                            {formatAngka(item.lulus)}
                          </td>
                          <td className="px-4 py-4 text-right tabular-nums text-[var(--color-warning)]">
                            {formatAngka(item.menunggu)}
                          </td>
                          <td className="px-6 py-4 text-right font-semibold tabular-nums theme-text">
                            {formatAngka(item.sisaKuota)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
