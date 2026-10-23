"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Loader2,
  Search,
  Receipt,
  RefreshCw,
  Wallet,
  WalletCards,
} from "lucide-react";

import { getRiwayatPembayaran } from "@/services/langganan.service";
import { formatRupiah, formatTanggal } from "@/lib/langganan";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]";

const themeTextHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

function invoiceStatus(status) {
  switch (status) {
    case "success":
      return { label: "Lunas", className: "theme-success", icon: CheckCircle2 };
    case "pending":
      return {
        label: "Belum Dibayar",
        className: "theme-warning",
        icon: Clock3,
      };
    case "failed":
      return { label: "Gagal", className: "theme-danger", icon: AlertCircle };
    default:
      return {
        label: "Tidak diketahui",
        className: "theme-card-soft theme-text-muted theme-border",
        icon: FileText,
      };
  }
}

function InvoiceStatus({ status }) {
  const info = invoiceStatus(status);
  const Icon = info.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap ${info.className}`}
    >
      <Icon size={12} />
      {info.label}
    </span>
  );
}

function StatCard({ title, value, description, icon: Icon, iconClass }) {
  return (
    <div className="theme-card rounded-xl border theme-border p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium theme-text-secondary tracking-wide">
            {title}
          </p>
          <p className="mt-1.5 text-xl sm:text-2xl font-bold theme-text truncate">
            {value}
          </p>
          <p className="mt-1 text-[10px] sm:text-xs theme-text-muted">
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

export default function InvoicePage() {
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
      setError(err?.message || "Gagal memuat daftar invoice.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredInvoices = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return data.filter((item) => {
      const namaPaket = item.langgananSekolah?.paket?.nama ?? "";

      const matchSearch =
        !keyword ||
        String(item.midtransInvoiceId ?? "")
          .toLowerCase()
          .includes(keyword) ||
        namaPaket.toLowerCase().includes(keyword);

      const matchStatus =
        statusFilter === "Semua" || item.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [data, search, statusFilter]);

  const lunas = data.filter((item) => item.status === "success");
  const belumDibayar = data.filter((item) => item.status === "pending");
  const gagal = data.filter((item) => item.status === "failed");

  const totalTagihan = data.reduce((sum, item) => sum + item.jumlah, 0);
  const totalLunas = lunas.reduce((sum, item) => sum + item.jumlah, 0);
  const totalBelum = belumDibayar.reduce((sum, item) => sum + item.jumlah, 0);

  const latestInvoice = data[0] ?? null;

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  return (
    <div className="flex h-screen w-full theme-page overflow-hidden">
      <Sidebar
        active="invoice"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header notifications={[]} />

        <main className="flex-1 overflow-y-auto theme-page">
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl ${themePrimarySoft} text-[var(--color-primary)] border ${themePrimarySoftBorder}`}
                >
                  <FileText size={20} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold theme-text">
                    Tagihan / Invoice
                  </h1>
                  <p className="text-sm theme-text-secondary">
                    Kelola tagihan dan invoice langganan sekolah Anda.
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
                  Memuat daftar invoice...
                </p>
              </div>
            )}

            {!loading && error && (
              <div className="theme-danger rounded-xl border p-5 flex items-start gap-3">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">
                    Gagal memuat invoice
                  </p>
                  <p className="text-xs mt-1 opacity-90">{error}</p>
                </div>
              </div>
            )}

            {!loading && !error && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <StatCard
                    title="Total Tagihan"
                    value={formatRupiah(totalTagihan)}
                    description={`${data.length} invoice`}
                    icon={FileText}
                  />

                  <StatCard
                    title="Sudah Lunas"
                    value={formatRupiah(totalLunas)}
                    description={`${lunas.length} invoice lunas`}
                    icon={CheckCircle2}
                    iconClass="text-[var(--color-success)]"
                  />

                  <StatCard
                    title="Belum Dibayar"
                    value={formatRupiah(totalBelum)}
                    description={`${belumDibayar.length} invoice`}
                    icon={Clock3}
                    iconClass="text-[var(--color-warning)]"
                  />

                  <StatCard
                    title="Gagal"
                    value={gagal.length}
                    description="Transaksi gagal"
                    icon={AlertCircle}
                    iconClass="text-[var(--color-danger)]"
                  />
                </div>

                {latestInvoice && (
                  <section className="theme-card rounded-xl border theme-border shadow-sm overflow-hidden">
                    <div className="p-5 sm:p-6">
                      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-12 h-12 rounded-xl ${themePrimarySoft} flex items-center justify-center shrink-0`}
                          >
                            <Receipt
                              size={21}
                              className="text-[var(--color-primary)]"
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-xs font-semibold uppercase tracking-wide theme-text-muted">
                                Invoice Terbaru
                              </p>
                              <InvoiceStatus status={latestInvoice.status} />
                            </div>

                            <h2 className="text-xl font-bold theme-text mt-1 break-all">
                              {latestInvoice.midtransInvoiceId ?? "-"}
                            </h2>

                            <p className="text-sm theme-text-secondary mt-1">
                              Paket{" "}
                              {latestInvoice.langgananSekolah?.paket?.nama ??
                                "-"}{" "}
                              · Diterbitkan{" "}
                              {formatTanggal(latestInvoice.dibuatPada)}
                            </p>
                          </div>
                        </div>

                        <div className="xl:text-right">
                          <p className="text-xs theme-text-muted">
                            Total Tagihan
                          </p>
                          <p className="text-2xl font-bold theme-text mt-1">
                            {formatRupiah(latestInvoice.jumlah)}
                          </p>
                        </div>
                      </div>

                      {latestInvoice.status === "pending" && (
                        <div
                          className={`mt-6 p-4 rounded-xl ${themePrimarySoft} border ${themePrimarySoftBorder}`}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-9 h-9 rounded-lg ${themePrimarySoft} flex items-center justify-center shrink-0`}
                              >
                                <AlertCircle
                                  size={17}
                                  className="text-[var(--color-primary)]"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-semibold theme-text">
                                  Tagihan belum dibayar
                                </p>
                                <p className="text-xs theme-text-secondary mt-1">
                                  Lanjutkan pembayaran untuk mengaktifkan
                                  langganan sekolah.
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                router.push(
                                  `/admin/langganan/pembayaran/${latestInvoice.midtransInvoiceId}`
                                )
                              }
                              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:opacity-90 transition`}
                            >
                              <Wallet size={15} />
                              Bayar Sekarang
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                <section className="theme-card rounded-xl border theme-border shadow-sm p-4">
                  <div className="flex flex-col lg:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                      />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari nomor invoice atau paket..."
                        className="theme-input w-full pl-9 pr-3 py-2.5 text-sm rounded-lg focus:outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]"
                      />
                    </div>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="theme-input text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]"
                    >
                      <option value="Semua">Semua Status</option>
                      <option value="success">Lunas</option>
                      <option value="pending">Belum Dibayar</option>
                      <option value="failed">Gagal</option>
                    </select>
                  </div>
                </section>

                <section className="theme-card rounded-xl border theme-border shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[950px] text-sm border-collapse">
                      <thead>
                        <tr className="theme-header">
                          <th className="text-center font-semibold px-4 py-3 w-[60px]">
                            No
                          </th>
                          <th className="text-left font-semibold px-4 py-3">
                            Invoice
                          </th>
                          <th className="text-left font-semibold px-4 py-3">
                            Periode Aktif
                          </th>
                          <th className="text-left font-semibold px-4 py-3">
                            Diterbitkan
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
                        {filteredInvoices.map((item, index) => (
                          <tr
                            key={item.id}
                            className="border-b theme-border-soft last:border-0 transition-colors hover:bg-[color-mix(in_srgb,var(--color-primary)_5%,transparent)]"
                          >
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`inline-flex items-center justify-center w-7 h-7 rounded-lg ${themePrimarySoft} text-[var(--color-primary)] border ${themePrimarySoftBorder} text-xs font-bold`}
                              >
                                {index + 1}
                              </span>
                            </td>

                            <td className="px-4 py-3">
                              <p className="font-semibold theme-text break-all">
                                {item.midtransInvoiceId ?? "-"}
                              </p>
                              <p className="text-[11px] theme-text-muted mt-1">
                                Paket{" "}
                                {item.langgananSekolah?.paket?.nama ?? "-"}
                              </p>
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <CalendarDays
                                  size={14}
                                  className="text-[var(--color-primary)]"
                                />
                                <span className="text-xs font-medium theme-text-secondary">
                                  {formatTanggal(
                                    item.langgananSekolah?.tanggalMulai
                                  )}{" "}
                                  -{" "}
                                  {formatTanggal(
                                    item.langgananSekolah?.tanggalBerakhir
                                  )}
                                </span>
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <span className="text-xs theme-text-secondary">
                                {formatTanggal(item.dibuatPada)}
                              </span>
                            </td>

                            <td className="px-4 py-3 text-right">
                              <span className="text-sm font-bold theme-text">
                                {formatRupiah(item.jumlah)}
                              </span>
                            </td>

                            <td className="px-4 py-3 text-center">
                              <InvoiceStatus status={item.status} />
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    router.push(
                                      `/admin/langganan/invoice/${item.id}`
                                    )
                                  }
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[var(--color-primary)] ${themePrimarySoft} border ${themePrimarySoftBorder} hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] text-xs font-medium transition-colors`}
                                >
                                  <Eye size={13} />
                                  Detail
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}

                        {filteredInvoices.length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-4 py-14 text-center">
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
                                  Invoice tidak ditemukan
                                </p>
                                <p className="text-xs theme-text-muted mt-1">
                                  Coba ubah pencarian atau filter.
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-4 py-3 border-t theme-border-soft theme-card-soft flex items-center justify-between gap-3">
                    <p className="text-xs theme-text-secondary">
                      Menampilkan{" "}
                      <span className="font-semibold theme-text">
                        {filteredInvoices.length}
                      </span>{" "}
                      dari{" "}
                      <span className="font-semibold theme-text">
                        {data.length}
                      </span>{" "}
                      invoice
                    </p>

                    <div className="flex items-center gap-2">
                      <WalletCards size={14} className="theme-text-muted" />
                      <span className="text-[11px] theme-text-muted">
                        Total {formatRupiah(totalTagihan)}
                      </span>
                    </div>
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
