"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

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
} from "../../../services/user.service";

export default function KelolaUserPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);

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
            statusFilter !== "semua" ? statusFilter : undefined,
          role:
            roleFilter !== "semua" ? roleFilter : undefined,
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
              data.length < limit ? page : page + 1,
          });
        }
      } catch (err) {
        console.error("Gagal mengambil user:", err);

        setUsers([]);

        setError(
          err?.message || "Gagal mengambil data pengguna."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, limit, search, statusFilter, roleFilter]
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

  const statistics = useMemo(() => {
    const total = pagination.totalData || users.length;

    const active = users.filter((user) =>
      isActiveStatus(user?.status)
    ).length;

    const inactive = users.filter(
      (user) => !isActiveStatus(user?.status)
    ).length;

    const admin = users.filter((user) =>
      getRoleName(user).toLowerCase().includes("admin")
    ).length;

    return {
      total,
      active,
      inactive,
      admin,
    };
  }, [users, pagination.totalData]);

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
      console.error("Gagal menghapus user:", err);

      setError(err?.message || "Gagal menghapus pengguna.");

      setShowDeleteModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    if (!user?.id) return;

    const currentlyActive = isActiveStatus(user.status);

    const newStatus = currentlyActive ? "nonaktif" : "aktif";

    try {
      setActionLoading(true);
      setError("");

      await updateUserStatus(user.id, newStatus);

      await fetchUsers(true);
    } catch (err) {
      console.error("Gagal mengubah status user:", err);

      setError(
        err?.message || "Gagal mengubah status pengguna."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const openDetailModal = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleEdit = (user) => {
    router.push(
      `/super-admin/kelola-user/edit-user?id=${user.id}`
    );
  };

  const handlePrevious = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (pagination.totalPages && page < pagination.totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const resetFilter = () => {
    setSearch("");
    setStatusFilter("semua");
    setRoleFilter("semua");
    setPage(1);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        role="super-admin"
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />

      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          notifications={[]}
          user={{
            name: "Super Admin",
            email: "admin@smartschool.com",
            avatar: "SA",
          }}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1500px]">
            <section className="relative mb-6 overflow-hidden rounded-3xl bg-[#0D47C9] shadow-lg">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-white/10 blur-2xl" />

                <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />

                <div
                  className="absolute inset-0 opacity-[0.07]"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                  }}
                />
              </div>

              <div className="relative p-6 md:p-8">
                <div className="flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
                  <div className="max-w-3xl">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-50 backdrop-blur-sm">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      MANAJEMEN AKSES
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                      Kelola User
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 md:text-base">
                      Kelola akun, role, akses, dan status pengguna
                      SmartSchool dalam satu dashboard terpusat.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <span className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm">
                        {statistics.total} Pengguna
                      </span>

                      <span className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm">
                        {statistics.active} Aktif
                      </span>

                      <span className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm">
                        {statistics.admin} Administrator
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/super-admin/kelola-user/tambah"
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20 xl:w-auto"
                  >
                    <UserPlus size={18} />
                    Tambah User
                  </Link>
                </div>
              </div>
            </section>

            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-red-800">
                    Terjadi kesalahan
                  </p>

                  <p className="mt-1 text-sm leading-5 text-red-700">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setError("")}
                  className="shrink-0 rounded-lg p-1.5 text-red-400 transition hover:bg-red-100 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Total User"
                value={statistics.total}
                description="Seluruh pengguna"
                icon={Users}
                iconClass="bg-blue-50 text-blue-600"
              />

              <StatCard
                label="User Aktif"
                value={statistics.active}
                description="Akun dapat mengakses sistem"
                icon={UserCheck}
                iconClass="bg-emerald-50 text-emerald-600"
                valueClass="text-emerald-600"
              />

              <StatCard
                label="User Nonaktif"
                value={statistics.inactive}
                description="Akun tidak aktif"
                icon={UserX}
                iconClass="bg-amber-50 text-amber-600"
                valueClass="text-amber-600"
              />

              <StatCard
                label="Administrator"
                value={statistics.admin}
                description="Memiliki akses administrasi"
                icon={ShieldCheck}
                iconClass="bg-indigo-50 text-indigo-600"
                valueClass="text-indigo-600"
              />
            </section>

            <section className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama, email, username..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div className="relative w-full xl:w-48">
                  <Filter className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value)
                    }
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  >
                    <option value="semua">Semua Status</option>
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>

                <div className="relative w-full xl:w-52">
                  <ShieldCheck className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <select
                    value={roleFilter}
                    onChange={(e) =>
                      setRoleFilter(e.target.value)
                    }
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  >
                    <option value="semua">Semua Role</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="admin_sekolah">
                      Admin Sekolah
                    </option>
                    <option value="guru">Guru</option>
                    <option value="siswa">Siswa</option>
                    <option value="yayasan">Yayasan</option>
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>

                <button
                  type="button"
                  onClick={() => fetchUsers(true)}
                  disabled={refreshing}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60 xl:w-auto"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
              </div>

              {(search ||
                statusFilter !== "semua" ||
                roleFilter !== "semua") && (
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                  <span className="text-xs font-medium text-slate-400">
                    Filter aktif:
                  </span>

                  {search && (
                    <FilterChip
                      label={`Pencarian: ${search}`}
                      onRemove={() => setSearch("")}
                    />
                  )}

                  {statusFilter !== "semua" && (
                    <FilterChip
                      label={`Status: ${formatStatus(statusFilter)}`}
                      onRemove={() => setStatusFilter("semua")}
                    />
                  )}

                  {roleFilter !== "semua" && (
                    <FilterChip
                      label={`Role: ${formatRole(roleFilter)}`}
                      onRemove={() => setRoleFilter("semua")}
                    />
                  )}

                  <button
                    type="button"
                    onClick={resetFilter}
                    className="ml-1 text-xs font-semibold text-blue-600 transition hover:text-blue-700"
                  >
                    Reset semua
                  </button>
                </div>
              )}
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Activity className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Daftar Pengguna
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Menampilkan{" "}
                      <span className="font-semibold text-slate-700">
                        {users.length}
                      </span>{" "}
                      dari{" "}
                      <span className="font-semibold text-slate-700">
                        {pagination.totalData || users.length}
                      </span>{" "}
                      pengguna
                    </p>
                  </div>
                </div>

                <span className="self-start rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 sm:self-auto">
                  {pagination.totalData || users.length} pengguna
                </span>
              </div>

              {loading ? (
                <LoadingState />
              ) : users.length === 0 ? (
                <EmptyState search={search} onReset={resetFilter} />
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1100px]">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/80">
                          <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            Pengguna
                          </th>
                          <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            Email
                          </th>
                          <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            Role
                          </th>
                          <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            Sekolah / Yayasan
                          </th>
                          <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            Status
                          </th>
                          <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            Aksi
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {users.map((user) => {
                          const active = isActiveStatus(user?.status);

                          return (
                            <tr
                              key={user.id}
                              className="group transition hover:bg-blue-50/40"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <Avatar user={user} />

                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-slate-900">
                                      {getUserName(user)}
                                    </p>

                                    <p className="mt-1 truncate text-xs text-slate-400">
                                      @{getUsername(user)}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-6 py-4">
                                <span className="truncate text-sm text-slate-600">
                                  {user.email || "-"}
                                </span>
                              </td>

                              <td className="px-6 py-4">
                                <RoleBadge role={getRoleName(user)} />
                              </td>

                              <td className="px-6 py-4">
                                <span className="truncate text-sm text-slate-600">
                                  {getTenantName(user)}
                                </span>
                              </td>

                              <td className="px-6 py-4 text-center">
                                <StatusBadge
                                  active={active}
                                  status={user.status}
                                />
                              </td>

                              <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    title="Lihat detail"
                                    onClick={() =>
                                      openDetailModal(user)
                                    }
                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>

                                  <button
                                    type="button"
                                    title="Edit user"
                                    onClick={() => handleEdit(user)}
                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-amber-50 hover:text-amber-600"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </button>

                                  <button
                                    type="button"
                                    title={
                                      active
                                        ? "Nonaktifkan user"
                                        : "Aktifkan user"
                                    }
                                    onClick={() =>
                                      handleToggleStatus(user)
                                    }
                                    disabled={actionLoading}
                                    className={`rounded-lg p-2 transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                      active
                                        ? "text-slate-400 hover:bg-orange-50 hover:text-orange-600"
                                        : "text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                                    }`}
                                  >
                                    {active ? (
                                      <UserX className="h-4 w-4" />
                                    ) : (
                                      <UserCheck className="h-4 w-4" />
                                    )}
                                  </button>

                                  <button
                                    type="button"
                                    title="Hapus user"
                                    onClick={() =>
                                      openDeleteModal(user)
                                    }
                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
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

                  <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-slate-500">
                      Halaman{" "}
                      <span className="font-semibold text-slate-700">
                        {page}
                      </span>{" "}
                      dari{" "}
                      <span className="font-semibold text-slate-700">
                        {pagination.totalPages || 1}
                      </span>
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePrevious}
                        disabled={page <= 1}
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Sebelumnya
                      </button>

                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={
                          page >= (pagination.totalPages || 1)
                        }
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
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
        </main>
      </div>

      {showDeleteModal && (
        <ModalOverlay
          onClose={() => {
            if (!actionLoading) {
              setShowDeleteModal(false);
            }
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 bg-slate-50/80 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <Trash2 className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Hapus Pengguna
                  </h3>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Konfirmasi penghapusan akun
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={actionLoading}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5">
              <p className="text-sm leading-6 text-slate-600">
                Apakah kamu yakin ingin menghapus pengguna{" "}
                <span className="font-bold text-slate-900">
                  {getUserName(selectedUser)}
                </span>
                ?
              </p>

              <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4">
                <p className="text-xs leading-5 text-red-700">
                  Data pengguna yang sudah dihapus tidak dapat
                  digunakan kembali.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={actionLoading}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={actionLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
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

      {showDetailModal && selectedUser && (
        <ModalOverlay onClose={() => setShowDetailModal(false)}>
          <div className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 bg-slate-50/80 p-5 md:p-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-slate-900">
                    Detail Pengguna
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Informasi lengkap akun pengguna
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[calc(92vh-140px)] overflow-y-auto p-5 md:p-6">
              <div className="flex flex-col gap-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-5 sm:flex-row sm:items-center">
                <Avatar user={selectedUser} large />

                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <h3 className="truncate text-lg font-bold text-slate-900">
                    {getUserName(selectedUser)}
                  </h3>

                  <p className="mt-1 truncate text-sm text-slate-500">
                    {selectedUser.email || "-"}
                  </p>

                  <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                    <RoleBadge role={getRoleName(selectedUser)} />

                    <StatusBadge
                      active={isActiveStatus(selectedUser.status)}
                      status={selectedUser.status}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-5 w-1 rounded-full bg-blue-600" />

                  <h4 className="text-sm font-bold text-slate-900">
                    Informasi Akun
                  </h4>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DetailItem
                    label="Nama Lengkap"
                    value={getUserName(selectedUser)}
                  />
                  <DetailItem
                    label="Username"
                    value={getUsername(selectedUser)}
                  />
                  <DetailItem
                    label="Email"
                    value={selectedUser.email}
                  />
                  <DetailItem
                    label="Role"
                    value={getRoleName(selectedUser)}
                  />
                  <DetailItem
                    label="NIP"
                    value={selectedUser.nip}
                  />
                  <DetailItem
                    label="NISN"
                    value={selectedUser.nisn}
                  />
                  <DetailItem
                    label="NIPD"
                    value={selectedUser.nipd}
                  />
                  <DetailItem
                    label="Jenis Kelamin"
                    value={selectedUser.jenisKelamin}
                  />
                  <DetailItem
                    label="Jabatan"
                    value={selectedUser.jabatan}
                  />
                  <DetailItem
                    label="Golongan"
                    value={selectedUser.golongan}
                  />
                  <DetailItem
                    label="Sekolah"
                    value={
                      selectedUser.sekolah?.nama ||
                      selectedUser.sekolahId
                    }
                  />
                  <DetailItem
                    label="Yayasan"
                    value={
                      selectedUser.yayasan?.nama ||
                      selectedUser.yayasanId
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-200 bg-slate-50/70 p-4 md:p-5">
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
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

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  iconClass,
  valueClass = "text-slate-900",
}) {
  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>

          <p className={`mt-2 text-3xl font-bold tracking-tight ${valueClass}`}>
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">{description}</p>
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

function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700">
      {label}

      <button
        type="button"
        onClick={onRemove}
        className="rounded p-0.5 transition hover:bg-blue-100"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

function Avatar({ user, large = false }) {
  const image = user?.avatar || user?.fotoProfil || null;

  const name = getUserName(user);

  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-50 font-bold text-blue-700 ${
        large ? "h-16 w-16 text-xl" : "h-10 w-10 text-sm"
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

function RoleBadge({ role }) {
  const normalized = String(role || "")
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  let className = "border-slate-200 bg-slate-100 text-slate-600";

  if (normalized.includes("super_admin")) {
    className = "border-purple-200 bg-purple-50 text-purple-700";
  } else if (normalized.includes("admin_sekolah")) {
    className = "border-blue-200 bg-blue-50 text-blue-700";
  } else if (normalized.includes("guru")) {
    className = "border-emerald-200 bg-emerald-50 text-emerald-700";
  } else if (normalized.includes("siswa")) {
    className = "border-orange-200 bg-orange-50 text-orange-700";
  } else if (normalized.includes("yayasan")) {
    className = "border-indigo-200 bg-indigo-50 text-indigo-700";
  }

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${className}`}
    >
      {formatRole(role)}
    </span>
  );
}

function StatusBadge({ active, status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-slate-100 text-slate-600"
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

function DetailItem({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-100 hover:bg-blue-50/20">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1.5 break-words text-sm font-semibold text-slate-800">
        {value || "-"}
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center px-6">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
        <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
      </div>

      <p className="text-sm font-semibold text-slate-700">
        Memuat data pengguna...
      </p>

      <p className="mt-1 text-xs text-slate-400">
        Mengambil data dari server SmartSchool.
      </p>
    </div>
  );
}

function EmptyState({ search, onReset }) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <Users className="h-6 w-6" />
      </div>

      <h3 className="text-base font-bold text-slate-800">
        {search ? "Pengguna tidak ditemukan" : "Belum ada pengguna"}
      </h3>

      <p className="mt-1 max-w-md text-sm text-slate-500">
        {search
          ? "Coba gunakan kata kunci atau filter yang berbeda."
          : "Belum ada data pengguna yang tersedia."}
      </p>

      {search && (
        <button
          type="button"
          onClick={onReset}
          className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Reset Filter
        </button>
      )}
    </div>
  );
}

function ModalOverlay({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {children}
    </div>
  );
}

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

  return user.namaPengguna || user.username || user.email || "-";
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

  const normalized = String(status).toLowerCase().trim();

  return ["aktif", "active", "true", "1", "enabled"].includes(
    normalized
  );
}

function formatStatus(status) {
  if (!status) return "Tidak diketahui";

  const normalized = String(status).toLowerCase().trim();

  if (["aktif", "active", "true", "1"].includes(normalized)) {
    return "Aktif";
  }

  if (
    ["nonaktif", "inactive", "false", "0", "disabled"].includes(
      normalized
    )
  ) {
    return "Nonaktif";
  }

  return String(status)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatRole(role) {
  if (!role || role === "-") {
    return "Belum diatur";
  }

  return String(role)
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}