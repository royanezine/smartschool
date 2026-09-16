"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import {
  HandCoins,
  Search,
  Plus,
  ChevronRight,
  SlidersHorizontal,
  Package,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

// Dummy data peminjaman. Ganti dengan data asli dari API kalau sudah ada.
const peminjamanList = [
  { id: "pjm-001", nama: "Proyektor Epson", tipe: "Inventaris", peminjam: "Pak Budi", tanggalPinjam: "18 Agu 2026", tanggalKembali: "22 Agu 2026", status: "Dipinjam" },
  { id: "pjm-002", nama: "Aula Sekolah", tipe: "Fasilitas", peminjam: "OSIS", tanggalPinjam: "20 Agu 2026", tanggalKembali: "21 Agu 2026", status: "Menunggu" },
  { id: "pjm-003", nama: "Sound System", tipe: "Inventaris", peminjam: "Bu Sari", tanggalPinjam: "10 Agu 2026", tanggalKembali: "12 Agu 2026", status: "Selesai" },
  { id: "pjm-004", nama: "Lapangan Basket", tipe: "Fasilitas", peminjam: "Pak Rudi", tanggalPinjam: "19 Agu 2026", tanggalKembali: "19 Agu 2026", status: "Dipinjam" },
  { id: "pjm-005", nama: "Mikroskop", tipe: "Inventaris", peminjam: "Bu Dewi", tanggalPinjam: "5 Agu 2026", tanggalKembali: "6 Agu 2026", status: "Terlambat" },
  { id: "pjm-006", nama: "Lab Komputer", tipe: "Fasilitas", peminjam: "Pak Anwar", tanggalPinjam: "1 Agu 2026", tanggalKembali: "1 Agu 2026", status: "Selesai" },
];

const tipeOptions = ["Semua", "Inventaris", "Fasilitas"];
const statusOptions = ["Semua", "Menunggu", "Dipinjam", "Terlambat", "Selesai"];

const statusStyle = {
  Menunggu: "text-amber-700 bg-amber-50 border-amber-200",
  Dipinjam: "text-blue-700 bg-blue-50 border-blue-200",
  Terlambat: "text-rose-700 bg-rose-50 border-rose-200",
  Selesai: "text-emerald-700 bg-emerald-50 border-emerald-200",
};

const statusIcon = {
  Menunggu: { icon: Clock, tone: "text-amber-600 bg-amber-50" },
  Dipinjam: { icon: HandCoins, tone: "text-blue-600 bg-blue-50" },
  Terlambat: { icon: AlertTriangle, tone: "text-rose-600 bg-rose-50" },
  Selesai: { icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-50" },
};

const tipeIcon = {
  Inventaris: Package,
  Fasilitas: Building2,
};

export default function PeminjamanPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [tipeFilter, setTipeFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");

  const notifications = [
    { id: 1, title: "Peminjaman Mikroskop terlambat dikembalikan", desc: "Dikirim 1 jam lalu", read: false },
  ];

  const filteredList = peminjamanList.filter((p) => {
    const matchSearch =
      p.nama.toLowerCase().includes(search.toLowerCase()) ||
      p.peminjam.toLowerCase().includes(search.toLowerCase());
    const matchTipe = tipeFilter === "Semua" || p.tipe === tipeFilter;
    const matchStatus = statusFilter === "Semua" || p.status === statusFilter;
    return matchSearch && matchTipe && matchStatus;
  });

  const handleOpenDetail = (id) => {
    router.push(`/adminSarpras/peminjaman/${id}`);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        role="adminSarpras"
        active="peminjaman"
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
                  Peminjaman
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Kelola pengajuan dan status peminjaman fasilitas serta inventaris.
                </p>
              </div>
              <button
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm transition-colors flex-shrink-0"
              >
                <Plus size={16} />
                Catat Peminjaman
              </button>
            </div>

            {/* SEARCH & FILTER */}
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-4 flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama barang/ruangan atau peminjam..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <SlidersHorizontal size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select
                    value={tipeFilter}
                    onChange={(e) => setTipeFilter(e.target.value)}
                    className="pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors appearance-none"
                  >
                    {tipeOptions.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors appearance-none"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* TABLE PEMINJAMAN */}
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between gap-2 px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 flex-shrink-0">
                    <HandCoins size={16} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-800 truncate">Daftar Peminjaman</h3>
                    <p className="text-xs text-slate-400">{filteredList.length} peminjaman ditemukan</p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                      <th className="px-5 py-3 font-medium">Nama</th>
                      <th className="px-5 py-3 font-medium">Tipe</th>
                      <th className="px-5 py-3 font-medium">Peminjam</th>
                      <th className="px-5 py-3 font-medium">Tgl Pinjam</th>
                      <th className="px-5 py-3 font-medium">Tgl Kembali</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredList.map((p) => {
                      const s = statusIcon[p.status];
                      const StatusIcon = s.icon;
                      const TipeIcon = tipeIcon[p.tipe];
                      return (
                        <tr
                          key={p.id}
                          onClick={() => handleOpenDetail(p.id)}
                          className="cursor-pointer hover:bg-slate-50 transition-colors group"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${s.tone}`}>
                                <StatusIcon size={16} />
                              </div>
                              <span className="font-medium text-slate-800">{p.nama}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <TipeIcon size={14} className="text-slate-400" />
                              {p.tipe}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600">{p.peminjam}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <Calendar size={13} className="text-slate-400" />
                              {p.tanggalPinjam}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <Calendar size={13} className="text-slate-400" />
                              {p.tanggalKembali}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${statusStyle[p.status]}`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <ChevronRight
                              size={16}
                              className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all duration-300"
                            />
                          </td>
                        </tr>
                      );
                    })}

                    {filteredList.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-sm text-slate-400">
                          Tidak ada peminjaman yang cocok dengan filter.
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