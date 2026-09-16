"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { Search, ArrowUpRight, ArrowDownRight } from "lucide-react";

// ===== DUMMY DATA =====
const summaryStats = [
  { label: "Total Sekolah", value: "128", change: "+12", trend: "up" },
  { label: "Total Yayasan", value: "42", change: "+3", trend: "up" },
  { label: "Pengguna Aktif", value: "1.198", change: "+54", trend: "up" },
  { label: "Total Pendapatan", value: "Rp 2,4 M", change: "+18%", trend: "up" },
  { label: "Langganan Aktif", value: "105", change: "-2", trend: "down" },
  { label: "Tingkat Retensi", value: "92%", change: "+5%", trend: "up" },
];

const monthlyData = [
  { month: "Jan", sekolah: 42, pendapatan: 180, pengguna: 850 },
  { month: "Feb", sekolah: 48, pendapatan: 210, pengguna: 920 },
  { month: "Mar", sekolah: 55, pendapatan: 250, pengguna: 980 },
  { month: "Apr", sekolah: 62, pendapatan: 290, pengguna: 1050 },
  { month: "May", sekolah: 70, pendapatan: 340, pengguna: 1120 },
  { month: "Jun", sekolah: 78, pendapatan: 390, pengguna: 1180 },
  { month: "Jul", sekolah: 85, pendapatan: 430, pengguna: 1198 },
  { month: "Aug", sekolah: 92, pendapatan: 480, pengguna: 1198 },
];

const reportData = [
  { id: 1, sekolah: "SMA Negeri 1 Jakarta", yayasan: "-", paket: "Professional", siswa: 720, guru: 45, pendapatan: 550000, status: "Aktif" },
  { id: 2, sekolah: "SMA Al-Azhar", yayasan: "Yayasan Al-Azhar", paket: "Enterprise", siswa: 560, guru: 38, pendapatan: 1200000, status: "Aktif" },
  { id: 3, sekolah: "SMP BPK Penabur", yayasan: "Yayasan BPK Penabur", paket: "Starter", siswa: 380, guru: 28, pendapatan: 250000, status: "Nonaktif" },
  { id: 4, sekolah: "SMA Taruna Nusantara", yayasan: "Yayasan Pengembangan", paket: "Professional", siswa: 450, guru: 30, pendapatan: 550000, status: "Trial" },
  { id: 5, sekolah: "SDN 01 Menteng", yayasan: "-", paket: "Professional", siswa: 320, guru: 22, pendapatan: 550000, status: "Aktif" },
  { id: 6, sekolah: "SMK Bina Insani", yayasan: "Yayasan Bina Insani", paket: "Enterprise", siswa: 850, guru: 52, pendapatan: 1200000, status: "Aktif" },
  { id: 7, sekolah: "SMP Islam Al-Falah", yayasan: "Yayasan Al-Falah", paket: "Starter", siswa: 340, guru: 25, pendapatan: 250000, status: "Trial" },
];

// ===== UTILITY =====
const formatRupiah = (angka) => {
  if (!angka) return "Rp0";
  return "Rp" + angka.toLocaleString("id-ID");
};

const getStatusColor = (status) => {
  const map = {
    Aktif: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Trial: "bg-amber-50 text-amber-700 border-amber-200",
    Nonaktif: "bg-rose-50 text-rose-700 border-rose-200",
  };
  return map[status] || map.Nonaktif;
};

// Satu warna aksen konsisten untuk seluruh grafik, supaya tidak "warna-warni".
const ACCENT = "#2563eb"; // blue-600

// ===== MAIN COMPONENT =====

export default function LaporanAnalitikPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu] = useState("laporan");
  const [activeTab, setActiveTab] = useState("ringkasan");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPaket, setFilterPaket] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const notifications = [
    { id: 1, title: "Pembaruan Sistem v2.0", desc: "Dikirim 2 jam lalu", read: false },
    { id: 2, title: "Pengingat: Backup Data", desc: "Dikirim 1 hari lalu", read: false },
  ];

  const maxSekolah = Math.max(...monthlyData.map((d) => d.sekolah));
  const maxPendapatan = Math.max(...monthlyData.map((d) => d.pendapatan));
  const maxPengguna = Math.max(...monthlyData.map((d) => d.pengguna));

  const filteredReport = reportData.filter((item) => {
    const matchSearch =
      item.sekolah.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.yayasan.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPaket = filterPaket === "Semua" || item.paket === filterPaket;
    const matchStatus = filterStatus === "Semua" || item.status === filterStatus;
    return matchSearch && matchPaket && matchStatus;
  });

  const totalPages = Math.ceil(filteredReport.length / itemsPerPage);
  const paginatedReport = filteredReport.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const tabs = [
    { id: "ringkasan", label: "Ringkasan" },
    { id: "sekolah", label: "Data Sekolah" },
    { id: "keuangan", label: "Keuangan" },
    { id: "pengguna", label: "Pengguna" },
  ];

  const paketOptions = ["Semua", "Starter", "Professional", "Enterprise"];
  const statusOptions = ["Semua", "Aktif", "Trial", "Nonaktif"];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        active={activeMenu}
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          notifications={notifications}
          user={{ name: "Super Admin", email: "admin@smartschool.com", avatar: "SA" }}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="w-full space-y-6">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 tracking-tight">
                  Laporan & Analitik
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Pantau performa sistem dan analisis data secara mendalam.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors">
                  Export
                </button>
                <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors">
                  Cetak
                </button>
              </div>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {summaryStats.map((stat) => {
                const TrendIcon = stat.trend === "up" ? ArrowUpRight : ArrowDownRight;
                const trendColor = stat.trend === "up" ? "text-emerald-600" : "text-rose-600";
                return (
                  <div
                    key={stat.label}
                    className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider truncate">{stat.label}</p>
                      <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${trendColor} flex-shrink-0 whitespace-nowrap`}>
                        <TrendIcon size={11} />
                        {stat.change}
                      </span>
                    </div>
                    <p className="mt-1.5 text-lg font-bold text-slate-800">{stat.value}</p>
                  </div>
                );
              })}
            </div>

            {/* TABS */}
            <div className="border-b border-slate-200 overflow-x-auto">
              <nav className="flex gap-1 min-w-max">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                        isActive
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* CONTENT */}
            <div className="space-y-4">
              {activeTab === "ringkasan" && (
                <RingkasanTab monthlyData={monthlyData} maxSekolah={maxSekolah} maxPendapatan={maxPendapatan} maxPengguna={maxPengguna} />
              )}
              {activeTab === "sekolah" && (
                <SekolahTab
                  reportData={paginatedReport}
                  filteredData={filteredReport}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  filterPaket={filterPaket}
                  setFilterPaket={setFilterPaket}
                  filterStatus={filterStatus}
                  setFilterStatus={setFilterStatus}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalPages={totalPages}
                  paketOptions={paketOptions}
                  statusOptions={statusOptions}
                  formatRupiah={formatRupiah}
                  getStatusColor={getStatusColor}
                />
              )}
              {activeTab === "keuangan" && <KeuanganTab monthlyData={monthlyData} formatRupiah={formatRupiah} />}
              {activeTab === "pengguna" && <PenggunaTab monthlyData={monthlyData} />}
            </div>

            {/* FOOTER */}
            <div className="text-center text-xs text-slate-400 py-3 border-t border-slate-200/60">
              © 2026 SmartSchool • Data diperbarui secara real-time
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ===== TAB RINGKASAN =====
function RingkasanTab({ monthlyData, maxSekolah, maxPendapatan, maxPengguna }) {
  const [selectedMetric, setSelectedMetric] = useState("sekolah");
  const metrics = [
    { id: "sekolah", label: "Sekolah", dataKey: "sekolah", max: maxSekolah },
    { id: "pendapatan", label: "Pendapatan (Juta)", dataKey: "pendapatan", max: maxPendapatan },
    { id: "pengguna", label: "Pengguna", dataKey: "pengguna", max: maxPengguna },
  ];

  const currentMetric = metrics.find((m) => m.id === selectedMetric) || metrics[0];
  const maxVal = currentMetric.max || 1;

  return (
    <div className="space-y-4">
      {/* Chart Controls */}
      <div className="flex flex-wrap items-center gap-2 bg-white rounded-xl border border-slate-200/80 p-3 shadow-sm">
        <span className="text-xs font-medium text-slate-500 mr-1">Tampilkan:</span>
        {metrics.map((metric) => (
          <button
            key={metric.id}
            onClick={() => setSelectedMetric(metric.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              selectedMetric === metric.id
                ? "bg-slate-800 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {metric.label}
          </button>
        ))}
      </div>

      {/* Area Chart */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-700">Analitik {currentMetric.label}</h3>
          <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
            {monthlyData.length} bulan
          </span>
        </div>

        <div className="relative">
          <svg className="w-full h-56" viewBox="0 0 700 220" preserveAspectRatio="none">
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={ACCENT} stopOpacity="0.25" />
                <stop offset="100%" stopColor={ACCENT} stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {[0, 25, 50, 75, 100].map((percent) => {
              const y = 205 - (percent / 100) * 190;
              return (
                <line key={percent} x1="25" y1={y} x2="675" y2={y} stroke="#e2e8f0" strokeWidth="0.8" />
              );
            })}

            {/* Area Path */}
            <polygon
              points={
                monthlyData
                  .map((d, i) => {
                    const x = 25 + (i / (monthlyData.length - 1)) * 650;
                    const val = d[currentMetric.dataKey];
                    const y = 205 - (val / maxVal) * 190;
                    return `${x},${y}`;
                  })
                  .join(" ") + `,675,205,25,205`
              }
              fill="url(#areaGradient)"
            />

            {/* Line Path */}
            <polyline
              points={monthlyData
                .map((d, i) => {
                  const x = 25 + (i / (monthlyData.length - 1)) * 650;
                  const val = d[currentMetric.dataKey];
                  const y = 205 - (val / maxVal) * 190;
                  return `${x},${y}`;
                })
                .join(" ")}
              fill="none"
              stroke={ACCENT}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data Points */}
            {monthlyData.map((d, i) => {
              const x = 25 + (i / (monthlyData.length - 1)) * 650;
              const val = d[currentMetric.dataKey];
              const y = 205 - (val / maxVal) * 190;
              const isLast = i === monthlyData.length - 1;
              return (
                <g key={i} className="group">
                  <circle
                    cx={x}
                    cy={y}
                    r={isLast ? 4.5 : 3}
                    fill={isLast ? ACCENT : "white"}
                    stroke={ACCENT}
                    strokeWidth="1.8"
                  />
                  <foreignObject x={x - 25} y={y - 32} width="50" height="24" className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-slate-800 text-white text-[10px] px-2 py-1 rounded text-center">{val}</div>
                  </foreignObject>
                </g>
              );
            })}

            {/* X-Axis Labels */}
            {monthlyData.map((d, i) => {
              const x = 25 + (i / (monthlyData.length - 1)) * 650;
              return (
                <text key={i} x={x} y="215" fontSize="10" fill="#94a3b8" textAnchor="middle">
                  {d.month}
                </text>
              );
            })}

            {/* Y-Axis Labels */}
            {[0, 25, 50, 75, 100].map((percent) => {
              const y = 205 - (percent / 100) * 190;
              const value = Math.round((percent / 100) * maxVal);
              return (
                <text key={percent} x="20" y={y + 3} fontSize="9" fill="#94a3b8" textAnchor="end">
                  {value}
                </text>
              );
            })}
          </svg>

          <div className="absolute top-2 right-4 bg-white/95 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-xs font-bold text-slate-800">
              {monthlyData[monthlyData.length - 1][currentMetric.dataKey]}
              {selectedMetric === "pendapatan" ? " Jt" : ""}
            </span>
          </div>
        </div>

        {/* Metric Summary */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-200/60">
          <div className="text-center">
            <p className="text-[9px] text-slate-400">Terendah</p>
            <p className="text-sm font-bold text-slate-700">
              {Math.min(...monthlyData.map((d) => d[currentMetric.dataKey]))}
              {selectedMetric === "pendapatan" ? " Jt" : ""}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[9px] text-slate-400">Rata-rata</p>
            <p className="text-sm font-bold text-slate-700">
              {Math.round(monthlyData.reduce((sum, d) => sum + d[currentMetric.dataKey], 0) / monthlyData.length)}
              {selectedMetric === "pendapatan" ? " Jt" : ""}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[9px] text-slate-400">Tertinggi</p>
            <p className="text-sm font-bold text-slate-700">
              {Math.max(...monthlyData.map((d) => d[currentMetric.dataKey]))}
              {selectedMetric === "pendapatan" ? " Jt" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Ringkasan 3 metrik */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metrics.map((metric) => {
          const currentVal = monthlyData[monthlyData.length - 1][metric.dataKey];
          const firstVal = monthlyData[0][metric.dataKey];
          const growth = firstVal > 0 ? ((currentVal - firstVal) / firstVal) * 100 : 0;
          const max = Math.max(...monthlyData.map((d) => d[metric.dataKey])) || 1;

          return (
            <div
              key={metric.id}
              className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedMetric(metric.id)}
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-slate-400">{metric.label}</p>
                <span className={`text-xs font-medium ${growth >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {growth >= 0 ? "+" : ""}
                  {growth.toFixed(1)}%
                </span>
              </div>
              <p className="text-lg font-bold text-slate-800 mt-1">
                {currentVal}
                {metric.id === "pendapatan" ? " Jt" : ""}
              </p>
              <div className="mt-1.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-blue-600" style={{ width: `${(currentVal / max) * 100}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ===== TAB SEKOLAH =====
function SekolahTab({
  reportData, filteredData, searchQuery, setSearchQuery,
  filterPaket, setFilterPaket, filterStatus, setFilterStatus,
  currentPage, setCurrentPage, totalPages,
  paketOptions, statusOptions, formatRupiah, getStatusColor,
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-200/80 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari sekolah atau yayasan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-shadow"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={filterPaket}
            onChange={(e) => setFilterPaket(e.target.value)}
            className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-600 cursor-pointer"
          >
            {paketOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-600 cursor-pointer"
          >
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <button
            onClick={() => { setSearchQuery(""); setFilterPaket("Semua"); setFilterStatus("Semua"); }}
            className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200/80">
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Sekolah</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Yayasan</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Paket</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Siswa</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Guru</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Pendapatan</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reportData.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Tidak ada data</td></tr>
            ) : (
              reportData.map((item) => {
                const statusColor = getStatusColor(item.status);
                return (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-slate-800">{item.sekolah}</td>
                    <td className="px-4 py-2.5 text-slate-500 hidden md:table-cell">{item.yayasan}</td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        {item.paket}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 hidden sm:table-cell">{item.siswa}</td>
                    <td className="px-4 py-2.5 text-slate-600 hidden lg:table-cell">{item.guru}</td>
                    <td className="px-4 py-2.5 text-slate-600 hidden md:table-cell">{formatRupiah(item.pendapatan)}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-slate-200/80 flex flex-col xs:flex-row items-center justify-between gap-2">
          <span className="text-xs text-slate-500">{filteredData.length} data</span>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm text-slate-500 hover:bg-slate-100 rounded-lg disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            {[...Array(Math.min(totalPages, 5))].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-8 h-8 text-sm rounded-lg transition-colors ${currentPage === i + 1 ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}
              >
                {i + 1}
              </button>
            ))}
            {totalPages > 5 && <span className="text-slate-400 px-1">…</span>}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm text-slate-500 hover:bg-slate-100 rounded-lg disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== TAB KEUANGAN =====
function KeuanganTab({ monthlyData, formatRupiah }) {
  const totalPendapatan = monthlyData.reduce((sum, d) => sum + d.pendapatan, 0);
  const rataRata = totalPendapatan / monthlyData.length;
  const maxPendapatan = Math.max(...monthlyData.map((d) => d.pendapatan));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <p className="text-xs text-slate-400">Total Pendapatan</p>
          <p className="text-2xl font-bold text-slate-800">{formatRupiah(totalPendapatan)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <p className="text-xs text-slate-400">Rata-rata / Bulan</p>
          <p className="text-2xl font-bold text-slate-800">{formatRupiah(Math.round(rataRata))}</p>
          <p className="text-[10px] text-slate-400 mt-1">Dari {monthlyData.length} bulan</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <p className="text-xs text-slate-400">Bulan Tertinggi</p>
          <p className="text-2xl font-bold text-emerald-600">{formatRupiah(maxPendapatan)}</p>
          <p className="text-[10px] text-slate-400 mt-1">
            {monthlyData.find((d) => d.pendapatan === maxPendapatan)?.month}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Detail Pendapatan per Bulan</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50">
                <th className="px-3 py-2 text-left text-xs font-medium text-slate-400">Bulan</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-slate-400">Pendapatan</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-slate-400">%</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((item, idx) => {
                const persen = (item.pendapatan / totalPendapatan) * 100;
                return (
                  <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors">
                    <td className="px-3 py-2 font-medium text-slate-700">{item.month}</td>
                    <td className="px-3 py-2 text-right text-slate-600">{formatRupiah(item.pendapatan)}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="text-xs text-slate-500">{persen.toFixed(1)}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ===== TAB PENGGUNA =====
function PenggunaTab({ monthlyData }) {
  const totalPengguna = monthlyData[monthlyData.length - 1]?.pengguna || 0;
  const growth = monthlyData.length > 1
    ? ((monthlyData[monthlyData.length - 1].pengguna - monthlyData[0].pengguna) / monthlyData[0].pengguna) * 100
    : 0;
  const maxPengguna = Math.max(...monthlyData.map((d) => d.pengguna));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <p className="text-xs text-slate-400">Total Pengguna</p>
          <p className="text-2xl font-bold text-slate-800">{totalPengguna.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <p className="text-xs text-slate-400">Pertumbuhan</p>
          <p className={`text-2xl font-bold ${growth >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {growth >= 0 ? "+" : ""}
            {growth.toFixed(1)}%
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Sejak awal</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
          <p className="text-xs text-slate-400">Bulan Ini</p>
          <p className="text-2xl font-bold text-slate-800">{monthlyData[monthlyData.length - 1]?.pengguna.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-1">{monthlyData[monthlyData.length - 1]?.month}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Distribusi Pengguna per Bulan</h4>
        <div className="relative">
          <svg className="w-full h-40" viewBox="0 0 680 150" preserveAspectRatio="none">
            {[0, 25, 50, 75, 100].map((percent) => {
              const y = 135 - (percent / 100) * 120;
              return <line key={percent} x1="30" y1={y} x2="660" y2={y} stroke="#e2e8f0" strokeWidth="0.5" />;
            })}

            {monthlyData.map((item, idx) => {
              const x = 30 + (idx / (monthlyData.length - 1)) * 630;
              const height = (item.pengguna / maxPengguna) * 120;
              const y = 135 - height;
              return (
                <rect key={idx} x={x - 6} y={y} width="12" height={height || 2} rx="2" fill={ACCENT} className="transition-all duration-700 hover:opacity-80 cursor-pointer">
                  <title>{item.month}: {item.pengguna} pengguna</title>
                </rect>
              );
            })}

            {monthlyData.map((item, idx) => {
              const x = 30 + (idx / (monthlyData.length - 1)) * 630;
              return (
                <text key={idx} x={x} y="142" fontSize="9" fill="#94a3b8" textAnchor="middle">
                  {item.month}
                </text>
              );
            })}
          </svg>

          <div className="absolute top-2 right-4 bg-white/95 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-xs font-bold text-slate-800">{monthlyData[monthlyData.length - 1]?.pengguna}</span>
            <span className="text-[10px] text-slate-400 ml-1">terbaru</span>
          </div>
        </div>
        <div className="flex justify-between mt-1 text-[9px] text-slate-400 px-1">
          <span>0</span>
          <span>{maxPengguna}</span>
        </div>
      </div>
    </div>
  );
}