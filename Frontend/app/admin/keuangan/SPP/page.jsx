"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Search,
  Plus,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  Calendar,
  Users,
  Wallet,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  FileText,
  Filter,
  X,
  Save,
  Loader2,
  AlertCircle,
} from "lucide-react";

import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";

export default function SPPPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [filterKelas, setFilterKelas] = useState("semua");
  const [filterBulan, setFilterBulan] = useState("semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(6);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSpp, setSelectedSpp] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    siswa: "",
    kelas: "",
    bulan: "",
    nominal: "",
    status: "Belum",
    tanggalBayar: "",
  });

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  // Data dummy yang lebih kompleks
  const [sppData, setSppData] = useState([
    { id: 1, siswa: "Ahmad Fauzi", kelas: "XII IPA 1", bulan: "September 2026", nominal: 150000, status: "Lunas", tanggalBayar: "2026-09-01", metode: "Transfer", keterangan: "-" },
    { id: 2, siswa: "Siti Rahma", kelas: "XI IPS 2", bulan: "September 2026", nominal: 150000, status: "Belum", tanggalBayar: "-", metode: "-", keterangan: "-" },
    { id: 3, siswa: "Budi Santoso", kelas: "X MIPA 3", bulan: "September 2026", nominal: 150000, status: "Lunas", tanggalBayar: "2026-09-03", metode: "Tunai", keterangan: "Pembayaran tepat waktu" },
    { id: 4, siswa: "Dewi Lestari", kelas: "XII IPS 1", bulan: "September 2026", nominal: 150000, status: "Tunggak", tanggalBayar: "-", metode: "-", keterangan: "Tunggak 2 bulan" },
    { id: 5, siswa: "Eko Prasetyo", kelas: "XI IPA 2", bulan: "September 2026", nominal: 150000, status: "Lunas", tanggalBayar: "2026-09-05", metode: "Transfer", keterangan: "-" },
    { id: 6, siswa: "Rina Marlina", kelas: "XII IPA 1", bulan: "September 2026", nominal: 150000, status: "Lunas", tanggalBayar: "2026-09-02", metode: "Tunai", keterangan: "-" },
    { id: 7, siswa: "Agus Salim", kelas: "XI IPS 1", bulan: "September 2026", nominal: 150000, status: "Belum", tanggalBayar: "-", metode: "-", keterangan: "-" },
    { id: 8, siswa: "Farah Hanum", kelas: "X MIPA 1", bulan: "September 2026", nominal: 150000, status: "Tunggak", tanggalBayar: "-", metode: "-", keterangan: "Tunggak 3 bulan" },
    { id: 9, siswa: "Indra Saputra", kelas: "XII IPA 2", bulan: "September 2026", nominal: 150000, status: "Lunas", tanggalBayar: "2026-09-04", metode: "Transfer", keterangan: "-" },
    { id: 10, siswa: "Nina Kusuma", kelas: "XI IPS 2", bulan: "September 2026", nominal: 150000, status: "Lunas", tanggalBayar: "2026-09-06", metode: "Tunai", keterangan: "-" },
    { id: 11, siswa: "Doni Irawan", kelas: "X MIPA 2", bulan: "September 2026", nominal: 150000, status: "Belum", tanggalBayar: "-", metode: "-", keterangan: "-" },
    { id: 12, siswa: "Rani Permata", kelas: "XII IPS 1", bulan: "September 2026", nominal: 150000, status: "Lunas", tanggalBayar: "2026-09-07", metode: "Transfer", keterangan: "-" },
  ]);

  // Get unique values for filters
  const uniqueKelas = [...new Set(sppData.map(s => s.kelas))];
  const uniqueBulan = [...new Set(sppData.map(s => s.bulan))];

  // Statistik
  const totalSiswa = sppData.length;
  const totalLunas = sppData.filter(s => s.status === "Lunas").length;
  const totalBelum = sppData.filter(s => s.status === "Belum").length;
  const totalTunggak = sppData.filter(s => s.status === "Tunggak").length;
  const totalNominal = sppData.reduce((a, b) => a + b.nominal, 0);
  const totalNominalLunas = sppData.filter(s => s.status === "Lunas").reduce((a, b) => a + b.nominal, 0);
  const totalNominalTunggak = sppData.filter(s => s.status === "Tunggak").reduce((a, b) => a + b.nominal, 0);

  // Filter
  const filtered = sppData.filter(s => {
    const matchSearch = s.siswa.toLowerCase().includes(search.toLowerCase()) || s.kelas.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "semua" || s.status === filterStatus;
    const matchKelas = filterKelas === "semua" || s.kelas === filterKelas;
    const matchBulan = filterBulan === "semua" || s.bulan === filterBulan;
    return matchSearch && matchStatus && matchKelas && matchBulan;
  });

  // Pagination
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentEntries = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / entriesPerPage);

  // Reset pagination when filter changes
  const handleFilterChange = (setter, value) => {
    setter(value);
    setCurrentPage(1);
  };

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle add
  const handleAdd = () => {
    const newId = Math.max(...sppData.map(s => s.id)) + 1;
    const newEntry = {
      id: newId,
      ...formData,
      nominal: parseInt(formData.nominal) || 0,
    };
    setSppData(prev => [...prev, newEntry]);
    setShowAddModal(false);
    setFormData({ siswa: "", kelas: "", bulan: "", nominal: "", status: "Belum", tanggalBayar: "" });
  };

  // Handle delete
  const handleDelete = (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      setSppData(prev => prev.filter(s => s.id !== id));
    }
  };

  // Handle view detail
  const handleViewDetail = (item) => {
    setSelectedSpp(item);
    setShowDetailModal(true);
  };

  // Handle edit
  const handleEdit = (item) => {
    setSelectedSpp(item);
    setFormData({
      siswa: item.siswa,
      kelas: item.kelas,
      bulan: item.bulan,
      nominal: item.nominal.toString(),
      status: item.status,
      tanggalBayar: item.tanggalBayar,
    });
    setShowEditModal(true);
  };

  const handleUpdate = () => {
    setSppData(prev => prev.map(s => 
      s.id === selectedSpp.id ? {
        ...s,
        ...formData,
        nominal: parseInt(formData.nominal) || 0,
      } : s
    ));
    setShowEditModal(false);
    setSelectedSpp(null);
    setFormData({ siswa: "", kelas: "", bulan: "", nominal: "", status: "Belum", tanggalBayar: "" });
  };

  const getStatusBadge = (status) => {
    const styles = {
      Lunas: "bg-emerald-100 text-emerald-700",
      Belum: "bg-yellow-100 text-yellow-700",
      Tunggak: "bg-red-100 text-red-700",
    };
    const icons = {
      Lunas: <CheckCircle2 size={12} className="mr-1" />,
      Belum: <Clock size={12} className="mr-1" />,
      Tunggak: <XCircle size={12} className="mr-1" />,
    };
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status] || "bg-slate-100 text-slate-600"}`}>
        {icons[status]}
        {status}
      </span>
    );
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <Sidebar
        active="spp"
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
                    <Wallet size={28} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-300">
                      Keuangan & Kas
                    </p>
                    <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                      SPP
                    </h1>
                    <p className="mt-1 text-sm text-slate-300">
                      Kelola pembayaran SPP siswa secara lengkap
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/20">
                    <FileText size={16} />
                    Laporan
                  </button>
                  <button
                    onClick={() => setShowAddModal(true)}
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
                icon={<Users size={22} />}
                label="Total Siswa"
                value={totalSiswa}
                color="blue"
                subtext={`Total siswa terdaftar`}
              />
              <StatCard
                icon={<CheckCircle2 size={22} />}
                label="Lunas"
                value={totalLunas}
                color="emerald"
                subtext={`Rp ${totalNominalLunas.toLocaleString()}`}
              />
              <StatCard
                icon={<Clock size={22} />}
                label="Belum"
                value={totalBelum}
                color="yellow"
                subtext={`${totalBelum} siswa belum bayar`}
              />
              <StatCard
                icon={<XCircle size={22} />}
                label="Tunggak"
                value={totalTunggak}
                color="red"
                subtext={`Rp ${totalNominalTunggak.toLocaleString()}`}
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
                  placeholder="Cari siswa atau kelas..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => handleFilterChange(setFilterStatus, e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10"
                >
                  <option value="semua">Semua Status</option>
                  <option value="Lunas">Lunas</option>
                  <option value="Belum">Belum</option>
                  <option value="Tunggak">Tunggak</option>
                </select>

                <select
                  value={filterKelas}
                  onChange={(e) => handleFilterChange(setFilterKelas, e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10"
                >
                  <option value="semua">Semua Kelas</option>
                  {uniqueKelas.map((kelas) => (
                    <option key={kelas} value={kelas}>{kelas}</option>
                  ))}
                </select>

                <select
                  value={filterBulan}
                  onChange={(e) => handleFilterChange(setFilterBulan, e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10"
                >
                  <option value="semua">Semua Bulan</option>
                  {uniqueBulan.map((bulan) => (
                    <option key={bulan} value={bulan}>{bulan}</option>
                  ))}
                </select>
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
                      <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">No</th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Siswa</th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Kelas</th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Bulan</th>
                      <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Nominal</th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Tgl Bayar</th>
                      <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentEntries.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-12 text-center text-slate-400">
                          <div className="flex flex-col items-center gap-2">
                            <FileText size={32} className="text-slate-300" />
                            <p className="text-sm font-medium">Tidak ada data ditemukan</p>
                            <p className="text-xs">Coba ubah kata kunci atau filter</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentEntries.map((s, index) => (
                        <tr key={s.id} className="group transition hover:bg-slate-50/80">
                          <td className="px-4 py-3.5 text-sm text-slate-500">{indexOfFirst + index + 1}</td>
                          <td className="px-4 py-3.5 font-medium text-slate-800">{s.siswa}</td>
                          <td className="px-4 py-3.5 text-slate-600">{s.kelas}</td>
                          <td className="px-4 py-3.5 text-slate-600">{s.bulan}</td>
                          <td className="px-4 py-3.5 text-right font-bold text-slate-800">
                            Rp {s.nominal.toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5">{getStatusBadge(s.status)}</td>
                          <td className="px-4 py-3.5 text-slate-600">{s.tanggalBayar || "-"}</td>
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleViewDetail(s)}
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-[#155DFC]"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => handleEdit(s)}
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-[#155DFC]"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(s.id)}
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
                    {Math.min(indexOfLast, filtered.length)} dari {filtered.length} data
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
              © 2026 SmartSchool • SPP
            </footer>
          </div>
        </main>
      </div>

      {/* =========================================================
          MODAL TAMBAH
      ========================================================= */}
      {showAddModal && (
        <Modal
          title="Tambah Pembayaran SPP"
          icon={<Plus size={20} className="text-[#155DFC]" />}
          onClose={() => setShowAddModal(false)}
          onSave={handleAdd}
          saveLabel="Simpan"
        >
          <FormInput label="Nama Siswa" name="siswa" value={formData.siswa} onChange={handleInputChange} placeholder="Masukkan nama siswa" />
          <FormInput label="Kelas" name="kelas" value={formData.kelas} onChange={handleInputChange} placeholder="Masukkan kelas" />
          <FormSelect label="Bulan" name="bulan" value={formData.bulan} onChange={handleInputChange} options={uniqueBulan} placeholder="Pilih bulan" />
          <FormInput label="Nominal (Rp)" name="nominal" value={formData.nominal} onChange={handleInputChange} placeholder="Masukkan nominal" type="number" />
          <FormSelect label="Status" name="status" value={formData.status} onChange={handleInputChange} options={["Belum", "Lunas", "Tunggak"]} />
          <FormInput label="Tanggal Bayar" name="tanggalBayar" value={formData.tanggalBayar} onChange={handleInputChange} placeholder="YYYY-MM-DD" />
        </Modal>
      )}

      {/* =========================================================
          MODAL EDIT
      ========================================================= */}
      {showEditModal && (
        <Modal
          title="Edit Pembayaran SPP"
          icon={<Edit size={20} className="text-[#155DFC]" />}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdate}
          saveLabel="Update"
        >
          <FormInput label="Nama Siswa" name="siswa" value={formData.siswa} onChange={handleInputChange} placeholder="Masukkan nama siswa" />
          <FormInput label="Kelas" name="kelas" value={formData.kelas} onChange={handleInputChange} placeholder="Masukkan kelas" />
          <FormSelect label="Bulan" name="bulan" value={formData.bulan} onChange={handleInputChange} options={uniqueBulan} placeholder="Pilih bulan" />
          <FormInput label="Nominal (Rp)" name="nominal" value={formData.nominal} onChange={handleInputChange} placeholder="Masukkan nominal" type="number" />
          <FormSelect label="Status" name="status" value={formData.status} onChange={handleInputChange} options={["Belum", "Lunas", "Tunggak"]} />
          <FormInput label="Tanggal Bayar" name="tanggalBayar" value={formData.tanggalBayar} onChange={handleInputChange} placeholder="YYYY-MM-DD" />
        </Modal>
      )}

      {/* =========================================================
          MODAL DETAIL
      ========================================================= */}
      {showDetailModal && selectedSpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#155DFC]">
                  <Eye size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Detail Pembayaran SPP</h2>
                  <p className="text-xs text-slate-400">Informasi lengkap pembayaran</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <DetailRow label="Siswa" value={selectedSpp.siswa} />
              <DetailRow label="Kelas" value={selectedSpp.kelas} />
              <DetailRow label="Bulan" value={selectedSpp.bulan} />
              <DetailRow label="Nominal" value={`Rp ${selectedSpp.nominal.toLocaleString()}`} />
              <DetailRow label="Status" value={selectedSpp.status} valueBadge={getStatusBadge(selectedSpp.status)} />
              <DetailRow label="Tanggal Bayar" value={selectedSpp.tanggalBayar || "-"} />
              <DetailRow label="Metode" value={selectedSpp.metode || "-"} />
              <DetailRow label="Keterangan" value={selectedSpp.keterangan || "-"} />
            </div>

            <div className="border-t border-slate-100 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="rounded-xl bg-[#155DFC] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d47c9]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================
// STAT CARD COMPONENT
// =========================================================
function StatCard({ icon, label, value, color, subtext }) {
  const colors = {
    blue: "bg-blue-50 text-[#155DFC]",
    emerald: "bg-emerald-50 text-emerald-600",
    yellow: "bg-yellow-50 text-yellow-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colors[color]} transition group-hover:scale-105`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-400">{label}</p>
          <p className="mt-1 text-xl font-bold text-slate-800">{value}</p>
          {subtext && <p className="mt-0.5 text-xs text-slate-400">{subtext}</p>}
        </div>
      </div>
    </div>
  );
}

// =========================================================
// MODAL COMPONENT
// =========================================================
function Modal({ title, icon, onClose, onSave, saveLabel = "Simpan", children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">{icon}</div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{title}</h2>
              <p className="text-xs text-slate-400">Isi data dengan benar</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">{children}</div>

        <div className="border-t border-slate-100 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            onClick={onSave}
            className="rounded-xl bg-[#155DFC] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d47c9]"
          >
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// FORM COMPONENTS
// =========================================================
function FormInput({ label, name, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10"
      />
    </div>
  );
}

function FormSelect({ label, name, value, onChange, options, placeholder }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function DetailRow({ label, value, valueBadge }) {
  return (
    <div className="flex items-start justify-between border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      {valueBadge ? (
        <span>{valueBadge}</span>
      ) : (
        <span className="text-sm font-semibold text-slate-800">{value || "-"}</span>
      )}
    </div>
  );
}