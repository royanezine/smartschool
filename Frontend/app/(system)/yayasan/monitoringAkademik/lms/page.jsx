"use client";

import { useState, useMemo } from "react";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import {
  Layers,
  Search,
  ChevronDown,
  Sparkles,
  Download,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  School,
  Users,
  ChevronRight,
  Minus,
  CalendarDays,
  Laptop,
  Smartphone,
  Tablet,
  FileText,
  Video,
  ClipboardList,
  Trophy,
  Flame,
  Eye,
  UploadCloud,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ===== DUMMY DATA =====
// Catatan: ganti dengan data asli dari API/DB begitu tersedia.
const JENJANG_OPTIONS = ["Semua Jenjang", "SD", "SMP", "SMA"];
const PERIODE_OPTIONS = ["Agustus 2026", "Juli 2026", "Juni 2026"];
const STATUS_OPTIONS = ["Semua Status", "Baik", "Perlu Perhatian", "Kritis"];

const trenMingguan = [
  { minggu: "M1", pengguna: 4120, targetAdopsi: 4500 },
  { minggu: "M2", pengguna: 4390, targetAdopsi: 4500 },
  { minggu: "M3", pengguna: 4260, targetAdopsi: 4500 },
  { minggu: "M4", pengguna: 4580, targetAdopsi: 4500 },
  { minggu: "M5", pengguna: 4710, targetAdopsi: 4500 },
  { minggu: "M6", pengguna: 4650, targetAdopsi: 4500 },
  { minggu: "M7", pengguna: 4830, targetAdopsi: 4500 },
  { minggu: "M8", pengguna: 5020, targetAdopsi: 4500 },
];

const polaMingguan = [
  { hari: "Sen", sesi: 1120 },
  { hari: "Sel", sesi: 1340 },
  { hari: "Rab", sesi: 1280 },
  { hari: "Kam", sesi: 1190 },
  { hari: "Jum", sesi: 890 },
  { hari: "Sab", sesi: 410 },
  { hari: "Min", sesi: 260 },
];

const perangkat = [
  { name: "Desktop", value: 54, color: "#3b82f6" },
  { name: "Mobile", value: 38, color: "#8b5cf6" },
  { name: "Tablet", value: 8, color: "#f59e0b" },
];

const dataSekolah = [
  {
    id: 1,
    nama: "SD Smart School 1",
    jenjang: "SD",
    adopsi: 92,
    loginPerMinggu: 4.1,
    tugasTepatWaktu: 88,
    engagement: 90,
    trend: "up",
    perubahan: 3.2,
    status: "Baik",
  },
  {
    id: 2,
    nama: "SD Smart School 2",
    jenjang: "SD",
    adopsi: 85,
    loginPerMinggu: 3.6,
    tugasTepatWaktu: 81,
    engagement: 83,
    trend: "up",
    perubahan: 1.5,
    status: "Baik",
  },
  {
    id: 3,
    nama: "SMP Smart School 1",
    jenjang: "SMP",
    adopsi: 79,
    loginPerMinggu: 3.1,
    tugasTepatWaktu: 74,
    engagement: 77,
    trend: "down",
    perubahan: -1.1,
    status: "Baik",
  },
  {
    id: 4,
    nama: "SMP Smart School 2",
    jenjang: "SMP",
    adopsi: 58,
    loginPerMinggu: 1.8,
    tugasTepatWaktu: 52,
    engagement: 55,
    trend: "down",
    perubahan: -6.4,
    status: "Perlu Perhatian",
  },
  {
    id: 5,
    nama: "SMA Smart School 1",
    jenjang: "SMA",
    adopsi: 81,
    loginPerMinggu: 3.3,
    tugasTepatWaktu: 79,
    engagement: 80,
    trend: "up",
    perubahan: 2.0,
    status: "Baik",
  },
  {
    id: 6,
    nama: "SMA Smart School 2",
    jenjang: "SMA",
    adopsi: 41,
    loginPerMinggu: 1.2,
    tugasTepatWaktu: 38,
    engagement: 40,
    trend: "down",
    perubahan: -8.7,
    status: "Kritis",
  },
];

const topKonten = [
  { judul: "Video: Sistem Pencernaan Manusia", mapel: "IPA", tipe: "video", dilihat: 3210 },
  { judul: "Modul: Aljabar Linear Dasar", mapel: "Matematika", tipe: "modul", dilihat: 2870 },
  { judul: "Kuis: Teks Eksposisi", mapel: "Bahasa Indonesia", tipe: "kuis", dilihat: 2540 },
  { judul: "Video: Revolusi Industri 4.0", mapel: "IPS", tipe: "video", dilihat: 2115 },
  { judul: "Modul: Simple Past Tense", mapel: "Bahasa Inggris", tipe: "modul", dilihat: 1980 },
];

const topGuru = [
  { nama: "Dra. Ratna Widiastuti", sekolah: "SD Smart School 1", konten: 46, avatar: "R" },
  { nama: "H. Ahmad Fauzi, S.Pd.", sekolah: "SMP Smart School 1", konten: 39, avatar: "A" },
  { nama: "Dr. Indah Permatasari", sekolah: "SMA Smart School 2", konten: 34, avatar: "I" },
  { nama: "Dra. Sri Wahyuni", sekolah: "SMP Smart School 2", konten: 28, avatar: "S" },
];

const kontenIcon = { video: Video, modul: FileText, kuis: ClipboardList };

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
  if (value >= 80) return "bg-emerald-500";
  if (value >= 60) return "bg-amber-500";
  return "bg-rose-500";
}

// ===== MAIN COMPONENT =====

export default function MonitoringLmsPage() {
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
      .sort((a, b) => b.engagement - a.engagement);
  }, [jenjang, status, search]);

  const summary = useMemo(() => {
    const total = filteredSekolah.length;
    const adopsi = total
      ? Math.round(filteredSekolah.reduce((a, s) => a + s.adopsi, 0) / total)
      : 0;
    const loginPerMinggu = total
      ? (
          filteredSekolah.reduce((a, s) => a + s.loginPerMinggu, 0) / total
        ).toFixed(1)
      : "0.0";
    const tugasTepatWaktu = total
      ? Math.round(
          filteredSekolah.reduce((a, s) => a + s.tugasTepatWaktu, 0) / total
        )
      : 0;
    const perluPerhatian = filteredSekolah.filter(
      (s) => s.status === "Perlu Perhatian" || s.status === "Kritis"
    ).length;
    return { total, adopsi, loginPerMinggu, tugasTepatWaktu, perluPerhatian };
  }, [filteredSekolah]);

  const penggunaMingguIni = trenMingguan[trenMingguan.length - 1].pengguna;
  const penggunaMingguLalu = trenMingguan[trenMingguan.length - 2].pengguna;
  const deltaPengguna = (
    ((penggunaMingguIni - penggunaMingguLalu) / penggunaMingguLalu) *
    100
  ).toFixed(1);

  const notifications = [
    { id: 1, title: "Adopsi LMS SMA Smart School 2 turun 8.7%", desc: "Dikirim 1 jam lalu", read: false },
    { id: 2, title: "Pengguna aktif mingguan tembus 5.020", desc: "Dikirim 3 jam lalu", read: false },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        active="monitoringLms"
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
                    <Layers size={18} />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 truncate">
                    LMS
                  </h1>
                </div>
                <p className="text-sm text-slate-500 mt-1 ml-[42px] flex items-center gap-1.5">
                  <Sparkles size={14} className="text-slate-400 flex-shrink-0" />
                  <span className="truncate">Pantau adopsi, aktivitas, dan konten pembelajaran digital di seluruh unit sekolah.</span>
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
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">Tingkat Adopsi LMS</p>
                  <p className="text-lg font-bold text-slate-800">{summary.adopsi}%</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg border bg-purple-50 text-purple-600 border-purple-200 flex-shrink-0">
                  <CalendarDays size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">Login / Siswa / Minggu</p>
                  <p className="text-lg font-bold text-slate-800">{summary.loginPerMinggu}x</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg border bg-emerald-50 text-emerald-600 border-emerald-200 flex-shrink-0">
                  <ClipboardList size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">Tugas Tepat Waktu</p>
                  <p className="text-lg font-bold text-slate-800">{summary.tugasTepatWaktu}%</p>
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
            </div>

            {/* TREN ADOPSI + POLA AKTIVITAS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Tren pengguna aktif mingguan */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <TrendingUp size={15} className="text-slate-400" />
                      Tren Pengguna Aktif Mingguan
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">8 minggu terakhir &middot; seluruh unit sekolah</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-bold text-slate-800">{penggunaMingguIni.toLocaleString("id-ID")}</p>
                    <p className={`text-xs font-medium flex items-center justify-end gap-1 ${deltaPengguna >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {deltaPengguna >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {deltaPengguna >= 0 ? "+" : ""}{deltaPengguna}% vs minggu lalu
                    </p>
                  </div>
                </div>
                <div className="h-56 mt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trenMingguan} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPengguna" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="minggu" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={40} />
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                        labelStyle={{ color: "#334155", fontWeight: 600 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="pengguna"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="url(#colorPengguna)"
                        name="Pengguna aktif"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Distribusi perangkat */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5 flex flex-col">
                <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-1">
                  <Laptop size={15} className="text-slate-400" />
                  Distribusi Perangkat
                </h3>
                <p className="text-xs text-slate-400 mb-2">Akses LMS bulan ini</p>
                <div className="h-40 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={perangkat}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={42}
                        outerRadius={62}
                        paddingAngle={3}
                        strokeWidth={0}
                      >
                        {perangkat.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-1">
                  {perangkat.map((p) => {
                    const Icon = p.name === "Desktop" ? Laptop : p.name === "Mobile" ? Smartphone : Tablet;
                    return (
                      <div key={p.name} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <Icon size={12} style={{ color: p.color }} />
                          {p.name}
                        </span>
                        <span className="font-semibold text-slate-700">{p.value}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* POLA AKTIVITAS MINGGUAN */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-1">
                <Flame size={15} className="text-slate-400" />
                Pola Aktivitas per Hari
              </h3>
              <p className="text-xs text-slate-400 mb-3">Rata-rata jumlah sesi login, 4 minggu terakhir</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={polaMingguan} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="hari" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                      cursor={{ fill: "#f8fafc" }}
                    />
                    <Bar dataKey="sesi" name="Jumlah sesi" radius={[6, 6, 0, 0]}>
                      {polaMingguan.map((entry, idx) => (
                        <Cell key={idx} fill={idx === 5 || idx === 6 ? "#cbd5e1" : "#3b82f6"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* KONTEN TERPOPULER + GURU TERAKTIF */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
                  <Eye size={15} className="text-slate-400" />
                  Konten Paling Banyak Diakses
                </h3>
                <div className="space-y-1">
                  {topKonten.map((k, idx) => {
                    const Icon = kontenIcon[k.tipe] || FileText;
                    return (
                      <div
                        key={k.judul}
                        className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0"
                      >
                        <span className="text-xs font-semibold text-slate-300 w-4 flex-shrink-0">{idx + 1}</span>
                        <div className="p-1.5 rounded-md bg-blue-50 text-blue-600 flex-shrink-0">
                          <Icon size={13} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-slate-700 truncate">{k.judul}</p>
                          <p className="text-[11px] text-slate-400">{k.mapel}</p>
                        </div>
                        <span className="text-xs font-semibold text-slate-600 flex-shrink-0">
                          {k.dilihat.toLocaleString("id-ID")}x
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
                  <UploadCloud size={15} className="text-slate-400" />
                  Guru Paling Aktif Mengunggah Konten
                </h3>
                <div className="space-y-1">
                  {topGuru.map((g, idx) => (
                    <div
                      key={g.nama}
                      className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          idx === 0 ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {idx === 0 ? <Trophy size={13} /> : g.avatar}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-slate-700 truncate">{g.nama}</p>
                        <p className="text-[11px] text-slate-400 truncate">{g.sekolah}</p>
                      </div>
                      <span className="text-xs font-semibold text-slate-600 flex-shrink-0">
                        {g.konten} konten
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ENGAGEMENT PER UNIT SEKOLAH */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-700">Engagement LMS per Unit Sekolah</h3>
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

                        {/* Adopsi */}
                        <div className="flex-1 min-w-[130px]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Adopsi</span>
                            <span className="text-xs font-semibold text-slate-700">{s.adopsi}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div className={`h-full rounded-full ${barColor(s.adopsi)}`} style={{ width: `${s.adopsi}%` }} />
                          </div>
                        </div>

                        {/* Engagement score */}
                        <div className="flex-1 min-w-[150px]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">Engagement</span>
                            <span className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                              {s.engagement}
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
                            <div className={`h-full rounded-full ${barColor(s.engagement)}`} style={{ width: `${s.engagement}%` }} />
                          </div>
                        </div>

                        {/* Metrik pendukung */}
                        <div className="flex-shrink-0 lg:w-[220px] flex items-center gap-4">
                          <div>
                            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">Login/Minggu</p>
                            <p className="text-xs font-semibold text-slate-700">{s.loginPerMinggu}x</p>
                          </div>
                          <div>
                            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-1">Tugas Tepat Waktu</p>
                            <p className="text-xs font-semibold text-slate-700">{s.tugasTepatWaktu}%</p>
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