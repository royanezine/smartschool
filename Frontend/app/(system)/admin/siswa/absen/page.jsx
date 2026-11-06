"use client";

import { getToken } from "@/lib/auth";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

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
  AlarmClock,
  Timer,
} from "lucide-react";

import { getAbsensiSekolah } from "@/services/absensi.service";
import { getKelas } from "@/services/kelas.service";
import { getShiftSiswa } from "@/services/shiftSiswa.service";

function normalizeArray(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.result)) return response.result;
  if (Array.isArray(response?.result?.data)) {
    return response.result.data;
  }

  return [];
}

const RAW_API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const API_URL = RAW_API_URL.replace(/\/+$/, "");

const API_BASE = API_URL.endsWith("/api")
  ? API_URL
  : `${API_URL}/api`;

const STATUS_OPTIONS = [
  "Semua Status",
  "Hadir",
  "Terlambat",
  "Izin",
  "Sakit",
  "Alpa",
];

const STATUS_TO_BACKEND = {
  Hadir: "hadir",
  Terlambat: "terlambat",
  Izin: "izin",
  Sakit: "sakit",
  Alpa: "alpha",
};

const STATUS_SHIFT_LABEL = {
  tepat_waktu: "Tepat Waktu",
  terlambat: "Terlambat",
  di_luar_jam_shift: "Di Luar Jam Shift",
  tidak_dapat_dihitung: "Tidak Dapat Dihitung",
};

function normalizeStatus(status) {
  const value = String(status || "").toLowerCase().trim();

  if (value === "hadir") return "Hadir";
  if (value === "izin") return "Izin";
  if (value === "sakit") return "Sakit";
  if (value === "alpha" || value === "alpa") return "Alpa";
  if (value === "terlambat") return "Terlambat";

  return status ? String(status) : "Alpa";
}

function normalizeShiftCode(value) {
  return String(value || "").trim().toLowerCase();
}

/**
 * Mencocokkan shift pada tabel Kelas dengan master ShiftSiswa.
 * Kelas.shift berisi kode shift, misalnya pagi atau siang.
 */
function getShiftInfo(kelas, shiftByKode) {
  const kode = normalizeShiftCode(kelas?.shift);

  if (!kode) return null;

  return shiftByKode.get(kode) || null;
}

function formatTanggal(value) {
  if (!value) return "-";

  const raw = String(value);
  const dateOnly = raw.slice(0, 10);
  const date = new Date(`${dateOnly}T00:00:00`);

  if (Number.isNaN(date.getTime())) return raw;

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

function formatJamShift(value) {
  if (!value) return "-";

  const raw = String(value);
  const match = raw.match(/^(\d{1,2}):(\d{2})/);

  if (match) {
    return `${match[1].padStart(2, "0")}:${match[2]}`;
  }

  return raw;
}

function formatDurasi(menit) {
  const value = Number(menit) || 0;
  if (value <= 0) return "0 menit";

  const jam = Math.floor(value / 60);
  const sisa = value % 60;

  if (jam <= 0) return `${sisa} menit`;

  return sisa > 0
    ? `${jam} jam ${sisa} menit`
    : `${jam} jam`;
}

function formatMenitSingkat(menit) {
  const value = Math.round(Number(menit) || 0);
  if (value <= 0) return "0m";

  const jam = Math.floor(value / 60);
  const sisa = value % 60;

  if (jam <= 0) return `${sisa}m`;

  return sisa > 0
    ? `${jam}j ${sisa}m`
    : `${jam}j`;
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

/**
 * Mengubah jam HH:mm menjadi total menit.
 */
function parseJamMenit(value) {
  if (!value) return null;

  const match = String(value)
    .trim()
    .match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);

  if (!match) return null;

  const jam = Number(match[1]);
  const menit = Number(match[2]);

  if (jam > 23 || menit > 59) return null;

  return jam * 60 + menit;
}

/**
 * Mengambil jam aktual dari timestamp presensi.
 */
function getMenitAktual(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return (
    date.getHours() * 60 +
    date.getMinutes() +
    date.getSeconds() / 60
  );
}

/**
 * Menghitung status kedatangan berdasarkan shift kelas.
 *
 * Contoh:
 * Shift masuk 07:00
 * Toleransi 15 menit
 *
 * 06:55 = Tepat Waktu
 * 07:10 = Tepat Waktu
 * 07:16 = Terlambat
 *
 * Presensi setelah jam keluar = Di Luar Jam Shift.
 */
function hitungStatusKedatangan(waktuMasuk, shift) {
  if (!shift || !waktuMasuk || !shift.jamMasuk) {
    return {
      statusShift: "tidak_dapat_dihitung",
      statusShiftLabel: STATUS_SHIFT_LABEL.tidak_dapat_dihitung,
      terlambat: 0,
    };
  }

  const menitAktual = getMenitAktual(waktuMasuk);
  const menitMasukShift = parseJamMenit(shift.jamMasuk);
  const menitKeluarShift = parseJamMenit(shift.jamKeluar);

  if (
    menitAktual === null ||
    menitMasukShift === null
  ) {
    return {
      statusShift: "tidak_dapat_dihitung",
      statusShiftLabel: STATUS_SHIFT_LABEL.tidak_dapat_dihitung,
      terlambat: 0,
    };
  }

  const toleransi = Math.max(
    0,
    Number(shift.toleransiTerlambatMenit) || 0,
  );

  // Presensi dilakukan setelah jam shift berakhir.
  if (
    menitKeluarShift !== null &&
    menitAktual > menitKeluarShift
  ) {
    return {
      statusShift: "di_luar_jam_shift",
      statusShiftLabel: STATUS_SHIFT_LABEL.di_luar_jam_shift,
      terlambat: 0,
    };
  }

  const batasToleransi =
    menitMasukShift + toleransi;

  if (menitAktual > batasToleransi) {
    const terlambat = Math.ceil(
      menitAktual - menitMasukShift,
    );

    return {
      statusShift: "terlambat",
      statusShiftLabel: STATUS_SHIFT_LABEL.terlambat,
      terlambat,
    };
  }

  return {
    statusShift: "tepat_waktu",
    statusShiftLabel: STATUS_SHIFT_LABEL.tepat_waktu,
    terlambat: 0,
  };
}

function mapAbsensi(item, kelas, shiftByKode) {
  const tanggal = item?.tanggal || item?.dibuatPada || null;
  const dibuatPada = item?.dibuatPada || null;

  const latitude =
    item?.lintang !== null && item?.lintang !== undefined
      ? Number(item.lintang)
      : null;

  const longitude =
    item?.bujur !== null && item?.bujur !== undefined
      ? Number(item.bujur)
      : null;

  // Waktu presensi aktual.
  // Tidak menggunakan dibuatPada sebagai pengganti waktu presensi.
  const waktuMasukAktual = item?.waktuMasuk || null;
  const waktuKeluarAktual = item?.waktuKeluar || null;

  const shift = getShiftInfo(kelas, shiftByKode);

  const shiftSiswa = shift
    ? {
        kode: shift.kode,
        nama: shift.nama,
        jamMasuk: shift.jamMasuk,
        jamKeluar: shift.jamKeluar,
        toleransiTerlambatMenit:
          shift.toleransiTerlambatMenit,
      }
    : null;

  let status = normalizeStatus(item?.status);

  // Hanya hitung keterlambatan untuk siswa yang berstatus hadir.
  const hasilKedatangan =
    status === "Hadir"
      ? hitungStatusKedatangan(
          waktuMasukAktual,
          shiftSiswa,
        )
      : {
          statusShift: null,
          statusShiftLabel: null,
          terlambat: 0,
        };

  if (
    status === "Hadir" &&
    hasilKedatangan.statusShift === "terlambat"
  ) {
    status = "Terlambat";
  }

  const terlambatValue = hasilKedatangan.terlambat;

  return {
    id: item?.id,
    penggunaId: item?.penggunaId || item?.pengguna?.id || null,
    nama: getNamaSiswa(item),
    nisn: getNisn(item),

    kelas: getNamaKelas(item, kelas),
    kelasId:
      item?.kelasId ||
      item?.kelas?.id ||
      kelas?.id ||
      null,

    shiftSiswa,

    tanggal,
    tanggalLabel: formatTanggal(tanggal),

    jamMasuk: waktuMasukAktual
      ? formatJam(waktuMasukAktual)
      : "-",

    jamKeluar: waktuKeluarAktual
      ? formatJam(waktuKeluarAktual)
      : "-",

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

    foto:
      item?.urlFoto ||
      item?.fotoUrl ||
      item?.foto ||
      null,

    keterangan: item?.keterangan || "-",

    waliKelas:
      item?.kelas?.waliKelas?.namaLengkap ||
      item?.kelas?.waliKelas?.nama ||
      kelas?.waliKelas?.namaLengkap ||
      kelas?.waliKelas?.nama ||
      "-",

    dibuatPada,

    terlambat: terlambatValue,

    terlambatLabel:
      terlambatValue > 0
        ? formatDurasi(terlambatValue)
        : "-",

    terlambatMenitSingkat:
      terlambatValue > 0
        ? formatMenitSingkat(terlambatValue)
        : "",

    statusShift: hasilKedatangan.statusShift,
    statusShiftLabel: hasilKedatangan.statusShiftLabel,

    durasiKerjaMenit:
      Number(item?.durasiKerjaMenit) || 0,

    raw: item,
  };
}

function StatusBadge({
  status,
  terlambatMenit = 0,
}) {
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
    <div className="inline-flex flex-col items-start gap-1">
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
          styles[status] ||
          "theme-card-soft theme-text-muted theme-border"
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            dots[status] || "bg-[var(--color-text-muted)]"
          }`}
        />
        {status}
      </span>

      {Number(terlambatMenit) > 0 && (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold text-[var(--color-warning)] bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)]">
          <AlarmClock size={9} />
          {formatMenitSingkat(terlambatMenit)}
        </span>
      )}
    </div>
  );
}

function Avatar({ nama }) {
  return (
    <div className="w-9 h-9 rounded-full theme-primary flex items-center justify-center font-bold text-xs flex-shrink-0">
      {getInitials(nama)}
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClass,
}) {
  return (
    <div className="theme-card rounded-xl border theme-border p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <Icon size={15} className={iconClass} />

        <p className="text-[11px] font-medium theme-text-muted tracking-wide">
          {title}
        </p>
      </div>

      <p className="text-2xl font-bold theme-text mt-1.5">
        {value}
      </p>

      {subtitle && (
        <p className="text-[10px] font-semibold theme-text-muted mt-0.5 truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function ShiftBadge({ shift }) {
  if (!shift) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium theme-text-muted theme-card-soft border theme-border">
        Belum diatur
      </span>
    );
  }

  const isPagi =
    normalizeShiftCode(shift.kode) === "pagi";

  return (
    <div className="flex flex-col items-start gap-1.5">
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
          isPagi
            ? "theme-info theme-border"
            : "theme-warning theme-border"
        }`}
      >
        <AlarmClock size={12} />
        {shift.nama || shift.kode}
      </span>

      <div className="flex items-center gap-1.5 text-[11px] theme-text-secondary">
        <Clock3 size={12} className="theme-text-muted" />

        <span className="font-mono">
          {formatJamShift(shift.jamMasuk)} -{" "}
          {formatJamShift(shift.jamKeluar)}
        </span>
      </div>

      {shift.toleransiTerlambatMenit !== null &&
        shift.toleransiTerlambatMenit !== undefined && (
          <span className="text-[10px] theme-text-muted">
            Toleransi {shift.toleransiTerlambatMenit} menit
          </span>
        )}
    </div>
  );
}

function getFileNameFromResponse(response, fallbackDate) {
  const contentDisposition = response.headers.get(
    "content-disposition",
  );

  if (contentDisposition) {
    const match = contentDisposition.match(
      /filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i,
    );

    if (match?.[1]) {
      try {
        return decodeURIComponent(match[1]);
      } catch {
        return match[1];
      }
    }
  }

  return `rekap-absensi-siswa-${fallbackDate}.xlsx`;
}

async function downloadExcel({
  tanggal,
  kelasId,
  status,
  search,
}) {
  const token =
    typeof window !== "undefined"
      ? getToken()
      : null;

  if (!token) {
    throw new Error(
      "Token login tidak ditemukan. Silakan login kembali.",
    );
  }

  const params = new URLSearchParams();

  if (tanggal) params.set("tanggal", tanggal);
  if (kelasId) params.set("kelasId", kelasId);

  if (status && status !== "Semua Status") {
    params.set(
      "status",
      STATUS_TO_BACKEND[status] || status.toLowerCase(),
    );
  }

  if (search?.trim()) {
    params.set("search", search.trim());
  }

  params.set("role", "siswa");

  const query = params.toString();

  const url = `${API_BASE}/absensi/export${
    query ? `?${query}` : ""
  }`;

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
    let message = `Gagal export Excel (${response.status})`;

    try {
      const contentType =
        response.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        const json = await response.json();

        message =
          json?.message ||
          json?.error ||
          message;
      }
    } catch {
      // Gunakan pesan default.
    }

    throw new Error(message);
  }

  const blob = await response.blob();

  if (!blob.size) {
    throw new Error(
      "File Excel dari Sistem kosong.",
    );
  }

  const fallbackDate =
    tanggal || new Date().toISOString().slice(0, 10);

  const fileName = getFileNameFromResponse(
    response,
    fallbackDate,
  );

  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = blobUrl;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(
    () => window.URL.revokeObjectURL(blobUrl),
    1000,
  );
}

export default function AbsenSiswaPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [kelasData, setKelasData] = useState([]);
  const [absensiData, setAbsensiData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [error, setError] = useState("");
  const [exportError, setExportError] = useState("");

  const [search, setSearch] = useState("");
  const [kelasFilter, setKelasFilter] =
    useState("Semua Kelas");
  const [statusFilter, setStatusFilter] =
    useState("Semua Status");
  const [tanggalFilter, setTanggalFilter] =
    useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [totalData, setTotalData] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [statistik, setStatistik] = useState({
    total: 0,
    hadir: 0,
    terlambat: 0,
    izin: 0,
    sakit: 0,
    alpha: 0,
  });

  const kelasOptions = useMemo(() => {
    const names = kelasData
      .map((item) => item?.nama || item?.namaKelas)
      .filter(Boolean);

    return [
      "Semua Kelas",
      ...Array.from(new Set(names)).sort(),
    ];
  }, [kelasData]);

  const selectedKelasId = useMemo(() => {
    if (kelasFilter === "Semua Kelas") return "";

    const kelas = kelasData.find(
      (item) =>
        (item?.nama || item?.namaKelas) === kelasFilter,
    );

    return kelas?.id || "";
  }, [kelasData, kelasFilter]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Ambil kelas dan master shift secara bersamaan.
      const [kelasResult, shiftResult] =
        await Promise.allSettled([
          getKelas({
            page: 1,
            limit: 100,
            sortBy: "tingkat",
            sortOrder: "asc",
          }),
          getShiftSiswa(),
        ]);

      if (kelasResult.status === "rejected") {
        throw kelasResult.reason;
      }

      const daftarKelas = normalizeArray(
        kelasResult.value,
      );

      setKelasData(daftarKelas);

      let daftarShift = [];

      if (shiftResult.status === "fulfilled") {
        daftarShift = normalizeArray(
          shiftResult.value,
        );
      } else {
        console.error(
          "Gagal mengambil master shift siswa:",
          shiftResult.reason,
        );
      }

      const shiftByKode = new Map(
        daftarShift
          .filter((shift) => shift?.kode)
          .map((shift) => [
            normalizeShiftCode(shift.kode),
            shift,
          ]),
      );

      const response = await getAbsensiSekolah({
        page,
        limit,
        role: "siswa",
        search: search.trim() || undefined,
        kelasId: selectedKelasId || undefined,
        tanggal: tanggalFilter || undefined,
        status:
          statusFilter !== "Semua Status"
            ? STATUS_TO_BACKEND[statusFilter]
            : undefined,
      });

      const kelasById = new Map(
        daftarKelas.map((kelas) => [
          String(kelas.id),
          kelas,
        ]),
      );

      const mapped = (response?.data || []).map(
        (item) => {
          const kelasId =
            item?.kelasId ||
            item?.kelas?.id;

          const kelas =
            kelasById.get(String(kelasId)) ||
            item?.kelas ||
            null;

          return mapAbsensi(
            item,
            kelas,
            shiftByKode,
          );
        },
      );

      setAbsensiData(mapped);

      setTotalData(
        Number(response?.meta?.total) || 0,
      );

      setTotalPages(
        Math.max(
          1,
          Number(response?.meta?.totalPages) || 1,
        ),
      );

      setStatistik(
        response?.statistik || {
          total: 0,
          hadir: 0,
          terlambat: 0,
          izin: 0,
          sakit: 0,
          alpha: 0,
        },
      );
    } catch (err) {
      console.error(
        "Gagal mengambil data absensi siswa:",
        err,
      );

      setAbsensiData([]);
      setTotalData(0);
      setTotalPages(1);

      setStatistik({
        total: 0,
        hadir: 0,
        terlambat: 0,
        izin: 0,
        sakit: 0,
        alpha: 0,
      });

      setError(
        err?.message ||
          "Gagal mengambil data absensi dari sistem.",
      );
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    search,
    selectedKelasId,
    statusFilter,
    tanggalFilter,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1);
  };

  const resetFilter = () => {
    setSearch("");
    setKelasFilter("Semua Kelas");
    setStatusFilter("Semua Status");
    setTanggalFilter("");
    setPage(1);
    setExportError("");
  };

  const handleDetail = (item) => {
    if (!item?.id) return;

    const params = new URLSearchParams();

    if (item.kelasId) {
      params.set("kelasId", item.kelasId);
    }

    const query = params.toString();

    router.push(
      `/admin/siswa/absen/${item.id}${
        query ? `?${query}` : ""
      }`,
    );
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      setExportError("");

      await downloadExcel({
        tanggal: tanggalFilter,
        kelasId: selectedKelasId,
        status: statusFilter,
        search,
      });
    } catch (err) {
      console.error("Gagal export Excel:", err);

      setExportError(
        err?.message ||
          "Gagal mengekspor data ke Excel.",
      );
    } finally {
      setExporting(false);
    }
  };

  const totalHadir = statistik.hadir;
  const totalTerlambat = statistik.terlambat;
  const totalIzin = statistik.izin;
  const totalSakit = statistik.sakit;
  const totalAlpa = statistik.alpha;

  const persentaseHadir = statistik.total
    ? Math.round(
        (totalHadir / statistik.total) * 100,
      )
    : 0;

  const totalMenitTerlambatHalamanIni = useMemo(
    () =>
      absensiData.reduce(
        (sum, item) =>
          sum + (Number(item?.terlambat) || 0),
        0,
      ),
    [absensiData],
  );

  const firstRow =
    totalData > 0
      ? (page - 1) * limit + 1
      : 0;

  const lastRow = Math.min(
    (page - 1) * limit + absensiData.length,
    totalData,
  );

  return (
    <div className="flex h-screen w-full theme-page overflow-hidden">
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
            setIsCollapsed((prev) => !prev)
          }
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* HEADER */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl theme-primary shadow-lg">
                  <ClipboardCheck size={20} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold theme-text">
                    Absensi Siswa
                  </h1>

                  <p className="text-sm theme-text-muted">
                    Monitoring dan rekap presensi siswa dari sistem.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={exporting || loading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl theme-success text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                >
                  {exporting ? (
                    <RefreshCw
                      size={15}
                      className="animate-spin"
                    />
                  ) : (
                    <FileSpreadsheet size={15} />
                  )}

                  {exporting
                    ? "Mengexport..."
                    : "Export Excel"}
                </button>

                <button
                  type="button"
                  onClick={loadData}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border theme-border theme-card theme-text-secondary text-sm font-semibold theme-sidebar-hover transition-colors disabled:opacity-60"
                >
                  <RefreshCw
                    size={15}
                    className={
                      loading ? "animate-spin" : ""
                    }
                  />

                  Refresh Data
                </button>
              </div>
            </div>

            {/* ERROR EXPORT */}
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

            {/* ERROR DATA */}
            {error && (
              <div className="flex items-start gap-3 rounded-xl border theme-border theme-danger p-4">
                <AlertCircle
                  size={18}
                  className="mt-0.5"
                />

                <div>
                  <p className="text-sm font-semibold">
                    Gagal mengambil data
                  </p>

                  <p className="text-xs mt-1">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={loadData}
                    className="mt-2 text-xs font-semibold underline"
                  >
                    Coba lagi
                  </button>
                </div>
              </div>
            )}

            {/* STATISTIK */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <StatCard
                title="Total Data"
                value={statistik.total}
                icon={Users}
                iconClass="text-[var(--color-primary)]"
              />

              <StatCard
                title="Hadir"
                value={totalHadir}
                icon={CheckCircle2}
                iconClass="text-[var(--color-success)]"
              />

              <StatCard
                title="Terlambat"
                value={totalTerlambat}
                subtitle={
                  totalMenitTerlambatHalamanIni > 0
                    ? `±${formatDurasi(
                        totalMenitTerlambatHalamanIni,
                      )} di halaman ini`
                    : undefined
                }
                icon={AlarmClock}
                iconClass="text-[var(--color-warning)]"
              />

              <StatCard
                title="Izin"
                value={totalIzin}
                icon={AlertCircle}
                iconClass="text-[var(--color-info)]"
              />

              <StatCard
                title="Sakit"
                value={totalSakit}
                icon={AlertCircle}
                iconClass="text-[var(--color-warning)]"
              />

              <StatCard
                title="Alpa"
                value={totalAlpa}
                icon={XCircle}
                iconClass="text-[var(--color-danger)]"
              />
            </div>

            {/* PERSENTASE KEHADIRAN */}
            <div className="theme-card rounded-xl border theme-border p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-xs font-medium theme-text-muted">
                    Persentase Kehadiran
                  </p>

                  <p className="text-2xl font-bold theme-text mt-1">
                    {persentaseHadir}%
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
                      {totalHadir} data hadir
                    </span>

                    <span className="text-[11px] theme-text-muted">
                      {statistik.total} total data
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
                  className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    handleFilterChange(
                      setSearch,
                      e.target.value,
                    )
                  }
                  placeholder="Cari nama, NISN, atau kelas..."
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg theme-input focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Filter
                  size={15}
                  className="text-[var(--color-primary)] hidden sm:block"
                />

                <div className="relative">
                  <CalendarDays
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted pointer-events-none"
                  />

                  <input
                    type="date"
                    value={tanggalFilter}
                    onChange={(e) =>
                      handleFilterChange(
                        setTanggalFilter,
                        e.target.value,
                      )
                    }
                    className="text-sm rounded-lg theme-input pl-9 pr-3 py-2 font-medium focus:outline-none"
                  />
                </div>

                <select
                  value={kelasFilter}
                  onChange={(e) =>
                    handleFilterChange(
                      setKelasFilter,
                      e.target.value,
                    )
                  }
                  className="text-sm rounded-lg theme-input px-3 py-2 font-medium focus:outline-none"
                >
                  {kelasOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    handleFilterChange(
                      setStatusFilter,
                      e.target.value,
                    )
                  }
                  className="text-sm rounded-lg theme-input px-3 py-2 font-medium focus:outline-none"
                >
                  {STATUS_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={resetFilter}
                  className="px-3 py-2 rounded-lg border theme-border theme-card theme-text-muted text-xs font-semibold theme-sidebar-hover"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* TABEL ABSENSI */}
            <div className="theme-card rounded-xl border theme-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1180px] text-sm border-collapse">
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
                        Shift Kelas
                      </th>

                      <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                        Tanggal
                      </th>

                      <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                        Jam Presensi
                      </th>

                      <th className="text-center font-semibold px-4 py-3 whitespace-nowrap">
                        Status
                      </th>

                      <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                        Ketepatan Waktu
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
                          colSpan={10}
                          className="px-4 py-14 text-center"
                        >
                          <div className="flex flex-col items-center">
                            <RefreshCw
                              size={24}
                              className="text-[var(--color-primary)] animate-spin"
                            />

                            <p className="text-sm font-semibold theme-text-secondary mt-3">
                              Mengambil data absensi...
                            </p>

                            <p className="text-xs theme-text-muted mt-1">
                              Data sedang dimuat dari sistem.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : absensiData.length > 0 ? (
                      absensiData.map((item, index) => (
                        <tr
                          key={
                            item.id ||
                            `${item.nisn}-${index}`
                          }
                          className="border-b theme-border-soft last:border-0 transition-colors theme-table-hover"
                        >
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg theme-info border theme-border text-xs font-bold">
                              {(page - 1) * limit + index + 1}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar nama={item.nama} />

                              <div>
                                <p className="font-semibold theme-text">
                                  {item.nama}
                                </p>

                                <p className="text-[11px] theme-text-muted mt-0.5">
                                  NISN: {item.nisn}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <span className="inline-flex items-center justify-center min-w-[48px] px-2.5 py-1 rounded-lg text-xs font-bold theme-info border theme-border">
                              {item.kelas}
                            </span>
                          </td>

                          {/* SHIFT KELAS */}
                          <td className="px-4 py-3">
                            <ShiftBadge
                              shift={item.shiftSiswa}
                            />
                          </td>

                          {/* TANGGAL */}
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-xs font-medium theme-text-secondary">
                                {item.tanggalLabel}
                              </p>

                              {item.dibuatPada && (
                                <p className="text-[10px] theme-text-muted mt-0.5">
                                  Dibuat{" "}
                                  {formatTanggal(item.dibuatPada)}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* JAM PRESENSI AKTUAL */}
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-2">
                                <Clock3
                                  size={14}
                                  className="theme-text-muted"
                                />

                                <span className="font-mono text-xs font-semibold theme-text-secondary">
                                  {item.jamMasuk}
                                </span>
                              </div>

                              {item.jamKeluar !== "-" && (
                                <div className="flex items-center gap-2 pl-5">
                                  <span className="text-[10px] theme-text-muted">
                                    Pulang:
                                  </span>

                                  <span className="font-mono text-[11px] theme-text-secondary">
                                    {item.jamKeluar}
                                  </span>
                                </div>
                              )}

                              {item.jamMasuk === "-" && (
                                <span className="text-[10px] theme-text-muted">
                                  Waktu presensi tidak tersedia
                                </span>
                              )}
                            </div>
                          </td>

                          {/* STATUS ABSENSI */}
                          <td className="px-4 py-3 text-center">
                            <StatusBadge
                              status={item.status}
                              terlambatMenit={item.terlambat}
                            />
                          </td>

                          {/* KETEPATAN WAKTU BERDASARKAN SHIFT */}
                          <td className="px-4 py-3">
                            {item.statusShift === "di_luar_jam_shift" ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-bold theme-danger border theme-border w-fit">
                                <AlertCircle size={12} />
                                Di Luar Jam Shift
                              </span>
                            ) : item.statusShift === "terlambat" ? (
                              <div className="flex flex-col gap-1">
                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-bold text-[var(--color-warning)] bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)] border border-[color-mix(in_srgb,var(--color-warning)_28%,transparent)] w-fit">
                                  <AlarmClock size={12} />
                                  Terlambat {formatDurasi(item.terlambat)}
                                </span>

                                <span className="text-[10px] theme-text-muted">
                                  Melewati toleransi shift
                                </span>
                              </div>
                            ) : item.statusShift === "tepat_waktu" ? (
                              <div className="flex items-center gap-1.5">
                                <Timer
                                  size={12}
                                  className="text-[var(--color-success)]"
                                />

                                <span className="text-[11px] font-medium text-[var(--color-success)]">
                                  Tepat Waktu
                                </span>
                              </div>
                            ) : item.status === "Hadir" ||
                              item.status === "Terlambat" ? (
                              <span className="text-[11px] theme-text-muted">
                                Tidak dapat dihitung
                              </span>
                            ) : (
                              <span className="text-xs theme-text-muted">
                                -
                              </span>
                            )}
                          </td>

                          {/* LOKASI */}
                          <td className="px-4 py-3">
                            {item.lokasi !== "-" ? (
                              <div className="flex items-center gap-2">
                                <MapPin
                                  size={14}
                                  className="text-[var(--color-primary)]"
                                />

                                <div>
                                  <p className="text-xs font-medium theme-text-secondary">
                                    {item.lokasi}
                                  </p>

                                  {Number.isFinite(item.latitude) &&
                                    Number.isFinite(item.longitude) && (
                                      <p className="text-[10px] font-mono theme-text-muted mt-0.5">
                                        {item.latitude.toFixed(4)},{" "}
                                        {item.longitude.toFixed(4)}
                                      </p>
                                    )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs theme-text-muted">
                                Tidak tersedia
                              </span>
                            )}
                          </td>

                          {/* AKSI */}
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => handleDetail(item)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md theme-info border theme-border text-xs font-medium transition-colors"
                              >
                                <Eye size={13} />
                                Detail
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={10}
                          className="px-4 py-12 text-center"
                        >
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full theme-info flex items-center justify-center mb-3">
                              <Search size={20} />
                            </div>

                            <p className="text-sm font-semibold theme-text-secondary">
                              Data absensi tidak ditemukan
                            </p>

                            <p className="text-xs theme-text-muted mt-1">
                              Coba ubah kata pencarian atau filter yang digunakan.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div className="px-4 py-3 border-t theme-border theme-card-soft flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs theme-text-muted">
                  Menampilkan{" "}
                  <span className="font-semibold theme-text-secondary">
                    {firstRow}
                  </span>
                  {" - "}
                  <span className="font-semibold theme-text-secondary">
                    {lastRow}
                  </span>
                  {" dari "}
                  <span className="font-semibold theme-text-secondary">
                    {totalData}
                  </span>{" "}
                  data
                </p>

                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    className="text-xs rounded-lg theme-input px-2 py-2"
                    aria-label="Jumlah data per halaman"
                  >
                    <option value={10}>10 data</option>
                    <option value={20}>20 data</option>
                    <option value={50}>50 data</option>
                  </select>

                  <button
                    type="button"
                    onClick={() =>
                      setPage((current) =>
                        Math.max(1, current - 1),
                      )
                    }
                    disabled={page <= 1 || loading}
                    className="px-3 py-2 rounded-lg border theme-border theme-card text-xs disabled:opacity-50"
                  >
                    Sebelumnya
                  </button>

                  <span className="text-xs theme-text-secondary whitespace-nowrap">
                    Halaman {page} dari {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setPage((current) =>
                        Math.min(totalPages, current + 1),
                      )
                    }
                    disabled={page >= totalPages || loading}
                    className="px-3 py-2 rounded-lg border theme-border theme-card text-xs disabled:opacity-50"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}