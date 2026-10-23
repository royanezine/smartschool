"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Loader2,
  Package,
  Receipt,
  ShieldCheck,
} from "lucide-react";

import { getPaymentStatus } from "@/services/langganan.service";
import { formatRupiah, formatTanggal, siklusLabel } from "@/lib/langganan";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]";

const themePrimaryShadow =
  "shadow-[0_10px_25px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]";

export default function HasilPembayaranLanggananPage() {
  const router = useRouter();
  const params = useParams();

  const orderId = Array.isArray(params?.orderId)
    ? params.orderId[0]
    : params?.orderId;

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    if (!orderId) {
      setError("Order ID tidak ditemukan.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await getPaymentStatus(orderId);
      setStatus(result);
    } catch (err) {
      setError(err?.message || "Gagal memuat status pembayaran.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!loading && status && status.status !== "success") {
      router.replace(`/admin/langganan/pembayaran/${orderId}`);
    }
  }, [loading, status, orderId, router]);

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  const terverifikasi = status?.status === "success";

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
            {(loading || !terverifikasi) && !error && (
              <div className="theme-card theme-border rounded-xl border p-14 flex flex-col items-center gap-3">
                <Loader2
                  size={26}
                  className="animate-spin text-[var(--color-primary)]"
                />
                <p className="text-sm theme-text-secondary">
                  Memverifikasi pembayaran...
                </p>
              </div>
            )}

            {error && (
              <div className="theme-danger rounded-xl border p-5 flex items-start gap-3">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">
                    Gagal memverifikasi pembayaran
                  </p>
                  <p className="text-xs mt-1 opacity-90">{error}</p>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/admin/langganan/pembayaran/${orderId}`
                      )
                    }
                    className="mt-3 text-xs font-semibold text-[var(--color-primary)] underline"
                  >
                    Kembali ke halaman pembayaran
                  </button>
                </div>
              </div>
            )}

            {!loading && !error && terverifikasi && (
              <>
                <section className="theme-card theme-border rounded-xl border p-6 sm:p-8 text-center shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)]">
                  <div className="mx-auto w-16 h-16 rounded-2xl theme-success flex items-center justify-center">
                    <CheckCircle2
                      size={32}
                      className="text-[var(--color-success)]"
                    />
                  </div>

                  <h1 className="mt-5 text-2xl font-bold theme-text">
                    Pembayaran Berhasil
                  </h1>

                  <p className="mt-2 text-sm theme-text-secondary max-w-lg mx-auto leading-6">
                    Pembayaran langganan telah terverifikasi. Masa aktif paket
                    sekolah Anda telah diperbarui berdasarkan data sistem.
                  </p>

                  <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3">
                    <Receipt size={16} className="text-white" />
                    <span className="text-sm font-semibold text-white break-all">
                      {status.order_id}
                    </span>
                  </div>
                </section>

                <section className="theme-card theme-border rounded-xl border p-5 sm:p-6">
                  <div className="flex items-center gap-2">
                    <Package
                      size={17}
                      className="text-[var(--color-primary)]"
                    />
                    <h2 className="text-sm font-bold theme-text">
                      Detail Langganan
                    </h2>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        Mulai
                      </p>
                      <p className="text-sm font-semibold theme-text mt-1">
                        {formatTanggal(status.tanggalMulai)}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl theme-card-soft border theme-border">
                      <p className="text-[11px] uppercase tracking-wide theme-text-muted">
                        Berakhir
                      </p>
                      <p className="text-sm font-semibold theme-text mt-1">
                        {formatTanggal(status.tanggalBerakhir)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 theme-border-soft border-t pt-4">
                    <span className="text-sm font-bold theme-text">
                      Total Dibayar
                    </span>
                    <span className="text-xl font-bold text-[var(--color-primary)]">
                      {formatRupiah(status.jumlah)}
                    </span>
                  </div>
                </section>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => router.push("/admin/langganan")}
                    className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl border theme-border theme-card px-4 py-3 text-sm font-semibold theme-text-secondary transition hover:text-[var(--color-primary)]`}
                  >
                    <CreditCard size={16} />
                    Lihat Langganan
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      router.push("/admin/langganan/riwayat-pembayaran")
                    }
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
                  >
                    <CalendarDays size={16} />
                    Riwayat Pembayaran
                  </button>
                </div>

                <div className="flex items-start gap-2 text-[11px] theme-text-placeholder leading-5">
                  <ShieldCheck size={13} className="mt-0.5 shrink-0" />
                  <span>
                    Konfirmasi ini berasal dari verifikasi server SmartSchool
                    terhadap status transaksi Midtrans.
                  </span>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
