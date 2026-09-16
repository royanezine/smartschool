"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import {
  Info,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Send,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  GraduationCap,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// =========================================================
// DUMMY DATA — nanti tinggal disambungkan ke API PPDB kamu
// =========================================================

const verifikasiHarian = [
  { j: "06", a: 4, b: 2 }, { j: "08", a: 12, b: 6 }, { j: "10", a: 18, b: 14 },
  { j: "12", a: 14, b: 10 }, { j: "14", a: 20, b: 16 }, { j: "16", a: 16, b: 12 },
  { j: "18", a: 8, b: 4 }, { j: "20", a: 4, b: 2 },
];

const kelulusanMingguan = [
  { h: "Sen", v: 40 }, { h: "Sel", v: 62 }, { h: "Rab", v: 98 },
  { h: "Kam", v: 54 }, { h: "Jum", v: 86 },
];

const pendaftarHarian = [
  { label: "Sen", jumlah: 62 }, { label: "Sel", jumlah: 78 }, { label: "Rab", jumlah: 140 },
  { label: "Kam", jumlah: 96 }, { label: "Jum", jumlah: 120 }, { label: "Sab", jumlah: 54 },
  { label: "Min", jumlah: 30 },
];

const pendaftarMingguan = [
  { label: "M1", jumlah: 210 }, { label: "M2", jumlah: 340 }, { label: "M3", jumlah: 280 },
  { label: "M4", jumlah: 418 },
];

const rankingJurusan = [
  { key: "rpl", nama: "RPL", jumlah: 412, color: "#2563EB" },
  { key: "tkj", nama: "TKJ", jumlah: 356, color: "#0EA5E9" },
  { key: "multimedia", nama: "Multimedia", jumlah: 298, color: "#8B5CF6" },
  { key: "akuntansi", nama: "Akuntansi", jumlah: 182, color: "#F59E0B" },
];

const gelombangTahunan = [
  { tahun: "2023", gel1: 320, gel2: 240 },
  { tahun: "2024", gel1: 280, gel2: 340 },
  { tahun: "2025", gel1: 460, gel2: 402 },
  { tahun: "2026", gel1: 520, gel2: 486 },
];

const aktivitasTerbaru = [
  { waktu: "10:32", nama: "Andi Saputra", aksi: "mengirim pendaftaran", tipe: "daftar" },
  { waktu: "10:15", nama: "Budi Hartono", aksi: "telah diverifikasi", tipe: "verifikasi" },
  { waktu: "09:48", nama: "Citra Ayu", aksi: "dinyatakan lulus", tipe: "lulus" },
  { waktu: "09:30", nama: "Deni Firmansyah", aksi: "melakukan daftar ulang", tipe: "daftarulang" },
  { waktu: "09:12", nama: "Eka Putri", aksi: "dinyatakan tidak lulus", tipe: "tidaklulus" },
  { waktu: "08:55", nama: "Fajar Nugroho", aksi: "mengirim pendaftaran", tipe: "daftar" },
  { waktu: "08:40", nama: "Gita Lestari", aksi: "telah diverifikasi", tipe: "verifikasi" },
];

const ACTIVITY_STYLES = {
  daftar: { icon: Send, tone: "text-blue-500", bg: "bg-blue-50" },
  verifikasi: { icon: ShieldCheck, tone: "text-amber-500", bg: "bg-amber-50" },
  lulus: { icon: CheckCircle2, tone: "text-emerald-500", bg: "bg-emerald-50" },
  tidaklulus: { icon: XCircle, tone: "text-rose-500", bg: "bg-rose-50" },
  daftarulang: { icon: GraduationCap, tone: "text-violet-500", bg: "bg-violet-50" },
};

const TIME_FILTERS = ["Harian", "Mingguan"];

function ChartTooltip({ active, payload, label, unit = "" }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-[#1B2130] text-white text-[11px] px-2.5 py-1.5 rounded-md shadow-lg">
      <p className="text-slate-300 mb-0.5">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="font-mono font-semibold">{p.value} {unit}</p>
      ))}
    </div>
  );
}

export default function AdminPPDBDashboardPage() {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Harian");

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const trendData = activeFilter === "Harian" ? pendaftarHarian : pendaftarMingguan;

  const tingkatKelulusan = useMemo(() => Math.round((640 / (640 + 172)) * 100), []);

  return (
    <div className="flex h-screen w-full bg-[#EEF0F2] overflow-hidden">
      <Sidebar role="adminPPDB" active="dashboard" setActive={() => {}} collapsed={isCollapsed} setCollapsed={setIsCollapsed} />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{ name: "Admin PPDB", email: "adminppdb@smartschool.com", avatar: "PP" }}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="w-full p-4 md:p-6 lg:p-8">
            <div className="w-full space-y-5 max-w-[1320px] mx-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>PPDB</span>
                <ChevronRight size={12} />
                <span className="text-slate-600 font-medium">Dashboard</span>
              </div>

              {/* ===== KARTU RINGKASAN — BARIS 1 ===== */}
              <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Pendaftar */}
                <div className="bg-white rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400">Total Pendaftar</p>
                    <Info size={13} className="text-slate-300" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800 mt-2">1.248</p>
                  <div className="mt-3 space-y-1.5">
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      Rasio minggu ini <span className="font-semibold text-slate-600">13%</span>
                      <TrendingUp size={12} className="text-rose-500" />
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      Rasio hari ini <span className="font-semibold text-slate-600">10%</span>
                      <TrendingDown size={12} className="text-emerald-500" />
                    </p>
                  </div>
                  <div className="border-t border-slate-100 mt-4 pt-3">
                    <p className="text-xs text-slate-500 text-center">Pendaftar hari ini <span className="font-semibold text-slate-700">86</span></p>
                  </div>
                </div>

                {/* Menunggu Verifikasi */}
                <div className="bg-white rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400">Menunggu Verifikasi</p>
                    <Info size={13} className="text-slate-300" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800 mt-2">186</p>
                  <div className="h-14 mt-2 -mx-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={verifikasiHarian}>
                        <defs>
                          <linearGradient id="fillA" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#FB923C" stopOpacity={0.5} />
                            <stop offset="100%" stopColor="#FB923C" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="fillB" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2DD4BF" stopOpacity={0.5} />
                            <stop offset="100%" stopColor="#2DD4BF" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="a" stroke="#FB923C" strokeWidth={1.5} fill="url(#fillA)" />
                        <Area type="monotone" dataKey="b" stroke="#2DD4BF" strokeWidth={1.5} fill="url(#fillB)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="border-t border-slate-100 mt-3 pt-3">
                    <p className="text-xs text-slate-500 text-center">Masuk hari ini <span className="font-semibold text-slate-700">24</span></p>
                  </div>
                </div>

                {/* Berkas Terverifikasi */}
                <div className="bg-white rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400">Berkas Terverifikasi</p>
                    <Info size={13} className="text-slate-300" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800 mt-2">812</p>
                  <div className="h-14 mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={kelulusanMingguan}>
                        <Bar dataKey="v" radius={[2, 2, 0, 0]} fill="#3B82F6" barSize={12} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="border-t border-slate-100 mt-3 pt-3">
                    <p className="text-xs text-slate-500 text-center">Tingkat verifikasi <span className="font-semibold text-slate-700">65%</span></p>
                  </div>
                </div>

                {/* Tingkat Kelulusan (highlight) */}
                <div className="bg-[#F6F7F8] rounded-xl p-5 flex flex-col items-center justify-center text-center">
                  <p className="text-xs text-slate-400">Tingkat Kelulusan</p>
                  <p className="text-3xl font-bold text-slate-500 mt-3">{tingkatKelulusan}%</p>
                </div>
              </section>

              {/* ===== KARTU RINGKASAN — BARIS 2 ===== */}
              <section className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Lulus Seleksi</p>
                    <p className="text-xl font-bold text-slate-800 mt-1">640</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0">
                    <XCircle size={18} className="text-rose-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Tidak Lulus</p>
                    <p className="text-xl font-bold text-slate-800 mt-1">172</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                    <GraduationCap size={18} className="text-violet-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Sudah Daftar Ulang</p>
                    <p className="text-xl font-bold text-slate-800 mt-1">512</p>
                  </div>
                </div>
              </section>

              {/* ===== PANEL UTAMA: TREN PENDAFTAR + RANKING JURUSAN ===== */}
              <section className="bg-white rounded-xl overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4 pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-700">Grafik Pendaftar</h3>
                  <div className="flex items-center gap-5">
                    {TIME_FILTERS.map((f) => (
                      <button
                        key={f}
                        onClick={() => setActiveFilter(f)}
                        className={`text-xs transition-colors ${
                          activeFilter === f ? "text-blue-600 font-semibold" : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row">
                  {/* Chart tren */}
                  <div className="flex-1 p-5 lg:border-r border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">
                      Pendaftar per {activeFilter === "Harian" ? "Hari" : "Minggu"}
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="fillTrend" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.35} />
                              <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                          <Tooltip content={<ChartTooltip unit="pendaftar" />} cursor={{ stroke: "#CBD5E1", strokeWidth: 1 }} />
                          <Area type="monotone" dataKey="jumlah" stroke="#3B82F6" strokeWidth={2} fill="url(#fillTrend)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Ranking jurusan */}
                  <div className="w-full lg:w-72 p-5">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">Pendaftar Berdasarkan Jurusan</h3>
                    <ul className="space-y-3.5">
                      {rankingJurusan.map((j, i) => (
                        <li key={j.key} className="flex items-center gap-3">
                          <span
                            className={`w-5 h-5 flex-shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              i === 0 ? "bg-[#1B2130] text-white" : "text-slate-400"
                            }`}
                          >
                            {i + 1}
                          </span>
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: j.color }} />
                          <span className="flex-1 text-sm text-slate-600 truncate">{j.nama}</span>
                          <span className="text-sm font-semibold text-slate-700 font-mono tabular-nums">
                            {j.jumlah.toLocaleString("id-ID")}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-slate-100">
                      Diurutkan dari jumlah pendaftar terbanyak
                    </p>
                  </div>
                </div>
              </section>

              {/* ===== PENDAFTAR BERDASARKAN GELOMBANG ===== */}
              <section className="bg-white rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-700">Pendaftar Berdasarkan Gelombang</h3>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gelombangTahunan} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={4}>
                      <XAxis dataKey="tahun" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip unit="orang" />} cursor={{ fill: "#F1F5F9" }} />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        height={24}
                        iconType="circle"
                        iconSize={8}
                        formatter={(v) => <span className="text-xs text-slate-500">{v}</span>}
                      />
                      <Bar dataKey="gel1" name="Gelombang 1" fill="#BFDBFE" radius={[3, 3, 0, 0]} barSize={22} />
                      <Bar dataKey="gel2" name="Gelombang 2" fill="#3B82F6" radius={[3, 3, 0, 0]} barSize={22} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* ===== AKTIVITAS TERBARU ===== */}
              <section className="bg-white rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Aktivitas Terbaru</h3>
                <ul className="divide-y divide-slate-50">
                  {aktivitasTerbaru.map((a, idx) => {
                    const style = ACTIVITY_STYLES[a.tipe];
                    const Icon = style.icon;
                    return (
                      <li key={idx} className="flex items-center gap-3 py-2.5">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${style.bg}`}>
                          <Icon size={13} className={style.tone} />
                        </div>
                        <p className="flex-1 text-sm text-slate-600 truncate">
                          <span className="font-medium text-slate-700">{a.nama}</span> {a.aksi}
                        </p>
                        <span className="text-xs text-slate-400 font-mono flex-shrink-0">{a.waktu}</span>
                      </li>
                    );
                  })}
                </ul>
              </section>

              <footer className="text-center text-[11px] text-slate-400 py-3">
                © 2026 SmartSchool &middot; Dashboard Admin PPDB &middot; All rights reserved
              </footer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}