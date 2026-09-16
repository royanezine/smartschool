"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";

import {
  Users,
  UserCheck,
  ClipboardCheck,
  Bell,
  BarChart3,
  ChevronRight,
  RefreshCw,
  School,
  Clock,
  CheckCircle2,
  Settings,
  Plus,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  ArrowRight,
  CalendarDays,
  AlertCircle,
  XCircle,
  Loader2,
} from "lucide-react";

import { getDashboardSekolah } from "../../../services/dashboard.service";

/* =========================================================
   HELPERS
========================================================= */

const formatNumber = (value) => {
  return Number(value || 0).toLocaleString("id-ID");
};

const calculatePercentage = (value, total) => {
  if (!total) return 0;

  return Number(
    ((Number(value || 0) / Number(total)) * 100).toFixed(1)
  );
};

/* =========================================================
   COMPONENT
========================================================= */

export default function AdminDashboardPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(null);

  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] =
    useState(true);
  const [dashboardError, setDashboardError] =
    useState("");

  /* =======================================================
     FETCH DASHBOARD
  ======================================================= */

  const fetchDashboard = useCallback(async () => {
    try {
      setDashboardLoading(true);
      setDashboardError("");

      const response =
        await getDashboardSekolah();

      /*
       * Response BE:
       *
       * {
       *   success: true,
       *   message: "...",
       *   data: {
       *     cabang: {...},
       *     yayasan: {...}
       *   }
       * }
       *
       * Service juga dapat dipakai pada helper yang
       * melakukan unwrap response.
       */

      const data =
        response?.data?.cabang
          ? response.data
          : response?.cabang
          ? response
          : null;

      setDashboardData(data);
    } catch (error) {
      console.error(
        "Error fetch dashboard:",
        error
      );

      setDashboardError(
        error?.message ||
          "Gagal mengambil data dashboard."
      );
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  /* =======================================================
     EFFECT
  ======================================================= */

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    setCurrentTime(new Date());

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  /* =======================================================
     DATA BE
  ======================================================= */

  const cabang =
    dashboardData?.cabang ?? null;

  const yayasan =
    dashboardData?.yayasan ?? null;

  const totalSiswa =
    Number(cabang?.totalSiswa || 0);

  const totalGuru =
    Number(cabang?.totalGuru || 0);

  const totalKelas =
    Number(cabang?.totalKelas || 0);

  const persentaseHadir =
    cabang?.persentaseHadir || "0%";

  const rekapKehadiran =
    cabang?.rekapKehadiran || {
      hadir: 0,
      izin: 0,
      sakit: 0,
      alpha: 0,
    };

  const attendanceData =
    useMemo(
      () => [
        {
          label: "Hadir",
          value: calculatePercentage(
            rekapKehadiran.hadir,
            totalSiswa
          ),
          count:
            rekapKehadiran.hadir || 0,
          color:
            "bg-emerald-500",
        },
        {
          label: "Izin",
          value: calculatePercentage(
            rekapKehadiran.izin,
            totalSiswa
          ),
          count:
            rekapKehadiran.izin || 0,
          color:
            "bg-amber-400",
        },
        {
          label: "Sakit",
          value: calculatePercentage(
            rekapKehadiran.sakit,
            totalSiswa
          ),
          count:
            rekapKehadiran.sakit || 0,
          color:
            "bg-sky-500",
        },
        {
          label: "Alpha",
          value: calculatePercentage(
            rekapKehadiran.alpha,
            totalSiswa
          ),
          count:
            rekapKehadiran.alpha || 0,
          color:
            "bg-rose-400",
        },
      ],
      [
        rekapKehadiran,
        totalSiswa,
      ]
    );

  /* =======================================================
     FORMAT DATE
  ======================================================= */

  const formatDate = (date) => {
    if (!date) return "";

    return date.toLocaleDateString(
      "id-ID",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  const formatTime = (date) => {
    if (!date) return "";

    return date.toLocaleTimeString(
      "id-ID",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <div className="shrink-0">
        <Sidebar
          active="dashboard"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
        />
      </div>

      {/* =====================================================
          MAIN AREA
      ====================================================== */}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* HEADER */}

        <div className="shrink-0">
          <Header
            toggleSidebar={() =>
              setIsCollapsed(
                (prev) => !prev
              )
            }
            notifications={[]}
            user={{
              name:
                "Admin Sekolah",
              email:
                "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        {/* ===================================================
            CONTENT
        ==================================================== */}

        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto">

          <div className="w-full min-w-0 px-3 py-4 sm:px-5 sm:py-5 lg:px-6 xl:px-8">

            <div className="w-full min-w-0 space-y-5 sm:space-y-6">

              {/* =================================================
                  HERO
              ================================================== */}

              <section className="relative w-full min-w-0 overflow-hidden rounded-2xl bg-[#0F172A] px-5 py-6 text-white shadow-md sm:px-6 sm:py-7">

                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-400/10 blur-2xl" />

                <div className="pointer-events-none absolute -bottom-16 right-20 h-40 w-40 rounded-full bg-indigo-400/10 blur-2xl" />

                <div className="relative z-10 flex min-w-0 flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                  <div className="min-w-0 flex-1">

                    <div className="mb-2 flex flex-wrap items-center gap-2">

                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-medium text-blue-100">

                        <Sparkles size={14} />

                        SmartSchool

                      </span>

                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-medium text-emerald-200">

                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                        Sistem Aktif

                      </span>

                    </div>

                    <h1 className="break-words text-2xl font-bold tracking-tight sm:text-3xl">
                      Selamat datang, Admin Sekolah
                    </h1>

                    <p className="mt-1 max-w-3xl text-sm leading-relaxed text-blue-100/80">
                      Pantau statistik sekolah dan
                      kehadiran siswa melalui
                      satu dashboard terintegrasi.
                    </p>

                    {currentTime && (
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-blue-100/70">

                        <span className="flex items-center gap-1.5">
                          <CalendarDays size={14} />
                          {formatDate(currentTime)}
                        </span>

                        <span className="hidden h-1 w-1 rounded-full bg-blue-300/40 sm:block" />

                        <span className="flex items-center gap-1.5">
                          <Clock size={14} />
                          {formatTime(currentTime)} WIB
                        </span>

                      </div>
                    )}

                  </div>

                  <button
                    onClick={fetchDashboard}
                    disabled={dashboardLoading}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-semibold text-[#0F172A] shadow-sm transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {dashboardLoading ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <RefreshCw size={16} />
                    )}

                    Refresh

                  </button>

                </div>
              </section>

              {/* =================================================
                  ERROR
              ================================================== */}

              {dashboardError && (
                <section className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">

                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <div className="min-w-0 flex-1">

                    <p className="text-sm font-semibold">
                      Gagal memuat dashboard
                    </p>

                    <p className="mt-1 text-xs">
                      {dashboardError}
                    </p>

                  </div>

                  <button
                    onClick={fetchDashboard}
                    className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold shadow-sm"
                  >
                    Coba Lagi
                  </button>

                </section>
              )}

              {/* =================================================
                  STATS
              ================================================== */}

              <section className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

                {[
                  {
                    label:
                      "Total Siswa",
                    value:
                      totalSiswa,
                    description:
                      "siswa aktif",
                    icon:
                      Users,
                    iconClass:
                      "bg-emerald-50 text-emerald-600",
                    lineClass:
                      "bg-emerald-500",
                  },
                  {
                    label:
                      "Total Guru",
                    value:
                      totalGuru,
                    description:
                      "guru aktif",
                    icon:
                      UserCheck,
                    iconClass:
                      "bg-violet-50 text-violet-600",
                    lineClass:
                      "bg-violet-500",
                  },
                  {
                    label:
                      "Total Kelas",
                    value:
                      totalKelas,
                    description:
                      "kelas",
                    icon:
                      School,
                    iconClass:
                      "bg-blue-50 text-blue-600",
                    lineClass:
                      "bg-blue-500",
                  },
                  {
                    label:
                      "Kehadiran",
                    value:
                      persentaseHadir,
                    description:
                      "hari ini",
                    icon:
                      ClipboardCheck,
                    iconClass:
                      "bg-amber-50 text-amber-600",
                    lineClass:
                      "bg-amber-500",
                    isText:
                      true,
                  },
                ].map((stat) => {

                  const Icon =
                    stat.icon;

                  return (
                    <div
                      key={stat.label}
                      className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                    >

                      <div className="flex items-start justify-between gap-2">

                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${stat.iconClass}`}
                        >
                          <Icon
                            size={18}
                            strokeWidth={2}
                          />
                        </div>

                        <span className="rounded bg-slate-50 px-1.5 py-1 text-[9px] font-semibold text-slate-400">
                          Data BE
                        </span>

                      </div>

                      <div className="mt-3 min-w-0">

                        <p className="truncate text-[10px] font-medium uppercase tracking-wider text-slate-400">
                          {stat.label}
                        </p>

                        <p className="mt-0.5 truncate text-xl font-bold tracking-tight text-slate-800">
                          {dashboardLoading
                            ? "..."
                            : stat.isText
                            ? stat.value
                            : formatNumber(
                                stat.value
                              )}
                        </p>

                        <p className="mt-0.5 truncate text-[10px] text-slate-400">
                          {stat.description}
                        </p>

                      </div>

                      <div
                        className={`mt-3 h-0.5 w-full rounded-full ${stat.lineClass} opacity-40`}
                      />

                    </div>
                  );
                })}

              </section>

              {/* =================================================
                  KEHADIRAN + SEKOLAH
              ================================================== */}

              <section className="grid w-full min-w-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">

                {/* KEHADIRAN */}

                <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                  <div className="flex min-w-0 flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex min-w-0 items-center gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <BarChart3 size={18} />
                      </div>

                      <div className="min-w-0">

                        <h2 className="truncate text-sm font-semibold text-slate-700">
                          Statistik Kehadiran
                        </h2>

                        <p className="truncate text-[10px] text-slate-400">
                          Rekap kehadiran siswa hari ini
                        </p>

                      </div>

                    </div>

                    <button
                      onClick={() =>
                        router.push(
                          "/admin/absensi"
                        )
                      }
                      className="flex shrink-0 items-center gap-1 self-start rounded-lg px-2 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-50 sm:self-auto"
                    >
                      Detail
                      <ChevronRight
                        size={14}
                      />
                    </button>

                  </div>

                  <div className="grid min-w-0 grid-cols-1 gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_220px]">

                    {/* DATA */}

                    <div className="min-w-0">

                      <div className="mb-5 flex items-end justify-between gap-3">

                        <div>

                          <p className="text-3xl font-bold tracking-tight text-slate-800">
                            {dashboardLoading
                              ? "..."
                              : persentaseHadir}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-400">
                            Persentase hadir
                          </p>

                        </div>

                        <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-1 text-[9px] font-semibold text-emerald-600">
                          <CheckCircle2
                            size={12}
                          />
                          Hari ini
                        </span>

                      </div>

                      <div className="space-y-4">

                        {attendanceData.map(
                          (item) => (
                            <div
                              key={
                                item.label
                              }
                            >

                              <div className="flex items-center justify-between gap-3">

                                <span className="text-xs font-medium text-slate-600">
                                  {item.label}
                                </span>

                                <div className="flex items-center gap-2">

                                  <span className="text-sm font-bold text-slate-700">
                                    {dashboardLoading
                                      ? "..."
                                      : formatNumber(
                                          item.count
                                        )}
                                  </span>

                                  <span className="text-[10px] text-slate-400">
                                    {dashboardLoading
                                      ? "..."
                                      : `${item.value}%`}
                                  </span>

                                </div>

                              </div>

                              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">

                                <div
                                  className={`h-full rounded-full ${item.color} transition-all duration-500`}
                                  style={{
                                    width: `${Math.min(
                                      item.value,
                                      100
                                    )}%`,
                                  }}
                                />

                              </div>

                            </div>
                          )
                        )}

                      </div>

                    </div>

                    {/* RINGKASAN */}

                    <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/60 p-4">

                      <div className="flex items-center justify-between">

                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Ringkasan
                        </p>

                        <CheckCircle2
                          size={16}
                          className="text-emerald-500"
                        />

                      </div>

                      <div className="mt-4 space-y-4">

                        {attendanceData.map(
                          (item) => (
                            <div
                              key={
                                item.label
                              }
                              className="flex items-center justify-between gap-3"
                            >

                              <span className="text-[10px] text-slate-500">
                                {item.label}
                              </span>

                              <span className="text-xs font-semibold text-slate-700">
                                {dashboardLoading
                                  ? "..."
                                  : formatNumber(
                                      item.count
                                    )}
                              </span>

                            </div>
                          )
                        )}

                      </div>

                      <div className="mt-5 border-t border-slate-200 pt-4">

                        <div className="flex items-center justify-between">

                          <span className="text-[10px] text-slate-500">
                            Total Siswa
                          </span>

                          <span className="text-sm font-bold text-slate-700">
                            {dashboardLoading
                              ? "..."
                              : formatNumber(
                                  totalSiswa
                                )}
                          </span>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

                {/* RINGKASAN SEKOLAH */}

                <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                  <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                      <School size={18} />
                    </div>

                    <div className="min-w-0">

                      <h2 className="truncate text-sm font-semibold text-slate-700">
                        Ringkasan Sekolah
                      </h2>

                      <p className="truncate text-[10px] text-slate-400">
                        Statistik cabang dari BE
                      </p>

                    </div>

                  </div>

                  <div className="px-5">

                    {[
                      {
                        label:
                          "Total Siswa",
                        value:
                          totalSiswa,
                        icon:
                          Users,
                        color:
                          "text-emerald-500",
                        bg:
                          "bg-emerald-50",
                      },
                      {
                        label:
                          "Total Guru",
                        value:
                          totalGuru,
                        icon:
                          UserCheck,
                        color:
                          "text-violet-500",
                        bg:
                          "bg-violet-50",
                      },
                      {
                        label:
                          "Total Kelas",
                        value:
                          totalKelas,
                        icon:
                          School,
                        color:
                          "text-blue-500",
                        bg:
                          "bg-blue-50",
                      },
                      {
                        label:
                          "Kehadiran",
                        value:
                          persentaseHadir,
                        icon:
                          CheckCircle2,
                        color:
                          "text-amber-500",
                        bg:
                          "bg-amber-50",
                        isText:
                          true,
                      },
                    ].map(
                      (item) => {
                        const Icon =
                          item.icon;

                        return (
                          <div
                            key={
                              item.label
                            }
                            className="flex min-w-0 items-center justify-between gap-3 border-b border-slate-100 py-3 last:border-0"
                          >

                            <div className="flex min-w-0 items-center gap-2.5">

                              <div
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${item.bg}`}
                              >
                                <Icon
                                  size={14}
                                  className={
                                    item.color
                                  }
                                  strokeWidth={
                                    2
                                  }
                                />
                              </div>

                              <span className="truncate text-xs text-slate-500">
                                {item.label}
                              </span>

                            </div>

                            <span className="shrink-0 text-sm font-bold text-slate-700">
                              {dashboardLoading
                                ? "..."
                                : item.isText
                                ? item.value
                                : formatNumber(
                                    item.value
                                  )}
                            </span>

                          </div>
                        );
                      }
                    )}

                  </div>

                  <div className="px-5 pb-5 pt-3">

                    <button
                      onClick={() =>
                        router.push(
                          "/admin/absensi"
                        )
                      }
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#0F172A] py-2.5 text-xs font-semibold text-white transition hover:bg-[#1E293B]"
                    >
                      Kelola Absensi
                      <ChevronRight
                        size={14}
                      />
                    </button>

                  </div>

                </div>

              </section>

              {/* =================================================
                  YAYASAN
              ================================================== */}

              {yayasan && (
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                  <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <School size={18} />
                    </div>

                    <div>

                      <h2 className="text-sm font-semibold text-slate-700">
                        Ringkasan Yayasan
                      </h2>

                      <p className="text-[10px] text-slate-400">
                        Statistik seluruh sekolah
                        dalam yayasan
                      </p>

                    </div>

                  </div>

                  <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-3">

                    {[
                      {
                        label:
                          "Total Siswa",
                        value:
                          yayasan.totalSiswa,
                        icon:
                          Users,
                      },
                      {
                        label:
                          "Total Guru",
                        value:
                          yayasan.totalGuru,
                        icon:
                          UserCheck,
                      },
                      {
                        label:
                          "Total Kelas",
                        value:
                          yayasan.totalKelas,
                        icon:
                          School,
                      },
                    ].map(
                      (item) => {
                        const Icon =
                          item.icon;

                        return (
                          <div
                            key={
                              item.label
                            }
                            className="rounded-xl border border-slate-100 bg-slate-50/60 p-4"
                          >

                            <div className="flex items-center gap-2">

                              <Icon
                                size={15}
                                className="text-indigo-600"
                              />

                              <span className="text-[10px] font-medium text-slate-500">
                                {item.label}
                              </span>

                            </div>

                            <p className="mt-2 text-xl font-bold text-slate-800">
                              {formatNumber(
                                item.value
                              )}
                            </p>

                          </div>
                        );
                      }
                    )}

                  </div>

                </section>
              )}

              {/* =================================================
                  QUICK ACTION
              ================================================== */}

              <section className="w-full min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                <div className="flex min-w-0 flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex min-w-0 items-center gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Plus size={18} />
                    </div>

                    <div className="min-w-0">

                      <h2 className="truncate text-sm font-semibold text-slate-700">
                        Aksi Cepat
                      </h2>

                      <p className="truncate text-[10px] text-slate-400">
                        Menu yang sering digunakan
                      </p>

                    </div>

                  </div>

                </div>

                <div className="grid min-w-0 grid-cols-1 gap-3 p-4 sm:grid-cols-2 md:grid-cols-3">

                  {[
                    {
                      label:
                        "Tambah Siswa",
                      description:
                        "Data siswa",
                      icon:
                        Users,
                      path:
                        "/admin/siswa",
                    },
                    {
                      label:
                        "Tambah Guru",
                      description:
                        "Data guru",
                      icon:
                        UserCheck,
                      path:
                        "/admin/guru",
                    },
                    {
                      label:
                        "Buat Kelas",
                      description:
                        "Kelola kelas",
                      icon:
                        GraduationCap,
                      path:
                        "/admin/kelas",
                    },
                    {
                      label:
                        "Buat Jadwal",
                      description:
                        "Jadwal sekolah",
                      icon:
                        CalendarDays,
                      path:
                        "/admin/jadwal",
                    },
                    {
                      label:
                        "Input Absensi",
                      description:
                        "Kehadiran",
                      icon:
                        ClipboardCheck,
                      path:
                        "/admin/absensi",
                    },
                  ].map(
                    (action) => {
                      const Icon =
                        action.icon;

                      return (
                        <button
                          key={
                            action.label
                          }
                          onClick={() =>
                            router.push(
                              action.path
                            )
                          }
                          className="group flex min-w-0 items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50/30"
                        >

                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-50 text-slate-500 transition group-hover:bg-blue-100 group-hover:text-blue-600">
                            <Icon size={16} />
                          </div>

                          <div className="min-w-0">

                            <span className="block truncate text-xs font-semibold text-slate-600">
                              {action.label}
                            </span>

                            <span className="block truncate text-[9px] text-slate-400">
                              {action.description}
                            </span>

                          </div>

                        </button>
                      );
                    }
                  )}

                </div>

              </section>

              {/* FOOTER */}

              <footer className="border-t border-slate-200 py-4 text-center">

                <p className="text-[10px] text-slate-400">
                  &copy; 2026 SmartSchool
                  &bull; Dashboard Admin
                  Sekolah
                </p>

              </footer>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}