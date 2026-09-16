"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import {
  Building2,
  Search,
  Plus,
  MapPin,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";

// Dummy data fasilitas. Ganti dengan data asli dari API kalau sudah ada.
const fasilitasList = [
  { id: "fs-001", nama: "Lapangan Basket", lokasi: "Area Belakang", kategori: "Olahraga", kondisi: "Baik", kapasitas: "30 orang", foto: null },
  { id: "fs-002", nama: "Aula Sekolah", lokasi: "Gedung Utama Lt. 1", kategori: "Umum", kondisi: "Baik", kapasitas: "300 orang", foto: null },
  { id: "fs-003", nama: "Lab Komputer", lokasi: "Gedung B Lt. 2", kategori: "Laboratorium", kondisi: "Rusak Ringan", kapasitas: "40 orang", foto: null },
  { id: "fs-004", nama: "Perpustakaan", lokasi: "Gedung A Lt. 1", kategori: "Umum", kondisi: "Baik", kapasitas: "60 orang", foto: null },
  { id: "fs-005", nama: "Lab IPA", lokasi: "Gedung B Lt. 1", kategori: "Laboratorium", kondisi: "Rusak Berat", kapasitas: "35 orang", foto: null },
  { id: "fs-006", nama: "Musala", lokasi: "Area Tengah", kategori: "Ibadah", kondisi: "Baik", kapasitas: "100 orang", foto: null },
];

const kondisiStyle = {
  Baik: "text-emerald-700 bg-emerald-50 border-emerald-200",
  "Rusak Ringan": "text-amber-700 bg-amber-50 border-amber-200",
  "Rusak Berat": "text-rose-700 bg-rose-50 border-rose-200",
};

const kategoriOptions = ["Semua", "Olahraga", "Umum", "Laboratorium", "Ibadah"];

export default function FasilitasPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("Semua");

  const notifications = [
    { id: 1, title: "Lab IPA dilaporkan rusak berat", desc: "Dikirim 2 jam lalu", read: false },
  ];

  const filteredList = fasilitasList.filter((f) => {
    const matchSearch =
      f.nama.toLowerCase().includes(search.toLowerCase()) ||
      f.lokasi.toLowerCase().includes(search.toLowerCase());
    const matchKategori = kategoriFilter === "Semua" || f.kategori === kategoriFilter;
    return matchSearch && matchKategori;
  });

  const handleOpenDetail = (id) => {
    router.push(`/adminSarpras/fasilitas/${id}`);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        role="adminSarpras"
        active="fasilitas"
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
                  Fasilitas
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Kelola data fasilitas sekolah beserta kondisi dan lokasinya.
                </p>
              </div>
              <button
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm transition-colors flex-shrink-0"
              >
                <Plus size={16} />
                Tambah Fasilitas
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
                  placeholder="Cari nama atau lokasi fasilitas..."
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

            {/* GRID FASILITAS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredList.map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleOpenDetail(f.id)}
                  className="group text-left bg-white rounded-2xl border border-slate-200 hover:border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                  <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                    <Building2 size={32} className="text-blue-300" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-slate-800 truncate">{f.nama}</h3>
                      <ChevronRight
                        size={16}
                        className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all duration-300 flex-shrink-0 mt-0.5"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
                      <MapPin size={12} className="flex-shrink-0" />
                      <span className="truncate">{f.lokasi}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[11px] text-slate-400">{f.kapasitas}</span>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${kondisiStyle[f.kondisi]}`}>
                        {f.kondisi}
                      </span>
                    </div>
                  </div>
                </button>
              ))}

              {filteredList.length === 0 && (
                <div className="col-span-full text-center py-12 text-sm text-slate-400">
                  Tidak ada fasilitas yang cocok dengan pencarian.
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}