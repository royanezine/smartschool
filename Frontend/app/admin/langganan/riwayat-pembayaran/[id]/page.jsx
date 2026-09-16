"use client";

import { useParams, useRouter } from "next/navigation";

import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";

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
      className:
        "bg-emerald-50 text-emerald-600 border-emerald-200",
    },

    Menunggu: {
      icon: Clock3,
      className:
        "bg-amber-50 text-amber-600 border-amber-200",
    },

    Gagal: {
      icon: Clock3,
      className:
        "bg-red-50 text-red-600 border-red-200",
    },
  };

  const current = config[status] || {
    icon: Clock3,
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
    <div className="p-4 rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center gap-2">
        <Icon size={15} className="text-[#155DFC]" />

        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 mt-2">
        <p className="text-sm font-semibold text-slate-800 break-all">
          {value}
        </p>

        {copy && (
          <button
            type="button"
            onClick={handleCopy}
            className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-[#155DFC] hover:bg-[#eaf1ff] transition"
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
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* SIDEBAR */}
      <Sidebar
        active="riwayatPembayaran"
        setActive={() => {}}
        role="admin"
      />

      {/* CONTENT */}
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

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* TOP */}
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/admin/langganan/riwayat-pembayaran"
                  )
                }
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#155DFC] transition w-fit"
              >
                <ArrowLeft size={16} />
                Kembali ke Riwayat Pembayaran
              </button>

              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#155DFC] to-[#0d47c9] text-white shadow-lg shadow-[#155DFC]/20">
                    <Receipt size={20} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl font-bold text-slate-800">
                        Detail Pembayaran
                      </h1>

                      <PaymentStatus
                        status={payment.status}
                      />
                    </div>

                    <p className="text-sm text-slate-500 mt-1">
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
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50"
                  >
                    <RefreshCw size={15} />
                    Refresh
                  </button>

                  {payment.status === "Berhasil" && (
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#155DFC] text-white text-sm font-semibold hover:bg-[#0d47c9]"
                    >
                      <Download size={15} />
                      Download Bukti
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* HERO */}
            <section className="bg-white rounded-xl border border-slate-200/80 shadow-sm">
              <div className="p-5 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-[#eaf1ff] flex items-center justify-center shrink-0">
                      <CreditCard
                        size={26}
                        className="text-[#155DFC]"
                      />
                    </div>

                    <div>
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                        ID Transaksi
                      </p>

                      <h2 className="text-xl font-bold text-slate-900 mt-1">
                        {payment.id}
                      </h2>

                      <p className="text-sm text-slate-500 mt-1">
                        Invoice {payment.invoice}
                      </p>
                    </div>
                  </div>

                  <div className="lg:text-right">
                    <p className="text-xs text-slate-400">
                      Total Pembayaran
                    </p>

                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      {formatRupiah(total)}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      {payment.period}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* DETAIL */}
            <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {/* TRANSACTION */}
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
                      Informasi Transaksi
                    </h2>

                    <p className="text-xs text-slate-400 mt-1">
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
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-lg bg-[#eaf1ff] flex items-center justify-center">
                    <Wallet
                      size={17}
                      className="text-[#155DFC]"
                    />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-800">
                      Metode Pembayaran
                    </h2>

                    <p className="text-xs text-slate-400 mt-1">
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

            {/* SCHOOL */}
            <section className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-[#eaf1ff] flex items-center justify-center">
                  <UserRound
                    size={17}
                    className="text-[#155DFC]"
                  />
                </div>

                <div>
                  <h2 className="font-bold text-slate-800">
                    Informasi Sekolah
                  </h2>

                  <p className="text-xs text-slate-400 mt-1">
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

            {/* BILLING */}
            <section className="bg-white rounded-xl border border-slate-200/80 shadow-sm">
              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-lg bg-[#eaf1ff] flex items-center justify-center">
                    <Wallet
                      size={17}
                      className="text-[#155DFC]"
                    />
                  </div>

                  <h2 className="font-bold text-slate-800">
                    Rincian Pembayaran
                  </h2>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-100">
                    <span className="text-sm text-slate-500">
                      Paket {payment.package}
                    </span>

                    <span className="text-sm font-semibold text-slate-800">
                      {formatRupiah(payment.amount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-100">
                    <span className="text-sm text-slate-500">
                      Biaya transaksi
                    </span>

                    <span className="text-sm font-semibold text-slate-800">
                      {formatRupiah(payment.transactionFee)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-4">
                    <span className="text-sm font-bold text-slate-800">
                      Total
                    </span>

                    <span className="text-xl font-bold text-[#155DFC]">
                      {formatRupiah(total)}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* NOTE */}
            <section className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                  <ShieldCheck
                    size={17}
                    className="text-emerald-600"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Catatan Transaksi
                  </p>

                  <p className="text-xs text-slate-500 mt-1 leading-5">
                    {payment.notes}
                  </p>
                </div>
              </div>
            </section>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/admin/langganan/riwayat-pembayaran"
                )
              }
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50"
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