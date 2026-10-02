"use client";

import { useState, useMemo } from "react";
import {
  Layers,
  Search,
  ChevronDown,
  Sparkles,
  Download,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  School,
  Users,
  ChevronRight,
  Minus,
  CalendarDays,
  Laptop,
  Smartphone,
  Tablet,
  FileText,
  Video,
  ClipboardList,
  Trophy,
  Flame,
  Eye,
  UploadCloud,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ============================================================
// DUMMY DATA
// ============================================================

const JENJANG_OPTIONS = ["Semua Jenjang", "SD", "SMP", "SMA"];

const PERIODE_OPTIONS = [
  "Agustus 2026",
  "Juli 2026",
  "Juni 2026",
];

const STATUS_OPTIONS = [
  "Semua Status",
  "Baik",
  "Perlu Perhatian",
  "Kritis",
];

const trenMingguan = [
  { minggu: "M1", pengguna: 4120, targetAdopsi: 4500 },
  { minggu: "M2", pengguna: 4390, targetAdopsi: 4500 },
  { minggu: "M3", pengguna: 4260, targetAdopsi: 4500 },
  { minggu: "M4", pengguna: 4580, targetAdopsi: 4500 },
  { minggu: "M5", pengguna: 4710, targetAdopsi: 4500 },
  { minggu: "M6", pengguna: 4650, targetAdopsi: 4500 },
  { minggu: "M7", pengguna: 4830, targetAdopsi: 4500 },
  { minggu: "M8", pengguna: 5020, targetAdopsi: 4500 },
];

const polaMingguan = [
  { hari: "Sen", sesi: 1120 },
  { hari: "Sel", sesi: 1340 },
  { hari: "Rab", sesi: 1280 },
  { hari: "Kam", sesi: 1190 },
  { hari: "Jum", sesi: 890 },
  { hari: "Sab", sesi: 410 },
  { hari: "Min", sesi: 260 },
];

const perangkat = [
  {
    name: "Desktop",
    value: 54,
    color: "var(--color-primary)",
  },
  {
    name: "Mobile",
    value: 38,
    color: "var(--color-info)",
  },
  {
    name: "Tablet",
    value: 8,
    color: "var(--color-warning)",
  },
];

const dataSekolah = [
  {
    id: 1,
    nama: "SD Smart School 1",
    jenjang: "SD",
    adopsi: 92,
    loginPerMinggu: 4.1,
    tugasTepatWaktu: 88,
    engagement: 90,
    trend: "up",
    perubahan: 3.2,
    status: "Baik",
  },
  {
    id: 2,
    nama: "SD Smart School 2",
    jenjang: "SD",
    adopsi: 85,
    loginPerMinggu: 3.6,
    tugasTepatWaktu: 81,
    engagement: 83,
    trend: "up",
    perubahan: 1.5,
    status: "Baik",
  },
  {
    id: 3,
    nama: "SMP Smart School 1",
    jenjang: "SMP",
    adopsi: 79,
    loginPerMinggu: 3.1,
    tugasTepatWaktu: 74,
    engagement: 77,
    trend: "down",
    perubahan: -1.1,
    status: "Baik",
  },
  {
    id: 4,
    nama: "SMP Smart School 2",
    jenjang: "SMP",
    adopsi: 58,
    loginPerMinggu: 1.8,
    tugasTepatWaktu: 52,
    engagement: 55,
    trend: "down",
    perubahan: -6.4,
    status: "Perlu Perhatian",
  },
  {
    id: 5,
    nama: "SMA Smart School 1",
    jenjang: "SMA",
    adopsi: 81,
    loginPerMinggu: 3.3,
    tugasTepatWaktu: 79,
    engagement: 80,
    trend: "up",
    perubahan: 2.0,
    status: "Baik",
  },
  {
    id: 6,
    nama: "SMA Smart School 2",
    jenjang: "SMA",
    adopsi: 41,
    loginPerMinggu: 1.2,
    tugasTepatWaktu: 38,
    engagement: 40,
    trend: "down",
    perubahan: -8.7,
    status: "Kritis",
  },
];

const topKonten = [
  {
    judul: "Video: Sistem Pencernaan Manusia",
    mapel: "IPA",
    tipe: "video",
    dilihat: 3210,
  },
  {
    judul: "Modul: Aljabar Linear Dasar",
    mapel: "Matematika",
    tipe: "modul",
    dilihat: 2870,
  },
  {
    judul: "Kuis: Teks Eksposisi",
    mapel: "Bahasa Indonesia",
    tipe: "kuis",
    dilihat: 2540,
  },
  {
    judul: "Video: Revolusi Industri 4.0",
    mapel: "IPS",
    tipe: "video",
    dilihat: 2115,
  },
  {
    judul: "Modul: Simple Past Tense",
    mapel: "Bahasa Inggris",
    tipe: "modul",
    dilihat: 1980,
  },
];

const topGuru = [
  {
    nama: "Dra. Ratna Widiastuti",
    sekolah: "SD Smart School 1",
    konten: 46,
    avatar: "R",
  },
  {
    nama: "H. Ahmad Fauzi, S.Pd.",
    sekolah: "SMP Smart School 1",
    konten: 39,
    avatar: "A",
  },
  {
    nama: "Dr. Indah Permatasari",
    sekolah: "SMA Smart School 2",
    konten: 34,
    avatar: "I",
  },
  {
    nama: "Dra. Sri Wahyuni",
    sekolah: "SMP Smart School 2",
    konten: 28,
    avatar: "S",
  },
];

const kontenIcon = {
  video: Video,
  modul: FileText,
  kuis: ClipboardList,
};

// ============================================================
// THEME HELPERS
// ============================================================

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

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

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

// ============================================================
// STATUS STYLE
// ============================================================

function statusStyle(status) {
  switch (status) {
    case "Baik":
      return `${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`;

    case "Perlu Perhatian":
      return `${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder}`;

    case "Kritis":
      return `${themeDangerSurface} text-[var(--color-warning)] ${themeDangerBorder}`;

    default:
      return `${themeNeutralSurface} theme-text-muted ${themeNeutralBorder}`;
  }
}

// ============================================================
// BAR COLOR
// ============================================================

function barColor(value) {
  if (value >= 80) {
    return "bg-[var(--color-success)]";
  }

  if (value >= 60) {
    return "bg-[var(--color-warning)]";
  }

  return "bg-[var(--color-primary)]";
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function MonitoringLmsPage() {
  const [jenjang, setJenjang] = useState(JENJANG_OPTIONS[0]);
  const [periode, setPeriode] = useState(PERIODE_OPTIONS[0]);
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);
  const [search, setSearch] = useState("");

  // ============================================================
  // FILTER SEKOLAH
  // ============================================================

  const filteredSekolah = useMemo(() => {
    return dataSekolah
      .filter((s) => {
        const matchJenjang =
          jenjang === "Semua Jenjang" || s.jenjang === jenjang;

        const matchStatus =
          status === "Semua Status" || s.status === status;

        const matchSearch =
          !search.trim() ||
          s.nama.toLowerCase().includes(search.toLowerCase());

        return matchJenjang && matchStatus && matchSearch;
      })
      .sort((a, b) => b.engagement - a.engagement);
  }, [jenjang, status, search]);

  // ============================================================
  // SUMMARY
  // ============================================================

  const summary = useMemo(() => {
    const total = filteredSekolah.length;

    const adopsi = total
      ? Math.round(
          filteredSekolah.reduce((a, s) => a + s.adopsi, 0) / total
        )
      : 0;

    const loginPerMinggu = total
      ? (
          filteredSekolah.reduce(
            (a, s) => a + s.loginPerMinggu,
            0
          ) / total
        ).toFixed(1)
      : "0.0";

    const tugasTepatWaktu = total
      ? Math.round(
          filteredSekolah.reduce(
            (a, s) => a + s.tugasTepatWaktu,
            0
          ) / total
        )
      : 0;

    const perluPerhatian = filteredSekolah.filter(
      (s) =>
        s.status === "Perlu Perhatian" ||
        s.status === "Kritis"
    ).length;

    return {
      total,
      adopsi,
      loginPerMinggu,
      tugasTepatWaktu,
      perluPerhatian,
    };
  }, [filteredSekolah]);

  // ============================================================
  // TREND USER
  // ============================================================

  const penggunaMingguIni =
    trenMingguan[trenMingguan.length - 1].pengguna;

  const penggunaMingguLalu =
    trenMingguan[trenMingguan.length - 2].pengguna;

  const deltaPengguna = (
    ((penggunaMingguIni - penggunaMingguLalu) /
      penggunaMingguLalu) *
    100
  ).toFixed(1);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="w-full max-w-[1800px] mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 space-y-6">

        {/* ======================================================
            PAGE HEADER
        ====================================================== */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium theme-text-muted mb-1">
              Monitoring Akademik
            </p>

            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-lg ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow} flex-shrink-0`}
              >
                <Layers size={18} />
              </div>

              <h1 className="text-xl sm:text-2xl font-semibold theme-text truncate">
                LMS
              </h1>
            </div>

            <p className="text-sm theme-text-secondary mt-1 ml-[42px] flex items-center gap-1.5">
              <Sparkles
                size={14}
                className="theme-text-muted flex-shrink-0"
              />

              <span className="truncate">
                Pantau adopsi, aktivitas, dan konten pembelajaran
                digital di seluruh unit sekolah.
              </span>
            </p>
          </div>

          <button
            type="button"
            className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[var(--color-card)] ${themePrimaryGradient} rounded-lg transition-all ${themePrimaryShadow} hover:opacity-90 whitespace-nowrap flex-shrink-0`}
          >
            <Download size={16} />
            Unduh Laporan
          </button>
        </div>

        {/* ======================================================
            FILTER BAR
        ====================================================== */}

        <div
          className={`theme-card rounded-xl border theme-border p-4 ${themeCardShadow}`}
        >
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">

            {/* SEARCH */}
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama sekolah..."
                className={`theme-input theme-text-secondary w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border theme-border outline-none transition-colors ${themeFocus}`}
              />
            </div>

            {/* JENJANG */}
            <div className="relative flex-1 min-w-[150px]">
              <select
                value={jenjang}
                onChange={(e) => setJenjang(e.target.value)}
                className={`theme-input theme-text-secondary w-full appearance-none pl-3 pr-9 py-2.5 text-sm font-medium rounded-lg border theme-border outline-none transition-colors cursor-pointer ${themeFocus}`}
              >
                {JENJANG_OPTIONS.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted pointer-events-none"
              />
            </div>

            {/* PERIODE */}
            <div className="relative flex-1 min-w-[170px]">
              <select
                value={periode}
                onChange={(e) => setPeriode(e.target.value)}
                className={`theme-input theme-text-secondary w-full appearance-none pl-3 pr-9 py-2.5 text-sm font-medium rounded-lg border theme-border outline-none transition-colors cursor-pointer ${themeFocus}`}
              >
                {PERIODE_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted pointer-events-none"
              />
            </div>

            {/* STATUS */}
            <div className="relative flex-1 min-w-[160px]">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={`theme-input theme-text-secondary w-full appearance-none pl-3 pr-9 py-2.5 text-sm font-medium rounded-lg border theme-border outline-none transition-colors cursor-pointer ${themeFocus}`}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* ======================================================
            SUMMARY CARDS
        ====================================================== */}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

          {/* ADOPSI */}
          <div
            className={`theme-card rounded-xl border theme-border p-3.5 ${themeSmallShadow} flex items-center gap-3 min-w-0`}
          >
            <div
              className={`p-2 rounded-lg border ${themePrimarySoft} ${themePrimarySoftBorder} text-[var(--color-primary)] flex-shrink-0`}
            >
              <Users size={16} />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wider truncate">
                Tingkat Adopsi LMS
              </p>

              <p className="text-lg font-bold theme-text">
                {summary.adopsi}%
              </p>
            </div>
          </div>

          {/* LOGIN */}
          <div
            className={`theme-card rounded-xl border theme-border p-3.5 ${themeSmallShadow} flex items-center gap-3 min-w-0`}
          >
            <div
              className={`p-2 rounded-lg border ${themeInfoSurface} ${themeInfoBorder} text-[var(--color-info)] flex-shrink-0`}
            >
              <CalendarDays size={16} />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wider truncate">
                Login / Siswa / Minggu
              </p>

              <p className="text-lg font-bold theme-text">
                {summary.loginPerMinggu}x
              </p>
            </div>
          </div>

          {/* TUGAS */}
          <div
            className={`theme-card rounded-xl border theme-border p-3.5 ${themeSmallShadow} flex items-center gap-3 min-w-0`}
          >
            <div
              className={`p-2 rounded-lg border ${themeSuccessSurface} ${themeSuccessBorder} text-[var(--color-success)] flex-shrink-0`}
            >
              <ClipboardList size={16} />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wider truncate">
                Tugas Tepat Waktu
              </p>

              <p className="text-lg font-bold theme-text">
                {summary.tugasTepatWaktu}%
              </p>
            </div>
          </div>

          {/* PERHATIAN */}
          <div
            className={`theme-card rounded-xl border theme-border p-3.5 ${themeSmallShadow} flex items-center gap-3 min-w-0`}
          >
            <div
              className={`p-2 rounded-lg border ${themeWarningSurface} ${themeWarningBorder} text-[var(--color-warning)] flex-shrink-0`}
            >
              <AlertTriangle size={16} />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wider truncate">
                Unit Perlu Perhatian
              </p>

              <p className="text-lg font-bold theme-text">
                {summary.perluPerhatian}
              </p>
            </div>
          </div>
        </div>

        {/* ======================================================
            TREN ADOPSI + DISTRIBUSI PERANGKAT
        ====================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* TREN PENGGUNA */}
          <div
            className={`lg:col-span-2 theme-card rounded-xl border theme-border ${themeCardShadow} p-4 sm:p-5`}
          >
            <div className="flex items-start justify-between mb-1">
              <div>
                <h3 className="text-sm font-semibold theme-text-secondary flex items-center gap-2">
                  <TrendingUp
                    size={15}
                    className="theme-text-muted"
                  />
                  Tren Pengguna Aktif Mingguan
                </h3>

                <p className="text-xs theme-text-muted mt-0.5">
                  8 minggu terakhir &middot; seluruh unit sekolah
                </p>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-xl font-bold theme-text">
                  {penggunaMingguIni.toLocaleString("id-ID")}
                </p>

                <p
                  className={`text-xs font-medium flex items-center justify-end gap-1 ${
                    deltaPengguna >= 0
                      ? "text-[var(--color-success)]"
                      : "text-[var(--color-warning)]"
                  }`}
                >
                  {deltaPengguna >= 0 ? (
                    <TrendingUp size={12} />
                  ) : (
                    <TrendingDown size={12} />
                  )}

                  {deltaPengguna >= 0 ? "+" : ""}
                  {deltaPengguna}% vs minggu lalu
                </p>
              </div>
            </div>

            <div className="h-56 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trenMingguan}
                  margin={{
                    top: 10,
                    right: 8,
                    left: -18,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="colorPengguna"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--color-primary)"
                        stopOpacity={0.35}
                      />

                      <stop
                        offset="95%"
                        stopColor="var(--color-primary)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border-soft)"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="minggu"
                    tick={{
                      fontSize: 11,
                      fill: "var(--color-text-muted)",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{
                      fontSize: 11,
                      fill: "var(--color-text-muted)",
                    }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />

                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 8,
                      border: "1px solid var(--color-border)",
                      background: "var(--color-card)",
                      color: "var(--color-text)",
                    }}
                    labelStyle={{
                      color: "var(--color-text)",
                      fontWeight: 600,
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="pengguna"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    fill="url(#colorPengguna)"
                    name="Pengguna aktif"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* DISTRIBUSI PERANGKAT */}
          <div
            className={`theme-card rounded-xl border theme-border ${themeCardShadow} p-4 sm:p-5 flex flex-col`}
          >
            <h3 className="text-sm font-semibold theme-text-secondary flex items-center gap-2 mb-1">
              <Laptop
                size={15}
                className="theme-text-muted"
              />
              Distribusi Perangkat
            </h3>

            <p className="text-xs theme-text-muted mb-2">
              Akses LMS bulan ini
            </p>

            <div className="h-40 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={perangkat}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={42}
                    outerRadius={62}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {perangkat.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={entry.color}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 8,
                      border:
                        "1px solid var(--color-border)",
                      background:
                        "var(--color-card)",
                      color:
                        "var(--color-text)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 mt-1">
              {perangkat.map((p) => {
                const Icon =
                  p.name === "Desktop"
                    ? Laptop
                    : p.name === "Mobile"
                    ? Smartphone
                    : Tablet;

                return (
                  <div
                    key={p.name}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="flex items-center gap-1.5 theme-text-secondary">
                      <Icon
                        size={12}
                        style={{
                          color: p.color,
                        }}
                      />
                      {p.name}
                    </span>

                    <span className="font-semibold theme-text-secondary">
                      {p.value}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ======================================================
            POLA AKTIVITAS MINGGUAN
        ====================================================== */}

        <div
          className={`theme-card rounded-xl border theme-border ${themeCardShadow} p-4 sm:p-5`}
        >
          <h3 className="text-sm font-semibold theme-text-secondary flex items-center gap-2 mb-1">
            <Flame
              size={15}
              className="theme-text-muted"
            />
            Pola Aktivitas per Hari
          </h3>

          <p className="text-xs theme-text-muted mb-3">
            Rata-rata jumlah sesi login, 4 minggu terakhir
          </p>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={polaMingguan}
                margin={{
                  top: 4,
                  right: 8,
                  left: -18,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border-soft)"
                  vertical={false}
                />

                <XAxis
                  dataKey="hari"
                  tick={{
                    fontSize: 11,
                    fill: "var(--color-text-muted)",
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{
                    fontSize: 11,
                    fill: "var(--color-text-muted)",
                  }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />

                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border:
                      "1px solid var(--color-border)",
                    background:
                      "var(--color-card)",
                    color:
                      "var(--color-text)",
                  }}
                  cursor={{
                    fill:
                      "color-mix(in_srgb,var(--color-text)_5%,transparent)",
                  }}
                />

                <Bar
                  dataKey="sesi"
                  name="Jumlah sesi"
                  radius={[6, 6, 0, 0]}
                >
                  {polaMingguan.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={
                        idx === 5 || idx === 6
                          ? "color-mix(in_srgb,var(--color-text)_22%,transparent)"
                          : "var(--color-primary)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ======================================================
            KONTEN TERPOPULER + GURU TERAKTIF
        ====================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* KONTEN */}
          <div
            className={`theme-card rounded-xl border theme-border ${themeCardShadow} p-4 sm:p-5`}
          >
            <h3 className="text-sm font-semibold theme-text-secondary flex items-center gap-2 mb-3">
              <Eye
                size={15}
                className="theme-text-muted"
              />
              Konten Paling Banyak Diakses
            </h3>

            <div className="space-y-1">
              {topKonten.map((k, idx) => {
                const Icon =
                  kontenIcon[k.tipe] || FileText;

                return (
                  <div
                    key={k.judul}
                    className={`flex items-center gap-3 py-2.5 border-b ${themeDivider} last:border-0`}
                  >
                    <span className="text-xs font-semibold theme-text-muted w-4 flex-shrink-0">
                      {idx + 1}
                    </span>

                    <div
                      className={`p-1.5 rounded-md ${themePrimarySoft} text-[var(--color-primary)] flex-shrink-0`}
                    >
                      <Icon size={13} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium theme-text-secondary truncate">
                        {k.judul}
                      </p>

                      <p className="text-[11px] theme-text-muted">
                        {k.mapel}
                      </p>
                    </div>

                    <span className="text-xs font-semibold theme-text-secondary flex-shrink-0">
                      {k.dilihat.toLocaleString("id-ID")}x
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* GURU */}
          <div
            className={`theme-card rounded-xl border theme-border ${themeCardShadow} p-4 sm:p-5`}
          >
            <h3 className="text-sm font-semibold theme-text-secondary flex items-center gap-2 mb-3">
              <UploadCloud
                size={15}
                className="theme-text-muted"
              />
              Guru Paling Aktif Mengunggah Konten
            </h3>

            <div className="space-y-1">
              {topGuru.map((g, idx) => (
                <div
                  key={g.nama}
                  className={`flex items-center gap-3 py-2.5 border-b ${themeDivider} last:border-0`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      idx === 0
                        ? `${themeWarningSurface} text-[var(--color-warning)]`
                        : `${themeNeutralSurface} theme-text-muted`
                    }`}
                  >
                    {idx === 0 ? (
                      <Trophy size={13} />
                    ) : (
                      g.avatar
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium theme-text-secondary truncate">
                      {g.nama}
                    </p>

                    <p className="text-[11px] theme-text-muted truncate">
                      {g.sekolah}
                    </p>
                  </div>

                  <span className="text-xs font-semibold theme-text-secondary flex-shrink-0">
                    {g.konten} konten
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ======================================================
            ENGAGEMENT PER UNIT SEKOLAH
        ====================================================== */}

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold theme-text-secondary">
              Engagement LMS per Unit Sekolah
            </h3>

            <span className="text-xs theme-text-muted flex items-center gap-1.5">
              <CalendarDays size={12} />
              {periode} &middot; {filteredSekolah.length} unit
            </span>
          </div>

          {filteredSekolah.length === 0 ? (
            <div
              className={`theme-card rounded-xl border theme-border ${themeCardShadow} p-10 text-center`}
            >
              <School
                size={28}
                className="mx-auto theme-text-muted mb-2"
              />

              <p className="text-sm theme-text-muted">
                Tidak ada unit sekolah yang cocok dengan
                filter.
              </p>
            </div>
          ) : (
            <div
              className={`theme-card rounded-xl border theme-border ${themeCardShadow} overflow-hidden`}
            >
              <div
                className={`divide-y ${themeDivider}`}
              >
                {filteredSekolah.map((s) => (
                  <div
                    key={s.id}
                    className={`flex flex-col lg:flex-row lg:items-center gap-4 p-4 sm:p-5 ${themeNeutralHover} transition-colors`}
                  >
                    {/* IDENTITAS */}
                    <div className="flex items-center gap-3 lg:w-[220px] flex-shrink-0 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg ${themePrimaryGradient} text-[var(--color-card)] flex items-center justify-center flex-shrink-0`}
                      >
                        <School size={16} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold theme-text truncate">
                          {s.nama}
                        </p>

                        <p className="text-xs theme-text-muted">
                          {s.jenjang}
                        </p>
                      </div>
                    </div>

                    {/* ADOPSI */}
                    <div className="flex-1 min-w-[130px]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-medium theme-text-muted uppercase tracking-wide">
                          Adopsi
                        </span>

                        <span className="text-xs font-semibold theme-text-secondary">
                          {s.adopsi}%
                        </span>
                      </div>

                      <div
                        className={`h-2 rounded-full ${themeNeutralSurface} overflow-hidden`}
                      >
                        <div
                          className={`h-full rounded-full ${barColor(
                            s.adopsi
                          )}`}
                          style={{
                            width: `${s.adopsi}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* ENGAGEMENT */}
                    <div className="flex-1 min-w-[150px]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-medium theme-text-muted uppercase tracking-wide">
                          Engagement
                        </span>

                        <span className="flex items-center gap-1 text-xs font-semibold theme-text-secondary">
                          {s.engagement}

                          {s.trend === "up" ? (
                            <TrendingUp
                              size={12}
                              className="text-[var(--color-success)]"
                            />
                          ) : s.trend === "down" ? (
                            <TrendingDown
                              size={12}
                              className="text-[var(--color-warning)]"
                            />
                          ) : (
                            <Minus
                              size={12}
                              className="theme-text-muted"
                            />
                          )}

                          <span
                            className={
                              s.perubahan >= 0
                                ? "text-[var(--color-success)]"
                                : "text-[var(--color-warning)]"
                            }
                          >
                            ({s.perubahan >= 0 ? "+" : ""}
                            {s.perubahan})
                          </span>
                        </span>
                      </div>

                      <div
                        className={`h-2 rounded-full ${themeNeutralSurface} overflow-hidden`}
                      >
                        <div
                          className={`h-full rounded-full ${barColor(
                            s.engagement
                          )}`}
                          style={{
                            width: `${s.engagement}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* METRIK PENDUKUNG */}
                    <div className="flex-shrink-0 lg:w-[220px] flex items-center gap-4">
                      <div>
                        <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wide mb-1">
                          Login/Minggu
                        </p>

                        <p className="text-xs font-semibold theme-text-secondary">
                          {s.loginPerMinggu}x
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-medium theme-text-muted uppercase tracking-wide mb-1">
                          Tugas Tepat Waktu
                        </p>

                        <p className="text-xs font-semibold theme-text-secondary">
                          {s.tugasTepatWaktu}%
                        </p>
                      </div>
                    </div>

                    {/* STATUS */}
                    <div className="flex items-center justify-between gap-3 lg:w-[150px] flex-shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full border ${statusStyle(
                          s.status
                        )}`}
                      >
                        {s.status}
                      </span>

                      <button
                        type="button"
                        className={`p-1.5 rounded-md theme-text-muted hover:text-[var(--color-primary)] ${themeNeutralHover} transition-colors flex-shrink-0`}
                        aria-label={`Lihat ${s.nama}`}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}