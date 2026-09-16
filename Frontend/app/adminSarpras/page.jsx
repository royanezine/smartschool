"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
  Building2,
  Package,
  Tags,
  FileBarChart,
  HandCoins,
  Undo2,
  History,
  DoorOpen,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";

// Dummy data ringkasan sarpras. Ganti dengan data asli dari API kalau sudah ada.
const menuList = [
  { id: "fasilitas", nama: "Fasilitas", desc: "Data fasilitas sekolah", icon: Building2, color: "blue", path: "/adminSarpras/fasilitas" },
  { id: "iventaris", nama: "Inventaris", desc: "Barang & aset sekolah", icon: Package, color: "emerald", path: "/adminSarpras/iventaris" },
  { id: "kategori", nama: "Kategori", desc: "Kategori barang/fasilitas", icon: Tags, color: "amber", path: "/adminSarpras/kategori" },
  { id: "ruangan", nama: "Ruangan", desc: "Data & status ruangan", icon: DoorOpen, color: "indigo", path: "/adminSarpras/ruangan" },
  { id: "peminjaman", nama: "Peminjaman", desc: "Pengajuan pinjam barang/ruangan", icon: HandCoins, color: "fuchsia", path: "/adminSarpras/peminjaman" },
  { id: "pengembalian", nama: "Pengembalian", desc: "Pengembalian barang/ruangan", icon: Undo2, color: "cyan", path: "/adminSarpras/pengembalian" },
  { id: "laporan", nama: "Laporan", desc: "Laporan kondisi & penggunaan", icon: FileBarChart, color: "orange", path: "/adminSarpras/laporan" },
  { id: "riwayat", nama: "Riwayat", desc: "Riwayat transaksi sarpras", icon: History, color: "rose", path: "/adminSarpras/riwayat" },
];

// Sama seperti pola siswa: satu tempat untuk semua warna badge icon.
const colorMap = {
  blue: { grad: "from-blue-500 to-blue-600", ring: "group-hover:ring-blue-100", border: "hover:border-blue-200" },
  emerald: { grad: "from-emerald-500 to-emerald-600", ring: "group-hover:ring-emerald-100", border: "hover:border-emerald-200" },
  amber: { grad: "from-amber-500 to-amber-600", ring: "group-hover:ring-amber-100", border: "hover:border-amber-200" },
  indigo: { grad: "from-indigo-500 to-indigo-600", ring: "group-hover:ring-indigo-100", border: "hover:border-indigo-200" },
  fuchsia: { grad: "from-fuchsia-500 to-fuchsia-600", ring: "group-hover:ring-fuchsia-100", border: "hover:border-fuchsia-200" },
  cyan: { grad: "from-cyan-500 to-cyan-600", ring: "group-hover:ring-cyan-100", border: "hover:border-cyan-200" },
  orange: { grad: "from-orange-500 to-orange-600", ring: "group-hover:ring-orange-100", border: "hover:border-orange-200" },
  rose: { grad: "from-rose-500 to-rose-600", ring: "group-hover:ring-rose-100", border: "hover:border-rose-200" },
};

const quickStats = [
  { key: "totalInventaris", label: "Total Inventaris", value: "1.284", icon: Package, tone: "text-blue-600 bg-blue-50" },
  { key: "peminjamanAktif", label: "Peminjaman Aktif", value: "17", icon: HandCoins, tone: "text-amber-600 bg-amber-50" },
  { key: "belumDikembalikan", label: "Belum Dikembalikan", value: "5", icon: AlertTriangle, tone: "text-rose-600 bg-rose-50" },
  { key: "ruanganTersedia", label: "Ruangan Tersedia", value: "12", icon: DoorOpen, tone: "text-emerald-600 bg-emerald-50" },
];

// Dummy aktivitas terbaru. Ganti dengan data asli dari API kalau sudah ada.
const recentActivity = [
  { id: 1, title: "Peminjaman proyektor oleh Pak Budi", desc: "Ruang Lab Komputer • 2 jam lalu", status: "pending" },
  { id: 2, title: "Pengembalian 10 unit kursi", desc: "Aula Sekolah • 5 jam lalu", status: "done" },
  { id: 3, title: "Laporan kerusakan AC ruang guru", desc: "Ruang Guru • kemarin", status: "warning" },
];

const statusIcon = {
  pending: { icon: Clock, tone: "text-amber-600 bg-amber-50" },
  done: { icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-50" },
  warning: { icon: AlertTriangle, tone: "text-rose-600 bg-rose-50" },
};

export default function AdminSarprasDashboardPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const notifications = [
    { id: 1, title: "5 barang belum dikembalikan", desc: "Dikirim 1 jam lalu", read: false },
    { id: 2, title: "Pengajuan peminjaman baru menunggu approval", desc: "Dikirim kemarin", read: false },
  ];

  const handleOpenMenu = (path) => {
    router.push(path);
  };

  return (
    // Pola wrapper disamakan dengan dashboard siswa: min-h-screen di wrapper luar,
    // main tanpa overflow-y-auto, supaya sidebar mengikuti tinggi konten halaman.
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        role="adminSarpras"
        active="dashboard"
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
                  Dashboard Admin Sarpras
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Ringkasan fasilitas, inventaris, dan aktivitas peminjaman hari ini.
                </p>
              </div>
            </div>

            {/* QUICK STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickStats.map(({ key, label, value, icon: Icon, tone }) => (
                <div
                  key={key}
                  className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-4 flex items-center gap-3.5"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${tone}`}>
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl font-bold text-slate-900 leading-none">{value}</p>
                    <p className="text-xs text-slate-500 mt-1 truncate">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* MENU SARPRAS */}
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between gap-2 px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 flex-shrink-0">
                    <Building2 size={16} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-800 truncate">Menu Sarpras</h3>
                    <p className="text-xs text-slate-400">{menuList.length} modul tersedia</p>
                  </div>
                </div>
              </div>

              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {menuList.map((menu) => {
                  const Icon = menu.icon;
                  const c = colorMap[menu.color];
                  return (
                    <button
                      key={menu.id}
                      onClick={() => handleOpenMenu(menu.path)}
                      className={`group text-left bg-white rounded-2xl border border-slate-200 ${c.border} p-4 shadow-sm hover:shadow-md transition-all duration-300 min-w-0`}
                    >
                      <div className="flex items-start justify-between">
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.grad} text-white flex items-center justify-center flex-shrink-0 shadow-sm ring-4 ring-transparent ${c.ring} transition-all duration-300`}>
                          <Icon size={19} />
                        </div>
                        <ChevronRight
                          size={16}
                          className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all duration-300 flex-shrink-0 mt-1"
                        />
                      </div>

                      <h3 className="mt-3 text-sm font-semibold text-slate-800 truncate">{menu.nama}</h3>
                      <p className="mt-0.5 text-xs text-slate-500 truncate">{menu.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AKTIVITAS TERBARU */}
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between gap-2 px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 flex-shrink-0">
                    <History size={16} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-800 truncate">Aktivitas Terbaru</h3>
                    <p className="text-xs text-slate-400">Update peminjaman & pengembalian</p>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenMenu("/adminSarpras/riwayat")}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-0.5 flex-shrink-0"
                >
                  Lihat semua
                  <ChevronRight size={12} />
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {recentActivity.map((item) => {
                  const s = statusIcon[item.status];
                  const StatusIcon = s.icon;
                  return (
                    <div key={item.id} className="flex items-center gap-3.5 px-5 py-3.5">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${s.tone}`}>
                        <StatusIcon size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800 truncate">{item.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}