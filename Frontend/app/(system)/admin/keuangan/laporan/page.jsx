"use client";

import { useState } from "react";
import {
  Download,
  Eye,
  FileSpreadsheet,
  Printer,
  Search,
  TrendingUp,
  TrendingDown,
  Calendar,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Clock,
  FileText,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

// =============================================================
// DATA DUMMY AWAL
// =============================================================
const initialTransactions = [
  {
    id: 1,
    tanggal: "2026-09-01",
    deskripsi: "Pembayaran SPP Siswa",
    kategori: "Pemasukan",
    jumlah: 12500000,
    metode: "Transfer",
    status: "Lunas",
  },
  {
    id: 2,
    tanggal: "2026-09-02",
    deskripsi: "Pembelian Alat Tulis",
    kategori: "Pengeluaran",
    jumlah: 2350000,
    metode: "Tunai",
    status: "Lunas",
  },
  {
    id: 3,
    tanggal: "2026-09-03",
    deskripsi: "Gaji Guru Bulan Agustus",
    kategori: "Pengeluaran",
    jumlah: 35000000,
    metode: "Transfer",
    status: "Lunas",
  },
  {
    id: 4,
    tanggal: "2026-09-05",
    deskripsi: "Donasi BOS",
    kategori: "Pemasukan",
    jumlah: 5000000,
    metode: "Transfer",
    status: "Pending",
  },
  {
    id: 5,
    tanggal: "2026-09-06",
    deskripsi: "Biaya Listrik",
    kategori: "Pengeluaran",
    jumlah: 1800000,
    metode: "Tunai",
    status: "Lunas",
  },
  {
    id: 6,
    tanggal: "2026-09-07",
    deskripsi: "SPP Siswa",
    kategori: "Pemasukan",
    jumlah: 8000000,
    metode: "Transfer",
    status: "Lunas",
  },
  {
    id: 7,
    tanggal: "2026-09-08",
    deskripsi: "Pembelian Komputer",
    kategori: "Pengeluaran",
    jumlah: 12000000,
    metode: "Transfer",
    status: "Pending",
  },
];

// =============================================================
// PAGE
// =============================================================
export default function LaporanKeuanganPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(5);

  const [transactions, setTransactions] = useState(initialTransactions);

  // =============================================================
  // SIDEBAR
  // =============================================================
  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  // =============================================================
  // STATISTIK
  // =============================================================
  const totalPemasukan = transactions
    .filter((transaction) => transaction.kategori === "Pemasukan")
    .reduce((total, transaction) => total + transaction.jumlah, 0);

  const totalPengeluaran = transactions
    .filter((transaction) => transaction.kategori === "Pengeluaran")
    .reduce((total, transaction) => total + transaction.jumlah, 0);

  const saldo = totalPemasukan - totalPengeluaran;

  // =============================================================
  // FILTER
  // =============================================================
  const filtered = transactions.filter((transaction) => {
    const keyword = search.trim().toLowerCase();

    const matchSearch =
      transaction.deskripsi.toLowerCase().includes(keyword) ||
      transaction.kategori.toLowerCase().includes(keyword) ||
      transaction.metode.toLowerCase().includes(keyword);

    const matchFilter =
      filter === "semua" || transaction.kategori === filter;

    return matchSearch && matchFilter;
  });

  // =============================================================
  // PAGINATION
  // =============================================================
  const totalPages = Math.ceil(filtered.length / entriesPerPage);

  const safeCurrentPage =
    totalPages > 0 ? Math.min(currentPage, totalPages) : 1;

  const indexOfLast = safeCurrentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;

  const currentEntries = filtered.slice(indexOfFirst, indexOfLast);

  // =============================================================
  // HANDLER EDIT
  // =============================================================
  const handleEdit = (id) => {
    router.push(`/laporan-keuangan/edit/${id}`);
  };

  // =============================================================
  // HANDLER DELETE
  // =============================================================
  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Apakah Anda yakin ingin menghapus transaksi ini?"
    );

    if (!confirmed) return;

    setTransactions((previous) =>
      previous.filter((transaction) => transaction.id !== id)
    );

    if (safeCurrentPage > 1 && currentEntries.length === 1) {
      setCurrentPage((previous) => Math.max(1, previous - 1));
    }
  };

  // =============================================================
  // HANDLER DETAIL
  // =============================================================
  const handleView = (id) => {
    const transaction = transactions.find(
      (item) => item.id === id
    );

    if (!transaction) return;

    window.alert(
      `📋 Detail Transaksi\n\n` +
        `Tanggal   : ${transaction.tanggal}\n` +
        `Deskripsi : ${transaction.deskripsi}\n` +
        `Kategori  : ${transaction.kategori}\n` +
        `Jumlah    : Rp ${transaction.jumlah.toLocaleString("id-ID")}\n` +
        `Metode    : ${transaction.metode}\n` +
        `Status    : ${transaction.status}`
    );
  };

  // =============================================================
  // RESET PAGE SAAT SEARCH / FILTER
  // =============================================================
  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    setCurrentPage(1);
  };

  // =============================================================
  // RENDER
  // =============================================================
  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      {/* =========================================================
          SIDEBAR
      ========================================================= */}
      <Sidebar
        active="laporanKeuangan"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      {/* =========================================================
          CONTENT WRAPPER
      ========================================================= */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* =======================================================
            HEADER
        ======================================================= */}
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        {/* =======================================================
            MAIN
        ======================================================= */}
        <main className="theme-page min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
            {/* ===================================================
                PAGE HEADER
            =================================================== */}
            <section
              className="
                theme-card
                theme-border
                mb-6
                overflow-hidden
                rounded-2xl
                border
                p-6
                shadow-[0_10px_30px_color-mix(in_srgb,var(--color-text)_8%,transparent)]
                sm:p-8
              "
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                {/* TITLE */}
                <div className="flex min-w-0 items-center gap-4">
                  <div
                    className="
                      flex
                      h-14
                      w-14
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]
                      bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]
                      text-[var(--color-primary)]
                    "
                  >
                    <FileSpreadsheet size={28} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[var(--color-primary)] text-xs font-semibold uppercase tracking-wider">
                      Keuangan & Kas
                    </p>

                    <h1 className="theme-text mt-0.5 text-2xl font-bold tracking-tight sm:text-3xl">
                      Laporan Keuangan
                    </h1>

                    <p className="theme-text-secondary mt-1 text-sm">
                      Ringkasan transaksi keuangan sekolah secara lengkap
                    </p>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex flex-wrap gap-2">
                  {/* CETAK */}
                  <button
                    type="button"
                    className="
                      theme-card-soft
                      theme-border
                      theme-text-secondary
                      inline-flex
                      items-center
                      gap-2
                      rounded-lg
                      border
                      px-4
                      py-2.5
                      text-sm
                      font-medium
                      transition
                      hover:bg-[color-mix(in_srgb,var(--color-primary)_7%,var(--color-card))]
                      hover:text-[var(--color-primary)]
                    "
                  >
                    <Printer size={16} />
                    Cetak
                  </button>

                  {/* EXPORT */}
                  <button
                    type="button"
                    className="
                      theme-card-soft
                      theme-border
                      theme-text-secondary
                      inline-flex
                      items-center
                      gap-2
                      rounded-lg
                      border
                      px-4
                      py-2.5
                      text-sm
                      font-medium
                      transition
                      hover:bg-[color-mix(in_srgb,var(--color-primary)_7%,var(--color-card))]
                      hover:text-[var(--color-primary)]
                    "
                  >
                    <Download size={16} />
                    Ekspor
                  </button>

                  {/* TAMBAH */}
                  <button
                    type="button"
                    onClick={() => router.push("/laporan/tambah")}
                    className="
                      theme-primary
                      inline-flex
                      items-center
                      gap-2
                      rounded-lg
                      px-4
                      py-2.5
                      text-sm
                      font-medium
                      shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]
                      transition
                      hover:opacity-90
                    "
                  >
                    <Plus size={16} />
                    Tambah Transaksi
                  </button>
                </div>
              </div>
            </section>

            {/* ===================================================
                STATISTIK
            =================================================== */}
            <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                icon={<TrendingUp size={22} />}
                label="Total Pemasukan"
                value={`Rp ${totalPemasukan.toLocaleString("id-ID")}`}
                color="success"
                subtext="Semua pemasukan masuk"
              />

              <StatCard
                icon={<TrendingDown size={22} />}
                label="Total Pengeluaran"
                value={`Rp ${totalPengeluaran.toLocaleString("id-ID")}`}
                color="danger"
                subtext="Semua pengeluaran kas"
              />

              <StatCard
                icon={<Wallet size={22} />}
                label="Saldo Akhir"
                value={`Rp ${saldo.toLocaleString("id-ID")}`}
                color={saldo >= 0 ? "primary" : "danger"}
                subtext={
                  saldo >= 0 ? "Saldo positif" : "Saldo negatif"
                }
              />
            </section>

            {/* ===================================================
                SEARCH & FILTER
            =================================================== */}
            <section className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* SEARCH */}
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="
                    theme-text-muted
                    absolute
                    left-3.5
                    top-1/2
                    -translate-y-1/2
                  "
                />

                <input
                  type="text"
                  value={search}
                  onChange={handleSearchChange}
                  placeholder="Cari transaksi, kategori, atau metode..."
                  className="
                    theme-input
                    theme-border
                    theme-text
                    w-full
                    rounded-xl
                    border
                    py-2.5
                    pl-10
                    pr-4
                    text-sm
                    outline-none
                    transition
                    placeholder:text-[var(--color-text-placeholder)]
                    focus:border-[var(--color-primary)]
                    focus:ring-4
                    focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]
                  "
                />
              </div>

              {/* FILTER */}
              <div className="flex gap-2">
                <select
                  value={filter}
                  onChange={handleFilterChange}
                  className="
                    theme-input
                    theme-border
                    theme-text
                    rounded-xl
                    border
                    px-4
                    py-2.5
                    text-sm
                    outline-none
                    transition
                    focus:border-[var(--color-primary)]
                    focus:ring-4
                    focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]
                  "
                >
                  <option value="semua">Semua Kategori</option>
                  <option value="Pemasukan">Pemasukan</option>
                  <option value="Pengeluaran">Pengeluaran</option>
                </select>

                <button
                  type="button"
                  className="
                    theme-card
                    theme-border
                    theme-text-secondary
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    px-4
                    py-2.5
                    text-sm
                    font-medium
                    transition
                    hover:bg-[color-mix(in_srgb,var(--color-primary)_7%,var(--color-card))]
                    hover:text-[var(--color-primary)]
                  "
                >
                  <Calendar size={16} />
                  Periode
                </button>
              </div>
            </section>

            {/* ===================================================
                TABLE
            =================================================== */}
            <section
              className="
                theme-card
                theme-border
                overflow-hidden
                rounded-2xl
                border
                shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_7%,transparent)]
              "
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  {/* TABLE HEADER */}
                  <thead>
                    <tr className="bg-[color-mix(in_srgb,var(--color-primary)_4%,var(--color-card))]">
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead align="right">Jumlah</TableHead>
                      <TableHead>Metode</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead align="center">Aksi</TableHead>
                    </tr>
                  </thead>

                  {/* TABLE BODY */}
                  <tbody className="divide-y divide-[var(--color-border-soft)]">
                    {currentEntries.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="theme-text-muted px-4 py-12 text-center"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <FileText
                              size={32}
                              className="theme-text-placeholder"
                            />

                            <p className="theme-text-secondary text-sm font-medium">
                              Tidak ada transaksi ditemukan
                            </p>

                            <p className="theme-text-muted text-xs">
                              Coba ubah kata kunci pencarian
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentEntries.map((transaction) => (
                        <tr
                          key={transaction.id}
                          className="
                            group
                            transition
                            hover:bg-[color-mix(in_srgb,var(--color-primary)_4%,var(--color-card))]
                          "
                        >
                          {/* TANGGAL */}
                          <td className="theme-text-secondary px-4 py-3.5 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock
                                size={14}
                                className="theme-text-muted"
                              />

                              {transaction.tanggal}
                            </div>
                          </td>

                          {/* DESKRIPSI */}
                          <td className="theme-text px-4 py-3.5 font-medium">
                            {transaction.deskripsi}
                          </td>

                          {/* KATEGORI */}
                          <td className="px-4 py-3.5">
                            <CategoryBadge
                              kategori={transaction.kategori}
                            />
                          </td>

                          {/* JUMLAH */}
                          <td className="px-4 py-3.5 text-right font-bold">
                            <span
                              className={
                                transaction.kategori === "Pemasukan"
                                  ? "theme-success"
                                  : "theme-danger"
                              }
                            >
                              Rp{" "}
                              {transaction.jumlah.toLocaleString(
                                "id-ID"
                              )}
                            </span>
                          </td>

                          {/* METODE */}
                          <td className="theme-text-secondary px-4 py-3.5">
                            {transaction.metode}
                          </td>

                          {/* STATUS */}
                          <td className="px-4 py-3.5">
                            <StatusBadge
                              status={transaction.status}
                            />
                          </td>

                          {/* AKSI */}
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {/* VIEW */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleView(transaction.id)
                                }
                                title="Lihat Detail"
                                className="
                                  theme-text-muted
                                  rounded-lg
                                  p-1.5
                                  transition
                                  hover:bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]
                                  hover:text-[var(--color-primary)]
                                "
                              >
                                <Eye size={16} />
                              </button>

                              {/* EDIT */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleEdit(transaction.id)
                                }
                                title="Edit Transaksi"
                                className="
                                  theme-text-muted
                                  rounded-lg
                                  p-1.5
                                  transition
                                  hover:bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]
                                  hover:text-[var(--color-primary)]
                                "
                              >
                                <Edit size={16} />
                              </button>

                              {/* DELETE */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(transaction.id)
                                }
                                title="Hapus Transaksi"
                                className="
                                  theme-text-muted
                                  rounded-lg
                                  p-1.5
                                  transition
                                  hover:bg-[color-mix(in_srgb,var(--color-danger)_9%,transparent)]
                                  hover:text-[var(--color-danger)]
                                "
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* =================================================
                  PAGINATION
              ================================================= */}
              {filtered.length > 0 && (
                <div
                  className="
                    theme-border
                    flex
                    flex-col
                    gap-3
                    border-t
                    bg-[color-mix(in_srgb,var(--color-primary)_3%,var(--color-card))]
                    px-4
                    py-3
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >
                  <p className="theme-text-secondary text-sm">
                    Menampilkan {indexOfFirst + 1}-
                    {Math.min(indexOfLast, filtered.length)} dari{" "}
                    {filtered.length} transaksi
                  </p>

                  <div className="flex items-center gap-1">
                    {/* PREVIOUS */}
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((page) =>
                          Math.max(1, page - 1)
                        )
                      }
                      disabled={safeCurrentPage === 1}
                      className="
                        theme-card
                        theme-border
                        theme-text-secondary
                        rounded-lg
                        border
                        p-2
                        transition
                        hover:bg-[color-mix(in_srgb,var(--color-primary)_7%,var(--color-card))]
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                      title="Halaman sebelumnya"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {/* PAGE NUMBERS */}
                    {Array.from(
                      { length: totalPages },
                      (_, index) => {
                        const pageNumber = index + 1;
                        const isActive =
                          safeCurrentPage === pageNumber;

                        return (
                          <button
                            type="button"
                            key={pageNumber}
                            onClick={() =>
                              setCurrentPage(pageNumber)
                            }
                            className={`
                              rounded-lg
                              px-3.5
                              py-1.5
                              text-sm
                              font-medium
                              transition
                              ${
                                isActive
                                  ? "theme-primary shadow-[0_4px_12px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]"
                                  : "theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-primary)_7%,var(--color-card))] hover:text-[var(--color-primary)]"
                              }
                            `}
                          >
                            {pageNumber}
                          </button>
                        );
                      }
                    )}

                    {/* NEXT */}
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentPage((page) =>
                          Math.min(totalPages, page + 1)
                        )
                      }
                      disabled={
                        safeCurrentPage === totalPages
                      }
                      className="
                        theme-card
                        theme-border
                        theme-text-secondary
                        rounded-lg
                        border
                        p-2
                        transition
                        hover:bg-[color-mix(in_srgb,var(--color-primary)_7%,var(--color-card))]
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                      title="Halaman berikutnya"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* ===================================================
                FOOTER
            =================================================== */}
            <footer
              className="
                theme-border-soft
                theme-text-muted
                mt-8
                border-t
                pt-6
                text-center
                text-xs
              "
            >
              © 2026 SmartSchool • Laporan Keuangan
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

// =============================================================
// TABLE HEAD
// =============================================================
function TableHead({ children, align = "left" }) {
  const alignmentClass =
    {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    }[align] || "text-left";

  return (
    <th
      className={`
        theme-text-muted
        px-4
        py-3.5
        text-xs
        font-semibold
        uppercase
        tracking-wider
        ${alignmentClass}
      `}
    >
      {children}
    </th>
  );
}

// =============================================================
// CATEGORY BADGE
// =============================================================
function CategoryBadge({ kategori }) {
  const isIncome = kategori === "Pemasukan";

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        border
        border-current
        px-2.5
        py-1
        text-xs
        font-semibold
        ${
          isIncome
            ? `
              theme-success
              bg-[color-mix(in_srgb,currentColor_10%,transparent)]
            `
            : `
              theme-danger
              bg-[color-mix(in_srgb,currentColor_10%,transparent)]
            `
        }
      `}
    >
      {kategori}
    </span>
  );
}

// =============================================================
// STATUS BADGE
// =============================================================
function StatusBadge({ status }) {
  const isPaid = status === "Lunas";

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        border
        border-current
        px-2.5
        py-1
        text-xs
        font-semibold
        ${
          isPaid
            ? `
              theme-success
              bg-[color-mix(in_srgb,currentColor_10%,transparent)]
            `
            : `
              theme-warning
              bg-[color-mix(in_srgb,currentColor_10%,transparent)]
            `
        }
      `}
    >
      {status}
    </span>
  );
}

// =============================================================
// STAT CARD
// =============================================================
function StatCard({
  icon,
  label,
  value,
  color,
  subtext,
}) {
  const colorConfig = {
    success: {
      textClass: "theme-success",
      background:
        "bg-[color-mix(in_srgb,var(--color-success)_7%,var(--color-card))]",
    },

    danger: {
      textClass: "theme-danger",
      background:
        "bg-[color-mix(in_srgb,var(--color-danger)_7%,var(--color-card))]",
    },

    primary: {
      textClass: "text-[var(--color-primary)]",
      background:
        "bg-[color-mix(in_srgb,var(--color-primary)_7%,var(--color-card))]",
    },
  };

  const selected =
    colorConfig[color] || colorConfig.primary;

  return (
    <div
      className={`
        theme-card
        theme-border
        group
        rounded-2xl
        border
        p-5
        shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_7%,transparent)]
        transition
        hover:shadow-[0_8px_24px_color-mix(in_srgb,var(--color-text)_10%,transparent)]
        ${selected.background}
      `}
    >
      <div className="flex items-start gap-4">
        {/* ICON */}
        <div
          className={`
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-[color-mix(in_srgb,currentColor_10%,transparent)]
            transition
            group-hover:scale-105
            ${selected.textClass}
          `}
        >
          {icon}
        </div>

        {/* CONTENT */}
        <div className="min-w-0 flex-1">
          <p className="theme-text-muted text-xs font-medium">
            {label}
          </p>

          <p className="theme-text mt-1 text-xl font-bold">
            {value}
          </p>

          {subtext && (
            <p className="theme-text-muted mt-0.5 text-xs">
              {subtext}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}