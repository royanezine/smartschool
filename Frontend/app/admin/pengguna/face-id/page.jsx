"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  UserRound,
  ScanFace,
  X,
  ShieldCheck,
  Mail,
  Phone,
  CalendarDays,
  Fingerprint,
  AlertCircle,
  Users,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Loader2,
} from "lucide-react";

import { apiFetch } from "../../../../lib/api";

/* =========================================================
   ROLE CONFIG
========================================================= */

const roleConfig = {
  Guru: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-100",
  },

  Siswa: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-100",
  },

  Staff: {
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
  },

  Admin: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-100",
  },
};

/* =========================================================
   ROLE NORMALIZER
========================================================= */

function normalizeRole(role) {
  const value = String(role || "").toLowerCase();

  if (value.includes("guru")) {
    return "Guru";
  }

  if (value.includes("siswa")) {
    return "Siswa";
  }

  if (
    value.includes("staff") ||
    value.includes("staf")
  ) {
    return "Staff";
  }

  if (value.includes("admin")) {
    return "Admin";
  }

  return role || "Staff";
}

/* =========================================================
   AVATAR
========================================================= */

function getInitials(name) {
  if (!name) return "U";

  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    words[0][0] +
    words[1][0]
  ).toUpperCase();
}

/* =========================================================
   ROLE BADGE
========================================================= */

function RoleBadge({ role }) {
  const config =
    roleConfig[role] ||
    roleConfig.Staff;

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium ${config.bg} ${config.text} ${config.border}`}
    >
      {role}
    </span>
  );
}

/* =========================================================
   FACE STATUS BADGE
========================================================= */

function FaceStatusBadge({ status }) {
  const registered =
    status === "Terdaftar";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${
        registered
          ? "border-emerald-100 bg-emerald-50 text-emerald-700"
          : "border-amber-100 bg-amber-50 text-amber-700"
      }`}
    >
      {registered ? (
        <CheckCircle2 size={13} />
      ) : (
        <AlertCircle size={13} />
      )}

      {status}
    </span>
  );
}

/* =========================================================
   ACCOUNT STATUS
========================================================= */

function AccountStatus({ status }) {
  const active =
    String(status).toLowerCase() ===
    "aktif";

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${
        active
          ? "text-emerald-600"
          : "text-slate-400"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active
            ? "bg-emerald-500"
            : "bg-slate-300"
        }`}
      />

      {active
        ? "Aktif"
        : "Nonaktif"}
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
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-800">
            {value}
          </p>

          <p className="mt-1 truncate text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}
        >
          <Icon
            size={19}
            className="text-[#155DFC]"
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-50">
          <Icon
            size={14}
            className="text-slate-400"
          />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-0.5 truncate text-xs font-semibold text-slate-700">
            {value || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function FaceIdPage() {
  const router = useRouter();

  /* =======================================================
     SIDEBAR
  ======================================================= */

  const [isCollapsed, setIsCollapsed] =
    useState(false);

  /* =======================================================
     DATA
  ======================================================= */

  const [users, setUsers] =
    useState([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =======================================================
     FILTER
  ======================================================= */

  const [searchQuery, setSearchQuery] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState("Semua");

  const [faceFilter, setFaceFilter] =
    useState("Semua");

  const [statusFilter, setStatusFilter] =
    useState("Semua");

  const [currentPage, setCurrentPage] =
    useState(1);

  const itemsPerPage = 7;

  /* =======================================================
     MODAL
  ======================================================= */

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [deleteUser, setDeleteUser] =
    useState(null);

  const [isDeleting, setIsDeleting] =
    useState(false);

  /* =======================================================
     LOAD USERS
  ======================================================= */

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response =
        await apiFetch(
          "/api/users?page=1&limit=1000",
          {
            method: "GET",
          },
        );

      const rawData =
        response?.data ||
        response?.users ||
        [];

      /*
       * Antisipasi jika response.data
       * berbentuk object yang memiliki
       * property data.
       */
      const data =
        Array.isArray(rawData)
          ? rawData
          : Array.isArray(rawData?.data)
            ? rawData.data
            : [];

      const normalized =
        data.map((item) => {
          const biometric =
            item.biometrikWajah;

          const role =
            normalizeRole(
              item.peran
                ?.namaTampilan ||
                item.peran?.nama,
            );

          const registered =
            String(
              biometric?.status || "",
            ).toLowerCase() ===
            "aktif";

          return {
            id: item.id,

            nama:
              item.namaLengkap ||
              item.namaPengguna ||
              "Tanpa Nama",

            username:
              item.namaPengguna ||
              "-",

            email:
              item.email ||
              "-",

            noTelepon:
              item.noTelepon ||
              "-",

            peran: role,

            jabatan:
              item.jabatan ||
              item.nisn ||
              "-",

            status:
              String(
                item.status || "",
              ).toLowerCase() ===
              "aktif"
                ? "Aktif"
                : "Nonaktif",

            faceStatus:
              registered
                ? "Terdaftar"
                : "Belum Terdaftar",

            faceId:
              biometric?.id ||
              null,

            registeredAt:
              biometric?.dibuatPada ||
              null,

            updatedAt:
              biometric?.diperbaruiPada ||
              null,

            avatar:
              getInitials(
                item.namaLengkap ||
                  item.namaPengguna,
              ),

            confidence: null,

            facePhoto:
              biometric?.urlFotoReferensi ||
              null,
          };
        });

      setUsers(normalized);
    } catch (err) {
      console.error(
        "Gagal mengambil pengguna:",
        err,
      );

      setError(
        err?.message ||
          "Gagal mengambil data pengguna.",
      );

      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  /* =======================================================
     DATE FORMAT
  ======================================================= */

  const formatDate = (value) => {
    if (!value) {
      return "Belum terdaftar";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      return "Belum terdaftar";
    }

    return date.toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      },
    );
  };

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) => {
        const search =
          searchQuery
            .toLowerCase()
            .trim();

        const matchesSearch =
          !search ||
          user.nama
            .toLowerCase()
            .includes(search) ||
          user.username
            .toLowerCase()
            .includes(search) ||
          user.email
            .toLowerCase()
            .includes(search) ||
          user.jabatan
            .toLowerCase()
            .includes(search);

        const matchesRole =
          roleFilter === "Semua" ||
          user.peran ===
            roleFilter;

        const matchesFace =
          faceFilter === "Semua" ||
          user.faceStatus ===
            faceFilter;

        const matchesStatus =
          statusFilter ===
            "Semua" ||
          user.status ===
            statusFilter;

        return (
          matchesSearch &&
          matchesRole &&
          matchesFace &&
          matchesStatus
        );
      },
    );
  }, [
    users,
    searchQuery,
    roleFilter,
    faceFilter,
    statusFilter,
  ]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredUsers.length /
        itemsPerPage,
    ),
  );

  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages,
    );

  const paginatedUsers =
    filteredUsers.slice(
      (safeCurrentPage - 1) *
        itemsPerPage,
      safeCurrentPage *
        itemsPerPage,
    );

  /* =======================================================
     STATISTICS
  ======================================================= */

  const totalUsers =
    users.length;

  const registeredUsers =
    users.filter(
      (user) =>
        user.faceStatus ===
        "Terdaftar",
    ).length;

  const notRegisteredUsers =
    users.filter(
      (user) =>
        user.faceStatus ===
        "Belum Terdaftar",
    ).length;

  const activeUsers =
    users.filter(
      (user) =>
        user.status ===
        "Aktif",
    ).length;

  /* =======================================================
     RESET FILTER
  ======================================================= */

  const resetFilters = () => {
    setSearchQuery("");
    setRoleFilter("Semua");
    setFaceFilter("Semua");
    setStatusFilter("Semua");
    setCurrentPage(1);
  };

  /* =======================================================
     OPEN DETAIL
  ======================================================= */

  const handleOpenDetail = (
    user,
  ) => {
    setSelectedUser(user);
  };

  /* =======================================================
     OPEN EDIT PAGE
  ======================================================= */

  const handleOpenEdit = (
    user,
  ) => {
    if (!user?.id) {
      return;
    }

    router.push(
      `/admin/pengguna/face-id/edit/${user.id}`,
    );
  };

  /* =======================================================
     DELETE FACE ID
  ======================================================= */

  const handleDelete = async () => {
    if (!deleteUser?.id) {
      return;
    }

    try {
      setIsDeleting(true);

      await apiFetch(
        `/api/users/${deleteUser.id}/face-id`,
        {
          method: "DELETE",
        },
      );

      setDeleteUser(null);

      /*
       * Kalau detail user sedang terbuka,
       * tutup supaya datanya tidak stale.
       */
      setSelectedUser(null);

      await loadUsers();
    } catch (error) {
      console.error(
        "Gagal menghapus Face ID:",
        error,
      );

      alert(
        error?.message ||
          "Gagal menghapus Face ID.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  /* =======================================================
     SIDEBAR
  ======================================================= */

  const toggleSidebar = () => {
    setIsCollapsed(
      (prev) => !prev,
    );
  };

  /* =======================================================
     FILE URL
  ======================================================= */

  const getFileUrl = (filePath) => {
    if (!filePath) {
      return "";
    }

    if (
      /^https?:\/\//i.test(
        filePath,
      )
    ) {
      return filePath;
    }

    const apiBase =
      process.env
        .NEXT_PUBLIC_API_URL ||
      "";

    /*
     * Static uploads biasanya berada
     * di root backend, bukan di /api/v1.
     */
    const base =
      apiBase
        .replace(
          /\/api\/v1\/?$/,
          "",
        )
        .replace(
          /\/$/,
          "",
        );

    return `${base}${
      filePath.startsWith("/")
        ? filePath
        : `/${filePath}`
    }`;
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <Sidebar
        active="faceId"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={
          setIsCollapsed
        }
        role="admin"
      />

      {/* ===================================================
          MAIN
      =================================================== */}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="sticky top-0 z-40 shrink-0">
          <Header
            toggleSidebar={
              toggleSidebar
            }
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email:
                "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        <main className="min-h-0 flex-1 overflow-hidden">
          <div className="flex h-full min-h-0 flex-col px-4 py-4 sm:px-5 lg:px-6">
            {/* =================================================
                HEADER
            ================================================= */}

            <div className="mb-4 shrink-0">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eaf1ff]">
                      <ScanFace
                        size={19}
                        className="text-[#155DFC]"
                      />
                    </div>

                    <div className="min-w-0">
                      <h1 className="truncate text-lg font-bold tracking-tight text-slate-800 sm:text-xl">
                        Face ID
                      </h1>

                      <p className="truncate text-xs text-slate-500">
                        Kelola data pengenalan wajah pengguna sekolah
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    router.push(
                      "/admin/pengguna/face-id/tambah",
                    )
                  }
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#155DFC] to-[#0d47c9] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
                >
                  <Plus size={17} />
                  Tambah Face ID
                </button>
              </div>
            </div>

            {/* =================================================
                STATISTICS
            ================================================= */}

            <div className="mb-4 grid shrink-0 grid-cols-2 gap-3 xl:grid-cols-4">
              <StatCard
                title="Total Pengguna"
                value={
                  isLoading
                    ? "..."
                    : totalUsers
                }
                description="Seluruh pengguna"
                icon={Users}
                iconBg="bg-[#eaf1ff]"
              />

              <StatCard
                title="Face ID Terdaftar"
                value={
                  isLoading
                    ? "..."
                    : registeredUsers
                }
                description="Sudah memiliki Face ID"
                icon={
                  CheckCircle2
                }
                iconBg="bg-emerald-50"
              />

              <StatCard
                title="Belum Terdaftar"
                value={
                  isLoading
                    ? "..."
                    : notRegisteredUsers
                }
                description="Perlu registrasi"
                icon={XCircle}
                iconBg="bg-amber-50"
              />

              <StatCard
                title="Pengguna Aktif"
                value={
                  isLoading
                    ? "..."
                    : activeUsers
                }
                description="Akun berstatus aktif"
                icon={UserRound}
                iconBg="bg-indigo-50"
              />
            </div>

            {/* =================================================
                MAIN CARD
            ================================================= */}

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
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
                      value={
                        searchQuery
                      }
                      onChange={(e) => {
                        setSearchQuery(
                          e.target.value,
                        );

                        setCurrentPage(
                          1,
                        );
                      }}
                      placeholder="Cari nama, username, email, atau jabatan..."
                      className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#8bb4ff] focus:bg-white focus:ring-2 focus:ring-[#155DFC]/10"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:flex">
                    <div className="relative">
                      <Filter
                        size={14}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <select
                        value={
                          roleFilter
                        }
                        onChange={(e) => {
                          setRoleFilter(
                            e.target.value,
                          );

                          setCurrentPage(
                            1,
                          );
                        }}
                        className="h-10 min-w-[135px] appearance-none rounded-lg border border-slate-200 bg-white pl-8 pr-8 text-xs font-medium text-slate-600 outline-none focus:border-[#8bb4ff] focus:ring-2 focus:ring-[#155DFC]/10"
                      >
                        <option value="Semua">
                          Semua Peran
                        </option>

                        <option value="Guru">
                          Guru
                        </option>

                        <option value="Siswa">
                          Siswa
                        </option>

                        <option value="Staff">
                          Staff
                        </option>

                        <option value="Admin">
                          Admin
                        </option>
                      </select>
                    </div>

                    <select
                      value={
                        faceFilter
                      }
                      onChange={(e) => {
                        setFaceFilter(
                          e.target.value,
                        );

                        setCurrentPage(
                          1,
                        );
                      }}
                      className="h-10 min-w-[145px] rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none focus:border-[#8bb4ff] focus:ring-2 focus:ring-[#155DFC]/10"
                    >
                      <option value="Semua">
                        Semua Face ID
                      </option>

                      <option value="Terdaftar">
                        Terdaftar
                      </option>

                      <option value="Belum Terdaftar">
                        Belum Terdaftar
                      </option>
                    </select>

                    <select
                      value={
                        statusFilter
                      }
                      onChange={(e) => {
                        setStatusFilter(
                          e.target.value,
                        );

                        setCurrentPage(
                          1,
                        );
                      }}
                      className="h-10 min-w-[125px] rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none focus:border-[#8bb4ff] focus:ring-2 focus:ring-[#155DFC]/10"
                    >
                      <option value="Semua">
                        Semua Status
                      </option>

                      <option value="Aktif">
                        Aktif
                      </option>

                      <option value="Nonaktif">
                        Nonaktif
                      </option>
                    </select>

                    <button
                      onClick={
                        resetFilters
                      }
                      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-500 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <RotateCcw
                        size={14}
                      />
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* ERROR */}

              {error && (
                <div className="shrink-0 border-b border-red-100 bg-red-50 px-4 py-3">
                  <div className="flex items-center gap-2 text-xs text-red-600">
                    <AlertCircle
                      size={15}
                    />

                    {error}
                  </div>
                </div>
              )}

              {/* TABLE */}

              <div className="min-h-0 flex-1 overflow-auto">
                <table className="w-full min-w-[900px] border-collapse">
                  <thead className="sticky top-0 z-10 bg-slate-50">
                    <tr className="border-b border-slate-200">
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        Pengguna
                      </th>

                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        Peran
                      </th>

                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        Face ID
                      </th>

                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        Confidence
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
                    {isLoading ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-16"
                        >
                          <div className="flex flex-col items-center justify-center">
                            <Loader2
                              size={24}
                              className="animate-spin text-[#155DFC]"
                            />

                            <p className="mt-3 text-sm font-medium text-slate-600">
                              Mengambil data pengguna...
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : paginatedUsers.length >
                      0 ? (
                      paginatedUsers.map(
                        (user) => (
                          <tr
                            key={
                              user.id
                            }
                            className="group transition hover:bg-slate-50/70"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eaf1ff] text-xs font-bold text-[#155DFC]">
                                  {
                                    user.avatar
                                  }
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-slate-700">
                                    {
                                      user.nama
                                    }
                                  </p>

                                  <p className="truncate text-xs text-slate-400">
                                    @
                                    {
                                      user.username
                                    }
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <RoleBadge
                                role={
                                  user.peran
                                }
                              />

                              <p className="mt-1 max-w-[150px] truncate text-[11px] text-slate-400">
                                {
                                  user.jabatan
                                }
                              </p>
                            </td>

                            <td className="px-4 py-3">
                              <FaceStatusBadge
                                status={
                                  user.faceStatus
                                }
                              />

                              {user.faceId && (
                                <p className="mt-1 text-[11px] text-slate-400">
                                  {
                                    user.faceId
                                  }
                                </p>
                              )}
                            </td>

                            <td className="px-4 py-3">
                              {user.confidence ? (
                                <div className="w-[110px]">
                                  <div className="mb-1 flex items-center justify-between">
                                    <span className="text-xs font-semibold text-slate-700">
                                      {
                                        user.confidence
                                      }
                                      %
                                    </span>
                                  </div>

                                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                      className="h-full rounded-full bg-[#155DFC]"
                                      style={{
                                        width: `${user.confidence}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400">
                                  Belum diuji
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-3">
                              <AccountStatus
                                status={
                                  user.status
                                }
                              />
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1">
                                {/* DETAIL */}

                                <button
                                  onClick={() =>
                                    handleOpenDetail(
                                      user,
                                    )
                                  }
                                  title="Lihat detail"
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-[#eaf1ff] hover:text-[#155DFC]"
                                >
                                  <Eye
                                    size={
                                      16
                                    }
                                  />
                                </button>

                                {/* EDIT → /edit/[id] */}

                                <button
                                  onClick={() =>
                                    handleOpenEdit(
                                      user,
                                    )
                                  }
                                  title="Edit Face ID"
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-[#eaf1ff] hover:text-[#155DFC]"
                                >
                                  <Edit3
                                    size={
                                      16
                                    }
                                  />
                                </button>

                                {/* DELETE */}

                                {user.faceStatus ===
                                  "Terdaftar" && (
                                  <button
                                    onClick={() =>
                                      setDeleteUser(
                                        user,
                                      )
                                    }
                                    title="Hapus Face ID"
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                  >
                                    <Trash2
                                      size={
                                        16
                                      }
                                    />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ),
                      )
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-16"
                        >
                          <div className="flex flex-col items-center justify-center text-center">
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                              <Search
                                size={
                                  20
                                }
                                className="text-slate-400"
                              />
                            </div>

                            <p className="text-sm font-semibold text-slate-700">
                              Data tidak ditemukan
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Coba ubah kata pencarian atau filter.
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
                    {filteredUsers.length ===
                    0
                      ? 0
                      : (safeCurrentPage -
                          1) *
                          itemsPerPage +
                        1}
                  </span>{" "}
                  -{" "}
                  <span className="font-medium text-slate-600">
                    {Math.min(
                      safeCurrentPage *
                        itemsPerPage,
                      filteredUsers.length,
                    )}
                  </span>{" "}
                  dari{" "}
                  <span className="font-medium text-slate-600">
                    {
                      filteredUsers.length
                    }
                  </span>{" "}
                  data
                </p>

                <div className="flex items-center gap-1">
                  <button
                    disabled={
                      safeCurrentPage ===
                      1
                    }
                    onClick={() =>
                      setCurrentPage(
                        (prev) =>
                          Math.max(
                            1,
                            prev - 1,
                          ),
                      )
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft
                      size={15}
                    />
                  </button>

                  {Array.from(
                    {
                      length:
                        totalPages,
                    },
                    (_, index) =>
                      index + 1,
                  ).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() =>
                          setCurrentPage(
                            page,
                          )
                        }
                        className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-medium transition ${
                          safeCurrentPage ===
                          page
                            ? "bg-[#155DFC] text-white"
                            : "border border-transparent text-slate-500 hover:bg-slate-100"
                        }`}
                      >
                        {page}
                      </button>
                    ),
                  )}

                  <button
                    disabled={
                      safeCurrentPage ===
                      totalPages
                    }
                    onClick={() =>
                      setCurrentPage(
                        (prev) =>
                          Math.min(
                            totalPages,
                            prev + 1,
                          ),
                      )
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight
                      size={15}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  Detail Face ID
                </h2>

                <p className="mt-0.5 text-xs text-slate-400">
                  Informasi registrasi Face ID pengguna
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedUser(
                    null,
                  )
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-5">
              <div className="grid gap-5 md:grid-cols-[180px_1fr]">
                <div className="flex flex-col items-center">
                  <div className="relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-2xl border border-[#c7dbff] bg-[#eaf1ff]">
                    {selectedUser.facePhoto ? (
                      <img
                        src={getFileUrl(
                          selectedUser.facePhoto,
                        )}
                        alt="Foto Face ID"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ScanFace
                        size={70}
                        strokeWidth={
                          1.4
                        }
                        className="text-[#155DFC]"
                      />
                    )}

                    {selectedUser.faceStatus ===
                      "Terdaftar" && (
                      <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-white/90 px-2 py-1 text-center text-[10px] font-semibold text-emerald-600 shadow-sm">
                        Face terdaftar
                      </div>
                    )}
                  </div>

                  <div className="mt-3 text-center">
                    <FaceStatusBadge
                      status={
                        selectedUser.faceStatus
                      }
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-800">
                        {
                          selectedUser.nama
                        }
                      </h3>

                      <RoleBadge
                        role={
                          selectedUser.peran
                        }
                      />
                    </div>

                    <p className="mt-1 text-xs text-slate-400">
                      @
                      {
                        selectedUser.username
                      }
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <InfoItem
                      icon={Mail}
                      label="Email"
                      value={
                        selectedUser.email
                      }
                    />

                    <InfoItem
                      icon={Phone}
                      label="No. Telepon"
                      value={
                        selectedUser.noTelepon
                      }
                    />

                    <InfoItem
                      icon={UserRound}
                      label="Jabatan / Kelas"
                      value={
                        selectedUser.jabatan
                      }
                    />

                    <InfoItem
                      icon={
                        ShieldCheck
                      }
                      label="Status Akun"
                      value={
                        selectedUser.status
                      }
                    />

                    <InfoItem
                      icon={
                        Fingerprint
                      }
                      label="Face ID"
                      value={
                        selectedUser.faceId ||
                        "Belum tersedia"
                      }
                    />

                    <InfoItem
                      icon={
                        CalendarDays
                      }
                      label="Registrasi"
                      value={formatDate(
                        selectedUser.registeredAt,
                      )}
                    />
                  </div>

                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-start gap-2">
                      <ShieldCheck
                        size={16}
                        className="mt-0.5 text-[#155DFC]"
                      />

                      <div>
                        <p className="text-xs font-semibold text-slate-700">
                          Face Verification
                        </p>

                        <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                          Tingkat confidence tidak disimpan saat registrasi. Nilai kecocokan dihitung oleh AI ketika Face ID digunakan untuk presensi.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end">
              <button
                onClick={() =>
                  setSelectedUser(
                    null,
                  )
                }
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Tutup
              </button>

              {/* BUTTON EDIT SEKARANG PINDAH HALAMAN */}

              <button
                onClick={() =>
                  handleOpenEdit(
                    selectedUser,
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#155DFC] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0d47c9]"
              >
                <Edit3 size={15} />

                {selectedUser.faceStatus ===
                "Terdaftar"
                  ? "Perbarui Face ID"
                  : "Daftarkan Face ID"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {deleteUser && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50">
                <Trash2
                  size={19}
                  className="text-red-500"
                />
              </div>

              <div className="min-w-0">
                <h2 className="text-base font-bold text-slate-800">
                  Hapus Face ID?
                </h2>

                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  Face ID milik{" "}
                  <span className="font-semibold text-slate-700">
                    {
                      deleteUser.nama
                    }
                  </span>{" "}
                  akan dihapus dari sistem. Akun pengguna tidak akan ikut terhapus.
                </p>
              </div>

              <button
                onClick={() =>
                  setDeleteUser(
                    null,
                  )
                }
                disabled={
                  isDeleting
                }
                className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X size={17} />
              </button>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={() =>
                  setDeleteUser(
                    null,
                  )
                }
                disabled={
                  isDeleting
                }
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                onClick={
                  handleDelete
                }
                disabled={
                  isDeleting
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2
                      size={15}
                    />
                    Hapus Face ID
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}