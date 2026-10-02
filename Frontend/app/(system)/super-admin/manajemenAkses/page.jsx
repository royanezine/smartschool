"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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
  Activity,
  Settings2,
  ArrowUpRight,
  Database,
  Layers3,
} from "lucide-react";

import {
  getRoles,
  deleteRole,
} from "@/services/role.service";

/* ============================================================
   THEME HELPERS
============================================================ */

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
    bg: themeSuccessSurface,
    text: "text-[var(--color-success)]",
    border: themeSuccessBorder,
    dot: "bg-[var(--color-success)]",
    icon: CheckCircle2,
  },

  nonaktif: {
    bg: themeDangerSurface,
    text: "theme-text-muted",
    border: themeDangerBorder,
    dot: "bg-[var(--color-text-muted)]",
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
      console.error(
        "Gagal mengambil data role:",
        error
      );

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

    window.addEventListener(
      "resize",
      checkScreen
    );

    return () => {
      window.removeEventListener(
        "resize",
        checkScreen
      );
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

    window.addEventListener(
      "click",
      closeMenu
    );

    return () => {
      window.removeEventListener(
        "click",
        closeMenu
      );
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
      (sum, role) =>
        sum + Number(role.pengguna || 0),
      0
    );

    const izin = roles.reduce(
      (sum, role) =>
        sum + Number(role.izin || 0),
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
    const keyword = searchQuery
      .toLowerCase()
      .trim();

    return roles.filter((item) => {
      const nama = String(
        item.nama || ""
      ).toLowerCase();

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
  }, [
    roles,
    searchQuery,
    filterStatus,
  ]);

  /* ============================================================
     SORT
  ============================================================ */

  const sortedData = useMemo(() => {
    return [...filteredData].sort(
      (a, b) => {
        let valueA;
        let valueB;

        if (
          sortField === "pengguna" ||
          sortField === "izin"
        ) {
          valueA = Number(
            a[sortField] || 0
          );

          valueB = Number(
            b[sortField] || 0
          );
        } else {
          valueA = String(
            a[sortField] || ""
          ).toLowerCase();

          valueB = String(
            b[sortField] || ""
          ).toLowerCase();
        }

        if (valueA < valueB) {
          return sortOrder === "asc"
            ? -1
            : 1;
        }

        if (valueA > valueB) {
          return sortOrder === "asc"
            ? 1
            : -1;
        }

        return 0;
      }
    );
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
      sortedData.length /
        itemsPerPage
    )
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [
    currentPage,
    totalPages,
  ]);

  const paginatedData =
    sortedData.slice(
      (currentPage - 1) *
        itemsPerPage,
      currentPage *
        itemsPerPage
    );

  /* ============================================================
     SORT HANDLER
  ============================================================ */

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) =>
        prev === "asc"
          ? "desc"
          : "asc"
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
    if (sortField !== field) {
      return null;
    }

    return sortOrder === "asc" ? (
      <ArrowUp
        size={13}
        className={themePrimaryText}
      />
    ) : (
      <ArrowDown
        size={13}
        className={themePrimaryText}
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
    const confirmed =
      window.confirm(
        `Apakah kamu yakin ingin menghapus role "${role.nama}"?`
      );

    if (!confirmed) return;

    try {
      setDeletingId(role.id);

      await deleteRole(role.id);

      setRoles((prev) =>
        prev.filter(
          (item) =>
            item.id !== role.id
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
    if (sortedData.length === 0) {
      return;
    }

    const header = [
      "Nama Role",
      "Nama Tampilan",
      "Deskripsi",
      "Izin",
      "Pengguna",
      "Status",
    ];

    const rows = sortedData.map(
      (item) => [
        item.nama,
        item.namaTampilan,
        item.deskripsi,
        item.izin,
        item.pengguna,
        getStatusLabel(item.status),
      ]
    );

    const escapeCsv = (value) =>
      `"${String(value).replace(
        /"/g,
        '""'
      )}"`;

    const csvContent = [
      header,
      ...rows,
    ]
      .map((row) =>
        row
          .map(escapeCsv)
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      ["\uFEFF" + csvContent],
      {
        type:
          "text/csv;charset=utf-8;",
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

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

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
    return (
      iconMap[iconName] ||
      Shield
    );
  };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="w-full max-w-[1600px] mx-auto px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">

        {/* ==================================================
            PREMIUM HERO
        ================================================== */}

        <section
          className={`
            relative overflow-hidden rounded-[24px]
            ${themePrimaryGradient}
            ${themePrimaryShadow}
            mb-6
          `}
        >
          {/* Background glow */}

          <div
            className="
              absolute
              -top-24
              -right-20
              w-80
              h-80
              rounded-full
              bg-[color-mix(in_srgb,var(--color-card)_14%,transparent)]
              blur-3xl
              pointer-events-none
            "
          />

          <div
            className="
              absolute
              -bottom-32
              left-1/3
              w-96
              h-96
              rounded-full
              bg-[color-mix(in_srgb,var(--color-info)_16%,transparent)]
              blur-3xl
              pointer-events-none
            "
          />

          {/* Grid */}

          <div
            className="
              absolute
              inset-0
              opacity-[0.045]
              pointer-events-none
            "
            style={{
              backgroundImage:
                "linear-gradient(color-mix(in srgb, var(--color-card) 80%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--color-card) 80%, transparent) 1px, transparent 1px)",
              backgroundSize:
                "36px 36px",
            }}
          />

          <div className="relative p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-7">

              <div className="min-w-0">

                <div className="flex items-center gap-2 mb-4">

                  <span
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      border
                      border-[color-mix(in_srgb,var(--color-card)_22%,transparent)]
                      bg-[color-mix(in_srgb,var(--color-card)_10%,transparent)]
                      px-3
                      py-1.5
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.14em]
                      text-[var(--color-card)]
                    "
                  >
                    <ShieldCheck size={13} />
                    Security & Access
                  </span>

                  <span
                    className="
                      hidden
                      sm:inline-flex
                      items-center
                      gap-1.5
                      rounded-full
                      border
                      border-[color-mix(in_srgb,var(--color-card)_12%,transparent)]
                      bg-[color-mix(in_srgb,var(--color-card)_6%,transparent)]
                      px-3
                      py-1.5
                      text-[10px]
                      font-medium
                      text-[color-mix(in_srgb,var(--color-card)_78%,transparent)]
                    "
                  >
                    <Activity size={12} />
                    SmartSchool
                  </span>

                </div>

                <div className="flex items-start gap-4">

                  <div
                    className="
                      hidden
                      sm:flex
                      w-14
                      h-14
                      shrink-0
                      rounded-2xl
                      bg-[color-mix(in_srgb,var(--color-card)_12%,transparent)]
                      border
                      border-[color-mix(in_srgb,var(--color-card)_20%,transparent)]
                      items-center
                      justify-center
                      text-[var(--color-card)]
                    "
                  >
                    <Shield
                      size={27}
                      strokeWidth={1.8}
                    />
                  </div>

                  <div>

                    <h1
                      className="
                        text-2xl
                        sm:text-3xl
                        lg:text-[34px]
                        font-semibold
                        tracking-tight
                        text-[var(--color-card)]
                      "
                    >
                      Manajemen Akses
                    </h1>

                    <p
                      className="
                        mt-2
                        max-w-2xl
                        text-sm
                        leading-6
                        text-[color-mix(in_srgb,var(--color-card)_78%,transparent)]
                      "
                    >
                      Kelola role, pengguna, dan
                      hak akses sistem SmartSchool
                      secara terpusat dan
                      terstruktur.
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-4">

                      <div
                        className="
                          flex
                          items-center
                          gap-2
                          text-xs
                          text-[color-mix(in_srgb,var(--color-card)_78%,transparent)]
                        "
                      >
                        <div
                          className="
                            w-6
                            h-6
                            rounded-md
                            bg-[color-mix(in_srgb,var(--color-card)_10%,transparent)]
                            flex
                            items-center
                            justify-center
                          "
                        >
                          <Database size={12} />
                        </div>

                        Data terintegrasi
                      </div>

                      <div
                        className="
                          w-1
                          h-1
                          rounded-full
                          bg-[color-mix(in_srgb,var(--color-card)_45%,transparent)]
                        "
                      />

                      <div
                        className="
                          flex
                          items-center
                          gap-2
                          text-xs
                          text-[color-mix(in_srgb,var(--color-card)_78%,transparent)]
                        "
                      >
                        <div
                          className="
                            w-6
                            h-6
                            rounded-md
                            bg-[color-mix(in_srgb,var(--color-card)_10%,transparent)]
                            flex
                            items-center
                            justify-center
                          "
                        >
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
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    h-11
                    px-4
                    rounded-xl
                    border
                    border-[color-mix(in_srgb,var(--color-card)_14%,transparent)]
                    bg-[color-mix(in_srgb,var(--color-card)_7%,transparent)]
                    text-[color-mix(in_srgb,var(--color-card)_88%,transparent)]
                    text-sm
                    font-medium
                    backdrop-blur-sm
                    hover:bg-[color-mix(in_srgb,var(--color-card)_12%,transparent)]
                    hover:border-[color-mix(in_srgb,var(--color-card)_22%,transparent)]
                    transition-all
                    disabled:opacity-40
                    disabled:cursor-not-allowed
                  "
                >
                  <FileSpreadsheet size={16} />
                  Export Data
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/super-admin/manajemenAkses/tambah-role"
                    )
                  }
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    h-11
                    px-4
                    rounded-xl
                    bg-[var(--color-card)]
                    text-[var(--color-primary)]
                    text-sm
                    font-semibold
                    shadow-lg
                    hover:-translate-y-0.5
                    transition-all
                  "
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
            accent="primary"
          />

          <PremiumStatCard
            label="Role Aktif"
            value={statistics.aktif}
            description="Sedang digunakan"
            icon={BadgeCheck}
            accent="success"
          />

          <PremiumStatCard
            label="Total Pengguna"
            value={statistics.pengguna.toLocaleString(
              "id-ID"
            )}
            description="Pengguna terkait"
            icon={Users}
            accent="info"
          />

          <PremiumStatCard
            label="Total Izin"
            value={statistics.izin}
            description="Hak akses terdaftar"
            icon={Key}
            accent="neutral"
          />

        </section>

        {/* ==================================================
            INFORMATION
        ================================================== */}

        <section
          className={`
            relative
            overflow-hidden
            rounded-2xl
            theme-card
            theme-border
            ${themeCardShadow}
            mb-6
          `}
        >
          <div
            className="
              absolute
              right-0
              top-0
              w-44
              h-full
              bg-[linear-gradient(to_left,color-mix(in_srgb,var(--color-primary)_7%,transparent),transparent)]
              pointer-events-none
            "
          />

          <div className="relative flex items-start gap-4 p-4 sm:p-5">

            <div
              className={`
                w-10
                h-10
                shrink-0
                rounded-xl
                ${themePrimarySoft}
                ${themePrimarySoftBorder}
                ${themePrimaryText}
                flex
                items-center
                justify-center
              `}
            >
              <Sparkles
                size={18}
                strokeWidth={1.8}
              />
            </div>

            <div className="flex-1 min-w-0">

              <div className="flex flex-wrap items-center gap-2">

                <h2 className="text-sm font-semibold theme-text">
                  Pengaturan akses sistem
                </h2>

                <span
                  className={`
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-wider
                    ${themePrimaryText}
                    ${themePrimarySoft}
                    ${themePrimarySoftBorder}
                    rounded-full
                    px-2
                    py-0.5
                  `}
                >
                  Security
                </span>

              </div>

              <p className="text-xs sm:text-sm theme-text-muted leading-5 mt-1">
                Pastikan setiap role hanya
                memiliki izin sesuai dengan
                kebutuhan dan tanggung jawab
                pengguna.
              </p>

            </div>

            <div
              className="
                hidden
                sm:flex
                w-8
                h-8
                rounded-lg
                theme-neutral-surface
                theme-border
                items-center
                justify-center
                theme-text-muted
              "
            >
              <Settings2 size={15} />
            </div>

          </div>
        </section>

        {/* ==================================================
            ERROR
        ================================================== */}

        {errorMessage && (
          <section
            className={`
              mb-6
              rounded-2xl
              ${themeDangerBorder}
              theme-card
              ${themeCardShadow}
              overflow-hidden
            `}
          >
            <div className="h-1 bg-[var(--color-warning)]" />

            <div className="flex items-start gap-3 p-4">

              <div
                className={`
                  w-9
                  h-9
                  shrink-0
                  rounded-xl
                  ${themeWarningSurface}
                  ${themeWarningBorder}
                  text-[var(--color-warning)]
                  flex
                  items-center
                  justify-center
                `}
              >
                <AlertCircle size={17} />
              </div>

              <div className="flex-1 min-w-0">

                <p className="text-sm font-semibold theme-text">
                  Gagal mengambil data role
                </p>

                <p className="text-xs theme-text-muted mt-1">
                  {errorMessage}
                </p>

                <button
                  type="button"
                  onClick={loadRoles}
                  className={`
                    mt-2
                    inline-flex
                    items-center
                    gap-1.5
                    text-xs
                    font-semibold
                    ${themePrimaryText}
                    hover:opacity-80
                  `}
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

        <section
          className={`
            theme-card
            ${themeNeutralBorder}
            rounded-2xl
            ${themeCardShadow}
            overflow-hidden
            mb-5
          `}
        >

          <div className="p-4 sm:p-5">

            <div className="flex flex-col xl:flex-row xl:items-center gap-3">

              {/* SEARCH */}

              <div className="relative flex-1 min-w-0">

                <Search
                  size={17}
                  className="
                    absolute
                    left-3.5
                    top-1/2
                    -translate-y-1/2
                    theme-text-placeholder
                  "
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
                  className={`
                    w-full
                    h-11
                    pl-10
                    pr-4
                    rounded-xl
                    theme-input
                    theme-text
                    text-sm
                    ${themeFocus}
                    transition-all
                  `}
                />

              </div>

              {/* FILTER */}

              <div className="flex flex-col sm:flex-row gap-2.5">

                <div className="relative">

                  <Filter
                    size={15}
                    className="
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2
                      theme-text-placeholder
                      pointer-events-none
                    "
                  />

                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(
                        e.target.value
                      );
                      setCurrentPage(1);
                    }}
                    className={`
                      w-full
                      sm:w-[170px]
                      h-11
                      pl-9
                      pr-8
                      rounded-xl
                      theme-input
                      theme-text-secondary
                      text-sm
                      ${themeFocus}
                      transition-all
                      cursor-pointer
                      appearance-none
                    `}
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
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    h-11
                    px-4
                    rounded-xl
                    text-sm
                    font-medium
                    theme-text-muted
                    theme-border
                    theme-card
                    hover:text-[var(--color-primary)]
                    hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
                    transition-all
                  "
                >
                  <RotateCcw size={14} />
                  Reset
                </button>

              </div>

            </div>

            {/* FILTER FOOTER */}

            <div
              className={`
                flex
                flex-col
                sm:flex-row
                sm:items-center
                justify-between
                gap-3
                mt-4
                pt-4
                ${themeDivider}
              `}
            >

              <div className="flex items-center gap-2">

                <span
                  className={`
                    flex
                    items-center
                    justify-center
                    w-7
                    h-7
                    rounded-lg
                    ${themePrimarySoft}
                    ${themePrimaryText}
                  `}
                >
                  <Layers3 size={13} />
                </span>

                <p className="text-xs theme-text-muted">

                  Menampilkan{" "}

                  <span className="font-semibold theme-text">
                    {filteredData.length}
                  </span>{" "}

                  role

                </p>

              </div>

              <div className="flex items-center gap-2 text-[11px] theme-text-muted">

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

        <section
          className={`
            theme-card
            ${themeNeutralBorder}
            rounded-2xl
            ${themeCardShadow}
            overflow-hidden
          `}
        >

          {/* TABLE HEADER */}

          <div
            className={`
              flex
              flex-col
              sm:flex-row
              sm:items-center
              justify-between
              gap-3
              px-4
              sm:px-5
              py-4
              border-b
              ${themeDivider}
              ${themeNeutralSurface}
            `}
          >

            <div>

              <div className="flex items-center gap-2">

                <div
                  className={`
                    w-8
                    h-8
                    rounded-lg
                    ${themePrimaryGradient}
                    text-[var(--color-card)]
                    flex
                    items-center
                    justify-center
                    ${themeSmallShadow}
                  `}
                >
                  <Shield
                    size={15}
                    strokeWidth={1.9}
                  />
                </div>

                <div>

                  <h2 className="text-sm font-semibold theme-text">
                    Daftar Role
                  </h2>

                  <p className="text-[10px] theme-text-muted mt-0.5">
                    Role dan kontrol akses
                    sistem
                  </p>

                </div>

              </div>

            </div>

            <div
              className="
                inline-flex
                items-center
                gap-2
                text-[10px]
                font-medium
                theme-text-muted
                theme-card
                theme-border
                rounded-lg
                px-3
                py-2
              "
            >
              <Activity
                size={12}
                className="text-[var(--color-success)]"
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
                  <tr
                    className={`
                      ${themeNeutralSurface}
                      border-b
                      ${themeDivider}
                    `}
                  >

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

                    <th
                      className="
                        hidden
                        xl:table-cell
                        px-5
                        py-3.5
                        text-left
                        text-[10px]
                        font-semibold
                        theme-text-muted
                        uppercase
                        tracking-[0.12em]
                      "
                    >
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

                    <th
                      className="
                        px-5
                        py-3.5
                        text-right
                        text-[10px]
                        font-semibold
                        theme-text-muted
                        uppercase
                        tracking-[0.12em]
                      "
                    >
                      Aksi
                    </th>

                  </tr>
                </thead>

                <tbody
                  className={`
                    divide-y
                    ${themeDivider}
                  `}
                >

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
                            className="
                              group
                              hover:bg-[color-mix(in_srgb,var(--color-primary)_4%,transparent)]
                              transition-colors
                            "
                          >

                            {/* ROLE */}

                            <td className="px-5 py-4">

                              <div className="flex items-center gap-3 min-w-[210px]">

                                <div
                                  className="
                                    relative
                                    w-11
                                    h-11
                                    shrink-0
                                    rounded-xl
                                    bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-primary)_8%,transparent),color-mix(in_srgb,var(--color-info)_8%,transparent))]
                                    border
                                    border-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]
                                    text-[var(--color-primary)]
                                    flex
                                    items-center
                                    justify-center
                                    group-hover:border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)]
                                    group-hover:shadow-[0_2px_10px_color-mix(in_srgb,var(--color-primary)_10%,transparent)]
                                    transition-all
                                  "
                                >
                                  <IconComponent
                                    size={18}
                                    strokeWidth={1.9}
                                  />

                                  <span
                                    className="
                                      absolute
                                      -right-1
                                      -bottom-1
                                      w-3.5
                                      h-3.5
                                      rounded-full
                                      theme-card
                                      flex
                                      items-center
                                      justify-center
                                    "
                                  >
                                    <span
                                      className="
                                        w-2
                                        h-2
                                        rounded-full
                                        bg-[var(--color-primary)]
                                      "
                                    />
                                  </span>

                                </div>

                                <div className="min-w-0">

                                  <p className="text-sm font-semibold theme-text truncate">
                                    {item.nama}
                                  </p>

                                  <p className="text-[11px] theme-text-muted mt-0.5 truncate">
                                    {
                                      item.namaTampilan
                                    }
                                  </p>

                                </div>

                              </div>

                            </td>

                            {/* DESCRIPTION */}

                            <td className="hidden xl:table-cell px-5 py-4 max-w-[300px]">

                              <p className="text-xs theme-text-muted leading-relaxed line-clamp-2">
                                {
                                  item.deskripsi
                                }
                              </p>

                            </td>

                            {/* IZIN */}

                            <td className="px-5 py-4">

                              <div className="inline-flex items-center gap-2">

                                <div
                                  className={`
                                    w-8
                                    h-8
                                    rounded-lg
                                    ${themePrimarySoft}
                                    ${themePrimarySoftBorder}
                                    ${themePrimaryText}
                                    flex
                                    items-center
                                    justify-center
                                  `}
                                >
                                  <Key size={13} />
                                </div>

                                <span className="text-sm font-semibold theme-text-secondary">
                                  {item.izin}
                                </span>

                              </div>

                            </td>

                            {/* USERS */}

                            <td className="px-5 py-4">

                              <div className="inline-flex items-center gap-2">

                                <div
                                  className={`
                                    w-8
                                    h-8
                                    rounded-lg
                                    ${themeInfoSurface}
                                    ${themeInfoBorder}
                                    text-[var(--color-info)]
                                    flex
                                    items-center
                                    justify-center
                                  `}
                                >
                                  <Users size={13} />
                                </div>

                                <span className="text-sm font-semibold theme-text-secondary">
                                  {item.pengguna.toLocaleString(
                                    "id-ID"
                                  )}
                                </span>

                              </div>

                            </td>

                            {/* STATUS */}

                            <td className="px-5 py-4">

                              <span
                                className={`
                                  inline-flex
                                  items-center
                                  gap-1.5
                                  px-2.5
                                  py-1.5
                                  rounded-full
                                  border
                                  text-[10px]
                                  font-semibold
                                  ${style.bg}
                                  ${style.text}
                                  ${style.border}
                                `}
                              >
                                <span
                                  className={`
                                    w-1.5
                                    h-1.5
                                    rounded-full
                                    ${style.dot}
                                  `}
                                />

                                <StatusIcon
                                  size={11}
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
                                  <Eye size={15} />
                                </ActionButton>

                                <ActionButton
                                  title="Edit"
                                  hover="primary"
                                  onClick={() =>
                                    router.push(
                                      `/super-admin/manajemenAkses/edit-role?id=${item.id}`
                                    )
                                  }
                                >
                                  <Edit size={15} />
                                </ActionButton>

                                <ActionButton
                                  title="Hapus"
                                  hover="danger"
                                  onClick={() =>
                                    handleDelete(
                                      item
                                    )
                                  }
                                >
                                  {deletingId ===
                                  item.id ? (
                                    <Loader2
                                      size={15}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Trash2
                                      size={15}
                                    />
                                  )}
                                </ActionButton>

                                <ActionButton
                                  title="Lainnya"
                                  onClick={(e) => {
                                    e.stopPropagation();

                                    setOpenMenuId(
                                      (prev) =>
                                        prev ===
                                        item.id
                                          ? null
                                          : item.id
                                    );
                                  }}
                                >
                                  <MoreHorizontal
                                    size={15}
                                  />
                                </ActionButton>

                                {openMenuId ===
                                  item.id && (
                                  <div
                                    onClick={(e) =>
                                      e.stopPropagation()
                                    }
                                    className="
                                      absolute
                                      right-0
                                      top-10
                                      z-20
                                      w-48
                                      rounded-xl
                                      theme-card
                                      theme-border
                                      shadow-[0_15px_40px_color-mix(in_srgb,var(--color-text)_18%,transparent)]
                                      py-1.5
                                    "
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
                                      className="
                                        w-full
                                        flex
                                        items-center
                                        gap-2.5
                                        px-3.5
                                        py-2.5
                                        text-xs
                                        font-medium
                                        theme-text-secondary
                                        hover:bg-[color-mix(in_srgb,var(--color-primary)_7%,transparent)]
                                        hover:text-[var(--color-primary)]
                                        transition-colors
                                      "
                                    >
                                      <Key size={14} />
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
                                      className="
                                        w-full
                                        flex
                                        items-center
                                        gap-2.5
                                        px-3.5
                                        py-2.5
                                        text-xs
                                        font-medium
                                        theme-text-secondary
                                        hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
                                        hover:text-[var(--color-primary)]
                                        transition-colors
                                      "
                                    >
                                      <Settings2 size={14} />
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

          <div
            className={`
              px-4
              sm:px-5
              py-4
              border-t
              ${themeDivider}
              theme-card
            `}
          >

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">

              <p className="text-xs theme-text-muted">

                Menampilkan{" "}

                <span className="font-semibold theme-text-secondary">
                  {sortedData.length === 0
                    ? 0
                    : (currentPage - 1) *
                        itemsPerPage +
                      1}
                </span>

                {" - "}

                <span className="font-semibold theme-text-secondary">
                  {Math.min(
                    currentPage *
                      itemsPerPage,
                    sortedData.length
                  )}
                </span>

                {" dari "}

                <span className="font-semibold theme-text-secondary">
                  {sortedData.length}
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
                  className="
                    w-9
                    h-9
                    flex
                    items-center
                    justify-center
                    rounded-lg
                    theme-border
                    theme-text-muted
                    hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
                    hover:text-[var(--color-primary)]
                    disabled:opacity-40
                    disabled:cursor-not-allowed
                    transition-colors
                  "
                >
                  <ChevronLeft size={15} />
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
                        className={`
                          w-9
                          h-9
                          rounded-lg
                          text-xs
                          font-semibold
                          transition-all
                          ${
                            currentPage ===
                            page
                              ? `${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow}`
                              : `theme-text-muted hover:bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] hover:text-[var(--color-primary)]`
                          }
                        `}
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
                  className="
                    w-9
                    h-9
                    flex
                    items-center
                    justify-center
                    rounded-lg
                    theme-border
                    theme-text-muted
                    hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
                    hover:text-[var(--color-primary)]
                    disabled:opacity-40
                    disabled:cursor-not-allowed
                    transition-colors
                  "
                >
                  <ChevronRight size={15} />
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

            <div
              className={`
                w-5
                h-5
                rounded-md
                ${themePrimaryGradient}
                text-[var(--color-card)]
                flex
                items-center
                justify-center
              `}
            >
              <Shield size={11} />
            </div>

            <p className="text-[11px] font-medium theme-text-muted">

              SmartSchool

              <span className="theme-text-placeholder mx-1">
                •
              </span>

              Manajemen Akses

            </p>

          </div>

          <p className="text-[11px] theme-text-muted">
            Data diambil dari server
          </p>

        </div>

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
  accent = "primary",
}) {
  const styles = {
    primary: {
      icon: `
        bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]
        text-[var(--color-primary)]
        border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]
      `,
      line: "bg-[var(--color-primary)]",
    },

    success: {
      icon: `
        bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]
        text-[var(--color-success)]
        border-[color-mix(in_srgb,var(--color-success)_20%,transparent)]
      `,
      line: "bg-[var(--color-success)]",
    },

    info: {
      icon: `
        bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)]
        text-[var(--color-info)]
        border-[color-mix(in_srgb,var(--color-info)_20%,transparent)]
      `,
      line: "bg-[var(--color-info)]",
    },

    neutral: {
      icon: `
        bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
        theme-text-secondary
        border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]
      `,
      line:
        "bg-[var(--color-text-muted)]",
    },
  };

  const style =
    styles[accent] ||
    styles.primary;

  return (
    <div
      className="
        group
        relative
        overflow-hidden
        theme-card
        theme-border
        rounded-2xl
        p-4
        sm:p-5
        shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]
        hover:shadow-[0_8px_24px_color-mix(in_srgb,var(--color-text)_8%,transparent)]
        hover:-translate-y-0.5
        transition-all
        duration-300
      "
    >

      <div
        className={`
          absolute
          left-0
          top-0
          w-1
          h-full
          ${style.line}
          opacity-80
        `}
      />

      <div className="flex items-center gap-3">

        <div
          className={`
            w-11
            h-11
            sm:w-12
            sm:h-12
            shrink-0
            rounded-xl
            border
            flex
            items-center
            justify-center
            ${style.icon}
            group-hover:scale-105
            transition-transform
          `}
        >
          <Icon
            size={19}
            strokeWidth={1.9}
          />
        </div>

        <div className="min-w-0">

          <p className="text-[10px] sm:text-[11px] font-semibold theme-text-muted uppercase tracking-[0.12em] truncate">
            {label}
          </p>

          <p className="text-xl sm:text-2xl font-semibold theme-text tracking-tight mt-0.5">
            {value}
          </p>

          <p className="hidden sm:block text-[10px] theme-text-muted mt-0.5 truncate">
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
    <div
      className={`
        divide-y
        ${themeDivider}
      `}
    >

      {data.map((item) => {
        const IconComponent =
          getRoleIcon(item.ikon);

        const style =
          statusStyle[item.status] ||
          statusStyle.nonaktif;

        const StatusIcon =
          style.icon;

        return (
          <div
            key={item.id}
            className="
              p-4
              sm:p-5
              hover:bg-[color-mix(in_srgb,var(--color-primary)_4%,transparent)]
              transition-colors
            "
          >

            <div className="flex items-start gap-3">

              <div
                className="
                  w-11
                  h-11
                  shrink-0
                  rounded-xl
                  bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-primary)_8%,transparent),color-mix(in_srgb,var(--color-info)_8%,transparent))]
                  border
                  border-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]
                  text-[var(--color-primary)]
                  flex
                  items-center
                  justify-center
                "
              >
                <IconComponent
                  size={18}
                  strokeWidth={1.9}
                />
              </div>

              <div className="flex-1 min-w-0">

                <div className="flex items-start justify-between gap-3">

                  <div className="min-w-0">

                    <h3 className="text-sm font-semibold theme-text truncate">
                      {item.nama}
                    </h3>

                    <p className="text-[11px] theme-text-muted mt-0.5 truncate">
                      {item.namaTampilan}
                    </p>

                  </div>

                  <span
                    className={`
                      shrink-0
                      inline-flex
                      items-center
                      gap-1.5
                      px-2
                      py-1.5
                      rounded-full
                      border
                      text-[9px]
                      font-semibold
                      ${style.bg}
                      ${style.text}
                      ${style.border}
                    `}
                  >
                    <span
                      className={`
                        w-1.5
                        h-1.5
                        rounded-full
                        ${style.dot}
                      `}
                    />

                    <StatusIcon size={10} />

                    {item.status ===
                    "aktif"
                      ? "Aktif"
                      : "Nonaktif"}
                  </span>

                </div>

                <p className="text-xs theme-text-muted mt-3 leading-relaxed">
                  {item.deskripsi}
                </p>

                <div className="flex flex-wrap items-center gap-2 mt-3">

                  <span
                    className={`
                      inline-flex
                      items-center
                      gap-1.5
                      px-2.5
                      py-1.5
                      rounded-lg
                      ${themePrimarySoft}
                      ${themePrimarySoftBorder}
                      ${themePrimaryText}
                      text-[10px]
                      font-semibold
                    `}
                  >
                    <Key size={11} />
                    {item.izin} izin
                  </span>

                  <span
                    className={`
                      inline-flex
                      items-center
                      gap-1.5
                      px-2.5
                      py-1.5
                      rounded-lg
                      ${themeInfoSurface}
                      ${themeInfoBorder}
                      text-[var(--color-info)]
                      text-[10px]
                      font-semibold
                    `}
                  >
                    <Users size={11} />

                    {item.pengguna.toLocaleString(
                      "id-ID"
                    )}{" "}
                    pengguna
                  </span>

                </div>

                <div
                  className={`
                    flex
                    items-center
                    gap-1.5
                    mt-4
                    pt-3
                    border-t
                    ${themeDivider}
                  `}
                >

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
                    hover="danger"
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
                    className="
                      ml-auto
                      inline-flex
                      items-center
                      gap-1.5
                      px-3
                      py-1.5
                      rounded-lg
                      text-[10px]
                      font-semibold
                      text-[var(--color-primary)]
                      bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]
                      hover:bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]
                      transition-colors
                    "
                  >
                    Kelola

                    <ArrowUpRight size={11} />
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
      className="
        px-5
        py-3.5
        text-left
        text-[10px]
        font-semibold
        theme-text-muted
        uppercase
        tracking-[0.12em]
        cursor-pointer
        hover:text-[var(--color-primary)]
        select-none
        whitespace-nowrap
        transition-colors
      "
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
  hover = "primary",
}) {
  const hoverMap = {
    primary: `
      hover:bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]
      hover:text-[var(--color-primary)]
      hover:border-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]
    `,

    danger: `
      hover:bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]
      hover:text-[var(--color-warning)]
      hover:border-[color-mix(in_srgb,var(--color-warning)_20%,transparent)]
    `,
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`
        w-8
        h-8
        rounded-lg
        border
        border-transparent
        flex
        items-center
        justify-center
        theme-text-muted
        transition-all
        ${hoverMap[hover]}
      `}
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

      <div
        className={`
          relative
          w-14
          h-14
          rounded-2xl
          ${themePrimarySoft}
          ${themePrimarySoftBorder}
          ${themePrimaryText}
          flex
          items-center
          justify-center
          mb-4
        `}
      >

        <div
          className="
            absolute
            inset-0
            rounded-2xl
            border
            border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]
            animate-ping
            opacity-30
          "
        />

        <Loader2
          size={23}
          className="animate-spin"
        />

      </div>

      <p className="text-sm font-semibold theme-text-secondary">
        Memuat data role...
      </p>

      <p className="text-xs theme-text-muted mt-1.5 text-center">
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

      <div
        className="
          relative
          w-14
          h-14
          rounded-2xl
          bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
          border
          border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]
          theme-text-muted
          flex
          items-center
          justify-center
          mb-4
        "
      >

        <Search size={21} />

        <div
          className="
            absolute
            -right-1
            -bottom-1
            w-5
            h-5
            rounded-full
            theme-card
            border
            border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]
            flex
            items-center
            justify-center
          "
        >
          <XCircle
            size={11}
            className="theme-text-muted"
          />
        </div>

      </div>

      <p className="text-sm font-semibold theme-text-secondary">
        Tidak ada role ditemukan
      </p>

      <p className="text-xs theme-text-muted mt-1.5 text-center max-w-sm leading-relaxed">
        Coba ubah kata kunci pencarian
        atau filter status untuk melihat
        data lainnya.
      </p>

    </div>
  );
}