"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  Search,
  CalendarDays,
  Users,
  UserCheck,
  UserX,
  Clock3,
  AlertCircle,
  CheckCircle2,
  Download,
  BriefcaseBusiness,
  LoaderCircle,
  Info,
  CalendarRange,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { getMonitoringKehadiranGuru } from "@/services/absensi.service";
import { getShiftKerja } from "@/services/shiftKerja.service";


function getLocalDate() {
  const now = new Date();

  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}


function unwrapMonitoringResponse(response, tanggal) {
  const data = Array.isArray(response?.data) ? response.data : [];

  const normalizedData = data.map((item) => {
    const pengguna = item?.pengguna || {};
    const shift = item?.shiftKerja || pengguna?.shiftKerja || null;

    return {
      ...item,
      id: item.id || `${item.penggunaId || pengguna.id}-${item.tanggal || tanggal}`,
      namaLengkap: pengguna.namaLengkap || "-",
      nip: pengguna.nip || pengguna.nuptk || "-",
      shiftKerja: shift,

      absensi: {
        id: item.id,
        waktuMasuk: item.waktuMasuk,
        waktuKeluar: item.waktuKeluar,
        metode: item.metode,
        status: item.status,
        statusShift: item.statusShift,
        terlambatMenit: item.terlambatMenit,
        keterangan: item.keterangan,
      },
    };
  });

  return {
    tanggal,
    totalGuru: normalizedData.length,
    sudahAbsen: normalizedData.length,
    belumAbsen: 0,
    data: normalizedData,
  };
}



function getShiftName(shift) {
  if (!shift) return "Belum ditentukan";

  if (typeof shift === "string") {
    return shift.trim() || "Belum ditentukan";
  }

  return shift.nama || shift.kode || "Belum ditentukan";
}

function getShiftKey(shift) {
  if (!shift) return "belum-ditentukan";

  if (typeof shift === "string") {
    return shift.trim() || "belum-ditentukan";
  }

  return shift.id || shift.nama || shift.kode || "belum-ditentukan";
}






function getShiftJam(shift) {
  if (!shift || typeof shift !== "object") return "-";

  if (!shift.jamMasuk && !shift.jamKeluar) return "-";

  return `${String(shift.jamMasuk || "-").slice(0, 5)} - ${String(
    shift.jamKeluar || "-"
  ).slice(0, 5)}`;
}

function getStatusGuru(item) {
  if (!item?.absensi) return "belum_absen";

  return (
    item.absensi.statusShift ||
    item.statusMonitoring ||
    item.absensi.status ||
    "hadir"
  );
}

function isLate(item) {
  if (!item?.absensi) return false;

  return (
    Number(item.absensi.terlambatMenit || 0) > 0 ||
    String(getStatusGuru(item)).toLowerCase().includes("terlambat")
  );
}

function formatStatus(value) {
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
  };

  const key = String(value || "belum_absen").toLowerCase();

  if (labels[key]) return labels[key];

  return key
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
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

function formatTanggal(value) {
  if (!value) return "-";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
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


export default function RekapAbsensiShiftPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tanggal, setTanggal] = useState(getLocalDate);
  const [search, setSearch] = useState("");
  const [filterShift, setFilterShift] = useState("semua");
  const [filterStatus, setFilterStatus] = useState("semua");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [daftarShiftMaster, setDaftarShiftMaster] = useState([]);

  const [monitoring, setMonitoring] = useState({
    tanggal: getLocalDate(),
    totalGuru: 0,
    sudahAbsen: 0,
    belumAbsen: 0,
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
          setDaftarShiftMaster(list);
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
        setError("Silakan pilih tanggal rekap.");
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

        setMonitoring(unwrapMonitoringResponse(response, tanggal));
      } catch (err) {
        if (!silent) {
          setError(
            err?.message ||
              "Data rekap absensi shift belum bisa dimuat. Silakan coba lagi."
          );

          setMonitoring({
            tanggal,
            totalGuru: 0,
            sudahAbsen: 0,
            belumAbsen: 0,
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
    const timer = setTimeout(() => {
      setPage(1);
    }, 0);

    return () => clearTimeout(timer);
  }, [tanggal, search, filterShift, filterStatus, limit]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") {
        loadData(false, true);
      }
    }, 10000);

    return () => clearInterval(intervalId);
  }, [loadData]);


  const rekapShift = useMemo(() => {
    const groups = new Map();

    if (Array.isArray(daftarShiftMaster) && daftarShiftMaster.length > 0) {
      for (const master of daftarShiftMaster) {
        if (master?.id) {
          groups.set(String(master.id), {
            key: String(master.id),
            nama: master.nama || master.namaShift || master.kode || "Shift",
            jam: `${String(master.jamMasuk || "-").slice(0, 5)} - ${String(
              master.jamKeluar || "-"
            ).slice(0, 5)}`,
            totalGuru: 0,
            sudahAbsen: 0,
            tepatWaktu: 0,
            terlambat: 0,
            belumPulang: 0,
            guru: [],
          });
        }
      }
    }

    for (const item of monitoring.data) {
      const shift = item.shiftKerja || null;
      const key = String(shift?.id || getShiftKey(shift));

      if (!groups.has(key)) {
        groups.set(key, {
          key,
          nama: getShiftName(shift),
          jam: getShiftJam(shift),
          totalGuru: 0,
          sudahAbsen: 0,
          tepatWaktu: 0,
          terlambat: 0,
          belumPulang: 0,
          guru: [],
        });
      }

      const group = groups.get(key);
      const absensi = item.absensi;

      group.totalGuru += 1;

      if (absensi) {
        group.sudahAbsen += 1;

        if (isLate(item)) {
          group.terlambat += 1;
        } else {
          group.tepatWaktu += 1;
        }

        if (!absensi.waktuKeluar) group.belumPulang += 1;
      }

      group.guru.push(item);
    }

    return Array.from(groups.values()).sort((a, b) => {
      if (a.nama === "Belum ditentukan") return 1;
      if (b.nama === "Belum ditentukan") return -1;

      return a.nama.localeCompare(b.nama, "id");
    });
  }, [monitoring.data, daftarShiftMaster]);

  const filteredShift = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return rekapShift.filter((shift) => {
      const matchesShift =
        filterShift === "semua" || shift.key === filterShift;

      const matchesShiftSearch =
        !keyword ||
        shift.nama.toLowerCase().includes(keyword) ||
        shift.jam.toLowerCase().includes(keyword) ||
        shift.guru.some(
          (item) =>
            String(item.namaLengkap || "")
              .toLowerCase()
              .includes(keyword) ||
            String(item.nip || "").toLowerCase().includes(keyword)
        );

      return matchesShift && matchesShiftSearch;
    });
  }, [rekapShift, search, filterShift]);

  const filteredGuru = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return rekapShift.flatMap((shift) =>
      shift.guru
        .filter((item) => {
          const matchesSearch =
            !keyword ||
            String(item.namaLengkap || "")
              .toLowerCase()
              .includes(keyword) ||
            String(item.nip || "").toLowerCase().includes(keyword) ||
            shift.nama.toLowerCase().includes(keyword) ||
            shift.jam.toLowerCase().includes(keyword);

          const sudahAbsen = Boolean(item.absensi);
          const terlambat = isLate(item);

          let matchesStatus = true;

          if (filterStatus === "sudah") {
            matchesStatus = sudahAbsen;
          } else if (filterStatus === "hadir" || filterStatus === "tepat-waktu") {
            matchesStatus = sudahAbsen && !terlambat;
          } else if (filterStatus === "terlambat") {
            matchesStatus = terlambat;
          } else if (filterStatus === "belum-pulang") {
            matchesStatus =
              sudahAbsen && !item.absensi?.waktuKeluar;
          }

          const matchesShift =
            filterShift === "semua" || shift.key === filterShift;

          return matchesSearch && matchesStatus && matchesShift;
        })
        .map((item) => ({
          ...item,
          namaShiftRekap: shift.nama,
          jamShiftRekap: shift.jam,
        }))
    );
  }, [rekapShift, search, filterStatus, filterShift]);

  const stats = useMemo(() => {
    if (loading || error) {
      return {
        total: "—",
        sudahAbsen: "—",
        belumPulang: "—",
        terlambat: "—",
        persentaseHadir: "—",
      };
    }

    const total = filteredGuru.length;
    let sudahAbsen = 0;
    let terlambat = 0;
    let belumPulang = 0;

    for (const item of filteredGuru) {
      if (item.absensi) {
        sudahAbsen += 1;
        if (isLate(item)) terlambat += 1;
        if (!item.absensi.waktuKeluar) belumPulang += 1;
      }
    }

    const persentaseHadir =
      total > 0 ? Math.round((sudahAbsen / total) * 100) : 0;

    return {
      total,
      sudahAbsen,
      belumPulang,
      terlambat,
      persentaseHadir,
    };
  }, [filteredGuru, loading, error]);

  const totalPages = Math.max(1, Math.ceil(filteredGuru.length / limit));
  const paginatedGuru = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredGuru.slice(start, start + limit);
  }, [filteredGuru, page, limit]);

  const isToday = tanggal === getLocalDate();

  const exportCSV = () => {
    if (filteredGuru.length === 0) {
      setError("Tidak ada data yang dapat diekspor.");
      return;
    }

    setError("");

    const headers = [
      "Tanggal",
      "Nama Guru",
      "NIP",
      "Shift",
      "Jam Shift",
      "Jam Masuk",
      "Jam Pulang",
      "Terlambat (menit)",
      "Status Shift",
      "Metode",
      "Keterangan",
    ];

    const rows = filteredGuru.map((item) => [
      monitoring.tanggal,
      item.namaLengkap || "",
      item.nip || "",
      item.namaShiftRekap || "",
      item.jamShiftRekap || "",
      formatWaktu(item.absensi?.waktuMasuk),
      formatWaktu(item.absensi?.waktuKeluar),
      item.absensi?.terlambatMenit ?? "",
      formatStatus(getStatusGuru(item)),
      item.absensi?.metode || "",
      item.absensi?.keterangan || "",
    ]);

    const escapeCSV = (value) =>
      `"${String(value ?? "").replaceAll('"', '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `rekap-absensi-shift-${monitoring.tanggal}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };


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
                  Rekap Absensi Shift
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 theme-text-secondary">
                  Ringkasan kehadiran, keterlambatan, dan status pulang
                  guru berdasarkan shift kerja yang terdaftar.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={exportCSV}
                  disabled={loading || filteredGuru.length === 0}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border theme-border theme-card px-3 text-sm font-medium theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] disabled:cursor-not-allowed disabled:opacity-60 transition"
                >
                  <Download size={16} />
                  Export CSV
                </button>

                <button
                  type="button"
                  onClick={() => loadData(true)}
                  disabled={loading || refreshing}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border theme-border theme-card px-3 text-sm font-medium theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] disabled:cursor-not-allowed disabled:opacity-60 transition"
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
                  Rekap kehadiran otomatis dari sistem
                </p>
                <p className="mt-1 text-xs leading-5 theme-text-muted">
                  Data diperbarui setiap 10 detik selama halaman aktif.
                  Pilih tanggal untuk melihat rekap pada hari lain.
                </p>
              </div>
            </div>

            <section className="mb-6 theme-card rounded-xl border theme-border p-4 sm:p-5 shadow-sm">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label
                    htmlFor="tanggal-rekap"
                    className="mb-2 flex items-center gap-1.5 text-sm font-medium theme-text"
                  >
                    <CalendarRange size={15} />
                    Tanggal rekap
                  </label>
                  <input
                    id="tanggal-rekap"
                    type="date"
                    value={tanggal}
                    max={getLocalDate()}
                    onChange={(event) => setTanggal(event.target.value)}
                    className="theme-input h-10 w-full rounded-lg border px-3 text-sm outline-none transition"
                  />
                </div>

                <div>
                  <label
                    htmlFor="filter-shift"
                    className="mb-2 block text-sm font-medium theme-text"
                  >
                    Shift kerja
                  </label>
                  <select
                    id="filter-shift"
                    value={filterShift}
                    onChange={(event) => setFilterShift(event.target.value)}
                    className="theme-input h-10 w-full rounded-lg border px-3 text-sm outline-none"
                  >
                    <option value="semua">Semua shift</option>
                    {rekapShift.map((shift) => (
                      <option key={shift.key} value={shift.key}>
                        {shift.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="cari-rekap"
                    className="mb-2 block text-sm font-medium theme-text"
                  >
                    Cari guru atau shift
                  </label>
                  <div className="relative">
                    <Search
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                    />
                    <input
                      id="cari-rekap"
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Nama, NIP, atau shift..."
                      className="theme-input h-10 w-full rounded-lg border pl-10 pr-3 text-sm outline-none transition"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t theme-border pt-4">
                <div className="flex items-center gap-2 text-xs theme-text-muted">
                  <CalendarDays size={14} />
                  <span>
                    Menampilkan rekap tanggal{" "}
                    <strong className="theme-text">{formatTanggal(tanggal)}</strong>
                  </span>
                </div>

                {!isToday && (
                  <button
                    type="button"
                    onClick={() => setTanggal(getLocalDate())}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md border theme-border px-2.5 text-xs font-medium theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] transition"
                  >
                    <CalendarDays size={13} />
                    Hari ini
                  </button>
                )}
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
              </div>
            )}

            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard
                title="Total Catatan"
                value={stats.total}
                description="Catatan kehadiran sesuai filter"
                icon={Users}
                tone="blue"
              />
              <SummaryCard
                title="Sudah Absen"
                value={stats.sudahAbsen}
                description={
                  typeof stats.persentaseHadir === "number"
                    ? `${stats.persentaseHadir}% dari data kehadiran`
                    : "Kehadiran tercatat"
                }
                icon={UserCheck}
                tone="emerald"
              />
              <SummaryCard
                title="Belum Pulang"
                value={stats.belumPulang}
                description="Waktu keluar belum tercatat"
                icon={Clock3}
                tone="slate"
              />
              <SummaryCard
                title="Terlambat"
                value={stats.terlambat}
                description="Masuk setelah jam toleransi"
                icon={AlertCircle}
                tone="amber"
              />
            </div>

            <section className="mb-6 theme-card rounded-xl border theme-border p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                    <TrendingUp size={19} />
                  </div>
                  <div>
                    <h2 className="font-semibold theme-text">
                      Tingkat Kehadiran
                    </h2>
                    <p className="mt-1 text-sm theme-text-muted">
                      {loading || error
                        ? "Memeriksa catatan kehadiran..."
                        : `${stats.sudahAbsen} dari ${stats.total} guru tercatat hadir`}
                    </p>
                  </div>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold tabular-nums theme-primary-text">
                    {stats.persentaseHadir}
                  </span>
                  {typeof stats.persentaseHadir === "number" && (
                    <span className="text-lg font-semibold theme-primary-text">%</span>
                  )}
                </div>
              </div>

              <div
                className="mt-4 h-3 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]"
                role="progressbar"
                aria-valuenow={typeof stats.persentaseHadir === "number" ? stats.persentaseHadir : 0}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Persentase kehadiran guru"
              >
                <div
                  className="h-full rounded-full theme-primary transition-all duration-500"
                  style={{
                    width: `${typeof stats.persentaseHadir === "number" ? stats.persentaseHadir : 0}%`,
                  }}
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs theme-text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Sudah absen: {stats.sudahAbsen}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Belum pulang: {stats.belumPulang}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Terlambat: {stats.terlambat}
                </span>
              </div>
            </section>

            <section className="mb-6 space-y-4">
              <div>
                <h2 className="text-lg font-bold theme-text">
                  Ringkasan per Shift
                </h2>
                <p className="mt-1 text-sm theme-text-muted">
                  Rekap tanggal {formatTanggal(monitoring.tanggal)}.
                </p>
              </div>

              {loading ? (
                <div className="flex min-h-44 flex-col items-center justify-center gap-3 theme-card rounded-xl border theme-border text-center">
                  <LoaderCircle size={24} className="animate-spin theme-primary-text" />
                  <p className="text-sm font-medium theme-text">Memuat rekap shift...</p>
                  <p className="text-xs theme-text-muted">Mengambil data dari sistem</p>
                </div>
              ) : filteredShift.length === 0 ? (
                <div className="theme-card rounded-xl border theme-border p-10 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] theme-text-muted">
                    <BriefcaseBusiness size={23} />
                  </div>
                  <p className="mt-4 font-semibold theme-text">
                    Belum ada data shift
                  </p>
                  <p className="mt-1 max-w-sm mx-auto text-sm theme-text-muted">
                    Data akan ditampilkan jika guru sudah memiliki shift kerja di sistem.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {filteredShift.map((shift) => {
                    const persen =
                      shift.totalGuru > 0
                        ? Math.round(
                            (shift.sudahAbsen / shift.totalGuru) * 100
                          )
                        : 0;

                    return (
                      <article
                        key={shift.key}
                        className="theme-card rounded-xl border theme-border p-5 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                              <BriefcaseBusiness size={21} />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-bold theme-text">
                                {shift.nama}
                              </h3>
                              <p className="mt-1 text-sm theme-text-muted">
                                {shift.jam}
                              </p>
                            </div>
                          </div>
                          <span className="shrink-0 rounded-full bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] px-3 py-1 text-xs font-semibold theme-text-secondary">
                            {shift.totalGuru} guru
                          </span>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <MiniStat
                            label="Sudah absen"
                            value={shift.sudahAbsen}
                            valueClass="text-emerald-700 dark:text-emerald-300"
                          />
                          <MiniStat
                            label="Tepat waktu"
                            value={shift.tepatWaktu}
                            valueClass="text-emerald-600 dark:text-emerald-400"
                          />
                          <MiniStat
                            label="Terlambat"
                            value={shift.terlambat}
                            valueClass="text-amber-700 dark:text-amber-300"
                          />
                          <MiniStat
                            label="Belum pulang"
                            value={shift.belumPulang}
                            valueClass="text-blue-700 dark:text-blue-300"
                          />
                        </div>

                        <div className="mt-5">
                          <div className="mb-2 flex items-center justify-between text-xs">
                            <span className="theme-text-muted">
                              Kehadiran tercatat
                            </span>
                            <span className="font-semibold theme-text">
                              {persen}%
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]">
                            <div
                              className="h-full rounded-full theme-primary transition-all"
                              style={{ width: `${persen}%` }}
                            />
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="theme-card overflow-hidden rounded-xl border theme-border shadow-sm">
              <div className="border-b theme-border p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-semibold theme-text">
                      Detail Rekap Guru
                    </h2>
                    <p className="mt-1 text-sm theme-text-muted">
                      Menampilkan {filteredGuru.length > 0 ? (page - 1) * limit + 1 : 0} -{" "}
                      {Math.min(page * limit, filteredGuru.length)} dari {filteredGuru.length} guru
                      {monitoring.totalGuru !== filteredGuru.length &&
                        ` (difilter dari ${monitoring.totalGuru} total)`}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
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

                    <select
                      value={filterStatus}
                      onChange={(event) => setFilterStatus(event.target.value)}
                      aria-label="Filter status rekap"
                      className="theme-input h-10 rounded-lg border px-3 text-sm outline-none sm:w-44"
                    >
                      <option value="semua">Semua status</option>
                      <option value="sudah">Semua kehadiran</option>
                      <option value="hadir">Tepat waktu</option>
                      <option value="terlambat">Terlambat</option>
                      <option value="belum-pulang">Belum pulang</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="relative">
                {loading ? (
                  <div className="flex min-h-52 flex-col items-center justify-center px-4 text-center">
                    <LoaderCircle size={26} className="animate-spin theme-primary-text" />
                    <p className="mt-3 text-sm font-medium theme-text">Memuat detail rekap...</p>
                    <p className="mt-1 text-xs theme-text-muted">Mohon tunggu sebentar</p>
                  </div>
                ) : filteredGuru.length === 0 ? (
                  <div className="flex min-h-52 flex-col items-center justify-center px-4 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] theme-text-muted">
                      <Users size={23} />
                    </div>
                    <p className="mt-4 font-semibold theme-text">
                      Tidak ada data yang sesuai
                    </p>
                    <p className="mt-1 max-w-sm text-sm theme-text-muted">
                      Ubah kata pencarian atau filter untuk melihat data lain.
                    </p>
                    {(search || filterStatus !== "semua" || filterShift !== "semua") && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearch("");
                          setFilterStatus("semua");
                          setFilterShift("semua");
                        }}
                        className="mt-3 text-sm font-semibold theme-primary-text hover:underline"
                      >
                        Hapus filter
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[950px] text-left text-sm">
                      <thead className="bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] text-xs uppercase tracking-wide theme-text-muted border-b theme-border">
                        <tr>
                          <th className="px-5 py-4 font-semibold">Guru</th>
                          <th className="px-5 py-4 font-semibold">Shift</th>
                          <th className="px-5 py-4 font-semibold">Masuk</th>
                          <th className="px-5 py-4 font-semibold">Pulang</th>
                          <th className="px-5 py-4 font-semibold">Terlambat</th>
                          <th className="px-5 py-4 font-semibold">Metode</th>
                          <th className="px-5 py-4 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[color-mix(in_srgb,var(--color-text)_5%,transparent)]">
                        {paginatedGuru.map((item) => {
                          const status = getStatusGuru(item);
                          const lateMinutes = Number(
                            item.absensi?.terlambatMenit || 0
                          );

                          return (
                            <tr
                              key={item.id}
                              className="hover:bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] transition"
                            >
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text text-sm font-bold">
                                    {getInitials(item.namaLengkap)}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold theme-text">
                                      {item.namaLengkap || "-"}
                                    </p>
                                    <p className="mt-1 text-xs theme-text-muted">
                                      NIP: {item.nip || "-"}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                <p className="font-medium theme-text">
                                  {item.namaShiftRekap}
                                </p>
                                <p className="mt-1 text-xs theme-text-muted">
                                  {item.jamShiftRekap}
                                </p>
                              </td>
                              <td className="px-5 py-4 theme-text">
                                {formatWaktu(item.absensi?.waktuMasuk)}
                              </td>
                              <td className="px-5 py-4 theme-text">
                                {formatWaktu(item.absensi?.waktuKeluar)}
                              </td>
                              <td className="px-5 py-4">
                                {item.absensi ? (
                                  lateMinutes > 0 ? (
                                    <span className="font-semibold text-amber-700 dark:text-amber-400">
                                      {lateMinutes} menit
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
                                  {item.absensi?.metode
                                    ? formatStatus(item.absensi.metode)
                                    : "-"}
                                </span>
                              </td>
                              <td className="px-5 py-4">
                                <StatusBadge status={status} />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {!loading && !error && filteredGuru.length > 0 && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t theme-border px-5 py-3.5">
                  <p className="text-xs theme-text-muted">
                    Halaman <strong className="theme-text">{page}</strong> dari{" "}
                    <strong className="theme-text">{totalPages}</strong> ({filteredGuru.length} guru)
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

              <div className="border-t theme-border px-5 py-3 text-xs leading-5 theme-text-muted">
                Rekap mengikuti data sistem untuk tanggal terpilih.
                Status belum pulang berarti waktu keluar masih kosong.
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
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
    <div className="theme-card rounded-xl border theme-border p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium theme-text-muted">{title}</p>
          <p className="mt-3 text-2xl font-bold tracking-tight tabular-nums theme-text">
            {typeof value === "number" ? value.toLocaleString("id-ID") : value}
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

function MiniStat({ label, value, valueClass }) {
  return (
    <div className="rounded-lg border theme-border bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] p-3">
      <p className="text-xs leading-5 theme-text-muted">{label}</p>
      <p className={`mt-1 text-xl font-bold tabular-nums ${valueClass}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const value = String(status || "").toLowerCase();

  let className =
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300";
  let Icon = CheckCircle2;

  if (value === "belum_absen" || value.includes("belum")) {
    className =
      "bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] theme-text-muted";
    Icon = UserX;
  } else if (
    value.includes("terlambat") ||
    value.includes("pulang_cepat")
  ) {
    className =
      "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300";
    Icon = AlertCircle;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-semibold ${className}`}
    >
      <Icon size={14} />
      {formatStatus(status)}
    </span>
  );
}