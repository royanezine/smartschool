"use client";

import { useMemo, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

import {
  Package,
  CalendarDays,
  Clock3,
  CheckCircle2,
  Sparkles,
  Crown,
  Zap,
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
// Nanti bisa diganti hasil fetch dari backend
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
      className: "bg-emerald-50 text-emerald-600 border-emerald-200",
      dot: "bg-emerald-500",
    },

    TidakAktif: {
      className: "bg-red-50 text-red-600 border-red-200",
      dot: "bg-red-500",
    },

    Expired: {
      className: "bg-red-50 text-red-600 border-red-200",
      dot: "bg-red-500",
    },
  };

  const current = config[status] || {
    className: "bg-slate-100 text-slate-500 border-slate-200",
    dot: "bg-slate-400",
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
  iconClass = "text-[#155DFC]",
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-slate-500 tracking-wide">
            {title}
          </p>

          <p className="mt-1.5 text-xl sm:text-2xl font-bold text-slate-900 truncate">
            {value}
          </p>

          {description && (
            <p className="mt-1 text-[10px] sm:text-xs text-slate-400">
              {description}
            </p>
          )}
        </div>

        <div className="w-9 h-9 shrink-0 rounded-lg bg-slate-50 flex items-center justify-center">
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
    <div className="border border-slate-200 rounded-xl p-4 bg-white">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#eaf1ff] flex items-center justify-center">
            <Icon size={15} className="text-[#155DFC]" />
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-700">{label}</p>

            <p className="text-[10px] text-slate-400 mt-0.5">
              {used} / {limit} {unit}
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-slate-700">
          {percentage}%
        </span>
      </div>

      <div className="mt-4 h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#155DFC] to-[#0d47c9]"
          style={{ width: `${Math.min(percentage, 100)}%` }}
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
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
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

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* PAGE HEADER */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#155DFC] to-[#0d47c9] text-white shadow-lg shadow-[#155DFC]/20">
                  <Package size={20} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-slate-800">
                    Paket Saya
                  </h1>

                  <p className="text-sm text-slate-500">
                    Informasi lengkap mengenai paket langganan sekolah Anda.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                <RefreshCw size={15} />
                Refresh
              </button>
            </div>

            {/* SUMMARY */}
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
                iconClass="text-emerald-500"
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

            {/* PACKAGE DETAIL */}
            <section className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-5 sm:p-6">
                {/* HEADER PACKAGE */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#155DFC] to-[#0d47c9] text-white flex items-center justify-center shadow-lg shadow-[#155DFC]/20 shrink-0">
                      <IconPaket size={27} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-bold text-slate-900">
                          {SCHOOL_PACKAGE.name}
                        </h2>

                        <StatusBadge status={SCHOOL_PACKAGE.status} />
                      </div>

                      <p className="text-sm text-slate-500 mt-1.5 max-w-2xl">
                        {SCHOOL_PACKAGE.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#155DFC] text-white text-sm font-semibold hover:bg-[#0d47c9] transition">
                      <Wallet size={15} />
                      Perpanjang
                    </button>

                    <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition">
                      <ArrowUpRight size={15} />
                      Upgrade
                    </button>
                  </div>
                </div>

                {/* BILLING */}
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Wallet size={15} className="text-[#155DFC]" />
                      <span className="text-xs font-medium">
                        Harga Langganan
                      </span>
                    </div>

                    <p className="text-xl font-bold text-slate-900 mt-2">
                      {formatRupiah(price)}
                    </p>

                    <div className="mt-3 inline-flex items-center gap-1 border border-slate-200 rounded-lg p-1 bg-slate-50">
                      {["Bulanan", "Tahunan"].map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setBillingCycle(item)}
                          className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                            billingCycle === item
                              ? "bg-white text-[#155DFC] shadow-sm"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <CalendarDays
                        size={15}
                        className="text-[#155DFC]"
                      />
                      <span className="text-xs font-medium">
                        Periode Aktif
                      </span>
                    </div>

                    <p className="text-sm font-bold text-slate-900 mt-2">
                      {formatDate(SCHOOL_PACKAGE.startDate)}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      sampai
                    </p>

                    <p className="text-sm font-bold text-slate-900">
                      {formatDate(SCHOOL_PACKAGE.endDate)}
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock3 size={15} className="text-[#155DFC]" />
                      <span className="text-xs font-medium">
                        Masa Aktif
                      </span>
                    </div>

                    <p className="text-xl font-bold text-slate-900 mt-2">
                      {SCHOOL_PACKAGE.daysLeft} Hari
                    </p>

                    <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#155DFC] to-[#0d47c9] rounded-full"
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

                {/* USAGE */}
                <div className="mt-7">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">
                        Penggunaan Paket
                      </h3>

                      <p className="text-xs text-slate-400 mt-1">
                        Pantau pemakaian resource sekolah.
                      </p>
                    </div>

                    <ShieldCheck size={18} className="text-[#155DFC]" />
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

                {/* FEATURES */}
                <div className="mt-7 border-t border-slate-100 pt-6">
                  <h3 className="text-sm font-bold text-slate-800">
                    Fitur yang Tersedia
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                    {SCHOOL_PACKAGE.features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-start gap-3 p-3 rounded-xl bg-[#f7f9ff] border border-[#eaf1ff]"
                      >
                        <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2
                            size={12}
                            className="text-emerald-600"
                          />
                        </div>

                        <span className="text-sm text-slate-600">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* NOTICE */}
            <section className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                  <AlertCircle
                    size={17}
                    className="text-amber-500"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Informasi langganan
                  </p>

                  <p className="text-xs text-slate-500 mt-1 leading-5">
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