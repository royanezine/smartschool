"use client";

import { useState, useMemo } from "react";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import {
  GraduationCap,
  Search,
  ChevronDown,
  ChevronLeft,
  Sparkles,
  Download,
  Users,
  UserCheck,
  Building2,
  BookOpen,
} from "lucide-react";
import { useRouter } from "next/navigation";

// ===== DUMMY DATA =====
// Catatan: ganti dengan data asli dari API/DB begitu tersedia.
const SEMESTER_OPTIONS = ["Ganjil 2025/2026", "Genap 2024/2025", "Ganjil 2024/2025"];
const UNIT_OPTIONS = [
  "Semua Unit",
  "SD Smart School 1",
  "SD Smart School 2",
  "SMP Smart School 1",
  "SMP Smart School 2",
  "SMA Smart School 1",
  "SMA Smart School 2",
];

const dataGuru = [
  { id: 1, nama: "Budi Santoso, S.Pd", mapel: "Matematika", unit: "SMP Smart School 1", kelasDiampu: 4, status: "Aktif", berlakuSejak: "12 Jul 2023" },
  { id: 2, nama: "Siti Aminah, S.Pd", mapel: "Bahasa Indonesia", unit: "SD Smart School 1", kelasDiampu: 6, status: "Aktif", berlakuSejak: "03 Jan 2021" },
  { id: 3, nama: "Rudi Hartono, M.Pd", mapel: "IPA", unit: "SMP Smart School 2", kelasDiampu: 5, status: "Aktif", berlakuSejak: "18 Aug 2022" },
  { id: 4, nama: "Dewi Kusuma, S.Pd", mapel: "Bahasa Inggris", unit: "SMA Smart School 1", kelasDiampu: 3, status: "Aktif", berlakuSejak: "25 Feb 2024" },
  { id: 5, nama: "Ahmad Fauzan, S.Pd", mapel: "Matematika", unit: "SMA Smart School 2", kelasDiampu: 4, status: "Nonaktif", berlakuSejak: "10 Jun 2019" },
  { id: 6, nama: "Nurul Hidayah, S.Pd", mapel: "IPS", unit: "SD Smart School 2", kelasDiampu: 6, status: "Aktif", berlakuSejak: "07 Sep 2023" },
  { id: 7, nama: "Eko Prasetyo, M.Pd", mapel: "Fisika", unit: "SMA Smart School 1", kelasDiampu: 3, status: "Aktif", berlakuSejak: "14 Apr 2022" },
  { id: 8, nama: "Fitriani, S.Pd", mapel: "Seni Budaya", unit: "SMP Smart School 1", kelasDiampu: 5, status: "Aktif", berlakuSejak: "29 Nov 2020" },
];

// ===== MAIN COMPONENT =====

export default function LaporanGuruPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [semester, setSemester] = useState(SEMESTER_OPTIONS[0]);
  const [unit, setUnit] = useState(UNIT_OPTIONS[0]);
  const [search, setSearch] = useState("");

  const filteredGuru = useMemo(() => {
    return dataGuru.filter((g) => {
      const matchUnit = unit === "Semua Unit" || g.unit === unit;
      const matchSearch =
        !search.trim() ||
        g.nama.toLowerCase().includes(search.toLowerCase()) ||
        g.mapel.toLowerCase().includes(search.toLowerCase());
      return matchUnit && matchSearch;
    });
  }, [unit, search]);

  const summary = useMemo(() => {
    const totalGuru = filteredGuru.length;
    const guruAktif = filteredGuru.filter((g) => g.status === "Aktif").length;
    const totalUnit = new Set(filteredGuru.map((g) => g.unit)).size;
    const totalKelasDiampu = filteredGuru.reduce((a, g) => a + g.kelasDiampu, 0);
    return { totalGuru, guruAktif, totalUnit, totalKelasDiampu };
  }, [filteredGuru]);

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
                    <GraduationCap size={18} />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 truncate">
                    Laporan Guru
                  </h1>
                </div>
                <p className="text-sm text-slate-500 mt-1 ml-[42px] flex items-center gap-1.5">
                  <Sparkles size={14} className="text-slate-400 flex-shrink-0" />
                  <span className="truncate">Rekap data guru, mapel yang diampu, dan unit sekolah tempat mengajar.</span>
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

                <div className="relative flex-1 min-w-[180px]">
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full appearance-none pl-3 pr-9 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors cursor-pointer"
                  >
                    {UNIT_OPTIONS.map((u) => (
                      <option key={u} value={u}>{u}</option>
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
                    placeholder="Cari nama guru atau mapel..."
                    className="w-full pl-9 pr-3 py-2.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                  />
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
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">Total Guru</p>
                  <p className="text-lg font-bold text-slate-800">{summary.totalGuru}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg border bg-emerald-50 text-emerald-600 border-emerald-200 flex-shrink-0">
                  <UserCheck size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">Guru Aktif</p>
                  <p className="text-lg font-bold text-slate-800">{summary.guruAktif}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg border bg-purple-50 text-purple-600 border-purple-200 flex-shrink-0">
                  <Building2 size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">Unit Sekolah</p>
                  <p className="text-lg font-bold text-slate-800">{summary.totalUnit}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg border bg-amber-50 text-amber-600 border-amber-200 flex-shrink-0">
                  <BookOpen size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">Total Kelas Diampu</p>
                  <p className="text-lg font-bold text-slate-800">{summary.totalKelasDiampu}</p>
                </div>
              </div>
            </div>

            {/* TABEL DATA GURU */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-200/60 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-700 truncate">
                  Daftar Guru · {semester}
                </h3>
                <span className="text-xs text-slate-400 flex-shrink-0">{filteredGuru.length} guru</span>
              </div>

              <div className="overflow-x-auto w-full">
                <table className="w-full min-w-[760px] text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80">
                      <th className="border border-slate-200 text-left font-medium text-slate-500 text-xs uppercase tracking-wider px-4 sm:px-5 py-3 whitespace-nowrap">
                        Nama Guru
                      </th>
                      <th className="border border-slate-200 text-center font-medium text-slate-500 text-xs uppercase tracking-wider px-3 py-3 whitespace-nowrap">
                        Mapel
                      </th>
                      <th className="border border-slate-200 text-left font-medium text-slate-500 text-xs uppercase tracking-wider px-3 py-3 whitespace-nowrap">
                        Mengajar di
                      </th>
                      <th className="border border-slate-200 text-center font-medium text-slate-500 text-xs uppercase tracking-wider px-3 py-3 whitespace-nowrap">
                        Kelas Diampu
                      </th>
                      <th className="border border-slate-200 text-center font-medium text-slate-500 text-xs uppercase tracking-wider px-3 py-3 whitespace-nowrap">
                        Berlaku Sejak
                      </th>
                      <th className="border border-slate-200 text-center font-medium text-slate-500 text-xs uppercase tracking-wider px-3 py-3 whitespace-nowrap">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredGuru.length === 0 && (
                      <tr>
                        <td colSpan={6} className="border border-slate-200 p-10 text-center">
                          <Users size={28} className="mx-auto text-slate-300 mb-2" />
                          <p className="text-sm text-slate-400">Tidak ada guru yang cocok.</p>
                        </td>
                      </tr>
                    )}

                    {filteredGuru.map((g) => (
                      <tr key={g.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="border border-slate-200 px-4 sm:px-5 py-3 whitespace-nowrap">
                          <span className="text-sm font-medium text-slate-800">{g.nama}</span>
                        </td>
                        <td className="border border-slate-200 px-3 py-3 text-center whitespace-nowrap">
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full border bg-slate-100 text-slate-500 border-slate-200">
                            {g.mapel}
                          </span>
                        </td>
                        <td className="border border-slate-200 px-3 py-3 text-slate-600 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Building2 size={13} className="text-slate-400 flex-shrink-0" />
                            {g.unit}
                          </div>
                        </td>
                        <td className="border border-slate-200 px-3 py-3 text-center text-slate-600 whitespace-nowrap">
                          {g.kelasDiampu} kelas
                        </td>
                        <td className="border border-slate-200 px-3 py-3 text-center text-slate-600 whitespace-nowrap">
                          {g.berlakuSejak}
                        </td>
                        <td className="border border-slate-200 px-3 py-3 text-center whitespace-nowrap">
                          <span
                            className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                              g.status === "Aktif"
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                : "bg-rose-50 text-rose-600 border-rose-200"
                            }`}
                          >
                            {g.status}
                          </span>
                        </td>
                      </tr>
                    ))}
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