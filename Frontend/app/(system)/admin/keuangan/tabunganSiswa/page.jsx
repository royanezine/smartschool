"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  Loader2,
  TrendingUp,
  TrendingDown,
  Users,
  Plus,
  Minus,
  History,
} from "lucide-react";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  getTabungan,
  getDetailTabungan,
  getMutasiTabungan,
  getLaporanTabungan,
  setorTabungan,
  tarikTabungan,
} from "@/services/tabungan.service";

const EMPTY_META = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

const INITIAL_FORM = {
  siswaId: "",
  akunKasId: "",
  jumlah: "",
  tanggal: new Date().toISOString().slice(0, 10),
  keterangan: "",
};

function formatRupiah(value) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatTanggal(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

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
  const normalized = String(status || "").toLowerCase();

  const isActive = ["aktif", "active"].includes(normalized);

  const className = isActive
    ? "theme-success"
    : "theme-card-soft theme-text-secondary";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border theme-border px-2.5 py-1 text-[11px] font-semibold ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status || "-"}
    </span>
  );
}

function StatCard({ title, value, description, icon: Icon, loading }) {
  return (
    <div className="theme-card rounded-2xl border p-4 shadow-sm transition hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="theme-text-muted text-xs font-medium">{title}</p>

          {loading ? (
            <div className="theme-card-soft mt-3 h-7 w-24 animate-pulse rounded-lg" />
          ) : (
            <p className="theme-text mt-2 break-words text-xl font-bold sm:text-2xl">
              {value}
            </p>
          )}

          <p className="theme-text-placeholder mt-1 text-[11px]">
            {description}
          </p>
        </div>

        <div className="theme-card-soft theme-border flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border">
          <Icon size={18} className="theme-text-secondary" />
        </div>
      </div>
    </div>
  );
}

export default function TabunganSiswaPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedTabungan, setSelectedTabungan] = useState(null);
  const [detail, setDetail] = useState(null);
  const [mutasi, setMutasi] = useState([]);
  const [mutasiMeta, setMutasiMeta] = useState(EMPTY_META);

  const [transactionOpen, setTransactionOpen] = useState(false);
  const [transactionType, setTransactionType] = useState("setor");
  const [form, setForm] = useState(INITIAL_FORM);

  // =====================================================
  // LOAD DATA
  // =====================================================

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

  // =====================================================
  // SEARCH
  // =====================================================

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

  // =====================================================
  // DETAIL
  // =====================================================

  async function openDetail(item) {
    if (!item?.siswaId) {
      setError("ID siswa tidak ditemukan pada data tabungan.");
      return;
    }

    setSelectedTabungan(item);
    setDetailOpen(true);
    setDetailLoading(true);
    setDetail(null);
    setMutasi([]);
    setError("");

    try {
      const [detailResponse, mutasiResponse] = await Promise.all([
        getDetailTabungan(item.siswaId),
        getMutasiTabungan(item.siswaId, { page: 1, limit: 10 }),
      ]);

      setDetail(detailResponse);

      setMutasi(
        Array.isArray(mutasiResponse?.data) ? mutasiResponse.data : []
      );

      setMutasiMeta(mutasiResponse?.meta || EMPTY_META);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDetailLoading(false);
    }
  }

  function closeDetail() {
    setDetailOpen(false);
    setSelectedTabungan(null);
    setDetail(null);
    setMutasi([]);
    setMutasiMeta(EMPTY_META);
  }

  // =====================================================
  // MODAL SETOR / TARIK
  // =====================================================

  function openTransaction(type, item = null) {
    setTransactionType(type);
    setForm({
      ...INITIAL_FORM,
      siswaId: item?.siswaId || "",
      tanggal: new Date().toISOString().slice(0, 10),
    });

    setSuccess("");
    setError("");
    setTransactionOpen(true);
  }

  function closeTransaction() {
    if (submitting) return;

    setTransactionOpen(false);
    setForm(INITIAL_FORM);
  }

  function updateForm(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function submitTransaction(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const jumlah = Number(form.jumlah);

    if (!form.siswaId.trim()) {
      setError("ID siswa wajib diisi.");
      return;
    }

    if (!form.akunKasId.trim()) {
      setError("ID akun kas wajib diisi.");
      return;
    }

    if (!Number.isFinite(jumlah) || jumlah <= 0) {
      setError("Jumlah transaksi harus lebih dari 0.");
      return;
    }

    if (!form.tanggal) {
      setError("Tanggal transaksi wajib diisi.");
      return;
    }

    const payload = {
      siswaId: form.siswaId.trim(),
      akunKasId: form.akunKasId.trim(),
      jumlah,
      tanggal: form.tanggal,
      ...(form.keterangan.trim()
        ? { keterangan: form.keterangan.trim() }
        : {}),
    };

    setSubmitting(true);

    try {
      if (transactionType === "setor") {
        await setorTabungan(payload);
        setSuccess("Setoran tabungan berhasil disimpan.");
      } else {
        await tarikTabungan(payload);
        setSuccess("Penarikan tabungan berhasil disimpan.");
      }

      setTransactionOpen(false);
      setForm(INITIAL_FORM);

      await Promise.all([loadTabungan(), loadLaporan()]);

      if (detailOpen && selectedTabungan?.siswaId) {
        await openDetail(selectedTabungan);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const totalPages = Math.max(Number(meta?.totalPages || 1), 1);
  const currentPage = Number(meta?.page || page);
  const selectedStudent = selectedTabungan?.siswa;

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
    // ✅ Root flex row — Sidebar & kolom kanan sejajar full height
    <div className="theme-page flex h-screen w-full overflow-hidden">
      {/* Sidebar full height, tidak ikut scroll */}
      <Sidebar
        role="admin_sekolah"
        activeMenu="tabungan-siswa"
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((value) => !value)}
      />

      {/* Kolom kanan: Header di atas + Main scroll di bawah */}
      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header hanya di area kanan sidebar */}
        <Header
          title="Tabungan Siswa"
          onMenuClick={() => setSidebarOpen((value) => !value)}
        />

        {/* Hanya main yang scroll */}
        <main className="flex-1 overflow-y-auto">
          <div className="space-y-5 p-4 sm:p-6 lg:p-8">
            {/* HEADER HALAMAN */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="theme-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
                  <Wallet size={20} />
                </div>

                <div>
                  <p className="theme-text-placeholder text-[10px] font-semibold uppercase tracking-wide">
                    Keuangan / Tabungan Siswa
                  </p>

                  <h1 className="theme-text mt-1 text-xl font-bold sm:text-2xl">
                    Tabungan Siswa
                  </h1>

                  <p className="theme-text-secondary mt-1 text-xs sm:text-sm">
                    Kelola saldo tabungan, setoran, penarikan, dan mutasi
                    tabungan siswa.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={refreshData}
                disabled={refreshing || loading}
                className="theme-card-soft theme-text-secondary theme-border inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition hover:opacity-80 disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
                Muat Ulang
              </button>
            </div>

            {/* NOTIFIKASI */}
            {error && (
              <div className="theme-danger flex items-start gap-3 rounded-xl border p-4">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />

                <p className="flex-1 text-sm">{error}</p>

                <button
                  type="button"
                  onClick={() => setError("")}
                  aria-label="Tutup pesan error"
                  className="hover:opacity-70"
                >
                  <X size={17} />
                </button>
              </div>
            )}

            {success && (
              <div className="theme-success flex items-start gap-3 rounded-xl border p-4">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />

                <p className="flex-1 text-sm">{success}</p>

                <button
                  type="button"
                  onClick={() => setSuccess("")}
                  aria-label="Tutup pesan sukses"
                  className="hover:opacity-70"
                >
                  <X size={17} />
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

            {/* TABEL TABUNGAN */}
            <section className="theme-card overflow-hidden rounded-2xl border shadow-sm">
              <div className="theme-border flex flex-col gap-4 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div>
                  <h2 className="theme-text text-sm font-bold">
                    Daftar Tabungan
                  </h2>

                  <p className="theme-text-muted mt-1 text-xs">
                    Menampilkan rekening tabungan siswa sesuai data backend.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openTransaction("setor")}
                    className="theme-primary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:opacity-90"
                  >
                    <Plus size={17} />
                    Setor
                  </button>

                  <button
                    type="button"
                    onClick={() => openTransaction("tarik")}
                    className="theme-card-soft theme-text-secondary theme-border inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition hover:opacity-80"
                  >
                    <Minus size={17} />
                    Tarik
                  </button>
                </div>
              </div>

              {/* SEARCH */}
              <form
                onSubmit={handleSearch}
                className="theme-border flex flex-col gap-3 border-b p-4 sm:flex-row sm:p-5"
              >
                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="theme-text-placeholder absolute left-3 top-1/2 -translate-y-1/2"
                  />

                  <input
                    type="text"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Cari nama siswa atau NIS..."
                    className="theme-input h-11 w-full rounded-xl border pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />
                </div>

                <button
                  type="submit"
                  className="theme-primary inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold shadow-sm transition hover:opacity-90"
                >
                  Cari
                </button>

                {search && (
                  <button
                    type="button"
                    onClick={resetSearch}
                    className="theme-card-soft theme-text-secondary theme-border inline-flex h-11 items-center justify-center rounded-xl border px-4 text-sm font-semibold transition hover:opacity-80"
                  >
                    Reset
                  </button>
                )}
              </form>

              {/* DATA */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-sm">
                  <thead>
                    <tr className="theme-primary">
                      <th className="px-4 py-3 text-left text-xs font-semibold">
                        No.
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold">
                        Nama Siswa
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold">
                        NIS
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold">
                        Saldo
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-semibold">
                        Status
                      </th>

                      <th className="px-4 py-3 text-center text-xs font-semibold">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <tr
                          key={index}
                          className="theme-border border-b"
                        >
                          {Array.from({ length: 6 }).map((__, cell) => (
                            <td key={cell} className="px-4 py-4">
                              <div className="theme-card-soft h-4 w-24 animate-pulse rounded" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : tabungan.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-14 text-center">
                          <div className="theme-card-soft mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                            <Wallet
                              size={21}
                              className="theme-text-muted"
                            />
                          </div>

                          <p className="theme-text mt-3 text-sm font-bold">
                            Data tabungan tidak ditemukan
                          </p>

                          <p className="theme-text-secondary mt-1 text-xs">
                            Coba ubah kata kunci pencarian atau muat ulang
                            data.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      tabungan.map((item, index) => (
                        <tr
                          key={item.id}
                          className="theme-border theme-table-hover border-b transition-colors"
                        >
                          <td className="theme-text-secondary px-4 py-4 text-xs">
                            {(currentPage - 1) * limit + index + 1}
                          </td>

                          <td className="px-4 py-4">
                            <p className="theme-text text-sm font-semibold">
                              {item.siswa?.namaLengkap || "-"}
                            </p>

                            <p className="theme-text-placeholder mt-1 text-[11px]">
                              NISN: {item.siswa?.nisn || "-"}
                            </p>
                          </td>

                          <td className="theme-text-secondary px-4 py-4 text-xs">
                            {item.siswa?.nis || "-"}
                          </td>

                          <td className="theme-text px-4 py-4 text-xs font-bold">
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
                                className="theme-card-soft theme-text-secondary theme-border inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition hover:opacity-80"
                              >
                                <Eye size={14} />
                                Detail
                              </button>

                              <button
                                type="button"
                                title="Setor tabungan siswa"
                                onClick={() => openTransaction("setor", item)}
                                className="theme-success flex h-8 w-8 items-center justify-center rounded-lg border theme-border transition hover:opacity-80"
                              >
                                <ArrowDownCircle size={15} />
                              </button>

                              <button
                                type="button"
                                title="Tarik tabungan siswa"
                                onClick={() => openTransaction("tarik", item)}
                                className="theme-warning flex h-8 w-8 items-center justify-center rounded-lg border theme-border transition hover:opacity-80"
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
              <div className="theme-border flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <p className="theme-text-secondary text-xs">
                  Total {Number(meta?.total || 0).toLocaleString("id-ID")} data
                  {" · "}Halaman {currentPage} dari {totalPages}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1 || loading}
                    onClick={() =>
                      setPage((previous) => Math.max(1, previous - 1))
                    }
                    className="theme-card-soft theme-text-secondary theme-border inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
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
                    className="theme-card-soft theme-text-secondary theme-border inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Berikutnya
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </section>

            {/* RINGKASAN LAPORAN */}
            <div className="theme-info rounded-2xl border p-5">
              <div className="flex items-start gap-3">
                <Receipt size={20} className="mt-0.5 shrink-0" />

                <div>
                  <h3 className="theme-text text-sm font-bold">
                    Ringkasan laporan tabungan
                  </h3>

                  <p className="theme-text-secondary mt-1 text-xs">
                    Total saldo seluruh rekening berdasarkan laporan:{" "}
                    <strong className="theme-text">
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

      {/* =================================================
          MODAL DETAIL DAN MUTASI
      ================================================== */}
      {detailOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDetail();
          }}
        >
          <section className="theme-card my-auto max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border shadow-xl">
            <div className="theme-border flex items-center justify-between border-b p-5">
              <div>
                <h2 className="theme-text text-lg font-bold">
                  Detail Tabungan Siswa
                </h2>

                <p className="theme-text-secondary mt-1 text-xs">
                  Informasi saldo dan riwayat mutasi tabungan.
                </p>
              </div>

              <button
                type="button"
                onClick={closeDetail}
                className="theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg hover:opacity-70"
                aria-label="Tutup detail"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              {detailLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2
                    size={24}
                    className="theme-text-secondary animate-spin"
                  />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="theme-card-soft theme-border rounded-xl border p-4">
                      <p className="theme-text-placeholder text-[10px] font-semibold uppercase tracking-wide">
                        Nama siswa
                      </p>

                      <p className="theme-text mt-2 text-sm font-semibold">
                        {detail?.siswa?.namaLengkap ||
                          selectedStudent?.namaLengkap ||
                          "-"}
                      </p>
                    </div>

                    <div className="theme-card-soft theme-border rounded-xl border p-4">
                      <p className="theme-text-placeholder text-[10px] font-semibold uppercase tracking-wide">
                        NIS
                      </p>

                      <p className="theme-text mt-2 text-sm font-semibold">
                        {detail?.siswa?.nis || selectedStudent?.nis || "-"}
                      </p>
                    </div>

                    <div className="theme-info rounded-xl border p-4">
                      <p className="theme-text-secondary text-[10px] font-semibold uppercase tracking-wide">
                        Saldo tabungan
                      </p>

                      <p className="theme-text mt-2 text-lg font-bold">
                        {formatRupiah(
                          detail?.saldo ?? selectedTabungan?.saldo ?? 0
                        )}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="theme-text mb-3 flex items-center gap-2 text-sm font-bold">
                      <History size={16} />
                      Riwayat Mutasi
                    </h3>

                    <div className="theme-border overflow-x-auto rounded-xl border">
                      <table className="w-full min-w-[650px] border-collapse text-sm">
                        <thead>
                          <tr className="theme-primary">
                            <th className="px-4 py-3 text-left text-xs font-semibold">
                              Tanggal
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold">
                              Nomor Transaksi
                            </th>

                            <th className="px-4 py-3 text-left text-xs font-semibold">
                              Jenis
                            </th>

                            <th className="px-4 py-3 text-right text-xs font-semibold">
                              Jumlah
                            </th>

                            <th className="px-4 py-3 text-right text-xs font-semibold">
                              Saldo Sesudah
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {mutasi.length === 0 ? (
                            <tr>
                              <td
                                colSpan={5}
                                className="theme-text-muted px-4 py-8 text-center text-xs"
                              >
                                Belum ada mutasi tabungan.
                              </td>
                            </tr>
                          ) : (
                            mutasi.map((item) => {
                              const isSetor = item.jenis === "setor";

                              return (
                                <tr
                                  key={item.id}
                                  className="theme-border border-b"
                                >
                                  <td className="theme-text-secondary px-4 py-3 text-xs">
                                    {formatTanggal(item.tanggal)}
                                  </td>

                                  <td className="theme-text px-4 py-3 text-xs font-semibold">
                                    {item.nomorTransaksi || "-"}
                                  </td>

                                  <td className="px-4 py-3">
                                    <span
                                      className={`inline-flex items-center gap-1.5 rounded-full border theme-border px-2.5 py-1 text-[11px] font-semibold ${
                                        isSetor
                                          ? "theme-success"
                                          : "theme-warning"
                                      }`}
                                    >
                                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                      {isSetor ? "Setoran" : "Penarikan"}
                                    </span>
                                  </td>

                                  <td
                                    className={`px-4 py-3 text-right text-xs font-bold ${
                                      isSetor
                                        ? "theme-success"
                                        : "theme-warning"
                                    }`}
                                  >
                                    {isSetor ? "+" : "-"}
                                    {formatRupiah(item.jumlah)}
                                  </td>

                                  <td className="theme-text px-4 py-3 text-right text-xs font-semibold">
                                    {formatRupiah(item.saldoSesudah)}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="theme-text-muted mt-3 flex justify-between text-[11px]">
                      <span>
                        Total {mutasiMeta?.total || mutasi.length} mutasi
                      </span>
                      <span>
                        Halaman {mutasiMeta?.page || 1} dari{" "}
                        {mutasiMeta?.totalPages || 1}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        openTransaction("setor", selectedTabungan)
                      }
                      className="theme-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:opacity-90"
                    >
                      <Plus size={15} />
                      Setor
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openTransaction("tarik", selectedTabungan)
                      }
                      className="theme-card-soft theme-text-secondary theme-border inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition hover:opacity-80"
                    >
                      <Minus size={15} />
                      Tarik
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      )}

      {/* =================================================
          MODAL SETOR / TARIK
      ================================================== */}
      {transactionOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !submitting) {
              closeTransaction();
            }
          }}
        >
          <section className="theme-card my-auto w-full max-w-lg rounded-2xl border shadow-xl">
            <div className="theme-border flex items-center justify-between border-b p-5">
              <div>
                <h2 className="theme-text text-lg font-bold">
                  {transactionType === "setor"
                    ? "Setor Tabungan"
                    : "Tarik Tabungan"}
                </h2>

                <p className="theme-text-secondary mt-1 text-xs">
                  {transactionType === "setor"
                    ? "Catat setoran ke rekening tabungan siswa."
                    : "Catat penarikan dari rekening tabungan siswa."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeTransaction}
                disabled={submitting}
                className="theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg hover:opacity-70 disabled:opacity-50"
                aria-label="Tutup formulir transaksi"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submitTransaction} className="space-y-4 p-5">
              <div>
                <label className="theme-text-secondary mb-1.5 block text-xs font-semibold">
                  ID Siswa <span className="theme-danger-text">*</span>
                </label>

                <input
                  required
                  value={form.siswaId}
                  onChange={(event) =>
                    updateForm("siswaId", event.target.value)
                  }
                  placeholder="Masukkan ID siswa dari database"
                  className="theme-input h-11 w-full rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />

                <p className="theme-text-placeholder mt-1 text-[11px]">
                  Gunakan ID siswa yang sesuai dengan data backend.
                </p>
              </div>

              <div>
                <label className="theme-text-secondary mb-1.5 block text-xs font-semibold">
                  ID Akun Kas <span className="theme-danger-text">*</span>
                </label>

                <input
                  required
                  value={form.akunKasId}
                  onChange={(event) =>
                    updateForm("akunKasId", event.target.value)
                  }
                  placeholder="Masukkan ID akun kas aktif"
                  className="theme-input h-11 w-full rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />

                <p className="theme-text-placeholder mt-1 text-[11px]">
                  Masukkan ID akun kas aktif yang valid untuk sekolah ini.
                </p>
              </div>

              <div>
                <label className="theme-text-secondary mb-1.5 block text-xs font-semibold">
                  Jumlah (Rp) <span className="theme-danger-text">*</span>
                </label>

                <input
                  required
                  type="number"
                  min="1"
                  step="1"
                  value={form.jumlah}
                  onChange={(event) =>
                    updateForm("jumlah", event.target.value)
                  }
                  placeholder="Contoh: 50000"
                  className="theme-input h-11 w-full rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </div>

              <div>
                <label className="theme-text-secondary mb-1.5 block text-xs font-semibold">
                  Tanggal transaksi{" "}
                  <span className="theme-danger-text">*</span>
                </label>

                <input
                  required
                  type="date"
                  value={form.tanggal}
                  onChange={(event) =>
                    updateForm("tanggal", event.target.value)
                  }
                  className="theme-input h-11 w-full rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </div>

              <div>
                <label className="theme-text-secondary mb-1.5 block text-xs font-semibold">
                  Keterangan
                </label>

                <textarea
                  rows={3}
                  value={form.keterangan}
                  onChange={(event) =>
                    updateForm("keterangan", event.target.value)
                  }
                  placeholder="Keterangan transaksi (opsional)"
                  className="theme-input w-full resize-y rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              </div>

              {error && (
                <div className="theme-danger rounded-xl border p-3 text-xs">
                  {error}
                </div>
              )}

              <div className="theme-border flex justify-end gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={closeTransaction}
                  disabled={submitting}
                  className="theme-card-soft theme-text-secondary theme-border inline-flex items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-semibold transition hover:opacity-80 disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 ${
                    transactionType === "setor"
                      ? "theme-primary"
                      : "theme-warning"
                  }`}
                >
                  {submitting && (
                    <Loader2 size={15} className="animate-spin" />
                  )}
                  {submitting
                    ? "Memproses..."
                    : transactionType === "setor"
                      ? "Simpan Setoran"
                      : "Simpan Penarikan"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}