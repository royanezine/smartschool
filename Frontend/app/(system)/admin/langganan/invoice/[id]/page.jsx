"use client";

import { useParams, useRouter } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

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
// THEME HELPERS
// ============================================================

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]";

const themePrimaryHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";

const themePrimaryShadow =
  "shadow-[0_10px_25px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]";

const themeHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";

// ============================================================
// STATUS
// ============================================================

function InvoiceStatus({ status }) {
  const config = {
    Lunas: {
      icon: CheckCircle2,
      className: "theme-success",
    },

    "Belum Dibayar": {
      icon: Clock3,
      className: "theme-warning",
    },

    "Jatuh Tempo": {
      icon: AlertCircle,
      className: "theme-danger",
    },
  };

  const current = config[status] || {
    icon: FileText,
    className: "theme-text-muted theme-card-soft theme-border",
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
    <div className="p-4 rounded-xl border theme-border theme-card-soft">
      <div className="flex items-center gap-2">
        <Icon
          size={15}
          className="text-[var(--color-primary)]"
        />

        <span className="text-[11px] uppercase tracking-wide font-medium theme-text-muted">
          {label}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 mt-2">
        <p className="text-sm font-semibold theme-text break-words">
          {value}
        </p>

        {copy && (
          <button
            type="button"
            onClick={handleCopy}
            className={`
              w-8 h-8 rounded-lg border theme-border
              flex items-center justify-center shrink-0
              theme-text-muted
              ${themePrimaryHover}
              hover:text-[var(--color-primary)]
              transition
            `}
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
    <div className="flex h-screen w-full theme-page overflow-hidden">

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

        <main className="flex-1 overflow-y-auto theme-page">
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
                className="
                  inline-flex items-center gap-2
                  text-sm font-medium
                  theme-text-secondary
                  hover:text-[var(--color-primary)]
                  transition
                  w-fit
                "
              >
                <ArrowLeft size={16} />
                Kembali ke Tagihan / Invoice
              </button>

              <div className="flex items-center justify-between gap-4 flex-wrap">

                <div className="flex items-center gap-3">

                  <div
                    className={`
                      p-2.5 rounded-xl
                      ${themePrimarySoft}
                      text-[var(--color-primary)]
                      border ${themePrimarySoftBorder}
                    `}
                  >
                    <FileText size={20} />
                  </div>

                  <div>

                    <div className="flex items-center gap-2 flex-wrap">

                      <h1 className="text-2xl font-bold theme-text">
                        Detail Invoice
                      </h1>

                      <InvoiceStatus
                        status={invoice.status}
                      />

                    </div>

                    <p className="text-sm theme-text-secondary mt-1">
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
                    className="
                      inline-flex items-center justify-center gap-2
                      px-4 py-2.5 rounded-xl
                      border theme-border
                      theme-card
                      theme-text-secondary
                      text-sm font-semibold
                      hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
                      transition
                    "
                  >
                    <RefreshCw size={15} />
                    Refresh
                  </button>

                  <button
                    type="button"
                    className="
                      inline-flex items-center justify-center gap-2
                      px-4 py-2.5 rounded-xl
                      border theme-border
                      theme-card
                      theme-text-secondary
                      text-sm font-semibold
                      hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
                      transition
                    "
                  >
                    <Printer size={15} />
                    Cetak
                  </button>

                  <button
                    type="button"
                    className={`
                      inline-flex items-center justify-center gap-2
                      px-4 py-2.5 rounded-xl
                      theme-primary
                      text-sm font-semibold
                      ${themePrimaryShadow}
                      hover:brightness-110
                      transition
                    `}
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
            <section className="theme-card rounded-xl border theme-border shadow-sm">

              <div className="p-5 sm:p-6">

                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

                  <div>

                    <div
                      className={`
                        w-12 h-12 rounded-xl
                        ${themePrimarySoft}
                        flex items-center justify-center
                        border ${themePrimarySoftBorder}
                      `}
                    >
                      <Receipt
                        size={22}
                        className="text-[var(--color-primary)]"
                      />
                    </div>

                    <p className="text-xs font-medium uppercase tracking-wide theme-text-muted mt-5">
                      Nomor Invoice
                    </p>

                    <div className="flex items-center gap-2 mt-1">

                      <h2 className="text-2xl font-bold theme-text">
                        {invoice.id}
                      </h2>

                      <button
                        type="button"
                        onClick={() =>
                          navigator.clipboard?.writeText(
                            invoice.id
                          )
                        }
                        className={`
                          w-8 h-8 rounded-lg
                          border theme-border
                          flex items-center justify-center
                          theme-text-muted
                          ${themePrimaryHover}
                          hover:text-[var(--color-primary)]
                          transition
                        `}
                        title="Salin nomor invoice"
                      >
                        <Copy size={14} />
                      </button>

                    </div>

                    <p className="text-sm theme-text-secondary mt-2">
                      Paket {invoice.package} ·{" "}
                      {invoice.period}
                    </p>

                  </div>

                  <div className="lg:text-right">

                    <p className="text-xs theme-text-muted">
                      Total Tagihan
                    </p>

                    <p className="text-3xl font-bold text-[var(--color-primary)] mt-1">
                      {formatRupiah(total)}
                    </p>

                    <p className="text-xs theme-text-muted mt-2">
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
              <section
                className={`
                  theme-card rounded-xl border
                  ${themePrimarySoftBorder}
                  shadow-sm p-5
                `}
              >

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                  <div className="flex items-start gap-3">

                    <div
                      className={`
                        w-10 h-10 rounded-lg
                        ${themePrimarySoft}
                        flex items-center justify-center
                        shrink-0
                      `}
                    >
                      <Clock3
                        size={18}
                        className="text-[var(--color-primary)]"
                      />
                    </div>

                    <div>

                      <p className="text-sm font-bold theme-text">
                        Tagihan belum dibayar
                      </p>

                      <p className="text-xs theme-text-secondary mt-1 leading-5">
                        Lakukan pembayaran sebelum{" "}
                        {invoice.dueDate} untuk menjaga
                        layanan tetap aktif.
                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    className={`
                      inline-flex items-center justify-center gap-2
                      px-5 py-2.5 rounded-xl
                      theme-primary
                      text-sm font-semibold
                      ${themePrimaryShadow}
                      hover:brightness-110
                      transition
                    `}
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
              <section
                className="
                  rounded-xl border
                  theme-danger
                  shadow-sm p-5
                "
              >

                <div className="flex items-start gap-3">

                  <div
                    className="
                      w-10 h-10 rounded-lg
                      bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]
                      flex items-center justify-center
                      shrink-0
                    "
                  >
                    <AlertCircle size={18} />
                  </div>

                  <div>

                    <p className="text-sm font-bold">
                      Invoice telah melewati jatuh tempo
                    </p>

                    <p className="text-xs mt-1 leading-5 opacity-90">
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
              <div className="theme-card rounded-xl border theme-border shadow-sm p-5 sm:p-6">

                <div className="flex items-center gap-3 mb-5">

                  <div
                    className={`
                      w-9 h-9 rounded-lg
                      ${themePrimarySoft}
                      flex items-center justify-center
                    `}
                  >
                    <FileText
                      size={17}
                      className="text-[var(--color-primary)]"
                    />
                  </div>

                  <div>

                    <h2 className="font-bold theme-text">
                      Informasi Invoice
                    </h2>

                    <p className="text-xs theme-text-muted mt-1">
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
              <div className="theme-card rounded-xl border theme-border shadow-sm p-5 sm:p-6">

                <div className="flex items-center gap-3 mb-5">

                  <div
                    className={`
                      w-9 h-9 rounded-lg
                      ${themePrimarySoft}
                      flex items-center justify-center
                    `}
                  >
                    <ShieldCheck
                      size={17}
                      className="text-[var(--color-primary)]"
                    />
                  </div>

                  <div>

                    <h2 className="font-bold theme-text">
                      Informasi Sekolah
                    </h2>

                    <p className="text-xs theme-text-muted mt-1">
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
            <section className="theme-card rounded-xl border theme-border shadow-sm">

              <div className="p-5 sm:p-6">

                <div className="flex items-center gap-3 mb-6">

                  <div
                    className={`
                      w-9 h-9 rounded-lg
                      ${themePrimarySoft}
                      flex items-center justify-center
                    `}
                  >
                    <Wallet
                      size={17}
                      className="text-[var(--color-primary)]"
                    />
                  </div>

                  <div>

                    <h2 className="font-bold theme-text">
                      Rincian Tagihan
                    </h2>

                    <p className="text-xs theme-text-muted mt-1">
                      Detail perhitungan invoice.
                    </p>

                  </div>

                </div>

                <div className="space-y-1">

                  <div className="flex items-center justify-between gap-4 py-4 border-b theme-border-soft">

                    <div>

                      <p className="text-sm font-semibold theme-text-secondary">
                        Paket {invoice.package}
                      </p>

                      <p className="text-xs theme-text-muted mt-1">
                        {invoice.period}
                      </p>

                    </div>

                    <p className="text-sm font-semibold theme-text">
                      {formatRupiah(invoice.amount)}
                    </p>

                  </div>

                  <div className="flex items-center justify-between gap-4 py-4 border-b theme-border-soft">

                    <p className="text-sm theme-text-secondary">
                      Diskon
                    </p>

                    <p className="text-sm font-semibold theme-text">
                      - {formatRupiah(invoice.discount)}
                    </p>

                  </div>

                  <div className="flex items-center justify-between gap-4 py-4 border-b theme-border-soft">

                    <p className="text-sm theme-text-secondary">
                      Pajak
                    </p>

                    <p className="text-sm font-semibold theme-text">
                      {formatRupiah(invoice.tax)}
                    </p>

                  </div>

                  <div className="flex items-center justify-between gap-4 pt-5">

                    <p className="text-base font-bold theme-text">
                      Total Tagihan
                    </p>

                    <p className="text-2xl font-bold text-[var(--color-primary)]">
                      {formatRupiah(total)}
                    </p>

                  </div>

                </div>
              </div>
            </section>

            {/* =================================================
                STATUS
            ================================================== */}
            <section className="theme-card rounded-xl border theme-border shadow-sm p-5 sm:p-6">

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                <div>

                  <p className="text-xs font-medium theme-text-muted uppercase tracking-wide">
                    Status Invoice
                  </p>

                  <div className="mt-2">
                    <InvoiceStatus
                      status={invoice.status}
                    />
                  </div>

                </div>

                <div className="lg:text-right">

                  <p className="text-xs theme-text-muted">
                    Nilai Invoice
                  </p>

                  <p className="text-xl font-bold theme-text mt-1">
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
                className="
                  inline-flex items-center justify-center gap-2
                  px-5 py-3 rounded-xl
                  border theme-border
                  theme-card
                  theme-text-secondary
                  text-sm font-semibold
                  hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
                  transition
                "
              >
                <ArrowLeft size={15} />
                Kembali
              </button>

              {invoice.status !== "Lunas" && (
                <button
                  type="button"
                  className={`
                    inline-flex items-center justify-center gap-2
                    px-5 py-3 rounded-xl
                    theme-primary
                    text-sm font-semibold
                    ${themePrimaryShadow}
                    hover:brightness-110
                    transition
                  `}
                >
                  <Wallet size={16} />
                  Bayar Invoice
                </button>
              )}

              <button
                type="button"
                className="
                  inline-flex items-center justify-center gap-2
                  px-5 py-3 rounded-xl
                  border theme-border
                  theme-card
                  theme-text-secondary
                  text-sm font-semibold
                  hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
                  transition
                "
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