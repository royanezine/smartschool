"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Loader2,
  Lock,
  Package,
  ShieldCheck,
  Wallet,
  AlertCircle,
} from "lucide-react";

import { getPaketById } from "@/services/paket.service";
import {
  createPayment,
  extendSubscription,
  getAllLangganan,
  getPendingPayments,
  findActiveLangganan,
} from "@/services/langganan.service";
import { formatRupiah, siklusLabel } from "@/lib/langganan";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]";

const themeTextHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themePrimaryShadow =
  "shadow-[0_10px_25px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]";

export default function CheckoutLanggananPage() {
  const router = useRouter();
  const params = useParams();

  const paketId = Array.isArray(params?.paketId)
    ? params.paketId[0]
    : params?.paketId;

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [paket, setPaket] = useState(null);
  const [aktif, setAktif] = useState(null);

  const [siklus, setSiklus] = useState("monthly");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const loadData = useCallback(async () => {
    if (!paketId) {
      setLoadError("Paket tidak dipilih.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError("");

    try {
      const [detail, langganan] = await Promise.all([
        getPaketById(paketId),
        getAllLangganan(),
      ]);

      setPaket(detail?.data ?? null);
      setAktif(findActiveLangganan(langganan));
    } catch (err) {
      setLoadError(err?.message || "Gagal memuat data paket.");
    } finally {
      setLoading(false);
    }
  }, [paketId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const hargaBulanan = Number(paket?.harga ?? 0);

  const total = useMemo(
    () => (siklus === "annual" ? hargaBulanan * 12 : hargaBulanan),
    [siklus, hargaBulanan]
  );

  const isPerpanjang =
    Boolean(aktif) && aktif?.paketId === paketId;

  const handleSubmit = async () => {
    if (submitting) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const payload = {
        paketId,
        siklusPenagihan: siklus,
      };

      const result = isPerpanjang
        ? await extendSubscription(payload)
        : await createPayment(payload);

      let orderId = result?.order_id ?? null;

      if (!orderId) {
        try {
          const pending = await getPendingPayments();
          const cocok =
            pending.find(
              (item) =>
                item.langgananSekolah?.paketId === paketId &&
                item.midtransInvoiceId
            ) ??
            pending.find((item) => item.midtransInvoiceId);

          orderId = cocok?.midtransInvoiceId ?? null;
        } catch {
          orderId = null;
        }
      }

      if (orderId) {
        router.push(`/admin/langganan/pembayaran/${orderId}`);
        return;
      }

      if (result?.payment_url) {
        window.location.href = result.payment_url;
        return;
      }

      throw new Error(
        "Transaksi dibuat, tetapi tautan pembayaran tidak tersedia."
      );
    } catch (err) {
      setSubmitError(
        err?.message || "Gagal membuat transaksi pembayaran."
      );
      setSubmitting(false);
    }
  };

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

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
          <div className="mx-auto w-full max-w-5xl p-4 sm:p-6 lg:p-8 space-y-6">
            <button
              type="button"
              onClick={() => router.push("/admin/langganan/paket")}
              className="inline-flex items-center gap-2 text-sm font-medium theme-text-secondary hover:text-[var(--color-primary)] transition w-fit"
            >
              <ArrowLeft size={16} />
              Kembali ke Paket
            </button>

            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl ${themePrimarySoft} ${themePrimarySoftBorder} border text-[var(--color-primary)] ${themePrimaryShadow}`}
              >
                <CreditCard size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-bold theme-text">
                  Checkout Langganan
                </h1>
                <p className="text-sm theme-text-secondary">
                  Tinjau paket dan siklus penagihan sebelum melanjutkan.
                </p>
              </div>
            </div>

            {loading && (
              <div className="theme-card theme-border rounded-xl border p-14 flex flex-col items-center gap-3">
                <Loader2
                  size={26}
                  className="animate-spin text-[var(--color-primary)]"
                />
                <p className="text-sm theme-text-secondary">
                  Memuat data paket...
                </p>
              </div>
            )}

            {!loading && loadError && (
              <div className="theme-danger rounded-xl border p-5 flex items-start gap-3">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Gagal memuat paket</p>
                  <p className="text-xs mt-1 opacity-90">{loadError}</p>
                </div>
              </div>
            )}

            {!loading && !loadError && paket && (
              <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">
                <section className="theme-card theme-border rounded-xl border p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl ${themePrimarySoft} text-[var(--color-primary)] flex items-center justify-center shrink-0`}
                    >
                      <Package size={22} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl font-bold theme-text">
                          {paket.nama}
                        </h2>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            isPerpanjang
                              ? "theme-warning"
                              : "theme-success"
                          }`}
                        >
                          {isPerpanjang ? "PERPANJANGAN" : "PAKET BARU"}
                        </span>
                      </div>

                      {paket.deskripsi && (
                        <p className="text-sm theme-text-secondary mt-1.5">
                          {paket.deskripsi}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="text-xs font-semibold theme-text-secondary">
                      Siklus Penagihan
                    </p>

                    <div className="mt-2 inline-flex items-center gap-1 theme-card-soft theme-border border rounded-xl p-1">
                      {[
                        { value: "monthly", label: "Bulanan" },
                        { value: "annual", label: "Tahunan (12 bulan)" },
                      ].map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setSiklus(item.value)}
                          className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                            siklus === item.value
                              ? `${themePrimarySoft} text-[var(--color-primary)] ${themePrimarySoftBorder} border shadow-sm`
                              : `theme-text-muted ${themeTextHover}`
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {Array.isArray(paket.fitur) && paket.fitur.length > 0 && (
                    <div className="mt-6 theme-border-soft border-t pt-5">
                      <p className="text-xs font-semibold theme-text-secondary">
                        Fitur yang termasuk
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
                        {paket.fitur.map((item) => (
                          <div
                            key={item.id || item.kode || item.nama}
                            className="flex items-center gap-2.5"
                          >
                            <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full theme-success">
                              <CheckCircle2
                                size={11}
                                className="text-[var(--color-success)]"
                              />
                            </div>
                            <span className="text-xs theme-text-secondary">
                              {item.nama}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {isPerpanjang && aktif?.tanggalBerakhir && (
                    <div
                      className={`mt-6 flex items-start gap-3 rounded-xl border ${themePrimarySoftBorder} ${themePrimarySoft} p-4`}
                    >
                      <CalendarDays
                        size={16}
                        className="mt-0.5 shrink-0 text-[var(--color-primary)]"
                      />
                      <p className="text-xs theme-text-secondary leading-5">
                        Perpanjangan akan dilanjutkan dari masa aktif
                        berjalan. Periode paket dihitung setelah pembayaran
                        terverifikasi.
                      </p>
                    </div>
                  )}
                </section>

                <section className="theme-card theme-border rounded-xl border p-5 sm:p-6 h-fit lg:sticky lg:top-6">
                  <h2 className="text-sm font-bold theme-text">
                    Ringkasan Pembayaran
                  </h2>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="theme-text-secondary">Paket</span>
                      <span className="font-semibold theme-text">
                        {paket.nama}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="theme-text-secondary">Siklus</span>
                      <span className="font-semibold theme-text">
                        {siklusLabel(siklus)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="theme-text-secondary">
                        Harga / bulan
                      </span>
                      <span className="font-semibold theme-text">
                        {formatRupiah(hargaBulanan)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 theme-border-soft border-t pt-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-bold theme-text">
                        Total
                      </span>
                      <span className="text-xl font-bold text-[var(--color-primary)]">
                        {formatRupiah(total)}
                      </span>
                    </div>
                  </div>

                  {submitError && (
                    <div className="mt-4 flex items-start gap-2 rounded-xl theme-danger border p-3">
                      <AlertCircle size={15} className="mt-0.5 shrink-0" />
                      <p className="text-xs leading-5">{submitError}</p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition ${
                      submitting
                        ? "bg-[var(--color-primary)] opacity-70 cursor-not-allowed"
                        : "bg-[var(--color-primary)] hover:opacity-90"
                    }`}
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Membuat transaksi...
                      </>
                    ) : (
                      <>
                        <Wallet size={16} />
                        Lanjut ke Pembayaran
                      </>
                    )}
                  </button>

                  <div className="mt-4 flex items-start gap-2 text-[11px] theme-text-placeholder leading-5">
                    <Lock size={13} className="mt-0.5 shrink-0" />
                    <span>
                      Pembayaran diproses melalui Midtrans. Anda akan diarahkan
                      ke halaman pembayaran resmi untuk memilih metode
                      pembayaran.
                    </span>
                  </div>

                  <div className="mt-3 flex items-start gap-2 text-[11px] theme-text-placeholder leading-5">
                    <ShieldCheck size={13} className="mt-0.5 shrink-0" />
                    <span>
                      SmartSchool tidak pernah meminta nomor kartu, CVV, OTP,
                      maupun PIN pada halaman ini.
                    </span>
                  </div>
                </section>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
