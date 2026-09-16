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
  MoreHorizontal,
} from "lucide-react";

import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";

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
    <div className="flex h-screen w-full overflow-hidden bg-[#F4F7FB]">
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

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1500px]">

              {/* ================================================= */}
              {/* PAGE HEADER */}
              {/* ================================================= */}

              <section className="mb-7">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">

                  <div>
                    <div className="flex items-center gap-3">

                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E8EEF9] text-[#1E3A8A] ring-1 ring-[#D7E2F4]">
                        <Wallet size={23} strokeWidth={2} />
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#3159A6]">
                          KEUANGAN SEKOLAH
                        </p>

                        <h1 className="mt-0.5 text-[25px] font-bold tracking-tight text-[#172033] sm:text-[29px]">
                          Jurnal & Kas
                        </h1>
                      </div>
                    </div>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                      Kelola, pantau, dan dokumentasikan seluruh
                      transaksi keuangan sekolah dalam satu halaman.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">

                    <button
                      onClick={() => window.print()}
                      className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <Printer size={16} />
                      Cetak
                    </button>

                    <button
                      onClick={handleExport}
                      className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <Download size={16} />
                      Ekspor
                    </button>

                    <Link
                      href="/admin/keuangan/jurnalKas/tambah"
                      className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#1E3A8A] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#173274]"
                    >
                      <Plus size={17} />
                      Tambah Transaksi
                    </Link>

                  </div>
                </div>
              </section>

              {/* ================================================= */}
              {/* FINANCE OVERVIEW */}
              {/* ================================================= */}

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

              {/* ================================================= */}
              {/* QUICK INSIGHT */}
              {/* ================================================= */}

              <section className="mb-7 grid grid-cols-1 gap-4 lg:grid-cols-3">

                <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-[#DCE4F0] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)]">

                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

                    <div>
                      <h2 className="text-sm font-bold text-[#172033]">
                        Ringkasan Kas
                      </h2>

                      <p className="mt-1 text-xs text-slate-400">
                        Perbandingan pemasukan dan pengeluaran
                      </p>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF3FB] text-[#1E3A8A]">
                      <CircleDollarSign size={18} />
                    </div>

                  </div>

                  <div className="grid grid-cols-2 divide-x divide-slate-100">

                    <div className="px-5 py-5">
                      <p className="text-xs font-medium text-slate-400">
                        Kas Masuk
                      </p>

                      <div className="mt-2 flex items-end gap-2">
                        <span className="text-lg font-bold text-emerald-600">
                          {formatCurrency(totalKredit)}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600">
                        <TrendingUp size={14} />
                        <span>
                          {totalPemasukan} transaksi
                        </span>
                      </div>
                    </div>

                    <div className="px-5 py-5">
                      <p className="text-xs font-medium text-slate-400">
                        Kas Keluar
                      </p>

                      <div className="mt-2">
                        <span className="text-lg font-bold text-rose-600">
                          {formatCurrency(totalDebit)}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center gap-2 text-xs text-rose-600">
                        <TrendingDown size={14} />
                        <span>
                          {totalPengeluaran} transaksi
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="rounded-2xl border border-[#DCE4F0] bg-[#172B52] p-5 text-white shadow-[0_8px_25px_rgba(23,43,82,0.12)]">

                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-200">
                        POSISI KAS
                      </p>

                      <h3 className="mt-2 text-xl font-bold">
                        {formatCurrency(saldoAkhir)}
                      </h3>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                      <Wallet size={18} />
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">

                    <div>
                      <p className="text-[11px] text-blue-200">
                        Status
                      </p>

                      <p className="mt-1 text-xs font-semibold text-white">
                        {saldoAkhir >= 0
                          ? "Kas dalam kondisi positif"
                          : "Perlu evaluasi pengeluaran"}
                      </p>
                    </div>

                    <ArrowRight
                      size={17}
                      className="text-blue-200"
                    />

                  </div>
                </div>

              </section>

              {/* ================================================= */}
              {/* FILTER */}
              {/* ================================================= */}

              <section className="mb-5 rounded-2xl border border-[#DCE4F0] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)]">

                <div className="border-b border-slate-100 px-5 py-4">

                  <div className="flex items-center gap-2">
                    <SlidersHorizontal
                      size={16}
                      className="text-[#1E3A8A]"
                    />

                    <h2 className="text-sm font-bold text-[#172033]">
                      Filter Transaksi
                    </h2>
                  </div>

                </div>

                <div className="p-5">

                  <div className="flex flex-col gap-3 lg:flex-row">

                    <div className="relative flex-1">
                      <Search
                        size={17}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setCurrentPage(1);
                        }}
                        placeholder="Cari keterangan, metode, atau catatan..."
                        className="h-11 w-full rounded-xl border border-slate-200 bg-[#F8FAFC] pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#3159A6] focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>

                    <div className="relative">

                      <Filter
                        size={15}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <select
                        value={jenisFilter}
                        onChange={(e) => {
                          setJenisFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="h-11 min-w-[190px] appearance-none rounded-xl border border-slate-200 bg-[#F8FAFC] pl-9 pr-9 text-sm font-medium text-slate-600 outline-none transition focus:border-[#3159A6] focus:bg-white focus:ring-4 focus:ring-blue-500/10"
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
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      <RefreshCw size={15} />
                      Reset
                    </button>

                  </div>

                </div>
              </section>

              {/* ================================================= */}
              {/* TRANSACTION TABLE */}
              {/* ================================================= */}

              <section className="overflow-hidden rounded-2xl border border-[#DCE4F0] bg-white shadow-[0_3px_14px_rgba(15,23,42,0.05)]">

                <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

                  <div>
                    <div className="flex items-center gap-2">

                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF3FB] text-[#1E3A8A]">
                        <Receipt size={16} />
                      </div>

                      <h2 className="text-sm font-bold text-[#172033]">
                        Riwayat Transaksi
                      </h2>

                    </div>

                    <p className="mt-1 ml-10 text-xs text-slate-400">
                      {filteredData.length} transaksi ditemukan
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">

                    <span className="h-2 w-2 rounded-full bg-emerald-500" />

                    Sistem kas aktif

                  </div>

                </div>

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[1100px]">

                    <thead>
                      <tr className="border-b border-slate-200 bg-[#F8FAFC]">

                        <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                          Tanggal
                        </th>

                        <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                          Transaksi
                        </th>

                        <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                          Jenis
                        </th>

                        <th className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                          Metode
                        </th>

                        <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                          Debit
                        </th>

                        <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                          Kredit
                        </th>

                        <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                          Saldo
                        </th>

                        <th className="px-5 py-3.5 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                          Aksi
                        </th>

                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">

                      {currentEntries.length === 0 ? (

                        <tr>
                          <td
                            colSpan={8}
                            className="px-5 py-16 text-center"
                          >

                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                              <FileText size={22} />
                            </div>

                            <p className="mt-3 text-sm font-semibold text-slate-700">
                              Tidak ada transaksi
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Coba ubah kata kunci atau filter.
                            </p>

                          </td>
                        </tr>

                      ) : (

                        currentEntries.map((item) => (

                          <tr
                            key={item.id}
                            className="group transition hover:bg-[#F8FAFD]"
                          >

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2.5">

                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                  <CalendarDays size={14} />
                                </div>

                                <span className="whitespace-nowrap text-sm font-medium text-slate-600">
                                  {formatDate(item.tanggal)}
                                </span>

                              </div>
                            </td>

                            <td className="px-5 py-4">

                              <div>
                                <p className="text-sm font-semibold text-[#172033]">
                                  {item.keterangan}
                                </p>

                                <p className="mt-1 max-w-[290px] truncate text-xs text-slate-400">
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

                              <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">

                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
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
                              <span className="text-sm font-semibold text-rose-600">
                                {item.debit > 0
                                  ? formatCurrency(item.debit)
                                  : "-"}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-right">
                              <span className="text-sm font-semibold text-emerald-600">
                                {item.kredit > 0
                                  ? formatCurrency(item.kredit)
                                  : "-"}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-right">

                              <span
                                className={`text-sm font-bold ${
                                  item.saldo >= 0
                                    ? "text-[#172033]"
                                    : "text-rose-600"
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
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-[#EEF3FB] hover:text-[#2563EB]"
                                >
                                  <Eye size={15} />
                                </Link>

                                <Link
                                  href={`/admin/keuangan/jurnalKas/edit/${item.id}`}
                                  title="Edit"
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-amber-50 hover:text-amber-600"
                                >
                                  <Edit size={15} />
                                </Link>

                                <button
                                  onClick={() =>
                                    handleDelete(item.id)
                                  }
                                  title="Hapus"
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
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
                  <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

                    <p className="text-xs text-slate-500">
                      Menampilkan{" "}
                      <span className="font-semibold text-slate-700">
                        {(safePage - 1) * entriesPerPage + 1}
                      </span>{" "}
                      -{" "}
                      <span className="font-semibold text-slate-700">
                        {Math.min(
                          safePage * entriesPerPage,
                          filteredData.length
                        )}
                      </span>{" "}
                      dari{" "}
                      <span className="font-semibold text-slate-700">
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
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
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
                              ? "bg-[#1E3A8A] text-white shadow-sm"
                              : "text-slate-500 hover:bg-slate-100"
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
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
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
      iconBg: "bg-emerald-50 text-emerald-600",
      accent: "bg-emerald-500",
      value: "text-[#172033]",
    },

    expense: {
      iconBg: "bg-rose-50 text-rose-600",
      accent: "bg-rose-500",
      value: "text-[#172033]",
    },

    balance: {
      iconBg: "bg-[#EEF3FB] text-[#1E3A8A]",
      accent: "bg-[#1E3A8A]",
      value: "text-[#172033]",
    },
  };

  const style = styles[type];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#DCE4F0] bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(15,23,42,0.07)]">

      <div
        className={`absolute left-0 top-0 h-full w-[3px] ${style.accent}`}
      />

      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0">

          <p className="text-xs font-semibold text-slate-500">
            {label}
          </p>

          <p
            className={`mt-2 truncate text-xl font-bold tracking-tight sm:text-2xl ${style.value}`}
          >
            {value}
          </p>

          <p className="mt-2 text-xs text-slate-400">
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
          ? "text-emerald-600"
          : "text-rose-600"
      }`}
    >
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-md ${
          isIncome
            ? "bg-emerald-50"
            : "bg-rose-50"
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