"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  BookOpen,
  Building2,
  CheckCircle2,
  FileText,
  GraduationCap,
  Package,
  RefreshCw,
  Table2,
  Users,
} from "lucide-react";

import {
  getLaporanAkademik,
  getLaporanOverview,
} from "@/services/yayasan.service";

function formatNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num.toLocaleString("id-ID") : "0";
}

function normalizeSekolahItem(item) {
  const statusRaw = String(item?.status ?? "aktif").toLowerCase();
  const isAktif =
    statusRaw === "aktif" || statusRaw === "active" || item?.aktif === true;

  return {
    id: String(item?.id ?? item?.nama ?? Math.random()),
    nama: item?.nama ?? item?.namaSekolah ?? "Unit Sekolah",
    jenjang: item?.jenjang ?? item?.tingkat ?? "-",
    status: isAktif ? "aktif" : "nonaktif",
    totalGuru: Number(item?.statistik?.totalGuru ?? item?.totalGuru ?? 0),
    totalSiswa: Number(item?.statistik?.totalSiswa ?? item?.totalSiswa ?? 0),
  };
}

export default function LaporanYayasanPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [sekolahList, setSekolahList] = useState([]);
  const [totalSekolahApi, setTotalSekolahApi] = useState(0);
  const [akademikRingkasan, setAkademikRingkasan] = useState(null);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      const [overviewRes, akademikRes] = await Promise.allSettled([
        getLaporanOverview(),
        getLaporanAkademik(),
      ]);

      if (overviewRes.status === "fulfilled") {
        const d = overviewRes.value?.data || {};
        const sekolahData = d.sekolah || {};
        const rawList = Array.isArray(sekolahData.items)
          ? sekolahData.items
          : Array.isArray(sekolahData)
            ? sekolahData
            : [];
        const normalized = rawList.map(normalizeSekolahItem);
        setSekolahList(normalized);
        setTotalSekolahApi(Number(d.totalSekolah) || normalized.length);
      } else {
        throw overviewRes.reason;
      }

      if (akademikRes.status === "fulfilled") {
        const akData = akademikRes.value?.data || akademikRes.value || {};
        setAkademikRingkasan(akData?.ringkasan || null);
      } else {
        setAkademikRingkasan(null);
      }
    } catch (err) {
      setError(err?.message || "Gagal memuat ringkasan laporan yayasan.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  const metrics = useMemo(() => {
    const totalSekolah = Math.max(totalSekolahApi, sekolahList.length);
    const activeSekolahCount = sekolahList.filter(
      (s) => s.status === "aktif"
    ).length;
    const totalGuru = sekolahList.reduce((sum, s) => sum + s.totalGuru, 0);
    const totalSiswa = sekolahList.reduce((sum, s) => sum + s.totalSiswa, 0);
    const activePercentage =
      totalSekolah > 0
        ? Math.min(100, Math.round((activeSekolahCount / totalSekolah) * 100))
        : 0;
    const maxWargaPerSekolah = sekolahList.reduce(
      (max, s) => Math.max(max, s.totalSiswa + s.totalGuru),
      0
    );

    return {
      totalSekolah,
      activeSekolahCount,
      inactiveSekolahCount: Math.max(0, totalSekolah - activeSekolahCount),
      totalGuru,
      totalSiswa,
      activePercentage,
      maxWargaPerSekolah,
    };
  }, [sekolahList, totalSekolahApi]);

  const isBusy = loading || refreshing;

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="w-full space-y-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        {/* Header Section */}
        <section className="theme-card theme-border rounded-2xl border p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="theme-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-md">
                <FileText size={23} />
              </div>

              <div className="min-w-0">
                <h1 className="text-xl font-bold tracking-tight theme-text sm:text-2xl">
                  Laporan &amp; Analitik
                </h1>

                <p className="mt-1 max-w-2xl text-sm theme-text-muted">
                  Pantau ringkasan unit sekolah, persebaran guru dan siswa,
                  capaian akademik, serta akses cepat ke seluruh laporan
                  yayasan.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => loadData(true)}
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
                  Gagal memuat data Laporan &amp; Analitik
                </p>
                <p className="mt-1 text-xs theme-text-muted">{error}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => loadData(true)}
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
                  Total Unit Sekolah
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums theme-text sm:text-3xl">
                  {loading ? "—" : formatNumber(metrics.totalSekolah)}
                </p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                <Building2 size={20} />
              </div>
            </div>
          </div>

          <div className="theme-card theme-border rounded-xl border p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
                  <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
                  Unit Sekolah Aktif
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums theme-text sm:text-3xl">
                  {loading ? "—" : formatNumber(metrics.activeSekolahCount)}
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
                  <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
                  Total Guru
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums theme-text sm:text-3xl">
                  {loading ? "—" : formatNumber(metrics.totalGuru)}
                </p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                <GraduationCap size={20} />
              </div>
            </div>
          </div>

          <div className="theme-card theme-border rounded-xl border p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
                  <span className="h-2 w-2 rounded-full bg-[var(--color-warning)]" />
                  Total Siswa
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums theme-text sm:text-3xl">
                  {loading ? "—" : formatNumber(metrics.totalSiswa)}
                </p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                <Users size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* 2 & 3. Panel Utama: Cakupan Unit Sekolah Aktif & Distribusi Warga Sekolah */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Panel Utama */}
          <section className="theme-card theme-border flex flex-col justify-between rounded-2xl border p-6 shadow-sm lg:col-span-5">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                    <BookOpen size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold theme-text">
                      Cakupan Unit Sekolah
                    </h2>
                    <p className="mt-0.5 text-xs theme-text-muted">
                      Proporsi unit sekolah binaan aktif dan ringkasan akademik
                    </p>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="mt-6 rounded-xl border theme-border p-8 text-center text-xs theme-text-muted">
                  Menghitung ringkasan unit sekolah...
                </div>
              ) : metrics.totalSekolah === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed theme-border p-8 text-center">
                  <p className="text-sm font-semibold theme-text">
                    Belum ada data unit sekolah
                  </p>
                  <p className="mt-1 text-xs theme-text-muted">
                    Tambahkan sekolah binaan terlebih dahulu untuk mulai melihat
                    laporan dan analitik yayasan.
                  </p>
                </div>
              ) : (
                <div className="mt-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-4xl font-extrabold tracking-tight tabular-nums theme-primary-text sm:text-5xl">
                      {metrics.activePercentage}%
                    </span>
                    <span className="rounded-full border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] px-3 py-1 text-xs font-semibold theme-primary-text">
                      Unit Aktif
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-medium theme-text-secondary">
                    {formatNumber(metrics.activeSekolahCount)} dari{" "}
                    {formatNumber(metrics.totalSekolah)} unit sekolah berstatus
                    aktif
                  </p>

                  {/* Progress Bar */}
                  <div
                    role="progressbar"
                    aria-label="Cakupan Unit Sekolah Aktif"
                    aria-valuenow={metrics.activePercentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="mt-4 h-3.5 w-full overflow-hidden rounded-full bg-[var(--color-input)]"
                  >
                    <div
                      className="theme-primary h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${metrics.activePercentage}%` }}
                    />
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border theme-border bg-[var(--color-input)] p-3.5">
                      <p className="text-[11px] font-medium theme-text-muted">
                        Rata-rata Kehadiran
                      </p>
                      <p className="mt-1 text-lg font-bold tabular-nums text-[var(--color-success)]">
                        {akademikRingkasan?.rataKehadiranGlobal != null
                          ? `${akademikRingkasan.rataKehadiranGlobal}%`
                          : "—"}
                      </p>
                    </div>

                    <div className="rounded-xl border theme-border bg-[var(--color-input)] p-3.5">
                      <p className="text-[11px] font-medium theme-text-muted">
                        Tuntas KKM
                      </p>
                      <p className="mt-1 text-lg font-bold tabular-nums theme-primary-text">
                        {akademikRingkasan?.tuntasKKM != null
                          ? `${akademikRingkasan.tuntasKKM}%`
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t theme-border pt-4">
              <Link
                href="/yayasan/laporan/akademik"
                className="inline-flex items-center gap-2 text-xs font-semibold theme-primary-text transition hover:opacity-80 sm:text-sm"
              >
                Buka Laporan Akademik
                <ArrowRight size={15} />
              </Link>

              <Link
                href="/yayasan/laporan/iventaris"
                className="inline-flex items-center gap-2 text-xs font-semibold theme-text-secondary transition hover:text-[var(--color-primary)] sm:text-sm"
              >
                <Package size={14} />
                Inventaris
              </Link>
            </div>
          </section>

          {/* Panel Samping: Distribusi Siswa & Guru per Sekolah */}
          <section className="theme-card theme-border flex flex-col justify-between rounded-2xl border p-6 shadow-sm lg:col-span-7">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                    <BarChart3 size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold theme-text">
                      Distribusi Siswa &amp; Guru per Sekolah
                    </h2>
                    <p className="mt-0.5 text-xs theme-text-muted">
                      Perbandingan jumlah siswa dan tenaga pendidik pada tiap
                      unit sekolah
                    </p>
                  </div>
                </div>

                <span className="rounded-full border theme-border bg-[var(--color-input)] px-3 py-1 text-xs font-semibold theme-text-secondary">
                  {loading ? "..." : `${sekolahList.length} Unit`}
                </span>
              </div>

              <div className="mt-6">
                {loading ? (
                  <div className="rounded-xl border theme-border p-8 text-center text-xs theme-text-muted">
                    Memuat grafik distribusi unit sekolah...
                  </div>
                ) : sekolahList.length === 0 ? (
                  <div className="rounded-xl border border-dashed theme-border p-8 text-center">
                    <p className="text-sm font-semibold theme-text">
                      Belum ada unit sekolah terdata
                    </p>
                    <p className="mt-1 text-xs theme-text-muted">
                      Data distribusi akan tampil otomatis setelah sekolah
                      binaan terdaftar.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sekolahList.map((sekolah) => {
                      const totalWarga = sekolah.totalSiswa + sekolah.totalGuru;
                      const denominator = Math.max(
                        metrics.maxWargaPerSekolah,
                        1
                      );
                      const barPercent =
                        totalWarga > 0
                          ? Math.max(
                              8,
                              Math.min(
                                100,
                                Math.round((totalWarga / denominator) * 100)
                              )
                            )
                          : 0;

                      return (
                        <div
                          key={sekolah.id}
                          className="rounded-xl border theme-border bg-[var(--color-input)] p-4"
                        >
                          <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="truncate font-semibold theme-text">
                                {sekolah.nama}
                              </span>
                              {sekolah.jenjang && sekolah.jenjang !== "-" ? (
                                <span className="shrink-0 text-xs theme-text-muted">
                                  ({sekolah.jenjang})
                                </span>
                              ) : null}
                            </div>

                            <span className="shrink-0 font-bold tabular-nums theme-text">
                              {formatNumber(totalWarga)} orang
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
                              Siswa: {formatNumber(sekolah.totalSiswa)} • Guru:{" "}
                              {formatNumber(sekolah.totalGuru)}
                            </span>
                            <span>
                              Status:{" "}
                              {sekolah.status === "aktif"
                                ? "Aktif"
                                : "Nonaktif"}
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
                href="/yayasan/laporan/guru"
                className="inline-flex items-center gap-2 text-xs font-semibold theme-primary-text transition hover:opacity-80 sm:text-sm"
              >
                Buka Laporan Guru
                <ArrowRight size={15} />
              </Link>

              <Link
                href="/yayasan/laporan/siswa"
                className="inline-flex items-center gap-2 text-xs font-semibold theme-text-secondary transition hover:text-[var(--color-primary)] sm:text-sm"
              >
                Buka Laporan Siswa
                <ArrowRight size={15} />
              </Link>
            </div>
          </section>
        </div>

        {/* 4. Tabel Ringkasan Unit Sekolah di Bawah Grafik */}
        <section className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">
          <div className="flex flex-col gap-4 border-b theme-border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                <Table2 size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold theme-text">
                  Ringkasan per Unit Sekolah
                </h2>
                <p className="mt-0.5 text-xs theme-text-muted">
                  Data jumlah guru, siswa, rasio pengajar, dan status tiap unit
                  sekolah binaan
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/yayasan/laporan/akademik"
                className="theme-card theme-border theme-text-secondary inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                Akademik
              </Link>
              <Link
                href="/yayasan/laporan/guru"
                className="theme-card theme-border theme-text-secondary inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                Guru
              </Link>
              <Link
                href="/yayasan/laporan/iventaris"
                className="theme-card theme-border theme-text-secondary inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                Inventaris
              </Link>
              <Link
                href="/yayasan/laporan/siswa"
                className="theme-primary inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold shadow-sm transition hover:opacity-90"
              >
                Siswa
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs theme-text-muted">
              Memuat ringkasan unit sekolah...
            </div>
          ) : sekolahList.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm font-semibold theme-text">
                Belum ada data unit sekolah
              </p>
              <p className="mt-1 text-xs theme-text-muted">
                Unit sekolah binaan yayasan akan tampil di tabel ini setelah
                ditambahkan.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b theme-border bg-[var(--color-input)] text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
                    <th className="px-6 py-3.5">Nama Sekolah</th>
                    <th className="px-4 py-3.5">Jenjang</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Guru</th>
                    <th className="px-4 py-3.5 text-right">Siswa</th>
                    <th className="px-6 py-3.5 text-right">Rasio Siswa/Guru</th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-border">
                  {sekolahList.map((sekolah) => {
                    const rasio =
                      sekolah.totalGuru > 0
                        ? (sekolah.totalSiswa / sekolah.totalGuru).toLocaleString(
                            "id-ID",
                            { maximumFractionDigits: 1 }
                          )
                        : "—";

                    return (
                      <tr
                        key={sekolah.id}
                        className="transition hover:bg-[color-mix(in_srgb,var(--color-primary)_4%,transparent)]"
                      >
                        <td className="px-6 py-4 font-semibold theme-text">
                          {sekolah.nama}
                        </td>
                        <td className="px-4 py-4 theme-text-secondary">
                          {sekolah.jenjang}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              sekolah.status === "aktif"
                                ? "bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[var(--color-success)]"
                                : "bg-[color-mix(in_srgb,var(--color-text)_10%,transparent)] theme-text-muted"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                sekolah.status === "aktif"
                                  ? "bg-[var(--color-success)]"
                                  : "bg-[var(--color-text-muted)]"
                              }`}
                            />
                            {sekolah.status === "aktif" ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right tabular-nums theme-text-secondary">
                          {formatNumber(sekolah.totalGuru)}
                        </td>
                        <td className="px-4 py-4 text-right font-semibold tabular-nums theme-text">
                          {formatNumber(sekolah.totalSiswa)}
                        </td>
                        <td className="px-6 py-4 text-right tabular-nums theme-text-secondary">
                          {rasio}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
