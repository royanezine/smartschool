"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Bell,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  LayoutDashboard,
  MapPin,
  Plus,
  Settings,
  ShieldCheck,
  Users,
  UserSquare2,
} from "lucide-react";

import {
  getYayasanSummary,
  getSekolahBinaan,
  getProfilYayasan,
} from "@/services/yayasan.service";
import { getNotifikasi } from "@/services/notifikasi.service";

const textColor = {
  primary: "text-[var(--color-primary)]",
  info: "text-[var(--color-info)]",
  success: "text-[var(--color-success)]",
  warning: "text-[var(--color-warning)]",
  neutral: "text-[var(--color-text-muted)]",
};

const softBg = {
  primary: "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]",
  info: "bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)]",
  success: "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]",
  warning: "bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)]",
  neutral: "bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]",
};

const dotColor = {
  primary: "bg-[var(--color-primary)]",
  info: "bg-[var(--color-info)]",
  success: "bg-[var(--color-success)]",
  warning: "bg-[var(--color-warning)]",
  neutral: "bg-[var(--color-text-placeholder)]",
};

function unwrapData(response) {
  if (response && typeof response === "object" && "data" in response) {
    return response.data;
  }
  return response;
}

function formatTanggal(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function SectionTitle({ icon: Icon, title, description, color = "primary", action }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${softBg[color]}`}>
            <Icon size={16} className={textColor[color]} />
          </div>
          <h2 className="text-base font-semibold theme-text">{title}</h2>
        </div>
        {description && (
          <p className="mt-2 text-xs leading-5 theme-text-secondary">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-lg ${className}`}
      style={{
        background: "color-mix(in srgb, var(--color-text) 7%, transparent)",
      }}
    />
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]">
        <Icon size={22} className="text-[var(--color-text-muted)]" />
      </div>
      <p className="mt-4 text-sm font-semibold theme-text">{title}</p>
      {description && (
        <p className="mt-1 max-w-xs text-xs leading-5 theme-text-secondary">{description}</p>
      )}
    </div>
  );
}

export default function YayasanDashboardPage() {
  const router = useRouter();

  const [summary, setSummary] = useState(null);
  const [profilYayasan, setProfilYayasan] = useState(null);
  const [schools, setSchools] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchDashboard() {
      try {
        setLoading(true);
        setLoadError(null);

        const [summaryResult, schoolsResult, notifResult, profilResult] =
          await Promise.allSettled([
            getYayasanSummary(),
            getSekolahBinaan(),
            getNotifikasi(),
            getProfilYayasan(),
          ]);

        if (!mounted) return;

        if (summaryResult.status === "fulfilled") {
          setSummary(unwrapData(summaryResult.value) ?? null);
        }

        if (profilResult.status === "fulfilled") {
          setProfilYayasan(unwrapData(profilResult.value) ?? null);
        }

        if (schoolsResult.status === "fulfilled") {
          const payload = unwrapData(schoolsResult.value);
          setSchools(Array.isArray(payload?.items) ? payload.items : []);
        }

        if (notifResult.status === "fulfilled") {
          const payload = notifResult.value;
          setNotifications(Array.isArray(payload?.list) ? payload.list : []);
          setUnreadCount(Number(payload?.unreadCount) || 0);
        }

        const failures = [summaryResult, schoolsResult, notifResult, profilResult].filter(
          (result) => result.status === "rejected"
        );

        if (failures.length > 0) {
          setLoadError(failures[0].reason?.message || "Sebagian data dashboard gagal dimuat.");
        }
      } catch (error) {
        if (!mounted) return;
        setLoadError(error?.message || "Terjadi kesalahan saat mengambil data dashboard.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const totalSiswa = useMemo(
    () => schools.reduce((total, sekolah) => total + Number(sekolah?.statistik?.totalSiswa ?? 0), 0),
    [schools]
  );

  const totalGuru = useMemo(
    () => schools.reduce((total, sekolah) => total + Number(sekolah?.statistik?.totalGuru ?? 0), 0),
    [schools]
  );

  const totalKelas = useMemo(
    () => schools.reduce((total, sekolah) => total + Number(sekolah?.statistik?.totalKelas ?? 0), 0),
    [schools]
  );

  const rekap = summary?.rekapKehadiran ?? summary?.rekapPresensi ?? {};

  const presensiRows = [
    { key: "hadir", label: "Hadir", value: Number(rekap.hadir ?? 0), color: "success" },
    { key: "izin", label: "Izin", value: Number(rekap.izin ?? 0), color: "info" },
    { key: "sakit", label: "Sakit", value: Number(rekap.sakit ?? 0), color: "warning" },
    { key: "alpha", label: "Alpha", value: Number(rekap.alpha ?? 0), color: "neutral" },
  ];

  const presensiTotal = presensiRows.reduce((total, row) => total + row.value, 0);

  const persenHadir =
    summary?.rataKehadiranGlobal != null
      ? Number(summary.rataKehadiranGlobal)
      : presensiTotal > 0
        ? (presensiRows[0].value / presensiTotal) * 100
        : 0;

  const kpiCards = [
    {
      key: "sekolah",
      label: "Unit Sekolah",
      value: summary?.totalSekolah ?? (loading ? "-" : schools.length),
      description: "Sekolah dalam naungan",
      icon: Building2,
      color: "primary",
    },
    {
      key: "pengguna",
      label: "Pengguna Aktif",
      value: summary?.totalPenggunaAktif ?? (loading ? "-" : totalSiswa + totalGuru),
      description: "Siswa & tenaga pendidik",
      icon: Users,
      color: "info",
    },
    {
      key: "aktif",
      label: "Sekolah Aktif",
      value: summary?.sekolahAktif ?? "-",
      description: "Status operasional aktif",
      icon: CheckCircle2,
      color: "success",
    },
    {
      key: "ujiCoba",
      label: "Sekolah Uji Coba",
      value: summary?.sekolahUjiCoba ?? "-",
      description: "Dalam masa uji coba",
      icon: ClipboardCheck,
      color: "warning",
    },
  ];

  const quickActions = [
    {
      id: "sekolah",
      title: "Sekolah Binaan",
      description: "Lihat dan kelola seluruh unit sekolah.",
      icon: Building2,
      color: "primary",
      path: "/yayasan/sekolah",
      value: loading ? "Memuat..." : `${schools.length} unit`,
    },
    {
      id: "tambah",
      title: "Tambah Sekolah",
      description: "Daftarkan unit sekolah binaan baru.",
      icon: Plus,
      color: "info",
      path: "/yayasan/sekolah/tambah",
      value: "Pendaftaran baru",
    },
    {
      id: "lokasi",
      title: "Lokasi Sekolah",
      description: "Lihat lokasi dan alamat unit sekolah.",
      icon: MapPin,
      color: "warning",
      path: "/yayasan/lokasi",
      value: loading ? "Memuat..." : `${schools.length} lokasi`,
    },
    {
      id: "monitoring",
      title: "Monitoring Pengguna",
      description: "Pantau akun pengguna di seluruh sekolah.",
      icon: Users,
      color: "success",
      path: "/yayasan/monitoring/users",
      value: loading ? "Memuat..." : `${summary?.totalPenggunaAktif ?? totalSiswa + totalGuru} pengguna`,
    },
    {
      id: "pengaturan",
      title: "Pengaturan Yayasan",
      description: "Kelola profil dan informasi yayasan.",
      icon: Settings,
      color: "neutral",
      path: "/yayasan/pengaturan",
      value: "Profil & NPYP",
    },
  ];

  return (
    <main className="theme-page theme-text min-h-full">
      <div className="w-full px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
        <div className="space-y-7">
          <header className="theme-border theme-card relative overflow-hidden rounded-3xl border">
            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_7%,transparent)] blur-3xl" />

            <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white shadow-sm">
                    <LayoutDashboard size={17} />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                    Dashboard Yayasan
                  </span>
                </div>

                <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-3xl">
                  {profilYayasan?.nama || "Dashboard Yayasan"}
                </h1>

                <p className="theme-text-secondary mt-2 max-w-2xl text-sm leading-6">
                  Pantau kondisi seluruh unit sekolah, pengguna, dan aktivitas yayasan dari satu tempat.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                {profilYayasan?.npyp && (
                  <div className="theme-border rounded-xl border px-3 py-2">
                    <p className="theme-text-muted text-[10px] uppercase tracking-wider">NPYP</p>
                    <p className="theme-text mt-0.5 font-mono text-xs font-semibold">{profilYayasan.npyp}</p>
                  </div>
                )}

                {profilYayasan?.email && (
                  <div className="theme-border max-w-[260px] rounded-xl border px-3 py-2">
                    <p className="theme-text-muted text-[10px] uppercase tracking-wider">Email</p>
                    <p className="theme-text mt-0.5 truncate text-xs font-medium">{profilYayasan.email}</p>
                  </div>
                )}
              </div>
            </div>
          </header>

          {loadError && (
            <div className="flex items-start gap-3 rounded-2xl border border-[color-mix(in_srgb,var(--color-warning)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_7%,transparent)] px-4 py-3">
              <Bell size={17} className="mt-0.5 shrink-0 text-[var(--color-warning)]" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--color-warning)]">Sebagian data belum tersedia</p>
                <p className="theme-text-secondary mt-1 break-words text-xs leading-5">{loadError}</p>
              </div>
            </div>
          )}

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6">
            {kpiCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.key}
                  className="theme-border theme-card group rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_color-mix(in_srgb,var(--color-text)_7%,transparent)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${softBg[card.color]} ${textColor[card.color]}`}>
                      <Icon size={21} />
                    </div>
                    <ArrowUpRight size={15} className="text-[var(--color-text-placeholder)] opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>

                  <div className="mt-5">
                    {loading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <p className="theme-text text-3xl font-bold tracking-tight">{card.value}</p>
                    )}
                    <p className="theme-text mt-1.5 text-sm font-semibold">{card.label}</p>
                    <p className="theme-text-muted mt-1 text-xs">{card.description}</p>
                  </div>
                </div>
              );
            })}
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)] 2xl:grid-cols-[minmax(0,1.5fr)_minmax(0,0.8fr)]">
            <div className="theme-border theme-card min-w-0 rounded-2xl border">
              <div className="theme-border border-b p-5 sm:p-6">
                <SectionTitle
                  icon={Building2}
                  title="Sekolah Binaan"
                  description="Ringkasan unit sekolah yang berada di bawah naungan yayasan."
                  action={
                    <button
                      type="button"
                      onClick={() => router.push("/yayasan/sekolah")}
                      className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-[var(--color-primary)] transition-colors hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]"
                    >
                      Lihat semua
                      <ChevronRight size={14} />
                    </button>
                  }
                />
              </div>

              <div className="p-3 sm:p-4">
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((item) => (
                      <Skeleton key={item} className="h-[76px]" />
                    ))}
                  </div>
                ) : schools.length === 0 ? (
                  <EmptyState
                    icon={Building2}
                    title="Belum ada sekolah binaan"
                    description="Data unit sekolah belum tersedia."
                  />
                ) : (
                  <div className="space-y-1">
                    {schools.slice(0, 7).map((unit) => (
                      <button
                        key={unit.id}
                        type="button"
                        onClick={() => router.push(`/yayasan/sekolah/${unit.id}`)}
                        className="group flex w-full items-center gap-4 rounded-xl p-3 text-left transition-colors hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)] text-[var(--color-primary)]">
                          <Building2 size={19} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="theme-text truncate text-sm font-semibold">{unit.nama}</p>
                            {unit.jenjang && (
                              <span className="theme-text-secondary rounded-md bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] px-2 py-0.5 text-[10px] font-medium">
                                {unit.jenjang}
                              </span>
                            )}
                          </div>

                          <p className="theme-text-muted mt-1 truncate text-xs">
                            {unit.npsn ? `NPSN ${unit.npsn}` : "NPSN belum tersedia"}
                          </p>

                          <div className="theme-text-secondary mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
                            <span>{Number(unit?.statistik?.totalSiswa ?? 0)} siswa</span>
                            <span>{Number(unit?.statistik?.totalGuru ?? 0)} guru</span>
                            <span>{Number(unit?.statistik?.totalKelas ?? 0)} kelas</span>
                          </div>
                        </div>

                        <ChevronRight
                          size={17}
                          className="shrink-0 text-[var(--color-text-placeholder)] transition-transform group-hover:translate-x-0.5"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="theme-border border-t px-5 py-4 sm:px-6">
                <div className="theme-text-secondary flex flex-wrap gap-x-5 gap-y-2 text-xs">
                  <span>
                    <strong className="theme-text">{loading ? "..." : totalSiswa}</strong> siswa
                  </span>
                  <span>
                    <strong className="theme-text">{loading ? "..." : totalGuru}</strong> guru
                  </span>
                  <span>
                    <strong className="theme-text">{loading ? "..." : totalKelas}</strong> kelas
                  </span>
                </div>
              </div>
            </div>

            <div className="theme-border theme-card min-w-0 rounded-2xl border">
              <div className="theme-border border-b p-5 sm:p-6">
                <SectionTitle
                  icon={Bell}
                  title="Notifikasi"
                  description="Aktivitas dan informasi terbaru untuk yayasan."
                  color="info"
                  action={
                    unreadCount > 0 ? (
                      <span className="rounded-full bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] px-2.5 py-1 text-[10px] font-bold text-[var(--color-warning)]">
                        {unreadCount} baru
                      </span>
                    ) : null
                  }
                />
              </div>

              <div className="p-5 sm:p-6">
                {loading ? (
                  <div className="space-y-5">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="flex gap-3">
                        <Skeleton className="mt-1 h-2 w-2 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <EmptyState
                    icon={Bell}
                    title="Tidak ada notifikasi"
                    description="Belum ada informasi baru untuk ditampilkan."
                  />
                ) : (
                  <div className="space-y-1">
                    {notifications.slice(0, 6).map((notification) => (
                      <div
                        key={notification.id}
                        className="flex gap-3 rounded-xl p-3 transition-colors hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]"
                      >
                        <span
                          className={`mt-2 h-2 w-2 shrink-0 rounded-full ${
                            notification.dibaca ? "bg-[var(--color-text-placeholder)]" : "bg-[var(--color-primary)]"
                          }`}
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className="theme-text truncate text-sm font-semibold">{notification.judul}</p>
                            {!notification.dibaca && (
                              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                            )}
                          </div>
                          <p className="theme-text-secondary mt-1 line-clamp-2 text-xs leading-5">{notification.isi}</p>
                          <p className="theme-text-muted mt-1.5 text-[10px]">{formatTanggal(notification.dibuatPada)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="theme-border theme-card rounded-2xl border">
            <div className="theme-border border-b p-5 sm:p-6">
              <SectionTitle
                icon={CalendarCheck}
                title="Ringkasan Kehadiran"
                description="Rekap presensi seluruh unit sekolah."
                color="success"
                action={<span className="theme-text-muted text-xs">Hari ini</span>}
              />
            </div>

            <div className="grid grid-cols-1 gap-8 p-5 sm:p-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center">
              <div>
                <p className="theme-text-muted text-xs font-medium uppercase tracking-wider">Rata-rata kehadiran</p>
                <div className="mt-2 flex items-end gap-2">
                  <span className="theme-text text-5xl font-bold tracking-tight sm:text-6xl">
                    {loading ? "..." : persenHadir.toFixed(1)}
                  </span>
                  {!loading && <span className="theme-text-secondary mb-2 text-2xl font-semibold">%</span>}
                </div>
                <p className="theme-text-secondary mt-3 text-xs">
                  Berdasarkan <strong className="theme-text">{loading ? "..." : presensiTotal}</strong> catatan presensi.
                </p>

                <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]">
                  {presensiTotal > 0 &&
                    presensiRows.map((row) => (
                      <div
                        key={row.key}
                        className={`inline-block h-full ${dotColor[row.color]}`}
                        style={{ width: `${(row.value / presensiTotal) * 100}%` }}
                      />
                    ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {presensiRows.map((row) => {
                  const percentage = presensiTotal > 0 ? (row.value / presensiTotal) * 100 : 0;

                  return (
                    <div key={row.key} className="theme-border rounded-xl border p-4">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${dotColor[row.color]}`} />
                        <span className="theme-text-secondary text-xs font-medium">{row.label}</span>
                      </div>
                      <p className={`mt-4 text-2xl font-bold ${textColor[row.color]}`}>
                        {loading ? "..." : row.value}
                      </p>
                      <p className="theme-text-muted mt-1 text-[10px]">
                        {loading ? "-" : `${percentage.toFixed(0)}% dari total`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section>
            <div className="mb-5">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-[var(--color-primary)]" />
                <h2 className="theme-text text-base font-semibold">Akses Cepat</h2>
              </div>
              <p className="theme-text-secondary mt-1.5 text-xs">Akses fitur utama pengelolaan yayasan.</p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6">
              {quickActions.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => router.push(item.path)}
                    className="theme-border theme-card group min-w-0 rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--color-primary)_25%,var(--color-border))] hover:shadow-[0_10px_25px_color-mix(in_srgb,var(--color-text)_6%,transparent)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${softBg[item.color]} ${textColor[item.color]}`}>
                        <Icon size={18} />
                      </div>
                      <ChevronRight
                        size={16}
                        className="text-[var(--color-text-placeholder)] transition-transform group-hover:translate-x-0.5"
                      />
                    </div>
                    <p className="theme-text mt-4 text-sm font-semibold">{item.title}</p>
                    <p className="theme-text-secondary mt-1.5 min-h-[36px] text-xs leading-5">{item.description}</p>
                    <div className="theme-border mt-4 border-t pt-3">
                      <span className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">
                        {item.value}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}