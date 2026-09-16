"use client"; // <--- PENTING! Tambahkan ini di baris pertama

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";
import { 
  Tags, 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Image as ImageIcon,
  LayoutGrid
} from "lucide-react";

export default function KategoriPage() {
  const router = useRouter();

  // State Sidebar
  const [active, setActive] = useState("galeri");
  const [collapsed, setCollapsed] = useState(false);

  // State Data & Pencarian
  const [searchTerm, setSearchTerm] = useState("");
  const [kategoriList, setKategoriList] = useState([
    { id: 1, name: "Dokumentasi", count: 15, color: "blue" },
    { id: 2, name: "Bangunan", count: 8, color: "indigo" },
    { id: 3, name: "Fasilitas", count: 6, color: "purple" },
    { id: 4, name: "Apresiasi", count: 4, color: "pink" },
    { id: 5, name: "Kegiatan Sosial", count: 3, color: "orange" },
  ]);

  // Filter Logic
  const filteredKategori = kategoriList.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Warna premium untuk setiap kartu kategori
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    pink: "bg-pink-50 text-pink-600 border-pink-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
  };

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-slate-50">
      {/* SIDEBAR */}
      <Sidebar 
        active={active} 
        setActive={setActive} 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
      />

      {/* MAIN CONTENT */}
      <main 
        className={`
          flex-1
          min-w-0
          w-0
          overflow-y-auto
          bg-slate-50
          transition-all
          duration-300
        `}
      >
        {/* HEADER */}
        <Header title="Kategori Galeri" user={{ name: "Admin" }} />

        {/* KONTEN UTAMA */}
        <div className="w-full min-w-0 px-4 py-8 md:px-8 lg:px-10 lg:py-10">
          <div className="w-full max-w-7xl mx-auto min-w-0 space-y-8">
            
            {/* 1. BREADCRUMB (Navigasi) */}
            <nav className="flex text-sm font-medium text-gray-500" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-2 md:space-x-3 tracking-wide">
                <li className="inline-flex items-center">
                  <a href="/cmsAdmin" className="hover:text-indigo-600 transition-colors">Dashboard</a>
                </li>
                <li className="text-gray-300">/</li>
                <li className="inline-flex items-center">
                  <a href="/cmsAdmin/website/galeri" className="hover:text-indigo-600 transition-colors">Galeri</a>
                </li>
                <li className="text-gray-300">/</li>
                <li className="inline-flex items-center text-indigo-600" aria-current="page">
                  Kategori
                </li>
              </ol>
            </nav>

            {/* 2. HEADER & ACTION BUTTONS */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50/80 border border-indigo-100/50 rounded-2xl shadow-sm">
                  <Tags className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-gray-900">
                    Manajemen Kategori
                  </h1>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed hidden sm:block">
                    Kelola label kategori untuk mengelompokkan foto di galeri Anda
                  </p>
                </div>
              </div>
              
              {/* Tombol Tambah Kategori Premium */}
              <button
                onClick={() => alert("Fitur Tambah Kategori dibuka! (Mockup)")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/30 active:scale-95 transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
                Tambah Kategori Baru
              </button>
            </div>

            {/* 3. STATISTIK RINGKASAN Premium dengan Border Warna */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Tags className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Kategori</p>
                    <p className="text-2xl font-bold tracking-tight text-gray-900">{kategoriList.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-indigo-500 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><ImageIcon className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Foto</p>
                    <p className="text-2xl font-bold tracking-tight text-gray-900">36</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-purple-500 hover:shadow-md transition-shadow hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><LayoutGrid className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori Utama</p>
                    <p className="text-2xl font-bold tracking-tight text-gray-900">3</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-green-500 hover:shadow-md transition-shadow hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Pencil className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Terakhir Edit</p>
                    <p className="text-2xl font-bold tracking-tight text-gray-900 text-sm">Kemarin</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. SEARCH BAR */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Cari nama kategori..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50/80 text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* 5. GRID KATEGORI INTERAKTIF */}
            {filteredKategori.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredKategori.map((item) => (
                  <div 
                    key={item.id} 
                    className="group relative bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex items-center p-5"
                  >
                    {/* Icon Kategori dengan warna */}
                    <div className={`flex-shrink-0 w-14 h-14 rounded-2xl ${colorMap[item.color]} border flex items-center justify-center mr-5`}>
                      <Tags className="w-6 h-6" strokeWidth={2} />
                    </div>

                    {/* Detail Kategori */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-gray-900 text-base truncate">
                            {item.name}
                          </h3>
                          <p className="text-sm font-medium text-gray-400 mt-0.5">
                            {item.count} Foto
                          </p>
                        </div>
                        
                        {/* Action Buttons - Bentuk bulat elegan */}
                        <div className="flex gap-1 flex-shrink-0">
                          <button 
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all duration-200"
                            title="Edit Kategori"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
                            title="Hapus Kategori"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <a 
                          href={`/cmsAdmin/website/galeri?kategori=${item.name}`}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors group-hover:underline"
                        >
                          Lihat Foto 
                          <span className="text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State (Jika kategori tidak ditemukan) */
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                <div className="inline-flex p-5 bg-gray-100 rounded-full mb-5">
                  <Tags className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Kategori tidak ditemukan</h3>
                <p className="text-gray-500 mt-2 text-sm max-w-sm mx-auto">
                  Coba ubah kata kunci pencarian atau buat kategori baru untuk melabeli foto Anda.
                </p>
              </div>
            )}
            
          </div>
        </div>
      </main>
    </div>
  );
}