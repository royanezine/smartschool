"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";

import { getKelas } from "@/services/kelas.service";
import { getKelasMapel } from "@/services/kelasMapel.service";
import { getTahunAjaran } from "@/services/tahunAjaran.service";
import { getDashboardRapot } from "@/services/raport.service";
import { getDashboardSekolah } from "@/services/dashboard.service";
import { getSemuaSiswa } from "@/services/siswa.service";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  ChevronRight,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  PenLine,
  Printer,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Sparkles,
  Users,
  XCircle,
} from "lucide-react";

const QUICK_MODULES = [
  {
    title: "Entry Nilai",
    description: "Kelola dan input nilai siswa berdasarkan mata pelajaran.",
    href: "/admin/eraport/entry-nilai",
    icon: PenLine,
    tone: "blue",
  },
  {
    title: "Cetak Raport",
    description: "Preview dan cetak raport siswa secara terstruktur.",
    href: "/admin/eraport/cetak-raport",
    icon: Printer,
    tone: "violet",
  },
  {
    title: "Pengaturan Agregat Nilai",
    description: "Atur bobot dan perhitungan nilai akhir raport.",
    href: "/admin/eraport/pengaturan-agregat",
    icon: Settings2,
    tone: "indigo",
  },
];

const toneMap = {
  blue: {
    iconBg: "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]",
    iconText: "theme-primary-text",
  },
  violet: {
    iconBg: "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]",
    iconText: "theme-primary-text",
  },
  indigo: {
    iconBg: "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]",
    iconText: "theme-primary-text",
  },
  emerald: {
    iconBg: "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]",
    iconText: "theme-primary-text",
  },
  amber: {
    iconBg: "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]",
    iconText: "theme-primary-text",
  },
};

function getListResponse(response) {
  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response)) {
    return response;
  }

  return [];
}

function getObjectResponse(response) {
  return response?.data?.data ?? response?.data ?? response ?? {};
}

function getTotalSiswaResponse(dashboardResponse, siswaResponse) {
  const dashboardData = getObjectResponse(dashboardResponse);

  const dashboardTotal =
    dashboardData?.sekolah?.totalSiswa ??
    dashboardData?.cabang?.totalSiswa ??
    dashboardData?.totalSiswa;

  if (
    dashboardTotal !== undefined &&
    dashboardTotal !== null &&
    Number.isFinite(Number(dashboardTotal))
  ) {
    return Number(dashboardTotal);
  }

  const siswaData = getObjectResponse(siswaResponse);

  const siswaTotal =
    siswaData?.meta?.totalData ??
    siswaData?.meta?.total ??
    siswaData?.pagination?.total ??
    siswaData?.totalData ??
    siswaData?.total;

  if (
    siswaTotal !== undefined &&
    siswaTotal !== null &&
    Number.isFinite(Number(siswaTotal))
  ) {
    return Number(siswaTotal);
  }

  return null;
}

function StatCard({
  label,
  value,
  description,
  icon: Icon,
  tone = "blue",
  href,
}) {
  const theme = toneMap[tone] || toneMap.blue;

  const content = (
    <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border theme-border theme-card p-5 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:shadow-lg">
      <div className="absolute -right-7 -top-7 h-24 w-24 rounded-full bg-[var(--color-primary)] opacity-[0.05] transition-transform duration-500 group-hover:scale-150" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium theme-text-muted">{label}</p>

          <p className="mt-2 text-3xl font-bold tracking-tight theme-text">
            {value}
          </p>

          <p className="mt-1.5 text-xs theme-text-muted">{description}</p>

          {href && (
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)]">
              Lihat detail
              <ArrowUpRight size={14} />
            </div>
          )}
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${theme.iconBg} ${theme.iconText}`}
        >
          <Icon size={21} strokeWidth={1.8} />
        </div>
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block h-full">
      {content}
    </Link>
  ) : (
    content
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  action = "Lihat semua",
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
            {eyebrow}
          </p>
        )}

        <h2 className="text-lg font-bold tracking-tight theme-text">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm theme-text-muted">{description}</p>
        )}
      </div>

      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-primary)]"
        >
          {action}
          <ChevronRight size={16} />
        </Link>
      )}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
      <div className="theme-card-soft flex h-12 w-12 items-center justify-center rounded-xl">
        <FileText size={21} className="theme-text-muted" />
      </div>

      <p className="mt-3 text-sm font-semibold theme-text">Belum ada data</p>

      <p className="mt-1 max-w-sm text-xs leading-5 theme-text-muted">
        {message}
      </p>
    </div>
  );
}

export default function ERaportPage() {
  const [activeView, setActiveView] = useState("ringkasan");

  const [kelasList, setKelasList] = useState([]);
  const [kelasMapelList, setKelasMapelList] = useState([]);
  const [tahunAjaranList, setTahunAjaranList] = useState([]);

  const [totalSiswaApi, setTotalSiswaApi] = useState(null);

  const [dashboardRapot, setDashboardRapot] = useState({
    totalRapot: 0,
    rapotDraft: 0,
    rapotPublished: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [
        kelasRes,
        mapelRes,
        taRes,
        dashRes,
        siswaRes,
        raportRes,
      ] = await Promise.allSettled([
        getKelas({ limit: 100 }),
        getKelasMapel(),
        getTahunAjaran(),
        getDashboardSekolah(),
        getSemuaSiswa({ limit: 1 }),
        getDashboardRapot(),
      ]);

      if (kelasRes.status === "fulfilled") {
        setKelasList(getListResponse(kelasRes.value));
      } else {
        setKelasList([]);
        console.error("Gagal mengambil data kelas:", kelasRes.reason);
      }

      if (mapelRes.status === "fulfilled") {
        setKelasMapelList(getListResponse(mapelRes.value));
      } else {
        setKelasMapelList([]);
        console.error(
          "Gagal mengambil penugasan mata pelajaran:",
          mapelRes.reason
        );
      }

      if (taRes.status === "fulfilled") {
        setTahunAjaranList(getListResponse(taRes.value));
      } else {
        setTahunAjaranList([]);
        console.error("Gagal mengambil tahun ajaran:", taRes.reason);
      }

      const siswaTotal = getTotalSiswaResponse(
        dashRes.status === "fulfilled" ? dashRes.value : null,
        siswaRes.status === "fulfilled" ? siswaRes.value : null
      );

      setTotalSiswaApi(siswaTotal);

      if (raportRes.status === "fulfilled") {
        const data = getObjectResponse(raportRes.value);

        setDashboardRapot({
          totalRapot: Number(data.totalRapot) || 0,
          rapotDraft: Number(data.rapotDraft) || 0,
          rapotPublished: Number(data.rapotPublished) || 0,
        });
      } else {
        setDashboardRapot({
          totalRapot: 0,
          rapotDraft: 0,
          rapotPublished: 0,
        });

        console.error(
          "Gagal mengambil dashboard raport:",
          raportRes.reason
        );
      }

      const semuaGagal = [
        kelasRes,
        mapelRes,
        taRes,
        dashRes,
        siswaRes,
        raportRes,
      ].every((result) => result.status === "rejected");

      if (semuaGagal) {
        setError("Data dashboard gagal dimuat. Silakan coba kembali.");
      } else if (raportRes.status === "rejected") {
        setError(
          "Data statistik raport gagal dimuat. Periksa koneksi API raport."
        );
      }
    } catch (err) {
      console.error("Error dashboard E-Raport:", err);
      setError("Terjadi kesalahan saat memuat data dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeTahunAjaran = useMemo(() => {
    if (!tahunAjaranList.length) return null;

    return (
      tahunAjaranList.find(
        (item) =>
          String(item.status).trim().toLowerCase() === "aktif"
      ) || tahunAjaranList[0]
    );
  }, [tahunAjaranList]);

  const totalSiswa = totalSiswaApi;
  const totalKelas = kelasList.length;

  const mataPelajaranUnik = useMemo(() => {
    const mapelMap = new Map();

    kelasMapelList.forEach((item) => {
      if (item.mataPelajaran?.id) {
        mapelMap.set(item.mataPelajaran.id, item.mataPelajaran);
      }
    });

    return Array.from(mapelMap.values());
  }, [kelasMapelList]);

  const totalMataPelajaran = mataPelajaranUnik.length;

  const classProgress = useMemo(() => {
    return kelasList.map((kelas) => {
      const jumlahSiswa =
        kelas._count?.anggota ??
        kelas._count?.anggotaKelas ??
        (Array.isArray(kelas.anggota)
          ? kelas.anggota.length
          : Array.isArray(kelas.anggotaKelas)
            ? kelas.anggotaKelas.length
            : null);

      return {
        id: kelas.id,
        kelas: kelas.nama || "Kelas",
        tingkat: kelas.tingkat ? `Tingkat ${kelas.tingkat}` : "Reguler",
        siswa: jumlahSiswa,
        status: kelas.status || "Aktif",
      };
    });
  }, [kelasList]);

  const subjectProgress = useMemo(() => {
    return kelasMapelList.map((item) => ({
      id: item.id,
      subject: item.mataPelajaran?.nama || "Mata Pelajaran",
      teacher:
        item.guruPengajar?.namaLengkap ||
        item.guru?.namaLengkap ||
        "Guru belum ditentukan",
      kelas: item.kelas?.nama || "Kelas",
    }));
  }, [kelasMapelList]);

  const {
    totalRapot,
    rapotDraft,
    rapotPublished,
  } = dashboardRapot;

  const persentaseRapot =
    totalRapot > 0
      ? Math.round((rapotPublished / totalRapot) * 100)
      : 0;

  const raportStatus = useMemo(
    () => [
      {
        label: "Siswa Terdaftar",
        value: totalSiswa,
        tone: "emerald",
      },
      {
        label: "Kelas Terdaftar",
        value: totalKelas,
        tone: "blue",
      },
      {
        label: "Raport Dipublikasikan",
        value: rapotPublished,
        tone: "amber",
      },
    ],
    [totalSiswa, totalKelas, rapotPublished]
  );

  const semesterAktif = activeTahunAjaran?.semester
    ? `Semester ${activeTahunAjaran.semester}`
    : "Semester belum ditentukan";

  const tahunAjaranAktif =
    activeTahunAjaran?.tahunAjaran || "Belum tersedia";

  const formatNumber = (value) =>
    Number(value || 0).toLocaleString("id-ID");

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar role="admin" active="eraport" setActive={() => {}} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b theme-border">
          <Header
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AS",
            }}
          />
        </div>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            {error && (
              <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border theme-border theme-warning px-4 py-3 text-xs theme-text-secondary">
                <span>{error}</span>

                <button
                  type="button"
                  onClick={loadData}
                  className="shrink-0 font-semibold text-[var(--color-primary)]"
                >
                  Coba lagi
                </button>
              </div>
            )}

            <section className="relative mb-6 overflow-hidden rounded-[28px] border theme-border theme-sidebar shadow-lg">
              <div className="absolute -right-24 -top-28 h-80 w-80 rounded-full bg-[var(--color-primary)] opacity-[0.12] blur-3xl" />

              <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-[var(--color-info)] opacity-[0.08] blur-3xl" />

              <div
                className="absolute inset-0 opacity-[0.05]"
                style={{
                  backgroundImage:
                    "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
                  backgroundSize: "34px 34px",
                }}
              />

              <div className="relative grid gap-8 px-6 py-7 sm:px-8 sm:py-8 lg:grid-cols-[1fr_390px] lg:px-10 lg:py-9">
                <div className="flex flex-col justify-center">
                  <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border theme-border theme-card-soft px-3 py-1.5 text-xs font-semibold theme-text-secondary">
                    <Sparkles size={13} />
                    Akademik · E-Raport
                  </div>

                  <h1 className="max-w-2xl text-2xl font-bold tracking-tight theme-text sm:text-3xl lg:text-[38px] lg:leading-tight">
                    Kelola E-Raport Sekolah
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-6 theme-text-secondary sm:text-[15px]">
                    Pantau data akademik, pengelolaan nilai, kelengkapan raport,
                    dan pencetakan raport siswa dalam satu dashboard akademik.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href="/admin/eraport/entry-nilai"
                      className="theme-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-md transition hover:-translate-y-0.5"
                    >
                      <PenLine size={17} />
                      Entry Nilai
                    </Link>

                    <Link
                      href="/admin/eraport/cetak-raport"
                      className="theme-card theme-sidebar-hover inline-flex items-center gap-2 rounded-xl border theme-border px-4 py-2.5 text-sm font-semibold theme-text-secondary transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                    >
                      <Printer size={17} />
                      Cetak Raport
                    </Link>
                  </div>
                </div>

                <div className="rounded-2xl border theme-border theme-card-soft p-5">
                  <div className="flex items-start justify-between">
                    <div>
                     

                     

                      <p className="mt-1 text-xs theme-text-muted">
                        {loading ? "..." : semesterAktif}
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                      <CalendarDays size={20} />
                    </div>
                  </div>

                  <div className="theme-card mt-5 rounded-xl p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs theme-text-muted">
                          Kelengkapan Raport
                        </p>

                        <p className="mt-1 text-xl font-bold theme-text">
                          {loading
                            ? "Memuat..."
                            : totalRapot > 0
                              ? `${persentaseRapot}%`
                              : "Belum ada raport"}
                        </p>

                        <p className="mt-1 text-[11px] theme-text-muted">
                          {loading
                            ? "Mengambil data backend..."
                            : `${formatNumber(rapotPublished)} dari ${formatNumber(totalRapot)} raport telah dipublikasikan.`}
                        </p>
                      </div>

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 border-[var(--color-border)]">
                        {loading ? (
                          <RefreshCw
                            size={20}
                            className="animate-spin theme-text-muted"
                          />
                        ) : (
                          <FileCheck2
                            size={21}
                            className={
                              persentaseRapot === 100 && totalRapot > 0
                                ? "text-[var(--color-success)]"
                                : "theme-text-muted"
                            }
                          />
                        )}
                      </div>
                    </div>

                    <div className="theme-card-soft mt-4 h-2 overflow-hidden rounded-full">
                      <div
                        className="h-full rounded-full bg-[var(--color-success)] transition-all duration-500"
                        style={{
                          width: `${persentaseRapot}%`,
                        }}
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] theme-text-muted">
                      <span>{formatNumber(rapotPublished)} Published</span>
                      <span>{formatNumber(rapotDraft)} Draft</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-7">
              <SectionHeader
                eyebrow="E-RAPORT"
                title="Modul utama"
                description="Akses cepat ke seluruh pengelolaan E-Raport."
              />

              <div className="grid gap-4 md:grid-cols-3">
                {QUICK_MODULES.map((item) => {
                  const Icon = item.icon;
                  const theme = toneMap[item.tone] || toneMap.blue;

                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="group relative overflow-hidden rounded-2xl border theme-border theme-card p-5 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-primary)] hover:shadow-lg"
                    >
                      <div className="absolute right-0 top-0 h-28 w-28 translate-x-10 -translate-y-10 rounded-full bg-[var(--color-primary)] opacity-[0.05] transition-transform duration-500 group-hover:scale-150" />

                      <div className="relative">
                        <div className="flex items-start justify-between">
                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-xl ${theme.iconBg} ${theme.iconText}`}
                          >
                            <Icon size={21} strokeWidth={1.8} />
                          </div>

                          <ArrowUpRight
                            size={17}
                            className="theme-text-placeholder transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)]"
                          />
                        </div>

                        <h3 className="mt-5 text-[15px] font-bold theme-text">
                          {item.title}
                        </h3>

                        <p className="mt-1.5 min-h-[40px] text-xs leading-5 theme-text-muted">
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
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label="Total Siswa"
                  value={
                    loading
                      ? "..."
                      : totalSiswa !== null
                        ? formatNumber(totalSiswa)
                        : "—"
                  }
                  description="Total siswa berdasarkan data sekolah"
                  icon={Users}
                  tone="blue"
                />

                <StatCard
                  label="Penugasan Mapel"
                  value={
                    loading ? "..." : formatNumber(kelasMapelList.length)
                  }
                  description="Penugasan mata pelajaran per kelas"
                  icon={FileSpreadsheet}
                  tone="violet"
                  href="/admin/eraport/entry-nilai"
                />

                <StatCard
                  label="Raport Lengkap"
                  value={loading ? "..." : formatNumber(rapotPublished)}
                  description="Jumlah raport yang telah dipublikasikan"
                  icon={FileCheck2}
                  tone="emerald"
                  href="/admin/eraport/cetak-raport"
                />

                <StatCard
                  label="Belum Lengkap"
                  value={loading ? "..." : formatNumber(rapotDraft)}
                  description="Jumlah raport yang masih berstatus draft"
                  icon={XCircle}
                  tone="amber"
                />
              </div>
            </section>

            <section className="mb-7 grid gap-5 xl:grid-cols-[1.3fr_.7fr]">
              <div className="rounded-2xl border theme-border theme-card shadow-md">
                <div className="flex flex-col gap-4 border-b theme-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                      Monitoring
                    </p>

                    <h2 className="mt-1 text-lg font-bold theme-text">
                      Data kelas E-Raport
                    </h2>

                    <p className="mt-1 text-sm theme-text-muted">
                      Daftar kelas yang tersedia pada sistem akademik.
                    </p>
                  </div>

                  <div className="theme-card-soft flex items-center gap-1 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => setActiveView("ringkasan")}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                        activeView === "ringkasan"
                          ? "theme-card text-[var(--color-primary)] shadow-sm"
                          : "theme-text-muted"
                      }`}
                    >
                      Ringkasan
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveView("detail")}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                        activeView === "detail"
                          ? "theme-card text-[var(--color-primary)] shadow-sm"
                          : "theme-text-muted"
                      }`}
                    >
                      Detail
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px]">
                    <thead>
                      <tr className="theme-table-header border-b theme-border">
                        <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-wider">
                          Kelas
                        </th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">
                          Siswa
                        </th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">
                          Nilai
                        </th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">
                          Raport
                        </th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-[11px] font-bold uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[var(--color-border-soft)]">
                      {loading ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-10 text-center text-sm theme-text-muted"
                          >
                            Memuat data kelas...
                          </td>
                        </tr>
                      ) : classProgress.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-10 text-center text-sm theme-text-muted"
                          >
                            Belum ada data kelas.
                          </td>
                        </tr>
                      ) : (
                        classProgress.map((item) => (
                          <tr
                            key={item.id}
                            className="group transition theme-table-hover"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold">
                                  <GraduationCap size={17} />
                                </div>

                                <div>
                                  <p className="text-sm font-semibold theme-text">
                                    {item.kelas}
                                  </p>

                                  <p className="mt-0.5 text-[11px] theme-text-placeholder">
                                    {item.tingkat}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-4">
                              <span className="text-sm font-semibold theme-text-secondary">
                                {item.siswa ?? "—"}
                              </span>
                            </td>

                            <td className="w-[150px] px-4 py-4">
                              <span className="text-xs theme-text-muted">
                                Belum tersedia
                              </span>
                            </td>

                            <td className="w-[150px] px-4 py-4">
                              <span className="text-xs theme-text-muted">
                                Belum tersedia
                              </span>
                            </td>

                            <td className="px-4 py-4">
                              <span className="inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold theme-info">
                                {item.status}
                              </span>
                            </td>

                            <td className="px-6 py-4 text-right">
                              <Link
                                href="/admin/eraport/entry-nilai"
                                className="theme-text-muted theme-sidebar-hover inline-flex h-8 w-8 items-center justify-center rounded-lg transition hover:text-[var(--color-primary)]"
                              >
                                <ChevronRight size={16} />
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {activeView === "detail" && (
                  <div className="theme-card-soft border-t theme-border px-5 py-4 sm:px-6">
                    <div className="flex items-start gap-3">
                      <div className="bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                        <BarChart3 size={17} />
                      </div>

                      <div>
                        <p className="text-xs font-semibold theme-text">
                          Data Akademik
                        </p>

                        <p className="mt-1 text-xs leading-5 theme-text-secondary">
                          {loading
                            ? "Memuat data akademik..."
                            : `Terdapat ${totalKelas} kelas dan ${totalMataPelajaran} mata pelajaran yang terdaftar. ${
                                totalSiswa !== null
                                  ? `Total siswa sekolah sebanyak ${totalSiswa} siswa.`
                                  : "Total siswa belum tersedia dari API."
                              } Terdapat ${rapotPublished} raport published dan ${rapotDraft} raport draft.`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border theme-border theme-card p-5 shadow-md sm:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                      Data Sekolah
                    </p>

                    <h2 className="mt-1 text-lg font-bold theme-text">
                      Ringkasan akademik
                    </h2>

                    <p className="mt-1 text-sm theme-text-muted">
                      Jumlah data akademik yang tersedia.
                    </p>
                  </div>

                  <div className="bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text flex h-10 w-10 items-center justify-center rounded-xl">
                    <FileText size={19} />
                  </div>
                </div>

                <div className="mt-7 flex justify-center">
                  <div className="relative flex h-44 w-44 items-center justify-center rounded-full border-[18px] border-[var(--color-border)]">
                    <div className="text-center">
                      <p className="text-3xl font-bold theme-text">
                        {loading ? "..." : totalKelas}
                      </p>

                      <p className="mt-1 text-[11px] font-medium theme-text-placeholder">
                        Total Kelas
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-7 space-y-4">
                  {raportStatus.map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${
                              item.tone === "emerald"
                                ? "bg-[var(--color-success)]"
                                : item.tone === "blue"
                                  ? "bg-[var(--color-primary)]"
                                  : "bg-[var(--color-warning)]"
                            }`}
                          />

                          <span className="text-xs font-medium theme-text-secondary">
                            {item.label}
                          </span>
                        </div>

                        <span className="text-xs font-bold theme-text">
                          {loading
                            ? "..."
                            : item.value === null
                              ? "—"
                              : formatNumber(item.value)}
                        </span>
                      </div>

                      <div className="theme-card-soft mt-2 h-1.5 overflow-hidden rounded-full">
                        <div
                          className={`h-full rounded-full ${
                            item.tone === "emerald"
                              ? "bg-[var(--color-success)]"
                              : item.tone === "blue"
                                ? "bg-[var(--color-primary)]"
                                : "bg-[var(--color-warning)]"
                          }`}
                          style={{ width: "100%" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/admin/eraport/cetak-raport"
                  className="theme-card theme-sidebar-hover mt-6 flex items-center justify-center gap-2 rounded-xl border theme-border px-4 py-2.5 text-xs font-semibold theme-text-secondary transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                >
                  <Printer size={15} />
                  Kelola pencetakan raport
                </Link>
              </div>
            </section>

            <section className="mb-7 grid gap-5 xl:grid-cols-[1fr_.85fr]">
              <div className="rounded-2xl border theme-border theme-card shadow-md">
                <div className="flex items-center justify-between border-b theme-border px-5 py-4 sm:px-6">
                  <div>
                    <p className="text-sm font-bold theme-text">
                      Mata pelajaran berdasarkan kelas
                    </p>

                    <p className="mt-1 text-xs theme-text-muted">
                      Daftar penugasan mata pelajaran yang tersedia.
                    </p>
                  </div>

                  <Link
                    href="/admin/eraport/entry-nilai"
                    className="text-xs font-semibold text-[var(--color-primary)]"
                  >
                    Entry nilai
                  </Link>
                </div>

                <div className="p-5 sm:p-6">
                  {loading ? (
                    <p className="py-8 text-center text-xs theme-text-muted">
                      Memuat data mata pelajaran...
                    </p>
                  ) : subjectProgress.length === 0 ? (
                    <EmptyState message="Belum ada penugasan mata pelajaran yang tersedia." />
                  ) : (
                    <div className="space-y-5">
                      {subjectProgress.slice(0, 8).map((item, index) => (
                        <div key={item.id}>
                          <div className="flex items-center gap-3">
                            <div className="theme-card-soft theme-text-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold">
                              {String(index + 1).padStart(2, "0")}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <p className="text-sm font-semibold theme-text">
                                    {item.subject}
                                  </p>

                                  <p className="mt-0.5 text-[11px] theme-text-placeholder">
                                    {item.teacher} · {item.kelas}
                                  </p>
                                </div>

                                <span className="text-[11px] theme-text-muted">
                                  Data progres belum tersedia
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {subjectProgress.length > 8 && (
                        <p className="border-t theme-border pt-4 text-center text-xs theme-text-muted">
                          Menampilkan 8 dari {subjectProgress.length} penugasan
                          mata pelajaran.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border theme-border theme-card shadow-md">
                <div className="flex items-center justify-between border-b theme-border px-5 py-4 sm:px-6">
                  <div>
                    <p className="text-sm font-bold theme-text">
                      Aktivitas terbaru
                    </p>

                    <p className="mt-1 text-xs theme-text-muted">
                      Riwayat aktivitas pengelolaan E-Raport.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={loadData}
                    disabled={loading}
                    className="theme-card-soft theme-text-muted theme-sidebar-hover flex h-8 w-8 items-center justify-center rounded-lg transition hover:text-[var(--color-primary)] disabled:opacity-50"
                    title="Segarkan Data"
                  >
                    <RefreshCw
                      size={15}
                      className={loading ? "animate-spin" : ""}
                    />
                  </button>
                </div>

                <EmptyState message="Riwayat aktivitas belum tersedia karena backend belum menyediakan endpoint log aktivitas E-Raport." />
              </div>
            </section>

            <section className="mb-7">
              <div className="theme-info relative overflow-hidden rounded-2xl border theme-border p-5 sm:p-6">
                <div className="absolute -right-16 -top-20 h-44 w-44 rounded-full bg-[var(--color-primary)] opacity-[0.10] blur-2xl" />

                <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="theme-card flex h-9 w-9 items-center justify-center rounded-xl text-[var(--color-primary)] shadow-sm">
                        <GraduationCap size={18} />
                      </div>

                      <p className="text-sm font-bold theme-text">
                        Pengelolaan akademik lebih terarah
                      </p>
                    </div>

                    <p className="mt-2 max-w-2xl text-xs leading-5 theme-text-secondary">
                      Pastikan seluruh nilai telah terisi dan difinalisasi
                      sebelum proses pembuatan serta pencetakan raport
                      dilakukan.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/admin/eraport/entry-nilai"
                      className="theme-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold shadow-sm transition"
                    >
                      <PenLine size={15} />
                      Entry Nilai
                    </Link>

                    <Link
                      href="/admin/eraport/pengaturan-agregat"
                      className="theme-card theme-sidebar-hover inline-flex items-center gap-2 rounded-xl border theme-border px-4 py-2.5 text-xs font-semibold theme-text-secondary transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                    >
                      <Settings2 size={15} />
                      Pengaturan
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            <div className="flex flex-col gap-3 border-t theme-border py-5 text-xs theme-text-muted sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap size={15} />
                <span>SmartSchool · E-Raport Management</span>
              </div>

              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck
                    size={13}
                    className="text-[var(--color-success)]"
                  />
                  Sistem aktif
                </span>

                
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}