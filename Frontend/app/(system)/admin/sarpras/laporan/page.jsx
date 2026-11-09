"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  FileBarChart,
  Search,
  Download,
  SlidersHorizontal,
  Building2,
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  RefreshCw,
  Loader2,
  AlertCircle,
  ClipboardList,
} from "lucide-react";
import { getLaporanKerusakan } from "@/services/sarpras.service";

const jenisOptions = ["Semua", "Kerusakan", "Pemeriksaan"];
const targetOptions = ["Semua", "Fasilitas", "Inventaris"];
const statusOptions = ["Semua", "Menunggu", "Diproses", "Selesai"];

const themePrimarySurface =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimaryBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText = "text-[var(--color-primary)]";

const themePrimaryHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_88%,var(--color-text))]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeSuccessText = "text-[var(--color-success)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeWarningText = "text-[var(--color-warning)]";

const statusStyle = {
  Menunggu: `${themeWarningText} ${themeWarningSurface} ${themeWarningBorder}`,
  Diproses: `${themePrimaryText} ${themePrimarySurface} ${themePrimaryBorder}`,
  Selesai: `${themeSuccessText} ${themeSuccessSurface} ${themeSuccessBorder}`,
};

const statusIcon = {
  Menunggu: {
    icon: Clock,
    tone: `${themeWarningText} ${themeWarningSurface}`,
  },
  Diproses: {
    icon: AlertTriangle,
    tone: `${themePrimaryText} ${themePrimarySurface}`,
  },
  Selesai: {
    icon: CheckCircle2,
    tone: `${themeSuccessText} ${themeSuccessSurface}`,
  },
};

function unwrapResponse(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.data?.laporan)) {
    return response.data.laporan;
  }

  if (Array.isArray(response?.data?.laporanKerusakan)) {
    return response.data.laporanKerusakan;
  }

  if (Array.isArray(response?.laporan)) {
    return response.laporan;
  }

  if (Array.isArray(response?.laporanKerusakan)) {
    return response.laporanKerusakan;
  }

  return [];
}

function getStatusLabel(status) {
  if (!status) return "Menunggu";

  const normalized = String(status).toLowerCase().replace(/[\s_-]/g, "");

  if (
    ["menunggu", "pending", "diajukan", "baru", "menungguverifikasi"].includes(
      normalized
    )
  ) {
    return "Menunggu";
  }

  if (
    ["diproses", "process", "processing", "dalamproses", "ditindaklanjuti"].includes(
      normalized
    )
  ) {
    return "Diproses";
  }

  if (
    ["selesai", "completed", "complete", "done", "ditutup"].includes(
      normalized
    )
  ) {
    return "Selesai";
  }

  return status;
}

function getJenisLabel(item) {
  const value =
    item?.jenis ||
    item?.jenisLaporan ||
    item?.tipe ||
    item?.tipeLaporan ||
    item?.kategori ||
    "";

  const normalized = String(value).toLowerCase();

  if (normalized.includes("periksa") || normalized.includes("pemeriksaan")) {
    return "Pemeriksaan";
  }

  return "Kerusakan";
}

function getTargetLabel(item) {
  const value =
    item?.target ||
    item?.jenisTarget ||
    item?.tipeTarget ||
    item?.targetLaporan ||
    "";

  const normalized = String(value).toLowerCase();

  if (
    normalized.includes("fasilitas") ||
    item?.fasilitas ||
    item?.fasilitasId
  ) {
    return "Fasilitas";
  }

  if (
    normalized.includes("inventaris") ||
    item?.aset ||
    item?.asetId
  ) {
    return "Inventaris";
  }

  return "-";
}

function getJudul(item) {
  return (
    item?.judul ||
    item?.judulLaporan ||
    item?.nama ||
    item?.namaLaporan ||
    item?.deskripsi ||
    item?.keterangan ||
    "Laporan tanpa judul"
  );
}

function getPelapor(item) {
  return (
    item?.pelapor?.namaLengkap ||
    item?.pelapor?.nama ||
    item?.dilaporkanOleh?.namaLengkap ||
    item?.dilaporkanOleh?.nama ||
    item?.user?.namaLengkap ||
    item?.user?.nama ||
    item?.namaPelapor ||
    item?.pelaporNama ||
    "-"
  );
}

function getTanggal(item) {
  return (
    item?.tanggalLaporan ||
    item?.tanggal ||
    item?.dibuatPada ||
    item?.createdAt ||
    item?.created_at ||
    null
  );
}

function formatTanggal(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function normalizeLaporan(item) {
  const status = getStatusLabel(
    item?.status || item?.statusLaporan || item?.statusPenanganan
  );

  return {
    ...item,
    id: item?.id || item?._id,
    judul: getJudul(item),
    jenis: getJenisLabel(item),
    target: getTargetLabel(item),
    pelapor: getPelapor(item),
    tanggal: getTanggal(item),
    status,
    asetNama:
      item?.aset?.nama ||
      item?.aset?.namaAset ||
      item?.fasilitas?.nama ||
      "-",
  };
}

function escapeCsv(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export default function LaporanPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [laporanList, setLaporanList] = useState([]);
  const [search, setSearch] = useState("");
  const [jenisFilter, setJenisFilter] = useState("Semua");
  const [targetFilter, setTargetFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const notifications = [];

  const loadLaporan = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const params = {};

      if (search.trim()) {
        params.search = search.trim();
      }

      if (statusFilter !== "Semua") {
        params.status = statusFilter;
      }

      const response = await getLaporanKerusakan(params);
      const data = unwrapResponse(response);

      setLaporanList(data.map(normalizeLaporan));
    } catch (err) {
      console.error("Gagal mengambil laporan kerusakan:", err);
      setError(
        err?.message ||
          "Gagal mengambil data laporan. Silakan coba beberapa saat lagi."
      );
      setLaporanList([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadLaporan();
    }, 300);

    return () => clearTimeout(timeout);
  }, [loadLaporan]);

  const filteredList = useMemo(() => {
    return laporanList.filter((item) => {
      const keyword = search.trim().toLowerCase();

      const matchSearch =
        !keyword ||
        item.judul.toLowerCase().includes(keyword) ||
        item.pelapor.toLowerCase().includes(keyword) ||
        item.asetNama.toLowerCase().includes(keyword);

      const matchJenis =
        jenisFilter === "Semua" || item.jenis === jenisFilter;

      const matchTarget =
        targetFilter === "Semua" || item.target === targetFilter;

      const matchStatus =
        statusFilter === "Semua" || item.status === statusFilter;

      return matchSearch && matchJenis && matchTarget && matchStatus;
    });
  }, [laporanList, search, jenisFilter, targetFilter, statusFilter]);

  const quickStats = useMemo(
    () => [
      {
        key: "total",
        label: "Total Laporan",
        value: laporanList.length,
        icon: FileBarChart,
        tone: `${themePrimaryText} ${themePrimarySurface}`,
      },
      {
        key: "menunggu",
        label: "Menunggu Tindak Lanjut",
        value: laporanList.filter((item) => item.status === "Menunggu").length,
        icon: Clock,
        tone: `${themeWarningText} ${themeWarningSurface}`,
      },
      {
        key: "diproses",
        label: "Sedang Diproses",
        value: laporanList.filter((item) => item.status === "Diproses").length,
        icon: AlertTriangle,
        tone: `${themePrimaryText} ${themePrimarySurface}`,
      },
      {
        key: "selesai",
        label: "Selesai",
        value: laporanList.filter((item) => item.status === "Selesai").length,
        icon: CheckCircle2,
        tone: `${themeSuccessText} ${themeSuccessSurface}`,
      },
    ],
    [laporanList]
  );

  const handleExport = () => {
    if (filteredList.length === 0) {
      window.alert("Tidak ada data laporan untuk diekspor.");
      return;
    }

    const headers = [
      "Judul Laporan",
      "Jenis",
      "Target",
      "Nama Aset",
      "Pelapor",
      "Tanggal",
      "Status",
    ];

    const rows = filteredList.map((item) => [
      item.judul,
      item.jenis,
      item.target,
      item.asetNama,
      item.pelapor,
      formatTanggal(item.tanggal),
      item.status,
    ]);

    const csvContent = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `laporan-sarpras-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleResetFilter = () => {
    setSearch("");
    setJenisFilter("Semua");
    setTargetFilter("Semua");
    setStatusFilter("Semua");
  };

  return (
    <div className="flex min-h-screen theme-page">
      <Sidebar
        role="adminSarpras"
        active="laporan"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen((previous) => !previous)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          toggleSidebar={() => setSidebarOpen((previous) => !previous)}
          notifications={notifications}
          user={{
            name: "Admin Sarpras",
            email: "adminsarpras@smartschool.com",
            avatar: "SP",
          }}
        />

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="w-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div className="min-w-0">
                <p
                  className={`text-xs font-medium ${themePrimaryText} uppercase tracking-wide`}
                >
                  Sarana & Prasarana
                </p>

                <h1 className="text-2xl sm:text-[28px] font-bold theme-text mt-1 tracking-tight">
                  Laporan
                </h1>

                <p className="text-sm theme-text-secondary mt-1">
                  Pantau laporan kerusakan dan pemeriksaan fasilitas serta
                  inventaris.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => loadLaporan(true)}
                  disabled={loading || refreshing}
                  className={`
                    inline-flex items-center justify-center gap-2
                    px-3.5 py-2.5 rounded-xl
                    border theme-border theme-text
                    ${themeNeutralSurface}
                    text-sm font-medium transition-colors
                    hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]
                    disabled:opacity-50
                  `}
                >
                  <RefreshCw
                    size={16}
                    className={refreshing ? "animate-spin" : ""}
                  />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                <button
                  type="button"
                  onClick={handleExport}
                  disabled={filteredList.length === 0}
                  className={`
                    inline-flex items-center gap-2
                    px-4 py-2.5 rounded-xl
                    bg-[var(--color-primary)]
                    ${themePrimaryHover}
                    text-[var(--color-card)]
                    text-sm font-medium
                    ${themePrimaryShadow}
                    transition-all
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <Download size={16} />
                  Export Laporan
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickStats.map(({ key, label, value, icon: Icon, tone }) => (
                <div
                  key={key}
                  className={`
                    theme-card rounded-2xl border theme-border
                    ${themeCardShadow}
                    p-4 flex items-center gap-3.5
                  `}
                >
                  <div
                    className={`
                      w-11 h-11 rounded-xl
                      flex items-center justify-center flex-shrink-0
                      ${tone}
                    `}
                  >
                    <Icon size={20} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xl font-bold theme-text leading-none">
                      {value}
                    </p>

                    <p className="text-xs theme-text-muted mt-1 truncate">
                      {label}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div
              className={`
                theme-card rounded-2xl border theme-border
                ${themeCardShadow}
                p-4 flex flex-col lg:flex-row gap-3
              `}
            >
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="
                    absolute left-3.5 top-1/2
                    -translate-y-1/2 theme-text-placeholder
                  "
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Cari judul laporan, aset, atau pelapor..."
                  className={`
                    w-full pl-10 pr-4 py-2.5
                    rounded-xl theme-input text-sm theme-text
                    placeholder:theme-text-placeholder
                    focus:outline-none ${themeFocus}
                    transition-colors
                  `}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <SlidersHorizontal
                    size={14}
                    className="
                      absolute left-3.5 top-1/2
                      -translate-y-1/2 theme-text-placeholder
                      pointer-events-none
                    "
                  />

                  <select
                    value={jenisFilter}
                    onChange={(event) => setJenisFilter(event.target.value)}
                    className={`
                      pl-9 pr-8 py-2.5 rounded-xl theme-input
                      text-sm theme-text focus:outline-none
                      ${themeFocus} transition-colors appearance-none
                    `}
                  >
                    {jenisOptions.map((jenis) => (
                      <option key={jenis} value={jenis}>
                        {jenis}
                      </option>
                    ))}
                  </select>
                </div>

                <select
                  value={targetFilter}
                  onChange={(event) => setTargetFilter(event.target.value)}
                  className={`
                    px-4 py-2.5 rounded-xl theme-input
                    text-sm theme-text focus:outline-none
                    ${themeFocus} transition-colors appearance-none
                  `}
                >
                  {targetOptions.map((target) => (
                    <option key={target} value={target}>
                      {target}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className={`
                    px-4 py-2.5 rounded-xl theme-input
                    text-sm theme-text focus:outline-none
                    ${themeFocus} transition-colors appearance-none
                  `}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleResetFilter}
                  className={`
                    px-4 py-2.5 rounded-xl border
                    ${themeNeutralBorder} ${themeNeutralSurface}
                    theme-text-secondary text-sm
                    hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]
                    transition-colors
                  `}
                >
                  Reset
                </button>
              </div>
            </div>

            {error && (
              <div
                className={`
                  flex items-start gap-3 p-4 rounded-xl
                  border ${themeWarningBorder} ${themeWarningSurface}
                `}
              >
                <AlertCircle
                  size={19}
                  className={`${themeWarningText} mt-0.5 flex-shrink-0`}
                />

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${themeWarningText}`}>
                    Gagal memuat laporan
                  </p>

                  <p className="text-sm theme-text-secondary mt-1">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => loadLaporan(true)}
                  className={`text-sm font-medium ${themePrimaryText}`}
                >
                  Coba lagi
                </button>
              </div>
            )}

            <div
              className={`
                theme-card rounded-2xl border theme-border
                ${themeCardShadow} overflow-hidden
              `}
            >
              <div
                className={`
                  flex items-center justify-between gap-2
                  px-5 py-4 border-b ${themeDivider}
                `}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`
                      p-1.5 rounded-lg ${themePrimarySurface}
                      ${themePrimaryText} flex-shrink-0
                    `}
                  >
                    <FileBarChart size={16} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold theme-text truncate">
                      Daftar Laporan
                    </h3>

                    <p className="text-xs theme-text-muted">
                      {loading
                        ? "Memuat data laporan..."
                        : `${filteredList.length} laporan ditemukan`}
                    </p>
                  </div>
                </div>

                <span className="text-xs theme-text-muted">
                  Data dari server
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-sm">
                  <thead>
                    <tr
                      className={`
                        text-left text-xs theme-text-muted
                        border-b ${themeDivider}
                      `}
                    >
                      <th className="px-5 py-3 font-medium">
                        Judul Laporan
                      </th>

                      <th className="px-5 py-3 font-medium">Jenis</th>

                      <th className="px-5 py-3 font-medium">Target</th>

                      <th className="px-5 py-3 font-medium">Pelapor</th>

                      <th className="px-5 py-3 font-medium">Tanggal</th>

                      <th className="px-5 py-3 font-medium">Status</th>
                    </tr>
                  </thead>

                  <tbody
                    className={`
                      divide-y
                      divide-[color-mix(in_srgb,var(--color-text)_8%,transparent)]
                    `}
                  >
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="py-14 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <Loader2
                              size={25}
                              className={`animate-spin ${themePrimaryText}`}
                            />
                            <span className="text-sm theme-text-muted">
                              Mengambil data laporan...
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredList.length > 0 ? (
                      filteredList.map((item, index) => {
                        const status =
                          statusIcon[item.status] || statusIcon.Menunggu;

                        const StatusIcon = status.icon;

                        const TargetIcon =
                          item.target === "Fasilitas"
                            ? Building2
                            : item.target === "Inventaris"
                              ? Package
                              : ClipboardList;

                        return (
                          <tr
                            key={item.id || index}
                            className="
                              transition-colors
                              hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)]
                            "
                          >
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`
                                    w-9 h-9 rounded-lg
                                    flex items-center justify-center
                                    flex-shrink-0 ${status.tone}
                                  `}
                                >
                                  <StatusIcon size={16} />
                                </div>

                                <div className="min-w-0">
                                  <p className="font-medium theme-text">
                                    {item.judul}
                                  </p>

                                  {item.asetNama !== "-" && (
                                    <p className="text-xs theme-text-muted mt-0.5">
                                      {item.asetNama}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-3.5 theme-text-secondary">
                              {item.jenis}
                            </td>

                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-1.5 theme-text-secondary">
                                <TargetIcon
                                  size={14}
                                  className="theme-text-placeholder"
                                />
                                {item.target}
                              </div>
                            </td>

                            <td className="px-5 py-3.5 theme-text-secondary">
                              {item.pelapor}
                            </td>

                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-1.5 theme-text-secondary">
                                <Calendar
                                  size={13}
                                  className="theme-text-placeholder"
                                />
                                {formatTanggal(item.tanggal)}
                              </div>
                            </td>

                            <td className="px-5 py-3.5">
                              <span
                                className={`
                                  inline-flex items-center
                                  text-[11px] font-medium
                                  px-2 py-1 rounded-full border
                                  ${
                                    statusStyle[item.status] ||
                                    statusStyle.Menunggu
                                  }
                                `}
                              >
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-14 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <div
                              className={`
                                w-12 h-12 rounded-2xl
                                flex items-center justify-center
                                ${themeNeutralSurface}
                              `}
                            >
                              <FileBarChart
                                size={22}
                                className="theme-text-muted"
                              />
                            </div>

                            <p className="text-sm font-medium theme-text">
                              Tidak ada laporan ditemukan
                            </p>

                            <p className="text-xs theme-text-muted">
                              Belum ada laporan yang sesuai dengan filter.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}