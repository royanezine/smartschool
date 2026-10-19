"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  CreditCard,
  ExternalLink,
  Loader2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export default function PaymentPage() {
  const router = useRouter();

  const [paymentUrl, setPaymentUrl] = useState("");
  const [orderId, setOrderId] = useState("");
  const [vaNumber, setVaNumber] = useState("");
  const [bank, setBank] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Informasi pembayaran berasal dari respons POST /api/tenant/verify yang
    // sudah disimpan oleh halaman verifikasi. Backend saat ini tidak memiliki
    // rute create-va maupun status tenant, sehingga halaman ini tidak boleh
    // memanggil endpoint tambahan apa pun dan tidak mengarang status sukses.
    const savedUrl = sessionStorage.getItem("onboarding_payment_url") || "";
    const savedOrderId = sessionStorage.getItem("onboarding_order_id") || "";
    const savedVaNumber = sessionStorage.getItem("onboarding_va_number") || "";
    const savedBank =
      sessionStorage.getItem("onboarding_payment_bank") ||
      sessionStorage.getItem("onboarding_bank") ||
      "";
    const savedAmount =
      sessionStorage.getItem("onboarding_gross_amount") || "";

    if (!savedUrl && !savedVaNumber) {
      setError(
        "Informasi pembayaran belum tersedia. Silakan ulangi proses verifikasi email untuk membuat nomor Virtual Account."
      );
      setLoading(false);
      return;
    }

    setPaymentUrl(savedUrl);
    setOrderId(savedOrderId);
    setVaNumber(savedVaNumber);
    setBank(savedBank);
    setAmount(savedAmount);
    setLoading(false);
  }, []);

  const handlePayment = () => {
    if (!paymentUrl) return;

    window.location.href = paymentUrl;
  };

  const handleCopyVA = async () => {
    if (!vaNumber) return;

    try {
      await navigator.clipboard.writeText(vaNumber);
      alert("Nomor Virtual Account berhasil disalin.");
    } catch {
      setError(
        "Nomor tidak dapat disalin otomatis. Silakan salin nomor VA secara manual."
      );
    }
  };

  const formatRupiah = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) return "-";

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
          <Loader2 size={20} className="animate-spin text-blue-600" />
          Memuat pembayaran...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg items-center justify-center">
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <CreditCard size={32} />
            </div>
          </div>

          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <CheckCircle2 size={14} />
              Email Terverifikasi
            </div>

            <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Informasi Pembayaran
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Gunakan informasi berikut untuk menyelesaikan pembayaran
              pendaftaran sekolah.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-5 flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800"
            >
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-600" />
              <span>{error}</span>
            </div>
          )}

          {vaNumber && (
            <>
              <div className="mt-7 rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Bank tujuan
                    </p>
                    <p className="mt-1 text-lg font-bold uppercase text-slate-900">
                      {bank || "Virtual Account"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    Menunggu Pembayaran
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-xs font-medium text-slate-500">
                    Nomor Virtual Account
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <p className="min-w-0 flex-1 break-all text-xl font-mono font-bold tracking-wider text-slate-900">
                      {vaNumber}
                    </p>

                    <button
                      type="button"
                      onClick={handleCopyVA}
                      aria-label="Salin nomor Virtual Account"
                      className="shrink-0 rounded-xl border border-slate-200 p-3 text-slate-600 transition hover:bg-slate-50 active:scale-95"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  <p className="text-xs font-medium text-slate-500">
                    Total tagihan
                  </p>
                  <p className="mt-1 text-2xl font-bold text-blue-700">
                    {formatRupiah(amount)}
                  </p>
                </div>

                {orderId && (
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <p className="text-xs text-slate-500">
                      ID transaksi
                    </p>
                    <p className="mt-1 break-all text-xs font-mono font-medium text-slate-700">
                      {orderId}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <ShieldCheck
                  size={20}
                  className="mt-0.5 shrink-0 text-blue-600"
                />
                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    Cara menyelesaikan pembayaran
                  </p>
                  <p className="mt-1 text-xs leading-5 text-blue-800">
                    Buka mobile banking atau ATM bank yang dipilih, masuk ke
                    menu transfer Virtual Account, masukkan nomor Virtual
                    Account dan nominal tepat di atas. Setelah pembayaran
                    diterima, sekolah akan diaktifkan oleh server.
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs leading-5 text-slate-500">
                  Halaman ini tidak dapat memverifikasi status pembayaran
                  secara langsung karena Backend belum menyediakan endpoint
                  status tenant. Konfirmasi pembayaran diproses oleh server
                  melalui notifikasi Midtrans. Setelah sekolah diaktifkan,
                  Anda dapat masuk menggunakan akun yang terdaftar.
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-600 bg-blue-50/50 px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                >
                  Masuk ke Halaman Login
                </button>
              </div>
            </>
          )}

          {paymentUrl && (
            <button
              type="button"
              onClick={handlePayment}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              Lanjutkan ke Pembayaran
              <ExternalLink size={18} />
            </button>
          )}

          {!vaNumber && !paymentUrl && (
            <button
              type="button"
              onClick={() => router.push("/onboarding/verify")}
              className="mt-5 w-full rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Kembali ke Verifikasi
            </button>
          )}

          <button
            type="button"
            onClick={() => router.back()}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft size={17} />
            Kembali
          </button>

          <p className="mt-6 text-center text-xs leading-5 text-slate-400">
            Status pembayaran diproses oleh Backend melalui notifikasi
            Midtrans. Jangan menganggap pembayaran berhasil hanya berdasarkan
            tampilan halaman ini.
          </p>
        </div>
      </div>
    </main>
  );
}
