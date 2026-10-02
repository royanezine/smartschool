"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";

import {
  ArrowRight,
  ArrowUpRight,
  BellRing,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  Crown,
  FileText,
  History,
  Info,
  Layers3,
  Package,
  Receipt,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
  Zap,
} from "lucide-react";

/* =========================================================
   DUMMY DATA
========================================================= */

const CURRENT_PLAN = {
  name: "Professional",
  description:
    "Paket lengkap untuk sekolah yang membutuhkan pengelolaan akademik dan operasional secara terintegrasi.",
  price: 249000,
  billing: "bulan",
  startDate: "01 September 2026",
  endDate: "30 September 2026",
  status: "Aktif",
  invoice: "INV-SS-2026-09001",
};

const USAGE = [
  {
    label: "Pengguna",
    used: 742,
    limit: 1000,
    icon: Users,
    tone: "blue",
  },
  {
    label: "Penyimpanan",
    used: 68,
    limit: 100,
    suffix: " GB",
    icon: Layers3,
    tone: "violet",
  },
  {
    label: "Guru",
    used: 54,
    limit: 100,
    icon: Users,
    tone: "indigo",
  },
  {
    label: "Kelas",
    used: 24,
    limit: 40,
    icon: Package,
    tone: "emerald",
  },
];

const FEATURES = [
  "Manajemen siswa & guru",
  "Akademik dan jadwal pelajaran",
  "Presensi siswa & guru",
  "Keuangan & SPP",
  "LMS & CBT",
  "E-Raport",
  "Bimbingan Konseling",
  "Perpustakaan Digital",
  "Sarpras sekolah",
  "SPMB",
];

const PLANS = [
  {
    name: "Starter",
    description: "Untuk sekolah yang baru memulai digitalisasi.",
    price: 99000,
    color: "slate",
    popular: false,
    features: [
      "Manajemen siswa & guru",
      "Akademik dasar",
      "Presensi",
      "Jadwal pelajaran",
      "Laporan dasar",
    ],
  },
  {
    name: "Professional",
    description: "Solusi lengkap untuk operasional sekolah.",
    price: 249000,
    color: "blue",
    popular: true,
    features: [
      "Semua fitur Starter",
      "LMS & CBT",
      "E-Raport",
      "Keuangan & SPP",
      "BK",
      "Perpustakaan Digital",
      "Sarpras",
    ],
  },
  {
    name: "Enterprise",
    description: "Untuk sekolah dengan kebutuhan dan skala lebih besar.",
    price: 499000,
    color: "indigo",
    popular: false,
    features: [
      "Semua fitur Professional",
      "Kapasitas lebih besar",
      "Multi-unit sekolah",
      "Prioritas support",
      "Laporan lanjutan",
      "Integrasi khusus",
    ],
  },
];

const PAYMENT_HISTORY = [
  {
    invoice: "INV-SS-2026-09001",
    date: "01 September 2026",
    plan: "Professional",
    amount: 249000,
    status: "Lunas",
  },
  {
    invoice: "INV-SS-2026-08001",
    date: "01 Agustus 2026",
    plan: "Professional",
    amount: 249000,
    status: "Lunas",
  },
  {
    invoice: "INV-SS-2026-07001",
    date: "01 Juli 2026",
    plan: "Professional",
    amount: 249000,
    status: "Lunas",
  },
];

const toneMap = {
  blue: {
    bg: "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]",
    text: "text-[var(--color-primary)]",
    border:
      "border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]",
    bar: "bg-[var(--color-primary)]",
  },

  violet: {
    bg: "bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]",
    text: "text-[var(--color-primary)]",
    border:
      "border-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]",
    bar: "bg-[var(--color-primary)]",
  },

  indigo: {
    bg: "bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]",
    text: "text-[var(--color-primary)]",
    border:
      "border-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]",
    bar: "bg-[var(--color-primary)]",
  },

  emerald: {
    bg: "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]",
    text: "text-[var(--color-success)]",
    border:
      "border-[color-mix(in_srgb,var(--color-success)_20%,transparent)]",
    bar: "bg-[var(--color-success)]",
  },
};

/* =========================================================
   THEME HELPERS
========================================================= */

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]";

const themePrimaryHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";

const themeTextHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themePrimaryShadow =
  "shadow-[0_10px_25px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]";

const themeCardShadow =
  "shadow-[0_8px_30px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";

const themeCardHoverShadow =
  "hover:shadow-[0_15px_40px_color-mix(in_srgb,var(--color-primary)_10%,transparent)]";

/* =========================================================
   HELPERS
========================================================= */

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

/* =========================================================
   USAGE CARD
========================================================= */

function UsageCard({ item }) {
  const Icon = item.icon;
  const theme = toneMap[item.tone] || toneMap.blue;

  const percentage = Math.min(
    Math.round((item.used / item.limit) * 100),
    100
  );

  const displayUsed = `${item.used}${item.suffix || ""}`;
  const displayLimit = `${item.limit}${item.suffix || ""}`;

  return (
    <div
      className={`group theme-card theme-border rounded-2xl border p-5 ${themeCardShadow} transition-all duration-300 hover:-translate-y-0.5 ${themeCardHoverShadow}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${theme.bg} ${theme.text}`}
        >
          <Icon size={19} strokeWidth={1.8} />
        </div>

        <span className="text-xs font-semibold theme-text-muted">
          {percentage}%
        </span>
      </div>

      <p className="mt-4 text-sm font-semibold theme-text-secondary">
        {item.label}
      </p>

      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-xl font-bold theme-text">
          {displayUsed}
        </span>

        <span className="text-xs theme-text-placeholder">
          / {displayLimit}
        </span>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full theme-card-soft">
        <div
          className={`h-full rounded-full ${theme.bar} transition-all duration-700`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="mt-2 text-[10px] theme-text-placeholder">
        Penggunaan paket saat ini
      </p>
    </div>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const isActive =
    status === "Aktif" || status === "Lunas";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold border ${
        isActive
          ? "theme-success"
          : "theme-warning"
      }`}
    >
      {isActive ? (
        <CheckCircle2 size={12} />
      ) : (
        <Clock3 size={12} />
      )}

      {status}
    </span>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function LanggananPage() {
  const [billingMode, setBillingMode] = useState("bulanan");

  const daysRemaining = 20;

  const currentPlan = useMemo(
    () =>
      PLANS.find(
        (plan) => plan.name === CURRENT_PLAN.name
      ),
    []
  );

  return (
    <div className="flex h-screen min-h-0 overflow-hidden theme-page">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar
        role="admin"
        active="langganan"
        setActive={() => {}}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* ===================================================
            HEADER
        =================================================== */}

        <Header
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AS",
          }}
        />

        <main className="min-h-0 flex-1 overflow-y-auto theme-page">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">

            {/* =================================================
                HERO
            ================================================== */}

            <section
              className="
                relative
                mb-6
                overflow-hidden
                rounded-[28px]
                bg-[var(--color-primary)]
                shadow-[0_20px_55px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]
              "
            >
              <div
                className="
                  absolute
                  -right-20
                  -top-28
                  h-80
                  w-80
                  rounded-full
                  bg-white/10
                  blur-3xl
                "
              />

              <div
                className="
                  absolute
                  -bottom-40
                  left-1/3
                  h-96
                  w-96
                  rounded-full
                  bg-white/5
                  blur-3xl
                "
              />

              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
                  backgroundSize: "34px 34px",
                }}
              />

              <div className="relative grid gap-8 px-6 py-7 sm:px-8 sm:py-8 lg:grid-cols-[1fr_400px] lg:px-10 lg:py-9">

                {/* HERO LEFT */}

                <div className="flex flex-col justify-center">
                  <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                    <Crown size={13} />
                    SmartSchool Subscription
                  </div>

                  <h1 className="max-w-2xl text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-[38px] lg:leading-tight">
                    Langganan SmartSchool
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75 sm:text-[15px]">
                    Kelola paket sekolah, masa berlangganan, penggunaan fitur,
                    pembayaran, dan invoice dalam satu tempat.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href="/admin/langganan/paket"
                      className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-xl
                        bg-white
                        px-4
                        py-2.5
                        text-sm
                        font-semibold
                        text-[var(--color-primary)]
                        shadow-lg
                        shadow-black/10
                        transition
                        hover:-translate-y-0.5
                        hover:bg-white/90
                      "
                    >
                      <Package size={17} />
                      Lihat Paket
                    </Link>

                    <Link
                      href="/admin/langganan/riwayat"
                      className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-xl
                        border
                        border-white/15
                        bg-white/10
                        px-4
                        py-2.5
                        text-sm
                        font-semibold
                        text-white
                        backdrop-blur-md
                        transition
                        hover:bg-white/15
                      "
                    >
                      <History size={17} />
                      Riwayat Pembayaran
                    </Link>
                  </div>
                </div>

                {/* CURRENT PLAN */}

                <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-5 backdrop-blur-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-white/55">
                        Paket aktif
                      </p>

                      <div className="mt-1 flex items-center gap-2">
                        <h2 className="text-xl font-bold text-white">
                          {CURRENT_PLAN.name}
                        </h2>

                        <span className="rounded-full bg-white/10 px-2 py-1 text-[9px] font-bold text-white">
                          AKTIF
                        </span>
                      </div>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                      <Crown size={20} />
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="text-2xl font-bold text-white">
                      {formatRupiah(CURRENT_PLAN.price)}

                      <span className="ml-1 text-xs font-medium text-white/45">
                        / {CURRENT_PLAN.billing}
                      </span>
                    </p>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white/[0.06] p-3">
                      <p className="text-[10px] text-white/45">
                        Berlaku sampai
                      </p>

                      <p className="mt-1 text-xs font-semibold text-white">
                        {CURRENT_PLAN.endDate}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white/[0.06] p-3">
                      <p className="text-[10px] text-white/45">
                        Sisa masa aktif
                      </p>

                      <p className="mt-1 text-xs font-semibold text-white">
                        {daysRemaining} hari
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                QUICK NAVIGATION
            ================================================== */}

            <section className="mb-7 grid gap-4 sm:grid-cols-3">

              {/* PACKAGE */}

              <Link
                href="/admin/langganan/paket"
                className={`group theme-card theme-border rounded-2xl border p-5 ${themeCardShadow} transition ${themeCardHoverShadow} hover:-translate-y-0.5`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}
                  >
                    <Package size={19} />
                  </div>

                  <ArrowUpRight
                    size={17}
                    className="theme-text-placeholder transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)]"
                  />
                </div>

                <p className="mt-4 text-sm font-bold theme-text">
                  Paket Langganan
                </p>

                <p className="mt-1 text-xs leading-5 theme-text-secondary">
                  Bandingkan paket dan fitur SmartSchool.
                </p>
              </Link>

              {/* HISTORY */}

              <Link
                href="/admin/langganan/riwayat"
                className={`group theme-card theme-border rounded-2xl border p-5 ${themeCardShadow} transition ${themeCardHoverShadow} hover:-translate-y-0.5`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}
                  >
                    <History size={19} />
                  </div>

                  <ArrowUpRight
                    size={17}
                    className="theme-text-placeholder transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)]"
                  />
                </div>

                <p className="mt-4 text-sm font-bold theme-text">
                  Riwayat Pembayaran
                </p>

                <p className="mt-1 text-xs leading-5 theme-text-secondary">
                  Lihat seluruh transaksi pembayaran sekolah.
                </p>
              </Link>

              {/* INVOICE */}

              <Link
                href="/admin/langganan/invoice"
                className={`group theme-card theme-border rounded-2xl border p-5 ${themeCardShadow} transition ${themeCardHoverShadow} hover:-translate-y-0.5`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}
                  >
                    <Receipt size={19} />
                  </div>

                  <ArrowUpRight
                    size={17}
                    className="theme-text-placeholder transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--color-primary)]"
                  />
                </div>

                <p className="mt-4 text-sm font-bold theme-text">
                  Tagihan / Invoice
                </p>

                <p className="mt-1 text-xs leading-5 theme-text-secondary">
                  Kelola tagihan dan unduh invoice pembayaran.
                </p>
              </Link>
            </section>

            {/* =================================================
                PLAN STATUS + BILLING
            ================================================== */}

            <section className="mb-7 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">

              {/* CURRENT PLAN DETAIL */}

              <div
                className={`overflow-hidden theme-card theme-border rounded-2xl border ${themeCardShadow}`}
              >
                <div className="theme-border-soft border-b px-5 py-5 sm:px-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                        Paket aktif
                      </p>

                      <h2 className="mt-1 text-lg font-bold theme-text">
                        {CURRENT_PLAN.name}
                      </h2>

                      <p className="mt-1 text-sm theme-text-secondary">
                        {CURRENT_PLAN.description}
                      </p>
                    </div>

                    <StatusBadge status={CURRENT_PLAN.status} />
                  </div>
                </div>

                <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                  <div className="theme-card-soft rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <CalendarDays
                        size={16}
                        className="text-[var(--color-primary)]"
                      />

                      <span className="text-xs font-semibold theme-text-secondary">
                        Periode Langganan
                      </span>
                    </div>

                    <p className="mt-3 text-sm font-bold theme-text">
                      {CURRENT_PLAN.startDate}
                    </p>

                    <p className="mt-1 text-xs theme-text-placeholder">
                      sampai {CURRENT_PLAN.endDate}
                    </p>
                  </div>

                  <div className="theme-card-soft rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <CreditCard
                        size={16}
                        className="text-[var(--color-primary)]"
                      />

                      <span className="text-xs font-semibold theme-text-secondary">
                        Biaya Langganan
                      </span>
                    </div>

                    <p className="mt-3 text-sm font-bold theme-text">
                      {formatRupiah(CURRENT_PLAN.price)}
                    </p>

                    <p className="mt-1 text-xs theme-text-placeholder">
                      Pembayaran setiap bulan
                    </p>
                  </div>
                </div>

                <div
                  className={`mx-5 mb-5 rounded-xl border ${themePrimarySoftBorder} ${themePrimarySoft} p-4 sm:mx-6 sm:mb-6`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg theme-card text-[var(--color-primary)] ${themeCardShadow}`}
                    >
                      <BellRing size={15} />
                    </div>

                    <div>
                      <p className="text-xs font-bold theme-text">
                        Langganan akan segera berakhir
                      </p>

                      <p className="mt-1 text-[11px] leading-5 theme-text-secondary">
                        Paket kamu akan berakhir dalam{" "}
                        <strong className="text-[var(--color-primary)]">
                          {daysRemaining} hari
                        </strong>
                        . Pastikan langganan diperpanjang agar seluruh fitur
                        tetap dapat digunakan.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="theme-border-soft flex flex-col gap-2 border-t p-5 sm:flex-row sm:justify-end sm:px-6">
                  <Link
                    href="/admin/langganan/paket"
                    className={`inline-flex items-center justify-center gap-2 rounded-xl border theme-border theme-card px-4 py-2.5 text-xs font-semibold theme-text-secondary transition ${themeTextHover} hover:text-[var(--color-primary)]`}
                  >
                    Lihat Paket
                  </Link>

                  <Link
                    href="/admin/langganan/invoice"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:brightness-95"
                  >
                    <CreditCard size={15} />
                    Perpanjang Langganan
                  </Link>
                </div>
              </div>

              {/* NEXT PAYMENT */}

              <div
                className={`theme-card theme-border rounded-2xl border p-5 ${themeCardShadow} sm:p-6`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                      Pembayaran berikutnya
                    </p>

                    <h2 className="mt-1 text-lg font-bold theme-text">
                      Ringkasan Tagihan
                    </h2>
                  </div>

                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}
                  >
                    <WalletCards size={19} />
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-[var(--color-primary)] p-5">
                  <p className="text-xs text-white/55">
                    Total pembayaran
                  </p>

                  <p className="mt-2 text-2xl font-bold text-white">
                    {formatRupiah(CURRENT_PLAN.price)}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                    <div>
                      <p className="text-[10px] text-white/45">
                        Tanggal tagihan
                      </p>

                      <p className="mt-1 text-xs font-semibold text-white">
                        01 Oktober 2026
                      </p>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white">
                      <CalendarDays size={16} />
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="theme-text-secondary">
                      Paket
                    </span>

                    <span className="font-semibold theme-text">
                      Professional
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="theme-text-secondary">
                      Siklus
                    </span>

                    <span className="font-semibold theme-text">
                      Bulanan
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="theme-text-secondary">
                      Invoice
                    </span>

                    <span className="font-semibold text-[var(--color-primary)]">
                      {CURRENT_PLAN.invoice}
                    </span>
                  </div>
                </div>

                <Link
                  href="/admin/langganan/invoice"
                  className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl border theme-border theme-card px-4 py-2.5 text-xs font-semibold theme-text-secondary transition ${themeTextHover} hover:text-[var(--color-primary)]`}
                >
                  <FileText size={15} />
                  Lihat Invoice
                </Link>
              </div>
            </section>

            {/* =================================================
                USAGE
            ================================================== */}

            <section className="mb-7">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                    Penggunaan
                  </p>

                  <h2 className="mt-1 text-lg font-bold theme-text">
                    Penggunaan paket
                  </h2>

                  <p className="mt-1 text-sm theme-text-secondary">
                    Pantau penggunaan resource sekolah dalam paket aktif.
                  </p>
                </div>

                <div className="inline-flex w-fit items-center gap-2 rounded-xl theme-success px-3 py-2 text-[11px] font-semibold">
                  <CheckCircle2 size={13} />
                  Semua resource aman
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {USAGE.map((item) => (
                  <UsageCard
                    key={item.label}
                    item={item}
                  />
                ))}
              </div>
            </section>

            {/* =================================================
                FEATURES
            ================================================== */}

            <section className="mb-7 grid gap-5 lg:grid-cols-[.8fr_1.2fr]">

              {/* FEATURE SUMMARY */}

              <div className="relative overflow-hidden rounded-2xl bg-[var(--color-primary)] p-6 text-white shadow-[0_16px_45px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]">
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

                <div className="relative">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <Zap size={19} />
                  </div>

                  <h2 className="mt-5 text-xl font-bold">
                    Fitur Professional
                  </h2>

                  <p className="mt-2 text-xs leading-5 text-white/75">
                    Semua kebutuhan utama sekolah tersedia dalam satu
                    platform SmartSchool.
                  </p>

                  <div className="mt-6 flex items-end gap-2">
                    <span className="text-3xl font-bold">
                      {FEATURES.length}
                    </span>

                    <span className="pb-1 text-xs text-white/60">
                      modul aktif
                    </span>
                  </div>

                  <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.08] p-4">
                    <div className="flex items-start gap-3">
                      <ShieldCheck
                        size={17}
                        className="mt-0.5 shrink-0 text-white/80"
                      />

                      <p className="text-[11px] leading-5 text-white/75">
                        Paket aktif memberikan akses ke berbagai modul
                        akademik dan operasional sekolah.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FEATURE LIST */}

              <div
                className={`theme-card theme-border rounded-2xl border p-5 ${themeCardShadow} sm:p-6`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                      Modul tersedia
                    </p>

                    <h2 className="mt-1 text-lg font-bold theme-text">
                      Fitur yang termasuk
                    </h2>
                  </div>

                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}
                  >
                    <Sparkles size={18} />
                  </div>
                </div>

                <div className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {FEATURES.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-2.5"
                    >
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full theme-success">
                        <Check size={12} strokeWidth={3} />
                      </div>

                      <span className="text-xs font-medium theme-text-secondary">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="theme-border-soft mt-6 border-t pt-5">
                  <Link
                    href="/admin/langganan/paket"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)]"
                  >
                    Bandingkan semua paket
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </section>

            {/* =================================================
                PAYMENT HISTORY
            ================================================== */}

            <section
              className={`mb-7 theme-card theme-border rounded-2xl border ${themeCardShadow}`}
            >
              <div className="theme-border-soft flex flex-col gap-4 border-b px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                    Pembayaran
                  </p>

                  <h2 className="mt-1 text-lg font-bold theme-text">
                    Riwayat pembayaran
                  </h2>

                  <p className="mt-1 text-sm theme-text-secondary">
                    Beberapa transaksi pembayaran terakhir.
                  </p>
                </div>

                <Link
                  href="/admin/langganan/riwayat"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)]"
                >
                  Lihat semua
                  <ChevronRight size={14} />
                </Link>
              </div>

              {/* DESKTOP TABLE */}

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="theme-card-soft theme-border-soft border-b">
                      <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider theme-text-muted">
                        Invoice
                      </th>

                      <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider theme-text-muted">
                        Tanggal
                      </th>

                      <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider theme-text-muted">
                        Paket
                      </th>

                      <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider theme-text-muted">
                        Jumlah
                      </th>

                      <th className="px-6 py-3 text-center text-[10px] font-bold uppercase tracking-wider theme-text-muted">
                        Status
                      </th>

                      <th className="px-6 py-3 text-center text-[10px] font-bold uppercase tracking-wider theme-text-muted">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {PAYMENT_HISTORY.map((item) => (
                      <tr
                        key={item.invoice}
                        className={`theme-border-soft border-b last:border-0 transition ${themePrimaryHover}`}
                      >
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-[var(--color-primary)]">
                            {item.invoice}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-xs theme-text-secondary">
                          {item.date}
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-xs font-semibold theme-text-secondary">
                            {item.plan}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right text-xs font-bold theme-text">
                          {formatRupiah(item.amount)}
                        </td>

                        <td className="px-6 py-4 text-center">
                          <StatusBadge status={item.status} />
                        </td>

                        <td className="px-6 py-4 text-center">
                          <Link
                            href={`/admin/langganan/invoice?id=${item.invoice}`}
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg theme-text-placeholder transition ${themePrimarySoft} hover:text-[var(--color-primary)]`}
                            title="Lihat invoice"
                          >
                            <FileText size={15} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE */}

              <div className="theme-border-soft divide-y md:hidden">
                {PAYMENT_HISTORY.map((item) => (
                  <div
                    key={item.invoice}
                    className="p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-[var(--color-primary)]">
                          {item.invoice}
                        </p>

                        <p className="mt-1 text-[11px] theme-text-placeholder">
                          {item.date}
                        </p>
                      </div>

                      <StatusBadge status={item.status} />
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] theme-text-placeholder">
                          Paket
                        </p>

                        <p className="mt-1 text-xs font-semibold theme-text-secondary">
                          {item.plan}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] theme-text-placeholder">
                          Jumlah
                        </p>

                        <p className="mt-1 text-xs font-bold theme-text">
                          {formatRupiah(item.amount)}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/admin/langganan/invoice?id=${item.invoice}`}
                      className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl border theme-border theme-card px-3 py-2.5 text-xs font-semibold theme-text-secondary transition ${themeTextHover} hover:text-[var(--color-primary)]`}
                    >
                      <FileText size={14} />
                      Lihat Invoice
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            {/* =================================================
                PLAN COMPARISON
            ================================================== */}

            <section className="mb-7">
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                    Upgrade
                  </p>

                  <h2 className="mt-1 text-lg font-bold theme-text">
                    Pilihan paket SmartSchool
                  </h2>

                  <p className="mt-1 text-sm theme-text-secondary">
                    Pilih paket yang paling sesuai dengan kebutuhan sekolah.
                  </p>
                </div>

                {/* BILLING SWITCH */}

                <div className="inline-flex w-fit items-center rounded-xl theme-card-soft p-1">
                  <button
                    type="button"
                    onClick={() => setBillingMode("bulanan")}
                    className={`rounded-lg px-3 py-2 text-[11px] font-semibold transition ${
                      billingMode === "bulanan"
                        ? `${themePrimarySoft} text-[var(--color-primary)]`
                        : "theme-text-muted"
                    }`}
                  >
                    Bulanan
                  </button>

                  <button
                    type="button"
                    onClick={() => setBillingMode("tahunan")}
                    className={`rounded-lg px-3 py-2 text-[11px] font-semibold transition ${
                      billingMode === "tahunan"
                        ? `${themePrimarySoft} text-[var(--color-primary)]`
                        : "theme-text-muted"
                    }`}
                  >
                    Tahunan
                  </button>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-3">
                {PLANS.map((plan) => {
                  const isCurrent =
                    plan.name === CURRENT_PLAN.name;

                  const isPopular = plan.popular;

                  return (
                    <div
                      key={plan.name}
                      className={`relative overflow-hidden rounded-2xl border theme-card p-6 ${themeCardShadow} transition-all duration-300 hover:-translate-y-1 ${themeCardHoverShadow} ${
                        isCurrent
                          ? "border-[var(--color-primary)] ring-1 ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]"
                          : "theme-border"
                      }`}
                    >
                      {/* POPULAR */}

                      {isPopular && (
                        <div
                          className={`absolute right-4 top-4 inline-flex items-center gap-1 rounded-full ${themePrimarySoft} px-2.5 py-1 text-[9px] font-bold text-[var(--color-primary)]`}
                        >
                          <Sparkles size={10} />
                          POPULER
                        </div>
                      )}

                      {/* PLAN ICON */}

                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}
                      >
                        {plan.name === "Starter" ? (
                          <Package size={20} />
                        ) : plan.name === "Professional" ? (
                          <Rocket size={20} />
                        ) : (
                          <Crown size={20} />
                        )}
                      </div>

                      <div className="mt-5">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold theme-text">
                            {plan.name}
                          </h3>

                          {isCurrent && (
                            <span className="theme-success rounded-full px-2 py-1 text-[9px] font-bold">
                              AKTIF
                            </span>
                          )}
                        </div>

                        <p className="mt-2 min-h-[40px] text-xs leading-5 theme-text-secondary">
                          {plan.description}
                        </p>

                        <div className="mt-5">
                          <span className="text-2xl font-bold theme-text">
                            {formatRupiah(
                              billingMode === "tahunan"
                                ? plan.price * 10
                                : plan.price
                            )}
                          </span>

                          <span className="ml-1 text-xs theme-text-placeholder">
                            /{" "}
                            {billingMode === "tahunan"
                              ? "tahun"
                              : "bulan"}
                          </span>
                        </div>
                      </div>

                      <div className="theme-border-soft my-6 border-t" />

                      <div className="space-y-3">
                        {plan.features.map((feature) => (
                          <div
                            key={feature}
                            className="flex items-start gap-2.5"
                          >
                            <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full theme-success">
                              <Check
                                size={10}
                                strokeWidth={3}
                              />
                            </div>

                            <span className="text-xs theme-text-secondary">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* PLAN BUTTON */}

                      <button
                        type="button"
                        disabled={isCurrent}
                        className={`mt-7 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                          isCurrent
                            ? "cursor-default theme-card-soft theme-text-placeholder"
                            : plan.name === "Professional"
                            ? "bg-[var(--color-primary)] text-white hover:brightness-95"
                            : "border theme-border theme-card theme-text-secondary hover:text-[var(--color-primary)]"
                        }`}
                      >
                        {isCurrent ? (
                          <>
                            <CheckCircle2 size={14} />
                            Paket Saat Ini
                          </>
                        ) : (
                          <>
                            Pilih Paket
                            <ArrowRight size={14} />
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* =================================================
                INFORMATION
            ================================================== */}

            <section className="mb-7 grid gap-5 md:grid-cols-3">

              {/* SECURITY */}

              <div
                className={`theme-card theme-border rounded-2xl border p-5 ${themeCardShadow}`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}
                >
                  <ShieldCheck size={19} />
                </div>

                <h3 className="mt-4 text-sm font-bold theme-text">
                  Data tetap aman
                </h3>

                <p className="mt-1.5 text-xs leading-5 theme-text-secondary">
                  Data sekolah dan aktivitas pengguna dikelola dalam sistem
                  yang terintegrasi.
                </p>
              </div>

              {/* RENEWAL */}

              <div
                className={`theme-card theme-border rounded-2xl border p-5 ${themeCardShadow}`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}
                >
                  <RefreshCw size={19} />
                </div>

                <h3 className="mt-4 text-sm font-bold theme-text">
                  Perpanjangan mudah
                </h3>

                <p className="mt-1.5 text-xs leading-5 theme-text-secondary">
                  Perpanjang paket kapan saja tanpa perlu mengatur ulang data
                  sekolah.
                </p>
              </div>

              {/* HELP */}

              <div
                className={`theme-card theme-border rounded-2xl border p-5 ${themeCardShadow}`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft} text-[var(--color-primary)]`}
                >
                  <Info size={19} />
                </div>

                <h3 className="mt-4 text-sm font-bold theme-text">
                  Butuh bantuan?
                </h3>

                <p className="mt-1.5 text-xs leading-5 theme-text-secondary">
                  Hubungi administrator SmartSchool jika ada masalah terkait
                  paket atau pembayaran.
                </p>
              </div>
            </section>

            {/* =================================================
                FOOTER
            ================================================== */}

            <div className="theme-border-soft flex flex-col gap-3 border-t py-5 text-xs theme-text-muted sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <WalletCards size={15} />

                <span>
                  SmartSchool · Manajemen Langganan
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2
                    size={13}
                    className="text-[var(--color-success)]"
                  />
                  Langganan aktif
                </span>

                <span>
                  Tahun Ajaran 2026/2027
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}