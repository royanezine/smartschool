"use client";

import { useState, useMemo } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
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
  CalendarCheck,
  Trophy,
  BarChart3,
  ChevronRight,
  Minus,
} from "lucide-react";

// ===== DUMMY DATA =====
// Catatan: ganti dengan data asli dari API/DB begitu tersedia.
const JENJANG_OPTIONS = ["Semua Jenjang", "SD", "SMP", "SMA"];
const TAHUN_AJARAN_OPTIONS = ["2025/2026 - Genap", "2025/2026 - Ganjil", "2024/2025 - Genap"];
const STATUS_OPTIONS = ["Semua Status", "Baik", "Perlu Perhatian", "Kritis"];

const dataSekolah = [
  {
    id: 1,
    nama: "SD Smart School 1",
    jenjang: "SD",
    rataRataNilai: 84,
    trend: "up",
    perubahan: 2.1,
    kehadiran: 96,
    mapelLemah: null,
    siswaPerluPerhatian: 6,
    totalSiswa: 612,
    status: "Baik",
  },
  {
    id: 2,
    nama: "SD Smart School 2",
    jenjang: "SD",
    rataRataNilai: 79,
    trend: "up",
    perubahan: 1.4,
    kehadiran: 93,
    mapelLemah: null,
    siswaPerluPerhatian: 11,
    totalSiswa: 548,
    status: "Baik",
  },
  {
    id: 3,
    nama: "SMP Smart School 1",
    jenjang: "SMP",
    rataRataNilai: 76,
    trend: "down",
    perubahan: -0.8,
    kehadiran: 90,
    mapelLemah: "Matematika",
    siswaPerluPerhatian: 24,
    totalSiswa: 734,
    status: "Baik",
  },
  {
    id: 4,
    nama: "SMP Smart School 2",
    jenjang: "SMP",
    rataRataNilai: 68,
    trend: "down",
    perubahan: -3.2,
    kehadiran: 82,
    mapelLemah: "IPA",
    siswaPerluPerhatian: 47,
    totalSiswa: 689,
    status: "Perlu Perhatian",
  },
  {
    id: 5,
    nama: "SMA Smart School 1",
    jenjang: "SMA",
    rataRataNilai: 81,
    trend: "up",
    perubahan: 0.6,
    kehadiran: 91,
    mapelLemah: null,
    siswaPerluPerhatian: 18,
    totalSiswa: 812,
    status: "Baik",
  },
  {
    id: 6,
    nama: "SMA Smart School 2",
    jenjang: "SMA",
    rataRataNilai: 59,
    trend: "down",
    perubahan: -4.5,
    kehadiran: 74,
    mapelLemah: "Matematika",
    siswaPerluPerhatian: 63,
    totalSiswa: 917,
    status: "Kritis",
  },
];

const mapelOverview = [
  { mapel: "Matematika", rataRata: 71, target: 75 },
  { mapel: "Bahasa Indonesia", rataRata: 79, target: 75 },
  { mapel: "IPA", rataRata: 70, target: 75 },
  { mapel: "IPS", rataRata: 76, target: 75 },
  { mapel: "Bahasa Inggris", rataRata: 74, target: 75 },
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

function barColor(value, kind) {
  if (kind === "kehadiran") {
    if (value >= 90) return "bg-emerald-500";
    if (value >= 80) return "bg-amber-500";
    return "bg-rose-500";
  }
  if (value >= 75) return "bg-emerald-500";
  if (value >= 65) return "bg-amber-500";
  return "bg-rose-500";
}

// ===== MAIN COMPONENT =====

export default function MonitoringAkademikPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [jenjang, setJenjang] = useState(JENJANG_OPTIONS[0]);
  const [tahunAjaran, setTahunAjaran] = useState(TAHUN_AJARAN_OPTIONS[0]);
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
      .sort((a, b) => b.rataRataNilai - a.rataRataNilai);
  }, [jenjang, status, search]);

  const summary = useMemo(() => {
    const total = filteredSekolah.length;
    const rataRataNilai = total
      ? Math.round(
          filteredSekolah.reduce((a, s) => a + s.rataRataNilai, 0) / total
        )
      : 0;
    const rataRataKehadiran = total
      ? Math.round(
          filteredSekolah.reduce((a, s) => a + s.kehadiran, 0) / total
        )
      : 0;
    const perluPerhatian = filteredSekolah.filter(
      (s) => s.status === "Perlu Perhatian" || s.status === "Kritis"
    ).length;
    const totalSiswaPerluPerhatian = filteredSekolah.reduce(
      (a, s) => a + s.siswaPerluPerhatian,
      0
    );
    return { total, rataRataNilai, rataRataKehadiran, perluPerhatian, totalSiswaPerluPerhatian };
  }, [filteredSekolah]);

  const notifications = [
    { id: 1, title: "Rata-rata nilai SMA Smart School 2 turun 4.5 poin", desc: "Dikirim 1 jam lalu", read: false },
    { id: 2, title: "2 unit sekolah masuk status Perlu Perhatian/Kritis", desc: "Dikirim 4 jam lalu", read: false },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        active="monitoring-akademik"
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
                <p className="text-xs font-medium text-slate-400 mb-1">Akademik</p>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-500 text-white shadow-sm flex-shrink-0">
                    <ClipboardCheck size={18} />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 truncate">
                    Monitoring Akademik
                  </h1>
                </div>
                <p className="text-sm text-slate-500 mt-1 ml-[42px] flex items-center gap-1.5">
                  <Sparkles size={14} className="text-slate-400 flex-shrink-0" />
                  <span className="truncate">Pantau performa akademik seluruh unit sekolah di lingkungan yayasan.</span>
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

                <div className="relative flex-1 min-w-[190px]">
                  <select
                    value={tahunAjaran}
                    onChange={(e) => setTahunAjaran(e.target.value)}
                    className="w-full appearance-none pl-3 pr-9 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    {TAHUN_AJARAN_OPTIONS.map((t) => (
                      <option key={t} value={t}>{t}</option>
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
                  <BarChart3 size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">Rata-rata Nilai Yayasan</p>
                  <p className="text-lg font-bold text-slate-800">{summary.rataRataNilai}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg border bg-emerald-50 text-emerald-600 border-emerald-200 flex-shrink-0">
                  <CalendarCheck size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">Rata-rata Kehadiran</p>
                  <p className="text-lg font-bold text-slate-800">{summary.rataRataKehadiran}%</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg border bg-rose-50 text-rose-600 border-rose-200 flex-shrink-0">
                  <AlertTriangle size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">Unit Perlu Perhatian</p>
                  <p className="text-lg font-bold text-slate-800">{summary.perluPerhatian}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg border bg-amber-50 text-amber-600 border-amber-200 flex-shrink-0">
                  <School size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">Siswa Perlu Perhatian</p>
                  <p className="text-lg font-bold text-slate-800">{summary.totalSiswaPerluPerhatian}</p>
                </div>
              </div>
            </div>

            {/* RATA-RATA PER MAPEL (SELURUH YAYASAN) */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <BarChart3 size={15} className="text-slate-400" />
                  Rata-rata Nilai per Mata Pelajaran — Seluruh Yayasan
                </h3>
                <span className="text-xs text-slate-400">Target KKM: 75</span>
              </div>
              <div className="space-y-3.5">
                {mapelOverview.map((m) => {
                  const belowTarget = m.rataRata < m.target;
                  return (
                    <div key={m.mapel}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-600">{m.mapel}</span>
                        <span
                          className={`text-xs font-semibold ${
                            belowTarget ? "text-rose-500" : "text-emerald-600"
                          }`}
                        >
                          {m.rataRata}
                        </span>
                      </div>
                      <div className="relative h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${belowTarget ? "bg-rose-400" : "bg-emerald-500"}`}
                          style={{ width: `${m.rataRata}%` }}
                        />
                        <div
                          className="absolute top-0 h-full w-[2px] bg-slate-400"
                          style={{ left: `${m.target}%` }}
                          title={`Target KKM ${m.target}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PERINGKAT UNIT SEKOLAH */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-700">Peringkat Performa Unit Sekolah</h3>
                <span className="text-xs text-slate-400">{filteredSekolah.length} unit</span>
              </div>

              {filteredSekolah.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-10 text-center">
                  <School size={28} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-400">Tidak ada unit sekolah yang cocok dengan filter.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                  <div className="divide-y divide-slate-100">
                    {filteredSekolah.map((s, idx) => (
                      <div
                        key={s.id}
                        className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 sm:p-5 hover:bg-slate-50/60 transition-colors"
                      >
                        {/* Peringkat + Identitas */}
                        <div className="flex items-center gap-3 lg:w-[240px] flex-shrink-0 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              idx === 0
                                ? "bg-amber-100 text-amber-600"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {idx === 0 ? <Trophy size={14} /> : idx + 1}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{s.nama}</p>
                            <p className="text-xs text-slate-400">{s.jenjang} &middot; {s.totalSiswa.toLocaleString("id-ID")} siswa</p>
                          </div>
                        </div>

                        {/* Nilai */}
                        <div className="flex-1 min-w-[140px]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Rata-rata Nilai</span>
                            <span className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                              {s.rataRataNilai}
                              {s.trend === "up" ? (
                                <TrendingUp size={12} className="text-emerald-500" />
                              ) : s.trend === "down" ? (
                                <TrendingDown size={12} className="text-rose-500" />
                              ) : (
                                <Minus size={12} className="text-slate-400" />
                              )}
                              <span className={s.perubahan >= 0 ? "text-emerald-500" : "text-rose-500"}>
                                ({s.perubahan >= 0 ? "+" : ""}{s.perubahan})
                              </span>
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${barColor(s.rataRataNilai, "nilai")}`}
                              style={{ width: `${s.rataRataNilai}%` }}
                            />
                          </div>
                        </div>

                        {/* Kehadiran */}
                        <div className="flex-1 min-w-[140px]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Kehadiran</span>
                            <span className="text-xs font-semibold text-slate-700">{s.kehadiran}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${barColor(s.kehadiran, "kehadiran")}`}
                              style={{ width: `${s.kehadiran}%` }}
                            />
                          </div>
                        </div>

                        {/* Siswa perlu perhatian */}
                        <div className="flex-shrink-0 lg:w-[130px]">
                          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">Perlu Perhatian</p>
                          <p className="text-xs font-semibold text-slate-700">{s.siswaPerluPerhatian} siswa</p>
                        </div>

                        {/* Status */}
                        <div className="flex items-center justify-between gap-3 lg:w-[200px] flex-shrink-0">
                          <div className="min-w-0">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full border ${statusStyle(s.status)}`}
                            >
                              {s.status}
                            </span>
                            {s.mapelLemah && (
                              <p className="text-[11px] text-slate-400 mt-1 truncate">
                                Terlemah: {s.mapelLemah}
                              </p>
                            )}
                          </div>
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