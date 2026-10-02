"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";

import {
  Search,
  Filter,
  CalendarDays,
  Eye,
  Users,
  CheckCircle2,
  Clock3,
  AlertCircle,
  XCircle,
  MapPin,
  ClipboardCheck,
  RefreshCw,
  FileSpreadsheet,
} from "lucide-react";

import { getAbsensiKelas } from "../../../../../services/absensi.service";
import { getKelas } from "../../../../../services/kelas.service";

/* =========================================================
   API CONFIG
========================================================= */

const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

const API_URL = RAW_API_URL.replace(/\/$/, "");

const API_BASE = API_URL.endsWith("/api/v1")
  ? API_URL
  : `${API_URL}/api/v1`;

/* =========================================================
   BACKEND HELPERS
========================================================= */

function normalizeArray(response) {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  if (Array.isArray(response?.result)) {
    return response.result;
  }

  if (Array.isArray(response?.result?.data)) {
    return response.result.data;
  }

  return [];
}

function normalizeStatus(status) {
  const value = String(status || "")
    .toLowerCase()
    .trim();

  if (value === "hadir") return "Hadir";
  if (value === "izin") return "Izin";
  if (value === "sakit") return "Sakit";

  if (value === "alpa" || value === "alpha") {
    return "Alpa";
  }

  if (value === "terlambat") {
    return "Terlambat";
  }

  return status ? String(status) : "Alpa";
}

function formatTanggal(value) {
  if (!value) return "-";

  const raw = String(value);
  const dateOnly = raw.slice(0, 10);

  const date = new Date(`${dateOnly}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return raw;
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatJam(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getInitials(nama) {
  return String(nama || "Siswa")
    .replace(/,.*/, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word?.[0] || "")
    .join("")
    .toUpperCase();
}

function getNamaSiswa(item) {
  return (
    item?.pengguna?.namaLengkap ||
    item?.siswa?.namaLengkap ||
    item?.namaLengkap ||
    item?.pengguna?.nama ||
    item?.siswa?.nama ||
    item?.nama ||
    "Siswa"
  );
}

function getNisn(item) {
  return (
    item?.pengguna?.nisn ||
    item?.siswa?.nisn ||
    item?.nisn ||
    item?.pengguna?.nomorInduk ||
    item?.nomorInduk ||
    "-"
  );
}

function getNamaKelas(item, kelas) {
  return (
    item?.kelas?.nama ||
    item?.kelas?.namaKelas ||
    item?.namaKelas ||
    kelas?.nama ||
    kelas?.namaKelas ||
    `Kelas ${kelas?.tingkat || "-"}`
  );
}

function mapAbsensi(item, kelas) {
  const tanggal =
    item?.tanggal ||
    item?.dibuatPada ||
    null;

  const dibuatPada =
    item?.dibuatPada ||
    null;

  const latitude =
    item?.lintang !== null &&
    item?.lintang !== undefined
      ? Number(item.lintang)
      : null;

  const longitude =
    item?.bujur !== null &&
    item?.bujur !== undefined
      ? Number(item.bujur)
      : null;

  const akurasi =
    item?.akurasi !== null &&
    item?.akurasi !== undefined
      ? Number(item.akurasi)
      : null;

  let status = normalizeStatus(item?.status);

  const terlambatValue =
    item?.terlambat ??
    item?.terlambatMenit ??
    item?.menitTerlambat ??
    0;

  if (
    status === "Hadir" &&
    Number(terlambatValue) > 0
  ) {
    status = "Terlambat";
  }

  return {
    id: item?.id,

    nama: getNamaSiswa(item),

    nisn: getNisn(item),

    kelas: getNamaKelas(item, kelas),

    kelasId:
      item?.kelasId ||
      item?.kelas?.id ||
      kelas?.id ||
      null,

    tanggal,

    tanggalLabel: formatTanggal(tanggal),

    jamMasuk: formatJam(
      dibuatPada || tanggal
    ),

    status,

    lokasi:
      item?.metode === "lokasi"
        ? "Sekolah"
        : item?.metode
        ? String(item.metode)
        : "-",

    metode: item?.metode || "-",

    latitude,
    longitude,
    akurasi,

    foto:
      item?.urlFoto ||
      item?.fotoUrl ||
      item?.foto ||
      null,

    keterangan:
      item?.keterangan || "-",

    waliKelas:
      item?.kelas?.waliKelas?.namaLengkap ||
      item?.kelas?.waliKelas?.nama ||
      kelas?.waliKelas?.namaLengkap ||
      kelas?.waliKelas?.nama ||
      "-",

    dibuatPada,

    terlambat:
      Number(terlambatValue) || 0,

    raw: item,
  };
}

/* =========================================================
   UI HELPERS
========================================================= */

const STATUS_OPTIONS = [
  "Semua Status",
  "Hadir",
  "Terlambat",
  "Izin",
  "Sakit",
  "Alpa",
];

function StatusBadge({ status }) {
  const styles = {
    Hadir: "theme-success",
    Terlambat: "theme-warning",
    Izin: "theme-info",
    Sakit: "theme-warning",
    Alpa: "theme-danger",
  };

  const dots = {
    Hadir: "bg-[var(--color-success)]",
    Terlambat: "bg-[var(--color-warning)]",
    Izin: "bg-[var(--color-info)]",
    Sakit: "bg-[var(--color-warning)]",
    Alpa: "bg-[var(--color-danger)]",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-1 rounded-full
        text-[11px] font-semibold
        border
        ${styles[status] || "theme-card-soft theme-text-muted theme-border"}
      `}
    >
      <span
        className={`
          w-1.5 h-1.5 rounded-full
          ${dots[status] || "bg-[var(--color-text-muted)]"}
        `}
      />

      {status}
    </span>
  );
}

function Avatar({ nama }) {
  return (
    <div
      className="
        w-9 h-9 rounded-full
        theme-primary
        flex items-center justify-center
        font-bold text-xs
        flex-shrink-0
      "
    >
      {getInitials(nama)}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  iconClass,
}) {
  return (
    <div className="theme-card rounded-xl border theme-border p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <Icon
          size={15}
          className={iconClass}
        />

        <p className="text-[11px] font-medium theme-text-muted tracking-wide">
          {title}
        </p>
      </div>

      <p className="text-2xl font-bold theme-text mt-1.5">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   EXPORT HELPERS
========================================================= */

function getFileNameFromResponse(
  response,
  fallbackDate
) {
  const contentDisposition =
    response.headers.get(
      "content-disposition"
    );

  if (contentDisposition) {
    const match =
      contentDisposition.match(
        /filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i
      );

    if (match?.[1]) {
      return decodeURIComponent(match[1]);
    }
  }

  return `rekap-absensi-siswa-${fallbackDate}.xlsx`;
}

async function downloadExcel({
  tanggal,
  kelasId,
  status,
}) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  if (!token) {
    throw new Error(
      "Token login tidak ditemukan. Silakan login kembali."
    );
  }

  const params =
    new URLSearchParams();

  if (tanggal) {
    params.set("tanggal", tanggal);
  }

  if (
    kelasId &&
    kelasId !== "Semua Kelas"
  ) {
    params.set("kelasId", kelasId);
  }

  if (
    status &&
    status !== "Semua Status"
  ) {
    const backendStatus =
      status === "Alpa"
        ? "alpha"
        : status.toLowerCase();

    params.set(
      "status",
      backendStatus
    );
  }

  const query = params.toString();

  const url =
    `${API_BASE}/absensi/export` +
    (query ? `?${query}` : "");

  const response = await fetch(url, {
    method: "GET",

    headers: {
      Authorization: `Bearer ${token}`,

      Accept:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, application/octet-stream",
    },

    cache: "no-store",
  });

  if (!response.ok) {
    let message =
      `Gagal export Excel (${response.status})`;

    try {
      const contentType =
        response.headers.get(
          "content-type"
        );

      if (
        contentType?.includes(
          "application/json"
        )
      ) {
        const json =
          await response.json();

        message =
          json?.message ||
          json?.error ||
          message;
      }
    } catch {
      // Abaikan error parsing.
    }

    throw new Error(message);
  }

  const blob =
    await response.blob();

  if (!blob.size) {
    throw new Error(
      "File Excel dari backend kosong."
    );
  }

  const fallbackDate =
    tanggal ||
    new Date()
      .toISOString()
      .slice(0, 10);

  const fileName =
    getFileNameFromResponse(
      response,
      fallbackDate
    );

  const blobUrl =
    window.URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = blobUrl;
  link.download = fileName;

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(blobUrl);
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function AbsenSiswaPage() {
  const router = useRouter();

  const [
    isCollapsed,
    setIsCollapsed,
  ] = useState(false);

  const [
    kelasData,
    setKelasData,
  ] = useState([]);

  const [
    absensiData,
    setAbsensiData,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    exporting,
    setExporting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    exportError,
    setExportError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    kelasFilter,
    setKelasFilter,
  ] = useState("Semua Kelas");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("Semua Status");

  const [
    tanggalFilter,
    setTanggalFilter,
  ] = useState("");

  /* =========================================================
     LOAD DATA
  ========================================================= */

  const loadData =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const kelasResponse =
          await getKelas({
            page: 1,
            limit: 100,
            sortBy: "tingkat",
            sortOrder: "asc",
          });

        const daftarKelas =
          normalizeArray(
            kelasResponse
          );

        setKelasData(
          daftarKelas
        );

        if (
          daftarKelas.length === 0
        ) {
          setAbsensiData([]);
          return;
        }

        const results =
          await Promise.all(
            daftarKelas.map(
              async (kelas) => {
                try {
                  const response =
                    await getAbsensiKelas(
                      kelas.id,
                      null
                    );

                  return normalizeArray(
                    response
                  ).map(
                    (item) =>
                      mapAbsensi(
                        item,
                        kelas
                      )
                  );
                } catch (err) {
                  console.error(
                    `Gagal mengambil absensi kelas ${kelas?.id}:`,
                    err
                  );

                  return [];
                }
              }
            )
          );

        setAbsensiData(
          results.flat()
        );
      } catch (err) {
        console.error(
          "Gagal mengambil data absensi siswa:",
          err
        );

        setKelasData([]);
        setAbsensiData([]);

        setError(
          err?.message ||
            "Gagal mengambil data absensi dari backend."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* =========================================================
     KELAS OPTIONS
  ========================================================= */

  const kelasOptions =
    useMemo(() => {
      const names =
        kelasData
          .map(
            (item) =>
              item?.nama ||
              item?.namaKelas
          )
          .filter(Boolean);

      return [
        "Semua Kelas",
        ...Array.from(
          new Set(names)
        ).sort(),
      ];
    }, [kelasData]);

  const selectedKelasId =
    useMemo(() => {
      if (
        kelasFilter ===
        "Semua Kelas"
      ) {
        return "";
      }

      const kelas =
        kelasData.find(
          (item) =>
            (
              item?.nama ||
              item?.namaKelas
            ) === kelasFilter
        );

      return kelas?.id || "";
    }, [
      kelasData,
      kelasFilter,
    ]);

  /* =========================================================
     FILTER DATA
  ========================================================= */

  const filteredAbsensi =
    useMemo(() => {
      const keyword =
        search
          .toLowerCase()
          .trim();

      return absensiData.filter(
        (item) => {
          const nama =
            String(
              item?.nama || ""
            ).toLowerCase();

          const nisn =
            String(
              item?.nisn || ""
            ).toLowerCase();

          const kelas =
            String(
              item?.kelas || ""
            ).toLowerCase();

          const matchSearch =
            !keyword ||
            nama.includes(
              keyword
            ) ||
            nisn.includes(
              keyword
            ) ||
            kelas.includes(
              keyword
            );

          const matchKelas =
            kelasFilter ===
              "Semua Kelas" ||
            item.kelas ===
              kelasFilter;

          const matchStatus =
            statusFilter ===
              "Semua Status" ||
            item.status ===
              statusFilter;

          const matchTanggal =
            !tanggalFilter ||
            String(
              item?.tanggal || ""
            ).slice(0, 10) ===
              tanggalFilter;

          return (
            matchSearch &&
            matchKelas &&
            matchStatus &&
            matchTanggal
          );
        }
      );
    }, [
      absensiData,
      search,
      kelasFilter,
      statusFilter,
      tanggalFilter,
    ]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalSiswa =
    filteredAbsensi.length;

  const totalHadir =
    filteredAbsensi.filter(
      (item) =>
        item.status ===
          "Hadir" ||
        item.status ===
          "Terlambat"
    ).length;

  const totalTerlambat =
    filteredAbsensi.filter(
      (item) =>
        item.status ===
        "Terlambat"
    ).length;

  const totalIzin =
    filteredAbsensi.filter(
      (item) =>
        item.status === "Izin"
    ).length;

  const totalSakit =
    filteredAbsensi.filter(
      (item) =>
        item.status === "Sakit"
    ).length;

  const totalAlpa =
    filteredAbsensi.filter(
      (item) =>
        item.status === "Alpa"
    ).length;

  const persentaseHadir =
    totalSiswa
      ? Math.round(
          (totalHadir /
            totalSiswa) *
            100
        )
      : 0;

  /* =========================================================
     DETAIL — PINDAH HALAMAN
  ========================================================= */

  const handleDetail =
    (item) => {
      if (!item?.id) return;

      const params =
        new URLSearchParams();

      if (item.kelasId) {
        params.set(
          "kelasId",
          item.kelasId
        );
      }

      const query =
        params.toString();

      router.push(
        `/admin/siswa/absen/${item.id}${
          query ? `?${query}` : ""
        }`
      );
    };

  /* =========================================================
     RESET FILTER
  ========================================================= */

  const resetFilter =
    () => {
      setSearch("");

      setKelasFilter(
        "Semua Kelas"
      );

      setStatusFilter(
        "Semua Status"
      );

      setTanggalFilter("");

      setExportError("");
    };

  /* =========================================================
     EXPORT EXCEL
  ========================================================= */

  const handleExport =
    async () => {
      try {
        setExporting(true);
        setExportError("");

        await downloadExcel({
          tanggal:
            tanggalFilter,

          kelasId:
            selectedKelasId,

          status:
            statusFilter,
        });
      } catch (err) {
        console.error(
          "Gagal export Excel:",
          err
        );

        setExportError(
          err?.message ||
            "Gagal mengexport data ke Excel."
        );
      } finally {
        setExporting(false);
      }
    };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="flex h-screen w-full theme-page overflow-hidden">
      {/* SIDEBAR */}

      <Sidebar
        active="siswaAbsen"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          toggleSidebar={() =>
            setIsCollapsed(
              (prev) => !prev
            )
          }
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email:
              "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">

            {/* PAGE HEADER */}

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl theme-primary shadow-lg">
                  <ClipboardCheck
                    size={20}
                  />
                </div>

                <div>
                  <h1 className="text-2xl font-bold theme-text">
                    Absensi Siswa
                  </h1>

                  <p className="text-sm theme-text-muted">
                    Data absensi siswa
                    langsung dari
                    backend.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">

                {/* EXPORT */}

                <button
                  type="button"
                  onClick={
                    handleExport
                  }
                  disabled={
                    exporting ||
                    loading
                  }
                  className="
                    inline-flex items-center gap-2
                    px-4 py-2.5 rounded-xl
                    theme-success
                    text-sm font-semibold
                    transition-colors
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                    shadow-sm
                  "
                >
                  {exporting ? (
                    <RefreshCw
                      size={15}
                      className="animate-spin"
                    />
                  ) : (
                    <FileSpreadsheet
                      size={15}
                    />
                  )}

                  {exporting
                    ? "Mengexport..."
                    : "Export Excel"}
                </button>

                <button
                  type="button"
                  onClick={
                    loadData
                  }
                  disabled={
                    loading
                  }
                  className="
                    inline-flex items-center gap-2
                    px-4 py-2.5 rounded-xl
                    border theme-border
                    theme-card
                    theme-text-secondary
                    text-sm font-semibold
                    theme-sidebar-hover
                    transition-colors
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

                  Refresh Data
                </button>
              </div>
            </div>

            {/* EXPORT ERROR */}

            {exportError && (
              <div className="flex items-start gap-3 rounded-xl border theme-border theme-danger p-4">
                <AlertCircle
                  size={18}
                  className="mt-0.5"
                />

                <div>
                  <p className="text-sm font-semibold">
                    Export Excel gagal
                  </p>

                  <p className="text-xs mt-1">
                    {exportError}
                  </p>
                </div>
              </div>
            )}

            {/* ERROR */}

            {error && (
              <div className="flex items-start gap-3 rounded-xl border theme-border theme-danger p-4">
                <AlertCircle
                  size={18}
                  className="mt-0.5"
                />

                <div>
                  <p className="text-sm font-semibold">
                    Gagal mengambil
                    data
                  </p>

                  <p className="text-xs mt-1">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* STATISTICS */}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <StatCard
                title="Total Data"
                value={
                  totalSiswa
                }
                icon={Users}
                iconClass="text-[var(--color-primary)]"
              />

              <StatCard
                title="Hadir"
                value={
                  totalHadir
                }
                icon={
                  CheckCircle2
                }
                iconClass="text-[var(--color-success)]"
              />

              <StatCard
                title="Terlambat"
                value={
                  totalTerlambat
                }
                icon={Clock3}
                iconClass="text-[var(--color-warning)]"
              />

              <StatCard
                title="Izin"
                value={
                  totalIzin
                }
                icon={
                  AlertCircle
                }
                iconClass="text-[var(--color-info)]"
              />

              <StatCard
                title="Sakit"
                value={
                  totalSakit
                }
                icon={
                  AlertCircle
                }
                iconClass="text-[var(--color-warning)]"
              />

              <StatCard
                title="Alpa"
                value={
                  totalAlpa
                }
                icon={XCircle}
                iconClass="text-[var(--color-danger)]"
              />
            </div>

            {/* SUMMARY */}

            <div className="theme-card rounded-xl border theme-border p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                <div>
                  <p className="text-xs font-medium theme-text-muted">
                    Persentase
                    Kehadiran
                  </p>

                  <p className="text-2xl font-bold theme-text mt-1">
                    {
                      persentaseHadir
                    }
                    %
                  </p>
                </div>

                <div className="flex-1 max-w-xl">
                  <div className="h-3 theme-card-soft rounded-full overflow-hidden">
                    <div
                      className="h-full theme-primary rounded-full transition-all"
                      style={{
                        width: `${persentaseHadir}%`,
                      }}
                    />
                  </div>

                  <div className="flex justify-between mt-2">
                    <span className="text-[11px] theme-text-muted">
                      {
                        totalHadir
                      }{" "}
                      data hadir
                    </span>

                    <span className="text-[11px] theme-text-muted">
                      {
                        totalSiswa
                      }{" "}
                      total data
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* FILTER */}

            <div className="theme-card rounded-xl border theme-border p-4 shadow-sm flex flex-col lg:flex-row gap-3">

              <div className="relative flex-1">
                <Search
                  size={16}
                  className="
                    absolute left-3 top-1/2
                    -translate-y-1/2
                    theme-text-muted
                  "
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Cari nama, NISN, atau kelas..."
                  className="
                    w-full pl-9 pr-3 py-2
                    text-sm rounded-lg
                    theme-input
                    focus:outline-none
                  "
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">

                <Filter
                  size={15}
                  className="
                    text-[var(--color-primary)]
                    hidden sm:block
                  "
                />

                <div className="relative">
                  <CalendarDays
                    size={14}
                    className="
                      absolute left-3 top-1/2
                      -translate-y-1/2
                      theme-text-muted
                      pointer-events-none
                    "
                  />

                  <input
                    type="date"
                    value={
                      tanggalFilter
                    }
                    onChange={(e) =>
                      setTanggalFilter(
                        e.target.value
                      )
                    }
                    className="
                      text-sm rounded-lg
                      theme-input
                      pl-9 pr-3 py-2
                      font-medium
                      focus:outline-none
                    "
                  />
                </div>

                <select
                  value={
                    kelasFilter
                  }
                  onChange={(e) =>
                    setKelasFilter(
                      e.target.value
                    )
                  }
                  className="
                    text-sm rounded-lg
                    theme-input
                    px-3 py-2
                    font-medium
                    focus:outline-none
                  "
                >
                  {kelasOptions.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>

                <select
                  value={
                    statusFilter
                  }
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value
                    )
                  }
                  className="
                    text-sm rounded-lg
                    theme-input
                    px-3 py-2
                    font-medium
                    focus:outline-none
                  "
                >
                  {STATUS_OPTIONS.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>

                <button
                  type="button"
                  onClick={
                    resetFilter
                  }
                  className="
                    px-3 py-2 rounded-lg
                    border theme-border
                    theme-card
                    theme-text-muted
                    text-xs font-semibold
                    theme-sidebar-hover
                  "
                >
                  Reset
                </button>
              </div>
            </div>

            {/* TABLE */}

            <div className="theme-card rounded-xl border theme-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">

                  <thead>
                    <tr className="theme-primary">
                      <th className="text-center font-semibold px-4 py-3 w-[60px]">
                        No
                      </th>

                      <th className="text-left font-semibold px-4 py-3 min-w-[240px]">
                        Siswa
                      </th>

                      <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                        Kelas
                      </th>

                      <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                        Tanggal
                      </th>

                      <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                        Jam
                      </th>

                      <th className="text-center font-semibold px-4 py-3 whitespace-nowrap">
                        Status
                      </th>

                      <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                        Lokasi
                      </th>

                      <th className="text-center font-semibold px-4 py-3 whitespace-nowrap">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-14 text-center"
                        >
                          <div className="flex flex-col items-center">
                            <RefreshCw
                              size={24}
                              className="text-[var(--color-primary)] animate-spin"
                            />

                            <p className="text-sm font-semibold theme-text-secondary mt-3">
                              Mengambil data
                              absensi...
                            </p>

                            <p className="text-xs theme-text-muted mt-1">
                              Data kelas dan
                              absensi sedang
                              dimuat dari
                              backend.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredAbsensi.length > 0 ? (
                      filteredAbsensi.map(
                        (
                          item,
                          index
                        ) => (
                          <tr
                            key={
                              item.id ||
                              `${item.nisn}-${index}`
                            }
                            className="
                              border-b theme-border-soft
                              last:border-0
                              transition-colors
                              theme-table-hover
                            "
                          >
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg theme-info border theme-border text-xs font-bold">
                                {
                                  index +
                                  1
                                }
                              </span>
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <Avatar
                                  nama={
                                    item.nama
                                  }
                                />

                                <div>
                                  <p className="font-semibold theme-text">
                                    {
                                      item.nama
                                    }
                                  </p>

                                  <p className="text-[11px] theme-text-muted mt-0.5">
                                    NISN:{" "}
                                    {
                                      item.nisn
                                    }
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <span className="inline-flex items-center justify-center min-w-[48px] px-2.5 py-1 rounded-lg text-xs font-bold theme-info border theme-border">
                                {
                                  item.kelas
                                }
                              </span>
                            </td>

                            <td className="px-4 py-3">
                              <div>
                                <p className="text-xs font-medium theme-text-secondary">
                                  {
                                    item.tanggalLabel
                                  }
                                </p>

                                {item.dibuatPada && (
                                  <p className="text-[10px] theme-text-muted mt-0.5">
                                    dibuat{" "}
                                    {formatTanggal(
                                      item.dibuatPada
                                    )}
                                  </p>
                                )}
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Clock3
                                  size={14}
                                  className="theme-text-muted"
                                />

                                <span className="font-mono text-xs font-medium theme-text-secondary">
                                  {
                                    item.jamMasuk
                                  }
                                </span>
                              </div>
                            </td>

                            <td className="px-4 py-3 text-center">
                              <StatusBadge
                                status={
                                  item.status
                                }
                              />
                            </td>

                            <td className="px-4 py-3">
                              {item.lokasi !== "-" ? (
                                <div className="flex items-center gap-2">
                                  <MapPin
                                    size={14}
                                    className="text-[var(--color-primary)]"
                                  />

                                  <div>
                                    <p className="text-xs font-medium theme-text-secondary">
                                      {
                                        item.lokasi
                                      }
                                    </p>

                                    {Number.isFinite(
                                      item.latitude
                                    ) &&
                                      Number.isFinite(
                                        item.longitude
                                      ) && (
                                        <p className="text-[10px] font-mono theme-text-muted mt-0.5">
                                          {item.latitude.toFixed(
                                            4
                                          )}
                                          ,{" "}
                                          {item.longitude.toFixed(
                                            4
                                          )}
                                        </p>
                                      )}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs theme-text-muted">
                                  Tidak
                                  tersedia
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDetail(
                                      item
                                    )
                                  }
                                  className="
                                    inline-flex items-center gap-1.5
                                    px-2.5 py-1.5
                                    rounded-md
                                    theme-info
                                    border theme-border
                                    text-xs font-medium
                                    transition-colors
                                  "
                                >
                                  <Eye
                                    size={13}
                                  />

                                  Detail
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      )
                    ) : (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-12 text-center"
                        >
                          <div className="flex flex-col items-center">

                            <div className="w-12 h-12 rounded-full theme-info flex items-center justify-center mb-3">
                              <Search
                                size={20}
                              />
                            </div>

                            <p className="text-sm font-semibold theme-text-secondary">
                              Data absensi
                              tidak
                              ditemukan
                            </p>

                            <p className="text-xs theme-text-muted mt-1">
                              Coba kosongkan
                              tanggal atau
                              ubah filter
                              yang
                              digunakan.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* TABLE FOOTER */}

              <div className="px-4 py-3 border-t theme-border theme-card-soft flex items-center justify-between">
                <p className="text-xs theme-text-muted">
                  Menampilkan{" "}
                  <span className="font-semibold theme-text-secondary">
                    {
                      filteredAbsensi.length
                    }
                  </span>{" "}
                  data dari
                  backend
                </p>

                <div className="flex items-center gap-2">
                  <ClipboardCheck
                    size={15}
                    className="text-[var(--color-primary)]"
                  />

                  <span className="text-[11px] theme-text-muted">
                    Monitoring
                    Absensi
                    Siswa
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}