"use client";

import { useState, useMemo } from "react";
import {
  Boxes,
  Search,
  ChevronDown,
  ChevronLeft,
  Sparkles,
  PackagePlus,
  Package,
  AlertTriangle,
  Wallet,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";

// ============================================================
// DUMMY DATA
// Catatan: ganti dengan data asli dari API/DB begitu tersedia.
// ============================================================

const UNIT_OPTIONS = [
  "Semua Unit",
  "SD Smart School 1",
  "SD Smart School 2",
  "SMP Smart School 1",
  "SMP Smart School 2",
  "SMA Smart School 1",
  "SMA Smart School 2",
];

const KATEGORI_OPTIONS = [
  "Semua Kategori",
  "Elektronik",
  "Furnitur",
  "Laboratorium",
  "Olahraga",
  "Buku & ATK",
];

const KONDISI_OPTIONS = [
  "Semua Kondisi",
  "Baik",
  "Perlu Perbaikan",
  "Rusak",
];

const dataInventaris = [
  {
    id: 1,
    nama: "Proyektor Epson EB-X41",
    kategori: "Elektronik",
    unit: "SMP Smart School 1",
    lokasi: "Ruang Kelas 8A",
    jumlah: 3,
    kondisi: "Baik",
    nilai: 15000000,
    tanggal: "12 Jan 2023",
  },
  {
    id: 2,
    nama: "Kursi Siswa Lipat",
    kategori: "Furnitur",
    unit: "SD Smart School 1",
    lokasi: "Gudang Utama",
    jumlah: 120,
    kondisi: "Baik",
    nilai: 36000000,
    tanggal: "03 Jul 2022",
  },
  {
    id: 3,
    nama: "Mikroskop Binokuler",
    kategori: "Laboratorium",
    unit: "SMA Smart School 1",
    lokasi: "Lab IPA",
    jumlah: 15,
    kondisi: "Perlu Perbaikan",
    nilai: 22500000,
    tanggal: "20 Mar 2021",
  },
  {
    id: 4,
    nama: "Bola Basket Molten",
    kategori: "Olahraga",
    unit: "SMP Smart School 2",
    lokasi: "Gudang Olahraga",
    jumlah: 10,
    kondisi: "Baik",
    nilai: 3500000,
    tanggal: "15 Aug 2024",
  },
  {
    id: 5,
    nama: "Laptop Lenovo ThinkPad E14",
    kategori: "Elektronik",
    unit: "SMA Smart School 2",
    lokasi: "Lab Komputer",
    jumlah: 25,
    kondisi: "Baik",
    nilai: 187500000,
    tanggal: "09 Feb 2023",
  },
  {
    id: 6,
    nama: "Papan Tulis Whiteboard",
    kategori: "Furnitur",
    unit: "SD Smart School 2",
    lokasi: "Ruang Kelas 3B",
    jumlah: 8,
    kondisi: "Rusak",
    nilai: 4000000,
    tanggal: "28 May 2019",
  },
  {
    id: 7,
    nama: "AC Split 1 PK",
    kategori: "Elektronik",
    unit: "SMP Smart School 1",
    lokasi: "Ruang Guru",
    jumlah: 6,
    kondisi: "Baik",
    nilai: 27000000,
    tanggal: "11 Nov 2023",
  },
  {
    id: 8,
    nama: "Rak Buku Perpustakaan",
    kategori: "Furnitur",
    unit: "SMA Smart School 1",
    lokasi: "Perpustakaan",
    jumlah: 18,
    kondisi: "Baik",
    nilai: 21600000,
    tanggal: "04 Sep 2020",
  },
  {
    id: 9,
    nama: "Set Alat Peraga Fisika",
    kategori: "Laboratorium",
    unit: "SMA Smart School 1",
    lokasi: "Lab Fisika",
    jumlah: 5,
    kondisi: "Perlu Perbaikan",
    nilai: 18000000,
    tanggal: "17 Oct 2021",
  },
  {
    id: 10,
    nama: "Buku Paket Matematika Kelas 7",
    kategori: "Buku & ATK",
    unit: "SMP Smart School 2",
    lokasi: "Perpustakaan",
    jumlah: 300,
    kondisi: "Baik",
    nilai: 21000000,
    tanggal: "02 Jul 2024",
  },
  {
    id: 11,
    nama: "Meja Guru",
    kategori: "Furnitur",
    unit: "SD Smart School 1",
    lokasi: "Ruang Kelas 1A",
    jumlah: 12,
    kondisi: "Rusak",
    nilai: 6000000,
    tanggal: "19 Apr 2018",
  },
  {
    id: 12,
    nama: "Printer Epson L3110",
    kategori: "Elektronik",
    unit: "SD Smart School 2",
    lokasi: "Ruang TU",
    jumlah: 4,
    kondisi: "Baik",
    nilai: 6800000,
    tanggal: "25 Dec 2023",
  },
];

// ============================================================
// HELPERS THEME
// ============================================================

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

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

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";

// ============================================================
// FORMAT
// ============================================================

const formatRupiah = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

// ============================================================
// STATUS KONDISI
// ============================================================

const kondisiStyle = (kondisi) => {
  if (kondisi === "Baik") {
    return `${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`;
  }

  if (kondisi === "Perlu Perbaikan") {
    return `${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder}`;
  }

  return `${themeNeutralSurface} text-[var(--color-text-muted)] ${themeNeutralBorder}`;
};

// ============================================================
// SUMMARY CARD
// ============================================================

function SummaryCard({ icon: Icon, label, value, variant = "primary" }) {
  const variants = {
    primary: `${themePrimarySoft} text-[var(--color-primary)] ${themePrimarySoftBorder}`,
    success: `${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`,
    warning: `${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder}`,
    info: `${themeInfoSurface} text-[var(--color-info)] ${themeInfoBorder}`,
    neutral: `${themeNeutralSurface} text-[var(--color-text-muted)] ${themeNeutralBorder}`,
  };

  return (
    <div
      className={`theme-card rounded-xl border theme-border p-3.5 ${themeSmallShadow} flex items-center gap-3 min-w-0`}
    >
      <div
        className={`p-2 rounded-lg border flex-shrink-0 ${variants[variant]}`}
      >
        <Icon size={16} />
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wider truncate">
          {label}
        </p>

        <p className="text-lg font-bold theme-text leading-tight truncate">
          {value}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function DataInventarisPage() {
  const router = useRouter();

  const [unit, setUnit] = useState(UNIT_OPTIONS[0]);
  const [kategori, setKategori] = useState(KATEGORI_OPTIONS[0]);
  const [kondisi, setKondisi] = useState(KONDISI_OPTIONS[0]);
  const [search, setSearch] = useState("");

  // ==========================================================
  // FILTER DATA
  // ==========================================================

  const filteredInventaris = useMemo(() => {
    return dataInventaris.filter((it) => {
      const matchUnit =
        unit === "Semua Unit" || it.unit === unit;

      const matchKategori =
        kategori === "Semua Kategori" ||
        it.kategori === kategori;

      const matchKondisi =
        kondisi === "Semua Kondisi" ||
        it.kondisi === kondisi;

      const searchValue = search.toLowerCase().trim();

      const matchSearch =
        !searchValue ||
        it.nama.toLowerCase().includes(searchValue) ||
        it.lokasi.toLowerCase().includes(searchValue);

      return (
        matchUnit &&
        matchKategori &&
        matchKondisi &&
        matchSearch
      );
    });
  }, [unit, kategori, kondisi, search]);

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const summary = useMemo(() => {
    const totalItem = filteredInventaris.reduce(
      (a, it) => a + it.jumlah,
      0
    );

    const totalNilai = filteredInventaris.reduce(
      (a, it) => a + it.nilai,
      0
    );

    const totalBaik = filteredInventaris.filter(
      (it) => it.kondisi === "Baik"
    ).length;

    const totalBermasalah = filteredInventaris.filter(
      (it) => it.kondisi !== "Baik"
    ).length;

    return {
      totalItem,
      totalNilai,
      totalBaik,
      totalBermasalah,
    };
  }, [filteredInventaris]);

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="w-full max-w-[1800px] mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="space-y-6">

          {/* ==================================================
              PAGE HEADER
          ================================================== */}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => router.push("/yayasan/laporan")}
                className="inline-flex items-center gap-1 text-xs font-medium theme-text-muted hover:text-[var(--color-primary)] transition-colors mb-1"
              >
                <ChevronLeft size={13} />
                Laporan & Analitik
              </button>

              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-lg ${themePrimaryGradient} text-[var(--color-card)] ${themeSmallShadow} flex-shrink-0`}
                >
                  <Boxes size={18} />
                </div>

                <h1 className="text-xl sm:text-2xl font-semibold theme-text truncate">
                  Data Inventaris
                </h1>
              </div>

              <p className="theme-text-secondary text-sm mt-1 ml-[42px] flex items-center gap-1.5">
                <Sparkles
                  size={14}
                  className="text-[var(--color-primary)] flex-shrink-0"
                />

                <span className="truncate">
                  Rekap aset dan barang inventaris seluruh unit sekolah.
                </span>
              </p>
            </div>

            <button
              type="button"
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[var(--color-card)] bg-[var(--color-primary)] ${themePrimaryHover} rounded-lg transition-colors ${themeSmallShadow} whitespace-nowrap flex-shrink-0`}
            >
              <PackagePlus size={16} />
              Tambah Barang
            </button>
          </div>

          {/* ==================================================
              FILTER BAR
          ================================================== */}

          <div
            className={`theme-card rounded-xl theme-border border p-4 ${themeCardShadow}`}
          >
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">

              {/* SEARCH */}
              <div className="relative flex-1 min-w-[200px]">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama barang atau lokasi..."
                  className={`w-full pl-9 pr-3 py-2.5 text-sm theme-text theme-neutral-surface border theme-border rounded-lg outline-none transition-colors placeholder:text-[var(--color-text-placeholder)] ${themeFocus}`}
                />
              </div>

              {/* UNIT */}
              <div className="relative flex-1 min-w-[180px]">
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className={`w-full appearance-none pl-3 pr-9 py-2.5 text-sm font-medium theme-text-secondary theme-neutral-surface border theme-border rounded-lg outline-none transition-colors cursor-pointer ${themeFocus}`}
                >
                  {UNIT_OPTIONS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted pointer-events-none"
                />
              </div>

              {/* KATEGORI */}
              <div className="relative flex-1 min-w-[160px]">
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className={`w-full appearance-none pl-3 pr-9 py-2.5 text-sm font-medium theme-text-secondary theme-neutral-surface border theme-border rounded-lg outline-none transition-colors cursor-pointer ${themeFocus}`}
                >
                  {KATEGORI_OPTIONS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted pointer-events-none"
                />
              </div>

              {/* KONDISI */}
              <div className="relative flex-1 min-w-[160px]">
                <select
                  value={kondisi}
                  onChange={(e) => setKondisi(e.target.value)}
                  className={`w-full appearance-none pl-3 pr-9 py-2.5 text-sm font-medium theme-text-secondary theme-neutral-surface border theme-border rounded-lg outline-none transition-colors cursor-pointer ${themeFocus}`}
                >
                  {KONDISI_OPTIONS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* ==================================================
              SUMMARY CARDS
          ================================================== */}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard
              icon={Package}
              label="Total Unit Barang"
              value={summary.totalItem.toLocaleString("id-ID")}
              variant="primary"
            />

            <SummaryCard
              icon={Wallet}
              label="Total Nilai Aset"
              value={formatRupiah(summary.totalNilai)}
              variant="info"
            />

            <SummaryCard
              icon={CheckCircle2}
              label="Kondisi Baik"
              value={summary.totalBaik}
              variant="success"
            />

            <SummaryCard
              icon={AlertTriangle}
              label="Perlu Perhatian"
              value={summary.totalBermasalah}
              variant="warning"
            />
          </div>

          {/* ==================================================
              TABEL INVENTARIS
          ================================================== */}

          <div
            className={`theme-card rounded-xl theme-border border ${themeCardShadow} overflow-hidden`}
          >
            {/* TABLE HEADER */}
            <div
              className={`p-4 sm:p-5 border-b ${themeDivider} flex items-center justify-between gap-2`}
            >
              <h3 className="text-sm font-semibold theme-text-secondary truncate">
                Daftar Barang Inventaris
              </h3>

              <span className="text-xs theme-text-muted flex-shrink-0">
                {filteredInventaris.length} jenis barang
              </span>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[920px] text-sm border-collapse">
                <thead>
                  <tr className={themeNeutralSurface}>
                    <th
                      className={`border ${themeNeutralBorder} text-left font-medium theme-text-muted text-xs uppercase tracking-wider px-4 sm:px-5 py-3 whitespace-nowrap`}
                    >
                      Nama Barang
                    </th>

                    <th
                      className={`border ${themeNeutralBorder} text-left font-medium theme-text-muted text-xs uppercase tracking-wider px-3 py-3 whitespace-nowrap`}
                    >
                      Kategori
                    </th>

                    <th
                      className={`border ${themeNeutralBorder} text-left font-medium theme-text-muted text-xs uppercase tracking-wider px-3 py-3 whitespace-nowrap`}
                    >
                      Unit Sekolah
                    </th>

                    <th
                      className={`border ${themeNeutralBorder} text-left font-medium theme-text-muted text-xs uppercase tracking-wider px-3 py-3 whitespace-nowrap`}
                    >
                      Lokasi
                    </th>

                    <th
                      className={`border ${themeNeutralBorder} text-center font-medium theme-text-muted text-xs uppercase tracking-wider px-3 py-3 whitespace-nowrap`}
                    >
                      Jumlah
                    </th>

                    <th
                      className={`border ${themeNeutralBorder} text-center font-medium theme-text-muted text-xs uppercase tracking-wider px-3 py-3 whitespace-nowrap`}
                    >
                      Kondisi
                    </th>

                    <th
                      className={`border ${themeNeutralBorder} text-right font-medium theme-text-muted text-xs uppercase tracking-wider px-3 py-3 whitespace-nowrap`}
                    >
                      Nilai Aset
                    </th>

                    <th
                      className={`border ${themeNeutralBorder} text-center font-medium theme-text-muted text-xs uppercase tracking-wider px-3 py-3 whitespace-nowrap`}
                    >
                      Tgl. Perolehan
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {/* EMPTY */}
                  {filteredInventaris.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className={`border ${themeNeutralBorder} p-10 text-center`}
                      >
                        <Package
                          size={28}
                          className="mx-auto theme-text-placeholder mb-2"
                        />

                        <p className="text-sm theme-text-muted">
                          Tidak ada barang yang cocok.
                        </p>
                      </td>
                    </tr>
                  )}

                  {/* DATA */}
                  {filteredInventaris.map((it) => (
                    <tr
                      key={it.id}
                      className={`border-b ${themeDivider} ${themeNeutralHover} transition-colors`}
                    >
                      {/* NAMA */}
                      <td
                        className={`border-x ${themeNeutralBorder} px-4 sm:px-5 py-3 whitespace-nowrap`}
                      >
                        <span className="text-sm font-medium theme-text">
                          {it.nama}
                        </span>
                      </td>

                      {/* KATEGORI */}
                      <td
                        className={`border-x ${themeNeutralBorder} px-3 py-3 whitespace-nowrap`}
                      >
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${themeNeutralSurface} theme-text-secondary ${themeNeutralBorder}`}
                        >
                          {it.kategori}
                        </span>
                      </td>

                      {/* UNIT */}
                      <td
                        className={`border-x ${themeNeutralBorder} px-3 py-3 theme-text-secondary whitespace-nowrap`}
                      >
                        {it.unit}
                      </td>

                      {/* LOKASI */}
                      <td
                        className={`border-x ${themeNeutralBorder} px-3 py-3 theme-text-secondary whitespace-nowrap`}
                      >
                        {it.lokasi}
                      </td>

                      {/* JUMLAH */}
                      <td
                        className={`border-x ${themeNeutralBorder} px-3 py-3 text-center theme-text-secondary whitespace-nowrap`}
                      >
                        {it.jumlah.toLocaleString("id-ID")}
                      </td>

                      {/* KONDISI */}
                      <td
                        className={`border-x ${themeNeutralBorder} px-3 py-3 text-center whitespace-nowrap`}
                      >
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${kondisiStyle(
                            it.kondisi
                          )}`}
                        >
                          {it.kondisi}
                        </span>
                      </td>

                      {/* NILAI */}
                      <td
                        className={`border-x ${themeNeutralBorder} px-3 py-3 text-right whitespace-nowrap`}
                      >
                        <span className="text-sm font-semibold theme-text">
                          {formatRupiah(it.nilai)}
                        </span>
                      </td>

                      {/* TANGGAL */}
                      <td
                        className={`border-x ${themeNeutralBorder} px-3 py-3 text-center theme-text-muted whitespace-nowrap`}
                      >
                        {it.tanggal}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}