"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Database,
  Edit3,
  KeyRound,
  Layers3,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
  Activity,
  ChevronRight,
  UserRound,
  XCircle,
} from "lucide-react";

import {
  getPermissions,
  getRoleById,
  getRoles,
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

const themeCard =
  "theme-card";

const themeText =
  "theme-text";

const themeTextSecondary =
  "theme-text-secondary";

const themeTextMuted =
  "theme-text-muted";

/* ============================================================
   STATUS CONFIG
============================================================ */

const STATUS_CONFIG = {
  aktif: {
    text: "text-[var(--color-success)]",
    dot: "bg-[var(--color-success)]",
    bg: themeSuccessSurface,
    border: themeSuccessBorder,
    icon: CheckCircle2,
    label: "Aktif",
  },

  nonaktif: {
    text: "text-[var(--color-warning)]",
    dot: "bg-[var(--color-warning)]",
    bg: themeWarningSurface,
    border: themeWarningBorder,
    icon: XCircle,
    label: "Nonaktif",
  },

  null: {
    text: themeTextMuted,
    dot: "bg-[var(--color-text-muted)]",
    bg: themeNeutralSurface,
    border: themeNeutralBorder,
    icon: Shield,
    label: "Belum Ditentukan",
  },
};

/* ============================================================
   FORMAT NUMBER
============================================================ */

function formatNumber(value) {
  return Number(value || 0).toLocaleString("id-ID");
}

/* ============================================================
   STATUS LABEL
============================================================ */

function getStatusLabel(status) {
  return STATUS_CONFIG[status]?.label || "Belum Ditentukan";
}

/* ============================================================
   PERMISSION ACTION LABEL
============================================================ */

function getPermissionActionLabel(aksi) {
  const labels = {
    view: "Lihat",
    create: "Tambah",
    update: "Ubah",
    edit: "Ubah",
    delete: "Hapus",
  };

  return labels[aksi] || aksi || "-";
}

/* ============================================================
   PERMISSION ACTION STYLE
============================================================ */

function getPermissionActionClass(aksi) {
  const classes = {
    view: `${themeTextSecondary} ${themeNeutralSurface} ${themeNeutralBorder}`,

    create: `${themeSuccessBorder} ${themeSuccessSurface} text-[var(--color-success)]`,

    update: `${themeWarningBorder} ${themeWarningSurface} text-[var(--color-warning)]`,

    edit: `${themeWarningBorder} ${themeWarningSurface} text-[var(--color-warning)]`,

    delete: `${themeDangerBorder} ${themeDangerSurface} ${themeTextSecondary}`,
  };

  return (
    classes[aksi] ||
    `${themeTextSecondary} ${themeNeutralSurface} ${themeNeutralBorder}`
  );
}

/* ============================================================
   PAGE
============================================================ */

export default function DetailRolePage() {
  const params = useParams();
  const router = useRouter();

  const roleId = params?.id;

  const [role, setRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [
    permissionSearchQuery,
    setPermissionSearchQuery,
  ] = useState("");

  /* ==========================================================
     LOAD DATA
  ========================================================== */

  const loadData = async () => {
    if (!roleId) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [
        roleDetail,
        rolesData,
        permissionData,
      ] = await Promise.all([
        getRoleById(roleId),
        getRoles(),
        getPermissions(),
      ]);

      const roleSummary = (
        Array.isArray(rolesData)
          ? rolesData
          : []
      ).find(
        (item) =>
          String(item.id) === String(roleId)
      );

      if (!roleDetail) {
        setRole(null);

        setPermissions(
          Array.isArray(permissionData)
            ? permissionData
            : []
        );

        return;
      }

      const mergedRole = {
        ...roleSummary,
        ...roleDetail,

        _count: {
          ...(roleSummary?._count || {}),
          ...(roleDetail?._count || {}),
        },
      };

      setRole(mergedRole);

      setPermissions(
        Array.isArray(permissionData)
          ? permissionData
          : []
      );
    } catch (err) {
      console.error(
        "Gagal mengambil detail role:",
        err
      );

      setError(
        err?.message ||
          "Gagal mengambil data role dari server."
      );

      setRole(null);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    loadData();
  }, [roleId]);

  /* ==========================================================
     GRANTED PERMISSIONS
  ========================================================== */

  const grantedPermissions = useMemo(() => {
    if (!role?.izin) {
      return [];
    }

    return Array.isArray(role.izin)
      ? role.izin
      : [];
  }, [role]);

  /* ==========================================================
     FILTER PERMISSIONS
  ========================================================== */

  const filteredPermissions = useMemo(() => {
    const query =
      permissionSearchQuery
        .trim()
        .toLowerCase();

    if (!query) {
      return grantedPermissions;
    }

    return grantedPermissions.filter(
      (permission) => {
        const nama =
          permission.nama?.toLowerCase() || "";

        const modul =
          permission.modul?.toLowerCase() || "";

        const aksi =
          permission.aksi?.toLowerCase() || "";

        return (
          nama.includes(query) ||
          modul.includes(query) ||
          aksi.includes(query)
        );
      }
    );
  }, [
    grantedPermissions,
    permissionSearchQuery,
  ]);

  /* ==========================================================
     TOTAL PERMISSION
  ========================================================== */

  const totalGranted =
    role?._count?.peranIzin ??
    grantedPermissions.length;

  const totalPermission =
    permissions.length;

  /* ==========================================================
     TOTAL MODUL
  ========================================================== */

  const totalModul = useMemo(() => {
    return new Set(
      permissions
        .map(
          (permission) =>
            permission.modul
        )
        .filter(Boolean)
    ).size;
  }, [permissions]);

  /* ==========================================================
     MODUL YANG DIGUNAKAN
  ========================================================== */

  const modulDenganAkses = useMemo(() => {
    return new Set(
      grantedPermissions
        .map(
          (permission) =>
            permission.modul
        )
        .filter(Boolean)
    ).size;
  }, [grantedPermissions]);

  /* ==========================================================
     TOTAL PENGGUNA
  ========================================================== */

  const totalPengguna =
    role?._count?.pengguna ?? 0;

  /* ==========================================================
     STATUS
  ========================================================== */

  const statusConfig =
    STATUS_CONFIG[role?.status] ||
    STATUS_CONFIG.null;

  const StatusIcon =
    statusConfig.icon;

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <div className={`${themeCard} ${themeText} min-h-full`}>
        <div className="relative min-h-[70vh] flex items-center justify-center px-5 py-10">

          <div className="text-center">

            <div
              className={`relative w-16 h-16 mx-auto rounded-2xl ${themePrimarySoft} border ${themePrimarySoftBorder} ${themePrimaryText} ${themePrimaryShadow} flex items-center justify-center`}
            >
              <div
                className={`absolute inset-0 rounded-2xl border ${themePrimarySoftBorder} animate-ping opacity-30`}
              />

              <ShieldCheck
                size={27}
                strokeWidth={1.7}
              />
            </div>

            <p className={`mt-5 text-sm font-semibold ${themeText}`}>
              Memuat detail role...
            </p>

            <p className={`mt-1.5 text-xs ${themeTextMuted}`}>
              Mengambil data akses dari server SmartSchool
            </p>

            <div className="flex items-center justify-center gap-1 mt-4">

              <span
                className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-pulse"
              />

              <span
                className="w-1.5 h-1.5 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_75%,transparent)] animate-pulse [animation-delay:150ms]"
              />

              <span
                className="w-1.5 h-1.5 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_50%,transparent)] animate-pulse [animation-delay:300ms]"
              />

            </div>

          </div>

        </div>
      </div>
    );
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  if (error || !role) {
    return (
      <div className="theme-page theme-text min-h-full flex items-center justify-center p-5">

        <div
          className={`relative w-full max-w-md overflow-hidden rounded-2xl ${themeCard} ${themeNeutralBorder} ${themeCardShadow}`}
        >

          <div className={`h-1 ${themePrimaryGradient}`} />

          <div className="p-7 text-center">

            <div
              className={`w-14 h-14 mx-auto rounded-2xl ${themeDangerSurface} ${themeDangerBorder} ${themeTextSecondary} flex items-center justify-center`}
            >
              <AlertCircle
                size={25}
                strokeWidth={1.8}
              />
            </div>

            <h2
              className={`text-lg font-semibold ${themeText} mt-5`}
            >
              {error
                ? "Gagal Memuat Role"
                : "Role Tidak Ditemukan"}
            </h2>

            <p
              className={`text-sm ${themeTextSecondary} mt-2 leading-6`}
            >
              {error ||
                `Role dengan ID "${roleId}" tidak ditemukan.`}
            </p>

            <div className="flex items-center justify-center gap-2 mt-6">

              {error && (
                <button
                  type="button"
                  onClick={loadData}
                  className={`inline-flex items-center gap-2 h-10 px-4 rounded-xl border ${themeNeutralBorder} ${themeCard} text-sm font-medium ${themeTextSecondary} ${themeNeutralHover} hover:text-[var(--color-primary)] transition-all`}
                >
                  <RefreshCw size={14} />
                  Coba Lagi
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/super-admin/manajemenAkses"
                  )
                }
                className={`inline-flex items-center gap-2 h-10 px-4 rounded-xl ${themePrimaryGradient} text-[var(--color-card)] text-sm font-semibold ${themePrimaryShadow} hover:-translate-y-0.5 transition-all`}
              >
                Kembali
              </button>

            </div>

          </div>

        </div>
      </div>
    );
  }

  /* ==========================================================
     MAIN RENDER
  ========================================================== */

  return (
    <div className="theme-page theme-text min-h-full">

      <main className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8">

        <div className="mx-auto w-full max-w-[1600px]">

          {/* ==================================================
              BREADCRUMB
          ================================================== */}

          <div
            className={`flex items-center gap-2 text-xs ${themeTextMuted} mb-5`}
          >

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/super-admin/manajemenAkses"
                )
              }
              className="hover:text-[var(--color-primary)] transition-colors"
            >
              Manajemen Akses
            </button>

            <ChevronRight size={13} />

            <span
              className={`font-medium ${themeTextSecondary}`}
            >
              Detail Role
            </span>

          </div>

          {/* ==================================================
              HERO
          ================================================== */}

          <section
            className={`relative overflow-hidden rounded-[24px] ${themePrimaryGradient} ${themePrimaryShadow} mb-6`}
          >

            {/* Glow */}

            <div
              className="absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full bg-[color-mix(in_srgb,var(--color-info)_18%,transparent)] blur-3xl pointer-events-none"
            />

            <div
              className="absolute -bottom-40 left-1/3 w-[420px] h-[420px] rounded-full bg-[color-mix(in_srgb,var(--color-card)_8%,transparent)] blur-3xl pointer-events-none"
            />

            {/* Grid */}

            <div
              className="absolute inset-0 opacity-[0.045] pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(color-mix(in srgb,var(--color-card) 80%,transparent) 1px, transparent 1px), linear-gradient(90deg,color-mix(in srgb,var(--color-card) 80%,transparent) 1px, transparent 1px)",
                backgroundSize: "36px 36px",
              }}
            />

            <div className="relative p-5 sm:p-7 lg:p-8">

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                {/* ROLE */}

                <div className="flex items-start gap-4 min-w-0">

                  <div
                    className="hidden sm:flex relative w-16 h-16 shrink-0 rounded-2xl bg-[color-mix(in_srgb,var(--color-card)_10%,transparent)] border border-[color-mix(in_srgb,var(--color-card)_20%,transparent)] text-[color-mix(in_srgb,var(--color-card)_82%,transparent)] items-center justify-center"
                  >

                    <ShieldCheck
                      size={30}
                      strokeWidth={1.6}
                    />

                    <span className="absolute -right-1.5 -bottom-1.5 w-5 h-5 rounded-full bg-[color-mix(in_srgb,var(--color-text)_65%,var(--color-primary))] flex items-center justify-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-success)]" />
                    </span>

                  </div>

                  <div className="min-w-0">

                    <div className="flex flex-wrap items-center gap-2 mb-3">

                      <span
                        className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--color-card)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_10%,transparent)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color-mix(in_srgb,var(--color-card)_84%,transparent)]"
                      >
                        <Lock size={11} />
                        Role Access
                      </span>

                      <span
                        className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--color-card)_10%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_5%,transparent)] px-3 py-1.5 text-[10px] font-medium text-[color-mix(in_srgb,var(--color-card)_72%,transparent)]"
                      >
                        <Activity size={11} />
                        SmartSchool
                      </span>

                    </div>

                    <div className="flex flex-wrap items-center gap-3">

                      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--color-card)]">
                        {role.nama || "-"}
                      </h1>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${statusConfig.bg} ${statusConfig.border} ${statusConfig.text}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}
                        />

                        {statusConfig.label}
                      </span>

                    </div>

                    {role.namaTampilan && (
                      <p className="text-sm text-[color-mix(in_srgb,var(--color-card)_78%,transparent)] mt-1">
                        {role.namaTampilan}
                      </p>
                    )}

                    <p className="text-sm leading-6 text-[color-mix(in_srgb,var(--color-card)_72%,transparent)] mt-3 max-w-2xl">
                      {role.deskripsi ||
                        "Tidak ada deskripsi role."}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 mt-4">

                      <div className="flex items-center gap-2 text-xs text-[color-mix(in_srgb,var(--color-card)_72%,transparent)]">
                        <Users
                          size={14}
                          className="text-[color-mix(in_srgb,var(--color-card)_82%,transparent)]"
                        />

                        <span>
                          {formatNumber(totalPengguna)}{" "}
                          pengguna
                        </span>
                      </div>

                      <div className="hidden sm:block w-1 h-1 rounded-full bg-[color-mix(in_srgb,var(--color-card)_30%,transparent)]" />

                      <div className="flex items-center gap-2 text-xs text-[color-mix(in_srgb,var(--color-card)_72%,transparent)]">
                        <KeyRound
                          size={14}
                          className="text-[color-mix(in_srgb,var(--color-card)_82%,transparent)]"
                        />

                        <span>
                          {formatNumber(totalGranted)}{" "}
                          izin aktif
                        </span>
                      </div>

                      {role.sekolah && (
                        <>
                          <div className="hidden sm:block w-1 h-1 rounded-full bg-[color-mix(in_srgb,var(--color-card)_30%,transparent)]" />

                          <div className="flex items-center gap-2 text-xs text-[color-mix(in_srgb,var(--color-card)_72%,transparent)]">
                            <Database
                              size={14}
                              className="text-[color-mix(in_srgb,var(--color-card)_82%,transparent)]"
                            />

                            <span>
                              {role.sekolah.nama}
                            </span>
                          </div>
                        </>
                      )}

                    </div>

                  </div>

                </div>

                {/* ACTIONS */}

                <div className="flex flex-col sm:flex-row gap-2.5 lg:shrink-0">

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/super-admin/manajemenAkses"
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl border border-[color-mix(in_srgb,var(--color-card)_12%,transparent)] bg-[color-mix(in_srgb,var(--color-card)_6%,transparent)] text-[color-mix(in_srgb,var(--color-card)_86%,transparent)] text-sm font-medium hover:bg-[color-mix(in_srgb,var(--color-card)_12%,transparent)] hover:border-[color-mix(in_srgb,var(--color-card)_22%,transparent)] transition-all"
                  >
                    <ArrowLeft size={15} />
                    Kembali
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/super-admin/manajemenAkses/edit-role?id=${role.id}`
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-[var(--color-card)] text-[var(--color-primary)] text-sm font-semibold shadow-lg hover:-translate-y-0.5 transition-all"
                  >
                    <Edit3 size={15} />
                    Edit Role
                  </button>

                </div>

              </div>

            </div>

          </section>

          {/* ==================================================
              ACCESS OVERVIEW
          ================================================== */}

          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">

            <OverviewCard
              icon={KeyRound}
              label="Akses Diberikan"
              value={`${formatNumber(totalGranted)}/${formatNumber(
                totalPermission
              )}`}
              description="Permission role"
              accent="primary"
            />

            <OverviewCard
              icon={Layers3}
              label="Modul Terjangkau"
              value={`${modulDenganAkses}/${totalModul}`}
              description="Modul sistem"
              accent="info"
            />

            <OverviewCard
              icon={Users}
              label="Pengguna Terkait"
              value={formatNumber(totalPengguna)}
              description="Pengguna role"
              accent="success"
            />

            <OverviewCard
              icon={ShieldCheck}
              label="Status Role"
              value={statusConfig.label}
              description="Status akses"
              accent="neutral"
            />

          </section>

          {/* ==================================================
              PERMISSION SECTION
          ================================================== */}

          <section
            className={`relative overflow-hidden rounded-2xl ${themeCard} ${themeNeutralBorder} ${themeCardShadow} mb-6`}
          >

            <div className={`h-1 ${themePrimaryGradient}`} />

            {/* HEADER */}

            <div className={`p-4 sm:p-5 border-b ${themeDivider}`}>

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                <div className="flex items-start gap-3">

                  <div
                    className={`w-10 h-10 shrink-0 rounded-xl ${themePrimarySoft} ${themePrimarySoftBorder} ${themePrimaryText} flex items-center justify-center`}
                  >
                    <KeyRound
                      size={18}
                      strokeWidth={1.8}
                    />
                  </div>

                  <div>

                    <div className="flex flex-wrap items-center gap-2">

                      <h2
                        className={`text-sm font-semibold ${themeText}`}
                      >
                        Daftar Izin Role
                      </h2>

                      <span
                        className={`px-2 py-0.5 rounded-full ${themePrimarySoft} ${themePrimarySoftBorder} text-[9px] font-semibold ${themePrimaryText}`}
                      >
                        {formatNumber(totalGranted)} ACCESS
                      </span>

                    </div>

                    <p
                      className={`text-xs ${themeTextSecondary} mt-1`}
                    >
                      Permission yang diberikan kepada role ini.
                    </p>

                  </div>

                </div>

                {/* SEARCH */}

                <div className="relative w-full lg:w-72">

                  <Search
                    size={15}
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${themeTextMuted}`}
                  />

                  <input
                    type="text"
                    placeholder="Cari izin, modul, atau aksi..."
                    value={permissionSearchQuery}
                    onChange={(e) =>
                      setPermissionSearchQuery(
                        e.target.value
                      )
                    }
                    className={`w-full h-10 pl-10 pr-4 rounded-xl ${themeNeutralSurface} ${themeNeutralBorder} ${themeText} placeholder:theme-text-placeholder text-sm focus:outline-none ${themeFocus} transition-all`}
                  />

                </div>

              </div>

            </div>

            {/* PERMISSION CONTENT */}

            {filteredPermissions.length === 0 ? (
              <div className="py-16 px-5 text-center">

                <div
                  className={`relative w-14 h-14 mx-auto rounded-2xl ${themeNeutralSurface} ${themeNeutralBorder} ${themeTextMuted} flex items-center justify-center`}
                >

                  <Search size={21} />

                  <div
                    className={`absolute -right-1 -bottom-1 w-5 h-5 rounded-full ${themeCard} border ${themeNeutralBorder} flex items-center justify-center`}
                  >
                    <XCircle
                      size={11}
                      className={themeTextMuted}
                    />
                  </div>

                </div>

                <p
                  className={`text-sm font-semibold ${themeText} mt-4`}
                >
                  Tidak ada izin ditemukan
                </p>

                <p
                  className={`text-xs ${themeTextMuted} mt-1.5 max-w-sm mx-auto`}
                >
                  Tidak ada permission yang sesuai dengan
                  pencarian saat ini.
                </p>

              </div>
            ) : (
              <>
                {/* DESKTOP */}

                <div className="hidden md:block overflow-x-auto">

                  <table className="w-full min-w-[720px]">

                    <thead>
                      <tr
                        className={`${themeNeutralSurface} border-b ${themeDivider}`}
                      >

                        <th
                          className={`w-16 px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.12em] ${themeTextMuted}`}
                        >
                          #
                        </th>

                        <th
                          className={`px-3 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.12em] ${themeTextMuted}`}
                        >
                          Nama Izin
                        </th>

                        <th
                          className={`px-3 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.12em] ${themeTextMuted}`}
                        >
                          Modul
                        </th>

                        <th
                          className={`px-3 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.12em] ${themeTextMuted}`}
                        >
                          Tipe Akses
                        </th>

                        <th
                          className={`px-5 py-3.5 text-right text-[10px] font-semibold uppercase tracking-[0.12em] ${themeTextMuted}`}
                        >
                          Status
                        </th>

                      </tr>
                    </thead>

                    <tbody>

                      {filteredPermissions.map(
                        (permission, index) => (
                          <tr
                            key={permission.id}
                            className={`group border-b ${themeDivider} hover:bg-[color-mix(in_srgb,var(--color-primary)_4%,transparent)] transition-colors`}
                          >

                            {/* NUMBER */}

                            <td className="px-5 py-4">

                              <span
                                className={`inline-flex w-7 h-7 items-center justify-center rounded-lg ${themeNeutralSurface} text-[10px] font-semibold ${themeTextMuted} group-hover:${themePrimaryText} transition-colors`}
                              >
                                {String(index + 1).padStart(
                                  2,
                                  "0"
                                )}
                              </span>

                            </td>

                            {/* NAME */}

                            <td className="px-3 py-4">

                              <div className="flex items-center gap-3">

                                <div
                                  className={`w-9 h-9 shrink-0 rounded-lg ${themePrimarySoft} ${themePrimarySoftBorder} ${themePrimaryText} flex items-center justify-center`}
                                >
                                  <KeyRound
                                    size={15}
                                    strokeWidth={1.8}
                                  />
                                </div>

                                <div className="min-w-0">

                                  <p
                                    className={`text-sm font-semibold ${themeText} truncate`}
                                  >
                                    {permission.nama || "-"}
                                  </p>

                                  <p
                                    className={`text-[10px] ${themeTextMuted} mt-0.5 truncate max-w-[280px]`}
                                  >
                                    ID: {permission.id}
                                  </p>

                                </div>

                              </div>

                            </td>

                            {/* MODUL */}

                            <td className="px-3 py-4">

                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${themeNeutralSurface} ${themeNeutralBorder} text-xs font-medium ${themeTextSecondary}`}
                              >
                                <Layers3
                                  size={12}
                                  className={themeTextMuted}
                                />

                                {permission.modul || "-"}
                              </span>

                            </td>

                            {/* ACTION */}

                            <td className="px-3 py-4">

                              <span
                                className={`inline-flex items-center px-2.5 py-1.5 rounded-lg border text-[10px] font-semibold ${getPermissionActionClass(
                                  permission.aksi
                                )}`}
                              >
                                {getPermissionActionLabel(
                                  permission.aksi
                                )}
                              </span>

                            </td>

                            {/* STATUS */}

                            <td className="px-5 py-4 text-right">

                              <span
                                className={`inline-flex items-center gap-1.5 text-[10px] font-semibold text-[var(--color-success)]`}
                              >

                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />

                                Aktif

                              </span>

                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                  </table>

                </div>

                {/* MOBILE */}

                <div>

                  <div className="md:hidden">

                    {filteredPermissions.map(
                      (permission, index) => (
                        <div
                          key={permission.id}
                          className={`p-4 border-b ${themeDivider}`}
                        >

                          <div className="flex items-start gap-3">

                            <div
                              className={`w-9 h-9 shrink-0 rounded-lg ${themePrimarySoft} ${themePrimarySoftBorder} ${themePrimaryText} flex items-center justify-center`}
                            >
                              <KeyRound size={15} />
                            </div>

                            <div className="flex-1 min-w-0">

                              <div className="flex items-start justify-between gap-3">

                                <div className="min-w-0">

                                  <p
                                    className={`text-sm font-semibold ${themeText} truncate`}
                                  >
                                    {permission.nama || "-"}
                                  </p>

                                  <p
                                    className={`text-[10px] ${themeTextMuted} mt-0.5`}
                                  >
                                    #{index + 1}
                                  </p>

                                </div>

                                <span className="shrink-0 w-2 h-2 rounded-full bg-[var(--color-success)] mt-1.5" />

                              </div>

                              <div className="flex flex-wrap gap-2 mt-3">

                                <span
                                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg ${themeNeutralSurface} ${themeNeutralBorder} text-[10px] ${themeTextSecondary}`}
                                >
                                  <Layers3 size={11} />

                                  {permission.modul || "-"}
                                </span>

                                <span
                                  className={`px-2 py-1 rounded-lg border text-[10px] font-semibold ${getPermissionActionClass(
                                    permission.aksi
                                  )}`}
                                >
                                  {getPermissionActionLabel(
                                    permission.aksi
                                  )}
                                </span>

                              </div>

                            </div>

                          </div>

                        </div>
                      )
                    )}

                  </div>

                </div>
              </>
            )}

            {/* FOOTER */}

            <div
              className={`px-4 sm:px-5 py-3.5 border-t ${themeDivider} ${themeNeutralSurface}`}
            >

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                <p
                  className={`text-[11px] ${themeTextMuted}`}
                >
                  Menampilkan{" "}
                  <span className={`font-semibold ${themeTextSecondary}`}>
                    {filteredPermissions.length}
                  </span>{" "}
                  dari{" "}
                  <span className={`font-semibold ${themeTextSecondary}`}>
                    {totalGranted}
                  </span>{" "}
                  izin role.
                </p>

                <div
                  className={`flex items-center gap-1.5 text-[10px] ${themeTextMuted}`}
                >
                  <ShieldCheck
                    size={12}
                    className="text-[var(--color-success)]"
                  />
                  Akses telah terdaftar
                </div>

              </div>

            </div>

          </section>

          {/* ==================================================
              TWO COLUMN INFORMATION
          ================================================== */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">

            {/* USERS */}

            <section
              className={`relative overflow-hidden rounded-2xl ${themeCard} ${themeNeutralBorder} ${themeCardShadow}`}
            >

              <div className={`absolute top-0 left-0 w-full h-1 ${themePrimaryGradient}`} />

              <div className="p-5">

                <div className="flex items-start justify-between gap-4">

                  <div className="flex items-start gap-3">

                    <div
                      className={`w-10 h-10 rounded-xl ${themeInfoSurface} ${themeInfoBorder} text-[var(--color-info)] flex items-center justify-center`}
                    >
                      <Users size={18} />
                    </div>

                    <div>

                      <h2
                        className={`text-sm font-semibold ${themeText}`}
                      >
                        Pengguna Role
                      </h2>

                      <p
                        className={`text-xs ${themeTextSecondary} mt-1`}
                      >
                        Pengguna yang terkait dengan role ini.
                      </p>

                    </div>

                  </div>

                  <div className="text-right">

                    <p
                      className={`text-2xl font-semibold ${themeText} tracking-tight`}
                    >
                      {formatNumber(totalPengguna)}
                    </p>

                    <p className={`text-[10px] ${themeTextMuted}`}>
                      pengguna
                    </p>

                  </div>

                </div>

                <div
                  className={`mt-6 p-4 rounded-xl ${themeNeutralSurface} ${themeNeutralBorder}`}
                >

                  <div className="flex items-start gap-3">

                    <div
                      className={`w-8 h-8 rounded-lg ${themeCard} ${themeNeutralBorder} flex items-center justify-center ${themeTextSecondary} shrink-0`}
                    >
                      <UserRound size={14} />
                    </div>

                    <div>

                      <p
                        className={`text-xs font-semibold ${themeText}`}
                      >
                        Data pengguna
                      </p>

                      <p
                        className={`text-[11px] ${themeTextSecondary} mt-1 leading-5`}
                      >
                        Backend saat ini menyediakan jumlah
                        pengguna berdasarkan role, tetapi belum
                        menyediakan endpoint daftar detail pengguna
                        untuk halaman ini.
                      </p>

                    </div>

                  </div>

                </div>

                <div
                  className={`flex items-center gap-2 mt-4 text-[10px] ${themeTextMuted}`}
                >
                  <Database
                    size={12}
                    className="text-[var(--color-info)]"
                  />
                  Jumlah berasal dari data backend
                </div>

              </div>

            </section>

            {/* SECURITY STATUS */}

            <section
              className={`relative overflow-hidden rounded-2xl ${themeCard} ${themeNeutralBorder} ${themeCardShadow}`}
            >

              <div
                className={`absolute top-0 left-0 w-full h-1 ${themePrimaryGradient}`}
              />

              <div className="p-5">

                <div className="flex items-start gap-3">

                  <div
                    className={`w-10 h-10 rounded-xl ${themeSuccessSurface} ${themeSuccessBorder} text-[var(--color-success)] flex items-center justify-center`}
                  >
                    <ShieldCheck size={18} />
                  </div>

                  <div>

                    <h2
                      className={`text-sm font-semibold ${themeText}`}
                    >
                      Ringkasan Keamanan
                    </h2>

                    <p
                      className={`text-xs ${themeTextSecondary} mt-1`}
                    >
                      Kondisi akses role saat ini.
                    </p>

                  </div>

                </div>

                <div className="space-y-3 mt-6">

                  <SecurityRow
                    label="Status Role"
                    value={statusConfig.label}
                    icon={<StatusIcon size={14} />}
                    active={role.status === "aktif"}
                  />

                  <SecurityRow
                    label="Permission"
                    value={`${formatNumber(totalGranted)} akses`}
                    icon={<KeyRound size={14} />}
                    active={totalGranted > 0}
                  />

                  <SecurityRow
                    label="Modul"
                    value={`${modulDenganAkses} modul`}
                    icon={<Layers3 size={14} />}
                    active={modulDenganAkses > 0}
                  />

                  <SecurityRow
                    label="Pengguna"
                    value={`${formatNumber(totalPengguna)} pengguna`}
                    icon={<Users size={14} />}
                    active={totalPengguna > 0}
                  />

                </div>

              </div>

            </section>

          </div>

          {/* ==================================================
              LOG AKTIVITAS
          ================================================== */}

          <section
            className={`relative overflow-hidden rounded-2xl ${themeCard} ${themeNeutralBorder} ${themeCardShadow} mb-6`}
          >

            <div className="p-5">

              <div className="flex items-start gap-3">

                <div
                  className={`w-10 h-10 rounded-xl ${themeNeutralSurface} ${themeNeutralBorder} ${themeTextSecondary} flex items-center justify-center`}
                >
                  <Activity size={18} />
                </div>

                <div className="flex-1">

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                    <div>

                      <h2
                        className={`text-sm font-semibold ${themeText}`}
                      >
                        Log Aktivitas
                      </h2>

                      <p
                        className={`text-xs ${themeTextSecondary} mt-1`}
                      >
                        Informasi aktivitas terkait role.
                      </p>

                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 self-start px-2.5 py-1.5 rounded-lg ${themeNeutralSurface} ${themeNeutralBorder} text-[10px] font-medium ${themeTextMuted}`}
                    >
                      <Database size={11} />
                      Belum tersedia
                    </span>

                  </div>

                  <div
                    className={`mt-4 rounded-xl border border-dashed ${themeNeutralBorder} ${themeNeutralSurface} p-4`}
                  >

                    <div className="flex items-start gap-3">

                      <Sparkles
                        size={15}
                        className={`${themePrimaryText} mt-0.5 shrink-0`}
                      />

                      <p
                        className={`text-xs ${themeTextSecondary} leading-5`}
                      >
                        Log aktivitas belum ditampilkan karena backend
                        saat ini belum menyediakan endpoint audit/log
                        aktivitas untuk halaman role ini.
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* ==================================================
              BOTTOM NAVIGATION
          ================================================== */}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4">

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/super-admin/manajemenAkses"
                )
              }
              className={`inline-flex items-center gap-2 text-xs font-medium ${themeTextMuted} hover:text-[var(--color-primary)] transition-colors`}
            >
              <ArrowLeft size={13} />
              Kembali ke Manajemen Akses
            </button>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/super-admin/manajemenAkses/edit-role?id=${role.id}`
                )
              }
              className={`inline-flex items-center gap-2 text-xs font-semibold ${themePrimaryText} hover:opacity-80 transition-colors`}
            >
              Kelola Role
              <ArrowUpRight size={13} />
            </button>

          </div>

          {/* ==================================================
              FOOTER
          ================================================== */}

          <div
            className={`border-t ${themeDivider} pt-4 pb-2 flex flex-col sm:flex-row items-center justify-between gap-2`}
          >

            <div className="flex items-center gap-2">

              <div
                className={`w-5 h-5 rounded-md ${themePrimaryGradient} text-[var(--color-card)] flex items-center justify-center`}
              >
                <Shield size={11} />
              </div>

              <span
                className={`text-[10px] font-medium ${themeTextMuted}`}
              >
                SmartSchool
                <span className="mx-1">•</span>
                Manajemen Akses
              </span>

            </div>

            <span className={`text-[10px] ${themeTextMuted}`}>
              Sistem Manajemen Sekolah
            </span>

          </div>

        </div>

      </main>

    </div>
  );
}

/* ============================================================
   OVERVIEW CARD
============================================================ */

function OverviewCard({
  icon: Icon,
  label,
  value,
  description,
  accent = "primary",
}) {
  const styles = {
    primary: {
      icon: `${themePrimarySoft} ${themePrimarySoftBorder} ${themePrimaryText}`,
      line: "bg-[var(--color-primary)]",
    },

    info: {
      icon: `${themeInfoSurface} ${themeInfoBorder} text-[var(--color-info)]`,
      line: "bg-[var(--color-info)]",
    },

    success: {
      icon: `${themeSuccessSurface} ${themeSuccessBorder} text-[var(--color-success)]`,
      line: "bg-[var(--color-success)]",
    },

    neutral: {
      icon: `${themeNeutralSurface} ${themeNeutralBorder} ${themeTextSecondary}`,
      line: "bg-[var(--color-text-muted)]",
    },
  };

  const style =
    styles[accent] || styles.primary;

  return (
    <div
      className={`group relative overflow-hidden ${themeCard} ${themeNeutralBorder} rounded-2xl p-4 sm:p-5 ${themeCardShadow} hover:-translate-y-0.5 hover:shadow-[0_10px_30px_color-mix(in_srgb,var(--color-text)_8%,transparent)] transition-all duration-300`}
    >

      <div
        className={`absolute left-0 top-0 w-1 h-full ${style.line}`}
      />

      <div className="flex items-center gap-3">

        <div
          className={`w-11 h-11 shrink-0 rounded-xl border flex items-center justify-center ${style.icon} group-hover:scale-105 transition-transform`}
        >
          <Icon
            size={18}
            strokeWidth={1.8}
          />
        </div>

        <div className="min-w-0">

          <p
            className={`text-[10px] font-semibold uppercase tracking-[0.1em] ${themeTextMuted} truncate`}
          >
            {label}
          </p>

          <p
            className={`text-lg sm:text-xl font-semibold ${themeText} tracking-tight mt-0.5 truncate`}
          >
            {value}
          </p>

          <p
            className={`hidden sm:block text-[10px] ${themeTextMuted} mt-0.5`}
          >
            {description}
          </p>

        </div>

      </div>

    </div>
  );
}

/* ============================================================
   SECURITY ROW
============================================================ */

function SecurityRow({
  label,
  value,
  icon,
  active,
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl ${themeNeutralSurface} ${themeNeutralBorder}`}
    >

      <div className="flex items-center gap-3 min-w-0">

        <div
          className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${
            active
              ? `${themeCard} ${themeNeutralBorder} ${themePrimaryText}`
              : `${themeNeutralSurface} ${themeTextMuted}`
          }`}
        >
          {icon}
        </div>

        <span
          className={`text-xs font-medium ${themeTextSecondary} truncate`}
        >
          {label}
        </span>

      </div>

      <div className="flex items-center gap-2 shrink-0">

        <span
          className={`text-xs font-semibold ${themeText}`}
        >
          {value}
        </span>

        <span
          className={`w-1.5 h-1.5 rounded-full ${
            active
              ? "bg-[var(--color-success)]"
              : "bg-[var(--color-text-muted)]"
          }`}
        />

      </div>

    </div>
  );
}