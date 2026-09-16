"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import {
  Tags,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Building2,
  Package,
} from "lucide-react";

// Dummy data kategori. Ganti dengan data asli dari API kalau sudah ada.
const initialKategoriList = [
  { id: "kat-001", nama: "Furnitur", tipe: "Inventaris", jumlahItem: 3, deskripsi: "Kursi, meja, lemari, dan perabot lainnya." },
  { id: "kat-002", nama: "Elektronik", tipe: "Inventaris", jumlahItem: 3, deskripsi: "Proyektor, AC, sound system, dan alat elektronik lainnya." },
  { id: "kat-003", nama: "Alat Belajar", tipe: "Inventaris", jumlahItem: 1, deskripsi: "Papan tulis, alat peraga, dan perlengkapan belajar." },
  { id: "kat-004", nama: "Laboratorium", tipe: "Inventaris", jumlahItem: 1, deskripsi: "Mikroskop dan alat praktikum lainnya." },
  { id: "kat-005", nama: "Olahraga", tipe: "Fasilitas", jumlahItem: 1, deskripsi: "Lapangan dan fasilitas olahraga sekolah." },
  { id: "kat-006", nama: "Umum", tipe: "Fasilitas", jumlahItem: 2, deskripsi: "Aula, perpustakaan, dan fasilitas umum lainnya." },
  { id: "kat-007", nama: "Ibadah", tipe: "Fasilitas", jumlahItem: 1, deskripsi: "Musala dan tempat ibadah lainnya." },
];

const tipeOptions = ["Inventaris", "Fasilitas"];
const tipeStyle = {
  Inventaris: "text-blue-700 bg-blue-50 border-blue-200",
  Fasilitas: "text-indigo-700 bg-indigo-50 border-indigo-200",
};
const tipeIcon = {
  Inventaris: Package,
  Fasilitas: Building2,
};

const emptyForm = { nama: "", tipe: tipeOptions[0], deskripsi: "" };

export default function KategoriPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [kategoriList, setKategoriList] = useState(initialKategoriList);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const notifications = [
    { id: 1, title: "Kategori baru ditambahkan: Laboratorium", desc: "Dikirim kemarin", read: false },
  ];

  const filteredList = kategoriList.filter(
    (k) =>
      k.nama.toLowerCase().includes(search.toLowerCase()) ||
      k.tipe.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (kategori) => {
    setEditingId(kategori.id);
    setForm({ nama: kategori.nama, tipe: kategori.tipe, deskripsi: kategori.deskripsi });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: ganti dengan pemanggilan API asli (POST/PUT /api/kategori)
    if (editingId) {
      setKategoriList((prev) =>
        prev.map((k) => (k.id === editingId ? { ...k, ...form } : k))
      );
    } else {
      setKategoriList((prev) => [
        ...prev,
        { id: `kat-${Date.now()}`, jumlahItem: 0, ...form },
      ]);
    }
    closeModal();
  };

  const confirmDelete = () => {
    // TODO: ganti dengan pemanggilan API asli (DELETE /api/kategori/:id)
    setKategoriList((prev) => prev.filter((k) => k.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const isValid = form.nama.trim() !== "";

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        role="adminSarpras"
        active="kategori"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          notifications={notifications}
          user={{ name: "Admin Sarpras", email: "adminsarpras@smartschool.com", avatar: "SP" }}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="w-full space-y-6">

            {/* PAGE HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Sarana & Prasarana</p>
                <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 mt-1 tracking-tight">
                  Kategori
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Kelola kategori untuk fasilitas dan inventaris sekolah.
                </p>
              </div>
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm transition-colors flex-shrink-0"
              >
                <Plus size={16} />
                Tambah Kategori
              </button>
            </div>

            {/* SEARCH */}
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-4">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama atau tipe kategori..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors"
                />
              </div>
            </div>

            {/* TABLE KATEGORI */}
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between gap-2 px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 flex-shrink-0">
                    <Tags size={16} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-800 truncate">Daftar Kategori</h3>
                    <p className="text-xs text-slate-400">{filteredList.length} kategori ditemukan</p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                      <th className="px-5 py-3 font-medium">Nama Kategori</th>
                      <th className="px-5 py-3 font-medium">Tipe</th>
                      <th className="px-5 py-3 font-medium">Deskripsi</th>
                      <th className="px-5 py-3 font-medium">Jumlah Item</th>
                      <th className="px-5 py-3 font-medium w-20"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredList.map((k) => {
                      const TipeIcon = tipeIcon[k.tipe];
                      return (
                        <tr key={k.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
                                <TipeIcon size={16} />
                              </div>
                              <span className="font-medium text-slate-800">{k.nama}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${tipeStyle[k.tipe]}`}>
                              {k.tipe}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 max-w-xs truncate">{k.deskripsi || "-"}</td>
                          <td className="px-5 py-3.5 text-slate-600">{k.jumlahItem} item</td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5 justify-end">
                              <button
                                onClick={() => openEditModal(k)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
                                title="Edit"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(k)}
                                className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"
                                title="Hapus"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredList.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-sm text-slate-400">
                          Tidak ada kategori yang cocok dengan pencarian.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* MODAL TAMBAH / EDIT KATEGORI */}
      {modalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            onClick={closeModal}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800">
                {editingId ? "Edit Kategori" : "Tambah Kategori"}
              </h3>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">
                    Nama Kategori <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.nama}
                    onChange={(e) => handleChange("nama", e.target.value)}
                    placeholder="Contoh: Furnitur"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Tipe</label>
                  <select
                    value={form.tipe}
                    onChange={(e) => handleChange("tipe", e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors appearance-none"
                  >
                    {tipeOptions.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Deskripsi (opsional)</label>
                  <textarea
                    value={form.deskripsi}
                    onChange={(e) => handleChange("deskripsi", e.target.value)}
                    placeholder="Deskripsi singkat kategori ini..."
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50/50">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!isValid}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium shadow-sm transition-colors"
                >
                  <Save size={16} />
                  {editingId ? "Simpan Perubahan" : "Simpan Kategori"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            onClick={() => setDeleteTarget(null)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-5">
              <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
                <Trash2 size={20} />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">Hapus Kategori?</h3>
              <p className="text-sm text-slate-500 mt-1.5">
                Kategori <span className="font-medium text-slate-700">"{deleteTarget.nama}"</span> akan dihapus secara permanen dan tidak bisa dikembalikan.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium shadow-sm transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}