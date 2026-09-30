"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";

import {
  Package,
  ClipboardList,
  Clock3,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  UserRound,
  CalendarDays,
  AlertCircle,
  Loader2,
  Check,
  HandCoins,
  Undo2,
  RefreshCw,
} from "lucide-react";

import { getDaftarPeminjaman } from "../../../../../services/sarpras.service";

/* =========================================================
   CONSTANT
========================================================= */

const STATUS = {
  MENUNGGU: "menunggu_persetujuan",
  DISETUJUI: "disetujui",
  DITOLAK: "ditolak",
  DIPINJAM: "dipinjam",
  DIKEMBALIKAN: "dikembalikan",
};

/* =========================================================
   THEME HELPERS
========================================================= */

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themePrimaryHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_88%,var(--color-info))]";

const themePrimaryBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_24%,transparent)]";

const themePrimaryBorderHover =
  "hover:border-[color-mix(in_srgb,var(--color-primary)_42%,transparent)]";

const themePrimaryRing =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

/* =========================================================
   STATUS CONFIG
========================================================= */

const getStatusConfig = (status) => {
  switch (status) {
    case STATUS.MENUNGGU:
      return {
        label: "Menunggu",
        className:
          "bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] text-[var(--color-warning)] border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]",
        icon: Clock3,
        dot: "bg-[var(--color-warning)]",
      };

    case STATUS.DISETUJUI:
      return {
        label: "Disetujui",
        className:
          "bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)] text-[var(--color-info)] border-[color-mix(in_srgb,var(--color-info)_24%,transparent)]",
        icon: CheckCircle2,
        dot: "bg-[var(--color-info)]",
      };

    case STATUS.DITOLAK:
      return {
        label: "Ditolak",
        className:
          `${themeDangerSurface} theme-text ${themeDangerBorder}`,
        icon: XCircle,
        dot: "bg-[var(--color-text)]",
      };

    case STATUS.DIPINJAM:
      return {
        label: "Dipinjam",
        className:
          "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)] text-[var(--color-primary)] border-[color-mix(in_srgb,var(--color-primary)_24%,transparent)]",
        icon: Package,
        dot: "bg-[var(--color-primary)]",
      };

    case STATUS.DIKEMBALIKAN:
      return {
        label: "Dikembalikan",
        className:
          "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)] border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]",
        icon: RotateCcw,
        dot: "bg-[var(--color-success)]",
      };

    default:
      return {
        label: status || "-",
        className:
          `${themeNeutralSurface} theme-text-secondary ${themeNeutralBorder}`,
        icon: ClipboardList,
        dot: "bg-[var(--color-text-muted)]",
      };
  }
};

/* =========================================================
   HELPERS
========================================================= */

const formatTanggal = (value) => {
  if (!value) return "-";

  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "-";
  }
};

const getPaginationData = (response) => {
  const data = response?.data ?? response;

  return {
    items: Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
      ? data.data
      : [],

    total:
      Number(
        response?.pagination?.total ??
          response?.meta?.total ??
          data?.pagination?.total ??
          data?.meta?.total ??
          0
      ) || 0,
  };
};

/* =========================================================
   PAGE
========================================================= */

export default function AdminSarprasPeminjamanPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [daftarPeminjaman, setDaftarPeminjaman] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [pencarian, setPencarian] = useState("");
  const [statusAktif, setStatusAktif] = useState("");
  const [page, setPage] = useState(1);

  const limit = 10;

  const [totalData, setTotalData] = useState(0);

  const notifications = [
    {
      id: 1,
      title: "Peminjaman Sarpras",
      desc: "Kelola pengajuan peminjaman aset sekolah",
      read: false,
    },
  ];

  /* =========================================================
     LOAD DATA
  ========================================================= */

  const loadPeminjaman = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await getDaftarPeminjaman({
          page,
          limit,
          status: statusAktif,
          search: pencarian,
        });

        const result = getPaginationData(response);

        setDaftarPeminjaman(result.items);
        setTotalData(result.total);
      } catch (err) {
        console.error("Gagal mengambil daftar peminjaman:", err);

        setError(
          err?.message || "Gagal mengambil data peminjaman."
        );

        setDaftarPeminjaman([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, limit, statusAktif, pencarian]
  );

  useEffect(() => {
    loadPeminjaman(false);
  }, [loadPeminjaman]);

  /* =========================================================
     SEARCH DEBOUNCE
  ========================================================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [pencarian]);

  const handleRefresh = () => {
    if (loading || refreshing) return;

    loadPeminjaman(true);
  };

  /* =========================================================
     SUMMARY
  ========================================================= */

  const summary = useMemo(() => {
    return {
      total: daftarPeminjaman.length,

      menunggu: daftarPeminjaman.filter(
        (i) => i.status === STATUS.MENUNGGU
      ).length,

      disetujui: daftarPeminjaman.filter(
        (i) => i.status === STATUS.DISETUJUI
      ).length,

      dipinjam: daftarPeminjaman.filter(
        (i) => i.status === STATUS.DIPINJAM
      ).length,

      selesai: daftarPeminjaman.filter(
        (i) => i.status === STATUS.DIKEMBALIKAN
      ).length,
    };
  }, [daftarPeminjaman]);

  const totalPages = Math.max(
    1,
    Math.ceil(totalData / limit)
  );

  /* =========================================================
     NAVIGATE
  ========================================================= */

  const bukaDetail = (item) => {
    if (!item?.id) return;

    router.push(
      `/admin/sarpras/peminjaman/${item.id}`
    );
  };

  const bukaAksi = (type, item) => {
    if (!item?.id) return;

    router.push(
      `/admin/sarpras/peminjaman/${item.id}/aksi?type=${type}`
    );
  };

  return (
    <div className="theme-page flex h-screen overflow-hidden">
      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() =>
          setSidebarOpen((v) => !v)
        }
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          toggleSidebar={() =>
            setSidebarOpen((v) => !v)
          }
          notifications={notifications}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AS",
          }}
        />

        <main className="theme-page flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 items-start gap-4">

                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${themePrimaryGradient} text-[var(--color-card)] ${themeCardShadow}`}
                >
                  <ClipboardList size={22} />
                </div>

                <div className="min-w-0">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span
                      className={`h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]`}
                    />

                    <p
                      className={`text-[11px] font-bold uppercase tracking-[0.12em] ${themePrimaryText}`}
                    >
                      Sarana & Prasarana
                    </p>
                  </div>

                  <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-[28px]">
                    Peminjaman Sarana Prasarana
                  </h1>

                  <p className="theme-text-secondary mt-1 text-sm">
                    Kelola pengajuan, penyerahan, dan pengembalian
                    aset sekolah.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading || refreshing}
                className={`theme-card theme-text inline-flex h-11 flex-shrink-0 items-center justify-center gap-2 rounded-xl border ${themePrimaryBorder} px-4 text-sm font-semibold transition-all ${themePrimaryBorderHover} ${themePrimarySoft} disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <RefreshCw
                  size={15}
                  className={
                    loading || refreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                {refreshing ? "Memuat..." : "Refresh"}
              </button>
            </section>

            {/* =================================================
                SUMMARY
            ================================================= */}

            <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              <SummaryCard
                icon={ClipboardList}
                label="Total"
                value={summary.total}
                tone="primary"
              />

              <SummaryCard
                icon={Clock3}
                label="Menunggu"
                value={summary.menunggu}
                tone="warning"
              />

              <SummaryCard
                icon={CheckCircle2}
                label="Disetujui"
                value={summary.disetujui}
                tone="info"
              />

              <SummaryCard
                icon={Package}
                label="Dipinjam"
                value={summary.dipinjam}
                tone="primary"
              />

              <SummaryCard
                icon={RotateCcw}
                label="Selesai"
                value={summary.selesai}
                tone="success"
              />
            </section>

            {/* =================================================
                FILTER
            ================================================= */}

            <section
              className={`theme-card rounded-xl border ${themePrimaryBorder} p-4 ${themeCardShadow}`}
            >
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">

                <div className="relative w-full xl:max-w-md">
                  <Search
                    size={16}
                    className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                  />

                  <input
                    type="text"
                    value={pencarian}
                    onChange={(e) =>
                      setPencarian(e.target.value)
                    }
                    placeholder="Cari nomor peminjaman, keperluan, atau siswa..."
                    className={`theme-input theme-text h-11 w-full rounded-lg border ${themePrimaryBorder} pl-10 pr-3 text-sm outline-none placeholder:theme-text-placeholder transition-colors ${themePrimaryRing}`}
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1">
                  {[
                    {
                      label: "Semua",
                      value: "",
                    },
                    {
                      label: "Menunggu",
                      value: STATUS.MENUNGGU,
                    },
                    {
                      label: "Disetujui",
                      value: STATUS.DISETUJUI,
                    },
                    {
                      label: "Dipinjam",
                      value: STATUS.DIPINJAM,
                    },
                    {
                      label: "Selesai",
                      value: STATUS.DIKEMBALIKAN,
                    },
                    {
                      label: "Ditolak",
                      value: STATUS.DITOLAK,
                    },
                  ].map((filter) => {
                    const aktif =
                      statusAktif === filter.value;

                    return (
                      <button
                        key={
                          filter.value || "semua"
                        }
                        type="button"
                        onClick={() => {
                          setStatusAktif(
                            filter.value
                          );
                          setPage(1);
                        }}
                        className={`inline-flex h-10 items-center whitespace-nowrap rounded-lg border px-3.5 text-xs font-semibold transition-all ${
                          aktif
                            ? `${themePrimaryGradient} border-transparent text-[var(--color-card)]`
                            : `theme-card theme-text-secondary ${themeNeutralBorder} ${themeNeutralHover} hover:text-[var(--color-primary)]`
                        }`}
                      >
                        {filter.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div
                className={`flex items-start gap-3 rounded-xl border ${themeDangerBorder} ${themeDangerSurface} p-4`}
              >
                <div
                  className={`theme-card theme-text flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border ${themeDangerBorder}`}
                >
                  <AlertCircle size={16} />
                </div>

                <div>
                  <p className="theme-text text-sm font-bold">
                    Gagal memuat data
                  </p>

                  <p className="theme-text-secondary mt-1 text-xs">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* =================================================
                TABLE
            ================================================= */}

            <section
              className={`theme-card overflow-hidden rounded-xl border ${themePrimaryBorder} ${themeCardShadow} transition-opacity duration-200 ${
                refreshing
                  ? "pointer-events-none opacity-60"
                  : "opacity-100"
              }`}
            >
              {loading ? (
                <div className="flex min-h-[380px] flex-col items-center justify-center">
                  <Loader2
                    size={26}
                    className={`${themePrimaryText} animate-spin`}
                  />

                  <p className="theme-text-secondary mt-3 text-sm">
                    Memuat data peminjaman...
                  </p>
                </div>
              ) : daftarPeminjaman.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-[1100px] border-collapse">
                    <thead>
                      <tr
                        className={`border-b ${themeDivider} ${themeNeutralSurface}`}
                      >
                        <th
                          className="theme-text-muted w-14 px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider"
                        >
                          No
                        </th>

                        <th className="theme-text-muted px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider">
                          Peminjaman
                        </th>

                        <th className="theme-text-muted px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider">
                          Peminjam
                        </th>

                        <th className="theme-text-muted px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider">
                          Aset
                        </th>

                        <th className="theme-text-muted px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider">
                          Tgl Kembali
                        </th>

                        <th className="theme-text-muted px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider">
                          Status
                        </th>

                        <th className="theme-text-muted w-48 px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {daftarPeminjaman.map(
                        (item, index) => {
                          const nomor =
                            (page - 1) *
                              limit +
                            index +
                            1;

                          return (
                            <tr
                              key={item.id}
                              className={`border-b ${themeDivider} transition-colors ${themeNeutralHover}`}
                            >
                              {/* NO */}
                              <td className="theme-text-muted px-4 py-4 text-center text-xs font-semibold">
                                {nomor}
                              </td>

                              {/* PEMINJAMAN */}
                              <td className="px-4 py-4">
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText}`}
                                  >
                                    <ClipboardList size={15} />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="theme-text truncate text-xs font-bold">
                                      {item.nomorPeminjaman ||
                                        "-"}
                                    </p>

                                    <p className="theme-text-muted mt-1 max-w-[230px] truncate text-[11px]">
                                      {item.keperluan ||
                                        "-"}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* PEMINJAM */}
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText}`}
                                  >
                                    <UserRound size={13} />
                                  </div>

                                  <div>
                                    <p className="theme-text text-xs font-semibold">
                                      {item.peminjam
                                        ?.namaLengkap ||
                                        "-"}
                                    </p>

                                    <p className="theme-text-muted text-[10px]">
                                      {item.peminjam?.nip ||
                                        item.peminjam?.email ||
                                        "Guru"}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* ASET */}
                              <td className="px-4 py-4">
                                <div className="space-y-1">
                                  {item.detailPeminjaman
                                    ?.slice(0, 2)
                                    .map((d) => (
                                      <div
                                        key={d.id}
                                        className="flex items-center gap-2"
                                      >
                                        <Package
                                          size={12}
                                          className={`shrink-0 ${themePrimaryText}`}
                                        />

                                        <span className="theme-text max-w-[180px] truncate text-xs">
                                          {d.aset?.nama ||
                                            "-"}
                                        </span>

                                        <span className="theme-text-muted text-[10px] font-semibold">
                                          ×{d.jumlah}
                                        </span>
                                      </div>
                                    ))}

                                  {item.detailPeminjaman
                                    ?.length > 2 && (
                                    <span className="theme-text-muted text-[10px]">
                                      +
                                      {item
                                        .detailPeminjaman
                                        .length -
                                        2}{" "}
                                      aset lainnya
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* TANGGAL */}
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <CalendarDays
                                    size={13}
                                    className="theme-text-muted"
                                  />

                                  <span className="theme-text-secondary text-xs">
                                    {formatTanggal(
                                      item.tanggalKembaliRencana
                                    )}
                                  </span>
                                </div>
                              </td>

                              {/* STATUS */}
                              <td className="px-4 py-4">
                                <StatusBadge
                                  status={item.status}
                                />
                              </td>

                              {/* AKSI */}
                              <td className="px-4 py-4">
                                <div className="flex items-center justify-end gap-1.5">

                                  {/* DETAIL */}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      bukaDetail(item)
                                    }
                                    className={`theme-card theme-text-secondary inline-flex h-8 items-center gap-1.5 rounded-lg border ${themePrimaryBorder} px-2.5 text-[11px] font-semibold transition-all ${themePrimaryBorderHover} ${themePrimarySoft} hover:text-[var(--color-primary)]`}
                                  >
                                    <Eye size={13} />
                                    Detail
                                  </button>

                                  {/* MENUNGGU */}
                                  {item.status ===
                                    STATUS.MENUNGGU && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          bukaAksi(
                                            "tolak",
                                            item
                                          )
                                        }
                                        className={`theme-text inline-flex h-8 items-center justify-center rounded-lg border ${themeDangerBorder} ${themeDangerSurface} px-2.5 transition-colors ${themeNeutralHover}`}
                                        title="Tolak"
                                      >
                                        <XCircle size={14} />
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          bukaAksi(
                                            "setujui",
                                            item
                                          )
                                        }
                                        className={`inline-flex h-8 items-center justify-center rounded-lg ${themePrimaryGradient} px-2.5 text-[var(--color-card)] transition-opacity hover:opacity-90`}
                                        title="Setujui"
                                      >
                                        <Check size={14} />
                                      </button>
                                    </>
                                  )}

                                  {/* DISETUJUI */}
                                  {item.status ===
                                    STATUS.DISETUJUI && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        bukaAksi(
                                          "serahkan",
                                          item
                                        )
                                      }
                                      className={`inline-flex h-8 items-center gap-1.5 rounded-lg ${themePrimaryGradient} px-2.5 text-[11px] font-semibold text-[var(--color-card)] transition-opacity hover:opacity-90`}
                                    >
                                      <HandCoins size={13} />
                                      Serahkan
                                    </button>
                                  )}

                                  {/* DIPINJAM */}
                                  {item.status ===
                                    STATUS.DIPINJAM && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        bukaAksi(
                                          "kembalikan",
                                          item
                                        )
                                      }
                                      className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[var(--color-success)] px-2.5 text-[11px] font-semibold text-[var(--color-card)] transition-opacity hover:opacity-90"
                                    >
                                      <Undo2 size={13} />
                                      Kembalikan
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* =================================================
                  PAGINATION
              ================================================= */}

              {!loading &&
                daftarPeminjaman.length > 0 && (
                  <div
                    className={`flex flex-col gap-3 border-t ${themeDivider} px-4 py-3 sm:flex-row sm:items-center sm:justify-between`}
                  >
                    <p className="theme-text-muted text-[11px]">
                      Menampilkan{" "}
                      <span className="theme-text-secondary font-semibold">
                        {(page - 1) * limit + 1}
                      </span>{" "}
                      -{" "}
                      <span className="theme-text-secondary font-semibold">
                        {Math.min(
                          page * limit,
                          totalData ||
                            page * limit
                        )}
                      </span>{" "}
                      dari{" "}
                      <span className="theme-text-secondary font-semibold">
                        {totalData}
                      </span>{" "}
                      data
                    </p>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() =>
                          setPage((v) =>
                            Math.max(1, v - 1)
                          )
                        }
                        className={`theme-card theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg border ${themePrimaryBorder} transition-all ${themePrimaryBorderHover} ${themePrimarySoft} hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-40`}
                      >
                        <ChevronLeft size={15} />
                      </button>

                      <span className="theme-text-secondary px-3 text-xs font-semibold">
                        {page} / {totalPages}
                      </span>

                      <button
                        type="button"
                        disabled={
                          page >= totalPages
                        }
                        onClick={() =>
                          setPage((v) =>
                            Math.min(
                              totalPages,
                              v + 1
                            )
                          )
                        }
                        className={`theme-card theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg border ${themePrimaryBorder} transition-all ${themePrimaryBorderHover} ${themePrimarySoft} hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-40`}
                      >
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>
                )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   SUB COMPONENTS
========================================================= */

function SummaryCard({
  icon: Icon,
  label,
  value,
  tone = "primary",
}) {
  const tones = {
    primary: {
      surface:
        "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]",
      border:
        "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]",
      text: "text-[var(--color-primary)]",
    },

    warning: {
      surface:
        "bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)]",
      border:
        "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]",
      text: "text-[var(--color-warning)]",
    },

    info: {
      surface:
        "bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)]",
      border:
        "border-[color-mix(in_srgb,var(--color-info)_24%,transparent)]",
      text: "text-[var(--color-info)]",
    },

    success: {
      surface:
        "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]",
      border:
        "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]",
      text: "text-[var(--color-success)]",
    },
  };

  const current = tones[tone] || tones.primary;

  return (
    <div
      className={`theme-card rounded-xl border ${themePrimaryBorder} p-4 ${themeCardShadow}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wider">
            {label}
          </p>

          <p className="theme-text mt-1 text-xl font-bold tracking-tight">
            {value}
          </p>
        </div>

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg border ${current.border} ${current.surface} ${current.text}`}
        >
          <Icon size={16} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold ${cfg.className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`}
      />

      {cfg.label}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-xl border ${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText}`}
      >
        <ClipboardList size={22} />
      </div>

      <p className="theme-text mt-4 text-sm font-bold">
        Belum ada data peminjaman
      </p>

      <p className="theme-text-secondary mt-1 max-w-sm text-xs">
        Pengajuan peminjaman dari guru akan muncul di halaman ini.
      </p>
    </div>
  );
}