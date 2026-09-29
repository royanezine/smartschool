"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Loader2,
  ShieldCheck,
} from "lucide-react";

export default function PaymentPage() {
  const router = useRouter();

  const [paymentUrl, setPaymentUrl] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    const url =
      sessionStorage.getItem(
        "onboarding_payment_url"
      );

    if (!url) {
      router.replace(
        "/onboarding/school"
      );

      return;
    }

    setPaymentUrl(url);
    setLoading(false);
  }, [router]);

  const handlePayment = () => {
    if (!paymentUrl) {
      return;
    }

    window.location.href =
      paymentUrl;
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
          <Loader2
            size={20}
            className="animate-spin"
          />

          Memuat pembayaran...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg items-center justify-center">
        <div className="w-full">
          {/* CARD */}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
            {/* ICON */}

            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <CreditCard
                  size={32}
                />
              </div>
            </div>

            {/* TITLE */}

            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2
                  size={14}
                />

                Email Terverifikasi
              </div>

              <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Lanjutkan Pembayaran
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Verifikasi berhasil.
                Silakan lanjutkan
                pembayaran melalui
                Midtrans untuk
                menyelesaikan
                pendaftaran sekolah.
              </p>
            </div>

            {/* SECURITY */}

            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <ShieldCheck
                size={20}
                className="mt-0.5 shrink-0 text-blue-600"
              />

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Pembayaran aman
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Pembayaran diproses
                  melalui halaman
                  pembayaran Midtrans.
                </p>
              </div>
            </div>

            {/* PAYMENT BUTTON */}

            <button
              type="button"
              onClick={
                handlePayment
              }
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              Lanjutkan ke Pembayaran

              <ExternalLink
                size={18}
              />
            </button>

            {/* BACK */}

            <button
              type="button"
              onClick={
                handleBack
              }
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft
                size={17}
              />

              Kembali
            </button>

            {/* NOTE */}

            <p className="mt-6 text-center text-xs leading-5 text-slate-400">
              Jangan tutup proses
              pembayaran sebelum
              transaksi selesai.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}