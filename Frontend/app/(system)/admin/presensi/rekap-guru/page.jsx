"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";

import {
  Search,
  RefreshCw,
  Download,
  CalendarDays,
  Users,
  CheckCircle2,
  Clock3,
  CircleAlert,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Database,
  Activity,
  FileSpreadsheet,
  UserCheck,
  UserX,
  Loader2,
} from "lucide-react";

/* =========================================================
   API
========================================================= */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const REKAP_GURU_ENDPOINT =
  `${API_URL}/api/v1/absensi/rekap-guru`;

const EXPORT_ENDPOINT =
  `${API_URL}/api/v1/absensi/export`;

/* =========================================================
   HELPER
========================================================= */

function getTodayDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function normalizeStatus(status, item = {}) {
  const value = String(status || "")
    .toLowerCase()
    .trim();

  if (value === "hadir") {
    return "hadir";
  }

  if (
    value === "terlambat" ||
    value === "late"
  ) {
    return "terlambat";
  }

  if (value === "izin") {
    return "izin";
  }

  if (value === "sakit") {
    return "sakit";
  }

  if (
    value === "alpha" ||
    value === "alpa"
  ) {
    return "alpha";
  }

  if (
    item?.jamMasuk ||
    item?.waktuMasuk ||
    item?.jam_masuk
  ) {
    return "hadir";
  }

  return "alpha";
}

function formatTanggalIndonesia(tanggal) {
  if (!tanggal) return "-";

  const date = new Date(`${tanggal}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return tanggal;
  }

  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatJam(value) {
  if (!value || value === "-") {
    return "-";
  }

  try {
    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  } catch {
    // ignore
  }

  const stringValue = String(value);

  if (/^\d{2}:\d{2}(:\d{2})?$/.test(stringValue)) {
    return stringValue.slice(0, 5);
  }

  return stringValue;
}

/* =========================================================
   NORMALIZE DATA GURU
========================================================= */

function normalizeGuru(item, index) {
  const guru = item?.pengguna || item?.guru || {};

  const id =
    item?.id ??
    item?.penggunaId ??
    guru?.id ??
    `guru-${index}`;

  const nama =
    item?.nama ??
    item?.namaLengkap ??
    item?.namaGuru ??
    item?.pengguna?.namaLengkap ??
    guru?.namaLengkap ??
    guru?.nama ??
    "-";

  const nip =
    item?.nip ??
    item?.pengguna?.nip ??
    guru?.nip ??
    "-";

  const jabatan =
    item?.jabatan ??
    item?.pengguna?.jabatan ??
    guru?.jabatan ??
    item?.peran?.nama ??
    guru?.peran?.nama ??
    "Guru";

  const status = normalizeStatus(
    item?.status ??
      item?.statusAbsensi ??
      item?.statusKehadiran ??
      item?.kehadiran,
    item
  );

  const jamMasuk =
    item?.jamMasuk ??
    item?.waktuMasuk ??
    item?.jam_masuk ??
    item?.checkIn ??
    item?.waktuCheckIn ??
    "-";

  const jamPulang =
    item?.jamPulang ??
    item?.waktuPulang ??
    item?.jam_pulang ??
    item?.checkOut ??
    item?.waktuCheckOut ??
    "-";

  const terlambat = Number(
    item?.terlambat ??
      item?.jumlahTerlambat ??
      item?.totalTerlambat ??
      0
  );

  const izin = Number(
    item?.izin ??
      item?.totalIzin ??
      0
  );

  const sakit = Number(
    item?.sakit ??
      item?.totalSakit ??
      0
  );

  const alpha = Number(
    item?.alpha ??
      item?.alpa ??
      item?.totalAlpha ??
      item?.totalAlpa ??
      0
  );

  return {
    id,
    nama,
    nip,
    jabatan,
    status,
    jamMasuk: formatJam(jamMasuk),
    jamPulang: formatJam(jamPulang),
    terlambat,
    izin,
    sakit,
    alpha,
    original: item,
  };
}

/* =========================================================
   STATUS CONFIG
========================================================= */

const STATUS_CONFIG = {
  hadir: {
    label: "Hadir",
    icon: CheckCircle2,
    className: "theme-success",
  },

  terlambat: {
    label: "Terlambat",
    icon: Clock3,
    className: "theme-warning",
  },

  izin: {
    label: "Izin",
    icon: CircleAlert,
    className: "theme-info",
  },

  sakit: {
    label: "Sakit",
    icon: CircleAlert,
    className: "theme-warning",
  },

  alpha: {
    label: "Alpha",
    icon: CircleAlert,
    className: "theme-danger",
  },
};

/* =========================================================
   PAGE
========================================================= */

export default function RekapGuruPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [tanggal, setTanggal] = useState(
    () => getTodayDate()
  );

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("semua");
  const [selectedGuru, setSelectedGuru] =
    useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [exportLoading, setExportLoading] =
    useState(false);

  const getToken = () => {
    if (typeof window === "undefined") {
      return null;
    }

    return (
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken")
    );
  };

  /* =======================================================
     FETCH
  ======================================================= */

  const fetchRekapGuru = useCallback(
    async (showRefreshLoading = true) => {
      const token = getToken();

      if (!token) {
        setError(
          "Sesi login tidak ditemukan. Silakan login kembali."
        );
        return;
      }

      if (showRefreshLoading) {
        setLoading(true);
      }

      setError("");

      try {
        const url =
          `${REKAP_GURU_ENDPOINT}?tanggal=` +
          encodeURIComponent(tanggal);

        const response = await fetch(url, {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },

          cache: "no-store",
        });

        const text = await response.text();

        let result = null;

        try {
          result = text ? JSON.parse(text) : null;
        } catch {
          console.error(
            "Response mentah dari server:",
            text
          );

          throw new Error(
            `Response dari server bukan JSON yang valid: ${text.slice(
              0,
              500
            )}`
          );
        }

        if (!response.ok) {
          throw new Error(
            result?.message ||
              result?.error ||
              result?.detail ||
              `Gagal mengambil rekap guru (${response.status})`
          );
        }

        let rawData = [];

        if (Array.isArray(result)) {
          rawData = result;
        } else if (Array.isArray(result?.data)) {
          rawData = result.data;
        } else if (
          Array.isArray(result?.data?.data)
        ) {
          rawData = result.data.data;
        } else if (Array.isArray(result?.rows)) {
          rawData = result.rows;
        } else if (
          Array.isArray(result?.results)
        ) {
          rawData = result.results;
        }

        const normalized = rawData.map(
          normalizeGuru
        );

        setData(normalized);
        setPage(1);
      } catch (err) {
        console.error(
          "ERROR FETCH REKAP GURU:",
          err
        );

        setData([]);

        setError(
          err?.message ||
            "Gagal mengambil data rekap guru."
        );
      } finally {
        setLoading(false);
      }
    },
    [tanggal]
  );

  useEffect(() => {
    fetchRekapGuru();
  }, [fetchRekapGuru]);

  /* =======================================================
     AUTO REFRESH
  ======================================================= */

  useEffect(() => {
    const interval = setInterval(() => {
      fetchRekapGuru(false);
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchRekapGuru]);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredData = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return data.filter((guru) => {
      const matchSearch =
        !keyword ||
        guru.nama.toLowerCase().includes(keyword) ||
        guru.nip.toLowerCase().includes(keyword) ||
        guru.jabatan.toLowerCase().includes(keyword);

      const matchStatus =
        statusFilter === "semua" ||
        guru.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [data, search, statusFilter]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / limit)
  );

  const paginatedData = useMemo(() => {
    const start = (page - 1) * limit;
    const end = start + limit;

    return filteredData.slice(start, end);
  }, [filteredData, page, limit]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const statistics = useMemo(() => {
    const total = data.length;

    const hadir = data.filter(
      (guru) => guru.status === "hadir"
    ).length;

    const terlambat = data.filter(
      (guru) => guru.status === "terlambat"
    ).length;

    const izin = data.filter(
      (guru) => guru.status === "izin"
    ).length;

    const sakit = data.filter(
      (guru) => guru.status === "sakit"
    ).length;

    const alpha = data.filter(
      (guru) => guru.status === "alpha"
    ).length;

    return {
      total,
      hadir,
      terlambat,
      izin,
      sakit,
      alpha,
    };
  }, [data]);

  /* =======================================================
     HANDLERS
  ======================================================= */

  const handleTanggalChange = (event) => {
    setTanggal(event.target.value);
    setPage(1);
  };

  const handleRefresh = () => {
    fetchRekapGuru(true);
  };

  const handleExport = async () => {
    const token = getToken();

    if (!token) {
      setError("Sesi login tidak ditemukan.");
      return;
    }

    setExportLoading(true);

    try {
      const url =
        `${EXPORT_ENDPOINT}?tanggal=` +
        encodeURIComponent(tanggal);

      const response = await fetch(url, {
        method: "GET",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let message = "Gagal melakukan export.";

        try {
          const result = await response.json();

          message =
            result?.message ||
            result?.error ||
            message;
        } catch {
          // ignore
        }

        throw new Error(message);
      }

      const blob = await response.blob();

      const downloadUrl =
        window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = downloadUrl;

      link.download = `rekap-guru-${tanggal}.xlsx`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("EXPORT ERROR:", err);

      setError(
        err?.message ||
          "Gagal melakukan export."
      );
    } finally {
      setExportLoading(false);
    }
  };

  const renderStatus = (status) => {
    const config =
      STATUS_CONFIG[status] ||
      STATUS_CONFIG.alpha;

    const Icon = config.icon;

    return (
      <span
        className={`
          inline-flex
          items-center
          gap-1.5
          rounded-full
          border
          px-2.5
          py-1
          text-[11px]
          font-semibold
          whitespace-nowrap
          ${config.className}
        `}
      >
        <Icon size={12} />

        {config.label}
      </span>
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="flex h-screen w-full theme-page overflow-hidden">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar
        role="admin"
        activeMenu="rekap-guru"
        isOpen={sidebarOpen}
        onToggle={() =>
          setSidebarOpen(!sidebarOpen)
        }
      />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          title="Rekap Absensi Guru"
          onMenuClick={() =>
            setSidebarOpen(!sidebarOpen)
          }
        />

        {/* =====================================================
            PAGE
        ===================================================== */}

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">

            {/* =================================================
                PAGE HEADER
            ================================================== */}

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl theme-primary flex items-center justify-center shadow-lg shrink-0">
                  <Users size={20} />
                </div>

                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold theme-text truncate">
                    Rekap Absensi Guru
                  </h1>

                  <p className="text-xs sm:text-sm theme-text-muted mt-1">
                    Pantau kehadiran guru berdasarkan tanggal yang dipilih.
                  </p>
                </div>
              </div>

              {/* ACTION */}

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    px-4
                    py-2.5
                    rounded-xl
                    border
                    theme-border
                    theme-input
                    text-sm
                    font-semibold
                    theme-sidebar-hover
                    transition
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
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

                <button
                  type="button"
                  onClick={handleExport}
                  disabled={
                    exportLoading ||
                    data.length === 0
                  }
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    px-4
                    py-2.5
                    rounded-xl
                    theme-primary
                    text-sm
                    font-semibold
                    shadow-sm
                    transition
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {exportLoading ? (
                    <>
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />
                      Export...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet
                        size={15}
                      />
                      Export Excel
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* =================================================
                ERROR
            ================================================== */}

            {error && (
              <div className="flex items-start gap-3 rounded-xl border theme-danger p-4">
                <CircleAlert
                  size={19}
                  className="mt-0.5 shrink-0"
                />

                <div className="flex-1">
                  <p className="text-sm font-semibold">
                    Terjadi kesalahan
                  </p>

                  <p className="mt-0.5 text-sm">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setError("")}
                  className="
                    opacity-70
                    hover:opacity-100
                    transition
                  "
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* =================================================
                FILTER TANGGAL
            ================================================== */}

            <section className="theme-card rounded-2xl border theme-border shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 lg:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                  <div className="w-full lg:max-w-xs">
                    <label
                      htmlFor="tanggal"
                      className="mb-2 block text-xs font-semibold theme-text-secondary"
                    >
                      Tanggal Absensi
                    </label>

                    <div className="relative">
                      <CalendarDays
                        size={16}
                        className="
                          pointer-events-none
                          absolute
                          left-3
                          top-1/2
                          -translate-y-1/2
                          theme-text-placeholder
                        "
                      />

                      <input
                        id="tanggal"
                        type="date"
                        value={tanggal}
                        onChange={
                          handleTanggalChange
                        }
                        className="
                          theme-input
                          h-11
                          w-full
                          rounded-xl
                          border
                          pl-9
                          pr-3
                          text-sm
                          font-medium
                          outline-none
                          transition
                          focus:outline-none
                        "
                      />
                    </div>
                  </div>

                  <div className="pb-2 text-xs sm:text-sm theme-text-muted">
                    Menampilkan data untuk:{" "}
                    <span className="font-semibold theme-text">
                      {formatTanggalIndonesia(
                        tanggal
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                STATISTICS
            ================================================== */}

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              <StatCard
                title="Total Guru"
                value={statistics.total}
                description="Total data guru"
                icon={Users}
                iconClass="theme-text"
                loading={loading}
              />

              <StatCard
                title="Hadir"
                value={statistics.hadir}
                description="Guru hadir"
                icon={UserCheck}
                iconClass="text-[var(--color-success)]"
                loading={loading}
              />

              <StatCard
                title="Terlambat"
                value={statistics.terlambat}
                description="Guru terlambat"
                icon={Clock3}
                iconClass="text-[var(--color-warning)]"
                loading={loading}
              />

              <StatCard
                title="Izin"
                value={statistics.izin}
                description="Guru izin"
                icon={CircleAlert}
                iconClass="text-[var(--color-info)]"
                loading={loading}
              />

              <StatCard
                title="Alpha"
                value={statistics.alpha}
                description="Guru alpha"
                icon={UserX}
                iconClass="text-[var(--color-danger)]"
                loading={loading}
              />
            </div>

            {/* =================================================
                SEARCH + FILTER STATUS
            ================================================== */}

            <section className="theme-card rounded-2xl border theme-border shadow-sm p-4">
              <div className="flex flex-col lg:flex-row gap-3">
                {/* SEARCH */}

                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2
                      theme-text-placeholder
                    "
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) => {
                      setSearch(
                        event.target.value
                      );
                      setPage(1);
                    }}
                    placeholder="Cari nama guru, NIP, atau jabatan..."
                    className="
                      theme-input
                      w-full
                      pl-9
                      pr-10
                      py-2.5
                      text-sm
                      rounded-xl
                      border
                      outline-none
                      transition
                      focus:outline-none
                    "
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setPage(1);
                      }}
                      className="
                        absolute
                        right-3
                        top-1/2
                        -translate-y-1/2
                        theme-text-muted
                        hover:theme-text
                        transition
                      "
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                {/* STATUS FILTER */}

                <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
                  {[
                    ["semua", "Semua"],
                    ["hadir", "Hadir"],
                    ["terlambat", "Terlambat"],
                    ["izin", "Izin"],
                    ["sakit", "Sakit"],
                    ["alpha", "Alpha"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setStatusFilter(value);
                        setPage(1);
                      }}
                      className={`
                        whitespace-nowrap
                        rounded-xl
                        border
                        px-3.5
                        py-2
                        text-xs
                        font-semibold
                        transition
                        ${
                          statusFilter === value
                            ? "theme-primary"
                            : "theme-input theme-sidebar-hover"
                        }
                      `}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* =================================================
                TABLE
            ================================================== */}

            <section className="theme-card rounded-2xl border theme-border shadow-sm overflow-hidden">
              {/* TABLE HEADER */}

              <div
                className="
                  px-4
                  sm:px-5
                  lg:px-6
                  py-4
                  border-b
                  theme-border
                  flex
                  flex-col
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  gap-3
                "
              >
                <div>
                  <div className="flex items-center gap-2">
                    <div
                      className="
                        w-8
                        h-8
                        rounded-lg
                        theme-info
                        border
                        theme-border
                        flex
                        items-center
                        justify-center
                      "
                    >
                      <Database
                        size={15}
                      />
                    </div>

                    <h2 className="text-sm font-bold theme-text">
                      Data Rekap Guru
                    </h2>
                  </div>

                  <p className="text-xs theme-text-muted mt-1">
                    Daftar kehadiran guru pada tanggal yang dipilih.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs theme-text-muted">
                  <Activity
                    size={14}
                    className="text-[var(--color-primary)]"
                  />

                  Auto-refresh setiap 10 detik
                </div>
              </div>

              {/* TABLE */}

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-sm border-collapse">
                  <thead>
                    <tr className="theme-primary">
                      <th className="px-4 py-3 text-center font-semibold w-[65px]">
                        No
                      </th>

                      <th className="px-4 py-3 text-left font-semibold">
                        Guru
                      </th>

                      <th className="px-4 py-3 text-left font-semibold">
                        NIP
                      </th>

                      <th className="px-4 py-3 text-left font-semibold">
                        Jabatan
                      </th>

                      <th className="px-4 py-3 text-left font-semibold">
                        Status
                      </th>

                      <th className="px-4 py-3 text-left font-semibold">
                        Jam Masuk
                      </th>

                      <th className="px-4 py-3 text-left font-semibold">
                        Jam Pulang
                      </th>

                      <th className="px-4 py-3 text-center font-semibold">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      Array.from({
                        length: limit,
                      }).map((_, index) => (
                        <tr
                          key={index}
                          className="border-b theme-border last:border-0"
                        >
                          <td className="px-4 py-3 text-center">
                            <div className="mx-auto h-7 w-7 animate-pulse rounded-lg theme-card-soft" />
                          </td>

                          <td className="px-4 py-3">
                            <div className="space-y-2">
                              <div className="h-4 w-36 animate-pulse rounded theme-card-soft" />

                              <div className="h-3 w-24 animate-pulse rounded theme-card-soft" />
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="h-4 w-24 animate-pulse rounded theme-card-soft" />
                          </td>

                          <td className="px-4 py-3">
                            <div className="h-4 w-28 animate-pulse rounded theme-card-soft" />
                          </td>

                          <td className="px-4 py-3">
                            <div className="h-6 w-20 animate-pulse rounded-full theme-card-soft" />
                          </td>

                          <td className="px-4 py-3">
                            <div className="h-4 w-16 animate-pulse rounded theme-card-soft" />
                          </td>

                          <td className="px-4 py-3">
                            <div className="h-4 w-16 animate-pulse rounded theme-card-soft" />
                          </td>

                          <td className="px-4 py-3">
                            <div className="mx-auto h-8 w-20 animate-pulse rounded-lg theme-card-soft" />
                          </td>
                        </tr>
                      ))
                    ) : paginatedData.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-16 text-center"
                        >
                          <div className="mx-auto flex max-w-md flex-col items-center">
                            <div
                              className="
                                w-14
                                h-14
                                rounded-full
                                theme-info
                                border
                                theme-border
                                flex
                                items-center
                                justify-center
                              "
                            >
                              <Users size={24} />
                            </div>

                            <h3 className="mt-4 text-base font-bold theme-text">
                              Data guru tidak ditemukan
                            </h3>

                            <p className="mt-1 text-xs theme-text-muted text-center">
                              Tidak ada data absensi guru untuk
                              tanggal{" "}
                              <span className="font-semibold theme-text">
                                {formatTanggalIndonesia(
                                  tanggal
                                )}
                              </span>
                              .
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map(
                        (guru, index) => (
                          <tr
                            key={guru.id}
                            className="
                              border-b
                              theme-border
                              last:border-0
                              theme-table-hover
                              transition-colors
                            "
                          >
                            {/* NO */}

                            <td className="px-4 py-3 text-center">
                              <span
                                className="
                                  inline-flex
                                  items-center
                                  justify-center
                                  w-7
                                  h-7
                                  rounded-lg
                                  theme-info
                                  border
                                  theme-border
                                  text-xs
                                  font-bold
                                "
                              >
                                {(page - 1) *
                                  limit +
                                  index +
                                  1}
                              </span>
                            </td>

                            {/* GURU */}

                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className="
                                    w-10
                                    h-10
                                    rounded-full
                                    theme-primary
                                    flex
                                    items-center
                                    justify-center
                                    text-xs
                                    font-bold
                                    shrink-0
                                  "
                                >
                                  {guru.nama
                                    .split(" ")
                                    .slice(0, 2)
                                    .map(
                                      (w) => w[0]
                                    )
                                    .join("")
                                    .toUpperCase()}
                                </div>

                                <div className="min-w-0">
                                  <p className="font-semibold theme-text truncate max-w-[200px]">
                                    {guru.nama}
                                  </p>

                                  <p className="text-[11px] theme-text-muted mt-0.5 truncate max-w-[200px]">
                                    {guru.jabatan}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* NIP */}

                            <td className="px-4 py-3 text-xs font-medium theme-text-secondary">
                              {guru.nip}
                            </td>

                            {/* JABATAN */}

                            <td className="px-4 py-3 text-xs theme-text-secondary">
                              {guru.jabatan}
                            </td>

                            {/* STATUS */}

                            <td className="px-4 py-3">
                              {renderStatus(
                                guru.status
                              )}
                            </td>

                            {/* JAM MASUK */}

                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold theme-text-secondary">
                                <Clock3
                                  size={12}
                                  className="theme-text-muted"
                                />

                                {guru.jamMasuk}
                              </span>
                            </td>

                            {/* JAM PULANG */}

                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold theme-text-secondary">
                                <Clock3
                                  size={12}
                                  className="theme-text-muted"
                                />

                                {guru.jamPulang}
                              </span>
                            </td>

                            {/* AKSI */}

                            <td className="px-4 py-3 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedGuru(
                                    guru
                                  )
                                }
                                className="
                                  inline-flex
                                  items-center
                                  gap-1.5
                                  rounded-lg
                                  border
                                  theme-border
                                  theme-input
                                  px-3
                                  py-2
                                  text-xs
                                  font-semibold
                                  theme-text-secondary
                                  transition
                                  theme-sidebar-hover
                                "
                              >
                                <Eye size={13} />
                                Detail
                              </button>
                            </td>
                          </tr>
                        )
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* =================================================
                  PAGINATION
              ================================================== */}

              {!loading &&
                filteredData.length > 0 && (
                  <div
                    className="
                      px-4
                      sm:px-5
                      py-3
                      border-t
                      theme-border
                      theme-card-soft
                      flex
                      flex-col
                      sm:flex-row
                      sm:items-center
                      sm:justify-between
                      gap-3
                    "
                  >
                    <p className="text-xs theme-text-muted">
                      Menampilkan{" "}
                      <span className="font-semibold theme-text">
                        {(page - 1) * limit + 1}
                      </span>{" "}
                      -{" "}
                      <span className="font-semibold theme-text">
                        {Math.min(
                          page * limit,
                          filteredData.length
                        )}
                      </span>{" "}
                      dari{" "}
                      <span className="font-semibold theme-text">
                        {filteredData.length}
                      </span>{" "}
                      guru
                    </p>

                    <div className="flex items-center gap-2">
                      <select
                        value={limit}
                        onChange={(event) => {
                          setLimit(
                            Number(
                              event.target.value
                            )
                          );
                          setPage(1);
                        }}
                        className="
                          theme-input
                          text-xs
                          rounded-lg
                          border
                          px-3
                          py-2
                          outline-none
                          focus:outline-none
                        "
                      >
                        <option value={10}>
                          10 / halaman
                        </option>

                        <option value={20}>
                          20 / halaman
                        </option>

                        <option value={50}>
                          50 / halaman
                        </option>
                      </select>

                      <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() =>
                          setPage(
                            (current) =>
                              current - 1
                          )
                        }
                        className="
                          w-8
                          h-8
                          rounded-lg
                          border
                          theme-border
                          theme-input
                          theme-text-muted
                          flex
                          items-center
                          justify-center
                          disabled:opacity-40
                          disabled:cursor-not-allowed
                          theme-sidebar-hover
                        "
                      >
                        <ChevronLeft size={15} />
                      </button>

                      <span className="min-w-[60px] text-center text-xs font-semibold theme-text-secondary">
                        {page} / {totalPages}
                      </span>

                      <button
                        type="button"
                        disabled={
                          page >= totalPages
                        }
                        onClick={() =>
                          setPage(
                            (current) =>
                              current + 1
                          )
                        }
                        className="
                          w-8
                          h-8
                          rounded-lg
                          border
                          theme-border
                          theme-input
                          theme-text-muted
                          flex
                          items-center
                          justify-center
                          disabled:opacity-40
                          disabled:cursor-not-allowed
                          theme-sidebar-hover
                        "
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

      {/* =====================================================
          DETAIL MODAL
      ====================================================== */}

      {selectedGuru && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-slate-950/40
            p-4
            backdrop-blur-sm
          "
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedGuru(null);
            }
          }}
        >
          <div className="w-full max-w-lg rounded-2xl theme-card shadow-2xl overflow-hidden">
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b theme-border px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg theme-info border theme-border flex items-center justify-center">
                  <Eye size={17} />
                </div>

                <div>
                  <h2 className="text-sm font-bold theme-text">
                    Detail Absensi Guru
                  </h2>

                  <p className="text-[11px] theme-text-muted mt-0.5">
                    {formatTanggalIndonesia(
                      tanggal
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedGuru(null)
                }
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  theme-text-muted
                  theme-sidebar-hover
                  transition
                "
              >
                <X size={18} />
              </button>
            </div>

            {/* MODAL BODY */}

            <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
              {/* PROFIL */}

              <div className="flex items-center gap-4 p-4 rounded-xl theme-card-soft border theme-border">
                <div
                  className="
                    w-14
                    h-14
                    rounded-full
                    theme-primary
                    flex
                    items-center
                    justify-center
                    text-lg
                    font-bold
                    shrink-0
                  "
                >
                  {selectedGuru.nama
                    .split(" ")
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="text-base font-bold theme-text truncate">
                    {selectedGuru.nama}
                  </p>

                  <p className="text-xs theme-text-secondary mt-0.5 truncate">
                    {selectedGuru.jabatan}
                  </p>

                  <p className="text-[11px] theme-text-muted mt-0.5">
                    NIP: {selectedGuru.nip}
                  </p>
                </div>
              </div>

              {/* STATUS */}

              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide theme-text-muted">
                  Status Kehadiran
                </p>

                {renderStatus(
                  selectedGuru.status
                )}
              </div>

              {/* JAM */}

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border theme-border p-4 theme-card">
                  <div className="flex items-center gap-2 theme-text-muted">
                    <Clock3 size={14} />

                    <p className="text-[10px] font-medium uppercase tracking-wide">
                      Jam Masuk
                    </p>
                  </div>

                  <p className="mt-2 text-lg font-bold theme-text">
                    {selectedGuru.jamMasuk}
                  </p>
                </div>

                <div className="rounded-xl border theme-border p-4 theme-card">
                  <div className="flex items-center gap-2 theme-text-muted">
                    <Clock3 size={14} />

                    <p className="text-[10px] font-medium uppercase tracking-wide">
                      Jam Pulang
                    </p>
                  </div>

                  <p className="mt-2 text-lg font-bold theme-text">
                    {selectedGuru.jamPulang}
                  </p>
                </div>
              </div>

              {/* RINGKASAN */}

              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-wide theme-text-muted">
                  Ringkasan Bulan Ini
                </p>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border theme-border theme-warning p-3">
                    <p className="text-[10px] font-medium">
                      Terlambat
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {selectedGuru.terlambat}
                    </p>
                  </div>

                  <div className="rounded-xl border theme-border theme-info p-3">
                    <p className="text-[10px] font-medium">
                      Izin
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {selectedGuru.izin}
                    </p>
                  </div>

                  <div className="rounded-xl border theme-border theme-warning p-3">
                    <p className="text-[10px] font-medium">
                      Sakit
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {selectedGuru.sakit}
                    </p>
                  </div>

                  <div className="rounded-xl border theme-border theme-danger p-3">
                    <p className="text-[10px] font-medium">
                      Alpha
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      {selectedGuru.alpha}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}

            <div className="border-t theme-border px-6 py-4 theme-card-soft">
              <button
                type="button"
                onClick={() =>
                  setSelectedGuru(null)
                }
                className="
                  w-full
                  rounded-xl
                  theme-primary
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  transition
                "
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClass,
  loading,
}) {
  return (
    <div
      className="
        theme-card
        rounded-2xl
        border
        theme-border
        p-4
        sm:p-5
        shadow-sm
        theme-sidebar-hover
        transition-all
        duration-200
      "
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] sm:text-xs font-medium theme-text-muted">
            {title}
          </p>

          {loading ? (
            <div className="mt-2 h-8 w-16 animate-pulse rounded-lg theme-card-soft" />
          ) : (
            <p className="mt-1.5 text-2xl sm:text-3xl font-bold theme-text">
              {value}
            </p>
          )}

          <p className="mt-1 text-[10px] sm:text-xs theme-text-muted">
            {description}
          </p>
        </div>

        <div
          className="
            w-10
            h-10
            rounded-xl
            theme-card-soft
            border
            theme-border
            flex
            items-center
            justify-center
            shrink-0
          "
        >
          <Icon
            size={18}
            className={iconClass}
          />
        </div>
      </div>
    </div>
  );
}