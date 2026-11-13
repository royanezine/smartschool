"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { hasMenuAccess } from "@/lib/auth";

import {
  ClipboardCheck,
  FileText,
  Clock3,
  Activity,
  Settings,
  Briefcase,
  Users,
  CalendarDays,
  ChevronRight,
  TrendingUp,
  UserCheck,
  AlertCircle,
  FileBarChart,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

import { getAbsensiSekolah } from "@/services/absensi.service";
import { getUsers } from "@/services/user.service"; // sesuaikan path
import { getShiftKerja } from "@/services/shiftKerja.service"; // sesuaikan path

function todayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function RangkumanPresensiPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    totalPengguna: 0,
    totalSiswa: 0,
    hadirHariIni: 0,
    terlambatHariIni: 0,
    tidakHadirHariIni: 0,
    totalShiftAktif: 0,
    totalIzinPending: 0,
    persenHadir: 0,
    trendMingguIni: 0,
  });

  const loadDashboard = useCallback(async () => {
    if (!hasMenuAccess("monitoring absensi", "view")) {
      setError("Anda tidak memiliki akses ke menu Monitoring Absensi.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const hariIni = todayISO();

      // Fetch paralel semua sumber data
      const [
        usersAll,
        usersSiswa,
        absenHariIni,
        absenHadir,
        absenTerlambat,
        absenIzin,
        absenSakit,
        absenAlpha,
        shifts,
      ] = await Promise.allSettled([
        getUsers({ page: 1, limit: 1 }),
        getUsers({ page: 1, limit: 1, role: "siswa" }),
        getAbsensiSekolah({ page: 1, limit: 1, tanggal: hariIni, role: "siswa" }),
        getAbsensiSekolah({ page: 1, limit: 1, tanggal: hariIni, role: "siswa", status: "hadir" }),
        getAbsensiSekolah({ page: 1, limit: 1, tanggal: hariIni, role: "siswa", status: "terlambat" }),
        getAbsensiSekolah({ page: 1, limit: 1, tanggal: hariIni, role: "siswa", status: "izin" }),
        getAbsensiSekolah({ page: 1, limit: 1, tanggal: hariIni, role: "siswa", status: "sakit" }),
        getAbsensiSekolah({ page: 1, limit: 1, tanggal: hariIni, role: "siswa", status: "alpha" }),
        getShiftKerja({ status: "aktif", limit: 100 }),
      ]);

      const takeTotal = (result) =>
        result.status === "fulfilled"
          ? Number(result.value?.meta?.total ?? result.value?.total ?? 0)
          : 0;

      const takeCount = (result) => {
        if (result.status !== "fulfilled") return 0;
        const v = result.value;
        if (typeof v?.total === "number") return v.total;
        if (Array.isArray(v?.data)) return v.data.length;
        return 0;
      };

      const totalPengguna = takeTotal(usersAll);
      const totalSiswa = takeTotal(usersSiswa);
      const hadirHariIni = takeTotal(absenHadir);
      const terlambatHariIni = takeTotal(absenTerlambat);
      const izinHariIni = takeTotal(absenIzin);
      const sakitHariIni = takeTotal(absenSakit);
      const alphaHariIni = takeTotal(absenAlpha);
      const totalAbsenHariIni = takeTotal(absenHariIni);

      const tidakHadirHariIni = izinHariIni + sakitHariIni + alphaHariIni;

      const totalShiftAktif = takeCount(shifts);

      const totalHadirEfektif = hadirHariIni; // hadir sudah termasuk terlambat? backend pisah
      const persenHadir =
        totalAbsenHariIni > 0
          ? Math.round((hadirHariIni / totalAbsenHariIni) * 100)
          : 0;

      setStats({
        totalPengguna,
        totalSiswa,
        hadirHariIni,
        terlambatHariIni,
        tidakHadirHariIni,
        totalShiftAktif,
        totalIzinPending: izinHariIni, // sementara = izin hari ini
        persenHadir,
        trendMingguIni: 0, // belum ada endpoint trend — bisa diisi nanti
      });
    } catch (err) {
      console.error("Gagal memuat dashboard presensi:", err);
      setError(
        err?.message || "Gagal mengambil data dashboard. Coba refresh.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDashboard();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadDashboard]);

  const menuItems = [
    {
      title: "Rekap Presensi Siswa",
      description:
        "Lihat dan kelola data kehadiran harian seluruh siswa.",
      icon: ClipboardCheck,
      path: "/admin/siswa/absen",
      color: "primary",
      stats: loading ? "..." : `${stats.totalSiswa} Siswa`,
    },
    {
      title: "Daftar Permohonan Izin",
      description:
        "Tinjau dan setujui pengajuan izin atau sakit dari siswa/guru.",
      icon: FileText,
      path: "/admin/presensi/izin-guru",
      color: "warning",
      stats: loading
        ? "..."
        : `${stats.totalIzinPending} Hari Ini`,
    },
    {
      title: "Rekap Absensi Shift",
      description:
        "Pantau kehadiran berdasarkan jadwal shift kerja yang berlaku.",
      icon: Clock3,
      path: "/admin/presensi/rekap-absensi-shift",
      color: "info",
      stats: loading
        ? "..."
        : `${stats.totalShiftAktif} Shift Aktif`,
    },
    {
      title: "Monitoring Kehadiran",
      description:
        "Pantau kehadiran secara real-time melalui mesin fingerprint/RFID.",
      icon: Activity,
      path: "/admin/presensi/monitoring-kehadiran-guru",
      color: "success",
      stats: loading ? "..." : "Live",
    },
    {
      title: "Pengaturan Presensi",
      description:
        "Atur jam masuk, jam pulang, dan toleransi keterlambatan sekolah.",
      icon: Settings,
      path: "/admin/presensi/pengaturan",
      color: "neutral",
      stats: loading ? "..." : "Terkonfigurasi",
    },
    {
      title: "Kategori Jabatan",
      description:
        "Kelola data master jabatan untuk guru dan tenaga kependidikan.",
      icon: Briefcase,
      path: "/admin/presensi/kategori-jabatan",
      color: "purple",
      stats: loading ? "..." : "—",
    },
  ];

  const getColorStyles = () => {
    return {
      iconBg:
        "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]",
      iconText: "theme-primary-text",
      hoverBorder:
        "hover:border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)]",
      badge:
        "border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text",
    };
  };

  return (
    <div className="flex h-screen overflow-hidden theme-page theme-text">
      <Sidebar
        role="admin"
        activeMenu="presensi"
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="shrink-0">
          <Header
            title="Rangkuman Presensi"
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8">
            {/* Header Section */}
            <section className="theme-card theme-border rounded-2xl border p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="theme-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-md">
                    <ClipboardCheck size={23} />
                  </div>
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="theme-primary-soft theme-primary-text rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        Presensi
                      </span>
                      <span className="theme-card-soft theme-text-muted rounded-md px-2 py-0.5 text-[10px] font-semibold">
                        Monitoring & Kontrol
                      </span>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight theme-text sm:text-2xl">
                      Pusat Kendali Presensi
                    </h1>
                    <p className="mt-1 max-w-2xl text-sm theme-text-muted">
                      Akses cepat ke seluruh modul presensi, monitoring kehadiran
                      real-time, dan pengaturan data master dalam satu dasbor
                      terpadu.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={loadDashboard}
                    disabled={loading}
                    className="theme-card theme-border theme-text-secondary inline-flex min-h-10 items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold shadow-sm transition hover:border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)] hover:text-[var(--color-primary)] disabled:opacity-60"
                  >
                    <RefreshCw
                      size={14}
                      className={loading ? "animate-spin theme-primary-text" : ""}
                    />
                    Refresh
                  </button>

                  <div className="theme-card theme-border flex items-center gap-3 rounded-xl border px-4 py-2.5 shadow-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider theme-text-muted">
                        Status Sistem
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold theme-text">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            loading
                              ? "bg-[var(--color-text-muted)]"
                              : error
                                ? "bg-[var(--color-danger)]"
                                : "bg-[var(--color-success)]"
                          }`}
                        />
                        {loading
                          ? "Memuat..."
                          : error
                            ? "Gangguan"
                            : "Terhubung & Normal"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)] p-4">
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0 text-[var(--color-danger)]"
                />
                <div>
                  <p className="text-sm font-semibold theme-text">
                    Gagal mengambil data
                  </p>
                  <p className="mt-1 text-xs theme-text-muted">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="theme-card theme-border rounded-xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
                      Total Pengguna
                    </p>
                    <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums theme-text sm:text-3xl">
                      {loading
                        ? "—"
                        : stats.totalPengguna.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                    <Users size={20} />
                  </div>
                </div>
              </div>

              <div className="theme-card theme-border rounded-xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
                      <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
                      Hadir Hari Ini
                    </p>
                    <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums theme-text sm:text-3xl">
                      {loading
                        ? "—"
                        : stats.hadirHariIni.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                    <UserCheck size={20} />
                  </div>
                </div>
              </div>

              <div className="theme-card theme-border rounded-xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
                      <span className="h-2 w-2 rounded-full bg-[var(--color-warning)]" />
                      Terlambat
                    </p>
                    <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums theme-text sm:text-3xl">
                      {loading
                        ? "—"
                        : stats.terlambatHariIni.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                    <Clock3 size={20} />
                  </div>
                </div>
              </div>

              <div className="theme-card theme-border rounded-xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
                      <span className="h-2 w-2 rounded-full bg-[var(--color-danger)]" />
                      Tidak Hadir
                    </p>
                    <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums theme-text sm:text-3xl">
                      {loading
                        ? "—"
                        : stats.tidakHadirHariIni.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                    <AlertCircle size={20} />
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Cards Grid */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <FileBarChart
                  size={18}
                  className="theme-primary-text"
                />
                <h2 className="text-lg font-bold theme-text">
                  Modul Presensi
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {menuItems.map((item) => {
                  const styles = getColorStyles(item.color);

                  return (
                    <button
                      key={item.title}
                      onClick={() => router.push(item.path)}
                      className={`group flex flex-col justify-between overflow-hidden rounded-2xl border theme-border theme-card p-6 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${styles.hoverBorder}`}
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-xl ${styles.iconBg} ${styles.iconText}`}
                          >
                            <item.icon size={21} />
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${styles.badge}`}
                          >
                            {item.stats}
                          </span>
                        </div>

                        <h3 className="mt-4 text-base font-bold theme-text group-hover:text-[var(--color-primary)] transition-colors">
                          {item.title}
                        </h3>
                        <p className="mt-1.5 text-xs leading-relaxed theme-text-muted line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t theme-border pt-4">
                        <span className="text-xs font-semibold theme-text-secondary group-hover:text-[var(--color-primary)] transition-colors">
                          Buka Modul
                        </span>
                        <ChevronRight
                          size={16}
                          className="theme-text-muted transition-transform group-hover:translate-x-1 group-hover:text-[var(--color-primary)]"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Banner / Info */}
            <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] p-5 sm:flex-row sm:items-center sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] theme-primary-text shadow-sm">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold theme-primary-text">
                    Persentase Kehadiran Hari Ini
                  </h4>
                  <p className="mt-1 text-xs theme-text-secondary">
                    {loading
                      ? "Menghitung data..."
                      : `${stats.persenHadir}% siswa hadir — ${stats.hadirHariIni} dari ${stats.hadirHariIni + stats.tidakHadirHariIni} siswa yang tercatat.`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => router.push("/admin/siswa/absen")}
                className="theme-primary shrink-0 rounded-xl px-4 py-2 text-xs font-semibold shadow-sm transition hover:opacity-90"
              >
                Lihat Laporan
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}