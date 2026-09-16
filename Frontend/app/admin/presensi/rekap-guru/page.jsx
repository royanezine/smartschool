"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

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
  TrendingUp,
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
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
  },

  terlambat: {
    label: "Terlambat",
    icon: Clock3,
    className:
      "bg-amber-50 text-amber-700 border-amber-200",
  },

  izin: {
    label: "Izin",
    icon: CircleAlert,
    className:
      "bg-blue-50 text-blue-700 border-blue-200",
  },

  sakit: {
    label: "Sakit",
    icon: CircleAlert,
    className:
      "bg-orange-50 text-orange-700 border-orange-200",
  },

  alpha: {
    label: "Alpha",
    icon: CircleAlert,
    className:
      "bg-red-50 text-red-700 border-red-200",
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
          throw new Error(
            "Response dari server bukan JSON yang valid."
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
        } else if (Array.isArray(result?.data?.data)) {
          rawData = result.data.data;
        } else if (Array.isArray(result?.rows)) {
          rawData = result.rows;
        } else if (Array.isArray(result?.results)) {
          rawData = result.results;
        }

        const normalized = rawData.map(normalizeGuru);

        setData(normalized);
        setPage(1);
      } catch (err) {
        console.error("ERROR FETCH REKAP GURU:", err);

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
        err?.message || "Gagal melakukan export."
      );
    } finally {
      setExportLoading(false);
    }
  };

  const renderStatus = (status) => {
    const config =
      STATUS_CONFIG[status] || STATUS_CONFIG.alpha;

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
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar
        role="admin"
        activeMenu="rekap-guru"
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* HEADER */}

        <Header
          title="Rekap Absensi Guru"
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* =====================================================
            PAGE (HANYA AREA INI YANG SCROLL)
        ===================================================== */}

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
            {/* =================================================
                PAGE HEADER
            ================================================== */}

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* TITLE */}

              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#155DFC] to-[#0d47c9] text-white flex items-center justify-center shadow-lg shadow-[#155DFC]/20 shrink-0">
                  <Users size={20} />
                </div>

                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-800 truncate">
                    Rekap Absensi Guru
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
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
                    border-slate-200
                    bg-white
                    text-slate-600
                    text-sm
                    font-semibold
                    hover:bg-slate-50
                    hover:border-slate-300
                    transition
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  <RefreshCw
                    size={15}
                    className={loading ? "animate-spin" : ""}
                  />
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={handleExport}
                  disabled={
                    exportLoading || data.length === 0
                  }
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    px-4
                    py-2.5
                    rounded-xl
                    bg-gradient-to-r
                    from-[#155DFC]
                    to-[#0d47c9]
                    text-white
                    text-sm
                    font-semibold
                    shadow-sm
                    hover:brightness-110
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
                      <FileSpreadsheet size={15} />
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
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                <CircleAlert
                  size={19}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800">
                    Terjadi kesalahan
                  </p>

                  <p className="mt-0.5 text-sm text-red-700">
                    {error}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setError("")}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* =================================================
                FILTER TANGGAL
            ================================================== */}

            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 lg:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                  <div className="w-full lg:max-w-xs">
                    <label
                      htmlFor="tanggal"
                      className="mb-2 block text-xs font-semibold text-slate-600"
                    >
                      Tanggal Absensi
                    </label>

                    <div className="relative">
                      <CalendarDays
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="tanggal"
                        type="date"
                        value={tanggal}
                        onChange={handleTanggalChange}
                        className="
                          h-11
                          w-full
                          rounded-xl
                          border
                          border-slate-200
                          bg-white
                          pl-9
                          pr-3
                          text-sm
                          font-medium
                          text-slate-700
                          outline-none
                          transition
                          focus:border-[#155DFC]/50
                          focus:ring-2
                          focus:ring-[#155DFC]/20
                        "
                      />
                    </div>
                  </div>

                  <div className="pb-2 text-xs sm:text-sm text-slate-500">
                    Menampilkan data untuk:{" "}
                    <span className="font-semibold text-slate-700">
                      {formatTanggalIndonesia(tanggal)}
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
                iconClass="text-[#155DFC]"
                loading={loading}
              />

              <StatCard
                title="Hadir"
                value={statistics.hadir}
                description="Guru hadir"
                icon={UserCheck}
                iconClass="text-emerald-500"
                loading={loading}
              />

              <StatCard
                title="Terlambat"
                value={statistics.terlambat}
                description="Guru terlambat"
                icon={Clock3}
                iconClass="text-amber-500"
                loading={loading}
              />

              <StatCard
                title="Izin"
                value={statistics.izin}
                description="Guru izin"
                icon={CircleAlert}
                iconClass="text-blue-500"
                loading={loading}
              />

              <StatCard
                title="Alpha"
                value={statistics.alpha}
                description="Guru alpha"
                icon={UserX}
                iconClass="text-red-500"
                loading={loading}
              />
            </div>

            {/* =================================================
                SEARCH + FILTER STATUS
            ================================================== */}

            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4">
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
                      text-slate-400
                    "
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Cari nama guru, NIP, atau jabatan..."
                    className="
                      w-full
                      pl-9
                      pr-10
                      py-2.5
                      text-sm
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      text-slate-800
                      placeholder:text-slate-400
                      focus:outline-none
                      focus:ring-2
                      focus:ring-[#155DFC]/20
                      focus:border-[#155DFC]/50
                      transition
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
                        text-slate-400
                        hover:text-slate-600
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
                            ? "bg-gradient-to-r from-[#155DFC] to-[#0d47c9] border-[#155DFC] text-white shadow-sm"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
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

            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              {/* TABLE HEADER */}

              <div
                className="
                  px-4
                  sm:px-5
                  lg:px-6
                  py-4
                  border-b
                  border-slate-100
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
                        bg-[#eaf1ff]
                        border
                        border-[#c7dbff]
                        flex
                        items-center
                        justify-center
                      "
                    >
                      <Database
                        size={15}
                        className="text-[#155DFC]"
                      />
                    </div>

                    <h2 className="text-sm font-bold text-slate-800">
                      Data Rekap Guru
                    </h2>
                  </div>

                  <p className="text-xs text-slate-400 mt-1">
                    Daftar kehadiran guru pada tanggal yang dipilih.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Activity size={14} className="text-[#155DFC]" />
                  Auto-refresh setiap 10 detik
                </div>
              </div>

              {/* TABLE */}

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-sm border-collapse">
                  <thead>
                    <tr
                      className="
                        bg-gradient-to-r
                        from-[#155DFC]
                        to-[#0d47c9]
                        text-white
                      "
                    >
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
                      Array.from({ length: limit }).map(
                        (_, index) => (
                          <tr
                            key={index}
                            className="border-b border-slate-100 last:border-0"
                          >
                            <td className="px-4 py-3 text-center">
                              <div className="mx-auto h-7 w-7 animate-pulse rounded-lg bg-slate-100" />
                            </td>

                            <td className="px-4 py-3">
                              <div className="space-y-2">
                                <div className="h-4 w-36 animate-pulse rounded bg-slate-100" />

                                <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
                            </td>

                            <td className="px-4 py-3">
                              <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
                            </td>

                            <td className="px-4 py-3">
                              <div className="h-6 w-20 animate-pulse rounded-full bg-slate-100" />
                            </td>

                            <td className="px-4 py-3">
                              <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />
                            </td>

                            <td className="px-4 py-3">
                              <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />
                            </td>

                            <td className="px-4 py-3">
                              <div className="mx-auto h-8 w-20 animate-pulse rounded-lg bg-slate-100" />
                            </td>
                          </tr>
                        )
                      )
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
                                bg-[#eaf1ff]
                                border
                                border-[#c7dbff]
                                flex
                                items-center
                                justify-center
                              "
                            >
                              <Users
                                size={24}
                                className="text-[#155DFC]"
                              />
                            </div>

                            <h3 className="mt-4 text-base font-bold text-slate-800">
                              Data guru tidak ditemukan
                            </h3>

                            <p className="mt-1 text-xs text-slate-500 text-center">
                              Tidak ada data absensi guru untuk
                              tanggal{" "}
                              <span className="font-semibold">
                                {formatTanggalIndonesia(tanggal)}
                              </span>
                              .
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((guru, index) => (
                        <tr
                          key={guru.id}
                          className="
                            border-b
                            border-slate-100
                            last:border-0
                            hover:bg-[#eaf1ff]
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
                                bg-[#eaf1ff]
                                border
                                border-[#c7dbff]
                                text-[#155DFC]
                                text-xs
                                font-bold
                              "
                            >
                              {(page - 1) * limit + index + 1}
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
                                  bg-gradient-to-br
                                  from-[#155DFC]
                                  to-[#0d47c9]
                                  text-white
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
                                  .map((w) => w[0])
                                  .join("")
                                  .toUpperCase()}
                              </div>

                              <div className="min-w-0">
                                <p className="font-semibold text-slate-800 truncate max-w-[200px]">
                                  {guru.nama}
                                </p>

                                <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[200px]">
                                  {guru.jabatan}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* NIP */}

                          <td className="px-4 py-3 text-xs font-medium text-slate-600">
                            {guru.nip}
                          </td>

                          {/* JABATAN */}

                          <td className="px-4 py-3 text-xs text-slate-600">
                            {guru.jabatan}
                          </td>

                          {/* STATUS */}

                          <td className="px-4 py-3">
                            {renderStatus(guru.status)}
                          </td>

                          {/* JAM MASUK */}

                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                              <Clock3
                                size={12}
                                className="text-slate-400"
                              />
                              {guru.jamMasuk}
                            </span>
                          </td>

                          {/* JAM PULANG */}

                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                              <Clock3
                                size={12}
                                className="text-slate-400"
                              />
                              {guru.jamPulang}
                            </span>
                          </td>

                          {/* AKSI */}

                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedGuru(guru)
                              }
                              className="
                                inline-flex
                                items-center
                                gap-1.5
                                rounded-lg
                                border
                                border-slate-200
                                bg-white
                                px-3
                                py-2
                                text-xs
                                font-semibold
                                text-slate-600
                                transition
                                hover:border-[#c7dbff]
                                hover:bg-[#eaf1ff]
                                hover:text-[#155DFC]
                              "
                            >
                              <Eye size={13} />
                              Detail
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* =================================================
                  PAGINATION
              ================================================== */}

              {!loading && filteredData.length > 0 && (
                <div
                  className="
                    px-4
                    sm:px-5
                    py-3
                    border-t
                    border-slate-100
                    bg-slate-50/60
                    flex
                    flex-col
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                    gap-3
                  "
                >
                  <p className="text-xs text-slate-500">
                    Menampilkan{" "}
                    <span className="font-semibold text-slate-700">
                      {(page - 1) * limit + 1}
                    </span>{" "}
                    -{" "}
                    <span className="font-semibold text-slate-700">
                      {Math.min(
                        page * limit,
                        filteredData.length
                      )}
                    </span>{" "}
                    dari{" "}
                    <span className="font-semibold text-slate-700">
                      {filteredData.length}
                    </span>{" "}
                    guru
                  </p>

                  <div className="flex items-center gap-2">
                    <select
                      value={limit}
                      onChange={(event) => {
                        setLimit(Number(event.target.value));
                        setPage(1);
                      }}
                      className="
                        text-xs
                        rounded-lg
                        border
                        border-slate-200
                        bg-white
                        px-3
                        py-2
                        text-slate-600
                        outline-none
                        focus:border-[#155DFC]/50
                        focus:ring-2
                        focus:ring-[#155DFC]/20
                      "
                    >
                      <option value={10}>10 / halaman</option>
                      <option value={20}>20 / halaman</option>
                      <option value={50}>50 / halaman</option>
                    </select>

                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() =>
                        setPage((current) => current - 1)
                      }
                      className="
                        w-8
                        h-8
                        rounded-lg
                        border
                        border-slate-200
                        bg-white
                        text-slate-500
                        flex
                        items-center
                        justify-center
                        disabled:opacity-40
                        disabled:cursor-not-allowed
                        hover:bg-slate-50
                      "
                    >
                      <ChevronLeft size={15} />
                    </button>

                    <span className="min-w-[60px] text-center text-xs font-semibold text-slate-600">
                      {page} / {totalPages}
                    </span>

                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() =>
                        setPage((current) => current + 1)
                      }
                      className="
                        w-8
                        h-8
                        rounded-lg
                        border
                        border-slate-200
                        bg-white
                        text-slate-500
                        flex
                        items-center
                        justify-center
                        disabled:opacity-40
                        disabled:cursor-not-allowed
                        hover:bg-slate-50
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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedGuru(null);
            }
          }}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#eaf1ff] border border-[#c7dbff] flex items-center justify-center">
                  <Eye
                    size={17}
                    className="text-[#155DFC]"
                  />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    Detail Absensi Guru
                  </h2>

                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {formatTanggalIndonesia(tanggal)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedGuru(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* MODAL BODY */}

            <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
              {/* PROFIL */}

              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div
                  className="
                    w-14
                    h-14
                    rounded-full
                    bg-gradient-to-br
                    from-[#155DFC]
                    to-[#0d47c9]
                    text-white
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
                  <p className="text-base font-bold text-slate-800 truncate">
                    {selectedGuru.nama}
                  </p>

                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {selectedGuru.jabatan}
                  </p>

                  <p className="text-[11px] text-slate-400 mt-0.5">
                    NIP: {selectedGuru.nip}
                  </p>
                </div>
              </div>

              {/* STATUS */}

              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Status Kehadiran
                </p>

                {renderStatus(selectedGuru.status)}
              </div>

              {/* JAM */}

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock3 size={14} />

                    <p className="text-[10px] font-medium uppercase tracking-wide">
                      Jam Masuk
                    </p>
                  </div>

                  <p className="mt-2 text-lg font-bold text-slate-800">
                    {selectedGuru.jamMasuk}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock3 size={14} />

                    <p className="text-[10px] font-medium uppercase tracking-wide">
                      Jam Pulang
                    </p>
                  </div>

                  <p className="mt-2 text-lg font-bold text-slate-800">
                    {selectedGuru.jamPulang}
                  </p>
                </div>
              </div>

              {/* RINGKASAN */}

              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Ringkasan Bulan Ini
                </p>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
                    <p className="text-[10px] text-amber-600 font-medium">
                      Terlambat
                    </p>

                    <p className="mt-1 text-lg font-bold text-amber-700">
                      {selectedGuru.terlambat}
                    </p>
                  </div>

                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                    <p className="text-[10px] text-blue-600 font-medium">
                      Izin
                    </p>

                    <p className="mt-1 text-lg font-bold text-blue-700">
                      {selectedGuru.izin}
                    </p>
                  </div>

                  <div className="rounded-xl border border-orange-100 bg-orange-50 p-3">
                    <p className="text-[10px] text-orange-600 font-medium">
                      Sakit
                    </p>

                    <p className="mt-1 text-lg font-bold text-orange-700">
                      {selectedGuru.sakit}
                    </p>
                  </div>

                  <div className="rounded-xl border border-red-100 bg-red-50 p-3">
                    <p className="text-[10px] text-red-600 font-medium">
                      Alpha
                    </p>

                    <p className="mt-1 text-lg font-bold text-red-700">
                      {selectedGuru.alpha}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}

            <div className="border-t border-slate-100 px-6 py-4 bg-slate-50/70">
              <button
                type="button"
                onClick={() => setSelectedGuru(null)}
                className="
                  w-full
                  rounded-xl
                  bg-gradient-to-r
                  from-[#155DFC]
                  to-[#0d47c9]
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:brightness-110
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
        bg-white
        rounded-2xl
        border
        border-slate-200/80
        p-4
        sm:p-5
        shadow-sm
        hover:shadow-md
        transition-all
        duration-200
      "
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] sm:text-xs font-medium text-slate-500">
            {title}
          </p>

          {loading ? (
            <div className="mt-2 h-8 w-16 animate-pulse rounded-lg bg-slate-100" />
          ) : (
            <p className="mt-1.5 text-2xl sm:text-3xl font-bold text-slate-900">
              {value}
            </p>
          )}

          <p className="mt-1 text-[10px] sm:text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div
          className="
            w-10
            h-10
            rounded-xl
            bg-slate-50
            border
            border-slate-100
            flex
            items-center
            justify-center
            shrink-0
          "
        >
          <Icon size={18} className={iconClass} />
        </div>
      </div>
    </div>
  );
}