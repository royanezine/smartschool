"use client";

import { Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  XCircle,
} from "lucide-react";

import { verifyTenant } from "@/services/tenant.service";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const OTP_LENGTH = 6;

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

function PaymentField({ label, children }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#155DFC]">
        {label}
      </p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

/**
 * Input OTP berbentuk 6 kotak (card).
 * - Nilai disimpan sebagai string angka (maks. 6 digit) di state induk.
 * - Mendukung ketik, hapus (Backspace), panah kiri/kanan, paste, dan autofill.
 */
function OtpInput({ value, onChange, disabled, hasError }) {
  const inputsRef = useRef([]);
  const [focusedIndex, setFocusedIndex] = useState(null);

  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] || "");

  function focusAt(index) {
    const safeIndex = Math.max(0, Math.min(OTP_LENGTH - 1, index));
    const el = inputsRef.current[safeIndex];
    if (el) {
      el.focus();
      el.select();
    }
  }

  function handleFocus(index) {
    setFocusedIndex(index);
    inputsRef.current[index]?.select();
  }

  function handleChange(event, index) {
    const raw = event.target.value.replace(/\D/g, "");

    if (!raw) return; // penghapusan ditangani di handleKeyDown

    // Jaga agar pengisian selalu berurutan (tanpa kotak kosong di tengah).
    const start = Math.min(index, value.length);

    // Mendukung 1 digit (ketik biasa) maupun beberapa digit (autofill).
    const next = (value.slice(0, start) + raw + value.slice(start + raw.length))
      .slice(0, OTP_LENGTH);

    onChange(next);
    focusAt(Math.min(start + raw.length, OTP_LENGTH - 1));
  }

  function handleKeyDown(event, index) {
    switch (event.key) {
      case "Backspace": {
        event.preventDefault();

        if (digits[index]) {
          // Hapus digit pada kotak ini.
          onChange(value.slice(0, index) + value.slice(index + 1));
        } else if (index > 0) {
          // Kotak kosong: mundur dan hapus digit sebelumnya.
          onChange(value.slice(0, index - 1) + value.slice(index));
          focusAt(index - 1);
        }
        break;
      }
      case "Delete": {
        event.preventDefault();
        if (digits[index]) {
          onChange(value.slice(0, index) + value.slice(index + 1));
        }
        break;
      }
      case "ArrowLeft":
        event.preventDefault();
        focusAt(index - 1);
        break;
      case "ArrowRight":
        event.preventDefault();
        focusAt(Math.min(index + 1, value.length));
        break;
      default:
        break;
    }
  }

  function handlePaste(event) {
    event.preventDefault();

    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pasted) return;

    onChange(pasted);
    focusAt(Math.min(pasted.length, OTP_LENGTH - 1));
  }

  return (
    <div
      role="group"
      aria-label="Kode OTP 6 digit"
      className="flex justify-center gap-2 sm:gap-3"
    >
      {digits.map((digit, index) => {
        const isFocused = focusedIndex === index;
        const isFilled = Boolean(digit);

        const stateClass = hasError
          ? "border-red-300 bg-red-50 text-red-700 focus:border-red-500 focus:ring-red-500/15"
          : isFocused
            ? "border-[#155DFC] bg-white ring-4 ring-[#155DFC]/15"
            : isFilled
              ? "border-[#155DFC]/40 bg-[#EEF4FF] text-[#0D47C9]"
              : "border-[#DBE5F5] bg-white text-[#0F172A] hover:border-[#155DFC]/50";

        return (
          <input
            key={index}
            ref={(el) => {
              inputsRef.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            aria-label={`Digit ${index + 1} dari ${OTP_LENGTH}`}
            value={digit}
            disabled={disabled}
            onChange={(event) => handleChange(event, index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            onFocus={() => handleFocus(index)}
            onBlur={() => setFocusedIndex(null)}
            onPaste={handlePaste}
            className={`h-14 w-11 rounded-xl border-2 text-center text-2xl font-extrabold shadow-sm outline-none transition sm:h-16 sm:w-14 sm:text-3xl disabled:cursor-not-allowed disabled:bg-[#F5F8FE] disabled:text-[#94A3B8] ${stateClass}`}
          />
        );
      })}
    </div>
  );
}

function VerifyTenantPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduce = useReducedMotion();

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

    if (normalizedOtp.length !== OTP_LENGTH) {
      setError("Kode OTP harus terdiri dari 6 digit.");
      return;
    }

    if (!BANK_OPTIONS.some((item) => item.value === normalizedBank)) {
      setError("Pilihan bank tidak valid.");
      return;
    }

    try {
      setLoading(true);

      const result = await verifyTenant(
        normalizedEmail,
        normalizedOtp,
        normalizedBank
      );

      if (!result || result.success === false) {
        throw new Error(
          result?.message ||
            result?.error ||
            "Verifikasi gagal. Periksa kode OTP dan coba kembali."
        );
      }

      // Mendukung respons langsung maupun respons dengan pembungkus data.
      const responseData = result?.data;
      const data =
        responseData?.data && typeof responseData.data === "object"
          ? responseData.data
          : responseData && typeof responseData === "object"
            ? responseData
            : result;

      if (data.is_trial === true) {
        setTrialCreated(true);
        setSuccess(
          result.message ||
            "Sekolah uji coba berhasil dibuat. Anda akan diarahkan ke halaman login."
        );

        // Tidak menyimpan atau menghapus data pendaftaran di browser.
        // Tampilkan status berhasil terlebih dahulu agar pengguna bisa membaca pesan.
        return;
      }

      if (data.is_trial === false) {
        if (!data.order_id) {
          throw new Error(
            "Verifikasi berhasil, tetapi Order ID pembayaran tidak ditemukan."
          );
        }

        const paymentData = {
          order_id: data.order_id,
          gross_amount: data.gross_amount,
          bank: data.bank || normalizedBank,
          snap_token: data.snap_token || null,
          redirect_url: data.redirect_url || null,
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

        return;
      }

      throw new Error(
        "Respons backend tidak memuat status paket yang dikenali."
      );
    } catch (err) {
      const errorObject = err && typeof err === "object" ? err : null;

      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof errorObject?.message === "string"
            ? errorObject.message
            : typeof errorObject?.error === "string"
              ? errorObject.error
              : typeof errorObject?.payload?.message === "string"
                ? errorObject.payload.message
                : "Verifikasi gagal. Silakan coba kembali.";

      console.error("VERIFY TENANT ERROR:", {
        message: errorMessage,
        name: errorObject?.name,
        status: errorObject?.status,
        errorCode: errorObject?.errorCode,
        payload: errorObject?.payload,
        error: err,
      });

      setError(errorMessage);
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

  function handleOtpChange(nextValue) {
    setKodeOtp(nextValue);
    if (error) setError("");
  }

  const inputClass =
    "w-full rounded-xl border border-[#DBE5F5] bg-white px-4 py-3 text-sm font-medium text-[#0F172A] outline-none transition placeholder:font-normal placeholder:text-[#94A3B8] hover:border-[#155DFC]/50 focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/15 disabled:cursor-not-allowed disabled:bg-[#F5F8FE] disabled:text-[#94A3B8]";

  const iconClass =
    "pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]";

  const verified = trialCreated || Boolean(resultData);

  const steps = [
    { title: "Pendaftaran", icon: Check, state: "done" },
    {
      title: "Verifikasi",
      icon: KeyRound,
      state: verified ? "done" : "active",
    },
    {
      title: "Pembayaran",
      icon: CreditCard,
      state: resultData ? "active" : "todo",
    },
  ];

  return (
    <main
      className={`${jakarta.className} relative isolate min-h-screen overflow-hidden bg-[#EEF4FF] text-[#0F172A]`}
    >
      {/* Latar */}
      <div className="absolute inset-0 -z-30">
        <Image
          src="/hero/hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 backdrop-blur-[6px]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-white/90 via-[#EEF4FF]/85 to-[#EEF4FF]/95"
      />

      <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 pb-6 pt-5 sm:px-6">
        {/* Bar atas: kembali + logo */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push("/daftar-sekolah")}
            aria-label="Kembali ke pendaftaran"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#0F172A] shadow-sm ring-1 ring-[#0F172A]/10 transition-all hover:bg-[#0F172A] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#155DFC]"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>

          <Link
            href="/"
            aria-label="Smart School Beranda"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <Image
              src="/logo/logoSS.png"
              alt="Logo Smart School"
              width={40}
              height={40}
              priority
              className="h-10 w-10 object-contain"
            />
            <span className="text-xl font-extrabold leading-none tracking-tight text-[#0F172A]">
              SMART <span className="text-[#155DFC]">SCHOOL</span>
            </span>
          </Link>
        </div>

        <div className="flex flex-1 items-center py-6">
          <motion.section
            initial={{ opacity: 0, y: reduce ? 0 : 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.55, ease: "easeOut" }}
            className="w-full overflow-hidden rounded-3xl bg-white shadow-[0_24px_70px_rgba(15,23,42,0.14)]"
          >
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#155DFC] to-[#0D47C9] px-6 py-6 text-white sm:px-9">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-white/[0.07]"
              />

              <div className="relative flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#155DFC] shadow-lg shadow-[#0D47C9]/40">
                  <Mail size={22} />
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
                    Verifikasi Pendaftaran Sekolah
                  </p>
                  <h1 className="mt-0.5 text-xl font-extrabold tracking-tight sm:text-2xl">
                    Verifikasi Email
                  </h1>
                  <p className="mt-0.5 text-[13px] font-medium text-white/80">
                    Masukkan kode OTP yang dikirim ke email administrator.
                  </p>
                </div>
              </div>
            </div>

            {/* Stepper */}
            <div className="border-b border-[#E5ECF8] bg-[#F5F8FE] px-6 py-4 sm:px-9">
              <ol className="flex items-center">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isDone = step.state === "done";
                  const isActive = step.state === "active";

                  return (
                    <li
                      key={step.title}
                      className={`flex items-center ${
                        index !== steps.length - 1 ? "flex-1" : ""
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${
                            isDone
                              ? "bg-[#155DFC] text-white"
                              : isActive
                                ? "bg-gradient-to-br from-[#2F6FFF] to-[#0D47C9] text-white shadow-md shadow-[#155DFC]/30 ring-4 ring-[#155DFC]/15"
                                : "bg-white text-[#94A3B8] ring-1 ring-[#DBE5F5]"
                          }`}
                        >
                          <Icon size={15} strokeWidth={isDone ? 3 : 2} />
                        </span>
                        <span
                          className={`hidden text-xs font-bold sm:block ${
                            isDone || isActive
                              ? "text-[#0F172A]"
                              : "text-[#94A3B8]"
                          }`}
                        >
                          {step.title}
                        </span>
                      </div>

                      {index !== steps.length - 1 && (
                        <span
                          aria-hidden="true"
                          className={`mx-3 h-px flex-1 ${
                            isDone ? "bg-[#155DFC]" : "bg-[#DBE5F5]"
                          }`}
                        />
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="px-6 pb-6 pt-6 sm:px-9">
              {error && (
                <div
                  role="alert"
                  className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
                >
                  <XCircle className="mt-0.5 h-[18px] w-[18px] shrink-0 text-red-600" />
                  <div>
                    <p className="text-sm font-bold text-red-800">
                      Verifikasi gagal
                    </p>
                    <p className="mt-0.5 text-[13px] leading-5 text-red-700">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {success && (
                <div
                  role="status"
                  className="mb-5 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4"
                >
                  <CheckCircle2 className="mt-0.5 h-[18px] w-[18px] shrink-0 text-emerald-600" />
                  <div>
                    <p className="text-sm font-bold text-emerald-800">
                      Verifikasi berhasil
                    </p>
                    <p className="mt-0.5 text-[13px] leading-5 text-emerald-700">
                      {success}
                    </p>
                  </div>
                </div>
              )}

              {!trialCreated && !resultData && (
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="verify-email"
                        className="mb-2 block text-[13px] font-bold text-[#0F172A]"
                      >
                        Email Administrator
                      </label>
                      <div className="relative">
                        <Mail className={iconClass} />
                        <input
                          id="verify-email"
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
                    </div>

                    <div>
                      <label
                        htmlFor="verify-bank"
                        className="mb-2 block text-[13px] font-bold text-[#0F172A]"
                      >
                        Bank Pembayaran
                      </label>
                      <div className="relative">
                        <CreditCard className={iconClass} />
                        <select
                          id="verify-bank"
                          value={bank}
                          onChange={(event) => setBank(event.target.value)}
                          disabled={loading}
                          className={`${inputClass} appearance-none pl-11 pr-10`}
                        >
                          {BANK_OPTIONS.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                        <ArrowRight className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-[#94A3B8]" />
                      </div>
                    </div>

                    {/* Kode OTP: 6 kotak */}
                    <div className="sm:col-span-2">
                      <div className="rounded-2xl border border-[#E5ECF8] bg-[#F5F8FE] px-4 py-5 sm:px-6">
                        <div className="mb-4 flex flex-col items-center text-center">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#155DFC] shadow-sm ring-1 ring-[#DBE5F5]">
                            <KeyRound className="h-5 w-5" />
                          </span>
                          <p className="mt-3 text-sm font-extrabold text-[#0F172A]">
                            Masukkan Kode OTP
                          </p>
                          <p className="mt-1 text-xs font-medium leading-5 text-[#475569]/80">
                            Ketik 6 digit kode yang dikirim ke email Anda, atau
                            tempel langsung kodenya.
                          </p>
                        </div>

                        <OtpInput
                          value={kodeOtp}
                          onChange={handleOtpChange}
                          disabled={loading}
                          hasError={Boolean(error)}
                        />

                        <p
                          aria-live="polite"
                          className="mt-4 text-center text-xs font-bold text-[#155DFC]"
                        >
                          {kodeOtp.length}/{OTP_LENGTH} digit terisi
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-xs font-medium leading-5 text-[#475569]/80">
                    Gunakan email yang sama saat mendaftar. OTP berlaku selama 5
                    menit. Pilihan bank digunakan jika paket berbayar.
                  </p>

                  <button
                    type="submit"
                    disabled={
                      loading || kodeOtp.length !== OTP_LENGTH || !email.trim()
                    }
                    className="group mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#155DFC] to-[#0D47C9] px-6 text-sm font-bold text-white shadow-lg shadow-[#155DFC]/30 transition hover:shadow-xl hover:shadow-[#155DFC]/40 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Memverifikasi...
                      </>
                    ) : (
                      <>
                        Verifikasi OTP
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {trialCreated && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    <div>
                      <h3 className="font-extrabold text-emerald-900">
                        Pendaftaran uji coba berhasil
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-emerald-800">
                        Backend sudah memproses pendaftaran paket gratis. Anda
                        akan diarahkan ke halaman login.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/login"
                    className="group mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#155DFC] to-[#0D47C9] text-sm font-bold text-white shadow-lg shadow-[#155DFC]/30 transition hover:brightness-110"
                  >
                    Masuk ke halaman login
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              )}

              {resultData?.is_trial === false && (
                <div className="overflow-hidden rounded-2xl border border-[#DBE5F5] bg-[#F5F8FE]">
                  <div className="flex items-center gap-3 border-b border-[#DBE5F5] bg-white px-5 py-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2F6FFF] to-[#0D47C9] text-white shadow-md shadow-[#155DFC]/30">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-[#0F172A]">
                        Instruksi Pembayaran
                      </p>
                      <p className="mt-0.5 text-xs font-medium text-[#475569]/80">
                        Gunakan informasi berikut untuk menyelesaikan
                        pembayaran.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 p-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <PaymentField label="Bank Pembayaran">
                        <p className="text-sm font-extrabold uppercase text-[#0F172A]">
                          {BANK_OPTIONS.find(
                            (item) =>
                              item.value ===
                              String(resultData.bank || bank).toLowerCase()
                          )?.label ||
                            resultData.bank ||
                            bank}
                        </p>
                      </PaymentField>

                      <PaymentField label="Total Pembayaran">
                        <p className="text-xl font-extrabold text-[#155DFC]">
                          {formatRupiah(resultData.gross_amount)}
                        </p>
                      </PaymentField>
                    </div>

                    {resultData.va_number && (
                      <PaymentField label="Nomor Virtual Account / Kode Pembayaran">
                        <div className="flex items-start gap-2">
                          <p className="min-w-0 flex-1 break-all text-lg font-extrabold tracking-wide text-[#0F172A]">
                            {resultData.va_number}
                          </p>
                          <button
                            type="button"
                            onClick={() => copyPaymentInfo(resultData.va_number)}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#DBE5F5] bg-white px-3 py-2 text-xs font-bold text-[#155DFC] transition hover:border-[#155DFC]/40 hover:bg-[#EEF4FF]"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            Salin
                          </button>
                        </div>
                      </PaymentField>
                    )}

                    {(resultData.biller_code || resultData.bill_key) && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {resultData.biller_code && (
                          <PaymentField label="Biller Code">
                            <p className="break-all text-sm font-extrabold text-[#0F172A]">
                              {resultData.biller_code}
                            </p>
                          </PaymentField>
                        )}

                        {resultData.bill_key && (
                          <PaymentField label="Bill Key">
                            <p className="break-all text-sm font-extrabold text-[#0F172A]">
                              {resultData.bill_key}
                            </p>
                          </PaymentField>
                        )}
                      </div>
                    )}

                    {resultData.expiry_time && (
                      <PaymentField label="Batas Waktu Pembayaran">
                        <p className="flex items-center gap-2 text-sm font-bold text-[#0F172A]">
                          <Clock className="h-4 w-4 text-[#155DFC]" />
                          {resultData.expiry_time}
                        </p>
                      </PaymentField>
                    )}

                    <PaymentField label="Order ID">
                      <p className="break-all text-sm font-bold text-[#0F172A]">
                        {resultData.order_id}
                      </p>
                    </PaymentField>

                    {resultData.redirect_url && (
                      <a
                        href={resultData.redirect_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#155DFC] to-[#0D47C9] px-5 text-sm font-bold text-white shadow-lg shadow-[#155DFC]/30 transition hover:shadow-xl hover:shadow-[#155DFC]/40 hover:brightness-110"
                      >
                        <span>Bayar Sekarang (Midtrans)</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </a>
                    )}

                    {copied && (
                      <p className="text-xs font-bold text-emerald-700">
                        Informasi berhasil disalin.
                      </p>
                    )}

                    <div className="rounded-xl border border-[#DBE5F5] bg-white p-4">
                      <p className="text-sm font-extrabold text-[#0F172A]">
                        Menunggu pembayaran
                      </p>
                      <p className="mt-1 text-xs font-medium leading-5 text-[#475569]/90">
                        Ikuti instruksi bank untuk membayar. Sekolah belum
                        dianggap lunas hanya karena nomor pembayaran dibuat.
                        Backend akan memproses notifikasi pembayaran dari
                        Midtrans.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-5 flex flex-col gap-2 border-t border-[#E5ECF8] pt-4 text-xs font-medium text-[#475569]/80 sm:flex-row sm:items-center sm:justify-between">
                <span className="flex items-center gap-2">
                  <LockKeyhole className="h-3.5 w-3.5 text-[#155DFC]" />
                  Data verifikasi diproses secara aman
                </span>
                <span>
                  Butuh bantuan?{" "}
                  <a
                    href="mailto:info@smartschool.com"
                    className="font-bold text-[#155DFC] transition hover:text-[#0D47C9]"
                  >
                    info@smartschool.com
                  </a>
                </span>
              </div>
            </div>
          </motion.section>
        </div>

        <p className="text-center text-xs font-medium text-[#475569]/70">
          © {new Date().getFullYear()} SmartSchool. School Management System.
        </p>
      </div>
    </main>
  );
}

export default function VerifyTenantPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#EEF4FF]" />}>
      <VerifyTenantPageContent />
    </Suspense>
  );
}