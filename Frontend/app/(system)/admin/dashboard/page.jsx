"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";

import { adminSidebarConfig } from "../../../../configs/navigation/admin";

import {
  Users,
  UserCheck,
  ClipboardCheck,
  BarChart3,
  ChevronRight,
  RefreshCw,
  School,
  Clock,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  CalendarDays,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { getDashboardSekolah } from "../../../../services/dashboard.service";

const ADMIN_BRAND_NAME =
  adminSidebarConfig?.brandName || "Admin Sekolah";

export default function AdminDashboardPage() {
  const router = useRouter();

  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  /* =========================================================
     FETCH DASHBOARD
  ========================================================= */

  const fetchDashboard = useCallback(async () => {
    try {
      setDashboardLoading(true);
      setDashboardError("");

      const response = await getDashboardSekolah();

      const data = response?.data?.cabang
        ? response.data
        : response?.cabang
        ? response
        : null;

      setDashboardData(data);
    } catch (error) {
      console.error("Error fetch dashboard:", error);

      setDashboardError(
        error?.message || "Gagal mengambil data dashboard."
      );

      setDashboardData(null);
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  /* =========================================================
     DATA
  ========================================================= */

  const cabang = dashboardData?.cabang ?? null;
  const yayasan = dashboardData?.yayasan ?? null;

  const totalSiswa = Number(cabang?.totalSiswa || 0);
  const totalGuru = Number(cabang?.totalGuru || 0);
  const totalKelas = Number(cabang?.totalKelas || 0);

  const persentaseHadir = cabang?.persentaseHadir || "0%";

  const rekapKehadiran = cabang?.rekapKehadiran || {
    hadir: 0,
    izin: 0,
    sakit: 0,
    alpha: 0,
  };

  /* =========================================================
     ATTENDANCE
  ========================================================= */

  const attendanceData = useMemo(
    () => [
      {
        label: "Hadir",
        value: Number(rekapKehadiran?.hadir || 0),
        icon: CheckCircle2,
        colorClass: "theme-success",
        iconColorClass: "text-[var(--color-success)]",
      },
      {
        label: "Izin",
        value: Number(rekapKehadiran?.izin || 0),
        icon: ClipboardCheck,
        colorClass: "theme-info",
        iconColorClass: "text-[var(--color-info)]",
      },
      {
        label: "Sakit",
        value: Number(rekapKehadiran?.sakit || 0),
        icon: AlertCircle,
        colorClass: "theme-warning",
        iconColorClass: "text-[var(--color-warning)]",
      },
      {
        label: "Alpha",
        value: Number(rekapKehadiran?.alpha || 0),
        icon: Clock,
        colorClass: "theme-danger",
        iconColorClass: "text-[var(--color-danger)]",
      },
    ],
    [rekapKehadiran]
  );

  /* =========================================================
     QUICK ACTION
  ========================================================= */

  const quickActions = [
    {
      title: "Tambah Siswa",
      description: "Tambahkan data siswa baru",
      icon: Users,
      href: "/admin/siswa/tambah",
    },
    {
      title: "Tambah Guru",
      description: "Tambahkan data guru baru",
      icon: UserCheck,
      href: "/admin/guru/tambah",
    },
    {
      title: "Kelola Kelas",
      description: "Atur data kelas sekolah",
      icon: School,
      href: "/admin/kelas",
    },
    {
      title: "Tahun Ajaran",
      description: "Kelola tahun ajaran",
      icon: CalendarDays,
      href: "/admin/tahun-ajaran",
    },
  ];

  /* =========================================================
     HELPERS
  ========================================================= */

  const formatNumber = (value) => {
    return new Intl.NumberFormat("id-ID").format(
      Number(value || 0)
    );
  };

  const today = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const currentTime = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div
      className="
        flex
        h-screen
        w-full
        overflow-hidden
        theme-page
        transition-colors
        duration-300
      "
    >
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <div className="shrink-0">
        <Sidebar />
      </div>

      {/* =====================================================
          RIGHT CONTENT
      ===================================================== */}

      <div
        className="
          flex
          min-w-0
          flex-1
          flex-col
          overflow-hidden
        "
      >
        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="relative z-30 shrink-0">
          <Header
            user={{
              name: ADMIN_BRAND_NAME,
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        {/* ===================================================
            MAIN
        =================================================== */}

        <main
          className="
            min-h-0
            min-w-0
            flex-1
            overflow-x-hidden
            overflow-y-auto
            theme-page
            transition-colors
            duration-300
          "
        >
          <div
            className="
              mx-auto
              w-full
              max-w-[1600px]
              px-4
              py-5
              sm:px-6
              sm:py-6
              lg:px-8
            "
          >
            <div className="w-full space-y-6">

              {/* =================================================
                  WELCOME CARD
              ================================================= */}

              <section
                className="
                  relative
                  w-full
                  overflow-hidden
                  rounded-2xl
                  border
                  theme-card
                  theme-border
                  shadow-sm
                  transition
                  duration-300
                  hover:shadow-md
                "
              >
                {/* Decorative */}

                <div
                  className="
                    pointer-events-none
                    absolute
                    -right-20
                    -top-20
                    h-52
                    w-52
                    rounded-full
                    bg-[var(--color-info-background)]
                    opacity-60
                    blur-3xl
                  "
                />

                <div
                  className="
                    pointer-events-none
                    absolute
                    -bottom-20
                    -left-10
                    h-44
                    w-44
                    rounded-full
                    bg-[var(--color-info-background)]
                    opacity-60
                    blur-3xl
                  "
                />

                <div
                  className="
                    relative
                    flex
                    flex-col
                    gap-6
                    p-5
                    sm:p-6
                    lg:flex-row
                    lg:items-center
                    lg:justify-between
                    lg:p-7
                  "
                >
                  <div className="min-w-0">

                    {/* Brand */}

                    <div className="mb-3 flex items-center gap-2">
                      <div
                        className="
                          theme-info
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                        "
                      >
                        <Sparkles className="h-5 w-5" />
                      </div>

                      <span
                        className="
                          text-xs
                          font-semibold
                          uppercase
                          tracking-[0.15em]
                          theme-text
                        "
                      >
                        SmartSchool
                      </span>
                    </div>

                    {/* Title */}

                    <h1
                      className="
                        break-words
                        text-2xl
                        font-bold
                        tracking-tight
                        theme-text
                        sm:text-3xl
                      "
                    >
                      Selamat datang, {ADMIN_BRAND_NAME}
                    </h1>

                    {/* Description */}

                    <p
                      className="
                        mt-2
                        max-w-3xl
                        text-sm
                        leading-relaxed
                        theme-text-secondary
                      "
                    >
                      Pantau statistik sekolah dan kehadiran
                      melalui satu dashboard terintegrasi.
                    </p>

                    {/* Date */}

                    <div
                      className="
                        mt-4
                        flex
                        flex-wrap
                        items-center
                        gap-x-5
                        gap-y-2
                        text-xs
                        theme-text-muted
                      "
                    >
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        <span>{today}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{currentTime} WIB</span>
                      </div>
                    </div>
                  </div>

                  {/* Refresh */}

                  <button
                    type="button"
                    onClick={fetchDashboard}
                    disabled={dashboardLoading}
                    className="
                      theme-primary
                      inline-flex
                      shrink-0
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      px-4
                      py-3
                      text-sm
                      font-semibold
                      shadow-sm
                      transition
                      hover:shadow-md
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    {dashboardLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}

                    {dashboardLoading
                      ? "Memuat..."
                      : "Refresh Data"}
                  </button>
                </div>
              </section>

              {/* =================================================
                  ERROR
              ================================================= */}

              {dashboardError && (
                <section
                  className="
                    theme-danger
                    rounded-2xl
                    border
                    theme-border
                    px-4
                    py-4
                    text-sm
                  "
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                    <div>
                      <p className="font-semibold">
                        Gagal memuat dashboard
                      </p>

                      <p className="mt-1">
                        {dashboardError}
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* =================================================
                  STATISTICS
              ================================================= */}

              <section>
                <div className="mb-4">
                  <h2
                    className="
                      text-lg
                      font-bold
                      theme-text
                    "
                  >
                    Ringkasan Sekolah
                  </h2>

                  <p
                    className="
                      mt-1
                      text-sm
                      theme-text-secondary
                    "
                  >
                    Informasi utama sekolah saat ini.
                  </p>
                </div>

                <div
                  className="
                    grid
                    grid-cols-1
                    gap-4
                    sm:grid-cols-2
                    xl:grid-cols-4
                  "
                >
                  {/* Total Siswa */}

                  <div
                    className="
                      theme-card
                      theme-border
                      rounded-2xl
                      border
                      p-5
                      shadow-sm
                      transition
                      hover:-translate-y-0.5
                      hover:shadow-md
                    "
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium theme-text-secondary">
                          Total Siswa
                        </p>

                        <p className="mt-2 text-3xl font-bold theme-text">
                          {dashboardLoading
                            ? "—"
                            : formatNumber(totalSiswa)}
                        </p>

                        <p className="mt-2 text-xs theme-text-muted">
                          Siswa terdaftar
                        </p>
                      </div>

                      <div className="theme-info flex h-12 w-12 items-center justify-center rounded-xl">
                        <GraduationCap className="h-6 w-6" />
                      </div>
                    </div>
                  </div>

                  {/* Total Guru */}

                  <div
                    className="
                      theme-card
                      theme-border
                      rounded-2xl
                      border
                      p-5
                      shadow-sm
                      transition
                      hover:-translate-y-0.5
                      hover:shadow-md
                    "
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium theme-text-secondary">
                          Total Guru
                        </p>

                        <p className="mt-2 text-3xl font-bold theme-text">
                          {dashboardLoading
                            ? "—"
                            : formatNumber(totalGuru)}
                        </p>

                        <p className="mt-2 text-xs theme-text-muted">
                          Guru terdaftar
                        </p>
                      </div>

                      <div className="theme-primary flex h-12 w-12 items-center justify-center rounded-xl">
                        <UserCheck className="h-6 w-6" />
                      </div>
                    </div>
                  </div>

                  {/* Total Kelas */}

                  <div
                    className="
                      theme-card
                      theme-border
                      rounded-2xl
                      border
                      p-5
                      shadow-sm
                      transition
                      hover:-translate-y-0.5
                      hover:shadow-md
                    "
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium theme-text-secondary">
                          Total Kelas
                        </p>

                        <p className="mt-2 text-3xl font-bold theme-text">
                          {dashboardLoading
                            ? "—"
                            : formatNumber(totalKelas)}
                        </p>

                        <p className="mt-2 text-xs theme-text-muted">
                          Kelas aktif
                        </p>
                      </div>

                      <div className="theme-info flex h-12 w-12 items-center justify-center rounded-xl">
                        <School className="h-6 w-6" />
                      </div>
                    </div>
                  </div>

                  {/* Kehadiran */}

                  <div
                    className="
                      theme-card
                      theme-border
                      rounded-2xl
                      border
                      p-5
                      shadow-sm
                      transition
                      hover:-translate-y-0.5
                      hover:shadow-md
                    "
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium theme-text-secondary">
                          Kehadiran
                        </p>

                        <p className="mt-2 text-3xl font-bold theme-text">
                          {dashboardLoading
                            ? "—"
                            : persentaseHadir}
                        </p>

                        <p className="mt-2 text-xs theme-text-muted">
                          Persentase kehadiran
                        </p>
                      </div>

                      <div className="theme-success flex h-12 w-12 items-center justify-center rounded-xl">
                        <BarChart3 className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* =================================================
                  REKAP KEHADIRAN
              ================================================= */}

              <section>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold theme-text">
                      Rekap Kehadiran
                    </h2>

                    <p className="mt-1 text-sm theme-text-secondary">
                      Ringkasan status kehadiran siswa.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      router.push("/admin/manajemenKehadiran")
                    }
                    className="
                      hidden
                      items-center
                      gap-1
                      text-sm
                      font-semibold
                      theme-primary-outline
                      sm:flex
                    "
                  >
                    Lihat detail
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div
                  className="
                    grid
                    grid-cols-2
                    gap-4
                    lg:grid-cols-4
                  "
                >
                  {attendanceData.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className="
                          theme-card
                          theme-border
                          rounded-2xl
                          border
                          p-5
                          shadow-sm
                          transition
                          hover:-translate-y-0.5
                          hover:shadow-md
                        "
                      >
                        {/* =================================================
                            SATU CARD SAJA
                            Angka TIDAK dibungkus card/background
                        ================================================== */}

                        <div className="flex items-center gap-4">
                          {/* Icon */}

                          <div
                            className={`
                              ${item.colorClass}
                              flex
                              h-11
                              w-11
                              shrink-0
                              items-center
                              justify-center
                              rounded-xl
                            `}
                          >
                            <Icon className="h-5 w-5" />
                          </div>

                          {/* Label + angka */}

                          <div className="min-w-0">
                            <p className="text-sm font-semibold theme-text">
                              {item.label}
                            </p>

                            <p
                              className={`
                                mt-1
                                text-2xl
                                font-bold
                                leading-none
                                ${item.iconColorClass}
                              `}
                            >
                              {dashboardLoading
                                ? "—"
                                : formatNumber(item.value)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/admin/manajemenKehadiran")
                  }
                  className="
                    theme-card
                    theme-border
                    mt-4
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    theme-primary-outline
                    transition
                    sm:hidden
                  "
                >
                  Lihat detail kehadiran
                  <ChevronRight className="h-4 w-4" />
                </button>
              </section>

              {/* =================================================
                  SEKOLAH + YAYASAN
              ================================================= */}

              <section
                className="
                  grid
                  grid-cols-1
                  gap-5
                  xl:grid-cols-2
                "
              >
                {/* Informasi Sekolah */}

                <div
                  className="
                    theme-card
                    theme-border
                    rounded-2xl
                    border
                    p-5
                    shadow-sm
                    transition
                    hover:shadow-md
                    sm:p-6
                  "
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="
                        theme-info
                        flex
                        h-12
                        w-12
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                      "
                    >
                      <School className="h-6 w-6" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-bold theme-text">
                        Informasi Sekolah
                      </h3>

                      <p className="mt-1 text-sm theme-text-secondary">
                        Informasi cabang sekolah yang sedang aktif.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-4
                        border-b
                        theme-border-soft
                        pb-4
                      "
                    >
                      <span className="text-sm theme-text-secondary">
                        Nama Sekolah
                      </span>

                      <span
                        className="
                          max-w-[60%]
                          text-right
                          text-sm
                          font-semibold
                          theme-text
                        "
                      >
                        {cabang?.nama || "-"}
                      </span>
                    </div>

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-4
                        border-b
                        theme-border-soft
                        pb-4
                      "
                    >
                      <span className="text-sm theme-text-secondary">
                        Jenjang
                      </span>

                      <span className="text-sm font-semibold theme-text">
                        {cabang?.jenjang || "-"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm theme-text-secondary">
                        Status
                      </span>

                      <span className="theme-success inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        Aktif
                      </span>
                    </div>
                  </div>
                </div>

                {/* Informasi Yayasan */}

                <div
                  className="
                    theme-card
                    theme-border
                    rounded-2xl
                    border
                    p-5
                    shadow-sm
                    transition
                    hover:shadow-md
                    sm:p-6
                  "
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="
                        theme-primary
                        flex
                        h-12
                        w-12
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                      "
                    >
                      <GraduationCap className="h-6 w-6" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-bold theme-text">
                        Informasi Yayasan
                      </h3>

                      <p className="mt-1 text-sm theme-text-secondary">
                        Informasi yayasan yang menaungi sekolah.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-4
                        border-b
                        theme-border-soft
                        pb-4
                      "
                    >
                      <span className="text-sm theme-text-secondary">
                        Nama Yayasan
                      </span>

                      <span
                        className="
                          max-w-[60%]
                          text-right
                          text-sm
                          font-semibold
                          theme-text
                        "
                      >
                        {yayasan?.nama || "-"}
                      </span>
                    </div>

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-4
                        border-b
                        theme-border-soft
                        pb-4
                      "
                    >
                      <span className="text-sm theme-text-secondary">
                        Total Sekolah
                      </span>

                      <span className="text-sm font-semibold theme-text">
                        {formatNumber(
                          yayasan?.totalSekolah || 0
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm theme-text-secondary">
                        Status
                      </span>

                      <span className="theme-info inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        Terhubung
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* =================================================
                  QUICK ACTION
              ================================================= */}

              <section>
                <div className="mb-4">
                  <h2 className="text-lg font-bold theme-text">
                    Aksi Cepat
                  </h2>

                  <p className="mt-1 text-sm theme-text-secondary">
                    Akses beberapa pengelolaan yang sering digunakan.
                  </p>
                </div>

                <div
                  className="
                    grid
                    grid-cols-1
                    gap-4
                    sm:grid-cols-2
                    xl:grid-cols-4
                  "
                >
                  {quickActions.map((action) => {
                    const Icon = action.icon;

                    return (
                      <button
                        key={action.title}
                        type="button"
                        onClick={() => router.push(action.href)}
                        className="
                          group
                          theme-card
                          theme-border
                          w-full
                          rounded-2xl
                          border
                          p-5
                          text-left
                          shadow-sm
                          transition
                          hover:-translate-y-0.5
                          hover:shadow-md
                        "
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div
                            className="
                              theme-info
                              flex
                              h-11
                              w-11
                              items-center
                              justify-center
                              rounded-xl
                              transition
                            "
                          >
                            <Icon className="h-5 w-5" />
                          </div>

                          <ChevronRight
                            className="
                              h-5
                              w-5
                              theme-text-muted
                              transition
                              group-hover:translate-x-1
                            "
                          />
                        </div>

                        <h3 className="mt-5 font-semibold theme-text">
                          {action.title}
                        </h3>

                        <p className="mt-1 text-sm theme-text-secondary">
                          {action.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* =================================================
                  FOOTER
              ================================================= */}

              <footer className="border-t theme-border-soft pt-6">
                <div
                  className="
                    flex
                    flex-col
                    items-center
                    justify-between
                    gap-3
                    text-center
                    text-xs
                    theme-text-muted
                    sm:flex-row
                    sm:text-left
                  "
                >
                  <p>
                    © {new Date().getFullYear()} SmartSchool —{" "}
                    {ADMIN_BRAND_NAME}
                  </p>

                  <p className="flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    School Management System
                  </p>
                </div>
              </footer>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}