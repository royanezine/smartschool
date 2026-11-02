"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  UserSquare2,
  ClipboardCheck,
  Settings,
  ChevronRight,
  Bell,
  PlusCircle,
  MapPin,
  CalendarCheck,
} from "lucide-react";

import {
  getYayasanSummary,
  getSekolahBinaan,
  getProfilYayasan,
} from "@/services/yayasan.service";
import { getNotifikasi } from "@/services/notifikasi.service";

const neutralSurface = "bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]";
const neutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";
const skeletonBg = "color-mix(in srgb, var(--color-text) 7%, transparent)";
const cardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const textColor = {
  primary: "text-[var(--color-primary)]",
  info: "text-[var(--color-info)]",
  success: "text-[var(--color-success)]",
  warning: "text-[var(--color-warning)]",
  neutral: "text-[var(--color-text-muted)]",
};

const dotColor = {
  primary: "bg-[var(--color-primary)]",
  info: "bg-[var(--color-info)]",
  success: "bg-[var(--color-success)]",
  warning: "bg-[var(--color-warning)]",
  neutral: "bg-[var(--color-text-placeholder)]",
};

const softBg = {
  primary: "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]",
  info: "bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)]",
  success: "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]",
  warning: "bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)]",
  neutral: "bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]",
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

function SectionHeader({ icon: Icon, title, color = "primary", action }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2.5">
        <Icon size={18} className={`shrink-0 ${textColor[color]}`} />
        <h3 className="truncate text-sm font-semibold theme-text">{title}</h3>
      </div>
      {action}
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
          setNotifications(
            Array.isArray(notifResult.value?.list) ? notifResult.value.list : []
          );
          setUnreadCount(Number(notifResult.value?.unreadCount) || 0);
        }

        const failures = [
          summaryResult,
          schoolsResult,
          notifResult,
          profilResult,
        ].filter((result) => result.status === "rejected");

        if (failures.length > 0) {
          setLoadError(
            failures[0].reason?.message ||
              "Sebagian data dashboard gagal dimuat."
          );
        }
      } catch (err) {
        if (!mounted) return;
        setLoadError(
          err?.message || "Terjadi kesalahan saat mengambil data dashboard."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const sumStat = (key) =>
    schools.reduce(
      (total, sekolah) => total + Number(sekolah?.statistik?.[key] ?? 0),
      0
    );

  const totalSiswa = sumStat("totalSiswa");
  const totalGuru = sumStat("totalGuru");
  const totalKelas = sumStat("totalKelas");

  const rekap = summary?.rekapKehadiran ?? summary?.rekapPresensi ?? {};
  const presensiRows = [
    { key: "hadir", label: "Hadir", value: Number(rekap.hadir ?? 0), color: "success" },
    { key: "izin", label: "Izin", value: Number(rekap.izin ?? 0), color: "info" },
    { key: "sakit", label: "Sakit", value: Number(rekap.sakit ?? 0), color: "warning" },
    { key: "alpha", label: "Alpha", value: Number(rekap.alpha ?? 0), color: "neutral" },
  ];
  const presensiTotal = presensiRows.reduce((t, r) => t + r.value, 0);
  const persenHadir =
    summary?.rataKehadiranGlobal != null
      ? Number(summary.rataKehadiranGlobal)
      : presensiTotal > 0
      ? (presensiRows[0].value / presensiTotal) * 100
      : 0;

  const kpiStrip = [
    {
      key: "sekolah",
      label: "Unit Sekolah",
      value: summary?.totalSekolah ?? (loading ? "-" : schools.length),
      icon: Building2,
      color: "primary",
    },
    {
      key: "pengguna",
      label: "Pengguna Aktif",
      value:
        summary?.totalPenggunaAktif ?? (loading ? "-" : totalSiswa + totalGuru),
      icon: UserSquare2,
      color: "info",
    },
    {
      key: "aktif",
      label: "Sekolah Aktif",
      value: summary?.sekolahAktif ?? "-",
      icon: Users,
      color: "success",
    },
    {
      key: "ujiCoba",
      label: "Sekolah Uji Coba",
      value: summary?.sekolahUjiCoba ?? "-",
      icon: ClipboardCheck,
      color: "warning",
    },
  ];

  const quickMenu = [
    {
      id: "sekolah",
      title: "Sekolah Binaan",
      desc: "Kelola profil dan data seluruh unit sekolah",
      icon: Building2,
      color: "primary",
      path: "/yayasan/sekolah",
      stat: loading ? "Memuat..." : `${schools.length} unit sekolah`,
    },
    {
      id: "tambahSekolah",
      title: "Tambah Cabang",
      desc: "Daftarkan unit sekolah binaan baru",
      icon: PlusCircle,
      color: "info",
      path: "/yayasan/sekolah/tambah",
      stat: "Pendaftaran baru",
    },
    {
      id: "lokasi",
      title: "Lokasi Sekolah",
      desc: "Pemetaan koordinat dan alamat unit sekolah",
      icon: MapPin,
      color: "warning",
      path: "/yayasan/lokasi",
      stat: loading ? "Memuat..." : `${schools.length} lokasi terdata`,
    },
    {
      id: "monitoringUsers",
      title: "Monitoring Pengguna",
      desc: "Pantau akun guru, siswa, staf, dan admin",
      icon: Users,
      color: "success",
      path: "/yayasan/monitoring/users",
      stat: loading
        ? "Memuat..."
        : `${summary?.totalPenggunaAktif ?? totalSiswa + totalGuru} pengguna aktif`,
    },
    {
      id: "pengaturan",
      title: "Pengaturan Yayasan",
      desc: "Profil yayasan, NPYP, kontak, dan alamat",
      icon: Settings,
      color: "neutral",
      path: "/yayasan/pengaturan",
      stat: "Profil & NPYP",
    },
  ];

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="mx-auto w-full max-w-[1800px] px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
        <div className="space-y-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <LayoutDashboard
                size={28}
                className="shrink-0 text-[var(--color-primary)]"
              />
              <div className="min-w-0">
                <h1 className="truncate text-xl font-semibold theme-text sm:text-2xl">
                  {profilYayasan?.nama || "Dashboard Yayasan"}
                </h1>
                <p className="mt-0.5 truncate text-xs theme-text-secondary">
                  Ringkasan kondisi seluruh unit sekolah di bawah naungan yayasan
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs theme-text-secondary">
              {profilYayasan?.npyp && (
                <span className="font-mono">NPYP: {profilYayasan.npyp}</span>
              )}
              {profilYayasan?.email && (
                <span className="max-w-[240px] truncate">
                  {profilYayasan.email}
                </span>
              )}
            </div>
          </div>

          {loadError && (
            <div className="flex items-start gap-3 border-l-2 border-[var(--color-warning)] py-1 pl-4">
              <Bell
                size={15}
                className="mt-0.5 shrink-0 text-[var(--color-warning)]"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--color-warning)]">
                  Sebagian data dashboard gagal dimuat
                </p>
                <p className="mt-1 break-words text-xs theme-text-secondary">
                  {loadError}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {kpiStrip.map((kpi) => {
              const Icon = kpi.icon;

              return (
                <div
                  key={kpi.key}
                  className={`theme-card theme-border flex min-w-0 items-center gap-4 rounded-2xl border px-5 py-5 ${cardShadow}`}
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${softBg[kpi.color]} ${textColor[kpi.color]}`}
                  >
                    <Icon size={22} />
                  </div>

                  <div className="min-w-0">
                    {loading ? (
                      <div
                        className="h-7 w-14 animate-pulse rounded"
                        style={{ background: skeletonBg }}
                      />
                    ) : (
                      <p className="truncate text-3xl font-bold leading-none theme-text">
                        {kpi.value}
                      </p>
                    )}
                    <p className="mt-2 truncate text-xs theme-text-secondary">
                      {kpi.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-16">
            <section className="flex min-w-0 flex-col lg:h-[340px]">
              <SectionHeader
                icon={Building2}
                title="Ringkasan Unit Sekolah"
                action={
                  <button
                    type="button"
                    onClick={() => router.push("/yayasan/sekolah")}
                    className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-[var(--color-primary)] transition-opacity hover:opacity-80"
                  >
                    Semua
                    <ChevronRight size={12} />
                  </button>
                }
              />

              <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="h-12 animate-pulse rounded-lg"
                        style={{ background: skeletonBg }}
                      />
                    ))}
                  </div>
                ) : schools.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center py-6 text-center">
                    <Building2
                      size={30}
                      className="text-[var(--color-text-muted)]"
                    />
                    <p className="mt-3 text-sm font-medium theme-text-secondary">
                      Belum ada unit sekolah
                    </p>
                    <p className="mt-1 text-xs theme-text-muted">
                      Data sekolah binaan belum tersedia.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {schools.map((unit) => (
                      <button
                        key={unit.id}
                        type="button"
                        onClick={() => router.push(`/yayasan/sekolah/${unit.id}`)}
                        className={`group -mx-3 flex w-[calc(100%+1.5rem)] items-center justify-between gap-3 rounded-lg px-3 py-3 text-left transition-colors ${neutralHover}`}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold theme-text">
                            {unit.nama}
                          </p>
                          <p className="mt-0.5 truncate text-xs theme-text-muted">
                            {unit.jenjang || "-"}
                            {unit.npsn ? ` · NPSN ${unit.npsn}` : ""}
                          </p>
                          <p className="mt-1.5 text-[11px] theme-text-secondary">
                            {Number(unit?.statistik?.totalSiswa ?? 0)} siswa ·{" "}
                            {Number(unit?.statistik?.totalGuru ?? 0)} guru ·{" "}
                            {Number(unit?.statistik?.totalKelas ?? 0)} kelas
                          </p>
                        </div>
                        <ChevronRight
                          size={14}
                          className="shrink-0 text-[var(--color-text-placeholder)] transition-transform group-hover:translate-x-0.5"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <p className="mt-4 text-xs theme-text-muted">
                Total{" "}
                <span className="font-semibold theme-text">
                  {loading ? "..." : totalSiswa}
                </span>{" "}
                siswa ·{" "}
                <span className="font-semibold theme-text">
                  {loading ? "..." : totalGuru}
                </span>{" "}
                guru ·{" "}
                <span className="font-semibold theme-text">
                  {loading ? "..." : totalKelas}
                </span>{" "}
                kelas
              </p>
            </section>

            <section className="flex min-w-0 flex-col lg:h-[340px]">
              <SectionHeader
                icon={Bell}
                title="Notifikasi Terbaru"
                color="info"
                action={
                  unreadCount > 0 ? (
                    <span className="shrink-0 text-[11px] font-semibold text-[var(--color-warning)]">
                      {unreadCount} baru
                    </span>
                  ) : null
                }
              />

              <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="h-12 animate-pulse rounded-lg"
                        style={{ background: skeletonBg }}
                      />
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center py-6 text-center">
                    <Bell
                      size={28}
                      className="text-[var(--color-text-muted)]"
                    />
                    <p className="mt-3 text-sm font-medium theme-text-secondary">
                      Belum ada notifikasi
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {notifications.slice(0, 6).map((notification) => (
                      <div key={notification.id} className="flex items-start gap-3">
                        <span
                          className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                            notification.dibaca
                              ? "bg-[var(--color-text-placeholder)]"
                              : "bg-[var(--color-primary)]"
                          }`}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium theme-text">
                            {notification.judul}
                          </p>
                          <p className="mt-1 line-clamp-2 text-xs theme-text-secondary">
                            {notification.isi}
                          </p>
                          <p className="mt-1.5 text-[11px] theme-text-muted">
                            {formatTanggal(notification.dibuatPada)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="flex min-w-0 flex-col lg:min-h-[340px]">
              <SectionHeader
                icon={CalendarCheck}
                title="Rekap Presensi Hari Ini"
                color="success"
                action={
                  <span className="shrink-0 text-[11px] theme-text-muted">
                    Seluruh cabang
                  </span>
                }
              />

              <div className="flex flex-1 flex-col gap-6">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-5xl font-bold leading-none theme-text">
                      {loading ? "..." : `${persenHadir.toFixed(1)}%`}
                    </p>
                    <p className="mt-3 text-xs theme-text-secondary">
                      Rata-rata kehadiran global
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold theme-text">
                      {loading ? "..." : presensiTotal}
                    </p>
                    <p className="mt-1 text-[11px] theme-text-muted">
                      Total tercatat
                    </p>
                  </div>
                </div>

                <div
                  className={`flex h-1.5 w-full overflow-hidden rounded-full ${neutralSurface}`}
                >
                  {presensiTotal > 0 &&
                    presensiRows.map((row) => (
                      <div
                        key={row.key}
                        className={`${dotColor[row.color]} transition-all duration-500`}
                        style={{
                          width: `${(row.value / presensiTotal) * 100}%`,
                        }}
                      />
                    ))}
                </div>

                <div className="space-y-4">
                  {presensiRows.map((row) => {
                    const pct =
                      presensiTotal > 0 ? (row.value / presensiTotal) * 100 : 0;

                    return (
                      <div
                        key={row.key}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`h-2 w-2 rounded-full ${dotColor[row.color]}`}
                          />
                          <span className="text-sm theme-text-secondary">
                            {row.label}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-4">
                          <span className="text-[11px] theme-text-muted">
                            {pct.toFixed(0)}%
                          </span>
                          <span
                            className={`w-12 text-right text-lg font-bold ${textColor[row.color]}`}
                          >
                            {loading ? "..." : row.value}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-3 xl:grid-cols-5 xl:gap-x-10">
            {quickMenu.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  title={item.desc}
                  onClick={() => router.push(item.path)}
                  className="group flex min-w-0 items-center gap-3 text-left"
                >
                  <Icon
                    size={22}
                    className={`shrink-0 ${textColor[item.color]}`}
                  />

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold theme-text transition-colors group-hover:text-[var(--color-primary)]">
                      {item.title}
                    </h3>
                    <p className="mt-0.5 truncate text-[11px] theme-text-muted">
                      {item.stat}
                    </p>
                  </div>

                  <ChevronRight
                    size={14}
                    className="shrink-0 text-[var(--color-text-placeholder)] transition-transform duration-300 group-hover:translate-x-0.5"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}