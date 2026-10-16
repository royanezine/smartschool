"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  CreditCard,
  ExternalLink,
  Info,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

function formatRupiah(value) {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export default function PembayaranPage() {
  const router = useRouter();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const savedPayment = sessionStorage.getItem("tenant_payment_data");

      if (!savedPayment) {
        setError(
          "Informasi pembayaran tidak ditemukan. Silakan lakukan verifikasi terlebih dahulu."
        );
        return;
      }

      const parsedPayment = JSON.parse(savedPayment);

      if (!parsedPayment || typeof parsedPayment !== "object") {
        setError("Informasi pembayaran tidak valid.");
        return;
      }

      if (
        parsedPayment.is_trial === false &&
        !parsedPayment.redirect_url
      ) {
        setError(
          "Tautan pembayaran belum tersedia. Silakan ulangi proses verifikasi."
        );
        return;
      }

      setPayment(parsedPayment);
    } catch (err) {
      console.error("Gagal membaca informasi pembayaran:", err);
      setError("Informasi pembayaran gagal dimuat.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCopy = async (value, field = "order") => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(field);

      window.setTimeout(() => {
        setCopied((current) => (current === field ? "" : current));
      }, 2000);
    } catch (err) {
      console.error("Gagal menyalin informasi:", err);
      setError(
        "Informasi tidak berhasil disalin. Silakan salin secara manual."
      );
    }
  };

  const handlePay = () => {
    const redirectUrl = payment?.redirect_url;

    if (!redirectUrl) {
      setError(
        "Tautan pembayaran tidak tersedia. Silakan ulangi proses verifikasi."
      );
      return;
    }

    try {
      const parsedUrl = new URL(redirectUrl);

      if (
        parsedUrl.protocol !== "https:" ||
        parsedUrl.hostname !== "app.sandbox.midtrans.com"
      ) {
        setError("Tautan checkout Midtrans tidak valid.");
        return;
      }

      window.location.assign(parsedUrl.toString());
    } catch {
      setError("Tautan pembayaran tidak valid.");
    }
  };

  const bank = payment?.bank || "";
  const orderId = payment?.order_id || "";
  const grossAmount = payment?.gross_amount;
  const email = payment?.email || "";
  const isTrial = payment?.is_trial === true;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          Memuat informasi pembayaran...
        </div>
      </main>
    );
  }

  if (error && !payment) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Info className="h-6 w-6" />
          </div>

          <h1 className="mt-4 text-xl font-bold text-slate-900">
            Informasi pembayaran tidak tersedia
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() => router.push("/verifikasi-tenant")}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#155DFC] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0D47C9]"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke verifikasi
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-3">
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

          <div className="hidden items-center gap-2 text-xs font-semibold text-emerald-700 sm:flex">
            <ShieldCheck className="h-4 w-4" />
            Verifikasi berhasil
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-slate-200/80 bg-[#0D1B38]">
        <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-40 left-1/4 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3.5 py-2 text-xs font-semibold text-emerald-200">
            <CheckCircle2 className="h-4 w-4" />
            Verifikasi berhasil
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {isTrial ? (
              "Pendaftaran Berhasil"
            ) : (
              <>
                Selesaikan Pembayaran
                <span className="text-blue-400"> SmartSchool</span>
              </>
            )}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            {isTrial
              ? "Pendaftaran paket uji coba telah diproses. Silakan lanjutkan ke halaman login."
              : "Periksa ringkasan transaksi, kemudian lanjutkan pembayaran melalui halaman checkout Midtrans."}
          </p>
        </div>
      </section>

      <section className="px-5 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-7 lg:grid-cols-[minmax(0,1fr)_330px]">
          <div className="space-y-6">
            <div className="flex items-start gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-6 w-6" />
              </div>

              <div>
                <h2 className="text-base font-bold text-emerald-900">
                  Verifikasi berhasil
                </h2>

                <p className="mt-1 text-sm leading-6 text-emerald-800">
                  {isTrial
                    ? "Data pendaftaran berhasil diproses untuk paket uji coba."
                    : "Data pendaftaran berhasil diverifikasi. Pembayaran belum dianggap berhasil sampai backend menerima dan memvalidasi konfirmasi dari Midtrans."}
                </p>
              </div>
            </div>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.05)]">
              <div className="border-b border-slate-100 px-6 py-5 sm:px-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <WalletCards className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Informasi Pembayaran
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Ringkasan transaksi pendaftaran sekolah.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 p-6 sm:p-7">
                <div className="rounded-2xl bg-[#0D1B38] p-5 text-white sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                    Total Pembayaran
                  </p>

                  <p className="mt-2 break-words text-2xl font-extrabold sm:text-3xl">
                    {formatRupiah(grossAmount)}
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-xs text-slate-300">
                    <LockKeyhole className="h-4 w-4" />
                    Pastikan nominal sesuai dengan checkout Midtrans.
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Metode Pembayaran
                  </p>

                  <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                      <Building2 className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm font-bold uppercase text-slate-900">
                        {bank || "Pembayaran melalui Midtrans"}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {bank
                          ? "Pilihan bank yang dikirim saat verifikasi"
                          : "Ikuti pilihan pembayaran yang tersedia saat checkout"}
                      </p>
                    </div>
                  </div>
                </div>

                {orderId && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Order ID
                    </p>

                    <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3">
                      <p className="break-all text-sm font-semibold text-slate-700">
                        {orderId}
                      </p>

                      <button
                        type="button"
                        onClick={() => handleCopy(orderId, "order")}
                        className="shrink-0 text-blue-600 hover:text-blue-700"
                        aria-label="Salin Order ID"
                      >
                        {copied === "order" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {copied === "order" && (
                      <p className="mt-1 text-xs text-emerald-600">
                        Order ID berhasil disalin.
                      </p>
                    )}
                  </div>
                )}

                {email && (
                  <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                    <div>
                      <p className="text-xs font-semibold text-slate-500">
                        Email pendaftaran
                      </p>
                      <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                        {email}
                      </p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                    {error}
                  </div>
                )}

                {!isTrial ? (
                  <>
                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                      <div className="flex items-start gap-3">
                        <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
                        <div>
                          <p className="text-sm font-bold text-blue-900">
                            Lanjutkan melalui checkout Midtrans
                          </p>
                          <p className="mt-1 text-xs leading-5 text-blue-800">
                            Nomor Virtual Account, jika diperlukan, akan
                            ditampilkan sesuai instruksi pada halaman checkout.
                            Kamu tidak perlu memasukkan nomor VA secara manual
                            di halaman ini.
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handlePay}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#155DFC] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#0D47C9]"
                    >
                      <CreditCard className="h-5 w-5" />
                      Bayar Sekarang
                      <ExternalLink className="h-4 w-4" />
                    </button>

                    <p className="text-center text-xs leading-5 text-slate-500">
                      Kamu akan diarahkan ke halaman pembayaran Midtrans
                      untuk menyelesaikan transaksi.
                    </p>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#155DFC] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#0D47C9]"
                  >
                    Lanjut ke Login
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}

                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                  <p className="text-xs leading-5 text-amber-900">
                    {isTrial
                      ? "Pendaftaran uji coba telah diproses. Gunakan halaman login untuk melanjutkan."
                      : "Status pembayaran tidak ditentukan dari tombol ini. Aktivasi sekolah dilakukan oleh backend setelah notifikasi pembayaran Midtrans berhasil divalidasi."}
                  </p>
                </div>
              </div>
            </section>

            <button
              type="button"
              onClick={() => router.push("/login")}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke halaman login
            </button>
          </div>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <CreditCard className="h-5 w-5" />
              </div>

              <h3 className="mt-4 text-base font-bold text-slate-900">
                Langkah Aktivasi
              </h3>

              <div className="mt-5 space-y-5">
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Verifikasi email
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Pendaftaran berhasil diverifikasi.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Pembayaran paket
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Selesaikan transaksi di halaman checkout Midtrans.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 text-[10px] font-bold text-slate-400">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      Konfirmasi pembayaran
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Backend memproses notifikasi pembayaran sebelum
                      mengaktifkan sekolah.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[#0D1B38] p-6 text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <ShieldCheck className="h-5 w-5 text-blue-300" />
              </div>

              <h3 className="mt-4 text-sm font-bold">
                Pembayaran Aman
              </h3>

              <p className="mt-2 text-xs leading-6 text-slate-300">
                Periksa Order ID dan nominal transaksi. Ikuti instruksi
                pembayaran yang ditampilkan langsung oleh Midtrans.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900">
                Butuh bantuan?
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Jika tautan checkout tidak tersedia atau transaksi mengalami
                kendala, hubungi tim SmartSchool melalui kontak resmi yang
                diberikan oleh pengelola sistem.
              </p>
            </div>
          </aside>
        </div>

        <footer className="mx-auto mt-10 max-w-6xl border-t border-slate-200 pt-6 text-center">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} SmartSchool. School Management System.
          </p>
        </footer>
      </section>
    </main>
  );
}