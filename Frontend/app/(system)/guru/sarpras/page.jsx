"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import {
  Package,
  Sparkles,
  ClipboardList,
  FileText,
  ArrowRight,
  Boxes,
  AlertTriangle,
  Clock,
} from "lucide-react";

// ===== DUMMY DATA =====
// Ringkasan peminjaman sarana-prasarana untuk ditampilkan di halaman index Sarpras.
// Ganti dengan data asli dari API/DB begitu tersedia.

const subHalaman = [
  {
    key: "pinjam",
    href: "/guru/sarpras/pinjam",
    icon: Package,
    color: "blue",
    label: "Pinjam",
    deskripsi: "Ajukan peminjaman alat, ruangan, atau fasilitas sekolah untuk kebutuhan mengajar.",
    info: "12 item tersedia",
  },
  {
    key: "peminjaman",
    href: "/guru/sarpras/peminjaman",
    icon: ClipboardList,
    color: "amber",
    label: "Peminjaman",
    deskripsi: "Pantau status pengajuan peminjaman yang sedang berjalan atau menunggu persetujuan.",
    info: "3 pengajuan aktif",
  },
  {
    key: "riwayat",
    href: "/guru/sarpras/riwayat",
    icon: FileText,
    color: "emerald",
    label: "Riwayat",
    deskripsi: "Lihat catatan lengkap seluruh peminjaman yang telah selesai atau dikembalikan.",
    info: "28 riwayat bulan ini",
  },
];

const colorClasses = {
  blue: { badge: "bg-blue-50 text-blue-600 border-blue-200", iconBg: "bg-blue-600" },
  amber: { badge: "bg-amber-50 text-amber-600 border-amber-200", iconBg: "bg-amber-500" },
  emerald: { badge: "bg-emerald-50 text-emerald-600 border-emerald-200", iconBg: "bg-emerald-500" },
};

const ringkasanPeminjaman = [
  { item: "Proyektor Epson EB-X05", kategori: "Elektronik", status: "dipinjam", batasWaktu: "Kembali hari ini" },
  { item: "Ruang Lab Komputer 2", kategori: "Ruangan", status: "menunggu", batasWaktu: "Menunggu persetujuan" },
  { item: "Sound System Portable", kategori: "Elektronik", status: "dipinjam", batasWaktu: "Kembali 2 hari lagi" },
  { item: "Matras Olahraga (10 pcs)", kategori: "Olahraga", status: "terlambat", batasWaktu: "Terlambat 1 hari" },
];

const statusClasses = {
  dipinjam: "text-blue-600 bg-blue-50 border-blue-200",
  menunggu: "text-amber-600 bg-amber-50 border-amber-200",
  terlambat: "text-red-600 bg-red-50 border-red-200",
};

const statusLabel = {
  dipinjam: "Dipinjam",
  menunggu: "Menunggu",
  terlambat: "Terlambat",
};

export default function GuruSarprasIndexPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const notifications = [
    { id: 1, title: "Pengajuan Disetujui", desc: "Dikirim 1 jam lalu", read: false },
    { id: 2, title: "Batas Pengembalian Alat", desc: "Dikirim 4 jam lalu", read: false },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          notifications={notifications}
          user={{ name: "Bu Sari", email: "guru@smartschool.com", avatar: "AS" }}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="w-full space-y-6">

            {/* PAGE HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-600 text-white shadow-sm flex-shrink-0">
                    <Package size={18} />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 truncate">
                    Sarana Prasarana
                  </h1>
                </div>
                <p className="text-sm text-slate-500 mt-1 ml-[42px] flex items-center gap-1.5">
                  <Sparkles size={14} className="text-slate-400 flex-shrink-0" />
                  <span className="truncate">Kelola peminjaman alat, ruangan, dan fasilitas sekolah — pilih menu di bawah.</span>
                </p>
              </div>
            </div>

            {/* SUB-HALAMAN CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {subHalaman.map((s) => (
                <Link
                  key={s.key}
                  href={s.href}
                  className="group bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-lg text-white shadow-sm flex-shrink-0 ${colorClasses[s.color].iconBg}`}>
                      <s.icon size={18} />
                    </div>
                    <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-800">{s.label}</h2>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{s.deskripsi}</p>
                  </div>
                  <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border w-fit ${colorClasses[s.color].badge}`}>
                    {s.info}
                  </span>
                </Link>
              ))}
            </div>

            {/* RINGKASAN PEMINJAMAN AKTIF */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 p-4 sm:p-5 border-b border-slate-100">
                <Boxes size={16} className="text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-800">Peminjaman Aktif</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {ringkasanPeminjaman.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 sm:px-5 sm:py-3.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{p.item}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{p.kategori}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 flex-shrink-0">
                      {p.status === "terlambat" ? (
                        <AlertTriangle size={12} className="text-red-500" />
                      ) : (
                        <Clock size={12} className="text-slate-400" />
                      )}
                      <span className="hidden sm:inline">{p.batasWaktu}</span>
                    </div>
                    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full border flex-shrink-0 ${statusClasses[p.status]}`}>
                      {statusLabel[p.status]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}