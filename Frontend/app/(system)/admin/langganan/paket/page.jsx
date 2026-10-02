"use client";

import { useMemo, useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  Package,
  CalendarDays,
  Clock3,
  CheckCircle2,
  Sparkles,
  Users,
  HardDrive,
  Boxes,
  Wallet,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  AlertCircle,
} from "lucide-react";

// ============================================================
// MOCK DATA - PAKET SEKOLAH
// ============================================================

const SCHOOL_PACKAGE = {
  id: 2,
  name: "Professional",
  description:
    "Paket lengkap untuk sekolah dengan kebutuhan akademik dan operasional.",

  monthlyPrice: 1500000,
  yearlyPrice: 15000000,

  billingCycle: "Bulanan",

  status: "Aktif",

  startDate: "2026-01-15",
  endDate: "2026-12-15",

  daysLeft: 100,

  limits: {
    users: 500,
    storage: 50,
    modules: 18,
  },

  usage: {
    usersUsed: 387,
    storageUsed: 32.5,
    modulesUsed: 16,
  },

  features: [
    "Semua fitur Starter",
    "Akademik dan penilaian",
    "Absensi",
    "Jadwal pelajaran",
    "Rapor digital",
    "Sarpras",
    "Laporan operasional",
  ],

  icon: Sparkles,
};

// ============================================================
// THEME HELPERS
// ============================================================

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

const themeFocus =
  "focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";

// ============================================================
// FORMATTERS
// ============================================================

const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (dateStr) => {
  const date = new Date(dateStr);

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// ============================================================
// STATUS BADGE
// ============================================================

function StatusBadge({ status }) {
  const config = {
    Aktif: {
      className: "theme-success",
      dot: "bg-[var(--color-success)]",
    },

    TidakAktif: {
      className: "theme-danger",
      dot: "bg-[var(--color-danger)]",
    },

    Expired: {
      className: "theme-danger",
      dot: "bg-[var(--color-danger)]",
    },
  };

  const current = config[status] || {
    className: "theme-text-muted theme-border",
    dot: "bg-[var(--color-text-muted)]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-semibold border ${current.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      {status}
    </span>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClass = "text-[var(--color-primary)]",
}) {
  return (
    <div className="theme-card theme-border rounded-xl border p-4 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium theme-text-muted tracking-wide">
            {title}
          </p>

          <p className="mt-1.5 text-xl sm:text-2xl font-bold theme-text truncate">
            {value}
          </p>

          {description && (
            <p className="mt-1 text-[10px] sm:text-xs theme-text-placeholder">
              {description}
            </p>
          )}
        </div>

        <div
          className={`w-9 h-9 shrink-0 rounded-lg ${themePrimarySoft} flex items-center justify-center`}
        >
          <Icon size={17} className={iconClass} />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// USAGE CARD
// ============================================================

function UsageCard({
  icon: Icon,
  label,
  used,
  limit,
  unit = "",
  percentage,
}) {
  return (
    <div className="theme-card theme-border rounded-xl border p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-lg ${themePrimarySoft} flex items-center justify-center`}
          >
            <Icon
              size={15}
              className="text-[var(--color-primary)]"
            />
          </div>

          <div>
            <p className="text-xs font-semibold theme-text-secondary">
              {label}
            </p>

            <p className="text-[10px] theme-text-placeholder mt-0.5">
              {used} / {limit} {unit}
            </p>
          </div>
        </div>

        <span className="text-xs font-bold theme-text-secondary">
          {percentage}%
        </span>
      </div>

      <div className="mt-4 h-2 rounded-full theme-card-soft overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-300"
          style={{
            width: `${Math.min(percentage, 100)}%`,
          }}
        />
      </div>
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function PaketSayaPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [billingCycle, setBillingCycle] = useState(
    SCHOOL_PACKAGE.billingCycle
  );

  const IconPaket = SCHOOL_PACKAGE.icon;

  const usageUsers = Math.round(
    (SCHOOL_PACKAGE.usage.usersUsed /
      SCHOOL_PACKAGE.limits.users) *
      100
  );

  const usageStorage = Math.round(
    (SCHOOL_PACKAGE.usage.storageUsed /
      SCHOOL_PACKAGE.limits.storage) *
      100
  );

  const usageModules = Math.round(
    (SCHOOL_PACKAGE.usage.modulesUsed /
      SCHOOL_PACKAGE.limits.modules) *
      100
  );

  const price = useMemo(() => {
    return billingCycle === "Bulanan"
      ? SCHOOL_PACKAGE.monthlyPrice
      : SCHOOL_PACKAGE.yearlyPrice;
  }, [billingCycle]);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="flex h-screen w-full theme-page overflow-hidden">
      {/* SIDEBAR */}
      <Sidebar
        active="paketLangganan"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      {/* CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* HEADER */}
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="flex-1 overflow-y-auto theme-page">
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* ==================================================
                PAGE HEADER
            ================================================== */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl ${themePrimarySoft} ${themePrimarySoftBorder} border text-[var(--color-primary)] ${themePrimaryShadow}`}
                >
                  <Package size={20} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold theme-text">
                    Paket Saya
                  </h1>

                  <p className="text-sm theme-text-secondary">
                    Informasi lengkap mengenai paket langganan sekolah Anda.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border theme-border theme-card theme-text-secondary text-sm font-semibold ${themeTextHover} transition-colors`}
              >
                <RefreshCw size={15} />
                Refresh
              </button>
            </div>

            {/* ==================================================
                SUMMARY
            ================================================== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                title="Paket Aktif"
                value={SCHOOL_PACKAGE.name}
                description="Paket yang sedang digunakan"
                icon={Package}
              />

              <StatCard
                title="Status"
                value={SCHOOL_PACKAGE.status}
                description="Langganan sekolah"
                icon={CheckCircle2}
                iconClass="text-[var(--color-success)]"
              />

              <StatCard
                title="Sisa Masa Aktif"
                value={`${SCHOOL_PACKAGE.daysLeft} Hari`}
                description="Sebelum masa paket berakhir"
                icon={CalendarDays}
              />

              <StatCard
                title="Tagihan"
                value={formatRupiah(price)}
                description={`Per ${billingCycle.toLowerCase()}`}
                icon={CreditCard}
              />
            </div>

            {/* ==================================================
                PACKAGE DETAIL
            ================================================== */}
            <section className="theme-card theme-border rounded-xl border shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)] overflow-hidden">
              <div className="p-5 sm:p-6">
                {/* HEADER PACKAGE */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 rounded-xl ${themePrimarySoft} ${themePrimarySoftBorder} border text-[var(--color-primary)] flex items-center justify-center ${themePrimaryShadow} shrink-0`}
                    >
                      <IconPaket size={27} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-bold theme-text">
                          {SCHOOL_PACKAGE.name}
                        </h2>

                        <StatusBadge status={SCHOOL_PACKAGE.status} />
                      </div>

                      <p className="text-sm theme-text-secondary mt-1.5 max-w-2xl">
                        {SCHOOL_PACKAGE.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:opacity-90 transition"
                    >
                      <Wallet size={15} />
                      Perpanjang
                    </button>

                    <button
                      type="button"
                      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border theme-border theme-card theme-text-secondary text-sm font-semibold ${themeTextHover} transition`}
                    >
                      <ArrowUpRight size={15} />
                      Upgrade
                    </button>
                  </div>
                </div>

                {/* ==================================================
                    BILLING
                ================================================== */}
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* PRICE */}
                  <div className="theme-card-soft theme-border rounded-xl border p-4">
                    <div className="flex items-center gap-2 theme-text-secondary">
                      <Wallet
                        size={15}
                        className="text-[var(--color-primary)]"
                      />

                      <span className="text-xs font-medium">
                        Harga Langganan
                      </span>
                    </div>

                    <p className="text-xl font-bold theme-text mt-2">
                      {formatRupiah(price)}
                    </p>

                    <div className="mt-3 inline-flex items-center gap-1 theme-card-soft theme-border border rounded-lg p-1">
                      {["Bulanan", "Tahunan"].map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setBillingCycle(item)}
                          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                            billingCycle === item
                              ? `${themePrimarySoft} text-[var(--color-primary)] ${themePrimarySoftBorder} border shadow-sm`
                              : `theme-text-muted ${themeTextHover}`
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ACTIVE PERIOD */}
                  <div className="theme-card-soft theme-border rounded-xl border p-4">
                    <div className="flex items-center gap-2 theme-text-secondary">
                      <CalendarDays
                        size={15}
                        className="text-[var(--color-primary)]"
                      />

                      <span className="text-xs font-medium">
                        Periode Aktif
                      </span>
                    </div>

                    <p className="text-sm font-bold theme-text mt-2">
                      {formatDate(SCHOOL_PACKAGE.startDate)}
                    </p>

                    <p className="text-xs theme-text-placeholder mt-1">
                      sampai
                    </p>

                    <p className="text-sm font-bold theme-text">
                      {formatDate(SCHOOL_PACKAGE.endDate)}
                    </p>
                  </div>

                  {/* ACTIVE DAYS */}
                  <div className="theme-card-soft theme-border rounded-xl border p-4">
                    <div className="flex items-center gap-2 theme-text-secondary">
                      <Clock3
                        size={15}
                        className="text-[var(--color-primary)]"
                      />

                      <span className="text-xs font-medium">
                        Masa Aktif
                      </span>
                    </div>

                    <p className="text-xl font-bold theme-text mt-2">
                      {SCHOOL_PACKAGE.daysLeft} Hari
                    </p>

                    <div className="mt-3 h-2 theme-card rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.max(
                            10,
                            Math.min(
                              100,
                              (SCHOOL_PACKAGE.daysLeft / 335) * 100
                            )
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* ==================================================
                    USAGE
                ================================================== */}
                <div className="mt-7">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold theme-text">
                        Penggunaan Paket
                      </h3>

                      <p className="text-xs theme-text-placeholder mt-1">
                        Pantau pemakaian resource sekolah.
                      </p>
                    </div>

                    <ShieldCheck
                      size={18}
                      className="text-[var(--color-primary)]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                    <UsageCard
                      icon={Users}
                      label="Pengguna"
                      used={SCHOOL_PACKAGE.usage.usersUsed}
                      limit={SCHOOL_PACKAGE.limits.users}
                      percentage={usageUsers}
                    />

                    <UsageCard
                      icon={HardDrive}
                      label="Storage"
                      used={SCHOOL_PACKAGE.usage.storageUsed}
                      limit={SCHOOL_PACKAGE.limits.storage}
                      unit="GB"
                      percentage={usageStorage}
                    />

                    <UsageCard
                      icon={Boxes}
                      label="Modul"
                      used={SCHOOL_PACKAGE.usage.modulesUsed}
                      limit={SCHOOL_PACKAGE.limits.modules}
                      percentage={usageModules}
                    />
                  </div>
                </div>

                {/* ==================================================
                    FEATURES
                ================================================== */}
                <div className="mt-7 theme-border-soft border-t pt-6">
                  <h3 className="text-sm font-bold theme-text">
                    Fitur yang Tersedia
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                    {SCHOOL_PACKAGE.features.map((feature) => (
                      <div
                        key={feature}
                        className={`flex items-start gap-3 p-3 rounded-xl ${themePrimarySoft} ${themePrimarySoftBorder} border`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full theme-success flex items-center justify-center shrink-0 mt-0.5`}
                        >
                          <CheckCircle2
                            size={12}
                            className="text-[var(--color-success)]"
                          />
                        </div>

                        <span className="text-sm theme-text-secondary">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ==================================================
                NOTICE
            ================================================== */}
            <section className="theme-card theme-border rounded-xl border p-4 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)]">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg theme-warning flex items-center justify-center shrink-0">
                  <AlertCircle
                    size={17}
                    className="text-[var(--color-warning)]"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold theme-text">
                    Informasi langganan
                  </p>

                  <p className="text-xs theme-text-secondary mt-1 leading-5">
                    Pastikan perpanjangan dilakukan sebelum masa aktif
                    berakhir agar layanan SmartSchool tetap dapat digunakan
                    tanpa gangguan.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}