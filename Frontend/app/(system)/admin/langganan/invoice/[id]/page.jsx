"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Copy,
  CreditCard,
  FileText,
  Loader2,
  Printer,
  Receipt,
  RefreshCw,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import { getRiwayatPembayaran } from "@/services/langganan.service";
import {
  formatRupiah,
  formatTanggal,
  siklusLabel,
  statusLanggananInfo,
} from "@/lib/langganan";


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


function invoiceStatusInfo(status) {
  switch (status) {
    case "success":
      return {
        label: "Lunas",
        className: "theme-success",
        icon: CheckCircle2,
      };
    case "pending":
      return {
        label: "Belum Dibayar",
        className: "theme-warning",
        icon: Clock3,
      };
    case "failed":
      return {
        label: "Gagal",
        className: "theme-danger",
        icon: AlertCircle,
      };
    default:
      return {
        label: "Tidak diketahui",
        className: "theme-card-soft theme-text-muted theme-border",
        icon: FileText,
      };
  }
}

function InvoiceStatus({ status }) {
  const info = invoiceStatusInfo(status);
  const Icon = info.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${info.className}`}
    >
      <Icon size={13} />
      {info.label}
    </span>
  );
}


function DetailItem({ icon: Icon, label, value, copy = false }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(value));
    } catch (error) {
    }
  };

  return (
    <div className="p-4 rounded-xl border theme-border theme-card-soft">
      <div className="flex items-center gap-2">
        <Icon size={15} className="text-[var(--color-primary)]" />

        <span className="text-[11px] uppercase tracking-wide font-medium theme-text-muted">
          {label}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 mt-2">
        <p className="text-sm font-semibold theme-text break-all">
          {value ?? "-"}
        </p>

        {copy && value && value !== "-" && (
          <button
            type="button"
            onClick={handleCopy}
            className={`w-8 h-8 rounded-lg border theme-border flex items-center justify-center shrink-0 theme-text-muted ${themePrimaryHover} hover:text-[var(--color-primary)] transition`}
            title="Salin"
          >
            <Copy size={14} />
          </button>
        )}
      </div>
    </div>
  );
}


export default function DetailInvoicePage() {
  const router = useRouter();
  const params = useParams();

  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    if (!id) {
      setError("ID invoice tidak ditemukan.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const list = await getRiwayatPembayaran();
      const found = list.find((item) => item.id === id) ?? null;

      if (!found) {
        setError("Invoice tidak ditemukan.");
      }

      setInvoice(found);
    } catch (err) {
      setError(err?.message || "Gagal memuat detail invoice.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const langganan = invoice?.langgananSekolah ?? null;
  const paket = langganan?.paket ?? null;
  const sekolah = langganan?.sekolah ?? null;

  const statusInfo = invoiceStatusInfo(invoice?.status);
  const langgananInfo = statusLanggananInfo(langganan?.statusLangganan);

  const total = Number(invoice?.jumlah ?? 0);

  const periodeMulai = langganan?.tanggalMulai ?? null;
  const periodeBerakhir = langganan?.tanggalBerakhir ?? null;

  const periodeLabel =
    periodeMulai || periodeBerakhir
      ? `${formatTanggal(periodeMulai)} - ${formatTanggal(periodeBerakhir)}`
      : "-";

  const bisaDibayar =
    invoice?.status === "pending" && Boolean(invoice?.midtransInvoiceId);

  return (
    <div className="flex h-screen w-full theme-page overflow-hidden">
      <Sidebar
        active="invoice"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header notifications={[]} />

        <main className="flex-1 overflow-y-auto theme-page">
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => router.push("/admin/langganan/invoice")}
                className="inline-flex items-center gap-2 text-sm font-medium theme-text-secondary hover:text-[var(--color-primary)] transition w-fit"
              >
                <ArrowLeft size={16} />
                Kembali ke Tagihan / Invoice
              </button>

              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl ${themePrimarySoft} text-[var(--color-primary)] border ${themePrimarySoftBorder}`}
                  >
                    <FileText size={20} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl font-bold theme-text">
                        Detail Invoice
                      </h1>

                      {invoice && <InvoiceStatus status={invoice.status} />}
                    </div>

                    <p className="text-sm theme-text-secondary mt-1">
                      Informasi lengkap tagihan langganan sekolah.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={loadData}
                    className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border theme-border theme-card theme-text-secondary text-sm font-semibold ${themeTextHover} transition`}
                  >
                    <RefreshCw size={15} />
                    Refresh
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border theme-border theme-card theme-text-secondary text-sm font-semibold ${themeTextHover} transition`}
                  >
                    <Printer size={15} />
                    Cetak
                  </button>
                </div>
              </div>
            </div>

            {loading && (
              <div className="theme-card theme-border rounded-xl border p-14 flex flex-col items-center gap-3">
                <Loader2
                  size={26}
                  className="animate-spin text-[var(--color-primary)]"
                />
                <p className="text-sm theme-text-secondary">
                  Memuat detail invoice...
                </p>
              </div>
            )}

            {!loading && error && (
              <div className="theme-danger rounded-xl border p-5 flex items-start gap-3">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">
                    Detail tidak ditemukan
                  </p>
                  <p className="text-xs mt-1 opacity-90">{error}</p>
                </div>
              </div>
            )}

            {!loading && !error && invoice && (
              <>
                <section className="theme-card rounded-xl border theme-border shadow-sm">
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      <div>
                        <div
                          className={`w-12 h-12 rounded-xl ${themePrimarySoft} flex items-center justify-center border ${themePrimarySoftBorder}`}
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
                          <h2 className="text-2xl font-bold theme-text break-all">
                            {invoice.midtransInvoiceId ?? "-"}
                          </h2>

                          {invoice.midtransInvoiceId && (
                            <button
                              type="button"
                              onClick={() =>
                                navigator.clipboard?.writeText(
                                  invoice.midtransInvoiceId
                                )
                              }
                              className={`w-8 h-8 rounded-lg border theme-border flex items-center justify-center theme-text-muted ${themePrimaryHover} hover:text-[var(--color-primary)] transition`}
                              title="Salin nomor invoice"
                            >
                              <Copy size={14} />
                            </button>
                          )}
                        </div>

                        <p className="text-sm theme-text-secondary mt-2">
                          Paket {paket?.nama ?? "-"} ·{" "}
                          {siklusLabel(langganan?.siklusPenagihan)}
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
                          Diterbitkan{" "}
                          {formatTanggal(invoice.dibuatPada, {
                            withTime: true,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {invoice.status === "pending" && (
                  <section
                    className={`theme-card rounded-xl border ${themePrimarySoftBorder} shadow-sm p-5`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg ${themePrimarySoft} flex items-center justify-center shrink-0`}
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
                            Lanjutkan pembayaran untuk mengaktifkan langganan
                            sekolah. Status akan diperbarui setelah pembayaran
                            terverifikasi oleh server.
                          </p>
                        </div>
                      </div>

                      {bisaDibayar && (
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/admin/langganan/pembayaran/${invoice.midtransInvoiceId}`
                            )
                          }
                          className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl theme-primary text-sm font-semibold ${themePrimaryShadow} hover:brightness-110 transition`}
                        >
                          <Wallet size={16} />
                          Bayar Sekarang
                        </button>
                      )}
                    </div>
                  </section>
                )}

                {invoice.status === "failed" && (
                  <section className="rounded-xl border theme-danger shadow-sm p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] flex items-center justify-center shrink-0">
                        <AlertCircle size={18} />
                      </div>

                      <div>
                        <p className="text-sm font-bold">
                          Pembayaran tidak berhasil
                        </p>

                        <p className="text-xs mt-1 leading-5 opacity-90">
                          Transaksi ini gagal atau dibatalkan. Silakan buat
                          transaksi baru dari halaman paket untuk melanjutkan
                          langganan.
                        </p>
                      </div>
                    </div>
                  </section>
                )}

                <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  <div className="theme-card rounded-xl border theme-border shadow-sm p-5 sm:p-6">
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
                        value={invoice.midtransInvoiceId ?? "-"}
                        copy
                      />

                      <DetailItem
                        icon={CreditCard}
                        label="Paket"
                        value={paket?.nama ?? "-"}
                      />

                      <DetailItem
                        icon={CalendarDays}
                        label="Periode Aktif"
                        value={periodeLabel}
                      />

                      <DetailItem
                        icon={CalendarDays}
                        label="Diterbitkan"
                        value={formatTanggal(invoice.dibuatPada, {
                          withTime: true,
                        })}
                      />

                      <DetailItem
                        icon={Wallet}
                        label="Siklus Penagihan"
                        value={siklusLabel(langganan?.siklusPenagihan)}
                      />

                      <DetailItem
                        icon={CreditCard}
                        label="Metode Pembayaran"
                        value={invoice.metode ?? "Midtrans"}
                      />
                    </div>
                  </div>

                  <div className="theme-card rounded-xl border theme-border shadow-sm p-5 sm:p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div
                        className={`w-9 h-9 rounded-lg ${themePrimarySoft} flex items-center justify-center`}
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
                        value={sekolah?.nama ?? "-"}
                      />

                      <DetailItem
                        icon={FileText}
                        label="Subdomain"
                        value={sekolah?.subdomain ?? "-"}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <DetailItem
                          icon={CreditCard}
                          label="Payment ID"
                          value={invoice.midtransPaymentId ?? "-"}
                          copy
                        />

                        <DetailItem
                          icon={ShieldCheck}
                          label="Status Langganan"
                          value={langgananInfo.label}
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section className="theme-card rounded-xl border theme-border shadow-sm">
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center gap-3 mb-6">
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
                            Paket {paket?.nama ?? "-"}
                          </p>
                          <p className="text-xs theme-text-muted mt-1">
                            {siklusLabel(langganan?.siklusPenagihan)}
                          </p>
                        </div>

                        <p className="text-sm font-semibold theme-text">
                          {formatRupiah(total)}
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

                <section className="theme-card rounded-xl border theme-border shadow-sm p-5 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                    <div>
                      <p className="text-xs font-medium theme-text-muted uppercase tracking-wide">
                        Status Invoice
                      </p>

                      <div className="mt-2">
                        <InvoiceStatus status={invoice.status} />
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

                <section className="theme-card rounded-xl border theme-border shadow-sm p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg theme-success flex items-center justify-center shrink-0">
                      <ShieldCheck
                        size={17}
                        className="text-[var(--color-success)]"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold theme-text">
                        Catatan Invoice
                      </p>

                      <p className="text-xs theme-text-secondary mt-1 leading-5">
                        {invoice.status === "success"
                          ? "Invoice telah lunas. Pembayaran terverifikasi oleh server SmartSchool dan langganan sekolah telah diperbarui."
                          : invoice.status === "failed"
                          ? "Invoice gagal atau dibatalkan. Silakan buat transaksi baru untuk melanjutkan langganan."
                          : "Invoice belum dibayar. Status invoice diperbarui otomatis setelah server memverifikasi pembayaran ke Midtrans."}
                      </p>
                    </div>
                  </div>
                </section>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => router.push("/admin/langganan/invoice")}
                    className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border theme-border theme-card theme-text-secondary text-sm font-semibold ${themeTextHover} transition`}
                  >
                    <ArrowLeft size={15} />
                    Kembali
                  </button>

                  {invoice.status === "pending" && !bisaDibayar && (
                    <button
                      type="button"
                      onClick={() => router.push("/admin/langganan/paket")}
                      className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl theme-primary text-sm font-semibold ${themePrimaryShadow} hover:brightness-110 transition`}
                    >
                      <Wallet size={16} />
                      Buat Transaksi Baru
                    </button>
                  )}

                  {invoice.status === "failed" && (
                    <button
                      type="button"
                      onClick={() => router.push("/admin/langganan/paket")}
                      className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl theme-primary text-sm font-semibold ${themePrimaryShadow} hover:brightness-110 transition`}
                    >
                      <Wallet size={16} />
                      Buat Transaksi Baru
                    </button>
                  )}

                  {invoice.status === "success" && (
                    <button
                      type="button"
                      onClick={() =>
                        router.push("/admin/langganan/riwayat-pembayaran")
                      }
                      className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border theme-border theme-card theme-text-secondary text-sm font-semibold ${themeTextHover} transition`}
                    >
                      <Receipt size={15} />
                      Lihat Riwayat Pembayaran
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
