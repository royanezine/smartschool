"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Users,
  UserCheck,
  Clock3,
  CalendarDays,
  AlertCircle,
  CheckCircle2,
  XCircle,
  LogIn,
  LogOut,
  Timer,
  LoaderCircle,
  X,
  Info,
  CalendarRange,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Download,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { getMonitoringKehadiranGuru } from "@/services/absensi.service";
import { getShiftKerja } from "@/services/shiftKerja.service";


function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function unwrapMonitoringResponse(response, tanggal) {
  const root = response && typeof response === "object" ? response : {};

  let rows = [];

  if (Array.isArray(root.data)) {
    rows = root.data;
  } else if (Array.isArray(root.data?.data)) {
    rows = root.data.data;
  } else if (Array.isArray(root.data?.items)) {
    rows = root.data.items;
  } else if (Array.isArray(root.items)) {
    rows = root.items;
  }

  const data = rows.map((item, index) => {
    const pengguna = item?.pengguna || {};

    const rawAbsensi =
      item?.absensi ??
      item?.catatanAbsensi ??
      item?.presensi ??
      (item?.waktuMasuk !== undefined ||
      item?.waktuKeluar !== undefined ||
      item?.metode !== undefined
        ? item
        : null);

    const absensi = rawAbsensi
      ? {
          ...rawAbsensi,
          waktuMasuk: rawAbsensi.waktuMasuk ?? null,
          waktuKeluar: rawAbsensi.waktuKeluar ?? null,
          metode: rawAbsensi.metode ?? null,
          status: rawAbsensi.status ?? null,
          statusShift: rawAbsensi.statusShift ?? null,
          terlambatMenit: rawAbsensi.terlambatMenit ?? 0,
          durasiJamKerja:
            rawAbsensi.durasiJamKerja ??
            rawAbsensi.durasiKerja ??
            null,
        }
      : null;

    return {
      ...item,
      id: item?.id ?? `${item?.penggunaId ?? pengguna?.id ?? "absensi"}-${tanggal}-${index}`,
      namaLengkap: item?.namaLengkap ?? pengguna?.namaLengkap ?? "-",
      nip: item?.nip ?? pengguna?.nip ?? pengguna?.nuptk ?? "-",
      email: item?.email ?? pengguna?.email ?? "",
      shiftKerja: item?.shiftKerja ?? pengguna?.shiftKerja ?? null,
      absensi,
    };
  });

  return {
    tanggal,
    totalGuru: data.length,
    sudahAbsen: data.filter((item) => Boolean(item.absensi)).length,
    data,
  };
}

function formatTanggal(tanggal) {
  if (!tanggal) return "-";

  const date = new Date(`${tanggal}T00:00:00`);

  if (Number.isNaN(date.getTime())) return tanggal;

  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatWaktu(value) {
  if (!value) return "-";

  const raw = String(value).trim();

  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(raw)) {
    return raw.slice(0, 5);
  }

  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

function formatDurasi(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const number = Number(value);

  return Number.isFinite(number) ? `${number} jam` : String(value);
}

function formatStatus(value) {
  if (!value) return "-";

  const labels = {
    tepat_waktu: "Tepat waktu",
    terlambat: "Terlambat",
    pulang_cepat: "Pulang cepat",
    terlambat_dan_pulang_cepat: "Terlambat & pulang cepat",
    hadir: "Hadir",
    izin: "Izin",
    sakit: "Sakit",
    alpha: "Alpha",
    belum_absen: "Belum absen",
    manual: "Manual",
    face: "Pengenalan wajah",
    wajah: "Pengenalan wajah",
    lokasi: "Lokasi",
    barcode: "Barcode",
  };

  const key = String(value).trim().toLowerCase();

  if (labels[key]) return labels[key];

  return key
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getShiftName(shift) {
  if (!shift) return "Belum ditentukan";

  if (typeof shift === "string") {
    return shift.trim() || "Belum ditentukan";
  }

  return shift.nama || shift.namaShift || shift.kode || "Belum ditentukan";
}

function getShiftJam(shift) {
  if (!shift || typeof shift !== "object") return "-";

  const jamMasuk = shift.jamMasuk;
  const jamKeluar = shift.jamKeluar;

  if (!jamMasuk && !jamKeluar) return "-";

  return `${String(jamMasuk || "-").slice(0, 5)} - ${String(
    jamKeluar || "-"
  ).slice(0, 5)}`;
}

function getStatusGuru(item) {
  if (!item?.absensi) return "belum_absen";

  return (
    item.absensi.statusShift ||
    item.absensi.status ||
    item.statusMonitoring ||
    "hadir"
  );
}

function getStatusStyle(status) {
  const value = String(status || "").toLowerCase();

  if (value === "belum_absen" || value.includes("belum")) {
    return "bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] theme-text-muted";
  }

  if (value.includes("terlambat") || value.includes("pulang_cepat")) {
    return "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300";
  }

  if (value === "izin" || value === "sakit") {
    return "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300";
  }

  return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300";
}

function getInitials(name) {
  return String(name || "G")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase();
}

function toTimeNumber(value) {
  if (!value) return null;

  const raw = String(value).trim();

  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(raw)) {
    const [hour, minute] = raw.split(":").map(Number);
    return hour * 60 + minute;
  }

  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) return null;

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const hour = Number(parts.find((part) => part.type === "hour")?.value || 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value || 0);

  return hour * 60 + minute;
}

const SORT_ACCESSORS = {
  nama: (item) => String(item.namaLengkap || "").toLowerCase(),
  shift: (item) => getShiftName(item.shiftKerja).toLowerCase(),
  jamMasuk: (item) => toTimeNumber(item.absensi?.waktuMasuk),
  jamPulang: (item) => toTimeNumber(item.absensi?.waktuKeluar),
  durasi: (item) => {
    const value = item.absensi?.durasiJamKerja;
    if (value === null || value === undefined || value === "") return null;

    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  },
  terlambat: (item) => {
    if (!item.absensi) return null;
    return Number(item.absensi.terlambatMenit || 0);
  },
  status: (item) => String(getStatusGuru(item)).toLowerCase(),
};

function compareValues(a, b, direction) {
  const aEmpty = a === null || a === undefined || a === "";
  const bEmpty = b === null || b === undefined || b === "";

  if (aEmpty && bEmpty) return 0;
  if (aEmpty) return 1;
  if (bEmpty) return -1;

  if (typeof a === "number" && typeof b === "number") {
    return direction === "asc" ? a - b : b - a;
  }

  const result = String(a).localeCompare(String(b), "id", {
    sensitivity: "base",
  });

  return direction === "asc" ? result : -result;
}


export default function MonitoringKehadiranGuruPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tanggal, setTanggal] = useState(getLocalDate);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [filterShift, setFilterShift] = useState("semua");

  const [sortKey, setSortKey] = useState("nama");
  const [sortDir, setSortDir] = useState("asc");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [daftarShift, setDaftarShift] = useState([]);

  const [monitoring, setMonitoring] = useState({
    tanggal: getLocalDate(),
    totalGuru: 0,
    sudahAbsen: 0,
    data: [],
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchShifts() {
      try {
        const res = await getShiftKerja();
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        if (active) {
          setDaftarShift(list);
        }
      } catch (err) {
        console.error("Gagal memuat daftar shift:", err);
      }
    }

    const timer = setTimeout(() => {
      fetchShifts();
    }, 0);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  const loadData = useCallback(
    async (showRefresh = false, silent = false) => {
      if (!tanggal) {
        setError("Silakan pilih tanggal monitoring terlebih dahulu.");
        setLoading(false);
        return;
      }

      if (showRefresh) {
        setRefreshing(true);
      } else if (!silent) {
        setLoading(true);
      }

      if (!silent) setError("");

      try {
        const response = await getMonitoringKehadiranGuru({
          tanggal,
          status: filterStatus !== "semua" ? filterStatus : undefined,
          search: search.trim() || undefined,
          shiftKerjaId: filterShift !== "semua" ? filterShift : undefined,
        });

        const result = unwrapMonitoringResponse(response, tanggal);
        setMonitoring(result);

        if (!silent) setError("");
      } catch (err) {
        if (!silent) {
          setError(
            err?.message ||
              "Data kehadiran guru belum bisa dimuat. Silakan coba lagi."
          );

          setMonitoring({
            tanggal,
            totalGuru: 0,
            sudahAbsen: 0,
            data: [],
          });
        }
      } finally {
        if (!silent) setLoading(false);
        if (showRefresh) setRefreshing(false);
      }
    },
    [tanggal, filterStatus, search, filterShift]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadData]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") {
        loadData(false, true);
      }
    }, 10000);

    return () => clearInterval(intervalId);
  }, [loadData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 0);

    return () => clearTimeout(timer);
  }, [tanggal, search, filterStatus, filterShift, limit]);

  const filteredData = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return monitoring.data.filter((item) => {
      const nama = String(item.namaLengkap || "").toLowerCase();
      const nip = String(item.nip || "").toLowerCase();
      const email = String(item.email || "").toLowerCase();
      const shiftName = getShiftName(item.shiftKerja).toLowerCase();

      const matchesSearch =
        !keyword ||
        nama.includes(keyword) ||
        nip.includes(keyword) ||
        email.includes(keyword) ||
        shiftName.includes(keyword);

      const sudahAbsen = Boolean(item.absensi);
      const status = String(getStatusGuru(item)).toLowerCase();

      let matchesStatus = true;
      if (filterStatus === "hadir") {
        matchesStatus = sudahAbsen && (status === "hadir" || status === "tepat_waktu");
      } else if (filterStatus === "terlambat") {
        matchesStatus =
          sudahAbsen &&
          (status.includes("terlambat") ||
            Number(item.absensi?.terlambatMenit || 0) > 0);
      } else if (filterStatus === "izin") {
        matchesStatus = status === "izin";
      } else if (filterStatus === "sakit") {
        matchesStatus = status === "sakit";
      } else if (filterStatus === "alpa" || filterStatus === "alpha") {
        matchesStatus = status === "alpa" || status === "alpha";
      }

      let matchesShift = true;
      if (filterShift !== "semua") {
        const itemShiftId = item.shiftKerjaId || item.shiftKerja?.id;
        matchesShift = itemShiftId === filterShift;
      }

      return matchesSearch && matchesStatus && matchesShift;
    });
  }, [monitoring.data, search, filterStatus, filterShift]);

  const sortedData = useMemo(() => {
    const accessor = SORT_ACCESSORS[sortKey];
    if (!accessor) return filteredData;

    return [...filteredData].sort((a, b) =>
      compareValues(accessor(a), accessor(b), sortDir)
    );
  }, [filteredData, sortKey, sortDir]);

  const stats = useMemo(() => {
    if (loading || error) {
      return {
        total: "—",
        hadir: "—",
        terlambat: "—",
        izinSakit: "—",
      };
    }

    const total = filteredData.length;
    let hadir = 0;
    let terlambat = 0;
    let izinSakit = 0;

    for (const item of filteredData) {
      const status = String(getStatusGuru(item)).toLowerCase();
      const terlambatMenit = Number(item.absensi?.terlambatMenit || 0);

      if (terlambatMenit > 0 || status.includes("terlambat")) {
        terlambat += 1;
      } else if (status === "hadir" || status === "tepat_waktu") {
        hadir += 1;
      } else if (status === "izin" || status === "sakit") {
        izinSakit += 1;
      }
    }

    return { total, hadir, terlambat, izinSakit };
  }, [filteredData, loading, error]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / limit));
  const paginatedData = useMemo(() => {
    const start = (page - 1) * limit;
    return sortedData.slice(start, start + limit);
  }, [sortedData, page, limit]);

  const isToday = tanggal === getLocalDate();

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir((direction) => (direction === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function handleExportCsv() {
    if (sortedData.length === 0) return;

    const headers = [
      "No",
      "Nama Guru",
      "NIP/NUPTK",
      "Email",
      "Shift",
      "Jam Masuk",
      "Jam Pulang",
      "Durasi (Jam)",
      "Keterlambatan (Menit)",
      "Metode",
      "Status",
    ];

    const rows = sortedData.map((item, index) => {
      const absensi = item.absensi;
      const status = getStatusGuru(item);
      const terlambatMenit = Number(absensi?.terlambatMenit || 0);

      return [
        index + 1,
        `"${(item.namaLengkap || "-").replace(/"/g, '""')}"`,
        `"${item.nip || "-"}"`,
        `"${item.email || "-"}"`,
        `"${getShiftName(item.shiftKerja).replace(/"/g, '""')}"`,
        formatWaktu(absensi?.waktuMasuk),
        formatWaktu(absensi?.waktuKeluar),
        formatDurasi(absensi?.durasiJamKerja),
        terlambatMenit,
        absensi?.metode ? formatStatus(absensi.metode) : "-",
        formatStatus(status),
      ].join(",");
    });

    const newline = String.fromCharCode(13, 10);
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join(newline);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `monitoring-kehadiran-guru-${tanggal || "semua"}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        role="admin"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0">
          <Header onMenuClick={() => setSidebarOpen(true)} />
        </div>

        <main className="min-w-0 flex-1 overflow-y-auto theme-page theme-text">
          <div className="w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl theme-text">
                  Monitoring Kehadiran Guru
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 theme-text-secondary">
                  Pantau catatan absensi guru berdasarkan tanggal yang dipilih.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCsv}
                  disabled={loading || sortedData.length === 0}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border theme-border theme-card px-3.5 text-sm font-medium theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] disabled:cursor-not-allowed disabled:opacity-50"
                  title="Ekspor data hasil filter ke CSV"
                >
                  <Download size={15} />
                  Ekspor CSV
                </button>

                <button
                  type="button"
                  onClick={() => loadData(true)}
                  disabled={loading || refreshing}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border theme-border theme-card px-4 text-sm font-medium theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw
                    size={16}
                    className={refreshing ? "animate-spin" : ""}
                  />
                  {refreshing ? "Memuat..." : "Muat Ulang"}
                </button>
              </div>
            </div>

            <div className="mb-6 flex items-start gap-3 rounded-lg border theme-border theme-card p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                <Info size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium theme-text">
                  Data absensi diperbarui otomatis
                </p>
                <p className="mt-1 text-xs leading-5 theme-text-muted">
                  Data diperbarui setiap 10 detik selama halaman aktif. Klik
                  judul kolom untuk mengurutkan data.
                </p>
              </div>
            </div>

            <section className="mb-6 rounded-xl border theme-border theme-card p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4 flex-1">
                  <div>
                    <label
                      htmlFor="tanggal-monitoring"
                      className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold theme-text-secondary"
                    >
                      <CalendarRange size={14} />
                      Tanggal Monitoring
                    </label>
                    <input
                      id="tanggal-monitoring"
                      type="date"
                      value={tanggal}
                      max={getLocalDate()}
                      onChange={(event) => setTanggal(event.target.value)}
                      className="theme-input h-10 w-full rounded-lg border px-3 text-sm outline-none transition"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="pencarian-guru"
                      className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold theme-text-secondary"
                    >
                      <Search size={14} />
                      Cari Guru
                    </label>
                    <input
                      id="pencarian-guru"
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Nama, NIP, atau email..."
                      className="theme-input h-10 w-full rounded-lg border px-3 text-sm outline-none transition"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="filter-status"
                      className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold theme-text-secondary"
                    >
                      <Filter size={14} />
                      Status Kehadiran
                    </label>
                    <select
                      id="filter-status"
                      value={filterStatus}
                      onChange={(event) => setFilterStatus(event.target.value)}
                      className="theme-input h-10 w-full rounded-lg border px-3 text-sm outline-none transition"
                    >
                      <option value="semua">Semua Status</option>
                      <option value="hadir">Hadir / Tepat Waktu</option>
                      <option value="terlambat">Terlambat</option>
                      <option value="izin">Izin</option>
                      <option value="sakit">Sakit</option>
                      <option value="alpa">Alpa</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="filter-shift"
                      className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold theme-text-secondary"
                    >
                      <Clock3 size={14} />
                      Shift Kerja
                    </label>
                    <select
                      id="filter-shift"
                      value={filterShift}
                      onChange={(event) => setFilterShift(event.target.value)}
                      className="theme-input h-10 w-full rounded-lg border px-3 text-sm outline-none transition"
                    >
                      <option value="semua">Semua Shift</option>
                      {daftarShift.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nama || s.namaShift || s.kode} ({String(s.jamMasuk || "").slice(0, 5)} - {String(s.jamKeluar || "").slice(0, 5)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end">
                  {!isToday && (
                    <button
                      type="button"
                      onClick={() => setTanggal(getLocalDate())}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border theme-border px-3 text-sm font-medium theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)]"
                    >
                      <CalendarDays size={15} />
                      Hari ini
                    </button>
                  )}

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] px-2.5 py-1 text-xs font-semibold theme-primary-text">
                      {isToday ? "Hari ini" : "Riwayat"}
                    </span>
                    <p className="mt-1 text-xs font-medium theme-text">
                      {formatTanggal(tanggal)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {error && (
              <div
                role="alert"
                className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
              >
                <AlertCircle size={19} className="mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">Data belum bisa dimuat</p>
                  <p className="mt-1 break-words">{error}</p>
                  <button
                    type="button"
                    onClick={() => loadData(true)}
                    className="mt-2 font-semibold underline underline-offset-2"
                  >
                    Coba lagi
                  </button>
                </div>
                <button
                  type="button"
                  aria-label="Tutup pesan error"
                  onClick={() => setError("")}
                  className="rounded p-1 hover:bg-red-100 dark:hover:bg-red-900/40"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard
                title="Total Catatan"
                value={stats.total}
                description="Catatan absensi sesuai filter"
                icon={Users}
                tone="blue"
              />
              <SummaryCard
                title="Hadir Tepat Waktu"
                value={stats.hadir}
                description="Hadir sesuai jam shift"
                icon={UserCheck}
                tone="emerald"
              />
              <SummaryCard
                title="Terlambat"
                value={stats.terlambat}
                description="Melewati toleransi jam masuk"
                icon={Clock3}
                tone="amber"
              />
              <SummaryCard
                title="Izin / Sakit"
                value={stats.izinSakit}
                description="Dispensasi ketidakhadiran"
                icon={Info}
                tone="slate"
              />
            </div>

            <section className="overflow-hidden rounded-xl border theme-border theme-card shadow-sm">
              <div className="border-b theme-border p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-semibold theme-text text-base">
                      Daftar Kehadiran Guru
                    </h2>
                    <p className="mt-1 text-xs theme-text-muted">
                      Menampilkan {sortedData.length > 0 ? (page - 1) * limit + 1 : 0} -{" "}
                      {Math.min(page * limit, sortedData.length)} dari {sortedData.length} catatan
                      {monitoring.data.length !== sortedData.length &&
                        ` (difilter dari ${monitoring.data.length} total)`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs theme-text-muted">Baris:</span>
                    <select
                      value={limit}
                      onChange={(e) => setLimit(Number(e.target.value))}
                      className="theme-input h-8 rounded-lg border px-2 text-xs outline-none"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="relative">
                {loading ? (
                  <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
                    <LoaderCircle
                      size={28}
                      className="animate-spin theme-primary-text"
                    />
                    <p className="mt-3 text-sm font-medium theme-text">
                      Memuat data kehadiran guru...
                    </p>
                    <p className="mt-1 text-xs theme-text-muted">
                      Menghubungi endpoint absensi server
                    </p>
                  </div>
                ) : error && monitoring.data.length === 0 ? (
                  <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                      <AlertCircle size={23} />
                    </div>
                    <p className="mt-4 font-semibold theme-text text-base">
                      Data Kehadiran Gagal Dimuat
                    </p>
                    <p className="mt-1 max-w-md text-xs leading-5 theme-text-muted">
                      {error}
                    </p>
                    <button
                      type="button"
                      onClick={() => loadData(true)}
                      className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg theme-primary px-3 text-xs font-semibold text-white hover:opacity-90 transition"
                    >
                      <RefreshCw size={14} />
                      Coba Lagi
                    </button>
                  </div>
                ) : paginatedData.length === 0 ? (
                  <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] theme-text-muted">
                      <Users size={23} />
                    </div>
                    <p className="mt-4 font-semibold theme-text text-base">
                      {monitoring.data.length === 0
                        ? "Belum Ada Catatan Kehadiran"
                        : "Tidak Ada Data yang Sesuai Filter"}
                    </p>
                    <p className="mt-1 max-w-sm text-xs theme-text-muted">
                      {monitoring.data.length === 0
                        ? `Tidak ada catatan absensi guru yang tercatat pada ${formatTanggal(tanggal)}.`
                        : "Ubah kata kunci pencarian, filter status, atau shift untuk melihat data lain."}
                    </p>
                    {(search || filterStatus !== "semua" || filterShift !== "semua") && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearch("");
                          setFilterStatus("semua");
                          setFilterShift("semua");
                        }}
                        className="mt-3 text-xs font-semibold theme-primary-text hover:underline"
                      >
                        Reset Filter
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1150px] text-left text-sm">
                      <thead className="border-b theme-border bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] text-xs uppercase tracking-wide theme-text-muted">
                        <tr>
                          <th className="w-12 px-4 py-4 text-center font-semibold">
                            No
                          </th>
                          <SortableTh
                            label="Guru"
                            sortKey="nama"
                            currentKey={sortKey}
                            currentDir={sortDir}
                            onSort={handleSort}
                          />
                          <SortableTh
                            label="Shift"
                            sortKey="shift"
                            currentKey={sortKey}
                            currentDir={sortDir}
                            onSort={handleSort}
                          />
                          <SortableTh
                            label="Jam Masuk"
                            sortKey="jamMasuk"
                            currentKey={sortKey}
                            currentDir={sortDir}
                            onSort={handleSort}
                          />
                          <SortableTh
                            label="Jam Pulang"
                            sortKey="jamPulang"
                            currentKey={sortKey}
                            currentDir={sortDir}
                            onSort={handleSort}
                          />
                          <SortableTh
                            label="Durasi"
                            sortKey="durasi"
                            currentKey={sortKey}
                            currentDir={sortDir}
                            onSort={handleSort}
                          />
                          <SortableTh
                            label="Keterlambatan"
                            sortKey="terlambat"
                            currentKey={sortKey}
                            currentDir={sortDir}
                            onSort={handleSort}
                          />
                          <th className="px-5 py-4 font-semibold">Metode</th>
                          <SortableTh
                            label="Status"
                            sortKey="status"
                            currentKey={sortKey}
                            currentDir={sortDir}
                            onSort={handleSort}
                          />
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-[color-mix(in_srgb,var(--color-text)_5%,transparent)]">
                        {paginatedData.map((item, index) => {
                          const absensi = item.absensi;
                          const status = getStatusGuru(item);
                          const terlambatMenit = Number(
                            absensi?.terlambatMenit || 0
                          );
                          const nomorUrut = (page - 1) * limit + index + 1;

                          return (
                            <tr
                              key={item.id}
                              className="transition hover:bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)]"
                            >
                              <td className="px-4 py-4 text-center text-sm tabular-nums theme-text-muted">
                                {nomorUrut}
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-sm font-bold theme-primary-text">
                                    {getInitials(item.namaLengkap)}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold theme-text">
                                      {item.namaLengkap || "Nama tidak tersedia"}
                                    </p>
                                    <p className="mt-1 text-xs theme-text-muted">
                                      NIP: {item.nip || "-"}
                                    </p>
                                    {item.email && (
                                      <p className="mt-0.5 max-w-56 truncate text-xs theme-text-muted">
                                        {item.email}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <p className="font-medium theme-text">
                                  {getShiftName(item.shiftKerja)}
                                </p>
                                <p className="mt-1 text-xs theme-text-muted">
                                  {getShiftJam(item.shiftKerja)}
                                </p>
                              </td>

                              <td className="px-5 py-4">
                                <span className="inline-flex items-center gap-2 theme-text">
                                  <LogIn size={15} className="text-emerald-600" />
                                  {formatWaktu(absensi?.waktuMasuk)}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <span className="inline-flex items-center gap-2 theme-text">
                                  <LogOut size={15} className="text-blue-600" />
                                  {formatWaktu(absensi?.waktuKeluar)}
                                </span>
                              </td>

                              <td className="px-5 py-4 theme-text">
                                {formatDurasi(absensi?.durasiJamKerja)}
                              </td>

                              <td className="px-5 py-4">
                                {absensi ? (
                                  terlambatMenit > 0 ? (
                                    <span className="inline-flex items-center gap-1.5 font-medium text-amber-700 dark:text-amber-400">
                                      <Timer size={15} />
                                      {terlambatMenit} menit
                                    </span>
                                  ) : (
                                    <span className="theme-text-muted">
                                      Tepat waktu
                                    </span>
                                  )
                                ) : (
                                  <span className="theme-text-muted">-</span>
                                )}
                              </td>

                              <td className="px-5 py-4">
                                <span className="rounded-md bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] px-2.5 py-1 text-xs font-medium theme-text-secondary">
                                  {absensi?.metode
                                    ? formatStatus(absensi.metode)
                                    : "-"}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <span
                                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-semibold ${getStatusStyle(status)}`}
                                >
                                  {String(status).toLowerCase().includes("belum") ? (
                                    <XCircle size={14} />
                                  ) : String(status).toLowerCase().includes("terlambat") ||
                                    String(status).toLowerCase().includes("pulang_cepat") ? (
                                    <AlertCircle size={14} />
                                  ) : (
                                    <CheckCircle2 size={14} />
                                  )}
                                  {formatStatus(status)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {!loading && !error && sortedData.length > 0 && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t theme-border px-5 py-3.5">
                  <p className="text-xs theme-text-muted">
                    Halaman <strong className="theme-text">{page}</strong> dari{" "}
                    <strong className="theme-text">{totalPages}</strong> ({sortedData.length} data ditemukan)
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border theme-border theme-card theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Halaman sebelumnya"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum = i + 1;
                        if (totalPages > 5 && page > 3) {
                          pageNum = page - 3 + i;
                          if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                        }

                        const active = page === pageNum;

                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => setPage(pageNum)}
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition ${
                              active
                                ? "theme-primary text-white"
                                : "border theme-border theme-card theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border theme-border theme-card theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Halaman berikutnya"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              <div className="border-t theme-border px-5 py-3 text-xs theme-text-muted">
                Data kehadiran diambil dari endpoint monitoring absensi dan
                diperbarui otomatis.{" "}
                Diurutkan berdasarkan{" "}
                <strong>{getSortLabel(sortKey)}</strong>{" "}
                ({sortDir === "asc" ? "A→Z / kecil→besar" : "Z→A / besar→kecil"}).
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}


function SortableTh({
  label,
  sortKey,
  currentKey,
  currentDir,
  onSort,
  className = "",
}) {
  const isActive = currentKey === sortKey;

  return (
    <th
      className={`px-5 py-4 font-semibold ${className}`}
      aria-sort={
        isActive
          ? currentDir === "asc"
            ? "ascending"
            : "descending"
          : "none"
      }
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="group inline-flex items-center gap-1.5 rounded transition hover:text-[var(--color-primary)]"
      >
        <span>{label}</span>
        <span
          className={`inline-flex h-4 w-4 items-center justify-center transition ${
            isActive
              ? "theme-primary-text"
              : "theme-text-muted opacity-50 group-hover:opacity-100"
          }`}
        >
          {isActive ? (
            currentDir === "asc" ? (
              <ArrowUp size={13} />
            ) : (
              <ArrowDown size={13} />
            )
          ) : (
            <ArrowUpDown size={13} />
          )}
        </span>
      </button>
    </th>
  );
}


function SummaryCard({ title, value, description, icon: Icon, tone = "blue" }) {
  const toneClasses = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
    emerald:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
    slate:
      "bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] theme-text-muted",
    amber:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  };

  return (
    <div className="rounded-xl border theme-border theme-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium theme-text-muted">{title}</p>
          <p className="mt-3 text-2xl font-bold tracking-tight tabular-nums theme-text">
            {typeof value === "number"
              ? value.toLocaleString("id-ID")
              : value}
          </p>
          <p className="mt-1 text-xs theme-text-muted">{description}</p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneClasses[tone] ?? toneClasses.blue}`}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}


function getSortLabel(key) {
  const labels = {
    nama: "Nama Guru",
    shift: "Shift",
    jamMasuk: "Jam Masuk",
    jamPulang: "Jam Pulang",
    durasi: "Durasi Kerja",
    terlambat: "Keterlambatan",
    status: "Status",
  };

  return labels[key] ?? key;
}
