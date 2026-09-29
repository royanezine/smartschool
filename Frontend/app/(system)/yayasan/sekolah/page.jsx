"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { apiFetch } from "../../../lib/api"; // sesuaikan path kalau beda
import {
  School,
  Search,
  ChevronDown,
  Sparkles,
  MapPin,
  Phone,
  Mail,
  Users,
  BadgeCheck,
} from "lucide-react";

// Status di backend pakai lowercase: "aktif" / "uji coba" (lihat Prisma sekolah.status)
const STATUS_OPTIONS = ["Semua Status", "aktif", "uji coba"];

// ===== MAIN COMPONENT =====

export default function DataMasterSekolahPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);
  const [search, setSearch] = useState("");

  const [dataSekolah, setDataSekolah] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSekolah() {
      try {
        setLoading(true);
        setError(null);
        const res = await apiFetch("/yayasan/sekolah");
        if (res) setDataSekolah(res.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSekolah();
  }, []);

  const filteredSekolah = useMemo(() => {
    return dataSekolah.filter((s) => {
      const matchStatus = status === "Semua Status" || s.status === status;
      const matchSearch =
        !search.trim() ||
        s.nama?.toLowerCase().includes(search.toLowerCase()) ||
        s.subdomain?.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [dataSekolah, status, search]);

  const summary = useMemo(() => {
    const totalUnit = filteredSekolah.length;
    const totalAktif = filteredSekolah.filter((s) => s.status === "aktif").length;
    const totalUjiCoba = filteredSekolah.filter((s) => s.status === "uji coba").length;
    return { totalUnit, totalAktif, totalUjiCoba };
  }, [filteredSekolah]);

  const notifications = [
    { id: 1, title: "Pengumuman Libur Semester", desc: "Dikirim 2 jam lalu", read: false },
    { id: 2, title: "Deadline Input Nilai", desc: "Dikirim 5 jam lalu", read: false },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        role="yayasan"
        active="sekolah"
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
                <p className="text-xs font-medium text-slate-400 mb-1">Data Master</p>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-500 text-white shadow-sm flex-shrink-0">
                    <School size={18} />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 truncate">
                    Data Sekolah
                  </h1>
                </div>
                <p className="text-sm text-slate-500 mt-1 ml-[42px] flex items-center gap-1.5">
                  <Sparkles size={14} className="text-slate-400 flex-shrink-0" />
                  <span className="truncate">Kelola data unit sekolah di lingkungan yayasan.</span>
                </p>
              </div>
            </div>

            {/* Pesan error kalau gagal fetch */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">
                Gagal memuat data sekolah: {error}
              </div>
            )}

            {/* FILTER BAR */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama sekolah atau subdomain..."
                    className="w-full pl-9 pr-3 py-2.5 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="relative flex-1 min-w-[160px]">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full appearance-none pl-3 pr-9 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors cursor-pointer capitalize"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s} className="capitalize">{s}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg border bg-blue-50 text-blue-600 border-blue-200 flex-shrink-0">
                  <School size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">Total Unit Sekolah</p>
                  <p className="text-lg font-bold text-slate-800">{loading ? "-" : summary.totalUnit}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg border bg-emerald-50 text-emerald-600 border-emerald-200 flex-shrink-0">
                  <BadgeCheck size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">Sekolah Aktif</p>
                  <p className="text-lg font-bold text-slate-800">{loading ? "-" : summary.totalAktif}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg border bg-amber-50 text-amber-600 border-amber-200 flex-shrink-0">
                  <Users size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">Sekolah Uji Coba</p>
                  <p className="text-lg font-bold text-slate-800">{loading ? "-" : summary.totalUjiCoba}</p>
                </div>
              </div>
            </div>

            {/* GRID KARTU SEKOLAH */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-700">Daftar Unit Sekolah</h3>
                <span className="text-xs text-slate-400">
                  {loading ? "Memuat..." : `${filteredSekolah.length} sekolah`}
                </span>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 animate-pulse h-40" />
                  ))}
                </div>
              ) : filteredSekolah.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-10 text-center">
                  <School size={28} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-400">Tidak ada sekolah yang cocok.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredSekolah.map((s) => {
                    const langganan = s.langgananSekolah?.[0];
                    return (
                      <Link
                        key={s.id}
                        href={`/yayasan/sekolah/${s.id}`}
                        className="bg-white rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all overflow-hidden flex flex-col"
                      >
                        {/* Header kartu */}
                        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-11 h-11 rounded-lg bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
                              <School size={19} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate">{s.nama}</p>
                              <p className="text-xs text-slate-400 truncate">{s.subdomain}</p>
                              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                <span
                                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize ${
                                    s.status === "aktif"
                                      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                      : "bg-amber-50 text-amber-600 border-amber-200"
                                  }`}
                                >
                                  {s.status}
                                </span>
                                {langganan?.paket?.nama && (
                                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border bg-blue-50 text-blue-600 border-blue-200">
                                    {langganan.paket.nama}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Detail kartu — hanya field yang tersedia dari API */}
                        <div className="p-4 sm:p-5 flex-1 space-y-2.5">
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Phone size={13} className="text-slate-400 flex-shrink-0" />
                            <span>{s.telepon || "-"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Mail size={13} className="text-slate-400 flex-shrink-0" />
                            <span className="truncate">{s.email || "-"}</span>
                          </div>
                          {langganan?.tanggalBerakhir && (
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <MapPin size={13} className="text-slate-400 flex-shrink-0" />
                              <span>Langganan berakhir {new Date(langganan.tanggalBerakhir).toLocaleDateString("id-ID")}</span>
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}