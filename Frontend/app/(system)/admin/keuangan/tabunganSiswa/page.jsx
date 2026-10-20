"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  Search,
  RefreshCw,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowDownCircle,
  ArrowUpCircle,
  Receipt,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Users,
  Plus,
  Minus,
} from "lucide-react";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  getTabungan,
  getLaporanTabungan,
} from "@/services/tabungan.service";

const EMPTY_META = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

function formatRupiah(value) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "Terjadi kesalahan. Silakan coba kembali.";
}

function StatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();
  const isActive = ["aktif", "active"].includes(normalized);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border theme-border px-2.5 py-1 text-[11px] font-semibold ${
        isActive
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
          : "bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] theme-text-muted"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status || "-"}
    </span>
  );
}

function StatCard({ title, value, description, icon: Icon, loading }) {
  return (
    <div className="theme-card rounded-xl border theme-border p-4 shadow-sm transition hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium theme-text-muted">{title}</p>

          {loading ? (
            <div className="mt-3 h-7 w-24 animate-pulse rounded-lg bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]" />
          ) : (
            <p className="mt-2 break-words text-xl font-bold tabular-nums theme-text sm:text-2xl">
              {value}
            </p>
          )}

          <p className="mt-1 text-[11px] theme-text-muted">{description}</p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

export default function TabunganSiswaPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [tabungan, setTabungan] = useState([]);
  const [ringkasan, setRingkasan] = useState({ totalSaldo: 0 });
  const [laporan, setLaporan] = useState({
    totalSetoran: 0,
    jumlahSetoran: 0,
    totalPenarikan: 0,
    jumlahPenarikan: 0,
    totalSaldoSemuaSiswa: 0,
    jumlahRekening: 0,
  });
  const [meta, setMeta] = useState(EMPTY_META);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  /* =====================================================
     LOAD DATA
  ===================================================== */

  const loadTabungan = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getTabungan({
        page,
        limit,
        q: search || undefined,
      });

      setTabungan(Array.isArray(response?.data) ? response.data : []);
      setRingkasan({
        totalSaldo: Number(response?.ringkasan?.totalSaldo ?? 0),
      });
      setMeta(response?.meta || EMPTY_META);
    } catch (err) {
      setTabungan([]);
      setRingkasan({ totalSaldo: 0 });
      setMeta(EMPTY_META);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  const loadLaporan = useCallback(async () => {
    try {
      const response = await getLaporanTabungan();

      setLaporan({
        totalSetoran: Number(response?.totalSetoran ?? 0),
        jumlahSetoran: Number(response?.jumlahSetoran ?? 0),
        totalPenarikan: Number(response?.totalPenarikan ?? 0),
        jumlahPenarikan: Number(response?.jumlahPenarikan ?? 0),
        totalSaldoSemuaSiswa: Number(
          response?.totalSaldoSemuaSiswa ?? 0
        ),
        jumlahRekening: Number(response?.jumlahRekening ?? 0),
      });
    } catch (err) {
      console.error("Gagal memuat laporan tabungan:", err);
    }
  }, []);

  const refreshData = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadTabungan(), loadLaporan()]);
    } finally {
      setRefreshing(false);
    }
  }, [loadTabungan, loadLaporan]);

  useEffect(() => {
    loadTabungan();
  }, [loadTabungan]);

  useEffect(() => {
    loadLaporan();
  }, [loadLaporan]);

  function handleSearch(event) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function resetSearch() {
    setSearchInput("");
    setSearch("");
    setPage(1);
  }

  /* =====================================================
     NAVIGASI
  ===================================================== */

  function openDetail(item) {
    if (!item?.siswaId) {
      setError("ID siswa tidak ditemukan pada data tabungan.");
      return;
    }
    router.push(`/admin/keuangan/tabunganSiswa/${item.siswaId}`);
  }

  function openTransaction(type, item = null) {
    const params = new URLSearchParams();
    if (item?.siswaId) params.set("siswaId", item.siswaId);
    if (item?.id) params.set("tabunganId", item.id);

    router.push(
      `/admin/keuangan/tabunganSiswa/${type}${
        params.toString() ? `?${params.toString()}` : ""
      }`
    );
  }

  const totalPages = Math.max(Number(meta?.totalPages || 1), 1);
  const currentPage = Number(meta?.page || page);

  const averageSetoran = useMemo(
    () =>
      laporan.jumlahSetoran > 0
        ? laporan.totalSetoran / laporan.jumlahSetoran
        : 0,
    [laporan.totalSetoran, laporan.jumlahSetoran]
  );

  const averagePenarikan = useMemo(
    () =>
      laporan.jumlahPenarikan > 0
        ? laporan.totalPenarikan / laporan.jumlahPenarikan
        : 0,
    [laporan.totalPenarikan, laporan.jumlahPenarikan]
  );

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        role="admin"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0">
          <Header onMenuClick={() => setSidebarOpen(true)} />
        </div>

        <main className="min-w-0 flex-1 overflow-y-auto theme-page theme-text">
          <div className="w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-[1500px] space-y-5">
              {/* HEADER */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                    <Wallet size={20} />
                  </div>

                  <div>
                   
                    <h1 className="mt-1 text-xl font-bold theme-text sm:text-2xl">
                      Tabungan Siswa
                    </h1>
                    <p className="mt-1 text-xs theme-text-secondary sm:text-sm">
                      Kelola saldo tabungan, setoran, penarikan, dan mutasi
                      tabungan siswa.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={refreshData}
                  disabled={refreshing || loading}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border theme-border theme-card px-4 text-sm font-medium theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] disabled:cursor-not-allowed disabled:opacity-60 transition"
                >
                  <RefreshCw
                    size={16}
                    className={refreshing ? "animate-spin" : ""}
                  />
                  Muat Ulang
                </button>
              </div>

              {/* ALERT */}
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
                >
                  <AlertCircle size={19} className="mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">Permintaan gagal</p>
                    <p className="mt-1 break-words">{error}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setError("")}
                    aria-label="Tutup pesan error"
                    className="rounded p-1 hover:bg-red-100 dark:hover:bg-red-900/40"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* STATISTIK */}
              <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                <StatCard
                  title="Total Saldo"
                  value={formatRupiah(ringkasan.totalSaldo)}
                  description="Saldo dari daftar tabungan"
                  icon={Wallet}
                  loading={loading}
                />
                <StatCard
                  title="Total Setoran"
                  value={formatRupiah(laporan.totalSetoran)}
                  description={`${laporan.jumlahSetoran} transaksi setoran`}
                  icon={TrendingUp}
                  loading={loading}
                />
                <StatCard
                  title="Total Penarikan"
                  value={formatRupiah(laporan.totalPenarikan)}
                  description={`${laporan.jumlahPenarikan} transaksi penarikan`}
                  icon={TrendingDown}
                  loading={loading}
                />
                <StatCard
                  title="Jumlah Rekening"
                  value={Number(laporan.jumlahRekening || 0).toLocaleString(
                    "id-ID"
                  )}
                  description="Rekening tabungan terlapor"
                  icon={Users}
                  loading={loading}
                />
                <StatCard
                  title="Rata-rata Setoran"
                  value={formatRupiah(averageSetoran)}
                  description="Per transaksi setoran"
                  icon={TrendingUp}
                  loading={loading}
                />
                <StatCard
                  title="Rata-rata Penarikan"
                  value={formatRupiah(averagePenarikan)}
                  description="Per transaksi penarikan"
                  icon={TrendingDown}
                  loading={loading}
                />
              </section>

              {/* TABEL */}
              <section className="theme-card overflow-hidden rounded-xl border theme-border shadow-sm">
                <div className="flex flex-col gap-4 border-b theme-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                  <div>
                    <h2 className="text-sm font-bold theme-text">
                      Daftar Tabungan
                    </h2>
                    <p className="mt-1 text-xs theme-text-muted">
                      Menampilkan rekening tabungan siswa sesuai data sistem.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openTransaction("setor")}
                      className="inline-flex items-center justify-center gap-2 rounded-lg theme-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition"
                    >
                      <Plus size={17} />
                      Setor
                    </button>
                    <button
                      type="button"
                      onClick={() => openTransaction("tarik")}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border theme-border theme-card px-4 py-2.5 text-sm font-medium theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] transition"
                    >
                      <Minus size={17} />
                      Tarik
                    </button>
                  </div>
                </div>

                {/* SEARCH */}
                <form
                  onSubmit={handleSearch}
                  className="flex flex-col gap-3 border-b theme-border p-4 sm:flex-row sm:p-5"
                >
                  <div className="relative flex-1">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                    />
                    <input
                      type="search"
                      value={searchInput}
                      onChange={(event) =>
                        setSearchInput(event.target.value)
                      }
                      placeholder="Cari nama siswa atau NIS..."
                      className="theme-input h-11 w-full rounded-lg border pl-9 pr-3 text-sm outline-none transition"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex h-11 items-center justify-center rounded-lg theme-primary px-5 text-sm font-semibold text-white hover:opacity-90 transition"
                  >
                    Cari
                  </button>

                  {search && (
                    <button
                      type="button"
                      onClick={resetSearch}
                      className="inline-flex h-11 items-center justify-center rounded-lg border theme-border theme-card px-4 text-sm font-medium theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] transition"
                    >
                      Reset
                    </button>
                  )}
                </form>

                {/* DATA */}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] text-xs uppercase tracking-wide theme-text-muted border-b theme-border">
                      <tr>
                        <th className="px-4 py-3 font-semibold">No.</th>
                        <th className="px-4 py-3 font-semibold">Nama Siswa</th>
                        <th className="px-4 py-3 font-semibold">NIS</th>
                        <th className="px-4 py-3 font-semibold">Saldo</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 text-center font-semibold">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[color-mix(in_srgb,var(--color-text)_5%,transparent)]">
                      {loading ? (
                        Array.from({ length: 3 }).map((_, index) => (
                          <tr key={index}>
                            {Array.from({ length: 6 }).map((__, cell) => (
                              <td key={cell} className="px-4 py-4">
                                <div className="h-4 w-24 animate-pulse rounded bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]" />
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : tabungan.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-14 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] theme-text-muted">
                              <Wallet size={22} />
                            </div>
                            <p className="mt-3 text-sm font-bold theme-text">
                              Data tabungan tidak ditemukan
                            </p>
                            <p className="mt-1 text-xs theme-text-muted">
                              Coba ubah kata kunci pencarian atau muat ulang
                              data.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        tabungan.map((item, index) => (
                          <tr
                            key={item.id}
                            className="hover:bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] transition"
                          >
                            <td className="px-4 py-4 text-xs theme-text-muted">
                              {(currentPage - 1) * limit + index + 1}
                            </td>
                            <td className="px-4 py-4">
                              <p className="text-sm font-semibold theme-text">
                                {item.siswa?.namaLengkap || "-"}
                              </p>
                              <p className="mt-1 text-[11px] theme-text-muted">
                                NISN: {item.siswa?.nisn || "-"}
                              </p>
                            </td>
                            <td className="px-4 py-4 text-xs theme-text-secondary">
                              {item.siswa?.nis || "-"}
                            </td>
                            <td className="px-4 py-4 text-xs font-bold tabular-nums theme-text">
                              {formatRupiah(item.saldo)}
                            </td>
                            <td className="px-4 py-4">
                              <StatusBadge status={item.status} />
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex justify-center gap-1.5">
                                <button
                                  type="button"
                                  title="Lihat detail"
                                  onClick={() => openDetail(item)}
                                  className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border theme-border theme-card px-3 text-xs font-medium theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] transition"
                                >
                                  <Eye size={14} />
                                  Detail
                                </button>
                                <button
                                  type="button"
                                  title="Setor tabungan siswa"
                                  onClick={() => openTransaction("setor", item)}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg border theme-border bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 transition hover:opacity-80"
                                >
                                  <ArrowDownCircle size={15} />
                                </button>
                                <button
                                  type="button"
                                  title="Tarik tabungan siswa"
                                  onClick={() => openTransaction("tarik", item)}
                                  className="flex h-8 w-8 items-center justify-center rounded-lg border theme-border bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 transition hover:opacity-80"
                                >
                                  <ArrowUpCircle size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION */}
                <div className="flex flex-col gap-3 border-t theme-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <p className="text-xs theme-text-muted">
                    Total{" "}
                    {Number(meta?.total || 0).toLocaleString("id-ID")} data ·{" "}
                    Halaman {currentPage} dari {totalPages}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentPage <= 1 || loading}
                      onClick={() =>
                        setPage((previous) => Math.max(1, previous - 1))
                      }
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border theme-border theme-card px-3 text-xs font-medium theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] disabled:cursor-not-allowed disabled:opacity-40 transition"
                    >
                      <ChevronLeft size={14} />
                      Sebelumnya
                    </button>
                    <button
                      type="button"
                      disabled={currentPage >= totalPages || loading}
                      onClick={() =>
                        setPage((previous) =>
                          Math.min(totalPages, previous + 1)
                        )
                      }
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border theme-border theme-card px-3 text-xs font-medium theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] disabled:cursor-not-allowed disabled:opacity-40 transition"
                    >
                      Berikutnya
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </section>

              {/* RINGKASAN LAPORAN */}
              <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50/70 p-5 text-sm text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200">
                <Receipt size={20} className="mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold">Ringkasan laporan tabungan</h3>
                  <p className="mt-1 text-xs leading-5">
                    Total saldo seluruh rekening berdasarkan laporan:{" "}
                    <strong className="font-semibold">
                      {formatRupiah(laporan.totalSaldoSemuaSiswa)}
                    </strong>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}