"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  Filter,
  Search,
  CreditCard,
  Wallet,
  Receipt,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

// ============================================================
// MOCK DATA PEMBAYARAN SEKOLAH
// ============================================================

const PAYMENTS = [
  {
    id: "PAY-2026-0001",
    invoice: "INV-2026-0001",
    package: "Professional",
    amount: 1500000,
    method: "Virtual Account",
    bank: "BCA",
    date: "15 Januari 2026",
    period: "Januari 2026",
    status: "Berhasil",
  },
  {
    id: "PAY-2026-0002",
    invoice: "INV-2026-0002",
    package: "Professional",
    amount: 1500000,
    method: "QRIS",
    bank: "-",
    date: "15 Februari 2026",
    period: "Februari 2026",
    status: "Berhasil",
  },
  {
    id: "PAY-2026-0003",
    invoice: "INV-2026-0003",
    package: "Professional",
    amount: 1500000,
    method: "Virtual Account",
    bank: "Mandiri",
    date: "15 Maret 2026",
    period: "Maret 2026",
    status: "Berhasil",
  },
  {
    id: "PAY-2026-0004",
    invoice: "INV-2026-0004",
    package: "Professional",
    amount: 1500000,
    method: "Transfer Bank",
    bank: "BRI",
    date: "15 April 2026",
    period: "April 2026",
    status: "Berhasil",
  },
  {
    id: "PAY-2026-0005",
    invoice: "INV-2026-0005",
    package: "Professional",
    amount: 1500000,
    method: "QRIS",
    bank: "-",
    date: "15 Mei 2026",
    period: "Mei 2026",
    status: "Berhasil",
  },
  {
    id: "PAY-2026-0006",
    invoice: "INV-2026-0006",
    package: "Professional",
    amount: 1500000,
    method: "Virtual Account",
    bank: "BCA",
    date: "15 Juni 2026",
    period: "Juni 2026",
    status: "Berhasil",
  },
  {
    id: "PAY-2026-0007",
    invoice: "INV-2026-0007",
    package: "Professional",
    amount: 1500000,
    method: "Transfer Bank",
    bank: "Mandiri",
    date: "15 Juli 2026",
    period: "Juli 2026",
    status: "Berhasil",
  },
  {
    id: "PAY-2026-0008",
    invoice: "INV-2026-0008",
    package: "Professional",
    amount: 1500000,
    method: "Virtual Account",
    bank: "BCA",
    date: "15 Agustus 2026",
    period: "Agustus 2026",
    status: "Berhasil",
  },
  {
    id: "PAY-2026-0009",
    invoice: "INV-2026-0009",
    package: "Professional",
    amount: 1500000,
    method: "Virtual Account",
    bank: "BCA",
    date: "15 September 2026",
    period: "September 2026",
    status: "Menunggu",
  },
];

// ============================================================
// THEME HELPERS
// ============================================================

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]";

const themePrimaryHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";

const themeTextHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themePrimaryShadow =
  "shadow-[0_10px_25px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]";

// ============================================================
// FORMAT
// ============================================================

const formatRupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClass = "text-[var(--color-primary)]",
}) {
  return (
    <div className="theme-card theme-border rounded-xl border p-4 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium theme-text-muted tracking-wide">
            {title}
          </p>

          <p className="mt-1.5 text-xl sm:text-2xl font-bold theme-text truncate">
            {value}
          </p>

          <p className="mt-1 text-[10px] sm:text-xs theme-text-placeholder">
            {description}
          </p>
        </div>

        <div
          className={`w-9 h-9 rounded-lg ${themePrimarySoft} flex items-center justify-center shrink-0`}
        >
          <Icon size={17} className={iconClass} />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// STATUS
// ============================================================

function PaymentStatus({ status }) {
  const styles = {
    Berhasil: {
      className: "theme-success",
      dot: "bg-[var(--color-success)]",
    },

    Menunggu: {
      className: "theme-warning",
      dot: "bg-[var(--color-warning)]",
    },

    Gagal: {
      className: "theme-danger",
      dot: "bg-[var(--color-danger)]",
    },
  };

  const current = styles[status] || {
    className: "theme-text-muted theme-border",
    dot: "bg-[var(--color-text-muted)]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap ${current.className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${current.dot}`}
      />
      {status}
    </span>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function RiwayatPembayaranPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [methodFilter, setMethodFilter] = useState("Semua");

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredPayments = useMemo(() => {
    return PAYMENTS.filter((item) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        item.id.toLowerCase().includes(keyword) ||
        item.invoice.toLowerCase().includes(keyword) ||
        item.package.toLowerCase().includes(keyword) ||
        item.method.toLowerCase().includes(keyword) ||
        item.period.toLowerCase().includes(keyword);

      const matchStatus =
        statusFilter === "Semua" ||
        item.status === statusFilter;

      const matchMethod =
        methodFilter === "Semua" ||
        item.method === methodFilter;

      return matchSearch && matchStatus && matchMethod;
    });
  }, [search, statusFilter, methodFilter]);

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const totalAmount = PAYMENTS.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const successPayments = PAYMENTS.filter(
    (item) => item.status === "Berhasil"
  );

  const successAmount = successPayments.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const pendingPayments = PAYMENTS.filter(
    (item) => item.status === "Menunggu"
  );

  return (
    <div className="flex h-screen w-full theme-page overflow-hidden">
      {/* ======================================================
          SIDEBAR
      ====================================================== */}
      <Sidebar
        active="riwayatPembayaran"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      {/* ======================================================
          CONTENT
      ====================================================== */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* HEADER */}
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="flex-1 overflow-y-auto theme-page">
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">

            {/* ==================================================
                PAGE HEADER
            ================================================== */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl ${themePrimarySoft} ${themePrimarySoftBorder} border text-[var(--color-primary)] ${themePrimaryShadow}`}
                >
                  <Receipt size={20} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold theme-text">
                    Riwayat Pembayaran
                  </h1>

                  <p className="text-sm theme-text-secondary">
                    Daftar pembayaran langganan yang telah dilakukan
                    oleh sekolah Anda.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border theme-border theme-card theme-text-secondary text-sm font-semibold ${themeTextHover} transition-colors`}
              >
                <RefreshCw size={15} />
                Refresh
              </button>
            </div>

            {/* ==================================================
                SUMMARY
            ================================================== */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard
                title="Total Pembayaran"
                value={formatRupiah(successAmount)}
                description="Pembayaran berhasil"
                icon={Wallet}
              />

              <StatCard
                title="Transaksi Berhasil"
                value={successPayments.length}
                description="Pembayaran selesai"
                icon={CheckCircle2}
                iconClass="text-[var(--color-success)]"
              />

              <StatCard
                title="Menunggu"
                value={pendingPayments.length}
                description="Menunggu pembayaran"
                icon={Clock3}
                iconClass="text-[var(--color-warning)]"
              />

              <StatCard
                title="Total Transaksi"
                value={PAYMENTS.length}
                description={`Nilai ${formatRupiah(totalAmount)}`}
                icon={CreditCard}
              />
            </div>

            {/* ==================================================
                INFO
            ================================================== */}
            <section className="theme-card theme-border rounded-xl border shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)] p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${themePrimarySoft} flex items-center justify-center shrink-0`}
                  >
                    <TrendingUp
                      size={18}
                      className="text-[var(--color-primary)]"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold theme-text">
                      Riwayat pembayaran sekolah
                    </p>

                    <p className="text-xs theme-text-secondary mt-1">
                      Sekolah telah melakukan{" "}
                      <span className="font-semibold theme-text">
                        {successPayments.length} pembayaran berhasil
                      </span>{" "}
                      dengan total{" "}
                      <span className="font-semibold text-[var(--color-primary)]">
                        {formatRupiah(successAmount)}
                      </span>
                      .
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full bg-[var(--color-success)]"
                  />

                  <span className="text-xs font-medium theme-text-muted">
                    Pembayaran terverifikasi
                  </span>
                </div>
              </div>
            </section>

            {/* ==================================================
                FILTER
            ================================================== */}
            <section className="theme-card theme-border rounded-xl border shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)] p-4">
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-placeholder"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari transaksi, invoice, paket..."
                    className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-lg theme-input border theme-border theme-text ${themeTextHover} focus:outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]`}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value)
                    }
                    className="text-sm rounded-lg theme-input border theme-border px-3 py-2.5 theme-text focus:outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]"
                  >
                    <option value="Semua">Semua Status</option>
                    <option value="Berhasil">Berhasil</option>
                    <option value="Menunggu">Menunggu</option>
                    <option value="Gagal">Gagal</option>
                  </select>

                  <select
                    value={methodFilter}
                    onChange={(e) =>
                      setMethodFilter(e.target.value)
                    }
                    className="text-sm rounded-lg theme-input border theme-border px-3 py-2.5 theme-text focus:outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]"
                  >
                    <option value="Semua">Semua Metode</option>
                    <option value="Virtual Account">
                      Virtual Account
                    </option>
                    <option value="QRIS">QRIS</option>
                    <option value="Transfer Bank">
                      Transfer Bank
                    </option>
                  </select>

                  <button
                    type="button"
                    className={`inline-flex items-center gap-2 px-3 py-2.5 rounded-lg border theme-border theme-card theme-text-secondary text-sm font-medium ${themeTextHover}`}
                  >
                    <Filter size={15} />
                    Filter
                  </button>
                </div>
              </div>
            </section>

            {/* ==================================================
                TABLE
            ================================================== */}
            <section className="theme-card theme-border rounded-xl border shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-sm border-collapse">
                  <thead>
                    <tr className="theme-header">
                      <th className="text-center font-semibold px-4 py-3 w-[60px]">
                        No
                      </th>

                      <th className="text-left font-semibold px-4 py-3">
                        Transaksi
                      </th>

                      <th className="text-left font-semibold px-4 py-3">
                        Paket
                      </th>

                      <th className="text-left font-semibold px-4 py-3">
                        Tanggal
                      </th>

                      <th className="text-left font-semibold px-4 py-3">
                        Metode
                      </th>

                      <th className="text-right font-semibold px-4 py-3">
                        Nominal
                      </th>

                      <th className="text-center font-semibold px-4 py-3">
                        Status
                      </th>

                      <th className="text-center font-semibold px-4 py-3">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredPayments.length > 0 ? (
                      filteredPayments.map((item, index) => (
                        <tr
                          key={item.id}
                          className={`border-b theme-border-soft last:border-0 transition-colors ${themePrimaryHover} ${
                            index % 2 === 0
                              ? "theme-card-soft"
                              : "theme-card"
                          }`}
                        >
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-lg ${themePrimarySoft} text-[var(--color-primary)] ${themePrimarySoftBorder} border text-xs font-bold`}
                            >
                              {index + 1}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <p className="font-semibold theme-text">
                              {item.id}
                            </p>

                            <p className="text-[11px] theme-text-placeholder mt-1">
                              {item.invoice}
                            </p>
                          </td>

                          <td className="px-4 py-3">
                            <span className="text-sm font-medium theme-text-secondary">
                              {item.package}
                            </span>

                            <p className="text-[11px] theme-text-placeholder mt-0.5">
                              {item.period}
                            </p>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <CalendarDays
                                size={14}
                                className="text-[var(--color-primary)]"
                              />

                              <span className="text-xs theme-text-secondary">
                                {item.date}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <p className="text-xs font-medium theme-text-secondary">
                              {item.method}
                            </p>

                            {item.bank !== "-" && (
                              <p className="text-[11px] theme-text-placeholder mt-0.5">
                                {item.bank}
                              </p>
                            )}
                          </td>

                          <td className="px-4 py-3 text-right">
                            <span className="text-sm font-bold theme-text">
                              {formatRupiah(item.amount)}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-center">
                            <PaymentStatus status={item.status} />
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex justify-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  router.push(
                                    `/admin/langganan/riwayat-pembayaran/${item.id}`
                                  )
                                }
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[var(--color-primary)] ${themePrimarySoft} ${themePrimarySoftBorder} border ${themePrimaryHover} text-xs font-medium transition-colors`}
                              >
                                <Eye size={13} />
                                Detail
                              </button>

                              <button
                                type="button"
                                className={`inline-flex items-center justify-center w-8 h-8 rounded-md border theme-border theme-card theme-text-muted ${themeTextHover} hover:text-[var(--color-primary)]`}
                              >
                                <Download size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-4 py-14 text-center"
                        >
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-12 h-12 rounded-full ${themePrimarySoft} flex items-center justify-center`}
                            >
                              <Search
                                size={20}
                                className="text-[var(--color-primary)]"
                              />
                            </div>

                            <p className="text-sm font-semibold theme-text-secondary mt-3">
                              Pembayaran tidak ditemukan
                            </p>

                            <p className="text-xs theme-text-placeholder mt-1">
                              Coba ubah kata kunci atau filter.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* ==================================================
                  FOOTER
              ================================================== */}
              <div className="px-4 py-3 theme-border-soft border-t theme-card-soft flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs theme-text-muted">
                  Menampilkan{" "}
                  <span className="font-semibold theme-text-secondary">
                    {filteredPayments.length}
                  </span>{" "}
                  dari{" "}
                  <span className="font-semibold theme-text-secondary">
                    {PAYMENTS.length}
                  </span>{" "}
                  transaksi
                </p>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-md border theme-border theme-card theme-text-muted text-xs ${themeTextHover}`}
                  >
                    Sebelumnya
                  </button>

                  <button
                    type="button"
                    className="w-8 h-8 rounded-md bg-[var(--color-primary)] text-white text-xs font-bold"
                  >
                    1
                  </button>

                  <button
                    type="button"
                    className={`w-8 h-8 rounded-md border theme-border theme-card theme-text-muted text-xs ${themeTextHover}`}
                  >
                    2
                  </button>

                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-md border theme-border theme-card theme-text-muted text-xs ${themeTextHover}`}
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}