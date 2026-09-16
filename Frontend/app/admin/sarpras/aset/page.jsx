"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";
import {
  Boxes,
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter,
} from "lucide-react";

// =========================================================
// HELPERS
// =========================================================
const STORAGE_KEY = "sarpras_aset_data";

const getDefaultAset = () => [
  // ===== KATEGORI: ELEKTRONIK =====
  {
    id: 1,
    nama: "Proyektor Epson EB-X500",
    kategori: "Elektronik",
    kode_aset: "SPR-ELK-001",
    lokasi: "R. 101",
    jumlah: 1,
    kondisi: "baik",
    penanggung_jawab: "Budi Santoso, S.Si.",
    tanggal_pengadaan: "2024-07-12",
    status: "tersedia",
  },
  {
    id: 2,
    nama: "AC Split Daikin 1 PK",
    kategori: "Elektronik",
    kode_aset: "SPR-ELK-002",
    lokasi: "R. 102",
    jumlah: 2,
    kondisi: "baik",
    penanggung_jawab: "Siti Rahma, S.Pd.",
    tanggal_pengadaan: "2023-03-05",
    status: "tersedia",
  },
  {
    id: 3,
    nama: "Komputer PC Rakitan i5",
    kategori: "Elektronik",
    kode_aset: "SPR-ELK-003",
    lokasi: "Lab. Komputer 1",
    jumlah: 30,
    kondisi: "rusak_ringan",
    penanggung_jawab: "Eko Prasetyo, S.Pd.",
    tanggal_pengadaan: "2022-01-18",
    status: "dipinjam",
  },
  {
    id: 4,
    nama: "Printer Canon MP287",
    kategori: "Elektronik",
    kode_aset: "SPR-ELK-004",
    lokasi: "R. Tata Usaha",
    jumlah: 3,
    kondisi: "rusak_berat",
    penanggung_jawab: "Maya Sari, S.Pd.",
    tanggal_pengadaan: "2021-09-09",
    status: "perbaikan",
  },

  // ===== KATEGORI: FURNITURE =====
  {
    id: 5,
    nama: "Meja Siswa Kayu",
    kategori: "Furniture",
    kode_aset: "SPR-FUR-001",
    lokasi: "R. 103",
    jumlah: 32,
    kondisi: "baik",
    penanggung_jawab: "Dewi Lestari, S.Pd.",
    tanggal_pengadaan: "2023-06-20",
    status: "tersedia",
  },
  {
    id: 6,
    nama: "Kursi Siswa Plastik",
    kategori: "Furniture",
    kode_aset: "SPR-FUR-002",
    lokasi: "R. 104",
    jumlah: 32,
    kondisi: "baik",
    penanggung_jawab: "Agus Setiawan, S.Pd.",
    tanggal_pengadaan: "2023-06-20",
    status: "tersedia",
  },
  {
    id: 7,
    nama: "Lemari Arsip Besi",
    kategori: "Furniture",
    kode_aset: "SPR-FUR-003",
    lokasi: "R. Perpustakaan",
    jumlah: 5,
    kondisi: "rusak_ringan",
    penanggung_jawab: "Rina Sari, S.Pd.",
    tanggal_pengadaan: "2020-11-02",
    status: "tersedia",
  },

  // ===== KATEGORI: ALAT PRAKTIK =====
  {
    id: 8,
    nama: "Router Cisco 2911",
    kategori: "Alat Praktik",
    kode_aset: "SPR-PRK-001",
    lokasi: "Lab. TKJ",
    jumlah: 10,
    kondisi: "baik",
    penanggung_jawab: "Hendra Gunawan, S.Pd.",
    tanggal_pengadaan: "2024-02-14",
    status: "tersedia",
  },
  {
    id: 9,
    nama: "Mesin Jahit Portable",
    kategori: "Alat Praktik",
    kode_aset: "SPR-PRK-002",
    lokasi: "R. Praktik Tata Busana",
    jumlah: 15,
    kondisi: "rusak_ringan",
    penanggung_jawab: "Sri Wahyuni, S.Pd.",
    tanggal_pengadaan: "2022-08-30",
    status: "tersedia",
  },
  {
    id: 10,
    nama: "Kalkulator Akuntansi",
    kategori: "Alat Praktik",
    kode_aset: "SPR-PRK-003",
    lokasi: "R. 105",
    jumlah: 25,
    kondisi: "baik",
    penanggung_jawab: "Eko Prasetyo, S.Pd.",
    tanggal_pengadaan: "2024-01-10",
    status: "dipinjam",
  },

  // ===== KATEGORI: BANGUNAN & FASILITAS =====
  {
    id: 11,
    nama: "Lapangan Basket",
    kategori: "Bangunan",
    kode_aset: "SPR-BGN-001",
    lokasi: "Area Olahraga",
    jumlah: 1,
    kondisi: "baik",
    penanggung_jawab: "Agus Setiawan, S.Pd.",
    tanggal_pengadaan: "2019-05-01",
    status: "tersedia",
  },
  {
    id: 12,
    nama: "Toilet Siswa Lantai 2",
    kategori: "Bangunan",
    kode_aset: "SPR-BGN-002",
    lokasi: "Lantai 2",
    jumlah: 4,
    kondisi: "rusak_berat",
    penanggung_jawab: "Hendra Gunawan, S.Pd.",
    tanggal_pengadaan: "2018-03-15",
    status: "perbaikan",
  },
  {
    id: 13,
    nama: "Musala Sekolah",
    kategori: "Bangunan",
    kode_aset: "SPR-BGN-003",
    lokasi: "Gedung Utama",
    jumlah: 1,
    kondisi: "baik",
    penanggung_jawab: "Dr. Ahmad Fauzi, M.Pd.",
    tanggal_pengadaan: "2017-08-17",
    status: "tersedia",
  },

  // ===== KATEGORI: KENDARAAN =====
  {
    id: 14,
    nama: "Bus Sekolah Isuzu Elf",
    kategori: "Kendaraan",
    kode_aset: "SPR-KND-001",
    lokasi: "Garasi Sekolah",
    jumlah: 2,
    kondisi: "baik",
    penanggung_jawab: "Dr. Ahmad Fauzi, M.Pd.",
    tanggal_pengadaan: "2021-04-22",
    status: "tersedia",
  },
  {
    id: 15,
    nama: "Motor Dinas Operasional",
    kategori: "Kendaraan",
    kode_aset: "SPR-KND-002",
    lokasi: "Garasi Sekolah",
    jumlah: 3,
    kondisi: "rusak_ringan",
    penanggung_jawab: "Budi Santoso, S.Si.",
    tanggal_pengadaan: "2020-10-11",
    status: "dipinjam",
  },
];

const loadAset = () => {
  if (typeof window === "undefined") return getDefaultAset();
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getDefaultAset()));
    return getDefaultAset();
  }
  return JSON.parse(stored);
};

const saveAset = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const kondisiConfig = {
  baik: {
    label: "Baik",
    icon: CheckCircle,
    textClassName: "text-emerald-600",
  },
  rusak_ringan: {
    label: "Rusak Ringan",
    icon: AlertTriangle,
    textClassName: "text-amber-600",
  },
  rusak_berat: {
    label: "Rusak Berat",
    icon: XCircle,
    textClassName: "text-rose-600",
  },
};

const statusConfig = {
  tersedia: { label: "Tersedia", textClassName: "text-blue-600" },
  dipinjam: { label: "Dipinjam", textClassName: "text-purple-600" },
  perbaikan: { label: "Perbaikan", textClassName: "text-slate-500" },
};

const kategoriKeys = ["Elektronik", "Furniture", "Alat Praktik", "Bangunan", "Kendaraan"];

// =========================================================
// MAIN COMPONENT
// =========================================================
export default function AdminSarprasAsetPage() {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [aset, setAset] = useState([]);
  const [search, setSearch] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("Semua");
  const [kondisiFilter, setKondisiFilter] = useState("Semua");

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  useEffect(() => {
    setAset(loadAset());
  }, []);

  const handleDelete = (id, nama) => {
    if (!window.confirm(`Yakin ingin menghapus aset "${nama}"?`)) return;
    const updated = aset.filter((item) => item.id !== id);
    setAset(updated);
    saveAset(updated);
    alert(`Aset "${nama}" berhasil dihapus!`);
  };

  const filtered = useMemo(() => {
    return aset
      .filter((item) => {
        const matchSearch =
          item.nama.toLowerCase().includes(search.toLowerCase()) ||
          item.kode_aset.toLowerCase().includes(search.toLowerCase()) ||
          item.lokasi.toLowerCase().includes(search.toLowerCase());
        const matchKategori = kategoriFilter === "Semua" || item.kategori === kategoriFilter;
        const matchKondisi = kondisiFilter === "Semua" || item.kondisi === kondisiFilter;
        return matchSearch && matchKategori && matchKondisi;
      })
      .sort((a, b) => a.kategori.localeCompare(b.kategori) || a.nama.localeCompare(b.nama));
  }, [aset, search, kategoriFilter, kondisiFilter]);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      <Sidebar active="sarprasAset" setActive={() => {}} collapsed={isCollapsed} setCollapsed={setIsCollapsed} />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{ name: "Admin Sekolah", email: "admin@smartschool.com", avatar: "AD" }}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="w-full p-4 md:p-6 lg:p-8">
            <div className="w-full space-y-5">
              {/* HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 flex-shrink-0">
                    <Boxes size={20} />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-slate-900">Aset Sarana & Prasarana</h1>
                    <p className="text-sm text-slate-600">Kelola aset tetap, fasilitas, dan kondisi barang sekolah</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setAset(loadAset());
                      window.location.reload();
                    }}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all hover:shadow-sm"
                    title="Refresh"
                  >
                    <RefreshCw size={17} className="text-slate-500" />
                  </button>
                  <button
                    onClick={() => router.push("/admin/sarpras/aset/tambah")}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-200 transition-all shadow-sm font-semibold"
                  >
                    <Plus size={18} /> Tambah Aset
                  </button>
                </div>
              </div>

              {/* SEARCH & FILTER */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari nama aset, kode, atau lokasi..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition text-slate-800"
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Filter size={17} className="text-slate-400" />
                    <select
                      value={kategoriFilter}
                      onChange={(e) => setKategoriFilter(e.target.value)}
                      className="px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-800 font-medium min-w-[140px] cursor-pointer"
                    >
                      <option value="Semua">Semua Kategori</option>
                      {kategoriKeys.map((k) => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </select>
                    <select
                      value={kondisiFilter}
                      onChange={(e) => setKondisiFilter(e.target.value)}
                      className="px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-800 font-medium min-w-[140px] cursor-pointer"
                    >
                      <option value="Semua">Semua Kondisi</option>
                      <option value="baik">Baik</option>
                      <option value="rusak_ringan">Rusak Ringan</option>
                      <option value="rusak_berat">Rusak Berat</option>
                    </select>
                    <button
                      onClick={() => {
                        setSearch("");
                        setKategoriFilter("Semua");
                        setKondisiFilter("Semua");
                      }}
                      className="px-3 py-2.5 text-sm text-slate-600 font-medium hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors whitespace-nowrap"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* TABEL ASET */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">No.</th>
                        <th className="text-left font-semibold px-4 py-3 min-w-[200px]">Nama Aset</th>
                        <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">Kategori</th>
                        <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">Kode Aset</th>
                        <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">Lokasi</th>
                        <th className="text-center font-semibold px-4 py-3 whitespace-nowrap">Jumlah</th>
                        <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">Kondisi</th>
                        <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">Status</th>
                        <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">Penanggung Jawab</th>
                        <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">Tgl. Pengadaan</th>
                        <th className="text-center font-semibold px-4 py-3 whitespace-nowrap">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((item, idx) => {
                        const kondisi = kondisiConfig[item.kondisi];
                        const status = statusConfig[item.status];
                        const KondisiIcon = kondisi.icon;
                        return (
                          <tr
                            key={item.id}
                            className={`border-b border-slate-100 last:border-0 transition-colors hover:bg-blue-100/60 ${
                              idx % 2 === 0 ? "bg-blue-50/50" : "bg-white"
                            }`}
                          >
                            <td className="px-4 py-2.5 text-slate-700 font-medium">{idx + 1}</td>
                            <td className="px-4 py-2.5 text-slate-900 font-semibold">{item.nama}</td>
                            <td className="px-4 py-2.5 text-slate-700 whitespace-nowrap">{item.kategori}</td>
                            <td className="px-4 py-2.5 text-slate-700 whitespace-nowrap">{item.kode_aset}</td>
                            <td className="px-4 py-2.5 text-slate-700 whitespace-nowrap">{item.lokasi}</td>
                            <td className="px-4 py-2.5 text-center text-slate-800 font-medium whitespace-nowrap">
                              {item.jumlah} unit
                            </td>
                            <td className="px-4 py-2.5 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1.5 text-sm font-medium ${kondisi.textClassName}`}
                              >
                                <KondisiIcon size={14} />
                                {kondisi.label}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 whitespace-nowrap">
                              <span className={`text-sm font-medium ${status.textClassName}`}>
                                {status.label}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-slate-700 whitespace-nowrap">{item.penanggung_jawab}</td>
                            <td className="px-4 py-2.5 text-slate-700 whitespace-nowrap">{item.tanggal_pengadaan}</td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => router.push(`/admin/sarpras/aset/edit/${item.id}`)}
                                  className="p-2 rounded-lg hover:bg-amber-50 text-slate-500 hover:text-amber-600 transition-all"
                                  title="Edit Aset"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id, item.nama)}
                                  className="p-2 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-all"
                                  title="Hapus Aset"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filtered.length === 0 && (
                        <tr>
                          <td colSpan={11} className="px-4 py-12 text-center">
                            <div className="flex justify-center mb-3">
                              <div className="p-3 rounded-full bg-blue-50">
                                <Boxes size={36} className="text-blue-300" />
                              </div>
                            </div>
                            <p className="text-sm font-medium text-slate-600">Tidak ada data aset</p>
                            <p className="text-xs text-slate-400 mt-1">
                              {search || kategoriFilter !== "Semua" || kondisiFilter !== "Semua"
                                ? "Coba ubah filter pencarian"
                                : "Silakan tambahkan aset baru"}
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <footer className="text-center text-[11px] text-slate-500 py-3 border-t border-slate-200/60">
                © 2026 SmartSchool • Aset Sarana & Prasarana
              </footer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}