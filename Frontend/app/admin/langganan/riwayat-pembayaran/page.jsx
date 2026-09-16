"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  Filter,
  Search,
  XCircle,
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
  iconClass = "text-[#155DFC]",
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-slate-500 tracking-wide">
            {title}
          </p>

          <p className="mt-1.5 text-xl sm:text-2xl font-bold text-slate-900 truncate">
            {value}
          </p>

          <p className="mt-1 text-[10px] sm:text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
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
      className: "bg-emerald-50 text-emerald-600 border-emerald-200",
      dot: "bg-emerald-500",
    },
    Menunggu: {
      className: "bg-amber-50 text-amber-600 border-amber-200",
      dot: "bg-amber-500",
    },
    Gagal: {
      className: "bg-red-50 text-red-600 border-red-200",
      dot: "bg-red-500",
    },
  };

  const current = styles[status] || {
    className: "bg-slate-100 text-slate-500 border-slate-200",
    dot: "bg-slate-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap ${current.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
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

  const failedPayments = PAYMENTS.filter(
    (item) => item.status === "Gagal"
  );

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* SIDEBAR */}
      <Sidebar
        active="riwayatPembayaran"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      {/* CONTENT */}
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

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* PAGE HEADER */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#155DFC] to-[#0d47c9] text-white shadow-lg shadow-[#155DFC]/20">
                  <Receipt size={20} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-slate-800">
                    Riwayat Pembayaran
                  </h1>

                  <p className="text-sm text-slate-500">
                    Daftar pembayaran langganan yang telah dilakukan
                    oleh sekolah Anda.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                <RefreshCw size={15} />
                Refresh
              </button>
            </div>

            {/* SUMMARY */}
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
                iconClass="text-emerald-500"
              />

              <StatCard
                title="Menunggu"
                value={pendingPayments.length}
                description="Menunggu pembayaran"
                icon={Clock3}
                iconClass="text-amber-500"
              />

              <StatCard
                title="Total Transaksi"
                value={PAYMENTS.length}
                description={`Nilai ${formatRupiah(totalAmount)}`}
                icon={CreditCard}
              />
            </div>

            {/* INFO */}
            <section className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#eaf1ff] flex items-center justify-center shrink-0">
                    <TrendingUp
                      size={18}
                      className="text-[#155DFC]"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Riwayat pembayaran sekolah
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      Sekolah telah melakukan{" "}
                      <span className="font-semibold text-slate-700">
                        {successPayments.length} pembayaran berhasil
                      </span>{" "}
                      dengan total{" "}
                      <span className="font-semibold text-[#155DFC]">
                        {formatRupiah(successAmount)}
                      </span>
                      .
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium text-slate-500">
                    Pembayaran terverifikasi
                  </span>
                </div>
              </div>
            </section>

            {/* FILTER */}
            <section className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari transaksi, invoice, paket..."
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20 focus:border-[#155DFC]/50 text-slate-800"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value)
                    }
                    className="text-sm rounded-lg border border-slate-200 px-3 py-2.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20"
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
                    className="text-sm rounded-lg border border-slate-200 px-3 py-2.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20"
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
                    className="inline-flex items-center gap-2 px-3 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
                  >
                    <Filter size={15} />
                    Filter
                  </button>
                </div>
              </div>
            </section>

            {/* TABLE */}
            <section className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-sm border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#155DFC] to-[#0d47c9] text-white">
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
                          className={`border-b border-slate-100 last:border-0 transition-colors hover:bg-[#eaf1ff] ${
                            index % 2 === 0
                              ? "bg-[#f7f9ff]"
                              : "bg-white"
                          }`}
                        >
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#eaf1ff] text-[#155DFC] border border-[#c7dbff] text-xs font-bold">
                              {index + 1}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-800">
                              {item.id}
                            </p>

                            <p className="text-[11px] text-slate-400 mt-1">
                              {item.invoice}
                            </p>
                          </td>

                          <td className="px-4 py-3">
                            <span className="text-sm font-medium text-slate-700">
                              {item.package}
                            </span>

                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {item.period}
                            </p>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <CalendarDays
                                size={14}
                                className="text-[#155DFC]"
                              />

                              <span className="text-xs text-slate-600">
                                {item.date}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <p className="text-xs font-medium text-slate-700">
                              {item.method}
                            </p>

                            {item.bank !== "-" && (
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {item.bank}
                              </p>
                            )}
                          </td>

                          <td className="px-4 py-3 text-right">
                            <span className="text-sm font-bold text-slate-800">
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
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[#155DFC] bg-[#eaf1ff] border border-[#c7dbff] hover:bg-[#d6e6ff] text-xs font-medium transition-colors"
                              >
                                <Eye size={13} />
                                Detail
                              </button>

                              <button
                                type="button"
                                className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"
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
                            <div className="w-12 h-12 rounded-full bg-[#eaf1ff] flex items-center justify-center">
                              <Search
                                size={20}
                                className="text-[#155DFC]"
                              />
                            </div>

                            <p className="text-sm font-semibold text-slate-700 mt-3">
                              Pembayaran tidak ditemukan
                            </p>

                            <p className="text-xs text-slate-400 mt-1">
                              Coba ubah kata kunci atau filter.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* FOOTER */}
              <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs text-slate-500">
                  Menampilkan{" "}
                  <span className="font-semibold text-slate-700">
                    {filteredPayments.length}
                  </span>{" "}
                  dari{" "}
                  <span className="font-semibold text-slate-700">
                    {PAYMENTS.length}
                  </span>{" "}
                  transaksi
                </p>

                <div className="flex items-center gap-1.5">
                  <button className="px-3 py-1.5 rounded-md border border-slate-200 bg-white text-xs text-slate-500 hover:bg-slate-50">
                    Sebelumnya
                  </button>

                  <button className="w-8 h-8 rounded-md bg-[#155DFC] text-white text-xs font-bold">
                    1
                  </button>

                  <button className="w-8 h-8 rounded-md border border-slate-200 bg-white text-slate-500 text-xs">
                    2
                  </button>

                  <button className="px-3 py-1.5 rounded-md border border-slate-200 bg-white text-xs text-slate-500 hover:bg-slate-50">
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