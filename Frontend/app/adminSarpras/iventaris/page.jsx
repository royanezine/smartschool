"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import {
  Package,
  Search,
  Plus,
  ChevronRight,
  SlidersHorizontal,
  Boxes,
} from "lucide-react";

// Dummy data inventaris. Ganti dengan data asli dari API kalau sudah ada.
const iventarisList = [
  { id: "inv-001", nama: "Kursi Kayu", kategori: "Furnitur", lokasi: "Gudang A", stok: 120, kondisi: "Baik" },
  { id: "inv-002", nama: "Proyektor Epson", kategori: "Elektronik", lokasi: "Lab Komputer", stok: 5, kondisi: "Baik" },
  { id: "inv-003", nama: "Meja Guru", kategori: "Furnitur", lokasi: "Ruang Guru", stok: 30, kondisi: "Rusak Ringan" },
  { id: "inv-004", nama: "AC Split 1PK", kategori: "Elektronik", lokasi: "Ruang Kepala Sekolah", stok: 8, kondisi: "Baik" },
  { id: "inv-005", nama: "Papan Tulis", kategori: "Alat Belajar", lokasi: "Gudang B", stok: 15, kondisi: "Rusak Berat" },
  { id: "inv-006", nama: "Mikroskop", kategori: "Laboratorium", lokasi: "Lab IPA", stok: 20, kondisi: "Baik" },
  { id: "inv-007", nama: "Sound System", kategori: "Elektronik", lokasi: "Aula", stok: 2, kondisi: "Baik" },
  { id: "inv-008", nama: "Lemari Arsip", kategori: "Furnitur", lokasi: "Ruang TU", stok: 10, kondisi: "Rusak Ringan" },
];

const kondisiStyle = {
  Baik: "text-emerald-700 bg-emerald-50 border-emerald-200",
  "Rusak Ringan": "text-amber-700 bg-amber-50 border-amber-200",
  "Rusak Berat": "text-rose-700 bg-rose-50 border-rose-200",
};

const kategoriOptions = ["Semua", "Furnitur", "Elektronik", "Alat Belajar", "Laboratorium"];

export default function IventarisPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("Semua");

  const notifications = [
    { id: 1, title: "Stok papan tulis menipis", desc: "Dikirim 3 jam lalu", read: false },
  ];

  const filteredList = iventarisList.filter((item) => {
    const matchSearch =
      item.nama.toLowerCase().includes(search.toLowerCase()) ||
      item.lokasi.toLowerCase().includes(search.toLowerCase());
    const matchKategori = kategoriFilter === "Semua" || item.kategori === kategoriFilter;
    return matchSearch && matchKategori;
  });

  const handleOpenDetail = (id) => {
    router.push(`/adminSarpras/iventaris/${id}`);
  };

  const handleTambah = () => {
    router.push("/adminSarpras/iventaris/tambah");
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        role="adminSarpras"
        active="iventaris"
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
                  Inventaris
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Kelola data barang inventaris, stok, dan kondisinya.
                </p>
              </div>
              <button
                onClick={handleTambah}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm transition-colors flex-shrink-0"
              >
                <Plus size={16} />
                Tambah Inventaris
              </button>
            </div>

            {/* SEARCH & FILTER */}
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama atau lokasi barang..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors"
                />
              </div>
              <div className="relative">
                <SlidersHorizontal size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  value={kategoriFilter}
                  onChange={(e) => setKategoriFilter(e.target.value)}
                  className="pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors appearance-none"
                >
                  {kategoriOptions.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* TABLE INVENTARIS */}
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between gap-2 px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 flex-shrink-0">
                    <Boxes size={16} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-800 truncate">Daftar Barang</h3>
                    <p className="text-xs text-slate-400">{filteredList.length} barang ditemukan</p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                      <th className="px-5 py-3 font-medium">Nama Barang</th>
                      <th className="px-5 py-3 font-medium">Kategori</th>
                      <th className="px-5 py-3 font-medium">Lokasi</th>
                      <th className="px-5 py-3 font-medium">Stok</th>
                      <th className="px-5 py-3 font-medium">Kondisi</th>
                      <th className="px-5 py-3 font-medium w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredList.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => handleOpenDetail(item.id)}
                        className="cursor-pointer hover:bg-slate-50 transition-colors group"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
                              <Package size={16} />
                            </div>
                            <span className="font-medium text-slate-800">{item.nama}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">{item.kategori}</td>
                        <td className="px-5 py-3.5 text-slate-600">{item.lokasi}</td>
                        <td className="px-5 py-3.5 text-slate-600">{item.stok} unit</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${kondisiStyle[item.kondisi]}`}>
                            {item.kondisi}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <ChevronRight
                            size={16}
                            className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all duration-300"
                          />
                        </td>
                      </tr>
                    ))}

                    {filteredList.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-sm text-slate-400">
                          Tidak ada barang yang cocok dengan pencarian.
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
    </div>
  );
}