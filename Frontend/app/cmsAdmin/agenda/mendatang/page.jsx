// app/cmsAdmin/agenda/mendatang/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";
import {
  Calendar,
  MapPin,
  Clock,
  Pencil,
  Trash2,
  Plus,
  ArrowLeft,
  CalendarDays,
  Timer,
  ChevronRight,
  MoreHorizontal,
  Sparkles,
} from "lucide-react";

export default function AgendaMendatangPage() {
  const router = useRouter();

  const [active, setActive] = useState("agenda");
  const [collapsed, setCollapsed] = useState(false);

  const [upcoming, setUpcoming] = useState([
    {
      id: 2,
      title: "Pendaftaran Siswa Baru 2026",
      category: "PPDB",
      location: "Gedung A",
      date: "2026-02-01 08:00",
      status: "scheduled",
    },
    {
      id: 5,
      title: "Pembagian Raport Semester Ganjil",
      category: "Kegiatan",
      location: "Ruang Auditorium",
      date: "2026-01-28 08:00",
      status: "scheduled",
    },
    {
      id: 4,
      title: "Rapat Evaluasi UTS",
      category: "Rapat",
      location: "Ruangan Guru",
      date: "2026-01-25 14:00",
      status: "draft",
    },
  ]);

  const handleDelete = (id) => {
    if (confirm("Hapus agenda mendatang ini?")) {
      setUpcoming((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const getDateInfo = (dateString) => {
    const date = new Date(dateString.replace(" ", "T"));
    if (Number.isNaN(date.getTime())) {
      return { month: "---", day: "--", fullDate: "-", time: "-" };
    }
    return {
      month: date.toLocaleDateString("id-ID", { month: "short" }).replace(".", ""),
      day: date.getDate(),
      fullDate: date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
      time: date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false }),
    };
  };

  const getCategoryStyle = (category) => {
    switch (category) {
      case "PPDB": return "bg-blue-50 text-blue-700 border-blue-100";
      case "Kegiatan": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Rapat": return "bg-slate-100 text-slate-700 border-slate-200";
      default: return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const getStatusStyle = (status) => {
    if (status === "scheduled") {
      return {
        wrapper: "bg-blue-50 text-blue-700 border border-blue-100",
        dot: "bg-blue-500",
        icon: CalendarDays,
        label: "Terjadwal",
      };
    }
    return {
      wrapper: "bg-amber-50 text-amber-700 border border-amber-100",
      dot: "bg-amber-500",
      icon: Clock,
      label: "Draft",
    };
  };

  return (
    // PERBAIKAN: flex tanpa overflow-x-hidden
    <div className="flex min-h-screen w-full bg-white">
      {/* SIDEBAR */}
      <Sidebar
        active={active}
        setActive={setActive}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* MAIN CONTENT - flex-1 min-w-0 flex flex-col */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Header
          title="Agenda Mendatang"
          user={{ name: "Admin" }}
          notifications={[]}
        />

        <main className="flex-1 min-w-0 overflow-y-auto p-4 md:p-6 lg:p-8 bg-white">
          <div className="w-full min-w-0 max-w-7xl mx-auto space-y-6">

            {/* BREADCRUMB */}
            <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
              <a href="/cmsAdmin" className="hover:text-blue-700 transition">Dashboard</a>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <a href="/cmsAdmin/agenda" className="hover:text-blue-700 transition">Agenda</a>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-blue-700 font-semibold">Mendatang</span>
            </nav>

            {/* BACK BUTTON */}
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-700 transition group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Kembali
            </button>

            {/* HEADER CARD */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="shrink-0 p-3 rounded-2xl bg-gradient-to-br from-blue-700 to-blue-800 text-white shadow-lg shadow-blue-200/50">
                    <CalendarDays className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-bold uppercase tracking-wider text-blue-700 mb-1.5">
                      <Sparkles className="w-3 h-3" />
                      Agenda Sekolah
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Agenda Mendatang</h1>
                    <p className="text-sm text-slate-500 mt-1">Kelola event, kegiatan, dan jadwal sekolah yang akan datang</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/cmsAdmin/agenda/tambah")}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-700 to-blue-800 text-white rounded-xl hover:shadow-lg hover:shadow-blue-200/50 transition-all shadow-md font-semibold text-sm whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  Buat Agenda Baru
                </button>
              </div>
            </div>

            {/* STATISTICS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Agenda</p>
                  <p className="text-2xl font-bold text-slate-900">{upcoming.length}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Terjadwal</p>
                  <p className="text-2xl font-bold text-slate-900">{upcoming.filter((i) => i.status === "scheduled").length}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Draft</p>
                  <p className="text-2xl font-bold text-slate-900">{upcoming.filter((i) => i.status === "draft").length}</p>
                </div>
              </div>
            </div>

            {/* LIST HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Jadwal Terdekat</h2>
                <p className="text-sm text-slate-500">Daftar agenda yang dijadwalkan berikutnya</p>
              </div>
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-500 shadow-sm">
                <CalendarDays className="w-3.5 h-3.5 text-blue-500" />
                {upcoming.length} agenda
              </span>
            </div>

            {/* LIST */}
            <div className="space-y-3">
              {upcoming.length > 0 ? (
                upcoming.map((item) => {
                  const dateInfo = getDateInfo(item.date);
                  const status = getStatusStyle(item.status);
                  const StatusIcon = status.icon;

                  return (
                    <div
                      key={item.id}
                      className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/60 transition-all duration-300 overflow-hidden"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-700" />

                      <div className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 sm:p-5">
                        {/* DATE */}
                        <div className="shrink-0 flex lg:block items-center gap-3">
                          <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl border border-blue-100 bg-blue-50 shadow-sm">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
                              {dateInfo.month}
                            </span>
                            <span className="text-2xl font-extrabold text-slate-900 mt-0.5 leading-none">
                              {dateInfo.day}
                            </span>
                          </div>
                        </div>

                        {/* CONTENT */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <h3 className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors break-words">
                              {item.title}
                            </h3>
                            <span className={`inline-flex w-fit shrink-0 items-center rounded-md border px-2 py-1 text-[10px] font-semibold ${getCategoryStyle(item.category)}`}>
                              {item.category}
                            </span>
                          </div>

                          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">
                            <div className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{dateInfo.fullDate}</span>
                            </div>
                            <div className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{dateInfo.time} WIB</span>
                            </div>
                            <div className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span className="truncate max-w-[200px]">{item.location}</span>
                            </div>
                          </div>

                          {/* STATUS MOBILE */}
                          <div className="mt-3 lg:hidden">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${status.wrapper}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </span>
                          </div>
                        </div>

                        {/* STATUS DESKTOP */}
                        <div className="hidden lg:block shrink-0">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${status.wrapper}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                            <StatusIcon className="w-3.5 h-3.5" />
                            {status.label}
                          </span>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex shrink-0 items-center justify-end gap-1.5 border-t border-slate-100 pt-3 lg:border-t-0 lg:pt-0">
                          <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-slate-400 transition-all hover:border-blue-100 hover:bg-blue-50 hover:text-blue-600" title="Edit">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-slate-400 transition-all hover:border-red-100 hover:bg-red-50 hover:text-red-600" title="Hapus">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-slate-400 transition-all hover:border-slate-200 hover:bg-slate-50 hover:text-slate-700" title="Opsi">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-14 text-center shadow-sm">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
                    <CalendarDays className="w-7 h-7 text-slate-400" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-900">Tidak ada agenda mendatang</h3>
                  <p className="mt-1 max-w-md text-sm text-slate-500">Belum terdapat agenda yang dijadwalkan. Tambahkan agenda baru untuk mulai mengatur kegiatan sekolah.</p>
                  <button onClick={() => router.push("/cmsAdmin/agenda/tambah")} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200/50 transition-all hover:bg-blue-800 hover:shadow-lg">
                    <Plus className="w-4 h-4" />
                    Buat Agenda
                  </button>
                </div>
              )}
            </div>

            {/* FOOTER */}
            {upcoming.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
                <span className="text-xs text-slate-400 flex items-center gap-2">
                  <CalendarDays className="w-3.5 h-3.5" />
                  Menampilkan {upcoming.length} agenda mendatang
                </span>
                <span className="text-xs text-slate-400">Data simulasi</span>
              </div>
            )}

            {/* FOOTER */}
            <footer className="pt-4 border-t border-slate-200/60 text-center text-xs text-slate-400">
              © 2026 SmartSchool CMS • Agenda Mendatang
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}