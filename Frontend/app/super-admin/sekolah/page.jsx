"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  School,
  Building2,
  Users,
  GraduationCap,
  Package,
  UserCheck,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar,
  Bell,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  MapPin,
  Phone,
  Mail as MailIcon,
  Globe as GlobeIcon,
  UserCog,
  BookOpen,
  LayoutGrid,
  Zap,
  Key,
  Power,
  Send,
  Sparkles,
  X,
} from "lucide-react";


const sekolahData = [
  {
    id: 1,
    logo: "🏫",
    nama: "SMA Negeri 1 Jakarta",
    npsn: "2020212",
    jenjang: "SMA",
    statusSekolah: "Negeri",
    yayasan: "-",
    paket: "Professional",
    status: "Aktif",
    bergabung: "2024-01-15",
    email: "sman1jakarta@sch.id",
    telepon: "(021) 1234567",
    website: "www.sman1jakarta.sch.id",
    alamat: "Jl. Merdeka No. 1, Jakarta Pusat",
    provinsi: "DKI Jakarta",
    kota: "Jakarta Pusat",
    kecamatan: "Gambir",
    kelurahan: "Gambir",
    kodePos: "10110",
    tanggalMulai: "2024-01-15",
    tanggalBerakhir: "2025-01-15",
    totalGuru: 45,
    totalSiswa: 720,
    totalKelas: 24,
    totalMapel: 12,
    totalAdmin: 3,
  },
  {
    id: 2,
    logo: "🏫",
    nama: "SMA Al-Azhar Kelapa Gading",
    npsn: "2020441",
    jenjang: "SMA",
    statusSekolah: "Swasta",
    yayasan: "Yayasan Al-Azhar",
    paket: "Enterprise",
    status: "Aktif",
    bergabung: "2024-02-01",
    email: "alazhar@sch.id",
    telepon: "(021) 7654321",
    website: "www.alazhar.sch.id",
    alamat: "Jl. Kelapa Gading No. 10, Jakarta Utara",
    provinsi: "DKI Jakarta",
    kota: "Jakarta Utara",
    kecamatan: "Kelapa Gading",
    kelurahan: "Kelapa Gading Barat",
    kodePos: "14240",
    tanggalMulai: "2024-02-01",
    tanggalBerakhir: "2025-02-01",
    totalGuru: 38,
    totalSiswa: 560,
    totalKelas: 18,
    totalMapel: 10,
    totalAdmin: 2,
  },
  {
    id: 3,
    logo: "🏫",
    nama: "SMP BPK Penabur",
    npsn: "2020102",
    jenjang: "SMP",
    statusSekolah: "Swasta",
    yayasan: "Yayasan BPK Penabur",
    paket: "Starter",
    status: "Nonaktif",
    bergabung: "2023-08-10",
    email: "bpkpenabur@sch.id",
    telepon: "(021) 9876543",
    website: "www.bpkpenabur.sch.id",
    alamat: "Jl. Kebon Jeruk No. 5, Jakarta Barat",
    provinsi: "DKI Jakarta",
    kota: "Jakarta Barat",
    kecamatan: "Kebon Jeruk",
    kelurahan: "Kebon Jeruk",
    kodePos: "11530",
    tanggalMulai: "2023-08-10",
    tanggalBerakhir: "2024-08-10",
    totalGuru: 28,
    totalSiswa: 380,
    totalKelas: 12,
    totalMapel: 8,
    totalAdmin: 2,
  },
  {
    id: 4,
    logo: "🏫",
    nama: "SMA Taruna Nusantara",
    npsn: "2020333",
    jenjang: "SMA",
    statusSekolah: "Swasta",
    yayasan: "Yayasan Pengembangan Pendidikan",
    paket: "Enterprise",
    status: "Trial",
    bergabung: "2024-06-01",
    email: "tarunanusantara@sch.id",
    telepon: "(021) 5555555",
    website: "www.tarunanusantara.sch.id",
    alamat: "Jl. Bintaro Raya No. 20, Tangerang Selatan",
    provinsi: "Banten",
    kota: "Tangerang Selatan",
    kecamatan: "Bintaro",
    kelurahan: "Bintaro",
    kodePos: "15224",
    tanggalMulai: "2024-06-01",
    tanggalBerakhir: "2024-09-01",
    totalGuru: 30,
    totalSiswa: 450,
    totalKelas: 15,
    totalMapel: 10,
    totalAdmin: 2,
  },
  {
    id: 5,
    logo: "🏫",
    nama: "SDN 01 Menteng",
    npsn: "2020555",
    jenjang: "SD",
    statusSekolah: "Negeri",
    yayasan: "-",
    paket: "Professional",
    status: "Aktif",
    bergabung: "2024-03-20",
    email: "sdn01menteng@sch.id",
    telepon: "(021) 4444444",
    website: "www.sdn01menteng.sch.id",
    alamat: "Jl. Menteng Raya No. 15, Jakarta Pusat",
    provinsi: "DKI Jakarta",
    kota: "Jakarta Pusat",
    kecamatan: "Menteng",
    kelurahan: "Menteng",
    kodePos: "10310",
    tanggalMulai: "2024-03-20",
    tanggalBerakhir: "2025-03-20",
    totalGuru: 22,
    totalSiswa: 320,
    totalKelas: 10,
    totalMapel: 6,
    totalAdmin: 1,
  },
  {
    id: 6,
    logo: "🏫",
    nama: "SMK Bina Insani",
    npsn: "2020666",
    jenjang: "SMK",
    statusSekolah: "Swasta",
    yayasan: "Yayasan Bina Insani",
    paket: "Enterprise",
    status: "Aktif",
    bergabung: "2024-04-05",
    email: "binainsani@sch.id",
    telepon: "(021) 3333333",
    website: "www.binainsani.sch.id",
    alamat: "Jl. BSD Raya No. 8, Tangerang",
    provinsi: "Banten",
    kota: "Tangerang",
    kecamatan: "BSD",
    kelurahan: "BSD",
    kodePos: "15310",
    tanggalMulai: "2024-04-05",
    tanggalBerakhir: "2025-04-05",
    totalGuru: 52,
    totalSiswa: 850,
    totalKelas: 30,
    totalMapel: 18,
    totalAdmin: 4,
  },
  {
    id: 7,
    logo: "🏫",
    nama: "SMP Islam Terpadu Al-Falah",
    npsn: "2020777",
    jenjang: "SMP",
    statusSekolah: "Swasta",
    yayasan: "Yayasan Al-Falah",
    paket: "Starter",
    status: "Trial",
    bergabung: "2024-07-01",
    email: "alfalah@sch.id",
    telepon: "(021) 2222222",
    website: "www.alfalah.sch.id",
    alamat: "Jl. Depok Raya No. 12, Depok",
    provinsi: "Jawa Barat",
    kota: "Depok",
    kecamatan: "Depok",
    kelurahan: "Depok",
    kodePos: "16411",
    tanggalMulai: "2024-07-01",
    tanggalBerakhir: "2024-10-01",
    totalGuru: 25,
    totalSiswa: 340,
    totalKelas: 11,
    totalMapel: 8,
    totalAdmin: 2,
  },
];

const stats = {
  total: 125,
  aktif: 120,
  nonaktif: 5,
  trial: 18,
};

const provinsiOptions = ["Semua", "DKI Jakarta", "Banten", "Jawa Barat", "Jawa Timur"];
const kotaOptions = ["Semua", "Jakarta Pusat", "Jakarta Utara", "Jakarta Barat", "Tangerang Selatan", "Tangerang", "Depok"];
const jenjangOptions = ["Semua", "SD", "SMP", "SMA", "SMK"];
const statusOptions = ["Semua", "Aktif", "Nonaktif", "Trial"];


export default function DataSekolahPage() {
  const [activeMenu, setActiveMenu] = useState("sekolah");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvinsi, setSelectedProvinsi] = useState("Semua");
  const [selectedKota, setSelectedKota] = useState("Semua");
  const [selectedJenjang, setSelectedJenjang] = useState("Semua");
  const [selectedStatus, setSelectedStatus] = useState("Semua");
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const itemsPerPage = 5;

  const notifications = [
    { id: 1, title: "Pembaruan Sistem v2.0", desc: "Dikirim 2 jam lalu", read: false },
    { id: 2, title: "Pengingat: Backup Data", desc: "Dikirim 1 hari lalu", read: false },
    { id: 3, title: "Sekolah baru mendaftar", desc: "Dikirim 3 hari lalu", read: true },
  ];

  // Deteksi layar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const filteredData = sekolahData.filter((item) => {
    const matchSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       item.npsn.includes(searchQuery) ||
                       item.yayasan.toLowerCase().includes(searchQuery.toLowerCase());
    const matchProvinsi = selectedProvinsi === "Semua" || item.provinsi === selectedProvinsi;
    const matchKota = selectedKota === "Semua" || item.kota === selectedKota;
    const matchJenjang = selectedJenjang === "Semua" || item.jenjang === selectedJenjang;
    const matchStatus = selectedStatus === "Semua" || item.status === selectedStatus;
    return matchSearch && matchProvinsi && matchKota && matchJenjang && matchStatus;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewDetail = (school) => {
    setSelectedSchool(school);
    setShowDetail(true);
  };

  const handleEdit = (school) => {
    setSelectedSchool(school);
    setShowModal(true);
  };

  const handleDelete = (school) => {
    if (confirm(`Apakah Anda yakin ingin menghapus ${school.nama}?`)) {
      // Handle delete
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedProvinsi("Semua");
    setSelectedKota("Semua");
    setSelectedJenjang("Semua");
    setSelectedStatus("Semua");
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar
        active={activeMenu}
        setActive={setActiveMenu}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          notifications={notifications}
          user={{ name: "Sarah", email: "sarah@smartschool.com", avatar: "SA" }}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-white">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            {/* HEADER - Responsive */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 flex flex-wrap items-center gap-2 sm:gap-3">
                  Data Sekolah
                  <span className="text-xs sm:text-sm font-normal text-slate-400 bg-slate-50/80 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-slate-200/50">
                    Data Master
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1 flex items-center gap-1.5 sm:gap-2">
                  <Sparkles size={14} className="text-slate-400 hidden sm:inline" />
                  Kelola seluruh sekolah yang terdaftar pada SmartSchool.
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <button className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow">
                  <FileSpreadsheet size={14} className="text-slate-400 hidden sm:inline" />
                  <span className="hidden xs:inline">Export</span>
                  <span className="xs:hidden">📊</span>
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all hover:-translate-y-0.5"
                >
                  <Plus size={14} />
                  <span className="hidden xs:inline">Tambah Sekolah</span>
                  <span className="xs:hidden">Tambah</span>
                </button>
              </div>
            </div>

            {/* STATISTIK - Responsive Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
              <StatCardPremium
                label="Total Sekolah"
                value={stats.total}
                icon={School}
                gradient="from-blue-500 to-blue-600"
                bg="bg-blue-50"
                textColor="text-blue-600"
              />
              <StatCardPremium
                label="Aktif"
                value={stats.aktif}
                icon={CheckCircle}
                gradient="from-emerald-500 to-emerald-600"
                bg="bg-emerald-50"
                textColor="text-emerald-600"
              />
              <StatCardPremium
                label="Trial"
                value={stats.trial}
                icon={ClockIcon}
                gradient="from-amber-500 to-amber-600"
                bg="bg-amber-50"
                textColor="text-amber-600"
              />
              <StatCardPremium
                label="Nonaktif"
                value={stats.nonaktif}
                icon={XCircle}
                gradient="from-rose-500 to-rose-600"
                bg="bg-rose-50"
                textColor="text-rose-600"
              />
            </div>

            {/* FILTER & SEARCH - Responsive */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-3 sm:p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col gap-3 sm:gap-4">
                {/* Search - full width on mobile */}
                <div className="relative w-full">
                  <Search size={16} className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari data, sekolah, atau laporan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-xs sm:text-sm bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Filter dropdowns - scroll horizontal on mobile */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0">
                  <select
                    value={selectedProvinsi}
                    onChange={(e) => setSelectedProvinsi(e.target.value)}
                    className="px-2 sm:px-3 py-1.5 sm:py-2.5 text-xs sm:text-sm bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer text-slate-600 min-w-[100px] sm:min-w-[120px] flex-shrink-0"
                  >
                    {provinsiOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>

                  <select
                    value={selectedKota}
                    onChange={(e) => setSelectedKota(e.target.value)}
                    className="px-2 sm:px-3 py-1.5 sm:py-2.5 text-xs sm:text-sm bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer text-slate-600 min-w-[100px] sm:min-w-[120px] flex-shrink-0"
                  >
                    {kotaOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>

                  <select
                    value={selectedJenjang}
                    onChange={(e) => setSelectedJenjang(e.target.value)}
                    className="px-2 sm:px-3 py-1.5 sm:py-2.5 text-xs sm:text-sm bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer text-slate-600 min-w-[80px] sm:min-w-[100px] flex-shrink-0"
                  >
                    {jenjangOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>

                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-2 sm:px-3 py-1.5 sm:py-2.5 text-xs sm:text-sm bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer text-slate-600 min-w-[80px] sm:min-w-[100px] flex-shrink-0"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>

                  <button
                    onClick={resetFilters}
                    className="px-2 sm:px-3 py-1.5 sm:py-2.5 text-xs sm:text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors flex-shrink-0"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* TABLE - Responsive */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              {/* Mobile card view for very small screens */}
              {isMobile && paginatedData.length > 0 ? (
                <div className="divide-y divide-slate-100/80 p-3">
                  {paginatedData.map((item) => (
                    <div key={item.id} className="py-3 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200/50 flex items-center justify-center text-xl shadow-sm flex-shrink-0">
                          {item.logo}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 text-sm truncate">{item.nama}</p>
                          <p className="text-xs text-slate-500 font-mono">{item.npsn}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleViewDetail(item)}
                            className="p-1.5 rounded-xl hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 rounded-xl hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-all"
                          >
                            <Edit size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                          {item.jenjang}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                          item.paket === "Enterprise" ? "bg-purple-50 text-purple-600 border-purple-200" :
                          item.paket === "Professional" ? "bg-blue-50 text-blue-600 border-blue-200" :
                          "bg-slate-50 text-slate-600 border-slate-200"
                        }`}>
                          {item.paket}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                          item.status === "Aktif" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                          item.status === "Trial" ? "bg-amber-50 text-amber-600 border-amber-200" :
                          "bg-rose-50 text-rose-600 border-rose-200"
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Desktop table view
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50/60 border-b border-slate-200/60">
                        <th className="px-3 sm:px-4 py-3 sm:py-3.5 text-left text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Logo</th>
                        <th className="px-3 sm:px-4 py-3 sm:py-3.5 text-left text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama Sekolah</th>
                        <th className="hidden md:table-cell px-3 sm:px-4 py-3 sm:py-3.5 text-left text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">NPSN</th>
                        <th className="px-3 sm:px-4 py-3 sm:py-3.5 text-left text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Jenjang</th>
                        <th className="hidden lg:table-cell px-3 sm:px-4 py-3 sm:py-3.5 text-left text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Yayasan</th>
                        <th className="hidden sm:table-cell px-3 sm:px-4 py-3 sm:py-3.5 text-left text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Paket</th>
                        <th className="px-3 sm:px-4 py-3 sm:py-3.5 text-left text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-3 sm:px-4 py-3 sm:py-3.5 text-right text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/80">
                      {paginatedData.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                            <div className="flex flex-col items-center gap-2">
                              <Search size={32} className="text-slate-300" />
                              <p className="text-sm font-medium">Tidak ada data yang ditemukan</p>
                              <p className="text-xs text-slate-400">Coba ubah filter atau kata kunci pencarian</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedData.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-3 sm:px-4 py-3 sm:py-3.5">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200/50 flex items-center justify-center text-base sm:text-xl shadow-sm">
                                {item.logo}
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 py-3 sm:py-3.5 font-medium text-slate-800 text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">
                              {item.nama}
                            </td>
                            <td className="hidden md:table-cell px-3 sm:px-4 py-3 sm:py-3.5 text-slate-500 font-mono text-[10px] sm:text-xs">
                              {item.npsn}
                            </td>
                            <td className="px-3 sm:px-4 py-3 sm:py-3.5">
                              <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-slate-100 text-slate-600 whitespace-nowrap">
                                {item.jenjang}
                              </span>
                            </td>
                            <td className="hidden lg:table-cell px-3 sm:px-4 py-3 sm:py-3.5 text-slate-500 text-xs sm:text-sm truncate max-w-[120px]">
                              {item.yayasan}
                            </td>
                            <td className="hidden sm:table-cell px-3 sm:px-4 py-3 sm:py-3.5">
                              <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border whitespace-nowrap ${
                                item.paket === "Enterprise" ? "bg-purple-50 text-purple-600 border-purple-200" :
                                item.paket === "Professional" ? "bg-blue-50 text-blue-600 border-blue-200" :
                                "bg-slate-50 text-slate-600 border-slate-200"
                              }`}>
                                {item.paket}
                              </span>
                            </td>
                            <td className="px-3 sm:px-4 py-3 sm:py-3.5">
                              <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border whitespace-nowrap ${
                                item.status === "Aktif" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                                item.status === "Trial" ? "bg-amber-50 text-amber-600 border-amber-200" :
                                "bg-rose-50 text-rose-600 border-rose-200"
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="px-3 sm:px-4 py-3 sm:py-3.5 text-right">
                              <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                                <button
                                  onClick={() => handleViewDetail(item)}
                                  className="p-1.5 sm:p-2 rounded-xl hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all"
                                  title="Detail"
                                >
                                  <Eye size={14} className="sm:w-4 sm:h-4" />
                                </button>
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="p-1.5 sm:p-2 rounded-xl hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-all"
                                  title="Edit"
                                >
                                  <Edit size={14} className="sm:w-4 sm:h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item)}
                                  className="p-1.5 sm:p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all"
                                  title="Hapus"
                                >
                                  <Trash2 size={14} className="sm:w-4 sm:h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* PAGINATION - Responsive */}
              <div className="px-3 sm:px-4 py-3 sm:py-3.5 border-t border-slate-200/60 flex flex-col xs:flex-row items-center justify-between gap-2 sm:gap-3">
                <p className="text-[10px] sm:text-xs text-slate-500 text-center xs:text-left">
                  <span className="hidden xs:inline">Menampilkan </span>
                  <span className="font-medium text-slate-700">{paginatedData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span>
                  <span className="hidden xs:inline"> sampai </span>
                  <span className="font-medium text-slate-700">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span>
                  <span className="hidden xs:inline"> dari </span>
                  <span className="font-medium text-slate-700">{filteredData.length}</span>
                  <span className="hidden xs:inline"> data</span>
                </p>
                <div className="flex items-center gap-0.5 sm:gap-1 flex-wrap justify-center">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-2 sm:px-3.5 py-1 sm:py-1.5 text-[10px] sm:text-sm text-slate-500 hover:bg-slate-100 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <span className="hidden xs:inline">Previous</span>
                    <span className="xs:hidden">‹</span>
                  </button>
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-7 h-7 sm:w-9 sm:h-9 text-[10px] sm:text-sm rounded-xl transition-all ${
                          currentPage === page
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25"
                            : "text-slate-500 hover:bg-slate-100"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  {totalPages > 5 && (
                    <>
                      <span className="text-slate-400 px-0.5 sm:px-1">…</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className={`w-7 h-7 sm:w-9 sm:h-9 text-[10px] sm:text-sm rounded-xl transition-all ${
                          currentPage === totalPages
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25"
                            : "text-slate-500 hover:bg-slate-100"
                        }`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-2 sm:px-3.5 py-1 sm:py-1.5 text-[10px] sm:text-sm text-slate-500 hover:bg-slate-100 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <span className="hidden xs:inline">Next</span>
                    <span className="xs:hidden">›</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL TAMBAH/EDIT - Responsive */}
      {showModal && (
        <SchoolModalPremium
          onClose={() => setShowModal(false)}
          school={selectedSchool}
        />
      )}

      {/* MODAL DETAIL - Responsive */}
      {showDetail && selectedSchool && (
        <SchoolDetailModalPremium
          onClose={() => setShowDetail(false)}
          school={selectedSchool}
        />
      )}
    </div>
  );
}


function StatCardPremium({ label, value, icon: Icon, gradient, bg, textColor }) {
  return (
    <div className="group bg-white rounded-xl sm:rounded-2xl border border-slate-200/60 p-3 sm:p-5 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-center gap-2 sm:gap-4">
        <div className={`relative w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${bg} flex items-center justify-center overflow-hidden flex-shrink-0`}>
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
          <Icon size={16} className={`${textColor} relative z-10 sm:w-[22px] sm:h-[22px]`} />
        </div>
        <div className="min-w-0">
          <p className="text-[8px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider truncate">{label}</p>
          <p className="text-base sm:text-2xl font-bold text-slate-800">{value}</p>
        </div>
      </div>
    </div>
  );
}


function SchoolModalPremium({ onClose, school }) {
  const isEdit = !!school;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-200/60 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800">
            {isEdit ? "Edit Sekolah" : "Tambah Sekolah"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
          >
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          {/* Informasi Sekolah */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 sm:mb-4 flex items-center gap-2">
              <School size={16} className="text-blue-500" />
              Informasi Sekolah
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Nama Sekolah</label>
                <input
                  type="text"
                  defaultValue={isEdit ? school.nama : ""}
                  className="w-full px-3 py-2 text-sm bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  placeholder="Masukkan nama sekolah"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">NPSN</label>
                <input
                  type="text"
                  defaultValue={isEdit ? school.npsn : ""}
                  className="w-full px-3 py-2 text-sm bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  placeholder="Masukkan NPSN"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Jenjang</label>
                <select className="w-full px-3 py-2 text-sm bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer text-slate-600">
                  <option>SD</option>
                  <option>SMP</option>
                  <option selected={isEdit && school.jenjang === "SMA"}>SMA</option>
                  <option>SMK</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Status Sekolah</label>
                <select className="w-full px-3 py-2 text-sm bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer text-slate-600">
                  <option>Negeri</option>
                  <option selected={isEdit && school.statusSekolah === "Swasta"}>Swasta</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                <input
                  type="email"
                  defaultValue={isEdit ? school.email : ""}
                  className="w-full px-3 py-2 text-sm bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  placeholder="Masukkan email"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">No Telepon</label>
                <input
                  type="text"
                  defaultValue={isEdit ? school.telepon : ""}
                  className="w-full px-3 py-2 text-sm bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  placeholder="Masukkan no telepon"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Website</label>
                <input
                  type="text"
                  defaultValue={isEdit ? school.website : ""}
                  className="w-full px-3 py-2 text-sm bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  placeholder="Masukkan website"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Logo</label>
                <input
                  type="file"
                  className="w-full px-3 py-2 text-sm bg-slate-50/80 border border-slate-200/60 rounded-xl file:mr-4 file:py-1.5 file:px-3 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 file:border-0 file:rounded-lg hover:file:bg-blue-100 transition-colors cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Alamat */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 sm:mb-4 flex items-center gap-2">
              <MapPin size={16} className="text-emerald-500" />
              Alamat
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Provinsi</label>
                <select className="w-full px-3 py-2 text-sm bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer text-slate-600">
                  <option>DKI Jakarta</option>
                  <option>Banten</option>
                  <option>Jawa Barat</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Kabupaten/Kota</label>
                <select className="w-full px-3 py-2 text-sm bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer text-slate-600">
                  <option>Jakarta Pusat</option>
                  <option>Jakarta Utara</option>
                  <option>Jakarta Barat</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Kecamatan</label>
                <input
                  type="text"
                  defaultValue={isEdit ? school.kecamatan : ""}
                  className="w-full px-3 py-2 text-sm bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  placeholder="Kecamatan"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Kelurahan</label>
                <input
                  type="text"
                  defaultValue={isEdit ? school.kelurahan : ""}
                  className="w-full px-3 py-2 text-sm bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  placeholder="Kelurahan"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Kode Pos</label>
                <input
                  type="text"
                  defaultValue={isEdit ? school.kodePos : ""}
                  className="w-full px-3 py-2 text-sm bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                  placeholder="Kode Pos"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1">Alamat Lengkap</label>
                <textarea
                  defaultValue={isEdit ? school.alamat : ""}
                  rows={2}
                  className="w-full px-3 py-2 text-sm bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none"
                  placeholder="Alamat lengkap"
                />
              </div>
            </div>
          </div>

          {/* Yayasan & Paket */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 sm:mb-4 flex items-center gap-2">
              <Building2 size={16} className="text-purple-500" />
              Yayasan & Paket Langganan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Pilih Yayasan</label>
                <select className="w-full px-3 py-2 text-sm bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer text-slate-600">
                  <option>- Tanpa Yayasan -</option>
                  <option>Yayasan Al-Azhar</option>
                  <option>Yayasan BPK Penabur</option>
                  <option>Yayasan Pengembangan Pendidikan</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Paket Langganan</label>
                <select className="w-full px-3 py-2 text-sm bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer text-slate-600">
                  <option>Starter</option>
                  <option selected={isEdit && school.paket === "Professional"}>Professional</option>
                  <option>Enterprise</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  defaultValue={isEdit ? school.tanggalMulai : ""}
                  className="w-full px-3 py-2 text-sm bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Tanggal Berakhir</label>
                <input
                  type="date"
                  defaultValue={isEdit ? school.tanggalBerakhir : ""}
                  className="w-full px-3 py-2 text-sm bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                <select className="w-full px-3 py-2 text-sm bg-slate-50/80 border border-slate-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all cursor-pointer text-slate-600">
                  <option selected={isEdit && school.status === "Aktif"}>Aktif</option>
                  <option selected={isEdit && school.status === "Trial"}>Trial</option>
                  <option selected={isEdit && school.status === "Nonaktif"}>Nonaktif</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3 pt-4 border-t border-slate-200/60">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              Batal
            </button>
            <button className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all">
              {isEdit ? "Update" : "Simpan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


function SchoolDetailModalPremium({ onClose, school }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-200/60 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200/50 flex items-center justify-center text-xl sm:text-2xl shadow-sm flex-shrink-0">
              {school.logo}
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-xl font-bold text-slate-800 truncate">{school.nama}</h2>
              <p className="text-[10px] sm:text-xs text-slate-500 font-mono">NPSN: {school.npsn}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all flex-shrink-0"
          >
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <InfoItemPremium label="Jenjang" value={school.jenjang} />
            <InfoItemPremium label="Status Sekolah" value={school.statusSekolah} />
            <InfoItemPremium label="Paket" value={school.paket} />
            <InfoItemPremium label="Status" value={school.status} isStatus />
            <InfoItemPremium label="Yayasan" value={school.yayasan} />
            <InfoItemPremium label="Bergabung" value={new Date(school.bergabung).toLocaleDateString("id-ID")} />
          </div>

          <div className="bg-slate-50/60 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/40">
            <h3 className="text-sm font-semibold text-slate-700 mb-2 sm:mb-3 flex items-center gap-2">
              <MailIcon size={16} className="text-slate-400" />
              Kontak
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-sm">
              <div className="flex items-center gap-2 text-slate-600 bg-white/80 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-slate-200/40 text-xs sm:text-sm truncate">
                <MailIcon size={12} className="text-slate-400 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                <span className="truncate">{school.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 bg-white/80 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-slate-200/40 text-xs sm:text-sm truncate">
                <Phone size={12} className="text-slate-400 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                <span className="truncate">{school.telepon}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 bg-white/80 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-slate-200/40 text-xs sm:text-sm truncate">
                <GlobeIcon size={12} className="text-slate-400 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                <span className="truncate">{school.website}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50/60 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/40">
            <h3 className="text-sm font-semibold text-slate-700 mb-2 sm:mb-3 flex items-center gap-2">
              <MapPin size={16} className="text-slate-400" />
              Alamat
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">{school.alamat}</p>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {school.kelurahan}, {school.kecamatan}, {school.kota}, {school.provinsi} - {school.kodePos}
            </p>
          </div>

          <div className="bg-slate-50/60 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200/40">
            <h3 className="text-sm font-semibold text-slate-700 mb-2 sm:mb-3 flex items-center gap-2">
              <Calendar size={16} className="text-slate-400" />
              Masa Langganan
            </h3>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
              <span className="text-slate-600">
                Mulai: <span className="font-medium text-slate-700">{new Date(school.tanggalMulai).toLocaleDateString("id-ID")}</span>
              </span>
              <span className="text-slate-300">→</span>
              <span className="text-slate-600">
                Berakhir: <span className="font-medium text-slate-700">{new Date(school.tanggalBerakhir).toLocaleDateString("id-ID")}</span>
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2 sm:mb-3 flex items-center gap-2">
              <BarChart3 size={16} className="text-slate-400" />
              Statistik Sekolah
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
              <StatMiniPremium label="Guru" value={school.totalGuru} icon={Users} />
              <StatMiniPremium label="Siswa" value={school.totalSiswa} icon={GraduationCap} />
              <StatMiniPremium label="Kelas" value={school.totalKelas} icon={LayoutGrid} />
              <StatMiniPremium label="Mapel" value={school.totalMapel} icon={BookOpen} />
              <StatMiniPremium label="Admin" value={school.totalAdmin} icon={UserCog} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2 sm:mb-3 flex items-center gap-2">
              <Zap size={16} className="text-slate-400" />
              Aksi Cepat
            </h3>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <QuickActionButtonPremium icon={Package} label="Kelola Langganan" color="blue" />
              <QuickActionButtonPremium icon={Key} label="Reset Password" color="amber" />
              <QuickActionButtonPremium icon={Users} label="Lihat Pengguna" color="purple" />
              <QuickActionButtonPremium icon={Power} label="Nonaktifkan" color="rose" />
              <QuickActionButtonPremium icon={Send} label="Kirim Pengumuman" color="emerald" />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3 pt-4 border-t border-slate-200/60">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              Tutup
            </button>
            <button className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all">
              Edit Sekolah
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


function InfoItemPremium({ label, value, isStatus }) {
  const statusColor = isStatus
    ? value === "Aktif" ? "text-emerald-600 bg-emerald-50 border-emerald-200" :
      value === "Trial" ? "text-amber-600 bg-amber-50 border-amber-200" :
      "text-rose-600 bg-rose-50 border-rose-200"
    : "text-slate-700 bg-slate-50 border-slate-200";

  return (
    <div className="p-2 sm:p-3 rounded-xl bg-white border border-slate-200/40 shadow-sm">
      <p className="text-[10px] sm:text-xs text-slate-400">{label}</p>
      <p className={`text-xs sm:text-sm font-medium mt-0.5 ${isStatus ? "" : "text-slate-700"}`}>
        {isStatus ? (
          <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium border ${statusColor}`}>
            {value}
          </span>
        ) : value}
      </p>
    </div>
  );
}


function StatMiniPremium({ label, value, icon: Icon }) {
  return (
    <div className="p-2 sm:p-3 rounded-xl bg-white border border-slate-200/40 text-center shadow-sm hover:shadow-md transition-all">
      <Icon size={14} className="text-slate-400 mx-auto mb-0.5 sm:mb-1 sm:w-4 sm:h-4" />
      <p className="text-base sm:text-lg font-bold text-slate-700">{value}</p>
      <p className="text-[8px] sm:text-[10px] text-slate-400 font-medium truncate">{label}</p>
    </div>
  );
}


function QuickActionButtonPremium({ icon: Icon, label, color }) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200/50",
    amber: "bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200/50",
    purple: "bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200/50",
    rose: "bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-200/50",
    emerald: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200/50",
  };

  return (
    <button className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-medium border transition-all hover:shadow-sm ${colorMap[color]}`}>
      <Icon size={12} className="sm:w-3.5 sm:h-3.5" />
      <span className="hidden xs:inline">{label}</span>
    </button>
  );
}