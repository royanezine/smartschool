"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Download,
  Eye,
  FileSpreadsheet,
  Filter,
  Printer,
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  CreditCard,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Clock,
  FileText,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";

import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";

// Data dummy awal
const initialTransactions = [
  {
    id: 1,
    tanggal: "2026-09-01",
    deskripsi: "Pembayaran SPP Siswa",
    kategori: "Pemasukan",
    jumlah: 12500000,
    metode: "Transfer",
    status: "Lunas",
  },
  {
    id: 2,
    tanggal: "2026-09-02",
    deskripsi: "Pembelian Alat Tulis",
    kategori: "Pengeluaran",
    jumlah: 2350000,
    metode: "Tunai",
    status: "Lunas",
  },
  {
    id: 3,
    tanggal: "2026-09-03",
    deskripsi: "Gaji Guru Bulan Agustus",
    kategori: "Pengeluaran",
    jumlah: 35000000,
    metode: "Transfer",
    status: "Lunas",
  },
  {
    id: 4,
    tanggal: "2026-09-05",
    deskripsi: "Donasi BOS",
    kategori: "Pemasukan",
    jumlah: 5000000,
    metode: "Transfer",
    status: "Pending",
  },
  {
    id: 5,
    tanggal: "2026-09-06",
    deskripsi: "Biaya Listrik",
    kategori: "Pengeluaran",
    jumlah: 1800000,
    metode: "Tunai",
    status: "Lunas",
  },
  {
    id: 6,
    tanggal: "2026-09-07",
    deskripsi: "SPP Siswa",
    kategori: "Pemasukan",
    jumlah: 8000000,
    metode: "Transfer",
    status: "Lunas",
  },
  {
    id: 7,
    tanggal: "2026-09-08",
    deskripsi: "Pembelian Komputer",
    kategori: "Pengeluaran",
    jumlah: 12000000,
    metode: "Transfer",
    status: "Pending",
  },
];

export default function LaporanKeuanganPage() {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(5);

  // State untuk data transaksi (bisa berubah saat edit/hapus)
  const [transactions, setTransactions] = useState(initialTransactions);
  const [selectedId, setSelectedId] = useState(null);

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  // Statistik
  const totalPemasukan = transactions
    .filter((t) => t.kategori === "Pemasukan")
    .reduce((a, b) => a + b.jumlah, 0);
  const totalPengeluaran = transactions
    .filter((t) => t.kategori === "Pengeluaran")
    .reduce((a, b) => a + b.jumlah, 0);
  const saldo = totalPemasukan - totalPengeluaran;

  // Filter & Pagination
  const filtered = transactions.filter((t) => {
    const matchSearch =
      t.deskripsi.toLowerCase().includes(search.toLowerCase()) ||
      t.kategori.toLowerCase().includes(search.toLowerCase()) ||
      t.metode.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "semua" || t.kategori === filter;
    return matchSearch && matchFilter;
  });

  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentEntries = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / entriesPerPage);

  // =============================================================
  // HANDLER: Navigasi ke halaman edit
  // =============================================================
  const handleEdit = (id) => {
    router.push(`/laporan-keuangan/edit/${id}`);
  };

  // =============================================================
  // HANDLER: Hapus transaksi
  // =============================================================
  const handleDelete = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
      setTransactions((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // =============================================================
  // HANDLER: Lihat detail (bisa pakai alert atau modal sederhana)
  // =============================================================
  const handleView = (id) => {
    const item = transactions.find((t) => t.id === id);
    if (item) {
      alert(
        `📋 Detail Transaksi\n\n` +
          `Tanggal   : ${item.tanggal}\n` +
          `Deskripsi : ${item.deskripsi}\n` +
          `Kategori  : ${item.kategori}\n` +
          `Jumlah    : Rp ${item.jumlah.toLocaleString()}\n` +
          `Metode    : ${item.metode}\n` +
          `Status    : ${item.status}`
      );
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <Sidebar
        active="laporanKeuangan"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50/50">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
            {/* =========================================================
                HEADER
            ========================================================= */}
            <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-[#0F172A] to-[#1E293B] p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/10 border border-white/5 text-white">
                    <FileSpreadsheet size={28} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-300">
                      Keuangan & Kas
                    </p>
                    <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                      Laporan Keuangan
                    </h1>
                    <p className="mt-1 text-sm text-slate-300">
                      Ringkasan transaksi keuangan sekolah secara lengkap
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/20">
                    <Printer size={16} />
                    Cetak
                  </button>
                  <button className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/20">
                    <Download size={16} />
                    Ekspor
                  </button>
                  <button
                    onClick={() => router.push("/laporan/tambah")}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#155DFC] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition hover:bg-[#0d47c9]"
                  >
                    <Plus size={16} />
                    Tambah Transaksi
                  </button>
                </div>
              </div>
            </div>

            {/* =========================================================
                STATISTIK
            ========================================================= */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                icon={<TrendingUp size={22} />}
                label="Total Pemasukan"
                value={`Rp ${totalPemasukan.toLocaleString()}`}
                color="emerald"
                subtext="Semua pemasukan masuk"
              />
              <StatCard
                icon={<TrendingDown size={22} />}
                label="Total Pengeluaran"
                value={`Rp ${totalPengeluaran.toLocaleString()}`}
                color="red"
                subtext="Semua pengeluaran kas"
              />
              <StatCard
                icon={<Wallet size={22} />}
                label="Saldo Akhir"
                value={`Rp ${saldo.toLocaleString()}`}
                color={saldo >= 0 ? "blue" : "red"}
                subtext={saldo >= 0 ? "Saldo positif" : "Saldo negatif"}
              />
            </div>

            {/* =========================================================
                FILTER & SEARCH
            ========================================================= */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Cari transaksi, kategori, atau metode..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10"
                >
                  <option value="semua">Semua Kategori</option>
                  <option value="Pemasukan">Pemasukan</option>
                  <option value="Pengeluaran">Pengeluaran</option>
                </select>
                <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                  <Calendar size={16} />
                  Periode
                </button>
              </div>
            </div>

            {/* =========================================================
                TABEL
            ========================================================= */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                      <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Tanggal
                      </th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Deskripsi
                      </th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Kategori
                      </th>
                      <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Jumlah
                      </th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Metode
                      </th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Status
                      </th>
                      <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentEntries.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-12 text-center text-slate-400"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <FileText size={32} className="text-slate-300" />
                            <p className="text-sm font-medium">
                              Tidak ada transaksi ditemukan
                            </p>
                            <p className="text-xs">
                              Coba ubah kata kunci pencarian
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentEntries.map((item) => (
                        <tr
                          key={item.id}
                          className="group transition hover:bg-slate-50/80"
                        >
                          <td className="px-4 py-3.5 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <Clock size={14} className="text-slate-400" />
                              {item.tanggal}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 font-medium text-slate-800">
                            {item.deskripsi}
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                item.kategori === "Pemasukan"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {item.kategori}
                            </span>
                          </td>
                          <td
                            className={`px-4 py-3.5 text-right font-bold ${
                              item.kategori === "Pemasukan"
                                ? "text-emerald-600"
                                : "text-red-500"
                            }`}
                          >
                            Rp {item.jumlah.toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5 text-slate-600">
                            {item.metode}
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                item.status === "Lunas"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleView(item.id)}
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-[#155DFC]"
                                title="Lihat Detail"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => handleEdit(item.id)}
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-[#155DFC]"
                                title="Edit Transaksi"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                title="Hapus Transaksi"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filtered.length > 0 && (
                <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-4 py-3">
                  <p className="text-sm text-slate-500">
                    Menampilkan {indexOfFirst + 1}-
                    {Math.min(indexOfLast, filtered.length)} dari{" "}
                    {filtered.length} transaksi
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.max(1, p - 1))
                      }
                      disabled={currentPage === 1}
                      className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
                          currentPage === i + 1
                            ? "bg-[#155DFC] text-white shadow-sm shadow-blue-500/25"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* =========================================================
                FOOTER
            ========================================================= */}
            <footer className="mt-8 border-t border-slate-200/50 pt-6 text-center text-xs text-slate-400">
              © 2026 SmartSchool • Laporan Keuangan
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

// =========================================================
// STAT CARD COMPONENT
// =========================================================
function StatCard({ icon, label, value, color, subtext }) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-[#155DFC]",
  };

  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colors[color]} transition group-hover:scale-105`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-400">{label}</p>
          <p className="mt-1 text-xl font-bold text-slate-800">{value}</p>
          {subtext && (
            <p className="mt-0.5 text-xs text-slate-400">{subtext}</p>
          )}
        </div>
      </div>
    </div>
  );
}