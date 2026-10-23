
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { adminSidebarConfig } from "../../../../configs/navigation/admin";

import {
  Users,
  UserCheck,
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
  ClipboardCheck,
} from "lucide-react";

import { getDashboardSekolah } from "@/services/dashboard.service";

const ADMIN_BRAND_NAME =
  adminSidebarConfig?.brandName || "Admin Sekolah";

export default function AdminDashboardPage() {
  const router = useRouter();

  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");


  const fetchDashboard = useCallback(async () => {
    try {
      setDashboardLoading(true);
      setDashboardError("");

      const response = await getDashboardSekolah();

      if (response?.success !== true) {
        throw new Error(
          response?.message || "Gagal mengambil data dashboard."
        );
      }

      if (!response.data || !response.data.cabang) {
        throw new Error(
          "Data cabang tidak tersedia pada response backend."
        );
      }

      setDashboardData(response.data);
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


  const cabang = dashboardData?.cabang ?? null;

  const yayasan = dashboardData?.yayasan ?? null;

  const formatNumber = (value) =>
    new Intl.NumberFormat("id-ID").format(value);

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


const attendanceData = useMemo(() => {
  if (!cabang?.rekapKehadiran) {
    return [];
  }

  const rekap = cabang.rekapKehadiran;

  return [
    {
      label: "Hadir",
      value: rekap.hadir,
      icon: CheckCircle2,
      colorClass: "theme-success",
      iconColorClass: "text-[var(--color-success)]",
    },
    {
      label: "Izin",
      value: rekap.izin,
      icon: ClipboardCheck,
      colorClass: "theme-info",
      iconColorClass: "text-[var(--color-info)]",
    },
    {
      label: "Sakit",
      value: rekap.sakit,
      icon: AlertCircle,
      colorClass: "theme-warning",
      iconColorClass: "text-[var(--color-warning)]",
    },
    {
      label: "Alpha",
      value: rekap.alpha,
      icon: Clock,
      colorClass: "theme-danger",
      iconColorClass: "text-[var(--color-danger)]",
    },
  ];
}, [cabang]);


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
      description: "Kelola data kelas sekolah",
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


  return (
    <div className="flex h-screen w-full overflow-hidden theme-page transition-colors duration-300">
      <div className="shrink-0">
        <Sidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="relative z-30 shrink-0">
          <Header
            user={{
              name: ADMIN_BRAND_NAME,
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto theme-page transition-colors duration-300">
          <div className="w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
            <div className="w-full space-y-6">

              <section className="relative w-full overflow-hidden rounded-2xl border theme-card theme-border shadow-sm transition duration-300 hover:shadow-md">
                <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[var(--color-info-background)] opacity-60 blur-3xl" />

                <div className="pointer-events-none absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-[var(--color-info-background)] opacity-60 blur-3xl" />

                <div className="relative flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:p-7">
                  <div className="min-w-0">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="theme-info flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
                        <Sparkles className="h-5 w-5" />
                      </div>

                      <span className="text-xs font-semibold uppercase tracking-[0.15em] theme-text">
                        SmartSchool
                      </span>
                    </div>

                    <h1 className="break-words text-2xl font-bold tracking-tight theme-text sm:text-3xl">
                      Selamat datang, {ADMIN_BRAND_NAME}
                    </h1>

                    <p className="mt-2 max-w-3xl text-sm leading-relaxed theme-text-secondary">
                      Pantau statistik sekolah dan rekap kehadiran
                      berdasarkan data dari backend.
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs theme-text-muted">
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

                  <button
                    type="button"
                    onClick={fetchDashboard}
                    disabled={dashboardLoading}
                    className="theme-primary inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {dashboardLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}

                    {dashboardLoading ? "Memuat..." : "Refresh Data"}
                  </button>
                </div>
              </section>


              {dashboardError && (
                <section className="theme-danger rounded-2xl border theme-border px-4 py-4 text-sm">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                    <div>
                      <p className="font-semibold">
                        Gagal memuat dashboard
                      </p>

                      <p className="mt-1">{dashboardError}</p>

                      <button
                        type="button"
                        onClick={fetchDashboard}
                        className="mt-3 font-semibold underline"
                      >
                        Coba lagi
                      </button>
                    </div>
                  </div>
                </section>
              )}


              <section>
                <div className="mb-4">
                  <h2 className="text-lg font-bold theme-text">
                    Ringkasan Sekolah
                  </h2>

                  <p className="mt-1 text-sm theme-text-secondary">
                    Statistik yang dikirim oleh backend.
                  </p>
                </div>

                {dashboardLoading && !dashboardData ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[1, 2, 3, 4].map((item) => (
                      <div
                        key={item}
                        className="theme-card theme-border animate-pulse rounded-2xl border p-5"
                      >
                        <div className="h-4 w-28 rounded theme-border-soft bg-[var(--color-info-background)]" />
                        <div className="mt-4 h-8 w-20 rounded theme-border-soft bg-[var(--color-info-background)]" />
                        <div className="mt-3 h-3 w-32 rounded theme-border-soft bg-[var(--color-info-background)]" />
                      </div>
                    ))}
                  </div>
                ) : dashboardData ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    <StatCard
                      title="Total Siswa"
                      value={formatNumber(cabang.totalSiswa)}
                      description="Siswa aktif"
                      icon={GraduationCap}
                      iconClass="theme-info"
                    />


                    <StatCard
                      title="Total Guru"
                      value={formatNumber(cabang.totalGuru)}
                      description="Guru aktif"
                      icon={UserCheck}
                      iconClass="theme-primary"
                    />


                    <StatCard
                      title="Total Kelas"
                      value={formatNumber(cabang.totalKelas)}
                      description="Jumlah kelas"
                      icon={School}
                      iconClass="theme-info"
                    />


                    <StatCard
                      title="Kehadiran"
                      value={cabang.persentaseHadir}
                      description="Persentase dari backend"
                      icon={BarChart3}
                      iconClass="theme-success"
                    />
                  </div>
                ) : !dashboardError ? (
                  <p className="text-sm theme-text-secondary">
                    Data dashboard belum tersedia.
                  </p>
                ) : null}
              </section>


              {dashboardData && cabang.rekapKehadiran && (
                <section>
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold theme-text">
                        Rekap Kehadiran
                      </h2>

                      <p className="mt-1 text-sm theme-text-secondary">
                        Rekap absensi hari ini sesuai data backend.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        router.push("/admin/manajemenKehadiran")
                      }
                      className="hidden items-center gap-1 text-sm font-semibold theme-primary-outline sm:flex"
                    >
                      Lihat detail
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {attendanceData.map((item) => {
                      const Icon = item.icon;

                      return (
                        <div
                          key={item.label}
                          className="theme-card theme-border rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`${item.colorClass} flex h-11 w-11 shrink-0 items-center justify-center rounded-xl`}
                            >
                              <Icon className="h-5 w-5" />
                            </div>

                            <div className="min-w-0">
                              <p className="text-sm font-semibold theme-text">
                                {item.label}
                              </p>

                              <p
                                className={`mt-1 text-2xl font-bold leading-none ${item.iconColorClass}`}
                              >
                                {formatNumber(item.value)}
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
                    className="theme-card theme-border mt-4 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold theme-primary-outline transition sm:hidden"
                  >
                    Lihat detail kehadiran
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </section>
              )}


              {yayasan && (
                <section>
                  <div className="theme-card theme-border rounded-2xl border p-5 shadow-sm sm:p-6">
                    <div className="flex items-start gap-4">
                      <div className="theme-info flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                        <GraduationCap className="h-6 w-6" />
                      </div>

                      <div>
                        <h2 className="font-bold theme-text">
                          Statistik Yayasan
                        </h2>

                        <p className="mt-1 text-sm theme-text-secondary">
                          Statistik yayasan yang dikirim oleh backend.
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <StatCard
                        title="Total Sekolah"
                        value={formatNumber(yayasan.totalSekolah)}
                        icon={School}
                        iconClass="theme-info"
                      />

                      <StatCard
                        title="Total Siswa Yayasan"
                        value={formatNumber(yayasan.totalSiswa)}
                        icon={GraduationCap}
                        iconClass="theme-info"
                      />

                      <StatCard
                        title="Total Guru Yayasan"
                        value={formatNumber(yayasan.totalGuru)}
                        icon={UserCheck}
                        iconClass="theme-primary"
                      />

                      <StatCard
                        title="Total Kelas Yayasan"
                        value={formatNumber(yayasan.totalKelas)}
                        icon={Users}
                        iconClass="theme-info"
                      />
                    </div>
                  </div>
                </section>
              )}


              <section>
                <div className="mb-4">
                  <h2 className="text-lg font-bold theme-text">
                    Aksi Cepat
                  </h2>

                  <p className="mt-1 text-sm theme-text-secondary">
                    Akses menu pengelolaan sekolah.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {quickActions.map((action) => {
                    const Icon = action.icon;

                    return (
                      <button
                        key={action.title}
                        type="button"
                        onClick={() => router.push(action.href)}
                        className="group theme-card theme-border w-full rounded-2xl border p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="theme-info flex h-11 w-11 items-center justify-center rounded-xl">
                            <Icon className="h-5 w-5" />
                          </div>

                          <ChevronRight className="h-5 w-5 theme-text-muted transition group-hover:translate-x-1" />
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


              <footer className="border-t theme-border-soft pt-6">
                <div className="flex flex-col items-center justify-between gap-3 text-center text-xs theme-text-muted sm:flex-row sm:text-left">
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


function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClass = "theme-info",
}) {
  return (
    <div className="theme-card theme-border rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium theme-text-secondary">
            {title}
          </p>

          <p className="mt-2 break-words text-3xl font-bold theme-text">
            {value}
          </p>

          {description && (
            <p className="mt-2 text-xs theme-text-muted">
              {description}
            </p>
          )}
        </div>

        <div
          className={`${iconClass} flex h-12 w-12 shrink-0 items-center justify-center rounded-xl`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
