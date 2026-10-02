"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  Users,
  UserPlus,
  Search,
  Filter,
  Pencil,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  AlertCircle,
  X,
  UserCheck,
  UserX,
  Activity,
} from "lucide-react";

import {
  getUsers,
  deleteUser,
  updateUserStatus,
    resetUserPassword,
} from "@/services/user.service";

// ============================================================
// THEME HELPERS
// Mengikuti global theme SmartSchool
// ============================================================

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

// ============================================================
// PAGE
// ============================================================

export default function KelolaUserPage() {
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [roleFilter, setRoleFilter] = useState("semua");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalData: 0,
    totalPages: 1,
  });

  const [selectedUser, setSelectedUser] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);

  // ============================================================
  // FETCH USERS
  // ============================================================

  const fetchUsers = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await getUsers({
          page,
          limit,
          search: search.trim(),
          status:
            statusFilter !== "semua"
              ? statusFilter
              : undefined,
          role:
            roleFilter !== "semua"
              ? roleFilter
              : undefined,
        });

        const data = Array.isArray(response?.data)
          ? response.data
          : [];

        setUsers(data);

        if (response?.pagination) {
          setPagination(response.pagination);
        } else {
          setPagination({
            page,
            limit,
            totalData: data.length,
            totalPages:
              data.length < limit
                ? page
                : page + 1,
          });
        }
      } catch (err) {
        console.error("Gagal mengambil user:", err);

        setUsers([]);

        setError(
          err?.message ||
            "Gagal mengambil data pengguna."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      page,
      limit,
      search,
      statusFilter,
      roleFilter,
    ]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchUsers]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, roleFilter]);

  // ============================================================
  // STATISTICS
  // ============================================================

  const statistics = useMemo(() => {
    const total =
      pagination.totalData || users.length;

    const active = users.filter((user) =>
      isActiveStatus(user?.status)
    ).length;

    const inactive = users.filter(
      (user) =>
        !isActiveStatus(user?.status)
    ).length;

    const admin = users.filter((user) =>
      getRoleName(user)
        .toLowerCase()
        .includes("admin")
    ).length;

    return {
      total,
      active,
      inactive,
      admin,
    };
  }, [users, pagination.totalData]);

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async () => {
    if (!selectedUser?.id) return;

    try {
      setActionLoading(true);
      setError("");

      await deleteUser(selectedUser.id);

      setShowDeleteModal(false);
      setSelectedUser(null);

      await fetchUsers(true);
    } catch (err) {
      console.error(
        "Gagal menghapus user:",
        err
      );

      setError(
        err?.message ||
          "Gagal menghapus pengguna."
      );

      setShowDeleteModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================
  // TOGGLE STATUS
  // ============================================================

  const handleToggleStatus = async (user) => {
    if (!user?.id) return;

    const currentlyActive =
      isActiveStatus(user.status);

    const newStatus = currentlyActive
      ? "nonaktif"
      : "aktif";

    try {
      setActionLoading(true);
      setError("");

      await updateUserStatus(
        user.id,
        newStatus
      );

      await fetchUsers(true);
    } catch (err) {
      console.error(
        "Gagal mengubah status user:",
        err
      );

      setError(
        err?.message ||
          "Gagal mengubah status pengguna."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================
  // MODALS
  // ============================================================

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const openDetailModal = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  // ============================================================
  // EDIT
  // ============================================================

  const handleEdit = (user) => {
    router.push(
      `/super-admin/kelola-user/edit-user?id=${user.id}`
    );
  };

  // ============================================================
  // PAGINATION
  // ============================================================

  const handlePrevious = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (
      pagination.totalPages &&
      page < pagination.totalPages
    ) {
      setPage((prev) => prev + 1);
    }
  };

  // ============================================================
  // RESET FILTER
  // ============================================================

  const resetFilter = () => {
    setSearch("");
    setStatusFilter("semua");
    setRoleFilter("semua");
    setPage(1);
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">

        {/* ================================================== */}
        {/* HERO */}
        {/* ================================================== */}

        <section
          className={`relative mb-6 overflow-hidden rounded-3xl ${themePrimaryGradient} ${themePrimaryShadow}`}
        >
          <div className="absolute inset-0 overflow-hidden">

            <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-[color-mix(in_srgb,var(--color-card)_12%,transparent)] blur-2xl" />

            <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-[color-mix(in_srgb,var(--color-card)_9%,transparent)] blur-3xl" />

            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  "linear-gradient(color-mix(in srgb, var(--color-card) 80%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--color-card) 80%, transparent) 1px, transparent 1px)",
                backgroundSize:
                  "32px 32px",
              }}
            />
          </div>

          <div className="relative p-6 md:p-8">
            <div className="flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">

              <div className="max-w-3xl">

                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--color-card)_18%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_10%,transparent)] px-3 py-1.5 text-xs font-semibold text-[var(--color-card)] backdrop-blur-sm">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  MANAJEMEN AKSES
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-[var(--color-card)] md:text-4xl">
                  Kelola User
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-[color-mix(in_srgb,var(--color-card)_78%,transparent)] md:text-base">
                  Kelola akun, role, akses, dan
                  status pengguna SmartSchool
                  dalam satu dashboard
                  terpusat.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">

                  <span className="rounded-lg border border-[color-mix(in_srgb,var(--color-card)_18%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_10%,transparent)] px-3 py-2 text-xs font-medium text-[var(--color-card)] backdrop-blur-sm">
                    {statistics.total} Pengguna
                  </span>

                  <span className="rounded-lg border border-[color-mix(in_srgb,var(--color-card)_18%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_10%,transparent)] px-3 py-2 text-xs font-medium text-[var(--color-card)] backdrop-blur-sm">
                    {statistics.active} Aktif
                  </span>

                  <span className="rounded-lg border border-[color-mix(in_srgb,var(--color-card)_18%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_10%,transparent)] px-3 py-2 text-xs font-medium text-[var(--color-card)] backdrop-blur-sm">
                    {statistics.admin} Administrator
                  </span>

                </div>
              </div>

              <Link
                href="/super-admin/kelola-user/tambah"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[color-mix(in_srgb,var(--color-card)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_10%,transparent)] px-5 text-sm font-semibold text-[var(--color-card)] backdrop-blur-md transition hover:bg-[color-mix(in_srgb,var(--color-card)_18%,transparent)] xl:w-auto"
              >
                <UserPlus size={18} />
                Tambah User
              </Link>

            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* ERROR */}
        {/* ================================================== */}

        {error && (
          <div
            className={`mb-6 flex items-start gap-3 rounded-2xl border ${themeDangerBorder} ${themeDangerSurface} p-4`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${themeNeutralSurface} ${themeNeutralBorder}`}
            >
              <AlertCircle
                className={`h-5 w-5 ${themePrimaryText}`}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-semibold theme-text">
                Terjadi kesalahan
              </p>

              <p className="mt-1 text-sm leading-5 theme-text-secondary">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className={`shrink-0 rounded-lg p-1.5 theme-text-muted transition ${themeNeutralHover} hover:text-[var(--color-primary)]`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ================================================== */}
        {/* STATISTICS */}
        {/* ================================================== */}

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            label="Total User"
            value={statistics.total}
            description="Seluruh pengguna"
            icon={Users}
            iconClass={`${themePrimarySoft} ${themePrimaryText}`}
            valueClass="theme-text"
          />

          <StatCard
            label="User Aktif"
            value={statistics.active}
            description="Akun dapat mengakses sistem"
            icon={UserCheck}
            iconClass={`${themeSuccessSurface} text-[var(--color-success)]`}
            valueClass="text-[var(--color-success)]"
          />

          <StatCard
            label="User Nonaktif"
            value={statistics.inactive}
            description="Akun tidak aktif"
            icon={UserX}
            iconClass={`${themeWarningSurface} text-[var(--color-warning)]`}
            valueClass="text-[var(--color-warning)]"
          />

          <StatCard
            label="Administrator"
            value={statistics.admin}
            description="Memiliki akses administrasi"
            icon={ShieldCheck}
            iconClass={`${themeInfoSurface} text-[var(--color-info)]`}
            valueClass="text-[var(--color-info)]"
          />

        </section>

        {/* ================================================== */}
        {/* FILTER */}
        {/* ================================================== */}

        <section
          className={`mb-6 rounded-2xl border theme-border theme-card p-5 ${themeCardShadow}`}
        >
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center">

            {/* Search */}

            <div className="relative min-w-0 flex-1">

              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 theme-text-muted" />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Cari nama, email, username..."
                className={`theme-input h-11 w-full rounded-xl pl-10 pr-4 text-sm outline-none transition ${themeFocus}`}
              />

            </div>

            {/* Status */}

            <div className="relative w-full xl:w-48">

              <Filter className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 theme-text-muted" />

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className={`theme-input h-11 w-full appearance-none rounded-xl pl-10 pr-10 text-sm font-medium outline-none transition ${themeFocus}`}
              >
                <option value="semua">
                  Semua Status
                </option>
                <option value="aktif">
                  Aktif
                </option>
                <option value="nonaktif">
                  Nonaktif
                </option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 theme-text-muted" />

            </div>

            {/* Role */}

            <div className="relative w-full xl:w-52">

              <ShieldCheck className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 theme-text-muted" />

              <select
                value={roleFilter}
                onChange={(e) =>
                  setRoleFilter(e.target.value)
                }
                className={`theme-input h-11 w-full appearance-none rounded-xl pl-10 pr-10 text-sm font-medium outline-none transition ${themeFocus}`}
              >
                <option value="semua">
                  Semua Role
                </option>

                <option value="super_admin">
                  Super Admin
                </option>

                <option value="admin_sekolah">
                  Admin Sekolah
                </option>

                <option value="guru">
                  Guru
                </option>

                <option value="siswa">
                  Siswa
                </option>

                <option value="yayasan">
                  Yayasan
                </option>
              </select>

              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 theme-text-muted" />

            </div>

            {/* Refresh */}

            <button
              type="button"
              onClick={() =>
                fetchUsers(true)
              }
              disabled={refreshing}
              className={`inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border theme-border theme-card px-4 text-sm font-semibold theme-text-secondary transition hover:border-[color-mix(in_srgb,var(--color-primary)_24%,transparent)] hover:text-[var(--color-primary)] ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-60 xl:w-auto`}
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />
              Refresh
            </button>

          </div>

          {/* Active filters */}

          {(search ||
            statusFilter !== "semua" ||
            roleFilter !== "semua") && (
            <div
              className={`mt-4 flex flex-wrap items-center gap-2 border-t ${themeDivider} pt-4`}
            >
              <span className="text-xs font-medium theme-text-muted">
                Filter aktif:
              </span>

              {search && (
                <FilterChip
                  label={`Pencarian: ${search}`}
                  onRemove={() =>
                    setSearch("")
                  }
                />
              )}

              {statusFilter !== "semua" && (
                <FilterChip
                  label={`Status: ${formatStatus(
                    statusFilter
                  )}`}
                  onRemove={() =>
                    setStatusFilter(
                      "semua"
                    )
                  }
                />
              )}

              {roleFilter !== "semua" && (
                <FilterChip
                  label={`Role: ${formatRole(
                    roleFilter
                  )}`}
                  onRemove={() =>
                    setRoleFilter(
                      "semua"
                    )
                  }
                />
              )}

              <button
                type="button"
                onClick={resetFilter}
                className="ml-1 text-xs font-semibold text-[var(--color-primary)] transition hover:opacity-75"
              >
                Reset semua
              </button>
            </div>
          )}
        </section>

        {/* ================================================== */}
        {/* TABLE */}
        {/* ================================================== */}

        <section
          className={`overflow-hidden rounded-2xl border theme-border theme-card ${themeCardShadow}`}
        >

          {/* Table Header */}

          <div
            className={`flex flex-col gap-3 border-b ${themeDivider} px-6 py-5 sm:flex-row sm:items-center sm:justify-between`}
          >

            <div className="flex items-center gap-3">

              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
              >
                <Activity className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-bold theme-text">
                  Daftar Pengguna
                </h2>

                <p className="mt-0.5 text-xs theme-text-muted">
                  Menampilkan{" "}
                  <span className="font-semibold theme-text-secondary">
                    {users.length}
                  </span>{" "}
                  dari{" "}
                  <span className="font-semibold theme-text-secondary">
                    {pagination.totalData ||
                      users.length}
                  </span>{" "}
                  pengguna
                </p>
              </div>

            </div>

            <span
              className={`self-start rounded-lg ${themeNeutralSurface} px-3 py-1.5 text-xs font-semibold theme-text-secondary sm:self-auto`}
            >
              {pagination.totalData ||
                users.length}{" "}
              pengguna
            </span>

          </div>

          {/* Loading */}

          {loading ? (
            <LoadingState />
          ) : users.length === 0 ? (
            <EmptyState
              search={search}
              onReset={resetFilter}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">

                  <thead>
                    <tr
                      className={`border-b ${themeDivider} ${themeNeutralSurface}`}
                    >
                      <TableHeader>
                        Pengguna
                      </TableHeader>

                      <TableHeader>
                        Email
                      </TableHeader>

                      <TableHeader>
                        Role
                      </TableHeader>

                      <TableHeader>
                        Sekolah / Yayasan
                      </TableHeader>

                      <TableHeader center>
                        Status
                      </TableHeader>

                      <TableHeader right>
                        Aksi
                      </TableHeader>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user) => {
                      const active =
                        isActiveStatus(
                          user?.status
                        );

                      return (
                        <tr
                          key={user.id}
                          className={`group border-b ${themeDivider} transition ${themeNeutralHover}`}
                        >

                          {/* User */}

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">

                              <Avatar user={user} />

                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold theme-text">
                                  {getUserName(
                                    user
                                  )}
                                </p>

                                <p className="mt-1 truncate text-xs theme-text-muted">
                                  @{getUsername(
                                    user
                                  )}
                                </p>
                              </div>

                            </div>
                          </td>

                          {/* Email */}

                          <td className="px-6 py-4">
                            <span className="truncate text-sm theme-text-secondary">
                              {user.email ||
                                "-"}
                            </span>
                          </td>

                          {/* Role */}

                          <td className="px-6 py-4">
                            <RoleBadge
                              role={getRoleName(
                                user
                              )}
                            />
                          </td>

                          {/* Tenant */}

                          <td className="px-6 py-4">
                            <span className="truncate text-sm theme-text-secondary">
                              {getTenantName(
                                user
                              )}
                            </span>
                          </td>

                          {/* Status */}

                          <td className="px-6 py-4 text-center">
                            <StatusBadge
                              active={active}
                              status={
                                user.status
                              }
                            />
                          </td>

                          {/* Actions */}

                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1">

                              {/* Detail */}

                              <button
                                type="button"
                                title="Lihat detail"
                                onClick={() =>
                                  openDetailModal(
                                    user
                                  )
                                }
                                className={`rounded-lg p-2 theme-text-muted transition ${themeNeutralHover} hover:text-[var(--color-primary)]`}
                              >
                                <Eye className="h-4 w-4" />
                              </button>

                              {/* Edit */}

                              <button
                                type="button"
                                title="Edit user"
                                onClick={() =>
                                  handleEdit(
                                    user
                                  )
                                }
                                className={`rounded-lg p-2 theme-text-muted transition ${themeNeutralHover} hover:text-[var(--color-warning)]`}
                              >
                                <Pencil className="h-4 w-4" />
                              </button>

                              {/* Toggle */}

                              <button
                                type="button"
                                title={
                                  active
                                    ? "Nonaktifkan user"
                                    : "Aktifkan user"
                                }
                                onClick={() =>
                                  handleToggleStatus(
                                    user
                                  )
                                }
                                disabled={
                                  actionLoading
                                }
                                className={`rounded-lg p-2 theme-text-muted transition ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-50 ${
                                  active
                                    ? "hover:text-[var(--color-warning)]"
                                    : "hover:text-[var(--color-success)]"
                                }`}
                              >
                                {active ? (
                                  <UserX className="h-4 w-4" />
                                ) : (
                                  <UserCheck className="h-4 w-4" />
                                )}
                              </button>

                              {/* Delete */}

                              <button
                                type="button"
                                title="Hapus user"
                                onClick={() =>
                                  openDeleteModal(
                                    user
                                  )
                                }
                                className={`rounded-lg p-2 theme-text-muted transition ${themeNeutralHover} hover:text-[var(--color-text)]`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>

                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>

                </table>
              </div>

              {/* Pagination */}

              <div
                className={`flex flex-col gap-3 border-t ${themeDivider} ${themeNeutralSurface} px-6 py-4 sm:flex-row sm:items-center sm:justify-between`}
              >

                <p className="text-xs theme-text-muted">
                  Halaman{" "}
                  <span className="font-semibold theme-text-secondary">
                    {page}
                  </span>{" "}
                  dari{" "}
                  <span className="font-semibold theme-text-secondary">
                    {pagination.totalPages ||
                      1}
                  </span>
                </p>

                <div className="flex items-center gap-2">

                  <button
                    type="button"
                    onClick={
                      handlePrevious
                    }
                    disabled={page <= 1}
                    className={`inline-flex h-9 items-center gap-1 rounded-lg border theme-border theme-card px-3 text-sm font-medium theme-text-secondary transition hover:border-[color-mix(in_srgb,var(--color-primary)_24%,transparent)] hover:text-[var(--color-primary)] ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Sebelumnya
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={
                      page >=
                      (pagination.totalPages ||
                        1)
                    }
                    className={`inline-flex h-9 items-center gap-1 rounded-lg border theme-border theme-card px-3 text-sm font-medium theme-text-secondary transition hover:border-[color-mix(in_srgb,var(--color-primary)_24%,transparent)] hover:text-[var(--color-primary)] ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    Berikutnya
                    <ChevronRight className="h-4 w-4" />
                  </button>

                </div>
              </div>
            </>
          )}

        </section>
      </div>

      {/* ==================================================== */}
      {/* DELETE MODAL */}
      {/* ==================================================== */}

      {showDeleteModal && (
        <ModalOverlay
          onClose={() => {
            if (!actionLoading) {
              setShowDeleteModal(false);
            }
          }}
        >
          <div
            className={`w-full max-w-md overflow-hidden rounded-3xl theme-card ${themeCardShadow}`}
          >

            <div
              className={`flex items-start justify-between border-b ${themeDivider} ${themeNeutralSurface} p-5`}
            >
              <div className="flex items-center gap-3">

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${themeDangerSurface} ${themeDangerBorder} border theme-text`}
                >
                  <Trash2 className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-base font-bold theme-text">
                    Hapus Pengguna
                  </h3>

                  <p className="mt-0.5 text-xs theme-text-muted">
                    Konfirmasi penghapusan akun
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowDeleteModal(false)
                }
                disabled={actionLoading}
                className={`flex h-9 w-9 items-center justify-center rounded-xl theme-text-muted transition ${themeNeutralHover} hover:text-[var(--color-primary)]`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5">

              <p className="text-sm leading-6 theme-text-secondary">
                Apakah kamu yakin ingin
                menghapus pengguna{" "}
                <span className="font-bold theme-text">
                  {getUserName(
                    selectedUser
                  )}
                </span>
                ?
              </p>

              <div
                className={`mt-4 rounded-xl border ${themeDangerBorder} ${themeDangerSurface} p-4`}
              >
                <p className="text-xs leading-5 theme-text-secondary">
                  Data pengguna yang
                  sudah dihapus tidak
                  dapat digunakan
                  kembali.
                </p>
              </div>

            </div>

            <div
              className={`flex flex-col-reverse gap-2 border-t ${themeDivider} ${themeNeutralSurface} p-4 sm:flex-row sm:justify-end`}
            >

              <button
                type="button"
                onClick={() =>
                  setShowDeleteModal(false)
                }
                disabled={actionLoading}
                className={`rounded-xl border theme-border theme-card px-5 py-2.5 text-sm font-semibold theme-text-secondary transition ${themeNeutralHover} disabled:opacity-50`}
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={actionLoading}
                className={`inline-flex items-center justify-center gap-2 rounded-xl ${themeDangerSurface} border ${themeDangerBorder} px-5 py-2.5 text-sm font-bold theme-text transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {actionLoading && (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                )}

                Hapus Pengguna
              </button>

            </div>
          </div>
        </ModalOverlay>
      )}

      {/* ==================================================== */}
      {/* DETAIL MODAL */}
      {/* ==================================================== */}

      {showDetailModal &&
        selectedUser && (
          <ModalOverlay
            onClose={() =>
              setShowDetailModal(false)
            }
          >
            <div
              className={`max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-3xl theme-card ${themeCardShadow}`}
            >

              {/* Modal Header */}

              <div
                className={`flex items-start justify-between border-b ${themeDivider} ${themeNeutralSurface} p-5 md:p-6`}
              >

                <div className="flex min-w-0 items-center gap-3">

                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
                  >
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">

                    <h2 className="text-lg font-bold theme-text">
                      Detail Pengguna
                    </h2>

                    <p className="mt-0.5 text-xs theme-text-muted">
                      Informasi lengkap
                      akun pengguna
                    </p>

                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowDetailModal(
                      false
                    )
                  }
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl theme-text-muted transition ${themeNeutralHover} hover:text-[var(--color-primary)]`}
                >
                  <X className="h-5 w-5" />
                </button>

              </div>

              {/* Modal Content */}

              <div className="max-h-[calc(92vh-140px)] overflow-y-auto p-5 md:p-6">

                {/* User summary */}

                <div
                  className={`flex flex-col gap-4 rounded-2xl border ${themeInfoBorder} ${themeInfoSurface} p-5 sm:flex-row sm:items-center`}
                >

                  <Avatar
                    user={selectedUser}
                    large
                  />

                  <div className="min-w-0 flex-1 text-center sm:text-left">

                    <h3 className="truncate text-lg font-bold theme-text">
                      {getUserName(
                        selectedUser
                      )}
                    </h3>

                    <p className="mt-1 truncate text-sm theme-text-secondary">
                      {selectedUser.email ||
                        "-"}
                    </p>

                    <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">

                      <RoleBadge
                        role={getRoleName(
                          selectedUser
                        )}
                      />

                      <StatusBadge
                        active={isActiveStatus(
                          selectedUser.status
                        )}
                        status={
                          selectedUser.status
                        }
                      />

                    </div>
                  </div>

                </div>

                {/* Account information */}

                <div
                  className={`mt-4 rounded-2xl border theme-border theme-card p-5 ${themeSmallShadow}`}
                >

                  <div className="mb-4 flex items-center gap-2">

                    <div
                      className={`h-5 w-1 rounded-full bg-[var(--color-primary)]`}
                    />

                    <h4 className="text-sm font-bold theme-text">
                      Informasi Akun
                    </h4>

                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                    <DetailItem
                      label="Nama Lengkap"
                      value={getUserName(
                        selectedUser
                      )}
                    />

                    <DetailItem
                      label="Username"
                      value={getUsername(
                        selectedUser
                      )}
                    />

                    <DetailItem
                      label="Email"
                      value={
                        selectedUser.email
                      }
                    />

                    <DetailItem
                      label="Role"
                      value={getRoleName(
                        selectedUser
                      )}
                    />

                    <DetailItem
                      label="NIP"
                      value={
                        selectedUser.nip
                      }
                    />

                    <DetailItem
                      label="NISN"
                      value={
                        selectedUser.nisn
                      }
                    />

                    <DetailItem
                      label="NIPD"
                      value={
                        selectedUser.nipd
                      }
                    />

                    <DetailItem
                      label="Jenis Kelamin"
                      value={
                        selectedUser.jenisKelamin
                      }
                    />

                    <DetailItem
                      label="Jabatan"
                      value={
                        selectedUser.jabatan
                      }
                    />

                    <DetailItem
                      label="Golongan"
                      value={
                        selectedUser.golongan
                      }
                    />

                    <DetailItem
                      label="Sekolah"
                      value={
                        selectedUser.sekolah
                          ?.nama ||
                        selectedUser.sekolahId
                      }
                    />

                    <DetailItem
                      label="Yayasan"
                      value={
                        selectedUser.yayasan
                          ?.nama ||
                        selectedUser.yayasanId
                      }
                    />

                  </div>
                </div>
              </div>

              {/* Modal Footer */}

              <div
                className={`flex justify-end border-t ${themeDivider} ${themeNeutralSurface} p-4 md:p-5`}
              >
                <button
                  type="button"
                  onClick={() =>
                    setShowDetailModal(
                      false
                    )
                  }
                  className={`rounded-xl border ${themePrimarySoftBorder} ${themePrimarySoft} px-5 py-2.5 text-sm font-bold ${themePrimaryText} transition hover:opacity-80`}
                >
                  Tutup
                </button>
              </div>

            </div>
          </ModalOverlay>
        )}
    </div>
  );
}

// ============================================================
// TABLE HEADER
// ============================================================

function TableHeader({
  children,
  center = false,
  right = false,
}) {
  return (
    <th
      className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider theme-text-muted ${
        center
          ? "text-center"
          : right
            ? "text-right"
            : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  iconClass,
  valueClass = "theme-text",
}) {
  return (
    <div
      className={`group rounded-2xl border theme-border theme-card p-5 ${themeCardShadow} transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_color-mix(in_srgb,var(--color-text)_8%,transparent)]`}
    >
      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0">

          <p className="text-sm font-medium theme-text-secondary">
            {label}
          </p>

          <p
            className={`mt-2 text-3xl font-bold tracking-tight ${valueClass}`}
          >
            {value}
          </p>

          <p className="mt-1 text-xs theme-text-muted">
            {description}
          </p>

        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>

      </div>
    </div>
  );
}

// ============================================================
// FILTER CHIP
// ============================================================

function FilterChip({
  label,
  onRemove,
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border ${themePrimarySoftBorder} ${themePrimarySoft} px-2.5 py-1.5 text-xs font-medium ${themePrimaryText}`}
    >
      {label}

      <button
        type="button"
        onClick={onRemove}
        className="rounded p-0.5 transition hover:bg-[color-mix(in_srgb,var(--color-primary)_16%,transparent)]"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

// ============================================================
// AVATAR
// ============================================================

function Avatar({
  user,
  large = false,
}) {
  const image =
    user?.avatar ||
    user?.fotoProfil ||
    null;

  const name = getUserName(user);

  const initial =
    name?.trim()?.charAt(0)?.toUpperCase() ||
    "U";

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl ${themePrimarySoft} ${themePrimaryText} font-bold ${
        large
          ? "h-16 w-16 text-xl"
          : "h-10 w-10 text-sm"
      }`}
    >
      {image ? (
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover"
        />
      ) : (
        initial
      )}
    </div>
  );
}

// ============================================================
// ROLE BADGE
// ============================================================

function RoleBadge({ role }) {
  const normalized = String(role || "")
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  let className = `${themeNeutralBorder} ${themeNeutralSurface} theme-text-secondary`;

  if (normalized.includes("super_admin")) {
    className = `${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText}`;
  } else if (
    normalized.includes("admin_sekolah")
  ) {
    className = `${themeInfoBorder} ${themeInfoSurface} text-[var(--color-info)]`;
  } else if (
    normalized.includes("guru")
  ) {
    className = `${themeSuccessBorder} ${themeSuccessSurface} text-[var(--color-success)]`;
  } else if (
    normalized.includes("siswa")
  ) {
    className = `${themeWarningBorder} ${themeWarningSurface} text-[var(--color-warning)]`;
  } else if (
    normalized.includes("yayasan")
  ) {
    className = `${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText}`;
  }

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${className}`}
    >
      {formatRole(role)}
    </span>
  );
}

// ============================================================
// STATUS BADGE
// ============================================================

function StatusBadge({
  active,
  status,
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${
        active
          ? `${themeSuccessBorder} ${themeSuccessSurface} text-[var(--color-success)]`
          : `${themeNeutralBorder} ${themeNeutralSurface} theme-text-secondary`
      }`}
    >
      {active ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : (
        <XCircle className="h-3.5 w-3.5" />
      )}

      {formatStatus(status)}
    </span>
  );
}

// ============================================================
// DETAIL ITEM
// ============================================================

function DetailItem({
  label,
  value,
}) {
  return (
    <div
      className={`rounded-xl border theme-border theme-card p-4 transition hover:border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-primary)_3%,transparent)]`}
    >
      <p className="text-[11px] font-medium uppercase tracking-wide theme-text-muted">
        {label}
      </p>

      <p className="mt-1.5 break-words text-sm font-semibold theme-text">
        {value || "-"}
      </p>
    </div>
  );
}

// ============================================================
// LOADING
// ============================================================

function LoadingState() {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center px-6">

      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
      >
        <RefreshCw className="h-5 w-5 animate-spin" />
      </div>

      <p className="text-sm font-semibold theme-text">
        Memuat data pengguna...
      </p>

      <p className="mt-1 text-xs theme-text-muted">
        Mengambil data dari server
        SmartSchool.
      </p>

    </div>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================

function EmptyState({
  search,
  onReset,
}) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">

      <div
        className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${themeNeutralSurface} theme-text-muted`}
      >
        <Users className="h-6 w-6" />
      </div>

      <h3 className="text-base font-bold theme-text">
        {search
          ? "Pengguna tidak ditemukan"
          : "Belum ada pengguna"}
      </h3>

      <p className="mt-1 max-w-md text-sm theme-text-secondary">
        {search
          ? "Coba gunakan kata kunci atau filter yang berbeda."
          : "Belum ada data pengguna yang tersedia."}
      </p>

      {search && (
        <button
          type="button"
          onClick={onReset}
          className={`mt-4 rounded-xl ${themePrimarySoft} ${themePrimarySoftBorder} border px-4 py-2.5 text-sm font-semibold ${themePrimaryText} transition hover:opacity-80`}
        >
          Reset Filter
        </button>
      )}

    </div>
  );
}

// ============================================================
// MODAL OVERLAY
// ============================================================

function ModalOverlay({
  children,
  onClose,
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[color-mix(in_srgb,var(--color-text)_55%,transparent)] p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (
          e.target ===
          e.currentTarget
        ) {
          onClose();
        }
      }}
    >
      {children}
    </div>
  );
}

// ============================================================
// USER HELPERS
// ============================================================

function getUserName(user) {
  if (!user) return "-";

  return (
    user.namaLengkap ||
    user.nama ||
    user.namaPengguna ||
    user.username ||
    user.email ||
    "Pengguna"
  );
}

function getUsername(user) {
  if (!user) return "-";

  return (
    user.namaPengguna ||
    user.username ||
    user.email ||
    "-"
  );
}

function getRoleName(user) {
  if (!user) return "-";

  return (
    user.peran?.namaTampilan ||
    user.peran?.nama ||
    user.role ||
    user.namaPeran ||
    user.peranNama ||
    "-"
  );
}

function getTenantName(user) {
  if (!user) return "-";

  return (
    user.sekolah?.nama ||
    user.yayasan?.nama ||
    user.namaSekolah ||
    user.namaYayasan ||
    user.sekolahId ||
    user.yayasanId ||
    "-"
  );
}

function isActiveStatus(status) {
  if (!status) return false;

  const normalized = String(status)
    .toLowerCase()
    .trim();

  return [
    "aktif",
    "active",
    "true",
    "1",
    "enabled",
  ].includes(normalized);
}

function formatStatus(status) {
  if (!status) {
    return "Tidak diketahui";
  }

  const normalized = String(status)
    .toLowerCase()
    .trim();

  if (
    [
      "aktif",
      "active",
      "true",
      "1",
    ].includes(normalized)
  ) {
    return "Aktif";
  }

  if (
    [
      "nonaktif",
      "inactive",
      "false",
      "0",
      "disabled",
    ].includes(normalized)
  ) {
    return "Nonaktif";
  }

  return String(status)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

function formatRole(role) {
  if (!role || role === "-") {
    return "Belum diatur";
  }

  return String(role)
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}