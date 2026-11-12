"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

import {
  BookOpen,
  Search,
  ChevronDown,
  ChevronLeft,
  Sparkles,
  Download,
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { getLaporanAkademik } from "@/services/yayasan.service";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_80%,#000))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText = "text-[var(--color-primary)]";

const themePrimaryHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_88%,var(--color-text))]";

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

const JENJANG_OPTIONS = ["Semua Jenjang", "SD", "SMP", "SMA"];

const KKM = 75;

const round1 = (n) => Math.round(n * 10) / 10;

export default function LaporanAkademikPage() {
  const router = useRouter();

  const [jenjang, setJenjang] = useState(JENJANG_OPTIONS[0]);
  const [search, setSearch] = useState("");
  const [perSekolah, setPerSekolah] = useState([]);
  const [ringkasan, setRingkasan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAkademik = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getLaporanAkademik();
      const d = res?.data || res || {};
      setRingkasan(d.ringkasan || null);
      setPerSekolah(Array.isArray(d.perSekolah) ? d.perSekolah : []);
    } catch (err) {
      setError(err?.message || "Gagal memuat laporan akademik yayasan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await getLaporanAkademik();
        if (cancelled) return;
        const d = res?.data || res || {};
        setRingkasan(d.ringkasan || null);
        setPerSekolah(Array.isArray(d.perSekolah) ? d.perSekolah : []);
      } catch (err) {
        if (!cancelled)
          setError(err?.message || "Gagal memuat laporan akademik yayasan.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredUnits = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return perSekolah.filter((unit) => {
      const matchJenjang =
        jenjang === "Semua Jenjang" || unit.jenjang === jenjang;
      const matchSearch =
        !keyword || unit.namaSekolah?.toLowerCase().includes(keyword);
      return matchJenjang && matchSearch;
    });
  }, [perSekolah, jenjang, search]);

  const summary = useMemo(() => {
    if (jenjang === "Semua Jenjang" && !search.trim() && ringkasan) {
      return {
        rataNilai:
          ringkasan.rataNilaiGlobal != null
            ? round1(ringkasan.rataNilaiGlobal)
            : null,
        rataKehadiran:
          ringkasan.rataKehadiranGlobal != null
            ? round1(ringkasan.rataKehadiranGlobal)
            : null,
        totalSiswa: Number(ringkasan.totalSiswa) || 0,
        totalTuntas: Number(ringkasan.tuntasKKM) || 0,
      };
    }
    if (filteredUnits.length === 0) {
      return { rataNilai: null, rataKehadiran: null, totalSiswa: 0, totalTuntas: 0 };
    }
    const totalSiswa = filteredUnits.reduce(
      (t, u) => t + (Number(u.siswa) || 0),
      0
    );
    const totalTuntas = filteredUnits.reduce(
      (t, u) => t + (Number(u.tuntasKKM) || 0),
      0
    );
    const rataNilai = round1(
      filteredUnits.reduce((t, u) => t + (Number(u.rataNilai) || 0), 0) /
        filteredUnits.length
    );
    const rataKehadiran = round1(
      filteredUnits.reduce((t, u) => t + (Number(u.kehadiran) || 0), 0) /
        filteredUnits.length
    );
    return { rataNilai, rataKehadiran, totalSiswa, totalTuntas };
  }, [filteredUnits, ringkasan, jenjang, search]);

  const handleDownload = () => {
    const header = [
      "Unit Sekolah",
      "Jenjang",
      "Siswa",
      "Rata Nilai",
      "Kehadiran",
      "Tuntas KKM",
      "Persentase Tuntas",
    ];
    const rows = filteredUnits.map((unit) => {
      const persenTuntas =
        (Number(unit.siswa) || 0) > 0
          ? round1(
              ((Number(unit.tuntasKKM) || 0) / (Number(unit.siswa) || 1)) * 100
            )
          : 0;
      return [
        unit.namaSekolah,
        unit.jenjang,
        unit.siswa,
        unit.rataNilai,
        `${unit.kehadiran}%`,
        unit.tuntasKKM,
        `${persenTuntas}%`,
      ];
    });
    const csv = [header, ...rows]
      .map((row) =>
        row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob(["\ufeff" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `laporan-akademik-yayasan.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => router.push("/yayasan/laporan")}
                className="mb-1 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
              >
                <ChevronLeft size={13} /> Laporan & Analitik
              </button>

              <div className="flex items-center gap-2.5">
                <div
                  className={`shrink-0 rounded-lg p-2 ${themePrimaryGradient} text-white ${themeSmallShadow}`}
                >
                  <BookOpen size={18} />
                </div>
                <h1 className="theme-text truncate text-xl font-semibold sm:text-2xl">
                  Laporan Akademik
                </h1>
              </div>

              <p className="theme-text-secondary ml-[42px] mt-1 flex items-center gap-1.5 text-sm">
                <Sparkles
                  size={14}
                  className="shrink-0 text-[var(--color-text-muted)]"
                />
                <span className="truncate">
                  Rekap nilai dan kehadiran akademik per unit sekolah.
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              disabled={loading || filteredUnits.length === 0}
              className={`theme-primary flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${themeSmallShadow} disabled:opacity-50`}
            >
              <Download size={16} /> Unduh Laporan
            </button>
          </div>

          {/* Filter */}
          <div
            className={`theme-card theme-border rounded-xl border p-4 ${themeCardShadow}`}
          >
            <div className="flex flex-col flex-wrap gap-3 sm:flex-row">
              <div className="relative min-w-[140px] flex-1">
                <select
                  value={jenjang}
                  onChange={(e) => setJenjang(e.target.value)}
                  className={`theme-text-secondary w-full cursor-pointer appearance-none rounded-lg border py-2.5 pl-3 pr-9 text-sm font-medium transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)] ${themeNeutralSurface} theme-border ${themeNeutralHover}`}
                >
                  {JENJANG_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                />
              </div>

              <div className="relative min-w-[200px] flex-1">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama unit sekolah..."
                  className={`theme-text-secondary w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm transition-colors placeholder:text-[var(--color-text-placeholder)] focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)] ${themeNeutralSurface} theme-border`}
                />
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div
              className={`theme-card theme-border flex min-w-0 items-center gap-3 rounded-xl border p-3.5 ${themeSmallShadow}`}
            >
              <div className="shrink-0 rounded-lg border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] p-2">
                <BarChart3 size={16} className="theme-primary-text" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                  Rata Nilai
                </p>
                <p className="theme-text text-lg font-bold">
                  {loading ? "..." : summary.rataNilai ?? "—"}
                </p>
              </div>
            </div>

            <div
              className={`theme-card theme-border flex min-w-0 items-center gap-3 rounded-xl border p-3.5 ${themeSmallShadow}`}
            >
              <div className="shrink-0 rounded-lg border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] p-2">
                <TrendingUp size={16} className="theme-primary-text" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                  Rata Kehadiran
                </p>
                <p className="theme-text text-lg font-bold">
                  {loading
                    ? "..."
                    : summary.rataKehadiran != null
                      ? `${summary.rataKehadiran}%`
                      : "—"}
                </p>
              </div>
            </div>

            <div
              className={`theme-card theme-border flex min-w-0 items-center gap-3 rounded-xl border p-3.5 ${themeSmallShadow}`}
            >
              <div className="shrink-0 rounded-lg border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] p-2">
                <Users size={16} className="theme-primary-text" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                  Total Siswa
                </p>
                <p className="theme-text text-lg font-bold">
                  {loading ? "..." : summary.totalSiswa.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            <div
              className={`theme-card theme-border flex min-w-0 items-center gap-3 rounded-xl border p-3.5 ${themeSmallShadow}`}
            >
              <div className="shrink-0 rounded-lg border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] p-2">
                <CheckCircle2 size={16} className="theme-primary-text" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                  Tuntas (KKM {KKM})
                </p>
                <p className="theme-text text-lg font-bold">
                  {loading
                    ? "..."
                    : summary.totalTuntas.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>

          {/* Table */}
          <div
            className={`theme-card theme-border overflow-hidden rounded-xl border ${themeCardShadow}`}
          >
            <div
              className={`theme-divider flex items-center justify-between gap-2 border-b p-4 sm:p-5 ${themeDivider}`}
            >
              <h3 className="theme-text truncate text-sm font-semibold">
                Rekap per Unit Sekolah
              </h3>
              <span className="shrink-0 text-xs text-[var(--color-text-muted)]">
                {filteredUnits.length} unit
              </span>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className={themeNeutralSurface}>
                    <th className="theme-border whitespace-nowrap border px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)] sm:px-5">
                      Unit Sekolah
                    </th>
                    <th className="theme-border whitespace-nowrap border px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                      Jenjang
                    </th>
                    <th className="theme-border whitespace-nowrap border px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                      Siswa
                    </th>
                    <th className="theme-border whitespace-nowrap border px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                      Rata Nilai
                    </th>
                    <th className="theme-border whitespace-nowrap border px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                      Kehadiran
                    </th>
                    <th className="theme-border whitespace-nowrap border px-3 py-3 text-center text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                      Tuntas KKM
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="theme-border border p-10 text-center"
                      >
                        <Loader2
                          size={24}
                          className="mx-auto mb-2 animate-spin text-[var(--color-primary)]"
                        />
                        <p className="text-sm text-[var(--color-text-muted)]">
                          Memuat data akademik sekolah...
                        </p>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="theme-border border p-8 text-center text-[var(--color-danger)]"
                      >
                        <AlertCircle size={24} className="mx-auto mb-2" />
                        <p className="text-sm">{error}</p>
                        <button
                          type="button"
                          onClick={fetchAkademik}
                          className="mt-2 text-xs font-semibold underline"
                        >
                          Coba Lagi
                        </button>
                      </td>
                    </tr>
                  ) : filteredUnits.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="theme-border border p-10 text-center"
                      >
                        <Users
                          size={28}
                          className="mx-auto mb-2 text-[var(--color-text-placeholder)]"
                        />
                        <p className="theme-text text-sm font-semibold">
                          Tidak ada unit sekolah yang cocok.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredUnits.map((unit) => {
                      const siswa = Number(unit.siswa) || 0;
                      const tuntas = Number(unit.tuntasKKM) || 0;
                      const persenTuntas =
                        siswa > 0 ? round1((tuntas / siswa) * 100) : 0;
                      const tuntasStyle =
                        persenTuntas >= 80
                          ? `${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`
                          : `${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder}`;
                      return (
                        <tr
                          key={unit.sekolahId}
                          className={`${themeNeutralHover} transition-colors`}
                        >
                          <td className="theme-border whitespace-nowrap border px-4 py-3 sm:px-5">
                            <span className="theme-text text-sm font-medium">
                              {unit.namaSekolah}
                            </span>
                          </td>
                          <td className="theme-border whitespace-nowrap border px-3 py-3 text-center">
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${themeNeutralSurface} text-[var(--color-text-muted)] ${themeNeutralBorder}`}
                            >
                              {unit.jenjang}
                            </span>
                          </td>
                          <td className="theme-border theme-text-secondary whitespace-nowrap border px-3 py-3 text-center">
                            {siswa.toLocaleString("id-ID")}
                          </td>
                          <td className="theme-border whitespace-nowrap border px-3 py-3 text-center">
                            <span className="theme-text text-sm font-semibold">
                              {unit.rataNilai}
                            </span>
                          </td>
                          <td className="theme-border theme-text-secondary whitespace-nowrap border px-3 py-3 text-center">
                            {unit.kehadiran}%
                          </td>
                          <td className="theme-border whitespace-nowrap border px-3 py-3 text-center">
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${tuntasStyle}`}
                            >
                              {tuntas}/{siswa} ({persenTuntas}%)
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}