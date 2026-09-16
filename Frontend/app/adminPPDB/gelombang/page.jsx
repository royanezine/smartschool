"use client";

import { useState } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  Calendar,
  X,
  Search,
} from "lucide-react";


const initialGelombang = [
  {
    id: 1,
    nama: "Gelombang 1",
    mulai: "2026-01-05",
    selesai: "2026-02-15",
    kuota: 500,
    terisi: 412,
    biaya: 150000,
    status: "Selesai",
  },
  {
    id: 2,
    nama: "Gelombang 2",
    mulai: "2026-03-01",
    selesai: "2026-04-10",
    kuota: 400,
    terisi: 286,
    biaya: 175000,
    status: "Aktif",
  },
  {
    id: 3,
    nama: "Gelombang 3",
    mulai: "2026-05-01",
    selesai: "2026-06-15",
    kuota: 300,
    terisi: 0,
    biaya: 200000,
    status: "Akan Datang",
  },
];

const STATUS_STYLES = {
  Aktif: "bg-emerald-50 text-emerald-600 border-emerald-100",
  "Akan Datang": "bg-amber-50 text-amber-600 border-amber-100",
  Selesai: "bg-slate-100 text-slate-500 border-slate-200",
};

const STATUS_FILTERS = ["Semua", "Aktif", "Akan Datang", "Selesai"];

function formatTanggal(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatRupiah(n) {
  return n.toLocaleString("id-ID");
}

function emptyForm() {
  return {
    id: null,
    nama: "",
    mulai: "",
    selesai: "",
    kuota: "",
    biaya: "",
    status: "Akan Datang",
  };
}

export default function GelombangPPDBPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [gelombangList, setGelombangList] = useState(initialGelombang);
  const [activeStatus, setActiveStatus] = useState("Semua");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [deleteTarget, setDeleteTarget] = useState(null);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const filtered = gelombangList.filter((g) => {
    const matchStatus = activeStatus === "Semua" || g.status === activeStatus;
    const matchSearch = g.nama.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalKuota = gelombangList.reduce((a, g) => a + g.kuota, 0);
  const totalTerisi = gelombangList.reduce((a, g) => a + g.terisi, 0);
  const aktifCount = gelombangList.filter((g) => g.status === "Aktif").length;

  const openTambah = () => {
    setForm(emptyForm());
    setShowModal(true);
  };

  const openEdit = (g) => {
    setForm({
      id: g.id,
      nama: g.nama,
      mulai: g.mulai,
      selesai: g.selesai,
      kuota: g.kuota,
      biaya: g.biaya,
      status: g.status,
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nama || !form.mulai || !form.selesai || !form.kuota) return;

    if (form.id) {
      setGelombangList((prev) =>
        prev.map((g) =>
          g.id === form.id
            ? {
                ...g,
                nama: form.nama,
                mulai: form.mulai,
                selesai: form.selesai,
                kuota: Number(form.kuota),
                biaya: Number(form.biaya) || 0,
                status: form.status,
              }
            : g
        )
      );
    } else {
      setGelombangList((prev) => [
        ...prev,
        {
          id: Date.now(),
          nama: form.nama,
          mulai: form.mulai,
          selesai: form.selesai,
          kuota: Number(form.kuota),
          terisi: 0,
          biaya: Number(form.biaya) || 0,
          status: form.status,
        },
      ]);
    }
    setShowModal(false);
  };

  const confirmDelete = () => {
    setGelombangList((prev) => prev.filter((g) => g.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="flex h-screen w-full bg-[#EEF0F2] overflow-hidden">
      <Sidebar
        role="adminPPDB"
        active="gelombang"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{ name: "Admin PPDB", email: "adminppdb@smartschool.com", avatar: "PP" }}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="w-full p-4 md:p-6 lg:p-8">
            <div className="w-full space-y-5 max-w-[1320px] mx-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>PPDB</span>
                <ChevronRight size={12} />
                <span className="text-slate-600 font-medium">Gelombang</span>
              </div>

              {/* ===== KARTU RINGKASAN ===== */}
              <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5">
                  <p className="text-xs text-slate-400">Total Gelombang</p>
                  <p className="text-2xl font-bold text-slate-800 mt-2">
                    {gelombangList.length}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-5">
                  <p className="text-xs text-slate-400">Gelombang Aktif</p>
                  <p className="text-2xl font-bold text-emerald-500 mt-2">
                    {aktifCount}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-5">
                  <p className="text-xs text-slate-400">Total Kuota</p>
                  <p className="text-2xl font-bold text-slate-800 mt-2">
                    {formatRupiah(totalKuota)}
                  </p>
                </div>
                <div className="bg-[#F6F7F8] rounded-xl p-5 flex flex-col items-center justify-center text-center">
                  <p className="text-xs text-slate-400">Kuota Terisi</p>
                  <p className="text-3xl font-bold text-slate-500 mt-3">
                    {totalKuota > 0 ? Math.round((totalTerisi / totalKuota) * 100) : 0}%
                  </p>
                </div>
              </section>

              {/* ===== PANEL UTAMA ===== */}
              <section className="bg-white rounded-xl overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-5">
                    {STATUS_FILTERS.map((f) => (
                      <button
                        key={f}
                        onClick={() => setActiveStatus(f)}
                        className={`relative pb-2.5 text-sm font-medium transition-colors ${
                          activeStatus === f
                            ? "text-blue-600"
                            : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        {f}
                        {activeStatus === f && (
                          <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-blue-600 rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500 border border-slate-200 rounded-md px-3 py-1.5">
                      <Search size={13} className="text-slate-400" />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari gelombang..."
                        className="outline-none bg-transparent placeholder:text-slate-400 w-32"
                      />
                    </div>
                    <button
                      onClick={openTambah}
                      className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3.5 py-2 rounded-md transition-colors"
                    >
                      <Plus size={14} />
                      Tambah Gelombang
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                        <th className="px-5 py-3 font-medium">Nama Gelombang</th>
                        <th className="px-5 py-3 font-medium">Periode</th>
                        <th className="px-5 py-3 font-medium">Biaya Formulir</th>
                        <th className="px-5 py-3 font-medium">Kuota</th>
                        <th className="px-5 py-3 font-medium">Terisi</th>
                        <th className="px-5 py-3 font-medium">Status</th>
                        <th className="px-5 py-3 font-medium text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-sm">
                            Tidak ada gelombang ditemukan.
                          </td>
                        </tr>
                      )}
                      {filtered.map((g) => {
                        const persen = g.kuota > 0 ? Math.min(100, Math.round((g.terisi / g.kuota) * 100)) : 0;
                        return (
                          <tr key={g.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                            <td className="px-5 py-4 font-medium text-slate-700">{g.nama}</td>
                            <td className="px-5 py-4 text-slate-500">
                              <div className="flex items-center gap-1.5">
                                <Calendar size={12} className="text-slate-300" />
                                {formatTanggal(g.mulai)} - {formatTanggal(g.selesai)}
                              </div>
                            </td>
                            <td className="px-5 py-4 text-slate-500">Rp {formatRupiah(g.biaya)}</td>
                            <td className="px-5 py-4 text-slate-700 font-mono tabular-nums">{g.kuota}</td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{ width: `${persen}%` }}
                                  />
                                </div>
                                <span className="text-xs text-slate-500 font-mono">{persen}%</span>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${STATUS_STYLES[g.status]}`}
                              >
                                {g.status}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => openEdit(g)}
                                  className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={() => setDeleteTarget(g)}
                                  className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              <footer className="text-center text-[11px] text-slate-400 py-3">
                © 2026 SmartSchool &middot; Dashboard Admin PPDB &middot; All rights reserved
              </footer>
            </div>
          </div>
        </main>
      </div>

      {/* ===== MODAL TAMBAH/EDIT ===== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-slate-800">
                {form.id ? "Edit Gelombang" : "Tambah Gelombang"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Nama Gelombang</label>
                <input
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  placeholder="Contoh: Gelombang 4"
                  className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 outline-none focus:border-blue-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={form.mulai}
                    onChange={(e) => setForm({ ...form, mulai: e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 outline-none focus:border-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={form.selesai}
                    onChange={(e) => setForm({ ...form, selesai: e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 outline-none focus:border-blue-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Kuota</label>
                  <input
                    type="number"
                    min="0"
                    value={form.kuota}
                    onChange={(e) => setForm({ ...form, kuota: e.target.value })}
                    placeholder="500"
                    className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 outline-none focus:border-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Biaya Formulir (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.biaya}
                    onChange={(e) => setForm({ ...form, biaya: e.target.value })}
                    placeholder="150000"
                    className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 mb-1 block">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 outline-none focus:border-blue-400 bg-white"
                >
                  <option value="Akan Datang">Akan Datang</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-xs font-medium text-slate-500 hover:text-slate-700 px-4 py-2"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  {form.id ? "Simpan Perubahan" : "Tambah Gelombang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL KONFIRMASI HAPUS ===== */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <h3 className="text-sm font-semibold text-slate-800 mb-2">Hapus Gelombang?</h3>
            <p className="text-xs text-slate-500 mb-5">
              Gelombang <span className="font-medium text-slate-700">{deleteTarget.nama}</span> akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="text-xs font-medium text-slate-500 hover:text-slate-700 px-4 py-2"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-md transition-colors"
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