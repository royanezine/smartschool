"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import {
  FileBarChart,
  Search,
  Download,
  SlidersHorizontal,
  Building2,
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
} from "lucide-react";

// Dummy data laporan. Ganti dengan data asli dari API kalau sudah ada.
const laporanList = [
  { id: "lap-001", judul: "Kerusakan AC Ruang Guru", jenis: "Kerusakan", target: "Fasilitas", pelapor: "Bu Sari", tanggal: "20 Agu 2026", status: "Menunggu" },
  { id: "lap-002", judul: "Kebocoran atap Lab IPA", jenis: "Kerusakan", target: "Fasilitas", pelapor: "Pak Anwar", tanggal: "18 Agu 2026", status: "Diproses" },
  { id: "lap-003", judul: "Pemeriksaan rutin kursi kelas", jenis: "Pemeriksaan", target: "Inventaris", pelapor: "Admin Sarpras", tanggal: "15 Agu 2026", status: "Selesai" },
  { id: "lap-004", judul: "Papan tulis rusak berat", jenis: "Kerusakan", target: "Inventaris", pelapor: "Pak Budi", tanggal: "12 Agu 2026", status: "Selesai" },
  { id: "lap-005", judul: "Proyektor lab komputer bermasalah", jenis: "Kerusakan", target: "Inventaris", pelapor: "Bu Dewi", tanggal: "10 Agu 2026", status: "Diproses" },
  { id: "lap-006", judul: "Pengecekan kondisi lapangan basket", jenis: "Pemeriksaan", target: "Fasilitas", pelapor: "Admin Sarpras", tanggal: "5 Agu 2026", status: "Selesai" },
];

const jenisOptions = ["Semua", "Kerusakan", "Pemeriksaan"];
const targetOptions = ["Semua", "Fasilitas", "Inventaris"];
const statusOptions = ["Semua", "Menunggu", "Diproses", "Selesai"];

const statusStyle = {
  Menunggu: "text-amber-700 bg-amber-50 border-amber-200",
  Diproses: "text-blue-700 bg-blue-50 border-blue-200",
  Selesai: "text-emerald-700 bg-emerald-50 border-emerald-200",
};

const statusIcon = {
  Menunggu: { icon: Clock, tone: "text-amber-600 bg-amber-50" },
  Diproses: { icon: AlertTriangle, tone: "text-blue-600 bg-blue-50" },
  Selesai: { icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-50" },
};

const targetIcon = {
  Fasilitas: Building2,
  Inventaris: Package,
};

const quickStats = [
  { key: "total", label: "Total Laporan", value: laporanList.length, icon: FileBarChart, tone: "text-blue-600 bg-blue-50" },
  { key: "menunggu", label: "Menunggu Tindak Lanjut", value: laporanList.filter((l) => l.status === "Menunggu").length, icon: Clock, tone: "text-amber-600 bg-amber-50" },
  { key: "diproses", label: "Sedang Diproses", value: laporanList.filter((l) => l.status === "Diproses").length, icon: AlertTriangle, tone: "text-blue-600 bg-blue-50" },
  { key: "selesai", label: "Selesai", value: laporanList.filter((l) => l.status === "Selesai").length, icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-50" },
];

export default function LaporanPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [jenisFilter, setJenisFilter] = useState("Semua");
  const [targetFilter, setTargetFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");

  const notifications = [
    { id: 1, title: "Laporan kerusakan AC Ruang Guru menunggu tindak lanjut", desc: "Dikirim 2 jam lalu", read: false },
  ];

  const filteredList = laporanList.filter((l) => {
    const matchSearch =
      l.judul.toLowerCase().includes(search.toLowerCase()) ||
      l.pelapor.toLowerCase().includes(search.toLowerCase());
    const matchJenis = jenisFilter === "Semua" || l.jenis === jenisFilter;
    const matchTarget = targetFilter === "Semua" || l.target === targetFilter;
    const matchStatus = statusFilter === "Semua" || l.status === statusFilter;
    return matchSearch && matchJenis && matchTarget && matchStatus;
  });

  const handleExport = () => {
    // TODO: ganti dengan pemanggilan API asli untuk export (PDF/Excel)
    console.log("Export laporan:", filteredList);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        role="adminSarpras"
        active="laporan"
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
                  Laporan
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Pantau laporan kerusakan dan pemeriksaan fasilitas serta inventaris.
                </p>
              </div>
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm transition-colors flex-shrink-0"
              >
                <Download size={16} />
                Export Laporan
              </button>
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

            {/* SEARCH & FILTER */}
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-4 flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari judul laporan atau pelapor..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <SlidersHorizontal size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select
                    value={jenisFilter}
                    onChange={(e) => setJenisFilter(e.target.value)}
                    className="pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors appearance-none"
                  >
                    {jenisOptions.map((j) => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                </div>

                <select
                  value={targetFilter}
                  onChange={(e) => setTargetFilter(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors appearance-none"
                >
                  {targetOptions.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>

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

            {/* TABLE LAPORAN */}
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between gap-2 px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 flex-shrink-0">
                    <FileBarChart size={16} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-800 truncate">Daftar Laporan</h3>
                    <p className="text-xs text-slate-400">{filteredList.length} laporan ditemukan</p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                      <th className="px-5 py-3 font-medium">Judul Laporan</th>
                      <th className="px-5 py-3 font-medium">Jenis</th>
                      <th className="px-5 py-3 font-medium">Target</th>
                      <th className="px-5 py-3 font-medium">Pelapor</th>
                      <th className="px-5 py-3 font-medium">Tanggal</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredList.map((l) => {
                      const s = statusIcon[l.status];
                      const StatusIcon = s.icon;
                      const TargetIcon = targetIcon[l.target];
                      return (
                        <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${s.tone}`}>
                                <StatusIcon size={16} />
                              </div>
                              <span className="font-medium text-slate-800">{l.judul}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600">{l.jenis}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <TargetIcon size={14} className="text-slate-400" />
                              {l.target}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600">{l.pelapor}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <Calendar size={13} className="text-slate-400" />
                              {l.tanggal}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${statusStyle[l.status]}`}>
                              {l.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredList.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-sm text-slate-400">
                          Tidak ada laporan yang cocok dengan filter.
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