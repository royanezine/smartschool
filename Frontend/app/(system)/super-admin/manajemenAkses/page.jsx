"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  UserCheck,
  UserCog,
  BookOpen,
  DollarSign,
  Key,
  Search,
  Eye,
  Edit,
  Trash2,
  FileSpreadsheet,
  Sparkles,
  ArrowUp,
  ArrowDown,
  BadgeCheck,
  Filter,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ShieldPlus,
  MoreHorizontal,
  Lock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Plus,
  Activity,
  UserRound,
  Settings2,
  ArrowUpRight,
  Database,
  Layers3,
} from "lucide-react";

import {
  getRoles,
  deleteRole,
} from "../../../services/role.service";

/* ============================================================
   ICON MAP
============================================================ */

const iconMap = {
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserCog,
  BookOpen,
  DollarSign,
  Users,
  Key,
};

/* ============================================================
   STATUS STYLE
============================================================ */

const statusStyle = {
  aktif: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },

  nonaktif: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    dot: "bg-rose-500",
    icon: XCircle,
  },
};

/* ============================================================
   ROLE ICON
============================================================ */

function getRoleIconName(role) {
  const nama = `${role?.nama || ""} ${
    role?.namaTampilan || ""
  }`.toLowerCase();

  if (nama.includes("super")) {
    return "ShieldCheck";
  }

  if (nama.includes("guru")) {
    return "BookOpen";
  }

  if (nama.includes("wali")) {
    return "UserCog";
  }

  if (nama.includes("siswa")) {
    return "UserCheck";
  }

  if (nama.includes("bendahara")) {
    return "DollarSign";
  }

  if (nama.includes("yayasan")) {
    return "ShieldAlert";
  }

  if (nama.includes("kepala")) {
    return "UserCheck";
  }

  if (nama.includes("staff")) {
    return "UserCog";
  }

  return "Shield";
}

/* ============================================================
   MAP RESPONSE BE
============================================================ */

function mapRoleFromApi(role) {
  return {
    id: role.id,
    nama: role.nama || "-",
    namaTampilan: role.namaTampilan || "-",
    deskripsi: role.deskripsi || "Tidak ada deskripsi.",
    status: role.status || "nonaktif",

    izin: Number(role._count?.peranIzin || 0),
    pengguna: Number(role._count?.pengguna || 0),

    sekolahId: role.sekolahId || null,
    sekolah: role.sekolah || null,

    ikon: getRoleIconName(role),
  };
}

/* ============================================================
   MAIN PAGE
============================================================ */

export default function ManajemenAksesPage() {
  const router = useRouter();

  const [activeMenu, setActiveMenu] = useState("manajemen-akses");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [roles, setRoles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");

  const [sortField, setSortField] = useState("nama");
  const [sortOrder, setSortOrder] = useState("asc");

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;

  const [isMobile, setIsMobile] = useState(false);

  const [openMenuId, setOpenMenuId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const notifications = [
    {
      id: 1,
      title: "Pembaruan Sistem v2.0",
      desc: "Dikirim 2 jam lalu",
      read: false,
    },
    {
      id: 2,
      title: "Pengingat: Backup Data",
      desc: "Dikirim 1 hari lalu",
      read: false,
    },
    {
      id: 3,
      title: "Role baru ditambahkan",
      desc: "Dikirim 3 hari lalu",
      read: true,
    },
  ];

  /* ============================================================
     LOAD DATA
  ============================================================ */

  const loadRoles = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await getRoles();

      const mappedRoles = Array.isArray(data)
        ? data.map(mapRoleFromApi)
        : [];

      setRoles(mappedRoles);
    } catch (error) {
      console.error("Gagal mengambil data role:", error);

      setErrorMessage(
        error?.message ||
          "Gagal mengambil data role dari server."
      );

      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  /* ============================================================
     RESPONSIVE
  ============================================================ */

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreen();

    window.addEventListener("resize", checkScreen);

    return () => {
      window.removeEventListener("resize", checkScreen);
    };
  }, []);

  /* ============================================================
     CLOSE DROPDOWN
  ============================================================ */

  useEffect(() => {
    if (!openMenuId) return;

    const closeMenu = () => {
      setOpenMenuId(null);
    };

    window.addEventListener("click", closeMenu);

    return () => {
      window.removeEventListener("click", closeMenu);
    };
  }, [openMenuId]);

  /* ============================================================
     STATISTICS
  ============================================================ */

  const statistics = useMemo(() => {
    const total = roles.length;

    const aktif = roles.filter(
      (role) => role.status === "aktif"
    ).length;

    const nonaktif = roles.filter(
      (role) => role.status === "nonaktif"
    ).length;

    const pengguna = roles.reduce(
      (sum, role) => sum + Number(role.pengguna || 0),
      0
    );

    const izin = roles.reduce(
      (sum, role) => sum + Number(role.izin || 0),
      0
    );

    return {
      total,
      aktif,
      nonaktif,
      pengguna,
      izin,
    };
  }, [roles]);

  /* ============================================================
     FILTER
  ============================================================ */

  const filteredData = useMemo(() => {
    const keyword = searchQuery.toLowerCase().trim();

    return roles.filter((item) => {
      const nama = String(item.nama || "").toLowerCase();

      const namaTampilan = String(
        item.namaTampilan || ""
      ).toLowerCase();

      const deskripsi = String(
        item.deskripsi || ""
      ).toLowerCase();

      const matchSearch =
        nama.includes(keyword) ||
        namaTampilan.includes(keyword) ||
        deskripsi.includes(keyword);

      const matchStatus =
        filterStatus === "Semua" ||
        item.status === filterStatus;

      return matchSearch && matchStatus;
    });
  }, [roles, searchQuery, filterStatus]);

  /* ============================================================
     SORT
  ============================================================ */

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let valueA;
      let valueB;

      if (
        sortField === "pengguna" ||
        sortField === "izin"
      ) {
        valueA = Number(a[sortField] || 0);
        valueB = Number(b[sortField] || 0);
      } else {
        valueA = String(
          a[sortField] || ""
        ).toLowerCase();

        valueB = String(
          b[sortField] || ""
        ).toLowerCase();
      }

      if (valueA < valueB) {
        return sortOrder === "asc" ? -1 : 1;
      }

      if (valueA > valueB) {
        return sortOrder === "asc" ? 1 : -1;
      }

      return 0;
    });
  }, [
    filteredData,
    sortField,
    sortOrder,
  ]);

  /* ============================================================
     PAGINATION
  ============================================================ */

  const totalPages = Math.max(
    1,
    Math.ceil(
      sortedData.length / itemsPerPage
    )
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  /* ============================================================
     SORT HANDLER
  ============================================================ */

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) =>
        prev === "asc" ? "desc" : "asc"
      );
    } else {
      setSortField(field);
      setSortOrder("asc");
    }

    setCurrentPage(1);
  };

  /* ============================================================
     SORT ICON
  ============================================================ */

  const renderSortIcon = (field) => {
    if (sortField !== field) return null;

    return sortOrder === "asc" ? (
      <ArrowUp
        size={13}
        className="text-blue-500"
      />
    ) : (
      <ArrowDown
        size={13}
        className="text-blue-500"
      />
    );
  };

  /* ============================================================
     RESET FILTER
  ============================================================ */

  const resetFilters = () => {
    setSearchQuery("");
    setFilterStatus("Semua");
    setCurrentPage(1);
  };

  /* ============================================================
     DELETE ROLE
  ============================================================ */

  const handleDelete = async (role) => {
    const confirmed = window.confirm(
      `Apakah kamu yakin ingin menghapus role "${role.nama}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(role.id);

      await deleteRole(role.id);

      setRoles((prev) =>
        prev.filter(
          (item) => item.id !== role.id
        )
      );

      setOpenMenuId(null);
    } catch (error) {
      console.error(
        "Gagal menghapus role:",
        error
      );

      window.alert(
        error?.message ||
          "Role gagal dihapus."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* ============================================================
     EXPORT CSV
  ============================================================ */

  const handleExport = () => {
    if (sortedData.length === 0) return;

    const header = [
      "Nama Role",
      "Nama Tampilan",
      "Deskripsi",
      "Izin",
      "Pengguna",
      "Status",
    ];

    const rows = sortedData.map((item) => [
      item.nama,
      item.namaTampilan,
      item.deskripsi,
      item.izin,
      item.pengguna,
      getStatusLabel(item.status),
    ]);

    const escapeCsv = (value) =>
      `"${String(value).replace(
        /"/g,
        '""'
      )}"`;

    const csvContent = [header, ...rows]
      .map((row) =>
        row.map(escapeCsv).join(",")
      )
      .join("\n");

    const blob = new Blob(
      ["\uFEFF" + csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `manajemen-akses-role-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /* ============================================================
     STATUS LABEL
  ============================================================ */

  const getStatusLabel = (status) => {
    if (status === "aktif") {
      return "Aktif";
    }

    if (status === "nonaktif") {
      return "Nonaktif";
    }

    return status || "-";
  };

  /* ============================================================
     ROLE ICON
  ============================================================ */

  const getRoleIcon = (iconName) => {
    return iconMap[iconName] || Shield;
  };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="flex min-h-screen bg-[#F5F8FC] text-slate-900">
      {/* ========================================================
          SIDEBAR
      ======================================================== */}

      <Sidebar
        active={activeMenu}
        setActive={setActiveMenu}
        collapsed={!sidebarOpen}
        setCollapsed={() =>
          setSidebarOpen((prev) => !prev)
        }
      />

      {/* ========================================================
          MAIN
      ======================================================== */}

      <div className="flex-1 min-w-0 flex flex-col">
        <Header
          toggleSidebar={() =>
            setSidebarOpen((prev) => !prev)
          }
          notifications={notifications}
          user={{
            name: "Sarah",
            email: "sarah@smartschool.com",
            avatar: "SA",
          }}
        />

        <main className="flex-1 w-full">
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-5 sm:py-7 lg:py-8">

            {/* ==================================================
                PREMIUM HERO
            ================================================== */}

            <section className="relative overflow-hidden rounded-[24px] bg-[#0F172A] shadow-[0_20px_50px_-25px_rgba(15,23,42,0.55)] mb-6">
              
              {/* Background glow */}

              <div className="absolute -top-24 -right-20 w-80 h-80 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />

              <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

              {/* Grid */}

              <div
                className="absolute inset-0 opacity-[0.045] pointer-events-none"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
                  backgroundSize:
                    "36px 36px",
                }}
              />

              <div className="relative p-5 sm:p-7 lg:p-8">
                <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-7">

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-300">
                        <ShieldCheck size={13} />
                        Security & Access
                      </span>

                      <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-medium text-slate-300">
                        <Activity size={12} />
                        SmartSchool
                      </span>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="hidden sm:flex w-14 h-14 shrink-0 rounded-2xl bg-blue-600/15 border border-blue-400/20 items-center justify-center text-blue-300">
                        <Shield
                          size={27}
                          strokeWidth={1.8}
                        />
                      </div>

                      <div>
                        <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-semibold tracking-tight text-white">
                          Manajemen Akses
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                          Kelola role, pengguna, dan
                          hak akses sistem SmartSchool
                          secara terpusat dan terstruktur.
                        </p>

                        <div className="flex flex-wrap items-center gap-3 mt-4">
                          <div className="flex items-center gap-2 text-xs text-slate-300">
                            <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center">
                              <Database size={12} />
                            </div>
                            Data terintegrasi
                          </div>

                          <div className="w-1 h-1 rounded-full bg-slate-500" />

                          <div className="flex items-center gap-2 text-xs text-slate-300">
                            <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center">
                              <Lock size={12} />
                            </div>
                            Kontrol akses
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ACTION */}

                  <div className="flex flex-col sm:flex-row gap-2.5 xl:shrink-0">
                    <button
                      type="button"
                      onClick={handleExport}
                      disabled={
                        loading ||
                        sortedData.length === 0
                      }
                      className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl border border-white/10 bg-white/5 text-slate-200 text-sm font-medium backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <FileSpreadsheet
                        size={16}
                      />
                      Export Data
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          "/super-admin/manajemenAkses/tambah-role"
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-lg shadow-blue-950/30 hover:bg-blue-500 hover:-translate-y-0.5 transition-all"
                    >
                      <ShieldPlus size={17} />
                      Tambah Role
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* ==================================================
                STATISTICS
            ================================================== */}

            <section className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6">

              <PremiumStatCard
                label="Total Role"
                value={statistics.total}
                description="Role terdaftar"
                icon={Shield}
                accent="blue"
              />

              <PremiumStatCard
                label="Role Aktif"
                value={statistics.aktif}
                description="Sedang digunakan"
                icon={BadgeCheck}
                accent="green"
              />

              <PremiumStatCard
                label="Total Pengguna"
                value={statistics.pengguna.toLocaleString(
                  "id-ID"
                )}
                description="Pengguna terkait"
                icon={Users}
                accent="indigo"
              />

              <PremiumStatCard
                label="Total Izin"
                value={statistics.izin}
                description="Hak akses terdaftar"
                icon={Key}
                accent="slate"
              />

            </section>

            {/* ==================================================
                INFORMATION
            ================================================== */}

            <section className="relative overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm mb-6">
              <div className="absolute right-0 top-0 w-44 h-full bg-gradient-to-l from-blue-50/80 to-transparent pointer-events-none" />

              <div className="relative flex items-start gap-4 p-4 sm:p-5">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                  <Sparkles
                    size={18}
                    strokeWidth={1.8}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold text-slate-800">
                      Pengaturan akses sistem
                    </h2>

                    <span className="text-[9px] font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5">
                      Security
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-500 leading-5 mt-1">
                    Pastikan setiap role hanya
                    memiliki izin sesuai dengan
                    kebutuhan dan tanggung jawab
                    pengguna.
                  </p>
                </div>

                <div className="hidden sm:flex w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 items-center justify-center text-slate-400">
                  <Settings2 size={15} />
                </div>
              </div>
            </section>

            {/* ==================================================
                ERROR
            ================================================== */}

            {errorMessage && (
              <section className="mb-6 rounded-2xl border border-rose-200 bg-white shadow-sm overflow-hidden">
                <div className="h-1 bg-rose-500" />

                <div className="flex items-start gap-3 p-4">
                  <div className="w-9 h-9 shrink-0 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
                    <AlertCircle size={17} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">
                      Gagal mengambil data role
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      {errorMessage}
                    </p>

                    <button
                      type="button"
                      onClick={loadRoles}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      <RotateCcw size={12} />
                      Coba lagi
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* ==================================================
                FILTER PANEL
            ================================================== */}

            <section className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden mb-5">

              <div className="p-4 sm:p-5">

                <div className="flex flex-col xl:flex-row xl:items-center gap-3">

                  {/* SEARCH */}

                  <div className="relative flex-1 min-w-0">
                    <Search
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
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
                      placeholder="Cari role, nama tampilan, atau deskripsi..."
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all"
                    />
                  </div>

                  {/* FILTER */}

                  <div className="flex flex-col sm:flex-row gap-2.5">

                    <div className="relative">
                      <Filter
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />

                      <select
                        value={filterStatus}
                        onChange={(e) => {
                          setFilterStatus(
                            e.target.value
                          );
                          setCurrentPage(1);
                        }}
                        className="w-full sm:w-[170px] h-11 pl-9 pr-8 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-600 focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer appearance-none"
                      >
                        <option value="Semua">
                          Semua Status
                        </option>

                        <option value="aktif">
                          Aktif
                        </option>

                        <option value="nonaktif">
                          Nonaktif
                        </option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={resetFilters}
                      className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl text-sm font-medium text-slate-500 border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-700 transition-all"
                    >
                      <RotateCcw size={14} />
                      Reset
                    </button>

                  </div>
                </div>

                {/* FILTER FOOTER */}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-100">

                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 text-blue-600">
                      <Layers3 size={13} />
                    </span>

                    <p className="text-xs text-slate-500">
                      Menampilkan{" "}
                      <span className="font-semibold text-slate-800">
                        {filteredData.length}
                      </span>{" "}
                      role
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <ArrowUp size={12} />
                    <span>
                      Klik judul kolom untuk
                      mengurutkan
                    </span>
                  </div>

                </div>
              </div>
            </section>

            {/* ==================================================
                DATA TABLE
            ================================================== */}

            <section className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">

              {/* TABLE HEADER */}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-slate-200 bg-slate-50/70">

                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
                      <Shield
                        size={15}
                        strokeWidth={1.9}
                      />
                    </div>

                    <div>
                      <h2 className="text-sm font-semibold text-slate-800">
                        Daftar Role
                      </h2>

                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Role dan kontrol akses
                        sistem
                      </p>
                    </div>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 text-[10px] font-medium text-slate-500 bg-white border border-slate-200 rounded-lg px-3 py-2">
                  <Activity
                    size={12}
                    className="text-emerald-500"
                  />
                  Data terhubung ke server
                </div>

              </div>

              {loading ? (
                <LoadingState />
              ) : isMobile ? (
                <MobileRoleList
                  data={paginatedData}
                  getRoleIcon={getRoleIcon}
                  deletingId={deletingId}
                  handleDelete={handleDelete}
                  router={router}
                />
              ) : (
                <div className="overflow-x-auto">

                  <table className="w-full min-w-[850px]">

                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200">

                        <SortableHeader
                          label="Role"
                          field="nama"
                          sortField={
                            sortField
                          }
                          onSort={
                            handleSort
                          }
                          icon={
                            renderSortIcon
                          }
                        />

                        <th className="hidden xl:table-cell px-5 py-3.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-[0.12em]">
                          Deskripsi
                        </th>

                        <SortableHeader
                          label="Izin"
                          field="izin"
                          sortField={
                            sortField
                          }
                          onSort={
                            handleSort
                          }
                          icon={
                            renderSortIcon
                          }
                        />

                        <SortableHeader
                          label="Pengguna"
                          field="pengguna"
                          sortField={
                            sortField
                          }
                          onSort={
                            handleSort
                          }
                          icon={
                            renderSortIcon
                          }
                        />

                        <SortableHeader
                          label="Status"
                          field="status"
                          sortField={
                            sortField
                          }
                          onSort={
                            handleSort
                          }
                          icon={
                            renderSortIcon
                          }
                        />

                        <th className="px-5 py-3.5 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-[0.12em]">
                          Aksi
                        </th>

                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">

                      {paginatedData.length ===
                      0 ? (
                        <tr>
                          <td colSpan={6}>
                            <EmptyState />
                          </td>
                        </tr>
                      ) : (
                        paginatedData.map(
                          (item) => {
                            const IconComponent =
                              getRoleIcon(
                                item.ikon
                              );

                            const style =
                              statusStyle[
                                item.status
                              ] ||
                              statusStyle.nonaktif;

                            const StatusIcon =
                              style.icon;

                            return (
                              <tr
                                key={
                                  item.id
                                }
                                className="group hover:bg-blue-50/30 transition-colors"
                              >

                                {/* ROLE */}

                                <td className="px-5 py-4">

                                  <div className="flex items-center gap-3 min-w-[210px]">

                                    <div className="relative w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 text-blue-600 flex items-center justify-center group-hover:border-blue-200 group-hover:shadow-sm transition-all">
                                      <IconComponent
                                        size={
                                          18
                                        }
                                        strokeWidth={
                                          1.9
                                        }
                                      />

                                      <span className="absolute -right-1 -bottom-1 w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center">
                                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                                      </span>
                                    </div>

                                    <div className="min-w-0">
                                      <p className="text-sm font-semibold text-slate-800 truncate">
                                        {
                                          item.nama
                                        }
                                      </p>

                                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                                        {
                                          item.namaTampilan
                                        }
                                      </p>
                                    </div>

                                  </div>

                                </td>

                                {/* DESCRIPTION */}

                                <td className="hidden xl:table-cell px-5 py-4 max-w-[300px]">

                                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                                    {
                                      item.deskripsi
                                    }
                                  </p>

                                </td>

                                {/* IZIN */}

                                <td className="px-5 py-4">

                                  <div className="inline-flex items-center gap-2">

                                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                                      <Key
                                        size={
                                          13
                                        }
                                      />
                                    </div>

                                    <span className="text-sm font-semibold text-slate-700">
                                      {
                                        item.izin
                                      }
                                    </span>

                                  </div>

                                </td>

                                {/* USERS */}

                                <td className="px-5 py-4">

                                  <div className="inline-flex items-center gap-2">

                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                                      <Users
                                        size={
                                          13
                                        }
                                      />
                                    </div>

                                    <span className="text-sm font-semibold text-slate-700">
                                      {item.pengguna.toLocaleString(
                                        "id-ID"
                                      )}
                                    </span>

                                  </div>

                                </td>

                                {/* STATUS */}

                                <td className="px-5 py-4">

                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10px] font-semibold ${style.bg} ${style.text} ${style.border}`}
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full ${style.dot}`}
                                    />

                                    <StatusIcon
                                      size={
                                        11
                                      }
                                    />

                                    {getStatusLabel(
                                      item.status
                                    )}
                                  </span>

                                </td>

                                {/* ACTION */}

                                <td className="px-5 py-4">

                                  <div className="flex items-center justify-end gap-1 relative">

                                    <ActionButton
                                      title="Detail"
                                      onClick={() =>
                                        router.push(
                                          `/super-admin/manajemenAkses/${item.id}`
                                        )
                                      }
                                    >
                                      <Eye
                                        size={
                                          15
                                        }
                                      />
                                    </ActionButton>

                                    <ActionButton
                                      title="Edit"
                                      hover="blue"
                                      onClick={() =>
                                        router.push(
                                          `/super-admin/manajemenAkses/edit-role?id=${item.id}`
                                        )
                                      }
                                    >
                                      <Edit
                                        size={
                                          15
                                        }
                                      />
                                    </ActionButton>

                                    <ActionButton
                                      title="Hapus"
                                      hover="rose"
                                      onClick={() =>
                                        handleDelete(
                                          item
                                        )
                                      }
                                    >
                                      {deletingId ===
                                      item.id ? (
                                        <Loader2
                                          size={
                                            15
                                          }
                                          className="animate-spin"
                                        />
                                      ) : (
                                        <Trash2
                                          size={
                                            15
                                          }
                                        />
                                      )}
                                    </ActionButton>

                                    <ActionButton
                                      title="Lainnya"
                                      onClick={(
                                        e
                                      ) => {
                                        e.stopPropagation();

                                        setOpenMenuId(
                                          (
                                            prev
                                          ) =>
                                            prev ===
                                            item.id
                                              ? null
                                              : item.id
                                        );
                                      }}
                                    >
                                      <MoreHorizontal
                                        size={
                                          15
                                        }
                                      />
                                    </ActionButton>

                                    {openMenuId ===
                                      item.id && (
                                      <div
                                        onClick={(
                                          e
                                        ) =>
                                          e.stopPropagation()
                                        }
                                        className="absolute right-0 top-10 z-20 w-48 rounded-xl border border-slate-200 bg-white shadow-[0_15px_40px_-15px_rgba(15,23,42,0.3)] py-1.5"
                                      >
                                        <button
                                          type="button"
                                          onClick={() => {
                                            router.push(
                                              `/super-admin/manajemenAkses/${item.id}`
                                            );

                                            setOpenMenuId(
                                              null
                                            );
                                          }}
                                          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                        >
                                          <Key
                                            size={
                                              14
                                            }
                                          />
                                          Kelola Izin
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            router.push(
                                              `/super-admin/manajemenAkses/edit-role?id=${item.id}`
                                            );

                                            setOpenMenuId(
                                              null
                                            );
                                          }}
                                          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors"
                                        >
                                          <Settings2
                                            size={
                                              14
                                            }
                                          />
                                          Pengaturan Role
                                        </button>
                                      </div>
                                    )}

                                  </div>

                                </td>

                              </tr>
                            );
                          }
                        )
                      )}

                    </tbody>

                  </table>

                </div>
              )}

              {/* ==================================================
                  PAGINATION
              ================================================== */}

              <div className="px-4 sm:px-5 py-4 border-t border-slate-200 bg-white">

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">

                  <p className="text-xs text-slate-500">
                    Menampilkan{" "}
                    <span className="font-semibold text-slate-700">
                      {sortedData.length ===
                      0
                        ? 0
                        : (currentPage -
                            1) *
                            itemsPerPage +
                          1}
                    </span>

                    {" - "}

                    <span className="font-semibold text-slate-700">
                      {Math.min(
                        currentPage *
                          itemsPerPage,
                        sortedData.length
                      )}
                    </span>

                    {" dari "}

                    <span className="font-semibold text-slate-700">
                      {
                        sortedData.length
                      }
                    </span>{" "}
                    data
                  </p>

                  <div className="flex items-center gap-1">

                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage(
                          (prev) =>
                            Math.max(
                              1,
                              prev - 1
                            )
                        )
                      }
                      disabled={
                        currentPage === 1
                      }
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft
                        size={15}
                      />
                    </button>

                    {Array.from({
                      length: totalPages,
                    }).map(
                      (_, index) => {
                        const page =
                          index + 1;

                        return (
                          <button
                            key={page}
                            type="button"
                            onClick={() =>
                              setCurrentPage(
                                page
                              )
                            }
                            className={`w-9 h-9 rounded-lg text-xs font-semibold transition-all ${
                              currentPage ===
                              page
                                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                                : "text-slate-500 hover:bg-slate-100"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      }
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage(
                          (prev) =>
                            Math.min(
                              totalPages,
                              prev + 1
                            )
                        )
                      }
                      disabled={
                        currentPage ===
                          totalPages ||
                        sortedData.length ===
                          0
                      }
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight
                        size={15}
                      />
                    </button>

                  </div>

                </div>

              </div>
            </section>

            {/* ==================================================
                FOOTER
            ================================================== */}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-5 pb-2">

              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center">
                  <Shield size={11} />
                </div>

                <p className="text-[11px] font-medium text-slate-500">
                  SmartSchool
                  <span className="text-slate-300 mx-1">
                    •
                  </span>
                  Manajemen Akses
                </p>
              </div>

              <p className="text-[11px] text-slate-400">
                Data diambil dari server
              </p>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

/* ============================================================
   PREMIUM STAT CARD
============================================================ */

function PremiumStatCard({
  label,
  value,
  description,
  icon: Icon,
  accent = "blue",
}) {
  const styles = {
    blue: {
      icon:
        "bg-blue-50 text-blue-600 border-blue-100",
      line: "bg-blue-500",
    },

    green: {
      icon:
        "bg-emerald-50 text-emerald-600 border-emerald-100",
      line: "bg-emerald-500",
    },

    indigo: {
      icon:
        "bg-indigo-50 text-indigo-600 border-indigo-100",
      line: "bg-indigo-500",
    },

    slate: {
      icon:
        "bg-slate-100 text-slate-600 border-slate-200",
      line: "bg-slate-500",
    },
  };

  const style =
    styles[accent] || styles.blue;

  return (
    <div className="group relative overflow-hidden bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">

      <div
        className={`absolute left-0 top-0 w-1 h-full ${style.line} opacity-80`}
      />

      <div className="flex items-center gap-3">

        <div
          className={`w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-xl border flex items-center justify-center ${style.icon} group-hover:scale-105 transition-transform`}
        >
          <Icon
            size={19}
            strokeWidth={1.9}
          />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-[0.12em] truncate">
            {label}
          </p>

          <p className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight mt-0.5">
            {value}
          </p>

          <p className="hidden sm:block text-[10px] text-slate-400 mt-0.5 truncate">
            {description}
          </p>
        </div>

      </div>

    </div>
  );
}

/* ============================================================
   MOBILE ROLE LIST
============================================================ */

function MobileRoleList({
  data,
  getRoleIcon,
  deletingId,
  handleDelete,
  router,
}) {
  if (data.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="divide-y divide-slate-100">

      {data.map((item) => {
        const IconComponent =
          getRoleIcon(item.ikon);

        const style =
          statusStyle[item.status] ||
          statusStyle.nonaktif;

        const StatusIcon = style.icon;

        return (
          <div
            key={item.id}
            className="p-4 sm:p-5 hover:bg-blue-50/20 transition-colors"
          >

            <div className="flex items-start gap-3">

              <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                <IconComponent
                  size={18}
                  strokeWidth={1.9}
                />
              </div>

              <div className="flex-1 min-w-0">

                <div className="flex items-start justify-between gap-3">

                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-800 truncate">
                      {item.nama}
                    </h3>

                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {item.namaTampilan}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 inline-flex items-center gap-1.5 px-2 py-1.5 rounded-full border text-[9px] font-semibold ${style.bg} ${style.text} ${style.border}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${style.dot}`}
                    />

                    <StatusIcon
                      size={10}
                    />

                    {item.status ===
                    "aktif"
                      ? "Aktif"
                      : "Nonaktif"}
                  </span>

                </div>

                <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                  {item.deskripsi}
                </p>

                <div className="flex flex-wrap items-center gap-2 mt-3">

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-semibold">
                    <Key size={11} />
                    {item.izin} izin
                  </span>

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-semibold">
                    <Users size={11} />
                    {item.pengguna.toLocaleString(
                      "id-ID"
                    )}{" "}
                    pengguna
                  </span>

                </div>

                <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-slate-100">

                  <ActionButton
                    title="Detail"
                    onClick={() =>
                      router.push(
                        `/super-admin/manajemenAkses/${item.id}`
                      )
                    }
                  >
                    <Eye size={14} />
                  </ActionButton>

                  <ActionButton
                    title="Edit"
                    onClick={() =>
                      router.push(
                        `/super-admin/manajemenAkses/edit-role?id=${item.id}`
                      )
                    }
                  >
                    <Edit size={14} />
                  </ActionButton>

                  <ActionButton
                    title="Hapus"
                    hover="rose"
                    onClick={() =>
                      handleDelete(item)
                    }
                  >
                    {deletingId ===
                    item.id ? (
                      <Loader2
                        size={14}
                        className="animate-spin"
                      />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </ActionButton>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/super-admin/manajemenAkses/${item.id}`
                      )
                    }
                    className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    Kelola
                    <ArrowUpRight
                      size={11}
                    />
                  </button>

                </div>

              </div>

            </div>

          </div>
        );
      })}

    </div>
  );
}

/* ============================================================
   SORTABLE HEADER
============================================================ */

function SortableHeader({
  label,
  field,
  sortField,
  onSort,
  icon,
}) {
  return (
    <th
      onClick={() => onSort(field)}
      className="px-5 py-3.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-[0.12em] cursor-pointer hover:text-blue-600 select-none whitespace-nowrap transition-colors"
    >
      <span className="inline-flex items-center gap-1.5">
        {label}

        {sortField === field &&
          icon(field)}
      </span>
    </th>
  );
}

/* ============================================================
   ACTION BUTTON
============================================================ */

function ActionButton({
  children,
  title,
  onClick,
  hover = "blue",
}) {
  const hoverMap = {
    blue:
      "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100",

    rose:
      "hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`w-8 h-8 rounded-lg border border-transparent flex items-center justify-center text-slate-400 transition-all ${hoverMap[hover]}`}
    >
      {children}
    </button>
  );
}

/* ============================================================
   LOADING STATE
============================================================ */

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-5">

      <div className="relative w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-4">
        <div className="absolute inset-0 rounded-2xl border border-blue-200 animate-ping opacity-30" />

        <Loader2
          size={23}
          className="animate-spin"
        />
      </div>

      <p className="text-sm font-semibold text-slate-700">
        Memuat data role...
      </p>

      <p className="text-xs text-slate-400 mt-1.5 text-center">
        Sedang mengambil data dari server
        SmartSchool.
      </p>

    </div>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-5">

      <div className="relative w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mb-4">
        <Search size={21} />

        <div className="absolute -right-1 -bottom-1 w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center">
          <XCircle
            size={11}
            className="text-slate-400"
          />
        </div>
      </div>

      <p className="text-sm font-semibold text-slate-700">
        Tidak ada role ditemukan
      </p>

      <p className="text-xs text-slate-400 mt-1.5 text-center max-w-sm leading-relaxed">
        Coba ubah kata kunci pencarian
        atau filter status untuk melihat
        data lainnya.
      </p>

    </div>
  );
}