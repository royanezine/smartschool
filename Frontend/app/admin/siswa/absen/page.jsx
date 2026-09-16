"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";

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
  Camera,
  Navigation,
  UserRound,
  ClipboardCheck,
  RefreshCw,
  FileSpreadsheet,
  Download,
} from "lucide-react";

import {
  getAbsensiKelas,
} from "../../../../services/absensi.service";

import {
  getKelas,
} from "../../../../services/kelas.service";

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

  if (
    value === "alpa" ||
    value === "alpha"
  ) {
    return "Alpa";
  }

  if (value === "terlambat") {
    return "Terlambat";
  }

  return status
    ? String(status)
    : "Alpa";
}

function formatTanggal(value) {
  if (!value) return "-";

  const raw = String(value);

  const dateOnly = raw.slice(0, 10);

  const date = new Date(
    `${dateOnly}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return raw;
  }

  return date.toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
}

function formatJam(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleTimeString(
    "id-ID",
    {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }
  );
}

function getInitials(nama) {
  return String(nama || "Siswa")
    .replace(/,.*/, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(
      (word) => word?.[0] || ""
    )
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

  let status = normalizeStatus(
    item?.status
  );

  /*
   * Kalau backend mengirim status hadir
   * tetapi ada informasi keterlambatan,
   * tampilkan sebagai Terlambat.
   */
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

    kelas: getNamaKelas(
      item,
      kelas
    ),

    kelasId:
      item?.kelasId ||
      item?.kelas?.id ||
      kelas?.id ||
      null,

    tanggal,

    tanggalLabel:
      formatTanggal(tanggal),

    jamMasuk:
      formatJam(
        dibuatPada || tanggal
      ),

    status,

    lokasi:
      item?.metode === "lokasi"
        ? "Sekolah"
        : item?.metode
        ? String(item.metode)
        : "-",

    metode:
      item?.metode || "-",

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
      item?.kelas?.waliKelas
        ?.namaLengkap ||
      item?.kelas?.waliKelas?.nama ||
      kelas?.waliKelas
        ?.namaLengkap ||
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
    Hadir:
      "bg-emerald-50 text-emerald-600 border-emerald-200",

    Terlambat:
      "bg-amber-50 text-amber-600 border-amber-200",

    Izin:
      "bg-blue-50 text-blue-600 border-blue-200",

    Sakit:
      "bg-orange-50 text-orange-600 border-orange-200",

    Alpa:
      "bg-red-50 text-red-600 border-red-200",
  };

  const dots = {
    Hadir: "bg-emerald-500",

    Terlambat: "bg-amber-500",

    Izin: "bg-blue-500",

    Sakit: "bg-orange-500",

    Alpa: "bg-red-500",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
        styles[status] ||
        "bg-slate-100 text-slate-500 border-slate-200"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          dots[status] ||
          "bg-slate-400"
        }`}
      />

      {status}
    </span>
  );
}

function Avatar({ nama }) {
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#155DFC] to-[#0d47c9] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
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
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <Icon
          size={15}
          className={iconClass}
        />

        <p className="text-[11px] font-medium text-slate-500 tracking-wide">
          {title}
        </p>
      </div>

      <p className="text-2xl font-bold text-slate-900 mt-1.5">
        {value}
      </p>
    </div>
  );
}

function DetailBox({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="p-3 rounded-xl border border-slate-200">
      <div className="flex items-center gap-2">
        <Icon
          size={14}
          className="text-[#155DFC]"
        />

        <span className="text-[11px] text-slate-500">
          {label}
        </span>
      </div>

      <p className="text-sm font-semibold text-slate-700 mt-2">
        {value || "-"}
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
      return decodeURIComponent(
        match[1]
      );
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

  /*
   * Hanya kirim parameter yang
   * memang dipilih user.
   */

  if (tanggal) {
    params.set(
      "tanggal",
      tanggal
    );
  }

  if (
    kelasId &&
    kelasId !== "Semua Kelas"
  ) {
    params.set(
      "kelasId",
      kelasId
    );
  }

  if (
    status &&
    status !== "Semua Status"
  ) {
    /*
     * Backend biasanya menggunakan
     * status lowercase.
     */
    const backendStatus =
      status === "Alpa"
        ? "alpha"
        : status.toLowerCase();

    params.set(
      "status",
      backendStatus
    );
  }

  const query =
    params.toString();

  const url =
    `${API_BASE}/absensi/export` +
    (query
      ? `?${query}`
      : "");

  const response =
    await fetch(url, {
      method: "GET",

      headers: {
        Authorization:
          `Bearer ${token}`,

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
    window.URL.createObjectURL(
      blob
    );

  const link =
    document.createElement("a");

  link.href = blobUrl;

  link.download =
    fileName;

  document.body.appendChild(
    link
  );

  link.click();

  link.remove();

  window.URL.revokeObjectURL(
    blobUrl
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function AbsenSiswaPage() {
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

  /*
   * Kosong = tampilkan seluruh
   * data absensi dari backend.
   */
  const [
    tanggalFilter,
    setTanggalFilter,
  ] = useState("");

  const [
    selectedAbsen,
    setSelectedAbsen,
  ] = useState(null);

  const [
    showDetail,
    setShowDetail,
  ] = useState(false);

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
                  /*
                   * BE:
                   * GET /api/v1/absensi/kelas/:kelasId
                   */

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

  /*
   * Ambil ID kelas berdasarkan
   * nama kelas yang dipilih.
   */

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
     DETAIL
  ========================================================= */

  const handleDetail =
    (item) => {
      setSelectedAbsen(item);
      setShowDetail(true);
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
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* SIDEBAR */}

      <Sidebar
        active="siswaAbsen"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={
          setIsCollapsed
        }
        role="admin"
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* HEADER */}

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

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#155DFC] to-[#0d47c9] text-white shadow-lg shadow-[#155DFC]/20">
                  <ClipboardCheck
                    size={20}
                  />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-slate-800">
                    Absensi Siswa
                  </h1>

                  <p className="text-sm text-slate-500">
                    Data absensi siswa
                    langsung dari
                    backend.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">

                {/* EXPORT EXCEL */}

                <button
                  type="button"
                  onClick={
                    handleExport
                  }
                  disabled={
                    exporting ||
                    loading
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
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

                {/* REFRESH */}

                <button
                  type="button"
                  onClick={
                    loadData
                  }
                  disabled={
                    loading
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-60"
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

            {/* =================================================
                EXPORT ERROR
            ================================================= */}

            {exportError && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                <AlertCircle
                  size={18}
                  className="text-red-500 mt-0.5"
                />

                <div>
                  <p className="text-sm font-semibold text-red-700">
                    Export Excel gagal
                  </p>

                  <p className="text-xs text-red-600 mt-1">
                    {exportError}
                  </p>
                </div>
              </div>
            )}

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                <AlertCircle
                  size={18}
                  className="text-red-500 mt-0.5"
                />

                <div>
                  <p className="text-sm font-semibold text-red-700">
                    Gagal mengambil
                    data
                  </p>

                  <p className="text-xs text-red-600 mt-1">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* =================================================
                STATISTICS
            ================================================= */}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">

              <StatCard
                title="Total Data"
                value={
                  totalSiswa
                }
                icon={Users}
                iconClass="text-[#155DFC]"
              />

              <StatCard
                title="Hadir"
                value={
                  totalHadir
                }
                icon={
                  CheckCircle2
                }
                iconClass="text-emerald-500"
              />

              <StatCard
                title="Terlambat"
                value={
                  totalTerlambat
                }
                icon={Clock3}
                iconClass="text-amber-500"
              />

              <StatCard
                title="Izin"
                value={
                  totalIzin
                }
                icon={
                  AlertCircle
                }
                iconClass="text-blue-500"
              />

              <StatCard
                title="Sakit"
                value={
                  totalSakit
                }
                icon={
                  AlertCircle
                }
                iconClass="text-orange-500"
              />

              <StatCard
                title="Alpa"
                value={
                  totalAlpa
                }
                icon={XCircle}
                iconClass="text-red-500"
              />
            </div>

            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Persentase
                    Kehadiran
                  </p>

                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {
                      persentaseHadir
                    }
                    %
                  </p>
                </div>

                <div className="flex-1 max-w-xl">
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#155DFC] to-[#0d47c9] rounded-full transition-all"
                      style={{
                        width: `${persentaseHadir}%`,
                      }}
                    />
                  </div>

                  <div className="flex justify-between mt-2">
                    <span className="text-[11px] text-slate-400">
                      {
                        totalHadir
                      }{" "}
                      data hadir
                    </span>

                    <span className="text-[11px] text-slate-400">
                      {
                        totalSiswa
                      }{" "}
                      total data
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                FILTER
            ================================================= */}

            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
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
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/25 focus:border-[#155DFC]/50 text-slate-800"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Filter
                  size={15}
                  className="text-[#155DFC] hidden sm:block"
                />

                {/* DATE */}

                <div className="relative">
                  <CalendarDays
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />

                  <input
                    type="date"
                    value={
                      tanggalFilter
                    }
                    onChange={(
                      e
                    ) =>
                      setTanggalFilter(
                        e.target
                          .value
                      )
                    }
                    className="text-sm rounded-lg border border-slate-200 pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/25 focus:border-[#155DFC]/50 bg-white text-slate-800 font-medium"
                  />
                </div>

                {/* KELAS */}

                <select
                  value={
                    kelasFilter
                  }
                  onChange={(
                    e
                  ) =>
                    setKelasFilter(
                      e.target
                        .value
                    )
                  }
                  className="text-sm rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/25 focus:border-[#155DFC]/50 bg-white text-slate-800 font-medium"
                >
                  {kelasOptions.map(
                    (item) => (
                      <option
                        key={
                          item
                        }
                        value={
                          item
                        }
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>

                {/* STATUS */}

                <select
                  value={
                    statusFilter
                  }
                  onChange={(
                    e
                  ) =>
                    setStatusFilter(
                      e.target
                        .value
                    )
                  }
                  className="text-sm rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/25 focus:border-[#155DFC]/50 bg-white text-slate-800 font-medium"
                >
                  {STATUS_OPTIONS.map(
                    (item) => (
                      <option
                        key={
                          item
                        }
                        value={
                          item
                        }
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>

                {/* RESET */}

                <button
                  type="button"
                  onClick={
                    resetFilter
                  }
                  className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-500 hover:bg-slate-50"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* =================================================
                TABLE
            ================================================= */}

            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#155DFC] to-[#0d47c9] text-white">

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
                              className="text-[#155DFC] animate-spin"
                            />

                            <p className="text-sm font-semibold text-slate-700 mt-3">
                              Mengambil data
                              absensi...
                            </p>

                            <p className="text-xs text-slate-400 mt-1">
                              Data kelas dan
                              absensi sedang
                              dimuat dari
                              backend.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : filteredAbsensi.length >
                      0 ? (
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
                            className={`border-b border-slate-100 last:border-0 transition-colors hover:bg-[#eaf1ff] ${
                              index %
                                2 ===
                              0
                                ? "bg-[#f7f9ff]"
                                : "bg-white"
                            }`}
                          >
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#eaf1ff] text-[#155DFC] border border-[#c7dbff] text-xs font-bold">
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
                                  <p className="font-semibold text-slate-900">
                                    {
                                      item.nama
                                    }
                                  </p>

                                  <p className="text-[11px] text-slate-400 mt-0.5">
                                    NISN:{" "}
                                    {
                                      item.nisn
                                    }
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <span className="inline-flex items-center justify-center min-w-[48px] px-2.5 py-1 rounded-lg text-xs font-bold text-[#155DFC] bg-[#eaf1ff] border border-[#c7dbff]">
                                {
                                  item.kelas
                                }
                              </span>
                            </td>

                            <td className="px-4 py-3">
                              <div>
                                <p className="text-xs font-medium text-slate-700">
                                  {
                                    item.tanggalLabel
                                  }
                                </p>

                                {item.dibuatPada && (
                                  <p className="text-[10px] text-slate-400 mt-0.5">
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
                                  size={
                                    14
                                  }
                                  className="text-slate-400"
                                />

                                <span className="font-mono text-xs font-medium text-slate-600">
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
                              {item.lokasi !==
                              "-" ? (
                                <div className="flex items-center gap-2">
                                  <MapPin
                                    size={
                                      14
                                    }
                                    className="text-[#155DFC]"
                                  />

                                  <div>
                                    <p className="text-xs font-medium text-slate-700">
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
                                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">
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
                                <span className="text-xs text-slate-400">
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
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[#155DFC] bg-[#eaf1ff] border border-[#c7dbff] hover:bg-[#d6e6ff] text-xs font-medium transition-colors"
                                >
                                  <Eye
                                    size={
                                      13
                                    }
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
                            <div className="w-12 h-12 rounded-full bg-[#eaf1ff] flex items-center justify-center mb-3">
                              <Search
                                size={
                                  20
                                }
                                className="text-[#155DFC]"
                              />
                            </div>

                            <p className="text-sm font-semibold text-slate-700">
                              Data absensi
                              tidak
                              ditemukan
                            </p>

                            <p className="text-xs text-slate-400 mt-1">
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

              <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Menampilkan{" "}
                  <span className="font-semibold text-slate-700">
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
                    className="text-[#155DFC]"
                  />

                  <span className="text-[11px] text-slate-400">
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

      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      {showDetail &&
        selectedAbsen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">

              {/* MODAL HEADER */}

              <div className="flex items-center justify-between p-5 border-b border-slate-200">
                <div>
                  <h3 className="font-bold text-slate-800">
                    Detail Absensi
                    Siswa
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    Data diambil dari
                    backend
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowDetail(
                      false
                    )
                  }
                  className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"
                >
                  <XCircle
                    size={20}
                  />
                </button>
              </div>

              <div className="p-5 space-y-5">

                {/* PROFIL */}

                <div className="flex items-center gap-4 p-4 rounded-xl bg-[#f7f9ff] border border-[#eaf1ff]">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#155DFC] to-[#0d47c9] text-white flex items-center justify-center font-bold">
                    {getInitials(
                      selectedAbsen.nama
                    )}
                  </div>

                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800">
                      {
                        selectedAbsen.nama
                      }
                    </h4>

                    <p className="text-xs text-slate-500 mt-1">
                      NISN:{" "}
                      {
                        selectedAbsen.nisn
                      }
                    </p>

                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2.5 py-1 rounded-lg bg-[#eaf1ff] border border-[#c7dbff] text-[#155DFC] text-[11px] font-bold">
                        {
                          selectedAbsen.kelas
                        }
                      </span>

                      <StatusBadge
                        status={
                          selectedAbsen.status
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* DETAIL */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <DetailBox
                    icon={
                      CalendarDays
                    }
                    label="Tanggal"
                    value={
                      selectedAbsen.tanggalLabel
                    }
                  />

                  <DetailBox
                    icon={Clock3}
                    label="Jam Masuk"
                    value={
                      selectedAbsen.jamMasuk
                    }
                  />

                  <DetailBox
                    icon={
                      UserRound
                    }
                    label="Wali Kelas"
                    value={
                      selectedAbsen.waliKelas
                    }
                  />

                  <DetailBox
                    icon={
                      ClipboardCheck
                    }
                    label="Metode"
                    value={
                      selectedAbsen.metode
                    }
                  />
                </div>

                {/* FOTO + GPS */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* FOTO */}

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <Camera
                          size={
                            15
                          }
                          className="text-[#155DFC]"
                        />

                        <p className="text-xs font-semibold text-slate-700">
                          Foto
                          Kehadiran
                        </p>
                      </div>
                    </div>

                    <div className="aspect-video bg-slate-100 flex items-center justify-center">
                      {selectedAbsen.foto ? (
                        <img
                          src={
                            selectedAbsen.foto
                          }
                          alt="Foto kehadiran"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center">
                          <Camera
                            size={
                              32
                            }
                            className="text-slate-300"
                          />

                          <p className="text-xs text-slate-400 mt-2">
                            Foto belum
                            tersedia
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* GPS */}

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <Navigation
                          size={
                            15
                          }
                          className="text-[#155DFC]"
                        />

                        <p className="text-xs font-semibold text-slate-700">
                          Lokasi
                          GPS
                        </p>
                      </div>
                    </div>

                    <div className="p-4">
                      {Number.isFinite(
                        selectedAbsen.latitude
                      ) ? (
                        <>
                          <div className="h-28 rounded-lg bg-[#eaf1ff] flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 opacity-30">
                              <div className="w-full h-full bg-[linear-gradient(90deg,transparent_49%,#155DFC_50%,transparent_51%),linear-gradient(0deg,transparent_49%,#155DFC_50%,transparent_51%)] bg-[size:30px_30px]" />
                            </div>

                            <div className="relative w-10 h-10 rounded-full bg-[#155DFC]/20 flex items-center justify-center">
                              <MapPin
                                size={
                                  22
                                }
                                className="text-[#155DFC]"
                                fill="currentColor"
                              />
                            </div>
                          </div>

                          <div className="mt-3 space-y-2">

                            <div>
                              <p className="text-[10px] text-slate-400">
                                Latitude
                              </p>

                              <p className="font-mono text-xs text-slate-700">
                                {selectedAbsen.latitude.toFixed(
                                  6
                                )}
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] text-slate-400">
                                Longitude
                              </p>

                              <p className="font-mono text-xs text-slate-700">
                                {Number.isFinite(
                                  selectedAbsen.longitude
                                )
                                  ? selectedAbsen.longitude.toFixed(
                                      6
                                    )
                                  : "-"}
                              </p>
                            </div>

                            {Number.isFinite(
                              selectedAbsen.akurasi
                            ) && (
                              <div className="flex items-center gap-2 text-[11px] text-emerald-600">
                                <Navigation
                                  size={
                                    12
                                  }
                                />

                                Akurasi GPS
                                ±
                                {
                                  selectedAbsen.akurasi
                                }{" "}
                                meter
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="h-44 flex flex-col items-center justify-center">
                          <MapPin
                            size={
                              32
                            }
                            className="text-slate-300"
                          />

                          <p className="text-xs text-slate-400 mt-2">
                            Lokasi tidak
                            tersedia
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* KETERANGAN */}

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">
                    Keterangan
                  </p>

                  <p className="text-sm text-slate-700 mt-2">
                    {
                      selectedAbsen.keterangan
                    }
                  </p>
                </div>

                {/* CLOSE */}

                <button
                  type="button"
                  onClick={() =>
                    setShowDetail(
                      false
                    )
                  }
                  className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-[#155DFC] to-[#0d47c9] text-white font-semibold text-sm hover:brightness-110 transition-all"
                >
                  Tutup Detail
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}