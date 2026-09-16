"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Search,
  Eye,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Plus,
  X,
  Calendar,
  Filter,
  Download,
  Printer,
  FileText,
  TrendingUp,
  TrendingDown,
  CreditCard,
} from "lucide-react";

import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";

export default function TrackingTunggakanPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(5);

  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTunggakan, setSelectedTunggakan] = useState(null);

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  // Data dummy lengkap
  const [tunggakan, setTunggakan] = useState([
    {
      id: 1,
      siswa: "Siti Rahma",
      kelas: "XI IPS 2",
      nisn: "1234567890",
      tagihan: "SPP September 2026",
      nominal: 150000,
      jatuhTempo: "2026-09-10",
      hari: 5,
      status: "Menunggak",
      kategori: "SPP",
      denda: 15000,
      totalTagihan: 165000,
      tanggalTagihan: "2026-09-01",
    },
    {
      id: 2,
      siswa: "Dewi Lestari",
      kelas: "XII IPS 1",
      nisn: "1234567891",
      tagihan: "SPP September 2026",
      nominal: 150000,
      jatuhTempo: "2026-09-10",
      hari: 8,
      status: "Menunggak",
      kategori: "SPP",
      denda: 24000,
      totalTagihan: 174000,
      tanggalTagihan: "2026-09-01",
    },
    {
      id: 3,
      siswa: "Budi Santoso",
      kelas: "X MIPA 3",
      nisn: "1234567892",
      tagihan: "Uang Pangkal",
      nominal: 500000,
      jatuhTempo: "2026-08-31",
      hari: 12,
      status: "Menunggak",
      kategori: "Pangkal",
      denda: 60000,
      totalTagihan: 560000,
      tanggalTagihan: "2026-08-01",
    },
    {
      id: 4,
      siswa: "Ahmad Fauzi",
      kelas: "XII IPA 1",
      nisn: "1234567893",
      tagihan: "SPP September 2026",
      nominal: 150000,
      jatuhTempo: "2026-09-10",
      hari: 0,
      status: "Lunas",
      kategori: "SPP",
      denda: 0,
      totalTagihan: 150000,
      tanggalTagihan: "2026-09-01",
      tanggalBayar: "2026-09-08",
    },
    {
      id: 5,
      siswa: "Eko Prasetyo",
      kelas: "XI IPA 2",
      nisn: "1234567894",
      tagihan: "SPP September 2026",
      nominal: 150000,
      jatuhTempo: "2026-09-10",
      hari: 3,
      status: "Menunggak",
      kategori: "SPP",
      denda: 9000,
      totalTagihan: 159000,
      tanggalTagihan: "2026-09-01",
    },
    {
      id: 6,
      siswa: "Rina Anggraini",
      kelas: "XII IPA 2",
      nisn: "1234567895",
      tagihan: "Kegiatan Ekstrakurikuler",
      nominal: 75000,
      jatuhTempo: "2026-09-15",
      hari: 0,
      status: "Lunas",
      kategori: "Ekstra",
      denda: 0,
      totalTagihan: 75000,
      tanggalTagihan: "2026-09-01",
      tanggalBayar: "2026-09-12",
    },
    {
      id: 7,
      siswa: "Maya Sari",
      kelas: "X MIPA 1",
      nisn: "1234567896",
      tagihan: "SPP September 2026",
      nominal: 150000,
      jatuhTempo: "2026-09-10",
      hari: 6,
      status: "Menunggak",
      kategori: "SPP",
      denda: 18000,
      totalTagihan: 168000,
      tanggalTagihan: "2026-09-01",
    },
  ]);

  // Statistik
  const totalTunggakan = tunggakan.filter((t) => t.status === "Menunggak").length;
  const totalLunas = tunggakan.filter((t) => t.status === "Lunas").length;
  const totalNominalTunggak = tunggakan
    .filter((t) => t.status === "Menunggak")
    .reduce((a, b) => a + b.totalTagihan, 0);
  const totalSiswaTunggak = new Set(
    tunggakan.filter((t) => t.status === "Menunggak").map((t) => t.siswa)
  ).size;

  // Filter & Pagination
  const filtered = tunggakan.filter((t) => {
    const matchSearch =
      t.siswa.toLowerCase().includes(search.toLowerCase()) ||
      t.kelas.toLowerCase().includes(search.toLowerCase()) ||
      t.nisn.includes(search);
    const matchFilter = filter === "semua" || t.status === filter;
    return matchSearch && matchFilter;
  });

  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentEntries = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / entriesPerPage);

  // Modal handlers
  const handleViewDetail = (item) => {
    setSelectedTunggakan(item);
    setShowDetailModal(true);
  };

  const handleEdit = (item) => {
    setSelectedTunggakan(item);
    setShowEditModal(true);
  };

  const handleDelete = (item) => {
    setSelectedTunggakan(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedTunggakan) {
      setTunggakan(tunggakan.filter((t) => t.id !== selectedTunggakan.id));
      setShowDeleteModal(false);
      setSelectedTunggakan(null);
    }
  };

  const handleAddPayment = () => {
    setShowAddModal(true);
  };

  const saveEdit = () => {
    // Simulasi save
    setShowEditModal(false);
    setSelectedTunggakan(null);
  };

  const saveAdd = () => {
    // Simulasi add
    setShowAddModal(false);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <Sidebar
        active="trackingTunggakan"
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
                BREADCRUMB
            ========================================================= */}
            <div className="flex items-center gap-2 text-sm mb-6">
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-1.5 text-slate-500 transition hover:text-[#155DFC]"
              >
                <ArrowLeft size={16} />
                <span className="font-medium">Kembali</span>
              </button>
              <span className="text-slate-300">/</span>
              <span className="text-slate-400">Keuangan</span>
              <span className="text-slate-300">/</span>
              <span className="font-medium text-[#155DFC]">Tracking Tunggakan</span>
            </div>

            {/* =========================================================
                HEADER
            ========================================================= */}
            <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-[#0F172A] to-[#1E293B] p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/10 border border-white/5 text-white">
                    <AlertCircle size={28} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-300">
                      Keuangan & Kas
                    </p>
                    <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                      Tracking Tunggakan
                    </h1>
                    <p className="mt-1 text-sm text-slate-300">
                      Pantau dan kelola tagihan siswa yang menunggak
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
                    onClick={handleAddPayment}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#155DFC] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition hover:bg-[#0d47c9]"
                  >
                    <Plus size={16} />
                    Tambah Pembayaran
                  </button>
                </div>
              </div>
            </div>

            {/* =========================================================
                STATISTIK
            ========================================================= */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={<AlertCircle size={22} />}
                label="Total Tunggakan"
                value={totalTunggakan}
                color="red"
                subtext="Tagihan yang belum dibayar"
              />
              <StatCard
                icon={<DollarSign size={22} />}
                label="Total Nominal Tunggak"
                value={`Rp ${totalNominalTunggak.toLocaleString()}`}
                color="blue"
                subtext="Total tagihan + denda"
              />
              <StatCard
                icon={<Users size={22} />}
                label="Siswa Tunggak"
                value={totalSiswaTunggak}
                color="purple"
                subtext="Jumlah siswa menunggak"
              />
              <StatCard
                icon={<CheckCircle2 size={22} />}
                label="Lunas"
                value={totalLunas}
                color="emerald"
                subtext="Tagihan sudah dibayar"
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
                  placeholder="Cari siswa, kelas, atau NISN..."
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
                  <option value="semua">Semua Status</option>
                  <option value="Menunggak">Menunggak</option>
                  <option value="Lunas">Lunas</option>
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
                        Siswa
                      </th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Kelas
                      </th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Tagihan
                      </th>
                      <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Nominal
                      </th>
                      <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Denda
                      </th>
                      <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Total
                      </th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Jatuh Tempo
                      </th>
                      <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
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
                          colSpan={9}
                          className="px-4 py-12 text-center text-slate-400"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <FileText size={32} className="text-slate-300" />
                            <p className="text-sm font-medium">
                              Tidak ada data tunggakan
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
                          <td className="px-4 py-3.5">
                            <div>
                              <p className="font-medium text-slate-800">
                                {item.siswa}
                              </p>
                              <p className="text-xs text-slate-400">
                                NISN: {item.nisn}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-slate-600">
                            {item.kelas}
                          </td>
                          <td className="px-4 py-3.5">
                            <div>
                              <p className="text-slate-700">{item.tagihan}</p>
                              <p className="text-xs text-slate-400">
                                {item.kategori}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right font-medium text-slate-700">
                            Rp {item.nominal.toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5 text-right font-medium text-red-500">
                            {item.denda > 0
                              ? `Rp ${item.denda.toLocaleString()}`
                              : "-"}
                          </td>
                          <td className="px-4 py-3.5 text-right font-bold text-slate-800">
                            Rp {item.totalTagihan.toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5 text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={14} className="text-slate-400" />
                              {item.jatuhTempo}
                              {item.hari > 0 && (
                                <span className="ml-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                                  +{item.hari} hari
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                item.status === "Lunas"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {item.status === "Lunas" ? (
                                <CheckCircle2 size={12} />
                              ) : (
                                <Clock size={12} />
                              )}
                              {item.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleViewDetail(item)}
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-[#155DFC]"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => handleEdit(item)}
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-[#155DFC]"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(item)}
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
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
                    {filtered.length} data
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
              © 2026 SmartSchool • Tracking Tunggakan
            </footer>
          </div>
        </main>
      </div>

      {/* =========================================================
          MODAL DETAIL
      ========================================================= */}
      {showDetailModal && selectedTunggakan && (
        <Modal
          title="Detail Tunggakan"
          onClose={() => setShowDetailModal(false)}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-slate-400">Siswa</p>
                <p className="font-semibold text-slate-800">
                  {selectedTunggakan.siswa}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">NISN</p>
                <p className="font-semibold text-slate-800">
                  {selectedTunggakan.nisn}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Kelas</p>
                <p className="font-semibold text-slate-800">
                  {selectedTunggakan.kelas}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Kategori</p>
                <p className="font-semibold text-slate-800">
                  {selectedTunggakan.kategori}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Tagihan</p>
                <p className="font-semibold text-slate-800">
                  {selectedTunggakan.tagihan}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Status</p>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    selectedTunggakan.status === "Lunas"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {selectedTunggakan.status === "Lunas" ? (
                    <CheckCircle2 size={12} />
                  ) : (
                    <Clock size={12} />
                  )}
                  {selectedTunggakan.status}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Nominal</p>
                <p className="font-semibold text-slate-800">
                  Rp {selectedTunggakan.nominal.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Denda</p>
                <p className="font-semibold text-red-500">
                  Rp {selectedTunggakan.denda.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Total</p>
                <p className="font-bold text-slate-800">
                  Rp {selectedTunggakan.totalTagihan.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Jatuh Tempo</p>
                <p className="font-semibold text-slate-800">
                  {selectedTunggakan.jatuhTempo}
                </p>
              </div>
              {selectedTunggakan.tanggalBayar && (
                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Tanggal Bayar
                  </p>
                  <p className="font-semibold text-emerald-600">
                    {selectedTunggakan.tanggalBayar}
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowDetailModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Tutup
              </button>
              <button className="rounded-xl bg-[#155DFC] px-4 py-2 text-sm font-medium text-white hover:bg-[#0d47c9]">
                Bayar Sekarang
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* =========================================================
          MODAL EDIT
      ========================================================= */}
      {showEditModal && selectedTunggakan && (
        <Modal title="Edit Tunggakan" onClose={() => setShowEditModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Nama Siswa
              </label>
              <input
                type="text"
                value={selectedTunggakan.siswa}
                onChange={(e) =>
                  setSelectedTunggakan({
                    ...selectedTunggakan,
                    siswa: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Kelas
              </label>
              <input
                type="text"
                value={selectedTunggakan.kelas}
                onChange={(e) =>
                  setSelectedTunggakan({
                    ...selectedTunggakan,
                    kelas: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                value={selectedTunggakan.status}
                onChange={(e) =>
                  setSelectedTunggakan({
                    ...selectedTunggakan,
                    status: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10"
              >
                <option value="Menunggak">Menunggak</option>
                <option value="Lunas">Lunas</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowEditModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={saveEdit}
                className="rounded-xl bg-[#155DFC] px-4 py-2 text-sm font-medium text-white hover:bg-[#0d47c9]"
              >
                Simpan
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* =========================================================
          MODAL DELETE
      ========================================================= */}
      {showDeleteModal && selectedTunggakan && (
        <Modal title="Konfirmasi Hapus" onClose={() => setShowDeleteModal(false)}>
          <div className="space-y-4">
            <div className="flex items-start gap-4 rounded-xl border border-red-200 bg-red-50 p-4">
              <AlertCircle size={24} className="shrink-0 text-red-500" />
              <div>
                <p className="text-sm font-semibold text-red-800">
                  Hapus Data Tunggakan?
                </p>
                <p className="text-sm text-red-600">
                  Apakah Anda yakin ingin menghapus data tunggakan untuk{" "}
                  <span className="font-bold">
                    {selectedTunggakan.siswa}
                  </span>?
                  Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* =========================================================
          MODAL ADD PAYMENT
      ========================================================= */}
      {showAddModal && (
        <Modal title="Tambah Pembayaran" onClose={() => setShowAddModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Nama Siswa <span className="text-red-500">*</span>
              </label>
              <select className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10">
                <option value="">Pilih Siswa</option>
                <option value="1">Ahmad Fauzi</option>
                <option value="2">Siti Rahma</option>
                <option value="3">Budi Santoso</option>
                <option value="4">Dewi Lestari</option>
                <option value="5">Eko Prasetyo</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Jenis Tagihan <span className="text-red-500">*</span>
              </label>
              <select className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10">
                <option value="">Pilih Tagihan</option>
                <option value="SPP">SPP</option>
                <option value="Pangkal">Uang Pangkal</option>
                <option value="Ekstra">Ekstrakurikuler</option>
                <option value="Ujian">Ujian Nasional</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Nominal <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="Masukkan nominal"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Tanggal Bayar <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={saveAdd}
                className="rounded-xl bg-[#155DFC] px-4 py-2 text-sm font-medium text-white hover:bg-[#0d47c9]"
              >
                Simpan
              </button>
            </div>
          </div>
        </Modal>
      )}
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
    purple: "bg-purple-50 text-purple-600",
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

// =========================================================
// MODAL COMPONENT
// =========================================================
function Modal({ title, children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>
        <div className="divide-y divide-slate-100">{children}</div>
      </div>
    </div>
  );
}