"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Search,
  Wallet,
  TrendingUp,
  Users,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  X,
  Save,
  CreditCard,
  DollarSign,
} from "lucide-react";

import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";

export default function TabunganSiswaPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    nama: "",
    kelas: "",
    saldo: "",
    totalSetor: "",
    totalTarik: "",
  });

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  const [students, setStudents] = useState([
    { id: 1, nama: "Ahmad Fauzi", kelas: "XII IPA 1", saldo: 450000, totalSetor: 600000, totalTarik: 150000 },
    { id: 2, nama: "Siti Rahma", kelas: "XI IPS 2", saldo: 275000, totalSetor: 350000, totalTarik: 75000 },
    { id: 3, nama: "Budi Santoso", kelas: "X MIPA 3", saldo: 620000, totalSetor: 700000, totalTarik: 80000 },
    { id: 4, nama: "Dewi Lestari", kelas: "XII IPS 1", saldo: 120000, totalSetor: 200000, totalTarik: 80000 },
    { id: 5, nama: "Eko Prasetyo", kelas: "XI IPA 2", saldo: 380000, totalSetor: 500000, totalTarik: 120000 },
    { id: 6, nama: "Fitriani Nur", kelas: "X MIPA 1", saldo: 520000, totalSetor: 650000, totalTarik: 130000 },
    { id: 7, nama: "Galih Prabowo", kelas: "XII IPS 2", saldo: 90000, totalSetor: 200000, totalTarik: 110000 },
  ]);

  const filtered = students.filter(s =>
    s.nama.toLowerCase().includes(search.toLowerCase()) ||
    s.kelas.toLowerCase().includes(search.toLowerCase())
  );

  const totalSaldo = students.reduce((a, b) => a + b.saldo, 0);
  const totalSetor = students.reduce((a, b) => a + b.totalSetor, 0);
  const totalTarik = students.reduce((a, b) => a + b.totalTarik, 0);

  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentEntries = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / entriesPerPage);

  const handleOpenModal = (student = null) => {
    if (student) {
      setSelectedStudent(student);
      setFormData({
        nama: student.nama,
        kelas: student.kelas,
        saldo: student.saldo.toString(),
        totalSetor: student.totalSetor.toString(),
        totalTarik: student.totalTarik.toString(),
      });
    } else {
      setSelectedStudent(null);
      setFormData({ nama: "", kelas: "", saldo: "", totalSetor: "", totalTarik: "" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  const handleSave = () => {
    if (selectedStudent) {
      setStudents(students.map(s =>
        s.id === selectedStudent.id
          ? { ...s, ...formData, saldo: parseInt(formData.saldo), totalSetor: parseInt(formData.totalSetor), totalTarik: parseInt(formData.totalTarik) }
          : s
      ));
    } else {
      const newId = Math.max(...students.map(s => s.id)) + 1;
      setStudents([...students, {
        id: newId,
        nama: formData.nama,
        kelas: formData.kelas,
        saldo: parseInt(formData.saldo),
        totalSetor: parseInt(formData.totalSetor),
        totalTarik: parseInt(formData.totalTarik),
      }]);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      setStudents(students.filter(s => s.id !== id));
    }
  };

  const handleViewDetail = (student) => {
    setSelectedStudent(student);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <Sidebar
        active="tabunganSiswa"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{ name: "Admin Sekolah", email: "admin@smartschool.com", avatar: "AD" }}
        />

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50/50">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
            

            {/* Header */}
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
                      Tabungan Siswa
                    </h1>
                    <p className="mt-1 text-sm text-slate-300">
                      Kelola saldo tabungan siswa secara lengkap
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenModal()}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#155DFC] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition hover:bg-[#0d47c9]"
                >
                  <Plus size={16} />
                  Tambah Siswa
                </button>
              </div>
            </div>

            {/* Statistik */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={<Wallet size={22} />}
                label="Total Saldo"
                value={`Rp ${totalSaldo.toLocaleString()}`}
                color="blue"
                subtext="Semua saldo siswa"
              />
              <StatCard
                icon={<TrendingUp size={22} />}
                label="Total Setoran"
                value={`Rp ${totalSetor.toLocaleString()}`}
                color="emerald"
                subtext="Total uang masuk"
              />
              <StatCard
                icon={<CreditCard size={22} />}
                label="Total Penarikan"
                value={`Rp ${totalTarik.toLocaleString()}`}
                color="red"
                subtext="Total uang keluar"
              />
              <StatCard
                icon={<Users size={22} />}
                label="Total Siswa"
                value={students.length}
                color="purple"
                subtext="Terdaftar di sistem"
              />
            </div>

            {/* Search */}
            <div className="relative mb-4">
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

            {/* Tabel */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                      <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Nama
                      </th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Kelas
                      </th>
                      <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Saldo
                      </th>
                      <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Total Setor
                      </th>
                      <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Total Tarik
                      </th>
                      <th className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentEntries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                          <div className="flex flex-col items-center gap-2">
                            <FileText size={32} className="text-slate-300" />
                            <p className="text-sm font-medium">Tidak ada siswa ditemukan</p>
                            <p className="text-xs">Coba ubah kata kunci pencarian</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentEntries.map((s) => (
                        <tr key={s.id} className="group transition hover:bg-slate-50/80">
                          <td className="px-4 py-3.5 font-medium text-slate-800">
                            {s.nama}
                          </td>
                          <td className="px-4 py-3.5 text-slate-600">{s.kelas}</td>
                          <td className="px-4 py-3.5 text-right font-bold text-[#155DFC]">
                            Rp {s.saldo.toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5 text-right font-medium text-emerald-600">
                            Rp {s.totalSetor.toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5 text-right font-medium text-red-500">
                            Rp {s.totalTarik.toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleViewDetail(s)}
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-[#155DFC]"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => handleOpenModal(s)}
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
                    {Math.min(indexOfLast, filtered.length)} dari {filtered.length} siswa
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40"
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
                      className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <footer className="mt-8 border-t border-slate-200/50 pt-6 text-center text-xs text-slate-400">
              © 2026 SmartSchool • Tabungan Siswa
            </footer>
          </div>
        </main>
      </div>

      {/* Modal Tambah/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800">
                {selectedStudent ? "Edit Siswa" : "Tambah Siswa"}
              </h2>
              <button onClick={handleCloseModal} className="rounded-lg p-1 hover:bg-slate-100">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama Siswa</label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#155DFC] focus:ring-2 focus:ring-[#155DFC]/20"
                  placeholder="Masukkan nama siswa"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Kelas</label>
                <input
                  type="text"
                  value={formData.kelas}
                  onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#155DFC] focus:ring-2 focus:ring-[#155DFC]/20"
                  placeholder="Contoh: XII IPA 1"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Saldo (Rp)</label>
                <input
                  type="number"
                  value={formData.saldo}
                  onChange={(e) => setFormData({ ...formData, saldo: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#155DFC] focus:ring-2 focus:ring-[#155DFC]/20"
                  placeholder="Masukkan saldo"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Total Setor (Rp)</label>
                <input
                  type="number"
                  value={formData.totalSetor}
                  onChange={(e) => setFormData({ ...formData, totalSetor: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#155DFC] focus:ring-2 focus:ring-[#155DFC]/20"
                  placeholder="Masukkan total setor"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Total Tarik (Rp)</label>
                <input
                  type="number"
                  value={formData.totalTarik}
                  onChange={(e) => setFormData({ ...formData, totalTarik: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#155DFC] focus:ring-2 focus:ring-[#155DFC]/20"
                  placeholder="Masukkan total tarik"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={handleCloseModal}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                className="rounded-lg bg-[#155DFC] px-4 py-2 text-sm font-medium text-white hover:bg-[#0d47c9]"
              >
                <Save size={16} className="inline mr-2" />
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail */}
      {isDetailModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800">Detail Siswa</h2>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="rounded-lg p-1 hover:bg-slate-100"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between border-b border-slate-100 py-2">
                <span className="text-sm text-slate-500">Nama</span>
                <span className="text-sm font-semibold text-slate-800">{selectedStudent.nama}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-2">
                <span className="text-sm text-slate-500">Kelas</span>
                <span className="text-sm font-semibold text-slate-800">{selectedStudent.kelas}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-2">
                <span className="text-sm text-slate-500">Saldo</span>
                <span className="text-sm font-bold text-[#155DFC]">Rp {selectedStudent.saldo.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-2">
                <span className="text-sm text-slate-500">Total Setor</span>
                <span className="text-sm font-semibold text-emerald-600">Rp {selectedStudent.totalSetor.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-slate-500">Total Tarik</span>
                <span className="text-sm font-semibold text-red-500">Rp {selectedStudent.totalTarik.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="rounded-lg bg-[#155DFC] px-4 py-2 text-sm font-medium text-white hover:bg-[#0d47c9]"
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

function StatCard({ icon, label, value, color, subtext }) {
  const colors = {
    blue: "bg-blue-50 text-[#155DFC]",
    emerald: "bg-emerald-50 text-emerald-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
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