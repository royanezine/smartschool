
"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  CreditCard,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Copy,
  Clock,
  XCircle,
} from "lucide-react";

import { verifyTenant } from "@/services/tenant.service";

const BANK_OPTIONS = [
  { value: "bca", label: "BCA" },
  { value: "bni", label: "BNI" },
  { value: "bri", label: "BRI" },
  { value: "mandiri", label: "Mandiri" },
  { value: "permata", label: "Permata" },
];

function formatRupiah(value) {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  return `Rp ${Number(value).toLocaleString("id-ID")}`;
}

function VerifyTenantPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const emailFromUrl = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailFromUrl);
  const [kodeOtp, setKodeOtp] = useState("");
  const [bank, setBank] = useState("bca");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resultData, setResultData] = useState(null);
  const [trialCreated, setTrialCreated] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (emailFromUrl) {
      setEmail(emailFromUrl);
      return;
    }

    try {
      const savedEmail =
        sessionStorage.getItem("tenant_register_email") ||
        localStorage.getItem("tenant_register_email") ||
        localStorage.getItem("onboarding_email") ||
        "";

      if (savedEmail) {
        setEmail(savedEmail);
      }
    } catch (err) {
      console.error("Gagal membaca email pendaftaran:", err);
    }
  }, [emailFromUrl]);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setResultData(null);
    setTrialCreated(false);
    setCopied(false);

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedOtp = kodeOtp.replace(/\D/g, "");
    const normalizedBank = bank.toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Masukkan alamat email yang valid.");
      return;
    }

    if (normalizedOtp.length !== 6) {
      setError("Kode OTP harus terdiri dari 6 digit.");
      return;
    }

    if (!BANK_OPTIONS.some((item) => item.value === normalizedBank)) {
      setError("Pilihan bank tidak valid.");
      return;
    }

    try {
      setLoading(true);

      // Service mengirim email, kodeOtp, dan bank ke POST /api/tenant/verify.
      const result = await verifyTenant(
        normalizedEmail,
        normalizedOtp,
        normalizedBank
      );

      if (!result || result.success === false) {
        throw new Error(result?.message || "Verifikasi gagal.");
      }

      // Menangani respons normal dan respons yang terbungkus data.data.
      const data = result?.data?.data ?? result?.data ?? {};

      if (data.is_trial === true) {
        setTrialCreated(true);
        setSuccess(
          result.message ||
            "Sekolah uji coba berhasil dibuat. Kamu akan diarahkan ke halaman login."
        );

        try {
          sessionStorage.removeItem("tenant_register_email");
          sessionStorage.removeItem("tenant_register_nama");
          sessionStorage.removeItem("tenant_register_paket_id");
          sessionStorage.removeItem("tenant_payment_data");

          localStorage.removeItem("onboarding_email");
          localStorage.removeItem("tenant_register_email");
          localStorage.removeItem("onboarding_paket_id");
          localStorage.removeItem("tenant_register_nama");
        } catch (storageError) {
          console.error("Gagal membersihkan data onboarding:", storageError);
        }

        router.replace("/login");
        return;
      }

      if (data.is_trial === false) {
        if (!data.order_id) {
          throw new Error(
            "Verifikasi berhasil, tetapi Order ID pembayaran tidak ditemukan."
          );
        }

        // Sesuai respons verifyAndPay: tidak menggunakan redirect_url/snap_token.
        const paymentData = {
          order_id: data.order_id,
          gross_amount: data.gross_amount,
          bank: data.bank || normalizedBank,
          va_number: data.va_number || null,
          biller_code: data.biller_code || null,
          bill_key: data.bill_key || null,
          expiry_time: data.expiry_time || null,
          is_trial: false,
          email: normalizedEmail,
        };

        setResultData(paymentData);
        setSuccess(
          result.message ||
            "Verifikasi berhasil. Silakan selesaikan pembayaran menggunakan informasi berikut."
        );

        try {
          sessionStorage.setItem(
            "tenant_payment_data",
            JSON.stringify(paymentData)
          );
        } catch (storageError) {
          console.error("Gagal menyimpan informasi pembayaran:", storageError);
        }

        return;
      }

      throw new Error(
        "Respons backend tidak memuat status paket yang dikenali."
      );
    } catch (err) {
      console.error("VERIFY TENANT ERROR:", err);

      setError(
        err?.message || "Verifikasi gagal. Silakan coba kembali."
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyPaymentInfo(value) {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(true);
    } catch (err) {
      console.error("Gagal menyalin informasi pembayaran:", err);
      setError(
        "Informasi tidak dapat disalin otomatis. Silakan salin secara manual."
      );
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0D47C9] shadow-sm">
              <span className="text-lg font-extrabold text-white">S</span>
            </div>

            <div>
              <p className="text-[17px] font-extrabold tracking-tight text-slate-950">
                SmartSchool
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                School Management System
              </p>
            </div>
          </a>

          <a
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
          >
            Masuk
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-slate-200/80 bg-[#0D1B38]">
        <div className="absolute inset-0 opacity-[0.07]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "42px 42px",
            }}
          />
        </div>

        <div className="absolute -right-32 -top-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-48 left-1/3 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3.5 py-2 text-xs font-semibold text-blue-100">
              <ShieldCheck className="h-4 w-4 text-blue-300" />
              Verifikasi Pendaftaran Sekolah
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[42px]">
              Verifikasi akun{" "}
              <span className="text-blue-400">SmartSchool</span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Masukkan kode OTP yang dikirim ke email administrator untuk
              melanjutkan proses pendaftaran sekolah.
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-7 grid grid-cols-3 gap-2 sm:gap-4">
            {[
              { step: "01", title: "Pendaftaran", icon: Check, active: false },
              { step: "02", title: "Verifikasi", icon: KeyRound, active: true },
              { step: "03", title: "Pembayaran", icon: CreditCard, active: false },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.step}
                  className={`rounded-xl border p-3 shadow-sm sm:p-4 ${
                    item.active
                      ? "border-blue-100 bg-blue-50/60"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        item.active
                          ? "bg-[#155DFC] text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Langkah {item.step}
                      </p>
                      <p className="truncate text-xs font-bold text-slate-800 sm:text-sm">
                        {item.title}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_330px]">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.06)]">
              <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Mail className="h-6 w-6" />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">
                      Verifikasi Email
                    </h2>
                    <p className="mt-1.5 text-sm leading-6 text-slate-500">
                      Masukkan kode OTP yang dikirim ke email administrator.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                {error && (
                  <div className="mb-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                      <XCircle className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-red-800">
                        Verifikasi gagal
                      </p>
                      <p className="mt-0.5 text-sm leading-6 text-red-700">
                        {error}
                      </p>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="mb-6 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-emerald-800">
                        Verifikasi berhasil
                      </p>
                      <p className="mt-0.5 text-sm leading-6 text-emerald-700">
                        {success}
                      </p>
                    </div>
                  </div>
                )}

                {!trialCreated && !resultData && (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="mb-2.5 block text-sm font-semibold text-slate-700">
                        Email Administrator
                      </label>

                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          placeholder="admin@sekolah.sch.id"
                          autoComplete="email"
                          disabled={loading}
                          required
                          className={`${inputClass} pl-11`}
                        />
                      </div>

                      <p className="mt-2 text-xs leading-5 text-slate-400">
                        Gunakan email yang digunakan saat mendaftarkan sekolah.
                      </p>
                    </div>

                    <div>
                      <div className="mb-2.5 flex items-center justify-between gap-3">
                        <label className="block text-sm font-semibold text-slate-700">
                          Kode OTP
                        </label>
                        <span className="text-xs font-semibold text-blue-600">
                          6 digit
                        </span>
                      </div>

                      <div className="relative">
                        <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={6}
                          value={kodeOtp}
                          onChange={(event) => {
                            setKodeOtp(
                              event.target.value.replace(/\D/g, "").slice(0, 6)
                            );
                          }}
                          placeholder="000000"
                          disabled={loading}
                          required
                          className={`${inputClass} pl-11 text-center text-2xl font-bold tracking-[0.45em]`}
                        />
                      </div>

                      <p className="mt-2 text-xs leading-5 text-slate-400">
                        OTP berlaku selama 5 menit sesuai konfigurasi backend.
                      </p>
                    </div>

                    <div>
                      <label className="mb-2.5 block text-sm font-semibold text-slate-700">
                        Bank Pembayaran
                      </label>

                      <div className="relative">
                        <CreditCard className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <select
                          value={bank}
                          onChange={(event) => setBank(event.target.value)}
                          disabled={loading}
                          className={`${inputClass} appearance-none pl-11`}
                        >
                          {BANK_OPTIONS.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>

                        <ArrowRight className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-slate-400" />
                      </div>

                      <p className="mt-2 text-xs leading-5 text-slate-400">
                        Pilihan bank digunakan jika paket yang dipilih berbayar.
                        Backend menerima BCA, BNI, BRI, Mandiri, dan Permata.
                      </p>
                    </div>

                    <div className="border-t border-slate-100 pt-6">
                      <button
                        type="submit"
                        disabled={loading || kodeOtp.length !== 6 || !email.trim()}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#155DFC] px-5 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#0D47C9] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Memverifikasi...
                          </>
                        ) : (
                          <>
                            Verifikasi OTP
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>

                      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                        <LockKeyhole className="h-3.5 w-3.5" />
                        Data verifikasi diproses melalui backend
                      </div>
                    </div>
                  </form>
                )}

                {trialCreated && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                      <div>
                        <h3 className="font-bold text-emerald-900">
                          Pendaftaran uji coba berhasil
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-emerald-800">
                          Backend sudah memproses pendaftaran paket gratis.
                          Kamu akan diarahkan ke halaman login.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {resultData?.is_trial === false && (
                  <div className="mt-2 overflow-hidden rounded-2xl border border-blue-200 bg-blue-50/70">
                    <div className="border-b border-blue-100 bg-blue-100/50 px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                          <CreditCard className="h-5 w-5" />
                        </div>

                        <div>
                          <p className="text-sm font-bold text-blue-950">
                            Instruksi Pembayaran
                          </p>
                          <p className="mt-0.5 text-xs text-blue-700">
                            Gunakan informasi berikut untuk menyelesaikan pembayaran.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-5 p-5">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                          Bank Pembayaran
                        </p>
                        <p className="mt-1 text-sm font-bold uppercase text-blue-950">
                          {BANK_OPTIONS.find(
                            (item) => item.value === String(resultData.bank || bank).toLowerCase()
                          )?.label || resultData.bank || bank}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                          Total Pembayaran
                        </p>
                        <p className="mt-1 text-xl font-bold text-blue-950">
                          {formatRupiah(resultData.gross_amount)}
                        </p>
                      </div>

                      {resultData.va_number && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                            Nomor Virtual Account / Kode Pembayaran
                          </p>
                          <div className="mt-1 flex items-start gap-2">
                            <p className="min-w-0 flex-1 break-all text-lg font-bold tracking-wide text-blue-950">
                              {resultData.va_number}
                            </p>
                            <button
                              type="button"
                              onClick={() => copyPaymentInfo(resultData.va_number)}
                              className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-blue-200 bg-white px-2.5 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                            >
                              <Copy className="h-3.5 w-3.5" />
                              Salin
                            </button>
                          </div>
                        </div>
                      )}

                      {resultData.biller_code && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                            Biller Code
                          </p>
                          <p className="mt-1 break-all text-sm font-bold text-blue-950">
                            {resultData.biller_code}
                          </p>
                        </div>
                      )}

                      {resultData.bill_key && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                            Bill Key
                          </p>
                          <p className="mt-1 break-all text-sm font-bold text-blue-950">
                            {resultData.bill_key}
                          </p>
                        </div>
                      )}

                      {resultData.expiry_time && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                            Batas Waktu Pembayaran
                          </p>
                          <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-blue-950">
                            <Clock className="h-4 w-4" />
                            {resultData.expiry_time}
                          </p>
                        </div>
                      )}

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                          Order ID
                        </p>
                        <p className="mt-1 break-all text-sm font-semibold text-blue-950">
                          {resultData.order_id}
                        </p>
                      </div>

                      {copied && (
                        <p className="text-xs font-semibold text-emerald-700">
                          Informasi berhasil disalin.
                        </p>
                      )}

                      <div className="rounded-xl border border-blue-200 bg-white p-4">
                        <p className="text-sm font-semibold text-slate-800">
                          Menunggu pembayaran
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Ikuti instruksi bank untuk membayar. Sekolah belum
                          dianggap lunas hanya karena nomor pembayaran dibuat.
                          Backend akan memproses notifikasi pembayaran dari Midtrans.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-7 border-t border-slate-100 pt-6">
                  <a
                    href="/daftar-sekolah"
                    className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
                  >
                    <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
                    Kembali ke pendaftaran
                  </a>
                </div>
              </div>
            </div>

            <aside className="space-y-5">
              <div className="overflow-hidden rounded-2xl bg-[#0D1B38] shadow-xl">
                <div className="relative p-6">
                  <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue-500/15 blur-2xl" />

                  <div className="relative">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                      <Building2 className="h-5 w-5" />
                    </div>

                    <h3 className="mt-5 text-lg font-bold text-white">
                      Aktivasi SmartSchool
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      Verifikasi email untuk melanjutkan proses pendaftaran
                      dan pembayaran sesuai paket pilihan.
                    </p>

                    <div className="mt-6 space-y-4">
                      <div className="flex gap-3">
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            Verifikasi email
                          </p>
                          <p className="mt-0.5 text-xs leading-5 text-slate-400">
                            Konfirmasi email administrator dengan kode OTP.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-600 text-slate-400">
                          <CreditCard className="h-3 w-3" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-300">
                            Pembayaran paket
                          </p>
                          <p className="mt-0.5 text-xs leading-5 text-slate-500">
                            Untuk paket berbayar, gunakan instruksi pembayaran
                            yang diberikan backend.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Keamanan akun
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Proses verifikasi email
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                    <LockKeyhole className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-medium text-slate-600">
                      Verifikasi berbasis OTP
                    </span>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-medium text-slate-600">
                      Email administrator
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Butuh bantuan?
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Hubungi tim SmartSchool apabila mengalami kendala saat proses
                  verifikasi atau pembayaran.
                </p>
                <a
                  href="mailto:info@smartschool.com"
                  className="mt-4 inline-flex text-sm font-bold text-blue-600 transition hover:text-blue-700"
                >
                  info@smartschool.com
                </a>
              </div>
            </aside>
          </div>

          <footer className="mt-10 border-t border-slate-200 pt-6 text-center">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} SmartSchool. School Management System.
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
}

export default function VerifyTenantPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <VerifyTenantPageContent />
    </Suspense>
  );
}
