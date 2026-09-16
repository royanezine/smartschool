"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

import {
  Search,
  Plus,
  Eye,
  Edit3,
  CalendarDays,
  Users,
  UserRound,
  HeartHandshake,
  Award,
  AlertTriangle,
  Brain,
  ClipboardCheck,
  TrendingUp,
  TrendingDown,
  Clock3,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Filter,
  RotateCcw,
  X,
  BookOpen,
  Target,
  MessageSquare,
  FileText,
  Star,
  Activity,
  ShieldCheck,
} from "lucide-react";

/* =========================================================
   MOCK DATA
========================================================= */

const KONSELING_DATA = [
  {
    id: 1,
    siswa: "Rizky Pratama",
    nis: "20260001",
    kelas: "XII IPA 1",
    tanggal: "09 September 2026",
    waktu: "08:30",
    konselor: "Ibu Siti Rahma",
    kategori: "Akademik",
    status: "Selesai",
    prioritas: "Normal",
    catatan:
      "Konsultasi mengenai persiapan menghadapi ujian akhir.",
    avatar: "RP",
  },
  {
    id: 2,
    siswa: "Nabila Putri",
    nis: "20260002",
    kelas: "XI IPS 2",
    tanggal: "09 September 2026",
    waktu: "09:30",
    konselor: "Ibu Maya Anggraini",
    kategori: "Pribadi",
    status: "Terjadwal",
    prioritas: "Sedang",
    catatan: "Sesi lanjutan.",
    avatar: "NP",
  },
  {
    id: 3,
    siswa: "Fajar Hidayat",
    nis: "20260003",
    kelas: "X IPA 2",
    tanggal: "09 September 2026",
    waktu: "10:00",
    konselor: "Ibu Siti Rahma",
    kategori: "Sosial",
    status: "Terjadwal",
    prioritas: "Normal",
    catatan: "Konseling adaptasi lingkungan sekolah.",
    avatar: "FH",
  },
  {
    id: 4,
    siswa: "Sarah Aulia",
    nis: "20260007",
    kelas: "XII IPA 2",
    tanggal: "08 September 2026",
    waktu: "11:00",
    konselor: "Ibu Maya Anggraini",
    kategori: "Karier",
    status: "Selesai",
    prioritas: "Normal",
    catatan: "Diskusi pilihan perguruan tinggi.",
    avatar: "SA",
  },
  {
    id: 5,
    siswa: "Yoga Saputra",
    nis: "20260004",
    kelas: "X IPA 2",
    tanggal: "08 September 2026",
    waktu: "13:00",
    konselor: "Ibu Siti Rahma",
    kategori: "Akademik",
    status: "Dibatalkan",
    prioritas: "Rendah",
    catatan: "Siswa berhalangan hadir.",
    avatar: "YS",
  },
  {
    id: 6,
    siswa: "Putri Amelia",
    nis: "20260005",
    kelas: "XII IPS 1",
    tanggal: "07 September 2026",
    waktu: "09:00",
    konselor: "Ibu Maya Anggraini",
    kategori: "Pribadi",
    status: "Selesai",
    prioritas: "Tinggi",
    catatan: "Perlu sesi tindak lanjut.",
    avatar: "PA",
  },
];

const PELANGGARAN_DATA = [
  {
    id: 1,
    siswa: "Fajar Hidayat",
    nis: "20260003",
    kelas: "X IPA 2",
    pelanggaran: "Terlambat masuk sekolah",
    kategori: "Kedisiplinan",
    point: 5,
    tanggal: "09 September 2026",
    status: "Diproses",
    avatar: "FH",
  },
  {
    id: 2,
    siswa: "Yoga Saputra",
    nis: "20260004",
    kelas: "X IPA 2",
    pelanggaran: "Tidak menggunakan atribut lengkap",
    kategori: "Kedisiplinan",
    point: 3,
    tanggal: "08 September 2026",
    status: "Selesai",
    avatar: "YS",
  },
  {
    id: 3,
    siswa: "Andi Setiawan",
    nis: "20260006",
    kelas: "XI IPA 1",
    pelanggaran: "Tidak mengikuti kegiatan wajib",
    kategori: "Tata Tertib",
    point: 5,
    tanggal: "07 September 2026",
    status: "Diproses",
    avatar: "AS",
  },
  {
    id: 4,
    siswa: "Rizky Pratama",
    nis: "20260001",
    kelas: "XII IPA 1",
    pelanggaran: "Terlambat mengumpulkan tugas",
    kategori: "Akademik",
    point: 2,
    tanggal: "05 September 2026",
    status: "Selesai",
    avatar: "RP",
  },
  {
    id: 5,
    siswa: "Nabila Putri",
    nis: "20260002",
    kelas: "XI IPS 2",
    pelanggaran: "Pelanggaran ringan",
    kategori: "Tata Tertib",
    point: 2,
    tanggal: "04 September 2026",
    status: "Selesai",
    avatar: "NP",
  },
];

const PRESTASI_DATA = [
  {
    id: 1,
    siswa: "Rizky Pratama",
    kelas: "XII IPA 1",
    prestasi: "Juara 1 Olimpiade Matematika",
    tingkat: "Provinsi",
    tanggal: "06 September 2026",
    kategori: "Akademik",
    avatar: "RP",
  },
  {
    id: 2,
    siswa: "Nabila Putri",
    kelas: "XI IPS 2",
    prestasi: "Juara 2 Lomba Debat Bahasa Indonesia",
    tingkat: "Kota",
    tanggal: "01 September 2026",
    kategori: "Non Akademik",
    avatar: "NP",
  },
  {
    id: 3,
    siswa: "Sarah Aulia",
    kelas: "XII IPA 2",
    prestasi: "Juara 1 Desain Poster Digital",
    tingkat: "Sekolah",
    tanggal: "28 Agustus 2026",
    kategori: "Kreativitas",
    avatar: "SA",
  },
];

/* =========================================================
   CONFIG
========================================================= */

const KONSELING_STATUS = {
  Selesai: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-100",
    dot: "bg-emerald-500",
  },
  Terjadwal: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-100",
    dot: "bg-blue-500",
  },
  Dibatalkan: {
    bg: "bg-slate-100",
    text: "text-slate-500",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
};

const PRIORITY_CONFIG = {
  Tinggi: "border-red-100 bg-red-50 text-red-700",
  Sedang: "border-amber-100 bg-amber-50 text-amber-700",
  Normal: "border-slate-200 bg-slate-50 text-slate-600",
  Rendah: "border-slate-200 bg-slate-50 text-slate-500",
};

/* =========================================================
   STATUS BADGE
========================================================= */

function KonselingStatus({ status }) {
  const config =
    KONSELING_STATUS[status] || KONSELING_STATUS.Terjadwal;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${config.bg} ${config.text} ${config.border}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
      />
      {status}
    </span>
  );
}

function PriorityBadge({ priority }) {
  return (
    <span
      className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-medium ${
        PRIORITY_CONFIG[priority] ||
        PRIORITY_CONFIG.Normal
      }`}
    >
      {priority}
    </span>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconBg,
  iconColor,
  trend,
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">
            {title}
          </p>

          <div className="mt-1 flex items-center gap-2">
            <p className="text-2xl font-bold tracking-tight text-slate-800">
              {value}
            </p>

            {trend && (
              <span
                className={`inline-flex items-center text-[10px] font-semibold ${
                  trend.type === "up"
                    ? "text-emerald-600"
                    : "text-red-500"
                }`}
              >
                {trend.type === "up" ? (
                  <TrendingUp size={11} />
                ) : (
                  <TrendingDown size={11} />
                )}
                {trend.value}
              </span>
            )}
          </div>

          <p className="mt-1 truncate text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}
        >
          <Icon size={19} className={iconColor} />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SECTION CARD
========================================================= */

function SectionCard({
  title,
  description,
  icon: Icon,
  children,
  action,
  onAction,
}) {
  return (
    <div className="flex min-h-0 flex-col rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#eaf1ff]">
            <Icon size={16} className="text-[#155DFC]" />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-slate-800">
              {title}
            </h3>

            <p className="truncate text-[10px] text-slate-400">
              {description}
            </p>
          </div>
        </div>

        {action && (
          <button
            onClick={onAction}
            className="shrink-0 text-xs font-semibold text-[#155DFC] hover:text-[#0d47c9]"
          >
            {action}
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function BKPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [activeTab, setActiveTab] = useState(
    "konseling"
  );

  const [searchQuery, setSearchQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState(
    "Semua"
  );

  const [classFilter, setClassFilter] = useState("Semua");

  const [currentPage, setCurrentPage] = useState(1);

  const [selectedKonseling, setSelectedKonseling] =
    useState(null);

  const [selectedPelanggaran, setSelectedPelanggaran] =
    useState(null);

  const [selectedPrestasi, setSelectedPrestasi] =
    useState(null);

  const itemsPerPage = 5;

  /* =========================================================
     FILTER KONSELING
  ========================================================= */

  const filteredKonseling = useMemo(() => {
    return KONSELING_DATA.filter((item) => {
      const search = searchQuery.toLowerCase().trim();

      const matchesSearch =
        !search ||
        item.siswa.toLowerCase().includes(search) ||
        item.nis.toLowerCase().includes(search) ||
        item.kelas.toLowerCase().includes(search) ||
        item.konselor.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "Semua" ||
        item.status === statusFilter;

      const matchesClass =
        classFilter === "Semua" ||
        item.kelas === classFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesClass
      );
    });
  }, [searchQuery, statusFilter, classFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredKonseling.length / itemsPerPage
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedKonseling = filteredKonseling.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage
  );

  /* =========================================================
     RESET FILTER
  ========================================================= */

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("Semua");
    setClassFilter("Semua");
    setCurrentPage(1);
  };

  /* =========================================================
     TAB
  ========================================================= */

  const tabs = [
    {
      id: "konseling",
      label: "Sesi Konseling",
      icon: MessageSquare,
    },
    {
      id: "pelanggaran",
      label: "Pelanggaran",
      icon: AlertTriangle,
    },
    {
      id: "prestasi",
      label: "Prestasi",
      icon: Award,
    },
    {
      id: "asesmen",
      label: "Asesmen & Minat Bakat",
      icon: Brain,
    },
  ];

  /* =========================================================
     SIDEBAR
  ========================================================= */

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar
        active="bk"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* HEADER */}

        <div className="sticky top-0 z-40 shrink-0">
          <Header
            toggleSidebar={toggleSidebar}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        {/* ===================================================
            CONTENT
        =================================================== */}

        <main className="min-h-0 flex-1 overflow-hidden">
          <div className="flex h-full min-h-0 flex-col px-4 py-4 sm:px-5 lg:px-6">
            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="mb-4 shrink-0">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf1ff]">
                    <HeartHandshake
                      size={20}
                      className="text-[#155DFC]"
                    />
                  </div>

                  <div className="min-w-0">
                    <h1 className="truncate text-lg font-bold tracking-tight text-slate-800 sm:text-xl">
                      Bimbingan Konseling
                    </h1>

                    <p className="truncate text-xs text-slate-500">
                      Kelola layanan konseling, perkembangan,
                      prestasi, dan pembinaan siswa
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    router.push("/admin/bk/konseling/tambah")
                  }
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#155DFC] to-[#0d47c9] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
                >
                  <Plus size={17} />
                  Tambah Sesi
                </button>
              </div>
            </div>

            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="mb-4 grid shrink-0 grid-cols-2 gap-3 xl:grid-cols-4">
              <StatCard
                title="Sesi Konseling"
                value="24"
                description="Sesi bulan ini"
                icon={MessageSquare}
                iconBg="bg-[#eaf1ff]"
                iconColor="text-[#155DFC]"
                trend={{
                  type: "up",
                  value: "12%",
                }}
              />

              <StatCard
                title="Prestasi Siswa"
                value="18"
                description="Prestasi tercatat"
                icon={Award}
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
                trend={{
                  type: "up",
                  value: "8%",
                }}
              />

              <StatCard
                title="Pelanggaran"
                value="12"
                description="Kasus bulan ini"
                icon={AlertTriangle}
                iconBg="bg-amber-50"
                iconColor="text-amber-600"
                trend={{
                  type: "down",
                  value: "6%",
                }}
              />

              <StatCard
                title="Asesmen"
                value="86%"
                description="Siswa sudah mengikuti"
                icon={Brain}
                iconBg="bg-violet-50"
                iconColor="text-violet-600"
              />
            </div>

            {/* =================================================
                QUICK SUMMARY
            ================================================= */}

            <div className="mb-4 grid shrink-0 grid-cols-2 gap-3 md:grid-cols-4">
              <QuickSummary
                icon={Clock3}
                title="Terjadwal Hari Ini"
                value="5"
                description="Sesi konseling"
              />

              <QuickSummary
                icon={CheckCircle2}
                title="Selesai"
                value="16"
                description="Sesi bulan ini"
              />

              <QuickSummary
                icon={AlertTriangle}
                title="Kasus Aktif"
                value="4"
                description="Perlu tindak lanjut"
              />

              <QuickSummary
                icon={Target}
                title="Minat Bakat"
                value="92%"
                description="Data terisi"
              />
            </div>

            {/* =================================================
                TABS
            ================================================= */}

            <div className="mb-4 shrink-0 overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-sm">
              <div className="flex min-w-max">
                {tabs.map((tab) => {
                  const Icon = tab.icon;

                  const active =
                    activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setCurrentPage(1);
                      }}
                      className={`relative flex items-center gap-2 px-4 py-3 text-xs font-semibold transition ${
                        active
                          ? "text-[#155DFC]"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      <Icon size={15} />

                      {tab.label}

                      {active && (
                        <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#155DFC]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* =================================================
                CONTENT AREA
            ================================================= */}

            <div className="min-h-0 flex-1">
              {activeTab === "konseling" && (
                <div className="flex h-full min-h-0 flex-col rounded-xl border border-slate-200/80 bg-white shadow-sm">
                  {/* FILTER */}

                  <div className="shrink-0 border-b border-slate-100 p-3 sm:p-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                      <div className="relative min-w-0 flex-1">
                        <Search
                          size={17}
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(
                              e.target.value
                            );
                            setCurrentPage(1);
                          }}
                          placeholder="Cari nama siswa, NIS, kelas, atau konselor..."
                          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#8bb4ff] focus:bg-white focus:ring-2 focus:ring-[#155DFC]/10"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:flex">
                        <select
                          value={statusFilter}
                          onChange={(e) => {
                            setStatusFilter(
                              e.target.value
                            );
                            setCurrentPage(1);
                          }}
                          className="h-10 min-w-[135px] rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none focus:border-[#8bb4ff] focus:ring-2 focus:ring-[#155DFC]/10"
                        >
                          <option value="Semua">
                            Semua Status
                          </option>
                          <option value="Terjadwal">
                            Terjadwal
                          </option>
                          <option value="Selesai">
                            Selesai
                          </option>
                          <option value="Dibatalkan">
                            Dibatalkan
                          </option>
                        </select>

                        <select
                          value={classFilter}
                          onChange={(e) => {
                            setClassFilter(
                              e.target.value
                            );
                            setCurrentPage(1);
                          }}
                          className="h-10 min-w-[135px] rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none focus:border-[#8bb4ff] focus:ring-2 focus:ring-[#155DFC]/10"
                        >
                          <option value="Semua">
                            Semua Kelas
                          </option>
                          <option value="X IPA 2">
                            X IPA 2
                          </option>
                          <option value="XI IPS 2">
                            XI IPS 2
                          </option>
                          <option value="XI IPA 1">
                            XI IPA 1
                          </option>
                          <option value="XII IPA 1">
                            XII IPA 1
                          </option>
                          <option value="XII IPA 2">
                            XII IPA 2
                          </option>
                          <option value="XII IPS 1">
                            XII IPS 1
                          </option>
                        </select>

                        <button
                          onClick={resetFilters}
                          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-500 transition hover:bg-slate-50"
                        >
                          <RotateCcw size={14} />
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* TABLE */}

                  <div className="min-h-0 flex-1 overflow-auto">
                    <table className="w-full min-w-[950px] border-collapse">
                      <thead className="sticky top-0 z-10 bg-slate-50">
                        <tr className="border-b border-slate-200">
                          <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            Siswa
                          </th>

                          <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            Jadwal
                          </th>

                          <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            Konselor
                          </th>

                          <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            Kategori
                          </th>

                          <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            Prioritas
                          </th>

                          <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            Status
                          </th>

                          <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            Aksi
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {paginatedKonseling.map(
                          (item) => (
                            <tr
                              key={item.id}
                              className="transition hover:bg-slate-50/70"
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eaf1ff] text-xs font-bold text-[#155DFC]">
                                    {item.avatar}
                                  </div>

                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-700">
                                      {item.siswa}
                                    </p>

                                    <p className="mt-0.5 text-[11px] text-slate-400">
                                      {item.nis} ·{" "}
                                      {item.kelas}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-3">
                                <p className="text-xs font-medium text-slate-700">
                                  {item.tanggal}
                                </p>

                                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                                  <Clock3 size={11} />
                                  {item.waktu}
                                </p>
                              </td>

                              <td className="px-4 py-3">
                                <p className="text-xs font-medium text-slate-700">
                                  {item.konselor}
                                </p>

                                <p className="mt-0.5 text-[10px] text-slate-400">
                                  Guru BK
                                </p>
                              </td>

                              <td className="px-4 py-3">
                                <span className="rounded-md border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                  {item.kategori}
                                </span>
                              </td>

                              <td className="px-4 py-3">
                                <PriorityBadge
                                  priority={
                                    item.prioritas
                                  }
                                />
                              </td>

                              <td className="px-4 py-3">
                                <KonselingStatus
                                  status={item.status}
                                />
                              </td>

                              <td className="px-4 py-3">
                                <div className="flex justify-end gap-1">
                                  <button
                                    onClick={() =>
                                      setSelectedKonseling(
                                        item
                                      )
                                    }
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-[#eaf1ff] hover:text-[#155DFC]"
                                    title="Lihat detail"
                                  >
                                    <Eye size={16} />
                                  </button>

                                  <button
                                    onClick={() =>
                                      setSelectedKonseling(
                                        item
                                      )
                                    }
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-[#eaf1ff] hover:text-[#155DFC]"
                                    title="Edit"
                                  >
                                    <Edit3 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* PAGINATION */}

                  <div className="flex shrink-0 flex-col gap-2 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-slate-400">
                      Menampilkan{" "}
                      <span className="font-medium text-slate-600">
                        {filteredKonseling.length ===
                        0
                          ? 0
                          : (safeCurrentPage - 1) *
                              itemsPerPage +
                            1}
                      </span>{" "}
                      -{" "}
                      <span className="font-medium text-slate-600">
                        {Math.min(
                          safeCurrentPage *
                            itemsPerPage,
                          filteredKonseling.length
                        )}
                      </span>{" "}
                      dari{" "}
                      <span className="font-medium text-slate-600">
                        {filteredKonseling.length}
                      </span>{" "}
                      sesi
                    </p>

                    <div className="flex items-center gap-1">
                      <button
                        disabled={safeCurrentPage === 1}
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.max(1, prev - 1)
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40"
                      >
                        <ChevronLeft size={15} />
                      </button>

                      {Array.from(
                        {
                          length: totalPages,
                        },
                        (_, index) => index + 1
                      ).map((page) => (
                        <button
                          key={page}
                          onClick={() =>
                            setCurrentPage(page)
                          }
                          className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-medium ${
                            safeCurrentPage === page
                              ? "bg-[#155DFC] text-white"
                              : "text-slate-500 hover:bg-slate-100"
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        disabled={
                          safeCurrentPage === totalPages
                        }
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(
                              totalPages,
                              prev + 1
                            )
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40"
                      >
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* =================================================
                  PELANGGARAN
              ================================================= */}

              {activeTab === "pelanggaran" && (
                <SectionCard
                  title="Pelanggaran Siswa"
                  description="Daftar pelanggaran dan point siswa"
                  icon={AlertTriangle}
                  action="Kelola Semua"
                  onAction={() =>
                    router.push(
                      "/admin/bk/pelanggaran"
                    )
                  }
                >
                  <table className="w-full min-w-[850px] border-collapse">
                    <thead className="sticky top-0 z-10 bg-slate-50">
                      <tr className="border-b border-slate-200">
                        <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          Siswa
                        </th>

                        <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          Pelanggaran
                        </th>

                        <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          Kategori
                        </th>

                        <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          Point
                        </th>

                        <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          Tanggal
                        </th>

                        <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          Aksi
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {PELANGGARAN_DATA.map(
                        (item) => (
                          <tr
                            key={item.id}
                            className="transition hover:bg-slate-50/70"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eaf1ff] text-xs font-bold text-[#155DFC]">
                                  {item.avatar}
                                </div>

                                <div>
                                  <p className="text-sm font-semibold text-slate-700">
                                    {item.siswa}
                                  </p>

                                  <p className="text-[11px] text-slate-400">
                                    {item.nis} ·{" "}
                                    {item.kelas}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <p className="max-w-[240px] truncate text-xs font-medium text-slate-700">
                                {item.pelanggaran}
                              </p>
                            </td>

                            <td className="px-4 py-3">
                              <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                                {item.kategori}
                              </span>
                            </td>

                            <td className="px-4 py-3">
                              <span className="font-bold text-red-600">
                                {item.point}
                              </span>

                              <span className="ml-1 text-[10px] text-slate-400">
                                point
                              </span>
                            </td>

                            <td className="px-4 py-3 text-xs text-slate-500">
                              {item.tanggal}
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex justify-end">
                                <button
                                  onClick={() =>
                                    setSelectedPelanggaran(
                                      item
                                    )
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-[#eaf1ff] hover:text-[#155DFC]"
                                >
                                  <Eye size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </SectionCard>
              )}

              {/* =================================================
                  PRESTASI
              ================================================= */}

              {activeTab === "prestasi" && (
                <SectionCard
                  title="Prestasi Siswa"
                  description="Rekap prestasi akademik dan non akademik"
                  icon={Award}
                  action="Kelola Semua"
                  onAction={() =>
                    router.push(
                      "/admin/bk/prestasi"
                    )
                  }
                >
                  <table className="w-full min-w-[800px] border-collapse">
                    <thead className="sticky top-0 z-10 bg-slate-50">
                      <tr className="border-b border-slate-200">
                        <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          Siswa
                        </th>

                        <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          Prestasi
                        </th>

                        <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          Tingkat
                        </th>

                        <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          Kategori
                        </th>

                        <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          Tanggal
                        </th>

                        <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          Aksi
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {PRESTASI_DATA.map((item) => (
                        <tr
                          key={item.id}
                          className="transition hover:bg-slate-50/70"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eaf1ff] text-xs font-bold text-[#155DFC]">
                                {item.avatar}
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-slate-700">
                                  {item.siswa}
                                </p>

                                <p className="text-[11px] text-slate-400">
                                  {item.kelas}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <p className="max-w-[270px] truncate text-xs font-semibold text-slate-700">
                              {item.prestasi}
                            </p>
                          </td>

                          <td className="px-4 py-3">
                            <span className="rounded-md border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                              {item.tingkat}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-xs text-slate-600">
                            {item.kategori}
                          </td>

                          <td className="px-4 py-3 text-xs text-slate-500">
                            {item.tanggal}
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex justify-end">
                              <button
                                onClick={() =>
                                  setSelectedPrestasi(
                                    item
                                  )
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-[#eaf1ff] hover:text-[#155DFC]"
                              >
                                <Eye size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </SectionCard>
              )}

              {/* =================================================
                  ASESMEN
              ================================================= */}

              {activeTab === "asesmen" && (
                <div className="grid h-full min-h-0 gap-4 lg:grid-cols-3">
                  {/* OVERVIEW */}

                  <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
                        <Brain
                          size={20}
                          className="text-violet-600"
                        />
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-800">
                          Asesmen Siswa
                        </h3>

                        <p className="text-[10px] text-slate-400">
                          Ringkasan pengisian asesmen
                        </p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-3xl font-bold text-slate-800">
                            92%
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Kelengkapan data
                          </p>
                        </div>

                        <ClipboardCheck
                          size={28}
                          className="text-violet-400"
                        />
                      </div>

                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-violet-500"
                          style={{
                            width: "92%",
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <ProgressRow
                        label="Minat & Bakat"
                        value="96%"
                      />

                      <ProgressRow
                        label="Kepribadian"
                        value="91%"
                      />

                      <ProgressRow
                        label="Akademik"
                        value="94%"
                      />

                      <ProgressRow
                        label="Karier"
                        value="87%"
                      />
                    </div>
                  </div>

                  {/* MINAT BAKAT */}

                  <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">
                          Minat Dominan
                        </h3>

                        <p className="mt-0.5 text-[10px] text-slate-400">
                          Hasil asesmen siswa
                        </p>
                      </div>

                      <Star
                        size={18}
                        className="text-amber-500"
                      />
                    </div>

                    <div className="mt-5 space-y-4">
                      <InterestRow
                        label="Teknologi"
                        value="82"
                      />

                      <InterestRow
                        label="Sains"
                        value="74"
                      />

                      <InterestRow
                        label="Seni & Kreativitas"
                        value="68"
                      />

                      <InterestRow
                        label="Sosial"
                        value="61"
                      />

                      <InterestRow
                        label="Bahasa"
                        value="57"
                      />
                    </div>
                  </div>

                  {/* QUICK ACTION */}

                  <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">
                        Menu Bimbingan Konseling
                      </h3>

                      <p className="mt-0.5 text-[10px] text-slate-400">
                        Akses pengelolaan data BK
                      </p>
                    </div>

                    <div className="mt-4 space-y-2">
                      <QuickAction
                        icon={MessageSquare}
                        title="Sesi Konseling Siswa"
                        description="Kelola jadwal dan riwayat"
                        onClick={() =>
                          router.push(
                            "/admin/bk/konseling"
                          )
                        }
                      />

                      <QuickAction
                        icon={Award}
                        title="Prestasi Siswa"
                        description="Data prestasi siswa"
                        onClick={() =>
                          router.push(
                            "/admin/bk/prestasi"
                          )
                        }
                      />

                      <QuickAction
                        icon={AlertTriangle}
                        title="Pelanggaran Siswa"
                        description="Catatan pelanggaran"
                        onClick={() =>
                          router.push(
                            "/admin/bk/pelanggaran"
                          )
                        }
                      />

                      <QuickAction
                        icon={Target}
                        title="Kategori & Point"
                        description="Pengaturan point pelanggaran"
                        onClick={() =>
                          router.push(
                            "/admin/bk/kategori-pelanggaran"
                          )
                        }
                      />

                      <QuickAction
                        icon={Brain}
                        title="Asesmen & Minat Bakat"
                        description="Hasil asesmen siswa"
                        onClick={() =>
                          router.push(
                            "/admin/bk/asesmen"
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* =========================================================
          DETAIL KONSELING MODAL
      ========================================================= */}

      {selectedKonseling && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  Detail Sesi Konseling
                </h2>

                <p className="mt-0.5 text-xs text-slate-400">
                  Informasi lengkap sesi konseling siswa
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedKonseling(null)
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-5">
              <div className="flex items-center gap-3 rounded-xl border border-[#c7dbff] bg-[#f5f8ff] p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-sm font-bold text-[#155DFC]">
                  {selectedKonseling.avatar}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-slate-800">
                    {selectedKonseling.siswa}
                  </h3>

                  <p className="text-xs text-slate-400">
                    {selectedKonseling.nis} ·{" "}
                    {selectedKonseling.kelas}
                  </p>
                </div>

                <KonselingStatus
                  status={selectedKonseling.status}
                />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <DetailItem
                  icon={CalendarDays}
                  label="Tanggal"
                  value={selectedKonseling.tanggal}
                />

                <DetailItem
                  icon={Clock3}
                  label="Waktu"
                  value={selectedKonseling.waktu}
                />

                <DetailItem
                  icon={UserRound}
                  label="Konselor"
                  value={selectedKonseling.konselor}
                />

                <DetailItem
                  icon={BookOpen}
                  label="Kategori"
                  value={selectedKonseling.kategori}
                />

                <DetailItem
                  icon={Activity}
                  label="Prioritas"
                  value={selectedKonseling.prioritas}
                />

                <DetailItem
                  icon={ShieldCheck}
                  label="Status"
                  value={selectedKonseling.status}
                />
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Catatan Konseling
                </p>

                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {selectedKonseling.catatan}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
              <button
                onClick={() =>
                  setSelectedKonseling(null)
                }
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Tutup
              </button>

              <button className="inline-flex items-center gap-2 rounded-lg bg-[#155DFC] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0d47c9]">
                <Edit3 size={15} />
                Edit Sesi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          DETAIL PELANGGARAN MODAL
      ========================================================= */}

      {selectedPelanggaran && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  Detail Pelanggaran
                </h2>

                <p className="mt-0.5 text-xs text-slate-400">
                  Informasi pelanggaran siswa
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedPelanggaran(null)
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xs font-bold text-[#155DFC]">
                  {selectedPelanggaran.avatar}
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {selectedPelanggaran.siswa}
                  </p>

                  <p className="text-xs text-slate-400">
                    {selectedPelanggaran.nis} ·{" "}
                    {selectedPelanggaran.kelas}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <DetailItem
                  icon={AlertTriangle}
                  label="Pelanggaran"
                  value={
                    selectedPelanggaran.pelanggaran
                  }
                />

                <DetailItem
                  icon={FileText}
                  label="Kategori"
                  value={
                    selectedPelanggaran.kategori
                  }
                />

                <DetailItem
                  icon={TrendingDown}
                  label="Point"
                  value={`${selectedPelanggaran.point} Point`}
                />

                <DetailItem
                  icon={CalendarDays}
                  label="Tanggal"
                  value={selectedPelanggaran.tanggal}
                />
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 px-5 py-4">
              <button
                onClick={() =>
                  setSelectedPelanggaran(null)
                }
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          DETAIL PRESTASI MODAL
      ========================================================= */}

      {selectedPrestasi && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  Detail Prestasi
                </h2>

                <p className="mt-0.5 text-xs text-slate-400">
                  Informasi prestasi siswa
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedPrestasi(null)
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xs font-bold text-[#155DFC]">
                  {selectedPrestasi.avatar}
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {selectedPrestasi.siswa}
                  </p>

                  <p className="text-xs text-slate-400">
                    {selectedPrestasi.kelas}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Prestasi
                </p>

                <p className="mt-1 text-sm font-bold text-slate-800">
                  {selectedPrestasi.prestasi}
                </p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <DetailItem
                  icon={Award}
                  label="Tingkat"
                  value={selectedPrestasi.tingkat}
                />

                <DetailItem
                  icon={BookOpen}
                  label="Kategori"
                  value={selectedPrestasi.kategori}
                />

                <DetailItem
                  icon={CalendarDays}
                  label="Tanggal"
                  value={selectedPrestasi.tanggal}
                />
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 px-5 py-4">
              <button
                onClick={() =>
                  setSelectedPrestasi(null)
                }
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   QUICK SUMMARY
========================================================= */

function QuickSummary({
  icon: Icon,
  title,
  value,
  description,
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50">
          <Icon size={17} className="text-slate-500" />
        </div>

        <div className="min-w-0">
          <p className="truncate text-[10px] font-medium text-slate-400">
            {title}
          </p>

          <div className="flex items-baseline gap-1.5">
            <p className="text-lg font-bold text-slate-800">
              {value}
            </p>

            <p className="truncate text-[10px] text-slate-400">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DETAIL ITEM
========================================================= */

function DetailItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-start gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white">
          <Icon size={14} className="text-slate-400" />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-0.5 break-words text-xs font-semibold text-slate-700">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PROGRESS ROW
========================================================= */

function ProgressRow({ label, value }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-600">
          {label}
        </span>

        <span className="text-xs font-semibold text-slate-700">
          {value}
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-[#155DFC]"
          style={{
            width: value,
          }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   INTEREST ROW
========================================================= */

function InterestRow({ label, value }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-600">
          {label}
        </span>

        <span className="text-xs font-bold text-slate-700">
          {value}%
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-violet-500"
          style={{
            width: `${value}%`,
          }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   QUICK ACTION
========================================================= */

function QuickAction({
  icon: Icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-[#c7dbff] hover:bg-[#f8faff]"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eaf1ff]">
        <Icon size={16} className="text-[#155DFC]" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-slate-700">
          {title}
        </p>

        <p className="mt-0.5 truncate text-[10px] text-slate-400">
          {description}
        </p>
      </div>

      <ChevronRight
        size={15}
        className="shrink-0 text-slate-300 transition group-hover:text-[#155DFC]"
      />
    </button>
  );
}