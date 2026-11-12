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
  GraduationCap,
  Sparkles,
  CalendarDays,
  AlertCircle,
  Loader2,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  CheckCircle2,
  FileText,
  Thermometer,
  XCircle,
  ClipboardList,
  Info,
  ArrowUpRight,
} from "lucide-react";

import { getDashboardSekolah } from "@/services/dashboard.service";

const ADMIN_BRAND_NAME = adminSidebarConfig?.brandName || "Admin Sekolah";

/* ------------------------------------------------------------------ */
/* Token tema — semua warna mengikuti --color-* (bisa diubah dari CMS) */
/* ------------------------------------------------------------------ */

const ACCENT = "var(--color-primary)";
const TRACK = "color-mix(in srgb, var(--color-text) 9%, transparent)";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText = "text-[var(--color-primary)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-danger)_25%,transparent)]";

/* ------------------------------------------------------------------ */
/* Sapaan berdasarkan jam                                              */
/* ------------------------------------------------------------------ */

const HOURLY_MESSAGES = [
  "Larut malam, jangan lupa istirahat yang cukup.",
  "Sistem tetap berjalan, Anda boleh beristirahat.",
  "Waktunya tenang, data sekolah aman terkelola.",
  "Dini hari yang hening, semoga lelap menyertai.",
  "Fajar hampir tiba, hari baru segera dimulai.",
  "Mulai hari dengan niat baik dan kepala dingin.",
  "Pagi yang segar, saatnya memantau kehadiran hari ini.",
  "Siswa mulai berdatangan, pantau absensi pagi ini.",
  "Semangat pagi, jam pelajaran sedang berjalan.",
  "Periksa ringkasan sekolah sebelum jam istirahat.",
  "Tetap fokus, separuh hari kerja sudah terlewati.",
  "Menjelang siang, tinjau rekap kehadiran terbaru.",
  "Waktunya jeda sejenak, isi tenaga untuk siang ini.",
  "Siang yang produktif, lanjutkan pengelolaan data sekolah.",
  "Kegiatan belajar hampir usai, cek data hari ini.",
  "Sore hari, saatnya merapikan laporan harian.",
  "Tinjau kembali capaian hari ini sebelum pulang.",
  "Menjelang petang, pastikan semua data sudah tercatat.",
  "Terima kasih atas kerja hari ini, selamat beristirahat.",
  "Malam yang tenang, tinjau ringkasan hari ini.",
  "Hari hampir usai, semoga semua berjalan lancar.",
  "Waktunya memulihkan tenaga untuk esok hari.",
  "Sudah malam, sisakan pekerjaan untuk besok.",
  "Selamat malam, sampai jumpa di hari yang baru.",
];

function getGreeting(date) {
  const hour = date.getHours();

  if (hour >= 5 && hour < 11) {
    return { text: "Selamat pagi", icon: Sunrise, hour };
  }
  if (hour >= 11 && hour < 15) {
    return { text: "Selamat siang", icon: Sun, hour };
  }
  if (hour >= 15 && hour < 18) {
    return { text: "Selamat sore", icon: Sunset, hour };
  }
  return { text: "Selamat malam", icon: Moon, hour };
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const toNumber = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = parseFloat(String(value ?? "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatNumber = (value) =>
  new Intl.NumberFormat("id-ID").format(toNumber(value));

const formatDecimal = (value) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(value);

const percentOf = (value, total) => (total > 0 ? (value / total) * 100 : 0);

// Membulatkan nilai maksimum sumbu Y ke angka yang "enak" dibaca
const niceMax = (max) => {
  if (max <= 0) return 1;
  const exp = Math.pow(10, Math.floor(Math.log10(max)));
  const fraction = max / exp;
  const steps = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
  const step = steps.find((s) => fraction <= s) ?? 10;
  return step * exp;
};

const RATIO_REFERENCE = 40;

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function AdminDashboardPage() {
  const router = useRouter();

  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");
  const [animate, setAnimate] = useState(false);
  const [now, setNow] = useState(null);

  // Jam berjalan: diperbarui tiap 30 detik, sapaan & pesan ikut berganti per jam.
  useEffect(() => {
    const first = setTimeout(() => setNow(new Date()), 0);
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, []);

  const fetchDashboard = useCallback(async () => {
    try {
      setDashboardLoading(true);
      setDashboardError("");

      const response = await getDashboardSekolah();

      if (response?.success !== true) {
        throw new Error(response?.message || "Gagal mengambil data dashboard.");
      }

      if (!response.data || !response.data.cabang) {
        throw new Error("Data cabang tidak tersedia pada response backend.");
      }

      setDashboardData(response.data);
    } catch (error) {
      console.error("Error fetch dashboard:", error);

      setDashboardError(error?.message || "Gagal mengambil data dashboard.");

      setDashboardData(null);
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDashboard();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchDashboard]);

  useEffect(() => {
    if (!dashboardData) {
      setAnimate(false);
      return undefined;
    }
    const timer = setTimeout(() => setAnimate(true), 60);
    return () => clearTimeout(timer);
  }, [dashboardData]);

  const cabang = dashboardData?.cabang ?? null;
  const yayasan = dashboardData?.yayasan ?? null;

  const greeting = now ? getGreeting(now) : null;
  const GreetingIcon = greeting?.icon ?? Sparkles;

  const today = now
    ? new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(now)
    : "";

  const currentTime = now
    ? new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
        .format(now)
        .replace(".", ":")
    : "--:--";

  /* ---------------- Data diagram ---------------- */

  const attendanceData = useMemo(() => {
    if (!cabang?.rekapKehadiran) return [];
    const rekap = cabang.rekapKehadiran;

    return [
      {
        label: "Hadir",
        value: toNumber(rekap.hadir),
        color: "var(--color-success)",
        icon: CheckCircle2,
      },
      {
        label: "Izin",
        value: toNumber(rekap.izin),
        color: "var(--color-info)",
        icon: FileText,
      },
      {
        label: "Sakit",
        value: toNumber(rekap.sakit),
        color: "var(--color-warning)",
        icon: Thermometer,
      },
      {
        label: "Alpha",
        value: toNumber(rekap.alpha),
        color: "var(--color-danger)",
        icon: XCircle,
      },
    ];
  }, [cabang]);

  const attendanceTotal = useMemo(
    () => attendanceData.reduce((sum, item) => sum + item.value, 0),
    [attendanceData]
  );

  const attendancePercent = Math.min(
    100,
    Math.max(0, toNumber(cabang?.persentaseHadir))
  );

  const attendanceLabel = useMemo(() => {
    const raw = cabang?.persentaseHadir;
    if (raw === undefined || raw === null || raw === "") return "-";
    return String(raw).includes("%")
      ? String(raw)
      : `${formatDecimal(attendancePercent)}%`;
  }, [cabang, attendancePercent]);

  const totalSiswa = toNumber(cabang?.totalSiswa);
  const totalGuru = toNumber(cabang?.totalGuru);
  const totalKelas = toNumber(cabang?.totalKelas);

  const rasioSiswaGuru = totalGuru > 0 ? totalSiswa / totalGuru : 0;
  const rasioSiswaKelas = totalKelas > 0 ? totalSiswa / totalKelas : 0;
  const rasioGuruKelas = totalKelas > 0 ? totalGuru / totalKelas : 0;

  const yayasanColumns = useMemo(() => {
    if (!yayasan) return [];
    return [
      { label: "Sekolah", value: toNumber(yayasan.totalSekolah) },
      { label: "Siswa", value: toNumber(yayasan.totalSiswa) },
      { label: "Guru", value: toNumber(yayasan.totalGuru) },
      { label: "Kelas", value: toNumber(yayasan.totalKelas) },
    ];
  }, [yayasan]);

  const contributionData = useMemo(() => {
    if (!yayasan || !cabang) return [];
    return [
      {
        label: "Siswa",
        value: toNumber(cabang.totalSiswa),
        total: toNumber(yayasan.totalSiswa),
      },
      {
        label: "Guru",
        value: toNumber(cabang.totalGuru),
        total: toNumber(yayasan.totalGuru),
      },
      {
        label: "Kelas",
        value: toNumber(cabang.totalKelas),
        total: toNumber(yayasan.totalKelas),
      },
    ];
  }, [cabang, yayasan]);

  const quickActions = [
    {
      title: "Tambah Siswa",
      description: "Daftarkan data siswa baru ke sekolah",
      icon: Users,
      href: "/admin/siswa/tambah",
      color: "var(--color-primary)",
    },
    {
      title: "Tambah Guru",
      description: "Tambahkan data guru atau tenaga pengajar",
      icon: UserCheck,
      href: "/admin/guru/tambah",
      color: "var(--color-info)",
    },
    {
      title: "Kelola Kelas",
      description: "Atur daftar dan rombongan kelas",
      icon: School,
      href: "/admin/akademik/kelas",
      color: "var(--color-success)",
    },
    {
      title: "Tahun Ajaran",
      description: "Kelola periode dan semester aktif",
      icon: CalendarDays,
      href: "/admin/akademik/tahun-ajaran",
      color: "var(--color-warning)",
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
          <div className="w-full min-w-0 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
            <div className="w-full min-w-0 space-y-6">
              {/* ================= BANNER SAPAAN ================= */}
              <section
                className={`relative overflow-hidden rounded-3xl border ${themePrimarySoftBorder} ${themeCardShadow} bg-[linear-gradient(120deg,color-mix(in_srgb,var(--color-primary)_16%,var(--color-card)),color-mix(in_srgb,var(--color-primary)_4%,var(--color-card)))]`}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] blur-2xl"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-[0.05]"
                  style={{
                    backgroundImage:
                      "linear-gradient(var(--color-text) 1px, transparent 1px), linear-gradient(90deg, var(--color-text) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                  }}
                />

                <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 max-w-2xl">
                    <div
                      className={`inline-flex items-center gap-2 rounded-full border ${themePrimarySoftBorder} bg-[var(--color-card)] px-3 py-1.5 text-xs font-semibold ${themePrimaryText}`}
                    >
                      <GreetingIcon className="h-3.5 w-3.5" />
                      <span className="tabular-nums">{currentTime} WIB</span>
                      <span className="theme-text-muted">·</span>
                      <span className="theme-text-secondary">
                        {today || "Memuat tanggal..."}
                      </span>
                    </div>

                    <h1 className="mt-4 break-words text-2xl font-bold tracking-tight theme-text sm:text-3xl lg:text-4xl">
                      {greeting ? greeting.text : "Selamat datang"},{" "}
                      <span className={themePrimaryText}>
                        {ADMIN_BRAND_NAME}
                      </span>
                    </h1>

                    <p className="mt-2 max-w-xl text-sm leading-6 theme-text-secondary sm:text-base">
                      {greeting
                        ? HOURLY_MESSAGES[greeting.hour]
                        : "Ringkasan statistik sekolah dan rekap kehadiran."}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={fetchDashboard}
                        disabled={dashboardLoading}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_22%,transparent)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {dashboardLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                        {dashboardLoading ? "Memuat..." : "Refresh Data"}
                      </button>

                      <button
                        type="button"
                        onClick={() => router.push("/admin/manajemenKehadiran")}
                        className="theme-card theme-border theme-text inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition hover:shadow-sm"
                      >
                        <Clock className="h-4 w-4" />
                        Lihat kehadiran
                      </button>
                    </div>
                  </div>

                  <BannerArt />
                </div>
              </section>

              {/* ================= ERROR ================= */}
              {dashboardError && (
                <section
                  role="alert"
                  className={`rounded-xl border ${themeDangerBorder} ${themeDangerSurface} px-4 py-4 text-sm text-[var(--color-danger)]`}
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                    <div>
                      <p className="font-semibold">Gagal memuat dashboard</p>
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

              {/* ================= RINGKASAN ================= */}
              {dashboardLoading && !dashboardData ? (
                <KpiSkeleton />
              ) : cabang ? (
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <KpiCard
                    label="Total Siswa"
                    value={formatNumber(cabang.totalSiswa)}
                    description="Siswa aktif"
                    icon={GraduationCap}
                  />
                  <KpiCard
                    label="Total Guru"
                    value={formatNumber(cabang.totalGuru)}
                    description="Guru aktif"
                    icon={UserCheck}
                  />
                  <KpiCard
                    label="Total Kelas"
                    value={formatNumber(cabang.totalKelas)}
                    description="Jumlah kelas"
                    icon={School}
                  />
                  <KpiCard
                    label="Kehadiran"
                    value={attendanceLabel}
                    description="Persentase kehadiran hari ini"
                    icon={BarChart3}
                    progress={attendancePercent}
                    animate={animate}
                  />
                </section>
              ) : !dashboardError ? (
                <p className="text-sm theme-text-secondary">
                  Data dashboard belum tersedia.
                </p>
              ) : null}

              {/* ================= KALENDER & AKSI CEPAT ================= */}
              <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Card title="Kalender" subtitle="Bulan berjalan">
                  <MiniCalendar now={now} />
                </Card>

                <div className="lg:col-span-2">
                  <Card
                    title="Aksi Cepat"
                    subtitle="Akses menu pengelolaan sekolah"
                    bodyClassName="flex"
                  >
                    <div className="grid w-full flex-1 auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2">
                      {quickActions.map((action) => (
                        <QuickActionCard
                          key={action.title}
                          action={action}
                          onClick={() => router.push(action.href)}
                        />
                      ))}
                    </div>
                  </Card>
                </div>
              </section>

              {/* ================= KEHADIRAN ================= */}
              {cabang && (
                <section className="space-y-4">
                  <SectionHeader
                    title="Analitik Kehadiran"
                    subtitle="Distribusi absensi hari ini."
                    action={
                      cabang.rekapKehadiran && (
                        <button
                          type="button"
                          onClick={() => router.push("/admin/manajemenKehadiran")}
                          className={`inline-flex items-center gap-1 text-sm font-semibold ${themePrimaryText} transition hover:opacity-75`}
                        >
                          Lihat detail
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      )
                    }
                  />

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                      <Card
                        title="Rekap Kehadiran"
                        subtitle="Komposisi status absensi hari ini"
                      >
                        {cabang.rekapKehadiran ? (
                          <div className="space-y-5">
                            <div className="flex flex-col items-center gap-6 xl:flex-row xl:items-center xl:gap-8">
                              <DonutChart
                                data={attendanceData}
                                total={attendanceTotal}
                                animate={animate}
                                centerValue={formatNumber(attendanceTotal)}
                                centerLabel="Total absensi"
                              />

                              <div className="grid w-full flex-1 grid-cols-2 gap-3">
                                {attendanceData.map((item) => (
                                  <AttendanceTile
                                    key={item.label}
                                    item={item}
                                    total={attendanceTotal}
                                    animate={animate}
                                  />
                                ))}
                              </div>
                            </div>

                            {attendanceTotal > 0 ? (
                              <div
                                className="flex h-2 w-full overflow-hidden rounded-full"
                                style={{ backgroundColor: TRACK }}
                              >
                                {attendanceData.map((item) => (
                                  <div
                                    key={item.label}
                                    className="h-full transition-all duration-700 ease-out"
                                    style={{
                                      width: animate
                                        ? `${percentOf(item.value, attendanceTotal)}%`
                                        : "0%",
                                      backgroundColor: item.color,
                                    }}
                                    title={`${item.label}: ${item.value}`}
                                  />
                                ))}
                              </div>
                            ) : (
                              <div
                                className={`flex flex-col gap-3 rounded-xl border ${themePrimarySoftBorder} ${themePrimarySoft} p-4 sm:flex-row sm:items-center sm:justify-between`}
                              >
                                <div className="flex items-start gap-3">
                                  <Info
                                    className={`mt-0.5 h-4 w-4 shrink-0 ${themePrimaryText}`}
                                  />
                                  <p className="text-sm leading-5 theme-text-secondary">
                                    Belum ada absensi yang tercatat hari ini.
                                    Rekap akan terisi otomatis setelah
                                    kehadiran dicatat.
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    router.push("/admin/manajemenKehadiran")
                                  }
                                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-3.5 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                                >
                                  <ClipboardList className="h-3.5 w-3.5" />
                                  Buka kehadiran
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <EmptyChart message="Rekap kehadiran belum tersedia." />
                        )}
                      </Card>
                    </div>

                    <Card
                      title="Tingkat Kehadiran"
                      subtitle="Persentase dari backend"
                    >
                      <div className="flex h-full flex-col items-center justify-center gap-5 pb-2">
                        <HalfGauge
                          percent={attendancePercent}
                          animate={animate}
                          value={attendanceLabel}
                          caption="Kehadiran hari ini"
                          minLabel="0%"
                          maxLabel="100%"
                        />

                        <div
                          className={`w-full rounded-xl border ${themeDivider} ${themeNeutralSurface} px-4 py-3 text-center text-sm theme-text-secondary`}
                        >
                          {cabang.rekapKehadiran && attendanceTotal > 0 ? (
                            <>
                              <span className="font-semibold tabular-nums theme-text">
                                {formatNumber(attendanceData[0]?.value ?? 0)}
                              </span>{" "}
                              hadir dari{" "}
                              <span className="font-semibold tabular-nums theme-text">
                                {formatNumber(attendanceTotal)}
                              </span>{" "}
                              absensi
                            </>
                          ) : (
                            "Menunggu data absensi hari ini"
                          )}
                        </div>
                      </div>
                    </Card>
                  </div>
                </section>
              )}

              {/* ================= RASIO & KAPASITAS ================= */}
              {cabang && (
                <section className="space-y-4">
                  <SectionHeader
                    title="Rasio & Kapasitas"
                    subtitle={`Perbandingan siswa, guru, dan kelas. Acuan skala maksimal ${RATIO_REFERENCE}.`}
                  />

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card title="Siswa per Guru" subtitle="Rata-rata beban pengajar">
                      <div className="flex flex-col items-center gap-4">
                        <HalfGauge
                          percent={Math.min(
                            100,
                            (rasioSiswaGuru / RATIO_REFERENCE) * 100
                          )}
                          animate={animate}
                          value={formatDecimal(rasioSiswaGuru)}
                          caption="siswa / guru"
                          minLabel="0"
                          maxLabel={String(RATIO_REFERENCE)}
                        />
                        <p className="text-center text-xs tabular-nums theme-text-muted">
                          {formatNumber(totalSiswa)} siswa ·{" "}
                          {formatNumber(totalGuru)} guru
                        </p>
                      </div>
                    </Card>

                    <Card title="Siswa per Kelas" subtitle="Rata-rata isi kelas">
                      <div className="flex flex-col items-center gap-4">
                        <HalfGauge
                          percent={Math.min(
                            100,
                            (rasioSiswaKelas / RATIO_REFERENCE) * 100
                          )}
                          animate={animate}
                          value={formatDecimal(rasioSiswaKelas)}
                          caption="siswa / kelas"
                          minLabel="0"
                          maxLabel={String(RATIO_REFERENCE)}
                        />
                        <p className="text-center text-xs tabular-nums theme-text-muted">
                          {formatNumber(totalSiswa)} siswa ·{" "}
                          {formatNumber(totalKelas)} kelas
                        </p>
                      </div>
                    </Card>

                    <Card title="Guru per Kelas" subtitle="Ketersediaan pengajar">
                      <div className="flex h-full flex-col items-center justify-center gap-4 pb-2">
                        <span
                          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${themePrimarySoft} ${themePrimaryText}`}
                        >
                          <UserCheck className="h-6 w-6" />
                        </span>

                        <div className="text-center">
                          <p className="text-4xl font-bold tabular-nums tracking-tight theme-text">
                            {formatDecimal(rasioGuruKelas)}
                          </p>
                          <p className="mt-1 text-xs theme-text-secondary">
                            guru / kelas
                          </p>
                        </div>

                        <p className="text-center text-xs tabular-nums theme-text-muted">
                          {formatNumber(totalGuru)} guru ·{" "}
                          {formatNumber(totalKelas)} kelas
                        </p>
                      </div>
                    </Card>
                  </div>
                </section>
              )}

              {/* ================= YAYASAN ================= */}
              {yayasan && (
                <section className="space-y-4">
                  <SectionHeader
                    title="Statistik Yayasan"
                    subtitle="Total data yayasan dan kontribusi cabang."
                  />

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                      <Card
                        title="Total Data Yayasan"
                        subtitle="Sekolah, siswa, guru, dan kelas"
                      >
                        <ColumnChart items={yayasanColumns} animate={animate} />
                      </Card>
                    </div>

                    <Card
                      title="Kontribusi Cabang"
                      subtitle="Porsi cabang terhadap yayasan"
                    >
                      <div className="space-y-6">
                        {contributionData.map((item) => {
                          const pct = percentOf(item.value, item.total);

                          return (
                            <div key={item.label}>
                              <div className="flex items-baseline justify-between text-sm">
                                <span className="font-medium theme-text">
                                  {item.label}
                                </span>
                                <span className="font-semibold tabular-nums theme-text">
                                  {formatDecimal(pct)}%
                                </span>
                              </div>

                              <ThinBar percent={pct} animate={animate} />

                              <p className="mt-1.5 text-xs tabular-nums theme-text-muted">
                                {formatNumber(item.value)} dari{" "}
                                {formatNumber(item.total)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  </div>
                </section>
              )}

              {/* ================= FOOTER ================= */}
              <footer className={`border-t ${themeDivider} pt-6`}>
                <div className="flex flex-col items-center justify-between gap-3 text-center text-xs theme-text-muted sm:flex-row sm:text-left">
                  <p>
                    © {new Date().getFullYear()} SmartSchool — {ADMIN_BRAND_NAME}
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

/* ------------------------------------------------------------------ */
/* Komponen umum                                                       */
/* ------------------------------------------------------------------ */

function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-base font-semibold theme-text">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-sm theme-text-secondary">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

function Card({ title, subtitle, children, bodyClassName = "" }) {
  return (
    <div
      className={`theme-card theme-border flex h-full min-w-0 flex-col rounded-2xl border p-5 sm:p-6 ${themeCardShadow}`}
    >
      <div className="mb-5">
        <h3 className="text-sm font-semibold theme-text">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-xs theme-text-secondary">{subtitle}</p>
        )}
      </div>

      <div className={`min-h-0 flex-1 ${bodyClassName}`}>{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Aksi Cepat: kartu aksi                                              */
/* ------------------------------------------------------------------ */

function QuickActionCard({ action, onClick }) {
  const Icon = action.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{ "--qa": action.color }}
      className={`group relative flex min-h-[132px] w-full flex-col justify-between overflow-hidden rounded-2xl border ${themeDivider} bg-[color-mix(in_srgb,var(--qa)_5%,var(--color-card))] p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--qa)_45%,transparent)] hover:shadow-[0_10px_24px_color-mix(in_srgb,var(--qa)_16%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--qa)]`}
    >
      {/* Dekorasi lingkaran lembut di sudut */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-[color-mix(in_srgb,var(--qa)_10%,transparent)] transition duration-300 group-hover:scale-125"
      />

      <div className="relative flex items-start justify-between">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--qa)_14%,transparent)] text-[var(--qa)] transition duration-200 group-hover:bg-[var(--qa)] group-hover:text-white group-hover:shadow-[0_6px_14px_color-mix(in_srgb,var(--qa)_35%,transparent)]">
          <Icon className="h-5 w-5" />
        </span>

        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] bg-[var(--color-card)] theme-text-muted transition duration-200 group-hover:border-transparent group-hover:bg-[var(--qa)] group-hover:text-white">
          <ArrowUpRight className="h-4 w-4 transition duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>

      <div className="relative mt-5 min-w-0">
        <span className="block text-base font-semibold theme-text">
          {action.title}
        </span>
        <span className="mt-1 block text-xs leading-5 theme-text-secondary">
          {action.description}
        </span>
      </div>
    </button>
  );
}

function KpiCard({
  label,
  value,
  description,
  icon: Icon,
  progress,
  animate = true,
}) {
  return (
    <div
      className={`theme-card theme-border min-w-0 rounded-2xl border p-5 ${themeCardShadow}`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
            {label}
          </p>
          <p className="mt-0.5 break-words text-2xl font-bold tabular-nums tracking-tight theme-text">
            {value}
          </p>
        </div>
      </div>

      {typeof progress === "number" && (
        <ThinBar percent={progress} animate={animate} className="mt-4" />
      )}

      {description && (
        <p
          className={`${
            typeof progress === "number" ? "mt-2" : "mt-4"
          } text-xs font-medium ${themePrimaryText}`}
        >
          {description}
        </p>
      )}
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className={`theme-card theme-border animate-pulse rounded-2xl border p-5 ${themeCardShadow}`}
        >
          <div className="flex items-center gap-4">
            <div
              className="h-12 w-12 rounded-xl"
              style={{ background: TRACK }}
            />
            <div className="flex-1">
              <div className="h-3 w-24 rounded" style={{ background: TRACK }} />
              <div
                className="mt-2 h-6 w-16 rounded"
                style={{ background: TRACK }}
              />
            </div>
          </div>
          <div
            className="mt-4 h-3 w-32 rounded"
            style={{ background: TRACK }}
          />
        </div>
      ))}
    </div>
  );
}

function EmptyChart({ message }) {
  return (
    <div className="flex h-40 items-center justify-center text-sm theme-text-muted">
      {message}
    </div>
  );
}

function ThinBar({ percent = 0, animate = true, className = "mt-2" }) {
  return (
    <div
      className={`h-1.5 w-full overflow-hidden rounded-full ${className}`}
      style={{ backgroundColor: TRACK }}
    >
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{
          width: animate ? `${Math.min(100, Math.max(0, percent))}%` : "0%",
          backgroundColor: ACCENT,
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Ilustrasi banner (bentuk abstrak buatan sendiri, mengikuti tema)    */
/* ------------------------------------------------------------------ */

function BannerArt() {
  return (
    <div
      aria-hidden="true"
      className="relative hidden h-40 w-72 shrink-0 lg:block"
      style={{ color: "var(--color-primary)" }}
    >
      <svg viewBox="0 0 288 160" className="h-full w-full">
        <circle cx="236" cy="38" r="22" fill="currentColor" opacity="0.18" />
        <circle cx="236" cy="38" r="10" fill="currentColor" opacity="0.35" />

        <rect x="40" y="112" width="200" height="22" rx="6" fill="currentColor" opacity="0.9" />
        <rect x="52" y="88" width="176" height="22" rx="6" fill="currentColor" opacity="0.6" />
        <rect x="64" y="64" width="152" height="22" rx="6" fill="currentColor" opacity="0.35" />

        <rect x="40" y="134" width="200" height="4" rx="2" fill="currentColor" opacity="0.25" />

        <path
          d="M58 64 C58 40, 80 28, 98 34 C92 46, 86 54, 78 64 Z"
          fill="currentColor"
          opacity="0.45"
        />
        <path
          d="M70 64 C74 44, 96 36, 112 44 C104 54, 94 60, 86 64 Z"
          fill="currentColor"
          opacity="0.28"
        />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Kalender mini                                                       */
/* ------------------------------------------------------------------ */

const HARI_SINGKAT = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function MiniCalendar({ now }) {
  const current = now ?? new Date();
  const year = current.getFullYear();
  const month = current.getMonth();
  const today = current.getDate();

  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  const monthLabel = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(current);

  return (
    <div>
      <p className="mb-3 text-center text-sm font-semibold capitalize theme-text">
        {monthLabel}
      </p>

      <div className="grid grid-cols-7 gap-1 text-center">
        {HARI_SINGKAT.map((hari, index) => (
          <span
            key={hari}
            className={`py-1 text-[10px] font-semibold uppercase tracking-wide ${
              index === 6 ? "text-[var(--color-danger)]" : "theme-text-muted"
            }`}
          >
            {hari}
          </span>
        ))}

        {cells.map((day, index) => {
          if (day === null) {
            return <span key={`blank-${index}`} />;
          }

          const isToday = day === today;
          const isSunday = index % 7 === 6;

          return (
            <span
              key={day}
              className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs tabular-nums ${
                isToday
                  ? "bg-[var(--color-primary)] font-bold text-white"
                  : isSunday
                    ? "text-[var(--color-danger)]"
                    : "theme-text-secondary"
              }`}
            >
              {day}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Kehadiran: tile status                                              */
/* ------------------------------------------------------------------ */

function AttendanceTile({ item, total, animate }) {
  const Icon = item.icon;
  const pct = percentOf(item.value, total);

  return (
    <div
      className={`min-w-0 rounded-xl border ${themeDivider} ${themeNeutralSurface} p-4`}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{
            backgroundColor: `color-mix(in srgb, ${item.color} 14%, transparent)`,
            color: item.color,
          }}
        >
          <Icon className="h-[18px] w-[18px]" />
        </span>

        <span className="text-xs font-semibold tabular-nums theme-text-secondary">
          {total > 0 ? `${formatDecimal(pct)}%` : "—"}
        </span>
      </div>

      <p className="mt-3 text-2xl font-bold tabular-nums tracking-tight theme-text">
        {formatNumber(item.value)}
      </p>
      <p className="text-xs font-medium theme-text-secondary">{item.label}</p>

      <div
        className="mt-3 h-1 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: TRACK }}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: animate ? `${pct}%` : "0%",
            backgroundColor: item.color,
          }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Diagram: Gauge setengah lingkaran                                   */
/* ------------------------------------------------------------------ */

function HalfGauge({
  percent = 0,
  animate = true,
  value,
  caption,
  minLabel,
  maxLabel,
}) {
  const progress = animate ? Math.min(100, Math.max(0, percent)) : 0;

  return (
    <div className="relative mx-auto w-full max-w-[260px]">
      <svg
        viewBox="0 0 200 108"
        className="block w-full"
        role="img"
        aria-label={`${caption}: ${value}`}
      >
        <path
          d="M 14 100 A 86 86 0 0 1 186 100"
          fill="none"
          strokeWidth="16"
          strokeLinecap="round"
          style={{ stroke: TRACK }}
          pathLength="100"
        />

        {progress > 0 && (
          <path
            d="M 14 100 A 86 86 0 0 1 186 100"
            fill="none"
            strokeWidth="16"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray={`${progress} 100`}
            style={{
              stroke: ACCENT,
              transition: "stroke-dasharray 0.9s ease-out",
            }}
          />
        )}
      </svg>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center">
        <span className="text-3xl font-bold tabular-nums tracking-tight theme-text">
          {value}
        </span>
        <span className="text-[11px] theme-text-muted">{caption}</span>
      </div>

      {minLabel && (
        <span className="absolute -bottom-5 left-0 w-8 text-center text-[10px] tabular-nums theme-text-muted">
          {minLabel}
        </span>
      )}
      {maxLabel && (
        <span className="absolute -bottom-5 right-0 w-8 text-center text-[10px] tabular-nums theme-text-muted">
          {maxLabel}
        </span>
      )}

      <div className="h-5" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Diagram: Donut                                                      */
/* ------------------------------------------------------------------ */

function DonutChart({
  data = [],
  total = 0,
  animate = true,
  centerValue,
  centerLabel,
  size = 176,
  stroke = 18,
}) {
  const center = size / 2;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Donut chart rekap kehadiran"
      >
        <g transform={`rotate(-90 ${center} ${center})`}>
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            strokeWidth={total > 0 ? stroke : 3}
            strokeLinecap="round"
            strokeDasharray={total > 0 ? undefined : "2 9"}
            style={{ stroke: TRACK }}
          />

          {total > 0 &&
            data.map((item) => {
              const rawLength = (item.value / total) * circumference;
              const currentOffset = offset;
              offset += rawLength;

              if (item.value <= 0) return null;

              // Sedikit jarak antar segmen agar rapi
              const gap = data.filter((d) => d.value > 0).length > 1 ? 2 : 0;
              const length = Math.max(0, rawLength - gap);

              return (
                <circle
                  key={item.label}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  strokeWidth={stroke}
                  strokeDasharray={`${animate ? length : 0} ${circumference}`}
                  strokeDashoffset={-currentOffset}
                  style={{
                    stroke: item.color,
                    transition: "stroke-dasharray 0.9s ease-out",
                  }}
                >
                  <title>{`${item.label}: ${item.value}`}</title>
                </circle>
              );
            })}
        </g>
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tabular-nums tracking-tight theme-text">
          {centerValue}
        </span>
        <span className="mt-0.5 text-[11px] theme-text-muted">
          {centerLabel}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Diagram: Bar vertikal dengan sumbu Y                                */
/* ------------------------------------------------------------------ */

function ColumnChart({ items = [], animate = true, height = 220 }) {
  const rawMax = Math.max(...items.map((item) => item.value), 0);
  const axisMax = niceMax(rawMax);
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const AXIS_WIDTH = 52;

  return (
    <div>
      <div className="flex">
        {/* Sumbu Y */}
        <div className="relative shrink-0" style={{ width: AXIS_WIDTH, height }}>
          {ticks.map((tick) => (
            <span
              key={tick}
              className="absolute right-3 text-[11px] tabular-nums theme-text-muted"
              style={{
                bottom: `${tick * 100}%`,
                transform: "translateY(50%)",
              }}
            >
              {formatNumber(Math.round(axisMax * tick))}
            </span>
          ))}
        </div>

        {/* Area grafik */}
        <div className="relative min-w-0 flex-1" style={{ height }}>
          {ticks.map((tick) => (
            <div
              key={tick}
              className={`absolute inset-x-0 border-t ${themeDivider}`}
              style={{ bottom: `${tick * 100}%` }}
            />
          ))}

          <div
            className="relative grid h-full gap-4"
            style={{
              gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
            }}
          >
            {items.map((item) => {
              const pct = axisMax > 0 ? (item.value / axisMax) * 100 : 0;

              return (
                <div key={item.label} className="relative h-full">
                  <div
                    className="absolute bottom-0 left-1/2 w-full max-w-[44px] -translate-x-1/2 rounded-t-md transition-all duration-700 ease-out"
                    style={{
                      height: animate ? `${Math.max(pct, 0.8)}%` : "0%",
                      backgroundColor: ACCENT,
                    }}
                    title={`${item.label}: ${item.value}`}
                  />

                  <span
                    className="absolute left-0 right-0 text-center text-xs font-semibold tabular-nums theme-text transition-all duration-700 ease-out"
                    style={{
                      bottom: animate
                        ? `calc(${Math.max(pct, 0.8)}% + 6px)`
                        : "6px",
                    }}
                  >
                    {formatNumber(item.value)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Label sumbu X */}
      <div className="mt-3 flex">
        <div className="shrink-0" style={{ width: AXIS_WIDTH }} />
        <div
          className="grid min-w-0 flex-1 gap-4"
          style={{
            gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
          }}
        >
          {items.map((item) => (
            <span
              key={item.label}
              className="text-center text-xs font-medium theme-text-secondary"
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}