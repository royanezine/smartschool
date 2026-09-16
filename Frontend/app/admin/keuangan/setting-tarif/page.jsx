"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Save,
  Edit,
  Plus,
  Trash2,
  DollarSign,
  Tag,
  Calendar,
  Users,
  X,
  Check,
  Clock,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileText,
  Settings2,
  CreditCard,
  Wallet,
  CircleDollarSign,
  Receipt,
} from "lucide-react";

import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";

export default function SettingTarifPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(4);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("tambah"); // "tambah" | "edit"
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({
    nama: "",
    nominal: "",
    keterangan: "",
    aktif: true,
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  // Data dummy
  const [tarif, setTarif] = useState([
    { id: 1, nama: "SPP", nominal: 150000, keterangan: "Bulanan", aktif: true },
    { id: 2, nama: "Uang Pangkal", nominal: 500000, keterangan: "Sekali", aktif: true },
    { id: 3, nama: "Kegiatan Ekstrakurikuler", nominal: 75000, keterangan: "Bulanan", aktif: false },
    { id: 4, nama: "Ujian Nasional", nominal: 200000, keterangan: "Sekali", aktif: true },
    { id: 5, nama: "Biaya Praktek", nominal: 100000, keterangan: "Per Semester", aktif: true },
    { id: 6, nama: "Dana Sosial", nominal: 50000, keterangan: "Bulanan", aktif: false },
    { id: 7, nama: "Perpustakaan", nominal: 25000, keterangan: "Bulanan", aktif: true },
  ]);

  // Statistik
  const totalTarif = tarif.length;
  const totalNominal = tarif.reduce((a, b) => a + b.nominal, 0);
  const totalAktif = tarif.filter(t => t.aktif).length;

  // Filter & Pagination
  const filtered = tarif.filter(t => {
    const matchSearch = t.nama.toLowerCase().includes(search.toLowerCase()) ||
                        t.keterangan.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "semua" || (filter === "aktif" ? t.aktif : !t.aktif);
    return matchSearch && matchFilter;
  });

  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentEntries = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / entriesPerPage);

  // =========================================================
  // MODAL HANDLERS
  // =========================================================
  const openTambahModal = () => {
    setModalMode("tambah");
    setFormData({ nama: "", nominal: "", keterangan: "", aktif: true });
    setSelectedId(null);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setModalMode("edit");
    setFormData({
      nama: item.nama,
      nominal: String(item.nominal),
      keterangan: item.keterangan,
      aktif: item.aktif,
    });
    setSelectedId(item.id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ nama: "", nominal: "", keterangan: "", aktif: true });
    setSelectedId(null);
  };

  const handleSave = () => {
    if (!formData.nama.trim() || !formData.nominal.trim()) return;

    const nominal = parseInt(formData.nominal.replace(/\./g, ""));
    if (isNaN(nominal) || nominal <= 0) return;

    if (modalMode === "tambah") {
      const newId = Math.max(...tarif.map(t => t.id)) + 1;
      setTarif([...tarif, {
        id: newId,
        nama: formData.nama.trim(),
        nominal: nominal,
        keterangan: formData.keterangan.trim() || "-",
        aktif: formData.aktif,
      }]);
    } else {
      setTarif(tarif.map(t =>
        t.id === selectedId ? {
          ...t,
          nama: formData.nama.trim(),
          nominal: nominal,
          keterangan: formData.keterangan.trim() || "-",
          aktif: formData.aktif,
        } : t
      ));
    }
    closeModal();
  };

  const toggleStatus = (id) => {
    setTarif(tarif.map(t =>
      t.id === id ? { ...t, aktif: !t.aktif } : t
    ));
  };

  const confirmDelete = (id) => {
    setDeleteConfirm(id);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    setTarif(tarif.filter(t => t.id !== deleteConfirm));
    setShowDeleteModal(false);
    setDeleteConfirm(null);
  };

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <Sidebar
        active="settingTarif"
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
                    <Settings2 size={28} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-300">
                      Keuangan & Kas
                    </p>
                    <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                      Setting Tarif Tagihan
                    </h1>
                    <p className="mt-1 text-sm text-slate-300">
                      Kelola tarif biaya sekolah secara terpusat
                    </p>
                  </div>
                </div>

                <button
                  onClick={openTambahModal}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#155DFC] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition hover:bg-[#0d47c9]"
                >
                  <Plus size={16} />
                  Tambah Tarif
                </button>
              </div>
            </div>

            {/* =========================================================
                STATISTIK
            ========================================================= */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={<Tag size={22} />}
                label="Total Tarif"
                value={totalTarif}
                color="blue"
                subtext="Semua jenis tarif"
              />
              <StatCard
                icon={<CircleDollarSign size={22} />}
                label="Total Nominal"
                value={`Rp ${totalNominal.toLocaleString()}`}
                color="emerald"
                subtext="Total semua tarif"
              />
              <StatCard
                icon={<Check size={22} />}
                label="Tarif Aktif"
                value={totalAktif}
                color="purple"
                subtext="Sedang digunakan"
              />
              <StatCard
                icon={<X size={22} />}
                label="Tarif Nonaktif"
                value={totalTarif - totalAktif}
                color="red"
                subtext="Tidak digunakan"
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
                  placeholder="Cari nama tarif atau keterangan..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10"
                />
              </div>

              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10"
              >
                <option value="semua">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>

              <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                <RefreshCw size={16} />
                Refresh
              </button>
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
                        Nama Tarif
                      </th>
                      <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Nominal
                      </th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Keterangan
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
                          colSpan={5}
                          className="px-4 py-12 text-center text-slate-400"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <FileText size={32} className="text-slate-300" />
                            <p className="text-sm font-medium">
                              Tidak ada tarif ditemukan
                            </p>
                            <p className="text-xs">
                              Coba ubah kata kunci pencarian atau filter
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
                          <td className="px-4 py-3.5 font-medium text-slate-800">
                            <div className="flex items-center gap-2">
                              <Receipt size={15} className="text-[#155DFC]" />
                              {item.nama}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right font-bold text-slate-800">
                            Rp {item.nominal.toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5 text-slate-600">
                            {item.keterangan}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <button
                              onClick={() => toggleStatus(item.id)}
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                                item.aktif
                                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                              }`}
                            >
                              {item.aktif ? (
                                <>
                                  <Check size={12} /> Aktif
                                </>
                              ) : (
                                <>
                                  <X size={12} /> Nonaktif
                                </>
                              )}
                            </button>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => openEditModal(item)}
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-[#155DFC]"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => confirmDelete(item.id)}
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                title="Hapus"
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
                    {filtered.length} tarif
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
              © 2026 SmartSchool • Setting Tarif Tagihan
            </footer>
          </div>
        </main>
      </div>

      {/* =========================================================
          MODAL TAMBAH / EDIT
      ========================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf1ff] text-[#155DFC]">
                  {modalMode === "tambah" ? <Plus size={20} /> : <Edit size={20} />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    {modalMode === "tambah" ? "Tambah Tarif" : "Edit Tarif"}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {modalMode === "tambah" ? "Buat tarif baru" : "Perbarui data tarif"}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Nama Tarif <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: SPP, Uang Pangkal"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Nominal <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nominal}
                  onChange={(e) => setFormData({ ...formData, nominal: e.target.value })}
                  placeholder="Contoh: 150000"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Keterangan
                </label>
                <input
                  type="text"
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  placeholder="Contoh: Bulanan, Sekali"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Status
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, aktif: true })}
                    className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                      formData.aktif
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Check size={16} /> Aktif
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, aktif: false })}
                    className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                      !formData.aktif
                        ? "border-slate-400 bg-slate-100 text-slate-600"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <X size={16} /> Nonaktif
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                className="rounded-xl bg-[#155DFC] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d47c9]"
              >
                <div className="flex items-center gap-2">
                  <Save size={16} />
                  {modalMode === "tambah" ? "Simpan" : "Perbarui"}
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL KONFIRMASI HAPUS
      ========================================================= */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                <AlertCircle size={32} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Hapus Tarif?</h3>
              <p className="mt-2 text-sm text-slate-500">
                Apakah Anda yakin ingin menghapus tarif ini? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  <div className="flex items-center gap-2">
                    <Trash2 size={16} />
                    Hapus
                  </div>
                </button>
              </div>
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
    purple: "bg-purple-50 text-purple-600",
    red: "bg-red-50 text-red-600",
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