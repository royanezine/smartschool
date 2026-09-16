"use client";

import { useState, useMemo } from "react";
import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";
import { Search, Filter, Award, Trophy, Plus, X } from "lucide-react";

/**
 * app/admin/akademik/prestasi/page.jsx
 *
 * Halaman Prestasi — mencatat pencapaian siswa dalam perlombaan, lengkap
 * dengan tingkat lomba (Kabupaten/Kota, Provinsi, Nasional, Internasional),
 * juara/peringkat yang diraih, dan bulan-tahun perolehannya.
 *
 * Kelas memakai nama jurusan SMK (RPL, TKJ) supaya konsisten dengan
 * halaman Nilai. Warna teks tabel & label digelapin (slate-700/800/900)
 * supaya lebih kontras dan tidak "pucat".
 *
 * CATATAN DATA:
 * MOCK_PRESTASI di bawah masih dummy. Kalau backend/API sudah siap, tinggal
 * ganti `useState(MOCK_PRESTASI)` dengan fetch ke endpoint yang sesuai —
 * bentuk data per entri dipertahankan sama supaya UI di bawah tidak perlu
 * diubah. Form tambah prestasi (modal) sudah disiapkan strukturnya, tinggal
 * disambungkan ke endpoint POST saat backend tersedia (lihat `handleSimpan`).
 */

const TINGKAT_OPTIONS = ["Kabupaten/Kota", "Provinsi", "Nasional", "Internasional"];
const BULAN_OPTIONS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const MOCK_PRESTASI = [
  {
    id: 1,
    namaSiswa: "Alya Ramadhani",
    kelas: "X RPL 1",
    namaLomba: "Lomba Kompetensi Siswa (LKS) - Web Technology",
    tingkat: "Kabupaten/Kota",
    juara: "Juara 1",
    bulan: "Mei",
    tahun: 2026,
    penyelenggara: "Dinas Pendidikan Kab. Bandung",
  },
  {
    id: 2,
    namaSiswa: "Bunga Citra Lestari",
    kelas: "X RPL 1",
    namaLomba: "LKS Web Technology",
    tingkat: "Provinsi",
    juara: "Juara 1",
    bulan: "Juli",
    tahun: 2026,
    penyelenggara: "Dinas Pendidikan Provinsi Jawa Barat",
  },
  {
    id: 3,
    namaSiswa: "Cahyo Nugroho",
    kelas: "X RPL 1",
    namaLomba: "Lomba Debat Bahasa Inggris",
    tingkat: "Nasional",
    juara: "Juara 1",
    bulan: "Juni",
    tahun: 2026,
    penyelenggara: "Kemendikbudristek",
  },
  {
    id: 4,
    namaSiswa: "Dimas Prasetyo",
    kelas: "X RPL 2",
    namaLomba: "Lomba Futsal Antar Kelas",
    tingkat: "Kabupaten/Kota",
    juara: "Juara 3",
    bulan: "Juni",
    tahun: 2026,
    penyelenggara: "Panitia Porseni Kab. Bandung",
  },
  {
    id: 5,
    namaSiswa: "Eka Wulandari",
    kelas: "X TKJ 1",
    namaLomba: "LKS Network Support Administration",
    tingkat: "Provinsi",
    juara: "Juara 2",
    bulan: "Mei",
    tahun: 2026,
    penyelenggara: "Dinas Pendidikan Provinsi Jawa Barat",
  },
  {
    id: 6,
    namaSiswa: "Fajar Setiawan",
    kelas: "X TKJ 1",
    namaLomba: "Festival Paduan Suara Sekolah",
    tingkat: "Kabupaten/Kota",
    juara: "Juara 1",
    bulan: "Februari",
    tahun: 2026,
    penyelenggara: "Dinas Pendidikan Kab. Bandung",
  },
  {
    id: 7,
    namaSiswa: "Gilang Ramadhan",
    kelas: "X TKJ 2",
    namaLomba: "Lomba Cerdas Cermat Antar Sekolah",
    tingkat: "Kabupaten/Kota",
    juara: "Juara 2",
    bulan: "Maret",
    tahun: 2026,
    penyelenggara: "MGMP Kab. Bandung",
  },
  {
    id: 8,
    namaSiswa: "Hana Permatasari",
    kelas: "X TKJ 2",
    namaLomba: "Lomba Fotografi Digital",
    tingkat: "Kabupaten/Kota",
    juara: "Juara 3",
    bulan: "April",
    tahun: 2026,
    penyelenggara: "Dinas Pendidikan Kab. Bandung",
  },
  {
    id: 9,
    namaSiswa: "Indra Kusuma",
    kelas: "XII RPL 1",
    namaLomba: "Lomba Kompetensi Siswa (LKS) - IT Software Solutions",
    tingkat: "Nasional",
    juara: "Juara 2",
    bulan: "Agustus",
    tahun: 2026,
    penyelenggara: "Kemendikbudristek",
  },
  {
    id: 10,
    namaSiswa: "Julia Anggraeni",
    kelas: "XII RPL 1",
    namaLomba: "Hackathon Mahasiswa & Pelajar",
    tingkat: "Internasional",
    juara: "Juara 1",
    bulan: "September",
    tahun: 2026,
    penyelenggara: "ASEAN Digital Youth Summit",
  },
  {
    id: 11,
    namaSiswa: "Krisna Aditya",
    kelas: "XII RPL 2",
    namaLomba: "Lomba Karya Tulis Ilmiah Remaja",
    tingkat: "Provinsi",
    juara: "Harapan 1",
    bulan: "Mei",
    tahun: 2026,
    penyelenggara: "Dinas Pendidikan Provinsi Jawa Barat",
  },
  {
    id: 12,
    namaSiswa: "Larasati Dewi",
    kelas: "XII RPL 2",
    namaLomba: "Olimpiade Sains Terapan (OST) - Informatika",
    tingkat: "Nasional",
    juara: "Juara 1",
    bulan: "Juli",
    tahun: 2026,
    penyelenggara: "Kemendikbudristek",
  },
  {
    id: 13,
    namaSiswa: "Muhammad Fadli",
    kelas: "XII TKJ 1",
    namaLomba: "LKS Network Support Administration",
    tingkat: "Nasional",
    juara: "Juara 3",
    bulan: "Agustus",
    tahun: 2026,
    penyelenggara: "Kemendikbudristek",
  },
  {
    id: 14,
    namaSiswa: "Naila Zahra",
    kelas: "XII TKJ 1",
    namaLomba: "Lomba Cipta Puisi Pelajar",
    tingkat: "Kabupaten/Kota",
    juara: "Juara 2",
    bulan: "Maret",
    tahun: 2026,
    penyelenggara: "Dinas Pendidikan Kab. Bandung",
  },
  {
    id: 15,
    namaSiswa: "Oka Wijaya",
    kelas: "XI RPL 1",
    namaLomba: "Lomba Desain UI/UX Aplikasi Sekolah",
    tingkat: "Provinsi",
    juara: "Juara 3",
    bulan: "Juni",
    tahun: 2026,
    penyelenggara: "Dinas Pendidikan Provinsi Jawa Barat",
  },
  {
    id: 16,
    namaSiswa: "Putri Ayuningtyas",
    kelas: "XI RPL 1",
    namaLomba: "LKS Web Technology",
    tingkat: "Kabupaten/Kota",
    juara: "Juara 1",
    bulan: "April",
    tahun: 2026,
    penyelenggara: "Dinas Pendidikan Kab. Bandung",
  },
  {
    id: 17,
    namaSiswa: "Reza Firmansyah",
    kelas: "XI TKJ 1",
    namaLomba: "Lomba Cabling & Jaringan Komputer",
    tingkat: "Kabupaten/Kota",
    juara: "Juara 2",
    bulan: "Mei",
    tahun: 2026,
    penyelenggara: "Dinas Pendidikan Kab. Bandung",
  },
  {
    id: 18,
    namaSiswa: "Salsabila Putri",
    kelas: "XI TKJ 2",
    namaLomba: "Lomba Robotika Sekolah",
    tingkat: "Provinsi",
    juara: "Juara 1",
    bulan: "Februari",
    tahun: 2026,
    penyelenggara: "Dinas Pendidikan Provinsi Jawa Barat",
  },
];

const KELAS_OPTIONS = ["Semua Kelas", ...Array.from(new Set(MOCK_PRESTASI.map((p) => p.kelas))).sort()];
const TAHUN_OPTIONS = ["Semua Tahun", ...Array.from(new Set(MOCK_PRESTASI.map((p) => p.tahun))).sort((a, b) => b - a)];

const emptyForm = {
  namaSiswa: "",
  kelas: "",
  namaLomba: "",
  tingkat: "Kabupaten/Kota",
  juara: "Juara 1",
  bulan: "Januari",
  tahun: new Date().getFullYear(),
  penyelenggara: "",
};

export default function PrestasiPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [data, setData] = useState(MOCK_PRESTASI);
  const [search, setSearch] = useState("");
  const [kelasFilter, setKelasFilter] = useState("Semua Kelas");
  const [tingkatFilter, setTingkatFilter] = useState("Semua Tingkat");
  const [tahunFilter, setTahunFilter] = useState("Semua Tahun");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const filteredData = useMemo(() => {
    return data
      .filter((p) => {
        const matchSearch =
          p.namaSiswa.toLowerCase().includes(search.toLowerCase()) ||
          p.namaLomba.toLowerCase().includes(search.toLowerCase());
        const matchKelas = kelasFilter === "Semua Kelas" || p.kelas === kelasFilter;
        const matchTingkat = tingkatFilter === "Semua Tingkat" || p.tingkat === tingkatFilter;
        const matchTahun = tahunFilter === "Semua Tahun" || p.tahun === tahunFilter;
        return matchSearch && matchKelas && matchTingkat && matchTahun;
      })
      .sort((a, b) => b.tahun - a.tahun || BULAN_OPTIONS.indexOf(b.bulan) - BULAN_OPTIONS.indexOf(a.bulan));
  }, [data, search, kelasFilter, tingkatFilter, tahunFilter]);

  // ===== Statistik ringkas =====
  const totalPrestasi = data.length;
  const totalJuara1 = data.filter((p) => p.juara === "Juara 1").length;
  const siswaBerprestasi = new Set(data.map((p) => p.namaSiswa)).size;

  const handleSimpan = () => {
    if (!form.namaSiswa || !form.namaLomba) return;
    // TODO: ganti dengan POST ke API saat backend tersedia.
    setData((prev) => [{ id: Date.now(), ...form, tahun: Number(form.tahun) }, ...prev]);
    setForm(emptyForm);
    setShowForm(false);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      <Sidebar
        active="akademikPrestasi"
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
                  <Trophy size={20} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Prestasi</h1>
                  <p className="text-sm text-slate-600">Catatan prestasi siswa dari berbagai tingkat perlombaan.</p>
                </div>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm shadow-blue-200 transition-colors self-start sm:self-auto"
              >
                <Plus size={16} />
                Tambah Prestasi
              </button>
            </div>

            {/* STATISTIK RINGKAS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                    <Award size={16} />
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 tracking-wide">Total Prestasi</p>
                </div>
                <p className="text-2xl font-bold text-slate-900 mt-1.5">{totalPrestasi}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                    <Trophy size={16} />
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 tracking-wide">Juara 1</p>
                </div>
                <p className="text-2xl font-bold text-slate-900 mt-1.5">{totalJuara1}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                    <Award size={16} />
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 tracking-wide">Siswa Berprestasi</p>
                </div>
                <p className="text-2xl font-bold text-slate-900 mt-1.5">{siswaBerprestasi}</p>
              </div>
            </div>

            {/* FILTER BAR */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama siswa atau nama lomba..."
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
                  value={tingkatFilter}
                  onChange={(e) => setTingkatFilter(e.target.value)}
                  className="text-sm rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white text-slate-800 font-medium"
                >
                  {["Semua Tingkat", ...TINGKAT_OPTIONS].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <select
                  value={tahunFilter}
                  onChange={(e) => setTahunFilter(e.target.value === "Semua Tahun" ? "Semua Tahun" : Number(e.target.value))}
                  className="text-sm rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white text-slate-800 font-medium"
                >
                  {TAHUN_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* TABEL PRESTASI */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      <th className="text-left font-semibold px-4 py-3">Siswa</th>
                      <th className="text-left font-semibold px-4 py-3">Nama Lomba</th>
                      <th className="text-left font-semibold px-4 py-3">Tingkat</th>
                      <th className="text-left font-semibold px-4 py-3">Juara</th>
                      <th className="text-left font-semibold px-4 py-3">Bulan / Tahun</th>
                      <th className="text-left font-semibold px-4 py-3">Penyelenggara</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((p, idx) => (
                      <tr
                        key={p.id}
                        className={`border-b border-slate-100 last:border-0 transition-colors hover:bg-blue-100/60 ${
                          idx % 2 === 0 ? "bg-blue-50/60" : "bg-white"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-900">{p.namaSiswa}</p>
                          <p className="text-xs text-slate-600">{p.kelas}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-800 font-medium max-w-[240px]">{p.namaLomba}</td>
                        <td className="px-4 py-3 text-slate-800 font-medium whitespace-nowrap">{p.tingkat}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                            <Trophy size={13} className="text-amber-500" />
                            {p.juara}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-800 font-medium whitespace-nowrap">
                          {p.bulan} {p.tahun}
                        </td>
                        <td className="px-4 py-3 text-slate-700 text-xs max-w-[200px]">{p.penyelenggara}</td>
                      </tr>
                    ))}
                    {filteredData.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                          Tidak ada data prestasi yang cocok dengan filter ini.
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

      {/* MODAL TAMBAH PRESTASI */}
      {showForm && (
        <>
          <div onClick={() => setShowForm(false)} className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-5 h-16 border-b border-slate-100 sticky top-0 bg-white">
                <h2 className="text-sm font-semibold text-slate-900">Tambah Prestasi</h2>
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
                    value={form.namaSiswa}
                    onChange={(e) => setForm({ ...form, namaSiswa: e.target.value })}
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
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Nama Lomba</label>
                  <input
                    type="text"
                    value={form.namaLomba}
                    onChange={(e) => setForm({ ...form, namaLomba: e.target.value })}
                    placeholder="Contoh: LKS Web Technology"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Tingkat</label>
                    <select
                      value={form.tingkat}
                      onChange={(e) => setForm({ ...form, tingkat: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white text-slate-800"
                    >
                      {TINGKAT_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Juara</label>
                    <select
                      value={form.juara}
                      onChange={(e) => setForm({ ...form, juara: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white text-slate-800"
                    >
                      {["Juara 1", "Juara 2", "Juara 3", "Harapan 1", "Harapan 2", "Peserta Terbaik"].map((j) => (
                        <option key={j} value={j}>
                          {j}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Bulan</label>
                    <select
                      value={form.bulan}
                      onChange={(e) => setForm({ ...form, bulan: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white text-slate-800"
                    >
                      {BULAN_OPTIONS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Tahun</label>
                    <input
                      type="number"
                      value={form.tahun}
                      onChange={(e) => setForm({ ...form, tahun: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Penyelenggara</label>
                  <input
                    type="text"
                    value={form.penyelenggara}
                    onChange={(e) => setForm({ ...form, penyelenggara: e.target.value })}
                    placeholder="Contoh: Dinas Pendidikan Kab. Bandung"
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