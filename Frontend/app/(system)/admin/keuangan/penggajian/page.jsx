"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  getPenggajian,
  kalkulasiPenggajian,
  freezePeriodePenggajian,
} from "@/services/penggajian.service";

import {
  Wallet,
  Search,
  RefreshCw,
  Calculator,
  Users,
  Clock3,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  Eye,
  Pencil,
  Trash2,
  X,
  LockKeyhole,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "semua", label: "Semua Status" },
  { value: "draft", label: "Draft" },
  { value: "disetujui", label: "Disetujui" },
  { value: "dibekukan", label: "Dibekukan" },
  { value: "dibayar", label: "Dibayar" },
];

const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const inputClass =
  "theme-input h-10 w-full rounded-lg border px-3 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-60";

const buttonSecondary =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg border theme-border theme-card px-3 text-sm font-medium theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] disabled:cursor-not-allowed disabled:opacity-60 transition";

const buttonPrimary =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg theme-primary px-4 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 transition";

function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

function formatNumber(value, digits = 2) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: digits,
  }).format(Number(value ?? 0));
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "Terjadi kesalahan saat memproses permintaan.";
}

function getStatusStyle(status) {
  switch (String(status ?? "").toLowerCase()) {
    case "disetujui":
      return "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300";
    case "dibekukan":
      return "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300";
    case "dibayar":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300";
    default:
      return "bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] theme-text-secondary";
  }
}

function getStatusLabel(status) {
  const found = STATUS_OPTIONS.find(
    (item) => item.value === String(status ?? "").toLowerCase()
  );
  return found?.label ?? status ?? "Tidak diketahui";
}

function normalizeListResponse(response) {
  let result = response;

  for (let index = 0; index < 3; index += 1) {
    if (Array.isArray(result?.data)) return result;

    if (
      result?.data &&
      typeof result.data === "object" &&
      !Array.isArray(result.data)
    ) {
      result = result.data;
      continue;
    }
    break;
  }

  throw new Error(
    result?.message ||
      "Format respons daftar penggajian dari sistem tidak sesuai."
  );
}

function normalizeActionResponse(response) {
  if (!response || typeof response !== "object") return {};

  const payload =
    response.data &&
    typeof response.data === "object" &&
    !Array.isArray(response.data)
      ? response.data
      : response;

  return {
    ...payload,
    message: response.message ?? payload.message,
    success: response.success ?? payload.success,
  };
}

function SortableHeader({
  label,
  column,
  sortBy,
  sortOrder,
  onSort,
  align = "left",
}) {
  const active = sortBy === column;

  return (
    <th
      className={`px-5 py-4 font-semibold ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className={`inline-flex items-center gap-1.5 transition hover:theme-text ${
          active ? "theme-primary-text" : ""
        }`}
        title={`Urutkan ${label} ${
          active && sortOrder === "asc" ? "DESC" : "ASC"
        }`}
      >
        {label}
        {active ? (
          sortOrder === "asc" ? (
            <ArrowUp size={13} />
          ) : (
            <ArrowDown size={13} />
          )
        ) : (
          <ArrowUpDown size={13} className="opacity-40" />
        )}
      </button>
    </th>
  );
}

export default function PenggajianPage() {
  const router = useRouter();
  const now = new Date();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({
    totalAnggaranGaji: 0,
    totalJamKerja: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [bulan, setBulan] = useState(String(now.getMonth() + 1));
  const [tahun, setTahun] = useState(String(now.getFullYear()));
  const [status, setStatus] = useState("semua");

  const [page, setPage] = useState(1);
  const limit = 10;

  const [meta, setMeta] = useState({
    total: 0,
    totalPages: 0,
    page: 1,
    limit: 10,
  });

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [showCalculation, setShowCalculation] = useState(false);
  const [calcMonth, setCalcMonth] = useState(String(now.getMonth() + 1));
  const [calcYear, setCalcYear] = useState(String(now.getFullYear()));
  const [calcEmployeeId, setCalcEmployeeId] = useState("");
  const [calculating, setCalculating] = useState(false);
  const [calcResult, setCalcResult] = useState(null);

  const [showFreeze, setShowFreeze] = useState(false);
  const [freezeMonth, setFreezeMonth] = useState(String(now.getMonth() + 1));
  const [freezeYear, setFreezeYear] = useState(String(now.getFullYear()));
  const [freezing, setFreezing] = useState(false);

  /* ============================================================
     SORTING STATE
  ============================================================ */
  const [sortBy, setSortBy] = useState("nama");
  const [sortOrder, setSortOrder] = useState("asc");

  function handleSort(column) {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  }

  const loadData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      try {
        const params = {
          page,
          limit,
          ...(bulan ? { bulan: Number(bulan) } : {}),
          ...(tahun ? { tahun: Number(tahun) } : {}),
          ...(status !== "semua" ? { status } : {}),
          ...(search.trim() ? { search: search.trim() } : {}),
        };

        const response = await getPenggajian(params);
        const result = normalizeListResponse(response);

        const records = result.data;
        const responseMeta = result.meta ?? {};
        const responseSummary = result.summary ?? {};

        const total = Number(
          responseMeta.total ?? responseMeta.totalData ?? records.length
        );
        const totalPages = Number(
          responseMeta.totalPages ??
            (total > 0 ? Math.ceil(total / limit) : 0)
        );

        setItems(records);
        setSummary({
          totalAnggaranGaji: Number(
            responseSummary.totalAnggaranGaji ?? 0
          ),
          totalJamKerja: Number(responseSummary.totalJamKerja ?? 0),
        });
        setMeta({
          total,
          totalPages,
          page: Number(responseMeta.page ?? page),
          limit: Number(responseMeta.limit ?? limit),
        });

        if (totalPages > 0 && page > totalPages) setPage(totalPages);
        else if (total === 0 && page !== 1) setPage(1);
      } catch (err) {
        setItems([]);
        setSummary({ totalAnggaranGaji: 0, totalJamKerja: 0 });
        setMeta({ total: 0, totalPages: 0, page, limit });
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, limit, bulan, tahun, status, search]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ============================================================
     SORTED DATA
  ============================================================ */
  const sortedItems = useMemo(() => {
    const data = [...items];

    data.sort((a, b) => {
      let valA;
      let valB;

      switch (sortBy) {
        case "periode": {
          const bulanA = Number(a.bulan ?? 0);
          const bulanB = Number(b.bulan ?? 0);
          const tahunA = Number(a.tahun ?? 0);
          const tahunB = Number(b.tahun ?? 0);
          valA = tahunA * 100 + bulanA;
          valB = tahunB * 100 + bulanB;
          break;
        }
        case "hariKerja":
          valA = Number(a.totalHariKerja ?? 0);
          valB = Number(b.totalHariKerja ?? 0);
          break;
        case "jamKerja":
          valA = Number(a.totalJamKerja ?? 0);
          valB = Number(b.totalJamKerja ?? 0);
          break;
        case "tarif":
          valA = Number(a.tarifPerJam ?? 0);
          valB = Number(b.tarifPerJam ?? 0);
          break;
        case "totalGaji":
          valA = Number(a.totalGaji ?? 0);
          valB = Number(b.totalGaji ?? 0);
          break;
        case "status":
          valA = String(a.status ?? "").toLowerCase();
          valB = String(b.status ?? "").toLowerCase();
          break;
        case "nama":
        default:
          valA = String(a.pengguna?.namaLengkap ?? "").toLowerCase();
          valB = String(b.pengguna?.namaLengkap ?? "").toLowerCase();
          break;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [items, sortBy, sortOrder]);

  function handleSearch(event) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function resetFilters() {
    setSearchInput("");
    setSearch("");
    setBulan("");
    setTahun("");
    setStatus("semua");
    setPage(1);
  }

  async function reloadFirstPage() {
    const response = await getPenggajian({
      page: 1,
      limit,
      ...(bulan ? { bulan: Number(bulan) } : {}),
      ...(tahun ? { tahun: Number(tahun) } : {}),
      ...(status !== "semua" ? { status } : {}),
      ...(search.trim() ? { search: search.trim() } : {}),
    });

    const result = normalizeListResponse(response);
    const records = result.data;
    const responseMeta = result.meta ?? {};
    const responseSummary = result.summary ?? {};
    const total = Number(
      responseMeta.total ?? responseMeta.totalData ?? records.length
    );

    setItems(records);
    setSummary({
      totalAnggaranGaji: Number(responseSummary.totalAnggaranGaji ?? 0),
      totalJamKerja: Number(responseSummary.totalJamKerja ?? 0),
    });
    setMeta({
      total,
      totalPages: Number(
        responseMeta.totalPages ?? (total > 0 ? Math.ceil(total / limit) : 0)
      ),
      page: Number(responseMeta.page ?? 1),
      limit: Number(responseMeta.limit ?? limit),
    });
  }

  async function handleCalculate(event) {
    event.preventDefault();
    if (calculating) return;

    const monthNumber = Number(calcMonth);
    const yearNumber = Number(calcYear);

    if (
      !Number.isInteger(monthNumber) ||
      monthNumber < 1 ||
      monthNumber > 12 ||
      !Number.isInteger(yearNumber) ||
      yearNumber < 2000 ||
      yearNumber > 2100
    ) {
      setError("Bulan atau tahun kalkulasi tidak valid.");
      return;
    }

    setCalculating(true);
    setError("");
    setNotice("");
    setCalcResult(null);

    try {
      const payload = {
        bulan: monthNumber,
        tahun: yearNumber,
        ...(calcEmployeeId.trim()
          ? { penggunaId: calcEmployeeId.trim() }
          : {}),
      };

      const response = await kalkulasiPenggajian(payload);
      const result = normalizeActionResponse(response);

      setCalcResult(result);
      setNotice(
        result.message || "Permintaan kalkulasi penggajian berhasil."
      );
      setShowCalculation(false);
      setPage(1);
      await reloadFirstPage();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCalculating(false);
    }
  }

  async function handleFreezePeriod(event) {
    event.preventDefault();
    if (freezing) return;

    const monthNumber = Number(freezeMonth);
    const yearNumber = Number(freezeYear);

    if (
      !Number.isInteger(monthNumber) ||
      monthNumber < 1 ||
      monthNumber > 12 ||
      !Number.isInteger(yearNumber) ||
      yearNumber < 2000 ||
      yearNumber > 2100
    ) {
      setError("Bulan atau tahun pembekuan tidak valid.");
      return;
    }

    const confirmed = window.confirm(
      `Bekukan seluruh penggajian berstatus draft untuk periode ${MONTHS[monthNumber - 1]} ${yearNumber}?`
    );

    if (!confirmed) return;

    setFreezing(true);
    setError("");
    setNotice("");

    try {
      const response = await freezePeriodePenggajian({
        bulan: monthNumber,
        tahun: yearNumber,
      });

      const result = normalizeActionResponse(response);
      const totalDibekukan = Number(
        result.totalDibekukan ?? result.data?.totalDibekukan ?? 0
      );

      setNotice(
        result.message ||
          (totalDibekukan > 0
            ? `${totalDibekukan} data penggajian berhasil dibekukan.`
            : "Permintaan pembekuan periode berhasil diproses.")
      );

      setShowFreeze(false);
      setPage(1);
      await reloadFirstPage();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setFreezing(false);
    }
  }

  function handleEdit(item) {
    if (!item?.id) {
      setError("ID data penggajian tidak ditemukan.");
      return;
    }
    router.push(`/admin/keuangan/penggajian/${item.id}/edit`);
  }

  function handleDelete(item) {
    const namaPegawai = item.pengguna?.namaLengkap ?? "pegawai ini";

    const confirmed = window.confirm(
      `Kamu memilih data penggajian ${namaPegawai} untuk dihapus. Lanjutkan?`
    );

    if (!confirmed) return;

    setNotice(
      "Penghapusan belum dilakukan karena sistem belum menyediakan fitur hapus penggajian. Data tetap aman dan tidak berubah."
    );
  }

  const firstItem = meta.total === 0 ? 0 : (page - 1) * limit + 1;
  const lastItem = Math.min(page * limit, meta.total);

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
            {/* ============================================
                PAGE HEADER
            ============================================ */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
               
                <h1 className="text-2xl font-bold tracking-tight theme-text sm:text-3xl">
                  Penggajian Pegawai
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 theme-text-secondary">
                  Kelola hasil kalkulasi gaji berdasarkan jam kerja dan tarif
                  yang tercatat di sistem.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => loadData(true)}
                  disabled={refreshing || loading}
                  className={buttonSecondary}
                >
                  <RefreshCw
                    size={16}
                    className={refreshing ? "animate-spin" : ""}
                  />
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCalcResult(null);
                    setShowCalculation(true);
                  }}
                  className={buttonPrimary}
                >
                  <Calculator size={17} />
                  Kalkulasi Gaji
                </button>

                <button
                  type="button"
                  onClick={() => setShowFreeze(true)}
                  className={buttonSecondary}
                >
                  <LockKeyhole size={16} />
                  Bekukan Periode
                </button>
              </div>
            </div>

            {/* ALERT */}
            {error && (
              <AlertBox
                type="error"
                message={error}
                onClose={() => setError("")}
              />
            )}

            {notice && (
              <AlertBox
                type="success"
                message={notice}
                onClose={() => setNotice("")}
              />
            )}

            {/* CALC RESULT */}
            {calcResult && (
              <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/60 dark:bg-blue-950/30">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-blue-900 dark:text-blue-200">
                      Hasil kalkulasi penggajian
                    </h2>
                    <p className="mt-1 text-sm text-blue-800 dark:text-blue-300">
                      Berhasil diproses: {calcResult.totalDiproses ?? 0} data.
                      Dilewati: {calcResult.totalDilewati ?? 0} data.
                    </p>
                  </div>

                  <button
                    type="button"
                    aria-label="Tutup hasil kalkulasi"
                    onClick={() => setCalcResult(null)}
                    className="rounded p-1 text-blue-700 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-900/40"
                  >
                    <X size={17} />
                  </button>
                </div>

                {Array.isArray(calcResult.dilewati) &&
                  calcResult.dilewati.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {calcResult.dilewati.map((item, index) => (
                        <div
                          key={`${item.nama ?? "pegawai"}-${index}`}
                          className="theme-card rounded-lg border theme-border p-3 text-sm"
                        >
                          <p className="font-medium theme-text">
                            {item.nama ?? "Pegawai"}
                          </p>
                          <p className="mt-1 theme-text-secondary">
                            {item.alasan ?? "Tidak ada keterangan."}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            )}

            {/* SUMMARY */}
            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <SummaryCard
                title="Total Data Penggajian"
                value={meta.total.toLocaleString("id-ID")}
                description="Sesuai filter yang diterapkan"
                icon={Users}
                tone="blue"
              />
              <SummaryCard
                title="Total Anggaran Gaji"
                value={formatCurrency(summary.totalAnggaranGaji)}
                description="Akumulasi anggaran gaji dalam sistem"
                icon={Wallet}
                tone="emerald"
              />
              <SummaryCard
                title="Total Jam Kerja"
                value={`${formatNumber(summary.totalJamKerja)} jam`}
                description="Akumulasi jam kerja dalam sistem"
                icon={Clock3}
                tone="indigo"
              />
            </div>

            {/* TABLE */}
            <section className="theme-card overflow-hidden rounded-xl border theme-border shadow-sm">
              <div className="border-b theme-border p-4 sm:p-5">
                <div className="mb-4">
                  <h2 className="font-semibold theme-text">
                    Daftar Penggajian
                  </h2>
                  <p className="mt-1 text-sm theme-text-muted">
                    Cari pegawai dan saring data berdasarkan periode atau
                    status penggajian.
                  </p>
                </div>

                <form
                  onSubmit={handleSearch}
                  className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6"
                >
                  <div className="relative min-w-0 lg:col-span-2">
                    <Search
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                    />
                    <input
                      type="search"
                      value={searchInput}
                      onChange={(event) =>
                        setSearchInput(event.target.value)
                      }
                      placeholder="Cari nama pegawai..."
                      className={`${inputClass} pl-10`}
                    />
                  </div>

                  <select
                    aria-label="Filter bulan"
                    value={bulan}
                    onChange={(event) => {
                      setBulan(event.target.value);
                      setPage(1);
                    }}
                    className={inputClass}
                  >
                    <option value="">Semua Bulan</option>
                    {MONTHS.map((month, index) => (
                      <option key={month} value={String(index + 1)}>
                        {month}
                      </option>
                    ))}
                  </select>

                  <select
                    aria-label="Filter tahun"
                    value={tahun}
                    onChange={(event) => {
                      setTahun(event.target.value);
                      setPage(1);
                    }}
                    className={inputClass}
                  >
                    <option value="">Semua Tahun</option>
                    {Array.from(
                      { length: 7 },
                      (_, index) => now.getFullYear() - 5 + index
                    ).map((year) => (
                      <option key={year} value={String(year)}>
                        {year}
                      </option>
                    ))}
                  </select>

                  <select
                    aria-label="Filter status"
                    value={status}
                    onChange={(event) => {
                      setStatus(event.target.value);
                      setPage(1);
                    }}
                    className={inputClass}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <div className="flex gap-2">
                    <button type="submit" className={`${buttonPrimary} flex-1`}>
                      <Search size={16} />
                      Cari
                    </button>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className={buttonSecondary}
                    >
                      Reset
                    </button>
                  </div>
                </form>
              </div>

              {loading ? (
                <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
                  <LoaderCircle
                    size={28}
                    className="animate-spin theme-primary-text"
                  />
                  <p className="mt-3 text-sm font-medium theme-text">
                    Memuat data penggajian...
                  </p>
                  <p className="mt-1 text-xs theme-text-muted">
                    Mengambil data dari sistem
                  </p>
                </div>
              ) : error && items.length === 0 ? (
                <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                    <AlertCircle size={23} />
                  </div>
                  <p className="mt-4 font-semibold theme-text">
                    Data penggajian gagal dimuat
                  </p>
                  <p className="mt-1 max-w-md text-sm theme-text-muted">
                    Periksa koneksi sistem dan hak akses akun, kemudian coba
                    muat ulang.
                  </p>
                  <button
                    type="button"
                    onClick={() => loadData(true)}
                    className={`${buttonPrimary} mt-4`}
                  >
                    <RefreshCw size={15} />
                    Coba Lagi
                  </button>
                </div>
              ) : items.length === 0 ? (
                <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] theme-text-muted">
                    <Wallet size={23} />
                  </div>
                  <p className="mt-4 font-semibold theme-text">
                    Belum ada data penggajian
                  </p>
                  <p className="mt-1 max-w-md text-sm theme-text-muted">
                    Belum ada data untuk filter ini. Jalankan kalkulasi jika
                    periode yang dibutuhkan sudah siap.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowCalculation(true)}
                    className={`${buttonPrimary} mt-4`}
                  >
                    <Calculator size={15} />
                    Kalkulasi Penggajian
                  </button>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1150px] text-left text-sm">
                      <thead className="bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] text-xs uppercase tracking-wide theme-text-muted border-b theme-border">
                        <tr>
                          <th className="px-5 py-4 font-semibold w-16">No</th>
                          <SortableHeader
                            label="Pegawai"
                            column="nama"
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                            onSort={handleSort}
                          />
                          <SortableHeader
                            label="Periode"
                            column="periode"
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                            onSort={handleSort}
                          />
                          <SortableHeader
                            label="Hari Kerja"
                            column="hariKerja"
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                            onSort={handleSort}
                          />
                          <SortableHeader
                            label="Jam Kerja"
                            column="jamKerja"
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                            onSort={handleSort}
                          />
                          <SortableHeader
                            label="Tarif / Jam"
                            column="tarif"
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                            onSort={handleSort}
                          />
                          <SortableHeader
                            label="Total Gaji"
                            column="totalGaji"
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                            onSort={handleSort}
                          />
                          <SortableHeader
                            label="Status"
                            column="status"
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                            onSort={handleSort}
                          />
                          <th className="px-5 py-4 text-right font-semibold">
                            Aksi
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-[color-mix(in_srgb,var(--color-text)_5%,transparent)]">
                        {sortedItems.map((item, index) => (
                          <tr
                            key={item.id}
                            className="hover:bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] transition"
                          >
                            <td className="px-5 py-4">
                              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] text-xs font-semibold theme-text-secondary">
                                {(page - 1) * limit + index + 1}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                                  <Users size={18} />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold theme-text">
                                    {item.pengguna?.namaLengkap ?? "-"}
                                  </p>
                                  <p className="mt-1 text-xs theme-text-muted">
                                    {item.pengguna?.nip ||
                                      item.pengguna?.email ||
                                      "-"}
                                  </p>
                                  <p className="mt-1 text-xs theme-text-muted">
                                    {item.pengguna?.kategoriJabatan?.nama ??
                                      "-"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <p className="font-medium theme-text">
                                {MONTHS[Number(item.bulan) - 1] ?? item.bulan}{" "}
                                {item.tahun}
                              </p>
                              <p className="mt-1 text-xs theme-text-muted">
                                {formatDate(item.tanggalMulai)} –{" "}
                                {formatDate(item.tanggalSelesai)}
                              </p>
                            </td>

                            <td className="px-5 py-4 tabular-nums theme-text-secondary">
                              {formatNumber(item.totalHariKerja, 0)} hari
                            </td>

                            <td className="px-5 py-4 tabular-nums theme-text-secondary">
                              {formatNumber(item.totalJamKerja)} jam
                            </td>

                            <td className="px-5 py-4 tabular-nums theme-text-secondary">
                              {formatCurrency(item.tarifPerJam)}
                            </td>

                            <td className="px-5 py-4">
                              <p className="font-semibold tabular-nums theme-text">
                                {formatCurrency(item.totalGaji)}
                              </p>
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                                  item.status
                                )}`}
                              >
                                {getStatusLabel(item.status)}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex justify-end gap-1">
                                <button
                                  type="button"
                                  title="Detail penggajian"
                                  aria-label={`Detail penggajian ${item.pengguna?.namaLengkap ?? ""}`}
                                  onClick={() =>
                                    router.push(
                                      `/admin/keuangan/penggajian/${item.id}`
                                    )
                                  }
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg theme-text-muted transition hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
                                >
                                  <Eye size={16} />
                                </button>

                                <button
                                  type="button"
                                  title="Edit penggajian"
                                  aria-label={`Edit penggajian ${item.pengguna?.namaLengkap ?? ""}`}
                                  onClick={() => handleEdit(item)}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg theme-text-muted transition hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/40 dark:hover:text-amber-300"
                                >
                                  <Pencil size={16} />
                                </button>

                                <button
                                  type="button"
                                  title="Hapus penggajian"
                                  aria-label={`Hapus penggajian ${item.pengguna?.namaLengkap ?? ""}`}
                                  onClick={() => handleDelete(item)}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg theme-text-muted transition hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-300"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col gap-3 border-t theme-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm theme-text-muted">
                      Menampilkan{" "}
                      <span className="font-semibold theme-text">
                        {firstItem}–{lastItem}
                      </span>{" "}
                      dari{" "}
                      <span className="font-semibold theme-text">
                        {meta.total}
                      </span>{" "}
                      data penggajian
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={page <= 1 || loading}
                        onClick={() =>
                          setPage((current) => Math.max(1, current - 1))
                        }
                        className={buttonSecondary}
                      >
                        <ChevronLeft size={16} />
                        Sebelumnya
                      </button>

                      <span className="min-w-20 text-center text-sm theme-text">
                        {page} / {Math.max(meta.totalPages, 1)}
                      </span>

                      <button
                        type="button"
                        disabled={
                          page >= meta.totalPages ||
                          loading ||
                          meta.totalPages === 0
                        }
                        onClick={() =>
                          setPage((current) =>
                            Math.min(meta.totalPages, current + 1)
                          )
                        }
                        className={buttonSecondary}
                      >
                        Berikutnya
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </section>

            <p className="mt-5 text-xs leading-5 theme-text-muted">
              Data penggajian dan ringkasan mengikuti data yang tercatat dalam
              sistem.
            </p>
          </div>
        </main>
      </div>

      {/* MODAL KALKULASI */}
      {showCalculation && (
        <Modal
          title="Kalkulasi Penggajian"
          description="Sistem menghitung gaji berdasarkan absensi valid dan tarif per jam yang berlaku."
          onClose={() => !calculating && setShowCalculation(false)}
        >
          <form onSubmit={handleCalculate} className="space-y-4">
            <FormField label="Bulan">
              <select
                required
                value={calcMonth}
                onChange={(event) => setCalcMonth(event.target.value)}
                className={inputClass}
              >
                {MONTHS.map((month, index) => (
                  <option key={month} value={String(index + 1)}>
                    {month}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Tahun">
              <input
                type="number"
                required
                min="2000"
                max="2100"
                value={calcYear}
                onChange={(event) => setCalcYear(event.target.value)}
                className={inputClass}
              />
            </FormField>

            <FormField label="ID Pengguna (opsional)">
              <input
                type="text"
                value={calcEmployeeId}
                onChange={(event) => setCalcEmployeeId(event.target.value)}
                placeholder="Kosongkan untuk semua pegawai"
                className={inputClass}
              />
              <p className="mt-1 text-xs theme-text-muted">
                Jika diisi, masukkan ID pengguna sesuai data sistem.
              </p>
            </FormField>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
              Data berstatus dibekukan atau disetujui akan dilewati oleh sistem
              saat kalkulasi.
            </div>

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={calculating}
                onClick={() => setShowCalculation(false)}
                className={buttonSecondary}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={calculating}
                className={buttonPrimary}
              >
                {calculating ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <Calculator size={16} />
                )}
                {calculating ? "Menghitung..." : "Mulai Kalkulasi"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL FREEZE */}
      {showFreeze && (
        <Modal
          title="Bekukan Periode Penggajian"
          description="Semua data berstatus draft pada periode yang dipilih akan dibekukan."
          onClose={() => !freezing && setShowFreeze(false)}
        >
          <form onSubmit={handleFreezePeriod} className="space-y-4">
            <FormField label="Bulan">
              <select
                required
                value={freezeMonth}
                onChange={(event) => setFreezeMonth(event.target.value)}
                className={inputClass}
              >
                {MONTHS.map((month, index) => (
                  <option key={month} value={String(index + 1)}>
                    {month}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Tahun">
              <input
                type="number"
                required
                min="2000"
                max="2100"
                value={freezeYear}
                onChange={(event) => setFreezeYear(event.target.value)}
                className={inputClass}
              />
            </FormField>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
              Tindakan ini mengunci data draft pada periode tersebut. Pastikan
              hasil kalkulasi sudah benar sebelum melanjutkan.
            </div>

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={freezing}
                onClick={() => setShowFreeze(false)}
                className={buttonSecondary}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={freezing}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 text-sm font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60 transition"
              >
                {freezing ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <LockKeyhole size={16} />
                )}
                {freezing ? "Memproses..." : "Bekukan Periode"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({ title, value, description, icon: Icon, tone = "blue" }) {
  const toneClasses = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
    emerald:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
    indigo:
      "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
    slate:
      "bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] theme-text-muted",
  };

  return (
    <div className="theme-card rounded-xl border theme-border p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium theme-text-muted">{title}</p>
          <p className="mt-3 break-words text-xl font-bold tracking-tight tabular-nums theme-text sm:text-2xl">
            {value}
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

/* =========================================================
   ALERT BOX
========================================================= */

function AlertBox({ type, message, onClose }) {
  const success = type === "success";
  const Icon = success ? CheckCircle2 : AlertCircle;

  return (
    <div
      role={success ? "status" : "alert"}
      className={`mb-5 flex items-start gap-3 rounded-lg border p-4 text-sm ${
        success
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
          : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
      }`}
    >
      <Icon size={19} className="mt-0.5 shrink-0" />
      <p className="min-w-0 flex-1 break-words">{message}</p>
      <button
        type="button"
        aria-label="Tutup notifikasi"
        onClick={onClose}
        className="rounded p-1 hover:bg-black/5 dark:hover:bg-white/5"
      >
        <X size={16} />
      </button>
    </div>
  );
}

/* =========================================================
   FORM FIELD
========================================================= */

function FormField({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium theme-text">
        {label}
      </label>
      {children}
    </div>
  );
}

/* =========================================================
   MODAL
========================================================= */

function Modal({ title, description, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="theme-card my-auto w-full max-w-lg rounded-xl border theme-border p-5 shadow-xl sm:p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold theme-text">{title}</h2>
            <p className="mt-1 text-sm leading-6 theme-text-muted">
              {description}
            </p>
          </div>

          <button
            type="button"
            aria-label="Tutup dialog"
            onClick={onClose}
            className="rounded-lg p-1.5 theme-text-muted hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] transition"
          >
            <X size={18} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}