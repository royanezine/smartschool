"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Wallet,
  Filter,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  FileText,
  RefreshCw,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Receipt,
  CircleDollarSign,
  SlidersHorizontal,
  X,
  Loader2,
  AlertCircle,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Scale,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  getJurnalKas,
  getAkunKas,
  batalkanJurnalKas,
} from "@/services/jurnalKas.service";

const LIMIT = 10;

const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatJenis = (jenis) =>
  jenis === "masuk" ? "Pemasukan" : "Pengeluaran";

const formatStatus = (status) =>
  status === "aktif" ? "Aktif" : "Dibatalkan";

const formatKategori = (kategori) =>
  String(kategori || "-")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export default function JurnalKasPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [search, setSearch] = useState("");
  const [jenisFilter, setJenisFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [akunFilter, setAkunFilter] = useState("");
  const [tanggalDari, setTanggalDari] = useState("");
  const [tanggalSampai, setTanggalSampai] = useState("");

  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const [data, setData] = useState([]);
  const [akunKas, setAkunKas] = useState([]);
  const [ringkasan, setRingkasan] = useState({
    totalMasuk: 0,
    totalKeluar: 0,
    selisih: 0,
  });

  const [meta, setMeta] = useState({
    page: 1,
    limit: LIMIT,
    total: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedJurnal, setSelectedJurnal] = useState(null);
  const [alasan, setAlasan] = useState("");

  const loadAkunKas = useCallback(async () => {
    try {
      const response = await getAkunKas();
      setAkunKas(
        (response.data || []).filter(
          (akun) => akun.status === "aktif"
        )
      );
    } catch (err) {
      console.error("Gagal mengambil akun kas:", err);
    }
  }, []);

  const loadJurnal = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getJurnalKas({
        page,
        limit: LIMIT,
        q: search.trim(),
        jenis: jenisFilter,
        status: statusFilter,
        akunKasId: akunFilter,
        dari: tanggalDari,
        sampai: tanggalSampai,
      });

      setData(response.data || []);
      setRingkasan(
        response.ringkasan || {
          totalMasuk: 0,
          totalKeluar: 0,
          selisih: 0,
        }
      );

      setMeta(
        response.meta || {
          page,
          limit: LIMIT,
          total: 0,
          totalPages: 1,
        }
      );
    } catch (err) {
      console.error("Gagal mengambil jurnal kas:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat jurnal kas."
      );
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    search,
    jenisFilter,
    statusFilter,
    akunFilter,
    tanggalDari,
    tanggalSampai,
    refreshKey,
  ]);

  useEffect(() => {
    loadAkunKas();
  }, [loadAkunKas, refreshKey]);

  useEffect(() => {
    loadJurnal();
  }, [loadJurnal]);

  const totalMasuk = Number(ringkasan.totalMasuk || 0);
  const totalKeluar = Number(ringkasan.totalKeluar || 0);
  const selisih = Number(ringkasan.selisih || 0);

  const totalSaldoAkun = useMemo(
    () =>
      akunKas.reduce(
        (total, akun) => total + Number(akun.saldo || 0),
        0
      ),
    [akunKas]
  );

  const totalPemasukan = data.filter(
    (item) => item.jenis === "masuk"
  ).length;

  const totalPengeluaran = data.filter(
    (item) => item.jenis === "keluar"
  ).length;

  const resetFilter = () => {
    setSearch("");
    setJenisFilter("");
    setStatusFilter("");
    setAkunFilter("");
    setTanggalDari("");
    setTanggalSampai("");
    setPage(1);
  };

  const handleExport = () => {
    const headers = [
      "Nomor Jurnal",
      "Tanggal",
      "Akun Kas",
      "Keterangan",
      "Kategori",
      "Jenis",
      "Debit",
      "Kredit",
      "Jumlah",
      "Status",
    ];

    const rows = data.map((item) => [
      item.nomorJurnal,
      item.tanggal,
      item.akunKas
        ? `${item.akunKas.kode} - ${item.akunKas.nama}`
        : "",
      item.keterangan || "",
      item.kategori,
      formatJenis(item.jenis),
      item.jenis === "keluar" ? item.jumlah : 0,
      item.jenis === "masuk" ? item.jumlah : 0,
      item.jumlah,
      formatStatus(item.status),
    ]);

    const escapeCsv = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "jurnal-kas-smartschool.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  const openCancelModal = (item) => {
    setSelectedJurnal(item);
    setAlasan("");
  };

  const handleCancel = async () => {
    if (!selectedJurnal || !alasan.trim()) {
      setError("Alasan pembatalan wajib diisi.");
      return;
    }

    setActionLoading(true);
    setError("");

    try {
      await batalkanJurnalKas(
        selectedJurnal.id,
        alasan.trim()
      );

      setSelectedJurnal(null);
      setAlasan("");
      setRefreshKey((value) => value + 1);
    } catch (err) {
      console.error("Gagal membatalkan jurnal:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Gagal membatalkan jurnal."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const canCancel = (item) =>
    item.status === "aktif" &&
    item.sumber === "manual";

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="jurnalKas"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={() =>
            setIsCollapsed((previous) => !previous)
          }
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="theme-page min-h-0 flex-1 overflow-y-auto">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <div className="w-full space-y-6">


              <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] text-[var(--color-primary)]">
                      <Wallet size={23} />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">
                        KEUANGAN SEKOLAH
                      </p>

                      <h1 className="theme-text mt-0.5 text-[25px] font-bold tracking-tight sm:text-[29px]">
                        Jurnal & Kas
                      </h1>
                    </div>
                  </div>

                  <p className="theme-text-muted mt-3 max-w-2xl text-sm leading-6">
                    Pantau pemasukan, pengeluaran, dan riwayat
                    transaksi kas sekolah yang tersimpan di sistem.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                

                  <button
                    onClick={handleExport}
                    disabled={data.length === 0}
                    className="theme-input inline-flex h-10 items-center gap-2 rounded-lg px-3.5 text-sm font-semibold disabled:opacity-50"
                  >
                    <Download size={16} />
                    Ekspor
                  </button>

                  <button
                    onClick={() => setRefreshKey((v) => v + 1)}
                    disabled={loading}
                    className="theme-input inline-flex h-10 items-center gap-2 rounded-lg px-3.5 text-sm font-semibold disabled:opacity-50"
                  >
                    <RefreshCw
                      size={16}
                      className={loading ? "animate-spin" : ""}
                    />
                    Muat Ulang
                  </button>

                  <Link
                    href="/admin/keuangan/jurnalKas/tambah"
                    className="theme-primary inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold"
                  >
                    <Plus size={17} />
                    Tambah Transaksi
                  </Link>
                </div>
              </section>


              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_6%,transparent)] p-4 text-sm">
                  <AlertCircle
                    size={19}
                    className="mt-0.5 shrink-0 text-[var(--color-danger)]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="theme-text font-semibold">Terjadi masalah</p>
                    <p className="theme-text-secondary mt-1 break-words">
                      {error}
                    </p>
                  </div>
                  <button
                    onClick={() => setError("")}
                    aria-label="Tutup pesan"
                    className="theme-text-muted transition hover:text-[var(--color-danger)]"
                  >
                    <X size={17} />
                  </button>
                </div>
              )}


              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <FinanceCard
                  label="Total Pemasukan"
                  value={formatCurrency(totalMasuk)}
                  description={`${totalPemasukan} transaksi masuk di halaman ini`}
                  icon={<TrendingUp size={19} />}
                  tone="success"
                />

                <FinanceCard
                  label="Total Pengeluaran"
                  value={formatCurrency(totalKeluar)}
                  description={`${totalPengeluaran} transaksi keluar di halaman ini`}
                  icon={<TrendingDown size={19} />}
                  tone="danger"
                />

                <FinanceCard
                  label="Selisih Jurnal"
                  value={formatCurrency(selisih)}
                  description="Masuk dikurangi keluar"
                  icon={<Scale size={19} />}
                  tone="primary"
                />

                <FinanceCard
                  label="Saldo Seluruh Akun"
                  value={formatCurrency(totalSaldoAkun)}
                  description={`${akunKas.length} akun kas/bank aktif`}
                  icon={<Wallet size={19} />}
                  tone="info"
                />
              </section>


              <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="theme-card overflow-hidden rounded-2xl border shadow-sm lg:col-span-2">
                  <div className="theme-border flex items-center justify-between border-b px-5 py-4">
                    <div>
                      <h2 className="theme-text text-sm font-bold">
                        Ringkasan Kas
                      </h2>
                      <p className="theme-text-muted mt-1 text-xs">
                        Berdasarkan seluruh jurnal yang aktif
                      </p>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[color-mix(in_srgb,var(--color-primary)_18%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] text-[var(--color-primary)]">
                      <CircleDollarSign size={18} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 divide-x divide-[color-mix(in_srgb,var(--color-text)_8%,transparent)]">
                    <div className="px-5 py-5">
                      <p className="theme-text-muted text-xs font-medium">
                        Kas Masuk
                      </p>
                      <p className="mt-2 text-lg font-bold text-[var(--color-success)]">
                        {formatCurrency(totalMasuk)}
                      </p>
                    </div>

                    <div className="px-5 py-5">
                      <p className="theme-text-muted text-xs font-medium">
                        Kas Keluar
                      </p>
                      <p className="mt-2 text-lg font-bold text-[var(--color-danger)]">
                        {formatCurrency(totalKeluar)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="theme-card-soft theme-border rounded-2xl border p-5 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                    SELISIH JURNAL
                  </p>

                  <h3 className="theme-text mt-2 text-xl font-bold">
                    {formatCurrency(selisih)}
                  </h3>

                  <div className="theme-border mt-6 flex items-center justify-between border-t pt-4">
                    <p className="theme-text-muted text-xs">
                      Masuk dikurangi keluar
                    </p>
                    <ArrowRight
                      size={17}
                      className="text-[var(--color-primary)]"
                    />
                  </div>
                </div>
              </section>


              <section className="theme-card overflow-hidden rounded-2xl border shadow-sm">
                <div className="theme-border border-b px-5 py-4">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal
                      size={16}
                      className="text-[var(--color-primary)]"
                    />
                    <h2 className="theme-text text-sm font-bold">
                      Filter Transaksi
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="relative">
                    <Search
                      size={17}
                      className="theme-text-placeholder absolute left-3.5 top-1/2 -translate-y-1/2"
                    />
                    <input
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value);
                        setPage(1);
                      }}
                      placeholder="Cari nomor jurnal/keterangan..."
                      className="theme-input h-11 w-full rounded-xl border pl-10 pr-4 text-sm outline-none"
                    />
                  </div>

                  <div className="relative">
                    <Filter
                      size={15}
                      className="theme-text-placeholder pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                    />
                    <select
                      value={jenisFilter}
                      onChange={(event) => {
                        setJenisFilter(event.target.value);
                        setPage(1);
                      }}
                      className="theme-input h-11 w-full appearance-none rounded-xl border pl-9 pr-4 text-sm"
                    >
                      <option value="">Semua Jenis</option>
                      <option value="masuk">Pemasukan</option>
                      <option value="keluar">Pengeluaran</option>
                    </select>
                  </div>

                  <select
                    value={akunFilter}
                    onChange={(event) => {
                      setAkunFilter(event.target.value);
                      setPage(1);
                    }}
                    className="theme-input h-11 w-full rounded-xl border px-3 text-sm"
                  >
                    <option value="">Semua Akun Kas</option>
                    {akunKas.map((akun) => (
                      <option key={akun.id} value={akun.id}>
                        {akun.kode} - {akun.nama}
                      </option>
                    ))}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(event) => {
                      setStatusFilter(event.target.value);
                      setPage(1);
                    }}
                    className="theme-input h-11 w-full rounded-xl border px-3 text-sm"
                  >
                    <option value="">Semua Status</option>
                    <option value="aktif">Aktif</option>
                    <option value="dibatalkan">Dibatalkan</option>
                  </select>

                  <div>
                    <label className="theme-text-muted mb-1.5 block text-xs">
                      Tanggal dari
                    </label>
                    <input
                      type="date"
                      value={tanggalDari}
                      onChange={(event) => {
                        setTanggalDari(event.target.value);
                        setPage(1);
                      }}
                      className="theme-input h-11 w-full rounded-xl border px-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="theme-text-muted mb-1.5 block text-xs">
                      Tanggal sampai
                    </label>
                    <input
                      type="date"
                      value={tanggalSampai}
                      onChange={(event) => {
                        setTanggalSampai(event.target.value);
                        setPage(1);
                      }}
                      className="theme-input h-11 w-full rounded-xl border px-3 text-sm"
                    />
                  </div>

                  <div className="flex items-end sm:col-span-2 xl:col-span-3">
                    <button
                      onClick={resetFilter}
                      className="theme-input inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold"
                    >
                      <RotateCcw size={15} />
                      Reset Filter
                    </button>
                  </div>
                </div>
              </section>


              <section className="theme-card overflow-hidden rounded-2xl border shadow-sm">
                <div className="theme-border flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[color-mix(in_srgb,var(--color-primary)_18%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] text-[var(--color-primary)]">
                        <Receipt size={16} />
                      </div>
                      <h2 className="theme-text text-sm font-bold">
                        Riwayat Jurnal Kas
                      </h2>
                    </div>

                    <p className="theme-text-muted ml-10 mt-1 text-xs">
                      {meta.total} transaksi ditemukan
                    </p>
                  </div>

                  <div className="theme-text-muted flex items-center gap-2 text-xs">
                    <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />
                    Terhubung ke Sistem
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1200px]">
                    <thead className="theme-table-header">
                      <tr className="theme-border border-b">
                        {[
                          "No",
                          "Tanggal",
                          "Nomor Jurnal",
                          "Keterangan",
                          "Akun Kas",
                          "Kategori",
                          "Jenis",
                          "Debit",
                          "Kredit",
                          "Status",
                          "Aksi",
                        ].map((label) => (
                          <th
                            key={label}
                            className={`whitespace-nowrap px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.1em] ${
                              label === "No"
                                ? "w-14 text-center"
                                : ["Debit", "Kredit"].includes(label)
                                  ? "text-right"
                                  : label === "Status" || label === "Aksi"
                                    ? "text-center"
                                    : "text-left"
                            }`}
                          >
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[var(--color-border-soft)]">
                      {loading ? (
                        <tr>
                          <td colSpan={11} className="px-5 py-16 text-center">
                            <Loader2
                              size={24}
                              className="mx-auto animate-spin text-[var(--color-primary)]"
                            />
                            <p className="theme-text-muted mt-3 text-sm">
                              Memuat jurnal kas...
                            </p>
                          </td>
                        </tr>
                      ) : data.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="px-5 py-16 text-center">
                            <FileText
                              size={24}
                              className="theme-text-muted mx-auto"
                            />
                            <p className="theme-text mt-3 text-sm font-semibold">
                              Tidak ada transaksi
                            </p>
                            <p className="theme-text-muted mt-1 text-xs">
                              Ubah filter atau tambahkan jurnal baru.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        data.map((item, index) => (
                          <tr
                            key={item.id}
                            className="theme-table-hover transition"
                          >
                            <td className="px-4 py-4 text-center text-xs font-semibold tabular-nums theme-text-secondary">
                              {(page - 1) * LIMIT + index + 1}
                            </td>

                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <CalendarDays
                                  size={15}
                                  className="theme-text-muted shrink-0"
                                />
                                <span className="theme-text-secondary whitespace-nowrap text-xs">
                                  {formatDate(item.tanggal)}
                                </span>
                              </div>
                            </td>

                            <td className="theme-text-secondary px-4 py-4 text-xs font-semibold">
                              {item.nomorJurnal || "-"}
                            </td>

                            <td className="px-4 py-4">
                              <p className="theme-text text-sm font-semibold">
                                {item.keterangan || formatKategori(item.kategori)}
                              </p>
                              <p className="theme-text-muted mt-1 text-xs">
                                Sumber: {item.sumber || "-"}
                              </p>
                            </td>

                            <td className="px-4 py-4">
                              <p className="theme-text text-xs font-semibold">
                                {item.akunKas?.nama || "-"}
                              </p>
                              <p className="theme-text-muted mt-1 text-xs">
                                {item.akunKas?.kode || ""}
                              </p>
                            </td>

                            <td className="theme-text-secondary px-4 py-4 text-xs">
                              {formatKategori(item.kategori)}
                            </td>

                            <td className="px-4 py-4">
                              <TransactionBadge jenis={item.jenis} />
                            </td>

                            <td className="px-4 py-4 text-right">
                              <span className="text-xs font-semibold tabular-nums text-[var(--color-danger)]">
                                {item.jenis === "keluar"
                                  ? formatCurrency(item.jumlah)
                                  : "-"}
                              </span>
                            </td>

                            <td className="px-4 py-4 text-right">
                              <span className="text-xs font-semibold tabular-nums text-[var(--color-success)]">
                                {item.jenis === "masuk"
                                  ? formatCurrency(item.jumlah)
                                  : "-"}
                              </span>
                            </td>

                            <td className="px-4 py-4 text-center">
                              <StatusBadge status={item.status} />
                            </td>

                            <td className="px-4 py-4 text-center">
                              {canCancel(item) ? (
                                <button
                                  onClick={() => openCancelModal(item)}
                                  title="Batalkan jurnal"
                                  className="theme-input inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold"
                                >
                                  <X size={14} />
                                  Batalkan
                                </button>
                              ) : (
                                <span className="theme-text-muted text-xs">
                                  {item.status !== "aktif"
                                    ? "Selesai"
                                    : "Otomatis"}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="theme-border flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <p className="theme-text-muted text-xs">
                    Menampilkan{" "}
                    {meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1}
                    {" - "}
                    {Math.min(meta.page * meta.limit, meta.total)}
                    {" dari "}
                    {meta.total} transaksi
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={page <= 1 || loading}
                      onClick={() => setPage((value) => Math.max(1, value - 1))}
                      className="theme-input flex h-9 w-9 items-center justify-center rounded-lg disabled:opacity-40"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <span className="theme-text-secondary text-xs">
                      Halaman {meta.page} / {meta.totalPages}
                    </span>

                    <button
                      disabled={page >= meta.totalPages || loading}
                      onClick={() =>
                        setPage((value) =>
                          Math.min(meta.totalPages, value + 1)
                        )
                      }
                      className="theme-input flex h-9 w-9 items-center justify-center rounded-lg disabled:opacity-40"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </section>

              <div className="h-8" />
            </div>
          </div>
        </main>
      </div>


      {selectedJurnal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-jurnal-title"
            className="theme-card w-full max-w-md rounded-2xl border shadow-xl"
          >
            <div className="theme-border flex items-start justify-between gap-4 border-b p-5">
              <div>
                <h2
                  id="cancel-jurnal-title"
                  className="theme-text text-lg font-bold"
                >
                  Batalkan Jurnal
                </h2>
                <p className="theme-text-muted mt-1 text-sm">
                  {selectedJurnal.nomorJurnal}
                </p>
              </div>

              <button
                onClick={() => setSelectedJurnal(null)}
                disabled={actionLoading}
                aria-label="Tutup dialog"
                className="theme-text-muted transition hover:text-[var(--color-text)]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5">
              <div className="theme-card-soft theme-border rounded-xl border p-3">
                <p className="theme-text text-sm font-semibold">
                  {selectedJurnal.keterangan || selectedJurnal.kategori}
                </p>
                <p className="theme-text-muted mt-1 text-xs">
                  {formatJenis(selectedJurnal.jenis)} ·{" "}
                  {formatCurrency(selectedJurnal.jumlah)}
                </p>
              </div>

              <label className="theme-text mt-4 block text-sm font-semibold">
                Alasan pembatalan{" "}
                <span className="text-[var(--color-danger)]">*</span>
              </label>

              <textarea
                value={alasan}
                onChange={(event) => setAlasan(event.target.value)}
                placeholder="Tuliskan alasan pembatalan..."
                rows={4}
                maxLength={500}
                className="theme-input mt-2 w-full rounded-xl border p-3 text-sm outline-none"
              />

              <p className="theme-text-muted mt-1 text-right text-xs">
                {alasan.length}/500 karakter
              </p>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedJurnal(null)}
                  disabled={actionLoading}
                  className="theme-input h-10 rounded-lg px-4 text-sm font-semibold disabled:opacity-50"
                >
                  Kembali
                </button>

                <button
                  onClick={handleCancel}
                  disabled={actionLoading || !alasan.trim()}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--color-danger)_35%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] px-4 text-sm font-semibold text-[var(--color-danger)] transition hover:bg-[color-mix(in_srgb,var(--color-danger)_15%,transparent)] disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <X size={15} />
                  )}
                  Konfirmasi Pembatalan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function FinanceCard({ label, value, description, icon, tone = "primary" }) {
  const toneMap = {
    success: {
      surface: "bg-[color-mix(in_srgb,var(--color-success)_8%,transparent)]",
      text: "text-[var(--color-success)]",
      accent: "bg-[color-mix(in_srgb,var(--color-success)_55%,transparent)]",
    },
    danger: {
      surface: "bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)]",
      text: "text-[var(--color-danger)]",
      accent: "bg-[color-mix(in_srgb,var(--color-danger)_55%,transparent)]",
    },
    primary: {
      surface: "bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]",
      text: "text-[var(--color-primary)]",
      accent: "bg-[color-mix(in_srgb,var(--color-primary)_55%,transparent)]",
    },
    info: {
      surface: "bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)]",
      text: "text-[var(--color-info)]",
      accent: "bg-[color-mix(in_srgb,var(--color-info)_55%,transparent)]",
    },
  };

  const current = toneMap[tone] || toneMap.primary;

  return (
    <div className="theme-card relative overflow-hidden rounded-2xl border shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className={`absolute left-0 top-0 h-full w-[3px] ${current.accent}`} />

      <div className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="theme-text-secondary text-xs font-semibold">
            {label}
          </p>
          <p className="theme-text mt-2 truncate text-xl font-bold tabular-nums sm:text-2xl">
            {value}
          </p>
          <p className="theme-text-muted mt-2 text-xs">
            {description}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${current.surface} ${current.text}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}


function TransactionBadge({ jenis }) {
  const masuk = jenis === "masuk";

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-bold ${
        masuk
          ? "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)]"
          : "bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] text-[var(--color-danger)]"
      }`}
    >
      {masuk ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      {formatJenis(jenis)}
    </span>
  );
}


function StatusBadge({ status }) {
  const aktif = status === "aktif";

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-bold ${
        aktif
          ? "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)]"
          : "bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] text-[var(--color-danger)]"
      }`}
    >
      {formatStatus(status)}
    </span>
  );
}