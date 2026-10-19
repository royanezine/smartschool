"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, ShieldCheck } from "lucide-react";

const PaymentSuccessPage = () => {
  const router = useRouter();

  useEffect(() => {
    /*
     * Backend tidak menyediakan endpoint status pembayaran tenant
     * (GET /api/tenant/status tidak ada), dan aktivasi sekolah hanya
     * diproses melalui webhook Midtrans (POST /api/webhooks/midtrans).
     * Karena itu halaman ini TIDAK dapat memverifikasi keberhasilan
     * pembayaran dan TIDAK boleh menampilkan status "berhasil".
     *
     * Akses dialihkan kembali ke halaman pembayaran yang menampilkan
     * informasi Virtual Account dan tautan login.
     */
    const timer = window.setTimeout(() => {
      router.replace("/onboarding/payment");
    }, 800);

    return () => window.clearTimeout(timer);
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md text-center">
        <LoaderCircle
          size={40}
          className="mx-auto mb-4 animate-spin text-blue-600"
        />

        <h1 className="text-lg font-bold text-slate-900">
          Menunggu Konfirmasi Server
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Konfirmasi pembayaran hanya dapat ditentukan oleh server
          SmartSchool. Anda akan diarahkan ke halaman pembayaran.
        </p>

        <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck size={14} />
          Status resmi berasal dari Backend, bukan dari halaman ini.
        </p>
      </div>
    </main>
  );
};

export default PaymentSuccessPage;
