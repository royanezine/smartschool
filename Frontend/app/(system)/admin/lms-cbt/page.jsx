"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  ArrowUpRight,
  BookOpen,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  FileText,
  GraduationCap,
  MonitorPlay,
  RefreshCw,
  Server,
  Settings2,
  Sparkles,
  Target,
  Users,
  Wifi,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

import { getMateriPembelajaran } from "@/services/materiPembelajaran.service";
import { getAllTugasAdmin } from "@/services/tugas.service";
import { getAllUjianAdmin } from "@/services/ujian.service";
import { getKelasMapel } from "@/services/kelasMapel.service";
import { getUsers } from "@/services/user.service";

const LMS_MENU = [
  {
    title: "Modul LMS & Class",
    description: "Kelola relasi kelas, mata pelajaran kurikulum, dan guru pengampu.",
    href: "/admin/lms-cbt/modul-class",
    icon: GraduationCap,
    tone: "primary",
  },
  {
    title: "Materi dan Modul Ajar",
    description: "Kelola modul ajar, dokumen PDF, link materi, dan bahan pembelajaran.",
    href: "/admin/lms-cbt/materi-modul-ajar",
    icon: BookOpen,
    tone: "info",
  },
  {
    title: "Tugas Siswa",
    description: "Pantau penugasan harian, pengumpulan berkas jawaban, dan penilaian.",
    href: "/admin/lms-cbt/tugas-siswa",
    icon: ClipboardCheck,
    tone: "secondary",
  },
  {
    title: "Ujian CBT Online",
    description: "Kelola asesmen ujian CBT, bank soal pilihan ganda, dan jadwal ujian.",
    href: "/admin/lms-cbt/ujian",
    icon: MonitorPlay,
    tone: "success",
  },
];

const toneMap = {
  primary: {
    iconBg: "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]",
    iconText: "text-[var(--color-primary)]",
    soft: "bg-[color-mix(in_srgb,var(--color-primary)_6%,transparent)]",
    border: "border-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]",
  },
  secondary: {
    iconBg: "bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]",
    iconText: "theme-text-secondary",
    soft: "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]",
    border: "theme-border-soft",
  },
  info: {
    iconBg: "bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)]",
    iconText: "text-[var(--color-info)]",
    soft: "bg-[color-mix(in_srgb,var(--color-info)_6%,transparent)]",
    border: "border-[color-mix(in_srgb,var(--color-info)_18%,transparent)]",
  },
  success: {
    iconBg: "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]",
    iconText: "text-[var(--color-success)]",
    soft: "bg-[color-mix(in_srgb,var(--color-success)_6%,transparent)]",
    border: "border-[color-mix(in_srgb,var(--color-success)_18%,transparent)]",
  },
  warning: {
    iconBg: "bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)]",
    iconText: "text-[var(--color-warning)]",
    soft: "bg-[color-mix(in_srgb,var(--color-warning)_6%,transparent)]",
    border: "border-[color-mix(in_srgb,var(--color-warning)_18%,transparent)]",
  },
  danger: {
    iconBg: "bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)]",
    iconText: "theme-danger",
    soft: "bg-[color-mix(in_srgb,var(--color-danger)_6%,transparent)]",
    border: "border-[color-mix(in_srgb,var(--color-danger)_18%,transparent)]",
  },
};

function formatTanggal(isoString) {
  if (!isoString) return "-";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return "-";
  }
}

function formatWaktu(isoString) {
  if (!isoString) return "-";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return "-";
  }
}

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  tone = "primary",
  href,
  loading = false,
  error = null,
}) {
  const theme = toneMap[tone] || toneMap.primary;

  const content = (
    <div
      className="
        group relative overflow-hidden rounded-2xl
        theme-card theme-border
        p-5
        shadow-[0_6px_24px_color-mix(in_srgb,var(--color-text)_6%,transparent)]
        transition-all duration-300
        hover:-translate-y-0.5
        hover:border-[color-mix(in_srgb,var(--color-primary)_30%,var(--color-border))]
        hover:shadow-[0_14px_40px_color-mix(in_srgb,var(--color-primary)_10%,transparent)]
      "
    >
      <div
        className="
          absolute right-0 top-0 h-24 w-24
          translate-x-8 -translate-y-8 rounded-full
          bg-[color-mix(in_srgb,var(--color-primary)_5%,transparent)]
          transition-transform duration-500
          group-hover:scale-150
        "
      />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="theme-text-secondary text-sm font-medium">
            {label}
          </p>

          <div className="mt-2 flex items-end gap-2">
            {loading ? (
              <Loader2 size={24} className="animate-spin theme-text-muted" />
            ) : error ? (
              <span className="text-xs font-semibold text-red-500">
                Gagal memuat
              </span>
            ) : (
              <p className="theme-text text-3xl font-bold tracking-tight">
                {value}
              </p>
            )}
          </div>

          <p className="theme-text-muted mt-1.5 text-xs">
            {error ? error : description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${theme.iconBg} ${theme.iconText}`}
        >
          <Icon size={21} strokeWidth={1.9} />
        </div>
      </div>

      {href && !loading && !error && (
        <div className="relative mt-4 flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)]">
          Lihat detail
          <ArrowUpRight
            size={14}
            className="
              transition-transform
              group-hover:-translate-y-0.5
              group-hover:translate-x-0.5
            "
          />
        </div>
      )}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  action,
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
            {eyebrow}
          </p>
        )}

        <h2 className="theme-text text-lg font-bold tracking-tight">
          {title}
        </h2>

        {description && (
          <p className="theme-text-secondary mt-1 text-sm">
            {description}
          </p>
        )}
      </div>

      {href && (
        <Link
          href={href}
          className="
            inline-flex items-center gap-1
            text-sm font-semibold
            text-[var(--color-primary)]
            transition
            hover:opacity-80
          "
        >
          {action || "Lihat semua"}
          <ChevronRight size={16} />
        </Link>
      )}
    </div>
  );
}

export default function LMSCBTDashboardPage() {
  const [activeQuickAction, setActiveQuickAction] = useState(null);

  const [materiList, setMateriList] = useState([]);
  const [tugasList, setTugasList] = useState([]);
  const [ujianList, setUjianList] = useState([]);
  const [kelasMapelList, setKelasMapelList] = useState([]);
  const [totalSiswaCount, setTotalSiswaCount] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState({});

  const loadDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    const newErrors = {};

    const fetchMateri = async () => {
      try {
        const res = await getMateriPembelajaran();
        const data = res?.data ?? res;
        setMateriList(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Gagal memuat materi:", err);
        newErrors.materi = err?.message || "Gagal memuat data materi";
        setMateriList([]);
      }
    };

    const fetchTugas = async () => {
      try {
        const data = await getAllTugasAdmin();
        setTugasList(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Gagal memuat tugas:", err);
        newErrors.tugas = err?.message || "Gagal memuat data tugas";
        setTugasList([]);
      }
    };

    const fetchUjian = async () => {
      try {
        const data = await getAllUjianAdmin();
        setUjianList(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Gagal memuat ujian:", err);
        newErrors.ujian = err?.message || "Gagal memuat data ujian CBT";
        setUjianList([]);
      }
    };

    const fetchKelasMapel = async () => {
      try {
        const data = await getKelasMapel();
        setKelasMapelList(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Gagal memuat kelas-mapel:", err);
        newErrors.kelasMapel = err?.message || "Gagal memuat kelas-mapel";
        setKelasMapelList([]);
      }
    };

    const fetchSiswa = async () => {
      try {
        const res = await getUsers({ page: 1, limit: 1, role: "siswa" });
        const total = res?.pagination?.totalData;
        if (typeof total === "number") {
          setTotalSiswaCount(total);
        } else if (Array.isArray(res?.data)) {
          setTotalSiswaCount(res.data.length);
        } else {
          setTotalSiswaCount(0);
        }
      } catch (err) {
        console.error("Gagal memuat total siswa:", err);
        newErrors.siswa = err?.message || "Gagal memuat total siswa";
        setTotalSiswaCount(null);
      }
    };

    await Promise.allSettled([
      fetchMateri(),
      fetchTugas(),
      fetchUjian(),
      fetchKelasMapel(),
      fetchSiswa(),
    ]);

    setErrors(newErrors);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDashboardData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadDashboardData]);

  const totalMateri = materiList.length;
  const totalTugas = tugasList.length;
  const totalUjian = ujianList.length;
  const totalKelasMapel = kelasMapelList.length;

  const totalPengumpulanTugas = useMemo(() => {
    return tugasList.reduce((acc, t) => {
      const count = Number(t.jumlahPengumpulan ?? t._count?.pengumpulanTugasSiswa ?? 0);
      return acc + (isNaN(count) ? 0 : count);
    }, 0);
  }, [tugasList]);

  const totalPercobaanUjian = useMemo(() => {
    return ujianList.reduce((acc, u) => {
      const count = Number(u.peserta ?? u._count?.percobaanAsesmen ?? 0);
      return acc + (isNaN(count) ? 0 : count);
    }, 0);
  }, [ujianList]);

  const recentMaterials = useMemo(() => {
    return [...materiList]
      .sort((a, b) => new Date(b.dibuatPada || 0) - new Date(a.dibuatPada || 0))
      .slice(0, 5);
  }, [materiList]);

  const recentTasks = useMemo(() => {
    return [...tugasList]
      .sort((a, b) => new Date(b.batasWaktu || b.dibuatPada || 0) - new Date(a.batasWaktu || a.dibuatPada || 0))
      .slice(0, 4);
  }, [tugasList]);

  const recentExams = useMemo(() => {
    return [...ujianList]
      .sort((a, b) => new Date(b.waktuMulai || 0) - new Date(a.waktuMulai || 0))
      .slice(0, 4);
  }, [ujianList]);

  const recentActivities = useMemo(() => {
    const items = [];

    materiList.forEach((m) => {
      if (m.dibuatPada) {
        items.push({
          type: "materi",
          title: "Materi pembelajaran diterbitkan",
          detail: `${m.judul || "Materi"} · ${m.kelasMapel?.mataPelajaran?.nama || "Mapel"} (${m.kelasMapel?.kelas?.nama || "Kelas"})`,
          date: new Date(m.dibuatPada),
          icon: BookOpen,
          tone: "primary",
          href: "/admin/lms-cbt/materi-modul-ajar",
        });
      }
    });

    tugasList.forEach((t) => {
      if (t.dibuatPada) {
        items.push({
          type: "tugas",
          title: "Tugas siswa diberikan",
          detail: `${t.judul || "Tugas"} · ${t.mapelNama || "Mapel"} (${t.kelasNama || "Kelas"})`,
          date: new Date(t.dibuatPada),
          icon: ClipboardCheck,
          tone: "secondary",
          href: `/admin/lms-cbt/tugas-siswa/${t.id}`,
        });
      }
    });

    ujianList.forEach((u) => {
      if (u.dibuatPada) {
        items.push({
          type: "ujian",
          title: "Ujian CBT dikonfigurasikan",
          detail: `${u.judul || "Ujian"} · ${u.mapel || "Mapel"} (${u.kelasNama || "Kelas"})`,
          date: new Date(u.dibuatPada),
          icon: MonitorPlay,
          tone: "info",
          href: `/admin/lms-cbt/ujian/${u.id}`,
        });
      }
    });

    return items
      .sort((a, b) => b.date - a.date)
      .slice(0, 5);
  }, [materiList, tugasList, ujianList]);

  return (
    <div className="theme-page min-h-screen flex">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            <section
              className="
                relative mb-6 overflow-hidden rounded-[28px]
                bg-[var(--color-primary)]
                shadow-[0_20px_55px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]
              "
            >
              <div
                className="
                  absolute -right-24 -top-28 h-80 w-80
                  translate-x-0 rounded-full
                  bg-white/10 blur-3xl
                "
              />

              <div
                className="
                  absolute -bottom-40 left-1/3 h-96 w-96
                  rounded-full bg-white/5 blur-3xl
                "
              />

              <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
                  backgroundSize: "34px 34px",
                }}
              />

              <div className="relative grid gap-7 px-6 py-7 sm:px-8 sm:py-8 lg:grid-cols-[1fr_390px] lg:px-10 lg:py-9">
                <div className="flex flex-col justify-center">
                  <div
                    className="
                      mb-4 inline-flex w-fit items-center gap-2
                      rounded-full border border-white/10
                      bg-white/10 px-3 py-1.5
                      text-xs font-semibold text-white
                      backdrop-blur-md
                    "
                  >
                    <Sparkles size={13} />
                    Pusat Pembelajaran Digital Terintegrasi
                  </div>

                  <h1 className="max-w-2xl text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-[38px] lg:leading-tight">
                    Dashboard LMS & CBT Sekolah
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75 sm:text-[15px]">
                    Pantau metrik riil pembelajaran digital, relasi kelas-mapel, modul ajar guru,
                    pengumpulan tugas siswa, dan pelaksanaan ujian CBT secara akurat.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href="/admin/lms-cbt/materi-modul-ajar"
                      className="
                        inline-flex items-center gap-2
                        rounded-xl bg-white px-4 py-2.5
                        text-sm font-semibold
                        text-[var(--color-primary)]
                        shadow-lg shadow-black/10
                        transition
                        hover:-translate-y-0.5
                        hover:bg-white/90
                      "
                    >
                      <BookOpen size={17} />
                      Materi & Modul Ajar
                    </Link>

                    <Link
                      href="/admin/lms-cbt/ujian"
                      className="
                        inline-flex items-center gap-2
                        rounded-xl border border-white/15
                        bg-white/10 px-4 py-2.5
                        text-sm font-semibold text-white
                        backdrop-blur-md transition
                        hover:bg-white/15
                      "
                    >
                      <MonitorPlay size={17} />
                      Kelola CBT
                    </Link>

                    <button
                      type="button"
                      onClick={() => loadDashboardData(true)}
                      disabled={refreshing || loading}
                      className="
                        inline-flex items-center gap-2
                        rounded-xl border border-white/15
                        bg-white/10 px-4 py-2.5
                        text-sm font-semibold text-white
                        backdrop-blur-md transition
                        hover:bg-white/15
                        disabled:opacity-50
                      "
                      title="Segarkan data dashboard"
                    >
                      <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                      <span>{refreshing ? "Menyegarkan..." : "Refresh Data"}</span>
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-md flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-white/60">
                        Status Integrasi Data
                      </p>
                      <p className="mt-1 text-lg font-bold text-white">
                        {loading
                          ? "Menghubungkan API..."
                          : Object.keys(errors).length > 0
                          ? "Sebagian API Gagal"
                          : "API Backend Aktif"}
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                      <GraduationCap size={20} />
                    </div>
                  </div>

                  <div className="mt-5 space-y-2.5">
                    <div className="flex items-center justify-between rounded-xl bg-white/[0.06] px-3.5 py-2.5 text-xs text-white">
                      <span>Kelas-Mapel Terhubung</span>
                      <strong className="font-bold">{loading ? "..." : totalKelasMapel}</strong>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-white/[0.06] px-3.5 py-2.5 text-xs text-white">
                      <span>Total Berkas Terkumpul</span>
                      <strong className="font-bold">{loading ? "..." : totalPengumpulanTugas}</strong>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-white/[0.06] px-3.5 py-2.5 text-xs text-white">
                      <span>Total Percobaan Ujian</span>
                      <strong className="font-bold">{loading ? "..." : totalPercobaanUjian}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-7">
              <SectionHeader
                eyebrow="LMS & CBT"
                title="Modul Utama"
                description="Akses cepat untuk pengelolaan seluruh komponen pembelajaran digital sekolah."
              />

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {LMS_MENU.map((item) => {
                  const Icon = item.icon;
                  const theme = toneMap[item.tone] || toneMap.primary;

                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="
                        group relative overflow-hidden
                        rounded-2xl theme-card theme-border
                        p-5
                        shadow-[0_6px_24px_color-mix(in_srgb,var(--color-text)_6%,transparent)]
                        transition-all duration-300
                        hover:-translate-y-1
                        hover:border-[color-mix(in_srgb,var(--color-primary)_30%,var(--color-border))]
                        hover:shadow-[0_18px_45px_color-mix(in_srgb,var(--color-primary)_10%,transparent)]
                      "
                    >
                      <div
                        className="
                          absolute right-0 top-0 h-24 w-24
                          translate-x-10 -translate-y-10
                          rounded-full
                          bg-[color-mix(in_srgb,var(--color-primary)_6%,transparent)]
                          transition-transform duration-500
                          group-hover:scale-150
                        "
                      />

                      <div className="relative">
                        <div className="flex items-start justify-between">
                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-xl ${theme.iconBg} ${theme.iconText}`}
                          >
                            <Icon size={21} strokeWidth={1.8} />
                          </div>

                          <ArrowUpRight
                            size={17}
                            className="
                              theme-text-muted
                              transition-all
                              group-hover:-translate-y-0.5
                              group-hover:translate-x-0.5
                              group-hover:text-[var(--color-primary)]
                            "
                          />
                        </div>

                        <h3 className="theme-text mt-5 text-[15px] font-bold">
                          {item.title}
                        </h3>

                        <p className="theme-text-secondary mt-1.5 min-h-[40px] text-xs leading-5">
                          {item.description}
                        </p>

                        <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)]">
                          Buka modul
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            <section className="mb-7">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Materi & Modul Ajar"
                  value={totalMateri}
                  description="Total berkas materi diterbitkan"
                  icon={BookOpen}
                  tone="primary"
                  href="/admin/lms-cbt/materi-modul-ajar"
                  loading={loading}
                  error={errors.materi}
                />

                <StatCard
                  label="Total Tugas Siswa"
                  value={totalTugas}
                  description={`${totalPengumpulanTugas} berkas jawaban terkumpul`}
                  icon={ClipboardCheck}
                  tone="secondary"
                  href="/admin/lms-cbt/tugas-siswa"
                  loading={loading}
                  error={errors.tugas}
                />

                <StatCard
                  label="Ujian CBT Online"
                  value={totalUjian}
                  description={`${totalPercobaanUjian} total sesi percobaan`}
                  icon={MonitorPlay}
                  tone="info"
                  href="/admin/lms-cbt/ujian"
                  loading={loading}
                  error={errors.ujian}
                />

                <StatCard
                  label="Peserta Didik Terdaftar"
                  value={totalSiswaCount !== null ? totalSiswaCount : "-"}
                  description="Jumlah siswa unik di sekolah"
                  icon={Users}
                  tone="success"
                  href="/admin/siswa"
                  loading={loading}
                  error={errors.siswa}
                />
              </div>
            </section>

            <section className="mb-7">
              <div className="theme-card theme-border rounded-2xl p-5 shadow-[0_6px_24px_color-mix(in_srgb,var(--color-text)_6%,transparent)] sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                      Aktivitas Pembelajaran Riil
                    </p>

                    <h2 className="theme-text mt-1 text-lg font-bold">
                      Ringkasan Keterlibatan Siswa & Guru
                    </h2>

                    <p className="theme-text-secondary mt-1 text-sm">
                      Perhitungan riil dari seluruh basis data kelas, materi, tugas, dan asesmen.
                    </p>
                  </div>

                  <div className="theme-primary rounded-xl px-3 py-2 text-xs font-semibold">
                    Akademik Aktif
                  </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="theme-card-soft rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="theme-text-secondary text-xs font-medium">
                        Total Materi Guru
                      </span>
                      <BookOpen size={16} className="text-[var(--color-primary)]" />
                    </div>
                    <p className="theme-text mt-3 text-2xl font-bold">
                      {loading ? "..." : totalMateri}
                    </p>
                    <p className="theme-text-muted mt-1 text-xs">
                      Dokumen modul ajar & materi
                    </p>
                  </div>

                  <div className="theme-card-soft rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="theme-text-secondary text-xs font-medium">
                        Pengumpulan Tugas
                      </span>
                      <BookOpenCheck size={16} className="text-emerald-600" />
                    </div>
                    <p className="theme-text mt-3 text-2xl font-bold">
                      {loading ? "..." : totalPengumpulanTugas}
                    </p>
                    <p className="theme-text-muted mt-1 text-xs">
                      Berkas dari {totalTugas} penugasan
                    </p>
                  </div>

                  <div className="theme-card-soft rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="theme-text-secondary text-xs font-medium">
                        Percobaan Ujian CBT
                      </span>
                      <Target size={16} className="text-[var(--color-info)]" />
                    </div>
                    <p className="theme-text mt-3 text-2xl font-bold">
                      {loading ? "..." : totalPercobaanUjian}
                    </p>
                    <p className="theme-text-muted mt-1 text-xs">
                      Sesi ujian dari {totalUjian} asesmen
                    </p>
                  </div>
                </div>

                <div className="theme-border-soft mt-6 rounded-xl border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="theme-text text-sm font-semibold">
                        Cakupan Penugasan Kelas LMS
                      </p>
                      <p className="theme-text-muted mt-1 text-xs">
                        Relasi mata pelajaran dan guru pengampu yang aktif di kelas pembelajaran.
                      </p>
                    </div>

                    <span className="text-sm font-bold text-[var(--color-primary)]">
                      {totalKelasMapel} Penugasan
                    </span>
                  </div>

                  <div className="theme-text-muted mt-3 flex items-center justify-between text-[11px] pt-2 border-t theme-border-soft">
                    <span>Terhubung dengan {totalTugas} tugas siswa</span>
                    <span>{totalUjian} bank asesmen CBT</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-7 grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
              <div className="theme-card theme-border overflow-hidden rounded-2xl border shadow-[0_6px_24px_color-mix(in_srgb,var(--color-text)_6%,transparent)]">
                <div className="theme-border-soft flex items-center justify-between border-b px-5 py-4 sm:px-6">
                  <div>
                    <p className="theme-text text-sm font-bold">
                      Materi Pembelajaran Terbaru
                    </p>
                    <p className="theme-text-secondary mt-1 text-xs">
                      Dokumen dan link ajar yang baru ditambahkan guru.
                    </p>
                  </div>

                  <Link
                    href="/admin/lms-cbt/materi-modul-ajar"
                    className="text-xs font-semibold text-[var(--color-primary)]"
                  >
                    Semua materi
                  </Link>
                </div>

                <div className="divide-y theme-border-soft">
                  {loading ? (
                    <div className="p-8 text-center text-xs theme-text-muted">
                      <Loader2 size={20} className="animate-spin mx-auto mb-2 text-[var(--color-primary)]" />
                      Memuat materi terbaru...
                    </div>
                  ) : recentMaterials.length > 0 ? (
                    recentMaterials.map((item) => {
                      const isPdf = item.tipe === "pdf" || item.tipe?.toLowerCase() === "pdf";
                      const mapelNama = item.kelasMapel?.mataPelajaran?.nama || "Mata Pelajaran";
                      const guruNama = item.kelasMapel?.guruPengajar?.namaLengkap || "-";
                      const kelasNama = item.kelasMapel?.kelas?.nama || "";

                      return (
                        <div
                          key={item.id}
                          className="
                            group flex items-center gap-4
                            px-5 py-4 transition
                            hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)]
                            sm:px-6
                          "
                        >
                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                              isPdf
                                ? "bg-red-500/10 text-red-500"
                                : "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]"
                            }`}
                          >
                            <FileText size={19} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="theme-text truncate text-sm font-semibold">
                              {item.judul || "Materi Pembelajaran"}
                            </p>

                            <div className="theme-text-secondary mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                              <span>{mapelNama}</span>
                              {kelasNama && (
                                <>
                                  <span className="theme-text-muted">•</span>
                                  <span>{kelasNama}</span>
                                </>
                              )}
                              <span className="theme-text-muted">•</span>
                              <span>{guruNama}</span>
                            </div>
                          </div>

                          <div className="hidden text-right sm:block">
                            <p className="theme-text-muted text-[11px] font-medium uppercase">
                              {item.tipe || "Dokumen"}
                            </p>
                            <p className="theme-text-muted mt-1 text-[11px]">
                              {formatTanggal(item.dibuatPada)}
                            </p>
                          </div>

                          <Link
                            href="/admin/lms-cbt/materi-modul-ajar"
                            className="p-1.5 rounded-lg theme-text-muted hover:theme-text"
                            title="Buka daftar materi"
                          >
                            <ChevronRight size={16} />
                          </Link>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-xs theme-text-muted">
                      Belum ada materi pembelajaran yang diterbitkan.
                    </div>
                  )}
                </div>
              </div>

              <div className="theme-card theme-border overflow-hidden rounded-2xl border shadow-[0_6px_24px_color-mix(in_srgb,var(--color-text)_6%,transparent)]">
                <div className="theme-border-soft flex items-center justify-between border-b px-5 py-4 sm:px-6">
                  <div>
                    <p className="theme-text text-sm font-bold">
                      Tugas Siswa
                    </p>
                    <p className="theme-text-secondary mt-1 text-xs">
                      Tugas yang perlu dipantau pengumpulannya.
                    </p>
                  </div>

                  <Link
                    href="/admin/lms-cbt/tugas-siswa"
                    className="text-xs font-semibold text-[var(--color-primary)]"
                  >
                    Semua tugas
                  </Link>
                </div>

                <div className="divide-y theme-border-soft">
                  {loading ? (
                    <div className="p-8 text-center text-xs theme-text-muted">
                      <Loader2 size={20} className="animate-spin mx-auto mb-2 text-[var(--color-primary)]" />
                      Memuat data tugas...
                    </div>
                  ) : recentTasks.length > 0 ? (
                    recentTasks.map((item) => {
                      const countSubmit = item.jumlahPengumpulan ?? item._count?.pengumpulanTugasSiswa ?? 0;

                      return (
                        <div key={item.id} className="px-5 py-4 sm:px-6 hover:bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] transition">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <Link
                                href={`/admin/lms-cbt/tugas-siswa/${item.id}`}
                                className="theme-text hover:text-[var(--color-primary)] truncate text-sm font-semibold block transition"
                              >
                                {item.judul || "Tugas Siswa"}
                              </Link>

                              <p className="theme-text-secondary mt-1 text-xs">
                                {item.mapelNama || "-"} · {item.kelasNama || "-"}
                              </p>
                            </div>

                            <span className="theme-primary shrink-0 rounded-lg px-2 py-1 text-[10px] font-bold">
                              Tenggat: {formatTanggal(item.batasWaktu)}
                            </span>
                          </div>

                          <div className="mt-3 flex items-center justify-between text-[11px]">
                            <span className="theme-text-muted">
                              Jumlah berkas terkumpul:
                            </span>
                            <span className="theme-text font-semibold">
                              {countSubmit} Berkas
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-xs theme-text-muted">
                      Belum ada tugas siswa yang aktif.
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="mb-7 grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
              <div className="theme-card theme-border overflow-hidden rounded-2xl border shadow-[0_6px_24px_color-mix(in_srgb,var(--color-text)_6%,transparent)]">
                <div className="theme-border-soft flex items-center justify-between border-b px-5 py-4 sm:px-6">
                  <div>
                    <p className="theme-text text-sm font-bold">
                      Jadwal Asesmen Ujian CBT
                    </p>
                    <p className="theme-text-secondary mt-1 text-xs">
                      Ujian CBT yang terdaftar dalam kalender sekolah.
                    </p>
                  </div>

                  <Link
                    href="/admin/lms-cbt/ujian"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)]"
                  >
                    Kelola CBT
                    <ChevronRight size={14} />
                  </Link>
                </div>

                <div className="divide-y theme-border-soft">
                  {loading ? (
                    <div className="p-8 text-center text-xs theme-text-muted">
                      <Loader2 size={20} className="animate-spin mx-auto mb-2 text-[var(--color-primary)]" />
                      Memuat jadwal CBT...
                    </div>
                  ) : recentExams.length > 0 ? (
                    recentExams.map((item) => {
                      const now = new Date();
                      const start = item.waktuMulai ? new Date(item.waktuMulai) : null;
                      const end = item.waktuSelesai ? new Date(item.waktuSelesai) : null;
                      const isDraft = !item.dipublikasikan;

                      let statusLabel = "Terjadwal";
                      let statusClass = "theme-primary";

                      if (isDraft) {
                        statusLabel = "Draft";
                        statusClass = "theme-card-soft theme-text-muted border border-dashed border-gray-400/40";
                      } else if (start && end && now >= start && now <= end) {
                        statusLabel = "Sedang Berlangsung";
                        statusClass = "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20";
                      } else if (end && now > end) {
                        statusLabel = "Selesai";
                        statusClass = "theme-card-soft theme-text-muted";
                      }

                      return (
                        <div
                          key={item.id}
                          className="
                            group flex gap-4 px-5 py-4 transition
                            hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)]
                            sm:px-6
                          "
                        >
                          <div className="hidden w-14 shrink-0 sm:block">
                            <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]">
                              <CalendarDays size={16} />
                              <span className="mt-0.5 text-[9px] font-bold uppercase">
                                CBT
                              </span>
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Link
                                href={`/admin/lms-cbt/ujian/${item.id}`}
                                className="theme-text hover:text-[var(--color-primary)] text-sm font-semibold transition"
                              >
                                {item.judul || "Ujian CBT"}
                              </Link>

                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusClass}`}
                              >
                                {statusLabel}
                              </span>
                            </div>

                            <p className="theme-text-secondary mt-1 text-xs">
                              {item.mapel || "-"} · {item.kelasNama || "-"}
                            </p>

                            <div className="theme-text-muted mt-2 flex flex-wrap items-center gap-3 text-[11px]">
                              <span className="inline-flex items-center gap-1">
                                <CalendarDays size={12} />
                                {formatTanggal(item.waktuMulai)}
                              </span>

                              <span className="inline-flex items-center gap-1">
                                <Clock3 size={12} />
                                {formatWaktu(item.waktuMulai)} - {formatWaktu(item.waktuSelesai)}
                              </span>

                              <span className="inline-flex items-center gap-1">
                                <Users size={12} />
                                {item.peserta ?? 0} percobaan ujian
                              </span>
                            </div>
                          </div>

                          <Link
                            href={`/admin/lms-cbt/ujian/${item.id}`}
                            className="
                              theme-text-muted
                              hidden h-8 w-8 shrink-0
                              items-center justify-center
                              self-center rounded-lg
                              transition
                              hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]
                              hover:text-[var(--color-primary)]
                              sm:flex
                            "
                            title="Buka rincian ujian"
                          >
                            <ExternalLink size={15} />
                          </Link>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-xs theme-text-muted">
                      Belum ada jadwal ujian CBT online yang dibuat.
                    </div>
                  )}
                </div>
              </div>

              <div className="theme-card theme-border overflow-hidden rounded-2xl border shadow-[0_6px_24px_color-mix(in_srgb,var(--color-text)_6%,transparent)]">
                <div className="theme-border-soft flex items-center justify-between border-b px-5 py-4 sm:px-6">
                  <div>
                    <p className="theme-text text-sm font-bold">
                      Aktivitas Pembelajaran Terkini
                    </p>

                    <p className="theme-text-secondary mt-1 text-xs">
                      Penerbitan materi, penugasan, dan asesmen riil.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => loadDashboardData(true)}
                    disabled={refreshing || loading}
                    className="
                      theme-card-soft theme-text-muted
                      flex h-8 w-8 items-center justify-center
                      rounded-lg transition
                      hover:text-[var(--color-primary)]
                      disabled:opacity-50
                    "
                    title="Refresh aktivitas"
                  >
                    <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
                  </button>
                </div>

                <div className="p-5 sm:p-6">
                  {loading ? (
                    <div className="py-8 text-center text-xs theme-text-muted">
                      <Loader2 size={20} className="animate-spin mx-auto mb-2 text-[var(--color-primary)]" />
                      Menyinkronkan linimasa aktivitas...
                    </div>
                  ) : recentActivities.length > 0 ? (
                    <div className="relative">
                      <div className="theme-border-soft absolute bottom-5 left-[17px] top-5 w-px" />

                      <div className="space-y-5">
                        {recentActivities.map((item, idx) => {
                          const theme = toneMap[item.tone] || toneMap.primary;
                          const Icon = item.icon;

                          return (
                            <Link
                              key={`${item.type}-${idx}`}
                              href={item.href}
                              className="relative flex gap-3 group hover:opacity-90 transition"
                            >
                              <div
                                className={`
                                  relative z-10 flex h-9 w-9
                                  shrink-0 items-center justify-center
                                  rounded-xl ${theme.iconBg}
                                  ${theme.iconText}
                                  ring-4
                                  ring-[var(--color-card)]
                                `}
                              >
                                <Icon size={16} />
                              </div>

                              <div className="min-w-0 pt-0.5">
                                <p className="theme-text text-xs font-semibold leading-5 group-hover:text-[var(--color-primary)] transition">
                                  {item.title}
                                </p>

                                <p className="theme-text-secondary mt-0.5 truncate text-[11px]">
                                  {item.detail}
                                </p>

                                <p className="theme-text-muted mt-1 text-[10px]">
                                  {formatTanggal(item.date)} · {formatWaktu(item.date)}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs theme-text-muted">
                      Belum ada aktivitas LMS/CBT yang tercatat.
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="mb-7">
              <div className="theme-card theme-border rounded-2xl border p-5 shadow-[0_6px_24px_color-mix(in_srgb,var(--color-text)_6%,transparent)] sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                      Aksi Cepat Admin
                    </p>

                    <h2 className="theme-text mt-1 text-lg font-bold">
                      Akses Langsung Modul Pembelajaran
                    </h2>

                    <p className="theme-text-secondary mt-1 text-sm">
                      Pintas langsung ke penugasan kelas, modul ajar, tugas siswa, CBT, dan monitoring server.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      {
                        label: "Penugasan Kelas",
                        icon: GraduationCap,
                        href: "/admin/lms-cbt/modul-class/tambah",
                      },
                      {
                        label: "Materi & Modul",
                        icon: BookOpen,
                        href: "/admin/lms-cbt/materi-modul-ajar",
                      },
                      {
                        label: "Tugas Siswa",
                        icon: ClipboardCheck,
                        href: "/admin/lms-cbt/tugas-siswa",
                      },
                      {
                        label: "Buat Ujian CBT",
                        icon: MonitorPlay,
                        href: "/admin/lms-cbt/ujian/tambah",
                      },
                    ].map((item) => {
                      const Icon = item.icon;
                      const active = activeQuickAction === item.label;

                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() => setActiveQuickAction(item.label)}
                          className={`
                            group flex min-w-[125px]
                            items-center gap-2 rounded-xl
                            border px-3 py-3
                            text-xs font-semibold transition
                            ${
                              active
                                ? "theme-primary theme-border"
                                : "theme-card theme-border theme-text-secondary hover:border-[color-mix(in_srgb,var(--color-primary)_30%,var(--color-border))] hover:text-[var(--color-primary)]"
                            }
                          `}
                        >
                          <Icon size={16} />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            <div className="theme-border-soft theme-text-muted flex flex-col gap-3 border-t py-5 text-xs sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap size={15} />
                <span>SmartSchool · LMS & CBT Administration Dashboard</span>
              </div>

              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-[var(--color-success)]" />
                  API Pembelajaran Terhubung
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-[var(--color-success)]" />
                  CBT Engine Ready
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
