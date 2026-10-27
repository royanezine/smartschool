"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  CheckCircle2,
  Clock3,
  Loader2,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

function WaitingActivationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email");
  const orderId =
    searchParams.get("order_id") ||
    searchParams.get("orderId") ||
    searchParams.get("order");

  // Backend HEAD tidak menyediakan GET /api/tenant/status endpoint
  // Status pembayaran hanya dapat diperiksa melalui Midtrans webhook yang akan
  // mengaktifkan akun secara otomatis setelah pembayaran berhasil
  // Halaman ini hanya menampilkan informasi menunggu tanpa polling ke endpoint yang tidak ada

  const hasParams = Boolean(email || orderId);

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="relative w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center overflow-hidden">
            <Image
              src="/logo/logoSS.png"
              alt="SmartSchool Logo"
              width={44}
              height={44}
              className="object-contain"
            />
          </div>

          <span className="text-xl font-bold text-slate-900">
            SMART <span className="text-blue-600">SCHOOL</span>
          </span>
        </div>

        {!hasParams ? (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle size={42} className="text-red-500" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-slate-900">
              Parameter Tidak Lengkap
            </h1>

            <p className="text-sm text-slate-500 mt-3 leading-6">
              Parameter pendaftaran (email atau order ID) tidak ditemukan pada
              URL. Silakan kembali ke halaman pembayaran.
            </p>

            <button
              type="button"
              onClick={() => {
                router.push("/onboarding/payment");
              }}
              className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 transition"
            >
              Kembali ke Pembayaran
              <ArrowRight size={17} />
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
            <div className="flex justify-center mb-6">
              <div className="relative w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
                <Clock3 size={40} className="text-blue-600" />

                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center">
                  <Loader2 size={17} className="text-blue-600 animate-spin" />
                </div>
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-2xl font-bold text-slate-900">
                Menunggu Aktivasi
              </h1>

              <p className="text-sm text-slate-500 mt-3 leading-6">
                Pembayaran Anda sedang diproses oleh sistem SmartSchool.
                <br />
                Sekolah akan diaktifkan otomatis setelah notifikasi pembayaran
                Midtrans diterima oleh server.
              </p>
            </div>

            <div className="mt-7 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <CheckCircle2 size={18} className="text-blue-600" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Aktivasi Otomatis via Webhook
                  </p>

                  <p className="text-xs text-slate-500 mt-0.5">
                    Backend akan mengaktifkan akun setelah Midtrans mengirim
                    konfirmasi pembayaran
                  </p>
                </div>
              </div>
            </div>

            {email && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Email Pendaftaran</p>
                <p className="text-sm font-medium text-slate-800 mt-1">
                  {email}
                </p>
              </div>
            )}

            {orderId && (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Order ID</p>
                <p className="text-sm font-medium text-slate-800 mt-1">
                  {orderId}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                router.push("/login");
              }}
              className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 transition"
            >
              Menuju Halaman Login
              <ArrowRight size={17} />
            </button>
          </div>
        )}

        <div className="mt-5 rounded-xl bg-white border border-slate-100 px-5 py-4 shadow-sm">
          <div className="flex gap-3">
            <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
              <ShieldCheck size={16} className="text-slate-500" />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-700">
                Verifikasi Otomatis Backend
              </p>

              <p className="text-xs text-slate-400 mt-1 leading-5">
                Backend SmartSchool secara otomatis menerima notifikasi
                pembayaran dari Midtrans melalui webhook. Setelah pembayaran
                terverifikasi, status sekolah Anda akan langsung aktif dan Anda
                dapat login ke dashboard.
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          SmartSchool • Sistem Informasi Sekolah
        </p>
      </div>
    </main>
  );
}

export default function WaitingActivationPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-10">
          <div className="flex items-center gap-3 text-slate-600">
            <Loader2 size={24} className="animate-spin text-blue-600" />
            <span className="text-sm font-medium">Memuat...</span>
          </div>
        </main>
      }
    >
      <WaitingActivationContent />
    </Suspense>
  );
}
