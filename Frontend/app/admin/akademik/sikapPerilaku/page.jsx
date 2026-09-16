"use client";

import { useState, useMemo } from "react";
import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";
import { Search, Filter, ClipboardList, Plus, X } from "lucide-react";

/**
 * app/admin/akademik/sikapPerilaku/page.jsx
 *
 * Halaman Sikap & Perilaku — mencatat catatan sikap/perilaku siswa
 * (positif maupun negatif) dalam satu tabel, mengikuti gaya tampilan yang
 * sama dengan halaman Nilai/Prestasi/Rapor: header gradasi biru-indigo,
 * baris selang-seling, teks gelap, dan TANPA card/badge warna terpisah
 * untuk membedakan jenis positif/negatif — jenis cukup ditulis sebagai teks.
 *
 * CATATAN DATA:
 * MOCK_CATATAN masih dummy. Kalau nanti nyambung ke API, tinggal ganti
 * `useState(MOCK_CATATAN)` dengan hasil fetch — bentuk data per entri
 * dipertahankan sama supaya UI di bawah tidak perlu diubah.
 */

const JENIS_OPTIONS = ["Positif", "Negatif"];

const MOCK_CATATAN = [
  {
    id: 1,
    nama: "Alya Ramadhani",
    kelas: "X RPL 1",
    jenis: "Positif",
    catatan: "Membantu teman sekelas memahami materi pemrograman dasar",
    poin: 5,
    tanggal: "2026-08-12",
  },
  {
    id: 2,
    nama: "Cahyo Nugroho",
    kelas: "X RPL 1",
    jenis: "Negatif",
    catatan: "Terlambat masuk kelas tanpa keterangan",
    poin: -2,
    tanggal: "2026-08-14",
  },
  {
    id: 3,
    nama: "Dimas Prasetyo",
    kelas: "X RPL 2",
    jenis: "Positif",
    catatan: "Aktif bertanya dan berdiskusi selama pembelajaran",
    poin: 3,
    tanggal: "2026-08-15",
  },
  {
    id: 4,
    nama: "Eka Wulandari",
    kelas: "X TKJ 1",
    jenis: "Negatif",
    catatan: "Tidak mengumpulkan tugas praktikum tepat waktu",
    poin: -3,
    tanggal: "2026-08-18",
  },
  {
    id: 5,
    nama: "Gilang Ramadhan",
    kelas: "X TKJ 2",
    jenis: "Positif",
    catatan: "Menjadi ketua kelompok dan memimpin presentasi dengan baik",
    poin: 5,
    tanggal: "2026-08-19",
  },
  {
    id: 6,
    nama: "Hana Permatasari",
    kelas: "X TKJ 2",
    jenis: "Negatif",
    catatan: "Menggunakan ponsel saat jam pelajaran berlangsung",
    poin: -2,
    tanggal: "2026-08-20",
  },
  {
    id: 7,
    nama: "Indra Kusuma",
    kelas: "XII RPL 1",
    jenis: "Positif",
    catatan: "Mewakili sekolah dalam kegiatan LKS tingkat nasional",
    poin: 10,
    tanggal: "2026-08-21",
  },
  {
    id: 8,
    nama: "Krisna Aditya",
    kelas: "XII RPL 2",
    jenis: "Negatif",
    catatan: "Tidak memakai seragam sesuai ketentuan sekolah",
    poin: -1,
    tanggal: "2026-08-22",
  },
  {
    id: 9,
    nama: "Muhammad Fadli",
    kelas: "XII TKJ 1",
    jenis: "Positif",
    catatan: "Membantu petugas piket merapikan lab komputer",
    poin: 3,
    tanggal: "2026-08-24",
  },
  {
    id: 10,
    nama: "Oka Wijaya",
    kelas: "XI RPL 1",
    jenis: "Negatif",
    catatan: "Berbicara kasar kepada teman sekelas",
    poin: -4,
    tanggal: "2026-08-25",
  },
  {
    id: 11,
    nama: "Putri Ayuningtyas",
    kelas: "XI RPL 1",
    jenis: "Positif",
    catatan: "Meraih nilai tertinggi pada ujian tengah semester",
    poin: 5,
    tanggal: "2026-08-26",
  },
  {
    id: 12,
    nama: "Salsabila Putri",
    kelas: "XI TKJ 2",
    jenis: "Negatif",
    catatan: "Membuat gaduh saat kegiatan belajar mengajar",
    poin: -2,
    tanggal: "2026-08-27",
  },
];

const KELAS_OPTIONS = ["Semua Kelas", ...Array.from(new Set(MOCK_CATATAN.map((c) => c.kelas))).sort()];

const emptyForm = {
  nama: "",
  kelas: "",
  jenis: "Positif",
  catatan: "",
  poin: 0,
  tanggal: new Date().toISOString().slice(0, 10),
};

function formatTanggal(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
}

export default function SikapPerilakuPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [data, setData] = useState(MOCK_CATATAN);
  const [search, setSearch] = useState("");
  const [kelasFilter, setKelasFilter] = useState("Semua Kelas");
  const [jenisFilter, setJenisFilter] = useState("Semua Jenis");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const filteredData = useMemo(() => {
    return data
      .filter((c) => {
        const matchSearch =
          c.nama.toLowerCase().includes(search.toLowerCase()) ||
          c.catatan.toLowerCase().includes(search.toLowerCase());
        const matchKelas = kelasFilter === "Semua Kelas" || c.kelas === kelasFilter;
        const matchJenis = jenisFilter === "Semua Jenis" || c.jenis === jenisFilter;
        return matchSearch && matchKelas && matchJenis;
      })
      .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  }, [data, search, kelasFilter, jenisFilter]);

  const handleSimpan = () => {
    if (!form.nama || !form.catatan) return;
    setData((prev) => [{ id: Date.now(), ...form, poin: Number(form.poin) }, ...prev]);
    setForm(emptyForm);
    setShowForm(false);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      <Sidebar
        active="akademikSikapPerilaku"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{ name: "Admin Sekolah", email: "admin@smartschool.com", avatar: "AD" }}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200">
                  <ClipboardList size={20} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Sikap & Perilaku</h1>
                  <p className="text-sm text-slate-600">Catatan sikap dan perilaku siswa sehari-hari.</p>
                </div>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm shadow-blue-200 transition-colors self-start sm:self-auto"
              >
                <Plus size={16} />
                Tambah Catatan
              </button>
            </div>

            {/* FILTER BAR */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama siswa atau catatan..."
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-slate-800"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Filter size={15} className="text-slate-400 hidden lg:block" />
                <select
                  value={kelasFilter}
                  onChange={(e) => setKelasFilter(e.target.value)}
                  className="text-sm rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white text-slate-800 font-medium"
                >
                  {KELAS_OPTIONS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
                <select
                  value={jenisFilter}
                  onChange={(e) => setJenisFilter(e.target.value)}
                  className="text-sm rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white text-slate-800 font-medium"
                >
                  {["Semua Jenis", ...JENIS_OPTIONS].map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* TABEL SIKAP & PERILAKU */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">No.</th>
                      <th className="text-left font-semibold px-4 py-3 min-w-[180px]">Nama Siswa</th>
                      <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">Kelas</th>
                      <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">Jenis</th>
                      <th className="text-left font-semibold px-4 py-3 min-w-[260px]">Catatan</th>
                      <th className="text-center font-semibold px-4 py-3 whitespace-nowrap">Poin</th>
                      <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((c, idx) => (
                      <tr
                        key={c.id}
                        className={`border-b border-slate-100 last:border-0 transition-colors hover:bg-blue-100/60 ${
                          idx % 2 === 0 ? "bg-blue-50/60" : "bg-white"
                        }`}
                      >
                        <td className="px-4 py-2.5 text-slate-700 font-medium">{idx + 1}</td>
                        <td className="px-4 py-2.5">
                          <p className="font-semibold text-slate-900">{c.nama}</p>
                        </td>
                        <td className="px-4 py-2.5 text-slate-700 whitespace-nowrap">{c.kelas}</td>
                        <td className="px-4 py-2.5 text-slate-800 font-medium whitespace-nowrap">{c.jenis}</td>
                        <td className="px-4 py-2.5 text-slate-700">{c.catatan}</td>
                        <td className="px-4 py-2.5 text-center text-slate-900 font-semibold">
                          {c.poin > 0 ? `+${c.poin}` : c.poin}
                        </td>
                        <td className="px-4 py-2.5 text-slate-700 whitespace-nowrap">{formatTanggal(c.tanggal)}</td>
                      </tr>
                    ))}
                    {filteredData.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                          Tidak ada catatan yang cocok dengan filter ini.
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

      {/* MODAL TAMBAH CATATAN */}
      {showForm && (
        <>
          <div onClick={() => setShowForm(false)} className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100 sticky top-0 bg-white">
                <h2 className="text-sm font-semibold text-slate-900">Tambah Catatan Sikap & Perilaku</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Nama Siswa</label>
                  <input
                    type="text"
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    placeholder="Contoh: Alya Ramadhani"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Kelas</label>
                  <input
                    type="text"
                    value={form.kelas}
                    onChange={(e) => setForm({ ...form, kelas: e.target.value })}
                    placeholder="Contoh: X RPL 1 / XI TKJ 2"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Jenis</label>
                    <select
                      value={form.jenis}
                      onChange={(e) => setForm({ ...form, jenis: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white text-slate-800"
                    >
                      {JENIS_OPTIONS.map((j) => (
                        <option key={j} value={j}>
                          {j}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Poin</label>
                    <input
                      type="number"
                      value={form.poin}
                      onChange={(e) => setForm({ ...form, poin: e.target.value })}
                      placeholder="Contoh: 5 atau -3"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Catatan</label>
                  <textarea
                    value={form.catatan}
                    onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                    placeholder="Contoh: Aktif membantu teman sekelas"
                    rows={3}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-slate-800 resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Tanggal</label>
                  <input
                    type="date"
                    value={form.tanggal}
                    onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSimpan}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm shadow-blue-200"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}