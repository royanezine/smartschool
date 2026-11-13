"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getPaket } from "@/services/paket.service";
import { getAuditLogs } from "@/services/auditLog.service";
import { getAllLangganan } from "@/services/langganan.service";
import { getNotifikasi } from "@/services/notifikasi.service";

import {
  School,
  Building2,
  Users,
  Package,
  Activity,
  ChevronRight,
  Edit3,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Bell,
  CheckCircle2,
  RefreshCw,
  Settings,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  Trash2,
  Loader2,
  Sparkles,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Zap,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Token tema — semua warna mengikuti --color-* (bisa diubah dari CMS) */
/* ------------------------------------------------------------------ */

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

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)]";

/* ------------------------------------------------------------------ */
/* Sapaan berdasarkan jam                                              */
/* ------------------------------------------------------------------ */

const HOURLY_MESSAGES = [
  "Larut malam, jangan lupa istirahat yang cukup.",
  "Sistem tetap berjalan, Anda boleh beristirahat.",
  "Waktunya tenang, data platform aman terkelola.",
  "Dini hari yang hening, semoga lelap menyertai.",
  "Fajar hampir tiba, hari baru segera dimulai.",
  "Mulai hari dengan niat baik dan kepala dingin.",
  "Pagi yang segar, saatnya memantau langganan sekolah.",
  "Hari baru dimulai, pantau aktivitas platform pagi ini.",
  "Semangat pagi, cek perkembangan sekolah terdaftar.",
  "Periksa ringkasan platform sebelum jam makan siang.",
  "Tetap fokus, separuh hari kerja sudah terlewati.",
  "Menjelang siang, tinjau status langganan terbaru.",
  "Waktunya jeda sejenak, isi tenaga untuk siang ini.",
  "Siang yang produktif, lanjutkan pengelolaan platform.",
  "Sore mulai mendekat, cek aktivitas terbaru hari ini.",
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
/* Data statis navigasi (hanya menu yang memang ada)                   */
/* ------------------------------------------------------------------ */

const quickActions = [
  {
    label: "Tambah Sekolah",
    description: "Daftarkan sekolah baru ke platform",
    icon: School,
    path: "/super-admin/sekolah/tambah",
    color: "var(--color-primary)",
  },
  {
    label: "Tambah Yayasan",
    description: "Daftarkan yayasan baru",
    icon: Building2,
    path: "/super-admin/yayasan/tambah",
    color: "var(--color-info)",
  },
  {
    label: "Pengumuman",
    description: "Buat notifikasi dan pengumuman",
    icon: Bell,
    path: "/super-admin/notifikasiPengumuman",
    color: "var(--color-warning)",
  },
  {
    label: "Kelola Paket",
    description: "Atur paket dan modul langganan",
    icon: Package,
    path: "/super-admin/paketModul",
    color: "var(--color-success)",
  },
  {
    label: "Manajemen Akses",
    description: "Atur hak akses pengguna",
    icon: Users,
    path: "/super-admin/manajemenAkses",
    color: "var(--color-primary)",
  },
  {
    label: "Pengaturan",
    description: "Konfigurasi sistem platform",
    icon: Settings,
    path: "/super-admin/pengaturanSistem",
    color: "var(--color-info)",
  },
];

const ACTIVITY_META = {
  create: {
    icon: UserPlus,
    color: "var(--color-success)",
  },
  update: {
    icon: Edit3,
    color: "var(--color-info)",
  },
  delete: {
    icon: Trash2,
    color: "var(--color-danger)",
  },
  other: {
    icon: CheckCircle2,
    color: "var(--color-primary)",
  },
};

const LABEL_STATUS_LANGGANAN = {
  active: "Aktif",
  aktif: "Aktif",
  trialing: "Trial",
  trial: "Trial",
  expired: "Kedaluwarsa",
  kedaluwarsa: "Kedaluwarsa",
  nonaktif: "Nonaktif",
  inactive: "Nonaktif",
  tanpa_status: "Tanpa status",
};

const TONE_BREAKDOWN = [
  "var(--color-primary)",
  "var(--color-info)",
  "var(--color-warning)",
  "var(--color-danger)",
];

const NAMA_BULAN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function formatPersen(nilai) {
  const angka = Number(nilai);
  if (!Number.isFinite(angka)) return null;
  return `${angka.toFixed(1).replace(".", ",")}%`;
}

function formatRingkasRupiah(nilai) {
  const angka = Number(nilai) || 0;

  if (angka >= 1_000_000_000) {
    return `Rp ${(angka / 1_000_000_000).toFixed(1).replace(".", ",")} M`;
  }

  if (angka >= 1_000_000) {
    return `Rp ${(angka / 1_000_000).toFixed(1).replace(".", ",")} Jt`;
  }

  return `Rp ${angka.toLocaleString("id-ID")}`;
}

function formatWaktuRelatif(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const selisihDetik = Math.floor((Date.now() - date.getTime()) / 1000);

  if (selisihDetik < 60) return "Baru saja";
  if (selisihDetik < 3600) return `${Math.floor(selisihDetik / 60)} menit lalu`;
  if (selisihDetik < 86400) return `${Math.floor(selisihDetik / 3600)} jam lalu`;
  if (selisihDetik < 86400 * 7) {
    return `${Math.floor(selisihDetik / 86400)} hari lalu`;
  }

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function hitungPertumbuhan(seri) {
  const terakhir = seri[seri.length - 1]?.value || 0;
  const sebelumnya = seri[seri.length - 2]?.value || 0;

  if (sebelumnya <= 0) {
    return { persen: null, arah: null, teks: "Belum tersedia" };
  }

  const persen = ((terakhir - sebelumnya) / sebelumnya) * 100;

  return {
    persen,
    arah: persen >= 0 ? "up" : "down",
    teks: `${formatPersen(Math.abs(persen))} dibanding bulan sebelumnya`,
  };
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const [pakets, setPakets] = useState([]);
  const [logs, setLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [animate, setAnimate] = useState(false);
  const [now, setNow] = useState(null);

  // Jam berjalan: sapaan & pesan ikut berganti per jam.
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
      setLoading(true);

      const [subRes, paketRes, logRes, notifRes] = await Promise.allSettled([
        getAllLangganan(),
        getPaket(),
        getAuditLogs({ limit: 10 }),
        getNotifikasi(),
      ]);

      if (subRes.status === "fulfilled") {
        const val = subRes.value;
        setSubscriptions(Array.isArray(val) ? val : []);
      }

      if (paketRes.status === "fulfilled") {
        setPakets(
          Array.isArray(paketRes.value?.data) ? paketRes.value.data : []
        );
      }

      if (logRes.status === "fulfilled") {
        setLogs(Array.isArray(logRes.value?.data) ? logRes.value.data : []);
      }

      if (notifRes.status === "fulfilled") {
        const val = notifRes.value;
        setNotifications(
          Array.isArray(val?.data) ? val.data : Array.isArray(val) ? val : []
        );
      }
    } catch {
      // Fallback: biarkan state kosong
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDashboard();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchDashboard]);

  useEffect(() => {
    if (loading) {
      setAnimate(false);
      return undefined;
    }
    const timer = setTimeout(() => setAnimate(true), 60);
    return () => clearTimeout(timer);
  }, [loading]);

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

  /* ---------------- Ringkasan langganan ---------------- */

  const totalSekolah = useMemo(() => {
    const unik = new Set(
      subscriptions.map((s) => s.sekolahId || s.sekolah?.id).filter(Boolean)
    ).size;
    return unik || subscriptions.length;
  }, [subscriptions]);

  const langgananRingkas = useMemo(() => {
    const hitung = new Map();

    subscriptions.forEach((item) => {
      const mentah = String(item?.statusLangganan ?? item?.status ?? "")
        .trim()
        .toLowerCase();

      const kunci = mentah || "tanpa_status";
      hitung.set(kunci, (hitung.get(kunci) || 0) + 1);
    });

    const urutan = [
      "active",
      "aktif",
      "trialing",
      "trial",
      "expired",
      "kedaluwarsa",
      "nonaktif",
    ];

    const kunciTerurut = [...hitung.keys()].sort((a, b) => {
      const posisiA = urutan.indexOf(a);
      const posisiB = urutan.indexOf(b);
      return (posisiA === -1 ? 99 : posisiA) - (posisiB === -1 ? 99 : posisiB);
    });

    return {
      total: subscriptions.length,
      aktif: (hitung.get("active") || 0) + (hitung.get("aktif") || 0),
      breakdown: kunciTerurut.map((kunci, index) => ({
        label: LABEL_STATUS_LANGGANAN[kunci] || kunci,
        value: hitung.get(kunci) || 0,
        color: TONE_BREAKDOWN[index % TONE_BREAKDOWN.length],
      })),
    };
  }, [subscriptions]);

  const persenAktif =
    langgananRingkas.total > 0
      ? Math.round((langgananRingkas.aktif / langgananRingkas.total) * 100)
      : null;

  /* ---------------- Deret bulanan (8 bulan terakhir) ---------------- */

  const monthlySeries = useMemo(() => {
    const sekarang = new Date();
    const buckets = [];

    for (let i = 7; i >= 0; i -= 1) {
      const tanggal = new Date(
        sekarang.getFullYear(),
        sekarang.getMonth() - i,
        1
      );

      buckets.push({
        key: `${tanggal.getFullYear()}-${tanggal.getMonth()}`,
        month: NAMA_BULAN[tanggal.getMonth()],
        nilaiLangganan: 0,
        sekolah: new Set(),
      });
    }

    const peta = new Map(buckets.map((b) => [b.key, b]));

    subscriptions.forEach((langganan) => {
      const idSekolah = langganan?.sekolahId || langganan?.sekolah?.id;
      const harga = Number(
        langganan?.hargaSaatBerlangganan ?? langganan?.paket?.harga ?? 0
      );

      const tanggalLangganan = langganan?.tanggalMulai || langganan?.dibuatPada;
      if (!tanggalLangganan) return;

      const d = new Date(tanggalLangganan);
      if (Number.isNaN(d.getTime())) return;

      const bucket = peta.get(`${d.getFullYear()}-${d.getMonth()}`);
      if (!bucket) return;

      bucket.nilaiLangganan += Number.isFinite(harga) ? harga : 0;
      if (idSekolah) bucket.sekolah.add(String(idSekolah));
    });

    return {
      pendapatan: buckets.map((b) => ({
        month: b.month,
        value: b.nilaiLangganan,
      })),
      pertumbuhan: buckets.map((b) => ({
        month: b.month,
        value: b.sekolah.size,
      })),
      pendapatanBulanIni: buckets[buckets.length - 1]?.nilaiLangganan || 0,
    };
  }, [subscriptions]);

  const maxRevenue = Math.max(
    1,
    ...monthlySeries.pendapatan.map((item) => item.value)
  );

  const maxSchool = Math.max(
    1,
    ...monthlySeries.pertumbuhan.map((item) => item.value)
  );

  const langgananBaruBulanIni =
    monthlySeries.pertumbuhan[monthlySeries.pertumbuhan.length - 1]?.value || 0;

  const pertumbuhanSekolah = hitungPertumbuhan(monthlySeries.pertumbuhan);
  const pertumbuhanPendapatan = hitungPertumbuhan(monthlySeries.pendapatan);

  /* ---------------- Aktivitas ---------------- */

  const recentActivities = useMemo(() => {
    return logs.slice(0, 6).map((log, index) => {
      const aksi = log.aksi || "Aktivitas Sistem";
      const isCreate = /buat|tambah|create/i.test(aksi);
      const isUpdate = /ubah|edit|update/i.test(aksi);
      const isDelete = /hapus|delete/i.test(aksi);

      return {
        id: log.id ?? `log-${index}`,
        user: log.pengguna?.namaLengkap || "Super Admin",
        action: aksi,
        target: log.modul || "Sistem",
        timestamp: log.waktu,
        type: isCreate ? "create" : isUpdate ? "update" : isDelete ? "delete" : "other",
      };
    });
  }, [logs]);

  const unreadCount = useMemo(
    () =>
      notifications.filter((notif) => !(notif.dibaca ?? notif.read ?? false))
        .length,
    [notifications]
  );

  return (
    <div className="theme-page theme-text min-h-full w-full min-w-0">
      <div className="w-full min-w-0 px-4 py-5 sm:px-6 lg:px-8 lg:py-7 2xl:px-10">
        <div className="space-y-6">
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
                  <span className={themePrimaryText}>Super Admin</span>
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 theme-text-secondary sm:text-base">
                  {greeting
                    ? HOURLY_MESSAGES[greeting.hour]
                    : "Ringkasan performa dan aktivitas platform SmartSchool."}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={fetchDashboard}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_22%,transparent)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    {loading ? "Memuat..." : "Refresh Data"}
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push("/super-admin/langgananSekolah")}
                    className="theme-card theme-border theme-text inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition hover:shadow-sm"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Lihat langganan
                  </button>
                </div>
              </div>

              <BannerArt />
            </div>
          </section>

          {/* ================= RINGKASAN ================= */}
          {loading && subscriptions.length === 0 && pakets.length === 0 ? (
            <KpiSkeleton />
          ) : (
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                label="Total Sekolah"
                value={String(totalSekolah)}
                description="Sekolah terdata"
                icon={School}
              />
              <KpiCard
                label="Paket Modul"
                value={String(pakets.length)}
                description="Paket tersedia"
                icon={Package}
              />
              <KpiCard
                label="Langganan Aktif"
                value={String(langgananRingkas.aktif)}
                description={`Dari ${langgananRingkas.total} langganan`}
                icon={ShieldCheck}
                progress={persenAktif ?? 0}
                animate={animate}
              />
              <KpiCard
                label="Aktivitas Sistem"
                value={String(logs.length)}
                description="Log terbaru tercatat"
                icon={Activity}
              />
            </section>
          )}

          {/* ================= KALENDER & AKSI CEPAT ================= */}
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card title="Kalender" subtitle="Bulan berjalan">
              <MiniCalendar now={now} />
            </Card>

            <div className="lg:col-span-2">
              <Card
                title="Aksi Cepat"
                subtitle="Akses fitur yang sering digunakan"
                bodyClassName="flex"
              >
                <div className="grid w-full flex-1 auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {quickActions.map((action) => (
                    <QuickActionCard
                      key={action.label}
                      action={action}
                      onClick={() => router.push(action.path)}
                    />
                  ))}
                </div>
              </Card>
            </div>
          </section>

          {/* ================= PERTUMBUHAN & LANGGANAN ================= */}
          <section className="space-y-4">
            <SectionHeader
              title="Analitik Langganan"
              subtitle="Pertumbuhan sekolah dan status langganan platform."
              action={
                <button
                  type="button"
                  onClick={() => router.push("/super-admin/langgananSekolah")}
                  className={`inline-flex items-center gap-1 text-sm font-semibold ${themePrimaryText} transition hover:opacity-75`}
                >
                  Lihat detail
                  <ChevronRight className="h-4 w-4" />
                </button>
              }
            />

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <Card
                  title="Pertumbuhan Sekolah"
                  subtitle="Sekolah berlangganan yang terdaftar per bulan (8 bulan terakhir)"
                >
                  <BarChart
                    items={monthlySeries.pertumbuhan}
                    max={maxSchool}
                    animate={animate}
                    color="var(--color-primary)"
                    formatTooltip={(value) => `${value} sekolah`}
                    legend="Jumlah sekolah"
                    trend={pertumbuhanSekolah}
                  />
                </Card>
              </div>

              <Card title="Status Langganan" subtitle="Ringkasan subscription">
                <div className="flex h-full flex-col">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider theme-text-muted">
                        Total langganan
                      </p>
                      <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight theme-text">
                        {langgananRingkas.total}
                      </p>
                    </div>

                    <span
                      className={`flex items-center gap-1 text-xs font-medium ${
                        langgananBaruBulanIni > 0
                          ? "text-[var(--color-success)]"
                          : "theme-text-muted"
                      }`}
                    >
                      {langgananBaruBulanIni > 0 && (
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      )}
                      {langgananBaruBulanIni} bulan ini
                    </span>
                  </div>

                  <ThinBar
                    percent={persenAktif ?? 0}
                    animate={animate}
                    className="mt-4"
                  />
                  <p className="mt-2 text-xs theme-text-muted">
                    {persenAktif === null
                      ? "Belum tersedia"
                      : `${persenAktif}% sekolah memiliki langganan aktif`}
                  </p>

                  <div className={`mt-5 divide-y ${themeDivider}`}>
                    {langgananRingkas.breakdown.length === 0 ? (
                      <p className="py-3 text-xs theme-text-secondary">
                        Belum ada data langganan.
                      </p>
                    ) : (
                      langgananRingkas.breakdown.map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between py-3"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-xs theme-text-secondary">
                              {item.label}
                            </span>
                          </div>

                          <span className="text-sm font-semibold tabular-nums theme-text">
                            {item.value}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push("/super-admin/langgananSekolah")}
                    className={`mt-auto flex w-full items-center justify-center gap-1 rounded-xl border ${themeDivider} ${themeNeutralSurface} py-2.5 text-xs font-semibold theme-text-secondary transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]`}
                  >
                    Kelola Langganan
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </Card>
            </div>
          </section>

          {/* ================= PENDAPATAN & NOTIFIKASI ================= */}
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <Card
                title="Pendapatan Langganan"
                subtitle="Total nilai langganan tercatat per bulan"
                headerRight={
                  <div className="text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-wider theme-text-muted">
                      Bulan ini
                    </p>
                    <p className="mt-0.5 text-lg font-bold tabular-nums theme-text">
                      {formatRingkasRupiah(monthlySeries.pendapatanBulanIni)}
                    </p>
                  </div>
                }
              >
                <BarChart
                  items={monthlySeries.pendapatan}
                  max={maxRevenue}
                  animate={animate}
                  color="var(--color-success)"
                  formatTooltip={formatRingkasRupiah}
                  legend="Pendapatan"
                  trend={pertumbuhanPendapatan}
                  height={190}
                />
              </Card>
            </div>

            <Card
              title="Notifikasi"
              subtitle={
                unreadCount > 0
                  ? `${unreadCount} belum dibaca`
                  : "Informasi terbaru"
              }
              headerRight={
                <button
                  type="button"
                  onClick={() => router.push("/super-admin/notifikasiPengumuman")}
                  className={`text-xs font-semibold ${themePrimaryText} transition hover:opacity-75`}
                >
                  Lihat Semua
                </button>
              }
            >
              {notifications.length === 0 ? (
                <EmptyState
                  icon={Bell}
                  message="Tidak ada notifikasi baru."
                />
              ) : (
                <div className="space-y-1.5">
                  {notifications.slice(0, 5).map((notif, index) => {
                    const isRead = notif.dibaca ?? notif.read ?? false;
                    const title = notif.judul || notif.title || "Notifikasi";
                    const desc = notif.pesan || notif.desc || "";
                    const time = notif.dibuatPada
                      ? formatWaktuRelatif(notif.dibuatPada)
                      : notif.time || "";

                    return (
                      <div
                        key={notif.id ?? `notif-${index}`}
                        className={`flex items-start gap-3 rounded-xl p-2.5 transition ${themeNeutralHover} ${
                          !isRead ? themePrimarySoft : ""
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            isRead
                              ? `${themeNeutralSurface} theme-text-muted`
                              : `${themePrimarySoft} ${themePrimaryText}`
                          }`}
                        >
                          <Bell className="h-3.5 w-3.5" />
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p
                              className={`truncate text-xs ${
                                isRead
                                  ? "font-medium theme-text-secondary"
                                  : "font-semibold theme-text"
                              }`}
                            >
                              {title}
                            </p>
                            {!isRead && (
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" />
                            )}
                          </div>

                          {desc && (
                            <p className="mt-0.5 truncate text-[11px] theme-text-muted">
                              {desc}
                            </p>
                          )}

                          {time && (
                            <p className="mt-1 text-[10px] theme-text-muted">
                              {time}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </section>

          {/* ================= AKTIVITAS TERBARU ================= */}
          <section>
            <Card
              title="Aktivitas Terbaru"
              subtitle="Log aktivitas terakhir di platform"
              headerRight={
                <button
                  type="button"
                  onClick={() => router.push("/super-admin/logAktivitas")}
                  className={`inline-flex items-center gap-1 text-xs font-semibold ${themePrimaryText} transition hover:opacity-75`}
                >
                  Lihat Semua
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              }
            >
              {recentActivities.length === 0 ? (
                <EmptyState
                  icon={Activity}
                  message="Belum ada aktivitas tercatat."
                />
              ) : (
                <div className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
                  {recentActivities.map((activity) => {
                    const meta = ACTIVITY_META[activity.type];
                    const Icon = meta.icon;

                    return (
                      <div
                        key={activity.id}
                        className={`flex items-start gap-3 border-b ${themeDivider} py-3.5 last:border-b-0 md:[&:nth-last-child(2):nth-child(odd)]:border-b-0`}
                      >
                        <span
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                          style={{
                            backgroundColor: `color-mix(in srgb, ${meta.color} 13%, transparent)`,
                            color: meta.color,
                          }}
                        >
                          <Icon className="h-4 w-4" />
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs leading-5 theme-text-secondary">
                            <span className="font-semibold theme-text">
                              {activity.user}
                            </span>{" "}
                            {activity.action}
                          </p>

                          <p className="mt-0.5 truncate text-xs font-medium theme-text">
                            {activity.target}
                          </p>

                          {activity.timestamp && (
                            <p className="mt-1 text-[10px] theme-text-muted">
                              {formatWaktuRelatif(activity.timestamp)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </section>

          {/* ================= FOOTER ================= */}
          <footer className={`border-t ${themeDivider} pt-6`}>
            <div className="flex flex-col items-center justify-between gap-3 text-center text-xs theme-text-muted sm:flex-row sm:text-left">
              <p>
                © {new Date().getFullYear()} SmartSchool · Super Admin Dashboard
              </p>

              <p className="flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                School Management System
              </p>
            </div>
          </footer>
        </div>
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

function Card({ title, subtitle, children, bodyClassName = "", headerRight }) {
  return (
    <div
      className={`theme-card theme-border flex h-full min-w-0 flex-col rounded-2xl border p-5 sm:p-6 ${themeCardShadow}`}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold theme-text">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 text-xs theme-text-secondary">{subtitle}</p>
          )}
        </div>
        {headerRight}
      </div>

      <div className={`min-h-0 flex-1 ${bodyClassName}`}>{children}</div>
    </div>
  );
}

function EmptyState({ icon: Icon, message }) {
  return (
    <div className="flex h-full min-h-[140px] flex-col items-center justify-center gap-3 text-center">
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${themeNeutralSurface} theme-text-muted`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <p className="text-xs theme-text-muted">{message}</p>
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
          backgroundColor: "var(--color-primary)",
        }}
      />
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
            <div className="h-12 w-12 rounded-xl" style={{ background: TRACK }} />
            <div className="flex-1">
              <div className="h-3 w-24 rounded" style={{ background: TRACK }} />
              <div
                className="mt-2 h-6 w-16 rounded"
                style={{ background: TRACK }}
              />
            </div>
          </div>
          <div className="mt-4 h-3 w-32 rounded" style={{ background: TRACK }} />
        </div>
      ))}
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
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-[color-mix(in_srgb,var(--qa)_10%,transparent)] transition duration-300 group-hover:scale-125"
      />

      <div className="relative flex items-start justify-between">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--qa)_14%,transparent)] text-[var(--qa)] transition duration-200 group-hover:bg-[var(--qa)] group-hover:text-white group-hover:shadow-[0_6px_14px_color-mix(in_srgb,var(--qa)_35%,transparent)]">
          <Icon className="h-5 w-5" />
        </span>

        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] bg-[var(--color-card)] theme-text-muted transition duration-200 group-hover:border-transparent group-hover:bg-[var(--qa)] group-hover:text-white">
          <ArrowUpRight className="h-4 w-4 transition duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>

      <div className="relative mt-5 min-w-0">
        <span className="block text-base font-semibold theme-text">
          {action.label}
        </span>
        <span className="mt-1 block text-xs leading-5 theme-text-secondary">
          {action.description}
        </span>
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Diagram: Bar vertikal sederhana per bulan                           */
/* ------------------------------------------------------------------ */

function BarChart({
  items = [],
  max = 1,
  animate = true,
  color = "var(--color-primary)",
  formatTooltip = (value) => String(value),
  legend,
  trend,
  height = 210,
}) {
  return (
    <div>
      <div className="relative" style={{ height }}>
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className={`border-t border-dashed ${themeDivider}`}
            />
          ))}
        </div>

        <div className="relative flex h-full items-end gap-2 sm:gap-4">
          {items.map((item, index) => {
            const pct = max > 0 ? (item.value / max) * 100 : 0;
            const isLast = index === items.length - 1;

            return (
              <div
                key={`${item.month}-${index}`}
                className="group flex h-full min-w-0 flex-1 items-end justify-center"
              >
                <div className="relative flex h-full w-full max-w-[44px] items-end justify-center">
                  <div
                    className="w-full rounded-t-md transition-all duration-700 ease-out"
                    style={{
                      height: animate ? `${Math.max(pct, 2.5)}%` : "0%",
                      backgroundColor: isLast
                        ? color
                        : `color-mix(in srgb, ${color} 28%, transparent)`,
                    }}
                  />

                  <div
                    className={`pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border ${themeDivider} theme-card px-2 py-1 text-[10px] font-medium tabular-nums theme-text opacity-0 shadow-sm transition group-hover:opacity-100`}
                  >
                    {formatTooltip(item.value)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-2 flex gap-2 sm:gap-4">
        {items.map((item, index) => (
          <span
            key={`${item.month}-label-${index}`}
            className={`min-w-0 flex-1 text-center text-[10px] font-medium sm:text-xs ${
              index === items.length - 1
                ? "font-semibold"
                : "theme-text-muted"
            }`}
            style={
              index === items.length - 1 ? { color } : undefined
            }
          >
            {item.month}
          </span>
        ))}
      </div>

      <div
        className={`mt-4 flex flex-wrap items-center justify-between gap-2 border-t ${themeDivider} pt-3`}
      >
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-[11px] theme-text-muted">{legend}</span>
        </div>

        {trend && (
          <div
            className={`flex items-center gap-1 text-[11px] font-medium ${
              trend.persen === null
                ? "theme-text-muted"
                : trend.persen >= 0
                  ? "text-[var(--color-success)]"
                  : "text-[var(--color-danger)]"
            }`}
          >
            {trend.persen === null ? (
              "Belum tersedia"
            ) : (
              <>
                {trend.arah === "up" ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {trend.teks}
              </>
            )}
          </div>
        )}
      </div>
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