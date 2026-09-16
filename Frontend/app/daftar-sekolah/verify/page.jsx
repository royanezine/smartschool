"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";

import { verifyTenant } from "../../../services/tenant.service";

export default function VerifyTenantPage() {
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

  useEffect(() => {
    if (emailFromUrl) {
      setEmail(emailFromUrl);
      return;
    }

    const savedEmail = sessionStorage.getItem(
      "tenant_register_email"
    );

    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, [emailFromUrl]);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setResultData(null);

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedOtp = kodeOtp.replace(/\D/g, "");

    if (!normalizedEmail) {
      setError("Email wajib diisi.");
      return;
    }

    if (!normalizedOtp) {
      setError("Kode OTP wajib diisi.");
      return;
    }

    if (normalizedOtp.length !== 6) {
      setError("Kode OTP harus terdiri dari 6 digit.");
      return;
    }

    const allowedBanks = ["bca", "bni", "bri"];

    if (!allowedBanks.includes(bank.toLowerCase())) {
      setError("Bank pembayaran tidak valid.");
      return;
    }

    try {
      setLoading(true);

      const result = await verifyTenant(
        normalizedEmail,
        normalizedOtp,
        bank.toLowerCase()
      );

      if (!result?.success) {
        throw new Error(
          result?.message || "Verifikasi gagal."
        );
      }

      const data = result?.data || {};

      setResultData(data);

      if (data.is_trial === true) {
        setSuccess(
          result.message ||
            "Sekolah uji coba berhasil dibuat. Silakan login."
        );

        sessionStorage.removeItem(
          "tenant_register_email"
        );

        sessionStorage.removeItem(
          "tenant_register_nama"
        );

        sessionStorage.removeItem(
          "tenant_register_paket_id"
        );

        setTimeout(() => {
          router.push("/login");
        }, 2000);

        return;
      }

      if (data.is_trial === false) {
        setSuccess(
          result.message ||
            "Verifikasi berhasil. Silakan lakukan pembayaran."
        );

        return;
      }

      setSuccess(
        result.message || "Verifikasi berhasil."
      );
    } catch (err) {
      console.error("VERIFY TENANT ERROR:", err);

      setError(
        err?.message ||
          "Verifikasi gagal. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <a
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0D47C9] shadow-sm">
              <span className="text-lg font-extrabold tracking-tight text-white">
                S
              </span>
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
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3.5 py-2 text-xs font-semibold text-blue-100 backdrop-blur">
              <ShieldCheck className="h-4 w-4 text-blue-300" />
              Verifikasi Pendaftaran Sekolah
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[42px]">
              Verifikasi akun
              <span className="text-blue-400">
                {" "}SmartSchool
              </span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Konfirmasi alamat email dengan kode OTP
              yang telah dikirim untuk melanjutkan proses
              pendaftaran sekolah.
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-7 grid grid-cols-3 gap-2 sm:gap-4">
            <div className="rounded-xl border border-blue-100 bg-white p-3 shadow-sm sm:p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <Check className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Langkah 01
                  </p>
                  <p className="truncate text-xs font-bold text-slate-800 sm:text-sm">
                    Pendaftaran
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 shadow-sm sm:p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#155DFC] text-white">
                  <KeyRound className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-500">
                    Langkah 02
                  </p>
                  <p className="truncate text-xs font-bold text-slate-900 sm:text-sm">
                    Verifikasi
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                  <CreditCard className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Langkah 03
                  </p>
                  <p className="truncate text-xs font-bold text-slate-700 sm:text-sm">
                    Aktivasi
                  </p>
                </div>
              </div>
            </div>
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
                      Masukkan kode OTP yang dikirim
                      ke alamat email administrator.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                {error && (
                  <div className="mb-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                      <ShieldCheck className="h-4 w-4" />
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

                <form
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div>
                    <label className="mb-2.5 block text-sm font-semibold text-slate-700">
                      Email Administrator
                    </label>

                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        type="email"
                        value={email}
                        onChange={(event) =>
                          setEmail(event.target.value)
                        }
                        placeholder="admin@sekolah.sch.id"
                        disabled={loading}
                        className={`${inputClass} pl-11`}
                      />
                    </div>

                    <p className="mt-2 text-xs leading-5 text-slate-400">
                      Gunakan email yang digunakan saat
                      mendaftarkan sekolah.
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
                          const value =
                            event.target.value
                              .replace(/\D/g, "")
                              .slice(0, 6);

                          setKodeOtp(value);
                        }}
                        placeholder="000000"
                        disabled={loading}
                        className={`${inputClass} pl-11 text-center text-2xl font-bold tracking-[0.45em]`}
                      />
                    </div>

                    <p className="mt-2 text-xs leading-5 text-slate-400">
                      Masukkan kode OTP yang diterima
                      melalui email.
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
                        onChange={(event) =>
                          setBank(
                            event.target.value.toLowerCase()
                          )
                        }
                        disabled={loading}
                        className={`${inputClass} appearance-none pl-11`}
                      >
                        <option value="bca">
                          BCA
                        </option>

                        <option value="bni">
                          BNI
                        </option>

                        <option value="bri">
                          BRI
                        </option>
                      </select>

                      <ArrowRight className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-slate-400" />
                    </div>

                    <p className="mt-2 text-xs leading-5 text-slate-400">
                      Untuk paket berbayar, Virtual Account
                      akan dibuat setelah verifikasi berhasil.
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-6">
                    <button
                      type="submit"
                      disabled={
                        loading ||
                        kodeOtp.length !== 6 ||
                        !email.trim()
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#155DFC] px-5 py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(21,93,252,0.2)] transition hover:bg-[#0D47C9] hover:shadow-[0_10px_24px_rgba(21,93,252,0.25)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
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
                      Data verifikasi diproses secara aman
                    </div>
                  </div>
                </form>

                {resultData &&
                  resultData.is_trial === false &&
                  resultData.va_number && (
                    <div className="mt-7 overflow-hidden rounded-2xl border border-blue-200 bg-blue-50/70">
                      <div className="border-b border-blue-100 bg-blue-100/50 px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                            <CreditCard className="h-5 w-5" />
                          </div>

                          <div>
                            <p className="text-sm font-bold text-blue-950">
                              Virtual Account berhasil dibuat
                            </p>
                            <p className="mt-0.5 text-xs text-blue-700">
                              Gunakan informasi berikut untuk
                              menyelesaikan pembayaran.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-5 p-5 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                            Bank
                          </p>

                          <p className="mt-1 text-sm font-bold text-blue-950">
                            {resultData.bank}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                            Nomor Virtual Account
                          </p>

                          <p className="mt-1 break-all text-lg font-bold tracking-wide text-blue-950">
                            {resultData.va_number}
                          </p>
                        </div>

                        {resultData.gross_amount != null && (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                              Total Pembayaran
                            </p>

                            <p className="mt-1 text-sm font-bold text-blue-950">
                              Rp{" "}
                              {Number(
                                resultData.gross_amount
                              ).toLocaleString("id-ID")}
                            </p>
                          </div>
                        )}

                        {resultData.order_id && (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                              Order ID
                            </p>

                            <p className="mt-1 break-all text-sm font-semibold text-blue-950">
                              {resultData.order_id}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                <div className="mt-7 border-t border-slate-100 pt-6">
                  <a
                    href="/daftar"
                    className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
                  >
                    <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
                    Kembali ke pendaftaran
                  </a>
                </div>
              </div>
            </div>

            <aside className="space-y-5">
              <div className="overflow-hidden rounded-2xl bg-[#0D1B38] shadow-[0_12px_35px_rgba(15,23,42,0.12)]">
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
                      Selesaikan verifikasi untuk
                      mengaktifkan akun sekolah dan
                      melanjutkan ke tahap berikutnya.
                    </p>

                    <div className="mt-6 space-y-4">
                      <div className="flex gap-3">
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                          <Check className="h-3.5 w-3.5" />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-white">
                            Email terverifikasi
                          </p>
                          <p className="mt-0.5 text-xs leading-5 text-slate-400">
                            Konfirmasi kepemilikan email
                            administrator.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-600 text-slate-400">
                          <CreditCard className="h-3 w-3" />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-300">
                            Aktivasi paket
                          </p>
                          <p className="mt-0.5 text-xs leading-5 text-slate-500">
                            Sistem memproses paket sekolah
                            yang dipilih.
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
                      Proses verifikasi terlindungi
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
                  Hubungi tim SmartSchool apabila
                  mengalami kendala saat proses verifikasi.
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
              © {new Date().getFullYear()} SmartSchool.
              School Management System.
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
}