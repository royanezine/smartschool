"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

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
    loadDashboard();
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

  const getColorStyles = (color) => {
    switch (color) {
      case "primary":
        return {
          iconBg:
            "bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]",
          iconText: "text-[var(--color-primary)]",
          hoverBorder:
            "hover:border-[color-mix(in_srgb,var(--color-primary)_40%,transparent)]",
          badge:
            "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]",
        };
      case "warning":
        return {
          iconBg:
            "bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)]",
          iconText: "text-[var(--color-warning)]",
          hoverBorder:
            "hover:border-[color-mix(in_srgb,var(--color-warning)_40%,transparent)]",
          badge:
            "bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] text-[var(--color-warning)]",
        };
      case "info":
        return {
          iconBg:
            "bg-[color-mix(in_srgb,var(--color-info)_12%,transparent)]",
          iconText: "text-[var(--color-info)]",
          hoverBorder:
            "hover:border-[color-mix(in_srgb,var(--color-info)_40%,transparent)]",
          badge:
            "bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)] text-[var(--color-info)]",
        };
      case "success":
        return {
          iconBg:
            "bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)]",
          iconText: "text-[var(--color-success)]",
          hoverBorder:
            "hover:border-[color-mix(in_srgb,var(--color-success)_40%,transparent)]",
          badge:
            "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)]",
        };
      case "purple":
        return {
          iconBg: "bg-purple-500/10",
          iconText: "text-purple-500",
          hoverBorder: "hover:border-purple-500/40",
          badge: "bg-purple-500/10 text-purple-500",
        };
      default:
        return {
          iconBg:
            "bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]",
          iconText: "text-[var(--color-text-secondary)]",
          hoverBorder:
            "hover:border-[color-mix(in_srgb,var(--color-text)_20%,transparent)]",
          badge:
            "bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] text-[var(--color-text-secondary)]",
        };
    }
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
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)] sm:text-3xl">
                  Pusat Kendali Presensi
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-text-muted)]">
                  Akses cepat ke seluruh modul presensi, monitoring kehadiran
                  real-time, dan pengaturan data master dalam satu dasbor
                  terpadu.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={loadDashboard}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3.5 py-2.5 text-xs font-semibold text-[var(--color-text-secondary)] transition hover:border-[color-mix(in_srgb,var(--color-primary)_30%,transparent)] hover:text-[var(--color-primary)] disabled:opacity-60"
                >
                  <RefreshCw
                    size={14}
                    className={loading ? "animate-spin" : ""}
                  />
                  Refresh
                </button>

                <div className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)]">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                      Status Sistem
                    </p>
                    <p className="text-sm font-semibold text-[var(--color-text)]">
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

            {/* Error */}
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)] p-4">
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0 text-[var(--color-danger)]"
                />
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text)]">
                    Gagal mengambil data
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4">
              <div className="flex items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-xs font-medium text-[var(--color-text-muted)]">
                    Total Pengguna
                  </p>
                  <p className="text-2xl font-bold text-[var(--color-text)]">
                    {loading
                      ? "—"
                      : stats.totalPengguna.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)]">
                  <UserCheck size={24} />
                </div>
                <div>
                  <p className="text-xs font-medium text-[var(--color-text-muted)]">
                    Hadir Hari Ini
                  </p>
                  <p className="text-2xl font-bold text-[var(--color-text)]">
                    {loading
                      ? "—"
                      : stats.hadirHariIni.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] text-[var(--color-warning)]">
                  <Clock3 size={24} />
                </div>
                <div>
                  <p className="text-xs font-medium text-[var(--color-text-muted)]">
                    Terlambat
                  </p>
                  <p className="text-2xl font-bold text-[var(--color-text)]">
                    {loading
                      ? "—"
                      : stats.terlambatHariIni.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] text-[var(--color-danger)]">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <p className="text-xs font-medium text-[var(--color-text-muted)]">
                    Tidak Hadir
                  </p>
                  <p className="text-2xl font-bold text-[var(--color-text)]">
                    {loading
                      ? "—"
                      : stats.tidakHadirHariIni.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Cards Grid */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <FileBarChart
                  size={18}
                  className="text-[var(--color-primary)]"
                />
                <h2 className="text-lg font-bold text-[var(--color-text)]">
                  Modul Presensi
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
                {menuItems.map((item) => {
                  const styles = getColorStyles(item.color);

                  return (
                    <button
                      key={item.title}
                      onClick={() => router.push(item.path)}
                      className={`group flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${styles.hoverBorder}`}
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-xl ${styles.iconBg} ${styles.iconText}`}
                          >
                            <item.icon size={22} />
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${styles.badge}`}
                          >
                            {item.stats}
                          </span>
                        </div>

                        <h3 className="mt-4 text-base font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                          {item.title}
                        </h3>
                        <p className="mt-1.5 text-xs leading-relaxed text-[var(--color-text-muted)] line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-[var(--color-border)] pt-4">
                        <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                          Buka Modul
                        </span>
                        <ChevronRight
                          size={16}
                          className="text-[var(--color-text-muted)] transition-transform group-hover:translate-x-1 group-hover:text-[var(--color-primary)]"
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Banner / Info */}
            <div className="rounded-2xl border border-[color-mix(in_srgb,var(--color-info)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)] p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-card)] text-[var(--color-info)] shadow-sm">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--color-info)]">
                    Persentase Kehadiran Hari Ini
                  </h4>
                  <p className="mt-1 text-xs text-[color-mix(in_srgb,var(--color-info)_80%,var(--color-text))]">
                    {loading
                      ? "Menghitung data..."
                      : `${stats.persenHadir}% siswa hadir — ${stats.hadirHariIni} dari ${stats.hadirHariIni + stats.tidakHadirHariIni} siswa yang tercatat.`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push("/admin/siswa/absen")}
                className="shrink-0 rounded-lg bg-[var(--color-info)] px-4 py-2 text-xs font-bold text-white transition hover:opacity-90"
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