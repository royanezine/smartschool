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
} from "lucide-react";

import { getDashboardSekolah } from "@/services/dashboard.service";

const ADMIN_BRAND_NAME =
  adminSidebarConfig?.brandName || "Admin Sekolah";

const ACCENT = "var(--color-info)";
const TRACK = "var(--color-info-background)";

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
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(
    value
  );

const percentOf = (value, total) =>
  total > 0 ? (value / total) * 100 : 0;

// Membulatkan nilai maksimum sumbu Y ke angka yang "enak" dibaca
const niceMax = (max) => {
  if (max <= 0) return 1;
  const exp = Math.pow(10, Math.floor(Math.log10(max)));
  const fraction = max / exp;
  const steps = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
  const step = steps.find((s) => fraction <= s) ?? 10;
  return step * exp;
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function AdminDashboardPage() {
  const router = useRouter();

  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");
  const [animate, setAnimate] = useState(false);

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

  /* ---------------- Data diagram ---------------- */

  const attendanceData = useMemo(() => {
    if (!cabang?.rekapKehadiran) return [];
    const rekap = cabang.rekapKehadiran;

    return [
      {
        label: "Hadir",
        value: toNumber(rekap.hadir),
        color: "var(--color-success)",
      },
      {
        label: "Izin",
        value: toNumber(rekap.izin),
        color: "var(--color-info)",
      },
      {
        label: "Sakit",
        value: toNumber(rekap.sakit),
        color: "var(--color-warning)",
      },
      {
        label: "Alpha",
        value: toNumber(rekap.alpha),
        color: "var(--color-danger)",
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

  const schoolBars = useMemo(() => {
    if (!cabang) return [];
    return [
      { label: "Siswa", value: toNumber(cabang.totalSiswa) },
      { label: "Guru", value: toNumber(cabang.totalGuru) },
      { label: "Kelas", value: toNumber(cabang.totalKelas) },
    ];
  }, [cabang]);

  const rasioSiswaGuru =
    toNumber(cabang?.totalGuru) > 0
      ? toNumber(cabang?.totalSiswa) / toNumber(cabang?.totalGuru)
      : 0;

  const rasioSiswaKelas =
    toNumber(cabang?.totalKelas) > 0
      ? toNumber(cabang?.totalSiswa) / toNumber(cabang?.totalKelas)
      : 0;

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
            <div className="w-full space-y-8">
              {/* ================= HEADER ================= */}
              <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] theme-text-muted">
                    SmartSchool · Dashboard
                  </p>

                  <h1 className="mt-1.5 break-words text-2xl font-semibold tracking-tight theme-text sm:text-[28px]">
                    Selamat datang, {ADMIN_BRAND_NAME}
                  </h1>

                  <p className="mt-1.5 max-w-2xl text-sm theme-text-secondary">
                    Ringkasan statistik sekolah dan rekap kehadiran
                    berdasarkan data dari backend.
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs theme-text-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {today}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {currentTime} WIB
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={fetchDashboard}
                  disabled={dashboardLoading}
                  className="theme-card theme-border theme-text inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {dashboardLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  {dashboardLoading ? "Memuat..." : "Refresh Data"}
                </button>
              </section>

              {/* ================= ERROR ================= */}
              {dashboardError && (
                <section className="theme-danger rounded-xl border theme-border px-4 py-4 text-sm">
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
              <section className="space-y-4">
                <SectionHeader
                  title="Ringkasan Sekolah"
                  subtitle="Statistik utama yang dikirim oleh backend."
                />

                {dashboardLoading && !dashboardData ? (
                  <KpiSkeleton />
                ) : cabang ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
                  </div>
                ) : !dashboardError ? (
                  <p className="text-sm theme-text-secondary">
                    Data dashboard belum tersedia.
                  </p>
                ) : null}
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
                          onClick={() =>
                            router.push("/admin/manajemenKehadiran")
                          }
                          className="inline-flex items-center gap-1 text-sm font-medium theme-primary-outline"
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
                        subtitle="Komposisi status absensi"
                      >
                        {cabang.rekapKehadiran ? (
                          <div className="space-y-6">
                            <div className="flex flex-col items-center gap-8 sm:flex-row">
                              <DonutChart
                                data={attendanceData}
                                total={attendanceTotal}
                                animate={animate}
                                centerValue={formatNumber(attendanceTotal)}
                                centerLabel="Total absensi"
                              />

                              <div className="w-full flex-1">
                                <div className="grid grid-cols-[1fr_auto_auto] gap-x-6 border-b theme-border-soft pb-2 text-[11px] font-medium uppercase tracking-wider theme-text-muted">
                                  <span>Status</span>
                                  <span className="text-right">Jumlah</span>
                                  <span className="w-14 text-right">
                                    Persen
                                  </span>
                                </div>

                                {attendanceData.map((item) => (
                                  <div
                                    key={item.label}
                                    className="grid grid-cols-[1fr_auto_auto] items-center gap-x-6 border-b theme-border-soft py-3 text-sm last:border-b-0"
                                  >
                                    <span className="flex items-center gap-2.5 font-medium theme-text">
                                      <span
                                        className="h-2.5 w-2.5 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                      />
                                      {item.label}
                                    </span>

                                    <span className="text-right font-semibold tabular-nums theme-text">
                                      {formatNumber(item.value)}
                                    </span>

                                    <span className="w-14 text-right tabular-nums theme-text-secondary">
                                      {formatDecimal(
                                        percentOf(item.value, attendanceTotal)
                                      )}
                                      %
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Stacked bar tipis */}
                            <div className="flex h-2 w-full overflow-hidden rounded-full">
                              {attendanceData.map((item) => (
                                <div
                                  key={item.label}
                                  className="h-full transition-all duration-700 ease-out"
                                  style={{
                                    width: animate
                                      ? `${percentOf(
                                          item.value,
                                          attendanceTotal
                                        )}%`
                                      : "0%",
                                    backgroundColor: item.color,
                                  }}
                                  title={`${item.label}: ${item.value}`}
                                />
                              ))}
                              {attendanceTotal === 0 && (
                                <div
                                  className="h-full w-full"
                                  style={{ backgroundColor: TRACK }}
                                />
                              )}
                            </div>
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
                      <div className="flex flex-col items-center">
                        <RingGauge
                          percent={attendancePercent}
                          animate={animate}
                          label={attendanceLabel}
                        />

                        {cabang.rekapKehadiran && (
                          <p className="mt-5 text-center text-sm theme-text-secondary">
                            <span className="font-semibold tabular-nums theme-text">
                              {formatNumber(
                                attendanceData[0]?.value ?? 0
                              )}
                            </span>{" "}
                            hadir dari{" "}
                            <span className="font-semibold tabular-nums theme-text">
                              {formatNumber(attendanceTotal)}
                            </span>{" "}
                            absensi
                          </p>
                        )}
                      </div>
                    </Card>
                  </div>
                </section>
              )}

              {/* ================= DATA SEKOLAH ================= */}
              {cabang && (
                <section className="space-y-4">
                  <SectionHeader
                    title="Data Sekolah"
                    subtitle="Perbandingan dan rasio rata-rata."
                  />

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                      <Card
                        title="Perbandingan Data"
                        subtitle="Total siswa, guru, dan kelas"
                      >
                        <HorizontalBarChart
                          items={schoolBars}
                          animate={animate}
                        />
                      </Card>
                    </div>

                    <Card
                      title="Rasio Rata-rata"
                      subtitle="Acuan skala maksimal 40"
                    >
                      <div className="space-y-6">
                        <RatioRow
                          label="Siswa per guru"
                          value={formatDecimal(rasioSiswaGuru)}
                          percent={Math.min(100, (rasioSiswaGuru / 40) * 100)}
                          animate={animate}
                        />
                        <RatioRow
                          label="Siswa per kelas"
                          value={formatDecimal(rasioSiswaKelas)}
                          percent={Math.min(100, (rasioSiswaKelas / 40) * 100)}
                          animate={animate}
                        />
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
                        <ColumnChart
                          items={yayasanColumns}
                          animate={animate}
                        />
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

              {/* ================= AKSI CEPAT ================= */}
              <section className="space-y-4">
                <SectionHeader
                  title="Aksi Cepat"
                  subtitle="Akses menu pengelolaan sekolah."
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {quickActions.map((action) => {
                    const Icon = action.icon;

                    return (
                      <button
                        key={action.title}
                        type="button"
                        onClick={() => router.push(action.href)}
                        className="group theme-card theme-border flex w-full items-center gap-4 rounded-xl border p-4 text-left transition hover:shadow-md"
                      >
                        <span className="theme-border theme-text-secondary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border">
                          <Icon className="h-[18px] w-[18px]" />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold theme-text">
                            {action.title}
                          </span>
                          <span className="mt-0.5 block truncate text-xs theme-text-secondary">
                            {action.description}
                          </span>
                        </span>

                        <ChevronRight className="h-4 w-4 shrink-0 theme-text-muted transition group-hover:translate-x-0.5" />
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* ================= FOOTER ================= */}
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

function Card({ title, subtitle, children }) {
  return (
    <div className="theme-card theme-border h-full rounded-xl border p-5 sm:p-6">
      <div className="mb-5">
        <h3 className="text-sm font-semibold theme-text">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-xs theme-text-secondary">{subtitle}</p>
        )}
      </div>

      {children}
    </div>
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
    <div className="theme-card theme-border rounded-xl border p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider theme-text-muted">
          {label}
        </p>
        <Icon className="h-4 w-4 theme-text-muted" />
      </div>

      <p className="mt-3 break-words text-3xl font-semibold tabular-nums tracking-tight theme-text">
        {value}
      </p>

      {typeof progress === "number" && (
        <ThinBar percent={progress} animate={animate} className="mt-3" />
      )}

      {description && (
        <p className="mt-2.5 text-xs theme-text-secondary">{description}</p>
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
          className="theme-card theme-border animate-pulse rounded-xl border p-5"
        >
          <div className="h-3 w-24 rounded" style={{ background: TRACK }} />
          <div
            className="mt-4 h-8 w-20 rounded"
            style={{ background: TRACK }}
          />
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

function RatioRow({ label, value, percent, animate }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium theme-text">{label}</span>
        <span className="text-xl font-semibold tabular-nums theme-text">
          {value}
        </span>
      </div>
      <ThinBar percent={percent} animate={animate} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Diagram: Ring gauge                                                 */
/* ------------------------------------------------------------------ */

function RingGauge({
  percent = 0,
  animate = true,
  label,
  size = 168,
  stroke = 10,
}) {
  const center = size / 2;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = animate ? (percent / 100) * circumference : 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`Tingkat kehadiran ${label}`}
      >
        <g transform={`rotate(-90 ${center} ${center})`}>
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            style={{ stroke: TRACK }}
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
            style={{
              stroke: ACCENT,
              transition: "stroke-dasharray 0.9s ease-out",
            }}
          />
        </g>
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold tabular-nums theme-text">
          {label}
        </span>
        <span className="mt-0.5 text-xs theme-text-muted">Kehadiran</span>
      </div>
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
  stroke = 16,
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
            strokeWidth={stroke}
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
        <span className="text-2xl font-semibold tabular-nums theme-text">
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
/* Diagram: Bar horizontal                                             */
/* ------------------------------------------------------------------ */

function HorizontalBarChart({ items = [], animate = true }) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="space-y-5">
      {items.map((item) => {
        const pct = (item.value / max) * 100;

        return (
          <div
            key={item.label}
            className="grid grid-cols-[64px_1fr_auto] items-center gap-4"
          >
            <span className="text-sm font-medium theme-text">
              {item.label}
            </span>

            <div
              className="h-2.5 w-full overflow-hidden rounded-full"
              style={{ backgroundColor: TRACK }}
            >
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: animate ? `${Math.max(pct, 1.5)}%` : "0%",
                  backgroundColor: ACCENT,
                }}
              />
            </div>

            <span className="min-w-[56px] text-right text-sm font-semibold tabular-nums theme-text">
              {formatNumber(item.value)}
            </span>
          </div>
        );
      })}
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
        <div
          className="relative shrink-0"
          style={{ width: AXIS_WIDTH, height }}
        >
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
              className="absolute inset-x-0 border-t theme-border-soft"
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