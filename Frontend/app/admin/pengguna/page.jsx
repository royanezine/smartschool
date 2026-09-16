"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";

import {
  Search,
  Plus,
  Download,
  RefreshCw,
  Eye,
  Pencil,
  MoreVertical,
  Users,
  UserCheck,
  UserX,
  GraduationCap,
  BriefcaseBusiness,
  ShieldCheck,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Mail,
  Phone,
  UserRound,
  Database,
  Activity,
  MoreHorizontal,
} from "lucide-react";

/* =========================================================
   API
========================================================= */

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

const USERS_ENDPOINT = `${API_URL}/api/users`;

/* =========================================================
   HELPER TOKEN
========================================================= */

const getToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("token");
};

/* =========================================================
   EXTRACT DATA RESPONSE
========================================================= */

const extractUsers = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.data?.items)) {
    return response.data.items;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  return [];
};

/* =========================================================
   EXTRACT PAGINATION
========================================================= */

const extractPagination = (
  response,
  fallbackPage,
  fallbackLimit,
) => {
  const pagination =
    response?.pagination ||
    response?.meta ||
    response?.data?.pagination ||
    response?.data?.meta ||
    {};

  return {
    currentPage:
      Number(
        pagination.currentPage ??
          pagination.current_page ??
          pagination.page ??
          fallbackPage,
      ) || fallbackPage,

    totalPages:
      Number(
        pagination.totalPages ??
          pagination.total_pages ??
          pagination.pages ??
          1,
      ) || 1,

    totalData:
      Number(
        pagination.totalData ??
          pagination.total_data ??
          pagination.total ??
          0,
      ) || 0,

    limit:
      Number(
        pagination.limit ??
          pagination.perPage ??
          pagination.per_page ??
          fallbackLimit,
      ) || fallbackLimit,
  };
};

/* =========================================================
   ROLE NORMALIZER
========================================================= */

const normalizeRole = (role) => {
  const value = String(role || "")
    .trim()
    .toLowerCase();

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

  return role || "-";
};

/* =========================================================
   STATUS NORMALIZER
========================================================= */

const normalizeStatus = (status) => {
  const value = String(status || "")
    .trim()
    .toLowerCase();

  if (
    value === "aktif" ||
    value === "active" ||
    value === "true" ||
    value === "1"
  ) {
    return "Aktif";
  }

  return "Nonaktif";
};

/* =========================================================
   INITIAL
========================================================= */

const getInitials = (name) => {
  if (!name) {
    return "U";
  }

  const words = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0]
      .substring(0, 2)
      .toUpperCase();
  }

  return (
    words[0][0] +
    words[words.length - 1][0]
  ).toUpperCase();
};

/* =========================================================
   NORMALIZE USER
========================================================= */

const normalizeUser = (
  user,
  index,
) => {
  const role =
    user?.peran?.namaTampilan ||
    user?.peran?.nama ||
    user?.role ||
    user?.peran ||
    "-";

  return {
    id:
      user?.id ||
      `user-${index}`,

    nama:
      user?.namaLengkap ||
      user?.nama ||
      "-",

    username:
      user?.namaPengguna ||
      user?.username ||
      "-",

    email:
      user?.email ||
      "-",

    noTelepon:
      user?.noTelepon ||
      "-",

    peran: normalizeRole(role),

    peranRaw:
      user?.peran?.nama ||
      role,

    peranId:
      user?.peran?.id ||
      user?.peranId ||
      null,

    jabatan:
      user?.jabatan ||
      "-",

    status:
      normalizeStatus(
        user?.status,
      ),

    statusRaw:
      user?.status ||
      "nonaktif",

    avatar:
      user?.avatar ||
      null,

    nip:
      user?.nip ||
      null,

    nipd:
      user?.nipd ||
      null,

    nisn:
      user?.nisn ||
      null,

    golongan:
      user?.golongan ||
      null,

    sekolah:
      user?.sekolah ||
      null,

    biometrikWajah:
      user?.biometrikWajah ||
      null,

    dibuatPada:
      user?.dibuatPada ||
      null,
  };
};

/* =========================================================
   ROLE CONFIG
========================================================= */

const roleConfig = {
  Guru: {
    icon: GraduationCap,
    className:
      "bg-blue-50 text-blue-600 border-blue-200",
  },

  Siswa: {
    icon: UserRound,
    className:
      "bg-indigo-50 text-indigo-600 border-indigo-200",
  },

  Staff: {
    icon: BriefcaseBusiness,
    className:
      "bg-amber-50 text-amber-600 border-amber-200",
  },

  Admin: {
    icon: ShieldCheck,
    className:
      "bg-purple-50 text-purple-600 border-purple-200",
  },
};

/* =========================================================
   ROLE BADGE
========================================================= */

function RoleBadge({ role }) {
  const config = roleConfig[role] || {
    icon: Users,
    className:
      "bg-slate-100 text-slate-600 border-slate-200",
  };

  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        px-2.5
        py-1
        rounded-full
        border
        text-[11px]
        font-semibold
        whitespace-nowrap
        ${config.className}
      `}
    >
      <Icon size={12} />
      {role}
    </span>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const active = status === "Aktif";

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        px-2.5
        py-1
        rounded-full
        border
        text-[11px]
        font-semibold
        whitespace-nowrap
        ${
          active
            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
            : "bg-red-50 text-red-600 border-red-200"
        }
      `}
    >
      {active ? (
        <CheckCircle2 size={12} />
      ) : (
        <AlertCircle size={12} />
      )}

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
  iconClass,
  loading,
}) {
  return (
    <div
      className="
        bg-white
        rounded-2xl
        border
        border-slate-200/80
        p-4
        sm:p-5
        shadow-sm
        hover:shadow-md
        transition-all
        duration-200
      "
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] sm:text-xs font-medium text-slate-500">
            {title}
          </p>

          {loading ? (
            <div className="mt-2 h-8 w-16 animate-pulse rounded-lg bg-slate-100" />
          ) : (
            <p className="mt-1.5 text-2xl sm:text-3xl font-bold text-slate-900">
              {value}
            </p>
          )}

          <p className="mt-1 text-[10px] sm:text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div
          className="
            w-10
            h-10
            rounded-xl
            bg-slate-50
            border
            border-slate-100
            flex
            items-center
            justify-center
            shrink-0
          "
        >
          <Icon
            size={18}
            className={iconClass}
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function PenggunaPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  /* =======================================================
     USERS
  ======================================================= */

  const [users, setUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =======================================================
     FILTER
  ======================================================= */

  const [search, setSearch] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState("Semua");

  const [statusFilter, setStatusFilter] =
    useState("Semua");

  /* =======================================================
     PAGINATION
  ======================================================= */

  const [page, setPage] =
    useState(1);

  const LIMIT = 7;

  const [pagination, setPagination] =
    useState({
      currentPage: 1,
      totalPages: 1,
      totalData: 0,
      limit: LIMIT,
    });

  /* =======================================================
     MODAL
  ======================================================= */

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  /* =======================================================
     GET USERS
  ======================================================= */

  const fetchUsers = useCallback(
    async ({
      pageNumber = 1,
      searchValue = "",
      roleValue = "Semua",
      statusValue = "Semua",
      isRefresh = false,
    } = {}) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const token = getToken();

        const params =
          new URLSearchParams();

        params.set(
          "page",
          String(pageNumber),
        );

        params.set(
          "limit",
          String(LIMIT),
        );

        if (
          searchValue.trim()
        ) {
          params.set(
            "search",
            searchValue.trim(),
          );
        }

        if (
          roleValue &&
          roleValue !== "Semua"
        ) {
          const roleMap = {
            Guru: "guru",
            Siswa: "siswa",
            Staff: "staff",
            Admin: "admin",
          };

          params.set(
            "role",
            roleMap[
              roleValue
            ] ||
              roleValue.toLowerCase(),
          );
        }

        if (
          statusValue &&
          statusValue !== "Semua"
        ) {
          params.set(
            "status",
            statusValue ===
              "Aktif"
              ? "aktif"
              : "nonaktif",
          );
        }

        const response =
          await fetch(
            `${USERS_ENDPOINT}?${params.toString()}`,
            {
              method: "GET",

              headers: {
                Accept:
                  "application/json",

                ...(token
                  ? {
                      Authorization: `Bearer ${token}`,
                    }
                  : {}),
              },

              cache: "no-store",
            },
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Gagal mengambil data pengguna",
          );
        }

        const rawUsers =
          extractUsers(result);

        const normalizedUsers =
          rawUsers.map(
            normalizeUser,
          );

        const paginationData =
          extractPagination(
            result,
            pageNumber,
            LIMIT,
          );

        setUsers(
          normalizedUsers,
        );

        setPagination(
          paginationData,
        );
      } catch (err) {
        console.error(
          "GET USERS ERROR:",
          err,
        );

        setUsers([]);

        setError(
          err?.message ||
            "Gagal mengambil data pengguna.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  /* =======================================================
     LOAD
  ======================================================= */

  useEffect(() => {
    fetchUsers({
      pageNumber: page,
      searchValue: search,
      roleValue: roleFilter,
      statusValue: statusFilter,
    });
  }, [
    page,
    search,
    roleFilter,
    statusFilter,
    fetchUsers,
  ]);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const statistics =
    useMemo(() => {
      return {
        total:
          pagination.totalData ||
          users.length,

        guru:
          users.filter(
            (item) =>
              item.peran === "Guru",
          ).length,

        siswa:
          users.filter(
            (item) =>
              item.peran === "Siswa",
          ).length,

        staff:
          users.filter(
            (item) =>
              item.peran === "Staff",
          ).length,

        admin:
          users.filter(
            (item) =>
              item.peran === "Admin",
          ).length,

        aktif:
          users.filter(
            (item) =>
              item.status ===
              "Aktif",
          ).length,

        nonaktif:
          users.filter(
            (item) =>
              item.status ===
              "Nonaktif",
          ).length,
      };
    }, [
      users,
      pagination.totalData,
    ]);

  /* =======================================================
     SEARCH
  ======================================================= */

  const handleSearchChange = (
    event,
  ) => {
    setSearch(
      event.target.value,
    );

    setPage(1);
  };

  /* =======================================================
     ROLE
  ======================================================= */

  const handleRoleChange = (
    event,
  ) => {
    setRoleFilter(
      event.target.value,
    );

    setPage(1);
  };

  /* =======================================================
     STATUS
  ======================================================= */

  const handleStatusChange = (
    event,
  ) => {
    setStatusFilter(
      event.target.value,
    );

    setPage(1);
  };

  /* =======================================================
     RESET
  ======================================================= */

  const handleResetFilter = () => {
    setSearch("");
    setRoleFilter("Semua");
    setStatusFilter("Semua");
    setPage(1);
  };

  /* =======================================================
     ROLE QUICK FILTER
  ======================================================= */

  const handleRoleFilter = (role) => {
    setRoleFilter(role);
    setPage(1);
  };

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh = () => {
    fetchUsers({
      pageNumber: page,
      searchValue: search,
      roleValue: roleFilter,
      statusValue: statusFilter,
      isRefresh: true,
    });
  };

  /* =======================================================
     DETAIL
  ======================================================= */

  const handleDetail = (
    user,
  ) => {
    if (!user?.id) {
      return;
    }

    router.push(
      `/admin/pengguna/${user.id}`,
    );
  };

  /* =======================================================
     EDIT
  ======================================================= */

  const handleEdit = (
    user,
  ) => {
    if (!user?.id) {
      return;
    }

    router.push(
      `/admin/pengguna/${user.id}/edit`,
    );
  };

  /* =======================================================
     OPEN MODAL
  ======================================================= */

  const handleOpenStatusModal = (
    user,
  ) => {
    setSelectedUser(user);
  };

  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  const handleCloseStatusModal = () => {
    if (updatingStatus) {
      return;
    }

    setSelectedUser(null);
  };

  /* =======================================================
     UPDATE STATUS
  ======================================================= */

  const handleUpdateStatus =
    async () => {
      if (
        !selectedUser?.id ||
        updatingStatus
      ) {
        return;
      }

      try {
        setUpdatingStatus(true);
        setError("");

        const token = getToken();

        const newStatus =
          selectedUser.status ===
          "Aktif"
            ? "nonaktif"
            : "aktif";

        const response =
          await fetch(
            `${USERS_ENDPOINT}/${selectedUser.id}`,
            {
              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",

                ...(token
                  ? {
                      Authorization: `Bearer ${token}`,
                    }
                  : {}),
              },

              body: JSON.stringify({
                status: newStatus,
              }),
            },
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Gagal mengubah status pengguna",
          );
        }

        setSelectedUser(null);

        await fetchUsers({
          pageNumber: page,
          searchValue: search,
          roleValue: roleFilter,
          statusValue: statusFilter,
        });
      } catch (err) {
        console.error(
          "UPDATE STATUS ERROR:",
          err,
        );

        setError(
          err?.message ||
            "Gagal mengubah status pengguna.",
        );
      } finally {
        setUpdatingStatus(false);
      }
    };

  /* =======================================================
     EXPORT
  ======================================================= */

  const handleExport = () => {
    if (!users.length) {
      return;
    }

    const escapeCsv = (
      value,
    ) =>
      `"${String(
        value ?? "",
      ).replaceAll(
        '"',
        '""',
      )}"`;

    const headers = [
      "Nama Lengkap",
      "Username",
      "Email",
      "No. Telepon",
      "Peran",
      "Jabatan",
      "Status",
    ];

    const rows = users.map(
      (user) => [
        user.nama,
        user.username,
        user.email,
        user.noTelepon,
        user.peran,
        user.jabatan,
        user.status,
      ],
    );

    const csv = [
      headers
        .map(escapeCsv)
        .join(","),
      ...rows.map((row) =>
        row
          .map(escapeCsv)
          .join(","),
      ),
    ].join("\n");

    const blob =
      new Blob(
        ["\ufeff" + csv],
        {
          type: "text/csv;charset=utf-8;",
        },
      );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement(
        "a",
      );

    link.href = url;

    link.download =
      `data-pengguna-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    document.body.appendChild(
      link,
    );

    link.click();

    document.body.removeChild(
      link,
    );

    URL.revokeObjectURL(url);
  };

  /* =======================================================
     PAGINATION
  ======================================================= */

  const pageNumbers =
    useMemo(() => {
      const totalPages =
        pagination.totalPages ||
        1;

      const currentPage =
        pagination.currentPage ||
        page;

      const result = [];

      const start = Math.max(
        1,
        currentPage - 2,
      );

      const end = Math.min(
        totalPages,
        currentPage + 2,
      );

      for (
        let i = start;
        i <= end;
        i++
      ) {
        result.push(i);
      }

      return result;
    }, [
      pagination.totalPages,
      pagination.currentPage,
      page,
    ]);

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar
        role="admin"
        activeMenu="pengguna"
        isOpen={sidebarOpen}
        onToggle={() =>
          setSidebarOpen(
            !sidebarOpen,
          )
        }
      />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* HEADER */}

        <Header
          title="Pengguna"
          onMenuClick={() =>
            setSidebarOpen(
              !sidebarOpen,
            )
          }
        />

        {/* =====================================================
            PAGE (HANYA AREA INI YANG SCROLL)
        ===================================================== */}

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
            {/* =================================================
                PAGE HEADER
            ================================================== */}

            <div
              className="
                flex
                flex-col
                lg:flex-row
                lg:items-center
                lg:justify-between
                gap-4
              "
            >
              {/* TITLE */}

              <div className="flex items-center gap-3">
                <div
                  className="
                    w-11
                    h-11
                    rounded-xl
                    bg-gradient-to-br
                    from-[#155DFC]
                    to-[#0d47c9]
                    text-white
                    flex
                    items-center
                    justify-center
                    shadow-lg
                    shadow-[#155DFC]/20
                    shrink-0
                  "
                >
                  <Users size={20} />
                </div>

                <div className="min-w-0">
                  <h1
                    className="
                      text-xl
                      sm:text-2xl
                      font-bold
                      text-slate-800
                      truncate
                    "
                  >
                    Pengguna
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Kelola seluruh pengguna yang terdaftar di sekolah.
                  </p>
                </div>
              </div>

              {/* ACTION */}

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    px-4
                    py-2.5
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    text-slate-600
                    text-sm
                    font-semibold
                    hover:bg-slate-50
                    hover:border-slate-300
                    transition
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  <RefreshCw
                    size={15}
                    className={
                      refreshing
                        ? "animate-spin"
                        : ""
                    }
                  />
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={handleExport}
                  disabled={
                    loading || !users.length
                  }
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    px-4
                    py-2.5
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    text-slate-600
                    text-sm
                    font-semibold
                    hover:bg-slate-50
                    hover:border-slate-300
                    transition
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  <Download size={15} />
                  Export
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/admin/pengguna/tambah",
                    )
                  }
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    px-4
                    py-2.5
                    rounded-xl
                    bg-gradient-to-r
                    from-[#155DFC]
                    to-[#0d47c9]
                    text-white
                    text-sm
                    font-semibold
                    shadow-sm
                    hover:brightness-110
                    transition
                  "
                >
                  <Plus size={16} />
                  Tambah Pengguna
                </button>
              </div>
            </div>

            {/* ERROR */}

            {error && (
              <div
                className="
                  flex
                  items-start
                  gap-3
                  rounded-xl
                  border
                  border-red-200
                  bg-red-50
                  p-4
                "
              >
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800">
                    Terjadi kesalahan
                  </p>

                  <p className="mt-0.5 text-sm text-red-700">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setError("")
                  }
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* =================================================
                STATISTICS
            ================================================== */}

            <div
              className="
                grid
                grid-cols-2
                lg:grid-cols-4
                gap-3
                sm:gap-4
              "
            >
              <StatCard
                title="Total Pengguna"
                value={statistics.total}
                description={`${statistics.aktif} pengguna aktif`}
                icon={Users}
                iconClass="text-[#155DFC]"
                loading={loading}
              />

              <StatCard
                title="Guru"
                value={statistics.guru}
                description="Pengguna dengan role Guru"
                icon={GraduationCap}
                iconClass="text-blue-500"
                loading={loading}
              />

              <StatCard
                title="Siswa"
                value={statistics.siswa}
                description="Pengguna dengan role Siswa"
                icon={UserRound}
                iconClass="text-indigo-500"
                loading={loading}
              />

              <StatCard
                title="Staff"
                value={statistics.staff}
                description="Pengguna dengan role Staff"
                icon={BriefcaseBusiness}
                iconClass="text-amber-500"
                loading={loading}
              />
            </div>

            {/* =================================================
                OVERVIEW
            ================================================== */}

            <section
              className="
                bg-white
                rounded-2xl
                border
                border-slate-200/80
                shadow-sm
                overflow-hidden
              "
            >
              <div className="p-4 sm:p-5 lg:p-6">
                <div
                  className="
                    flex
                    flex-col
                    xl:flex-row
                    xl:items-center
                    xl:justify-between
                    gap-5
                  "
                >
                  {/* TEXT */}

                  <div>
                    <div className="flex items-center gap-2">
                      <div
                        className="
                          w-8
                          h-8
                          rounded-lg
                          bg-[#eaf1ff]
                          border
                          border-[#c7dbff]
                          flex
                          items-center
                          justify-center
                        "
                      >
                        <Activity
                          size={15}
                          className="text-[#155DFC]"
                        />
                      </div>

                      <h2 className="text-sm font-bold text-slate-800">
                        Ringkasan Pengguna
                      </h2>
                    </div>

                    <p className="text-xs text-slate-400 mt-2">
                      Distribusi pengguna berdasarkan peran.
                    </p>
                  </div>

                  {/* ROLE SUMMARY */}

                  <div
                    className="
                      grid
                      grid-cols-2
                      sm:grid-cols-4
                      gap-2
                      w-full
                      xl:w-auto
                    "
                  >
                    {/* SEMUA */}

                    <button
                      type="button"
                      onClick={() =>
                        handleRoleFilter("Semua")
                      }
                      className={`
                        px-4
                        py-3
                        rounded-xl
                        border
                        text-left
                        transition
                        ${
                          roleFilter === "Semua"
                            ? "bg-[#eaf1ff] border-[#c7dbff]"
                            : "bg-white border-slate-200 hover:bg-slate-50"
                        }
                      `}
                    >
                      <p className="text-[10px] text-slate-400">
                        Semua
                      </p>

                      <p className="text-lg font-bold text-slate-800 mt-1">
                        {statistics.total}
                      </p>
                    </button>

                    {/* GURU */}

                    <button
                      type="button"
                      onClick={() =>
                        handleRoleFilter("Guru")
                      }
                      className={`
                        px-4
                        py-3
                        rounded-xl
                        border
                        text-left
                        transition
                        ${
                          roleFilter === "Guru"
                            ? "bg-[#eaf1ff] border-[#c7dbff]"
                            : "bg-white border-slate-200 hover:bg-slate-50"
                        }
                      `}
                    >
                      <p className="text-[10px] text-slate-400">
                        Guru
                      </p>

                      <p className="text-lg font-bold text-slate-800 mt-1">
                        {statistics.guru}
                      </p>
                    </button>

                    {/* SISWA */}

                    <button
                      type="button"
                      onClick={() =>
                        handleRoleFilter("Siswa")
                      }
                      className={`
                        px-4
                        py-3
                        rounded-xl
                        border
                        text-left
                        transition
                        ${
                          roleFilter === "Siswa"
                            ? "bg-[#eaf1ff] border-[#c7dbff]"
                            : "bg-white border-slate-200 hover:bg-slate-50"
                        }
                      `}
                    >
                      <p className="text-[10px] text-slate-400">
                        Siswa
                      </p>

                      <p className="text-lg font-bold text-slate-800 mt-1">
                        {statistics.siswa}
                      </p>
                    </button>

                    {/* STAFF */}

                    <button
                      type="button"
                      onClick={() =>
                        handleRoleFilter("Staff")
                      }
                      className={`
                        px-4
                        py-3
                        rounded-xl
                        border
                        text-left
                        transition
                        ${
                          roleFilter === "Staff"
                            ? "bg-[#eaf1ff] border-[#c7dbff]"
                            : "bg-white border-slate-200 hover:bg-slate-50"
                        }
                      `}
                    >
                      <p className="text-[10px] text-slate-400">
                        Staff
                      </p>

                      <p className="text-lg font-bold text-slate-800 mt-1">
                        {statistics.staff}
                      </p>
                    </button>
                  </div>
                </div>

                {/* SMALL SUMMARY */}

                <div
                  className="
                    mt-5
                    pt-4
                    border-t
                    border-slate-100
                    flex
                    flex-wrap
                    gap-x-6
                    gap-y-2
                  "
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />

                    <span className="text-xs text-slate-500">
                      Aktif:
                    </span>

                    <span className="text-xs font-semibold text-slate-700">
                      {statistics.aktif}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" />

                    <span className="text-xs text-slate-500">
                      Nonaktif:
                    </span>

                    <span className="text-xs font-semibold text-slate-700">
                      {statistics.nonaktif}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />

                    <span className="text-xs text-slate-500">
                      Admin:
                    </span>

                    <span className="text-xs font-semibold text-slate-700">
                      {statistics.admin}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                FILTER
            ================================================== */}

            <section
              className="
                bg-white
                rounded-2xl
                border
                border-slate-200/80
                shadow-sm
                p-4
              "
            >
              <div
                className="
                  flex
                  flex-col
                  lg:flex-row
                  gap-3
                "
              >
                {/* SEARCH */}

                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={handleSearchChange}
                    placeholder="Cari nama, username, email, ID, jabatan..."
                    className="
                      w-full
                      pl-9
                      pr-10
                      py-2.5
                      text-sm
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      text-slate-800
                      placeholder:text-slate-400
                      focus:outline-none
                      focus:ring-2
                      focus:ring-[#155DFC]/20
                      focus:border-[#155DFC]/50
                      transition
                    "
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setPage(1);
                      }}
                      className="
                        absolute
                        right-3
                        top-1/2
                        -translate-y-1/2
                        text-slate-400
                        hover:text-slate-600
                      "
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                {/* FILTER */}

                <div
                  className="
                    flex
                    flex-col
                    sm:flex-row
                    gap-2
                  "
                >
                  <select
                    value={roleFilter}
                    onChange={handleRoleChange}
                    className="
                      text-sm
                      rounded-xl
                      border
                      border-slate-200
                      px-3
                      py-2.5
                      bg-white
                      text-slate-700
                      focus:outline-none
                      focus:ring-2
                      focus:ring-[#155DFC]/20
                      focus:border-[#155DFC]/50
                    "
                  >
                    <option value="Semua">
                      Semua Role
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

                  <select
                    value={statusFilter}
                    onChange={handleStatusChange}
                    className="
                      text-sm
                      rounded-xl
                      border
                      border-slate-200
                      px-3
                      py-2.5
                      bg-white
                      text-slate-700
                      focus:outline-none
                      focus:ring-2
                      focus:ring-[#155DFC]/20
                      focus:border-[#155DFC]/50
                    "
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
                    type="button"
                    onClick={handleResetFilter}
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      px-3
                      py-2.5
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      text-slate-600
                      text-sm
                      font-medium
                      hover:bg-slate-50
                      transition
                    "
                  >
                    <Filter size={15} />
                    Reset
                  </button>
                </div>
              </div>
            </section>

            {/* =================================================
                TABLE
            ================================================== */}

            <section
              className="
                bg-white
                rounded-2xl
                border
                border-slate-200/80
                shadow-sm
                overflow-hidden
              "
            >
              {/* TABLE HEADER */}

              <div
                className="
                  px-4
                  sm:px-5
                  lg:px-6
                  py-4
                  border-b
                  border-slate-100
                  flex
                  flex-col
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  gap-3
                "
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Database
                      size={16}
                      className="text-[#155DFC]"
                    />

                    <h2 className="text-sm font-bold text-slate-800">
                      Data Pengguna
                    </h2>
                  </div>

                  <p className="text-xs text-slate-400 mt-1">
                    Menampilkan data pengguna berdasarkan filter yang dipilih.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleExport}
                  disabled={
                    loading || !users.length
                  }
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    px-3
                    py-2
                    rounded-lg
                    border
                    border-slate-200
                    bg-white
                    text-slate-600
                    text-xs
                    font-semibold
                    hover:bg-slate-50
                    transition
                    w-fit
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  <Download size={14} />
                  Export Data
                </button>
              </div>

              {/* TABLE */}

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-sm border-collapse">
                  <thead>
                    <tr
                      className="
                        bg-gradient-to-r
                        from-[#155DFC]
                        to-[#0d47c9]
                        text-white
                      "
                    >
                      <th className="px-4 py-3 text-center font-semibold w-[65px]">
                        No
                      </th>

                      <th className="px-4 py-3 text-left font-semibold">
                        Pengguna
                      </th>

                      <th className="px-4 py-3 text-left font-semibold">
                        Kontak
                      </th>

                      <th className="px-4 py-3 text-left font-semibold">
                        Role
                      </th>

                      <th className="px-4 py-3 text-left font-semibold">
                        Jabatan / Keterangan
                      </th>

                      <th className="px-4 py-3 text-center font-semibold">
                        Status
                      </th>

                      <th className="px-4 py-3 text-center font-semibold">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {/* LOADING */}

                    {loading ? (
                      Array.from({
                        length: LIMIT,
                      }).map((_, index) => (
                        <tr
                          key={index}
                          className="border-b border-slate-100 last:border-0"
                        >
                          <td className="px-4 py-3 text-center">
                            <div className="mx-auto h-7 w-7 animate-pulse rounded-lg bg-slate-100" />
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 animate-pulse rounded-full bg-slate-100" />

                              <div className="space-y-2">
                                <div className="h-4 w-36 animate-pulse rounded bg-slate-100" />

                                <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="space-y-2">
                              <div className="h-3 w-40 animate-pulse rounded bg-slate-100" />

                              <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="h-6 w-20 animate-pulse rounded-full bg-slate-100" />
                          </td>

                          <td className="px-4 py-3">
                            <div className="space-y-2">
                              <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />

                              <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
                            </div>
                          </td>

                          <td className="px-4 py-3 text-center">
                            <div className="mx-auto h-6 w-20 animate-pulse rounded-full bg-slate-100" />
                          </td>

                          <td className="px-4 py-3">
                            <div className="mx-auto flex justify-center gap-1.5">
                              <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-100" />

                              <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-100" />

                              <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-100" />
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : users.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-16 text-center"
                        >
                          <div className="flex flex-col items-center">
                            <div
                              className="
                                w-12
                                h-12
                                rounded-full
                                bg-[#eaf1ff]
                                border
                                border-[#c7dbff]
                                flex
                                items-center
                                justify-center
                              "
                            >
                              <Search
                                size={20}
                                className="text-[#155DFC]"
                              />
                            </div>

                            <p className="mt-3 text-sm font-semibold text-slate-700">
                              Pengguna tidak ditemukan
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Coba ubah kata pencarian atau filter yang digunakan.
                            </p>

                            <button
                              type="button"
                              onClick={handleResetFilter}
                              className="
                                mt-4
                                text-xs
                                font-semibold
                                text-[#155DFC]
                                hover:underline
                              "
                            >
                              Reset Filter
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      users.map((user, index) => (
                        <tr
                          key={user.id}
                          className="
                            border-b
                            border-slate-100
                            last:border-0
                            hover:bg-[#eaf1ff]
                            transition-colors
                          "
                        >
                          {/* NO */}

                          <td className="px-4 py-3 text-center">
                            <span
                              className="
                                inline-flex
                                items-center
                                justify-center
                                w-7
                                h-7
                                rounded-lg
                                bg-[#eaf1ff]
                                border
                                border-[#c7dbff]
                                text-[#155DFC]
                                text-xs
                                font-bold
                              "
                            >
                              {(page - 1) * LIMIT +
                                index +
                                1}
                            </span>
                          </td>

                          {/* USER */}

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div
                                className="
                                  w-10
                                  h-10
                                  rounded-full
                                  bg-gradient-to-br
                                  from-[#155DFC]
                                  to-[#0d47c9]
                                  text-white
                                  flex
                                  items-center
                                  justify-center
                                  text-xs
                                  font-bold
                                  shrink-0
                                  overflow-hidden
                                "
                              >
                                {user.avatar ? (
                                  <img
                                    src={
                                      user.avatar.startsWith(
                                        "http",
                                      )
                                        ? user.avatar
                                        : `${API_URL}${user.avatar}`
                                    }
                                    alt={user.nama}
                                    className="h-full w-full object-cover"
                                    onError={(event) => {
                                      event.currentTarget.style.display =
                                        "none";
                                    }}
                                  />
                                ) : (
                                  getInitials(user.nama)
                                )}
                              </div>

                              <div className="min-w-0">
                                <p
                                  className="
                                    font-semibold
                                    text-slate-800
                                    truncate
                                    max-w-[220px]
                                  "
                                >
                                  {user.nama}
                                </p>

                                <p className="text-[11px] text-slate-400 mt-0.5">
                                  {user.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* KONTAK */}

                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Mail
                                  size={13}
                                  className="text-[#155DFC] shrink-0"
                                />

                                <span className="text-xs text-slate-600">
                                  {user.email}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <Phone
                                  size={13}
                                  className="text-slate-400 shrink-0"
                                />

                                <span className="text-xs text-slate-500">
                                  {user.noTelepon !== "-"
                                    ? user.noTelepon
                                    : "Belum diisi"}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* ROLE */}

                          <td className="px-4 py-3">
                            <RoleBadge role={user.peran} />
                          </td>

                          {/* JABATAN */}

                          <td className="px-4 py-3">
                            <p className="text-xs font-medium text-slate-700">
                              {user.jabatan}
                            </p>

                            <p className="text-[11px] text-slate-400 mt-1">
                              @{user.username}
                            </p>
                          </td>

                          {/* STATUS */}

                          <td className="px-4 py-3 text-center">
                            <StatusBadge status={user.status} />
                          </td>

                          {/* ACTION */}

                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* DETAIL */}

                              <button
                                type="button"
                                onClick={() =>
                                  handleDetail(user)
                                }
                                className="
                                  w-8
                                  h-8
                                  rounded-lg
                                  border
                                  border-slate-200
                                  bg-white
                                  text-slate-500
                                  hover:text-[#155DFC]
                                  hover:bg-[#eaf1ff]
                                  hover:border-[#c7dbff]
                                  transition
                                  flex
                                  items-center
                                  justify-center
                                "
                                title="Detail"
                              >
                                <Eye size={14} />
                              </button>

                              {/* EDIT */}

                              <button
                                type="button"
                                onClick={() =>
                                  handleEdit(user)
                                }
                                className="
                                  w-8
                                  h-8
                                  rounded-lg
                                  border
                                  border-slate-200
                                  bg-white
                                  text-slate-500
                                  hover:text-[#155DFC]
                                  hover:bg-[#eaf1ff]
                                  hover:border-[#c7dbff]
                                  transition
                                  flex
                                  items-center
                                  justify-center
                                "
                                title="Edit"
                              >
                                <Pencil size={14} />
                              </button>

                              {/* STATUS */}

                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenStatusModal(user)
                                }
                                className={`
                                  w-8
                                  h-8
                                  rounded-lg
                                  border
                                  flex
                                  items-center
                                  justify-center
                                  transition
                                  ${
                                    user.status === "Aktif"
                                      ? "border-red-200 bg-white text-red-500 hover:bg-red-50"
                                      : "border-emerald-200 bg-white text-emerald-500 hover:bg-emerald-50"
                                  }
                                `}
                                title={
                                  user.status === "Aktif"
                                    ? "Nonaktifkan"
                                    : "Aktifkan"
                                }
                              >
                                {user.status === "Aktif" ? (
                                  <UserX size={14} />
                                ) : (
                                  <UserCheck size={14} />
                                )}
                              </button>

                              {/* MORE */}

                              <button
                                type="button"
                                className="
                                  w-8
                                  h-8
                                  rounded-lg
                                  border
                                  border-slate-200
                                  bg-white
                                  text-slate-400
                                  hover:text-slate-600
                                  hover:bg-slate-50
                                  transition
                                  flex
                                  items-center
                                  justify-center
                                "
                                title="Lainnya"
                              >
                                <MoreHorizontal size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* =================================================
                  PAGINATION
              ================================================== */}

              {!loading && users.length > 0 && (
                <div
                  className="
                    px-4
                    sm:px-5
                    py-3
                    border-t
                    border-slate-100
                    bg-slate-50/60
                    flex
                    flex-col
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                    gap-3
                  "
                >
                  <p className="text-xs text-slate-500">
                    Menampilkan{" "}
                    <span className="font-semibold text-slate-700">
                      {users.length}
                    </span>{" "}
                    dari{" "}
                    <span className="font-semibold text-slate-700">
                      {pagination.totalData}
                    </span>{" "}
                    pengguna
                  </p>

                  <div className="flex items-center gap-1">
                    {/* PREV */}

                    <button
                      type="button"
                      disabled={page === 1}
                      onClick={() =>
                        setPage(
                          Math.max(1, page - 1),
                        )
                      }
                      className="
                        w-8
                        h-8
                        rounded-lg
                        border
                        border-slate-200
                        bg-white
                        text-slate-500
                        flex
                        items-center
                        justify-center
                        disabled:opacity-40
                        disabled:cursor-not-allowed
                        hover:bg-slate-50
                      "
                    >
                      <ChevronLeft size={15} />
                    </button>

                    {/* PAGE NUMBERS */}

                    {pageNumbers.map((pageNumber) => (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() =>
                          setPage(pageNumber)
                        }
                        className={`
                          w-8
                          h-8
                          rounded-lg
                          text-xs
                          font-semibold
                          transition
                          ${
                            page === pageNumber
                              ? "bg-[#155DFC] text-white shadow-sm"
                              : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                          }
                        `}
                      >
                        {pageNumber}
                      </button>
                    ))}

                    {/* NEXT */}

                    <button
                      type="button"
                      disabled={
                        page >= pagination.totalPages
                      }
                      onClick={() =>
                        setPage(
                          Math.min(
                            pagination.totalPages,
                            page + 1,
                          ),
                        )
                      }
                      className="
                        w-8
                        h-8
                        rounded-lg
                        border
                        border-slate-200
                        bg-white
                        text-slate-500
                        flex
                        items-center
                        justify-center
                        disabled:opacity-40
                        disabled:cursor-not-allowed
                        hover:bg-slate-50
                      "
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {/* =====================================================
          CONFIRM STATUS MODAL
      ====================================================== */}

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* OVERLAY */}

          <div
            className="
              absolute
              inset-0
              bg-slate-900/40
              backdrop-blur-sm
            "
            onClick={handleCloseStatusModal}
          />

          {/* MODAL */}

          <div
            className="
              relative
              w-full
              max-w-md
              bg-white
              rounded-2xl
              shadow-2xl
              border
              border-slate-200
              overflow-hidden
            "
          >
            {/* HEADER */}

            <div
              className="
                px-5
                py-4
                border-b
                border-slate-100
                flex
                items-center
                justify-between
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className={`
                    w-9
                    h-9
                    rounded-lg
                    flex
                    items-center
                    justify-center
                    ${
                      selectedUser.status === "Aktif"
                        ? "bg-red-50"
                        : "bg-emerald-50"
                    }
                  `}
                >
                  {selectedUser.status === "Aktif" ? (
                    <UserX
                      size={17}
                      className="text-red-500"
                    />
                  ) : (
                    <UserCheck
                      size={17}
                      className="text-emerald-500"
                    />
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    {selectedUser.status === "Aktif"
                      ? "Nonaktifkan Pengguna"
                      : "Aktifkan Pengguna"}
                  </h3>

                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Konfirmasi perubahan status akun
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseStatusModal}
                disabled={updatingStatus}
                className="
                  w-8
                  h-8
                  rounded-lg
                  hover:bg-slate-100
                  flex
                  items-center
                  justify-center
                  text-slate-400
                  transition
                  disabled:opacity-50
                "
              >
                <X size={16} />
              </button>
            </div>

            {/* BODY */}

            <div className="p-5">
              <div
                className="
                  flex
                  items-center
                  gap-3
                  p-4
                  rounded-xl
                  bg-slate-50
                  border
                  border-slate-200
                "
              >
                <div
                  className="
                    w-10
                    h-10
                    rounded-full
                    bg-gradient-to-br
                    from-[#155DFC]
                    to-[#0d47c9]
                    text-white
                    flex
                    items-center
                    justify-center
                    text-xs
                    font-bold
                  "
                >
                  {getInitials(selectedUser.nama)}
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">
                    {selectedUser.nama}
                  </p>

                  <p className="text-xs text-slate-400 mt-1 truncate">
                    {selectedUser.email}
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-6 mt-4">
                Apakah kamu yakin ingin{" "}
                <span className="font-semibold text-slate-800">
                  {selectedUser.status === "Aktif"
                    ? "menonaktifkan"
                    : "mengaktifkan"}
                </span>{" "}
                akun pengguna ini?
              </p>
            </div>

            {/* FOOTER */}

            <div
              className="
                px-5
                py-4
                border-t
                border-slate-100
                bg-slate-50/70
                flex
                justify-end
                gap-2
              "
            >
              <button
                type="button"
                onClick={handleCloseStatusModal}
                disabled={updatingStatus}
                className="
                  px-4
                  py-2.5
                  rounded-lg
                  border
                  border-slate-200
                  bg-white
                  text-slate-600
                  text-sm
                  font-semibold
                  hover:bg-slate-50
                  transition
                  disabled:opacity-50
                "
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={updatingStatus}
                className={`
                  inline-flex
                  items-center
                  gap-2
                  px-4
                  py-2.5
                  rounded-lg
                  text-white
                  text-sm
                  font-semibold
                  transition
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  ${
                    selectedUser.status === "Aktif"
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-emerald-500 hover:bg-emerald-600"
                  }
                `}
              >
                {updatingStatus ? (
                  <>
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    {selectedUser.status === "Aktif"
                      ? "Nonaktifkan"
                      : "Aktifkan"}
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