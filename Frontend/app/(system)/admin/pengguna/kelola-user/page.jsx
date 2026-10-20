"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  getUsers,
  updateUser,
  deleteUser,
} from "@/services/user.service";

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
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Info,
} from "lucide-react";

// =========================================================
// HELPERS
// =========================================================

const getRoleIcon = (role = "") => {
  const value = String(role).toLowerCase();

  if (value.includes("kepala sekolah") || value.includes("kepsek")) return Star;
  if (value.includes("wakil")) return Award;
  if (value.includes("jurusan")) return BookOpen;
  if (value.includes("guru") && value.includes("bk")) return UserCog;
  if (value.includes("guru")) return GraduationCap;
  if (value.includes("bendahara")) return Shield;
  if (value.includes("wali") || value.includes("kelas")) return Users;

  return Users;
};

const getRoleColor = (role = "") => {
  const value = String(role).toLowerCase();

  if (value.includes("kepala sekolah")) {
    return "bg-[var(--color-info-background)] text-[var(--color-primary)]";
  }
  if (value.includes("wakil")) {
    return "bg-[var(--color-info-background)] text-[var(--color-info)]";
  }
  if (value.includes("jurusan")) {
    return "bg-[var(--color-sidebar-active)] text-[var(--color-sidebar-text-active)]";
  }
  if (value.includes("bk")) {
    return "bg-[var(--color-info-background)] text-[var(--color-info)]";
  }
  if (value.includes("bendahara")) {
    return "bg-[var(--color-success-background)] text-[var(--color-success)]";
  }
  if (value.includes("guru")) {
    return "bg-[var(--color-warning-background)] text-[var(--color-warning)]";
  }
  if (value.includes("wali")) {
    return "bg-[var(--color-danger-background)] text-[var(--color-danger)]";
  }

  return "theme-card-soft theme-text-muted";
};

const getInitials = (nama) => {
  if (!nama) return "U";

  const parts = String(nama).trim().split(/\s+/);

  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  return String(nama).substring(0, 2).toUpperCase();
};

const formatDateTime = (date) => {
  if (!date) return null;

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return null;

  return parsedDate.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const extractUsers = (response) => {
  if (Array.isArray(response)) return response;

  const candidates = [
    response?.data?.users,
    response?.data?.data,
    response?.data?.items,
    response?.data,
    response?.users,
    response?.items,
  ];

  return candidates.find(Array.isArray) || [];
};

const extractPagination = (response, fallbackTotal) => {
  const pagination =
    response?.pagination ||
    response?.data?.pagination ||
    response?.meta?.pagination ||
    response?.data?.meta ||
    response?.meta ||
    {};

  const total = Number(
    pagination.total ??
      pagination.totalItems ??
      pagination.totalData ??
      pagination.totalRecords ??
      response?.total ??
      response?.data?.total ??
      fallbackTotal
  );

  const pages = Number(
    pagination.totalPages ??
      pagination.lastPage ??
      pagination.pages ??
      response?.totalPages ??
      response?.data?.totalPages ??
      1
  );

  return {
    total: Number.isFinite(total) ? total : fallbackTotal,
    totalPages: Number.isFinite(pages) && pages > 0 ? pages : 1,
  };
};

const normalizeUser = (user) => ({
  ...user,
  id: user?.id,
  namaLengkap:
    user?.namaLengkap || user?.namaPengguna || user?.name || "-",
  email: user?.email || "-",
  noTelepon:
    user?.noTelepon ??
    user?.nomorTelepon ??
    user?.telepon ??
    user?.phone ??
    "",
  nip: user?.nip || "",
  nipd: user?.nipd || "",
  nisn: user?.nisn || "",
  avatar: user?.avatar || "",
  status: String(user?.status || "nonaktif").toLowerCase(),
  // Hanya menggunakan waktu login yang benar-benar dikirim oleh API.
  // Tidak menggunakan dibuatPada sebagai pengganti.
  terakhirLogin:
    user?.terakhirLogin ??
    user?.lastLogin ??
    user?.last_login ??
    user?.loginTerakhir ??
    null,
  peran: {
    ...(user?.peran || {}),
    nama: user?.peran?.nama || "",
    namaTampilan:
      user?.peran?.namaTampilan || user?.peran?.nama || "User",
  },
});

// =========================================================
// MAIN COMPONENT
// =========================================================

export default function KelolaUserPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");

  const [sortBy, setSortBy] = useState("nama");
  const [sortDir, setSortDir] = useState("asc");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [deletingId, setDeletingId] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  // =======================================================
  // LOAD DATA
  // =======================================================

  const loadUsers = useCallback(
    async ({ page = currentPage, showRefresh = false } = {}) => {
      try {
        setError("");

        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const params = {
          page,
          limit: itemsPerPage,
        };

        if (search.trim()) params.search = search.trim();
        if (roleFilter !== "Semua") params.role = roleFilter;
        if (statusFilter !== "Semua") params.status = statusFilter;

        const response = await getUsers(params);
        const rows = extractUsers(response).map(normalizeUser);
        const pagination = extractPagination(response, rows.length);

        setUsers(rows);
        setTotalItems(pagination.total);
        setTotalPages(Math.max(1, pagination.totalPages));

        if (page > pagination.totalPages && pagination.total > 0) {
          setCurrentPage(pagination.totalPages);
        }
      } catch (err) {
        console.error("Gagal mengambil data pengguna:", err);

        setUsers([]);
        setTotalItems(0);
        setTotalPages(1);
        setError(
          err?.message ||
            "Gagal mengambil data pengguna. Periksa koneksi backend dan hak akses akun."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentPage, search, roleFilter, statusFilter]
  );

  useEffect(() => {
    loadUsers({ page: currentPage });
  }, [loadUsers, currentPage]);

  // =======================================================
  // CEK KETERSEDIAAN DATA TERAKHIR LOGIN
  // =======================================================

  const loginFieldAvailable = useMemo(
    () => users.some((user) => user.terakhirLogin != null),
    [users]
  );

  // =======================================================
  // ROLE OPTIONS
  // =======================================================

  const roleOptions = useMemo(() => {
    const roleMap = new Map();

    users.forEach((user) => {
      const role = user?.peran;

      if (role?.nama) {
        roleMap.set(role.nama, role.namaTampilan || role.nama);
      }
    });

    return Array.from(roleMap.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [users]);

  // =======================================================
  // STATISTICS
  // =======================================================

  const totalAktif = users.filter((user) => user.status === "aktif").length;
  const totalNonaktif = users.filter((user) => user.status !== "aktif").length;

  // =======================================================
  // FILTER & SORT
  // =======================================================

  const handleReset = () => {
    setSearch("");
    setRoleFilter("Semua");
    setStatusFilter("Semua");
    setSortBy("nama");
    setSortDir("asc");
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleRoleChange = (value) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDir("asc");
    }

    setCurrentPage(1);
  };

  const sortedUsers = useMemo(() => {
    const list = [...users];

    const compare = (a, b) => {
      let valA;
      let valB;

      switch (sortBy) {
        case "nama":
          valA = String(a.namaLengkap || "").toLowerCase();
          valB = String(b.namaLengkap || "").toLowerCase();
          break;
        case "email":
          valA = String(a.email || "").toLowerCase();
          valB = String(b.email || "").toLowerCase();
          break;
        case "role":
          valA = String(
            a.peran?.namaTampilan || a.peran?.nama || ""
          ).toLowerCase();
          valB = String(
            b.peran?.namaTampilan || b.peran?.nama || ""
          ).toLowerCase();
          break;
        case "status":
          valA = String(a.status || "").toLowerCase();
          valB = String(b.status || "").toLowerCase();
          break;
        case "login":
          valA = a.terakhirLogin
            ? new Date(a.terakhirLogin).getTime()
            : 0;
          valB = b.terakhirLogin
            ? new Date(b.terakhirLogin).getTime()
            : 0;
          break;
        default:
          return 0;
      }

      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    };

    return list.sort(compare);
  }, [users, sortBy, sortDir]);

  // =======================================================
  // TOGGLE STATUS
  // =======================================================

  const handleToggleStatus = async (user) => {
    const isActive = user.status === "aktif";
    const newStatus = isActive ? "nonaktif" : "aktif";

    const confirmed = window.confirm(
      `Yakin ingin ${
        isActive ? "menonaktifkan" : "mengaktifkan"
      } pengguna "${user.namaLengkap}"?`
    );

    if (!confirmed) return;

    try {
      setUpdatingStatusId(user.id);
      setError("");
      setNotice("");

      await updateUser(user.id, { status: newStatus });

      setNotice(
        `Status ${user.namaLengkap} berhasil diubah menjadi ${newStatus}.`
      );

      await loadUsers({ page: currentPage, showRefresh: true });
    } catch (err) {
      console.error("Gagal mengubah status:", err);
      setError(
        err?.message || "Gagal mengubah status pengguna."
      );
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // =======================================================
  // DELETE
  // =======================================================

  const handleDelete = async (user) => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus pengguna "${user.namaLengkap}"? Pengguna akan dinonaktifkan melalui backend.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(user.id);
      setError("");
      setNotice("");

      await deleteUser(user.id);

      setNotice(`Pengguna ${user.namaLengkap} berhasil dinonaktifkan.`);

      const nextPage =
        users.length === 1 && currentPage > 1
          ? currentPage - 1
          : currentPage;

      if (nextPage !== currentPage) {
        setCurrentPage(nextPage);
      } else {
        await loadUsers({ page: currentPage, showRefresh: true });
      }
    } catch (err) {
      console.error("Gagal menghapus pengguna:", err);
      setError(err?.message || "Gagal menghapus pengguna.");
    } finally {
      setDeletingId(null);
    }
  };

  // =======================================================
  // PAGINATION
  // =======================================================

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 3) return [1, 2, 3, 4, 5];

    if (currentPage >= totalPages - 2) {
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
    totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="kelolaUser"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={() => setIsCollapsed(!isCollapsed)}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="w-full p-3 sm:p-5 lg:p-7 xl:p-8">
            <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5 lg:space-y-6">

              {/* PAGE HEADER */}
              <section className="theme-card relative overflow-hidden rounded-2xl border shadow-sm">
                <div
                  className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full blur-3xl"
                  style={{
                    background:
                      "color-mix(in srgb, var(--color-primary) 8%, transparent)",
                  }}
                />

                <div className="relative flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:px-8 lg:py-6">
                  <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[image:var(--color-brand-logo-bg)] text-white shadow-lg sm:h-14 sm:w-14">
                      <Users size={22} strokeWidth={1.9} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="theme-text text-xl font-semibold tracking-[-0.025em] sm:text-2xl lg:text-[26px]">
                          Kelola User
                        </h1>

                        <span className="theme-info inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold sm:px-3 sm:py-1 sm:text-[11px]">
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: "var(--color-info)" }}
                          />
                          Level Sekolah
                        </span>
                      </div>

                      <div className="mt-1 flex items-center gap-1.5 sm:gap-2">
                        <UserCog
                          size={14}
                          className="shrink-0 text-[var(--color-primary)]"
                        />
                        <p className="theme-text-muted text-xs leading-5 sm:text-sm">
                          Kelola pengguna di lingkungan sekolah Anda.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full flex-wrap gap-2 sm:flex-row lg:w-auto">
                    <button
                      onClick={() =>
                        loadUsers({ page: currentPage, showRefresh: true })
                      }
                      disabled={refreshing || loading}
                      className="theme-input flex h-10 w-10 items-center justify-center rounded-xl shadow-sm transition-all hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:w-11"
                      title="Refresh data"
                    >
                      <RefreshCw
                        size={17}
                        className={refreshing ? "animate-spin" : ""}
                      />
                    </button>

                    <button
                      onClick={() =>
                        router.push("/admin/pengguna/kelola-user/tambah")
                      }
                      className="theme-primary inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold shadow-lg transition-all sm:h-11 sm:px-5"
                    >
                      <Plus size={16} strokeWidth={2.3} />
                      Tambah User
                    </button>
                  </div>
                </div>
              </section>

              {/* PERINGATAN DATA LOGIN DARI BE */}
              {!loading && !loginFieldAvailable && users.length > 0 && (
                <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
                  <Info size={19} className="mt-0.5 shrink-0" />

                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      Data terakhir login belum tersedia
                    </p>
                    <p className="mt-1 text-xs leading-5">
                      Respons endpoint daftar pengguna dari backend belum
                      menyertakan data waktu terakhir login. Kolom ini
                      ditampilkan sebagai “Belum tersedia”, bukan waktu
                      perkiraan. Agar waktu login sebenarnya dapat ditampilkan,
                      backend perlu mengirimkan field terakhirLogin dan
                      memastikan waktu login dicatat saat pengguna berhasil
                      masuk.
                    </p>
                  </div>
                </div>
              )}

              {/* ERROR */}
              {error && (
                <div className="theme-danger flex items-start gap-3 rounded-xl border p-4">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">Terjadi kesalahan</p>
                    <p className="mt-0.5 break-words text-xs">{error}</p>
                  </div>

                  <button
                    onClick={() => setError("")}
                    className="transition-opacity hover:opacity-70"
                    aria-label="Tutup pesan kesalahan"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* SUCCESS NOTICE */}
              {notice && (
                <div className="theme-success flex items-start gap-3 rounded-xl border p-4">
                  <CheckCircle size={18} className="mt-0.5 shrink-0" />
                  <p className="flex-1 text-sm">{notice}</p>
                  <button
                    onClick={() => setNotice("")}
                    aria-label="Tutup pemberitahuan"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* STATS */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard label="Total User" value={totalItems} icon={Users} color="blue" />
                <StatCard label="Aktif di Halaman" value={totalAktif} icon={CheckCircle} color="emerald" />
                <StatCard label="Nonaktif di Halaman" value={totalNonaktif} icon={UserX} color="rose" />
                <StatCard label="Role di Halaman" value={roleOptions.length} icon={Shield} color="indigo" />
              </div>

              {/* SEARCH & FILTER */}
              <section className="theme-card rounded-2xl border p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex items-center gap-2 sm:gap-3">
                  <div className="theme-info flex h-8 w-8 shrink-0 items-center justify-center rounded-xl sm:h-9 sm:w-9">
                    <Filter size={14} />
                  </div>
                  <div>
                    <p className="theme-text text-sm font-semibold">Filter & Pencarian</p>
                    <p className="theme-text-muted text-xs">Cari dan filter data user</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="relative">
                    <Search
                      size={15}
                      className="theme-text-placeholder absolute left-3 top-1/2 -translate-y-1/2"
                    />
                    <input
                      type="text"
                      placeholder="Cari nama, email, NIP..."
                      value={search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="theme-input h-10 w-full rounded-xl border pl-9 pr-3 text-sm outline-none transition-all focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]"
                    />
                  </div>

                  <select
                    value={roleFilter}
                    onChange={(e) => handleRoleChange(e.target.value)}
                    className="theme-input h-10 w-full rounded-xl border px-3 text-sm outline-none"
                  >
                    <option value="Semua">Semua Role</option>
                    {roleOptions.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="theme-input h-10 w-full rounded-xl border px-3 text-sm outline-none"
                  >
                    <option value="Semua">Semua Status</option>
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>

                  <button
                    onClick={handleReset}
                    className="theme-input h-10 rounded-xl border px-4 text-sm font-medium transition-all hover:opacity-80"
                  >
                    Reset
                  </button>
                </div>

                <div className="theme-border-soft mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                  <p className="theme-text-muted text-xs">
                    Total data sesuai hasil backend:{" "}
                    <span className="theme-text font-semibold">{totalItems}</span>
                  </p>

                  <p className="theme-text-muted text-xs">
                    Urut:{" "}
                    <span className="theme-text font-semibold">
                      {sortBy === "nama"
                        ? "Nama"
                        : sortBy === "email"
                          ? "Email"
                          : sortBy === "role"
                            ? "Role"
                            : sortBy === "status"
                              ? "Status"
                              : "Terakhir Login"}{" "}
                      ({sortDir === "asc" ? "A-Z" : "Z-A"})
                    </span>
                  </p>
                </div>
              </section>

              {/* TABLE */}
              <section className="theme-card overflow-hidden rounded-2xl border shadow-sm">
                <div className="theme-border-soft border-b px-5 py-4 sm:px-6 sm:py-5">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="theme-text text-sm font-semibold">Daftar User</h2>
                      <p className="theme-text-muted text-xs">
                        User yang terdaftar di lingkungan sekolah
                      </p>
                    </div>
                    <div className="theme-text-muted text-xs">{totalItems} user</div>
                  </div>
                </div>

                {loading ? (
                  <LoadingTable />
                ) : users.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="theme-card-soft theme-text-muted flex h-14 w-14 items-center justify-center rounded-2xl border">
                      <Users size={24} />
                    </div>
                    <h3 className="theme-text mt-4 text-sm font-semibold">Tidak ada data user</h3>
                    <p className="theme-text-muted mt-1 max-w-sm px-4 text-xs">
                      {error
                        ? "Data tidak dapat dimuat. Periksa pesan kesalahan di atas."
                        : search || roleFilter !== "Semua" || statusFilter !== "Semua"
                          ? "Coba ubah filter pencarian."
                          : "Belum ada user yang terdaftar."}
                    </p>
                    {!error && (
                      <button
                        onClick={() =>
                          loadUsers({ page: currentPage, showRefresh: true })
                        }
                        className="theme-primary mt-4 rounded-lg px-4 py-2 text-xs font-semibold"
                      >
                        Muat Ulang
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[1050px] border-collapse">
                        <thead>
                          <tr className="theme-table-header border-b">
                            <th className="w-12 px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.08em]">
                              No
                            </th>
                            <SortableHeader label="Nama / NIP" column="nama" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} className="min-w-[230px]" />
                            <SortableHeader label="Email / Phone" column="email" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} className="min-w-[200px]" />
                            <SortableHeader label="Role" column="role" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} className="min-w-[180px]" />
                            <SortableHeader label="Status" column="status" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
                            <SortableHeader label="Terakhir Login" column="login" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} className="min-w-[180px]" />
                            <th className="w-36 px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.08em]">
                              Aksi
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-[var(--color-border-soft)]">
                          {sortedUsers.map((item, index) => {
                            const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                            const roleName = item.peran.namaTampilan || item.peran.nama || "User";
                            const roleKey = item.peran.nama;
                            const RoleIcon = getRoleIcon(roleName);
                            const roleColor = getRoleColor(roleName);
                            const isActive = item.status === "aktif";
                            const isUpdatingStatus = updatingStatusId === item.id;
                            const isDeleting = deletingId === item.id;
                            const loginDate = formatDateTime(item.terakhirLogin);

                            return (
                              <tr key={item.id} className="theme-table-hover transition-colors">
                                <td className="theme-text-muted px-4 py-3.5 text-center text-sm">
                                  {rowNumber}
                                </td>

                                <td className="px-4 py-3.5">
                                  <div className="flex items-center gap-3">
                                    {item.avatar ? (
                                      <img
                                        src={item.avatar}
                                        alt={item.namaLengkap || "User"}
                                        className="h-9 w-9 shrink-0 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="theme-info flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                                        {getInitials(item.namaLengkap)}
                                      </div>
                                    )}
                                    <div className="min-w-0">
                                      <p className="theme-text truncate text-sm font-semibold">{item.namaLengkap}</p>
                                      <p className="theme-text-muted text-xs">
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

                                <td className="px-4 py-3.5">
                                  <div className="min-w-0">
                                    <p className="theme-text-secondary truncate text-sm">{item.email}</p>
                                    <p className="theme-text-muted text-xs">
                                      {item.noTelepon?.trim() || "Nomor telepon belum tersedia"}
                                    </p>
                                  </div>
                                </td>

                                <td className="px-4 py-3.5">
                                  <div className="flex items-center gap-2">
                                    <div className={`rounded-lg p-1.5 ${roleColor}`}>
                                      <RoleIcon size={14} />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="theme-text-secondary truncate text-sm font-medium">{roleName}</p>
                                      {roleKey && roleKey !== roleName && (
                                        <p className="theme-text-muted text-[10px]">{roleKey}</p>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                <td className="px-4 py-3.5">
                                  <span
                                    className={
                                      isActive
                                        ? "theme-success inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
                                        : "theme-danger inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
                                    }
                                  >
                                    <span
                                      className="h-1.5 w-1.5 rounded-full"
                                      style={{
                                        background: isActive
                                          ? "var(--color-success)"
                                          : "var(--color-danger)",
                                      }}
                                    />
                                    {isActive ? "Aktif" : "Nonaktif"}
                                  </span>
                                </td>

                                <td className="px-4 py-3.5">
                                  <div className="theme-text-muted flex items-center gap-1.5 text-sm">
                                    <Clock size={13} />
                                    {loginDate || (
                                      <span title="Data waktu login belum dikirim oleh backend">
                                        Belum tersedia
                                      </span>
                                    )}
                                  </div>
                                </td>

                                <td className="px-4 py-3.5">
                                  <div className="flex items-center justify-center gap-0.5">
                                    <button
                                      onClick={() => handleToggleStatus(item)}
                                      disabled={isUpdatingStatus || isDeleting}
                                      className={
                                        isActive
                                          ? "theme-text-muted rounded-lg p-1.5 transition-all hover:bg-[var(--color-warning-background)] hover:text-[var(--color-warning)] disabled:cursor-not-allowed disabled:opacity-40"
                                          : "theme-text-muted rounded-lg p-1.5 transition-all hover:bg-[var(--color-success-background)] hover:text-[var(--color-success)] disabled:cursor-not-allowed disabled:opacity-40"
                                      }
                                      title={isActive ? "Nonaktifkan" : "Aktifkan"}
                                    >
                                      {isUpdatingStatus ? (
                                        <RefreshCw size={15} className="animate-spin" />
                                      ) : isActive ? (
                                        <UserX size={15} />
                                      ) : (
                                        <UserCheck size={15} />
                                      )}
                                    </button>

                                    <button
                                      onClick={() =>
                                        router.push(`/admin/pengguna/kelola-user/${item.id}/edit`)
                                      }
                                      disabled={isDeleting}
                                      className="theme-text-muted rounded-lg p-1.5 transition-all hover:bg-[var(--color-warning-background)] hover:text-[var(--color-warning)] disabled:opacity-40"
                                      title="Edit"
                                    >
                                      <Edit size={15} />
                                    </button>

                                    <button
                                      onClick={() =>
                                        router.push(`/admin/pengguna/kelola-user/${item.id}`)
                                      }
                                      disabled={isDeleting}
                                      className="theme-text-muted rounded-lg p-1.5 transition-all hover:bg-[var(--color-info-background)] hover:text-[var(--color-info)] disabled:opacity-40"
                                      title="Detail"
                                    >
                                      <Eye size={15} />
                                    </button>

                                    <button
                                      onClick={() => handleDelete(item)}
                                      disabled={isDeleting || isUpdatingStatus}
                                      className="theme-text-muted rounded-lg p-1.5 transition-all hover:bg-[var(--color-danger-background)] hover:text-[var(--color-danger)] disabled:cursor-not-allowed disabled:opacity-40"
                                      title="Hapus"
                                    >
                                      {isDeleting ? (
                                        <RefreshCw size={15} className="animate-spin" />
                                      ) : (
                                        <Trash2 size={15} />
                                      )}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* PAGINATION */}
                    <div className="theme-border border-t px-4 py-4 sm:px-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="theme-text-muted text-xs">
                          Menampilkan{" "}
                          <span className="theme-text font-semibold">{startIndex}</span>
                          {" - "}
                          <span className="theme-text font-semibold">{endIndex}</span>
                          {" dari "}
                          <span className="theme-text font-semibold">{totalItems}</span>
                          {" data"}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => goToPage(1)}
                            disabled={currentPage === 1}
                            className="theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:bg-[var(--color-header-hover)] disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Halaman pertama"
                          >
                            <ChevronsLeft size={14} />
                          </button>

                          <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:bg-[var(--color-header-hover)] disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Halaman sebelumnya"
                          >
                            <ChevronLeft size={14} />
                          </button>

                          {getPageNumbers().map((page) => (
                            <button
                              key={page}
                              onClick={() => goToPage(page)}
                              className={
                                currentPage === page
                                  ? "theme-primary flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-semibold shadow-md transition-all"
                                  : "theme-text-secondary flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-semibold transition-all hover:bg-[var(--color-header-hover)]"
                              }
                            >
                              {page}
                            </button>
                          ))}

                          <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:bg-[var(--color-header-hover)] disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Halaman berikutnya"
                          >
                            <ChevronRight size={14} />
                          </button>

                          <button
                            onClick={() => goToPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:bg-[var(--color-header-hover)] disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Halaman terakhir"
                          >
                            <ChevronsRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </section>

              {/* ROLE REFERENCE */}
              <section className="theme-card rounded-2xl border p-5 shadow-sm sm:p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="theme-info flex h-9 w-9 items-center justify-center rounded-xl">
                    <Shield size={16} />
                  </div>
                  <div>
                    <p className="theme-text text-sm font-semibold">Role Level Sekolah</p>
                    <p className="theme-text-muted text-xs">Role yang ditemukan pada data halaman ini</p>
                  </div>
                </div>

                {roleOptions.length === 0 ? (
                  <div className="theme-border rounded-xl border border-dashed py-8 text-center">
                    <Shield size={24} className="theme-text-placeholder mx-auto" />
                    <p className="theme-text-muted mt-2 text-xs">Belum ada data role</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
                    {roleOptions.map((role) => {
                      const Icon = getRoleIcon(role.label);
                      const color = getRoleColor(role.label);
                      const count = users.filter(
                        (user) => user?.peran?.nama === role.value
                      ).length;

                      return (
                        <div
                          key={role.value}
                          className="theme-card theme-border rounded-xl border p-3 text-center transition-all hover:border-[var(--color-primary)] hover:shadow-sm"
                        >
                          <div className="flex justify-center">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${color}`}>
                              <Icon size={15} />
                            </div>
                          </div>
                          <p className="theme-text-secondary mt-1.5 line-clamp-2 text-[10px] font-semibold leading-tight">
                            {role.label}
                          </p>
                          <p className="theme-text-muted mt-0.5 text-[10px]">Role</p>
                          <p className="mt-0.5 text-[10px] font-medium text-[var(--color-primary)]">
                            {count} user di halaman
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              <footer className="theme-border border-t pt-4 text-center sm:pt-5">
                <p className="theme-text-muted text-xs">
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
// SORTABLE HEADER
// =========================================================

function SortableHeader({
  label,
  column,
  sortBy,
  sortDir,
  onSort,
  align = "left",
  className = "",
}) {
  const isActive = sortBy === column;

  return (
    <th
      className={`px-4 py-3 text-${align} text-[10px] font-semibold uppercase tracking-[0.08em] ${className}`}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className={`inline-flex items-center gap-1.5 transition-colors hover:text-[var(--color-primary)] ${
          isActive ? "text-[var(--color-primary)]" : ""
        } ${align === "center" ? "w-full justify-center" : ""}`}
      >
        {label}
        {isActive ? (
          sortDir === "asc" ? (
            <ArrowUp size={11} />
          ) : (
            <ArrowDown size={11} />
          )
        ) : (
          <ArrowUpDown size={11} className="opacity-40" />
        )}
      </button>
    </th>
  );
}

// =========================================================
// STAT CARD
// =========================================================

function StatCard({ label, value, icon: Icon, color }) {
  const colorMap = {
    blue: {
      bg: "bg-[var(--color-info-background)]",
      text: "text-[var(--color-primary)]",
    },
    emerald: {
      bg: "bg-[var(--color-success-background)]",
      text: "text-[var(--color-success)]",
    },
    rose: {
      bg: "bg-[var(--color-danger-background)]",
      text: "text-[var(--color-danger)]",
    },
    indigo: {
      bg: "bg-[var(--color-sidebar-active)]",
      text: "text-[var(--color-sidebar-text-active)]",
    },
  };

  const styles = colorMap[color] || colorMap.blue;

  return (
    <div className="theme-card group rounded-2xl border p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-[0.06em]">
            {label}
          </p>
          <p className="theme-text mt-1 text-2xl font-bold tracking-tight">
            {value}
          </p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.bg} ${styles.text}`}>
          <Icon size={20} strokeWidth={1.8} />
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
    <div className="divide-y divide-[var(--color-border-soft)] overflow-x-auto">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="flex min-w-[1050px] items-center gap-5 px-5 py-4"
        >
          <div className="theme-card-soft h-4 w-5 animate-pulse rounded" />
          <div className="flex flex-1 items-center gap-3">
            <div className="theme-card-soft h-9 w-9 animate-pulse rounded-full" />
            <div className="space-y-2">
              <div className="theme-card-soft h-3 w-40 animate-pulse rounded" />
              <div className="theme-card-soft h-2.5 w-28 animate-pulse rounded" />
            </div>
          </div>
          <div className="w-48 space-y-2">
            <div className="theme-card-soft h-3 w-36 animate-pulse rounded" />
            <div className="theme-card-soft h-2.5 w-24 animate-pulse rounded" />
          </div>
          <div className="theme-card-soft h-7 w-28 animate-pulse rounded-lg" />
          <div className="theme-card-soft h-6 w-16 animate-pulse rounded-full" />
          <div className="theme-card-soft h-4 w-32 animate-pulse rounded" />
          <div className="theme-card-soft h-7 w-28 animate-pulse rounded" />
        </div>
      ))}
    </div>
  );
}