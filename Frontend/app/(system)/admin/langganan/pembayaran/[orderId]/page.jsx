"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  CreditCard,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Wallet,
  XCircle,
} from "lucide-react";

import { getPaymentStatus } from "@/services/langganan.service";
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

const themeTextHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const POLL_INTERVAL_MS = 5000;

export default function PembayaranLanggananPage() {
  const router = useRouter();
  const params = useParams();

  const orderId = Array.isArray(params?.orderId)
    ? params.orderId[0]
    : params?.orderId;

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [polling, setPolling] = useState(false);

  const pollRef = useRef(null);

  const checkStatus = useCallback(
    async ({ showLoading = false } = {}) => {
      if (!orderId) {
        setError("Order ID tidak ditemukan.");
        setLoading(false);
        return null;
      }

      if (showLoading) {
        setLoading(true);
      }

      try {
        const result = await getPaymentStatus(orderId);

        setStatus(result);
        setError("");

        return result;
      } catch (err) {
        setError(err?.message || "Gagal memuat status pembayaran.");
        return null;
      } finally {
        if (showLoading) {
          setLoading(false);
        }
      }
    },
    [orderId]
  );

  useEffect(() => {
    checkStatus({ showLoading: true });
  }, [checkStatus]);

  useEffect(() => {
    if (status?.status === "success") {
      router.replace(
        `/admin/langganan/pembayaran/${orderId}/hasil`
      );
    }
  }, [status, orderId, router]);

  useEffect(() => {
    const menunggu = status?.status === "pending" || !status;

    if (!menunggu || error) {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      setPolling(false);
      return;
    }

    setPolling(true);

    pollRef.current = setInterval(() => {
      checkStatus();
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [status, error, checkStatus]);

  const handleRefresh = () => {
    checkStatus({ showLoading: true });
  };

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  const info = statusPembayaranInfo(status?.status);
  const isPending = status?.status === "pending" || !status;
  const isFailed = status?.status === "failed";

  return (
    <div className="flex h-screen w-full theme-page overflow-hidden">
      <Sidebar
        active="paketLangganan"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header notifications={[]} />

        <main className="flex-1 overflow-y-auto theme-page">
          <div className="mx-auto w-full max-w-3xl p-4 sm:p-6 lg:p-8 space-y-6">
            <button
              type="button"
              onClick={() => router.push("/admin/langganan/paket")}
              className="inline-flex items-center gap-2 text-sm font-medium theme-text-secondary hover:text-[var(--color-primary)] transition w-fit"
            >
              <ArrowLeft size={16} />
              Kembali ke Paket
            </button>

            {loading && (
              <div className="theme-card theme-border rounded-xl border p-14 flex flex-col items-center gap-3">
                <Loader2
                  size={26}
                  className="animate-spin text-[var(--color-primary)]"
                />
                <p className="text-sm theme-text-secondary">
                  Memuat status pembayaran...
                </p>
              </div>
            )}

            {!loading && error && (
              <div className="theme-danger rounded-xl border p-5 flex items-start gap-3">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">
                    Gagal memuat transaksi
                  </p>
                  <p className="text-xs mt-1 opacity-90">{error}</p>
                </div>
              </div>
            )}

            {!loading && !error && status && (
              <>
                <section className="theme-card theme-border rounded-xl border p-5 sm:p-6 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)]">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                          isFailed ? "theme-danger" : "theme-warning"
                        }`}
                      >
                        {isFailed ? (
                          <XCircle size={22} className="text-[var(--color-danger)]" />
                        ) : (
                          <Clock3 size={22} className="text-[var(--color-warning)]" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h1 className="text-lg font-bold theme-text">
                            {isFailed
                              ? "Pembayaran Gagal"
                              : "Menunggu Pembayaran"}
                          </h1>

                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${info.className}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                            {info.label}
                          </span>
                        </div>

                        <p className="text-sm theme-text-secondary mt-1">
                          {isFailed
                            ? "Transaksi tidak berhasil. Silakan buat transaksi baru."
                            : "Selesaikan pembayaran. Status diperbarui otomatis setelah pembayaran terverifikasi."}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRefresh}
                      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border theme-border theme-card theme-text-secondary text-sm font-semibold ${themeTextHover} transition`}
                    >
                      <RefreshCw size={15} />
                      Cek Status
                    </button>
                  </div>

                  {isPending && (
                    <div className="mt-4 flex items-center gap-2 text-[11px] theme-text-placeholder">
                      <span className="w-2 h-2 rounded-full bg-[var(--color-warning)] animate-pulse" />
                      {polling
                        ? "Memeriksa status secara berkala..."
                        : "Menunggu pemeriksaan status."}
                    </div>
                  )}
                </section>

                <section className="theme-card theme-border rounded-xl border p-5 sm:p-6">
                  <div className="flex items-center gap-2">
                    <CreditCard
                      size={17}
                      className="text-[var(--color-primary)]"
                    />
                    <h2 className="text-sm font-bold theme-text">
                      Detail Transaksi
                    </h2>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl theme-card-soft border theme-border">
                      <p className="text-[11px] uppercase tracking-wide theme-text-muted">
                        Order ID
                      </p>
                      <p className="text-sm font-semibold theme-text mt-1 break-all">
                        {status.order_id}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl theme-card-soft border theme-border">
                      <p className="text-[11px] uppercase tracking-wide theme-text-muted">
                        Paket
                      </p>
                      <p className="text-sm font-semibold theme-text mt-1">
                        {status.paket?.nama ?? "-"}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl theme-card-soft border theme-border">
                      <p className="text-[11px] uppercase tracking-wide theme-text-muted">
                        Siklus
                      </p>
                      <p className="text-sm font-semibold theme-text mt-1">
                        {siklusLabel(status.siklusPenagihan)}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl theme-card-soft border theme-border">
                      <p className="text-[11px] uppercase tracking-wide theme-text-muted">
                        Dibuat
                      </p>
                      <p className="text-sm font-semibold theme-text mt-1">
                        {formatTanggal(status.dibuatPada, {
                          withTime: true,
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 theme-border-soft border-t pt-4">
                    <span className="text-sm font-bold theme-text">
                      Total Pembayaran
                    </span>
                    <span className="text-xl font-bold text-[var(--color-primary)]">
                      {formatRupiah(status.jumlah)}
                    </span>
                  </div>
                </section>

                {isPending && status.payment_url && (
                  <section className="theme-card theme-border rounded-xl border p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg ${themePrimarySoft} flex items-center justify-center shrink-0`}
                      >
                        <Wallet
                          size={18}
                          className="text-[var(--color-primary)]"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold theme-text">
                          Lanjutkan ke Halaman Pembayaran
                        </p>
                        <p className="text-xs theme-text-secondary mt-1 leading-5">
                          Anda akan diarahkan ke halaman pembayaran resmi
                          Midtrans. Setelah selesai, kembali ke halaman ini
                          untuk melihat hasilnya.
                        </p>
                      </div>
                    </div>

                    <a
                      href={status.payment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
                    >
                      <ExternalLink size={16} />
                      Buka Halaman Pembayaran
                    </a>
                  </section>
                )}

                {isPending && !status.payment_url && (
                  <section className="theme-warning rounded-xl border p-5 flex items-start gap-3">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">
                        Tautan pembayaran tidak tersedia
                      </p>
                      <p className="text-xs mt-1 opacity-90">
                        Silakan buat transaksi baru dari halaman paket.
                      </p>
                    </div>
                  </section>
                )}

                {isFailed && (
                  <button
                    type="button"
                    onClick={() => router.push("/admin/langganan/paket")}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
                  >
                    <RefreshCw size={16} />
                    Buat Transaksi Baru
                  </button>
                )}

                <div className="flex items-start gap-2 text-[11px] theme-text-placeholder leading-5">
                  <ShieldCheck size={13} className="mt-0.5 shrink-0" />
                  <span>
                    Status pembayaran diverifikasi langsung oleh server
                    SmartSchool ke Midtrans. Halaman ini tidak meminta nomor
                    kartu, CVV, OTP, maupun PIN.
                  </span>
                </div>

                {status.status === "success" && (
                  <div className="theme-success rounded-xl border p-5 flex items-center gap-3">
                    <CheckCircle2
                      size={20}
                      className="text-[var(--color-success)] shrink-0"
                    />
                    <p className="text-sm font-semibold">
                      Pembayaran terverifikasi. Mengalihkan...
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
