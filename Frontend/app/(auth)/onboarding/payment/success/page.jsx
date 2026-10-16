"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Download,
  ArrowLeft,
  ShieldCheck,
  Copy,
  CheckCheck,
  ReceiptText,
  Hash,
  CreditCard,
  CalendarDays,
  Building2,
  Wallet,
  GraduationCap,
  Sun,
  Moon,
  UserRound,
  LoaderCircle,
} from "lucide-react";

const PaymentSuccessPage = () => {
  const router = useRouter();

  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Data simulasi: ganti dengan data transaksi dari API/backend.
  const payment = {
    status: "success",
    orderId: "INV-2026-1014-001",
    method: "BCA Virtual Account",
    vaNumber: "8808 0812 3456 7890",
    date: "14 Oktober 2026 · 10:30 WIB",
    merchant: "SmartSchool Education",
    subtotal: 1250000,
    adminFee: 2500,
    total: 1252500,
    currency: "IDR",
  };

  const formatRupiah = (amount) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(payment.vaNumber);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Salin nomor Virtual Account berikut:", payment.vaNumber);
    }
  };

  const handleDownload = () => {
    if (downloading) return;

    setDownloading(true);

    try {
      const receiptHTML = `
        <!DOCTYPE html>
        <html lang="id">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Bukti Pembayaran ${payment.orderId}</title>
          <style>
            * { box-sizing: border-box; }
            body {
              font-family: Arial, sans-serif;
              color: #0f172a;
              max-width: 700px;
              margin: 40px auto;
              padding: 24px;
              line-height: 1.6;
            }
            .brand {
              font-size: 23px;
              font-weight: 700;
              color: #1d4ed8;
            }
            .success {
              margin-top: 32px;
              padding: 20px;
              background: #f0fdf4;
              border: 1px solid #bbf7d0;
              border-radius: 12px;
            }
            .amount {
              font-size: 32px;
              font-weight: 700;
              margin-top: 8px;
            }
            h2 { font-size: 18px; margin-top: 28px; }
            .row {
              display: flex;
              justify-content: space-between;
              gap: 20px;
              padding: 12px 0;
              border-bottom: 1px solid #e2e8f0;
            }
            .row span:first-child { color: #64748b; }
            .row span:last-child {
              text-align: right;
              overflow-wrap: anywhere;
            }
            .total {
              font-weight: 700;
              font-size: 18px;
              color: #1d4ed8;
            }
            .footer {
              margin-top: 30px;
              color: #64748b;
              font-size: 12px;
              text-align: center;
            }
            @media print {
              body { margin: 0 auto; padding: 15px; }
            }
          </style>
        </head>
        <body>
          <div class="brand">SmartSchool</div>
          <p>All-in-One School Management</p>

          <div class="success">
            <strong>Pembayaran Berhasil</strong>
            <div>Transaksi Anda telah dikonfirmasi.</div>
            <div class="amount">${formatRupiah(payment.total)}</div>
            <div>Total pembayaran</div>
          </div>

          <h2>Detail Transaksi</h2>
          <div class="row"><span>Order ID</span><span>${payment.orderId}</span></div>
          <div class="row"><span>Metode Pembayaran</span><span>${payment.method}</span></div>
          <div class="row"><span>Nomor Virtual Account</span><span>${payment.vaNumber}</span></div>
          <div class="row"><span>Tanggal</span><span>${payment.date}</span></div>
          <div class="row"><span>Merchant</span><span>${payment.merchant}</span></div>

          <h2>Rincian Pembayaran</h2>
          <div class="row"><span>Subtotal</span><span>${formatRupiah(payment.subtotal)}</span></div>
          <div class="row"><span>Biaya Admin</span><span>${formatRupiah(payment.adminFee)}</span></div>
          <div class="row total"><span>Total</span><span>${formatRupiah(payment.total)}</span></div>

          <div class="footer">
            Bukti transaksi ini dibuat oleh SmartSchool.
            Status transaksi harus sesuai dengan konfirmasi backend.
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
        </html>
      `;

      const blob = new Blob([receiptHTML], {
        type: "text/html;charset=utf-8",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `Bukti-Pembayaran-${payment.orderId}.html`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error("Gagal mengunduh bukti pembayaran:", error);
      window.alert("Bukti pembayaran gagal diunduh. Silakan coba lagi.");
    } finally {
      setDownloading(false);
    }
  };

  const handleBack = () => {
    // Sesuaikan dengan rute dashboard atau halaman paket SmartSchool.
    router.push("/admin");
  };

  return (
    <div
      className={isDark ? "payment-root payment-dark" : "payment-root"}
      style={{
        minHeight: "100vh",
        background: "var(--payment-bg)",
        color: "var(--payment-text)",
        transition: "background .25s ease, color .25s ease",
      }}
    >
      <style jsx global>{`
        .payment-root {
          --payment-bg: #f3f7ff;
          --payment-card: #ffffff;
          --payment-text: #102447;
          --payment-muted: #647da5;
          --payment-border: #dce6f5;
          --payment-soft: #f4f8ff;
          --payment-blue: #2163ed;
          --payment-blue-hover: #174fca;
          --payment-green: #16a34a;
          font-family: Arial, Helvetica, sans-serif;
        }

        .payment-root * {
          box-sizing: border-box;
        }

        .payment-dark {
          --payment-bg: #0b1220;
          --payment-card: #111c30;
          --payment-text: #edf4ff;
          --payment-muted: #9eb0cc;
          --payment-border: #293953;
          --payment-soft: #17253c;
          --payment-blue: #3978ff;
          --payment-blue-hover: #2865e8;
        }

        .payment-header {
          min-height: 76px;
          background: var(--payment-card);
          border-bottom: 1px solid var(--payment-border);
        }

        .payment-panel {
          background: var(--payment-card);
          border: 1px solid rgba(211, 225, 245, 0.8);
          border-radius: 24px;
          box-shadow: 0 18px 60px rgba(38, 76, 139, 0.09);
        }

        .payment-dark .payment-panel {
          border-color: var(--payment-border);
          box-shadow: 0 18px 60px rgba(0, 0, 0, 0.15);
        }

        .payment-detail-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr);
          align-items: center;
          gap: 16px;
          padding: 14px 0;
          border-bottom: 1px solid var(--payment-border);
        }

        .payment-detail-row:last-child {
          border-bottom: 0;
          padding-bottom: 0;
        }

        .payment-detail-value {
          overflow-wrap: anywhere;
          text-align: right;
          color: var(--payment-text);
          font-size: 14px;
          font-weight: 500;
        }

        .payment-button {
          min-height: 48px;
          border-radius: 10px;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          gap: 9px;
          padding: 12px 18px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background .2s ease, border-color .2s ease,
            transform .2s ease;
        }

        .payment-button:active {
          transform: scale(0.99);
        }

        .payment-button:disabled {
          cursor: wait;
          opacity: 0.7;
        }

        .payment-primary {
          background: var(--payment-blue);
          color: white;
          border: 1px solid var(--payment-blue);
        }

        .payment-primary:hover {
          background: var(--payment-blue-hover);
        }

        .payment-secondary {
          background: var(--payment-card);
          color: var(--payment-blue);
          border: 1px solid #8eb1ff;
        }

        .payment-secondary:hover {
          background: var(--payment-soft);
        }

        .payment-copy {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          flex-shrink: 0;
          border: 1px solid var(--payment-border);
          border-radius: 8px;
          background: var(--payment-card);
          color: var(--payment-blue);
          cursor: pointer;
        }

        .payment-copy:hover {
          background: var(--payment-soft);
        }

        .payment-dark .payment-success-total {
          background: #123126;
          border-color: #24533d;
        }

        @media (max-width: 520px) {
          .payment-header {
            min-height: 66px;
          }

          .payment-panel {
            border-radius: 18px;
          }

          .payment-detail-row {
            grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
            gap: 10px;
            padding: 13px 0;
          }

          .payment-detail-value {
            font-size: 12px;
          }

          .payment-button {
            width: 100%;
          }
        }
      `}</style>

      {/* Header */}
      <header className="payment-header">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={{ background: "#e8f0ff", color: "#2163ed" }}
            >
              <GraduationCap size={29} strokeWidth={2.3} />
            </div>

            <div className="min-w-0">
              <h2
                className="text-lg font-bold tracking-tight sm:text-xl"
                style={{ color: "var(--payment-text)" }}
              >
                SmartSchool
              </h2>
              <p
                className="hidden text-xs sm:block"
                style={{ color: "var(--payment-muted)" }}
              >
                All-in-One School Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setIsDark((value) => !value)}
              aria-label={isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
              title={isDark ? "Mode terang" : "Mode gelap"}
              className="flex h-10 w-10 items-center justify-center rounded-xl border"
              style={{
                borderColor: "var(--payment-border)",
                color: "var(--payment-muted)",
                background: "var(--payment-card)",
              }}
            >
              {isDark ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            <div
              className="hidden h-9 w-px sm:block"
              style={{ background: "var(--payment-border)" }}
            />

            <div
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ background: "var(--payment-soft)", color: "var(--payment-blue)" }}
            >
              <UserRound size={20} />
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative overflow-hidden px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
        {/* Decorative background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full"
          style={{ background: "rgba(67, 130, 255, 0.08)" }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -left-36 h-96 w-96 rounded-full"
          style={{ background: "rgba(67, 130, 255, 0.07)" }}
        />

        <div className="relative mx-auto max-w-3xl">
          <section className="payment-panel overflow-hidden">
            {/* Success header */}
            <div className="px-5 pb-7 pt-8 text-center sm:px-10 sm:pb-8 sm:pt-10">
              <div
                className="mx-auto mb-5 flex h-[76px] w-[76px] items-center justify-center rounded-full"
                style={{
                  background: "#e6f8ed",
                  boxShadow: "0 0 0 9px rgba(34,197,94,0.08)",
                  color: "#16a34a",
                }}
              >
                <div className="flex h-[54px] w-[54px] items-center justify-center rounded-full bg-green-600 text-white">
                  <Check size={32} strokeWidth={3.2} />
                </div>
              </div>

              <span
                className="mb-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold"
                style={{ background: "#dcfce7", color: "#15803d" }}
              >
                <Check size={14} strokeWidth={3} />
                Pembayaran Berhasil
              </span>

              <h1
                className="text-2xl font-bold tracking-tight sm:text-3xl"
                style={{ color: "var(--payment-text)" }}
              >
                Transaksi Anda Berhasil!
              </h1>

              <p
                className="mx-auto mt-2 max-w-md text-sm leading-6 sm:text-base"
                style={{ color: "var(--payment-muted)" }}
              >
                Terima kasih telah melakukan pembayaran.
                Detail transaksi Anda telah kami simpan.
              </p>

              {/* Total */}
              <div
                className="payment-success-total mt-7 rounded-2xl border px-5 py-5 sm:px-7 sm:py-6"
                style={{
                  background: "#f0f6ff",
                  borderColor: "#dce8ff",
                }}
              >
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--payment-muted)" }}
                >
                  Total Pembayaran
                </p>
                <p
                  className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl"
                  style={{ color: "var(--payment-text)" }}
                >
                  {formatRupiah(payment.total)}
                </p>
              </div>
            </div>

            {/* Transaction details */}
            <div className="px-5 pb-6 sm:px-8">
              <div
                className="rounded-2xl border p-4 sm:p-6"
                style={{ borderColor: "var(--payment-border)" }}
              >
                <div className="mb-2 flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{ background: "#e8f0ff", color: "#2163ed" }}
                  >
                    <ReceiptText size={20} />
                  </div>
                  <h2
                    className="text-base font-bold sm:text-lg"
                    style={{ color: "var(--payment-text)" }}
                  >
                    Detail Transaksi
                  </h2>
                </div>

                <dl>
                  <DetailRow
                    icon={<Hash size={17} />}
                    label="Order ID"
                    value={payment.orderId}
                    mono
                  />

                  <DetailRow
                    icon={<CreditCard size={17} />}
                    label="Metode Pembayaran"
                    value={payment.method}
                  />

                  <DetailRow
                    icon={<Wallet size={17} />}
                    label="No. Virtual Account"
                    value={payment.vaNumber}
                    mono
                    copyable
                    copied={copied}
                    onCopy={handleCopy}
                  />

                  <DetailRow
                    icon={<CalendarDays size={17} />}
                    label="Tanggal & Waktu"
                    value={payment.date}
                  />

                  <DetailRow
                    icon={<Building2 size={17} />}
                    label="Merchant"
                    value={payment.merchant}
                  />
                </dl>
              </div>
            </div>

            {/* Payment breakdown */}
            <div className="px-5 pb-6 sm:px-8">
              <div
                className="rounded-2xl border p-4 sm:p-6"
                style={{
                  borderColor: "var(--payment-border)",
                  background: "var(--payment-soft)",
                }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{ background: "#e1ecff", color: "#2163ed" }}
                  >
                    <Wallet size={19} />
                  </div>
                  <h2
                    className="text-base font-bold sm:text-lg"
                    style={{ color: "var(--payment-text)" }}
                  >
                    Rincian Pembayaran
                  </h2>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span style={{ color: "var(--payment-muted)" }}>
                      Subtotal
                    </span>
                    <span style={{ color: "var(--payment-text)" }}>
                      {formatRupiah(payment.subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span style={{ color: "var(--payment-muted)" }}>
                      Biaya Admin
                    </span>
                    <span style={{ color: "var(--payment-text)" }}>
                      {formatRupiah(payment.adminFee)}
                    </span>
                  </div>

                  <div
                    className="flex items-center justify-between gap-4 border-t pt-4"
                    style={{ borderColor: "var(--payment-border)" }}
                  >
                    <span
                      className="font-bold"
                      style={{ color: "var(--payment-text)" }}
                    >
                      Total
                    </span>
                    <span
                      className="text-lg font-bold sm:text-xl"
                      style={{ color: "var(--payment-blue)" }}
                    >
                      {formatRupiah(payment.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 pb-7 sm:px-8 sm:pb-8">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="payment-button payment-secondary order-2 sm:order-1"
                >
                  <ArrowLeft size={18} />
                  Kembali ke Dashboard
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="payment-button payment-primary order-1 sm:order-2"
                >
                  {downloading ? (
                    <LoaderCircle size={18} className="animate-spin" />
                  ) : (
                    <Download size={18} />
                  )}
                  {downloading
                    ? "Menyiapkan bukti..."
                    : "Unduh Bukti Pembayaran"}
                </button>
              </div>

              {/* Security note */}
              <div className="mt-7 flex items-center justify-center gap-2 text-center">
                <ShieldCheck
                  size={18}
                  className="shrink-0"
                  style={{ color: "var(--payment-muted)" }}
                />
                <p
                  className="text-xs leading-5 sm:text-sm"
                  style={{ color: "var(--payment-muted)" }}
                >
                  Pembayaran Anda diamankan oleh{" "}
                  <span className="font-semibold" style={{ color: "var(--payment-blue)" }}>
                    Midtrans
                  </span>
                </p>
              </div>
            </div>
          </section>

          {/* Receipt note */}
          <p
            className="mt-5 flex items-center justify-center gap-2 px-2 text-center text-xs leading-5 sm:text-sm"
            style={{ color: "var(--payment-muted)" }}
          >
            <ReceiptText size={16} className="shrink-0" />
            Bukti pembayaran juga dikirim ke email Anda.
          </p>
        </div>
      </main>
    </div>
  );
};

/* =====================================================
   DETAIL ROW
===================================================== */

const DetailRow = ({
  icon,
  label,
  value,
  mono = false,
  copyable = false,
  copied = false,
  onCopy,
}) => (
  <div className="payment-detail-row">
    <dt
      className="flex min-w-0 items-center gap-2 text-sm"
      style={{ color: "var(--payment-muted)" }}
    >
      <span className="hidden shrink-0 sm:inline-flex">{icon}</span>
      <span>{label}</span>
    </dt>

    <dd className="flex min-w-0 items-center justify-end gap-2">
      <span
        className={`payment-detail-value ${
          mono ? "font-mono tracking-tight" : ""
        }`}
      >
        {value}
      </span>

      {copyable && (
        <button
          type="button"
          onClick={onCopy}
          className="payment-copy"
          title={copied ? "Berhasil disalin" : "Salin nomor Virtual Account"}
          aria-label={copied ? "Berhasil disalin" : "Salin nomor Virtual Account"}
        >
          {copied ? <CheckCheck size={15} /> : <Copy size={15} />}
        </button>
      )}
    </dd>
  </div>
);

export default PaymentSuccessPage;