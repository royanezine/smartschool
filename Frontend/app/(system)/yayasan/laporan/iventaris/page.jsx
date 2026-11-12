"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Boxes,
  Search,
  ChevronDown,
  ChevronLeft,
  Sparkles,
  Package,
  AlertTriangle,
  Wallet,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Download,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getLaporanInventaris } from "@/services/yayasan.service";

const KONDISI_OPTIONS = ["Semua Kondisi", "Baik", "Perlu Perbaikan", "Rusak"];

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_80%,#000))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

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

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const formatRupiah = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const formatTanggal = (dateStr) => {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const kondisiStyle = (kondisi) => {
  if (kondisi === "Baik")
    return `${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`;
  if (kondisi === "Perlu Perbaikan")
    return `${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder}`;
  return `${themeNeutralSurface} text-[var(--color-text-muted)] ${themeNeutralBorder}`;
};

function SummaryCard({ icon: Icon, label, value, variant = "primary" }) {
  const dotColor =
    variant === "success"
      ? "bg-[var(--color-success)]"
      : variant === "warning"
        ? "bg-[var(--color-warning)]"
        : null;

  return (
    <div
      className={`theme-card theme-border flex min-w-0 items-center gap-3 rounded-xl border p-3.5 ${themeSmallShadow}`}
    >
      <div className="shrink-0 rounded-lg border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] p-2">
        <Icon size={16} className="theme-primary-text" />
      </div>
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 truncate text-[11px] font-medium uppercase tracking-wider theme-text-muted">
          {dotColor && <span className={`h-2 w-2 shrink-0 rounded-full ${dotColor}`} />}
          <span className="truncate">{label}</span>
        </p>
        <p className="theme-text truncate text-lg font-bold leading-tight">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function DataInventarisPage() {
  const router = useRouter();

  const [unit, setUnit] = useState("Semua Unit");
  const [unitOptions, setUnitOptions] = useState(["Semua Unit"]);
  const [kategori, setKategori] = useState("Semua Kategori");
  const [kategoriOptions, setKategoriOptions] = useState(["Semua Kategori"]);
  const [kondisi, setKondisi] = useState(KONDISI_OPTIONS[0]);
  const [search, setSearch] = useState("");
  const [daftarBarang, setDaftarBarang] = useState([]);
  const [ringkasan, setRingkasan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInventaris = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getLaporanInventaris({ limit: "500" });
      const d = res?.data || res || {};
      setRingkasan(d.ringkasan || null);
      const items = Array.isArray(d.daftarBarang) ? d.daftarBarang : [];
      setDaftarBarang(items);

      const units = [
        ...new Set(items.map((it) => it.unitSekolah).filter(Boolean)),
      ];
      if (units.length > 0) setUnitOptions(["Semua Unit", ...units.sort()]);
      const kats = [...new Set(items.map((it) => it.kategori).filter(Boolean))];
      if (kats.length > 0)
        setKategoriOptions(["Semua Kategori", ...kats.sort()]);
    } catch (err) {
      setError(err?.message || "Gagal memuat laporan inventaris yayasan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await getLaporanInventaris({ limit: "500" });
        if (cancelled) return;
        const d = res?.data || res || {};
        setRingkasan(d.ringkasan || null);
        const items = Array.isArray(d.daftarBarang) ? d.daftarBarang : [];
        setDaftarBarang(items);
        const units = [
          ...new Set(items.map((it) => it.unitSekolah).filter(Boolean)),
        ];
        if (units.length > 0) setUnitOptions(["Semua Unit", ...units.sort()]);
        const kats = [
          ...new Set(items.map((it) => it.kategori).filter(Boolean)),
        ];
        if (kats.length > 0)
          setKategoriOptions(["Semua Kategori", ...kats.sort()]);
      } catch (err) {
        if (!cancelled)
          setError(err?.message || "Gagal memuat laporan inventaris yayasan.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredInventaris = useMemo(() => {
    return daftarBarang.filter((it) => {
      const matchUnit = unit === "Semua Unit" || it.unitSekolah === unit;
      const matchKategori =
        kategori === "Semua Kategori" || it.kategori === kategori;
      const matchKondisi =
        kondisi === "Semua Kondisi" || it.kondisi === kondisi;
      const sv = search.toLowerCase().trim();
      const matchSearch =
        !sv ||
        it.namaBarang?.toLowerCase().includes(sv) ||
        it.lokasi?.toLowerCase().includes(sv);
      return matchUnit && matchKategori && matchKondisi && matchSearch;
    });
  }, [daftarBarang, unit, kategori, kondisi, search]);

  const summaryCards = useMemo(() => {
    if (
      ringkasan &&
      unit === "Semua Unit" &&
      kategori === "Semua Kategori" &&
      kondisi === "Semua Kondisi" &&
      !search.trim()
    ) {
      return {
        totalItem: Number(ringkasan.totalUnitBarang) || 0,
        totalNilai: Number(ringkasan.totalNilaiAset) || 0,
        totalBaik: Number(ringkasan.kondisiBaik) || 0,
        totalBermasalah: Number(ringkasan.perluPerhatian) || 0,
      };
    }
    const totalItem = filteredInventaris.reduce(
      (a, it) => a + (Number(it.jumlah) || 0),
      0
    );
    const totalNilai = filteredInventaris.reduce(
      (a, it) => a + (Number(it.nilaiAset) || 0),
      0
    );
    const totalBaik = filteredInventaris.filter(
      (it) => it.kondisi === "Baik"
    ).length;
    const totalBermasalah = filteredInventaris.filter(
      (it) => it.kondisi !== "Baik"
    ).length;
    return { totalItem, totalNilai, totalBaik, totalBermasalah };
  }, [filteredInventaris, ringkasan, unit, kategori, kondisi, search]);

  const handleDownload = () => {
    const header = [
      "Nama Barang",
      "Kategori",
      "Unit Sekolah",
      "Lokasi",
      "Jumlah",
      "Kondisi",
      "Nilai Aset",
      "Tgl. Perolehan",
    ];
    const rows = filteredInventaris.map((it) => [
      it.namaBarang,
      it.kategori,
      it.unitSekolah,
      it.lokasi,
      it.jumlah,
      it.kondisi,
      it.nilaiAset,
      formatTanggal(it.tanggalPerolehan),
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
    link.download = "laporan-inventaris-yayasan.csv";
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
                className="theme-text-muted mb-1 inline-flex items-center gap-1 text-xs font-medium transition-colors hover:text-[var(--color-primary)]"
              >
                <ChevronLeft size={13} /> Laporan & Analitik
              </button>

              <div className="flex items-center gap-2.5">
                <div
                  className={`shrink-0 rounded-lg p-2 ${themePrimaryGradient} text-white ${themeSmallShadow}`}
                >
                  <Boxes size={18} />
                </div>
                <h1 className="theme-text truncate text-xl font-semibold sm:text-2xl">
                  Data Inventaris
                </h1>
              </div>

              <p className="theme-text-secondary ml-[42px] mt-1 flex items-center gap-1.5 text-sm">
                <Sparkles
                  size={14}
                  className="theme-primary-text shrink-0"
                />
                <span className="truncate">
                  Rekap aset dan barang inventaris seluruh unit sekolah.
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              disabled={loading || filteredInventaris.length === 0}
              className={`theme-primary inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${themeSmallShadow} disabled:opacity-50`}
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
                  className="theme-text-muted absolute left-3 top-1/2 -translate-y-1/2"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama barang atau lokasi..."
                  className={`theme-text theme-neutral-surface theme-border w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-[var(--color-text-placeholder)] ${themeFocus}`}
                />
              </div>

              <div className="relative min-w-[180px] flex-1">
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className={`theme-text-secondary theme-neutral-surface theme-border w-full cursor-pointer appearance-none rounded-lg border py-2.5 pl-3 pr-9 text-sm font-medium outline-none transition-colors ${themeFocus}`}
                >
                  {unitOptions.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                />
              </div>

              <div className="relative min-w-[160px] flex-1">
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className={`theme-text-secondary theme-neutral-surface theme-border w-full cursor-pointer appearance-none rounded-lg border py-2.5 pl-3 pr-9 text-sm font-medium outline-none transition-colors ${themeFocus}`}
                >
                  {kategoriOptions.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                />
              </div>

              <div className="relative min-w-[160px] flex-1">
                <select
                  value={kondisi}
                  onChange={(e) => setKondisi(e.target.value)}
                  className={`theme-text-secondary theme-neutral-surface theme-border w-full cursor-pointer appearance-none rounded-lg border py-2.5 pl-3 pr-9 text-sm font-medium outline-none transition-colors ${themeFocus}`}
                >
                  {KONDISI_OPTIONS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                />
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              icon={Package}
              label="Total Unit Barang"
              value={
                loading
                  ? "..."
                  : summaryCards.totalItem.toLocaleString("id-ID")
              }
              variant="primary"
            />
            <SummaryCard
              icon={Wallet}
              label="Total Nilai Aset"
              value={loading ? "..." : formatRupiah(summaryCards.totalNilai)}
              variant="info"
            />
            <SummaryCard
              icon={CheckCircle2}
              label="Kondisi Baik"
              value={loading ? "..." : summaryCards.totalBaik}
              variant="success"
            />
            <SummaryCard
              icon={AlertTriangle}
              label="Perlu Perhatian"
              value={loading ? "..." : summaryCards.totalBermasalah}
              variant="warning"
            />
          </div>

          {/* Table */}
          <div
            className={`theme-card theme-border overflow-hidden rounded-xl border ${themeCardShadow}`}
          >
            <div
              className={`theme-border flex items-center justify-between gap-2 border-b p-4 sm:p-5 ${themeDivider}`}
            >
              <h3 className="theme-text-secondary truncate text-sm font-semibold">
                Daftar Barang Inventaris
              </h3>
              <span className="theme-text-muted shrink-0 text-xs">
                {filteredInventaris.length} jenis barang
              </span>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[920px] border-collapse text-sm">
                <thead>
                  <tr className={themeNeutralSurface}>
                    <th
                      className={`theme-text-muted border ${themeNeutralBorder} whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider sm:px-5`}
                    >
                      Nama Barang
                    </th>
                    <th
                      className={`theme-text-muted border ${themeNeutralBorder} whitespace-nowrap px-3 py-3 text-left text-xs font-medium uppercase tracking-wider`}
                    >
                      Kategori
                    </th>
                    <th
                      className={`theme-text-muted border ${themeNeutralBorder} whitespace-nowrap px-3 py-3 text-left text-xs font-medium uppercase tracking-wider`}
                    >
                      Unit Sekolah
                    </th>
                    <th
                      className={`theme-text-muted border ${themeNeutralBorder} whitespace-nowrap px-3 py-3 text-left text-xs font-medium uppercase tracking-wider`}
                    >
                      Lokasi
                    </th>
                    <th
                      className={`theme-text-muted border ${themeNeutralBorder} whitespace-nowrap px-3 py-3 text-center text-xs font-medium uppercase tracking-wider`}
                    >
                      Jumlah
                    </th>
                    <th
                      className={`theme-text-muted border ${themeNeutralBorder} whitespace-nowrap px-3 py-3 text-center text-xs font-medium uppercase tracking-wider`}
                    >
                      Kondisi
                    </th>
                    <th
                      className={`theme-text-muted border ${themeNeutralBorder} whitespace-nowrap px-3 py-3 text-right text-xs font-medium uppercase tracking-wider`}
                    >
                      Nilai Aset
                    </th>
                    <th
                      className={`theme-text-muted border ${themeNeutralBorder} whitespace-nowrap px-3 py-3 text-center text-xs font-medium uppercase tracking-wider`}
                    >
                      Tgl. Perolehan
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={8}
                        className={`border ${themeNeutralBorder} p-10 text-center`}
                      >
                        <Loader2
                          size={28}
                          className="mx-auto mb-2 animate-spin text-[var(--color-primary)]"
                        />
                        <p className="theme-text-muted text-sm">
                          Memuat data inventaris yayasan...
                        </p>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td
                        colSpan={8}
                        className={`border ${themeNeutralBorder} p-8 text-center text-[var(--color-danger)]`}
                      >
                        <AlertCircle size={28} className="mx-auto mb-2" />
                        <p className="text-sm">{error}</p>
                        <button
                          type="button"
                          onClick={fetchInventaris}
                          className="mt-2 text-xs font-semibold underline"
                        >
                          Coba Lagi
                        </button>
                      </td>
                    </tr>
                  ) : filteredInventaris.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className={`border ${themeNeutralBorder} p-10 text-center`}
                      >
                        <Package
                          size={28}
                          className="theme-text-placeholder mx-auto mb-2"
                        />
                        <p className="theme-text text-sm font-semibold">
                          Tidak ada barang yang cocok.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredInventaris.map((it) => (
                      <tr
                        key={it.id}
                        className={`border-b ${themeDivider} ${themeNeutralHover} transition-colors`}
                      >
                        <td
                          className={`border-x ${themeNeutralBorder} whitespace-nowrap px-4 py-3 sm:px-5`}
                        >
                          <span className="theme-text text-sm font-medium">
                            {it.namaBarang}
                          </span>
                        </td>
                        <td
                          className={`border-x ${themeNeutralBorder} whitespace-nowrap px-3 py-3`}
                        >
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${themeNeutralSurface} theme-text-secondary ${themeNeutralBorder}`}
                          >
                            {it.kategori}
                          </span>
                        </td>
                        <td
                          className={`border-x ${themeNeutralBorder} theme-text-secondary whitespace-nowrap px-3 py-3`}
                        >
                          {it.unitSekolah}
                        </td>
                        <td
                          className={`border-x ${themeNeutralBorder} theme-text-secondary whitespace-nowrap px-3 py-3`}
                        >
                          {it.lokasi}
                        </td>
                        <td
                          className={`border-x ${themeNeutralBorder} theme-text-secondary whitespace-nowrap px-3 py-3 text-center`}
                        >
                          {(Number(it.jumlah) || 0).toLocaleString("id-ID")}
                        </td>
                        <td
                          className={`border-x ${themeNeutralBorder} whitespace-nowrap px-3 py-3 text-center`}
                        >
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${kondisiStyle(it.kondisi)}`}
                          >
                            {it.kondisi}
                          </span>
                        </td>
                        <td
                          className={`border-x ${themeNeutralBorder} whitespace-nowrap px-3 py-3 text-right`}
                        >
                          <span className="theme-text text-sm font-semibold">
                            {formatRupiah(Number(it.nilaiAset) || 0)}
                          </span>
                        </td>
                        <td
                          className={`border-x ${themeNeutralBorder} theme-text-muted whitespace-nowrap px-3 py-3 text-center`}
                        >
                          {formatTanggal(it.tanggalPerolehan)}
                        </td>
                      </tr>
                    ))
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