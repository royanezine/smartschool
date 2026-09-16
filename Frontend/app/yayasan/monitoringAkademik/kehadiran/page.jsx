"use client";

import { useState, useMemo } from "react";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import {
  ClipboardCheck,
  Search,
  ChevronDown,
  Sparkles,
  Download,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  School,
  Users,
  GraduationCap,
  ChevronRight,
  Minus,
  CalendarDays,
} from "lucide-react";

// ===== DUMMY DATA =====
// Catatan: ganti dengan data asli dari API/DB begitu tersedia.
const JENJANG_OPTIONS = ["Semua Jenjang", "SD", "SMP", "SMA"];
const PERIODE_OPTIONS = ["Agustus 2026", "Juli 2026", "Juni 2026"];
const STATUS_OPTIONS = ["Semua Status", "Baik", "Perlu Perhatian", "Kritis"];

const dataSekolah = [
  {
    id: 1,
    nama: "SD Smart School 1",
    jenjang: "SD",
    kehadiranSiswa: 97,
    kehadiranGuru: 99,
    trend: "up",
    perubahan: 0.8,
    totalAlpa: 14,
    totalSakitIzin: 62,
    totalTerlambat: 21,
    status: "Baik",
  },
  {
    id: 2,
    nama: "SD Smart School 2",
    jenjang: "SD",
    kehadiranSiswa: 94,
    kehadiranGuru: 97,
    trend: "up",
    perubahan: 0.3,
    totalAlpa: 22,
    totalSakitIzin: 58,
    totalTerlambat: 17,
    status: "Baik",
  },
  {
    id: 3,
    nama: "SMP Smart School 1",
    jenjang: "SMP",
    kehadiranSiswa: 90,
    kehadiranGuru: 95,
    trend: "down",
    perubahan: -0.6,
    totalAlpa: 41,
    totalSakitIzin: 74,
    totalTerlambat: 33,
    status: "Baik",
  },
  {
    id: 4,
    nama: "SMP Smart School 2",
    jenjang: "SMP",
    kehadiranSiswa: 81,
    kehadiranGuru: 91,
    trend: "down",
    perubahan: -3.4,
    totalAlpa: 96,
    totalSakitIzin: 88,
    totalTerlambat: 57,
    status: "Perlu Perhatian",
  },
  {
    id: 5,
    nama: "SMA Smart School 1",
    jenjang: "SMA",
    kehadiranSiswa: 92,
    kehadiranGuru: 96,
    trend: "up",
    perubahan: 1.1,
    totalAlpa: 38,
    totalSakitIzin: 65,
    totalTerlambat: 29,
    status: "Baik",
  },
  {
    id: 6,
    nama: "SMA Smart School 2",
    jenjang: "SMA",
    kehadiranSiswa: 73,
    kehadiranGuru: 88,
    trend: "down",
    perubahan: -5.2,
    totalAlpa: 142,
    totalSakitIzin: 96,
    totalTerlambat: 84,
    status: "Kritis",
  },
];

function statusStyle(status) {
  switch (status) {
    case "Baik":
      return "bg-emerald-50 text-emerald-600 border-emerald-200";
    case "Perlu Perhatian":
      return "bg-amber-50 text-amber-600 border-amber-200";
    case "Kritis":
      return "bg-rose-50 text-rose-600 border-rose-200";
    default:
      return "bg-slate-100 text-slate-500 border-slate-200";
  }
}

function barColor(value) {
  if (value >= 90) return "bg-emerald-500";
  if (value >= 80) return "bg-amber-500";
  return "bg-rose-500";
}

// ===== MAIN COMPONENT =====

export default function MonitoringKehadiranPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [jenjang, setJenjang] = useState(JENJANG_OPTIONS[0]);
  const [periode, setPeriode] = useState(PERIODE_OPTIONS[0]);
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);
  const [search, setSearch] = useState("");

  const filteredSekolah = useMemo(() => {
    return dataSekolah
      .filter((s) => {
        const matchJenjang = jenjang === "Semua Jenjang" || s.jenjang === jenjang;
        const matchStatus = status === "Semua Status" || s.status === status;
        const matchSearch =
          !search.trim() || s.nama.toLowerCase().includes(search.toLowerCase());
        return matchJenjang && matchStatus && matchSearch;
      })
      .sort((a, b) => a.kehadiranSiswa - b.kehadiranSiswa);
  }, [jenjang, status, search]);

  const summary = useMemo(() => {
    const total = filteredSekolah.length;
    const rataRataSiswa = total
      ? Math.round(
          filteredSekolah.reduce((a, s) => a + s.kehadiranSiswa, 0) / total
        )
      : 0;
    const rataRataGuru = total
      ? Math.round(
          filteredSekolah.reduce((a, s) => a + s.kehadiranGuru, 0) / total
        )
      : 0;
    const totalAlpa = filteredSekolah.reduce((a, s) => a + s.totalAlpa, 0);
    const perluPerhatian = filteredSekolah.filter(
      (s) => s.status === "Perlu Perhatian" || s.status === "Kritis"
    ).length;
    return { total, rataRataSiswa, rataRataGuru, totalAlpa, perluPerhatian };
  }, [filteredSekolah]);

  const notifications = [
    { id: 1, title: "Kehadiran siswa SMA Smart School 2 turun 5.2%", desc: "Dikirim 2 jam lalu", read: false },
    { id: 2, title: "142 alpa tercatat bulan ini di SMA Smart School 2", desc: "Dikirim 5 jam lalu", read: false },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        active="monitoringKehadiran"
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
                <p className="text-xs font-medium text-slate-400 mb-1">Monitoring Akademik</p>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-500 text-white shadow-sm flex-shrink-0">
                    <ClipboardCheck size={18} />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 truncate">
                    Kehadiran
                  </h1>
                </div>
                <p className="text-sm text-slate-500 mt-1 ml-[42px] flex items-center gap-1.5">
                  <Sparkles size={14} className="text-slate-400 flex-shrink-0" />
                  <span className="truncate">Pantau tingkat kehadiran siswa dan guru di seluruh unit sekolah.</span>
                </p>
              </div>

              <button className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors shadow-sm whitespace-nowrap flex-shrink-0">
                <Download size={16} />
                Unduh Laporan
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
                    placeholder="Cari nama sekolah..."
                    className="w-full pl-9 pr-3 py-2.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="relative flex-1 min-w-[150px]">
                  <select
                    value={jenjang}
                    onChange={(e) => setJenjang(e.target.value)}
                    className="w-full appearance-none pl-3 pr-9 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    {JENJANG_OPTIONS.map((j) => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                <div className="relative flex-1 min-w-[170px]">
                  <select
                    value={periode}
                    onChange={(e) => setPeriode(e.target.value)}
                    className="w-full appearance-none pl-3 pr-9 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    {PERIODE_OPTIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                <div className="relative flex-1 min-w-[160px]">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full appearance-none pl-3 pr-9 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
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
                  <Users size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">Kehadiran Siswa</p>
                  <p className="text-lg font-bold text-slate-800">{summary.rataRataSiswa}%</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg border bg-purple-50 text-purple-600 border-purple-200 flex-shrink-0">
                  <GraduationCap size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">Kehadiran Guru</p>
                  <p className="text-lg font-bold text-slate-800">{summary.rataRataGuru}%</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg border bg-rose-50 text-rose-600 border-rose-200 flex-shrink-0">
                  <AlertTriangle size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">Total Alpa Bulan Ini</p>
                  <p className="text-lg font-bold text-slate-800">{summary.totalAlpa}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg border bg-amber-50 text-amber-600 border-amber-200 flex-shrink-0">
                  <School size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">Unit Perlu Perhatian</p>
                  <p className="text-lg font-bold text-slate-800">{summary.perluPerhatian}</p>
                </div>
              </div>
            </div>

            {/* KEHADIRAN PER UNIT SEKOLAH */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-700">Kehadiran per Unit Sekolah</h3>
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <CalendarDays size={12} />
                  {periode} &middot; {filteredSekolah.length} unit
                </span>
              </div>

              {filteredSekolah.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-10 text-center">
                  <School size={28} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-400">Tidak ada unit sekolah yang cocok dengan filter.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                  <div className="divide-y divide-slate-100">
                    {filteredSekolah.map((s) => (
                      <div
                        key={s.id}
                        className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 sm:p-5 hover:bg-slate-50/60 transition-colors"
                      >
                        {/* Identitas */}
                        <div className="flex items-center gap-3 lg:w-[220px] flex-shrink-0 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
                            <School size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{s.nama}</p>
                            <p className="text-xs text-slate-400">{s.jenjang}</p>
                          </div>
                        </div>

                        {/* Kehadiran Siswa */}
                        <div className="flex-1 min-w-[150px]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Kehadiran Siswa</span>
                            <span className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                              {s.kehadiranSiswa}%
                              {s.trend === "up" ? (
                                <TrendingUp size={12} className="text-emerald-500" />
                              ) : s.trend === "down" ? (
                                <TrendingDown size={12} className="text-rose-500" />
                              ) : (
                                <Minus size={12} className="text-slate-400" />
                              )}
                              <span className={s.perubahan >= 0 ? "text-emerald-500" : "text-rose-500"}>
                                ({s.perubahan >= 0 ? "+" : ""}{s.perubahan}%)
                              </span>
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${barColor(s.kehadiranSiswa)}`}
                              style={{ width: `${s.kehadiranSiswa}%` }}
                            />
                          </div>
                        </div>

                        {/* Kehadiran Guru */}
                        <div className="flex-1 min-w-[150px]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Kehadiran Guru</span>
                            <span className="text-xs font-semibold text-slate-700">{s.kehadiranGuru}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${barColor(s.kehadiranGuru)}`}
                              style={{ width: `${s.kehadiranGuru}%` }}
                            />
                          </div>
                        </div>

                        {/* Rincian ketidakhadiran */}
                        <div className="flex-shrink-0 lg:w-[220px] flex items-center gap-4">
                          <div>
                            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">Alpa</p>
                            <p className="text-xs font-semibold text-rose-600">{s.totalAlpa}</p>
                          </div>
                          <div>
                            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">Sakit/Izin</p>
                            <p className="text-xs font-semibold text-slate-700">{s.totalSakitIzin}</p>
                          </div>
                          <div>
                            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">Terlambat</p>
                            <p className="text-xs font-semibold text-slate-700">{s.totalTerlambat}</p>
                          </div>
                        </div>

                        {/* Status */}
                        <div className="flex items-center justify-between gap-3 lg:w-[150px] flex-shrink-0">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full border ${statusStyle(s.status)}`}
                          >
                            {s.status}
                          </span>
                          <button className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors flex-shrink-0">
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}