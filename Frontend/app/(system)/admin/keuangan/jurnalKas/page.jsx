"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Eye,
  TrendingUp,
  TrendingDown,
  Wallet,
  Filter,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  FileText,
  RefreshCw,
  CalendarDays,
  CreditCard,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Receipt,
  CircleDollarSign,
  SlidersHorizontal,
} from "lucide-react";

import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";

const STORAGE_KEY = "smartschool_jurnal_kas";

const defaultData = [
  {
    id: "1",
    tanggal: "2026-09-01",
    keterangan: "Setoran SPP Siswa",
    debit: 0,
    kredit: 12500000,
    saldo: 12500000,
    jenis: "Pemasukan",
    metode: "Transfer",
    catatan: "Pembayaran SPP bulan September dari 50 siswa",
    dibuatOleh: "Admin",
    tanggalDibuat: "2026-09-01 08:00",
  },
  {
    id: "2",
    tanggal: "2026-09-02",
    keterangan: "Pembelian ATK",
    debit: 2350000,
    kredit: 0,
    saldo: 10150000,
    jenis: "Pengeluaran",
    metode: "Tunai",
    catatan: "Pembelian alat tulis kantor untuk 1 bulan",
    dibuatOleh: "Admin",
    tanggalDibuat: "2026-09-02 10:30",
  },
  {
    id: "3",
    tanggal: "2026-09-03",
    keterangan: "Gaji Guru Bulan Agustus",
    debit: 35000000,
    kredit: 0,
    saldo: -24850000,
    jenis: "Pengeluaran",
    metode: "Transfer",
    catatan: "Pembayaran gaji untuk 25 guru",
    dibuatOleh: "Admin",
    tanggalDibuat: "2026-09-03 14:00",
  },
  {
    id: "4",
    tanggal: "2026-09-05",
    keterangan: "Donasi BOS",
    debit: 0,
    kredit: 5000000,
    saldo: -19850000,
    jenis: "Pemasukan",
    metode: "Transfer",
    catatan: "Bantuan Operasional Sekolah dari pemerintah",
    dibuatOleh: "Admin",
    tanggalDibuat: "2026-09-05 09:15",
  },
  {
    id: "5",
    tanggal: "2026-09-06",
    keterangan: "Pembayaran Listrik",
    debit: 1800000,
    kredit: 0,
    saldo: -21650000,
    jenis: "Pengeluaran",
    metode: "Tunai",
    catatan: "Tagihan listrik bulan Agustus",
    dibuatOleh: "Admin",
    tanggalDibuat: "2026-09-06 11:00",
  },
  {
    id: "6",
    tanggal: "2026-09-07",
    keterangan: "Setoran SPP",
    debit: 0,
    kredit: 8000000,
    saldo: -13650000,
    jenis: "Pemasukan",
    metode: "Transfer",
    catatan: "Pembayaran SPP dari 32 siswa",
    dibuatOleh: "Admin",
    tanggalDibuat: "2026-09-07 08:45",
  },
  {
    id: "7",
    tanggal: "2026-09-08",
    keterangan: "Biaya Maintenance",
    debit: 2500000,
    kredit: 0,
    saldo: -16150000,
    jenis: "Pengeluaran",
    metode: "Tunai",
    catatan: "Perbaikan AC dan komputer lab",
    dibuatOleh: "Admin",
    tanggalDibuat: "2026-09-08 13:20",
  },
];

export default function JurnalKasPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [jenisFilter, setJenisFilter] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState(defaultData);

  const entriesPerPage = 6;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setData(parsed);
        }
      }
    } catch (error) {
      console.error("Gagal membaca data jurnal:", error);
    }
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const totalKredit = data.reduce(
    (total, item) => total + Number(item.kredit || 0),
    0
  );

  const totalDebit = data.reduce(
    (total, item) => total + Number(item.debit || 0),
    0
  );

  const saldoAkhir = totalKredit - totalDebit;

  const totalPemasukan = data.filter(
    (item) => item.jenis === "Pemasukan"
  ).length;

  const totalPengeluaran = data.filter(
    (item) => item.jenis === "Pengeluaran"
  ).length;

  const filteredData = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return data.filter((item) => {
      const matchSearch =
        !keyword ||
        item.keterangan?.toLowerCase().includes(keyword) ||
        item.jenis?.toLowerCase().includes(keyword) ||
        item.metode?.toLowerCase().includes(keyword) ||
        item.catatan?.toLowerCase().includes(keyword);

      const matchJenis =
        jenisFilter === "Semua" || item.jenis === jenisFilter;

      return matchSearch && matchJenis;
    });
  }, [data, search, jenisFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / entriesPerPage)
  );

  const safePage = Math.min(currentPage, totalPages);

  const currentEntries = filteredData.slice(
    (safePage - 1) * entriesPerPage,
    safePage * entriesPerPage
  );

  const handleDelete = (id) => {
    const selected = data.find(
      (item) => String(item.id) === String(id)
    );

    if (!selected) return;

    const confirmed = window.confirm(
      `Hapus transaksi "${selected.keterangan}"?`
    );

    if (!confirmed) return;

    const newData = data.filter(
      (item) => String(item.id) !== String(id)
    );

    setData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  };

  const handleReset = () => {
    setSearch("");
    setJenisFilter("Semua");
    setCurrentPage(1);
  };

  const handleExport = () => {
    const header =
      "Tanggal,Keterangan,Jenis,Metode,Debit,Kredit,Saldo";

    const rows = data.map((item) =>
      [
        item.tanggal,
        `"${item.keterangan}"`,
        item.jenis,
        item.metode,
        item.debit,
        item.kredit,
        item.saldo,
      ].join(",")
    );

    const csv = [header, ...rows].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "jurnal-kas-smartschool.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      {/* SIDEBAR */}
      <Sidebar
        active="jurnalKas"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* HEADER */}
        <Header
          toggleSidebar={() =>
            setIsCollapsed((prev) => !prev)
          }
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="theme-page min-h-0 flex-1 overflow-y-auto">
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1500px]">

              {/* PAGE HEADER */}
              <section className="mb-7">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">

                  <div>
                    <div className="flex items-center gap-3">

                      <div className="theme-info flex h-12 w-12 items-center justify-center rounded-xl border">
                        <Wallet size={23} strokeWidth={2} />
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">
                          KEUANGAN SEKOLAH
                        </p>

                        <h1 className="theme-text mt-0.5 text-[25px] font-bold tracking-tight sm:text-[29px]">
                          Jurnal & Kas
                        </h1>
                      </div>

                    </div>

                    <p className="theme-text-muted mt-3 max-w-2xl text-sm leading-6">
                      Kelola, pantau, dan dokumentasikan seluruh
                      transaksi keuangan sekolah dalam satu halaman.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">

                    <button
                      onClick={() => window.print()}
                      className="theme-input inline-flex h-10 items-center gap-2 rounded-lg px-3.5 text-sm font-semibold shadow-sm transition hover:bg-[var(--color-input-hover)]"
                    >
                      <Printer size={16} />
                      Cetak
                    </button>

                    <button
                      onClick={handleExport}
                      className="theme-input inline-flex h-10 items-center gap-2 rounded-lg px-3.5 text-sm font-semibold shadow-sm transition hover:bg-[var(--color-input-hover)]"
                    >
                      <Download size={16} />
                      Ekspor
                    </button>

                    <Link
                      href="/admin/keuangan/jurnalKas/tambah"
                      className="theme-primary inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold shadow-sm transition"
                    >
                      <Plus size={17} />
                      Tambah Transaksi
                    </Link>

                  </div>
                </div>
              </section>

              {/* FINANCE OVERVIEW */}
              <section className="mb-7 grid grid-cols-1 gap-4 md:grid-cols-3">

                <FinanceCard
                  label="Total Pemasukan"
                  value={formatCurrency(totalKredit)}
                  description={`${totalPemasukan} transaksi pemasukan`}
                  icon={<ArrowUpRight size={19} />}
                  type="income"
                />

                <FinanceCard
                  label="Total Pengeluaran"
                  value={formatCurrency(totalDebit)}
                  description={`${totalPengeluaran} transaksi pengeluaran`}
                  icon={<ArrowDownRight size={19} />}
                  type="expense"
                />

                <FinanceCard
                  label="Saldo Kas"
                  value={formatCurrency(saldoAkhir)}
                  description={
                    saldoAkhir >= 0
                      ? "Posisi kas saat ini"
                      : "Saldo kas perlu diperhatikan"
                  }
                  icon={<Wallet size={19} />}
                  type="balance"
                />

              </section>

              {/* QUICK INSIGHT */}
              <section className="mb-7 grid grid-cols-1 gap-4 lg:grid-cols-3">

                <div className="theme-card overflow-hidden rounded-2xl border shadow-sm lg:col-span-2">

                  <div className="theme-border flex items-center justify-between border-b px-5 py-4">

                    <div>
                      <h2 className="theme-text text-sm font-bold">
                        Ringkasan Kas
                      </h2>

                      <p className="theme-text-muted mt-1 text-xs">
                        Perbandingan pemasukan dan pengeluaran
                      </p>
                    </div>

                    <div className="theme-info flex h-9 w-9 items-center justify-center rounded-lg">
                      <CircleDollarSign size={18} />
                    </div>

                  </div>

                  <div className="grid grid-cols-2 divide-x divide-[var(--color-border-soft)]">

                    <div className="px-5 py-5">
                      <p className="theme-text-muted text-xs font-medium">
                        Kas Masuk
                      </p>

                      <div className="mt-2 flex items-end gap-2">
                        <span className="text-lg font-bold text-[var(--color-success)]">
                          {formatCurrency(totalKredit)}
                        </span>
                      </div>

                      <div className="theme-text-success mt-3 flex items-center gap-2 text-xs">
                        <TrendingUp size={14} />
                        <span>
                          {totalPemasukan} transaksi
                        </span>
                      </div>
                    </div>

                    <div className="px-5 py-5">
                      <p className="theme-text-muted text-xs font-medium">
                        Kas Keluar
                      </p>

                      <div className="mt-2">
                        <span className="text-lg font-bold text-[var(--color-danger)]">
                          {formatCurrency(totalDebit)}
                        </span>
                      </div>

                      <div className="theme-text-danger mt-3 flex items-center gap-2 text-xs">
                        <TrendingDown size={14} />
                        <span>
                          {totalPengeluaran} transaksi
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="theme-card-soft overflow-hidden rounded-2xl border p-5 shadow-sm">

                  <div className="flex items-start justify-between">

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                        POSISI KAS
                      </p>

                      <h3
                        className={`theme-text mt-2 text-xl font-bold ${
                          saldoAkhir < 0
                            ? "text-[var(--color-danger)]"
                            : ""
                        }`}
                      >
                        {formatCurrency(saldoAkhir)}
                      </h3>
                    </div>

                    <div className="theme-info flex h-9 w-9 items-center justify-center rounded-lg">
                      <Wallet size={18} />
                    </div>

                  </div>

                  <div className="theme-border mt-6 flex items-center justify-between border-t pt-4">

                    <div>
                      <p className="theme-text-muted text-[11px]">
                        Status
                      </p>

                      <p
                        className={`mt-1 text-xs font-semibold ${
                          saldoAkhir >= 0
                            ? "text-[var(--color-success)]"
                            : "text-[var(--color-danger)]"
                        }`}
                      >
                        {saldoAkhir >= 0
                          ? "Kas dalam kondisi positif"
                          : "Perlu evaluasi pengeluaran"}
                      </p>
                    </div>

                    <ArrowRight
                      size={17}
                      className="text-[var(--color-primary)]"
                    />

                  </div>
                </div>

              </section>

              {/* FILTER */}
              <section className="theme-card mb-5 overflow-hidden rounded-2xl border shadow-sm">

                <div className="theme-border border-b px-5 py-4">

                  <div className="flex items-center gap-2">
                    <SlidersHorizontal
                      size={16}
                      className="text-[var(--color-primary)]"
                    />

                    <h2 className="theme-text text-sm font-bold">
                      Filter Transaksi
                    </h2>
                  </div>

                </div>

                <div className="p-5">

                  <div className="flex flex-col gap-3 lg:flex-row">

                    <div className="relative flex-1">
                      <Search
                        size={17}
                        className="theme-text-placeholder absolute left-3.5 top-1/2 -translate-y-1/2"
                      />

                      <input
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setCurrentPage(1);
                        }}
                        placeholder="Cari keterangan, metode, atau catatan..."
                        className="theme-input h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]"
                      />
                    </div>

                    <div className="relative">

                      <Filter
                        size={15}
                        className="theme-text-placeholder pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                      />

                      <select
                        value={jenisFilter}
                        onChange={(e) => {
                          setJenisFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="theme-input h-11 min-w-[190px] appearance-none rounded-xl border pl-9 pr-9 text-sm font-medium outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]"
                      >
                        <option value="Semua">
                          Semua Transaksi
                        </option>

                        <option value="Pemasukan">
                          Pemasukan
                        </option>

                        <option value="Pengeluaran">
                          Pengeluaran
                        </option>
                      </select>

                    </div>

                    <button
                      onClick={handleReset}
                      className="theme-input inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition hover:bg-[var(--color-input-hover)]"
                    >
                      <RefreshCw size={15} />
                      Reset
                    </button>

                  </div>

                </div>
              </section>

              {/* TRANSACTION TABLE */}
              <section className="theme-card overflow-hidden rounded-2xl border shadow-sm">

                <div className="theme-border flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

                  <div>
                    <div className="flex items-center gap-2">

                      <div className="theme-info flex h-8 w-8 items-center justify-center rounded-lg">
                        <Receipt size={16} />
                      </div>

                      <h2 className="theme-text text-sm font-bold">
                        Riwayat Transaksi
                      </h2>

                    </div>

                    <p className="theme-text-muted ml-10 mt-1 text-xs">
                      {filteredData.length} transaksi ditemukan
                    </p>
                  </div>

                  <div className="theme-text-muted flex items-center gap-2 text-xs">

                    <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />

                    Sistem kas aktif

                  </div>

                </div>

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[1100px]">

                    <thead className="theme-table-header">
                      <tr className="theme-border border-b">

                        <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em]">
                          Tanggal
                        </th>

                        <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em]">
                          Transaksi
                        </th>

                        <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em]">
                          Jenis
                        </th>

                        <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em]">
                          Metode
                        </th>

                        <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.12em]">
                          Debit
                        </th>

                        <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.12em]">
                          Kredit
                        </th>

                        <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.12em]">
                          Saldo
                        </th>

                        <th className="px-5 py-3.5 text-center text-[10px] font-bold uppercase tracking-[0.12em]">
                          Aksi
                        </th>

                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[var(--color-border-soft)]">

                      {currentEntries.length === 0 ? (

                        <tr>
                          <td
                            colSpan={8}
                            className="px-5 py-16 text-center"
                          >

                            <div className="theme-card-soft theme-text-muted mx-auto flex h-12 w-12 items-center justify-center rounded-xl border">
                              <FileText size={22} />
                            </div>

                            <p className="theme-text mt-3 text-sm font-semibold">
                              Tidak ada transaksi
                            </p>

                            <p className="theme-text-muted mt-1 text-xs">
                              Coba ubah kata kunci atau filter.
                            </p>

                          </td>
                        </tr>

                      ) : (

                        currentEntries.map((item) => (

                          <tr
                            key={item.id}
                            className="theme-table-hover transition"
                          >

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2.5">

                                <div className="theme-card-soft theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg border">
                                  <CalendarDays size={14} />
                                </div>

                                <span className="theme-text-secondary whitespace-nowrap text-sm font-medium">
                                  {formatDate(item.tanggal)}
                                </span>

                              </div>
                            </td>

                            <td className="px-5 py-4">

                              <div>
                                <p className="theme-text text-sm font-semibold">
                                  {item.keterangan}
                                </p>

                                <p className="theme-text-muted mt-1 max-w-[290px] truncate text-xs">
                                  {item.catatan || "Tidak ada catatan"}
                                </p>
                              </div>

                            </td>

                            <td className="px-5 py-4">
                              <TransactionBadge
                                type={item.jenis}
                              />
                            </td>

                            <td className="px-5 py-4">

                              <div className="theme-text-secondary inline-flex items-center gap-2 text-xs font-semibold">

                                <span className="theme-card-soft theme-text-muted flex h-7 w-7 items-center justify-center rounded-lg border">
                                  {item.metode === "Transfer" ? (
                                    <CreditCard size={13} />
                                  ) : (
                                    <Banknote size={13} />
                                  )}
                                </span>

                                {item.metode}

                              </div>

                            </td>

                            <td className="px-5 py-4 text-right">
                              <span className="text-sm font-semibold text-[var(--color-danger)]">
                                {item.debit > 0
                                  ? formatCurrency(item.debit)
                                  : "-"}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-right">
                              <span className="text-sm font-semibold text-[var(--color-success)]">
                                {item.kredit > 0
                                  ? formatCurrency(item.kredit)
                                  : "-"}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-right">

                              <span
                                className={`text-sm font-bold ${
                                  item.saldo >= 0
                                    ? "theme-text"
                                    : "text-[var(--color-danger)]"
                                }`}
                              >
                                {formatCurrency(item.saldo)}
                              </span>

                            </td>

                            <td className="px-5 py-4">

                              <div className="flex items-center justify-center gap-1">

                                <Link
                                  href={`/admin/keuangan/jurnalKas/detail/${item.id}`}
                                  title="Detail"
                                  className="theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-[var(--color-info-background)] hover:text-[var(--color-info)]"
                                >
                                  <Eye size={15} />
                                </Link>

                                <Link
                                  href={`/admin/keuangan/jurnalKas/edit/${item.id}`}
                                  title="Edit"
                                  className="theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-[var(--color-warning-background)] hover:text-[var(--color-warning)]"
                                >
                                  <Edit size={15} />
                                </Link>

                                <button
                                  onClick={() =>
                                    handleDelete(item.id)
                                  }
                                  title="Hapus"
                                  className="theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-[var(--color-danger-background)] hover:text-[var(--color-danger)]"
                                >
                                  <Trash2 size={15} />
                                </button>

                              </div>

                            </td>

                          </tr>

                        ))

                      )}

                    </tbody>

                  </table>

                </div>

                {/* PAGINATION */}

                {filteredData.length > 0 && (
                  <div className="theme-border flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

                    <p className="theme-text-muted text-xs">
                      Menampilkan{" "}
                      <span className="theme-text-secondary font-semibold">
                        {(safePage - 1) * entriesPerPage + 1}
                      </span>{" "}
                      -{" "}
                      <span className="theme-text-secondary font-semibold">
                        {Math.min(
                          safePage * entriesPerPage,
                          filteredData.length
                        )}
                      </span>{" "}
                      dari{" "}
                      <span className="theme-text-secondary font-semibold">
                        {filteredData.length}
                      </span>{" "}
                      transaksi
                    </p>

                    <div className="flex items-center gap-1">

                      <button
                        disabled={safePage === 1}
                        onClick={() =>
                          setCurrentPage((page) =>
                            Math.max(1, page - 1)
                          )
                        }
                        className="theme-input flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-[var(--color-input-hover)] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronLeft size={15} />
                      </button>

                      {Array.from(
                        { length: totalPages },
                        (_, index) => index + 1
                      ).map((page) => (
                        <button
                          key={page}
                          onClick={() =>
                            setCurrentPage(page)
                          }
                          className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-semibold transition ${
                            safePage === page
                              ? "theme-primary shadow-sm"
                              : "theme-text-muted hover:bg-[var(--color-input-hover)]"
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        disabled={safePage === totalPages}
                        onClick={() =>
                          setCurrentPage((page) =>
                            Math.min(totalPages, page + 1)
                          )
                        }
                        className="theme-input flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-[var(--color-input-hover)] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronRight size={15} />
                      </button>

                    </div>

                  </div>
                )}

              </section>

              <div className="h-8" />

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ========================================================= */
/* FINANCE CARD */
/* ========================================================= */

function FinanceCard({
  label,
  value,
  description,
  icon,
  type,
}) {
  const styles = {
    income: {
      iconBg: "theme-success",
      accent: "bg-[var(--color-success)]",
      value: "theme-text",
    },

    expense: {
      iconBg: "theme-danger",
      accent: "bg-[var(--color-danger)]",
      value: "theme-text",
    },

    balance: {
      iconBg: "theme-info",
      accent: "bg-[var(--color-primary)]",
      value: "theme-text",
    },
  };

  const style = styles[type];

  return (
    <div className="theme-card relative overflow-hidden rounded-2xl border p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">

      <div
        className={`absolute left-0 top-0 h-full w-[3px] ${style.accent}`}
      />

      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0">

          <p className="theme-text-secondary text-xs font-semibold">
            {label}
          </p>

          <p
            className={`mt-2 truncate text-xl font-bold tracking-tight sm:text-2xl ${style.value}`}
          >
            {value}
          </p>

          <p className="theme-text-muted mt-2 text-xs">
            {description}
          </p>

        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.iconBg}`}
        >
          {icon}
        </div>

      </div>
    </div>
  );
}

/* ========================================================= */
/* TRANSACTION BADGE */
/* ========================================================= */

function TransactionBadge({ type }) {
  const isIncome = type === "Pemasukan";

  return (
    <span
      className={`inline-flex items-center gap-2 text-xs font-semibold ${
        isIncome
          ? "text-[var(--color-success)]"
          : "text-[var(--color-danger)]"
      }`}
    >
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-md ${
          isIncome
            ? "bg-[var(--color-success-background)]"
            : "bg-[var(--color-danger-background)]"
        }`}
      >
        {isIncome ? (
          <TrendingUp size={12} />
        ) : (
          <TrendingDown size={12} />
        )}
      </span>

      {type}
    </span>
  );
}

