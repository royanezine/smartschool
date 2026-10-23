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
  ExternalLink,
  FileText,
  Loader2,
  Receipt,
  RefreshCw,
  ShieldCheck,
  UserRound,
  Wallet,
  XCircle,
} from "lucide-react";

import { getRiwayatPembayaran } from "@/services/langganan.service";
import {
  formatRupiah,
  formatTanggal,
  siklusLabel,
  statusPembayaranInfo,
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

function PaymentStatus({ status }) {
  const info = statusPembayaranInfo(status);

  const Icon =
    status === "success"
      ? CheckCircle2
      : status === "failed"
      ? XCircle
      : Clock3;

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${info.className}`}
    >
      <Icon size={13} />
      {info.label}
    </span>
  );
}

function DetailBox({ icon: Icon, label, value, copy = false }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(value));
    } catch (error) {
    }
  };

  return (
    <div className="p-4 rounded-xl border theme-border theme-card">
      <div className="flex items-center gap-2">
        <Icon size={15} className="text-[var(--color-primary)]" />
        <p className="text-[11px] font-medium uppercase tracking-wide theme-text-muted">
          {label}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 mt-2">
        <p className="text-sm font-semibold theme-text break-all">
          {value}
        </p>

        {copy && value && value !== "-" && (
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

export default function DetailPembayaranPage() {
  const router = useRouter();
  const params = useParams();

  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    if (!id) {
      setError("ID transaksi tidak ditemukan.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const list = await getRiwayatPembayaran();
      const found = list.find((item) => item.id === id) ?? null;

      if (!found) {
        setError("Transaksi tidak ditemukan.");
      }

      setPayment(found);
    } catch (err) {
      setError(err?.message || "Gagal memuat detail transaksi.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  const langganan = payment?.langgananSekolah ?? null;
  const paket = langganan?.paket ?? null;
  const sekolah = langganan?.sekolah ?? null;

  return (
    <div className="flex h-screen w-full theme-page overflow-hidden">
      <Sidebar
        active="riwayatPembayaran"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header notifications={[]} />

        <main className="flex-1 overflow-y-auto theme-page">
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <button
              type="button"
              onClick={() =>
                router.push("/admin/langganan/riwayat-pembayaran")
              }
              className="inline-flex items-center gap-2 text-sm font-medium theme-text-secondary hover:text-[var(--color-primary)] transition w-fit"
            >
              <ArrowLeft size={16} />
              Kembali ke Riwayat Pembayaran
            </button>

            {loading && (
              <div className="theme-card theme-border rounded-xl border p-14 flex flex-col items-center gap-3">
                <Loader2
                  size={26}
                  className="animate-spin text-[var(--color-primary)]"
                />
                <p className="text-sm theme-text-secondary">
                  Memuat detail transaksi...
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

            {!loading && !error && payment && (
              <>
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
                        <PaymentStatus status={payment.status} />
                      </div>

                      <p className="text-sm theme-text-secondary mt-1">
                        Informasi lengkap transaksi pembayaran langganan.
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

                    {payment.status === "pending" &&
                      payment.midtransInvoiceId && (
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/admin/langganan/pembayaran/${payment.midtransInvoiceId}`
                            )
                          }
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:opacity-90 transition"
                        >
                          <ExternalLink size={15} />
                          Lanjutkan Pembayaran
                        </button>
                      )}
                  </div>
                </div>

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

                        <div className="min-w-0">
                          <p className="text-xs font-medium theme-text-muted uppercase tracking-wide">
                            Order ID
                          </p>
                          <h2 className="text-xl font-bold theme-text mt-1 break-all">
                            {payment.midtransInvoiceId ?? "-"}
                          </h2>
                          <p className="text-sm theme-text-secondary mt-1">
                            {paket?.nama ?? "-"} ·{" "}
                            {siklusLabel(langganan?.siklusPenagihan)}
                          </p>
                        </div>
                      </div>

                      <div className="lg:text-right">
                        <p className="text-xs theme-text-muted">
                          Total Pembayaran
                        </p>
                        <p className="text-3xl font-bold theme-text mt-1">
                          {formatRupiah(payment.jumlah)}
                        </p>
                        <p className="text-xs theme-text-muted mt-1">
                          {formatTanggal(payment.dibuatPada, {
                            withTime: true,
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
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
                        label="Order ID"
                        value={payment.midtransInvoiceId ?? "-"}
                        copy
                      />
                      <DetailBox
                        icon={FileText}
                        label="Payment ID"
                        value={payment.midtransPaymentId ?? "-"}
                        copy
                      />
                      <DetailBox
                        icon={CalendarDays}
                        label="Tanggal Dibuat"
                        value={formatTanggal(payment.dibuatPada, {
                          withTime: true,
                        })}
                      />
                      <DetailBox
                        icon={CreditCard}
                        label="Paket"
                        value={paket?.nama ?? "-"}
                      />
                      <DetailBox
                        icon={CalendarDays}
                        label="Siklus"
                        value={siklusLabel(langganan?.siklusPenagihan)}
                      />
                      <DetailBox
                        icon={Wallet}
                        label="Status Langganan"
                        value={langganan?.statusLangganan ?? "-"}
                      />
                    </div>
                  </div>

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
                          Metode & Periode
                        </h2>
                        <p className="text-xs theme-text-muted mt-1">
                          Informasi pembayaran langganan.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <DetailBox
                        icon={CreditCard}
                        label="Metode"
                        value={payment.metode ?? "Midtrans"}
                      />
                      <DetailBox
                        icon={CalendarDays}
                        label="Mulai"
                        value={formatTanggal(langganan?.tanggalMulai)}
                      />
                      <DetailBox
                        icon={CalendarDays}
                        label="Berakhir"
                        value={formatTanggal(langganan?.tanggalBerakhir)}
                      />
                    </div>
                  </div>
                </section>

                {sekolah && (
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <DetailBox
                        icon={UserRound}
                        label="Nama Sekolah"
                        value={sekolah.nama ?? "-"}
                      />
                      <DetailBox
                        icon={FileText}
                        label="Subdomain"
                        value={sekolah.subdomain ?? "-"}
                      />
                    </div>
                  </section>
                )}

                <section className="theme-card theme-border rounded-xl border shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)]">
                  <div className="p-5 sm:p-6">
                    <h2 className="font-bold theme-text mb-5">
                      Rincian Pembayaran
                    </h2>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-4 py-3 theme-border-soft border-b">
                        <span className="text-sm theme-text-secondary">
                          Paket {paket?.nama ?? "-"}
                        </span>
                        <span className="text-sm font-semibold theme-text">
                          {formatRupiah(payment.jumlah)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4 pt-4">
                        <span className="text-sm font-bold theme-text">
                          Total
                        </span>
                        <span className="text-xl font-bold text-[var(--color-primary)]">
                          {formatRupiah(payment.jumlah)}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

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
                        {payment.status === "success"
                          ? "Pembayaran telah terverifikasi dan langganan sekolah telah diperbarui."
                          : payment.status === "failed"
                          ? "Pembayaran gagal atau dibatalkan. Silakan buat transaksi baru jika ingin melanjutkan langganan."
                          : "Pembayaran belum selesai. Status akan diperbarui setelah sistem memverifikasi transaksi."}
                      </p>
                    </div>
                  </div>
                </section>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/admin/langganan/riwayat-pembayaran")
                  }
                  className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border theme-border theme-card theme-text-secondary text-sm font-semibold ${themeTextHover} transition`}
                >
                  <ArrowLeft size={15} />
                  Kembali ke Riwayat Pembayaran
                </button>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
