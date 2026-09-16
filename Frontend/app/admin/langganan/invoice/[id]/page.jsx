"use client";

import { useParams, useRouter } from "next/navigation";

import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";

import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Copy,
  CreditCard,
  Download,
  FileText,
  Printer,
  Receipt,
  RefreshCw,
  ShieldCheck,
  Wallet,
} from "lucide-react";

// ============================================================
// MOCK DATA DETAIL INVOICE
// ============================================================

const INVOICES = {
  "INV-2026-0001": {
    id: "INV-2026-0001",
    package: "Professional",
    period: "September 2026",
    issuedDate: "01 September 2026",
    dueDate: "10 September 2026",
    amount: 1500000,
    discount: 0,
    tax: 0,
    status: "Belum Dibayar",
    paymentMethod: "Virtual Account",

    school: {
      name: "SMK Nusantara Digital",
      address: "Jl. Pendidikan No. 20, Jakarta",
      email: "admin@nusantaradigital.sch.id",
      phone: "021-88991234",
    },
  },

  "INV-2026-0002": {
    id: "INV-2026-0002",
    package: "Professional",
    period: "Agustus 2026",
    issuedDate: "01 Agustus 2026",
    dueDate: "10 Agustus 2026",
    amount: 1500000,
    discount: 0,
    tax: 0,
    status: "Lunas",
    paymentMethod: "QRIS",

    school: {
      name: "SMK Nusantara Digital",
      address: "Jl. Pendidikan No. 20, Jakarta",
      email: "admin@nusantaradigital.sch.id",
      phone: "021-88991234",
    },
  },

  "INV-2026-0003": {
    id: "INV-2026-0003",
    package: "Professional",
    period: "Juli 2026",
    issuedDate: "01 Juli 2026",
    dueDate: "10 Juli 2026",
    amount: 1500000,
    discount: 0,
    tax: 0,
    status: "Lunas",
    paymentMethod: "Virtual Account",

    school: {
      name: "SMK Nusantara Digital",
      address: "Jl. Pendidikan No. 20, Jakarta",
      email: "admin@nusantaradigital.sch.id",
      phone: "021-88991234",
    },
  },

  "INV-2026-0005": {
    id: "INV-2026-0005",
    package: "Professional",
    period: "Mei 2026",
    issuedDate: "01 Mei 2026",
    dueDate: "10 Mei 2026",
    amount: 1500000,
    discount: 0,
    tax: 0,
    status: "Jatuh Tempo",
    paymentMethod: "Virtual Account",

    school: {
      name: "SMK Nusantara Digital",
      address: "Jl. Pendidikan No. 20, Jakarta",
      email: "admin@nusantaradigital.sch.id",
      phone: "021-88991234",
    },
  },
};

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
// STATUS
// ============================================================

function InvoiceStatus({ status }) {
  const config = {
    Lunas: {
      icon: CheckCircle2,
      className:
        "bg-emerald-50 text-emerald-600 border-emerald-200",
    },

    "Belum Dibayar": {
      icon: Clock3,
      className:
        "bg-amber-50 text-amber-600 border-amber-200",
    },

    "Jatuh Tempo": {
      icon: AlertCircle,
      className:
        "bg-red-50 text-red-600 border-red-200",
    },
  };

  const current = config[status] || {
    icon: FileText,
    className:
      "bg-slate-100 text-slate-500 border-slate-200",
  };

  const Icon = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${current.className}`}
    >
      <Icon size={13} />
      {status}
    </span>
  );
}

// ============================================================
// DETAIL ITEM
// ============================================================

function DetailItem({
  icon: Icon,
  label,
  value,
  copy = false,
}) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (error) {
      console.error("Gagal menyalin:", error);
    }
  };

  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center gap-2">
        <Icon
          size={15}
          className="text-[#155DFC]"
        />

        <span className="text-[11px] uppercase tracking-wide font-medium text-slate-400">
          {label}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 mt-2">
        <p className="text-sm font-semibold text-slate-800 break-words">
          {value}
        </p>

        {copy && (
          <button
            type="button"
            onClick={handleCopy}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center shrink-0 text-slate-400 hover:text-[#155DFC] hover:bg-[#eaf1ff] transition"
            title="Salin"
          >
            <Copy size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// PAGE
// ============================================================

export default function DetailInvoicePage() {
  const router = useRouter();
  const params = useParams();

  const invoiceId = params?.id;

  const invoice =
    INVOICES[invoiceId] ||
    INVOICES["INV-2026-0001"];

  const subtotal = invoice.amount;

  const total =
    subtotal -
    invoice.discount +
    invoice.tax;

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">

      {/* =====================================================
          SIDEBAR
      ====================================================== */}
      <Sidebar
        active="invoice"
        setActive={() => {}}
        role="admin"
      />

      {/* =====================================================
          CONTENT
      ====================================================== */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

        <Header
          toggleSidebar={() => {}}
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
                HEADER
            ================================================== */}
            <div className="flex flex-col gap-4">

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/admin/langganan/invoice"
                  )
                }
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#155DFC] transition w-fit"
              >
                <ArrowLeft size={16} />
                Kembali ke Tagihan / Invoice
              </button>

              <div className="flex items-center justify-between gap-4 flex-wrap">

                <div className="flex items-center gap-3">

                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#155DFC] to-[#0d47c9] text-white shadow-lg shadow-[#155DFC]/20">
                    <FileText size={20} />
                  </div>

                  <div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl font-bold text-slate-800">
                        Detail Invoice
                      </h1>

                      <InvoiceStatus
                        status={invoice.status}
                      />
                    </div>

                    <p className="text-sm text-slate-500 mt-1">
                      Informasi lengkap tagihan langganan sekolah.
                    </p>

                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      window.location.reload()
                    }
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50"
                  >
                    <RefreshCw size={15} />
                    Refresh
                  </button>

                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50"
                  >
                    <Printer size={15} />
                    Cetak
                  </button>

                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#155DFC] text-white text-sm font-semibold hover:bg-[#0d47c9]"
                  >
                    <Download size={15} />
                    Download
                  </button>

                </div>
              </div>
            </div>

            {/* =================================================
                HERO
            ================================================== */}
            <section className="bg-white rounded-xl border border-slate-200/80 shadow-sm">
              <div className="p-5 sm:p-6">

                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

                  <div>

                    <div className="w-12 h-12 rounded-xl bg-[#eaf1ff] flex items-center justify-center">
                      <Receipt
                        size={22}
                        className="text-[#155DFC]"
                      />
                    </div>

                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mt-5">
                      Nomor Invoice
                    </p>

                    <div className="flex items-center gap-2 mt-1">

                      <h2 className="text-2xl font-bold text-slate-900">
                        {invoice.id}
                      </h2>

                      <button
                        type="button"
                        onClick={() =>
                          navigator.clipboard?.writeText(
                            invoice.id
                          )
                        }
                        className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#155DFC] hover:bg-[#eaf1ff]"
                        title="Salin nomor invoice"
                      >
                        <Copy size={14} />
                      </button>

                    </div>

                    <p className="text-sm text-slate-500 mt-2">
                      Paket {invoice.package} ·{" "}
                      {invoice.period}
                    </p>

                  </div>

                  <div className="lg:text-right">

                    <p className="text-xs text-slate-400">
                      Total Tagihan
                    </p>

                    <p className="text-3xl font-bold text-[#155DFC] mt-1">
                      {formatRupiah(total)}
                    </p>

                    <p className="text-xs text-slate-400 mt-2">
                      Jatuh tempo {invoice.dueDate}
                    </p>

                  </div>

                </div>

              </div>
            </section>

            {/* =================================================
                WARNING
            ================================================== */}
            {invoice.status === "Belum Dibayar" && (
              <section className="bg-white rounded-xl border border-[#c7dbff] shadow-sm p-5">

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                  <div className="flex items-start gap-3">

                    <div className="w-10 h-10 rounded-lg bg-[#eaf1ff] flex items-center justify-center shrink-0">
                      <Clock3
                        size={18}
                        className="text-[#155DFC]"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        Tagihan belum dibayar
                      </p>

                      <p className="text-xs text-slate-500 mt-1 leading-5">
                        Lakukan pembayaran sebelum{" "}
                        {invoice.dueDate} untuk menjaga
                        layanan tetap aktif.
                      </p>
                    </div>

                  </div>

                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#155DFC] to-[#0d47c9] text-white text-sm font-semibold hover:brightness-110"
                  >
                    <Wallet size={16} />
                    Bayar Sekarang
                  </button>

                </div>
              </section>
            )}

            {/* =================================================
                OVERDUE
            ================================================== */}
            {invoice.status === "Jatuh Tempo" && (
              <section className="bg-red-50 rounded-xl border border-red-200 shadow-sm p-5">

                <div className="flex items-start gap-3">

                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                    <AlertCircle
                      size={18}
                      className="text-red-600"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-red-700">
                      Invoice telah melewati jatuh tempo
                    </p>

                    <p className="text-xs text-red-600 mt-1 leading-5">
                      Segera selesaikan pembayaran untuk
                      menghindari penghentian layanan.
                    </p>
                  </div>

                </div>

              </section>
            )}

            {/* =================================================
                INFORMATION
            ================================================== */}
            <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">

              {/* INVOICE INFO */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 sm:p-6">

                <div className="flex items-center gap-3 mb-5">

                  <div className="w-9 h-9 rounded-lg bg-[#eaf1ff] flex items-center justify-center">
                    <FileText
                      size={17}
                      className="text-[#155DFC]"
                    />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-800">
                      Informasi Invoice
                    </h2>

                    <p className="text-xs text-slate-400 mt-1">
                      Detail penerbitan tagihan.
                    </p>
                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  <DetailItem
                    icon={FileText}
                    label="Nomor Invoice"
                    value={invoice.id}
                    copy
                  />

                  <DetailItem
                    icon={CreditCard}
                    label="Paket"
                    value={invoice.package}
                  />

                  <DetailItem
                    icon={CalendarDays}
                    label="Periode"
                    value={invoice.period}
                  />

                  <DetailItem
                    icon={CalendarDays}
                    label="Diterbitkan"
                    value={invoice.issuedDate}
                  />

                  <DetailItem
                    icon={CalendarClock}
                    label="Jatuh Tempo"
                    value={invoice.dueDate}
                  />

                  <DetailItem
                    icon={Wallet}
                    label="Metode Pembayaran"
                    value={invoice.paymentMethod}
                  />

                </div>
              </div>

              {/* SCHOOL INFO */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 sm:p-6">

                <div className="flex items-center gap-3 mb-5">

                  <div className="w-9 h-9 rounded-lg bg-[#eaf1ff] flex items-center justify-center">
                    <ShieldCheck
                      size={17}
                      className="text-[#155DFC]"
                    />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-800">
                      Informasi Sekolah
                    </h2>

                    <p className="text-xs text-slate-400 mt-1">
                      Data penerima tagihan.
                    </p>
                  </div>

                </div>

                <div className="space-y-3">

                  <DetailItem
                    icon={Receipt}
                    label="Nama Sekolah"
                    value={invoice.school.name}
                  />

                  <DetailItem
                    icon={FileText}
                    label="Alamat"
                    value={invoice.school.address}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    <DetailItem
                      icon={FileText}
                      label="Email"
                      value={invoice.school.email}
                    />

                    <DetailItem
                      icon={CreditCard}
                      label="Telepon"
                      value={invoice.school.phone}
                    />

                  </div>

                </div>
              </div>
            </section>

            {/* =================================================
                BILLING DETAIL
            ================================================== */}
            <section className="bg-white rounded-xl border border-slate-200/80 shadow-sm">

              <div className="p-5 sm:p-6">

                <div className="flex items-center gap-3 mb-6">

                  <div className="w-9 h-9 rounded-lg bg-[#eaf1ff] flex items-center justify-center">
                    <Wallet
                      size={17}
                      className="text-[#155DFC]"
                    />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-800">
                      Rincian Tagihan
                    </h2>

                    <p className="text-xs text-slate-400 mt-1">
                      Detail perhitungan invoice.
                    </p>
                  </div>

                </div>

                <div className="space-y-1">

                  <div className="flex items-center justify-between gap-4 py-4 border-b border-slate-100">

                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        Paket {invoice.package}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        {invoice.period}
                      </p>
                    </div>

                    <p className="text-sm font-semibold text-slate-800">
                      {formatRupiah(invoice.amount)}
                    </p>

                  </div>

                  <div className="flex items-center justify-between gap-4 py-4 border-b border-slate-100">

                    <p className="text-sm text-slate-500">
                      Diskon
                    </p>

                    <p className="text-sm font-semibold text-slate-800">
                      - {formatRupiah(invoice.discount)}
                    </p>

                  </div>

                  <div className="flex items-center justify-between gap-4 py-4 border-b border-slate-100">

                    <p className="text-sm text-slate-500">
                      Pajak
                    </p>

                    <p className="text-sm font-semibold text-slate-800">
                      {formatRupiah(invoice.tax)}
                    </p>

                  </div>

                  <div className="flex items-center justify-between gap-4 pt-5">

                    <p className="text-base font-bold text-slate-900">
                      Total Tagihan
                    </p>

                    <p className="text-2xl font-bold text-[#155DFC]">
                      {formatRupiah(total)}
                    </p>

                  </div>

                </div>
              </div>
            </section>

            {/* =================================================
                STATUS
            ================================================== */}
            <section className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 sm:p-6">

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                    Status Invoice
                  </p>

                  <div className="mt-2">
                    <InvoiceStatus
                      status={invoice.status}
                    />
                  </div>
                </div>

                <div className="lg:text-right">

                  <p className="text-xs text-slate-400">
                    Nilai Invoice
                  </p>

                  <p className="text-xl font-bold text-slate-900 mt-1">
                    {formatRupiah(total)}
                  </p>

                </div>

              </div>
            </section>

            {/* =================================================
                ACTION
            ================================================== */}
            <div className="flex flex-col sm:flex-row gap-3">

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/admin/langganan/invoice"
                  )
                }
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50"
              >
                <ArrowLeft size={15} />
                Kembali
              </button>

              {invoice.status !== "Lunas" && (
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#155DFC] to-[#0d47c9] text-white text-sm font-semibold hover:brightness-110"
                >
                  <Wallet size={16} />
                  Bayar Invoice
                </button>
              )}

              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50"
              >
                <Download size={15} />
                Download Invoice
              </button>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}