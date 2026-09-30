"use client";

import { useRouter } from "next/navigation";

import {
  LayoutDashboard,
  School,
  Building2,
  Users,
  Package,
  Activity,
  Calendar,
  ChevronRight,
  Edit3,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Bell,
  CheckCircle2,
  RefreshCw,
  Settings,
  ShieldCheck,
  Database,
  TrendingUp,
  CreditCard,
  UserPlus,
  MoreHorizontal,
  Clock3,
  Server,
} from "lucide-react";

// ============================================================
// THEME HELPERS
// ============================================================

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimaryBorder =
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

const themeTextOnCard =
  "text-[var(--color-card)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

// ============================================================
// DUMMY DATA
// ============================================================

const statsData = [
  {
    id: 1,
    label: "Total Sekolah",
    value: "128",
    change: "+12",
    description: "sekolah terdaftar",
    trend: "up",
    icon: School,
    accent: "primary",
  },
  {
    id: 2,
    label: "Total Yayasan",
    value: "42",
    change: "+3",
    description: "yayasan terdaftar",
    trend: "up",
    icon: Building2,
    accent: "neutral",
  },
  {
    id: 3,
    label: "Pengguna Aktif",
    value: "1.198",
    change: "+54",
    description: "pengguna aktif",
    trend: "up",
    icon: Users,
    accent: "primary",
  },
  {
    id: 4,
    label: "Langganan Aktif",
    value: "105",
    change: "-2",
    description: "dari 128 sekolah",
    trend: "down",
    icon: Package,
    accent: "neutral",
  },
];

const revenueData = [
  { month: "Jan", value: 38 },
  { month: "Feb", value: 43 },
  { month: "Mar", value: 49 },
  { month: "Apr", value: 55 },
  { month: "Mei", value: 61 },
  { month: "Jun", value: 69 },
  { month: "Jul", value: 77 },
  { month: "Agu", value: 86 },
];

const schoolGrowthData = [
  { month: "Jan", value: 42 },
  { month: "Feb", value: 48 },
  { month: "Mar", value: 55 },
  { month: "Apr", value: 62 },
  { month: "Mei", value: 70 },
  { month: "Jun", value: 78 },
  { month: "Jul", value: 85 },
  { month: "Agu", value: 92 },
];

const recentActivities = [
  {
    id: 1,
    user: "Super Admin",
    action: "Menambahkan sekolah baru",
    target: "SMA Bina Bangsa",
    timestamp: "2026-08-26T14:30:00",
    type: "create",
  },
  {
    id: 2,
    user: "Super Admin",
    action: "Memperbarui paket langganan",
    target: "SMA Negeri 1 Jakarta",
    timestamp: "2026-08-26T13:15:00",
    type: "update",
  },
  {
    id: 3,
    user: "Admin Sekolah",
    action: "Menambahkan pengguna baru",
    target: "SMP BPK Penabur",
    timestamp: "2026-08-26T12:45:00",
    type: "create",
  },
  {
    id: 4,
    user: "Super Admin",
    action: "Memverifikasi yayasan",
    target: "YPI Harapan",
    timestamp: "2026-08-26T11:20:00",
    type: "verify",
  },
  {
    id: 5,
    user: "Sistem",
    action: "Pembayaran berhasil",
    target: "SMA Al-Azhar",
    timestamp: "2026-08-26T10:30:00",
    type: "payment",
  },
];

const upcomingTasks = [
  {
    id: 1,
    title: "Backup Database",
    description: "Backup otomatis database utama",
    due: "Hari ini · 23:00",
    priority: "high",
    icon: Database,
  },
  {
    id: 2,
    title: "Review Langganan Expired",
    description: "5 sekolah perlu ditinjau",
    due: "Besok · 09:00",
    priority: "medium",
    icon: CreditCard,
  },
  {
    id: 3,
    title: "Update Sistem",
    description: "Persiapan deployment versi 2.1",
    due: "15 Agu · 10:00",
    priority: "low",
    icon: Server,
  },
];

const recentNotifications = [
  {
    id: 1,
    title: "Pembaruan Sistem v2.0",
    desc: "SmartSchool telah diperbarui ke versi terbaru.",
    read: false,
    time: "2 jam lalu",
  },
  {
    id: 2,
    title: "Pengingat Backup Data",
    desc: "Backup database terakhir berhasil dilakukan.",
    read: false,
    time: "5 jam lalu",
  },
  {
    id: 3,
    title: "Yayasan Baru Mendaftar",
    desc: "YPI Harapan telah menyelesaikan pendaftaran.",
    read: true,
    time: "1 hari lalu",
  },
];

const quickActions = [
  {
    label: "Tambah Sekolah",
    description: "Daftarkan sekolah",
    icon: School,
    path: "/super-admin/sekolah/tambah",
  },
  {
    label: "Tambah Yayasan",
    description: "Daftarkan yayasan",
    icon: Building2,
    path: "/super-admin/yayasan/tambah",
  },
  {
    label: "Pengumuman",
    description: "Buat pengumuman",
    icon: Bell,
    path: "/super-admin/notifikasiPengumuman",
  },
  {
    label: "Kelola Paket",
    description: "Atur paket modul",
    icon: Package,
    path: "/super-admin/paketModul",
  },
  {
    label: "Manajemen Akses",
    description: "Atur hak akses",
    icon: Users,
    path: "/super-admin/manajemenAkses",
  },
  {
    label: "Pengaturan",
    description: "Konfigurasi sistem",
    icon: Settings,
    path: "/super-admin/pengaturanSistem",
  },
];

// ============================================================
// HELPERS
// ============================================================

const getActivityIcon = (type) => {
  const map = {
    create: UserPlus,
    update: Edit3,
    verify: CheckCircle2,
    payment: DollarSign,
  };

  return map[type] || Activity;
};

const getActivityColor = (type) => {
  const map = {
    create: `${themePrimarySoft} ${themePrimaryText} ${themePrimaryBorder}`,
    update: `${themeNeutralSurface} theme-text-secondary ${themeNeutralBorder}`,
    verify: `${themeInfoSurface} text-[var(--color-info)] ${themeInfoBorder}`,
    payment: `${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`,
  };

  return (
    map[type] ||
    `${themeNeutralSurface} theme-text-muted ${themeNeutralBorder}`
  );
};

const getAccent = (accent) => {
  const map = {
    primary: {
      icon: `${themePrimarySoft} ${themePrimaryText}`,
      bar: "bg-[var(--color-primary)]",
    },

    neutral: {
      icon: `${themeNeutralSurface} theme-text-secondary`,
      bar: "bg-[color-mix(in_srgb,var(--color-text)_35%,transparent)]",
    },
  };

  return map[accent] || map.primary;
};

const getPriority = (priority) => {
  const map = {
    high: {
      label: "Tinggi",
      className: `${themeWarningBorder} ${themeWarningSurface} text-[var(--color-warning)]`,
      dot: "bg-[var(--color-warning)]",
    },

    medium: {
      label: "Sedang",
      className: `${themeWarningBorder} ${themeWarningSurface} text-[var(--color-warning)]`,
      dot: "bg-[var(--color-warning)]",
    },

    low: {
      label: "Rendah",
      className: `${themeNeutralBorder} ${themeNeutralSurface} theme-text-secondary`,
      dot: "bg-[color-mix(in_srgb,var(--color-text)_45%,transparent)]",
    },
  };

  return map[priority] || map.low;
};

// ============================================================
// COMPONENT
// ============================================================

export default function DashboardPage() {
  const router = useRouter();

  const maxRevenue = Math.max(
    ...revenueData.map((item) => item.value)
  );

  const maxSchool = Math.max(
    ...schoolGrowthData.map((item) => item.value)
  );

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="mx-auto w-full max-w-[1700px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <div className="space-y-5 lg:space-y-6">

          {/* ==================================================
              PAGE HEADER
          ================================================== */}

          <section
            className={`flex flex-col gap-4 rounded-2xl border theme-border theme-card px-5 py-5 ${themeCardShadow} sm:px-6 lg:flex-row lg:items-center lg:justify-between`}
          >
            <div className="flex min-w-0 items-center gap-3.5">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${themePrimaryGradient} ${themeTextOnCard} ${themePrimaryShadow}`}
              >
                <LayoutDashboard
                  size={20}
                  strokeWidth={2}
                />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl font-semibold tracking-tight theme-text sm:text-2xl">
                    Dashboard
                  </h1>

                  <span
                    className={`rounded-md border ${themePrimaryBorder} ${themePrimarySoft} px-2.5 py-1 text-[10px] font-semibold ${themePrimaryText}`}
                  >
                    SUPER ADMIN
                  </span>
                </div>

                <p className="mt-1 text-xs theme-text-muted sm:text-sm">
                  Ringkasan performa dan aktivitas platform
                  SmartSchool.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`hidden items-center gap-2 rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} px-3 py-2 text-xs theme-text-secondary sm:flex`}
              >
                <Clock3 size={14} />
                <span>26 Agustus 2026</span>
              </div>

              <button
                onClick={() => window.location.reload()}
                className={`inline-flex items-center justify-center gap-2 rounded-lg border theme-border theme-card px-3.5 py-2.5 text-xs font-medium theme-text-secondary ${themeSmallShadow} transition hover:border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)] hover:text-[var(--color-primary)]`}
              >
                <RefreshCw size={14} />
                Refresh
              </button>
            </div>
          </section>

          {/* ==================================================
              STATISTICS
          ================================================== */}

          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {statsData.map((stat) => {
              const Icon = stat.icon;
              const accent = getAccent(stat.accent);

              return (
                <div
                  key={stat.id}
                  className={`group relative overflow-hidden rounded-xl border theme-border theme-card p-4 ${themeCardShadow} transition duration-200 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)] sm:p-5`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent.icon}`}
                    >
                      <Icon
                        size={18}
                        strokeWidth={2}
                      />
                    </div>

                    <span
                      className={`inline-flex items-center gap-0.5 rounded-md px-2 py-1 text-[10px] font-semibold ${
                        stat.trend === "up"
                          ? `${themeSuccessSurface} text-[var(--color-success)]`
                          : `${themeWarningSurface} text-[var(--color-warning)]`
                      }`}
                    >
                      {stat.trend === "up" ? (
                        <ArrowUpRight size={12} />
                      ) : (
                        <ArrowDownRight size={12} />
                      )}

                      {stat.change}
                    </span>
                  </div>

                  <div className="mt-4">
                    <p className="text-[11px] font-medium uppercase tracking-wide theme-text-muted">
                      {stat.label}
                    </p>

                    <div className="mt-1 flex flex-wrap items-end gap-2">
                      <p className="text-2xl font-semibold tracking-tight theme-text">
                        {stat.value}
                      </p>

                      <span className="mb-1 text-[10px] theme-text-muted">
                        {stat.description}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`absolute bottom-0 left-0 h-[2px] w-0 ${accent.bar} transition-all duration-300 group-hover:w-full`}
                  />
                </div>
              );
            })}
          </section>

          {/* ==================================================
              OVERVIEW
          ================================================== */}

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">

            {/* SCHOOL GROWTH */}

            <div
              className={`rounded-xl border theme-border theme-card p-5 ${themeCardShadow} xl:col-span-2`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${themePrimarySoft} ${themePrimaryText}`}
                  >
                    <TrendingUp size={17} />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold theme-text">
                      Pertumbuhan Sekolah
                    </h2>

                    <p className="mt-0.5 text-xs theme-text-muted">
                      Perkembangan jumlah sekolah sepanjang
                      tahun 2026
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    router.push("/super-admin/sekolah")
                  }
                  className={`flex items-center gap-1 text-xs font-medium ${themePrimaryText} transition hover:opacity-80`}
                >
                  Detail
                  <ChevronRight size={13} />
                </button>
              </div>

              <div className="mt-7">
                <div className="relative h-52">
                  <div className="absolute inset-0 flex flex-col justify-between">
                    {[0, 1, 2, 3, 4].map((item) => (
                      <div
                        key={item}
                        className={`border-t border-dashed ${themeDivider}`}
                      />
                    ))}
                  </div>

                  <div className="relative flex h-full items-end gap-2 sm:gap-4">
                    {schoolGrowthData.map((item, index) => {
                      const height =
                        (item.value / maxSchool) * 100;

                      const isLast =
                        index ===
                        schoolGrowthData.length - 1;

                      return (
                        <div
                          key={item.month}
                          className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                        >
                          <div className="relative flex h-full w-full max-w-[44px] items-end justify-center">
                            <div
                              className={`w-full rounded-t-md transition-all duration-500 ${
                                isLast
                                  ? "bg-[var(--color-primary)]"
                                  : `${themePrimarySoft} group-hover:bg-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]`
                              }`}
                              style={{
                                height: `${height}%`,
                                minHeight: "5px",
                              }}
                            />

                            <div
                              className={`pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md ${themeNeutralSurface} border ${themeNeutralBorder} px-2 py-1 text-[9px] font-medium theme-text opacity-0 ${themeSmallShadow} transition group-hover:opacity-100`}
                            >
                              {item.value} sekolah
                            </div>
                          </div>

                          <span
                            className={`mt-2 text-[9px] font-medium sm:text-[10px] ${
                              isLast
                                ? `font-semibold ${themePrimaryText}`
                                : "theme-text-muted"
                            }`}
                          >
                            {item.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div
                  className={`mt-3 flex items-center justify-between border-t ${themeDivider} pt-3`}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />

                    <span className="text-[10px] theme-text-muted">
                      Jumlah sekolah
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] font-medium text-[var(--color-success)]">
                    <ArrowUpRight size={11} />
                    18,4% pertumbuhan
                  </div>
                </div>
              </div>
            </div>

            {/* SUBSCRIPTION */}

            <div
              className={`rounded-xl border theme-border theme-card p-5 ${themeCardShadow}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${themePrimarySoft} ${themePrimaryText}`}
                  >
                    <Package size={17} />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold theme-text">
                      Langganan
                    </h2>

                    <p className="mt-0.5 text-xs theme-text-muted">
                      Status subscription
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    router.push(
                      "/super-admin/langgananSekolah"
                    )
                  }
                  className={`flex h-8 w-8 items-center justify-center rounded-lg theme-text-muted transition ${themeNeutralHover} hover:text-[var(--color-primary)]`}
                >
                  <MoreHorizontal size={17} />
                </button>
              </div>

              <div className="mt-6">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide theme-text-muted">
                      Total subscription
                    </p>

                    <p className="mt-1 text-3xl font-semibold tracking-tight theme-text">
                      128
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-medium text-[var(--color-success)]">
                    <ArrowUpRight size={13} />
                    8,2%
                  </div>
                </div>

                <div
                  className={`mt-5 h-2 overflow-hidden rounded-full ${themeNeutralSurface}`}
                >
                  <div
                    className="h-full rounded-full bg-[var(--color-primary)]"
                    style={{ width: "82%" }}
                  />
                </div>

                <p className="mt-2 text-[10px] theme-text-muted">
                  82% sekolah memiliki langganan aktif
                </p>
              </div>

              <div className={`mt-6 divide-y ${themeDivider}`}>
                {[
                  {
                    label: "Aktif",
                    value: "105",
                    color: "bg-[var(--color-primary)]",
                  },
                  {
                    label: "Trial",
                    value: "18",
                    color:
                      "bg-[color-mix(in_srgb,var(--color-text)_40%,transparent)]",
                  },
                  {
                    label: "Expired",
                    value: "5",
                    color: "bg-[var(--color-warning)]",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${item.color}`}
                      />

                      <span className="text-xs theme-text-secondary">
                        {item.label}
                      </span>
                    </div>

                    <span className="text-sm font-semibold theme-text">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() =>
                  router.push(
                    "/super-admin/langgananSekolah"
                  )
                }
                className={`mt-3 flex w-full items-center justify-center gap-1 rounded-lg border ${themeNeutralBorder} theme-card py-2.5 text-xs font-medium theme-text-secondary transition hover:border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-primary)_7%,transparent)] hover:text-[var(--color-primary)]`}
              >
                Kelola Langganan
                <ChevronRight size={13} />
              </button>
            </div>
          </section>

          {/* ==================================================
              REVENUE + SYSTEM
          ================================================== */}

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">

            {/* REVENUE */}

            <div
              className={`rounded-xl border theme-border theme-card p-5 ${themeCardShadow} lg:col-span-2`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${themeSuccessSurface} text-[var(--color-success)]`}
                  >
                    <DollarSign size={17} />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold theme-text">
                      Pendapatan Langganan
                    </h2>

                    <p className="mt-0.5 text-xs theme-text-muted">
                      Performa pendapatan platform
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wide theme-text-muted">
                    Bulan ini
                  </p>

                  <p className="mt-0.5 text-lg font-semibold theme-text">
                    Rp 12,5 Jt
                  </p>
                </div>
              </div>

              <div className="mt-7 flex items-end gap-2 sm:gap-4">
                {revenueData.map((item, index) => {
                  const height =
                    (item.value / maxRevenue) * 100;

                  const isLast =
                    index === revenueData.length - 1;

                  return (
                    <div
                      key={item.month}
                      className="group flex min-w-0 flex-1 flex-col items-center"
                    >
                      <div className="relative flex h-36 w-full items-end justify-center">
                        <div
                          className={`w-full max-w-[42px] rounded-t-md transition-all duration-300 ${
                            isLast
                              ? "bg-[var(--color-success)]"
                              : `${themeSuccessSurface} group-hover:bg-[color-mix(in_srgb,var(--color-success)_18%,transparent)]`
                          }`}
                          style={{
                            height: `${height}%`,
                            minHeight: "5px",
                          }}
                        />

                        <div
                          className={`pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md ${themeNeutralSurface} border ${themeNeutralBorder} px-2 py-1 text-[9px] theme-text opacity-0 transition group-hover:opacity-100`}
                        >
                          Rp {item.value / 10} Jt
                        </div>
                      </div>

                      <span
                        className={`mt-2 text-[9px] font-medium sm:text-[10px] ${
                          isLast
                            ? "text-[var(--color-success)]"
                            : "theme-text-muted"
                        }`}
                      >
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div
                className={`mt-5 flex flex-wrap items-center gap-4 border-t ${themeDivider} pt-4`}
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />

                  <span className="text-[10px] theme-text-muted">
                    Pendapatan
                  </span>
                </div>

                <span className="text-[10px] theme-text-placeholder">
                  |
                </span>

                <span className="flex items-center gap-1 text-[10px] font-medium text-[var(--color-success)]">
                  <ArrowUpRight size={11} />
                  14,8% dibanding bulan lalu
                </span>
              </div>
            </div>

            {/* SYSTEM STATUS */}

            <div
              className={`overflow-hidden rounded-xl border theme-border theme-card p-5 ${themeCardShadow}`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${themePrimarySoft} ${themePrimaryText}`}
                >
                  <ShieldCheck size={18} />
                </div>

                <div>
                  <h2 className="text-sm font-semibold theme-text">
                    Status Sistem
                  </h2>

                  <p className="mt-0.5 text-[10px] theme-text-muted">
                    Monitoring platform
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div
                  className={`rounded-lg border ${themeSuccessBorder} ${themeSuccessSurface} p-3`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs theme-text-secondary">
                      Server
                    </span>

                    <span className="flex items-center gap-1.5 text-[10px] font-medium text-[var(--color-success)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />
                      Online
                    </span>
                  </div>
                </div>

                <div
                  className={`rounded-lg border ${themeSuccessBorder} ${themeSuccessSurface} p-3`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs theme-text-secondary">
                      Database
                    </span>

                    <span className="flex items-center gap-1.5 text-[10px] font-medium text-[var(--color-success)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />
                      Normal
                    </span>
                  </div>
                </div>

                <div
                  className={`rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} p-3`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs theme-text-secondary">
                      Backup
                    </span>

                    <span className="text-[10px] font-medium theme-text-secondary">
                      08:00 WIB
                    </span>
                  </div>
                </div>

                <div
                  className={`rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} p-3`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs theme-text-secondary">
                      Versi
                    </span>

                    <span className="text-[10px] font-medium theme-text-secondary">
                      v2.0.4
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  router.push(
                    "/super-admin/pengaturanSistem"
                  )
                }
                className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg border ${themeNeutralBorder} theme-card py-2.5 text-xs font-medium theme-text-secondary transition hover:border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-primary)_7%,transparent)] hover:text-[var(--color-primary)]`}
              >
                <Settings size={14} />
                Pengaturan Sistem
              </button>
            </div>
          </section>

          {/* ==================================================
              ACTIVITIES + TASKS
          ================================================== */}

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">

            {/* ACTIVITY */}

            <div
              className={`rounded-xl border theme-border theme-card p-5 ${themeCardShadow}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${themePrimarySoft} ${themePrimaryText}`}
                  >
                    <Activity size={17} />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold theme-text">
                      Aktivitas Terbaru
                    </h2>

                    <p className="mt-0.5 text-xs theme-text-muted">
                      Aktivitas terbaru di platform
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    router.push(
                      "/super-admin/logAktivitas"
                    )
                  }
                  className={`text-xs font-medium ${themePrimaryText} transition hover:opacity-80`}
                >
                  Lihat Semua
                </button>
              </div>

              <div className="mt-5">
                {recentActivities
                  .slice(0, 5)
                  .map((activity, index) => {
                    const Icon = getActivityIcon(
                      activity.type
                    );

                    const colorClass =
                      getActivityColor(activity.type);

                    return (
                      <div
                        key={activity.id}
                        className="relative flex gap-3 pb-5 last:pb-0"
                      >
                        {index !==
                          recentActivities.length - 1 && (
                          <div
                            className={`absolute left-[15px] top-9 h-[calc(100%-18px)] w-px ${themeDivider.replace(
                              "border-",
                              "bg-"
                            )}`}
                          />
                        )}

                        <div
                          className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colorClass}`}
                        >
                          <Icon size={14} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-1.5">
                            <span className="text-xs font-semibold theme-text">
                              {activity.user}
                            </span>

                            <span className="text-xs theme-text-secondary">
                              {activity.action}
                            </span>
                          </div>

                          <p className="mt-0.5 truncate text-xs font-medium theme-text">
                            {activity.target}
                          </p>

                          <p className="mt-1 text-[10px] theme-text-muted">
                            {activity.id === 1
                              ? "10 menit lalu"
                              : activity.id === 2
                              ? "1 jam lalu"
                              : activity.id === 3
                              ? "2 jam lalu"
                              : activity.id === 4
                              ? "3 jam lalu"
                              : "4 jam lalu"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* RIGHT */}

            <div className="space-y-4">

              {/* TASK */}

              <div
                className={`rounded-xl border theme-border theme-card p-5 ${themeCardShadow}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${themePrimarySoft} ${themePrimaryText}`}
                    >
                      <Calendar size={17} />
                    </div>

                    <div>
                      <h2 className="text-sm font-semibold theme-text">
                        Tugas Mendatang
                      </h2>

                      <p className="mt-0.5 text-xs theme-text-muted">
                        Hal yang perlu diperhatikan
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] theme-text-muted">
                    {upcomingTasks.length} tugas
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  {upcomingTasks.map((task) => {
                    const priority = getPriority(
                      task.priority
                    );

                    const Icon = task.icon;

                    return (
                      <div
                        key={task.id}
                        className={`flex items-center gap-3 rounded-lg border border-transparent p-2.5 transition hover:border-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] ${themeNeutralHover}`}
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${themeNeutralSurface} theme-text-secondary`}
                        >
                          <Icon size={14} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium theme-text">
                            {task.title}
                          </p>

                          <p className="mt-0.5 truncate text-[10px] theme-text-muted">
                            {task.description}
                          </p>

                          <p className="mt-1 flex items-center gap-1 text-[9px] theme-text-muted">
                            <Clock3 size={10} />
                            {task.due}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-md border px-2 py-1 text-[9px] font-medium ${priority.className}`}
                        >
                          {priority.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* NOTIFICATION */}

              <div
                className={`rounded-xl border theme-border theme-card p-5 ${themeCardShadow}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${themePrimarySoft} ${themePrimaryText}`}
                    >
                      <Bell size={17} />
                    </div>

                    <div>
                      <h2 className="text-sm font-semibold theme-text">
                        Notifikasi
                      </h2>

                      <p className="mt-0.5 text-xs theme-text-muted">
                        Informasi terbaru
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      router.push(
                        "/super-admin/notifikasiPengumuman"
                      )
                    }
                    className={`text-xs font-medium ${themePrimaryText} transition hover:opacity-80`}
                  >
                    Lihat Semua
                  </button>
                </div>

                <div className="mt-4 space-y-1">
                  {recentNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`rounded-lg p-2.5 transition ${themeNeutralHover} ${
                        !notif.read
                          ? themePrimarySoft
                          : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                            notif.read
                              ? `${themeNeutralSurface} theme-text-muted`
                              : `${themePrimarySoft} ${themePrimaryText}`
                          }`}
                        >
                          <Bell size={13} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p
                              className={`truncate text-xs ${
                                notif.read
                                  ? "font-medium theme-text-secondary"
                                  : "font-semibold theme-text"
                              }`}
                            >
                              {notif.title}
                            </p>

                            {!notif.read && (
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                            )}
                          </div>

                          <p className="mt-0.5 truncate text-[10px] theme-text-muted">
                            {notif.desc}
                          </p>

                          <p className="mt-1 text-[9px] theme-text-muted">
                            {notif.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ==================================================
              QUICK ACTION
          ================================================== */}

          <section
            className={`rounded-xl border theme-border theme-card p-5 ${themeCardShadow}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${themePrimarySoft} ${themePrimaryText}`}
                >
                  <Zap size={17} />
                </div>

                <div>
                  <h2 className="text-sm font-semibold theme-text">
                    Aksi Cepat
                  </h2>

                  <p className="mt-0.5 text-xs theme-text-muted">
                    Akses fitur yang sering digunakan
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <button
                    key={action.label}
                    onClick={() =>
                      router.push(action.path)
                    }
                    className={`group flex min-h-[84px] items-center gap-3 rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} px-3 py-3 text-left transition duration-200 hover:border-[color-mix(in_srgb,var(--color-primary)_24%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-primary)_7%,transparent)]`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg theme-card theme-text-secondary ${themeSmallShadow} ring-1 ring-[color-mix(in_srgb,var(--color-text)_8%,transparent)] transition group-hover:bg-[var(--color-primary)] group-hover:text-[var(--color-card)]`}
                    >
                      <Icon size={16} />
                    </div>

                    <div className="min-w-0">
                      <p
                        className={`truncate text-[11px] font-semibold theme-text transition group-hover:${themePrimaryText}`}
                      >
                        {action.label}
                      </p>

                      <p className="mt-0.5 truncate text-[9px] theme-text-muted">
                        {action.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ==================================================
              FOOTER
          ================================================== */}

          <footer
            className={`flex flex-col items-center justify-between gap-2 border-t ${themeDivider} py-4 text-center sm:flex-row sm:text-left`}
          >
            <p className="text-[10px] theme-text-muted">
              © 2026 SmartSchool · Super Admin Dashboard
            </p>

            <div className="flex items-center gap-1.5 text-[10px] theme-text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)]" />
              Semua sistem berjalan normal
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}