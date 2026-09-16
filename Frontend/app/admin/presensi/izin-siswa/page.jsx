"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  Filter,
  RefreshCw,
  Search,
  User,
  UserCheck,
  UserX,
  Users,
  XCircle,
} from "lucide-react";

/* ============================================================
   DUMMY DATA
============================================================ */

const INITIAL_IZIN_SISWA = [
  {
    id: 1,
    nama: "Andi Saputra",
    nisn: "0091234567",
    kelas: "9A",
    jenis: "Izin",
    tanggal: "2026-09-10",
    alasan: "Mengikuti acara keluarga.",
    status: "menunggu",
    diajukan: "08:15",
  },
  {
    id: 2,
    nama: "Nadia Putri",
    nisn: "0091234568",
    kelas: "9A",
    jenis: "Sakit",
    tanggal: "2026-09-10",
    alasan: "Kurang sehat dan perlu beristirahat.",
    status: "disetujui",
    diajukan: "07:42",
  },
  {
    id: 3,
    nama: "Rizky Maulana",
    nisn: "0091234569",
    kelas: "9B",
    jenis: "Izin",
    tanggal: "2026-09-10",
    alasan: "Keperluan keluarga.",
    status: "menunggu",
    diajukan: "08:03",
  },
  {
    id: 4,
    nama: "Salsa Maharani",
    nisn: "0091234570",
    kelas: "9B",
    jenis: "Sakit",
    tanggal: "2026-09-09",
    alasan: "Demam.",
    status: "disetujui",
    diajukan: "07:35",
  },
  {
    id: 5,
    nama: "Fajar Ramadhan",
    nisn: "0091234571",
    kelas: "9C",
    jenis: "Izin",
    tanggal: "2026-09-10",
    alasan: "Mengikuti kegiatan keluarga.",
    status: "ditolak",
    diajukan: "07:50",
  },
  {
    id: 6,
    nama: "Aulia Rahma",
    nisn: "0091234572",
    kelas: "9C",
    jenis: "Sakit",
    tanggal: "2026-09-10",
    alasan: "Sedang dalam masa pemulihan.",
    status: "menunggu",
    diajukan: "08:20",
  },
  {
    id: 7,
    nama: "Bagas Pratama",
    nisn: "0091234573",
    kelas: "8A",
    jenis: "Izin",
    tanggal: "2026-09-10",
    alasan: "Keperluan administrasi keluarga.",
    status: "menunggu",
    diajukan: "08:26",
  },
  {
    id: 8,
    nama: "Citra Lestari",
    nisn: "0091234574",
    kelas: "8B",
    jenis: "Sakit",
    tanggal: "2026-09-10",
    alasan: "Sakit dan mendapat rekomendasi untuk istirahat.",
    status: "disetujui",
    diajukan: "07:28",
  },
];

/* ============================================================
   STATUS CONFIG
============================================================ */

const STATUS_CONFIG = {
  menunggu: {
    label: "Menunggu",
    className:
      "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },

  disetujui: {
    label: "Disetujui",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },

  ditolak: {
    label: "Ditolak",
    className:
      "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
};

/* ============================================================
   PAGE
============================================================ */

export default function IzinSiswaPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [data, setData] = useState(
    INITIAL_IZIN_SISWA
  );

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("semua");

  const [jenisFilter, setJenisFilter] =
    useState("semua");

  const [tanggal, setTanggal] =
    useState("2026-09-10");

  const [selectedId, setSelectedId] =
    useState(INITIAL_IZIN_SISWA[0].id);

  /* ==========================================================
     IMPORTANT:
     Header.jsx membutuhkan notifications ARRAY.
     Jangan ubah menjadi object/string.
  ========================================================== */

  const notifications = [
    {
      id: 1,
      title: "Permohonan izin baru",
      desc: "Ada permohonan izin siswa yang perlu ditinjau.",
      read: false,
    },
    {
      id: 2,
      title: "Presensi siswa diperbarui",
      desc: "Data presensi siswa hari ini telah diperbarui.",
      read: true,
    },
  ];

  /* ==========================================================
     FILTER
  ========================================================== */

  const filteredData = useMemo(() => {
    const keyword = search
      .toLowerCase()
      .trim();

    return data.filter((item) => {
      const matchesSearch =
        !keyword ||
        item.nama
          .toLowerCase()
          .includes(keyword) ||
        item.nisn
          .toLowerCase()
          .includes(keyword) ||
        item.kelas
          .toLowerCase()
          .includes(keyword);

      const matchesStatus =
        statusFilter === "semua" ||
        item.status === statusFilter;

      const matchesJenis =
        jenisFilter === "semua" ||
        item.jenis === jenisFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesJenis
      );
    });
  }, [
    data,
    search,
    statusFilter,
    jenisFilter,
  ]);

  /* ==========================================================
     SELECTED DATA
  ========================================================== */

  const selectedIzin =
    data.find(
      (item) => item.id === selectedId
    ) ||
    filteredData[0] ||
    null;

  /* ==========================================================
     STATISTICS
  ========================================================== */

  const total = data.length;

  const menunggu = data.filter(
    (item) => item.status === "menunggu"
  ).length;

  const disetujui = data.filter(
    (item) => item.status === "disetujui"
  ).length;

  const ditolak = data.filter(
    (item) => item.status === "ditolak"
  ).length;

  /* ==========================================================
     ACTION
  ========================================================== */

  const handleRefresh = () => {
    setData(INITIAL_IZIN_SISWA);
    setSearch("");
    setStatusFilter("semua");
    setJenisFilter("semua");
    setSelectedId(
      INITIAL_IZIN_SISWA[0].id
    );
  };

  const handleApprove = (id) => {
    setData((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "disetujui",
            }
          : item
      )
    );
  };

  const handleReject = (id) => {
    setData((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "ditolak",
            }
          : item
      )
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar
        role="admin"
        active="izinPresensiSiswa"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() =>
          setSidebarOpen(!sidebarOpen)
        }
      />

      {/* ======================================================
          MAIN
      ====================================================== */}

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          toggleSidebar={() =>
            setSidebarOpen(!sidebarOpen)
          }
          notifications={notifications}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AS",
          }}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="w-full max-w-[1550px] mx-auto p-4 sm:p-6 lg:p-8">

            {/* ==================================================
                PAGE HEADER
            ================================================== */}

            <div className="flex flex-col gap-5 mb-7">
              <div className="flex items-start justify-between gap-4">

                <div className="flex items-start gap-3 min-w-0">

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/admin/presensi"
                      )
                    }
                    className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm flex-shrink-0"
                  >
                    <ArrowLeft size={18} />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />

                      <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                        Presensi & Kehadiran
                      </p>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                      Izin Siswa
                    </h1>

                    <p className="text-sm text-slate-500 mt-1.5">
                      Kelola pengajuan izin dan sakit
                      siswa dengan mudah.
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRefresh}
                    className="h-10 px-3.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm inline-flex items-center gap-2"
                  >
                    <RefreshCw size={15} />
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* ==================================================
                STAT CARDS
            ================================================== */}

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6">

              <StatCard
                icon={Users}
                label="Total Pengajuan"
                value={total}
                description="Seluruh pengajuan"
                iconClass="bg-blue-50 text-blue-600"
              />

              <StatCard
                icon={Clock3}
                label="Menunggu"
                value={menunggu}
                description="Perlu ditinjau"
                iconClass="bg-amber-50 text-amber-600"
              />

              <StatCard
                icon={CheckCircle2}
                label="Disetujui"
                value={disetujui}
                description="Pengajuan diterima"
                iconClass="bg-emerald-50 text-emerald-600"
              />

              <StatCard
                icon={XCircle}
                label="Ditolak"
                value={ditolak}
                description="Pengajuan ditolak"
                iconClass="bg-red-50 text-red-600"
              />

            </div>

            {/* ==================================================
                FILTER
            ================================================== */}

            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-4 mb-6">

              <div className="flex flex-col xl:flex-row gap-3">

                {/* DATE */}

                <div className="relative xl:w-56 flex-shrink-0">

                  <CalendarDays
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="date"
                    value={tanggal}
                    onChange={(e) =>
                      setTanggal(e.target.value)
                    }
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-700 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                  />

                </div>

                {/* SEARCH */}

                <div className="relative flex-1 min-w-0">

                  <Search
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Cari nama siswa, NISN, atau kelas..."
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all"
                  />

                </div>

                {/* FILTER BUTTONS */}

                <div className="flex items-center gap-2 overflow-x-auto pb-1 xl:pb-0">

                  <div className="hidden sm:flex w-10 h-10 rounded-xl bg-slate-50 items-center justify-center text-slate-500 flex-shrink-0">
                    <Filter size={16} />
                  </div>

                  <FilterButton
                    active={
                      statusFilter === "semua"
                    }
                    onClick={() =>
                      setStatusFilter("semua")
                    }
                  >
                    Semua
                  </FilterButton>

                  <FilterButton
                    active={
                      statusFilter === "menunggu"
                    }
                    onClick={() =>
                      setStatusFilter("menunggu")
                    }
                  >
                    Menunggu
                  </FilterButton>

                  <FilterButton
                    active={
                      statusFilter === "disetujui"
                    }
                    onClick={() =>
                      setStatusFilter(
                        "disetujui"
                      )
                    }
                  >
                    Disetujui
                  </FilterButton>

                  <FilterButton
                    active={
                      statusFilter === "ditolak"
                    }
                    onClick={() =>
                      setStatusFilter("ditolak")
                    }
                  >
                    Ditolak
                  </FilterButton>

                </div>
              </div>

              {/* JENIS FILTER */}

              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">

                <span className="text-xs font-semibold text-slate-500 flex items-center mr-1">
                  Jenis:
                </span>

                <SmallFilter
                  active={
                    jenisFilter === "semua"
                  }
                  onClick={() =>
                    setJenisFilter("semua")
                  }
                >
                  Semua
                </SmallFilter>

                <SmallFilter
                  active={
                    jenisFilter === "Izin"
                  }
                  onClick={() =>
                    setJenisFilter("Izin")
                  }
                >
                  Izin
                </SmallFilter>

                <SmallFilter
                  active={
                    jenisFilter === "Sakit"
                  }
                  onClick={() =>
                    setJenisFilter("Sakit")
                  }
                >
                  Sakit
                </SmallFilter>

              </div>
            </div>

            {/* ==================================================
                CONTENT
            ================================================== */}

            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">

              {/* =================================================
                  TABLE
              ================================================= */}

              <section className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden min-w-0">

                <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">

                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-800">
                      Daftar Pengajuan
                    </h2>

                    <p className="text-xs text-slate-500 mt-0.5">
                      {filteredData.length} pengajuan
                      ditampilkan
                    </p>
                  </div>

                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <CalendarDays size={17} />
                  </div>

                </div>

                {filteredData.length > 0 ? (
                  <div className="overflow-x-auto">

                    <table className="w-full min-w-[850px]">

                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-100">

                          <th className="text-left px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Siswa
                          </th>

                          <th className="text-left px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Jenis
                          </th>

                          <th className="text-left px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Tanggal
                          </th>

                          <th className="text-left px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Status
                          </th>

                          <th className="text-right px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Detail
                          </th>

                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">

                        {filteredData.map(
                          (item) => {
                            const selected =
                              selectedIzin?.id ===
                              item.id;

                            return (
                              <tr
                                key={item.id}
                                onClick={() =>
                                  setSelectedId(
                                    item.id
                                  )
                                }
                                className={`cursor-pointer transition-colors ${
                                  selected
                                    ? "bg-blue-50/60"
                                    : "hover:bg-slate-50"
                                }`}
                              >

                                {/* SISWA */}

                                <td className="px-5 py-4">

                                  <div className="flex items-center gap-3">

                                    <div
                                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                        selected
                                          ? "bg-blue-600 text-white"
                                          : "bg-blue-50 text-blue-700"
                                      }`}
                                    >
                                      {getInitials(
                                        item.nama
                                      )}
                                    </div>

                                    <div className="min-w-0">

                                      <p className="text-sm font-bold text-slate-800 truncate max-w-[250px]">
                                        {item.nama}
                                      </p>

                                      <p className="text-xs text-slate-500 mt-0.5">
                                        {item.nisn} • Kelas{" "}
                                        {item.kelas}
                                      </p>

                                    </div>
                                  </div>

                                </td>

                                {/* JENIS */}

                                <td className="px-4 py-4">

                                  <span
                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                                      item.jenis ===
                                      "Sakit"
                                        ? "bg-violet-50 text-violet-700 border border-violet-200"
                                        : "bg-blue-50 text-blue-700 border border-blue-200"
                                    }`}
                                  >
                                    {item.jenis}
                                  </span>

                                </td>

                                {/* TANGGAL */}

                                <td className="px-4 py-4">

                                  <p className="text-sm font-semibold text-slate-700">
                                    {formatDate(
                                      item.tanggal
                                    )}
                                  </p>

                                  <p className="text-xs text-slate-400 mt-0.5">
                                    Diajukan{" "}
                                    {item.diajukan}
                                  </p>

                                </td>

                                {/* STATUS */}

                                <td className="px-4 py-4">
                                  <StatusBadge
                                    status={
                                      item.status
                                    }
                                  />
                                </td>

                                {/* DETAIL */}

                                <td className="px-5 py-4 text-right">

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedId(
                                        item.id
                                      );
                                    }}
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                                  >
                                    <Eye size={14} />
                                    Lihat
                                  </button>

                                </td>

                              </tr>
                            );
                          }
                        )}

                      </tbody>
                    </table>

                  </div>
                ) : (
                  <EmptyState
                    onReset={() => {
                      setSearch("");
                      setStatusFilter(
                        "semua"
                      );
                      setJenisFilter(
                        "semua"
                      );
                    }}
                  />
                )}

              </section>

              {/* =================================================
                  DETAIL
              ================================================= */}

              <aside className="xl:sticky xl:top-6">

                {selectedIzin ? (
                  <DetailCard
                    data={selectedIzin}
                    onApprove={() =>
                      handleApprove(
                        selectedIzin.id
                      )
                    }
                    onReject={() =>
                      handleReject(
                        selectedIzin.id
                      )
                    }
                  />
                ) : (
                  <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
                    <Users
                      size={25}
                      className="mx-auto text-slate-300"
                    />

                    <p className="text-sm font-semibold text-slate-700 mt-3">
                      Belum ada data
                    </p>
                  </div>
                )}

              </aside>

            </div>

            {/* ==================================================
                MOBILE REFRESH
            ================================================== */}

            <button
              type="button"
              onClick={handleRefresh}
              className="sm:hidden w-full h-11 mt-5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-600 flex items-center justify-center gap-2"
            >
              <RefreshCw size={15} />
              Refresh Data
            </button>

            {/* FOOTER */}

            <div className="py-8 text-center">
              <p className="text-xs text-slate-400">
                SmartSchool Admin • Izin Siswa
              </p>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

/* ================================================================
   STAT CARD
================================================================ */

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  iconClass,
}) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm">

      <div className="flex items-start justify-between gap-3">

        <div className="min-w-0">

          <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">
            {label}
          </p>

          <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1.5">
            {value}
          </p>

          <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
            {description}
          </p>

        </div>

        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconClass}`}
        >
          <Icon size={18} />
        </div>

      </div>

    </div>
  );
}

/* ================================================================
   FILTER BUTTON
================================================================ */

function FilterButton({
  active,
  onClick,
  children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 px-3.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600"
      }`}
    >
      {children}
    </button>
  );
}

/* ================================================================
   SMALL FILTER
================================================================ */

function SmallFilter({
  active,
  onClick,
  children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
        active
          ? "bg-blue-100 text-blue-700"
          : "bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
      }`}
    >
      {children}
    </button>
  );
}

/* ================================================================
   STATUS BADGE
================================================================ */

function StatusBadge({ status }) {
  const config =
    STATUS_CONFIG[status] ||
    STATUS_CONFIG.menunggu;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold whitespace-nowrap ${config.className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${config.dot}`}
      />

      {config.label}
    </span>
  );
}

/* ================================================================
   DETAIL CARD
================================================================ */

function DetailCard({
  data,
  onApprove,
  onReject,
}) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">

      {/* HEADER */}

      <div className="relative bg-[#155DFC] p-5 sm:p-6 text-white overflow-hidden">

        <div className="absolute -right-10 -top-12 w-36 h-36 rounded-full bg-white/10" />

        <div className="absolute right-10 -bottom-20 w-32 h-32 rounded-full bg-white/10" />

        <div className="relative">

          <div className="flex items-center justify-between gap-3">

            <div className="w-12 h-12 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center font-bold">
              {getInitials(data.nama)}
            </div>

            <StatusBadge
              status={data.status}
            />

          </div>

          <h2 className="text-lg font-bold mt-4">
            {data.nama}
          </h2>

          <p className="text-xs text-blue-100 mt-1">
            Kelas {data.kelas} • {data.nisn}
          </p>

        </div>
      </div>

      {/* BODY */}

      <div className="p-5 sm:p-6">

        {/* INFO */}

        <div className="space-y-4">

          <DetailRow
            icon={User}
            label="Nama Siswa"
            value={data.nama}
          />

          <DetailRow
            icon={Users}
            label="Kelas"
            value={data.kelas}
          />

          <DetailRow
            icon={CalendarDays}
            label="Tanggal"
            value={formatDate(
              data.tanggal
            )}
          />

          <DetailRow
            icon={Clock3}
            label="Waktu Pengajuan"
            value={data.diajukan}
          />

          <DetailRow
            icon={
              data.jenis === "Sakit"
                ? UserX
                : UserCheck
            }
            label="Jenis"
            value={data.jenis}
          />

        </div>

        {/* ALASAN */}

        <div className="mt-6 pt-5 border-t border-slate-100">

          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Alasan Pengajuan
          </p>

          <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5">

            <p className="text-sm leading-6 text-slate-600">
              {data.alasan}
            </p>

          </div>

        </div>

        {/* ACTION */}

        {data.status === "menunggu" && (
          <div className="mt-5 grid grid-cols-2 gap-2.5">

            <button
              type="button"
              onClick={onReject}
              className="h-10 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <XCircle size={15} />
              Tolak
            </button>

            <button
              type="button"
              onClick={onApprove}
              className="h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <CheckCircle2 size={15} />
              Setujui
            </button>

          </div>
        )}

        {data.status === "disetujui" && (
          <div className="mt-5 rounded-xl bg-emerald-50 border border-emerald-100 p-3.5 flex items-center gap-3">

            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={17} />
            </div>

            <div>
              <p className="text-xs font-bold text-emerald-700">
                Pengajuan disetujui
              </p>

              <p className="text-[11px] text-emerald-600 mt-0.5">
                Izin siswa telah diterima.
              </p>
            </div>

          </div>
        )}

        {data.status === "ditolak" && (
          <div className="mt-5 rounded-xl bg-red-50 border border-red-100 p-3.5 flex items-center gap-3">

            <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
              <XCircle size={17} />
            </div>

            <div>
              <p className="text-xs font-bold text-red-700">
                Pengajuan ditolak
              </p>

              <p className="text-[11px] text-red-600 mt-0.5">
                Pengajuan izin tidak disetujui.
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

/* ================================================================
   DETAIL ROW
================================================================ */

function DetailRow({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-3">

      <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
        <Icon size={15} />
      </div>

      <div className="min-w-0 flex-1">

        <p className="text-[11px] text-slate-400">
          {label}
        </p>

        <p className="text-sm font-semibold text-slate-700 truncate mt-0.5">
          {value}
        </p>

      </div>
    </div>
  );
}

/* ================================================================
   EMPTY STATE
================================================================ */

function EmptyState({ onReset }) {
  return (
    <div className="px-6 py-16 text-center">

      <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
        <Search size={23} />
      </div>

      <h3 className="text-sm font-bold text-slate-800 mt-4">
        Data tidak ditemukan
      </h3>

      <p className="text-xs text-slate-500 mt-1">
        Tidak ada pengajuan yang sesuai
        dengan filter.
      </p>

      <button
        type="button"
        onClick={onReset}
        className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
      >
        <RefreshCw size={14} />
        Reset Filter
      </button>

    </div>
  );
}

/* ================================================================
   HELPERS
================================================================ */

function getInitials(name) {
  return name
    .replace(/,/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function formatDate(dateString) {
  const date = new Date(
    `${dateString}T00:00:00`
  );

  return date.toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}