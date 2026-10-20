"use client";

import { useMemo, useState } from "react";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Receipt,
  Search,
  RefreshCw,
  Download,
  Plus,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar,
  CreditCard,
  ArrowDownCircle,
  ArrowUpCircle,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Building2,
  Printer,
  Loader2,
} from "lucide-react";

/* ============================================================
   THEME HELPERS
============================================================ */

const themeCardShadow =
  "shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_6%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themePrimaryText = "text-[var(--color-primary)]";

const themePrimarySurface =
  "bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";

/* ============================================================
   FORMATTER
============================================================ */

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

/* ============================================================
   DUMMY DATA
============================================================ */

const DUMMY_LAPORAN = {
  totalPemasukan: 45250000,
  totalPengeluaran: 28750000,
  saldoAkhir: 16500000,
  jumlahTransaksi: 148,
  pemasukanBulanIni: 8250000,
  pengeluaranBulanIni: 5400000,
};

const DUMMY_TRANSAKSI = [
  {
    id: 1,
    tanggal: "2026-10-15",
    nomor: "TRX-20261015-001",
    kategori: "SPP",
    keterangan: "Pembayaran SPP Oktober - Ahmad Fauzi",
    jenis: "pemasukan",
    jumlah: 750000,
    status: "lunas",
    akun: "Kas Utama",
  },
  {
    id: 2,
    tanggal: "2026-10-15",
    nomor: "TRX-20261015-002",
    kategori: "Operasional",
    keterangan: "Pembelian ATK kantor",
    jenis: "pengeluaran",
    jumlah: 450000,
    status: "lunas",
    akun: "Kas Utama",
  },
  {
    id: 3,
    tanggal: "2026-10-14",
    nomor: "TRX-20261014-003",
    kategori: "SPP",
    keterangan: "Pembayaran SPP Oktober - Siti Nurhaliza",
    jenis: "pemasukan",
    jumlah: 750000,
    status: "lunas",
    akun: "Kas Utama",
  },
  {
    id: 4,
    tanggal: "2026-10-14",
    nomor: "TRX-20261014-004",
    kategori: "Gaji",
    keterangan: "Pembayaran honor guru ekstrakurikuler",
    jenis: "pengeluaran",
    jumlah: 2400000,
    status: "lunas",
    akun: "Bank BCA",
  },
  {
    id: 5,
    tanggal: "2026-10-13",
    nomor: "TRX-20261013-005",
    kategori: "SPP",
    keterangan: "Pembayaran SPP Oktober - Budi Santoso",
    jenis: "pemasukan",
    jumlah: 750000,
    status: "menunggu",
    akun: "Kas Utama",
  },
  {
    id: 6,
    tanggal: "2026-10-12",
    nomor: "TRX-20261012-006",
    kategori: "Pemeliharaan",
    keterangan: "Perbaikan AC ruang guru",
    jenis: "pengeluaran",
    jumlah: 850000,
    status: "lunas",
    akun: "Kas Utama",
  },
  {
    id: 7,
    tanggal: "2026-10-11",
    nomor: "TRX-20261011-007",
    kategori: "Lainnya",
    keterangan: "Donasi dari alumni",
    jenis: "pemasukan",
    jumlah: 5000000,
    status: "lunas",
    akun: "Bank BCA",
  },
  {
    id: 8,
    tanggal: "2026-10-10",
    nomor: "TRX-20261010-008",
    kategori: "Operasional",
    keterangan: "Pembayaran listrik dan air",
    jenis: "pengeluaran",
    jumlah: 1850000,
    status: "lunas",
    akun: "Bank BCA",
  },
];

const DUMMY_AKUN = [
  {
    id: 1,
    nama: "Kas Utama",
    jenis: "kas",
    saldo: 8500000,
    nomor: "-",
  },
  {
    id: 2,
    nama: "Bank BCA",
    jenis: "bank",
    saldo: 8000000,
    nomor: "1234567890",
  },
];

/* ============================================================
   PAGE
============================================================ */

export default function KeuanganPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [search, setSearch] = useState("");
  const [jenisFilter, setJenisFilter] = useState("semua");
  const [kategoriFilter, setKategoriFilter] = useState("semua");

  const [page, setPage] = useState(1);
  const limit = 5;

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formType, setFormType] = useState("pemasukan");
  const [form, setForm] = useState({
    tanggal: new Date().toISOString().slice(0, 10),
    kategori: "",
    jumlah: "",
    keterangan: "",
    akun: "Kas Utama",
  });

  const filteredData = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return DUMMY_TRANSAKSI.filter((item) => {
      const matchSearch =
        !keyword ||
        item.keterangan.toLowerCase().includes(keyword) ||
        item.nomor.toLowerCase().includes(keyword);

      const matchJenis =
        jenisFilter === "semua" || item.jenis === jenisFilter;

      const matchKategori =
        kategoriFilter === "semua" ||
        item.kategori === kategoriFilter;

      return matchSearch && matchJenis && matchKategori;
    });
  }, [search, jenisFilter, kategoriFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / limit));
  const currentPage = Math.min(page, totalPages);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * limit,
    currentPage * limit
  );

  const openDetail = (item) => {
    setSelectedTransaksi(item);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setSelectedTransaksi(null);
  };

  const openForm = (type) => {
    setFormType(type);
    setForm({
      tanggal: new Date().toISOString().slice(0, 10),
      kategori: "",
      jumlah: "",
      keterangan: "",
      akun: "Kas Utama",
    });
    setFormOpen(true);
  };

  const closeForm = () => setFormOpen(false);

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    setFormOpen(false);
  };

  const toggleSidebar = () => setIsCollapsed((v) => !v);

  return (
    // ✅ Root flex row — sidebar + konten sejajar full height
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="keuangan"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      {/* ✅ Kolom kanan: header di atas + main scroll */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* ✅ Header shrink-0 → tetap di atas */}
        <div className="shrink-0">
          <Header
            toggleSidebar={toggleSidebar}
            notifications={[]}
            user={{
              name: "Bendahara Sekolah",
              email: "bendahara@smartschool.com",
              avatar: "BD",
            }}
          />
        </div>

        {/* ✅ Main min-w-0 flex-1 overflow-y-auto → hanya ini scroll */}
        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="w-full space-y-5 p-4 sm:p-6 lg:p-8">

            {/* ==================================================
                PAGE HEADER
            ================================================== */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_70%,var(--color-info)))] text-[var(--color-card)] shadow-[0_4px_14px_color-mix(in_srgb,var(--color-primary)_25%,transparent)]">
                  <Wallet size={20} />
                </div>

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">
                    Keuangan / Bendahara
                  </p>

                  <h1 className="mt-0.5 text-xl font-bold theme-text sm:text-2xl">
                    Manajemen Keuangan
                  </h1>

                  <p className="mt-1 text-xs leading-relaxed theme-text-secondary sm:text-sm">
                    Kelola pemasukan, pengeluaran, dan laporan keuangan sekolah.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border ${themeNeutralBorder} theme-card px-4 text-sm font-semibold theme-text-secondary transition ${themeNeutralHover}`}
                >
                  <Download size={15} />
                  Export
                </button>

                <button
                  type="button"
                  onClick={() => openForm("pengeluaran")}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)] px-4 text-sm font-semibold text-[var(--color-danger)] transition hover:bg-[color-mix(in_srgb,var(--color-danger)_18%,transparent)]"
                >
                  <ArrowUpCircle size={15} />
                  Pengeluaran
                </button>

                <button
                  type="button"
                  onClick={() => openForm("pemasukan")}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_75%,var(--color-success)))] px-4 text-sm font-semibold text-[var(--color-card)] shadow-[0_4px_14px_color-mix(in_srgb,var(--color-primary)_25%,transparent)] transition hover:opacity-90"
                >
                  <Plus size={15} />
                  Pemasukan
                </button>
              </div>
            </div>

            {/* ==================================================
                STAT CARDS
            ================================================== */}

            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              <StatCard
                icon={Wallet}
                label="Saldo Akhir"
                value={formatRupiah(DUMMY_LAPORAN.saldoAkhir)}
                description="Saldo semua akun"
                accent="primary"
              />

              <StatCard
                icon={TrendingUp}
                label="Total Pemasukan"
                value={formatRupiah(DUMMY_LAPORAN.totalPemasukan)}
                description="Semua periode"
                accent="success"
              />

              <StatCard
                icon={TrendingDown}
                label="Total Pengeluaran"
                value={formatRupiah(DUMMY_LAPORAN.totalPengeluaran)}
                description="Semua periode"
                accent="danger"
              />

              <StatCard
                icon={Receipt}
                label="Jumlah Transaksi"
                value={DUMMY_LAPORAN.jumlahTransaksi.toLocaleString("id-ID")}
                description="Tercatat di sistem"
                accent="info"
              />

              <StatCard
                icon={ArrowDownCircle}
                label="Pemasukan Bulan Ini"
                value={formatRupiah(DUMMY_LAPORAN.pemasukanBulanIni)}
                description="Oktober 2026"
                accent="success"
              />

              <StatCard
                icon={ArrowUpCircle}
                label="Pengeluaran Bulan Ini"
                value={formatRupiah(DUMMY_LAPORAN.pengeluaranBulanIni)}
                description="Oktober 2026"
                accent="warning"
              />
            </section>

            {/* ==================================================
                AKUN KAS
            ================================================== */}

            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {DUMMY_AKUN.map((akun) => (
                <div
                  key={akun.id}
                  className={`group relative overflow-hidden rounded-2xl border ${themeNeutralBorder} theme-card p-4 ${themeCardShadow} transition hover:-translate-y-0.5 hover:shadow-md`}
                >
                  {/* Accent bar tipis */}
                  <div
                    className={`absolute inset-x-0 top-0 h-0.5 ${
                      akun.jenis === "bank"
                        ? "bg-[var(--color-info)]"
                        : "bg-[var(--color-primary)]"
                    }`}
                  />

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          akun.jenis === "bank"
                            ? "bg-[color-mix(in_srgb,var(--color-info)_12%,transparent)] text-[var(--color-info)]"
                            : `${themePrimarySurface} ${themePrimaryText}`
                        }`}
                      >
                        {akun.jenis === "bank" ? (
                          <CreditCard size={18} />
                        ) : (
                          <Wallet size={18} />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold theme-text">
                          {akun.nama}
                        </p>

                        <p className="mt-0.5 text-xs theme-text-muted">
                          {akun.jenis === "bank"
                            ? `No. ${akun.nomor}`
                            : "Kas tunai"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={`mt-3 border-t ${themeDivider} pt-3`}>
                    <p className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">
                      Saldo
                    </p>

                    <p className="mt-1 text-lg font-bold theme-text">
                      {formatRupiah(akun.saldo)}
                    </p>
                  </div>
                </div>
              ))}

              <div
                className={`flex items-center justify-center rounded-2xl border border-dashed ${themeNeutralBorder} p-4 transition ${themeNeutralHover} cursor-pointer hover:border-[var(--color-primary)]`}
              >
                <div className="text-center">
                  <div
                    className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySurface} ${themePrimaryText}`}
                  >
                    <Plus size={18} />
                  </div>

                  <p className="mt-2 text-xs font-semibold theme-text-secondary">
                    Tambah Akun
                  </p>
                </div>
              </div>
            </section>

            {/* ==================================================
                TABEL TRANSAKSI
            ================================================== */}

            <section
              className={`overflow-hidden rounded-2xl border ${themeNeutralBorder} theme-card ${themeCardShadow}`}
            >
              <div
                className={`flex flex-col gap-4 border-b ${themeDivider} p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5`}
              >
                <div>
                  <h2 className="text-sm font-bold theme-text sm:text-base">
                    Riwayat Transaksi
                  </h2>

                  <p className="mt-1 text-xs theme-text-muted">
                    Daftar pemasukan dan pengeluaran terbaru.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`inline-flex h-9 items-center gap-2 rounded-lg border ${themeNeutralBorder} theme-card px-3 text-xs font-semibold theme-text-secondary transition ${themeNeutralHover}`}
                  >
                    <Calendar size={14} />
                    Bulan Ini
                  </button>

                  <button
                    type="button"
                    className={`inline-flex h-9 items-center gap-2 rounded-lg border ${themeNeutralBorder} theme-card px-3 text-xs font-semibold theme-text-secondary transition ${themeNeutralHover}`}
                  >
                    <RefreshCw size={14} />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Filter bar */}
              <div
                className={`flex flex-col gap-3 border-b ${themeDivider} p-4 sm:flex-row sm:items-center`}
              >
                <div className="relative flex-1">
                  <Search
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Cari nomor transaksi atau keterangan..."
                    className={`h-10 w-full rounded-xl border ${themeNeutralBorder} theme-card pl-9 pr-3 text-sm theme-text outline-none transition placeholder:text-[var(--color-text-placeholder)] ${themeFocus}`}
                  />
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative">
                    <Filter
                      size={14}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                    />

                    <select
                      value={jenisFilter}
                      onChange={(e) => {
                        setJenisFilter(e.target.value);
                        setPage(1);
                      }}
                      className={`h-10 cursor-pointer appearance-none rounded-xl border ${themeNeutralBorder} theme-card pl-9 pr-8 text-sm theme-text-secondary outline-none transition ${themeFocus}`}
                    >
                      <option value="semua">Semua Jenis</option>
                      <option value="pemasukan">Pemasukan</option>
                      <option value="pengeluaran">Pengeluaran</option>
                    </select>
                  </div>

                  <select
                    value={kategoriFilter}
                    onChange={(e) => {
                      setKategoriFilter(e.target.value);
                      setPage(1);
                    }}
                    className={`h-10 cursor-pointer rounded-xl border ${themeNeutralBorder} theme-card px-3 text-sm theme-text-secondary outline-none transition ${themeFocus}`}
                  >
                    <option value="semua">Semua Kategori</option>
                    <option value="SPP">SPP</option>
                    <option value="Gaji">Gaji</option>
                    <option value="Operasional">Operasional</option>
                    <option value="Pemeliharaan">Pemeliharaan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead>
                    <tr
                      className={`border-b ${themeDivider} ${themeNeutralSurface}`}
                    >
                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider theme-text-muted">
                        Tanggal
                      </th>
                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider theme-text-muted">
                        Nomor
                      </th>
                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider theme-text-muted">
                        Kategori
                      </th>
                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider theme-text-muted">
                        Keterangan
                      </th>
                      <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider theme-text-muted">
                        Jumlah
                      </th>
                      <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider theme-text-muted">
                        Status
                      </th>
                      <th className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider theme-text-muted">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedData.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-14 text-center">
                          <div
                            className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${themeNeutralSurface}`}
                          >
                            <Receipt
                              size={20}
                              className="theme-text-muted"
                            />
                          </div>

                          <p className="mt-3 text-sm font-semibold theme-text">
                            Tidak ada transaksi
                          </p>

                          <p className="mt-1 text-xs theme-text-muted">
                            Coba ubah filter atau kata kunci pencarian.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((item) => {
                        const isPemasukan =
                          item.jenis === "pemasukan";

                        return (
                          <tr
                            key={item.id}
                            className={`border-b ${themeDivider} transition ${themeNeutralHover}`}
                          >
                            <td className="px-4 py-3 text-xs theme-text-secondary">
                              {formatTanggal(item.tanggal)}
                            </td>

                            <td className="px-4 py-3 text-xs font-medium theme-text">
                              {item.nomor}
                            </td>

                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium ${getKategoriStyle(
                                  item.kategori
                                )}`}
                              >
                                {item.kategori}
                              </span>
                            </td>

                            <td className="px-4 py-3 text-xs theme-text-secondary">
                              {item.keterangan}
                            </td>

                            <td
                              className={`px-4 py-3 text-right text-xs font-bold ${
                                isPemasukan
                                  ? "text-[var(--color-success)]"
                                  : "text-[var(--color-danger)]"
                              }`}
                            >
                              {isPemasukan ? "+" : "-"}
                              {formatRupiah(item.jumlah)}
                            </td>

                            <td className="px-4 py-3">
                              <StatusBadge status={item.status} />
                            </td>

                            <td className="px-4 py-3 text-center">
                              <button
                                type="button"
                                onClick={() => openDetail(item)}
                                title="Lihat detail"
                                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${themeNeutralBorder} theme-card theme-text-muted transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]`}
                              >
                                <Eye size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div
                className={`flex flex-col gap-3 border-t ${themeDivider} px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5`}
              >
                <p className="text-xs theme-text-muted">
                  Menampilkan{" "}
                  <span className="font-semibold theme-text-secondary">
                    {paginatedData.length}
                  </span>{" "}
                  dari{" "}
                  <span className="font-semibold theme-text-secondary">
                    {filteredData.length}
                  </span>{" "}
                  transaksi
                </p>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() =>
                      setPage((p) => Math.max(1, p - 1))
                    }
                    className={`inline-flex h-8 items-center gap-1 rounded-lg border ${themeNeutralBorder} theme-card px-2.5 text-xs font-semibold theme-text-secondary transition ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    <ChevronLeft size={14} />
                    Sebelumnya
                  </button>

                  <span className="px-2 text-xs font-semibold theme-text-secondary">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() =>
                      setPage((p) =>
                        Math.min(totalPages, p + 1)
                      )
                    }
                    className={`inline-flex h-8 items-center gap-1 rounded-lg border ${themeNeutralBorder} theme-card px-2.5 text-xs font-semibold theme-text-secondary transition ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    Berikutnya
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </section>

            {/* ==================================================
                LAPORAN SINGKAT
            ================================================== */}

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div
                className={`relative overflow-hidden rounded-2xl border ${themeNeutralBorder} theme-card p-5 ${themeCardShadow}`}
              >
                <div className="absolute inset-x-0 top-0 h-0.5 bg-[var(--color-primary)]" />

                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySurface} ${themePrimaryText}`}
                  >
                    <FileText size={18} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold theme-text">
                      Laporan Bulanan
                    </h3>

                    <p className="mt-0.5 text-xs theme-text-muted">
                      Rangkuman keuangan bulan ini.
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2.5">
                  <ReportRow
                    label="Pemasukan"
                    value={formatRupiah(
                      DUMMY_LAPORAN.pemasukanBulanIni
                    )}
                    variant="success"
                  />

                  <ReportRow
                    label="Pengeluaran"
                    value={formatRupiah(
                      DUMMY_LAPORAN.pengeluaranBulanIni
                    )}
                    variant="danger"
                  />

                  <div
                    className={`border-t ${themeDivider} pt-2.5`}
                  >
                    <ReportRow
                      label="Selisih"
                      value={formatRupiah(
                        DUMMY_LAPORAN.pemasukanBulanIni -
                          DUMMY_LAPORAN.pengeluaranBulanIni
                      )}
                      variant="primary"
                      bold
                    />
                  </div>
                </div>
              </div>

              <div
                className={`relative overflow-hidden rounded-2xl border ${themeNeutralBorder} theme-card p-5 ${themeCardShadow}`}
              >
                <div className="absolute inset-x-0 top-0 h-0.5 bg-[var(--color-info)]" />

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-info)_12%,transparent)] text-[var(--color-info)]">
                    <Building2 size={18} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold theme-text">
                      Ringkasan Akun
                    </h3>

                    <p className="mt-0.5 text-xs theme-text-muted">
                      Total saldo dari semua akun.
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2.5">
                  {DUMMY_AKUN.map((akun) => (
                    <ReportRow
                      key={akun.id}
                      label={akun.nama}
                      value={formatRupiah(akun.saldo)}
                      variant="neutral"
                    />
                  ))}

                  <div
                    className={`border-t ${themeDivider} pt-2.5`}
                  >
                    <ReportRow
                      label="Total"
                      value={formatRupiah(
                        DUMMY_AKUN.reduce(
                          (sum, a) => sum + a.saldo,
                          0
                        )
                      )}
                      variant="primary"
                      bold
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* =================================================
          MODAL DETAIL TRANSAKSI
      ================================================== */}

      {detailOpen && selectedTransaksi && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeDetail();
          }}
        >
          <div
            className={`theme-card w-full max-w-lg overflow-hidden rounded-2xl ${themeCardShadow}`}
          >
            <div
              className={`relative flex items-start justify-between gap-4 border-b ${themeDivider} p-5`}
            >
              <div className="absolute inset-x-0 top-0 h-0.5 bg-[var(--color-primary)]" />

              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySurface} ${themePrimaryText}`}
                >
                  <Receipt size={18} />
                </div>

                <div>
                  <h2 className="text-base font-bold theme-text">
                    Detail Transaksi
                  </h2>

                  <p className="mt-0.5 text-xs theme-text-muted">
                    {selectedTransaksi.nomor}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeDetail}
                className={`flex h-8 w-8 items-center justify-center rounded-lg theme-text-muted transition ${themeNeutralHover}`}
              >
                <X size={17} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="grid grid-cols-2 gap-3">
                <DetailItem
                  icon={Calendar}
                  label="Tanggal"
                  value={formatTanggal(selectedTransaksi.tanggal)}
                />

                <DetailItem
                  icon={Receipt}
                  label="Kategori"
                  value={selectedTransaksi.kategori}
                />

                <DetailItem
                  icon={Wallet}
                  label="Akun"
                  value={selectedTransaksi.akun}
                />

                <DetailItem
                  icon={FileText}
                  label="Status"
                  value={selectedTransaksi.status}
                />
              </div>

              <div
                className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-4`}
              >
                <p className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">
                  Keterangan
                </p>

                <p className="mt-1.5 text-sm theme-text-secondary">
                  {selectedTransaksi.keterangan}
                </p>
              </div>

              <div
                className={`rounded-xl border p-4 ${
                  selectedTransaksi.jenis === "pemasukan"
                    ? "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_8%,transparent)]"
                    : "border-[color-mix(in_srgb,var(--color-danger)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)]"
                }`}
              >
                <p className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">
                  Jumlah
                </p>

                <p
                  className={`mt-1.5 text-2xl font-bold ${
                    selectedTransaksi.jenis === "pemasukan"
                      ? "text-[var(--color-success)]"
                      : "text-[var(--color-danger)]"
                  }`}
                >
                  {selectedTransaksi.jenis === "pemasukan" ? "+" : "-"}
                  {formatRupiah(selectedTransaksi.jumlah)}
                </p>
              </div>
            </div>

            <div
              className={`flex justify-end gap-2 border-t ${themeDivider} px-5 py-4`}
            >
              <button
                type="button"
                onClick={closeDetail}
                className={`inline-flex h-10 items-center gap-2 rounded-xl border ${themeNeutralBorder} theme-card px-4 text-sm font-semibold theme-text-secondary transition ${themeNeutralHover}`}
              >
                <Printer size={15} />
                Cetak
              </button>

              <button
                type="button"
                onClick={closeDetail}
                className="inline-flex h-10 items-center rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-[var(--color-card)] transition hover:opacity-90"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          MODAL FORM TRANSAKSI
      ================================================== */}

      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeForm();
          }}
        >
          <div
            className={`theme-card w-full max-w-lg overflow-hidden rounded-2xl ${themeCardShadow}`}
          >
            <div
              className={`relative flex items-start justify-between gap-4 border-b ${themeDivider} p-5`}
            >
              <div
                className={`absolute inset-x-0 top-0 h-0.5 ${
                  formType === "pemasukan"
                    ? "bg-[var(--color-success)]"
                    : "bg-[var(--color-danger)]"
                }`}
              />

              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    formType === "pemasukan"
                      ? "bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[var(--color-success)]"
                      : "bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)] text-[var(--color-danger)]"
                  }`}
                >
                  {formType === "pemasukan" ? (
                    <ArrowDownCircle size={18} />
                  ) : (
                    <ArrowUpCircle size={18} />
                  )}
                </div>

                <div>
                  <h2 className="text-base font-bold theme-text">
                    {formType === "pemasukan"
                      ? "Tambah Pemasukan"
                      : "Tambah Pengeluaran"}
                  </h2>

                  <p className="mt-0.5 text-xs theme-text-muted">
                    Catat transaksi baru ke sistem keuangan.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className={`flex h-8 w-8 items-center justify-center rounded-lg theme-text-muted transition ${themeNeutralHover}`}
              >
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 p-5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold theme-text-secondary">
                  Tanggal
                </label>

                <input
                  type="date"
                  value={form.tanggal}
                  onChange={(e) =>
                    updateForm("tanggal", e.target.value)
                  }
                  className={`h-10 w-full rounded-xl border ${themeNeutralBorder} theme-card px-3 text-sm theme-text outline-none transition ${themeFocus}`}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold theme-text-secondary">
                  Kategori
                </label>

                <input
                  type="text"
                  value={form.kategori}
                  onChange={(e) =>
                    updateForm("kategori", e.target.value)
                  }
                  placeholder="Contoh: SPP, Gaji, Operasional"
                  className={`h-10 w-full rounded-xl border ${themeNeutralBorder} theme-card px-3 text-sm theme-text outline-none transition placeholder:text-[var(--color-text-placeholder)] ${themeFocus}`}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold theme-text-secondary">
                  Jumlah (Rp)
                </label>

                <input
                  type="number"
                  min="0"
                  value={form.jumlah}
                  onChange={(e) =>
                    updateForm("jumlah", e.target.value)
                  }
                  placeholder="Contoh: 750000"
                  className={`h-10 w-full rounded-xl border ${themeNeutralBorder} theme-card px-3 text-sm theme-text outline-none transition placeholder:text-[var(--color-text-placeholder)] ${themeFocus}`}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold theme-text-secondary">
                  Akun
                </label>

                <select
                  value={form.akun}
                  onChange={(e) =>
                    updateForm("akun", e.target.value)
                  }
                  className={`h-10 w-full cursor-pointer rounded-xl border ${themeNeutralBorder} theme-card px-3 text-sm theme-text outline-none transition ${themeFocus}`}
                >
                  <option value="Kas Utama">Kas Utama</option>
                  <option value="Bank BCA">Bank BCA</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold theme-text-secondary">
                  Keterangan
                </label>

                <textarea
                  rows={3}
                  value={form.keterangan}
                  onChange={(e) =>
                    updateForm("keterangan", e.target.value)
                  }
                  placeholder="Keterangan transaksi..."
                  className={`w-full resize-none rounded-xl border ${themeNeutralBorder} theme-card px-3 py-2.5 text-sm theme-text outline-none transition placeholder:text-[var(--color-text-placeholder)] ${themeFocus}`}
                />
              </div>

              <div
                className={`flex justify-end gap-2 border-t ${themeDivider} pt-4`}
              >
                <button
                  type="button"
                  onClick={closeForm}
                  className={`inline-flex h-10 items-center rounded-xl border ${themeNeutralBorder} theme-card px-4 text-sm font-semibold theme-text-secondary transition ${themeNeutralHover}`}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-[var(--color-card)] transition hover:opacity-90 ${
                    formType === "pemasukan"
                      ? "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_75%,var(--color-success)))] shadow-[0_4px_14px_color-mix(in_srgb,var(--color-primary)_25%,transparent)]"
                      : "bg-[var(--color-danger)] shadow-[0_4px_14px_color-mix(in_srgb,var(--color-danger)_25%,transparent)]"
                  }`}
                >
                  <Plus size={15} />
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   COMPONENTS
============================================================ */

function StatCard({ icon: Icon, label, value, description, accent = "primary" }) {
  const accentConfig = {
    primary: {
      iconBg: themePrimarySurface,
      iconText: themePrimaryText,
      bar: "bg-[var(--color-primary)]",
    },
    success: {
      iconBg: "bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)]",
      iconText: "text-[var(--color-success)]",
      bar: "bg-[var(--color-success)]",
    },
    danger: {
      iconBg: "bg-[color-mix(in_srgb,var(--color-danger)_12%,transparent)]",
      iconText: "text-[var(--color-danger)]",
      bar: "bg-[var(--color-danger)]",
    },
    warning: {
      iconBg: "bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)]",
      iconText: "text-[var(--color-warning)]",
      bar: "bg-[var(--color-warning)]",
    },
    info: {
      iconBg: "bg-[color-mix(in_srgb,var(--color-info)_12%,transparent)]",
      iconText: "text-[var(--color-info)]",
      bar: "bg-[var(--color-info)]",
    },
  };

  const cfg = accentConfig[accent] || accentConfig.primary;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border ${themeNeutralBorder} theme-card p-4 ${themeCardShadow} transition hover:-translate-y-0.5 hover:shadow-md`}
    >
      <div className={`absolute inset-x-0 top-0 h-0.5 ${cfg.bar}`} />

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wider theme-text-muted">
            {label}
          </p>

          <p className="mt-2 truncate text-lg font-bold theme-text">
            {value}
          </p>

          {description && (
            <p className="mt-1 text-[11px] theme-text-muted">
              {description}
            </p>
          )}
        </div>

        <div
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${cfg.iconBg} ${cfg.iconText}`}
        >
          <Icon size={16} />
        </div>
      </div>
    </div>
  );
}

function getKategoriStyle(kategori) {
  const map = {
    SPP: "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]",
    Gaji: "bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)] text-[var(--color-warning)]",
    Operasional:
      "bg-[color-mix(in_srgb,var(--color-info)_12%,transparent)] text-[var(--color-info)]",
    Pemeliharaan:
      "bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] text-[var(--color-danger)]",
    Lainnya:
      "bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)] theme-text-secondary",
  };

  return map[kategori] || map.Lainnya;
}

function StatusBadge({ status }) {
  const config = {
    lunas: {
      className:
        "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)]",
      icon: CheckCircle2,
    },
    menunggu: {
      className:
        "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] text-[var(--color-warning)]",
      icon: Clock,
    },
    gagal: {
      className:
        "border-[color-mix(in_srgb,var(--color-danger)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] text-[var(--color-danger)]",
      icon: AlertCircle,
    },
  };

  const item = config[status] || {
    className: `${themeNeutralSurface} theme-text-muted border theme-border`,
    icon: AlertCircle,
  };

  const Icon = item.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${item.className}`}
    >
      <Icon size={11} />
      {status}
    </span>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div
      className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-3`}
    >
      <div className="flex items-center gap-2">
        <Icon size={14} className="theme-text-muted" />

        <p className="text-[10px] font-semibold uppercase tracking-wider theme-text-muted">
          {label}
        </p>
      </div>

      <p className="mt-1.5 text-sm font-semibold capitalize theme-text">
        {value || "-"}
      </p>
    </div>
  );
}

function ReportRow({ label, value, variant = "neutral", bold = false }) {
  const valueColor = {
    success: "text-[var(--color-success)]",
    danger: "text-[var(--color-danger)]",
    primary: themePrimaryText,
    neutral: "theme-text-secondary",
  }[variant];

  return (
    <div className="flex items-center justify-between gap-3">
      <span
        className={`text-xs ${
          bold ? "font-semibold theme-text" : "theme-text-muted"
        }`}
      >
        {label}
      </span>

      <span
        className={`text-sm ${valueColor} ${
          bold ? "font-bold" : "font-semibold"
        }`}
      >
        {value}
      </span>
    </div>
  );
}