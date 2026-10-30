"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Wallet,
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  Banknote,
  Layers3,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";
import { getAkunKas, deleteAkunKas } from "@/services/jurnalKas.service";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

function formatRupiah(value) {
  const number = Number(value ?? 0);

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(number) ? number : 0);
}

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "Terjadi kesalahan. Silakan coba lagi.";
}

function getStatusLabel(status) {
  return String(status ?? "").toLowerCase() === "aktif"
    ? "Aktif"
    : "Nonaktif";
}

export default function AkunKasPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [akun, setAkun] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");

  const [sortConfig, setSortConfig] = useState({
    key: "kode",
    direction: "asc",
  });

  const loadAkun = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getAkunKas();

      if (response?.success === false) {
        throw new Error(response.message || "Gagal mengambil akun kas.");
      }

      const rows = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : [];

      setAkun(rows);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadAkun();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadAkun]);


  function handleSort(key) {
    setSortConfig((previous) => {
      if (previous.key === key) {
        return {
          key,
          direction: previous.direction === "asc" ? "desc" : "asc",
        };
      }

      return { key, direction: "asc" };
    });
  }


  const filteredAkun = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    const filtered = akun.filter((item) => {
      const matchesSearch =
        String(item.kode ?? "").toLowerCase().includes(keyword) ||
        String(item.nama ?? "").toLowerCase().includes(keyword);

      const matchesStatus =
        filterStatus === "semua" ||
        String(item.status ?? "").toLowerCase() === filterStatus;

      return matchesSearch && matchesStatus;
    });

    const { key, direction } = sortConfig;

    const sorted = [...filtered].sort((a, b) => {
      let valA = a?.[key];
      let valB = b?.[key];

      if (
        [
          "saldoAwal",
          "totalMasuk",
          "totalKeluar",
          "saldo",
        ].includes(key)
      ) {
        valA = Number(valA ?? 0);
        valB = Number(valB ?? 0);
        return direction === "asc" ? valA - valB : valB - valA;
      }

      valA = String(valA ?? "").toLowerCase();
      valB = String(valB ?? "").toLowerCase();

      if (valA < valB) return direction === "asc" ? -1 : 1;
      if (valA > valB) return direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [akun, search, filterStatus, sortConfig]);

  const totalSaldo = akun.reduce(
    (sum, item) => sum + Number(item.saldo ?? 0),
    0,
  );

  const totalMasuk = akun.reduce(
    (sum, item) => sum + Number(item.totalMasuk ?? 0),
    0,
  );

  const totalKeluar = akun.reduce(
    (sum, item) => sum + Number(item.totalKeluar ?? 0),
    0,
  );

  const totalAktif = akun.filter(
    (item) => String(item.status ?? "").toLowerCase() === "aktif",
  ).length;

  async function handleDelete(item) {
    const confirmed = window.confirm(
      `Hapus akun "${item.nama}" (${item.kode})? Tindakan ini mungkin ditolak jika akun sudah digunakan dalam transaksi.`,
    );

    if (!confirmed) return;

    setDeletingId(item.id);
    setError("");

    try {
      const response = await deleteAkunKas(item.id);

      if (response?.success === false) {
        throw new Error(response.message || "Gagal menghapus akun kas.");
      }

      await loadAkun();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="akunKas"
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

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <div className="w-full space-y-6">

              <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="theme-info flex h-12 w-12 items-center justify-center rounded-xl border">
                      <Wallet size={23} />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">
                        KEUANGAN SEKOLAH
                      </p>

                      <h1 className="theme-text mt-0.5 text-[25px] font-bold tracking-tight sm:text-[29px]">
                        Akun Kas
                      </h1>
                    </div>
                  </div>

                  <p className="theme-text-muted mt-3 max-w-2xl text-sm leading-6">
                    Kelola akun kas dan bank sekolah yang digunakan untuk
                    pencatatan transaksi keuangan.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={loadAkun}
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
                    href="/admin/keuangan/akunKas/tambah"
                    className="theme-primary inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold"
                  >
                    <Plus size={17} />
                    Tambah Akun
                  </Link>
                </div>
              </section>

              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-[var(--color-danger)] p-4 text-sm">
                  <AlertCircle
                    size={19}
                    className="mt-0.5 shrink-0 text-[var(--color-danger)]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold theme-text">Terjadi masalah</p>
                    <p className="mt-1 break-words theme-text-secondary">
                      {error}
                    </p>
                  </div>
                  <button
                    onClick={() => setError("")}
                    aria-label="Tutup pesan"
                  >
                    <X size={17} />
                  </button>
                </div>
              )}

              <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
                <SummaryCard
                  title="Jumlah Akun"
                  value={akun.length}
                  icon={Layers3}
                  description="Akun kas dan bank"
                  tone="primary"
                />
                <SummaryCard
                  title="Akun Aktif"
                  value={totalAktif}
                  icon={CheckCircle2}
                  description="Berstatus aktif"
                  tone="success"
                />
                <SummaryCard
                  title="Nonaktif"
                  value={akun.length - totalAktif}
                  icon={XCircle}
                  description="Berstatus nonaktif"
                  tone="warning"
                />
                <SummaryCard
                  title="Total Saldo"
                  value={formatRupiah(totalSaldo)}
                  icon={Banknote}
                  description="Saldo seluruh akun"
                  tone="info"
                />
                <SummaryCard
                  title="Total Pemasukan"
                  value={formatRupiah(totalMasuk)}
                  icon={TrendingUp}
                  description="Akumulasi pemasukan"
                  tone="success"
                />
                <SummaryCard
                  title="Total Pengeluaran"
                  value={formatRupiah(totalKeluar)}
                  icon={TrendingDown}
                  description="Akumulasi pengeluaran"
                  tone="danger"
                />
              </section>

              <section className="theme-card overflow-hidden rounded-2xl border shadow-sm">
                <div className="theme-border flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div>
                    <h2 className="theme-text text-sm font-bold">
                      Daftar Akun Kas
                    </h2>
                    <p className="theme-text-muted mt-1 text-xs">
                      Klik header kolom untuk mengurutkan data.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="relative">
                      <Search
                        size={17}
                        className="theme-text-placeholder absolute left-3.5 top-1/2 -translate-y-1/2"
                      />
                      <input
                        type="search"
                        value={search}
                        onChange={(event) =>
                          setSearch(event.target.value)
                        }
                        placeholder="Cari kode atau nama..."
                        className="theme-input h-10 w-full rounded-lg border pl-10 pr-4 text-sm outline-none sm:w-64"
                      />
                    </div>

                    <select
                      value={filterStatus}
                      onChange={(event) =>
                        setFilterStatus(event.target.value)
                      }
                      className="theme-input h-10 rounded-lg border px-3 text-sm outline-none"
                      aria-label="Filter status akun"
                    >
                      <option value="semua">Semua status</option>
                      <option value="aktif">Aktif</option>
                      <option value="nonaktif">Nonaktif</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px] text-left text-sm">
                    <thead className="theme-table-header">
                      <tr className="theme-border border-b">
                        <th className="w-14 whitespace-nowrap px-4 py-3.5 text-center text-[10px] font-bold uppercase tracking-[0.1em]">
                          No
                        </th>

                        <SortableHeader
                          label="Kode"
                          sortKey="kode"
                          sortConfig={sortConfig}
                          onSort={handleSort}
                          align="left"
                        />

                        <SortableHeader
                          label="Nama Akun"
                          sortKey="nama"
                          sortConfig={sortConfig}
                          onSort={handleSort}
                          align="left"
                        />

                        <SortableHeader
                          label="Jenis"
                          sortKey="tipe"
                          sortConfig={sortConfig}
                          onSort={handleSort}
                          align="left"
                        />

                        <SortableHeader
                          label="Saldo Awal"
                          sortKey="saldoAwal"
                          sortConfig={sortConfig}
                          onSort={handleSort}
                          align="right"
                        />

                        <SortableHeader
                          label="Total Masuk"
                          sortKey="totalMasuk"
                          sortConfig={sortConfig}
                          onSort={handleSort}
                          align="right"
                        />

                        <SortableHeader
                          label="Total Keluar"
                          sortKey="totalKeluar"
                          sortConfig={sortConfig}
                          onSort={handleSort}
                          align="right"
                        />

                        <SortableHeader
                          label="Saldo"
                          sortKey="saldo"
                          sortConfig={sortConfig}
                          onSort={handleSort}
                          align="right"
                        />

                        <SortableHeader
                          label="Status"
                          sortKey="status"
                          sortConfig={sortConfig}
                          onSort={handleSort}
                          align="center"
                        />

                        <th className="whitespace-nowrap px-4 py-3.5 text-center text-[10px] font-bold uppercase tracking-[0.1em]">
                          Aksi
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[var(--color-border-soft)]">
                      {loading ? (
                        <tr>
                          <td colSpan={10} className="px-5 py-16 text-center">
                            <Loader2
                              size={24}
                              className="mx-auto animate-spin text-[var(--color-primary)]"
                            />
                            <p className="theme-text-muted mt-3 text-sm">
                              Memuat data akun kas...
                            </p>
                          </td>
                        </tr>
                      ) : filteredAkun.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="px-5 py-16 text-center">
                            <Wallet
                              size={28}
                              className="theme-text-muted mx-auto"
                            />
                            <p className="theme-text mt-3 text-sm font-semibold">
                              {akun.length === 0
                                ? "Belum ada akun kas"
                                : "Akun tidak ditemukan"}
                            </p>
                            <p className="theme-text-muted mt-1 text-xs">
                              {akun.length === 0
                                ? "Tambahkan akun kas untuk mulai menyiapkan pencatatan keuangan."
                                : "Coba kata kunci atau filter status lainnya."}
                            </p>
                            {akun.length === 0 && (
                              <Link
                                href="/admin/keuangan/akunKas/tambah"
                                className="theme-primary mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold"
                              >
                                <Plus size={16} />
                                Tambah Akun Pertama
                              </Link>
                            )}
                          </td>
                        </tr>
                      ) : (
                        filteredAkun.map((item, index) => (
                          <tr
                            key={item.id}
                            className="theme-table-hover transition"
                          >
                            <td className="px-4 py-4 text-center text-xs font-semibold tabular-nums theme-text-secondary">
                              {index + 1}
                            </td>

                            <td className="px-4 py-4 text-xs font-semibold theme-text-secondary">
                              {item.kode || "-"}
                            </td>

                            <td className="px-4 py-4">
                              <p className="theme-text text-sm font-semibold">
                                {item.nama || "-"}
                              </p>
                            </td>

                            <td className="theme-text-secondary px-4 py-4 text-xs">
                              {String(item.tipe ?? "-").toLowerCase() ===
                              "bank"
                                ? "Bank"
                                : String(item.tipe ?? "").toLowerCase() ===
                                    "kas"
                                  ? "Kas"
                                  : item.tipe || "-"}
                            </td>

                            <td className="px-4 py-4 text-right text-xs tabular-nums theme-text-secondary">
                              {formatRupiah(item.saldoAwal)}
                            </td>

                            <td className="px-4 py-4 text-right text-xs font-semibold tabular-nums text-[var(--color-success)]">
                              {formatRupiah(item.totalMasuk)}
                            </td>

                            <td className="px-4 py-4 text-right text-xs font-semibold tabular-nums text-[var(--color-danger)]">
                              {formatRupiah(item.totalKeluar)}
                            </td>

                            <td className="px-4 py-4 text-right text-sm font-bold tabular-nums theme-text">
                              {formatRupiah(item.saldo)}
                            </td>

                            <td className="px-4 py-4 text-center">
                              <span
                                className={`
                                  inline-flex
                                  whitespace-nowrap
                                  rounded-md
                                  px-2
                                  py-1
                                  text-[10px]
                                  font-bold
                                  ${
                                    String(item.status ?? "").toLowerCase() ===
                                    "aktif"
                                      ? "bg-[var(--color-success-background)] text-[var(--color-success)]"
                                      : "bg-[var(--color-danger-background)] text-[var(--color-danger)]"
                                  }
                                `}
                              >
                                {getStatusLabel(item.status)}
                              </span>
                            </td>

                            <td className="px-4 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <Link
                                  href={`/admin/keuangan/akunKas/${item.id}/edit`}
                                  title="Edit akun"
                                  aria-label={`Edit akun ${item.nama}`}
                                  className="theme-input inline-flex h-8 w-8 items-center justify-center rounded-lg"
                                >
                                  <Pencil size={14} />
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(item)}
                                  disabled={deletingId === item.id}
                                  title="Hapus akun"
                                  aria-label={`Hapus akun ${item.nama}`}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-danger)] text-[var(--color-danger)] transition hover:bg-[var(--color-danger-background)] disabled:opacity-50"
                                >
                                  {deletingId === item.id ? (
                                    <Loader2
                                      size={14}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Trash2 size={14} />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {!loading && (
                  <div className="theme-border border-t px-5 py-3 text-xs theme-text-muted">
                    Menampilkan {filteredAkun.length} dari {akun.length} akun.
                    {sortConfig?.key && (
                      <>
                        {" "}· Diurutkan berdasarkan{" "}
                        <span className="theme-text font-semibold">
                          {sortConfig.key}
                        </span>{" "}
                        ({sortConfig.direction === "asc" ? "A-Z / 0-9" : "Z-A / 9-0"})
                      </>
                    )}
                  </div>
                )}
              </section>

              <div className="h-8" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


function SortableHeader({
  label,
  sortKey,
  sortConfig,
  onSort,
  align = "left",
}) {
  const isActive = sortConfig?.key === sortKey;
  const direction = sortConfig?.direction;

  const alignClass =
    align === "right"
      ? "text-right"
      : align === "center"
        ? "text-center"
        : "text-left";

  const justifyClass =
    align === "right"
      ? "justify-end"
      : align === "center"
        ? "justify-center"
        : "justify-start";

  return (
    <th
      className={`
        whitespace-nowrap
        px-4
        py-3.5
        text-[10px]
        font-bold
        uppercase
        tracking-[0.1em]
        ${alignClass}
      `}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`
          group
          inline-flex
          w-full
          items-center
          gap-1.5
          transition
          ${justifyClass}
          ${isActive ? "text-[var(--color-primary)]" : "hover:text-[var(--color-primary)]"}
        `}
        title={`Urutkan berdasarkan ${label}`}
      >
        <span>{label}</span>

        <span className="shrink-0">
          {isActive && direction === "asc" ? (
            <ArrowUp size={12} />
          ) : isActive && direction === "desc" ? (
            <ArrowDown size={12} />
          ) : (
            <ArrowUpDown
              size={12}
              className="opacity-40 group-hover:opacity-100"
            />
          )}
        </span>
      </button>
    </th>
  );
}


function SummaryCard({
  title,
  value,
  icon: Icon,
  description,
  tone = "primary",
}) {
  const toneMap = {
    primary: {
      surface: "bg-[var(--color-primary-background)]",
      text: "text-[var(--color-primary)]",
    },
    success: {
      surface: "bg-[var(--color-success-background)]",
      text: "text-[var(--color-success)]",
    },
    warning: {
      surface: "bg-[var(--color-warning-background)]",
      text: "text-[var(--color-warning)]",
    },
    danger: {
      surface: "bg-[var(--color-danger-background)]",
      text: "text-[var(--color-danger)]",
    },
    info: {
      surface: "bg-[var(--color-info-background)]",
      text: "text-[var(--color-info)]",
    },
  };

  const current = toneMap[tone] || toneMap.primary;

  return (
    <div className="theme-card rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="theme-text-secondary text-xs font-semibold">
            {title}
          </p>
          <p className="theme-text mt-2 truncate text-xl font-bold sm:text-2xl">
            {value}
          </p>
          <p className="theme-text-muted mt-2 text-xs">
            {description}
          </p>
        </div>

        <div
          className={`
            ${current.surface}
            ${current.text}
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
          `}
        >
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}