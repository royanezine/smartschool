
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  freezePeriodePenggajian,
  getPenggajian,
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
  "theme-input h-10 w-full rounded-lg border px-3 text-sm outline-none transition";

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

function SortableHeader({
  label,
  column,
  sortBy,
  sortOrder,
  onSort,
}) {
  const active = sortBy === column;

  return (
    <th className="px-5 py-4 text-left font-semibold">
      <button
        type="button"
        onClick={() => onSort(column)}
        className={`inline-flex items-center gap-1.5 transition hover:theme-text ${
          active ? "theme-primary-text" : ""
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

  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [freezeBulan, setFreezeBulan] = useState(String(now.getMonth() + 1));
  const [freezeTahun, setFreezeTahun] = useState(String(now.getFullYear()));
  const [freezingPeriode, setFreezingPeriode] = useState(false);
  const [freezeError, setFreezeError] = useState("");

  const [sortBy, setSortBy] = useState("nama");
  const [sortOrder, setSortOrder] = useState("asc");

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
          responseMeta.total ??
            responseMeta.totalData ??
            records.length
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
          totalJamKerja: Number(
            responseSummary.totalJamKerja ?? 0
          ),
        });

        setMeta({
          total,
          totalPages,
          page: Number(responseMeta.page ?? page),
          limit: Number(responseMeta.limit ?? limit),
        });

        if (totalPages > 0 && page > totalPages) {
          setPage(totalPages);
        } else if (total === 0 && page !== 1) {
          setPage(1);
        }
      } catch (err) {
        setItems([]);
        setSummary({
          totalAnggaranGaji: 0,
          totalJamKerja: 0,
        });

        setMeta({
          total: 0,
          totalPages: 0,
          page,
          limit,
        });

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

  const sortedItems = useMemo(() => {
    const data = [...items];

    data.sort((a, b) => {
      let valA;
      let valB;

      switch (sortBy) {
        case "periode":
          valA =
            Number(a.tahun ?? 0) * 100 +
            Number(a.bulan ?? 0);
          valB =
            Number(b.tahun ?? 0) * 100 +
            Number(b.bulan ?? 0);
          break;

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

        default:
          valA = String(
            a.pengguna?.namaLengkap ?? ""
          ).toLowerCase();

          valB = String(
            b.pengguna?.namaLengkap ?? ""
          ).toLowerCase();
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;

      return 0;
    });

    return data;
  }, [items, sortBy, sortOrder]);

  function handleSort(column) {
    if (sortBy === column) {
      setSortOrder((prev) =>
        prev === "asc" ? "desc" : "asc"
      );
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  }

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

  function handleOpenFreezeModal() {
    const defaultBulan = bulan ? Number(bulan) : now.getMonth() + 1;
    const defaultTahun = tahun ? Number(tahun) : now.getFullYear();
    setFreezeBulan(String(defaultBulan));
    setFreezeTahun(String(defaultTahun));
    setFreezeError("");
    setShowFreezeModal(true);
  }

  async function handleFreezePeriodeSubmit(event) {
    event.preventDefault();
    const bulanNum = Number(freezeBulan);
    const tahunNum = Number(freezeTahun);

    if (!Number.isInteger(bulanNum) || bulanNum < 1 || bulanNum > 12) {
      setFreezeError("Bulan harus antara 1 sampai 12.");
      return;
    }

    if (!Number.isInteger(tahunNum) || tahunNum < 2000 || tahunNum > 2100) {
      setFreezeError("Tahun harus antara 2000 sampai 2100.");
      return;
    }

    setFreezingPeriode(true);
    setFreezeError("");
    setError("");
    setNotice("");

    try {
      const response = await freezePeriodePenggajian({
        bulan: bulanNum,
        tahun: tahunNum,
      });

      const payload = response?.data?.data ?? response?.data ?? response;
      const totalDibekukan = payload?.totalDibekukan;
      const monthLabel = MONTHS[bulanNum - 1] ?? `Bulan ${bulanNum}`;
      const fallbackMessage =
        totalDibekukan !== undefined
          ? `Sebanyak ${totalDibekukan} data penggajian draft periode ${monthLabel} ${tahunNum} berhasil dibekukan.`
          : `Periode penggajian ${monthLabel} ${tahunNum} berhasil dibekukan.`;

      setShowFreezeModal(false);
      setNotice(response?.message || fallbackMessage);
      await loadData(true);
    } catch (err) {
      setFreezeError(getErrorMessage(err));
    } finally {
      setFreezingPeriode(false);
    }
  }

  function handleEdit(item) {
    if (!item?.id) {
      setError("ID data penggajian tidak ditemukan.");
      return;
    }

    router.push(
      `/admin/keuangan/penggajian/${item.id}/edit`
    );
  }

  const firstItem =
    meta.total === 0 ? 0 : (page - 1) * limit + 1;

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

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto theme-page theme-text">
          <div className="w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
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
                  onClick={() =>
                    router.push(
                      "/admin/keuangan/penggajian/kalkulasi"
                    )
                  }
                  className={buttonPrimary}
                >
                  <Calculator size={17} />
                  Kalkulasi Gaji
                </button>

                <button
                  type="button"
                  onClick={handleOpenFreezeModal}
                  className={buttonSecondary}
                >
                  <LockKeyhole size={16} />
                  Bekukan Periode
                </button>
              </div>
            </div>

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
                      <option
                        key={month}
                        value={String(index + 1)}
                      >
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
                      <option
                        key={year}
                        value={String(year)}
                      >
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
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className={`${buttonPrimary} flex-1`}
                    >
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
                  <AlertCircle
                    size={28}
                    className="text-red-500"
                  />

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
                  <Wallet
                    size={28}
                    className="theme-text-muted"
                  />

                  <p className="mt-4 font-semibold theme-text">
                    Belum ada data penggajian
                  </p>

                  <p className="mt-1 max-w-md text-sm theme-text-muted">
                    Belum ada data untuk filter ini. Jalankan kalkulasi jika
                    periode yang dibutuhkan sudah siap.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/admin/keuangan/penggajian/kalkulasi"
                      )
                    }
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
                      <thead className="border-b theme-border bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] text-xs uppercase tracking-wide theme-text-muted">
                        <tr>
                          <th className="w-16 px-5 py-4 font-semibold">
                            No
                          </th>

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
                            className="transition hover:bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)]"
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
                                {MONTHS[Number(item.bulan) - 1] ??
                                  item.bulan}{" "}
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
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg theme-text-muted transition hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] hover:text-[var(--color-primary)]"
                                >
                                  <Eye size={16} />
                                </button>

                                <button
                                  type="button"
                                  title="Edit penggajian"
                                  aria-label={`Edit penggajian ${item.pengguna?.namaLengkap ?? ""}`}
                                  onClick={() => handleEdit(item)}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg theme-text-muted transition hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] hover:text-[var(--color-primary)]"
                                >
                                  <Pencil size={16} />
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
                          setPage((current) =>
                            Math.max(1, current - 1)
                          )
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

      {showFreezeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="freeze-periode-title"
        >
          <div className="theme-card w-full max-w-md rounded-2xl border theme-border p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300">
                  <LockKeyhole size={20} />
                </div>
                <div>
                  <h2
                    id="freeze-periode-title"
                    className="text-base font-bold theme-text"
                  >
                    Bekukan Periode Penggajian
                  </h2>
                  <p className="mt-0.5 text-xs theme-text-muted">
                    Seluruh data penggajian berstatus Draft pada periode dipilih
                    akan dikunci permanen menjadi Dibekukan.
                  </p>
                </div>
              </div>

              <button
                type="button"
                aria-label="Tutup dialog"
                disabled={freezingPeriode}
                onClick={() => setShowFreezeModal(false)}
                className="rounded-lg p-1.5 theme-text-muted hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFreezePeriodeSubmit} className="mt-5 space-y-4">
              {freezeError && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
                >
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{freezeError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="freeze-bulan"
                    className="mb-1.5 block text-xs font-semibold theme-text-secondary"
                  >
                    Bulan
                  </label>
                  <select
                    id="freeze-bulan"
                    value={freezeBulan}
                    onChange={(e) => setFreezeBulan(e.target.value)}
                    disabled={freezingPeriode}
                    className={inputClass}
                  >
                    {MONTHS.map((name, idx) => (
                      <option key={name} value={String(idx + 1)}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="freeze-tahun"
                    className="mb-1.5 block text-xs font-semibold theme-text-secondary"
                  >
                    Tahun
                  </label>
                  <input
                    id="freeze-tahun"
                    type="number"
                    min={2000}
                    max={2100}
                    value={freezeTahun}
                    onChange={(e) => setFreezeTahun(e.target.value)}
                    disabled={freezingPeriode}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t theme-border pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={freezingPeriode}
                  onClick={() => setShowFreezeModal(false)}
                  className={buttonSecondary}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={freezingPeriode}
                  className={buttonPrimary}
                >
                  {freezingPeriode ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <LockKeyhole size={16} />
                  )}
                  {freezingPeriode ? "Membekukan..." : "Bekukan Periode"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "blue",
}) {
  const toneClasses = {
    blue: "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text",
    emerald: "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text",
    indigo: "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text",
  };

  return (
    <div className="theme-card rounded-xl border theme-border p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium theme-text-muted">
            {title}
          </p>

          <p className="mt-3 whitespace-nowrap text-xl font-bold tracking-tight tabular-nums theme-text sm:text-2xl">
            {value}
          </p>

          <p className="mt-1 text-xs theme-text-muted">
            {description}
          </p>
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

      <p className="min-w-0 flex-1 break-words">
        {message}
      </p>

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
