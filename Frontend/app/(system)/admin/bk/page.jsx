"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

import {
  Search,
  Plus,
  Eye,
  Edit3,
  CalendarDays,
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
  ChevronRight,
  ChevronLeft,
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
    className: "theme-success",
    dot: "bg-[var(--color-success)]",
  },
  Terjadwal: {
    className: "theme-info",
    dot: "bg-[var(--color-info)]",
  },
  Dibatalkan: {
    className: "theme-card-soft theme-text-muted",
    dot: "bg-[var(--color-text-muted)]",
  },
};

const PRIORITY_CONFIG = {
  Tinggi: "theme-danger",
  Sedang: "theme-warning",
  Normal: "theme-card-soft theme-text-secondary",
  Rendah: "theme-card-soft theme-text-muted",
};

/* =========================================================
   STATUS BADGE
========================================================= */

function KonselingStatus({ status }) {
  const config =
    KONSELING_STATUS[status] || KONSELING_STATUS.Terjadwal;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium theme-border ${config.className}`}
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
      className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-medium theme-border ${
        PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Normal
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
    <div className="theme-card theme-border rounded-xl border p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="theme-text-muted text-xs font-medium">
            {title}
          </p>

          <div className="mt-1 flex items-center gap-2">
            <p className="theme-text text-2xl font-bold tracking-tight">
              {value}
            </p>

            {trend && (
              <span
                className={`inline-flex items-center text-[10px] font-semibold ${
                  trend.type === "up"
                    ? "text-[var(--color-success)]"
                    : "text-[var(--color-danger)]"
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

          <p className="theme-text-placeholder mt-1 truncate text-xs">
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
    <div className="theme-card theme-border flex min-h-0 flex-col rounded-xl border shadow-sm">
      <div className="theme-border-soft flex shrink-0 items-center justify-between border-b px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="theme-info flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
            <Icon size={16} />
          </div>

          <div className="min-w-0">
            <h3 className="theme-text truncate text-sm font-bold">
              {title}
            </h3>

            <p className="theme-text-placeholder truncate text-[10px]">
              {description}
            </p>
          </div>
        </div>

        {action && (
          <button
            onClick={onAction}
            className="theme-sidebar-text-active shrink-0 text-xs font-semibold transition hover:opacity-80"
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
    <div className="theme-page flex h-screen w-full overflow-hidden">
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

        <main className="theme-page min-h-0 flex-1 overflow-hidden">
          <div className="flex h-full min-h-0 flex-col px-4 py-4 sm:px-5 lg:px-6">
            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="mb-4 shrink-0">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="theme-info flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                    <HeartHandshake size={20} />
                  </div>

                  <div className="min-w-0">
                    <h1 className="theme-text truncate text-lg font-bold tracking-tight sm:text-xl">
                      Bimbingan Konseling
                    </h1>

                    <p className="theme-text-secondary truncate text-xs">
                      Kelola layanan konseling, perkembangan,
                      prestasi, dan pembinaan siswa
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    router.push(
                      "/admin/bk/sesi-konseling/tambah"
                    )
                  }
                  className="theme-primary inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition"
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
                iconBg="theme-info"
                iconColor=""
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
                iconBg="theme-success"
                iconColor=""
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
                iconBg="theme-warning"
                iconColor=""
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
                iconBg="theme-info"
                iconColor=""
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

            <div className="theme-card theme-border mb-4 shrink-0 overflow-x-auto rounded-xl border shadow-sm">
              <div className="flex min-w-max">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setCurrentPage(1);
                      }}
                      className={`relative flex items-center gap-2 px-4 py-3 text-xs font-semibold transition ${
                        active
                          ? "theme-sidebar-text-active"
                          : "theme-text-muted"
                      }`}
                    >
                      <Icon size={15} />

                      {tab.label}

                      {active && (
                        <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[var(--color-primary)]" />
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
                <div className="theme-card theme-border flex h-full min-h-0 flex-col rounded-xl border shadow-sm">
                  {/* FILTER */}

                  <div className="theme-border-soft shrink-0 border-b p-3 sm:p-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                      <div className="relative min-w-0 flex-1">
                        <Search
                          size={17}
                          className="theme-text-muted pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
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
                          className="theme-input h-10 w-full rounded-lg border pl-9 pr-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
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
                          className="theme-input h-10 min-w-[135px] rounded-lg border px-3 text-xs font-medium outline-none focus:border-[var(--color-primary)]"
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
                          className="theme-input h-10 min-w-[135px] rounded-lg border px-3 text-xs font-medium outline-none focus:border-[var(--color-primary)]"
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
                          className="theme-card theme-border theme-text-secondary theme-header-hover inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition"
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
                      <thead className="theme-table-header sticky top-0 z-10">
                        <tr className="theme-border border-b">
                          <th className="theme-text-secondary px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">
                            Siswa
                          </th>

                          <th className="theme-text-secondary px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">
                            Jadwal
                          </th>

                          <th className="theme-text-secondary px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">
                            Konselor
                          </th>

                          <th className="theme-text-secondary px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">
                            Kategori
                          </th>

                          <th className="theme-text-secondary px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">
                            Prioritas
                          </th>

                          <th className="theme-text-secondary px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">
                            Status
                          </th>

                          <th className="theme-text-secondary px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider">
                            Aksi
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-[var(--color-border-soft)]">
                        {paginatedKonseling.map(
                          (item) => (
                            <tr
                              key={item.id}
                              className="theme-table-hover transition"
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="theme-info flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold">
                                    {item.avatar}
                                  </div>

                                  <div className="min-w-0">
                                    <p className="theme-text truncate text-sm font-semibold">
                                      {item.siswa}
                                    </p>

                                    <p className="theme-text-placeholder mt-0.5 text-[11px]">
                                      {item.nis} ·{" "}
                                      {item.kelas}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-3">
                                <p className="theme-text text-xs font-medium">
                                  {item.tanggal}
                                </p>

                                <p className="theme-text-placeholder mt-0.5 flex items-center gap-1 text-[11px]">
                                  <Clock3 size={11} />
                                  {item.waktu}
                                </p>
                              </td>

                              <td className="px-4 py-3">
                                <p className="theme-text text-xs font-medium">
                                  {item.konselor}
                                </p>

                                <p className="theme-text-placeholder mt-0.5 text-[10px]">
                                  Guru BK
                                </p>
                              </td>

                              <td className="px-4 py-3">
                                <span className="theme-info rounded-md border px-2.5 py-1 text-xs font-medium">
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
                                    className="theme-text-muted theme-header-hover flex h-8 w-8 items-center justify-center rounded-lg transition"
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
                                    className="theme-text-muted theme-header-hover flex h-8 w-8 items-center justify-center rounded-lg transition"
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

                  <div className="theme-border-soft flex shrink-0 flex-col gap-2 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="theme-text-muted text-xs">
                      Menampilkan{" "}
                      <span className="theme-text-secondary font-medium">
                        {filteredKonseling.length === 0
                          ? 0
                          : (safeCurrentPage - 1) *
                              itemsPerPage +
                            1}
                      </span>{" "}
                      -{" "}
                      <span className="theme-text-secondary font-medium">
                        {Math.min(
                          safeCurrentPage *
                            itemsPerPage,
                          filteredKonseling.length
                        )}
                      </span>{" "}
                      dari{" "}
                      <span className="theme-text-secondary font-medium">
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
                        className="theme-card theme-border theme-text-secondary theme-header-hover flex h-8 w-8 items-center justify-center rounded-lg border transition disabled:opacity-40"
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
                              ? "theme-primary"
                              : "theme-text-muted theme-header-hover"
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
                        className="theme-card theme-border theme-text-secondary theme-header-hover flex h-8 w-8 items-center justify-center rounded-lg border transition disabled:opacity-40"
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
                    <thead className="theme-table-header sticky top-0 z-10">
                      <tr className="theme-border border-b">
                        <th className="theme-text-secondary px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">
                          Siswa
                        </th>

                        <th className="theme-text-secondary px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">
                          Pelanggaran
                        </th>

                        <th className="theme-text-secondary px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">
                          Kategori
                        </th>

                        <th className="theme-text-secondary px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">
                          Point
                        </th>

                        <th className="theme-text-secondary px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">
                          Tanggal
                        </th>

                        <th className="theme-text-secondary px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[var(--color-border-soft)]">
                      {PELANGGARAN_DATA.map(
                        (item) => (
                          <tr
                            key={item.id}
                            className="theme-table-hover transition"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="theme-info flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold">
                                  {item.avatar}
                                </div>

                                <div>
                                  <p className="theme-text text-sm font-semibold">
                                    {item.siswa}
                                  </p>

                                  <p className="theme-text-placeholder text-[11px]">
                                    {item.nis} ·{" "}
                                    {item.kelas}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <p className="theme-text max-w-[240px] truncate text-xs font-medium">
                                {item.pelanggaran}
                              </p>
                            </td>

                            <td className="px-4 py-3">
                              <span className="theme-card-soft theme-text-secondary theme-border rounded-md border px-2.5 py-1 text-xs">
                                {item.kategori}
                              </span>
                            </td>

                            <td className="px-4 py-3">
                              <span className="font-bold text-[var(--color-danger)]">
                                {item.point}
                              </span>

                              <span className="theme-text-placeholder ml-1 text-[10px]">
                                point
                              </span>
                            </td>

                            <td className="theme-text-secondary px-4 py-3 text-xs">
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
                                  className="theme-text-muted theme-header-hover flex h-8 w-8 items-center justify-center rounded-lg transition"
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
                    <thead className="theme-table-header sticky top-0 z-10">
                      <tr className="theme-border border-b">
                        <th className="theme-text-secondary px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">
                          Siswa
                        </th>

                        <th className="theme-text-secondary px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">
                          Prestasi
                        </th>

                        <th className="theme-text-secondary px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">
                          Tingkat
                        </th>

                        <th className="theme-text-secondary px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">
                          Kategori
                        </th>

                        <th className="theme-text-secondary px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">
                          Tanggal
                        </th>

                        <th className="theme-text-secondary px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[var(--color-border-soft)]">
                      {PRESTASI_DATA.map((item) => (
                        <tr
                          key={item.id}
                          className="theme-table-hover transition"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="theme-info flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold">
                                {item.avatar}
                              </div>

                              <div>
                                <p className="theme-text text-sm font-semibold">
                                  {item.siswa}
                                </p>

                                <p className="theme-text-placeholder text-[11px]">
                                  {item.kelas}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <p className="theme-text max-w-[270px] truncate text-xs font-semibold">
                              {item.prestasi}
                            </p>
                          </td>

                          <td className="px-4 py-3">
                            <span className="theme-success rounded-md border px-2.5 py-1 text-xs font-medium">
                              {item.tingkat}
                            </span>
                          </td>

                          <td className="theme-text-secondary px-4 py-3 text-xs">
                            {item.kategori}
                          </td>

                          <td className="theme-text-muted px-4 py-3 text-xs">
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
                                className="theme-text-muted theme-header-hover flex h-8 w-8 items-center justify-center rounded-lg transition"
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

                  <div className="theme-card theme-border rounded-xl border p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="theme-info flex h-10 w-10 items-center justify-center rounded-xl">
                        <Brain size={20} />
                      </div>

                      <div>
                        <h3 className="theme-text text-sm font-bold">
                          Asesmen Siswa
                        </h3>

                        <p className="theme-text-placeholder text-[10px]">
                          Ringkasan pengisian asesmen
                        </p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="theme-text text-3xl font-bold">
                            92%
                          </p>

                          <p className="theme-text-placeholder mt-1 text-xs">
                            Kelengkapan data
                          </p>
                        </div>

                        <ClipboardCheck
                          size={28}
                          className="text-[var(--color-info)]"
                        />
                      </div>

                      <div className="theme-card-soft mt-4 h-2 overflow-hidden rounded-full">
                        <div
                          className="h-full rounded-full bg-[var(--color-info)]"
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

                  <div className="theme-card theme-border rounded-xl border p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="theme-text text-sm font-bold">
                          Minat Dominan
                        </h3>

                        <p className="theme-text-placeholder mt-0.5 text-[10px]">
                          Hasil asesmen siswa
                        </p>
                      </div>

                      <Star
                        size={18}
                        className="text-[var(--color-warning)]"
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

                  <div className="theme-card theme-border rounded-xl border p-5 shadow-sm">
                    <div>
                      <h3 className="theme-text text-sm font-bold">
                        Menu Bimbingan Konseling
                      </h3>

                      <p className="theme-text-placeholder mt-0.5 text-[10px]">
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
          <div className="theme-card w-full max-w-2xl overflow-hidden rounded-2xl shadow-2xl">
            <div className="theme-border-soft flex items-center justify-between border-b px-5 py-4">
              <div>
                <h2 className="theme-text text-base font-bold">
                  Detail Sesi Konseling
                </h2>

                <p className="theme-text-placeholder mt-0.5 text-xs">
                  Informasi lengkap sesi konseling siswa
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedKonseling(null)
                }
                className="theme-text-muted theme-header-hover flex h-8 w-8 items-center justify-center rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-5">
              <div className="theme-info theme-border flex items-center gap-3 rounded-xl border p-4">
                <div className="theme-card flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold">
                  {selectedKonseling.avatar}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="theme-text text-base font-bold">
                    {selectedKonseling.siswa}
                  </h3>

                  <p className="theme-text-muted text-xs">
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

              <div className="theme-card-soft theme-border mt-4 rounded-xl border p-4">
                <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wide">
                  Catatan Konseling
                </p>

                <p className="theme-text-secondary mt-2 text-sm leading-relaxed">
                  {selectedKonseling.catatan}
                </p>
              </div>
            </div>

            <div className="theme-border-soft flex justify-end gap-2 border-t px-5 py-4">
              <button
                onClick={() =>
                  setSelectedKonseling(null)
                }
                className="theme-card theme-border theme-text-secondary theme-header-hover rounded-lg border px-4 py-2 text-sm font-medium"
              >
                Tutup
              </button>

              <button className="theme-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold">
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
          <div className="theme-card w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl">
            <div className="theme-border-soft flex items-center justify-between border-b px-5 py-4">
              <div>
                <h2 className="theme-text text-base font-bold">
                  Detail Pelanggaran
                </h2>

                <p className="theme-text-placeholder mt-0.5 text-xs">
                  Informasi pelanggaran siswa
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedPelanggaran(null)
                }
                className="theme-text-muted theme-header-hover flex h-8 w-8 items-center justify-center rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <div className="theme-danger theme-border flex items-center gap-3 rounded-xl border p-4">
                <div className="theme-card flex h-11 w-11 items-center justify-center rounded-xl text-xs font-bold">
                  {selectedPelanggaran.avatar}
                </div>

                <div>
                  <p className="theme-text text-sm font-bold">
                    {selectedPelanggaran.siswa}
                  </p>

                  <p className="theme-text-muted text-xs">
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

            <div className="theme-border-soft flex justify-end border-t px-5 py-4">
              <button
                onClick={() =>
                  setSelectedPelanggaran(null)
                }
                className="theme-card theme-border theme-text-secondary theme-header-hover rounded-lg border px-4 py-2 text-sm font-medium"
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
          <div className="theme-card w-full max-w-lg overflow-hidden rounded-2xl shadow-2xl">
            <div className="theme-border-soft flex items-center justify-between border-b px-5 py-4">
              <div>
                <h2 className="theme-text text-base font-bold">
                  Detail Prestasi
                </h2>

                <p className="theme-text-placeholder mt-0.5 text-xs">
                  Informasi prestasi siswa
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedPrestasi(null)
                }
                className="theme-text-muted theme-header-hover flex h-8 w-8 items-center justify-center rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <div className="theme-success theme-border flex items-center gap-3 rounded-xl border p-4">
                <div className="theme-card flex h-11 w-11 items-center justify-center rounded-xl text-xs font-bold">
                  {selectedPrestasi.avatar}
                </div>

                <div>
                  <p className="theme-text text-sm font-bold">
                    {selectedPrestasi.siswa}
                  </p>

                  <p className="theme-text-muted text-xs">
                    {selectedPrestasi.kelas}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wide">
                  Prestasi
                </p>

                <p className="theme-text mt-1 text-sm font-bold">
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

            <div className="theme-border-soft flex justify-end border-t px-5 py-4">
              <button
                onClick={() =>
                  setSelectedPrestasi(null)
                }
                className="theme-card theme-border theme-text-secondary theme-header-hover rounded-lg border px-4 py-2 text-sm font-medium"
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
    <div className="theme-card theme-border rounded-xl border p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="theme-card-soft flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
          <Icon
            size={17}
            className="theme-text-muted"
          />
        </div>

        <div className="min-w-0">
          <p className="theme-text-placeholder truncate text-[10px] font-medium">
            {title}
          </p>

          <div className="flex items-baseline gap-1.5">
            <p className="theme-text text-lg font-bold">
              {value}
            </p>

            <p className="theme-text-placeholder truncate text-[10px]">
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
    <div className="theme-card-soft theme-border rounded-xl border p-3">
      <div className="flex items-start gap-2.5">
        <div className="theme-card flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
          <Icon
            size={14}
            className="theme-text-muted"
          />
        </div>

        <div className="min-w-0">
          <p className="theme-text-muted text-[10px] font-medium uppercase tracking-wide">
            {label}
          </p>

          <p className="theme-text mt-0.5 break-words text-xs font-semibold">
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
        <span className="theme-text-secondary text-xs font-medium">
          {label}
        </span>

        <span className="theme-text text-xs font-semibold">
          {value}
        </span>
      </div>

      <div className="theme-card-soft h-1.5 overflow-hidden rounded-full">
        <div
          className="h-full rounded-full bg-[var(--color-primary)]"
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
        <span className="theme-text-secondary text-xs font-medium">
          {label}
        </span>

        <span className="theme-text text-xs font-bold">
          {value}%
        </span>
      </div>

      <div className="theme-card-soft h-1.5 overflow-hidden rounded-full">
        <div
          className="h-full rounded-full bg-[var(--color-info)]"
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
      className="theme-card theme-border theme-header-hover group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition"
    >
      <div className="theme-info flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
        <Icon size={16} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="theme-text truncate text-xs font-semibold">
          {title}
        </p>

        <p className="theme-text-placeholder mt-0.5 truncate text-[10px]">
          {description}
        </p>
      </div>

      <ChevronRight
        size={15}
        className="theme-text-muted shrink-0 transition group-hover:text-[var(--color-primary)]"
      />
    </button>
  );
}