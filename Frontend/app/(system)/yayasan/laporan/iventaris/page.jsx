"use client";

import { useState, useMemo } from "react";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import {
  Boxes,
  Search,
  ChevronDown,
  ChevronLeft,
  Sparkles,
  PackagePlus,
  Package,
  AlertTriangle,
  Wallet,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";

// ===== DUMMY DATA =====
// Catatan: ganti dengan data asli dari API/DB begitu tersedia.
const UNIT_OPTIONS = ["Semua Unit", "SD Smart School 1", "SD Smart School 2", "SMP Smart School 1", "SMP Smart School 2", "SMA Smart School 1", "SMA Smart School 2"];
const KATEGORI_OPTIONS = ["Semua Kategori", "Elektronik", "Furnitur", "Laboratorium", "Olahraga", "Buku & ATK"];
const KONDISI_OPTIONS = ["Semua Kondisi", "Baik", "Perlu Perbaikan", "Rusak"];

const dataInventaris = [
  { id: 1, nama: "Proyektor Epson EB-X41", kategori: "Elektronik", unit: "SMP Smart School 1", lokasi: "Ruang Kelas 8A", jumlah: 3, kondisi: "Baik", nilai: 15000000, tanggal: "12 Jan 2023" },
  { id: 2, nama: "Kursi Siswa Lipat", kategori: "Furnitur", unit: "SD Smart School 1", lokasi: "Gudang Utama", jumlah: 120, kondisi: "Baik", nilai: 36000000, tanggal: "03 Jul 2022" },
  { id: 3, nama: "Mikroskop Binokuler", kategori: "Laboratorium", unit: "SMA Smart School 1", lokasi: "Lab IPA", jumlah: 15, kondisi: "Perlu Perbaikan", nilai: 22500000, tanggal: "20 Mar 2021" },
  { id: 4, nama: "Bola Basket Molten", kategori: "Olahraga", unit: "SMP Smart School 2", lokasi: "Gudang Olahraga", jumlah: 10, kondisi: "Baik", nilai: 3500000, tanggal: "15 Aug 2024" },
  { id: 5, nama: "Laptop Lenovo ThinkPad E14", kategori: "Elektronik", unit: "SMA Smart School 2", lokasi: "Lab Komputer", jumlah: 25, kondisi: "Baik", nilai: 187500000, tanggal: "09 Feb 2023" },
  { id: 6, nama: "Papan Tulis Whiteboard", kategori: "Furnitur", unit: "SD Smart School 2", lokasi: "Ruang Kelas 3B", jumlah: 8, kondisi: "Rusak", nilai: 4000000, tanggal: "28 May 2019" },
  { id: 7, nama: "AC Split 1 PK", kategori: "Elektronik", unit: "SMP Smart School 1", lokasi: "Ruang Guru", jumlah: 6, kondisi: "Baik", nilai: 27000000, tanggal: "11 Nov 2023" },
  { id: 8, nama: "Rak Buku Perpustakaan", kategori: "Furnitur", unit: "SMA Smart School 1", lokasi: "Perpustakaan", jumlah: 18, kondisi: "Baik", nilai: 21600000, tanggal: "04 Sep 2020" },
  { id: 9, nama: "Set Alat Peraga Fisika", kategori: "Laboratorium", unit: "SMA Smart School 1", lokasi: "Lab Fisika", jumlah: 5, kondisi: "Perlu Perbaikan", nilai: 18000000, tanggal: "17 Oct 2021" },
  { id: 10, nama: "Buku Paket Matematika Kelas 7", kategori: "Buku & ATK", unit: "SMP Smart School 2", lokasi: "Perpustakaan", jumlah: 300, kondisi: "Baik", nilai: 21000000, tanggal: "02 Jul 2024" },
  { id: 11, nama: "Meja Guru", kategori: "Furnitur", unit: "SD Smart School 1", lokasi: "Ruang Kelas 1A", jumlah: 12, kondisi: "Rusak", nilai: 6000000, tanggal: "19 Apr 2018" },
  { id: 12, nama: "Printer Epson L3110", kategori: "Elektronik", unit: "SD Smart School 2", lokasi: "Ruang TU", jumlah: 4, kondisi: "Baik", nilai: 6800000, tanggal: "25 Dec 2023" },
];

const formatRupiah = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

// ===== MAIN COMPONENT =====

export default function DataInventarisPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [unit, setUnit] = useState(UNIT_OPTIONS[0]);
  const [kategori, setKategori] = useState(KATEGORI_OPTIONS[0]);
  const [kondisi, setKondisi] = useState(KONDISI_OPTIONS[0]);
  const [search, setSearch] = useState("");

  const filteredInventaris = useMemo(() => {
    return dataInventaris.filter((it) => {
      const matchUnit = unit === "Semua Unit" || it.unit === unit;
      const matchKategori = kategori === "Semua Kategori" || it.kategori === kategori;
      const matchKondisi = kondisi === "Semua Kondisi" || it.kondisi === kondisi;
      const matchSearch =
        !search.trim() ||
        it.nama.toLowerCase().includes(search.toLowerCase()) ||
        it.lokasi.toLowerCase().includes(search.toLowerCase());
      return matchUnit && matchKategori && matchKondisi && matchSearch;
    });
  }, [unit, kategori, kondisi, search]);

  const summary = useMemo(() => {
    const totalItem = filteredInventaris.reduce((a, it) => a + it.jumlah, 0);
    const totalNilai = filteredInventaris.reduce((a, it) => a + it.nilai, 0);
    const totalBaik = filteredInventaris.filter((it) => it.kondisi === "Baik").length;
    const totalBermasalah = filteredInventaris.filter((it) => it.kondisi !== "Baik").length;
    return { totalItem, totalNilai, totalBaik, totalBermasalah };
  }, [filteredInventaris]);

  const notifications = [
    { id: 1, title: "Pengumuman Libur Semester", desc: "Dikirim 2 jam lalu", read: false },
    { id: 2, title: "Deadline Input Nilai", desc: "Dikirim 5 jam lalu", read: false },
  ];

  const kondisiStyle = (kondisi) => {
    if (kondisi === "Baik") return "bg-emerald-50 text-emerald-600 border-emerald-200";
    if (kondisi === "Perlu Perbaikan") return "bg-amber-50 text-amber-600 border-amber-200";
    return "bg-rose-50 text-rose-600 border-rose-200";
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        active="laporan"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          notifications={notifications}
          user={{ name: "Admin Yayasan", email: "admin@smartschool.com", avatar: "Y" }}
        />
        <main className="flex-1 overflow-y-auto min-h-screen p-4 sm:p-6 lg:p-8">
          <div className="w-full space-y-6">

            {/* PAGE HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <button
                  onClick={() => router.push("/yayasan/laporan")}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors mb-1"
                >
                  <ChevronLeft size={13} />
                  Laporan & Analitik
                </button>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-500 text-white shadow-sm flex-shrink-0">
                    <Boxes size={18} />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 truncate">
                    Data Inventaris
                  </h1>
                </div>
                <p className="text-sm text-slate-500 mt-1 ml-[42px] flex items-center gap-1.5">
                  <Sparkles size={14} className="text-slate-400 flex-shrink-0" />
                  <span className="truncate">Rekap aset dan barang inventaris seluruh unit sekolah.</span>
                </p>
              </div>

              <button className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors shadow-sm whitespace-nowrap flex-shrink-0">
                <PackagePlus size={16} />
                Tambah Barang
              </button>
            </div>

            {/* FILTER BAR */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama barang atau lokasi..."
                    className="w-full pl-9 pr-3 py-2.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="relative flex-1 min-w-[180px]">
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full appearance-none pl-3 pr-9 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    {UNIT_OPTIONS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                <div className="relative flex-1 min-w-[160px]">
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    className="w-full appearance-none pl-3 pr-9 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    {KATEGORI_OPTIONS.map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                <div className="relative flex-1 min-w-[160px]">
                  <select
                    value={kondisi}
                    onChange={(e) => setKondisi(e.target.value)}
                    className="w-full appearance-none pl-3 pr-9 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    {KONDISI_OPTIONS.map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg border bg-blue-50 text-blue-600 border-blue-200 flex-shrink-0">
                  <Package size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">Total Unit Barang</p>
                  <p className="text-lg font-bold text-slate-800">{summary.totalItem.toLocaleString("id-ID")}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg border bg-purple-50 text-purple-600 border-purple-200 flex-shrink-0">
                  <Wallet size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">Total Nilai Aset</p>
                  <p className="text-lg font-bold text-slate-800">{formatRupiah(summary.totalNilai)}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg border bg-emerald-50 text-emerald-600 border-emerald-200 flex-shrink-0">
                  <CheckCircle2 size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">Kondisi Baik</p>
                  <p className="text-lg font-bold text-slate-800">{summary.totalBaik}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg border bg-rose-50 text-rose-600 border-rose-200 flex-shrink-0">
                  <AlertTriangle size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">Perlu Perhatian</p>
                  <p className="text-lg font-bold text-slate-800">{summary.totalBermasalah}</p>
                </div>
              </div>
            </div>

            {/* TABEL INVENTARIS */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-200/60 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-700 truncate">
                  Daftar Barang Inventaris
                </h3>
                <span className="text-xs text-slate-400 flex-shrink-0">{filteredInventaris.length} jenis barang</span>
              </div>

              <div className="overflow-x-auto w-full">
                <table className="w-full min-w-[920px] text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80">
                      <th className="border border-slate-200 text-left font-medium text-slate-500 text-xs uppercase tracking-wider px-4 sm:px-5 py-3 whitespace-nowrap">
                        Nama Barang
                      </th>
                      <th className="border border-slate-200 text-left font-medium text-slate-500 text-xs uppercase tracking-wider px-3 py-3 whitespace-nowrap">
                        Kategori
                      </th>
                      <th className="border border-slate-200 text-left font-medium text-slate-500 text-xs uppercase tracking-wider px-3 py-3 whitespace-nowrap">
                        Unit Sekolah
                      </th>
                      <th className="border border-slate-200 text-left font-medium text-slate-500 text-xs uppercase tracking-wider px-3 py-3 whitespace-nowrap">
                        Lokasi
                      </th>
                      <th className="border border-slate-200 text-center font-medium text-slate-500 text-xs uppercase tracking-wider px-3 py-3 whitespace-nowrap">
                        Jumlah
                      </th>
                      <th className="border border-slate-200 text-center font-medium text-slate-500 text-xs uppercase tracking-wider px-3 py-3 whitespace-nowrap">
                        Kondisi
                      </th>
                      <th className="border border-slate-200 text-right font-medium text-slate-500 text-xs uppercase tracking-wider px-3 py-3 whitespace-nowrap">
                        Nilai Aset
                      </th>
                      <th className="border border-slate-200 text-center font-medium text-slate-500 text-xs uppercase tracking-wider px-3 py-3 whitespace-nowrap">
                        Tgl. Perolehan
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInventaris.length === 0 && (
                      <tr>
                        <td colSpan={8} className="border border-slate-200 p-10 text-center">
                          <Package size={28} className="mx-auto text-slate-300 mb-2" />
                          <p className="text-sm text-slate-400">Tidak ada barang yang cocok.</p>
                        </td>
                      </tr>
                    )}

                    {filteredInventaris.map((it) => (
                      <tr key={it.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="border border-slate-200 px-4 sm:px-5 py-3 whitespace-nowrap">
                          <span className="text-sm font-medium text-slate-800">{it.nama}</span>
                        </td>
                        <td className="border border-slate-200 px-3 py-3 whitespace-nowrap">
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full border bg-slate-100 text-slate-500 border-slate-200">
                            {it.kategori}
                          </span>
                        </td>
                        <td className="border border-slate-200 px-3 py-3 text-slate-600 whitespace-nowrap">
                          {it.unit}
                        </td>
                        <td className="border border-slate-200 px-3 py-3 text-slate-600 whitespace-nowrap">
                          {it.lokasi}
                        </td>
                        <td className="border border-slate-200 px-3 py-3 text-center text-slate-600 whitespace-nowrap">
                          {it.jumlah.toLocaleString("id-ID")}
                        </td>
                        <td className="border border-slate-200 px-3 py-3 text-center whitespace-nowrap">
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${kondisiStyle(it.kondisi)}`}>
                            {it.kondisi}
                          </span>
                        </td>
                        <td className="border border-slate-200 px-3 py-3 text-right whitespace-nowrap">
                          <span className="text-sm font-semibold text-slate-800">{formatRupiah(it.nilai)}</span>
                        </td>
                        <td className="border border-slate-200 px-3 py-3 text-center text-slate-500 whitespace-nowrap">
                          {it.tanggal}
                        </td>
                      </tr>
                    ))}
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