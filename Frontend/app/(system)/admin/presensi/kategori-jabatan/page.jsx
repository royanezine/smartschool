"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  getKategoriJabatan,
  deleteKategoriJabatan,
} from "@/services/kategoriJabatan.service";

import {
  BriefcaseBusiness,
  Search,
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  Eye,
  Wallet,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Info,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

function formatTanggal(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "Terjadi kesalahan. Silakan coba kembali.";
}

function StatusBadge({ status }) {
  const aktif = status === "aktif";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        aktif
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-900/60"
          : "bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] theme-text-muted ring-1 ring-[color-mix(in_srgb,var(--color-text)_8%,transparent)]"
      }`}
    >
      {aktif ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
      {aktif ? "Aktif" : "Nonaktif"}
    </span>
  );
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

const inputClass =
  "theme-input w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-50";

const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border theme-border theme-card px-3.5 py-2.5 text-sm font-medium theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] disabled:cursor-not-allowed disabled:opacity-50 transition";

const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl theme-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 transition";

export default function KategoriJabatanPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
  });

  const [sortBy, setSortBy] = useState("nama");
  const [sortOrder, setSortOrder] = useState("asc");

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function handleSort(column) {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  }

  const loadData = useCallback(
    async ({ quiet = false } = {}) => {
      if (quiet) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const result = await getKategoriJabatan({
          page,
          limit,
          search: search || undefined,
          status: statusFilter || undefined,
        });

        setItems(result.data);
        setPagination({
          total: result.total,
          totalPages: Math.max(1, result.totalPages),
        });
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, limit, search, statusFilter],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timeout);
  }, [notice]);

  const sortedItems = useMemo(() => {
    const data = [...items];

    data.sort((a, b) => {
      let valA;
      let valB;

      switch (sortBy) {
        case "tarif":
          valA = Number(a.tarifAktif?.tarifPerJam ?? 0);
          valB = Number(b.tarifAktif?.tarifPerJam ?? 0);
          break;
        case "pegawai":
          valA = Number(a.jumlahPengguna ?? 0);
          valB = Number(b.jumlahPengguna ?? 0);
          break;
        case "status":
          valA = String(a.status ?? "").toLowerCase();
          valB = String(b.status ?? "").toLowerCase();
          break;
        case "kode":
          valA = String(a.kode ?? "").toLowerCase();
          valB = String(b.kode ?? "").toLowerCase();
          break;
        case "nama":
        default:
          valA = String(a.nama ?? "").toLowerCase();
          valB = String(b.nama ?? "").toLowerCase();
          break;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [items, sortBy, sortOrder]);

  const summary = useMemo(() => {
    const active = items.filter((item) => item.status === "aktif").length;
    const employees = items.reduce(
      (total, item) => total + Number(item.jumlahPengguna ?? 0),
      0,
    );

    return {
      active,
      employees,
      shown: items.length,
    };
  }, [items]);

  function openCreate() {
    router.push("/admin/presensi/kategori-jabatan/tambah");
  }

  function openEdit(item) {
    router.push(`/admin/presensi/kategori-jabatan/${item.id}/edit`);
  }

  function openDetail(item) {
    router.push(`/admin/presensi/kategori-jabatan/${item.id}`);
  }

  function openTarif(item) {
    router.push(`/admin/presensi/kategori-jabatan/${item.id}/tarif`);
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(
      `Nonaktifkan kategori "${item.nama}"?\n\nSistem akan menolak penghapusan jika kategori masih digunakan oleh pegawai.`,
    );

    if (!confirmed) return;

    setError("");

    try {
      await deleteKategoriJabatan(item.id);
      setNotice("Permintaan penghapusan kategori berhasil diproses.");
      await loadData({ quiet: true });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function handleSearch(event) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        role="admin"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b theme-border">
          <Header onMenuClick={() => setSidebarOpen(true)} />
        </div>

        <div className="flex min-h-0 flex-1">
          <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
            <div className="w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 2xl:px-12">
              <div className="w-full space-y-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                      <BriefcaseBusiness size={23} />
                    </div>

                    <div>
                      <h1 className="mt-1 text-2xl font-bold tracking-tight theme-text">
                        Kategori Jabatan
                      </h1>
                      <p className="mt-1 max-w-2xl text-sm leading-6 theme-text-secondary">
                        Kelola kategori jabatan pegawai dan tarif per jam
                        sebagai dasar perhitungan penggajian.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => loadData({ quiet: true })}
                      disabled={loading || refreshing}
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
                      onClick={openCreate}
                      className={buttonPrimary}
                    >
                      <Plus size={17} />
                      Tambah Kategori
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border theme-border theme-card p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                    <Info size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium theme-text">
                      Perubahan tarif disimpan sebagai riwayat baru
                    </p>
                    <p className="mt-1 text-xs leading-5 theme-text-muted">
                      Perhitungan gaji mengikuti aturan sistem dan riwayat tarif
                      yang berlaku pada periode penggajian.
                    </p>
                  </div>
                </div>

                {notice && (
                  <div
                    role="status"
                    className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
                  >
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                    <p className="flex-1">{notice}</p>
                    <button
                      type="button"
                      onClick={() => setNotice("")}
                      aria-label="Tutup pemberitahuan"
                      className="rounded p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
                  >
                    <AlertCircle size={19} className="mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">Permintaan gagal</p>
                      <p className="mt-1 break-words">{error}</p>
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

                <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-3 2xl:grid-cols-6">
                  <div className="sm:col-span-1 2xl:col-span-2">
                    <SummaryCard
                      title="Kategori pada halaman"
                      value={loading ? "—" : pagination.total}
                      description="Total sesuai hasil sistem"
                      icon={BriefcaseBusiness}
                      tone="blue"
                    />
                  </div>
                  <div className="sm:col-span-1 2xl:col-span-2">
                    <SummaryCard
                      title="Kategori aktif"
                      value={loading ? "—" : summary.active}
                      description="Dari data halaman saat ini"
                      icon={CheckCircle2}
                      tone="emerald"
                    />
                  </div>
                  <div className="sm:col-span-1 2xl:col-span-2">
                    <SummaryCard
                      title="Pegawai pada halaman"
                      value={loading ? "—" : summary.employees}
                      description="Berdasarkan jumlah pengguna per kategori"
                      icon={Users}
                      tone="indigo"
                    />
                  </div>
                </div>

                <section className="theme-card overflow-hidden rounded-2xl border theme-border shadow-sm">
                  <div className="border-b theme-border p-4 sm:p-5">
                    <form
                      onSubmit={handleSearch}
                      className="flex flex-col gap-3 md:flex-row"
                    >
                      <div className="relative min-w-0 flex-1">
                        <Search
                          size={18}
                          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 theme-text-muted"
                        />
                        <input
                          value={searchInput}
                          onChange={(event) =>
                            setSearchInput(event.target.value)
                          }
                          placeholder="Cari nama atau kode kategori..."
                          className={`${inputClass} pl-10`}
                        />
                      </div>

                      <select
                        value={statusFilter}
                        onChange={(event) => {
                          setStatusFilter(event.target.value);
                          setPage(1);
                        }}
                        className={`${inputClass} md:w-48`}
                        aria-label="Filter status kategori"
                      >
                        <option value="">Semua status</option>
                        <option value="aktif">Aktif</option>
                        <option value="nonaktif">Nonaktif</option>
                      </select>

                      <button type="submit" className={buttonPrimary}>
                        <Search size={16} />
                        Cari
                      </button>
                    </form>
                  </div>

                  <div className="relative">
                    {loading ? (
                      <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
                        <LoaderCircle
                          size={28}
                          className="animate-spin theme-primary-text"
                        />
                        <p className="mt-3 text-sm font-medium theme-text">
                          Memuat kategori jabatan...
                        </p>
                        <p className="mt-1 text-xs theme-text-muted">
                          Mengambil data dari sistem
                        </p>
                      </div>
                    ) : sortedItems.length === 0 ? (
                      <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] theme-text-muted">
                          <BriefcaseBusiness size={23} />
                        </div>
                        <p className="mt-4 font-semibold theme-text">
                          Belum ada kategori jabatan
                        </p>
                        <p className="mt-1 max-w-sm text-sm theme-text-muted">
                          Coba ubah pencarian atau tambahkan kategori baru.
                        </p>
                        <button
                          type="button"
                          onClick={openCreate}
                          className={`${buttonPrimary} mt-4`}
                        >
                          <Plus size={16} />
                          Tambah Kategori
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-left text-sm">
                          <thead className="bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] text-xs uppercase tracking-wide theme-text-muted border-b theme-border">
                            <tr>
                              <th className="px-5 py-4 font-semibold w-16">No</th>
                              <SortableHeader
                                label="Kategori"
                                column="nama"
                                sortBy={sortBy}
                                sortOrder={sortOrder}
                                onSort={handleSort}
                              />
                              <SortableHeader
                                label="Tarif per jam"
                                column="tarif"
                                sortBy={sortBy}
                                sortOrder={sortOrder}
                                onSort={handleSort}
                              />
                              <SortableHeader
                                label="Pegawai"
                                column="pegawai"
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
                                Tindakan
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
                                      <BriefcaseBusiness size={18} />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-semibold theme-text">
                                        {item.nama || "-"}
                                      </p>
                                      <p className="mt-1 text-xs theme-text-muted">
                                        Kode: {item.kode || "Tidak ada kode"}
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                <td className="px-5 py-4">
                                  <p className="font-semibold theme-text">
                                    {item.tarifAktif
                                      ? formatRupiah(item.tarifAktif.tarifPerJam)
                                      : "Belum diatur"}
                                  </p>
                                  {item.tarifAktif?.berlakuMulai && (
                                    <p className="mt-1 text-xs theme-text-muted">
                                      Berlaku sejak{" "}
                                      {formatTanggal(
                                        item.tarifAktif.berlakuMulai,
                                      )}
                                    </p>
                                  )}
                                </td>

                                <td className="px-5 py-4">
                                  <span className="inline-flex items-center gap-1.5 theme-text-secondary">
                                    <Users
                                      size={15}
                                      className="theme-text-muted"
                                    />
                                    {Number(item.jumlahPengguna ?? 0)}
                                  </span>
                                </td>

                                <td className="px-5 py-4">
                                  <StatusBadge status={item.status} />
                                </td>

                                <td className="px-5 py-4">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => openDetail(item)}
                                      title="Detail dan riwayat tarif"
                                      aria-label={`Detail ${item.nama}`}
                                      className="rounded-lg p-2 theme-text-muted transition hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] hover:text-[var(--color-primary)]"
                                    >
                                      <Eye size={17} />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => openEdit(item)}
                                      title="Edit kategori"
                                      aria-label={`Edit ${item.nama}`}
                                      className="rounded-lg p-2 theme-text-muted transition hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] hover:text-[var(--color-primary)]"
                                    >
                                      <Pencil size={17} />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => openTarif(item)}
                                      title="Atur tarif baru"
                                      aria-label={`Atur tarif ${item.nama}`}
                                      className="rounded-lg p-2 theme-text-muted transition hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] hover:text-[var(--color-primary)]"
                                    >
                                      <Wallet size={17} />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleDelete(item)}
                                      title="Nonaktifkan kategori"
                                      aria-label={`Nonaktifkan ${item.nama}`}
                                      className="rounded-lg p-2 theme-text-muted transition hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-300"
                                    >
                                      <Trash2 size={17} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 border-t theme-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <p className="text-sm theme-text-muted">
                      Menampilkan{" "}
                      <span className="font-medium theme-text">
                        {sortedItems.length}
                      </span>{" "}
                      data pada halaman ini dari{" "}
                      <span className="font-medium theme-text">
                        {pagination.total}
                      </span>{" "}
                      kategori
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={page <= 1 || loading}
                        onClick={() => setPage((current) => current - 1)}
                        className={buttonSecondary}
                      >
                        <ChevronLeft size={16} />
                        Sebelumnya
                      </button>

                      <span className="min-w-20 text-center text-sm theme-text">
                        {page} / {pagination.totalPages}
                      </span>

                      <button
                        type="button"
                        disabled={page >= pagination.totalPages || loading}
                        onClick={() => setPage((current) => current + 1)}
                        className={buttonSecondary}
                      >
                        Berikutnya
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="border-t theme-border px-5 py-3 text-xs theme-text-muted">
                    Data kategori jabatan diambil dari sistem.
                  </div>
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, description, icon: Icon, tone = "blue" }) {
  const toneClasses = {
    blue: "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text",
    emerald: "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text",
    indigo: "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text",
    slate: "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text",
  };

  return (
    <div className="theme-card flex h-full flex-col rounded-2xl border theme-border p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium theme-text-muted">{title}</span>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneClasses[tone] ?? toneClasses.blue}`}
        >
          <Icon size={19} />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight tabular-nums theme-text">
        {typeof value === "number" ? value.toLocaleString("id-ID") : value}
      </p>
      <p className="mt-1 text-xs theme-text-muted">{description}</p>
    </div>
  );
}