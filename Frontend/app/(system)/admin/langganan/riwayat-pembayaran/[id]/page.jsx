"use client";

import { useParams, useRouter } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Copy,
  CreditCard,
  Download,
  FileText,
  Receipt,
  RefreshCw,
  ShieldCheck,
  UserRound,
  Wallet,
} from "lucide-react";

// ============================================================
// MOCK DATA
// ============================================================

const PAYMENTS = {
  "PAY-2026-0001": {
    id: "PAY-2026-0001",
    invoice: "INV-2026-0001",
    package: "Professional",
    amount: 1500000,
    transactionFee: 0,
    method: "Virtual Account",
    bank: "BCA",
    vaNumber: "8808123456789012",
    date: "15 Januari 2026",
    time: "09:42:17 WIB",
    period: "Januari 2026",
    status: "Berhasil",

    school: {
      name: "SMK Nusantara Digital",
      email: "admin@nusantaradigital.sch.id",
      phone: "021-88991234",
    },

    notes:
      "Pembayaran langganan paket Professional untuk periode Januari 2026.",
  },

  "PAY-2026-0002": {
    id: "PAY-2026-0002",
    invoice: "INV-2026-0002",
    package: "Professional",
    amount: 1500000,
    transactionFee: 0,
    method: "QRIS",
    bank: "-",
    vaNumber: "-",
    date: "15 Februari 2026",
    time: "10:15:43 WIB",
    period: "Februari 2026",
    status: "Berhasil",

    school: {
      name: "SMK Nusantara Digital",
      email: "admin@nusantaradigital.sch.id",
      phone: "021-88991234",
    },

    notes:
      "Pembayaran langganan paket Professional untuk periode Februari 2026.",
  },

  "PAY-2026-0009": {
    id: "PAY-2026-0009",
    invoice: "INV-2026-0009",
    package: "Professional",
    amount: 1500000,
    transactionFee: 0,
    method: "Virtual Account",
    bank: "BCA",
    vaNumber: "8808123456789012",
    date: "15 September 2026",
    time: "-",
    period: "September 2026",
    status: "Menunggu",

    school: {
      name: "SMK Nusantara Digital",
      email: "admin@nusantaradigital.sch.id",
      phone: "021-88991234",
    },

    notes:
      "Pembayaran belum selesai. Silakan lanjutkan pembayaran melalui metode yang dipilih.",
  },
};

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
// STATUS
// ============================================================

function PaymentStatus({ status }) {
  const config = {
    Berhasil: {
      icon: CheckCircle2,
      className: "theme-success",
    },

    Menunggu: {
      icon: Clock3,
      className: "theme-warning",
    },

    Gagal: {
      icon: Clock3,
      className: "theme-danger",
    },
  };

  const current = config[status] || {
    icon: Clock3,
    className: "theme-text-muted theme-border",
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
// DETAIL BOX
// ============================================================

function DetailBox({
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
    <div className="p-4 rounded-xl border theme-border theme-card">
      <div className="flex items-center gap-2">
        <Icon
          size={15}
          className="text-[var(--color-primary)]"
        />

        <p className="text-[11px] font-medium uppercase tracking-wide theme-text-muted">
          {label}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 mt-2">
        <p className="text-sm font-semibold theme-text break-all">
          {value}
        </p>

        {copy && (
          <button
            type="button"
            onClick={handleCopy}
            className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-lg border theme-border theme-text-muted ${themePrimaryHover} hover:text-[var(--color-primary)] transition`}
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

export default function DetailPembayaranPage() {
  const router = useRouter();
  const params = useParams();

  const paymentId = params?.id;

  const payment =
    PAYMENTS[paymentId] ||
    PAYMENTS["PAY-2026-0001"];

  const total =
    payment.amount + payment.transactionFee;

  return (
    <div className="flex h-screen w-full theme-page overflow-hidden">
      {/* ======================================================
          SIDEBAR
      ====================================================== */}
      <Sidebar
        active="riwayatPembayaran"
        setActive={() => {}}
        role="admin"
      />

      {/* ======================================================
          CONTENT
      ====================================================== */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* HEADER */}
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

            {/* ==================================================
                TOP
            ================================================== */}
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/admin/langganan/riwayat-pembayaran"
                  )
                }
                className="inline-flex items-center gap-2 text-sm font-medium theme-text-secondary hover:text-[var(--color-primary)] transition w-fit"
              >
                <ArrowLeft size={16} />
                Kembali ke Riwayat Pembayaran
              </button>

              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl ${themePrimarySoft} ${themePrimarySoftBorder} border text-[var(--color-primary)] ${themePrimaryShadow}`}
                  >
                    <Receipt size={20} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl font-bold theme-text">
                        Detail Pembayaran
                      </h1>

                      <PaymentStatus
                        status={payment.status}
                      />
                    </div>

                    <p className="text-sm theme-text-secondary mt-1">
                      Informasi lengkap transaksi pembayaran
                      langganan sekolah.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      window.location.reload()
                    }
                    className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border theme-border theme-card theme-text-secondary text-sm font-semibold ${themeTextHover} transition`}
                  >
                    <RefreshCw size={15} />
                    Refresh
                  </button>

                  {payment.status === "Berhasil" && (
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:opacity-90 transition"
                    >
                      <Download size={15} />
                      Download Bukti
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ==================================================
                HERO
            ================================================== */}
            <section className="theme-card theme-border rounded-xl border shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)]">
              <div className="p-5 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 rounded-xl ${themePrimarySoft} flex items-center justify-center shrink-0`}
                    >
                      <CreditCard
                        size={26}
                        className="text-[var(--color-primary)]"
                      />
                    </div>

                    <div>
                      <p className="text-xs font-medium theme-text-muted uppercase tracking-wide">
                        ID Transaksi
                      </p>

                      <h2 className="text-xl font-bold theme-text mt-1">
                        {payment.id}
                      </h2>

                      <p className="text-sm theme-text-secondary mt-1">
                        Invoice {payment.invoice}
                      </p>
                    </div>
                  </div>

                  <div className="lg:text-right">
                    <p className="text-xs theme-text-muted">
                      Total Pembayaran
                    </p>

                    <p className="text-3xl font-bold theme-text mt-1">
                      {formatRupiah(total)}
                    </p>

                    <p className="text-xs theme-text-muted mt-1">
                      {payment.period}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ==================================================
                DETAIL
            ================================================== */}
            <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">

              {/* TRANSACTION */}
              <div className="theme-card theme-border rounded-xl border shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)] p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className={`w-9 h-9 rounded-lg ${themePrimarySoft} flex items-center justify-center`}
                  >
                    <FileText
                      size={17}
                      className="text-[var(--color-primary)]"
                    />
                  </div>

                  <div>
                    <h2 className="font-bold theme-text">
                      Informasi Transaksi
                    </h2>

                    <p className="text-xs theme-text-muted mt-1">
                      Detail transaksi pembayaran.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <DetailBox
                    icon={Receipt}
                    label="ID Transaksi"
                    value={payment.id}
                    copy
                  />

                  <DetailBox
                    icon={FileText}
                    label="Invoice"
                    value={payment.invoice}
                    copy
                  />

                  <DetailBox
                    icon={CalendarDays}
                    label="Tanggal"
                    value={payment.date}
                  />

                  <DetailBox
                    icon={Clock3}
                    label="Waktu"
                    value={payment.time}
                  />

                  <DetailBox
                    icon={CreditCard}
                    label="Paket"
                    value={payment.package}
                  />

                  <DetailBox
                    icon={CalendarDays}
                    label="Periode"
                    value={payment.period}
                  />
                </div>
              </div>

              {/* METHOD */}
              <div className="theme-card theme-border rounded-xl border shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)] p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className={`w-9 h-9 rounded-lg ${themePrimarySoft} flex items-center justify-center`}
                  >
                    <Wallet
                      size={17}
                      className="text-[var(--color-primary)]"
                    />
                  </div>

                  <div>
                    <h2 className="font-bold theme-text">
                      Metode Pembayaran
                    </h2>

                    <p className="text-xs theme-text-muted mt-1">
                      Informasi metode pembayaran.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <DetailBox
                    icon={CreditCard}
                    label="Metode"
                    value={payment.method}
                  />

                  <DetailBox
                    icon={Wallet}
                    label="Bank / Provider"
                    value={payment.bank}
                  />

                  {payment.vaNumber !== "-" && (
                    <DetailBox
                      icon={CreditCard}
                      label="Nomor VA"
                      value={payment.vaNumber}
                      copy
                    />
                  )}
                </div>
              </div>
            </section>

            {/* ==================================================
                SCHOOL
            ================================================== */}
            <section className="theme-card theme-border rounded-xl border shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)] p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-5">
                <div
                  className={`w-9 h-9 rounded-lg ${themePrimarySoft} flex items-center justify-center`}
                >
                  <UserRound
                    size={17}
                    className="text-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <h2 className="font-bold theme-text">
                    Informasi Sekolah
                  </h2>

                  <p className="text-xs theme-text-muted mt-1">
                    Data sekolah pemilik transaksi.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <DetailBox
                  icon={UserRound}
                  label="Nama Sekolah"
                  value={payment.school.name}
                />

                <DetailBox
                  icon={FileText}
                  label="Email"
                  value={payment.school.email}
                />

                <DetailBox
                  icon={CreditCard}
                  label="Telepon"
                  value={payment.school.phone}
                />
              </div>
            </section>

            {/* ==================================================
                BILLING
            ================================================== */}
            <section className="theme-card theme-border rounded-xl border shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)]">
              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className={`w-9 h-9 rounded-lg ${themePrimarySoft} flex items-center justify-center`}
                  >
                    <Wallet
                      size={17}
                      className="text-[var(--color-primary)]"
                    />
                  </div>

                  <h2 className="font-bold theme-text">
                    Rincian Pembayaran
                  </h2>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-4 py-3 theme-border-soft border-b">
                    <span className="text-sm theme-text-secondary">
                      Paket {payment.package}
                    </span>

                    <span className="text-sm font-semibold theme-text">
                      {formatRupiah(payment.amount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-3 theme-border-soft border-b">
                    <span className="text-sm theme-text-secondary">
                      Biaya transaksi
                    </span>

                    <span className="text-sm font-semibold theme-text">
                      {formatRupiah(payment.transactionFee)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-4">
                    <span className="text-sm font-bold theme-text">
                      Total
                    </span>

                    <span className="text-xl font-bold text-[var(--color-primary)]">
                      {formatRupiah(total)}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* ==================================================
                NOTE
            ================================================== */}
            <section className="theme-card theme-border rounded-xl border shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)] p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg theme-success flex items-center justify-center shrink-0">
                  <ShieldCheck
                    size={17}
                    className="text-[var(--color-success)]"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold theme-text">
                    Catatan Transaksi
                  </p>

                  <p className="text-xs theme-text-secondary mt-1 leading-5">
                    {payment.notes}
                  </p>
                </div>
              </div>
            </section>

            {/* ==================================================
                BACK BUTTON
            ================================================== */}
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/admin/langganan/riwayat-pembayaran"
                )
              }
              className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border theme-border theme-card theme-text-secondary text-sm font-semibold ${themeTextHover} transition`}
            >
              <ArrowLeft size={15} />
              Kembali ke Riwayat Pembayaran
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}