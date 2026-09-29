"use client";

import { useState, useMemo } from "react";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import {
  BookOpen,
  Search,
  ChevronDown,
  ChevronLeft,
  Sparkles,
  Download,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";

// ===== DUMMY DATA =====
// Catatan: ganti dengan data asli dari API/DB begitu tersedia.
const SEMESTER_OPTIONS = ["Ganjil 2025/2026", "Genap 2024/2025", "Ganjil 2024/2025"];
const JENJANG_OPTIONS = ["Semua Jenjang", "SD", "SMP", "SMA"];

const KKM = 75;

const unitAkademik = [
  { id: 1, nama: "SD Smart School 1", jenjang: "SD", siswa: 612, rataNilai: 82.4, kehadiran: 97, tuntas: 588 },
  { id: 2, nama: "SD Smart School 2", jenjang: "SD", siswa: 548, rataNilai: 78.1, kehadiran: 95, tuntas: 501 },
  { id: 3, nama: "SMP Smart School 1", jenjang: "SMP", siswa: 734, rataNilai: 80.6, kehadiran: 96, tuntas: 690 },
  { id: 4, nama: "SMP Smart School 2", jenjang: "SMP", siswa: 689, rataNilai: 74.9, kehadiran: 94, tuntas: 601 },
  { id: 5, nama: "SMA Smart School 1", jenjang: "SMA", siswa: 812, rataNilai: 85.2, kehadiran: 98, tuntas: 779 },
  { id: 6, nama: "SMA Smart School 2", jenjang: "SMA", siswa: 917, rataNilai: 81.7, kehadiran: 96, tuntas: 862 },
];

const round1 = (n) => Math.round(n * 10) / 10;

// ===== MAIN COMPONENT =====

export default function LaporanAkademikPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [semester, setSemester] = useState(SEMESTER_OPTIONS[0]);
  const [jenjang, setJenjang] = useState(JENJANG_OPTIONS[0]);
  const [search, setSearch] = useState("");

  const filteredUnits = useMemo(() => {
    return unitAkademik.filter((u) => {
      const matchJenjang = jenjang === "Semua Jenjang" || u.jenjang === jenjang;
      const matchSearch = !search.trim() || u.nama.toLowerCase().includes(search.toLowerCase());
      return matchJenjang && matchSearch;
    });
  }, [jenjang, search]);

  const summary = useMemo(() => {
    if (filteredUnits.length === 0) {
      return { rataNilai: null, rataKehadiran: null, totalSiswa: 0, totalTuntas: 0 };
    }
    const totalSiswa = filteredUnits.reduce((a, u) => a + u.siswa, 0);
    const totalTuntas = filteredUnits.reduce((a, u) => a + u.tuntas, 0);
    const rataNilai = round1(filteredUnits.reduce((a, u) => a + u.rataNilai, 0) / filteredUnits.length);
    const rataKehadiran = round1(filteredUnits.reduce((a, u) => a + u.kehadiran, 0) / filteredUnits.length);
    return { rataNilai, rataKehadiran, totalSiswa, totalTuntas };
  }, [filteredUnits]);

  const notifications = [
    { id: 1, title: "Pengumuman Libur Semester", desc: "Dikirim 2 jam lalu", read: false },
    { id: 2, title: "Deadline Input Nilai", desc: "Dikirim 5 jam lalu", read: false },
  ];

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
                    <BookOpen size={18} />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 truncate">
                    Laporan Akademik
                  </h1>
                </div>
                <p className="text-sm text-slate-500 mt-1 ml-[42px] flex items-center gap-1.5">
                  <Sparkles size={14} className="text-slate-400 flex-shrink-0" />
                  <span className="truncate">Rekap nilai dan kehadiran akademik per unit sekolah.</span>
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
                <div className="relative flex-1 min-w-[160px]">
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full appearance-none pl-3 pr-9 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    {SEMESTER_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                <div className="relative flex-1 min-w-[140px]">
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

                <div className="relative flex-1 min-w-[200px]">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama unit sekolah..."
                    className="w-full pl-9 pr-3 py-2.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                  />
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
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">Rata Nilai</p>
                  <p className="text-lg font-bold text-slate-800">{summary.rataNilai ?? "—"}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg border bg-emerald-50 text-emerald-600 border-emerald-200 flex-shrink-0">
                  <TrendingUp size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">Rata Kehadiran</p>
                  <p className="text-lg font-bold text-slate-800">{summary.rataKehadiran ?? "—"}%</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg border bg-purple-50 text-purple-600 border-purple-200 flex-shrink-0">
                  <Users size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">Total Siswa</p>
                  <p className="text-lg font-bold text-slate-800">{summary.totalSiswa.toLocaleString("id-ID")}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg border bg-amber-50 text-amber-600 border-amber-200 flex-shrink-0">
                  <CheckCircle2 size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">Tuntas (KKM {KKM})</p>
                  <p className="text-lg font-bold text-slate-800">{summary.totalTuntas.toLocaleString("id-ID")}</p>
                </div>
              </div>
            </div>

            {/* TABEL PER UNIT */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-200/60 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-700 truncate">
                  Rekap per Unit Sekolah · {semester}
                </h3>
                <span className="text-xs text-slate-400 flex-shrink-0">{filteredUnits.length} unit</span>
              </div>

              <div className="overflow-x-auto w-full">
                <table className="w-full min-w-[720px] text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80">
                      <th className="border border-slate-200 text-left font-medium text-slate-500 text-xs uppercase tracking-wider px-4 sm:px-5 py-3 whitespace-nowrap">
                        Unit Sekolah
                      </th>
                      <th className="border border-slate-200 text-center font-medium text-slate-500 text-xs uppercase tracking-wider px-3 py-3 whitespace-nowrap">
                        Jenjang
                      </th>
                      <th className="border border-slate-200 text-center font-medium text-slate-500 text-xs uppercase tracking-wider px-3 py-3 whitespace-nowrap">
                        Siswa
                      </th>
                      <th className="border border-slate-200 text-center font-medium text-slate-500 text-xs uppercase tracking-wider px-3 py-3 whitespace-nowrap">
                        Rata Nilai
                      </th>
                      <th className="border border-slate-200 text-center font-medium text-slate-500 text-xs uppercase tracking-wider px-3 py-3 whitespace-nowrap">
                        Kehadiran
                      </th>
                      <th className="border border-slate-200 text-center font-medium text-slate-500 text-xs uppercase tracking-wider px-3 py-3 whitespace-nowrap">
                        Tuntas KKM
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUnits.length === 0 && (
                      <tr>
                        <td colSpan={6} className="border border-slate-200 p-10 text-center">
                          <Users size={28} className="mx-auto text-slate-300 mb-2" />
                          <p className="text-sm text-slate-400">Tidak ada unit sekolah yang cocok.</p>
                        </td>
                      </tr>
                    )}

                    {filteredUnits.map((u) => {
                      const persenTuntas = round1((u.tuntas / u.siswa) * 100);
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="border border-slate-200 px-4 sm:px-5 py-3 whitespace-nowrap">
                            <span className="text-sm font-medium text-slate-800">{u.nama}</span>
                          </td>
                          <td className="border border-slate-200 px-3 py-3 text-center whitespace-nowrap">
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full border bg-slate-100 text-slate-500 border-slate-200">
                              {u.jenjang}
                            </span>
                          </td>
                          <td className="border border-slate-200 px-3 py-3 text-center text-slate-600 whitespace-nowrap">
                            {u.siswa.toLocaleString("id-ID")}
                          </td>
                          <td className="border border-slate-200 px-3 py-3 text-center whitespace-nowrap">
                            <span className="text-sm font-semibold text-slate-800">{u.rataNilai}</span>
                          </td>
                          <td className="border border-slate-200 px-3 py-3 text-center text-slate-600 whitespace-nowrap">
                            {u.kehadiran}%
                          </td>
                          <td className="border border-slate-200 px-3 py-3 text-center whitespace-nowrap">
                            <span
                              className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                                persenTuntas >= 80
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                  : "bg-rose-50 text-rose-600 border-rose-200"
                              }`}
                            >
                              {u.tuntas}/{u.siswa} ({persenTuntas}%)
                            </span>
                          </td>
                        </tr>
                      );
                    })}
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