"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import {
  FileText,
  BookOpen,
  GraduationCap,
  Package,
  UserSquare2,
  ChevronRight,
  Sparkles,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

// ===== DUMMY DATA =====
// Catatan: ganti dengan data asli dari API/DB begitu tersedia.
const categories = [
  {
    id: "akademik",
    title: "Akademik",
    desc: "Rekap nilai, kehadiran, dan capaian belajar per unit sekolah",
    icon: BookOpen,
    color: "blue",
    path: "/yayasan/laporan/akademik",
    stat: "6 unit sekolah",
  },
  {
    id: "guru",
    title: "Guru",
    desc: "Rekap kinerja, kehadiran, dan beban mengajar tenaga pendidik",
    icon: GraduationCap,
    color: "purple",
    path: "/yayasan/laporan/guru",
    stat: "237 guru aktif",
  },
  {
    id: "iventaris",
    title: "Inventaris",
    desc: "Kondisi aset dan sarana-prasarana tiap unit sekolah",
    icon: Package,
    color: "amber",
    path: "/yayasan/laporan/iventaris",
    stat: "Update bulanan",
  },
  {
    id: "siswa",
    title: "Siswa",
    desc: "Rekap data induk, mutasi, dan demografi siswa lintas unit",
    icon: UserSquare2,
    color: "emerald",
    path: "/yayasan/laporan/siswa",
    stat: "4.312 siswa",
  },
];

const recentReports = [
  { id: 1, title: "Rekap Nilai Semester Ganjil 2025/2026", category: "Akademik", date: "12 Agu 2026", trend: "up" },
  { id: 2, title: "Laporan Kehadiran Guru Bulan Juli", category: "Guru", date: "3 Agu 2026", trend: "up" },
  { id: 3, title: "Audit Inventaris Triwulan II", category: "Inventaris", date: "28 Jul 2026", trend: "down" },
  { id: 4, title: "Data Mutasi Siswa Semester Ganjil", category: "Siswa", date: "15 Jul 2026", trend: "same" },
];

const colorMap = {
  blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", hoverBorder: "hover:border-blue-300", ring: "group-hover:ring-blue-100" },
  purple: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200", hoverBorder: "hover:border-purple-300", ring: "group-hover:ring-purple-100" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", hoverBorder: "hover:border-amber-300", ring: "group-hover:ring-amber-100" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", hoverBorder: "hover:border-emerald-300", ring: "group-hover:ring-emerald-100" },
};

const TrendIcon = ({ trend }) => {
  if (trend === "up") return <TrendingUp size={13} className="text-emerald-500 flex-shrink-0" />;
  if (trend === "down") return <TrendingDown size={13} className="text-rose-500 flex-shrink-0" />;
  return <Minus size={13} className="text-slate-400 flex-shrink-0" />;
};

// ===== MAIN COMPONENT =====

export default function LaporanYayasanPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-rose-500 text-white shadow-sm flex-shrink-0">
                    <FileText size={18} />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 truncate">
                    Laporan & Analitik
                  </h1>
                </div>
                <p className="text-sm text-slate-500 mt-1 ml-[42px] flex items-center gap-1.5">
                  <Sparkles size={14} className="text-slate-400 flex-shrink-0" />
                  <span className="truncate">Pilih kategori laporan yang ingin dilihat lebih detail.</span>
                </p>
              </div>
            </div>

            {/* CATEGORY CARDS — link ke masing-masing sub-halaman laporan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((item) => {
                const Icon = item.icon;
                const c = colorMap[item.color];
                return (
                  <button
                    key={item.id}
                    onClick={() => router.push(item.path)}
                    className={`group text-left bg-white rounded-2xl border ${c.border} ${c.hoverBorder} p-5 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden min-w-0`}
                  >
                    <div className={`absolute -right-6 -top-6 w-28 h-28 rounded-full ${c.bg} opacity-70`} />
                    <div className="relative min-w-0">
                      <div className="flex items-start justify-between">
                        <div className={`p-3 sm:p-3.5 rounded-xl ${c.bg} ${c.text} ring-4 ring-transparent ${c.ring} transition-all duration-300 flex-shrink-0`}>
                          <Icon size={22} />
                        </div>
                        <ChevronRight
                          size={20}
                          className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all duration-300 mt-1 flex-shrink-0"
                        />
                      </div>
                      <h3 className="mt-4 sm:mt-5 text-base sm:text-lg font-semibold text-slate-800 truncate">{item.title}</h3>
                      <p className="mt-1.5 text-sm text-slate-500 leading-relaxed line-clamp-2">{item.desc}</p>
                      <div className={`mt-4 inline-flex items-center text-xs font-medium ${c.text} ${c.bg} px-2.5 py-1 rounded-full max-w-full truncate`}>
                        {item.stat}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* RECENT REPORTS */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between gap-2 p-4 sm:p-5 border-b border-slate-100">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 flex-shrink-0">
                    <Calendar size={16} />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700 truncate">Laporan Terbaru</h3>
                </div>
              </div>
              <div className="divide-y divide-slate-50">
                {recentReports.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 sm:p-5 flex items-center gap-3 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800 truncate">{r.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          {r.category}
                        </span>
                        <span className="text-xs text-slate-400">{r.date}</span>
                      </div>
                    </div>
                    <TrendIcon trend={r.trend} />
                    <button
                      className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors flex-shrink-0"
                      title="Unduh laporan"
                    >
                      <Download size={16} />
                    </button>
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