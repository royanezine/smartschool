"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import {
  History,
  Search,
  SlidersHorizontal,
  Package,
  Building2,
  Calendar,
  HandCoins,
  Undo2,
  FileBarChart,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";

// Dummy data riwayat gabungan (peminjaman, pengembalian, laporan). Ganti dengan data asli dari API kalau sudah ada.
const riwayatList = [
  { id: "riw-001", aktivitas: "Peminjaman", nama: "Proyektor Epson", tipe: "Inventaris", pelaku: "Pak Budi", tanggal: "18 Agu 2026", status: "Dipinjam" },
  { id: "riw-002", aktivitas: "Pengembalian", nama: "Sound System", tipe: "Inventaris", pelaku: "Bu Sari", tanggal: "12 Agu 2026", status: "Selesai" },
  { id: "riw-003", aktivitas: "Laporan", nama: "Kerusakan AC Ruang Guru", tipe: "Fasilitas", pelaku: "Bu Sari", tanggal: "20 Agu 2026", status: "Menunggu" },
  { id: "riw-004", aktivitas: "Peminjaman", nama: "Aula Sekolah", tipe: "Fasilitas", pelaku: "OSIS", tanggal: "20 Agu 2026", status: "Menunggu" },
  { id: "riw-005", aktivitas: "Pengembalian", nama: "Lab Komputer", tipe: "Fasilitas", pelaku: "Pak Anwar", tanggal: "1 Agu 2026", status: "Selesai" },
  { id: "riw-006", aktivitas: "Laporan", nama: "Kebocoran atap Lab IPA", tipe: "Fasilitas", pelaku: "Pak Anwar", tanggal: "18 Agu 2026", status: "Diproses" },
  { id: "riw-007", aktivitas: "Peminjaman", nama: "Mikroskop", tipe: "Inventaris", pelaku: "Bu Dewi", tanggal: "5 Agu 2026", status: "Terlambat" },
  { id: "riw-008", aktivitas: "Pengembalian", nama: "Kursi Kayu (10 unit)", tipe: "Inventaris", pelaku: "Panitia 17-an", tanggal: "17 Agu 2026", status: "Selesai" },
];

const aktivitasOptions = ["Semua", "Peminjaman", "Pengembalian", "Laporan"];
const tipeOptions = ["Semua", "Inventaris", "Fasilitas"];

const aktivitasIcon = {
  Peminjaman: HandCoins,
  Pengembalian: Undo2,
  Laporan: FileBarChart,
};

const aktivitasStyle = {
  Peminjaman: "text-blue-700 bg-blue-50 border-blue-200",
  Pengembalian: "text-indigo-700 bg-indigo-50 border-indigo-200",
  Laporan: "text-orange-700 bg-orange-50 border-orange-200",
};

const tipeIcon = {
  Inventaris: Package,
  Fasilitas: Building2,
};

const statusStyle = {
  Menunggu: "text-amber-700 bg-amber-50 border-amber-200",
  Diproses: "text-blue-700 bg-blue-50 border-blue-200",
  Dipinjam: "text-blue-700 bg-blue-50 border-blue-200",
  Terlambat: "text-rose-700 bg-rose-50 border-rose-200",
  Selesai: "text-emerald-700 bg-emerald-50 border-emerald-200",
};

const statusIcon = {
  Menunggu: Clock,
  Diproses: AlertTriangle,
  Dipinjam: Clock,
  Terlambat: AlertTriangle,
  Selesai: CheckCircle2,
};

export default function RiwayatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [aktivitasFilter, setAktivitasFilter] = useState("Semua");
  const [tipeFilter, setTipeFilter] = useState("Semua");

  const notifications = [
    { id: 1, title: "Peminjaman Mikroskop terlambat dikembalikan", desc: "Dikirim 1 jam lalu", read: false },
  ];

  const filteredList = riwayatList.filter((r) => {
    const matchSearch =
      r.nama.toLowerCase().includes(search.toLowerCase()) ||
      r.pelaku.toLowerCase().includes(search.toLowerCase());
    const matchAktivitas = aktivitasFilter === "Semua" || r.aktivitas === aktivitasFilter;
    const matchTipe = tipeFilter === "Semua" || r.tipe === tipeFilter;
    return matchSearch && matchAktivitas && matchTipe;
  });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        role="adminSarpras"
        active="riwayat"
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
                  Riwayat
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Riwayat seluruh aktivitas peminjaman, pengembalian, dan laporan sarpras.
                </p>
              </div>
            </div>

            {/* SEARCH & FILTER */}
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-4 flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama barang/ruangan atau pelaku..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <SlidersHorizontal size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select
                    value={aktivitasFilter}
                    onChange={(e) => setAktivitasFilter(e.target.value)}
                    className="pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors appearance-none"
                  >
                    {aktivitasOptions.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                <select
                  value={tipeFilter}
                  onChange={(e) => setTipeFilter(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors appearance-none"
                >
                  {tipeOptions.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* TIMELINE / LIST RIWAYAT */}
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between gap-2 px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 flex-shrink-0">
                    <History size={16} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-800 truncate">Riwayat Aktivitas</h3>
                    <p className="text-xs text-slate-400">{filteredList.length} aktivitas ditemukan</p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredList.map((r) => {
                  const AktivitasIcon = aktivitasIcon[r.aktivitas];
                  const TipeIcon = tipeIcon[r.tipe];
                  const StatusIcon = statusIcon[r.status];
                  return (
                    <div key={r.id} className="flex items-center gap-3.5 px-5 py-3.5">
                      <div className="w-9 h-9 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center flex-shrink-0">
                        <AktivitasIcon size={16} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${aktivitasStyle[r.aktivitas]}`}>
                            {r.aktivitas}
                          </span>
                          <p className="text-sm font-medium text-slate-800 truncate">{r.nama}</p>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <TipeIcon size={12} className="text-slate-400" />
                            {r.tipe}
                          </span>
                          <span>{r.pelaku}</span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} className="text-slate-400" />
                            {r.tanggal}
                          </span>
                        </div>
                      </div>

                      <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${statusStyle[r.status]}`}>
                        <StatusIcon size={11} />
                        {r.status}
                      </span>
                    </div>
                  );
                })}

                {filteredList.length === 0 && (
                  <div className="text-center py-12 text-sm text-slate-400">
                    Tidak ada aktivitas yang cocok dengan filter.
                  </div>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}