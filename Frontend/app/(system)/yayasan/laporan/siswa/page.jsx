"use client";

import { useState, useMemo } from "react";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import {
  Users,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  UserPlus,
  School,
  Venus,
  Mars,
  MapPin,
} from "lucide-react";
import { useRouter } from "next/navigation";

// ===== DUMMY DATA =====
// Catatan: ganti dengan data asli dari API/DB begitu tersedia.
const JENJANG_OPTIONS = ["Semua Jenjang", "SD", "SMP", "SMA"];

const dataSekolah = [
  {
    id: 1,
    nama: "SD Smart School 1",
    jenjang: "SD",
    alamat: "Jl. Melati No. 12, Jakarta Selatan",
    tingkat: [
      { label: "Kelas 1", laki: 48, perempuan: 52 },
      { label: "Kelas 2", laki: 50, perempuan: 49 },
      { label: "Kelas 3", laki: 47, perempuan: 51 },
      { label: "Kelas 4", laki: 45, perempuan: 48 },
      { label: "Kelas 5", laki: 44, perempuan: 46 },
      { label: "Kelas 6", laki: 42, perempuan: 40 },
    ],
  },
  {
    id: 2,
    nama: "SD Smart School 2",
    jenjang: "SD",
    alamat: "Jl. Anggrek No. 8, Jakarta Timur",
    tingkat: [
      { label: "Kelas 1", laki: 45, perempuan: 43 },
      { label: "Kelas 2", laki: 44, perempuan: 46 },
      { label: "Kelas 3", laki: 43, perempuan: 41 },
      { label: "Kelas 4", laki: 40, perempuan: 45 },
      { label: "Kelas 5", laki: 42, perempuan: 39 },
      { label: "Kelas 6", laki: 38, perempuan: 42 },
    ],
  },
  {
    id: 3,
    nama: "SMP Smart School 1",
    jenjang: "SMP",
    alamat: "Jl. Kenanga No. 21, Jakarta Selatan",
    tingkat: [
      { label: "Kelas 7", laki: 128, perempuan: 120 },
      { label: "Kelas 8", laki: 122, perempuan: 118 },
      { label: "Kelas 9", laki: 119, perempuan: 127 },
    ],
  },
  {
    id: 4,
    nama: "SMP Smart School 2",
    jenjang: "SMP",
    alamat: "Jl. Mawar No. 5, Jakarta Barat",
    tingkat: [
      { label: "Kelas 7", laki: 115, perempuan: 110 },
      { label: "Kelas 8", laki: 108, perempuan: 116 },
      { label: "Kelas 9", laki: 112, perempuan: 118 },
    ],
  },
  {
    id: 5,
    nama: "SMA Smart School 1",
    jenjang: "SMA",
    alamat: "Jl. Dahlia No. 3, Jakarta Selatan",
    tingkat: [
      { label: "Kelas 10", laki: 140, perempuan: 132 },
      { label: "Kelas 11", laki: 135, perempuan: 138 },
      { label: "Kelas 12", laki: 130, perempuan: 137 },
    ],
  },
  {
    id: 6,
    nama: "SMA Smart School 2",
    jenjang: "SMA",
    alamat: "Jl. Cempaka No. 17, Jakarta Utara",
    tingkat: [
      { label: "Kelas 10", laki: 152, perempuan: 148 },
      { label: "Kelas 11", laki: 149, perempuan: 155 },
      { label: "Kelas 12", laki: 156, perempuan: 157 },
    ],
  },
];

const totalSekolah = (s) => s.tingkat.reduce((acc, t) => acc + t.laki + t.perempuan, 0);
const totalLaki = (s) => s.tingkat.reduce((acc, t) => acc + t.laki, 0);
const totalPerempuan = (s) => s.tingkat.reduce((acc, t) => acc + t.perempuan, 0);

// ===== MAIN COMPONENT =====

export default function DataSiswaPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [jenjang, setJenjang] = useState(JENJANG_OPTIONS[0]);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const filteredSekolah = useMemo(() => {
    return dataSekolah.filter((s) => {
      const matchJenjang = jenjang === "Semua Jenjang" || s.jenjang === jenjang;
      const matchSearch = !search.trim() || s.nama.toLowerCase().includes(search.toLowerCase());
      return matchJenjang && matchSearch;
    });
  }, [jenjang, search]);

  const summary = useMemo(() => {
    const totalSiswa = filteredSekolah.reduce((acc, s) => acc + totalSekolah(s), 0);
    const totalUnit = filteredSekolah.length;
    const laki = filteredSekolah.reduce((acc, s) => acc + totalLaki(s), 0);
    const perempuan = filteredSekolah.reduce((acc, s) => acc + totalPerempuan(s), 0);
    return { totalSiswa, totalUnit, laki, perempuan };
  }, [filteredSekolah]);

  const notifications = [
    { id: 1, title: "Pengumuman Libur Semester", desc: "Dikirim 2 jam lalu", read: false },
    { id: 2, title: "Deadline Input Nilai", desc: "Dikirim 5 jam lalu", read: false },
  ];

  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));

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
                    <Users size={18} />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 truncate">
                    Data Siswa
                  </h1>
                </div>
                <p className="text-sm text-slate-500 mt-1 ml-[42px] flex items-center gap-1.5">
                  <Sparkles size={14} className="text-slate-400 flex-shrink-0" />
                  <span className="truncate">Total siswa per unit sekolah — klik untuk lihat rincian per tingkat.</span>
                </p>
              </div>

              <button className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors shadow-sm whitespace-nowrap flex-shrink-0">
                <UserPlus size={16} />
                Tambah Siswa
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

                <div className="relative flex-1 min-w-[160px]">
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
              </div>
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg border bg-blue-50 text-blue-600 border-blue-200 flex-shrink-0">
                  <Users size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">Total Siswa</p>
                  <p className="text-lg font-bold text-slate-800">{summary.totalSiswa.toLocaleString("id-ID")}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg border bg-purple-50 text-purple-600 border-purple-200 flex-shrink-0">
                  <School size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">Unit Sekolah</p>
                  <p className="text-lg font-bold text-slate-800">{summary.totalUnit}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg border bg-cyan-50 text-cyan-600 border-cyan-200 flex-shrink-0">
                  <Mars size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">Siswa Laki-laki</p>
                  <p className="text-lg font-bold text-slate-800">{summary.laki.toLocaleString("id-ID")}</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg border bg-rose-50 text-rose-600 border-rose-200 flex-shrink-0">
                  <Venus size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider truncate">Siswa Perempuan</p>
                  <p className="text-lg font-bold text-slate-800">{summary.perempuan.toLocaleString("id-ID")}</p>
                </div>
              </div>
            </div>

            {/* DAFTAR SEKOLAH (ACCORDION) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">Per Unit Sekolah</h3>
                <span className="text-xs text-slate-400">{filteredSekolah.length} unit</span>
              </div>

              {filteredSekolah.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-10 text-center">
                  <Users size={28} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-400">Tidak ada sekolah yang cocok.</p>
                </div>
              ) : (
                filteredSekolah.map((s) => {
                  const total = totalSekolah(s);
                  const isOpen = expandedId === s.id;
                  return (
                    <div
                      key={s.id}
                      className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden"
                    >
                      {/* Header sekolah - klik untuk expand */}
                      <button
                        onClick={() => toggleExpand(s.id)}
                        className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 hover:bg-slate-50/60 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex-shrink-0">
                            <School size={17} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold text-slate-800 truncate">{s.nama}</p>
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border bg-slate-100 text-slate-500 border-slate-200 flex-shrink-0">
                                {s.jenjang}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5">
                              <MapPin size={11} className="flex-shrink-0" />
                              {s.alamat}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Mars size={12} className="text-cyan-500" /> {totalLaki(s)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Venus size={12} className="text-rose-500" /> {totalPerempuan(s)}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-base font-bold text-slate-800">{total.toLocaleString("id-ID")}</span>
                            <span className="text-xs text-slate-400 ml-1">siswa</span>
                          </div>
                          <ChevronRight
                            size={16}
                            className={`text-slate-400 transition-transform flex-shrink-0 ${isOpen ? "rotate-90" : ""}`}
                          />
                        </div>
                      </button>

                      {/* Detail per tingkat - muncul saat diklik */}
                      {isOpen && (
                        <div className="border-t border-slate-100 bg-slate-50/50">
                          <div className="overflow-x-auto w-full">
                            <table className="w-full min-w-[480px] text-sm border-collapse">
                              <thead>
                                <tr className="bg-slate-50">
                                  <th className="border border-slate-200 text-left font-medium text-slate-500 text-xs uppercase tracking-wider px-4 sm:px-5 py-2.5 whitespace-nowrap">
                                    Tingkat
                                  </th>
                                  <th className="border border-slate-200 text-center font-medium text-slate-500 text-xs uppercase tracking-wider px-3 py-2.5 whitespace-nowrap">
                                    Laki-laki
                                  </th>
                                  <th className="border border-slate-200 text-center font-medium text-slate-500 text-xs uppercase tracking-wider px-3 py-2.5 whitespace-nowrap">
                                    Perempuan
                                  </th>
                                  <th className="border border-slate-200 text-center font-medium text-slate-500 text-xs uppercase tracking-wider px-3 py-2.5 whitespace-nowrap">
                                    Total
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 bg-white">
                                {s.tingkat.map((t, i) => (
                                  <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="border border-slate-200 px-4 sm:px-5 py-2.5 whitespace-nowrap">
                                      <span className="text-sm font-medium text-slate-800">{t.label}</span>
                                    </td>
                                    <td className="border border-slate-200 px-3 py-2.5 text-center text-slate-600 whitespace-nowrap">
                                      {t.laki}
                                    </td>
                                    <td className="border border-slate-200 px-3 py-2.5 text-center text-slate-600 whitespace-nowrap">
                                      {t.perempuan}
                                    </td>
                                    <td className="border border-slate-200 px-3 py-2.5 text-center whitespace-nowrap">
                                      <span className="text-sm font-semibold text-slate-800">{t.laki + t.perempuan}</span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr className="bg-slate-50/80">
                                  <td className="border border-slate-200 px-4 sm:px-5 py-2.5 text-sm font-semibold text-slate-700">
                                    Total {s.nama}
                                  </td>
                                  <td className="border border-slate-200 px-3 py-2.5 text-center text-sm font-semibold text-slate-700">
                                    {totalLaki(s)}
                                  </td>
                                  <td className="border border-slate-200 px-3 py-2.5 text-center text-sm font-semibold text-slate-700">
                                    {totalPerempuan(s)}
                                  </td>
                                  <td className="border border-slate-200 px-3 py-2.5 text-center text-sm font-bold text-slate-800">
                                    {total}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}