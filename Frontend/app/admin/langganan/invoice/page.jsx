"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

import {
  AlertCircle,
  CalendarDays,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileText,
  Filter,
  Search,
  Receipt,
  RefreshCw,
  Wallet,
  CreditCard,
} from "lucide-react";

// ============================================================
// MOCK DATA INVOICE SEKOLAH
// ============================================================

const INVOICES = [
  {
    id: "INV-2026-0001",
    package: "Professional",
    period: "September 2026",
    issuedDate: "01 September 2026",
    dueDate: "10 September 2026",
    amount: 1500000,
    status: "Belum Dibayar",
  },
  {
    id: "INV-2026-0002",
    package: "Professional",
    period: "Agustus 2026",
    issuedDate: "01 Agustus 2026",
    dueDate: "10 Agustus 2026",
    amount: 1500000,
    status: "Lunas",
  },
  {
    id: "INV-2026-0003",
    package: "Professional",
    period: "Juli 2026",
    issuedDate: "01 Juli 2026",
    dueDate: "10 Juli 2026",
    amount: 1500000,
    status: "Lunas",
  },
  {
    id: "INV-2026-0004",
    package: "Professional",
    period: "Juni 2026",
    issuedDate: "01 Juni 2026",
    dueDate: "10 Juni 2026",
    amount: 1500000,
    status: "Lunas",
  },
  {
    id: "INV-2026-0005",
    package: "Professional",
    period: "Mei 2026",
    issuedDate: "01 Mei 2026",
    dueDate: "10 Mei 2026",
    amount: 1500000,
    status: "Jatuh Tempo",
  },
  {
    id: "INV-2026-0006",
    package: "Professional",
    period: "April 2026",
    issuedDate: "01 April 2026",
    dueDate: "10 April 2026",
    amount: 1500000,
    status: "Lunas",
  },
  {
    id: "INV-2026-0007",
    package: "Professional",
    period: "Maret 2026",
    issuedDate: "01 Maret 2026",
    dueDate: "10 Maret 2026",
    amount: 1500000,
    status: "Lunas",
  },
  {
    id: "INV-2026-0008",
    package: "Professional",
    period: "Februari 2026",
    issuedDate: "01 Februari 2026",
    dueDate: "10 Februari 2026",
    amount: 1500000,
    status: "Lunas",
  },
  {
    id: "INV-2026-0009",
    package: "Professional",
    period: "Januari 2026",
    issuedDate: "01 Januari 2026",
    dueDate: "10 Januari 2026",
    amount: 1500000,
    status: "Lunas",
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

function InvoiceStatus({ status }) {
  const styles = {
    Lunas: {
      className: "bg-emerald-50 text-emerald-600 border-emerald-200",
      icon: CheckCircle2,
    },
    "Belum Dibayar": {
      className: "bg-amber-50 text-amber-600 border-amber-200",
      icon: Clock3,
    },
    "Jatuh Tempo": {
      className: "bg-red-50 text-red-600 border-red-200",
      icon: AlertCircle,
    },
  };

  const current = styles[status] || {
    className: "bg-slate-100 text-slate-500 border-slate-200",
    icon: FileText,
  };

  const Icon = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap ${current.className}`}
    >
      <Icon size={12} />
      {status}
    </span>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function InvoicePage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredInvoices = useMemo(() => {
    return INVOICES.filter((item) => {
      const keyword = search.toLowerCase().trim();

      const matchSearch =
        item.id.toLowerCase().includes(keyword) ||
        item.package.toLowerCase().includes(keyword) ||
        item.period.toLowerCase().includes(keyword);

      const matchStatus =
        statusFilter === "Semua" ||
        item.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const totalBills = INVOICES.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const paidInvoices = INVOICES.filter(
    (item) => item.status === "Lunas"
  );

  const unpaidInvoices = INVOICES.filter(
    (item) => item.status === "Belum Dibayar"
  );

  const overdueInvoices = INVOICES.filter(
    (item) => item.status === "Jatuh Tempo"
  );

  const totalPaid = paidInvoices.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const totalUnpaid = unpaidInvoices.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const totalOverdue = overdueInvoices.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const paidPercentage =
    totalBills > 0
      ? Math.round((totalPaid / totalBills) * 100)
      : 0;

  const latestInvoice = INVOICES[0];

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* =====================================================
          SIDEBAR
      ====================================================== */}
      <Sidebar
        active="invoice"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      {/* =====================================================
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

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">

            {/* =================================================
                PAGE HEADER
            ================================================== */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#155DFC] to-[#0d47c9] text-white shadow-lg shadow-[#155DFC]/20">
                  <FileText size={20} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-slate-800">
                    Tagihan / Invoice
                  </h1>

                  <p className="text-sm text-slate-500">
                    Kelola tagihan dan invoice langganan sekolah Anda.
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

            {/* =================================================
                SUMMARY
            ================================================== */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard
                title="Total Tagihan"
                value={formatRupiah(totalBills)}
                description={`${INVOICES.length} invoice`}
                icon={FileText}
              />

              <StatCard
                title="Sudah Lunas"
                value={formatRupiah(totalPaid)}
                description={`${paidInvoices.length} invoice lunas`}
                icon={CheckCircle2}
                iconClass="text-emerald-500"
              />

              <StatCard
                title="Belum Dibayar"
                value={formatRupiah(totalUnpaid)}
                description={`${unpaidInvoices.length} invoice`}
                icon={Clock3}
                iconClass="text-amber-500"
              />

              <StatCard
                title="Jatuh Tempo"
                value={formatRupiah(totalOverdue)}
                description={`${overdueInvoices.length} invoice`}
                icon={AlertCircle}
                iconClass="text-red-500"
              />
            </div>

            {/* =================================================
                CURRENT INVOICE
            ================================================== */}
            <section className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-5 sm:p-6">

                <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">

                  {/* LEFT */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#eaf1ff] flex items-center justify-center shrink-0">
                      <Receipt
                        size={21}
                        className="text-[#155DFC]"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Invoice Terbaru
                        </p>

                        <InvoiceStatus
                          status={latestInvoice.status}
                        />
                      </div>

                      <h2 className="text-xl font-bold text-slate-900 mt-1">
                        {latestInvoice.id}
                      </h2>

                      <p className="text-sm text-slate-500 mt-1">
                        Paket {latestInvoice.package} ·{" "}
                        {latestInvoice.period}
                      </p>
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="xl:text-right">
                    <p className="text-xs text-slate-400">
                      Total Tagihan
                    </p>

                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {formatRupiah(latestInvoice.amount)}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      Jatuh tempo {latestInvoice.dueDate}
                    </p>
                  </div>
                </div>

                {/* DETAILS */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2">
                      <CalendarDays
                        size={15}
                        className="text-[#155DFC]"
                      />

                      <span className="text-xs text-slate-500">
                        Periode
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-slate-800 mt-2">
                      {latestInvoice.period}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2">
                      <CalendarClock
                        size={15}
                        className="text-[#155DFC]"
                      />

                      <span className="text-xs text-slate-500">
                        Diterbitkan
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-slate-800 mt-2">
                      {latestInvoice.issuedDate}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2">
                      <Clock3
                        size={15}
                        className="text-[#155DFC]"
                      />

                      <span className="text-xs text-slate-500">
                        Jatuh Tempo
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-slate-800 mt-2">
                      {latestInvoice.dueDate}
                    </p>
                  </div>
                </div>

                {/* ACTION */}
                {latestInvoice.status === "Belum Dibayar" && (
                  <div className="mt-6 p-4 rounded-xl bg-[#f7f9ff] border border-[#c7dbff]">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#eaf1ff] flex items-center justify-center shrink-0">
                          <AlertCircle
                            size={17}
                            className="text-[#155DFC]"
                          />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            Tagihan belum dibayar
                          </p>

                          <p className="text-xs text-slate-500 mt-1">
                            Segera lakukan pembayaran sebelum tanggal
                            jatuh tempo agar layanan tetap aktif.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#155DFC] to-[#0d47c9] text-white text-sm font-semibold hover:brightness-110 transition"
                        >
                          <Wallet size={15} />
                          Bayar Sekarang
                        </button>

                        <button
                          type="button"
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50"
                        >
                          <Download size={15} />
                          Download Invoice
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* =================================================
                PAYMENT PROGRESS
            ================================================== */}
            <section className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Penyelesaian Tagihan
                  </p>

                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {paidPercentage}%
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    {paidInvoices.length} dari {INVOICES.length} invoice
                    telah lunas
                  </p>
                </div>

                <div className="w-full lg:max-w-xl">
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#155DFC] to-[#0d47c9]"
                      style={{
                        width: `${paidPercentage}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px] text-slate-400">
                      Lunas
                    </span>

                    <span className="text-[11px] font-semibold text-[#155DFC]">
                      {formatRupiah(totalPaid)}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                FILTER
            ================================================== */}
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
                    placeholder="Cari nomor invoice atau periode..."
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20 focus:border-[#155DFC]/50 text-slate-800"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value)
                    }
                    className="text-sm rounded-lg border border-slate-200 px-3 py-2.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20"
                  >
                    <option value="Semua">
                      Semua Status
                    </option>

                    <option value="Lunas">
                      Lunas
                    </option>

                    <option value="Belum Dibayar">
                      Belum Dibayar
                    </option>

                    <option value="Jatuh Tempo">
                      Jatuh Tempo
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

            {/* =================================================
                TABLE
            ================================================== */}
            <section className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-sm border-collapse">

                  <thead>
                    <tr className="bg-gradient-to-r from-[#155DFC] to-[#0d47c9] text-white">

                      <th className="text-center font-semibold px-4 py-3 w-[60px]">
                        No
                      </th>

                      <th className="text-left font-semibold px-4 py-3">
                        Invoice
                      </th>

                      <th className="text-left font-semibold px-4 py-3">
                        Periode
                      </th>

                      <th className="text-left font-semibold px-4 py-3">
                        Diterbitkan
                      </th>

                      <th className="text-left font-semibold px-4 py-3">
                        Jatuh Tempo
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

                    {filteredInvoices.map((item, index) => (
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
                            Paket {item.package}
                          </p>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <CalendarDays
                              size={14}
                              className="text-[#155DFC]"
                            />

                            <span className="text-xs font-medium text-slate-700">
                              {item.period}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span className="text-xs text-slate-600">
                            {item.issuedDate}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <span className="text-xs text-slate-600">
                            {item.dueDate}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <span className="text-sm font-bold text-slate-800">
                            {formatRupiah(item.amount)}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <InvoiceStatus status={item.status} />
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-2">

                            {/* DETAIL -> PINDAH HALAMAN */}
                            <button
                              type="button"
                              onClick={() =>
                                router.push(
                                  `/admin/langganan/invoice/${encodeURIComponent(
                                    item.id
                                  )}`
                                )
                              }
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[#155DFC] bg-[#eaf1ff] border border-[#c7dbff] hover:bg-[#d6e6ff] text-xs font-medium transition-colors"
                            >
                              <Eye size={13} />
                              Detail
                            </button>

                            {/* DOWNLOAD */}
                            <button
                              type="button"
                              className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"
                            >
                              <Download size={14} />
                            </button>

                          </div>
                        </td>

                      </tr>
                    ))}

                    {filteredInvoices.length === 0 && (
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
                              Invoice tidak ditemukan
                            </p>

                            <p className="text-xs text-slate-400 mt-1">
                              Coba ubah pencarian atau filter.
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
                    {filteredInvoices.length}
                  </span>{" "}
                  dari{" "}
                  <span className="font-semibold text-slate-700">
                    {INVOICES.length}
                  </span>{" "}
                  invoice
                </p>

                <div className="flex items-center gap-1.5">

                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-md border border-slate-200 bg-white text-xs text-slate-500 hover:bg-slate-50"
                  >
                    Sebelumnya
                  </button>

                  <button
                    type="button"
                    className="w-8 h-8 rounded-md bg-[#155DFC] text-white text-xs font-bold"
                  >
                    1
                  </button>

                  <button
                    type="button"
                    className="w-8 h-8 rounded-md border border-slate-200 bg-white text-slate-500 text-xs"
                  >
                    2
                  </button>

                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-md border border-slate-200 bg-white text-xs text-slate-500 hover:bg-slate-50"
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