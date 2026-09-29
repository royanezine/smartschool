"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Database,
  Edit3,
  Eye,
  KeyRound,
  Layers3,
  Lock,
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
} from "../../../../services/role.service";

/* ============================================================
   STATUS CONFIG
============================================================ */

const STATUS_CONFIG = {
  aktif: {
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: CheckCircle2,
    label: "Aktif",
  },

  nonaktif: {
    text: "text-rose-700",
    dot: "bg-rose-500",
    bg: "bg-rose-50",
    border: "border-rose-200",
    icon: XCircle,
    label: "Nonaktif",
  },

  null: {
    text: "text-slate-500",
    dot: "bg-slate-400",
    bg: "bg-slate-50",
    border: "border-slate-200",
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
  return (
    STATUS_CONFIG[status]?.label ||
    "Belum Ditentukan"
  );
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
    view:
      "text-slate-600 bg-slate-100 border-slate-200",

    create:
      "text-emerald-700 bg-emerald-50 border-emerald-200",

    update:
      "text-amber-700 bg-amber-50 border-amber-200",

    edit:
      "text-amber-700 bg-amber-50 border-amber-200",

    delete:
      "text-rose-700 bg-rose-50 border-rose-200",
  };

  return (
    classes[aksi] ||
    "text-slate-600 bg-slate-100 border-slate-200"
  );
}

/* ============================================================
   PAGE
============================================================ */

export default function DetailRolePage() {
  const params = useParams();
  const router = useRouter();

  const roleId = params?.id;

  const [activeMenu, setActiveMenu] =
    useState("manajemen-akses");

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [role, setRole] = useState(null);

  const [permissions, setPermissions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    permissionSearchQuery,
    setPermissionSearchQuery,
  ] = useState("");

  /* ==========================================================
     NOTIFICATION
  ========================================================== */

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
  ];

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
          String(item.id) ===
          String(roleId)
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
          permission.nama
            ?.toLowerCase() || "";

        const modul =
          permission.modul
            ?.toLowerCase() || "";

        const aksi =
          permission.aksi
            ?.toLowerCase() || "";

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
      <div className="flex min-h-screen bg-[#F5F8FC]">

        <Sidebar
          active={activeMenu}
          setActive={setActiveMenu}
          collapsed={!sidebarOpen}
          setCollapsed={() =>
            setSidebarOpen(
              (prev) => !prev
            )
          }
        />

        <div className="flex-1 min-w-0 flex flex-col">

          <Header
            toggleSidebar={() =>
              setSidebarOpen(
                (prev) => !prev
              )
            }
            notifications={
              notifications
            }
            user={{
              name: "Sarah",
              email:
                "sarah@smartschool.com",
              avatar: "SA",
            }}
          />

          <main className="flex-1 relative overflow-hidden">

            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-32 right-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-indigo-100/30 rounded-full blur-3xl" />
            </div>

            <div className="relative min-h-[70vh] flex items-center justify-center p-6">

              <div className="text-center">

                <div className="relative w-16 h-16 mx-auto rounded-2xl bg-white border border-blue-100 shadow-lg flex items-center justify-center text-blue-600">

                  <div className="absolute inset-0 rounded-2xl border border-blue-200 animate-ping opacity-20" />

                  <ShieldCheck
                    size={27}
                    strokeWidth={1.7}
                  />
                </div>

                <p className="mt-5 text-sm font-semibold text-slate-700">
                  Memuat detail role...
                </p>

                <p className="mt-1.5 text-xs text-slate-400">
                  Mengambil data akses dari server
                  SmartSchool
                </p>

                <div className="flex items-center justify-center gap-1 mt-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse [animation-delay:300ms]" />
                </div>

              </div>

            </div>

          </main>
        </div>
      </div>
    );
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  if (error || !role) {
    return (
      <div className="flex min-h-screen bg-[#F5F8FC]">

        <Sidebar
          active={activeMenu}
          setActive={setActiveMenu}
          collapsed={!sidebarOpen}
          setCollapsed={() =>
            setSidebarOpen(
              (prev) => !prev
            )
          }
        />

        <div className="flex-1 min-w-0 flex flex-col">

          <Header
            toggleSidebar={() =>
              setSidebarOpen(
                (prev) => !prev
              )
            }
            notifications={
              notifications
            }
            user={{
              name: "Sarah",
              email:
                "sarah@smartschool.com",
              avatar: "SA",
            }}
          />

          <main className="flex-1 flex items-center justify-center p-5">

            <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm">

              <div className="h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />

              <div className="p-7 text-center">

                <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center">
                  <AlertCircle
                    size={25}
                    strokeWidth={1.8}
                  />
                </div>

                <h2 className="text-lg font-semibold text-slate-800 mt-5">
                  {error
                    ? "Gagal Memuat Role"
                    : "Role Tidak Ditemukan"}
                </h2>

                <p className="text-sm text-slate-500 mt-2 leading-6">
                  {error ||
                    `Role dengan ID "${roleId}" tidak ditemukan.`}
                </p>

                <div className="flex items-center justify-center gap-2 mt-6">

                  {error && (
                    <button
                      type="button"
                      onClick={loadData}
                      className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all"
                    >
                      <RefreshCw
                        size={14}
                      />
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
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-all"
                  >
                    Kembali
                  </button>

                </div>

              </div>

            </div>

          </main>
        </div>
      </div>
    );
  }

  /* ==========================================================
     MAIN RENDER
  ========================================================== */

  return (
    <div className="flex min-h-screen bg-[#F5F8FC]">

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar
        active={activeMenu}
        setActive={setActiveMenu}
        collapsed={!sidebarOpen}
        setCollapsed={() =>
          setSidebarOpen(
            (prev) => !prev
          )
        }
      />

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <div className="flex-1 min-w-0 flex flex-col">

        <Header
          toggleSidebar={() =>
            setSidebarOpen(
              (prev) => !prev
            )
          }
          notifications={
            notifications
          }
          user={{
            name: "Sarah",
            email:
              "sarah@smartschool.com",
            avatar: "SA",
          }}
        />

        <main className="flex-1">

          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">

            {/* ==================================================
                BREADCRUMB
            ================================================== */}

            <div className="flex items-center gap-2 text-xs text-slate-400 mb-5">

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/super-admin/manajemenAkses"
                  )
                }
                className="hover:text-blue-600 transition-colors"
              >
                Manajemen Akses
              </button>

              <ChevronRight
                size={13}
              />

              <span className="text-slate-600 font-medium">
                Detail Role
              </span>

            </div>

            {/* ==================================================
                PREMIUM HERO
            ================================================== */}

            <section className="relative overflow-hidden rounded-[24px] bg-[#0F172A] shadow-[0_20px_55px_-25px_rgba(15,23,42,0.55)] mb-6">

              {/* Glow */}

              <div className="absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />

              <div className="absolute -bottom-40 left-1/3 w-[420px] h-[420px] rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

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

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                  {/* ROLE */}

                  <div className="flex items-start gap-4 min-w-0">

                    <div className="hidden sm:flex relative w-16 h-16 shrink-0 rounded-2xl bg-blue-500/10 border border-blue-400/20 text-blue-300 items-center justify-center">

                      <ShieldCheck
                        size={30}
                        strokeWidth={1.6}
                      />

                      <span className="absolute -right-1.5 -bottom-1.5 w-5 h-5 rounded-full bg-[#0F172A] flex items-center justify-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      </span>

                    </div>

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-2 mb-3">

                        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-300">
                          <Lock size={11} />
                          Role Access
                        </span>

                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-medium text-slate-300">
                          <Activity
                            size={11}
                          />
                          SmartSchool
                        </span>

                      </div>

                      <div className="flex flex-wrap items-center gap-3">

                        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                          {role.nama ||
                            "-"}
                        </h1>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                            role.status ===
                            "aktif"
                              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                              : "border-rose-400/20 bg-rose-400/10 text-rose-300"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              role.status ===
                              "aktif"
                                ? "bg-emerald-400"
                                : "bg-rose-400"
                            }`}
                          />

                          {statusConfig.label}
                        </span>

                      </div>

                      {role.namaTampilan && (
                        <p className="text-sm text-blue-300/80 mt-1">
                          {role.namaTampilan}
                        </p>
                      )}

                      <p className="text-sm leading-6 text-slate-300 mt-3 max-w-2xl">
                        {role.deskripsi ||
                          "Tidak ada deskripsi role."}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 mt-4">

                        <div className="flex items-center gap-2 text-xs text-slate-300">
                          <Users
                            size={14}
                            className="text-blue-300"
                          />
                          <span>
                            {formatNumber(
                              totalPengguna
                            )}{" "}
                            pengguna
                          </span>
                        </div>

                        <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-600" />

                        <div className="flex items-center gap-2 text-xs text-slate-300">
                          <KeyRound
                            size={14}
                            className="text-blue-300"
                          />
                          <span>
                            {formatNumber(
                              totalGranted
                            )}{" "}
                            izin aktif
                          </span>
                        </div>

                        {role.sekolah && (
                          <>
                            <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-600" />

                            <div className="flex items-center gap-2 text-xs text-slate-300">
                              <Database
                                size={14}
                                className="text-blue-300"
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
                      className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl border border-white/10 bg-white/5 text-slate-200 text-sm font-medium hover:bg-white/10 hover:border-white/20 transition-all"
                    >
                      <ArrowLeft
                        size={15}
                      />
                      Kembali
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/super-admin/manajemenAkses/edit-role?id=${role.id}`
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow-lg shadow-blue-950/30 hover:bg-blue-500 hover:-translate-y-0.5 transition-all"
                    >
                      <Edit3
                        size={15}
                      />
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
                value={`${formatNumber(
                  totalGranted
                )}/${formatNumber(
                  totalPermission
                )}`}
                description="Permission role"
                accent="blue"
              />

              <OverviewCard
                icon={Layers3}
                label="Modul Terjangkau"
                value={`${modulDenganAkses}/${totalModul}`}
                description="Modul sistem"
                accent="indigo"
              />

              <OverviewCard
                icon={Users}
                label="Pengguna Terkait"
                value={formatNumber(
                  totalPengguna
                )}
                description="Pengguna role"
                accent="emerald"
              />

              <OverviewCard
                icon={ShieldCheck}
                label="Status Role"
                value={statusConfig.label}
                description="Status akses"
                accent="slate"
              />

            </section>

            {/* ==================================================
                PERMISSION SECTION
            ================================================== */}

            <section className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm mb-6">

              {/* top accent */}

              <div className="h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500" />

              {/* HEADER */}

              <div className="p-4 sm:p-5 border-b border-slate-200/80">

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                  <div className="flex items-start gap-3">

                    <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                      <KeyRound
                        size={18}
                        strokeWidth={1.8}
                      />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">

                        <h2 className="text-sm font-semibold text-slate-800">
                          Daftar Izin Role
                        </h2>

                        <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-[9px] font-semibold text-blue-600">
                          {formatNumber(
                            totalGranted
                          )}{" "}
                          ACCESS
                        </span>

                      </div>

                      <p className="text-xs text-slate-500 mt-1">
                        Permission yang diberikan
                        kepada role ini.
                      </p>
                    </div>

                  </div>

                  {/* SEARCH */}

                  <div className="relative w-full lg:w-72">

                    <Search
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      placeholder="Cari izin, modul, atau aksi..."
                      value={
                        permissionSearchQuery
                      }
                      onChange={(e) =>
                        setPermissionSearchQuery(
                          e.target.value
                        )
                      }
                      className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all"
                    />

                  </div>

                </div>

              </div>

              {/* PERMISSION CONTENT */}

              {filteredPermissions.length ===
              0 ? (
                <div className="py-16 px-5 text-center">

                  <div className="relative w-14 h-14 mx-auto rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center">

                    <Search size={21} />

                    <div className="absolute -right-1 -bottom-1 w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                      <XCircle
                        size={11}
                        className="text-slate-400"
                      />
                    </div>

                  </div>

                  <p className="text-sm font-semibold text-slate-700 mt-4">
                    Tidak ada izin ditemukan
                  </p>

                  <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto">
                    Tidak ada permission yang
                    sesuai dengan pencarian
                    saat ini.
                  </p>

                </div>
              ) : (
                <>
                  {/* DESKTOP */}

                  <div className="hidden md:block overflow-x-auto">

                    <table className="w-full min-w-[720px]">

                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200">

                          <th className="w-16 px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                            #
                          </th>

                          <th className="px-3 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                            Nama Izin
                          </th>

                          <th className="px-3 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                            Modul
                          </th>

                          <th className="px-3 py-3.5 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                            Tipe Akses
                          </th>

                          <th className="px-5 py-3.5 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                            Status
                          </th>

                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">

                        {filteredPermissions.map(
                          (
                            permission,
                            index
                          ) => (
                            <tr
                              key={
                                permission.id
                              }
                              className="group hover:bg-blue-50/25 transition-colors"
                            >

                              {/* NUMBER */}

                              <td className="px-5 py-4">

                                <span className="inline-flex w-7 h-7 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-semibold text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                  {String(
                                    index + 1
                                  ).padStart(
                                    2,
                                    "0"
                                  )}
                                </span>

                              </td>

                              {/* NAME */}

                              <td className="px-3 py-4">

                                <div className="flex items-center gap-3">

                                  <div className="w-9 h-9 shrink-0 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                                    <KeyRound
                                      size={
                                        15
                                      }
                                      strokeWidth={
                                        1.8
                                      }
                                    />
                                  </div>

                                  <div className="min-w-0">

                                    <p className="text-sm font-semibold text-slate-700 truncate">
                                      {permission.nama ||
                                        "-"}
                                    </p>

                                    <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[280px]">
                                      ID:{" "}
                                      {
                                        permission.id
                                      }
                                    </p>

                                  </div>

                                </div>

                              </td>

                              {/* MODUL */}

                              <td className="px-3 py-4">

                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600">
                                  <Layers3
                                    size={
                                      12
                                    }
                                    className="text-slate-400"
                                  />

                                  {permission.modul ||
                                    "-"}
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

                                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600">

                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />

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

                  <div className="md:hidden divide-y divide-slate-100">

                    {filteredPermissions.map(
                      (
                        permission,
                        index
                      ) => (
                        <div
                          key={
                            permission.id
                          }
                          className="p-4"
                        >

                          <div className="flex items-start gap-3">

                            <div className="w-9 h-9 shrink-0 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                              <KeyRound
                                size={15}
                              />
                            </div>

                            <div className="flex-1 min-w-0">

                              <div className="flex items-start justify-between gap-3">

                                <div className="min-w-0">

                                  <p className="text-sm font-semibold text-slate-700 truncate">
                                    {permission.nama ||
                                      "-"}
                                  </p>

                                  <p className="text-[10px] text-slate-400 mt-0.5">
                                    #
                                    {index +
                                      1}
                                  </p>

                                </div>

                                <span className="shrink-0 w-2 h-2 rounded-full bg-emerald-500 mt-1.5" />

                              </div>

                              <div className="flex flex-wrap gap-2 mt-3">

                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-600">
                                  <Layers3
                                    size={
                                      11
                                    }
                                  />
                                  {permission.modul ||
                                    "-"}
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
                </>
              )}

              {/* FOOTER */}

              <div className="px-4 sm:px-5 py-3.5 border-t border-slate-200 bg-slate-50/40">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                  <p className="text-[11px] text-slate-400">
                    Menampilkan{" "}
                    <span className="font-semibold text-slate-600">
                      {
                        filteredPermissions.length
                      }
                    </span>{" "}
                    dari{" "}
                    <span className="font-semibold text-slate-600">
                      {
                        totalGranted
                      }
                    </span>{" "}
                    izin role.
                  </p>

                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <ShieldCheck
                      size={12}
                      className="text-emerald-500"
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

              {/* ==================================================
                  USERS
              ================================================== */}

              <section className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm">

                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-500" />

                <div className="p-5">

                  <div className="flex items-start justify-between gap-4">

                    <div className="flex items-start gap-3">

                      <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                        <Users
                          size={18}
                        />
                      </div>

                      <div>

                        <h2 className="text-sm font-semibold text-slate-800">
                          Pengguna Role
                        </h2>

                        <p className="text-xs text-slate-500 mt-1">
                          Pengguna yang terkait
                          dengan role ini.
                        </p>

                      </div>

                    </div>

                    <div className="text-right">

                      <p className="text-2xl font-semibold text-slate-800 tracking-tight">
                        {formatNumber(
                          totalPengguna
                        )}
                      </p>

                      <p className="text-[10px] text-slate-400">
                        pengguna
                      </p>

                    </div>

                  </div>

                  <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100">

                    <div className="flex items-start gap-3">

                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                        <UserRound
                          size={14}
                        />
                      </div>

                      <div>

                        <p className="text-xs font-semibold text-slate-700">
                          Data pengguna
                        </p>

                        <p className="text-[11px] text-slate-500 mt-1 leading-5">
                          Backend saat ini
                          menyediakan jumlah
                          pengguna berdasarkan
                          role, tetapi belum
                          menyediakan endpoint
                          daftar detail pengguna
                          untuk halaman ini.
                        </p>

                      </div>

                    </div>

                  </div>

                  <div className="flex items-center gap-2 mt-4 text-[10px] text-slate-400">
                    <Database
                      size={12}
                      className="text-indigo-500"
                    />
                    Jumlah berasal dari data
                    backend
                  </div>

                </div>

              </section>

              {/* ==================================================
                  SECURITY STATUS
              ================================================== */}

              <section className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm">

                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500" />

                <div className="p-5">

                  <div className="flex items-start gap-3">

                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                      <ShieldCheck
                        size={18}
                      />
                    </div>

                    <div>

                      <h2 className="text-sm font-semibold text-slate-800">
                        Ringkasan Keamanan
                      </h2>

                      <p className="text-xs text-slate-500 mt-1">
                        Kondisi akses role saat
                        ini.
                      </p>

                    </div>

                  </div>

                  <div className="space-y-3 mt-6">

                    <SecurityRow
                      label="Status Role"
                      value={
                        statusConfig.label
                      }
                      icon={
                        <StatusIcon
                          size={14}
                        />
                      }
                      active={
                        role.status ===
                        "aktif"
                      }
                    />

                    <SecurityRow
                      label="Permission"
                      value={`${formatNumber(
                        totalGranted
                      )} akses`}
                      icon={
                        <KeyRound
                          size={14}
                        />
                      }
                      active={
                        totalGranted >
                        0
                      }
                    />

                    <SecurityRow
                      label="Modul"
                      value={`${modulDenganAkses} modul`}
                      icon={
                        <Layers3
                          size={14}
                        />
                      }
                      active={
                        modulDenganAkses >
                        0
                      }
                    />

                    <SecurityRow
                      label="Pengguna"
                      value={`${formatNumber(
                        totalPengguna
                      )} pengguna`}
                      icon={
                        <Users
                          size={14}
                        />
                      }
                      active={
                        totalPengguna >
                        0
                      }
                    />

                  </div>

                </div>

              </section>

            </div>

            {/* ==================================================
                LOG AKTIVITAS
            ================================================== */}

            <section className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-sm mb-6">

              <div className="p-5">

                <div className="flex items-start gap-3">

                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center">
                    <Activity
                      size={18}
                    />
                  </div>

                  <div className="flex-1">

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                      <div>

                        <h2 className="text-sm font-semibold text-slate-800">
                          Log Aktivitas
                        </h2>

                        <p className="text-xs text-slate-500 mt-1">
                          Informasi aktivitas
                          terkait role.
                        </p>

                      </div>

                      <span className="inline-flex items-center gap-1.5 self-start px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-medium text-slate-400">
                        <Database
                          size={11}
                        />
                        Belum tersedia
                      </span>

                    </div>

                    <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4">

                      <div className="flex items-start gap-3">

                        <Sparkles
                          size={15}
                          className="text-blue-500 mt-0.5 shrink-0"
                        />

                        <p className="text-xs text-slate-500 leading-5">
                          Log aktivitas belum
                          ditampilkan karena backend
                          saat ini belum menyediakan
                          endpoint audit/log aktivitas
                          untuk halaman role ini.
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
                className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft
                  size={13}
                />
                Kembali ke Manajemen Akses
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/super-admin/manajemenAkses/edit-role?id=${role.id}`
                  )
                }
                className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Kelola Role
                <ArrowUpRight
                  size={13}
                />
              </button>

            </div>

            {/* ==================================================
                FOOTER
            ================================================== */}

            <div className="border-t border-slate-200/60 pt-4 pb-2 flex flex-col sm:flex-row items-center justify-between gap-2">

              <div className="flex items-center gap-2">

                <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center">
                  <Shield
                    size={11}
                  />
                </div>

                <span className="text-[10px] font-medium text-slate-400">
                  SmartSchool
                  <span className="mx-1 text-slate-300">
                    •
                  </span>
                  Manajemen Akses
                </span>

              </div>

              <span className="text-[10px] text-slate-400">
                Sistem Manajemen Sekolah
              </span>

            </div>

          </div>

        </main>

      </div>
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
  accent = "blue",
}) {
  const styles = {
    blue: {
      icon:
        "bg-blue-50 border-blue-100 text-blue-600",
      line: "bg-blue-500",
    },

    indigo: {
      icon:
        "bg-indigo-50 border-indigo-100 text-indigo-600",
      line: "bg-indigo-500",
    },

    emerald: {
      icon:
        "bg-emerald-50 border-emerald-100 text-emerald-600",
      line: "bg-emerald-500",
    },

    slate: {
      icon:
        "bg-slate-100 border-slate-200 text-slate-600",
      line: "bg-slate-500",
    },
  };

  const style =
    styles[accent] || styles.blue;

  return (
    <div className="group relative overflow-hidden bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">

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

          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400 truncate">
            {label}
          </p>

          <p className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight mt-0.5 truncate">
            {value}
          </p>

          <p className="hidden sm:block text-[10px] text-slate-400 mt-0.5">
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
    <div className="flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-100">

      <div className="flex items-center gap-3 min-w-0">

        <div
          className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${
            active
              ? "bg-white border border-slate-200 text-blue-600"
              : "bg-slate-100 text-slate-400"
          }`}
        >
          {icon}
        </div>

        <span className="text-xs font-medium text-slate-600 truncate">
          {label}
        </span>

      </div>

      <div className="flex items-center gap-2 shrink-0">

        <span className="text-xs font-semibold text-slate-700">
          {value}
        </span>

        <span
          className={`w-1.5 h-1.5 rounded-full ${
            active
              ? "bg-emerald-500"
              : "bg-slate-300"
          }`}
        />

      </div>

    </div>
  );
}