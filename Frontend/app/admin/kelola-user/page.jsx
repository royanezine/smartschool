"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";

import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle,
  UserCheck,
  UserX,
  Shield,
  GraduationCap,
  BookOpen,
  Award,
  Star,
  Clock,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  Filter,
  UserCog,
  Eye,
  AlertCircle,
  X,
} from "lucide-react";

// =========================================================
// ROLE ICON
// =========================================================

const getRoleIcon = (role = "") => {
  const value = role.toLowerCase();

  if (
    value.includes("kepala sekolah") ||
    value.includes("kepsek")
  ) {
    return Star;
  }

  if (
    value.includes("wakil") ||
    value.includes("wakil kepala")
  ) {
    return Award;
  }

  if (
    value.includes("jurusan") ||
    value.includes("kepala jurusan")
  ) {
    return BookOpen;
  }

  if (
    value.includes("guru") &&
    value.includes("bk")
  ) {
    return UserCog;
  }

  if (value.includes("guru")) {
    return GraduationCap;
  }

  if (value.includes("bendahara")) {
    return Shield;
  }

  if (
    value.includes("wali") ||
    value.includes("kelas")
  ) {
    return Users;
  }

  return Users;
};

// =========================================================
// ROLE COLOR
// =========================================================

const getRoleColor = (role = "") => {
  const value = role.toLowerCase();

  if (value.includes("kepala sekolah")) {
    return "bg-purple-100 text-purple-600";
  }

  if (value.includes("wakil")) {
    return "bg-indigo-100 text-indigo-600";
  }

  if (value.includes("jurusan")) {
    return "bg-blue-100 text-blue-600";
  }

  if (value.includes("bk")) {
    return "bg-cyan-100 text-cyan-600";
  }

  if (value.includes("bendahara")) {
    return "bg-emerald-100 text-emerald-600";
  }

  if (value.includes("guru")) {
    return "bg-amber-100 text-amber-600";
  }

  if (value.includes("wali")) {
    return "bg-rose-100 text-rose-600";
  }

  return "bg-slate-100 text-slate-600";
};

// =========================================================
// INITIALS
// =========================================================

const getInitials = (nama) => {
  if (!nama) return "U";

  const parts = nama.trim().split(/\s+/);

  if (parts.length >= 2) {
    return (
      parts[0][0] +
      parts[1][0]
    ).toUpperCase();
  }

  return nama.substring(0, 2).toUpperCase();
};

// =========================================================
// FORMAT DATE
// =========================================================

const formatDateTime = (date) => {
  if (!date) return "-";

  try {
    return new Date(date).toLocaleString(
      "id-ID",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  } catch {
    return "-";
  }
};

// =========================================================
// DUMMY DATA
// =========================================================

const dummyUsers = [
  {
    id: 1,
    namaLengkap: "Dr. Ahmad Fauzi, M.Pd.",
    nip: "197501012005011001",
    email: "ahmad.fauzi@smartschool.com",
    noTelepon: "081234567890",
    peran: { nama: "kepala_sekolah", namaTampilan: "Kepala Sekolah" },
    status: "aktif",
    terakhirLogin: "2026-01-15T08:30:00",
  },
  {
    id: 2,
    namaLengkap: "Dra. Siti Rahayu, M.Si.",
    nip: "197805122008022002",
    email: "siti.rahayu@smartschool.com",
    noTelepon: "081298765432",
    peran: { nama: "wakil_kepala", namaTampilan: "Wakil Kepala Sekolah" },
    status: "aktif",
    terakhirLogin: "2026-01-14T13:15:00",
  },
  {
    id: 3,
    namaLengkap: "Drs. Budi Santoso, M.Kom.",
    nip: "198210202009031003",
    email: "budi.santoso@smartschool.com",
    noTelepon: "087812345678",
    peran: { nama: "kepala_jurusan", namaTampilan: "Kepala Jurusan RPL" },
    status: "aktif",
    terakhirLogin: "2026-01-13T09:45:00",
  },
  {
    id: 4,
    namaLengkap: "Dewi Lestari, S.Pd.",
    nip: "198512302010042004",
    email: "dewi.lestari@smartschool.com",
    noTelepon: "085678912345",
    peran: { nama: "guru_bk", namaTampilan: "Guru BK" },
    status: "aktif",
    terakhirLogin: "2026-01-12T11:20:00",
  },
  {
    id: 5,
    namaLengkap: "Eko Prasetyo, S.Sos.",
    nip: "198701152011052005",
    email: "eko.prasetyo@smartschool.com",
    noTelepon: "081345678901",
    peran: { nama: "bendahara", namaTampilan: "Bendahara" },
    status: "nonaktif",
    terakhirLogin: "2025-12-20T14:10:00",
  },
  {
    id: 6,
    namaLengkap: "Fitriani, S.Pd.",
    nip: "199003102012062006",
    email: "fitriani@smartschool.com",
    noTelepon: "082234567890",
    peran: { nama: "guru", namaTampilan: "Guru Matematika" },
    status: "aktif",
    terakhirLogin: "2026-01-11T07:50:00",
  },
  {
    id: 7,
    namaLengkap: "Gunawan, S.Kom.",
    nip: "199105212013072007",
    email: "gunawan@smartschool.com",
    noTelepon: "083456789012",
    peran: { nama: "guru", namaTampilan: "Guru Komputer" },
    status: "aktif",
    terakhirLogin: "2026-01-10T10:30:00",
  },
  {
    id: 8,
    namaLengkap: "Heni Kurniawati, S.Pd.",
    nip: "199208152014082008",
    email: "heni.kurniawati@smartschool.com",
    noTelepon: "084567890123",
    peran: { nama: "wali_kelas", namaTampilan: "Wali Kelas XI IPA" },
    status: "nonaktif",
    terakhirLogin: "2025-12-28T16:00:00",
  },
  {
    id: 9,
    namaLengkap: "Irfan Maulana, M.Pd.",
    nip: "199309202015092009",
    email: "irfan.maulana@smartschool.com",
    noTelepon: "085678901234",
    peran: { nama: "guru", namaTampilan: "Guru Bahasa Inggris" },
    status: "aktif",
    terakhirLogin: "2026-01-09T08:15:00",
  },
  {
    id: 10,
    namaLengkap: "Joko Susilo, S.Pd.",
    nip: "199411122016102010",
    email: "joko.susilo@smartschool.com",
    noTelepon: "086789012345",
    peran: { nama: "guru", namaTampilan: "Guru Olahraga" },
    status: "aktif",
    terakhirLogin: "2026-01-08T12:40:00",
  },
  {
    id: 11,
    namaLengkap: "Kartika Sari, S.E.",
    nip: "199512182017112011",
    email: "kartika.sari@smartschool.com",
    noTelepon: "087890123456",
    peran: { nama: "bendahara", namaTampilan: "Bendahara" },
    status: "nonaktif",
    terakhirLogin: "2025-12-15T09:00:00",
  },
  {
    id: 12,
    namaLengkap: "Lukman Hakim, S.Pd.",
    nip: "199601252018122012",
    email: "lukman.hakim@smartschool.com",
    noTelepon: "088901234567",
    peran: { nama: "wali_kelas", namaTampilan: "Wali Kelas XII IPS" },
    status: "aktif",
    terakhirLogin: "2026-01-07T13:25:00",
  },
];

// =========================================================
// MAIN COMPONENT
// =========================================================

export default function KelolaUserPage() {
  const router = useRouter();

  // =======================================================
  // SIDEBAR
  // =======================================================

  const [isCollapsed, setIsCollapsed] =
    useState(false);

  // =======================================================
  // DATA
  // =======================================================

  const [users, setUsers] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  // =======================================================
  // FILTER
  // =======================================================

  const [search, setSearch] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState("Semua");

  const [statusFilter, setStatusFilter] =
    useState("Semua");

  // =======================================================
  // PAGINATION
  // =======================================================

  const [currentPage, setCurrentPage] =
    useState(1);

  const itemsPerPage = 8;

  const [totalItems, setTotalItems] =
    useState(0);

  const [totalPages, setTotalPages] =
    useState(1);

  // =======================================================
  // DELETE LOADING
  // =======================================================

  const [deletingId, setDeletingId] =
    useState(null);

  // =======================================================
  // UPDATE STATUS LOADING
  // =======================================================

  const [updatingStatusId, setUpdatingStatusId] =
    useState(null);

  // =======================================================
  // LOAD DATA (DUMMY)
  // =======================================================

  const loadUsers = async ({
    page = currentPage,
    showRefresh = false,
  } = {}) => {
    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Simulasi delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Filter data dummy berdasarkan search, role, status
      let filtered = [...dummyUsers];

      if (search.trim()) {
        const s = search.trim().toLowerCase();
        filtered = filtered.filter(
          (user) =>
            user.namaLengkap.toLowerCase().includes(s) ||
            user.email.toLowerCase().includes(s) ||
            user.nip.includes(s)
        );
      }

      if (statusFilter !== "Semua") {
        filtered = filtered.filter(
          (user) => user.status === statusFilter
        );
      }

      if (roleFilter !== "Semua") {
        filtered = filtered.filter(
          (user) => user.peran.nama === roleFilter
        );
      }

      // Pagination
      const total = filtered.length;
      const totalPagesCalc = Math.max(1, Math.ceil(total / itemsPerPage));
      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const paginated = filtered.slice(start, end);

      setUsers(paginated);
      setTotalItems(total);
      setTotalPages(totalPagesCalc);
    } catch (err) {
      console.error("Error load dummy:", err);
      setUsers([]);
      setTotalItems(0);
      setTotalPages(1);
      setError("Gagal mengambil data dummy.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =======================================================
  // FIRST LOAD
  // =======================================================

  useEffect(() => {
    loadUsers({
      page: currentPage,
    });
  }, [
    currentPage,
    search,
    roleFilter,
    statusFilter,
  ]);

  // =======================================================
  // ROLE OPTIONS
  // =======================================================

  const roleOptions = useMemo(() => {
    const roleMap = new Map();

    dummyUsers.forEach((user) => {
      if (user?.peran?.nama) {
        roleMap.set(
          user.peran.nama,
          user.peran.namaTampilan ||
          user.peran.nama
        );
      }
    });

    return Array.from(
      roleMap.entries()
    ).map(
      ([value, label]) => ({
        value,
        label,
      })
    );
  }, []);

  // =======================================================
  // STATISTICS (berdasarkan data yang tampil, atau semua? 
  // Lebih tepat berdasarkan seluruh data dummy)
  // =======================================================

  const totalAktif = dummyUsers.filter(
    (user) =>
      user.status === "aktif"
  ).length;

  const totalNonaktif = dummyUsers.filter(
    (user) =>
      user.status === "nonaktif"
  ).length;

  // =======================================================
  // RESET FILTER
  // =======================================================

  const handleReset = () => {
    setSearch("");
    setRoleFilter("Semua");
    setStatusFilter("Semua");
    setCurrentPage(1);
  };

  // =======================================================
  // TOGGLE STATUS (DUMMY)
  // =======================================================

  const handleToggleStatus = async (
    user
  ) => {
    const isActive = user.status === "aktif";
    const newStatus = isActive ? "nonaktif" : "aktif";

    try {
      setUpdatingStatusId(user.id);
      setError("");

      // Simulasi delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Update di dummyUsers (cari dan ubah)
      const index = dummyUsers.findIndex((u) => u.id === user.id);
      if (index !== -1) {
        dummyUsers[index].status = newStatus;
      }

      // Reload data
      await loadUsers({
        page: currentPage,
        showRefresh: false,
      });
    } catch (err) {
      console.error("Error update status dummy:", err);
      setError("Gagal mengubah status pengguna.");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // =======================================================
  // DELETE (DUMMY)
  // =======================================================

  const handleDelete = async (
    user
  ) => {
    const confirmed = window.confirm(
      `Yakin ingin menonaktifkan pengguna "${user.namaLengkap}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(user.id);
      setError("");

      // Simulasi delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Hapus dari dummyUsers
      const index = dummyUsers.findIndex((u) => u.id === user.id);
      if (index !== -1) {
        dummyUsers.splice(index, 1);
      }

      // Kalau halaman terakhir tinggal 1 data
      if (users.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        await loadUsers({
          page: currentPage,
        });
      }
    } catch (err) {
      console.error("Error delete dummy:", err);
      setError("Gagal menghapus pengguna.");
    } finally {
      setDeletingId(null);
    }
  };

  // =======================================================
  // PAGINATION
  // =======================================================

  const goToPage = (page) => {
    if (
      page >= 1 &&
      page <= totalPages
    ) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from(
        {
          length: totalPages,
        },
        (_, index) =>
          index + 1
      );
    }

    if (currentPage <= 3) {
      return [
        1,
        2,
        3,
        4,
        5,
      ];
    }

    if (
      currentPage >=
      totalPages - 2
    ) {
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
    ];
  };

  const startIndex =
    totalItems === 0
      ? 0
      : (currentPage - 1) *
          itemsPerPage +
        1;

  const endIndex = Math.min(
    currentPage *
      itemsPerPage,
    totalItems
  );

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f8fafc]">

      {/* SIDEBAR */}
      <Sidebar
        active="kelolaUser"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={
          setIsCollapsed
        }
      />

      {/* CONTENT */}
      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">

        {/* HEADER */}
        <Header
          toggleSidebar={() =>
            setIsCollapsed(
              !isCollapsed
            )
          }
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email:
              "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        {/* MAIN */}
        <main className="flex-1 overflow-y-auto">

          <div className="w-full p-3 sm:p-5 lg:p-7 xl:p-8">

            <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5 lg:space-y-6">

              {/* =================================================
                  PAGE HEADER
              ================================================= */}

              <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.05)]">

                <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-50/70 blur-3xl" />

                <div className="relative flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-6">

                  <div className="flex min-w-0 items-start gap-3 sm:gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.25)] sm:h-14 sm:w-14">
                      <Users
                        size={22}
                        strokeWidth={1.9}
                        className="sm:h-[25px] sm:w-[25px]"
                      />
                    </div>

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-2">

                        <h1 className="text-xl font-semibold tracking-[-0.025em] text-slate-900 sm:text-2xl lg:text-[26px]">
                          Kelola User
                        </h1>

                        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-600 sm:px-3 sm:py-1 sm:text-[11px]">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                          Level Sekolah
                        </span>

                      </div>

                      <div className="mt-1 flex items-center gap-1.5 sm:gap-2">

                        <UserCog
                          size={13}
                          className="shrink-0 text-blue-400 sm:h-[14px] sm:w-[14px]"
                        />

                        <p className="text-xs leading-5 text-slate-500 sm:text-sm">
                          Kelola pengguna di lingkungan sekolah Anda.
                        </p>

                      </div>

                    </div>

                  </div>

                  <div className="flex w-full flex-wrap gap-2 sm:flex-row lg:w-auto">

                    {/* REFRESH */}
                    <button
                      onClick={() =>
                        loadUsers({
                          page: currentPage,
                          showRefresh: true,
                        })
                      }
                      disabled={refreshing}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-[0_2px_5px_rgba(15,23,42,0.05)] transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:w-11"
                      title="Refresh data"
                    >
                      <RefreshCw
                        size={16}
                        className={
                          refreshing
                            ? "animate-spin sm:h-[17px] sm:w-[17px]"
                            : "sm:h-[17px] sm:w-[17px]"
                        }
                      />
                    </button>

                    {/* TAMBAH */}
                    <button
                      onClick={() =>
                        router.push(
                          "/admin/kelola-user/tambah"
                        )
                      }
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-[0_7px_18px_rgba(15,23,42,0.16)] transition-all hover:bg-slate-800 sm:h-11 sm:px-5"
                    >
                      <Plus
                        size={16}
                        strokeWidth={2.3}
                      />

                      Tambah User
                    </button>

                  </div>

                </div>

              </section>

              {/* =================================================
                  ERROR
              ================================================= */}

              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">

                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-rose-600"
                  />

                  <div className="min-w-0 flex-1">

                    <p className="text-sm font-semibold text-rose-700">
                      Terjadi kesalahan
                    </p>

                    <p className="mt-0.5 text-xs text-rose-600">
                      {error}
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      setError("")
                    }
                    className="text-rose-400 hover:text-rose-600"
                  >
                    <X size={16} />
                  </button>

                </div>
              )}

              {/* =================================================
                  STATS
              ================================================= */}

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

                <StatCard
                  label="Total User"
                  value={dummyUsers.length}
                  icon={Users}
                  color="blue"
                />

                <StatCard
                  label="Aktif"
                  value={totalAktif}
                  icon={CheckCircle}
                  color="emerald"
                />

                <StatCard
                  label="Nonaktif"
                  value={totalNonaktif}
                  icon={UserX}
                  color="rose"
                />

                <StatCard
                  label="Role"
                  value={roleOptions.length}
                  icon={Shield}
                  color="indigo"
                />

              </div>

              {/* =================================================
                  SEARCH & FILTER
              ================================================= */}

              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.04)] sm:p-5">

                <div className="mb-4 flex items-center gap-2 sm:gap-3">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 sm:h-9 sm:w-9">
                    <Filter
                      size={14}
                    />
                  </div>

                  <div>

                    <p className="text-sm font-semibold text-slate-800">
                      Filter & Pencarian
                    </p>

                    <p className="text-xs text-slate-400">
                      Cari dan filter data user
                    </p>

                  </div>

                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                  {/* SEARCH */}
                  <div className="relative">

                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      placeholder="Cari nama, email, NIP..."
                      value={search}
                      onChange={(e) => {
                        setSearch(
                          e.target.value
                        );
                        setCurrentPage(1);
                      }}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />

                  </div>

                  {/* ROLE */}
                  <select
                    value={roleFilter}
                    onChange={(e) => {
                      setRoleFilter(
                        e.target.value
                      );
                      setCurrentPage(1);
                    }}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  >

                    <option value="Semua">
                      Semua Role
                    </option>

                    {roleOptions.map(
                      (role) => (
                        <option
                          key={role.value}
                          value={
                            role.value
                          }
                        >
                          {role.label}
                        </option>
                      )
                    )}

                  </select>

                  {/* STATUS */}
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(
                        e.target.value
                      );
                      setCurrentPage(1);
                    }}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
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

                  {/* RESET */}
                  <button
                    onClick={handleReset}
                    className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                  >
                    Reset
                  </button>

                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">

                  <p className="text-xs text-slate-400">

                    Menampilkan{" "}

                    <span className="font-semibold text-slate-600">
                      {totalItems}
                    </span>{" "}

                    data user

                  </p>

                </div>

              </section>

              {/* =================================================
                  TABLE
              ================================================= */}

              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_3px_14px_rgba(15,23,42,0.05)]">

                <div className="border-b border-slate-100 px-5 py-4 sm:px-6 sm:py-5">

                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                      <h2 className="text-sm font-semibold text-slate-800">
                        Daftar User
                      </h2>

                      <p className="text-xs text-slate-500">
                        User yang terdaftar di lingkungan sekolah
                      </p>

                    </div>

                    <div className="text-xs text-slate-500">
                      {totalItems} user
                    </div>

                  </div>

                </div>

                {/* LOADING */}
                {loading ? (
                  <LoadingTable />
                ) : users.length === 0 ? (

                  /* EMPTY */
                  <div className="flex flex-col items-center justify-center py-16 text-center">

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <Users size={24} />
                    </div>

                    <h3 className="mt-4 text-sm font-semibold text-slate-700">
                      Tidak ada data user
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      {search ||
                      roleFilter !== "Semua" ||
                      statusFilter !== "Semua"
                        ? "Coba ubah filter pencarian"
                        : "Belum ada user yang terdaftar"}
                    </p>

                  </div>

                ) : (

                  <>
                    <div className="overflow-x-auto">

                      <table className="w-full min-w-[1050px] border-collapse">

                        <thead>

                          <tr className="border-b border-slate-200 bg-slate-50/80">

                            <th className="w-12 px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                              No
                            </th>

                            <th className="min-w-[230px] px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                              Nama / NIP
                            </th>

                            <th className="min-w-[200px] px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                              Email / Phone
                            </th>

                            <th className="min-w-[180px] px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                              Role
                            </th>

                            <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                              Status
                            </th>

                            <th className="min-w-[180px] px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                              Terakhir Login
                            </th>

                            <th className="w-36 px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                              Aksi
                            </th>

                          </tr>

                        </thead>

                        <tbody className="divide-y divide-slate-100">

                          {users.map(
                            (
                              item,
                              index
                            ) => {

                              const rowNumber =
                                (currentPage -
                                  1) *
                                  itemsPerPage +
                                index +
                                1;

                              const roleName =
                                item
                                  ?.peran
                                  ?.namaTampilan ||
                                item
                                  ?.peran
                                  ?.nama ||
                                "User";

                              const roleKey =
                                item
                                  ?.peran
                                  ?.nama ||
                                "";

                              const RoleIcon =
                                getRoleIcon(
                                  roleName
                                );

                              const roleColor =
                                getRoleColor(
                                  roleName
                                );

                              const isActive =
                                item.status ===
                                "aktif";

                              const isUpdatingStatus =
                                updatingStatusId ===
                                item.id;

                              const isDeleting =
                                deletingId ===
                                item.id;

                              return (
                                <tr
                                  key={
                                    item.id
                                  }
                                  className="transition-colors hover:bg-slate-50/70"
                                >

                                  {/* NO */}
                                  <td className="px-4 py-3.5 text-center text-sm text-slate-400">
                                    {rowNumber}
                                  </td>

                                  {/* NAMA */}
                                  <td className="px-4 py-3.5">

                                    <div className="flex items-center gap-3">

                                      {item.avatar ? (
                                        <img
                                          src={
                                            item.avatar
                                          }
                                          alt={
                                            item.namaLengkap ||
                                            "User"
                                          }
                                          className="h-9 w-9 shrink-0 rounded-full object-cover"
                                        />
                                      ) : (
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                                          {getInitials(
                                            item.namaLengkap
                                          )}
                                        </div>
                                      )}

                                      <div className="min-w-0">

                                        <p className="truncate text-sm font-semibold text-slate-800">
                                          {item.namaLengkap ||
                                            "-"}
                                        </p>

                                        <p className="text-xs text-slate-400">
                                          {item.nip
                                            ? `NIP: ${item.nip}`
                                            : item.nipd
                                              ? `NIPD: ${item.nipd}`
                                              : item.nisn
                                                ? `NISN: ${item.nisn}`
                                                : "Tidak ada nomor identitas"}
                                        </p>

                                      </div>

                                    </div>

                                  </td>

                                  {/* EMAIL */}
                                  <td className="px-4 py-3.5">

                                    <div className="min-w-0">

                                      <p className="truncate text-sm text-slate-700">
                                        {item.email ||
                                          "-"}
                                      </p>

                                      <p className="text-xs text-slate-400">
                                        {item.noTelepon ||
                                          "-"}
                                      </p>

                                    </div>

                                  </td>

                                  {/* ROLE */}
                                  <td className="px-4 py-3.5">

                                    <div className="flex items-center gap-2">

                                      <div
                                        className={`rounded-lg p-1.5 ${roleColor}`}
                                      >
                                        <RoleIcon
                                          size={
                                            14
                                          }
                                        />
                                      </div>

                                      <div className="min-w-0">

                                        <p className="truncate text-sm font-medium text-slate-700">
                                          {roleName}
                                        </p>

                                        {roleKey &&
                                          roleKey !==
                                            roleName && (
                                            <p className="text-[10px] text-slate-400">
                                              {roleKey}
                                            </p>
                                          )}

                                      </div>

                                    </div>

                                  </td>

                                  {/* STATUS */}
                                  <td className="px-4 py-3.5">

                                    <span
                                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                                        isActive
                                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                          : "border-rose-200 bg-rose-50 text-rose-700"
                                      }`}
                                    >

                                      <span
                                        className={`h-1.5 w-1.5 rounded-full ${
                                          isActive
                                            ? "bg-emerald-500"
                                            : "bg-rose-500"
                                        }`}
                                      />

                                      {isActive
                                        ? "Aktif"
                                        : "Nonaktif"}

                                    </span>

                                  </td>

                                  {/* LOGIN */}
                                  <td className="px-4 py-3.5">

                                    <div className="flex items-center gap-1.5 text-sm text-slate-500">

                                      <Clock
                                        size={
                                          13
                                        }
                                        className="shrink-0 text-slate-400"
                                      />

                                      {formatDateTime(
                                        item.terakhirLogin
                                      )}

                                    </div>

                                  </td>

                                  {/* ACTION */}
                                  <td className="px-4 py-3.5">

                                    <div className="flex items-center justify-center gap-0.5">

                                      {/* TOGGLE */}
                                      <button
                                        onClick={() =>
                                          handleToggleStatus(
                                            item
                                          )
                                        }
                                        disabled={
                                          isUpdatingStatus ||
                                          isDeleting
                                        }
                                        className={`rounded-lg p-1.5 text-slate-400 transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                                          isActive
                                            ? "hover:bg-amber-50 hover:text-amber-600"
                                            : "hover:bg-emerald-50 hover:text-emerald-600"
                                        }`}
                                        title={
                                          isActive
                                            ? "Nonaktifkan"
                                            : "Aktifkan"
                                        }
                                      >

                                        {isUpdatingStatus ? (
                                          <RefreshCw
                                            size={
                                              15
                                            }
                                            className="animate-spin"
                                          />
                                        ) : isActive ? (
                                          <UserX
                                            size={
                                              15
                                            }
                                          />
                                        ) : (
                                          <UserCheck
                                            size={
                                              15
                                            }
                                          />
                                        )}

                                      </button>

                                      {/* EDIT */}
                                      <button
                                        onClick={() =>
                                          router.push(
                                            `/admin/kelola-user/edit/${item.id}`
                                          )
                                        }
                                        disabled={
                                          isDeleting
                                        }
                                        className="rounded-lg p-1.5 text-slate-400 transition-all hover:bg-amber-50 hover:text-amber-600 disabled:opacity-40"
                                        title="Edit"
                                      >
                                        <Edit
                                          size={
                                            15
                                          }
                                        />
                                      </button>

                                      {/* DETAIL */}
                                      <button
                                        onClick={() =>
                                          router.push(
                                            `/admin/kelola-user/detail/${item.id}`
                                          )
                                        }
                                        disabled={
                                          isDeleting
                                        }
                                        className="rounded-lg p-1.5 text-slate-400 transition-all hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40"
                                        title="Detail"
                                      >
                                        <Eye
                                          size={
                                            15
                                          }
                                        />
                                      </button>

                                      {/* DELETE */}
                                      <button
                                        onClick={() =>
                                          handleDelete(
                                            item
                                          )
                                        }
                                        disabled={
                                          isDeleting ||
                                          isUpdatingStatus
                                        }
                                        className="rounded-lg p-1.5 text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                                        title="Hapus"
                                      >

                                        {isDeleting ? (
                                          <RefreshCw
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

                                      </button>

                                    </div>

                                  </td>

                                </tr>
                              );
                            }
                          )}

                        </tbody>

                      </table>

                    </div>

                    {/* =================================================
                        PAGINATION
                    ================================================= */}

                    <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">

                      <div className="text-xs text-slate-500">

                        Menampilkan{" "}

                        <span className="font-semibold text-slate-700">
                          {startIndex}
                        </span>

                        {" - "}

                        <span className="font-semibold text-slate-700">
                          {endIndex}
                        </span>

                        {" dari "}

                        <span className="font-semibold text-slate-700">
                          {totalItems}
                        </span>

                        {" data"}

                      </div>

                      <div className="flex items-center gap-1">

                        {/* FIRST */}
                        <button
                          onClick={() =>
                            goToPage(1)
                          }
                          disabled={
                            currentPage ===
                            1
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ChevronsLeft
                            size={14}
                          />
                        </button>

                        {/* PREVIOUS */}
                        <button
                          onClick={() =>
                            goToPage(
                              currentPage -
                                1
                            )
                          }
                          disabled={
                            currentPage ===
                            1
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ChevronLeft
                            size={14}
                          />
                        </button>

                        {/* NUMBERS */}
                        {getPageNumbers().map(
                          (page) => (
                            <button
                              key={page}
                              onClick={() =>
                                goToPage(
                                  page
                                )
                              }
                              className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-semibold transition-all ${
                                currentPage ===
                                page
                                  ? "bg-blue-600 text-white shadow-[0_4px_10px_rgba(37,99,235,0.25)]"
                                  : "text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              {page}
                            </button>
                          )
                        )}

                        {/* NEXT */}
                        <button
                          onClick={() =>
                            goToPage(
                              currentPage +
                                1
                            )
                          }
                          disabled={
                            currentPage ===
                            totalPages
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ChevronRight
                            size={14}
                          />
                        </button>

                        {/* LAST */}
                        <button
                          onClick={() =>
                            goToPage(
                              totalPages
                            )
                          }
                          disabled={
                            currentPage ===
                            totalPages
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ChevronsRight
                            size={14}
                          />
                        </button>

                      </div>

                    </div>

                  </>

                )}

              </section>

              {/* =================================================
                  ROLE REFERENCE
              ================================================= */}

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)] sm:p-6">

                <div className="mb-4 flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                    <Shield size={16} />
                  </div>

                  <div>

                    <p className="text-sm font-semibold text-slate-800">
                      Role Level Sekolah
                    </p>

                    <p className="text-xs text-slate-400">
                      Role yang tersedia berdasarkan data backend
                    </p>

                  </div>

                </div>

                {roleOptions.length ===
                0 ? (

                  <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center">

                    <Shield
                      size={24}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-2 text-xs text-slate-400">
                      Belum ada data role
                    </p>

                  </div>

                ) : (

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">

                    {roleOptions.map(
                      (
                        role,
                        index
                      ) => {

                        const Icon =
                          getRoleIcon(
                            role.label
                          );

                        const color =
                          getRoleColor(
                            role.label
                          );

                        const count =
                          dummyUsers.filter(
                            (user) =>
                              user
                                ?.peran
                                ?.nama ===
                              role.value
                          ).length;

                        return (
                          <div
                            key={
                              role.value
                            }
                            className="rounded-xl border border-slate-200 p-3 text-center transition-all hover:border-blue-200 hover:shadow-sm"
                          >

                            <div className="flex justify-center">

                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full ${color}`}
                              >
                                <Icon
                                  size={
                                    15
                                  }
                                />
                              </div>

                            </div>

                            <p className="mt-1.5 line-clamp-2 text-[10px] font-semibold leading-tight text-slate-700">
                              {role.label}
                            </p>

                            <p className="mt-0.5 text-[10px] text-slate-400">
                              Role
                            </p>

                            <p className="mt-0.5 text-[10px] font-medium text-blue-600">
                              {count} user
                            </p>

                          </div>
                        );
                      }
                    )}

                  </div>

                )}

              </section>

              {/* FOOTER */}

              <footer className="border-t border-slate-200/70 pt-4 text-center sm:pt-5">

                <p className="text-xs text-slate-400">
                  © 2026 SmartSchool • Kelola User - Level Sekolah
                </p>

              </footer>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}

// =========================================================
// STAT CARD
// =========================================================

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}) {
  const colorMap = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
    },

    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
    },

    rose: {
      bg: "bg-rose-50",
      text: "text-rose-600",
    },

    indigo: {
      bg: "bg-indigo-50",
      text: "text-indigo-600",
    },
  };

  const styles =
    colorMap[color] ||
    colorMap.blue;

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_10px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_7px_20px_rgba(15,23,42,0.08)] sm:p-5">

      <div className="flex items-center justify-between gap-3">

        <div className="min-w-0">

          <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-400">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-800">
            {value}
          </p>

        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.bg} ${styles.text}`}
        >
          <Icon
            size={20}
            strokeWidth={1.8}
          />
        </div>

      </div>

    </div>
  );
}

// =========================================================
// LOADING TABLE
// =========================================================

function LoadingTable() {
  return (
    <div className="divide-y divide-slate-100">

      {Array.from({
        length: 8,
      }).map((_, index) => (
        <div
          key={index}
          className="flex min-w-[1050px] items-center gap-5 px-5 py-4"
        >

          <div className="h-4 w-5 animate-pulse rounded bg-slate-100" />

          <div className="flex flex-1 items-center gap-3">

            <div className="h-9 w-9 animate-pulse rounded-full bg-slate-100" />

            <div className="space-y-2">

              <div className="h-3 w-40 animate-pulse rounded bg-slate-100" />

              <div className="h-2.5 w-28 animate-pulse rounded bg-slate-100" />

            </div>

          </div>

          <div className="w-48 space-y-2">

            <div className="h-3 w-36 animate-pulse rounded bg-slate-100" />

            <div className="h-2.5 w-24 animate-pulse rounded bg-slate-100" />

          </div>

          <div className="h-7 w-28 animate-pulse rounded-lg bg-slate-100" />

          <div className="h-6 w-16 animate-pulse rounded-full bg-slate-100" />

          <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />

          <div className="h-7 w-28 animate-pulse rounded bg-slate-100" />

        </div>
      ))}

    </div>
  );
}