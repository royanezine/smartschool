"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  UserSquare2,
  ClipboardCheck,
  FileText,
  Settings,
  ChevronRight,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Bell,
} from "lucide-react";

// ===== DUMMY DATA =====
// Catatan: ganti dengan data asli dari API/DB begitu tersedia.
const kpiStrip = [
  { id: "sekolah", label: "Unit Sekolah", value: "6", icon: Building2, color: "blue" },
  { id: "siswa", label: "Total Siswa", value: "4.312", icon: UserSquare2, color: "purple" },
  { id: "guru", label: "Total Guru", value: "237", icon: Users, color: "amber" },
  { id: "kehadiran", label: "Rata Kehadiran", value: "96.0%", icon: ClipboardCheck, color: "emerald" },
];

const quickMenu = [
  {
    id: "sekolah",
    title: "Sekolah",
    desc: "Kelola profil dan data seluruh unit sekolah di bawah yayasan",
    icon: Building2,
    color: "blue",
    path: "/yayasan/sekolah",
    stat: "6 unit sekolah",
    featured: true,
  },
  {
    id: "laporan",
    title: "Laporan & Analitik",
    desc: "Ringkasan laporan akademik, guru, inventaris, dan siswa",
    icon: FileText,
    color: "rose",
    path: "/yayasan/laporan",
    stat: "4 kategori laporan",
    featured: true,
  },
  {
    id: "guru",
    title: "Guru",
    desc: "Data induk tenaga pendidik",
    icon: GraduationCap,
    color: "purple",
    path: "/yayasan/guru",
    stat: "184 aktif",
  },
  {
    id: "siswa",
    title: "Siswa",
    desc: "Data induk siswa lintas unit",
    icon: UserSquare2,
    color: "emerald",
    path: "/yayasan/siswa",
    stat: "4.312 siswa",
  },
  {
    id: "monitoringAkademik",
    title: "Monitoring Akademik",
    desc: "Kehadiran, nilai, LMS, mapel",
    icon: ClipboardCheck,
    color: "amber",
    path: "/yayasan/monitoringAkademik",
    stat: "Update harian",
  },
  {
    id: "pengaturan",
    title: "Pengaturan",
    desc: "Konfigurasi sistem yayasan",
    icon: Settings,
    color: "slate",
    path: "/yayasan/pengaturan",
    stat: "3 hari lalu",
  },
];

const unitList = [
  { id: 1, nama: "SD Smart School 1", siswa: 612, guru: 34, kehadiran: 97, trend: "up" },
  { id: 2, nama: "SD Smart School 2", siswa: 548, guru: 30, kehadiran: 95, trend: "down" },
  { id: 3, nama: "SMP Smart School 1", siswa: 734, guru: 41, kehadiran: 96, trend: "same" },
  { id: 4, nama: "SMP Smart School 2", siswa: 689, guru: 38, kehadiran: 94, trend: "down" },
  { id: 5, nama: "SMA Smart School 1", siswa: 812, guru: 45, kehadiran: 98, trend: "up" },
  { id: 6, nama: "SMA Smart School 2", siswa: 917, guru: 49, kehadiran: 96, trend: "same" },
];

const colorMap = {
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
    hoverBorder: "hover:border-blue-300",
    ring: "group-hover:ring-blue-100",
    bar: "bg-blue-500",
  },
  purple: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-200",
    hoverBorder: "hover:border-purple-300",
    ring: "group-hover:ring-purple-100",
    bar: "bg-purple-500",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
    hoverBorder: "hover:border-amber-300",
    ring: "group-hover:ring-amber-100",
    bar: "bg-amber-500",
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
    hoverBorder: "hover:border-emerald-300",
    ring: "group-hover:ring-emerald-100",
    bar: "bg-emerald-500",
  },
  rose: {
    bg: "bg-rose-50",
    text: "text-rose-600",
    border: "border-rose-200",
    hoverBorder: "hover:border-rose-300",
    ring: "group-hover:ring-rose-100",
    bar: "bg-rose-500",
  },
  slate: {
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
    hoverBorder: "hover:border-slate-300",
    ring: "group-hover:ring-slate-100",
    bar: "bg-slate-500",
  },
};

const TrendIcon = ({ trend }) => {
  if (trend === "up") return <TrendingUp size={13} className="text-emerald-500 flex-shrink-0" />;
  if (trend === "down") return <TrendingDown size={13} className="text-rose-500 flex-shrink-0" />;
  return <Minus size={13} className="text-slate-400 flex-shrink-0" />;
};

// ===== MAIN COMPONENT =====

export default function YayasanDashboardPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const notifications = [
    { id: 1, title: "Pengumuman Libur Semester", desc: "Dikirim 2 jam lalu", read: false },
    { id: 2, title: "Deadline Input Nilai", desc: "Dikirim 5 jam lalu", read: false },
  ];

  return (
    // min-h-screen (bukan h-screen + overflow-hidden) supaya SELURUH halaman yang
    // discroll, bukan cuma <main>. SidebarView.jsx (sticky top-0 h-screen di
    // komponennya) otomatis akan menempel dan tingginya mengikuti seluruh tinggi
    // konten halaman, bukan cuma tinggi viewport — jadi tidak ada lagi
    // celah/mismatch saat zoom out.
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        active="dashboard"
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* PAGE HEADER — wrap ke bawah di layar sempit / zoom, sama kayak pola Nilai */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-600 text-white shadow-sm flex-shrink-0">
                    <LayoutDashboard size={18} />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 truncate">
                    Dashboard Yayasan
                  </h1>
                </div>
                <p className="text-sm text-slate-500 mt-1 ml-[42px] flex items-center gap-1.5">
                  <Sparkles size={14} className="text-slate-400 flex-shrink-0" />
                  <span className="truncate">Ringkasan kondisi seluruh unit sekolah di bawah naungan yayasan.</span>
                </p>
              </div>
            </div>

            {/* KPI STRIP — grid reflow otomatis, tiap kartu punya min-w-0 biar teks gak dorong layout */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm divide-y sm:divide-y-0 sm:divide-x divide-slate-100 grid grid-cols-2 sm:grid-cols-4">
              {kpiStrip.map((kpi) => {
                const Icon = kpi.icon;
                const c = colorMap[kpi.color];
                return (
                  <div key={kpi.id} className="p-3.5 sm:p-5 flex items-center gap-3 sm:gap-3.5 min-w-0">
                    <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${c.bg} ${c.text} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-base sm:text-lg font-semibold text-slate-800 leading-tight truncate">{kpi.value}</p>
                      <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">{kpi.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* QUICK MENU — bento reflow: 1 kolom di mobile, 2 di tablet, 4 di desktop, featured selalu ambil 2 kolom kalau muat */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-min">
              {quickMenu.map((item) => {
                const Icon = item.icon;
                const c = colorMap[item.color];

                if (item.featured) {
                  return (
                    <button
                      key={item.id}
                      onClick={() => router.push(item.path)}
                      className={`group text-left bg-white rounded-2xl border ${c.border} ${c.hoverBorder} p-5 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 sm:col-span-1 lg:col-span-2 relative overflow-hidden min-w-0`}
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
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => router.push(item.path)}
                    className={`group text-left bg-white rounded-2xl border ${c.border} ${c.hoverBorder} p-4 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 min-w-0`}
                  >
                    <div className={`w-10 h-10 rounded-lg ${c.bg} ${c.text} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={17} />
                    </div>
                    <h3 className="mt-3 text-sm font-semibold text-slate-800 truncate">{item.title}</h3>
                    <p className="mt-0.5 text-xs text-slate-500 leading-relaxed line-clamp-2">{item.desc}</p>
                    <div className="mt-3 flex items-center justify-between gap-2 min-w-0">
                      <span className="text-[11px] font-medium text-slate-400 truncate">{item.stat}</span>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all duration-300 flex-shrink-0" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* UNIT OVERVIEW + NOTIFICATIONS — stack di mobile, 2:1 kolom di desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between gap-2 p-4 sm:p-5 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 flex-shrink-0">
                      <Building2 size={16} />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-700 truncate">Kehadiran per Unit Sekolah</h3>
                  </div>
                  <button
                    onClick={() => router.push("/yayasan/sekolah")}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-0.5 flex-shrink-0"
                  >
                    Lihat semua
                    <ChevronRight size={12} />
                  </button>
                </div>
                <div className="p-4 sm:p-5 space-y-4">
                  {unitList.map((unit) => (
                    <div key={unit.id} className="flex items-center gap-3 sm:gap-4">
                      <span className="w-24 sm:w-40 flex-shrink-0 text-sm text-slate-700 font-medium truncate">{unit.nama}</span>
                      <div className="flex-1 min-w-0 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${unit.kehadiran}%` }} />
                      </div>
                      <span className="w-10 flex-shrink-0 text-right text-sm text-slate-600">{unit.kehadiran}%</span>
                      <TrendIcon trend={unit.trend} />
                    </div>
                  ))}
                </div>
              </div>

              {/* NOTIFICATIONS */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 flex-shrink-0">
                      <Bell size={16} />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-700 truncate">Notifikasi Terbaru</h3>
                  </div>
                </div>
                <div className="divide-y divide-slate-50">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-4 sm:p-5 flex items-start gap-3 hover:bg-slate-50/60 transition-colors">
                      <div className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${n.read ? "bg-slate-300" : "bg-blue-500"}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{n.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{n.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}