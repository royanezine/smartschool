"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  Loader2,
  Search,
  CreditCard,
  Wallet,
  Receipt,
  TrendingUp,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import { getRiwayatPembayaran } from "@/services/langganan.service";
import {
  formatRupiah,
  formatTanggal,
  statusPembayaranInfo,
} from "@/lib/langganan";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]";

const themePrimaryHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";

const themeTextHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themePrimaryShadow =
  "shadow-[0_10px_25px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]";

function StatCard({ title, value, description, icon: Icon, iconClass }) {
  return (
    <div className="theme-card theme-border rounded-xl border p-4 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium theme-text-muted tracking-wide">
            {title}
          </p>
          <p className="mt-1.5 text-xl sm:text-2xl font-bold theme-text truncate">
            {value}
          </p>
          <p className="mt-1 text-[10px] sm:text-xs theme-text-placeholder">
            {description}
          </p>
        </div>

        <div
          className={`w-9 h-9 rounded-lg ${themePrimarySoft} flex items-center justify-center shrink-0`}
        >
          <Icon size={17} className={iconClass} />
        </div>
      </div>
    </div>
  );
}

function PaymentStatus({ status }) {
  const info = statusPembayaranInfo(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap ${info.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${info.dot}`} />
      {info.label}
    </span>
  );
}

export default function RiwayatPembayaranPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getRiwayatPembayaran();
      setData(result);
    } catch (err) {
      setError(err?.message || "Gagal memuat riwayat pembayaran.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredPayments = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return data.filter((item) => {
      const namaPaket = item.langgananSekolah?.paket?.nama ?? "";

      const matchSearch =
        !keyword ||
        String(item.midtransInvoiceId ?? "")
          .toLowerCase()
          .includes(keyword) ||
        String(item.midtransPaymentId ?? "")
          .toLowerCase()
          .includes(keyword) ||
        namaPaket.toLowerCase().includes(keyword);

      const matchStatus =
        statusFilter === "Semua" || item.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [data, search, statusFilter]);

  const successPayments = data.filter((item) => item.status === "success");
  const pendingPayments = data.filter((item) => item.status === "pending");
  const failedPayments = data.filter((item) => item.status === "failed");

  const successAmount = successPayments.reduce(
    (sum, item) => sum + item.jumlah,
    0
  );
  const totalAmount = data.reduce((sum, item) => sum + item.jumlah, 0);

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  return (
    <div className="flex h-screen w-full theme-page overflow-hidden">
      <Sidebar
        active="riwayatPembayaran"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header notifications={[]} />

        <main className="flex-1 overflow-y-auto theme-page">
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* PAGE HEADER */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl ${themePrimarySoft} ${themePrimarySoftBorder} border text-[var(--color-primary)] ${themePrimaryShadow}`}
                >
                  <Receipt size={20} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold theme-text">
                    Riwayat Pembayaran
                  </h1>
                  <p className="text-sm theme-text-secondary">
                    Daftar pembayaran langganan yang dilakukan sekolah Anda.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={loadData}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border theme-border theme-card theme-text-secondary text-sm font-semibold ${themeTextHover} transition-colors`}
              >
                <RefreshCw size={15} />
                Refresh
              </button>
            </div>

            {loading && (
              <div className="theme-card theme-border rounded-xl border p-14 flex flex-col items-center gap-3">
                <Loader2
                  size={26}
                  className="animate-spin text-[var(--color-primary)]"
                />
                <p className="text-sm theme-text-secondary">
                  Memuat riwayat pembayaran...
                </p>
              </div>
            )}

            {!loading && error && (
              <div className="theme-danger rounded-xl border p-5 flex items-start gap-3">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">
                    Gagal memuat riwayat pembayaran
                  </p>
                  <p className="text-xs mt-1 opacity-90">{error}</p>
                </div>
              </div>
            )}

            {!loading && !error && (
              <>
                {/* SUMMARY */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <StatCard
                    title="Total Pembayaran"
                    value={formatRupiah(successAmount)}
                    description="Pembayaran berhasil"
                    icon={Wallet}
                  />

                  <StatCard
                    title="Transaksi Berhasil"
                    value={successPayments.length}
                    description="Pembayaran selesai"
                    icon={CheckCircle2}
                    iconClass="text-[var(--color-success)]"
                  />

                  <StatCard
                    title="Menunggu"
                    value={pendingPayments.length}
                    description="Menunggu pembayaran"
                    icon={Clock3}
                    iconClass="text-[var(--color-warning)]"
                  />

                  <StatCard
                    title="Total Transaksi"
                    value={data.length}
                    description={`Nilai ${formatRupiah(totalAmount)}`}
                    icon={CreditCard}
                  />
                </div>

                {/* INFO */}
                <section className="theme-card theme-border rounded-xl border shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)] p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl ${themePrimarySoft} flex items-center justify-center shrink-0`}
                      >
                        <TrendingUp
                          size={18}
                          className="text-[var(--color-primary)]"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold theme-text">
                          Riwayat pembayaran sekolah
                        </p>
                        <p className="text-xs theme-text-secondary mt-1">
                          Sekolah memiliki{" "}
                          <span className="font-semibold theme-text">
                            {successPayments.length} pembayaran berhasil
                          </span>{" "}
                          dengan total{" "}
                          <span className="font-semibold text-[var(--color-primary)]">
                            {formatRupiah(successAmount)}
                          </span>
                          .
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
                      <span className="text-xs font-medium theme-text-muted">
                        Terverifikasi sistem
                      </span>
                    </div>
                  </div>
                </section>

                {/* FILTER */}
                <section className="theme-card theme-border rounded-xl border shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)] p-4">
                  <div className="flex flex-col lg:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-placeholder"
                      />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari order ID, payment ID, atau paket..."
                        className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg theme-input border theme-border theme-text focus:outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]"
                      />
                    </div>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="text-sm rounded-lg theme-input border theme-border px-3 py-2.5 theme-text focus:outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]"
                    >
                      <option value="Semua">Semua Status</option>
                      <option value="success">Berhasil</option>
                      <option value="pending">Menunggu</option>
                      <option value="failed">Gagal</option>
                    </select>
                  </div>
                </section>

                {/* TABLE */}
                <section className="theme-card theme-border rounded-xl border shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px] text-sm border-collapse">
                      <thead>
                        <tr className="theme-header">
                          <th className="text-center font-semibold px-4 py-3 w-[60px]">
                            No
                          </th>
                          <th className="text-left font-semibold px-4 py-3">
                            Transaksi
                          </th>
                          <th className="text-left font-semibold px-4 py-3">
                            Paket
                          </th>
                          <th className="text-left font-semibold px-4 py-3">
                            Tanggal
                          </th>
                          <th className="text-left font-semibold px-4 py-3">
                            Metode
                          </th>
                          <th className="text-right font-semibold px-4 py-3">
                            Nominal
                          </th>
                          <th className="text-center font-semibold px-4 py-3">
                            Status
                          </th>
                          <th className="text-center font-semibold px-4 py-3">
                            Aksi
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredPayments.length > 0 ? (
                          filteredPayments.map((item, index) => (
                            <tr
                              key={item.id}
                              className={`border-b theme-border-soft last:border-0 transition-colors ${themePrimaryHover} ${
                                index % 2 === 0
                                  ? "theme-card-soft"
                                  : "theme-card"
                              }`}
                            >
                              <td className="px-4 py-3 text-center">
                                <span
                                  className={`inline-flex items-center justify-center w-7 h-7 rounded-lg ${themePrimarySoft} text-[var(--color-primary)] ${themePrimarySoftBorder} border text-xs font-bold`}
                                >
                                  {index + 1}
                                </span>
                              </td>

                              <td className="px-4 py-3">
                                <p className="font-semibold theme-text break-all">
                                  {item.midtransInvoiceId ?? "-"}
                                </p>
                                {item.midtransPaymentId && (
                                  <p className="text-[11px] theme-text-placeholder mt-1 break-all">
                                    {item.midtransPaymentId}
                                  </p>
                                )}
                              </td>

                              <td className="px-4 py-3">
                                <span className="text-sm font-medium theme-text-secondary">
                                  {item.langgananSekolah?.paket?.nama ?? "-"}
                                </span>
                                <p className="text-[11px] theme-text-placeholder mt-0.5">
                                  {item.langgananSekolah?.siklusPenagihan ===
                                  "annual"
                                    ? "Tahunan"
                                    : "Bulanan"}
                                </p>
                              </td>

                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <CalendarDays
                                    size={14}
                                    className="text-[var(--color-primary)]"
                                  />
                                  <span className="text-xs theme-text-secondary">
                                    {formatTanggal(item.dibuatPada)}
                                  </span>
                                </div>
                              </td>

                              <td className="px-4 py-3">
                                <span className="text-xs font-medium theme-text-secondary capitalize">
                                  {item.metode ?? "midtrans"}
                                </span>
                              </td>

                              <td className="px-4 py-3 text-right">
                                <span className="text-sm font-bold theme-text">
                                  {formatRupiah(item.jumlah)}
                                </span>
                              </td>

                              <td className="px-4 py-3 text-center">
                                <PaymentStatus status={item.status} />
                              </td>

                              <td className="px-4 py-3">
                                <div className="flex justify-center">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      router.push(
                                        `/admin/langganan/riwayat-pembayaran/${item.id}`
                                      )
                                    }
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[var(--color-primary)] ${themePrimarySoft} ${themePrimarySoftBorder} border ${themePrimaryHover} text-xs font-medium transition-colors`}
                                  >
                                    <Eye size={13} />
                                    Detail
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={8} className="px-4 py-14 text-center">
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-12 h-12 rounded-full ${themePrimarySoft} flex items-center justify-center`}
                                >
                                  <Search
                                    size={20}
                                    className="text-[var(--color-primary)]"
                                  />
                                </div>
                                <p className="text-sm font-semibold theme-text-secondary mt-3">
                                  Pembayaran tidak ditemukan
                                </p>
                                <p className="text-xs theme-text-placeholder mt-1">
                                  Coba ubah kata kunci atau filter.
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-4 py-3 theme-border-soft border-t theme-card-soft flex items-center justify-between gap-3">
                    <p className="text-xs theme-text-muted">
                      Menampilkan{" "}
                      <span className="font-semibold theme-text-secondary">
                        {filteredPayments.length}
                      </span>{" "}
                      dari{" "}
                      <span className="font-semibold theme-text-secondary">
                        {data.length}
                      </span>{" "}
                      transaksi
                    </p>

                    {failedPayments.length > 0 && (
                      <span className="text-[11px] theme-text-placeholder">
                        {failedPayments.length} transaksi gagal
                      </span>
                    )}
                  </div>
                </section>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
