"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

import {
  Search,
  Plus,
  Users,
  UserPlus,
  FileText,
  CheckCircle2,
  Clock3,
  XCircle,
  Eye,
  Edit3,
  CalendarDays,
  Layers3,
  Settings2,
  ChevronRight,
  ChevronLeft,
  X,
  Filter,
  RefreshCw,
  GraduationCap,
  ClipboardCheck,
  UserCheck,
  UserRound,
  MapPin,
  Phone,
  Mail,
  School,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from "lucide-react";

/* =========================================================
   MOCK DATA
========================================================= */

const PENDAFTAR_DATA = [
  {
    id: 1,
    nomor: "SPMB-2026-0001",
    nama: "Ahmad Fauzan",
    nisn: "0123456789",
    asalSekolah: "SMP Negeri 1 Jakarta",
    pilihan: "IPA",
    gelombang: "Gelombang 1",
    tanggalDaftar: "09 September 2026",
    status: "Terverifikasi",
    statusPembayaran: "Lunas",
    noTelepon: "081234567890",
    email: "ahmad.fauzan@email.com",
    alamat: "Jakarta Timur",
    avatar: "AF",
  },
  {
    id: 2,
    nomor: "SPMB-2026-0002",
    nama: "Siti Rahma",
    nisn: "0123456790",
    asalSekolah: "SMP Negeri 5 Jakarta",
    pilihan: "IPS",
    gelombang: "Gelombang 1",
    tanggalDaftar: "09 September 2026",
    status: "Menunggu Verifikasi",
    statusPembayaran: "Lunas",
    noTelepon: "081298765432",
    email: "siti.rahma@email.com",
    alamat: "Jakarta Selatan",
    avatar: "SR",
  },
  {
    id: 3,
    nomor: "SPMB-2026-0003",
    nama: "Budi Santoso",
    nisn: "0123456791",
    asalSekolah: "SMP Negeri 8 Jakarta",
    pilihan: "Teknik",
    gelombang: "Gelombang 1",
    tanggalDaftar: "08 September 2026",
    status: "Terverifikasi",
    statusPembayaran: "Lunas",
    noTelepon: "082112345678",
    email: "budi.santoso@email.com",
    alamat: "Jakarta Barat",
    avatar: "BS",
  },
  {
    id: 4,
    nomor: "SPMB-2026-0004",
    nama: "Nabila Putri",
    nisn: "0123456792",
    asalSekolah: "SMP Negeri 3 Jakarta",
    pilihan: "IPA",
    gelombang: "Gelombang 1",
    tanggalDaftar: "08 September 2026",
    status: "Menunggu Verifikasi",
    statusPembayaran: "Belum Lunas",
    noTelepon: "083112345678",
    email: "nabila.putri@email.com",
    alamat: "Jakarta Pusat",
    avatar: "NP",
  },
  {
    id: 5,
    nomor: "SPMB-2026-0005",
    nama: "Fajar Hidayat",
    nisn: "0123456793",
    asalSekolah: "SMP Negeri 10 Jakarta",
    pilihan: "IPS",
    gelombang: "Gelombang 2",
    tanggalDaftar: "07 September 2026",
    status: "Ditolak",
    statusPembayaran: "Lunas",
    noTelepon: "085612345678",
    email: "fajar.hidayat@email.com",
    alamat: "Jakarta Utara",
    avatar: "FH",
  },
  {
    id: 6,
    nomor: "SPMB-2026-0006",
    nama: "Sarah Aulia",
    nisn: "0123456794",
    asalSekolah: "SMP Negeri 12 Jakarta",
    pilihan: "IPA",
    gelombang: "Gelombang 2",
    tanggalDaftar: "07 September 2026",
    status: "Terverifikasi",
    statusPembayaran: "Lunas",
    noTelepon: "087712345678",
    email: "sarah.aulia@email.com",
    alamat: "Jakarta Timur",
    avatar: "SA",
  },
  {
    id: 7,
    nomor: "SPMB-2026-0007",
    nama: "Rizky Pratama",
    nisn: "0123456795",
    asalSekolah: "SMP Negeri 7 Jakarta",
    pilihan: "Teknik",
    gelombang: "Gelombang 2",
    tanggalDaftar: "06 September 2026",
    status: "Menunggu Verifikasi",
    statusPembayaran: "Lunas",
    noTelepon: "081987654321",
    email: "rizky.pratama@email.com",
    alamat: "Jakarta Selatan",
    avatar: "RP",
  },
  {
    id: 8,
    nomor: "SPMB-2026-0008",
    nama: "Putri Amelia",
    nisn: "0123456796",
    asalSekolah: "SMP Negeri 2 Jakarta",
    pilihan: "IPA",
    gelombang: "Gelombang 2",
    tanggalDaftar: "05 September 2026",
    status: "Terverifikasi",
    statusPembayaran: "Lunas",
    noTelepon: "082298765432",
    email: "putri.amelia@email.com",
    alamat: "Jakarta Barat",
    avatar: "PA",
  },
];

/* =========================================================
   STATUS CONFIG
========================================================= */

const STATUS_CONFIG = {
  Terverifikasi: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-100",
    dot: "bg-emerald-500",
  },

  "Menunggu Verifikasi": {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-100",
    dot: "bg-amber-500",
  },

  Ditolak: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-100",
    dot: "bg-red-500",
  },
};

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const config =
    STATUS_CONFIG[status] ||
    STATUS_CONFIG["Menunggu Verifikasi"];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-medium ${config.bg} ${config.text} ${config.border}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
      />

      {status}
    </span>
  );
}

/* =========================================================
   PAYMENT BADGE
========================================================= */

function PaymentBadge({ status }) {
  const isPaid = status === "Lunas";

  return (
    <span
      className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-medium ${
        isPaid
          ? "border-emerald-100 bg-emerald-50 text-emerald-700"
          : "border-red-100 bg-red-50 text-red-700"
      }`}
    >
      {status}
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
                className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${
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
   PAGE
========================================================= */

export default function SPMBPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] =
    useState(false);

  const [activeTab, setActiveTab] =
    useState("pendaftar");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("Semua");

  const [gelombangFilter, setGelombangFilter] =
    useState("Semua");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [selectedPendaftar, setSelectedPendaftar] =
    useState(null);

  const itemsPerPage = 5;

  /* =========================================================
     FILTER DATA
  ========================================================= */

  const filteredData = useMemo(() => {
    return PENDAFTAR_DATA.filter((item) => {
      const query =
        searchQuery.toLowerCase().trim();

      const matchesSearch =
        !query ||
        item.nama.toLowerCase().includes(query) ||
        item.nisn.toLowerCase().includes(query) ||
        item.nomor.toLowerCase().includes(query) ||
        item.asalSekolah
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "Semua" ||
        item.status === statusFilter;

      const matchesGelombang =
        gelombangFilter === "Semua" ||
        item.gelombang === gelombangFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesGelombang
      );
    });
  }, [
    searchQuery,
    statusFilter,
    gelombangFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredData.length / itemsPerPage
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const paginatedData = filteredData.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage
  );

  /* =========================================================
     RESET
  ========================================================= */

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("Semua");
    setGelombangFilter("Semua");
    setCurrentPage(1);
  };

  /* =========================================================
     TOGGLE SIDEBAR
  ========================================================= */

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  /* =========================================================
     TABS
  ========================================================= */

  const tabs = [
    {
      id: "pendaftar",
      label: "Data Pendaftaran",
      icon: Users,
    },
    {
      id: "gelombang",
      label: "Gelombang",
      icon: Layers3,
    },
    {
      id: "pengaturan",
      label: "Pengaturan",
      icon: Settings2,
    },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar
        active="spmb"
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
                    <UserPlus
                      size={20}
                      className="text-[#155DFC]"
                    />
                  </div>

                  <div className="min-w-0">
                    <h1 className="truncate text-lg font-bold tracking-tight text-slate-800 sm:text-xl">
                      Penerimaan SPMB
                    </h1>

                    <p className="truncate text-xs text-slate-500">
                      Kelola proses penerimaan dan
                      pendaftaran siswa baru
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    router.push(
                      "/admin/spmb/pendaftar/tambah"
                    )
                  }
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#155DFC] to-[#0d47c9] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
                >
                  <Plus size={17} />
                  Tambah Pendaftar
                </button>
              </div>
            </div>

            {/* =================================================
                STATISTICS
            ================================================= */}

            <div className="mb-4 grid shrink-0 grid-cols-2 gap-3 xl:grid-cols-4">
              <StatCard
                title="Total Pendaftar"
                value="248"
                description="Seluruh pendaftar"
                icon={Users}
                iconBg="bg-[#eaf1ff]"
                iconColor="text-[#155DFC]"
                trend={{
                  type: "up",
                  value: "18%",
                }}
              />

              <StatCard
                title="Terverifikasi"
                value="186"
                description="75% dari total"
                icon={UserCheck}
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
                trend={{
                  type: "up",
                  value: "12%",
                }}
              />

              <StatCard
                title="Menunggu Verifikasi"
                value="47"
                description="Perlu ditinjau"
                icon={Clock3}
                iconBg="bg-amber-50"
                iconColor="text-amber-600"
              />

              <StatCard
                title="Kuota Tersisa"
                value="152"
                description="Dari total 400 kursi"
                icon={GraduationCap}
                iconBg="bg-violet-50"
                iconColor="text-violet-600"
              />
            </div>

            {/* =================================================
                QUICK INFO
            ================================================= */}

            <div className="mb-4 grid shrink-0 grid-cols-2 gap-3 md:grid-cols-4">
              <MiniStat
                icon={CalendarDays}
                label="Gelombang Aktif"
                value="Gelombang 2"
                description="01 - 30 Sep 2026"
              />

              <MiniStat
                icon={ClipboardCheck}
                label="Sudah Verifikasi"
                value="186"
                description="75% pendaftar"
              />

              <MiniStat
                icon={FileText}
                label="Berkas Lengkap"
                value="172"
                description="69% pendaftar"
              />

              <MiniStat
                icon={CheckCircle2}
                label="Pembayaran Lunas"
                value="201"
                description="81% pendaftar"
              />
            </div>

            {/* =================================================
                TABS
            ================================================= */}

            <div className="mb-4 shrink-0 overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-sm">
              <div className="flex min-w-max">
                {tabs.map((tab) => {
                  const Icon = tab.icon;

                  const isActive =
                    activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setCurrentPage(1);
                      }}
                      className={`relative flex items-center gap-2 px-5 py-3 text-xs font-semibold transition ${
                        isActive
                          ? "text-[#155DFC]"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      <Icon size={15} />

                      {tab.label}

                      {isActive && (
                        <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#155DFC]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* =================================================
                TAB PENDAFTAR
            ================================================= */}

            {activeTab === "pendaftar" && (
              <div className="min-h-0 flex-1">
                <div className="flex h-full min-h-0 flex-col rounded-xl border border-slate-200/80 bg-white shadow-sm">
                  {/* FILTER BAR */}

                  <div className="shrink-0 border-b border-slate-100 p-3 sm:p-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                      {/* SEARCH */}

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
                          placeholder="Cari nama, NISN, nomor pendaftaran, atau asal sekolah..."
                          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#8bb4ff] focus:bg-white focus:ring-2 focus:ring-[#155DFC]/10"
                        />
                      </div>

                      {/* FILTER */}

                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:flex">
                        <select
                          value={gelombangFilter}
                          onChange={(e) => {
                            setGelombangFilter(
                              e.target.value
                            );
                            setCurrentPage(1);
                          }}
                          className="h-10 min-w-[145px] rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none focus:border-[#8bb4ff] focus:ring-2 focus:ring-[#155DFC]/10"
                        >
                          <option value="Semua">
                            Semua Gelombang
                          </option>
                          <option value="Gelombang 1">
                            Gelombang 1
                          </option>
                          <option value="Gelombang 2">
                            Gelombang 2
                          </option>
                        </select>

                        <select
                          value={statusFilter}
                          onChange={(e) => {
                            setStatusFilter(
                              e.target.value
                            );
                            setCurrentPage(1);
                          }}
                          className="h-10 min-w-[155px] rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none focus:border-[#8bb4ff] focus:ring-2 focus:ring-[#155DFC]/10"
                        >
                          <option value="Semua">
                            Semua Status
                          </option>
                          <option value="Terverifikasi">
                            Terverifikasi
                          </option>
                          <option value="Menunggu Verifikasi">
                            Menunggu Verifikasi
                          </option>
                          <option value="Ditolak">
                            Ditolak
                          </option>
                        </select>

                        <button
                          onClick={resetFilters}
                          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-500 transition hover:bg-slate-50"
                        >
                          <RefreshCw size={14} />
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* TABLE */}

                  <div className="min-h-0 flex-1 overflow-auto">
                    <table className="w-full min-w-[1100px] border-collapse">
                      <thead className="sticky top-0 z-10 bg-slate-50">
                        <tr className="border-b border-slate-200">
                          <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            Pendaftar
                          </th>

                          <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            Asal Sekolah
                          </th>

                          <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            Pilihan
                          </th>

                          <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            Gelombang
                          </th>

                          <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            Tanggal
                          </th>

                          <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            Pembayaran
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
                        {paginatedData.length > 0 ? (
                          paginatedData.map(
                            (item) => (
                              <tr
                                key={item.id}
                                className="transition hover:bg-slate-50/70"
                              >
                                {/* SISWA */}

                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eaf1ff] text-xs font-bold text-[#155DFC]">
                                      {item.avatar}
                                    </div>

                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-semibold text-slate-700">
                                        {item.nama}
                                      </p>

                                      <p className="mt-0.5 text-[10px] text-slate-400">
                                        {item.nomor}
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                {/* ASAL SEKOLAH */}

                                <td className="px-4 py-3">
                                  <p className="max-w-[190px] truncate text-xs font-medium text-slate-700">
                                    {item.asalSekolah}
                                  </p>

                                  <p className="mt-0.5 text-[10px] text-slate-400">
                                    NISN {item.nisn}
                                  </p>
                                </td>

                                {/* PILIHAN */}

                                <td className="px-4 py-3">
                                  <span className="rounded-md border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                    {item.pilihan}
                                  </span>
                                </td>

                                {/* GELOMBANG */}

                                <td className="px-4 py-3">
                                  <span className="text-xs font-medium text-slate-600">
                                    {item.gelombang}
                                  </span>
                                </td>

                                {/* TANGGAL */}

                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <CalendarDays
                                      size={13}
                                      className="text-slate-400"
                                    />

                                    {item.tanggalDaftar}
                                  </div>
                                </td>

                                {/* PAYMENT */}

                                <td className="px-4 py-3">
                                  <PaymentBadge
                                    status={
                                      item.statusPembayaran
                                    }
                                  />
                                </td>

                                {/* STATUS */}

                                <td className="px-4 py-3">
                                  <StatusBadge
                                    status={item.status}
                                  />
                                </td>

                                {/* ACTION */}

                                <td className="px-4 py-3">
                                  <div className="flex justify-end gap-1">
                                    <button
                                      onClick={() =>
                                        setSelectedPendaftar(
                                          item
                                        )
                                      }
                                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-[#eaf1ff] hover:text-[#155DFC]"
                                      title="Lihat detail"
                                    >
                                      <Eye
                                        size={16}
                                      />
                                    </button>

                                    <button
                                      onClick={() =>
                                        setSelectedPendaftar(
                                          item
                                        )
                                      }
                                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-[#eaf1ff] hover:text-[#155DFC]"
                                      title="Edit"
                                    >
                                      <Edit3
                                        size={16}
                                      />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )
                          )
                        ) : (
                          <tr>
                            <td
                              colSpan={8}
                              className="px-4 py-16 text-center"
                            >
                              <div className="flex flex-col items-center justify-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                                  <Users
                                    size={21}
                                    className="text-slate-400"
                                  />
                                </div>

                                <p className="mt-3 text-sm font-semibold text-slate-700">
                                  Data tidak ditemukan
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  Coba ubah kata kunci
                                  atau filter
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* PAGINATION */}

                  <div className="flex shrink-0 flex-col gap-2 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-slate-400">
                      Menampilkan{" "}
                      <span className="font-medium text-slate-600">
                        {filteredData.length ===
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
                          filteredData.length
                        )}
                      </span>{" "}
                      dari{" "}
                      <span className="font-medium text-slate-600">
                        {filteredData.length}
                      </span>{" "}
                      data
                    </p>

                    <div className="flex items-center gap-1">
                      <button
                        disabled={
                          safeCurrentPage === 1
                        }
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
                            safeCurrentPage ===
                            page
                              ? "bg-[#155DFC] text-white"
                              : "text-slate-500 hover:bg-slate-100"
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        disabled={
                          safeCurrentPage ===
                          totalPages
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
              </div>
            )}

            {/* =================================================
                TAB GELOMBANG
            ================================================= */}

            {activeTab === "gelombang" && (
              <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-3">
                {/* ACTIVE GELOMBANG */}

                <div className="flex min-h-0 flex-col rounded-xl border border-[#c7dbff] bg-white shadow-sm lg:col-span-2">
                  <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">
                        Gelombang Pendaftaran
                      </h3>

                      <p className="mt-0.5 text-[10px] text-slate-400">
                        Periode penerimaan siswa baru
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        router.push(
                          "/admin/spmb/gelombang/tambah"
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#155DFC] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0d47c9]"
                    >
                      <Plus size={14} />
                      Tambah
                    </button>
                  </div>

                  <div className="min-h-0 flex-1 overflow-auto p-4">
                    <div className="space-y-3">
                      <WaveCard
                        active
                        title="Gelombang 2"
                        date="01 September - 30 September 2026"
                        registered="148"
                        quota="200"
                        status="Aktif"
                      />

                      <WaveCard
                        title="Gelombang 1"
                        date="01 Agustus - 31 Agustus 2026"
                        registered="100"
                        quota="100"
                        status="Selesai"
                      />

                      <WaveCard
                        title="Gelombang 3"
                        date="01 Oktober - 31 Oktober 2026"
                        registered="0"
                        quota="100"
                        status="Belum Dibuka"
                      />
                    </div>
                  </div>
                </div>

                {/* SUMMARY */}

                <div className="flex min-h-0 flex-col rounded-xl border border-slate-200/80 bg-white shadow-sm">
                  <div className="shrink-0 border-b border-slate-100 px-4 py-3">
                    <h3 className="text-sm font-bold text-slate-800">
                      Ringkasan Kuota
                    </h3>

                    <p className="mt-0.5 text-[10px] text-slate-400">
                      Kapasitas penerimaan
                    </p>
                  </div>

                  <div className="min-h-0 flex-1 overflow-auto p-4">
                    <div className="rounded-xl bg-[#f5f8ff] p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-slate-400">
                            Total Kuota
                          </p>

                          <p className="mt-1 text-2xl font-bold text-slate-800">
                            400
                          </p>
                        </div>

                        <GraduationCap
                          size={25}
                          className="text-[#155DFC]"
                        />
                      </div>
                    </div>

                    <div className="mt-3 space-y-3">
                      <QuotaRow
                        label="IPA"
                        filled={118}
                        total={150}
                      />

                      <QuotaRow
                        label="IPS"
                        filled={76}
                        total={100}
                      />

                      <QuotaRow
                        label="Teknik"
                        filled={54}
                        total={100}
                      />

                      <QuotaRow
                        label="Lainnya"
                        filled={0}
                        total={50}
                      />
                    </div>

                    <button
                      onClick={() =>
                        router.push(
                          "/admin/spmb/gelombang"
                        )
                      }
                      className="mt-5 flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      Kelola Gelombang

                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* =================================================
                TAB PENGATURAN
            ================================================= */}

            {activeTab === "pengaturan" && (
              <div className="min-h-0 flex-1 overflow-auto">
                <div className="grid gap-4 lg:grid-cols-2">
                  <SettingCard
                    icon={CalendarDays}
                    title="Periode Pendaftaran"
                    description="Atur periode buka dan tutup pendaftaran."
                    value="01 Agustus - 31 Oktober 2026"
                    onClick={() =>
                      router.push(
                        "/admin/spmb/pengaturan/periode"
                      )
                    }
                  />

                  <SettingCard
                    icon={GraduationCap}
                    title="Kuota Penerimaan"
                    description="Atur kapasitas siswa yang diterima."
                    value="400 siswa"
                    onClick={() =>
                      router.push(
                        "/admin/spmb/pengaturan/kuota"
                      )
                    }
                  />

                  <SettingCard
                    icon={FileText}
                    title="Persyaratan Pendaftaran"
                    description="Kelola dokumen yang wajib diunggah calon siswa."
                    value="8 persyaratan aktif"
                    onClick={() =>
                      router.push(
                        "/admin/spmb/pengaturan/persyaratan"
                      )
                    }
                  />

                  <SettingCard
                    icon={School}
                    title="Pilihan Jurusan"
                    description="Kelola jurusan atau program yang tersedia."
                    value="3 jurusan aktif"
                    onClick={() =>
                      router.push(
                        "/admin/spmb/pengaturan/jurusan"
                      )
                    }
                  />

                  <SettingCard
                    icon={ClipboardCheck}
                    title="Verifikasi Pendaftaran"
                    description="Atur alur dan status verifikasi berkas."
                    value="Verifikasi manual"
                    onClick={() =>
                      router.push(
                        "/admin/spmb/pengaturan/verifikasi"
                      )
                    }
                  />

                  <SettingCard
                    icon={Settings2}
                    title="Pengaturan Umum"
                    description="Konfigurasi informasi dan sistem SPMB."
                    value="Konfigurasi sistem"
                    onClick={() =>
                      router.push(
                        "/admin/spmb/pengaturan/umum"
                      )
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* =========================================================
          DETAIL PENDAFTAR MODAL
      ========================================================= */}

      {selectedPendaftar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  Detail Pendaftar
                </h2>

                <p className="mt-0.5 text-xs text-slate-400">
                  Informasi lengkap calon siswa
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedPendaftar(null)
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* CONTENT */}

            <div className="max-h-[75vh] overflow-y-auto p-5">
              {/* PROFILE */}

              <div className="flex flex-col gap-3 rounded-xl border border-[#c7dbff] bg-[#f5f8ff] p-4 sm:flex-row sm:items-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-bold text-[#155DFC]">
                  {selectedPendaftar.avatar}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-slate-800">
                    {selectedPendaftar.nama}
                  </h3>

                  <p className="mt-0.5 text-xs text-slate-400">
                    {selectedPendaftar.nomor}
                  </p>
                </div>

                <StatusBadge
                  status={
                    selectedPendaftar.status
                  }
                />
              </div>

              {/* DATA */}

              <div className="mt-4">
                <p className="mb-3 text-xs font-bold text-slate-700">
                  Informasi Pendaftaran
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailItem
                    icon={UserRound}
                    label="Nama Lengkap"
                    value={
                      selectedPendaftar.nama
                    }
                  />

                  <DetailItem
                    icon={FileText}
                    label="NISN"
                    value={
                      selectedPendaftar.nisn
                    }
                  />

                  <DetailItem
                    icon={School}
                    label="Asal Sekolah"
                    value={
                      selectedPendaftar.asalSekolah
                    }
                  />

                  <DetailItem
                    icon={GraduationCap}
                    label="Pilihan Jurusan"
                    value={
                      selectedPendaftar.pilihan
                    }
                  />

                  <DetailItem
                    icon={Layers3}
                    label="Gelombang"
                    value={
                      selectedPendaftar.gelombang
                    }
                  />

                  <DetailItem
                    icon={CalendarDays}
                    label="Tanggal Daftar"
                    value={
                      selectedPendaftar.tanggalDaftar
                    }
                  />

                  <DetailItem
                    icon={Phone}
                    label="No. Telepon"
                    value={
                      selectedPendaftar.noTelepon
                    }
                  />

                  <DetailItem
                    icon={Mail}
                    label="Email"
                    value={
                      selectedPendaftar.email
                    }
                  />

                  <DetailItem
                    icon={MapPin}
                    label="Alamat"
                    value={
                      selectedPendaftar.alamat
                    }
                  />

                  <DetailItem
                    icon={CheckCircle2}
                    label="Pembayaran"
                    value={
                      selectedPendaftar.statusPembayaran
                    }
                  />
                </div>
              </div>

              {/* VERIFICATION */}

              <div className="mt-5 rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-700">
                      Status Verifikasi
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-400">
                      Status pemeriksaan data calon
                      siswa
                    </p>
                  </div>

                  <StatusBadge
                    status={
                      selectedPendaftar.status
                    }
                  />
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      selectedPendaftar.status ===
                      "Terverifikasi"
                        ? "w-full bg-emerald-500"
                        : selectedPendaftar.status ===
                          "Ditolak"
                        ? "w-full bg-red-500"
                        : "w-2/3 bg-amber-500"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* FOOTER */}

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end">
              <button
                onClick={() =>
                  setSelectedPendaftar(null)
                }
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Tutup
              </button>

              <button
                onClick={() => {
                  setSelectedPendaftar(null);
                  router.push(
                    `/admin/spmb/pendaftar/${selectedPendaftar.id}/edit`
                  );
                }}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#155DFC] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0d47c9]"
              >
                <Edit3 size={15} />
                Edit Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   MINI STAT
========================================================= */

function MiniStat({
  icon: Icon,
  label,
  value,
  description,
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50">
          <Icon
            size={17}
            className="text-slate-500"
          />
        </div>

        <div className="min-w-0">
          <p className="truncate text-[10px] font-medium text-slate-400">
            {label}
          </p>

          <p className="truncate text-sm font-bold text-slate-800">
            {value}
          </p>

          <p className="truncate text-[10px] text-slate-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   WAVE CARD
========================================================= */

function WaveCard({
  active = false,
  title,
  date,
  registered,
  quota,
  status,
}) {
  const percentage =
    quota > 0
      ? Math.round(
          (Number(registered) / Number(quota)) *
            100
        )
      : 0;

  return (
    <div
      className={`rounded-xl border p-4 transition ${
        active
          ? "border-[#c7dbff] bg-[#f8faff]"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-800">
              {title}
            </h4>

            {active && (
              <span className="rounded-md border border-emerald-100 bg-emerald-50 px-2 py-1 text-[9px] font-semibold text-emerald-700">
                Aktif
              </span>
            )}
          </div>

          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
            <CalendarDays size={12} />
            {date}
          </div>
        </div>

        <span
          className={`rounded-md border px-2.5 py-1 text-[10px] font-medium ${
            status === "Aktif"
              ? "border-blue-100 bg-blue-50 text-blue-700"
              : status === "Selesai"
              ? "border-slate-200 bg-slate-100 text-slate-500"
              : "border-amber-100 bg-amber-50 text-amber-700"
          }`}
        >
          {status}
        </span>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[10px] font-medium text-slate-500">
            Pendaftar
          </span>

          <span className="text-[10px] font-semibold text-slate-700">
            {registered} / {quota}
          </span>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[#155DFC]"
            style={{
              width: `${Math.min(
                percentage,
                100
              )}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   QUOTA ROW
========================================================= */

function QuotaRow({
  label,
  filled,
  total,
}) {
  const percentage =
    total > 0
      ? Math.round((filled / total) * 100)
      : 0;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-600">
          {label}
        </span>

        <span className="text-[10px] font-semibold text-slate-500">
          {filled} / {total}
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-[#155DFC]"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   SETTING CARD
========================================================= */

function SettingCard({
  icon: Icon,
  title,
  description,
  value,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-4 rounded-xl border border-slate-200/80 bg-white p-4 text-left shadow-sm transition hover:border-[#c7dbff] hover:bg-[#f8faff]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#eaf1ff]">
        <Icon
          size={18}
          className="text-[#155DFC]"
        />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-bold text-slate-800">
          {title}
        </h3>

        <p className="mt-0.5 text-xs text-slate-400">
          {description}
        </p>

        <p className="mt-2 text-[11px] font-semibold text-[#155DFC]">
          {value}
        </p>
      </div>

      <ChevronRight
        size={16}
        className="shrink-0 text-slate-300 transition group-hover:text-[#155DFC]"
      />
    </button>
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
          <Icon
            size={14}
            className="text-slate-400"
          />
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