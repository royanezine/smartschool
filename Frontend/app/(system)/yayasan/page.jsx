"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  UserSquare2,
  ClipboardCheck,
  FileText,
  Settings,
  ChevronRight,
  Sparkles,
  Bell,
  Info,
} from "lucide-react";

import {
  getYayasanSummary,
  getSekolahBinaan,
} from "@/services/yayasan.service";
import { getNotifikasi } from "@/services/notifikasi.service";


const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

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

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";


const colorMap = {
  primary: {
    bg: themePrimarySoft,
    text: themePrimaryText,
    border: themePrimarySoftBorder,
    hoverBorder:
      "hover:border-[color-mix(in_srgb,var(--color-primary)_36%,transparent)]",
    ring:
      "group-hover:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]",
  },

  info: {
    bg: themeInfoSurface,
    text: "text-[var(--color-info)]",
    border: themeInfoBorder,
    hoverBorder:
      "hover:border-[color-mix(in_srgb,var(--color-info)_36%,transparent)]",
    ring:
      "group-hover:ring-[color-mix(in_srgb,var(--color-info)_12%,transparent)]",
  },

  success: {
    bg: themeSuccessSurface,
    text: "text-[var(--color-success)]",
    border: themeSuccessBorder,
    hoverBorder:
      "hover:border-[color-mix(in_srgb,var(--color-success)_36%,transparent)]",
    ring:
      "group-hover:ring-[color-mix(in_srgb,var(--color-success)_12%,transparent)]",
  },

  warning: {
    bg: themeWarningSurface,
    text: "text-[var(--color-warning)]",
    border: themeWarningBorder,
    hoverBorder:
      "hover:border-[color-mix(in_srgb,var(--color-warning)_36%,transparent)]",
    ring:
      "group-hover:ring-[color-mix(in_srgb,var(--color-warning)_12%,transparent)]",
  },

  neutral: {
    bg: themeNeutralSurface,
    text: "text-[var(--color-text-muted)]",
    border: themeNeutralBorder,
    hoverBorder:
      "hover:border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]",
    ring:
      "group-hover:ring-[color-mix(in_srgb,var(--color-text)_8%,transparent)]",
  },
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


export default function YayasanDashboardPage() {
  const router = useRouter();

  const [summary, setSummary] = useState(null);
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

        const [summaryResult, schoolsResult, notifResult] =
          await Promise.allSettled([
            getYayasanSummary(),
            getSekolahBinaan(),
            getNotifikasi(),
          ]);

        if (!mounted) return;

        if (summaryResult.status === "fulfilled") {
          setSummary(unwrapData(summaryResult.value) ?? null);
        }

        if (schoolsResult.status === "fulfilled") {
          const payload = unwrapData(schoolsResult.value);
          setSchools(Array.isArray(payload?.items) ? payload.items : []);
        }

        if (notifResult.status === "fulfilled") {
          setNotifications(
            Array.isArray(notifResult.value?.list)
              ? notifResult.value.list
              : []
          );
          setUnreadCount(Number(notifResult.value?.unreadCount) || 0);
        }

        const failures = [summaryResult, schoolsResult, notifResult].filter(
          (result) => result.status === "rejected"
        );

        if (failures.length > 0) {
          const firstFailure = failures[0].reason;

          setLoadError(
            firstFailure?.message ||
              "Sebagian data dashboard gagal dimuat."
          );
        }
      } catch (err) {
        if (!mounted) return;

        setLoadError(
          err?.message || "Terjadi kesalahan saat mengambil data dashboard."
        );
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


  const totalSiswa = schools.reduce(
    (total, sekolah) => total + Number(sekolah?.statistik?.totalSiswa ?? 0),
    0
  );

  const totalGuru = schools.reduce(
    (total, sekolah) => total + Number(sekolah?.statistik?.totalGuru ?? 0),
    0
  );

  const totalKelas = schools.reduce(
    (total, sekolah) => total + Number(sekolah?.statistik?.totalKelas ?? 0),
    0
  );


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
      label: "Total Pengguna Aktif",
      value:
        summary?.totalPenggunaAktif ??
        (loading ? "-" : totalSiswa + totalGuru),
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
      key: "sekolah",
      title: "Sekolah",
      desc: "Kelola profil dan data seluruh unit sekolah di bawah yayasan",
      icon: Building2,
      color: "primary",
      path: "/yayasan/sekolah",
      stat: loading ? "Memuat data..." : `${schools.length} unit sekolah`,
      featured: true,
    },
    {
      key: "laporan",
      title: "Laporan & Analitik",
      desc: "Ringkasan laporan akademik, guru, inventaris, dan siswa",
      icon: FileText,
      color: "info",
      path: "/yayasan/laporan",
      stat: "Laporan per modul",
      featured: true,
    },
    {
      key: "guru",
      title: "Guru",
      desc: "Data induk tenaga pendidik",
      icon: GraduationCap,
      color: "info",
      path: "/yayasan/guru",
      stat: loading ? "Memuat data..." : `${totalGuru} guru aktif`,
    },
    {
      key: "siswa",
      title: "Siswa",
      desc: "Data induk siswa lintas unit",
      icon: UserSquare2,
      color: "success",
      path: "/yayasan/siswa",
      stat: loading ? "Memuat data..." : `${totalSiswa} siswa aktif`,
    },
    {
      id: "monitoringAkademik",
      title: "Monitoring Akademik",
      desc: "Kehadiran, nilai, LMS, mapel",
      icon: ClipboardCheck,
      color: "warning",
      path: "/yayasan/monitoringAkademik",
      stat: "Data per unit",
    },
    {
      id: "pengaturan",
      title: "Pengaturan",
      desc: "Konfigurasi sistem yayasan",
      icon: Settings,
      color: "neutral",
      path: "/yayasan/pengaturan",
      stat: "Per sekolah",
    },
  ];


  return (
    <div className="theme-page theme-text min-h-full">
      <div className="w-full max-w-[1800px] mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="space-y-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-lg ${themePrimaryGradient} text-[var(--color-card)] ${themeSmallShadow} flex-shrink-0`}
                >
                  <LayoutDashboard size={18} />
                </div>

                <h1 className="text-xl sm:text-2xl font-semibold theme-text truncate">
                  Dashboard Yayasan
                </h1>
              </div>

              <p className="theme-text-secondary text-sm mt-1 ml-[42px] flex items-center gap-1.5">
                <Sparkles
                  size={14}
                  className="text-[var(--color-text-muted)] flex-shrink-0"
                />

                <span className="truncate">
                  Ringkasan kondisi seluruh unit sekolah di bawah naungan
                  yayasan.
                </span>
              </p>
            </div>
          </div>


          {loadError && (
            <div
              className={`rounded-xl border ${themeDangerBorder} ${themeDangerSurface} p-3.5 sm:p-4`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-lg ${themeWarningSurface} text-[var(--color-warning)] flex items-center justify-center flex-shrink-0`}
                >
                  <Bell size={16} />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--color-warning)]">
                    Sebagian data dashboard gagal dimuat
                  </p>

                  <p className="text-xs theme-text-secondary mt-0.5 break-words">
                    {loadError}
                  </p>
                </div>
              </div>
            </div>
          )}


          <div
            className={`theme-card rounded-2xl border theme-border ${themeCardShadow} divide-y divide-[color-mix(in_srgb,var(--color-text)_8%,transparent)] sm:divide-y-0 sm:divide-x sm:divide-[color-mix(in_srgb,var(--color-text)_8%,transparent)] grid grid-cols-2 sm:grid-cols-4 overflow-hidden`}
          >
            {kpiStrip.map((kpi) => {
              const Icon = kpi.icon;
              const c = colorMap[kpi.color];

              return (
                <div
                  key={kpi.key}
                  className="p-3.5 sm:p-5 flex items-center gap-3 sm:gap-3.5 min-w-0"
                >
                  <div
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${c.bg} ${c.text} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon size={18} />
                  </div>

                  <div className="min-w-0">
                    {loading ? (
                      <div
                        className="h-5 w-10 rounded animate-pulse"
                        style={{
                          background:
                            "color-mix(in srgb, var(--color-text) 7%, transparent)",
                        }}
                      />
                    ) : (
                      <p className="text-base sm:text-lg font-semibold theme-text leading-tight truncate">
                        {kpi.value}
                      </p>
                    )}

                    <p className="text-[11px] sm:text-xs theme-text-secondary mt-0.5 truncate">
                      {kpi.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-min">
            {quickMenu.map((item) => {
              const Icon = item.icon;
              const c = colorMap[item.color];


              if (item.featured) {
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => router.push(item.path)}
                    className={`group text-left theme-card rounded-2xl border ${c.border} ${c.hoverBorder} p-5 sm:p-6 ${themeCardShadow} hover:shadow-[0_10px_30px_color-mix(in_srgb,var(--color-text)_10%,transparent)] transition-all duration-300 sm:col-span-1 lg:col-span-2 relative overflow-hidden min-w-0`}
                  >
                    <div
                      className={`absolute -right-6 -top-6 w-28 h-28 rounded-full ${c.bg} opacity-70`}
                    />

                    <div className="relative min-w-0">
                      <div className="flex items-start justify-between">
                        <div
                          className={`p-3 sm:p-3.5 rounded-xl ${c.bg} ${c.text} ring-4 ring-transparent ${c.ring} transition-all duration-300 flex-shrink-0`}
                        >
                          <Icon size={22} />
                        </div>

                        <ChevronRight
                          size={20}
                          className="text-[var(--color-text-placeholder)] group-hover:text-[var(--color-text-muted)] group-hover:translate-x-0.5 transition-all duration-300 mt-1 flex-shrink-0"
                        />
                      </div>

                      <h3 className="mt-4 sm:mt-5 text-base sm:text-lg font-semibold theme-text truncate">
                        {item.title}
                      </h3>

                      <p className="mt-1.5 text-sm theme-text-secondary leading-relaxed line-clamp-2">
                        {item.desc}
                      </p>

                      <div
                        className={`mt-4 inline-flex items-center text-xs font-medium ${c.text} ${c.bg} px-2.5 py-1 rounded-full max-w-full truncate`}
                      >
                        {item.stat}
                      </div>
                    </div>
                  </button>
                );
              }


              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => router.push(item.path)}
                  className={`group text-left theme-card rounded-2xl border ${c.border} ${c.hoverBorder} p-4 ${themeSmallShadow} hover:shadow-[0_8px_24px_color-mix(in_srgb,var(--color-text)_9%,transparent)] hover:-translate-y-0.5 transition-all duration-300 min-w-0`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg ${c.bg} ${c.text} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon size={17} />
                  </div>

                  <h3 className="mt-3 text-sm font-semibold theme-text truncate">
                    {item.title}
                  </h3>

                  <p className="mt-0.5 text-xs theme-text-secondary leading-relaxed line-clamp-2">
                    {item.desc}
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-2 min-w-0">
                    <span className="text-[11px] font-medium text-[var(--color-text-muted)] truncate">
                      {item.stat}
                    </span>

                    <ChevronRight
                      size={14}
                      className="text-[var(--color-text-placeholder)] group-hover:text-[var(--color-text-muted)] group-hover:translate-x-0.5 transition-all duration-300 flex-shrink-0"
                    />
                  </div>
                </button>
              );
            })}
          </div>


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div
              className={`lg:col-span-2 theme-card rounded-2xl border theme-border ${themeCardShadow} overflow-hidden`}
            >
              <div
                className={`flex items-center justify-between gap-2 p-4 sm:p-5 border-b ${themeDivider}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg ${themePrimarySoft} ${themePrimaryText} flex-shrink-0`}
                  >
                    <Building2 size={16} />
                  </div>

                  <h3 className="text-sm font-semibold theme-text truncate">
                    Ringkasan Unit Sekolah
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/yayasan/sekolah")}
                  className={`text-xs font-medium ${themePrimaryText} hover:opacity-80 transition-opacity inline-flex items-center gap-0.5 flex-shrink-0`}
                >
                  Lihat semua
                  <ChevronRight size={12} />
                </button>
              </div>

              <div className="p-4 sm:p-5">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="h-14 rounded-lg animate-pulse"
                        style={{
                          background:
                            "color-mix(in srgb, var(--color-text) 6%, transparent)",
                        }}
                      />
                    ))}
                  </div>
                ) : schools.length === 0 ? (
                  <div className="py-8 text-center">
                    <Building2
                      size={32}
                      className="mx-auto text-[var(--color-text-muted)]"
                    />

                    <p className="mt-2 text-sm font-medium theme-text-secondary">
                      Belum ada unit sekolah
                    </p>

                    <p className="mt-1 text-xs theme-text-muted">
                      Data sekolah binaan belum tersedia.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {schools.map((unit) => (
                      <button
                        key={unit.id}
                        type="button"
                        onClick={() =>
                          router.push(`/yayasan/sekolah/${unit.id}`)
                        }
                        className={`w-full text-left rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-3 ${themeNeutralHover} transition-colors`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold theme-text truncate">
                              {unit.nama}
                            </p>

                            <p className="text-xs theme-text-muted truncate">
                              {unit.jenjang || "-"}
                              {unit.npsn ? ` · NPSN ${unit.npsn}` : ""}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${themeInfoSurface} text-[var(--color-info)]`}
                            >
                              <UserSquare2 size={12} />
                              {Number(unit?.statistik?.totalSiswa ?? 0)} siswa
                            </span>

                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${themeSuccessSurface} text-[var(--color-success)]`}
                            >
                              <GraduationCap size={12} />
                              {Number(unit?.statistik?.totalGuru ?? 0)} guru
                            </span>

                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${themeNeutralSurface} theme-text-secondary`}
                            >
                              <Building2 size={12} />
                              {Number(unit?.statistik?.totalKelas ?? 0)} kelas
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}

                    <div
                      className={`flex flex-wrap items-center gap-4 border-t ${themeDivider} pt-3 text-xs theme-text-muted`}
                    >
                      <span>Total siswa: {totalSiswa}</span>
                      <span>Total guru: {totalGuru}</span>
                      <span>Total kelas: {totalKelas}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>


            <div
              className={`theme-card rounded-2xl border theme-border ${themeCardShadow} overflow-hidden`}
            >
              <div
                className={`flex items-center justify-between p-4 sm:p-5 border-b ${themeDivider}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg ${themeInfoSurface} text-[var(--color-info)] flex-shrink-0`}
                  >
                    <Bell size={16} />
                  </div>

                  <h3 className="text-sm font-semibold theme-text truncate">
                    Notifikasi Terbaru
                  </h3>
                </div>

                {unreadCount > 0 && (
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${themeWarningSurface} text-[var(--color-warning)] border ${themeWarningBorder} flex-shrink-0`}
                  >
                    {unreadCount}
                  </span>
                )}
              </div>

              <div className="divide-y divide-[color-mix(in_srgb,var(--color-text)_7%,transparent)]">
                {loading ? (
                  <div className="p-4 space-y-3">
                    {[1, 2].map((item) => (
                      <div
                        key={item}
                        className="h-12 rounded-lg animate-pulse"
                        style={{
                          background:
                            "color-mix(in srgb, var(--color-text) 6%, transparent)",
                        }}
                      />
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <Bell
                      size={28}
                      className="mx-auto text-[var(--color-text-muted)]"
                    />

                    <p className="mt-2 text-sm font-medium theme-text-secondary">
                      Belum ada notifikasi
                    </p>
                  </div>
                ) : (
                  notifications.slice(0, 4).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 sm:p-5 flex items-start gap-3 ${themeNeutralHover} transition-colors`}
                    >
                      <div
                        className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          notification.dibaca
                            ? "bg-[var(--color-text-placeholder)]"
                            : "bg-[var(--color-primary)]"
                        }`}
                      />

                      <div className="min-w-0">
                        <p className="text-sm font-medium theme-text truncate">
                          {notification.judul}
                        </p>

                        <p className="text-xs theme-text-secondary mt-0.5 line-clamp-2">
                          {notification.isi}
                        </p>

                        <p className="text-[11px] theme-text-muted mt-1">
                          {formatTanggal(notification.dibuatPada)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className={`p-3 border-t ${themeDivider}`}>
                <p className="flex items-start gap-1.5 text-[11px] theme-text-muted">
                  <Info size={12} className="mt-0.5 flex-shrink-0" />
                  Notifikasi personal diambil dari endpoint /api/notifikasi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
