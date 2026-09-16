"use client";

import { useEffect, useMemo, useState } from "react";

import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";

import {
  CreditCard,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock3,
  RefreshCw,
  AlertCircle,
  WalletCards,
  FileText,
  ShieldCheck,
} from "lucide-react";

import {
  getAllLangganan,
} from "../../../services/langganan.service";

// =========================================================
// FORMAT RUPIAH
// =========================================================

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

// =========================================================
// FORMAT DATE
// =========================================================

function formatDate(date) {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// =========================================================
// STATUS LANGGANAN
// =========================================================

function getSubscriptionStatus(item) {
  const status = String(
    item?.statusLangganan || ""
  ).toLowerCase();

  if (status === "active") {
    return "Aktif";
  }

  if (status === "trialing") {
    return "Aktif";
  }

  if (status === "expired") {
    return "Expired";
  }

  if (item?.tanggalBerakhir) {
    const endDate = new Date(
      item.tanggalBerakhir
    );

    if (
      !Number.isNaN(endDate.getTime()) &&
      endDate < new Date()
    ) {
      return "Expired";
    }
  }

  return "Akan Berakhir";
}

// =========================================================
// STATUS PEMBAYARAN
// =========================================================

function getPaymentStatus(status) {
  const normalized = String(
    status || ""
  ).toLowerCase();

  if (
    normalized === "paid" ||
    normalized === "berhasil" ||
    normalized === "success"
  ) {
    return "Lunas";
  }

  if (normalized === "pending") {
    return "Pending";
  }

  if (
    normalized === "failed" ||
    normalized === "gagal"
  ) {
    return "Gagal";
  }

  return status || "-";
}

// =========================================================
// STATUS BADGE
// =========================================================

function StatusBadge({ status }) {
  if (status === "Aktif") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
        <CheckCircle2 size={13} />
        Aktif
      </span>
    );
  }

  if (status === "Expired") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
        <XCircle size={13} />
        Expired
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
      <Clock3 size={13} />
      Akan Berakhir
    </span>
  );
}

// =========================================================
// PAYMENT BADGE
// =========================================================

function PaymentBadge({ status }) {
  if (status === "Lunas") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
        <CheckCircle2 size={13} />
        Lunas
      </span>
    );
  }

  if (status === "Pending") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
        <Clock3 size={13} />
        Pending
      </span>
    );
  }

  if (status === "Gagal") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
        <XCircle size={13} />
        Gagal
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
      {status || "-"}
    </span>
  );
}

// =========================================================
// STAT CARD
// =========================================================

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  iconClass,
  valueClass,
}) {
  return (
    <div className="min-w-[210px] flex-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </p>

          <p
            className={`mt-2 text-2xl font-bold ${
              valueClass || "text-slate-900"
            }`}
          >
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

// =========================================================
// MAIN PAGE
// =========================================================

export default function LanggananSekolahPage() {
  const [collapsed, setCollapsed] = useState(false);

  const [subscriptions, setSubscriptions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =======================================================
  // FETCH DATA SUPER ADMIN
  // =======================================================

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError("");

      console.log(
        "===================================="
      );

      console.log(
        "LOAD DATA LANGGANAN SUPER ADMIN"
      );

      console.log(
        "Endpoint:",
        "/api/v1/langganan/sekolah"
      );

      console.log(
        "===================================="
      );

      /*
       * KHUSUS SUPER ADMIN
       *
       * Jangan gunakan:
       * getPendingPayments()
       *
       * karena endpoint pending adalah untuk
       * admin sekolah.
       */

      const data =
        await getAllLangganan();

      console.log(
        "HASIL LANGGANAN:",
        data
      );

      const formattedData =
        Array.isArray(data)
          ? data.map((item) => {
              return {
                id:
                  item?.id || "",

                sekolah:
                  item?.sekolah?.nama ||
                  item?.namaSekolah ||
                  "-",

                kodeSekolah:
                  item?.sekolah?.kode ||
                  "-",

                paket:
                  item?.paket?.nama ||
                  item?.namaPaket ||
                  "-",

                harga: Number(
                  item?.hargaSaatBerlangganan ??
                    item?.harga ??
                    item?.paket?.harga ??
                    0
                ),

                mulai:
                  formatDate(
                    item?.tanggalMulai
                  ),

                berakhir:
                  formatDate(
                    item?.tanggalBerakhir
                  ),

                status:
                  getSubscriptionStatus(
                    item
                  ),

                pembayaran:
                  getPaymentStatus(
                    item?.statusPembayaran
                  ),

                raw: item,
              };
            })
          : [];

      setSubscriptions(
        formattedData
      );
    } catch (err) {
      console.error(
        "FETCH LANGGANAN ERROR:",
        err
      );

      setSubscriptions([]);

      setError(
        err?.message ||
          "Gagal mengambil data langganan sekolah."
      );
    } finally {
      setLoading(false);
    }
  };

  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // =======================================================
  // STATISTICS
  // =======================================================

  const statistics = useMemo(() => {
    const total =
      subscriptions.length;

    const active =
      subscriptions.filter(
        (item) =>
          item.status === "Aktif"
      ).length;

    const pending =
      subscriptions.filter(
        (item) =>
          item.pembayaran ===
          "Pending"
      ).length;

    const expired =
      subscriptions.filter(
        (item) =>
          item.status ===
          "Expired"
      ).length;

    const totalValue =
      subscriptions
        .filter(
          (item) =>
            item.pembayaran ===
            "Lunas"
        )
        .reduce(
          (sum, item) =>
            sum +
            Number(
              item.harga || 0
            ),
          0
        );

    return {
      total,
      active,
      pending,
      expired,
      totalValue,
    };
  }, [subscriptions]);

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="flex min-h-screen bg-[#f4f7fb] text-slate-900">

      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        role="super-admin"
      />

      {/* ===================================================
          MAIN
      =================================================== */}

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="min-h-screen w-full overflow-x-hidden px-4 py-5 sm:px-6 lg:px-8 xl:px-10">
          <div className="mx-auto w-full max-w-[1600px]">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex min-w-0 items-center gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-200">
                  <CreditCard size={23} />
                </div>

                <div className="min-w-0">

                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Data Langganan Sekolah
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Kelola dan pantau seluruh langganan sekolah
                  </p>

                </div>
              </div>

              <button
                type="button"
                onClick={fetchSubscriptions}
                disabled={loading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={17}
                  className={
                    loading
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh
              </button>
            </div>

            {/* =================================================
                INFO
            ================================================= */}

            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                <ShieldCheck
                  size={18}
                  className="text-blue-700"
                />
              </div>

              <div className="min-w-0">

                <p className="text-sm font-semibold text-blue-900">
                  Data Langganan Sekolah
                </p>

                <p className="mt-1 text-sm leading-relaxed text-blue-700">
                  Data pada halaman ini diambil langsung dari
                  backend SmartSchool menggunakan endpoint
                  khusus Super Admin.
                </p>

              </div>
            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100">
                  <AlertCircle
                    size={18}
                    className="text-red-600"
                  />
                </div>

                <div className="min-w-0">

                  <p className="text-sm font-semibold text-red-800">
                    Gagal mengambil data
                  </p>

                  <p className="mt-1 text-sm text-red-700">
                    {error}
                  </p>

                </div>
              </div>
            )}

            {/* =================================================
                STATISTICS
            ================================================= */}

            <section className="mb-6">
              <div className="flex flex-wrap gap-4">

                <StatCard
                  icon={CreditCard}
                  label="Total Data"
                  value={
                    loading
                      ? "..."
                      : statistics.total
                  }
                  description="Total langganan sekolah"
                  iconClass="bg-blue-50 text-blue-600"
                />

                <StatCard
                  icon={CheckCircle2}
                  label="Aktif"
                  value={
                    loading
                      ? "..."
                      : statistics.active
                  }
                  description="Langganan aktif"
                  iconClass="bg-emerald-50 text-emerald-600"
                  valueClass="text-emerald-600"
                />

                <StatCard
                  icon={Clock3}
                  label="Pending"
                  value={
                    loading
                      ? "..."
                      : statistics.pending
                  }
                  description="Pembayaran pending"
                  iconClass="bg-amber-50 text-amber-600"
                  valueClass="text-amber-600"
                />

                <StatCard
                  icon={XCircle}
                  label="Expired"
                  value={
                    loading
                      ? "..."
                      : statistics.expired
                  }
                  description="Langganan berakhir"
                  iconClass="bg-red-50 text-red-600"
                  valueClass="text-red-600"
                />

                <StatCard
                  icon={WalletCards}
                  label="Nilai Pembayaran"
                  value={
                    loading
                      ? "..."
                      : formatRupiah(
                          statistics.totalValue
                        )
                  }
                  description="Total pembayaran lunas"
                  iconClass="bg-indigo-50 text-indigo-600"
                  valueClass="text-xl text-indigo-600"
                />

              </div>
            </section>

            {/* =================================================
                TABLE CARD
            ================================================= */}

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

                <div>

                  <h2 className="text-base font-bold text-slate-900">
                    Seluruh Data Langganan
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Data seluruh sekolah yang terdaftar
                  </p>

                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <FileText size={15} />

                  GET /api/v1/langganan/sekolah
                </div>

              </div>

              {/* =================================================
                  TABLE
              ================================================= */}

              <div className="w-full overflow-x-auto">

                <table className="w-full min-w-[1100px] border-collapse">

                  <thead>
                    <tr className="bg-blue-600 text-left text-xs font-bold uppercase tracking-wider text-white">

                      <th className="w-[70px] px-5 py-4 text-center">
                        No.
                      </th>

                      <th className="min-w-[260px] px-5 py-4">
                        Sekolah
                      </th>

                      <th className="min-w-[180px] px-5 py-4">
                        Paket
                      </th>

                      <th className="min-w-[170px] px-5 py-4">
                        Harga
                      </th>

                      <th className="min-w-[200px] px-5 py-4">
                        Periode
                      </th>

                      <th className="min-w-[150px] px-5 py-4">
                        Pembayaran
                      </th>

                      <th className="min-w-[150px] px-5 py-4">
                        Status
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {/* =================================================
                        LOADING
                    ================================================= */}

                    {loading ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-5 py-16 text-center"
                        >
                          <div className="flex flex-col items-center">

                            <RefreshCw
                              size={28}
                              className="animate-spin text-blue-600"
                            />

                            <p className="mt-3 text-sm font-semibold text-slate-600">
                              Memuat data langganan...
                            </p>

                          </div>
                        </td>
                      </tr>
                    ) : error ? (

                      /* =================================================
                          ERROR
                      ================================================= */

                      <tr>
                        <td
                          colSpan={7}
                          className="px-5 py-16 text-center"
                        >

                          <div className="mx-auto flex max-w-sm flex-col items-center">

                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                              <AlertCircle size={25} />
                            </div>

                            <h3 className="mt-4 text-sm font-bold text-slate-700">
                              Gagal mengambil data
                            </h3>

                            <p className="mt-1 text-xs leading-5 text-slate-400">
                              {error}
                            </p>

                            <button
                              type="button"
                              onClick={fetchSubscriptions}
                              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                            >
                              Coba Lagi
                            </button>

                          </div>

                        </td>
                      </tr>

                    ) : subscriptions.length > 0 ? (

                      /* =================================================
                          DATA
                      ================================================= */

                      subscriptions.map(
                        (item, index) => (
                          <tr
                            key={
                              item.id ||
                              index
                            }
                            className="border-b border-slate-100 transition hover:bg-blue-50/40"
                          >

                            {/* NO */}

                            <td className="px-5 py-4 text-center">
                              <span className="text-sm font-semibold text-slate-500">
                                {index + 1}
                              </span>
                            </td>

                            {/* SEKOLAH */}

                            <td className="px-5 py-4">

                              <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                  <ShieldCheck size={18} />
                                </div>

                                <div className="min-w-0">

                                  <p className="truncate text-sm font-bold text-slate-800">
                                    {item.sekolah}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-400">
                                    {item.kodeSekolah}
                                  </p>

                                </div>

                              </div>

                            </td>

                            {/* PAKET */}

                            <td className="px-5 py-4">

                              <div className="flex items-center gap-3">

                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                  <CreditCard size={17} />
                                </div>

                                <span className="text-sm font-semibold text-slate-700">
                                  {item.paket}
                                </span>

                              </div>

                            </td>

                            {/* HARGA */}

                            <td className="px-5 py-4">

                              <div className="flex items-center gap-2">

                                <WalletCards
                                  size={16}
                                  className="text-blue-500"
                                />

                                <span className="text-sm font-bold text-slate-700">
                                  {formatRupiah(
                                    item.harga
                                  )}
                                </span>

                              </div>

                            </td>

                            {/* PERIODE */}

                            <td className="px-5 py-4">

                              <div className="flex items-start gap-2">

                                <CalendarDays
                                  size={16}
                                  className="mt-0.5 shrink-0 text-slate-400"
                                />

                                <div className="text-xs">

                                  <p className="font-semibold text-slate-700">
                                    {item.mulai}
                                  </p>

                                  <p className="mt-1 text-slate-400">
                                    s/d{" "}
                                    {item.berakhir}
                                  </p>

                                </div>

                              </div>

                            </td>

                            {/* PEMBAYARAN */}

                            <td className="px-5 py-4">
                              <PaymentBadge
                                status={
                                  item.pembayaran
                                }
                              />
                            </td>

                            {/* STATUS */}

                            <td className="px-5 py-4">
                              <StatusBadge
                                status={
                                  item.status
                                }
                              />
                            </td>

                          </tr>
                        )
                      )

                    ) : (

                      /* =================================================
                          EMPTY
                      ================================================= */

                      <tr>
                        <td
                          colSpan={7}
                          className="px-5 py-16 text-center"
                        >

                          <div className="mx-auto flex max-w-sm flex-col items-center">

                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                              <CreditCard size={25} />
                            </div>

                            <h3 className="mt-4 text-sm font-bold text-slate-700">
                              Belum ada data langganan
                            </h3>

                            <p className="mt-1 text-xs leading-5 text-slate-400">
                              Belum terdapat data langganan
                              sekolah dari backend.
                            </p>

                            <button
                              type="button"
                              onClick={
                                fetchSubscriptions
                              }
                              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                            >
                              <RefreshCw size={14} />

                              Refresh
                            </button>

                          </div>

                        </td>
                      </tr>

                    )}

                  </tbody>
                </table>
              </div>

              {/* =================================================
                  FOOTER
              ================================================= */}

              <div className="border-t border-slate-100 px-5 py-4 sm:px-6">

                <div className="flex items-start gap-2 text-xs text-slate-400">

                  <ShieldCheck
                    size={14}
                    className="mt-0.5 shrink-0"
                  />

                  <p>
                    Halaman ini menggunakan endpoint
                    khusus Super Admin:
                    <span className="ml-1 font-semibold text-slate-500">
                      GET /api/v1/langganan/sekolah
                    </span>
                  </p>

                </div>

              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}