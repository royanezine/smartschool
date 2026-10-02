"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";

import {
  ClipboardList,
  Sparkles,
  Search,
  Package,
  Projector,
  Dumbbell,
  DoorOpen,
  Laptop,
  Wrench,
  CalendarDays,
  Clock,
  Hourglass,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { getDaftarPeminjaman } from "../../../../../services/sarpras.service";

// =========================================================
// THEME HELPERS
// =========================================================

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

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

// =========================================================
// STATUS FILTER
// =========================================================

const STATUS_FILTER = [
  { label: "Semua", value: "" },
  { label: "Menunggu", value: "menunggu_persetujuan" },
  { label: "Disetujui", value: "disetujui" },
  { label: "Berlangsung", value: "dipinjam" },
  { label: "Ditolak", value: "ditolak" },
];

// =========================================================
// STATUS CONFIG
// =========================================================

const statusConfig = {
  menunggu_persetujuan: {
    label: "Menunggu",
    icon: Hourglass,
    pill: `${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder}`,
    dot: "bg-[var(--color-warning)]",
    accent:
      "before:bg-[linear-gradient(to_bottom,var(--color-warning),color-mix(in_srgb,var(--color-warning)_70%,var(--color-text)))]",
  },

  disetujui: {
    label: "Disetujui",
    icon: CheckCircle2,
    pill: `${themePrimarySoft} ${themePrimaryText} ${themePrimarySoftBorder}`,
    dot: "bg-[var(--color-primary)]",
    accent:
      "before:bg-[linear-gradient(to_bottom,var(--color-primary),color-mix(in_srgb,var(--color-primary)_70%,var(--color-info)))]",
  },

  dipinjam: {
    label: "Berlangsung",
    icon: Clock,
    pill: `${themeInfoSurface} text-[var(--color-info)] ${themeInfoBorder}`,
    dot: "bg-[var(--color-info)]",
    accent:
      "before:bg-[linear-gradient(to_bottom,var(--color-info),color-mix(in_srgb,var(--color-info)_70%,var(--color-primary)))]",
  },

  ditolak: {
    label: "Ditolak",
    icon: XCircle,
    pill: `${themeDangerSurface} theme-danger ${themeDangerBorder}`,
    dot: "bg-[var(--color-text-muted)]",
    accent:
      "before:bg-[linear-gradient(to_bottom,var(--color-text-muted),var(--color-text))]",
  },

  dikembalikan: {
    label: "Selesai",
    icon: CheckCircle2,
    pill: `${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`,
    dot: "bg-[var(--color-success)]",
    accent:
      "before:bg-[linear-gradient(to_bottom,var(--color-success),color-mix(in_srgb,var(--color-success)_70%,var(--color-primary)))]",
  },
};

// =========================================================
// HELPERS
// =========================================================

function getPaginationData(response) {
  const root = response?.data ?? response ?? {};

  const data = Array.isArray(root)
    ? root
    : Array.isArray(root?.data)
    ? root.data
    : Array.isArray(root?.items)
    ? root.items
    : Array.isArray(root?.results)
    ? root.results
    : [];

  const pagination =
    root?.pagination ??
    response?.pagination ??
    {};

  const page =
    Number(
      pagination?.page ??
        root?.page ??
        response?.page ??
        1
    ) || 1;

  const limit =
    Number(
      pagination?.limit ??
        root?.limit ??
        response?.limit ??
        10
    ) || 10;

  const total =
    Number(
      pagination?.totalData ??
        pagination?.total ??
        root?.totalData ??
        root?.total ??
        response?.totalData ??
        data.length
    ) || 0;

  const totalPages =
    Number(
      pagination?.totalPages ??
        root?.totalPages ??
        response?.totalPages ??
        Math.ceil(total / limit)
    ) || 1;

  return {
    data,
    page,
    limit,
    total,
    totalPages,
  };
}

function formatTanggal(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusConfig(status) {
  return (
    statusConfig[status] || {
      label: status || "Tidak diketahui",
      icon: AlertTriangle,
      pill: `${themeNeutralSurface} theme-text-secondary ${themeNeutralBorder}`,
      dot: "bg-[var(--color-text-muted)]",
      accent:
        "before:bg-[linear-gradient(to_bottom,var(--color-text-muted),var(--color-text))]",
    }
  );
}

function getAssetIcon(nama = "") {
  const value = nama.toLowerCase();

  if (
    value.includes("proyektor") ||
    value.includes("projector")
  ) {
    return Projector;
  }

  if (
    value.includes("speaker") ||
    value.includes("sound")
  ) {
    return Package;
  }

  if (
    value.includes("laptop") ||
    value.includes("komputer")
  ) {
    return Laptop;
  }

  if (
    value.includes("ruang") ||
    value.includes("kelas") ||
    value.includes("lab")
  ) {
    return DoorOpen;
  }

  if (
    value.includes("olahraga") ||
    value.includes("matras") ||
    value.includes("bola")
  ) {
    return Dumbbell;
  }

  return Wrench;
}

// =========================================================
// ASSET THEME
// =========================================================

function getAssetTheme(nama = "") {
  const value = nama.toLowerCase();

  if (
    value.includes("proyektor") ||
    value.includes("projector")
  ) {
    return {
      surface: themePrimaryGradient,
      shadow: themePrimaryShadow,
    };
  }

  if (
    value.includes("speaker") ||
    value.includes("sound")
  ) {
    return {
      surface: themeInfoSurface,
      border: themeInfoBorder,
      icon: "text-[var(--color-info)]",
    };
  }

  if (
    value.includes("laptop") ||
    value.includes("komputer")
  ) {
    return {
      surface: themePrimarySoft,
      border: themePrimarySoftBorder,
      icon: themePrimaryText,
    };
  }

  if (
    value.includes("ruang") ||
    value.includes("kelas") ||
    value.includes("lab")
  ) {
    return {
      surface: themeInfoSurface,
      border: themeInfoBorder,
      icon: "text-[var(--color-info)]",
    };
  }

  if (
    value.includes("olahraga") ||
    value.includes("matras") ||
    value.includes("bola")
  ) {
    return {
      surface: themeSuccessSurface,
      border: themeSuccessBorder,
      icon: "text-[var(--color-success)]",
    };
  }

  return {
    surface: themeNeutralSurface,
    border: themeNeutralBorder,
    icon: "theme-text-secondary",
  };
}

// =========================================================
// PAGE
// =========================================================

export default function GuruSarprasPeminjamanPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [filterAktif, setFilterAktif] =
    useState("");

  const [pencarianInput, setPencarianInput] =
    useState("");

  const [pencarian, setPencarian] =
    useState("");

  const [daftarPengajuan, setDaftarPengajuan] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [limit] =
    useState(10);

  const [totalData, setTotalData] =
    useState(0);

  const [totalPages, setTotalPages] =
    useState(1);

  const notifications = [
    {
      id: 1,
      title: "Peminjaman Sarpras",
      desc: "Pantau status pengajuan peminjaman",
      read: false,
    },
  ];

  const loadPeminjaman = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getDaftarPeminjaman({
          page,
          limit,
          status: filterAktif,
          search: pencarian,
        });

      const result =
        getPaginationData(response);

      setDaftarPengajuan(result.data);
      setTotalData(result.total);
      setTotalPages(
        Math.max(1, result.totalPages)
      );
    } catch (err) {
      console.error(
        "Gagal mengambil data peminjaman:",
        err
      );

      setError(
        err?.message ||
          "Gagal mengambil data peminjaman."
      );

      setDaftarPengajuan([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPeminjaman();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    filterAktif,
    pencarian,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setPencarian(
        pencarianInput.trim()
      );
    }, 400);

    return () =>
      clearTimeout(timer);
  }, [pencarianInput]);

  const handleRefresh = () => {
    loadPeminjaman();
  };

  const jumlahData = useMemo(
    () => totalData,
    [totalData]
  );

  const bukaDetail = (item) => {
    if (!item?.id) return;

    router.push(
      `/guru/sarpras/peminjaman/${item.id}`
    );
  };

  return (
    <div className="theme-page flex h-screen overflow-hidden">
      {/* SIDEBAR */}

      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() =>
          setSidebarOpen(
            (prev) => !prev
          )
        }
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* HEADER */}

        <Header
          toggleSidebar={() =>
            setSidebarOpen(
              (prev) => !prev
            )
          }
          notifications={notifications}
          user={{
            name: "Guru",
            email: "guru@smartschool.com",
            avatar: "GU",
          }}
        />

        <main className="theme-page relative flex-1 overflow-y-auto">
          {/* DECORATION */}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div className="absolute -right-20 -top-32 h-[320px] w-[320px] rounded-full bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] blur-3xl" />

            <div className="absolute -left-40 top-1/3 h-[280px] w-[280px] rounded-full bg-[color-mix(in_srgb,var(--color-info)_6%,transparent)] blur-3xl" />
          </div>

          <div className="relative mx-auto w-full max-w-[1700px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow}`}
                >
                  <ClipboardList size={22} />
                </div>

                <div className="min-w-0">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span
                      className={`h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]`}
                    />

                    <p
                      className={`${themePrimaryText} text-[11px] font-bold uppercase tracking-[0.12em]`}
                    >
                      Sarana & Prasarana
                    </p>
                  </div>

                  <h1 className="theme-text text-2xl font-bold tracking-tight md:text-[28px]">
                    Peminjaman Saya
                  </h1>

                  <p className="theme-text-secondary mt-1 flex max-w-2xl items-center gap-1.5 text-sm">
                    <Sparkles
                      size={14}
                      className="theme-text-muted flex-shrink-0"
                    />

                    <span className="truncate">
                      Pantau status pengajuan
                      peminjaman kamu.
                    </span>
                  </p>
                </div>
              </div>

              {/* REFRESH */}

              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                className={`theme-card ${themeNeutralBorder} theme-text-secondary inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold ${themeSmallShadow} transition-all hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <RefreshCw
                  size={15}
                  className={
                    loading
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh
              </button>
            </div>

            {/* =================================================
                SEARCH + FILTER
            ================================================= */}

            <div
              className={`theme-card ${themeNeutralBorder} ${themeCardShadow} space-y-3 rounded-2xl border p-4`}
            >
              <div className="relative">
                <Search
                  size={16}
                  className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                />

                <input
                  type="text"
                  value={pencarianInput}
                  onChange={(e) =>
                    setPencarianInput(
                      e.target.value
                    )
                  }
                  placeholder="Cari nomor pengajuan, keperluan, atau aset..."
                  className={`theme-input theme-text w-full rounded-xl border pl-10 pr-3 text-sm ${themeFocus} placeholder:text-[var(--color-text-placeholder)] h-11 outline-none transition-all`}
                />
              </div>

              {/* FILTER */}

              <div className="flex gap-2 overflow-x-auto pb-1">
                {STATUS_FILTER.map(
                  (filter) => {
                    const aktif =
                      filterAktif ===
                      filter.value;

                    return (
                      <button
                        key={
                          filter.value ||
                          "semua"
                        }
                        type="button"
                        onClick={() => {
                          setPage(1);
                          setFilterAktif(
                            filter.value
                          );
                        }}
                        className={`inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-xl border px-3.5 text-xs font-semibold transition-all ${
                          aktif
                            ? `${themePrimaryGradient} border-transparent text-[var(--color-card)] ${themePrimaryShadow}`
                            : `theme-card ${themeNeutralBorder} theme-text-secondary hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]`
                        }`}
                      >
                        {filter.label}

                        {filter.value ===
                          "" && (
                          <span
                            className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                              aktif
                                ? "bg-[color-mix(in_srgb,var(--color-card)_20%,transparent)] text-[var(--color-card)]"
                                : `${themeNeutralSurface} theme-text-muted`
                            }`}
                          >
                            {jumlahData}
                          </span>
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div
                className={`flex items-start gap-3 rounded-2xl border ${themeDangerBorder} ${themeDangerSurface} p-4`}
              >
                <div
                  className={`theme-card theme-danger flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border ${themeDangerBorder}`}
                >
                  <AlertTriangle size={16} />
                </div>

                <div className="flex-1">
                  <p className="theme-danger text-sm font-bold">
                    Gagal mengambil data
                  </p>

                  <p className="theme-text-secondary mt-1 text-xs">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* =================================================
                LOADING
            ================================================= */}

            {loading && (
              <div
                className={`theme-card ${themeNeutralBorder} ${themeCardShadow} flex flex-col items-center justify-center rounded-2xl border py-16`}
              >
                <Loader2
                  size={26}
                  className={`${themePrimaryText} animate-spin`}
                />

                <p className="theme-text-secondary mt-3 text-sm">
                  Memuat data peminjaman...
                </p>
              </div>
            )}

            {/* =================================================
                LIST
            ================================================= */}

            {!loading && (
              <div className="space-y-3">
                {daftarPengajuan.map(
                  (peminjaman) => {
                    const status =
                      getStatusConfig(
                        peminjaman.status
                      );

                    const StatusIcon =
                      status.icon;

                    const detail =
                      peminjaman.detailPeminjaman ||
                      [];

                    const firstDetail =
                      detail[0];

                    const namaAset =
                      firstDetail?.aset?.nama ||
                      "Aset";

                    const jumlah =
                      firstDetail?.jumlah ??
                      detail.reduce(
                        (
                          total,
                          item
                        ) =>
                          total +
                          Number(
                            item?.jumlah ||
                              0
                          ),
                        0
                      );

                    const ItemIcon =
                      getAssetIcon(
                        namaAset
                      );

                    const assetTheme =
                      getAssetTheme(
                        namaAset
                      );

                    return (
                      <button
                        key={
                          peminjaman.id
                        }
                        type="button"
                        onClick={() =>
                          bukaDetail(
                            peminjaman
                          )
                        }
                        className={`theme-card group relative w-full overflow-hidden rounded-2xl border ${themeNeutralBorder} text-left ${themeSmallShadow} transition-all duration-300 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)] hover:${themeSmallShadow} before:absolute before:left-0 before:top-0 before:h-full before:w-[3px] before:content-[''] ${status.accent}`}
                      >
                        <div className="flex items-center gap-3 p-4 sm:p-5">

                          {/* ASSET ICON */}

                          <div
                            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border ${assetTheme.border || themePrimarySoftBorder} ${assetTheme.surface} ${assetTheme.icon || "text-[var(--color-card)]"} ${assetTheme.shadow || ""}`}
                          >
                            <ItemIcon size={18} />
                          </div>

                          {/* INFO */}

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="theme-text truncate text-sm font-bold">
                                {namaAset}
                              </h2>

                              {peminjaman.nomorPeminjaman && (
                                <span
                                  className={`theme-text-muted ${themeNeutralSurface} rounded border ${themeNeutralBorder} px-1.5 py-0.5 font-mono text-[10px] font-semibold`}
                                >
                                  {
                                    peminjaman.nomorPeminjaman
                                  }
                                </span>
                              )}
                            </div>

                            <div className="theme-text-secondary mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                              <span className="flex items-center gap-1">
                                <CalendarDays
                                  size={12}
                                  className="theme-text-muted"
                                />

                                {formatTanggal(
                                  peminjaman.tanggalPinjam ||
                                    peminjaman.tanggalPengajuan
                                )}
                              </span>

                              <span className="flex items-center gap-1">
                                <Package
                                  size={12}
                                  className="theme-text-muted"
                                />

                                {jumlah} unit
                              </span>
                            </div>
                          </div>

                          {/* STATUS */}

                          <span
                            className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${status.pill}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                            />

                            {status.label}
                          </span>

                          {/* ARROW */}

                          <ChevronRight
                            size={16}
                            className={`${themeTextMutedClass} hidden flex-shrink-0 transition-colors group-hover:text-[var(--color-primary)] sm:block`}
                          />
                        </div>
                      </button>
                    );
                  }
                )}

                {/* EMPTY */}

                {daftarPengajuan.length ===
                  0 && (
                  <div
                    className={`theme-card ${themeNeutralBorder} rounded-2xl border border-dashed ${themeCardShadow} py-16 text-center`}
                  >
                    <div
                      className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${themeNeutralSurface} ${themeNeutralBorder} border`}
                    >
                      <ClipboardList
                        size={22}
                        className="theme-text-muted"
                      />
                    </div>

                    <p className="theme-text mt-4 text-sm font-bold">
                      Belum ada pengajuan
                      peminjaman
                    </p>

                    <p className="theme-text-muted mt-1 text-xs">
                      Pengajuan peminjaman
                      kamu akan muncul di
                      sini.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* =================================================
                PAGINATION
            ================================================= */}

            {!loading &&
              totalPages > 1 && (
                <div
                  className={`theme-card ${themeNeutralBorder} ${themeSmallShadow} flex items-center justify-between rounded-2xl border px-4 py-3`}
                >
                  <p className="theme-text-secondary text-xs">
                    Halaman{" "}
                    <span className="theme-text font-semibold">
                      {page}
                    </span>{" "}
                    dari{" "}
                    <span className="theme-text font-semibold">
                      {totalPages}
                    </span>
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() =>
                        setPage(
                          (prev) =>
                            Math.max(
                              1,
                              prev - 1
                            )
                        )
                      }
                      className={`theme-card ${themeNeutralBorder} theme-text-secondary rounded-xl border p-2 transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-40`}
                    >
                      <ChevronLeft
                        size={15}
                      />
                    </button>

                    <button
                      type="button"
                      disabled={
                        page >= totalPages
                      }
                      onClick={() =>
                        setPage(
                          (prev) =>
                            Math.min(
                              totalPages,
                              prev + 1
                            )
                        )
                      }
                      className={`theme-card ${themeNeutralBorder} theme-text-secondary rounded-xl border p-2 transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-40`}
                    >
                      <ChevronRight
                        size={15}
                      />
                    </button>
                  </div>
                </div>
              )}
          </div>
        </main>
      </div>
    </div>
  );
}