"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";
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
import { apiFetch } from "../../../../../lib/api";

/* =========================================================
   THEME HELPERS
========================================================= */

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]";

const themePrimaryHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";

const themeTextHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themePrimaryRing =
  "focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]";

const themePrimaryBorder =
  "focus:border-[var(--color-primary)]";

const themeCardShadow =
  "shadow-[0_6px_24px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";

const themeModalShadow =
  "shadow-[0_20px_60px_color-mix(in_srgb,var(--color-text)_18%,transparent)]";

/* =========================================================
   ROLE CONFIG
========================================================= */

const roleConfig = {
  Guru: {},
  Siswa: {},
  Staff: {},
  Admin: {},
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

  if (value.includes("staff") || value.includes("staf")) {
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
    return words[0].slice(0, 2).toUpperCase();
  }

  return (words[0][0] + words[1][0]).toUpperCase();
}

/* =========================================================
   ROLE BADGE
========================================================= */

function RoleBadge({ role }) {
  const config = roleConfig[role] || roleConfig.Staff;

  return (
    <span
      className={[
        "inline-flex items-center rounded-md border px-2.5 py-1",
        "text-xs font-medium",
        "theme-card-soft",
        "theme-border",
        "theme-text-secondary",
      ].join(" ")}
    >
      {role}
    </span>
  );
}

/* =========================================================
   FACE STATUS BADGE
========================================================= */

function FaceStatusBadge({ status }) {
  const registered = status === "Terdaftar";

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1",
        "text-xs font-medium",
        registered
          ? "theme-success"
          : "theme-warning",
      ].join(" ")}
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
    String(status).toLowerCase() === "aktif";

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 text-xs font-medium",
        active
          ? "theme-success"
          : "theme-text-muted",
      ].join(" ")}
    >
      <span
        className={[
          "h-1.5 w-1.5 rounded-full",
          active
            ? "bg-[var(--color-success)]"
            : "bg-[color-mix(in_srgb,var(--color-text)_25%,transparent)]",
        ].join(" ")}
      />

      {active ? "Aktif" : "Nonaktif"}
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
    <div
      className={[
        "rounded-xl border p-4",
        "theme-card",
        "theme-border",
        themeCardShadow,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium theme-text-muted">
            {title}
          </p>

          <p className="mt-1 text-2xl font-bold tracking-tight theme-text">
            {value}
          </p>

          <p className="mt-1 truncate text-xs theme-text-muted">
            {description}
          </p>
        </div>

        <div
          className={[
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            iconBg || themePrimarySoft,
          ].join(" ")}
        >
          <Icon
            size={19}
            className="text-[var(--color-primary)]"
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
    <div
      className={[
        "rounded-xl border p-3",
        "theme-card",
        "theme-border",
      ].join(" ")}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={[
            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
            themePrimarySoft,
            themePrimarySoftBorder,
          ].join(" ")}
        >
          <Icon
            size={14}
            className="text-[var(--color-primary)]"
          />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wide theme-text-muted">
            {label}
          </p>

          <p className="mt-0.5 truncate text-xs font-semibold theme-text-secondary">
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

  const [isCollapsed, setIsCollapsed] = useState(false);

  /* =======================================================
     DATA
  ======================================================= */

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  /* =======================================================
     FILTER
  ======================================================= */

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("Semua");
  const [faceFilter, setFaceFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 7;

  /* =======================================================
     MODAL
  ======================================================= */

  const [deleteUser, setDeleteUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  /* =======================================================
     LOAD USERS
  ======================================================= */

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await apiFetch(
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

      const data = Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData?.data)
          ? rawData.data
          : [];

      const normalized = data.map((item) => {
        const biometric = item.biometrikWajah;

        const role = normalizeRole(
          item.peran?.namaTampilan ||
            item.peran?.nama,
        );

        const registered =
          String(
            biometric?.status || "",
          ).toLowerCase() === "aktif";

        return {
          id: item.id,

          nama:
            item.namaLengkap ||
            item.namaPengguna ||
            "Tanpa Nama",

          username:
            item.namaPengguna || "-",

          email:
            item.email || "-",

          noTelepon:
            item.noTelepon || "-",

          peran: role,

          jabatan:
            item.jabatan ||
            item.nisn ||
            "-",

          status:
            String(
              item.status || "",
            ).toLowerCase() === "aktif"
              ? "Aktif"
              : "Nonaktif",

          faceStatus:
            registered
              ? "Terdaftar"
              : "Belum Terdaftar",

          faceId:
            biometric?.id || null,

          registeredAt:
            biometric?.dibuatPada || null,

          updatedAt:
            biometric?.diperbaruiPada || null,

          avatar: getInitials(
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

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
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
    return users.filter((user) => {
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
        user.peran === roleFilter;

      const matchesFace =
        faceFilter === "Semua" ||
        user.faceStatus === faceFilter;

      const matchesStatus =
        statusFilter === "Semua" ||
        user.status === statusFilter;

      return (
        matchesSearch &&
        matchesRole &&
        matchesFace &&
        matchesStatus
      );
    });
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

  const safeCurrentPage = Math.min(
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

  const totalUsers = users.length;

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
        user.status === "Aktif",
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

  const handleOpenDetail = (user) => {
    if (!user?.id) {
      return;
    }

    router.push(
      `/admin/pengguna/face-id/${user.id}`,
    );
  };

  /* =======================================================
     OPEN EDIT PAGE
  ======================================================= */

  const handleOpenEdit = (user) => {
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
    setIsCollapsed((prev) => !prev);
  };

  /* =======================================================
     FILE URL
  ======================================================= */

  const getFileUrl = (filePath) => {
    if (!filePath) {
      return "";
    }

    if (
      /^https?:\/\//i.test(filePath)
    ) {
      return filePath;
    }

    const apiBase =
      process.env
        .NEXT_PUBLIC_API_URL || "";

   

    const base = apiBase
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
    <div
      className={[
        "flex h-screen w-full overflow-hidden",
        "theme-page",
      ].join(" ")}
    >
      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <Sidebar
        active="faceId"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      {/* ===================================================
          MAIN
      =================================================== */}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="sticky top-0 z-40 shrink-0">
          <Header
            toggleSidebar={toggleSidebar}
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
                    <div
                      className={[
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                        themePrimarySoft,
                        themePrimarySoftBorder,
                      ].join(" ")}
                    >
                      <ScanFace
                        size={19}
                        className="text-[var(--color-primary)]"
                      />
                    </div>

                    <div className="min-w-0">
                      <h1 className="truncate text-lg font-bold tracking-tight theme-text sm:text-xl">
                        Face ID
                      </h1>

                      <p className="truncate text-xs theme-text-secondary">
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
                  className={[
                    "inline-flex shrink-0 items-center justify-center gap-2",
                    "rounded-lg px-4 py-2.5 text-sm font-semibold text-white",
                    "bg-[var(--color-primary)]",
                    "transition hover:brightness-110",
                    themePrimaryRing,
                  ].join(" ")}
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
                iconBg={themePrimarySoft}
              />

              <StatCard
                title="Face ID Terdaftar"
                value={
                  isLoading
                    ? "..."
                    : registeredUsers
                }
                description="Sudah memiliki Face ID"
                icon={CheckCircle2}
                iconBg="theme-success"
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
                iconBg="theme-warning"
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
                iconBg={themePrimarySoft}
              />
            </div>

            {/* =================================================
                MAIN CARD
            ================================================= */}

            <div
              className={[
                "flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border",
                "theme-card",
                "theme-border",
                themeCardShadow,
              ].join(" ")}
            >
              {/* FILTER */}

              <div
                className={[
                  "shrink-0 border-b p-3 sm:p-4",
                  "theme-border-soft",
                ].join(" ")}
              >
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center">

                  <div className="relative min-w-0 flex-1">
                    <Search
                      size={17}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                    />

                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(
                          e.target.value,
                        );
                        setCurrentPage(1);
                      }}
                      placeholder="Cari nama, username, email, atau jabatan..."
                      className={[
                        "h-10 w-full rounded-lg border pl-9 pr-3 text-sm",
                        "outline-none transition",
                        "theme-input",
                        "theme-border",
                        "theme-text",
                        "placeholder:text-[var(--color-text-placeholder)]",
                        themePrimaryBorder,
                        themePrimaryRing,
                      ].join(" ")}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:flex">

                    {/* ROLE */}

                    <div className="relative">
                      <Filter
                        size={14}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                      />

                      <select
                        value={roleFilter}
                        onChange={(e) => {
                          setRoleFilter(
                            e.target.value,
                          );
                          setCurrentPage(1);
                        }}
                        className={[
                          "h-10 min-w-[135px] appearance-none rounded-lg border",
                          "pl-8 pr-8 text-xs font-medium outline-none",
                          "theme-input",
                          "theme-border",
                          "theme-text-secondary",
                          themePrimaryBorder,
                          themePrimaryRing,
                        ].join(" ")}
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

                    {/* FACE FILTER */}

                    <select
                      value={faceFilter}
                      onChange={(e) => {
                        setFaceFilter(
                          e.target.value,
                        );
                        setCurrentPage(1);
                      }}
                      className={[
                        "h-10 min-w-[145px] rounded-lg border px-3",
                        "text-xs font-medium outline-none",
                        "theme-input",
                        "theme-border",
                        "theme-text-secondary",
                        themePrimaryBorder,
                        themePrimaryRing,
                      ].join(" ")}
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

                    {/* STATUS FILTER */}

                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(
                          e.target.value,
                        );
                        setCurrentPage(1);
                      }}
                      className={[
                        "h-10 min-w-[125px] rounded-lg border px-3",
                        "text-xs font-medium outline-none",
                        "theme-input",
                        "theme-border",
                        "theme-text-secondary",
                        themePrimaryBorder,
                        themePrimaryRing,
                      ].join(" ")}
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

                    {/* RESET */}

                    <button
                      onClick={resetFilters}
                      className={[
                        "inline-flex h-10 items-center justify-center gap-1.5",
                        "rounded-lg border px-3 text-xs font-medium transition",
                        "theme-card",
                        "theme-border",
                        "theme-text-secondary",
                        themeTextHover,
                      ].join(" ")}
                    >
                      <RotateCcw size={14} />
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* ERROR */}

              {error && (
                <div
                  className={[
                    "shrink-0 border-b px-4 py-3",
                    "theme-danger",
                    "theme-border-soft",
                  ].join(" ")}
                >
                  <div className="flex items-center gap-2 text-xs">
                    <AlertCircle size={15} />
                    {error}
                  </div>
                </div>
              )}

              {/* TABLE */}

              <div className="min-h-0 flex-1 overflow-auto">
                <table className="w-full min-w-[900px] border-collapse">
                  <thead
                    className={[
                      "sticky top-0 z-10",
                      "theme-card-soft",
                    ].join(" ")}
                  >
                    <tr
                      className={[
                        "border-b",
                        "theme-border",
                      ].join(" ")}
                    >
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
                        Pengguna
                      </th>

                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
                        Peran
                      </th>

                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
                        Face ID
                      </th>

                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
                        Confidence
                      </th>

                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
                        Status
                      </th>

                      <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody
                    className={[
                      "divide-y",
                      "divide-[color-mix(in_srgb,var(--color-border)_70%,transparent)]",
                    ].join(" ")}
                  >
                    {isLoading ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-16"
                        >
                          <div className="flex flex-col items-center justify-center">
                            <Loader2
                              size={24}
                              className="animate-spin text-[var(--color-primary)]"
                            />

                            <p className="mt-3 text-sm font-medium theme-text-secondary">
                              Mengambil data pengguna...
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : paginatedUsers.length > 0 ? (
                      paginatedUsers.map(
                        (user) => (
                          <tr
                            key={user.id}
                            className={[
                              "group transition",
                              themeTextHover,
                            ].join(" ")}
                          >
                            {/* USER */}

                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className={[
                                    "flex h-9 w-9 shrink-0 items-center justify-center",
                                    "rounded-lg text-xs font-bold",
                                    themePrimarySoft,
                                    "text-[var(--color-primary)]",
                                  ].join(" ")}
                                >
                                  {user.avatar}
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold theme-text">
                                    {user.nama}
                                  </p>

                                  <p className="truncate text-xs theme-text-muted">
                                    @{user.username}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* ROLE */}

                            <td className="px-4 py-3">
                              <RoleBadge
                                role={user.peran}
                              />

                              <p className="mt-1 max-w-[150px] truncate text-[11px] theme-text-muted">
                                {user.jabatan}
                              </p>
                            </td>

                            {/* FACE */}

                            <td className="px-4 py-3">
                              <FaceStatusBadge
                                status={
                                  user.faceStatus
                                }
                              />

                              {user.faceId && (
                                <p className="mt-1 text-[11px] theme-text-muted">
                                  {user.faceId}
                                </p>
                              )}
                            </td>

                            {/* CONFIDENCE */}

                            <td className="px-4 py-3">
                              {user.confidence ? (
                                <div className="w-[110px]">
                                  <div className="mb-1 flex items-center justify-between">
                                    <span className="text-xs font-semibold theme-text">
                                      {
                                        user.confidence
                                      }
                                      %
                                    </span>
                                  </div>

                                  <div
                                    className={[
                                      "h-1.5 overflow-hidden rounded-full",
                                      "bg-[color-mix(in_srgb,var(--color-text)_10%,transparent)]",
                                    ].join(" ")}
                                  >
                                    <div
                                      className="h-full rounded-full bg-[var(--color-primary)]"
                                      style={{
                                        width: `${user.confidence}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs theme-text-muted">
                                  Belum diuji
                                </span>
                              )}
                            </td>

                            {/* STATUS */}

                            <td className="px-4 py-3">
                              <AccountStatus
                                status={user.status}
                              />
                            </td>

                            {/* ACTION */}

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
                                  className={[
                                    "flex h-8 w-8 items-center justify-center",
                                    "rounded-lg theme-text-muted transition",
                                    themePrimaryHover,
                                    "hover:text-[var(--color-primary)]",
                                  ].join(" ")}
                                >
                                  <Eye size={16} />
                                </button>

                                {/* EDIT */}

                                <button
                                  onClick={() =>
                                    handleOpenEdit(
                                      user,
                                    )
                                  }
                                  title="Edit Face ID"
                                  className={[
                                    "flex h-8 w-8 items-center justify-center",
                                    "rounded-lg theme-text-muted transition",
                                    themePrimaryHover,
                                    "hover:text-[var(--color-primary)]",
                                  ].join(" ")}
                                >
                                  <Edit3 size={16} />
                                </button>

                                {/* DELETE */}

                                {user.faceStatus ===
                                  "Terdaftar" && (
                                  <button
                                    onClick={() => {
                                      setDeleteUser(
                                        user,
                                      );
                                      setSelectedUser(
                                        user,
                                      );
                                    }}
                                    title="Hapus Face ID"
                                    className={[
                                      "flex h-8 w-8 items-center justify-center",
                                      "rounded-lg theme-text-muted transition",
                                      "hover:bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)]",
                                      "hover:text-[var(--color-danger)]",
                                    ].join(" ")}
                                  >
                                    <Trash2 size={16} />
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
                            <div
                              className={[
                                "mb-3 flex h-12 w-12 items-center justify-center rounded-xl",
                                "theme-card-soft",
                                "theme-border",
                                "border",
                              ].join(" ")}
                            >
                              <Search
                                size={20}
                                className="theme-text-muted"
                              />
                            </div>

                            <p className="text-sm font-semibold theme-text">
                              Data tidak ditemukan
                            </p>

                            <p className="mt-1 text-xs theme-text-muted">
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

              <div
                className={[
                  "flex shrink-0 flex-col gap-2 border-t px-4 py-3",
                  "theme-border-soft",
                  "sm:flex-row sm:items-center sm:justify-between",
                ].join(" ")}
              >
                <p className="text-xs theme-text-muted">
                  Menampilkan{" "}

                  <span className="font-medium theme-text-secondary">
                    {filteredUsers.length === 0
                      ? 0
                      : (safeCurrentPage - 1) *
                          itemsPerPage +
                        1}
                  </span>{" "}

                  -{" "}

                  <span className="font-medium theme-text-secondary">
                    {Math.min(
                      safeCurrentPage *
                        itemsPerPage,
                      filteredUsers.length,
                    )}
                  </span>{" "}

                  dari{" "}

                  <span className="font-medium theme-text-secondary">
                    {filteredUsers.length}
                  </span>{" "}
                  data
                </p>

                <div className="flex items-center gap-1">

                  {/* PREVIOUS */}

                  <button
                    disabled={
                      safeCurrentPage === 1
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
                    className={[
                      "flex h-8 w-8 items-center justify-center",
                      "rounded-lg border transition",
                      "theme-border",
                      "theme-text-secondary",
                      themeTextHover,
                      "disabled:cursor-not-allowed disabled:opacity-40",
                    ].join(" ")}
                  >
                    <ChevronLeft size={15} />
                  </button>

                  {/* PAGE NUMBERS */}

                  {Array.from(
                    {
                      length: totalPages,
                    },
                    (_, index) =>
                      index + 1,
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() =>
                        setCurrentPage(
                          page,
                        )
                      }
                      className={[
                        "flex h-8 min-w-8 items-center justify-center",
                        "rounded-lg px-2 text-xs font-medium transition",
                        safeCurrentPage ===
                        page
                          ? "bg-[var(--color-primary)] text-white"
                          : [
                              "theme-text-secondary",
                              themeTextHover,
                            ].join(" "),
                      ].join(" ")}
                    >
                      {page}
                    </button>
                  ))}

                  {/* NEXT */}

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
                    className={[
                      "flex h-8 w-8 items-center justify-center",
                      "rounded-lg border transition",
                      "theme-border",
                      "theme-text-secondary",
                      themeTextHover,
                      "disabled:cursor-not-allowed disabled:opacity-40",
                    ].join(" ")}
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {deleteUser && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[color-mix(in_srgb,var(--color-text)_45%,transparent)] p-4 backdrop-blur-[2px]">
          <div
            className={[
              "w-full max-w-md rounded-2xl border p-5",
              "theme-card",
              "theme-border",
              themeModalShadow,
            ].join(" ")}
          >
            <div className="flex items-start gap-3">

              {/* ICON */}

              <div
                className={[
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  "theme-danger",
                ].join(" ")}
              >
                <Trash2 size={19} />
              </div>

              {/* CONTENT */}

              <div className="min-w-0">
                <h2 className="text-base font-bold theme-text">
                  Hapus Face ID?
                </h2>

                <p className="mt-1 text-xs leading-relaxed theme-text-secondary">
                  Face ID milik{" "}

                  <span className="font-semibold theme-text">
                    {deleteUser.nama}
                  </span>{" "}

                  akan dihapus dari sistem.
                  Akun pengguna tidak akan ikut
                  terhapus.
                </p>
              </div>

              {/* CLOSE */}

              <button
                onClick={() =>
                  setDeleteUser(null)
                }
                disabled={isDeleting}
                className={[
                  "ml-auto flex h-8 w-8 shrink-0 items-center justify-center",
                  "rounded-lg theme-text-muted transition",
                  themeTextHover,
                ].join(" ")}
              >
                <X size={17} />
              </button>
            </div>

            {/* ACTIONS */}

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">

              {/* CANCEL */}

              <button
                onClick={() =>
                  setDeleteUser(null)
                }
                disabled={isDeleting}
                className={[
                  "rounded-lg border px-4 py-2",
                  "text-sm font-medium transition",
                  "theme-card",
                  "theme-border",
                  "theme-text-secondary",
                  themeTextHover,
                  "disabled:opacity-50",
                ].join(" ")}
              >
                Batal
              </button>

              {/* DELETE */}

              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={[
                  "inline-flex items-center justify-center gap-2",
                  "rounded-lg px-4 py-2 text-sm font-semibold text-white",
                  "bg-[var(--color-danger)]",
                  "transition hover:brightness-110",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                ].join(" ")}
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
                    <Trash2 size={15} />
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