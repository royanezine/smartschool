"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  DoorOpen,
  Package,
  Wrench,
  ClipboardList,
  AlertTriangle,
  ArrowRight,
  Plus,
  Search,
  RefreshCw,
  Boxes,
  School,
  LayoutGrid,
  ChevronRight,
  Clock3,
  CheckCircle2,
  CircleAlert,
  TrendingUp,
  MapPin,
  FileText,
} from "lucide-react";

import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";

import { getGedung } from "../../../../services/infrastruktur.service";

// ============================================================
// GLOBAL THEME HELPERS
// ============================================================

const themePrimarySurface =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySurfaceHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const themePrimaryBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_24%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themePrimaryHover =
  "hover:text-[var(--color-primary)]";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

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
  "bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_24%,transparent)]";

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
// PAGE
// ============================================================

export default function SarprasPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [gedung, setGedung] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const loadData = async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError("");

      const response = await getGedung();

      if (response?.success === false) {
        setError(
          response?.message || "Data gedung belum dapat dimuat."
        );
        setGedung([]);
        return;
      }

      let data = [];

      if (Array.isArray(response)) {
        data = response;
      } else if (Array.isArray(response?.data)) {
        data = response.data;
      } else if (Array.isArray(response?.result)) {
        data = response.result;
      }

      setGedung(data);
    } catch (err) {
      console.error("Gagal memuat data sarpras:", err);

      setError(
        err?.message || "Terjadi kesalahan saat memuat data."
      );

      setGedung([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredGedung = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return gedung;
    }

    return gedung.filter((item) => {
      const nama = String(
        item?.nama ||
          item?.namaGedung ||
          item?.nama_gedung ||
          ""
      ).toLowerCase();

      const kode = String(
        item?.kode ||
          item?.kodeGedung ||
          item?.kode_gedung ||
          ""
      ).toLowerCase();

      const lokasi = String(
        item?.lokasi ||
          item?.alamat ||
          ""
      ).toLowerCase();

      return (
        nama.includes(keyword) ||
        kode.includes(keyword) ||
        lokasi.includes(keyword)
      );
    });
  }, [gedung, search]);

  const totalGedung = gedung.length;

  const totalAktif = gedung.filter((item) => {
    const status = String(
      item?.status ||
        item?.statusGedung ||
        "aktif"
    ).toLowerCase();

    return status === "aktif";
  }).length;

  const totalTidakAktif = Math.max(
    totalGedung - totalAktif,
    0
  );

  const menuItems = [
    {
      title: "Gedung & Ruangan",
      description:
        "Kelola gedung, lantai, dan ruangan sekolah",
      icon: Building2,
      href: "/admin/sarpras/gedung",
      stat: `${totalGedung} Gedung`,
      iconClass: `${themeInfoSurface} text-[var(--color-info)]`,
    },
    {
      title: "Inventaris",
      description:
        "Kelola barang dan aset inventaris sekolah",
      icon: Package,
      href: "/admin/sarpras/gudang",
      stat: "Kelola Aset",
      iconClass: `${themePrimarySurface} ${themePrimaryText}`,
    },
    {
      title: "Fasilitas",
      description:
        "Kelola fasilitas dan perlengkapan sekolah",
      icon: Boxes,
      href: "/admin/sarpras/fasilitas",
      stat: "Kelola Fasilitas",
      iconClass: `${themeSuccessSurface} text-[var(--color-success)]`,
    },
    {
      title: "Peminjaman",
      description:
        "Pantau dan kelola peminjaman barang",
      icon: ClipboardList,
      href: "/admin/sarpras/peminjaman",
      stat: "Kelola Peminjaman",
      iconClass: `${themeWarningSurface} text-[var(--color-warning)]`,
    },
    {
      title: "Pemeliharaan",
      description:
        "Kelola perawatan dan pemeliharaan fasilitas",
      icon: Wrench,
      href: "/admin/sarpras/pemeliharaan",
      stat: "Kelola Perawatan",
      iconClass: `${themeInfoSurface} text-[var(--color-info)]`,
    },
    {
      title: "Laporan Kerusakan",
      description:
        "Catat dan tindak lanjuti laporan kerusakan",
      icon: AlertTriangle,
      href: "/admin/sarpras/kerusakan",
      stat: "Lihat Laporan",
      iconClass: `${themeDangerSurface} theme-danger`,
    },
  ];

  const quickActions = [
    {
      title: "Tambah Gedung",
      description: "Tambahkan gedung baru",
      icon: Building2,
      href: "/admin/sarpras/gedung/tambah",
    },
    {
      title: "Tambah Inventaris",
      description: "Tambahkan aset inventaris",
      icon: Package,
      href: "/admin/sarpras/gudang/tambah",
    },
    {
      title: "Ajukan Peminjaman",
      description: "Buat data peminjaman",
      icon: ClipboardList,
      href: "/admin/sarpras/peminjaman/tambah",
    },
    {
      title: "Laporan Kerusakan",
      description: "Buat laporan kerusakan",
      icon: CircleAlert,
      href: "/admin/sarpras/kerusakan/tambah",
    },
  ];

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="theme-page h-screen overflow-hidden">
      {/* SIDEBAR */}
      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar
          active="sarpras"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
        />
      </div>

      {/* AREA KANAN */}
      <div
        className={`flex h-screen min-w-0 flex-col transition-[margin] duration-300 ${
          isCollapsed
            ? "lg:ml-[88px]"
            : "lg:ml-[260px]"
        }`}
      >
        {/* HEADER */}
        <div className="shrink-0">
          <Header
            toggleSidebar={toggleSidebar}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        {/* CONTENT */}
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-[1600px]">

              {/* PAGE HEADER */}
              <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0">
                  <div className="mb-2 flex items-center gap-2 text-sm theme-text-muted">
                    <span>Admin</span>

                    <ChevronRight size={15} />

                    <span className={`font-medium ${themePrimaryText}`}>
                      Sarana & Prasarana
                    </span>
                  </div>

                  <h1 className="text-2xl font-bold tracking-tight theme-text sm:text-3xl">
                    Sarana & Prasarana
                  </h1>

                  <p className="mt-1 max-w-2xl text-sm leading-6 theme-text-secondary">
                    Kelola gedung, ruangan, inventaris,
                    fasilitas, peminjaman, dan
                    pemeliharaan sarana sekolah.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => loadData(true)}
                    disabled={isRefreshing}
                    className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border ${themeNeutralBorder} theme-card px-4 text-sm font-medium theme-text-secondary ${themeSmallShadow} transition ${themePrimaryBorder} ${themePrimarySurfaceHover} disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    <RefreshCw
                      size={16}
                      className={
                        isRefreshing
                          ? "animate-spin"
                          : ""
                      }
                    />

                    <span>Refresh</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/admin/sarpras/gedung/tambah"
                      )
                    }
                    className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg ${themePrimaryGradient} px-4 text-sm font-semibold text-[var(--color-card)] ${themePrimaryShadow} transition hover:opacity-90`}
                  >
                    <Plus size={17} />

                    Tambah Gedung
                  </button>
                </div>
              </div>

              {/* STATISTICS */}
              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="Total Gedung"
                  value={
                    isLoading
                      ? "..."
                      : totalGedung
                  }
                  description="Gedung terdaftar"
                  icon={Building2}
                  iconBg={themeInfoSurface}
                  iconColor="text-[var(--color-info)]"
                  trend="Data real-time"
                />

                <StatCard
                  title="Gedung Aktif"
                  value={
                    isLoading
                      ? "..."
                      : totalAktif
                  }
                  description="Dalam kondisi aktif"
                  icon={CheckCircle2}
                  iconBg={themeSuccessSurface}
                  iconColor="text-[var(--color-success)]"
                  trend="Status aktif"
                />

                <StatCard
                  title="Tidak Aktif"
                  value={
                    isLoading
                      ? "..."
                      : totalTidakAktif
                  }
                  description="Perlu diperiksa"
                  icon={CircleAlert}
                  iconBg={themeWarningSurface}
                  iconColor="text-[var(--color-warning)]"
                  trend="Perlu perhatian"
                />

                <StatCard
                  title="Modul Sarpras"
                  value="6"
                  description="Menu pengelolaan"
                  icon={LayoutGrid}
                  iconBg={themePrimarySurface}
                  iconColor={themePrimaryText}
                  trend="Terintegrasi"
                />
              </div>

              {/* ERROR */}
              {error && (
                <div
                  className={`mb-6 flex flex-col gap-3 rounded-xl border ${themeWarningBorder} ${themeWarningSurface} p-4 sm:flex-row sm:items-center sm:justify-between`}
                >
                  <div className="flex items-start gap-3">
                    <CircleAlert
                      size={20}
                      className="mt-0.5 shrink-0 text-[var(--color-warning)]"
                    />

                    <div>
                      <p className="text-sm font-semibold theme-text">
                        Data belum dapat dimuat
                      </p>

                      <p className="mt-1 text-sm theme-text-secondary">
                        {error}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => loadData()}
                    className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg border ${themeWarningBorder} theme-card px-3 text-sm font-medium theme-text-secondary transition ${themeWarningSurface}`}
                  >
                    <RefreshCw size={15} />

                    Coba Lagi
                  </button>
                </div>
              )}

              {/* AKSI CEPAT */}
              <section className="mb-6">
                <div className="mb-4">
                  <h2 className="text-lg font-bold theme-text">
                    Aksi Cepat
                  </h2>

                  <p className="mt-1 text-sm theme-text-secondary">
                    Akses fitur Sarpras yang sering digunakan
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {quickActions.map((action) => {
                    const Icon = action.icon;

                    return (
                      <button
                        key={action.title}
                        type="button"
                        onClick={() =>
                          router.push(action.href)
                        }
                        className={`group flex min-w-0 items-center gap-4 rounded-xl border ${themeNeutralBorder} theme-card p-4 text-left ${themeCardShadow} transition hover:-translate-y-0.5 ${themePrimaryBorder} ${themeNeutralHover}`}
                      >
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${themePrimarySurface} ${themePrimaryText} transition group-hover:${themePrimarySurface}`}
                        >
                          <Icon size={20} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold theme-text">
                            {action.title}
                          </p>

                          <p className="mt-1 truncate text-xs theme-text-muted">
                            {action.description}
                          </p>
                        </div>

                        <ArrowRight
                          size={17}
                          className={`shrink-0 theme-text-muted transition group-hover:translate-x-1 ${themePrimaryHover}`}
                        />
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* MAIN CONTENT */}
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.8fr)]">

                {/* MODUL SARPRAS */}
                <section
                  className={`min-w-0 overflow-hidden rounded-xl border ${themeNeutralBorder} theme-card ${themeCardShadow}`}
                >
                  <div className={`border-b ${themeDivider} p-5 sm:p-6`}>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <h2 className="text-lg font-bold theme-text">
                          Pengelolaan Sarpras
                        </h2>

                        <p className="mt-1 text-sm theme-text-secondary">
                          Pilih modul yang ingin dikelola
                        </p>
                      </div>

                      <div
                        className={`flex h-10 w-full items-center rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} px-3 lg:w-[250px]`}
                      >
                        <Search
                          size={16}
                          className="shrink-0 theme-text-muted"
                        />

                        <input
                          type="text"
                          value={search}
                          onChange={(e) =>
                            setSearch(e.target.value)
                          }
                          placeholder="Cari gedung..."
                          className={`ml-2 min-w-0 flex-1 bg-transparent text-sm theme-text outline-none placeholder:text-[var(--color-text-placeholder)] ${themeFocus}`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 sm:p-6">
                    {menuItems.map((item) => {
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.title}
                          type="button"
                          onClick={() =>
                            router.push(item.href)
                          }
                          className={`group flex min-h-[125px] flex-col rounded-xl border ${themeNeutralBorder} theme-card p-4 text-left transition ${themePrimaryBorder} ${themeNeutralHover} ${themeSmallShadow}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.iconClass}`}
                            >
                              <Icon size={19} />
                            </div>

                            <ArrowRight
                              size={17}
                              className={`theme-text-muted transition group-hover:translate-x-1 ${themePrimaryText}`}
                            />
                          </div>

                          <div className="mt-4">
                            <h3 className="text-sm font-bold theme-text">
                              {item.title}
                            </h3>

                            <p className="mt-1 line-clamp-2 text-xs leading-5 theme-text-secondary">
                              {item.description}
                            </p>

                            <div
                              className={`mt-3 flex items-center gap-1.5 text-xs font-medium ${themePrimaryText}`}
                            >
                              <span>{item.stat}</span>

                              <ChevronRight size={13} />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* RINGKASAN */}
                <div className="space-y-6">
                  <section
                    className={`overflow-hidden rounded-xl border ${themeNeutralBorder} theme-card ${themeCardShadow}`}
                  >
                    <div className={`border-b ${themeDivider} p-5`}>
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${themeInfoSurface} text-[var(--color-info)]`}
                        >
                          <School size={19} />
                        </div>

                        <div>
                          <h2 className="text-base font-bold theme-text">
                            Ringkasan Sarpras
                          </h2>

                          <p className="text-xs theme-text-secondary">
                            Informasi pengelolaan fasilitas
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="divide-y divide-[color-mix(in_srgb,var(--color-text)_8%,transparent)]">
                      <SummaryRow
                        icon={Building2}
                        label="Gedung"
                        value={
                          isLoading
                            ? "..."
                            : totalGedung
                        }
                      />

                      <SummaryRow
                        icon={DoorOpen}
                        label="Ruangan"
                        value="—"
                      />

                      <SummaryRow
                        icon={Package}
                        label="Inventaris"
                        value="—"
                      />

                      <SummaryRow
                        icon={Wrench}
                        label="Pemeliharaan"
                        value="—"
                      />
                    </div>
                  </section>

                  {/* INFO CARD */}
                  <section
                    className={`relative overflow-hidden rounded-xl border ${themeNeutralBorder} theme-card ${themeCardShadow}`}
                  >
                    <div className="relative p-5 sm:p-6">
                      <div
                        className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${themePrimarySurface}`}
                      />

                      <div
                        className={`absolute -bottom-12 -left-12 h-32 w-32 rounded-full ${themeInfoSurface}`}
                      />

                      <div className="relative">
                        <div
                          className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${themePrimarySurface} ${themePrimaryText}`}
                        >
                          <TrendingUp size={19} />
                        </div>

                        <h2 className="text-base font-bold theme-text">
                          Kelola Sarpras dengan Mudah
                        </h2>

                        <p className="mt-2 text-sm leading-6 theme-text-secondary">
                          Pastikan seluruh fasilitas sekolah
                          tercatat, terawat, dan dapat
                          digunakan secara optimal.
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              "/admin/sarpras/gedung"
                            )
                          }
                          className={`mt-5 inline-flex items-center gap-2 text-sm font-semibold ${themePrimaryText} transition hover:opacity-80`}
                        >
                          Kelola Gedung

                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              {/* GEDUNG TERDAFTAR */}
              <section
                className={`mt-6 overflow-hidden rounded-xl border ${themeNeutralBorder} theme-card ${themeCardShadow}`}
              >
                <div className={`border-b ${themeDivider} p-5 sm:p-6`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-bold theme-text">
                        Gedung Terdaftar
                      </h2>

                      <p className="mt-1 text-sm theme-text-secondary">
                        Data gedung yang sudah tercatat pada
                        sistem
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          "/admin/sarpras/gedung"
                        )
                      }
                      className={`inline-flex items-center gap-1.5 text-sm font-semibold ${themePrimaryText} transition hover:opacity-80`}
                    >
                      Lihat Semua

                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3 sm:p-6">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className={`animate-pulse rounded-xl border ${themeNeutralBorder} p-4`}
                      >
                        <div className="flex gap-3">
                          <div
                            className={`h-10 w-10 rounded-lg ${themeNeutralSurface}`}
                          />

                          <div className="flex-1">
                            <div
                              className={`h-4 w-3/4 rounded ${themeNeutralSurface}`}
                            />

                            <div
                              className={`mt-2 h-3 w-1/2 rounded ${themeNeutralSurface}`}
                            />
                          </div>
                        </div>

                        <div
                          className={`mt-4 h-3 w-full rounded ${themeNeutralSurface}`}
                        />

                        <div
                          className={`mt-2 h-3 w-2/3 rounded ${themeNeutralSurface}`}
                        />
                      </div>
                    ))}
                  </div>
                ) : filteredGedung.length === 0 ? (
                  <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-xl ${themeNeutralSurface} theme-text-muted`}
                    >
                      <Building2 size={25} />
                    </div>

                    <h3 className="mt-4 text-sm font-bold theme-text">
                      {search
                        ? "Gedung tidak ditemukan"
                        : "Belum ada data gedung"}
                    </h3>

                    <p className="mt-1 max-w-sm text-sm leading-6 theme-text-secondary">
                      {search
                        ? "Coba gunakan kata kunci pencarian yang berbeda."
                        : "Tambahkan gedung pertama untuk mulai mengelola sarana dan prasarana."}
                    </p>

                    {!search && (
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            "/admin/sarpras/gedung/tambah"
                          )
                        }
                        className={`mt-5 inline-flex h-9 items-center gap-2 rounded-lg ${themePrimaryGradient} px-4 text-sm font-semibold text-[var(--color-card)] transition hover:opacity-90`}
                      >
                        <Plus size={16} />

                        Tambah Gedung
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3 sm:p-6">
                    {filteredGedung
                      .slice(0, 6)
                      .map((item, index) => {
                        const id =
                          item?.id ||
                          item?.gedungId ||
                          item?.gedung_id;

                        const nama =
                          item?.nama ||
                          item?.namaGedung ||
                          item?.nama_gedung ||
                          `Gedung ${index + 1}`;

                        const kode =
                          item?.kode ||
                          item?.kodeGedung ||
                          item?.kode_gedung ||
                          "-";

                        const lokasi =
                          item?.lokasi ||
                          item?.alamat ||
                          "Lokasi belum diatur";

                        const status = String(
                          item?.status ||
                            item?.statusGedung ||
                            "aktif"
                        ).toLowerCase();

                        const createdAt =
                          item?.dibuatPada ||
                          item?.createdAt ||
                          item?.created_at;

                        return (
                          <button
                            key={id || index}
                            type="button"
                            onClick={() => {
                              if (id) {
                                router.push(
                                  `/admin/sarpras/gedung/${id}`
                                );
                              } else {
                                router.push(
                                  "/admin/sarpras/gedung"
                                );
                              }
                            }}
                            className={`group min-w-0 rounded-xl border ${themeNeutralBorder} p-4 text-left transition ${themePrimaryBorder} ${themeNeutralHover} ${themeSmallShadow}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex min-w-0 items-center gap-3">
                                <div
                                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${themeInfoSurface} text-[var(--color-info)]`}
                                >
                                  <Building2 size={19} />
                                </div>

                                <div className="min-w-0">
                                  <h3 className="truncate text-sm font-bold theme-text">
                                    {nama}
                                  </h3>

                                  <p className="mt-0.5 truncate text-xs theme-text-secondary">
                                    Kode: {kode}
                                  </p>
                                </div>
                              </div>

                              <ChevronRight
                                size={17}
                                className={`mt-1 shrink-0 theme-text-muted transition group-hover:translate-x-1 ${themePrimaryText}`}
                              />
                            </div>

                            <div className="mt-4 flex items-center gap-2 text-xs theme-text-secondary">
                              <MapPin
                                size={14}
                                className="shrink-0"
                              />

                              <span className="truncate">
                                {lokasi}
                              </span>
                            </div>

                            <div
                              className={`mt-3 flex items-center justify-between gap-3 border-t ${themeDivider} pt-3`}
                            >
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                  status === "aktif"
                                    ? `${themeSuccessSurface} text-[var(--color-success)]`
                                    : `${themeNeutralSurface} theme-text-muted`
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    status === "aktif"
                                      ? "bg-[var(--color-success)]"
                                      : "bg-[var(--color-text-muted)]"
                                  }`}
                                />

                                {status === "aktif"
                                  ? "Aktif"
                                  : "Tidak Aktif"}
                              </span>

                              <span className="flex items-center gap-1 text-[11px] theme-text-muted">
                                <Clock3 size={12} />

                                {formatDate(createdAt)}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                )}
              </section>

              {/* FOOTER */}
              <div
                className={`mt-6 flex flex-col gap-2 border-t ${themeDivider} py-5 text-xs theme-text-muted sm:flex-row sm:items-center sm:justify-between`}
              >
                <div className="flex items-center gap-2">
                  <FileText size={14} />

                  <span>
                    SmartSchool • Manajemen Sarana & Prasarana
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2
                    size={14}
                    className="text-[var(--color-success)]"
                  />

                  <span>Sistem terintegrasi</span>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
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
  iconBg,
  iconColor,
  trend,
}) {
  return (
    <div
      className={`rounded-xl border ${themeNeutralBorder} theme-card p-5 ${themeCardShadow} transition hover:-translate-y-0.5`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}
        >
          <Icon size={20} />
        </div>

        <span
          className={`rounded-full ${themeNeutralSurface} px-2.5 py-1 text-[10px] font-medium theme-text-muted`}
        >
          {trend}
        </span>
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium theme-text-secondary">
          {title}
        </p>

        <p className="mt-1 text-2xl font-bold tracking-tight theme-text">
          {value}
        </p>

        <p className="mt-1 text-xs theme-text-muted">
          {description}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// SUMMARY ROW
// ============================================================

function SummaryRow({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${themeNeutralSurface} theme-text-muted`}
        >
          <Icon size={17} />
        </div>

        <span className="truncate text-sm theme-text-secondary">
          {label}
        </span>
      </div>

      <span className="text-sm font-bold theme-text">
        {value}
      </span>
    </div>
  );
}