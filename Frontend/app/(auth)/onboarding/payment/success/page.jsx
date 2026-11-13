"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle, ShieldCheck } from "lucide-react";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const orderId =
      searchParams.get("order_id") ||
      searchParams.get("orderId") ||
      searchParams.get("order");

    const qs = searchParams.toString();
    const query = qs ? `?${qs}` : "";

    const timer = window.setTimeout(() => {
      if (orderId) {
        router.replace(`/onboarding/status${query}`);
      } else {
        router.replace(`/onboarding/payment${query}`);
      }
    }, 800);

    return () => window.clearTimeout(timer);
  }, [router, searchParams]);

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
          Konfirmasi pembayaran sedang diproses oleh server SmartSchool. Anda akan dialihkan ke halaman status aktivasi.
        </p>

        <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck size={14} />
          Status resmi diverifikasi secara aman oleh Backend.
        </p>
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
          <LoaderCircle size={40} className="animate-spin text-blue-600" />
        </main>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
