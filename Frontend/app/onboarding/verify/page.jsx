"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Mail,
  ShieldCheck,
  Loader2,
} from "lucide-react";

import { verifyTenant } from "../../../services/tenant.service";

export default function VerifyPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [otp, setOtp] =
    useState([
      "",
      "",
      "",
      "",
      "",
      "",
    ]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const inputRefs = useRef([]);

  // =====================================================
  // GET EMAIL
  // =====================================================

  useEffect(() => {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    const savedEmail =
      sessionStorage.getItem(
        "onboarding_email"
      );

    if (!savedEmail) {
      router.replace(
        "/onboarding/school"
      );

      return;
    }

    setEmail(savedEmail);
  }, [router]);

  // =====================================================
  // HANDLE OTP CHANGE
  // =====================================================

  const handleOtpChange = (
    index,
    value
  ) => {
    const numericValue =
      value.replace(
        /\D/g,
        ""
      );

    if (!numericValue) {
      const newOtp = [...otp];

      newOtp[index] = "";

      setOtp(newOtp);

      return;
    }

    const newOtp = [...otp];

    newOtp[index] =
      numericValue.slice(-1);

    setOtp(newOtp);

    if (
      index <
      inputRefs.current.length - 1
    ) {
      inputRefs.current[
        index + 1
      ]?.focus();
    }
  };

  // =====================================================
  // HANDLE KEY DOWN
  // =====================================================

  const handleKeyDown = (
    index,
    event
  ) => {
    if (
      event.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[
        index - 1
      ]?.focus();
    }

    if (
      event.key === "ArrowLeft" &&
      index > 0
    ) {
      inputRefs.current[
        index - 1
      ]?.focus();
    }

    if (
      event.key === "ArrowRight" &&
      index <
        inputRefs.current.length - 1
    ) {
      inputRefs.current[
        index + 1
      ]?.focus();
    }
  };

  // =====================================================
  // HANDLE PASTE
  // =====================================================

  const handlePaste = (
    event
  ) => {
    event.preventDefault();

    const pasted =
      event.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, 6);

    if (!pasted) {
      return;
    }

    const newOtp = [
      "",
      "",
      "",
      "",
      "",
      "",
    ];

    pasted
      .split("")
      .forEach(
        (value, index) => {
          newOtp[index] =
            value;
        }
      );

    setOtp(newOtp);

    const focusIndex =
      Math.min(
        pasted.length,
        5
      );

    inputRefs.current[
      focusIndex
    ]?.focus();
  };

  // =====================================================
  // SUBMIT OTP
  // =====================================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError("");
    setSuccess("");

    const kodeOtp =
      otp.join("");

    // ===================================================
    // VALIDATION
    // ===================================================

    if (!email) {
      setError(
        "Email pendaftaran tidak ditemukan."
      );

      return;
    }

    if (kodeOtp.length !== 6) {
      setError(
        "Masukkan kode OTP 6 digit."
      );

      return;
    }

    try {
      setLoading(true);

      // =================================================
      // CALL BE
      // POST /api/v1/tenant/verify
      // =================================================

      const result =
        await verifyTenant(
          email,
          kodeOtp
        );

      console.log(
        "========== HASIL VERIFY =========="
      );

      console.log(
        "RESULT:",
        result
      );

      console.log(
        "DATA:",
        result?.data
      );

      console.log(
        "PAYMENT URL:",
        result?.data
          ?.payment_url
      );

      console.log(
        "=================================="
      );

      // =================================================
      // BE MENGEMBALIKAN PAYMENT URL
      // =================================================

      const paymentUrl =
        result?.data
          ?.payment_url;

      if (!paymentUrl) {
        throw new Error(
          "Verifikasi berhasil, tetapi link pembayaran tidak diterima dari server."
        );
      }

      // =================================================
      // SIMPAN DATA UNTUK HALAMAN PAYMENT
      // =================================================

      sessionStorage.setItem(
        "onboarding_email",
        email
      );

      sessionStorage.setItem(
        "onboarding_payment_url",
        paymentUrl
      );

      // =================================================
      // LANJUT KE PAYMENT
      // =================================================

      setSuccess(
        "Verifikasi berhasil. Mengarahkan ke pembayaran..."
      );

      setTimeout(() => {
        router.push(
          "/onboarding/payment"
        );
      }, 500);
    } catch (error) {
      console.error(
        "VERIFY TENANT ERROR:",
        error
      );

      setError(
        error?.message ||
          "Verifikasi OTP gagal. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // BACK
  // =====================================================

  const handleBack = () => {
    router.back();
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center justify-center">
        <div className="w-full">
          {/* BACK */}

          <button
            type="button"
            onClick={handleBack}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft
              size={18}
            />

            Kembali
          </button>

          {/* CARD */}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
            {/* ICON */}

            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <ShieldCheck
                  size={32}
                />
              </div>
            </div>

            {/* TITLE */}

            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Verifikasi Email
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Masukkan kode OTP yang
                telah dikirim ke email
                pendaftaran kamu.
              </p>
            </div>

            {/* EMAIL */}

            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                <Mail
                  size={19}
                />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-slate-500">
                  Email pendaftaran
                </p>

                <p className="truncate text-sm font-semibold text-slate-800">
                  {email}
                </p>
              </div>
            </div>

            {/* ERROR */}

            {error && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-5 text-red-700">
                {error}
              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-5 text-emerald-700">
                <CheckCircle2
                  size={19}
                  className="mt-0.5 shrink-0"
                />

                <span>
                  {success}
                </span>
              </div>
            )}

            {/* FORM */}

            <form
              onSubmit={
                handleSubmit
              }
              className="mt-7"
            >
              <label className="mb-3 block text-center text-sm font-semibold text-slate-700">
                Kode OTP
              </label>

              {/* OTP INPUT */}

              <div className="flex justify-center gap-2 sm:gap-3">
                {otp.map(
                  (
                    value,
                    index
                  ) => (
                    <input
                      key={index}
                      ref={(element) => {
                        inputRefs.current[
                          index
                        ] =
                          element;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={value}
                      onChange={(
                        event
                      ) =>
                        handleOtpChange(
                          index,
                          event
                            .target
                            .value
                        )
                      }
                      onKeyDown={(
                        event
                      ) =>
                        handleKeyDown(
                          index,
                          event
                        )
                      }
                      onPaste={
                        handlePaste
                      }
                      disabled={
                        loading
                      }
                      autoComplete="one-time-code"
                      className="h-12 w-11 rounded-xl border border-slate-300 bg-white text-center text-lg font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100 sm:h-14 sm:w-12"
                    />
                  )
                )}
              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={
                  loading ||
                  otp.join("")
                    .length !== 6
                }
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                    Memverifikasi...
                  </>
                ) : (
                  "Verifikasi & Lanjut Pembayaran"
                )}
              </button>
            </form>

            {/* INFO */}

            <div className="mt-6 border-t border-slate-100 pt-5 text-center">
              <p className="text-xs leading-5 text-slate-400">
                Setelah OTP berhasil
                diverifikasi, kamu akan
                diarahkan ke halaman
                pembayaran.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}