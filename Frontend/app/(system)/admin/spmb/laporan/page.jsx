"use client";

import { useMemo, useState } from "react";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  ChevronRight,
  Users,
  CheckCircle2,
  XCircle,
  ClipboardCheck,
  FileSpreadsheet,
  FileText,
  School,
  Layers,
  BookOpen,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// ================= THEME HELPERS =================

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimaryBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

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

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

// ================= DATA PENDAFTAR =================

const dataPendaftar = [
  {
    id: 1,
    noPendaftaran: "PPDB001",
    nama: "Andi Saputra",
    asalSekolah: "SMP Negeri 1",
    jurusan: "RPL",
    gelombang: "1",
    status: "Menunggu",
    tanggalDaftar: "2026-01-08",
  },
  {
    id: 2,
    noPendaftaran: "PPDB002",
    nama: "Budi Hartono",
    asalSekolah: "SMP Negeri 2",
    jurusan: "TKJ",
    gelombang: "1",
    status: "Terverifikasi",
    tanggalDaftar: "2026-01-08",
  },
  {
    id: 3,
    noPendaftaran: "PPDB003",
    nama: "Citra Ayu Lestari",
    asalSekolah: "SMP Negeri 3",
    jurusan: "Multimedia",
    gelombang: "1",
    status: "Lulus",
    tanggalDaftar: "2026-01-09",
  },
  {
    id: 4,
    noPendaftaran: "PPDB004",
    nama: "Deni Firmansyah",
    asalSekolah: "SMP Islam Al-Amin",
    jurusan: "Akuntansi",
    gelombang: "2",
    status: "Daftar Ulang",
    tanggalDaftar: "2026-02-02",
  },
  {
    id: 5,
    noPendaftaran: "PPDB005",
    nama: "Eka Putri Wulandari",
    asalSekolah: "SMP Negeri 4",
    jurusan: "RPL",
    gelombang: "2",
    status: "Tidak Lulus",
    tanggalDaftar: "2026-02-03",
  },
  {
    id: 6,
    noPendaftaran: "PPDB006",
    nama: "Fajar Nugroho",
    asalSekolah: "SMP Negeri 1",
    jurusan: "TKJ",
    gelombang: "1",
    status: "Terverifikasi",
    tanggalDaftar: "2026-01-10",
  },
  {
    id: 7,
    noPendaftaran: "PPDB007",
    nama: "Gita Lestari",
    asalSekolah: "SMP Kristen Harapan",
    jurusan: "Multimedia",
    gelombang: "1",
    status: "Lulus",
    tanggalDaftar: "2026-01-11",
  },
  {
    id: 8,
    noPendaftaran: "PPDB008",
    nama: "Hendra Wijaya",
    asalSekolah: "SMP Negeri 5",
    jurusan: "Akuntansi",
    gelombang: "2",
    status: "Lulus",
    tanggalDaftar: "2026-02-04",
  },
  {
    id: 9,
    noPendaftaran: "PPDB009",
    nama: "Indah Permatasari",
    asalSekolah: "SMP Negeri 2",
    jurusan: "RPL",
    gelombang: "3",
    status: "Menunggu",
    tanggalDaftar: "2026-03-01",
  },
  {
    id: 10,
    noPendaftaran: "PPDB010",
    nama: "Joko Prasetyo",
    asalSekolah: "SMP Negeri 3",
    jurusan: "TKJ",
    gelombang: "2",
    status: "Daftar Ulang",
    tanggalDaftar: "2026-02-05",
  },
  {
    id: 11,
    noPendaftaran: "PPDB011",
    nama: "Kartika Sari",
    asalSekolah: "SMP Negeri 4",
    jurusan: "Multimedia",
    gelombang: "1",
    status: "Daftar Ulang",
    tanggalDaftar: "2026-01-12",
  },
  {
    id: 12,
    noPendaftaran: "PPDB012",
    nama: "Luthfi Rahman",
    asalSekolah: "SMP Islam Al-Amin",
    jurusan: "Akuntansi",
    gelombang: "1",
    status: "Tidak Lulus",
    tanggalDaftar: "2026-01-13",
  },
  {
    id: 13,
    noPendaftaran: "PPDB013",
    nama: "Maya Anggraini",
    asalSekolah: "SMP Negeri 1",
    jurusan: "RPL",
    gelombang: "2",
    status: "Lulus",
    tanggalDaftar: "2026-02-06",
  },
  {
    id: 14,
    noPendaftaran: "PPDB014",
    nama: "Naufal Ardiansyah",
    asalSekolah: "SMP Negeri 5",
    jurusan: "TKJ",
    gelombang: "3",
    status: "Tidak Lulus",
    tanggalDaftar: "2026-03-02",
  },
  {
    id: 15,
    noPendaftaran: "PPDB015",
    nama: "Olivia Zahra",
    asalSekolah: "SMP Kristen Harapan",
    jurusan: "Multimedia",
    gelombang: "2",
    status: "Daftar Ulang",
    tanggalDaftar: "2026-02-07",
  },
  {
    id: 16,
    noPendaftaran: "PPDB016",
    nama: "Putra Wibowo",
    asalSekolah: "SMP Negeri 2",
    jurusan: "Akuntansi",
    gelombang: "1",
    status: "Daftar Ulang",
    tanggalDaftar: "2026-01-14",
  },
  {
    id: 17,
    noPendaftaran: "PPDB017",
    nama: "Qonita Rahmawati",
    asalSekolah: "SMP Negeri 1",
    jurusan: "RPL",
    gelombang: "1",
    status: "Tidak Lulus",
    tanggalDaftar: "2026-01-15",
  },
  {
    id: 18,
    noPendaftaran: "PPDB018",
    nama: "Rizky Ramadhan",
    asalSekolah: "SMP Negeri 3",
    jurusan: "TKJ",
    gelombang: "2",
    status: "Lulus",
    tanggalDaftar: "2026-02-08",
  },
  {
    id: 19,
    noPendaftaran: "PPDB019",
    nama: "Sinta Dewi",
    asalSekolah: "SMP Kristen Harapan",
    jurusan: "Multimedia",
    gelombang: "3",
    status: "Menunggu",
    tanggalDaftar: "2026-03-03",
  },
  {
    id: 20,
    noPendaftaran: "PPDB020",
    nama: "Taufik Hidayat",
    asalSekolah: "SMP Negeri 4",
    jurusan: "Akuntansi",
    gelombang: "2",
    status: "Tidak Lulus",
    tanggalDaftar: "2026-02-09",
  },
];

const JURUSAN_LIST = [
  "RPL",
  "TKJ",
  "Multimedia",
  "Akuntansi",
];

const GELOMBANG_LIST = ["1", "2", "3"];

const JURUSAN_COLORS = {
  RPL: "var(--color-primary)",
  TKJ: "var(--color-info)",
  Multimedia: "var(--color-primary)",
  Akuntansi: "var(--color-warning)",
};

const STATUS_COLORS = {
  Diterima: "var(--color-success)",
  Ditolak: "var(--color-text)",
  "Proses Seleksi": "var(--color-warning)",
};

const GELOMBANG_OPTIONS = [
  "Semua Gelombang",
  ...GELOMBANG_LIST,
];

function formatTanggal(iso) {
  const d = new Date(iso);

  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ================= EXPORT HELPERS =================

async function exportExcel(rows, filename) {
  const XLSX = await import("xlsx");

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb,
    ws,
    "Laporan PPDB"
  );

  XLSX.writeFile(wb, filename);
}

function exportPDF() {
  window.print();
}

export default function LaporanPPDBPage() {
  const [isCollapsed, setIsCollapsed] =
    useState(false);

  const [filterGelombang, setFilterGelombang] =
    useState("Semua Gelombang");

  const toggleSidebar = () =>
    setIsCollapsed(!isCollapsed);

  const dataFiltered = useMemo(() => {
    if (
      filterGelombang ===
      "Semua Gelombang"
    ) {
      return dataPendaftar;
    }

    return dataPendaftar.filter(
      (p) =>
        p.gelombang === filterGelombang
    );
  }, [filterGelombang]);

  // ---- Ringkasan utama ----

  const ringkasan = useMemo(() => {
    const total = dataFiltered.length;

    const diterima = dataFiltered.filter(
      (p) =>
        p.status === "Lulus" ||
        p.status === "Daftar Ulang"
    ).length;

    const ditolak = dataFiltered.filter(
      (p) => p.status === "Tidak Lulus"
    ).length;

    const daftarUlang = dataFiltered.filter(
      (p) => p.status === "Daftar Ulang"
    ).length;

    return {
      total,
      diterima,
      ditolak,
      daftarUlang,
    };
  }, [dataFiltered]);

  // ---- Per jurusan ----

  const perJurusan = useMemo(
    () =>
      JURUSAN_LIST.map((j) => ({
        jurusan: j,
        jumlah: dataFiltered.filter(
          (p) => p.jurusan === j
        ).length,
      })),
    [dataFiltered]
  );

  // ---- Per gelombang ----

  const perGelombang = useMemo(
    () =>
      GELOMBANG_LIST.map((g) => ({
        gelombang: `Gelombang ${g}`,
        jumlah: dataFiltered.filter(
          (p) => p.gelombang === g
        ).length,
      })),
    [dataFiltered]
  );

  // ---- Distribusi status ----

  const distribusiStatus = useMemo(() => {
    const menunggu = dataFiltered.filter(
      (p) =>
        p.status === "Menunggu" ||
        p.status === "Terverifikasi"
    ).length;

    return [
      {
        name: "Diterima",
        value: ringkasan.diterima,
      },
      {
        name: "Ditolak",
        value: ringkasan.ditolak,
      },
      {
        name: "Proses Seleksi",
        value: menunggu,
      },
    ].filter((d) => d.value > 0);
  }, [dataFiltered, ringkasan]);

  // ---- Rekap asal sekolah ----

  const rekapAsalSekolah = useMemo(() => {
    const map = {};

    dataFiltered.forEach((p) => {
      if (!map[p.asalSekolah]) {
        map[p.asalSekolah] = {
          asalSekolah: p.asalSekolah,
          jumlah: 0,
          diterima: 0,
        };
      }

      map[p.asalSekolah].jumlah += 1;

      if (
        p.status === "Lulus" ||
        p.status === "Daftar Ulang"
      ) {
        map[p.asalSekolah].diterima += 1;
      }
    });

    return Object.values(map).sort(
      (a, b) => b.jumlah - a.jumlah
    );
  }, [dataFiltered]);

  const handleExportExcel = () => {
    const rows = dataFiltered.map((p) => ({
      "No. Pendaftaran":
        p.noPendaftaran,
      Nama: p.nama,
      "Asal Sekolah":
        p.asalSekolah,
      Jurusan: p.jurusan,
      Gelombang: p.gelombang,
      Status: p.status,
      "Tanggal Daftar":
        formatTanggal(
          p.tanggalDaftar
        ),
    }));

    exportExcel(
      rows,
      `Laporan-PPDB-${filterGelombang.replace(
        /\s/g,
        "-"
      )}.xlsx`
    );
  };

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <div className="print:hidden">
        <Sidebar
          role="adminPPDB"
          active="laporan"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
        />
      </div>

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <div className="print:hidden">
          <Header
            toggleSidebar={toggleSidebar}
            notifications={[]}
            user={{
              name: "Admin PPDB",
              email: "adminppdb@smartschool.com",
              avatar: "PP",
            }}
          />
        </div>

        <main className="flex-1 overflow-y-auto">
          <div
            id="area-laporan"
            className="theme-page w-full p-4 md:p-6 lg:p-8"
          >
            <div className="mx-auto w-full max-w-[1320px] space-y-5">
              {/* HEADER */}

              <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
                <div className="flex items-center gap-1.5 text-xs theme-text-muted">
                  <span>PPDB</span>

                  <ChevronRight size={12} />

                  <span className="font-medium theme-text">
                    Laporan
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <select
                    value={filterGelombang}
                    onChange={(e) =>
                      setFilterGelombang(
                        e.target.value
                      )
                    }
                    className={`theme-input rounded-md px-3 py-2 text-xs outline-none transition ${themePrimaryBorder} focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]`}
                  >
                    {GELOMBANG_OPTIONS.map(
                      (g) => (
                        <option
                          key={g}
                          value={g}
                        >
                          {g}
                        </option>
                      )
                    )}
                  </select>

                  <button
                    onClick={
                      handleExportExcel
                    }
                    className={`flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-medium text-[var(--color-card)] transition hover:opacity-90 ${themeSuccessSurface}`}
                    style={{
                      backgroundColor:
                        "var(--color-success)",
                    }}
                  >
                    <FileSpreadsheet
                      size={14}
                    />
                    Export Excel
                  </button>

                  <button
                    onClick={exportPDF}
                    className={`flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-medium text-[var(--color-card)] transition hover:opacity-90`}
                    style={{
                      backgroundColor:
                        "var(--color-text)",
                    }}
                  >
                    <FileText size={14} />
                    Export PDF
                  </button>
                </div>
              </div>

              {/* JUDUL PRINT */}

              <div className="mb-2 hidden text-center print:block">
                <h1 className="text-lg font-bold theme-text">
                  Laporan PPDB — SmartSchool
                </h1>

                <p className="text-xs theme-text-secondary">
                  {filterGelombang ===
                  "Semua Gelombang"
                    ? "Seluruh Gelombang"
                    : filterGelombang}{" "}
                  &middot;{" "}
                  {new Date().toLocaleDateString(
                    "id-ID",
                    {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </p>
              </div>

              {/* KARTU RINGKASAN */}

              <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <SummaryCard
                  icon={Users}
                  title="Total Pendaftar"
                  value={ringkasan.total}
                  iconClass={`${themePrimarySoft} ${themePrimaryText}`}
                />

                <SummaryCard
                  icon={CheckCircle2}
                  title="Jumlah Diterima"
                  value={ringkasan.diterima}
                  iconClass={`${themeSuccessSurface} text-[var(--color-success)]`}
                  valueClass="text-[var(--color-success)]"
                />

                <SummaryCard
                  icon={XCircle}
                  title="Jumlah Ditolak"
                  value={ringkasan.ditolak}
                  iconClass={`${themeDangerSurface} theme-danger`}
                  valueClass="theme-danger"
                />

                <SummaryCard
                  icon={ClipboardCheck}
                  title="Sudah Daftar Ulang"
                  value={ringkasan.daftarUlang}
                  iconClass={`${themePrimarySoft} ${themePrimaryText}`}
                  valueClass={themePrimaryText}
                />
              </section>

              {/* GRAFIK */}

              <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div
                  className={`theme-card rounded-xl p-5 ${themeCardShadow}`}
                >
                  <div className="mb-4 flex items-center gap-2">
                    <BookOpen
                      size={14}
                      className="theme-text-muted"
                    />

                    <p className="text-sm font-semibold theme-text">
                      Pendaftar per Jurusan
                    </p>
                  </div>

                  <ResponsiveContainer
                    width="100%"
                    height={240}
                  >
                    <BarChart
                      data={perJurusan}
                      margin={{
                        top: 4,
                        right: 8,
                        left: -20,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="color-mix(in srgb, var(--color-text) 8%, transparent)"
                      />

                      <XAxis
                        dataKey="jurusan"
                        tick={{
                          fontSize: 11,
                          fill: "var(--color-text-muted)",
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        tick={{
                          fontSize: 11,
                          fill: "var(--color-text-muted)",
                        }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />

                      <Tooltip
                        cursor={{
                          fill: "color-mix(in srgb, var(--color-text) 4%, transparent)",
                        }}
                        contentStyle={{
                          fontSize: 12,
                          borderRadius: 8,
                          border:
                            "1px solid color-mix(in srgb, var(--color-text) 10%, transparent)",
                          backgroundColor:
                            "var(--color-card)",
                          color:
                            "var(--color-text)",
                        }}
                      />

                      <Bar
                        dataKey="jumlah"
                        radius={[
                          6,
                          6,
                          0,
                          0,
                        ]}
                      >
                        {perJurusan.map(
                          (entry) => (
                            <Cell
                              key={
                                entry.jurusan
                              }
                              fill={
                                JURUSAN_COLORS[
                                  entry.jurusan
                                ]
                              }
                            />
                          )
                        )}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div
                  className={`theme-card rounded-xl p-5 ${themeCardShadow}`}
                >
                  <div className="mb-4 flex items-center gap-2">
                    <Layers
                      size={14}
                      className="theme-text-muted"
                    />

                    <p className="text-sm font-semibold theme-text">
                      Pendaftar per Gelombang
                    </p>
                  </div>

                  <ResponsiveContainer
                    width="100%"
                    height={240}
                  >
                    <BarChart
                      data={perGelombang}
                      margin={{
                        top: 4,
                        right: 8,
                        left: -20,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="color-mix(in srgb, var(--color-text) 8%, transparent)"
                      />

                      <XAxis
                        dataKey="gelombang"
                        tick={{
                          fontSize: 11,
                          fill: "var(--color-text-muted)",
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        tick={{
                          fontSize: 11,
                          fill: "var(--color-text-muted)",
                        }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />

                      <Tooltip
                        cursor={{
                          fill: "color-mix(in srgb, var(--color-text) 4%, transparent)",
                        }}
                        contentStyle={{
                          fontSize: 12,
                          borderRadius: 8,
                          border:
                            "1px solid color-mix(in srgb, var(--color-text) 10%, transparent)",
                          backgroundColor:
                            "var(--color-card)",
                          color:
                            "var(--color-text)",
                        }}
                      />

                      <Bar
                        dataKey="jumlah"
                        fill="var(--color-primary)"
                        radius={[
                          6,
                          6,
                          0,
                          0,
                        ]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* DISTRIBUSI STATUS + ASAL SEKOLAH */}

              <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                <div
                  className={`theme-card rounded-xl p-5 lg:col-span-2 ${themeCardShadow}`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <CheckCircle2
                      size={14}
                      className="theme-text-muted"
                    />

                    <p className="text-sm font-semibold theme-text">
                      Distribusi Status Akhir
                    </p>
                  </div>

                  <ResponsiveContainer
                    width="100%"
                    height={240}
                  >
                    <PieChart>
                      <Pie
                        data={distribusiStatus}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={2}
                      >
                        {distribusiStatus.map(
                          (entry) => (
                            <Cell
                              key={entry.name}
                              fill={
                                STATUS_COLORS[
                                  entry.name
                                ]
                              }
                            />
                          )
                        )}
                      </Pie>

                      <Tooltip
                        contentStyle={{
                          fontSize: 12,
                          borderRadius: 8,
                          border:
                            "1px solid color-mix(in srgb, var(--color-text) 10%, transparent)",
                          backgroundColor:
                            "var(--color-card)",
                          color:
                            "var(--color-text)",
                        }}
                      />

                      <Legend
                        iconType="circle"
                        iconSize={8}
                        formatter={(
                          value
                        ) => (
                          <span className="text-xs theme-text-secondary">
                            {value}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div
                  className={`theme-card rounded-xl p-5 lg:col-span-3 ${themeCardShadow}`}
                >
                  <div className="mb-4 flex items-center gap-2">
                    <School
                      size={14}
                      className="theme-text-muted"
                    />

                    <p className="text-sm font-semibold theme-text">
                      Rekap Asal Sekolah
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr
                          className={`border-b ${themeDivider} text-left text-xs theme-text-muted`}
                        >
                          <th className="py-2 pr-3 font-medium">
                            Asal Sekolah
                          </th>

                          <th className="py-2 pr-3 text-center font-medium">
                            Jumlah Pendaftar
                          </th>

                          <th className="py-2 pr-3 text-center font-medium">
                            Diterima
                          </th>

                          <th className="py-2 font-medium">
                            Proporsi
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {rekapAsalSekolah.map(
                          (r) => (
                            <tr
                              key={
                                r.asalSekolah
                              }
                              className={`border-b ${themeDivider}`}
                            >
                              <td className="py-2.5 pr-3 theme-text">
                                {r.asalSekolah}
                              </td>

                              <td className="py-2.5 pr-3 text-center font-medium theme-text-secondary">
                                {r.jumlah}
                              </td>

                              <td className="py-2.5 pr-3 text-center font-medium text-[var(--color-success)]">
                                {r.diterima}
                              </td>

                              <td className="py-2.5">
                                <div
                                  className={`h-1.5 w-full overflow-hidden rounded-full ${themeNeutralSurface}`}
                                >
                                  <div
                                    className="h-full rounded-full"
                                    style={{
                                      width: `${
                                        (r.jumlah /
                                          ringkasan.total) *
                                        100
                                      }%`,
                                      backgroundColor:
                                        "var(--color-primary)",
                                    }}
                                  />
                                </div>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* FOOTER */}

              <footer className="py-3 text-center text-[11px] theme-text-muted print:hidden">
                © 2026 SmartSchool &middot;
                Dashboard Admin PPDB &middot;
                All rights reserved
              </footer>
            </div>
          </div>
        </main>
      </div>

      {/* PRINT STYLE */}

      <style jsx global>{`
        @media print {
          body {
            background: var(--color-card);
          }

          .theme-page {
            background: var(--color-card) !important;
          }
        }
      `}</style>
    </div>
  );
}

// =========================================================
// COMPONENT: SUMMARY CARD
// =========================================================

function SummaryCard({
  icon: Icon,
  title,
  value,
  iconClass,
  valueClass = "theme-text",
}) {
  return (
    <div
      className={`theme-card flex items-start gap-3 rounded-xl p-5 ${themeCardShadow}`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
      >
        <Icon size={16} />
      </div>

      <div>
        <p className="text-xs theme-text-muted">
          {title}
        </p>

        <p
          className={`mt-1 text-2xl font-bold ${valueClass}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}