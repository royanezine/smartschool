"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  School,
  Venus,
  Mars,
  MapPin,
  Download,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getLaporanSiswa } from "@/services/yayasan.service";

const JENJANG_OPTIONS = ["Semua Jenjang", "SD", "SMP", "SMA"];

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

export default function DataSiswaPage() {
  const router = useRouter();

  const [jenjang, setJenjang] = useState(JENJANG_OPTIONS[0]);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const [perSekolah, setPerSekolah] = useState([]);
  const [ringkasan, setRingkasan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSiswa = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getLaporanSiswa();
      const d = res?.data || res || {};
      setRingkasan(d.ringkasan || null);
      setPerSekolah(Array.isArray(d.perSekolah) ? d.perSekolah : []);
    } catch (err) {
      setError(err?.message || "Gagal memuat data siswa.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await getLaporanSiswa();
        if (cancelled) return;
        const d = res?.data || res || {};
        setRingkasan(d.ringkasan || null);
        setPerSekolah(Array.isArray(d.perSekolah) ? d.perSekolah : []);
      } catch (err) {
        if (!cancelled) setError(err?.message || "Gagal memuat data siswa.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredSekolah = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return perSekolah.filter((s) => {
      const matchJenjang = jenjang === "Semua Jenjang" || s.jenjang === jenjang;
      const matchSearch =
        !keyword ||
        s.namaSekolah?.toLowerCase().includes(keyword) ||
        s.alamat?.toLowerCase().includes(keyword);
      return matchJenjang && matchSearch;
    });
  }, [perSekolah, jenjang, search]);

  const summary = useMemo(() => {
    if (jenjang === "Semua Jenjang" && !search.trim() && ringkasan) {
      return {
        totalSiswa: Number(ringkasan.totalSiswa) || 0,
        totalUnit: Number(ringkasan.totalUnit) || 0,
        laki: Number(ringkasan.totalLakiLaki) || 0,
        perempuan: Number(ringkasan.totalPerempuan) || 0,
      };
    }
    const totalSiswa = filteredSekolah.reduce(
      (a, s) => a + (Number(s.total) || 0),
      0
    );
    const laki = filteredSekolah.reduce(
      (a, s) => a + (Number(s.lakiLaki) || 0),
      0
    );
    const perempuan = filteredSekolah.reduce(
      (a, s) => a + (Number(s.perempuan) || 0),
      0
    );
    return { totalSiswa, totalUnit: filteredSekolah.length, laki, perempuan };
  }, [filteredSekolah, ringkasan, jenjang, search]);

  const toggleExpand = (id) =>
    setExpandedId((prev) => (prev === id ? null : id));

  const handleDownload = () => {
    const header = [
      "Nama Sekolah",
      "Jenjang",
      "Alamat",
      "Laki-laki",
      "Perempuan",
      "Total",
    ];
    const rows = filteredSekolah.map((s) => [
      s.namaSekolah,
      s.jenjang,
      s.alamat || "-",
      s.lakiLaki,
      s.perempuan,
      s.total,
    ]);
    const csv = [header, ...rows]
      .map((row) =>
        row.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "laporan-siswa-yayasan.csv";
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
                  className={`shrink-0 rounded-lg p-2 ${themePrimaryGradient} text-[var(--color-card)] ${themeSmallShadow}`}
                >
                  <Users size={18} />
                </div>
                <h1 className="theme-text truncate text-xl font-semibold sm:text-2xl">
                  Data Siswa
                </h1>
              </div>

              <p className="theme-text-secondary ml-[42px] mt-1 flex items-center gap-1.5 text-sm">
                <Sparkles
                  size={14}
                  className="shrink-0 text-[var(--color-primary)]"
                />
                <span className="truncate">
                  Total siswa per unit sekolah — klik untuk lihat rincian.
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              disabled={loading || filteredSekolah.length === 0}
              className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-[var(--color-card)] shadow-[0_4px_12px_color-mix(in_srgb,var(--color-primary)_16%,transparent)] transition-colors hover:bg-[color-mix(in_srgb,var(--color-primary)_88%,var(--color-text))] disabled:opacity-50"
            >
              <Download size={16} /> Unduh Laporan
            </button>
          </div>

          {/* Filter */}
          <div
            className={`theme-card theme-border rounded-xl border p-4 ${themeCardShadow}`}
          >
            <div className="flex flex-col flex-wrap gap-3 sm:flex-row">
              <div className="relative min-w-[200px] flex-1">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama sekolah..."
                  className={`theme-input w-full rounded-lg py-2.5 pl-9 pr-3 text-sm transition-colors placeholder:text-[var(--color-text-placeholder)] ${themeFocus}`}
                />
              </div>
              <div className="relative min-w-[160px] flex-1">
                <select
                  value={jenjang}
                  onChange={(e) => setJenjang(e.target.value)}
                  className={`theme-input w-full cursor-pointer appearance-none rounded-lg py-2.5 pl-3 pr-9 text-sm font-medium transition-colors ${themeFocus}`}
                >
                  {JENJANG_OPTIONS.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                />
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6">
            <div
              className={`theme-card theme-border flex min-w-0 items-center gap-3 rounded-xl border p-3.5 ${themeCardShadow}`}
            >
              <div
                className={`shrink-0 rounded-lg border p-2 ${themePrimarySoft} ${themePrimarySoftBorder} text-[var(--color-primary)]`}
              >
                <Users size={16} />
              </div>
              <div className="min-w-0">
                <p className="theme-text-muted truncate text-[11px] font-medium uppercase tracking-wider">
                  Total Siswa
                </p>
                <p className="theme-text text-lg font-bold">
                  {loading ? "..." : summary.totalSiswa.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            <div
              className={`theme-card theme-border flex min-w-0 items-center gap-3 rounded-xl border p-3.5 ${themeCardShadow}`}
            >
              <div className="shrink-0 rounded-lg border border-[color-mix(in_srgb,var(--color-info)_22%,transparent)] bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)] p-2 text-[var(--color-info)]">
                <School size={16} />
              </div>
              <div className="min-w-0">
                <p className="theme-text-muted truncate text-[11px] font-medium uppercase tracking-wider">
                  Unit Sekolah
                </p>
                <p className="theme-text text-lg font-bold">
                  {loading ? "..." : summary.totalUnit}
                </p>
              </div>
            </div>

            <div
              className={`theme-card theme-border flex min-w-0 items-center gap-3 rounded-xl border p-3.5 ${themeCardShadow}`}
            >
              <div className="shrink-0 rounded-lg border border-[color-mix(in_srgb,var(--color-info)_22%,transparent)] bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)] p-2 text-[var(--color-info)]">
                <Mars size={16} />
              </div>
              <div className="min-w-0">
                <p className="theme-text-muted truncate text-[11px] font-medium uppercase tracking-wider">
                  Siswa Laki-laki
                </p>
                <p className="theme-text text-lg font-bold">
                  {loading ? "..." : summary.laki.toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            <div
              className={`theme-card theme-border flex min-w-0 items-center gap-3 rounded-xl border p-3.5 ${themeCardShadow}`}
            >
              <div className="shrink-0 rounded-lg border border-[color-mix(in_srgb,var(--color-warning)_22%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)] p-2 text-[var(--color-warning)]">
                <Venus size={16} />
              </div>
              <div className="min-w-0">
                <p className="theme-text-muted truncate text-[11px] font-medium uppercase tracking-wider">
                  Siswa Perempuan
                </p>
                <p className="theme-text text-lg font-bold">
                  {loading ? "..." : summary.perempuan.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>

          {/* List Per Sekolah */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="theme-text text-sm font-semibold">
                Per Unit Sekolah
              </h3>
              <span className="theme-text-muted text-xs">
                {filteredSekolah.length} unit
              </span>
            </div>

            {loading ? (
              <div
                className={`theme-card theme-border rounded-xl border p-12 text-center ${themeCardShadow}`}
              >
                <Loader2
                  size={32}
                  className="mx-auto mb-3 animate-spin text-[var(--color-primary)]"
                />
                <p className="theme-text-muted text-sm">
                  Memuat data siswa...
                </p>
              </div>
            ) : error ? (
              <div
                className={`theme-card rounded-xl border border-[var(--color-danger)]/20 p-8 text-center ${themeCardShadow}`}
              >
                <AlertCircle
                  size={32}
                  className="mx-auto mb-2 text-[var(--color-danger)]"
                />
                <p className="theme-text text-sm font-medium">{error}</p>
                <button
                  type="button"
                  onClick={fetchSiswa}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white"
                >
                  <RefreshCw size={12} /> Coba Lagi
                </button>
              </div>
            ) : filteredSekolah.length === 0 ? (
              <div
                className={`theme-card theme-border rounded-xl border p-10 text-center ${themeCardShadow}`}
              >
                <Users
                  size={28}
                  className="mx-auto mb-2 text-[var(--color-text-placeholder)]"
                />
                <p className="theme-text-muted text-sm">
                  Tidak ada sekolah yang cocok.
                </p>
              </div>
            ) : (
              filteredSekolah.map((s) => {
                const total = Number(s.total) || 0;
                const lk = Number(s.lakiLaki) || 0;
                const pr = Number(s.perempuan) || 0;
                const isOpen = expandedId === s.sekolahId;

                return (
                  <div
                    key={s.sekolahId}
                    className={`theme-card theme-border overflow-hidden rounded-xl border ${themeCardShadow}`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleExpand(s.sekolahId)}
                      className={`flex w-full items-center justify-between gap-3 p-4 text-left transition-colors sm:p-5 ${themeNeutralHover}`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`shrink-0 rounded-lg border p-2.5 ${themePrimarySoft} ${themePrimarySoftBorder} text-[var(--color-primary)]`}
                        >
                          <School size={17} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="theme-text truncate text-sm font-semibold">
                              {s.namaSekolah}
                            </p>
                            <span className="shrink-0 rounded-full border border-[color-mix(in_srgb,var(--color-text)_12%,transparent)] bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-text-muted)]">
                              {s.jenjang || "Umum"}
                            </span>
                          </div>
                          <p className="theme-text-muted mt-0.5 flex items-center gap-1 truncate text-xs">
                            <MapPin size={11} className="shrink-0" />
                            {s.alamat || "-"}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-4">
                        <div className="theme-text-secondary hidden items-center gap-3 text-xs sm:flex">
                          <span className="flex items-center gap-1">
                            <Mars size={12} className="text-[var(--color-info)]" />
                            {lk}
                          </span>
                          <span className="flex items-center gap-1">
                            <Venus
                              size={12}
                              className="text-[var(--color-warning)]"
                            />
                            {pr}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="theme-text text-base font-bold">
                            {total.toLocaleString("id-ID")}
                          </span>
                          <span className="theme-text-muted ml-1 text-xs">
                            siswa
                          </span>
                        </div>
                        <ChevronRight
                          size={16}
                          className={`shrink-0 text-[var(--color-text-muted)] transition-transform ${
                            isOpen ? "rotate-90" : ""
                          }`}
                        />
                      </div>
                    </button>

                    {isOpen && (
                      <div
                        className={`border-t ${themeDivider} bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)]`}
                      >
                        <div className="theme-text-muted flex flex-col gap-2 p-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
                          <div className="flex flex-wrap items-center gap-4">
                            <span className="flex items-center gap-1.5">
                              <Mars size={13} className="text-[var(--color-info)]" />{" "}
                              Laki-laki:{" "}
                              <strong className="theme-text">
                                {lk.toLocaleString("id-ID")}
                              </strong>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Venus
                                size={13}
                                className="text-[var(--color-warning)]"
                              />{" "}
                              Perempuan:{" "}
                              <strong className="theme-text">
                                {pr.toLocaleString("id-ID")}
                              </strong>
                            </span>
                          </div>
                          <span className="theme-text whitespace-nowrap font-semibold">
                            {total.toLocaleString("id-ID")} Siswa
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}