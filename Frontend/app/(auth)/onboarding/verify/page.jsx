"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Mail,
  ShieldCheck,
  Loader2,
  CreditCard,
} from "lucide-react";

import { verifyTenant } from "@/services/tenant.service";

const BANKS = [
  { value: "bca", label: "BCA" },
  { value: "bni", label: "BNI" },
  { value: "bri", label: "BRI" },
];

export default function VerifyPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [bank, setBank] = useState("bca");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const inputRefs = useRef([]);

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("onboarding_email");

    if (!savedEmail) {
      router.replace("/onboarding/school");
      return;
    }

    setEmail(savedEmail);
  }, [router]);

  const handleOtpChange = (index, value) => {
    const numericValue = value.replace(/\D/g, "");
    const nextOtp = [...otp];

    if (!numericValue) {
      nextOtp[index] = "";
      setOtp(nextOtp);
      return;
    }

    nextOtp[index] = numericValue.slice(-1);
    setOtp(nextOtp);

    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();

    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) return;

    const nextOtp = ["", "", "", "", "", ""];

    pasted.split("").forEach((digit, index) => {
      nextOtp[index] = digit;
    });

    setOtp(nextOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setError("");
    setSuccess("");

    const kodeOtp = otp.join("");

    if (!email) {
      setError("Email pendaftaran tidak ditemukan.");
      return;
    }

    if (kodeOtp.length !== 6) {
      setError("Masukkan kode OTP 6 digit.");
      return;
    }

    if (!BANKS.some((item) => item.value === bank)) {
      setError("Silakan pilih bank untuk pembayaran.");
      return;
    }

    try {
      setLoading(true);

      // Bank yang dipilih sekarang ikut dikirim ke Backend.
      const result = await verifyTenant(email, kodeOtp, bank);

      if (!result?.success) {
        throw new Error(result?.message || "Verifikasi gagal.");
      }

      const data = result.data || {};

      sessionStorage.setItem("onboarding_email", email);
      sessionStorage.setItem("onboarding_bank", bank);

      if (data.is_trial === true) {
        setSuccess("Verifikasi berhasil. Sekolah uji coba telah dibuat.");

        setTimeout(() => {
          router.push("/login");
        }, 800);

        return;
      }

      // Backend yang kamu kirim mengembalikan VA,
      // bukan payment_url.
      if (data.va_number) {
        sessionStorage.setItem("onboarding_order_id", data.order_id || "");
        sessionStorage.setItem("onboarding_va_number", data.va_number);
        sessionStorage.setItem("onboarding_gross_amount", String(data.gross_amount ?? ""));
        sessionStorage.setItem("onboarding_payment_bank", data.bank || bank.toUpperCase());

        setSuccess("Verifikasi berhasil. Menyiapkan informasi pembayaran...");

        setTimeout(() => {
          router.push("/onboarding/payment");
        }, 500);

        return;
      }

      // Mendukung respons lama yang memang menyediakan payment_url.
      if (data.payment_url) {
        sessionStorage.setItem("onboarding_payment_url", data.payment_url);

        setSuccess("Verifikasi berhasil. Mengarahkan ke pembayaran...");

        setTimeout(() => {
          router.push("/onboarding/payment");
        }, 500);

        return;
      }

      throw new Error(
        "Verifikasi berhasil, tetapi nomor Virtual Account atau informasi pembayaran tidak diterima dari server."
      );
    } catch (err) {
      console.error("VERIFY TENANT ERROR:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Verifikasi OTP gagal. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center justify-center">
        <div className="w-full">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={18} />
            Kembali
          </button>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <ShieldCheck size={32} />
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Verifikasi Email
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Masukkan kode OTP yang telah dikirim ke email pendaftaran kamu.
              </p>
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                <Mail size={19} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Email pendaftaran</p>
                <p className="truncate text-sm font-semibold text-slate-800">
                  {email}
                </p>
              </div>
            </div>

            {error && (
              <div role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-5 text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div role="status" className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-5 text-emerald-700">
                <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-7">
              <label className="mb-3 block text-center text-sm font-semibold text-slate-700">
                Kode OTP
              </label>

              <div className="flex justify-center gap-2 sm:gap-3">
                {otp.map((value, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      inputRefs.current[index] = element;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value}
                    onChange={(event) =>
                      handleOtpChange(index, event.target.value)
                    }
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    onPaste={handlePaste}
                    disabled={loading}
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    aria-label={`Digit OTP ${index + 1}`}
                    className="h-12 w-11 rounded-xl border border-slate-300 bg-white text-center text-lg font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100 sm:h-14 sm:w-12"
                  />
                ))}
              </div>

              <div className="mt-7">
                <label htmlFor="bank" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <CreditCard size={17} />
                  Bank untuk pembayaran
                </label>

                <select
                  id="bank"
                  value={bank}
                  onChange={(event) => setBank(event.target.value)}
                  disabled={loading}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                >
                  {BANKS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label} — Virtual Account
                    </option>
                  ))}
                </select>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Pilih bank yang akan digunakan untuk pembayaran paket berbayar.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.join("").length !== 6 || !email}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  "Verifikasi & Lanjut Pembayaran"
                )}
              </button>
            </form>

            <div className="mt-6 border-t border-slate-100 pt-5 text-center">
              <p className="text-xs leading-5 text-slate-400">
                Setelah OTP berhasil diverifikasi, kamu akan diarahkan ke halaman pembayaran.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}